# KINDWAVE — ARCHITECTURE CONTRACT

Tài liệu chốt các quyết định kiến trúc bắt buộc toàn team tuân thủ. Khi tài liệu cũ (NgữCảnh.md, ProjectRule.md) mâu thuẫn với file này, file này là nguồn sự thật.

Phiên bản: 1.0.0 | Nhánh ban hành: chore/KW-26-align-architecture-contracts

---

## 1. Role Casing — USER | ADMIN (chữ HOA)

Quyết định: Giá trị Role dùng chữ HOA `USER` và `ADMIN`, đồng nhất từ Database đến API đến Frontend.

Lý do: Khớp trực tiếp với Prisma enum `Role { USER ADMIN }`. Không cần lớp chuyển đổi (mapping) ở Backend khi trả response, loại bỏ rủi ro sai lệch hoa/thường giữa các tầng.

Áp dụng:
- Backend: Prisma enum `Role` giữ nguyên `USER` / `ADMIN`. API trả về `role` đúng giá trị enum, không chuyển đổi casing.
- Frontend: Type `role` là `"USER" | "ADMIN"`. Mọi so khớp quyền (ProtectedRoute, điều hướng) dùng chữ HOA.
- File đã đồng bộ: `FE/src/features/authentication/store/auth.store.ts`, `FE/src/components/common/ProtectedRoute.tsx`, `FE/src/routes/AppRouter.tsx`.

Cấm: Dùng `"User"` / `"Admin"` (chữ thường) ở bất kỳ tầng nào.

---

## 2. Refresh Token — localStorage

Quyết định: Access Token và Refresh Token đều lưu ở `localStorage` phía Frontend. Refresh Token gửi trong body của request tới `/auth/refresh`.

Lý do: Giữ đúng cơ chế đã được hiện thực trong code (`FE/src/lib/axios.ts`, `FE/src/lib/token-storage.ts`). Tránh phải viết lại interceptor Mutex Queue 401 đã hoạt động ổn định. Đây là lựa chọn có ý thức, thay thế cho mô tả "HttpOnly Cookie" trong tài liệu cũ.

Áp dụng:
- Frontend: `tokenStorage` đọc/ghi cả access và refresh token qua `localStorage` (key `kw_access_token`, `kw_refresh_token`). Interceptor axios tự động xin token mới qua hàng đợi mutex khi gặp 401.
- Backend: Endpoint `/auth/login` trả cả `accessToken` và `refreshToken` trong JSON body (không set HttpOnly Cookie). Endpoint `/auth/refresh` nhận `refreshToken` từ body, trả cặp token mới.
- Logout: Refresh Token bị đưa vào blacklist Redis với TTL bằng đúng hạn còn lại của token (task T-07).

Rủi ro đã chấp nhận: Token nằm trong localStorage có thể bị đọc nếu xảy ra XSS. Bù lại bằng việc bắt buộc sanitize toàn bộ Rich Text bằng DOMPurify (ProjectRule Chương 3.3) để giảm bề mặt tấn công XSS.

Cấm: Trộn lẫn hai cơ chế (vừa cookie vừa localStorage) gây nhập nhằng nguồn token.

---

## 3. Ghi chú đồng bộ khác

- Tên field tiền của Campaign: dùng `raisedAmount` (đã thống nhất trong schema). Không dùng `current_amount`.
- Soft-delete: mọi model có `deletedAt DateTime?` (User, Campaign, Donation, Review, Report). Cấm hard-delete; Prisma Extension đã chặn `.delete()` / `.deleteMany()`.
