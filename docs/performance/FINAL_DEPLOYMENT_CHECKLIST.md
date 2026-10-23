# Deployment checklist

1. Pull `production-readiness` (includes SSR hero + course API fix).
2. `npm ci && npm run build` on server with production `NEXT_PUBLIC_*` env.
3. Restart Next process (PM2).
4. Verify `https://www.teacherpoint.org/courses/{id}` — **one** `/courses/:id` request in Network tab.
5. PageSpeed Insights mobile + desktop ×3 medians.
6. GTmetrix / WebPageTest optional for grade tracking.
7. `npm run seo:validate` against live URL.
8. Confirm `llms.txt`, `robots.txt`, `sitemap.xml` return 200.

Do not commit `.env` files.
