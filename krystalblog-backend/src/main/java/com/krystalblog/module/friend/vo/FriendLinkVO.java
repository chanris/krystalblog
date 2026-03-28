package com.krystalblog.module.friend.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FriendLinkVO {
    private Long id;
    private String name;
    private String url;
    private String logo;
    private String description;
    private Long categoryId;
    private String categoryName;
    private String status;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
