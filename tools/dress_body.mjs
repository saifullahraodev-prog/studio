// Dress the owner's low-poly chubby character (T-pose FBX) in the WW1 uniform, fitted to its
// measured shape (tools/measure_body.mjs), and write body + clothes as one OBJ + MTL for
// Mixamo's auto-rigger. The character's own skin stays (white, = reference white hands);
// its head stays only so Mixamo can find the chin (the engine swaps in our round head).
// usage: node tools/dress_body.mjs <in.fbx> [outDir]
import fs from "node:fs";
import path from "node:path";
globalThis.self = globalThis; globalThis.window = globalThis;
globalThis.document = { createElementNS: () => ({ addEventListener() {}, removeEventListener() {}, setAttribute() {}, style: {} }) };
const THREE = await import("three");
const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
const { mergeGeometries } = await import("three/examples/jsm/utils/BufferGeometryUtils.js");
const { OBJExporter } = await import("three/examples/jsm/exporters/OBJExporter.js");
console.warn = () => {};

const [inFile, out = "public/models/dressed"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });

// ── the character's own mesh, baked to world space, 1.6 m tall, centred, feet at 0 ──
const b = fs.readFileSync(inFile);
const o = new FBXLoader().parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), "");
o.updateMatrixWorld(true);
const src = o.getObjectByProperty("isMesh", true);
const body = src.geometry.clone();
for (const k of Object.keys(body.attributes)) if (!["position", "normal", "uv"].includes(k)) body.deleteAttribute(k);
body.applyMatrix4(src.matrixWorld);
body.computeBoundingBox();
const bb = body.boundingBox;
const K = 1.6 / (bb.max.y - bb.min.y);
body.translate(-(bb.max.x + bb.min.x) / 2, -bb.min.y, -(bb.max.z + bb.min.z) / 2);
body.scale(K, K, K);
body.computeVertexNormals();

const parts = { skin: [body.index ? body.toNonIndexed() : body] };
const add = (mat, geo, { p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1] } = {}) => {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s)));
  for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(k)) g.deleteAttribute(k);
  (parts[mat] ??= []).push(g);
};
const V = (x, y) => new THREE.Vector2(x, y);
const mirror = (fn) => [-1, 1].forEach(fn);
const ZC = 0.02; // body centre in depth

