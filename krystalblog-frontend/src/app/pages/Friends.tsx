import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ExternalLink, Search, Plus, X, Globe,
  Heart, CheckCircle, XCircle, Send, Clock, ShieldCheck,
} from "lucide-react";
import { friendLinkApi, linkCategoryApi, type FriendLinkVO, type FriendLinkCategoryVO } from "../services/api";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

export default function Friends() {
  const { isAdmin } = useApp();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("全部");
  const [friendList, setFriendList] = useState<FriendLinkVO[]>([]);
  const [categories, setCategories] = useState<FriendLinkCategoryVO[]>([]);
  const [likedFriends, setLikedFriends] = useState<Set<number>>(new Set());
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({ name: "", url: "", description: "", categoryId: undefined as number | undefined });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingList, setPendingList] = useState<FriendLinkVO[]>([]);
  const [reviewLoading, setReviewLoading] = useState<number | null>(null);
  const [categoryKeyword, setCategoryKeyword] = useState("");
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [categoryList, setCategoryList] = useState<FriendLinkCategoryVO[]>([]);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", sortOrder: "0" });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryDeleting, setCategoryDeleting] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadPending();
      loadCategoryPage(1, "");
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      const [friendsRes, categoriesRes] = await Promise.all([
        friendLinkApi.list(),
        friendLinkApi.categories(),
      ]);
      setFriendList(friendsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error("加载友链数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPending = async () => {
    try {
      const res = await friendLinkApi.list("PENDING");
      setPendingList(res.data || []);
    } catch (error) {
      console.error("加载待审核友链失败:", error);
    }
  };

  const loadCategoryPage = async (page = 1, keyword = categoryKeyword) => {
    setCategoryLoading(true);
    try {
      const res = await linkCategoryApi.list({ page, keyword: keyword || undefined });
      const pageData = res.data;
      setCategoryPage(pageData.page || 1);
      setCategoryTotalPages(pageData.pages || 1);
      setCategoryList(pageData.records || []);
    } catch (error) {
      console.error("加载分类管理列表失败:", error);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setReviewLoading(id);
    try {
      const res = await friendLinkApi.approve(id);
      setPendingList((prev) => prev.filter((f) => f.id !== id));
      if (res.data) setFriendList((prev) => [...prev, res.data]);
      toast.success("已通过友链申请");
    } catch {
      toast.error("操作失败");
    } finally {
      setReviewLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setReviewLoading(id);
    try {
      await friendLinkApi.reject(id);
      setPendingList((prev) => prev.filter((f) => f.id !== id));
      toast.success("已拒绝友链申请");
    } catch {
      toast.error("操作失败");
    } finally {
      setReviewLoading(null);
    }
  };

  const categoryNames = ["全部", ...categories.map((c) => c.name)];

  const filtered = friendList.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !(f.description || "").includes(search)) return false;
    if (activeCategory !== "全部" && f.categoryName !== activeCategory) return false;
    return true;
  });

  const activeFriends = filtered.filter((f) => f.status === "APPROVED");
  const inactiveFriends = filtered.filter((f) => f.status === "INACTIVE");

  const handleApply = async () => {
    if (!applyForm.name.trim() || !applyForm.url.trim()) {
      toast.error("请填写博客名称和地址");
      return;
    }
    try {
      await friendLinkApi.apply({
        name: applyForm.name,
        url: applyForm.url,
        description: applyForm.description || undefined,
        categoryId: applyForm.categoryId,
      });
      setSubmitted(true);
      setTimeout(() => {
        setShowApplyModal(false);
        setSubmitted(false);
        setApplyForm({ name: "", url: "", description: "", categoryId: undefined });
      }, 2000);
    } catch {
      toast.error("提交失败，请稍后重试");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await friendLinkApi.delete(id);
      setFriendList((prev) => prev.filter((f) => f.id !== id));
      toast.success("已删除友链");
    } catch {
      toast.error("删除失败");
    }
  };

  const handleCreateCategory = async () => {
    const name = categoryForm.name.trim();
    if (!name) {
      toast.error("请输入分类名称");
      return;
    }
    const sortOrder = Number(categoryForm.sortOrder.trim() || "0");
    if (!Number.isInteger(sortOrder)) {
      toast.error("排序权重必须为整数");
      return;
    }
    setCategorySaving(true);
    try {
      await linkCategoryApi.create({
        name,
        description: categoryForm.description.trim() || undefined,
        sortOrder,
      });
      toast.success("分类创建成功");
      setCategoryForm({ name: "", description: "", sortOrder: "0" });
      await Promise.all([loadData(), loadCategoryPage(1, categoryKeyword)]);
    } catch (error: any) {
      toast.error(error?.message || "分类创建失败");
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (category: FriendLinkCategoryVO) => {
    if (!window.confirm(`确定删除分类「${category.name}」吗？`)) {
      return;
    }
    setCategoryDeleting(category.id);
    try {
      await linkCategoryApi.delete(category.id);
      toast.success("分类删除成功");
      await Promise.all([loadData(), loadCategoryPage(categoryPage, categoryKeyword)]);
    } catch (error: any) {
      toast.error(error?.message || "分类删除失败");
    } finally {
      setCategoryDeleting(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 style={{ color: "#1c1917" }}>友情链接</h1>
          <p style={{ fontSize: "0.85rem", color: "#78716c" }}>与志同道合的博主们互相链接</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
          style={{ background: "#059669", fontWeight: 500 }}
        >
          <Plus size={16} />
          申请友链
        </motion.button>
      </div>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)" }}
      >
        <div className="relative z-10">
          <p className="text-sm mb-1" style={{ color: "#92400e", fontWeight: 500 }}>友链寄语</p>
          <p className="text-sm leading-relaxed max-w-xl" style={{ color: "#78350f" }}>
            "独行快，众行远。" 感谢每一位在数字世界里与我相遇的你，期待与更多志同道合的朋友结为友链，共同探索知识的海洋，分享生活的精彩。
          </p>
          <p className="text-xs mt-2" style={{ color: "#d97706" }}>— Krystal</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-20">🌸</div>
      </motion.div>

      {/* Admin Review Panel */}
      {isAdmin && pendingList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 mb-6"
          style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.07)", border: "1.5px solid #fde68a" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#fef3c7" }}>
              <ShieldCheck size={16} style={{ color: "#d97706" }} />
            </div>
            <h3 className="text-sm" style={{ color: "#1c1917", fontWeight: 600 }}>待审核友链</h3>
            <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#fef3c7", color: "#d97706", fontWeight: 500 }}>
              {pendingList.length}
            </span>
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {pendingList.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ background: "#faf8f5", border: "1px solid #f3e8d0" }}
                >
                  <img
                    src={item.logo || `https://api.dicebear.com/7.x/adventurer/svg?seed=${item.id}`}
                    alt={item.name}
                    className="w-10 h-10 rounded-full shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${item.id}`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm truncate" style={{ fontWeight: 600, color: "#1c1917" }}>{item.name}</span>
                      {item.categoryName && (
                        <span className="text-xs px-1.5 py-0.5 rounded-md shrink-0" style={{ background: "#dcfce7", color: "#059669" }}>
                          {item.categoryName}
                        </span>
                      )}
                      <div className="flex items-center gap-1 shrink-0">
                        <Clock size={11} style={{ color: "#a8956b" }} />
                        <span className="text-xs" style={{ color: "#a8956b" }}>{item.createdAt?.slice(0, 10)}</span>
                      </div>
                    </div>
                    <p className="text-xs truncate" style={{ color: "#78716c" }}>{item.description || "暂无简介"}</p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1 mt-0.5 hover:underline"
                      style={{ color: "#059669" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Globe size={10} />
                      {item.url}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={reviewLoading === item.id}
                      onClick={() => handleApprove(item.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white transition-opacity"
                      style={{ background: "#059669", fontWeight: 500, opacity: reviewLoading === item.id ? 0.6 : 1 }}
                    >
                      <CheckCircle size={13} />
                      通过
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={reviewLoading === item.id}
                      onClick={() => handleReject(item.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-opacity"
                      style={{ background: "#fee2e2", color: "#dc2626", fontWeight: 500, opacity: reviewLoading === item.id ? 0.6 : 1 }}
                    >
                      <XCircle size={13} />
                      拒绝
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {isAdmin && (
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.07)", border: "1.5px solid #dcfce7" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm" style={{ color: "#1c1917", fontWeight: 600 }}>友链分类管理</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#dcfce7", color: "#059669", fontWeight: 500 }}>
              每页 20 条
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <input
              value={categoryForm.name}
              onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="分类名称（必填）"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "#fafaf9", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
            />
            <input
              value={categoryForm.description}
              onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="分类描述（可选）"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "#fafaf9", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
            />
            <div className="flex gap-2">
              <input
                value={categoryForm.sortOrder}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                placeholder="排序权重"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "#fafaf9", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
              />
              <button
                onClick={handleCreateCategory}
                disabled={categorySaving}
                className="px-4 py-2 rounded-lg text-sm text-white shrink-0"
                style={{ background: "#059669", opacity: categorySaving ? 0.6 : 1 }}
              >
                新增
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              value={categoryKeyword}
              onChange={(e) => setCategoryKeyword(e.target.value)}
              placeholder="关键词搜索分类名称或描述"
              className="w-full sm:max-w-md px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "#fafaf9", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
            />
            <button
              onClick={() => loadCategoryPage(1, categoryKeyword)}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ background: "#f3f4f6", color: "#44403c", fontWeight: 500 }}
            >
              搜索
            </button>
          </div>

          {categoryLoading ? (
            <p className="text-sm" style={{ color: "#78716c" }}>分类加载中...</p>
          ) : (
            <div className="space-y-2">
              {categoryList.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: "#faf8f5", border: "1px solid #f3e8d0" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: "#1c1917", fontWeight: 600 }}>{category.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: "#ecfeff", color: "#0891b2" }}>
                        排序 {category.sortOrder ?? 0}
                      </span>
                    </div>
                    <p className="text-xs truncate mt-1" style={{ color: "#78716c" }}>{category.description || "暂无描述"}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    disabled={categoryDeleting === category.id}
                    className="px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: "#fee2e2", color: "#dc2626", fontWeight: 500, opacity: categoryDeleting === category.id ? 0.6 : 1 }}
                  >
                    删除
                  </button>
                </div>
              ))}
              {categoryList.length === 0 && (
                <p className="text-sm" style={{ color: "#78716c" }}>暂无分类数据</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              onClick={() => loadCategoryPage(Math.max(1, categoryPage - 1), categoryKeyword)}
              disabled={categoryPage <= 1}
              className="px-3 py-1.5 rounded-lg text-xs"
              style={{ background: "#f5f5f4", color: "#57534e", opacity: categoryPage <= 1 ? 0.5 : 1 }}
            >
              上一页
            </button>
            <span className="text-xs" style={{ color: "#78716c" }}>第 {categoryPage} / {categoryTotalPages} 页</span>
            <button
              onClick={() => loadCategoryPage(Math.min(categoryTotalPages, categoryPage + 1), categoryKeyword)}
              disabled={categoryPage >= categoryTotalPages}
              className="px-3 py-1.5 rounded-lg text-xs"
              style={{ background: "#f5f5f4", color: "#57534e", opacity: categoryPage >= categoryTotalPages ? 0.5 : 1 }}
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#a8956b" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索友链..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
            onFocus={(e) => (e.target.style.borderColor = "#059669")}
            onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categoryNames.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1.5 rounded-full text-sm transition-all"
              style={{
                background: activeCategory === cat ? "#059669" : "white",
                color: activeCategory === cat ? "white" : "#78716c",
                border: activeCategory === cat ? "none" : "1.5px solid #f3e8d0",
                fontWeight: activeCategory === cat ? 500 : 400,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: "#78716c" }}>加载中...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && friendList.length === 0 && (
        <div className="text-center py-12">
          <Globe size={48} className="mx-auto mb-4" style={{ color: "#f3e8d0" }} />
          <p className="text-sm" style={{ color: "#78716c" }}>暂无友链数据</p>
        </div>
      )}

      {/* Active Friends */}
      {!loading && activeFriends.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} style={{ color: "#059669" }} />
            <h2 style={{ color: "#1c1917" }}>活跃友链</h2>
            <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#dcfce7", color: "#059669", fontWeight: 500 }}>
              {activeFriends.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {activeFriends.map((friend, i) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(120,80,20,0.12)" }}
                  className="rounded-2xl p-5 relative group"
                  style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.07)", cursor: "pointer" }}
                  onClick={() => window.open(friend.url, "_blank")}
                >
                  {/* Admin Delete */}
                  {isAdmin && (
                    <div
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="p-1 rounded-lg"
                        style={{ background: "#fee2e2", color: "#dc2626" }}
                        onClick={() => handleDelete(friend.id)}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={friend.logo || `https://api.dicebear.com/7.x/adventurer/svg?seed=${friend.id}`}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${friend.id}`;
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm truncate" style={{ fontWeight: 600, color: "#1c1917" }}>{friend.name}</p>
                      {friend.categoryName && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#dcfce7", color: "#059669" }}>
                          {friend.categoryName}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed mb-3" style={{ color: "#78716c" }}>{friend.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs" style={{ color: "#a8956b" }}>
                      <Globe size={11} />
                      <span className="truncate max-w-24">{friend.url.replace("https://", "").replace("http://", "")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: likedFriends.has(friend.id) ? "#059669" : "#a8956b" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLikedFriends((prev) => {
                            const next = new Set(prev);
                            if (next.has(friend.id)) next.delete(friend.id);
                            else next.add(friend.id);
                            return next;
                          });
                        }}
                      >
                        <Heart size={13} fill={likedFriends.has(friend.id) ? "#059669" : "none"} />
                      </button>
                      <div className="p-1.5 rounded-lg" style={{ color: "#059669", background: "#dcfce7" }}>
                        <ExternalLink size={12} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Inactive Friends */}
      {!loading && inactiveFriends.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={18} style={{ color: "#78716c" }} />
            <h2 style={{ color: "#78716c" }}>暂时失联</h2>
            <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#f5f5f4", color: "#78716c" }}>
              {inactiveFriends.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {inactiveFriends.map((friend) => (
              <div
                key={friend.id}
                className="rounded-2xl p-5 opacity-60"
                style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.04)", border: "1.5px dashed #f3e8d0" }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={friend.logo || `https://api.dicebear.com/7.x/adventurer/svg?seed=${friend.id}`}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full grayscale"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${friend.id}`;
                    }}
                  />
                  <div>
                    <p className="text-sm" style={{ fontWeight: 500, color: "#78716c" }}>{friend.name}</p>
                    <p className="text-xs" style={{ color: "#a8956b" }}>暂时无法访问</p>
                  </div>
                </div>
                <p className="text-xs" style={{ color: "#a8956b" }}>{friend.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Requirements */}
      <div className="rounded-2xl p-6" style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.06)" }}>
        <h3 className="mb-3" style={{ color: "#1c1917" }}>友链申请条件</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            "博客已稳定运营三个月以上",
            "网站内容健康，无违法信息",
            "博客有实质性内容，非空壳",
            "网站有独立域名（不强制）",
            "愿意在对方博客上回链",
            "请先在本站添加友链，再来申请",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: "#059669" }} />
              <p className="text-sm" style={{ color: "#78716c" }}>{item}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white"
          style={{ background: "#059669" }}
        >
          <Send size={14} />
          立即申请
        </button>
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setShowApplyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="p-6 rounded-2xl max-w-sm w-full"
              style={{ background: "white" }}
              onClick={(e) => e.stopPropagation()}
            >
              {submitted ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#dcfce7" }}>
                    <CheckCircle size={32} style={{ color: "#059669" }} />
                  </div>
                  <h3 className="mb-2" style={{ color: "#1c1917" }}>申请已提交！</h3>
                  <p className="text-sm" style={{ color: "#78716c" }}>博主会尽快审核您的友链申请，请耐心等待~</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h3 style={{ color: "#1c1917" }}>申请友情链接</h3>
                    <button onClick={() => setShowApplyModal(false)}>
                      <X size={18} style={{ color: "#78716c" }} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "#78716c" }}>博客名称</label>
                      <input
                        value={applyForm.name}
                        onChange={(e) => setApplyForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="你的博客名称"
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "#faf8f5", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
                        onFocus={(e) => (e.target.style.borderColor = "#059669")}
                        onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "#78716c" }}>博客地址</label>
                      <input
                        value={applyForm.url}
                        onChange={(e) => setApplyForm((prev) => ({ ...prev, url: e.target.value }))}
                        placeholder="https://your-blog.com"
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "#faf8f5", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
                        onFocus={(e) => (e.target.style.borderColor = "#059669")}
                        onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "#78716c" }}>博客分类</label>
                      <select
                        value={applyForm.categoryId ?? ""}
                        onChange={(e) => setApplyForm((prev) => ({ ...prev, categoryId: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "#faf8f5", border: "1.5px solid #f3e8d0", color: "#1c1917" }}
                      >
                        <option value="">请选择分类</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "#78716c" }}>博客简介</label>
                      <textarea
                        value={applyForm.description}
                        onChange={(e) => setApplyForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="简单介绍一下你的博客..."
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                        style={{ background: "#faf8f5", border: "1.5px solid #f3e8d0", color: "#1c1917", minHeight: 80 }}
                        onFocus={(e) => (e.target.style.borderColor = "#059669")}
                        onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleApply}
                    className="w-full mt-4 py-2.5 rounded-xl text-sm text-white"
                    style={{ background: "#059669" }}
                  >
                    提交申请
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
