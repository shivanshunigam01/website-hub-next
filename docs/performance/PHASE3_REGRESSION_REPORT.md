# Phase 3 — Regression report

| Suite | Command | Result |
|-------|---------|--------|
| Production build | `npm run build` | **PASS** |
| Playwright smoke | `PLAYWRIGHT_SKIP_WEBSERVER=1 npx playwright test` | **PASS** (4/4) |
| SEO validate | `SEO_VALIDATE_BASE=http://localhost:3000 npm run seo:validate` | **PASS** |
| Lighthouse desktop ×3 | `lighthouse-batch.mjs … desktop` | **RAN** — CLS median 0.0028 |
| Lighthouse mobile ×3 | `lighthouse-batch.mjs … mobile` | **RAN** — CLS median 0.133 |
| Backend security | — | **NOT RUN** this pass |
| Payment sandbox E2E | — | **NOT IMPLEMENTED** |
| Full dashboard/admin E2E | — | **NOT IMPLEMENTED** |

## Files modified (Phase 3)

- `AppProviders.tsx` — main padding for mobile nav; engagement-gated widgets
- `Header.tsx` — promo bar CLS; auth area min-width
- `use-app.tsx` — sync session read; loading only when token present
- `GeoContentStrip.tsx` — empty ad slot reservation
- `views/index.tsx` — section placeholder heights
- `Hero.tsx`, `app/page.tsx`, `HeroBackground.tsx`, `layout.tsx`
- `public/llms.txt`, `next.config.ts`
- `scripts/lighthouse-batch.mjs` — layout-shift export

## Production readiness

**Not declared.** SEO smoke passes; desktop CLS fix is strong in lab; **PSI re-measure required** on live URL. Mobile LCP/TBT targets not met in lab.
