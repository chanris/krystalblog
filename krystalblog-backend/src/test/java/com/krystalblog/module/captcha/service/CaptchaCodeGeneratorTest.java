package com.krystalblog.module.captcha.service;

import com.krystalblog.module.captcha.enums.CaptchaType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CaptchaCodeGeneratorTest {

    private final CaptchaCodeGenerator generator = new CaptchaCodeGenerator();

    @Test
    void generateImageCodeShouldBeAlphanumericWithExpectedLength() {
        String code = generator.generate(CaptchaType.IMAGE, 5);
        assertEquals(5, code.length());
        assertTrue(code.matches("^[0-9A-Za-z]{5}$"));
    }

    @Test
    void normalizeShouldTrimAndUppercase() {
        assertEquals("AB12", generator.normalize("  ab12 "));
        assertEquals("", generator.normalize(null));
    }
}
