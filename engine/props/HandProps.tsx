import React from "react";
import { Toon } from "../look/style";

// ─────────────────────────────────────────────────────────────────────────────
// Props held in a glove (pose.holdL / pose.holdR). Origin = palm centre; the
// arm points down (-Y) from the shoulder, so "out of the fist" is -Y / +Z.
// Keep them chunky and readable at Shorts size.
// ─────────────────────────────────────────────────────────────────────────────

export type HeldProp = "rifleport" | "riflehip" | "flamegun" | "stamp" | "oar" | "lantern" | "lifejacket" | "rope" | "binoculars" | "telegram" | "rulebook" | "rifle" | "rocket" | "whistle" | "hammer";

const M: React.FC<React.PropsWithChildren<{ p?: [number, number, number]; r?: [number, number, number]; s?: [number, number, number] }>> = ({ p, r, s, children }) => (
  <mesh position={p} rotation={r} scale={s} castShadow receiveShadow>
    {children}
  </mesh>
);

const Oar: React.FC = () => (
  <group rotation={[0, 0, Math.PI / 2]} position={[-0.3, -0.05, 0.05]}>
    <M p={[0, 0.25, 0]}>
      <cylinderGeometry args={[0.035, 0.035, 1.9, 10]} />
      <Toon color="#B08A5A" kind="wood" />
    </M>
    <M p={[0, 1.2, 0]} s={[1, 1, 0.25]}>
      <boxGeometry args={[0.2, 0.5, 0.2]} />
      <Toon color="#9A7448" kind="wood" />
    </M>
  </group>
);

const Lantern: React.FC<{ lit?: boolean }> = ({ lit = true }) => (
  <group position={[0, -0.18, 0.02]}>
    <M p={[0, 0.12, 0]}>
      <torusGeometry args={[0.06, 0.01, 6, 16, Math.PI]} />
      <Toon color="#2A2A2E" kind="metal" />
    </M>
    <M p={[0, -0.02, 0]}>
      <cylinderGeometry args={[0.07, 0.08, 0.04, 12]} />
      <Toon color="#2A2A2E" kind="metal" />
    </M>
    <mesh position={[0, -0.12, 0]}>
      <cylinderGeometry args={[0.065, 0.065, 0.16, 12]} />
      <meshStandardMaterial color="#FFE2A0" emissive="#FFC060" emissiveIntensity={lit ? 2.2 : 0} transparent opacity={0.85} />
    </mesh>
    <M p={[0, -0.22, 0]}>
      <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
      <Toon color="#2A2A2E" kind="metal" />
    </M>
    {lit && <pointLight position={[0, -0.12, 0]} color="#FFC877" intensity={3} distance={5} decay={1.6} />}
  </group>
);

const Lifejacket: React.FC = () => (
  <group position={[0, -0.18, 0.08]} rotation={[0.3, 0, 0]}>
    {[-1, 1].map((sd) => (
      <M key={sd} p={[sd * 0.1, 0, 0]}>
        <boxGeometry args={[0.16, 0.34, 0.1]} />
        <Toon color="#EFE6D2" kind="fabric" />
      </M>
    ))}
    {[-0.08, 0.06].map((y) => (
      <M key={y} p={[0, y, 0.052]}>
        <boxGeometry args={[0.36, 0.025, 0.012]} />
        <Toon color="#8A6A40" kind="leather" />
      </M>
    ))}
  </group>
);

