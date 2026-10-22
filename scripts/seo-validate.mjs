/**
 * Post-build SEO checks. Run: node scripts/seo-validate.mjs [baseUrl]
 * Default baseUrl: http://localhost:3000 (start `npm run start` first).
 */
const base = (process.argv[2] || process.env.SEO_VALIDATE_BASE || "http://localhost:3000").replace(/\/$/, "");

const routes = [
  { path: "/", expectTitle: /TeacherPoint/i, index: true },
  { path: "/tutors", expectTitle: /Tutor/i, index: true },
  { path: "/faq", expectTitle: /FAQ/i, index: true },
  { path: "/student", expectTitle: /Student/i, index: false },
  { path: "/login/student", expectTitle: /log in/i, index: false },
];

function parseRobotsMeta(html) {
  const m = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
  return m?.[1]?.toLowerCase() ?? "";
}

async function checkRoute({ path, expectTitle, index }) {
  const url = `${base}${path}`;
  const res = await fetch(url, { headers: { Accept: "text/html" } });
  const html = await res.text();
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "";
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1];
  const robots = parseRobotsMeta(html);
  const titleOk = expectTitle.test(title);
  const canonicalOk = Boolean(canonical?.includes("teacherpoint.org"));
  const indexOk = index ? !robots.includes("noindex") : robots.includes("noindex");
  const ogOk = Boolean(ogTitle);
  const ok = res.ok && titleOk && canonicalOk && indexOk && ogOk;
  return { path, status: res.status, ok, title, canonical, robots, ogTitle };
}

async function checkRobots() {
  const res = await fetch(`${base}/robots.txt`);
  const text = await res.text();
  return {
    ok: res.ok && text.includes("Sitemap:") && text.includes("staff-console"),
    status: res.status,
    hasSitemap: text.includes("sitemap.xml"),
    hasStaffDisallow: /Disallow:\s*\/staff-console/i.test(text),
  };
}

async function checkSitemap() {
  const res = await fetch(`${base}/sitemap.xml`);
  const text = await res.text();
  const urlCount = (text.match(/<loc>/g) || []).length;
  return {
    ok: res.ok && urlCount > 10 && !text.includes("/student"),
    status: res.status,
    urlCount,
    hasTutors: text.includes("/tutors"),
  };
}

async function main() {
  console.log(`SEO validate → ${base}\n`);
  let failed = 0;

  for (const route of routes) {
    const r = await checkRoute(route);
    const mark = r.ok ? "PASS" : "FAIL";
    if (!r.ok) failed += 1;
    console.log(`${mark}  ${route.path} (${r.status}) title="${r.title.slice(0, 50)}…" robots=${r.robots || "default"}`);
  }

  const robots = await checkRobots();
  console.log(`${robots.ok ? "PASS" : "FAIL"}  /robots.txt (${robots.status}) urls in sitemap ref=${robots.hasSitemap}`);
  if (!robots.ok) failed += 1;

  const sitemap = await checkSitemap();
  console.log(
    `${sitemap.ok ? "PASS" : "FAIL"}  /sitemap.xml (${sitemap.status}) loc count=${sitemap.urlCount}`,
  );
  if (!sitemap.ok) failed += 1;

  console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
