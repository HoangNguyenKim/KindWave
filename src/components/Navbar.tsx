import { Heart, ShieldCheck, HelpCircle, Bell, Search, RefreshCw, UserCheck, LogOut, Check } from "lucide-react";
import { User } from "../types";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  currentUser: User;
  currentRole: "USER" | "ADMIN";

  onOpenWizard: () => void;
  notificationsCount: number;
  onLogout: () => void;
}

export default function Navbar({
  currentUser,
  currentRole,

  onOpenWizard,
  notificationsCount,
  onLogout
}: NavbarProps) {

  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const rolesList = [
    { key: "USER", label: "Người dùng (USER)", desc: "Tạo dự án, quyên góp ủng hộ & làm tình nguyện viên", color: "bg-emerald-50 text-emerald-700" },
    { key: "ADMIN", label: "Quản trị viên (ADMIN)", desc: "Quản lý pháp lý dự án, duyệt trạng thái & giải ngân", color: "bg-rose-50 text-rose-700" }
  ];

  const currentRoleLabel = rolesList.find((r) => r.key === currentRole)?.label || "Người dùng (USER)";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500 text-white shadow-xs shadow-emerald-500/20">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900">Kind<span className="text-emerald-500">Wave</span></span>
            <p className="text-[9px] font-bold text-slate-400 -mt-1 tracking-widest uppercase">Spread Hope</p>
          </div>
        </div>

        {/* Dynamic Nav Tabs depending on Perspective */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-400 text-xs rounded-full border border-slate-100 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> TRẠNG THÁI: MINH BẠCH SỔ CÁI LIVE
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          
          {/* USER ROLE INDICATOR */}
          <div className="relative">
            <div
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-150 rounded-xl shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Vai trò:</span>
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{currentRoleLabel}</span>
            </div>
          </div>

          {/* Create Campaign CTA for users */}
          {currentRole === "USER" && (
            <button
              onClick={onOpenWizard}
              className="hidden lg:flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-sm shadow-emerald-500/10 cursor-pointer"
            >
              + Tạo chiến dịch
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {notificationsCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {showNotificationDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotificationDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5 z-20 border border-slate-100 text-xs text-slate-700"
                  >
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-2">
                      <span className="font-bold text-slate-800 text-sm">Thông báo gần đây</span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-sm">XÁC MINH SỔ CÁI</span>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-50">
                        <p className="font-semibold text-slate-800">Quyên góp được đối soát thành công! ✨</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Khoản đóng góp của bạn đã được lưu vết vĩnh viễn trên Sổ cái KindWave.</p>
                      </div>
                      <div className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                        <p className="font-semibold text-slate-800">Cập nhật tiến độ dự án mới</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Xã Lũng Pù, Hà Giang đã hoàn tất bàn giao các lớp học mới cho học sinh nghèo.</p>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Info & Logout */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-150">
            <div className="flex items-center gap-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="hidden lg:block text-left leading-none">
                <span className="text-xs font-bold text-slate-800 block truncate max-w-[100px]">{currentUser.name}</span>
                <span className="text-[9px] font-bold text-slate-400 font-mono">ID: {currentUser.email.split("@")[0]}</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLogout();
              }}
              title="Đăng xuất khỏi hệ thống"
              className="relative z-50 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
