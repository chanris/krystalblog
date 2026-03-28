package com.krystalblog.module.drive.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.krystalblog.common.result.Result;
import com.krystalblog.module.drive.dto.DriveFileDTO;
import com.krystalblog.module.drive.service.DriveFileService;
import com.krystalblog.module.drive.vo.DriveFileVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "网盘文件", description = "文件管理")
@RestController
@RequestMapping("/api/drive/files")
@RequiredArgsConstructor
public class DriveFileController {

    private final DriveFileService fileService;

    @Operation(summary = "获取文件列表")
    @GetMapping
    public Result<IPage<DriveFileVO>> listFiles(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long folderId,
            @RequestParam(required = false) String keyword) {
        return Result.success(fileService.listFiles(page, size, folderId, keyword));
    }

    @Operation(summary = "获取文件详情")
    @GetMapping("/{id}")
    public Result<DriveFileVO> getFile(@PathVariable Long id) {
        return Result.success(fileService.getFileById(id));
    }

    @Operation(summary = "上传文件（需登录）")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Result<DriveFileVO> uploadFile(@Valid @RequestBody DriveFileDTO dto) {
        return Result.success(fileService.uploadFile(dto));
    }

    @Operation(summary = "删除文件（需登录）")
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Result<Void> deleteFile(@PathVariable Long id) {
        fileService.deleteFile(id);
        return Result.success();
    }
}
