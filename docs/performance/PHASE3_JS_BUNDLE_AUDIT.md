# Phase 3 — JS / main-thread audit

**PSI baseline (2026-10-23):** mobile TBT **270ms**, desktop TBT **830ms**.

## Root scope (unchanged from Phase 2)

Global: `QueryClient`, `Location`, `Currency`, `I18n`, `GoogleAuth`, `App`, layout chrome.  
Route-scoped: admin/LMS/learning/marketplace (`RouteStoreProviders.tsx`).

## Phase 3 TBT-oriented changes

| Area | Change |
|------|--------|
| `AppProviders.tsx` | Deferred widgets after **scroll/pointerdown** or idle (6s cap) — chat, popup, translate, tracker |
| `Hero.tsx` | `TutorSearchPanel` dynamic import (not in initial homepage chunk) |
| `layout.tsx` | Display font `optional` reduces font blocking |

## Build snapshot

- `/` First Load JS: **~146 kB** page + **~103 kB** shared (post Phase 2 build; unchanged order of magnitude).

## Lab TBT (localhost LH)

Desktop median **~12,022 ms**, mobile **~11,857 ms** — **BLOCKED as PSI proxy** (dev machine + non-CDN localhost inflates main-thread; not used for claims).

## Next bundle targets (not done in Phase 3)

1. `@next/bundle-analyzer` on `/` and `/tutors`.
2. Split `TutorSearchPanel` hero vs page variants.
3. User-gesture gate for `RegionalAdPopup` only (already delayed in `popup-sequence`).

## Acceptance

Desktop TBT ≤200ms on comparable lab — **not met** in local LH; use production PSI after deploy.
