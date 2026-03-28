import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  BookOpen, Video, Music, Eye, Heart, MessageCircle,
  Play, ArrowRight, TrendingUp, Users
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { articleApi, videoApi, musicApi, statsApi } from "../services/api";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: "easeOut" },
});

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <motion.div
      {...fadeUp(0.1)}
      whileHover={{ y: -2 }}
      className="flex items-center gap-4 p-4 rounded-2xl"
      style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.07)" }}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: color + "20" }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl" style={{ fontWeight: 700, color: "#1c1917" }}>{value}</p>
        <p style={{ fontSize: "0.8rem", color: "#78716c" }}>{label}</p>
      </div>
    </motion.div>
  );
}

function BlogCard({ post, onClick }: { post: any; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(120,80,20,0.12)" }}
      className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
      style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.07)" }}
      onClick={onClick}
    >
      <div className="relative overflow-hidden" style={{ height: 160 }}>
        <img src={post.coverImage || 'https://via.placeholder.com/400x300'} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs text-white" style={{ background: "#d97706", fontWeight: 500 }}>
            {post.categoryName || '未分类'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="mb-1 line-clamp-2" style={{ color: "#1c1917" }}>{post.title}</h3>
        <p className="text-sm line-clamp-2 mb-3" style={{ color: "#78716c" }}>{post.summary || ''}</p>
        <div className="flex items-center gap-3 text-xs" style={{ color: "#a8956b" }}>
          <span className="flex items-center gap-1"><Eye size={12} />{post.views || 0}</span>
          <span className="flex items-center gap-1"><Heart size={12} />{post.likes || 0}</span>
          <span className="flex items-center gap-1"><MessageCircle size={12} />{post.commentCount || 0}</span>
        </div>
      </div>
    </motion.div>
  );
}

