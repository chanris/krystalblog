package com.krystalblog.module.video.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VideoCategoryDTO {
    @NotBlank(message = "分类名称不能为空")
    private String name;
    private String description;
    private Integer sortOrder;
}
