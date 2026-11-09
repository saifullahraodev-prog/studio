import React, { useMemo } from "react";
import * as THREE from "three";
import { Toon } from "../../look/style";
import { Flames, Smoke } from "../../fx/Fire";
import { useCanvasTexture } from "../../props/Props";

// ─────────────────────────────────────────────────────────────────────────────
// World kit: STREET OUTSIDE A 1911 LOFT BUILDING (Asch-style, 10 storeys).
// Ground y = 0. Facade on the plane z = 0, spanning x −9..9; sidewalk z 0..3,
// cobbled street z 3..16. A taller neighbour (university building) at x > 9.
// Horse-drawn steam pumper + ladder truck whose ladder STOPS floors short.
// `fire` 0..1: top three floors glow, flames + smoke pour out of the windows.
// ─────────────────────────────────────────────────────────────────────────────

export const FLOOR_H = 4.2;
export const GROUND_H = 5.2;
export const floorY = (floor: number) => (floor <= 1 ? 0 : GROUND_H + (floor - 2) * FLOOR_H); // bottom of a storey (floor 1 = ground)
export const STREET = { facadeX: [-9, 9] as [number, number], floors: 10, ladderTopFloor: 6 };

const C = { stone: "#CDBB98", stoneDark: "#A8936E", brick: "#9A5A40", trim: "#E6DCC4", glass: "#3A4656", glassLit: "#FFB45A", sidewalk: "#A9A398", cobble: "#5E5A54", red: "#B2302A", brass: "#C9A24A", iron: "#2A2B2F", wood: "#6A4A30", horse: "#6A4430", horseDark: "#3A2418" };

const M: React.FC<React.PropsWithChildren<{ p?: [number, number, number]; r?: [number, number, number]; s?: [number, number, number]; noShadow?: boolean }>> = ({ p, r, s, children, noShadow }) => (
  <mesh position={p} rotation={r} scale={s} castShadow={!noShadow} receiveShadow>
    {children}
  </mesh>
);

const useCobbles = () =>
  useCanvasTexture(
    512,
    512,
    (g, w, h) => {
      g.fillStyle = "#4A4640";
      g.fillRect(0, 0, w, h);
      const s = 32;
      for (let y = 0; y < h; y += s * 0.6)
        for (let x = ((y / (s * 0.6)) % 2) * (s / 2) - s; x < w; x += s) {
          const k = ((x * 7 + y * 13) % 9) / 9;
          g.fillStyle = `rgb(${92 + k * 30},${88 + k * 28},${82 + k * 24})`;
          g.beginPath();
          g.roundRect(x + 2, y + 2, s - 4, s * 0.6 - 4, 6);
          g.fill();
        }
    },
    [],
  );

// one storey of the facade: 5 bays of windows (arched on the top floors)
const Storey: React.FC<{ floor: number; burning: number; t: number }> = ({ floor, burning, t }) => {
  const y0 = floorY(floor);
  const h = floor === 1 ? GROUND_H : FLOOR_H;
  const bays = [-6.4, -3.2, 0, 3.2, 6.4];
  const arched = floor >= 8;
  return (
    <group position={[0, y0, 0]}>
      {/* sill band */}
      <M p={[0, 0.12, 0.1]} noShadow>
        <boxGeometry args={[18.2, 0.24, 0.3]} />
        <Toon color={floor === 1 ? C.stoneDark : C.trim} kind="paint" />
      </M>
      {bays.map((x, i) => {
        const lit = burning > 0 ? Math.min(1, burning * (1.2 - i * 0.08)) : 0;
        return (
          <group key={x} position={[x, h * 0.52, 0.04]}>
            <M noShadow>
              <boxGeometry args={[2.0, h * 0.62, 0.1]} />
              <Toon color={C.trim} kind="paint" />
            </M>
            {[-0.45, 0.45].map((dx) => (
              <mesh key={dx} position={[dx, 0, 0.06]}>
                <planeGeometry args={[0.8, h * 0.54]} />
                <meshStandardMaterial color={lit > 0 ? C.glassLit : C.glass} emissive={C.glassLit} emissiveIntensity={lit * (1.2 + Math.sin(t * 9 + i + floor) * 0.3)} roughness={0.15} metalness={0.2} />
              </mesh>
            ))}
            {arched && (
              <M p={[0, h * 0.31, 0.05]} r={[Math.PI / 2, 0, 0]} noShadow>
                <cylinderGeometry args={[1.0, 1.0, 0.12, 24, 1, false, -Math.PI / 2, Math.PI]} />
                <Toon color={C.trim} kind="paint" />
              </M>
            )}
            {burning > 0.25 && i % 2 === (floor % 2) && (
              <>
                <Flames t={t + i + floor} position={[0, -h * 0.25, 0.6]} size={0.9 + burning} seed={i + floor} light={i === 2} intensity={burning} />
                <Smoke t={t + i * 0.5 + floor} position={[0, h * 0.2, 0.8]} amount={burning} height={10} spread={3} seed={i + floor * 3} />
              </>
            )}
          </group>
        );
      })}
    </group>
  );
};

