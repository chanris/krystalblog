package com.krystalblog.module.drive.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.krystalblog.common.result.Result;
import com.krystalblog.module.drive.dto.DriveFileDTO;
import com.krystalblog.module.drive.dto.OssMultipartCompleteDTO;
import com.krystalblog.module.drive.dto.OssMultipartInitiateDTO;
import com.krystalblog.module.drive.service.DriveFileService;
import com.krystalblog.module.drive.vo.DriveFileVO;
import com.krystalblog.module.drive.vo.DriveStatsVO;
import com.krystalblog.module.drive.vo.OssMultipartInitiateVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
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
    @PreAuthorize("isAuthenticated()")
    public Result<DriveStatsVO> stats() {
        return Result.success(fileService.getStats(quotaBytes));
    }

    @Operation(summary = "获取文件列表")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Result<IPage<DriveFileVO>> listFiles(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long folderId,
            @RequestParam(required = false) String keyword) {
        return Result.success(fileService.listFiles(page, size, folderId, keyword));
    }

    @Operation(summary = "网盘文件选择器列表（支持筛选/排序）（需登录）")
    @GetMapping("/picker")
    @PreAuthorize("isAuthenticated()")
    public Result<IPage<DriveFileVO>> listFilesForPicker(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long folderId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String fileCategory,
            @RequestParam(required = false) String mimePrefix,
            @RequestParam(required = false) Long uploadedAfterMillis,
            @RequestParam(required = false) Long uploadedBeforeMillis,
            @RequestParam(required = false) String sortBy
    ) {
        return Result.success(fileService.listFilesForPicker(page, size, folderId, keyword, fileCategory, mimePrefix, uploadedAfterMillis, uploadedBeforeMillis, sortBy));
    }

    @Operation(summary = "获取文件详情")
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Result<DriveFileVO> getFile(@PathVariable Long id) {
        return Result.success(fileService.getFileById(id));
    }

    @Operation(summary = "下载文件（需登录）")
    @GetMapping("/{id}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> downloadFile(@PathVariable Long id) {
        var file = fileService.getEntityById(id);
        fileService.incrementDownloadCount(id);
        if ("OSS".equalsIgnoreCase(file.getStorageProvider()) && file.getObjectKey() != null) {
            String url = fileService.generateDownloadUrl(id);
            if (url == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
            return ResponseEntity.status(HttpStatus.FOUND).header(HttpHeaders.LOCATION, url).build();
        }

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

    @Operation(summary = "获取下载临时URL（需登录）")
    @GetMapping("/{id}/download-url")
    @PreAuthorize("isAuthenticated()")
    public Result<String> getDownloadUrl(@PathVariable Long id) {
        var file = fileService.getEntityById(id);
        fileService.incrementDownloadCount(id);
        if ("OSS".equalsIgnoreCase(file.getStorageProvider()) && file.getObjectKey() != null) {
            return Result.success(fileService.generateDownloadUrl(id));
        }
        return Result.success(file.getFileUrl());
    }

    @Operation(summary = "获取预览临时URL（需登录）")
    @GetMapping("/{id}/preview-url")
    @PreAuthorize("isAuthenticated()")
    public Result<String> getPreviewUrl(@PathVariable Long id) {
        var file = fileService.getEntityById(id);
        fileService.touchAccess(id);
        if ("OSS".equalsIgnoreCase(file.getStorageProvider()) && file.getObjectKey() != null) {
            return Result.success(fileService.generatePreviewUrl(id));
        }
        return Result.success(file.getFileUrl());
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

    @Operation(summary = "OSS分片上传：初始化（需登录）")
    @PostMapping("/multipart/initiate")
    @PreAuthorize("isAuthenticated()")
    public Result<OssMultipartInitiateVO> initiateMultipart(@Valid @RequestBody OssMultipartInitiateDTO dto) {
        return Result.success(fileService.initiateOssMultipartUpload(dto));
    }

    @Operation(summary = "OSS分片上传：上传分片（需登录）")
    @PostMapping(value = "/multipart/upload-part", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public Result<String> uploadPart(
            @RequestParam("uploadId") String uploadId,
            @RequestParam("objectKey") String objectKey,
            @RequestParam("partNumber") int partNumber,
            @RequestParam("file") MultipartFile file) {
        return Result.success(fileService.uploadOssPart(uploadId, objectKey, partNumber, file));
    }

    @Operation(summary = "OSS分片上传：完成合并并创建文件记录（需登录）")
    @PostMapping("/multipart/complete")
    @PreAuthorize("isAuthenticated()")
    public Result<DriveFileVO> completeMultipart(@Valid @RequestBody OssMultipartCompleteDTO dto) {
        return Result.success(fileService.completeOssMultipartUpload(dto));
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
