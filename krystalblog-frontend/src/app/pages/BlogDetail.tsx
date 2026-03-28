import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Eye, Heart, MessageCircle, Tag,
  Calendar, Clock, Share2, Bookmark, Send, User,
  LogIn, Trash2, Reply, ChevronDown, ChevronUp
} from "lucide-react";
import { articleApi } from "../services/api";

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let i = 0;
  let codeBlock = false;
  let codeLines: string[] = [];

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (!codeBlock) {
        codeBlock = true;
        codeLines = [];
      } else {
        codeBlock = false;
        elements.push(
          <pre key={i} className="rounded-xl p-4 overflow-x-auto my-4 text-sm" style={{ background: "#1c1410", color: "#fef3c7", lineHeight: 1.6 }}>
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
      }
    } else if (codeBlock) {
      codeLines.push(line);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="mb-4 mt-6" style={{ color: "#1c1917", fontSize: "1.8rem", fontWeight: 700, lineHeight: 1.3 }}>{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="mb-3 mt-6 pb-2" style={{ color: "#1c1917", fontSize: "1.3rem", fontWeight: 600, borderBottom: "2px solid #fef3c7" }}>
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="mb-2 mt-4" style={{ color: "#1c1917", fontSize: "1.1rem", fontWeight: 600 }}>{line.slice(4)}</h3>);
    } else if (line.match(/^\d+\. /)) {
      elements.push(<p key={i} className="my-1 pl-4 text-sm" style={{ color: "#44403c" }}>• {line.replace(/^\d+\. /, "")}</p>);
    } else if (line.startsWith("- ")) {
      elements.push(<p key={i} className="my-1 pl-4 text-sm" style={{ color: "#44403c" }}>• {line.slice(2)}</p>);
    } else if (line.match(/`[^`]+`/)) {
      const parts = line.split(/(`[^`]+`)/);
      elements.push(
        <p key={i} className="my-2 leading-7 text-sm" style={{ color: "#44403c" }}>
          {parts.map((part, j) =>
            part.startsWith("`") && part.endsWith("`")
              ? <code key={j} className="px-1.5 py-0.5 rounded" style={{ background: "#fef3c7", color: "#d97706", fontSize: "0.85em" }}>{part.slice(1, -1)}</code>
              : part
          )}
        </p>
      );
    } else if (line.trim()) {
      elements.push(<p key={i} className="my-2 leading-7 text-sm" style={{ color: "#44403c" }}>{line}</p>);
    } else {
      elements.push(<br key={i} />);
    }
    i++;
  }
  return elements;
}

// 判断用户是否已登录
function isLoggedIn(): boolean {
  return !!localStorage.getItem('token');
}

// 从 JWT 解析当前用户信息
function getCurrentUser(): { username: string; role: string; nickname?: string } | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { username: payload.sub || payload.username, role: payload.role, nickname: payload.nickname };
  } catch {
    return null;
  }
}

