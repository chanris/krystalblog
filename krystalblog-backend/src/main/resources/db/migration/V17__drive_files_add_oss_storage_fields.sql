ALTER TABLE drive_files
  ADD COLUMN storage_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL' COMMENT '存储提供方：LOCAL/OSS' AFTER file_url,
  ADD COLUMN object_key VARCHAR(800) NULL COMMENT 'OSS对象Key（与网盘虚拟路径一致）' AFTER storage_provider,
  ADD COLUMN bucket VARCHAR(100) NULL COMMENT 'OSS Bucket（可选）' AFTER object_key,
  ADD COLUMN etag VARCHAR(128) NULL COMMENT 'OSS ETag（可选）' AFTER bucket,
  ADD COLUMN checksum_sha256 VARCHAR(64) NULL COMMENT '文件SHA256（可选）' AFTER etag,
  ADD COLUMN last_accessed_at TIMESTAMP NULL COMMENT '最后访问时间（用于生命周期/归档统计）' AFTER checksum_sha256,
  ADD INDEX idx_storage_provider (storage_provider),
  ADD INDEX idx_object_key (object_key(512));

UPDATE drive_files
SET storage_provider = 'LOCAL'
WHERE storage_provider IS NULL;
