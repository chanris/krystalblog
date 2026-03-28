-- 友链分类表
CREATE TABLE friend_link_categories (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name        VARCHAR(100) UNIQUE NOT NULL COMMENT '分类名称',
  slug        VARCHAR(100) UNIQUE NOT NULL COMMENT '分类标识',
  description TEXT COMMENT '分类描述',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='友链分类表';

-- 友链表
CREATE TABLE friend_links (
  id           BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name         VARCHAR(200) NOT NULL COMMENT '友链名称',
  url          VARCHAR(500) NOT NULL COMMENT '友链URL',
  logo         VARCHAR(500) COMMENT '友链Logo',
  description  TEXT COMMENT '友链描述',
  category_id  BIGINT COMMENT '分类ID',
  status       VARCHAR(20)  DEFAULT 'ACTIVE' NOT NULL COMMENT '状态：ACTIVE-活跃，INACTIVE-非活跃',
  sort_order   INTEGER      DEFAULT 0 COMMENT '排序',
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_category_id (category_id),
  FOREIGN KEY (category_id) REFERENCES friend_link_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='友链表';

-- 友链申请表
CREATE TABLE link_applications (
  id            BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  site_name     VARCHAR(200) NOT NULL COMMENT '网站名称',
  site_url      VARCHAR(500) NOT NULL COMMENT '网站URL',
  site_logo     VARCHAR(500) COMMENT '网站Logo',
  description   TEXT COMMENT '网站描述',
  contact_email VARCHAR(100) NOT NULL COMMENT '联系邮箱',
  remark        TEXT COMMENT '备注',
  status        VARCHAR(20)  DEFAULT 'PENDING' NOT NULL COMMENT '状态：PENDING-待审核，APPROVED-已通过，REJECTED-已拒绝',
  reject_reason TEXT COMMENT '拒绝原因',
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='友链申请表';

-- 插入默认友链分类
INSERT INTO friend_link_categories (name, slug, description) VALUES
('技术', 'tech', '技术类博客'),
('生活', 'life', '生活类博客'),
('设计', 'design', '设计类博客'),
('旅行', 'travel', '旅行类博客'),
('摄影', 'photography', '摄影类博客');
