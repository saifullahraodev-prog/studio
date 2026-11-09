import React, { useMemo } from "react";
import * as THREE from "three";
import { Real } from "../look/materials";
import { Toon } from "../look/style";

// Shared props kit (recoloured, reusable). Every prop is built from code so it
// matches the locked look (soft PBR materials, no outlines).

const M: React.FC<React.PropsWithChildren<{ p?: [number, number, number]; r?: [number, number, number]; s?: [number, number, number] | number }>> = ({ p, r, s, children }) => (
  <mesh position={p} rotation={r} scale={s} castShadow receiveShadow>
    {children}
  </mesh>
);

// Text / drawing on a canvas → texture (labels, book pages).
export const useCanvasTexture = (w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, deps: unknown[]) =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d")!, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

// ─── iceberg ────────────────────────────────────────────────────────────────
const hash = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
export const Iceberg: React.FC<{ size?: number; seed?: number; position?: [number, number, number]; rotationY?: number }> = ({ size = 10, seed = 1, position, rotationY = 0 }) => {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 3).toNonIndexed();
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const k = 0.72 + 0.45 * hash(Math.round(v.x * 4) + seed, Math.round(v.y * 4), Math.round(v.z * 4));
      // tall jagged peak, flat-ish base at the waterline
      v.set(v.x * k * 1.15, v.y > 0 ? v.y * k * 1.5 : v.y * 0.6, v.z * k * 0.85);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, [seed]);
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={size}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#DCEBF2" roughness={0.55} metalness={0} emissive="#3A5A70" emissiveIntensity={0.08} />
      </mesh>
    </group>
  );
};

// ─── 1894 rulebook ──────────────────────────────────────────────────────────
// Only the verified row is legible: "10,000 tons and upwards → 16 boats".
// The other rows are deliberately illegible scribbles (we don't invent numbers).
export const Rulebook: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number]; scale?: number; highlight?: number }> = ({
  position,
  rotation,
  scale = 1,
  highlight = 1,
}) => {
  const left = useCanvasTexture(
    512,
    680,
    (g, w, h) => {
      g.fillStyle = "#EFE6CF";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#3A2E22";
      g.textAlign = "center";
      g.font = "bold 40px Georgia";
      g.fillText("BOARD OF TRADE", w / 2, 120);
      g.font = "28px Georgia";
      g.fillText("Rules for", w / 2, 200);
      g.fillText("Life-Saving Appliances", w / 2, 240);
      g.font = "bold 92px Georgia";
      g.fillText("1894", w / 2, 400);
      g.strokeStyle = "#7A6A50";
      g.lineWidth = 3;
      g.strokeRect(40, 40, w - 80, h - 80);
    },
    [],
  );
  const right = useCanvasTexture(
    512,
    680,
    (g, w, h) => {
      g.fillStyle = "#EFE6CF";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#3A2E22";
      g.font = "bold 26px Georgia";
      g.fillText("Gross tonnage", 80, 80);
      g.fillText("Boats", 380, 80);
      g.fillRect(80, 92, w - 110, 2);
      // illegible rows (scribbles)
      g.fillStyle = "rgba(58,46,34,0.35)";
      for (let i = 0; i < 9; i++) {
        const y = 140 + i * 42;
        g.fillRect(80, y, 150 + ((i * 37) % 80), 10);
        g.fillRect(380, y, 40, 10);
      }
      // the verified last row
      g.fillStyle = "#2A1E14";
      g.font = "bold 28px Georgia";
      g.fillText("10,000 and upwards", 80, 560);
      g.font = "bold 40px Georgia";
      g.fillText("16", 390, 562);
      g.fillStyle = "#3A2E22";
      g.font = "italic 22px Georgia";
      g.fillText("(no larger size listed)", 80, 610);
    },
    [],
  );
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* cover */}
      <M p={[0, 0, -0.012]}>
        <boxGeometry args={[1.08, 0.72, 0.02]} />
        <Toon color="#5A2A22" kind="leather" />
      </M>
      {/* pages, slightly V-opened */}
      <mesh position={[-0.26, 0, 0.016]} rotation={[0, 0.05, 0]} castShadow receiveShadow>
        <planeGeometry args={[0.5, 0.66]} />
        <meshStandardMaterial map={left} roughness={0.9} />
      </mesh>
      <mesh position={[0.26, 0, 0.016]} rotation={[0, -0.05, 0]} castShadow receiveShadow>
        <planeGeometry args={[0.5, 0.66]} />
        <meshStandardMaterial map={right} roughness={0.9} />
      </mesh>
      {/* red ink circle around "10,000 and upwards → 16" (grows in with `highlight`) */}
      {highlight > 0 && (
        <mesh position={[0.28, -0.215, 0.035]} rotation={[0, -0.05, 0]} scale={[1, 0.32, 1]}>
          <torusGeometry args={[0.24, 0.008, 6, 48, Math.PI * 2 * Math.min(1, highlight)]} />
          <meshBasicMaterial color="#C0302A" />
        </mesh>
      )}
    </group>
  );
};

