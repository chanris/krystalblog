import { useState, useEffect, memo } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import {
  Home, BookOpen, Video, Music, HardDrive, Link2,
  BarChart3, Menu, X, Search, Bell, Settings,
  ChevronRight, Shield, User, LogOut, Sun
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { MusicPlayer } from "./MusicPlayer";

type NavItemProps = { to: string; icon: any; label: string; exact?: boolean };

const NavItem = memo(function NavItem({ to, icon: Icon, label, exact }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${
          isActive
            ? "text-amber-700 bg-amber-50"
            : "text-stone-600 hover:text-amber-700 hover:bg-amber-50/70"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-amber-500"
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            />
          )}
          <Icon size={18} className="shrink-0" />
          <span className="text-sm" style={{ fontWeight: isActive ? 500 : 400 }}>{label}</span>
        </>
      )}
    </NavLink>
  );
});

const navItems = [
  { to: "/", icon: Home, label: "首页", exact: true },
  { to: "/blog", icon: BookOpen, label: "博客文章" },
  { to: "/videos", icon: Video, label: "视频" },
  { to: "/music", icon: Music, label: "音乐" },
  { to: "/friends", icon: Link2, label: "友情链接" },
];

const adminItems = [
  { to: "/drive", icon: HardDrive, label: "网盘" },
  { to: "/stats", icon: BarChart3, label: "数据统计" },
];

// 从 JWT 或 localStorage 获取当前用户信息
function getUserInfo(): { username: string; nickname?: string; role: string; avatar?: string } | null {
  // 优先从 localStorage 缓存的用户信息读取
  const userStr = localStorage.getItem('userInfo');
  if (userStr) {
    try { return JSON.parse(userStr); } catch {}
  }
  // 兜底从 JWT 解析
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { username: payload.username || 'User', role: payload.role };
  } catch {
    return null;
  }
}

export function Layout() {
  const { isAdmin, setIsAdmin, currentSong, sidebarOpen, setSidebarOpen } = useApp();
  const [searchVal, setSearchVal] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{ username: string; nickname?: string; role: string; avatar?: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      setUserInfo(getUserInfo());
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserInfo(null);
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#faf8f5" }}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed lg:relative z-30 h-full flex flex-col"
            style={{
              width: 240,
              minWidth: 240,
              background: "#fffbf5",
              borderRight: "1px solid #f3e8d0",
            }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "#f3e8d0" }}>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
              >
                <span className="text-white text-lg">✦</span>
              </div>
              <div>
                <h1 className="text-base" style={{ fontWeight: 700, color: "#1c1917", letterSpacing: "-0.02em" }}>
                  KrystalBlog
                </h1>
                <p style={{ fontSize: "0.7rem", color: "#a8956b" }}>记录美好生活</p>
              </div>
            </div>

            {/* Navigation */}
            <LayoutGroup>
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                <p style={{ fontSize: "0.65rem", color: "#a8956b", fontWeight: 600, letterSpacing: "0.08em", padding: "0 0.75rem", marginBottom: "0.5rem" }}>
                  主导航
                </p>
                {navItems.map((item) => (
                  <NavItem key={item.to} {...item} />
                ))}

                {isAdmin && (
                  <>
                    <div style={{ height: 1, background: "#f3e8d0", margin: "0.75rem 0.5rem" }} />
                    <p style={{ fontSize: "0.65rem", color: "#a8956b", fontWeight: 600, letterSpacing: "0.08em", padding: "0 0.75rem", marginBottom: "0.5rem" }}>
                      管理员
                    </p>
                    {adminItems.map((item) => (
                      <NavItem key={item.to} {...item} />
                    ))}
                  </>
                )}
              </nav>
            </LayoutGroup>

            {/* User Info */}
            <div className="p-3 border-t" style={{ borderColor: "#f3e8d0" }}>
              {isLoggedIn && userInfo ? (
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {userInfo.avatar ? (
                    <img src={userInfo.avatar} alt={userInfo.nickname || userInfo.username} className="w-8 h-8 rounded-full shrink-0 object-cover" />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
                    >
                      <span className="text-white text-sm font-medium">
                        {(userInfo.nickname || userInfo.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ fontWeight: 500, color: "#1c1917" }}>
                      {userInfo.nickname || userInfo.username}
                    </p>
                    <p style={{ fontSize: "0.7rem", color: "#a8956b" }}>{isAdmin ? "管理员" : "普通用户"}</p>
                  </div>
                  <ChevronRight size={14} style={{ color: "#a8956b" }} />
                </div>
              ) : (
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors"
                  onClick={() => navigate('/login')}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "#f5ede0" }}
                  >
                    <User size={16} style={{ color: "#a8956b" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ fontWeight: 500, color: "#78716c" }}>未登录</p>
                    <p style={{ fontSize: "0.7rem", color: "#a8956b" }}>点击登录</p>
                  </div>
                  <ChevronRight size={14} style={{ color: "#a8956b" }} />
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header
          className="flex items-center gap-4 px-4 py-3 border-b shrink-0"
          style={{ background: "#fffbf5", borderColor: "#f3e8d0", height: 60 }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-amber-50 transition-colors"
            style={{ color: "#78716c" }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#a8956b" }} />
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="搜索文章、视频、音乐..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "#f5ede0",
                border: "1.5px solid transparent",
                color: "#1c1917",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#d97706")}
              onBlur={(e) => (e.target.style.borderColor = "transparent")}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Login/Logout Button */}
            {isLoggedIn ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{ background: "#f5ede0", color: "#78716c", fontWeight: 500 }}
              >
                <LogOut size={13} />
                退出
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{ background: "#d97706", color: "white", fontWeight: 500 }}
              >
                <Shield size={13} />
                登录
              </motion.button>
            )}

            <button className="p-2 rounded-lg hover:bg-amber-50 transition-colors relative" style={{ color: "#78716c" }}>
              <Bell size={18} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: "#d97706" }}
              />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto" style={{ paddingBottom: currentSong ? 80 : 0 }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Persistent Music Player */}
      <AnimatePresence>
        {currentSong && <MusicPlayer />}
      </AnimatePresence>
    </div>
  );
}
