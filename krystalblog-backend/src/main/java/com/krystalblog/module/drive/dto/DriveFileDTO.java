package com.krystalblog.module.drive.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DriveFileDTO {
    @NotBlank(message = "文件名不能为空")
    private String fileName;
    @NotBlank(message = "文件URL不能为空")
    private String fileUrl;
    private String fileType;
    @NotNull(message = "文件大小不能为空")
    private Long fileSize;
    private Long folderId;
    private String status;
}
