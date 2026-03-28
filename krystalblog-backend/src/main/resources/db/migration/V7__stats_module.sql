-- 网站统计表
CREATE TABLE site_stats (
  id            BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  date          DATE         UNIQUE NOT NULL COMMENT '统计日期',
  pv            BIGINT       DEFAULT 0 COMMENT '页面浏览量',
  uv            BIGINT       DEFAULT 0 COMMENT '独立访客数',
  article_views BIGINT       DEFAULT 0 COMMENT '文章阅读数',
  video_plays   BIGINT       DEFAULT 0 COMMENT '视频播放数',
  song_plays    BIGINT       DEFAULT 0 COMMENT '音乐播放数',
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网站统计表';

-- 访问记录表
CREATE TABLE visit_records (
  id         BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  ip         VARCHAR(50)  NOT NULL COMMENT '访问IP',
  user_agent VARCHAR(500) COMMENT '用户代理',
  page       VARCHAR(500) NOT NULL COMMENT '访问页面',
  referer    VARCHAR(500) COMMENT '来源页面',
  user_id    BIGINT COMMENT '用户ID',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_ip (ip),
  INDEX idx_created_at (created_at),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访问记录表';
