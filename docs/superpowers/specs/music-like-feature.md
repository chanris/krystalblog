# 音乐模块"喜欢"功能设计文档

## 1. 需求概述

为音乐模块添加"喜欢"功能，允许登录用户收藏喜欢的歌曲，并通过"我的喜欢"分类查看。

### 核心功能
- 用户登录状态检测
- 登录用户显示"我的喜欢"分类标签
- 所有用户显示喜欢按钮，未登录点击提示登录
- 喜欢/取消喜欢操作
- "我的喜欢"歌曲列表展示
- 数据持久化存储
- 跨设备同步

## 2. 设计决策

### 2.1 数据存储方案
**采用方案**：使用现有 `Playlist` 表

**理由**：
- 复用现有的 `playlists` 和 `playlist_music` 表结构
- 利用已有的歌单管理代码
- 为每个用户自动创建一个特殊类型的"我的喜欢"歌单

**实现方式**：
- 在 `Playlist` 实体添加 `type` 字段（VARCHAR(20)）
- 类型值：`NORMAL`（普通歌单）、`LIKED`（我的喜欢）
- 用户首次喜欢歌曲时自动创建 `type=LIKED` 的歌单

### 2.2 UI 交互方案
**喜欢按钮显示**：所有用户都显示，未登录点击时提示登录
**"我的喜欢"标签**：仅登录用户可见，显示在分类筛选区域
**状态同步**：页面加载时从后端获取用户的喜欢列表

## 3. 数据库设计

### 3.1 表结构变更

**修改 `playlists` 表**：
```sql
ALTER TABLE playlists ADD COLUMN type VARCHAR(20) DEFAULT 'NORMAL' COMMENT '歌单类型：NORMAL-普通，LIKED-我的喜欢';
ALTER TABLE playlists ADD INDEX idx_user_type (user_id, type);
```

### 3.2 数据约束
- 每个用户只能有一个 `type=LIKED` 的歌单
- `LIKED` 类型歌单的 `name` 固定为 "我的喜欢"
- `LIKED` 类型歌单的 `is_public` 默认为 `false`

## 4. 后端 API 设计

### 4.1 新增接口

#### 4.1.1 喜欢歌曲
```
POST /api/music/{id}/like
```
- 权限：需登录
- 功能：将歌曲添加到用户的"我的喜欢"歌单
- 响应：`Result<Boolean>` - true 表示已喜欢

#### 4.1.2 取消喜欢
```
DELETE /api/music/{id}/like
```
- 权限：需登录
- 功能：从用户的"我的喜欢"歌单移除歌曲
- 响应：`Result<Boolean>` - false 表示已取消

#### 4.1.3 获取用户喜欢的歌曲 ID 列表
```
GET /api/music/liked/ids
```
- 权限：需登录
- 功能：返回当前用户喜欢的所有歌曲 ID
- 响应：`Result<List<Long>>`

#### 4.1.4 获取用户喜欢的歌曲列表（分页）
```
GET /api/music/liked
```
- 权限：需登录
- 参数：`page`, `size`
- 功能：返回用户喜欢的歌曲列表（分页）
- 响应：`Result<IPage<MusicVO>>`

## 5. 后端实现细节

### 5.1 实体类修改

**Playlist.java**：
```java
private String type; // NORMAL, LIKED
```

### 5.2 Service 层逻辑

**PlaylistService 新增方法**：
- `Playlist getOrCreateLikedPlaylist(Long userId)` - 获取或创建用户的"我的喜欢"歌单
- `boolean isLiked(Long userId, Long musicId)` - 检查歌曲是否已喜欢
- `List<Long> getLikedMusicIds(Long userId)` - 获取用户喜欢的歌曲 ID 列表

**MusicService 新增方法**：
- `boolean likeMus(Long userId, Long musicId)` - 喜欢歌曲
- `boolean unlikeMusic(Long userId, Long musicId)` - 取消喜欢
- `IPage<MusicVO> getLikedMusic(Long userId, int page, int size)` - 获取喜欢的歌曲列表

### 5.3 Controller 层

