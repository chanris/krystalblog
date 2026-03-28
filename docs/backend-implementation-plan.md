
# KrystalBlog 后端项目实施计划书

## 1. 项目背景与目标

### 1.1 项目背景
KrystalBlog 是一个面向个人创作者的综合型博客平台，前端已基于 React + TypeScript + Vite 完成开发。当前前端使用 Mock 数据模拟后端功能，需要一个完整的后端系统来提供数据持久化、用户认证、内容管理等核心能力。

### 1.2 项目目标
- 提供 RESTful API 支撑前端所有功能模块
- 实现用户认证与权限管理（管理员/普通用户）
- 支持博客文章、视频、音乐、网盘、友链等多类型内容管理
- 提供完整的数据统计与分析能力
- 确保系统安全性、性能与可扩展性

---

## 2. 技术架构概览

### 2.1 技术选型

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 核心框架 | Spring Boot 3.2.x | 基于 Java 的企业级应用框架 |
| 语言 | Java 17+ | LTS 版本，类型安全 |
| 主数据库 | MySQL 8.0+ | 成熟稳定的关系型数据库 |
| 缓存层 | Redis 7.x | 会话存储、热点数据缓存、计数 |
| ORM | MyBatis Plus 3.5+ | 增强的 MyBatis，简化 CRUD 操作 |
| 数据库迁移 | Flyway | 数据库版本控制与迁移 |
| 认证 | Spring Security + JWT | Token 认证机制 |
| 文件存储 | 本地文件系统 + OSS | 开发环境本地存储，生产环境云存储 |
| API 文档 | SpringDoc OpenAPI | 自动生成接口文档 (Swagger UI) |
| 任务调度 | Spring Task + Quartz | 定时任务调度 |
| 消息队列 | Apache Kafka 3.6+ | 高吞吐量分布式消息系统 |
| 日志 | Logback + SLF4J | 结构化日志记录 |
| 工具库 | Lombok, Hutool, MapStruct | 简化开发，提高效率 |
| 构建工具 | Maven / Gradle | 项目构建与依赖管理 |
| 单元测试 | JUnit 5 + Mockito | 单元测试框架 |
| 容器化 | Docker + Docker Compose | 应用容器化部署 |

### 2.2 架构模式
- **前后端分离**: RESTful API 设计
- **模块化架构**: 按业务领域划分模块
- **分层设计**: Controller → Service → Mapper
- **依赖注入**: Spring 内置 DI 容器

---

## 3. 开发阶段与任务分解

### 第一阶段：项目初始化与基础架构
**预计工期**: 2-3 天

#### 任务清单
- [ ] 使用 Spring Initializr 初始化 Spring Boot 项目
- [ ] 配置 Maven/Gradle 依赖管理
- [ ] 配置 application.yml / application-dev.yml / application-prod.yml
- [ ] 配置日志 (Logback)
- [ ] 配置 Flyway 数据库迁移
- [ ] 设计并创建初始数据库 Schema (V1__init_schema.sql)
- [ ] 配置 MyBatis Plus
- [ ] 配置 Redis 连接 (Spring Data Redis)
- [ ] 配置 Kafka 连接
- [ ] 配置 SpringDoc OpenAPI (Swagger UI)
- [ ] 实现统一响应格式 (Result&lt;T&gt;)
- [ ] 实现全局异常处理器 (@RestControllerAdvice)
- [ ] 实现自定义业务异常
- [ ] 实现请求日志切面 (AOP)
- [ ] 配置 CORS 跨域
- [ ] 配置 Spring Security 基础框架
- [ ] 创建实体类基类 (BaseEntity)
- [ ] 创建 Mapper 基类 (BaseMapper)
- [ ] 配置文件上传路径
- [ ] 创建 `.gitignore`
- [ ] 创建 `README.md` 项目文档

#### 交付物
- 可运行的 Spring Boot 基础项目
- Flyway 初始迁移脚本
- 标准化的项目结构
- 基础配置文件

---

### 第二阶段：用户认证与权限系统
**预计工期**: 3-4 天

