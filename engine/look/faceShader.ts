import { createContext, useContext } from "react";
import * as THREE from "three";
import { style } from "./style";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// "Ink & paper" shading for heads and face panels: the channel's signature.
// Instead of the usual flat grey half-shadow, the dark side of a head is drawn
// as pen crosshatching on paper, following the real 3D light direction.
// Options (style file `face.shading`): hatch on/off, card rim on/off.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type SceneLight = {
  dir: [number, number, number]; // direction TO the light (world)
  color: string;
  ambient: string;
  glow: number; // keeps faces readable in dark scenes
};

export const DEFAULT_LIGHT: SceneLight = { dir: [-4, 7, 6], color: "#FFF6E8", ambient: "#9A9AA4", glow: 0 };
export const SceneLightContext = createContext<SceneLight>(DEFAULT_LIGHT);
export const useSceneLight = () => useContext(SceneLightContext);

export type FaceLook = { hatch: boolean; rim: boolean };
export const FaceLookContext = createContext<FaceLook>({ hatch: style.face.shading.hatch, rim: style.face.shading.rim });
export const useFaceLook = () => useContext(FaceLookContext);

const vert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec2 vPanel;
  varying vec3 vWorld;
  uniform vec2 uvRepeat;
  uniform vec2 uvOffset;
  void main() {
    vPanel = uv;
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    vUv = uv * uvRepeat + uvOffset;
    vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const frag = /* glsl */ `
  uniform sampler2D map;
  uniform bool useMap;
  uniform vec3 paper;
  uniform vec3 ink;
  uniform vec3 lightDir;
  uniform vec3 lightColor;
  uniform vec3 ambient;
  uniform float glow;
  uniform float hatch;
  uniform float hatchDensity;
  uniform vec2 texel;        // size of one sprite-sheet pixel in uv
  uniform float relief;      // how deep the drawn features are pressed into the face
  uniform float occlusion;   // soft shadow around features (eye sockets, mouth)
  uniform float sheen;       // soft surface highlight
  varying vec2 vUv;
  varying vec3 vN;
  varying vec2 vPanel;
  varying vec3 vWorld;

  // 1 where there is ink (dark drawing), 0 on bare paper
  float inkAt(vec2 uv) {
    vec4 t = texture2D(map, uv);
    return clamp((0.85 - dot(t.rgb, vec3(0.3333))) * 1.6, 0.0, 1.0) * step(0.5, t.a);
  }
  // softened ink (gives the pressed-in features a rounded bevel)
  float softInk(vec2 uv) {
    float s = 0.0;
    s += inkAt(uv + texel * vec2( 1.5,  0.0));
    s += inkAt(uv + texel * vec2(-1.5,  0.0));
    s += inkAt(uv + texel * vec2( 0.0,  1.5));
    s += inkAt(uv + texel * vec2( 0.0, -1.5));
    return (s + inkAt(uv) * 2.0) / 6.0;
  }

  float lines(float v, float th) {
    float d = abs(fract(v) - 0.5);
    float fw = fwidth(v) * 1.2;
    return smoothstep(0.5 - th - fw, 0.5 - th, d);
  }

  void main() {
    vec4 c = useMap ? texture2D(map, vUv) : vec4(paper, 1.0);
    if (c.a < 0.5) discard;
    vec3 n = normalize(vN);
    float ndl = dot(n, normalize(lightDir));
    float lit = smoothstep(-0.02, 0.12, ndl);          // crisp cartoon terminator
    vec3 light = ambient + lightColor * (0.35 + 0.65 * lit);
    vec3 col = c.rgb * light * (1.0 - 0.1 * (1.0 - lit));

    if (useMap) {
      // ── make the drawing part of the face, not a sticker on it ──
      // 1) relief: features are pressed slightly into the surface (bump from the drawing)
      float d = 3.0;
      float hx = softInk(vUv + vec2(texel.x * d, 0.0)) - softInk(vUv - vec2(texel.x * d, 0.0));
      float hy = softInk(vUv + vec2(0.0, texel.y * d)) - softInk(vUv - vec2(0.0, texel.y * d));
      vec3 dp1 = dFdx(vWorld), dp2 = dFdy(vWorld);
      vec2 du1 = dFdx(vPanel), du2 = dFdy(vPanel);
      vec3 dp2perp = cross(dp2, n), dp1perp = cross(n, dp1);
      vec3 T = dp2perp * du1.x + dp1perp * du2.x;
      vec3 B = dp2perp * du1.y + dp1perp * du2.y;
      float im = inversesqrt(max(max(dot(T, T), dot(B, B)), 1e-12));
      vec3 nb = normalize(n + relief * (hx * T * im + hy * B * im));
      vec3 L = normalize(lightDir);
      float detail = dot(nb, L) - dot(n, L);            // light/shadow on the feature edges only
      col *= 1.0 + (detail > 0.0 ? detail * 0.35 : detail * 1.2);   // soft bevel, no bright halo
      // 2) occlusion: paper darkens softly around eyes, brows and mouth
      float occ = 0.0;
      for (int i = 0; i < 8; i++) {
        float a = float(i) * 0.7854;
        occ += inkAt(vUv + texel * 9.0 * vec2(cos(a), sin(a)));
      }
      occ /= 8.0;
      float here = inkAt(vUv);
      col *= 1.0 - occlusion * occ * (1.0 - here);
      // open mouth / dark areas read as depth: slightly deeper toward their top edge
      col *= 1.0 - 0.25 * here * clamp(inkAt(vUv + vec2(0.0, texel.y * 6.0)), 0.0, 1.0);
      // 3) sheen: one soft highlight that moves with the light, shared with the head
      vec3 V = normalize(cameraPosition - vWorld);
      float sp = pow(max(dot(nb, normalize(L + V)), 0.0), 36.0);
      col += lightColor * sp * sheen * lit;
    } else {
      vec3 L = normalize(lightDir);
      vec3 V = normalize(cameraPosition - vWorld);
      float sp = pow(max(dot(n, normalize(L + V)), 0.0), 36.0);
      col += lightColor * sp * sheen * lit;
    }

    if (hatch > 0.5) {
      // two hatch layers in panel space: light side clean, terminator single, deep shadow cross
      float s1 = 1.0 - smoothstep(-0.32, -0.12, ndl);   // only surfaces turned away get strokes
      float s2 = 1.0 - smoothstep(-0.7, -0.45, ndl);    // cross-hatch only in the deepest shadow
      // hand-drawn wobble so the hatching reads as pen strokes, not a screen pattern
      float wob = sin(vPanel.y * 37.0 + vPanel.x * 11.0) * 0.18 + sin(vPanel.x * 53.0) * 0.1;
      float h1 = lines((vPanel.x * 1.3 + vPanel.y) * hatchDensity + wob, 0.13) * s1;
      float h2 = lines((vPanel.x * 1.3 - vPanel.y) * hatchDensity * 0.85 - wob, 0.12) * s2;
      float h = clamp(h1 + h2, 0.0, 1.0);
      col = mix(col, ink * light * 0.9, h * 0.62);
      col *= 1.0 + 0.08 * s1;  // hatched paper stays lighter than flat grey
    }
    col += c.rgb * glow;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const lin = (hex: string) => new THREE.Color(hex); // THREE.Color converts sRGB hex to linear

export const makeInkPaperMaterial = (opts: { map?: THREE.Texture | null; paper: string; hatchDensity?: number }) =>
  new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    transparent: false,
    uniforms: {
      map: { value: opts.map ?? null },
      useMap: { value: !!opts.map },
      uvRepeat: { value: new THREE.Vector2(1, 1) },
      uvOffset: { value: new THREE.Vector2(0, 0) },
      paper: { value: lin(opts.paper) },
      ink: { value: lin(style.ink.ink) },
      lightDir: { value: new THREE.Vector3(...DEFAULT_LIGHT.dir).normalize() },
      lightColor: { value: lin(DEFAULT_LIGHT.color) },
      ambient: { value: lin(DEFAULT_LIGHT.ambient) },
      glow: { value: 0 },
      hatch: { value: 1 },
      hatchDensity: { value: opts.hatchDensity ?? 34 },
      texel: { value: new THREE.Vector2(1 / 1920, 1 / 1920) },
      relief: { value: style.face.relief },
      occlusion: { value: style.face.occlusion },
      sheen: { value: style.face.sheen },
    },
  });

export const applySceneLight = (m: THREE.ShaderMaterial, l: SceneLight, hatch: boolean) => {
  m.uniforms.lightDir.value.set(...l.dir).normalize();
  m.uniforms.lightColor.value.set(l.color).multiplyScalar(0.75);
  m.uniforms.ambient.value.set(l.ambient).multiplyScalar(0.55);
  m.uniforms.glow.value = l.glow;
  m.uniforms.hatch.value = hatch ? 1 : 0;
};
