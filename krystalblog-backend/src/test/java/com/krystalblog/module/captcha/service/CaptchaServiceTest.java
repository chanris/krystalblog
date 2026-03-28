package com.krystalblog.module.captcha.service;

import com.krystalblog.common.exception.BusinessException;
import com.krystalblog.module.captcha.dto.CaptchaGenerateDTO;
import com.krystalblog.module.captcha.enums.CaptchaPurpose;
import com.krystalblog.module.captcha.enums.CaptchaType;
import com.krystalblog.module.captcha.service.store.InMemoryCaptchaStore;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

class CaptchaServiceTest {

    private CaptchaService buildService(long generatePerMinute) {
        CaptchaService service = new CaptchaService(new InMemoryCaptchaStore(), new CaptchaCodeGenerator(), new CaptchaImageRenderer());
        ReflectionTestUtils.setField(service, "ttlSeconds", 300L);
        ReflectionTestUtils.setField(service, "defaultLength", 5);
        ReflectionTestUtils.setField(service, "maxFailAttempts", 3);
        ReflectionTestUtils.setField(service, "lockSeconds", 60L);
        ReflectionTestUtils.setField(service, "generatePerIpPerMinute", generatePerMinute);
        ReflectionTestUtils.setField(service, "bindIp", false);
        ReflectionTestUtils.setField(service, "debugExposeCode", true);
        return service;
    }

    @Test
    void verifyShouldConsumeCaptchaAndBeCaseInsensitive() {
        CaptchaService service = buildService(100);
        CaptchaGenerateDTO dto = new CaptchaGenerateDTO();
        dto.setPurpose(CaptchaPurpose.LOGIN);
        dto.setType(CaptchaType.IMAGE);
        dto.setLength(4);
        var generated = service.generate(dto);

        service.verifyAndConsume(generated.getCaptchaId(), generated.getDebugCode().toLowerCase(), CaptchaPurpose.LOGIN);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> service.verifyAndConsume(generated.getCaptchaId(), generated.getDebugCode(), CaptchaPurpose.LOGIN));
        assertEquals(1103, exception.getCode());
    }

    @Test
    void verifyShouldLockAfterThreeFailures() {
        CaptchaService service = buildService(100);
        CaptchaGenerateDTO dto = new CaptchaGenerateDTO();
        dto.setPurpose(CaptchaPurpose.LOGIN);
        dto.setType(CaptchaType.IMAGE);
        dto.setLength(4);
        var generated = service.generate(dto);

        assertThrows(BusinessException.class,
                () -> service.verifyAndConsume(generated.getCaptchaId(), "0000", CaptchaPurpose.LOGIN));
        assertThrows(BusinessException.class,
                () -> service.verifyAndConsume(generated.getCaptchaId(), "0000", CaptchaPurpose.LOGIN));

        BusinessException locked = assertThrows(BusinessException.class,
                () -> service.verifyAndConsume(generated.getCaptchaId(), "0000", CaptchaPurpose.LOGIN));
        assertEquals(1104, locked.getCode());
    }

    @Test
    void generateShouldApplyRateLimitPerIpPerMinute() {
        CaptchaService service = buildService(1);
        CaptchaGenerateDTO dto = new CaptchaGenerateDTO();
        dto.setPurpose(CaptchaPurpose.REGISTER);
        dto.setType(CaptchaType.IMAGE);
        dto.setLength(5);

        service.generate(dto);

        BusinessException exception = assertThrows(BusinessException.class, () -> service.generate(dto));
        assertEquals(429, exception.getCode());
    }

    @Test
    void generateShouldBeStableUnderConcurrency() throws Exception {
        CaptchaService service = buildService(100000);
        int threads = 30;
        int perThread = 20;
        var executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);

        for (int i = 0; i < threads; i++) {
            executor.execute(() -> {
                try {
                    for (int j = 0; j < perThread; j++) {
                        CaptchaGenerateDTO dto = new CaptchaGenerateDTO();
                        dto.setPurpose(CaptchaPurpose.LOGIN);
                        dto.setType(CaptchaType.IMAGE);
                        dto.setLength(5);
                        var vo = service.generate(dto);
                        assertNotNull(vo.getCaptchaId());
                        assertNotNull(vo.getImageBase64());
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        assertTrue(latch.await(10, TimeUnit.SECONDS));
        executor.shutdownNow();
    }
}
