# Phase 3 — Agentic browsing / llms.txt

**PSI baseline (2026-10-23):** mobile agentic **2/3**, desktop **1/3** (llms.txt + desktop layout stability per audit).

## llms.txt

| Check | Before | After Phase 3 |
|-------|--------|----------------|
| Public URL | `/llms.txt` | Same |
| Content-Type | default static | `text/plain; charset=utf-8` via `next.config.ts` |
| `#` title | Yes | Yes |
| `>` summary | Short | Expanded factual summary |
| Valid public links | Few | **15+** markdown links (tutors, courses, FAQ, legal, sitemap) |
| Private repo paths | Referenced `docs/production-readiness/` | **Removed** |
| Redirect to HTML | Not tested on prod in this pass | Verify post-deploy |

## Layout stability (agentic)

Desktop PSI CLS **0.651** likely failed agentic layout checks. Phase 3 CLS fixes target the same root causes (see `PHASE3_CLS_TRACE.md`). **Re-audit on PSI after deploy.**

## Semantic / navigation

No WebMCP added. Existing nav uses labeled buttons/links (`Header`, `MobileNav`). Further a11y heading-order fixes deferred to Phase 3 task 5 spot checks.

## Checklist (post-deploy)

- [ ] `curl -I https://www.teacherpoint.org/llms.txt` → 200, `text/plain`
- [ ] Lighthouse agentic browsing panel on mobile + desktop
- [ ] Confirm no `noindex` on linked public URLs in llms.txt
