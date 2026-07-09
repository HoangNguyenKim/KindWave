import { useState, FormEvent } from "react";
import { VolunteerJob, VolunteerApplication, User } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, MapPin, Award, Clock, FileText, CheckCircle2, Trophy, HelpCircle, Eye, AlertCircle, Sparkles } from "lucide-react";

interface VolunteerHubProps {
  currentUser: User;
  jobs: VolunteerJob[];
  applications: VolunteerApplication[];
  onApply: (app: VolunteerApplication) => void;
  onUpdateUserMetrics: (points: number, hours: number, badge?: string) => void;
}

export default function VolunteerHub({
  currentUser,
  jobs,
  applications,
  onApply,
  onUpdateUserMetrics
}: VolunteerHubProps) {
  const [selectedJob, setSelectedJob] = useState<VolunteerJob | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [skills, setSkills] = useState("");
  const [availability, setAvailability] = useState("");

  const handleApplySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    const newApp: VolunteerApplication = {
      id: "app-" + Date.now(),
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      skills: skills.trim(),
      availability: availability.trim(),
      status: "PENDING",
      dateCreated: new Date().toISOString().substring(0, 10),
    };

    onApply(newApp);
    setIsApplying(false);
    setSkills("");
    setAvailability("");
    alert(`Đăng ký ứng tuyển vị trí "${selectedJob.title}" thành công! Đơn đăng ký của bạn đang chờ phê duyệt.`);
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "Đại sứ Hy vọng":
        return <Trophy className="w-5 h-5 text-amber-500 fill-amber-100" />;
      case "Chiến binh Xanh":
        return <Award className="w-5 h-5 text-emerald-500 fill-emerald-100" />;
      case "Người xây dựng cộng đồng":
        return <Award className="w-5 h-5 text-purple-500 fill-purple-100" />;
      default:
        return <Award className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Metrics & Badges Overview Panel */}
      <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Track Points */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="p-3.5 rounded-xl bg-emerald-500 text-white">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Điểm tác động (Impact Points)</span>
            <span className="text-2xl font-black text-slate-800 font-mono mt-0.5 block">{currentUser.impactPoints} điểm</span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" /> Thăng hạng vinh danh kế tiếp
            </span>
          </div>
        </div>

        {/* Track Hours */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="p-3.5 rounded-xl bg-blue-500 text-white">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Giờ đóng góp xã hội</span>
            <span className="text-2xl font-black text-slate-800 font-mono mt-0.5 block">{currentUser.impactHours} giờ</span>
            <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">Ghi nhận minh bạch trên hệ thống</span>
          </div>
        </div>

        {/* Badges List */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Huy hiệu đã đạt (Gamification)</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {currentUser.badges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-slate-150 shadow-3xs">
                {getBadgeIcon(badge)}
                <span className="text-[10px] font-bold text-slate-700">{badge}</span>
              </div>
            ))}
            {currentUser.badges.length === 0 && (
              <span className="text-xs text-slate-400 italic">Chưa có huy hiệu nào. Hãy đăng ký tham gia ngay!</span>
            )}
          </div>
        </div>

      </section>

      {/* Volunteer Opportunities & Applications Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Jobs Feed list */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cơ hội tình nguyện hành động</h2>
            <p className="text-xs text-slate-500 mt-0.5">Tham gia cống hiến kỹ năng và sức trẻ vào các dự án cứu trợ và trồng cây xanh bền vững.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => {
              const applied = applications.find(app => app.jobId === job.id);
              return (
                <div key={job.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <img src={job.image} alt={job.title} className="aspect-video w-full object-cover" referrerPolicy="no-referrer" />
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold rounded-sm uppercase tracking-wider">
                          +{job.pointsReward} Điểm tác động
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5" /> {job.hoursEarned} giờ
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 leading-tight text-sm line-clamp-1">{job.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{job.description}</p>
                      
                      {/* Meta stats */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-50 text-[11px] text-slate-500">
                        <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</p>
                        <p className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {job.schedule}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0">
                    {applied ? (
                      <span className={`w-full py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 ${
                        applied.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : applied.status === "REJECTED"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Trạng thái: {applied.status === "APPROVED" ? "Đã duyệt" : applied.status === "REJECTED" ? "Từ chối" : "Đang xét duyệt"}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setIsApplying(true);
                        }}
                        className="w-full py-2 px-3 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-all shadow-sm shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-1"
                      >
                        Đăng ký tham gia ngay
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Registered Applications Panel */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Lịch trình đã đăng ký</h3>
            <p className="text-xs text-slate-500 mt-0.5">Theo dõi hồ sơ ứng tuyển tình nguyện của bản thân.</p>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-4 max-h-[420px] overflow-y-auto">
            {applications.length > 0 ? (
              applications.map((app) => (
                <div key={app.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-800 text-xs leading-snug line-clamp-1">{app.jobTitle}</h4>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-sm uppercase tracking-wider ${
                      app.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-800"
                        : app.status === "REJECTED"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-slate-200 text-slate-700"
                    }`}>
                      {app.status === "APPROVED" ? "Đã duyệt" : app.status === "REJECTED" ? "Bị từ chối" : "Đang xét"}
                    </span>
                  </div>
                  
                  <div className="text-[10px] text-slate-500 space-y-1 pt-1.5 border-t border-slate-200">
                    <p><span className="font-semibold text-slate-600">Đăng ký ngày:</span> {app.dateCreated}</p>
                    <p className="line-clamp-1"><span className="font-semibold text-slate-600">Kỹ năng nộp:</span> {app.skills}</p>
                    <p className="line-clamp-1"><span className="font-semibold text-slate-600">Thời gian rảnh:</span> {app.availability}</p>
                  </div>

                  {app.status === "APPROVED" && (
                    <div className="mt-2 p-2 bg-emerald-100/40 border border-emerald-100 rounded-lg text-[9px] text-emerald-800 leading-snug flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>XÁC NHẬN: CA HOẠT ĐỘNG CHUẨN BỊ DIỄN RA</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 space-y-1.5">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Chưa có hoạt động nào được đăng ký</p>
                <p className="text-[10px] text-slate-400">Đăng ký hoạt động tình nguyện để nhận giờ tác động và huy hiệu vinh danh!</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Application Slide-over Side Modal */}
      <AnimatePresence>
        {isApplying && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white h-full shadow-xl p-6 flex flex-col justify-between"
            >
              <div className="space-y-6 overflow-y-auto pr-1">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Biểu mẫu ứng tuyển</span>
                    <h3 className="font-bold text-slate-900 text-sm">Đăng ký Tình nguyện viên</h3>
                  </div>
                  <button onClick={() => setIsApplying(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Job Info Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs">{selectedJob.title}</h4>
                  <p className="text-[11px] text-slate-500">{selectedJob.location}</p>
                  <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase pt-2 border-t border-slate-200">
                    <span>Tác động: {selectedJob.hoursEarned} giờ</span>
                    <span>Tích lũy: {selectedJob.pointsReward} điểm</span>
                  </div>
                </div>

                {/* Form fields */}
                <form onSubmit={handleApplySubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Kỹ năng liên quan của bạn *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="VD: Có kỹ năng giảng dạy, biết sơ cứu y tế cơ bản, có chứng chỉ tiếng Anh IELTS, thích hoạt động ngoài trời..."
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian rảnh khả dụng *</label>
                    <input
                      required
                      type="text"
                      placeholder="VD: Rảnh các ngày cuối tuần trong tháng 7, Có thể tham gia toàn bộ 15 ngày..."
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    />
                  </div>

                  <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl text-[10px] leading-relaxed text-blue-800">
                    <Award className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>Sau khi hoàn thành hoạt động, ban tổ chức chiến dịch sẽ phê duyệt để ghi nhận Điểm tác động và giờ công xã hội trực tiếp vào hồ sơ cá nhân của bạn.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Gửi đơn ứng tuyển ngay
                  </button>
                </form>
              </div>

              <div className="border-t pt-4 flex gap-2">
                <button
                  onClick={() => setIsApplying(false)}
                  className="w-full py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100"
                >
                  Hủy bỏ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// X icon helper
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
