import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { LightingPreset, style } from "../look/style";

// Far background: a painted 2D sky layer behind the (transparent) 3D canvas.
// Later this can be swapped for painted / AI-generated backdrop images; the
// horizon line is placed where the 3D sea horizon lands (horizonY, 0..1).
// Fake depth of field = blurring this layer (cheap, switchable in the style file).

type Props = { preset: LightingPreset; horizonY: number; seed?: string; blur?: boolean };

const Cloud: React.FC<{ x: number; y: number; s: number; color: string; opacity: number; dark?: boolean }> = ({ x, y, s, color, opacity, dark }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <ellipse cx={0} cy={0} rx={120} ry={34} fill={color} />
    <ellipse cx={-55} cy={-18} rx={58} ry={40} fill={color} />
    <ellipse cx={20} cy={-34} rx={66} ry={52} fill={color} />
    <ellipse cx={80} cy={-12} rx={48} ry={32} fill={color} />
    {/* soft underside shade */}
    <ellipse cx={0} cy={18} rx={118} ry={14} fill={dark ? "#000000" : "#7A8CA0"} opacity={dark ? 0.18 : 0.12} />
  </g>
);

export const Backdrop: React.FC<Props> = ({ preset, horizonY, seed = "sky", blur = true }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const sky = preset.sky;
  const hy = horizonY * height;
  const k = height / 1920;
  const drift = frame * 0.25 * k;
  const blurPx = blur && style.dof.mode === "fake" ? style.dof.backdropBlurPx * k : 0;
  const storm = preset.rain;
  const moon = typeof sky.moon === "object" && sky.moon ? (sky.moon as { x: number; y: number }) : null;
  const sun = typeof sky.sun === "object" && sky.sun ? (sky.sun as { x: number; color: string; size: number }) : null;

  const clouds = Array.from({ length: storm ? 14 : 7 }, (_, i) => {
    const r = (n: number) => random(`${seed}-${i}-${n}`);
    return {
      x: (r(1) * 1.4 - 0.2) * width + drift * (0.5 + r(4)),
      y: hy * (storm ? 0.1 + r(2) * 0.85 : 0.15 + r(2) * 0.7),
      s: (storm ? 2.2 + r(3) * 1.8 : 0.9 + r(3) * 1.3) * k * (0.6 + 0.4 * (1 - r(2))),
    };
  });
  const stars = sky.stars
    ? Array.from({ length: 140 }, (_, i) => ({
        x: random(`st-x-${i}`) * width,
        y: random(`st-y-${i}`) * hy * 0.92,
        r: (0.8 + random(`st-r-${i}`) * 1.8) * k,
        o: 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.05 + i)),
      }))
    : [];

  return (
    <AbsoluteFill style={{ filter: blurPx ? `blur(${blurPx}px)` : undefined, transform: blurPx ? "scale(1.03)" : undefined }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="skyg" x1="0" y1="0" x2="0" y2={hy} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={sky.top} />
            <stop offset="1" stopColor={sky.horizon} />
          </linearGradient>
          <radialGradient id="sung">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={1} />
            <stop offset="0.25" stopColor={sun?.color ?? "#FFF"} stopOpacity={0.95} />
            <stop offset="1" stopColor={sun?.color ?? "#FFF"} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="moong">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.5} />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={width} height={height} fill={preset.fog.color} />
        <rect x={0} y={0} width={width} height={hy} fill="url(#skyg)" />
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" opacity={s.o} />
        ))}
        {moon && (
          <g>
            <circle cx={moon.x * width} cy={moon.y * height} r={150 * k} fill="url(#moong)" />
            <circle cx={moon.x * width} cy={moon.y * height} r={46 * k} fill="#F4F1E4" />
            <circle cx={moon.x * width - 12 * k} cy={moon.y * height - 8 * k} r={9 * k} fill="#DCD8C8" />
            <circle cx={moon.x * width + 14 * k} cy={moon.y * height + 12 * k} r={6 * k} fill="#DCD8C8" />
          </g>
        )}
        {sun && (
          <g>
            <circle cx={sun.x * width} cy={hy - sun.size * 0.9 * k} r={sun.size * 4 * k} fill="url(#sung)" />
            <circle cx={sun.x * width} cy={hy - sun.size * 0.9 * k} r={sun.size * 0.75 * k} fill="#FFF6DA" />
          </g>
        )}
        {clouds.map((c, i) => (
          <Cloud key={i} x={c.x} y={c.y} s={c.s} color={sky.clouds} opacity={sky.cloudOpacity} dark={storm} />
        ))}
        {/* atmospheric haze band at the horizon */}
        <rect x={0} y={hy - 60 * k} width={width} height={60 * k} fill={preset.fog.color} opacity={0.55} />
      </svg>
    </AbsoluteFill>
  );
};
