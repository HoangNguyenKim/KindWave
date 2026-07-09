import { useState, FormEvent } from "react";
import { Campaign, Donation, CampaignLedger, Disbursement, ImpactProof, CampaignCategory } from "../types";
import { motion } from "motion/react";
import { ShieldAlert, Heart, Calendar, Landmark, Trophy, FileCheck2, ArrowLeft, MessageSquare, ExternalLink, ShieldAlert as ReportIcon, Info } from "lucide-react";

interface CampaignDetailViewProps {
  campaign: Campaign;
  categories: CampaignCategory[];
  ledgers: CampaignLedger[];
  disbursements: Disbursement[];
  impactProofs: ImpactProof[];
  donations: Donation[];
  onBack: () => void;
  onDonateClick: (campaign: Campaign) => void;
  onSubmitReport: (reason: string, desc: string) => void;
}

export default function CampaignDetailView({
  campaign,
  categories,
  ledgers,
  disbursements,
  impactProofs,
  donations,
  onBack,
  onDonateClick,
  onSubmitReport
}: CampaignDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"desc" | "ledger" | "proofs" | "donors">("desc");
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("Sai lệch thông tin");
  const [reportDesc, setReportDesc] = useState("");

  const percent = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
  const categoryName = categories.find(c => c.id === campaign.categoryId)?.name || "Chung";

  const campaignLedgers = ledgers.filter(l => l.campaignId === campaign.id);
  const campaignDisb = disbursements.filter(d => d.campaignId === campaign.id);
  const campaignProofs = impactProofs.filter(p => p.campaignId === campaign.id && p.status === "APPROVED");
  const campaignDonations = donations.filter(d => d.campaignId === campaign.id && d.status === "SUCCESS");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const handleReportSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!reportDesc.trim()) {
      alert("Vui lòng điền nội dung báo cáo!");
      return;
    }
    onSubmitReport(reportReason, reportDesc.trim());
    setShowReportForm(false);
    setReportDesc("");
    alert("Báo cáo vi phạm đã được gửi tới Kiểm duyệt viên xem xét khẩn cấp!");
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </button>

      {/* Main Grid Banner Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Aspect Cover Image & Details */}
        <div className="md:col-span-2 space-y-4">
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 relative shadow-2xs">
            <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <span className="absolute top-3 left-3 px-3 py-1 bg-slate-900/80 text-white text-[10px] font-bold rounded-md tracking-wider backdrop-blur-xs uppercase">
              {categoryName}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">{campaign.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <p>Người tạo: <span className="font-semibold text-slate-700">{campaign.creatorName}</span></p>
              <span>•</span>
              <p>Bắt đầu: {campaign.dateCreated}</p>
              <span>•</span>
              <p>Mục tiêu thụ hưởng: <span className="font-semibold text-slate-700">{campaign.targetBeneficiary}</span></p>
            </div>
          </div>
        </div>

        {/* Right Sticky Goal Progress Panel */}
        <div className="p-5 bg-white border border-slate-150 rounded-2xl shadow-xs h-fit space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Tiến độ quyên góp</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-600 font-mono">{formatCurrency(campaign.raisedAmount).replace(",00", "")}</span>
              <span className="text-xs text-slate-400">/ {formatCurrency(campaign.goalAmount).replace(",00", "")}</span>
            </div>
          </div>

          {/* Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Đạt {percent}%</span>
              <span>Mục tiêu gây quỹ</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center py-2.5 border-y border-slate-100">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Người quyên góp</span>
              <span className="text-sm font-black text-slate-800 font-mono">{campaignDonations.length} lượt</span>
            </div>
            <div className="border-l border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Trạng thái</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm inline-block mt-0.5">
                {campaign.status === "ACTIVE" ? "Đang chạy" : campaign.status === "DISBURSING" ? "Giải ngân" : "Hoàn thành"}
              </span>
            </div>
          </div>

          {/* Action CTA buttons */}
          {campaign.status === "ACTIVE" && (
            <button
              onClick={() => onDonateClick(campaign)}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Heart className="w-4.5 h-4.5 fill-current text-white" /> Ủng hộ ngay dự án
            </button>
          )}

          {/* Trigger Report option */}
          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="w-full py-2 text-center text-xs font-semibold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <ReportIcon className="w-3.5 h-3.5" /> Báo cáo dự án vi phạm pháp luật
          </button>
        </div>

      </div>

      {/* Report Form Drawer if open */}
      {showReportForm && (
        <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl text-xs text-rose-800 space-y-3">
          <h4 className="font-bold flex items-center gap-1.5"><ReportIcon className="w-4.5 h-4.5" /> Gửi báo cáo vi phạm khẩn cấp</h4>
          <form onSubmit={handleReportSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1 text-slate-700">Lý do báo cáo</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white text-xs text-slate-700"
                >
                  <option value="Sai lệch thông tin">Sai lệch thông tin hoàn cảnh</option>
                  <option value="Có dấu hiệu lừa đảo">Có dấu hiệu lừa đảo trục lợi</option>
                  <option value="Hình ảnh giả mạo">Hình ảnh minh chứng giả mạo</option>
                  <option value="Khác">Khác (Nêu rõ ở dưới)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-bold mb-1 text-slate-700">Mô tả chi tiết bằng chứng vi phạm *</label>
              <textarea
                required
                rows={3}
                placeholder="Nhập chi tiết thông tin tố cáo..."
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white text-xs text-slate-700"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="py-1.5 px-3 bg-rose-600 text-white font-bold rounded-lg cursor-pointer hover:bg-rose-700">Gửi đơn tố cáo</button>
              <button type="button" onClick={() => setShowReportForm(false)} className="py-1.5 px-3 bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer">Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs description vs ledger vs proof vs donors */}
      <div className="flex gap-2 border-b border-slate-100 pt-4">
        <button
          onClick={() => setActiveTab("desc")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "desc" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Câu chuyện dự án
          {activeTab === "desc" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "ledger" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Sổ cái sao kê mở ({campaignLedgers.length})
          {activeTab === "ledger" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
        <button
          onClick={() => setActiveTab("proofs")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "proofs" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Báo cáo chứng từ tác động ({campaignProofs.length})
          {activeTab === "proofs" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
        <button
          onClick={() => setActiveTab("donors")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "donors" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Bình luận & Vinh danh ({campaignDonations.length})
          {activeTab === "donors" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 min-h-[300px]">
        
        {/* TAB 1: STORY / DESCRIPTION */}
        {activeTab === "desc" && (
          <article className="prose prose-slate max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed space-y-4">
            {campaign.description.split("\n\n").map((para, idx) => {
              if (para.startsWith("###")) {
                return (
                  <h3 key={idx} className="text-base font-extrabold text-slate-900 pt-3 border-b pb-1">
                    {para.replace("###", "").trim()}
                  </h3>
                );
              }
              if (para.startsWith("-") || para.startsWith("*")) {
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1">
                    {para.split("\n").map((li, lidx) => (
                      <li key={lidx}>{li.replace(/^[-\*]\s*/, "").replace(/\*\*/g, "").trim()}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={idx}>{para.replace(/\*\*/g, "")}</p>;
            })}
          </article>
        )}

        {/* TAB 2: LIVE OPEN LEDGER */}
        {activeTab === "ledger" && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50/50 text-emerald-800 border border-emerald-100 rounded-xl text-xs leading-relaxed flex items-start gap-1.5">
              <Info className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>Sổ cái (Ledger) mở ghi nhận đồng thời hai đầu: CREDIT (+) khi có người quyên góp tiền thành công, và DEBIT (-) khi chuyển tiền giải ngân có Ủy nhiệm chi.</span>
            </div>

            <div className="space-y-3">
              {campaignLedgers.map((entry) => (
                <div key={entry.id} className="flex gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                  <div className="p-2 rounded-lg bg-white shadow-3xs text-slate-600 h-8 w-8 flex items-center justify-center font-bold">
                    {entry.type === "CREDIT" ? "+" : "-"}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="font-bold text-slate-800">{entry.description}</p>
                    <p className="text-[10px] text-slate-400 font-mono">ID Giao dịch đối ứng: {entry.referenceId} | Số dư sau giao dịch: {formatCurrency(entry.balanceAfter)}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">{entry.dateCreated}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-black font-mono text-sm ${entry.type === "CREDIT" ? "text-emerald-600" : "text-rose-600"}`}>
                      {entry.type === "CREDIT" ? "+" : "-"}{formatCurrency(entry.amount).replace(",00", "")}
                    </span>
                  </div>
                </div>
              ))}
              {campaignLedgers.length === 0 && (
                <p className="text-center py-12 text-slate-400 italic">Chưa phát sinh bất kỳ dòng tiền nào trên sổ cái dự án.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: IMPACT PROOFS */}
        {activeTab === "proofs" && (
          <div className="space-y-6">
            <div className="p-3 bg-slate-50 border rounded-xl text-xs leading-relaxed text-slate-600">
              Đây là nơi lưu trữ bằng chứng mua sắm hàng hóa thực tế (Hóa đơn mua vật tư, thực phẩm cứu trợ...) do chủ dự án cung cấp và được ban quản trị thẩm định phê duyệt nghiêm ngặt.
            </div>

            {campaignProofs.map((proof) => (
              <div key={proof.id} className="p-5 border border-slate-150 rounded-2xl bg-slate-50/50 space-y-4 text-xs text-left">
                <div className="flex justify-between items-start gap-2 border-b pb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{proof.title}</h4>
                    <p className="text-[10px] text-slate-400">Nộp ngày: {proof.dateCreated} | Mã kiểm toán: {proof.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Tổng tiền thanh toán</span>
                    <span className="text-sm font-black text-slate-800 font-mono">{formatCurrency(proof.spentAmount)}</span>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed font-medium">{proof.content}</p>

                {proof.proofImages && proof.proofImages.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-bold text-slate-400 text-[10px] uppercase">Hình ảnh hóa đơn / Chứng từ gốc</span>
                    <div className="w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 aspect-video">
                      <img src={proof.proofImages[0]} alt="VAT Invoice Proof" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {campaignProofs.length === 0 && (
              <p className="text-center py-12 text-slate-400 italic">Dự án chưa có báo cáo giải ngân bằng chứng từ đợt nào.</p>
            )}
          </div>
        )}

        {/* TAB 4: COMMENTS & RECENT DONORS */}
        {activeTab === "donors" && (
          <div className="space-y-4">
            {campaignDonations.map((don) => (
              <div key={don.id} className="flex gap-3 text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <div className="p-2.5 rounded-full bg-emerald-50 text-emerald-600 h-9 w-9 flex items-center justify-center shrink-0">
                  <Heart className="w-4.5 h-4.5 fill-current" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{don.donorName}</span>
                    <span className="font-mono text-[9px] text-slate-400">GD: {don.transactionCode}</span>
                  </div>
                  {don.comment && (
                    <div className="p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-600 italic">
                      &ldquo;{don.comment}&rdquo;
                    </div>
                  )}
                  <p className="text-[9px] text-slate-400">{don.dateCreated}</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-600 font-mono">{formatCurrency(don.amount).replace(",00", "")}</span>
                </div>
              </div>
            ))}
            {campaignDonations.length === 0 && (
              <p className="text-center py-12 text-slate-400 italic">Chưa có lượt quyên góp vinh danh nào cho chiến dịch này.</p>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
