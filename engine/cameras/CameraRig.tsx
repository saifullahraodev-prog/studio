import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import * as THREE from "three";

export type Vec3 = [number, number, number];
export type CameraState = { position: Vec3; target: Vec3; fov: number; roll?: number };

// Puts the camera where the shot wants it. Frame-driven: pass a new state each frame.
export const CameraRig: React.FC<CameraState> = ({ position, target, fov, roll = 0 }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...position);
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    camera.lookAt(...target);
    if (camera.fov !== fov) {
      camera.fov = fov;
    }
    camera.near = 0.1;
    camera.far = 5000;
    camera.updateProjectionMatrix();
  });
  return null;
};

// Where the sea horizon lands on screen (0 = top, 1 = bottom) for a camera state.
// Used to line up the 2D painted backdrop with the 3D world.
export const horizonScreenY = (cam: CameraState) => {
  const [px, py, pz] = cam.position;
  const [tx, ty, tz] = cam.target;
  const horiz = Math.hypot(tx - px, tz - pz);
  const pitch = Math.atan2(ty - py, horiz); // negative = looking down
  const ndc = Math.tan(-pitch) / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
  return 0.5 - ndc / 2;
};
