import React from "react";
import * as THREE from "three";
import { Toon } from "../../look/style";
import { Flames, Smoke, SmokeLayer } from "../../fx/Fire";
import { Door } from "../factory/Factory";

// ─────────────────────────────────────────────────────────────────────────────
// World kit: STAIRWELL LANDING (narrow 1911 loft stairs). Floor y = 0.
// Room x −2..2, z −0.8..3, ceiling 3.6. The locked stair door is on the back wall
// (centre x −0.4), the stairs climb along the right wall, a stair hole drops away
// at the front right, the elevator cage is on the left wall, and a window (left,
// front) shows the iron fire escape outside.
// `fire` lights the stair hole from below; `smoke` fills the ceiling.
// ─────────────────────────────────────────────────────────────────────────────

export const STAIRWELL = { door: [-0.4, 0, -0.72] as [number, number, number], x0: -2, x1: 2, z0: -0.8, z1: 3, h: 3.6 };

const C = { wallLow: "#3F5A4A", wallHigh: "#D9CFB8", floor: "#6E5A48", step: "#7C6650", nose: "#4A3A2C", rail: "#2A2B2E", iron: "#26282C", cage: "#3A3D42", dark: "#121214" };

const M: React.FC<React.PropsWithChildren<{ p?: [number, number, number]; r?: [number, number, number]; noShadow?: boolean }>> = ({ p, r, children, noShadow }) => (
  <mesh position={p} rotation={r} castShadow={!noShadow} receiveShadow>
    {children}
  </mesh>
);

const Wall: React.FC<{ p: [number, number, number]; size: [number, number]; rotY?: number }> = ({ p, size, rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <M p={[0, 0.6, 0]} noShadow>
      <boxGeometry args={[size[0], 1.2, size[1]]} />
      <Toon color={C.wallLow} kind="paint" roughness={0.45} />
    </M>
    <M p={[0, 1.2 + (STAIRWELL.h - 1.2) / 2, 0]} noShadow>
      <boxGeometry args={[size[0], STAIRWELL.h - 1.2, size[1]]} />
      <Toon color={C.wallHigh} kind="paint" />
    </M>
    <M p={[0, 1.2, 0]} noShadow>
      <boxGeometry args={[size[0] + 0.02, 0.06, size[1] + 0.02]} />
      <Toon color={C.nose} kind="wood" />
    </M>
  </group>
);

// stairs climbing toward the back wall along the right side
const Stairs: React.FC = () => {
  const n = 12;
  const rise = 0.2;
  const run = 0.27;
  return (
    <group position={[1.35, 0, 2.6]}>
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[0, rise * (i + 0.5), -run * i]}>
          <M>
            <boxGeometry args={[1.1, rise, run]} />
            <Toon color={C.step} kind="wood" />
          </M>
          <M p={[0, rise / 2, run / 2 - 0.02]}>
            <boxGeometry args={[1.12, 0.03, 0.05]} />
            <Toon color={C.nose} kind="wood" />
          </M>
        </group>
      ))}
      {/* handrail + balusters on the open side */}
      {Array.from({ length: n }, (_, i) => (
        <M key={`b${i}`} p={[-0.55, rise * i + 0.55, -run * i]}>
          <cylinderGeometry args={[0.018, 0.018, 0.9, 6]} />
          <Toon color={C.rail} kind="metal" />
        </M>
      ))}
      <M p={[-0.55, rise * n * 0.5 + 0.98, -run * n * 0.5]} r={[Math.atan2(rise, run), 0, 0]}>
        <boxGeometry args={[0.06, 0.05, Math.hypot(rise * n, run * n) + 0.2]} />
        <Toon color={C.nose} kind="wood" />
      </M>
    </group>
  );
};

// iron lattice elevator gate on the left wall
const ElevatorCage: React.FC = () => (
  <group position={[STAIRWELL.x0 + 0.08, 0, 1.6]} rotation={[0, Math.PI / 2, 0]}>
    <M p={[0, 1.3, -0.12]} noShadow>
      <boxGeometry args={[1.4, 2.6, 0.05]} />
      <meshStandardMaterial color={C.dark} />
    </M>
    {Array.from({ length: 9 }, (_, i) => (
      <M key={i} p={[-0.64 + i * 0.16, 1.25, 0]}>
        <boxGeometry args={[0.025, 2.5, 0.025]} />
        <Toon color={C.cage} kind="metal" />
      </M>
    ))}
    {Array.from({ length: 8 }, (_, i) => (
      <group key={`x${i}`} position={[0, 0.3 + i * 0.3, 0.02]}>
        <M r={[0, 0, 0.35]}>
          <boxGeometry args={[1.38, 0.018, 0.018]} />
          <Toon color={C.cage} kind="metal" />
        </M>
        <M r={[0, 0, -0.35]}>
          <boxGeometry args={[1.38, 0.018, 0.018]} />
          <Toon color={C.cage} kind="metal" />
        </M>
      </group>
    ))}
    <M p={[0, 2.6, 0]}>
      <boxGeometry args={[1.5, 0.12, 0.08]} />
      <Toon color={C.cage} kind="metal" />
    </M>
  </group>
);

