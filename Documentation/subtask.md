# KINDWAVE — MASTER EXECUTION PLAN (v2.0)

Linear Progression — Subtask được sắp xếp theo thứ tự mở khóa. Đã loại bỏ các hạng mục hạ tầng đã hoàn thiện (Idempotency, Health, Axios Mutex, Token-storage, Prisma Extension chặn delete, Error Handler).

---

## PHASE 0 — ĐÓNG BĂNG NỀN MÓNG (Foundation Freeze)

Mục tiêu: Khóa schema và các quyết định kiến trúc trước khi bất kỳ ai code nghiệp vụ. Đây là tuyến critical-path chặn toàn bộ team.

### [T-01] Hoàn thiện và Đóng băng Prisma Schema
- Nhánh Git: `feat/KW-25-finalize-prisma-schema`
- Files dự kiến tác động: `BE/prisma/schema.prisma`
- Lô-gíc cốt lõi: Bổ sung field `deletedAt DateTime?` vào toàn bộ model cần soft-delete (User, Campaign, Donation, Review, Report) để khớp với Prisma Extension đã chặn `.delete()`. Thêm 3 model còn thiếu: `Category`, `Review`, `Report`. Thống nhất tên field tiền là `raisedAmount` (loại bỏ `current_amount`).
- Điều kiện mở khóa (Blocker): None

### [T-02] Chốt Hợp đồng Kiến trúc (Architecture Contract)
- Nhánh Git: `chore/KW-26-align-architecture-contracts`
- Files dự kiến tác động: `Documentation/Contract.md`, `BE/prisma/schema.prisma`, `FE/src/features/authentication/store/auth.store.ts`
- Lô-gíc cốt lõi: Giải quyết 2 xung đột tài liệu vs code: (1) Chốt Role casing đồng nhất giữa FE (`"User"|"Admin"`) và Prisma enum (`USER|ADMIN`). (2) Chốt cơ chế Refresh Token (localStorage hiện hữu vs HttpOnly Cookie theo doc). Ghi quyết định ra file Contract để cả team bám theo.
- Điều kiện mở khóa (Blocker): None

### [T-03] Thực thi Migration và Seed Dữ liệu mẫu
- Nhánh Git: `feat/KW-25-finalize-prisma-schema`
- Files dự kiến tác động: `BE/prisma/migrations/`, `BE/prisma/seed.ts`
- Lô-gíc cốt lõi: Tạo migration đầu tiên từ schema đã chốt. Viết script seed sinh 2 tài khoản Admin, 3 User, 4 Campaign mẫu (có sẵn `raisedAmount`) và danh mục Category để cả team có data dùng chung khi test.
- Điều kiện mở khóa (Blocker): T-01

---

## PHASE 1 — LÕI ĐỊNH DANH (Identity Core)

Mục tiêu: Có Token và Auth Middleware. Mọi API cần đăng nhập ở các Phase sau đều phụ thuộc Phase này.

### [T-04] API Đăng ký (Register)
- Nhánh Git: `feat/KW-03-auth-register-api`
- Files dự kiến tác động: `BE/src/modules/auth/auth.controller.ts`, `auth.service.ts`, `auth.routes.ts`, `auth.schema.ts`
- Lô-gíc cốt lõi: Validate input qua Zod, băm mật khẩu bằng Bcrypt, tạo User mới với role mặc định USER. Trả về cấu trúc response chuẩn `{ success, data, message }`.
- Điều kiện mở khóa (Blocker): T-03

### [T-05] API Đăng nhập và Cấp phát JWT
- Nhánh Git: `feat/KW-04-auth-login-jwt-api`
- Files dự kiến tác động: `BE/src/modules/auth/auth.service.ts`, `auth.controller.ts`
- Lô-gíc cốt lõi: So khớp password Bcrypt, sinh Access Token (trả JSON) và Refresh Token (lưu theo cơ chế đã chốt ở T-02). Gắn rate-limiter login đã có sẵn.
- Điều kiện mở khóa (Blocker): T-04

### [T-06] Auth Guard Middleware (verifyToken)
- Nhánh Git: `feat/KW-04-auth-login-jwt-api`
- Files dự kiến tác động: `BE/src/middlewares/auth.middleware.ts`
- Lô-gíc cốt lõi: Middleware giải mã Access Token từ header, gắn `req.user`. Hỗ trợ phân quyền theo role (USER/ADMIN). Đây là chìa khóa mở mọi route bảo mật phía sau.
- Điều kiện mở khóa (Blocker): T-05

