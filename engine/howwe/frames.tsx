// How We Ended Up · "The Gallery" style frames v0.1 for owner approval (GATE).
// Composition "HowFrames", view = gallery | period | map | reveal | people | thumb | board.
// Topic: "Why Half the World Doesn't Use Forks". All facts/dates/costumes are PLACEHOLDERS until researched.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bowl, Chopsticks, Fork, Ink, Knife, Plate } from "./lab";
import {
  DISPLAY, Figure, Gallery, Grain, H, Headline, LabelCard, MONO, Pillar, PlasterHand, Plinth, RoomSign, SKIN, STYLE, Subtitle, T, ThenTint, W, WorldMap, mapHeight, MapCat,
} from "./kit";

export type FrameView = "gallery" | "period" | "map" | "reveal" | "people" | "thumb" | "board";
export type HowFramesProps = { view: FrameView };

const ink: Ink = { line: T.line, lw: 3.5, plate: "#FBFAF6", rim: "#E7E3D8", food1: "#8B4A2B", food2: "#5E7F33", metal: "#D6DBE1", wood: "#9C6233", bowl: "#B8432F", rice: "#FFFDF7" };
const Note: React.FC<{ text: string; light?: boolean }> = ({ text, light }) => (
  <text x={40} y={1062} fontFamily={MONO} fontSize={15} fill={light ? "#F4EEDF" : T.label} opacity={0.6}>{text}</text>
);

/* 1 · Gallery, three plinths (Here vs There vs There) */
const GalleryFrame: React.FC<{ dimmed?: boolean }> = () => (
  <g>
    <Gallery id="g1" bays={[T.clay, T.slate, T.moss]} />
    <Headline tag="THE QUESTION" word="Three ways to eat." accent={T.eat} />
    <Plinth x={320} top={700} w={380} accent={T.clay} />
    <Plinth x={960} top={700} w={380} accent={T.slate} />
    <Plinth x={1600} top={700} w={380} accent={T.moss} />
    <Fork x={320} y={440} s={0.78} ink={ink} />
    <Chopsticks x={960} y={470} s={0.98} rot={8} ink={ink} />
    <PlasterHand x={1600} y={500} s={1.05} />
    <LabelCard x={155} y={770} meta="EXHIBIT 01 · FORK" name="The Fork" sub="Europe & the Americas*" edge={T.clay} />
    <LabelCard x={795} y={770} meta="EXHIBIT 02 · CHOPSTICKS" name="Chopsticks" sub="East Asia*" edge={T.slate} />
    <LabelCard x={1435} y={770} meta="EXHIBIT 03 · HANDS" name="The Hand" sub="S. Asia, Middle East, Africa*" edge={T.moss} />
    <Subtitle text="Most people on Earth eat without a fork." source="[1] source to be added after fact-check" />
    <Grain seed={1} />
    <Note text="style frame v0.1 · * placeholder text, not fact-checked" />
  </g>
);

