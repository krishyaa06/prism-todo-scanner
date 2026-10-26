"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { walk, isBinary } = require("./walk");

const TAGS = ["TODO", "FIXME", "BUG", "HACK", "XXX", "OPTIMIZE", "REVIEW", "NOTE"];
const SEVERITY = { BUG: 3, FIXME: 3, XXX: 2, HACK: 2, TODO: 1, OPTIMIZE: 1, REVIEW: 1, NOTE: 0 };
// comment starters: // # /* * <!-- -- ; %  REM
const COMMENT = String.raw`(?:\/\/+|#+|\/\*+|^\s*\*|<!--|--|;+|%|\bREM\b)`;
function makeRe(tags) {
  return new RegExp(String.raw`${COMMENT}\s*@?(${tags.join("|")})\b(?:\s*\(([^)]*)\))?(?:\s*\[([^\]]*)\])?\s*[:\-–]?\s*(.*)`, "i");
}
function parseLine(line, re = makeRe(TAGS)) {
  const m = re.exec(line); if (!m) return null;
  if (m[1] !== m[1].toUpperCase() && !/[:(]/.test(line.slice(m.index + m[0].indexOf(m[1]) + m[1].length, m.index + m[0].indexOf(m[1]) + m[1].length + 2))) return null; // lowercase "todo" only with ':' or '('
  let text = m[4].replace(/\s*(\*\/|-->)\s*$/, "").trim();
  const issue = /(?:#|GH-)(\d+)\b/.exec(text + " " + (m[3] || ""));
  return { tag: m[1].toUpperCase(), author: (m[2] || "").trim() || null, text, issue: issue ? +issue[1] : null };
}
function scan(root, { tags = TAGS, include, maxKb = 512 } = {}) {
  const re = makeRe(tags), items = [];
  for (const rel of walk(root)) {
    if (include && !include.some((g) => rel.includes(g))) continue;
    if (/(^|\/)(CHANGELOG|LICENSE)/i.test(rel) || /\.(lock|min\.js|map|svg|png|jpe?g|gif|ico|woff2?|pdf)$/.test(rel)) continue;
    const abs = path.join(root, rel), buf = fs.readFileSync(abs);
    if (buf.length > maxKb * 1024 || isBinary(buf)) continue;
    buf.toString("utf8").split("\n").forEach((line, i) => { const t = parseLine(line, re); if (t) items.push({ file: rel, line: i + 1, ...t }); });
  }
  return items;
}
/** Adds {date, by} using git blame (porcelain) per file. */
function blame(root, items) {
  const byFile = {};
  for (const it of items) (byFile[it.file] ??= []).push(it);
  for (const [file, list] of Object.entries(byFile)) {
    let out; try { out = execFileSync("git", ["blame", "--line-porcelain", "--", file], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 << 20 }); } catch { continue; }
    const meta = {}; let cur = null, ln = 0;
    for (const l of out.split("\n")) {
      const h = /^[0-9a-f]{40} \d+ (\d+)/.exec(l);
      if (h) { ln = +h[1]; cur = meta[ln] = {}; continue; }
      if (!cur) continue;
      if (l.startsWith("author ")) cur.by = l.slice(7);
      else if (l.startsWith("author-time ")) cur.date = new Date(+l.slice(12) * 1000);
    }
    for (const it of list) if (meta[it.line] && meta[it.line].by !== "Not Committed Yet") Object.assign(it, meta[it.line]);
  }
  return items;
}
function ago(d, now = Date.now()) {
  if (!d) return "uncommitted"; const s = (now - d) / 1000;
  for (const [n, u] of [[31536000, "y"], [2592000, "mo"], [604800, "w"], [86400, "d"], [3600, "h"]]) if (s >= n) return `${Math.floor(s / n)}${u} ago`;
  return "just now";
}
function summary(items) { const s = {}; for (const t of items) s[t.tag] = (s[t.tag] || 0) + 1; return s; }
function toMarkdown(items, { title = "TODO report", repoUrl } = {}) {
  const s = summary(items);
  let md = `# ${title}\n\n${Object.entries(s).sort((a, b) => SEVERITY[b[0]] - SEVERITY[a[0]]).map(([k, v]) => `**${v}** ${k}`).join(" · ") || "Nothing to do."}\n`;
  const groups = {}; for (const t of items) (groups[t.tag] ??= []).push(t);
  for (const tag of Object.keys(groups).sort((a, b) => SEVERITY[b] - SEVERITY[a])) {
    md += `\n## ${tag} (${groups[tag].length})\n\n`;
    for (const t of groups[tag]) {
      const loc = `${t.file}:${t.line}`;
      const link = repoUrl ? `[\`${loc}\`](${repoUrl.replace(/\/$/, "")}/blob/HEAD/${t.file}#L${t.line})` : `\`${loc}\``;
      md += `- [ ] ${t.text || "(no description)"} — ${link}${t.author ? ` @${t.author}` : ""}${t.issue ? ` #${t.issue}` : ""}\n`;
    }
  }
  return md;
}
module.exports = { TAGS, SEVERITY, parseLine, scan, blame, ago, summary, toMarkdown };
