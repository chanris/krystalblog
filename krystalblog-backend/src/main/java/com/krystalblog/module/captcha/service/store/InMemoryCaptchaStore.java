package com.krystalblog.module.captcha.service.store;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
@ConditionalOnProperty(name = "app.captcha.store", havingValue = "memory")
public class InMemoryCaptchaStore implements CaptchaStore {

    private static final class Entry {
        private final Object value;
        private final Instant expiresAt;

        private Entry(Object value, Instant expiresAt) {
            this.value = value;
            this.expiresAt = expiresAt;
        }
    }

    private final ConcurrentHashMap<String, Entry> store = new ConcurrentHashMap<>();

    @Override
    public void set(String key, Object value, Duration ttl) {
        store.put(key, new Entry(value, Instant.now().plus(ttl)));
    }

    @Override
    public Optional<Object> get(String key) {
        Entry entry = store.get(key);
        if (entry == null) {
            return Optional.empty();
        }
        if (Instant.now().isAfter(entry.expiresAt)) {
            store.remove(key, entry);
            return Optional.empty();
        }
        return Optional.of(entry.value);
    }

    @Override
    public boolean delete(String key) {
        return store.remove(key) != null;
    }

    @Override
    public long increment(String key, Duration ttl) {
        Instant now = Instant.now();
        return store.compute(key, (k, existing) -> {
            if (existing == null || now.isAfter(existing.expiresAt)) {
                return new Entry(1L, now.plus(ttl));
            }
            long current = (existing.value instanceof Number n) ? n.longValue() : 0L;
            return new Entry(current + 1L, existing.expiresAt);
        }).value instanceof Number n ? n.longValue() : 0L;
    }
}
