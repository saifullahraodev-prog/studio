import { AbsoluteFill, Audio, CalculateMetadataFunction, Easing, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CapWord, WordCaptions } from "../../engine/captions/WordCaptions";
import { TopSubtitles } from "../../engine/captions/TopSubtitles";
import { CameraState, Vec3 } from "../../engine/cameras/CameraRig";
import { ResProps, verticalSize } from "../../engine/look/units";
import { style } from "../../engine/look/style";
import { WorldShot } from "../../engine/shots/WorldShot";
import { Cut, CutBeat, cutSet, cutShot } from "../../engine/shots/cuts";
import { keyPush } from "../../engine/cameras/moves";

// Short v2: micro-beat editing.
// - Next shot in the SAME place: no cut. The camera flies from the old framing to the new one
//   in a few frames (the "camera keeps moving" feel of the reference videos).
// - Next shot in a NEW place, tr=whip: both shots slide past each other with motion blur
//   (no black gap). tr=flash: white flash. tr=cut: smash cut (used for impacts).
type V2Beat = CutBeat & { cuts: Cut[] };
export type ShortV2Data = { slug: string; fps: number; duration: number; beats: V2Beat[]; captionWords: CapWord[] };
export type ShortV2Props = ResProps & { slug: string; data?: ShortV2Data };

const WHIP = style.pacing.whipFrames;
const FLASH = style.pacing.flashFrames;
const MOVE = style.pacing.moveFrames;

type Item = { b: V2Beat; c: Cut };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: Vec3, b: Vec3, k: number): Vec3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const blendCam = (a: CameraState, b: CameraState, k: number): CameraState => ({
  position: lerp3(a.position, b.position, k),
  target: lerp3(a.target, b.target, k),
  fov: lerp(a.fov, b.fov, k),
  roll: lerp(a.roll ?? 0, b.roll ?? 0, k),
});
// fast start, soft landing: reads as a quick camera swing that settles on the new framing
const swing = Easing.bezier(0.25, 0.9, 0.3, 1);

const CAM = (style as unknown as { camera: { keyPush: { amount: number; attack: number; release: number }; motionBlur: { threshold: number; max: number } } }).camera;
// emphasised caption words (absolute seconds) drive quick push-ins
let HITS: number[] = [];
const shotAt = ({ b, c }: Item, t: number) => {
  const s = cutShot({ beat: b, cut: c, t, dur: c.end - c.start, abs: c.start + t });
  const hits = HITS.filter((h) => h > c.start - 0.1 && h < c.end).map((h) => h - c.start);
  return { ...s, camera: keyPush(s.camera, t, hits, CAM.keyPush.amount, CAM.keyPush.attack, CAM.keyPush.release) };
};
// motion blur: how far the picture moves between frames (px at frame width), from the camera path
const motionPx = (a: CameraState, b: CameraState, width: number) => {
  const dir = (c: CameraState) => {
    const d = [c.target[0] - c.position[0], c.target[1] - c.position[1], c.target[2] - c.position[2]];
    const l = Math.hypot(d[0], d[1], d[2]) || 1;
    return [d[0] / l, d[1] / l, d[2] / l, l];
  };
  const da = dir(a);
  const db = dir(b);
  const turn = Math.acos(Math.max(-1, Math.min(1, da[0] * db[0] + da[1] * db[1] + da[2] * db[2])));
  // only SIDEWAYS camera movement smears the picture; pushing straight in (key-word push) does not
  const mv = [b.position[0] - a.position[0], b.position[1] - a.position[1], b.position[2] - a.position[2]];
  const along = mv[0] * da[0] + mv[1] * da[1] + mv[2] * da[2];
  const slide = Math.hypot(mv[0] - along * da[0], mv[1] - along * da[1], mv[2] - along * da[2]) / da[3];
  const hfov = 2 * Math.atan(Math.tan(((a.fov / 2) * Math.PI) / 180) * (9 / 16));
  return ((turn + slide * 0.6) / hfov) * width;
};

