import { Composition } from "remotion";
import { GLInfo } from "./compositions/GLInfo";
import { StressTest } from "./compositions/StressTest";
import { ToonCubeTest } from "./compositions/ToonCubeTest";
import { ResProps, verticalSize } from "./ui/units";

// Vertical compositions take a `res` prop: 720 for previews (default), 1080 for finals.
// Final render: --props='{"res":1080}'
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ToonCubeTest"
        component={ToonCubeTest}
        durationInFrames={150}
        fps={30}
        width={720}
        height={1280}
        defaultProps={{ res: 720 } as ResProps}
        calculateMetadata={({ props }) => verticalSize(props.res)}
      />
      <Composition
        id="StressTest"
        component={StressTest}
        durationInFrames={60}
        fps={30}
        width={720}
        height={1280}
        defaultProps={{ res: 720 } as ResProps}
        calculateMetadata={({ props }) => verticalSize(props.res)}
      />
      <Composition id="GLInfo" component={GLInfo} durationInFrames={1} fps={30} width={1600} height={240} />
    </>
  );
};
