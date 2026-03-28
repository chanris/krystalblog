package com.krystalblog.module.article.controller;

import com.krystalblog.common.result.Result;
import com.krystalblog.module.article.dto.TagDTO;
import com.krystalblog.module.article.service.TagService;
import com.krystalblog.module.article.vo.TagVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "文章标签", description = "文章标签管理")
@RestController
@RequestMapping("/api/articles/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @Operation(summary = "获取标签列表")
    @GetMapping
    public Result<List<TagVO>> listTags() {
        return Result.success(tagService.listTags());
    }

    @Operation(summary = "创建标签（管理员）")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<TagVO> createTag(@Valid @RequestBody TagDTO dto) {
        return Result.success(tagService.createTag(dto));
    }

    @Operation(summary = "更新标签（管理员）")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<TagVO> updateTag(@PathVariable Long id, @Valid @RequestBody TagDTO dto) {
        return Result.success(tagService.updateTag(id, dto));
    }

    @Operation(summary = "删除标签（管理员）")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return Result.success();
    }
}