### [T-07] API Logout và Refresh Token Rotation
- Nhánh Git: `feat/KW-05-auth-logout-refresh-token`
- Files dự kiến tác động: `BE/src/modules/auth/auth.service.ts`
- Lô-gíc cốt lõi: Logout đẩy Refresh Token vào Blacklist Redis với TTL bằng đúng hạn token. Endpoint `/auth/refresh` cấp cặp token mới (khớp đúng URL mà axios.ts FE đang gọi).
- Điều kiện mở khóa (Blocker): T-06

### [T-08] Luồng Quên mật khẩu (OTP Email)
- Nhánh Git: `feat/KW-06-auth-forgot-password-flow`
- Files dự kiến tác động: `BE/src/modules/auth/auth.service.ts`, `BE/src/lib/mailer.ts`
- Lô-gíc cốt lõi: Sinh OTP 6 số gửi qua Nodemailer, lưu Redis TTL 5 phút. API xác thực OTP cho phép đặt lại mật khẩu mới (băm Bcrypt).
- Điều kiện mở khóa (Blocker): T-05

---

## PHASE 2 — HẠ TẦNG GIAO DIỆN VÀ KẾT NỐI (Shell & Connectivity)

Mục tiêu: Dựng vỏ giao diện và kênh realtime. Chạy song song với Phase 1 (không phụ thuộc Auth API).

### [T-09] Cài đặt Shadcn UI và Layout chuẩn
- Nhánh Git: `chore/KW-01-init-react-vite-shadcn`
- Files dự kiến tác động: `FE/components.json`, `FE/src/components/common/MainLayout.tsx`, `AuthLayout.tsx`
- Lô-gíc cốt lõi: Cấu hình Shadcn nhả component vào `src/components/common`. Dựng `MainLayout` (Navbar có nút Đăng nhập/Avatar và Footer) và `AuthLayout` (màn chia đôi cho Login/Register).
- Điều kiện mở khóa (Blocker): None

### [T-10] Hạ tầng Realtime Socket.io
- Nhánh Git: `feat/KW-09-notification-socketio-service`
- Files dự kiến tác động: `BE/src/lib/socket.server.ts`, `FE/src/lib/socket-client.ts`
- Lô-gíc cốt lõi: Khởi tạo Socket.io server gắn vào HTTP server hiện có, thiết lập kênh broadcast donation. Viết client kết nối phía FE. Health check và Idempotency middleware đã có sẵn, không làm lại.
- Điều kiện mở khóa (Blocker): None

### [T-11] Màn hình Auth (Login/Register UI)
- Nhánh Git: `feat/KW-03-auth-register-api`
- Files dự kiến tác động: `FE/src/features/authentication/index.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`
- Lô-gíc cốt lõi: Thay stub bằng form thật (react-hook-form và Zod), gọi API qua TanStack Query, cập nhật `useAuthStore` (Zustand). Tận dụng ProtectedRoute đã có.
- Điều kiện mở khóa (Blocker): T-05, T-09

---

## PHASE 3 — DOMAIN CHIẾN DỊCH (Campaign Domain)

Mục tiêu: CRUD chiến dịch và danh mục. Phụ thuộc Auth Guard để xác định Creator.

### [T-12] API Danh mục và Cache Redis
- Nhánh Git: `feat/KW-14-category-list-cache-redis`
- Files dự kiến tác động: `BE/src/modules/category/category.service.ts`, `category.controller.ts`
- Lô-gíc cốt lõi: API liệt kê Category, ưu tiên đọc Redis cache; cache-miss mới truy vấn DB rồi set lại Redis. Phục vụ filter ở màn Explore.
- Điều kiện mở khóa (Blocker): T-03

### [T-13] API Tạo chiến dịch (Draft/Pending)
- Nhánh Git: `feat/KW-10-campaign-create-draft-api`
- Files dự kiến tác động: `BE/src/modules/campaign/campaign.service.ts`, `campaign.controller.ts`, `campaign.schema.ts`
- Lô-gíc cốt lõi: Validate Zod, sanitize HTML mô tả bằng DOMPurify phía BE, tạo Campaign status PENDING gắn `organizerId` từ `req.user`. Chưa hiển thị public cho tới khi Admin duyệt.
- Điều kiện mở khóa (Blocker): T-06, T-12

