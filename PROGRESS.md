# PROGRESS

## Current: Review 2 (owner, 2026-11-10): "movement too little, video not engaging"
- Reference compared frame by frame: `out/review2/analysis.md`, `out/review2/reference-vs-ours.png`.
- Step 1 DONE (story + animation + props):
  - Action-first storyboard rules `docs/storyboard-rules.md` + checker in build_video (Short #1 v2 scores
    50% action shots vs the 80% rule).
  - Skeleton: elbows + knees, longer arms, root motion (travel / jump height), squash & stretch, body turn.
  - Held props (`engine/props/HandProps.tsx`): oar, lantern, life jacket, rope, binoculars, telegram,
    rulebook, rifle, rocket, whistle, hammer (pose.holdL / holdR).
  - 14 new actions: jump, leap, stumble, shove, pushed, climbin, row, throw, binoculars, lantern, rocket,
    crouch, surge, runacross (`node tools/actions.mjs --v2` -> out/phase4/actions-v2.mp4).
  - Owner picked TALLEST bodies (~3 heads) -> style v1.4 (`body` legScale 2.1 / torsoScale 1.3 / armScale 1.4);
    old cut templates auto-lift their cameras; golden frames re-approved; face check 6/6.
- Demo built: `videos/2026-11-10-action-demo/out/action-demo-720p.mp4` (14 s, 7 shots, storyboard check
  100% action): crowd surge, officer shove, climb into boat with life jacket, distress rocket, stoker sprint with
  lantern, boat lowering, man leaping. New props: DeckBoat, RocketFlare. Night made brighter (moonlit blue).
  Perf fix: shared texture copies (heavy shots 9 s/still instead of timing out); delayRender timeout 120 s;
  texture/sky loaders release their hold on unmount.
- Lessons: with ~3-head bodies in a 9:16 frame, over-the-shoulder shots fail (the near head fills the frame);
  use 3/4 front-side or side views; keep 1.2 m+ between characters who interact.
- Next (waiting on owner feedback): dense sets, framing rules, bigger effects.

## Paused: Phase 5 (Long-form pipeline), started 2026-11-10
- Owner decisions: topic = Titanic, full story; format = 16:9 landscape; owner records the narration.
  Outline + phase plan: `videos/2026-11-10-titanic-full/outline.md` (waiting for owner approval).
- Owner accepted Short #1 v2 at 720p ("video is fine, no 1080p needed") and moved on. Style v1.3 is now the
  approved look (git tag `style-v1.3`); golden frames re-approved; face check 6/6 presets.

## Done: Short #1 revision 2 (owner review, 2026-11-09/10)
- Task 1 DONE: face stripes = pen hatching aliasing (not shadow acne). Hatching off on heads, anti-aliased
  where used, shadow bias raised, `tools/facecheck.py` (all characters x presets) runs inside golden check.
- Task 2 DONE: 3 paper-panel faces (E/F/G) shown; owner chose to KEEP face D "Comic".
- Task 3 DONE: CC0 textures + skies (CREDITS.md), stronger DOF, film grade, preview quality mode, style v1.3.
- Task 4 DONE: camera grammar in style v1.3 (handheld drift, key-word push, motion blur), eye XCUs, top-down.
- Task 5 DONE: top sentence subtitles.
- Task 6 DONE: POV script approved 2026-11-10 (all facts sourced). New shots: insp-tilt, boats-20, crowd-2200,
  officer-wave (new character `officer`), boat-away. 29.8 s, 22 cuts (avg 1.35 s).
- 720p preview: `videos/2026-11-10-titanic-lifeboats-v3/out/preview-720p.mp4`, -14.0 LUFS, no black/frozen frames.
  v1 vs v2 sheet: `out/rev2/v1-vs-v2.png`.
- Render cost (720p): old Short 172 s for 31.8 s = 5.4 s per second of video; revision 187 s for 29.8 s =
  6.3 s per second (+16%, textures/skies/grade). 1080p estimate ~12.9 s per second (~6.4 min).
