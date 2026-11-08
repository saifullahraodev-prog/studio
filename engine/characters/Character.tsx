import React, { useMemo } from "react";
import * as THREE from "three";
import { useStaticTexture } from "../assets";
import { makeToonGradient, style, Toon } from "../look/style";
import { CharacterDef } from "./bible";
import { cellUV, Expression, faceSheetPath, FaceVariant, MouthSlot } from "./face";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Chunky chibi body, ~2.5 heads tall (head = 1.0 unit). Soft toon shading, no
// outlines. Head is a rounded cylinder ("marshmallow") so the flat paper face
// panel sits flush on its front. Root is at the feet, facing +Z.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type Pose = {
  armL?: [number, number]; // [forward (x-rot), out (z-rot)] radians, character's left arm
  armR?: [number, number];
  headYaw?: number;
  headTilt?: number; // roll
  headNod?: number; // pitch (+ = look down)
  lean?: number; // forward lean of the whole body
  bob?: number; // vertical offset (breathing / bounce)
};

const HEAD_R = 0.5;
const HEAD_STRAIGHT = 0.36; // half-height of the straight (cylindrical) section
const HEAD_CORNER = 0.14;
const HEAD_Y = 1.72; // head centre above the feet

const roundedCylinderProfile = (r: number, halfStraight: number, corner: number, steps = 8) => {
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, -(halfStraight + corner))];
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 + (i / steps) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - corner + Math.cos(a) * corner, -halfStraight + Math.sin(a) * corner));
  }
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - corner + Math.cos(a) * corner, halfStraight + Math.sin(a) * corner));
  }
  pts.push(new THREE.Vector2(0, halfStraight + corner));
  return pts;
};

// Head uses a softer toon ramp so the paper-white head never goes muddy grey.
let _hg: THREE.DataTexture | null = null;
const headGradient = () => (_hg ??= makeToonGradient([170, 215, 255]));

const headGeo = new THREE.LatheGeometry(roundedCylinderProfile(HEAD_R, HEAD_STRAIGHT, HEAD_CORNER), 40);

const torsoGeo = (style_: "coat" | "vest" | "shirt") => {
  const flare = style_ === "coat" ? 0.5 : 0.43;
  const pts = [
    [0, 0],
    [flare - 0.04, 0],
    [flare, 0.04],
    [0.45, 0.32],
    [0.44, 0.55],
    [0.4, 0.72],
    [0.3, 0.82],
    [0.12, 0.86],
    [0, 0.86],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, 32);
};
const TORSO = { coat: torsoGeo("coat"), vest: torsoGeo("vest"), shirt: torsoGeo("shirt") };
const TORSO_Y = 0.4;

// Face panel: a slice of a cylinder just outside the head's straight section.
const PANEL_H = style.face.panelHeight;
const PANEL_R = HEAD_R + 0.006;
const PANEL_THETA = style.face.panelArc / PANEL_R;
const panelGeo = new THREE.CylinderGeometry(PANEL_R, PANEL_R, PANEL_H, 24, 1, true, -PANEL_THETA / 2, PANEL_THETA);

const S: React.FC<React.PropsWithChildren<{ p?: [number, number, number]; r?: [number, number, number]; s?: [number, number, number] }>> = ({
  p,
  r,
  s,
  children,
}) => (
  <mesh position={p} rotation={r} scale={s} castShadow receiveShadow>
    {children}
  </mesh>
);

// â”€â”€â”€ face â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FacePanel: React.FC<{ sheet: string; expression: Expression; mouth: MouthSlot; tint: string; glow: number }> = ({ sheet, expression, mouth, tint, glow }) => {
  const base = useStaticTexture(sheet);
  const tex = useMemo(() => {
    if (!base) return null;
    const t = base.clone();
    t.needsUpdate = true;
    return t;
  }, [base]);
  if (!tex) return null;
  const uv = cellUV(expression, mouth);
  tex.repeat.set(...uv.repeat);
  tex.offset.set(...uv.offset);
  return (
    <mesh geometry={panelGeo} position={[0, -0.02, 0]}>
      <meshToonMaterial map={tex} gradientMap={headGradient()} transparent alphaTest={0.5} emissive={tint} emissiveMap={tex} emissiveIntensity={glow} />
    </mesh>
  );
};

