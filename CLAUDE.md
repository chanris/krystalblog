# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概览

KrystalBlog 是一个全栈博客/多媒体平台，包含 React 前端和 Spring Boot 后端。支持博客文章、视频、音乐、网盘、友链、统计等多个功能模块。整体设计风格为暖色调（琥珀/amber 色系），侧边栏导航，配有全局音乐播放器。

## 仓库结构

```
KrystalBlog/
├── krystalblog-frontend/        # React 前端应用
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # 可复用 UI 组件
│   │   │   │   ├── Layout.tsx   # 全局布局（侧边栏 + 顶部导航栏 + 内容区）
│   │   │   │   ├── MusicPlayer.tsx  # 全局底部音乐播放器（含展开/折叠）
│   │   │   │   ├── figma/       # Figma 相关组件（ImageWithFallback）
│   │   │   │   └── ui/          # shadcn/ui 组件库（40+ 组件）
│   │   │   ├── context/         # React 上下文
│   │   │   │   └── AppContext.tsx   # 全局状态（管理员/侧边栏/音乐播放器）
│   │   │   ├── data/
│   │   │   │   └── mockData.ts  # 模拟数据（博客/视频/歌曲/网盘/友链/统计）
│   │   │   ├── pages/           # 页面组件
│   │   │   │   ├── Home.tsx     # 首页（统计卡片 + 最新文章/视频/音乐）
│   │   │   │   ├── Blog.tsx     # 博客列表（分类/标签筛选 + 搜索 + 归档）
│   │   │   │   ├── BlogDetail.tsx   # 博客详情（Markdown 渲染 + 评论 + 点赞）
│   │   │   │   ├── Videos.tsx   # 视频列表（分类筛选 + 瀑布流布局）
│   │   │   │   ├── Music.tsx    # 音乐页（歌曲列表 + 播放控制）
│   │   │   │   ├── Drive.tsx    # 网盘（文件夹/文件管理）
│   │   │   │   ├── Friends.tsx  # 友链展示（分类筛选 + 卡片布局）
│   │   │   │   ├── Stats.tsx    # 数据统计（Recharts 图表）
│   │   │   │   ├── Login.tsx    # 登录/注册（独立页面，不含 Layout）
│   │   │   │   └── NotFound.tsx # 404 页面
│   │   │   ├── services/        # API 服务层
│   │   │   │   ├── request.ts   # Axios 实例（baseURL + 拦截器）
│   │   │   │   └── api.ts       # 所有 API 调用函数
│   │   │   ├── App.tsx          # 根组件（AppProvider + RouterProvider）
│   │   │   └── routes.ts        # React Router 配置
│   │   ├── styles/              # CSS 样式
│   │   │   ├── index.css        # 入口（导入 fonts + tailwind + theme）
│   │   │   ├── tailwind.css     # Tailwind 入口
│   │   │   ├── theme.css        # shadcn/ui 主题变量（亮/暗模式）
│   │   │   └── fonts.css        # 字体定义
│   │   └── main.tsx             # 应用入口点
│   ├── package.json
│   └── vite.config.ts           # Vite 配置（@ 路径别名 + Tailwind 插件）
└── krystalblog-backend/         # Spring Boot 后端
    ├── src/main/java/com/krystalblog/
    │   ├── KrystalBlogApplication.java   # 启动类
    │   ├── module/              # 业务模块（按领域划分）
    │   │   ├── article/         # 文章（controller/service/dto/vo）
    │   │   ├── video/           # 视频（controller/service/dto/vo）
    │   │   ├── music/           # 音乐 + 歌单（controller/service/dto/vo）
    │   │   ├── drive/           # 网盘文件 + 文件夹（controller/service/dto/vo）
    │   │   ├── friend/          # 友链（controller/service/dto/vo）
    │   │   ├── auth/            # 认证（controller/service/dto/vo）
    │   │   ├── user/            # 用户管理（controller/service/dto）
    │   │   └── stats/           # 站点统计（controller/service/vo）
    │   ├── security/            # Spring Security + JWT 认证
    │   │   ├── jwt/
    │   │   │   ├── JwtTokenProvider.java    # JWT 生成/解析/验证
    │   │   │   └── JwtAuthenticationFilter.java  # JWT 过滤器（OncePerRequestFilter）
    │   │   ├── handler/
    │   │   │   ├── JwtAuthenticationEntryPoint.java  # 401 处理
    │   │   │   └── JwtAccessDeniedHandler.java       # 403 处理
    │   │   └── service/
    │   │       └── CustomUserDetailsService.java     # 用户详情加载
    │   ├── config/              # 配置类
    │   │   ├── MybatisPlusConfig.java   # 分页插件 + 自动填充 createdAt/updatedAt
    │   │   ├── RedisConfig.java         # Redis 配置
    │   │   ├── CorsConfig.java          # CORS 跨域配置（允许所有源）
    │   │   ├── SwaggerConfig.java       # SpringDoc/Swagger 配置
    │   │   ├── FileStorageConfig.java   # 文件存储配置
    │   │   └── AsyncConfig.java         # 异步配置
    │   ├── entity/              # MyBatis Plus 实体类
    │   │   ├── base/BaseEntity.java     # 基础实体（id + createdAt + updatedAt）
    │   │   ├── User.java        # 用户
    │   │   ├── Article.java     # 文章（含 @TableField 关联 categoryName/authorName/tags）
    │   │   ├── Category.java    # 文章分类
    │   │   ├── Tag.java         # 标签
    │   │   ├── ArticleTag.java  # 文章-标签关联
    │   │   ├── Comment.java     # 评论（支持文章和视频）
    │   │   ├── Like.java        # 点赞（支持文章和视频）
    │   │   ├── Video.java       # 视频
    │   │   ├── VideoCategory.java   # 视频分类
    │   │   ├── Playlist.java    # 歌单
    │   │   ├── PlaylistMusic.java   # 歌单-音乐关联
    │   │   ├── FriendLink.java  # 友链
    │   │   ├── DriveFile.java   # 网盘文件
    │   │   └── DriveFolder.java # 网盘文件夹
    │   ├── mapper/              # MyBatis Mapper 接口（均继承 BaseMapper）
    │   ├── common/              # 通用模块
    │   │   ├── result/
    │   │   │   ├── Result.java      # 统一响应 { code, message, data, timestamp }
    │   │   │   ├── ResultCode.java  # 错误码枚举（200/400/401/403/1001-3003）
    │   │   │   └── PageResult.java  # 分页响应
    │   │   ├── exception/
    │   │   │   ├── BusinessException.java       # 业务异常
    │   │   │   └── GlobalExceptionHandler.java  # 全局异常处理（@RestControllerAdvice）
    │   │   ├── enums/           # 枚举（UserRole/UserStatus/ArticleStatus）
    │   │   ├── constant/        # 常量
    │   │   └── util/            # 工具类（SecurityUtil）
    │   └── aspect/
    │       └── RequestLogAspect.java  # AOP 请求日志（方法+URI+耗时+IP）
    ├── src/main/resources/
    │   ├── application.yml          # 主配置
    │   ├── application-dev.yml      # 开发环境（MySQL/Redis 连接）
    │   ├── application-prod.yml     # 生产环境
    │   ├── logback-spring.xml       # 日志配置
    │   └── db/migration/            # Flyway 数据库迁移（V1~V8）
    └── pom.xml
```

