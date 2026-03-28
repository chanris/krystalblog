package com.krystalblog.module.article.controller;

import com.krystalblog.common.result.Result;
import com.krystalblog.module.article.dto.CategoryDTO;
import com.krystalblog.module.article.service.CategoryService;
import com.krystalblog.module.article.vo.CategoryVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "文章分类", description = "文章分类管理")
@RestController
@RequestMapping("/api/articles/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "获取分类列表")
    @GetMapping
    public Result<List<CategoryVO>> listCategories() {
        return Result.success(categoryService.listCategories());
    }

    @Operation(summary = "创建分类（管理员）")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<CategoryVO> createCategory(@Valid @RequestBody CategoryDTO dto) {
        return Result.success(categoryService.createCategory(dto));
    }

    @Operation(summary = "更新分类（管理员）")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<CategoryVO> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDTO dto) {
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
