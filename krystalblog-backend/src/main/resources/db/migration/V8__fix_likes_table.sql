-- 为 likes 表补充 updated_at 字段，与 BaseEntity 保持一致
ALTER TABLE likes ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间' AFTER created_at;
