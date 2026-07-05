import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const viewsDir = path.join(ROOT, "src", "views");

const NAV_HOOKS = ["useNavigate", "useSearch", "useParams", "useRouterState", "Navigate"];

function stripRouteExports(content) {
  return content.replace(/\nexport const Route = createFileRoute\([^)]+\)\(\{[\s\S]*?\}\);\n?/g, "\n");
}

function stripCreateFileRouteImport(content) {
  let next = content.replace(
    /import \{ createFileRoute \} from "@\/lib\/navigation";\n?/g,
    "",
  );
  next = next.replace(
    /import \{ createFileRoute, ([^}]+)\} from "@\/lib\/navigation";\n?/g,
    'import { $1 } from "@/lib/navigation";\n',
  );
  return next;
}

function ensureNavImports(content) {
  const needed = NAV_HOOKS.filter((hook) => {
    const re = hook === "Navigate" ? /<Navigate\b/ : new RegExp(`\\b${hook}\\(`);
    return re.test(content);
  });
  if (needed.length === 0) return content;

  const importRe = /import \{([^}]+)\} from "@\/lib\/navigation";/;
  const match = content.match(importRe);
  if (match) {
    const existing = match[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const merged = [...new Set([...existing, ...needed])].sort();
    return content.replace(importRe, `import { ${merged.join(", ")} } from "@/lib/navigation";`);
  }

  const useClient = content.startsWith('"use client";');
  const importLine = `import { ${needed.join(", ")} } from "@/lib/navigation";\n`;
  if (useClient) {
    return content.replace('"use client";\n', `"use client";\n\n${importLine}`);
  }
  return `${importLine}\n${content}`;
}

for (const file of fs.readdirSync(viewsDir)) {
  if (!file.endsWith(".tsx")) continue;
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;
  content = stripRouteExports(content);
  content = stripCreateFileRouteImport(content);
  content = ensureNavImports(content);
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log("patched", file);
  }
}

console.log("done");
