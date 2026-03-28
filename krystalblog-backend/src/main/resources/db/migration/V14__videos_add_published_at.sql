ALTER TABLE videos
  ADD COLUMN published_at TIMESTAMP NULL COMMENT '发布时间' AFTER comments_count,
  ADD INDEX idx_published_at (published_at);

UPDATE videos
SET published_at = created_at
WHERE status = 'PUBLISHED'
  AND published_at IS NULL;
