import React, { useMemo } from "react";
import * as THREE from "three";
import { Toon } from "../../look/style";
import { Flames, Smoke, SmokeLayer } from "../../fx/Fire";
import { useCanvasTexture } from "../../props/Props";

// ─────────────────────────────────────────────────────────────────────────────
// World kit: FACTORY FLOOR (1911 garment loft, e.g. the 9th floor of the Asch
// Building). Floor y = 0. Room spans x −7..7, z −16..8, ceiling 4.2.
// Long sewing tables run along Z; machines on both sides; workers sit facing the
// table. Main aisle (for characters + camera): x 0.4 .. 1.9.
// Tall windows on both side walls; the stair door is on the back wall (z −16).
// `fire` 0..1 grows flames from the scrap bins and fills the ceiling with smoke.
// ─────────────────────────────────────────────────────────────────────────────

export const FACTORY = { x0: -7, x1: 7, z0: -16, z1: 8, h: 4.2, aisle: [0.4, 1.9] as [number, number], door: [-2.2, 0, -15.95] as [number, number, number] };
export const TABLE_X = [-5.2, -3.0, -0.8, 3.1, 5.3];
const TABLE_Z: [number, number] = [-13, 4];
const TABLE_W = 1.0;
const TABLE_H = 0.92;
const MACHINE_STEP = 1.05;

const C = {
  floor: "#8E6A48",
  seam: "#5E4430",
  wall: "#E4D9C3",
  wainscot: "#7A5A3E",
  ceiling: "#B8B2A6",
  column: "#3C3F44",
  table: "#9A7550",
  machine: "#17181B",
  gold: "#C9A24A",
  wheel: "#2A2B2F",
  fabric: ["#F2EEE4", "#E8E2D2", "#DCE4EE", "#F0E0DE"],
  basket: "#A88A5A",
  window: "#DDEBF5",
  frame: "#5A4636",
};

const M: React.FC<React.PropsWithChildren<{ p?: [number, number, number]; r?: [number, number, number]; s?: [number, number, number]; noShadow?: boolean }>> = ({ p, r, s, children, noShadow }) => (
  <mesh position={p} rotation={r} scale={s} castShadow={!noShadow} receiveShadow>
    {children}
  </mesh>
);

// worn plank floor
const useFloorTexture = () =>
  useCanvasTexture(
    256,
    512,
    (g, w, h) => {
      g.fillStyle = C.floor;
      g.fillRect(0, 0, w, h);
      const n = 10;
      for (let i = 0; i < n; i++) {
        const x = (i * w) / n;
        g.fillStyle = `rgba(0,0,0,${((i * 37) % 5) * 0.025})`;
        g.fillRect(x, 0, w / n, h);
        g.fillStyle = C.seam;
        g.fillRect(x, 0, 2, h);
        const off = (i * 173) % h;
        g.fillRect(x, off, w / n, 2);
      }
      // scuffs along the aisles
      for (let k = 0; k < 140; k++) {
        g.fillStyle = `rgba(255,240,220,${0.03 + (k % 4) * 0.01})`;
        g.fillRect((k * 97) % w, (k * 211) % h, 10 + (k % 7) * 3, 2);
      }
    },
    [],
  );

// one 1910s treadle-table sewing machine (black, gold trim, balance wheel)
const machineParts = (
  <group>
    <M p={[0, 0.03, 0]}>
      <boxGeometry args={[0.46, 0.06, 0.24]} />
      <Toon color={C.machine} kind="metal" roughness={0.35} />
    </M>
    <M p={[0.16, 0.2, 0]}>
      <boxGeometry args={[0.1, 0.3, 0.13]} />
      <Toon color={C.machine} kind="metal" roughness={0.35} />
    </M>
    <M p={[0, 0.34, 0]}>
      <boxGeometry args={[0.42, 0.1, 0.12]} />
      <Toon color={C.machine} kind="metal" roughness={0.35} />
    </M>
    <M p={[-0.19, 0.24, 0]}>
      <boxGeometry args={[0.07, 0.22, 0.1]} />
      <Toon color={C.machine} kind="metal" roughness={0.35} />
    </M>
    <M p={[0, 0.345, 0.062]}>
      <boxGeometry args={[0.36, 0.025, 0.004]} />
      <Toon color={C.gold} kind="brass" />
    </M>
    <M p={[0.24, 0.3, 0]} r={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.07, 0.07, 0.03, 18]} />
      <Toon color={C.wheel} kind="metal" />
    </M>
    <M p={[0.05, 0.43, 0]}>
      <cylinderGeometry args={[0.018, 0.018, 0.06, 8]} />
      <Toon color="#EDE6D6" kind="paint" />
    </M>
  </group>
);