**MusicController 新增端点**：
```java
@PostMapping("/{id}/like")
@PreAuthorize("isAuthenticated()")
public Result<Boolean> likeMusic(@PathVariable Long id)

@DeleteMapping("/{id}/like")
@PreAuthorize("isAuthenticated()")
public Result<Boolean> unlikeMusic(@PathVariable Long id)

@GetMapping("/liked/ids")
@PreAuthorize("isAuthenticated()")
public Result<List<Long>> getLikedMusicIds()

@GetMapping("/liked")
@PreAuthorize("isAuthenticated()")
public Result<IPage<MusicVO>> getLikedMusic(@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size)
```

## 6. 前端实现细节

### 6.1 AppContext 扩展

添加用户登录状态检测：
```typescript
const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
  const token = localStorage.getItem('token');
  setIsLoggedIn(!!token);
}, []);
```

### 6.2 Music.tsx 修改

**状态管理**：
```typescript
const [likedMusicIds, setLikedMusicIds] = useState<Set<number>>(new Set());
const [showLikedOnly, setShowLikedOnly] = useState(false);
```

**加载喜欢列表**：
```typescript
const loadLikedMusic = async () => {
  if (!isLoggedIn) return;
  const res = await musicApi.getLikedIds();
  setLikedMusicIds(new Set(res.data));
};
```

**喜欢按钮逻辑**：
```typescript
const handleLike = async (songId: number) => {
  if (!isLoggedIn) {
    toast.error("请先登录");
    return;
  }

  const isLiked = likedMusicIds.has(songId);
  try {
    if (isLiked) {
      await musicApi.unlike(songId);
      setLikedMusicIds(prev => {
        const next = new Set(prev);
        next.delete(songId);
        return next;
      });
    } else {
      await musicApi.like(songId);
      setLikedMusicIds(prev => new Set(prev).add(songId));
    }
  } catch (error) {
    toast.error("操作失败");
  }
};
```

**"我的喜欢"分类标签**：
```typescript
{isLoggedIn && (
  <button onClick={() => setShowLikedOnly(!showLikedOnly)}>
    我的喜欢
  </button>
)}
```

### 6.3 API 服务

**api.ts 新增**：
```typescript
export const musicApi = {
  // ... 现有方法
  like: (id: number) => request.post<Result<boolean>>(`/music/${id}/like`),
  unlike: (id: number) => request.delete<Result<boolean>>(`/music/${id}/like`),
  getLikedIds: () => request.get<Result<number[]>>('/music/liked/ids'),
  getLiked: (params: { page?: number; size?: number }) =>
    request.get<Result<PageResult<any>>>('/music/liked', { params }),
};
```

## 7. 性能优化

### 7.1 防抖处理
喜欢按钮点击添加防抖，防止重复请求（200ms）

### 7.2 批量查询
页面加载时一次性获取所有喜欢的歌曲 ID，避免逐个查询

### 7.3 乐观更新
点击喜欢按钮时立即更新 UI，API 失败时回滚

## 8. 测试要点

### 8.1 后端测试
- 未登录用户调用喜欢接口返回 401
- 首次喜欢自动创建"我的喜欢"歌单
- 重复喜欢同一首歌不会重复添加
- 取消喜欢正确移除关联
- 获取喜欢列表分页正确

### 8.2 前端测试
- 未登录用户看到喜欢按钮但点击提示登录
- 登录用户看到"我的喜欢"分类标签
- 喜欢按钮状态正确切换（空心/实心）
- 点击"我的喜欢"标签正确筛选
- 跨页面喜欢状态保持一致

## 9. 实现步骤

1. 后端数据库迁移（Flyway）
2. 后端实体类修改
3. 后端 Service 层实现
4. 后端 Controller 层实现
5. 前端 API 服务扩展
6. 前端 AppContext 扩展
7. 前端 Music.tsx 修改
8. 测试验证

## 10. 风险与注意事项

- 确保 `type` 字段默认值为 `NORMAL`，避免影响现有歌单
- 喜欢操作需要事务保证一致性
- 前端需要处理 token 过期的情况
- 考虑未来可能的"公开我的喜欢"功能扩展
