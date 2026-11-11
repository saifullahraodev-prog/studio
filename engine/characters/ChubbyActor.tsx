import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { createPortal, useThree } from "@react-three/fiber";
import { staticFile, useDelayRender } from "remotion";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { CharacterDef } from "./bible";
import { Head, Headgear } from "./Character";
import { Expression, faceSheetPath, FaceVariant, MouthSlot } from "./face";
import { PART_LOOK } from "./ChubbyBody";
import { HandProp } from "../props/HandProps";
import { Real } from "../look/materials";
import { Toon } from "../look/style";

// ─────────────────────────────────────────────────────────────────────────────
// The chubby WW1 soldier (tools/chubby_body.mjs), rigged by Mixamo's auto-rigger, playing
// Mixamo motion capture (owner's downloads, 2026-11-11). Reference look: our round head with
// bean eyes + real steel helmet on the neck, real cloth on the uniform, big white mittens.
// Body file: public/models/mixamo/chubby/body.fbx (metres, ~1.45 m incl. placeholder head);
// clips: public/models/mixamo/chubby/clips/<name>.json (tools/fbx_clips.mjs). Frame-driven.
// ─────────────────────────────────────────────────────────────────────────────

export type ChubbyClip =
  | "rifle-aim" | "rifle-fire" | "rifle-run" | "rifle-walk" | "crouch-idle" | "crouch-walk-kneel" | "terrified"
  | "hit-reaction" | "jump-down" | "run" | "stagger-run" | "scream";

const ROOT = "models/mixamo/chubby";
let bodyPromise: Promise<THREE.Group> | null = null;
const loadBody = () => {
  if (!bodyPromise)
    bodyPromise = new FBXLoader().loadAsync(staticFile(`${ROOT}/body.fbx`)).then((g) => {
      g.animations = [];
      g.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.castShadow = true;
          m.receiveShadow = true;
          m.frustumCulled = false;
        }
      });
      return g;
    });
  return bodyPromise;
};
const clipCache = new Map<string, Promise<THREE.AnimationClip>>();
const loadClip = (name: string) => {
  let p = clipCache.get(name);
  if (!p) {
    p = fetch(staticFile(`${ROOT}/clips/${name}.json`))
      .then((r) => r.json())
      .then((j) => THREE.AnimationClip.parse(j));
    clipCache.set(name, p);
  }
  return p;
};

const useAssets = (clip: string) => {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const advance = useThree((s) => s.advance);
  const [a, setA] = useState<{ body: THREE.Group; clip: THREE.AnimationClip } | null>(null);
  const h = useRef<number | null>(null);
  useLayoutEffect(() => {
    let alive = true;
    h.current = delayRender(`chubby ${clip}`, { timeoutInMilliseconds: 120000 });
    Promise.all([loadBody(), loadClip(clip)])
      .then(([body, c]) => alive && setA({ body, clip: c }))
      .catch((e) => cancelRender(e));
    return () => {
      alive = false;
      if (h.current !== null) {
        continueRender(h.current);
        h.current = null;
      }
    };
  }, [clip]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!a || h.current === null) return;
    advance(performance.now());
    continueRender(h.current);
    h.current = null;
  }, [a, advance, continueRender]);
  return a;
};

// uniform colours per side (British khaki / German field-grey)
const UNIFORM: Record<string, Partial<Record<string, string>>> = {
  khaki: {},
  fieldgrey: { tunic: "#7E8676", trousers: "#6E7466", puttees: "#4A4038", webbing: "#5E5040" },
};

export const ChubbyActor: React.FC<{
  def: CharacterDef;
  clip: ChubbyClip;
  t: number;
  loop?: boolean;
  speed?: number;
  position?: [number, number, number];
  rotationY?: number;
  size?: number; // world scale of the body (1.8 -> ~2.6 m with the head)
  expression?: Expression;
  mouth?: MouthSlot;
  face?: FaceVariant;
  uniform?: "khaki" | "fieldgrey";
  rifle?: boolean; // two-hand rifle from right hand through left hand
  headK?: number; // head size multiplier
  handK?: number; // mitten size
}> = ({ def, clip, t, loop = true, speed = 1, position, rotationY = 0, size = 1.8, expression = "neutral", mouth = "rest", face = "R", uniform = "khaki", rifle = false, headK = 1, handK = 1.5 }) => {
  const a = useAssets(clip);
  const rig = useMemo(() => {
    if (!a) return null;
    const root = cloneSkinned(a.body) as THREE.Group;
    const meshes: THREE.Mesh[] = [];
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        if (m.name === "skin") m.visible = false; // placeholder head + neck: ours goes on instead
        else meshes.push(m);
      }
    });
    const bone = (n: string) => root.getObjectByName(`mixamorig${n}`) as THREE.Bone;
    const mixer = new THREE.AnimationMixer(root);
    mixer.clipAction(a.clip).play();
    return { root, meshes, bone, mixer, dur: a.clip.duration };
  }, [a]);
  if (!rig) return null;

  const tt = t * speed;
  rig.mixer.setTime(loop ? ((tt % rig.dur) + rig.dur) % rig.dur : Math.min(Math.max(tt, 0), rig.dur - 1e-3));
  rig.bone("LeftHand").scale.setScalar(handK);
  rig.bone("RightHand").scale.setScalar(handK);
  rig.root.updateMatrixWorld(true);
  const head = rig.bone("Head");
  const neck = rig.bone("Neck");

  let gun: { p: THREE.Vector3; q: THREE.Quaternion } | null = null;
  if (rifle) {
    const parentWorld = rig.root.matrixWorld.clone().multiply(rig.root.matrix.clone().invert());
    const inv = parentWorld.invert();
    const at = (n: string) => new THREE.Vector3().setFromMatrixPosition(rig.bone(n).matrixWorld).applyMatrix4(inv);
    const r = at("RightHand");
    const l = at("LeftHand");
    gun = { p: r, q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), l.sub(r).normalize()) };
  }
  const colours = { ...Object.fromEntries(Object.entries(PART_LOOK).map(([k, v]) => [k, v.tint])), ...UNIFORM[uniform] };
  const HS = 0.48 * headK; // our head (radius 0.62) -> ~0.3 m on the body
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={size}>
      <primitive object={rig.root} />
      {rig.meshes.map((m) => {
        const L = PART_LOOK[m.name] ?? { tint: "#888888" };
        return createPortal(L.tex ? <Real key={m.uuid} tex={L.tex} gray tint={colours[m.name] ?? L.tint} repeat={[5, 5]} /> : <Toon key={m.uuid} color={colours[m.name] ?? L.tint} kind={L.kind ?? "paint"} />, m);
      })}
      {createPortal(
        <group position={head.position.toArray()} quaternion={head.quaternion}>
          <group position={[0, 0.2 * headK, 0.01]} scale={HS}>
            <Head sheet={faceSheetPath(def.id, face)} variant={face} expression={expression} mouth={mouth} skin={def.skin} />
            <Headgear g={def.headgear} />
          </group>
        </group>,
        neck,
      )}
      {gun && (
        <group position={gun.p.toArray()} quaternion={gun.q}>
          <group scale={0.55}>
            <HandProp name="rifleraw" />
          </group>
        </group>
      )}
    </group>
  );
};
