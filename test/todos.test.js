const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { parseLine, scan, toMarkdown, ago } = require("../src");
const demo = path.join(__dirname, "../examples/demo-app");
const bin = path.join(__dirname, "../bin/todos.js");

test("parseLine formats", () => {
  assert.deepEqual(parseLine("  // TODO(soumya): rate-limit #12"), { tag: "TODO", author: "soumya", text: "rate-limit #12", issue: 12 });
  assert.equal(parseLine("# FIXME broken").tag, "FIXME");
  assert.equal(parseLine("/* HACK: x */").text, "x");
  assert.equal(parseLine("<!-- NOTE: y -->").text, "y");
  assert.equal(parseLine("x = 1 // todo: lower").tag, "TODO");
  assert.equal(parseLine("const todoList = []"), null);
  assert.equal(parseLine("// this is a todo list"), null);
  assert.equal(parseLine("-- TODO sql").tag, "TODO");
});
test("scan demo", () => {
  const r = scan(demo);
  assert.equal(r.length, 9);
  assert.deepEqual([...new Set(r.map((t) => t.file))].sort(), ["README.md", "api/main.py", "src/auth.ts", "src/cart.js"]);
  assert.equal(scan(demo, { tags: ["FIXME", "BUG"] }).length, 2);
});
test("markdown", () => {
  const md = toMarkdown(scan(demo), { repoUrl: "https://github.com/a/b" });
  assert.match(md, /## BUG \(1\)/); assert.match(md, /\[`src\/auth.ts:4`\]\(https:\/\/github.com\/a\/b\/blob\/HEAD\/src\/auth.ts#L4\)/);
});
test("ago", () => { assert.equal(ago(new Date(Date.now() - 3 * 86400e3)), "3d ago"); assert.equal(ago(null), "uncommitted"); });
test("cli fail-on + json", () => {
  assert.equal(spawnSync("node", [bin, demo]).status, 0);
  assert.equal(spawnSync("node", [bin, demo, "--fail-on", "BUG"]).status, 1);
  assert.equal(JSON.parse(spawnSync("node", [bin, demo, "--json"], { encoding: "utf8" }).stdout).length, 9);
  assert.equal(spawnSync("node", [bin, "--sort", "x"]).status, 2);
});
