import { Easing, interpolate } from "remotion";
import { CameraState, Vec3 } from "./CameraRig";

// Camera move library. Each move takes progress p (0..1 over the shot) and returns
// a camera state, so shots are pure data + one of these functions.
const lerp3 = (a: Vec3, b: Vec3, p: number): Vec3 => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
const ease = (p: number) => Easing.inOut(Easing.cubic)(Math.max(0, Math.min(1, p)));

// glide / push-in / pull-out: move from one camera to another, eased
export const glide = (from: CameraState, to: CameraState, p: number): CameraState => {
  const e = ease(p);
  return { position: lerp3(from.position, to.position, e), target: lerp3(from.target, to.target, e), fov: from.fov + (to.fov - from.fov) * e, roll: (from.roll ?? 0) + ((to.roll ?? 0) - (from.roll ?? 0)) * e };
};

// orbit around the target by `angle` radians over the shot
export const orbit = (cam: CameraState, angle: number, p: number): CameraState => {
  const [tx, , tz] = cam.target;
  const dx = cam.position[0] - tx;
  const dz = cam.position[2] - tz;
  const a = angle * ease(p);
  return { ...cam, position: [tx + dx * Math.cos(a) - dz * Math.sin(a), cam.position[1], tz + dx * Math.sin(a) + dz * Math.cos(a)] };
};

// follow: keep a fixed offset from a moving subject
export const follow = (subject: Vec3, offset: Vec3, lookOffset: Vec3, fov: number): CameraState => ({
  position: [subject[0] + offset[0], subject[1] + offset[1], subject[2] + offset[2]],
  target: [subject[0] + lookOffset[0], subject[1] + lookOffset[1], subject[2] + lookOffset[2]],
  fov,
});

// shake: impact jolt that decays (t = seconds since impact)
export const shake = (cam: CameraState, t: number, strength = 0.12): CameraState => {
  if (t < 0) return cam;
  const decay = Math.exp(-t * 3.2) * strength;
  const n = (k: number) => Math.sin(t * 47 + k) * 0.6 + Math.sin(t * 23 + k * 2.1) * 0.4;
  return {
    ...cam,
    position: [cam.position[0] + n(1) * decay, cam.position[1] + n(2) * decay * 0.7, cam.position[2] + n(3) * decay * 0.5],
    roll: (cam.roll ?? 0) + n(4) * decay * 0.25,
  };
};

// gentle handheld breathing, so static shots never feel frozen
export const breathe = (cam: CameraState, t: number, amount = 0.02): CameraState => ({
  ...cam,
  position: [cam.position[0] + Math.sin(t * 0.7) * amount, cam.position[1] + Math.sin(t * 0.9 + 1) * amount * 0.6, cam.position[2]],
});

export const progress = (frame: number, start: number, end: number) => interpolate(frame, [start, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// punch-in: the shot starts ~30% further out and snaps in with a little overshoot
// in the first 0.16 s (the "zoom on a stressed word" look), then drifts.
export const punchIn = (cam: CameraState, t: number, amount = 0.3, dur = 0.16): CameraState => {
  const p = Math.max(0, Math.min(1, t / dur));
  const back = 1 + 1.9 * Math.pow(p - 1, 3) + 1.9 * Math.pow(p - 1, 2) * 1; // back-out easing 0 -> 1
  const k = amount * (1 - Math.min(1.08, back));
  const d: Vec3 = [cam.position[0] - cam.target[0], cam.position[1] - cam.target[1], cam.position[2] - cam.target[2]];
  return { ...cam, position: [cam.position[0] + d[0] * k, cam.position[1] + d[1] * k, cam.position[2] + d[2] * k] };
};

// slow push toward the target over the shot (keeps every frame alive)
export const push = (cam: CameraState, p: number, amount = 0.08): CameraState => {
  const k = amount * Math.max(0, Math.min(1, p));
  return { ...cam, position: [cam.position[0] + (cam.target[0] - cam.position[0]) * k, cam.position[1] + (cam.target[1] - cam.position[1]) * k, cam.position[2] + (cam.target[2] - cam.position[2]) * k] };
};

// wide-lens close-up: camera `dist` metres in front of a point, facing it (big-head comedy distortion)
export const wideClose = (face: Vec3, yaw: number, dist = 1.45, fov = 60, height = 0.05): CameraState => ({
  position: [face[0] + Math.sin(yaw) * dist, face[1] + height, face[2] + Math.cos(yaw) * dist],
  target: face,
  fov,
});

// handheld drift: slow, small, random-looking (incommensurate sines), deterministic per t
export const handheld = (cam: CameraState, t: number, pos = 0.035, tgt = 0.03, roll = 0.007, seed = 0): CameraState => {
  const n = (f: number, ph: number) => Math.sin(t * f + ph + seed) * 0.6 + Math.sin(t * f * 2.13 + ph * 1.7 + seed * 0.5) * 0.4;
  return {
    ...cam,
    position: [cam.position[0] + n(0.37, 0.1) * pos, cam.position[1] + n(0.53, 1.3) * pos * 0.7, cam.position[2] + n(0.29, 2.2) * pos * 0.5],
    target: [cam.target[0] + n(0.44, 3.1) * tgt, cam.target[1] + n(0.61, 4.0) * tgt * 0.8, cam.target[2]],
    roll: (cam.roll ?? 0) + n(0.31, 5.2) * roll,
  };
};

// quick push toward the target on key words: `hits` are seconds (relative to the shot) of emphasised words
export const keyPush = (cam: CameraState, t: number, hits: number[], amount = 0.14, attack = 0.09, release = 0.55): CameraState => {
  let k = 0;
  for (const h of hits) {
    const d = t - h;
    if (d < -attack || d > release + 0.4) continue;
    const up = d < 0 ? 1 - -d / attack : 1; // ease in over `attack` before the word lands
    const down = d > 0 ? Math.exp(-d / release) : 1;
    k = Math.max(k, Math.max(0, up) * down);
  }
  if (k <= 0) return cam;
  const p = cam.position;
  const g = cam.target;
  const f = amount * k;
  return { ...cam, position: [p[0] + (g[0] - p[0]) * f, p[1] + (g[1] - p[1]) * f, p[2] + (g[2] - p[2]) * f] };
};

