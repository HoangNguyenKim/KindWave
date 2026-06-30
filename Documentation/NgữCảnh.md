# 1. Project Overview

- **Project name:** KindWave
- **Project purpose:** Nền tảng quyên góp từ thiện ngang hàng phi lợi nhuận (P2P Crowdfunding for Charity). Slogan: "Spreading kindness through connection."
- **Main business goals:** Đem lại sự minh bạch tuyệt đối về dòng tiền từ thiện từ đầu vào đến đầu ra bằng công nghệ, loại bỏ rủi ro gian lận và xóa bỏ sự nghi ngờ từ cộng đồng mạng.
- **Problems being solved:** 
  - Khủng hoảng niềm tin trong từ thiện: Donor không biết tiền của mình thực tế đi đâu.
  - Creator (cá nhân/nhóm nhỏ) khó kêu gọi và dễ bị mang tiếng "ăn chặn".
  - Sập hệ thống khi có sự kiện nóng (ví dụ bão lũ), lỗi đối soát tiền với ngân hàng.
- **Current scope:** Tập trung vào cốt lõi gây quỹ, tích hợp cổng VNPay webhook tự động, giải ngân theo tiến độ có xác nhận bằng hóa đơn/chứng từ thực tế (Impact Proof). KHÔNG làm ví nội bộ, KHÔNG crypto, KHÔNG chat trực tiếp.

=================================================

# 2. Project Vision

- **Long-term vision:** Trở thành "ống dẫn minh bạch" đáng tin cậy nhất Việt Nam nối liền nhà hảo tâm và người cần giúp đỡ, nơi mọi đồng tiền đều có dấu vết tác động rõ ràng trên Sổ cái (Ledger).
- **Expected outcome:** Một hệ thống ổn định, chịu tải cao, tuyệt đối không thể làm giả số liệu, tự động hóa quy trình đối soát với ngân hàng 100%.
- **User value:** Mang lại sự an tâm tuyệt đối cho người cho đi (Donor) và bảo vệ danh dự, tạo uy tín cho người đứng ra kêu gọi (Creator).

=================================================

# 3. Actors

**Name:** USER (Người dùng tiêu chuẩn)
- **Responsibilities:** Đóng cả 2 vai trò: Người quyên góp (Donor) và Người kêu gọi (Creator).
- **Allowed actions:** 
  - (Với tư cách Donor): Tìm kiếm chiến dịch, Quyên góp tiền (chọn công khai hoặc ẩn danh), Xem "Sao kê tác động", Để lại đánh giá (chỉ khi đã quyên góp).
  - (Với tư cách Creator): Tạo chiến dịch gây quỹ, Chỉnh sửa/Xóa (khi chưa có ai quyên góp), Viết bài cập nhật tác động sau khi nhận giải ngân.

**Name:** ADMIN (Quản trị viên hệ thống)
- **Responsibilities:** Nhân sự vận hành và kiểm soát rủi ro của nền tảng.
- **Allowed actions:** 
  - (Moderator): Duyệt/Từ chối chiến dịch, Ẩn/Xóa bình luận rác, Khóa tài khoản lừa đảo.
  - (Treasurer): Xem tổng tiền chiến dịch, Thực hiện chuyển khoản giải ngân ngoài đời thực, Nhập Ủy nhiệm chi (Banking Proof) vào hệ thống để ghi nhận đã giải ngân.

=================================================

# 4. Technology Stack

- **Frontend:** React, Vite, TailwindCSS (Shadcn UI).
- **Backend:** Node.js, Express, TypeScript.
- **Database:** MySQL, Prisma ORM.
- **Cache:** Redis.
- **Authentication:** JWT (Stateless - Access Token & Refresh Token trong HttpOnly Cookie).
- **Validation:** Zod.
- **State Management:** TanStack Query (Server State), Zustand / Redux Toolkit (Client State).
- **DevOps:** Docker (Dockerfile & docker-compose.yml).

