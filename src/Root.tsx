import { Composition } from "remotion";
import { Expression, FaceVariant, SHEET_H, SHEET_W } from "../engine/characters/face";
import { ActionPose, FaceOption, FaceVariants, Lineup, Turnaround } from "./compositions/CharacterSheets";
import { ResProps, verticalSize } from "../engine/look/units";
import { FaceSheet, FaceSheetProps } from "./compositions/FaceSheet";
import { FaceCheck, FaceCheckProps } from "./compositions/FaceCheck";
import { GLInfo } from "./compositions/GLInfo";
import { LookTest, LookTestProps } from "./compositions/LookTest";
import { calculateShortMetadata, Short, ShortProps } from "./compositions/Short";
import { calculateShortV2Metadata, ShortV2, ShortV2Props } from "./compositions/ShortV2";
import { calculateVideoMetadata, Video, VideoProps } from "./compositions/Video";
import { ShotPreview, ShotPreviewProps } from "./compositions/ShotPreview";
import { BlenderShort, BlenderShortProps, calculateBlenderShortMetadata } from "./compositions/BlenderShort";
import { StressTest } from "./compositions/StressTest";
import { StyleTest, StyleTestProps } from "./compositions/StyleTest";
import { TalkTest, TalkTestProps } from "./compositions/TalkTest";
import { ToonCubeTest } from "./compositions/ToonCubeTest";
import { WorldTest, WorldTestProps } from "./compositions/WorldTest";
import { SceneId, ShipGuyScene } from "../engine/shipguy/scenes";
import { calcShipGuy, ShipGuyBoard, ShipGuyProps, ShipGuyVideo } from "../engine/shipguy/Video";
import { ShipGuyThumb } from "../engine/shipguy/Thumb";
import { ShipLook } from "../engine/shipguy/ships_hd";
import { GuyLab, GuyLabProps, guyLabLength } from "../engine/shipguy/guyLab";
import { calcShipGuyShort, ShipGuyShort, ShortProps as ShipGuyShortProps } from "../engine/shipguy/Short";
import { BackLab, BackLabProps } from "../engine/backwards/lab";
import { HowLab, HowLabProps } from "../engine/howwe/lab";
import { EATING_PLACEHOLDER, HowFrames, HowFramesProps } from "../engine/howwe/frames";
import { calcHowVideo, HowVideo, howVideoLength, HowVideoProps, Scene as HowScene } from "../engine/howwe/video";
import howDemo from "../engine/howwe/demo-scenes.json";

