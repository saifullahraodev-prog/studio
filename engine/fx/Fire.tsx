import React, { useMemo } from "react";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// Fire + smoke, frame-driven (pass `t` in seconds). Stylised: stacked flame
// "tongues" (cones) that flicker in height and sway, glowing additively, plus a
// warm point light; smoke is soft dark puffs rising and growing.
// ─────────────────────────────────────────────────────────────────────────────

const n1 = (x: number) => Math.sin(x) * 0.6 + Math.sin(x * 2.3 + 1.7) * 0.3 + Math.sin(x * 5.1 + 0.3) * 0.1;

const flameGeo = new THREE.ConeGeometry(1, 1, 10, 1, true);
flameGeo.translate(0, 0.5, 0);

const FLAME_COLORS = ["#FFF2B0", "#FFC24A", "#FF7A1E", "#E2401A"];

export const Flames: React.FC<{ t: number; position?: [number, number, number]; size?: number; seed?: number; light?: boolean; intensity?: number }> = ({
  t,
  position = [0, 0, 0],
  size = 1,
  seed = 1,
  light = true,
  intensity = 1,
}) => {
  const tongues = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2 + seed;
        const r = i === 0 ? 0 : 0.18 + ((i * 37 + seed * 13) % 10) / 40;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, h: i === 0 ? 1.25 : 0.55 + ((i * 53 + seed * 7) % 10) / 18, ph: i * 1.7 + seed * 3.1, layer: i === 0 ? 1 : i % 3 === 0 ? 2 : 1 + (i % 2) };
      }),
    [seed],
  );
  const flick = 1 + n1(t * 9 + seed) * 0.15;
  return (
    <group position={position} scale={size}>
      {tongues.map((g, i) => {
        const hh = g.h * (1 + n1(t * 11 + g.ph) * 0.35) * intensity;
        const w = 0.22 + g.h * 0.12;
        return [0, 1, 2].map((L) => (
          <mesh key={`${i}-${L}`} geometry={flameGeo} position={[g.x + n1(t * 5 + g.ph) * 0.04, 0, g.z]} rotation={[n1(t * 4 + g.ph) * 0.12, 0, n1(t * 4.4 + g.ph + 2) * 0.18]} scale={[w * (1 - L * 0.28), hh * (1 - L * 0.22), w * (1 - L * 0.28)]}>
            <meshBasicMaterial color={FLAME_COLORS[Math.min(3, L + (g.layer > 1 ? 1 : 0))]} transparent opacity={0.85 - L * 0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} fog={false} />
          </mesh>
        ));
      })}
      {light && <pointLight position={[0, 0.8, 0]} color="#FF8A3A" intensity={6 * flick * intensity} distance={9 * size} decay={1.6} />}
    </group>
  );
};

const puffGeo = new THREE.IcosahedronGeometry(1, 2);

// Rising smoke column. `amount` 0..1 scales density; `spread` widens it as it rises.
export const Smoke: React.FC<{ t: number; position?: [number, number, number]; amount?: number; height?: number; spread?: number; color?: string; seed?: number }> = ({
  t,
  position = [0, 0, 0],
  amount = 1,
  height = 4,
  spread = 1.5,
  color = "#2A2522",
  seed = 1,
}) => {
  const N = 14;
  const life = 3.2;
  return (
    <group position={position}>
      {Array.from({ length: N }, (_, i) => {
        const k = ((t + (i / N) * life + seed * 0.37) % life) / life; // 0 → 1 over its life
        const y = k * height;
        const s = (0.35 + k * spread) * (0.8 + ((i * 29 + seed) % 7) / 18);
        const x = n1(i * 3.1 + seed + t * 0.6) * 0.4 * (0.3 + k);
        const z = n1(i * 1.7 + seed * 2 + t * 0.5) * 0.4 * (0.3 + k);
        const op = Math.sin(Math.PI * k) * 0.55 * amount;
        return (
          <mesh key={i} geometry={puffGeo} position={[x, y, z]} scale={s} rotation={[i, i * 2, 0]}>
            <meshStandardMaterial color={color} transparent opacity={op} depthWrite={false} roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
};

// Flat haze layer under a ceiling (rooms filling with smoke). `level` 0..1.
export const SmokeLayer: React.FC<{ t: number; y: number; size: [number, number]; level: number; color?: string }> = ({ t, y, size, level, color = "#2E2824" }) => (
  <group>
    {[0, 1, 2].map((i) => (
      <mesh key={i} position={[n1(t * 0.3 + i) * 0.5, y - i * 0.35 * level, n1(t * 0.25 + i * 2) * 0.5]} rotation={[-Math.PI / 2, 0, i * 0.7]}>
        <planeGeometry args={size} />
        <meshStandardMaterial color={color} transparent opacity={Math.min(0.9, level * (0.5 - i * 0.12))} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    ))}
  </group>
);
