import request from './request';

export interface Result<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current?: number;
  page?: number;
  pages?: number;
}

export interface VideoVO {
  id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  coverImage?: string;
  duration?: string;
  categoryId?: number;
  categoryName?: string;
  authorId?: number;
  authorName?: string;
  status?: string;
  views?: number;
  likesCount?: number;
  commentsCount?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoCategoryVO {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoCategoryManageDTO {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface VideoCreateDTO {
  title: string;
  description?: string;
  videoUrl: string;
  coverImage?: string;
  duration?: number;
  categoryId: number;
  status?: string;
  publishedAt?: string;
}

export interface CommentVO {
  id: number;
  content: string;
  articleId?: number;
  videoId?: number;
  authorId?: number;
  authorName?: string;
  authorAvatar?: string;
  parentId?: number;
  replies?: CommentVO[];
  createdAt?: string;
}

// 文章相关
export const articleApi = {
  list: (params: { page?: number; size?: number; categoryId?: number; tagId?: number; keyword?: string }) =>
    request.get<Result<PageResult<any>>>('/articles', { params }),

  detail: (id: number) =>
    request.get<Result<any>>(`/articles/${id}`),

  create: (data: { title: string; content: string; categoryId: number; coverImage?: string; excerpt?: string; tagIds?: number[]; status?: string }) =>
    request.post<Result<any>>('/articles', data),

  update: (id: number, data: { title?: string; content?: string; categoryId?: number; coverImage?: string; excerpt?: string; tagIds?: number[]; status?: string }) =>
    request.put<Result<any>>(`/articles/${id}`, data),

  delete: (id: number) =>
    request.delete<Result<void>>(`/articles/${id}`),

  like: (id: number) =>
    request.post<Result<boolean>>(`/articles/${id}/like`),

  unlike: (id: number) =>
    request.delete<Result<boolean>>(`/articles/${id}/like`),

  archives: () =>
    request.get<Result<any[]>>('/articles/archives'),

  // 评论相关
  getComments: (id: number, params?: { page?: number; size?: number }) =>
    request.get<Result<PageResult<any>>>(`/articles/${id}/comments`, { params }),

  createComment: (id: number, data: { content: string; parentId?: number }) =>
    request.post<Result<any>>(`/articles/${id}/comments`, data),

  deleteComment: (commentId: number) =>
    request.delete<Result<void>>(`/articles/comments/${commentId}`),
};

// 标签相关
export const tagApi = {
  list: () =>
    request.get<Result<any[]>>('/articles/tags'),

  create: (data: { name: string; slug?: string }) =>
    request.post<Result<any>>('/articles/tags', data),

  update: (id: number, data: { name: string; slug?: string }) =>
    request.put<Result<any>>(`/articles/tags/${id}`, data),

  delete: (id: number) =>
    request.delete<Result<void>>(`/articles/tags/${id}`),
};

// 分类相关
export const categoryApi = {
  list: () =>
    request.get<Result<any[]>>('/articles/categories'),

  create: (data: { name: string; slug?: string; description?: string }) =>
    request.post<Result<any>>('/articles/categories', data),

  update: (id: number, data: { name: string; slug?: string; description?: string }) =>
    request.put<Result<any>>(`/articles/categories/${id}`, data),

  delete: (id: number) =>
    request.delete<Result<void>>(`/articles/categories/${id}`),
};

// 视频相关
export const videoApi = {
  list: (params: { page?: number; size?: number; status?: string; categoryId?: number; keyword?: string }) =>
    request.get<Result<PageResult<VideoVO>>>('/videos', { params }),

  detail: (id: number) =>
    request.get<Result<VideoVO>>(`/videos/${id}`),

  create: (data: VideoCreateDTO) =>
    request.post<Result<VideoVO>>('/videos', data),

  categories: () =>
    request.get<Result<VideoCategoryVO[]>>('/videos/categories'),

  createCategory: (data: VideoCategoryManageDTO) =>
    request.post<Result<VideoCategoryVO>>('/videos/categories', data),

  updateCategory: (id: number, data: VideoCategoryManageDTO) =>
    request.put<Result<VideoCategoryVO>>(`/videos/categories/${id}`, data),

  deleteCategory: (id: number) =>
    request.delete<Result<void>>(`/videos/categories/${id}`),

  comments: (id: number, params?: { page?: number; size?: number }) =>
    request.get<Result<PageResult<CommentVO>>>(`/videos/${id}/comments`, { params }),

  createComment: (id: number, data: { content: string; parentId?: number }) =>
    request.post<Result<CommentVO>>(`/videos/${id}/comments`, data),

  like: (id: number) =>
    request.post<Result<boolean>>(`/videos/${id}/like`),

  unlike: (id: number) =>
    request.delete<Result<boolean>>(`/videos/${id}/like`),
};

// 音乐相关
export const musicApi = {
  list: (params?: { page?: number; size?: number; genre?: string; keyword?: string; artistId?: number; categoryId?: number; tag?: string; sortBy?: string }) =>
    request.get<Result<PageResult<any>>>('/music', { params }),

  detail: (id: number) =>
    request.get<Result<any>>(`/music/${id}`),

  hot: (limit?: number) =>
    request.get<Result<any[]>>('/music/hot', { params: { limit } }),

  artists: () =>
    request.get<Result<any[]>>('/music/artists'),

  categories: () =>
    request.get<Result<any[]>>('/music/categories'),

  tags: () =>
    request.get<Result<string[]>>('/music/tags'),

  create: (data: { title: string; audioUrl: string; description?: string; cover?: string; duration?: number; lyrics?: string; lyricsUrl?: string; artistId?: number; artistName?: string; albumId?: number; categoryId?: number; status?: string; tags?: string[] }) =>
    request.post<Result<any>>('/music', data),

  update: (id: number, data: { title?: string; audioUrl?: string; description?: string; cover?: string; duration?: number; lyrics?: string; lyricsUrl?: string; artistId?: number; artistName?: string; albumId?: number; categoryId?: number; status?: string; tags?: string[] }) =>
    request.put<Result<any>>(`/music/${id}`, data),

  delete: (id: number) =>
    request.delete<Result<void>>(`/music/${id}`),

  deleteArtist: (id: number) =>
    request.delete<Result<void>>(`/music/artists/${id}`),

  deleteTag: (tag: string) =>
    request.delete<Result<void>>(`/music/tags/${encodeURIComponent(tag)}`),

  playlists: () =>
    request.get<Result<any[]>>('/playlists'),

  playlistDetail: (id: number) =>
    request.get<Result<any>>(`/playlists/${id}`),
};

// 友链相关
export interface FriendLinkVO {
  id: number;
  name: string;
  url: string;
  logo?: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  status: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FriendLinkCategoryVO {
  id: number;
  name: string;
  description?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LinkCategoryManageDTO {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface DriveFolderVO {
  id: number;
  name: string;
  parentId?: number | null;
  itemCount?: number;
  userId?: number;
  userName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriveFileVO {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize: number;
  folderId?: number | null;
  folderName?: string;
  uploaderId?: number;
  uploaderName?: string;
  status?: string;
  downloadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriveStatsVO {
  folderCount: number;
  fileCount: number;
  totalSizeBytes: number;
  quotaBytes: number;
  typeCounts: Record<string, number>;
}

export const friendLinkApi = {
  list: (status?: string) =>
    request.get<Result<FriendLinkVO[]>>('/friends', { params: status ? { status } : {} }),

  categories: () =>
    request.get<Result<FriendLinkCategoryVO[]>>('/friends/categories'),

  apply: (data: { name: string; url: string; description?: string; categoryId?: number }) =>
    request.post<Result<FriendLinkVO>>('/friends', data),

  approve: (id: number) =>
    request.put<Result<FriendLinkVO>>(`/friends/${id}/approve`),

  reject: (id: number) =>
    request.put<Result<FriendLinkVO>>(`/friends/${id}/reject`),

  delete: (id: number) =>
    request.delete<Result<void>>(`/friends/${id}`),
};

export const linkCategoryApi = {
  list: (params?: { page?: number; keyword?: string }) =>
    request.get<Result<PageResult<FriendLinkCategoryVO>>>('/link-categories', { params }),

  create: (data: LinkCategoryManageDTO) =>
    request.post<Result<FriendLinkCategoryVO>>('/link-categories', data),

  delete: (id: number) =>
    request.delete<Result<void>>(`/link-categories/${id}`),
};

// 网盘相关
export const driveApi = {
  stats: () =>
    request.get<Result<DriveStatsVO>>('/drive/files/stats'),

  folders: (params?: { parentId?: number; keyword?: string }) =>
    request.get<Result<DriveFolderVO[]>>('/drive/folders', { params }),

  folderPath: (id: number) =>
    request.get<Result<DriveFolderVO[]>>(`/drive/folders/${id}/path`),

  createFolder: (data: { name: string; parentId?: number }) =>
    request.post<Result<DriveFolderVO>>('/drive/folders', data),

  deleteFolder: (id: number) =>
    request.delete<Result<void>>(`/drive/folders/${id}`),

  files: (params?: { page?: number; size?: number; folderId?: number; keyword?: string }) =>
    request.get<Result<PageResult<DriveFileVO>>>('/drive/files', { params }),

  uploadMultipart: (data: FormData) =>
    request.post<Result<DriveFileVO>>('/drive/files/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  deleteFile: (id: number) =>
    request.delete<Result<void>>(`/drive/files/${id}`),

  deleteFiles: (ids: number[]) =>
    request.post<Result<void>>('/drive/files/batch-delete', { ids }),

  downloadFile: (id: number) =>
    request.get<Blob>(`/drive/files/${id}/download`, { responseType: 'blob' }),
};

// 统计相关
export const statsApi = {
  site: () =>
    request.get<Result<any>>('/stats'),
};
