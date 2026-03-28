-- 移除 albums 表上 artist_id 的外键约束，改为应用层维护引用关系
ALTER TABLE albums DROP FOREIGN KEY albums_ibfk_1;

-- 移除 song_tags 表上 song_id 的外键约束
ALTER TABLE song_tags DROP FOREIGN KEY song_tags_ibfk_1;
