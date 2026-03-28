package com.krystalblog.module.video.controller;

import com.krystalblog.common.result.Result;
import com.krystalblog.module.video.dto.VideoCategoryDTO;
import com.krystalblog.module.video.service.VideoCategoryService;
import com.krystalblog.module.video.vo.VideoCategoryVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "视频分类", description = "视频分类管理")
@RestController
@RequestMapping("/api/videos/categories")
@RequiredArgsConstructor
public class VideoCategoryController {

    private final VideoCategoryService categoryService;

    @Operation(summary = "获取分类列表")
    @GetMapping
    public Result<List<VideoCategoryVO>> listCategories() {
        return Result.success(categoryService.listCategories());
    }

    @Operation(summary = "创建分类（管理员）")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<VideoCategoryVO> createCategory(@Valid @RequestBody VideoCategoryDTO dto) {
        return Result.success(categoryService.createCategory(dto));
    }

    @Operation(summary = "更新分类（管理员）")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<VideoCategoryVO> updateCategory(@PathVariable Long id, @Valid @RequestBody VideoCategoryDTO dto) {
        return Result.success(categoryService.updateCategory(id, dto));
    }

    @Operation(summary = "删除分类（管理员）")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.success();
    }
}
