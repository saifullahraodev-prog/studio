// Render one still with simple key=value props (avoids Windows JSON quoting).
// Usage: node tools/still.mjs <Composition> <out.png> [key=value ...] [--frame=N] [--rebundle]
// Re-uses .cache/bundle unless --rebundle is given or it is missing.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [comp, out, ...rest] = process.argv.slice(2);
if (!comp || !out) {
  console.log("Usage: node tools/still.mjs <Composition> <out.png> [key=value ...] [--frame=N] [--rebundle]");
  process.exit(1);
}
const props = {};
const flags = [];
let rebundle = false;
for (const a of rest) {
  if (a === "--rebundle") rebundle = true;
  else if (a.startsWith("--")) flags.push(a);
  else {
    const i = a.indexOf("=");
    const k = a.slice(0, i);
    const v = a.slice(i + 1);
    props[k] = v === "true" ? true : v === "false" ? false : v !== "" && !isNaN(Number(v)) ? Number(v) : v;
  }
}
const bundle = ".cache/bundle";
const rm = (...args) => spawnSync(process.execPath, ["tools/run.mjs", ...args], { cwd: root, stdio: "inherit" }).status;
if (rebundle || !existsSync(path.join(root, bundle, "index.html"))) {
  if (rm("bundle", "src/index.ts", `--out-dir=${bundle}`, "--log=error") !== 0) process.exit(1);
}
mkdirSync(path.join(root, ".cache", "tmp"), { recursive: true });
const pf = `.cache/tmp/props-${Date.now()}.json`;
writeFileSync(path.join(root, pf), JSON.stringify(props));
const t = Date.now();
const st = rm("still", bundle, comp, out, `--props=${pf}`, "--log=error", ...flags);
console.log(`${st === 0 ? "ok" : "FAIL"} ${out} (${((Date.now() - t) / 1000).toFixed(1)}s)`);
process.exit(st ?? 1);