### [T-14] API Tìm kiếm / Lọc / Phân trang
- Nhánh Git: `feat/KW-11-campaign-search-filter-pagination`
- Files dự kiến tác động: `BE/src/modules/campaign/campaign.service.ts`
- Lô-gíc cốt lõi: Query danh sách Campaign status ACTIVE, hỗ trợ filter theo Category, search keyword, phân trang offset/limit. Loại bỏ bản ghi có `deletedAt`.
- Điều kiện mở khóa (Blocker): T-13

### [T-15] API Chi tiết chiến dịch (Public View)
- Nhánh Git: `feat/KW-12-campaign-detail-public-view`
- Files dự kiến tác động: `BE/src/modules/campaign/campaign.service.ts`
- Lô-gíc cốt lõi: Trả chi tiết 1 Campaign kèm thông tin Creator, tiến độ `raisedAmount/goalAmount`, danh sách donation công khai (ẩn người donate ẩn danh).
- Điều kiện mở khóa (Blocker): T-13

### [T-16] API Chủ xị Sửa / Xóa mềm chiến dịch
- Nhánh Git: `feat/KW-13-campaign-owner-edit-softdelete`
- Files dự kiến tác động: `BE/src/modules/campaign/campaign.service.ts`
- Lô-gíc cốt lõi: Chỉ Creator sở hữu mới sửa/xóa được, và chỉ khi chưa có donation SUCCESS. Xóa nghĩa là set `deletedAt` (qua Extension đã chặn hard-delete).
- Điều kiện mở khóa (Blocker): T-15

---

## PHASE 4 — ĐỘNG CƠ TIỀN TỆ VÀ SỔ CÁI (Money Engine)

Mục tiêu: Ledger là nguồn sự thật. Đây là phần lõi giá trị nhất, mọi giao dịch tiền đi qua đây.

### [T-17] Ledger Service (Credit / Debit)
- Nhánh Git: `feat/KW-17-campaign-ledger-recording-service`
- Files dự kiến tác động: `BE/src/modules/ledger/ledger.service.ts`
- Lô-gíc cốt lõi: `recordCredit()` ghi dòng cộng tiền, `recordDebit()` ghi dòng trừ tiền vào `Campaign_Ledger`, tính `balanceAfter`. Mọi thao tác phải nằm trong DB Transaction để đảm bảo toàn vẹn.
- Điều kiện mở khóa (Blocker): T-03

### [T-18] Atomic Increment số dư chiến dịch
- Nhánh Git: `fix/KW-19-atomic-increment-current-amount`
- Files dự kiến tác động: `BE/src/modules/campaign/campaign.repository.ts`
- Lô-gíc cốt lõi: Hàm cập nhật `raisedAmount` bắt buộc dùng `{ increment: amount }` của DB engine (cấm đọc-rồi-cộng bằng JS) để chống Race Condition khi nhiều lượt donate đồng thời.
- Điều kiện mở khóa (Blocker): T-17

### [T-19] API Tạo phiên Donation (Create Session)
- Nhánh Git: `feat/KW-15-donation-create-session-api`
- Files dự kiến tác động: `BE/src/modules/donation/donation.service.ts`, `donation.controller.ts`
- Lô-gíc cốt lõi: Nhận `campaignId, amount, isAnonymous`, validate số tiền dương, tạo Donation status PENDING và Transaction PENDING, trả về fake checkout URL (`/mock-pay/:sessionId`) thay cho URL VNPay thật.
- Điều kiện mở khóa (Blocker): T-06, T-15

### [T-20] Mock Payment Webhook Handler
- Nhánh Git: `feat/KW-16-mock-payment-handler`
- Files dự kiến tác động: `BE/src/modules/donation/payment.service.ts`, `donation.routes.ts`
- Lô-gíc cốt lõi: Endpoint nhận xác nhận thanh toán giả lập, đi qua Idempotency Middleware (đã có sẵn). Trong 1 DB Transaction: chuyển Donation thành SUCCESS, gọi `incrementCurrentAmount` (T-18) và `recordCredit` (T-17). Spam nhiều lần chỉ cộng tiền 1 lần.
- Điều kiện mở khóa (Blocker): T-18, T-19

