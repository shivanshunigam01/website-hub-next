# SEO & agentic audit

| Resource | Mechanism | Status (local) |
|----------|-----------|----------------|
| `/robots.txt` | `src/app/robots.ts` | `seo:validate` PASS |
| `/sitemap.xml` | `src/app/sitemap.ts` | 384 URLs |
| `/llms.txt` | `public/llms.txt` + `Content-Type` header | Expanded links; e2e smoke |

Agentic (PSI Oct 23): mobile 2/3, desktop 1/3 — llms.txt + layout stability. Re-audit after deploy.
