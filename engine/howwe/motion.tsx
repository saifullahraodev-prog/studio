// How We Ended Up · motion language (docs/howwe-visual-direction.md §6). Pure functions of the frame number.
import React from "react";
import { W, H } from "./kit";

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** 0..1 progress of an action that starts at `start` and lasts `dur` frames. */
export const prog = (f: number, start: number, dur: number) => clamp01((f - start) / Math.max(1, dur));
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** Ease-out with a small overshoot (exhibit "rise"). */
export const easeBack = (t: number, k = 1.4) => 1 + (k + 1) * Math.pow(t - 1, 3) + k * Math.pow(t - 1, 2);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Smooth 0..1..0 loop with period `p` frames (eating, chopping). */
export const loop = (f: number, p: number, phase = 0) => (1 - Math.cos(((f + phase) / p) * Math.PI * 2)) / 2;

/** Timing rules (frames @30 fps). */
export const TIMING = {
  rise: 12, // exhibit rises onto plinth (ease back)
  cardDelay: 6, // label card prints on after its exhibit
  card: 10,
  push: 8, // keyword push-in
  tint: 15, // era tint wash
  lightsDown: 10,
  lightsUp: 20,
  mapFill: 20,
  dolly: 22, // gallery dolly transition
  door: 20, // doorway transition
  stagger: 14, // between consecutive exhibits
};

/**
 * Camera: slow constant drift (+1.5% scale per 5 s) plus optional push-in toward a focus point.
 * `push` 0..1 blends from the wide framing to `zoom` centred on (fx, fy).
 */
export const Cam: React.FC<{ f: number; push?: number; zoom?: number; fx?: number; fy?: number; drift?: boolean; children: React.ReactNode }> = ({
  f, push = 0, zoom = 1.25, fx = W / 2, fy = H / 2, drift = true, children,
}) => {
  const d = drift ? 1 + (0.015 * f) / 150 : 1;
  const z = lerp(1, zoom, push) * d;
  // keep the focus point moving toward the frame centre as we push in
  const cx = lerp(W / 2, fx, push), cy = lerp(H / 2, fy, push);
  return <g transform={`translate(${W / 2} ${H / 2}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>;
};
