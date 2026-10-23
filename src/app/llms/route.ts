import { LLMS_TXT } from "@/lib/llms-content";

/** Served at /llms via rewrite from /llms.txt in next.config. */
export function GET() {
  return new Response(LLMS_TXT, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
