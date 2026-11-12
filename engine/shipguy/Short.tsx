// The Ship Guy: vertical Short (1080x1920) built from a span of long-form beats (public/shipguy/<slug>/short.json).
// Layout: blurred full-bleed copy of the scene behind, the scene itself large in the middle, title band on top,
// word-by-word captions below the scene (inside the Shorts safe area: clear of the bottom UI and right-side buttons).
import React from "react";
import { AbsoluteFill, Audio, CalculateMetadataFunction, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { INK } from "./art";
import { fontFamily } from "./scenes";
import { Beat, BeatView } from "./Video";

type Word = { w: string; s: number; e: number };
export type ShortProps = { slug: string; beats?: Beat[]; words?: Word[]; title?: string };

export const calcShipGuyShort: CalculateMetadataFunction<ShortProps> = async ({ props }) => {
  const res = await fetch(staticFile(`shipguy/${props.slug}/short.json`));
  const d = (await res.json()) as { frames: number; beats: Beat[]; words: Word[] };
  return { durationInFrames: d.frames, props: { ...props, beats: d.beats, words: d.words } };
};

// how big each kind of scene is shown (1 = full 16:9 width fits the phone width) and where to centre it
const FRAME: Record<string, { zoom: number; fx: number }> = {
  attack: { zoom: 1.45, fx: 0.5 },
  sea: { zoom: 1.75, fx: 0.48 },
  upright: { zoom: 1.0, fx: 0.5 },
  gates: { zoom: 1.08, fx: 0.5 },
  stopping: { zoom: 1.2, fx: 0.5 },
  names: { zoom: 1.0, fx: 0.5 },
  talk: { zoom: 1.9, fx: 0.5 },
};
const CENTER_Y = 930;

const ShortShot: React.FC<{ b: Beat }> = ({ b }) => {
  const t = useCurrentFrame();
  const f = FRAME[b.tpl] ?? { zoom: 1.3, fx: 0.5 };
  const s = (1080 * f.zoom) / 1920;
  const h = 1080 * s;
  const left = 540 - 1920 * s * f.fx;
  const k = interpolate(t, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      {/* blurred full-bleed background */}
      <div style={{ position: "absolute", left: 540 - 1920 * 1.78 * f.fx, top: 0, width: 1920, height: 1080, transform: "scale(1.78)", transformOrigin: "0 0", filter: "blur(28px) brightness(0.55)" }}>
        <BeatView b={{ ...b, cap: "" }} t={t} />
      </div>
      {/* the scene */}
      <div style={{ position: "absolute", left: 0, top: CENTER_Y - h / 2, width: 1080, height: h, overflow: "hidden", opacity: 0.4 + 0.6 * k,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)", borderTop: `6px solid ${INK}`, borderBottom: `6px solid ${INK}` }}>
        <div style={{ position: "absolute", left, top: 0, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: "0 0" }}>
          <BeatView b={b} t={t} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Word-by-word captions: chunks of up to 3 words (break at punctuation), current word yellow. */
const Captions: React.FC<{ words: Word[] }> = ({ words }) => {
  const t = useCurrentFrame() / 30;
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    const len = cur.map((x) => x.w).join(" ").length;
    if (cur.length >= 3 || len > 16 || /[.,?!]$/.test(w.w)) { chunks.push(cur); cur = []; }
  }
  if (cur.length) chunks.push(cur);
  const i = chunks.findIndex((c, j) => t >= c[0].s - 0.05 && (j + 1 >= chunks.length || t < chunks[j + 1][0].s - 0.05));
  if (i < 0) return null;
  const c = chunks[i];
  const pop = interpolate(t - c[0].s, [0, 0.08], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 60, right: 140, top: 1290, textAlign: "center", transform: `scale(${pop})` }}>
      {c.map((w, j) => {
        const on = t >= w.s - 0.03 && t < (c[j + 1]?.s ?? w.e + 0.4);
        return (
          <span key={j} style={{ fontFamily, fontWeight: 700, fontSize: 104, lineHeight: 1.1, margin: "0 12px", display: "inline-block",
            color: on ? "#ffd23f" : "#ffffff", WebkitTextStroke: `16px ${INK}`, paintOrder: "stroke fill", textShadow: `0 8px 0 ${INK}`,
            transform: on ? "scale(1.08)" : undefined }}>
            {w.w.replace(/[,]$/, "").toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};

export const ShipGuyShort: React.FC<ShortProps> = ({ slug, beats = [], words = [], title = "THE BIGGEST SHIP|EVER BUILT" }) => (
  <AbsoluteFill style={{ background: "#0d1626" }}>
    {beats.map((b, i) => (
      <Sequence key={i} from={b.from} durationInFrames={b.dur} premountFor={15}>
        <ShortShot b={b} />
      </Sequence>
    ))}
    {/* title band */}
    <div style={{ position: "absolute", left: 40, right: 40, top: 170, textAlign: "center", lineHeight: 1.0 }}>
      {title.split("|").map((l, i) => (
        <div key={i} style={{ fontFamily, fontWeight: 700, fontSize: i === 0 ? 92 : 112, color: i === 0 ? "#ffffff" : "#ffd23f",
          WebkitTextStroke: `14px ${INK}`, paintOrder: "stroke fill", textShadow: `0 7px 0 ${INK}` }}>{l}</div>
      ))}
    </div>
    <Captions words={words} />
    <Audio src={staticFile(`shipguy/${slug}/short.wav`)} />
  </AbsoluteFill>
);
