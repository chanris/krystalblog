package com.krystalblog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.krystalblog.entity.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("articles")
public class Article extends BaseEntity {

    private String title;
    private String slug;
    private String excerpt;
    private String content;
    private String coverImage;
    private Long categoryId;
    private Long authorId;
    private String status;
    private Long views;
    private Long likesCount;
    private Long commentsCount;
    private LocalDateTime publishedAt;

    @TableField(exist = false)
    private String categoryName;

    @TableField(exist = false)
    private String authorName;

    @TableField(exist = false)
    private List<Tag> tags;
}
