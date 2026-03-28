package com.krystalblog.module.friend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FriendLinkDTO {
    @NotBlank(message = "名称不能为空")
    private String name;
    @NotBlank(message = "URL不能为空")
    private String url;
    private String logo;
    private String description;
    private Long categoryId;
    private String status;
    private Integer sortOrder;
}