// ─── toy liner model (for size comparisons) ─────────────────────────────────
export const ToyShip: React.FC<{ funnels?: number; label: string; position?: [number, number, number]; rotationY?: number; scale?: number }> = ({
  funnels = 4,
  label,
  position,
  rotationY = 0,
  scale = 1,
}) => {
  const plate = useCanvasTexture(
    512,
    128,
    (g, w, h) => {
      g.fillStyle = "#1E1F24";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#F2E6C8";
      g.font = "bold 54px Georgia";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(label, w / 2, h / 2);
    },
    [label],
  );
  const L = 1.6;
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* hull: black lower, white upper strake */}
      <M p={[0, 0.09, 0]} s={[1, 1, 1]}>
        <boxGeometry args={[L, 0.18, 0.22]} />
        <Toon color="#1F2126" kind="paint" />
      </M>
      <M p={[0.85, 0.11, 0]} r={[0, 0, 0]} s={[0.25, 1, 1]}>
        <cylinderGeometry args={[0.0, 0.11, 0.22, 3, 1]} />
        <Toon color="#1F2126" kind="paint" />
      </M>
      <M p={[0, 0.2, 0]}>
        <boxGeometry args={[L, 0.04, 0.22]} />
        <Toon color="#EDE8DD" kind="paint" />
      </M>
      {/* superstructure */}
      <M p={[-0.05, 0.27, 0]}>
        <boxGeometry args={[L * 0.7, 0.1, 0.18]} />
        <Toon color="#F2EFE6" kind="paint" />
      </M>
      {Array.from({ length: funnels }, (_, i) => (
        <group key={i} position={[-0.42 + i * (0.84 / Math.max(1, funnels - 1 || 1)), 0.4, 0]} rotation={[0, 0, 0.12]}>
          <M>
            <cylinderGeometry args={[0.045, 0.045, 0.2, 16]} />
            <Toon color="#D19A42" kind="paint" />
          </M>
          <M p={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.047, 0.047, 0.04, 16]} />
            <Toon color="#1E1F23" kind="paint" />
          </M>
        </group>
      ))}
      {/* label plate on a little stand in front */}
      <mesh position={[0, 0.04, 0.2]} rotation={[-0.4, 0, 0]}>
        <planeGeometry args={[0.6, 0.15]} />
        <meshStandardMaterial map={plate} roughness={0.6} />
      </mesh>
    </group>
  );
};

