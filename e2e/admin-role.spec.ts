import { expect, test } from "@playwright/test";
import { ADMIN, collectPageErrors, login } from "./helpers";

const adminTabs = [
  "Số liệu thống kê",
  "Duyệt chiến dịch",
  "Tố cáo vi phạm",
  "Xác thực tổ chức",
  "Duyệt giải ngân",
  "Duyệt chứng từ",
  "Người dùng",
  "Nhật ký",
];

test("ADMIN login opens Admin Portal with all management tabs", async ({ page }) => {
  const errors = collectPageErrors(page);
  await login(page, ADMIN.email, ADMIN.password);

  await expect(page.getByText("Quản trị viên (ADMIN)")).toBeVisible();
  await expect(page.getByText(/Hệ thống Quản trị & Kế toán Toàn sàn/)).toBeVisible();
  for (const label of adminTabs) {
    await expect(page.getByRole("button", { name: new RegExp(label) })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "+ Tạo chiến dịch" })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("ADMIN can open Audit Log tab", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await page.getByRole("button", { name: /Nhật ký/ }).click();
  await expect(page.getByRole("heading", { name: "Nhật ký hoạt động (Audit Logs)" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Người thực hiện" })).toBeVisible();
});

test("ADMIN logout clears session and returns to login", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await page.getByTitle("Đăng xuất khỏi hệ thống").click();
  await expect(page.getByRole("button", { name: "Đăng nhập tài khoản" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("kindwave_token"))).toBeNull();
});
