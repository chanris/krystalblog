import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Shield, UserPlus } from "lucide-react";
import request from "../services/request";
import { useApp } from "../context/AppContext";

export default function Login() {
  const ShieldIcon = Shield as any;
  const UserPlusIcon = UserPlus as any;

  const navigate = useNavigate();
  const { setIsAdmin } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", email: "", nickname: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInputError, setCaptchaInputError] = useState("");

  const resetMessages = () => { setError(""); setSuccess(""); };

  const captchaPurpose = useMemo<"REGISTER" | "LOGIN">(() => (isRegister ? "REGISTER" : "LOGIN"), [isRegister]);

  const normalizeApiError = (e: any) => {
    const code = e?.code ?? e?.response?.data?.code;
    const message = e?.response?.data?.message ?? e?.message;
    return { code, message };
  };

  const validateCaptchaCode = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "请输入验证码";
    if (trimmed.length < 4 || trimmed.length > 6) return "验证码长度应为4-6位";
    if (!/^[0-9a-zA-Z]+$/.test(trimmed)) return "验证码只能包含字母或数字";
    return "";
  };

  const refreshCaptcha = async (options?: { preserveMessages?: boolean }) => {
    if (!options?.preserveMessages) {
      resetMessages();
      setCaptchaInputError("");
    }
    try {
      const res: any = await request.post("/captcha/generate", {
        purpose: captchaPurpose,
        type: "IMAGE",
        length: 5,
      });
      setCaptchaId(res.data.captchaId);
      setCaptchaCode("");
      setCaptchaImage(res.data.imageBase64);
    } catch (e: any) {
      setError(e?.response?.data?.message || "验证码获取失败，请稍后重试");
    }
  };

  useEffect(() => {
    setCaptchaId("");
    setCaptchaImage("");
    setCaptchaCode("");
    setCaptchaInputError("");
    refreshCaptcha();
  }, [captchaPurpose]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!form.username || !form.password) {
      setError("请输入用户名和密码");
      return;
    }
    if (!captchaId) {
      setError("请先获取验证码");
      return;
    }
    const codeError = validateCaptchaCode(captchaCode);
    if (codeError) {
      setCaptchaInputError(codeError);
      setError(codeError);
      return;
    }
    try {
      setLoading(true);
      const res: any = await request.post('/auth/login', {
        username: form.username,
        password: form.password,
        captchaId,
        captchaCode,
      });
      localStorage.setItem('token', res.data.accessToken);
      // 缓存用户信息供侧边栏显示
      if (res.data.user) {
        localStorage.setItem('userInfo', JSON.stringify({
          username: res.data.user.username,
          nickname: res.data.user.nickname,
          role: res.data.user.role,
          avatar: res.data.user.avatar,
        }));
      }
      if (res.data.user.role === 'ADMIN') {
        setIsAdmin(true);
      }
      navigate('/');
    } catch (error: any) {
      const { code, message } = normalizeApiError(error);
      if ([1101, 1102, 1103, 1104].includes(Number(code))) {
        const text = message || "验证码错误，请重试";
        setCaptchaInputError(text);
        setCaptchaCode("");
        setError(text);
      } else {
        setError(message || '登录失败，请检查用户名和密码');
      }
      refreshCaptcha({ preserveMessages: true });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!form.username || !form.password || !form.email) {
      setError("请填写用户名、邮箱和密码");
      return;
    }
    if (form.username.length < 3) {
      setError("用户名至少3个字符");
      return;
    }
    if (form.password.length < 6) {
      setError("密码至少6个字符");
      return;
    }
    if (!captchaId) {
      setError("请先获取验证码");
      return;
    }
    const codeError = validateCaptchaCode(captchaCode);
    if (codeError) {
      setCaptchaInputError(codeError);
      setError(codeError);
      return;
    }
    try {
      setLoading(true);
      await request.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        nickname: form.nickname || undefined,
        captchaId,
        captchaCode,
      });
      setSuccess("注册成功！请登录");
      setForm({ username: form.username, password: "", email: "", nickname: "" });
      setTimeout(() => setIsRegister(false), 1200);
    } catch (error: any) {
      const { code, message } = normalizeApiError(error);
      if ([1101, 1102, 1103, 1104].includes(Number(code))) {
        const text = message || "验证码错误，请重试";
        setCaptchaInputError(text);
        setCaptchaCode("");
        setError(text);
      } else {
        setError(message || '注册失败，请稍后重试');
      }
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    resetMessages();
    setIsRegister(!isRegister);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#faf8f5" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl"
        style={{ background: "white", boxShadow: "0 4px 24px rgba(120,80,20,0.08)" }}
      >
        <div className="flex items-center justify-center mb-6">
          <motion.div
            key={isRegister ? "register" : "login"}
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "#d97706" }}
          >
            {isRegister ? <UserPlusIcon size={24} className="text-white" /> : <ShieldIcon size={24} className="text-white" />}
          </motion.div>
        </div>

        <motion.h1
          key={isRegister ? "reg-title" : "login-title"}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
          style={{ color: "#1c1917", fontSize: "1.25rem", fontWeight: 600 }}
        >
          {isRegister ? "注册 KrystalBlog" : "登录 KrystalBlog"}
        </motion.h1>

        {/* Error / Success Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 px-4 py-2.5 rounded-xl text-sm"
              style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 px-4 py-2.5 rounded-xl text-sm"
              style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-2" style={{ color: "#78716c" }}>用户名</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
              style={{ border: "1.5px solid #f3e8d0" }}
              placeholder="请输入用户名（至少3个字符）"
              onFocus={(e) => (e.target.style.borderColor = "#d97706")}
              onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
            />
          </div>

          {/* Register-only fields */}
          <AnimatePresence>
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#78716c" }}>邮箱</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                    style={{ border: "1.5px solid #f3e8d0" }}
                    placeholder="请输入邮箱"
                    onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                    onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#78716c" }}>昵称 <span className="text-xs" style={{ color: "#a8956b" }}>(可选)</span></label>
                  <input
                    value={form.nickname}
                    onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                    style={{ border: "1.5px solid #f3e8d0" }}
                    placeholder="显示昵称"
                    onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                    onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm mb-2" style={{ color: "#78716c" }}>密码</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
              style={{ border: "1.5px solid #f3e8d0" }}
              placeholder={isRegister ? "请输入密码（至少6个字符）" : "请输入密码"}
              onFocus={(e) => (e.target.style.borderColor = "#d97706")}
              onBlur={(e) => (e.target.style.borderColor = "#f3e8d0")}
            />
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: "#78716c" }}>验证码</label>
            <div className="flex gap-2 items-stretch">
              <input
                value={captchaCode}
                onChange={(e) => {
                  const value = e.target.value;
                  setCaptchaCode(value);
                  setCaptchaInputError(value ? validateCaptchaCode(value) : "");
                }}
                onKeyDown={(e) => {
                  if (e.altKey && e.key.toLowerCase() === "r") {
                    e.preventDefault();
                    refreshCaptcha();
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                style={{ border: `1.5px solid ${captchaInputError ? "#fecaca" : "#f3e8d0"}` }}
                placeholder="请输入4-6位验证码"
                onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                onBlur={(e) => (e.target.style.borderColor = captchaInputError ? "#fecaca" : "#f3e8d0")}
              />
              <button
                type="button"
                onClick={() => refreshCaptcha()}
                className="px-3 rounded-xl text-sm"
                style={{ border: "1.5px solid #f3e8d0", color: "#d97706", background: "white" }}
              >
                刷新
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs" style={{ color: "#a8956b" }}>快捷键：Alt + R 刷新验证码</div>
              {captchaImage && (
                <img
                  src={captchaImage}
                  alt="captcha"
                  className="h-11 rounded-lg cursor-pointer"
                  style={{ border: "1px solid #f3e8d0" }}
                  onClick={() => refreshCaptcha()}
                />
              )}
            </div>

            {captchaInputError && (
              <div className="mt-2 text-xs" style={{ color: "#dc2626" }}>
                {captchaInputError}
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 rounded-xl text-sm text-white transition-opacity disabled:opacity-60"
            style={{ background: "#d97706", fontWeight: 500 }}
          >
            {loading
              ? (isRegister ? '注册中...' : '登录中...')
              : (isRegister ? '注册' : '登录')
            }
          </motion.button>
        </form>

        {/* Toggle Login / Register */}
        <div className="mt-6 text-center">
          <span className="text-sm" style={{ color: "#78716c" }}>
            {isRegister ? "已有账号？" : "还没有账号？"}
          </span>
          <button
            type="button"
            onClick={switchMode}
            className="text-sm ml-1 transition-colors hover:underline"
            style={{ color: "#d97706", fontWeight: 500 }}
          >
            {isRegister ? "去登录" : "注册账号"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
