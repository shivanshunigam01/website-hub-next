/**
 * Smoke-test public API endpoints used by website-hub-next.
 * Usage: node scripts/verify-api.mjs [baseUrl]
 */
const base =
  process.argv[2]?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.teacherpoint.org/api/v1";

const endpoints = [
  { name: "Tutors list", path: "/tutors?limit=1&page=1" },
  { name: "Tutor facets", path: "/tutors/facets" },
  { name: "Popular subjects", path: "/subjects/popular?limit=5" },
  { name: "Workshops", path: "/workshops?limit=1" },
  { name: "Requirement facets", path: "/requirements/facets" },
  { name: "Geo reverse (Delhi)", path: "/geo/reverse?lat=28.6139&lon=77.2090" },
];

async function check({ name, path }) {
  const url = `${base}${path}`;
  const started = Date.now();
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const ms = Date.now() - started;
    let body;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    const ok = res.ok && body?.success !== false;
    console.log(`${ok ? "✓" : "✗"} ${name}: ${res.status} (${ms}ms) → ${url}`);
    if (!ok) {
      console.log("  ", body?.message || res.statusText || "Unknown error");
    }
    return ok;
  } catch (err) {
    console.log(`✗ ${name}: FAILED → ${url}`);
    console.log("  ", err.message);
    return false;
  }
}

console.log(`API base: ${base}\n`);
const results = await Promise.all(endpoints.map(check));
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${endpoints.length} endpoints OK`);
process.exit(passed === endpoints.length ? 0 : 1);
