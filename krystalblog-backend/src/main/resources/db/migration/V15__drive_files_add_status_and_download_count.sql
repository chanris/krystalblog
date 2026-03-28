ALTER TABLE drive_files
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE-可用，DELETED-已删除' AFTER uploaded_by_id,
  ADD COLUMN download_count BIGINT DEFAULT 0 COMMENT '下载次数' AFTER status,
  ADD INDEX idx_status (status);

UPDATE drive_files
SET status = 'ACTIVE'
WHERE status IS NULL;

UPDATE drive_files
SET download_count = 0
WHERE download_count IS NULL;
