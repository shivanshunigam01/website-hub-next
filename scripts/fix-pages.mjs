import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const APP = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "app");

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (entry.name !== "page.tsx") continue;

    const rel = path.relative(APP, full).replace(/\\page\.tsx$/, "").replace(/\\/g, "/");
    const viewPath = rel === "page.tsx" ? "index" : rel.replace(/\[id\]/g, ".$id");
    const viewFile = viewPath === "" || viewPath === "page.tsx" ? "index" : viewPath.replace(/\//g, ".").replace(".page", "");
    
    // derive view import from folder path
    let viewKey = path.dirname(full);
    while (viewKey !== APP && !fs.existsSync(path.join(APP, "..", "views"))) {}
    
    const parts = path.relative(APP, path.dirname(full)).split(path.sep).filter(Boolean);
    let viewName = parts.length ? parts.join(".") : "index";
    if (parts.includes("[id]")) {
      viewName = parts.slice(0, -1).join(".") + ".$id";
    }

    const ViewComponent = viewName
      .split(/[._-]/)
      .map((s) => s.replace(/\[|\]/g, "").charAt(0).toUpperCase() + s.slice(1))
      .join("") + "View";

    const importPath = `@/views/${viewName === "Index" ? "index" : viewName.toLowerCase() === "index" ? "index" : viewName}`;

    // simpler: read current import line
    let content = fs.readFileSync(full, "utf8");
    const m = content.match(/import (\w+) from "@\/views\/([^"]+)"/);
    if (!m) continue;
    const fnName = m[1];
    const viewImport = m[2];
    const alias = fnName + "Page";

    content = `import ${alias} from "@/views/${viewImport}";\n\nexport { generateMetadata } from "@/lib/page-metadata";\n\nexport default function Page() {\n  return <${alias} />;\n}\n`;
    fs.writeFileSync(full, content);
  }
}

walk(APP);
console.log("Fixed page.tsx imports");
