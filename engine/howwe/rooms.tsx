// How We Ended Up · room library: period rooms + Today room. Draw from documented references before real use.
// With `f` undefined a room is static (style frames / golden); with `f` the people loop (eat, cut, chop).
import React from "react";
import { Knife } from "./lab";
import { Figure, H, Pose, SKIN, T } from "./kit";
import { loop } from "./motion";
import { INK as ink } from "./objects";

/** Loop props for a Figure: blend pose -> pose2 every `period` frames (no-op when f is undefined). */
const anim = (f: number | undefined, pose2: Pose, period: number, phase: number) =>
  f === undefined ? {} : { pose2, mix: loop(f, period, phase) };

export const EuropeRoom: React.FC<{ f?: number }> = ({ f }) => (
  <g>
    <rect width={960} height={H} fill="#CFC4B0" />
    {Array.from({ length: 9 }).map((_, r) => Array.from({ length: 7 }).map((__, c) => (
      <rect key={`${r}-${c}`} x={c * 150 - (r % 2) * 75} y={r * 90} width={146} height={86} fill="#D8CDB9" stroke="#B3A68E" strokeWidth={2} />
    )))}
    {/* tapestry + window */}
    <rect x={120} y={150} width={330} height={330} fill="#5C3A3A" stroke={T.line} strokeWidth={3.5} />
    <rect x={140} y={170} width={290} height={290} fill="none" stroke="#C9A24A" strokeWidth={4} />
    <path d="M285 210 L360 315 L285 420 L210 315 Z" fill="#7A5A3A" stroke="#C9A24A" strokeWidth={3} />
    <path d="M610 160 L610 420 L800 420 L800 160 Q705 60 610 160 Z" fill="#B7C9CC" stroke={T.line} strokeWidth={3.5} />
    <line x1={705} y1={100} x2={705} y2={420} stroke={T.line} strokeWidth={3} />
    {/* floor */}
    <rect y={820} width={960} height={260} fill="#9C8A6E" />
    {/* diners behind table */}
    <Figure x={230} y={900} s={1.08} skin={SKIN[1]} hair="covered" outfit="euMan" pose="knife" {...anim(f, "knifeCut", 50, 0)} />
    <Figure x={480} y={900} s={1.08} skin={SKIN[0]} hair="covered" outfit="euWoman" pose="eatHand" {...anim(f, "handDown", 64, 20)} />
    <Figure x={730} y={900} s={1.08} skin={SKIN[2]} hair="short" hairColor="#5A3A22" outfit="euMan" pose="eatHand" {...anim(f, "handDown", 58, 41)} />
    {/* table with cloth */}
    <rect x={60} y={700} width={840} height={30} fill="#F3EEE2" stroke={T.line} strokeWidth={3.5} />
    <path d="M60 730 L900 730 L900 860 L60 860 Z" fill="#EEE7D8" stroke={T.line} strokeWidth={3.5} />
    {[150, 350, 560, 780].map((x, i) => <ellipse key={i} cx={x} cy={712} rx={42} ry={10} fill="#C99A5B" stroke={T.line} strokeWidth={3} />)}
    {[250, 670].map((x, i) => <g key={i} stroke={T.line} strokeWidth={3}><rect x={x - 14} y={666} width={28} height={40} fill="#A9AEB4" /><ellipse cx={x} cy={666} rx={14} ry={5} fill="#C9CFD6" /></g>)}
    <Knife x={430} y={712} s={0.18} rot={80} ink={ink} />
  </g>
);
export const ChinaRoom: React.FC<{ f?: number }> = ({ f }) => (
  <g>
    <rect x={960} width={960} height={H} fill="#D9CBB0" />
    {/* lattice screen + moon window */}
    <rect x={1010} y={120} width={360} height={560} fill="#8A5A3A" stroke={T.line} strokeWidth={3.5} />
    {Array.from({ length: 7 }).map((_, i) => <line key={`v${i}`} x1={1010 + 45 * (i + 1)} y1={120} x2={1010 + 45 * (i + 1)} y2={680} stroke="#D9C7A6" strokeWidth={6} />)}
    {Array.from({ length: 11 }).map((_, i) => <line key={`h${i}`} x1={1010} y1={120 + 47 * (i + 1)} x2={1370} y2={120 + 47 * (i + 1)} stroke="#D9C7A6" strokeWidth={6} />)}
    <circle cx={1650} cy={330} r={170} fill="#C8D4C8" stroke={T.line} strokeWidth={3.5} />
    <path d="M1520 380 Q1580 300 1640 360 Q1700 280 1780 360" fill="none" stroke="#6E8B6A" strokeWidth={6} />
    <rect x={960} y={820} width={960} height={260} fill="#8E7356" />
    {/* diners + cook */}
    <Figure x={1180} y={900} s={1.08} skin={SKIN[1]} hair="covered" outfit="ming" pose="bowl" {...anim(f, "bowlDown", 46, 0)} />
    <Figure x={1440} y={900} s={1.08} skin={SKIN[2]} hair="bun" outfit="ming" pose="bowl" flip {...anim(f, "bowlDown", 52, 23)} />
    <Figure x={1760} y={930} s={1.0} skin={SKIN[3]} hair="bun" outfit="cook" pose="chop" {...anim(f, "chopUp", 16, 0)} />
    {/* low lacquer table */}
    <rect x={1020} y={720} width={580} height={28} fill="#6E2F25" stroke={T.line} strokeWidth={3.5} />
    <rect x={1050} y={748} width={26} height={110} fill="#5A251D" stroke={T.line} strokeWidth={3} />
    <rect x={1544} y={748} width={26} height={110} fill="#5A251D" stroke={T.line} strokeWidth={3} />
    {[1120, 1260, 1400, 1520].map((x, i) => <path key={i} d={`M${x - 34} 720 Q${x} 690 ${x + 34} 720 Z`} fill={i % 2 ? "#E8E2D2" : "#B8432F"} stroke={T.line} strokeWidth={3} />)}
    {/* cook's counter with chopped food */}
    <rect x={1660} y={760} width={240} height={26} fill="#7A5A3A" stroke={T.line} strokeWidth={3.5} />
    {[1700, 1730, 1760, 1790].map((x, i) => <rect key={i} x={x} y={744} width={18} height={14} fill="#7E9A57" stroke={T.line} strokeWidth={2} />)}
  </g>
);

