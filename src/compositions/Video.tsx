import { AbsoluteFill, Audio, CalculateMetadataFunction, Easing, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CapWord, WordCaptions } from "../../engine/captions/WordCaptions";
import { BIBLE } from "../../engine/characters/bible";
import { Character } from "../../engine/characters/Character";
import { Expression } from "../../engine/characters/face";
import { gesture } from "../../engine/characters/gestures";
import { mouthAt, WordTiming } from "../../engine/characters/lipsync";
import { CameraState, Vec3 } from "../../engine/cameras/CameraRig";
import { PLACES, Spot } from "../../engine/director/places";
import { ShotSpec, shotCamera } from "../../engine/director/shots";
import { ResProps, verticalSize } from "../../engine/look/units";
import { LightingPresetName, style } from "../../engine/look/style";
import { WorldShot } from "../../engine/shots/WorldShot";

// ─────────────────────────────────────────────────────────────────────────────
// Director-driven video (Phase 4). scenes.json comes from tools/build_video.py +
// tools/director.py: every beat names a PLACE, a CAST (character + spot + action)
// and gets CUTS with generic shot specs. Transitions:
//   same place  -> the camera flies to the new framing (no cut)
//   new place   -> whip (both shots slide), flash, fade (dip to black) or hard cut
// ─────────────────────────────────────────────────────────────────────────────

export type CastMember = { name: string; char: string; spot: string; do?: string; face?: Expression; pos?: Vec3; rotY?: number };
export type VCut = { start: number; end: number; shot: ShotSpec; tr: "cut" | "whip" | "flash" | "fade"; face?: Expression; do?: string };
export type VBeat = {
  id: string;
  speaker: string;
  place: string;
  preset?: LightingPresetName;
  start: number;
  end: number;
  words: WordTiming[];
  fire?: [number, number];
  smoke?: [number, number];
  state?: { doorShake?: number; doorOpen?: [number, number]; sprinkler?: number };
  extras?: boolean;
  cast: CastMember[];
  cuts: VCut[];
};
export type VideoData = { slug: string; fps: number; duration: number; beats: VBeat[]; captionWords: CapWord[] };
export type VideoProps = ResProps & { slug: string; data?: VideoData };

const WHIP = style.pacing.whipFrames;
const FLASH = style.pacing.flashFrames;
const MOVE = style.pacing.moveFrames;
const FADE = 10;

type Item = { b: VBeat; c: VCut; i: number };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: Vec3, b: Vec3, k: number): Vec3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const blendCam = (a: CameraState, b: CameraState, k: number): CameraState => ({ position: lerp3(a.position, b.position, k), target: lerp3(a.target, b.target, k), fov: lerp(a.fov, b.fov, k), roll: lerp(a.roll ?? 0, b.roll ?? 0, k) });
const swing = Easing.bezier(0.25, 0.9, 0.3, 1);
const range = (r: [number, number] | undefined, b: VBeat, abs: number) => (r ? lerp(r[0], r[1], Math.max(0, Math.min(1, (abs - b.start) / Math.max(0.1, b.end - b.start)))) : 0);

const castSpots = (b: VBeat): Record<string, Spot> => {
  const place = PLACES[b.place];
  const out: Record<string, Spot> = {};
  b.cast.forEach((m) => {
    const sp = place.spots[m.spot] ?? Object.values(place.spots)[0];
    out[m.name] = { pos: m.pos ?? sp.pos, rotY: m.rotY ?? sp.rotY };
  });
  return out;
};

const shotFor = (it: Item, t: number) => {
  const place = PLACES[it.b.place];
  return shotCamera(place, it.c.shot, castSpots(it.b), t, it.c.end - it.c.start);
};

// the 3D content of a cut at absolute time `abs`
const Scene: React.FC<{ it: Item; abs: number }> = ({ it, abs }) => {
  const { b, c } = it;
  const place = PLACES[b.place];
  const spots = castSpots(b);
  const tb = abs - b.start;
  return (
    <>
      <place.World t={abs} fire={range(b.fire, b, abs)} smoke={range(b.smoke, b, abs)} extras={b.extras !== false} doorShake={b.state?.doorShake ? Math.sin(abs * 26) * b.state.doorShake : 0} doorOpen={range(b.state?.doorOpen, b, abs)} sprinkler={b.state?.sprinkler ?? 0} />
      {b.cast.map((m) => {
        const def = BIBLE[m.char];
        if (!def) return null;
        const isSubject = c.shot.subject === m.name;
        const action = (isSubject && c.do) || m.do;
        const g = gesture(action, tb);
        const talking = m.name === b.speaker || m.char === b.speaker;
        const face = (isSubject && c.face) || m.face || "neutral";
        const idle = { bob: Math.sin(abs * 2.3 + m.name.length) * 0.01, headTilt: Math.sin(abs * 1.3) * 0.03 };
        return <Character key={m.name} def={def} expression={face} mouth={g.mouth ?? (talking ? mouthAt(b.words, abs) : "rest")} position={spots[m.name].pos} rotationY={spots[m.name].rotY} pose={{ ...idle, ...g }} />;
      })}
    </>
  );
};

