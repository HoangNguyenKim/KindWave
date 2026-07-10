import React, { useState } from "react";
import { User } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Mail, User as UserIcon, Shield, Sparkles, ArrowRight, BookOpen, AlertCircle, CheckCircle, Eye, EyeOff, Upload } from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  
  // Login States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regBio, setRegBio] = useState("");
  const [regAvatar, setRegAvatar] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append("image", file);
      try {
        const res = await fetch("/api/images/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setRegAvatar(data.url);
        } else {
          const errorData = await res.json();
          setRegError(errorData.error || "Tải ảnh thất bại");
        }
      } catch (error) {
        setRegError("Lỗi kết nối khi tải ảnh");
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  // Submit standard Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Vui lòng nhập Email và Mật khẩu");
      return;
    }

    setLoginError("");
    setIsLoggingIn(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Đăng nhập thất bại");
      }

      // Success
      localStorage.setItem("kindwave_token", data.token);
      localStorage.setItem("kindwave_user", JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err: any) {
      setLoginError(err.message || "Kết nối máy chủ thất bại");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Submit new registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError("Tên hiển thị, Email và Mật khẩu là bắt buộc");
      return;
    }

    setRegError("");
    setRegSuccess("");
    setIsRegistering(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          password: regPassword.trim(),
          role: "USER",
          bio: regBio.trim(),
          avatar: regAvatar.trim() || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Đăng ký thất bại");
      }

      setRegSuccess("Đăng ký tài khoản thành công! Đang tự động đăng nhập...");
      
      // Auto logging in after a second
      setTimeout(() => {
        localStorage.setItem("kindwave_token", data.token);
        localStorage.setItem("kindwave_user", JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }, 1200);
    } catch (err: any) {
      setRegError(err.message || "Lỗi máy chủ khi đăng ký");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-radial from-slate-50 to-slate-100 p-4 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* Left column: Welcome Branding & Transparency values */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative background circles */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/5 -ml-16 -mb-16 blur-2xl" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-md">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight">Kind<span className="text-emerald-100">Wave</span></span>
                <p className="text-[10px] font-bold text-emerald-100/80 -mt-1 tracking-widest uppercase">Spread Hope</p>
              </div>
            </div>

            <div className="mt-12 space-y-6">
              <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
                Nền tảng Quyên góp Minh bạch Sổ cái
              </h1>
              <p className="text-sm text-emerald-100/90 leading-relaxed font-medium">
                Chào mừng bạn đến với KindWave, nơi mỗi khoản đóng góp từ thiện và hoạt động tình nguyện đều được lưu vết minh bạch 100% trên sổ cái số hóa trực tiếp.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-12 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-white/10 mt-0.5 text-emerald-200 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Minh Bạch Hoàn Toàn</p>
                <p className="text-[11px] text-emerald-100/80 mt-0.5">Mọi hồ sơ rút quỹ đều phải đi kèm hóa đơn VAT và được ban kiểm duyệt thông qua trước khi cập nhật sổ cái.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-white/10 mt-0.5 text-emerald-200 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Hai Vai Trò Độc Lập</p>
                <p className="text-[11px] text-emerald-100/80 mt-0.5">Trải nghiệm hai góc nhìn linh hoạt giữa Người đóng góp/Tổ chức thiện nguyện (USER) và Ban giám sát pháp lý (ADMIN).</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex justify-between items-center text-xs text-emerald-100/70">
            <span>KindWave © 2026</span>
            <span>Hệ thống Live Ledger</span>
          </div>
        </div>

        {/* Right column: Login / Register Form */}
        <div className="lg:col-span-7 p-6 sm:p-12 flex flex-col justify-center">
          
          {/* Header Switcher Tabs */}
          <div className="flex border-b border-slate-100 pb-4 mb-6">
            <button
              onClick={() => { setTab("login"); setLoginError(""); setRegError(""); }}
              className={`pb-2 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                tab === "login" ? "border-emerald-500 text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Đăng nhập tài khoản
            </button>
            <button
              onClick={() => { setTab("register"); setLoginError(""); setRegError(""); }}
              className={`pb-2 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                tab === "register" ? "border-emerald-500 text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Đăng ký thành viên
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Chào mừng quay trở lại!</h2>
                  <p className="text-xs text-slate-400 mt-1">Nhập email của bạn để đăng nhập hoặc sử dụng tài khoản chạy thử bên dưới.</p>
                </div>

                {loginError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="font-medium leading-normal">{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Địa chỉ Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="ten-cua-ban@gmail.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Mật khẩu</label>
                    <div className="relative">
                      <Shield className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-emerald-500 transition-colors"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    {isLoggingIn ? "Đang xác thực..." : "Đăng nhập ngay"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

              </motion.div>
            ) : (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Trở thành một phần của KindWave</h2>
                  <p className="text-xs text-slate-400 mt-1">Đăng ký tài khoản mới để bắt đầu quyên góp, nộp hồ sơ NGO hoặc đăng ký làm tình nguyện viên.</p>
                </div>

                {regError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="font-medium leading-normal">{regError}</span>
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 animate-bounce" />
                    <span className="font-bold leading-normal">{regSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  
                  {/* Grid for basic info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Họ và Tên</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Ví dụ: Nguyễn Văn A"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Địa chỉ Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          placeholder="email-cua-ban@gmail.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Mật khẩu</label>
                    <div className="relative">
                      <Shield className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type={showRegPassword ? "text" : "password"}
                        placeholder="Tối thiểu 6 ký tự"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Avatar Upload */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ảnh đại diện (Tùy chọn)</label>
                    <div className="flex items-center gap-4">
                      {regAvatar ? (
                        <img src={regAvatar} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                          <UserIcon className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={isUploadingAvatar}
                          className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer disabled:opacity-50"
                        />
                        {isUploadingAvatar && <p className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1"><Upload className="w-3 h-3 animate-bounce" /> Đang tải ảnh lên...</p>}
                      </div>
                    </div>
                  </div>

                  {/* Bio biography */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tiểu sử ngắn gọn (Bio)</label>
                    <textarea
                      placeholder="Chia sẻ một chút thông tin về bạn..."
                      rows={2}
                      value={regBio}
                      onChange={(e) => setRegBio(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    {isRegistering ? "Đang gửi hồ sơ..." : "Đăng ký thành viên mới"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
