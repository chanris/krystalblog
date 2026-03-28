# KrystalBlog Backend

KrystalBlog 博客平台后端服务，基于 Spring Boot 3.2 + MyBatis Plus + MySQL。

## 技术栈

- Java 17 + Spring Boot 3.2.5
- MyBatis Plus 3.5.5
- MySQL 8.0+ / Redis 7.x / Kafka 3.6+
- Spring Security + JWT
- Flyway 数据库迁移
- SpringDoc OpenAPI (Swagger UI)

## 快速开始

### 环境要求

- JDK 17+
- Maven 3.8+
- MySQL 8.0+
- Redis 7.x
- Kafka 3.6+ (可选，开发环境可跳过)

### 数据库初始化

```sql
CREATE DATABASE krystalblog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 启动

```bash
# 安装依赖
mvn clean install -DskipTests

# 开发环境启动
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### API 文档

启动后访问: http://localhost:8080/swagger-ui.html

## 项目结构

```
src/main/java/com/krystalblog/
├── config/          # 配置类
├── common/          # 公共模块 (异常、响应、枚举、常量、工具)
├── security/        # 安全模块 (JWT、认证)
├── entity/          # 实体类
├── mapper/          # MyBatis Mapper
├── module/          # 业务模块
│   ├── auth/        # 认证
│   ├── user/        # 用户
│   ├── article/     # 文章
│   ├── video/       # 视频
│   ├── music/       # 音乐
│   ├── friendlink/  # 友链
│   ├── drive/       # 网盘
│   └── stats/       # 统计
├── aspect/          # AOP 切面
└── kafka/           # Kafka 消息
```

## 默认管理员

- 用户名: `admin`
- 密码: `admin123`
