CREATE TABLE IF NOT EXISTS link_categories (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name        VARCHAR(50)  NOT NULL COMMENT '分类名称',
  description VARCHAR(200) COMMENT '分类描述',
  sort_order  INT          DEFAULT 0 COMMENT '排序权重',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_link_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='友链分类管理表';

INSERT INTO link_categories (id, name, description, sort_order, created_at, updated_at)
SELECT c.id, c.name, LEFT(c.description, 200), 0, c.created_at, c.updated_at
FROM friend_link_categories c
LEFT JOIN link_categories lc ON lc.id = c.id
WHERE lc.id IS NULL;
