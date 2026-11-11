import React from "react";
import { AbsoluteFill, Audio, CalculateMetadataFunction, OffthreadVideo, staticFile } from "remotion";
import { WordCaptions } from "../../engine/captions/WordCaptions";
import { TopSubtitles } from "../../engine/captions/TopSubtitles";
import { verticalSize } from "../../engine/look/units";
import type { ShortV2Data } from "./ShortV2";

// Production bridge (owner decision 2026-11-12: render in Blender). The picture is the Blender render
// (public/videos/<slug>/blender.mp4, made by blender/render_video.py from the same scenes.json cut
// timings); this composition only adds what Remotion already does well: the word captions, the top
// subtitles and the sound mix (voice + music + effects).
export type BlenderShortProps = { slug: string; res: 720 | 1080; data?: ShortV2Data };

export const BlenderShort: React.FC<BlenderShortProps> = ({ slug, data }) => {
  if (!data) return null;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo src={staticFile(`videos/${slug}/blender.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <WordCaptions words={data.captionWords} />
      <TopSubtitles words={data.captionWords} />
      <Audio src={staticFile(`videos/${slug}/mix.wav`)} />
    </AbsoluteFill>
  );
};

export const calculateBlenderShortMetadata: CalculateMetadataFunction<BlenderShortProps> = async ({ props }) => {
  const res = await fetch(staticFile(`videos/${props.slug}/scenes.json`));
  const data = (await res.json()) as ShortV2Data;
  return { ...verticalSize(props.res), fps: data.fps, durationInFrames: Math.ceil(data.duration * data.fps), props: { ...props, data } };
};
