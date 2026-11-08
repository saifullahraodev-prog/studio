import { useState } from "react";
import { AbsoluteFill } from "remotion";

// Diagnostic frame: prints which WebGL renderer headless Chrome is using.
const probe = (): string[] => {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return ["WEBGL: NOT AVAILABLE"];
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
    const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    return [
      `WEBGL: ${c.getContext("webgl2") ? "2" : "1"}`,
      `VENDOR: ${vendor}`,
      `RENDERER: ${renderer}`,
      `MAX TEXTURE: ${gl.getParameter(gl.MAX_TEXTURE_SIZE)}`,
    ];
  } catch (e) {
    return [`ERROR: ${(e as Error).message}`];
  }
};

export const GLInfo: React.FC = () => {
  const [lines] = useState(probe);
  return (
    <AbsoluteFill style={{ background: "#111", color: "#eee", padding: 40, fontSize: 28, fontFamily: "monospace" }}>
      {lines.map((l) => (
        <div key={l} data-glinfo>
          {l}
        </div>
      ))}
    </AbsoluteFill>
  );
};
