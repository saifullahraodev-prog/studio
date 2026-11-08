import React, { useMemo } from "react";
import * as THREE from "three";
import { useStaticTexture } from "../assets";
import { applySceneLight, makeInkPaperMaterial, useFaceLook, useSceneLight } from "../look/faceShader";
import { style, Toon } from "../look/style";
import { CharacterDef } from "./bible";
import { cellUV, Expression, eyeCellPos, faceSheetPath, FaceVariant, isHeadFace, MouthSlot } from "./face";

// ─────────────────────────────────────────────────────────────────────────────
// Chibi character, v0.2 look: big round head carrying a drawn paper face card,
// soft realistic materials on the body, white 4-finger cartoon gloves.
// The head + face use the "ink & paper" shader (crosshatched shadow side).
// Root is at the feet, facing +Z.
// ─────────────────────────────────────────────────────────────────────────────

export type Pose = {
  armL?: [number, number]; // [forward (x-rot), out (z-rot)] radians, character's left arm
  armR?: [number, number];
  headYaw?: number;
  headTilt?: number; // roll
  headNod?: number; // pitch (+ = look down)
  lean?: number;
  bob?: number;
};

const F = style.face;
const HR = F.headRadius; // 0.62
const TORSO_Y = 0.4;
const HEAD_Y = TORSO_Y + 0.86 + HR * 0.82;
const PANEL_YOFF = -0.08;

// A rectangle (w x h) wrapped onto the front of a sphere of radius r.
// UVs stay planar, so the drawing looks undistorted from the front.
const wrappedPanel = (r: number, w: number, h: number, yOff: number) => {
  const g = new THREE.PlaneGeometry(w, h, 48, 36);
  const p = g.attributes.position as THREE.BufferAttribute;
  const n = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i) + yOff;
    const z = Math.sqrt(Math.max(r * r - x * x - y * y, 0));
    p.setXYZ(i, x, y, z);
    const l = Math.hypot(x, y, z) || 1;
    n[i * 3] = x / l;
    n[i * 3 + 1] = y / l;
    n[i * 3 + 2] = z / l;
  }
  g.setAttribute("normal", new THREE.BufferAttribute(n, 3));
  return g;
};

const headGeo = new THREE.SphereGeometry(HR, 64, 48);
const panelGeo = { flush: wrappedPanel(HR + 0.004, F.panelW, F.panelH, PANEL_YOFF), raised: wrappedPanel(HR + 0.014, F.panelW, F.panelH, PANEL_YOFF) };
const outlineGeo = new THREE.SphereGeometry(HR * 1.065, 64, 48);
const rimGeo = wrappedPanel(HR + 0.006, F.panelW * 1.07, F.panelH * 1.09, PANEL_YOFF);

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
  return new THREE.LatheGeometry(pts, 40);
};
const TORSO = { coat: torsoGeo("coat"), vest: torsoGeo("vest"), shirt: torsoGeo("shirt") };

const S: React.FC<React.PropsWithChildren<{ p?: [number, number, number]; r?: [number, number, number]; s?: [number, number, number] | number }>> = ({
  p,
  r,
  s,
  children,
}) => (
  <mesh position={p} rotation={r} scale={s} castShadow receiveShadow>
    {children}
  </mesh>
);

