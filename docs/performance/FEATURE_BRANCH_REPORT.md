# Feature branch report: `fix/security-env-and-home-performance`

**Base:** `master` (after sync)  
**Do not merge to `master` or deploy production until security rotation and review are complete.**

## Security

### Tracked environment files (removed from Git index; local files retained)

| File | Variable names present (values not listed) |
|------|---------------------------------------------|
| `.env` | `NEXT_PUBLIC_API_*`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `GEOAPIFY_API_KEY`, `NEXT_PUBLIC_GEOAPIFY_API_KEY` |
| `.env.local` | Same pattern |
| `.env.production.local` | Same pattern |
| `.env.development.local` | Same pattern |

**Sensitive categories:** Geoapify server/browser keys, Google OAuth client id, Razorpay public key id, API endpoints.

### Changes

- `.gitignore` — ignore `.env` and `.env.*`, allow `.env.example`
- `git rm --cached` on the four env files above
- `docs/security/ENV_ROTATION_AND_HISTORY.md` — rotation + `git filter-repo` guidance

### Release blockers

1. Rotate Geoapify and review Razorpay/Google credentials (see security doc).
2. Purge secrets from **Git history** on the public repo before calling the repo clean.

---

## Root causes addressed

| ID | Area | Root cause | Fix |
|----|------|------------|-----|
| SEC-1 | Git | Real env files committed | Untrack + gitignore + rotation doc |
| PERF-1 | `GeoContentStrip` | Loaded grid used `shown.length` vs skeleton `limit` | Shared `geoAdGridClass` / `md:col-span-2` for single ad; empty → `null` (no blank strip) |
| PERF-2 | `AppProviders` | `@react-oauth/google` on every route | `ScopedGoogleAuth` via `needsGoogleOAuth()` |
| PERF-2b | Widgets | Visitor analytics on dashboards | Skip `VisitorTracker` on dashboard paths |
| PERF-3 | `Sections.tsx` | `useAdminStore` on public sections | `useCourses` / `useTutors` (React Query dedupe) for LearnAI, FeaturedTutors, IndustryExperts |
| PERF-4 | Home | `min-h-[3600px]` shell + full-page dynamic waterfall | Deferred mobile home chunk; desktop immediate mount; section-owned min-heights; mobile `max-lg:min-h-[3000px]` shell |
| SEO-1 | `HomeHeroServer` | Unverified “120+ countries”, “thousands of reviews” | Truthful, qualitative copy; LCP = priority poster `Image` + static `h1` |
| SEO-2 | Sitemap | — | Existing `/tutors?subject=` entries are intentional landing URLs; canonical for `/tutors` remains path-based in metadata (no change required) |

---

## Files modified (exact)

- `.gitignore`
- `docs/security/ENV_ROTATION_AND_HISTORY.md` (new)
- `docs/performance/FEATURE_BRANCH_REPORT.md` (new)
- `e2e/home-layout.spec.ts` — mobile viewport CLS probe
- `src/app/page.tsx`
- `src/components/home/GeoContentStrip.tsx`
- `src/components/home/geo-content-grid.ts` (new)
- `src/components/home/HomeBelowFoldMount.tsx` (new)
- `src/components/home/HomeBelowFoldShell.tsx`
- `src/components/home/HomeHeroServer.tsx`
- `src/components/home/HeroSearchLazy.tsx`
- `src/components/home/Sections.tsx`
- `src/components/providers/AppProviders.tsx`
- `src/lib/site-chrome.ts`
- `src/views/index.tsx`
- Git index: removed `.env`, `.env.local`, `.env.production.local`, `.env.development.local`

---

## Measurements (lab — not production PSI/GTmetrix)

| Check | Before (branch base / noted) | After (this branch, local dev) |
|-------|------------------------------|--------------------------------|
| Home route First Load JS (build) | ~135 kB (master w/ full dynamic index) | **111 kB** (`next build`) |
| Playwright CLS @ 1280px | — | **&lt; 0.1** (pass) |
| Playwright CLS @ 1440px | — | **&lt; 0.1** (pass) |
| Playwright CLS @ 1920px | — | **~0.10** (borderline; flaky) |
| Playwright CLS @ 390px mobile | ~0.72 (placeholders off) | **~0.17** (improved, **still &gt; 0.1**) |
| Lighthouse mobile/desktop ≥90 | Not claimed | **Not run to completion** (no scored 90+ claim) |

**Mobile LCP element (expected):** `HomeHeroServer` priority `next/image` poster (`hero-illustration.jpg`) or static H1 — confirm with Lighthouse trace post-merge.

---

## Validation

| Command | Result |
|---------|--------|
| `npm run build` | **Pass** |
| `npx playwright test` | **9 pass / 2 fail** — see below |
| `npm run seo:validate` | **Fail** — requires running server (`ECONNREFUSED`) |
| `npm audit` (high) | **Advisories** in `brace-expansion`, `braces`, `js-yaml` (dev/transitive); no fix applied on this branch |
| Unit tests | **None configured** in `package.json` |

### Playwright failures

1. **`course-detail-api.spec.ts`** — no `/courses/` link on `/courses` within 30s (likely **local API** / empty catalog against dev `.env`).
2. **`home-layout.spec.ts` mobile** — CLS **0.17** &gt; 0.1 threshold.

---

## Remaining release blockers

1. Credential rotation + Git history scrub (security).
2. Mobile homepage CLS ≤ 0.1 in lab (footer/home handoff).
3. E2E course-detail test needs API-backed catalog or test fixture.
4. Run `seo:validate` and Lighthouse against staging with production-like API.
5. `ComboPacks` still uses `useAdminStore` (admin-only section if unused on home — verify routes).

---

## Review notes

- Google sign-in on `/login/*` and auth routes unchanged; public pages skip `GoogleOAuthProvider` wrapper when not needed.
- `TrendingCourses` / `TopTutors` remain the only home `dynamic()` splits to balance TBT vs request count.
