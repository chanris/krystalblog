# 真实访问量统计技术方案

## 方案概述

使用 **Redis + AOP** 实现高性能的访问量统计系统。

## 架构设计

```
用户访问 → Controller → AOP 拦截 → Redis 计数 → StatsService 查询 → 前端展示
```

## 核心组件

### 1. VisitStatsAspect（访问统计切面）

**位置**：`com.krystalblog.aspect.VisitStatsAspect`

**功能**：
- 拦截内容详情接口（文章/视频/音乐）
- 自动记录每日访问量到 Redis
- 异常容错，不影响主业务

**切点**：
- `ArticleController.getArticleDetail()`
- `VideoController.getVideoDetail()`
- `MusicController.getMusicDetail()`

**Redis Key 设计**：
- 格式：`stats:visits:daily:{yyyy-MM-dd}`
- 示例：`stats:visits:daily:2026-03-28`
- TTL：30 天自动过期

### 2. StatsService.getWeeklyVisits()

**功能**：
- 查询最近 7 天的访问量
- 从 Redis 读取真实数据
- 按星期格式化返回

**逻辑**：
```java
今天往前推 6 天 → 循环 7 次 → 读取 Redis → 组装返回
```

## 数据流

### 写入流程
1. 用户访问文章/视频/音乐详情
2. AOP 切面拦截方法执行
3. Redis INCR 操作（原子性）
4. 设置 30 天过期时间

### 读取流程
1. 前端请求 `/api/stats/visits/weekly`
2. StatsService 计算最近 7 天日期
3. 批量从 Redis 读取访问量
4. 格式化为周一到周日数据

## 技术优势

✅ **高性能**：Redis 内存操作，QPS 10万+
✅ **原子性**：INCR 命令保证并发安全
✅ **自动清理**：TTL 30天，无需手动维护
✅ **低侵入**：AOP 切面，业务代码零改动
✅ **容错性**：统计失败不影响主业务

## 实施清单

- [x] 创建 VisitStatsAspect 切面
- [x] 更新 StatsService 添加 Redis 依赖
- [x] 重写 getWeeklyVisits() 方法
- [ ] 测试访问统计功能
- [ ] 验证 Redis 数据写入
- [ ] 前端验证图表展示

## 测试方法

### 1. 手动测试
```bash
# 访问文章详情
curl http://localhost:8080/api/articles/1

# 检查 Redis
redis-cli
> GET stats:visits:daily:2026-03-28
"1"

# 查询周访问量
curl http://localhost:8080/api/stats/visits/weekly
```

### 2. 压力测试
```bash
# 使用 ab 工具模拟并发访问
ab -n 1000 -c 10 http://localhost:8080/api/articles/1
```

## 扩展方案

### 短期优化
- 添加页面级别统计（首页/列表页）
- 区分 UV（独立访客）和 PV（页面浏览）

### 长期优化
- 使用 Redis HyperLogLog 统计 UV
- 添加小时级别统计
- 实现访问来源分析
- 地域分布统计

## 注意事项

⚠️ **Redis 依赖**：确保 Redis 服务正常运行
⚠️ **数据初始化**：新部署环境前 7 天数据为 0
⚠️ **时区问题**：使用服务器本地时区
⚠️ **性能监控**：关注 Redis 内存使用

## 数据示例

```json
// GET /api/stats/visits/weekly
{
  "code": 200,
  "data": [
    {"day": "周一", "visits": 1234},
    {"day": "周二", "visits": 1890},
    {"day": "周三", "visits": 2345},
    {"day": "周四", "visits": 1987},
    {"day": "周五", "visits": 2678},
    {"day": "周六", "visits": 3456},
    {"day": "周日", "visits": 2890}
  ]
}
```
