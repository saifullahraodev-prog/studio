import React from "react";
import * as THREE from "three";
import { Toon } from "../../look/style";
import { useCanvasTexture } from "../../props/Props";

// ─────────────────────────────────────────────────────────────────────────────
// Small sets (floor y = 0, characters around x 0, z 0..2, camera from +Z).
//  - OfficeToday: the Inspector's modern corridor: EXIT door with a push bar and a
//    lit green sign, ceiling sprinklers, red alarm pull station, extinguisher,
//    evacuation map. The "and that's why, today" place.
//  - Courtroom1911: raised judge's bench, witness rail, defence table, panelled walls.
// ─────────────────────────────────────────────────────────────────────────────

const M: React.FC<React.PropsWithChildren<{ p?: [number, number, number]; r?: [number, number, number]; noShadow?: boolean }>> = ({ p, r, children, noShadow }) => (
  <mesh position={p} rotation={r} castShadow={!noShadow} receiveShadow>
    {children}
  </mesh>
);

const TextPlane: React.FC<{ text: string; p: [number, number, number]; size: [number, number]; bg: string; fg: string; font?: string; glow?: number; r?: [number, number, number] }> = ({ text, p, size, bg, fg, font = "bold 120px Arial, sans-serif", glow = 0, r }) => {
  const tex = useCanvasTexture(
    512,
    Math.round((512 * size[1]) / size[0]),
    (g, w, h) => {
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);
      g.fillStyle = fg;
      g.font = font;
      g.textAlign = "center";
      g.textBaseline = "middle";
      text.split("\n").forEach((line, i, all) => g.fillText(line, w / 2, h / 2 + (i - (all.length - 1) / 2) * (h / (all.length + 0.6))));
    },
    [text, bg, fg, font],
  );
  return (
    <mesh position={p} rotation={r}>
      <planeGeometry args={size} />
      <meshStandardMaterial map={tex} emissive={glow ? "#FFFFFF" : "#000000"} emissiveMap={glow ? tex : null} emissiveIntensity={glow} roughness={0.6} />
    </mesh>
  );
};

export const OFFICE = { exitDoor: [1.6, 0, -1.9] as [number, number, number], sprinkler: [0.2, 3.3, 0.6] as [number, number, number], alarm: [-1.6, 1.4, -1.85] as [number, number, number] };

export const OfficeToday: React.FC<{ t?: number; doorOpen?: number; sprinklerOn?: number }> = ({ t = 0, doorOpen = 0, sprinklerOn = 0 }) => {
  const tiles = useCanvasTexture(
    256,
    256,
    (g, w, h) => {
      g.fillStyle = "#C9C6BE";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "#A9A69E";
      g.lineWidth = 3;
      for (let i = 0; i <= 4; i++) {
        g.beginPath();
        g.moveTo((i * w) / 4, 0);
        g.lineTo((i * w) / 4, h);
        g.moveTo(0, (i * h) / 4);
        g.lineTo(w, (i * h) / 4);
        g.stroke();
      }
    },
    [],
  );
  tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping;
  tiles.repeat.set(6, 4);
  const H = 3.5;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1]} receiveShadow>
        <planeGeometry args={[14, 9]} />
        <meshStandardMaterial map={tiles} roughness={0.5} />
      </mesh>
      <M p={[0, H / 2, -2]} noShadow>
        <boxGeometry args={[14, H, 0.2]} />
        <Toon color="#E9ECEF" kind="paint" />
      </M>
      <M p={[-4.5, H / 2, 1]} noShadow>
        <boxGeometry args={[0.2, H, 9]} />
        <Toon color="#DDE3E8" kind="paint" />
      </M>
      <M p={[0, H, 1]} noShadow>
        <boxGeometry args={[14, 0.1, 9]} />
        <Toon color="#F2F2EE" kind="paint" />
      </M>
      {/* ceiling lights */}
      {[-2, 2].map((x) => (
        <mesh key={x} position={[x, H - 0.06, 0.5]}>
          <boxGeometry args={[1.4, 0.04, 0.35]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ))}
      {/* EXIT door: steel, push bar, swings OUTWARD (away from camera) */}
      <group position={OFFICE.exitDoor}>
        <M p={[0, 1.25, 0.04]}>
          <boxGeometry args={[1.5, 2.6, 0.12]} />
          <Toon color="#7A848E" kind="metal" />
        </M>
        <group position={[-0.62, 0, 0.11]} rotation={[0, -doorOpen * 1.2, 0]}>
          <M p={[0.62, 1.2, 0]}>
            <boxGeometry args={[1.24, 2.38, 0.06]} />
            <Toon color="#B8312F" kind="paint" roughness={0.4} />
          </M>
          <M p={[0.62, 1.05, 0.09]}>
            <boxGeometry args={[1.0, 0.09, 0.08]} />
            <Toon color="#C8CDD3" kind="metal" />
          </M>
          {[-0.5, 0.5].map((dx) => (
            <M key={dx} p={[0.62 + dx * 0.95, 1.05, 0.05]}>
              <boxGeometry args={[0.08, 0.16, 0.08]} />
              <Toon color="#2A2D31" kind="metal" />
            </M>
          ))}
        </group>
        <TextPlane text="EXIT" p={[0, 2.85, 0.14]} size={[0.8, 0.3]} bg="#0E6B2E" fg="#E9FFE9" glow={0.9} />
      </group>
      {/* sprinkler heads (+ spray when on) */}
      {[-1.8, 0.2, 2.2].map((x) => (
        <group key={x} position={[x, H - 0.05, 0.6]}>
          <M p={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.12, 8]} />
            <Toon color="#C9A24A" kind="brass" />
          </M>
          <M p={[0, -0.13, 0]}>
            <cylinderGeometry args={[0.08, 0.06, 0.02, 12]} />
            <Toon color="#C9A24A" kind="brass" />
          </M>
          {sprinklerOn > 0 &&
            Array.from({ length: 24 }, (_, i) => {
              const a = (i / 24) * Math.PI * 2;
              const k = (t * 1.8 + i * 0.13) % 1;
              return (
                <mesh key={i} position={[Math.cos(a) * k * 1.1, -0.15 - k * 2.8, Math.sin(a) * k * 1.1]}>
                  <sphereGeometry args={[0.025, 6, 4]} />
                  <meshStandardMaterial color="#BFE3F5" transparent opacity={0.7 * sprinklerOn} />
                </mesh>
              );
            })}
        </group>
      ))}
      {/* fire alarm pull station + extinguisher + evacuation map */}
      <group position={OFFICE.alarm}>
        <M>
          <boxGeometry args={[0.32, 0.42, 0.1]} />
          <Toon color="#D12E2A" kind="paint" roughness={0.35} />
        </M>
        <TextPlane text={"FIRE\nPULL"} p={[0, 0.02, 0.055]} size={[0.26, 0.3]} bg="#D12E2A" fg="#FFFFFF" font="bold 150px Arial, sans-serif" />
      </group>
      <group position={[-2.6, 0, -1.75]}>
        <M p={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.75, 16]} />
          <Toon color="#C42A26" kind="paint" roughness={0.3} />
        </M>
        <M p={[0, 0.88, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 0.12, 10]} />
          <Toon color="#22252A" kind="metal" />
        </M>
      </group>
      <TextPlane text={"EVACUATION PLAN\n→ EXIT"} p={[-0.4, 1.7, -1.89]} size={[1.1, 0.75]} bg="#FAFAF5" fg="#1E5E2E" font="bold 64px Arial, sans-serif" />
    </group>
  );
};

