package com.krystalblog.module.article.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.krystalblog.common.util.SecurityUtil;
import com.krystalblog.entity.Comment;
import com.krystalblog.entity.User;
import com.krystalblog.mapper.ArticleMapper;
import com.krystalblog.mapper.CommentMapper;
import com.krystalblog.mapper.UserMapper;
import com.krystalblog.module.article.dto.CommentDTO;
import com.krystalblog.module.article.vo.CommentVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentMapper commentMapper;
    private final UserMapper userMapper;
    private final ArticleMapper articleMapper;
    private final SecurityUtil securityUtil;

    public IPage<CommentVO> getArticleComments(Long articleId, int page, int size) {
        // Get top-level comments
        IPage<Comment> commentPage = commentMapper.selectPage(new Page<>(page, size),
                new LambdaQueryWrapper<Comment>()
                        .eq(Comment::getArticleId, articleId)
                        .isNull(Comment::getParentId)
                        .orderByDesc(Comment::getCreatedAt));

        // Get all replies for these comments
        List<Long> parentIds = commentPage.getRecords().stream().map(Comment::getId).toList();
        List<Comment> replies = parentIds.isEmpty() ? List.of() :
                commentMapper.selectList(new LambdaQueryWrapper<Comment>()
                        .in(Comment::getParentId, parentIds)
                        .orderByAsc(Comment::getCreatedAt));

        Map<Long, List<Comment>> replyMap = replies.stream()
                .collect(Collectors.groupingBy(Comment::getParentId));

        return commentPage.convert(c -> {
            CommentVO vo = toVO(c);
            vo.setReplies(replyMap.getOrDefault(c.getId(), new ArrayList<>())
                    .stream().map(this::toVO).toList());
            return vo;
        });
    }

    @Transactional
    public CommentVO createArticleComment(Long articleId, CommentDTO dto) {
        Comment comment = new Comment();
        comment.setContent(dto.getContent());
        comment.setArticleId(articleId);
        comment.setAuthorId(securityUtil.getCurrentUserId());
        comment.setParentId(dto.getParentId());
        commentMapper.insert(comment);
        articleMapper.updateCommentsCount(articleId, 1);
        return toVO(commentMapper.selectById(comment.getId()));
    }

    @Transactional
    public void deleteComment(Long commentId) {
        Comment comment = commentMapper.selectById(commentId);
        if (comment == null) return;
        // Delete replies first
        commentMapper.delete(new LambdaQueryWrapper<Comment>().eq(Comment::getParentId, commentId));
        commentMapper.deleteById(commentId);
        if (comment.getArticleId() != null) {
            articleMapper.updateCommentsCount(comment.getArticleId(), -1);
        }
    }

    private CommentVO toVO(Comment c) {
        User author = userMapper.selectById(c.getAuthorId());
        return CommentVO.builder()
                .id(c.getId())
                .content(c.getContent())
                .articleId(c.getArticleId())
                .videoId(c.getVideoId())
                .authorId(c.getAuthorId())
                .authorName(author != null ? author.getNickname() : null)
                .authorAvatar(author != null ? author.getAvatar() : null)
                .parentId(c.getParentId())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
