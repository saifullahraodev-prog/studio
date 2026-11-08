import { AbsoluteFill, Audio, CalculateMetadataFunction, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions, CaptionBeat } from "../../engine/captions/Captions";
import { ResProps, verticalSize } from "../../engine/look/units";
import { style } from "../../engine/look/style";
import { WorldShot } from "../../engine/shots/WorldShot";
import { Beat, shotFor } from "../../engine/shots/templates";

// A full Short, driven entirely by data: public/videos/<slug>/scenes.json (built from
// the video's scenes.txt by tools/build_video.py) + mix.wav.
export type ShortData = { slug: string; fps: number; duration: number; beats: Beat[] };
export type ShortProps = ResProps & { slug: string; data?: ShortData };

const ShotSeq: React.FC<{ beat: Beat }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = shotFor({ beat, t, dur: beat.end - beat.start, abs: beat.start + t });
  return (
    <WorldShot preset={style.lighting[beat.preset]} camera={shot.camera} focus={shot.focus} focusRange={shot.focusRange} bokeh={shot.bokeh}>
      {shot.content}
    </WorldShot>
  );
};

export const Short: React.FC<ShortProps> = ({ slug, data }) => {
  const { fps } = useVideoConfig();
  if (!data) return null;
  const f = (s: number) => Math.round(s * fps);
  const caps: CaptionBeat[] = data.beats.map((b) => ({ subtitle: b.subtitle, keyword: b.keyword, from: f(b.start), to: f(b.end), keywordFrom: f(b.cueAt) }));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {data.beats.map((b) => (
        <Sequence key={b.id} from={f(b.start)} durationInFrames={Math.max(1, f(b.end) - f(b.start))} name={`${b.id} ${b.shot}`}>
          <ShotSeq beat={b} />
        </Sequence>
      ))}
      <Captions beats={caps} />
      <Audio src={staticFile(`videos/${slug}/mix.wav`)} />
    </AbsoluteFill>
  );
};

export const calculateShortMetadata: CalculateMetadataFunction<ShortProps> = async ({ props }) => {
  const res = await fetch(staticFile(`videos/${props.slug}/scenes.json`));
  const data = (await res.json()) as ShortData;
  return {
    ...verticalSize(props.res),
    fps: data.fps,
    durationInFrames: Math.ceil(data.duration * data.fps),
    props: { ...props, data },
  };
};
