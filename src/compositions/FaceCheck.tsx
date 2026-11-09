import { BIBLE, CHARACTER_IDS } from "../../engine/characters/bible";
import { Character } from "../../engine/characters/Character";
import { HEAD_HEIGHT } from "../../engine/characters/Character";
import { LightingPresetName, style } from "../../engine/look/style";
import { WorldShot } from "../../engine/shots/WorldShot";

// Heads are turned +-0.95 rad so half of each face is in shadow (where the stripes appeared).
// Face cleanliness check (golden test "no stripes on faces"): every character's head side by
// side, in one lighting preset, rendered at video size. tools/facecheck.py measures fine-stripe
// energy on each face. `hatch` toggles the pen hatching so the test can compare on vs off.
export type FaceCheckProps = { preset: LightingPresetName; hatch: boolean };
export const FACECHECK_GAP = 1.45;
export const FaceCheck: React.FC<FaceCheckProps> = ({ preset, hatch }) => {
  const n = CHARACTER_IDS.length;
  return (
    <WorldShot
      preset={style.lighting[preset]}
      camera={{ position: [0, HEAD_HEIGHT + 0.1, 26], target: [0, HEAD_HEIGHT, 0], fov: 6.6 }}
      focus={[0, HEAD_HEIGHT, 0]}
      focusRange={20}
      faceLook={{ hatch, rim: style.face.shading.rim }}
    >
      {CHARACTER_IDS.map((id, i) => (
        <Character key={id} def={BIBLE[id]} expression="neutral" position={[(i - (n - 1) / 2) * FACECHECK_GAP, 0, 0]} rotationY={i % 2 ? 0.95 : -0.95} pose={{ noProp: true }} />
      ))}
    </WorldShot>
  );
};
