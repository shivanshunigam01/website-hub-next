/**
 * SEO / AEO / GEO validation. Run: node scripts/seo-validate.mjs [baseUrl]
 */
const base = (process.argv[2] || process.env.SEO_VALIDATE_BASE || "http://localhost:3000").replace(/\/$/, "");

const routes = [
  { path: "/", expectTitle: /TeacherPoint/i, index: true, jsonLd: true },
  { path: "/tutors", expectTitle: /Tutor/i, index: true },
  { path: "/courses", expectTitle: /Course/i, index: true },
  { path: "/faq", expectTitle: /FAQ/i, index: true, faqSchema: true },
  { path: "/student", expectTitle: /Student/i, index: false },
  { path: "/login/student", expectTitle: /log in/i, index: false },
];

function parseRobotsMeta(html) {
  const m = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
  return m?.[1]?.toLowerCase() ?? "";
}

async function checkRoute({ path, expectTitle, index, jsonLd, faqSchema }) {
  const url = `${base}${path}`;
  const res = await fetch(url, { headers: { Accept: "text/html" } });
  const html = await res.text();
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "";
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1];
  const robots = parseRobotsMeta(html);
  const hasJsonLd = html.includes("application/ld+json");
  const hasFaq = html.includes('"FAQPage"');
  const hasWebsite = html.includes('"WebSite"') || html.includes('"EducationalOrganization"');
  const titleOk = expectTitle.test(title);
  const canonicalOk = Boolean(canonical?.includes("teacherpoint.org"));
  const indexOk = index ? !robots.includes("noindex") : robots.includes("noindex");
  const ogOk = Boolean(ogTitle);
  const schemaOk = !jsonLd || (hasJsonLd && hasWebsite);
  const faqOk = !faqSchema || hasFaq;
  const ok = res.ok && titleOk && canonicalOk && indexOk && ogOk && schemaOk && faqOk;
  return { path, status: res.status, ok, title, canonical, robots, schemaOk, faqOk };
}

async function checkLlms() {
  const res = await fetch(`${base}/llms.txt`);
  const text = await res.text();
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  const linkCount = (text.match(/\]\(https:\/\/www\.teacherpoint\.org/g) || []).length;
  return {
    ok:
      res.ok &&
      text.startsWith("# TeacherPoint") &&
      text.includes("\n> ") &&
      linkCount >= 10 &&
      !text.includes("docs/production-readiness") &&
      !text.includes("repository `docs") &&
      ct.includes("text/plain"),
    status: res.status,
    contentType: ct,
    linkCount,
    hasPrivateDocRef: text.includes("production-readiness"),
  };
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
    hasCourses: text.includes("/courses/"),
  };
}

async function main() {
  console.log(`SEO / AEO / GEO validate → ${base}\n`);
  let failed = 0;

  for (const route of routes) {
    const r = await checkRoute(route);
    const mark = r.ok ? "PASS" : "FAIL";
    if (!r.ok) failed += 1;
    console.log(`${mark}  ${route.path} (${r.status}) robots=${r.robots || "default"} schema=${r.schemaOk}`);
  }

  const llms = await checkLlms();
  console.log(
    `${llms.ok ? "PASS" : "FAIL"}  /llms.txt (${llms.status}) links=${llms.linkCount} type=${llms.contentType}`,
  );
  if (!llms.ok) failed += 1;

  const robots = await checkRobots();
  console.log(`${robots.ok ? "PASS" : "FAIL"}  /robots.txt (${robots.status})`);
  if (!robots.ok) failed += 1;

  const sitemap = await checkSitemap();
  console.log(`${sitemap.ok ? "PASS" : "FAIL"}  /sitemap.xml (${sitemap.status}) loc=${sitemap.urlCount}`);
  if (!sitemap.ok) failed += 1;

  console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
