import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { createPortal, useThree } from "@react-three/fiber";
import { staticFile, useDelayRender } from "remotion";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { CharacterDef } from "./bible";
import { Glove, Head, Headgear } from "./Character";
import { Expression, faceSheetPath, FaceVariant, MouthSlot } from "./face";
import { HandProp } from "../props/HandProps";

// ─────────────────────────────────────────────────────────────────────────────
// Real body + motion capture (owner decision 2026-11-10). The Mixamo body
// (public/models/mixamo/body.fbx) plays a Mixamo clip (public/models/mixamo/clips/<name>.json,
// made by tools/fbx_clips.mjs) at an exact time: frame-driven, no useFrame.
// Our drawn round head (+ helmet) replaces the body's own head; optional cartoon gloves and
// slimmer limbs push the real body toward our style.
// ─────────────────────────────────────────────────────────────────────────────

export type MocapClip = "rifle-run" | "rifle-walk" | "rifle-aim" | "rifle-fire" | "crouch-idle" | "terrified" | "hit-reaction" | "jump-down" | "run" | "stagger-run" | "scream" | "kneel";

const CM = 0.01; // the FBX is in centimetres
const BODY_K = 1.7; // our world is ~1.7x real size (3 m tall characters)

// ── loading (cached, render held until ready) ──
let bodyPromise: Promise<THREE.Group> | null = null;
const waitTextures = (root: THREE.Object3D) =>
  new Promise<void>((resolve) => {
    const imgs: HTMLImageElement[] = [];
    root.traverse((o) => {
      const m = (o as THREE.Mesh).material;
      if (!m) return;
      for (const mat of ([] as THREE.Material[]).concat(m)) {
        const map = (mat as THREE.MeshStandardMaterial).map;
        const img = map?.image as HTMLImageElement | undefined;
        if (img && "complete" in img) imgs.push(img);
      }
    });
    const t0 = Date.now();
    const check = () => (imgs.every((i) => i.complete) || Date.now() - t0 > 60000 ? resolve() : setTimeout(check, 100));
    check();
  });
const loadBody = () => {
  if (!bodyPromise)
    bodyPromise = new FBXLoader().loadAsync(staticFile("models/mixamo/body.fbx")).then(async (g) => {
      g.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.castShadow = true;
          m.receiveShadow = true;
          m.frustumCulled = false; // skinned bounds don't follow the animation
        }
      });
      await waitTextures(g);
      return g;
    });
  return bodyPromise;
};
const clipCache = new Map<string, Promise<THREE.AnimationClip>>();
const loadClip = (name: string) => {
  let p = clipCache.get(name);
  if (!p) {
    p = fetch(staticFile(`models/mixamo/clips/${name}.json`))
      .then((r) => r.json())
      .then((j) => THREE.AnimationClip.parse(j));
    clipCache.set(name, p);
  }
  return p;
};

// hips travel removed (x/z), so we move the body ourselves; height (y) kept
const inPlace = (clip: THREE.AnimationClip) => {
  const c = clip.clone();
  for (const tr of c.tracks) {
    if (tr.name !== "mixamorigHips.position") continue;
    const v = tr.values;
    const x0 = v[0];
    const z0 = v[2];
    for (let i = 0; i < v.length; i += 3) {
      v[i] = x0;
      v[i + 2] = z0;
    }
  }
  return c;
};

const useMocapAssets = (clipName: string) => {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const advance = useThree((s) => s.advance);
  const [assets, setAssets] = useState<{ body: THREE.Group; clip: THREE.AnimationClip } | null>(null);
  const h = useRef<number | null>(null);
  useLayoutEffect(() => {
    let alive = true;
    h.current = delayRender(`mocap ${clipName}`, { timeoutInMilliseconds: 180000 });
    Promise.all([loadBody(), loadClip(clipName)])
      .then(([body, clip]) => alive && setAssets({ body, clip }))
      .catch((e) => cancelRender(e));
    return () => {
      alive = false;
      if (h.current !== null) {
        continueRender(h.current);
        h.current = null;
      }
    };
  }, [clipName]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!assets || h.current === null) return;
    advance(performance.now());
    continueRender(h.current);
    h.current = null;
  }, [assets, advance, continueRender]);
  return assets;
};

export type MocapStyle = {
  headK?: number; // our head size (1 = the old chibi head)
  gloves?: boolean; // swap the real hands for our white cartoon gloves
  slim?: number; // limb thickness (1 = real)
  tint?: string; // multiply the uniform colour
  bodyK?: number; // body size vs a real person (1.7 = old 3 m chibi height; smaller = big-head comedy proportions)
};

