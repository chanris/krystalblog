package com.krystalblog.module.drive.migration;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.krystalblog.entity.DriveFile;
import com.krystalblog.mapper.DriveFileMapper;
import com.krystalblog.module.drive.service.DriveFileService;
import com.krystalblog.module.drive.service.storage.OssStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.BufferedWriter;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Component
@RequiredArgsConstructor
@ConditionalOnBean(OssStorageService.class)
@ConditionalOnProperty(prefix = "app.oss.migration", name = "run", havingValue = "true")
@EnableConfigurationProperties(OssDriveMigrationProperties.class)
public class OssDriveMigrationRunner implements org.springframework.boot.CommandLineRunner {

    private final OssDriveMigrationProperties properties;
    private final DriveFileMapper driveFileMapper;
    private final DriveFileService driveFileService;
    private final OssStorageService ossStorageService;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        BufferedWriter reportWriter = null;
        if (StringUtils.hasText(properties.getReportPath())) {
            Path reportPath = Path.of(properties.getReportPath());
            Files.createDirectories(reportPath.getParent() != null ? reportPath.getParent() : Path.of("."));
            reportWriter = Files.newBufferedWriter(reportPath);
        }

        long total = driveFileMapper.selectCount(
                new LambdaQueryWrapper<DriveFile>()
                        .and(w -> w.isNull(DriveFile::getStorageProvider).or().eq(DriveFile::getStorageProvider, "LOCAL"))
        );

        long processed = 0L;
        Long lastId = 0L;
        while (true) {
            var batch = driveFileMapper.selectList(
                    new LambdaQueryWrapper<DriveFile>()
                            .and(w -> w.isNull(DriveFile::getStorageProvider).or().eq(DriveFile::getStorageProvider, "LOCAL"))
                            .gt(DriveFile::getId, lastId)
                            .orderByAsc(DriveFile::getId)
                            .last("LIMIT " + Math.max(1, properties.getBatchSize()))
            );

            if (batch == null || batch.isEmpty()) break;

            for (DriveFile file : batch) {
                lastId = file.getId();
                processed++;
                MigrationRecord record = migrateOne(file);
                if (reportWriter != null) {
                    reportWriter.write(objectMapper.writeValueAsString(record));
                    reportWriter.newLine();
                    reportWriter.flush();
                }
                if (processed % 50 == 0 || processed == total) {
                    System.out.println("[OSS迁移] processed=" + processed + "/" + total + " lastId=" + lastId);
                }
            }
        }

        if (reportWriter != null) {
            reportWriter.flush();
            reportWriter.close();
        }

        System.out.println("[OSS迁移] done processed=" + processed + "/" + total);
    }

    private MigrationRecord migrateOne(DriveFile file) {
        MigrationRecord record = new MigrationRecord();
        record.id = file.getId();
        record.fileName = file.getFileName();
        record.folderId = file.getFolderId();
        record.uploaderId = file.getUploaderId();
        record.localUrl = file.getFileUrl();
        record.startedAt = LocalDateTime.now().toString();

        var localPath = driveFileService.resolveLocalPath(file);
        if (localPath == null || !Files.exists(localPath)) {
            record.status = "SKIPPED_LOCAL_MISSING";
            record.finishedAt = LocalDateTime.now().toString();
            return record;
        }

        String objectKey = driveFileService.computeObjectKey(file);
        record.objectKey = objectKey;

        int attempt = 0;
        while (attempt < Math.max(1, properties.getMaxRetries())) {
            attempt++;
            try {
                long size = Files.size(localPath);
                String sha256 = sha256Hex(localPath);
                record.localSize = size;
                record.localSha256 = sha256;

                try (InputStream in = Files.newInputStream(localPath)) {
                    String etag = ossStorageService.putObject(objectKey, in, size, file.getFileType());
                    record.etag = etag;
                }

                Long remoteSize = ossStorageService.headObjectSize(objectKey);
                record.remoteSize = remoteSize;
                record.sizeMatch = remoteSize != null && remoteSize == size;

                DriveFile update = new DriveFile();
                update.setId(file.getId());
                update.setStorageProvider("OSS");
                update.setObjectKey(objectKey);
                update.setBucket(ossStorageService.getBucket());
                update.setEtag(record.etag);
                update.setChecksumSha256(sha256);
                update.setFileUrl(objectKey);
                update.setLastAccessedAt(LocalDateTime.now());
                driveFileMapper.updateById(update);

                record.status = record.sizeMatch ? "SUCCESS" : "SUCCESS_SIZE_MISMATCH";
                record.finishedAt = LocalDateTime.now().toString();
                return record;
            } catch (Exception e) {
                record.error = e.getClass().getSimpleName() + ":" + e.getMessage();
                record.attempts = attempt;
            }
        }

        record.status = "FAILED";
        record.finishedAt = LocalDateTime.now().toString();
        return record;
    }

    private String sha256Hex(Path path) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream in = Files.newInputStream(path)) {
            byte[] buf = new byte[1024 * 1024];
            int n;
            while ((n = in.read(buf)) > 0) {
                digest.update(buf, 0, n);
            }
        }
        return HexFormat.of().formatHex(digest.digest());
    }

    static class MigrationRecord {
        public Long id;
        public String fileName;
        public Long folderId;
        public Long uploaderId;
        public String localUrl;
        public String objectKey;
        public Long localSize;
        public String localSha256;
        public String etag;
        public Long remoteSize;
        public Boolean sizeMatch;
        public int attempts;
        public String status;
        public String error;
        public String startedAt;
        public String finishedAt;
    }
}

