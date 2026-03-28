-- 删除 songs 表所有外键，允许 artist_id 和 category_id 为 NULL
-- 旧 V9 已删除 songs_ibfk_1(artist_id) 和 songs_ibfk_2(album_id)，并添加了 fk_songs_artist 和 fk_songs_category
-- 需要清理旧 V9 添加的外键 + 原始的 songs_ibfk_3(category_id)
ALTER TABLE songs DROP FOREIGN KEY fk_songs_artist;
ALTER TABLE songs DROP FOREIGN KEY fk_songs_category;
ALTER TABLE songs DROP FOREIGN KEY songs_ibfk_3;
ALTER TABLE songs MODIFY COLUMN artist_id BIGINT NULL COMMENT '歌手ID';
ALTER TABLE songs MODIFY COLUMN category_id BIGINT NULL COMMENT '分类ID';