// ─── modern safety kit (for "today" shots) ──────────────────────────────────
export const ModernLifeboat: React.FC<{ position?: [number, number, number]; rotationY?: number }> = ({ position, rotationY = 0 }) => (
  <group position={position} rotation={[0, rotationY, 0]}>
    {/* enclosed totally-covered lifeboat, safety orange */}
    <M s={[1, 0.62, 3.4]}>
      <capsuleGeometry args={[0.8, 0.5, 10, 24]} />
      <Toon color="#F06A1E" kind="paint" roughness={0.35} />
    </M>
    <M p={[0, -0.25, 0]} s={[1.02, 0.4, 3.45]}>
      <sphereGeometry args={[0.8, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      <Toon color="#F3F1EC" kind="paint" roughness={0.35} />
    </M>
    {[-1.2, -0.4, 0.4, 1.2].map((z) => (
      <M key={z} p={[0.66, 0.15, z]} r={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.12, 20]} />
        <Toon color="#22303A" kind="glass" />
      </M>
    ))}
  </group>
);

export const LiferaftCanisters: React.FC<{ count?: number; position?: [number, number, number]; rotationY?: number }> = ({ count = 4, position, rotationY = 0 }) => (
  <group position={position} rotation={[0, rotationY, 0]}>
    {/* rack */}
    <M p={[0, 0.25, (count - 1) * 0.42 * -0.5 + ((count - 1) * 0.42) / 2]}>
      <boxGeometry args={[0.9, 0.06, count * 0.42 + 0.2]} />
      <Toon color="#9AA3AA" kind="metal" />
    </M>
    {Array.from({ length: count }, (_, i) => (
      <group key={i} position={[0, 0.55, i * 0.42 - ((count - 1) * 0.42) / 2]} rotation={[0, 0, Math.PI / 2]}>
        <M>
          <cylinderGeometry args={[0.24, 0.24, 0.85, 24]} />
          <Toon color="#F4F4F2" kind="paint" roughness={0.4} />
        </M>
        {[-0.2, 0.2].map((y) => (
          <M key={y} p={[0, y, 0]}>
            <cylinderGeometry args={[0.245, 0.245, 0.05, 24]} />
            <Toon color="#E04A2A" kind="paint" />
          </M>
        ))}
      </group>
    ))}
  </group>
);

// ─── v2 kit: boiler room, desk crate, documents, stamp, mini boats, 3D labels ──

// Simple text label floating in 3D (signs, "+4", stamps)
export const TextLabel: React.FC<{ text: string; color?: string; bg?: string; position?: [number, number, number]; rotation?: [number, number, number]; width?: number; font?: string }> = ({
  text,
  color = "#FFD23F",
  bg,
  position,
  rotation,
  width = 0.6,
  font = "bold 150px Arial",
}) => {
  const tex = useCanvasTexture(
    512,
    256,
    (g, w, h) => {
      if (bg) {
        g.fillStyle = bg;
        g.fillRect(0, 0, w, h);
      }
      g.font = font;
      // shrink long labels so they never run off the texture ("20 BOATS", "2,200 PEOPLE")
      const tw = g.measureText(text).width;
      if (tw > w * 0.9) g.font = font.replace(/(\d+)px/, (_, n) => `${Math.floor((Number(n) * w * 0.9) / tw)}px`);
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.lineWidth = 18;
      g.strokeStyle = "#16161C";
      g.strokeText(text, w / 2, h / 2);
      g.fillStyle = color;
      g.fillText(text, w / 2, h / 2);
    },
    [text, color, bg, font],
  );
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, width / 2]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  );
};

export const Crate: React.FC<{ position?: [number, number, number]; size?: [number, number, number] }> = ({ position, size = [2.4, 0.62, 0.9] }) => (
  <M p={position ? [position[0], position[1] + size[1] / 2, position[2]] : [0, size[1] / 2, 0]}>
    <boxGeometry args={size} />
    <Real tex="Planks037A" tint="#C9A27A" repeat={[size[0] / 1.2, 1]} />
  </M>
);

// Certificate lying flat; `stamped` (0..1) slams the red APPROVED stamp on.
export const Certificate: React.FC<{ position?: [number, number, number]; rotationY?: number; stamped?: number }> = ({ position, rotationY = 0, stamped = 0 }) => {
  const tex = useCanvasTexture(
    512,
    680,
    (g, w, h) => {
      g.fillStyle = "#F2EAD3";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#3A2E22";
      g.textAlign = "center";
      g.font = "bold 40px Georgia";
      g.fillText("BOARD OF TRADE", w / 2, 90);
      g.font = "30px Georgia";
      g.fillText("Inspection, 1912", w / 2, 140);
      g.font = "bold 46px Georgia";
      g.fillText("R.M.S. TITANIC", w / 2, 240);
      g.font = "30px Georgia";
      g.textAlign = "left";
      g.fillText("Boats required:   16", 70, 340);
      g.fillText("Boats carried:     20", 70, 395);
      g.fillStyle = "rgba(58,46,34,0.3)";
      for (let i = 0; i < 4; i++) g.fillRect(70, 450 + i * 34, 360 - i * 40, 9);
    },
    [],
  );
  const stampTex = useCanvasTexture(
    512,
    200,
    (g, w, h) => {
      g.strokeStyle = "#C0302A";
      g.lineWidth = 14;
      g.strokeRect(14, 14, w - 28, h - 28);
      g.fillStyle = "#C0302A";
      g.font = "bold 110px Arial";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("APPROVED", w / 2, h / 2 + 6);
    },
    [],
  );
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.42, 0.56]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
      {stamped > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0.25]} position={[0, 0.003, 0.05]} scale={0.6 + 0.4 * Math.min(1, stamped)}>
          <planeGeometry args={[0.4, 0.156]} />
          <meshBasicMaterial map={stampTex} transparent opacity={Math.min(1, stamped * 1.5)} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

