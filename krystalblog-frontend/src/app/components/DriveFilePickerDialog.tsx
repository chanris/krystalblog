import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { driveApi, type DriveFileVO, type DriveFolderVO } from "../services/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileCategory?: "audio" | "video" | "all";
  multiSelect?: boolean;
  onConfirm: (files: DriveFileVO[]) => void;
};

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

function toMillisStartOfDay(dateStr: string | undefined): number | undefined {
  if (!dateStr) return undefined;
  const d = new Date(`${dateStr}T00:00:00`);
  const t = d.getTime();
  return Number.isFinite(t) ? t : undefined;
}

function toMillisEndOfDay(dateStr: string | undefined): number | undefined {
  if (!dateStr) return undefined;
  const d = new Date(`${dateStr}T23:59:59`);
  const t = d.getTime();
  return Number.isFinite(t) ? t : undefined;
}

export default function DriveFilePickerDialog({
  open,
  onOpenChange,
  fileCategory = "all",
  multiSelect = false,
  onConfirm,
}: Props) {
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [folders, setFolders] = useState<DriveFolderVO[]>([]);
  const [folderPath, setFolderPath] = useState<DriveFolderVO[]>([]);

  const [keyword, setKeyword] = useState("");
  const [uploadedAfter, setUploadedAfter] = useState<string>("");
  const [uploadedBefore, setUploadedBefore] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAtDesc");

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);
  const [files, setFiles] = useState<DriveFileVO[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const resetState = useCallback(() => {
    setCurrentFolderId(null);
    setFolders([]);
    setFolderPath([]);
    setKeyword("");
    setUploadedAfter("");
    setUploadedBefore("");
    setSortBy("createdAtDesc");
    setPage(1);
    setTotal(0);
    setFiles([]);
    setSelectedIds(new Set());
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  const loadFolders = useCallback(async () => {
    try {
      const res = await driveApi.folders({ parentId: currentFolderId ?? undefined });
      setFolders(res.data || []);
    } catch (e: any) {
      toast.error(e?.message || "加载网盘文件夹失败");
      setFolders([]);
    }
  }, [currentFolderId]);

  const loadFolderPath = useCallback(async () => {
    if (currentFolderId == null) {
      setFolderPath([]);
      return;
    }
    try {
      const res = await driveApi.folderPath(currentFolderId);
      setFolderPath(res.data || []);
    } catch {
      setFolderPath([]);
    }
  }, [currentFolderId]);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await driveApi.filesPicker({
        page,
        size: pageSize,
        folderId: currentFolderId ?? undefined,
        keyword: keyword.trim() ? keyword.trim() : undefined,
        fileCategory: fileCategory === "all" ? undefined : fileCategory,
        uploadedAfterMillis: toMillisStartOfDay(uploadedAfter),
        uploadedBeforeMillis: toMillisEndOfDay(uploadedBefore),
        sortBy,
      });
      setFiles(res.data.records || []);
      setTotal(res.data.total || 0);
    } catch (e: any) {
      toast.error(e?.message || "加载网盘文件失败");
      setFiles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, currentFolderId, keyword, fileCategory, uploadedAfter, uploadedBefore, sortBy]);

  useEffect(() => {
    if (!open) return;
    void loadFolders();
    void loadFolderPath();
  }, [open, loadFolders, loadFolderPath]);

  useEffect(() => {
    if (!open) return;
    void loadFiles();
  }, [open, loadFiles]);

  useEffect(() => {
    if (!open) return;
    setPage(1);
  }, [open, currentFolderId, fileCategory, keyword, uploadedAfter, uploadedBefore, sortBy]);

  const toggleSelect = (fileId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
        return next;
      }
      if (!multiSelect) {
        return new Set([fileId]);
      }
      next.add(fileId);
      return next;
    });
  };

  const selectedFiles = useMemo(() => {
    const ids = selectedIds;
    return files.filter((f) => ids.has(f.id));
  }, [files, selectedIds]);

  const confirm = () => {
    if (selectedFiles.length === 0) {
      toast.error("请选择文件");
      return;
    }
    onConfirm(selectedFiles);
    onOpenChange(false);
  };

  const breadcrumb = useMemo(() => {
    const root = [{ id: -1, name: "根目录" } as DriveFolderVO];
    return root.concat(folderPath);
  }, [folderPath]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>从网盘选择</DialogTitle>
          <DialogDescription>选择已上传到网盘的文件进行引用，无需重复上传</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-4">
          <div className="rounded-xl border" style={{ borderColor: "#f3e8d0", background: "#fff" }}>
            <div className="px-3 py-2 text-sm" style={{ color: "#57534e", borderBottom: "1px solid #f3e8d0" }}>
              文件夹
            </div>
            <div className="p-2 space-y-1 max-h-[24rem] overflow-auto">
              <button
                type="button"
                onClick={() => setCurrentFolderId(null)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm"
                style={{ background: currentFolderId == null ? "#fffbeb" : "transparent", color: "#44403c" }}
              >
                根目录
              </button>
              {folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCurrentFolderId(f.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm"
                  style={{ background: currentFolderId === f.id ? "#fffbeb" : "transparent", color: "#44403c" }}
                >
                  {f.name}
                </button>
              ))}
              {folders.length === 0 && (
                <div className="px-3 py-2 text-sm" style={{ color: "#a8a29e" }}>
                  暂无子文件夹
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="text-sm truncate" style={{ color: "#78716c" }}>
                {breadcrumb.map((b, idx) => (
                  <span key={`${b.id}-${idx}`}>
                    <button
                      type="button"
                      className="underline-offset-2 hover:underline"
                      onClick={() => setCurrentFolderId(b.id === -1 ? null : b.id)}
                      style={{ color: "#78716c" }}
                    >
                      {b.name}
                    </button>
                    {idx < breadcrumb.length - 1 ? " / " : ""}
                  </span>
                ))}
              </div>
              <div className="flex-1" />
              <div className="text-xs" style={{ color: "#a8a29e" }}>
                已选 {selectedIds.size}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mb-3">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索文件名..."
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ border: "1.5px solid #f3e8d0", background: "white" }}
              />
              <input
                value={uploadedAfter}
                onChange={(e) => setUploadedAfter(e.target.value)}
                type="date"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ border: "1.5px solid #f3e8d0", background: "white" }}
              />
              <input
                value={uploadedBefore}
                onChange={(e) => setUploadedBefore(e.target.value)}
                type="date"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ border: "1.5px solid #f3e8d0", background: "white" }}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ border: "1.5px solid #f3e8d0", background: "white" }}
              >
                <option value="createdAtDesc">上传时间：新到旧</option>
                <option value="createdAtAsc">上传时间：旧到新</option>
                <option value="fileSizeDesc">文件大小：大到小</option>
                <option value="fileSizeAsc">文件大小：小到大</option>
                <option value="lastAccessedAtDesc">最近访问</option>
              </select>
            </div>

            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#f3e8d0", background: "white" }}>
              <div
                className="grid items-center px-4 py-2 text-xs"
                style={{
                  gridTemplateColumns: "2.5rem 1fr 7rem 8rem",
                  color: "#a8956b",
                  borderBottom: "1px solid #f5ede0",
                  background: "#faf8f5",
                }}
              >
                <span></span>
                <span>文件名</span>
                <span className="text-right">大小</span>
                <span className="text-right">上传时间</span>
              </div>

              <div className="max-h-[22rem] overflow-auto">
                {loading ? (
                  <div className="px-4 py-6 text-sm" style={{ color: "#78716c" }}>
                    加载中...
                  </div>
                ) : files.length === 0 ? (
                  <div className="px-4 py-6 text-sm" style={{ color: "#78716c" }}>
                    暂无文件
                  </div>
                ) : (
                  files.map((f) => {
                    const checked = selectedIds.has(f.id);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => toggleSelect(f.id)}
                        className="w-full text-left grid items-center px-4 py-2 text-sm"
                        style={{
                          gridTemplateColumns: "2.5rem 1fr 7rem 8rem",
                          borderBottom: "1px solid #f5ede0",
                          background: checked ? "#fffbeb" : "transparent",
                          color: "#1c1917",
                        }}
                      >
                        <span className="flex justify-center">
                          <Checkbox checked={checked} />
                        </span>
                        <span className="truncate" title={f.fileName}>
                          {f.fileName}
                        </span>
                        <span className="text-right" style={{ color: "#78716c" }}>
                          {formatBytes(f.fileSize)}
                        </span>
                        <span className="text-right" style={{ color: "#a8956b" }}>
                          {(f.createdAt || "").slice(0, 10)}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="flex items-center justify-between px-4 py-2" style={{ background: "#fff", borderTop: "1px solid #f3e8d0" }}>
                <div className="text-xs" style={{ color: "#a8a29e" }}>
                  第 {page} / {totalPages} 页，共 {total} 个文件
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                    style={{ border: "1px solid #f3e8d0", background: "white", color: "#57534e" }}
                  >
                    上一页
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                    style={{ border: "1px solid #f3e8d0", background: "white", color: "#57534e" }}
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ border: "1px solid #f3e8d0", color: "#57534e", background: "white" }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirm}
                className="px-4 py-2 rounded-lg text-sm text-white"
                style={{ background: "#d97706" }}
              >
                确认选择
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
