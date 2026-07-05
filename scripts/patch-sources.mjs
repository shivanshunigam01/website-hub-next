import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src");

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(tsx?|jsx?)$/.test(entry.name)) continue;
    let out = fs.readFileSync(full, "utf8");
    const orig = out;

    out = out.replace(/export const Route = createFileRoute\([\s\S]*?\n\}\);\n\n?/gm, "");
    out = out.replace(/export const Route = createFileRoute\([^)]+\)\(\{[\s\S]*?\}\);\n\n?/gm, "");
    out = out.replace(/import \{ createFileRoute(?:, [^}]+)? \} from "@\/lib\/navigation";\n/gm, "");
    out = out.replace(/, createFileRoute/g, "");
    out = out.replace(/createFileRoute, /g, "");

    out = out.replace(/Route\.useParams\(\)/g, "useParams()");
    out = out.replace(/Route\.useSearch\(\)/g, "useSearch()");
    out = out.replace(/useNavigate\(\{ from: Route\.fullPath \}\)/g, "useNavigate()");

    out = out.replace(/import\.meta\.env\.PROD/g, "process.env.NODE_ENV === 'production'");
    out = out.replace(/import\.meta\.env\.DEV/g, "process.env.NODE_ENV === 'development'");
    out = out.replace(/import\.meta\.env\.VITE_([A-Z0-9_]+)/g, "process.env.NEXT_PUBLIC_$1");

    if (orig !== out) fs.writeFileSync(full, out);
  }
}

walk(ROOT);
console.log("Patched sources");
