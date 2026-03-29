package com.krystalblog.module.video.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VideoVO {
    private Long id;
    private String title;
    private String description;
    private String videoUrl;
    private Long driveFileId;
    private String videoMimeType;
    private Long videoSizeBytes;
    private Integer width;
    private Integer height;
    private Integer videoBitrateKbps;
    private String coverImage;
    private Long duration;
    private Long categoryId;
    private String categoryName;
    private Long authorId;
    private String authorName;
    private String status;
    private Long views;
    private Long likesCount;
    private Long commentsCount;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