- 2026-11-10: owner supplied the narration (`voice-original.wav`, 31.7 s). Recording mode now aligns the
  whole script to the audio at once (robust beat starts). Preview with owner voice:
  `out/preview-720p-myvoice.mp4` (32.0 s, -14.0 LUFS, render 187 s). Limiter lowered to -2 dB for the final.
- WAITING ON OWNER: approve preview -> 1080p final; approve style v1.3 look -> re-approve golden frames
  (golden check now differs by design: no hatching, textures, grade).

## Earlier: PAUSED by owner (2026-11-09) at GATE 4
Video production is on hold. Nothing is pending in the background. When resuming: owner reviews the
GATE 4 preview + style v1.2 lighting, then 1080p final, then Phase 5 (long-form pipeline).

### GATE 4 (2026-11-09): 3-minute test video rendered from the scene file alone, not yet reviewed

### GATE 4 result
- `videos/2026-11-09-triangle-fire/out/preview-720p.mp4`: 2:49, 34 beats, 97 director-chosen shots,
  -14.0 LUFS, peak -1.4 dBFS, no black/frozen frames. 720p render ~12 min (137 ms/frame).
  Golden 14/14. Owner to approve: the video, style v1.2 (interior + fire presets). 1080p final after approval.


### Phase 4 decisions (owner, 2026-11-09)
- Bodies: keep code-built chibi bodies (no CC0 rigged models).
- Sound: procedural + small CC0 pack (list files and sizes before downloading).
- GATE 4 test video (3 min): Triangle Shirtwaist Factory fire, 1911 (fire exits, doors, sprinklers).
  Script + sources first, owner approval before building.

### Phase 4 progress
- 2026-11-09: script approved. Step 1 characters built: worker (shirtwaist, long skirt, Gibson/bun/braid
  hair, lashes), firefighter (1910s leather helmet, axe), owner (bowler, mustache, watch chain),
  Frances Perkins (stylised, wide hat, notebook), judge (robe, gavel). Worker crowds vary hair
  style/colour, blouse, skirt, height (`makeCrowd({kind: "workers" | "mixed"})`).
  Review: `out/phase4/lineup.png`, `out/phase4/turnaround-worker.png` (composition `Lineup`).
  Golden 14/14.
- 2026-11-09: owner approved CC0 sound download. 8 BigSoundBank CC0 files (13 MB) in
  `audio/library/cc0/bigsoundbank/`: sewing machines x2, fire x2, match, crowd, street, bell.
  Licences: `audio/LICENSES.md`. Named in `audio/library.json`; usable as `fx=<name>` (beds loop
  with crossfade to any length). No adult screams available there (only children), so screams stay
  procedural.
- 2026-11-09: step 2 actions. 16 core actions in `engine/characters/gestures.ts` (`ACTIONS`):
  walk, run, talk, point, panic, fall (cartoon slip onto the back), carry, climb, cheer, shiver,
  sew, rattle (locked door), pushbar, wave, facepalm, cower. Pose gained `roll`, `legs`, `sink`.
  Review: `node tools/actions.mjs` -> `out/phase4/actions.mp4` (animated 4x4) + `actions.png`.
- 2026-11-09: step 3 worlds. `engine/worlds/factory/Factory.tsx` (garment loft: 5 long tables of
  belt-driven machines, seats via `factorySeats()`, scrap bins, window walls, cast-iron columns,
  locked "WASHINGTON PL." door with padlock; `fire`/`smoke` 0..1), `stairwell/Stairwell.tsx`
  (landing, locked door that can shake, stairs, stair hole lit by fire from below, elevator cage,
  window with fire escape), `street/Street.tsx` (10-storey loft facade, top floors burn, iron fire
  escape, taller university building next door, horse-drawn steam pumper, ladder truck whose ladder
  stops at the 7th floor, cobbles, lamps). Fire/smoke fx: `engine/fx/Fire.tsx`.
  New style file **v1.2** = v1.1 + presets `interior` and `fire` (existing presets untouched;
  owner reviews at GATE 4). Review: `out/phase4/worlds-review.png` (composition `WorldTest`).
