package com.krystalblog.module.friend.controller;

import com.krystalblog.common.result.PageResult;
import com.krystalblog.common.result.Result;
import com.krystalblog.module.friend.dto.LinkCategoryDTO;
import com.krystalblog.module.friend.service.LinkCategoryService;
import com.krystalblog.module.friend.vo.LinkCategoryVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "友链分类", description = "友链分类管理")
@RestController
@RequestMapping("/api/link-categories")
@RequiredArgsConstructor
public class LinkCategoryController {

    private final LinkCategoryService linkCategoryService;

    @Operation(summary = "友链分类列表（管理员）")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<PageResult<LinkCategoryVO>> listCategories(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(required = false) String keyword) {
        return Result.success(linkCategoryService.listCategories(page, keyword));
    }

    @Operation(summary = "新增友链分类（管理员）")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<LinkCategoryVO> createCategory(@Valid @RequestBody LinkCategoryDTO dto) {
        return Result.success(linkCategoryService.createCategory(dto));
    }

    @Operation(summary = "删除友链分类（管理员）")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        linkCategoryService.deleteCategory(id);
        return Result.success();
    }
}