// Rubber stamp held in a glove (arm-local: the arm hangs along -y)
export const StampTool: React.FC = () => (
  <group position={[0, -0.12, 0.04]}>
    <M p={[0, -0.02, 0]}>
      <cylinderGeometry args={[0.035, 0.045, 0.16, 12]} />
      <Toon color="#6B4A2E" kind="wood" />
    </M>
    <M p={[0, -0.13, 0]}>
      <boxGeometry args={[0.16, 0.05, 0.11]} />
      <Toon color="#3A3A3E" kind="metal" />
    </M>
    <M p={[0, -0.163, 0]}>
      <boxGeometry args={[0.15, 0.015, 0.1]} />
      <Toon color="#C0302A" kind="rubber" />
    </M>
  </group>
);

// Tiny lifeboat icon (for counting boats / "seats" above heads)
export const MiniBoat: React.FC<{ position?: [number, number, number]; rotationY?: number; scale?: number; color?: string }> = ({ position, rotationY = 0, scale = 1, color = "#F4F1EA" }) => (
  <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
    <M r={[Math.PI, 0, 0]} s={[0.075, 0.065, 0.2]}>
      <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <Toon color={color} kind="paint" side={THREE.DoubleSide} />
    </M>
    <M r={[Math.PI / 2, 0, 0]} s={[0.075, 0.2, 1]}>
      <torusGeometry args={[1, 0.035, 6, 24]} />
      <Toon color="#8A5A35" kind="wood" />
    </M>
  </group>
);

// Boiler room: brick wall, iron furnace with a glowing mouth, coal pile, flickering fire light
export const BoilerRoom: React.FC<{ t: number }> = ({ t }) => {
  const flicker = 0.75 + 0.18 * Math.sin(t * 13) + 0.1 * Math.sin(t * 31 + 1.3) + 0.07 * Math.sin(t * 7.7);
  const bricks = useCanvasTexture(
    512,
    512,
    (g, w, h) => {
      g.fillStyle = "#3A1E16";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 32)
        for (let x = (y / 32) % 2 ? -32 : 0; x < w; x += 64) {
          const s = 70 + ((x * 7 + y * 13) % 30);
          g.fillStyle = `rgb(${s + 40},${s * 0.45},${s * 0.35})`;
          g.fillRect(x + 2, y + 2, 60, 28);
        }
    },
    [],
  );
  bricks.wrapS = bricks.wrapT = THREE.RepeatWrapping;
  bricks.repeat.set(3, 2);
  const coal = useMemo(() => Array.from({ length: 40 }, (_, i) => [((i * 37) % 13) / 13 - 0.5, ((i * 17) % 7) / 7, ((i * 29) % 11) / 11 - 0.5] as [number, number, number]), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <Real tex="MetalPlates004" gray tint="#4A4440" repeat={[5, 5]} metalness={0.3} roughness={0.8} />
      </mesh>
      <mesh position={[0, 3, -2]} receiveShadow>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial map={bricks} roughness={0.95} />
      </mesh>
      <mesh position={[-4, 3, 2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial map={bricks} roughness={0.95} />
      </mesh>
      {/* furnace */}
      <group position={[-1.2, 0, -1.3]}>
        <M p={[0, 0.9, 0]}>
          <boxGeometry args={[2, 1.8, 1.2]} />
          <Real tex="Metal041B" tint="#6A5A50" repeat={[1.5, 1.4]} metalness={0.5} />
        </M>
        <mesh position={[0, 0.75, 0.61]}>
          <circleGeometry args={[0.38, 32, 0, Math.PI]} />
          <meshBasicMaterial color={new THREE.Color("#FF8A2A").multiplyScalar(1.2 * flicker)} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.75, 0.61]}>
          <planeGeometry args={[0.76, 0.02]} />
          <meshBasicMaterial color="#FFD27A" toneMapped={false} />
        </mesh>
        {[-0.6, 0.6].map((x) => (
          <M key={x} p={[x, 1.85, 0.2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.5, 14]} />
            <Toon color="#3A3B40" kind="metal" />
          </M>
        ))}
        <pointLight position={[0, 0.8, 1.1]} color="#FF8A3A" intensity={9 * flicker} distance={8} decay={1.5} />
      </group>
      {/* coal pile */}
      <group position={[1.4, 0, -1.0]}>
        {coal.map((c, i) => (
          <M key={i} p={[c[0] * 1.4, c[1] * 0.45 + 0.08, c[2] * 1.0]} s={0.12 + (i % 5) * 0.02}>
            <dodecahedronGeometry args={[1, 0]} />
            <Toon color="#18181A" kind="metal" roughness={0.6} />
          </M>
        ))}
      </group>
    </group>
  );
};
