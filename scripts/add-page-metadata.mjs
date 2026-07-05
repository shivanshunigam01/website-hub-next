import fs from "node:fs";
import path from "node:path";

const APP = path.resolve(import.meta.dirname, "..", "src", "app");

const DYNAMIC_PREFIXES = {
  "courses/[id]": "/courses",
  "tutor-jobs/[id]": "/tutor-jobs",
  "tutors/[id]": "/tutors",
  "workshops/[id]": "/workshops",
};

function routePath(dirRel) {
  if (dirRel === ".") return "/";
  if (DYNAMIC_PREFIXES[dirRel]) return { dynamic: DYNAMIC_PREFIXES[dirRel] };
  return `/${dirRel}`;
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (entry.name !== "page.tsx") continue;

    const dirRel = path.relative(APP, path.dirname(full)).replace(/\\/g, "/");
    const route = routePath(dirRel);
    const content = fs.readFileSync(full, "utf8");
    const m = content.match(/import (\w+) from "@\/views\/([^"]+)"/);
    if (!m) continue;
    const alias = m[1];
    const viewImport = m[2];

    let metaExport;
    if (typeof route === "object" && route.dynamic) {
      metaExport = `export { generateMetadata } from "@/lib/page-metadata";\n// replaced below\n`;
      metaExport = `export { createDynamicPageMetadata } from "@/lib/page-metadata";\nexport const generateMetadata = createDynamicPageMetadata("${route.dynamic}");\n`;
    } else {
      metaExport = `import { createStaticPageMetadata } from "@/lib/page-metadata";\n\nexport const generateMetadata = createStaticPageMetadata("${route}");\n`;
    }

    const next = `import { Suspense } from "react";
import ${alias} from "@/views/${viewImport}";
${typeof route === "object" && route.dynamic ? `import { createDynamicPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createDynamicPageMetadata("${route.dynamic}");
` : `import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("${route}");
`}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <${alias} />
    </Suspense>
  );
}
`;
    fs.writeFileSync(full, next);
    console.log("metadata", dirRel || "/");
  }
}

walk(APP);
console.log("done");
