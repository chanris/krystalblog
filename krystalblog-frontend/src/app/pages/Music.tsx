import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play, Pause, Search, Tag, Music2, Plus, Pencil,
  Trash2, TrendingUp, Heart, User, List, LayoutGrid,
  ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { musicApi } from "../services/api";
import type { DriveFileVO } from "../services/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "../components/ui/dialog";
import { toast } from "sonner";
import DriveFilePickerDialog from "../components/DriveFilePickerDialog";

export default function Music() {
  const { setCurrentSong, currentSong, isPlaying, togglePlay, isAdmin, isLoggedIn } = useApp();

  // 筛选状态
  const [search, setSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeArtistId, setActiveArtistId] = useState<number | null>(null);
  const [likedMusicIds, setLikedMusicIds] = useState<Set<number>>(new Set());
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // 分页
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // 数据状态
  const [songs, setSongs] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [hotMusic, setHotMusic] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 上传/编辑对话框状态
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingSong, setEditingSong] = useState<any>(null); // 当前编辑的歌曲，null 表示新建
  const emptyForm = {
    title: "",
    audioUrl: "",
    driveFileId: "",
    driveFileName: "",
    audioBitrateKbps: "",
    cover: "",
    description: "",
    duration: "",
    artistId: "",
    artistName: "",
    categoryId: "",
    tagsInput: "",
    lyrics: "",
  };
  const [uploadForm, setUploadForm] = useState(emptyForm);
  const [showDrivePicker, setShowDrivePicker] = useState(false);

  // 加载歌曲列表
  const loadMusic = useCallback(async () => {
    try {
      setLoading(true);

      if (showLikedOnly && isLoggedIn) {
        const res = await musicApi.getLiked({ page, size: pageSize });
        setSongs(res.data.records);
        setTotal(res.data.total);
        setTotalPages(Math.ceil(res.data.total / pageSize));
        return;
      }

      const params: any = { page, size: pageSize };
      if (search) params.keyword = search;
      if (activeCategoryId) params.categoryId = activeCategoryId;
      if (activeTag) params.tag = activeTag;
      if (activeArtistId) params.artistId = activeArtistId;

      const res = await musicApi.list(params);
      setSongs(res.data.records);
      setTotal(res.data.total);
      setTotalPages(Math.ceil(res.data.total / pageSize));
    } catch (error) {
      console.error("加载音乐列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeCategoryId, activeTag, activeArtistId, showLikedOnly, isLoggedIn]);

  // 加载侧边栏数据
  const loadSidebarData = useCallback(async () => {
    try {
      const [artistsRes, categoriesRes, tagsRes, hotRes] = await Promise.all([
        musicApi.artists(),
        musicApi.categories(),
        musicApi.tags(),
        musicApi.hot(5),
      ]);
      setArtists((artistsRes as any).data || []);
      setCategories((categoriesRes as any).data || []);
      setTags((tagsRes as any).data || []);
      setHotMusic((hotRes as any).data || []);
    } catch (error) {
      console.error("加载侧边栏数据失败:", error);
    }
  }, []);

  // 加载用户喜欢的歌曲ID列表
  const loadLikedMusic = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await musicApi.getLikedIds();
      setLikedMusicIds(new Set(res.data));
    } catch (error) {
      console.error("加载喜欢列表失败:", error);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadSidebarData();
    loadLikedMusic();
  }, [loadSidebarData, loadLikedMusic]);

  // 筛选条件变化时重新加载
  useEffect(() => {
    loadMusic();
  }, [loadMusic]);

  // 筛选条件变化时重置页码
  useEffect(() => {
    setPage(1);
  }, [search, activeCategoryId, activeTag, activeArtistId, showLikedOnly]);

  const handleLike = async (songId: number, e: React.MouseEvent) => {
    e.stopPropagation();

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
        toast.success("已取消喜欢");
      } else {
        await musicApi.like(songId);
        setLikedMusicIds(prev => new Set(prev).add(songId));
        toast.success("已添加到我的喜欢");
      }
    } catch (error: any) {
      toast.error(error?.message || "操作失败");
    }
  };

  const handlePlay = (song: any) => {
    // 将后端数据转换为 AppContext 中 Song 类型兼容的格式
    const songForPlayer = {
      ...song,
      artist: song.artistName || "",
      album: song.albumTitle || "",
      durationSec: song.duration || 0,
      plays: song.plays || 0,
      date: song.createdAt || "",
      category: song.categoryName || "",
      tags: song.tags || [],
    };

    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      const playlistForPlayer = songs.map((s) => ({
        ...s,
        artist: s.artistName || "",
        album: s.albumTitle || "",
        durationSec: s.duration || 0,
        plays: s.plays || 0,
        date: s.createdAt || "",
        category: s.categoryName || "",
        tags: s.tags || [],
      }));
      setCurrentSong(songForPlayer, playlistForPlayer);
    }
  };

  const isCurrentPlaying = (song: any) =>
    currentSong?.id === song.id && isPlaying;

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatPlays = (plays: number | null) => {
    if (!plays) return "0";
    if (plays >= 10000) return (plays / 10000).toFixed(1) + "万";
    if (plays >= 1000) return (plays / 1000).toFixed(1) + "k";
    return String(plays);
  };

  // 打开编辑对话框
  const handleEdit = (song: any) => {
    setEditingSong(song);
    setUploadForm({
      title: song.title || "",
      audioUrl: song.audioUrl || "",
      driveFileId: song.driveFileId ? String(song.driveFileId) : "",
      driveFileName: song.driveFileId ? `DriveFile#${song.driveFileId}` : "",
      audioBitrateKbps: song.audioBitrateKbps ? String(song.audioBitrateKbps) : "",
      cover: song.cover || "",
      description: song.description || "",
      duration: song.duration ? String(song.duration) : "",
      artistId: song.artistId ? String(song.artistId) : "",
      artistName: "",
      categoryId: song.categoryId ? String(song.categoryId) : "",
      tagsInput: (song.tags || []).join("，"),
      lyrics: song.lyrics || "",
    });
    setShowUploadDialog(true);
  };

  // 上传/编辑音乐提交
  const handleUploadSubmit = async () => {
    if (!uploadForm.title.trim()) {
      toast.error("请输入歌曲标题");
      return;
    }
    const driveFileIdNum = uploadForm.driveFileId ? Number(uploadForm.driveFileId) : undefined;
    if (!driveFileIdNum && !uploadForm.audioUrl.trim()) {
      toast.error("请输入音频URL或从网盘选择");
      return;
    }

    setSubmitting(true);
    try {
      const data: any = {
        title: uploadForm.title.trim(),
      };
      if (driveFileIdNum) {
        data.driveFileId = driveFileIdNum;
      } else {
        data.audioUrl = uploadForm.audioUrl.trim();
      }
      if (uploadForm.cover.trim()) data.cover = uploadForm.cover.trim();
      if (uploadForm.description.trim()) data.description = uploadForm.description.trim();
      if (uploadForm.duration && Number(uploadForm.duration) > 0) data.duration = Number(uploadForm.duration);
      if (uploadForm.audioBitrateKbps && Number(uploadForm.audioBitrateKbps) > 0) data.audioBitrateKbps = Number(uploadForm.audioBitrateKbps);
      if ((uploadForm.artistName || "").trim()) {
        data.artistName = (uploadForm.artistName || "").trim();
      } else if (uploadForm.artistId) {
        data.artistId = Number(uploadForm.artistId);
      }
      if (uploadForm.categoryId) data.categoryId = Number(uploadForm.categoryId);
      if (uploadForm.lyrics.trim()) data.lyrics = uploadForm.lyrics.trim();
      if (uploadForm.tagsInput.trim()) {
        data.tags = uploadForm.tagsInput.split(/[,，]/).map((t: string) => t.trim()).filter(Boolean);
      }

      if (editingSong) {
        await musicApi.update(editingSong.id, data);
        toast.success("音乐信息已更新");
      } else {
        await musicApi.create(data);
        toast.success("音乐上传成功");
      }
      setShowUploadDialog(false);
      setUploadForm(emptyForm);
      setEditingSong(null);
      loadMusic();
      loadSidebarData();
    } catch (error: any) {
      toast.error(error?.message || (editingSong ? "更新失败，请重试" : "上传失败，请重试"));
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setUploadForm((prev) => ({ ...prev, [field]: value }));
  };

  const applyDriveSelection = (files: DriveFileVO[]) => {
    const file = files[0];
    if (!file) return;
    setUploadForm((prev) => ({
      ...prev,
      driveFileId: String(file.id),
      driveFileName: file.fileName,
      audioUrl: "",
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ color: "#1c1917" }}>音乐</h1>
          <p style={{ fontSize: "0.85rem", color: "#78716c" }}>共 {total} 首音乐</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="p-2 rounded-xl transition-colors"
            style={{ background: "white", color: "#78716c", border: "1.5px solid #f3e8d0" }}
            title={viewMode === "list" ? "切换网格视图" : "切换列表视图"}
          >
            {viewMode === "list" ? <LayoutGrid size={16} /> : <List size={16} />}
          </button>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUploadDialog(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
              style={{ background: "#d97706", fontWeight: 500 }}
            >
              <Plus size={16} />
              上传音频
            </motion.button>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search */}
          <div className="relative mb-5">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#a8956b" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索歌曲、歌手..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
              onFocus={(e) => (e.target.style.borderColor = "#d97706")}
              onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap mb-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setActiveCategoryId(null);
                setShowLikedOnly(false);
              }}
              className="px-3.5 py-1.5 rounded-full text-sm transition-all"
              style={{
                background: activeCategoryId === null && !showLikedOnly ? "#d97706" : "white",
                color: activeCategoryId === null && !showLikedOnly ? "white" : "#78716c",
                border: activeCategoryId === null && !showLikedOnly ? "none" : "1.5px solid #f3e8d0",
                fontWeight: activeCategoryId === null && !showLikedOnly ? 500 : 400,
                boxShadow: activeCategoryId === null && !showLikedOnly ? "0 2px 8px rgba(217,119,6,0.3)" : "none",
              }}
            >
              全部
            </motion.button>
            {isLoggedIn && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setShowLikedOnly(!showLikedOnly);
                  setActiveCategoryId(null);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm transition-all"
                style={{
                  background: showLikedOnly ? "#d97706" : "white",
                  color: showLikedOnly ? "white" : "#78716c",
                  border: showLikedOnly ? "none" : "1.5px solid #f3e8d0",
                  fontWeight: showLikedOnly ? 500 : 400,
                  boxShadow: showLikedOnly ? "0 2px 8px rgba(217,119,6,0.3)" : "none",
                }}
              >
                <Heart size={14} fill={showLikedOnly ? "white" : "none"} />
                我的喜欢
              </motion.button>
            )}
            {categories.map((cat: any) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setActiveCategoryId(activeCategoryId === cat.id ? null : cat.id);
                  setShowLikedOnly(false);
                }}
                className="px-3.5 py-1.5 rounded-full text-sm transition-all"
                style={{
                  background: activeCategoryId === cat.id ? "#d97706" : "white",
                  color: activeCategoryId === cat.id ? "white" : "#78716c",
                  border: activeCategoryId === cat.id ? "none" : "1.5px solid #f3e8d0",
                  fontWeight: activeCategoryId === cat.id ? 500 : 400,
                  boxShadow: activeCategoryId === cat.id ? "0 2px 8px rgba(217,119,6,0.3)" : "none",
                }}
              >
                {cat.name}
              </motion.button>
            ))}
          </div>

          {/* Song List */}
          {viewMode === "list" ? (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "white", boxShadow: "0 2px 16px rgba(120,80,20,0.07)" }}
            >
              {/* Table Header */}
              <div
                className="grid items-center px-5 py-2.5 text-xs"
                style={{
                  gridTemplateColumns: "2rem 3rem 1fr 8rem 5rem 4rem 3.5rem",
                  color: "#a8956b",
                  borderBottom: "1px solid #f5ede0",
                  background: "#faf8f5",
                }}
              >
                <span>#</span>
                <span></span>
                <span>歌曲信息</span>
                <span>专辑</span>
                <span>标签</span>
                <span className="text-right">播放量</span>
                <span className="text-right">时长</span>
              </div>

              <AnimatePresence mode="popLayout">
                {songs.map((song, i) => {
                  const isCurrent = currentSong?.id === song.id;
                  const isPlay = isCurrentPlaying(song);

                  return (
                    <motion.div
                      key={song.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="grid items-center px-5 py-3 cursor-pointer group transition-all"
                      style={{
                        gridTemplateColumns: "2rem 3rem 1fr 8rem 5rem 4rem 3.5rem",
                        borderBottom: i < songs.length - 1 ? "1px solid #f5ede0" : "none",
                        background: isCurrent ? "#fffbeb" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = "#faf8f5";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isCurrent ? "#fffbeb" : "transparent";
                      }}
                      onClick={() => handlePlay(song)}
                    >
                      {/* Index / Play */}
                      <span className="text-sm" style={{ color: isCurrent ? "#d97706" : "#a8956b" }}>
                        {isCurrent ? (
                          isPlay ? (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 0.8 }}
                            >
                              <Music2 size={14} style={{ color: "#d97706" }} />
                            </motion.div>
                          ) : (
                            <Music2 size={14} style={{ color: "#d97706" }} />
                          )
                        ) : (
                          <span className="group-hover:hidden">{(page - 1) * pageSize + i + 1}</span>
                        )}
                        {!isCurrent && (
                          <Play size={14} className="hidden group-hover:block" style={{ color: "#d97706" }} />
                        )}
                      </span>

                      {/* Cover */}
                      <div className="relative">
                        {song.cover ? (
                          <img
                            src={song.cover}
                            alt={song.title}
                            className="w-9 h-9 rounded-lg object-cover"
                            style={{ animation: isPlay ? "spin 20s linear infinite" : "none" }}
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ background: "#fef3c7" }}
                          >
                            <Music2 size={16} style={{ color: "#d97706" }} />
                          </div>
                        )}
                      </div>

                      {/* Title + Artist */}
                      <div className="min-w-0 pl-2">
                        <p
                          className="text-sm truncate"
                          style={{ fontWeight: 500, color: isCurrent ? "#d97706" : "#1c1917" }}
                        >
                          {song.title}
                        </p>
                        <p className="text-xs truncate" style={{ color: "#78716c" }}>
                          {song.artistName || "未知歌手"}
                        </p>
                      </div>

                      {/* Album */}
                      <p className="text-xs truncate hidden md:block" style={{ color: "#78716c" }}>
                        {song.albumTitle || "-"}
                      </p>

                      {/* Tags */}
                      <div className="hidden lg:flex gap-1 flex-wrap">
                        {(song.tags || []).slice(0, 1).map((t: string) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded text-xs"
                            style={{ background: "#fef3c7", color: "#d97706" }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Plays */}
                      <p className="text-xs text-right" style={{ color: "#a8956b" }}>
                        {formatPlays(song.plays)}
                      </p>

                      {/* Duration + Actions */}
                      <div className="flex items-center justify-end gap-2">
                        {isLoggedIn && (
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleLike(song.id, e)}
                            style={{ color: likedMusicIds.has(song.id) ? "#d97706" : "#a8956b" }}
                          >
                            <Heart size={13} fill={likedMusicIds.has(song.id) ? "#d97706" : "none"} />
                          </button>
                        )}
                        <span className="text-xs" style={{ color: "#a8956b" }}>
                          {formatDuration(song.duration)}
                        </span>
                        {isAdmin && (
                          <>
                            <button
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(song);
                              }}
                              style={{ color: "#d97706" }}
                              title="编辑"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("确定删除这首歌曲？")) {
                                  musicApi.delete(song.id).then(() => loadMusic());
                                }
                              }}
                              style={{ color: "#dc2626" }}
                              title="删除"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {songs.length === 0 && !loading && (
                <div className="text-center py-16" style={{ color: "#a8956b" }}>
                  <Music2 size={40} className="mx-auto mb-3 opacity-30" style={{ color: "#d97706" }} />
                  <p>没有找到相关音乐</p>
                </div>
              )}

              {loading && (
                <div className="text-center py-16" style={{ color: "#a8956b" }}>
                  <p>加载中...</p>
                </div>
              )}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {songs.map((song, i) => {
                const isCurrent = currentSong?.id === song.id;
                const isPlay = isCurrentPlaying(song);
                return (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -4 }}
                    className="rounded-2xl overflow-hidden cursor-pointer"
                    style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.07)" }}
                    onClick={() => handlePlay(song)}
                  >
                    <div className="relative" style={{ paddingTop: "100%" }}>
                      {song.cover ? (
                        <img
                          src={song.cover}
                          alt={song.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ animation: isPlay ? "spin 20s linear infinite" : "none" }}
                        />
                      ) : (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ background: "#fef3c7" }}
                        >
                          <Music2 size={40} style={{ color: "#d97706", opacity: 0.5 }} />
                        </div>
                      )}
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        style={{ background: "rgba(0,0,0,0.4)" }}
                      >
                        {isPlay ? (
                          <Pause size={28} className="text-white" />
                        ) : (
                          <Play size={28} className="text-white ml-1" />
                        )}
                      </div>
                      {isCurrent && (
                        <div
                          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: "#d97706" }}
                        >
                          <Music2 size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className="text-sm truncate flex-1 min-w-0"
                          style={{ fontWeight: 500, color: isCurrent ? "#d97706" : "#1c1917" }}
                        >
                          {song.title}
                        </p>
                        {isAdmin && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(song);
                              }}
                              className="p-1 rounded-md hover:bg-amber-50 transition-colors"
                              style={{ color: "#d97706" }}
                              title="编辑"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("确定删除这首歌曲？")) {
                                  musicApi.delete(song.id).then(() => loadMusic());
                                }
                              }}
                              className="p-1 rounded-md hover:bg-red-50 transition-colors"
                              style={{ color: "#dc2626" }}
                              title="删除"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: "#78716c" }}>
                        {song.artistName || "未知歌手"}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              {songs.length === 0 && !loading && (
                <div className="col-span-full text-center py-16" style={{ color: "#a8956b" }}>
                  <Music2 size={40} className="mx-auto mb-3 opacity-30" style={{ color: "#d97706" }} />
                  <p>没有找到相关音乐</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg transition-colors disabled:opacity-30"
                style={{ color: "#78716c" }}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="mx-1 text-xs" style={{ color: "#a8956b" }}>
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className="w-8 h-8 rounded-lg text-sm transition-colors"
                      style={{
                        background: p === page ? "#d97706" : "transparent",
                        color: p === page ? "white" : "#78716c",
                        fontWeight: p === page ? 600 : 400,
                      }}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg transition-colors disabled:opacity-30"
                style={{ color: "#78716c" }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-56 shrink-0 hidden lg:block space-y-4">
          {/* Artist Filter */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.06)" }}
          >
            <h3 className="flex items-center gap-2 mb-3 text-sm" style={{ color: "#1c1917" }}>
              <User size={15} style={{ color: "#d97706" }} />
              歌手
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveArtistId(null)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all"
                style={{
                  background: activeArtistId === null ? "#fef3c7" : "transparent",
                  color: activeArtistId === null ? "#d97706" : "#78716c",
                  fontWeight: activeArtistId === null ? 500 : 400,
                }}
              >
                全部
              </button>
              {artists.map((artist: any) => (
                <div
                  key={artist.id}
                  className="flex items-center group/artist"
                >
                  <button
                    onClick={() =>
                      setActiveArtistId(activeArtistId === artist.id ? null : artist.id)
                    }
                    className="flex-1 min-w-0 text-left px-3 py-1.5 rounded-lg text-sm transition-all flex items-center justify-between"
                    style={{
                      background: activeArtistId === artist.id ? "#fef3c7" : "transparent",
                      color: activeArtistId === artist.id ? "#d97706" : "#78716c",
                      fontWeight: activeArtistId === artist.id ? 500 : 400,
                    }}
                  >
                    <span className="truncate">{artist.name}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded shrink-0 ml-2"
                      style={{
                        background: activeArtistId === artist.id ? "#d97706" : "#f5ede0",
                        color: activeArtistId === artist.id ? "white" : "#a8956b",
                      }}
                    >
                      {artist.songCount}
                    </span>
                  </button>
                  {isAdmin && (
                    <button
                      className="opacity-0 group-hover/artist:opacity-100 transition-opacity p-1 shrink-0"
                      title={artist.songCount > 0 ? "该歌手下有歌曲，无法删除" : "删除歌手"}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (artist.songCount > 0) {
                          toast.error(`该歌手下有 ${artist.songCount} 首歌曲，无法删除`);
                          return;
                        }
                        if (!confirm(`确定删除歌手「${artist.name}」？`)) return;
                        musicApi.deleteArtist(artist.id).then(() => {
                          toast.success("歌手已删除");
                          if (activeArtistId === artist.id) setActiveArtistId(null);
                          loadSidebarData();
                        }).catch((err: any) => {
                          toast.error(err?.message || "删除失败");
                        });
                      }}
                      style={{ color: artist.songCount > 0 ? "#d1d5db" : "#dc2626" }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tag Filter */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.06)" }}
          >
            <h3 className="flex items-center gap-2 mb-3 text-sm" style={{ color: "#1c1917" }}>
              <Tag size={15} style={{ color: "#d97706" }} />
              标签
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 rounded-lg text-xs transition-all group/tag"
                  style={{
                    background: activeTag === tag ? "#d97706" : "#fef3c7",
                    fontWeight: 500,
                  }}
                >
                  <button
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className="px-2.5 py-1"
                    style={{
                      color: activeTag === tag ? "white" : "#d97706",
                    }}
                  >
                    #{tag}
                  </button>
                  {isAdmin && (
                    <button
                      className="pr-1.5 opacity-0 group-hover/tag:opacity-100 transition-opacity"
                      title="删除标签"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!confirm(`确定删除标签「${tag}」？`)) return;
                        musicApi.deleteTag(tag).then(() => {
                          toast.success("标签已删除");
                          if (activeTag === tag) setActiveTag(null);
                          loadSidebarData();
                        }).catch((err: any) => {
                          toast.error(err?.message || "删除失败");
                        });
                      }}
                      style={{ color: activeTag === tag ? "rgba(255,255,255,0.7)" : "#dc2626" }}
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-xs" style={{ color: "#a8956b" }}>
                  暂无标签
                </span>
              )}
            </div>
          </div>

          {/* Top Songs */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.06)" }}
          >
            <h3 className="flex items-center gap-2 mb-3 text-sm" style={{ color: "#1c1917" }}>
              <TrendingUp size={15} style={{ color: "#d97706" }} />
              热门音乐
            </h3>
            <div className="space-y-2.5">
              {hotMusic.map((song: any, i: number) => (
                <div
                  key={song.id}
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => handlePlay(song)}
                >
                  <span
                    className="text-xs w-5 text-center shrink-0"
                    style={{
                      color: i < 3 ? "#d97706" : "#a8956b",
                      fontWeight: i < 3 ? 600 : 400,
                    }}
                  >
                    {i + 1}
                  </span>
                  {song.cover ? (
                    <img
                      src={song.cover}
                      alt={song.title}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "#fef3c7" }}
                    >
                      <Music2 size={12} style={{ color: "#d97706" }} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs truncate" style={{ fontWeight: 500, color: "#1c1917" }}>
                      {song.title}
                    </p>
                    <p style={{ fontSize: "0.65rem", color: "#78716c" }}>
                      {formatPlays(song.plays)}播放
                    </p>
                  </div>
                </div>
              ))}
              {hotMusic.length === 0 && (
                <span className="text-xs" style={{ color: "#a8956b" }}>
                  暂无数据
                </span>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Upload Music Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={(open: boolean) => {
        setShowUploadDialog(open);
        if (!open) {
          setEditingSong(null);
          setUploadForm(emptyForm);
        }
      }}>
        <DialogContent
          className="sm:max-w-lg max-h-[85vh] overflow-y-auto"
          style={{ background: "#fffbf5", border: "1.5px solid #f3e8d0" }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#1c1917" }}>{editingSong ? "编辑音乐" : "上传音频"}</DialogTitle>
            <DialogDescription style={{ color: "#78716c" }}>
              {editingSong ? "修改音乐信息" : "添加新的音乐到曲库"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* 歌曲标题 */}
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#1c1917", fontWeight: 500 }}>
                歌曲标题 <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                value={uploadForm.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="请输入歌曲标题"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
                style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
                onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
              />
            </div>

            {/* 音频URL */}
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#1c1917", fontWeight: 500 }}>
                音频来源 <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <div className="flex gap-2">
                <input
                  value={uploadForm.audioUrl}
                  onChange={(e) => updateField("audioUrl", e.target.value)}
                  placeholder={uploadForm.driveFileId ? "已选择网盘文件" : "请输入音频文件地址"}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
                  style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
                  onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                  onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
                  disabled={!!uploadForm.driveFileId}
                />
                <button
                  type="button"
                  onClick={() => setShowDrivePicker(true)}
                  className="px-3 py-2 rounded-xl text-sm whitespace-nowrap"
                  style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#d97706", fontWeight: 500 }}
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
                    style={{ border: "1px solid #f3e8d0", color: "#57534e", background: "white" }}
                  >
                    清除
                  </button>
                </div>
              )}
            </div>

            {/* 封面URL */}
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#1c1917", fontWeight: 500 }}>
                封面图URL
              </label>
              <input
                value={uploadForm.cover}
                onChange={(e) => updateField("cover", e.target.value)}
                placeholder="请输入封面图地址"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
                style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
                onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
              />
            </div>

            {/* 歌手 */}
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#1c1917", fontWeight: 500 }}>
                歌手
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <select
                    value={uploadForm.artistId}
                    onChange={(e) => {
                      updateField("artistId", e.target.value);
                      if (e.target.value) updateField("artistName", "");
                    }}
                    disabled={!!(uploadForm.artistName || "").trim()}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors disabled:opacity-50"
                    style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
                    onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                    onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
                  >
                    <option value="">选择已有歌手</option>
                    {artists.map((a: any) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    value={uploadForm.artistName || ""}
                    onChange={(e) => {
                      updateField("artistName", e.target.value);
                      if (e.target.value.trim()) updateField("artistId", "");
                    }}
                    placeholder="或输入新歌手名称"
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
                    style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
                    onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                    onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
                  />
                </div>
              </div>
              {(uploadForm.artistName || "").trim() && (
                <p className="text-xs mt-1" style={{ color: "#d97706" }}>
                  将创建新歌手「{(uploadForm.artistName || "").trim()}」
                </p>
              )}
            </div>

            {/* 分类 */}
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#1c1917", fontWeight: 500 }}>
                分类
              </label>
              <select
                value={uploadForm.categoryId}
                onChange={(e) => updateField("categoryId", e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
                style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
                onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
              >
                <option value="">请选择</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* 时长 + 标签 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: "#1c1917", fontWeight: 500 }}>
                  时长（秒）
                </label>
                <input
                  type="number"
                  value={uploadForm.duration}
                  onChange={(e) => updateField("duration", e.target.value)}
                  placeholder="如 240"
                  min="0"
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
                  style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
                  onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                  onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
                />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: "#1c1917", fontWeight: 500 }}>
                  标签
                </label>
                <input
                  value={uploadForm.tagsInput}
                  onChange={(e) => updateField("tagsInput", e.target.value)}
                  placeholder="逗号分隔，如 治愈,轻音乐"
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
                  style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
                  onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                  onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#1c1917", fontWeight: 500 }}>
                码率（kbps）
              </label>
              <input
                type="number"
                value={uploadForm.audioBitrateKbps}
                onChange={(e) => updateField("audioBitrateKbps", e.target.value)}
                placeholder="可选，如 320"
                min="0"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
                style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
                onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
              />
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#1c1917", fontWeight: 500 }}>
                描述
              </label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="歌曲简介..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors resize-none"
                style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
                onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
              />
            </div>

            {/* 歌词 */}
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#1c1917", fontWeight: 500 }}>
                歌词
              </label>
              <textarea
                value={uploadForm.lyrics}
                onChange={(e) => updateField("lyrics", e.target.value)}
                placeholder="歌词内容..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors resize-none"
                style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
                onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowUploadDialog(false);
                  setUploadForm(emptyForm);
                  setEditingSong(null);
                }}
                className="px-4 py-2 rounded-xl text-sm transition-colors"
                style={{ color: "#78716c", border: "1.5px solid #f3e8d0", background: "white" }}
                disabled={submitting}
              >
                取消
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUploadSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm text-white transition-opacity disabled:opacity-60"
                style={{ background: "#d97706", fontWeight: 500 }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    提交中...
                  </>
                ) : editingSong ? (
                  <>
                    <Pencil size={14} />
                    保存修改
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    确认上传
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DriveFilePickerDialog
        open={showDrivePicker}
        onOpenChange={setShowDrivePicker}
        fileCategory="audio"
        multiSelect={false}
        onConfirm={applyDriveSelection}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