## 技术栈

### 前端

- **React 18.3.1** + TypeScript
- **Vite 6.3.5** - 构建工具和开发服务器
- **React Router 7.13.0** - 客户端路由（`createBrowserRouter`）
- **Tailwind CSS 4.1.12** - 通过 `@tailwindcss/vite` 插件集成
- **shadcn/ui** - 基于 Radix UI + Tailwind 的组件库（40+ 组件已安装）
- **Material UI (MUI 7)** - UI 组件库（`@mui/material` + `@mui/icons-material`）
- **Lucide React 0.487.0** - 主要图标库
- **Motion 12** - 动画库（从 `motion/react` 导入，非 `framer-motion`）
- **Axios** - HTTP 客户端（请求超时 10s）
- **Recharts 2.15.2** - 图表
- **React DnD 16** - 拖拽
- **Sonner 2.0.3** - Toast 通知
- **cmdk 1.1.1** - 命令面板
- **date-fns 3.6.0** - 日期处理
- **class-variance-authority + clsx + tailwind-merge** - 样式工具
- **react-responsive-masonry** - 瀑布流布局
- **embla-carousel-react** - 轮播
- **vaul** - 抽屉组件
- **canvas-confetti** - 五彩纸屑效果

### 后端

- **Java 17** + **Spring Boot 3.2.5**
- **MyBatis Plus 3.5.5** - ORM 框架（分页插件 + 自动填充）
- **MySQL** - 主数据库（`krystalblog` 库）
- **Redis** - 缓存（Lettuce 连接池）
- **Flyway** - 数据库迁移
- **Spring Security + JWT (JJWT 0.12.5)** - 认证授权
- **SpringDoc OpenAPI 2.3.0** - API 文档（`/swagger-ui.html`）
- **Lombok** - 代码简化
- **Hutool** - Java 工具库

