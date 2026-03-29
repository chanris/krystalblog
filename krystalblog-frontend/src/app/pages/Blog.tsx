import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Eye, Heart, MessageCircle, Tag, Folder,
  Calendar, Plus, Edit2, Trash2, Clock, BookOpen, X
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { articleApi, tagApi, categoryApi } from "../services/api";
import ArchiveList from "../components/ArchiveList";

export default function Blog() {
  const { isAdmin } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("全部");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeArchive, setActiveArchive] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: 0,
    coverImage: '',
    excerpt: '',
    tagIds: [] as number[],
    status: 'PUBLISHED'
  });

  useEffect(() => {
    loadArticles();
    loadCategories();
    loadTags();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const res = await articleApi.list({ page: 1, size: 100 });
      setArticles(res.data.records);
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res: any = await categoryApi.list();
      setCategories(res.data || []);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadTags = async () => {
    try {
      const res: any = await tagApi.list();
      setTags(res.data || []);
    } catch (error) {
      console.error('加载标签失败:', error);
    }
  };

  const filtered = articles.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory !== "全部" && p.categoryName !== activeCategory) return false;
    if (activeTag && !p.tags?.some((t: any) => t.name === activeTag)) return false;
    if (activeArchive && !p.publishTime?.startsWith(activeArchive)) return false;
    return true;
  });

  const toggleLike = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await articleApi.like(id);
      setLikedPosts((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const handleCreateArticle = async () => {
    if (!formData.title || !formData.content) {
      alert('请填写标题和内容');
      return;
    }
    try {
      if (editingArticle) {
        await articleApi.update(editingArticle.id, formData);
      } else {
        await articleApi.create(formData);
      }
      setShowCreateModal(false);
      setEditingArticle(null);
      setFormData({ title: '', content: '', categoryId: 0, coverImage: '', excerpt: '', tagIds: [], status: 'PUBLISHED' });
      loadArticles();
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请确保已登录并有管理员权限');
    }
  };

  const handleEdit = (post: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingArticle(post);
    setFormData({
      title: post.title || '',
      content: post.content || '',
      categoryId: post.categoryId || 0,
      coverImage: post.coverImage || '',
      excerpt: post.excerpt || '',
      tagIds: post.tags?.map((t: any) => t.id) || [],
      status: post.status || 'PUBLISHED'
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await articleApi.delete(id);
      setShowDeleteConfirm(null);
      loadArticles();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请确保已登录并有管理员权限');
    }
  };

  // ---- 标签/分类管理 ----
  const [showTagModal, setShowTagModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [tagFormName, setTagFormName] = useState('');
  const [categoryFormName, setCategoryFormName] = useState('');
  const [categoryFormDesc, setCategoryFormDesc] = useState('');

  const openAddTag = () => { setEditingTag(null); setTagFormName(''); setShowTagModal(true); };
  const openEditTag = (tag: any) => { setEditingTag(tag); setTagFormName(tag.name); setShowTagModal(true); };
  const handleSaveTag = async () => {
    if (!tagFormName.trim()) { alert('标签名称不能为空'); return; }
    try {
      if (editingTag) {
        await tagApi.update(editingTag.id, { name: tagFormName.trim() });
      } else {
        await tagApi.create({ name: tagFormName.trim() });
      }
      setShowTagModal(false);
      loadTags();
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请确保已登录并有管理员权限');
    }
  };
  const handleDeleteTag = async (id: number) => {
    if (!confirm('确定删除该标签？')) return;
    try {
      await tagApi.delete(id);
      loadTags();
    } catch (error) {
      console.error('删除标签失败:', error);
      alert('删除失败');
    }
  };

  const openAddCategory = () => { setEditingCategory(null); setCategoryFormName(''); setCategoryFormDesc(''); setShowCategoryModal(true); };
  const openEditCategory = (cat: any) => { setEditingCategory(cat); setCategoryFormName(cat.name); setCategoryFormDesc(cat.description || ''); setShowCategoryModal(true); };
  const handleSaveCategory = async () => {
    if (!categoryFormName.trim()) { alert('分类名称不能为空'); return; }
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, { name: categoryFormName.trim(), description: categoryFormDesc.trim() || undefined });
      } else {
        await categoryApi.create({ name: categoryFormName.trim(), description: categoryFormDesc.trim() || undefined });
      }
      setShowCategoryModal(false);
      loadCategories();
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请确保已登录并有管理员权限');
    }
  };
  const handleDeleteCategory = async (id: number) => {
    if (!confirm('确定删除该分类？')) return;
    try {
      await categoryApi.delete(id);
      loadCategories();
    } catch (error) {
      console.error('删除分类失败:', error);
      alert('删除失败');
    }
  };

  return (
    <div className="flex gap-6 p-6 max-w-7xl mx-auto">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ color: "#1c1917" }}>博客文章</h1>
            <p style={{ fontSize: "0.85rem", color: "#78716c" }}>共 {filtered.length} 篇文章</p>
          </div>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setEditingArticle(null); setFormData({ title: '', content: '', categoryId: 0, coverImage: '', excerpt: '', tagIds: [], status: 'PUBLISHED' }); setShowCreateModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
              style={{ background: "#d97706", fontWeight: 500 }}
            >
              <Plus size={16} />
              写新文章
            </motion.button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#a8956b" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索文章标题或内容..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: "white", border: "1.5px solid #f3e8d0", color: "#1c1917", boxShadow: "0 2px 8px rgba(120,80,20,0.05)" }}
            onFocus={(e) => (e.target.style.borderColor = "#d97706")}
            onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {["全部", ...categories.map((c: any) => c.name)].map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveCategory(cat)}
              className="px-3.5 py-1.5 rounded-full text-sm transition-all"
              style={{
                background: activeCategory === cat ? "#d97706" : "white",
                color: activeCategory === cat ? "white" : "#78716c",
                border: activeCategory === cat ? "none" : "1.5px solid #f3e8d0",
                fontWeight: activeCategory === cat ? 500 : 400,
                boxShadow: activeCategory === cat ? "0 2px 8px rgba(217,119,6,0.3)" : "none",
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Article List */}
        <div className="space-y-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                whileHover={{ y: -2, boxShadow: "0 12px 32px rgba(120,80,20,0.1)" }}
                className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
                style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.06)" }}
                onClick={() => navigate(`/blog/${post.id}`)}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-52 shrink-0 overflow-hidden" style={{ height: 150 }}>
                    <img
                      src={post.coverImage || 'https://via.placeholder.com/400x300'}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs" style={{ background: "#fef3c7", color: "#d97706", fontWeight: 500 }}>
                          {post.categoryName || '未分类'}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: "#a8956b" }}>
                          <Clock size={11} />{post.readTime || '5分钟'}
                        </span>
                      </div>
                      <h3 className="mb-1.5 line-clamp-1" style={{ color: "#1c1917" }}>{post.title}</h3>
                      <p className="text-sm line-clamp-2" style={{ color: "#78716c" }}>{post.summary || ''}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-xs" style={{ color: "#a8956b" }}>
                        <span className="flex items-center gap-1"><Eye size={12} />{post.views || 0}</span>
                        <button
                          className="flex items-center gap-1 transition-colors"
                          style={{ color: likedPosts.has(post.id) ? "#d97706" : "#a8956b" }}
                          onClick={(e) => toggleLike(post.id, e)}
                        >
                          <Heart size={12} fill={likedPosts.has(post.id) ? "#d97706" : "none"} />
                          {(post.likesCount || 0) + (likedPosts.has(post.id) ? 1 : 0)}
                        </button>
                        <span className="flex items-center gap-1"><MessageCircle size={12} />{post.commentsCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs" style={{ color: "#a8956b" }}>
                          <Calendar size={11} />{post.publishTime?.split('T')[0] || ''}
                        </span>
                        {isAdmin && (
                          <div className="flex items-center gap-1.5 ml-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                              style={{ color: "#d97706" }}
                              onClick={(e) => handleEdit(post, e)}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              style={{ color: "#dc2626" }}
                              onClick={() => setShowDeleteConfirm(post.id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-16" style={{ color: "#a8956b" }}>
              <BookOpen size={40} className="mx-auto mb-3 opacity-40" style={{ color: "#d97706" }} />
              <p>没有找到相关文章</p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-64 shrink-0 hidden lg:block">
        {/* Tags */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.06)" }}
        >
          <h3 className="flex items-center gap-2 mb-3" style={{ color: "#1c1917" }}>
            <Tag size={16} style={{ color: "#d97706" }} />
            标签云
            {isAdmin && (
              <button onClick={openAddTag} className="ml-auto p-1 rounded-lg hover:bg-amber-50 transition-colors" style={{ color: "#d97706" }} title="新增标签">
                <Plus size={14} />
              </button>
            )}
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? tags.map((tag: any, i: number) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative group flex items-center"
              >
                <button
                  onClick={() => setActiveTag(activeTag === tag.name ? null : tag.name)}
                  className="px-2.5 py-1 rounded-lg text-xs transition-colors"
                  style={{
                    background: activeTag === tag.name ? "#d97706" : "#fef3c7",
                    color: activeTag === tag.name ? "white" : "#d97706",
                    fontWeight: 500,
                    boxShadow: activeTag === tag.name ? "0 2px 8px rgba(217,119,6,0.3)" : "none",
                  }}
                >
                  #{tag.name}
                </button>
                {isAdmin && (
                  <div className="hidden group-hover:flex items-center gap-0.5 ml-0.5">
                    <motion.button whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.85 }} onClick={() => openEditTag(tag)} className="p-0.5 rounded hover:bg-amber-50" style={{ color: "#d97706" }} title="编辑">
                      <Edit2 size={10} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.85 }} onClick={() => handleDeleteTag(tag.id)} className="p-0.5 rounded hover:bg-red-50" style={{ color: "#dc2626" }} title="删除">
                      <X size={10} />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )) : (
              <span className="text-xs" style={{ color: "#a8956b" }}>暂无标签</span>
            )}
          </div>
        </div>

        {/* Categories */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.06)" }}
        >
          <h3 className="flex items-center gap-2 mb-3" style={{ color: "#1c1917" }}>
            <Folder size={16} style={{ color: "#d97706" }} />
            分类
            {isAdmin && (
              <button onClick={openAddCategory} className="ml-auto p-1 rounded-lg hover:bg-amber-50 transition-colors" style={{ color: "#d97706" }} title="新增分类">
                <Plus size={14} />
              </button>
            )}
          </h3>
          <div className="space-y-1">
            {categories.length > 0 ? categories.map((cat: any, i: number) => {
              const count = articles.filter((p) => p.categoryName === cat.name).length;
              const isActive = activeCategory === cat.name;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  whileHover={{ x: 4 }}
                  className="group flex items-center rounded-lg"
                >
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveCategory(cat.name === activeCategory ? "全部" : cat.name)}
                    className="flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{
                      background: isActive ? "#fef3c7" : "transparent",
                      color: isActive ? "#d97706" : "#78716c",
                    }}
                  >
                    <span>{cat.name}</span>
                    <motion.span
                      className="px-1.5 py-0.5 rounded text-xs"
                      style={{ background: isActive ? "#d97706" : "#f5ede0", color: isActive ? "white" : "#a8956b" }}
                      whileHover={{ scale: 1.15 }}
                    >
                      {count}
                    </motion.span>
                  </motion.button>
                  {isAdmin && (
                    <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 ml-1">
                      <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => openEditCategory(cat)} className="p-1 rounded hover:bg-amber-50" style={{ color: "#d97706" }} title="编辑">
                        <Edit2 size={11} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteCategory(cat.id)} className="p-1 rounded hover:bg-red-50" style={{ color: "#dc2626" }} title="删除">
                        <X size={11} />
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              );
            }) : (
              <span className="text-xs px-3" style={{ color: "#a8956b" }}>暂无分类</span>
            )}
          </div>
        </div>

        {/* Archives */}
        <ArchiveList activeArchive={activeArchive} onArchiveChange={setActiveArchive} />
      </aside>

      {/* Create Article Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="p-6 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              style={{ background: "white" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4" style={{ color: "#1c1917" }}>{editingArticle ? '编辑文章' : '创建新文章'}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#78716c" }}>标题 *</label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl text-sm outline-none"
                    style={{ border: "1.5px solid #f3e8d0" }}
                    placeholder="请输入文章标题"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: "#78716c" }}>摘要</label>
                  <input
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl text-sm outline-none"
                    style={{ border: "1.5px solid #f3e8d0" }}
                    placeholder="文章摘要（可选）"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: "#78716c" }}>内容 *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl text-sm outline-none"
                    style={{ border: "1.5px solid #f3e8d0", minHeight: "200px" }}
                    placeholder="请输入文章内容"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: "#78716c" }}>封面图片URL</label>
                  <input
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl text-sm outline-none"
                    style={{ border: "1.5px solid #f3e8d0" }}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: "#78716c" }}>分类 *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl text-sm outline-none"
                    style={{ border: "1.5px solid #f3e8d0", background: "white" }}
                  >
                    <option value={0} disabled>请选择分类</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: "#78716c" }}>标签</label>
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl" style={{ border: "1.5px solid #f3e8d0", minHeight: "42px" }}>
                    {tags.length > 0 ? tags.map((tag: any) => {
                      const isSelected = formData.tagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            const newTagIds = isSelected
                              ? formData.tagIds.filter((id) => id !== tag.id)
                              : [...formData.tagIds, tag.id];
                            setFormData({ ...formData, tagIds: newTagIds });
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs transition-all"
                          style={{
                            background: isSelected ? "#d97706" : "#fef3c7",
                            color: isSelected ? "white" : "#d97706",
                            fontWeight: 500,
                          }}
                        >
                          #{tag.name}
                        </button>
                      );
                    }) : (
                      <span className="text-xs" style={{ color: "#a8956b" }}>暂无可选标签</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 py-2 rounded-xl text-sm"
                    style={{ background: "#f5ede0", color: "#78716c" }}
                    onClick={() => setShowCreateModal(false)}
                  >
                    取消
                  </button>
                  <button
                    className="flex-1 py-2 rounded-xl text-sm text-white"
                    style={{ background: "#d97706" }}
                    onClick={handleCreateArticle}
                  >
                    {editingArticle ? '保存修改' : '发布文章'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Dialog */}
      <AnimatePresence>
        {showDeleteConfirm !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="p-6 rounded-2xl max-w-sm w-full"
              style={{ background: "white" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-2" style={{ color: "#1c1917" }}>确认删除</h3>
              <p className="text-sm mb-5" style={{ color: "#78716c" }}>删除后无法恢复，确认要删除这篇文章吗？</p>
              <div className="flex gap-3">
                <button
                  className="flex-1 py-2 rounded-xl text-sm"
                  style={{ background: "#f5ede0", color: "#78716c" }}
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  取消
                </button>
                <button
                  className="flex-1 py-2 rounded-xl text-sm text-white"
                  style={{ background: "#dc2626" }}
                  onClick={() => handleDelete(showDeleteConfirm!)}
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tag Management Modal */}
      <AnimatePresence>
        {showTagModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setShowTagModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="p-6 rounded-2xl max-w-sm w-full"
              style={{ background: "white" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4" style={{ color: "#1c1917" }}>{editingTag ? '编辑标签' : '新增标签'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#78716c" }}>标签名称 *</label>
                  <input
                    value={tagFormName}
                    onChange={(e) => setTagFormName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl text-sm outline-none"
                    style={{ border: "1.5px solid #f3e8d0" }}
                    placeholder="例如：React、Vue、TypeScript"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTag()}
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    className="flex-1 py-2 rounded-xl text-sm"
                    style={{ background: "#f5ede0", color: "#78716c" }}
                    onClick={() => setShowTagModal(false)}
                  >
                    取消
                  </button>
                  <button
                    className="flex-1 py-2 rounded-xl text-sm text-white"
                    style={{ background: "#d97706" }}
                    onClick={handleSaveTag}
                  >
                    {editingTag ? '保存' : '创建'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Management Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="p-6 rounded-2xl max-w-sm w-full"
              style={{ background: "white" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4" style={{ color: "#1c1917" }}>{editingCategory ? '编辑分类' : '新增分类'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#78716c" }}>分类名称 *</label>
                  <input
                    value={categoryFormName}
                    onChange={(e) => setCategoryFormName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl text-sm outline-none"
                    style={{ border: "1.5px solid #f3e8d0" }}
                    placeholder="例如：技术、生活、旅行"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#78716c" }}>描述</label>
                  <input
                    value={categoryFormDesc}
                    onChange={(e) => setCategoryFormDesc(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl text-sm outline-none"
                    style={{ border: "1.5px solid #f3e8d0" }}
                    placeholder="分类描述（可选）"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveCategory()}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    className="flex-1 py-2 rounded-xl text-sm"
                    style={{ background: "#f5ede0", color: "#78716c" }}
                    onClick={() => setShowCategoryModal(false)}
                  >
                    取消
                  </button>
                  <button
                    className="flex-1 py-2 rounded-xl text-sm text-white"
                    style={{ background: "#d97706" }}
                    onClick={handleSaveCategory}
                  >
                    {editingCategory ? '保存' : '创建'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}