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
  | "walk" | "run" | "talk" | "fall" | "carry" | "climb" | "cheer" | "shiver" | "sew" | "rattle" | "pushbar" | "wave" | "facepalm" | "cower"
  // review 2: big, travelling, prop-using actions
  | "jump" | "leap" | "stumble" | "shove" | "pushed" | "climbin" | "row" | "throw" | "binoculars" | "lantern" | "rocket" | "crouch" | "surge" | "runacross";

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
    case "carry": // arms out front holding something (a life jacket), leaning back, walking
      return { holdR: "lifejacket", armL: [1.3, -0.25], armR: [1.3, -0.25], elbowL: 0.9, elbowR: 0.9, fingersL: 4, lean: -0.06, walk: t * 6.5, stride: 0.4, noProp: true };
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
    // -- review 2: actions that move the whole body --
    case "jump": { // one-shot: crouch (anticipation) -> launch & stretch -> land & squash -> settle
      const up = t < 0.15 ? 0 : t < 0.75 ? Math.sin(((t - 0.15) / 0.6) * Math.PI) : 0;
      const crouch = t < 0.15 ? t / 0.15 : t > 0.75 && t < 0.95 ? 1 - (t - 0.75) / 0.2 : 0;
      return {
        root: [0, up * 0.95, 0],
        squash: 1 - crouch * 0.16 + (t > 0.15 && t < 0.45 ? 0.12 * Math.sin(((t - 0.15) / 0.3) * Math.PI) : 0),
        sink: crouch * 0.12,
        kneeL: crouch * 0.9 + up * 0.5,
        kneeR: crouch * 0.9 + up * 0.7,
        legs: [up * 0.4, up * 0.2],
        armL: [mix(0.3, 2.9, up), 0.45],
        armR: [mix(0.3, 2.9, up), 0.45],
        elbowL: 0.2,
        elbowR: 0.2,
        fingersL: 4,
        fingersR: 4,
        mouth: up > 0.3 ? "wide" : undefined,
      };
    }
    case "leap": { // one-shot jump that travels forward 1.6 m (over a gap / rail)
      const g = gesture("jump", t);
      const k = clamp01((t - 0.15) / 0.6);
      return { ...g, root: [0, (g.root as number[])[1], k * 1.6], lean: 0.25 * Math.sin(k * Math.PI) };
    }
    case "stumble": { // lurch forward, arms windmilling, catch yourself
      const k = clamp01(t / 0.35);
      const rec = clamp01((t - 0.35) / 0.4);
      return {
        lean: 0.55 * backOut(k) * (1 - rec * 0.8),
        root: [Math.sin(t * 9) * 0.05, 0, 0.5 * backOut(k)],
        armL: [2.2 + Math.sin(t * 22) * 0.6, 0.9],
        armR: [2.0 + Math.sin(t * 22 + 2) * 0.6, 0.9],
        kneeL: 0.7 * (1 - rec),
        legs: [0.5 * (1 - rec), -0.2],
        elbowL: 0.6,
        elbowR: 0.6,
        fingersL: 4,
        fingersR: 4,
        mouth: "wide",
      };
    }
    case "shove": { // wind up, thrust both arms forward, step in, hold
      const wind = clamp01(t / 0.15);
      const hit = backOut(clamp01((t - 0.15) / 0.15));
      return {
        lean: t < 0.15 ? -0.12 * wind : 0.25 * hit,
        root: [0, 0, 0.3 * hit],
        armL: [t < 0.15 ? 1.0 : mix(1.0, 1.55, hit), -0.15],
        armR: [t < 0.15 ? 1.0 : mix(1.0, 1.55, hit), -0.15],
        elbowL: t < 0.15 ? 1.4 : mix(1.4, 0.05, hit),
        elbowR: t < 0.15 ? 1.4 : mix(1.4, 0.05, hit),
        legs: [0.45 * hit, -0.25 * hit],
        kneeL: 0.3 * hit,
        fingersL: 4,
        fingersR: 4,
        mouth: "wide",
      };
    }
    case "pushed": { // knocked backwards: fly back 0.8 m, arms flail, wobble to a stop
      const k = 1 - Math.exp(-t * 7);
      return {
        root: [0, Math.max(0, Math.sin(clamp01(t / 0.3) * Math.PI)) * 0.12, -0.8 * k],
        lean: -0.45 * decay(t, 3),
        roll: Math.sin(t * 14) * 0.08 * decay(t, 3),
        armL: [2.4 + Math.sin(t * 25) * 0.5, 1.0],
        armR: [2.6 + Math.sin(t * 25 + 1) * 0.5, 1.0],
        elbowL: 0.4,
        elbowR: 0.4,
        legs: [0.6 * decay(t, 4), 0.2],
        kneeL: 0.5,
        headNod: -0.25 * decay(t, 4),
        fingersL: 4,
        fingersR: 4,
        mouth: "wide",
      };
    }
    case "climbin": { // step up and over a gunwale into a boat: knee high, hands grab, body rises and moves in
      const k = clamp01(t / 0.9);
      return {
        root: [0, 0.4 * backOut(k, 1.2), 0.45 * k],
        legs: [1.3 * Math.sin(k * Math.PI), 0.3 * k],
        kneeL: 1.6 * Math.sin(k * Math.PI),
        kneeR: 0.4 * k,
        armL: [1.5, -0.1],
        armR: [1.4, -0.05],
        elbowL: 0.9 - 0.6 * k,
        elbowR: 0.9 - 0.6 * k,
        lean: 0.3 * Math.sin(k * Math.PI),
        fingersL: 0,
        fingersR: 0,
      };
    }
    case "row": { // seated, both hands on an oar, long pull strokes
      const c = Math.sin(t * 4.2);
      return {
        holdR: "oar",
        sink: 0.32,
        legs: [1.45, 1.45],
        kneeL: 1.5,
        kneeR: 1.5,
        armL: [1.25 + c * 0.35, -0.25],
        armR: [1.25 + c * 0.35, -0.2],
        elbowL: 0.55 - c * 0.45,
        elbowR: 0.55 - c * 0.45,
        lean: 0.2 * c,
        fingersL: 0,
        noProp: true,
      };
    }
    case "throw": { // wind back, whip forward at 0.35 s, the prop leaves the hand
      const back = clamp01(t / 0.3);
      const fwd = backOut(clamp01((t - 0.3) / 0.15));
      const thrown = t > 0.36;
      return {
        holdR: thrown ? undefined : "rope",
        lean: t < 0.3 ? -0.15 * back : 0.2 * fwd,
        turn: t < 0.3 ? -0.4 * back : -0.4 + 0.6 * fwd,
        armR: [t < 0.3 ? mix(0.3, -0.7, back) : mix(-0.7, 2.4, fwd), 0.3],
        elbowR: t < 0.3 ? 1.5 * back : mix(1.5, 0.1, fwd),
        armL: [1.2, 0.5],
        legs: [0.35 * fwd, -0.2],
        noProp: true,
      };
    }
    case "binoculars": // both hands lift binoculars to the eyes, scanning slowly
      return { holdR: "binoculars", armR: [2.05, -0.42], armL: [2.0, -0.45], elbowR: 1.95, elbowL: 1.95, headYaw: Math.sin(t * 0.8) * 0.25, turn: Math.sin(t * 0.8) * 0.15, noProp: true };
    case "lantern": // hold a lantern up high, swinging it to signal
      return { holdR: "lantern", armR: [2.6, 0.35 + Math.sin(t * 5) * 0.25], elbowR: 0.15, armL: [0.4, 0.3], headNod: -0.15, noProp: true };
    case "rocket": { // fire a distress rocket straight up (recoil at 0.3 s)
      const k = backOut(clamp01(t / 0.25));
      return { holdR: t < 0.3 ? "rocket" : undefined, armR: [mix(0.4, 3.05, k), 0.1], elbowR: 0.05, armL: [0.8, 0.6], lean: t > 0.3 ? -0.12 * decay(t - 0.3, 5) : 0, headNod: -0.3 * k, noProp: true };
    }
    case "crouch": // duck down behind something, head low, arms hugging knees
      return { sink: 0.28, legs: [1.1, 1.1], kneeL: 1.8, kneeR: 1.8, lean: 0.35, armL: [1.0, -0.3], armR: [1.0, -0.3], elbowL: 1.2, elbowR: 1.2, headNod: 0.25, noProp: true };
    case "surge": // crowd pushing forward: lean in, arms reaching, small shoves back and forth
      return { lean: 0.28 + Math.sin(t * 6) * 0.06, root: [0, 0, 0.12 + Math.sin(t * 6) * 0.1], armL: [1.6 + Math.sin(t * 7) * 0.2, 0.15], armR: [1.8 + Math.sin(t * 7 + 1.5) * 0.2, 0.1], elbowL: 0.4, elbowR: 0.3, walk: t * 5, stride: 0.35, fingersL: 4, fingersR: 4 };
    case "runacross": // sprint that actually covers ground (4 m/s forward)
      return { walk: t * 13, stride: 1, root: [0, 0, t * 4] };
    default:
      return {};
  }
};

export const GESTURES: GestureName[] = ["tap", "point", "think", "recoil", "count", "panic", "stamp", "thumbsup", "tick", "yawn", "shovel", "shrug"];
export const ACTIONS: GestureName[] = ["walk", "run", "talk", "point", "panic", "fall", "carry", "climb", "cheer", "shiver", "sew", "rattle", "pushbar", "wave", "facepalm", "cower"];
export const ACTIONS_V2: GestureName[] = ["jump", "leap", "stumble", "shove", "pushed", "climbin", "row", "throw", "binoculars", "lantern", "rocket", "crouch", "surge", "runacross", "carry", "panic"];
