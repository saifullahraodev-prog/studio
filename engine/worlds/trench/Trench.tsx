import React, { useMemo } from "react";
import * as THREE from "three";
import { Real } from "../../look/materials";
import { LightingPreset, Toon } from "../../look/style";

// ─────────────────────────────────────────────────────────────────────────────
// World kit: WW1-STYLE FRONT-LINE TRENCH (generic, not a real place).
// Floor y = 0. Main trench runs along Z (x −W..W) from the corner wall at z = BACK
// up to z ≈ 20. At the far end it turns LEFT into a side trench (z SIDE_NEAR..BACK,
// running to −x). Walls are H tall: mud faces, plank revetment, sandbag parapets.
// Above: churned mud, barbed wire, stumps, craters. Sized for the ~3 m chibi bodies.
// ─────────────────────────────────────────────────────────────────────────────

export const TRENCH = { W: 1.4, H: 3.3, BACK: -7.4, SIDE_NEAR: -4.6, SIDE_Z: -6.0, FAR: 22, SIDE_FAR: -22 };
const { W, H, BACK, SIDE_NEAR, FAR, SIDE_FAR } = TRENCH;

const M: React.FC<React.PropsWithChildren<{ p?: [number, number, number]; r?: [number, number, number]; s?: [number, number, number]; noShadow?: boolean }>> = ({ p, r, s, children, noShadow }) => (
  <mesh position={p} rotation={r} scale={s} castShadow={!noShadow} receiveShadow>
    {children}
  </mesh>
);

// a trench wall face from a to b (x,z); `n` = which side faces into the trench (+1 = left of a→b)
type WallSpec = { a: [number, number]; b: [number, number] };
const WALLS: WallSpec[] = [
  { a: [W, FAR], b: [W, BACK] }, // main, right side (faces −x)
  { a: [-W, SIDE_NEAR], b: [-W, FAR] }, // main, left side (faces +x)
  { a: [W, BACK], b: [SIDE_FAR, BACK] }, // corner wall + side trench far wall (faces +z)
  { a: [SIDE_FAR, SIDE_NEAR], b: [-W, SIDE_NEAR] }, // side trench near wall (faces −z)
];

const wallFrame = (w: WallSpec) => {
  const [ax, az] = w.a;
  const [bx, bz] = w.b;
  const len = Math.hypot(bx - ax, bz - az);
  const dx = (bx - ax) / len;
  const dz = (bz - az) / len;
  // inward normal (into the trench): right of a→b
  const nx = dz;
  const nz = -dx;
  return { len, mid: [(ax + bx) / 2, (az + bz) / 2] as [number, number], rotY: Math.atan2(nx, nz), dx, dz, nx, nz };
};

const Wall: React.FC<{ w: WallSpec }> = ({ w }) => {
  const f = wallFrame(w);
  const posts = Math.floor(f.len / 1.7);
  return (
    <group position={[f.mid[0], 0, f.mid[1]]} rotation={[0, f.rotY, 0]}>
      {/* mud face, full height */}
      <M p={[0, H / 2, 0]} noShadow>
        <planeGeometry args={[f.len, H]} />
        <Real tex="Ground054" tint="#9A8A74" repeat={[f.len / 2.6, H / 2.6]} />
      </M>
      {/* plank revetment on the lower part */}
      <M p={[0, 1.15, 0.06]} noShadow>
        <planeGeometry args={[f.len, 2.3]} />
        <Real tex="Planks037A" tint="#8E7458" repeat={[f.len / 3.2, 1.6]} rotate={Math.PI / 2} />
      </M>
      {/* upright posts holding the revetment */}
      {Array.from({ length: posts }, (_, i) => (
        <M key={i} p={[-f.len / 2 + 0.8 + i * 1.7, 1.3, 0.13]}>
          <boxGeometry args={[0.16, 2.6, 0.14]} />
          <Real tex="Planks037A" tint="#6E5640" repeat={[0.2, 1]} />
        </M>
      ))}
    </group>
  );
};

// all sandbags in one instanced mesh: two staggered rows along every wall top + a few heaps
const bagGeo = (() => {
  const g = new THREE.SphereGeometry(1, 14, 8);
  g.scale(0.34, 0.15, 0.22);
  return g;
})();

