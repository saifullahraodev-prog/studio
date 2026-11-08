# studio: locked decisions (read first, every session)

You are the technical director and lead developer. The owner is not a programmer:
explain in plain language, show results as still images/contact sheets, keep
`PROGRESS.md` current, work in phases and STOP at every GATE for approval.
Ask before installing anything large, deleting files, or spending money.

## Channel
- Niche: **"Rules written in disaster"**: each video tells a famous disaster as the story of the
  safety rule / building code / insurance practice it created.
  Side series: **"Infrastructure X-ray"** (3D cutaways: ports, grids, dams) and **"City engineering"**.
- Audience: English-speaking adults 18–45 (US, UK, Canada).
- Format: second-person POV ("It's 1912. You are a stoker…"). Every video ends:
  **"…and that's why, today, ___."**
- Recurring narrator: **The Inspector** (safety inspector with clipboard) opens and closes every video.
- Every script: facts checked against reliable sources, sources listed in `script.md`.

## Visual style: Direction F, "Drawn face, 3D world"
- Bodies: chunky chibi 3D, ~2.5 heads tall, soft toon shading, **no outlines on 3D geometry**,
  oversized role-defining headgear, simple white cartoon gloves.
- Faces: **not modelled**. Flat drawn panel on the head: off-white rounded-square "paper" face,
  charcoal ink lines, faint paper grain. Expressions + mouth shapes = sprite swaps.
  Must be our own design: **do not copy the Circle Toons white round face**.
- World: softly realistic, strong depth of field. Far background = painted/AI backdrop image;
  near/mid ground = real 3D.
- Captions: small sentence subtitle near top + one huge keyword per beat in centre
  (bold rounded Google font, white with dark outline). Stay inside Shorts safe areas.
- Lighting presets per world: calm day, golden hour, storm, night.
- Look values live in ONE versioned file `engine/look/style-v0.x.json`; never change inside a video.

## Tech
- Node LTS + Remotion 4 + @remotion/three + react-three-fiber + three.js, TypeScript.
- Python 3 + FFmpeg (audio, mixing, joining, QC). faster-whisper for word timings.
- Characters from CC0 rigged models (Quaternius, Kenney), restyled. Hand-build only missing animations.
- Remotion licence: free for individuals / teams up to 3.
- Remotion agent skills are installed in `.agents/skills` (linked in `.claude/skills`): follow them.
  Key 3D rules: wrap 3D in `<ThreeCanvas width height>`; **never use `useFrame()`**; animate only from
  `useCurrentFrame()`; `<Sequence layout="none">` inside ThreeCanvas.

## Engine conventions
- Lay out 2D overlays in **design pixels for 1080x1920** and convert with `useUnit()` (`src/ui/units.ts`).
- Vertical compositions take `res` prop: 720 (preview, default) or 1080 (final).
  Pass via file: `--props=engine/presets/res-1080.json` (inline JSON breaks on Windows).
- ~80% of shots from templates (data only), ~20% hand-crafted hero shots (hook, climax, ending).
- New characters only via the character bible; new places only from the world kit.
- Keep 10–20 golden frames in `golden/`; check every engine change against them.

## Hardware & rendering (measured Phase 1, 2026-11-08)
- Actual PC: i5-10300H (4C/8T), 15.6 GB RAM, Intel UHD + NVIDIA Quadro P620.
  (The kickoff brief listed an older PC; the measured values above are correct.)
- Default GL: `--gl=angle` → WebGL2 on the Intel UHD (hardware). Other modes fall back to
  software (Microsoft Basic Render / SwiftShader). NVIDIA is not used by headless Chrome yet.
- Default concurrency 2 (4 is no faster).
- ALL temp/cache/render on D: inside this project. Always render through `node tools/run.mjs …`
  (sets TEMP/TMP to `.cache/tmp`). Run `npm run cleanup` after every render.
- 720p previews, 1080p finals only. DOF must be switchable/fakeable cheaply.

## Folders
`engine/{look,characters,worlds,props,cameras,shots,fx,director,presets}`, `audio/{sfx,music}`,
`tools/`, `golden/`, `videos/<date>-<slug>/{script.md,voice.wav,words.json,scenes.txt,custom/,out/}`,
`src/` (Remotion entry + compositions + ui), `out/` (scratch renders, git-ignored).

## Git
Commit at every gate. Private GitHub repo (owner sets up `gh` login).
