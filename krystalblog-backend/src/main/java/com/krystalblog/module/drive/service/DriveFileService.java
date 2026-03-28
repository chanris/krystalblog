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
import com.krystalblog.module.drive.vo.DriveFileVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
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
    }

    public DriveFileVO getFileById(Long id) {
        DriveFile file = fileMapper.selectById(id);
        if (file == null) {
            throw new BusinessException(ResultCode.FILE_NOT_FOUND);
        }
        fileMapper.incrementDownloadCount(id);
        return toVO(file);
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
        String storedName = UUID.randomUUID() + "_" + safeName;

        try {
            Path dir = Path.of(uploadPath);
            Files.createDirectories(dir);
            Files.copy(multipartFile.getInputStream(), dir.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED, "文件保存失败");
        }

        DriveFile file = new DriveFile();
        file.setFileName(safeName);
        file.setFileUrl("/uploads/" + storedName);
        file.setFileType(normalizeFileType(multipartFile.getContentType(), safeName));
        file.setFileSize(multipartFile.getSize());
        file.setFolderId(folderId);
        file.setUploaderId(securityUtil.getCurrentUserId());
        file.setStatus("ACTIVE");
        file.setDownloadCount(0L);
        fileMapper.insert(file);
        return toVO(fileMapper.selectById(file.getId()));
    }

    @Transactional
    public void deleteFile(Long id) {
        if (fileMapper.selectById(id) == null) {
            throw new BusinessException(ResultCode.FILE_NOT_FOUND);
        }
        fileMapper.deleteById(id);
    }

    @Transactional
    public void deleteFiles(Iterable<Long> ids) {
        if (ids == null) return;
        for (Long id : ids) {
            if (id == null) continue;
            fileMapper.deleteById(id);
        }
    }

    public Path resolveLocalPath(DriveFile file) {
        if (file == null || !StringUtils.hasText(file.getFileUrl())) return null;
        String url = file.getFileUrl();
        if (!url.startsWith("/uploads/")) return null;
        String filename = url.substring("/uploads/".length());
        return Path.of(uploadPath).resolve(filename);
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
        DriveFolder folder = f.getFolderId() != null ? folderMapper.selectById(f.getFolderId()) : null;
        User uploader = userMapper.selectById(f.getUploaderId());

        return DriveFileVO.builder()
                .id(f.getId())
                .fileName(f.getFileName())
                .fileUrl(f.getFileUrl())
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
                .build();
    }
}
