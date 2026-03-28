package com.krystalblog.module.article.service;

import cn.hutool.core.text.CharSequenceUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.krystalblog.common.exception.BusinessException;
import com.krystalblog.common.result.ResultCode;
import com.krystalblog.common.util.SecurityUtil;
import com.krystalblog.entity.*;
import com.krystalblog.mapper.*;
import com.krystalblog.module.article.dto.ArticleDTO;
import com.krystalblog.module.article.vo.ArticleVO;
import com.krystalblog.module.article.vo.TagVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleMapper articleMapper;
    private final CategoryMapper categoryMapper;
    private final TagMapper tagMapper;
    private final ArticleTagMapper articleTagMapper;
    private final UserMapper userMapper;
    private final SecurityUtil securityUtil;
    private final TagService tagService;

    public IPage<ArticleVO> listArticles(int page, int size, String status, Long categoryId, Long tagId, String keyword) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(status)) {
            wrapper.eq(Article::getStatus, status);
        } else {
            wrapper.eq(Article::getStatus, "PUBLISHED");
        }
        if (categoryId != null) wrapper.eq(Article::getCategoryId, categoryId);
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Article::getTitle, keyword).or().like(Article::getExcerpt, keyword));
        }
        wrapper.orderByDesc(Article::getPublishedAt);

        IPage<Article> articlePage = articleMapper.selectPage(new Page<>(page, size), wrapper);

        // If filtering by tag, we need post-filter (simple approach for now)
        if (tagId != null) {
            List<Long> articleIds = articleTagMapper.selectList(
                    new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getTagId, tagId))
                    .stream().map(ArticleTag::getArticleId).toList();
            if (articleIds.isEmpty()) {
                return new Page<ArticleVO>(page, size).setRecords(List.of()).setTotal(0);
            }
            wrapper.in(Article::getId, articleIds);
            articlePage = articleMapper.selectPage(new Page<>(page, size), wrapper);
        }

        return articlePage.convert(this::toVO);
    }

    public ArticleVO getArticleById(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null) throw new BusinessException(ResultCode.ARTICLE_NOT_FOUND);
        articleMapper.incrementViews(id);
        return toVO(article);
    }

    @Transactional
    public ArticleVO createArticle(ArticleDTO dto) {
        Article article = new Article();
        article.setTitle(dto.getTitle());
        article.setSlug(generateSlug(dto.getTitle()));
        article.setExcerpt(dto.getExcerpt());
        article.setContent(dto.getContent());
        article.setCoverImage(dto.getCoverImage());
        article.setCategoryId(dto.getCategoryId());
        article.setAuthorId(securityUtil.getCurrentUserId());
        article.setStatus(dto.getStatus() != null ? dto.getStatus() : "DRAFT");
        article.setViews(0L);
        article.setLikesCount(0L);
        article.setCommentsCount(0L);
        if ("PUBLISHED".equals(article.getStatus())) {
            article.setPublishedAt(dto.getPublishedAt() != null ? dto.getPublishedAt() : LocalDateTime.now());
        }
        articleMapper.insert(article);

        saveTags(article.getId(), dto.getTagIds());
        return toVO(articleMapper.selectById(article.getId()));
    }

    @Transactional
    public ArticleVO updateArticle(Long id, ArticleDTO dto) {
        Article article = articleMapper.selectById(id);
        if (article == null) throw new BusinessException(ResultCode.ARTICLE_NOT_FOUND);

        if (dto.getTitle() != null) article.setTitle(dto.getTitle());
        if (dto.getExcerpt() != null) article.setExcerpt(dto.getExcerpt());
        if (dto.getContent() != null) article.setContent(dto.getContent());
        if (dto.getCoverImage() != null) article.setCoverImage(dto.getCoverImage());
        if (dto.getCategoryId() != null) article.setCategoryId(dto.getCategoryId());
        if (dto.getStatus() != null) {
            if ("PUBLISHED".equals(dto.getStatus()) && !"PUBLISHED".equals(article.getStatus())) {
                article.setPublishedAt(dto.getPublishedAt() != null ? dto.getPublishedAt() : LocalDateTime.now());
            }
            article.setStatus(dto.getStatus());
        }
        articleMapper.updateById(article);

        if (dto.getTagIds() != null) {
            articleTagMapper.deleteByArticleId(id);
            saveTags(id, dto.getTagIds());
        }
        return toVO(articleMapper.selectById(id));
    }

    @Transactional
    public void deleteArticle(Long id) {
        if (articleMapper.selectById(id) == null) throw new BusinessException(ResultCode.ARTICLE_NOT_FOUND);
        articleTagMapper.deleteByArticleId(id);
        articleMapper.deleteById(id);
    }

    public List<Map<String, Object>> getArchives() {
        List<Article> articles = articleMapper.selectList(
                new LambdaQueryWrapper<Article>()
                        .eq(Article::getStatus, "PUBLISHED")
                        .orderByDesc(Article::getPublishedAt)
                        .select(Article::getId, Article::getTitle, Article::getPublishedAt));

        Map<String, List<Map<String, Object>>> grouped = new LinkedHashMap<>();
        for (Article a : articles) {
            if (a.getPublishedAt() == null) continue;
            String key = a.getPublishedAt().getYear() + "-" +
                    String.format("%02d", a.getPublishedAt().getMonthValue());
            grouped.computeIfAbsent(key, k -> new ArrayList<>())
                    .add(Map.of("id", a.getId(), "title", a.getTitle(), "date", a.getPublishedAt().toString()));
        }

        return grouped.entrySet().stream()
                .map(e -> Map.<String, Object>of("archive", e.getKey(), "articles", e.getValue()))
                .toList();
    }

    private void saveTags(Long articleId, List<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) return;
        for (Long tagId : tagIds) {
            ArticleTag at = new ArticleTag();
            at.setArticleId(articleId);
            at.setTagId(tagId);
            articleTagMapper.insert(at);
        }
    }

    private String generateSlug(String title) {
        String slug = CharSequenceUtil.toUnderlineCase(title).replace(" ", "-").toLowerCase();
        slug = slug.replaceAll("[^a-z0-9\\u4e00-\\u9fa5-]", "");
        if (slug.isEmpty()) slug = "article";
        // Ensure uniqueness
        String baseSlug = slug;
        int count = 0;
        while (articleMapper.selectCount(new LambdaQueryWrapper<Article>().eq(Article::getSlug, slug)) > 0) {
            count++;
            slug = baseSlug + "-" + count;
        }
        return slug;
    }

    public ArticleVO toVO(Article a) {
        List<Tag> tags = tagMapper.selectByArticleId(a.getId());
        Category category = categoryMapper.selectById(a.getCategoryId());
        User author = userMapper.selectById(a.getAuthorId());

        return ArticleVO.builder()
                .id(a.getId())
                .title(a.getTitle())
                .slug(a.getSlug())
                .excerpt(a.getExcerpt())
                .content(a.getContent())
                .coverImage(a.getCoverImage())
                .categoryId(a.getCategoryId())
                .categoryName(category != null ? category.getName() : null)
                .authorId(a.getAuthorId())
                .authorName(author != null ? author.getNickname() : null)
                .status(a.getStatus())
                .views(a.getViews())
                .likesCount(a.getLikesCount())
                .commentsCount(a.getCommentsCount())
                .tags(tags.stream().map(tagService::toVO).toList())
                .publishedAt(a.getPublishedAt())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