// â”€â”€â”€ headgear â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Headgear: React.FC<{ g: CharacterDef["headgear"] }> = ({ g }) => {
  const top = HEAD_STRAIGHT + HEAD_CORNER; // head top relative to head centre
  if (g.type === "peakedCap") {
    return (
      <group position={[0, top - 0.12, 0]}>
        {/* band */}
        <S p={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.54, 0.535, 0.13, 36]} />
          <Toon color={g.band ?? g.color} />
        </S>
        {/* crown, flaring out (oversized) */}
        <S p={[0, 0.26, -0.03]}>
          <cylinderGeometry args={[0.66, 0.54, 0.28, 36]} />
          <Toon color={g.color} />
        </S>
        <S p={[0, 0.4, -0.03]} s={[1, 0.22, 1]}>
          <sphereGeometry args={[0.66, 36, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Toon color={g.color} />
        </S>
        {/* peak */}
        <S p={[0, 0.0, 0.42]} r={[0.32, 0, 0]} s={[1, 1, 0.55]}>
          <cylinderGeometry args={[0.5, 0.5, 0.045, 32, 1, false, -Math.PI / 2, Math.PI]} />
          <Toon color="#15171D" />
        </S>
        {/* badge */}
        {g.badge && (
          <S p={[0, 0.25, 0.58]} r={[-0.25, 0, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 0.03, 6]} />
            <Toon color={g.badge} emissive={g.badge} emissiveIntensity={0.15} />
          </S>
        )}
      </group>
    );
  }
  if (g.type === "flatCap") {
    return (
      <group position={[0, top - 0.1, 0.02]}>
        <S p={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.55, 0.535, 0.1, 36]} />
          <Toon color={g.band ?? g.color} />
        </S>
        <S p={[0, 0.1, 0.06]} s={[1.08, 0.42, 1.14]}>
          <sphereGeometry args={[0.6, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Toon color={g.color} />
        </S>
        <S p={[0, 0.06, 0.5]} r={[0.18, 0, 0]} s={[0.95, 1, 0.5]}>
          <cylinderGeometry args={[0.5, 0.5, 0.05, 32, 1, false, -Math.PI / 2, Math.PI]} />
          <Toon color={g.color} />
        </S>
        <S p={[0, 0.22, 0.46]} s={[1, 1, 1]}>
          <sphereGeometry args={[0.045, 10, 8]} />
          <Toon color={g.band ?? g.color} />
        </S>
      </group>
    );
  }
  // hardHat / helmet: dome with brim
  return (
    <group position={[0, top - 0.14, 0]}>
      <S p={[0, 0, 0]} s={[1, 0.85, 1.05]}>
        <sphereGeometry args={[0.64, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Toon color={g.color} />
      </S>
      <S p={[0, 0.0, 0.08]}>
        <cylinderGeometry args={[0.76, 0.76, 0.05, 36]} />
        <Toon color={g.color} />
      </S>
    </group>
  );
};

// â”€â”€â”€ arms, gloves, props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Glove: React.FC = () => (
  <group>
    <S p={[0, 0.04, 0]}>
      <cylinderGeometry args={[0.125, 0.115, 0.08, 16]} />
      <Toon color="#FFFFFF" />
    </S>
    <S p={[0, -0.09, 0.01]} s={[1, 1.05, 0.9]}>
      <sphereGeometry args={[0.135, 18, 14]} />
      <Toon color="#FFFFFF" />
    </S>
    <S p={[0.0, -0.04, 0.11]} s={[0.8, 1, 1]}>
      <sphereGeometry args={[0.055, 10, 8]} />
      <Toon color="#FFFFFF" />
    </S>
  </group>
);

const Clipboard: React.FC = () => (
  <group position={[0, -0.12, 0.2]} rotation={[-0.35, 0, 0]}>
    <S>
      <boxGeometry args={[0.34, 0.46, 0.03]} />
      <Toon color="#8C6239" />
    </S>
    <S p={[0, -0.02, 0.018]}>
      <boxGeometry args={[0.29, 0.38, 0.006]} />
      <Toon color="#F7F3EA" />
    </S>
    {[-0.08, -0.02, 0.04, 0.1].map((y) => (
      <S key={y} p={[-0.02, y - 0.04, 0.023]}>
        <boxGeometry args={[0.2, 0.014, 0.002]} />
        <Toon color="#9AA0AA" />
      </S>
    ))}
    <S p={[0, 0.21, 0.025]}>
      <boxGeometry args={[0.13, 0.06, 0.03]} />
      <Toon color="#B9BEC6" />
    </S>
  </group>
);

// Shovel carried over the right shoulder (body space): handle from the right
// hand in front of the chest, up over the shoulder, blade behind the back.
const shovelPlacement = (() => {
  const a = new THREE.Vector3(-0.2, 0.88, 0.5); // hand end
  const b = new THREE.Vector3(-0.85, 1.62, -0.35); // past the shoulder, beside the head
  const dir = b.clone().sub(a);
  const len = dir.length();
  dir.normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const e = new THREE.Euler().setFromQuaternion(q);
  return { mid: a.clone().add(b).multiplyScalar(0.5), len, rot: [e.x, e.y, e.z] as [number, number, number], end: b, dir };
})();

const ShovelOnShoulder: React.FC = () => {
  const { mid, len, rot, end, dir } = shovelPlacement;
  const blade = end.clone().add(dir.clone().multiplyScalar(0.24));
  return (
    <group>
      <S p={[mid.x, mid.y, mid.z]} r={rot}>
        <cylinderGeometry args={[0.035, 0.035, len, 10]} />
        <Toon color="#8A6440" />
      </S>
      <group position={[blade.x, blade.y, blade.z]} rotation={rot}>
        <S r={[0.25, 0, 0]}>
          <boxGeometry args={[0.4, 0.46, 0.035]} />
          <Toon color="#5C6066" />
        </S>
      </group>
    </group>
  );
};
const Arm: React.FC<{ side: 1 | -1; sleeve: string; rot: [number, number]; prop?: React.ReactNode }> = ({ side, sleeve, rot, prop }) => (
  <group position={[side * 0.41, TORSO_Y + 0.66, 0]} rotation={[-rot[0], 0, side * rot[1]]}>
    <S p={[0, -0.03, 0]}>
      <sphereGeometry args={[0.115, 16, 12]} />
      <Toon color={sleeve} />
    </S>
    <S p={[0, -0.2, 0]}>
      <capsuleGeometry args={[0.105, 0.26, 6, 14]} />
      <Toon color={sleeve} />
    </S>
    <group position={[0, -0.44, 0]}>
      <Glove />
      {prop}
    </group>
  </group>
);

// â”€â”€â”€ body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Body: React.FC<{ def: CharacterDef }> = ({ def }) => {
  const b = def.body;
  const acc = def.accessories ?? [];
  return (
    <group>
      {/* legs + shoes */}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 0.18, 0, 0]}>
          <S p={[0, 0.26, 0]}>
            <cylinderGeometry args={[0.13, 0.12, 0.36, 14]} />
            <Toon color={b.legs} />
          </S>
          <S p={[0, 0.07, 0.05]} s={[1, 0.62, 1.35]}>
            <sphereGeometry args={[0.16, 16, 12]} />
            <Toon color={b.shoes} />
          </S>
        </group>
      ))}
      {/* torso */}
      <mesh geometry={TORSO[b.torsoStyle]} position={[0, TORSO_Y, 0]} castShadow receiveShadow>
        <Toon color={b.torso} />
      </mesh>
      {/* belt / trim */}
      <S p={[0, TORSO_Y + 0.3, 0]}>
        <cylinderGeometry args={[0.455, 0.457, 0.07, 32]} />
        <Toon color={b.trim} />
      </S>
      {b.torsoStyle === "coat" && (
        <>
          {/* coat opening + buttons */}
          <S p={[0, TORSO_Y + 0.45, 0.425]} r={[-0.05, 0, 0]}>
            <boxGeometry args={[0.03, 0.62, 0.02]} />
            <Toon color={b.trim} />
          </S>
          {[0.18, 0.46, 0.6].map((y) => (
            <S key={y} p={[0.07, TORSO_Y + y, 0.44 - (y > 0.5 ? 0.02 : 0)]}>
              <sphereGeometry args={[0.028, 8, 6]} />
              <Toon color="#3A2C1E" />
            </S>
          ))}
        </>
      )}
      {acc.includes("tie") && (
        <S p={[0, TORSO_Y + 0.68, 0.36]} r={[-0.5, 0, Math.PI / 4]}>
          <boxGeometry args={[0.09, 0.09, 0.03]} />
          <Toon color="#A8322E" />
        </S>
      )}
      {acc.includes("badge") && (
        <S p={[-0.22, TORSO_Y + 0.58, 0.39]} r={[-0.35, -0.35, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 5]} />
          <Toon color="#E2B84A" emissive="#E2B84A" emissiveIntensity={0.15} />
        </S>
      )}
      {acc.includes("suspenders") &&
        [-1, 1].map((sd) => (
          <S key={sd} p={[sd * 0.2, TORSO_Y + 0.47, 0.41]} r={[-0.2, 0, sd * 0.05]}>
            <boxGeometry args={[0.06, 0.62, 0.02]} />
            <Toon color={b.trim} />
          </S>
        ))}
      {acc.includes("neckerchief") && (
        <S p={[0, TORSO_Y + 0.8, 0.14]} r={[0.5, 0, 0]}>
          <torusGeometry args={[0.2, 0.05, 8, 20]} />
          <Toon color="#B5432F" />
        </S>
      )}
    </group>
  );
};

