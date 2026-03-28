
# KrystalBlog 后端系统完整设计方案

基于对前端项目的全面分析，我将为您设计一个完整、可扩展的后端系统。

---

## 1. 技术选型

### 核心框架与语言
- **后端框架**: **Spring Boot 3.2.x** (基于 Java 17+)
  - 企业级成熟框架，生态系统完善
  - 内置依赖注入，便于测试
  - 丰富的 starter 组件，快速集成
- **语言**: **Java 17+** (LTS 版本，性能优异)

### 数据库
- **主数据库**: **MySQL 8.0+**
  - 成熟稳定，生态完善
  - 支持 JSON 数据类型
  - 事务支持完善
  - 全文搜索能力强
- **缓存层**: **Redis 7.x**
  - 会话存储
  - 热点数据缓存
  - 点赞/收藏计数
  - 分布式锁

### ORM & 工具
- **ORM**: **MyBatis Plus 3.5+**
  - 增强的 MyBatis，简化 CRUD 操作
  - 内置代码生成器，提高开发效率
  - 支持分页、性能分析、多租户等插件
  - 灵活的 SQL 构建能力
- **数据库迁移**: **Flyway**
- **文件存储**:
  - 开发环境: 本地文件系统
  - 生产环境: **阿里云 OSS / 腾讯云 COS**

### 认证与安全
- **认证**: **Spring Security + JWT**
- **密码加密**: **BCrypt**
- **API 文档**: **SpringDoc OpenAPI (Swagger)**

### 其他关键库
- **日期处理**: Java Time API (java.time)
- **校验**: Jakarta Validation (Hibernate Validator)
- **日志**: Logback + SLF4J
- **消息队列**: **Apache Kafka 3.6+**
  - 高吞吐量分布式消息系统
  - 用于视频转码、通知推送等异步任务
  - 支持日志收集和数据流处理
- **工具库**: Lombok, Hutool, MapStruct
- **构建工具**: Maven 或 Gradle

---

## 2. 数据库设计

### 数据库表结构 (MyBatis Plus 设计)

```sql
-- ==================== 用户相关 ====================

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

-- ==================== 博客相关 ====================

CREATE TABLE categories (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name        VARCHAR(100) UNIQUE NOT NULL COMMENT '分类名称',
  slug        VARCHAR(100) UNIQUE NOT NULL COMMENT '分类标识',
  description TEXT COMMENT '分类描述',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章分类表';

CREATE TABLE tags (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name        VARCHAR(100) UNIQUE NOT NULL COMMENT '标签名称',
  slug        VARCHAR(100) UNIQUE NOT NULL COMMENT '标签标识',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章标签表';

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
  published_at     TIMESTAMP COMMENT '发布时间',
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_category_id (category_id),
  INDEX idx_author_id (author_id),
  INDEX idx_status (status),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章表';

CREATE TABLE article_tags (
  article_id  BIGINT NOT NULL COMMENT '文章ID',
  tag_id      BIGINT NOT NULL COMMENT '标签ID',
  PRIMARY KEY (article_id, tag_id),
  INDEX idx_article_id (article_id),
  INDEX idx_tag_id (tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章-标签关联表';

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

-- ==================== 视频相关 ====================

CREATE TABLE video_categories (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name        VARCHAR(100) UNIQUE NOT NULL COMMENT '分类名称',
  slug        VARCHAR(100) UNIQUE NOT NULL COMMENT '分类标识',
  description TEXT COMMENT '分类描述',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频分类表';

CREATE TABLE video_tags (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name        VARCHAR(100) UNIQUE NOT NULL COMMENT '标签名称',
  slug        VARCHAR(100) UNIQUE NOT NULL COMMENT '标签标识',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频标签表';

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

CREATE TABLE video_video_tags (
  video_id  BIGINT NOT NULL COMMENT '视频ID',
  tag_id    BIGINT NOT NULL COMMENT '标签ID',
  PRIMARY KEY (video_id, tag_id),
  INDEX idx_video_id (video_id),
  INDEX idx_tag_id (tag_id),
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES video_tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频-标签关联表';

-- ==================== 音乐相关 ====================

CREATE TABLE artists (
  id         BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name       VARCHAR(200) NOT NULL COMMENT '歌手名称',
  bio        TEXT COMMENT '歌手简介',
  avatar     VARCHAR(500) COMMENT '歌手头像',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='歌手表';

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

CREATE TABLE song_categories (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name        VARCHAR(100) UNIQUE NOT NULL COMMENT '分类名称',
  slug        VARCHAR(100) UNIQUE NOT NULL COMMENT '分类标识',
  description TEXT COMMENT '分类描述',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='音乐分类表';

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

-- ==================== 友链相关 ====================

CREATE TABLE friend_link_categories (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name        VARCHAR(100) UNIQUE NOT NULL COMMENT '分类名称',
  slug        VARCHAR(100) UNIQUE NOT NULL COMMENT '分类标识',
  description TEXT COMMENT '分类描述',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='友链分类表';

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

-- ==================== 网盘相关 ====================

CREATE TABLE drive_folders (
  id           BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name         VARCHAR(200) NOT NULL COMMENT '文件夹名称',
  parent_id    BIGINT COMMENT '父文件夹ID',
  created_by_id BIGINT       NOT NULL COMMENT '创建者ID',
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_parent_id (parent_id),
  INDEX idx_created_by_id (created_by_id),
  FOREIGN KEY (parent_id) REFERENCES drive_folders(id),
  FOREIGN KEY (created_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网盘文件夹表';

CREATE TABLE drive_files (
  id            BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name          VARCHAR(200) NOT NULL COMMENT '文件名称',
  file_url      VARCHAR(500) NOT NULL COMMENT '文件URL',
  file_size     BIGINT       NOT NULL COMMENT '文件大小（字节）',
  mime_type     VARCHAR(100) NOT NULL COMMENT 'MIME类型',
  folder_id     BIGINT COMMENT '文件夹ID',
  uploaded_by_id BIGINT       NOT NULL COMMENT '上传者ID',
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_folder_id (folder_id),
  INDEX idx_uploaded_by_id (uploaded_by_id),
  FOREIGN KEY (folder_id) REFERENCES drive_folders(id),
  FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网盘文件表';

-- ==================== 统计相关 ====================

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
```

