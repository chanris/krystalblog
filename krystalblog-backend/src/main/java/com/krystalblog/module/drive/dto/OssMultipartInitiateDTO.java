package com.krystalblog.module.drive.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OssMultipartInitiateDTO {
    @NotBlank(message = "文件名不能为空")
    private String fileName;
    private String fileType;
    private Long folderId;
}

