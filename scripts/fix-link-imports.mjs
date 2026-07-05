import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src");

function fixFile(full) {
  let out = fs.readFileSync(full, "utf8");
  if (!out.includes("<Link") && !out.includes("<Link ")) return;
  if (/import \{[^}]*\bLink\b/.test(out) || /import Link from/.test(out)) return;

  if (out.startsWith('"use client"')) {
    out = out.replace(
      '"use client";\n\n',
      '"use client";\n\nimport { Link } from "@/lib/navigation";\n',
    );
  } else {
    out = `"use client";\n\nimport { Link } from "@/lib/navigation";\n${out}`;
  }
  fs.writeFileSync(full, out);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".tsx")) fixFile(full);
  }
}

walk(path.join(ROOT, "views"));
walk(path.join(ROOT, "components"));
console.log("Added missing Link imports");
