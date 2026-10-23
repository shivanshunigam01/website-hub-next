# Phase 3 — Mobile LCP trace

**PSI baseline (2026-10-23):** mobile LCP **6.8s**, desktop LCP **1.1s**.

## Likely LCP element

- **Mobile:** hero poster (`hero-illustration.jpg` via `DeferredBackgroundVideo` / `next/image` `priority`) or hero `<h1>` if image is delayed.
- **Desktop:** hero poster or headline; video deferred with `requireMediaQuery="(min-width: 769px)"`.

## Changes (Phase 3)

| Lever | File | Change |
|-------|------|--------|
| Early discovery | `src/app/page.tsx` | `<link rel="preload" as="image" fetchPriority="high">` for hero poster |
| Bandwidth | `HeroBackground.tsx` | No MP4 on viewports &lt;769px (poster-only mobile) |
| Hydration delay | `Hero.tsx` | Taller search skeleton to avoid reflow; panel still `dynamic` `ssr:false` |
| Font | `layout.tsx` | Plus Jakarta `display: "optional"` to reduce swap delay on headline |

## Lab measurements (localhost production build, 3× mobile LH)

| Run | LCP (ms) | FCP (ms) |
|-----|----------|----------|
| (post footer CLS fix) median | **~12,298** | **~1,730** |

Lab LCP is **not comparable** to PSI (TTFB, CDN, CPU throttling differ). One mobile run showed **~2.45s** LCP before variance.

## Remaining risks

1. `TutorSearchPanel` still client-only — main thread work before stable paint.
2. Hero remains a Client Component tree; H1 waits on i18n hydration.
3. Production TTFB / API not measured in local lab.

## Acceptance

Target mobile LCP ≤2.5s — **not verified in lab median**; re-test on production PSI after deploy.
