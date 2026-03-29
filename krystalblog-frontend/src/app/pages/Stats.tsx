import { motion } from "motion/react";
import {
  BarChart3, Eye, Heart, MessageCircle, Music, BookOpen,
  Video, Users, TrendingUp, Globe, Clock, Star, AlertTriangle,
  ArrowUpRight, Activity
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useApp } from "../context/AppContext";
import { statsApi, StatsOverviewVO, MonthlyTrendVO, VideoTrendVO, MusicTrendVO, CategoryDistributionVO, WeeklyVisitVO, SiteInfoVO } from "../services/api";
import { useCallback, useEffect, useState } from "react";

const COLORS = ["#d97706", "#f59e0b", "#0891b2", "#7c3aed", "#059669"];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

function StatOverviewCard({
  icon: Icon, label, value, sub, color, trend
}: {
  icon: any; label: string; value: string; sub: string; color: string; trend?: number;
}) {
  return (
    <motion.div
      {...fadeUp(0.05)}
      whileHover={{ y: -2 }}
      className="p-5 rounded-2xl"
      style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.07)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: color + "20" }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs" style={{ color: trend >= 0 ? "#059669" : "#dc2626" }}>
            <ArrowUpRight size={12} style={{ transform: trend < 0 ? "rotate(90deg)" : "none" }} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl mb-0.5" style={{ fontWeight: 700, color: "#1c1917" }}>{value}</p>
      <p className="text-sm mb-0.5" style={{ color: "#78716c" }}>{label}</p>
      <p className="text-xs" style={{ color: "#a8956b" }}>{sub}</p>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-xl text-xs shadow-lg" style={{ background: "white", border: "1px solid #f3e8d0" }}>
        <p className="mb-1" style={{ color: "#78716c", fontWeight: 500 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Stats() {
  const { isAdmin } = useApp();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [overview, setOverview] = useState<StatsOverviewVO | null>(null);
  const [articleTrend, setArticleTrend] = useState<MonthlyTrendVO[]>([]);
  const [videoTrend, setVideoTrend] = useState<VideoTrendVO[]>([]);
  const [musicTrend, setMusicTrend] = useState<MusicTrendVO[]>([]);
  const [categoryDist, setCategoryDist] = useState<CategoryDistributionVO[]>([]);
  const [weeklyVisits, setWeeklyVisits] = useState<WeeklyVisitVO[]>([]);
  const [siteInfo, setSiteInfo] = useState<SiteInfoVO | null>(null);

  const fetchData = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      setErrors({});

      const results = await Promise.allSettled([
        statsApi.overview(),
        statsApi.articleTrend(6),
        statsApi.videoTrend(6),
        statsApi.musicTrend(6),
        statsApi.musicCategories(),
        statsApi.weeklyVisits(),
        statsApi.siteInfo(),
      ]);

      const [
        overviewRes,
        articleRes,
        videoRes,
        musicRes,
        categoryRes,
        weeklyRes,
        infoRes,
      ] = results;

      if (overviewRes.status === "fulfilled") setOverview(overviewRes.value.data);
      else setErrors((prev) => ({ ...prev, overview: overviewRes.reason?.message || "统计概览获取失败" }));

      if (articleRes.status === "fulfilled") setArticleTrend(articleRes.value.data);
      else setErrors((prev) => ({ ...prev, articleTrend: articleRes.reason?.message || "文章趋势获取失败" }));

      if (videoRes.status === "fulfilled") setVideoTrend(videoRes.value.data);
      else setErrors((prev) => ({ ...prev, videoTrend: videoRes.reason?.message || "视频趋势获取失败" }));

      if (musicRes.status === "fulfilled") setMusicTrend(musicRes.value.data);
      else setErrors((prev) => ({ ...prev, musicTrend: musicRes.reason?.message || "音乐播放数据获取失败" }));

      if (categoryRes.status === "fulfilled") setCategoryDist(categoryRes.value.data);
      else setErrors((prev) => ({ ...prev, musicCategories: categoryRes.reason?.message || "音乐分类获取失败" }));

      if (weeklyRes.status === "fulfilled") setWeeklyVisits(weeklyRes.value.data);
      else setErrors((prev) => ({ ...prev, weeklyVisits: weeklyRes.reason?.message || "本周访问量获取失败" }));

      if (infoRes.status === "fulfilled") setSiteInfo(infoRes.value.data);
      else setErrors((prev) => ({ ...prev, siteInfo: infoRes.reason?.message || "网站信息获取失败" }));
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setErrors((prev) => ({ ...prev, page: (error as any)?.message || "统计数据获取失败" }));
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#fef3c7" }}>
          <AlertTriangle size={36} style={{ color: "#d97706" }} />
        </div>
        <h2 style={{ color: "#1c1917", marginBottom: "0.5rem" }}>无访问权限</h2>
        <p style={{ color: "#78716c", fontSize: "0.9rem" }}>数据统计功能仅限管理员使用</p>
        <p style={{ color: "#a8956b", fontSize: "0.8rem", marginTop: "0.5rem" }}>请在顶部导航栏切换为管理员模式</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: "#78716c" }}>加载统计数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 style={{ color: "#1c1917" }}>数据统计</h1>
        <p style={{ fontSize: "0.85rem", color: "#78716c" }}>网站运营数据一览（2024-10月 至 2025-03月）</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatOverviewCard icon={BookOpen} label="博客总阅读量" value={overview?.totalArticleViews.toLocaleString() || "0"} sub={`本月 ${overview?.monthlyArticleViews.toLocaleString() || "0"} 次`} color="#d97706" trend={overview?.articleViewsTrend} />
        <StatOverviewCard icon={Video} label="视频总播放量" value={overview?.totalVideoPlays.toLocaleString() || "0"} sub={`本月 ${overview?.monthlyVideoPlays.toLocaleString() || "0"} 次`} color="#7c3aed" trend={overview?.videoPlaysTrend} />
        <StatOverviewCard icon={Music} label="音乐总播放量" value={overview?.totalMusicPlays.toLocaleString() || "0"} sub={`本月 ${overview?.monthlyMusicPlays.toLocaleString() || "0"} 次`} color="#0891b2" trend={overview?.musicPlaysTrend} />
        <StatOverviewCard icon={Globe} label="网站总访问量" value={overview?.totalVisits.toLocaleString() || "0"} sub={`本周 ${overview?.weeklyVisits.toLocaleString() || "0"} 次`} color="#059669" trend={overview?.visitsTrend} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatOverviewCard icon={Eye} label="平均文章阅读" value={overview?.averageArticleViews.toLocaleString() || "0"} sub="篇均阅读" color="#d97706" />
        <StatOverviewCard icon={Heart} label="总点赞数" value={overview?.totalLikes.toLocaleString() || "0"} sub="全平台累计" color="#db2777" trend={18.4} />
        <StatOverviewCard icon={MessageCircle} label="总评论数" value={overview?.totalComments.toLocaleString() || "0"} sub="博客+视频" color="#7c3aed" trend={12.1} />
        <StatOverviewCard icon={Users} label="友链数量" value={overview?.totalFriendLinks.toString() || "0"} sub={`活跃 ${overview?.activeFriendLinks || 0} 个`} color="#059669" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Article Stats */}
        <motion.div
          {...fadeUp(0.1)}
          className="rounded-2xl p-5"
          style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} style={{ color: "#d97706" }} />
            <h3 style={{ color: "#1c1917" }}>博客文章数据</h3>
          </div>
          <p className="text-xs mb-4" style={{ color: "#a8956b" }}>月度阅读量、点赞数、评论数趋势</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={articleTrend}>
              <defs>
                <linearGradient id="articleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5ede0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#a8956b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#a8956b" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="views" name="阅读" stroke="#d97706" fill="url(#articleGrad)" strokeWidth={2} dot={{ fill: "#d97706", r: 3 }} />
              <Area type="monotone" dataKey="likes" name="点赞" stroke="#f59e0b" fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={{ fill: "#f59e0b", r: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Video Stats */}
        <motion.div
          {...fadeUp(0.15)}
          className="rounded-2xl p-5"
          style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Video size={16} style={{ color: "#7c3aed" }} />
            <h3 style={{ color: "#1c1917" }}>视频播放数据</h3>
          </div>
          <p className="text-xs mb-4" style={{ color: "#a8956b" }}>月度播放量、点赞数趋势</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={videoTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5ede0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#a8956b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#a8956b" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="plays" name="播放" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="likes" name="点赞" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Music Stats */}
        <motion.div
          {...fadeUp(0.2)}
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Music size={16} style={{ color: "#0891b2" }} />
            <h3 style={{ color: "#1c1917" }}>音乐播放数据</h3>
          </div>
          <p className="text-xs mb-4" style={{ color: "#a8956b" }}>月度播放量趋势</p>
          {errors.musicTrend ? (
            <div className="h-[200px] flex flex-col items-center justify-center text-center gap-3">
              <p className="text-sm" style={{ color: "#dc2626", fontWeight: 600 }}>{errors.musicTrend}</p>
              <button
                onClick={fetchData}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: "#fef3c7", color: "#d97706", fontWeight: 600 }}
              >
                重试
              </button>
            </div>
          ) : musicTrend.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-sm" style={{ color: "#a8956b" }}>暂无数据</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={musicTrend}>
                <defs>
                  <linearGradient id="musicGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5ede0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#a8956b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#a8956b" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="plays" name="播放" stroke="#0891b2" fill="url(#musicGrad)" strokeWidth={2.5} dot={{ fill: "#0891b2", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Music Category Distribution */}
        <motion.div
          {...fadeUp(0.25)}
          className="rounded-2xl p-5"
          style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Star size={16} style={{ color: "#d97706" }} />
            <h3 style={{ color: "#1c1917" }}>音乐分类</h3>
          </div>
          <p className="text-xs mb-3" style={{ color: "#a8956b" }}>播放量分布</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryDist} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>
                {categoryDist.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categoryDist.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span style={{ color: "#78716c" }}>{item.name}</span>
                </div>
                <span style={{ color: "#1c1917", fontWeight: 500 }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Weekly Visits */}
      <motion.div
        {...fadeUp(0.3)}
        className="rounded-2xl p-5 mb-6"
        style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.07)" }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Activity size={16} style={{ color: "#059669" }} />
            <h3 style={{ color: "#1c1917" }}>本周访问量</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#dcfce7", color: "#059669", fontWeight: 500 }}>
            实时数据
          </span>
        </div>
        <p className="text-xs mb-4" style={{ color: "#a8956b" }}>本周每日独立访客数量</p>
        {errors.weeklyVisits ? (
          <div className="h-[180px] flex flex-col items-center justify-center text-center gap-3">
            <p className="text-sm" style={{ color: "#dc2626", fontWeight: 600 }}>{errors.weeklyVisits}</p>
            <button
              onClick={fetchData}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: "#dcfce7", color: "#059669", fontWeight: 600 }}
            >
              重试
            </button>
          </div>
        ) : weeklyVisits.length === 0 ? (
          <div className="h-[180px] flex items-center justify-center">
            <p className="text-sm" style={{ color: "#a8956b" }}>暂无数据</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyVisits}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5ede0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#a8956b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#a8956b" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="visits" name="访问量" fill="#059669" radius={[6, 6, 0, 0]}>
                  {weeklyVisits.map((item, index) => (
                    <Cell key={index} fill={item.day === "周六" ? "#d97706" : "#059669"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs mt-2 text-center" style={{ color: "#a8956b" }}>* 橙色柱为周六，为本周访问量最高的一天</p>
          </>
        )}
      </motion.div>

      {/* Website Info */}
      <motion.div
        {...fadeUp(0.35)}
        className="rounded-2xl p-5"
        style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.07)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} style={{ color: "#d97706" }} />
          <h3 style={{ color: "#1c1917" }}>网站基础信息</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "建站时间", value: siteInfo?.establishedDate || "2024-10-01", icon: Clock, color: "#d97706" },
            { label: "运营天数", value: `${siteInfo?.runningDays || 0} 天`, icon: TrendingUp, color: "#7c3aed" },
            { label: "内容总量", value: `${siteInfo?.totalContent || 0} 项`, icon: BookOpen, color: "#0891b2" },
            { label: "网站评分", value: `${siteInfo?.siteScore || 0} 分`, icon: Star, color: "#059669" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: "#faf8f5" }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: color + "20" }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <p className="text-sm" style={{ fontWeight: 600, color: "#1c1917" }}>{value}</p>
                <p className="text-xs" style={{ color: "#a8956b" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
