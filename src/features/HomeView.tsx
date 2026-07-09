import { useState } from "react";
import { Campaign, CampaignCategory, Donation } from "../types";
import CampaignCard from "../components/CampaignCard";
import { Search, Heart, Shield, Globe2, User, Landmark, HelpCircle, BadgeCheck, MessageSquare } from "lucide-react";
import { motion } from "motion/react";

interface HomeViewProps {
  campaigns: Campaign[];
  categories: CampaignCategory[];
  recentDonations: Donation[];
  onSelectCampaign: (campaign: Campaign) => void;
  onDonateClick: (campaign: Campaign) => void;
}

export default function HomeView({
  campaigns,
  categories,
  recentDonations,
  onSelectCampaign,
  onDonateClick
}: HomeViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const activeCampaigns = campaigns.filter(c => c.status === "ACTIVE" || c.status === "DISBURSING" || c.status === "COMPLETED");

  const filteredCampaigns = activeCampaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || c.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalRaised = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
  const totalDonationsCount = recentDonations.length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  return (
    <div className="space-y-12">
      {/* Hero Header Banner */}
      <section className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 sm:p-12 text-white">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <Shield className="w-3.5 h-3.5" /> NỀN TẢNG THIỆN NGUYỆN MINH BẠCH SỐ 1
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Lan tỏa yêu thương, <br />
            <span className="text-emerald-400">Xây dựng hy vọng</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-lg leading-relaxed">
            KindWave kết nối trực tiếp nhà hảo tâm và các hoàn cảnh khó khăn thông qua hệ thống sổ cái tài chính mở, đảm bảo từng đồng đóng góp đều đi đúng hướng và có báo cáo thực tế.
          </p>
        </div>

        {/* Live Ticker Metrics Panel */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 bg-black/20 rounded-2xl p-4">
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tổng tiền quyên góp</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1 block">
              {formatCurrency(totalRaised).replace(",00", "")}
            </span>
          </div>
          <div className="text-center sm:text-left border-l border-white/5 pl-2 sm:pl-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Lượt đóng góp</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono mt-1 block">
              {totalDonationsCount + 2450} lượt
            </span>
          </div>
          <div className="text-center sm:text-left border-l border-white/5 pl-2 sm:pl-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Dự án hành động</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono mt-1 block">
              {campaigns.length} dự án
            </span>
          </div>
          <div className="text-center sm:text-left border-l border-white/5 pl-2 sm:pl-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tình nguyện viên</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1 block">
              184 thành viên
            </span>
          </div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Minh bạch Sổ cái mở</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Mọi khoản đóng góp từ nhà hảo tâm đều được gán mã giao dịch duy nhất và ghi chép vào sổ cái công khai của chiến dịch, chống giả mạo số liệu tuyệt đối.
          </p>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Globe2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Hành trình Tình nguyện</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bên cạnh tài chính, bạn có thể tham gia trực tiếp đóng góp công sức, theo dõi lịch trình, tích luỹ điểm tác động và thăng hạng danh hiệu ý nghĩa.
          </p>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BadgeCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Giải ngân có đối soát</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Ban quản trị chỉ duyệt giải ngân đợt tiếp theo khi dự án cung cấp đủ hóa đơn, tài liệu minh chứng mua sắm thực tế ở đợt giải ngân trước đó.
          </p>
        </div>
      </section>

      {/* Campaigns Listing Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Chiến dịch đang gây quỹ</h2>
            <p className="text-xs text-slate-500 mt-0.5">Vui lòng chọn một chiến dịch để thẩm định thông tin và tham gia ủng hộ.</p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Tìm chiến dịch, tên quỹ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3.5 py-2 pl-9 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-50">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap cursor-pointer transition-all ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Tất cả danh mục
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === cat.id
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid List */}
        {filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((camp) => (
              <CampaignCard
                key={camp.id}
                campaign={camp}
                onSelect={onSelectCampaign}
                onDonateClick={onDonateClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 space-y-2">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Không tìm thấy chiến dịch phù hợp</p>
            <p className="text-xs text-slate-400">Vui lòng thử từ khóa tìm kiếm khác hoặc đổi danh mục dự án.</p>
          </div>
        )}
      </section>

      {/* Recent Activity Live Stream Ledger */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Public Ledger Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Sổ cái hoạt động gần đây
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Dòng chảy quyên góp cập nhật trực tiếp theo thời gian thực.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3.5 max-h-[380px] overflow-y-auto">
            {recentDonations.map((don) => (
              <div key={don.id} className="flex gap-3 text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 h-10 w-10 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 fill-current" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{don.donorName}</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-sm">TX: {don.transactionCode}</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed">
                    Ủng hộ dự án <span className="font-semibold text-slate-700">{don.campaignTitle}</span>
                  </p>
                  {don.comment && (
                    <div className="p-2 bg-slate-50/70 border border-slate-100 rounded-lg text-slate-500 italic text-[11px] mt-1.5 flex items-start gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span>&ldquo;{don.comment}&rdquo;</span>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 pt-1">{don.dateCreated}</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-600 font-mono text-sm">+{formatCurrency(don.amount).replace(",00", "")}</span>
                  <span className="text-[9px] text-slate-400 block tracking-wider font-bold">SUCCESS</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why trust KindWave panel */}
        <div className="bg-emerald-500 text-white rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between relative overflow-hidden shadow-md">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="space-y-4 z-10">
            <h3 className="text-lg font-bold tracking-tight">KindWave hoạt động như thế nào?</h3>
            <div className="space-y-4 text-xs text-white/95">
              <div className="flex gap-3">
                <div className="p-2 bg-white/10 rounded-lg h-8 w-8 flex items-center justify-center shrink-0">1</div>
                <div>
                  <p className="font-bold">Hội nhóm nộp dự án</p>
                  <p className="text-emerald-100/90 leading-relaxed mt-0.5">Người đại diện nộp giấy tờ tổ chức và kế hoạch chi tiết.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 bg-white/10 rounded-lg h-8 w-8 flex items-center justify-center shrink-0">2</div>
                <div>
                  <p className="font-bold">Đóng góp và Kiểm chứng</p>
                  <p className="text-emerald-100/90 leading-relaxed mt-0.5">Tiền quyên góp gán ID, theo dõi thời gian thực trên Sổ cái mở công khai.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 bg-white/10 rounded-lg h-8 w-8 flex items-center justify-center shrink-0">3</div>
                <div>
                  <p className="font-bold">Giải ngân & Chứng từ thực</p>
                  <p className="text-emerald-100/90 leading-relaxed mt-0.5">Giải ngân chuyển đợt tiếp theo chỉ sau khi hóa đơn đợt trước được duyệt.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="z-10 pt-4 border-t border-white/10 text-center text-xs">
            <span className="font-mono text-emerald-100 font-bold">MÃ NGUỒN MỞ & PHI LỢI NHUẬN</span>
          </div>
        </div>

      </section>

    </div>
  );
}
