import { expect, test } from "@playwright/test";

test("đăng ký và mở các màn hình chính", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.edu`;
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu học cùng bạn →" }).first().click();
  const displayName = page.getByLabel(/Tên hiển thị/);
  await displayName.click();
  await displayName.fill("Bạn học E2E");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill("password123");
  await page.locator('input[name="confirm_password"]').fill("password123");
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();

  const tour = page.getByRole("dialog", { name: "Hướng dẫn sử dụng PeerBridge" });
  await expect(tour).toBeVisible({ timeout: 30_000 });
  await tour.getByRole("button", { name: "Bỏ qua" }).click();
  await expect(tour).toBeHidden();

  const navigation = page.locator("nav").first();
  await expect(navigation).toBeVisible({ timeout: 30_000 });
  await navigation.getByRole("button", { name: "Tìm bạn" }).click();
  await expect(page.getByRole("heading", { name: "Tìm bạn học" })).toBeVisible();

  await navigation.getByRole("button", { name: "Kế hoạch" }).click();
  await expect(page.getByRole("heading", { name: "Kế hoạch tự học" })).toBeVisible();

  await navigation.getByRole("button", { name: "Học cùng" }).click();
  await expect(page.locator("main")).toBeVisible();
});
