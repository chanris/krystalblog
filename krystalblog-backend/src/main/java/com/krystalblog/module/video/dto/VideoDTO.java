package com.krystalblog.module.video.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VideoDTO {
    @jakarta.validation.constraints.NotBlank(message = "标题不能为空")
    private String title;
    private String description;
    private String videoUrl;
    private Long driveFileId;
    private Integer width;
    private Integer height;
    private Integer videoBitrateKbps;
    private String coverImage;
    private Long duration;
    @NotNull(message = "分类不能为空")
    private Long categoryId;
    private String status;
    private LocalDateTime publishedAt;
}
