# 网盘文件存储迁移：本地存储 → 阿里云 OSS

## 1. 目标与范围

- 迁移对象：所有网盘二进制文件（文档/图片/视频等）从本地 `./uploads` 迁移至 OSS
- 目录结构：OSS 对象 Key 与网盘虚拟路径保持一致
  - 用户个人目录：`user/{userId}/...`
  - 目录层级：基于网盘文件夹链路拼接（`folder.name` 作为路径段）

## 2. 配置

在 `application.yml` 中配置：

```yaml
app:
  oss:
    enabled: true
    endpoint: https://oss-cn-xxx.aliyuncs.com
    bucket: your-bucket
    access-key-id: ${OSS_ACCESS_KEY_ID}
    access-key-secret: ${OSS_ACCESS_KEY_SECRET}
    cdn-domain: https://cdn.example.com
    encryption:
      enabled: true
      type: AES256
      kms-key-id:
    presign:
      download-ttl-seconds: 600
      preview-ttl-seconds: 600
    multipart:
      part-size-bytes: 8388608
      max-parts: 10000
```

## 3. API 改造点

### 3.1 上传（服务端直传 OSS）

- `POST /api/drive/files/upload`（multipart）
  - OSS 启用时：服务端直接写入 OSS，并在数据库保存 `storageProvider=OSS`、`objectKey`
  - OSS 未启用：保持原行为写入本地 `./uploads`

### 3.2 下载（OSS 临时 URL）

- `GET /api/drive/files/{id}/download`
  - OSS 文件：302 重定向到 OSS 预签名下载 URL
  - 本地文件：保持原行为（以附件方式返回）

- `GET /api/drive/files/{id}/download-url`
  - 返回下载 URL（OSS 为预签名 URL，本地为原 `fileUrl`）

### 3.3 预览（OSS 临时 URL）

- `GET /api/drive/files/{id}/preview-url`
  - 返回预览 URL（OSS 为预签名 URL，inline；本地为原 `fileUrl`）

### 3.4 分片上传 / 断点续传（后端代理 OSS Multipart）

- `POST /api/drive/files/multipart/initiate`
  - 入参：`fileName`、`fileType`、`folderId`
  - 出参：`uploadId`、`objectKey`、`partSizeBytes`

- `POST /api/drive/files/multipart/upload-part`（multipart/form-data）
  - 入参：`uploadId`、`objectKey`、`partNumber`、`file`（分片内容）
  - 出参：`etag`
  - 服务端会在 Redis 中记录已上传分片信息（用于断点续传）

- `POST /api/drive/files/multipart/complete`
  - 入参：`uploadId`、`objectKey`、`fileName`、`fileType`、`fileSize`、`folderId`、`parts[{partNumber,etag}]`
  - 出参：创建后的 `DriveFileVO`

## 4. 数据迁移（分批、可重试、保留本地备份）

启用 OSS 后，执行迁移 runner（不会删除本地文件）：

```bash
mvn -q -DskipTests spring-boot:run \
  -Dspring-boot.run.arguments="--spring.main.web-application-type=none --app.oss.enabled=true --app.oss.migration.run=true --app.oss.migration.report-path=./oss_migration_report.jsonl"
```

可用参数：

```yaml
app:
  oss:
    migration:
      run: true
      batch-size: 200
      max-retries: 3
      report-path: ./oss_migration_report.jsonl
```

迁移报告为 JSON Lines，每行一条记录，包含：

- `status`: SUCCESS / FAILED / SKIPPED_LOCAL_MISSING / SUCCESS_SIZE_MISMATCH
- `localSha256`: 本地文件 SHA256
- `remoteSize`: OSS Head 返回的大小
- `sizeMatch`: 大小是否一致

## 5. 生命周期/归档与 CDN

生命周期（30 天未访问自动归档）与 CDN 加速需在阿里云侧完成：

- 生命周期：在 OSS Bucket 规则中配置（基于最后访问时间）
- CDN：配置 OSS 为源站并绑定域名，按业务需要配置鉴权/回源策略

