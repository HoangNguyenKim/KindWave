import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Heart, Shield, QrCode, ArrowRight, Download, EyeOff, User } from "lucide-react";
import { Campaign, Donation } from "../types";

interface DonationModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onDonationSuccess: (donation: Donation) => void;
}

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000];

export default function DonationModal({ campaign, isOpen, onClose, onDonationSuccess }: DonationModalProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<number>(200000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [comment, setComment] = useState("");
  const [donorName, setDonorName] = useState("Nguyễn Kim Hoàng");
  const [isPaying, setIsPaying] = useState(false);
  const [createdDonation, setCreatedDonation] = useState<Donation | null>(null);

  if (!isOpen) return null;

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomAmount(val);
    const parsed = parseInt(val.replace(/\D/g, ""), 10);
    setAmount(isNaN(parsed) ? 0 : parsed);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (amount < 10000) {
        alert("Số tiền quyên góp tối thiểu là 10.000 VNĐ");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Process pay
      setIsPaying(true);
      setTimeout(() => {
        const transCode = "TX" + Math.floor(100000000 + Math.random() * 900000000).toString() + "KW";
        const newDonation: Donation = {
          id: "don-" + Date.now(),
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          userId: "user-current",
          donorName: isAnonymous ? "Nhà hảo tâm ẩn danh" : donorName,
          amount: amount,
          isAnonymous: isAnonymous,
          status: "SUCCESS",
          dateCreated: new Date().toISOString().replace("T", " ").substring(0, 16),
          comment: comment.trim() || undefined,
          transactionCode: transCode,
        };

        setCreatedDonation(newDonation);
        setIsPaying(false);
        setStep(4);
        onDonationSuccess(newDonation);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg overflow-hidden bg-white shadow-xl rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-500 fill-emerald-500" />
            <h3 className="font-semibold text-slate-900">Quyên góp ủng hộ</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Campaign Info Summary */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Đang quyên góp cho</p>
          <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{campaign.title}</h4>
        </div>

        {/* Steps Tracker */}
        <div className="flex justify-between px-8 py-4 bg-white border-b border-slate-50 text-xs font-medium text-slate-400">
          <span className={step >= 1 ? "text-emerald-600 font-semibold" : ""}>1. Số tiền</span>
          <span className={step >= 2 ? "text-emerald-600 font-semibold" : ""}>2. Xác nhận</span>
          <span className={step >= 3 ? "text-emerald-600 font-semibold" : ""}>3. Thanh toán</span>
          <span className={step >= 4 ? "text-emerald-600 font-semibold" : ""}>4. Hoàn tất</span>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 10, opacity: 0 }}
                className="space-y-4"
              >
                <label className="block text-sm font-medium text-slate-700">Chọn số tiền quyên góp</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAmountSelect(val)}
                      className={`py-3 px-2 text-sm font-medium rounded-xl border transition-all ${
                        amount === val && !customAmount
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {formatCurrency(val).replace(",00", "")}
                    </button>
                  ))}
                  <div className="col-span-3 mt-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Nhập số tiền tùy chỉnh (VNĐ)"
                        value={customAmount}
                        onChange={(e) => {
                          const numericVal = e.target.value.replace(/\D/g, "");
                          const parsed = parseInt(numericVal, 10);
                          setAmount(isNaN(parsed) ? 0 : parsed);
                          if (!isNaN(parsed) && parsed > 0) {
                            setCustomAmount(new Intl.NumberFormat("vi-VN").format(parsed));
                          } else {
                            setCustomAmount("");
                          }
                        }}
                        className="w-full px-4 py-3 text-sm border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-12 font-bold text-slate-800"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">VNĐ</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-emerald-50/50 text-emerald-800 border border-emerald-100">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Quyên góp qua KindWave được ghi nhận trực tiếp trên Sổ cái, chống chỉnh sửa số liệu.</span>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 10, opacity: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Số tiền quyên góp:</span>
                    <span className="font-bold text-slate-900 text-lg">{formatCurrency(amount)}</span>
                  </div>
                  <hr className="border-slate-100" />
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Họ và tên người quyên góp</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled={isAnonymous}
                        value={isAnonymous ? "Nhà hảo tâm ẩn danh" : donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Anonymous Toggle */}
                {campaign.isAnonymousApproved && (
                  <label className="flex items-center justify-between p-3 border rounded-xl border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <EyeOff className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Quyên góp ẩn danh</p>
                        <p className="text-xs text-slate-500">Ẩn tên của bạn trên bảng vinh danh công khai</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                )}

                {/* Comment Box */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Lời chúc / Lời nhắn gửi</label>
                  <textarea
                    rows={2}
                    placeholder="Gửi lời động viên tới những hoàn cảnh khó khăn hoặc ban tổ chức..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 10, opacity: 0 }}
                className="space-y-4 text-center"
              >
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-2">
                  <p className="text-sm font-semibold text-slate-800">Mở ứng dụng ngân hàng và quét mã</p>
                  <p className="text-xs text-slate-500 mt-1">Hoặc chuyển khoản thủ công vào Số tài khoản: 0982361111 (MB Bank)</p>
                </div>
                <div className="flex justify-center">
                  <div className="p-4 bg-white border-2 border-emerald-500 rounded-2xl shadow-sm inline-block">
                    <img 
                      src={`https://img.vietqr.io/image/970436-0982361111-compact2.png?amount=${amount}&addInfo=Quyen%20gop%20tu%20thien&accountName=QUY%20KINDWAVE`} 
                      alt="VietQR" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  Hệ thống đang chờ nhận tiền...
                </div>
              </motion.div>
            )}

            {step === 4 && createdDonation && (
              <motion.div
                key="step3"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 mb-2">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Quyên góp thành công!</h4>
                  <p className="text-sm text-slate-500 mt-1">Cảm ơn tấm lòng vàng của bạn đã lan tỏa sự tử tế.</p>
                </div>

                {/* Receipt Preview Card */}
                <div className="p-6 border border-slate-150 rounded-xl bg-slate-50 text-left font-mono relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-bl-lg font-sans flex items-center gap-1">
                    <Shield className="w-3 h-3" /> CHỨNG NHẬN KHOÁ SỐ
                  </div>
                  <div className="border-b border-dashed border-slate-300 pb-3 mb-3">
                    <p className="text-xs text-slate-400">HÓA ĐƠN ĐIỆN TỬ KINDWAVE</p>
                    <p className="text-sm font-bold text-slate-800">Mã GD: {createdDonation.transactionCode}</p>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Người gửi:</span>
                      <span className="font-semibold text-slate-800">{createdDonation.donorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dự án:</span>
                      <span className="font-semibold text-slate-800 line-clamp-1 max-w-[240px]">{campaign.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thời gian:</span>
                      <span className="font-semibold text-slate-800">{createdDonation.dateCreated}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                      <span className="font-semibold text-slate-800">Số tiền:</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(createdDonation.amount)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-dashed border-slate-200">
                    <QrCode className="w-12 h-12 text-slate-800 stroke-[1.5]" />
                    <div className="text-[10px] text-slate-400 font-sans leading-tight">
                      <p className="font-bold text-slate-700">QR TRA CỨU SỔ CÁI</p>
                      <p>Mã hóa giao dịch này đã được ghi vĩnh viễn vào hệ thống sổ cái phi tập trung KindWave.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      // Mock PDF download
                      alert("Đang tải xuống Chứng nhận quyên góp dạng PDF thành công!");
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-xs"
                  >
                    <Download className="w-4 h-4" /> Tải chứng nhận (PDF)
                  </button>
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-500/10"
                  >
                    Hoàn thành
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        {step < 4 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
            <div className="text-left">
              <span className="text-xs text-slate-400 block">Tổng số tiền</span>
              <span className="text-base font-bold text-slate-800">{formatCurrency(amount)}</span>
            </div>
            <div className="flex gap-2">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Quay lại
                </button>
              )}
              <button
                onClick={handleNextStep}
                disabled={isPaying}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-500/10 active:scale-98 disabled:bg-emerald-300"
              >
                {isPaying ? (
                  <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {step === 3 ? "Giả lập chuyển khoản thành công" : step === 2 ? "Quét mã QR" : "Tiếp theo"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
