// The Ship Guy puppet: test lab. Each demo is a short acted moment (frame-driven).
// GuyLab {demo}            -> the moment as video frames (1920x1080)
// GuyLab {demo, sheet:true} -> 6 moments of it on one image (3x2 contact sheet, for review without rendering)
// GuyLab {demo:"model"}    -> owner's original images (top) vs the puppet (bottom)
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { INK } from "./art";
import { Dust, Emote, FACES, Face, Guy, GuyProps, Hand, IDLE, POSES, Pose, PropName, SpeedLines, breathe, chatter, mixPose, pick, smooth, track, walk } from "./guy";
import { fontFamily } from "./scenes";

const PAPER = "#f3f1ea";
const GROUND = 930;
const clamp01 = (k: number) => Math.max(0, Math.min(1, k));
const k01 = (t: number, a: number, b: number) => smooth(clamp01((t - a) / (b - a)));

type Frame = { guy: GuyProps; back?: React.ReactNode; front?: React.ReactNode };
type Demo = { len: number; title: string; draw: (t: number) => Frame };

const Label: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; o?: number; s?: number }> = ({ x, y, text, size = 120, color = "#ffd23f", o = 1, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <text x={0} y={0} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={size} fill={color} stroke={INK} strokeWidth={size * 0.13} paintOrder="stroke" strokeLinejoin="round">{text}</text>
  </g>
);

// big green Evergreen-style hull, seen from the side, bow pointing left
const Hull: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: 9 }).map((_, i) => (
      <rect key={i} x={140 + i * 120} y={-560 - (i % 3) * 20} width={110} height={180 + (i % 3) * 20} fill={["#c94a3a", "#3a73b8", "#e0a23b", "#4f8a5b"][i % 4]} stroke={INK} strokeWidth={6} />
    ))}
    <path d="M0 -380 L 1300 -380 L 1300 0 L 120 0 Q 30 -120 0 -380 Z" fill="#2f7d4a" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M10 -330 L 1300 -330" stroke="#256a3d" strokeWidth={10} />
    <text x={420} y={-170} fontFamily={fontFamily} fontWeight={700} fontSize={90} fill="#f4f4ee" letterSpacing={6}>EVERGREEN</text>
  </g>
);

const Sand: React.FC<{ y: number }> = ({ y }) => (
  <path d={`M0 ${y} Q 480 ${y - 26} 960 ${y} T 1920 ${y} V 1080 H 0 Z`} fill="#e8d6a6" stroke={INK} strokeWidth={6} />
);