#### 任务清单
- [ ] 设计用户相关数据库表（User）
- [ ] 创建用户实体类 (User)
- [ ] 创建用户 Mapper (UserMapper)
- [ ] 创建用户模块 DTO（注册、登录、用户信息等）
- [ ] 创建用户模块 VO（用户视图对象）
- [ ] 配置 Spring Security + JWT
- [ ] 实现 JWT 工具类（生成、解析、验证）
- [ ] 实现 JWT 认证过滤器
- [ ] 实现自定义 UserDetailsService
- [ ] 实现认证成功/失败处理器
- [ ] 实现用户注册功能
- [ ] 实现用户登录功能（JWT）
- [ ] 实现 Token 刷新机制
- [ ] 实现密码重置功能
- [ ] 实现角色权限注解 (@RequireRole, @RequirePermission)
- [ ] 实现权限切面
- [ ] 实现用户信息 CRUD 接口
- [ ] 实现管理员用户种子数据 (Flyway 迁移)
- [ ] 创建用户模块单元测试
- [ ] 编写认证模块集成测试

#### 交付物
- 用户认证 API
- JWT Token 认证体系
- 角色权限管理
- 用户管理接口

#### API 端点
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新 Token
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/reset-password` - 重置密码
- `GET /api/users/profile` - 获取当前用户信息
- `PUT /api/users/profile` - 更新用户信息
- `GET /api/users` - 获取用户列表（管理员）
- `GET /api/users/{id}` - 获取用户详情（管理员）
- `PUT /api/users/{id}` - 更新用户（管理员）
- `DELETE /api/users/{id}` - 删除用户（管理员）

---

### 第三阶段：博客文章模块
**预计工期**: 4-5 天

#### 任务清单
- [ ] 设计博客相关数据库表（Article、Category、Tag、Comment、Like）
- [ ] 创建博客相关实体类
- [ ] 创建博客相关 Mapper
- [ ] 创建博客模块 DTO 和 VO
- [ ] 创建文章分类模块（Category Module）
- [ ] 创建文章标签模块（Tag Module）
- [ ] 创建文章模块（Article Module）
- [ ] 实现文章 CRUD 接口
- [ ] 实现文章草稿功能
- [ ] 实现文章定时发布 (@Scheduled)
- [ ] 实现文章分类管理
- [ ] 实现文章标签管理
- [ ] 实现文章列表查询（分页、筛选、搜索）
- [ ] 实现文章详情接口
- [ ] 实现阅读数统计
- [ ] 创建评论模块（Comment Module）
- [ ] 实现评论 CRUD 接口
- [ ] 实现评论回复功能
- [ ] 创建点赞模块（Like Module）
- [ ] 实现文章点赞/取消点赞
- [ ] 实现文章归档接口
- [ ] 实现文章内容安全过滤 (Jsoup)
- [ ] 编写博客模块单元测试
- [ ] 编写博客模块集成测试

#### 交付物
- 文章管理 API
- 分类与标签管理 API
- 评论与点赞 API
- 文章搜索与筛选功能

#### API 端点
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/{id}` - 获取文章详情
- `POST /api/articles` - 创建文章（管理员）
- `PUT /api/articles/{id}` - 更新文章（管理员）
- `DELETE /api/articles/{id}` - 删除文章（管理员）
- `GET /api/articles/categories` - 获取分类列表
- `POST /api/articles/categories` - 创建分类（管理员）
- `PUT /api/articles/categories/{id}` - 更新分类（管理员）
- `DELETE /api/articles/categories/{id}` - 删除分类（管理员）
- `GET /api/articles/tags` - 获取标签列表
- `POST /api/articles/tags` - 创建标签（管理员）
- `PUT /api/articles/tags/{id}` - 更新标签（管理员）
- `DELETE /api/articles/tags/{id}` - 删除标签（管理员）
- `GET /api/articles/{id}/comments` - 获取文章评论
- `POST /api/articles/{id}/comments` - 发表评论（需登录）
- `PUT /api/articles/comments/{id}` - 更新评论（需登录）
- `DELETE /api/articles/comments/{id}` - 删除评论
- `POST /api/articles/{id}/like` - 点赞文章（需登录）
- `DELETE /api/articles/{id}/like` - 取消点赞（需登录）
- `GET /api/articles/archives` - 获取文章归档

---

### 第四阶段：视频模块
**预计工期**: 4-5 天

#### 任务清单
- [ ] 设计视频相关数据库表（Video、VideoCategory、VideoTag）
- [ ] 配置文件上传模块（File Upload Module）
- [ ] 实现视频文件上传功能（支持大文件分片上传）
- [ ] 实现视频封面上传/自动截取
- [ ] 创建视频分类模块（VideoCategory Module）
- [ ] 创建视频标签模块（VideoTag Module）
- [ ] 创建视频模块（Video Module）
- [ ] 实现视频 CRUD 接口
- [ ] 实现视频列表查询（分页、筛选、搜索）
- [ ] 实现视频详情接口
- [ ] 实现视频播放数统计
- [ ] 实现视频评论功能（复用评论模块）
- [ ] 实现视频点赞功能（复用点赞模块）
- [ ] 集成视频转码异步任务（Kafka）
- [ ] 实现视频流式播放 (Range 请求)
- [ ] 编写视频模块单元测试
- [ ] 编写视频模块集成测试

