ALTER TABLE video_categories
ADD COLUMN sort_order INTEGER DEFAULT 0 COMMENT '排序' AFTER description;

UPDATE video_categories
SET sort_order = id
WHERE sort_order IS NULL OR sort_order = 0;
