package com.krystalblog.module.drive.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.krystalblog.common.result.Result;
import com.krystalblog.module.drive.dto.DriveFileDTO;
import com.krystalblog.module.drive.service.DriveFileService;
import com.krystalblog.module.drive.vo.DriveFileVO;
import com.krystalblog.module.drive.vo.DriveStatsVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;

@Tag(name = "网盘文件", description = "文件管理")
@RestController
@RequestMapping("/api/drive/files")
@RequiredArgsConstructor
public class DriveFileController {

    private final DriveFileService fileService;

    @Value("${app.drive.quota-bytes:107374182400}")
    private long quotaBytes;

    @Operation(summary = "网盘统计信息")
    @GetMapping("/stats")
    public Result<DriveStatsVO> stats() {
        return Result.success(fileService.getStats(quotaBytes));
    }

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

    @Operation(summary = "下载文件（需登录）")
    @GetMapping("/{id}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        var file = fileService.getEntityById(id);
        fileService.incrementDownloadCount(id);
        Path localPath = fileService.resolveLocalPath(file);
        if (localPath == null) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(localPath);
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        String filename = file.getFileName();
        long contentLength = file.getFileSize() != null ? file.getFileSize() : -1L;
        if (contentLength < 0) {
            try {
                contentLength = resource.contentLength();
            } catch (java.io.IOException ignored) {
                contentLength = -1L;
            }
        }

        ResponseEntity.BodyBuilder builder = ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM);

        if (contentLength >= 0) {
            builder.contentLength(contentLength);
        }
        return builder.body(resource);
    }

    @Operation(summary = "上传文件（需登录）")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Result<DriveFileVO> uploadFile(@Valid @RequestBody DriveFileDTO dto) {
        return Result.success(fileService.uploadFile(dto));
    }

    @Operation(summary = "上传本地文件（multipart）（需登录）")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public Result<DriveFileVO> uploadMultipartFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Long folderId) {
        return Result.success(fileService.uploadMultipartFile(file, folderId));
    }

    @Operation(summary = "批量删除文件（需登录）")
    @PostMapping("/batch-delete")
    @PreAuthorize("isAuthenticated()")
    public Result<Void> deleteFiles(@RequestBody BatchDeleteDTO dto) {
        fileService.deleteFiles(dto != null ? dto.ids : null);
        return Result.success();
    }

    @Operation(summary = "删除文件（需登录）")
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Result<Void> deleteFile(@PathVariable Long id) {
        fileService.deleteFile(id);
        return Result.success();
    }

    public static class BatchDeleteDTO {
        public List<Long> ids;
    }
}
