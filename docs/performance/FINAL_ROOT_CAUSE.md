# Final root cause summary (Oct 23, 2026 baseline)

| ID | Problem | Component | Root cause |
|----|---------|-----------|------------|
| RC-D1 | Desktop CLS 0.651 (PSI) | `AppProviders`, lazy sections, geo strip | Footer padding wrapper + section height collapse on hydrate |
| RC-M1 | Mobile LCP 6.8s (PSI) | `Hero.tsx` (client-only) | LCP image/H1 waited on JS hydration |
| RC-T1 | Desktop TBT 830ms (PSI) | Global providers + deferred widgets | Main-thread work before idle; large client bundles |
| RC-API1 | Course detail API loop | `courses.$id.tsx` | `useEffect([id, lms])` re-ran when `loadCurriculum` updated LMS store → new `lms` reference |

PSI baselines supersede older GTmetrix reports. Local Lighthouse after fixes: desktop CLS median ~0.003 (lab); production PSI must be re-run post-deploy.
