import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { width: 1280, height: 800, label: "1280" },
  { width: 1440, height: 900, label: "1440" },
  { width: 1920, height: 1080, label: "1920" },
];

test.describe("Homepage layout stability", () => {
  for (const vp of VIEWPORTS) {
    test(`desktop CLS probe at ${vp.label}px`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const cls = await page.evaluate(async () => {
        return new Promise<number>((resolve) => {
          let sum = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === "layout-shift" && !(entry as any).hadRecentInput) {
                sum += (entry as any).value;
              }
            }
          });
          observer.observe({ type: "layout-shift", buffered: true });
          setTimeout(() => {
            observer.disconnect();
            resolve(sum);
          }, 4000);
        });
      });

      expect(cls).toBeLessThan(0.1);
    });
  }

  test("SSR hero headline is in initial HTML", async ({ page }) => {
    const res = await page.goto("/");
    const html = await res!.text();
    expect(html).toMatch(/Find expert tutors and courses that fit/i);
    expect(html).toMatch(/hero-headline/i);
  });
});