### [T-21] API Lịch sử Donation của User
- Nhánh Git: `feat/KW-18-donation-history-user-view`
- Files dự kiến tác động: `BE/src/modules/donation/donation.service.ts`
- Lô-gíc cốt lõi: Trả danh sách donation của `req.user` kèm trạng thái và campaign liên quan, phân trang. Phục vụ trang Sao kê tác động cá nhân.
- Điều kiện mở khóa (Blocker): T-20

### [T-22] Job Đối soát Ledger ban đêm
- Nhánh Git: `feat/KW-17-campaign-ledger-recording-service`
- Files dự kiến tác động: `BE/src/jobs/ledger-reconciliation.job.ts`
- Lô-gíc cốt lõi: Chạy định kỳ kiểm tra `SUM(creditAmount) - SUM(debitAmount) == Campaign.raisedAmount`. Nếu lệch, bắn cảnh báo qua Pino logger để phát hiện sai số tài chính.
- Điều kiện mở khóa (Blocker): T-20

---

## PHASE 5 — GIAO DIỆN NGHIỆP VỤ CHÍNH (Public Frontend)

Mục tiêu: Móc nối UI với toàn bộ API đã có. Đây là nơi convert UI Stitch sang React.

### [T-23] HomeScreen
- Nhánh Git: `feat/KW-12-campaign-detail-public-view`
- Files dự kiến tác động: `FE/src/features/home/index.tsx`, `HomeScreen.tsx`, `HomeScreen.styles.ts`
- Lô-gíc cốt lõi: Ticker tiền chạy (nghe Socket.io từ T-10), Hero banner, 3 cột Trust Pillars, lưới 3 chiến dịch khẩn cấp (data từ T-14). Tuân thủ Colocation.
- Điều kiện mở khóa (Blocker): T-10, T-14

### [T-24] CampaignExploreScreen
- Nhánh Git: `feat/KW-11-campaign-search-filter-pagination`
- Files dự kiến tác động: `FE/src/features/campaign/explore/index.tsx`
- Lô-gíc cốt lõi: Sticky search bar, thanh trượt Category (T-12), lưới 6 thẻ campaign, bộ phân trang. Dữ liệu qua TanStack Query (cấm useEffect và useState fetch list).
- Điều kiện mở khóa (Blocker): T-12, T-14

### [T-25] CampaignDetailScreen và DOMPurify
- Nhánh Git: `feat/KW-12-campaign-detail-public-view`
- Files dự kiến tác động: `FE/src/features/campaign/detail/index.tsx`
- Lô-gíc cốt lõi: Grid 7-5, cột phải là Sticky Donate Card và thanh tiến độ phần trăm, CTA bám đáy (`fixed bottom-0`) trên mobile. Render `description` bắt buộc qua DOMPurify chống XSS.
- Điều kiện mở khóa (Blocker): T-15

### [T-26] CreateCampaignWizard (Stepper 3 bước)
- Nhánh Git: `feat/KW-10-campaign-create-draft-api`
- Files dự kiến tác động: `FE/src/features/campaign/create/index.tsx`
- Lô-gíc cốt lõi: Form Stepper 3 bước, gõ bên trái thì mockup preview bên phải nhảy realtime. Submit gọi API tạo Draft (T-13), nối nút tải ảnh với API upload (T-31).
- Điều kiện mở khóa (Blocker): T-13, T-31

### [T-27] Luồng Mock Checkout UI
- Nhánh Git: `feat/KW-15-donation-create-session-api`
- Files dự kiến tác động: `FE/src/features/payment/MockCheckout.tsx`, `PaymentReturn.tsx`
- Lô-gíc cốt lõi: Nút Quyên góp gọi create-session (T-19), redirect tới trang Mock Checkout với 2 nút Thành công/Thất bại, gửi webhook kèm `X-Idempotency-Key` (UUID v4), về trang kết quả. Nhận toast realtime từ Socket.io.
- Điều kiện mở khóa (Blocker): T-20, T-25

---

## PHASE 6 — TÀI KHOẢN VÀ NIỀM TIN (Profile & Trust)

Mục tiêu: Hoàn thiện hồ sơ, upload, đánh giá, tố cáo.