const DEMOS: Record<string, Demo> = {
  // 1. walk in, stop with a settle, wave, talk to camera
  hello: {
    len: 150, title: "Walk in, stop, wave, talk",
    draw: (t) => {
      const kx = k01(t, 0, 46);
      const x = 260 + kx * 700;
      const walking = t < 46;
      let pose: Pose = walking ? walk(IDLE, t, 1.1) : track(t, [[0, IDLE], [46, IDLE, 6], [60, POSES.hipWave, 10], [110, POSES.point, 10]]);
      let handR: Hand = "mitt";
      if (t >= 60 && t < 110) { pose = { ...pose, armR: [150, -20 + Math.sin(t * 0.5) * 26] }; handR = "open"; }
      if (!walking) pose = breathe(pose, t);
      const talk = t > 64 ? chatter(t) : 0;
      return {
        guy: { x, y: GROUND, t, pose, face: t > 60 ? FACES.happy : FACES.talk, talk, handR, feet: walking ? "fwd" : "out" },
      };
    },
  },
  // 2. calm with coffee -> "!" -> anticipation crouch -> jump, hat pops off, mug flies -> land with squash + dust
  shock: {
    len: 130, title: "Surprise jump: hat + coffee fly",
    draw: (t) => {
      const pose = track(t, [
        [0, POSES.hold], [22, mixPose(POSES.crouch, POSES.hold, 0.3), 6], [30, { ...POSES.handsHead, hipY: 150, squash: -0.1 }, 6],
        [44, { ...POSES.handsHead, hipY: 0, squash: 0.12 }, 4], [50, POSES.handsHead, 8],
      ]);
      const air = t >= 30 && t < 46;
      const face: Face = t < 18 ? FACES.talk : t < 26 ? FACES.amazed : FACES.shocked;
      const emote: Emote | undefined = t >= 16 && t < 32 ? "!" : t >= 50 ? "sweat" : undefined;
      // hat: rockets up at take-off, spins, falls back onto the head at ~62
      const hk = clamp01((t - 30) / 34);
      const hat = t < 30 || hk >= 1 ? undefined : { dx: hk * 30, dy: -Math.sin(hk * Math.PI) * 300, rot: Math.sin(hk * Math.PI) * 40 };
      // mug: flies out of the hand and splashes
      const mk = clamp01((t - 25) / 30);
      const mug = t >= 25 && (
        <g transform={`translate(${1160 + mk * 260} ${GROUND - 200 - Math.sin(mk * Math.PI) * 300 + mk * 170}) rotate(${mk * 420})`}>
          <rect x={-24} y={-28} width={48} height={56} rx={8} fill="#3d78c4" stroke={INK} strokeWidth={6} />
          {mk > 0.1 && mk < 1 && <path d="M-10 -28 q -20 -40 6 -70" stroke="#7b4a26" strokeWidth={10} fill="none" strokeLinecap="round" />}
        </g>
      );
      return {
        guy: { x: 960, y: GROUND, t, pose: air ? pose : breathe(pose, t), face, prop: t < 25 ? "mug" as PropName : "none",
          handL: t >= 30 ? "open" : "mitt", handR: t >= 30 ? "open" : "mitt", hat, emote, emoteT: t >= 50 ? t - 50 : t - 16, feet: "out" },
        front: <>{mug}{t >= 44 && <Dust x={960} y={GROUND} k={(t - 44) / 20} />}</>,
      };
    },
  },
  // 3. present a number: it pops in, he points, it bounces, he turns to camera confident
  point: {
    len: 120, title: "Point at a number that pops in",
    draw: (t) => {
      const pose = breathe(track(t, [[0, IDLE], [14, POSES.point, 10], [80, POSES.hipWave, 10]]), t);
      const nk = k01(t, 18, 30);
      const bounce = 1 + Math.sin(clamp01((t - 30) / 14) * Math.PI) * 0.08;
      return {
        guy: { x: 1480, y: GROUND, t, pose: { ...pose, armR: pose.armR }, flip: t < 80, face: t < 80 ? { ...FACES.happy, lookX: -0.8 } : FACES.confident,
          talk: t > 20 && t < 76 ? chatter(t) : 0, handR: t >= 14 && t < 80 ? "point" : "mitt" },
        back: <Label x={640} y={480} text="$9.6 BILLION" size={170} s={nk * bounce} o={nk} />,
        front: <Label x={640} y={590} text="every single day" size={70} color="#fff" o={k01(t, 34, 44)} />,
      };
    },
  },
  // 4. thinking -> "?" -> idea bulb + finger up
  think: {
    len: 120, title: "Think, then get an idea",
    draw: (t) => {
      const pose = breathe(track(t, [[0, IDLE], [8, POSES.chin, 12], [64, { ...POSES.fingerUp, hipY: 30 }, 6], [74, POSES.fingerUp, 8]]), t);
      const idea = t >= 64;
      return {
        guy: { x: 960, y: GROUND, t, pose, face: idea ? FACES.happy : FACES.thinking, handR: idea ? "point" : "mitt",
          emote: idea ? "idea" : t > 16 ? "?" : undefined, emoteT: idea ? t - 64 : t - 16, talk: t > 78 ? chatter(t) : 0 },
      };
    },
  },
  // 5. pushes the stuck ship with everything he has: strain, steam, sliding feet, dust; ship doesn't move
  push: {
    len: 120, title: "Push the stuck ship (it won't move)",
    draw: (t) => {
      const strain = Math.sin(t * 0.9) * 4;
      const slide = (t * 0.6) % 24;
      const base: Pose = { ...IDLE, lean: -34, hipX: 0, armL: [-78, 8], armR: [84, -10], legL: [-40 - slide * 0.3, 10], legR: [-12, 20], tilt: -4 };
      const pose: Pose = { ...base, lean: base.lean + strain * 0.4, hipY: Math.abs(strain) };
      return {
        guy: { x: 330 + slide * 0.3, y: GROUND, t, pose, face: { eyes: "closed", brows: "angry", mouth: "teeth" }, blink: true, flip: false,
          handL: "open", handR: "open", emote: t > 30 ? "steam" : "sweat", emoteT: t, feet: "fwd" },
        back: <><Sand y={GROUND} /><Hull x={600} y={GROUND + 20} s={0.95} /></>,
        front: <Dust x={260 + slide * 0.3} y={GROUND} k={(t % 18) / 18} spread={0.6} />,
      };
    },
  },
  // 6. digs next to the giant bow: dig cycle, sand flies, sweat
  dig: {
    len: 120, title: "Dig the sand by hand (tiny vs giant)",
    draw: (t) => {
      const c = (t % 30) / 30; // one shovel per second
      const down = Math.sin(c * Math.PI * 2);
      const pose: Pose = { ...IDLE, lean: 18 + down * 12, hipY: -18 + down * 10, armR: [40 + down * 30, 60], armL: [50 + down * 30, 30], legL: [-24, 30], legR: [22, -20], tilt: 6 };
      const sand = c > 0.45 && c < 0.95 && (
        <g>{[0, 1, 2, 3, 4].map((i) => {
          const k = (c - 0.45) / 0.5;
          return <circle key={i} cx={620 - k * (120 + i * 30)} cy={GROUND - 80 - Math.sin(k * Math.PI) * (90 + i * 16) + k * 70} r={10 + (i % 2) * 6} fill="#d9c08a" stroke={INK} strokeWidth={3} />;
        })}</g>
      );
      return {
        guy: { x: 560, y: GROUND, s: 0.62, t, pose, face: { eyes: "dot", brows: "worried", mouth: "wavy" }, prop: "spade", emote: "sweat", emoteT: t, flip: false, feet: "out" },
        back: <><Sand y={GROUND} /><Hull x={700} y={GROUND + 160} s={2.3} /></>,
        front: sand || undefined,
      };
    },
  },
};

