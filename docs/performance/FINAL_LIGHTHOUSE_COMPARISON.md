# Lighthouse comparison

| Metric | PSI Oct 23 baseline | Local lab (post-fix) | Target | Status |
|--------|---------------------|----------------------|--------|--------|
| Mobile Perf | 68 | ~34 (lab) | ≥90 | **FAIL** |
| Desktop Perf | 46 | ~30 (lab) | ≥90 | **FAIL** |
| Mobile LCP | 6.8s | not reliable locally | ≤2.5s | **BLOCKED** (PSI after deploy) |
| Desktop LCP | 1.1s | — | — | — |
| Mobile CLS | 0.05 | ~0.13 lab / 0.877 pre padding fix | ≤0.1 | Re-test PSI |
| Desktop CLS | **0.651** | **~0.003** median (3 runs) | ≤0.1 | **Lab PASS** |
| Mobile TBT | 270ms | inflated locally | ≤200ms | Re-test PSI |
| Desktop TBT | 830ms | inflated locally | ≤200ms | Re-test PSI |
| SEO | 100 | validate script PASS | 100 | **PASS** |

Commands: `npm run build && npm run start` then `node scripts/lighthouse-batch.mjs http://localhost:3000 3 desktop|mobile`.

**GTmetrix grade A:** Requires production deploy + CDN; not verified in this sprint.

## SEO / AEO / GEO (measured)

| Check | Live production (Oct 23) | Repo after this sprint |
|-------|--------------------------|-------------------------|
| PSI SEO | 100 | Expanded `seo:validate` PASS locally |
| llms.txt | FAIL agentic — `docs/production-readiness` link, weak markdown links | Fixed content + `/llms.txt` rewrite → `/llms` route |
| Breadcrumb JSON-LD | Missing on profiles | Added on `/courses/[id]`, `/tutors/[id]` |
| hreflang | canonical only | `en` + `x-default` |

**Deploy required** for live llms.txt and performance fixes to affect teacherpoint.org.