=================================================

# 5. Architecture Decisions (DO NOT CHANGE)

- **Soft delete only:** Tuyệt đối KHÔNG dùng `.delete()` trong Prisma. Bắt buộc cập nhật `deleted_at = new Date()`.
  *Why:* Bảo vệ toàn vẹn lịch sử dòng tiền và dữ liệu kế toán, không làm mất vết các ràng buộc khóa ngoại (Foreign Keys).
- **Feature-based architecture (Colocation) ở Frontend:** Component phải gom chung file `index.tsx`, `.styles.ts`, `.types.ts` trong cùng thư mục tính năng.
  *Why:* Giúp code dễ đọc, dễ bảo trì, module hóa tốt khi dự án scale lớn.
- **No direct DB access inside Controller/UI:** Controller chỉ xử lý req/res. Tương tác DB phải được ủy quyền cho Service layer.
  *Why:* Tách biệt rành mạch logic nghiệp vụ (Separation of Concerns).
- **Atomic Updates for Money:** Cập nhật tiền bắt buộc dùng `{ increment: amount }`. Cấm lấy giá trị hiện tại rồi tự cộng vào bằng code JS.
  *Why:* Tránh Race Condition, sai số tiền tệ khi có hàng nghìn lượt quyên góp cùng lúc.
- **Idempotency Key for Payments:** Mọi Webhook và thao tác liên quan dòng tiền bắt buộc gửi kèm `X-Idempotency-Key` để kiểm tra qua Redis.
  *Why:* Ngăn chặn cộng trùng tiền nếu VNPay gửi 1 giao dịch nhiều lần (mất mạng, retry webhook).
- **Sanitize HTML strings:** Bắt buộc dùng `DOMPurify` trên Backend/Frontend trước khi lưu hoặc render văn bản từ Rich Text.
  *Why:* Chống tấn công XSS.

=================================================

# 6. Current Folder Architecture

```text
KindWave/
├── BE/                   (Backend Node.js/Express)
│   ├── prisma/           (Prisma schema & migrations)
│   └── src/
│       ├── config/       (Database, Redis, etc.)
│       ├── errors/       (Custom error classes)
│       ├── middlewares/  (Global error, auth, validation)
│       ├── utils/        (Helper functions)
│       ├── app.ts        (Express app setup)
│       └── server.ts     (Server entry point)
├── FE/                   (Frontend React/Vite)
│   └── src/
│       ├── components/   (Shared UI/Shadcn)
│       ├── config/       (Env, Constants)
│       ├── features/     (Feature-based modules)
│       ├── lib/          (Axios, Utils)
│       ├── routes/       (React Router setup)
│       ├── App.tsx
│       └── main.tsx
└── Documentation/
```

=================================================

# 7. Database Status

**Current entities:**
- `Users`
- `Donations` (id, user_id, campaign_id, amount, status, is_anonymous...)
- `Transactions` (id, donation_id, transaction_code, payment_method, amount, status...)
- `Campaign_Ledgers` (id, campaign_id, amount, type, reference_id...)
- `Disbursements` (id, campaign_id, scheduled_date, total_amount, banking_proof_url, status...)
- `Campaign_Impacts` (id, campaign_id, title, content, proof_images, spent_amount...)

**Relationships:**
- User 1:N Campaign (Creator)
- User 1:N Donations (Donor)
- Campaign 1:N Donations
- Donation 1:1 Transaction
- Campaign 1:N Campaign_Ledgers
- Campaign 1:N Disbursements
- Campaign 1:N Campaign_Impacts

**Special rules:**
- Bảng `Campaign_Ledgers` (Sổ cái) là nguồn sự thật duy nhất xác định số dư hiện tại của chiến dịch.
- **Soft delete strategy:** Bắt buộc áp dụng cho Users, Campaigns và các Comment/Reviews. Cấm dùng câu lệnh xóa vật lý trong database.

