// The Ship Guy: full long-form video (16:9) built from public/shipguy/<slug>/timeline.json.
import React from "react";
import { AbsoluteFill, Audio, CalculateMetadataFunction, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { INK } from "./art";
import { Caption, ramp } from "./scenes";
import { P, TEMPLATES } from "./templates";
import { CornerGuy } from "./templates3";

export type Beat = { tpl: string; p: P; cap: string; from: number; dur: number; say?: string; words?: number[][] };
export type ShipGuyProps = { slug: string; beats?: Beat[]; music?: string; page?: number };

export const calcShipGuy: CalculateMetadataFunction<ShipGuyProps> = async ({ props }) => {
  const res = await fetch(staticFile(`shipguy/${props.slug}/timeline.json`));
  const tl = (await res.json()) as { frames: number; beats: Beat[] };
  return { durationInFrames: tl.frames, props: { ...props, beats: tl.beats } };
};

export const BeatView: React.FC<{ b: Beat; t: number }> = ({ b, t }) => {
  const T = TEMPLATES[b.tpl];
  if (!T) return <AbsoluteFill style={{ background: "#c33", color: "#fff", fontSize: 60 }}>missing template {b.tpl}</AbsoluteFill>;
  // every shot drifts slowly for its whole length, so no scene ever reads as a frozen frame
  const k = t / Math.max(1, b.dur);
  const drift = { transform: `scale(${1 + 0.045 * k}) translateX(${(k - 0.5) * -14}px)`, transformOrigin: "50% 45%" };
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={drift}><T t={t} d={b.dur} p={b.p} w={b.words} /></AbsoluteFill>
      {b.p.corner && <CornerGuy t={t} d={b.dur} act={b.p.corner} />}
      {b.cap && <Caption text={b.cap} y={46} size={96} pop={ramp(t, 3, 11)} />}
    </AbsoluteFill>
  );
};

const Shot: React.FC<{ b: Beat }> = ({ b }) => {
  const t = useCurrentFrame();
  // quick whip-in: slide + fade over 6 frames so cuts feel lively, not abrupt
  const k = interpolate(t, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: 0.4 + 0.6 * k, transform: `translateX(${(1 - k) * 80}px) scale(${1.02 - 0.02 * k})` }}>
      <BeatView b={b} t={t} />
    </AbsoluteFill>
  );
};

export const ShipGuyVideo: React.FC<ShipGuyProps> = ({ slug, beats = [], music }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {beats.map((b, i) => (
      <Sequence key={i} from={b.from} durationInFrames={b.dur} premountFor={15}>
        <Shot b={b} />
      </Sequence>
    ))}
    {/* mix.wav = voice + music + sound effects (tools/shipguy_mix.py) */}
    <Audio src={staticFile(`shipguy/${slug}/mix.wav`)} />
    {music && <Audio src={staticFile(music)} volume={0.12} loop />}
  </AbsoluteFill>
);

/** Storyboard: 16 beats per page (4x4), each drawn at the middle of its beat. */
export const ShipGuyBoard: React.FC<ShipGuyProps> = ({ beats = [], page = 0 }) => {
  const list = beats.slice(page * 16, page * 16 + 16);
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      {list.map((b, i) => {
        const x = (i % 4) * 480, y = Math.floor(i / 4) * 270;
        const n = page * 16 + i + 1;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 1920, height: 1080, transform: "scale(0.25)", transformOrigin: "0 0", overflow: "hidden", outline: `8px solid ${INK}` }}>
            <BeatView b={b} t={Math.round(b.dur * 0.6)} />
            <div style={{ position: "absolute", left: 20, bottom: 20, background: "rgba(0,0,0,0.75)", color: "#fff", fontSize: 64, padding: "6px 24px", borderRadius: 12, fontFamily: "sans-serif" }}>
              {n} · {(b.from / 30).toFixed(0)}s
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
