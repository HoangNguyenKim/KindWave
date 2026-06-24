# TÀI LIỆU ĐẶC TẢ NGỮ CẢNH & TỔNG QUAN HỆ THỐNG (PRD & SRS)
**DỰ ÁN: KINDWAVE – NỀN TẢNG QUYÊN GÓP TỪ THIỆN NGANG HÀNG**  
*Phiên bản: 2.0.0 (Bản chốt kiến trúc - Cấm sửa đổi Scope)*

---

## PHẦN 1: TỔNG QUAN & BỐI CẢNH DỰ ÁN (PROJECT OVERVIEW)

### 1.1 Tuyên ngôn dự án
* **Tên thương mại:** KindWave
* **Slogan:** *"Spreading kindness through connection."*
* **Mô hình kinh doanh (Business Model):** P2P Crowdfunding for Charity (Quyên góp cộng đồng ngang hàng phi lợi nhuận).

### 1.2 Bối cảnh thị trường & Bài toán cần giải (The Problem)
Thị trường từ thiện hiện tại đang khủng hoảng về **"Niềm tin"**:
1. **Về phía người đi quyên góp (Donors):** Họ ngần ngại xuống tiền vì không biết tiền của mình thực tế đi về đâu. Các nền tảng cũ chỉ hiện con số "Đã quyên góp: 100 triệu" nhưng không chứng minh được 100 triệu đó đã biến thành bao nhiêu ký gạo, bao nhiêu viên thuốc.
2. **Về phía người cần giúp đỡ (Creators):** Các cá nhân/cộng đồng nhỏ khó tiếp cận các quỹ từ thiện lớn. Họ tự đứng ra kêu gọi thì dễ bị cộng đồng mạng nghi ngờ là "lừa đảo, ngâm tiền, ăn chặn".
3. **Về mặt kỹ thuật:** Các app từ thiện hiện tại thường dính "phốt" sập web khi có một sự kiện nóng (ví dụ: bão lũ) khiến hàng chục ngàn người vào donate cùng lúc, hoặc dính lỗi "trừ tiền ngân hàng nhưng trên web không ghi nhận".

### 1.3 Giải pháp của KindWave (The Solution)
KindWave không định vị mình là một "ví tiền", mà định vị là một **"Ống dẫn minh bạch"**. Chúng tôi giải quyết 3 bài toán trên bằng 3 trụ cột kỹ thuật:
* **Minh bạch đầu vào:** Tiền donate được đối soát tự động qua Webhook ngân hàng và ghi vào **Sổ cái hệ thống (Campaign Ledger)**.
* **Minh bạch đầu ra:** Áp dụng cơ chế **"Giải ngân theo tiến độ" (Milestone Disbursement)**. Chủ chiến dịch không được cầm 100% tiền một lần. Họ xài tiền đợt 1, phải chụp ảnh hóa đơn đỏ/hình ảnh thực tế up lên mục `Impact Proof` (Minh bạch tác động), Admin duyệt xong mới được giải ngân đợt 2.
* **Bảo vệ danh tính:** Người dùng có quyền ẩn danh với xã hội (public), nhưng danh tính của họ luôn được lưu khóa cứng trong Database để phục vụ cơ quan điều tra khi xảy ra sự cố pháp lý.

---

## PHẦN 2: PHẠM VI HỆ THỐNG & ĐỊNH NGHĨA VAI TRÒ (SYSTEM SCOPE)

Hệ thống tuân thủ nghiêm ngặt **Quy tắc 2 Nửa thế giới**. Mọi tài khoản truy cập vào KindWave chỉ thuộc 1 trong 2 nhóm sau:

### 2.1 Đối tượng 1: USER (Người dùng tiêu chuẩn)
*Không có sự phân biệt giữa "Tài khoản cá nhân" và "Tài khoản tổ chức". Một User sở hữu cả 2 năng lực:*

1. **Năng lực đi cho (Donor Role):**
   * Tìm kiếm, xem chi tiết chiến dịch.
   * Quyên góp tiền (chọn công khai hoặc ẩn danh).
   * Xem "Sao kê tác động" của chiến dịch mình đã gửi tiền.
   * Để lại đánh giá (Rating/Review) – *Lưu ý: Chỉ được review nếu user_id đó đã thực sự donate thành công vào chiến dịch.*
