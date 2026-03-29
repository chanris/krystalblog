ALTER TABLE drive_files
  ADD COLUMN reference_count BIGINT NOT NULL DEFAULT 0 COMMENT '被业务模块引用次数' AFTER download_count,
  ADD INDEX idx_reference_count (reference_count);

ALTER TABLE songs
  ADD COLUMN drive_file_id BIGINT NULL COMMENT '关联网盘文件ID（可选）' AFTER audio_url,
  ADD COLUMN audio_mime_type VARCHAR(255) NULL COMMENT '音频MIME类型（可选）' AFTER drive_file_id,
  ADD COLUMN audio_size_bytes BIGINT NULL COMMENT '音频大小（字节）（可选）' AFTER audio_mime_type,
  ADD COLUMN audio_bitrate_kbps INT NULL COMMENT '音频码率kbps（可选）' AFTER audio_size_bytes,
  ADD INDEX idx_songs_drive_file_id (drive_file_id);

ALTER TABLE videos
  ADD COLUMN drive_file_id BIGINT NULL COMMENT '关联网盘文件ID（可选）' AFTER video_url,
  ADD COLUMN video_mime_type VARCHAR(255) NULL COMMENT '视频MIME类型（可选）' AFTER drive_file_id,
  ADD COLUMN video_size_bytes BIGINT NULL COMMENT '视频大小（字节）（可选）' AFTER video_mime_type,
  ADD COLUMN width INT NULL COMMENT '视频宽（可选）' AFTER video_size_bytes,
  ADD COLUMN height INT NULL COMMENT '视频高（可选）' AFTER width,
  ADD COLUMN video_bitrate_kbps INT NULL COMMENT '视频码率kbps（可选）' AFTER height,
  ADD INDEX idx_videos_drive_file_id (drive_file_id);
