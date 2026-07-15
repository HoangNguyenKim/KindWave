import { expect, test } from "@playwright/test";
import { collectPageErrors, login } from "./helpers";

let user = { email: "", password: "Automation@123" };

test.beforeAll(async ({ request }) => {
  user.email = `ui-user-${Date.now()}@test.local`;
  const response = await request.post("/api/auth/register", {
    data: {
      name: "UI Automation User",
      email: user.email,
      password: user.password,
      role: "ADMIN",
    },
  });
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.user.role).toBe("USER");
});

test("USER login renders USER experience and cannot see Admin Portal", async ({ page }) => {
  const errors = collectPageErrors(page);
  await login(page, user.email, user.password);

  await expect(page.getByText("Người dùng (USER)")).toBeVisible();
  await expect(page.getByRole("button", { name: "+ Tạo chiến dịch" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Khám phá chiến dịch" })).toBeVisible();
  await expect(page.getByText(/Admin Portal/)).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("USER logout returns to login screen", async ({ page }) => {
  await login(page, user.email, user.password);
  await page.getByTitle("Đăng xuất khỏi hệ thống").click();
  await expect(page.getByRole("button", { name: "Đăng nhập tài khoản" })).toBeVisible();
  await expect(page.getByPlaceholder("ten-cua-ban@gmail.com")).toBeVisible();
});

test("invalid password shows generic authentication error", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("ten-cua-ban@gmail.com").fill(user.email);
  await page.locator('input[type="password"]').fill("wrong-password");
  await page.getByRole("button", { name: /Đăng nhập(?! tài khoản)/ }).click();
  await expect(page.getByText("Email không tồn tại hoặc sai mật khẩu")).toBeVisible();
  await expect(page.getByText(/Vai trò:/)).toHaveCount(0);
});
