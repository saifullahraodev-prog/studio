import React from "react";
import { style } from "../look/style";

// ─────────────────────────────────────────────────────────────────────────────
// Drawn face panels. A face is a flat "paper" card (off-white, rounded square,
// charcoal ink, paper grain) that is mapped onto the 3D head. Expressions and
// mouth shapes are image swaps from a sprite sheet generated from this file.
// Our own design; deliberately NOT a white round circle face.
// ─────────────────────────────────────────────────────────────────────────────

export const FACE_VARIANTS = ["A", "B", "C", "D"] as const;
export type FaceVariant = (typeof FACE_VARIANTS)[number];
export const VARIANT_NAMES: Record<FaceVariant, string> = {
  A: "Ink Dot",
  B: "Bean & Blush",
  C: "Woodcut",
  D: "Comic", // whole head is the face; big expressive eyes (current channel look)
};
// Variants whose cells are transparent (features only, drawn straight onto the head).
export const isHeadFace = (v: FaceVariant) => v === "D";

export const EXPRESSIONS = ["neutral", "happy", "worried", "scared", "angry", "shocked", "determined", "sad"] as const;
export type Expression = (typeof EXPRESSIONS)[number];

// Sheet columns: 0 = the expression's own resting mouth, 1..5 = talking shapes.
export const TALK_MOUTHS = ["closed", "small", "wide", "round", "teeth"] as const;
export type TalkMouth = (typeof TALK_MOUTHS)[number];
export type MouthSlot = "rest" | TalkMouth;
export const MOUTH_SLOTS: MouthSlot[] = ["rest", ...TALK_MOUTHS];

type RestMouth = "flat" | "smile" | "openSmile" | "wobble" | "frown" | "oTall" | "grit" | "smirk" | "bigO";

type ExprParams = {
  eyeOpen: number; // 1 = normal height
  pupil: number; // pupil / dot size factor
  smileEyes?: boolean; // closed happy arcs
  lidInner: number; // 0..1 lid drop at inner corner (angry)
  lidOuter: number; // 0..1 lid drop at outer corner (sad / tired)
  browY: number; // + raises brows
  browTilt: number; // + inner end up (worried), - inner end down (angry)
  mouth: RestMouth;
  sweat?: boolean;
  tear?: boolean;
  blush?: boolean;
};

export const EXPR: Record<Expression, ExprParams> = {
  neutral: { eyeOpen: 1, pupil: 1, lidInner: 0, lidOuter: 0, browY: 0, browTilt: 0, mouth: "flat" },
  happy: { eyeOpen: 1, pupil: 1, smileEyes: true, lidInner: 0, lidOuter: 0, browY: 0.6, browTilt: 0.15, mouth: "openSmile", blush: true },
  worried: { eyeOpen: 1.05, pupil: 0.9, lidInner: 0, lidOuter: 0.15, browY: 0.5, browTilt: 1, mouth: "wobble", sweat: true },
  scared: { eyeOpen: 1.3, pupil: 0.55, lidInner: 0, lidOuter: 0, browY: 1.2, browTilt: 1.1, mouth: "oTall", sweat: true },
  angry: { eyeOpen: 0.95, pupil: 1, lidInner: 0.75, lidOuter: 0.15, browY: -0.6, browTilt: -1.2, mouth: "grit" },
  shocked: { eyeOpen: 1.45, pupil: 0.45, lidInner: 0, lidOuter: 0, browY: 1.8, browTilt: 0.2, mouth: "bigO" },
  determined: { eyeOpen: 0.9, pupil: 1, lidInner: 0.45, lidOuter: 0.05, browY: -0.3, browTilt: -0.6, mouth: "smirk" },
  sad: { eyeOpen: 0.9, pupil: 1, lidInner: 0.05, lidOuter: 0.55, browY: 0.3, browTilt: 0.9, mouth: "frown", tear: true },
};

// Per-character extras drawn on top (defined in the character bible).
export type FaceExtras = { glasses?: boolean; soot?: boolean; stubble?: boolean; mustache?: boolean };

// ─── geometry ───────────────────────────────────────────────────────────────
const W = style.face.cellW; // 320
const H = style.face.cellH; // 240
const CX = W / 2;
const EYE_Y = 104;
const EYE_DX = 54;
const MOUTH_Y = 176;

