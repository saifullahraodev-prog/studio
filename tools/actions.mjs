// Action sheet: one short clip per core action, tiled 4x4 -> out/phase4/actions.mp4 + actions.png
// Usage: node tools/actions.mjs [--rebundle]
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "out", "phase4", "actions");
mkdirSync(out, { recursive: true });
const rm = (...a) => spawnSync(process.execPath, ["tools/run.mjs", ...a], { cwd: root, encoding: "utf8" });
const bundle = ".cache/bundle";
if (process.argv.includes("--rebundle") || !existsSync(path.join(root, bundle, "index.html"))) rm("bundle", "src/index.ts", `--out-dir=${bundle}`, "--log=error");
const ACTIONS = ["walk", "run", "talk", "point", "panic", "fall", "carry", "climb", "cheer", "shiver", "sew", "rattle", "pushbar", "wave", "facepalm", "cower"];
const cast = ["worker", "firefighter", "inspector", "owner"];
mkdirSync(path.join(root, ".cache", "tmp"), { recursive: true });
const files = [];
ACTIONS.forEach((a, i) => {
  const pf = `.cache/tmp/action-${a}.json`;
  writeFileSync(path.join(root, pf), JSON.stringify({ action: a, character: cast[i % cast.length] }));
  const f = path.join(out, `${a}.mp4`);
  const r = rm("render", bundle, "ActionPose", f, `--props=${pf}`, "--log=error", "--concurrency=2");
  console.log(`${r.status === 0 ? "ok  " : "FAIL"} ${a}`);
  if (r.status !== 0) console.log(r.stdout.slice(-500) + r.stderr.slice(-500));
  files.push(f);
});
const inputs = files.flatMap((f) => ["-i", f]);
const layout = files.map((_, i) => `${(i % 4) * 400}_${Math.floor(i / 4) * 480}`).join("|");
spawnSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", `xstack=inputs=${files.length}:layout=${layout}`, "-an", "-c:v", "libx264", "-crf", "22", "-pix_fmt", "yuv420p", path.join(root, "out", "phase4", "actions.mp4")], { stdio: "inherit" });
spawnSync("ffmpeg", ["-v", "error", "-y", "-ss", "0.9", "-i", path.join(root, "out", "phase4", "actions.mp4"), "-frames:v", "1", path.join(root, "out", "phase4", "actions.png")], { stdio: "inherit" });
console.log("out/phase4/actions.mp4 + actions.png");
