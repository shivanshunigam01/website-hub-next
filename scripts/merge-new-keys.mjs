/**
 * Merges t("key", "English default") pairs found in src into en/common.json,
 * then seeds every other locale with the English value so key sets stay aligned.
 * Newly seeded keys are reported so they can be translated.
 */
import fs from "node:fs";
import path from "node:path";

const LOCALES = ["en", "zh", "fr", "de", "es", "it", "hi", "ar"];
const enPath = "public/locales/en/common.json";
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name)) files.push(p);
  }
})("src");

const discovered = new Map();
for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  for (const m of src.matchAll(/\bt\(\s*"((?:[^"\\]|\\.)+)"\s*,\s*"((?:[^"\\]|\\.)+)"/g)) {
    const key = m[1];
    const val = m[2].replace(/\\"/g, '"').replace(/\\n/g, "\n");
    if (!(key in en) && !discovered.has(key)) discovered.set(key, val);
  }
}

const added = [...discovered.keys()].sort();
for (const k of added) en[k] = discovered.get(k);
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + "\n", "utf8");
console.log(`Added ${added.length} keys to en/common.json (now ${Object.keys(en).length} keys)`);

for (const l of LOCALES.filter((x) => x !== "en")) {
  const p = `public/locales/${l}/common.json`;
  const c = JSON.parse(fs.readFileSync(p, "utf8"));
  const ordered = {};
  let seeded = 0;
  for (const k of Object.keys(en)) {
    if (k in c) ordered[k] = c[k];
    else {
      ordered[k] = en[k];
      seeded++;
    }
  }
  fs.writeFileSync(p, JSON.stringify(ordered, null, 2) + "\n", "utf8");
  console.log(`  ${l}: ${Object.keys(ordered).length} keys (${seeded} seeded from English, need translation)`);
}

fs.writeFileSync("scripts/pending-translation.json", JSON.stringify(added, null, 2) + "\n", "utf8");
console.log(`\nWrote ${added.length} pending keys to scripts/pending-translation.json`);
