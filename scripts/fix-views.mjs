import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const VIEWS = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "views");

for (const file of fs.readdirSync(VIEWS)) {
  if (!file.endsWith(".tsx")) continue;
  const full = path.join(VIEWS, file);
  let out = fs.readFileSync(full, "utf8");

  out = out.replace(/export const Route = createFileRoute\([\s\S]*?\n\}\);\n\n?/gm, "");
  out = out.replace(/export const Route = createFileRoute\([\s\S]*?\n\}\)\);\n\n?/gm, "");
  out = out.replace(/export const Route = createFileRoute\([^)]+\)\(\{[\s\S]*?\}\);\n\n?/gm, "");

  out = out.replace(/Route\.useParams\(\)/g, "useParams()");
  out = out.replace(/Route\.useSearch\(\)/g, "useSearch()");

  if (/useParams\(\)/.test(out) && !/import \{[^}]*useParams/.test(out)) {
    if (/from "@\/lib\/navigation"/.test(out)) {
      out = out.replace(
        /import \{([^}]+)\} from "@\/lib\/navigation";/,
        (m, imports) => {
          const set = new Set(
            imports.split(",").map((s) => s.trim()).filter(Boolean),
          );
          set.add("useParams");
          if (/useSearch\(\)/.test(out)) set.add("useSearch");
          return `import { ${[...set].join(", ")} } from "@/lib/navigation";`;
        },
      );
    } else {
      const extra = /useSearch\(\)/.test(out) ? "useParams, useSearch" : "useParams";
      out = `"use client";\n\nimport { ${extra} } from "@/lib/navigation";\n${out.replace(/^"use client";\n\n?/, "")}`;
    }
  }

  if (/useSearch\(\)/.test(out) && !/import \{[^}]*useSearch/.test(out)) {
    if (/from "@\/lib\/navigation"/.test(out)) {
      out = out.replace(
        /import \{([^}]+)\} from "@\/lib\/navigation";/,
        (m, imports) => {
          const set = new Set(
            imports.split(",").map((s) => s.trim()).filter(Boolean),
          );
          set.add("useSearch");
          return `import { ${[...set].join(", ")} } from "@/lib/navigation";`;
        },
      );
    }
  }

  out = out.replace(/^import \{ createFileRoute[^}]+\} from "@\/lib\/navigation";\n/gm, "");
  out = out.replace(/, createFileRoute/g, "");
  out = out.replace(/createFileRoute, /g, "");

  if (!/export default/.test(out)) {
    const fns = [...out.matchAll(/^function ([A-Z][A-Za-z0-9]+)/gm)];
    if (fns.length) {
      const name = fns[fns.length - 1][1];
      out += `\nexport default ${name};\n`;
    }
  }

  fs.writeFileSync(full, out);
}

console.log("Fixed views");
