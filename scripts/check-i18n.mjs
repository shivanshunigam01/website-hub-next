/**
 * Verifies i18n coverage: every t() key used in src resolves in the catalog,
 * all locales share the same key set, and no locale silently falls back to English.
 * Run: node scripts/check-i18n.mjs
 */
import fs from "node:fs";
import path from "node:path";

const LOCALES = ["en", "zh", "fr", "de", "es", "it", "hi", "ar"];
const localeDir = "public/locales";

const catalogs = Object.fromEntries(
  LOCALES.map((l) => [l, JSON.parse(fs.readFileSync(`${localeDir}/${l}/common.json`, "utf8"))]),
);
const en = catalogs.en;

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(tsx|ts)$/.test(entry.name)) files.push(p);
  }
})("src");

const literalKeys = new Set();
for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  for (const m of src.matchAll(/\bt\(\s*"([^"]+)"/g)) literalKeys.add(m[1]);
  for (const m of src.matchAll(/\bt\(\s*'([^']+)'/g)) literalKeys.add(m[1]);
}

// Keys built from template literals at render time (index-mapped over mock data).
const indexMapped = [
  ...Array.from({ length: 8 }, (_, i) => `comparison.f${i + 1}`),
  ...Array.from({ length: 8 }, (_, i) => `faq.${i + 1}.q`),
  ...Array.from({ length: 8 }, (_, i) => `faq.${i + 1}.a`),
  ...Array.from({ length: 3 }, (_, i) => `how.step${i + 1}.title`),
  ...Array.from({ length: 3 }, (_, i) => `how.step${i + 1}.desc`),
  ...Array.from({ length: 5 }, (_, i) => `timeline.${i + 1}.title`),
  ...Array.from({ length: 5 }, (_, i) => `timeline.${i + 1}.desc`),
  ...["v1", "v2", "v3"].flatMap((v) => [`about.${v}.title`, `about.${v}.desc`]),
  ...["free", "pro", "premium"].flatMap((p) => [
    `pricing.plan.${p}.name`,
    `pricing.plan.${p}.period`,
    `pricing.plan.${p}.cta`,
  ]),
  ...Array.from({ length: 4 }, (_, i) => `pricing.plan.free.feature.${i + 1}`),
  ...Array.from({ length: 5 }, (_, i) => `pricing.plan.pro.feature.${i + 1}`),
  ...Array.from({ length: 5 }, (_, i) => `pricing.plan.premium.feature.${i + 1}`),
  ...[
    "onlineTutors",
    "homeTutors",
    "teachingJobs",
    "assignmentJobs",
    "onlineTeaching",
    "homeTeaching",
    "assignmentHelp",
  ].flatMap((ns) =>
    Array.from({ length: 6 }, (_, i) => [`${ns}.f${i + 1}.title`, `${ns}.f${i + 1}.desc`]).flat(),
  ),
];

// Values that are correctly identical across languages (brands, product names, cognates).
const invariant = new Set([
  "footer.brand",
  "footer.ariaFacebook",
  "footer.ariaTwitter",
  "footer.ariaInstagram",
  "footer.ariaLinkedIn",
  "comparison.us",
  "levelUp.badgeOrg",
  "contact.whatsapp",
  "contact.locations",
  "register.google",
  "register.whatsapp",
  "register.namePlaceholder",
  "login.emailPlaceholder",
  "footer.emailPlaceholder",
  "search.chipMinRating",
  "accommodation.typePG",
  "pricing.plan.premium.name",
]);

let failed = false;

const counts = LOCALES.map((l) => `${l}=${Object.keys(catalogs[l]).length}`).join(" ");
console.log(`Locale key counts: ${counts}`);
if (new Set(LOCALES.map((l) => Object.keys(catalogs[l]).length)).size !== 1) {
  console.log("  FAIL: locales have differing key counts");
  failed = true;
}

const missingLiteral = [...literalKeys].filter((k) => !(k in en)).sort();
console.log(`\nt() literal keys used: ${literalKeys.size} — missing from catalog: ${missingLiteral.length}`);
for (const k of missingLiteral) console.log(`  MISSING  ${k}`);
if (missingLiteral.length) failed = true;

const missingMapped = indexMapped.filter((k) => !(k in en));
console.log(`Index-mapped keys checked: ${indexMapped.length} — missing: ${missingMapped.length}`);
for (const k of missingMapped) console.log(`  MISSING  ${k}`);
if (missingMapped.length) failed = true;

console.log("\nValues still identical to English (excluding invariants):");
for (const l of LOCALES.filter((x) => x !== "en")) {
  const same = Object.keys(en).filter(
    (k) => !invariant.has(k) && catalogs[l][k] === en[k] && /[a-zA-Z]{4,}/.test(String(en[k])),
  );
  console.log(`  ${l}: ${same.length}`);
}

// A dropped or malformed {{placeholder}} renders as literal text to the user.
const placeholders = (s) =>
  [...String(s).matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort().join(",");

let placeholderIssues = 0;
for (const l of LOCALES.filter((x) => x !== "en")) {
  for (const k of Object.keys(en)) {
    const expectedP = placeholders(en[k]);
    const actualP = placeholders(catalogs[l][k] ?? "");
    if (expectedP !== actualP) {
      console.log(`  PLACEHOLDER  ${l} ${k}: en=[${expectedP}] ${l}=[${actualP}]`);
      placeholderIssues++;
    }
  }
}
console.log(`\nPlaceholder mismatches: ${placeholderIssues}`);
if (placeholderIssues) failed = true;

console.log(failed ? "\nFAILED" : "\nOK");
if (failed) process.exitCode = 1;
