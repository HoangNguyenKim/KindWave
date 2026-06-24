# KINDWAVE - BỘ QUY TẮC LÀM VIỆC & TIÊU CHUẨN KỸ THUẬT (ENGINEERING RULEBOOK)
*Phiên bản: 1.0.0 | Ngày ban hành: Tháng 06/2026 | Áp dụng cho: Toàn bộ Tech Team*

> **LỜI TỰA CỦA TECH LEAD:** > *"Code viết ra không phải chỉ để cho máy chạy, mà để cho con người đọc và bảo trì. Một dòng code cực kỳ thông minh nhưng không ai hiểu được là một khoản nợ kỹ thuật. Tại KindWave, chúng ta đề cao sự Tường minh (Explicit), Kỷ luật (Discipline), và tuyệt đối tôn trọng tính chính xác của Tiền tệ."*

---

## CHƯƠNG 0: NGUYÊN TẮC "TỬ HÌNH" (THE ZERO-TOLERANCE RULES)
*Vi phạm 1 trong 4 điều sau -> Tech Lead sẽ Reject Pull Request ngay lập tức mà không cần đọc tiếp các dòng dưới:*

1. **NO `any` IN TYPESCRIPT:** Cấm tuyệt đối việc sử dụng kiểu `any`. Nếu một dữ liệu chưa xác định được cấu trúc, hãy dùng `unknown` và thực hiện Type Narrowing (ép kiểu an toàn).
2. **NO `DELETE` IN SQL:** Cấm gõ lệnh `.delete()` trong Prisma. Mọi hành động xóa (xóa user, xóa cam, xóa comment) bắt buộc phải dùng lệnh `.update({ data: { deleted_at: new Date() } })`.
3. **NO HARDCODE SECRETS:** Tuyệt đối không gán cứng (hardcode) các chuỗi JWT Secret, DB Password, API Key của VNPay hay Cloudinary vào trong file `.ts`. Bắt buộc phải gọi qua `process.env.TÊN_BIẾN`.
4. **DON'T TRUST THE CLIENT:** Mọi dữ liệu do Frontend gửi lên (Req.body, Req.query, Req.params) đều phải được coi là "dữ liệu độc hại". Backend bắt buộc phải cho chạy qua Schema Validator (**Zod**) trước khi đưa vào xử lý logic.

---

## CHƯƠNG 1: QUY TẮC LÀM VIỆC VỚI GIT (GITFLOW)

### 1.1 Quy tắc đặt tên nhánh (Branch Naming)
Cú pháp bắt buộc: `<type>/KW-<ticket_id>-<short-kebab-case-description>`

Các `<type>` được phép sử dụng:
* `feat/`: Dùng cho một tính năng hoàn toàn mới (VD: `feat/KW-15-create-donation-api`)
* `fix/`: Dùng để vá một con bug (VD: `fix/KW-19-prevent-lost-update-money`)
* `refactor/`: Viết lại code cho đẹp/nhanh hơn nhưng không làm thay đổi logic đầu ra
* `chore/`: Cập nhật cấu hình, update thư viện npm, sửa file Docker (VD: `chore/KW-01-setup-eslint`)
* *Nghiêm cấm tạo các nhánh rác có tên: `test`, `hoang-dev`, `fix-lai-lan-2`, `update-ui`.*

### 1.2 Quy tắc viết thông điệp Commit (Conventional Commits)
Cú pháp bắt buộc: `<type>(<scope>): <Mô tả ngắn gọn những gì đã sửa bằng tiếng Anh hoặc tiếng Việt không dấu>`

* **Ví dụ chuẩn:** `feat(auth): add JWT refresh token rotation` hoặc `fix(donate): xu ly chong lap webhook vnpay`
* **Nghiêm cấm gõ:** `fix bug`, `xong task`, `push code ngay 24`, `asdasdasd`.

### 1.3 Kỷ luật mở Pull Request (PR)
1. **Quy tắc "20 Files":** Một PR không được phép chứa sự thay đổi vượt quá **20 files**. Nếu một task quá lớn khiến bạn phải gõ 45 files, hãy tự bẻ task đó ra thành 2 PR nhỏ. (Lý do: Không một Tech Lead nào đủ sức và sự tỉnh táo để review một PR dài 4000 dòng).
2. **Quy tắc "48 Giờ":** Một feature branch kể từ lúc tách ra khỏi `develop` đến lúc được gộp ngược lại không được phép "sống" quá 48 tiếng để tránh rủi ro đụng độ mã nguồn (Git Conflict) quy mô lớn.
3. **Luật Self-Review:** Trước khi bấm nút *Request Review*, lập trình viên có nghĩa vụ tự mở tab **Files Changed** trên GitHub/GitLab của mình, tự đọc lại từ trên xuống dưới 1 lần để dọn sạch các dòng `console.log()`, `// TODO:`, hoặc code comment bỏ quên.

---

## CHƯƠNG 2: QUY TẮC LẬP TRÌNH BACKEND (NODE.JS / EXPRESS)

### 2.1 Xử lý Tiền tệ và Số học
* **Kiểu dữ liệu DB:** Tiền VNĐ lưu trong MySQL phải dùng kiểu `BIGINT` hoặc `DECIMAL(15,2)`, đơn vị tính là **Đồng**. Tuyệt đối không dùng kiểu `FLOAT` hay `DOUBLE` gây sai số thập phân khi tính tổng.
* **Cộng/Trừ tiền an toàn:** Khi cập nhật quỹ của chiến dịch, cấm dùng phép gán thuần túy. Bắt buộc dùng `increment` của DB Engine:
  ~~~typescript
  // CHUẨN KỸ THUẬT SENIOR:
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { current_amount: { increment: donatedAmount } }
  });
  ~~~