const Sandbags: React.FC = () => {
  const mats = useMemo(() => {
    const out: THREE.Matrix4[] = [];
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    WALLS.forEach((w, wi) => {
      const f = wallFrame(w);
      for (let row = 0; row < 3; row++) {
        const n = Math.floor(f.len / 0.66);
        for (let i = 0; i < n; i++) {
          const s = -f.len / 2 + 0.33 + i * 0.66 + (row % 2) * 0.33;
          if (s > f.len / 2 - 0.2) continue;
          const back = -0.3 - (row === 2 ? 0.35 : 0); // behind the edge (outside the trench)
          const y = H + 0.13 + (row === 2 ? 0 : row * 0.27);
          const x = f.mid[0] + f.dx * s + f.nx * back;
          const z = f.mid[1] + f.dz * s + f.nz * back;
          const k = Math.sin(i * 12.9898 + wi * 78.233 + row * 3.1) * 43758.5453;
          const r = k - Math.floor(k);
          e.set((r - 0.5) * 0.12, f.rotY + (r - 0.5) * 0.25, (r - 0.5) * 0.08);
          q.setFromEuler(e);
          out.push(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1 + r * 0.15, 1, 1)));
        }
      }
    });
    return out;
  }, []);
  return (
    <instancedMesh
      args={[bagGeo, undefined, mats.length]}
      castShadow
      receiveShadow
      ref={(m) => {
        if (!m) return;
        mats.forEach((x, i) => m.setMatrixAt(i, x));
        m.instanceMatrix.needsUpdate = true;
      }}
    >
      <Real tex="Fabric026" gray tint="#B9A57E" repeat={[1, 1]} />
    </instancedMesh>
  );
};

// duckboard walkway: a planked strip with two rails
const Duckboard: React.FC<{ from: [number, number]; to: [number, number] }> = ({ from, to }) => {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const rot = Math.atan2(to[0] - from[0], to[1] - from[1]);
  return (
    <group position={[(from[0] + to[0]) / 2, 0.09, (from[1] + to[1]) / 2]} rotation={[0, rot, 0]}>
      <M r={[-Math.PI / 2, 0, 0]} noShadow>
        <planeGeometry args={[1.25, len]} />
        <Real tex="Planks037A" tint="#9C7E5C" repeat={[1, len / 1.4]} />
      </M>
      {[-0.6, 0.6].map((x) => (
        <M key={x} p={[x, -0.04, 0]}>
          <boxGeometry args={[0.1, 0.1, len]} />
          <Real tex="Planks037A" tint="#5E4A36" repeat={[0.2, len / 2]} />
        </M>
      ))}
    </group>
  );
};

// no-man's-land dressing on top
const WirePost: React.FC<{ p: [number, number, number]; r?: number }> = ({ p, r = 0 }) => (
  <group position={p} rotation={[0, r, 0]}>
    {[-0.35, 0.35].map((a) => (
      <M key={a} p={[0, 0.55, 0]} r={[0, 0, a]}>
        <cylinderGeometry args={[0.04, 0.05, 1.3, 6]} />
        <Toon color="#4A3C2E" kind="wood" />
      </M>
    ))}
  </group>
);

