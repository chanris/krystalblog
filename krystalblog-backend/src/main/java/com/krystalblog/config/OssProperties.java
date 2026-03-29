package com.krystalblog.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.oss")
public class OssProperties {
    private boolean enabled = false;
    private String endpoint;
    private String bucket;
    private String accessKeyId;
    private String accessKeySecret;
    private String cdnDomain;

    private Encryption encryption = new Encryption();
    private Presign presign = new Presign();
    private Multipart multipart = new Multipart();

    @Data
    public static class Encryption {
        private boolean enabled = true;
        private String type = "AES256";
        private String kmsKeyId;
    }

    @Data
    public static class Presign {
        private long downloadTtlSeconds = 600;
        private long previewTtlSeconds = 600;
    }

    @Data
    public static class Multipart {
        private long partSizeBytes = 8 * 1024 * 1024;
        private int maxParts = 10000;
    }
}

