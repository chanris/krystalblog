package com.krystalblog.module.drive.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DriveFolderDTO {
    @NotBlank(message = "文件夹名称不能为空")
    private String name;
    private Long parentId;
}
