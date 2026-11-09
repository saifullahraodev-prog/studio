import { Composition } from "remotion";
import { Expression, FaceVariant, SHEET_H, SHEET_W } from "../engine/characters/face";
import { ActionPose, FaceVariants, Lineup, Turnaround } from "./compositions/CharacterSheets";
import { ResProps, verticalSize } from "../engine/look/units";
import { FaceSheet, FaceSheetProps } from "./compositions/FaceSheet";
import { GLInfo } from "./compositions/GLInfo";
import { LookTest, LookTestProps } from "./compositions/LookTest";
import { calculateShortMetadata, Short, ShortProps } from "./compositions/Short";
import { calculateShortV2Metadata, ShortV2, ShortV2Props } from "./compositions/ShortV2";
import { StressTest } from "./compositions/StressTest";
import { StyleTest, StyleTestProps } from "./compositions/StyleTest";
import { TalkTest, TalkTestProps } from "./compositions/TalkTest";
import { ToonCubeTest } from "./compositions/ToonCubeTest";
import { WorldTest, WorldTestProps } from "./compositions/WorldTest";

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
      <Composition id="GLInfo" component={GLInfo} durationInFrames={1} fps={30} width={1600} height={240} />
    </>
  );
};
