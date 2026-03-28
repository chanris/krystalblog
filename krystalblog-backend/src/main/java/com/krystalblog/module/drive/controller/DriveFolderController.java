package com.krystalblog.module.drive.controller;

import com.krystalblog.common.result.Result;
import com.krystalblog.module.drive.dto.DriveFolderDTO;
import com.krystalblog.module.drive.service.DriveFolderService;
import com.krystalblog.module.drive.vo.DriveFolderVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "网盘文件夹", description = "文件夹管理")
@RestController
@RequestMapping("/api/drive/folders")
@RequiredArgsConstructor
public class DriveFolderController {

    private final DriveFolderService folderService;

    @Operation(summary = "获取文件夹列表")
    @GetMapping
    public Result<List<DriveFolderVO>> listFolders(
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) String keyword) {
        return Result.success(folderService.listFolders(parentId, keyword));
    }

    @Operation(summary = "获取文件夹详情")
    @GetMapping("/{id}")
    public Result<DriveFolderVO> getFolder(@PathVariable Long id) {
        return Result.success(folderService.getFolder(id));
    }

    @Operation(summary = "获取文件夹面包屑路径（从根到当前）")
    @GetMapping("/{id}/path")
    public Result<List<DriveFolderVO>> getFolderPath(@PathVariable Long id) {
        return Result.success(folderService.getFolderPath(id));
    }

    @Operation(summary = "创建文件夹（需登录）")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Result<DriveFolderVO> createFolder(@Valid @RequestBody DriveFolderDTO dto) {
        return Result.success(folderService.createFolder(dto));
    }

    @Operation(summary = "更新文件夹（需登录）")
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Result<DriveFolderVO> updateFolder(@PathVariable Long id, @Valid @RequestBody DriveFolderDTO dto) {
        return Result.success(folderService.updateFolder(id, dto));
    }

    @Operation(summary = "删除文件夹（需登录）")
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Result<Void> deleteFolder(@PathVariable Long id) {
        folderService.deleteFolder(id);
        return Result.success();
    }
}
