import { Campaign } from "../types";
import { Heart, Calendar, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface CampaignCardProps {
  key?: string;
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
  onDonateClick: (campaign: Campaign) => void;
}

export default function CampaignCard({ campaign, onSelect, onDonateClick }: CampaignCardProps) {
  const percent = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const getStatusLabel = (status: Campaign["status"]) => {
    switch (status) {
      case "PENDING":
        return { label: "Đang chờ duyệt", color: "bg-amber-100 text-amber-800 border-amber-200" };
      case "ACTIVE":
        return { label: "Đang quyên góp", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "DISBURSING":
        return { label: "Đang giải ngân", color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "COMPLETED":
        return { label: "Đã hoàn thành", color: "bg-purple-100 text-purple-800 border-purple-200" };
      case "REJECTED":
        return { label: "Bị từ chối", color: "bg-rose-100 text-rose-800 border-rose-200" };
      case "CLOSED":
        return { label: "Đã đóng", color: "bg-slate-100 text-slate-800 border-slate-200" };
      default:
        return { label: "Hoạt động", color: "bg-slate-100 text-slate-800" };
    }
  };

  const statusObj = getStatusLabel(campaign.status);

  return (
    <motion.div
      initial={{ y: 15, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300"
    >
      {/* Image container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={campaign.image}
          alt={campaign.title}
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {/* Badges on top */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={`px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md border ${statusObj.color}`}>
            {statusObj.label}
          </span>
          <span className="px-2 py-1 text-[11px] font-bold bg-slate-900/70 text-white rounded-md backdrop-blur-xs flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Xác minh
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{campaign.creatorName}</span>
        <h3
          onClick={() => onSelect(campaign)}
          className="mt-1 font-bold text-slate-900 leading-snug line-clamp-2 text-base hover:text-emerald-600 cursor-pointer transition-colors min-h-[48px]"
        >
          {campaign.title}
        </h3>
        <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
          {campaign.shortDescription}
        </p>

        {/* Progress block */}
        <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
          <div className="flex items-end justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wide">Đã đạt được</span>
              <span className="text-base font-bold text-emerald-600">{formatCurrency(campaign.raisedAmount).replace(",00", "")}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-slate-800">{percent}%</span>
              <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wide">Mục tiêu: {formatCurrency(campaign.goalAmount).replace(",00", "").replace("₫", "đ")}</span>
            </div>
          </div>

          {/* Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${percent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-4 pt-3 flex items-center gap-2 border-t border-slate-50">
          <button
            onClick={() => onSelect(campaign)}
            className="flex-1 py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            Chi tiết
          </button>
          {campaign.status === "ACTIVE" && (
            <button
              onClick={() => onDonateClick(campaign)}
              className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-sm shadow-emerald-500/10 flex items-center justify-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 fill-current" /> Ủng hộ
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
