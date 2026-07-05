# TeacherPoint — Next.js frontend

Migrated from `website-hub` (TanStack Start) to **Next.js 15 App Router**.

## Development

```bash
npm install
npm run dev
```

## Environment

Set in `.env.local`:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

## Assets

Same images/videos from the original site in `/public`:

- `hero-video.mp4`, `tutor-hero-video.mp4`
- `teacherspoints-logo.png`, `favicon.png`

## SEO

- Root layout: Open Graph, Twitter cards, JSON-LD
- `app/sitemap.ts` for search engines
- Wappalyzer will detect **Next.js** when deployed
