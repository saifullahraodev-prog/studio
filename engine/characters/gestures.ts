import { MouthSlot } from "./face";
import type { Pose } from "./Character";

// ─────────────────────────────────────────────────────────────────────────────
// Gesture kit: short procedural actions with anticipation + overshoot (cartoon
// timing). gesture(name, t) returns pose overrides for t seconds after it starts.
// Arms are [forward, out] in radians: forward 1.6 = straight ahead, 3 = up;
// out > 0 = away from the body, < 0 = across the body.
// ─────────────────────────────────────────────────────────────────────────────

export type GestureName =
  | "tap" | "point" | "think" | "recoil" | "count" | "panic" | "stamp" | "thumbsup"
  | "tick" | "yawn" | "shovel" | "shrug"
  // Phase 4 core actions
  | "walk" | "run" | "talk" | "fall" | "carry" | "climb" | "cheer" | "shiver" | "sew" | "rattle" | "pushbar" | "wave" | "facepalm" | "cower";

export type GestureOut = Partial<Pose> & { mouth?: MouthSlot };

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
// ease-out with overshoot (back easing): 0 → 1, peaking ~1.1
const backOut = (x: number, s = 1.9) => {
  const p = clamp01(x) - 1;
  return 1 + (s + 1) * p * p * p + s * p * p;
};
// reach a target in `dur` s with a small wind-up in the opposite direction first
const reach = (t: number, dur = 0.22, wind = 0.06) => (t < wind ? -0.15 * (t / wind) : backOut((t - wind) / dur));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const decay = (t: number, rate = 3) => Math.exp(-t * rate);

