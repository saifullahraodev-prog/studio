// How We Ended Up storyboard: stills from the HowVideo composition, tiled into contact sheets (no video render).
// Usage: node tools/howwe_storyboard.mjs <scenes.json|built.json> <outDir> [--rebundle] [--slug=<slug>]   (--slug renders HowVideoBuilt)
//   scenes.json = { scenes: [...] } (same format as engine/howwe/demo-scenes.json)
// Output: <outDir>/scenes.png (each scene at 15% / 50% / 90%), <outDir>/transitions.png (middle of each transition).
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [scenesFile, outDir, ...rest] = process.argv.slice(2);
if (!scenesFile || !outDir) { console.log("Usage: node tools/howwe_storyboard.mjs <scenes.json> <outDir> [--rebundle]"); process.exit(1); }
const { scenes } = JSON.parse(readFileSync(path.resolve(root, scenesFile), "utf8"));
const T = { dolly: 22, door: 20, cut: 0 }; // must match TIMING in engine/howwe/motion.tsx
const starts = []; let t = 0;
scenes.forEach((s, i) => { if (i > 0) t -= T[s.in ?? "cut"] ?? 0; starts.push(t); t += s.dur; });

const tmp = path.join(root, outDir, "_frames");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
const slugArg = rest.find((a) => a.startsWith("--slug="));
const still = (frame, name, rebundle) => {
  const args = ["tools/still.mjs", slugArg ? "HowVideoBuilt" : "HowVideo", path.join(outDir, "_frames", name), `--frame=${frame}`];
  if (slugArg) args.push(`slug=${slugArg.slice(7)}`);
  if (rebundle) args.push("--rebundle");
  const r = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
  process.stdout.write(`${name} @${frame}: ${(r.stdout || "").trim().split("\n").pop()}\n`);
};
let first = rest.includes("--rebundle");
let n = 0;
scenes.forEach((s, i) => [0.3, 0.6, 0.9].forEach((q) => {
  // skip the overlapped transition part at the very start of a scene
  const fr = starts[i] + Math.round(s.dur * q);
  still(fr, `s-${String(n++).padStart(3, "0")}.png`, first); first = false;
}));
let m = 0;
scenes.forEach((s, i) => { if (i > 0 && (T[s.in] ?? 0) > 0) still(starts[i] + Math.round(T[s.in] / 2), `t-${String(m++).padStart(3, "0")}.png`, false); });

const tile = (pattern, cols, rows, out) => {
  const r = spawnSync("ffmpeg", ["-y", "-v", "error", "-i", path.join(tmp, pattern), "-vf", `scale=480:-1,pad=iw+8:ih+8:4:4:color=0xECECEC,tile=${cols}x${rows}`, "-frames:v", "1", path.join(root, outDir, out)], { encoding: "utf8" });
  console.log(r.status === 0 ? `ok ${outDir}/${out}` : r.stderr);
};
tile("s-%03d.png", 6, Math.ceil(n / 6), "scenes.png");
if (m) tile("t-%03d.png", Math.min(4, m), Math.ceil(m / 4), "transitions.png");
