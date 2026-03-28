package com.krystalblog.module.video.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VideoDTO {
    @NotBlank(message = "标题不能为空")
    private String title;
    private String description;
    @NotBlank(message = "视频URL不能为空")
    private String videoUrl;
    private String coverImage;
    private Long duration;
    @NotNull(message = "分类不能为空")
    private Long categoryId;
    private String status;
    private LocalDateTime publishedAt;
}