## 开发命令

### 前端（从 `krystalblog-frontend/` 目录）

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器（默认端口 5173）
pnpm build            # 生产构建
```

### 后端（从 `krystalblog-backend/` 目录）

```bash
# 前置条件：MySQL（3306）、Redis（6379）正在运行
# 开发环境数据库：krystalblog，用户 root/root
mvn spring-boot:run   # 启动后端服务（端口 8080）
mvn clean package     # 打包
```

## 关键架构说明

### 前后端通信

- 前端通过 Axios 调用后端 API，基地址为 `http://localhost:8080/api`
- 请求拦截器自动附加 JWT Bearer Token（存储在 `localStorage`，key: `token`）
- **注意**：`request.ts` 中的响应拦截器执行了 `response.data` 解包，所以 `api.ts` 中的泛型类型 `Result<T>` 实际上就是最终返回值，不需要再 `.data`
- 统一响应格式：`{ code: number, message: string, data: T, timestamp: number }`
- 分页由 MyBatis Plus `IPage` 提供：`{ records: T[], total, size, current, pages }`
- API 服务按模块集中定义在 `src/app/services/api.ts`：
  - `articleApi` - 文章 CRUD + 评论 + 点赞 + 归档
  - `tagApi` - 标签 CRUD
  - `categoryApi` - 分类 CRUD
  - `videoApi` - 视频列表/详情/点赞
  - `musicApi` - 音乐列表 + 歌单
  - `friendLinkApi` - 友链列表
  - `driveApi` - 网盘文件夹/文件
  - `statsApi` - 站点统计

### 路由与布局

- 使用 React Router v7 的 `createBrowserRouter`
- `Layout` 组件包裹所有主页面，提供：
  - **左侧边栏**（240px）：Logo + 主导航 + 管理员导航（仅管理员可见）+ 用户信息
  - **顶部栏**（60px）：侧边栏切换 + 搜索框 + 登录/登出按钮 + 通知
  - **内容区**：带路由切换动画（`motion` 淡入向上）
  - **底部音乐播放器**：当有歌曲播放时显示
- `/login` 为独立页面，不经过 Layout
- 导航项：
  - 主导航：首页(`/`) | 博客文章(`/blog`) | 视频(`/videos`) | 音乐(`/music`) | 友情链接(`/friends`)
  - 管理员专属：网盘(`/drive`) | 数据统计(`/stats`)
  - 独立页面：博客详情(`/blog/:id`) | 登录(`/login`) | 404(`*`)

### 状态管理

- 通过 `src/app/context/AppContext.tsx` 中的 React Context 进行全局状态管理
- 使用 `useApp()` Hook 访问上下文
- `AppProvider` 包裹整个应用（在 `App.tsx` 中）
- 管理员模式：初始化时自动解析 `localStorage` 中 JWT Token 的 payload `role` 字段
- 提供的状态和方法：
  - `isAdmin` / `setIsAdmin` - 管理员模式
  - `sidebarOpen` / `setSidebarOpen` - 侧边栏开关
  - 音乐播放器：`currentSong` / `playlist` / `isPlaying` / `currentTime` / `volume`
  - 音乐控制：`setCurrentSong(song, list?)` / `togglePlay()` / `nextSong()` / `prevSong()` / `setVolume(v)` / `setCurrentTime(t)`
- 音乐播放使用 `setInterval` 模拟播放进度（每秒 +1），不是真实音频播放

### 样式与主题

- **设计风格**：暖色调，以琥珀色（amber/`#d97706`）为主色，米色背景（`#faf8f5` / `#fffbf5`）
- Tailwind CSS 4 + shadcn/ui 主题系统
- `src/styles/theme.css`：shadcn/ui 主题变量定义（使用 `oklch` 色彩空间），支持亮/暗模式切换
- `src/styles/index.css`：入口文件，按顺序导入 fonts -> tailwind -> theme
- 组件中大量使用内联 `style` 配合 Tailwind class（混合使用模式）
- 关键颜色值：
  - 主色：`#d97706`（琥珀色）/ `#f59e0b`（亮琥珀）
  - 背景：`#faf8f5`（主区域）/ `#fffbf5`（侧边栏/顶栏）
  - 分隔线：`#f3e8d0`
  - 文字：`#1c1917`（标题）/ `#78716c`（正文）/ `#a8956b`（辅助）
