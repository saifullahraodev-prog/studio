import { AbsoluteFill } from "remotion";
import { BIBLE } from "../../engine/characters/bible";
import { FaceSheetSvg, FaceVariant } from "../../engine/characters/face";

// 2D composition used only to export face sprite sheets as transparent PNGs
// (tools/make-faces.mjs). Rows = 8 expressions, columns = rest mouth + 5 talking mouths.
export type FaceSheetProps = { character: string; variant: FaceVariant };

export const FaceSheet: React.FC<FaceSheetProps> = ({ character, variant }) => {
  const def = BIBLE[character];
  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* glasses are a real 3D prop on the face, so they are not drawn into the sheet */}
      <FaceSheetSvg variant={variant} extras={{ ...def?.faceExtras, glasses: false }} />
    </AbsoluteFill>
  );
};
