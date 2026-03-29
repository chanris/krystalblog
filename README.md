# KrystalBlog

一个全栈博客/多媒体平台，支持博客文章、视频、音乐、网盘、友链、数据统计等功能模块。整体设计风格为暖色调（琥珀/amber 色系），侧边栏导航，配有全局音乐播放器。

## 技术栈

### 前端

- React 18 + TypeScript
- Vite 6 构建工具
- React Router 7 客户端路由
- Tailwind CSS 4 + shadcn/ui 组件库
- Material UI 7
- Lucide React 图标
- Motion 12 动画库
- Recharts 图表
- Axios HTTP 客户端
- Sonner Toast 通知

### 后端

- Java 17 + Spring Boot 3.2.5
- MyBatis Plus 3.5.5 ORM
- MySQL 数据库
- Redis 缓存
- Flyway 数据库迁移
- Spring Security + JWT 认证
- SpringDoc OpenAPI 文档

## 功能模块

| 模块 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | 统计卡片 + 最新文章/视频/音乐 |
| 博客 | `/blog` | 文章列表，分类/标签筛选，搜索，归档 |
| 博客详情 | `/blog/:id` | Markdown 渲染 + 评论 + 点赞 |
| 视频 | `/videos` | 视频列表，分类筛选，瀑布流布局 |
| 音乐 | `/music` | 歌曲列表，播放控制，喜欢收藏 |
| 网盘 | `/drive` | 文件夹/文件管理（管理员） |
| 友链 | `/friends` | 友链展示，分类筛选 |
| 统计 | `/stats` | 站点数据统计图表（管理员） |
| 登录 | `/login` | 登录/注册 |

## 快速开始

### 环境要求

- Node.js 18+
- pnpm
- Java 17
- Maven
- MySQL 8.0+
- Redis 6+

### 后端启动

```bash
cd krystalblog-backend

# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE krystalblog DEFAULT CHARACTER SET utf8mb4;"

# 2. 确保 MySQL(3306) 和 Redis(6379) 正在运行
# 开发环境默认配置: MySQL root/root, Redis 密码 root

# 3. 启动
mvn spring-boot:run
```

后端运行在 `http://localhost:8080`，API 文档: `http://localhost:8080/swagger-ui.html`

### 前端启动

```bash
cd krystalblog-frontend

pnpm install
pnpm dev
```

前端运行在 `http://localhost:5173`

### 默认账号

- 管理员: `admin` / `admin123`

## 项目结构

```
KrystalBlog/
├── krystalblog-frontend/          # React 前端
│   └── src/
│       ├── app/
│       │   ├── components/        # 可复用组件 (Layout, MusicPlayer, ui/)
│       │   ├── context/           # React Context 全局状态
│       │   ├── pages/             # 页面组件
│       │   ├── services/          # API 服务层 (Axios)
│       │   ├── data/              # 模拟数据
│       │   ├── App.tsx            # 根组件
│       │   └── routes.ts          # 路由配置
│       └── styles/                # CSS (Tailwind + 主题)
└── krystalblog-backend/           # Spring Boot 后端
    └── src/main/java/com/krystalblog/
        ├── module/                # 业务模块 (article/video/music/drive/friend/auth/user/stats)
        ├── entity/                # MyBatis Plus 实体
        ├── mapper/                # Mapper 接口
        ├── security/              # Spring Security + JWT
        ├── config/                # 配置类
        └── common/                # 统一响应、异常处理、工具类
```

## API 概览

| 模块 | 路径 | 说明 |
|------|------|------|
| 认证 | `/api/auth` | 登录/注册/刷新Token |
| 文章 | `/api/articles` | CRUD + 评论 + 点赞 + 归档 |
| 分类 | `/api/articles/categories` | 文章分类管理 |
| 标签 | `/api/articles/tags` | 文章标签管理 |
| 视频 | `/api/videos` | CRUD + 评论 + 点赞 |
| 音乐 | `/api/music` | CRUD + 喜欢/取消喜欢 |
| 歌单 | `/api/playlists` | 歌单管理 |
| 友链 | `/api/friends` | 友链列表 + 申请 |
| 网盘 | `/api/drive` | 文件夹/文件管理 |
| 统计 | `/api/stats` | 站点统计数据 |

## 开发命令

```bash
# 前端
pnpm dev              # 开发服务器
pnpm build            # 生产构建

# 后端
mvn spring-boot:run   # 启动服务
mvn clean package     # 打包
```
