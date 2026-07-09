import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ArrowLeft, Check, Sparkles, FileText, Image as ImageIcon, HeartHandshake, ShieldAlert } from "lucide-react";
import { Campaign, CampaignCategory } from "../types";

interface CampaignWizardProps {
  categories: CampaignCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (campaignData: Partial<Campaign>) => void;
  addToast: (type: "success" | "error" | "warning" | "info", title: string, message: string) => void;
}

const SAMPLE_COVERS = [
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800"
];

export default function CampaignWizard({ categories, isOpen, onClose, onSubmit, addToast }: CampaignWizardProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [goalAmount, setGoalAmount] = useState<number>(100000000);
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [targetBeneficiary, setTargetBeneficiary] = useState("");
  const [image, setImage] = useState(SAMPLE_COVERS[0]);
  const [isAnonymousApproved, setIsAnonymousApproved] = useState(true);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1) {
      if (!title.trim() || goalAmount <= 0 || !targetBeneficiary.trim()) {
        addToast("warning", "Thiếu thông tin", "Vui lòng điền đầy đủ các thông tin bắt buộc!");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!shortDescription.trim() || !description.trim()) {
        addToast("warning", "Thiếu thông tin", "Vui lòng nhập mô tả ngắn và nội dung chi tiết chiến dịch!");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      // Create campaign draft
      const campaignData: Partial<Campaign> = {
        title: title.trim(),
        categoryId,
        goalAmount,
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        targetBeneficiary: targetBeneficiary.trim(),
        image,
        isAnonymousApproved,
        status: "PENDING" // Starts pending review by moderators
      };
      onSubmit(campaignData);
      onClose();
      // Reset
      setStep(1);
      setTitle("");
      setCategoryId(categories[0]?.id || "");
      setGoalAmount(100000000);
      setShortDescription("");
      setDescription("");
      setTargetBeneficiary("");
      setImage(SAMPLE_COVERS[0]);
      setIsAnonymousApproved(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const numberToVietnameseWords = (amount: number): string => {
    if (!amount || amount === 0) return "Không đồng";
    const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const readGroup = (group: number, isFirstGroup: boolean): string => {
      let res = "";
      const h = Math.floor(group / 100);
      const m = group % 100;
      const t = Math.floor(m / 10);
      const u = m % 10;
      
      if (h > 0 || !isFirstGroup) res += (h > 0 ? units[h] : "không") + " trăm ";
      
      if (t > 1) {
        res += units[t] + " mươi ";
        if (u === 1) res += "mốt ";
        else if (u === 5) res += "lăm ";
        else if (u > 0) res += units[u] + " ";
      } else if (t === 1) {
        res += "mười ";
        if (u === 5) res += "lăm ";
        else if (u > 0) res += units[u] + " ";
      } else if (t === 0 && u > 0) {
        if (h > 0 || !isFirstGroup) res += "lẻ ";
        res += units[u] + " ";
      }
      return res.trim();
    };

    const scales = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
    let result = "";
    let scaleIndex = 0;
    let temp = amount;

    while (temp > 0) {
      const group = temp % 1000;
      if (group > 0 || (temp > 0 && scaleIndex === 3)) { // always read "tỷ" if amount >= 1 billion
        if (group > 0) {
          const isFirstGroup = (Math.floor(amount / Math.pow(1000, scaleIndex)) === group);
          let groupStr = readGroup(group, isFirstGroup);
          // clean up leading "không trăm lẻ" for the absolute first group
          if (isFirstGroup) {
            groupStr = groupStr.replace(/^không trăm (lẻ )?/, "");
          }
          if (groupStr) {
            result = groupStr + " " + scales[scaleIndex] + " " + result;
          }
        } else if (scaleIndex === 3) {
           result = scales[scaleIndex] + " " + result;
        }
      }
      temp = Math.floor(temp / 1000);
      scaleIndex++;
    }

    result = result.replace(/\s+/g, ' ').trim() + " đồng";
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-white shadow-xl rounded-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-900">Khởi tạo Chiến dịch Gây quỹ</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Progress Stepper */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between max-w-md mx-auto relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 -z-1" />
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === num
                    ? "bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-50"
                    : step > num
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {step > num ? <Check className="w-4 h-4" /> : num}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto text-[10px] font-bold text-slate-400 mt-2">
            <span className={step >= 1 ? "text-emerald-600" : ""}>1. CƠ BẢN</span>
            <span className={step >= 2 ? "text-emerald-600" : ""}>2. CHI TIẾT</span>
            <span className={step >= 3 ? "text-emerald-600" : ""}>3. HÌNH ẢNH</span>
            <span className={step >= 4 ? "text-emerald-600" : ""}>4. XÁC NHẬN</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 10, opacity: 0 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tên chiến dịch gây quỹ *</label>
                  <input
                    type="text"
                    placeholder="VD: Xây trường học vùng cao Hà Giang, Mổ tim cho trẻ em..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục dự án</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 font-medium"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Số tiền mục tiêu (VNĐ) *</label>
                    <input
                      type="text"
                      value={goalAmount > 0 ? new Intl.NumberFormat("vi-VN").format(goalAmount) : ""}
                      onChange={(e) => {
                        const numericVal = e.target.value.replace(/\D/g, '');
                        setGoalAmount(numericVal ? parseInt(numericVal, 10) : 0);
                      }}
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-600"
                      placeholder="0"
                    />
                    {goalAmount > 0 && (
                      <span className="text-[11px] font-bold text-slate-500 block mt-1 ml-1 capitalize">
                        {numberToVietnameseWords(goalAmount)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Đối tượng thụ hưởng *</label>
                  <input
                    type="text"
                    placeholder="VD: Học sinh nghèo xã Lũng Pù, 1000 hộ dân vùng lũ..."
                    value={targetBeneficiary}
                    onChange={(e) => setTargetBeneficiary(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
                  />
                </div>

                <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-600">
                  <HeartHandshake className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800 mb-0.5">Tiêu chuẩn minh bạch</p>
                    <p>Mỗi chiến dịch gây quỹ tại KindWave đều được ràng buộc pháp lý chặt chẽ. Tiền quyên góp được giữ an toàn và chỉ giải ngân theo từng đợt có xác minh chứng từ cụ thể.</p>
                  </div>
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
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả ngắn gọn (Thẻ hiển thị) *</label>
                  <input
                    type="text"
                    maxLength={150}
                    placeholder="Mô tả ngắn gọn cốt lõi dự án dưới 150 ký tự..."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
                  />
                  <span className="text-[10px] text-slate-400 block text-right">
                    {shortDescription.length}/150 ký tự
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nội dung chi tiết chiến dịch *</label>
                  <textarea
                    rows={6}
                    placeholder="Viết chi tiết kế hoạch hành động, mục đích sử dụng dòng tiền, tính khẩn cấp của hoàn cảnh..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
                  />
                  <span className="text-[10px] text-slate-400 block">Hỗ trợ định dạng văn bản thô hoặc Markdown cơ bản.</span>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 10, opacity: 0 }}
                className="space-y-4"
              >
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Chọn ảnh bìa đại diện</label>
                <div className="grid grid-cols-2 gap-3">
                  {SAMPLE_COVERS.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => setImage(url)}
                      className={`relative aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        image === url ? "border-emerald-500 scale-[1.02] shadow-sm" : "border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <img src={url} alt="Cover option" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                      {image === url && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  ))}
                  {!SAMPLE_COVERS.includes(image) && (
                    <div
                      onClick={() => setImage(image)}
                      className="relative aspect-video rounded-xl overflow-hidden border-2 border-emerald-500 scale-[1.02] shadow-sm cursor-pointer transition-all"
                    >
                      <img src={image} alt="Custom Cover" className="object-cover w-full h-full" />
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tải lên ảnh tùy chỉnh (Tùy chọn)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer"
                  />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b pb-2">Xác nhận và Cam kết</h4>
                
                <div className="p-4 rounded-xl border border-slate-150 bg-slate-50 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Dự án:</span>
                    <span className="font-bold text-slate-800 text-right max-w-[280px] line-clamp-1">{title}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Đối tượng:</span>
                    <span className="font-semibold text-slate-700">{targetBeneficiary}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Ngân sách mục tiêu:</span>
                    <span className="font-bold text-emerald-600 text-sm">{formatCurrency(goalAmount)}</span>
                  </div>
                </div>

                {/* Terms toggle */}
                <label className="flex items-start gap-3 p-3.5 border rounded-xl border-emerald-100 bg-emerald-50/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymousApproved}
                    onChange={(e) => setIsAnonymousApproved(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-1"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Chấp nhận quyên góp ẩn danh</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">Tôi đồng ý cho phép các nhà hảo tâm quyên góp ở chế độ ẩn danh (thông tin định danh của họ vẫn được ghi lại trên sổ cái an toàn nhưng sẽ ẩn danh đối với công chúng).</p>
                  </div>
                </label>

                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-0.5">Cam kết pháp lý & Đạo đức</p>
                    <p className="leading-relaxed">Tôi cam kết mọi nội dung cung cấp là sự thật, không phóng đại hoặc làm giả hoàn cảnh. Tôi cam kết chịu hoàn toàn trách nhiệm trước pháp luật Việt Nam nếu có hành vi lừa đảo hoặc trục lợi từ chiến dịch gây quỹ này.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
            className="flex items-center gap-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-5 py-2.5 text-sm font-bold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-500/10 active:scale-98"
          >
            {step === 4 ? "Gửi duyệt chiến dịch" : "Tiếp tục"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
