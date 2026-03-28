package com.krystalblog.module.article.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.krystalblog.common.util.SecurityUtil;
import com.krystalblog.entity.Like;
import com.krystalblog.mapper.ArticleMapper;
import com.krystalblog.mapper.LikeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeMapper likeMapper;
    private final ArticleMapper articleMapper;
    private final SecurityUtil securityUtil;

    @Transactional
    public boolean likeArticle(Long articleId) {
        Long userId = securityUtil.getCurrentUserId();
        Like existing = likeMapper.selectOne(new LambdaQueryWrapper<Like>()
                .eq(Like::getUserId, userId).eq(Like::getArticleId, articleId));
        if (existing != null) return false;

        Like like = new Like();
        like.setUserId(userId);
        like.setArticleId(articleId);
        likeMapper.insert(like);
        articleMapper.updateLikesCount(articleId, 1);
        return true;
    }

    @Transactional
    public boolean unlikeArticle(Long articleId) {
        Long userId = securityUtil.getCurrentUserId();
        int deleted = likeMapper.delete(new LambdaQueryWrapper<Like>()
                .eq(Like::getUserId, userId).eq(Like::getArticleId, articleId));
        if (deleted > 0) {
            articleMapper.updateLikesCount(articleId, -1);
            return true;
        }
        return false;
    }
}
