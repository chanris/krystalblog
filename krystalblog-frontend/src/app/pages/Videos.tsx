import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play, Eye, Heart, MessageCircle, X, Search,
  Plus, Trash2, Edit2, Video as VideoIcon, Loader2, Folder
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { type CommentVO, type VideoCategoryVO, type VideoVO, videoApi } from "../services/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "../components/ui/dialog";
import { toast } from "sonner";
import DriveFilePickerDialog, { getDriveFileDisplayName } from "../components/DriveFilePickerDialog";
import type { DriveFileVO } from "../services/api";

const DEFAULT_COVER = "https://via.placeholder.com/640x360?text=Video";

export default function Videos() {
  const { isAdmin } = useApp();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<VideoCategoryVO[]>([]);
  const [videos, setVideos] = useState<VideoVO[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoVO | null>(null);
  const [comments, setComments] = useState<CommentVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [likedVideos, setLikedVideos] = useState<Set<number>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VideoCategoryVO | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const emptyUploadForm = {
    title: "",
    videoUrl: "",
    driveFileId: "",
    driveFileName: "",
    coverImage: "",
    description: "",
    categoryId: "",
    width: "",
    height: "",
    videoBitrateKbps: "",
  };
  const emptyCategoryForm = {
    name: "",
    description: "",
    sortOrder: "0",
  };
  const [uploadForm, setUploadForm] = useState(emptyUploadForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [showDrivePicker, setShowDrivePicker] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadVideos();
  }, [debouncedSearch, activeCategory]);

  const loadCategories = async () => {
    try {
      const res = await videoApi.categories();
      const nextCategories = res.data;
      setCategories(nextCategories);
      if (activeCategory !== null && !nextCategories.some((item) => item.id === activeCategory)) {
        setActiveCategory(null);
      }
      setUploadForm((prev) => {
        if (!prev.categoryId) return prev;
        const exists = nextCategories.some((item) => String(item.id) === prev.categoryId);
        if (exists) return prev;
        return {
          ...prev,
          categoryId: nextCategories[0] ? String(nextCategories[0].id) : "",
        };
      });
    } catch (error) {
      console.error("加载视频分类失败:", error);
    }
  };

  const loadVideos = async () => {
    setLoading(true);
    try {
      const res = await videoApi.list({
        page: 1,
        size: 100,
        categoryId: activeCategory ?? undefined,
        keyword: debouncedSearch || undefined,
      });
      setVideos(res.data.records);
    } catch (error) {
      console.error("加载视频失败:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const loadVideoDetail = async (id: number) => {
    setModalLoading(true);
    try {
      const res = await videoApi.detail(id);
      setSelectedVideo(res.data);
    } catch (error) {
      console.error("加载视频详情失败:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const loadComments = async (videoId: number) => {
    setCommentLoading(true);
    try {
      const res = await videoApi.comments(videoId, { page: 1, size: 20 });
      setComments(res.data.records || []);
    } catch (error) {
      console.error("加载视频评论失败:", error);
      setComments([]);
    } finally {
      setCommentLoading(false);
    }
  };

  const openVideo = async (video: VideoVO) => {
    setSelectedVideo(video);
    setComments([]);
    await Promise.all([loadVideoDetail(video.id), loadComments(video.id)]);
  };

  const handleToggleLike = async (videoId: number, inModal = false) => {
    const liked = likedVideos.has(videoId);
    const optimisticDelta = liked ? -1 : 1;
    const rollbackDelta = -optimisticDelta;

    const applyDelta = (current: number | undefined, delta: number) => Math.max((current || 0) + delta, 0);

    const updateVideoLikes = (list: VideoVO[], delta: number) =>
      list.map((item) => {
        if (item.id !== videoId) return item;
        return { ...item, likesCount: applyDelta(item.likesCount, delta) };
      });

    const updateSelectedLikes = (delta: number) => {
      if (!inModal) return;
      setSelectedVideo((prev) => {
        if (!prev || prev.id !== videoId) return prev;
        return { ...prev, likesCount: applyDelta(prev.likesCount, delta) };
      });
    };

    setLikedVideos((prev) => {
      const next = new Set(prev);
      if (liked) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
    setVideos((prev) => updateVideoLikes(prev, optimisticDelta));
    updateSelectedLikes(optimisticDelta);

    try {
      if (liked) {
        await videoApi.unlike(videoId);
      } else {
        await videoApi.like(videoId);
      }
    } catch (error) {
      console.error("视频点赞失败:", error);
      setLikedVideos((prev) => {
        const next = new Set(prev);
        if (liked) next.add(videoId);
        else next.delete(videoId);
        return next;
      });
      setVideos((prev) => updateVideoLikes(prev, rollbackDelta));
      updateSelectedLikes(rollbackDelta);
    }
  };

  const submitComment = async () => {
    if (!selectedVideo) return;
    const content = (commentInputs[selectedVideo.id] || "").trim();
    if (!content) return;
    setSubmittingComment(true);
    try {
      await videoApi.createComment(selectedVideo.id, { content });
      setCommentInputs((prev) => ({ ...prev, [selectedVideo.id]: "" }));
      await loadComments(selectedVideo.id);
      setSelectedVideo((prev) => {
        if (!prev) return prev;
        return { ...prev, commentsCount: (prev.commentsCount || 0) + 1 };
      });
      setVideos((prev) =>
        prev.map((item) => {
          if (item.id !== selectedVideo.id) return item;
          return { ...item, commentsCount: (item.commentsCount || 0) + 1 };
        })
      );
    } catch (error) {
      console.error("发表评论失败:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const categoryTabs = useMemo(
    () => [{ id: null as number | null, name: "全部" }, ...categories.map((item) => ({ id: item.id, name: item.name }))],
    [categories]
  );

  const openUploadDialog = () => {
    if (!categories.length) {
      toast.error("暂无视频分类，请先创建分类");
      return;
    }
    setUploadForm((prev) => ({
      ...prev,
      categoryId: prev.categoryId || String(categories[0].id),
    }));
    setShowUploadDialog(true);
  };

  const openCategoryDialog = (category?: VideoCategoryVO) => {
    setEditingCategory(category || null);
    setCategoryForm({
      name: category?.name || "",
      description: category?.description || "",
      sortOrder: String(category?.sortOrder ?? 0),
    });
    setShowCategoryDialog(true);
  };

  const closeCategoryDialog = (open: boolean) => {
    setShowCategoryDialog(open);
    if (!open && !savingCategory) {
      setEditingCategory(null);
      setCategoryForm(emptyCategoryForm);
    }
  };

  const handleCategorySubmit = async () => {
    const name = categoryForm.name.trim();
    if (!name) {
      toast.error("请输入分类名称");
      return;
    }

    const sortOrderText = categoryForm.sortOrder.trim();
    const sortOrder = sortOrderText ? Number(sortOrderText) : 0;
    if (!Number.isFinite(sortOrder)) {
      toast.error("排序值需为数字");
      return;
    }

    setSavingCategory(true);
    try {
      const payload = {
        name,
        description: categoryForm.description.trim() || undefined,
        sortOrder,
      };
      if (editingCategory) {
        await videoApi.updateCategory(editingCategory.id, payload);
        toast.success("分类更新成功");
      } else {
        await videoApi.createCategory(payload);
        toast.success("分类创建成功");
      }
      setEditingCategory(null);
      setCategoryForm(emptyCategoryForm);
      await loadCategories();
    } catch (error: any) {
      toast.error(error?.message || "分类保存失败，请重试");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (category: VideoCategoryVO) => {
    if (!window.confirm(`确定删除分类「${category.name}」吗？`)) {
      return;
    }
    try {
      await videoApi.deleteCategory(category.id);
      toast.success("分类删除成功");
      if (editingCategory?.id === category.id) {
        setEditingCategory(null);
        setCategoryForm(emptyCategoryForm);
      }
      await loadCategories();
    } catch (error: any) {
      toast.error(error?.message || "分类删除失败，请重试");
    }
  };

  const handleUploadSubmit = async () => {
    const title = uploadForm.title.trim();
    const videoUrl = uploadForm.videoUrl.trim();
    const driveFileIdNum = uploadForm.driveFileId ? Number(uploadForm.driveFileId) : undefined;
    if (!title) {
      toast.error("请输入视频标题");
      return;
    }
    if (!driveFileIdNum && !videoUrl) {
      toast.error("请输入视频地址或从网盘选择");
      return;
    }
    if (!uploadForm.categoryId) {
      toast.error("请选择视频分类");
      return;
    }

    setUploadingVideo(true);
    try {
      const payload: any = {
        title,
        categoryId: Number(uploadForm.categoryId),
        coverImage: uploadForm.coverImage.trim() || undefined,
        description: uploadForm.description.trim() || undefined,
      };
      if (driveFileIdNum) {
        payload.driveFileId = driveFileIdNum;
      } else {
        payload.videoUrl = videoUrl;
      }
      const widthNum = uploadForm.width ? Number(uploadForm.width) : undefined;
      const heightNum = uploadForm.height ? Number(uploadForm.height) : undefined;
      const bitrateNum = uploadForm.videoBitrateKbps ? Number(uploadForm.videoBitrateKbps) : undefined;
      if (widthNum && widthNum > 0) payload.width = widthNum;
      if (heightNum && heightNum > 0) payload.height = heightNum;
      if (bitrateNum && bitrateNum > 0) payload.videoBitrateKbps = bitrateNum;

      await videoApi.create(payload);
      toast.success("视频上传成功");
      setShowUploadDialog(false);
      setUploadForm(emptyUploadForm);
      await loadVideos();
    } catch (error: any) {
      toast.error(error?.message || "上传失败，请重试");
    } finally {
      setUploadingVideo(false);
    }
  };

  const applyDriveSelection = (files: DriveFileVO[]) => {
    const file = files[0];
    if (!file) return;
    setUploadForm((prev) => ({
      ...prev,
      driveFileId: String(file.id),
      driveFileName: getDriveFileDisplayName(file as any),
      videoUrl: "",
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ color: "#1c1917" }}>视频</h1>
          <p style={{ fontSize: "0.85rem", color: "#78716c" }}>共 {videos.length} 个视频</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openCategoryDialog()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
              style={{ background: "white", border: "1.5px solid #e9d5ff", color: "#7c3aed", fontWeight: 500 }}
            >
              <Folder size={16} />
              管理分类
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openUploadDialog}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
              style={{ background: "#7c3aed", fontWeight: 500 }}
            >
              <Plus size={16} />
              上传视频
            </motion.button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#a8956b" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索视频..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
            onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
            onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categoryTabs.map((cat) => (
            <motion.button
              key={String(cat.id)}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveCategory(cat.id)}
              className="px-3.5 py-1.5 rounded-full text-sm transition-all"
              style={{
                background: activeCategory === cat.id ? "#7c3aed" : "white",
                color: activeCategory === cat.id ? "white" : "#78716c",
                border: activeCategory === cat.id ? "none" : "1.5px solid #f3e8d0",
                fontWeight: activeCategory === cat.id ? 500 : 400,
              }}
            >
              {cat.name}
            </motion.button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-20" style={{ color: "#a8956b" }}>
          <p>正在加载视频...</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {videos.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(120,80,20,0.12)" }}
                className="rounded-2xl overflow-hidden cursor-pointer"
                style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.07)" }}
                onClick={() => openVideo(video)}
              >
                <div className="relative overflow-hidden" style={{ height: 180 }}>
                  <img
                    src={video.coverImage || DEFAULT_COVER}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "rgba(0,0,0,0.3)" }}
                  >
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(124,58,237,0.9)" }}>
                      <Play size={22} className="text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center opacity-80"
                      style={{ background: "rgba(124,58,237,0.8)" }}
                    >
                      <Play size={18} className="text-white ml-0.5" />
                    </div>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-white text-xs" style={{ background: "rgba(0,0,0,0.7)" }}>
                      {video.duration}
                    </div>
                  )}
                  {video.categoryName && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full text-xs text-white" style={{ background: "rgba(124,58,237,0.8)", fontWeight: 500 }}>
                        {video.categoryName}
                      </span>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.9)", color: "#7c3aed" }}>
                        <Edit2 size={12} />
                      </button>
                      <button className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.9)", color: "#dc2626" }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm line-clamp-2 mb-2" style={{ color: "#1c1917", fontWeight: 500 }}>{video.title}</h3>
                  <div className="flex items-center gap-3 text-xs" style={{ color: "#a8956b" }}>
                    <span className="flex items-center gap-1"><Eye size={11} />{(video.views || 0).toLocaleString()}</span>
                    <button
                      className="flex items-center gap-1 transition-colors"
                      style={{ color: likedVideos.has(video.id) ? "#7c3aed" : "#a8956b" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLike(video.id);
                      }}
                    >
                      <Heart size={11} fill={likedVideos.has(video.id) ? "#7c3aed" : "none"} />
                      {(video.likesCount || 0).toLocaleString()}
                    </button>
                    <span className="flex items-center gap-1"><MessageCircle size={11} />{(video.commentsCount || 0).toLocaleString()}</span>
                    <span className="ml-auto">{video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : "-"}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && videos.length === 0 && (
        <div className="text-center py-20" style={{ color: "#a8956b" }}>
          <VideoIcon size={44} className="mx-auto mb-3 opacity-30" style={{ color: "#7c3aed" }} />
          <p>没有找到相关视频</p>
        </div>
      )}

      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-3xl rounded-2xl overflow-hidden"
              style={{ background: "#1c1410" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex items-center justify-center" style={{ background: "#0f0a06", minHeight: 320 }}>
                {selectedVideo.videoUrl ? (
                  <video
                    controls
                    src={selectedVideo.videoUrl}
                    poster={selectedVideo.coverImage || DEFAULT_COVER}
                    className="w-full max-h-[480px]"
                  />
                ) : (
                  <>
                    <img
                      src={selectedVideo.coverImage || DEFAULT_COVER}
                      alt={selectedVideo.title}
                      className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(124,58,237,0.9)" }}>
                        <Play size={28} className="text-white ml-1" />
                      </div>
                      <p className="text-white/60 text-sm">暂无可播放视频地址</p>
                    </div>
                  </>
                )}
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="absolute top-4 right-4 p-2 rounded-full"
                  style={{ background: "rgba(0,0,0,0.5)", color: "white" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5">
                <h2 className="text-white mb-2">{selectedVideo.title}</h2>
                <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>{selectedVideo.description || "暂无描述"}</p>
                {selectedVideo.authorName && (
                  <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                    发布者：{selectedVideo.authorName}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <span className="flex items-center gap-1"><Eye size={13} />{(selectedVideo.views || 0).toLocaleString()} 播放</span>
                  <button
                    className="flex items-center gap-1"
                    style={{ color: likedVideos.has(selectedVideo.id) ? "#c4b5fd" : "rgba(255,255,255,0.5)" }}
                    onClick={() => handleToggleLike(selectedVideo.id, true)}
                  >
                    <Heart size={13} fill={likedVideos.has(selectedVideo.id) ? "#c4b5fd" : "none"} />
                    {(selectedVideo.likesCount || 0).toLocaleString()} 点赞
                  </button>
                  <span className="flex items-center gap-1"><MessageCircle size={13} />{(selectedVideo.commentsCount || comments.length).toLocaleString()} 评论</span>
                  <span className="ml-auto">{selectedVideo.publishedAt ? new Date(selectedVideo.publishedAt).toLocaleString() : "-"}</span>
                </div>

                <div className="max-h-52 overflow-auto space-y-2 mb-4 pr-1">
                  {modalLoading || commentLoading ? (
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>正在加载评论...</p>
                  ) : comments.length === 0 ? (
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>暂无评论，来抢沙发吧</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white">{comment.authorName || "匿名用户"}</span>
                          <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "-"}
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="flex gap-3">
                    <input
                      value={commentInputs[selectedVideo.id] || ""}
                      onChange={(e) => setCommentInputs((prev) => ({ ...prev, [selectedVideo.id]: e.target.value }))}
                      placeholder="发表评论..."
                      className="flex-1 px-4 py-2 rounded-xl text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
                    />
                    <button
                      className="px-4 py-2 rounded-xl text-sm text-white disabled:opacity-50"
                      style={{ background: "#7c3aed" }}
                      disabled={submittingComment || !(commentInputs[selectedVideo.id] || "").trim()}
                      onClick={submitComment}
                    >
                      {submittingComment ? "发送中..." : "发送"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog
        open={showCategoryDialog}
        onOpenChange={closeCategoryDialog}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>管理视频分类</DialogTitle>
            <DialogDescription>管理员可新增、编辑、删除视频分类，并维护显示排序</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm" style={{ color: "#44403c", fontWeight: 600 }}>分类列表</h3>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm(emptyCategoryForm);
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm"
                  style={{ background: "#f5f3ff", color: "#7c3aed" }}
                >
                  新增分类
                </button>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                {categories.length ? categories.map((category) => {
                  const active = editingCategory?.id === category.id;
                  return (
                    <div
                      key={category.id}
                      className="rounded-xl p-4"
                      style={{
                        border: active ? "1.5px solid #c4b5fd" : "1px solid #ede9fe",
                        background: active ? "#faf5ff" : "#ffffff",
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm" style={{ color: "#1c1917", fontWeight: 600 }}>{category.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                              排序 {category.sortOrder ?? 0}
                            </span>
                          </div>
                          <p className="text-sm break-words" style={{ color: "#78716c" }}>{category.description || "暂无描述"}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openCategoryDialog(category)}
                            className="p-2 rounded-lg"
                            style={{ background: "#f5f3ff", color: "#7c3aed" }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className="p-2 rounded-lg"
                            style={{ background: "#fef2f2", color: "#dc2626" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div
                    className="rounded-xl p-6 text-center text-sm"
                    style={{ border: "1px dashed #ddd6fe", color: "#78716c", background: "#faf5ff" }}
                  >
                    暂无视频分类，请先创建
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl p-5 h-fit" style={{ background: "#faf5ff", border: "1px solid #ede9fe" }}>
              <h3 className="mb-4" style={{ color: "#1c1917", fontWeight: 600 }}>
                {editingCategory ? "编辑分类" : "新增分类"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#44403c" }}>分类名称</label>
                  <input
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入分类名称"
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ border: "1.5px solid #ddd6fe", background: "white" }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#44403c" }}>分类描述</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="可选"
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                    style={{ border: "1.5px solid #ddd6fe", background: "white" }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#44403c" }}>排序值</label>
                  <input
                    value={categoryForm.sortOrder}
                    onChange={(e) => setCategoryForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                    placeholder="默认 0"
                    type="number"
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ border: "1.5px solid #ddd6fe", background: "white" }}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm(emptyCategoryForm);
                  }}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{ border: "1px solid #ddd6fe", color: "#6d28d9", background: "white" }}
                >
                  重置
                </button>
                <button
                  onClick={handleCategorySubmit}
                  disabled={savingCategory}
                  className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-60 flex items-center gap-2"
                  style={{ background: "#7c3aed" }}
                >
                  {savingCategory && <Loader2 size={14} className="animate-spin" />}
                  {savingCategory ? "保存中..." : editingCategory ? "保存修改" : "创建分类"}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showUploadDialog}
        onOpenChange={(open: boolean) => {
          setShowUploadDialog(open);
          if (!open && !uploadingVideo) {
            setUploadForm(emptyUploadForm);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>上传视频</DialogTitle>
            <DialogDescription>填写视频信息后提交</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: "#44403c" }}>视频标题</label>
              <input
                value={uploadForm.title}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="请输入视频标题"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ border: "1.5px solid #e7dcc7" }}
              />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: "#44403c" }}>视频来源</label>
              <div className="flex gap-2">
                <input
                  value={uploadForm.videoUrl}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder={uploadForm.driveFileId ? "已选择网盘文件" : "请输入视频 URL"}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none disabled:opacity-70"
                  style={{ border: "1.5px solid #e7dcc7" }}
                  disabled={!!uploadForm.driveFileId}
                />
                <button
                  type="button"
                  onClick={() => setShowDrivePicker(true)}
                  className="px-3 py-2.5 rounded-lg text-sm whitespace-nowrap"
                  style={{ background: "white", border: "1.5px solid #e7dcc7", color: "#7c3aed", fontWeight: 500 }}
                >
                  从网盘选择
                </button>
              </div>
              {uploadForm.driveFileId && (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-xs truncate" style={{ color: "#78716c" }} title={uploadForm.driveFileName}>
                    已选择：{uploadForm.driveFileName}
                  </p>
                  <button
                    type="button"
                    onClick={() => setUploadForm((prev) => ({ ...prev, driveFileId: "", driveFileName: "" }))}
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{ border: "1px solid #e7dcc7", color: "#57534e", background: "white" }}
                  >
                    清除
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: "#44403c" }}>封面地址</label>
                <input
                  value={uploadForm.coverImage}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, coverImage: e.target.value }))}
                  placeholder="可选"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ border: "1.5px solid #e7dcc7" }}
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: "#44403c" }}>视频分类</label>
                <select
                  value={uploadForm.categoryId}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ border: "1.5px solid #e7dcc7", background: "white" }}
                >
                  <option value="">请选择分类</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: "#44403c" }}>宽（px）</label>
                <input
                  type="number"
                  value={uploadForm.width}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, width: e.target.value }))}
                  placeholder="可选"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ border: "1.5px solid #e7dcc7" }}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: "#44403c" }}>高（px）</label>
                <input
                  type="number"
                  value={uploadForm.height}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, height: e.target.value }))}
                  placeholder="可选"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ border: "1.5px solid #e7dcc7" }}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: "#44403c" }}>码率（kbps）</label>
                <input
                  type="number"
                  value={uploadForm.videoBitrateKbps}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, videoBitrateKbps: e.target.value }))}
                  placeholder="可选"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ border: "1.5px solid #e7dcc7" }}
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: "#44403c" }}>视频描述</label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="可选"
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={{ border: "1.5px solid #e7dcc7" }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setShowUploadDialog(false)}
              disabled={uploadingVideo}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ border: "1px solid #e7dcc7", color: "#57534e", background: "white" }}
            >
              取消
            </button>
            <button
              onClick={handleUploadSubmit}
              disabled={uploadingVideo}
              className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-60 flex items-center gap-2"
              style={{ background: "#7c3aed" }}
            >
              {uploadingVideo && <Loader2 size={14} className="animate-spin" />}
              {uploadingVideo ? "上传中..." : "提交上传"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <DriveFilePickerDialog
        open={showDrivePicker}
        onOpenChange={setShowDrivePicker}
        fileCategory="video"
        multiSelect={false}
        onConfirm={applyDriveSelection}
      />
    </div>
  );
}
