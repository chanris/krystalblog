package com.krystalblog.module.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserDTO {

    @Size(max = 50, message = "昵称长度不超过50个字符")
    private String nickname;

    @Email(message = "邮箱格式不正确")
    private String email;

    private String avatar;

    @Size(max = 500, message = "个人简介不超过500个字符")
    private String bio;
}
