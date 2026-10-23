# Phase 3 — Desktop CLS trace analysis

**PSI baseline (2026-10-23):** mobile CLS **0.05**, desktop CLS **0.651** (production URL).  
**Lab after fixes:** `http://localhost:3000`, production build, Lighthouse CLI v13, 3× desktop — **median CLS 0.0028** (PASS ≤0.1).

## Hypothesis (code + trace)

Desktop CLS was far worse than mobile because wide-viewport homepage content **gained height after paint** while mobile already reserved space from Phase 2 skeletons.

| Suspected source | Component / selector | Mechanism | Fix applied |
|------------------|----------------------|-----------|-------------|
| Geo ads mount/collapse | `GeoContentStrip.tsx` | `loading → null` when no ads removed grid height | Stable `aspect-[16/7]` placeholders when empty |
| Lazy section height | `views/index.tsx` | `min-h-[200px]` placeholders vs 560px+ sections | Per-section `min-h` (e.g. Trending **620px**, TopTutors **480px**) |
| Hero search hydrate | `Hero.tsx` | 132px skeleton → taller `TutorSearchPanel` | `min-h-[168px] md:min-h-[200px]` skeleton |
| Promo bar hydration | `Header.tsx` | `mounted ? promo : opacity-0` swapped text | Always render promo; `min-h` on bar |
| Auth cluster width | `Header.tsx` | Login ↔ user menu after `useApp` hydrate | Sync session from `localStorage` on init; `min-w` on actions |
| Footer padding wrapper | `AppProviders.tsx` `div.pb-[calc(...)]` | **Mobile lab:** 0.88 CLS when padding lived on footer wrapper | Padding moved to `<main>`; footer unwrapped |
| Decorative blurs | `HeroBackground.tsx` | Minor shifts on absolute blur orbs | Remaining ~0.10 CLS on mobile lab (non-blocking desktop) |

## Lighthouse layout-shift snippets (desktop, post-fix)

Dominant shifts (~0.0015 each):

- `main.flex-1 > section.relative > div.pointer-events-none > div.pointer-events-none`  
  (hero decorative blur in `HeroBackground.tsx`)

## Mobile lab note

Before main padding fix, mobile LH attributed **CLS 0.877** to  
`div.pb-[calc(3.5rem+max(1rem,env(safe-area-inset-bottom)))] lg:pb-0` in `AppProviders.tsx`.  
After moving padding to `<main>`, mobile lab **median CLS 0.133** (3 runs).

## Acceptance

| Profile | Target | Local median | PSI baseline |
|---------|--------|--------------|--------------|
| Desktop CLS | ≤0.1 | **0.0028** | 0.651 |
| Mobile CLS | ≤0.1 | **0.133** (lab) | 0.05 |

Re-run **PageSpeed on https://www.teacherpoint.org/** after deploy for authoritative desktop/mobile CLS.
