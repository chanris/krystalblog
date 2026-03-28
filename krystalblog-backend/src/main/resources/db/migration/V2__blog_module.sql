-- 分类表
CREATE TABLE categories (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name        VARCHAR(100) UNIQUE NOT NULL COMMENT '分类名称',
  slug        VARCHAR(100) UNIQUE NOT NULL COMMENT '分类标识',
  description TEXT COMMENT '分类描述',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章分类表';

-- 标签表
CREATE TABLE tags (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name        VARCHAR(100) UNIQUE NOT NULL COMMENT '标签名称',
  slug        VARCHAR(100) UNIQUE NOT NULL COMMENT '标签标识',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章标签表';

-- 文章表
CREATE TABLE articles (
  id               BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  title            VARCHAR(200) NOT NULL COMMENT '文章标题',
  slug             VARCHAR(200) UNIQUE NOT NULL COMMENT '文章标识',
  excerpt          TEXT COMMENT '文章摘要',
  content          TEXT         NOT NULL COMMENT '文章内容',
  cover_image      VARCHAR(500) COMMENT '封面图片URL',
  category_id      BIGINT       NOT NULL COMMENT '分类ID',
  author_id        BIGINT       NOT NULL COMMENT '作者ID',
  status           VARCHAR(20)  DEFAULT 'DRAFT' NOT NULL COMMENT '状态：DRAFT-草稿，PUBLISHED-已发布，SCHEDULED-定时发布',
  views            BIGINT       DEFAULT 0 COMMENT '阅读数',
  likes_count      BIGINT       DEFAULT 0 COMMENT '点赞数',
  comments_count   BIGINT       DEFAULT 0 COMMENT '评论数',
  published_at     TIMESTAMP    NULL COMMENT '发布时间',
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_category_id (category_id),
  INDEX idx_author_id (author_id),
  INDEX idx_status (status),
  INDEX idx_published_at (published_at),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章表';

-- 文章-标签关联表
CREATE TABLE article_tags (
  article_id  BIGINT NOT NULL COMMENT '文章ID',
  tag_id      BIGINT NOT NULL COMMENT '标签ID',
  PRIMARY KEY (article_id, tag_id),
  INDEX idx_article_id (article_id),
  INDEX idx_tag_id (tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章-标签关联表';

-- 评论表
CREATE TABLE comments (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  content     TEXT         NOT NULL COMMENT '评论内容',
  article_id  BIGINT COMMENT '文章ID',
  video_id    BIGINT COMMENT '视频ID',
  author_id   BIGINT       NOT NULL COMMENT '评论者ID',
  parent_id   BIGINT COMMENT '父评论ID（用于回复）',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_article_id (article_id),
  INDEX idx_video_id (video_id),
  INDEX idx_author_id (author_id),
  INDEX idx_parent_id (parent_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (parent_id) REFERENCES comments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- 点赞表
CREATE TABLE likes (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  user_id     BIGINT       NOT NULL COMMENT '用户ID',
  article_id  BIGINT COMMENT '文章ID',
  video_id    BIGINT COMMENT '视频ID',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_user_article (user_id, article_id),
  UNIQUE KEY uk_user_video (user_id, video_id),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点赞表';

-- 插入默认分类
INSERT INTO categories (name, slug, description) VALUES
('前端技术', 'frontend', '前端开发相关技术文章'),
('后端技术', 'backend', '后端开发相关技术文章'),
('生活随笔', 'life', '生活感悟与随笔'),
('旅行游记', 'travel', '旅行见闻与游记'),
('读书笔记', 'reading', '读书心得与笔记'),
('设计思考', 'design', '设计理念与思考');

-- 插入默认标签
INSERT INTO tags (name, slug) VALUES
('Vue3', 'vue3'), ('React', 'react'), ('TypeScript', 'typescript'),
('JavaScript', 'javascript'), ('Spring Boot', 'spring-boot'), ('MySQL', 'mysql'),
('Redis', 'redis'), ('Docker', 'docker'), ('旅行', 'travel'),
('摄影', 'photography'), ('读书', 'reading'), ('CSS', 'css'), ('设计', 'design');
