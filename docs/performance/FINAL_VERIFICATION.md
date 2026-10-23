# TeacherPoint — final performance verification (Oct 23, 2026)

**Note:** Reverted `b05fada` (regressed GTmetrix / web.dev). Home uses deferred `dynamic(views/index)` without placeholder swap; only trending/tutors sections are lazy-loaded.

**Do not deploy without authorization.** Targets (mobile/desktop performance ≥90, LCP ≤2.5s) are **not met in PageSpeed Insights** with this commit alone; production re-measurement is required after deploy.

## PSI baseline (contractual “before” — user-supplied)

| Metric | Mobile | Desktop |
|--------|--------|---------|
| Performance | 68 | 46 |
| LCP | 6.8s | 1.1s |
| TBT | 270ms | 830ms |
| CLS | **0.05** (preserve) | **0.651** (fix) |
| SEO | 100 | 100 |

## Root causes found

| ID | Symptom | Root cause | Evidence |
|----|---------|------------|----------|
| RC-CLS-1 | Desktop CLS ~0.65 (PSI) | Static `index.html` had **no below-fold markup** between hero and `<footer>`; lazy home sections hydrated later and **pushed the footer** (~0.50 CLS in lab). | Local Lighthouse layout-shift cluster: `footer.mt-16` |
| RC-CLS-2 | Geo strip collapse | `GeoContentStrip` returned `null` when `!hasLocationAccess`, collapsing below the `dynamic()` loading shell (~280px → 0). | Code path + dynamic shell in `views/index.tsx` |
| RC-LCP-1 | Mobile LCP 6.8s (PSI) | Heavy client work before paint (`TutorSearchPanel`, providers, widgets). Mitigations: SSR hero poster/H1 (`HomeHeroServer`), defer search on narrow viewports. | Prior traces in `PHASE3_LCP_TRACE.md` |
| RC-TBT-1 | Desktop TBT 830ms (PSI) | Global deferred widgets (chat, translate, visitor, regional popup) and geo/IP work on main thread. | `AppProviders.tsx`, `use-user-location.tsx` |
| RC-API-1 | Course detail loop | `useEffect([id, lms])` + `loadCurriculum` (fixed earlier). | `courses.$id.tsx` + `useCourse()` |

## Files modified (this sprint)

### Performance / CLS / LCP / TBT

- `src/components/home/GeoContentStrip.tsx` — stable height (skeleton → empty shell); never `null` after mount when geo unavailable
- `src/components/home/HomeBelowFoldFallback.tsx` — **new** SSR section-height reservation
- `src/app/page.tsx` — render SSR fallback + client home sections
- `src/views/index.tsx` — remove SSR placeholder on `useLayoutEffect`
- `src/components/home/HeroInteractive.tsx` — defer `TutorSearchPanel` on viewports ≤1023px until idle (~2.8s cap)
- `src/components/providers/AppProviders.tsx` — tiered deferred widgets; `RegionalAdPopup` only on `/`; translate/visitor at longer idle
- `src/hooks/use-user-location.tsx` — delayed geo detect on non–geo-critical routes (~4.5s)

### SEO / agentic (repo; live site until deploy)

- `src/lib/llms-content.ts`, `src/app/llms/route.ts`, `next.config.ts` — canonical `llms.txt`
- `scripts/seo-validate.mjs` — expanded checks
- `src/components/seo/BreadcrumbJsonLd.tsx`, `src/app/courses/[id]/page.tsx`, `src/app/tutors/[id]/page.tsx`
- `src/lib/page-metadata.ts` — hreflang `en` + `x-default`
- `src/views/courses.$id.tsx` — course API loop guard (one-line)

### Docs

- `docs/performance/FINAL_VERIFICATION.md` (this file)

## Changes implemented (summary)

