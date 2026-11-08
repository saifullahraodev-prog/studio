import { loadFont } from "@remotion/google-fonts/Fredoka";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { style } from "../look/style";
import { useUnit } from "../look/units";

// Caption system (style direction F):
//  - small sentence subtitle near the top
//  - one huge punchy keyword per beat in the centre (white, dark outline)
// All positions are design px on a 1080x1920 frame; everything stays inside the
// Shorts safe area (style.captions.safeArea).
const { fontFamily } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });
const C = style.captions;

export type CaptionBeat = {
  subtitle?: string;
  keyword?: string;
  from: number; // frame the beat starts (relative to this layer)
  to: number; // frame the beat ends
};

const Subtitle: React.FC<{ text: string; age: number; left: number }> = ({ text, age, left }) => {
  const u = useUnit();
  const fadeIn = interpolate(age, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(left, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: u(C.subtitle.top),
        left: u(C.subtitle.sidePad),
        right: u(C.subtitle.rightPad),
        textAlign: "center",
        color: "#FFFFFF",
        fontSize: u(C.subtitle.size),
        fontWeight: C.subtitle.weight,
        lineHeight: 1.18,
        opacity: Math.min(fadeIn, fadeOut),
        transform: `translateY(${u((1 - fadeIn) * 10)}px)`,
        textShadow: `0 ${u(2)}px ${u(2)}px rgba(0,0,0,0.65), 0 0 ${u(14)}px rgba(0,0,0,0.45)`,
      }}
    >
      {text}
    </div>
  );
};

const Keyword: React.FC<{ text: string; age: number; left: number }> = ({ text, age, left }) => {
  const u = useUnit();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: age, fps, config: { damping: 11, stiffness: 220, mass: 0.6 } });
  const out = interpolate(left, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(pop, [0, 1], [0.55, 1]) * interpolate(out, [0, 1], [0.85, 1]);
  // shrink long words so they always fit inside the safe width
  const safeW = 1080 - C.safeArea.left - C.safeArea.right;
  const approxW = text.length * C.keyword.size * 0.62;
  const fit = Math.min(1, safeW / approxW);
  return (
    <div
      style={{
        position: "absolute",
        top: u(C.keyword.centerY),
        left: u(C.safeArea.left),
        right: u(C.safeArea.right),
        textAlign: "center",
        transform: `translateY(-50%) scale(${scale}) rotate(${interpolate(pop, [0, 1], [-4, -1.5])}deg)`,
        opacity: Math.min(pop * 1.4, out),
        color: C.keyword.color,
        fontSize: u(C.keyword.size * fit),
        fontWeight: C.keyword.weight,
        letterSpacing: u(3),
        lineHeight: 1,
        WebkitTextStroke: `${u(C.keyword.stroke * fit)}px ${C.keyword.strokeColor}`,
        paintOrder: "stroke fill",
        filter: `drop-shadow(0 ${u(8)}px 0 rgba(0,0,0,0.35))`,
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );
};

export const SafeAreaGuide: React.FC = () => {
  const u = useUnit();
  const s = C.safeArea;
  const band = "rgba(255,40,80,0.28)";
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: u(s.top), background: band }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: u(s.bottom), background: band }} />
      <div style={{ position: "absolute", left: 0, top: u(s.top), bottom: u(s.bottom), width: u(s.left), background: band }} />
      <div style={{ position: "absolute", right: 0, top: u(s.top), bottom: u(s.bottom), width: u(s.right), background: band }} />
    </AbsoluteFill>
  );
};

// Render a list of beats. Use inside a <Sequence> or at composition root.
export const Captions: React.FC<{ beats: CaptionBeat[]; showSafeArea?: boolean }> = ({ beats, showSafeArea }) => {
  const frame = useCurrentFrame();
  const beat = beats.find((b) => frame >= b.from && frame < b.to);
  return (
    <AbsoluteFill style={{ fontFamily, pointerEvents: "none" }}>
      {beat?.subtitle && <Subtitle text={beat.subtitle} age={frame - beat.from} left={beat.to - frame} />}
      {beat?.keyword && <Keyword text={beat.keyword} age={frame - beat.from} left={beat.to - frame} />}
      {showSafeArea && <SafeAreaGuide />}
    </AbsoluteFill>
  );
};
