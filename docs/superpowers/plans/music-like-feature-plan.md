# 音乐模块"喜欢"功能实现计划

## 概述
基于设计文档 `music-like-feature.md`，实现音乐模块的喜欢功能。

## 实现步骤

### 步骤 1: 数据库迁移
**文件**: `krystalblog-backend/src/main/resources/db/migration/V9__add_playlist_type.sql`

创建 Flyway 迁移脚本：
```sql
ALTER TABLE playlists ADD COLUMN type VARCHAR(20) DEFAULT 'NORMAL' COMMENT '歌单类型：NORMAL-普通，LIKED-我的喜欢';
ALTER TABLE playlists ADD INDEX idx_user_type (user_id, type);
```

### 步骤 2: 修改 Playlist 实体
**文件**: `krystalblog-backend/src/main/java/com/krystalblog/entity/Playlist.java`

添加字段：
```java
private String type; // NORMAL, LIKED
```

### 步骤 3: 扩展 PlaylistService
**文件**: `krystalblog-backend/src/main/java/com/krystalblog/module/music/service/PlaylistService.java`

新增方法：
- `Playlist getOrCreateLikedPlaylist(Long userId)`
- `List<Long> getLikedMusicIds(Long userId)`
- `boolean addMusicToLiked(Long userId, Long musicId)`
- `boolean removeMusicFromLiked(Long userId, Long musicId)`

### 步骤 4: 扩展 MusicService
**文件**: `krystalblog-backend/src/main/java/com/krystalblog/module/music/service/MusicService.java`

新增方法：
- `boolean likeMusic(Long userId, Long musicId)`
- `boolean unlikeMusic(Long userId, Long musicId)`
- `List<Long> getLikedMusicIds(Long userId)`
- `IPage<MusicVO> getLikedMusic(Long userId, int page, int size)`

### 步骤 5: 扩展 MusicController
**文件**: `krystalblog-backend/src/main/java/com/krystalblog/module/music/controller/MusicController.java`

新增端点：
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
public Result<IPage<MusicVO>> getLikedMusic(
    @RequestParam(defaultValue = "1") int page,
    @RequestParam(defaultValue = "20") int size)
```

### 步骤 6: 扩展前端 API 服务
**文件**: `krystalblog-frontend/src/app/services/api.ts`

在 `musicApi` 对象中添加：
```typescript
like: (id: number) => request.post<Result<boolean>>(`/music/${id}/like`),
unlike: (id: number) => request.delete<Result<boolean>>(`/music/${id}/like`),
getLikedIds: () => request.get<Result<number[]>>('/music/liked/ids'),
getLiked: (params: { page?: number; size?: number }) =>
  request.get<Result<PageResult<any>>>('/music/liked', { params }),
```

### 步骤 7: 扩展 AppContext
**文件**: `krystalblog-frontend/src/app/context/AppContext.tsx`

添加登录状态：
```typescript
const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
  const token = localStorage.getItem('token');
  setIsLoggedIn(!!token);
}, []);
```

导出 `isLoggedIn` 到 context。

### 步骤 8: 修改 Music.tsx
**文件**: `krystalblog-frontend/src/app/pages/Music.tsx`

1. 添加状态：`likedMusicIds`, `showLikedOnly`
2. 添加 `loadLikedMusic()` 函数
3. 修改现有喜欢按钮逻辑（行 436-449）
4. 在分类筛选区域添加"我的喜欢"按钮（仅登录用户可见）
5. 当 `showLikedOnly=true` 时，调用 `/music/liked` 接口

### 步骤 9: 测试验证
- 启动后端，验证数据库迁移成功
- 测试喜欢/取消喜欢 API
- 测试前端登录/未登录状态
- 测试"我的喜欢"筛选功能

## 关键注意事项
- 使用事务保证喜欢操作的一致性
- 前端使用乐观更新提升体验
- 防抖处理避免重复请求
- 确保 token 过期时的错误处理
