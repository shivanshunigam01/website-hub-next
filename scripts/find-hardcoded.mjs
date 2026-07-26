/**
 * Heuristic scan for user-visible English text still hardcoded in public JSX.
 * Reports JSX text nodes and common string props that are not wrapped in t().
 */
import fs from "node:fs";
import path from "node:path";

const targets = ["src/views", "src/components/home", "src/components/layout", "src/components/tutors", "src/components/seo", "src/components/courses", "src/components/landing"];

const skip = /\b(admin|dashboard|Shell)\b/i;
const excludeViews = /(admin|student|teacher|parent|messages|lms|profile|offline|marketing|payments)\.tsx$/;

const files = [];
for (const dir of targets) {
  if (!fs.existsSync(dir)) continue;
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".tsx") && !excludeViews.test(e.name) && !skip.test(p)) files.push(p);
    }
  })(dir);
}

// Words that indicate real prose rather than identifiers/classnames.
const looksEnglish = (s) => {
  const trimmed = s.trim();
  if (trimmed.length < 4) return false;
  if (!/[A-Za-z]/.test(trimmed)) return false;
  if (/^[a-z-]+$/.test(trimmed)) return false; // css-ish
  if (/^\d/.test(trimmed)) return false;
  return /\b(the|your|and|with|for|you|are|our|from|this|that|all|not|new|get|find|start|browse|post|view|search|no|every|more|first)\b/i.test(trimmed) ||
    /^[A-Z][a-z]+(\s+[a-z]+){1,}/.test(trimmed);
};

const findings = [];

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    if (/\bt\(/.test(line)) return;
    if (/^\s*(\/\/|\/\*|\*)/.test(line)) return;
    if (/className|import |from "|href=|src=|key=|\.map\(|console\.|aria-hidden/.test(line)) {
      // still check aria-label / placeholder / title props on these lines
    }

    // JSX text node: >Some English text<
    for (const m of line.matchAll(/>\s*([A-Za-z][^<>{}\n]{3,})\s*</g)) {
      if (looksEnglish(m[1])) findings.push({ file, line: i + 1, text: m[1].trim(), kind: "jsx-text" });
    }
    // string props that render to users
    for (const m of line.matchAll(/(placeholder|aria-label|title|alt|label)=\{?"([^"]{4,})"/g)) {
      if (looksEnglish(m[2])) findings.push({ file, line: i + 1, text: `${m[1]}="${m[2]}"`, kind: "prop" });
    }
  });
}

const byFile = new Map();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}

console.log(`Scanned ${files.length} public files. Potential hardcoded strings: ${findings.length}\n`);
for (const [file, items] of [...byFile.entries()].sort()) {
  console.log(file.replace(/\\/g, "/"));
  for (const it of items) console.log(`   L${it.line} [${it.kind}] ${it.text}`);
}
