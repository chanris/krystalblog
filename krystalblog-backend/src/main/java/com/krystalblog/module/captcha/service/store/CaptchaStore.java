package com.krystalblog.module.captcha.service.store;

import java.time.Duration;
import java.util.Optional;

public interface CaptchaStore {

    void set(String key, Object value, Duration ttl);

    Optional<Object> get(String key);

    boolean delete(String key);

    long increment(String key, Duration ttl);
}
