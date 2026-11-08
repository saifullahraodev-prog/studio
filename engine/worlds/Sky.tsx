import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { LightingPreset, style } from "../look/style";

// Painted sky drawn into the 3D scene's background (inside the canvas), so the
// lens blur treats it as the far distance. Later replaceable by painted /
// AI-generated backdrop images. Horizon placed where the sea horizon lands.
const SCALE = 0.5; // sky is blurred anyway: paint at half resolution

export const paintSky = (g: CanvasRenderingContext2D, w: number, h: number, preset: LightingPreset, horizonY: number, frame: number, seed = "sky") => {
  const sky = preset.sky;
  const hy = horizonY * h;
  const k = h / 1920;
  g.save();
  // the sky is always far away: pre-soften it (stronger when there is no real lens blur)
  g.filter = style.dof.mode === "off" ? "none" : `blur(${style.dof.backdropBlurPx * k * (style.dof.mode === "fake" ? 1 : 0.8)}px)`;
  g.fillStyle = preset.fog.color;
  g.fillRect(0, 0, w, h);
  const grad = g.createLinearGradient(0, 0, 0, hy);
  grad.addColorStop(0, sky.top);
  grad.addColorStop(1, sky.horizon);
  g.fillStyle = grad;
  g.fillRect(0, 0, w, Math.max(hy, 1));

  if (sky.stars) {
    for (let i = 0; i < 140; i++) {
      g.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.05 + i));
      g.fillStyle = "#FFFFFF";
      g.beginPath();
      g.arc(random(`st-x-${i}`) * w, random(`st-y-${i}`) * hy * 0.92, (0.8 + random(`st-r-${i}`) * 1.8) * k, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  }
  const moon = typeof sky.moon === "object" && sky.moon ? (sky.moon as { x: number; y: number }) : null;
  if (moon) {
    const mx = moon.x * w;
    const my = moon.y * h;
    const rg = g.createRadialGradient(mx, my, 0, mx, my, 150 * k);
    rg.addColorStop(0, "rgba(255,255,255,0.5)");
    rg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = rg;
    g.fillRect(mx - 150 * k, my - 150 * k, 300 * k, 300 * k);
    g.fillStyle = "#F4F1E4";
    g.beginPath();
    g.arc(mx, my, 46 * k, 0, Math.PI * 2);
    g.fill();
  }
  const sun = typeof sky.sun === "object" && sky.sun ? (sky.sun as { x: number; color: string; size: number }) : null;
  if (sun) {
    const sx = sun.x * w;
    const sy = hy - sun.size * 0.9 * k;
    const rg = g.createRadialGradient(sx, sy, 0, sx, sy, sun.size * 4 * k);
    rg.addColorStop(0, "rgba(255,255,255,1)");
    rg.addColorStop(0.25, sun.color);
    rg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = rg;
    g.fillRect(sx - sun.size * 4 * k, sy - sun.size * 4 * k, sun.size * 8 * k, sun.size * 8 * k);
  }
  const storm = preset.rain;
  const drift = frame * 0.25 * k;
  const n = storm ? 14 : 7;
  for (let i = 0; i < n; i++) {
    const r = (m: number) => random(`${seed}-${i}-${m}`);
    const x = (r(1) * 1.4 - 0.2) * w + drift * (0.5 + r(4));
    const y = hy * (storm ? 0.1 + r(2) * 0.85 : 0.15 + r(2) * 0.7);
    const s = (storm ? 2.2 + r(3) * 1.8 : 0.9 + r(3) * 1.3) * k * (0.6 + 0.4 * (1 - r(2)));
    g.globalAlpha = sky.cloudOpacity;
    g.fillStyle = sky.clouds;
    for (const [cx, cy, rx, ry] of [
      [0, 0, 120, 34],
      [-55, -18, 58, 40],
      [20, -34, 66, 52],
      [80, -12, 48, 32],
    ]) {
      g.beginPath();
      g.ellipse(x + cx * s, y + cy * s, rx * s, ry * s, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = sky.cloudOpacity * (storm ? 0.18 : 0.12);
    g.fillStyle = storm ? "#000000" : "#7A8CA0";
    g.beginPath();
    g.ellipse(x, y + 18 * s, 118 * s, 14 * s, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 0.55;
  g.fillStyle = preset.fog.color;
  g.fillRect(0, hy - 60 * k, w, 60 * k);
  g.restore();
};

export const SkyBackground: React.FC<{ preset: LightingPreset; horizonY: number }> = ({ preset, horizonY }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const scene = useThree((s) => s.scene);
  const { canvas, tex } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = Math.round(width * SCALE);
    c.height = Math.round(height * SCALE);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return { canvas: c, tex: t };
  }, [width, height]);
  useLayoutEffect(() => {
    paintSky(canvas.getContext("2d")!, canvas.width, canvas.height, preset, horizonY, frame);
    tex.needsUpdate = true;
    scene.background = tex;
  });
  return null;
};