/* 2 · Period-room split: Europe c.1500 | China c.1500 (Then tint) */
const EuropeRoom: React.FC = () => (
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
    <Figure x={230} y={900} s={1.08} skin={SKIN[1]} hair="covered" outfit="euMan" pose="knife" />
    <Figure x={480} y={900} s={1.08} skin={SKIN[0]} hair="covered" outfit="euWoman" pose="eatHand" />
    <Figure x={730} y={900} s={1.08} skin={SKIN[2]} hair="short" hairColor="#5A3A22" outfit="euMan" pose="eatHand" />
    {/* table with cloth */}
    <rect x={60} y={700} width={840} height={30} fill="#F3EEE2" stroke={T.line} strokeWidth={3.5} />
    <path d="M60 730 L900 730 L900 860 L60 860 Z" fill="#EEE7D8" stroke={T.line} strokeWidth={3.5} />
    {[150, 350, 560, 780].map((x, i) => <ellipse key={i} cx={x} cy={712} rx={42} ry={10} fill="#C99A5B" stroke={T.line} strokeWidth={3} />)}
    {[250, 670].map((x, i) => <g key={i} stroke={T.line} strokeWidth={3}><rect x={x - 14} y={666} width={28} height={40} fill="#A9AEB4" /><ellipse cx={x} cy={666} rx={14} ry={5} fill="#C9CFD6" /></g>)}
    <Knife x={430} y={712} s={0.18} rot={80} ink={ink} />
  </g>
);
const ChinaRoom: React.FC = () => (
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
    <Figure x={1180} y={900} s={1.08} skin={SKIN[1]} hair="covered" outfit="ming" pose="bowl" />
    <Figure x={1440} y={900} s={1.08} skin={SKIN[2]} hair="bun" outfit="ming" pose="bowl" flip />
    <Figure x={1760} y={930} s={1.0} skin={SKIN[3]} hair="bun" outfit="cook" pose="chop" />
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
const PeriodFrame: React.FC = () => (
  <g>
    <ThenTint id="pe" x={0} w={960}><EuropeRoom /></ThenTint>
    <ThenTint id="pc" x={960} w={960}><ChinaRoom /></ThenTint>
    <Pillar x={960} floorY={1080} />
    <RoomSign x={480} y={40} text="PERIOD ROOM · EUROPE · c. 1500*" />
    <RoomSign x={1440} y={40} text="PERIOD ROOM · CHINA · c. 1500*" />
    <Subtitle text="Same century. Two very different tables." />
    <Grain seed={2} />
    <Note text="style frame v0.1 · Then tint · * costumes, rooms, dates are placeholders until researched" />
  </g>
);


/** PLACEHOLDER eating-culture data for the map style frame. NOT researched: will be replaced by sourced data in the video 1 script. */
const grp = (codes: string, c: MapCat) => Object.fromEntries(codes.split(" ").map((k) => [k, c]));
const EATING_PLACEHOLDER: Record<string, MapCat> = {
  ...grp("USA CAN MEX GTM BLZ HND SLV NIC CRI PAN CUB DOM HTI JAM PRI BHS TTO COL VEN GUY SUR ECU PER BOL BRA PRY URY ARG CHL FLK GRL", "a"),
  ...grp("ISL NOR SWE FIN DNK GBR IRL NLD BEL LUX FRA DEU CHE AUT ITA ESP PRT POL CZE SVK HUN SVN HRV BIH SRB MNE KOS ALB MKD GRC BGR ROU MDA UKR BLR LTU LVA EST RUS CYP CYN TUR ISR GEO ARM AZE AUS NZL", "a"),
  ...grp("CHN TWN JPN KOR PRK VNM", "b"),
  ...grp("IND PAK BGD NPL LKA BTN AFG IRN IRQ SYR JOR LBN PSX SAU YEM OMN ARE QAT KWT", "c"),
  ...grp("MAR DZA TUN LBY EGY SAH MRT MLI NER TCD SDN SDS ERI DJI ETH SOM SOL KEN UGA RWA BDI TZA COD COG GAB GNQ CMR CAF NGA BEN TGO GHA CIV LBR SLE GIN GNB GMB SEN BFA AGO ZMB MWI MOZ ZWE BWA NAM ZAF LSO SWZ MDG", "c"),
  ...grp("THA LAO KHM MMR MYS IDN PHL BRN TLS MNG KAZ UZB TKM KGZ TJK PNG", "mix"),
};

/* 3 · Map room: framed wall map */
const MapFrame: React.FC = () => {
  const mw = 1240, mh = mapHeight(mw);
  const fx = (W - mw) / 2, fy = 240;
  return (
    <g>
      <Gallery id="g3" bays={[T.wall]} floorY={1000} />
      <text x={W / 2} y={120} textAnchor="middle" fontFamily={MONO} fontWeight={600} fontSize={24} letterSpacing={8} fill={T.label}>THE MAP</text>
      <text x={W / 2} y={178} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={56} fill={T.ink}>Three eating cultures</text>
      {/* frame + mount */}
      <rect x={fx - 54} y={fy - 34} width={mw + 108} height={mh + 68} fill="#000" opacity={0.1} transform="translate(10 12)" />
      <rect x={fx - 54} y={fy - 34} width={mw + 108} height={mh + 68} fill="#3A3A40" />
      <rect x={fx - 32} y={fy - 14} width={mw + 64} height={mh + 28} fill="#FBF8F2" />
      <WorldMap id="m3" x={fx} y={fy} w={mw} cats={EATING_PLACEHOLDER} />
      {/* legend card */}
      <g transform={`translate(${W / 2 - 520} ${fy + mh + 70})`}>
        <rect x={3} y={5} width={1040} height={86} fill="#000" opacity={0.08} />
        <rect width={1040} height={86} fill={T.card} />
        {[["FORK", T.clay], ["CHOPSTICKS", T.slate], ["HANDS", T.moss], ["MIXED", "mix"]].map(([t, c], i) => (
          <g key={t} transform={`translate(${40 + i * 250} 26)`}>
            {c === "mix" ? <g><rect width={36} height={36} fill={T.moss} /><path d="M0 36 L36 0 L36 18 L18 36 Z M0 18 L18 0 L0 0 Z" fill={T.clay} /></g> : <rect width={36} height={36} fill={c} />}
            <text x={52} y={28} fontFamily={MONO} fontWeight={600} fontSize={22} letterSpacing={3} fill={T.ink}>{t}</text>
          </g>
        ))}
      </g>
      <Grain seed={3} />
      <Note text="map: Natural Earth (public domain), Equal Earth projection · eating-culture colours are PLACEHOLDER data, not yet researched" />
    </g>
  );
};

/* 4 · Reveal: lights down, one spotlight */
const RevealFrame: React.FC = () => (
  <g>
    <defs>
      <mask id="rvMask">
        <rect width={W} height={H} fill="#fff" />
        <polygon points={`${960 - 90},0 ${960 + 90},0 ${960 + 300},${H} ${960 - 300},${H}`} fill="#000" />
      </mask>
      <radialGradient id="rvSpot" cx="50%" cy="0%" r="100%"><stop offset="0" stopColor={T.spot} stopOpacity={0.5} /><stop offset="1" stopColor={T.spot} stopOpacity={0} /></radialGradient>
    </defs>
    <Gallery id="g4" bays={[T.clay, T.slate, T.moss]} />
    <Plinth x={320} top={700} w={380} accent={T.clay} />
    <Plinth x={960} top={700} w={380} accent={T.slate} />
    <Plinth x={1600} top={700} w={380} accent={T.moss} />
    <Fork x={320} y={440} s={0.78} ink={ink} />
    <PlasterHand x={1600} y={500} s={1.05} />
    {/* centre exhibit: the answer card on an easel */}
    <g stroke={T.line} strokeWidth={3.5}>
      <line x1={900} y1={700} x2={930} y2={420} /><line x1={1020} y1={700} x2={990} y2={420} />
      <rect x={850} y={380} width={220} height={290} fill={T.card} />
    </g>
    <text x={960} y={590} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={200} fill={T.ink}>?</text>
    <rect width={W} height={H} fill={T.dark} opacity={STYLE.reveal.darkOpacity} mask="url(#rvMask)" />
    <polygon points={`${960 - 90},0 ${960 + 90},0 ${960 + 300},${H} ${960 - 300},${H}`} fill="url(#rvSpot)" />
    <text x={W / 2} y={110} textAnchor="middle" fontFamily={MONO} fontWeight={600} fontSize={24} letterSpacing={8} fill={T.eat}>THE ANSWER</text>
    <text x={W / 2} y={250} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={96} fill="#F4EEDF" stroke={T.dark} strokeWidth={6} paintOrder="stroke">It wasn't taste.</text>
    <Grain seed={4} o={0.6} />
    <Note text="style frame v0.1 · the once-per-video spotlight reveal · placeholder line" light />
  </g>
);

/* 5 · People line-up: diorama figures + skin range */
const PeopleFrame: React.FC = () => {
  const cast: { o: React.ComponentProps<typeof Figure>; label: string; era: string }[] = [
    { o: { x: 0, y: 0, skin: SKIN[4], hair: "short", outfit: "tee" }, label: "Today", era: "modern" },
    { o: { x: 0, y: 0, skin: SKIN[0], hair: "long", hairColor: "#8A5A2E", outfit: "cardigan", pose: "greet" }, label: "Today", era: "modern" },
    { o: { x: 0, y: 0, skin: SKIN[1], hair: "covered", outfit: "euMan" }, label: "Europe", era: "c. 1500*" },
    { o: { x: 0, y: 0, skin: SKIN[0], hair: "covered", outfit: "euWoman" }, label: "Europe", era: "c. 1500*" },
    { o: { x: 0, y: 0, skin: SKIN[2], hair: "covered", outfit: "ming" }, label: "China", era: "c. 1500*" },
    { o: { x: 0, y: 0, skin: SKIN[5], hair: "bun", outfit: "saree" }, label: "South Asia", era: "c. 1900*" },
  ];
  return (
    <g>
      <Gallery id="g5" bays={[T.wall]} floorY={860} />
      <text x={W / 2} y={120} textAnchor="middle" fontFamily={MONO} fontWeight={600} fontSize={24} letterSpacing={8} fill={T.label}>DIORAMA FIGURES</text>
      <text x={W / 2} y={178} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={56} fill={T.ink}>Posture tells the story. No faces.</text>
      <rect x={120} y={760} width={1680} height={40} fill={T.plinth} stroke="#D8CDB9" strokeWidth={2} />
      {cast.map((c, i) => {
        const x = 260 + i * 280;
        return (
          <g key={i}>
            <Figure {...c.o} x={x} y={770} s={1.32} />
            <text x={x} y={850} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={30} fill={T.ink}>{c.label}</text>
            <text x={x} y={882} textAnchor="middle" fontFamily={MONO} fontSize={18} fill={T.label}>{c.era}</text>
          </g>
        );
      })}
      {/* skin range */}
      <g transform="translate(560 940)">
        <text x={0} y={-12} fontFamily={MONO} fontSize={16} letterSpacing={2} fill={T.label}>SKIN RANGE (never codes a culture)</text>
        {SKIN.map((c, i) => <rect key={c} x={i * 100} y={0} width={90} height={36} fill={c} stroke={T.line} strokeWidth={2} />)}
      </g>
      <Grain seed={5} />
      <Note text="style frame v0.1 · * costumes are placeholders: each will be redrawn from museum references before use" />
    </g>
  );
};

/* 6 · Thumbnail */
const ThumbFrame: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="thV" cx="50%" cy="50%" r="72%"><stop offset="60%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#3a2a10" stopOpacity={0.28} /></radialGradient>
    </defs>
    <Gallery id="g6" bays={[T.clay, T.slate]} floorY={880} />
    <Plinth x={480} top={900} w={560} base={1060} accent={T.clay} />
    <Plinth x={1440} top={900} w={560} base={1060} accent={T.slate} />
    <Fork x={480} y={430} s={1.7} rot={-6} ink={{ ...ink, lw: 6 }} />
    <Chopsticks x={1440} y={650} s={1.6} rot={10} ink={{ ...ink, lw: 6 }} />
    <text x={W / 2} y={230} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={190} fill={T.ink}>NO FORKS?</text>
    <rect width={W} height={H} fill="url(#thV)" />
    <rect y={H - 22} width={W} height={22} fill={T.eat} />
    <Grain seed={6} />
  </g>
);

