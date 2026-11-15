// How We Ended Up · data-driven video: a list of scenes (template + duration + data) joined by the fixed transitions.
// Composition "HowVideo" (16:9; drawn in 1920x1080 design units, scales to any output size, e.g. --width=1280 --height=720). Props: { scenes } (see demo-scenes.json). Only these transitions exist:
//   cut · dolly (sideways slide past a pillar, next bay) · door (push into a doorway, aged-paper wash, into the next room)
// The other two signature transitions live inside templates: frame push (map) and lights down (reveal); card flip = cardFlip.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { H, MapCat, Pillar, T, W } from "./kit";
import { easeInOut, TIMING } from "./motion";
import { TEMPLATES, TemplateId } from "./templates";

export type SceneIn = "cut" | "dolly" | "door";
export type Scene = { t: TemplateId; dur: number; in?: SceneIn; p: Record<string, unknown> };
export type HowVideoProps = { scenes: Scene[]; cats?: Record<string, Record<string, MapCat>> };

const tLen = (s: SceneIn | undefined) => (s === "dolly" ? TIMING.dolly : s === "door" ? TIMING.door : 0);

/** Start frame of every scene + total length (transitions overlap the end of the previous scene). */
export const timeline = (scenes: Scene[]) => {
  const starts: number[] = [];
  let t = 0;
  scenes.forEach((s, i) => {
    if (i > 0) t -= tLen(s.in);
    starts.push(t);
    t += s.dur;
  });
  return { starts, total: Math.max(1, t) };
};
export const howVideoLength = (scenes: Scene[]) => timeline(scenes).total;

const SceneView: React.FC<{ s: Scene; i: number; f: number; cats?: HowVideoProps["cats"] }> = ({ s, i, f, cats }) => {
  const C = TEMPLATES[s.t] as React.FC<Record<string, unknown>>;
  const p = { ...s.p };
  if (typeof p.cats === "string" && p.cats.startsWith("@")) p.cats = cats?.[p.cats.slice(1)] ?? {};
  return <C {...p} uid={`s${i}`} f={f} dur={s.dur} />;
};

export const HowVideo: React.FC<HowVideoProps> = ({ scenes, cats }) => {
  const F = useCurrentFrame();
  const { starts } = timeline(scenes);
  // last scene that has started
  let i = 0;
  for (let k = 0; k < scenes.length; k++) if (F >= starts[k]) i = k;
  const cur = scenes[i];
  const fc = F - starts[i];
  const T_in = tLen(cur.in);
  const inTrans = i > 0 && fc < T_in;
  let body: React.ReactNode;
  if (!inTrans) {
    body = <SceneView s={cur} i={i} f={fc} cats={cats} />;
  } else {
    const prev = scenes[i - 1], fp = F - starts[i - 1];
    const e = easeInOut(fc / T_in);
    if (cur.in === "dolly") {
      body = (
        <g>
          <g transform={`translate(${-W * e} 0)`}><SceneView s={prev} i={i - 1} f={fp} cats={cats} /></g>
          <g transform={`translate(${W * (1 - e)} 0)`}><SceneView s={cur} i={i} f={fc} cats={cats} /></g>
          <Pillar x={W * (1 - e)} floorY={H} />
        </g>
      );
    } else {
      // door: push into the previous scene centre while an aged-paper wash rises, then the next room appears through it
      const half = fc / T_in < 0.5;
      const w = half ? easeInOut((fc / T_in) * 2) : 1 - easeInOut((fc / T_in - 0.5) * 2);
      body = half ? (
        <g>
          <g transform={`translate(${W / 2} ${H / 2}) scale(${1 + 0.5 * e}) translate(${-W / 2} ${-H / 2})`}><SceneView s={prev} i={i - 1} f={fp} cats={cats} /></g>
          <rect width={W} height={H} fill={T.thenPaper} opacity={w} />
        </g>
      ) : (
        <g>
          <SceneView s={cur} i={i} f={fc} cats={cats} />
          <rect width={W} height={H} fill={T.thenPaper} opacity={w} />
        </g>
      );
    }
  }
  return (
    <AbsoluteFill style={{ background: T.wall }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>{body}</svg>
    </AbsoluteFill>
  );
};
