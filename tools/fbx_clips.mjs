// Mixamo FBX (with or without skin) -> small animation-clip JSON files for the engine.
// usage: node tools/fbx_clips.mjs <in.fbx>... ; writes public/models/mixamo/clips/<name>.json
import fs from "node:fs";
import path from "node:path";
globalThis.self = globalThis; globalThis.window = globalThis;
globalThis.document = { createElementNS: () => ({ addEventListener() {}, removeEventListener() {}, setAttribute() {}, style: {} }) };
const THREE = await import("three");
const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
const out = "public/models/mixamo/clips";
fs.mkdirSync(out, { recursive: true });
console.warn = () => {};
for (const f of process.argv.slice(2)) {
  const buf = fs.readFileSync(f);
  const obj = new FBXLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), "");
  const clip = obj.animations.find((a) => a.tracks.length > 0);
  if (!clip) { console.log("no clip:", f); continue; }
  const name = path.basename(f, ".fbx");
  clip.name = name;
  const hips = clip.tracks.find((t) => t.name === "mixamorigHips.position");
  const v = hips ? hips.values : [];
  const travel = hips ? [v[v.length - 3] - v[0], v[v.length - 2] - v[1], v[v.length - 1] - v[2]].map((x) => x.toFixed(0)) : "-";
  fs.writeFileSync(path.join(out, name + ".json"), JSON.stringify(THREE.AnimationClip.toJSON(clip)));
  console.log(`${name.padEnd(14)} ${clip.duration.toFixed(2)}s ${clip.tracks.length} tracks, hips travel ${travel} cm, ${(fs.statSync(path.join(out, name + ".json")).size / 1e3).toFixed(0)} KB`);
}
