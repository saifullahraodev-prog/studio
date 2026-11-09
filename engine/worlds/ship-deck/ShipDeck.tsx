import React, { useMemo } from "react";
import * as THREE from "three";
import { LightingPreset, Toon } from "../../look/style";
import { Real } from "../../look/materials";
import { LiferaftCanisters, ModernLifeboat } from "../../props/Props";
import { Sea } from "../Sea";

// ─────────────────────────────────────────────────────────────────────────────
// World kit: SHIP DECK (early-1900s liner promenade / boat deck).
// Coordinates: deck surface y = 0. The deck runs along -Z (towards the bow).
// Railing (sea side) at x = +RAIL_X, deckhouse wall at x = -WALL_X.
// Camera-friendly character spot: around x 0..2.5, z 0..2.
// ─────────────────────────────────────────────────────────────────────────────

export const RAIL_X = 3.2;
export const WALL_X = 3.4;
const Z_NEAR = 12;
const Z_FAR = -70;
const LEN = Z_NEAR - Z_FAR;
const SEA_Y = -7.5;

const P = {
  wood: "#B98B5A",
  seam: "#7A5634",
  hullWhite: "#ECE7DC",
  hullBlack: "#22242A",
  rail: "#F1EEE6",
  railTop: "#8A5A35",
  wall: "#EFEBE1",
  window: "#2E3A48",
  windowLit: "#FFD58A",
  trim: "#B9AE98",
  funnel: "#D19A42",
  funnelTop: "#1E1F23",
  boat: "#F4F1EA",
  boatRim: "#8A5A35",
  davit: "#E8E4DA",
  vent: "#E9E4D8",
  ventInside: "#B23A2E",
};

const usePlankTexture = () =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 512;
    const g = c.getContext("2d")!;
    g.fillStyle = P.wood;
    g.fillRect(0, 0, 256, 512);
    const planks = 8;
    const w = 256 / planks;
    for (let i = 0; i < planks; i++) {
      // subtle per-plank tone shift
      const shade = ((i * 37) % 5) - 2;
      g.fillStyle = `rgba(${shade > 0 ? 255 : 0},${shade > 0 ? 230 : 0},${shade > 0 ? 200 : 0},${Math.abs(shade) * 0.025})`;
      g.fillRect(i * w, 0, w, 512);
      g.fillStyle = P.seam;
      g.fillRect(i * w, 0, 2, 512);
      // butt joints, staggered
      const off = (i * 149) % 512;
      g.fillRect(i * w, off, w, 2);
      g.fillRect(i * w, (off + 256) % 512, w, 2);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set((RAIL_X + WALL_X) / 2.4, LEN / 4.8);
    t.anisotropy = 8;
    return t;
  }, []);

const M: React.FC<React.PropsWithChildren<{ p?: [number, number, number]; r?: [number, number, number]; s?: [number, number, number]; noShadow?: boolean }>> = ({
  p,
  r,
  s,
  children,
  noShadow,
}) => (
  <mesh position={p} rotation={r} scale={s} castShadow={!noShadow} receiveShadow>
    {children}
  </mesh>
);

const Railing: React.FC = () => {
  const posts = [];
  for (let z = Z_NEAR; z > Z_FAR; z -= 1.3) posts.push(z);
  return (
    <group position={[RAIL_X, 0, 0]}>
      {posts.map((z) => (
        <M key={z} p={[0, 0.52, z]}>
          <cylinderGeometry args={[0.035, 0.04, 1.04, 8]} />
          <Toon color={P.rail} />
        </M>
      ))}
      <M p={[0, 1.07, (Z_NEAR + Z_FAR) / 2]}>
        <boxGeometry args={[0.14, 0.08, LEN]} />
        <Real tex="Planks037A" tint="#B08060" repeat={[0.2, LEN / 2]} rotate={Math.PI / 2} />
      </M>
      {[0.72, 0.38].map((y) => (
        <M key={y} p={[0, y, (Z_NEAR + Z_FAR) / 2]}>
          <boxGeometry args={[0.04, 0.035, LEN]} />
          <Toon color={P.rail} />
        </M>
      ))}
    </group>
  );
};

const Hull: React.FC = () => (
  <group>
    {/* white upper strake, black lower hull, seen when looking over the rail */}
    <M p={[RAIL_X + 0.2, -1.4, (Z_NEAR + Z_FAR) / 2]} noShadow>
      <boxGeometry args={[0.3, 2.8, LEN]} />
      <Real tex="MetalPlates004" gray tint={P.hullWhite} repeat={[LEN / 3, 1]} metalness={0.2} />
    </M>
    <M p={[RAIL_X + 0.2, -5.6, (Z_NEAR + Z_FAR) / 2]} noShadow>
      <boxGeometry args={[0.3, 5.6, LEN]} />
      <Real tex="MetalPlates004" gray tint={P.hullBlack} repeat={[LEN / 3, 2]} metalness={0.3} />
    </M>
  </group>
);