#### 交付物
- 视频管理 API
- 视频上传与转码
- 视频播放与统计
- 视频评论与点赞

#### API 端点
- `GET /api/videos` - 获取视频列表
- `GET /api/videos/{id}` - 获取视频详情
- `POST /api/videos` - 上传视频（管理员）
- `PUT /api/videos/{id}` - 更新视频信息（管理员）
- `DELETE /api/videos/{id}` - 删除视频（管理员）
- `GET /api/videos/{id}/stream` - 视频流播放
- `GET /api/videos/categories` - 获取视频分类
- `POST /api/videos/categories` - 创建分类（管理员）
- `PUT /api/videos/categories/{id}` - 更新分类（管理员）
- `DELETE /api/videos/categories/{id}` - 删除分类（管理员）
- `GET /api/videos/tags` - 获取视频标签
- `POST /api/videos/tags` - 创建标签（管理员）
- `PUT /api/videos/tags/{id}` - 更新标签（管理员）
- `DELETE /api/videos/tags/{id}` - 删除标签（管理员）
- `GET /api/videos/{id}/comments` - 获取视频评论
- `POST /api/videos/{id}/comments` - 发表评论（需登录）
- `POST /api/videos/{id}/like` - 点赞视频（需登录）
- `DELETE /api/videos/{id}/like` - 取消点赞（需登录）

---

### 第五阶段：音乐模块
**预计工期**: 3-4 天

#### 任务清单
- [ ] 设计音乐相关数据库表（Song、SongCategory、Artist、Album）
- [ ] 实现音频文件上传功能
- [ ] 实现歌词文件（LRC）上传
- [ ] 实现专辑封面上传
- [ ] 创建歌手模块（Artist Module）
- [ ] 创建专辑模块（Album Module）
- [ ] 创建音乐分类模块（SongCategory Module）
- [ ] 创建音乐模块（Song Module）
- [ ] 实现歌曲 CRUD 接口
- [ ] 实现歌曲列表查询（分页、筛选、搜索）
- [ ] 实现歌曲详情接口
- [ ] 实现歌手列表/详情接口
- [ ] 实现专辑列表/详情接口
- [ ] 实现歌曲播放数统计
- [ ] 实现音频流式播放
- [ ] 实现歌词解析与同步
- [ ] 编写音乐模块单元测试
- [ ] 编写音乐模块集成测试

#### 交付物
- 音乐管理 API
- 音频上传与播放
- 歌手与专辑管理
- 歌词同步播放

#### API 端点
- `GET /api/songs` - 获取歌曲列表
- `GET /api/songs/{id}` - 获取歌曲详情
- `POST /api/songs` - 上传歌曲（管理员）
- `PUT /api/songs/{id}` - 更新歌曲信息（管理员）
- `DELETE /api/songs/{id}` - 删除歌曲（管理员）
- `GET /api/songs/{id}/stream` - 音频流播放
- `GET /api/songs/{id}/lyrics` - 获取歌词
- `GET /api/artists` - 获取歌手列表
- `GET /api/artists/{id}` - 获取歌手详情
- `POST /api/artists` - 创建歌手（管理员）
- `PUT /api/artists/{id}` - 更新歌手（管理员）
- `DELETE /api/artists/{id}` - 删除歌手（管理员）
- `GET /api/albums` - 获取专辑列表
- `GET /api/albums/{id}` - 获取专辑详情
- `POST /api/albums` - 创建专辑（管理员）
- `PUT /api/albums/{id}` - 更新专辑（管理员）
- `DELETE /api/albums/{id}` - 删除专辑（管理员）
- `GET /api/songs/categories` - 获取音乐分类
- `POST /api/songs/categories` - 创建分类（管理员）
- `PUT /api/songs/categories/{id}` - 更新分类（管理员）
- `DELETE /api/songs/categories/{id}` - 删除分类（管理员）

---

### 第六阶段：友链模块
**预计工期**: 2-3 天

