import { Donation } from "../types";
import { Download, Landmark, Heart, Shield, QrCode } from "lucide-react";

interface DonorDashboardProps {
  myDonations: Donation[];
}

export default function DonorDashboard({ myDonations }: DonorDashboardProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const totalGave = myDonations.reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Overview */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cổng Nhà hảo tâm cá nhân</h2>
          <p className="text-xs text-slate-500 mt-0.5">Truy lục hóa đơn quyên góp điện tử được niêm phong sổ cái bảo mật.</p>
        </div>
        
        {/* Total contribution */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center sm:text-right w-full sm:w-auto min-w-[200px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tổng tiền đã đóng góp</span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-0.5 block">{formatCurrency(totalGave)}</span>
        </div>
      </div>

      {/* History Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Sao kê lịch sử quyên góp cá nhân</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myDonations.map((don) => (
            <div key={don.id} className="p-5 border border-slate-150 rounded-2xl bg-white space-y-4 relative overflow-hidden flex flex-col justify-between">
              
              <div className="absolute top-0 right-0 p-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-bl-lg flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> NIÊM PHONG SỔ CÁI
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase block">Giao dịch: {don.transactionCode}</span>
                <h4 className="font-bold text-slate-800 text-xs leading-snug line-clamp-1">{don.campaignTitle}</h4>
                <p className="text-[10px] text-slate-400">Thời gian quyên góp: {don.dateCreated}</p>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-end">
                <div>
                  <span className="text-[9px] font-semibold text-slate-400 block uppercase">Số tiền</span>
                  <span className="text-base font-extrabold text-slate-800 font-mono">{formatCurrency(don.amount)}</span>
                </div>
                <button
                  onClick={() => {
                    alert("Đang xuất biên nhận PDF quyên góp cá nhân có chứng thực chữ ký số thành công!");
                  }}
                  className="py-1.5 px-3 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Tải chứng nhận
                </button>
              </div>

            </div>
          ))}

          {myDonations.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-100 space-y-1">
              <Heart className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Bạn chưa thực hiện khoản quyên góp nào</p>
              <p className="text-[10px] text-slate-400">Hãy chọn một chiến dịch trên trang chủ để chung tay đóng góp.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
