// Measure a T-pose character mesh (FBX): normalised to 1.6 m tall, prints body widths per height
// so clothes can be fitted. usage: node tools/measure_body.mjs <file.fbx>
import fs from "node:fs";
globalThis.self = globalThis; globalThis.window = globalThis;
globalThis.document = { createElementNS: () => ({ addEventListener() {}, removeEventListener() {}, setAttribute() {}, style: {} }) };
const THREE = await import("three");
const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
console.warn = () => {};
const b = fs.readFileSync(process.argv[2]);
const o = new FBXLoader().parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), "");
o.updateMatrixWorld(true);
const m = o.getObjectByProperty("isMesh", true);
const pos = m.geometry.attributes.position;
const v = new THREE.Vector3();
const pts = [];
for (let i = 0; i < pos.count; i++) pts.push(v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld).clone());
const box = new THREE.Box3().setFromPoints(pts);
const k = 1.6 / (box.max.y - box.min.y);
const P = pts.map((p) => new THREE.Vector3((p.x - (box.max.x + box.min.x) / 2) * k, (p.y - box.min.y) * k, (p.z - (box.max.z + box.min.z) / 2) * k));
const out = { k, rows: [] };
for (let y = 0.02; y < 1.6; y += 0.04) {
  const s = P.filter((p) => Math.abs(p.y - y) < 0.02);
  if (!s.length) continue;
  const xs = s.map((p) => p.x), zs = s.map((p) => p.z);
  // centre column (torso/legs): points with |x| < 0.35
  const c = s.filter((p) => Math.abs(p.x) < 0.35);
  const cx = c.map((p) => Math.abs(p.x)), cz = c.map((p) => p.z);
  out.rows.push({ y: +y.toFixed(2), xMin: +Math.min(...xs).toFixed(3), xMax: +Math.max(...xs).toFixed(3), zMin: +Math.min(...zs).toFixed(3), zMax: +Math.max(...zs).toFixed(3), cHalfW: c.length ? +Math.max(...cx).toFixed(3) : 0, cZmin: c.length ? +Math.min(...cz).toFixed(3) : 0, cZmax: c.length ? +Math.max(...cz).toFixed(3) : 0, n: s.length });
}
console.log(out.rows.map((r) => `${r.y.toFixed(2)}  x ${r.xMin}..${r.xMax}  z ${r.zMin}..${r.zMax}  centre halfW ${r.cHalfW} z ${r.cZmin}..${r.cZmax}`).join("\n"));
// leg gap at low heights: x of points near y=0.3
const legs = P.filter((p) => Math.abs(p.y - 0.25) < 0.03).map((p) => p.x).sort((a, b) => a - b);
console.log("legs x at y=0.25:", legs[0].toFixed(3), "..", legs[legs.length - 1].toFixed(3), "gap near 0:", legs.filter((x) => Math.abs(x) < 0.03).length);
