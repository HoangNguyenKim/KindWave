import { useState, useEffect } from "react";
import { User, Campaign, Donation, VolunteerJob, VolunteerApplication, OrgVerification, CampaignReport, CampaignLedger, Disbursement, ImpactProof, AuditLog } from "./types";
import {
  INITIAL_CATEGORIES,
  DEFAULT_USER
} from "./data/initialData";

// Views
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginView from "./components/LoginView";
import HomeView from "./features/HomeView";
import CampaignDetailView from "./features/CampaignDetailView";
import DonorDashboard from "./features/DonorDashboard";
import VolunteerHub from "./features/VolunteerHub";
import OrganizerDashboard from "./features/OrganizerDashboard";
import AdminDashboard from "./features/AdminDashboard";

// Modals
import DonationModal from "./components/DonationModal";
import CampaignWizard from "./components/CampaignWizard";
import ToastContainer from "./components/ToastContainer";

// Loading Spinner Icon
import { Loader2 } from "lucide-react";

export default function App() {
  // Global React state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("kindwave_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [ledgers, setLedgers] = useState<CampaignLedger[]>([]);
  const [volunteerJobs, setVolunteerJobs] = useState<VolunteerJob[]>([]);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [verifications, setVerifications] = useState<OrgVerification[]>([]);
  const [reports, setReports] = useState<CampaignReport[]>([]);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [impactProofs, setImpactProofs] = useState<ImpactProof[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Page States
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"home" | "campaign-detail" | "donor-dashboard" | "volunteer-hub" | "organizer-dashboard" | "admin-dashboard">("home");
  const [currentRole, setCurrentRole] = useState<"USER" | "ADMIN" >(() => {
    try {
      const saved = localStorage.getItem("kindwave_user");
      if (saved) {
        const u = JSON.parse(saved);
        return u.role;
      }
    } catch {}
    return "USER";
  });
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const [toasts, setToasts] = useState<Array<{ id: string; type: "success" | "error" | "info" | "warning"; title?: string; message: string }>>([]);

  const addToast = (type: "success" | "error" | "info" | "warning", title: string, message: string) => {
    const id = "toast-" + Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    window.alert = (message: any) => {
      const msgStr = String(message).toLowerCase();
      let type: "success" | "error" | "warning" | "info" = "info";
      
      if (msgStr.includes("thành công")) type = "success";
      else if (msgStr.includes("lỗi") || msgStr.includes("thất bại") || msgStr.includes("từ chối") || msgStr.includes("bác bỏ") || msgStr.includes("khóa")) type = "error";
      else if (msgStr.includes("vui lòng") || msgStr.includes("bắt buộc") || msgStr.includes("không thể") || msgStr.includes("vượt quá") || msgStr.includes("chờ duyệt")) type = "warning";
      
      const title = type === "success" ? "Thành công" 
                  : type === "error" ? "Thông báo lỗi" 
                  : type === "warning" ? "Lưu ý" : "Thông báo hệ thống";
                  
      addToast(type, title, String(message));
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Modals
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(2);

  // Core authenticated fetch helper
  const authFetch = (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("kindwave_token");
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
      "Authorization": `Bearer ${token}`
    };
    return fetch(url, { ...options, headers });
  };

  // Core API loader function
  const refreshData = async () => {
    try {
      const [
        resCamp,
        resDon,
        resLedg,
        resJobs,
        resApps,
        resVers,
        resReps,
        resDisb,
        resProo,
        resUsrs,
        resAudit
      ] = await Promise.all([
        authFetch("/api/campaigns").then((r) => r.json()),
        authFetch("/api/donations").then((r) => r.json()),
        authFetch("/api/ledgers").then((r) => r.json()),
        authFetch("/api/volunteer-jobs").then((r) => r.json()),
        authFetch("/api/applications").then((r) => r.json()),
        authFetch("/api/verifications").then((r) => r.json()),
        authFetch("/api/reports").then((r) => r.json()),
        authFetch("/api/disbursements").then((r) => r.json()),
        authFetch("/api/impact-proofs").then((r) => r.json()),
        authFetch("/api/users").then((r) => r.json()),
        authFetch("/api/audit-logs").then((r) => r.ok ? r.json() : [])
      ]);

      setCampaigns(resCamp);
      setDonations(resDon);
      setLedgers(resLedg);
      setVolunteerJobs(resJobs);
      setApplications(resApps);
      setVerifications(resVers);
      setReports(resReps);
      setDisbursements(resDisb);
      setImpactProofs(resProo);
      setUsersList(resUsrs);
      setAuditLogs(Array.isArray(resAudit) ? resAudit : []);

      // Extract current user if available in DB
      const currentToken = localStorage.getItem("kindwave_token");
      if (currentUser && currentToken) {
        const currentMe = resUsrs.find((u: any) => u.id === currentUser.id);
        if (currentMe) {
          setCurrentUser(currentMe);
          localStorage.setItem("kindwave_user", JSON.stringify(currentMe));
        }
      }
    } catch (err) {
      console.error("Failed to sync database from API server:", err);
      addToast("warning", "Mất kết nối máy chủ", "Hệ thống đang chạy ở chế độ ngoại tuyến mô phỏng hoặc có sự cố mạng.");
    } finally {
      setIsLoading(false);
    }
  };

  // Run on mount or when user changes to seed or load database
  useEffect(() => {
    if (currentUser) {
      refreshData();
    } else {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  const handleLogout = () => {
    localStorage.removeItem("kindwave_user");
    localStorage.removeItem("kindwave_token");
    setCurrentUser(null);
    setCurrentRole("USER");
    setCurrentView("home");
    window.location.href = "/";
  };

  // Donation Modal trigger from any view
  const handleTriggerDonate = (camp: Campaign) => {
    setSelectedCampaign(camp);
    setIsDonationOpen(true);
  };

  const handleCampaignSelect = (camp: Campaign) => {
    setSelectedCampaign(camp);
    setCurrentView("campaign-detail");
  };

  // State Updates from Donation Success Flow
  const handleDonationSuccess = async (newDonation: Donation) => {
    try {
      setIsLoading(true);
      const res = await authFetch("/api/donations", {
        method: "POST",
        body: JSON.stringify(newDonation)
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to post donation");
      }
      await refreshData();
      setNotificationsCount((prev) => prev + 1);
    } catch (err: any) {
      alert("Lỗi khi gửi quyên góp lên server: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // State Updates from Volunteer Hub Application
  const handleVolunteerApply = async (newApp: VolunteerApplication) => {
    try {
      setIsLoading(true);
      const res = await authFetch("/api/applications", {
        method: "POST",
        body: JSON.stringify(newApp)
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to submit volunteer application");
      }
      
      const postedApp = await res.json();
      // Auto-approve after 2 seconds for active feedback loop
      setTimeout(async () => {
        await authFetch(`/api/applications/${postedApp.id}/status`, {
          method: "PUT",
          body: JSON.stringify({ status: "APPROVED" })
        });
        await refreshData();
      }, 2000);

      await refreshData();
    } catch (err: any) {
      alert("Lỗi khi ứng tuyển: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create Campaign from Wizard
  const handleCreateCampaignSubmit = async (campaignData: Partial<Campaign>) => {
    try {
      setIsLoading(true);
      const res = await authFetch("/api/campaigns", {
        method: "POST",
        body: JSON.stringify({
          ...campaignData,
          organizerId: currentUser.id,
          creatorName: currentUser.name
        })
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to create campaign");
      }
      await refreshData();
      alert("Tạo chiến dịch thành công! Dự án đã được lưu vào database và chuyển đến Ban quản trị (ADMIN) chờ duyệt.");
    } catch (err: any) {
      alert("Lỗi khi gửi dự án mới: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Organizer: Request Disbursement
  const handleRequestDisbursement = async (newDisb: Disbursement) => {
    try {
      setIsLoading(true);
      const res = await authFetch("/api/disbursements", {
        method: "POST",
        body: JSON.stringify(newDisb)
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to request disbursement");
      }
      await refreshData();
      alert("Nộp đề xuất rút quỹ thành công! Phiếu đã chuyển đến hàng chờ duyệt của ADMIN.");
    } catch (err: any) {
      alert("Lỗi đề xuất rút quỹ: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Organizer: Submit Impact Proof
  const handleSubmitImpactProof = async (newProof: ImpactProof) => {
    try {
      setIsLoading(true);
      const res = await authFetch("/api/impact-proofs", {
        method: "POST",
        body: JSON.stringify(newProof)
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to submit proof");
      }
      await refreshData();
      alert("Đã nộp hóa đơn VAT chứng minh chi tiêu thực tế thành công! Chờ ADMIN kiểm tra.");
    } catch (err: any) {
      alert("Lỗi gửi chứng từ: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin: Campaign review toggle status
  const handleModerateCampaign = async (id: string, status: "ACTIVE" | "REJECTED", reason?: string) => {
    try {
      setIsLoading(true);
      const res = await authFetch(`/api/campaigns/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, rejectsReason: reason })
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to moderate campaign");
      }
      await refreshData();
    } catch (err: any) {
      alert("Lỗi duyệt chiến dịch: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin: Resolve abuse reports
  const handleResolveReport = async (reportId: string) => {
    try {
      setIsLoading(true);
      const res = await authFetch(`/api/reports/${reportId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "RESOLVED" })
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to resolve report");
      }
      await refreshData();
    } catch (err: any) {
      alert("Lỗi duyệt báo cáo: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin: Verification of NGO Orgs
  const handleApproveOrg = async (orgId: string, status: "APPROVED" | "REJECTED") => {
    try {
      setIsLoading(true);
      const res = await authFetch(`/api/verifications/${orgId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to moderate NGO license");
      }
      await refreshData();
    } catch (err: any) {
      alert("Lỗi duyệt hồ sơ NGO: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin: User governance banning
  const handleToggleBanUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await authFetch(`/api/users/${userId}/ban`, {
        method: "PUT"
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to ban user");
      }
      await refreshData();
    } catch (err: any) {
      alert("Lỗi thay đổi tài khoản: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin: Approve disbursement & sign ledger debit
  const handleApproveDisbursement = async (disbId: string, bankingProofUrl: string) => {
    try {
      setIsLoading(true);
      const res = await authFetch(`/api/disbursements/${disbId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "APPROVED", bankingProofUrl })
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to approve disbursement");
      }
      await refreshData();
    } catch (err: any) {
      alert("Lỗi giải ngân rút quỹ: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin: Approve impact reports
  const handleApproveImpactProof = async (proofId: string) => {
    try {
      setIsLoading(true);
      const res = await authFetch(`/api/impact-proofs/${proofId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "APPROVED" })
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to approve impact proof");
      }
      await refreshData();
    } catch (err: any) {
      alert("Lỗi kiểm toán chứng từ: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentRole(user.role);
          if (user.role === "ADMIN") {
            setCurrentView("admin-dashboard");
          } else {
            setCurrentView("home");
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FF] font-sans antialiased text-slate-800">
      
      {/* Navigation header bar */}
      <Navbar
        currentUser={currentUser}
        currentRole={currentRole}
        onOpenWizard={() => setIsWizardOpen(true)}
        notificationsCount={notificationsCount}
        onLogout={handleLogout}
      />

      {/* Ribbon-tab subnav bar specifically for USER role context */}
      {currentRole === "USER" && (
        <div className="bg-white border-b border-slate-100 sticky top-16 z-30 shadow-2xs">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6 overflow-x-auto py-3">
              <button
                onClick={() => setCurrentView("home")}
                className={`text-xs font-extrabold pb-1 transition-all whitespace-nowrap cursor-pointer relative ${
                  currentView === "home" || currentView === "campaign-detail" ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Khám phá chiến dịch
                {(currentView === "home" || currentView === "campaign-detail") && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>
              <button
                onClick={() => setCurrentView("volunteer-hub")}
                className={`text-xs font-extrabold pb-1 transition-all whitespace-nowrap cursor-pointer relative ${
                  currentView === "volunteer-hub" ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Tình nguyện viên
                {currentView === "volunteer-hub" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>
              <button
                onClick={() => setCurrentView("organizer-dashboard")}
                className={`text-xs font-extrabold pb-1 transition-all whitespace-nowrap cursor-pointer relative ${
                  currentView === "organizer-dashboard" ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Dự án của tôi (Quản lý dự án)
                {currentView === "organizer-dashboard" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>
              <button
                onClick={() => setCurrentView("donor-dashboard")}
                className={`text-xs font-extrabold pb-1 transition-all whitespace-nowrap cursor-pointer relative ${
                  currentView === "donor-dashboard" ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Lịch sử quyên góp
                {currentView === "donor-dashboard" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Body Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-50 rounded-2xl">
            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xl flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              <span className="text-xs font-bold text-slate-700">Đang đồng bộ Sổ cái...</span>
            </div>
          </div>
        )}

        {currentView === "home" && (
          <HomeView
            campaigns={campaigns}
            categories={INITIAL_CATEGORIES}
            recentDonations={donations}
            onSelectCampaign={handleCampaignSelect}
            onDonateClick={handleTriggerDonate}
          />
        )}

        {currentView === "campaign-detail" && selectedCampaign && (
          <CampaignDetailView
            campaign={campaigns.find((c) => c.id === selectedCampaign.id) || selectedCampaign}
            categories={INITIAL_CATEGORIES}
            ledgers={ledgers}
            disbursements={disbursements}
            impactProofs={impactProofs}
            donations={donations}
            onBack={() => setCurrentView("home")}
            onDonateClick={handleTriggerDonate}
            onSubmitReport={async (reason, desc) => {
              try {
                setIsLoading(true);
                const res = await authFetch("/api/reports", {
                  method: "POST",
                  body: JSON.stringify({
                    campaignId: selectedCampaign.id,
                    campaignTitle: selectedCampaign.title,
                    reporterName: currentUser.name,
                    reason,
                    description: desc
                  })
                });
                if (!res.ok) {
                  const errJson = await res.json();
                  throw new Error(errJson.error || "Failed to file report");
                }
                await refreshData();
                alert("Đơn tố cáo nội dung vi phạm pháp lý đã được ghi nhận và chuyển đến ADMIN xử lý kỷ luật!");
              } catch (err: any) {
                alert("Lỗi khi gửi tố cáo: " + err.message);
              } finally {
                setIsLoading(false);
              }
            }}
          />
        )}

        {currentView === "donor-dashboard" && (
          <DonorDashboard myDonations={donations.filter((d) => d.userId === currentUser.id)} />
        )}

        {currentView === "volunteer-hub" && (
          <VolunteerHub
            currentUser={currentUser}
            jobs={volunteerJobs}
            applications={applications}
            onApply={handleVolunteerApply}
            onUpdateUserMetrics={async (pts, hrs, badge) => {
              try {
                setIsLoading(true);
                const res = await authFetch(`/api/users/${currentUser.id}/metrics`, {
                  method: "PUT",
                  body: JSON.stringify({ impactPoints: pts, impactHours: hrs, badge })
                });
                if (!res.ok) {
                  const errJson = await res.json();
                  throw new Error(errJson.error || "Failed to update user stats");
                }
                await refreshData();
              } catch (err: any) {
                console.error("Lỗi cập nhật thành tích: ", err.message);
              } finally {
                setIsLoading(false);
              }
            }}
          />
        )}

        {currentView === "organizer-dashboard" && (
          <OrganizerDashboard
            myCampaigns={campaigns.filter((c) => c.organizerId === currentUser.id)}
            ledgers={ledgers}
            disbursements={disbursements}
            impactProofs={impactProofs}
            onOpenWizard={() => setIsWizardOpen(true)}
            onRequestDisbursement={handleRequestDisbursement}
            onSubmitImpactProof={handleSubmitImpactProof}
          />
        )}

        {currentView === "admin-dashboard" && (
          <AdminDashboard
            users={usersList}
            campaigns={campaigns}
            donations={donations}
            ledgers={ledgers}
            disbursements={disbursements}
            impactProofs={impactProofs}
            reports={reports}
            verifications={verifications}
            auditLogs={auditLogs}
            onToggleBanUser={handleToggleBanUser}
            onApproveDisbursement={handleApproveDisbursement}
            onApproveImpactProof={handleApproveImpactProof}
            onModerateCampaign={handleModerateCampaign}
            onResolveReport={handleResolveReport}
            onApproveOrg={handleApproveOrg}
          />
        )}
      </main>

      {/* Footer bar */}
      <Footer />

      {/* Overlays / Modals */}
      {selectedCampaign && (
        <DonationModal
          campaign={campaigns.find((c) => c.id === selectedCampaign.id) || selectedCampaign}
          isOpen={isDonationOpen}
          onClose={() => setIsDonationOpen(false)}
          onDonationSuccess={handleDonationSuccess}
        />
      )}

      <CampaignWizard
        categories={INITIAL_CATEGORIES}
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleCreateCampaignSubmit}
        addToast={addToast}
      />

      {/* Dynamic Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

    </div>
  );
}
