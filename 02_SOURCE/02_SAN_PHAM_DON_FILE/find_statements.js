// find_statements.js
// Dung acorn (JS parser that) de lay CHINH XAC ranh gioi tung top-level statement
// trong khoi <script> chinh cua STAGING html. Ghi ra statements.json = [[start,end], ...]
// (offset tinh theo ky tu, tinh tu dau khoi JS, giong he cach Python se doc lai).
//
// Cach chay (trong thu muc 02_SOURCE/02_SAN_PHAM_DON_FILE/):
//   npm install acorn
//   node find_statements.js

const fs = require("fs");
const path = require("path");
const acorn = require("acorn");

const ROOT = __dirname;
const SRC = path.join(ROOT, "STAGING", "giao-dien-desktop-don-gian_v25_quan.html");
const OUT = path.join(ROOT, "statements.json");

const html = fs.readFileSync(SRC, "utf-8");

const styleStart = html.indexOf("<style>") + "<style>".length;
const styleEnd = html.indexOf("</style>", styleStart);
const jsTagIdx = html.indexOf("<script>", styleEnd);
const jsStart = jsTagIdx + "<script>".length;
const jsEnd = html.lastIndexOf("</script>");

const js = html.slice(jsStart, jsEnd);

let ast;
try {
  ast = acorn.parse(js, { ecmaVersion: 2022, sourceType: "script", allowReturnOutsideFunction: false });
} catch (e) {
  console.error("LOI PARSE JS:", e.message);
  console.error("Vi tri (offset trong js block):", e.pos, " -> dong xap xi:", js.slice(0, e.pos).split("\n").length);
  process.exit(1);
}

const stmts = ast.body.map((node) => [node.start, node.end]);
fs.writeFileSync(OUT, JSON.stringify({ jsStart, jsEnd, statements: stmts }, null, 0), "utf-8");

console.log(`Parse OK. So top-level statement (theo AST that): ${stmts.length}`);
console.log(`Da ghi: ${OUT}`);
