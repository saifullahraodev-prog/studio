import React from "react";
import * as THREE from "three";
import { Real } from "../look/materials";
import { Toon } from "../look/style";

// Props for action shots (review 2 demo): a wooden lifeboat at deck level, and a distress
// rocket flare that streaks up and bursts. All frame-driven (pass t, seconds).

// open wooden lifeboat; origin at the gunwale centre, length along Z
export const DeckBoat: React.FC<{ position?: [number, number, number]; rotationY?: number; scale?: number; falls?: boolean; children?: React.ReactNode }> = ({ position, rotationY = 0, scale = 1, falls = true, children }) => (
  <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
    <mesh rotation={[Math.PI, 0, 0]} scale={[1.05, 0.62, 3.0]} castShadow receiveShadow>
      <sphereGeometry args={[1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <Real tex="PaintedMetal004" gray tint="#EFE9DC" repeat={[2, 1]} side={THREE.DoubleSide} />
    </mesh>
    {/* gunwale rail */}
    <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1.06, 3.02, 1]}>
      <torusGeometry args={[1, 0.05, 6, 40]} />
      <Real tex="Planks037A" tint="#A07850" repeat={[6, 0.2]} />
    </mesh>
    {/* thwarts (seats) */}
    {[-1.6, -0.5, 0.6, 1.6].map((z) => (
      <mesh key={z} position={[0, -0.22, z]} castShadow>
        <boxGeometry args={[1.7, 0.06, 0.24]} />
        <Real tex="Planks037A" tint="#B08A60" repeat={[1, 0.3]} />
      </mesh>
    ))}
    {/* falls (ropes) up to the davits */}
    {falls && [-2.3, 2.3].map((z) => (
      <mesh key={`r${z}`} position={[0, 2.2, z]}>
        <cylinderGeometry args={[0.018, 0.018, 4.4, 6]} />
        <Toon color="#C9B48A" kind="fabric" />
      </mesh>
    ))}
    {children}
  </group>
);

// distress rocket: launched at t=0 from `from`, rises for 0.7 s, then bursts into white stars
export const RocketFlare: React.FC<{ t: number; from: [number, number, number]; height?: number }> = ({ t, from, height = 16 }) => {
  if (t < 0) return null;
  const rise = Math.min(1, t / 0.7);
  const y = from[1] + height * (1 - (1 - rise) * (1 - rise));
  const burst = t - 0.7;
  return (
    <group>
      {rise < 1 && (
        <>
          {/* bright head + a trail of fading sparks */}
          <mesh position={[from[0], y, from[2]]}>
            <sphereGeometry args={[0.3, 12, 10]} />
            <meshBasicMaterial color="#FFF2C0" toneMapped={false} />
          </mesh>
          {Array.from({ length: 10 }, (_, i) => {
            const k = i / 10;
            return (
              <mesh key={i} position={[from[0] + Math.sin(i * 1.7) * 0.08, y - k * 3.5 * rise - 0.2, from[2]]}>
                <sphereGeometry args={[0.2 * (1 - k), 6, 4]} />
                <meshBasicMaterial color="#FFB860" transparent opacity={1 - k} toneMapped={false} />
              </mesh>
            );
          })}
          <pointLight position={[from[0], y, from[2]]} color="#FFD8A0" intensity={8} distance={14} decay={1.4} />
        </>
      )}
      {burst >= 0 && burst < 2.5 && (
        <group position={[from[0], from[1] + height, from[2]]}>
          {Array.from({ length: 28 }, (_, i) => {
            const a = (i / 28) * Math.PI * 2;
            const e = ((i * 37) % 11) / 11 - 0.4;
            const r = Math.min(1, burst / 0.5) * 4.5;
            const fall = burst * burst * 0.8;
            return (
              <mesh key={i} position={[Math.cos(a) * r * Math.cos(e), Math.sin(e) * r - fall, Math.sin(a) * r * Math.cos(e)]}>
                <sphereGeometry args={[0.32, 6, 4]} />
                <meshBasicMaterial color="#FFFFFF" transparent opacity={Math.max(0, 1 - burst / 2.5)} toneMapped={false} />
              </mesh>
            );
          })}
          <pointLight color="#E8F0FF" intensity={30 * Math.max(0, 1 - burst / 1.5)} distance={60} decay={1.2} />
        </group>
      )}
    </group>
  );
};