- 2026-11-09: steps 4-6. **Music**: 6 themes on one shared beat grid (light, tense, somber,
  investigate, ragtime, hopeful), level-matched within 1 dB, equal-power cross-fades
  (`audio/sfx.py`; O(n) smoothing so long videos build fast). **Small sets**: today's office
  (EXIT door with push bar, sprinklers that spray, alarm, extinguisher) and a 1911 courtroom.
  **Places + generic shots**: `engine/director/places.tsx` (spots, props with insert cameras,
  establishing views, camera zones) and `engine/director/shots.tsx` (establish, wide, medium,
  close, low, top, two, ots, insert, pov; angle fallback for tight rooms, from behind when facing
  a wall). **Director**: `tools/director.py` (phrases -> shots: new place = establish, prop words
  = insert, emphasis = punch-in close, question = low, else rotation; explicit `shot:` overrides;
  tiny cuts folded) + `src/compositions/Video.tsx` (camera moves inside a place, whip/flash/fade
  between places). Music only changes where a beat says `music:`; ambience beds per place.
- Test video scene file: `videos/2026-11-09-triangle-fire/scenes.txt` -> 34 beats, 97 shots,
  2:49 (voice_scale 1.08 for long-form narration).

### Phase 4 plan (2026-11-09)
Script draft: `videos/2026-11-09-triangle-fire/script.md` (~3:00, 21 checked claims, 9 sources).
Build order (each step shown to the owner as stills):
1. **Characters**: worker (shirtwaist blouse, long skirt, hair bun/braid variants), 1911 firefighter
   (helmet), factory owner (suit, bowler), Frances Perkins (hat), judge. Crowd = random mix of
   hair, colours, heights (`makeCrowd` variants).
2. **Core actions** (code, frame-driven): walk, run, point, talk, panic (have) + fall, carry,
   climb, cheer, shiver; story extras: sew, rattle-door, push-bar.
   Tone rule: nobody is shown jumping or dying; those beats use empty windows, smoke, slow camera.
3. **Worlds**: factory floor (machines, tables, scrap bins, windows), stairwell + locked door +
   elevator cage + exterior fire escape, street (10-storey facade, horse-drawn engine, short
   ladder, crowd). Small sets: courtroom, commission office, today's office (exit door, sprinkler).
4. **Generic shot templates (8)**: establishing wide, two-shot, over-the-shoulder, prop insert,
   crowd wide, POV, low hero, top-down. Placed by actor/prop names, not hard-coded coordinates.
5. **Sound library**: `audio/library.json` name -> procedural or CC0 file (+ variants);
   **music themes 6**: comedy pluck, tense pulse (have) + somber piano, investigation, period
   ragtime-style, resolve/hopeful.
6. **Director**: scene file lists place + actors + lines; it picks shots automatically
   (new place -> establishing, emphasis -> punch-in, prop words -> insert, speaker -> two-shot)
   unless a `cut:` overrides; chapters for long videos.
7. **GATE 4**: render the 3-minute video from the scene file alone. Estimate: 720p preview
   ~16 min, 1080p final ~35 min.


### GATE 3 result (2026-11-09, passed)
- Owner approved preview v2c ("Good, continue"). Final: `videos/2026-11-08-titanic-lifeboats-v2/out/titanic-lifeboats-v2-1080p.mp4`
  (not in git; 29 MB) + contact sheet `...-1080p-contact.png`.
- QC: 1080x1920, 30 fps, 31.8 s (953 frames), no black/frozen frames, -14.0 LUFS, peak -1.4 dBFS.
- **Render time: 1080p final 353 s (370 ms/frame)**; 720p preview 172 s (180 ms/frame).
- Usage at gate: Claude Pro plan, 5-hour window 12% used, weekly 2% used; session context 18%.
- Open before Phase 4: code-built bodies vs CC0 rigged models; optional CC0 SFX pack (real scream);
  owner's own voice recording (`--recording`).


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

