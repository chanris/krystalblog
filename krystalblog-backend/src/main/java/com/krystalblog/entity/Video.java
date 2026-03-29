package com.krystalblog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.krystalblog.entity.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("videos")
public class Video extends BaseEntity {
    private String title;
    private String slug;
    private String description;
    private String videoUrl;
    private Long driveFileId;
    private String videoMimeType;
    private Long videoSizeBytes;
    private Integer width;
    private Integer height;
    private Integer videoBitrateKbps;
    @TableField("thumbnail")
    private String coverImage;
    private Long duration;
    private Long categoryId;
    private Long authorId;
    private String status;
    private Long views;
    private Long likesCount;
    private Long commentsCount;
    @TableField("published_at")
    private LocalDateTime publishedAt;
}