export const gesture = (name: GestureName | string | undefined, t: number): GestureOut => {
  if (!name || name === "-" || t < 0) return {};
  const k = reach(t);
  switch (name) {
    case "tap": // tap the clipboard with the other hand
      return { armR: [mix(0.05, 0.95, k) + Math.abs(Math.sin(t * 11)) * 0.18 * decay(t, 1.5), -0.35 * clamp01(k)], headNod: 0.08 * clamp01(k) };
    case "point": // jab a finger at camera
      return { armR: [mix(0.05, 1.55, k), 0.08], fingersR: 1, lean: 0.06 * clamp01(k), headNod: -0.05 };
    case "think": // hand to chin, head tilted
      return { armR: [mix(0.05, 2.25, k), -0.62 * clamp01(k)], fingersR: 2, headTilt: 0.16 * clamp01(k), headYaw: 0.12 * clamp01(k) };
    case "recoil": // flinch backwards, hands up
      return { lean: -0.32 * decay(t, 2.2) * clamp01(t / 0.08), armL: [mix(0.05, 1.3, k), 0.5], armR: [mix(0.05, 1.3, k), 0.5], bob: 0.05 * decay(t, 4) };
    case "count": { // raise a hand and count on fingers, one every 0.22 s (only 4 to count on!)
      const n = Math.max(0, Math.min(4, Math.floor((t - 0.2) / 0.22) + 1));
      return { armL: [mix(0.05, 1.75, k), -0.25 * clamp01(k)], fingersL: t < 0.2 ? 0 : n, headNod: 0.12, headYaw: -0.15 };
    }
    case "panic": // flailing arms, jittering
      return {
        armL: [0.4 + Math.sin(t * 17) * 0.45, mix(0.2, 2.5, clamp01(k)) + Math.sin(t * 13) * 0.25],
        armR: [0.4 + Math.sin(t * 17 + 2) * 0.45, mix(0.2, 2.5, clamp01(k)) + Math.sin(t * 11 + 1) * 0.25],
        bob: Math.abs(Math.sin(t * 14)) * 0.06,
        headTilt: Math.sin(t * 9) * 0.12,
        fingersL: 4,
        fingersR: 4,
      };
    case "stamp": { // raise high, slam down at 0.32 s, small bounce
      const up = clamp01(t / 0.22);
      const slam = t < 0.22 ? mix(0.05, 2.7, backOut(up)) : t < 0.32 ? mix(2.7, 0.95, (t - 0.22) / 0.1) : 0.95 + Math.sin((t - 0.32) * 30) * 0.08 * decay(t - 0.32, 6);
      return { armR: [slam, -0.15], fingersR: 0, lean: t > 0.32 ? 0.12 * decay(t - 0.32, 3) : -0.05, headNod: 0.25 };
    }
    case "thumbsup":
      return { armR: [mix(0.05, 1.35, k), 0.25], fingersR: 0, headTilt: -0.1 * clamp01(k), bob: Math.abs(Math.sin(t * 6)) * 0.02 };
    case "tick": { // pen tick: down-right then up-right
      const p = clamp01(t / 0.35);
      return { armR: [0.9 + (p < 0.4 ? -p * 0.6 : (p - 0.4) * 1.0), -0.3 + p * 0.3], fingersR: 1, headNod: 0.15 };
    }
    case "yawn":
      return { armL: [mix(0.05, 2.85, k), 0.45], armR: [mix(0.05, 2.85, k), 0.45], headNod: -0.22 * clamp01(k), mouth: t > 0.15 && t < 1.3 ? "wide" : undefined, lean: -0.08 };
    case "shovel": // scooping coal, looping
      return { lean: 0.2 + Math.sin(t * 5) * 0.12, bob: -Math.abs(Math.sin(t * 5)) * 0.04, armL: [0.9 + Math.sin(t * 5) * 0.35, 0.1] };
    case "shrug":
      return { armL: [mix(0.05, 0.5, k), 0.95 * clamp01(k)], armR: [mix(0.05, 0.5, k), 0.95 * clamp01(k)], headTilt: 0.18 * clamp01(k), fingersL: 4, fingersR: 4 };
    // ── Phase 4 core actions (loops unless noted) ──
    case "walk":
      return { walk: t * 7, stride: 0.5 };
    case "run":
      return { walk: t * 12, stride: 1 };
    case "talk": // explaining with both hands, small beats
      return { armL: [0.55 + Math.sin(t * 4.2) * 0.25, 0.35], armR: [0.7 + Math.sin(t * 3.4 + 1) * 0.3, 0.3], fingersL: 4, fingersR: 4, headTilt: Math.sin(t * 2.1) * 0.06, headNod: Math.sin(t * 4.2) * 0.04 };
    case "fall": { // one-shot cartoon slip: feet fly up, lands on the back at 0.45 s, bounce, lies flat
      const tip = t < 0.1 ? 0.1 * (t / 0.1) : -Math.min(1.42, 1.42 * backOut((t - 0.1) / 0.35, 1.2));
      const land = t > 0.45 ? Math.abs(Math.sin((t - 0.45) * 16)) * 0.07 * decay(t - 0.45, 6) : 0;
      const kick = clamp01((t - 0.05) / 0.3);
      return {
        lean: tip,
        bob: land,
        armL: t < 0.45 ? [1.2 + Math.sin(t * 30) * 0.4, 1.4] : [0.4, 1.2],
        armR: t < 0.45 ? [1.2 + Math.sin(t * 30 + 2) * 0.4, 1.4] : [0.4, 1.2],
        legs: [1.1 * kick, 0.6 * kick],
        fingersL: 4,
        fingersR: 4,
        mouth: t < 0.45 ? "wide" : "closed",
      };
    }
    case "carry": // arms out front holding something (bolt of cloth / box), leaning back, walking
      return { armL: [1.3, -0.12], armR: [1.3, -0.12], fingersL: 4, fingersR: 4, lean: -0.06, walk: t * 6.5, stride: 0.4, noProp: true };
    case "climb": { // ladder / stairs: alternating reach and step
      const a = Math.sin(t * 6);
      return { armL: [2.7 + a * 0.35, 0.15], armR: [2.7 - a * 0.35, 0.15], legs: [0.5 + a * 0.5, 0.5 - a * 0.5], lean: 0.08, bob: Math.max(0, a) * 0.05, fingersL: 2, fingersR: 2, noProp: true };
    }
    case "cheer": { // fists pumping, little hops
      const h = Math.abs(Math.sin(t * 7));
      return { armL: [2.9 - h * 0.4, 0.35], armR: [2.9 - (1 - h) * 0.4, 0.35], fingersL: 0, fingersR: 0, bob: h * 0.1, headNod: -0.12, mouth: "wide" };
    }
    case "shiver": // arms hugging the body, fast jitter
      return { armL: [0.9, -0.85], armR: [0.9, -0.85], roll: Math.sin(t * 55) * 0.02, bob: Math.sin(t * 47) * 0.006, headNod: 0.1, headTilt: Math.sin(t * 61) * 0.03, fingersL: 4, fingersR: 4, noProp: true };
    case "sew": // hunched over a machine, hands feeding fabric, quick little motions
      return { armL: [1.15 + Math.sin(t * 14) * 0.05, -0.18], armR: [1.1 + Math.sin(t * 14 + 1.5) * 0.06, -0.2], headNod: 0.32, lean: 0.12, fingersL: 4, fingersR: 2, noProp: true };
    case "rattle": { // yanking a locked door handle: both hands, violent back-and-forth
      const y = Math.sin(t * 24);
      return { armL: [1.45 + y * 0.12, -0.05], armR: [1.45 + y * 0.12, -0.05], lean: 0.08 + y * 0.06, roll: Math.sin(t * 11) * 0.03, fingersL: 0, fingersR: 0, mouth: "wide", noProp: true };
    }
    case "pushbar": { // one-shot: step forward and shove a door bar with both hands
      const p = backOut(clamp01((t - 0.08) / 0.25));
      return { armL: [mix(0.3, 1.5, p), -0.1], armR: [mix(0.3, 1.5, p), -0.1], lean: 0.18 * p, legs: [0.35 * p, -0.2 * p], fingersL: 4, fingersR: 4, noProp: true };
    }
    case "wave":
      return { armR: [mix(0.05, 2.7, k), 0.35 + Math.sin(t * 10) * 0.3 * clamp01(k)], fingersR: 4, headTilt: 0.08 };
    case "facepalm": // hand slaps the face, head drops
      return { armR: [mix(0.05, 2.45, k), -0.72 * clamp01(k)], fingersR: 4, headNod: 0.28 * clamp01(t / 0.3), headTilt: -0.08 };
    case "cower": // crouch, arms over the head
      return { sink: 0.12 * clamp01(t / 0.2), armL: [2.6, -0.5], armR: [2.6, -0.5], headNod: 0.3, lean: 0.12, roll: Math.sin(t * 40) * 0.01, fingersL: 4, fingersR: 4, noProp: true };
    default:
      return {};
  }
};

export const GESTURES: GestureName[] = ["tap", "point", "think", "recoil", "count", "panic", "stamp", "thumbsup", "tick", "yawn", "shovel", "shrug"];
export const ACTIONS: GestureName[] = ["walk", "run", "talk", "point", "panic", "fall", "carry", "climb", "cheer", "shiver", "sew", "rattle", "pushbar", "wave", "facepalm", "cower"];
