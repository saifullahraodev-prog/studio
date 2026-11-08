// Wrapper around the Remotion CLI that keeps ALL temp/cache files on D:.
// Usage: node tools/run.mjs <remotion args...>
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = path.join(root, ".cache", "tmp");
mkdirSync(tmp, { recursive: true });

const env = { ...process.env, TEMP: tmp, TMP: tmp, TMPDIR: tmp };
const args = process.argv.slice(2);
const res = spawnSync("npx", ["remotion", ...args], {
  cwd: root,
  env,
  stdio: "inherit",
  shell: true,
});
process.exit(res.status ?? 1);