const RopeCoilHand: React.FC = () => (
  <group position={[0, -0.12, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
    {[0, 1, 2].map((i) => (
      <M key={i} p={[0, i * 0.035, 0]}>
        <torusGeometry args={[0.14, 0.022, 8, 24]} />
        <Toon color="#C9A97A" kind="fabric" />
      </M>
    ))}
  </group>
);

const Binoculars: React.FC = () => (
  <group position={[0, -0.12, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
    {[-1, 1].map((sd) => (
      <M key={sd} p={[sd * 0.055, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.2, 14]} />
        <Toon color="#1E1F24" kind="leather" />
      </M>
    ))}
    <M>
      <boxGeometry args={[0.08, 0.06, 0.04]} />
      <Toon color="#B8913E" kind="brass" />
    </M>
  </group>
);

const Paper: React.FC<{ w: number; h: number; color?: string }> = ({ w, h, color = "#F3EEDF" }) => (
  <group position={[0, -0.16, 0.1]} rotation={[-0.4, 0, 0]}>
    <M>
      <boxGeometry args={[w, h, 0.006]} />
      <Toon color={color} kind="paint" roughness={0.9} />
    </M>
    {[0.3, 0.1, -0.1, -0.3].map((y) => (
      <M key={y} p={[0, (y * h) / 1.2, 0.004]}>
        <boxGeometry args={[w * 0.75, 0.008, 0.002]} />
        <Toon color="#6A6A72" />
      </M>
    ))}
  </group>
);

const RulebookHand: React.FC = () => (
  <group position={[0, -0.16, 0.12]} rotation={[-0.5, 0, 0]}>
    <M>
      <boxGeometry args={[0.3, 0.38, 0.06]} />
      <Toon color="#5C2A2E" kind="leather" />
    </M>
    <M p={[0, 0, 0.032]}>
      <boxGeometry args={[0.26, 0.34, 0.004]} />
      <Toon color="#EDE4CC" kind="paint" />
    </M>
  </group>
);

// chunky bolt-action rifle with bayonet; origin = right-hand grip, barrel along +y before `rot`
const Rifle: React.FC<{ rot?: [number, number, number] }> = ({ rot = [Math.PI / 2 - 0.2, 0, 0] }) => (
  <group position={[0, -0.05, 0.05]} rotation={rot}>
    {/* butt stock behind the grip */}
    <M p={[0, -0.32, -0.03]} r={[0.12, 0, 0]}>
      <boxGeometry args={[0.1, 0.5, 0.16]} />
      <Toon color="#8A5A32" kind="wood" />
    </M>
    {/* forestock */}
    <M p={[0, 0.32, 0]}>
      <boxGeometry args={[0.085, 0.8, 0.1]} />
      <Toon color="#8A5A32" kind="wood" />
    </M>
    {/* receiver + bolt */}
    <M p={[0, 0.02, 0.04]}>
      <boxGeometry args={[0.07, 0.22, 0.09]} />
      <Toon color="#2A2B2F" kind="metal" />
    </M>
    <M p={[0.07, 0.04, 0.05]}>
      <sphereGeometry args={[0.03, 8, 6]} />
      <Toon color="#2A2B2F" kind="metal" />
    </M>
    {/* barrel + bayonet */}
    <M p={[0, 0.88, 0.03]}>
      <cylinderGeometry args={[0.022, 0.022, 0.42, 8]} />
      <Toon color="#2A2B2F" kind="metal" />
    </M>
    <M p={[0, 1.24, 0.0]}>
      <boxGeometry args={[0.018, 0.36, 0.045]} />
      <Toon color="#C9CCD0" kind="metal" />
    </M>
  </group>
);

const Rocket: React.FC = () => (
  <group position={[0, -0.05, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
    <M p={[0, 0.18, 0]}>
      <cylinderGeometry args={[0.035, 0.035, 0.36, 10]} />
      <Toon color="#C23A2E" kind="paint" />
    </M>
    <M p={[0, 0.4, 0]}>
      <coneGeometry args={[0.04, 0.09, 10]} />
      <Toon color="#E8E0CC" kind="paint" />
    </M>
  </group>
);

const Whistle: React.FC = () => (
  <M p={[0, -0.08, 0.08]} r={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[0.025, 0.03, 0.12, 10]} />
    <Toon color="#C9A24A" kind="brass" />
  </M>
);

const FlameGun: React.FC = () => (
  <group position={[0, -0.05, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
    <M p={[0, 0.35, 0]}>
      <cylinderGeometry args={[0.035, 0.04, 0.95, 10]} />
      <Toon color="#2E302C" kind="metal" />
    </M>
    <M p={[0, 0.85, 0]}>
      <cylinderGeometry args={[0.05, 0.035, 0.1, 10]} />
      <Toon color="#B8913E" kind="brass" />
    </M>
    <M p={[0, 0.05, 0.08]} r={[0.5, 0, 0]}>
      <boxGeometry args={[0.05, 0.16, 0.05]} />
      <Toon color="#4A3A2A" kind="wood" />
    </M>
  </group>
);

const Hammer: React.FC = () => (
  <group position={[0, -0.04, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
    <M p={[0, 0.2, 0]}>
      <cylinderGeometry args={[0.025, 0.025, 0.42, 8]} />
      <Toon color="#9A6A3A" kind="wood" />
    </M>
    <M p={[0, 0.42, 0]} r={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.05, 0.05, 0.18, 10]} />
      <Toon color="#3A3B40" kind="metal" />
    </M>
  </group>
);

const BIG: Partial<Record<string, number>> = { rifle: 1.35, rifleport: 1.35, riflehip: 1.35, lantern: 1.7, lifejacket: 1.8, binoculars: 1.8, telegram: 1.6, rulebook: 1.5, rope: 1.6, rocket: 1.6, whistle: 1.6, hammer: 1.4 };
export const HandProp: React.FC<{ name?: HeldProp | string; Stamp?: React.FC }> = ({ name, Stamp }) => <group scale={BIG[name ?? ""] ?? 1}>{propFor(name, Stamp)}</group>;
const propFor = (name: string | undefined, Stamp?: React.FC) => {
  switch (name) {
    case "stamp":
      return Stamp ? <Stamp /> : null;
    case "oar":
      return <Oar />;
    case "lantern":
      return <Lantern />;
    case "lifejacket":
      return <Lifejacket />;
    case "rope":
      return <RopeCoilHand />;
    case "binoculars":
      return <Binoculars />;
    case "telegram":
      return <Paper w={0.22} h={0.16} color="#F1E6C8" />;
    case "rulebook":
      return <RulebookHand />;
    case "rifle":
      return <Rifle />;
    case "rifleport": // carried across the chest, muzzle up and out (running)
      return <Rifle rot={[0.5, 0, 0.9]} />;
    case "riflehip": // held low at the hip, bayonet pointing ahead (charging)
      return <Rifle rot={[1.35, 0, 0.0]} />;
    case "rocket":
      return <Rocket />;
    case "whistle":
      return <Whistle />;
    case "hammer":
      return <Hammer />;
    case "flamegun":
      return <FlameGun />;
    default:
      return null;
  }
};
export const HELD_PROPS: HeldProp[] = ["flamegun", "oar", "lantern", "lifejacket", "rope", "binoculars", "telegram", "rulebook", "rifle", "rocket", "whistle", "hammer"];
