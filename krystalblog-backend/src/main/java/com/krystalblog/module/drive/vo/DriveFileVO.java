package com.krystalblog.module.drive.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DriveFileVO {
    private Long id;
    private String fileName;
    private String fileUrl;
    private String storageProvider;
    private String objectKey;
    private String downloadUrl;
    private String previewUrl;
    private String fileType;
    private Long fileSize;
    private Long folderId;
    private String folderName;
    private Long uploaderId;
    private String uploaderName;
    private String status;
    private Long downloadCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
