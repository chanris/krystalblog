import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload, Download, Trash2, Search, FolderOpen,
  HardDrive, AlertTriangle, Plus, Grid, List,
  Folder, FolderPlus, ChevronRight, Home, X
} from "lucide-react";
import { driveFiles, driveFolders } from "../data/mockData";
import { useApp } from "../context/AppContext";
import { driveApi, type DriveStatsVO } from "../services/api";

const typeColors: Record<string, { bg: string; text: string }> = {
  pdf: { bg: "#fee2e2", text: "#dc2626" },
  figma: { bg: "#f3e8ff", text: "#7c3aed" },
  excel: { bg: "#dcfce7", text: "#16a34a" },
  image: { bg: "#dbeafe", text: "#2563eb" },
  archive: { bg: "#fef3c7", text: "#d97706" },
  markdown: { bg: "#f0f9ff", text: "#0891b2" },
  video: { bg: "#fce7f3", text: "#db2777" },
  audio: { bg: "#e0f2fe", text: "#0284c7" },
  word: { bg: "#eff6ff", text: "#3b82f6" },
  default: { bg: "#f5f5f4", text: "#78716c" },
};

type DriveFolderItem = {
  id: number;
  name: string;
  parentId: number | null;
  itemCount: number;
  date: string;
};

type DriveFileItem = {
  id: number;
  name: string;
  type: string;
  size: string;
  sizeBytes: number;
  date: string;
};

type DrivePageInfo = {
  page: number;
  size: number;
  total: number;
  pages: number;
};

const quotaFallbackBytes = 100 * 1024 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  const digits = i === 0 ? 0 : i === 1 ? 0 : 1;
  return `${v.toFixed(digits)} ${units[i]}`;
}

function toDateOnly(value?: string): string {
  if (!value) return "";
  if (value.length >= 10) return value.slice(0, 10);
  return value;
}

function toCategory(fileName: string, fileType?: string): string {
  const lower = fileName.toLowerCase();
  const dot = lower.lastIndexOf(".");
  const ext = dot >= 0 ? lower.slice(dot + 1) : "";

  if (ext === "pdf") return "pdf";
  if (ext === "fig") return "figma";
  if (ext === "xls" || ext === "xlsx") return "excel";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  if (ext === "md" || ext === "markdown") return "markdown";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return "video";
  if (["mp3", "wav", "flac", "aac", "m4a", "ogg", "opus", "weba"].includes(ext)) return "audio";
  if (ext === "doc" || ext === "docx") return "word";

  const ft = (fileType || "").toLowerCase();
  if (ft.startsWith("image/")) return "image";
  if (ft.startsWith("video/")) return "video";
  if (ft.startsWith("audio/")) return "audio";
  return "default";
}

function toIcon(category: string): string {
  return (
    {
      pdf: "📄",
      figma: "🎨",
      excel: "📊",
      image: "🖼️",
      archive: "📦",
      markdown: "📝",
      video: "🎬",
      audio: "🎵",
      word: "📃",
      default: "📁",
    }[category] || "📁"
  );
}

