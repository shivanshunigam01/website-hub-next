import fs from "node:fs";
import path from "node:path";

const APP = path.resolve(import.meta.dirname, "..", "src", "app");

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (entry.name !== "page.tsx") continue;

    const content = fs.readFileSync(full, "utf8");
    const m = content.match(/import (\w+) from "@\/views\/([^"]+)"/);
    if (!m) continue;
    const alias = m[1];
    const viewImport = m[2];

    const next = `import { Suspense } from "react";
import ${alias} from "@/views/${viewImport}";

export { generateMetadata } from "@/lib/page-metadata";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <${alias} />
    </Suspense>
  );
}
`;
    fs.writeFileSync(full, next);
  }
}

walk(APP);
console.log("Wrapped pages in Suspense");
