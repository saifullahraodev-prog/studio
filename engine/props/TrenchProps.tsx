import React from "react";
import * as THREE from "three";
import { Toon } from "../look/style";
import { Flames, Smoke } from "../fx/Fire";
import { HandProp } from "./HandProps";

// Props for the trench Short: a heavy machine gun on a tripod, a flamethrower jet,
// muzzle flashes, and a rifle lying on the floor. All frame-driven (pass t, seconds).
// Sized for the ~3 m chibi bodies (about 1.7x real size).

const M: React.FC<React.PropsWithChildren<{ p?: [number, number, number]; r?: [number, number, number]; s?: [number, number, number] }>> = ({ p, r, s, children }) => (
  <mesh position={p} rotation={r} scale={s} castShadow receiveShadow>
    {children}
  </mesh>
);

// water-cooled machine gun on a low tripod; origin on the floor under the receiver, barrel along +z
export const MachineGun: React.FC<{ position?: [number, number, number]; rotationY?: number; t?: number; firing?: boolean; scale?: number }> = ({ position, rotationY = 0, t = 0, firing = false, scale = 1.7 }) => {
  const kick = firing ? Math.abs(Math.sin(t * 60)) * 0.025 : 0;
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* tripod */}
      {[
        [0, 0.6, 0.55],
        [-0.42, 0.6, -0.3],
        [0.42, 0.6, -0.3],
      ].map(([x, h, z], i) => (
        <M key={i} p={[x / 2, h / 2, z / 2]} r={[(-z / 0.55) * 0.75, 0, (x / 0.42) * 0.6]}>
          <cylinderGeometry args={[0.025, 0.03, 0.78, 6]} />
          <Toon color="#2C2E2A" kind="metal" />
        </M>
      ))}
      <group position={[0, 0.66, -kick]}>
        {/* receiver */}
        <M p={[0, 0, -0.05]}>
          <boxGeometry args={[0.17, 0.2, 0.42]} />
          <Toon color="#2A2C28" kind="metal" />
        </M>
        {/* water jacket + barrel + muzzle cone */}
        <M p={[0, 0.02, 0.48]} r={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.68, 18]} />
          <Toon color="#4E4A3E" kind="metal" />
        </M>
        {[0.2, 0.48, 0.76].map((z) => (
          <M key={z} p={[0, 0.02, z]} r={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.082, 0.082, 0.03, 18]} />
            <Toon color="#2A2C28" kind="metal" />
          </M>
        ))}
        <M p={[0, 0.02, 0.9]} r={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.05, 0.14, 10]} />
          <Toon color="#1E1F1C" kind="metal" />
        </M>
        {/* spade grips at the back */}
        {[-0.07, 0.07].map((x) => (
          <M key={x} p={[x, 0, -0.3]} r={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.12, 6]} />
            <Toon color="#4A3A2A" kind="wood" />
          </M>
        ))}
        {/* ammo box + belt */}
        <M p={[-0.24, -0.22, 0.02]}>
          <boxGeometry args={[0.16, 0.2, 0.28]} />
          <Toon color="#4E5A3A" kind="metal" />
        </M>
        <M p={[-0.14, -0.06, 0.02]} r={[0, 0, -0.9]}>
          <boxGeometry args={[0.2, 0.02, 0.06]} />
          <Toon color="#B8913E" kind="brass" />
        </M>
      </group>
      {firing && <MuzzleFlash t={t} position={[0, 0.68, 1.02]} size={0.5} />}
    </group>
  );
};

// flickering star-shaped flash + light (renders every ~3 frames for a stutter)
export const MuzzleFlash: React.FC<{ t: number; position?: [number, number, number]; size?: number }> = ({ t, position, size = 1 }) => {
  const on = Math.floor(t * 30) % 3 !== 2;
  if (!on) return null;
  const s = size * (0.7 + Math.abs(Math.sin(t * 97)) * 0.5);
  return (
    <group position={position} scale={s}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2, (i * Math.PI) / 3, 0]} position={[0, 0, 0.16]}>
          <coneGeometry args={[0.1, 0.38, 4, 1, true]} />
          <meshBasicMaterial color={i ? "#FFB24A" : "#FFF4C0"} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
      </mesh>
      <pointLight color="#FFC070" intensity={14} distance={9} decay={1.5} />
    </group>
  );
};