- `@` 路径别名指向 `src/` 目录

### 后端模块架构

每个业务模块统一遵循分层结构：
- `controller/` - REST API 控制器（`@RestController`，路径前缀 `/api/xxx`）
- `service/` - 业务逻辑层（`@Service`）
- `dto/` - 数据传输对象（请求参数，含 Jakarta Validation 注解）
- `vo/` - 视图对象（响应数据，使用 `@Builder`）

### 后端 API 端点清单

| 模块 | 路径前缀 | 主要端点 | 权限 |
|------|---------|---------|------|
| 认证 | `/api/auth` | POST `/login` `/register` `/refresh` `/logout` | 公开 |
| 用户 | `/api/users` | GET/PUT 用户信息管理 | 登录/管理员 |
| 文章 | `/api/articles` | GET 列表/详情, POST/PUT/DELETE CRUD, GET 归档 | 查看公开/CUD 管理员 |
| 文章评论 | `/api/articles/{id}/comments` | GET 列表, POST 创建 | 查看公开/创建需登录 |
| 文章点赞 | `/api/articles/{id}/like` | POST 点赞, DELETE 取消 | 需登录 |
| 分类 | `/api/articles/categories` | GET 列表, POST/PUT/DELETE | CUD 管理员 |
| 标签 | `/api/articles/tags` | GET 列表, POST/PUT/DELETE | CUD 管理员 |
| 视频 | `/api/videos` | GET 列表/详情, POST/PUT/DELETE CRUD | 查看公开/CUD 管理员 |
| 视频评论 | `/api/videos/{id}/comments` | GET/POST | 查看公开/创建需登录 |
| 视频点赞 | `/api/videos/{id}/like` | POST/DELETE | 需登录 |
| 视频分类 | `/api/video-categories` | CRUD | CUD 管理员 |
| 音乐 | `/api/music` | GET 列表/详情, POST/PUT/DELETE | 查看公开/CUD 管理员 |
| 歌单 | `/api/playlists` | GET 列表/详情, POST/PUT/DELETE | CUD 管理员 |
| 友链 | `/api/friends` | GET 列表, POST 申请, PUT/DELETE | 更新删除管理员 |
| 网盘文件夹 | `/api/drive/folders` | GET 列表, POST/PUT/DELETE | CUD 需登录 |
| 网盘文件 | `/api/drive/files` | GET 列表/详情, POST/DELETE | CUD 需登录 |
| 统计 | `/api/stats` | GET 站点统计 | 公开 |

### 安全认证详解

- **Spring Security + JWT 双 Token 机制**
- `JwtTokenProvider`：生成/验证/解析 JWT Token
  - Access Token：24 小时有效，用于 API 认证
  - Refresh Token：7 天有效，用于刷新 Access Token
  - Token 中包含 claims：`sub`(userId), `username`, `role`, `type`(access/refresh)
- `JwtAuthenticationFilter`：拦截请求，从 `Authorization: Bearer <token>` 提取 token，验证后设置 SecurityContext
  - 仅处理 `type=access` 的 token
- 权限控制使用 `@PreAuthorize`：
  - `hasRole('ADMIN')` - 管理员操作（文章/视频/音乐的 CUD）
  - `isAuthenticated()` - 登录用户操作（评论/点赞/网盘操作）
- 登录流程：
  1. 前端 POST `/api/auth/login` → 后端返回 `{ accessToken, refreshToken, user }`
  2. 前端存储 `token`（accessToken）和 `userInfo` 到 `localStorage`
  3. 前端 `AppContext` 初始化时解析 JWT payload 设置 `isAdmin`
  4. 后续请求通过 Axios 拦截器自动附加 `Bearer` Token
- 默认管理员账号：`admin` / `admin123`

### 数据库设计

**Flyway 迁移文件** 位于 `src/main/resources/db/migration/`：
- V1: 用户表（`users`）- username/email/password/nickname/avatar/bio/role/status
- V2: 博客模块 - `categories`(6个默认分类) + `tags`(13个默认标签) + `articles` + `article_tags` + `comments`(支持文章和视频) + `likes`(支持文章和视频)
- V3: 视频模块 - `videos` + `video_categories`
- V4: 音乐模块 - `music` + `playlists` + `playlist_music`
- V5: 友链模块 - `friend_links`
- V6: 网盘模块 - `drive_folders`(支持层级) + `drive_files`
- V7: 统计模块 - `site_stats`(按日统计)
- V8: 修复 likes 表

