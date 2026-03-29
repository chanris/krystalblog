# 归档列表组件设计规范

## 需求概述

在博客页面右侧边栏添加归档列表组件，按年份和月份展示文章归档信息，支持点击筛选。

## 用户需求确认

- **位置**: 右侧边栏，在标签云和分类组件下方
- **移动端**: 完全隐藏（仅在 lg 及以上显示）
- **交互**: 点击月份在当前页面筛选文章
- **性能**: 无需懒加载（数据量小）

## 技术方案

### 后端 API（已存在）

**端点**: `GET /api/articles/archives`

**响应格式**:
```json
[
  {
    "archive": "2026-03",
    "articles": [
      { "id": 1, "title": "文章标题", "date": "2026-03-15T10:00:00" }
    ]
  }
]
```

### 前端实现

#### 1. 组件结构

创建 `ArchiveList.tsx` 组件：
- 可折叠的年份分组
- 每个年份下显示月份列表
- 显示每月文章数量
- 默认展开当前年份

#### 2. 状态管理

复用 Blog.tsx 现有状态：
- `activeArchive: string | null` - 已存在，格式 "YYYY-MM"
- `setActiveArchive` - 用于筛选

#### 3. 数据流

```
组件挂载 → 调用 articleApi.archives() → 解析数据 → 按年份分组 → 渲染树形结构
用户点击月份 → setActiveArchive("YYYY-MM") → Blog.tsx 筛选文章列表
```

#### 4. 筛选逻辑

在 Blog.tsx 的 `filtered` 计算中添加：
```typescript
if (activeArchive && !post.publishTime?.startsWith(activeArchive)) return false;
```

## 实现步骤

1. 创建 `ArchiveList.tsx` 组件
2. 在 Blog.tsx 中导入并添加到 sidebar
3. 添加归档筛选逻辑到 `filtered` 计算
4. 测试交互和样式

## 样式规范

遵循现有设计系统：
- 背景: `white`
- 阴影: `0 2px 12px rgba(120,80,20,0.06)`
- 圆角: `rounded-2xl`
- 内边距: `p-5`
- 主色: `#d97706` (琥珀色)
- 激活背景: `#fef3c7`
- 文字颜色: `#1c1917` (标题), `#78716c` (正文), `#a8956b` (辅助)

## 组件接口

```typescript
interface ArchiveListProps {
  activeArchive: string | null;
  onArchiveChange: (archive: string | null) => void;
}
```

## 非功能需求

- ✅ 响应式：lg 以上显示，移动端隐藏
- ✅ 加载状态：显示骨架屏或加载提示
- ✅ 错误处理：API 失败时显示友好提示
- ❌ 单元测试：不需要（保持最小化）
- ❌ 接口文档：不需要（使用现有 API）
- ❌ 懒加载：不需要（数据量小）

## 验收标准

1. 归档组件正确显示在右侧边栏
2. 年份可折叠/展开，默认展开当前年份
3. 点击月份正确筛选文章列表
4. 样式与现有组件一致
5. 移动端正确隐藏
6. 加载和错误状态正常显示
