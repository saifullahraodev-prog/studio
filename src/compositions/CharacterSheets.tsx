import { loadFont } from "@remotion/google-fonts/Fredoka";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { BIBLE } from "../../engine/characters/bible";
import { Character, Pose } from "../../engine/characters/Character";
import { Expression, FACE_VARIANTS, FaceVariant, VARIANT_NAMES } from "../../engine/characters/face";
import { CameraRig } from "../../engine/cameras/CameraRig";

// Review stills for GATE 2: face variants side by side, and a turnaround.
const { fontFamily } = loadFont("normal", { weights: ["600"], subsets: ["latin"] });

const StudioLights: React.FC = () => (
  <>
    <hemisphereLight args={["#E8F0FF", "#8A7F70", 1.2]} />
    <directionalLight
      position={[-4, 7, 6]}
      intensity={2.3}
      color="#FFF6E8"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-8}
      shadow-camera-right={8}
      shadow-camera-top={6}
      shadow-camera-bottom={-2}
      shadow-bias={-0.0005}
    />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[30, 48]} />
      <meshToonMaterial color="#C9C2B4" />
    </mesh>
  </>
);

const Label: React.FC<{ x: string; text: string; sub?: string }> = ({ x, text, sub }) => (
  <div style={{ position: "absolute", left: x, bottom: 46, transform: "translateX(-50%)", textAlign: "center", fontFamily, color: "#2A2A30" }}>
    <div style={{ fontSize: 46, fontWeight: 600 }}>{text}</div>
    {sub && <div style={{ fontSize: 26, opacity: 0.7 }}>{sub}</div>}
  </div>
);

const bg = "linear-gradient(#DCE3E8, #EFE9DE)";

// 3 face variants: Inspector + stoker per variant.
export const FaceVariants: React.FC<{ expression: Expression; stokerExpression: Expression }> = ({ expression, stokerExpression }) => {
  const { width, height } = useVideoConfig();
  const xs = [-4.3, 0, 4.3];
  return (
    <AbsoluteFill style={{ background: bg }}>
      <ThreeCanvas width={width} height={height} shadows gl={{ alpha: true }}>
        <CameraRig position={[0, 2.2, 17]} target={[0, 1.3, 0]} fov={24} />
        <StudioLights />
        {FACE_VARIANTS.map((v, i) => (
          <group key={v} position={[xs[i], 0, 0]}>
            <Character def={BIBLE.inspector} faceVariant={v} expression={expression} position={[-0.72, 0, 0]} rotationY={0.18} pose={{ armL: [0.9, 0.25] }} />
            <Character def={BIBLE.stoker} faceVariant={v} expression={stokerExpression} position={[0.78, 0, 0.1]} rotationY={-0.2} pose={{ armR: [0.35, 0.1] }} />
          </group>
        ))}
      </ThreeCanvas>
      {FACE_VARIANTS.map((v, i) => (
        <Label key={v} x={`${18 + i * 32}%`} text={`Variant ${v}`} sub={VARIANT_NAMES[v as FaceVariant]} />
      ))}
    </AbsoluteFill>
  );
};

// Turnaround: front, three-quarter, side, back (+ stoker front for scale).
export const Turnaround: React.FC<{ character: string; variant: FaceVariant }> = ({ character, variant }) => {
  const { width, height } = useVideoConfig();
  const def = BIBLE[character];
  const views: { label: string; rot: number; pose?: Pose }[] = [
    { label: "Front", rot: 0 },
    { label: "3/4", rot: 0.65 },
    { label: "Side", rot: Math.PI / 2 },
    { label: "Back", rot: Math.PI },
  ];
  const xs = [-3.75, -1.25, 1.25, 3.75];
  return (
    <AbsoluteFill style={{ background: bg }}>
      <ThreeCanvas width={width} height={height} shadows gl={{ alpha: true }}>
        <CameraRig position={[0, 1.6, 26]} target={[0, 1.3, 0]} fov={15} />
        <StudioLights />
        {views.map((vw, i) => (
          <Character key={vw.label} def={def} faceVariant={variant} position={[xs[i], 0, 0]} rotationY={vw.rot} />
        ))}
      </ThreeCanvas>
      {views.map((vw, i) => (
        <Label key={vw.label} x={`${17.5 + i * 21.7}%`} text={vw.label} />
      ))}
      <div style={{ position: "absolute", top: 34, left: 0, right: 0, textAlign: "center", fontFamily, fontSize: 44, color: "#2A2A30" }}>
        {def.name}: turnaround (face variant {variant})
      </div>
    </AbsoluteFill>
  );
};