### [T-28] API Hồ sơ cá nhân (Profile CRUD)
- Nhánh Git: `feat/KW-07-profile-crud-api`
- Files dự kiến tác động: `BE/src/modules/profile/profile.service.ts`
- Lô-gíc cốt lõi: `GET /profile/me` và `PUT /profile/me` cập nhật tên, SĐT, địa chỉ, tiểu sử của `req.user`. Validate Zod.
- Điều kiện mở khóa (Blocker): T-06

### [T-29] API Upload ảnh (Cloudinary / Mock)
- Nhánh Git: `feat/KW-08-avatar-upload-cloudinary`
- Files dự kiến tác động: `BE/src/modules/upload/upload.service.ts`, `BE/src/middlewares/multer.middleware.ts`
- Lô-gíc cốt lõi: Nhận file qua Multer, đẩy lên Cloudinary trả về `secure_url`. Nếu không có tài khoản thật thì fallback trả URL placeholder (cần chốt với team).
- Điều kiện mở khóa (Blocker): T-06

### [T-30] UI Trang Profile và Gắn Avatar
- Nhánh Git: `feat/KW-07-profile-crud-api`
- Files dự kiến tác động: `FE/src/features/profile/index.tsx`
- Lô-gíc cốt lõi: Form xem/sửa hồ sơ, nút Thay đổi Avatar gọi API upload (T-29). Hiển thị lịch sử donation (T-21).
- Điều kiện mở khóa (Blocker): T-28, T-29

### [T-31] API Upload sẵn sàng cho Wizard
- Nhánh Git: `feat/KW-08-avatar-upload-cloudinary`
- Files dự kiến tác động: `BE/src/modules/upload/upload.controller.ts`
- Lô-gíc cốt lõi: Hoàn thiện endpoint upload đa dụng (avatar và ảnh chiến dịch) để T-26 (Wizard) tiêu thụ. Tách rõ để mở khóa luồng tạo campaign.
- Điều kiện mở khóa (Blocker): T-29

### [T-32] API Đánh giá (Review & Rating)
- Nhánh Git: `feat/KW-20-review-rating-crud`
- Files dự kiến tác động: `BE/src/modules/review/review.service.ts`
- Lô-gíc cốt lõi: `POST /reviews` gửi 1-5 sao kèm bình luận. Bắt buộc kiểm tra User đã có Donation status SUCCESS ở campaign này chưa; nếu chưa ném lỗi 403.
- Điều kiện mở khóa (Blocker): T-20

### [T-33] API Tố cáo chiến dịch (Report)
- Nhánh Git: `feat/KW-21-report-campaign-api`
- Files dự kiến tác động: `BE/src/modules/report/report.service.ts`
- Lô-gíc cốt lõi: `POST /reports` cho User gửi đơn tố cáo campaign vi phạm, lưu trạng thái PENDING chờ Admin xử lý.
- Điều kiện mở khóa (Blocker): T-15

---

## PHASE 7 — QUẢN TRỊ VIÊN (Admin Domain)

Mục tiêu: Cổng vận hành, kiểm duyệt, giải ngân. Phụ thuộc Auth Guard role ADMIN và Ledger.

### [T-34] Admin Portal Layout
- Nhánh Git: `feat/KW-22-admin-user-ban-unban`
- Files dự kiến tác động: `FE/src/features/admin/AdminLayout.tsx`
- Lô-gíc cốt lõi: Sidebar 5 mục (Dashboard, Quản lý User, Kiểm duyệt Chiến dịch, Giải ngân, Tố cáo). Bọc trong ProtectedRoute role ADMIN.
- Điều kiện mở khóa (Blocker): T-06, T-09

### [T-35] API Quản lý User và Khóa/Mở tài khoản
- Nhánh Git: `feat/KW-22-admin-user-ban-unban`
- Files dự kiến tác động: `BE/src/modules/admin/admin-user.service.ts`
- Lô-gíc cốt lõi: `GET /admin/users` (phân trang) và `PATCH /admin/users/:id/toggle-ban`. Khóa dùng soft mechanism (set trạng thái/`deletedAt`), không hard-delete.
- Điều kiện mở khóa (Blocker): T-34

### [T-36] API Thống kê Dashboard Admin
- Nhánh Git: `feat/KW-22-admin-user-ban-unban`
- Files dự kiến tác động: `BE/src/modules/admin/admin-stats.service.ts`
- Lô-gíc cốt lõi: Tổng hợp tổng User, tổng tiền hệ thống (từ Ledger), số Campaign đang ACTIVE phục vụ widget Dashboard.
- Điều kiện mở khóa (Blocker): T-17, T-35

