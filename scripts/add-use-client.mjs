import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src");

function addUseClient(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      addUseClient(full);
      continue;
    }
    if (!/\.tsx$/.test(entry.name)) continue;
    let out = fs.readFileSync(full, "utf8");
    if (out.includes('"use client"') || out.includes("'use client'")) continue;
    fs.writeFileSync(full, `"use client";\n\n${out}`);
  }
}

addUseClient(path.join(ROOT, "hooks"));
addUseClient(path.join(ROOT, "components"));
addUseClient(path.join(ROOT, "views"));
console.log("Added use client to hooks, components, views");
