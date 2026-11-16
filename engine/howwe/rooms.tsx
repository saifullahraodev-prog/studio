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
/* Floor-seated rooms: figures stand lower (feet below frame) so only the torso shows above a low table.
   PLACEHOLDER costumes and rooms: redraw from documented references before publishing. */
const SEAT = 990;

/** Japan: shoji screens, tokonoma alcove, tatami, low table. Side altar shows rice with chopsticks upright (offering). */
export const JapanRoom: React.FC<{ f?: number }> = ({ f }) => (
  <g>
    <rect width={960} height={H} fill="#E8DFC9" />
    {[0, 1, 2].map((k) => (
      <g key={k}>
        <rect x={40 + k * 200} y={120} width={180} height={520} fill="#F4EFE2" stroke="#6B4F35" strokeWidth={8} />
        {Array.from({ length: 4 }).map((_, i) => <line key={`v${i}`} x1={40 + k * 200 + 36 * (i + 1)} y1={120} x2={40 + k * 200 + 36 * (i + 1)} y2={640} stroke="#8A6D4E" strokeWidth={3} />)}
        {Array.from({ length: 6 }).map((_, i) => <line key={`h${i}`} x1={40 + k * 200} y1={120 + 74 * (i + 1)} x2={220 + k * 200} y2={120 + 74 * (i + 1)} stroke="#8A6D4E" strokeWidth={3} />)}
      </g>
    ))}
    <rect x={660} y={120} width={260} height={520} fill="#D9CBA8" stroke="#6B4F35" strokeWidth={8} />
    <rect x={740} y={170} width={100} height={300} fill="#F4EFE2" stroke={T.line} strokeWidth={3} />
    <path d="M760 220 Q790 300 770 400" fill="none" stroke="#3A3A40" strokeWidth={6} />
    {/* tatami */}
    <rect y={760} width={960} height={320} fill="#C9C38E" />
    {[0, 320, 640].map((x) => <rect key={x} x={x} y={760} width={320} height={320} fill="none" stroke="#5E5A3A" strokeWidth={6} />)}
    {/* offering altar: rice with chopsticks standing upright */}
    <rect x={720} y={690} width={180} height={70} fill="#6B4F35" stroke={T.line} strokeWidth={3.5} />
    <path d="M770 690 Q810 650 850 690 Z" fill="#FFFDF7" stroke={T.line} strokeWidth={3} />
    <line x1={800} y1={600} x2={804} y2={680} stroke="#9C6233" strokeWidth={6} />
    <line x1={816} y1={600} x2={812} y2={680} stroke="#9C6233" strokeWidth={6} />
    <Figure x={200} y={SEAT} s={1.08} skin={SKIN[1]} hair="bun" outfit="kimono" pose="bowl" {...anim(f, "bowlDown", 48, 0)} />
    <Figure x={460} y={SEAT} s={1.08} skin={SKIN[2]} hair="short" outfit="kimono" pose="bowl" flip {...anim(f, "bowlDown", 54, 20)} />
    <rect y={836} width={960} height={244} fill="#C9C38E" />
    {[0, 320, 640].map((x) => <rect key={x} x={x} y={836} width={320} height={244} fill="none" stroke="#5E5A3A" strokeWidth={6} />)}
    <rect x={90} y={800} width={500} height={40} fill="#7A4A2E" stroke={T.line} strokeWidth={3.5} />
    {[180, 330, 480].map((x) => <path key={x} d={`M${x - 30} 800 Q${x} 772 ${x + 30} 800 Z`} fill="#B8432F" stroke={T.line} strokeWidth={3} />)}
  </g>
);

/** Ethiopia: warm plaster wall, woven mesob basket-table with injera; gursha (feeding) between diners. */
export const EthiopiaRoom: React.FC<{ f?: number }> = ({ f }) => (
  <g>
    <rect width={960} height={H} fill="#E3C9A0" />
    <rect y={300} width={960} height={40} fill="#B8432F" opacity={0.6} />
    {Array.from({ length: 16 }).map((_, i) => <path key={i} d={`M${i * 60} 300 L${i * 60 + 30} 340 L${i * 60 + 60} 300`} fill="none" stroke="#3F7A5A" strokeWidth={5} />)}
    <rect x={620} y={110} width={200} height={170} fill="#B7C9CC" stroke={T.line} strokeWidth={3.5} />
    <rect y={800} width={960} height={280} fill="#A9805A" />
    <Figure x={250} y={SEAT} s={1.1} skin={SKIN[5]} hair="covered" outfit="habesha" pose="feed" {...anim(f, "feedBack", 70, 0)} />
    <Figure x={680} y={SEAT} s={1.1} skin={SKIN[6]} hair="short" outfit="habesha" pose="eatHand" flip {...anim(f, "handDown", 60, 25)} />
    <rect y={830} width={960} height={250} fill="#A9805A" />
    {/* mesob: woven hourglass basket table */}
    <path d="M330 790 L590 790 L540 880 L590 990 L330 990 L380 880 Z" fill="#C9862F" stroke={T.line} strokeWidth={3.5} />
    {[810, 840, 920, 960].map((y) => <line key={y} x1={350} y1={y} x2={570} y2={y} stroke="#7A4A2E" strokeWidth={4} />)}
    <ellipse cx={460} cy={782} rx={170} ry={30} fill="#D9B48A" stroke={T.line} strokeWidth={3.5} />
    {[[400, 776], [470, 772], [520, 786]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={26} ry={9} fill={["#8B4A2B", "#B8432F", "#7E9A57"][i]} />)}
  </g>
);

/** India: arched niche, floor seating, round steel thali plates; right-hand eating. */
export const IndiaRoom: React.FC<{ f?: number }> = ({ f }) => (
  <g>
    <rect width={960} height={H} fill="#E9D6B8" />
    <path d="M120 640 L120 300 Q260 140 400 300 L400 640 Z" fill="#D9BE95" stroke={T.line} strokeWidth={3.5} />
    <path d="M560 640 L560 300 Q700 140 840 300 L840 640 Z" fill="#D9BE95" stroke={T.line} strokeWidth={3.5} />
    <circle cx={260} cy={360} r={30} fill="#C9862F" />
    <rect y={780} width={960} height={300} fill="#B9936A" />
    <Figure x={260} y={SEAT} s={1.1} skin={SKIN[4]} hair="short" outfit="kurta" pose="eatHand" {...anim(f, "handDown", 58, 0)} />
    <Figure x={700} y={SEAT} s={1.1} skin={SKIN[5]} hair="bun" outfit="saree" pose="eatHand" flip {...anim(f, "handDown", 64, 30)} />
    <rect y={830} width={960} height={250} fill="#B9936A" />
    {[260, 700].map((x) => (
      <g key={x} stroke={T.line} strokeWidth={3}>
        <ellipse cx={x} cy={850} rx={140} ry={30} fill="#C9CFD6" />
        {[-60, -20, 20, 60].map((d, i) => <ellipse key={i} cx={x + d} cy={846} rx={16} ry={7} fill={["#E3A72F", "#7E9A57", "#B8432F", "#FFFDF7"][i]} />)}
      </g>
    ))}
  </g>
);

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