#### 任务清单
- [ ] 设计友链相关数据库表（FriendLink、FriendLinkCategory、LinkApplication）
- [ ] 创建友链分类模块（FriendLinkCategory Module）
- [ ] 创建友链模块（FriendLink Module）
- [ ] 实现友链 CRUD 接口
- [ ] 实现友链列表查询（分页、筛选）
- [ ] 创建友链申请模块（LinkApplication Module）
- [ ] 实现友链申请提交
- [ ] 实现友链申请审核（通过/拒绝）
- [ ] 实现友链状态管理
- [ ] 编写友链模块单元测试
- [ ] 编写友链模块集成测试

#### 交付物
- 友链管理 API
- 友链申请与审核
- 友链分类管理

#### API 端点
- `GET /api/friend-links` - 获取友链列表
- `POST /api/friend-links` - 添加友链（管理员）
- `PUT /api/friend-links/{id}` - 更新友链（管理员）
- `DELETE /api/friend-links/{id}` - 删除友链（管理员）
- `GET /api/friend-links/categories` - 获取友链分类
- `POST /api/friend-links/categories` - 创建分类（管理员）
- `PUT /api/friend-links/categories/{id}` - 更新分类（管理员）
- `DELETE /api/friend-links/categories/{id}` - 删除分类（管理员）
- `POST /api/friend-links/applications` - 提交友链申请
- `GET /api/friend-links/applications` - 获取申请列表（管理员）
- `POST /api/friend-links/applications/{id}/approve` - 审核通过（管理员）
- `POST /api/friend-links/applications/{id}/reject` - 审核拒绝（管理员）

---

### 第七阶段：网盘模块
**预计工期**: 3-4 天

#### 任务清单
- [ ] 设计网盘相关数据库表（DriveFile、DriveFolder）
- [ ] 创建网盘文件模块（DriveFile Module）
- [ ] 创建网盘文件夹模块（DriveFolder Module）
- [ ] 实现文件上传功能（支持大文件分片上传）
- [ ] 实现文件下载功能
- [ ] 实现文件删除功能
- [ ] 实现文件重命名
- [ ] 实现文件移动
- [ ] 实现文件夹创建
- [ ] 实现文件夹删除（级联删除）
- [ ] 实现文件夹重命名
- [ ] 实现文件/文件夹列表查询（树形结构）
- [ ] 实现文件搜索功能
- [ ] 实现批量文件下载（ZIP 打包）
- [ ] 实现存储空间统计
- [ ] 编写网盘模块单元测试
- [ ] 编写网盘模块集成测试

#### 交付物
- 网盘文件管理 API
- 文件夹层级管理
- 文件上传下载
- 存储空间统计

#### API 端点
- `GET /api/drive/files` - 获取文件列表
- `GET /api/drive/files/{id}` - 获取文件详情
- `POST /api/drive/files` - 上传文件（管理员）
- `PUT /api/drive/files/{id}` - 重命名文件（管理员）
- `DELETE /api/drive/files/{id}` - 删除文件（管理员）
- `POST /api/drive/files/{id}/move` - 移动文件（管理员）
- `GET /api/drive/files/{id}/download` - 下载文件（管理员）
- `POST /api/drive/files/batch-download` - 批量下载（管理员）
- `GET /api/drive/folders` - 获取文件夹列表
- `POST /api/drive/folders` - 创建文件夹（管理员）
- `PUT /api/drive/folders/{id}` - 重命名文件夹（管理员）
- `DELETE /api/drive/folders/{id}` - 删除文件夹（管理员）
- `POST /api/drive/folders/{id}/move` - 移动文件夹（管理员）
- `GET /api/drive/search` - 搜索文件（管理员）
- `GET /api/drive/storage` - 获取存储空间统计（管理员）

---

### 第八阶段：统计数据模块
**预计工期**: 3-4 天

#### 任务清单
- [ ] 设计统计相关数据库表（SiteStats、VisitRecord）
- [ ] 创建访问记录拦截器/过滤器
- [ ] 实现 PV/UV 统计
- [ ] 创建统计模块（Stats Module）
- [ ] 实现网站基础统计接口
- [ ] 实现文章数据统计接口
- [ ] 实现视频数据统计接口
- [ ] 实现音乐播放统计接口
- [ ] 实现趋势数据接口（近 30 天）
- [ ] 实现 Top 排行榜接口
- [ ] 实现分类分布统计接口
- [ ] 实现定时统计任务 (@Scheduled)
- [ ] 编写统计模块单元测试
- [ ] 编写统计模块集成测试

#### 交付物
- 数据统计 API
- 访问统计拦截器
- 定时统计任务
- 各类统计报表