const Table: React.FC<{ x: number; t: number; idx: number }> = ({ x, t, idx }) => {
  const len = TABLE_Z[1] - TABLE_Z[0];
  const zs = useMemo(() => {
    const out: number[] = [];
    for (let z = TABLE_Z[0] + 0.5; z < TABLE_Z[1] - 0.3; z += MACHINE_STEP) out.push(z);
    return out;
  }, []);
  return (
    <group position={[x, 0, 0]}>
      <M p={[0, TABLE_H, (TABLE_Z[0] + TABLE_Z[1]) / 2]}>
        <boxGeometry args={[TABLE_W, 0.06, len]} />
        <Toon color={C.table} kind="wood" />
      </M>
      {/* trestle legs */}
      {[TABLE_Z[0] + 0.3, (TABLE_Z[0] + TABLE_Z[1]) / 2, TABLE_Z[1] - 0.3].map((z) => (
        <M key={z} p={[0, TABLE_H / 2, z]}>
          <boxGeometry args={[TABLE_W * 0.85, TABLE_H, 0.08]} />
          <Toon color={C.wainscot} kind="wood" />
        </M>
      ))}
      {/* shared drive shaft under the table (machines were belt-driven) */}
      <M p={[0, 0.35, (TABLE_Z[0] + TABLE_Z[1]) / 2]} r={[Math.PI / 2, 0, 0]} noShadow>
        <cylinderGeometry args={[0.03, 0.03, len, 8]} />
        <Toon color={C.column} kind="metal" />
      </M>
      {zs.map((z, i) =>
        [-1, 1].map((sd) => (
          <group key={`${z}-${sd}`} position={[sd * 0.25, TABLE_H + 0.03, z]} rotation={[0, sd > 0 ? -Math.PI / 2 : Math.PI / 2, 0]} scale={1.55}>
            {machineParts}
            {/* fabric under the needle, a pile beside */}
            <M p={[-0.02, 0.07 + Math.sin(t * 20 + i + sd) * 0.002, 0.14]} r={[-Math.PI / 2, 0, 0.2]}>
              <planeGeometry args={[0.32, 0.26]} />
              <Toon color={C.fabric[(i + idx + (sd > 0 ? 1 : 0)) % 4]} kind="fabric" side={THREE.DoubleSide} />
            </M>
          </group>
        )),
      )}
      {/* bundles of cut shirtwaist pieces down the middle */}
      {zs.filter((_, i) => i % 3 === 1).map((z, i) => (
        <M key={`b${z}`} p={[0, TABLE_H + 0.1, z + 0.4]} r={[0, i * 0.4, 0]}>
          <boxGeometry args={[0.3, 0.14, 0.4]} />
          <Toon color={C.fabric[(i + idx) % 4]} kind="fabric" />
        </M>
      ))}
    </group>
  );
};

// stool for a seated worker
const Stool: React.FC<{ p: [number, number, number] }> = ({ p }) => (
  <group position={p}>
    <M p={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 0.05, 14]} />
      <Toon color={C.table} kind="wood" />
    </M>
    {[0, 1, 2].map((i) => (
      <M key={i} p={[Math.cos(i * 2.1) * 0.13, 0.25, Math.sin(i * 2.1) * 0.13]}>
        <cylinderGeometry args={[0.022, 0.022, 0.5, 6]} />
        <Toon color={C.wainscot} kind="wood" />
      </M>
    ))}
  </group>
);

// wicker scrap bin full of cotton cuttings (where the fire starts)
export const ScrapBin: React.FC<{ p: [number, number, number] }> = ({ p }) => (
  <group position={p}>
    <M p={[0, 0.32, 0]}>
      <cylinderGeometry args={[0.42, 0.34, 0.64, 18, 1, true]} />
      <Toon color={C.basket} kind="wood" side={THREE.DoubleSide} />
    </M>
    {[0.12, 0.3, 0.48].map((y) => (
      <M key={y} p={[0, y, 0]}>
        <torusGeometry args={[0.36 + y * 0.1, 0.02, 6, 24]} />
        <Toon color={C.wainscot} kind="wood" />
      </M>
    ))}
    {[0, 1, 2, 3, 4].map((i) => (
      <M key={`s${i}`} p={[Math.cos(i * 1.3) * 0.15, 0.62 + (i % 2) * 0.05, Math.sin(i * 1.3) * 0.15]} r={[i, i * 0.7, 0]}>
        <dodecahedronGeometry args={[0.16, 0]} />
        <Toon color={C.fabric[i % 4]} kind="fabric" />
      </M>
    ))}
  </group>
);

