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
const v2 = data.beats.some((b) => b.cuts && b.cuts.length);
const comp = v2 ? "ShortV2" : "Short";
const items = v2
  ? data.beats.flatMap((b) => b.cuts.map((c, i) => ({ id: `${b.id}-${i}`, shot: c.shot, t: Math.min(c.end - 0.05, c.start + Math.max(0.2, (c.end - c.start) * 0.55)) })))
  : data.beats.map((b) => ({ id: b.id, shot: b.shot, t: Math.min(b.end - 0.1, Math.max(b.cueAt + 0.45, (b.start + b.end) / 2)) }));
for (const it of items) {
  const frame = Math.round(it.t * data.fps);
  const file = path.join(out, `${it.id}.png`);
  const r = rm("still", bundle, comp, file, `--props=${pf}`, `--frame=${frame}`, "--log=error");
  console.log(`${r.status === 0 ? "ok  " : "FAIL"} ${it.id} ${it.shot} @${it.t.toFixed(2)}s`);
  if (r.status !== 0) console.log(r.stdout.slice(-800) + r.stderr.slice(-800));
  else files.push(file);
}
const inputs = files.flatMap((f) => ["-i", f]);
const cols = v2 ? 7 : 5;
const w = v2 ? 220 : 300;
const filt = files.map((_, i) => `[${i}]scale=${w}:-2[s${i}]`).join(";") + ";" + files.map((_, i) => `[s${i}]`).join("") + `xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * Math.round((w * 16) / 9)}`).join("|")}:fill=black`;
spawnSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", filt, path.join(root, "out", slug, "storyboard.png")], { stdio: "inherit" });
console.log(path.join("out", slug, "storyboard.png"));
