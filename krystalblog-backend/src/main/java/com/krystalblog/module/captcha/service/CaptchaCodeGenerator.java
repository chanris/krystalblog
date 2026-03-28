package com.krystalblog.module.captcha.service;

import com.krystalblog.module.captcha.enums.CaptchaType;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Locale;

@Component
public class CaptchaCodeGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    private static final String IMAGE_CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";

    public String generate(CaptchaType type, int length) {
        StringBuilder sb = new StringBuilder(length);
        String charset = IMAGE_CHARSET;
        for (int i = 0; i < length; i++) {
            sb.append(charset.charAt(RANDOM.nextInt(charset.length())));
        }
        return sb.toString();
    }

    public String normalize(String code) {
        return code == null ? "" : code.trim().toUpperCase(Locale.ROOT);
    }
}
