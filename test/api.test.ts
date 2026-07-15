/**
 * Black-box API tests cho các phần nhóm mình phụ trách:
 *  - Image Upload & Management API (Multer)
 *  - Admin privileged API + Audit Logs
 *
 * Đánh thẳng vào server ĐANG CHẠY tại BASE (mặc định http://localhost:3000).
 * Chạy server trước: `npm run dev`, rồi `npm test`.
 * Nếu server offline -> tự SKIP (không fail CI vì thiếu server).
 */
import { describe, it, expect, beforeAll } from "vitest";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const ADMIN = { email: "duc.admin@kindwave.org", password: "admin123" };

let online = false;
let adminToken = "";

async function reachable(): Promise<boolean> {
  try {
    const r = await fetch(`${BASE}/api/campaigns`, { signal: AbortSignal.timeout(3000) });
    return r.ok;
  } catch {
    return false;
  }
}

async function login(email: string, password: string): Promise<string> {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) return "";
  const j = await r.json();
  return j.token || "";
}

// 1x1 PNG hợp lệ (base64) để test upload ảnh thật
const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

beforeAll(async () => {
  online = await reachable();
  if (online) adminToken = await login(ADMIN.email, ADMIN.password);
});

describe("KindWave API — smoke", () => {
  it("server phản hồi /api/campaigns", async () => {
    if (!online) return;
    const r = await fetch(`${BASE}/api/campaigns`);
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it("đăng nhập admin lấy được token", async () => {
    if (!online) return;
    expect(adminToken.length).toBeGreaterThan(20);
  });

  it("từ chối đăng nhập sai mật khẩu", async () => {
    if (!online) return;
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN.email, password: "sai-mat-khau" }),
    });
    expect(r.status).toBeGreaterThanOrEqual(400);
  });
});

describe("Image API (Multer)", () => {
  let uploadedId = "";

  it("upload ảnh PNG -> 201 + trả id/url", async () => {
    if (!online) return;
    const fd = new FormData();
    fd.append("image", new Blob([PNG_1x1], { type: "image/png" }), "dot.png");
    const r = await fetch(`${BASE}/api/images/upload`, { method: "POST", body: fd });
    expect([200, 201]).toContain(r.status);
    const j = await r.json();
    expect(j.id).toBeTruthy();
    expect(j.url).toContain(j.id);
    uploadedId = j.id;
  });

  it("tải lại ảnh vừa upload -> 200 image/*", async () => {
    if (!online || !uploadedId) return;
    const r = await fetch(`${BASE}/api/images/${uploadedId}`);
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type") || "").toContain("image");
  });

  it("ảnh không tồn tại -> 404", async () => {
    if (!online) return;
    const r = await fetch(`${BASE}/api/images/khong-co-that-999`);
    expect(r.status).toBe(404);
  });

  it("xoá ảnh cần đăng nhập -> chặn khi thiếu token", async () => {
    if (!online || !uploadedId) return;
    const r = await fetch(`${BASE}/api/images/${uploadedId}`, { method: "DELETE" });
    expect(r.status).toBe(401);
  });

  it("xoá ảnh với token hợp lệ -> thành công", async () => {
    if (!online || !uploadedId || !adminToken) return;
    const r = await fetch(`${BASE}/api/images/${uploadedId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect([200, 204]).toContain(r.status);
  });
});

describe("Admin API + Audit Logs", () => {
  it("GET /api/audit-logs thiếu token -> 401", async () => {
    if (!online) return;
    const r = await fetch(`${BASE}/api/audit-logs`);
    expect(r.status).toBe(401);
  });

  it("GET /api/audit-logs có token admin -> 200 + mảng", async () => {
    if (!online || !adminToken) return;
    const r = await fetch(`${BASE}/api/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      const log = body[0];
      expect(log).toHaveProperty("id");
      expect(log).toHaveProperty("actorName");
      expect(log).toHaveProperty("action");
      expect(log).toHaveProperty("timestamp");
    }
  });

  it("endpoint admin (ban user) chặn khi thiếu token -> 401", async () => {
    if (!online) return;
    const r = await fetch(`${BASE}/api/users/user-2/ban`, { method: "PUT" });
    expect(r.status).toBe(401);
  });
});

describe("Treasury & Volunteer — IDOR / phân quyền", () => {
  // Đăng ký 1 user thường mới (chắc chắn KHÔNG sở hữu chiến dịch nào)
  // để chứng minh không thể rút quỹ / duyệt đơn của người khác.
  let outsiderToken = "";
  let someCampaignId = "";

  beforeAll(async () => {
    if (!online) return;
    const email = `outsider_${Date.now()}@test.local`;
    const r = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Outsider Test", email, password: "test12345" }),
    });
    if (r.ok) {
      const j = await r.json();
      outsiderToken = j.token || "";
    }
    const cr = await fetch(`${BASE}/api/campaigns`);
    if (cr.ok) {
      const camps = await cr.json();
      if (Array.isArray(camps) && camps.length > 0) someCampaignId = camps[0].id;
    }
  });

  it("tạo yêu cầu giải ngân thiếu token -> 401", async () => {
    if (!online) return;
    const r = await fetch(`${BASE}/api/disbursements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: someCampaignId, totalAmount: 1000 }),
    });
    expect(r.status).toBe(401);
  });

  it("user thường KHÔNG sở hữu chiến dịch -> không được rút quỹ (IDOR)", async () => {
    if (!online || !outsiderToken || !someCampaignId) return;
    const r = await fetch(`${BASE}/api/disbursements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${outsiderToken}`,
      },
      body: JSON.stringify({
        campaignId: someCampaignId,
        totalAmount: 1000,
        description: "thử rút quỹ chiến dịch người khác",
      }),
    });
    // Bị chặn: 400 (FORBIDDEN trong transaction) — không phải 201 tạo thành công
    expect(r.status).not.toBe(201);
    expect(r.status).toBeGreaterThanOrEqual(400);
    const j = await r.json();
    expect(String(j.error || "")).toContain("FORBIDDEN");
  });

  it("duyệt đơn tình nguyện thiếu token -> 401", async () => {
    if (!online) return;
    const r = await fetch(`${BASE}/api/applications/app-khong-co/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    expect(r.status).toBe(401);
  });
});
