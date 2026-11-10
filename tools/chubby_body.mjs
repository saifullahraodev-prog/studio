// Builds the chubby "potato soldier" body (reference look: short round tunic, belt, straps,
// pouches, short thick legs, puttees, boots, mitten hands) in a T-pose, and writes it as
// OBJ + MTL for Mixamo's free auto-rigger. One mesh per material so the engine can re-texture
// each part by name after rigging. Head = small placeholder ball (hidden in the engine; our
// drawn round head goes on the neck), kept so Mixamo can find the chin.
// usage: node tools/chubby_body.mjs [outDir]   (default public/models/chubby)
import fs from "node:fs";
import path from "node:path";
const THREE = await import("three");
const { mergeGeometries } = await import("three/examples/jsm/utils/BufferGeometryUtils.js");
const { OBJExporter } = await import("three/examples/jsm/exporters/OBJExporter.js");

const out = process.argv[2] ?? "public/models/chubby";
fs.mkdirSync(out, { recursive: true });

const parts = {}; // material name -> geometries
const add = (mat, geo, { p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1] } = {}) => {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  const m = new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s));
  g.applyMatrix4(m);
  for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(k)) g.deleteAttribute(k);
  (parts[mat] ??= []).push(g);
};
const V = (x, y) => new THREE.Vector2(x, y);
const mirror = (fn) => [-1, 1].forEach(fn);

// ── torso: round wool tunic, flared skirt, belly bulge (elliptical: z x0.82) ──
const tunic = new THREE.LatheGeometry([V(0.0, 0.42), V(0.25, 0.42), V(0.285, 0.5), V(0.3, 0.62), V(0.3, 0.74), V(0.28, 0.86), V(0.24, 0.96), V(0.17, 1.03), V(0.09, 1.06), V(0.0, 1.07)], 40);
add("tunic", tunic, { s: [1, 1, 0.82] });
// stand collar
add("tunic", new THREE.CylinderGeometry(0.085, 0.1, 0.07, 24), { p: [0, 1.07, 0] });
// breast pockets with flaps + buttons down the front
mirror((sd) => {
  add("tunic", new THREE.BoxGeometry(0.11, 0.11, 0.03), { p: [sd * 0.12, 0.84, 0.22], r: [-0.25, sd * 0.35, 0] });
  add("tunic", new THREE.BoxGeometry(0.12, 0.04, 0.035), { p: [sd * 0.12, 0.9, 0.225], r: [-0.25, sd * 0.35, 0] });
  add("brass", new THREE.SphereGeometry(0.012, 8, 6), { p: [sd * 0.12, 0.89, 0.248] });
});
[0.98, 0.86, 0.74, 0.55].forEach((y) => add("brass", new THREE.SphereGeometry(0.016, 10, 8), { p: [0, y, y > 0.9 ? 0.2 : 0.25] }));
// belt + buckle
add("leather", new THREE.TorusGeometry(0.3, 0.03, 8, 48), { p: [0, 0.64, 0], r: [Math.PI / 2, 0, 0], s: [1.01, 0.83, 1] });
add("brass", new THREE.BoxGeometry(0.07, 0.06, 0.02), { p: [0, 0.64, 0.255] });
// webbing: shoulder straps down to the belt, ammo pouches on the belt
mirror((sd) => {
  add("webbing", new THREE.BoxGeometry(0.045, 0.42, 0.012), { p: [sd * 0.11, 0.85, 0.235], r: [0.12, 0, sd * 0.18] });
  add("webbing", new THREE.BoxGeometry(0.045, 0.42, 0.012), { p: [sd * 0.11, 0.85, -0.235], r: [-0.12, 0, sd * 0.18] });
  [0.12, 0.2].forEach((x) => add("webbing", new THREE.BoxGeometry(0.075, 0.08, 0.05), { p: [sd * x, 0.6, 0.25], r: [0, sd * 0.35, 0] }));
});
// small pack on the back
add("webbing", new THREE.BoxGeometry(0.26, 0.2, 0.08), { p: [0, 0.8, -0.27] });

