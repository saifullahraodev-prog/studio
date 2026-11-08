// Cleanup after renders. Safe by design: only touches temp/cache folders
// inside this project, never source files, approved stills or final videos.
//   node tools/cleanup.mjs          -> empty .cache/tmp + .cache/bundle, delete old Remotion temp dirs
//   node tools/cleanup.mjs --tests  -> also remove out/gltest (benchmark files)
import { readdirSync, rmSync, statSync, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tests = process.argv.includes("--tests");

const dirSize = (p) => {
  let s = 0;
  try {
    for (const e of readdirSync(p, { withFileTypes: true })) {
      const f = path.join(p, e.name);
      s += e.isDirectory() ? dirSize(f) : statSync(f).size;
    }
  } catch {}
  return s;
};

let freed = 0;
const wipe = (p, keepRoot = true) => {
  if (!existsSync(p)) return;
  freed += dirSize(p);
  if (keepRoot) {
    for (const e of readdirSync(p)) rmSync(path.join(p, e), { recursive: true, force: true });
  } else rmSync(p, { recursive: true, force: true });
};

wipe(path.join(root, ".cache", "tmp"));
wipe(path.join(root, ".cache", "bundle"), false);
if (tests) wipe(path.join(root, "out", "gltest"), false);

// Remotion temp folders that may have landed in the system temp dir (C:) anyway.
const sysTmp = os.tmpdir();
try {
  for (const e of readdirSync(sysTmp)) {
    if (/^(remotion-|react-motion-render|remotion-v\d)/.test(e)) {
      const p = path.join(sysTmp, e);
      freed += dirSize(p);
      rmSync(p, { recursive: true, force: true });
    }
  }
} catch {}

console.log(`Cleanup done. Freed ${(freed / 1024 / 1024).toFixed(1)} MB.`);
