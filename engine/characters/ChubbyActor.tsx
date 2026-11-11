import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { createPortal, useThree } from "@react-three/fiber";
import { staticFile, useDelayRender } from "remotion";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { CharacterDef } from "./bible";
import { Glove, Head, Headgear } from "./Character";
import { Expression, faceSheetPath, FaceVariant, MouthSlot } from "./face";
import { PART_LOOK } from "./ChubbyBody";
import { HandProp } from "../props/HandProps";
import { FireJet } from "../props/TrenchProps";
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

// Two-bone IK: bend upper arm + forearm so the hand reaches `target` (world space), elbow
// staying on the side it already bends to. `k` blends from the mocap pose (0) to the reach (1).
const reach = (upper: THREE.Bone, lower: THREE.Bone, hand: THREE.Bone, target: THREE.Vector3, k: number) => {
  if (k <= 0) return;
  const wp = (o: THREE.Object3D) => new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);
  const aim = (bone: THREE.Bone, from: THREE.Vector3, to: THREE.Vector3) => {
    const q = new THREE.Quaternion().setFromUnitVectors(from.clone().normalize(), to.clone().normalize());
    const world = bone.getWorldQuaternion(new THREE.Quaternion());
    const parentQ = bone.parent!.getWorldQuaternion(new THREE.Quaternion()).invert();
    const local = parentQ.multiply(q.multiply(world));
    bone.quaternion.slerp(local, k);
    bone.updateMatrixWorld(true);
  };
  const S = wp(upper), E = wp(lower), H = wp(hand);
  const a = S.distanceTo(E), b = E.distanceTo(H);
  const st = target.clone().sub(S);
  const d = Math.min(st.length(), a + b - 1e-4);
  const dir = st.normalize();
  const pole = E.clone().sub(S);
  pole.sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
  const cosA = Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d)));
  const E2 = S.clone().add(dir.clone().multiplyScalar(a * cosA)).add(pole.multiplyScalar(a * Math.sqrt(1 - cosA * cosA)));
  aim(upper, E.clone().sub(S), E2.clone().sub(S));
  aim(lower, wp(hand).sub(wp(lower)), target.clone().sub(wp(lower)));
};
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
  headTilt?: number; // 0 = head stays upright, 1 = full mocap head motion
  chin?: number; // 0..1: bring the right glove to the chin (thinking / scheming)
  hush?: number; // 0..1: index finger to the lips (shh)
  weapon?: "rifle" | "flamegun"; // what the two hands hold (with rifle=true)
  fireT?: number; // flamethrower: seconds since the jet started (< 0 = off)
  fireLen?: number; // jet length (actor units, x size in the world)
  fireDrop?: number; // how far the jet bends down at its end (actor units)
  holdR?: "rifle"; // a one-hand prop in the right glove (e.g. a rifle waved in panic)
  reachR?: [number, number, number]; // put the right glove here (actor space, body units: 1 = ~1.8 m)
  reachL?: [number, number, number];
  reachK?: number; // 0..1 blend for reachR/reachL
}> = ({ def, clip, t, loop = true, speed = 1, position, rotationY = 0, size = 1.8, expression = "neutral", mouth = "rest", face = "R", uniform = "khaki", rifle = false, headK = 1, handK = 1.5, headTilt = 0.0, chin = 0, hush = 0, weapon = "rifle", fireT = -1, fireLen = 4, fireDrop = 1.2, holdR, reachR, reachL, reachK = 1 }) => {
  const a = useAssets(clip);
  const rig = useMemo(() => {
    if (!a) return null;
    const root = cloneSkinned(a.body) as THREE.Group;
    const meshes: THREE.Mesh[] = [];
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        if (m.name === "skin" || m.name === "glove") m.visible = false; // placeholder head/neck + mittens: ours go on instead
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
  // everything below is in the actor's own space (the rig root's parent)
  const parentWorld = rig.root.matrixWorld.clone().multiply(rig.root.matrix.clone().invert());
  const inv = parentWorld.clone().invert();
  const at = (n: string) => new THREE.Vector3().setFromMatrixPosition(rig.bone(n).matrixWorld).applyMatrix4(inv);
  // Our head is ~3x a real one: if it copied the mocap's lean and tilt (aiming crouch, cheek on
  // the rifle) it would flop over. It follows where the head TURNS, and only part of the lean.
  const pq = new THREE.Quaternion().setFromRotationMatrix(parentWorld).invert();
  const hq = pq.multiply(rig.bone("Head").getWorldQuaternion(new THREE.Quaternion()));
  const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(hq);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(hq);
  const upK = new THREE.Vector3(0, 1, 0).lerp(up, headTilt).normalize();
  const yawQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(fwd.x, fwd.z));
  const headQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upK).multiply(yawQ);
  const headP = at("Head").add(upK.clone().multiplyScalar(0.2 * headK));
  if (hush > 0) {
    const yaw = Math.atan2(fwd.x, fwd.z);
    const f2 = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const lipsP = headP.clone().add(f2.multiplyScalar(0.36 * headK)).add(new THREE.Vector3(0, -0.24 * headK, 0)).applyMatrix4(parentWorld);
    reach(rig.bone("RightArm"), rig.bone("RightForeArm"), rig.bone("RightHand"), lipsP, hush);
  }
  if (chin > 0) {
    // under the chin, a little in front of the face (actor space -> world)
    const fwdFlat = new THREE.Vector3(Math.sin(Math.atan2(fwd.x, fwd.z)), 0, Math.cos(Math.atan2(fwd.x, fwd.z)));
    const side = new THREE.Vector3(fwdFlat.z, 0, -fwdFlat.x); // character's right
    const chinP = headP.clone().add(fwdFlat.multiplyScalar(0.24 * headK)).add(side.multiplyScalar(-0.06 * headK)).add(new THREE.Vector3(0, -0.36 * headK, 0)).applyMatrix4(parentWorld);
    reach(rig.bone("RightArm"), rig.bone("RightForeArm"), rig.bone("RightHand"), chinP, chin);
  }

  if (reachR) reach(rig.bone("RightArm"), rig.bone("RightForeArm"), rig.bone("RightHand"), new THREE.Vector3(...reachR).applyMatrix4(parentWorld), reachK);
  if (reachL) reach(rig.bone("LeftArm"), rig.bone("LeftForeArm"), rig.bone("LeftHand"), new THREE.Vector3(...reachL).applyMatrix4(parentWorld), reachK);

  let gun: { p: THREE.Vector3; q: THREE.Quaternion } | null = null;
  if (rifle) {
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
        return createPortal(L.tex ? <Real key={m.uuid} tex={L.tex} gray tint={colours[m.name] ?? L.tint} repeat={[9, 9]} normalScale={2.4} roughness={1} /> : <Toon key={m.uuid} color={colours[m.name] ?? L.tint} kind={L.kind ?? "paint"} />, m);
      })}
      {/* our white 4-finger cartoon gloves on the hand bones (fists round the rifle) */}
      {(["LeftHand", "RightHand"] as const).map((hb) =>
        createPortal(
          <group key={hb} position={[0, 0.05, 0.0]} rotation={[0, hb === "LeftHand" ? Math.PI / 2 : -Math.PI / 2, Math.PI]} scale={0.62 / handK}>
            <Glove up={rifle || ((chin > 0.5 || hush > 0.5) && hb === "RightHand") || (holdR && hb === "RightHand") ? 1 : 4} />
          </group>,
          rig.bone(hb),
        ),
      )}
      <group position={headP.toArray()} quaternion={headQ}>
        <group scale={HS}>
          <Head sheet={faceSheetPath(def.id, face)} variant={face} expression={expression} mouth={mouth} skin={def.skin} />
          <Headgear g={def.headgear} />
        </group>
      </group>
      {gun && (
        <group position={gun.p.toArray()} quaternion={gun.q}>
          <group scale={weapon === "flamegun" ? 0.75 : 0.55}>
            <HandProp name={weapon === "flamegun" ? "flamegunraw" : "rifleraw"} />
          </group>
        </group>
      )}
      {holdR === "rifle" &&
        createPortal(
          <group position={[0, 0.06, 0.02]} rotation={[0, 0, Math.PI / 2]} scale={0.55 / handK}>
            <group position={[0, -0.25, 0]}>
              <HandProp name="rifleraw" />
            </group>
          </group>,
          rig.bone("RightHand"),
        )}
      {weapon === "flamegun" && (
        // fuel tanks on the back, on the upper spine
        <>
          {createPortal(
            <group position={[0, 0.02, -0.2]}>
              {[-0.09, 0.09].map((x) => (
                <mesh key={x} position={[x, 0, 0]} castShadow>
                  <capsuleGeometry args={[0.075, 0.3, 6, 16]} />
                  <Real tex="PaintedMetal004" gray tint="#4A4E46" roughness={0.6} metalness={0.3} />
                </mesh>
              ))}
              <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.24, 8]} />
                <Toon color="#7A6A4A" kind="brass" />
              </mesh>
            </group>,
            rig.bone("Spine2"),
          )}
          {gun && fireT >= 0 && (() => {
            const dir = new THREE.Vector3(0, 1, 0).applyQuaternion(gun.q);
            const nozzle = gun.p.clone().add(dir.clone().multiplyScalar(0.72));
            const end = nozzle.clone().add(dir.clone().multiplyScalar(fireLen)).add(new THREE.Vector3(0, -fireDrop, 0));
            return <FireJet t={fireT} from={nozzle.toArray()} to={end.toArray()} />;
          })()}
        </>
      )}
    </group>
  );
};
