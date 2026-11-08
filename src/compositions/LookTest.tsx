import { useCurrentFrame } from "remotion";
import { BIBLE } from "../../engine/characters/bible";
import { Character, HEAD_HEIGHT } from "../../engine/characters/Character";
import { Expression } from "../../engine/characters/face";
import { LightingPresetName, style } from "../../engine/look/style";
import { ResProps } from "../../engine/look/units";
import { WorldShot } from "../../engine/shots/WorldShot";
import { ShipDeck } from "../../engine/worlds/ship-deck/ShipDeck";

// v0.2 look test: hero close-up (like a hook shot) or wide two-shot, with the
// "unique addition" face options switchable for comparison.
export type LookOption = "plain" | "hatch" | "rim" | "both";
export type LookTestProps = ResProps & {
  option: LookOption;
  preset: LightingPresetName;
  shot: "closeup" | "wide";
  expression: Expression;
};

const LOOKS: Record<LookOption, { hatch: boolean; rim: boolean }> = {
  plain: { hatch: false, rim: false },
  hatch: { hatch: true, rim: false },
  rim: { hatch: false, rim: true },
  both: { hatch: true, rim: true },
};

export const LookTest: React.FC<LookTestProps> = ({ option, preset, shot, expression }) => {
  const frame = useCurrentFrame();
  const p = style.lighting[preset];
  const insp: [number, number, number] = [0.6, 0, 1.4];
  const headY = HEAD_HEIGHT;
  const close = shot === "closeup";
  return (
    <WorldShot
      preset={p}
      faceLook={LOOKS[option]}
      camera={
        close
          ? { position: [-0.5, headY + 0.25, 7.4], target: [0.55, headY - 0.5, 1.4], fov: 30 }
          : { position: [0.2, 2.6, 10.5], target: [0.9, 1.9, 0], fov: 36 }
      }
      focus={close ? [insp[0], headY, insp[2] + 0.5] : [0.8, headY, 1.1]}
      focusRange={close ? 1.2 : 3}
      bokeh={close ? 11 : 9}
      captions={[{ keyword: close ? "Unsinkable?" : "Lifeboats", from: frame - 20, to: 9999 }]}
    >
      <ShipDeck preset={p} />
      <Character
        def={BIBLE.inspector}
        expression={expression}
        position={insp}
        rotationY={close ? -0.12 : 0.45}
        pose={{ armL: [0.95, 0.2], armR: [0.25, 0.3], headTilt: close ? -0.08 : 0, headNod: close ? 0.05 : 0 }}
      />
      <Character def={BIBLE.stoker} expression="worried" position={close ? [2.4, 0, -2.2] : [1.75, 0, 0.5]} rotationY={-0.35} pose={{ headYaw: -0.15 }} />
    </WorldShot>
  );
};
