-- 网盘文件夹表
CREATE TABLE drive_folders (
  id            BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name          VARCHAR(200) NOT NULL COMMENT '文件夹名称',
  parent_id     BIGINT COMMENT '父文件夹ID',
  created_by_id BIGINT       NOT NULL COMMENT '创建者ID',
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_parent_id (parent_id),
  INDEX idx_created_by_id (created_by_id),
  FOREIGN KEY (parent_id) REFERENCES drive_folders(id),
  FOREIGN KEY (created_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网盘文件夹表';

-- 网盘文件表
CREATE TABLE drive_files (
  id             BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name           VARCHAR(200) NOT NULL COMMENT '文件名称',
  file_url       VARCHAR(500) NOT NULL COMMENT '文件URL',
  file_size      BIGINT       NOT NULL COMMENT '文件大小（字节）',
  mime_type      VARCHAR(100) NOT NULL COMMENT 'MIME类型',
  folder_id      BIGINT COMMENT '文件夹ID',
  uploaded_by_id BIGINT       NOT NULL COMMENT '上传者ID',
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_folder_id (folder_id),
  INDEX idx_uploaded_by_id (uploaded_by_id),
  FOREIGN KEY (folder_id) REFERENCES drive_folders(id),
  FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网盘文件表';
