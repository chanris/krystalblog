package com.krystalblog.module.captcha.dto;

import com.krystalblog.module.captcha.enums.CaptchaPurpose;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CaptchaVerifyDTO {

    @NotBlank(message = "验证码ID不能为空")
    private String captchaId;

    @NotBlank(message = "验证码不能为空")
    private String code;

    @NotNull(message = "验证码用途不能为空")
    private CaptchaPurpose purpose;
}
