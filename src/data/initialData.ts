import { CampaignCategory, Campaign, VolunteerJob, Donation, User, CampaignLedger } from "../types";

export const INITIAL_CATEGORIES: CampaignCategory[] = [
  { id: "cat-emergency", name: "Cứu trợ & Y tế", icon: "HeartPulse" },
  { id: "cat-education", name: "Giáo dục & Trẻ em", icon: "GraduationCap" },
  { id: "cat-environment", name: "Môi trường & Động vật", icon: "Leaf" },
  { id: "cat-poverty", name: "Hoàn cảnh khó khăn", icon: "HandHelping" }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-hagiang",
    title: "Xây dựng Trường học Vùng cao Mèo Vạc, Hà Giang",
    shortDescription: "Góp gạch xây trường, thắp sáng ước mơ học chữ cho hơn 150 trẻ em nghèo người Mông tại xã Lũng Pù, Hà Giang.",
    description: `### Giới thiệu dự án
Xã Lũng Pù là một trong những địa bàn khó khăn nhất của huyện Mèo Vạc, Hà Giang. Hiện tại, hơn 150 trẻ em mầm non và tiểu học đang phải học trong các lớp tạm bợ bằng tranh tre nứa lá, gió lùa buốt giá vào mùa đông và dột nát vào mùa mưa.

KindWave phát động chiến dịch quyên góp nhằm xây dựng **3 phòng học kiên cố**, 1 khu vệ sinh khép kín và trang bị đầy đủ bàn ghế, bảng viết, sách vở cho các em.

### Kế hoạch triển khai
- **Giai đoạn 1:** Khảo sát, san lấp mặt bằng và chuẩn bị vật liệu xây dựng (Gạch, xi măng, sắt thép).
- **Giai đoạn 2:** Thi công phần móng, đổ cột và tường bao.
- **Giai đoạn 3:** Hoàn thiện mái lợp chống nóng, lát gạch, lắp cửa và hệ thống chiếu sáng.
- **Giai đoạn 4:** Nghiệm thu, bàn giao trường mới và tổ chức lễ khai giảng.

Mọi khoản đóng góp và giải ngân sẽ được công khai minh bạch 100% qua sổ cái hệ thống KindWave.`,
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
    description: `### Tình hình khẩn cấp
Trận bão số 2 vừa qua đã gây mưa lớn cục bộ, sạt lở đất và lũ quét nghiêm trọng tại nhiều khu vực thuộc tỉnh Quảng Bình. Hàng ngàn ngôi nhà ngập sâu trong nước, người dân mất hoàn toàn tài sản, lương thực và đối mặt với nguy cơ thiếu nước uống sạch, dịch bệnh bùng phát.

### Hoạt động cứu trợ của KindWave
Chúng tôi phối hợp cùng lực lượng cứu hộ địa phương để phân phát trực tiếp:
1. **1000 thùng mì ăn liền & lương khô.**
2. **2000 bình nước tinh khiết (20L).**
3. **1000 túi thuốc gia đình** (thuốc cảm, bông băng, thuốc sát trùng, thuốc trị nước ăn chân).
4. **Hỗ trợ tiền mặt khẩn cấp** cho các gia đình bị sập nhà hoàn toàn (10,000,000 VNĐ/hộ).

Chúng tôi cam kết ghi nhận từng đồng quyên góp, cập nhật trực tiếp hóa đơn nhập lương thực ngay khi mua hàng để người quyên góp tiện theo dõi.`,
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
    description: `### Ý nghĩa chương trình
Bệnh tim bẩm sinh có thể chữa khỏi hoàn toàn nếu được phẫu thuật kịp thời. Tuy nhiên, chi phí một ca mổ tim dao động từ 80 đến 150 triệu VNĐ - một con số không tưởng đối với các gia đình nghèo làm nông, làm thuê ở vùng sâu vùng xa.

KindWave hợp tác cùng Viện Tim TP.HCM để sàng lọc và tài trợ phẫu thuật cho các bé có chỉ định khẩn cấp. Mỗi ca mổ thành công là một cuộc đời của bé và một gia đình được cứu sống.

### Danh sách thụ hưởng đợt này
- Bé **Nguyễn Gia Bảo** (4 tuổi, Quảng Ngãi) - Suy tim độ 3.
- Bé **Lê Mai Anh** (6 tuổi, Sóc Trăng) - Thông liên thất lớn.
- Bé **Trần Quốc Huy** (3 tuổi, Đắk Lắk) - Tứ chứng Fallot.

Mọi chứng từ bệnh viện, hóa đơn đóng viện phí sẽ được chụp ảnh và tải lên mục "Bằng chứng Tác động" sau khi phẫu thuật thành công.`,
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800",
    categoryId: "cat-emergency",
    goalAmount: 300000000,
    raisedAmount: 95000000,
    status: "ACTIVE",
    organizerId: "user-4",
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
    description: `### Tại sao cần trồng rừng?
Vườn Quốc gia Nam Cát Tiên là lá phổi xanh cực kỳ quan trọng của vùng Đông Nam Bộ. Tuy nhiên, một số khu vực bìa rừng đã bị suy thoái nghiêm trọng do khai thác trước đây. 

Chiến dịch **Gieo Mầm Xanh** nhằm gieo trồng các giống cây gỗ lớn bản địa như Gõ đỏ, Giáng hương, Bằng lăng và các loại cây ăn trái rừng nhằm cung cấp thức ăn cho các loài linh trưởng, chim muông hoang dã.

### Mục tiêu dự án
1. Mua **10,000 cây giống đạt chuẩn** (được ươm dưỡng ít nhất 6 tháng).
2. Tổ chức đợt ra quân chăm sóc và dọn cỏ trong 2 năm đầu tiên nhằm đảm bảo tỉ lệ sống đạt trên 85%.
3. Huy động 100+ tình nguyện viên tham gia ngày hội trồng rừng trực tiếp tại địa bàn.`,
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
    categoryId: "cat-environment",
    goalAmount: 100000000,
    raisedAmount: 45000000,
    status: "ACTIVE",
    organizerId: "user-5",
    creatorName: "GreenFuture Vietnam",
    dateCreated: "2026-05-10",
    dateEnded: "2026-08-10",
    isAnonymousApproved: true,
    targetBeneficiary: "Hệ sinh thái rừng Nam Cát Tiên"
  }
];

export const INITIAL_VOLUNTEER_JOBS: VolunteerJob[] = [
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
];

export const INITIAL_DONATIONS: Donation[] = [
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
];

export const INITIAL_LEDGERS: CampaignLedger[] = [
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
];

export const DEFAULT_USER: User = {
  id: "user-current",
  name: "Nguyễn Kim Hoàng",
  email: "ngkimhoang05@gmail.com",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
  role: "USER",
  bio: "Nhà hảo tâm và là tình nguyện viên tích cực, đam mê các hoạt động bảo vệ môi trường và hỗ trợ trẻ em nghèo vùng cao.",
  isBanned: false,
  impactPoints: 280,
  impactHours: 12,
  badges: ["Đại sứ Hy vọng", "Chiến binh Xanh"]
};