const Wire: React.FC<{ a: [number, number]; b: [number, number]; y: number }> = ({ a, b, y }) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const rot = Math.atan2(b[0] - a[0], b[1] - a[1]);
  const coils = Math.floor(len / 0.55);
  return (
    <group position={[(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2]} rotation={[0, rot, 0]}>
      {[0.45, 0.85].map((h) => (
        <mesh key={h} position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, len, 4]} />
          <meshStandardMaterial color="#3A3634" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      {Array.from({ length: coils }, (_, i) => (
        <mesh key={i} position={[0, 0.55, -len / 2 + 0.3 + i * 0.55]} rotation={[0, 0, (i % 3) * 0.3]}>
          <torusGeometry args={[0.45, 0.012, 4, 18]} />
          <meshStandardMaterial color="#3A3634" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

const Stump: React.FC<{ p: [number, number, number]; h?: number }> = ({ p, h = 1.6 }) => (
  <group position={p}>
    <M p={[0, h / 2, 0]} r={[0.05, 0, 0.08]}>
      <cylinderGeometry args={[0.18, 0.3, h, 8]} />
      <Toon color="#3A2E24" kind="wood" />
    </M>
    <M p={[0.15, h * 0.75, 0]} r={[0, 0, -0.9]}>
      <cylinderGeometry args={[0.05, 0.08, 0.7, 6]} />
      <Toon color="#3A2E24" kind="wood" />
    </M>
  </group>
);

const Crater: React.FC<{ p: [number, number]; r: number }> = ({ p, r }) => (
  <group position={[p[0], H + 0.02, p[1]]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[r, 24]} />
      <meshStandardMaterial color="#3A3026" roughness={0.4} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, 0]} scale={[1, 1, 0.22]}>
      <torusGeometry args={[r, r * 0.3, 5, 14]} />
      <Real tex="Ground054" tint="#7A6650" repeat={[3, 1]} />
    </mesh>
  </group>
);

export const Barrel: React.FC<{ p: [number, number, number]; tipped?: boolean }> = ({ p, tipped }) => (
  <group position={p} rotation={tipped ? [Math.PI / 2, 0, 0.4] : [0, 0, 0]}>
    <M p={[0, tipped ? 0 : 0.55, tipped ? -0.45 : 0]}>
      <cylinderGeometry args={[0.42, 0.42, 1.1, 18]} />
      <Real tex="Planks037A" tint="#7A5A3A" repeat={[2, 1]} />
    </M>
    {[-0.35, 0.35].map((y) => (
      <M key={y} p={[0, (tipped ? 0 : 0.55) + y, tipped ? -0.45 : 0]}>
        <torusGeometry args={[0.43, 0.025, 6, 24]} />
        <Toon color="#2E2E2C" kind="metal" />
      </M>
    ))}
  </group>
);

const Crate: React.FC<{ p: [number, number, number]; r?: number; s?: number }> = ({ p, r = 0, s = 1 }) => (
  <M p={[p[0], p[1] + 0.3 * s, p[2]]} r={[0, r, 0]} s={[s, s, s]}>
    <boxGeometry args={[0.9, 0.6, 0.6]} />
    <Real tex="Planks037A" tint="#8A6A48" repeat={[1, 0.7]} />
  </M>
);

export const Trench: React.FC<{ preset: LightingPreset }> = ({ preset }) => {
  const wet = preset.rain ? 0.35 : 0.55;
  return (
    <group>
      {/* trench floor (wet mud) */}
      <M p={[0, 0, (FAR + BACK) / 2]} r={[-Math.PI / 2, 0, 0]} noShadow>
        <planeGeometry args={[W * 2, FAR - BACK]} />
        <Real tex="Ground054" tint="#7A6A58" repeat={[1, (FAR - BACK) / 2.8]} roughness={wet} />
      </M>
      <M p={[(SIDE_FAR - W) / 2, 0, (SIDE_NEAR + BACK) / 2]} r={[-Math.PI / 2, 0, 0]} noShadow>
        <planeGeometry args={[-SIDE_FAR - W, SIDE_NEAR - BACK]} />
        <Real tex="Ground054" tint="#7A6A58" repeat={[(-SIDE_FAR - W) / 2.8, 1]} roughness={wet} />
      </M>
      <Duckboard from={[0, BACK + 0.6]} to={[0, FAR]} />
      <Duckboard from={[-W, TRENCH.SIDE_Z]} to={[SIDE_FAR, TRENCH.SIDE_Z]} />

      {WALLS.map((w, i) => (
        <Wall key={i} w={w} />
      ))}

      {/* ground on top: three slabs around the trench (they also close the wall backs) */}
      {[
        { x: [W, 40], z: [-40, 40] },
        { x: [-40, -W], z: [SIDE_NEAR, 40] },
        { x: [-40, W], z: [-40, BACK] },
      ].map((g, i) => {
        const w = g.x[1] - g.x[0];
        const d = g.z[1] - g.z[0];
        return (
          <M key={i} p={[(g.x[0] + g.x[1]) / 2, H, (g.z[0] + g.z[1]) / 2]} r={[-Math.PI / 2, 0, 0]} noShadow>
            <planeGeometry args={[w, d]} />
            <Real tex="Ground054" tint="#8E7C66" repeat={[w / 3.2, d / 3.2]} />
          </M>
        );
      })}
      <Sandbags />

      {/* no-man's-land */}
      <Wire a={[4.5, 14]} b={[4.5, -12]} y={H} />
      <Wire a={[-4.5, 14]} b={[-4.5, -1]} y={H} />
      {[-10, -5, 0, 5, 10].map((z) => (
        <WirePost key={`r${z}`} p={[4.5, H, z]} />
      ))}
      {[-1, 4, 9, 13].map((z) => (
        <WirePost key={`l${z}`} p={[-4.5, H, z]} />
      ))}
      <Stump p={[7, H, 2]} h={2.2} />
      <Stump p={[-8, H, 6]} h={1.4} />
      <Stump p={[-6, H, -12]} h={2.6} />
      <Stump p={[9, H, -9]} h={1.2} />
      <Crater p={[6.5, 7]} r={1.6} />
      <Crater p={[-7, 1.5]} r={1.2} />
      <Crater p={[3.5, -13]} r={2} />
      <Crater p={[-10, -14]} r={1.8} />
      <Crater p={[10, -3]} r={1.4} />
      <Crater p={[15, 5]} r={2.2} />
      <Crater p={[20, -6]} r={1.7} />
      <Crater p={[24, 2]} r={2.4} />
      <Stump p={[18, H, -8]} h={2.8} />
      <Stump p={[23, H, 7]} h={1.8} />
      <Stump p={[13, H, 9]} h={1.3} />

      {/* clutter in the trench */}
      <Crate p={[0.85, 0, 8.5]} r={0.2} />
      <Crate p={[-0.9, 0, 12]} r={-0.15} s={0.9} />
      <Crate p={[0.9, 0, -6.6]} r={0.4} s={0.8} />
    </group>
  );
};
