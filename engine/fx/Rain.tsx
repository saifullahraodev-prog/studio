import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";

// Cheap screen-space rain (2D streaks, frame-driven). Two layers for depth:
// far = thin & faint, near = longer & brighter.
export const Rain: React.FC<{ density?: number; angle?: number; seed?: string }> = ({ density = 1, angle = 12, seed = "rain" }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const k = height / 1920;
  const layers = [
    { n: Math.round(160 * density), len: 40, w: 1.6, speed: 70, op: 0.35 },
    { n: Math.round(60 * density), len: 90, w: 3, speed: 120, op: 0.55 },
  ];
  const rad = (angle * Math.PI) / 180;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height}>
        {layers.map((L, li) =>
          Array.from({ length: L.n }, (_, i) => {
            const x0 = random(`${seed}-${li}-x-${i}`) * (width + 400 * k) - 200 * k;
            const y0 = random(`${seed}-${li}-y-${i}`) * (height + L.len * k);
            const y = ((y0 + frame * L.speed * k) % (height + L.len * 2 * k)) - L.len * k;
            const x = x0 - Math.tan(rad) * (y - y0);
            const dx = -Math.sin(rad) * L.len * k;
            const dy = Math.cos(rad) * L.len * k;
            return <line key={`${li}-${i}`} x1={x} y1={y} x2={x + dx} y2={y + dy} stroke="#DDE6EE" strokeWidth={L.w * k} strokeLinecap="round" opacity={L.op} />;
          }),
        )}
      </svg>
    </AbsoluteFill>
  );
};
