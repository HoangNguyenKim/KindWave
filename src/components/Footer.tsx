import { Heart, Github, Globe, ShieldAlert, HeartHandshake } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500">
                <Heart className="w-4.5 h-4.5 fill-current text-white" />
              </div>
              <span className="text-base font-black tracking-tight">Kind<span className="text-emerald-400">Wave</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nền tảng gây quỹ từ thiện cộng đồng, bảo trợ và kết nối minh bạch 100% bằng công nghệ Sổ cái (Ledger) phi lợi nhuận tại Việt Nam.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Trụ cột minh bạch</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Sổ cái giao dịch thời gian thực
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Giải ngân có đối soát hóa đơn
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Vetting pháp lý 3 lớp
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hỗ trợ cộng đồng</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white transition-colors cursor-pointer">Hướng dẫn quyên góp</li>
              <li className="hover:text-white transition-colors cursor-pointer">Dành cho Tình nguyện viên</li>
              <li className="hover:text-white transition-colors cursor-pointer">Cẩm nang Vận động tài trợ</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cam kết pháp lý</h4>
            <div className="flex items-start gap-2 p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-[11px] leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>KindWave cam kết không giữ bất kỳ khoản lãi phát sinh nào từ dòng tiền quyên góp tạm lưu giữ.</span>
            </div>
          </div>
        </div>

        <hr className="my-8 border-slate-800" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 KindWave Project. Phát triển phục vụ cộng đồng theo tinh thần minh bạch tài chính.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Github className="w-4 h-4 hover:text-white cursor-pointer" />
            <Globe className="w-4 h-4 hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