function VideoCard({ video, onClick }: { video: any; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(120,80,20,0.12)" }}
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.07)" }}
      onClick={onClick}
    >
      <div className="relative overflow-hidden" style={{ height: 140 }}>
        <img src={video.thumbnail || 'https://via.placeholder.com/640x360'} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(217,119,6,0.9)" }}>
            <Play size={16} className="text-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-sm line-clamp-2 mb-1" style={{ color: "#1c1917", fontWeight: 500 }}>{video.title}</h4>
        <div className="flex items-center gap-3 text-xs" style={{ color: "#a8956b" }}>
          <span className="flex items-center gap-1"><Eye size={11} />{video.views || 0}</span>
          <span className="flex items-center gap-1"><Heart size={11} />{video.likes || 0}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { setCurrentSong } = useApp();
  const [articles, setArticles] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [music, setMusic] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [articlesRes, videosRes, musicRes, statsRes] = await Promise.all([
        articleApi.list({ page: 1, size: 3 }),
        videoApi.list({ page: 1, size: 3 }),
        musicApi.list({ page: 1, size: 4 }),
        statsApi.site()
      ]);
      setArticles(articlesRes.data.records);
      setVideos(videosRes.data.records);
      setMusic(musicRes.data.records);
      setStats(statsRes.data);
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const normalizeSong = (song: any) => ({
    ...song,
    artist: song.artistName || song.artist || "未知歌手",
    album: song.albumTitle || song.album || "-",
    durationSec: song.durationSec || song.duration || 0,
  });

  const formatDuration = (duration: number | string) => {
    if (typeof duration === "string") return duration;
    if (!duration || duration <= 0) return "00:00";
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div
        {...fadeUp(0)}
        className="relative rounded-3xl overflow-hidden mb-8"
        style={{ height: 320 }}
      >
        <img
          src="https://images.unsplash.com/photo-1646054791640-62e00f540457?w=1080"
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(28,20,12,0.75) 0%, rgba(120,80,20,0.4) 60%, transparent 100%)" }}
        />
        <div className="absolute inset-0 flex flex-col justify-center px-10">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-amber-300 text-sm mb-2"
            style={{ fontWeight: 500, letterSpacing: "0.1em" }}
          >
            ✦ 欢迎来到
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white mb-3"
            style={{ fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2 }}
          >
            KrystalBlog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/75 mb-6 max-w-md"
            style={{ fontSize: "1rem" }}
          >
            记录技术与生活的美好瞬间，分享旅行、音乐与思考的点滴。
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3"
          >
            <button
              onClick={() => navigate("/blog")}
              className="px-5 py-2.5 rounded-xl text-sm transition-all"
              style={{ background: "#d97706", color: "white", fontWeight: 500 }}
            >
              阅读博客
            </button>
            <button
              onClick={() => navigate("/music")}
              className="px-5 py-2.5 rounded-xl text-sm transition-all"
              style={{ background: "rgba(255,255,255,0.15)", color: "white", backdropFilter: "blur(8px)", fontWeight: 500, border: "1px solid rgba(255,255,255,0.3)" }}
            >
              <Music size={14} className="inline mr-1.5" />
              听音乐
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={BookOpen} label="篇博客文章" value={String(stats?.totalArticles || 0)} color="#d97706" />
        <StatCard icon={Video} label="个视频" value={String(stats?.totalVideos || 0)} color="#7c3aed" />
        <StatCard icon={Music} label="首音乐" value={String(stats?.totalMusic || 0)} color="#0891b2" />
        <StatCard icon={Users} label="位用户" value={String(stats?.totalUsers || 0)} color="#059669" />
      </motion.div>

      {/* Recent Blog Posts */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full" style={{ background: "#d97706" }} />
            <h2 style={{ color: "#1c1917" }}>最新文章</h2>
          </div>
          <button
            onClick={() => navigate("/blog")}
            className="flex items-center gap-1 text-sm transition-colors hover:opacity-80"
            style={{ color: "#d97706" }}
          >
            查看全部 <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {articles.slice(0, 3).map((post, i) => (
            <motion.div key={post.id} {...fadeUp(0.1 + i * 0.05)}>
              <BlogCard post={post} onClick={() => navigate(`/blog/${post.id}`)} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Videos */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full" style={{ background: "#7c3aed" }} />
            <h2 style={{ color: "#1c1917" }}>最新视频</h2>
          </div>
          <button
            onClick={() => navigate("/videos")}
            className="flex items-center gap-1 text-sm transition-colors hover:opacity-80"
            style={{ color: "#7c3aed" }}
          >
            查看全部 <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {videos.slice(0, 3).map((video, i) => (
            <motion.div key={video.id} {...fadeUp(0.1 + i * 0.05)}>
              <VideoCard video={video} onClick={() => navigate("/videos")} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Music */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full" style={{ background: "#0891b2" }} />
            <h2 style={{ color: "#1c1917" }}>最新音乐</h2>
          </div>
          <button
            onClick={() => navigate("/music")}
            className="flex items-center gap-1 text-sm transition-colors hover:opacity-80"
            style={{ color: "#0891b2" }}
          >
            查看全部 <ArrowRight size={14} />
          </button>
        </div>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.07)" }}
        >
          {music.slice(0, 4).map((song, i) => (
            <motion.div
              key={song.id}
              {...fadeUp(0.1 + i * 0.04)}
              className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-amber-50 transition-colors"
              style={{ borderBottom: i < 3 ? "1px solid #f5ede0" : "none" }}
              onClick={() => setCurrentSong(normalizeSong(song), music.map(normalizeSong))}
            >
              <span className="text-sm w-5 text-center" style={{ color: "#a8956b" }}>{i + 1}</span>
              {song.cover ? (
                <img src={song.cover} alt={song.title} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#fef3c7" }}>
                  <Music size={16} style={{ color: "#d97706" }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ fontWeight: 500, color: "#1c1917" }}>{song.title}</p>
                <p className="text-xs truncate" style={{ color: "#78716c" }}>
                  {song.artistName || song.artist || "未知歌手"} · {song.albumTitle || song.album || "-"}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs" style={{ color: "#a8956b" }}>
                <span className="hidden sm:flex items-center gap-1">
                  <TrendingUp size={11} />{((song.plays || 0) / 1000).toFixed(1)}k
                </span>
                <span>{formatDuration(song.duration || song.durationSec || 0)}</span>
                <button
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{ background: "#f5ede0" }}
                >
                  <Play size={12} style={{ color: "#d97706", marginLeft: 1 }} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
