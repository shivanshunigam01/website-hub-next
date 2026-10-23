import { test, expect } from "@playwright/test";

test.describe("Course detail API", () => {
  test("loads courses list then detail with bounded course API calls", async ({ page }) => {
    const courseApiHits: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (/\/courses(\?|$|\/)/i.test(url) && (url.includes("/api/") || url.includes("api.teacherpoint"))) {
        courseApiHits.push(url);
      }
    });

    await page.goto("/courses");
    await page.waitForLoadState("networkidle");

    const courseLink = page.locator('a[href^="/courses/"]').first();
    await expect(courseLink).toBeVisible({ timeout: 30_000 });
    const href = await courseLink.getAttribute("href");
    expect(href).toBeTruthy();

    const beforeDetail = courseApiHits.length;
    await courseLink.click();
    await page.waitForURL(/\/courses\//);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    const afterDetail = courseApiHits.length;
    const detailCalls = afterDetail - beforeDetail;
    expect(detailCalls).toBeLessThanOrEqual(3);
    expect(courseApiHits.filter((u) => u.includes(href!)).length).toBeLessThanOrEqual(3);
  });
});
