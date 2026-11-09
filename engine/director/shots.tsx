import * as THREE from "three";
import { HEAD_HEIGHT } from "../characters/Character";
import { CameraState, Vec3 } from "../cameras/CameraRig";
import { breathe, punchIn, push, shake, wideClose } from "../cameras/moves";
import { Place, Spot } from "./places";

// ─────────────────────────────────────────────────────────────────────────────
// Generic shot types. Every shot is computed from a place + named spots/props,
// so the director never writes coordinates. All shots "live" (slow push, handheld
// breathing, optional punch-in / shake).
//
//  establish  place's establishing camera            wide     full body + surroundings
//  medium     waist-up, 3/4 angle                    close    wide-lens comedy close-up
//  low        low angle, slight dutch (power/fear)   top      overhead (crowded / lying down)
//  two        two cast members, side-on              ots      over the shoulder of `other`
//  insert     a named prop's own close-up camera     pov      from the subject's eyes to a prop
// ─────────────────────────────────────────────────────────────────────────────

export type ShotType = "establish" | "wide" | "medium" | "close" | "low" | "top" | "two" | "ots" | "insert" | "pov";
export type ShotSpec = { type: ShotType; subject?: string; other?: string; prop?: string; variant?: number; punch?: boolean; shake?: number };
export type ShotCam = { camera: CameraState; focus: Vec3; range: number; bokeh?: number };

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const rot = (v: Vec3, yaw: number): Vec3 => {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
};
const faceOf = (sp: Spot, scale = 1): Vec3 => add(sp.pos, [0, HEAD_HEIGHT * scale, 0]);

// does any head (sphere) sit between the camera and what it looks at?
const blocked = (cam: Vec3, target: Vec3, heads: Vec3[], r = 0.68) =>
  heads.some((h) => {
    const d = [target[0] - cam[0], target[1] - cam[1], target[2] - cam[2]];
    const L2 = d[0] * d[0] + d[1] * d[1] + d[2] * d[2] || 1;
    const k = Math.max(0, Math.min(1, ((h[0] - cam[0]) * d[0] + (h[1] - cam[1]) * d[1] + (h[2] - cam[2]) * d[2]) / L2));
    if (k > 0.97) return false; // the head IS the target
    const q = [cam[0] + d[0] * k - h[0], cam[1] + d[1] * k - h[1], cam[2] + d[2] * k - h[2]];
    return Math.hypot(q[0], q[1], q[2]) < r;
  });

const inZone = (place: Place, p: Vec3) => {
  const b = place.bounds;
  return !b || (p[0] >= b.x[0] && p[0] <= b.x[1] && p[1] >= b.y[0] - 0.01 && p[1] <= b.y[1] + 0.01 && p[2] >= b.z[0] && p[2] <= b.z[1]);
};