const Layer: React.FC<{ item: Item; t: number; x?: number; blur?: number; id: string; camera?: CameraState; focus?: Vec3 }> = ({ item, t, x = 0, blur: blurIn = 0, id, camera, focus }) => {
  const { width, fps } = useVideoConfig();
  const shot = shotAt(item, t);
  // fast camera / subject motion -> directional blur (sprints, falls, fast pans)
  const prev = t > 1 / fps ? shotAt(item, t - 1 / fps).camera : shot.camera;
  const px = camera ? 0 : motionPx(prev, shot.camera, width);
  const mb = Math.min(CAM.motionBlur.max * (width / 1080), Math.max(0, px - CAM.motionBlur.threshold * (width / 1080)) * 0.8);
  const blur = Math.max(blurIn, mb, (shot.motionBlur ?? 0) * (width / 1080));
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)`, filter: blur > 0.5 ? `url(#${id})` : undefined }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>
      <WorldShot preset={style.lighting[item.b.preset]} camera={camera ?? shot.camera} focus={focus ?? shot.focus} focusRange={shot.focusRange} bokeh={shot.bokeh}>
        {shot.content}
      </WorldShot>
    </AbsoluteFill>
  );
};

const CutSeq: React.FC<{ item: Item; prev?: Item; idx: number }> = ({ item, prev, idx }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const { c } = item;
  const samePlace = prev && cutSet(prev.c.shot) === cutSet(c.shot);
  const prevDur = prev ? prev.c.end - prev.c.start : 0;
  const id = `wb-${item.b.id}-${idx}`;

  // 1) same place: camera move from where the previous shot ended
  if (samePlace && c.tr !== "flash" && c.tr !== "hard" && frame < MOVE) {
    const k = swing(Math.min(1, (frame + 1) / MOVE));
    const from = shotAt(prev!, prevDur);
    const to = shotAt(item, t);
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <Layer key="in" item={item} t={t} id={id} camera={blendCam(from.camera, to.camera, k)} focus={lerp3(from.focus as Vec3, to.focus as Vec3, k)} blur={(1 - k) * 10} />
      </AbsoluteFill>
    );
  }

  // 2) new place, whip: outgoing and incoming slide together (no black between them)
  if (prev && !samePlace && c.tr === "whip" && frame < WHIP) {
    const dir = idx % 2 === 0 ? 1 : -1;
    const k = Easing.inOut(Easing.cubic)((frame + 1) / (WHIP + 1));
    const blur = Math.sin(Math.PI * k) * 40;
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <Layer key="out" item={prev} t={prevDur + t} id={`${id}-o`} x={-dir * k * width} blur={blur} />
        <Layer key="in" item={item} t={t} id={id} x={dir * (1 - k) * width} blur={blur} />
      </AbsoluteFill>
    );
  }

  const flash = c.tr === "flash" && frame < FLASH ? 1 - frame / FLASH : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Layer key="in" item={item} t={t} id={id} />
      {flash > 0 && <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: flash * 0.85 }} />}
    </AbsoluteFill>
  );
};

export const ShortV2: React.FC<ShortV2Props> = ({ slug, data }) => {
  const { fps } = useVideoConfig();
  if (!data) return null;
  HITS = data.captionWords.filter((w) => w.emph).map((w) => w.start);
  const f = (s: number) => Math.round(s * fps);
  const items: Item[] = data.beats.flatMap((b) => b.cuts.map((c) => ({ b, c })));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {items.map((it, i) => {
        const from = f(it.c.start);
        const len = Math.max(1, f(it.c.end) - from);
        return (
          <Sequence key={`${it.b.id}-${i}`} from={from} durationInFrames={len} name={`${it.b.id} ${it.c.shot}`}>
            <CutSeq item={it} prev={items[i - 1]} idx={i} />
          </Sequence>
        );
      })}
      <WordCaptions words={data.captionWords} />
      <TopSubtitles words={data.captionWords} />
      <Audio src={staticFile(`videos/${slug}/mix.wav`)} />
    </AbsoluteFill>
  );
};

export const calculateShortV2Metadata: CalculateMetadataFunction<ShortV2Props> = async ({ props }) => {
  const res = await fetch(staticFile(`videos/${slug(props)}/scenes.json`));
  const data = (await res.json()) as ShortV2Data;
  return { ...verticalSize(props.res), fps: data.fps, durationInFrames: Math.ceil(data.duration * data.fps), props: { ...props, data } };
};
const slug = (p: ShortV2Props) => p.slug;
