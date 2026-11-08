import { useCurrentFrame, useVideoConfig } from "remotion";
import { BIBLE } from "../../engine/characters/bible";
import { Character } from "../../engine/characters/Character";
import { FaceVariant } from "../../engine/characters/face";
import { fakeTimings, mouthAt } from "../../engine/characters/lipsync";
import { CaptionBeat } from "../../engine/captions/Captions";
import { style } from "../../engine/look/style";
import { ResProps } from "../../engine/look/units";
import { WorldShot } from "../../engine/shots/WorldShot";
import { ShipDeck } from "../../engine/worlds/ship-deck/ShipDeck";

// Lip-sync test: The Inspector talks to camera, mouth driven by word timings.
// Uses fake timings until we have a real voice recording + faster-whisper.
export type TalkTestProps = ResProps & { variant: FaceVariant };

const LINE = "It's nineteen twelve. You are a stoker, deep inside the Titanic.";
const WORDS = fakeTimings(LINE, 0.4);

export const TalkTest: React.FC<TalkTestProps> = ({ variant }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p = style.lighting.day;
  const mouth = mouthAt(WORDS, t);
  const split = WORDS.findIndex((w) => w.word.endsWith(".")) + 1;
  const beats: CaptionBeat[] = [
    { subtitle: "It's 1912.", keyword: "1912", from: 0, to: Math.round(WORDS[split].start * fps) },
    { subtitle: "You are a stoker, deep inside the Titanic.", keyword: "Stoker", from: Math.round(WORDS[split].start * fps), to: 9999 },
  ];
  const nod = Math.sin(t * 5) * (mouth === "rest" ? 0 : 0.025);
  return (
    <WorldShot preset={p} camera={{ position: [0.9, 2.15, 5.6], target: [0.6, 1.75, 0], fov: 34 }} focus={[0.5, 1.8, 1.2]} captions={beats}>
      <ShipDeck preset={p} />
      <Character
        def={BIBLE.inspector}
        faceVariant={variant}
        expression={t < 1.8 ? "neutral" : "determined"}
        mouth={mouth}
        position={[0.5, 0, 1.2]}
        rotationY={0.12}
        pose={{ armL: [0.95, 0.2], armR: [0.35 + Math.sin(t * 3) * 0.1, 0.3], headNod: nod, headTilt: Math.sin(t * 1.3) * 0.03 }}
      />
    </WorldShot>
  );
};