export type CharacterProps = {
  def: CharacterDef;
  expression?: Expression;
  mouth?: MouthSlot;
  pose?: Pose;
  position?: [number, number, number];
  rotationY?: number;
  faceVariant?: FaceVariant;
  faceTint?: string; // colour faces glow with (keeps faces readable in dark scenes)
  faceGlow?: number;
};

export const Character: React.FC<CharacterProps> = ({
  def,
  expression = "neutral",
  mouth = "rest",
  pose = {},
  position = [0, 0, 0],
  rotationY = 0,
  faceVariant,
  faceTint = "#FFFFFF",
  faceGlow = 0,
}) => {
  const v = faceVariant ?? def.faceVariant;
  const armL = pose.armL ?? [0.05, 0.18];
  const prop = def.prop === "clipboard" ? <Clipboard /> : null;
  const armR = def.prop === "shovel" ? pose.armR ?? [0.95, 0.12] : pose.armR ?? [0.05, 0.18];
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={def.body.scale}>
      <group position={[0, pose.bob ?? 0, 0]} rotation={[pose.lean ?? 0, 0, 0]}>
        <Body def={def} />
        <Arm side={1} sleeve={def.body.sleeve} rot={armL} prop={def.prop === "clipboard" ? prop : null} />
        <Arm side={-1} sleeve={def.body.sleeve} rot={armR} />
        {def.prop === "shovel" && <ShovelOnShoulder />}
        <group position={[0, HEAD_Y, 0]} rotation={[pose.headNod ?? 0, pose.headYaw ?? 0, pose.headTilt ?? 0]}>
          <mesh geometry={headGeo} castShadow receiveShadow>
            <meshToonMaterial color={style.ink.paper} gradientMap={headGradient()} emissive={faceTint} emissiveIntensity={faceGlow * 0.85} />
          </mesh>
          <FacePanel sheet={faceSheetPath(def.id, v)} expression={expression} mouth={mouth} tint={faceTint} glow={faceGlow} />
          <Headgear g={def.headgear} />
        </group>
      </group>
    </group>
  );
};

export const CHARACTER_HEIGHT = 2.55; // feet to top of cap, for framing