// ── legs: short thick breeches, wrapped puttees, boots ──
mirror((sd) => {
  const x = sd * 0.13;
  add("trousers", new THREE.CylinderGeometry(0.11, 0.09, 0.2, 20), { p: [x, 0.36, 0] });
  for (let i = 0; i < 4; i++) add("puttees", new THREE.CylinderGeometry(0.078 - i * 0.002, 0.08 - i * 0.002, 0.05, 18), { p: [x, 0.13 + i * 0.045, 0], r: [0.12 * (i % 2 ? 1 : -1), 0, 0] });
  add("boots", new THREE.CapsuleGeometry(0.075, 0.1, 6, 16), { p: [x, 0.06, 0.04], r: [Math.PI / 2, 0, 0], s: [1.1, 1, 0.75] });
});

// ── arms in T-pose: sleeves to the wrist, cuffs, mitten hands ──
mirror((sd) => {
  add("tunic", new THREE.SphereGeometry(0.095, 16, 12), { p: [sd * 0.25, 0.98, 0] });
  add("tunic", new THREE.CylinderGeometry(0.075, 0.085, 0.24, 18), { p: [sd * 0.37, 0.98, 0], r: [0, 0, Math.PI / 2] });
  add("tunic", new THREE.CylinderGeometry(0.065, 0.074, 0.22, 18), { p: [sd * 0.6, 0.98, 0], r: [0, 0, Math.PI / 2] });
  add("tunic", new THREE.CylinderGeometry(0.07, 0.07, 0.03, 18), { p: [sd * 0.7, 0.98, 0], r: [0, 0, Math.PI / 2] });
  add("glove", new THREE.SphereGeometry(0.06, 16, 12), { p: [sd * 0.77, 0.98, 0], s: [1.2, 0.8, 1] });
  add("glove", new THREE.CapsuleGeometry(0.022, 0.04, 4, 8), { p: [sd * 0.76, 0.98, 0.055], r: [Math.PI / 2, 0, 0] });
});

// ── neck + head placeholder (for Mixamo's chin marker; hidden in the engine) ──
add("skin", new THREE.CylinderGeometry(0.06, 0.07, 0.08, 16), { p: [0, 1.1, 0] });
add("skin", new THREE.SphereGeometry(0.17, 24, 16), { p: [0, 1.28, 0.01] });

// ── write OBJ + MTL ──
const COLORS = { tunic: "0.62 0.56 0.38", trousers: "0.55 0.5 0.34", puttees: "0.5 0.46 0.32", webbing: "0.72 0.66 0.48", leather: "0.36 0.24 0.14", boots: "0.22 0.15 0.1", brass: "0.78 0.62 0.3", glove: "0.95 0.95 0.95", skin: "0.95 0.93 0.9" };
const scene = new THREE.Group();
for (const [mat, geos] of Object.entries(parts)) {
  const mesh = new THREE.Mesh(mergeGeometries(geos, false), new THREE.MeshStandardMaterial({ name: mat }));
  mesh.name = mat;
  scene.add(mesh);
}
scene.updateMatrixWorld(true);
const obj = "mtllib chubby_soldier.mtl\n" + new OBJExporter().parse(scene);
fs.writeFileSync(path.join(out, "chubby_soldier.obj"), obj);
fs.writeFileSync(path.join(out, "chubby_soldier.mtl"), Object.entries(COLORS).map(([n, c]) => `newmtl ${n}\nKd ${c}\nKa 0 0 0\nKs 0.05 0.05 0.05\nNs 10\nd 1\n`).join("\n"));
const box = new THREE.Box3().setFromObject(scene);
console.log("parts:", Object.keys(parts).join(", "));
console.log("size (m):", box.getSize(new THREE.Vector3()).toArray().map((v) => v.toFixed(2)).join(" x "));
console.log("tris:", Object.values(parts).flat().reduce((n, g) => n + g.attributes.position.count / 3, 0));
