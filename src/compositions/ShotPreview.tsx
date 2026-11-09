import { useCurrentFrame, useVideoConfig } from "remotion";
import { Expression } from "../../engine/characters/face";
import { LightingPresetName, style } from "../../engine/look/style";
import { WorldShot } from "../../engine/shots/WorldShot";
import { cutShot } from "../../engine/shots/cuts";

// Render any v2 cut template on its own (for stills / camera-grammar checks).
export type ShotPreviewProps = { res: 720 | 1080; shot: string; preset: LightingPresetName; face: Expression; do?: string };
export const ShotPreview: React.FC<ShotPreviewProps> = ({ shot, preset, face, do: action }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const s = cutShot({ beat: { id: "p", speaker: "inspector", preset, words: [], start: 0, end: 3 }, cut: { cue: "", shot, face, do: action, tr: "cut", start: 0, end: 3 }, t, dur: 3, abs: t });
  return (
    <WorldShot preset={style.lighting[preset]} camera={s.camera} focus={s.focus} focusRange={s.focusRange} bokeh={s.bokeh}>
      {s.content}
    </WorldShot>
  );
};