export const Courtroom1911: React.FC = () => {
  const wood = "#6A4428";
  const dark = "#4A2E1C";
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1]} receiveShadow>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color="#7C5A3E" roughness={0.8} />
      </mesh>
      {/* panelled back wall */}
      <M p={[0, 2.4, -3]} noShadow>
        <boxGeometry args={[16, 4.8, 0.2]} />
        <Toon color="#D8CBB0" kind="paint" />
      </M>
      <M p={[0, 0.8, -2.88]} noShadow>
        <boxGeometry args={[16, 1.6, 0.06]} />
        <Toon color={dark} kind="wood" />
      </M>
      {/* raised judge's bench */}
      <M p={[0, 0.25, -2.1]}>
        <boxGeometry args={[4, 0.5, 1.4]} />
        <Toon color={dark} kind="wood" />
      </M>
      <M p={[0, 1.15, -1.45]}>
        <boxGeometry args={[3.6, 1.3, 0.25]} />
        <Toon color={wood} kind="wood" />
      </M>
      <M p={[0, 1.83, -1.5]}>
        <boxGeometry args={[3.8, 0.08, 0.5]} />
        <Toon color={dark} kind="wood" />
      </M>
      {/* tall windows */}
      {[-5.5, 5.5].map((x) => (
        <group key={x} position={[x, 2.6, -2.88]}>
          <M noShadow>
            <boxGeometry args={[1.5, 2.8, 0.05]} />
            <Toon color={dark} kind="wood" />
          </M>
          <mesh position={[0, 0, 0.04]}>
            <planeGeometry args={[1.3, 2.6]} />
            <meshStandardMaterial color="#DCE6EE" emissive="#DCE6EE" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}
      {/* defence table + rail */}
      <M p={[-1.8, 0.8, 1.6]}>
        <boxGeometry args={[2.4, 0.08, 0.9]} />
        <Toon color={wood} kind="wood" />
      </M>
      {[-2.8, -0.8].map((x) => (
        <M key={x} p={[x, 0.4, 1.6]}>
          <boxGeometry args={[0.1, 0.8, 0.8]} />
          <Toon color={dark} kind="wood" />
        </M>
      ))}
      <M p={[0, 0.9, 3.4]}>
        <boxGeometry args={[12, 0.08, 0.1]} />
        <Toon color={dark} kind="wood" />
      </M>
      {Array.from({ length: 24 }, (_, i) => -5.75 + i * 0.5).map((x) => (
        <M key={x} p={[x, 0.45, 3.4]}>
          <cylinderGeometry args={[0.03, 0.03, 0.9, 6]} />
          <Toon color={dark} kind="wood" />
        </M>
      ))}
    </group>
  );
};