### [T-37] Workflow Kiểm duyệt chiến dịch
- Nhánh Git: `feat/KW-23-admin-campaign-moderate-workflow`
- Files dự kiến tác động: `BE/src/modules/admin/moderation.service.ts`
- Lô-gíc cốt lõi: `GET /admin/campaigns/pending` và `PATCH /:id/moderate`. status ACTIVE thì đẩy public; status REJECTED kèm reason thì trả về Creator kèm lý do từ chối.
- Điều kiện mở khóa (Blocker): T-13, T-34

### [T-38] Xử lý đơn Tố cáo
- Nhánh Git: `feat/KW-23-admin-campaign-moderate-workflow`
- Files dự kiến tác động: `BE/src/modules/admin/report-handling.service.ts`
- Lô-gíc cốt lõi: `GET /admin/reports` liệt kê đơn, Admin có thể xóa mềm chiến dịch vi phạm (set `deletedAt`).
- Điều kiện mở khóa (Blocker): T-33, T-37

### [T-39] Luồng Giải ngân và Khóa đợt (Disbursement Lock)
- Nhánh Git: `feat/KW-24-admin-disbursement-impact-proof`
- Files dự kiến tác động: `BE/src/modules/admin/disbursement.service.ts`
- Lô-gíc cốt lõi: `POST /admin/disbursements` tạo phiếu giải ngân, chuyển Campaign sang DISBURSING, gọi `recordDebit` (T-17). Logic khóa: chặn (403) tạo phiếu đợt 2 nếu chứng từ đợt 1 chưa được duyệt.
- Điều kiện mở khóa (Blocker): T-17, T-37

### [T-40] Duyệt Bằng chứng tác động (Impact Proof)
- Nhánh Git: `feat/KW-24-admin-disbursement-impact-proof`
- Files dự kiến tác động: `BE/src/modules/admin/impact.service.ts`
- Lô-gíc cốt lõi: Creator nộp chứng từ (ảnh và nội dung), Admin duyệt/từ chối. Duyệt thành công mới mở khóa cho phép tạo phiếu giải ngân đợt tiếp theo.
- Điều kiện mở khóa (Blocker): T-39

### [T-41] UI Admin các màn quản trị
- Nhánh Git: `feat/KW-24-admin-disbursement-impact-proof`
- Files dự kiến tác động: `FE/src/features/admin/users/`, `moderation/`, `disbursement/`
- Lô-gíc cốt lõi: Móc nối UI với các API Admin (T-35 đến T-40): bảng User, hàng đợi duyệt campaign, màn giải ngân và upload chứng từ. Tận dụng AdminLayout.
- Điều kiện mở khóa (Blocker): T-35, T-37, T-39, T-40

---

## PHASE 8 — KIỂM THỬ TÍCH HỢP VÀ ĐÓNG GÓI (Hardening)

Mục tiêu: Xác minh end-to-end các DoD trọng yếu trước khi bàn giao.

### [T-42] Kiểm thử End-to-End luồng tiền
- Nhánh Git: `chore/KW-27-e2e-money-flow-test`
- Files dự kiến tác động: `BE/tests/money-flow.test.ts`
- Lô-gíc cốt lõi: Xác minh 3 DoD trọng yếu: spam mock-webhook 3 lần chỉ cộng tiền 1 lần; nạp 50tr và rút 20tr ra số dư 30tr với đúng 2 dòng Ledger; chặn giải ngân đợt 2 trả 403.
- Điều kiện mở khóa (Blocker): T-20, T-39

### [T-43] Kiểm thử Responsive và Self-Review
- Nhánh Git: `chore/KW-28-ui-responsive-audit`
- Files dự kiến tác động: Toàn bộ `FE/src/features/`
- Lô-gíc cốt lõi: Rà 2 mốc màn hình iPhone 12 (390px) và Macbook (1440px): CTA donate bám đáy mobile, không scroll ngang. Dọn sạch console.log và debugger theo DoD Checklist.
- Điều kiện mở khóa (Blocker): T-27, T-41

---

Tổng: 43 Subtask, 8 Phase. Critical path: T-01, T-03, T-06 (Auth Guard), T-17/T-18 (Money Engine), T-20, T-39. Các Phase UI (2, 5) chạy song song khi API tương ứng sẵn sàng.