=================================================

# 8. Current Completed Progress

Completed:

✓ Frontend React/Vite initialization with base architecture folders (chore/KW-01)

✓ Backend Express boilerplate setup (chore/KW-02)

✓ Docker & docker-compose environment setup

✓ Custom Error Handlers & Global Middlewares skeleton

=================================================

# 9. Current In Progress

In Progress:

- Cấu trúc Models Prisma (User, Campaign, Ledger)
- Khung cấu trúc Authentication API
- Cài đặt và tích hợp thư viện Prisma Client / Zod validation

=================================================

# 10. Pending Tasks

Priority 1: Khai báo đầy đủ Prisma Schema Models & Thực thi Migration (Users, Campaigns, Donations, Ledgers, etc.)

Priority 2: `feat/KW-03-auth-register-api` (Xây dựng luồng Đăng ký tài khoản - Hash password Bcrypt, Zod Schema)

Priority 3: `feat/KW-04-auth-login-jwt-api` (Xây dựng luồng Đăng nhập, cấp phát JWT Tokens)

=================================================

# 11. Known Problems / Risks

- **Existing limitations:** Toàn bộ DB Schema ở Backend chưa được cụ thể hóa vào file `prisma/schema.prisma` một cách hoàn chỉnh.
- **Technical debt:** Frontend chưa hoàn tất tích hợp Shadcn UI. Thiếu các thư viện core như Axios instance, React Query QueryClient.
- **Performance concerns:** Việc truy vấn danh mục chiến dịch (Campaign Categories) cần đảm bảo hit Redis cache thay vì gọi DB ở các giai đoạn sau.
- **Security concerns:** Rủi ro sai lệch dữ liệu tài chính tại luồng VNPay Webhook; cần bám sát yêu cầu thiết lập Idempotency và DB Locking / Atomic increment.

=================================================

# 12. Development Rules

**Coding standards:** TypeScript thuần túy, Error handling chuẩn xác không dùng catch bọc rác.

**Folder rules:** Tuân thủ chặt chẽ kiến trúc Feature-based Colocation ở Frontend. Tách lớp Controller, Service, Repository ở Backend.

**Import rules:** Khuyến khích dùng alias path (`@/...`) nếu đã được setup.

**Naming conventions:** 
- Git Branch: `<type>/KW-<ticket_id>-<kebab-case-desc>`
- Commits: `<type>(<scope>): <message>`

**Forbidden patterns:**

Forbidden:
- Khai báo kiểu `any` trong TypeScript.
- Dùng `prisma.xxx.delete()` hoặc thực thi câu lệnh SQL xóa thực.
- Hardcode Secrets, JWT keys, Database passwords vào source code.
- Xử lý Business Logic ngay bên trong UI Components hoặc Route Handlers.
- Tin tưởng hoàn toàn vào dữ liệu Client gửi lên mà không chạy qua Zod validator.

=================================================

# 13. Next Immediate Action

"What should be implemented next"
- **Task:** Viết schema cấu trúc Database (`schema.prisma`) và code luồng Đăng ký người dùng (`feat/KW-03-auth-register-api`).

**Files to create:**
- `BE/prisma/schema.prisma` (Cập nhật Models)
- `BE/src/controllers/auth.controller.ts`
- `BE/src/services/auth.service.ts`
- `BE/src/routes/auth.routes.ts`

**Dependencies needed:** `bcrypt` (hoặc `bcryptjs`), `jsonwebtoken`, `zod`.

**Expected outcome:** Backend có thể chạy `npx prisma db push` / `migrate dev` thành công để tạo bảng. Gọi API POST `/auth/register` mã hóa được password và tạo mới User hợp lệ trong Database.

=================================================

# 14. AI Instructions

- Read architecture first
- Do not change existing decisions
- Preserve folder structure
- Preserve typing
- Avoid circular dependencies
- Maintain project consistency