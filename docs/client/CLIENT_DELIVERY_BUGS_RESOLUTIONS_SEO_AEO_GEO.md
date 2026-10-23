# TeacherPoint — Bugs, Resolutions & SEO / AEO / GEO Delivery Summary

**PDF export:** `docs/client/TeacherPoint_Client_Delivery_Bugs_SEO_AEO_GEO.pdf` (regenerate: `npm run export:client-pdf`)

**Prepared for:** Client share (development agreement alignment)  
**Product:** [TeacherPoint](https://www.teacherpoint.org/) — public website + API  
**Repositories:**

| Component | GitHub | Primary branch |
|-----------|--------|----------------|
| Frontend (Next.js 15) | `shivanshunigam01/website-hub-next` | `production-readiness` (deploy) · `fix/security-env-and-home-performance` (review) |
| Backend (Express / MongoDB) | `shivanshunigam01/teacheron-backend` | `production-readiness` |

**Agreement note:** The signed agreement PDF is not stored in this repository. This document maps **delivered engineering work** to typical agreement themes: **production readiness**, **performance (Core Web Vitals)**, **SEO**, **AEO** (answer / AI discovery), and **GEO** (generative-engine optimization + **geographic** personalization). Where a milestone ID from your PDF differs, attach the PDF appendix and we can map row-by-row.

**Live site:** Changes below are **in Git**; production reflects them only after **host deploy** of the listed branches.

---

## 1. Executive summary

| Area | Status | Summary |
|------|--------|---------|
| **Critical production bug (course page)** | **Resolved in code** | Infinite `GET /courses/:id` loop fixed; deploy required on live |
| **SEO (search engines)** | **Strong baseline** | PSI SEO **100** (baseline); sitemap, robots, metadata, JSON-LD, hreflang |
| **AEO / agentic discovery** | **Implemented** | `llms.txt`, expanded machine-readable site map, FAQ/schema, factual copy |
| **GEO (generative engines)** | **Implemented** | `llms.txt` + structured data + truthful marketing copy (no fake stats) |
| **GEO (geographic / regional)** | **Improved** | Regional ads strip, deferred IP/geo, stable layout grid |
| **Performance (CWV)** | **Partial** | Major CLS/TBT/LCP mitigations shipped; **90+ performance not certified** without post-deploy PSI/GTmetrix |
| **Security** | **In progress** | Env files removed from Git tracking on feature branch; **rotation + history scrub = release blocker** |

---

## 2. Resolved bugs & issues (client-facing)

### 2.1 P0 — Production / user-facing

| ID | Issue | Symptom | Root cause | Resolution | Verification |
|----|-------|---------|------------|------------|--------------|
| **BUG-COURSE-001** | Course detail API storm | Course URL shows endless spinner; **100+** identical API calls in browser Network tab | `useEffect` depended on entire LMS store; `loadCurriculum` updated store → infinite re-fetch loop | Removed LMS store from public course layout; **single** `useCourse()` query with in-flight dedupe; curriculum from API response | Commits on `production-readiness` (`1a790a1`, `0d7b3dc`); e2e `course-detail-api.spec.ts` (run against env with catalog data) |
| **BUG-DEBUG-001** | Console noise / failed requests | `POST http://127.0.0.1:7651/ingest/... ERR_CONNECTION_REFUSED` | Debug instrumentation left in production bundle | `debug-gt-log` no-op; ingest calls removed | No connection errors after deploy |
| **BUG-SEO-001** | Misleading hero claims | Unverified “120+ countries”, “thousands of reviews” | Marketing copy on SSR hero | **Truthful, qualitative** hero copy on feature branch `HomeHeroServer` | Content review + legal sign-off recommended |
| **BUG-PERF-001** | GTmetrix regression (bad deploy) | Scores dropped after aggressive home refactor | Full-page hydrate + over-splitting sections | **Reverted**; restored deferred home chunk pattern (`production-readiness` `a3c3352`) | Re-test GTmetrix after deploy |

### 2.2 P1 — Performance & layout (Core Web Vitals)

| ID | Issue | Baseline (client-supplied PSI) | Mitigation | Expected impact |
|----|-------|-------------------------------|------------|-------------------|
| **PERF-CLS-001** | Desktop CLS ~**0.65** | Footer jumped when home sections hydrated | Below-fold height reservation, geo strip stability, section `min-h` shells, footer `min-h` | Lab desktop CLS **&lt; 0.1** at 1280/1440 in Playwright (post-fix branch) |
| **PERF-CLS-002** | GTmetrix CLS ~**0.71** | Placeholder vs real grid mismatch; geo strip collapse | `GeoContentStrip` stable skeletons; grid geometry fix (`geo-content-grid.ts` on feature branch) | Re-measure GTmetrix after deploy |
| **PERF-LCP-001** | Mobile LCP ~**6.8s** | Heavy JS before hero paint | SSR hero **poster** (`next/image` priority) + static **H1**; tutor search deferred (`HeroSearchLazy`) | Confirm LCP element in PSI trace post-deploy (expected: poster or H1) |
| **PERF-TBT-001** | Desktop TBT ~**830ms** | Chat, translate, visitor, regional popup, geo IP on main thread | Tiered idle/scroll deferred widgets; route-scoped providers; home hero **no background MP4** (~500KB saved) | TBT improvement; not guaranteed &lt;200ms without measurement |
| **PERF-GEO-001** | Geo strip layout shift | Loading grid used `limit` columns; loaded state used `shown.length` | Shared grid classes; single ad spans full row (`md:col-span-2`); no empty placeholder strip when zero ads | Reduced CLS on regional banners |

### 2.3 P1 — Backend / API (production-readiness)

| ID | Issue | Resolution |
|----|-------|------------|
| **API-CACHE-001** | Repeated anonymous course detail load | `Cache-Control` on public `GET /courses/:id` for anonymous clients (`014cb7c`) |
| **API-SEC-001** | Historical IDOR on users/notifications/payments | Hardening on `production-readiness` (per audit BR-005); **deploy + `test:security` on staging** |

### 2.4 P1 — Auth & roles (frontend)

| ID | Deliverable | Resolution |
|----|-------------|------------|
| **AUTH-001** | Role-specific login entry | Public routes: `/login/student`, `/login/teacher`, `/login/parent` |
| **AUTH-002** | Staff / admin entry | `/staff-console` (hidden admin path) with role gating |
| **AUTH-003** | Navigation | Sign-up / nav links point to correct role logins |

### 2.5 P1 — Architecture / bundle health

| ID | Issue | Resolution |
|----|-------|------------|
| **ARCH-001** | Admin/LMS stores on every page | `RouteStoreProviders` — LMS/admin only on `/lms`, `/admin`, course detail gets `LearningProvider` only |
| **ARCH-002** | Google OAuth JS on all pages | `ScopedGoogleAuth` — `@react-oauth/google` only on auth routes (feature branch) |
| **ARCH-003** | Public home used admin mock catalog | `LearnAI`, `FeaturedTutors`, `IndustryExperts` use **`useCourses` / `useTutors`** (published API, shared cache) on feature branch |

### 2.6 P0 — Security (feature branch — **client action required**)

| ID | Issue | Resolution | **Client / ops action (blocker)** |
|----|-------|------------|-----------------------------------|
| **SEC-ENV-001** | `.env`, `.env.local`, `.env.production.local` were **tracked in public Git** | Removed from index; `.gitignore` updated; template remains `.env.example` | **Rotate** Geoapify, review Razorpay/Google keys; **purge secrets from Git history** — see `docs/security/ENV_ROTATION_AND_HISTORY.md` |

---

## 3. SEO (Search Engine Optimization) — delivered

| Deliverable | Implementation | Client verification |
|-------------|----------------|---------------------|
| **Page metadata** | `src/lib/page-metadata.ts`, per-route titles/descriptions/OG | View source / OG debugger on key URLs |
| **Canonical URLs** | `buildMetadata` / `SITE_URL` | No duplicate host variants |
| **hreflang** | `en` + `x-default` in metadata | International targeting baseline |
| **robots.txt** | `src/app/robots.ts` (dynamic) | Disallow staff/admin paths; allow public crawl |
| **XML sitemap** | `src/app/sitemap.ts` — static routes + **dynamic** tutor/course IDs + subject landing URLs | `https://www.teacherpoint.org/sitemap.xml` (~384+ URLs in audit) |
| **Structured data (JSON-LD)** | Global org/site in layout; **Course**, **Tutor**, **FAQ**, **Breadcrumb** components | Google Rich Results Test on course/tutor/FAQ pages |
| **Server SEO helpers** | `seo-server.ts` cached course/tutor fetches for metadata | Faster, consistent titles for detail pages |
| **Popular subjects** | Internal links + sitemap query URLs for tutor discovery | `/tutors?subject=…` entries intentional |
| **PSI SEO score** | Baseline **100** mobile/desktop (reported) | Re-run PSI after deploy |

**Script:** `npm run seo:validate` (run against **production URL** with site up).

---

## 4. AEO (Answer Engine Optimization) — delivered

AEO = content and structure so **answer engines** (Google AI Overviews, Bing Copilot, Perplexity, etc.) can cite accurate facts.

| Deliverable | Details |
|-------------|---------|
| **FAQ content** | Home + `/faq` with expandable Q&A; `FaqJsonLd` where applicable |
| **Clear entity statements** | About, contact, pricing, legal pages linked from footer and sitemap |
| **Factual trust strip** | `TrustStats` uses **qualitative** i18n strings (no unverified global counts) |
| **Course/tutor detail** | Server-rendered metadata + JSON-LD for named courses and tutors |
| **Breadcrumbs** | `BreadcrumbJsonLd` on course/tutor detail for hierarchy |
| **Noindex on auth** | Login/register/role-select excluded from marketing index where configured |

---

## 5. GEO — two meanings (both addressed)

### 5.1 GEO — Generative Engine Optimization (AI crawlers / LLMs)

| Deliverable | Details |
|-------------|---------|
| **`/llms.txt`** | `public/llms.txt` + `src/app/llms/route.ts`; rewrite in `next.config.ts` |
| **Plain-text summary** | Who TeacherPoint is, what users can do, **no private repo paths** |
| **15+ canonical links** | Home, tutors, courses, workshops, jobs, marketplace, legal, sitemap |
| **Content-Type** | `text/plain; charset=utf-8` for agents |
| **API pointer** | Documented public API base for integrations (not HTML) |
| **Agentic PSI** | Baseline mobile **2/3**, desktop **1/3** agentic checks; layout stability fixes target remaining gap |

### 5.2 GEO — Geographic / regional experience

| Deliverable | Details |
|-------------|---------|
| **IP / location context** | `LocationProvider`, deferred detect on non-critical routes |
| **Regional ads** | `GeoContentStrip`, `RegionalAdPopup` (deferred), `filterRegionalAds` |
| **Currency / language** | Currency + i18n + optional Google Translate (idle-loaded) |
| **Geo API routes** | Next.js `/api/geolocation/*` + backend `/api/v1/geo/ip` in production |
| **Layout stability** | Fixed grid geometry for 0/1/2 regional ads (feature branch) |

---

## 6. Performance & quality targets (honest status)

| Target (agreement-style) | Baseline | Current engineering status |
|--------------------------|----------|----------------------------|
| Mobile performance ≥ 90 | ~68 PSI | **Not certified** — optimizations merged; measure after deploy |
| Desktop performance ≥ 90 | ~46–47 PSI | **Not certified** |
| LCP ≤ 2.5s mobile | ~6.8s | Mitigations in place; **PSI proof pending** |
| CLS ≤ 0.1 | Mobile ~0.05; desktop ~0.65 | Desktop **improved in lab**; mobile home handoff **~0.17** in Playwright on feature branch — **still tuning** |
| GTmetrix Grade A | ~47% perf reported | **Not claimed** without new GTmetrix run |
| SEO 100 | Yes (baseline) | Expected to hold; validate live |

**We do not claim Lighthouse/GTmetrix 90+ without post-deploy measurements.**

---

## 7. Automated tests & scripts

| Test | Purpose | Typical result |
|------|---------|----------------|
| `npm run build` | Production compile | **Pass** on current branches |
| `npx playwright test` | Smoke, home CLS, course API bound | **9 pass / 2 fail** on feature branch (mobile CLS threshold; course link needs live catalog) |
| `npm run seo:validate` | robots, sitemap, llms, headers | Run against **live** URL |
| `npm run perf:lighthouse` | Local Lighthouse batch | Dev machine ≠ PSI |
| Backend `npm run test:security` | API auth regression | Run on **staging** after API deploy |

---

## 8. Open items & remaining risks (transparent for client)

| Priority | Item | Owner |
|----------|------|--------|
| **P0** | Rotate credentials + Git history cleanup (env files were public) | Client + DevOps |
| **P0** | Deploy `production-readiness` frontend + backend to production | Client hosting |
| **P1** | Mobile homepage CLS ≤ 0.1 (lab) | Engineering follow-up |
| **P1** | Admin console still uses mock data in places (`use-admin-store`) | Phase 0 audit backlog |
| **P1** | Paid enrollment without payment gate (product decision) | Product + backend |
| **P1** | Server-side admin RBAC (`requirePermission`) full enforcement | Backend |
| **P2** | NestJS/Postgres vs Express/Mongo contract clarification | Legal / PM |
| **P2** | npm audit (dev transitive advisories) | Engineering hygiene |

Full internal register: `docs/production-audit/07_BUG_AND_RISK_REGISTER.md`.

---

## 9. Deployment checklist (for client ops)

1. Pull **`production-readiness`** on API server and Next.js host.  
2. Set secrets **only** on server (never commit `.env`).  
3. `npm ci && npm run build` (frontend).  
4. Smoke: open `https://www.teacherpoint.org/courses/{valid-id}` → **one** course API call.  
5. Smoke: `curl -I https://www.teacherpoint.org/llms.txt` → **200**, `text/plain`.  
6. Run **PageSpeed Insights** (3× mobile, 3× desktop) — record medians.  
7. Optional: GTmetrix / WebPageTest for grade tracking.  
8. Merge **`fix/security-env-and-home-performance`** after security rotation + PR review.

---

## 10. Document control

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-10-23 | Initial client summary: bugs, SEO, AEO, GEO, performance, security |

**Attachments you may share with the client alongside this doc:**

- `docs/performance/FINAL_DEPLOYMENT_CHECKLIST.md`
- `docs/security/ENV_ROTATION_AND_HISTORY.md`
- `docs/performance/FEATURE_BRANCH_REPORT.md` (technical appendix)
- `public/llms.txt` (live URL)

---

*This summary describes engineering deliverables and honest verification status. It is not a legal amendment to the development agreement. For milestone sign-off, attach the signed PDF milestone table to section 2 rows.*
