-- 视频分类表
CREATE TABLE video_categories (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name        VARCHAR(100) UNIQUE NOT NULL COMMENT '分类名称',
  slug        VARCHAR(100) UNIQUE NOT NULL COMMENT '分类标识',
  description TEXT COMMENT '分类描述',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频分类表';

-- 视频标签表
CREATE TABLE video_tags (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name        VARCHAR(100) UNIQUE NOT NULL COMMENT '标签名称',
  slug        VARCHAR(100) UNIQUE NOT NULL COMMENT '标签标识',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频标签表';

-- 视频表
CREATE TABLE videos (
  id               BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  title            VARCHAR(200) NOT NULL COMMENT '视频标题',
  slug             VARCHAR(200) UNIQUE NOT NULL COMMENT '视频标识',
  description      TEXT COMMENT '视频描述',
  thumbnail        VARCHAR(500) COMMENT '缩略图URL',
  video_url        VARCHAR(500) NOT NULL COMMENT '视频URL',
  duration         INTEGER COMMENT '视频时长（秒）',
  category_id      BIGINT       NOT NULL COMMENT '分类ID',
  author_id        BIGINT       NOT NULL COMMENT '作者ID',
  views            BIGINT       DEFAULT 0 COMMENT '播放数',
  likes_count      BIGINT       DEFAULT 0 COMMENT '点赞数',
  comments_count   BIGINT       DEFAULT 0 COMMENT '评论数',
  status           VARCHAR(20)  DEFAULT 'PUBLISHED' NOT NULL COMMENT '状态：DRAFT-草稿，PUBLISHED-已发布，PROCESSING-处理中',
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_category_id (category_id),
  INDEX idx_author_id (author_id),
  FOREIGN KEY (category_id) REFERENCES video_categories(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频表';

-- 视频-标签关联表
CREATE TABLE video_video_tags (
  video_id  BIGINT NOT NULL COMMENT '视频ID',
  tag_id    BIGINT NOT NULL COMMENT '标签ID',
  PRIMARY KEY (video_id, tag_id),
  INDEX idx_video_id (video_id),
  INDEX idx_tag_id (tag_id),
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES video_tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频-标签关联表';

-- 插入默认视频分类
INSERT INTO video_categories (name, slug, description) VALUES
('旅行', 'travel', '旅行相关视频'),
('技术', 'tech', '技术教程视频'),
('生活', 'life', '生活日常视频'),
('音乐', 'music', '音乐相关视频'),
('美食', 'food', '美食相关视频'),
('运动', 'sports', '运动健身视频');

-- 插入默认视频标签
INSERT INTO video_tags (name, slug) VALUES
('Vlog', 'vlog'), ('旅行', 'travel'), ('编程', 'coding'),
('美食', 'food'), ('健身', 'fitness'), ('摄影', 'photography'),
('音乐', 'music'), ('生活', 'life');
