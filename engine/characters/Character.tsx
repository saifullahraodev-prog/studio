import React, { useMemo } from "react";
import { getInputProps } from "remotion";
import * as THREE from "three";
import { useStaticTexture } from "../assets";
import { applySceneLight, makeInkPaperMaterial, useFaceLook, useSceneLight } from "../look/faceShader";
import { style, Toon } from "../look/style";
import { StampTool } from "../props/Props";
import { HandProp } from "../props/HandProps";
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
  walk?: number; // walk-cycle phase (radians); advance it with time
  stride?: number; // 0 standing, 0.5 walk, 1 run
  noProp?: boolean; // hide the character's hand prop for this shot (e.g. holding something else)
  fingersL?: number; // digits extended on each glove (0 fist … 4 open)
  fingersR?: number;
  holdR?: string; // prop held in the right glove: "stamp" | "oar" | "lantern" | ... (HandProps)
  roll?: number; // whole-body sideways tilt (radians, about the feet): falls, wobbles
  legs?: [number, number]; // explicit leg swing [left, right] (radians, + = forward): climbing, kneeling
  sink?: number; // lower the whole body (crouch / sit), metres
  // animation upgrade (review 2): joints, travel, squash, props
  elbowL?: number; // elbow bend (radians, + = forearm forward/up); default 0.15
  elbowR?: number;
  kneeL?: number; // knee bend (radians, + = shin back); default 0
  kneeR?: number;
  root?: [number, number, number]; // move the whole body (character space: +z = forward), metres
  squash?: number; // 1 = normal, <1 squashed (landing), >1 stretched (jump); keeps volume
  turn?: number; // extra body yaw (radians) on top of rotationY
  holdL?: string; // prop held in the left glove (see engine/props/HandProps)
};

