/**
 * Run repeated Lighthouse performance audits. Usage:
 *   node scripts/lighthouse-batch.mjs [url] [runs] [mobile|desktop]
 */
import { spawn } from "node:child_process";
import { writeFileSync, readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const url = process.argv[2] || "http://localhost:3000";
const runs = Math.max(1, Number(process.argv[3]) || 3);
const formFactor = process.argv[4] === "desktop" ? "desktop" : "mobile";

function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function runOnce(i) {
  return new Promise((resolve, reject) => {
    const out = join(tmpdir(), `lh-${formFactor}-${i}-${Date.now()}.json`);
    const args = [
      url,
      "--only-categories=performance",
      `--form-factor=${formFactor}`,
      ...(formFactor === "desktop" ? ["--screenEmulation.disabled"] : []),
      "--output=json",
      `--output-path=${out}`,
      "--quiet",
      '--chrome-flags=--headless=new',
    ];
    const child = spawn("npx", ["lighthouse", ...args], {
      shell: true,
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`lighthouse exit ${code}`));
        return;
      }
      try {
        const json = JSON.parse(readFileSync(out, "utf8"));
        unlinkSync(out);
        const perf = json.categories?.performance?.score ?? 0;
        const a = json.audits || {};
        const shiftItems =
          a["layout-shifts"]?.details?.items?.slice(0, 8)?.map((item) => ({
            score: item.score,
            node: item.node?.snippet?.slice(0, 120),
            selector: item.node?.selector,
          })) ?? [];
        const lcpEl = a["largest-contentful-paint-element"]?.displayValue;
        resolve({
          score: Math.round(perf * 100),
          lcp: a["largest-contentful-paint"]?.numericValue,
          lcpElement: lcpEl,
          cls: a["cumulative-layout-shift"]?.numericValue,
          tbt: a["total-blocking-time"]?.numericValue,
          fcp: a["first-contentful-paint"]?.numericValue,
          si: a["speed-index"]?.numericValue,
          layoutShifts: shiftItems,
        });
      } catch (e) {
        reject(e);
      }
    });
  });
}

const results = [];
for (let i = 0; i < runs; i++) {
  console.log(`\n[${formFactor}] run ${i + 1}/${runs}…`);
  results.push(await runOnce(i));
}

const summary = {
  formFactor,
  url,
  runs: results,
  median: {
    score: median(results.map((r) => r.score)),
    lcpMs: median(results.map((r) => r.lcp)),
    cls: median(results.map((r) => r.cls)),
    tbtMs: median(results.map((r) => r.tbt)),
    fcpMs: median(results.map((r) => r.fcp)),
    speedIndexMs: median(results.map((r) => r.si)),
  },
};

console.log("\n--- Summary ---");
console.log(JSON.stringify(summary, null, 2));
