import fsPromises from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { User, Campaign, Donation, VolunteerJob, VolunteerApplication, OrgVerification, CampaignReport, CampaignLedger, Disbursement, ImpactProof, AuditLog } from "../src/types";

const DB_FILE_PATH = path.join(process.cwd(), "db-store.json");

interface DatabaseSchema {
  users: User[];
  campaigns: Campaign[];
  donations: Donation[];
  volunteerJobs: VolunteerJob[];
  applications: VolunteerApplication[];
  verifications: OrgVerification[];
  reports: CampaignReport[];
  disbursements: Disbursement[];
  impactProofs: ImpactProof[];
  ledgers: CampaignLedger[];
  auditLogs: AuditLog[];
}

const INITIAL_DB: DatabaseSchema = {
  users: [
    {
      id: "user-current",
      name: "Nguyễn Kim Hoàng",
      email: "ngkimhoang05@gmail.com",
      password: "$2b$10$Kgpebrxk9jb1WzfsebANBeRYSvWbqgPlhjnMhhqdw74redAxpXgqS",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      role: "USER",
      bio: "Nhà hảo tâm và là tình nguyện viên tích cực, đam mê các hoạt động bảo vệ môi trường và hỗ trợ trẻ em nghèo vùng cao.",
      isBanned: false,
      impactPoints: 280,
      impactHours: 12,
      badges: ["Đại sứ Hy vọng", "Chiến binh Xanh"]
    },
    {
      id: "user-admin",
      name: "Trần Minh Đức (Admin)",
      email: "duc.admin@kindwave.org",
      password: "$2b$10$WP2NUGeFS1FkoKmWTmHHwOZqtTCdBGAfzdsP6k.g3vPRL54XaWI3q",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      role: "ADMIN",
      bio: "Trưởng ban kiểm duyệt tư pháp KindWave",
      isBanned: false,
      impactPoints: 500,
      impactHours: 0,
      badges: ["Hộ vệ Công lý"]
    },
    {
      id: "user-2",
      name: "Lê Thị Lan Anh",
      email: "anhsang@ngo.org",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      role: "USER",
      bio: "Đại diện Hội Thiện Nguyện Ánh Sáng",
      isBanned: false,
      impactPoints: 100,
      impactHours: 0,
      badges: []
    },
    {
      id: "user-3",
      name: "Nguyễn Thế Hải",
      email: "bongsen@fund.vn",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      role: "USER",
      bio: "Sáng lập Quỹ Bông Sen Xanh",
      isBanned: false,
      impactPoints: 0,
      impactHours: 0,
      badges: []
    }
  ],
  campaigns: [
    {
      id: "camp-hagiang",
      title: "Xây dựng Trường học Vùng cao Mèo Vạc, Hà Giang",
      shortDescription: "Góp gạch xây trường, thắp sáng ước mơ học chữ cho hơn 150 trẻ em nghèo người Mông tại xã Lũng Pù, Hà Giang.",
      description: `### Giới thiệu dự án\nXã Lũng Pù là một trong những địa bàn khó khăn nhất của huyện Mèo Vạc, Hà Giang. Hiện tại, hơn 150 trẻ em mầm non và tiểu học đang phải học trong các lớp tạm bợ bằng tranh tre nứa lá, gió lùa buốt giá vào mùa đông và dột nát vào mùa mưa.\n\nKindWave phát động chiến dịch quyên góp nhằm xây dựng **3 phòng học kiên cố**, 1 khu vệ sinh khép kín và trang bị đầy đủ bàn ghế, bảng viết, sách vở cho các em.\n\n### Kế hoạch triển khai\n- **Giai đoạn 1:** Khảo sát, san lấp mặt bằng và chuẩn bị vật liệu xây dựng (Gạch, xi măng, sắt thép).\n- **Giai đoạn 2:** Thi công phần móng, đổ cột và tường bao.\n- **Giai đoạn 3:** Hoàn thiện mái lợp chống nóng, lát gạch, lắp cửa và hệ thống chiếu sáng.\n- **Giai đoạn 4:** Nghiệm thu, bàn giao trường mới và tổ chức lễ khai giảng.\n\nMọi khoản đóng góp và giải ngân sẽ được công khai minh bạch 100% qua sổ cái hệ thống KindWave.`,
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
      categoryId: "cat-education",
      goalAmount: 300000000,
      raisedAmount: 185000000,
      status: "ACTIVE",
      organizerId: "user-2",
      creatorName: "Hội Thiện Nguyện Ánh Sáng",
      dateCreated: "2026-06-01",
      dateEnded: "2026-08-30",
      isAnonymousApproved: true,
      targetBeneficiary: "150 trẻ em nghèo xã Lũng Pù, Mèo Vạc"
    },
    {
      id: "camp-flood",
      title: "Cứu trợ khẩn cấp Lũ lụt miền Trung 2026",
      shortDescription: "Hỗ trợ lương thực, nước sạch và túi thuốc khẩn cấp cho hơn 1000 hộ gia đình bị cô lập bởi lũ quét tại Quảng Bình.",
      description: `### Tình hình khẩn cấp\nTrận bão số 2 vừa qua đã gây mưa lớn cục bộ, sạt lở đất và lũ quét nghiêm trọng tại nhiều khu vực thuộc tỉnh Quảng Bình. Hàng ngàn ngôi nhà ngập sâu trong nước, người dân mất hoàn toàn tài sản, lương thực và đối mặt với nguy cơ thiếu nước uống sạch, dịch bệnh bùng phát.\n\n### Hoạt động cứu trợ của KindWave\nChúng tôi phối hợp cùng lực lượng cứu hộ địa phương để phân phát trực tiếp:\n1. **1000 thùng mì ăn liền & lương khô.**\n2. **2000 bình nước tinh khiết (20L).**\n3. **1000 túi thuốc gia đình** (thuốc cảm, bông băng, thuốc sát trùng, thuốc trị nước ăn chân).\n4. **Hỗ trợ tiền mặt khẩn cấp** cho các gia đình bị sập nhà hoàn toàn (10,000,000 VNĐ/hộ).\n\nChúng tôi cam kết ghi nhận từng đồng quyên góp, cập nhật trực tiếp hóa đơn nhập lương thực ngay khi mua hàng để người quyên góp tiện theo dõi.`,
      image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=800",
      categoryId: "cat-emergency",
      goalAmount: 500000000,
      raisedAmount: 420000000,
      status: "ACTIVE",
      organizerId: "user-3",
      creatorName: "Quỹ Bông Sen Xanh",
      dateCreated: "2026-06-25",
      dateEnded: "2026-07-25",
      isAnonymousApproved: true,
      targetBeneficiary: "1000 hộ dân vùng lũ Quảng Bình"
    },
    {
      id: "camp-heart",
      title: "Mổ tim nhân đạo cứu sống Trẻ em Nghèo hiếu học",
      shortDescription: "Tài trợ 100% chi phí phẫu thuật tim bẩm sinh cho các em nhỏ có hoàn cảnh đặc biệt khó khăn, mở ra cuộc đời mới.",
      description: `### Ý nghĩa chương trình\nBệnh tim bẩm sinh có thể chữa khỏi hoàn toàn nếu được phẫu thuật kịp thời. Tuy nhiên, chi phí một ca mổ tim dao động từ 80 đến 150 triệu VNĐ - một con số không tưởng đối với các gia đình nghèo làm nông, làm thuê ở vùng sâu vùng xa.\n\nKindWave hợp tác cùng Viện Tim TP.HCM để sàng lọc và tài trợ phẫu thuật cho các bé có chỉ định khẩn cấp. Mỗi ca mổ thành công là một cuộc đời của bé và một gia đình được cứu sống.\n\n### Danh sách thụ hưởng đợt này\n- Bé **Nguyễn Gia Bảo** (4 tuổi, Quảng Ngãi) - Suy tim độ 3.\n- Bé **Lê Mai Anh** (6 tuổi, Sóc Trăng) - Thông liên thất lớn.\n- Bé **Trần Quốc Huy** (3 tuổi, Đắk Lắk) - Tứ chứng Fallot.\n\nMọi chứng từ bệnh viện, hóa đơn đóng viện phí sẽ được chụp ảnh và tải lên mục "Bằng chứng Tác động" sau khi phẫu thuật thành công.`,
      image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800",
      categoryId: "cat-emergency",
      goalAmount: 300000000,
      raisedAmount: 95000000,
      status: "ACTIVE",
      organizerId: "user-current",
      creatorName: "Trái tim cho Em Foundation",
      dateCreated: "2026-06-15",
      dateEnded: "2026-09-15",
      isAnonymousApproved: false,
      targetBeneficiary: "Các bé mắc tim bẩm sinh thuộc hộ nghèo"
    },
    {
      id: "camp-forest",
      title: "Gieo Mầm Xanh - Trồng 10,000 cây tại Vườn Quốc gia Nam Cát Tiên",
      shortDescription: "Khôi phục thảm thực vật tự nhiên, phủ xanh đất trống đồi trọc và kiến tạo sinh cảnh bền vững cho động vật hoang dã.",
      description: `### Tại sao cần trồng rừng?\nVườn Quốc gia Nam Cát Tiên là lá phổi xanh cực kỳ quan trọng của vùng Đông Nam Bộ. Tuy nhiên, một số khu vực bìa rừng đã bị suy thoái nghiêm trọng do khai thác trước đây. \n\nChiến dịch **Gieo Mầm Xanh** nhằm gieo trồng các giống cây gỗ lớn bản địa như Gõ đỏ, Giáng hương, Bằng lăng và các loại cây ăn trái rừng nhằm cung cấp thức ăn cho các loài linh trưởng, chim muông hoang dã.\n\n### Mục tiêu dự án\n1. Mua **10,000 cây giống đạt chuẩn** (được ươm dưỡng ít nhất 6 tháng).\n2. Tổ chức đợt ra quân chăm sóc và dọn cỏ trong 2 năm đầu tiên nhằm đảm bảo tỉ lệ sống đạt trên 85%.\n3. Huy động 100+ tình nguyện viên tham gia ngày hội trồng rừng trực tiếp tại địa bàn.`,
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
      categoryId: "cat-environment",
      goalAmount: 100000000,
      raisedAmount: 45000000,
      status: "ACTIVE",
      organizerId: "user-admin",
      creatorName: "GreenFuture Vietnam",
      dateCreated: "2026-05-10",
      dateEnded: "2026-08-10",
      isAnonymousApproved: true,
      targetBeneficiary: "Hệ sinh thái rừng Nam Cát Tiên"
    }
  ],
  donations: [
    {
      id: "don-1",
      campaignId: "camp-hagiang",
      campaignTitle: "Xây dựng Trường học Vùng cao Mèo Vạc, Hà Giang",
      userId: "user-other-1",
      donorName: "Phạm Hải Đăng",
      amount: 50000000,
      isAnonymous: false,
      status: "SUCCESS",
      dateCreated: "2026-06-05 10:30",
      comment: "Chúc các con sớm có một ngôi trường mới thật khang trang và ấm áp để yên tâm học chữ nhé!",
      transactionCode: "TX6051030HD"
    },
    {
      id: "don-2",
      campaignId: "camp-flood",
      campaignTitle: "Cứu trợ khẩn cấp Lũ lụt miền Trung 2026",
      userId: "user-other-2",
      donorName: "Nhà hảo tâm ẩn danh",
      amount: 150000000,
      isAnonymous: true,
      status: "SUCCESS",
      dateCreated: "2026-06-26 14:15",
      comment: "Gửi chút tấm lòng chia sẻ khó khăn với bà con vùng lũ Quảng Bình. Mong bà con sớm vượt qua thiên tai.",
      transactionCode: "TX6261415AN"
    },
    {
      id: "don-3",
      campaignId: "camp-heart",
      campaignTitle: "Mổ tim nhân đạo cứu sống Trẻ em Nghèo hiếu học",
      userId: "user-current",
      donorName: "Nguyễn Kim Hoàng",
      amount: 15000000,
      isAnonymous: false,
      status: "SUCCESS",
      dateCreated: "2026-06-20 09:45",
      comment: "Mong ca phẫu thuật của bé Gia Bảo diễn ra thật thành công tốt đẹp!",
      transactionCode: "TX6200945KH"
    },
    {
      id: "don-4",
      campaignId: "camp-hagiang",
      campaignTitle: "Xây dựng Trường học Vùng cao Mèo Vạc, Hà Giang",
      userId: "user-other-3",
      donorName: "Lê Minh Tuấn",
      amount: 25000000,
      isAnonymous: false,
      status: "SUCCESS",
      dateCreated: "2026-06-12 16:50",
      comment: "Một viên gạch nhỏ chung sức dựng xây tương lai cho các em.",
      transactionCode: "TX6121650MT"
    }
  ],
  volunteerJobs: [
    {
      id: "vol-hagiang-teacher",
      title: "Dạy toán và tiếng Anh hè cho trẻ em vùng cao Hà Giang",
      description: "Hỗ trợ giảng dạy kiến thức cơ bản và tổ chức các trò chơi sinh hoạt hè cho học sinh nghèo tại xã Lũng Pù, Mèo Vạc. Bạn sẽ ăn ở cùng người dân bản địa.",
      skillsRequired: ["Giao tiếp tốt", "Có kỹ năng sư phạm cơ bản", "Yêu trẻ em", "Chịu khó"],
      hoursEarned: 40,
      pointsReward: 500,
      location: "Xã Lũng Pù, Mèo Vạc, Hà Giang",
      schedule: "Từ 15/07/2026 đến 30/07/2026 (15 ngày)",
      spotsLeft: 5,
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",
      campaignId: "camp-hagiang"
    },
    {
      id: "vol-flood-distributor",
      title: "Hỗ trợ bốc dỡ và phân phát nhu yếu phẩm khẩn cấp",
      description: "Tham gia tiếp nhận, đóng gói các thùng mì, bao gạo, nước sạch tại kho trung chuyển Quảng Bình và vận chuyển lên thuyền cứu trợ để phát tận tay bà con.",
      skillsRequired: ["Sức khỏe tốt", "Biết bơi", "Nhiệt tình", "Kỷ luật cao"],
      hoursEarned: 16,
      pointsReward: 200,
      location: "Thành phố Đồng Hới & Huyện Lệ Thủy, Quảng Bình",
      schedule: "Các ngày cuối tuần trong tháng 07/2026",
      spotsLeft: 12,
      image: "https://images.unsplash.com/photo-1469571486117-788ab9745744?auto=format&fit=crop&q=80&w=800",
      campaignId: "camp-flood"
    },
    {
      id: "vol-tree-planter",
      title: "Tình nguyện viên Trồng rừng cuối tuần tại Nam Cát Tiên",
      description: "Tham gia dọn dẹp thực bì, đào hố và xuống giống 1000 cây gõ đỏ đầu tiên trong chiến dịch. Ban tổ chức hỗ trợ xe di chuyển từ TP.HCM.",
      skillsRequired: ["Không ngại lấm bẩn", "Sức khỏe thể chất ổn định", "Yêu thiên nhiên"],
      hoursEarned: 8,
      pointsReward: 100,
      location: "Vườn Quốc gia Nam Cát Tiên, Đồng Nai",
      schedule: "Chủ Nhật, ngày 19/07/2026",
      spotsLeft: 30,
      image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800",
      campaignId: "camp-forest"
    }
  ],
  applications: [],
  verifications: [
    {
      id: "ver-1",
      orgName: "Hội Thiện Nguyện Ánh Sáng",
      repName: "Lê Thị Lan Anh",
      email: "anhsang@ngo.org",
      licenseUrl: "https://example.com/license-ngo.pdf",
      status: "PENDING",
      dateCreated: "2026-07-01"
    }
  ],
  reports: [
    {
      id: "rep-1",
      campaignId: "camp-forest",
      campaignTitle: "Gieo Mầm Xanh - Trồng 10,000 cây tại Vườn Quốc gia Nam Cát Tiên",
      reporterName: "Trần Thế Khoa",
      reason: "Sai lệch thông tin",
      description: "Hình ảnh cập nhật đợt gieo hạt giống này dường như là ảnh cũ từ năm ngoái. Yêu cầu ban quản trị làm rõ.",
      status: "PENDING",
      dateCreated: "2026-07-05"
    }
  ],
  disbursements: [
    {
      id: "disb-1",
      campaignId: "camp-hagiang",
      scheduledDate: "2026-06-15",
      totalAmount: 50000000,
      bankingProofUrl: "https://img.vietqr.io/image/970415-113366688-compact2.png",
      status: "APPROVED",
      description: "Rút đợt 1 mua 20 tấn xi măng san lấp mặt bằng móng mầm non Hà Giang."
    }
  ],
  impactProofs: [
    {
      id: "proof-1",
      campaignId: "camp-hagiang",
      title: "Hóa đơn mua xi măng đợt 1 - Hà Giang",
      content: "Báo cáo hóa đơn đỏ VAT mua xi măng từ Công ty Vật Liệu Hà Giang để san lấp móng phòng học mới.",
      proofImages: ["https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800"],
      spentAmount: 48500000,
      status: "APPROVED",
      dateCreated: "2026-06-22"
    }
  ],
  ledgers: [
    {
      id: "led-1",
      campaignId: "camp-hagiang",
      amount: 50000000,
      type: "CREDIT",
      referenceId: "don-1",
      balanceAfter: 50000000,
      dateCreated: "2026-06-05 10:30",
      description: "Nhận tiền quyên góp từ nhà tài trợ Phạm Hải Đăng"
    },
    {
      id: "led-2",
      campaignId: "camp-hagiang",
      amount: 25000000,
      type: "CREDIT",
      referenceId: "don-4",
      balanceAfter: 75000000,
      dateCreated: "2026-06-12 16:50",
      description: "Nhận tiền quyên góp từ nhà tài trợ Lê Minh Tuấn"
    },
    {
      id: "led-3",
      campaignId: "camp-flood",
      amount: 150000000,
      type: "CREDIT",
      referenceId: "don-2",
      balanceAfter: 150000000,
      dateCreated: "2026-06-26 14:15",
      description: "Nhận tiền quyên góp ẩn danh"
    },
    {
      id: "led-4",
      campaignId: "camp-heart",
      amount: 15000000,
      type: "CREDIT",
      referenceId: "don-3",
      balanceAfter: 15000000,
      dateCreated: "2026-06-20 09:45",
      description: "Nhận tiền quyên góp từ nhà tài trợ Nguyễn Kim Hoàng"
    }
  ],
  auditLogs: []
};

