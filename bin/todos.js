#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { parseArgs } = require("node:util");
const { TAGS, SEVERITY, scan, blame, ago, summary, toMarkdown } = require("../src");
const { c, header, plural, bar } = require("../src/ui");
const pkg = require("../package.json");

const HELP = `${header("todos", "every TODO in your repo, in one place")}

${c.bold("Usage")}
  todos [dir] [options]

${c.bold("Options")}
  -t, --tags <list>     tags to find (default: ${TAGS.join(",")})
  -b, --blame           add author + age from git blame
  -s, --sort <by>       file | tag | age        (default: file)
      --md              Markdown checklist — paste into an issue
  -o, --out <file>      write --md output to a file
      --json            JSON output
      --repo <url>      link files in --md to a GitHub repo
      --fail-on <list>  exit 1 if any of these tags exist (CI), e.g. FIXME,BUG
      --max <n>         fail if more than n items in total
  -v, --version / -h, --help

Recognises ${c.cyan("// TODO: x")}  ${c.cyan("# FIXME(soumya): x")}  ${c.cyan("/* HACK #42 x */")}  ${c.cyan("<!-- TODO x -->")}`;

let a;
try { a = parseArgs({ allowPositionals: true, options: { tags: { type: "string", short: "t" }, blame: { type: "boolean", short: "b" }, sort: { type: "string", short: "s", default: "file" }, md: { type: "boolean" }, out: { type: "string", short: "o" }, json: { type: "boolean" }, repo: { type: "string" }, "fail-on": { type: "string" }, max: { type: "string" }, version: { type: "boolean", short: "v" }, help: { type: "boolean", short: "h" } } }); }
catch (e) { console.error(c.red(`✖ ${e.message}`)); process.exit(2); }
const o = a.values;
if (o.help) { console.log(HELP); process.exit(0); }
if (o.version) { console.log(pkg.version); process.exit(0); }
const root = path.resolve(a.positionals[0] || ".");
if (!fs.existsSync(root)) { console.error(c.red(`✖ No such directory: ${root}`)); process.exit(2); }
if (!["file", "tag", "age"].includes(o.sort)) { console.error(c.red("✖ --sort must be file, tag or age")); process.exit(2); }
const tags = o.tags ? o.tags.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean) : TAGS;

let items = scan(root, { tags });
if (o.blame || o.sort === "age") blame(root, items);
if (o.sort === "tag") items.sort((x, y) => SEVERITY[y.tag] - SEVERITY[x.tag] || x.file.localeCompare(y.file));
if (o.sort === "age") items.sort((x, y) => (x.date || Infinity) - (y.date || Infinity));

const failTags = (o["fail-on"] || "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
const failing = items.filter((t) => failTags.includes(t.tag));
const tooMany = o.max != null && items.length > +o.max;
const code = failing.length || tooMany ? 1 : 0;

if (o.json) { console.log(JSON.stringify(items, null, 2)); process.exit(code); }
if (o.md) {
  const md = toMarkdown(items, { title: `TODO report — ${path.basename(root)}`, repoUrl: o.repo });
  if (o.out) { fs.writeFileSync(o.out, md); console.log(`${c.green("✔")} Wrote ${plural(items.length, "item")} to ${c.bold(o.out)}`); } else process.stdout.write(md);
  process.exit(code);
}

const COL = { BUG: c.red, FIXME: c.red, XXX: c.yellow, HACK: c.yellow, TODO: c.cyan, OPTIMIZE: c.accent2, REVIEW: c.accent2, NOTE: c.gray };
console.log(header("todos", path.basename(root)));
if (!items.length) { console.log(`\n${c.green("✔")} No ${tags.join("/")} found. Clean.`); process.exit(code); }
let last = null;
for (const t of items) {
  if (o.sort === "file" && t.file !== last) { console.log(`\n${c.under(c.bold(t.file))}`); last = t.file; }
  const where = o.sort === "file" ? c.dim(String(t.line).padStart(4)) : c.dim(`${t.file}:${t.line}`);
  const extra = [t.author && c.accent("@" + t.author), t.issue && !t.text.includes("#" + t.issue) && c.cyan("#" + t.issue), (o.blame || o.sort === "age") && c.gray(`${t.by || "you"} · ${ago(t.date)}`)].filter(Boolean).join(" ");
  const tagCol = (COL[t.tag] || c.cyan)(t.tag.padEnd(8));
  console.log(o.sort === "file" ? `  ${where}  ${tagCol} ${t.text || c.dim("(no description)")} ${extra}` : `  ${tagCol} ${t.text || c.dim("(no description)")} ${extra}\n        ${where}`);
}
const s = summary(items), max = Math.max(...Object.values(s));
console.log(`\n${c.bold("Summary")}`);
for (const [k, v] of Object.entries(s).sort((x, y) => SEVERITY[y[0]] - SEVERITY[x[0]] || y[1] - x[1])) console.log(`  ${(COL[k] || c.cyan)(k.padEnd(8))} ${bar(v / max, 20)} ${v}`);
console.log(`\n${plural(items.length, "item")} in ${plural(new Set(items.map((t) => t.file)).size, "file")}${failing.length ? c.red(` · ✖ ${failing.length} ${failTags.join("/")} (failing)`) : ""}${tooMany ? c.red(` · ✖ over --max ${o.max}`) : ""}`);
process.exit(code);