const n1 = (x: number) => Math.sin(x) * 0.6 + Math.sin(x * 2.3 + 1.7) * 0.3 + Math.sin(x * 5.1 + 0.3) * 0.1;
const jetGeo = new THREE.IcosahedronGeometry(1, 1);
const JET = ["#FFF6D0", "#FFD46A", "#FF9A2E", "#E8531C"];

// flamethrower jet from `from` to `to`, starting at t = 0: the front races out at ~16 m/s,
// fat rolling fire blobs flow along an arc, splash flames + smoke where it lands.
export const FireJet: React.FC<{ t: number; from: [number, number, number]; to: [number, number, number]; stop?: number }> = ({ t, from, to, stop = 99 }) => {
  if (t < 0) return null;
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const len = a.distanceTo(b);
  const front = Math.min(1, (t * 16) / len);
  const tail = t > stop ? Math.min(1, (t - stop) * 3) : 0;
  const N = 34;
  const blobs: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const u = (i / N + t * 2.2) % 1;
    if (u > front || u < tail) continue;
    const p = a.clone().lerp(b, u);
    p.y += Math.sin(u * Math.PI) * 0.6 * (len / 6); // slight arc
    const rad = (0.14 + u * 0.75) * (1 + n1(t * 13 + i) * 0.25);
    p.x += n1(t * 7 + i * 1.3) * u * 0.25;
    p.z += n1(t * 6 + i * 2.1) * u * 0.25;
    for (let L = 0; L < 2; L++) {
      blobs.push(
        <mesh key={`${i}-${L}`} geometry={jetGeo} position={p.toArray()} scale={rad * (L ? 1.55 : 1)} rotation={[t * 3 + i, i, 0]}>
          <meshBasicMaterial color={JET[Math.min(3, Math.floor(u * 3) + L)]} transparent opacity={L ? 0.45 : 0.85} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
        </mesh>,
      );
    }
  }
  const mid = a.clone().lerp(b, 0.6);
  const landed = front >= 1;
  return (
    <group>
      {blobs}
      <pointLight position={mid.toArray()} color="#FF8A30" intensity={40 * (1 - tail)} distance={16} decay={1.4} />
      {landed && (
        <>
          <Flames t={t} position={to} size={1.7} seed={5} intensity={1.2} />
          <Flames t={t + 0.4} position={[to[0] + 0.6, to[1], to[2] - 0.8]} size={1.2} seed={9} light={false} />
          <Smoke t={t} position={[to[0], to[1] + 1.5, to[2]]} amount={0.8} height={5} spread={2} />
        </>
      )}
    </group>
  );
};

// a rifle lying on the floor; if `drop` >= 0 it falls from the hands first (drop = seconds since release)
export const FloorRifle: React.FC<{ position: [number, number, number]; rotationY?: number; drop?: number; fromY?: number }> = ({ position, rotationY = 0, drop = 9, fromY = 1.6 }) => {
  const k = Math.min(1, Math.max(0, drop) / 0.35);
  const y = position[1] + 0.06 + (1 - k * k) * fromY;
  const tilt = (1 - k) * 1.2;
  const bounce = drop > 0.35 && drop < 0.6 ? Math.sin(((drop - 0.35) / 0.25) * Math.PI) * 0.12 : 0;
  return (
    <group position={[position[0], y + bounce, position[2]]} rotation={[0, rotationY, Math.PI / 2 - tilt]}>
      <group scale={1.6}>
        <HandProp name="rifle" />
      </group>
    </group>
  );
};
