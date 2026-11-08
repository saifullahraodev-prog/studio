import { MouthSlot, TalkMouth } from "./face";

// Word timings, as produced by faster-whisper (seconds).
export type WordTiming = { word: string; start: number; end: number };

// Map a letter to a mouth shape (simple, readable cartoon lip-sync).
const shapeFor = (ch: string): TalkMouth => {
  const c = ch.toLowerCase();
  if ("aä".includes(c)) return "wide";
  if ("oóuwq".includes(c)) return "round";
  if ("eiy".includes(c)) return "teeth";
  if ("mbp".includes(c)) return "closed";
  if ("fv".includes(c)) return "teeth";
  return "small";
};

// Split a word into "syllable beats": one beat per vowel group, with a closed
// mouth for m/b/p at word starts. Returns mouth shapes to cycle through.
const beatsFor = (word: string): TalkMouth[] => {
  const w = word.replace(/[^a-zA-Z]/g, "");
  if (!w) return ["small"];
  const out: TalkMouth[] = [];
  if ("mbpMBP".includes(w[0])) out.push("closed");
  let prevVowel = false;
  for (const ch of w) {
    const v = "aeiouyAEIOUY".includes(ch);
    if (v && !prevVowel) out.push(shapeFor(ch));
    prevVowel = v;
  }
  if (out.length === 0) out.push("small");
  return out;
};

// Mouth slot for a given time. Outside words → "rest" (the expression's own mouth).
// Each beat holds at least `minHold` seconds so mouths never flicker.
export const mouthAt = (words: WordTiming[], t: number, minHold = 0.07): MouthSlot => {
  const w = words.find((x) => t >= x.start && t < x.end);
  if (!w) {
    // brief closed mouth just after a word ends (natural settle)
    const just = words.find((x) => t >= x.end && t < x.end + 0.06);
    return just ? "closed" : "rest";
  }
  const beats = beatsFor(w.word);
  const dur = Math.max(w.end - w.start, 0.01);
  const n = Math.max(1, Math.min(beats.length, Math.floor(dur / minHold)));
  const i = Math.min(n - 1, Math.floor(((t - w.start) / dur) * n));
  // interleave a half-closed mouth between beats for longer words
  const local = ((t - w.start) / dur) * n - i;
  if (n > 1 && local > 0.8) return "small";
  return beats[Math.floor((i / n) * beats.length)];
};

// Fake word timings for tests (until a real voice + faster-whisper exists).
export const fakeTimings = (text: string, startAt = 0.3, wps = 2.7): WordTiming[] => {
  const words = text.split(/\s+/).filter(Boolean);
  let t = startAt;
  return words.map((word) => {
    const len = (0.18 + word.replace(/[^a-zA-Z]/g, "").length * 0.045) * (2.7 / wps);
    const w = { word, start: t, end: t + len };
    t += len + (/[.,!?]$/.test(word) ? 0.28 : 0.04);
    return w;
  });
};