#### API 端点
- `GET /api/stats/dashboard` - 获取仪表盘数据（管理员）
- `GET /api/stats/site` - 获取网站基础统计（管理员）
- `GET /api/stats/site/trend` - 获取网站访问趋势（管理员）
- `GET /api/stats/articles` - 获取文章统计（管理员）
- `GET /api/stats/articles/trend` - 获取文章阅读趋势（管理员）
- `GET /api/stats/articles/top` - 获取文章 Top 排行（管理员）
- `GET /api/stats/articles/categories` - 获取文章分类分布（管理员）
- `GET /api/stats/videos` - 获取视频统计（管理员）
- `GET /api/stats/videos/trend` - 获取视频播放趋势（管理员）
- `GET /api/stats/videos/top` - 获取视频 Top 排行（管理员）
- `GET /api/stats/songs` - 获取音乐统计（管理员）
- `GET /api/stats/songs/trend` - 获取音乐播放趋势（管理员）
- `GET /api/stats/songs/top` - 获取歌曲 Top 排行（管理员）
- `GET /api/stats/songs/artists` - 获取歌手播放排行（管理员）

---

### 第九阶段：搜索与优化
**预计工期**: 2-3 天

#### 任务清单
- [ ] 实现全文搜索（MySQL 全文搜索 / Elasticsearch）
- [ ] 创建统一搜索模块（Search Module）
- [ ] 实现全站搜索接口
- [ ] 配置 Redis 缓存策略 (@Cacheable, @CacheEvict)
- [ ] 实现热点数据缓存
- [ ] 实现查询结果缓存
- [ ] 实现数据库查询优化（添加索引、优化查询语句）
- [ ] 添加数据库索引
- [ ] 实现 API 响应压缩
- [ ] 实现接口限流保护 (Bucket4j + Redis)
- [ ] 优化大文件上传下载
- [ ] 编写性能测试

#### 交付物
- 全站搜索 API
- Redis 缓存策略
- 数据库优化
- 性能优化报告

#### API 端点
- `GET /api/search` - 全站搜索
- `GET /api/search/articles` - 搜索文章
- `GET /api/search/videos` - 搜索视频
- `GET /api/search/songs` - 搜索音乐

---

### 第十阶段：测试与部署准备
**预计工期**: 3-4 天

#### 任务清单
- [ ] 编写单元测试（目标覆盖率 ≥ 70%）
- [ ] 编写集成测试
- [ ] 编写 E2E 测试（关键流程）
- [ ] 配置 CI/CD 流程（GitHub Actions）
- [ ] 创建 Dockerfile
- [ ] 创建 docker-compose.yml
- [ ] 配置生产环境配置
- [ ] 编写部署文档
- [ ] 编写 API 文档完善
- [ ] 编写数据库备份方案
- [ ] 编写日志监控方案
- [ ] 最终安全审计
- [ ] 性能压力测试 (JMeter / Gatling)

#### 交付物
- 完整的测试用例
- Docker 容器化配置
- CI/CD 配置
- 部署文档
- API 完整文档

---

## 4. API 接口清单

### 4.1 认证与用户模块
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | 公开 |
| POST | `/api/auth/login` | 用户登录 | 公开 |
| POST | `/api/auth/refresh` | 刷新 Token | 已登录 |
| POST | `/api/auth/logout` | 用户登出 | 已登录 |
| POST | `/api/auth/reset-password` | 重置密码 | 公开 |
| GET | `/api/users/profile` | 获取当前用户信息 | 已登录 |
| PUT | `/api/users/profile` | 更新用户信息 | 已登录 |
| GET | `/api/users` | 获取用户列表 | 管理员 |
| GET | `/api/users/{id}` | 获取用户详情 | 管理员 |
| PUT | `/api/users/{id}` | 更新用户 | 管理员 |
| DELETE | `/api/users/{id}` | 删除用户 | 管理员 |

