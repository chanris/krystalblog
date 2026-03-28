import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: "spring" }}
      >
        <div className="text-8xl mb-6">🌿</div>
        <h1 className="mb-2" style={{ fontSize: "4rem", fontWeight: 800, color: "#d97706" }}>404</h1>
        <h2 className="mb-2" style={{ color: "#1c1917" }}>页面不见了</h2>
        <p className="mb-8 max-w-sm" style={{ color: "#78716c", fontSize: "0.9rem" }}>
          您访问的页面可能已被删除、移动，或者根本就不存在。
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
            style={{ background: "#f5ede0", color: "#78716c" }}
          >
            <ArrowLeft size={15} />
            返回上页
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white"
            style={{ background: "#d97706" }}
          >
            <Home size={15} />
            回到首页
          </button>
        </div>
      </motion.div>
    </div>
  );
}
