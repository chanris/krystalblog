-- 歌单表
CREATE TABLE playlists (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name        VARCHAR(200) NOT NULL COMMENT '歌单名称',
  description TEXT COMMENT '歌单描述',
  cover_image VARCHAR(500) COMMENT '封面图',
  user_id     BIGINT       NOT NULL COMMENT '创建用户ID',
  is_public   BOOLEAN      DEFAULT TRUE COMMENT '是否公开',
  type        VARCHAR(20)  DEFAULT 'NORMAL' COMMENT '歌单类型：NORMAL-普通，LIKED-我的喜欢',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (user_id),
  INDEX idx_user_type (user_id, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='歌单表';

-- 歌单-歌曲关联表
CREATE TABLE playlist_music (
  id          BIGINT    PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  playlist_id BIGINT    NOT NULL COMMENT '歌单ID',
  music_id    BIGINT    NOT NULL COMMENT '歌曲ID',
  sort_order  INT       DEFAULT 0 COMMENT '排序',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_playlist_id (playlist_id),
  INDEX idx_music_id (music_id),
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (music_id) REFERENCES songs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='歌单-歌曲关联表';