### 4.2 博客文章模块
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/articles` | 获取文章列表 | 公开 |
| GET | `/api/articles/{id}` | 获取文章详情 | 公开 |
| POST | `/api/articles` | 创建文章 | 管理员 |
| PUT | `/api/articles/{id}` | 更新文章 | 管理员 |
| DELETE | `/api/articles/{id}` | 删除文章 | 管理员 |
| GET | `/api/articles/categories` | 获取分类列表 | 公开 |
| POST | `/api/articles/categories` | 创建分类 | 管理员 |
| PUT | `/api/articles/categories/{id}` | 更新分类 | 管理员 |
| DELETE | `/api/articles/categories/{id}` | 删除分类 | 管理员 |
| GET | `/api/articles/tags` | 获取标签列表 | 公开 |
| POST | `/api/articles/tags` | 创建标签 | 管理员 |
| PUT | `/api/articles/tags/{id}` | 更新标签 | 管理员 |
| DELETE | `/api/articles/tags/{id}` | 删除标签 | 管理员 |
| GET | `/api/articles/{id}/comments` | 获取文章评论 | 公开 |
| POST | `/api/articles/{id}/comments` | 发表评论 | 已登录 |
| PUT | `/api/articles/comments/{id}` | 更新评论 | 已登录 |
| DELETE | `/api/articles/comments/{id}` | 删除评论 | 作者/管理员 |
| POST | `/api/articles/{id}/like` | 点赞文章 | 已登录 |
| DELETE | `/api/articles/{id}/like` | 取消点赞 | 已登录 |
| GET | `/api/articles/archives` | 获取文章归档 | 公开 |

### 4.3 视频模块
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/videos` | 获取视频列表 | 公开 |
| GET | `/api/videos/{id}` | 获取视频详情 | 公开 |
| POST | `/api/videos` | 上传视频 | 管理员 |
| PUT | `/api/videos/{id}` | 更新视频 | 管理员 |
| DELETE | `/api/videos/{id}` | 删除视频 | 管理员 |
| GET | `/api/videos/{id}/stream` | 视频流播放 | 公开 |
| GET | `/api/videos/categories` | 获取视频分类 | 公开 |
| POST | `/api/videos/categories` | 创建分类 | 管理员 |
| PUT | `/api/videos/categories/{id}` | 更新分类 | 管理员 |
| DELETE | `/api/videos/categories/{id}` | 删除分类 | 管理员 |
| GET | `/api/videos/tags` | 获取视频标签 | 公开 |
| POST | `/api/videos/tags` | 创建标签 | 管理员 |
| PUT | `/api/videos/tags/{id}` | 更新标签 | 管理员 |
| DELETE | `/api/videos/tags/{id}` | 删除标签 | 管理员 |
| GET | `/api/videos/{id}/comments` | 获取视频评论 | 公开 |
| POST | `/api/videos/{id}/comments` | 发表评论 | 已登录 |
| POST | `/api/videos/{id}/like` | 点赞视频 | 已登录 |
| DELETE | `/api/videos/{id}/like` | 取消点赞 | 已登录 |

### 4.4 音乐模块
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/songs` | 获取歌曲列表 | 公开 |
| GET | `/api/songs/{id}` | 获取歌曲详情 | 公开 |
| POST | `/api/songs` | 上传歌曲 | 管理员 |
| PUT | `/api/songs/{id}` | 更新歌曲 | 管理员 |
| DELETE | `/api/songs/{id}` | 删除歌曲 | 管理员 |
| GET | `/api/songs/{id}/stream` | 音频流播放 | 公开 |
| GET | `/api/songs/{id}/lyrics` | 获取歌词 | 公开 |
| GET | `/api/artists` | 获取歌手列表 | 公开 |
| GET | `/api/artists/{id}` | 获取歌手详情 | 公开 |
| POST | `/api/artists` | 创建歌手 | 管理员 |
| PUT | `/api/artists/{id}` | 更新歌手 | 管理员 |
| DELETE | `/api/artists/{id}` | 删除歌手 | 管理员 |
| GET | `/api/albums` | 获取专辑列表 | 公开 |
| GET | `/api/albums/{id}` | 获取专辑详情 | 公开 |
| POST | `/api/albums` | 创建专辑 | 管理员 |
| PUT | `/api/albums/{id}` | 更新专辑 | 管理员 |
| DELETE | `/api/albums/{id}` | 删除专辑 | 管理员 |
| GET | `/api/songs/categories` | 获取音乐分类 | 公开 |
| POST | `/api/songs/categories` | 创建分类 | 管理员 |
| PUT | `/api/songs/categories/{id}` | 更新分类 | 管理员 |
| DELETE | `/api/songs/categories/{id}` | 删除分类 | 管理员 |

### 4.5 友链模块
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/friend-links` | 获取友链列表 | 公开 |
| POST | `/api/friend-links` | 添加友链 | 管理员 |
| PUT | `/api/friend-links/{id}` | 更新友链 | 管理员 |
| DELETE | `/api/friend-links/{id}` | 删除友链 | 管理员 |
| GET | `/api/friend-links/categories` | 获取友链分类 | 公开 |
| POST | `/api/friend-links/categories` | 创建分类 | 管理员 |
| PUT | `/api/friend-links/categories/{id}` | 更新分类 | 管理员 |
| DELETE | `/api/friend-links/categories/{id}` | 删除分类 | 管理员 |
| POST | `/api/friend-links/applications` | 提交友链申请 | 公开 |
| GET | `/api/friend-links/applications` | 获取申请列表 | 管理员 |
| POST | `/api/friend-links/applications/{id}/approve` | 审核通过 | 管理员 |
| POST | `/api/friend-links/applications/{id}/reject` | 审核拒绝 | 管理员 |