let dbCache: DatabaseSchema | null = null;
let savePromise: Promise<void> = Promise.resolve();

// Check if MySQL environment variables are defined
const isMySQLEnabled = !!(
  process.env.MYSQL_HOST &&
  process.env.MYSQL_DATABASE &&
  process.env.MYSQL_USER
);

let pool: mysql.Pool | null = null;

if (isMySQLEnabled) {
  try {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log("MySQL connection pool created successfully!");
  } catch (error) {
    console.error("Failed to create MySQL connection pool:", error);
  }
} else {
  console.log("MySQL environment is not configured. Running with local JSON database storage.");
}

class Mutex {
  private queue: Promise<void> = Promise.resolve();
  async acquire(): Promise<() => void> {
    let release: () => void;
    const next = new Promise<void>((resolve) => {
      release = resolve;
    });
    const current = this.queue;
    this.queue = next;
    await current;
    return release!;
  }
}

const dbMutex = new Mutex();

async function ensureTablesExist(p: mysql.Pool) {
  const tableQueries = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255),
      avatar TEXT,
      role VARCHAR(50) NOT NULL,
      bio TEXT,
      isBanned TINYINT(1) DEFAULT 0,
      impactPoints INT DEFAULT 0,
      impactHours INT DEFAULT 0,
      badges TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS campaigns (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      shortDescription TEXT,
      image TEXT,
      categoryId VARCHAR(255) NOT NULL,
      goalAmount BIGINT DEFAULT 0,
      raisedAmount BIGINT DEFAULT 0,
      status VARCHAR(50) NOT NULL,
      organizerId VARCHAR(255) NOT NULL,
      creatorName VARCHAR(255) NOT NULL,
      dateCreated VARCHAR(100) NOT NULL,
      dateEnded VARCHAR(100) NOT NULL,
      isAnonymousApproved TINYINT(1) DEFAULT 1,
      targetBeneficiary TEXT,
      rejectsReason TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS donations (
      id VARCHAR(255) PRIMARY KEY,
      campaignId VARCHAR(255) NOT NULL,
      campaignTitle VARCHAR(255) NOT NULL,
      userId VARCHAR(255) NOT NULL,
      donorName VARCHAR(255) NOT NULL,
      amount BIGINT DEFAULT 0,
      isAnonymous TINYINT(1) DEFAULT 0,
      status VARCHAR(50) NOT NULL,
      dateCreated VARCHAR(100) NOT NULL,
      comment TEXT,
      transactionCode VARCHAR(255) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS volunteer_jobs (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      skillsRequired TEXT,
      hoursEarned INT DEFAULT 0,
      pointsReward INT DEFAULT 0,
      location VARCHAR(255),
      schedule VARCHAR(255),
      spotsLeft INT DEFAULT 0,
      image TEXT,
      campaignId VARCHAR(255) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS applications (
      id VARCHAR(255) PRIMARY KEY,
      jobId VARCHAR(255) NOT NULL,
      jobTitle VARCHAR(255) NOT NULL,
      userId VARCHAR(255) NOT NULL,
      userName VARCHAR(255) NOT NULL,
      userEmail VARCHAR(255) NOT NULL,
      skills TEXT,
      availability VARCHAR(255),
      status VARCHAR(50) NOT NULL,
      dateCreated VARCHAR(100) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS verifications (
      id VARCHAR(255) PRIMARY KEY,
      orgName VARCHAR(255) NOT NULL,
      repName VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      licenseUrl TEXT,
      status VARCHAR(50) NOT NULL,
      dateCreated VARCHAR(100) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS reports (
      id VARCHAR(255) PRIMARY KEY,
      campaignId VARCHAR(255) NOT NULL,
      campaignTitle VARCHAR(255) NOT NULL,
      reporterName VARCHAR(255) NOT NULL,
      reason VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) NOT NULL,
      dateCreated VARCHAR(100) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS disbursements (
      id VARCHAR(255) PRIMARY KEY,
      campaignId VARCHAR(255) NOT NULL,
      scheduledDate VARCHAR(100) NOT NULL,
      totalAmount BIGINT DEFAULT 0,
      bankingProofUrl TEXT,
      status VARCHAR(50) NOT NULL,
      description TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS impact_proofs (
      id VARCHAR(255) PRIMARY KEY,
      campaignId VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      proofImages TEXT,
      spentAmount BIGINT DEFAULT 0,
      status VARCHAR(50) NOT NULL,
      dateCreated VARCHAR(100) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS ledgers (
      id VARCHAR(255) PRIMARY KEY,
      campaignId VARCHAR(255) NOT NULL,
      amount BIGINT DEFAULT 0,
      type VARCHAR(50) NOT NULL,
      referenceId VARCHAR(255) NOT NULL,
      balanceAfter BIGINT DEFAULT 0,
      dateCreated VARCHAR(100) NOT NULL,
      description TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(255) PRIMARY KEY,
      actorId VARCHAR(255) NOT NULL,
      actorName VARCHAR(255) NOT NULL,
      action VARCHAR(255) NOT NULL,
      targetId VARCHAR(255) NOT NULL,
      details TEXT,
      timestamp VARCHAR(100) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS images (
      id VARCHAR(255) PRIMARY KEY,
      file_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(255) NOT NULL,
      file_size INT NOT NULL,
      image_data LONGBLOB NOT NULL,
      created_at VARCHAR(100) NOT NULL
    )`
  ];

  for (const q of tableQueries) {
    await p.query(q);
  }
}

async function loadFromMySQL(): Promise<DatabaseSchema> {
  if (!pool) throw new Error("MySQL Pool is not initialized");

  const [usersRows] = await pool.query("SELECT * FROM users") as any[];
  const [campaignsRows] = await pool.query("SELECT * FROM campaigns") as any[];
  const [donationsRows] = await pool.query("SELECT * FROM donations") as any[];
  const [jobsRows] = await pool.query("SELECT * FROM volunteer_jobs") as any[];
  const [appsRows] = await pool.query("SELECT * FROM applications") as any[];
  const [versRows] = await pool.query("SELECT * FROM verifications") as any[];
  const [reportsRows] = await pool.query("SELECT * FROM reports") as any[];
  const [disbRows] = await pool.query("SELECT * FROM disbursements") as any[];
  const [proofRows] = await pool.query("SELECT * FROM impact_proofs") as any[];
  const [ledgRows] = await pool.query("SELECT * FROM ledgers") as any[];
  const [logsRows] = await pool.query("SELECT * FROM audit_logs") as any[];

  return {
    users: (usersRows || []).map((r: any) => ({
      ...r,
      isBanned: !!r.isBanned,
      impactPoints: Number(r.impactPoints),
      impactHours: Number(r.impactHours),
      badges: r.badges ? JSON.parse(r.badges) : []
    })),
    campaigns: (campaignsRows || []).map((r: any) => ({
      ...r,
      goalAmount: Number(r.goalAmount),
      raisedAmount: Number(r.raisedAmount),
      isAnonymousApproved: !!r.isAnonymousApproved
    })),
    donations: (donationsRows || []).map((r: any) => ({
      ...r,
      amount: Number(r.amount),
      isAnonymous: !!r.isAnonymous
    })),
    volunteerJobs: (jobsRows || []).map((r: any) => ({
      ...r,
      hoursEarned: Number(r.hoursEarned),
      pointsReward: Number(r.pointsReward),
      spotsLeft: Number(r.spotsLeft),
      skillsRequired: r.skillsRequired ? JSON.parse(r.skillsRequired) : []
    })),
    applications: appsRows || [],
    verifications: versRows || [],
    reports: reportsRows || [],
    disbursements: (disbRows || []).map((r: any) => ({
      ...r,
      totalAmount: Number(r.totalAmount)
    })),
    impactProofs: (proofRows || []).map((r: any) => ({
      ...r,
      spentAmount: Number(r.spentAmount),
      proofImages: r.proofImages ? JSON.parse(r.proofImages) : []
    })),
    ledgers: (ledgRows || []).map((r: any) => ({
      ...r,
      amount: Number(r.amount),
      balanceAfter: Number(r.balanceAfter)
    })),
    auditLogs: logsRows || []
  };
}

async function loadFromMySQLSafe(): Promise<DatabaseSchema> {
  if (!pool) throw new Error("MySQL Pool is not initialized");
  try {
    return await loadFromMySQL();
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || (error.message && error.message.includes("doesn't exist"))) {
      console.log("MySQL tables do not exist. Creating and seeding initial database...");
      await ensureTablesExist(pool);
      // Check if seed is needed
      const [usersCheck] = await pool.query("SELECT COUNT(*) as count FROM users") as any[];
      if (usersCheck[0]?.count === 0) {
        await saveToMySQL(INITIAL_DB);
      }
      return await loadFromMySQL();
    }
    throw error;
  }
}

async function saveToMySQL(data: DatabaseSchema) {
  if (!pool) return;

  // 1. Users
  for (const u of data.users) {
    await pool.query(
      `INSERT INTO users (id, name, email, password, avatar, role, bio, isBanned, impactPoints, impactHours, badges)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name), email=VALUES(email), password=VALUES(password), avatar=VALUES(avatar), role=VALUES(role), bio=VALUES(bio),
         isBanned=VALUES(isBanned), impactPoints=VALUES(impactPoints), impactHours=VALUES(impactHours), badges=VALUES(badges)`,
      [u.id, u.name, u.email, u.password || null, u.avatar, u.role, u.bio, u.isBanned ? 1 : 0, u.impactPoints, u.impactHours, JSON.stringify(u.badges)]
    );
  }

  // 2. Campaigns
  for (const c of data.campaigns) {
    await pool.query(
      `INSERT INTO campaigns (id, title, description, shortDescription, image, categoryId, goalAmount, raisedAmount, status, organizerId, creatorName, dateCreated, dateEnded, isAnonymousApproved, targetBeneficiary, rejectsReason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title=VALUES(title), description=VALUES(description), shortDescription=VALUES(shortDescription), image=VALUES(image), categoryId=VALUES(categoryId),
         goalAmount=VALUES(goalAmount), raisedAmount=VALUES(raisedAmount), status=VALUES(status), organizerId=VALUES(organizerId), creatorName=VALUES(creatorName),
         dateCreated=VALUES(dateCreated), dateEnded=VALUES(dateEnded), isAnonymousApproved=VALUES(isAnonymousApproved), targetBeneficiary=VALUES(targetBeneficiary), rejectsReason=VALUES(rejectsReason)`,
      [c.id, c.title, c.description, c.shortDescription, c.image, c.categoryId, c.goalAmount, c.raisedAmount, c.status, c.organizerId, c.creatorName, c.dateCreated, c.dateEnded, c.isAnonymousApproved ? 1 : 0, c.targetBeneficiary, c.rejectsReason || null]
    );
  }

  // 3. Donations
  for (const d of data.donations) {
    await pool.query(
      `INSERT INTO donations (id, campaignId, campaignTitle, userId, donorName, amount, isAnonymous, status, dateCreated, comment, transactionCode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         campaignId=VALUES(campaignId), campaignTitle=VALUES(campaignTitle), userId=VALUES(userId), donorName=VALUES(donorName),
         amount=VALUES(amount), isAnonymous=VALUES(isAnonymous), status=VALUES(status), dateCreated=VALUES(dateCreated), comment=VALUES(comment), transactionCode=VALUES(transactionCode)`,
      [d.id, d.campaignId, d.campaignTitle, d.userId, d.donorName, d.amount, d.isAnonymous ? 1 : 0, d.status, d.dateCreated, d.comment || null, d.transactionCode]
    );
  }

  // 4. Volunteer Jobs
  for (const j of data.volunteerJobs) {
    await pool.query(
      `INSERT INTO volunteer_jobs (id, title, description, skillsRequired, hoursEarned, pointsReward, location, schedule, spotsLeft, image, campaignId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title=VALUES(title), description=VALUES(description), skillsRequired=VALUES(skillsRequired), hoursEarned=VALUES(hoursEarned),
         pointsReward=VALUES(pointsReward), location=VALUES(location), schedule=VALUES(schedule), spotsLeft=VALUES(spotsLeft), image=VALUES(image), campaignId=VALUES(campaignId)`,
      [j.id, j.title, j.description, JSON.stringify(j.skillsRequired), j.hoursEarned, j.pointsReward, j.location, j.schedule, j.spotsLeft, j.image, j.campaignId]
    );
  }

  // 5. Applications
  for (const a of data.applications) {
    await pool.query(
      `INSERT INTO applications (id, jobId, jobTitle, userId, userName, userEmail, skills, availability, status, dateCreated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         jobId=VALUES(jobId), jobTitle=VALUES(jobTitle), userId=VALUES(userId), userName=VALUES(userName), userEmail=VALUES(userEmail),
         skills=VALUES(skills), availability=VALUES(availability), status=VALUES(status), dateCreated=VALUES(dateCreated)`,
      [a.id, a.jobId, a.jobTitle, a.userId, a.userName, a.userEmail, a.skills, a.availability, a.status, a.dateCreated]
    );
  }

  // 6. Verifications
  for (const v of data.verifications) {
    await pool.query(
      `INSERT INTO verifications (id, orgName, repName, email, licenseUrl, status, dateCreated)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         orgName=VALUES(orgName), repName=VALUES(repName), email=VALUES(email), licenseUrl=VALUES(licenseUrl), status=VALUES(status), dateCreated=VALUES(dateCreated)`,
      [v.id, v.orgName, v.repName, v.email, v.licenseUrl, v.status, v.dateCreated]
    );
  }

  // 7. Reports
  for (const r of data.reports) {
    await pool.query(
      `INSERT INTO reports (id, campaignId, campaignTitle, reporterName, reason, description, status, dateCreated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         campaignId=VALUES(campaignId), campaignTitle=VALUES(campaignTitle), reporterName=VALUES(reporterName), reason=VALUES(reason),
         description=VALUES(description), status=VALUES(status), dateCreated=VALUES(dateCreated)`,
      [r.id, r.campaignId, r.campaignTitle, r.reporterName, r.reason, r.description, r.status, r.dateCreated]
    );
  }

  // 8. Disbursements
  for (const db of data.disbursements) {
    await pool.query(
      `INSERT INTO disbursements (id, campaignId, scheduledDate, totalAmount, bankingProofUrl, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         campaignId=VALUES(campaignId), scheduledDate=VALUES(scheduledDate), totalAmount=VALUES(totalAmount), bankingProofUrl=VALUES(bankingProofUrl),
         status=VALUES(status), description=VALUES(description)`,
      [db.id, db.campaignId, db.scheduledDate, db.totalAmount, db.bankingProofUrl, db.status, db.description]
    );
  }

  // 9. Impact Proofs
  for (const p of data.impactProofs) {
    await pool.query(
      `INSERT INTO impact_proofs (id, campaignId, title, content, proofImages, spentAmount, status, dateCreated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         campaignId=VALUES(campaignId), title=VALUES(title), content=VALUES(content), proofImages=VALUES(proofImages),
         spentAmount=VALUES(spentAmount), status=VALUES(status), dateCreated=VALUES(dateCreated)`,
      [p.id, p.campaignId, p.title, p.content, JSON.stringify(p.proofImages), p.spentAmount, p.status, p.dateCreated]
    );
  }

  // 10. Ledgers
  for (const l of data.ledgers) {
    await pool.query(
      `INSERT INTO ledgers (id, campaignId, amount, type, referenceId, balanceAfter, dateCreated, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         campaignId=VALUES(campaignId), amount=VALUES(amount), type=VALUES(type), referenceId=VALUES(referenceId),
         balanceAfter=VALUES(balanceAfter), dateCreated=VALUES(dateCreated), description=VALUES(description)`,
      [l.id, l.campaignId, l.amount, l.type, l.referenceId, l.balanceAfter, l.dateCreated, l.description]
    );
  }

  // 11. Audit Logs
  for (const log of data.auditLogs) {
    await pool.query(
      `INSERT INTO audit_logs (id, actorId, actorName, action, targetId, details, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         actorId=VALUES(actorId), actorName=VALUES(actorName), action=VALUES(action), targetId=VALUES(targetId),
         details=VALUES(details), timestamp=VALUES(timestamp)`,
      [log.id, log.actorId, log.actorName, log.action, log.targetId, log.details, log.timestamp]
    );
  }
}

export async function runTransaction<T>(fn: (db: DatabaseSchema) => Promise<T> | T): Promise<T> {
  const release = await dbMutex.acquire();
  try {
    const db = await getDB();
    const dbClone: DatabaseSchema = JSON.parse(JSON.stringify(db));
    const result = await fn(dbClone);
    await saveDB(dbClone);
    return result;
  } finally {
    release();
  }
}

export async function getDB(): Promise<DatabaseSchema> {
  if (isMySQLEnabled && pool) {
    try {
      dbCache = await loadFromMySQLSafe();
      return dbCache;
    } catch (error) {
      console.error("MySQL getDB failed, falling back to local JSON:", error);
    }
  }

  if (dbCache) {
    return dbCache;
  }
  try {
    const content = await fsPromises.readFile(DB_FILE_PATH, "utf-8");
    dbCache = JSON.parse(content);
    if (!dbCache!.auditLogs) {
      dbCache!.auditLogs = [];
    }
    return dbCache!;
  } catch (error) {
    dbCache = JSON.parse(JSON.stringify(INITIAL_DB));
    await saveDB(dbCache!);
    return dbCache!;
  }
}

export async function saveDB(data: DatabaseSchema): Promise<void> {
  dbCache = data;

  if (isMySQLEnabled && pool) {
    try {
      await saveToMySQL(data);
      return;
    } catch (error) {
      console.error("MySQL saveDB failed, falling back to local JSON:", error);
    }
  }

  savePromise = savePromise.then(async () => {
    const tempPath = `${DB_FILE_PATH}.tmp`;
    await fsPromises.writeFile(tempPath, JSON.stringify(data, null, 2), "utf-8");
    await fsPromises.rename(tempPath, DB_FILE_PATH);
  });
  return savePromise;
}

const IMAGES_FILE_PATH = path.join(process.cwd(), "db-images.json");

export async function saveImage(id: string, fileName: string, mimeType: string, fileSize: number, buffer: Buffer): Promise<void> {
  const createdAt = new Date().toISOString();
  if (isMySQLEnabled && pool) {
    await pool.query(
      `INSERT INTO images (id, file_name, mime_type, file_size, image_data, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, fileName, mimeType, fileSize, buffer, createdAt]
    );
  } else {
    let images: any = {};
    try {
      const data = await fsPromises.readFile(IMAGES_FILE_PATH, "utf-8");
      images = JSON.parse(data);
    } catch(e) {}
    images[id] = { id, fileName, mimeType, fileSize, createdAt, data: buffer.toString('base64') };
    await fsPromises.writeFile(IMAGES_FILE_PATH, JSON.stringify(images));
  }
}

export async function getImage(id: string): Promise<{ mimeType: string, buffer: Buffer } | null> {
  if (isMySQLEnabled && pool) {
    const [rows] = await pool.query("SELECT mime_type, image_data FROM images WHERE id = ?", [id]) as any[];
    if (rows && rows.length > 0) {
      return { mimeType: rows[0].mime_type, buffer: rows[0].image_data };
    }
    return null;
  } else {
    try {
      const data = await fsPromises.readFile(IMAGES_FILE_PATH, "utf-8");
      const images = JSON.parse(data);
      if (images[id]) {
        return { mimeType: images[id].mimeType, buffer: Buffer.from(images[id].data, 'base64') };
      }
    } catch(e) {}
    return null;
  }
}

export async function deleteImage(id: string): Promise<boolean> {
  if (isMySQLEnabled && pool) {
    const [result] = await pool.query("DELETE FROM images WHERE id = ?", [id]) as any[];
    return !!(result && result.affectedRows > 0);
  } else {
    try {
      const data = await fsPromises.readFile(IMAGES_FILE_PATH, "utf-8");
      const images = JSON.parse(data);
      if (images[id]) {
        delete images[id];
        await fsPromises.writeFile(IMAGES_FILE_PATH, JSON.stringify(images));
        return true;
      }
    } catch(e) {}
    return false;
  }
}

export async function deleteCampaign(id: string): Promise<Campaign | null> {
  const release = await dbMutex.acquire();
  try {
    const db = await getDB();
    const index = db.campaigns.findIndex((c) => c.id === id);
    if (index !== -1) {
      const [camp] = db.campaigns.splice(index, 1);
      
      // Delete from MySQL
      if (isMySQLEnabled && pool) {
        await pool.query("DELETE FROM campaigns WHERE id = ?", [id]);
      }
      
      // Save JSON
      await saveDB(db);
      return camp;
    }
    return null;
  } finally {
    release();
  }
}

