// Phase 1 WebGL test. Bundles once, then for each Chrome GL backend:
//  - renders a GPU-info still (which chip does WebGL use?)
//  - renders the toon cube as a 1-frame still and a 90-frame 720p clip
// Per-frame time = (clip time - still time) / 89, so startup cost is excluded.
// Usage: node tools/gltest.mjs [mode ...]   Results -> out/gltest/results.json
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out", "gltest");
const bundle = ".cache/bundle";
mkdirSync(outDir, { recursive: true });
const argv = process.argv.slice(2);
const modes = argv.length ? argv : ["angle", "swangle", "swiftshader", "egl", "vulkan", "angle-egl"];

const run = (args) => {
  const t = Date.now();
  const r = spawnSync(`node tools/run.mjs ${args.join(" ")}`, { cwd: root, encoding: "utf8", shell: true, timeout: 900000 });
  return { ok: r.status === 0, ms: Date.now() - t, log: (r.stdout + r.stderr).slice(-1200) };
};

console.log("Bundling once...");
const b = run(["bundle", "src/index.ts", `--out-dir=${bundle}`]);
if (!b.ok) { console.log(b.log); process.exit(1); }

const results = [];
for (const gl of modes) {
  console.log(`\n=== ${gl} ===`);
  const info = run(["still", bundle, "GLInfo", `out/gltest/glinfo-${gl}.png`, `--gl=${gl}`]);
  const still = run(["still", bundle, "ToonCubeTest", `out/gltest/cube-${gl}.png`, `--gl=${gl}`, "--frame=40"]);
  let clip = { ok: false, ms: 0, log: "skipped" };
  if (still.ok) clip = run(["render", bundle, "ToonCubeTest", `out/gltest/cube-${gl}.mp4`, `--gl=${gl}`, "--frames=0-89", "--concurrency=2"]);
  const perFrame = clip.ok ? Math.round((clip.ms - still.ms) / 89) : null;
  console.log(`  info:${info.ok ? "ok" : "FAIL"}  still:${still.ok ? "ok" : "FAIL"} ${still.ms}ms  clip90:${clip.ok ? "ok" : "FAIL"} ${clip.ms}ms  => ~${perFrame} ms/frame (720p, 2 workers)`);
  if (!clip.ok) console.log(clip.log);
  results.push({ gl, infoOk: info.ok, stillMs: still.ms, clipMs: clip.ms, perFrameMs: perFrame });
}
writeFileSync(path.join(outDir, "results.json"), JSON.stringify(results, null, 2));
