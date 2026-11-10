// Inspect / convert Mixamo FBX files in Node (no browser): stubs the DOM bits FBXLoader touches.
import fs from "node:fs";
globalThis.self = globalThis; globalThis.window = globalThis;
globalThis.document = { createElementNS: () => ({ addEventListener() {}, removeEventListener() {}, setAttribute() {}, style: {} }) };
const THREE = await import("three");
const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
const f = process.argv[2];
const buf = fs.readFileSync(f);
const obj = new FBXLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), "");
const meshes = [], bones = [];
obj.traverse((o) => { if (o.isSkinnedMesh || o.isMesh) meshes.push(`${o.name} (${o.geometry.attributes.position.count} verts, mat ${[].concat(o.material).map((m) => m.name).join("/")})`); if (o.isBone) bones.push(o.name); });
const box = new THREE.Box3().setFromObject(obj);
console.log("meshes:", meshes.length, meshes.slice(0, 12));
console.log("bones:", bones.length, bones.slice(0, 8).join(", "), "...");
console.log("size:", box.getSize(new THREE.Vector3()).toArray().map((v) => v.toFixed(1)).join(" x "), "units");
console.log("clips:", obj.animations.map((a) => `${a.name} ${a.duration.toFixed(2)}s ${a.tracks.length} tracks`));
