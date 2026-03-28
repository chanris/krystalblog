package com.krystalblog.module.article.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleVO {

    private Long id;
    private String title;
    private String slug;
    private String excerpt;
    private String content;
    private String coverImage;
    private Long categoryId;
    private String categoryName;
    private Long authorId;
    private String authorName;
    private String status;
    private Long views;
    private Long likesCount;
    private Long commentsCount;
    private List<TagVO> tags;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
