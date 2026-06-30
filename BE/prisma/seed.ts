import { PrismaClient, Role, CampaignStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = "Password123!";

const CATEGORIES = [
  { name: "Thiên tai & Bão lũ", slug: "thien-tai-bao-lu", description: "Cứu trợ khẩn cấp vùng thiên tai" },
  { name: "Y tế & Sức khỏe", slug: "y-te-suc-khoe", description: "Hỗ trợ chi phí điều trị bệnh hiểm nghèo" },
  { name: "Giáo dục", slug: "giao-duc", description: "Học bổng và trang thiết bị học tập" },
  { name: "Trẻ em & Người già", slug: "tre-em-nguoi-gia", description: "Chăm lo nhóm yếu thế" },
];

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  // --- Categories ---
  await Promise.all(
    CATEGORIES.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: c,
      })
    )
  );
  const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });

  // --- Admin accounts (2) ---
  const admins = await Promise.all(
    [
      { email: "admin1@kindwave.vn", fullName: "Quản trị viên Một" },
      { email: "admin2@kindwave.vn", fullName: "Quản trị viên Hai" },
    ].map((a) =>
      prisma.user.upsert({
        where: { email: a.email },
        update: {},
        create: { email: a.email, fullName: a.fullName, passwordHash, role: Role.ADMIN },
      })
    )
  );

  // --- Standard users (3) ---
  const users = await Promise.all(
    [
      { email: "user1@kindwave.vn", fullName: "Nguyễn Văn An" },
      { email: "user2@kindwave.vn", fullName: "Trần Thị Bình" },
      { email: "user3@kindwave.vn", fullName: "Lê Hoàng Cường" },
    ].map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: { email: u.email, fullName: u.fullName, passwordHash, role: Role.USER },
      })
    )
  );

  // --- Sample campaigns (4) with preset raisedAmount ---
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (users.length < 3 || categories.length < 4) {
    throw new Error("Seed prerequisites missing: need at least 3 users and 4 categories.");
  }
  const [user1, user2, user3] = users as [(typeof users)[number], (typeof users)[number], (typeof users)[number]];

  const campaignSeeds = [
    { title: "Cứu trợ lũ lụt miền Trung 2026", goalAmount: "500000000", raisedAmount: "320000000", category: categories[0], organizer: user1 },
    { title: "Phẫu thuật tim cho bé Minh Khang", goalAmount: "200000000", raisedAmount: "200000000", category: categories[1], organizer: user2 },
    { title: "Xây trường vùng cao Hà Giang", goalAmount: "800000000", raisedAmount: "150000000", category: categories[2], organizer: user3 },
    { title: "Bữa cơm cho cụ già neo đơn", goalAmount: "100000000", raisedAmount: "45000000", category: categories[3], organizer: user1 },
  ];

  for (const c of campaignSeeds) {
    if (!c.category) continue;
    const exists = await prisma.campaign.findFirst({ where: { title: c.title } });
    if (exists) continue;
    await prisma.campaign.create({
      data: {
        title: c.title,
        description: `<p>Chiến dịch mẫu: ${c.title}. Mọi đóng góp đều được ghi nhận minh bạch trên Sổ cái.</p>`,
        goalAmount: c.goalAmount,
        raisedAmount: c.raisedAmount,
        status: CampaignStatus.ACTIVE,
        startDate: now,
        endDate: in30Days,
        organizerId: c.organizer.id,
        categoryId: c.category.id,
      },
    });
  }

  console.log(`Seeded ${admins.length} admins, ${users.length} users, ${campaignSeeds.length} campaigns, ${categories.length} categories.`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
