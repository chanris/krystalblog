package com.krystalblog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.krystalblog.entity.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("drive_files")
public class DriveFile extends BaseEntity {
    @TableField("name")
    private String fileName;
    private String fileUrl;
    private String storageProvider;
    private String objectKey;
    private String bucket;
    private String etag;
    private String checksumSha256;
    private java.time.LocalDateTime lastAccessedAt;

    @TableField("mime_type")
    private String fileType;
    private Long fileSize;
    private Long folderId;

    @TableField("uploaded_by_id")
    private Long uploaderId;
    private String status;
    private Long downloadCount;
    private Long referenceCount;
}