/** Today room: modern dining table, bright and clean (no tint). Figure `who` eats with a fork. */
export const TodayRoom: React.FC<{ f?: number; x0?: number; w?: number }> = ({ f, x0 = 0, w = 1920 }) => {
  const cx = x0 + w / 2;
  return (
    <g>
      <rect x={x0} width={w} height={H} fill="#F2EDE4" />
      <rect x={x0} y={0} width={w} height={60} fill="#E7E0D3" />
      {/* window with city light */}
      <rect x={cx - 420} y={150} width={360} height={420} fill="#CFE0E6" stroke={T.line} strokeWidth={3.5} />
      <line x1={cx - 240} y1={150} x2={cx - 240} y2={570} stroke={T.line} strokeWidth={3} />
      <rect x={cx + 140} y={200} width={220} height={150} fill="#7C9A57" opacity={0.35} stroke={T.line} strokeWidth={3} />
      {/* pendant lamp */}
      <line x1={cx} y1={60} x2={cx} y2={300} stroke={T.line} strokeWidth={3} />
      <path d={`M${cx - 70} 360 L${cx + 70} 360 L${cx + 40} 300 L${cx - 40} 300 Z`} fill="#E3A72F" stroke={T.line} strokeWidth={3.5} />
      <rect x={x0} y={820} width={w} height={260} fill="#C9B79A" />
      <Figure x={cx - 230} y={900} s={1.08} skin={SKIN[4]} hair="short" outfit="tee" pose="fork" {...anim(f, "forkDown", 54, 0)} />
      <Figure x={cx + 230} y={900} s={1.08} skin={SKIN[1]} hair="long" hairColor="#8A5A2E" outfit="cardigan" pose="fork" flip {...anim(f, "forkDown", 60, 27)} />
      {/* table */}
      <rect x={cx - 520} y={700} width={1040} height={26} fill="#E9DFCF" stroke={T.line} strokeWidth={3.5} />
      <rect x={cx - 490} y={726} width={22} height={130} fill="#B79E7E" stroke={T.line} strokeWidth={3} />
      <rect x={cx + 468} y={726} width={22} height={130} fill="#B79E7E" stroke={T.line} strokeWidth={3} />
      {[-230, 230].map((dx) => <g key={dx} stroke={T.line} strokeWidth={3}><ellipse cx={cx + dx} cy={704} rx={70} ry={12} fill="#FBFAF6" /><ellipse cx={cx + dx} cy={702} rx={34} ry={6} fill="#8B4A2B" /></g>)}
      <g stroke={T.line} strokeWidth={3}><rect x={cx - 14} y={650} width={28} height={52} fill="#CFE0E6" opacity={0.9} /></g>
    </g>
  );
};