const Scene: React.FC<{ demo: string; t: number }> = ({ demo, t }) => {
  const d = DEMOS[demo];
  const f = d.draw(t);
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <line x1={0} y1={GROUND + 4} x2={1920} y2={GROUND + 4} stroke="#ddd8cb" strokeWidth={4} />
        {f.back}
        <Guy {...f.guy} id={`g-${demo}`} />
        {f.front}
      </svg>
    </AbsoluteFill>
  );
};

const Model: React.FC = () => {
  const orig = ["explain", "confident", "shocked", "thinking"];
  const mine: { pose: Pose; face: Face; handR?: Hand; handL?: Hand; flip?: boolean }[] = [
    { pose: POSES.point, face: FACES.happy, flip: true },
    { pose: POSES.hipWave, face: FACES.confident, handR: "open" },
    { pose: POSES.handsHead, face: FACES.shocked, handL: "open", handR: "open" },
    { pose: POSES.chin, face: FACES.thinking },
  ];
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {orig.map((o, i) => (
        <Img key={o} src={staticFile(`shipguy/stickmen/${o}.png`)} style={{ position: "absolute", left: 20 + i * 475, top: 10, height: 500 }} />
      ))}
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute" }}>
        {mine.map((m, i) => <Guy key={i} id={`m${i}`} x={250 + i * 475} y={1050} s={0.78} t={5} {...m} />)}
        <text x={20} y={540} fontFamily={fontFamily} fontWeight={700} fontSize={34} fill="#8a8578">your images ▲ / puppet ▼</text>
      </svg>
    </AbsoluteFill>
  );
};

export const GUY_DEMOS = Object.keys(DEMOS);
export type GuyLabProps = { demo: string; sheet?: boolean };

export const GuyLab: React.FC<GuyLabProps & { frame?: number }> = ({ demo, sheet }) => {
  if (demo === "model") return <Model />;
  const d = DEMOS[demo];
  if (!d) return <AbsoluteFill style={{ background: "#c33", color: "#fff", fontSize: 60 }}>unknown demo {demo}</AbsoluteFill>;
  if (!sheet) return <LabFrame demo={demo} />;
  const frames = [0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84, 0.97].map((k) => Math.round(k * (d.len - 1)));
  return (
    <AbsoluteFill style={{ background: "#222" }}>
      {frames.map((f, i) => (
        <div key={i} style={{ position: "absolute", left: (i % 3) * 640, top: Math.floor(i / 3) * 360, width: 1920, height: 1080, transform: "scale(0.3333)", transformOrigin: "0 0", outline: "6px solid #222" }}>
          <Scene demo={demo} t={f} />
          <div style={{ position: "absolute", left: 30, top: 30, background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: 70, padding: "4px 24px", borderRadius: 14, fontFamily }}>{(f / 30).toFixed(1)}s</div>
        </div>
      ))}
      <div style={{ position: "absolute", right: 16, bottom: 12, color: "#fff", background: "rgba(0,0,0,0.7)", borderRadius: 10, fontSize: 34, fontFamily, padding: "4px 16px" }}>{d.title}</div>
    </AbsoluteFill>
  );
};

const LabFrame: React.FC<{ demo: string }> = ({ demo }) => {
  const t = useCurrentFrame();
  return <Scene demo={demo} t={t} />;
};
export const guyLabLength = (demo: string) => DEMOS[demo]?.len ?? 1;
