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
- Faces (updated 2026-11-08 by owner, look v0.2): **face Variant D "Comic"**: the whole round
  head is the face. Big white eyes with small dot pupils, expressive lids/brows, small mouth low on
  the face, no nose, ink outline around the head silhouette. Expressions + mouth shapes = sprite
  swaps (`engine/characters/face.tsx`). Owner asked to move closer to the reference channels;
  keep these marks that make it ours: warm off-white paper head (not flat white), **pen
  crosshatching** on the shadow side (not flat grey), features with slight relief/sheen, and
  character extras as real 3D props (Inspector's spectacles) or drawn details (soot, stubble).
- Bodies: soft realistic (PBR) materials (cloth, leather, brass, metal), white 4-finger gloves.
- World: softly realistic, strong depth of field. Far background = painted/AI backdrop image;
  near/mid ground = real 3D.
- Captions: small sentence subtitle near top + one huge keyword per beat in centre
  (bold rounded Google font, white with dark outline). Stay inside Shorts safe areas.
- Lighting presets per world: calm day, golden hour, storm, night.
- Look values live in ONE versioned file `engine/look/style-v0.x.json`; never change inside a video.

## Tech
- Node LTS + Remotion 4 + @remotion/three + react-three-fiber + three.js, TypeScript.
- Python 3 + FFmpeg (audio, mixing, joining, QC). faster-whisper for word timings.
- Characters: **code-built chibi bodies** (owner decision 2026-11-09, Phase 4), all motion from code
  (`engine/characters/gestures.ts` + actions). No downloaded rigged models.
- Sound: procedural SFX/music in `audio/sfx.py` + a small owner-approved CC0 pack for what code
  can't fake well (screams, crowds, ambience). List every downloaded file + licence in `audio/LICENSES.md`.
- Remotion licence: free for individuals / teams up to 3.
- Remotion agent skills are installed in `.agents/skills` (linked in `.claude/skills`): follow them.
  Key 3D rules: wrap 3D in `<ThreeCanvas width height>`; **never use `useFrame()`**; animate only from
  `useCurrentFrame()`; `<Sequence layout="none">` inside ThreeCanvas.

## Engine layout (Phase 2)
- Engine code lives in `engine/<area>/` (TypeScript); `src/` only holds the Remotion entry, `Root.tsx`
  and compositions. Binary assets (face sprite sheets, later backdrops/models) live in `public/`
  mirroring engine areas, loaded with `useStaticTexture()` (`engine/assets.ts`), which also forces
  the 3D redraw after loading (Remotion only redraws three.js on frame change).
- Look values: import `style` from `engine/look/style.tsx` (points at the current style JSON).
- Faces: drawn in `engine/characters/face.tsx`; after changing faces or adding a character run
  `node tools/make-faces.mjs` to regenerate `public/characters/faces/<id>-<variant>.png`.
- Every world shot uses `WorldShot` (backdrop → 3D → fx → grade → captions).
- Stills: `node tools/still.mjs <Comp> <out.png> key=value ... [--frame=N] [--rebundle]`.
  Rebundle after any code change.
- R3F: `meshToonMaterial` has no `flatShading`; use non-indexed geometry for faceted looks.

## Video pipeline (Phase 3)
1. `videos/<date>-<slug>/script.md` (owner-approved, sources listed) → `scenes.txt` (one [beat] per line:
   speaker, say, subtitle, keyword, cue, shot, preset, face).
2. `python -I tools/build_video.py videos/<date>-<slug> [--retts|--recording]`
   (set `HF_HUB_OFFLINE=1`): placeholder TTS per line (Windows voice) or owner's `voice.wav`,
   faster-whisper "small" word timings (decode with ffmpeg → numpy; PyAV mismatch), beat timing,
   keyword cue times, ambience bed + ducking, two-pass loudness to -14 LUFS → `scenes.json`,
   `mix.wav`, copied to `public/videos/<slug>/`.
3. `node tools/storyboard.mjs <slug> 720 --rebundle` → one still per beat (cheap framing check).
4. Render the `Short` composition (props file `{"slug": "...", "res": 720|1080}`), then QC:
   blackdetect/freezedetect, ebur128 loudness, contact sheet.
- Shot templates live in `engine/shots/templates.tsx` (data in, camera + focus + 3D out).
  New videos pick templates by name; add a template only when a story needs a new kind of shot.
- `WorldShot` includes a WarmUp step: fresh shots must draw before capture (else blank first frame).

## Engine conventions
- Lay out 2D overlays in **design pixels for 1080x1920** and convert with `useUnit()` (`src/ui/units.ts`).
- Vertical compositions take `res` prop: 720 (preview, default) or 1080 (final).
  Pass via file: `--props=engine/presets/res-1080.json` (inline JSON breaks on Windows).
- ~80% of shots from templates (data only), ~20% hand-crafted hero shots (hook, climax, ending).
- New characters only via the character bible; new places only from the world kit.
- Keep 10–20 golden frames in `golden/`; check every engine change against them:
  `node tools/golden.mjs check` (must pass before committing engine changes). Only run
  `node tools/golden.mjs approve` after the owner approves a new look/version.
- Current locked look: `engine/look/style-v1.0.json` (GATE 2, 2026-11-08). Never edit it; a look
  change means a new `style-v1.x.json` + owner approval + new golden frames.
  In use: `style-v1.2.json` (v1.1 word captions + pacing; v1.2 adds `interior` + `fire` presets).
- Edit files with the Edit/Write tools or Python (UTF-8). Do NOT use PowerShell Get-Content/
  Set-Content for source edits (Windows PowerShell 5.1 garbles non-ASCII characters).

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
Commit and push at every gate. Private repo: https://github.com/saifullahraodev-prog/studio
(`gh` at `C:\Program Files\GitHub CLI\gh.exe`, signed in as saifullahraodev-prog).
