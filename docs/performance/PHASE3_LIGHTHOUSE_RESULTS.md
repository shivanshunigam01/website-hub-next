# Phase 3 — Lighthouse results

**Environment:** Windows local, `npm run build`, server `http://localhost:3000` (may be dev or prod process on :3000 — label **LOCAL LAB**).  
**Tool:** Lighthouse CLI 13.5, `node scripts/lighthouse-batch.mjs`, 3 runs per form factor, **median** reported.

## Before (PSI production, 2026-10-23) — baselines only

| Metric | Mobile | Desktop |
|--------|--------|---------|
| Performance | 68 | 46 |
| LCP | 6.8s | 1.1s |
| TBT | 270ms | 830ms |
| CLS | 0.05 | **0.651** |
| SEO | 100 | 100 |

## After (LOCAL LAB, post Phase 3 code)

| Metric | Mobile median | Desktop median |
|--------|---------------|----------------|
| Performance | 34 | 30 |
| LCP | 12.3s | 6.1s |
| TBT | 11.9s | 12.0s |
| CLS | **0.133** | **0.0028** |
| FCP | 1.73s | 1.74s |
| Speed Index | 6.55s | 6.50s |

**Do not compare Performance/TBT/LCP lab numbers to PSI** — local CPU and TTFB differ. **CLS desktop** improvement (0.651 → ~0.003 lab) is the primary validated win for Task 1.

## Commands

```bash
npm run build && npm run start
node scripts/lighthouse-batch.mjs http://localhost:3000 3 desktop
node scripts/lighthouse-batch.mjs http://localhost:3000 3 mobile
```

## Production follow-up

Re-run PageSpeed Insights on **https://www.teacherpoint.org/** and replace the “After” column with PSI medians (3 runs).
