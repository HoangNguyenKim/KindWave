export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  role: "USER" | "ADMIN";
  bio: string;
  isBanned: boolean;
  impactPoints: number;
  impactHours: number;
  badges: string[];
}

export interface CampaignCategory {
  id: string;
  name: string;
  icon: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  image: string;
  categoryId: string;
  goalAmount: number;
  raisedAmount: number;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "CLOSED" | "DISBURSING" | "COMPLETED";
  organizerId: string;
  creatorName: string;
  dateCreated: string;
  dateEnded: string;
  isAnonymousApproved: boolean;
  targetBeneficiary: string;
  rejectsReason?: string;
}

export interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  userId: string;
  donorName: string;
  amount: number;
  isAnonymous: boolean;
  status: "PENDING" | "SUCCESS" | "FAILED";
  dateCreated: string;
  comment?: string;
  transactionCode: string;
}

export interface VolunteerJob {
  id: string;
  title: string;
  description: string;
  skillsRequired: string[];
  hoursEarned: number;
  pointsReward: number;
  location: string;
  schedule: string;
  spotsLeft: number;
  image: string;
  campaignId: string;
}

export interface VolunteerApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  skills: string;
  availability: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  dateCreated: string;
}

export interface OrgVerification {
  id: string;
  orgName: string;
  repName: string;
  email: string;
  licenseUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  dateCreated: string;
}

export interface CampaignReport {
  id: string;
  campaignId: string;
  campaignTitle: string;
  reporterName: string;
  reason: string;
  description: string;
  status: "PENDING" | "RESOLVED";
  dateCreated: string;
}

export interface CampaignLedger {
  id: string;
  campaignId: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  referenceId: string;
  balanceAfter: number;
  dateCreated: string;
  description: string;
}

export interface Disbursement {
  id: string;
  campaignId: string;
  scheduledDate: string;
  totalAmount: number;
  bankingProofUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  description: string;
}

export interface ImpactProof {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  proofImages: string[];
  spentAmount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  dateCreated: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface ImageRecord {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}