const F = style.face;
const HR = F.headRadius; // 0.62
// Body proportions (review 2): longer legs / taller torso give movement room under the big head.
// style.body = { legScale, torsoScale, armScale }; a render can override with input props of the same names.
const PROP_IN = getInputProps() as { legScale?: number; torsoScale?: number; armScale?: number };
const BODY = (style as unknown as { body?: { legScale?: number; torsoScale?: number; armScale?: number } }).body ?? {};
const LS = PROP_IN.legScale ?? BODY.legScale ?? 1;
const TS = PROP_IN.torsoScale ?? BODY.torsoScale ?? 1;
const AS = PROP_IN.armScale ?? BODY.armScale ?? 1;
const HIP_Y = 0.07 + 0.37 * LS;
const TORSO_Y = HIP_Y - 0.04;
const HEAD_Y = TORSO_Y + 0.86 * TS + HR * 0.82;
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
const lathe = (pts: number[][]) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 40);
// shirtwaist blouse: nipped waist, fuller chest, high neck
const blouseGeo = lathe([[0, 0], [0.37, 0], [0.39, 0.04], [0.36, 0.22], [0.42, 0.45], [0.43, 0.58], [0.39, 0.72], [0.28, 0.82], [0.12, 0.86], [0, 0.86]]);
const TORSO = { coat: torsoGeo("coat"), vest: torsoGeo("vest"), shirt: torsoGeo("shirt"), blouse: blouseGeo, robe: torsoGeo("coat") };
// long 1910s skirt: waist at the torso bottom, hem just above the shoes
const skirtGeo = lathe([[0, 0.08], [0.47, 0.08], [0.5, 0.11], [0.46, 0.24], [0.41, 0.4], [0.385, 0.46], [0, 0.46]]);

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
const Head: React.FC<{ sheet: string; variant: FaceVariant; expression: Expression; mouth: MouthSlot; skin?: string }> = ({ sheet, variant, expression, mouth, skin }) => {
  const headFace = isHeadFace(variant);
  const light = useSceneLight();
  const look = useFaceLook();
  const base = useStaticTexture(sheet);
  // whole-head comic faces are paper-coloured; paper-panel faces sit on a skin-toned head
  const headMat = useMemo(() => makeInkPaperMaterial({ paper: headFace ? F.headPaper : skin ?? "#E2B993", hatchDensity: 30 }), [headFace, skin]);
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
      {look.rim && !headFace && variant !== "E" && rimTex && (
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

// ─── hair (1910s styles, chunky chibi volumes) ─────────────────────────────
// Front hairline stays above the drawn brows (face panel), so expressions are never covered.
// One hair shell: a sphere slightly bigger than the head with the face window cut out.
// The window is a rounded arch (open over the drawn features, hair framing the temples),
// so there are no hard seams from the side or back.
const hairShell = (() => {
  const R = HR * 1.045;
  const g = new THREE.SphereGeometry(R, 96, 64);
  const pos = g.attributes.position as THREE.BufferAttribute;
  // hairline height (in units of R) for a direction around the head: arches over the face,
  // drops in front of the ears, then runs round to the nape. One continuous curve.
  const line = (ang: number) => {
    if (ang < 1.2) return 0.39 - 0.75 * Math.pow(ang / 1.2, 3);
    const k = Math.min(1, (ang - 1.2) / 0.8);
    return -0.36 - 0.26 * k * k * (3 - 2 * k);
  };
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const ang = Math.abs(Math.atan2(x, z));
    const ly = line(ang) * R;
    if (y < ly) {
      // slide the vertex up onto the hairline, staying on the sphere: a clean curved edge
      const hr = Math.hypot(x, z) || 1e-6;
      const nh = Math.sqrt(Math.max(R * R - ly * ly, 0));
      pos.setXYZ(i, (x / hr) * nh, ly, (z / hr) * nh);
    }
  }
  g.computeVertexNormals();
  return g;
})();
const hairFringe = new THREE.SphereGeometry(HR * 1.04, 48, 12, Math.PI * 0.9, Math.PI * 1.2, 1.45, 0.42);
const Hair: React.FC<{ h: NonNullable<CharacterDef["hair"]> }> = ({ h }) => {
  const m = <Toon color={h.color} kind="wool" roughness={0.75} />;
  if (h.style === "bald") return <mesh geometry={hairFringe} castShadow>{m}</mesh>;
  return (
    <group>
      <mesh geometry={hairShell} scale={h.style === "gibson" ? [1.03, 1.08, 1.03] : 1} castShadow>
        {m}
      </mesh>
      {h.style === "gibson" && (
        <>
          {/* pompadour roll over the forehead + top knot */}
          <S p={[0, HR * 0.86, HR * 0.5]} r={[-0.5, 0, 0]} s={[1.75, 0.7, 0.9]}>
            <sphereGeometry args={[0.27, 28, 18]} />
            {m}
          </S>
          <S p={[0, HR * 1.12, -HR * 0.22]}>
            <sphereGeometry args={[0.24, 24, 16]} />
            {m}
          </S>
        </>
      )}
      {h.style === "bun" && (
        <S p={[0, HR * 0.42, -HR * 0.9]}>
          <sphereGeometry args={[0.22, 24, 16]} />
          {m}
        </S>
      )}
      {h.style === "braid" &&
        [0, 1, 2, 3, 4].map((i) => (
          <S key={i} p={[0, -0.12 - i * 0.13, -HR * 0.92 + i * 0.03]} s={[1, 1.1, 0.9]}>
            <sphereGeometry args={[0.095 - i * 0.008, 14, 10]} />
            {m}
          </S>
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
  if (g.type === "none") return null;
  if (g.type === "brodie") {
    // British "Brodie" helmet: shallow dish sitting low on the head, wide flat brim
    return (
      <group position={[0, 0.32, -0.02]} rotation={[-0.06, 0, 0]}>
        <S s={[1, 0.72, 1]}>
          <sphereGeometry args={[0.72, 44, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Toon color={g.color} kind="metal" roughness={0.75} />
        </S>
        <S p={[0, 0.0, 0]}>
          <cylinderGeometry args={[0.98, 1.0, 0.035, 48]} />
          <Toon color={g.color} kind="metal" roughness={0.75} />
        </S>
        <S p={[0, -0.005, 0]} r={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.99, 0.022, 6, 48]} />
          <Toon color={g.band ?? g.color} kind="metal" />
        </S>
      </group>
    );
  }
  if (g.type === "stahlhelm") {
    // coal-scuttle steel helmet: deep dome, flared skirt over the ears and neck, short peak
    return (
      <group position={[0, 0.24, -0.02]} scale={1.1}>
        <S p={[0, 0.14, 0]} s={[1, 0.95, 1.05]}>
          <sphereGeometry args={[0.62, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Toon color={g.color} kind="metal" roughness={0.7} />
        </S>
        <S p={[0, 0.06, -0.04]} s={[1, 1, 1.05]}>
          <cylinderGeometry args={[0.64, 0.74, 0.2, 40, 1, true, Math.PI * 0.62, Math.PI * 1.76]} />
          <Toon color={g.color} kind="metal" roughness={0.7} side={THREE.DoubleSide} />
        </S>
        <S p={[0, 0.13, 0.55]} r={[0.35, 0, 0]} s={[1, 1, 0.5]}>
          <cylinderGeometry args={[0.45, 0.45, 0.03, 30, 1, false, -Math.PI / 2, Math.PI]} />
          <Toon color={g.color} kind="metal" roughness={0.7} />
        </S>
        {[-1, 1].map((sd) => (
          <S key={sd} p={[sd * 0.62, 0.22, 0.05]} r={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.04, 10]} />
            <Toon color={g.band ?? g.color} kind="metal" />
          </S>
        ))}
      </group>
    );
  }
  if (g.type === "fireHelmet") {
    // 1910s New York leather fire helmet: tall dome, long back brim, front shield
    return (
      <group position={[0, 0.28, 0]} scale={1.1}>
        <S p={[0, 0.12, 0]} s={[0.92, 1.1, 1.02]}>
          <sphereGeometry args={[0.6, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Toon color={g.color} kind="leather" roughness={0.35} />
        </S>
        {[-0.5, -0.25, 0, 0.25, 0.5].map((a) => (
          <S key={a} p={[0, 0.12, 0]} r={[0, a, 0]} s={[0.93, 1.11, 1.03]}>
            <torusGeometry args={[0.6, 0.012, 6, 30, Math.PI]} />
            <Toon color={g.color} kind="leather" roughness={0.3} />
          </S>
        ))}
        <S p={[0, 0.1, -0.16]} r={[0.12, 0, 0]} s={[1, 1, 1.45]}>
          <cylinderGeometry args={[0.66, 0.68, 0.035, 40]} />
          <Toon color={g.color} kind="leather" roughness={0.35} />
        </S>
        <S p={[0, 0.48, 0.5]} r={[-0.25, 0, 0]}>
          <boxGeometry args={[0.36, 0.42, 0.03]} />
          <Toon color={g.trim ?? "#B9862F"} kind="leather" />
        </S>
        <S p={[0, 0.5, 0.52]} r={[-0.25, 0, 0]}>
          <boxGeometry args={[0.28, 0.32, 0.02]} />
          <Toon color={g.badge ?? "#E9DFC6"} kind="paint" />
        </S>
        <S p={[0, 0.8, 0.02]}>
          <sphereGeometry args={[0.07, 14, 10]} />
          <Toon color={g.trim ?? "#B9862F"} kind="brass" />
        </S>
      </group>
    );
  }
  if (g.type === "ladyHat") {
    // wide-brim 1910s hat with a ribbon and bow, sitting on top of the hair
    return (
      <group position={[0, 0.5, -0.04]} rotation={[-0.12, 0, 0.06]} scale={1.05}>
        <S p={[0, 0, 0]}>
          <cylinderGeometry args={[0.9, 0.86, 0.04, 48]} />
          <Toon color={g.color} kind="wool" />
        </S>
        <S p={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.42, 0.5, 0.3, 40]} />
          <Toon color={g.color} kind="wool" />
        </S>
        <S p={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.505, 0.51, 0.1, 40]} />
          <Toon color={g.band ?? g.color} kind="fabric" />
        </S>
        {[-1, 1].map((sd) => (
          <S key={sd} p={[0.38 + sd * 0.08, 0.1, 0.32]} r={[0, 0.6, sd * 0.6]} s={[1, 0.6, 0.4]}>
            <sphereGeometry args={[0.09, 12, 10]} />
            <Toon color={g.trim ?? g.band ?? g.color} kind="fabric" />
          </S>
        ))}
      </group>
    );
  }
  if (g.type === "bowler") {
    return (
      <group position={[0, 0.3, 0]} scale={1.05}>
        <S p={[0, 0.16, 0]} s={[1, 1.05, 1]}>
          <sphereGeometry args={[0.56, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Toon color={g.color} kind="wool" />
        </S>
        <S p={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.565, 0.57, 0.1, 40]} />
          <Toon color={g.band ?? g.color} kind="leather" />
        </S>
        <S p={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.78, 0.76, 0.04, 40]} />
          <Toon color={g.color} kind="wool" />
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
// `up` = how many digits are extended (0 = fist … 4 = open hand). Order: index,
// middle, ring, thumb. Folded digits curl into the palm.
const Glove: React.FC<{ up?: number }> = ({ up = 4 }) => (
  <group>
    <S p={[0, 0.05, 0]}>
      <cylinderGeometry args={[0.13, 0.105, 0.1, 20]} />
      <Toon color="#FFFFFF" kind="glove" />
    </S>
    <S p={[0, -0.07, 0.01]} s={[1, 0.85, 0.62]}>
      <sphereGeometry args={[0.13, 20, 16]} />
      <Toon color="#FFFFFF" kind="glove" />
    </S>
    {[-0.07, 0, 0.07].map((x, i) => {
      const open = i < up;
      return (
        <S key={x} p={[x, open ? -0.17 + (i === 1 ? -0.012 : 0) : -0.13, open ? 0.015 : 0.06]} r={[open ? 0.15 : 1.6, 0, -x * 1.2]} s={open ? 1 : [1, 0.55, 1]}>
          <capsuleGeometry args={[0.034, 0.07, 4, 10]} />
          <Toon color="#FFFFFF" kind="glove" />
        </S>
      );
    })}
    <S p={[0.0, -0.06, 0.09]} r={[up >= 4 ? 1.0 : 1.5, 0, 0]} s={up >= 4 ? 1 : [1, 0.7, 1]}>
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

const Gavel: React.FC = () => (
  <group position={[0, -0.12, 0.08]} rotation={[0.3, 0, 0]}>
    <S p={[0, -0.05, 0.12]} r={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.025, 0.025, 0.34, 10]} />
      <Toon color="#6A4428" kind="wood" />
    </S>
    <S p={[0, -0.05, 0.3]} r={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.065, 0.065, 0.22, 16]} />
      <Toon color="#5A3820" kind="wood" />
    </S>
  </group>
);
const Notebook: React.FC = () => (
  <group position={[0, -0.12, 0.18]} rotation={[-0.4, 0, 0]}>
    <S>
      <boxGeometry args={[0.24, 0.32, 0.04]} />
      <Toon color="#5C2A2E" kind="leather" />
    </S>
    <S p={[0, 0, 0.021]}>
      <boxGeometry args={[0.2, 0.28, 0.004]} />
      <Toon color="#F2EBDC" kind="paint" roughness={0.9} />
    </S>
  </group>
);
const AxeOnShoulder: React.FC = () => {
  const { mid, len, rot, end, dir } = shovelPlacement;
  const head = end.clone().add(dir.clone().multiplyScalar(0.04));
  return (
    <group>
      <S p={[mid.x, mid.y, mid.z]} r={rot}>
        <cylinderGeometry args={[0.032, 0.032, len, 12]} />
        <Toon color="#9A6A3A" kind="wood" />
      </S>
      <group position={[head.x, head.y, head.z]} rotation={rot}>
        <S p={[0.12, 0, 0]}>
          <boxGeometry args={[0.26, 0.12, 0.05]} />
          <Toon color="#A8322E" kind="paint" />
        </S>
        <S p={[-0.12, 0, 0]} r={[0, 0, 0.3]}>
          <coneGeometry args={[0.05, 0.2, 4]} />
          <Toon color="#A8322E" kind="paint" />
        </S>
      </group>
    </group>
  );
};

// Arm with an elbow (review 2): shoulder -> upper arm -> elbow -> forearm -> glove.
// About a third longer than before so gestures read big; `elbow` bends the forearm forward/up.
const Arm: React.FC<{ side: 1 | -1; sleeve: string; rot: [number, number]; elbow?: number; prop?: React.ReactNode; fingers?: number; puff?: boolean }> = ({ side, sleeve, rot, elbow = 0.15, prop, fingers, puff }) => (
  <group position={[side * 0.41, TORSO_Y + 0.66 * TS, 0]} rotation={[-rot[0], 0, side * rot[1]]}>
    <S p={[0, puff ? -0.05 : -0.03, 0]} s={puff ? [1.45, 1.6, 1.45] : 1}>
      <sphereGeometry args={[0.11, 18, 14]} />
      <Toon color={sleeve} kind="fabric" />
    </S>
    <S p={[0, -0.15 * AS, 0]}>
      <capsuleGeometry args={[0.095, 0.17 * AS, 6, 16]} />
      <Toon color={sleeve} kind="fabric" />
    </S>
    <group position={[0, -0.29 * AS, 0]} rotation={[-elbow, 0, 0]}>
      <S>
        <sphereGeometry args={[0.092, 14, 10]} />
        <Toon color={sleeve} kind="fabric" />
      </S>
      <S p={[0, -0.13 * AS, 0]}>
        <capsuleGeometry args={[0.088, 0.16 * AS, 6, 16]} />
        <Toon color={sleeve} kind="fabric" />
      </S>
      <group position={[0, -0.3 * AS, 0]}>
        <Glove up={fingers} />
        {prop}
      </group>
    </group>
  </group>
);

// ─── body ───────────────────────────────────────────────────────────────────
const Body: React.FC<{ def: CharacterDef; legSwing?: number; legs?: [number, number]; knees?: [number, number] }> = ({ def, legSwing = 0, legs, knees = [0, 0] }) => {
  const b = def.body;
  const acc = def.accessories ?? [];
  return (
    <group>
      {[-1, 1].map((sd) => (
        // legs pivot at the hip so they can swing for walk/run cycles
        <group key={sd} position={[sd * 0.18, HIP_Y, 0]} rotation={[legs ? -legs[sd > 0 ? 0 : 1] : sd * legSwing, 0, 0]}>
          {/* thigh, then a knee joint, then shin + shoe */}
          {b.lower !== "skirt" && (
            <S p={[0, -0.1 * LS, 0]}>
              <cylinderGeometry args={[0.13, 0.125, 0.2 * LS, 18]} />
              <Toon color={b.legs} kind="fabric" />
            </S>
          )}
          <group position={[0, -0.2 * LS, 0]} rotation={[knees[sd > 0 ? 0 : 1], 0, 0]}>
            {b.lower !== "skirt" && (
              <S p={[0, -0.085 * LS, 0]}>
                <cylinderGeometry args={[0.125, 0.12, 0.18 * LS, 18]} />
                <Toon color={b.legs} kind="fabric" />
              </S>
            )}
            <S p={[0, -0.17 * LS, 0.05]} s={[1, 0.62, 1.35]}>
              <sphereGeometry args={[0.16, 18, 14]} />
              <Toon color={b.shoes} kind="leather" />
            </S>
          </group>
        </group>
      ))}
      <mesh geometry={TORSO[b.torsoStyle]} position={[0, TORSO_Y, 0]} scale={[1, TS, 1]} castShadow receiveShadow>
        <Toon color={b.torso} kind="fabric" />
      </mesh>
      {b.lower === "skirt" && (
        // skirt sways a little with the stride
        <mesh geometry={skirtGeo} rotation={[legSwing * 0.08, 0, 0]} scale={[1, (TORSO_Y + 0.06) / 0.46, 1]} castShadow receiveShadow>
          <Toon color={b.skirt ?? b.legs} kind="wool" />
        </mesh>
      )}
      {/* collar */}
      <S p={[0, TORSO_Y + 0.8 * TS, 0]} r={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.06, 10, 28]} />
        <Toon color={b.torso} kind="fabric" />
      </S>
      {acc.includes("highCollar") && (
        <S p={[0, TORSO_Y + 0.86 * TS, 0]}>
          <cylinderGeometry args={[0.2, 0.23, 0.14, 28, 1, true]} />
          <Toon color={b.torso} kind="fabric" side={THREE.DoubleSide} />
        </S>
      )}
      {b.torsoStyle === "blouse" ? (
        <S p={[0, TORSO_Y + 0.03 * TS, 0]}>
          <cylinderGeometry args={[0.395, 0.4, 0.07, 40]} />
          <Toon color={b.trim} kind="leather" />
        </S>
      ) : b.torsoStyle !== "robe" ? (
        <S p={[0, TORSO_Y + 0.3 * TS, 0]}>
          <cylinderGeometry args={[0.455, 0.457, 0.07, 40]} />
          <Toon color={b.trim} kind="leather" />
        </S>
      ) : null}
      {b.torsoStyle === "blouse" &&
        [0.3, 0.45, 0.6].map((y) => (
          <S key={y} p={[0, TORSO_Y + y * TS, (y < 0.4 ? 0.385 : 0.425) + 0.005]}>
            <sphereGeometry args={[0.022, 10, 8]} />
            <Toon color="#F7F4EC" kind="paint" roughness={0.3} />
          </S>
        ))}
      {acc.includes("whiteCollar") &&
        [-1, 1].map((sd) => (
          <S key={sd} p={[sd * 0.05, TORSO_Y + 0.7 * TS, 0.33]} r={[-0.35, 0, sd * 0.12]}>
            <boxGeometry args={[0.07, 0.2, 0.015]} />
            <Toon color="#F4F1EA" kind="paint" />
          </S>
        ))}
      {acc.includes("webbing") && (
        <>
          {[-1, 1].map((sd) => (
            <S key={`w${sd}`} p={[sd * 0.2, TORSO_Y + 0.5 * TS, 0.4]} r={[-0.15, 0, sd * 0.3]}>
              <boxGeometry args={[0.07, 0.7 * TS, 0.02]} />
              <Toon color="#8A7E58" kind="fabric" />
            </S>
          ))}
          {[-0.25, 0, 0.25].map((x) => (
            <S key={`p${x}`} p={[x, TORSO_Y + 0.22 * TS, 0.43]}>
              <boxGeometry args={[0.18, 0.16, 0.08]} />
              <Toon color="#8A7E58" kind="fabric" />
            </S>
          ))}
        </>
      )}
      {acc.includes("fueltank") && (
        <group position={[0, TORSO_Y + 0.45 * TS, -0.52]}>
          {[-0.17, 0.17].map((x) => (
            <S key={x} p={[x, 0, 0]}>
              <capsuleGeometry args={[0.16, 0.62 * TS, 6, 16]} />
              <Toon color="#3A3D36" kind="metal" roughness={0.45} />
            </S>
          ))}
          <S p={[0, 0.48 * TS, 0]} r={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
            <Toon color="#7A6A4A" kind="brass" />
          </S>
          <S p={[0.3, -0.25, 0.25]} r={[0.6, 0, 0.4]}>
            <torusGeometry args={[0.3, 0.035, 6, 20, Math.PI]} />
            <Toon color="#1E1E1E" kind="rubber" />
          </S>
        </group>
      )}
      {acc.includes("watchChain") && (
        <S p={[0.12, TORSO_Y + 0.42 * TS, 0.44]} r={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.12, 0.012, 6, 20, Math.PI]} />
          <Toon color="#D9B04A" kind="brass" />
        </S>
      )}
      {b.torsoStyle === "coat" && (
        <>
          <S p={[0, TORSO_Y + 0.45 * TS, 0.425]} r={[-0.05, 0, 0]}>
            <boxGeometry args={[0.03, 0.62, 0.02]} />
            <Toon color={b.trim} kind="fabric" />
          </S>
          {[0.18, 0.46, 0.6].map((y) => (
            <S key={y} p={[0.07, TORSO_Y + y * TS, 0.44 - (y > 0.5 ? 0.02 : 0)]}>
              <sphereGeometry args={[0.028, 10, 8]} />
              <Toon color="#B8913E" kind="brass" />
            </S>
          ))}
          {[-1, 1].map((sd) => (
            <S key={sd} p={[sd * 0.25, TORSO_Y + 0.22 * TS, 0.43]} r={[-0.1, sd * 0.45, 0]}>
              <boxGeometry args={[0.2, 0.06, 0.02]} />
              <Toon color={b.trim} kind="fabric" />
            </S>
          ))}
        </>
      )}
      {acc.includes("tie") && (
        <S p={[0, TORSO_Y + 0.68 * TS, 0.36]} r={[-0.5, 0, Math.PI / 4]}>
          <boxGeometry args={[0.09, 0.09, 0.03]} />
          <Toon color="#A8322E" kind="fabric" />
        </S>
      )}
      {acc.includes("badge") && (
        <S p={[-0.22, TORSO_Y + 0.58 * TS, 0.39]} r={[-0.35, -0.35, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 5]} />
          <Toon color="#E2B84A" kind="brass" />
        </S>
      )}
      {acc.includes("suspenders") &&
        [-1, 1].map((sd) => (
          <S key={sd} p={[sd * 0.2, TORSO_Y + 0.47 * TS, 0.41]} r={[-0.2, 0, sd * 0.05]}>
            <boxGeometry args={[0.06, 0.62, 0.02]} />
            <Toon color={b.trim} kind="leather" />
          </S>
        ))}
      {acc.includes("neckerchief") && (
        <S p={[0, TORSO_Y + 0.82 * TS, 0.12]} r={[0.5 + Math.PI / 2, 0, 0]}>
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
  // walk / run cycle: stride 0 = standing, ~0.5 = walk, 1 = run
  const stride = pose.stride ?? 0;
  const ph = pose.walk ?? 0;
  const swing = Math.sin(ph) * 0.75 * stride;
  const armSwing = Math.sin(ph) * 0.9 * stride;
  const bob = (pose.bob ?? 0) + Math.abs(Math.sin(ph)) * 0.07 * stride;
  const lean = (pose.lean ?? 0) + 0.18 * stride;
  const armL: [number, number] = pose.armL ?? [0.05 - armSwing, 0.18 + 0.1 * stride];
  const armR: [number, number] = def.prop === "shovel" || def.prop === "axe" ? pose.armR ?? [0.95, 0.12] : pose.armR ?? [0.05 + armSwing, 0.18 + 0.1 * stride];
  return (
    <group position={position} rotation={[0, rotationY + (pose.turn ?? 0), 0]} scale={def.body.scale}>
      <group position={pose.root ?? [0, 0, 0]} scale={[1 / Math.sqrt(pose.squash ?? 1), pose.squash ?? 1, 1 / Math.sqrt(pose.squash ?? 1)]}>
      <group position={[0, bob - (pose.sink ?? 0), 0]} rotation={[lean, 0, pose.roll ?? 0]}>
        <Body def={def} legSwing={swing} legs={pose.legs} knees={[pose.kneeL ?? Math.max(0, -swing) * 0.9 * stride, pose.kneeR ?? Math.max(0, swing) * 0.9 * stride]} />
        <Arm
          side={1}
          sleeve={def.body.sleeve}
          rot={armL}
          puff={def.body.puffSleeves}
          elbow={pose.elbowL ?? 0.15 + 0.5 * stride}
          prop={pose.holdL ? <HandProp name={pose.holdL} Stamp={StampTool} /> : pose.noProp ? null : def.prop === "clipboard" ? <Clipboard /> : def.prop === "notebook" ? <Notebook /> : null}
          fingers={pose.fingersL ?? (pose.holdL ? 0 : undefined)}
        />
        <Arm
          side={-1}
          sleeve={def.body.sleeve}
          rot={armR}
          puff={def.body.puffSleeves}
          elbow={pose.elbowR ?? 0.15 + 0.5 * stride}
          fingers={pose.fingersR ?? (pose.holdR ? 0 : undefined)}
          prop={pose.holdR ? <HandProp name={pose.holdR} Stamp={StampTool} /> : def.prop === "gavel" && !pose.noProp ? <Gavel /> : null}
        />
        {def.prop === "shovel" && !pose.noProp && <ShovelOnShoulder />}
        {def.prop === "axe" && !pose.noProp && <AxeOnShoulder />}
        <group position={[0, HEAD_Y, 0]} rotation={[pose.headNod ?? 0, pose.headYaw ?? 0, pose.headTilt ?? 0]}>
          <Head sheet={faceSheetPath(def.id, v)} variant={v} expression={expression} mouth={mouth} skin={def.skin} />
          {def.hair && <Hair h={def.hair} />}
          {def.faceExtras.glasses && <Spectacles variant={v} />}
          <Headgear g={def.headgear} />
        </group>
      </group>
      </group>
    </group>
  );
};

export const CHARACTER_HEIGHT = HEAD_Y + HR + 0.3; // feet to top of cap, for framing
export const HEAD_HEIGHT = HEAD_Y;
