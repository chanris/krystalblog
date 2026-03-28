-- 用户表
CREATE TABLE users (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  username    VARCHAR(50)  UNIQUE NOT NULL COMMENT '用户名',
  email       VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
  password    VARCHAR(255) NOT NULL COMMENT '密码',
  nickname    VARCHAR(50) COMMENT '昵称',
  avatar      VARCHAR(500) COMMENT '头像URL',
  bio         TEXT COMMENT '个人简介',
  role        VARCHAR(20)  DEFAULT 'USER' NOT NULL COMMENT '角色：USER-普通用户，ADMIN-管理员',
  status      VARCHAR(20)  DEFAULT 'ACTIVE' NOT NULL COMMENT '状态：ACTIVE-活跃，INACTIVE-非活跃，BANNED-封禁',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 插入默认管理员用户 (密码: admin123, BCrypt 加密)
INSERT INTO users (username, email, password, nickname, role, status) VALUES
('admin', 'admin@krystalblog.com', '$2a$12$LJ3m4ys3uz2YHQ3MFn/EOuCpQEbUrrkDey3dSMkLJkRNEsgPbSODi', '管理员', 'ADMIN', 'ACTIVE');