### Short v2b (2026-11-09): owner: "audio lags, transitions not smooth, stoker -> crunch stutters"
Causes found (not internet, not A/V sync: audio and video both start at 0, lengths match):
1. Music restarted its beat at every mood change (5.3 s, 26.9 s) -> rhythm stumbled.
2. Heavy ducking (ratio 5, release 0.35 s) -> music pumped up in every voice gap.
3. 2.2 s of dead air from reveal pauses (1.1 s around "Then... CRUNCH").
4. Whip slid the picture off-screen over black; 0.3 s shots were almost all blur.
Fixes: one continuous beat grid for the music (kick + hat groove, moods cross-fade 0.35 s);
gentle slow ducking; pauses cut to 0.08-0.3 s and reveal lines snap onto the beat; a riser fills
the gap into CRUNCH; same-place shots now join with a 7-frame camera move (no cut); place changes
whip with both shots sliding together (no black). `cutSet()` in `engine/shots/cuts.tsx`.
Result (720p): 31.8 s, -14.0 LUFS, LRA 2.5 LU, no black/frozen frames, render 166 s. Golden 14/14.
File: `videos/2026-11-08-titanic-lifeboats-v2/out/preview-v2b-720p.mp4`.

### Short v2c (2026-11-09): owner: "whoosh too loud/repetitive; crash audio sounds cut; reference scream"
- Voice clips started/stopped on non-zero samples (tiny clicks at every line join, 3 in a row at
  the crash) -> 12 ms fade-in / 30 ms fade-out per line.
- Crash: new `impact` sound (crack + deep boom + hull groan + reverb tail, 2.8 s) bridges into
  the next shots; synthesized distant crowd `scream` 0.55 s after the hit. `fx=impact+scream`.
- Whooshes: half as loud, 4 rotating variants, and only where the picture whips to a new place
  (same-place camera moves are silent): 23 sound events instead of 27.
- Music: no ducking (steady level ~18 dB under the voice), low drone under the tense pulse,
  light/tense beds level-matched. Shared place map `engine/shots/sets.json`.
- Result: 31.8 s, -14.0 LUFS, LRA 2.0 LU, no black/frozen frames, render 172 s, golden 14/14.
  File: `videos/2026-11-08-titanic-lifeboats-v2/out/preview-v2c-720p.mp4`.
- Note: scream/impact are synthesized in code; a real CC0 recorded scream would sound better
  (needs a download -> ask owner).

## 2026-11-10: "The Flamethrower Trap" Short (dramatized, owner's voice)
- Follows the reference Short's story (owner decision), marked as dramatized in `script.md`.
- New: trench world (`engine/worlds/trench/Trench.tsx`), soldiers `tommy`/`enemy`/`flamer` (Brodie + steel
  helmets, webbing, fuel tanks), flamethrower lance, `TrenchProps.tsx` (machine gun, fire jet, muzzle flash,
  falling rifle), 8 new gestures, 11 action shots, `tr=hard` cut, `mgburst` sound, `fx=name:dur` crop.
- CC0 textures Ground054 + Fabric026 (ambientCG) added to `CREDITS.md`.
- Preview: `videos/2026-11-10-hooge-flamethrower/out/flamethrower-trap-720p.mp4` (21.2 s, -14.2 LUFS,
  11/11 action shots). Waiting for owner feedback.

## 2026-11-10: line-by-line workflow ("Trench Trap")
- Owner's new step: decide and build ONE narration line at a time (scenes per line chosen by the owner),
  preview each line, then record the whole voice at the end. Plan + status: `videos/2026-11-10-trench-trap/lines.md`.
- Line 1 "Enemy soldiers trap you in a trench." -> `enemies-advance` + `you-surrounded`; preview
  `out/line1-720p.mp4` (placeholder voice, 1.1 s cold-open `lead:`). Waiting for owner feedback.
