package com.krystalblog.module.drive.service.storage;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OssMultipartSessionService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public void saveSession(String uploadId, String objectKey, long partSizeBytes) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("objectKey", objectKey);
        payload.put("partSizeBytes", partSizeBytes);
        payload.put("parts", new HashMap<String, String>());
        put(uploadId, payload, Duration.ofHours(24));
    }

    public void savePart(String uploadId, int partNumber, String etag) {
        Map<String, Object> payload = get(uploadId);
        if (payload == null) return;
        Object partsObj = payload.get("parts");
        Map<String, String> parts = new HashMap<>();
        if (partsObj instanceof Map<?, ?> rawParts) {
            for (Map.Entry<?, ?> entry : rawParts.entrySet()) {
                if (entry.getKey() == null || entry.getValue() == null) continue;
                parts.put(String.valueOf(entry.getKey()), String.valueOf(entry.getValue()));
            }
        }
        parts.put(String.valueOf(partNumber), etag);
        payload.put("parts", parts);
        put(uploadId, payload, Duration.ofHours(24));
    }

    public Map<String, Object> get(String uploadId) {
        String raw = redisTemplate.opsForValue().get(key(uploadId));
        if (raw == null) return null;
        try {
            return objectMapper.readValue(raw, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return null;
        }
    }

    public void delete(String uploadId) {
        redisTemplate.delete(key(uploadId));
    }

    private void put(String uploadId, Map<String, Object> payload, Duration ttl) {
        try {
            String raw = objectMapper.writeValueAsString(payload);
            redisTemplate.opsForValue().set(key(uploadId), raw, ttl);
        } catch (Exception ignored) {
        }
    }

    private String key(String uploadId) {
        return "drive:oss:multipart:" + uploadId;
    }
}
