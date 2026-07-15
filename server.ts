import express from "express";
import path from "node:path";
import { createServer as createViteServer } from "vite";
import { getDB, saveDB, runTransaction, saveImage, getImage, deleteImage, deleteCampaign } from "./server/db";
import { User, Campaign, Donation, VolunteerJob, VolunteerApplication, OrgVerification, CampaignReport, CampaignLedger, Disbursement, ImpactProof, AuditLog } from "./src/types";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const JWT_SECRET = process.env.JWT_SECRET || "kindwave_super_secret_key_2026";

// ==================== SANITIZATION & SECURITY HELPERS ====================

// XSS Sanitizer Helper (escapes HTML tags to prevent stored XSS)
function sanitizeInput(text: any): any {
  if (typeof text !== "string") return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// ==================== AUTHENTICATION & AUTHORIZATION MIDDLEWARES ====================

// Verify JWT token from Authorization header
async function requireUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const db = await getDB();
    const user = db.users.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }
    if (user.isBanned) {
      return res.status(403).json({ error: "Forbidden: Account suspended" });
    }
    (req as any).user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
}

async function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const db = await getDB();
    const user = db.users.find((u) => u.id === decoded.id);
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admin privileges required" });
    }
    if (user.isBanned) {
      return res.status(403).json({ error: "Forbidden: Account suspended" });
    }
    (req as any).user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request body parsing
  app.use(express.json());

  // ==================== API ENDPOINTS ====================

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ==================== IMAGE APIs ====================
  app.post("/api/images/upload", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Không tìm thấy file ảnh" });
      }
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Định dạng ảnh không hợp lệ (Chỉ hỗ trợ JPG, PNG, WEBP, GIF)" });
      }
      const id = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await saveImage(id, req.file.originalname, req.file.mimetype, req.file.size, req.file.buffer);
      res.status(201).json({ id, url: `/api/images/${id}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi máy chủ khi tải ảnh lên" });
    }
  });

  app.get("/api/images/:id", async (req, res) => {
    try {
      const image = await getImage(req.params.id);
      if (!image) {
        return res.status(404).send("Image not found");
      }
      res.set("Content-Type", image.mimeType);
      res.send(image.buffer);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  });

  app.delete("/api/images/:id", requireUser, async (req, res) => {
    try {
      await deleteImage(req.params.id);
      res.json({ message: "Xóa ảnh thành công" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi máy chủ khi xóa ảnh" });
    }
  });

  // ==================== AUTH APIs ====================
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, role, bio, avatar } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Tên, Email và Mật khẩu là bắt buộc" });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await runTransaction((db) => {
        const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          throw new Error("Email này đã được đăng ký trước đó");
        }
        const user: User = {
          id: "user-" + Date.now(),
          name: sanitizeInput(name),
          email: sanitizeInput(email),
          password: hashedPassword,
          avatar: sanitizeInput(avatar) || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
          role: role === "ADMIN" ? "ADMIN" : "USER",
          bio: sanitizeInput(bio) || "",
          isBanned: false,
          impactPoints: 0,
          impactHours: 0,
          badges: []
        };
        db.users.push(user);
        return user;
      });
      const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email và Mật khẩu là bắt buộc" });
    }
    try {
      const db = await getDB();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(404).json({ error: "Email không tồn tại hoặc sai mật khẩu" });
      }
      if (user.isBanned) {
        return res.status(403).json({ error: "Tài khoản của bạn đã bị vô hiệu hóa" });
      }
      const isMatch = await bcrypt.compare(password, user.password || "");
      if (!isMatch) {
        return res.status(401).json({ error: "Email không tồn tại hoặc sai mật khẩu" });
      }
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 1. Users APIs
  app.get("/api/users", async (req, res) => {
    const db = await getDB();
    res.json(db.users);
  });

  app.put("/api/users/:id/ban", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const admin = (req as any).user as User;
    
    try {
      const updatedUser = await runTransaction((db) => {
        const userIndex = db.users.findIndex((u) => u.id === id);
        if (userIndex === -1) {
          throw new Error("User not found");
        }
        
        const targetUser = db.users[userIndex];
        if (targetUser.id === admin.id) {
          throw new Error("Cannot ban yourself");
        }
        
        targetUser.isBanned = !targetUser.isBanned;
        
        // Audit Log entry for accountability
        const log: AuditLog = {
          id: "log-" + Date.now(),
          actorId: admin.id,
          actorName: admin.name,
          action: targetUser.isBanned ? "BAN_USER" : "UNBAN_USER",
          targetId: targetUser.id,
          details: `Thay đổi trạng thái cấm đối với người dùng ${targetUser.name} (${targetUser.email}). Trạng thái hiện tại: ${targetUser.isBanned ? "BỊ CẤM" : "HOẠT ĐỘNG"}.`,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log);
        return targetUser;
      });
      res.json(updatedUser);
    } catch (err: any) {
      res.status(err.message === "User not found" ? 404 : 400).json({ error: err.message });
    }
  });

  app.put("/api/users/:id/metrics", requireUser, async (req, res) => {
    const { id } = req.params;
    const requester = (req as any).user as User;
    
    if (requester.id !== id) {
      return res.status(403).json({ error: "Forbidden: You can only update your own metrics" });
    }
    
    const { impactPoints, impactHours, badge } = req.body;
    
    try {
      const updatedUser = await runTransaction((db) => {
        const userIndex = db.users.findIndex((u) => u.id === id);
        if (userIndex === -1) {
          throw new Error("User not found");
        }
        const user = db.users[userIndex];
        if (typeof impactPoints === "number") user.impactPoints += impactPoints;
        if (typeof impactHours === "number") user.impactHours += impactHours;
        if (badge && !user.badges.includes(badge)) {
          user.badges.push(badge);
        }
        
        if (badge) {
          const log: AuditLog = {
            id: "log-" + Date.now(),
            actorId: requester.id,
            actorName: requester.name,
            action: "EARNED_BADGE",
            targetId: requester.id,
            details: `Đạt huy hiệu mới: "${badge}"`,
            timestamp: new Date().toISOString()
          };
          db.auditLogs.unshift(log);
        }
        return user;
      });
      res.json(updatedUser);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // 2. Campaigns APIs
  app.get("/api/campaigns", async (req, res) => {
    const db = await getDB();
    res.json(db.campaigns);
  });

  app.post("/api/campaigns", requireUser, async (req, res) => {
    const requester = (req as any).user as User;
    const campaignData: Partial<Campaign> = req.body;
    
    if (!campaignData.title || campaignData.title.trim() === "") {
      return res.status(400).json({ error: "Tên chiến dịch không được để trống" });
    }
    if (!campaignData.goalAmount || campaignData.goalAmount <= 0) {
      return res.status(400).json({ error: "Số tiền mục tiêu phải lớn hơn 0" });
    }
    
    const sanitizedTitle = sanitizeInput(campaignData.title);
    const sanitizedShortDesc = sanitizeInput(campaignData.shortDescription);
    const sanitizedDesc = sanitizeInput(campaignData.description);
    const sanitizedBeneficiary = sanitizeInput(campaignData.targetBeneficiary);
    const sanitizedImage = sanitizeInput(campaignData.image);
    
    try {
      const newCamp = await runTransaction((db) => {
        const camp: Campaign = {
          id: "camp-" + Date.now(),
          title: sanitizedTitle,
          categoryId: campaignData.categoryId || "",
          goalAmount: campaignData.goalAmount || 100000000,
          raisedAmount: 0,
          shortDescription: sanitizedShortDesc || "",
          description: sanitizedDesc || "",
          targetBeneficiary: sanitizedBeneficiary || "",
          image: sanitizedImage || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
          isAnonymousApproved: campaignData.isAnonymousApproved !== false,
          status: "PENDING",
          organizerId: requester.id,
          creatorName: requester.name,
          dateCreated: new Date().toISOString().substring(0, 10),
          dateEnded: campaignData.dateEnded || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
        };
        
        db.campaigns.unshift(camp);
        
        const log: AuditLog = {
          id: "log-" + Date.now(),
          actorId: requester.id,
          actorName: requester.name,
          action: "CREATE_CAMPAIGN",
          targetId: camp.id,
          details: `Tạo chiến dịch mới: "${camp.title}" với số tiền mục tiêu: ${camp.goalAmount.toLocaleString("vi-VN")} VNĐ. Trạng thái: Chờ duyệt.`,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log);
        return camp;
      });
      res.status(201).json(newCamp);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/campaigns/:id/status", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status, rejectsReason } = req.body;
    const admin = (req as any).user as User;
    
    const sanitizedReason = sanitizeInput(rejectsReason);
    
    try {
      const updatedCamp = await runTransaction((db) => {
        const campIndex = db.campaigns.findIndex((c) => c.id === id);
        if (campIndex === -1) {
          throw new Error("Campaign not found");
        }
        
        const camp = db.campaigns[campIndex];
        camp.status = status;
        if (sanitizedReason !== undefined) {
          camp.rejectsReason = sanitizedReason;
        }
        
        const log: AuditLog = {
          id: "log-" + Date.now(),
          actorId: admin.id,
          actorName: admin.name,
          action: `CAMPAIGN_STATUS_${status}`,
          targetId: camp.id,
          details: `Duyệt trạng thái chiến dịch "${camp.title}" thành: ${status}. ${status === "REJECTED" ? `Lý do từ chối: "${sanitizedReason}"` : ""}`,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log);
        return camp;
      });
      res.json(updatedCamp);
    } catch (err: any) {
      res.status(err.message === "Campaign not found" ? 404 : 400).json({ error: err.message });
    }
  });

  app.delete("/api/campaigns/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const admin = (req as any).user as User;

    try {
      const deletedCamp = await deleteCampaign(id);
      if (!deletedCamp) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      // Record audit log
      await runTransaction((db) => {
        const log: AuditLog = {
          id: "log-" + Date.now(),
          actorId: admin.id,
          actorName: admin.name,
          action: "DELETE_CAMPAIGN",
          targetId: id,
          details: `Xoá chiến dịch "${deletedCamp.title}".`,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log);
        return null;
      });

      res.json({ message: "Campaign deleted successfully", campaign: deletedCamp });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Donations APIs
  app.get("/api/donations", async (req, res) => {
    const db = await getDB();
    res.json(db.donations);
  });

  app.post("/api/donations", requireUser, async (req, res) => {
    const requester = (req as any).user as User;
    const donationData: Partial<Donation> = req.body;

    const amount = Number(donationData.amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Số tiền quyên góp phải lớn hơn 0" });
    }

    const sanitizedComment = sanitizeInput(donationData.comment);

    try {
      const newDonation = await runTransaction((db) => {
        const campIndex = db.campaigns.findIndex((c) => c.id === donationData.campaignId);
        if (campIndex === -1) {
          throw new Error("Chiến dịch không tồn tại");
        }

        const camp = db.campaigns[campIndex];
        if (camp.status !== "ACTIVE") {
          throw new Error("Chiến dịch hiện tại không mở nhận quyên góp");
        }

        const donationId = "don-" + Date.now();
        const newDon: Donation = {
          id: donationId,
          campaignId: camp.id,
          campaignTitle: camp.title,
          userId: requester.id,
          donorName: donationData.isAnonymous ? "Nhà hảo tâm ẩn danh" : requester.name,
          amount: amount,
          isAnonymous: !!donationData.isAnonymous,
          status: "SUCCESS",
          dateCreated: new Date().toISOString().replace("T", " ").substring(0, 16),
          comment: sanitizedComment || "",
          transactionCode: donationData.transactionCode || "TX" + Date.now().toString().substring(6)
        };

        // Append donation
        db.donations.unshift(newDon);

        // Atomic update of raisedAmount
        camp.raisedAmount += amount;
        const balanceNow = camp.raisedAmount;

        // Record credit ledger entry
        const ledgerId = "led-" + Date.now();
        const newLedger: CampaignLedger = {
          id: ledgerId,
          campaignId: camp.id,
          amount: amount,
          type: "CREDIT",
          referenceId: donationId,
          balanceAfter: balanceNow,
          dateCreated: newDon.dateCreated,
          description: `Nhận tiền quyên góp từ nhà hảo tâm ${newDon.isAnonymous ? "ẩn danh" : requester.name}`
        };
        db.ledgers.unshift(newLedger);

        // Update volunteer/donor points
        const userIndex = db.users.findIndex((u) => u.id === requester.id);
        if (userIndex !== -1) {
          db.users[userIndex].impactPoints += Math.floor(amount / 100000) * 10;
        }

        // Audit Log
        const log: AuditLog = {
          id: "log-" + Date.now(),
          actorId: requester.id,
          actorName: requester.name,
          action: "SUBMIT_DONATION",
          targetId: donationId,
          details: `Quyên góp thành công ${amount.toLocaleString("vi-VN")} VNĐ vào chiến dịch "${camp.title}". Mã giao dịch: ${newDon.transactionCode}.`,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log);

        return newDon;
      });
      res.status(201).json(newDonation);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 4. Volunteer Jobs APIs
  app.get("/api/volunteer-jobs", async (req, res) => {
    const db = await getDB();
    res.json(db.volunteerJobs);
  });

  app.post("/api/volunteer-jobs", requireUser, async (req, res) => {
    const requester = (req as any).user as User;
    const jobData: Partial<VolunteerJob> = req.body;
    
    const sanitizedTitle = sanitizeInput(jobData.title);
    const sanitizedDesc = sanitizeInput(jobData.description);
    const sanitizedLocation = sanitizeInput(jobData.location);
    const sanitizedSchedule = sanitizeInput(jobData.schedule);
    
    try {
      const newJob = await runTransaction((db) => {
        const job: VolunteerJob = {
          id: "vol-" + Date.now(),
          title: sanitizedTitle || "",
          description: sanitizedDesc || "",
          skillsRequired: Array.isArray(jobData.skillsRequired) ? jobData.skillsRequired.map(sanitizeInput) : [],
          hoursEarned: jobData.hoursEarned || 8,
          pointsReward: jobData.pointsReward || 100,
          location: sanitizedLocation || "Trực tuyến",
          schedule: sanitizedSchedule || "Linh hoạt",
          spotsLeft: jobData.spotsLeft || 10,
          image: jobData.image || "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800",
          campaignId: jobData.campaignId || ""
        };
        db.volunteerJobs.unshift(job);
        
        const log: AuditLog = {
          id: "log-" + Date.now(),
          actorId: requester.id,
          actorName: requester.name,
          action: "CREATE_VOLUNTEER_JOB",
          targetId: job.id,
          details: `Tạo công việc tình nguyện "${job.title}" thuộc chiến dịch ID: ${job.campaignId}.`,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log);
        return job;
      });
      res.status(201).json(newJob);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Volunteer Applications APIs
  app.get("/api/applications", async (req, res) => {
    const db = await getDB();
    res.json(db.applications);
  });

  app.post("/api/applications", requireUser, async (req, res) => {
    const requester = (req as any).user as User;
    const appData: Partial<VolunteerApplication> = req.body;
    
    const sanitizedSkills = sanitizeInput(appData.skills);
    const sanitizedAvailability = sanitizeInput(appData.availability);
    
    try {
      const newApp = await runTransaction((db) => {
        const relatedJob = db.volunteerJobs.find((j) => j.id === appData.jobId);
        if (!relatedJob) {
          throw new Error("Công việc tình nguyện không tồn tại");
        }
        
        const application: VolunteerApplication = {
          id: "app-" + Date.now(),
          jobId: relatedJob.id,
          jobTitle: relatedJob.title,
          userId: requester.id,
          userName: requester.name,
          userEmail: requester.email,
          skills: sanitizedSkills || "",
          availability: sanitizedAvailability || "",
          status: "PENDING",
          dateCreated: new Date().toISOString().substring(0, 10)
        };
        db.applications.unshift(application);
        
        const log: AuditLog = {
          id: "log-" + Date.now(),
          actorId: requester.id,
          actorName: requester.name,
          action: "SUBMIT_VOLUNTEER_APP",
          targetId: application.id,
          details: `Nộp đơn đăng ký làm tình nguyện viên cho công việc "${relatedJob.title}".`,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log);
        return application;
      });
      res.status(201).json(newApp);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/applications/:id/status", requireUser, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const actor = (req as any).user as User;
    
    try {
      const updatedApp = await runTransaction((db) => {
        const appIndex = db.applications.findIndex((a) => a.id === id);
        if (appIndex === -1) {
          throw new Error("Application not found");
        }
        
        const application = db.applications[appIndex];
        if (application.status !== "PENDING") {
          throw new Error("Đơn ứng tuyển đã được xử lý trước đó");
        }
        
        application.status = status;

        if (status === "APPROVED") {
          const jobIndex = db.volunteerJobs.findIndex((j) => j.id === application.jobId);
          if (jobIndex !== -1) {
            const job = db.volunteerJobs[jobIndex];
            if (job.spotsLeft <= 0) {
              throw new Error("Công việc đã hết chỗ đăng ký");
            }
            job.spotsLeft -= 1;
          }

          const relatedJob = db.volunteerJobs.find((j) => j.id === application.jobId);
          if (relatedJob) {
            const userIndex = db.users.findIndex((u) => u.id === application.userId);
            if (userIndex !== -1) {
              const volunteer = db.users[userIndex];
              volunteer.impactHours += relatedJob.hoursEarned;
              volunteer.impactPoints += relatedJob.pointsReward;
              if (volunteer.impactHours >= 20 && !volunteer.badges.includes("Người xây dựng cộng đồng")) {
                volunteer.badges.push("Người xây dựng cộng đồng");
              }
            }
          }
        }

        const log: AuditLog = {
          id: "log-" + Date.now(),
          actorId: actor.id,
          actorName: actor.name,
          action: `VOLUNTEER_APP_${status}`,
          targetId: application.id,
          details: `Duyệt đơn đăng ký của "${application.userName}" cho công việc "${application.jobTitle}" thành: ${status}.`,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log);
        return application;
      });
      res.json(updatedApp);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 6. NGO Verifications APIs
  app.get("/api/verifications", async (req, res) => {
    const db = await getDB();
    res.json(db.verifications);
  });

  app.post("/api/verifications", requireUser, async (req, res) => {
    const requester = (req as any).user as User;
    const verData: Partial<OrgVerification> = req.body;
    
    const sanitizedOrgName = sanitizeInput(verData.orgName);
    const sanitizedRepName = sanitizeInput(verData.repName);
    const sanitizedEmail = sanitizeInput(verData.email);
    const sanitizedLicense = sanitizeInput(verData.licenseUrl);
    
    try {
      const newVer = await runTransaction((db) => {
        const verification: OrgVerification = {
          id: "ver-" + Date.now(),
          orgName: sanitizedOrgName || "",
          repName: sanitizedRepName || "",
          email: sanitizedEmail || "",
          licenseUrl: sanitizedLicense || "https://example.com/license-ngo.pdf",
          status: "PENDING",
          dateCreated: new Date().toISOString().substring(0, 10)
        };
        db.verifications.unshift(verification);
        
        const log: AuditLog = {
          id: "log-" + Date.now(),
          actorId: requester.id,
          actorName: requester.name,
          action: "SUBMIT_ORG_VERIFICATION",
          targetId: verification.id,
          details: `Nộp hồ sơ pháp lý xác minh tổ chức phi chính phủ (NGO): "${verification.orgName}".`,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log);
        return verification;
      });
      res.status(201).json(newVer);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/verifications/:id/status", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const admin = (req as any).user as User;
    
    try {
      const updatedVer = await runTransaction((db) => {
        const verIndex = db.verifications.findIndex((v) => v.id === id);
        if (verIndex === -1) {
          throw new Error("Verification profile not found");
        }
        
        const ver = db.verifications[verIndex];
        ver.status = status;
        
        const log: AuditLog = {
          id: "log-" + Date.now(),
          actorId: admin.id,
          actorName: admin.name,
          action: `ORG_VERIFICATION_${status}`,
          targetId: ver.id,
          details: `Duyệt trạng thái hồ sơ pháp lý của tổ chức "${ver.orgName}" thành: ${status}.`,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log);
        return ver;
      });
      res.json(updatedVer);
    } catch (err: any) {
      res.status(err.message === "Verification profile not found" ? 404 : 400).json({ error: err.message });
    }
  });

  // 7. Campaign Reports APIs
  app.get("/api/reports", async (req, res) => {
    const db = await getDB();
    res.json(db.reports);
  });

  app.post("/api/reports", requireUser, async (req, res) => {
    const requester = (req as any).user as User;
    const repData: Partial<CampaignReport> = req.body;
    
    const sanitizedReason = sanitizeInput(repData.reason);
    const sanitizedDesc = sanitizeInput(repData.description);
    
    try {
      const newRep = await runTransaction((db) => {
        const campaign = db.campaigns.find((c) => c.id === repData.campaignId);
        if (!campaign) {
          throw new Error("Chiến dịch báo cáo không tồn tại");
        }
        
        const report: CampaignReport = {
          id: "rep-" + Date.now(),
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          reporterName: requester.name,
          reason: sanitizedReason || "Lý do khác",
          description: sanitizedDesc || "",
          status: "PENDING",
          dateCreated: new Date().toISOString().substring(0, 10)
        };
        db.reports.unshift(report);
        
        const log: AuditLog = {
          id: "log-" + Date.now(),
          actorId: requester.id,
          actorName: requester.name,
          action: "SUBMIT_CAMPAIGN_REPORT",
          targetId: report.id,
          details: `Báo cáo sai phạm chiến dịch "${campaign.title}". Lý do: "${report.reason}".`,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log);
        return report;
      });
      res.status(201).json(newRep);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/reports/:id/status", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const admin = (req as any).user as User;
    
    try {
      const updatedRep = await runTransaction((db) => {
        const repIndex = db.reports.findIndex((r) => r.id === id);
        if (repIndex === -1) {
          throw new Error("Report not found");
        }
        const rep = db.reports[repIndex];
        rep.status = status;
        
        const log: AuditLog = {
          id: "log-" + Date.now(),
          actorId: admin.id,
          actorName: admin.name,
          action: `CAMPAIGN_REPORT_${status}`,
          targetId: rep.id,
          details: `Xử lý đơn báo cáo số ID: ${rep.id} của chiến dịch "${rep.campaignTitle}". Trạng thái: ${status}.`,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log);
        return rep;
      });
      res.json(updatedRep);
    } catch (err: any) {
      res.status(err.message === "Report not found" ? 404 : 400).json({ error: err.message });
    }
  });

  // 8. Disbursements APIs
  app.get("/api/disbursements", async (req, res) => {
    const db = await getDB();
    res.json(db.disbursements);
  });

  app.post("/api/disbursements", requireUser, async (req, res) => {
    const requester = (req as any).user as User;
    const disbData: Partial<Disbursement> = req.body;
    
    const totalAmount = Number(disbData.totalAmount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ error: "Số tiền giải ngân phải lớn hơn 0" });
    }
    
    const sanitizedDesc = sanitizeInput(disbData.description);
    
    try {
      const newDisb = await runTransaction((db) => {
        const camp = db.campaigns.find((c) => c.id === disbData.campaignId);
        if (!camp) {
          throw new Error("Chiến dịch giải ngân không tồn tại");
        }
        
        const campLedgers = db.ledgers.filter((l) => l.campaignId === camp.id);
        const currentBalance = campLedgers.length > 0 ? campLedgers[0].balanceAfter : camp.raisedAmount;
        if (totalAmount > currentBalance) {
          throw new Error(`Số tiền rút quỹ vượt quá số dư khả dụng (${currentBalance.toLocaleString("vi-VN")} VNĐ)`);
        }
        
        const disbursement: Disbursement = {
          id: "disb-" + Date.now(),
          campaignId: camp.id,
          scheduledDate: disbData.scheduledDate || new Date().toISOString().substring(0, 10),
          totalAmount: totalAmount,
          bankingProofUrl: "",
          status: "PENDING",
          description: sanitizedDesc || ""
        };
        db.disbursements.unshift(disbursement);
        
        const log: AuditLog = {
          id: "log-" + Date.now(),
          actorId: requester.id,
          actorName: requester.name,
          action: "REQUEST_DISBURSEMENT",
          targetId: disbursement.id,
          details: `Yêu cầu rút quỹ giải ngân ${disbursement.totalAmount.toLocaleString("vi-VN")} VNĐ cho chiến dịch "${camp.title}". Lý do: "${disbursement.description}".`,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log);
        return disbursement;
      });
      res.status(201).json(newDisb);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/disbursements/:id/status", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status, bankingProofUrl } = req.body;
    const admin = (req as any).user as User;
    
    const sanitizedProofUrl = sanitizeInput(bankingProofUrl);
    
    try {
      const updatedDisb = await runTransaction((db) => {
        const disbIndex = db.disbursements.findIndex((d) => d.id === id);
        if (disbIndex === -1) {
          throw new Error("Disbursement request not found");
        }
        
        const disb = db.disbursements[disbIndex];
        
        // STRICT DOUBLE APPROVAL PREVENTION CHECK
        if (disb.status === "APPROVED") {
          throw new Error("Yêu cầu giải ngân này đã được phê duyệt trước đó và không thể duyệt lại!");
        }
        if (disb.status === "REJECTED") {
          throw new Error("Yêu cầu giải ngân này đã bị từ chối trước đó.");
        }
        
        disb.status = status;
        if (sanitizedProofUrl) disb.bankingProofUrl = sanitizedProofUrl;

        if (status === "APPROVED") {
          const relCamp = db.campaigns.find((c) => c.id === disb.campaignId);
          if (!relCamp) {
            throw new Error("Chiến dịch giải ngân không tồn tại");
          }
          
          const campLedgers = db.ledgers.filter((l) => l.campaignId === disb.campaignId);
          const currentBalance = campLedgers.length > 0 ? campLedgers[0].balanceAfter : relCamp.raisedAmount;
          
          if (disb.totalAmount > currentBalance) {
            throw new Error(`Không thể duyệt! Số tiền giải ngân (${disb.totalAmount.toLocaleString("vi-VN")} VNĐ) vượt quá số dư khả dụng (${currentBalance.toLocaleString("vi-VN")} VNĐ)`);
          }

          const balanceNow = currentBalance - disb.totalAmount;

          // Record Debit Ledger entry
          const newLedger: CampaignLedger = {
            id: "led-" + Date.now(),
            campaignId: disb.campaignId,
            amount: disb.totalAmount,
            type: "DEBIT",
            referenceId: id,
            balanceAfter: balanceNow,
            dateCreated: new Date().toISOString().replace("T", " ").substring(0, 16),
            description: `Giải ngân hỗ trợ dự án: ${disb.description}`
          };
          db.ledgers.unshift(newLedger);
        }

        const log: AuditLog = {
          id: "log-" + Date.now(),
          actorId: admin.id,
          actorName: admin.name,
          action: `DISBURSEMENT_STATUS_${status}`,
          targetId: disb.id,
          details: `Phê duyệt yêu cầu giải ngân số ID: ${disb.id} với số tiền ${disb.totalAmount.toLocaleString("vi-VN")} VNĐ. Trạng thái: ${status}.`,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log);
        return disb;
      });
      res.json(updatedDisb);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 9. Impact Proofs APIs
  app.get("/api/impact-proofs", async (req, res) => {
    const db = await getDB();
    res.json(db.impactProofs);
  });

  app.post("/api/impact-proofs", requireUser, async (req, res) => {
    const requester = (req as any).user as User;
    const proofData: Partial<ImpactProof> = req.body;
    
    const spentAmount = Number(proofData.spentAmount);
    if (isNaN(spentAmount) || spentAmount <= 0) {
      return res.status(400).json({ error: "Số tiền chi tiêu thực tế phải lớn hơn 0" });
    }
    
    const sanitizedTitle = sanitizeInput(proofData.title);
    const sanitizedContent = sanitizeInput(proofData.content);
    const sanitizedImages = Array.isArray(proofData.proofImages) ? proofData.proofImages.map(sanitizeInput) : [];
    
    try {
      const newProof = await runTransaction((db) => {
        const camp = db.campaigns.find((c) => c.id === proofData.campaignId);
        if (!camp) {
          throw new Error("Chiến dịch không tồn tại");
        }
        
        const proof: ImpactProof = {
          id: "proof-" + Date.now(),
          campaignId: camp.id,
          title: sanitizedTitle || "",
          content: sanitizedContent || "",
          proofImages: sanitizedImages.length > 0 ? sanitizedImages : ["https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800"],
          spentAmount: spentAmount,
          status: "PENDING",
          dateCreated: new Date().toISOString().substring(0, 10)
        };
        db.impactProofs.unshift(proof);
        
        const log: AuditLog = {
          id: "log-" + Date.now(),
          actorId: requester.id,
          actorName: requester.name,
          action: "SUBMIT_IMPACT_PROOF",
          targetId: proof.id,
          details: `Nộp chứng từ sao kê hóa đơn đỏ VAT cho khoản chi ${proof.spentAmount.toLocaleString("vi-VN")} VNĐ thuộc dự án "${camp.title}".`,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log);
        return proof;
      });
      res.status(201).json(newProof);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/impact-proofs/:id/status", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const admin = (req as any).user as User;
    
    try {
      const updatedProof = await runTransaction((db) => {
        const proofIndex = db.impactProofs.findIndex((p) => p.id === id);
        if (proofIndex === -1) {
          throw new Error("Impact proof not found");
        }
        
        const proof = db.impactProofs[proofIndex];
        proof.status = status;
        
        const log: AuditLog = {
          id: "log-" + Date.now(),
          actorId: admin.id,
          actorName: admin.name,
          action: `IMPACT_PROOF_STATUS_${status}`,
          targetId: proof.id,
          details: `Kiểm toán và duyệt chứng từ chi tiêu số ID: ${proof.id}. Trạng thái: ${status}.`,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log);
        return proof;
      });
      res.json(updatedProof);
    } catch (err: any) {
      res.status(err.message === "Impact proof not found" ? 404 : 400).json({ error: err.message });
    }
  });

  // 10. Ledger APIs
  app.get("/api/ledgers", async (req, res) => {
    const db = await getDB();
    res.json(db.ledgers);
  });

  // 11. Audit Logs API (Admin-Only access)
  app.get("/api/audit-logs", requireAdmin, async (req, res) => {
    const db = await getDB();
    res.json(db.auditLogs);
  });

  // ==================== VITE MIDDLEWARE / ASSET SERVING ====================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