2. **Năng lực kêu gọi (Creator Role):**
   * Tạo chiến dịch gây quỹ (bị gắn trạng thái `Pending`).
   * Chỉnh sửa thông tin chiến dịch (chỉ được sửa khi cam đang ở `Pending` hoặc `Rejected`).
   * Xóa chiến dịch của mình (chỉ được xóa khi chưa có ai donate đồng nào).
   * Viết bài cập nhật tác động (Impact Updates) sau khi nhận tiền giải ngân.

### 2.2 Đối tượng 2: ADMIN (Quản trị viên hệ thống)
*Là nhân sự nội bộ của nền tảng, nắm quyền vận hành:*

1. **Kiểm duyệt (Moderator):** Duyệt hoặc Từ chối chiến dịch mới; Xóa/Ẩn bình luận rác; Khóa tài khoản User lừa đảo.
2. **Thủ quỹ (Treasurer):** Xem tổng tiền gom được của một chiến dịch; Thực hiện chuyển khoản ngoài đời thực cho Creator; Nhập Ủy nhiệm chi ngân hàng vào hệ thống để ghi nhận đã "Giải ngân".

### 2.3 Ranh giới cấm (OUT-OF-SCOPE - Cấm triển khai trong MVP)
* **KHÔNG** làm tính năng Ví nội bộ (User không nạp tiền vào KindWave để "để dành", tiền đi thẳng từ tài khoản ngân hàng của User qua cổng thanh toán VNPay vào tài khoản ngân hàng của KindWave).
* **KHÔNG** làm tính năng Đăng ký làm Tình nguyện viên (Volunteer).
* **KHÔNG** làm tính năng Chat trực tiếp giữa Donor và Creator.
* **KHÔNG** tích hợp thanh toán bằng Crypto (Bitcoin/USDT).

---

## PHẦN 3: TỪ ĐIỂN NGÔN NGỮ HỆ THỐNG (UBIQUITOUS GLOSSARY)

*Để dev Frontend, dev Backend và QC không cãi nhau về từ vựng, toàn bộ team phải thống nhất dùng các danh từ tiếng Anh sau trong code:*

| Danh từ chuẩn | Ý nghĩa trong nghiệp vụ | Ví dụ sai cần tránh |
| :--- | :--- | :--- |
| **Donation** | Một *Lệnh quyên góp* do user tạo ra (có thể thành công hoặc bị hủy). | `Payment`, `Order` |
| **Transaction** | Một *Giao dịch ngân hàng* thực tế do VNPay trả về mang theo mã giao dịch. | `BankingRecord` |
| **Ledger** | *Sổ cái* - Nơi duy nhất định đoạt một chiến dịch đang có bao nhiêu tiền. | `MoneyTable` |
| **Disbursement** | *Giải ngân* - Hành động Admin chuyển tiền từ quỹ KindWave cho Creator. | `Payout`, `Transfer` |
| **Impact Proof** | *Bằng chứng tác động* - Hóa đơn mua hàng, ảnh chụp trao quà của Creator. | `ResultImage` |

---

## PHẦN 4: KIẾN TRÚC DỮ LIỆU CHUẨN HÓA (CORE ENTITIES v2.0)

* **`Donations`**: `id | user_id | campaign_id | amount | is_anonymous | status: ['PENDING', 'SUCCESS', 'FAILED'] | created_at`
* **`Transactions`**: `id | donation_id | transaction_code | payment_method | amount | status | created_at`
* **`Campaign_Ledgers`**: `id | campaign_id | amount | type: ['CREDIT', 'DEBIT'] | reference_id | created_at`
* **`Disbursements`**: `id | campaign_id | scheduled_date | total_amount | banking_proof_url | status: ['PENDING', 'TRANSFERRED', 'REJECTED']`
* **`Campaign_Impacts`**: `id | campaign_id | title | content | proof_images (JSON) | spent_amount | created_at`

---

## PHẦN 5: CHIẾN LƯỢC CHIA NHÁNH GIT (24 ATOMIC BRANCHES)

*Quy tắc: Xuất phát từ nhánh `develop`. 1 Pull Request không được vượt quá 20 files, bắt buộc merge trong 48 giờ.*

### Epic 1: Core & Auth (6 nhánh)
* `chore/KW-01-init-react-vite-shadcn`
* `chore/KW-02-init-express-prisma-docker`
* `feat/KW-03-auth-register-api`
* `feat/KW-04-auth-login-jwt-api`
* `feat/KW-05-auth-logout-refresh-token`
* `feat/KW-06-auth-forgot-password-flow`