// Vertical compositions take a `res` prop: 720 for previews (default), 1080 for finals.
// Final render: --props=engine/presets/res-1080.json
const vertical = {
  fps: 30,
  width: 720,
  height: 1280,
  defaultProps: { res: 720 } as ResProps,
  calculateMetadata: ({ props }: { props: ResProps }) => verticalSize(props.res),
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="ToonCubeTest" component={ToonCubeTest} durationInFrames={150} {...vertical} />
      <Composition id="StressTest" component={StressTest} durationInFrames={60} {...vertical} />
      <Composition
        id="FaceSheet"
        component={FaceSheet}
        durationInFrames={1}
        fps={30}
        width={SHEET_W}
        height={SHEET_H}
        defaultProps={{ character: "inspector", variant: "A" } as FaceSheetProps}
      />
      <Composition
        id="FaceVariants"
        component={FaceVariants}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ expression: "happy" as Expression, stokerExpression: "worried" as Expression }}
      />
      <Composition
        id="Turnaround"
        component={Turnaround}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ character: "inspector", variant: "D" as FaceVariant }}
      />
      <Composition
        id="StyleTest"
        component={StyleTest}
        durationInFrames={90}
        {...vertical}
        defaultProps={{ res: 720, preset: "day", variant: "D", safeArea: false } as StyleTestProps}
        calculateMetadata={({ props }: { props: StyleTestProps }) => verticalSize(props.res)}
      />
      <Composition
        id="TalkTest"
        component={TalkTest}
        durationInFrames={150}
        {...vertical}
        defaultProps={{ res: 720, variant: "D" } as TalkTestProps}
        calculateMetadata={({ props }: { props: TalkTestProps }) => verticalSize(props.res)}
      />
      <Composition
        id="LookTest"
        component={LookTest}
        durationInFrames={90}
        {...vertical}
        defaultProps={{ res: 720, option: "both", preset: "day", shot: "closeup", expression: "shocked" } as LookTestProps}
        calculateMetadata={({ props }: { props: LookTestProps }) => verticalSize(props.res)}
      />
      <Composition
        id="Short"
        component={Short}
        durationInFrames={300}
        fps={30}
        width={720}
        height={1280}
        defaultProps={{ res: 720, slug: "titanic-lifeboats" } as ShortProps}
        calculateMetadata={calculateShortMetadata}
      />
      <Composition
        id="ShortV2"
        component={ShortV2}
        durationInFrames={300}
        fps={30}
        width={720}
        height={1280}
        defaultProps={{ res: 720, slug: "titanic-lifeboats-v2" } as ShortV2Props}
        calculateMetadata={calculateShortV2Metadata}
      />
      <Composition
        id="BlenderShort"
        component={BlenderShort}
        durationInFrames={300}
        fps={30}
        width={720}
        height={1280}
        defaultProps={{ res: 720, slug: "trench-trap" } as BlenderShortProps}
        calculateMetadata={calculateBlenderShortMetadata}
      />
      <Composition
        id="Lineup"
        component={Lineup}
        durationInFrames={1}
        fps={30}
        width={2400}
        height={1200}
        defaultProps={{ ids: ["inspector", "worker", "perkins", "firefighter", "owner", "judge", "stoker"], crowd: true }}
      />
      <Composition id="ActionPose" component={ActionPose} durationInFrames={48} fps={30} width={400} height={480} defaultProps={{ action: "walk", character: "worker" }} />
      <Composition
        id="WorldTest"
        component={WorldTest}
        durationInFrames={90}
        {...vertical}
        defaultProps={{ res: 720, world: "factory", view: 0, preset: "interior", fire: 0, smoke: 0, people: true } as WorldTestProps}
        calculateMetadata={({ props }: { props: WorldTestProps }) => verticalSize(props.res)}
      />
      <Composition
        id="Video"
        component={Video}
        durationInFrames={300}
        fps={30}
        width={720}
        height={1280}
        defaultProps={{ res: 720, slug: "triangle-fire" } as VideoProps}
        calculateMetadata={calculateVideoMetadata}
      />
      <Composition id="FaceCheck" component={FaceCheck} durationInFrames={1} fps={30} width={2400} height={600} defaultProps={{ preset: "day", hatch: true } as FaceCheckProps} />
      <Composition id="FaceOption" component={FaceOption} durationInFrames={1} fps={30} width={1200} height={900} defaultProps={{ variant: "E" as FaceVariant }} />
      <Composition
        id="ShotPreview"
        component={ShotPreview}
        durationInFrames={90}
        {...vertical}
        defaultProps={{ res: 720, shot: "insp-eyes", preset: "night", face: "shocked" } as ShotPreviewProps}
        calculateMetadata={({ props }: { props: ShotPreviewProps }) => verticalSize(props.res)}
      />
      <Composition id="GLInfo" component={GLInfo} durationInFrames={1} fps={30} width={1600} height={240} />
      <Composition
        id="ShipGuyScene"
        component={ShipGuyScene}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ scene: "attack" as SceneId }}
      />
      <Composition
        id="ShipGuyVideo"
        component={ShipGuyVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ slug: "seawise" } as ShipGuyProps}
        calculateMetadata={calcShipGuy}
      />
      <Composition
        id="ShipGuyShort"
        component={ShipGuyShort}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ slug: "seawise" } as ShipGuyShortProps}
        calculateMetadata={calcShipGuyShort}
      />
      <Composition id="GuyLab" component={GuyLab} durationInFrames={150} fps={30} width={1920} height={1080}
        defaultProps={{ demo: "hello" } as GuyLabProps}
        calculateMetadata={async ({ props }) => ({ durationInFrames: props.sheet || props.demo === "model" ? 1 : guyLabLength(props.demo) })} />
      <Composition id="ShipLook" component={ShipLook} durationInFrames={1} fps={30} width={1920} height={1080} />
      <Composition id="BackLab" component={BackLab} durationInFrames={90} fps={30} width={1920} height={1080} defaultProps={{ view: "sheet" } as BackLabProps} />
      <Composition id="HowLab" component={HowLab} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ look: "A", view: "board" } as HowLabProps} />
      <Composition id="HowFrames" component={HowFrames} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ view: "board" } as HowFramesProps} />
      <Composition id="HowVideo" component={HowVideo} durationInFrames={30} fps={30} width={1920} height={1080}
        defaultProps={{ scenes: howDemo.scenes as HowScene[], cats: { EATING_PLACEHOLDER }, audio: "howwe/kit-demo/mix.wav" } as HowVideoProps}
        calculateMetadata={async ({ props }) => ({ durationInFrames: howVideoLength(props.scenes) })} />
      <Composition id="HowVideoBuilt" component={HowVideo} durationInFrames={30} fps={30} width={1920} height={1080}
        defaultProps={{ slug: "demo2", scenes: [], cats: { EATING_PLACEHOLDER } } as HowVideoProps}
        calculateMetadata={calcHowVideo} />
      <Composition id="ShipGuyThumb" component={ShipGuyThumb} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ v: "A" }} />
      <Composition
        id="ShipGuyBoard"
        component={ShipGuyBoard}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ slug: "seawise", page: 0 } as ShipGuyProps}
        calculateMetadata={async (a) => ({ ...(await calcShipGuy(a)), durationInFrames: 1 })}
      />
    </>
  );
};
