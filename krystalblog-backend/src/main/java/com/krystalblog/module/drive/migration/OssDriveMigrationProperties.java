package com.krystalblog.module.drive.migration;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.oss.migration")
public class OssDriveMigrationProperties {
    private boolean run = false;
    private int batchSize = 200;
    private int maxRetries = 3;
    private String reportPath;
}