// ─── head + face ────────────────────────────────────────────────────────────
const Head: React.FC<{ sheet: string; variant: FaceVariant; expression: Expression; mouth: MouthSlot }> = ({ sheet, variant, expression, mouth }) => {
  const headFace = isHeadFace(variant);
  const light = useSceneLight();
  const look = useFaceLook();
  const base = useStaticTexture(sheet);
  const headMat = useMemo(() => makeInkPaperMaterial({ paper: F.headPaper, hatchDensity: 30 }), []);
  const faceMat = useMemo(() => (base ? makeInkPaperMaterial({ map: base, paper: style.ink.paper, hatchDensity: 30 }) : null), [base]);
  const rimTex = useMemo(() => {
    if (!base) return null;
    const t = base.clone();
    t.needsUpdate = true;
    return t;
  }, [base]);

  const uv = cellUV(expression, mouth);
  applySceneLight(headMat, light, look.hatch);
  if (faceMat) {
    applySceneLight(faceMat, light, look.hatch);
    faceMat.uniforms.uvRepeat.value.set(...uv.repeat);
    faceMat.uniforms.uvOffset.value.set(...uv.offset);
  }
  if (rimTex) {
    rimTex.repeat.set(...uv.repeat);
    rimTex.offset.set(...uv.offset);
  }
  return (
    <group>
      <mesh geometry={headGeo} material={headMat} castShadow receiveShadow />
      {faceMat && <mesh geometry={look.rim && !headFace ? panelGeo.raised : panelGeo.flush} material={faceMat} />}
      {/* comic heads: the "rim" is an ink outline around the head's silhouette */}
      {look.rim && headFace && (
        <mesh geometry={outlineGeo}>
          <meshBasicMaterial color={style.ink.ink} side={THREE.BackSide} />
        </mesh>
      )}
      {look.rim && !headFace && rimTex && (
        <mesh geometry={rimGeo}>
          <meshBasicMaterial map={rimTex} color={style.ink.ink} alphaTest={0.5} />
        </mesh>
      )}
    </group>
  );
};