async function downloadBlobAsFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Drive() {
  const { isAdmin } = useApp();
  const useMock = useMemo(() => {
    try {
      return localStorage.getItem("useMockDrive") === "true";
    } catch {
      return false;
    }
  }, []);
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [folders, setFolders] = useState<DriveFolderItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; type: "file" | "folder" } | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DriveStatsVO | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<DriveFolderItem[]>([]);
  const [pageInfo, setPageInfo] = useState<DrivePageInfo>({ page: 1, size: 50, total: 0, pages: 1 });

  const cacheRef = useRef(new Map<string, { folders: DriveFolderItem[]; files: DriveFileItem[]; breadcrumb: DriveFolderItem[]; pageInfo: DrivePageInfo }>());

  // 访问控制 UI 放到 hooks 之后，避免在某些渲染中少执行 hooks

  const currentFolder = currentFolderId !== null ? folders.find((f) => f.id === currentFolderId) : null;

  const totalSizeBytes = stats?.totalSizeBytes ?? 0;
  const quotaBytes = stats?.quotaBytes ?? quotaFallbackBytes;
  const totalGB = (totalSizeBytes / 1024 / 1024 / 1024).toFixed(2);
  const usagePercent = Math.min((totalSizeBytes / quotaBytes) * 100, 100);

  const visibleFolders = folders;
  const visibleFiles = files;

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const refresh = async (opts?: { resetPage?: boolean }) => {
    const keyword = search.trim() || undefined;
    const folderId = currentFolderId ?? undefined;
    const page = opts?.resetPage ? 1 : pageInfo.page;
    const size = pageInfo.size;

    const cacheKey = JSON.stringify({ useMock, folderId: folderId ?? null, keyword: keyword ?? null, page, size });
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setFolders(cached.folders);
      setFiles(cached.files);
      setBreadcrumb(cached.breadcrumb);
      setPageInfo(cached.pageInfo);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (useMock) {
        const mockFolders = driveFolders
          .filter((f) => (f.parentId ?? null) === (folderId ?? null))
          .filter((f) => (keyword ? f.name.toLowerCase().includes(keyword.toLowerCase()) : true))
          .map((f) => ({
            id: f.id,
            name: f.name,
            parentId: (f.parentId ?? null) as number | null,
            itemCount: (f.itemCount ?? 0) as number,
            date: f.date,
          }));

        const mockFiles = driveFiles
          .filter((f) => (f.parentId ?? null) === (folderId ?? null))
          .filter((f) => (keyword ? f.name.toLowerCase().includes(keyword.toLowerCase()) : true))
          .map((f) => ({
            id: f.id,
            name: f.name,
            type: f.type,
            size: f.size,
            sizeBytes: f.sizeBytes,
            date: f.date,
          }));

        const folderMap = new Map(driveFolders.map((f) => [f.id, f]));
        const path: DriveFolderItem[] = [];
        let cursor = folderId ?? null;
        while (cursor !== null) {
          const folder = folderMap.get(cursor);
          if (!folder) break;
          path.unshift({
            id: folder.id,
            name: folder.name,
            parentId: (folder.parentId ?? null) as number | null,
            itemCount: (folder.itemCount ?? 0) as number,
            date: folder.date,
          });
          cursor = (folder.parentId ?? null) as number | null;
        }

        const nextPageInfo: DrivePageInfo = { page: 1, size: mockFiles.length, total: mockFiles.length, pages: 1 };

        setFolders(mockFolders);
        setFiles(mockFiles);
        setBreadcrumb(path);
        setPageInfo(nextPageInfo);

        cacheRef.current.set(cacheKey, { folders: mockFolders, files: mockFiles, breadcrumb: path, pageInfo: nextPageInfo });
        return;
      }

      const [folderRes, fileRes, statsRes] = await Promise.all([
        driveApi.folders({ parentId: folderId, keyword }),
        driveApi.files({ page, size, folderId, keyword }),
        driveApi.stats(),
      ]);

      setStats(statsRes.data);

      const nextFolders: DriveFolderItem[] = folderRes.data.map((f) => ({
        id: f.id,
        name: f.name,
        parentId: (f.parentId ?? null) as number | null,
        itemCount: f.itemCount ?? 0,
        date: toDateOnly(f.updatedAt || f.createdAt) || "",
      }));

      const records = fileRes.data.records || [];
      const nextFiles: DriveFileItem[] = records.map((f) => {
        const category = toCategory(f.fileName, f.fileType);
        return {
          id: f.id,
          name: f.fileName,
          type: category,
          size: formatBytes(f.fileSize),
          sizeBytes: f.fileSize,
          date: toDateOnly(f.updatedAt || f.createdAt) || "",
        };
      });

      const nextBreadcrumb: DriveFolderItem[] = folderId
        ? (await driveApi.folderPath(folderId)).data.map((f) => ({
          id: f.id,
          name: f.name,
          parentId: (f.parentId ?? null) as number | null,
          itemCount: f.itemCount ?? 0,
          date: toDateOnly(f.updatedAt || f.createdAt) || "",
        }))
        : [];

      const nextPageInfo: DrivePageInfo = {
        page: fileRes.data.current ?? page,
        size: fileRes.data.size ?? size,
        total: fileRes.data.total ?? 0,
        pages: fileRes.data.pages ?? 1,
      };

      setFolders(nextFolders);
      setFiles(nextFiles);
      setBreadcrumb(nextBreadcrumb);
      setPageInfo(nextPageInfo);
      cacheRef.current.set(cacheKey, { folders: nextFolders, files: nextFiles, breadcrumb: nextBreadcrumb, pageInfo: nextPageInfo });
    } catch (e: any) {
      setError(e?.message || "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelected(new Set());
    void refresh({ resetPage: true });
  }, [currentFolderId]);

  useEffect(() => {
    const t = setTimeout(() => {
      void refresh({ resetPage: true });
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (useMock) {
      const total = driveFiles.reduce((sum, f) => sum + f.sizeBytes, 0);
      const typeCounts: Record<string, number> = {};
      for (const f of driveFiles) {
        typeCounts[f.type] = (typeCounts[f.type] || 0) + 1;
      }
      setStats({
        folderCount: driveFolders.length,
        fileCount: driveFiles.length,
        totalSizeBytes: total,
        quotaBytes: quotaFallbackBytes,
        typeCounts,
      });
      return;
    }
    void driveApi.stats().then((res) => setStats(res.data)).catch(() => {});
  }, [useMock]);

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (useMock) {
        const now = new Date().toISOString().slice(0, 10);
        driveFolders.push({
          id: Date.now(),
          name: newFolderName.trim(),
          parentId: currentFolderId,
          date: now,
          itemCount: 0,
        });
      } else {
        await driveApi.createFolder({ name: newFolderName.trim(), parentId: currentFolderId ?? undefined });
      }
      cacheRef.current.clear();
      setShowFolderModal(false);
      setNewFolderName("");
      await refresh({ resetPage: true });
    } catch (e: any) {
      setError(e?.message || "创建失败");
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      if (useMock) {
        const idx = driveFiles.findIndex((f) => f.id === id);
        if (idx >= 0) driveFiles.splice(idx, 1);
      } else {
        await driveApi.deleteFile(id);
      }
      cacheRef.current.clear();
      setDeleteTarget(null);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await refresh();
    } catch (e: any) {
      setError(e?.message || "删除失败");
    } finally {
      setLoading(false);
    }
  };

  const deleteFolder = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      if (useMock) {
        const removeFolderRecursive = (folderId: number) => {
          const childFolderIds = driveFolders.filter((f) => (f.parentId ?? null) === folderId).map((f) => f.id);
          for (const childId of childFolderIds) removeFolderRecursive(childId);
          for (let i = driveFiles.length - 1; i >= 0; i -= 1) {
            if ((driveFiles[i].parentId ?? null) === folderId) driveFiles.splice(i, 1);
          }
          for (let i = driveFolders.length - 1; i >= 0; i -= 1) {
            if (driveFolders[i].id === folderId) driveFolders.splice(i, 1);
          }
        };
        removeFolderRecursive(id);
      } else {
        await driveApi.deleteFolder(id);
      }
      cacheRef.current.clear();
      setDeleteTarget(null);
      if (currentFolderId === id) setCurrentFolderId(null);
      await refresh({ resetPage: true });
    } catch (e: any) {
      setError(e?.message || "删除失败");
    } finally {
      setLoading(false);
    }
  };

  const deleteSelectedFiles = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      if (useMock) {
        for (let i = driveFiles.length - 1; i >= 0; i -= 1) {
          if (ids.includes(driveFiles[i].id)) driveFiles.splice(i, 1);
        }
      } else {
        await driveApi.deleteFiles(ids);
      }
      cacheRef.current.clear();
      setSelected(new Set());
      await refresh();
    } catch (e: any) {
      setError(e?.message || "删除失败");
    } finally {
      setLoading(false);
    }
  };

  const startUpload = async () => {
    if (uploadFiles.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      if (useMock) {
        const now = new Date().toISOString().slice(0, 10);
        for (const f of uploadFiles) {
          const category = toCategory(f.name, f.type);
          driveFiles.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: f.name,
            type: category,
            size: formatBytes(f.size),
            sizeBytes: f.size,
            date: now,
            icon: toIcon(category),
            parentId: currentFolderId,
          });
        }
      } else {
        for (const f of uploadFiles) {
          const fd = new FormData();
          fd.append("file", f);
          if (currentFolderId !== null) fd.append("folderId", String(currentFolderId));
          await driveApi.uploadMultipart(fd);
        }
      }
      cacheRef.current.clear();
      setShowUploadModal(false);
      setUploadFiles([]);
      await refresh({ resetPage: true });
    } catch (e: any) {
      setError(e?.message || "上传失败");
    } finally {
      setLoading(false);
    }
  };

  const downloadOne = async (id: number, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await driveApi.downloadFile(id);
      await downloadBlobAsFile(blob, name);
    } catch (e: any) {
      setError(e?.message || "下载失败");
    } finally {
      setLoading(false);
    }
  };

  const downloadSelected = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    for (const id of ids) {
      const file = files.find((f) => f.id === id);
      if (!file) continue;
      await downloadOne(id, file.name);
    }
  };

  const getColor = (type: string) => typeColors[type] || typeColors.default;

  const hasItems = visibleFolders.length > 0 || visibleFiles.length > 0;

  const headerCounts = useMemo(() => {
    const folderCount = stats?.folderCount ?? folders.length;
    const fileCount = stats?.fileCount ?? files.length;
    return { folderCount, fileCount };
  }, [stats, folders.length, files.length]);

  const typeCounts = stats?.typeCounts || {};
  const imageCount = typeCounts.image ?? files.filter((f) => f.type === "image").length;
  const videoCount = typeCounts.video ?? files.filter((f) => f.type === "video").length;
  const docCount =
    (typeCounts.pdf ?? 0) + (typeCounts.word ?? 0) + (typeCounts.markdown ?? 0) ||
    files.filter((f) => ["pdf", "word", "markdown"].includes(f.type)).length;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "#fef3c7" }}
        >
          <AlertTriangle size={36} style={{ color: "#d97706" }} />
        </div>
        <h2 style={{ color: "#1c1917", marginBottom: "0.5rem" }}>无访问权限</h2>
        <p style={{ color: "#78716c", fontSize: "0.9rem" }}>网盘功能仅限管理员使用</p>
        <p style={{ color: "#a8956b", fontSize: "0.8rem", marginTop: "0.5rem" }}>请在顶部导航栏切换为管理员模式</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 style={{ color: "#1c1917" }}>网盘</h1>
          <p style={{ fontSize: "0.85rem", color: "#78716c" }}>
            共 {headerCounts.folderCount} 个文件夹 · {headerCounts.fileCount} 个文件
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="p-2 rounded-xl transition-colors"
            style={{ background: "white", color: "#78716c", border: "1.5px solid #f3e8d0" }}
          >
            {viewMode === "list" ? <Grid size={16} /> : <List size={16} />}
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFolderModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
            style={{ background: "white", color: "#d97706", border: "1.5px solid #fde68a", fontWeight: 500 }}
          >
            <FolderPlus size={16} />
            新建文件夹
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
            style={{ background: "#d97706", fontWeight: 500 }}
          >
            <Upload size={16} />
            上传文件
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="md:col-span-2 p-5 rounded-2xl" style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HardDrive size={18} style={{ color: "#d97706" }} />
              <span className="text-sm" style={{ fontWeight: 500, color: "#1c1917" }}>存储空间</span>
            </div>
            <span className="text-sm" style={{ color: "#78716c" }}>{totalGB} GB / 100 GB</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "#f5ede0" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #fbbf24, #d97706)" }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: "#a8956b" }}>已使用 {usagePercent.toFixed(1)}%</p>
        </div>
        <div className="p-5 rounded-2xl flex flex-col justify-center" style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.06)" }}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "文件夹", count: headerCounts.folderCount, color: "#d97706" },
              { label: "图片", count: imageCount, color: "#2563eb" },
              { label: "视频", count: videoCount, color: "#db2777" },
              { label: "文档", count: docCount, color: "#16a34a" },
            ].map(({ label, count, color }) => (
              <div key={label} className="text-center">
                <p style={{ fontSize: "1.3rem", fontWeight: 700, color }}>{count}</p>
                <p style={{ fontSize: "0.7rem", color: "#78716c" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 flex-wrap">
        <button
          onClick={() => setCurrentFolderId(null)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm transition-colors hover:bg-amber-50"
          style={{ color: currentFolderId === null ? "#d97706" : "#78716c", fontWeight: currentFolderId === null ? 600 : 400 }}
        >
          <Home size={14} />
          根目录
        </button>
        {breadcrumb.map((folder, i) => (
          <div key={folder.id} className="flex items-center gap-1">
            <ChevronRight size={14} style={{ color: "#d3c4a8" }} />
            <button
              onClick={() => setCurrentFolderId(folder.id)}
              className="px-2.5 py-1.5 rounded-lg text-sm transition-colors hover:bg-amber-50"
              style={{
                color: i === breadcrumb.length - 1 ? "#d97706" : "#78716c",
                fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
              }}
            >
              {folder.name}
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#a8956b" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={currentFolder ? `在「${currentFolder.name}」中搜索...` : "搜索文件或文件夹..."}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
            onFocus={(e) => (e.target.style.borderColor = "#d97706")}
            onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
          />
        </div>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <span className="text-sm" style={{ color: "#78716c" }}>已选 {selected.size} 个</span>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm"
              style={{ background: "#dcfce7", color: "#16a34a" }}
              onClick={downloadSelected}
            >
              <Download size={14} />
              下载
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm"
              style={{ background: "#fee2e2", color: "#dc2626" }}
              onClick={deleteSelectedFiles}
            >
              <Trash2 size={14} />
              删除
            </button>
          </motion.div>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl" style={{ background: "#fee2e2", color: "#991b1b" }}>
          {error}
        </div>
      )}

      {viewMode === "list" ? (
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", boxShadow: "0 2px 16px rgba(120,80,20,0.07)" }}>
          <div
            className="grid items-center px-5 py-2.5 text-xs"
            style={{
              gridTemplateColumns: "2rem 2.5rem 1fr 6rem 6rem 8rem 5rem",
              color: "#a8956b",
              borderBottom: "1px solid #f5ede0",
              background: "#faf8f5",
            }}
          >
            <span></span>
            <span>类型</span>
            <span>名称</span>
            <span>大小</span>
            <span className="hidden md:block">类型</span>
            <span className="hidden md:block">修改时间</span>
            <span className="text-right">操作</span>
          </div>

          <AnimatePresence>
            {visibleFolders.map((folder, i) => (
              <motion.div
                key={`folder-${folder.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: i * 0.02 }}
                className="grid items-center px-5 py-3 group cursor-pointer"
                style={{
                  gridTemplateColumns: "2rem 2.5rem 1fr 6rem 6rem 8rem 5rem",
                  borderBottom: "1px solid #f5ede0",
                  background: "transparent",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#faf8f5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                onClick={() => setCurrentFolderId(folder.id)}
              >
                <span></span>
                <span className="text-xl">📁</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm truncate" style={{ color: "#1c1917", fontWeight: 600 }}>{folder.name}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-md shrink-0" style={{ background: "#fef3c7", color: "#d97706" }}>
                    {folder.itemCount} 项
                  </span>
                </div>
                <span className="text-xs" style={{ color: "#a8956b" }}>—</span>
                <span
                  className="hidden md:inline-block px-2 py-0.5 rounded-lg text-xs"
                  style={{ background: "#fef3c7", color: "#d97706", fontWeight: 500 }}
                >
                  文件夹
                </span>
                <span className="hidden md:block text-xs" style={{ color: "#78716c" }}>{folder.date}</span>
                <div
                  className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    style={{ color: "#dc2626" }}
                    title="删除文件夹"
                    onClick={() => setDeleteTarget({ id: folder.id, type: "folder" })}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}

            {visibleFiles.map((file, i) => {
              const color = getColor(file.type);
              return (
                <motion.div
                  key={`file-${file.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: (visibleFolders.length + i) * 0.02 }}
                  className="grid items-center px-5 py-3 group cursor-pointer"
                  style={{
                    gridTemplateColumns: "2rem 2.5rem 1fr 6rem 6rem 8rem 5rem",
                    borderBottom: i < visibleFiles.length - 1 ? "1px solid #f5ede0" : "none",
                    background: selected.has(file.id) ? "#fef3c7" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!selected.has(file.id)) e.currentTarget.style.background = "#faf8f5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = selected.has(file.id) ? "#fef3c7" : "transparent";
                  }}
                  onClick={() => toggleSelect(file.id)}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(file.id)}
                    onChange={() => toggleSelect(file.id)}
                    className="cursor-pointer accent-amber-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-xl">{toIcon(file.type)}</span>
                  <span className="text-sm truncate" style={{ color: "#1c1917", fontWeight: 500 }}>{file.name}</span>
                  <span className="text-xs" style={{ color: "#78716c" }}>{file.size}</span>
                  <span
                    className="hidden md:inline-block px-2 py-0.5 rounded-lg text-xs"
                    style={{ background: color.bg, color: color.text, fontWeight: 500, maxWidth: "5rem" }}
                  >
                    .{file.type}
                  </span>
                  <span className="hidden md:block text-xs" style={{ color: "#78716c" }}>{file.date}</span>
                  <div
                    className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                      style={{ color: "#16a34a" }}
                      title="下载"
                      onClick={() => downloadOne(file.id, file.name)}
                    >
                      <Download size={14} />
                    </button>
                    <button
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      style={{ color: "#dc2626" }}
                      title="删除"
                      onClick={() => setDeleteTarget({ id: file.id, type: "file" })}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {(loading || !hasItems) && (
            <div className="text-center py-16" style={{ color: "#a8956b" }}>
              <FolderOpen size={40} className="mx-auto mb-3 opacity-30" style={{ color: "#d97706" }} />
              <p>{loading ? "加载中..." : search ? "没有找到匹配的文件或文件夹" : "此文件夹为空"}</p>
              {!loading && !search && (
                <button
                  onClick={() => setShowFolderModal(true)}
                  className="mt-3 text-sm px-4 py-2 rounded-xl"
                  style={{ background: "#fef3c7", color: "#d97706", fontWeight: 500 }}
                >
                  新建文件夹
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {visibleFolders.map((folder, i) => (
            <motion.div
              key={`folder-${folder.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -3, boxShadow: "0 10px 30px rgba(217,119,6,0.15)" }}
              className="p-4 rounded-2xl cursor-pointer text-center group relative"
              style={{
                background: "white",
                boxShadow: "0 2px 12px rgba(120,80,20,0.06)",
                border: "2px solid transparent",
              }}
              onClick={() => setCurrentFolderId(folder.id)}
            >
              <button
                className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "#fee2e2", color: "#dc2626" }}
                onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: folder.id, type: "folder" }); }}
              >
                <X size={10} />
              </button>
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 text-3xl"
                style={{ background: "#fef3c7" }}
              >
                📁
              </div>
              <p className="text-xs truncate mb-1" style={{ color: "#1c1917", fontWeight: 600 }}>{folder.name}</p>
              <p className="text-xs" style={{ color: "#a8956b" }}>{folder.itemCount} 项</p>
            </motion.div>
          ))}

          {visibleFiles.map((file, i) => {
            const color = getColor(file.type);
            return (
              <motion.div
                key={`file-${file.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (visibleFolders.length + i) * 0.03 }}
                whileHover={{ y: -3 }}
                className="p-4 rounded-2xl cursor-pointer text-center group"
                style={{
                  background: "white",
                  boxShadow: "0 2px 12px rgba(120,80,20,0.06)",
                  border: selected.has(file.id) ? "2px solid #d97706" : "2px solid transparent",
                }}
                onClick={() => toggleSelect(file.id)}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 text-3xl"
                  style={{ background: color.bg }}
                >
                  {toIcon(file.type)}
                </div>
                <p className="text-xs truncate mb-1" style={{ color: "#1c1917", fontWeight: 500 }}>{file.name}</p>
                <p className="text-xs" style={{ color: "#a8956b" }}>{file.size}</p>
                <div className="flex justify-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-1 rounded-lg"
                    style={{ background: "#dcfce7", color: "#16a34a" }}
                    onClick={(e) => { e.stopPropagation(); void downloadOne(file.id, file.name); }}
                  >
                    <Download size={11} />
                  </button>
                  <button
                    className="p-1 rounded-lg"
                    style={{ background: "#fee2e2", color: "#dc2626" }}
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: file.id, type: "file" }); }}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </motion.div>
            );
          })}

          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => setShowFolderModal(true)}
            className="p-4 rounded-2xl cursor-pointer text-center flex flex-col items-center justify-center"
            style={{ border: "2px dashed #fde68a", minHeight: 140 }}
          >
            <FolderPlus size={24} style={{ color: "#d97706", marginBottom: "0.5rem" }} />
            <p className="text-xs" style={{ color: "#a8956b" }}>新建文件夹</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => setShowUploadModal(true)}
            className="p-4 rounded-2xl cursor-pointer text-center flex flex-col items-center justify-center"
            style={{ border: "2px dashed #f3e8d0", minHeight: 140 }}
          >
            <Plus size={24} style={{ color: "#a8956b", marginBottom: "0.5rem" }} />
            <p className="text-xs" style={{ color: "#a8956b" }}>上传文件</p>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showFolderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => { setShowFolderModal(false); setNewFolderName(""); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="p-6 rounded-2xl max-w-sm w-full"
              style={{ background: "white" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#fef3c7" }}>
                  <FolderPlus size={20} style={{ color: "#d97706" }} />
                </div>
                <div>
                  <h3 style={{ color: "#1c1917" }}>新建文件夹</h3>
                  {currentFolder && (
                    <p className="text-xs" style={{ color: "#a8956b" }}>创建于「{currentFolder.name}」中</p>
                  )}
                </div>
                <button className="ml-auto" onClick={() => { setShowFolderModal(false); setNewFolderName(""); }}>
                  <X size={18} style={{ color: "#78716c" }} />
                </button>
              </div>

              <div className="mb-5">
                <label className="block text-xs mb-1.5" style={{ color: "#78716c" }}>文件夹名称</label>
                <input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createFolder()}
                  placeholder="请输入文件夹名称"
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "#faf8f5", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
                  onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                  onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
                />
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 py-2.5 rounded-xl text-sm"
                  style={{ background: "#f5ede0", color: "#78716c" }}
                  onClick={() => { setShowFolderModal(false); setNewFolderName(""); }}
                >
                  取消
                </button>
                <button
                  className="flex-1 py-2.5 rounded-xl text-sm text-white transition-opacity"
                  style={{ background: "#d97706", opacity: !newFolderName.trim() ? 0.5 : 1 }}
                  onClick={createFolder}
                  disabled={!newFolderName.trim()}
                >
                  创建
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => { setShowUploadModal(false); setUploadFiles([]); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="p-8 rounded-2xl max-w-md w-full"
              style={{ background: "white" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-1" style={{ color: "#1c1917" }}>上传文件</h3>
              {currentFolder && (
                <p className="text-xs mb-4 flex items-center gap-1" style={{ color: "#a8956b" }}>
                  <Folder size={12} />
                  上传至「{currentFolder.name}」
                </p>
              )}
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-5"
                style={{ borderColor: isDragging ? "#d97706" : "#f3e8d0", background: isDragging ? "#fef3c7" : "#faf8f5" }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const list = Array.from(e.dataTransfer.files || []);
                  setUploadFiles(list);
                }}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <Upload size={32} className="mx-auto mb-3" style={{ color: "#d97706" }} />
                <p className="text-sm mb-1" style={{ color: "#1c1917", fontWeight: 500 }}>拖拽文件到此处</p>
                <p className="text-xs" style={{ color: "#a8956b" }}>或点击选择文件，支持任意格式</p>
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  multiple
                  onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                />
              </div>
              {uploadFiles.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs mb-2" style={{ color: "#78716c" }}>已选择 {uploadFiles.length} 个文件</p>
                  <div className="max-h-24 overflow-auto rounded-xl" style={{ background: "#faf8f5", border: "1px solid #f3e8d0" }}>
                    {uploadFiles.map((f) => (
                      <div key={f.name + f.size} className="flex items-center justify-between px-3 py-2 text-xs" style={{ color: "#1c1917" }}>
                        <span className="truncate">{f.name}</span>
                        <span style={{ color: "#a8956b" }}>{formatBytes(f.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  className="flex-1 py-2.5 rounded-xl text-sm"
                  style={{ background: "#f5ede0", color: "#78716c" }}
                  onClick={() => { setShowUploadModal(false); setUploadFiles([]); }}
                >
                  取消
                </button>
                <button
                  className="flex-1 py-2.5 rounded-xl text-sm text-white"
                  style={{ background: "#d97706", opacity: uploadFiles.length === 0 ? 0.5 : 1 }}
                  disabled={uploadFiles.length === 0}
                  onClick={startUpload}
                >
                  开始上传
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="p-6 rounded-2xl max-w-xs w-full"
              style={{ background: "white" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-2" style={{ color: "#1c1917" }}>
                确认删除{deleteTarget.type === "folder" ? "文件夹" : "文件"}
              </h3>
              <p className="text-sm mb-1" style={{ color: "#78716c" }}>
                {deleteTarget.type === "folder"
                  ? "删除文件夹将同时删除其中所有文件，此操作不可恢复。"
                  : "删除后无法恢复，确认删除？"}
              </p>
              {deleteTarget.type === "folder" && (
                <p className="text-xs mb-3" style={{ color: "#d97706" }}>
                  文件夹「{folders.find(f => f.id === deleteTarget.id)?.name}」共包含 {folders.find(f => f.id === deleteTarget.id)?.itemCount ?? 0} 项
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  className="flex-1 py-2 rounded-xl text-sm"
                  style={{ background: "#f5ede0", color: "#78716c" }}
                  onClick={() => setDeleteTarget(null)}
                >
                  取消
                </button>
                <button
                  className="flex-1 py-2 rounded-xl text-sm text-white"
                  style={{ background: "#dc2626" }}
                  onClick={() => {
                    if (deleteTarget.type === "file") void deleteFile(deleteTarget.id);
                    else void deleteFolder(deleteTarget.id);
                  }}
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