### 4.6 网盘模块
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/drive/files` | 获取文件列表 | 管理员 |
| GET | `/api/drive/files/{id}` | 获取文件详情 | 管理员 |
| POST | `/api/drive/files` | 上传文件 | 管理员 |
| PUT | `/api/drive/files/{id}` | 重命名文件 | 管理员 |
| DELETE | `/api/drive/files/{id}` | 删除文件 | 管理员 |
| POST | `/api/drive/files/{id}/move` | 移动文件 | 管理员 |
| GET | `/api/drive/files/{id}/download` | 下载文件 | 管理员 |
| POST | `/api/drive/files/batch-download` | 批量下载 | 管理员 |
| GET | `/api/drive/folders` | 获取文件夹列表 | 管理员 |
| POST | `/api/drive/folders` | 创建文件夹 | 管理员 |
| PUT | `/api/drive/folders/{id}` | 重命名文件夹 | 管理员 |
| DELETE | `/api/drive/folders/{id}` | 删除文件夹 | 管理员 |
| POST | `/api/drive/folders/{id}/move` | 移动文件夹 | 管理员 |
| GET | `/api/drive/search` | 搜索文件 | 管理员 |
| GET | `/api/drive/storage` | 获取存储空间统计 | 管理员 |

### 4.7 统计模块
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/stats/dashboard` | 获取仪表盘数据 | 管理员 |
| GET | `/api/stats/site` | 获取网站基础统计 | 管理员 |
| GET | `/api/stats/site/trend` | 获取网站访问趋势 | 管理员 |
| GET | `/api/stats/articles` | 获取文章统计 | 管理员 |
| GET | `/api/stats/articles/trend` | 获取文章阅读趋势 | 管理员 |
| GET | `/api/stats/articles/top` | 获取文章 Top 排行 | 管理员 |
| GET | `/api/stats/articles/categories` | 获取文章分类分布 | 管理员 |
| GET | `/api/stats/videos` | 获取视频统计 | 管理员 |
| GET | `/api/stats/videos/trend` | 获取视频播放趋势 | 管理员 |
| GET | `/api/stats/videos/top` | 获取视频 Top 排行 | 管理员 |
| GET | `/api/stats/songs` | 获取音乐统计 | 管理员 |
| GET | `/api/stats/songs/trend` | 获取音乐播放趋势 | 管理员 |
| GET | `/api/stats/songs/top` | 获取歌曲 Top 排行 | 管理员 |
| GET | `/api/stats/songs/artists` | 获取歌手播放排行 | 管理员 |

### 4.8 搜索模块
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/search` | 全站搜索 | 公开 |
| GET | `/api/search/articles` | 搜索文章 | 公开 |
| GET | `/api/search/videos` | 搜索视频 | 公开 |
| GET | `/api/search/songs` | 搜索音乐 | 公开 |

---

## 5. 数据库迁移计划

### 5.1 迁移阶段一：基础用户表
**V1__init_user.sql**

```sql
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

-- 插入默认管理员用户 (密码: admin123, 需要使用 BCrypt 加密)
-- 注意：实际使用时需要通过 Java 代码生成 BCrypt 加密后的密码
INSERT INTO users (username, email, password, nickname, role, status) VALUES
('admin', 'admin@krystalblog.com', '$2a$12$N9QFVUbYjVJcVJZ1Yz1Z.O8X7z5V5V5V5V5V5V5V5V5V5V5V5V', '管理员', 'ADMIN', 'ACTIVE');
```

### 5.2 迁移阶段二：博客文章表
**V2__blog_module.sql**

```sql
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
  published_at     TIMESTAMP COMMENT '发布时间',
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_category_id (category_id),
  INDEX idx_author_id (author_id),
  INDEX idx_status (status),
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
```

### 5.3 迁移阶段三：视频表
**V3__video_module.sql**

```sql
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
```

### 5.4 迁移阶段四：音乐表
**V4__music_module.sql**

```sql
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
```

### 5.5 迁移阶段五：友链表
**V5__friend_link_module.sql**

```sql
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
```

### 5.6 迁移阶段六：网盘表
**V6__drive_module.sql**

```sql
-- 网盘文件夹表
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