// window in the left wall; the iron fire escape balcony is visible outside it
const FireEscapeWindow: React.FC<{ glow: number }> = ({ glow }) => (
  <group position={[STAIRWELL.x0, 1.9, -0.05]}>
    <M p={[0.02, 0, 0]} noShadow>
      <boxGeometry args={[0.08, 1.7, 1.0]} />
      <Toon color={C.nose} kind="wood" />
    </M>
    <mesh position={[0.07, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[0.86, 1.56]} />
      <meshStandardMaterial color="#9FB4C8" emissive="#B9C9D8" emissiveIntensity={0.5 * glow} roughness={0.1} />
    </mesh>
    {/* outside: grated balcony + rail, in silhouette against the glass */}
    <group position={[-0.5, -0.85, 0]}>
      <M p={[0, 0, 0]}>
        <boxGeometry args={[0.9, 0.04, 1.6]} />
        <Toon color={C.iron} kind="metal" />
      </M>
      {[-0.7, -0.35, 0, 0.35, 0.7].map((z) => (
        <M key={z} p={[-0.4, 0.45, z]}>
          <boxGeometry args={[0.03, 0.9, 0.03]} />
          <Toon color={C.iron} kind="metal" />
        </M>
      ))}
      <M p={[-0.4, 0.9, 0]}>
        <boxGeometry args={[0.04, 0.04, 1.6]} />
        <Toon color={C.iron} kind="metal" />
      </M>
    </group>
  </group>
);

export const Stairwell: React.FC<{ t?: number; fire?: number; smoke?: number; locked?: boolean; doorShake?: number }> = ({ t = 0, fire = 0, smoke = 0, locked = true, doorShake = 0 }) => {
  const W = STAIRWELL.x1 - STAIRWELL.x0;
  const D = STAIRWELL.z1 - STAIRWELL.z0;
  const cz = (STAIRWELL.z0 + STAIRWELL.z1) / 2;
  return (
    <group>
      {/* landing floor (with the stair hole at the front right) */}
      <M p={[-0.55, -0.05, cz]} noShadow>
        <boxGeometry args={[W - 1.1, 0.1, D]} />
        <Toon color={C.floor} kind="wood" />
      </M>
      <M p={[1.45, -0.05, 0.4]} noShadow>
        <boxGeometry args={[1.1, 0.1, 2.4]} />
        <Toon color={C.floor} kind="wood" />
      </M>
      {/* stair hole: dark drop + railing; fire glows up from below */}
      <mesh position={[1.45, -2.5, 2.25]}>
        <boxGeometry args={[1.08, 5, 1.4]} />
        <meshStandardMaterial color={C.dark} side={THREE.BackSide} emissive="#FF6A20" emissiveIntensity={0.35 * fire} />
      </mesh>
      {fire > 0 && (
        <>
          <Flames t={t} position={[1.45, -1.6, 2.3]} size={0.9 + fire * 0.6} seed={5} intensity={fire} />
          <Smoke t={t} position={[1.45, -0.4, 2.3]} amount={fire} height={3.6} spread={1.2} seed={3} />
        </>
      )}
      <Wall p={[0, 0, STAIRWELL.z0]} size={[W, 0.2]} />
      <Wall p={[STAIRWELL.x0, 0, cz]} size={[0.2, D]} />
      <Wall p={[STAIRWELL.x1, 0, cz]} size={[0.2, D]} />
      <M p={[0, STAIRWELL.h, cz]} noShadow>
        <boxGeometry args={[W, 0.1, D]} />
        <Toon color="#9C9488" kind="paint" />
      </M>
      <Door p={[STAIRWELL.door[0], 0, STAIRWELL.door[2]]} locked={locked} shake={doorShake} />
      <Stairs />
      <ElevatorCage />
      <FireEscapeWindow glow={1 - smoke * 0.6} />
      {/* bare bulb */}
      <group position={[-0.3, STAIRWELL.h - 0.5, 1.2]}>
        <mesh>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshBasicMaterial color="#FFE6A8" />
        </mesh>
        <pointLight color="#FFD9A0" intensity={2.5} distance={6} decay={1.6} />
      </group>
      {smoke > 0 && <SmokeLayer t={t} y={STAIRWELL.h - 0.2} size={[W, D]} level={smoke} />}
    </group>
  );
};
