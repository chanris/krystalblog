package com.krystalblog.module.drive.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class DriveFileService {

    private final DriveFileMapper fileMapper;
    private final DriveFolderMapper folderMapper;
    private final UserMapper userMapper;
    private final SecurityUtil securityUtil;

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

    public DriveFileVO getFileById(Long id) {
        DriveFile file = fileMapper.selectById(id);
        if (file == null) return null;
        fileMapper.incrementDownloadCount(id);
        return toVO(file);
    }

    @Transactional
    public DriveFileVO uploadFile(DriveFileDTO dto) {
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
    public void deleteFile(Long id) {
        fileMapper.deleteById(id);
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
