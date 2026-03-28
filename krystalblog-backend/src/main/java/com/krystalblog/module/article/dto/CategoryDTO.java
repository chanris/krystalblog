package com.krystalblog.module.article.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryDTO {

    @NotBlank(message = "分类名称不能为空")
    @Size(max = 100, message = "分类名称不超过100个字符")
    private String name;

    private String slug;
    private String description;
}
