package com.krystalblog.module.drive.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.krystalblog.common.exception.BusinessException;
import com.krystalblog.common.result.ResultCode;
import com.krystalblog.common.util.SecurityUtil;
import com.krystalblog.entity.DriveFile;
import com.krystalblog.entity.DriveFolder;
import com.krystalblog.entity.User;
import com.krystalblog.mapper.DriveFileMapper;
import com.krystalblog.mapper.DriveFolderMapper;
import com.krystalblog.mapper.UserMapper;
import com.krystalblog.module.drive.dto.DriveFileDTO;
import com.krystalblog.module.drive.dto.OssMultipartCompleteDTO;
import com.krystalblog.module.drive.dto.OssMultipartInitiateDTO;
import com.krystalblog.module.drive.service.storage.OssStorageService;
import com.krystalblog.module.drive.service.storage.OssMultipartSessionService;
import com.krystalblog.module.drive.vo.DriveFileVO;
import com.krystalblog.module.drive.vo.OssMultipartInitiateVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DriveFileService {

    private final DriveFileMapper fileMapper;
    private final DriveFolderMapper folderMapper;
    private final UserMapper userMapper;
    private final SecurityUtil securityUtil;
    private final ObjectProvider<OssStorageService> ossStorageServiceProvider;
    private final OssMultipartSessionService ossMultipartSessionService;

    @Value("${app.upload.path:./uploads}")
    private String uploadPath;

    public com.krystalblog.module.drive.vo.DriveStatsVO getStats(long quotaBytes) {
        Long folderCount = folderMapper.selectCount(null);
        List<DriveFile> activeFiles = fileMapper.selectList(
                new LambdaQueryWrapper<DriveFile>().eq(DriveFile::getStatus, "ACTIVE")
        );

        long totalSizeBytes = 0L;
        Map<String, Long> typeCounts = new HashMap<>();
        for (DriveFile f : activeFiles) {
            if (f.getFileSize() != null) totalSizeBytes += f.getFileSize();
            String category = toCategory(f.getFileName(), f.getFileType());
            typeCounts.put(category, typeCounts.getOrDefault(category, 0L) + 1L);
        }

        return com.krystalblog.module.drive.vo.DriveStatsVO.builder()
                .folderCount(folderCount != null ? folderCount : 0L)
                .fileCount((long) activeFiles.size())
                .totalSizeBytes(totalSizeBytes)
                .quotaBytes(quotaBytes)
                .typeCounts(typeCounts)
                .build();
    }

    public IPage<DriveFileVO> listFiles(int page, int size, Long folderId, String keyword) {
        LambdaQueryWrapper<DriveFile> wrapper = new LambdaQueryWrapper<>();
        if (folderId != null) {
            wrapper.eq(DriveFile::getFolderId, folderId);
        } else {
            wrapper.isNull(DriveFile::getFolderId);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.like(DriveFile::getFileName, keyword);
        }
        wrapper.eq(DriveFile::getStatus, "ACTIVE").orderByDesc(DriveFile::getCreatedAt);

        IPage<DriveFile> filePage = fileMapper.selectPage(new Page<>(page, size), wrapper);
        return filePage.convert(this::toVO);
    }

    public DriveFile getEntityById(Long id) {
        DriveFile file = fileMapper.selectById(id);
        if (file == null) {
            throw new BusinessException(ResultCode.FILE_NOT_FOUND);
        }
        return file;
    }

    public void incrementDownloadCount(Long id) {
        if (id == null) return;
        fileMapper.incrementDownloadCount(id);
        touchAccess(id);
    }

    public DriveFileVO getFileById(Long id) {
        DriveFile file = fileMapper.selectById(id);
        if (file == null) {
            throw new BusinessException(ResultCode.FILE_NOT_FOUND);
        }
        fileMapper.incrementDownloadCount(id);
        touchAccess(id);
        return toVO(file, true);
    }

    @Transactional
    public OssMultipartInitiateVO initiateOssMultipartUpload(OssMultipartInitiateDTO dto) {
        if (dto.getFolderId() != null && folderMapper.selectById(dto.getFolderId()) == null) {
            throw new BusinessException(ResultCode.FOLDER_NOT_FOUND);
        }
        OssStorageService ossStorageService = ossStorageServiceProvider.getIfAvailable();
        if (ossStorageService == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "OSS未启用");
        }
        Long uploaderId = securityUtil.getCurrentUserId();
        String safeName = dto.getFileName().replaceAll("[\\\\/]+", "_");
        ensureNoDuplicateName(uploaderId, dto.getFolderId(), safeName);
        String objectKey = buildObjectKey(uploaderId, dto.getFolderId(), safeName);
        var result = ossStorageService.initiateMultipartUpload(objectKey, dto.getFileType());
        long partSize = ossStorageService.getProperties().getMultipart().getPartSizeBytes();
        ossMultipartSessionService.saveSession(result.getUploadId(), objectKey, partSize);
        return OssMultipartInitiateVO.builder()
                .uploadId(result.getUploadId())
                .objectKey(objectKey)
                .partSizeBytes(partSize)
                .build();
    }

    public String uploadOssPart(String uploadId, String objectKey, int partNumber, MultipartFile part) {
        OssStorageService ossStorageService = ossStorageServiceProvider.getIfAvailable();
        if (ossStorageService == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "OSS未启用");
        }
        if (part == null || part.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "分片不能为空");
        }
        try (InputStream in = part.getInputStream()) {
            var partETag = ossStorageService.uploadPart(objectKey, uploadId, partNumber, in, part.getSize());
            ossMultipartSessionService.savePart(uploadId, partNumber, partETag.getETag());
            return partETag.getETag();
        } catch (IOException e) {
            throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED, "分片读取失败");
        }
    }

    @Transactional
    public DriveFileVO completeOssMultipartUpload(OssMultipartCompleteDTO dto) {
        if (dto.getFolderId() != null && folderMapper.selectById(dto.getFolderId()) == null) {
            throw new BusinessException(ResultCode.FOLDER_NOT_FOUND);
        }
        OssStorageService ossStorageService = ossStorageServiceProvider.getIfAvailable();
        if (ossStorageService == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "OSS未启用");
        }
        Long uploaderId = securityUtil.getCurrentUserId();
        String safeName = dto.getFileName().replaceAll("[\\\\/]+", "_");
        ensureNoDuplicateName(uploaderId, dto.getFolderId(), safeName);

        List<com.aliyun.oss.model.PartETag> partETags = dto.getParts().stream()
                .map(p -> new com.aliyun.oss.model.PartETag(p.getPartNumber(), p.getEtag()))
                .toList();
        var result = ossStorageService.completeMultipartUpload(dto.getObjectKey(), dto.getUploadId(), partETags);
        ossMultipartSessionService.delete(dto.getUploadId());

        DriveFile file = new DriveFile();
        file.setFileName(safeName);
        file.setFileUrl(dto.getObjectKey());
        file.setStorageProvider("OSS");
        file.setObjectKey(dto.getObjectKey());
        file.setBucket(ossStorageService.getBucket());
        file.setEtag(result != null ? result.getETag() : null);
        file.setFileType(normalizeFileType(dto.getFileType(), safeName));
        file.setFileSize(dto.getFileSize());
        file.setFolderId(dto.getFolderId());
        file.setUploaderId(uploaderId);
        file.setStatus("ACTIVE");
        file.setDownloadCount(0L);
        fileMapper.insert(file);
        return toVO(fileMapper.selectById(file.getId()), true);
    }

    @Transactional
    public DriveFileVO uploadFile(DriveFileDTO dto) {
        if (dto.getFolderId() != null && folderMapper.selectById(dto.getFolderId()) == null) {
            throw new BusinessException(ResultCode.FOLDER_NOT_FOUND);
        }
        DriveFile file = new DriveFile();
        file.setFileName(dto.getFileName());
        file.setFileUrl(dto.getFileUrl());
        file.setFileType(dto.getFileType());
        file.setFileSize(dto.getFileSize());
        file.setFolderId(dto.getFolderId());
        file.setUploaderId(securityUtil.getCurrentUserId());
        file.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        file.setDownloadCount(0L);
        fileMapper.insert(file);
        return toVO(fileMapper.selectById(file.getId()));
    }

    @Transactional
    public DriveFileVO uploadMultipartFile(MultipartFile multipartFile, Long folderId) {
        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "文件不能为空");
        }
        if (folderId != null && folderMapper.selectById(folderId) == null) {
            throw new BusinessException(ResultCode.FOLDER_NOT_FOUND);
        }

        String originalFilename = multipartFile.getOriginalFilename();
        String safeName = originalFilename != null ? originalFilename.replaceAll("[\\\\/]+", "_") : "file";
        Long uploaderId = securityUtil.getCurrentUserId();
        ensureNoDuplicateName(uploaderId, folderId, safeName);

        OssStorageService ossStorageService = ossStorageServiceProvider.getIfAvailable();
        String storageProvider = ossStorageService != null ? "OSS" : "LOCAL";
        String fileUrl;
        String objectKey = null;
        String bucket = null;
        String etag = null;

        if (ossStorageService != null) {
            objectKey = buildObjectKey(uploaderId, folderId, safeName);
            try {
                etag = ossStorageService.putObject(
                        objectKey,
                        multipartFile.getInputStream(),
                        multipartFile.getSize(),
                        normalizeFileType(multipartFile.getContentType(), safeName)
                );
            } catch (IOException e) {
                throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED, "文件读取失败");
            }
            bucket = ossStorageService.getBucket();
            fileUrl = objectKey;
        } else {
            String storedName = UUID.randomUUID() + "_" + safeName;
            try {
                Path dir = Path.of(uploadPath);
                Files.createDirectories(dir);
                Files.copy(multipartFile.getInputStream(), dir.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED, "文件保存失败");
            }
            fileUrl = "/uploads/" + storedName;
        }

        DriveFile file = new DriveFile();
        file.setFileName(safeName);
        file.setFileUrl(fileUrl);
        file.setStorageProvider(storageProvider);
        file.setObjectKey(objectKey);
        file.setBucket(bucket);
        file.setEtag(etag);
        file.setFileType(normalizeFileType(multipartFile.getContentType(), safeName));
        file.setFileSize(multipartFile.getSize());
        file.setFolderId(folderId);
        file.setUploaderId(uploaderId);
        file.setStatus("ACTIVE");
        file.setDownloadCount(0L);
        fileMapper.insert(file);
        return toVO(fileMapper.selectById(file.getId()), true);
    }

    @Transactional
    public void deleteFile(Long id) {
        DriveFile file = fileMapper.selectById(id);
        if (file == null) {
            throw new BusinessException(ResultCode.FILE_NOT_FOUND);
        }
        if ("OSS".equalsIgnoreCase(file.getStorageProvider()) && StringUtils.hasText(file.getObjectKey())) {
            OssStorageService ossStorageService = ossStorageServiceProvider.getIfAvailable();
            if (ossStorageService != null) {
                ossStorageService.deleteObject(file.getObjectKey());
            }
        }
        fileMapper.deleteById(id);
    }

    @Transactional
    public void deleteFiles(Iterable<Long> ids) {
        if (ids == null) return;
        for (Long id : ids) {
            if (id == null) continue;
            DriveFile file = fileMapper.selectById(id);
            if (file != null && "OSS".equalsIgnoreCase(file.getStorageProvider()) && StringUtils.hasText(file.getObjectKey())) {
                OssStorageService ossStorageService = ossStorageServiceProvider.getIfAvailable();
                if (ossStorageService != null) {
                    ossStorageService.deleteObject(file.getObjectKey());
                }
            }
            fileMapper.deleteById(id);
        }
    }

    public Path resolveLocalPath(DriveFile file) {
        if (file == null || !StringUtils.hasText(file.getFileUrl())) return null;
        if (StringUtils.hasText(file.getStorageProvider()) && !"LOCAL".equalsIgnoreCase(file.getStorageProvider())) return null;
        String url = file.getFileUrl();
        if (!url.startsWith("/uploads/")) return null;
        String filename = url.substring("/uploads/".length());
        return Path.of(uploadPath).resolve(filename);
    }

    public String generateDownloadUrl(Long id) {
        DriveFile file = getEntityById(id);
        if (!"OSS".equalsIgnoreCase(file.getStorageProvider()) || !StringUtils.hasText(file.getObjectKey())) {
            return null;
        }
        OssStorageService ossStorageService = ossStorageServiceProvider.getIfAvailable();
        if (ossStorageService == null) return null;
        URL url = ossStorageService.generatePresignedGetUrl(
                file.getObjectKey(),
                Duration.ofSeconds(ossStorageService.getProperties().getPresign().getDownloadTtlSeconds()),
                false,
                file.getFileName()
        );
        return url != null ? url.toString() : null;
    }

    public String generatePreviewUrl(Long id) {
        DriveFile file = getEntityById(id);
        if (!"OSS".equalsIgnoreCase(file.getStorageProvider()) || !StringUtils.hasText(file.getObjectKey())) {
            return null;
        }
        OssStorageService ossStorageService = ossStorageServiceProvider.getIfAvailable();
        if (ossStorageService == null) return null;
        URL url = ossStorageService.generatePresignedGetUrl(
                file.getObjectKey(),
                Duration.ofSeconds(ossStorageService.getProperties().getPresign().getPreviewTtlSeconds()),
                true,
                file.getFileName()
        );
        return url != null ? url.toString() : null;
    }

    public void touchAccess(Long id) {
        if (id == null) return;
        DriveFile update = new DriveFile();
        update.setId(id);
        update.setLastAccessedAt(LocalDateTime.now());
        fileMapper.updateById(update);
    }

    public String computeObjectKey(DriveFile file) {
        if (file == null) return null;
        Long uploaderId = file.getUploaderId();
        if (uploaderId == null) return null;
        String fileName = StringUtils.hasText(file.getFileName()) ? file.getFileName() : "file";
        return buildObjectKey(uploaderId, file.getFolderId(), fileName.replaceAll("[\\\\/]+", "_"));
    }

    private String normalizeFileType(String contentType, String fileName) {
        if (StringUtils.hasText(contentType)) return contentType;
        String ext = "";
        int idx = fileName != null ? fileName.lastIndexOf('.') : -1;
        if (idx >= 0 && idx < fileName.length() - 1) {
            ext = fileName.substring(idx + 1).toLowerCase(Locale.ROOT);
        }
        return ext.isEmpty() ? "application/octet-stream" : ext;
    }

    private void ensureNoDuplicateName(Long uploaderId, Long folderId, String fileName) {
        Long count = fileMapper.selectCount(
                new LambdaQueryWrapper<DriveFile>()
                        .eq(DriveFile::getUploaderId, uploaderId)
                        .eq(folderId != null, DriveFile::getFolderId, folderId)
                        .isNull(folderId == null, DriveFile::getFolderId)
                        .eq(DriveFile::getFileName, fileName)
                        .eq(DriveFile::getStatus, "ACTIVE")
        );
        if (count != null && count > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "同一目录下已存在同名文件");
        }
    }

    private String buildObjectKey(Long uploaderId, Long folderId, String fileName) {
        String base = "user/" + uploaderId + "/";
        if (folderId == null) {
            return base + fileName;
        }
        List<String> segments = new java.util.ArrayList<>();
        Long current = folderId;
        while (current != null) {
            DriveFolder folder = folderMapper.selectById(current);
            if (folder == null) break;
            segments.add(0, sanitizePathSegment(folder.getName()));
            current = folder.getParentId();
        }
        String folderPath = String.join("/", segments);
        if (StringUtils.hasText(folderPath)) {
            return base + folderPath + "/" + fileName;
        }
        return base + fileName;
    }

    private String sanitizePathSegment(String value) {
        if (!StringUtils.hasText(value)) return "folder";
        String v = value.replaceAll("[\\\\/]+", "_").trim();
        return v.isEmpty() ? "folder" : v;
    }

    private String toCategory(String fileName, String fileType) {
        String ext = "";
        if (fileName != null) {
            int dot = fileName.lastIndexOf('.');
            if (dot >= 0 && dot < fileName.length() - 1) {
                ext = fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
            }
        }

        return switch (ext) {
            case "pdf" -> "pdf";
            case "fig" -> "figma";
            case "xls", "xlsx" -> "excel";
            case "png", "jpg", "jpeg", "gif", "webp", "svg" -> "image";
            case "zip", "rar", "7z", "tar", "gz" -> "archive";
            case "md", "markdown" -> "markdown";
            case "mp4", "mov", "avi", "mkv", "webm" -> "video";
            case "doc", "docx" -> "word";
            default -> {
                if (fileType != null && fileType.toLowerCase(Locale.ROOT).startsWith("image/")) yield "image";
                if (fileType != null && fileType.toLowerCase(Locale.ROOT).startsWith("video/")) yield "video";
                yield "default";
            }
        };
    }

    private DriveFileVO toVO(DriveFile f) {
        return toVO(f, false);
    }

    private DriveFileVO toVO(DriveFile f, boolean includeUrls) {
        DriveFolder folder = f.getFolderId() != null ? folderMapper.selectById(f.getFolderId()) : null;
        User uploader = userMapper.selectById(f.getUploaderId());

        DriveFileVO.DriveFileVOBuilder builder = DriveFileVO.builder()
                .id(f.getId())
                .fileName(f.getFileName())
                .fileUrl(f.getFileUrl())
                .storageProvider(f.getStorageProvider())
                .objectKey(f.getObjectKey())
                .fileType(f.getFileType())
                .fileSize(f.getFileSize())
                .folderId(f.getFolderId())
                .folderName(folder != null ? folder.getName() : null)
                .uploaderId(f.getUploaderId())
                .uploaderName(uploader != null ? uploader.getNickname() : null)
                .status(f.getStatus())
                .downloadCount(f.getDownloadCount())
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                ;

        if (includeUrls && "OSS".equalsIgnoreCase(f.getStorageProvider()) && StringUtils.hasText(f.getObjectKey())) {
            builder.downloadUrl(generateDownloadUrl(f.getId()));
            builder.previewUrl(generatePreviewUrl(f.getId()));
        }

        return builder.build();
    }
}
