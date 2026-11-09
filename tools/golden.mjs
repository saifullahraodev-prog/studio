// Golden-frame checks: every engine change is compared against approved stills.
//   node tools/golden.mjs check     -> re-render all, compare with golden/*.png (SSIM), report
//   node tools/golden.mjs approve   -> (owner-approved only) overwrite golden/*.png with fresh renders
// Report + side-by-side diffs for failures: out/golden-report/
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mode = process.argv[2];
if (!["check", "approve"].includes(mode)) {
  console.log("Usage: node tools/golden.mjs check|approve [id-filter]");
  process.exit(1);
}
const filter = process.argv[3];
const manifest = JSON.parse(readFileSync(path.join(root, "golden", "manifest.json"), "utf8"));
const bundle = ".cache/bundle";
const outDir = mode === "approve" ? path.join(root, "golden") : path.join(root, ".cache", "golden-check");
const reportDir = path.join(root, "out", "golden-report");
mkdirSync(outDir, { recursive: true });
mkdirSync(path.join(root, ".cache", "tmp"), { recursive: true });

const rm = (...args) => spawnSync(process.execPath, ["tools/run.mjs", ...args], { cwd: root, encoding: "utf8" });
const b = rm("bundle", "src/index.ts", `--out-dir=${bundle}`, "--log=error");
if (b.status !== 0) {
  console.log(b.stdout + b.stderr);
  process.exit(1);
}

const ssim = (a, c) => {
  const r = spawnSync("ffmpeg", ["-v", "info", "-i", a, "-i", c, "-lavfi", "ssim", "-f", "null", "-"], { encoding: "utf8" });
  const m = /All:([0-9.]+)/.exec(r.stderr);
  return m ? Number(m[1]) : 0;
};

const rows = [];
let failed = 0;
if (mode === "check") {
  rmSync(reportDir, { recursive: true, force: true });
  mkdirSync(reportDir, { recursive: true });
}
for (const f of manifest.frames) {
  if (filter && !f.id.includes(filter)) continue;
  const pf = `.cache/tmp/golden-${f.id}.json`;
  writeFileSync(path.join(root, pf), JSON.stringify(f.props));
  const out = path.join(outDir, `${f.id}.png`);
  const t = Date.now();
  const r = rm("still", bundle, f.comp, out, `--props=${pf}`, `--frame=${f.frame}`, "--image-format=png", "--log=error");
  const secs = ((Date.now() - t) / 1000).toFixed(1);
  if (r.status !== 0) {
    failed++;
    rows.push(`FAIL  ${f.id}  (render error)`);
    console.log(r.stdout + r.stderr);
    continue;
  }
  if (mode === "approve") {
    rows.push(`saved ${f.id}  ${secs}s`);
    continue;
  }
  const gold = path.join(root, "golden", `${f.id}.png`);
  if (!existsSync(gold)) {
    failed++;
    rows.push(`MISS  ${f.id}  (no golden frame yet)`);
    continue;
  }
  const s = ssim(gold, out);
  const ok = s >= manifest.threshold;
  if (!ok) {
    failed++;
    // golden | new | difference (brightened)
    spawnSync("ffmpeg", [
      "-v", "error", "-y", "-i", gold, "-i", out, "-filter_complex",
      "[0]split[g1][g2];[1]split[n1][n2];[g2][n2]blend=all_mode=difference,eq=brightness=0.1:contrast=4[d];[g1][n1][d]hstack=3,scale=1800:-1",
      path.join(reportDir, `${f.id}.png`),
    ]);
  }
  rows.push(`${ok ? "ok  " : "DIFF"}  ${f.id.padEnd(26)} SSIM ${s.toFixed(4)}  ${secs}s`);
}
const report = [`Golden-frame ${mode} (${new Date().toISOString()}), threshold ${manifest.threshold}`, ...rows, failed ? `${failed} problem(s): see out/golden-report/` : "All good."].join("\n");
console.log(report);
if (mode === "check") writeFileSync(path.join(reportDir, "report.txt"), report);
// face cleanliness: no stripe pattern on any character's face in any lighting preset
let faceFail = 0;
if (mode === "check") {
  const fc = spawnSync("python", ["-I", "tools/facecheck.py"], { cwd: root, encoding: "utf8" });
  console.log(fc.stdout.trim());
  faceFail = fc.status === 0 ? 0 : 1;
}
process.exit(failed || faceFail ? 1 : 0);