// ─── 3D wire spectacles, sitting on the face (not drawn on it) ──────────────
const cellToPanel = (px: number, py: number) => ({
  x: (px / style.face.cellW - 0.5) * F.panelW,
  y: (0.5 - py / style.face.cellH) * F.panelH + PANEL_YOFF,
});
const along = (a: THREE.Vector3, b: THREE.Vector3) => {
  const d = b.clone().sub(a);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  const e = new THREE.Euler().setFromQuaternion(q);
  return { mid: a.clone().add(b).multiplyScalar(0.5), len: d.length(), rot: [e.x, e.y, e.z] as [number, number, number] };
};
const Spectacles: React.FC<{ variant: FaceVariant }> = ({ variant }) => {
  const parts = useMemo(() => {
    const e = eyeCellPos(variant);
    const r3 = (e.ringR / style.face.cellW) * F.panelW;
    const R = HR + 0.05;
    const rings = ([-1, 1] as const).map((sd) => {
      const p = cellToPanel(style.face.cellW / 2 + sd * e.dx, e.y);
      const z = Math.sqrt(Math.max(R * R - p.x * p.x - p.y * p.y, 0));
      const pos = new THREE.Vector3(p.x, p.y, z);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize());
      const rot = new THREE.Euler().setFromQuaternion(q);
      const inner = new THREE.Vector3(-sd * r3, 0, 0).applyQuaternion(q).add(pos);
      const outer = new THREE.Vector3(sd * r3, 0.01, 0).applyQuaternion(q).add(pos);
      const ear = new THREE.Vector3(sd * (HR + 0.015), p.y + 0.03, -0.12);
      return { pos, rot: [rot.x, rot.y, rot.z] as [number, number, number], inner, outer, ear };
    });
    const bridgeTop = rings[0].inner.clone().add(rings[1].inner).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.035, 0.012));
    return { r3, rings, bridge: [along(rings[0].inner, bridgeTop), along(bridgeTop, rings[1].inner)], temples: rings.map((g) => along(g.outer, g.ear)) };
  }, [variant]);
  return (
    <group>
      {parts.rings.map((g, i) => (
        <mesh key={i} position={g.pos} rotation={g.rot} castShadow>
          <torusGeometry args={[parts.r3, 0.013, 10, 40]} />
          <Toon color="#24252B" kind="metal" roughness={0.35} />
        </mesh>
      ))}
      {[...parts.bridge, ...parts.temples].map((s, i) => (
        <mesh key={`s${i}`} position={s.mid} rotation={s.rot} castShadow>
          <cylinderGeometry args={[0.011, 0.011, s.len, 8]} />
          <Toon color="#24252B" kind="metal" roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
};

// ─── headgear (sits low on the round head, like a real helmet/cap) ──────────
const Headgear: React.FC<{ g: CharacterDef["headgear"] }> = ({ g }) => {
  if (g.type === "peakedCap") {
    return (
      <group position={[0, 0.31, 0]} scale={1.13}>
        <S p={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.54, 0.535, 0.13, 48]} />
          <Toon color={g.band ?? g.color} kind="leather" />
        </S>
        <S p={[0, 0.26, -0.03]}>
          <cylinderGeometry args={[0.68, 0.54, 0.28, 48]} />
          <Toon color={g.color} kind="wool" />
        </S>
        <S p={[0, 0.4, -0.03]} s={[1, 0.22, 1]}>
          <sphereGeometry args={[0.68, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Toon color={g.color} kind="wool" />
        </S>
        <S p={[0, 0.0, 0.42]} r={[0.3, 0, 0]} s={[1, 1, 0.6]}>
          <cylinderGeometry args={[0.5, 0.5, 0.045, 40, 1, false, -Math.PI / 2, Math.PI]} />
          <Toon color="#121318" kind="leather" roughness={0.25} />
        </S>
        {g.badge && (
          <S p={[0, 0.25, 0.6]} r={[-0.25, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.03, 6]} />
            <Toon color={g.badge} kind="brass" />
          </S>
        )}
      </group>
    );
  }
  if (g.type === "flatCap") {
    return (
      <group position={[0, 0.31, 0.02]} scale={1.13}>
        <S p={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.55, 0.535, 0.12, 48]} />
          <Toon color={g.band ?? g.color} kind="leather" />
        </S>
        <S p={[0, 0.1, 0.06]} s={[1.08, 0.45, 1.14]}>
          <sphereGeometry args={[0.6, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Toon color={g.color} kind="leather" />
        </S>
        <S p={[0, 0.06, 0.5]} r={[0.18, 0, 0]} s={[0.95, 1, 0.55]}>
          <cylinderGeometry args={[0.5, 0.5, 0.05, 40, 1, false, -Math.PI / 2, Math.PI]} />
          <Toon color={g.color} kind="leather" />
        </S>
        <S p={[0, 0.235, 0.47]}>
          <sphereGeometry args={[0.045, 12, 10]} />
          <Toon color={g.band ?? g.color} kind="leather" />
        </S>
      </group>
    );
  }
  // hardHat / helmet: dome with brim
  return (
    <group position={[0, 0.12, 0]} scale={1.12}>
      <S s={[1, 0.85, 1.05]}>
        <sphereGeometry args={[0.66, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Toon color={g.color} kind={g.type === "helmet" ? "metal" : "paint"} />
      </S>
      <S p={[0, 0, 0.06]}>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 48]} />
        <Toon color={g.color} kind={g.type === "helmet" ? "metal" : "paint"} />
      </S>
    </group>
  );
};

// ─── white 4-finger cartoon glove ───────────────────────────────────────────
const Glove: React.FC = () => (
  <group>
    <S p={[0, 0.05, 0]}>
      <cylinderGeometry args={[0.13, 0.105, 0.1, 20]} />
      <Toon color="#FFFFFF" kind="glove" />
    </S>
    <S p={[0, -0.07, 0.01]} s={[1, 0.85, 0.62]}>
      <sphereGeometry args={[0.13, 20, 16]} />
      <Toon color="#FFFFFF" kind="glove" />
    </S>
    {[-0.07, 0, 0.07].map((x, i) => (
      <S key={x} p={[x, -0.17 + (i === 1 ? -0.012 : 0), 0.015]} r={[0.15, 0, -x * 1.2]}>
        <capsuleGeometry args={[0.034, 0.07, 4, 10]} />
        <Toon color="#FFFFFF" kind="glove" />
      </S>
    ))}
    <S p={[0.0, -0.06, 0.09]} r={[1.0, 0, 0]}>
      <capsuleGeometry args={[0.036, 0.06, 4, 10]} />
      <Toon color="#FFFFFF" kind="glove" />
    </S>
  </group>
);

const Clipboard: React.FC = () => (
  <group position={[0, -0.14, 0.22]} rotation={[-0.35, 0, 0]}>
    <S>
      <boxGeometry args={[0.36, 0.48, 0.03]} />
      <Toon color="#8C6239" kind="wood" />
    </S>
    <S p={[0, -0.02, 0.018]}>
      <boxGeometry args={[0.3, 0.4, 0.006]} />
      <Toon color="#F7F3EA" kind="paint" roughness={0.9} />
    </S>
    {[-0.08, -0.02, 0.04, 0.1].map((y) => (
      <S key={y} p={[-0.02, y - 0.04, 0.023]}>
        <boxGeometry args={[0.2, 0.014, 0.002]} />
        <Toon color="#7A808A" />
      </S>
    ))}
    <S p={[0, 0.22, 0.025]}>
      <boxGeometry args={[0.13, 0.06, 0.03]} />
      <Toon color="#B9BEC6" kind="metal" />
    </S>
  </group>
);

// Shovel carried over the right shoulder (body space).
const shovelPlacement = (() => {
  const a = new THREE.Vector3(-0.2, 0.88, 0.5);
  const b = new THREE.Vector3(-0.95, 1.62, -0.35);
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
        <cylinderGeometry args={[0.035, 0.035, len, 12]} />
        <Toon color="#8A6440" kind="wood" />
      </S>
      <group position={[blade.x, blade.y, blade.z]} rotation={rot}>
        <S r={[0.25, 0, 0]}>
          <boxGeometry args={[0.4, 0.46, 0.035]} />
          <Toon color="#5C6066" kind="metal" />
        </S>
      </group>
    </group>
  );
};

const Arm: React.FC<{ side: 1 | -1; sleeve: string; rot: [number, number]; prop?: React.ReactNode }> = ({ side, sleeve, rot, prop }) => (
  <group position={[side * 0.41, TORSO_Y + 0.66, 0]} rotation={[-rot[0], 0, side * rot[1]]}>
    <S p={[0, -0.03, 0]}>
      <sphereGeometry args={[0.11, 18, 14]} />
      <Toon color={sleeve} kind="fabric" />
    </S>
    <S p={[0, -0.2, 0]}>
      <capsuleGeometry args={[0.095, 0.26, 6, 16]} />
      <Toon color={sleeve} kind="fabric" />
    </S>
    <group position={[0, -0.42, 0]}>
      <Glove />
      {prop}
    </group>
  </group>
);

// ─── body ───────────────────────────────────────────────────────────────────
const Body: React.FC<{ def: CharacterDef }> = ({ def }) => {
  const b = def.body;
  const acc = def.accessories ?? [];
  return (
    <group>
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 0.18, 0, 0]}>
          <S p={[0, 0.26, 0]}>
            <cylinderGeometry args={[0.13, 0.12, 0.36, 18]} />
            <Toon color={b.legs} kind="fabric" />
          </S>
          <S p={[0, 0.07, 0.05]} s={[1, 0.62, 1.35]}>
            <sphereGeometry args={[0.16, 18, 14]} />
            <Toon color={b.shoes} kind="leather" />
          </S>
        </group>
      ))}
      <mesh geometry={TORSO[b.torsoStyle]} position={[0, TORSO_Y, 0]} castShadow receiveShadow>
        <Toon color={b.torso} kind="fabric" />
      </mesh>
      {/* collar */}
      <S p={[0, TORSO_Y + 0.8, 0]} r={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.06, 10, 28]} />
        <Toon color={b.torso} kind="fabric" />
      </S>
      <S p={[0, TORSO_Y + 0.3, 0]}>
        <cylinderGeometry args={[0.455, 0.457, 0.07, 40]} />
        <Toon color={b.trim} kind="leather" />
      </S>
      {b.torsoStyle === "coat" && (
        <>
          <S p={[0, TORSO_Y + 0.45, 0.425]} r={[-0.05, 0, 0]}>
            <boxGeometry args={[0.03, 0.62, 0.02]} />
            <Toon color={b.trim} kind="fabric" />
          </S>
          {[0.18, 0.46, 0.6].map((y) => (
            <S key={y} p={[0.07, TORSO_Y + y, 0.44 - (y > 0.5 ? 0.02 : 0)]}>
              <sphereGeometry args={[0.028, 10, 8]} />
              <Toon color="#B8913E" kind="brass" />
            </S>
          ))}
          {[-1, 1].map((sd) => (
            <S key={sd} p={[sd * 0.25, TORSO_Y + 0.22, 0.43]} r={[-0.1, sd * 0.45, 0]}>
              <boxGeometry args={[0.2, 0.06, 0.02]} />
              <Toon color={b.trim} kind="fabric" />
            </S>
          ))}
        </>
      )}
      {acc.includes("tie") && (
        <S p={[0, TORSO_Y + 0.68, 0.36]} r={[-0.5, 0, Math.PI / 4]}>
          <boxGeometry args={[0.09, 0.09, 0.03]} />
          <Toon color="#A8322E" kind="fabric" />
        </S>
      )}
      {acc.includes("badge") && (
        <S p={[-0.22, TORSO_Y + 0.58, 0.39]} r={[-0.35, -0.35, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 5]} />
          <Toon color="#E2B84A" kind="brass" />
        </S>
      )}
      {acc.includes("suspenders") &&
        [-1, 1].map((sd) => (
          <S key={sd} p={[sd * 0.2, TORSO_Y + 0.47, 0.41]} r={[-0.2, 0, sd * 0.05]}>
            <boxGeometry args={[0.06, 0.62, 0.02]} />
            <Toon color={b.trim} kind="leather" />
          </S>
        ))}
      {acc.includes("neckerchief") && (
        <S p={[0, TORSO_Y + 0.82, 0.12]} r={[0.5 + Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.055, 10, 24]} />
          <Toon color="#B5432F" kind="fabric" />
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
};

export const Character: React.FC<CharacterProps> = ({ def, expression = "neutral", mouth = "rest", pose = {}, position = [0, 0, 0], rotationY = 0, faceVariant }) => {
  const v = faceVariant ?? def.faceVariant;
  const armL = pose.armL ?? [0.05, 0.18];
  const armR = def.prop === "shovel" ? pose.armR ?? [0.95, 0.12] : pose.armR ?? [0.05, 0.18];
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={def.body.scale}>
      <group position={[0, pose.bob ?? 0, 0]} rotation={[pose.lean ?? 0, 0, 0]}>
        <Body def={def} />
        <Arm side={1} sleeve={def.body.sleeve} rot={armL} prop={def.prop === "clipboard" ? <Clipboard /> : null} />
        <Arm side={-1} sleeve={def.body.sleeve} rot={armR} />
        {def.prop === "shovel" && <ShovelOnShoulder />}
        <group position={[0, HEAD_Y, 0]} rotation={[pose.headNod ?? 0, pose.headYaw ?? 0, pose.headTilt ?? 0]}>
          <Head sheet={faceSheetPath(def.id, v)} variant={v} expression={expression} mouth={mouth} />
          {def.faceExtras.glasses && <Spectacles variant={v} />}
          <Headgear g={def.headgear} />
        </group>
      </group>
    </group>
  );
};

export const CHARACTER_HEIGHT = HEAD_Y + HR + 0.3; // feet to top of cap, for framing
export const HEAD_HEIGHT = HEAD_Y;
