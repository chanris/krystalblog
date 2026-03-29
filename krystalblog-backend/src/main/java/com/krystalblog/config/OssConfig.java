package com.krystalblog.config;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Slf4j
@Configuration
@EnableConfigurationProperties(OssProperties.class)
public class OssConfig {

    @Bean(destroyMethod = "shutdown")
    @ConditionalOnProperty(prefix = "app.oss", name = "enabled", havingValue = "true")
    public OSS ossClient(OssProperties properties) {
        if (!StringUtils.hasText(properties.getEndpoint())) {
            throw new IllegalStateException("app.oss.endpoint 不能为空（或未设置 OSS_ENDPOINT 环境变量）");
        }
        if (!StringUtils.hasText(properties.getBucket())) {
            throw new IllegalStateException("app.oss.bucket 不能为空（或未设置 OSS_BUCKET 环境变量）");
        }
        if (!StringUtils.hasText(properties.getAccessKeyId())) {
            throw new IllegalStateException("app.oss.access-key-id 不能为空（或未设置 OSS_ACCESS_KEY_ID 环境变量）");
        }
        if (!StringUtils.hasText(properties.getAccessKeySecret())) {
            throw new IllegalStateException("app.oss.access-key-secret 不能为空（或未设置 OSS_ACCESS_KEY_SECRET 环境变量）");
        }
        log.info(
                "OSS已启用：endpoint={}, bucket={}, cdnDomain={}, encryptionEnabled={}, encryptionType={}",
                properties.getEndpoint(),
                properties.getBucket(),
                properties.getCdnDomain(),
                properties.getEncryption() != null && properties.getEncryption().isEnabled(),
                properties.getEncryption() != null ? properties.getEncryption().getType() : null
        );
        return new OSSClientBuilder().build(
                properties.getEndpoint(),
                properties.getAccessKeyId(),
                properties.getAccessKeySecret()
        );
    }
}
