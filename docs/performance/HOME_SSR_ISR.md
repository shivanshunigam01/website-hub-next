# Homepage catalog — SSR + ISR

## What we use

| Technique | Role on `/` |
|-----------|-------------|
| **SSR** | `page.tsx` is an async Server Component. It fetches published courses/tutors from the API during the request. |
| **ISR** | `export const revalidate = 120` — Next.js caches the rendered page and refreshes catalog data at most every **2 minutes**. |
| **Hydration** | `HydrationBoundary` + `@tanstack/react-query` seeds the client cache so `useCourses` / `useTutors` render **immediately** without a loading spinner when data was fetched on the server. |
| **RSC** | Hero metadata and copy remain server-rendered via `HomeHeroServer` inside `HomeHeroClient`. Interactive search stays client-only. |

## Not used (yet)

- **PPR (Partial Prerendering)** — Next.js can static-shell + stream dynamic holes; not enabled in `next.config.ts`. ISR + hydration covers most of the win without experimental flags.
- **Full static home** — Course/tutor lists change often; ISR is a better fit than `force-static`.

## Local dev

Server fetch uses `NEXT_PUBLIC_API_URL` or `http://localhost:4000/api/v1`. Start the backend on **port 4000** before loading the home page.

## Files

- `src/lib/catalog-server.ts` — server `fetch` + `revalidate`
- `src/lib/prefetch-home-catalog-server.ts` — seeds React Query
- `src/app/page.tsx` — `revalidate` + `HydrationBoundary`