### Epic 2: Profile & Notif (3 nhánh)
* `feat/KW-07-profile-crud-api`
* `feat/KW-08-avatar-upload-cloudinary`
* `feat/KW-09-notification-socketio-service`

### Epic 3: Campaign Hub (5 nhánh)
* `feat/KW-10-campaign-create-draft-api`
* `feat/KW-11-campaign-search-filter-pagination`
* `feat/KW-12-campaign-detail-public-view`
* `feat/KW-13-campaign-owner-edit-softdelete`
* `feat/KW-14-category-list-cache-redis`

### Epic 4: Donation & Ledger (5 nhánh - Cốt lõi dòng tiền)
* `feat/KW-15-donation-create-session-api`
* `feat/KW-16-vnpay-webhook-idempotent-handler`
* `feat/KW-17-campaign-ledger-recording-service`
* `feat/KW-18-donation-history-user-view`
* `fix/KW-19-atomic-increment-current-amount`

### Epic 5: Trust Domain (2 nhánh)
* `feat/KW-20-review-rating-crud`
* `feat/KW-21-report-campaign-api`

### Epic 6: Admin Domain (3 nhánh)
* `feat/KW-22-admin-user-ban-unban`
* `feat/KW-23-admin-campaign-moderate-workflow`
* `feat/KW-24-admin-disbursement-impact-proof`

---

## PHẦN 6: BIỂU ĐỒ USE-CASE VÀ VÒNG ĐỜI NGHIỆP VỤ

### 6.1 Biểu đồ Use-Case Tổng quan (Mermaid)

~~~mermaid
flowchart LR
    U[/ USER /]:::actorStyle
    A[/ ADMIN /]:::actorStyle

    subgraph User_Subsystem [USER DOMAIN]
        direction TB
        U1([1. Auth: Register / Login / Logout / Reset])
        U2([2. Profile: View / Update / View History])
        U3([3. Campaign: Search & Filter / View Detail])
        U4([4. Campaign: Create / Edit / Soft-Delete])
        U5([5. Donation: Donate Money / Donate Anonymously])
        U6([6. Impact: Track Campaign Progress & Proofs])
        U7([7. Community: Rate / Review / Report])
    end

    subgraph Admin_Subsystem [ADMIN DOMAIN]
        direction TB
        A1([8. User Mgmt: View All / Suspend / Ban])
        A2([9. Moderate Campaign: Approve / Reject])
        A3([10. Financial Mgmt: Execute Disbursement])
        A4([11. Report Mgmt: View / Resolve / Delete Content])
        A5([12. System Mgmt: Categories / Stats / Ledger Ops])
    end

    U --> U1 & U2 & U3 & U4 & U5 & U6 & U7
    A --> A1 & A2 & A3 & A4 & A5

    classDef actorStyle fill:#2563eb,stroke:#fff,stroke-width:2px,color:#fff,font-weight:bold;
    style User_Subsystem fill:#f8fafc,stroke:#cbd5e1,stroke-width:2px;
    style Admin_Subsystem fill:#fef2f2,stroke:#fca5a5,stroke-width:2px;
~~~

### 6.2 Vòng đời của một Chiến dịch (Campaign State Machine)

~~~text
[PENDING] ---> (Admin Approve) ---> [ACTIVE] ---> (Target Reached / Expired) ---> [COMPLETED] ---> (Start Payout) ---> [DISBURSING] ---> (Proofs Verified) ---> [CLOSED]
   |
   +---> (Admin Reject) ---> [REJECTED]
~~~

### 6.3 Luồng Dòng Tiền & Sổ Cái (Ledger Money Flow)

~~~text
User A (Donate 500k) 
  │
  ▼ [Tạo record: Donations (status: PENDING)]
  │
  ▼ (Chuyển hướng sang VNPay QR)
  │
  ▼ VNPay gọi Webhook báo THÀNH CÔNG về Backend
  │
  ▼ [Kiểm tra Idempotency: Giao dịch VNP_9999 đã tồn tại chưa?]
       ├── CÓ RỒI  ──► Dừng & Trả 200 OK (Chống lặp tiền do rớt mạng)
       └── CHƯA CÓ ──► Mở DB Transaction:
                         1. Insert bảng Transactions (status: SUCCESS)
                         2. Update Donations.status = SUCCESS
                         3. Insert bảng Campaign_Ledgers (+500k, CREDIT)
                         4. DB Locking: UPDATE campaigns SET current_amount = current_amount + 500000
