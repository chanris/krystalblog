package com.krystalblog.module.captcha.service;

import com.krystalblog.common.exception.BusinessException;
import com.krystalblog.common.result.ResultCode;
import com.krystalblog.common.util.RequestIpUtil;
import com.krystalblog.module.captcha.dto.CaptchaGenerateDTO;
import com.krystalblog.module.captcha.dto.CaptchaVerifyDTO;
import com.krystalblog.module.captcha.enums.CaptchaPurpose;
import com.krystalblog.module.captcha.enums.CaptchaType;
import com.krystalblog.module.captcha.service.store.CaptchaStore;
import com.krystalblog.module.captcha.vo.CaptchaGenerateVO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CaptchaService {

    private final CaptchaStore captchaStore;
    private final CaptchaCodeGenerator captchaCodeGenerator;
    private final CaptchaImageRenderer captchaImageRenderer;

    @Value("${app.captcha.ttl-seconds:300}")
    private long ttlSeconds;

    @Value("${app.captcha.default-length:5}")
    private int defaultLength;

    @Value("${app.captcha.fail.max:3}")
    private int maxFailAttempts;

    @Value("${app.captcha.fail.lock-seconds:60}")
    private long lockSeconds;

    @Value("${app.captcha.rate-limit.generate-per-ip-per-minute:30}")
    private long generatePerIpPerMinute;

    @Value("${app.captcha.bind-ip:true}")
    private boolean bindIp;

    @Value("${app.captcha.debug-expose-code:false}")
    private boolean debugExposeCode;

    public CaptchaGenerateVO generate(CaptchaGenerateDTO dto) {
        String ip = RequestIpUtil.getClientIp();
        applyGenerateRateLimit(ip, dto.getPurpose());

        CaptchaType type = dto.getType();
        int length = normalizeLength(dto.getLength());
        String captchaId = UUID.randomUUID().toString().replace("-", "");
        String code = captchaCodeGenerator.generate(type, length);
        CaptchaRecord record = new CaptchaRecord(captchaCodeGenerator.normalize(code), ip, dto.getPurpose(), type);
        captchaStore.set(captchaKey(captchaId), record, Duration.ofSeconds(ttlSeconds));

        CaptchaGenerateVO.CaptchaGenerateVOBuilder builder = CaptchaGenerateVO.builder()
                .captchaId(captchaId)
                .type(type)
                .expiresInSeconds(ttlSeconds);

        builder.imageBase64(captchaImageRenderer.renderBase64Png(code));
        if (debugExposeCode) {
            builder.debugCode(code);
        }

        log.info("captcha_generate ip={} captchaId={} purpose={} type={}", ip, captchaId, dto.getPurpose(), type);
        return builder.build();
    }

    public void verifyAndConsume(CaptchaVerifyDTO dto) {
        verifyAndConsume(dto.getCaptchaId(), dto.getCode(), dto.getPurpose());
    }

    public void verifyAndConsume(String captchaId, String code, CaptchaPurpose purpose) {
        String ip = RequestIpUtil.getClientIp();

        if (captchaId == null || captchaId.isBlank() || code == null || code.isBlank()) {
            throw new BusinessException(ResultCode.CAPTCHA_REQUIRED);
        }

        ensureNotLocked(ip, purpose);

        CaptchaRecord record = loadCaptchaRecord(captchaId);
        if (record == null) {
            log.info("captcha_verify_fail ip={} captchaId={} purpose={} reason=expired", ip, captchaId, purpose);
            throw new BusinessException(ResultCode.CAPTCHA_EXPIRED);
        }
        if (record.getPurpose() != purpose) {
            log.info("captcha_verify_fail ip={} captchaId={} purpose={} reason=purpose_mismatch storedPurpose={}", ip, captchaId, purpose, record.getPurpose());
            throw new BusinessException(ResultCode.CAPTCHA_INVALID);
        }
        if (bindIp && record.getIp() != null && !"unknown".equals(record.getIp()) && !record.getIp().equals(ip)) {
            log.info("captcha_verify_fail ip={} captchaId={} purpose={} reason=ip_mismatch storedIp={}", ip, captchaId, purpose, record.getIp());
            throw new BusinessException(ResultCode.CAPTCHA_INVALID);
        }

        String normalizedInput = captchaCodeGenerator.normalize(code);
        if (!record.getCode().equals(normalizedInput)) {
            long fails = captchaStore.increment(failKey(ip, purpose), Duration.ofSeconds(ttlSeconds));
            if (fails >= maxFailAttempts) {
                captchaStore.set(lockKey(ip, purpose), "1", Duration.ofSeconds(lockSeconds));
                log.info("captcha_verify_locked ip={} purpose={} fails={}", ip, purpose, fails);
                throw new BusinessException(ResultCode.CAPTCHA_LOCKED, "验证码输入错误次数过多，请60秒后再试");
            }
            log.info("captcha_verify_fail ip={} captchaId={} purpose={} fails={}", ip, captchaId, purpose, fails);
            throw new BusinessException(ResultCode.CAPTCHA_INVALID);
        }

        captchaStore.delete(captchaKey(captchaId));
        captchaStore.delete(failKey(ip, purpose));
        log.info("captcha_verify_success ip={} captchaId={} purpose={}", ip, captchaId, purpose);
    }

    private void ensureNotLocked(String ip, CaptchaPurpose purpose) {
        Optional<Object> lock = captchaStore.get(lockKey(ip, purpose));
        if (lock.isPresent()) {
            throw new BusinessException(ResultCode.CAPTCHA_LOCKED, "验证码输入错误次数过多，请60秒后再试");
        }
    }

    private void applyGenerateRateLimit(String ip, CaptchaPurpose purpose) {
        long current = captchaStore.increment(rateKey(ip, purpose), Duration.ofMinutes(1));
        if (current > generatePerIpPerMinute) {
            throw new BusinessException(ResultCode.TOO_MANY_REQUESTS, "验证码请求过于频繁，请稍后再试");
        }
    }

    private CaptchaRecord loadCaptchaRecord(String captchaId) {
        Optional<Object> value = captchaStore.get(captchaKey(captchaId));
        if (value.isEmpty()) {
            return null;
        }
        Object obj = value.get();
        if (obj instanceof CaptchaRecord record) {
            return record;
        }
        return null;
    }

    private int normalizeLength(Integer length) {
        int resolved = length == null ? defaultLength : length;
        if (resolved < 4) {
            return 4;
        }
        if (resolved > 6) {
            return 6;
        }
        return resolved;
    }

    private String captchaKey(String captchaId) {
        return "captcha:code:" + captchaId;
    }

    private String failKey(String ip, CaptchaPurpose purpose) {
        return "captcha:fail:" + purpose.name() + ":" + ip;
    }

    private String lockKey(String ip, CaptchaPurpose purpose) {
        return "captcha:lock:" + purpose.name() + ":" + ip;
    }

    private String rateKey(String ip, CaptchaPurpose purpose) {
        return "captcha:rate:generate:" + purpose.name() + ":" + ip;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CaptchaRecord {
        private String code;
        private String ip;
        private CaptchaPurpose purpose;
        private CaptchaType type;
    }
}