### 2.2 Chuẩn hóa Cấu trúc HTTP Response
Mọi API trả về cho Client phải tuân thủ đúng 1 trong 2 cấu trúc JSON sau:

~~~typescript
// 1. KHI THÀNH CÔNG (HTTP 200 / 201)
{
  "success": true,
  "data": { ... }, 
  "message": "Lấy danh sách chiến dịch thành công"
}

// 2. KHI THẤT BẠI (HTTP 400 / 401 / 403 / 404 / 500)
{
  "success": false,
  "error_code": "ERR_CAMPAIGN_CLOSED", // Mã lỗi quy chuẩn để Frontend map chuỗi dịch đa ngôn ngữ
  "message": "Chiến dịch này đã đóng, không thể quyên góp thêm"
}
~~~

### 2.3 Quản lý Ngoại lệ (Error Handling)
* **Không dùng try-catch bọc rác ở mọi hàm.** * Hãy ném (throw) các Custom Error đã định nghĩa sẵn (`NotFoundError`, `UnauthorizedError`, `BusinessRuleError`) ra ngoài. Để cho **`GlobalErrorHandlerMiddleware`** nằm ở tầng ngoài cùng của Express tóm lấy và format thành JSON trả về cho user.

---

## CHƯƠNG 3: QUY TẮC LẬP TRÌNH FRONTEND (REACT / VITE)

### 3.1 Cấu trúc thư mục Component (Mô hình Colocation)
Mỗi Component có logic riêng phải được bọc trong một thư mục, không vứt các file `.tsx` trần trụi ra ngoài:

~~~text
src/components/features/CampaignCard/
 ├── index.tsx               # Entry point
 ├── CampaignCard.tsx        # View & Logic chính
 ├── CampaignCard.styles.ts  # Các biến class Tailwind gộp
 └── CampaignCard.types.ts   # Interface định nghĩa Props
~~~

### 3.2 Phân tách Dữ liệu Server vs Dữ liệu Client
* **Server State (Dữ liệu lấy từ API):** Bắt buộc dùng **`TanStack Query`** (React Query) để quản lý việc caching, re-fetching, loading state. Nghiêm cấm gõ combo `useEffect + useState` để fetch data danh sách.
* **Client State (Dữ liệu rác trên giao diện):** * State nội bộ của Form/Modal $\rightarrow$ Dùng `useState` thuần.
  * State dùng chung toàn app (User Profile đang đăng nhập, Theme Dark/Light) $\rightarrow$ Dùng **`Zustand`** hoặc **`Redux Toolkit`**.

### 3.3 Chống Tấn công XSS (Bắt buộc)
Tại trang Chi tiết chiến dịch, khi render trường `description` chứa mã HTML được sinh ra từ Rich Text Editor của Creator: 
* **NGHIÊM CẤM:** Trực tiếp ném vào `dangerouslySetInnerHTML`.
* **BẮT BUỘC:** Phải bọc qua bộ lọc dọn dẹp mã độc **`DOMPurify`**:
  ~~~tsx
  import DOMPurify from 'dompurify';

  const cleanDescription = DOMPurify.sanitize(campaign.description);
  return <div dangerouslySetInnerHTML={{ __html: cleanDescription }} />;
  ~~~

---

## CHƯƠNG 4: BẢO MẬT & KIỂM TOÁN (SECURITY & AUDIT)

1. **Cơ chế Khóa Lũy đẳng (Idempotency Key):**
   Mọi API thực hiện hành động "Nạp tiền", "Tạo đơn Donate", "Giải ngân" phải yêu cầu Client gửi kèm header `X-Idempotency-Key` (là một mã UUID v4 sinh ra ở Frontend). 
   * Nếu Redis phát hiện Key này đã từng được hit thành công trong vòng 60 giây qua $\rightarrow$ Trả về ngay kết quả cũ, **không được phép chạy lại hàm cộng tiền vào CSDL**.
2. **Quy tắc Ghi Log:**
   * Trên môi trường `Local`: Cho phép dùng `console.log()`.
   * Trên môi trường `Production`: Bắt buộc ghi qua thư viện **`Winston`** đẩy vào file system. **Cấm gõ console.log trên production** làm rò rỉ bộ nhớ (Memory Leak) của Node.js.

---

## CHƯƠNG 5: CHECKLIST TRƯỚC KHI YÊU CẦU MERGE (DoD CHECKLIST)

*Lập trình viên tích đủ 5 ô dưới đây mới được phép gửi link PR vào box chat nhờ Lead review:*

- [ ] Chạy lệnh gõ test cục bộ `npm run lint` và `npm run tsc` trả về **0 errors**.
- [ ] Đã mở Postman/Swagger tự bắn thử các Edge-cases: *Nhập string vào ô nhập tiền; Nhập số tiền âm (-50000); Tắt wifi khi đang bấm nút submit.*
- [ ] Code đẩy lên đã xóa sạch toàn bộ các câu lệnh `debugger;` và `console.log`.
- [ ] Đã tự test responsive giao diện trên đúng 2 mốc màn hình chuẩn: **iPhone 12/13 (390px)** và **Macbook (1440px)**.
- [ ] Nếu nhánh gộp làm thay đổi cấu trúc bảng CSDL, **file Prisma Migration** tương ứng đã được commit kèm theo trong PR.