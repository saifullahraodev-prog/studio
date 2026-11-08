import { useCurrentFrame } from "remotion";
import { BIBLE } from "../../engine/characters/bible";
import { Character } from "../../engine/characters/Character";
import { Expression, FaceVariant } from "../../engine/characters/face";
import { CaptionBeat } from "../../engine/captions/Captions";
import { LightingPresetName, style } from "../../engine/look/style";
import { ResProps } from "../../engine/look/units";
import { WorldShot } from "../../engine/shots/WorldShot";
import { ShipDeck } from "../../engine/worlds/ship-deck/ShipDeck";

// GATE 2 style test: The Inspector + a stoker on the ship deck, one lighting preset.
export type StyleTestProps = ResProps & {
  preset: LightingPresetName;
  variant: FaceVariant;
  safeArea?: boolean;
};

const BEATS: Record<LightingPresetName, { inspector: Expression; stoker: Expression; caption: CaptionBeat }> = {
  day: { inspector: "neutral", stoker: "happy", caption: { subtitle: "It's April 1912. The sea is calm.", keyword: "Calm", from: 0, to: 9999 } },
  golden: { inspector: "determined", stoker: "happy", caption: { subtitle: "The ship is called unsinkable.", keyword: "Unsinkable", from: 0, to: 9999 } },
  storm: { inspector: "worried", stoker: "scared", caption: { subtitle: "But there are only 20 lifeboats.", keyword: "20 boats", from: 0, to: 9999 } },
  night: { inspector: "sad", stoker: "shocked", caption: { subtitle: "For 2,224 people on board.", keyword: "2,224", from: 0, to: 9999 } },
};

export const StyleTest: React.FC<StyleTestProps> = ({ preset, variant, safeArea }) => {
  const frame = useCurrentFrame();
  const p = style.lighting[preset];
  const b = BEATS[preset];
  const breathe = Math.sin(frame / 18) * 0.01;
  return (
    <WorldShot
      preset={p}
      camera={{ position: [0.2, 2.7, 11.5], target: [0.9, 2.1, 0], fov: 36 }}
      focus={[0.8, 1.8, 1.1]}
      focusRange={3.5}
      captions={[{ ...b.caption, from: frame - 20 }]}
      showSafeArea={safeArea}
    >
      <ShipDeck preset={p} />
      <Character
        def={BIBLE.inspector}
        faceVariant={variant}
        expression={b.inspector}
        position={[0.05, 0, 1.4]}
        rotationY={0.45}
        pose={{ armL: [0.95, 0.2], armR: [0.1, 0.25], headYaw: 0.1, bob: breathe }}
      />
      <Character
        def={BIBLE.stoker}
        faceVariant={variant}
        expression={b.stoker}
        position={[1.55, 0, 0.8]}
        rotationY={-0.35}
        pose={{ headYaw: -0.15, bob: -breathe }}
      />
    </WorldShot>
  );
};
