package com.krystalblog.module.article.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.krystalblog.common.result.Result;
import com.krystalblog.module.article.dto.ArticleDTO;
import com.krystalblog.module.article.dto.CommentDTO;
import com.krystalblog.module.article.service.ArticleService;
import com.krystalblog.module.article.service.CommentService;
import com.krystalblog.module.article.service.LikeService;
import com.krystalblog.module.article.vo.ArticleVO;
import com.krystalblog.module.article.vo.CommentVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "文章管理", description = "文章CRUD、评论、点赞")
@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;
    private final CommentService commentService;
    private final LikeService likeService;

    @Operation(summary = "获取文章列表")
    @GetMapping
    public Result<IPage<ArticleVO>> listArticles(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long tagId,
            @RequestParam(required = false) String keyword) {
        return Result.success(articleService.listArticles(page, size, status, categoryId, tagId, keyword));
    }

    @Operation(summary = "获取文章详情")
    @GetMapping("/{id}")
    public Result<ArticleVO> getArticle(@PathVariable Long id) {
        return Result.success(articleService.getArticleById(id));
    }

    @Operation(summary = "创建文章（管理员）")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<ArticleVO> createArticle(@Valid @RequestBody ArticleDTO dto) {
        return Result.success(articleService.createArticle(dto));
    }

    @Operation(summary = "更新文章（管理员）")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<ArticleVO> updateArticle(@PathVariable Long id, @Valid @RequestBody ArticleDTO dto) {
        return Result.success(articleService.updateArticle(id, dto));
    }

    @Operation(summary = "删除文章（管理员）")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return Result.success();
    }

    @Operation(summary = "获取文章归档")
    @GetMapping("/archives")
    public Result<List<Map<String, Object>>> getArchives() {
        return Result.success(articleService.getArchives());
    }

    @Operation(summary = "获取文章评论")
    @GetMapping("/{id}/comments")
    public Result<IPage<CommentVO>> getComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.success(commentService.getArticleComments(id, page, size));
    }

    @Operation(summary = "创建评论（需登录）")
    @PostMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public Result<CommentVO> createComment(@PathVariable Long id, @Valid @RequestBody CommentDTO dto) {
        return Result.success(commentService.createArticleComment(id, dto));
    }

    @Operation(summary = "删除评论")
    @DeleteMapping("/comments/{id}")
    @PreAuthorize("isAuthenticated()")
    public Result<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return Result.success();
    }

    @Operation(summary = "点赞文章（需登录）")
    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public Result<Boolean> likeArticle(@PathVariable Long id) {
        return Result.success(likeService.likeArticle(id));
    }

    @Operation(summary = "取消点赞（需登录）")
    @DeleteMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public Result<Boolean> unlikeArticle(@PathVariable Long id) {
        return Result.success(likeService.unlikeArticle(id));
    }
}