/* board: all six at a glance */
const views: { v: Exclude<FrameView, "board">; name: string; C: React.FC }[] = [
  { v: "gallery", name: "1 · Gallery (3 plinths)", C: GalleryFrame },
  { v: "period", name: "2 · Period rooms (Then tint)", C: PeriodFrame },
  { v: "map", name: "3 · Map room", C: MapFrame },
  { v: "reveal", name: "4 · Spotlight reveal", C: RevealFrame },
  { v: "people", name: "5 · Diorama figures", C: PeopleFrame },
  { v: "thumb", name: "6 · Thumbnail", C: ThumbFrame },
];
const Board: React.FC = () => {
  const cw = 600, ch = cw * (H / W), gx = 30, x0 = (W - (cw * 3 + gx * 2)) / 2;
  return (
    <g>
      <rect width={W} height={H} fill="#ECECEC" />
      <text x={x0} y={66} fontFamily={DISPLAY} fontWeight={900} fontSize={40} fill="#222">How We Ended Up · "The Gallery" style frames v0.1</text>
      {views.map(({ name, C }, i) => {
        const x = x0 + (i % 3) * (cw + gx), y = 120 + Math.floor(i / 3) * (ch + 110);
        return (
          <g key={name}>
            <text x={x} y={y - 12} fontFamily={MONO} fontWeight={600} fontSize={22} fill="#333">{name}</text>
            <svg x={x} y={y} width={cw} height={ch} viewBox={`0 0 ${W} ${H}`}><C /></svg>
          </g>
        );
      })}
      {/* feed-size thumbnail check */}
      <g transform={`translate(${x0} ${120 + 2 * (ch + 110) - 50})`}>
        <svg x={0} y={0} width={246} height={138} viewBox={`0 0 ${W} ${H}`}><ThumbFrame /></svg>
        <text x={262} y={30} fontFamily={MONO} fontWeight={600} fontSize={19} fill="#111">Why Half the World Doesn't Use Forks</text>
        <text x={262} y={58} fontFamily={MONO} fontSize={16} fill="#666">How We Ended Up · feed-size check</text>
      </g>
    </g>
  );
};

export const HowFrames: React.FC<HowFramesProps> = ({ view }) => {
  const one = views.find((x) => x.v === view);
  return (
    <AbsoluteFill style={{ background: T.wall }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {view === "board" || !one ? <Board /> : <one.C />}
      </svg>
    </AbsoluteFill>
  );
};
