# PROGRESS

## Current phase: Phase 3 (First Short): v1 rendered, owner wants a faster/funnier v2

### Phase 3 status (2026-11-08)
- Short v1 done end-to-end from `videos/2026-11-08-titanic-lifeboats/scenes.txt`:
  placeholder TTS → faster-whisper timings → 9 shot templates → 720p preview → 1080p final.
- Render times: 720p preview 198 s (181 ms/frame); **1080p final 366 s (334 ms/frame)**, 1,094 frames.
  QC: 1080×1920 30 fps, 36.5 s, no black/frozen frames, -15.3 LUFS, -1.5 dBTP. Golden check 14/14.
- Usage at this point: Claude Pro plan, 5-hour window 16% used, weekly 11% used; this session's
  context ~57% (565k tokens).
- Owner feedback: delivery and reveal are boring vs. reference Short (IdUVd-PXeC8). Full
  frame-by-frame analysis + plan: `videos/2026-11-08-titanic-lifeboats/review-vs-reference.md`.
  Key gaps: ~7× fewer shots (every 4.1 s vs ~0.6 s), slower narration (2.5 vs 3.7 words/s), no
  hook, characters barely act, no inserts, no SFX, sentence captions instead of word-by-word.
- Waiting on owner: approve script v2 + plan (micro-beats, camera kit, gesture kit, word captions
  = style v1.1, CC0 SFX/music + Piper voice downloads).

## GATE 2 (passed 2026-11-08)

### GATE 2 result (2026-11-08)
- Owner approved the look → **`engine/look/style-v1.0.json` is LOCKED** (git tag `style-v1.0`).
  Face Variant D "Comic" + ink hatching + head outline; PBR bodies; real depth of field.
- **14 golden frames** in `golden/` (deck × 4 presets, close-ups × 4 presets, wide shot,
  2 turnarounds, talking frame, 2 face sheets), listed in `golden/manifest.json`.
- Golden checker: `node tools/golden.mjs check` re-renders and compares (SSIM ≥ 0.985), writes
  side-by-side diffs to `out/golden-report/`. Baseline re-check: 14/14 SSIM 1.0000 (renders are
  deterministic). `approve` overwrites the baseline: owner approval only.
- Still open: code-built bodies vs CC0 rigged models (decide before Phase 4).

### Next: Phase 3 (First Short)
1. Draft 25–40 s script "POV: you're on the Titanic. Why weren't there enough lifeboats?" with
   sources → owner approval before anything else.
2. Placeholder TTS voice + faster-whisper word timings.
3. Scene file → 720p preview → 1080p final → GATE 3 (record render time + usage).

---
## History: Phase 2 iterations

### Look v0.2 (2026-11-08, after owner feedback "variant A, but closer to the reference channels")
Owner chose face **Variant A**, but wants the look closer to the reference images (big round head,
bold face, realistic materials, strong lens blur) "with a unique addition". Built `style-v0.2.json`:
- Big sphere head; Variant A features 24% bigger/bolder; face is a paper card wrapped on the head.
- Realistic (PBR) materials: cloth weave, leather, brass, metal; soft environment reflections.
- White 4-finger cartoon gloves; brown leather cap for the stoker.
- Real depth of field (postprocessing), sky painted into the 3D background.
- Keyword caption moved lower (y 1330 of 1920) so it doesn't cover faces.
- **Unique addition candidates** (switchable in `style.face.shading`):
  hatch = pen crosshatching on the shadow side of head/face that follows the real light;
  rim = face is a raised paper card with an ink edge. Review: `out/look2/options-4.png`
  (plain / hatch / rim / both) and `out/look2/presets-4.png` (both, in 4 presets).
- **Owner chose BOTH** (hatch + rim). Feedback "drawing feels drawn on the face" → added:
  relief (features pressed slightly into the surface, lit by the scene), soft occlusion around
  features, a shared surface sheen, cleaner lines (wobble 0.6, grain 0.1), and the Inspector's
  glasses are now a real 3D wire prop on the face. Review: `out/look3/compare-face.png`
  (before | after) and `out/look3/after-4.png`.
