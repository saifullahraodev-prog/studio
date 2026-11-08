// Export face sprite sheets (transparent PNG) for every character x face variant.
// Usage: node tools/make-faces.mjs [characterId ...]
// Output: public/characters/faces/<character>-<variant>.png
import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const chars = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(path.join(root, "engine", "characters")).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
const variants = ["A", "B", "C", "D"];
const outDir = path.join(root, "public", "characters", "faces");
const tmp = path.join(root, ".cache", "tmp");
mkdirSync(outDir, { recursive: true });
mkdirSync(tmp, { recursive: true });

const bundle = ".cache/bundle";
const rm = (...args) => spawnSync(process.execPath, ["tools/run.mjs", ...args], { cwd: root, stdio: "inherit" }).status;
if (rm("bundle", "src/index.ts", `--out-dir=${bundle}`, "--log=error") !== 0) process.exit(1);

for (const c of chars) {
  for (const v of variants) {
    const props = `.cache/tmp/face-${c}-${v}.json`;
    writeFileSync(path.join(root, props), JSON.stringify({ character: c, variant: v }));
    const out = `public/characters/faces/${c}-${v}.png`;
    const st = rm("still", bundle, "FaceSheet", out, `--props=${props}`, "--image-format=png", "--log=error");
    console.log(`${st === 0 ? "ok  " : "FAIL"} ${out}`);
  }
}