const WindowWall: React.FC<{ x: number; facing: 1 | -1; lit: number }> = ({ x, facing, lit }) => {
  const zs: number[] = [];
  for (let z = FACTORY.z0 + 2; z < FACTORY.z1 - 1; z += 3) zs.push(z);
  return (
    <group position={[x, 0, 0]}>
      <M p={[0, FACTORY.h / 2, (FACTORY.z0 + FACTORY.z1) / 2]} noShadow>
        <boxGeometry args={[0.3, FACTORY.h, FACTORY.z1 - FACTORY.z0]} />
        <Toon color={C.wall} kind="paint" />
      </M>
      <M p={[facing * 0.16, 0.5, (FACTORY.z0 + FACTORY.z1) / 2]} noShadow>
        <boxGeometry args={[0.04, 1.0, FACTORY.z1 - FACTORY.z0]} />
        <Toon color={C.wainscot} kind="wood" />
      </M>
      {zs.map((z) => (
        <group key={z} position={[facing * 0.17, 2.25, z]}>
          <M noShadow>
            <boxGeometry args={[0.06, 2.4, 1.7]} />
            <Toon color={C.frame} kind="wood" />
          </M>
          <M p={[facing * 0.035, 0, 0]} noShadow>
            <boxGeometry args={[0.02, 2.2, 1.5]} />
            <Toon color={C.window} kind="glass" emissive={C.window} emissiveIntensity={0.55 * lit} />
          </M>
          {[-0.37, 0.37].map((dz) => (
            <M key={dz} p={[facing * 0.05, 0, dz]} noShadow>
              <boxGeometry args={[0.02, 2.2, 0.04]} />
              <Toon color={C.frame} kind="wood" />
            </M>
          ))}
          <M p={[facing * 0.05, 0.25, 0]} noShadow>
            <boxGeometry args={[0.02, 0.04, 1.5]} />
            <Toon color={C.frame} kind="wood" />
          </M>
        </group>
      ))}
    </group>
  );
};

// a plain wooden door; `locked` adds a hasp + padlock (the Washington Place stair door)
export const Door: React.FC<{ p: [number, number, number]; rotY?: number; locked?: boolean; shake?: number; sign?: string }> = ({ p, rotY = 0, locked, shake = 0, sign }) => {
  const signTex = useCanvasTexture(
    512,
    128,
    (g, w, h) => {
      g.fillStyle = "#1E1A16";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#E9DFC6";
      g.font = "bold 46px Georgia, serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(sign ?? "", w / 2, h / 2 + 4);
    },
    [sign],
  );
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <M p={[0, 1.25, 0]}>
        <boxGeometry args={[1.5, 2.6, 0.18]} />
        <Toon color={C.frame} kind="wood" />
      </M>
      <group position={[shake * 0.02, 0, 0]} rotation={[0, shake * 0.01, 0]}>
        <M p={[0, 1.2, 0.06]}>
          <boxGeometry args={[1.22, 2.36, 0.08]} />
          <Toon color="#6E4E36" kind="wood" />
        </M>
        {[0.6, 1.75].map((y) => (
          <M key={y} p={[0, y, 0.105]}>
            <boxGeometry args={[0.9, 0.72, 0.02]} />
            <Toon color="#5E4230" kind="wood" />
          </M>
        ))}
        <M p={[0.48, 1.15, 0.13]}>
          <sphereGeometry args={[0.05, 12, 10]} />
          <Toon color={C.gold} kind="brass" />
        </M>
        {locked && (
          <group position={[0.5, 1.4, 0.14]}>
            <M>
              <boxGeometry args={[0.32, 0.07, 0.02]} />
              <Toon color="#6A6E74" kind="metal" />
            </M>
            <group position={[0.12, -0.12 + shake * 0.01, 0.03]} rotation={[0, 0, shake * 0.15]}>
              <M p={[0, 0.06, 0]}>
                <torusGeometry args={[0.045, 0.012, 8, 16, Math.PI]} />
                <Toon color="#9AA0A8" kind="metal" />
              </M>
              <M p={[0, 0, 0]}>
                <boxGeometry args={[0.11, 0.1, 0.05]} />
                <Toon color="#B48A3A" kind="brass" />
              </M>
            </group>
          </group>
        )}
      </group>
      {sign && (
        <mesh position={[0, 2.75, 0.1]}>
          <planeGeometry args={[1.4, 0.35]} />
          <meshStandardMaterial map={signTex} roughness={0.8} />
        </mesh>
      )}
    </group>
  );
};

export type FactorySeat = { position: [number, number, number]; rotationY: number };
// positions for seated workers (stool tops), facing their machine
export const factorySeats = (): FactorySeat[] => {
  const out: FactorySeat[] = [];
  TABLE_X.forEach((x) => {
    for (let z = TABLE_Z[0] + 0.5; z < TABLE_Z[1] - 0.3; z += MACHINE_STEP)
      [-1, 1].forEach((sd) => out.push({ position: [x + sd * 0.95, 0, z], rotationY: sd > 0 ? -Math.PI / 2 : Math.PI / 2 }));
  });
  return out;
};

