-- 歌曲标签表
CREATE TABLE IF NOT EXISTS song_tags (
  id      BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  song_id BIGINT       NOT NULL COMMENT '歌曲ID',
  tag     VARCHAR(50)  NOT NULL COMMENT '标签名',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_song_id (song_id),
  INDEX idx_tag (tag),
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='歌曲标签';

-- 插入种子数据：歌手（仅在 artists 表为空时插入）
INSERT INTO artists (name, bio, avatar)
SELECT * FROM (
  SELECT 'Krystal' AS name, '独立音乐人，擅长轻音乐与民谣' AS bio, NULL AS avatar UNION ALL
  SELECT '月下弹琴', '古风钢琴演奏者', NULL UNION ALL
  SELECT '静谧时光', '爵士与氛围音乐制作人', NULL UNION ALL
  SELECT '晨曦音乐', '古典音乐演奏家', NULL UNION ALL
  SELECT '夜风轻抚', '电子音乐制作人', NULL
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM artists LIMIT 1);

-- 插入种子数据：专辑（仅在 albums 表为空时插入）
INSERT INTO albums (title, cover, artist_id)
SELECT seed.title, seed.cover, a.id
FROM (
  SELECT '清晨的声音' AS title, NULL AS cover, 'Krystal' AS artist_name UNION ALL
  SELECT '旅途随想', NULL, 'Krystal' UNION ALL
  SELECT '四季私语', NULL, '月下弹琴' UNION ALL
  SELECT '茶语', NULL, '月下弹琴' UNION ALL
  SELECT '夜色温柔', NULL, '静谧时光' UNION ALL
  SELECT '古典精选', NULL, '晨曦音乐' UNION ALL
  SELECT '雨声私语', NULL, '晨曦音乐' UNION ALL
  SELECT '梦境系列', NULL, '夜风轻抚'
) AS seed
JOIN artists a ON a.name = seed.artist_name
WHERE NOT EXISTS (SELECT 1 FROM albums LIMIT 1);

-- 插入种子数据：歌曲（仅在 songs 表为空时插入）
INSERT INTO songs (title, slug, audio_url, duration, artist_id, album_id, category_id, plays, status)
SELECT seed.title, seed.slug, '' AS audio_url, seed.duration, a.id, al.id, sc.id, seed.plays, 'PUBLISHED'
FROM (
  SELECT '晨光' AS title, 'chen-guang' AS slug, 222 AS duration, 'Krystal' AS artist_name, '清晨的声音' AS album_title, '轻音乐' AS category_name, 23456 AS plays UNION ALL
  SELECT '秋日私语', 'qiu-ri-si-yu', 258, '月下弹琴', '四季私语', '轻音乐', 18934 UNION ALL
  SELECT '深夜咖啡馆', 'shen-ye-ka-fei-guan', 305, '静谧时光', '夜色温柔', '爵士', 12765 UNION ALL
  SELECT '月光奏鸣曲', 'yue-guang-zou-ming-qu', 392, '晨曦音乐', '古典精选', '古典', 9876 UNION ALL
  SELECT '远方', 'yuan-fang', 235, 'Krystal', '旅途随想', '民谣', 15678 UNION ALL
  SELECT '星河入梦', 'xing-he-ru-meng', 284, '夜风轻抚', '梦境系列', '电子', 21345 UNION ALL
  SELECT '花间一壶茶', 'hua-jian-yi-hu-cha', 208, '月下弹琴', '茶语', '轻音乐', 8765 UNION ALL
  SELECT '雨夜钢琴曲', 'yu-ye-gang-qin-qu', 316, '晨曦音乐', '雨声私语', '古典', 34567
) AS seed
JOIN artists a ON a.name = seed.artist_name
JOIN albums al ON al.title = seed.album_title
JOIN song_categories sc ON sc.name = seed.category_name
WHERE NOT EXISTS (SELECT 1 FROM songs LIMIT 1);

-- 插入歌曲标签（仅在 song_tags 表为空时插入）
INSERT INTO song_tags (song_id, tag)
SELECT s.id, seed.tag
FROM (
  SELECT '晨光' AS song_title, '轻音乐' AS tag UNION ALL
  SELECT '晨光', '晨间' UNION ALL
  SELECT '晨光', '治愈' UNION ALL
  SELECT '秋日私语', '轻音乐' UNION ALL
  SELECT '秋日私语', '治愈' UNION ALL
  SELECT '秋日私语', '睡前' UNION ALL
  SELECT '深夜咖啡馆', '爵士' UNION ALL
  SELECT '深夜咖啡馆', '工作' UNION ALL
  SELECT '深夜咖啡馆', '治愈' UNION ALL
  SELECT '月光奏鸣曲', '古典' UNION ALL
  SELECT '月光奏鸣曲', '睡前' UNION ALL
  SELECT '月光奏鸣曲', '治愈' UNION ALL
  SELECT '远方', '民谣' UNION ALL
  SELECT '远方', '晨间' UNION ALL
  SELECT '远方', '治愈' UNION ALL
  SELECT '星河入梦', '电子' UNION ALL
  SELECT '星河入梦', '睡前' UNION ALL
  SELECT '星河入梦', '工作' UNION ALL
  SELECT '花间一壶茶', '轻音乐' UNION ALL
  SELECT '花间一壶茶', '治愈' UNION ALL
  SELECT '花间一壶茶', '工作' UNION ALL
  SELECT '雨夜钢琴曲', '古典' UNION ALL
  SELECT '雨夜钢琴曲', '治愈' UNION ALL
  SELECT '雨夜钢琴曲', '睡前'
) AS seed
JOIN songs s ON s.title = seed.song_title
WHERE NOT EXISTS (SELECT 1 FROM song_tags LIMIT 1);
