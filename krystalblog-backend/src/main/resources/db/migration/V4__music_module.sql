-- 歌手表
CREATE TABLE artists (
  id         BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name       VARCHAR(200) NOT NULL COMMENT '歌手名称',
  bio        TEXT COMMENT '歌手简介',
  avatar     VARCHAR(500) COMMENT '歌手头像',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='歌手表';

-- 专辑表
CREATE TABLE albums (
  id           BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  title        VARCHAR(200) NOT NULL COMMENT '专辑名称',
  cover        VARCHAR(500) COMMENT '专辑封面',
  artist_id    BIGINT       NOT NULL COMMENT '歌手ID',
  release_date DATE COMMENT '发行日期',
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_artist_id (artist_id),
  FOREIGN KEY (artist_id) REFERENCES artists(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='专辑表';

-- 音乐分类表
CREATE TABLE song_categories (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name        VARCHAR(100) UNIQUE NOT NULL COMMENT '分类名称',
  slug        VARCHAR(100) UNIQUE NOT NULL COMMENT '分类标识',
  description TEXT COMMENT '分类描述',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='音乐分类表';

-- 歌曲表
CREATE TABLE songs (
  id               BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  title            VARCHAR(200) NOT NULL COMMENT '歌曲名称',
  slug             VARCHAR(200) UNIQUE NOT NULL COMMENT '歌曲标识',
  description      TEXT COMMENT '歌曲描述',
  cover            VARCHAR(500) COMMENT '歌曲封面',
  audio_url        VARCHAR(500) NOT NULL COMMENT '音频URL',
  duration         INTEGER COMMENT '歌曲时长（秒）',
  lyrics           TEXT COMMENT '歌词文本',
  lyrics_url       VARCHAR(500) COMMENT '歌词文件URL',
  artist_id        BIGINT       NOT NULL COMMENT '歌手ID',
  album_id         BIGINT COMMENT '专辑ID',
  category_id      BIGINT       NOT NULL COMMENT '分类ID',
  plays            BIGINT       DEFAULT 0 COMMENT '播放次数',
  status           VARCHAR(20)  DEFAULT 'PUBLISHED' NOT NULL COMMENT '状态：DRAFT-草稿，PUBLISHED-已发布',
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_artist_id (artist_id),
  INDEX idx_album_id (album_id),
  INDEX idx_category_id (category_id),
  FOREIGN KEY (artist_id) REFERENCES artists(id),
  FOREIGN KEY (album_id) REFERENCES albums(id),
  FOREIGN KEY (category_id) REFERENCES song_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='歌曲表';

-- 插入默认音乐分类
INSERT INTO song_categories (name, slug, description) VALUES
('轻音乐', 'light-music', '轻松舒缓的音乐'),
('流行', 'pop', '流行音乐'),
('古典', 'classical', '古典音乐'),
('爵士', 'jazz', '爵士音乐'),
('民谣', 'folk', '民谣音乐'),
('电子', 'electronic', '电子音乐');