const Deckhouse: React.FC<{ lit: boolean }> = ({ lit }) => {
  const bays = [];
  for (let z = Z_NEAR - 1; z > Z_FAR; z -= 2.6) bays.push(z);
  const H = 2.9;
  return (
    <group position={[-WALL_X, 0, 0]}>
      <M p={[-0.25, H / 2, (Z_NEAR + Z_FAR) / 2]}>
        <boxGeometry args={[0.5, H, LEN]} />
        <Real tex="PaintedMetal004" gray tint={P.wall} repeat={[LEN / 2.5, 1.2]} />
      </M>
      {/* roof overhang + upper railing */}
      <M p={[0.15, H + 0.06, (Z_NEAR + Z_FAR) / 2]}>
        <boxGeometry args={[1.3, 0.12, LEN]} />
        <Toon color={P.trim} />
      </M>
      {/* skirting */}
      <M p={[0.02, 0.09, (Z_NEAR + Z_FAR) / 2]}>
        <boxGeometry args={[0.06, 0.18, LEN]} />
        <Toon color={P.railTop} />
      </M>
      {bays.map((z, i) =>
        i % 4 === 2 ? (
          // door
          <group key={z} position={[0.01, 0, z]}>
            <M p={[0, 1.05, 0]}>
              <boxGeometry args={[0.06, 2.1, 1.1]} />
              <Toon color={P.railTop} />
            </M>
            <M p={[0.04, 1.55, 0]}>
              <boxGeometry args={[0.03, 0.5, 0.6]} />
              <Toon color={lit ? P.windowLit : P.window} emissive={lit ? P.windowLit : undefined} emissiveIntensity={lit ? 0.9 : 0} />
            </M>
          </group>
        ) : (
          // rectangular window with frame
          <group key={z} position={[0.01, 1.6, z]}>
            <M p={[0, 0, 0]}>
              <boxGeometry args={[0.05, 0.95, 1.25]} />
              <Toon color={P.trim} />
            </M>
            <M p={[0.03, 0, 0]}>
              <boxGeometry args={[0.03, 0.8, 1.1]} />
              <Toon color={lit ? P.windowLit : P.window} emissive={lit ? P.windowLit : undefined} emissiveIntensity={lit ? 0.9 : 0} />
            </M>
            <M p={[0.05, 0, 0]}>
              <boxGeometry args={[0.02, 0.8, 0.04]} />
              <Toon color={P.trim} />
            </M>
          </group>
        ),
      )}
    </group>
  );
};

