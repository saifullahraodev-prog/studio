// Heavier render benchmark. Usage: node tools/stresstest.mjs [mode ...]
// Renders 60 frames of StressTest at 720p and 1080p per GL mode.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundle = ".cache/bundle";
mkdirSync(path.join(root, "out", "gltest"), { recursive: true });
const argv = process.argv.slice(2);
const modes = argv.length ? argv : ["angle", "swiftshader"];
const run = (args) => {
  const t = Date.now();
  const r = spawnSync(`node tools/run.mjs ${args.join(" ")}`, { cwd: root, encoding: "utf8", shell: true, timeout: 1800000 });
  return { ok: r.status === 0, ms: Date.now() - t, log: (r.stdout + r.stderr).slice(-1200) };
};
const b = run(["bundle", "src/index.ts", `--out-dir=${bundle}`]);
if (!b.ok) { console.log(b.log); process.exit(1); }
const results = [];
for (const gl of modes) {
  for (const res of [720, 1080]) {
    const props = `--props=engine/presets/res-${res}.json`;
    const s = run(["still", bundle, "StressTest", `out/gltest/stress-${gl}-${res}.png`, `--gl=${gl}`, "--frame=30", props]);
    const c = s.ok ? run(["render", bundle, "StressTest", `out/gltest/stress-${gl}-${res}.mp4`, `--gl=${gl}`, "--concurrency=2", props]) : { ok: false, ms: 0, log: "" };
    const pf = c.ok ? Math.round((c.ms - s.ms) / 59) : null;
    console.log(`${gl} ${res}p: still ${s.ok ? "ok" : "FAIL"} ${s.ms}ms, 60f ${c.ok ? "ok" : "FAIL"} ${c.ms}ms => ~${pf} ms/frame`);
    if (!s.ok || !c.ok) console.log(s.log + c.log);
    results.push({ gl, res, stillMs: s.ms, clipMs: c.ms, perFrameMs: pf });
  }
}
writeFileSync(path.join(root, "out", "gltest", "stress-results.json"), JSON.stringify(results, null, 2));