// iron fire escape on the right end of the facade (one balcony per floor)
const FireEscape: React.FC = () => (
  <group position={[7.9, 0, 0.75]}>
    {Array.from({ length: 8 }, (_, i) => i + 2).map((f) => {
      const y = floorY(f) + 0.1;
      return (
        <group key={f} position={[0, y, 0]}>
          <M>
            <boxGeometry args={[2.2, 0.06, 1.3]} />
            <Toon color={C.iron} kind="metal" />
          </M>
          <M p={[0, 0.5, 0.62]}>
            <boxGeometry args={[2.2, 0.05, 0.05]} />
            <Toon color={C.iron} kind="metal" />
          </M>
          {[-1, -0.5, 0, 0.5, 1].map((x) => (
            <M key={x} p={[x, 0.25, 0.62]}>
              <boxGeometry args={[0.03, 0.5, 0.03]} />
              <Toon color={C.iron} kind="metal" />
            </M>
          ))}
          {/* ladder down to the next balcony */}
          <M p={[0.6, -FLOOR_H / 2, 0.1]} r={[0, 0, 0.25]}>
            <boxGeometry args={[0.35, FLOOR_H + 0.4, 0.04]} />
            <Toon color={C.iron} kind="metal" />
          </M>
        </group>
      );
    })}
  </group>
);

const SpokedWheel: React.FC<{ p: [number, number, number]; r: number; spin: number }> = ({ p, r, spin }) => (
  <group position={p} rotation={[0, Math.PI / 2, 0]}>
    <group rotation={[0, 0, spin]}>
      <M>
        <torusGeometry args={[r, r * 0.08, 8, 28]} />
        <Toon color={C.red} kind="paint" />
      </M>
      {Array.from({ length: 8 }, (_, i) => (
        <M key={i} r={[0, 0, (i * Math.PI) / 8]}>
          <boxGeometry args={[r * 1.9, 0.04, 0.04]} />
          <Toon color={C.red} kind="paint" />
        </M>
      ))}
      <M r={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r * 0.16, r * 0.16, 0.14, 12]} />
        <Toon color={C.brass} kind="brass" />
      </M>
    </group>
  </group>
);