const Lifeboat: React.FC<{ z: number }> = ({ z }) => (
  <group position={[RAIL_X - 0.35, 0, z]}>
    {/* davits */}
    {[-2.2, 2.2].map((dz) => (
      <group key={dz} position={[0, 0, dz]}>
        <M p={[0.3, 1.5, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 3, 10]} />
          <Real tex="Metal041B" repeat={[0.5, 2]} metalness={0.4} />
        </M>
        <M p={[-0.25, 3.0, 0]} r={[0, 0, Math.PI / 2.4]}>
          <cylinderGeometry args={[0.06, 0.06, 1.3, 8]} />
          <Real tex="Metal041B" repeat={[0.4, 1]} metalness={0.4} />
        </M>
        <M p={[-0.75, 2.75, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.6, 4]} />
          <Toon color="#4A4A4A" />
        </M>
      </group>
    ))}
    {/* boat hull: half ellipsoid, open top */}
    <group position={[-0.75, 2.45, 0]}>
      <M r={[Math.PI, 0, 0]} s={[0.85, 0.55, 3.1]}>
        <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Real tex="PaintedMetal004" gray tint={P.boat} repeat={[2, 1]} side={THREE.DoubleSide} />
      </M>
      <M p={[0, 0.0, 0]} r={[Math.PI / 2, 0, 0]} s={[0.86, 3.12, 1]}>
        <torusGeometry args={[1, 0.05, 6, 32]} />
        <Toon color={P.boatRim} />
      </M>
      {/* canvas cover */}
      <M p={[0, 0.05, 0]} s={[0.8, 0.18, 2.95]}>
        <sphereGeometry args={[1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Toon color="#D9D2BF" />
      </M>
    </group>
  </group>
);

const Funnel: React.FC<{ z: number }> = ({ z }) => (
  <group position={[-WALL_X - 3.5, 2.9, z]} rotation={[-0.12, 0, 0]}>
    <M p={[0, 6.5, 0]} s={[1, 1, 1.25]}>
      <cylinderGeometry args={[2.1, 2.1, 13, 32]} />
      <Real tex="PaintedMetal004" gray tint={P.funnel} repeat={[3, 3]} />
    </M>
    <M p={[0, 12.1, 0]} s={[1, 1, 1.25]}>
      <cylinderGeometry args={[2.16, 2.16, 2.2, 32]} />
      <Toon color={P.funnelTop} />
    </M>
  </group>
);

const Ventilator: React.FC<{ p: [number, number, number]; rotY: number }> = ({ p, rotY }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <M p={[0, 0.7, 0]}>
      <cylinderGeometry args={[0.28, 0.32, 1.4, 18]} />
      <Toon color={P.vent} />
    </M>
    <M p={[0, 1.45, 0.18]} r={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.32, 0.28, 12, 18, Math.PI / 2]} />
      <Toon color={P.vent} />
    </M>
    <M p={[0, 1.77, 0.5]}>
      <cylinderGeometry args={[0.42, 0.3, 0.2, 18, 1, true]} />
      <Toon color={P.ventInside} side={THREE.DoubleSide} />
    </M>
  </group>
);

const Lamps: React.FC = () => {
  const zs = [4, -3, -10, -17];
  return (
    <group>
      {zs.map((z, i) => (
        <group key={z} position={[-WALL_X + 0.15, 2.45, z]}>
          <mesh>
            <sphereGeometry args={[0.13, 12, 10]} />
            <meshBasicMaterial color="#FFE2A8" toneMapped={false} />
          </mesh>
          {i < 3 && <pointLight color="#FFC77A" intensity={2.6} distance={7} decay={1.8} />}
        </group>
      ))}
    </group>
  );
};

// a coil of rope on the deck (stacked rings)
const RopeCoil: React.FC<{ p: [number, number, number] }> = ({ p }) => (
  <group position={p}>
    {[0, 1, 2, 3].map((i) => (
      <mesh key={i} position={[0, 0.06 + i * 0.075, 0]} rotation={[Math.PI / 2, 0, i * 0.7]} castShadow receiveShadow>
        <torusGeometry args={[0.32 - i * 0.03, 0.045, 10, 36]} />
        <Real tex="Rope001" repeat={[8, 1]} tint="#D8C29A" />
      </mesh>
    ))}
  </group>
);

// era "1912": wooden lifeboats on davits.  era "today": the same deck dressed with a
// modern enclosed lifeboat + life-raft canisters (for "…and that's why, today" endings).
export const ShipDeck: React.FC<{ preset: LightingPreset; era?: "1912" | "today" }> = ({ preset, era = "1912" }) => {
  return (
    <group>
      {/* deck */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(RAIL_X - WALL_X) / 2, 0, (Z_NEAR + Z_FAR) / 2]} receiveShadow>
        <planeGeometry args={[RAIL_X + WALL_X, LEN]} />
        {/* worn deck planks; wet (glossier) at night and in storms */}
        <Real tex="Planks037A" tint="#D8C3A8" repeat={[(RAIL_X + WALL_X) / 2.2, LEN / 2.2]} rotate={Math.PI / 2} roughness={preset.lamps || preset.rain ? 0.55 : 0.95} />
      </mesh>
      <RopeCoil p={[RAIL_X - 0.7, 0, 3.2]} />
      <RopeCoil p={[-WALL_X + 0.7, 0, -1.6]} />
      <RopeCoil p={[RAIL_X - 0.6, 0, -14]} />
      <Railing />
      <Hull />
      <Deckhouse lit={preset.lamps} />
      {preset.lamps && <Lamps />}
      {era === "1912" ? (
        <>
          <Lifeboat z={-9} />
          <Lifeboat z={-20} />
        </>
      ) : (
        <>
          <ModernLifeboat position={[RAIL_X - 1.0, 2.7, -8]} />
          <ModernLifeboat position={[RAIL_X - 1.0, 2.7, -17]} />
          <LiferaftCanisters count={4} position={[RAIL_X - 0.55, 0, -2.2]} />
          <LiferaftCanisters count={4} position={[RAIL_X - 0.55, 0, -12.5]} />
        </>
      )}
      <Ventilator p={[-WALL_X + 0.6, 0, -5.5]} rotY={0.6} />
      <Funnel z={-26} />
      <Funnel z={-46} />
      <group position={[110, 0, -40]}>
        <Sea y={SEA_Y} color={preset.sea.color} amp={preset.sea.amp} />
      </group>
    </group>
  );
};
