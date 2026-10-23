import { test, expect } from "@playwright/test";

test.describe("Public smoke", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/TeacherPoint/i);
    await expect(page.locator("body")).toBeVisible();
  });

  test("tutors directory is reachable", async ({ page }) => {
    await page.goto("/tutors");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("student login page loads", async ({ page }) => {
    await page.goto("/login/student");
    await expect(page).toHaveURL(/\/login\/student/);
    await expect(page.locator("#email")).toBeVisible({ timeout: 20_000 });
  });

  test("llms.txt is plain text with site title", async ({ page }) => {
    const res = await page.goto("/llms.txt");
    expect(res?.status()).toBe(200);
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/^# TeacherPoint/m);
    expect(body).toMatch(/teacherpoint\.org\/tutors/);
  });

  test("robots route includes staff-console disallow", async ({ page }) => {
    const res = await page.goto("/robots.txt");
    test.skip(res?.status() !== 200, "robots.txt not OK in dev — run against production build");
    const body = await page.content();
    expect(body).toMatch(/staff-console/i);
  });
});