// chunky cartoon horse (matches the chibi bodies)
export const Horse: React.FC<{ p: [number, number, number]; rotY?: number; t?: number }> = ({ p, rotY = 0, t = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <M p={[0, 1.25, 0]} r={[Math.PI / 2, 0, 0]}>
      <capsuleGeometry args={[0.42, 1.0, 8, 16]} />
      <Toon color={C.horse} kind="leather" roughness={0.6} />
    </M>
    {[
      [0.24, 0.62],
      [-0.24, 0.62],
      [0.24, -0.62],
      [-0.24, -0.62],
    ].map(([x, z], i) => (
      <M key={i} p={[x, 0.5, z]} r={[Math.sin(t * 3 + i * 1.6) * 0.08, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.09, 1.0, 10]} />
        <Toon color={C.horse} kind="leather" roughness={0.6} />
      </M>
    ))}
    <group position={[0, 1.6, 0.85]} rotation={[-0.6 + Math.sin(t * 2) * 0.05, 0, 0]}>
      <M p={[0, 0.25, 0]}>
        <capsuleGeometry args={[0.2, 0.45, 6, 12]} />
        <Toon color={C.horse} kind="leather" roughness={0.6} />
      </M>
      <M p={[0, 0.55, 0.22]} r={[1.2, 0, 0]}>
        <capsuleGeometry args={[0.2, 0.4, 6, 12]} />
        <Toon color={C.horse} kind="leather" roughness={0.6} />
      </M>
      <M p={[0, 0.5, -0.12]}>
        <boxGeometry args={[0.08, 0.7, 0.18]} />
        <Toon color={C.horseDark} kind="wool" />
      </M>
      {[-0.1, 0.1].map((x) => (
        <M key={x} p={[x, 0.82, 0.05]}>
          <coneGeometry args={[0.06, 0.18, 8]} />
          <Toon color={C.horse} kind="leather" />
        </M>
      ))}
    </group>
    <M p={[0, 1.3, -1.0]} r={[0.6, 0, 0]}>
      <capsuleGeometry args={[0.07, 0.5, 4, 8]} />
      <Toon color={C.horseDark} kind="wool" />
    </M>
  </group>
);

// horse-drawn steam fire engine (pumper)
export const SteamPumper: React.FC<{ p: [number, number, number]; rotY?: number; t?: number }> = ({ p, rotY = 0, t = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <M p={[0, 0.95, 0]}>
      <boxGeometry args={[1.5, 0.25, 3.2]} />
      <Toon color={C.red} kind="paint" roughness={0.35} />
    </M>
    <M p={[0, 2.0, -0.7]}>
      <cylinderGeometry args={[0.5, 0.55, 1.9, 24]} />
      <Toon color={C.brass} kind="brass" />
    </M>
    <M p={[0, 3.1, -0.7]}>
      <cylinderGeometry args={[0.2, 0.3, 0.6, 16]} />
      <Toon color={C.iron} kind="metal" />
    </M>
    <Smoke t={t} position={[0, 3.4, -0.7]} amount={0.6} height={3} spread={0.8} color="#4A4644" seed={9} />
    <M p={[0, 1.55, 0.9]}>
      <boxGeometry args={[1.1, 0.5, 0.7]} />
      <Toon color={C.wood} kind="wood" />
    </M>
    <SpokedWheel p={[0.85, 0.75, -1.0]} r={0.75} spin={0} />
    <SpokedWheel p={[-0.85, 0.75, -1.0]} r={0.75} spin={0} />
    <SpokedWheel p={[0.8, 0.55, 1.1]} r={0.55} spin={0} />
    <SpokedWheel p={[-0.8, 0.55, 1.1]} r={0.55} spin={0} />
    <Horse p={[-0.55, 0, 3.4]} t={t} />
    <Horse p={[0.65, 0, 3.4]} t={t + 1} />
  </group>
);

// ladder truck with the ladder raised toward the facade; it tops out at `topY`
export const LadderTruck: React.FC<{ p: [number, number, number]; topY: number; reachZ?: number }> = ({ p, topY, reachZ = 0.8 }) => {
  const base = new THREE.Vector3(p[0], p[1] + 1.4, p[2]);
  const top = new THREE.Vector3(p[0], topY, reachZ);
  const len = base.distanceTo(top);
  const ang = Math.atan2(base.z - top.z, top.y - base.y);
  const rungs = Math.floor(len / 0.5);
  return (
    <group>
      <group position={p}>
        <M p={[0, 0.9, 0]}>
          <boxGeometry args={[1.6, 0.3, 5]} />
          <Toon color={C.red} kind="paint" roughness={0.35} />
        </M>
        <SpokedWheel p={[0.9, 0.6, -1.7]} r={0.6} spin={0} />
        <SpokedWheel p={[-0.9, 0.6, -1.7]} r={0.6} spin={0} />
        <SpokedWheel p={[0.9, 0.6, 1.7]} r={0.6} spin={0} />
        <SpokedWheel p={[-0.9, 0.6, 1.7]} r={0.6} spin={0} />
      </group>
      <group position={[base.x, base.y, base.z]} rotation={[-ang, 0, 0]}>
        {[-0.3, 0.3].map((x) => (
          <M key={x} p={[x, len / 2, 0]}>
            <boxGeometry args={[0.08, len, 0.12]} />
            <Toon color={C.wood} kind="wood" />
          </M>
        ))}
        {Array.from({ length: rungs }, (_, i) => (
          <M key={i} p={[0, 0.3 + i * 0.5, 0]} r={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
            <Toon color={C.wood} kind="wood" />
          </M>
        ))}
      </group>
    </group>
  );
};

export const Street: React.FC<{ t?: number; fire?: number; engines?: boolean }> = ({ t = 0, fire = 0, engines = true }) => {
  const cob = useCobbles();
  cob.wrapS = cob.wrapT = THREE.RepeatWrapping;
  cob.repeat.set(8, 4);
  const topY = floorY(STREET.floors + 1);
  const floors = useMemo(() => Array.from({ length: STREET.floors }, (_, i) => i + 1), []);
  return (
    <group>
      {/* street + sidewalk + curb */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 12]} receiveShadow>
        <planeGeometry args={[80, 24]} />
        <meshStandardMaterial map={cob} roughness={0.9} />
      </mesh>
      <M p={[0, 0.08, 1.5]} noShadow>
        <boxGeometry args={[80, 0.16, 3]} />
        <Toon color={C.sidewalk} kind="paint" roughness={0.9} />
      </M>
      {/* the loft building */}
      <M p={[0, topY / 2, -6]} noShadow>
        <boxGeometry args={[18.4, topY, 12]} />
        <Toon color={C.stone} kind="paint" roughness={0.85} />
      </M>
      {floors.map((f) => (
        <Storey key={f} floor={f} t={t} burning={f >= 8 ? fire : 0} />
      ))}
      <M p={[0, topY + 0.3, 0.2]} noShadow>
        <boxGeometry args={[18.8, 0.6, 0.6]} />
        <Toon color={C.trim} kind="paint" />
      </M>
      <FireEscape />
      {/* neighbouring university building, taller, red brick */}
      <M p={[19.5, (topY + 8) / 2, -5]} noShadow>
        <boxGeometry args={[20, topY + 8, 12]} />
        <Toon color={C.brick} kind="paint" roughness={0.9} />
      </M>
      {Array.from({ length: 12 }, (_, f) => f).map((f) =>
        [11.5, 14.5, 17.5].map((x) => (
          <mesh key={`${f}-${x}`} position={[x, 3 + f * 4, 1.02]}>
            <planeGeometry args={[1.4, 2.2]} />
            <meshStandardMaterial color={C.glass} roughness={0.2} />
          </mesh>
        )),
      )}
      {/* street lamps */}
      {[-12, 0, 12].map((x) => (
        <group key={x} position={[x, 0, 2.7]}>
          <M p={[0, 2.2, 0]}>
            <cylinderGeometry args={[0.07, 0.1, 4.4, 8]} />
            <Toon color={C.iron} kind="metal" />
          </M>
          <M p={[0, 4.6, 0]}>
            <boxGeometry args={[0.45, 0.6, 0.45]} />
            <Toon color={C.iron} kind="metal" />
          </M>
        </group>
      ))}
      {/* smoke column over the roof */}
      {fire > 0 && <Smoke t={t} position={[0, topY - 6, -1]} amount={fire} height={22} spread={7} seed={2} />}
      {engines && (
        <>
          <SteamPumper p={[-6, 0, 8.5]} rotY={0.2} t={t} />
          <LadderTruck p={[3.5, 0, 9]} topY={floorY(STREET.ladderTopFloor + 1) - 0.6} reachZ={1.0} />
        </>
      )}
    </group>
  );
};
