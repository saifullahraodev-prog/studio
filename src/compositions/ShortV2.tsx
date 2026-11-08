import { AbsoluteFill, Audio, CalculateMetadataFunction, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CapWord, WordCaptions } from "../../engine/captions/WordCaptions";
import { ResProps, verticalSize } from "../../engine/look/units";
import { style } from "../../engine/look/style";
import { WorldShot } from "../../engine/shots/WorldShot";
import { Cut, CutBeat, cutShot } from "../../engine/shots/cuts";

// Short v2: micro-beat editing. Every cut is its own sequence; whip pans slide +
// motion-blur across the cut, flashes punch in white. Word-by-word captions.
type V2Beat = CutBeat & { cuts: Cut[] };
export type ShortV2Data = { slug: string; fps: number; duration: number; beats: V2Beat[]; captionWords: CapWord[] };
export type ShortV2Props = ResProps & { slug: string; data?: ShortV2Data };

const WHIP = style.pacing.whipFrames;
const FLASH = style.pacing.flashFrames;

const CutSeq: React.FC<{ beat: V2Beat; cut: Cut; nextTr?: string; idx: number; len: number }> = ({ beat, cut, nextTr, idx, len }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const shot = cutShot({ beat, cut, t, dur: cut.end - cut.start, abs: cut.start + t });
  // whip in (first frames) / whip out (last frames): slide sideways with horizontal blur
  const dir = idx % 2 === 0 ? 1 : -1;
  let x = 0;
  let blur = 0;
  if (cut.tr === "whip" && frame < WHIP) {
    const k = 1 - frame / WHIP;
    x = dir * k * k * width * 0.55;
    blur = k * 48;
  }
  if (nextTr === "whip" && frame >= len - WHIP) {
    const k = (frame - (len - WHIP) + 1) / WHIP;
    x = -dir * k * k * width * 0.55;
    blur = Math.max(blur, k * 48);
  }
  const flash = cut.tr === "flash" && frame < FLASH ? 1 - frame / FLASH : 0;
  const fid = `wb-${beat.id}-${idx}`;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={fid} x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translateX(${x}px)`, filter: blur > 0.5 ? `url(#${fid})` : undefined }}>
        <WorldShot preset={style.lighting[beat.preset]} camera={shot.camera} focus={shot.focus} focusRange={shot.focusRange} bokeh={shot.bokeh}>
          {shot.content}
        </WorldShot>
      </AbsoluteFill>
      {flash > 0 && <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: flash * 0.85 }} />}
    </AbsoluteFill>
  );
};

export const ShortV2: React.FC<ShortV2Props> = ({ slug, data }) => {
  const { fps } = useVideoConfig();
  if (!data) return null;
  const f = (s: number) => Math.round(s * fps);
  const cuts = data.beats.flatMap((b) => b.cuts.map((c) => ({ b, c })));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {cuts.map(({ b, c }, i) => {
        const from = f(c.start);
        const len = Math.max(1, f(c.end) - from);
        return (
          <Sequence key={`${b.id}-${i}`} from={from} durationInFrames={len} name={`${b.id} ${c.shot}`}>
            <CutSeq beat={b} cut={c} nextTr={cuts[i + 1]?.c.tr} idx={i} len={len} />
          </Sequence>
        );
      })}
      <WordCaptions words={data.captionWords} />
      <Audio src={staticFile(`videos/${slug}/mix.wav`)} />
    </AbsoluteFill>
  );
};

export const calculateShortV2Metadata: CalculateMetadataFunction<ShortV2Props> = async ({ props }) => {
  const res = await fetch(staticFile(`videos/${props.slug}/scenes.json`));
  const data = (await res.json()) as ShortV2Data;
  return { ...verticalSize(props.res), fps: data.fps, durationInFrames: Math.ceil(data.duration * data.fps), props: { ...props, data } };
};
