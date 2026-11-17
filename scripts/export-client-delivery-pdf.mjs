import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const clientDir = join(root, "docs", "client");
const mdPath = join(clientDir, "CLIENT_DELIVERY_BUGS_RESOLUTIONS_SEO_AEO_GEO.md");
const cssPath = join(clientDir, "pdf-styles.css");
const outPath = join(clientDir, "TeacherPoint_Client_Delivery_Bugs_SEO_AEO_GEO.pdf");

/** Minimal markdown → HTML (tables, headings, bold, links, hr). */
function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let inTable = false;
  let tableRows = [];

  const flushTable = () => {
    if (!tableRows.length) return;
    const [header, sep, ...body] = tableRows;
    if (!sep?.includes("---")) {
      out.push(`<p>${tableRows.join("<br/>")}</p>`);
      tableRows = [];
      inTable = false;
      return;
    }
    const cells = (row) =>
      row
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
    out.push("<table><thead><tr>");
    for (const h of cells(header)) {
      out.push(`<th>${inline(h)}</th>`);
    }
    out.push("</tr></thead><tbody>");
    for (const row of body) {
      if (!row.trim()) continue;
      out.push("<tr>");
      for (const c of cells(row)) {
        out.push(`<td>${inline(c)}</td>`);
      }
      out.push("</tr>");
    }
    out.push("</tbody></table>");
    tableRows = [];
    inTable = false;
  };

  const inline = (s) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

  for (const line of lines) {
    if (line.startsWith("|")) {
      inTable = true;
      tableRows.push(line);
      continue;
    }
    if (inTable) flushTable();

    if (line.startsWith("# ")) {
      out.push(`<h1>${inline(line.slice(2))}</h1>`);
    } else if (line.startsWith("## ")) {
      out.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith("### ")) {
      out.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (line.trim() === "---") {
      out.push("<hr/>");
    } else if (line.trim() === "") {
      out.push("");
    } else if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
      out.push(`<p class="footer-note"><em>${inline(line.slice(1, -1))}</em></p>`);
    } else {
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  if (inTable) flushTable();
  return out.join("\n");
}

const md = readFileSync(mdPath, "utf8");
const css = readFileSync(cssPath, "utf8");
const body = mdToHtml(md);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>TeacherPoint — Client Delivery Summary</title>
  <style>${css}</style>
</head>
<body>
  <div class="cover-meta">
    <strong>TeacherPoint</strong> — Bugs, Resolutions &amp; SEO / AEO / GEO<br/>
    Document version 1.0 · October 23, 2026 · Confidential — client delivery
  </div>
  ${body}
</body>
</html>`;

const htmlPath = join(clientDir, "_export-temp.html");
writeFileSync(htmlPath, html, "utf8");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
await page.pdf({
  path: outPath,
  format: "A4",
  printBackground: true,
  margin: { top: "18mm", right: "16mm", bottom: "20mm", left: "16mm" },
});
await browser.close();

console.log("Wrote PDF:", outPath);
