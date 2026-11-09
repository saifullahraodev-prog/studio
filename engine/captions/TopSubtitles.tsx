import { loadFont } from "@remotion/google-fonts/Fredoka";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { style } from "../look/style";
import { useUnit } from "../look/units";
import { CapWord } from "./WordCaptions";

// Revision 2, task 5: small sentence subtitle near the top (white on a soft dark box), synced to
// the voice, for muted viewers. Lines are built from the word timings: a new line starts after a
// sentence/comma break or a pause, and no line is longer than ~32 characters / 7 words.
// Sits inside the Shorts safe area (style.captions.subtitle / safeArea); the big centre keyword stays.
const { fontFamily } = loadFont("normal", { weights: ["600"], subsets: ["latin"] });

type Line = { text: string; start: number; end: number };
export const subtitleLines = (words: CapWord[], maxChars = 32, maxWords = 7): Line[] => {
  const lines: Line[] = [];
  let cur: CapWord[] = [];
  const flush = () => {
    if (cur.length) lines.push({ text: cur.map((w) => w.text).join(" "), start: cur[0].start, end: cur[cur.length - 1].end });
    cur = [];
  };
  words.forEach((w, i) => {
    const len = cur.reduce((n, x) => n + x.text.length + 1, 0) + w.text.length;
    if (cur.length && (len > maxChars || cur.length >= maxWords)) flush();
    cur.push(w);
    const next = words[i + 1];
    const brk = w.brk || /[?!.,]$/.test(w.text) || !next || next.start - w.end > 0.28;
    if (brk) flush();
  });
  flush();
  return lines;
};

export const TopSubtitles: React.FC<{ words: CapWord[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = useUnit();
  const S = style.captions.subtitle;
  const t = frame / fps;
  const lines = subtitleLines(words);
  const i = lines.findIndex((l, k) => t >= l.start - 0.08 && t < (lines[k + 1]?.start ?? l.end + 0.6) - 0.08);
  if (i < 0) return null;
  const l = lines[i];
  if (t > l.end + 0.6) return null;
  const fade = interpolate(t, [l.start - 0.08, l.start + 0.02], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: u(S.top), left: u(S.sidePad), right: u(S.rightPad), display: "flex", justifyContent: "center", opacity: fade }}>
        <div
          style={{
            fontFamily,
            fontWeight: S.weight,
            fontSize: u(S.size),
            lineHeight: 1.2,
            color: "#FFFFFF",
            background: "rgba(12,12,16,0.58)",
            padding: `${u(10)}px ${u(22)}px`,
            borderRadius: u(16),
            textAlign: "center",
          }}
        >
          {l.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
