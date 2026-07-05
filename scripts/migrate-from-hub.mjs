/**
 * Migrates website-hub TanStack routes into Next.js app + views.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const HUB = path.join(ROOT, "..", "website-hub");
const SRC = path.join(ROOT, "src");
const APP = path.join(SRC, "app");
const VIEWS = path.join(SRC, "views");

const COPY_DIRS = ["components", "hooks", "services", "types", "data", "i18n", "assets"];

const SKIP_ROUTES = new Set(["__root.tsx", "tutors.tsx"]);

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function routeFileToAppPath(filename) {
  if (filename === "index.tsx") return "page.tsx";
  if (filename === "sitemap[.]xml.ts") return null;

  let parts = filename.replace(/\.tsx$/, "").split(".");
  if (parts[parts.length - 1] === "index") parts.pop();
  const segments = parts.map((p) => (p.startsWith("$") ? `[${p.slice(1)}]` : p));
  return `${segments.join("/")}/page.tsx`;
}

function toPascalCase(name) {
  return name
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

function transformSource(content, isView = false) {
  let out = content;

  out = out.replace(/from "@tanstack\/react-router"/g, 'from "@/lib/navigation"');
  out = out.replace(/from '@tanstack\/react-router'/g, "from '@/lib/navigation'");
  out = out.replace(/import type \{\} from "@tanstack\/react-start";\n/g, "");

  out = out.replace(/import\.meta\.env\.VITE_([A-Z0-9_]+)/g, "process.env.NEXT_PUBLIC_$1");
  out = out.replace(/import\.meta\.env\.DEV/g, "process.env.NODE_ENV === 'development'");

  if (isView) {
    out = out.replace(/export const Route = createFileRoute\([\s\S]*?\n\}\);\n\n?/m, "");
    out = out.replace(/^import \{ createFileRoute(?:, [^}]+)? \} from "@\/lib\/navigation";\n/m, "");
    out = out.replace(/^import \{ createFileRoute \} from "@\/lib\/navigation";\n/m, "");

    // Remove head() blocks inside createFileRoute if any remain
    out = out.replace(/\n  head: \(\) => \(\{[\s\S]*?\}\),\n/g, "\n");

    // Ensure default export from last function component
    if (!/export default/.test(out)) {
      const match = out.match(/function ([A-Z][A-Za-z0-9]+)\s*\(/g);
      if (match?.length) {
        const lastFn = match[match.length - 1].replace("function ", "").replace("(", "");
        out += `\nexport default ${lastFn};\n`;
      }
    }
  }

  const isClient =
    /useState|useEffect|useRef|useCallback|useMemo|useContext|window\.|document\.|localStorage|useRouter|useSearchParams|useParams|useNavigate|useTranslation|framer-motion|onClick|onChange|useQuery|useMutation|usePathname/.test(
      out,
    );

  if (isClient && !out.includes('"use client"') && !out.includes("'use client'")) {
    out = `"use client";\n\n${out}`;
  }

  return out;
}

function walkTransform(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full.includes(`${path.sep}app${path.sep}`) || full.includes(`${path.sep}views${path.sep}`)) continue;
      walkTransform(full);
      continue;
    }
    if (!/\.(tsx?|jsx?)$/.test(entry.name)) continue;
    const raw = fs.readFileSync(full, "utf8");
    if (!raw.includes("@tanstack") && !raw.includes("import.meta.env")) continue;
    fs.writeFileSync(full, transformSource(raw));
  }
}

function processRoutes() {
  const routesDir = path.join(HUB, "src", "routes");
  fs.mkdirSync(VIEWS, { recursive: true });

  for (const entry of fs.readdirSync(routesDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".tsx")) continue;
    if (SKIP_ROUTES.has(entry.name)) continue;

    const appRel = routeFileToAppPath(entry.name);
    if (!appRel) continue;

    const baseName = entry.name.replace(/\.tsx$/, "");
    const viewExport = toPascalCase(baseName) + "Page";
    const viewFile = path.join(VIEWS, `${baseName}.tsx`);

    let raw = fs.readFileSync(path.join(routesDir, entry.name), "utf8");
    raw = transformSource(raw, true);
    raw = raw.replace(/export default ([A-Za-z0-9_]+);/g, `export default function ${viewExport}()`);
    // fix broken replace - simpler: rename default export
    raw = transformSource(fs.readFileSync(path.join(routesDir, entry.name), "utf8"), true);
    const fnMatch = raw.match(/function ([A-Z][A-Za-z0-9]+)/);
    const fnName = fnMatch?.[1] ?? viewExport;
    if (!raw.includes("export default")) {
      raw += `\nexport default ${fnName};\n`;
    } else {
      raw = raw.replace(/export default \w+;/, `export default ${fnName};`);
    }

    fs.writeFileSync(viewFile, raw);

    const appPath = path.join(APP, appRel);
    fs.mkdirSync(path.dirname(appPath), { recursive: true });

    const importPath = `@/views/${baseName}`;
    fs.writeFileSync(
      appPath,
      `import ${fnName} from "${importPath}";

export { generateMetadata } from "@/lib/page-metadata";

export default function Page() {
  return <${fnName} />;
}
`,
    );
  }
}

console.log("Copying public + src from website-hub...");
if (fs.existsSync(path.join(SRC, "app"))) {
  for (const f of fs.readdirSync(path.join(SRC, "app"))) {
    const p = path.join(SRC, "app", f);
    if (f === "api") continue;
    fs.rmSync(p, { recursive: true, force: true });
  }
}

copyDir(path.join(HUB, "public"), path.join(ROOT, "public"));
for (const dir of COPY_DIRS) {
  const dest = path.join(SRC, dir);
  if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
  copyDir(path.join(HUB, "src", dir), dest);
}

// Re-copy lib but keep navigation + page-metadata
const libBackup = {
  navigation: fs.readFileSync(path.join(SRC, "lib", "navigation.tsx"), "utf8"),
  pageMetadata: fs.readFileSync(path.join(SRC, "lib", "page-metadata.ts"), "utf8"),
};
copyDir(path.join(HUB, "src", "lib"), path.join(SRC, "lib"));
fs.writeFileSync(path.join(SRC, "lib", "navigation.tsx"), libBackup.navigation);
fs.writeFileSync(path.join(SRC, "lib", "page-metadata.ts"), libBackup.pageMetadata);

fs.copyFileSync(path.join(HUB, "src", "styles.css"), path.join(SRC, "styles.css"));

console.log("Transforming...");
walkTransform(SRC);

console.log("Generating routes...");
processRoutes();
console.log("Migration complete.");
