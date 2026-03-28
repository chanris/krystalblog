package com.krystalblog.module.video.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.krystalblog.common.result.Result;
import com.krystalblog.module.article.dto.CommentDTO;
import com.krystalblog.module.article.service.CommentService;
import com.krystalblog.module.article.service.LikeService;
import com.krystalblog.module.article.vo.CommentVO;
import com.krystalblog.module.video.dto.VideoDTO;
import com.krystalblog.module.video.service.VideoService;
import com.krystalblog.module.video.vo.VideoVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "视频管理", description = "视频CRUD、评论、点赞")
@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;
    private final CommentService commentService;
    private final LikeService likeService;

    @Operation(summary = "获取视频列表")
    @GetMapping
    public Result<IPage<VideoVO>> listVideos(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        return Result.success(videoService.listVideos(page, size, status, categoryId, keyword));
    }

    @Operation(summary = "获取视频详情")
    @GetMapping("/{id}")
    public Result<VideoVO> getVideo(@PathVariable Long id) {
        return Result.success(videoService.getVideoById(id));
    }

    @Operation(summary = "创建视频（管理员）")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<VideoVO> createVideo(@Valid @RequestBody VideoDTO dto) {
        return Result.success(videoService.createVideo(dto));
    }

    @Operation(summary = "更新视频（管理员）")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<VideoVO> updateVideo(@PathVariable Long id, @Valid @RequestBody VideoDTO dto) {
        return Result.success(videoService.updateVideo(id, dto));
    }

    @Operation(summary = "删除视频（管理员）")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteVideo(@PathVariable Long id) {
        videoService.deleteVideo(id);
        return Result.success();
    }

    @Operation(summary = "获取视频评论")
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

    @Operation(summary = "点赞视频（需登录）")
    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public Result<Boolean> likeVideo(@PathVariable Long id) {
        return Result.success(likeService.likeArticle(id));
    }

    @Operation(summary = "取消点赞（需登录）")
    @DeleteMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public Result<Boolean> unlikeVideo(@PathVariable Long id) {
        return Result.success(likeService.unlikeArticle(id));
    }
}