type VariantLook = {
  scale: number; // feature scale (bigger + bolder lines)
  radius: number;
  border: number; // ink border width (0 = none)
  browW: number;
  browCap: "round" | "butt";
  mouthW: number;
};
const LOOK: Record<FaceVariant, VariantLook> = {
  A: { scale: 1.24, radius: 84, border: 0, browW: 10, browCap: "round", mouthW: 6.5 },
  B: { scale: 1, radius: 54, border: 4, browW: 5, browCap: "round", mouthW: 5 },
  C: { scale: 1, radius: 34, border: 3, browW: 13, browCap: "butt", mouthW: 7 },
  D: { scale: 1, radius: 0, border: 0, browW: 11, browCap: "round", mouthW: 7 },
};

const INK = style.ink.ink;
const PAPER = style.ink.paper;
const ACCENT = style.ink.accent;

// ─── eyes ───────────────────────────────────────────────────────────────────
const Eye: React.FC<{ v: FaceVariant; e: ExprParams; side: -1 | 1 }> = ({ v, e, side }) => {
  // side -1 = character's right eye (image left), +1 = image right. Inner corner faces centre.
  const cx = CX + side * EYE_DX;
  const cy = EYE_Y;
  const inner = -side; // direction toward the centre of the face in x
  const els: React.ReactNode[] = [];

  if (e.smileEyes) {
    const w = v === "C" ? 15 : 16;
    els.push(
      <path key="arc" d={`M${cx - w} ${cy + 5} Q${cx} ${cy - 16} ${cx + w} ${cy + 5}`} fill="none" stroke={INK} strokeWidth={v === "B" ? 5 : 7} strokeLinecap="round" />,
    );
    return <g>{els}</g>;
  }

  let ry = 0;
  if (v === "A") {
    ry = 15 * e.eyeOpen;
    const rx = 10 * (0.85 + 0.15 * e.eyeOpen);
    els.push(<ellipse key="e" cx={cx} cy={cy} rx={rx} ry={ry} fill={INK} />);
    if (e.pupil < 0.8) {
      // fright: hollow ring eyes
      els.pop();
      els.push(<ellipse key="e" cx={cx} cy={cy} rx={rx + 3} ry={ry} fill={PAPER} stroke={INK} strokeWidth={5} />);
      els.push(<circle key="p" cx={cx} cy={cy} r={5 * e.pupil + 2} fill={INK} />);
    } else {
      els.push(<circle key="h" cx={cx - 3} cy={cy - ry * 0.45} r={3.2} fill={PAPER} />);
    }
  } else if (v === "B") {
    ry = 15 * e.eyeOpen;
    const rx = 19;
    els.push(
      <path
        key="w"
        d={`M${cx - rx} ${cy} Q${cx} ${cy - ry * 1.55} ${cx + rx} ${cy} Q${cx} ${cy + ry * 1.25} ${cx - rx} ${cy} Z`}
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />,
    );
    const pr = 9 * e.pupil;
    els.push(<circle key="p" cx={cx + inner * 1.5} cy={cy + 1} r={pr} fill={INK} />);
    els.push(<circle key="h" cx={cx + inner * 1.5 - 3} cy={cy - 3} r={Math.max(1.6, pr * 0.3)} fill="#FFFFFF" />);
  } else {
    // C: small dot under a heavy upper lid line
    ry = 11 * e.eyeOpen;
    const r = 6.5 * (e.pupil < 0.8 ? 0.6 : 1);
    if (e.eyeOpen > 1.2) els.push(<circle key="ring" cx={cx} cy={cy + 1} r={13} fill="none" stroke={INK} strokeWidth={3} />);
    els.push(<circle key="d" cx={cx} cy={cy + 2} r={r} fill={INK} />);
    els.push(
      <path key="lid" d={`M${cx - 17} ${cy - ry * 0.55} Q${cx} ${cy - ry * 1.3} ${cx + 17} ${cy - ry * 0.55}`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="butt" />,
    );
    // under-eye hatch
    els.push(<path key="bag" d={`M${cx - 10} ${cy + 15} Q${cx} ${cy + 19} ${cx + 10} ${cy + 15}`} fill="none" stroke={INK} strokeWidth={2} opacity={0.6} />);
  }

  // Lids (angry / sad / determined): paper-coloured wedge over the eye top + ink edge.
  if (e.lidInner > 0 || e.lidOuter > 0) {
    const top = cy - ry - 8;
    const span = v === "B" ? 22 : 18;
    const xi = cx + inner * span;
    const xo = cx - inner * span;
    const yi = cy - ry + ry * 1.6 * e.lidInner;
    const yo = cy - ry + ry * 1.6 * e.lidOuter;
    els.push(<polygon key="lidfill" points={`${xo},${top - 12} ${xi},${top - 12} ${xi},${yi} ${xo},${yo}`} fill={PAPER} />);
    els.push(<line key="lidline" x1={xo} y1={yo} x2={xi} y2={yi} stroke={INK} strokeWidth={v === "A" ? 5 : 4} strokeLinecap="round" />);
  }
  return <g>{els}</g>;
};

// ─── brows ──────────────────────────────────────────────────────────────────
const Brow: React.FC<{ v: FaceVariant; e: ExprParams; side: -1 | 1 }> = ({ v, e, side }) => {
  const L = LOOK[v];
  const cx = CX + side * EYE_DX;
  const base = EYE_Y - (v === "C" ? 34 : 38) - e.browY * 10;
  const inner = -side;
  const xi = cx + inner * 17;
  const xo = cx - inner * 19;
  const yi = base - e.browTilt * 9;
  const yo = base + e.browTilt * 3;
  const mx = (xi + xo) / 2;
  const my = (yi + yo) / 2 - (v === "B" ? 5 : 2);
  return <path d={`M${xo} ${yo} Q${mx} ${my} ${xi} ${yi}`} fill="none" stroke={INK} strokeWidth={L.browW} strokeLinecap={L.browCap} />;
};

// ─── mouths ─────────────────────────────────────────────────────────────────
const Tongue: React.FC<{ cx: number; cy: number; rx: number; ry: number }> = (p) => (
  <ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill={ACCENT} />
);

const Mouth: React.FC<{ v: FaceVariant; shape: RestMouth | TalkMouth }> = ({ v, shape }) => {
  const sw = LOOK[v].mouthW;
  const y = MOUTH_Y;
  const s = { fill: "none", stroke: INK, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (shape) {
    case "flat":
    case "closed":
      return <path d={`M${CX - 20} ${y} Q${CX} ${y + 3} ${CX + 20} ${y}`} {...s} />;
    case "smile":
      return <path d={`M${CX - 26} ${y - 6} Q${CX} ${y + 16} ${CX + 26} ${y - 6}`} {...s} />;
    case "openSmile":
      return (
        <g>
          <clipPath id={`osm-${v}`}>
            <path d={`M${CX - 30} ${y - 10} Q${CX} ${y - 8} ${CX + 30} ${y - 10} Q${CX + 24} ${y + 26} ${CX} ${y + 27} Q${CX - 24} ${y + 26} ${CX - 30} ${y - 10} Z`} />
          </clipPath>
          <path d={`M${CX - 30} ${y - 10} Q${CX} ${y - 8} ${CX + 30} ${y - 10} Q${CX + 24} ${y + 26} ${CX} ${y + 27} Q${CX - 24} ${y + 26} ${CX - 30} ${y - 10} Z`} fill={INK} />
          <g clipPath={`url(#osm-${v})`}>
            <Tongue cx={CX} cy={y + 24} rx={17} ry={10} />
          </g>
        </g>
      );
    case "wobble":
      return <path d={`M${CX - 24} ${y + 2} q6 -7 12 0 t12 0 t12 0 t12 0`} {...s} />;
    case "frown":
      return <path d={`M${CX - 22} ${y + 10} Q${CX} ${y - 10} ${CX + 22} ${y + 10}`} {...s} />;
    case "smirk":
      return <path d={`M${CX - 20} ${y + 2} Q${CX + 2} ${y + 6} ${CX + 22} ${y - 6}`} {...s} />;
    case "oTall":
      return <ellipse cx={CX} cy={y + 4} rx={12} ry={18} fill={INK} />;
    case "bigO":
      return (
        <g>
          <ellipse cx={CX} cy={y + 6} rx={19} ry={23} fill={INK} />
          <Tongue cx={CX} cy={y + 22} rx={10} ry={5} />
        </g>
      );
    case "grit":
      return (
        <g>
          <rect x={CX - 28} y={y - 10} width={56} height={22} rx={7} fill="#FFFFFF" stroke={INK} strokeWidth={sw - 1} />
          <line x1={CX - 26} y1={y + 1} x2={CX + 26} y2={y + 1} stroke={INK} strokeWidth={2.5} />
          {[-14, 0, 14].map((dx) => (
            <line key={dx} x1={CX + dx} y1={y - 9} x2={CX + dx} y2={y + 11} stroke={INK} strokeWidth={2.5} />
          ))}
        </g>
      );
    case "small":
      return <ellipse cx={CX} cy={y + 2} rx={13} ry={7} fill={INK} />;
    case "wide":
      return (
        <g>
          <clipPath id={`wide-${v}`}>
            <path d={`M${CX - 26} ${y - 6} Q${CX} ${y - 10} ${CX + 26} ${y - 6} Q${CX + 20} ${y + 24} ${CX} ${y + 25} Q${CX - 20} ${y + 24} ${CX - 26} ${y - 6} Z`} />
          </clipPath>
          <path d={`M${CX - 26} ${y - 6} Q${CX} ${y - 10} ${CX + 26} ${y - 6} Q${CX + 20} ${y + 24} ${CX} ${y + 25} Q${CX - 20} ${y + 24} ${CX - 26} ${y - 6} Z`} fill={INK} />
          <g clipPath={`url(#wide-${v})`}>
            <Tongue cx={CX} cy={y + 22} rx={14} ry={8} />
          </g>
        </g>
      );
    case "round":
      return <ellipse cx={CX} cy={y + 3} rx={11} ry={14} fill={INK} />;
    case "teeth":
      return (
        <g>
          <rect x={CX - 22} y={y - 7} width={44} height={18} rx={8} fill={INK} />
          <rect x={CX - 17} y={y - 6} width={34} height={6} rx={2} fill="#FFFFFF" />
        </g>
      );
  }
};

// ─── extras ─────────────────────────────────────────────────────────────────
const Extras: React.FC<{ v: FaceVariant; x: FaceExtras; e: ExprParams }> = ({ v, x, e }) => (
  <g>
    {x.soot && (
      <g fill="#5A5550" opacity={0.28}>
        <ellipse cx={CX - 92} cy={150} rx={26} ry={13} transform={`rotate(-18 ${CX - 92} 150)`} />
        <ellipse cx={CX + 98} cy={64} rx={20} ry={9} transform={`rotate(14 ${CX + 98} 64)`} />
        <ellipse cx={CX + 70} cy={196} rx={14} ry={7} />
      </g>
    )}
    {x.stubble && (
      <g fill={INK} opacity={0.55}>
        {[[-34, 196], [-22, 204], [-8, 208], [8, 208], [22, 204], [34, 196], [-28, 212], [0, 216], [28, 212], [-14, 218], [14, 218]].map(([dx, dy], i) => (
          <circle key={i} cx={CX + dx} cy={dy} r={1.8} />
        ))}
      </g>
    )}
    {x.mustache && (
      <path
        d={`M${CX} ${MOUTH_Y - 14} q-14 -8 -30 2 q10 2 14 6 q8 0 16 -6 q8 6 16 6 q4 -4 14 -6 q-16 -10 -30 -2 Z`}
        fill={INK}
      />
    )}
    {x.glasses && (
      <g fill="none" stroke={INK} strokeWidth={v === "B" ? 3.5 : 4.5}>
        <circle cx={CX - EYE_DX} cy={EYE_Y + 2} r={27} />
        <circle cx={CX + EYE_DX} cy={EYE_Y + 2} r={27} />
        <path d={`M${CX - EYE_DX + 27} ${EYE_Y - 2} Q${CX} ${EYE_Y - 12} ${CX + EYE_DX - 27} ${EYE_Y - 2}`} />
        <line x1={CX - EYE_DX - 27} y1={EYE_Y - 2} x2={CX - EYE_DX - 52} y2={EYE_Y - 8} />
        <line x1={CX + EYE_DX + 27} y1={EYE_Y - 2} x2={CX + EYE_DX + 52} y2={EYE_Y - 8} />
      </g>
    )}
    {e.blush && (v === "B" || !x.soot) && (
      <g stroke={ACCENT} strokeWidth={3} strokeLinecap="round" opacity={0.9}>
        {[-1, 1].map((sd) =>
          [0, 9, 18].map((o) => (
            <line key={`${sd}${o}`} x1={CX + sd * 88 - 9 + o} y1={146} x2={CX + sd * 88 - 15 + o} y2={158} />
          )),
        )}
      </g>
    )}
  </g>
);

const Nose: React.FC<{ v: FaceVariant }> = ({ v }) => {
  if (v === "A") return <path d={`M${CX - 2} ${EYE_Y + 24} q9 7 0 15`} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />;
  if (v === "C") return <path d={`M${CX + 3} ${EYE_Y + 10} Q${CX - 2} ${EYE_Y + 30} ${CX - 9} ${EYE_Y + 37} Q${CX} ${EYE_Y + 44} ${CX + 9} ${EYE_Y + 38}`} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />;
  return null;
};

const Drops: React.FC<{ e: ExprParams }> = ({ e }) => (
  <g>
    {e.sweat && (
      <path d={`M${CX + 112} 40 q-11 18 0 24 q11 -6 0 -24 Z`} fill="#BFE3F5" stroke={INK} strokeWidth={3} />
    )}
    {e.tear && (
      <path d={`M${CX + EYE_DX + 8} ${EYE_Y + 18} q-8 13 0 18 q8 -5 0 -18 Z`} fill="#BFE3F5" stroke={INK} strokeWidth={2.5} />
    )}
  </g>
);

// ─── one face cell ──────────────────────────────────────────────────────────
// Returns SVG content for one cell (W x H). `uid` keeps filter ids unique on a sheet.
export const FaceCell: React.FC<{
  variant: FaceVariant;
  expression: Expression;
  mouth: MouthSlot;
  extras?: FaceExtras;
  uid: string;
}> = ({ variant: v, expression, mouth, extras = {}, uid }) => {
  if (v === "D") return <ComicCell expression={expression} mouth={mouth} extras={extras} uid={uid} />;
  const e = EXPR[expression];
  const L = LOOK[v];
  const inset = 6;
  const shape = mouth === "rest" ? e.mouth : mouth === "closed" ? e.mouth === "openSmile" ? "smile" : e.mouth === "bigO" || e.mouth === "oTall" ? "small" : e.mouth : mouth;
  return (
    <g>
      <defs>
        <clipPath id={`panel-${uid}`}>
          <rect x={inset} y={inset} width={W - inset * 2} height={H - inset * 2} rx={L.radius} />
        </clipPath>
        <filter id={`grain-${uid}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={7} result="n" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 -1.4 1.0" />
        </filter>
        <filter id={`wobble-${uid}`}>
          <feTurbulence type="turbulence" baseFrequency="0.035" numOctaves="2" seed={3} result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale={style.ink.wobble * 2} />
        </filter>
      </defs>
      <g clipPath={`url(#panel-${uid})`}>
        <rect x={0} y={0} width={W} height={H} fill={PAPER} />
        <g filter={`url(#wobble-${uid})`} transform={`translate(${CX} 128) scale(${L.scale}) translate(${-CX} -128)`}>
          <Extras v={v} x={{ ...extras, glasses: false, mustache: false }} e={e} />
          <Eye v={v} e={e} side={-1} />
          <Eye v={v} e={e} side={1} />
          <Brow v={v} e={e} side={-1} />
          <Brow v={v} e={e} side={1} />
          {extras.glasses && <Extras v={v} x={{ glasses: true }} e={{ ...e, blush: false }} />}
          <Nose v={v} />
          {extras.mustache && <Extras v={v} x={{ mustache: true }} e={{ ...e, blush: false }} />}
          <Mouth v={v} shape={shape as RestMouth | TalkMouth} />
          <Drops e={e} />
        </g>
        <rect x={0} y={0} width={W} height={H} filter={`url(#grain-${uid})`} opacity={style.ink.grainOpacity * 2.2} style={{ mixBlendMode: "multiply" }} />
      </g>
      {L.border > 0 && (
        <rect x={inset} y={inset} width={W - inset * 2} height={H - inset * 2} rx={L.radius} fill="none" stroke={INK} strokeWidth={L.border} />
      )}
    </g>
  );
};

// ─── Variant D "Comic": the whole round head is the face ───────────────────
// Big white eyes with small dot pupils, lids that droop/squint/pop, a little
// asymmetry, small mouth low on the face, no nose. Cells are transparent:
// only the features are drawn, straight onto the paper-coloured head.
const CD = { dx: 56, eyeY: 110, rx: 28, ry: 35, mouthY: 194 };
type ComicExpr = {
  sL: number; // eye size, image-left eye
  sR: number; // eye size, image-right eye (asymmetry = comedy)
  pupil: number; // pupil radius px
  px?: number; // pupil shift toward the nose
  py?: number; // pupil shift down
  lidIn: number; // upper lid drop at inner corner 0..1
  lidOut: number; // upper lid drop at outer corner 0..1
  lidBot?: number; // lower lid rise 0..1 (squint)
  arcs?: boolean; // happy closed-eye arcs
  brow?: { tilt: number; y: number };
};
const COMIC: Record<Expression, ComicExpr> = {
  neutral: { sL: 1, sR: 1, pupil: 8.5, lidIn: 0.14, lidOut: 0.14 },
  happy: { sL: 1, sR: 1, pupil: 8, lidIn: 0, lidOut: 0, arcs: true },
  worried: { sL: 1, sR: 0.94, pupil: 7, py: 3, lidIn: 0, lidOut: 0.2, brow: { tilt: 1, y: 0.4 } },
  scared: { sL: 1.12, sR: 1, pupil: 4.5, lidIn: 0, lidOut: 0, brow: { tilt: 1.1, y: 1.1 } },
  angry: { sL: 0.95, sR: 0.95, pupil: 8, px: 2, lidIn: 0.62, lidOut: 0.18, brow: { tilt: -1.3, y: -0.5 } },
  shocked: { sL: 1.24, sR: 1.04, pupil: 4, lidIn: 0, lidOut: 0, brow: { tilt: 0.2, y: 1.7 } },
  determined: { sL: 0.95, sR: 0.95, pupil: 9, px: 1, lidIn: 0.45, lidOut: 0.3, lidBot: 0.18, brow: { tilt: -0.6, y: -0.3 } },
  sad: { sL: 0.95, sR: 0.95, pupil: 8, py: 7, lidIn: 0.1, lidOut: 0.5, brow: { tilt: 1, y: 0.3 } },
};

const ComicEye: React.FC<{ c: ComicExpr; side: -1 | 1; uid: string }> = ({ c, side, uid }) => {
  const s = side < 0 ? c.sL : c.sR;
  const cx = CX + side * CD.dx;
  const cy = CD.eyeY;
  const rx = CD.rx * s;
  const ry = CD.ry * s;
  const inner = -side;
  const id = `ce-${uid}-${side}`;
  if (c.arcs) {
    return <path d={`M${cx - rx * 0.85} ${cy + 8} Q${cx} ${cy - ry * 0.75} ${cx + rx * 0.85} ${cy + 8}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />;
  }
  const xo = cx - inner * rx * 1.2;
  const xi = cx + inner * rx * 1.2;
  const yo = cy - ry + 2 * ry * c.lidOut;
  const yi = cy - ry + 2 * ry * c.lidIn;
  const paper = style.face.headPaper;
  return (
    <g>
      <clipPath id={id}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
      </clipPath>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFFFFF" />
      <g clipPath={`url(#${id})`}>
        <circle cx={cx + inner * (c.px ?? 0) * s} cy={cy + (c.py ?? 0) * s} r={c.pupil * s} fill={INK} />
        {(c.lidIn > 0 || c.lidOut > 0) && (
          <>
            <polygon points={`${xo},${cy - ry - 12} ${xi},${cy - ry - 12} ${xi},${yi} ${xo},${yo}`} fill={paper} />
            <line x1={xo} y1={yo} x2={xi} y2={yi} stroke={INK} strokeWidth={6} />
          </>
        )}
        {c.lidBot && (
          <>
            <rect x={cx - rx - 4} y={cy + ry - 2 * ry * c.lidBot} width={rx * 2 + 8} height={ry} fill={paper} />
            <line x1={cx - rx} y1={cy + ry - 2 * ry * c.lidBot} x2={cx + rx} y2={cy + ry - 2 * ry * c.lidBot} stroke={INK} strokeWidth={5} />
          </>
        )}
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={6.5} />
    </g>
  );
};

const ComicBrow: React.FC<{ c: ComicExpr; side: -1 | 1 }> = ({ c, side }) => {
  if (!c.brow) return null;
  const s = side < 0 ? c.sL : c.sR;
  const cx = CX + side * CD.dx;
  const inner = -side;
  const base = CD.eyeY - CD.ry * s - 14 - c.brow.y * 8;
  const xi = cx + inner * CD.rx * 0.75;
  const xo = cx - inner * CD.rx * 0.95;
  const yi = base - c.brow.tilt * 10;
  const yo = base + c.brow.tilt * 3;
  return <path d={`M${xo} ${yo} Q${(xi + xo) / 2} ${(yi + yo) / 2 - 4} ${xi} ${yi}`} fill="none" stroke={INK} strokeWidth={11} strokeLinecap="round" />;
};

const ComicCell: React.FC<{ expression: Expression; mouth: MouthSlot; extras: FaceExtras; uid: string }> = ({ expression, mouth, extras, uid }) => {
  const e = EXPR[expression];
  const c = COMIC[expression];
  const shape = mouth === "rest" ? e.mouth : mouth === "closed" ? (e.mouth === "openSmile" ? "smile" : e.mouth === "bigO" || e.mouth === "oTall" ? "small" : e.mouth) : mouth;
  return (
    <g>
      <defs>
        <filter id={`wobble-${uid}`}>
          <feTurbulence type="turbulence" baseFrequency="0.035" numOctaves="2" seed={3} result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale={style.ink.wobble * 2} />
        </filter>
      </defs>
      <g filter={`url(#wobble-${uid})`}>
        <Extras v="D" x={{ ...extras, glasses: false, mustache: false }} e={e} />
        <ComicEye c={c} side={-1} uid={uid} />
        <ComicEye c={c} side={1} uid={uid} />
        <ComicBrow c={c} side={-1} />
        <ComicBrow c={c} side={1} />
        <g transform={`translate(${CX} ${CD.mouthY}) scale(1.18) translate(${-CX} ${-MOUTH_Y})`}>
          <Mouth v="D" shape={shape as RestMouth | TalkMouth} />
        </g>
        <Drops e={e} />
      </g>
    </g>
  );
};

// Full sprite sheet: rows = expressions, columns = mouth slots.
export const SHEET_COLS = MOUTH_SLOTS.length; // 6
export const SHEET_ROWS = EXPRESSIONS.length; // 8
export const SHEET_W = W * SHEET_COLS;
export const SHEET_H = H * SHEET_ROWS;

export const FaceSheetSvg: React.FC<{ variant: FaceVariant; extras?: FaceExtras }> = ({ variant, extras }) => (
  <svg width={SHEET_W} height={SHEET_H} viewBox={`0 0 ${SHEET_W} ${SHEET_H}`} xmlns="http://www.w3.org/2000/svg">
    {EXPRESSIONS.map((ex, r) =>
      MOUTH_SLOTS.map((m, c) => (
        <g key={`${r}-${c}`} transform={`translate(${c * W} ${r * H})`}>
          <FaceCell variant={variant} expression={ex} mouth={m} extras={extras} uid={`${r}-${c}`} />
        </g>
      )),
    )}
  </svg>
);

// UV window of a cell in the sheet (three.js: v=0 at the bottom).
export const cellUV = (expression: Expression, mouth: MouthSlot) => {
  const r = EXPRESSIONS.indexOf(expression);
  const c = MOUTH_SLOTS.indexOf(mouth);
  return {
    repeat: [1 / SHEET_COLS, 1 / SHEET_ROWS] as [number, number],
    offset: [c / SHEET_COLS, 1 - (r + 1) / SHEET_ROWS] as [number, number],
  };
};

// Eye centre + glasses ring radius in cell pixels (for 3D props placed on the face).
export const eyeCellPos = (v: FaceVariant) => {
  if (v === "D") return { dx: CD.dx, y: CD.eyeY, ringR: CD.ry + 9 };
  const s = LOOK[v].scale;
  return { dx: EYE_DX * s, y: 128 + (EYE_Y + 2 - 128) * s, ringR: 27 * s };
};

export const faceSheetPath = (characterId: string, variant: FaceVariant) => `characters/faces/${characterId}-${variant}.png`;
