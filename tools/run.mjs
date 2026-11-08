// Wrapper around the Remotion CLI that keeps ALL temp/cache files on D:.
// Runs the CLI with node directly (no shell), so paths with spaces are safe.
// Usage: node tools/run.mjs <remotion args...>
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = path.join(root, ".cache", "tmp");
mkdirSync(tmp, { recursive: true });

const cli = path.join(root, "node_modules", "@remotion", "cli", "remotion-cli.js");
const env = { ...process.env, TEMP: tmp, TMP: tmp, TMPDIR: tmp };
const res = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], { cwd: root, env, stdio: "inherit" });
process.exit(res.status ?? 1);
