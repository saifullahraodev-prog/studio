import { random } from "remotion";
import { BIBLE, CharacterDef } from "./bible";
import { Character, Pose } from "./Character";
import { Expression } from "./face";

// Crowds with small variations: every extra is the bible "passenger" with
// different clothes, hat, size, facing and expression. Deterministic per seed.
const COATS = ["#5A4A3E", "#3E4A5A", "#6B5A48", "#4A3E52", "#2F3A33", "#7A6A58", "#55443A", "#3B3B44"];
const TROUSERS = ["#2E2E34", "#3A3430", "#2B3038", "#403A34"];
const HATS: CharacterDef["headgear"][] = [
  { type: "bowler", color: "#26252A", band: "#141418" },
  { type: "bowler", color: "#4A3A2C", band: "#2A2018" },
  { type: "flatCap", color: "#5A5048", band: "#2E2A26" },
  { type: "flatCap", color: "#3E4450", band: "#22262E" },
  { type: "none", color: "#000" },
];

// 1911 garment workers: shirtwaists in light colours, dark skirts, period hair
const BLOUSES = ["#EFE9DC", "#F4F1EA", "#E3EAF2", "#F0E2E0", "#E8E4D0", "#DCE4DA"];
const SKIRTS = ["#2E3448", "#262428", "#4A3A2E", "#3A3E44", "#2F3A33", "#4A2E34"];
const HAIR_COLORS = ["#3A2A20", "#1E1A18", "#5A3A24", "#7A5230", "#2A2420", "#8A6A3A"];
const HAIR_STYLES: NonNullable<CharacterDef["hair"]>["style"][] = ["gibson", "bun", "braid", "gibson", "bun"];

const workerDef = (r: (k: string) => number): CharacterDef => {
  const base = BIBLE.worker;
  const blouse = BLOUSES[Math.floor(r("b") * BLOUSES.length)];
  const skirt = SKIRTS[Math.floor(r("k") * SKIRTS.length)];
  return {
    ...base,
    body: { ...base.body, torso: blouse, sleeve: blouse, skirt, legs: skirt, trim: SKIRTS[Math.floor(r("tr") * SKIRTS.length)], scale: 0.84 + r("s") * 0.12 },
    hair: { style: HAIR_STYLES[Math.floor(r("hs") * HAIR_STYLES.length)], color: HAIR_COLORS[Math.floor(r("hc") * HAIR_COLORS.length)] },
  };
};

export type Extra = {
  def: CharacterDef;
  position: [number, number, number];
  rotationY: number;
  expression: Expression;
  phase: number;
};

export const makeCrowd = (opts: {
  seed: string;
  count: number;
  area: { x: [number, number]; z: [number, number] };
  faceToward?: [number, number]; // x,z point most extras look at
  expressions?: Expression[];
  minGap?: number;
  kind?: "passengers" | "workers" | "mixed"; // mixed = mostly workers + some men in shirt sleeves / caps
}): Extra[] => {
  const r = (i: number, k: string) => random(`${opts.seed}-${i}-${k}`);
  const out: Extra[] = [];
  const gap = opts.minGap ?? 0.95;
  let tries = 0;
  while (out.length < opts.count && tries < opts.count * 40) {
    const i = tries++;
    const x = opts.area.x[0] + r(i, "x") * (opts.area.x[1] - opts.area.x[0]);
    const z = opts.area.z[0] + r(i, "z") * (opts.area.z[1] - opts.area.z[0]);
    if (out.some((e) => Math.hypot(e.position[0] - x, e.position[2] - z) < gap)) continue;
    const kind = opts.kind ?? "passengers";
    const isWorker = kind === "workers" || (kind === "mixed" && r(i, "w") < 0.78);
    const base = BIBLE.passenger;
    const coat = COATS[Math.floor(r(i, "c") * COATS.length)];
    const def: CharacterDef = isWorker
      ? workerDef((k) => r(i, k))
      : {
          ...base,
          body: { ...base.body, torso: coat, sleeve: coat, legs: TROUSERS[Math.floor(r(i, "t") * TROUSERS.length)], scale: 0.9 + r(i, "s") * 0.16 },
          headgear: HATS[Math.floor(r(i, "h") * HATS.length)],
        };
    const look = opts.faceToward ? Math.atan2(opts.faceToward[0] - x, opts.faceToward[1] - z) : 0;
    const exprs = opts.expressions ?? ["worried", "scared", "shocked"];
    out.push({
      def,
      position: [x, 0, z],
      rotationY: look + (r(i, "ry") - 0.5) * 0.9,
      expression: exprs[Math.floor(r(i, "e") * exprs.length)],
      phase: r(i, "p") * Math.PI * 2,
    });
  }
  return out;
};

// Render a crowd. `t` (seconds) drives small idle motion (breathing, glancing).
export const Crowd: React.FC<{ extras: Extra[]; t: number; pose?: (e: Extra, t: number) => Pose }> = ({ extras, t, pose }) => (
  <group>
    {extras.map((e, i) => (
      <Character
        key={i}
        def={e.def}
        expression={e.expression}
        position={e.position}
        rotationY={e.rotationY}
        pose={pose ? pose(e, t) : { bob: Math.sin(t * 2.2 + e.phase) * 0.015, headYaw: Math.sin(t * 0.9 + e.phase) * 0.25, armL: [0.2 + Math.sin(t * 1.7 + e.phase) * 0.15, 0.25], armR: [0.15, 0.2] }}
      />
    ))}
  </group>
);