// 格式化评论时间
function formatCommentTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}小时前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}天前`;
  return date.toLocaleDateString('zh-CN');
}

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comment, setComment] = useState("");
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 评论相关状态
  const [comments, setComments] = useState<any[]>([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null); // 正在回复的评论
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (id) {
      loadArticle(Number(id));
      loadComments(Number(id));
    }
  }, [id]);

  const loadArticle = async (articleId: number) => {
    try {
      const res: any = await articleApi.detail(articleId);
      setPost(res.data);
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (articleId: number) => {
    try {
      setCommentsLoading(true);
      const res: any = await articleApi.getComments(articleId, { page: 1, size: 50 });
      setComments(res.data?.records || []);
      setCommentsTotal(res.data?.total || 0);
    } catch (error) {
      console.error('加载评论失败:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) return;
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    try {
      setSubmitting(true);
      await articleApi.createComment(Number(id), {
        content: comment.trim(),
        parentId: replyTo?.id || undefined,
      });
      setComment("");
      setReplyTo(null);
      // 重新加载评论
      loadComments(Number(id));
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        navigate('/login');
      } else {
        console.error('发表评论失败:', error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('确定删除这条评论吗？')) return;
    try {
      await articleApi.deleteComment(commentId);
      loadComments(Number(id));
    } catch (error) {
      console.error('删除评论失败:', error);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    try {
      if (liked) {
        await articleApi.unlike(post.id);
        setLiked(false);
        setPost({ ...post, likesCount: Math.max((post.likesCount || 0) - 1, 0) });
      } else {
        await articleApi.like(post.id);
        setLiked(true);
        setPost({ ...post, likesCount: (post.likesCount || 0) + 1 });
      }
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        navigate('/login');
      } else {
        console.error('点赞操作失败:', error);
      }
    }
  };

  const toggleReplies = (commentId: number) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  if (loading) return <div className="p-6">加载中...</div>;

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20" style={{ color: "#78716c" }}>
        <p className="text-lg mb-4">文章不存在</p>
        <button onClick={() => navigate("/blog")} className="px-4 py-2 rounded-xl text-sm" style={{ background: "#d97706", color: "white" }}>
          返回博客
        </button>
      </div>
    );
  }

  const related: any[] = [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/blog")}
        className="flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-70"
        style={{ color: "#d97706" }}
      >
        <ArrowLeft size={16} />
        返回博客列表
      </motion.button>

      <div className="flex gap-8">
        {/* Article */}
        <article className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl overflow-hidden mb-6"
            style={{ background: "white", boxShadow: "0 4px 24px rgba(120,80,20,0.08)" }}
          >
            {/* Cover */}
            <div className="relative overflow-hidden" style={{ height: 300 }}>
              <img src={post.coverImage || 'https://via.placeholder.com/1200x400'} alt={post.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,20,12,0.6) 0%, transparent 60%)" }} />
              <div className="absolute bottom-6 left-8 right-8">
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs text-white" style={{ background: "#d97706", fontWeight: 500 }}>{post.categoryName || '未分类'}</span>
                  {(post.tags || []).map((tag: any) => (
                    <span key={tag.id || tag.name} className="px-2.5 py-1 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.15)", color: "white", backdropFilter: "blur(4px)" }}>
                      #{tag.name || tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-white mb-2" style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.3 }}>{post.title}</h1>
                <div className="flex items-center gap-4 text-white/70 text-xs">
                  <span className="flex items-center gap-1"><User size={12} />{post.authorName || '作者'}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} />{post.publishTime?.split('T')[0] || ''}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{post.readTime || '5分钟'}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {renderContent(post.content || '')}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-8 py-5 border-t" style={{ borderColor: "#f5ede0" }}>
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLike}
                  className="flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm"
                  style={{
                    background: liked ? "#fef3c7" : "#f5ede0",
                    color: liked ? "#d97706" : "#78716c",
                    fontWeight: liked ? 500 : 400,
                  }}
                >
                  <Heart size={15} fill={liked ? "#d97706" : "none"} style={{ color: liked ? "#d97706" : "#78716c" }} />
                  {post.likesCount || 0} 点赞
                </motion.button>
                <div className="flex items-center gap-1 text-sm" style={{ color: "#a8956b" }}>
                  <Eye size={14} />{post.views || 0} 阅读
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setBookmarked(!bookmarked)}
                  className="p-2 rounded-xl transition-all"
                  style={{ background: bookmarked ? "#fef3c7" : "#f5ede0", color: bookmarked ? "#d97706" : "#78716c" }}
                >
                  <Bookmark size={16} fill={bookmarked ? "#d97706" : "none"} />
                </motion.button>
                <button className="p-2 rounded-xl transition-all hover:bg-amber-50" style={{ color: "#78716c" }}>
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Comments */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-6"
            style={{ background: "white", boxShadow: "0 4px 24px rgba(120,80,20,0.06)" }}
          >
            <h3 className="flex items-center gap-2 mb-5" style={{ color: "#1c1917" }}>
              <MessageCircle size={18} style={{ color: "#d97706" }} />
              评论 ({commentsTotal})
            </h3>

            {/* Comment Input */}
            {isLoggedIn() ? (
              <div className="flex gap-3 mb-6">
                <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}>
                  <span className="text-white text-sm font-medium">
                    {(getCurrentUser()?.nickname || getCurrentUser()?.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  {/* Reply indicator */}
                  <AnimatePresence>
                    {replyTo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg text-xs"
                        style={{ background: "#fef3c7", color: "#92400e" }}
                      >
                        <Reply size={12} />
                        回复 <span style={{ fontWeight: 500 }}>{replyTo.authorName || '匿名用户'}</span>
                        <button
                          onClick={() => setReplyTo(null)}
                          className="ml-auto hover:opacity-70"
                          style={{ color: "#92400e" }}
                        >
                          ✕
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={replyTo ? `回复 ${replyTo.authorName || '匿名用户'}...` : "写下你的评论..."}
                    className="w-full p-3 rounded-xl text-sm outline-none resize-none transition-colors"
                    style={{ background: "#faf8f5", border: "1.5px solid #f3e8d0", color: "#1c1917", minHeight: 80 }}
                    onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                    onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
                  />
                  <div className="flex justify-end mt-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmitComment}
                      disabled={submitting || !comment.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-white disabled:opacity-50 transition-opacity"
                      style={{ background: "#d97706" }}
                    >
                      <Send size={13} />
                      {submitting ? '发送中...' : '发表评论'}
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center justify-center gap-2 mb-6 py-4 rounded-xl cursor-pointer transition-colors hover:opacity-80"
                style={{ background: "#faf8f5", border: "1.5px dashed #f3e8d0", color: "#78716c" }}
                onClick={() => navigate('/login')}
              >
                <LogIn size={16} style={{ color: "#d97706" }} />
                <span className="text-sm">登录后参与评论</span>
              </div>
            )}

            {/* Comment List */}
            {commentsLoading ? (
              <div className="text-center py-8 text-sm" style={{ color: "#a8956b" }}>加载评论中...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-sm" style={{ color: "#a8956b" }}>
                暂无评论，快来发表第一条评论吧
              </div>
            ) : (
              <div className="space-y-5">
                {comments.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <div className="flex gap-3">
                      {/* Avatar */}
                      {c.authorAvatar ? (
                        <img src={c.authorAvatar} alt={c.authorName} className="w-9 h-9 rounded-full shrink-0 object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #a8956b, #78716c)" }}>
                          <span className="text-white text-sm font-medium">
                            {(c.authorName || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm" style={{ fontWeight: 500, color: "#1c1917" }}>{c.authorName || '匿名用户'}</span>
                          <span className="text-xs" style={{ color: "#a8956b" }}>{formatCommentTime(c.createdAt)}</span>
                        </div>
                        <p className="text-sm leading-relaxed mb-2" style={{ color: "#44403c" }}>{c.content}</p>
                        <div className="flex items-center gap-3">
                          {isLoggedIn() && (
                            <button
                              onClick={() => { setReplyTo(c); }}
                              className="flex items-center gap-1 text-xs transition-colors hover:opacity-70"
                              style={{ color: "#a8956b" }}
                            >
                              <Reply size={11} />
                              回复
                            </button>
                          )}
                          {/* Delete button - show for own comments or admin */}
                          {isLoggedIn() && (getCurrentUser()?.role === 'ADMIN' || getCurrentUser()?.username === c.authorName) && (
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="flex items-center gap-1 text-xs transition-colors opacity-0 group-hover:opacity-100 hover:!opacity-70"
                              style={{ color: "#dc2626" }}
                            >
                              <Trash2 size={11} />
                              删除
                            </button>
                          )}
                        </div>

                        {/* Replies */}
                        {c.replies && c.replies.length > 0 && (
                          <div className="mt-3">
                            <button
                              onClick={() => toggleReplies(c.id)}
                              className="flex items-center gap-1 text-xs mb-2 transition-colors hover:opacity-70"
                              style={{ color: "#d97706" }}
                            >
                              {expandedReplies.has(c.id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              {c.replies.length} 条回复
                            </button>
                            <AnimatePresence>
                              {expandedReplies.has(c.id) && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden space-y-3 pl-3"
                                  style={{ borderLeft: "2px solid #fef3c7" }}
                                >
                                  {c.replies.map((reply: any) => (
                                    <div key={reply.id} className="flex gap-2.5 group/reply">
                                      {reply.authorAvatar ? (
                                        <img src={reply.authorAvatar} alt={reply.authorName} className="w-7 h-7 rounded-full shrink-0 object-cover" />
                                      ) : (
                                        <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #a8956b, #78716c)" }}>
                                          <span className="text-white text-xs font-medium">
                                            {(reply.authorName || 'U').charAt(0).toUpperCase()}
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <span className="text-xs" style={{ fontWeight: 500, color: "#1c1917" }}>{reply.authorName || '匿名用户'}</span>
                                          <span className="text-xs" style={{ color: "#a8956b" }}>{formatCommentTime(reply.createdAt)}</span>
                                        </div>
                                        <p className="text-xs leading-relaxed" style={{ color: "#44403c" }}>{reply.content}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                          {isLoggedIn() && (
                                            <button
                                              onClick={() => setReplyTo(reply)}
                                              className="flex items-center gap-1 text-xs transition-colors hover:opacity-70"
                                              style={{ color: "#a8956b", fontSize: "0.7rem" }}
                                            >
                                              <Reply size={10} />
                                              回复
                                            </button>
                                          )}
                                          {isLoggedIn() && (getCurrentUser()?.role === 'ADMIN' || getCurrentUser()?.username === reply.authorName) && (
                                            <button
                                              onClick={() => handleDeleteComment(reply.id)}
                                              className="flex items-center gap-1 text-xs transition-colors opacity-0 group-hover/reply:opacity-100 hover:!opacity-70"
                                              style={{ color: "#dc2626", fontSize: "0.7rem" }}
                                            >
                                              <Trash2 size={10} />
                                              删除
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </article>

        {/* Right Sidebar */}
        <aside className="w-64 shrink-0 hidden xl:block space-y-4">
          {/* Tags */}
          <div className="rounded-2xl p-5 sticky top-4" style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.06)" }}>
            <h4 className="flex items-center gap-2 mb-3" style={{ color: "#1c1917" }}>
              <Tag size={15} style={{ color: "#d97706" }} />
              文章标签
            </h4>
            <div className="flex flex-wrap gap-2">
              {(post.tags || []).map((tag: any) => (
                <span key={tag.id || tag} className="px-2.5 py-1 rounded-lg text-xs" style={{ background: "#fef3c7", color: "#d97706", fontWeight: 500 }}>
                  #{tag.name || tag}
                </span>
              ))}
            </div>

            <div className="mt-4 pt-4" style={{ borderTop: "1px solid #f5ede0" }}>
              <h4 style={{ color: "#1c1917", marginBottom: "0.75rem", fontSize: "0.9rem", fontWeight: 500 }}>相关文章</h4>
              <div className="space-y-3">
                {related.map((r) => (
                  <div
                    key={r.id}
                    className="flex gap-2.5 cursor-pointer group"
                    onClick={() => navigate(`/blog/${r.id}`)}
                  >
                    <img src={r.cover} alt={r.title} className="w-14 h-12 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs line-clamp-2 group-hover:text-amber-700 transition-colors" style={{ color: "#44403c", fontWeight: 500 }}>
                        {r.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#a8956b" }}>{r.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