// measured: legs y 0-0.42 (x +-0.2, two legs ~0.1 radius), torso 0.42-0.98 (half width ~0.2,
// depth -0.13..0.18), arms at y ~0.9 out to x +-0.79 (radius ~0.055), neck ~1.0, head 1.02-1.6.
// ── tunic: round, flared skirt over the hips, slightly looser than the body ──
add("tunic", new THREE.LatheGeometry([V(0.0, 0.36), V(0.235, 0.36), V(0.25, 0.44), V(0.245, 0.56), V(0.24, 0.7), V(0.235, 0.8), V(0.215, 0.9), V(0.17, 0.98), V(0.13, 1.0), V(0.0, 1.0)], 40), { p: [0, 0, ZC], s: [1, 1, 0.82] });
add("tunic", new THREE.CylinderGeometry(0.13, 0.15, 0.06, 24), { p: [0, 1.0, ZC] }); // collar
mirror((sd) => {
  add("tunic", new THREE.BoxGeometry(0.09, 0.09, 0.03), { p: [sd * 0.1, 0.8, ZC + 0.19], r: [-0.15, sd * 0.3, 0] });
  add("tunic", new THREE.BoxGeometry(0.1, 0.035, 0.035), { p: [sd * 0.1, 0.85, ZC + 0.19], r: [-0.15, sd * 0.3, 0] });
  add("brass", new THREE.SphereGeometry(0.01, 8, 6), { p: [sd * 0.1, 0.845, ZC + 0.212] });
  // sleeves: shoulder puff + upper/lower sleeve + cuff (hands stay the character's own white hands)
  add("tunic", new THREE.SphereGeometry(0.1, 16, 12), { p: [sd * 0.25, 0.9, ZC] });
  add("tunic", new THREE.CylinderGeometry(0.072, 0.085, 0.24, 18), { p: [sd * 0.38, 0.9, ZC * 0.5], r: [0, 0, Math.PI / 2] });
  add("tunic", new THREE.CylinderGeometry(0.066, 0.074, 0.18, 18), { p: [sd * 0.58, 0.9, ZC * 0.5], r: [0, 0, Math.PI / 2] });
  add("tunic", new THREE.CylinderGeometry(0.072, 0.072, 0.03, 18), { p: [sd * 0.665, 0.9, ZC * 0.5], r: [0, 0, Math.PI / 2] });
});
[0.92, 0.8, 0.68, 0.48].forEach((y) => add("brass", new THREE.SphereGeometry(0.014, 10, 8), { p: [0, y, ZC + (y > 0.88 ? 0.17 : 0.205)] }));
// belt + buckle, webbing straps, pouches, small back pack
add("leather", new THREE.TorusGeometry(0.248, 0.026, 8, 48), { p: [0, 0.56, ZC], r: [Math.PI / 2, 0, 0], s: [1.0, 0.83, 1] });
add("brass", new THREE.BoxGeometry(0.06, 0.05, 0.02), { p: [0, 0.56, ZC + 0.21] });
mirror((sd) => {
  add("webbing", new THREE.BoxGeometry(0.04, 0.36, 0.012), { p: [sd * 0.09, 0.76, ZC + 0.2], r: [0.1, 0, sd * 0.16] });
  add("webbing", new THREE.BoxGeometry(0.04, 0.36, 0.012), { p: [sd * 0.09, 0.76, ZC - 0.2], r: [-0.1, 0, sd * 0.16] });
  [0.1, 0.17].forEach((x) => add("webbing", new THREE.BoxGeometry(0.065, 0.07, 0.045), { p: [sd * x, 0.52, ZC + 0.205], r: [0, sd * 0.4, 0] }));
});
add("webbing", new THREE.BoxGeometry(0.22, 0.18, 0.07), { p: [0, 0.74, ZC - 0.22] });
// ── legs: breeches, wrapped puttees, boots ──
mirror((sd) => {
  const x = sd * 0.1;
  add("trousers", new THREE.CylinderGeometry(0.112, 0.1, 0.22, 20), { p: [x, 0.31, 0] });
  for (let i = 0; i < 3; i++) add("puttees", new THREE.CylinderGeometry(0.098 - i * 0.002, 0.1 - i * 0.002, 0.045, 18), { p: [x, 0.1 + i * 0.042, 0], r: [0.12 * (i % 2 ? 1 : -1), 0, 0] });
  add("boots", new THREE.CapsuleGeometry(0.105, 0.11, 6, 16), { p: [x, 0.055, 0.02], r: [Math.PI / 2, 0, 0], s: [1.15, 1.05, 0.72] });
});

// ── write ──
const COLORS = { skin: "0.96 0.96 0.95", tunic: "0.62 0.56 0.38", trousers: "0.55 0.5 0.34", puttees: "0.5 0.46 0.32", webbing: "0.72 0.66 0.48", leather: "0.36 0.24 0.14", boots: "0.22 0.15 0.1", brass: "0.78 0.62 0.3" };
const scene = new THREE.Group();
for (const [mat, geos] of Object.entries(parts)) {
  const mesh = new THREE.Mesh(mergeGeometries(geos, false), new THREE.MeshStandardMaterial({ name: mat }));
  mesh.name = mat;
  scene.add(mesh);
}
scene.updateMatrixWorld(true);
fs.writeFileSync(path.join(out, "dressed_soldier.obj"), "mtllib dressed_soldier.mtl\n" + new OBJExporter().parse(scene));
fs.writeFileSync(path.join(out, "dressed_soldier.mtl"), Object.entries(COLORS).map(([n, c]) => `newmtl ${n}\nKd ${c}\nKa 0 0 0\nKs 0.05 0.05 0.05\nNs 10\nd 1\n`).join("\n"));
console.log("parts:", Object.keys(parts).join(", "), "| scale", K.toExponential(3));