~~~

---

## PHẦN 7: ĐẶC TẢ CHỨC NĂNG CHI TIẾT (FUNCTIONAL SPECIFICATION)

### 7.1 Module Xác thực (Authentication)
* **Đăng ký:** Phải validate định dạng Email; Mật khẩu bắt buộc $\ge$ 8 ký tự, chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số. Mật khẩu lưu vào DB băm bằng `Bcrypt` (Salt rounds = 10).
* **Đăng nhập:** Luồng **JWT Token (Stateless)**. Trả về `access_token` (sống 15 phút) và `refresh_token` (sống 7 ngày, lưu trong `HttpOnly Cookie`).
* **Đăng xuất:** Khi user bấm logout, Backend ném `refresh_token` vào Blacklist lưu trên Redis kèm TTL, đồng thời clear Cookie.

### 7.2 Module Quản lý Chiến dịch (Campaign Hub)
* **Logic Soft-Delete:** Khi Creator bấm xóa chiến dịch `Pending`, Backend chạy `UPDATE campaigns SET deleted_at = NOW() WHERE id = ?`. Trình bày trên danh sách giao diện luôn kẹp điều kiện `WHERE deleted_at IS NULL`.
* **Bộ lọc (Filter):** Frontend gửi request dạng `GET /api/v1/campaigns?category=medical&sort=most_donated&status=active&page=1&limit=12`. Backend query phân trang qua Prisma.

### 7.3 Module Đánh giá & Bình luận (Verified Review)
* **Luật "Chỉ người mua được đánh giá":** Khi User gửi Review cho Campaign `X`, Backend bắt buộc query:
  ~~~sql
  SELECT id FROM donations WHERE user_id = ? AND campaign_id = ? AND status = 'SUCCESS' LIMIT 1;
  ~~~
  Nếu trả về `NULL` $\rightarrow$ Trả lỗi `403 Forbidden: Bạn phải quyên góp cho chiến dịch này mới có quyền đánh giá`.

---

## PHẦN 8: RÀNG BUỘC PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

1. **Hiệu năng (Performance):** 
   * API lấy danh sách chiến dịch (`GET /campaigns`) trả về dưới **250ms**. 
   * Dữ liệu danh sách Category bắt buộc Cache trên **Redis** (TTL = 24h), không hit vào MySQL.
2. **An toàn Dữ liệu Đồng thời (Concurrency Control):**
   Khi xử lý cộng tiền tại Webhook, Backend bắt buộc dùng Update nguyên tử của Prisma:
   ~~~typescript
   await prisma.campaign.update({
     where: { id: campaignId },
     data: { current_amount: { increment: amount } }
   });
   ~~~
3. **Bảo mật (Security):**
   * Toàn bộ input từ Rich Text Editor phải được sanitize qua **`DOMPurify`** ở Backend để chống **XSS**.
   * Thiết lập **Rate Limiting** trên Express: Mỗi IP chỉ được gọi `POST /auth/login` tối đa 5 lần/phút. Quá 5 lần, block IP trong 15 phút.

---

## PHẦN 9: TIÊU CHUẨN NGHIỆM THU (DEFINITION OF DONE - DoD)

1. **No Any `any`:** Code TypeScript không xuất hiện keyword `any`. Chạy `npm run tsc` không có warning.
2. **Zero `DELETE`:** Trong file Repository/Service của Backend, cấm gõ hàm `prisma.xxx.delete()`. Chỉ dùng `.update()` gán `deleted_at`.
3. **Pass Webhook Test:** Dùng Postman bắn Webhook VNPay 3 lần liên tiếp cùng một `transaction_code`. Database chỉ ghi nhận tiền 1 lần.
4. **Pass Audit Ledger:** Viết test SQL tự động: 
   $$\text{SUM}(\text{Donations}_{\text{SUCCESS}}) - \text{SUM}(\text{Disbursements}_{\text{SUCCESS}}) \equiv \text{Campaign}_{\text{current\_amount}}$$
   Độ lệch phải bằng `0`.
5. **Code Coverage:** Unit Test viết bằng `Vitest` cho các file tính tiền đạt Coverage $\ge 85\%$.