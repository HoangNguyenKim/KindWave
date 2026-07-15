import { beforeAll, describe, expect, it } from "vitest";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const ADMIN = { email: "duc.admin@kindwave.org", password: "admin123" };

let userToken = "";
let adminToken = "";
let userId = "";

async function jsonRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

async function login(email: string, password: string) {
  return jsonRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

beforeAll(async () => {
  const health = await fetch(`${BASE}/api/health`, {
    signal: AbortSignal.timeout(5000),
  }).catch(() => null);
  if (!health?.ok) throw new Error(`KindWave server is not reachable at ${BASE}`);

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const registered = await jsonRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Automation User",
      email: `role-user-${suffix}@test.local`,
      password: "Automation@123",
      role: "ADMIN",
    }),
  });
  expect(registered.response.status).toBe(201);
  expect(registered.body.user.role).toBe("USER");
  userToken = registered.body.token;
  userId = registered.body.user.id;

  const admin = await login(ADMIN.email, ADMIN.password);
  expect(admin.response.status).toBe(200);
  adminToken = admin.body.token;
});

describe("Guest authorization", () => {
  it.each([
    ["audit logs", () => "/api/audit-logs", "GET"],
    ["ban user", () => `/api/users/${userId}/ban`, "PUT"],
    ["campaign moderation", () => "/api/campaigns/camp-hagiang/status", "PUT"],
  ])("Guest cannot access %s -> 401", async (_name, pathFactory, method) => {
    const { response } = await jsonRequest(pathFactory(), {
      method,
      body: method === "GET" ? undefined : JSON.stringify({ status: "ACTIVE" }),
    });
    expect(response.status).toBe(401);
  });

  it("invalid token -> 401", async () => {
    const { response } = await jsonRequest("/api/audit-logs", {
      headers: { Authorization: "Bearer invalid-token" },
    });
    expect(response.status).toBe(401);
  });
});

describe("USER role authorization", () => {
  it("role injection during registration remains USER", async () => {
    expect(userToken.length).toBeGreaterThan(20);
  });

  it.each([
    ["audit logs", () => "/api/audit-logs", "GET", undefined],
    ["ban user", () => `/api/users/${userId}/ban`, "PUT", undefined],
    ["campaign moderation", () => "/api/campaigns/camp-hagiang/status", "PUT", { status: "ACTIVE" }],
    ["report moderation", () => "/api/reports/rep-1/status", "PUT", { status: "RESOLVED" }],
  ])("USER cannot access %s -> 403", async (_name, pathFactory, method, payload) => {
    const { response } = await jsonRequest(pathFactory(), {
      method,
      headers: { Authorization: `Bearer ${userToken}` },
      body: payload ? JSON.stringify(payload) : undefined,
    });
    expect(response.status).toBe(403);
  });

  it("USER can update only own metrics", async () => {
    const own = await jsonRequest(`/api/users/${userId}/metrics`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ impactPoints: 0, impactHours: 0 }),
    });
    expect(own.response.status).toBe(200);

    const other = await jsonRequest("/api/users/user-2/metrics", {
      method: "PUT",
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ impactPoints: 1000 }),
    });
    expect(other.response.status).toBe(403);
  });
});

describe("ADMIN role authorization", () => {
  it("ADMIN can read audit logs", async () => {
    const { response, body } = await jsonRequest("/api/audit-logs", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  it("ADMIN can moderate an existing campaign without changing its state", async () => {
    const campaigns = await jsonRequest("/api/campaigns");
    const campaign = campaigns.body.find((item: any) => item.id === "camp-hagiang");
    expect(campaign).toBeTruthy();
    const { response, body } = await jsonRequest(`/api/campaigns/${campaign.id}/status`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: campaign.status }),
    });
    expect(response.status).toBe(200);
    expect(body.status).toBe(campaign.status);
  });

  it("ADMIN cannot ban itself", async () => {
    const { response } = await jsonRequest("/api/users/user-admin/ban", {
      method: "PUT",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status).toBe(400);
  });
});
