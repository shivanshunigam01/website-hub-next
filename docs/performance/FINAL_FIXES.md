# Final fixes applied

## Desktop CLS
1. **Problem:** Large layout shifts on desktop homepage.  
2. **Files:** `AppProviders.tsx`, `GeoContentStrip.tsx`, `views/index.tsx`, `Header.tsx`, `DeferredBackgroundVideo.tsx`  
3. **Change:** `max-lg` main padding only; stable geo placeholders; section `min-h` shells; poster kept when video fades in.  
4. **Test:** `e2e/home-layout.spec.ts` CLS probe at 1280/1440/1920.  
5. **Metric:** PSI baseline desktop CLS 0.651 → lab median ~0.003 (post Phase 3+4).  
6. **Risk:** PSI may differ until `4973940+` deploy.

## Mobile LCP
1. **Problem:** 6.8s mobile LCP (PSI).  
2. **Files:** `HomeHeroServer.tsx`, `HeroInteractive.tsx`, `HeroVideoLayer.tsx`, `app/page.tsx`  
3. **Change:** SSR `next/image` poster + static H1; client-only search/CTAs; video overlay without removing poster.  
4. **Test:** SSR HTML contains `hero-headline` (`home-layout.spec.ts`).  
5. **Metric:** **BLOCKED** on authoritative PSI until production deploy.  
6. **Risk:** Non-English locales still hydrate copy client-side.

## Course API loop
1. **Problem:** `/courses/:id` called repeatedly in a loop.  
2. **Files:** `courses.$id.tsx`, `use-catalog.ts`  
3. **Root cause:** `useEffect` depended on entire `lms` store object; each `loadCurriculum` state update retriggered effect.  
4. **Change:** Single `useCourse` query returns `{ course, curriculum }`; removed LMS `loadCurriculum` effect on public detail page.  
5. **Test:** Manual + build pass; one React Query fetch per course id.  
6. **Risk:** LMS admin paths unchanged.
