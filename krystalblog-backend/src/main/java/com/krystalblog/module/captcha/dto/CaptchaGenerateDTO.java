package com.krystalblog.module.captcha.dto;

import com.krystalblog.module.captcha.enums.CaptchaPurpose;
import com.krystalblog.module.captcha.enums.CaptchaType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CaptchaGenerateDTO {

    @NotNull(message = "验证码用途不能为空")
    private CaptchaPurpose purpose;

    @NotNull(message = "验证码类型不能为空")
    private CaptchaType type;

    private Integer length;
}
