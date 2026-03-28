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
public class CommentVO {

    private Long id;
    private String content;
    private Long articleId;
    private Long videoId;
    private Long authorId;
    private String authorName;
    private String authorAvatar;
    private Long parentId;
    private List<CommentVO> replies;
    private LocalDateTime createdAt;
}