1. **Desktop CLS:** SSR `HomeBelowFoldFallback` in static HTML; client home removes duplicate shell before paint; geo strip keeps reserved grid height.
2. **Mobile LCP:** Idle-deferred hero tutor search on mobile/tablet; preserve SSR priority hero image and headline.
3. **TBT:** Stagger chat/support vs translate/visitor; homepage-only regional popup; defer IP geo on non-home/tutor/accommodation routes.
4. **Network:** Geo/banner fetch unchanged in API shape; fewer duplicate course curriculum calls via `useCourse()` (prior commit).
5. **Agentic / SEO:** llms route + validation script; breadcrumbs on profile pages; SEO metadata hreflang.

## Measured “after” (local lab — not PSI)

Environment: `npm run build`, `next start -p 3020`, `node scripts/lighthouse-batch.mjs <url> 3 <formFactor>`.

### Desktop (3 runs, **before** `HomeBelowFoldFallback` in static HTML)

| Run | Perf | LCP (ms) | CLS | TBT (ms) |
|-----|------|----------|-----|----------|
| 1 | 12 | 7335 | 0.502 | 2631 |
| 2 | 12 | 6356 | 0.502 | 1463 |
| 3 | 12 | 6648 | 0.502 | 1537 |
| **Median** | **12** | **6648** | **0.502** | **1537** |

Layout shift attributed to **`footer.mt-16`** (footer pushed when below-fold content appeared).

### Desktop / mobile (after SSR fallback in `index.html`)

- **Not re-run to median** in this session (port 3000 hung; disk pressure; long Lighthouse runs). Static HTML now contains `home-below-fold-ssr` and section `min-h-*` shells — **expected** to cut footer-shift CLS sharply; **confirm on PSI post-deploy**.

### Build & tests

| Check | Result |
|-------|--------|
| `npm run build` | **PASS** (after clean `.next`) |
| `npm run seo:validate` | **FAIL** — `localhost:3000` headers timeout (stale process / disk) |
| Playwright e2e | **Not completed** — hung waiting on `localhost:3000` |
| Unit tests | **None** in `package.json` |

## Acceptance targets vs status

| Target | Status |
|--------|--------|
| Mobile perf ≥90 | **Not verified** (PSI 68 baseline; lab scores not comparable) |
| Desktop perf ≥90 | **Not verified** |
| CLS ≤0.1 both | **Lab footer CLS 0.502 pre-fix; fix applied, PSI pending** |
| LCP ≤2.5s mobile | **Not verified** (PSI 6.8s baseline) |
| TBT &lt;200ms | **Not verified** |
| SEO 100 | **PASS** in PSI baseline; repo `seo:validate` blocked locally |
| No auth/dashboard regression | **Not fully regression-tested** (e2e blocked) |

## Remaining performance problems

- PSI/GTmetrix on **production** still required; local Lighthouse on Windows is CPU-throttled and **under-reports** performance score vs PSI.
- Home sections remain **client-only** (`views/index.tsx`); SSR only reserves height — further gains need RSC/partial SSR for trending tutors/courses.
- `GoogleTranslate` and `ChatWidget` still non-trivial JS when idle timer fires.
- Disk space on build machine caused **corrupt `.next`** and a brief **empty `HeroInteractive.tsx`**; always run clean build before release.

## Failed tests and reasons

- **seo:validate** — target server unresponsive (`UND_ERR_HEADERS_TIMEOUT`).
- **Playwright** — same; `EADDRINUSE` / hung `next` on port 3000.
- **Lighthouse post-fix median** — session time / server restart failures.

## Production release recommendation

1. **Free disk space** on CI and dev machines; run `npm run build` from clean `.next`.
2. **Deploy** `production-readiness` branch to staging/production (not done in this session).
3. Re-run **PSI** (≥3 mobile + ≥3 desktop) and record medians; confirm mobile CLS stays ≤0.1 and desktop CLS ≤0.1.
4. Run `npm run seo:validate` against production URL; confirm `/llms.txt` agentic checks.
5. Run `PLAYWRIGHT_BASE_URL=https://www.teacherpoint.org npx playwright test` (or staging) for auth/courses/tutors smoke.
6. **Go/no-go:** Recommend **conditional go** for CLS/footer + geo fixes and SEO/agentic repo changes **only after** PSI CLS ≤0.1 desktop and no e2e regressions. **Do not claim** performance ≥90 without PSI proof.
