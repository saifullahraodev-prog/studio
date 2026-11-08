import { loadFont } from "@remotion/google-fonts/Fredoka";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { style } from "../look/style";
import { useUnit } from "../look/units";

// Word-by-word captions (style v1.1): every spoken word pops in on its own,
// lower-middle of the frame. Emphasised words are bigger and accent-coloured.
const { fontFamily } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });

export type CapWord = { text: string; start: number; end: number; emph?: boolean };

export const WordCaptions: React.FC<{ words: CapWord[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = useUnit();
  const W = style.captions.word;
  const SA = style.captions.safeArea;
  const t = frame / fps;
  // the current word: the last one that started, held until the next starts (max `maxHold` after it ends)
  let cur: CapWord | null = null;
  for (const w of words) {
    if (w.start <= t) cur = w;
    else break;
  }
  if (!cur || t > cur.end + W.maxHold) return null;
  const age = (t - cur.start) * fps;
  const pop = spring({ frame: age, fps, config: { damping: 10, stiffness: 320, mass: 0.5 } });
  const size = cur.emph ? W.emphSize : W.size;
  const safeW = 1080 - SA.left - SA.right;
  const fit = Math.min(1, safeW / (cur.text.length * size * 0.62));
  const scale = interpolate(pop, [0, 1], [0.6, 1]);
  return (
    <AbsoluteFill style={{ fontFamily, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: u(W.centerY),
          left: u(SA.left),
          right: u(SA.right),
          textAlign: "center",
          transform: `translateY(-50%) scale(${scale}) rotate(${cur.emph ? -2 : 0}deg)`,
          color: cur.emph ? W.accent : W.color,
          fontSize: u(size * fit),
          fontWeight: W.weight,
          lineHeight: 1,
          letterSpacing: u(2),
          textTransform: "uppercase",
          WebkitTextStroke: `${u(W.stroke * fit)}px ${W.strokeColor}`,
          paintOrder: "stroke fill",
          filter: `drop-shadow(0 ${u(6)}px 0 rgba(0,0,0,0.4))`,
        }}
      >
        {cur.text}
      </div>
    </AbsoluteFill>
  );
};
