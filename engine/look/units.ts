import { useVideoConfig } from "remotion";

// Everything is laid out in "design pixels" for a 1080x1920 frame.
// u(n) converts design pixels to real pixels, so the same layout works
// for 720p previews (720x1280) and 1080p finals (1080x1920).
export const DESIGN_HEIGHT = 1920;

export const useUnit = () => {
  const { height } = useVideoConfig();
  const k = height / DESIGN_HEIGHT;
  return (n: number) => n * k;
};

export type ResProps = { res: 720 | 1080 };

// Vertical 9:16 sizes. Use with calculateMetadata.
export const verticalSize = (res: 720 | 1080) =>
  res === 720 ? { width: 720, height: 1280 } : { width: 1080, height: 1920 };
