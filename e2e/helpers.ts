import { expect, Page } from "@playwright/test";

export const ADMIN = { email: "duc.admin@kindwave.org", password: "admin123" };

export function collectPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    // Expected/non-app JS noise: USER correctly gets 403 from admin-only audit
    // endpoint; remote avatar hosts can be unavailable in offline test environments.
    if (text.includes("403 (Forbidden)") || text.includes("ERR_NAME_NOT_RESOLVED")) return;
    errors.push(`console: ${text}`);
  });
  return errors;
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/");
  await page.getByPlaceholder("ten-cua-ban@gmail.com").fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /Đăng nhập(?! tài khoản)/ }).click();
  await expect(page.getByText(/Vai trò:/)).toBeVisible();
}
