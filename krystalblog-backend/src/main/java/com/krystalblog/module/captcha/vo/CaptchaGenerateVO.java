package com.krystalblog.module.captcha.vo;

import com.krystalblog.module.captcha.enums.CaptchaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaptchaGenerateVO {

    private String captchaId;
    private CaptchaType type;
    private Long expiresInSeconds;

    private String imageBase64;

    private String debugCode;
}