export const shotCamera = (place: Place, spec: ShotSpec, cast: Record<string, Spot>, t: number, dur: number): ShotCam => {
  const v = spec.variant ?? 0;
  const side = v % 2 === 0 ? 1 : -1; // alternate sides between cuts
  const subj = (spec.subject && cast[spec.subject]) || Object.values(cast)[0] || { pos: [0, 0, 0] as Vec3, rotY: 0 };
  // preferred angle first; in tight places fall back to straighter / other-side angles
  const wanted = side * (0.3 + (v % 3) * 0.12);
  // heads of everyone except the subject (things that can block the lens)
  const others = Object.entries(cast)
    .filter(([n]) => n !== spec.subject && cast[n] !== subj)
    .map(([, sp]) => faceOf(sp, 0.95));
  // try the preferred angle, then straighter ones, then from BEHIND (subject facing a wall/door);
  // an angle must keep the camera in the place's zone AND have a clear view of the face
  // returns the camera POSITION (also tries moving in closer, in front of a blocker)
  let fromBehind = false;
  const aimTry = (offset: Vec3, base: Vec3 = subj.pos, behind = true, scales = [1, 0.75, 0.55, 0.42]): Vec3 | null => {
    fromBehind = false;
    const front = [wanted, -wanted, wanted * 0.5, -wanted * 0.5, 0.12 * side, 0, wanted * 1.8, -wanted * 1.8];
    const back = behind ? [Math.PI - wanted, Math.PI + wanted, Math.PI] : [];
    const ks = [...front, ...back];
    const scaled = (f: number): Vec3 => [offset[0] * f, offset[1] + (1 - f) * 0.1, offset[2] * f];
    // front angles first (moving in closer if someone is in the way), only then from behind
    for (const group of [front, back])
      for (const f of scales)
        for (const k of group) {
          const pos = add(base, rot(scaled(f), subj.rotY + k));
          if (inZone(place, pos) && !blocked(pos, faceOf(subj), others, 0.72)) {
            fromBehind = group === back;
            return pos;
          }
        }
    for (const k of ks) {
      const pos = add(base, rot(offset, subj.rotY + k));
      if (inZone(place, pos)) {
        fromBehind = back.includes(k);
        return pos;
      }
    }
    return null;
  };
  // seen from behind, look past the subject at what they face (not at the back of the head)
  const ahead = (): Vec3 => add(faceOf(subj), [Math.sin(subj.rotY) * 2.2, 0.25, Math.cos(subj.rotY) * 2.2]);
  const aim = (offset: Vec3, base: Vec3 = subj.pos) => aimTry(offset, base) ?? add(base, rot(offset, subj.rotY));
  const yaw = subj.rotY + wanted;
  let out: ShotCam;
  switch (spec.type) {
    case "establish": {
      const e = place.establish[v % place.establish.length];
      out = { camera: e.cam, focus: e.focus, range: e.range };
      break;
    }
    case "wide": {
      const pw = aimTry([0, 2.3, 6.8], subj.pos, false);
      if (pw === null) {
        const e = place.establish[v % place.establish.length]; // no room for a wide: use the establishing view
        out = { camera: e.cam, focus: e.focus, range: e.range };
      } else out = { camera: { position: pw, target: add(subj.pos, [0, 1.2, 0]), fov: 46 }, focus: faceOf(subj), range: 4 };
      break;
    }
    case "medium":
      {
        const pos = aim([0, 1.9, 4.2]);
        out = { camera: { position: pos, target: fromBehind ? ahead() : add(subj.pos, [0, 1.4, 0]), fov: 40 }, focus: faceOf(subj), range: 1.8 };
      }
      break;
    case "close":
      // vertical frame is narrow: 2.7 m at 54 deg keeps the whole round head in frame
      {
        const pos = aimTry([0, 0.05, 2.7], faceOf(subj), true, [1, 0.82]) ?? aim([0, 0.05, 2.7], faceOf(subj));
        out = { camera: { position: pos, target: fromBehind ? ahead() : faceOf(subj), fov: 54 }, focus: faceOf(subj), range: 1.0, bokeh: 12 };
      }
      break;
    case "low":
      {
        let pos = aim([0.45 * side, 0.85, 2.7]);
        // a low camera behind someone only sees the back of their head: go high instead
        if (fromBehind) pos = aim([0.75 * side, 3.0, 2.4]);
        out = { camera: { position: pos, target: fromBehind ? ahead() : add(faceOf(subj), [0, 0.35, 0]), fov: 50, roll: 0.12 * side }, focus: faceOf(subj), range: 2 };
      }
      break;
    case "top":
      out = { camera: { position: add(subj.pos, rot([0, 7.5, 1.4], subj.rotY)), target: add(subj.pos, [0, 0.4, 0]), fov: 40 }, focus: subj.pos, range: 5 };
      break;
    case "two":
    case "ots": {
      const oth = (spec.other && cast[spec.other]) || subj;
      const a = faceOf(subj);
      const b = faceOf(oth);
      const mid: Vec3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
      const d = new THREE.Vector3(b[0] - a[0], 0, b[2] - a[2]);
      const sep = Math.max(1, d.length());
      d.normalize();
      if (spec.type === "two") {
        const n: Vec3 = [-d.z * side, 0, d.x * side];
        // put the camera on the side the subject faces
        const fwd: Vec3 = [Math.sin(subj.rotY), 0, Math.cos(subj.rotY)];
        const flip = n[0] * fwd[0] + n[2] * fwd[2] < 0 ? -1 : 1;
        const dist = Math.min(4.5, 2.6 + sep * 1.0);
        const cand: Vec3 = [mid[0] + n[0] * flip * dist, mid[1] + 0.2, mid[2] + n[2] * flip * dist];
        const b0 = place.bounds;
        const inside = !b0 || (cand[0] >= b0.x[0] && cand[0] <= b0.x[1] && cand[2] >= b0.z[0] && cand[2] <= b0.z[1]);
        if (inside) {
          out = { camera: { position: cand, target: [mid[0], mid[1] - 0.25, mid[2]], fov: 40 }, focus: mid, range: sep + 1.2 };
        } else {
          // narrow space: film along the line, from in front of the subject, slightly to the side
          const pos: Vec3 = [a[0] - d.x * 3.8 + -d.z * 0.5 * side, a[1] + 0.3, a[2] - d.z * 3.8 + d.x * 0.5 * side];
          out = { camera: { position: pos, target: [mid[0], mid[1] - 0.65, mid[2]], fov: 46 }, focus: a, range: sep + 1.2 }; // faces sit above the captions
        }
      } else {
        // behind `other`, over the shoulder, looking at the subject
        // over the shoulder AND a little above it, so the near head frames the shot instead of filling it
        const behind: Vec3 = [b[0] + d.x * 1.9 + -d.z * 0.6 * side, b[1] + 0.75, b[2] + d.z * 1.9 + d.x * 0.6 * side];
        out = { camera: { position: behind, target: [a[0], a[1] - 0.15, a[2]], fov: 40 }, focus: a, range: 1.4, bokeh: 10 };
      }
      break;
    }
    case "insert": {
      const p = place.props[spec.prop ?? ""] ?? Object.values(place.props)[0];
      // if a cast member stands in the way, lift / slide the camera until the prop is clear
      const heads = Object.values(cast).map((sp) => faceOf(sp, 0.95));
      const tries: Vec3[] = [[0, 0, 0], [0, 0.9, 0], [0.9, 0.6, 0], [-0.9, 0.6, 0], [0, 1.6, 0.6], [1.4, 1.0, 0], [-1.4, 1.0, 0]];
      const pos = tries.map((o) => add(p.cam.position, o)).find((q) => !blocked(q, p.cam.target, heads)) ?? p.cam.position;
      out = { camera: { ...p.cam, position: pos }, focus: p.at, range: 1.4, bokeh: 9 };
      break;
    }
    case "pov": {
      const p = place.props[spec.prop ?? ""] ?? Object.values(place.props)[0];
      out = { camera: { position: faceOf(subj), target: p.at, fov: 50 }, focus: p.at, range: 3 };
      break;
    }
    default:
      out = { camera: { position: add(subj.pos, rot([0, 1.85, 3.5], yaw)), target: add(subj.pos, [0, 1.45, 0]), fov: 34 }, focus: faceOf(subj), range: 1.6 };
  }
  // generic shots stay inside the place's camera zone (establishing/insert cameras are hand-placed)
  const bd = place.bounds;
  if (bd && spec.type !== "establish" && spec.type !== "insert") {
    const cl = (v: number, r: [number, number]) => Math.max(r[0], Math.min(r[1], v));
    out.camera = { ...out.camera, position: [cl(out.camera.position[0], bd.x), cl(out.camera.position[1], bd.y), cl(out.camera.position[2], bd.z)] };
  }
  // every shot lives: slow push, optional punch / shake, handheld breathing
  let c = push(out.camera, t / Math.max(dur, 0.3), spec.type === "establish" ? 0.05 : 0.08);
  if (spec.punch) c = punchIn(c, t, 0.3);
  if (spec.shake) c = shake(c, t, spec.shake);
  c = breathe(c, t + 3, 0.012);
  return { ...out, camera: c };
};