-- 网盘文件表
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
```

### 5.7 迁移阶段七：统计表
**V7__stats_module.sql**

```sql
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
```

---

## 6. 文件结构预览

```
krystalblog-backend/
├── .github/
│   └── workflows/
│       └── ci.yml                 # CI/CD 配置
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
│   │   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   │   └── JwtTokenProvider.java
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
│   │       │   ├── V1__init_user.sql
│   │       │   ├── V2__blog_module.sql
│   │       │   └── ...
│   │       ├── mapper/                              # MyBatis XML 映射文件
│   │       │   ├── UserMapper.xml
│   │       │   ├── ArticleMapper.xml
│   │       │   └── ...
│   │       └── logback-spring.xml                   # 日志配置
│   └── test/
│       └── java/com/krystalblog/                    # 测试代码
│           ├── unit/                                # 单元测试
│           └── integration/                         # 集成测试
├── uploads/                                           # 上传文件目录
├── logs/                                              # 日志目录
├── .env.example                                       # 环境变量示例
├── .gitignore
├── Dockerfile                                         # Docker 配置
├── docker-compose.yml                                 # Docker Compose
├── pom.xml                                            # Maven 配置 (或 build.gradle)
├── README.md                                          # 项目说明
├── DEPLOYMENT.md                                      # 部署文档
└── API.md                                             # API 文档
```

---

## 7. 开发规范与注意事项

### 7.1 代码规范

#### Java 规范
- 使用 Java 17+ 特性
- 类型定义完整，避免使用 `raw type`
- 使用 `interface` 定义接口，`class` 定义实现
- 文件命名：大驼峰（PascalCase）
- 类命名：大驼峰（PascalCase）
- 变量/函数命名：小驼峰（camelCase）
- 常量命名：全大写下划线分隔（UPPER_SNAKE_CASE）
- 使用 Lombok 简化代码
- 使用 `Optional&lt;T&gt;` 处理可能为 null 的值

#### Spring Boot 规范
- Controller 只负责请求响应，业务逻辑放 Service
- Service 使用依赖注入，保持单例
- DTO 使用 `jakarta.validation` 进行验证
- 使用 Swagger 注解标注 API 文档
- 模块按功能组织，保持高内聚低耦合
- Mapper 接口继承 BaseMapper
- 使用 MyBatis Plus 的 Service 接口和实现类（IService + ServiceImpl）
- 使用 `@Transactional` 管理事务
- 复杂查询使用 XML 或 QueryWrapper
- 异常统一使用 `@RestControllerAdvice` 处理

### 7.2 Git 分支策略

```
main
  └── develop
        ├── feature/user-auth
        ├── feature/blog-module
        └── ...
```

#### 提交信息规范
使用约定式提交（Conventional Commits）：

```
&lt;type&gt;(&lt;scope&gt;): &lt;subject&gt;

feat(auth): add JWT refresh token support
```

### 7.3 安全注意事项
- 密码使用 BCrypt 加密（strength ≥ 12）
- JWT Token 设置合理的过期时间
- 所有用户输入使用 `jakarta.validation` 验证
- 使用 Spring Security 配置安全头
- 配置合理的 CORS 策略
- SQL 注入防护：使用 MyBatis Plus 参数化查询，避免 SQL 拼接
- XSS 防护：输入过滤 + 输出转义

### 7.4 工期预估

| 阶段 | 工期 | 累计工期 |
|------|------|----------|
| 第一阶段：项目初始化 | 2-3 天 | 2-3 天 |
| 第二阶段：用户认证 | 3-4 天 | 5-7 天 |
| 第三阶段：博客文章 | 4-5 天 | 9-12 天 |
| 第四阶段：视频模块 | 4-5 天 | 13-17 天 |
| 第五阶段：音乐模块 | 3-4 天 | 16-21 天 |
| 第六阶段：友链模块 | 2-3 天 | 18-24 天 |
| 第七阶段：网盘模块 | 3-4 天 | 21-28 天 |
| 第八阶段：统计模块 | 3-4 天 | 24-32 天 |
| 第九阶段：搜索与优化 | 2-3 天 | 26-35 天 |
| 第十阶段：测试与部署 | 3-4 天 | 29-39 天 |

**总计：约 4-6 周（按 5 天/周计算）**

---

**文档版本**: v3.0 (Java + Spring Boot + MySQL + MyBatis Plus + Kafka)
**创建日期**: 2026-03-26
**更新日期**: 2026-03-26

