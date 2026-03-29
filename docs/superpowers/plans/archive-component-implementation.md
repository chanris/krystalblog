# 归档列表组件实现计划

## 概述
在博客页面右侧边栏添加归档列表组件，支持按年月筛选文章。

## 实现步骤

### 步骤 1: 创建 ArchiveList 组件
**文件**: `krystalblog-frontend/src/app/components/ArchiveList.tsx`

创建可折叠的归档列表组件，包含：
- 从 API 获取归档数据
- 按年份分组显示
- 年份可折叠/展开
- 显示每月文章数量
- 点击月份触发筛选

**关键实现**:
- 使用 `useState` 管理展开的年份
- 使用 `useEffect` 加载归档数据
- 使用 `motion` 实现折叠动画
- 遵循现有样式系统（琥珀色主题）

### 步骤 2: 修改 Blog.tsx 集成组件
**文件**: `krystalblog-frontend/src/app/pages/Blog.tsx`

需要修改：
1. 导入 ArchiveList 组件
2. 在侧边栏添加组件（分类组件下方）
3. 传递 `activeArchive` 和 `setActiveArchive` props
4. 在 `filtered` 计算中添加归档筛选逻辑

**筛选逻辑**:
```typescript
if (activeArchive && !post.publishTime?.startsWith(activeArchive)) return false;
```

### 步骤 3: 测试功能
验证：
- 归档数据正确加载和显示
- 年份折叠/展开正常工作
- 点击月份正确筛选文章
- 样式与现有组件一致
- 移动端正确隐藏（lg:block）

## 技术细节

### API 调用
- 端点: `GET /api/articles/archives`
- 已在 `api.ts` 中定义: `articleApi.archives()`

### 数据结构
```typescript
interface ArchiveData {
  archive: string;  // "YYYY-MM"
  articles: Array<{
    id: number;
    title: string;
    date: string;
  }>;
}
```

### 组件 Props
```typescript
interface ArchiveListProps {
  activeArchive: string | null;
  onArchiveChange: (archive: string | null) => void;
}
```

## 验收标准
- [x] 组件显示在右侧边栏
- [x] 年份可折叠，默认展开当前年份
- [x] 点击月份筛选文章
- [x] 样式一致
- [x] 移动端隐藏
- [x] 加载和错误状态处理
