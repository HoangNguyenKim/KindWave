import { useState } from "react";
import { User, Campaign, Donation, CampaignLedger, Disbursement, ImpactProof, CampaignReport, OrgVerification } from "../types";
import {
  Landmark,
  Users,
  TrendingUp,
  DollarSign,
  Ban,
  Unlock,
  HelpCircle,
  BadgeAlert,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  Award
} from "lucide-react";

interface AdminDashboardProps {
  users: User[];
  campaigns: Campaign[];
  donations: Donation[];
  ledgers: CampaignLedger[];
  disbursements: Disbursement[];
  impactProofs: ImpactProof[];
  reports: CampaignReport[];
  verifications: OrgVerification[];
  onToggleBanUser: (userId: string) => void;
  onApproveDisbursement: (disbId: string, bankingProofUrl: string) => void;
  onApproveImpactProof: (proofId: string) => void;
  onModerateCampaign: (campaignId: string, status: "ACTIVE" | "REJECTED", reason?: string) => void;
  onResolveReport: (reportId: string) => void;
  onApproveOrg: (orgId: string, status: "APPROVED" | "REJECTED") => void;
}

export default function AdminDashboard({
  users,
  campaigns,
  donations,
  ledgers,
  disbursements,
  impactProofs,
  reports,
  verifications,
  onToggleBanUser,
  onApproveDisbursement,
  onApproveImpactProof,
  onModerateCampaign,
  onResolveReport,
  onApproveOrg
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "analytics" | "campaigns" | "reports" | "organizations" | "treasury" | "proofs" | "users"
  >("analytics");
  const [unclinkUrl, setUnclinkUrl] = useState("https://img.vietqr.io/image/970415-113366688-compact2.png");
  const [activeDisbId, setActiveDisbId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [activeRejectId, setActiveRejectId] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const totalRaised = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
  const totalDisbursed = disbursements
    .filter((d) => d.status === "APPROVED")
    .reduce((acc, d) => acc + d.totalAmount, 0);

  const handleDisbursementApproval = (id: string) => {
    onApproveDisbursement(id, unclinkUrl);
    setActiveDisbId(null);
    alert("Ký duyệt chuyển khoản giải ngân thành công! Đã tự động cập nhật Sổ cái và Ủy nhiệm chi đính kèm.");
  };

  const handleCampaignAction = (id: string, status: "ACTIVE" | "REJECTED") => {
    if (status === "REJECTED") {
      if (!rejectReason.trim()) {
        alert("Vui lòng điền lý do từ chối chiến dịch!");
        return;
      }
      onModerateCampaign(id, "REJECTED", rejectReason.trim());
      setActiveRejectId(null);
      setRejectReason("");
      alert("Đã từ chối cấp phép chiến dịch và gửi phản hồi đến chủ dự án.");
    } else {
      onModerateCampaign(id, "ACTIVE");
      alert("Phê duyệt chiến dịch thành công! Dự án hiện đã công khai trên bảng tin chính.");
    }
  };

  const pendingCampaigns = campaigns.filter((c) => c.status === "PENDING");
  const pendingReports = reports.filter((r) => r.status === "PENDING");
  const pendingVerifications = verifications.filter((v) => v.status === "PENDING");
  const pendingDisbursements = disbursements.filter((d) => d.status === "PENDING");
  const pendingProofs = impactProofs.filter((p) => p.status === "PENDING");

  return (
    <div className="space-y-6">
      {/* Overview stats top */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hệ thống Quản trị & Kế toán Toàn sàn (Admin Portal)</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Thẩm định thông tin pháp lý chiến dịch, duyệt giải ngân, kiểm soát chứng từ VAT và quản trị tài khoản người dùng toàn hệ thống.
        </p>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "analytics" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Số liệu thống kê
          {activeTab === "analytics" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "campaigns" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Duyệt chiến dịch ({pendingCampaigns.length})
          {activeTab === "campaigns" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "reports" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Tố cáo vi phạm ({pendingReports.length})
          {activeTab === "reports" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
        <button
          onClick={() => setActiveTab("organizations")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "organizations" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Xác thực tổ chức ({pendingVerifications.length})
          {activeTab === "organizations" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
        <button
          onClick={() => setActiveTab("treasury")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "treasury" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Duyệt giải ngân ({pendingDisbursements.length})
          {activeTab === "treasury" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
        <button
          onClick={() => setActiveTab("proofs")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "proofs" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Duyệt chứng từ ({pendingProofs.length})
          {activeTab === "proofs" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "users" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Người dùng ({users.length})
          {activeTab === "users" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* 1. Analytics */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Tổng tiền kêu gọi</span>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xl font-black text-slate-900 font-mono">{formatCurrency(totalRaised).replace(",00", "")}</p>
                <span className="text-[9px] text-slate-400 block font-mono">100% minh bạch trên sổ cái</span>
              </div>

              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Tổng tiền giải ngân</span>
                  <Landmark className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xl font-black text-slate-900 font-mono">{formatCurrency(totalDisbursed).replace(",00", "")}</p>
                <span className="text-[9px] text-slate-400 block">Đã đối soát hóa đơn VAT và chứng từ</span>
              </div>

              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Người dùng hệ thống</span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-xl font-black text-slate-900 font-mono">{users.length} tài khoản</p>
                <span className="text-[9px] text-slate-400 block">Gồm Quản trị viên và người dùng</span>
              </div>

              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Dự án hành động</span>
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-xl font-black text-slate-900 font-mono">{campaigns.length} chiến dịch</p>
                <span className="text-[9px] text-slate-400 block">Đang hoạt động và hoàn thành</span>
              </div>
            </div>

            {/* Custom visual chart */}
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Cơ cấu đóng góp theo từng danh mục quỹ</h4>
                <p className="text-xs text-slate-500">Phân bổ dòng tiền thu hút từ các nhà hảo tâm.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block">CỨU TRỢ & Y TẾ</span>
                  <div className="w-full h-3 bg-emerald-500 rounded-full" />
                  <span className="text-sm font-black text-slate-800">515 triệu đ</span>
                </div>
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block">GIÁO DỤC & TRẺ EM</span>
                  <div className="w-full h-3 bg-blue-500 rounded-full mx-auto" style={{ width: "60%" }} />
                  <span className="text-sm font-black text-slate-800">185 triệu đ</span>
                </div>
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block">MÔI TRƯỜNG</span>
                  <div className="w-full h-3 bg-purple-500 rounded-full mx-auto" style={{ width: "35%" }} />
                  <span className="text-sm font-black text-slate-800">45 triệu đ</span>
                </div>
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block">HOÀN CẢNH KHÓ KHĂN</span>
                  <div className="w-full h-3 bg-amber-500 rounded-full mx-auto" style={{ width: "5%" }} />
                  <span className="text-sm font-black text-slate-800">0 đ</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Campaigns Vetting */}
        {activeTab === "campaigns" && (
          <div className="space-y-4">
            {pendingCampaigns.map((camp) => (
              <div key={camp.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm uppercase tracking-wider">THẨM ĐỊNH CHIẾN DỊCH</span>
                    <h3 className="font-bold text-slate-900 text-sm">{camp.title}</h3>
                    <p className="text-xs text-slate-500">Chủ sáng lập: <span className="font-semibold text-slate-700">{camp.creatorName}</span> | Đăng ngày: {camp.dateCreated}</p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs text-slate-400 block uppercase">Mục tiêu gây quỹ</span>
                    <span className="text-sm font-black text-slate-800 font-mono">{formatCurrency(camp.goalAmount)}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-600 space-y-2">
                  <p><span className="font-semibold text-slate-700">Mục tiêu thụ hưởng:</span> {camp.targetBeneficiary}</p>
                  <p className="line-clamp-2"><span className="font-semibold text-slate-700">Tóm tắt:</span> {camp.shortDescription}</p>
                  <p className="text-[10px] text-slate-400 font-mono italic">Mã tham chiếu: {camp.id}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => handleCampaignAction(camp.id, "ACTIVE")}
                    className="py-2 px-3.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Duyệt & Đăng công khai
                  </button>
                  <button
                    onClick={() => setActiveRejectId(camp.id)}
                    className="py-2 px-3.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <XCircle className="w-4 h-4" /> Từ chối dự án
                  </button>
                </div>

                {/* Reject dialog */}
                {activeRejectId === camp.id && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-2.5 text-xs">
                    <label className="block font-bold text-slate-700">Lý do từ chối chiến dịch *</label>
                    <input
                      type="text"
                      placeholder="Nêu rõ lý do (ví dụ: Thiếu tài liệu xác minh tư cách pháp nhân...)"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCampaignAction(camp.id, "REJECTED")}
                        className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer"
                      >
                        Xác nhận từ chối
                      </button>
                      <button
                        onClick={() => {
                          setActiveRejectId(null);
                          setRejectReason("");
                        }}
                        className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {pendingCampaigns.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 space-y-1.5">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Hàng chờ duyệt trống</p>
                <p className="text-[10px] text-slate-400">Không có dự án gây quỹ nào đang chờ phê duyệt.</p>
              </div>
            )}
          </div>
        )}

        {/* 3. Abuse Reports */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            {pendingReports.map((rep) => (
              <div key={rep.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-3 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-bold rounded-sm uppercase tracking-wider flex items-center gap-1 w-max">
                      <AlertTriangle className="w-3.5 h-3.5" /> Báo cáo nội dung vi phạm pháp lý
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">Báo cáo chiến dịch: &ldquo;{rep.campaignTitle}&rdquo;</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {rep.id}</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5">
                  <p><span className="font-semibold text-slate-600">Người báo cáo:</span> {rep.reporterName} | Ngày gửi: {rep.dateCreated}</p>
                  <p><span className="font-semibold text-slate-600">Lý do chính:</span> <span className="text-rose-600 font-bold">{rep.reason}</span></p>
                  <p><span className="font-semibold text-slate-600">Giải trình mô tả chi tiết:</span> {rep.description}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      onResolveReport(rep.id);
                      alert("Đã bác bỏ tố cáo thành công!");
                    }}
                    className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Bác bỏ tố cáo (Nội dung hợp lệ)
                  </button>
                  <button
                    onClick={async () => {
                      onModerateCampaign(rep.campaignId, "REJECTED", `Dự án bị đóng băng khẩn cấp do vi phạm tố cáo: ${rep.reason}`);
                      onResolveReport(rep.id);
                      alert("Đã khóa chiến dịch này thành công!");
                    }}
                    className="py-2 px-4 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl cursor-pointer"
                  >
                    Khóa chiến dịch khẩn cấp
                  </button>
                </div>
              </div>
            ))}
            {pendingReports.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 space-y-1.5">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Hàng chờ tố cáo trống</p>
                <p className="text-[10px] text-slate-400">Không có tố cáo tranh chấp nào cần xử lý.</p>
              </div>
            )}
          </div>
        )}

        {/* 4. NGO Verifications */}
        {activeTab === "organizations" && (
          <div className="space-y-4">
            {pendingVerifications.map((org) => (
              <div key={org.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-3.5 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold rounded-sm uppercase tracking-wider">XÁC MINH PHÁP NHÂN NGO</span>
                    <h4 className="font-bold text-slate-900 text-sm">{org.orgName}</h4>
                    <p className="text-[10px] text-slate-400">Đại diện: {org.repName} | Email: {org.email}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Nộp ngày: {org.dateCreated}</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">Tài liệu hồ sơ/quyết định cấp phép hoạt động xã hội</p>
                    <p className="text-[10px] text-slate-400">Bấm nút bên phải để xem chi tiết bản chụp quét.</p>
                  </div>
                  <a
                    href={org.licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onApproveOrg(org.id, "APPROVED");
                      alert("Duyệt hồ sơ và cấp tích xanh pháp nhân thành công!");
                    }}
                    className="py-2 px-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Duyệt hồ sơ hợp lệ (Cấp Tích Xanh)
                  </button>
                  <button
                    onClick={() => {
                      onApproveOrg(org.id, "REJECTED");
                      alert("Từ chối cấp phép pháp nhân.");
                    }}
                    className="py-2 px-3.5 border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                  >
                    Từ chối hồ sơ
                  </button>
                </div>
              </div>
            ))}
            {pendingVerifications.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 space-y-1.5">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Hàng chờ xác thực trống</p>
                <p className="text-[10px] text-slate-400">Mọi tổ chức thiện nguyện nộp hồ sơ đều đã được xử lý.</p>
              </div>
            )}
          </div>
        )}

        {/* 5. Treasury (Disbursements) */}
        {activeTab === "treasury" && (
          <div className="space-y-4">
            {pendingDisbursements.map((d) => (
              <div key={d.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold rounded-sm uppercase tracking-wider flex items-center gap-1 w-max">
                      <Landmark className="w-3.5 h-3.5" /> PHIẾU GIẢI NGÂN CHỜ PHÊ DUYỆT
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Dự án rút quỹ: {campaigns.find((c) => c.id === d.campaignId)?.title || "Chiến dịch"}
                    </h4>
                    <p className="text-slate-500">Mã giải ngân: {d.id} | Yêu cầu vào: {d.scheduledDate}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Số tiền yêu cầu</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">{formatCurrency(d.totalAmount)}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                  <p><span className="font-bold text-slate-600">Kế hoạch chi tiêu giải trình:</span> {d.description}</p>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Ủy nhiệm chi (Banking Proof Photo URL)</label>
                  <input
                    type="text"
                    value={unclinkUrl}
                    onChange={(e) => setUnclinkUrl(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white text-xs text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDisbursementApproval(d.id)}
                    className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Ký duyệt giải ngân & Ghi Sổ cái
                  </button>
                  <button
                    onClick={() => alert("Đã bác bỏ phiếu yêu cầu giải ngân!")}
                    className="py-2 px-4 border border-slate-200 bg-slate-50 text-slate-600 font-semibold rounded-xl cursor-pointer"
                  >
                    Bác bỏ yêu cầu
                  </button>
                </div>
              </div>
            ))}
            {pendingDisbursements.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 space-y-1.5">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Hàng chờ giải ngân trống</p>
                <p className="text-[10px] text-slate-400">Không có yêu cầu giải ngân chưa giải quyết.</p>
              </div>
            )}
          </div>
        )}

        {/* 6. Proofs Vetting */}
        {activeTab === "proofs" && (
          <div className="space-y-4">
            {pendingProofs.map((p) => (
              <div key={p.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-3.5 text-xs text-left">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[9px] font-bold rounded-sm uppercase tracking-wider flex items-center gap-1 w-max">
                      <FileCheck className="w-3.5 h-3.5" /> CHỨNG TỪ BÁO CÁO CHI TIÊU
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">Báo cáo: &ldquo;{p.title}&rdquo;</h4>
                    <p className="text-slate-500">Mã: {p.id} | Gửi ngày: {p.dateCreated}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Số tiền đã quyết toán</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">{formatCurrency(p.spentAmount)}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                  <p><span className="font-semibold text-slate-600">Chi tiết đối soát:</span> {p.content}</p>
                </div>

                {p.proofImages && p.proofImages.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-bold text-slate-500 text-[10px] uppercase">Hóa đơn mua hàng VAT / Chứng minh thực tế</p>
                    <div className="w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 aspect-video">
                      <img src={p.proofImages[0]} alt="Impact proof" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onApproveImpactProof(p.id);
                      alert("Duyệt chứng từ thành công! Đã giải tỏa trạng thái quyết toán.");
                    }}
                    className="py-2 px-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Duyệt báo cáo hợp lệ
                  </button>
                  <button
                    onClick={() => alert("Đã trả lại báo cáo và yêu cầu bổ sung chứng từ!")}
                    className="py-2 px-3.5 border border-slate-200 bg-slate-50 text-slate-600 font-semibold rounded-xl cursor-pointer"
                  >
                    Yêu cầu nộp lại
                  </button>
                </div>
              </div>
            ))}
            {pendingProofs.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 space-y-1.5">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Hàng chờ chứng từ trống</p>
                <p className="text-[10px] text-slate-400">Không có chứng từ báo cáo chi tiêu nào đang chờ phê duyệt.</p>
              </div>
            )}
          </div>
        )}

        {/* 7. User Governance */}
        {activeTab === "users" && (
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Họ và tên</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Nhóm quyền</th>
                    <th className="p-4">Giờ đóng góp</th>
                    <th className="p-4">Điểm tích lũy</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                          <span className="font-bold text-slate-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500">{u.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-sm tracking-wide ${
                            u.role === "ADMIN" ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">{u.impactHours} giờ</td>
                      <td className="p-4 font-semibold text-slate-800">{u.impactPoints} điểm</td>
                      <td className="p-4">
                        {u.isBanned ? (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-100 text-rose-800 rounded-sm">BỊ KHÓA</span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded-sm">HOẠT ĐỘNG</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {u.id === "user-admin" ? (
                          <span className="text-slate-400 font-bold italic text-[10px]">Tài khoản Root</span>
                        ) : u.isBanned ? (
                          <button
                            onClick={() => {
                              onToggleBanUser(u.id);
                              alert(`Đã mở khóa hoạt động cho thành viên "${u.name}"!`);
                            }}
                            className="text-emerald-600 font-bold hover:underline flex items-center gap-1 ml-auto text-[10px] cursor-pointer"
                          >
                            <Unlock className="w-3.5 h-3.5" /> Mở khóa
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              onToggleBanUser(u.id);
                              alert(`Đã khóa tài khoản thành viên "${u.name}" thành công!`);
                            }}
                            className="text-rose-600 font-bold hover:underline flex items-center gap-1 ml-auto text-[10px] cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" /> Khóa tài khoản
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