export const SCRAP_BINS: [number, number, number][] = [
  [2.4, 0, 2.6],
  [4.2, 0, -3.0],
  [-1.9, 0, -6.5],
  [-4.1, 0, 0.5],
];

export const FactoryFloor: React.FC<{ t?: number; fire?: number; smoke?: number; daylight?: number; stools?: boolean }> = ({ t = 0, fire = 0, smoke = 0, daylight = 1, stools = true }) => {
  const floorTex = useFloorTexture();
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(5, 9);
  const W = FACTORY.x1 - FACTORY.x0;
  const D = FACTORY.z1 - FACTORY.z0;
  const seats = useMemo(factorySeats, []);
  return (
    <group>
      {/* floor + ceiling (ceiling casts no shadow so window light still reaches in) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (FACTORY.z0 + FACTORY.z1) / 2]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={floorTex} roughness={0.85} />
      </mesh>
      <M p={[0, FACTORY.h, (FACTORY.z0 + FACTORY.z1) / 2]} noShadow>
        <boxGeometry args={[W, 0.1, D]} />
        <Toon color={C.ceiling} kind="metal" roughness={0.6} />
      </M>
      {/* pressed-tin ceiling beams */}
      {Array.from({ length: 8 }, (_, i) => FACTORY.z0 + 1.5 + i * 3).map((z) => (
        <M key={z} p={[0, FACTORY.h - 0.12, z]} noShadow>
          <boxGeometry args={[W, 0.16, 0.18]} />
          <Toon color="#8E887C" kind="metal" />
        </M>
      ))}
      <WindowWall x={FACTORY.x0} facing={1} lit={daylight} />
      <WindowWall x={FACTORY.x1} facing={-1} lit={daylight} />
      {/* back wall with the stair door, front wall (behind camera usually) */}
      <M p={[0, FACTORY.h / 2, FACTORY.z0]} noShadow>
        <boxGeometry args={[W, FACTORY.h, 0.3]} />
        <Toon color={C.wall} kind="paint" />
      </M>
      <M p={[0, FACTORY.h / 2, FACTORY.z1]} noShadow>
        <boxGeometry args={[W, FACTORY.h, 0.3]} />
        <Toon color={C.wall} kind="paint" />
      </M>
      <Door p={[FACTORY.door[0], 0, FACTORY.door[2] + 0.1]} locked sign="WASHINGTON PL." />
      {/* cast-iron columns */}
      {[-1.9, 2.1].flatMap((x) => [-11, -5, 1, 7].map((z) => [x, z])).map(([x, z]) => (
        <M key={`${x}${z}`} p={[x, FACTORY.h / 2, z]}>
          <cylinderGeometry args={[0.13, 0.15, FACTORY.h, 14]} />
          <Toon color={C.column} kind="metal" />
        </M>
      ))}
      {/* hanging lamps */}
      {[-4, 0.9, 4.2].flatMap((x) => [-10, -4, 2].map((z) => [x, z])).map(([x, z]) => (
        <group key={`l${x}${z}`} position={[x, FACTORY.h - 0.9, z]}>
          <M p={[0, 0.45, 0]} noShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.9, 4]} />
            <Toon color="#222" />
          </M>
          <M noShadow>
            <coneGeometry args={[0.22, 0.14, 16, 1, true]} />
            <Toon color="#3E5A48" kind="metal" side={THREE.DoubleSide} />
          </M>
          <mesh position={[0, -0.06, 0]}>
            <sphereGeometry args={[0.06, 10, 8]} />
            <meshBasicMaterial color="#FFE7B0" />
          </mesh>
        </group>
      ))}
      {TABLE_X.map((x, i) => (
        <Table key={x} x={x} t={t} idx={i} />
      ))}
      {stools && seats.map((s, i) => <Stool key={i} p={[s.position[0] + (s.rotationY > 0 ? -0.15 : 0.15), 0, s.position[2]]} />)}
      {SCRAP_BINS.map((p, i) => (
        <ScrapBin key={i} p={p} />
      ))}
      {/* fire: starts in the front-right bin and spreads to the others */}
      {fire > 0 &&
        SCRAP_BINS.map((p, i) => {
          const k = Math.max(0, Math.min(1, fire * 4 - i * 0.8));
          return k > 0 ? (
            <group key={`f${i}`}>
              <Flames t={t + i} position={[p[0], 0.55, p[2]]} size={0.6 + k * 0.9} seed={i + 1} light={i < 2} intensity={0.6 + k * 0.4} />
              <Smoke t={t + i * 0.7} position={[p[0], 1.2, p[2]]} amount={k} height={FACTORY.h - 1.2} spread={1.6} seed={i} />
            </group>
          ) : null;
        })}
      {smoke > 0 && <SmokeLayer t={t} y={FACTORY.h - 0.25} size={[W, D]} level={smoke} />}
    </group>
  );
};
