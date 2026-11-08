import { loadFont } from "@remotion/google-fonts/Fredoka";
import { AbsoluteFill } from "remotion";
import { useUnit } from "./units";

// Placeholder caption system (real one is built in Phase 2).
// Safe area for Shorts (design px, 1080x1920): keep text out of the top ~12%,
// the bottom ~20% (title/buttons) and the right ~12% (action buttons).
const { fontFamily } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });

export const Captions: React.FC<{
  subtitle: string;
  keyword: string;
  keywordScale?: number;
}> = ({ subtitle, keyword, keywordScale = 1 }) => {
  const u = useUnit();
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <div
        style={{
          position: "absolute",
          top: u(260),
          left: u(90),
          right: u(150),
          textAlign: "center",
          color: "white",
          fontSize: u(44),
          fontWeight: 600,
          textShadow: `0 ${u(3)}px ${u(8)}px rgba(0,0,0,0.6)`,
        }}
      >
        {subtitle}
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          textAlign: "center",
          transform: `translateY(-50%) scale(${keywordScale})`,
          color: "white",
          fontSize: u(170),
          fontWeight: 700,
          letterSpacing: u(4),
          WebkitTextStroke: `${u(14)}px #1d1d24`,
          paintOrder: "stroke fill",
        }}
      >
        {keyword}
      </div>
    </AbsoluteFill>
  );
};