const Layer: React.FC<{ it: Item; t: number; x?: number; blur?: number; id: string; camera?: CameraState; focus?: Vec3 }> = ({ it, t, x = 0, blur = 0, id, camera, focus }) => {
  const s = shotFor(it, t);
  const preset = style.lighting[it.b.preset ?? PLACES[it.b.place].preset];
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)`, filter: blur > 0.5 ? `url(#${id})` : undefined }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>
      <WorldShot preset={preset} camera={camera ?? s.camera} focus={focus ?? s.focus} focusRange={s.range} bokeh={s.bokeh}>
        <Scene it={it} abs={it.c.start + t} />
      </WorldShot>
    </AbsoluteFill>
  );
};

const CutSeq: React.FC<{ it: Item; prev?: Item }> = ({ it, prev }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const samePlace = prev && prev.b.place === it.b.place;
  const prevDur = prev ? prev.c.end - prev.c.start : 0;
  const id = `vb-${it.i}`;
  const tr = it.c.tr;

  if (samePlace && tr !== "flash" && tr !== "fade" && frame < MOVE) {
    const k = swing(Math.min(1, (frame + 1) / MOVE));
    const from = shotFor(prev!, prevDur);
    const to = shotFor(it, t);
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <Layer key="in" it={it} t={t} id={id} camera={blendCam(from.camera, to.camera, k)} focus={lerp3(from.focus, to.focus, k)} blur={(1 - k) * 10} />
      </AbsoluteFill>
    );
  }
  if (prev && !samePlace && tr === "whip" && frame < WHIP) {
    const dir = it.i % 2 === 0 ? 1 : -1;
    const k = Easing.inOut(Easing.cubic)((frame + 1) / (WHIP + 1));
    const blur = Math.sin(Math.PI * k) * 40;
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <Layer key="out" it={prev} t={prevDur + t} id={`${id}-o`} x={-dir * k * width} blur={blur} />
        <Layer key="in" it={it} t={t} id={id} x={dir * (1 - k) * width} blur={blur} />
      </AbsoluteFill>
    );
  }
  const flash = tr === "flash" && frame < FLASH ? 1 - frame / FLASH : 0;
  // fade: dip from black at the start; the outgoing shot dips to black at its own end
  const fadeIn = tr === "fade" && frame < FADE ? 1 - frame / FADE : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Layer key="in" it={it} t={t} id={id} />
      {flash > 0 && <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: flash * 0.85 }} />}
      {fadeIn > 0 && <AbsoluteFill style={{ backgroundColor: "#000", opacity: fadeIn }} />}
    </AbsoluteFill>
  );
};

export const Video: React.FC<VideoProps> = ({ slug, data }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  if (!data) return null;
  const f = (s: number) => Math.round(s * fps);
  const items: Item[] = data.beats.flatMap((b) => b.cuts.map((c) => ({ b, c, i: 0 }))).map((x, i) => ({ ...x, i }));
  // global dip-to-black before a "fade" cut (last FADE frames of the outgoing cut)
  let dip = 0;
  items.forEach((x, i) => {
    if (items[i + 1]?.c.tr !== "fade") return;
    const end = f(x.c.end);
    if (frame >= end - FADE && frame < end) dip = (frame - (end - FADE)) / FADE;
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {items.map((it, i) => {
        const from = f(it.c.start);
        const len = Math.max(1, f(it.c.end) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={len} name={`${it.b.id} ${it.b.place} ${it.c.shot.type}`}>
            <CutSeq it={it} prev={items[i - 1]} />
          </Sequence>
        );
      })}
      {dip > 0 && <AbsoluteFill style={{ backgroundColor: "#000", opacity: dip }} />}
      <WordCaptions words={data.captionWords} />
      <Audio src={staticFile(`videos/${slug}/mix.wav`)} />
    </AbsoluteFill>
  );
};

export const calculateVideoMetadata: CalculateMetadataFunction<VideoProps> = async ({ props }) => {
  const res = await fetch(staticFile(`videos/${props.slug}/scenes.json`));
  const data = (await res.json()) as VideoData;
  return { ...verticalSize(props.res), fps: data.fps, durationInFrames: Math.ceil(data.duration * data.fps), props: { ...props, data } };
};
