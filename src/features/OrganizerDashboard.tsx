import { useState, FormEvent } from "react";
import { Campaign, Donation, CampaignLedger, Disbursement, ImpactProof } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Landmark, History, FileText, CheckCircle2, AlertCircle, X, Shield, ArrowUpRight, ArrowDownLeft, Upload, Image as ImageIcon } from "lucide-react";

interface OrganizerDashboardProps {
  myCampaigns: Campaign[];
  ledgers: CampaignLedger[];
  disbursements: Disbursement[];
  impactProofs: ImpactProof[];
  onOpenWizard: () => void;
  onRequestDisbursement: (disb: Disbursement) => void;
  onSubmitImpactProof: (proof: ImpactProof) => void;
}

export default function OrganizerDashboard({
  myCampaigns,
  ledgers,
  disbursements,
  impactProofs,
  onOpenWizard,
  onRequestDisbursement,
  onSubmitImpactProof
}: OrganizerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"campaigns" | "disbursements" | "ledger">("campaigns");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isRequestingDisb, setIsRequestingDisb] = useState(false);
  const [disbAmount, setDisbAmount] = useState(50000000);
  const [disbDesc, setDisbDesc] = useState("");
  
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofTitle, setProofTitle] = useState("");
  const [proofContent, setProofContent] = useState("");
  const [proofImage, setProofImage] = useState("");
  const [isUploadingProofImage, setIsUploadingProofImage] = useState(false);

  const handleProofImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingProofImage(true);
      const formData = new FormData();
      formData.append("image", file);
      try {
        const res = await fetch("/api/images/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setProofImage(data.url);
        } else {
          alert("Tải ảnh thất bại");
        }
      } catch (error) {
        alert("Lỗi kết nối khi tải ảnh");
      } finally {
        setIsUploadingProofImage(false);
      }
    }
  };
  const [spentAmount, setSpentAmount] = useState(50000000);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const handleRequestDisbSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    // Check disbursement lock rule: "Không cho tạo tiếp giải ngân đợt mới nếu đợt cũ chưa được nộp/duyệt chứng từ"
    const relatedDisb = disbursements.filter(d => d.campaignId === selectedCampaign.id);
    const hasUnresolvedDisb = relatedDisb.some(d => d.status === "PENDING");
    if (hasUnresolvedDisb) {
      alert("Bạn có yêu cầu giải ngân đang chờ xử lý! Vui lòng đợi ban quản trị duyệt yêu cầu trước.");
      return;
    }

    const unprovidedProofDisbs = relatedDisb.filter(d => d.status === "APPROVED");
    const correspondingProofs = impactProofs.filter(p => p.campaignId === selectedCampaign.id && p.status === "APPROVED");
    if (unprovidedProofDisbs.length > correspondingProofs.length) {
      alert("Khóa giải ngân kích hoạt! Bạn cần nộp và được phê duyệt Bằng chứng Tác động (Impact Proof) cho đợt giải ngân trước đó trước khi yêu cầu đợt mới.");
      return;
    }

    const maxDisbursable = selectedCampaign.raisedAmount - relatedDisb.reduce((acc, curr) => curr.status === "APPROVED" ? acc + curr.totalAmount : acc, 0);
    if (disbAmount > maxDisbursable) {
      alert(`Số dư khả dụng để rút giải ngân hiện tại là ${formatCurrency(maxDisbursable)}. Không thể vượt quá số tiền này.`);
      return;
    }

    const newDisb: Disbursement = {
      id: "disb-" + Date.now(),
      campaignId: selectedCampaign.id,
      scheduledDate: new Date().toISOString().substring(0, 10),
      totalAmount: disbAmount,
      bankingProofUrl: "", // Admin will upload this banking proof later
      status: "PENDING",
      description: disbDesc.trim() || `Yêu cầu giải ngân đợt ${relatedDisb.length + 1}`
    };

    onRequestDisbursement(newDisb);
    setIsRequestingDisb(false);
    setDisbDesc("");
    alert("Gửi yêu cầu giải ngân thành công! Thủ quỹ sẽ xử lý và chuyển khoản cho bạn.");
  };

  const handleProofSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    const newProof: ImpactProof = {
      id: "proof-" + Date.now(),
      campaignId: selectedCampaign.id,
      title: proofTitle.trim(),
      content: proofContent.trim(),
      proofImages: [proofImage],
      spentAmount: spentAmount,
      status: "PENDING",
      dateCreated: new Date().toISOString().substring(0, 10)
    };

    onSubmitImpactProof(newProof);
    setIsSubmittingProof(false);
    setProofTitle("");
    setProofContent("");
    alert("Nộp Bằng chứng Tác động thành công! Đang chờ Kiểm duyệt viên thẩm định chứng từ.");
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Head */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Campaign Suite & Sổ cái</h2>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý dự án, nộp báo cáo chứng từ và yêu cầu rút quỹ giải ngân hỗ trợ.</p>
        </div>
        <button
          onClick={onOpenWizard}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-sm shadow-emerald-500/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Khởi tạo Dự án mới
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-slate-100">
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "campaigns" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Chiến dịch sở hữu ({myCampaigns.length})
          {activeTab === "campaigns" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
        <button
          onClick={() => setActiveTab("disbursements")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "disbursements" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Phiếu giải ngân ({disbursements.length})
          {activeTab === "disbursements" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "ledger" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Lịch sử Sổ cái dự án
          {activeTab === "ledger" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
      </div>

      {/* Main Container */}
      <div className="space-y-6">
        
        {/* TAB 1: Campaigns owned list */}
        {activeTab === "campaigns" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myCampaigns.length > 0 ? (
              myCampaigns.map((camp) => {
                const percent = Math.min(100, Math.round((camp.raisedAmount / camp.goalAmount) * 100));
                const relatedDisbList = disbursements.filter(d => d.campaignId === camp.id && d.status === "APPROVED");
                const totalDisbursed = relatedDisbList.reduce((acc, curr) => acc + curr.totalAmount, 0);

                return (
                  <div key={camp.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold rounded-sm uppercase tracking-wider">
                          {camp.status === "PENDING" ? "Chờ duyệt" : camp.status === "ACTIVE" ? "Đang quyên góp" : "Đang giải ngân"}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm mt-1 line-clamp-1">{camp.title}</h3>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        Đã đạt {percent}%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Mục tiêu</span>
                        <span className="text-xs font-extrabold text-slate-800">{formatCurrency(camp.goalAmount).replace(",00", "")}</span>
                      </div>
                      <div className="border-l border-slate-150">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Đã nhận</span>
                        <span className="text-xs font-extrabold text-slate-800">{formatCurrency(camp.raisedAmount).replace(",00", "")}</span>
                      </div>
                      <div className="border-l border-slate-150">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Đã giải ngân</span>
                        <span className="text-xs font-extrabold text-emerald-600">{formatCurrency(totalDisbursed).replace(",00", "")}</span>
                      </div>
                    </div>

                    {/* Action controls */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setSelectedCampaign(camp);
                          setIsRequestingDisb(true);
                        }}
                        disabled={camp.status === "PENDING" || camp.raisedAmount === 0}
                        className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Landmark className="w-3.5 h-3.5" /> Yêu cầu giải ngân
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCampaign(camp);
                          setIsSubmittingProof(true);
                        }}
                        disabled={camp.status === "PENDING" || totalDisbursed === 0}
                        className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-100 disabled:bg-slate-100 disabled:text-slate-400 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" /> Nộp chứng từ tác động
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-100 space-y-2">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Bạn chưa khởi tạo chiến dịch nào</p>
                <p className="text-[10px] text-slate-400">Khởi tạo chiến dịch ngay hôm nay để kêu gọi gây quỹ cứu trợ từ cộng đồng.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Disbursement Slips List */}
        {activeTab === "disbursements" && (
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Mã giải ngân</th>
                    <th className="p-4">Dự án</th>
                    <th className="p-4">Ngày yêu cầu</th>
                    <th className="p-4">Số tiền rút</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Chứng từ ủy nhiệm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {disbursements.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-800">{d.id}</td>
                      <td className="p-4 max-w-[200px] truncate font-medium">
                        {myCampaigns.find(c => c.id === d.campaignId)?.title || "Dự án liên quan"}
                      </td>
                      <td className="p-4 text-slate-500">{d.scheduledDate}</td>
                      <td className="p-4 font-extrabold text-slate-900 font-mono">{formatCurrency(d.totalAmount)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-sm uppercase tracking-wider ${
                          d.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : d.status === "REJECTED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {d.status === "APPROVED" ? "Đã duyệt" : d.status === "REJECTED" ? "Từ chối" : "Chờ xử lý"}
                        </span>
                      </td>
                      <td className="p-4">
                        {d.bankingProofUrl ? (
                          <a
                            href={d.bankingProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-500 font-bold hover:underline flex items-center gap-1 text-[10px]"
                          >
                            <FileText className="w-3.5 h-3.5" /> Xem UNC
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">Chưa giải ngân</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {disbursements.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 italic">Chưa có phiếu yêu cầu giải ngân nào được khởi tạo.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Ledgers overview */}
        {activeTab === "ledger" && (
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Khảo sát Sổ cái của chiến dịch của tôi</h3>
              <p className="text-[11px] text-slate-400">Kiểm chứng toàn bộ lịch sử cộng tiền (Donation) và trừ tiền (Disbursement).</p>
            </div>

            <div className="space-y-3">
              {ledgers
                .filter(entry => myCampaigns.some(c => c.id === entry.campaignId))
                .map((entry) => (
                  <div key={entry.id} className="flex gap-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-xs hover:bg-slate-50 transition-colors">
                    {entry.type === "CREDIT" ? (
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 h-8 w-8 flex items-center justify-center shrink-0">
                        <ArrowDownLeft className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-rose-50 text-rose-600 h-8 w-8 flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-800">{entry.description}</span>
                        <span className="font-mono text-[10px] text-slate-400">REF: {entry.referenceId}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Dự án: {myCampaigns.find(c => c.id === entry.campaignId)?.title || "Dự án"} | Số dư sau GD: {formatCurrency(entry.balanceAfter)}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{entry.dateCreated}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-extrabold font-mono text-sm ${entry.type === "CREDIT" ? "text-emerald-600" : "text-rose-600"}`}>
                        {entry.type === "CREDIT" ? "+" : "-"}{formatCurrency(entry.amount).replace(",00", "")}
                      </span>
                    </div>
                  </div>
                ))}
              {ledgers.filter(entry => myCampaigns.some(c => c.id === entry.campaignId)).length === 0 && (
                <p className="text-center py-8 text-slate-400 italic">Chưa phát sinh dòng tiền nào trên sổ cái dự án của bạn.</p>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Modal Request Disbursement */}
      <AnimatePresence>
        {isRequestingDisb && selectedCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl space-y-4"
            >
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-900 text-sm">Yêu cầu Giải ngân</h3>
                <button onClick={() => setIsRequestingDisb(false)} className="p-1 rounded-lg hover:bg-slate-50 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] leading-relaxed border border-emerald-100 flex items-start gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Số dư khả dụng hiện tại: <strong>{formatCurrency(selectedCampaign.raisedAmount)}</strong>. Mọi giao dịch trừ tiền giải ngân được công khai minh bạch.</span>
              </div>

              <form onSubmit={handleRequestDisbSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Số tiền muốn giải ngân (VNĐ)</label>
                  <input
                    type="text"
                    required
                    value={disbAmount > 0 ? new Intl.NumberFormat("vi-VN").format(disbAmount) : ""}
                    onChange={(e) => {
                      const numericVal = e.target.value.replace(/\D/g, "");
                      setDisbAmount(numericVal ? parseInt(numericVal, 10) : 0);
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
                    placeholder="Nhập số tiền..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Mục đích giải ngân / Ghi chú</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="VD: Chi trả đợt 1 mua sắt thép xây móng trường, Mua 500 thùng mì ăn liền cứu trợ..."
                    value={disbDesc}
                    onChange={(e) => setDisbDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Gửi yêu cầu giải ngân ngay
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Submit Impact Proof */}
      <AnimatePresence>
        {isSubmittingProof && selectedCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl space-y-4"
            >
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-900 text-sm">Nộp Bằng chứng Tác động</h3>
                <button onClick={() => setIsSubmittingProof(false)} className="p-1 rounded-lg hover:bg-slate-50 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 text-slate-600 rounded-xl text-[11px] leading-relaxed border border-slate-150">
                Hãy tải lên hình ảnh biên lai mua hàng, hóa đơn đỏ VAT, hoặc ảnh hiện trường thực tế để báo cáo về số tiền đã giải ngân ở đợt trước đó.
              </div>

              <form onSubmit={handleProofSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tiêu đề bằng chứng</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Hóa đơn đỏ VAT mua xi măng đợt 1, Biên bản giao mì gói..."
                    value={proofTitle}
                    onChange={(e) => setProofTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Số tiền thực tế đã chi tiêu (VNĐ)</label>
                  <input
                    type="text"
                    required
                    value={spentAmount > 0 ? new Intl.NumberFormat("vi-VN").format(spentAmount) : ""}
                    onChange={(e) => {
                      const numericVal = e.target.value.replace(/\D/g, "");
                      setSpentAmount(numericVal ? parseInt(numericVal, 10) : 0);
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    placeholder="Nhập số tiền..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nội dung giải trình báo cáo chi tiết</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Mô tả cụ thể số lượng vật tư, địa điểm phân phát và những kết quả ban đầu đạt được..."
                    value={proofContent}
                    onChange={(e) => setProofContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Hình ảnh chứng từ đính kèm</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProofImageUpload}
                      disabled={isUploadingProofImage}
                      className="flex-1 text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer disabled:opacity-50"
                    />
                    {proofImage && (
                      <div className="w-10 h-10 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center text-slate-400">
                        <img src={proofImage} alt="Proof" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  {isUploadingProofImage && <p className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1">Đang tải ảnh lên...</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Nộp báo cáo chứng từ ngay
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
