// Storyboard: one still per beat (just after the keyword pops), tiled into one image.
// Usage: node tools/storyboard.mjs <slug> [res=720] [--rebundle]
// Output: out/<slug>/storyboard.png (+ individual frames)
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.argv[2];
const res = Number(process.argv.find((a) => /^\d+$/.test(a)) ?? 720);
const data = JSON.parse(readFileSync(path.join(root, "public", "videos", slug, "scenes.json"), "utf8"));
const out = path.join(root, "out", slug, "storyboard");
mkdirSync(out, { recursive: true });
const bundle = ".cache/bundle";
const rm = (...a) => spawnSync(process.execPath, ["tools/run.mjs", ...a], { cwd: root, encoding: "utf8" });
if (process.argv.includes("--rebundle") || !existsSync(path.join(root, bundle, "index.html"))) {
  const b = rm("bundle", "src/index.ts", `--out-dir=${bundle}`, "--log=error");
  if (b.status !== 0) { console.log(b.stdout + b.stderr); process.exit(1); }
}
const pf = ".cache/tmp/storyboard-props.json";
writeFileSync(path.join(root, pf), JSON.stringify({ slug, res }));
const files = [];
for (const b of data.beats) {
  const t = Math.min(b.end - 0.1, Math.max(b.cueAt + 0.45, (b.start + b.end) / 2));
  const frame = Math.round(t * data.fps);
  const file = path.join(out, `${b.id}.png`);
  const r = rm("still", bundle, "Short", file, `--props=${pf}`, `--frame=${frame}`, "--log=error");
  console.log(`${r.status === 0 ? "ok  " : "FAIL"} ${b.id} ${b.shot} @${t.toFixed(2)}s`);
  if (r.status !== 0) console.log(r.stdout + r.stderr);
  else files.push(file);
}
const inputs = files.flatMap((f) => ["-i", f]);
const w = 300;
const filt = files.map((_, i) => `[${i}]scale=${w}:-2[s${i}]`).join(";") + ";" + files.map((_, i) => `[s${i}]`).join("") + `xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % 5) * w}_${Math.floor(i / 5) * Math.round((w * 16) / 9)}`).join("|")}:fill=black`;
spawnSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", filt, path.join(root, "out", slug, "storyboard.png")], { stdio: "inherit" });
console.log(path.join("out", slug, "storyboard.png"));