export const MocapActor: React.FC<{
  def: CharacterDef;
  clip: MocapClip;
  t: number; // seconds into the clip
  loop?: boolean;
  speed?: number;
  position?: [number, number, number];
  rotationY?: number;
  expression?: Expression;
  mouth?: MouthSlot;
  look?: MocapStyle;
  holdR?: string; // prop in the right hand (e.g. "rifle")
  face?: FaceVariant; // default "R" (reference-style bean eyes)
}> = ({ def, clip, t, loop = true, speed = 1, position, rotationY = 0, expression = "neutral", mouth = "rest", look = {}, holdR, face = "R" }) => {
  const assets = useMocapAssets(clip);
  const { headK = 1, gloves = false, slim = 1, tint, bodyK = BODY_K } = look;
  const pk = bodyK / BODY_K; // props shrink with the body

  const rig = useMemo(() => {
    if (!assets) return null;
    const root = cloneSkinned(assets.body) as THREE.Group;
    if (tint)
      root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh)
          m.material = ([] as THREE.Material[]).concat(m.material).map((x) => {
            const c = (x as THREE.MeshStandardMaterial).clone();
            c.color.set(tint);
            return c;
          }) as unknown as THREE.Material;
      });
    const bone = (n: string) => root.getObjectByName(`mixamorig${n}`) as THREE.Bone;
    const mixer = new THREE.AnimationMixer(root);
    const action = mixer.clipAction(inPlace(assets.clip));
    action.play();
    return { root, mixer, action, bone, dur: assets.clip.duration };
  }, [assets, tint]);

  if (!rig) return null;
  // pose at this exact time (deterministic: same frame = same pose)
  const tt = t * speed;
  const time = loop ? ((tt % rig.dur) + rig.dur) % rig.dur : Math.min(tt, rig.dur - 1e-3);
  rig.mixer.setTime(time);
  // style tweaks applied after the clip wrote the bones
  const head = rig.bone("Head");
  const headQ = head.quaternion.clone();
  const headP = head.position.clone();
  head.scale.setScalar(0.001); // hide the real head (and hair): ours goes on the neck
  for (const side of ["Left", "Right"]) {
    if (gloves) rig.bone(`${side}Hand`).scale.setScalar(0.001);
    if (slim !== 1) {
      rig.bone(`${side}Arm`).scale.set(slim, 1, slim);
      rig.bone(`${side}UpLeg`).scale.set(slim, 1, slim);
    }
  }
  rig.root.updateMatrixWorld(true);
  const neck = rig.bone("Neck");
  // two-hand rifle: grip at the right hand, barrel pointing through the left hand
  let rifle: { p: THREE.Vector3; q: THREE.Quaternion } | null = null;
  if (holdR === "rifle") {
    const parentWorld = rig.root.matrixWorld.clone().multiply(rig.root.matrix.clone().invert());
    const inv = parentWorld.invert();
    const at = (n: string) => new THREE.Vector3().setFromMatrixPosition(rig.bone(n).matrixWorld).applyMatrix4(inv);
    const r = at("RightHand");
    const l = at("LeftHand");
    const dir = l.clone().sub(r).normalize();
    rifle = { p: r, q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir) };
  }
  const v = face;
  // our head units are metres in the old chibi world; neck space is cm x BODY_K
  const hs = headK / (CM * bodyK);
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={CM * bodyK}>
      <primitive object={rig.root} />
      {createPortal(
        <group position={headP.toArray()} quaternion={headQ}>
          <group position={[0, 0.5 * hs, 0]} scale={hs}>
            <Head sheet={faceSheetPath(def.id, v)} variant={v} expression={expression} mouth={mouth} skin={def.skin} />
            <Headgear g={def.headgear} />
          </group>
        </group>,
        neck,
      )}
      {gloves &&
        (["Left", "Right"] as const).map((side) =>
          createPortal(
            <group key={side} position={rig.bone(`${side}Hand`).position.toArray()} rotation={[0, 0, side === "Left" ? -Math.PI / 2 : Math.PI / 2]} scale={(1.9 * Math.sqrt(pk)) / (CM * bodyK)}>
              <Glove up={1} />
            </group>,
            rig.bone(`${side}ForeArm`),
          ),
        )}
      {rifle && (
        <group position={rifle.p.toArray()} quaternion={rifle.q} scale={pk / (CM * bodyK)}>
          <group scale={1.35}>
            <HandProp name="rifleraw" />
          </group>
        </group>
      )}
      {holdR &&
        holdR !== "rifle" &&
        createPortal(
          <group scale={pk / (CM * bodyK)}>
            <HandProp name={holdR} />
          </group>,
          rig.bone("RightHand"),
        )}
    </group>
  );
};
