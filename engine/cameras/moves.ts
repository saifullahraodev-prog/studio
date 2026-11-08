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
