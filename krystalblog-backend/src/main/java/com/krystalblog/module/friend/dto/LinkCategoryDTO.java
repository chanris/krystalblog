package com.krystalblog.module.friend.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LinkCategoryDTO {
    @NotBlank(message = "分类名称不能为空")
    @Size(max = 50, message = "分类名称不超过50个字符")
    private String name;

    @Size(max = 200, message = "分类描述不超过200个字符")
    private String description;

    private Integer sortOrder;
}
