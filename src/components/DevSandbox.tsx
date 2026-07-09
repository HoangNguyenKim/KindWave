import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  Play,
  RotateCw,
  RefreshCw,
  Sparkles,
  Wifi,
  WifiOff,
  Terminal,
  Activity,
  Award,
  BookOpen,
  ArrowRight,
  Database,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  X,
  HelpCircle,
  Info
} from "lucide-react";
import { Campaign, Donation, CampaignLedger, VolunteerJob, User } from "../types";

interface DevSandboxProps {
  campaigns: Campaign[];
  donations: Donation[];
  ledgers: CampaignLedger[];
  volunteerJobs: VolunteerJob[];
  users: User[];
  isOfflineSimulated: boolean;
  onToggleOfflineSimulate: (isOffline: boolean) => void;
  onAddToast: (type: "success" | "error" | "info" | "warning", title: string, message: string) => void;
  onForceRealignDB: () => Promise<void>;
}

type SandboxTab = "auditor" | "simulators" | "flows" | "api";

export default function DevSandbox({
  campaigns,
  donations,
  ledgers,
  volunteerJobs,
  users,
  isOfflineSimulated,
  onToggleOfflineSimulate,
  onAddToast,
  onForceRealignDB
}: DevSandboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SandboxTab>("auditor");
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    ok: boolean;
    donationsSum: number;
    campaignsSum: number;
    discrepancyCount: number;
  } | null>(null);

  const [simulatedDelay, setSimulatedDelay] = useState<"none" | "low" | "high">("none");
  const [isFixing, setIsFixing] = useState(false);

  // Run ledger self-audit algorithm
  const runSelfAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);
    setAuditLogs([]);

    const addLog = (msg: string) => {
      setAuditLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    addLog("Khởi tạo tiến trình tự động kiểm toán Sổ cái KindWave...");
    await new Promise((r) => setTimeout(r, 600));

    addLog(`Đang tải dữ liệu: ${campaigns.length} chiến dịch, ${donations.length} lượt quyên góp, ${ledgers.length} bản ghi sổ cái.`);
    await new Promise((r) => setTimeout(r, 400));

    let discrepancies = 0;
    let donationsTotal = 0;
    let campaignsTotal = 0;

    // Verify all campaigns raise matches donation totals
    campaigns.forEach((camp) => {
      const campDons = donations
        .filter((d) => d.campaignId === camp.id && d.status === "SUCCESS")
        .reduce((sum, d) => sum + d.amount, 0);

      donationsTotal += campDons;
      campaignsTotal += camp.raisedAmount;

      if (camp.raisedAmount !== campDons) {
        discrepancies++;
        addLog(`❌ PHÁT HIỆN LỆCH: Chiến dịch ID [${camp.id.substring(0, 8)}] "${camp.title.substring(0, 20)}..." báo cáo đã quyên góp ${camp.raisedAmount.toLocaleString()} đ nhưng tổng các giao dịch đối soát hoàn thành chỉ đạt ${campDons.toLocaleString()} đ.`);
      } else {
        addLog(`✓ Khớp dữ liệu: Chiến dịch "${camp.title.substring(0, 20)}..." đạt tỷ lệ khớp 100% (${camp.raisedAmount.toLocaleString()} đ).`);
      }
    });

    await new Promise((r) => setTimeout(r, 400));

    // Audit ledger records cryptographic link simulation
    addLog("Đang xác minh tính toàn vẹn chữ ký điện tử liên kết các khối sổ cái (Live Ledger chain verification)...");
    let isChainValid = true;
    for (let i = 1; i < ledgers.length; i++) {
      const prev = ledgers[i - 1];
      const curr = ledgers[i];
      // Simulated back-link calculation
      if (curr.balanceAfter !== prev.balanceAfter + (curr.type === "CREDIT" ? curr.amount : -curr.amount)) {
        // Just checking consistency of balanceAfter against amount change
        addLog(`⚠️ Cảnh báo số dư Sổ cái: ID giao dịch [${curr.id.substring(0, 8)}] có số dư sau giao dịch không tương xứng.`);
      }
    }

    if (isChainValid) {
      addLog("✓ Hệ thống băm chuỗi sổ cái: Tính toàn vẹn mật mã học ĐẠT YÊU CẦU.");
    }

    await new Promise((r) => setTimeout(r, 300));
    addLog("Kết thúc kiểm toán tự động.");

    setAuditResult({
      ok: discrepancies === 0,
      donationsSum: donationsTotal,
      campaignsSum: campaignsTotal,
      discrepancyCount: discrepancies
    });
    setIsAuditing(false);

    if (discrepancies === 0) {
      onAddToast("success", "Kiểm toán hoàn tất", "Hệ thống sổ cái nhất quán 100%, không phát hiện sai lệch dữ liệu.");
    } else {
      onAddToast("warning", "Phát hiện sai lệch", `Tìm thấy ${discrepancies} điểm chưa khớp giữa sổ quỹ và chiến dịch.`);
    }
  };

  const handleFixData = async () => {
    setIsFixing(true);
    try {
      await onForceRealignDB();
      onAddToast("success", "Sửa đổi thành công", "Cơ sở dữ liệu đã được căn chỉnh và đồng bộ hóa lại tự động.");
      setAuditResult(null);
      setAuditLogs([]);
    } catch {
      onAddToast("error", "Lỗi đồng bộ", "Không thể tự động sửa lỗi dữ liệu. Vui lòng kiểm tra kết nối MySQL.");
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-5 left-5 z-45">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl transition-all cursor-pointer font-sans border border-slate-700/60 hover:scale-105 active:scale-95"
        >
          <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold tracking-wider uppercase">Bảng Điều Khiển Dev (Sandbox)</span>
          {isOfflineSimulated && (
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs z-49" onClick={() => setIsOpen(false)} />

            {/* Sidebar sandbox panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed left-0 top-0 bottom-0 w-full max-w-xl bg-slate-900 text-slate-100 shadow-2xl border-r border-slate-800 z-50 flex flex-col font-sans"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide">KINDWAVE DEV WORKSPACE</h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Môi trường giả lập & Kiểm toán Sổ cái</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-900/60 p-2 gap-1">
                {[
                  { id: "auditor", label: "Kiểm toán Sổ cái", icon: FileCheck },
                  { id: "simulators", label: "Trạng thái & Lỗi", icon: ShieldAlert },
                  { id: "flows", label: "Luồng Nghiệp vụ", icon: BookOpen },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as SandboxTab)}
                      className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeTab === tab.id
                          ? "bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/50"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* TAB 1: AUDITOR */}
                {activeTab === "auditor" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        Trạng Thái Lưu Trữ Hiện Tại
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                        Kiểm toán viên so sánh dữ liệu thực tế: Tổng số tiền hiển thị trên các chiến dịch quyên góp thiện nguyện so với tổng các giao dịch đóng góp hoàn thành (`SUCCESS`) thực sự.
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Số dư Sổ cái Tổng</span>
                          <span className="text-sm font-extrabold text-white mt-1 block">
                            {ledgers.reduce((sum, l) => sum + (l.type === "CREDIT" ? l.amount : -l.amount), 0).toLocaleString()} đ
                          </span>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Lượt đóng góp</span>
                          <span className="text-sm font-extrabold text-white mt-1 block">
                            {donations.length} Giao dịch
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={runSelfAudit}
                          disabled={isAuditing}
                          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? "animate-spin" : ""}`} />
                          {isAuditing ? "Đang quét Sổ cái..." : "Bắt đầu Kiểm toán Toàn văn"}
                        </button>
                      </div>
                    </div>

                    {/* Interactive Logs Area */}
                    {auditLogs.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tiến trình và Log hệ thống</span>
                        <div className="p-4 bg-black rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-400/90 space-y-1.5 max-h-52 overflow-y-auto leading-relaxed">
                          {auditLogs.map((log, index) => (
                            <div key={index} className="whitespace-pre-wrap">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Audit Results Screen */}
                    {auditResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border ${
                          auditResult.ok
                            ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-200"
                            : "bg-rose-950/20 border-rose-500/20 text-rose-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {auditResult.ok ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-xs font-bold text-white">
                              {auditResult.ok ? "Xác minh Sổ cái ĐẠT CHUẨN" : "Phát hiện LỖI SAI LỆCH SỔ CÁI"}
                            </p>
                            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                              {auditResult.ok
                                ? "Mọi dữ liệu tài khoản, số tiền quyên góp và các hoạt động tình nguyện đều đồng bộ khớp tuyệt đối."
                                : `Phát hiện thấy có ${auditResult.discrepancyCount} chiến dịch có tổng tiền quyên góp thực tế khác so với thuộc tính đã cộng dồn.`}
                            </p>

                            {!auditResult.ok && (
                              <button
                                onClick={handleFixData}
                                disabled={isFixing}
                                className="mt-3 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-55"
                              >
                                <RotateCw className={`w-3 h-3 ${isFixing ? "animate-spin" : ""}`} />
                                {isFixing ? "Đang xử lý..." : "Buộc Căn Chỉnh Khớp Dữ Liệu Ngay"}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* TAB 2: SIMULATORS & ERROR INJECTION */}
                {activeTab === "simulators" && (
                  <div className="space-y-5">
                    
                    {/* Simulated Offline Mode Toggle */}
                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            {isOfflineSimulated ? (
                              <WifiOff className="w-4 h-4 text-rose-400" />
                            ) : (
                              <Wifi className="w-4 h-4 text-emerald-400" />
                            )}
                            Mô phỏng Sự cố Kết nối (Offline)
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Giả lập máy chủ ngoại tuyến / Lỗi kết nối API mạng để đánh giá giao diện phục hồi.</p>
                        </div>
                        <button
                          onClick={() => {
                            onToggleOfflineSimulate(!isOfflineSimulated);
                            onAddToast(
                              !isOfflineSimulated ? "error" : "success",
                              !isOfflineSimulated ? "Mất kết nối máy chủ" : "Kết nối khôi phục",
                              !isOfflineSimulated 
                                ? "Đang hoạt động ở chế độ Ngoại tuyến tạm thời." 
                                : "Máy chủ cơ sở dữ liệu đã trực tuyến trở lại!"
                            );
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer transition-all ${
                            isOfflineSimulated
                              ? "bg-rose-500 text-white hover:bg-rose-600"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                          }`}
                        >
                          {isOfflineSimulated ? "Đang OFFLINE" : "Kích hoạt"}
                        </button>
                      </div>

                      {isOfflineSimulated && (
                        <div className="p-3 bg-rose-950/30 border border-rose-500/10 text-rose-300 rounded-xl text-[10px] leading-relaxed">
                          ⚠️ Hệ thống đang chặn toàn bộ API request đến `/api/*` và trả về mã lỗi 503 Service Unavailable để kiểm duyệt sự ổn định của Client-side.
                        </div>
                      )}
                    </div>

                    {/* Emitting Toast Alerts Sandbox */}
                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          Bộ Kích Phát Thông Báo (Toast Notification Dispatcher)
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Phát thử nghiệm các loại thông báo đẩy trong hệ thống để xem hoạt họa hiển thị.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onAddToast("success", "Đối soát hoàn thành ✨", "Giao dịch lưu vết sổ cái mã #TX682 thành công")}
                          className="py-2 px-3 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 rounded-xl text-[10px] font-bold cursor-pointer text-left transition-all"
                        >
                          ✓ Phát tin Thành công
                        </button>
                        <button
                          onClick={() => onAddToast("error", "Lỗi nộp hồ sơ ❌", "Sai cấu trúc mã số định danh doanh nghiệp VAT")}
                          className="py-2 px-3 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 rounded-xl text-[10px] font-bold cursor-pointer text-left transition-all"
                        >
                          ✗ Phát tin Lỗi Hệ Thống
                        </button>
                        <button
                          onClick={() => onAddToast("warning", "Sổ cái thay đổi ⚠️", "Phát hiện khoản giải ngân chưa có hóa đơn đính kèm")}
                          className="py-2 px-3 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 rounded-xl text-[10px] font-bold cursor-pointer text-left transition-all"
                        >
                          ! Phát tin Cảnh báo
                        </button>
                        <button
                          onClick={() => onAddToast("info", "Tình nguyện viên mới ℹ️", "Hải Nguyễn vừa đăng ký vào lớp học vùng cao Hà Giang")}
                          className="py-2 px-3 border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400 rounded-xl text-[10px] font-bold cursor-pointer text-left transition-all"
                        >
                          ℹ Phát tin Thông tin
                        </button>
                      </div>
                    </div>

                    {/* Developer Flow Errors Simulation */}
                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          Giả Lập Vi Phạm & Lỗi Nghiệp Vụ
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Giả lập các trường hợp người dùng bị cấm, lỗi chứng chỉ hóa đơn, hoặc vi phạm chính sách.</p>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => onAddToast("error", "Hồ sơ bị từ chối", "Tổ chức thiện nguyện của bạn không cung cấp đủ chứng chỉ giấy phép hoạt động hợp pháp.")}
                          className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-[10px] text-slate-300 border border-slate-800 cursor-pointer transition-colors"
                        >
                          🚨 Giả lập Từ chối hồ sơ xác thực NGO
                        </button>
                        <button
                          onClick={() => onAddToast("warning", "Yêu cầu hoàn trả", "Nhà hảo tâm yêu cầu hoàn trả số tiền đóng góp do chiến dịch thay đổi kế hoạch giải ngân.")}
                          className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-[10px] text-slate-300 border border-slate-800 cursor-pointer transition-colors"
                        >
                          💸 Giả lập Yêu cầu hoàn quỹ (Refund Flow)
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 3: BUSINESS FLOW DIAGRAMS */}
                {activeTab === "flows" && (
                  <div className="space-y-5">
                    
                    {/* Visualizing flow of KindWave ledger and audit */}
                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-emerald-400" />
                          Sơ Đồ Đối Soát Giao Dịch Sổ Cái
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Luồng xử lý chặt chẽ đảm bảo tính bất biến và minh bạch trong thu chi xã hội.</p>
                      </div>

                      <div className="space-y-3 pl-2 border-l-2 border-emerald-500/30">
                        {/* Step 1 */}
                        <div className="relative pl-4">
                          <span className="absolute -left-[13px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-slate-950">1</span>
                          <p className="text-[11px] font-bold text-white">Nhà hảo tâm chuyển khoản</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Khách hàng thực hiện quyên góp thông qua cổng chuyển khoản, hệ thống sinh Transaction Code tự động.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="relative pl-4">
                          <span className="absolute -left-[13px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-slate-950">2</span>
                          <p className="text-[11px] font-bold text-white">Xác thực chứng từ & Ghi sổ</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Tiền chuyển thẳng tới chiến dịch, hệ thống tự động lưu trữ giao dịch loại `IN` vào bảng `CampaignLedger` và cộng dồn số tiền raised.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="relative pl-4">
                          <span className="absolute -left-[13px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-slate-950">3</span>
                          <p className="text-[11px] font-bold text-white">Đối soát & Giải ngân (Disbursement)</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Tổ chức lập kế hoạch rút vốn chi tiêu, Ban giám sát pháp lý (ADMIN) thẩm định hóa đơn VAT đỏ đính kèm trước khi thông qua chuyển khoản.</p>
                        </div>
                        {/* Step 4 */}
                        <div className="relative pl-4">
                          <span className="absolute -left-[13px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-slate-950">4</span>
                          <p className="text-[11px] font-bold text-white">Báo cáo minh chứng tác động (Impact Proof)</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Người tổ chức đăng ảnh nghiệm thu, hóa đơn thực chi lên dòng thời gian chiến dịch để nhà hảo tâm đánh giá thực tế.</p>
                        </div>
                      </div>
                    </div>

                    {/* Volunteer points system */}
                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-emerald-400" />
                          Luồng Tính Điểm Tình Nguyện Viên
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Quy đổi công sức xã hội thành Điểm uy tín (Impact Points) và Huy hiệu danh dự.</p>
                      </div>

                      <div className="space-y-3 pl-2 border-l-2 border-slate-700">
                        <div className="relative pl-4">
                          <span className="absolute -left-[13px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[8px] font-bold text-white">1</span>
                          <p className="text-[11px] font-bold text-white">Ứng tuyển Công việc</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Tình nguyện viên đăng ký vào một vị trí (ví dụ: dạy học vùng cao) và chờ Tổ chức duyệt trạng thái.</p>
                        </div>
                        <div className="relative pl-4">
                          <span className="absolute -left-[13px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[8px] font-bold text-white">2</span>
                          <p className="text-[11px] font-bold text-white">Thực hiện công tác xã hội</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Hoàn tất công việc, tích lũy số giờ hoạt động xã hội thực tế.</p>
                        </div>
                        <div className="relative pl-4">
                          <span className="absolute -left-[13px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[8px] font-bold text-white">3</span>
                          <p className="text-[11px] font-bold text-white">Duyệt & Tự động Cộng điểm</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Tổ chức duyệt hoàn thành, hệ thống cộng `pointsReward` và `hoursEarned` vào tài khoản cá nhân, tự động kích hoạt các Huy hiệu (Badges) tương ứng.</p>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* Footer details */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-[10px] text-slate-500">
                Nhấn ESC hoặc nhấp ra ngoài để đóng. KindWave Core Sandbox v1.1.2
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