**基础实体**（`BaseEntity`）：所有实体共有 `id`(自增), `createdAt`(自动填充), `updatedAt`(自动填充)

**逻辑删除**：MyBatis Plus 配置了 `logic-delete-field: deleted`，字段值 1=已删除/0=未删除

**字段命名**：数据库使用下划线命名（`cover_image`），Java 使用驼峰（`coverImage`），MyBatis Plus 自动映射

### 全局异常处理

`GlobalExceptionHandler`（`@RestControllerAdvice`）统一捕获：
- `BusinessException` → 业务错误码
- `MethodArgumentNotValidException` → 400 参数校验
- `BadCredentialsException` → 1001 登录失败
- `AccessDeniedException` → 403 无权限
- `MaxUploadSizeExceededException` → 3003 文件超限
- `Exception` → 500 兜底

### 错误码体系

| 范围 | 说明 | 示例 |
|------|------|------|
| 200 | 成功 | SUCCESS |
| 400-404 | HTTP 标准错误 | BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND |
| 1001-1006 | 认证相关 | LOGIN_FAILED, TOKEN_EXPIRED, USERNAME_EXISTS |
| 2001-2008 | 业务资源相关 | CATEGORY_NOT_FOUND, ARTICLE_NOT_FOUND |
| 3001-3003 | 文件相关 | FILE_UPLOAD_FAILED, FILE_SIZE_EXCEEDED |

### AOP 日志

`RequestLogAspect` 对所有 `module..controller` 包下的方法进行环绕通知，记录：
- HTTP 方法、URI、状态码、耗时（ms）、客户端 IP（支持 X-Forwarded-For/X-Real-IP）

### 前端数据模式

目前前端页面**同时使用**两种数据源：
1. **API 调用**：`Home.tsx`、`Login.tsx`、`BlogDetail.tsx` 等已对接后端 API
2. **Mock 数据**：`mockData.ts` 中定义了完整的模拟数据，部分页面仍使用 mock 数据作为降级或默认展示

`mockData.ts` 中定义的类型接口（`BlogPost`, `Video`, `Song`, `DriveFile`, `Friend`）是前端的核心数据类型定义。

### 关键组件说明

**Layout.tsx**：
- 侧边栏导航，使用 `NavLink` + `motion layoutId` 实现导航指示器动画
- 管理员项（网盘/统计）仅在 `isAdmin` 时显示
- 用户区域：已登录显示头像/昵称/角色，未登录显示"点击登录"
- 搜索框：UI 已实现，功能待对接
- 通知按钮：UI 已实现，功能待对接

**MusicPlayer.tsx**：
- 固定在页面底部的全局音乐播放器
- 支持展开/折叠视图，展开显示大封面和专辑信息
- 播放/暂停/上一首/下一首/音量/进度条/静音
- 专辑封面在播放时有旋转动画（CSS animation）

## 开发注意事项

### 前端

- 动画库使用 `motion` 包（v12+），从 `motion/react` 导入，**不是** `framer-motion`
- UI 组件优先使用 `src/app/components/ui/` 中已有的 shadcn/ui 组件
- 路径别名 `@` 指向 `src/` 目录，如 `@/app/components/ui/button`
- shadcn/ui 工具函数在 `src/app/components/ui/utils.ts`（`cn` 函数）
- 移动端响应式 hook：`src/app/components/ui/use-mobile.ts`
- 页面组件同时使用 Tailwind class 和内联 style，修改样式时需注意两者

### 后端

- 使用 `spring.profiles.active: dev` 默认激活开发环境
- 文件上传大小限制：2048MB
- Jackson 配置：日期格式 `yyyy-MM-dd HH:mm:ss`，时区 `Asia/Shanghai`
- Swagger UI 地址：`http://localhost:8080/swagger-ui.html`
- CORS 已配置允许所有来源（开发用）
- MySQL 数据库名：`krystalblog`，开发环境默认 `root/root`
- Redis 端口 6379，开发环境密码 `acid10837`

## 设计参考

原始 Figma 设计：https://www.figma.com/design/kFQmaHUoLceT5ELIoxFo2v/KrystalBlog
