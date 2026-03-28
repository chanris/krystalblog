package com.krystalblog.module.article.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ArticleDTO {

    @NotBlank(message = "文章标题不能为空")
    @Size(max = 200, message = "标题不超过200个字符")
    private String title;

    private String excerpt;

    @NotBlank(message = "文章内容不能为空")
    private String content;

    private String coverImage;

    @NotNull(message = "分类不能为空")
    private Long categoryId;

    private List<Long> tagIds;

    private String status;

    private LocalDateTime publishedAt;
}