- Owner then asked for faces like the reference channels ("the face gives emotion and a comedic
  vibe") → new **Variant D "Comic"** (now the default for both characters): whole head is the face,
  big white eyes + dot pupils, expressive lids/brows, bigger mouths, ink silhouette outline,
  hatching runs continuously over head and face. Review: `out/look4/expressions-3d.png`
  (8 expressions) and `out/look4/presets-4.png`.
- Not yet updated to v0.2 framing: `StyleTest`, `FaceVariants`, `Turnaround` compositions.

### GATE 2: owner decisions needed (earlier list; face variant answered: A)
1. **Face variant**: A "Ink Dot", B "Bean & Blush" or C "Woodcut" (or a mix, e.g. "A eyes + C brows").
2. **Approve the look** (or list changes) → I save it as `engine/look/style-v1.0.json` and copy the
   approved stills to `golden/` as the first golden frames.
3. **Bodies: code-built vs CC0 models.** For speed and a consistent look I built the chibi bodies
   from simple shapes in code instead of restyling Quaternius/Kenney models (the locked plan).
   Code-built bodies can be animated from code (walk, point, panic, …). CC0 rigged models would
   need a download (I'll ask first) and bring ready-made animations. Decide before Phase 4.

Review files: `out/gate2/` (not in git; regenerate with the commands below).
- `face-variants.png`: Inspector + stoker in each face variant
- `faces/*.png`: full sprite sheets (8 expressions × [resting mouth + 5 talking mouths])
- `turnaround-inspector.png`: front / 3/4 / side / back
- `style-grid.png`: rows = variants A/B/C, columns = day / golden / storm / night
- `style-<preset>-<variant>.png`: full-size 1080×1920 stills
- `safe-area-check.png`: red = areas covered by the YouTube Shorts UI
- `talk-test-720p.mp4` (+ contact sheet): lip-sync from word timings (fake timings for now)

### Done (Phase 2, 2026-11-08)
- Style file `engine/look/style-v0.1.json`: toon ramp, ink/paper colours, face panel size,
  fake DOF, caption layout + safe area, 4 lighting presets.
- Face system (`engine/characters/face.tsx`): 3 variants × 8 expressions × 6 mouth slots, drawn as
  SVG with ink wobble + paper grain, exported to sprite sheets by `node tools/make-faces.mjs`.
  Per-character extras: Inspector glasses; stoker soot + stubble.
- Character bible (`engine/characters/*.json` + `bible.ts`): Inspector, Stoker.
- Chibi body (`Character.tsx`): ~2.5 heads, rounded "marshmallow" head with flush face panel,
  toon shading, no outlines, oversized peaked cap / flat cap, white gloves, clipboard, shovel.
  Faces glow slightly in dark presets so they stay readable.
- Lip-sync (`lipsync.ts`): word timings → mouth shapes (vowel-driven, min hold 0.07 s).
- World kit: ship deck (planks, railing, hull, deckhouse with windows/doors, lifeboats on davits,
  raked funnels, ventilator, night lamps) + toon sea + painted sky backdrop (sun, moon, stars,
  clouds) + rain fx.
- Caption system (`engine/captions/Captions.tsx`): top subtitle + centre keyword pop, auto-fits
  inside the Shorts safe area; optional safe-area overlay.
- Shot layer stack (`engine/shots/WorldShot.tsx`): backdrop → 3D → rain → grade → captions.

### Measured
| Render | Time |
|---|---|
| One 1080×1920 style still (deck + 2 characters + shadows) | ~3.5–4.5 s incl. startup |
| Talk test, 150 frames (5 s) at 720p | 14.1 s total |

### Known limitations (fine for now)
- Backdrops are painted in code (gradient sky, clouds). Painted/AI images can replace them later.
- Depth of field is "fake" (blurred backdrop + fog). Real lens blur later if needed.
- Lip-sync tested with generated timings; real faster-whisper timings in Phase 3.

### Next (Phase 3, after GATE 2)
1. Draft the Titanic lifeboats Short script (25–40 s) with sources → owner approval.
2. Placeholder TTS voice + faster-whisper word timings.
3. Scene file → 720p preview → 1080p final → GATE 3.

### Phase 1 summary (2026-11-08)
- Toolchain: Node 24.22, Python 3.12.10, FFmpeg 9.0.2, Git 2.56, faster-whisper 1.2.1,
  Remotion 4.0.541 + three 0.180 + R3F 9.3. WebGL via `--gl=angle` on the Intel UHD GPU.
- Speed: heavy 1080p scene ~0.1 s/frame + ~7 s startup; 2 workers best.
- GitHub: private repo https://github.com/saifullahraodev-prog/studio

### Open (optional)
- Make headless Chrome use the NVIDIA Quadro P620 (Windows Settings → Display → Graphics → add
  `chrome-headless-shell.exe` → High performance). Owner must do this; then I re-run `npm run gltest`.

### Short v2 (2026-11-08): owner approved script v2 + plan
- New: style v1.1 (word-by-word captions, accent colour; v1.0 untouched, golden frames unchanged),
  Piper offline voice (`models/piper/en_US-ryan-high.onnx`, owner-approved download), script↔audio
  alignment for cues/captions, procedural SFX + music bed (`audio/sfx.py`, no downloads),
  gesture kit (12 gestures, `engine/characters/gestures.ts`), finger-counting gloves, camera kit
  (punch-in, push, wide-lens, dutch), 27 cut templates (`engine/shots/cuts.tsx`), `ShortV2`
  composition with whip-pan blur + flash transitions, new props (boiler room, crate, certificate +
  APPROVED stamp, rubber stamp, mini boats, 3D labels).
- Result (720p preview): 32.9 s, 28 cuts (one every 1.2 s vs 4.1 s in v1), 3.1 words/s,
  -14.0 LUFS, no black/frozen frames, render 158 s (160 ms/frame).
- Files: `videos/2026-11-08-titanic-lifeboats-v2/` (scenes.txt, script.md, out/preview-v2-720p.mp4).
- Next: owner review of v2 preview → tweaks → 1080p final → GATE 3.