---

## 3. API 设计

### 3.1 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1699999999999
}
```

### 3.2 错误码定义

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |

---

## 4. 项目结构

```
krystalblog-backend/
├── src/
│   ├── main/
│   │   ├── java/com/krystalblog/
│   │   │   ├── KrystalBlogApplication.java       # 启动类
│   │   │   ├── config/                             # 配置类
│   │   │   │   ├── SecurityConfig.java             # Spring Security 配置
│   │   │   │   ├── RedisConfig.java                # Redis 配置
│   │   │   │   ├── MybatisPlusConfig.java          # MyBatis Plus 配置
│   │   │   │   ├── KafkaConfig.java                # Kafka 配置
│   │   │   │   ├── SwaggerConfig.java              # Swagger 配置
│   │   │   │   ├── FileStorageConfig.java          # 文件存储配置
│   │   │   │   └── AsyncConfig.java                # 异步配置
│   │   │   ├── common/                             # 公共模块
│   │   │   │   ├── constant/                       # 常量
│   │   │   │   ├── enums/                          # 枚举
│   │   │   │   ├── exception/                      # 异常
│   │   │   │   ├── result/                         # 统一响应
│   │   │   │   └── util/                           # 工具类
│   │   │   ├── annotation/                         # 自定义注解
│   │   │   ├── aspect/                             # AOP 切面
│   │   │   ├── filter/                             # 过滤器
│   │   │   ├── interceptor/                        # 拦截器
│   │   │   ├── security/                           # 安全模块
│   │   │   │   ├── jwt/                            # JWT 相关
│   │   │   │   ├── handler/                        # 认证处理器
│   │   │   │   └── service/                        # 用户详情服务
│   │   │   ├── module/                             # 业务模块
│   │   │   │   ├── auth/                           # 认证模块
│   │   │   │   │   ├── controller/
│   │   │   │   │   ├── service/
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── vo/
│   │   │   │   ├── user/                           # 用户模块
│   │   │   │   ├── article/                        # 文章模块
│   │   │   │   ├── video/                          # 视频模块
│   │   │   │   ├── music/                          # 音乐模块
│   │   │   │   ├── friendlink/                     # 友链模块
│   │   │   │   ├── drive/                          # 网盘模块
│   │   │   │   ├── stats/                          # 统计模块
│   │   │   │   └── file/                           # 文件模块
│   │   │   ├── entity/                             # 实体类
│   │   │   │   ├── base/                           # 实体基类
│   │   │   │   ├── User.java
│   │   │   │   ├── Article.java
│   │   │   │   └── ...
│   │   │   ├── mapper/                             # MyBatis Plus Mapper
│   │   │   │   ├── base/                           # Mapper 基类
│   │   │   │   ├── UserMapper.java
│   │   │   │   ├── ArticleMapper.java
│   │   │   │   └── ...
│   │   │   └── kafka/                              # Kafka 相关
│   │   │       ├── producer/                        # 消息生产者
│   │   │       ├── consumer/                        # 消息消费者
│   │   │       └── topic/                           # 主题定义
│   │   └── resources/
│   │       ├── application.yml                      # 主配置文件
│   │       ├── application-dev.yml                  # 开发环境
│   │       ├── application-prod.yml                 # 生产环境
│   │       ├── db/migration/                        # Flyway 迁移脚本
│   │       │   ├── V1__init_schema.sql
│   │       │   ├── V2__article_module.sql
│   │       │   └── ...
│   │       ├── mapper/                              # MyBatis XML 映射文件
│   │       │   ├── UserMapper.xml
│   │       │   ├── ArticleMapper.xml
│   │       │   └── ...
│   │       └── logback-spring.xml                   # 日志配置
│   └── test/
│       └── java/com/krystalblog/                    # 测试代码
├── uploads/                                           # 上传文件目录
├── logs/                                              # 日志目录
├── .env.example                                       # 环境变量示例
├── Dockerfile                                         # Docker 配置
├── docker-compose.yml                                 # Docker Compose
├── pom.xml                                            # Maven 配置 (或 build.gradle)
├── README.md
└── DEPLOYMENT.md
```

---

## 5. 核心模块设计

### 5.1 认证模块
- **JWT Token 认证**: Access Token + Refresh Token
- **密码加密**: BCrypt (strength = 12)
- **权限控制**: @PreAuthorize + Spring Security 方法级安全

### 5.2 文件上传模块
- **大文件分片上传**: 支持断点续传
- **文件类型校验**: 白名单机制
- **文件大小限制**: 可配置

### 5.3 缓存策略
- **Redis 缓存**: 使用 Spring Cache + @Cacheable
- **本地缓存**: Caffeine (热点数据)

---

## 6. 安全设计

1. **SQL 注入防护**: MyBatis Plus 参数化查询，避免原生 SQL 拼接
2. **XSS 防护**: 输入过滤 + 输出转义
3. **CSRF 防护**: Spring Security CSRF (或 Token 防护)
4. **Rate Limiting**: Bucket4j + Redis
5. **敏感数据加密**: Jasypt 加密配置文件

---

## 7. 部署方案

- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **CI/CD**: GitHub Actions / GitLab CI

