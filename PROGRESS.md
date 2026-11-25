# PROGRESS

## New: "How We Ended Up" channel (2026-11-15): look APPROVED, "The Gallery"
- Plan: `../How-We-Ended-Up-Channel-Plan.md`. Style bible draft: `docs/howwe-style-bible.md`.
- Stills: `docs/howwe/board.png` (all three side by side + feed-size check), `docs/howwe/look-{A,B,C}-{frame,thumb}.png`.
- Code: `engine/howwe/lab.tsx`, composition `HowLab` (looks A-D; view=museum shows C vs D).
- Owner Q&A done: code-built by Claude; simple faceless people; same style + era tint; medium detail; premium ->
  **daylight gallery + dark spotlight reveal**. Recommendation written: `docs/howwe-visual-direction.md` (D1 The Gallery).
- Style frames v0.1 BUILT (2026-11-15): `docs/howwe/frames/{board,gallery,period,map,reveal,people,thumb}.png`.
  Kit: `engine/howwe/kit.tsx` (tokens, Gallery/Pillar/Plinth/LabelCard/Headline/Subtitle/ThenTint/RoomSign, PlasterHand,
  faceless Figure with 7 outfits x 7 poses, placeholder WorldMap); frames: `engine/howwe/frames.tsx`, composition `HowFrames`.
  Each still renders in ~10-15 s. Costumes, dates, map geography and map data are PLACEHOLDERS.
- GATE PASSED 2026-11-15: owner APPROVED the Gallery style frames. Locked: `engine/howwe/style-v1.0.json` (kit reads it),
  golden frames `golden/howwe-*.png` (in `golden/manifest.json`, SSIM 1.000 vs approved stills).
- 2026-11-15: owner OK'd Natural Earth download. Raw GeoJSON in `public/howwe/naturalearth/` (credited in CREDITS.md);
  `tools/howwe_map.py 110m|50m` -> `engine/howwe/data/world-{110m,50m}.json` (Equal Earth). `WorldMap` in kit now uses
  real countries (`cats` by ISO A3), graticule + Equal Earth outline; `projectEE(lon,lat)` for routes/pins.
  Owner APPROVED the real-geography map room 2026-11-15 (`docs/howwe/frames/map.png`, golden `howwe-map` re-approved).
  Eating-culture colours are PLACEHOLDER data.
- 2026-11-15: production kit v0.1 BUILT (owner asked "build the kit first"): guide `docs/howwe-kit.md`.
  motion.tsx (TIMING, Cam), objects.tsx (10 objects, <Exhibit> stands on plinth top), rooms.tsx (europe1500, china1500,
  today; people loop), templates.tsx (exhibits, period, map, reveal, cardFlip, today, titleWall), video.tsx (HowVideo:
  scene list + cut/dolly/door transitions), demo-scenes.json (placeholder), tools/howwe_storyboard.mjs.
  Storyboard stills: `docs/howwe/kit-v0.1/{scenes,transitions}.png`. Golden howwe check passes. No sound yet.
- 2026-11-15: owner OK'd a preview render. `out/howwe/kit-demo-720p.mp4` (1280x720, 40.9 s, 1228 frames) rendered in
  105 s = ~2.6 s per second of video (concurrency 2) -> a 12-min video ~31 min at 720p (1080p estimate ~1 h, unmeasured).
  QC: no black / frozen frames; contact sheet `out/howwe/kit-demo-sheet.png`. HowVideo now scales to any output size:
  render 720p with `--width=1280 --height=720` (`--scale=0.6667` fails: 720.036 px height).
- 2026-11-15: SOUND KIT built (owner: "add sound kit first"): `audio/howwe_sfx.py` (12 sounds + room tone + music bed,
  all synthesised), `tools/howwe_mix.py` (auto cues from the scene list, music hush on reveal, voice ducking, two-pass
  loudness). Demo: 44 cues, -15.4 LUFS / -1.4 dBTP (no voice). Listen: `out/howwe/kit-demo-720p-sound.mp4` (sound laid
  on the existing render) + `out/howwe/sound-sampler.wav` (each sound once; labels in sound-sampler.txt).
  HowVideo has an `audio` prop.
- 2026-11-15 owner feedback on sound: "too loud, wrong mood, can be better, add some dummy audio". Done (v2):
  all SFX gains roughly halved; new music A "Gallery piano" (72 bpm Dm Bb F C) + B "Quiet curiosity" (pizz, 84 bpm);
  placeholder narration `tools/howwe_voice.py` (Piper Ryan) from each scene's `say`; music ducks under voice (~20 dB below).
  Previews: `out/howwe/kit-demo-720p-voice-music-{piano,pizz}.mp4`, sampler `out/howwe/sound-sampler-v2.wav` (+ .txt).
  Mixes -15.1 / -15.2 LUFS, -1.2 dBTP. 
- 2026-11-15 owner: "find the reference channels, see what music or sound they are using". Researched:
  `docs/howwe-sound-sources.md`. Kurzgesagt = custom score (Epic Mountain); TED-Ed = commissioned studios
  (Wonder Boy Audio, Camp Studio); Johnny Harris = Epidemic Sound + Musicbed + Soundstripe + composer Tom Fox;
  Wendover = sound designers. Nobody uses synthesized music. Recommendation: human-made music (YouTube Audio Library
  free now, Epidemic Sound ~$9.99/mo later). `howwe_mix.py --music <file>` now accepts a downloaded track.
- 2026-11-15: owner chose the free YouTube Audio Library; signed in to the built-in browser. Claude read all 660 tracks
  (all no-attribution licence), shortlisted 8 instrumentals by labels, owner OK'd download. Files in
  `audio/library/howwe/` (git-ignored), licences + track ids in `audio/LICENSES.md`. Mixer: mood beds by scene
  (curious/soft/sparse, 1.5 s crossfades, RMS-levelled, ~21 dB under voice); fast O(n) smoothing (was minutes, now 14 s).
  Compare: `out/howwe/kit-demo-720p-music-yt1.mp4` (Behold The Mystery / Snowfall / Laniakea) vs `-yt2.mp4`
  (Frame-Dragging / Fascination / inner_outer). Owner then said: "forget the music for now".
- 2026-11-15 owner: "focus on the pacing and the retention". Built retention-first pacing (guide in docs/howwe-kit.md):
  script -> `tools/howwe_build.py` (placeholder voice, faster-whisper word times, scenes sized to speech) -> word-synced
  visuals (exhibits/map fills/camera visits/split/flip/reveal/marks), word-by-word captions, *emphasis* keyword pops +
  camera punch + tick, re-hook chip; `tools/howwe_pacing.py` checks R1-R5. Demo v2 (`engine/howwe/demo2-script.json`,
  hook-first): 36.3 s, 34 visual changes, longest gap 3.7 s, first pop 2.2 s -> all PASS (v1 failed R2 at 5.3 s).
  Composition `HowVideoBuilt` {slug}. Storyboard `docs/howwe/retention-v2/`.
- 2026-11-15: owner OK'd render. `out/howwe/demo2-720p.mp4` (36.3 s, 1089 frames) in 114 s = ~3.1 s per second of video
  (overlays cost ~20% vs 2.6); QC: no black/frozen frames, -14.8 LUFS. Sheet `out/howwe/demo2-sheet.png`.
  Known small issues: map legend touches the caption bar after the final pull-back; exhibit label cards get clipped at the
  frame edge while the camera visits an exhibit.
- 2026-11-15 owner: "still missing something" (music test didn't fix it). Diagnosis: no real content + flat voice.
  Wrote the REAL fact-checked opening of video 1: `videos/2026-11-15-howwe-forks-opening/{script.json,sources.md}`
  (chopstick share via Q. E. Wang; Venetian golden fork, 11th c., clergyman's "natural forks" via Nat Geo; Coryat 1608
  "Furcifer"; Yinxu bronze chopsticks c.1200 BC; fuel = "one popular theory"). Kit: golden two-pronged fork `fork2`,
  cardFlip custom labels, map pins + routes on words, legend optional. Build: 65.4 s, 12 scenes, 53 visual changes,
  R1-R4 pass, R5 6.06 s (0.06 over, accepted). Storyboard `docs/howwe/forks-opening/`.
- 2026-11-16: rendered `out/howwe/forks-opening-720p.mp4` (65.4 s, 326 s render = ~5 s per second of video: the map
  scenes are the slow part). QC: no black/frozen frames, -14.8 LUFS. Sheet `out/howwe/forks-opening-sheet.png`.
  Seen: keyword pops cover the exhibit label cards ("GOLDEN", "THREE"). Owner: "Yes, much better" (real content was the gap).
- 2026-11-16: FULL SCRIPT v1 for video 1: `videos/2026-11-16-howwe-forks-full/` (make_script.py -> script.json,
  narration.txt [spoken words only, for CapCut TTS], script.md [readable], sources.md [27 claims, TODOs marked]).
  6 chapters, 40 scenes, 655 words; thesis "Who does the cutting?". New objects: fork3, knifeRound, pasta, flatbread
  (stand-in for injera). Placeholder build: 3:39, 203 visual changes, longest gap 3.9 s; R4 1.3 s = placeholder-voice
  pause on "1669"; R5 6.17 s. Checker now lists every gap > 4 s. Not rendered. Length is SHORT vs plan (10-16 min):
  Owner asked for a demo: rendered `out/howwe/forks-full-720p.mp4` (3:39, 506 s render = 2.3 s per second of video),
  QC ok (no black/frozen, -14.8 LUFS); sheet `out/howwe/forks-full-sheet.png`. Seen: many frames are empty plinths or
  white cards (exhibits appear on late words; lots of cardFlips) -> visual variety is the weak spot for a longer cut.
  Owner asked for the expanded version: `videos/2026-11-16-howwe-forks-8min/` (58 scenes, 1010 words, +11 sourced
  claims: Rome/Byzantium, bring-your-own-knife, Catherine de' Medici myth, American cut-and-switch, Coryat's walk,
  Han/Ming chopsticks, Korean silver legend, Japan funeral rules, gursha). New rooms japan/ethiopia/india + outfits
  kimono/habesha/kurta + gursha "feed" pose (PLACEHOLDERS), ghost exhibits (faint silhouette before reveal),
  script-level voiceScale (1.15 = natural ~150 wpm). Built: 6:06 (not 8:00), R2 gaps up to 5.3 s, R5 7.0 s.
  1-minute clip rendered (owner asked for 1 min, not the whole): `out/howwe/forks-8min-1min-clip.mp4` (4:03-5:03,
  160 s render, -14.6 LUFS, QC ok).
- 2026-11-17: owner gave a MASTER SCRIPTWRITING SYSTEM (saved: `docs/howwe-scriptwriting-system.md`): 1,400-2,100
  words, everyday opening + contradiction, But/Therefore, "The Story You Heard", 2+ sources per key claim, QC pass.
  Rewrote video 1 to it: `videos/2026-11-17-howwe-forks-v3/` (narration.txt 1,592 words ~10.5-11 min; script.md with
  structure + QC answers; sources.md 28 claims, 6 TODOs). Spine: "where does the cutting happen" (kitchen/table/bread);
  new surprise: Brace's overbite theory. Not built into scenes yet. WAITING: owner approves the script.
- NEXT (was): asset kits (map: done; reference-based costumes; object library;
  scene templates; motion + transitions), then video 1 script "Why Half the World Doesn't Use Forks".

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

## 2026-11-11: Trench Trap lines 1-6 done (three.js); Blender test started
- Lines 1-6 approved one by one, following the reference; line 7 (machine gun) paused by owner.
- Owner asked why it still differs from the reference: answer = assets + lighting/renderer (see chat).
- Blender 4.5.16 LTS (owner-downloaded, signature checked: Blender Foundation) unpacked portable to
  `D:\Blender\Blender Foundation\Blender 4.5lender.exe` (893 MB, no system install).
  Headless works; Cycles sees the Quadro P620 (CUDA/OptiX). First test (`blender/test_soldier.py`):
  chubby Mixamo soldier + move + photo sky + mud, 540x960: Cycles GPU 64 spp 16 s/frame,
  Eevee ~50 s first frame (shader compile). Next: docs/blender-test-plan.md Step 1 (the world).

## 2026-11-12: switch to Blender (owner decision)
- 3-shot Blender test done (`out/blender/blender-test-3shots.mp4`, compare sheet): Blender wins on world, light, fire;
  framing/character size/run stutter to fix. Owner: "Yes, switch to Blender".
- Plan: fix run stutter + foot sliding, body smoothing + cloth folds, bridge Blender frames into Remotion for
  captions/sound, then rebuild Trench Trap lines 1-6 (already approved in three.js) shot by shot, stills first.

## 2026-11-12: new project for the owner's live channel "The Ship Guy" (Option A, 2D)
- Owner picked Option A: their 2D stick-figure images + code-animated graphics (counters, maps, size bars),
  captions, SFX, music; 16:9 long-form. Separate from the 3D/Blender "Rules written in disaster" work.
- First video: "The Biggest Ship Ever Built Was Bombed — Then Came Back" (Seawise Giant), ~7:00.
  `videos/2026-11-12-seawise-giant/script.md` (draft v1, sources + fact notes) and `shots.md` (16 images for the owner).
- GATE passed 2026-11-12: owner approved script v1. Next: owner makes images + records voice.wav; I build the 2D
  composition + graphics, storyboard stills, 60 s test render (only after owner OK).
- 2026-11-12: owner asked me to draw the images myself (they supply audio). Owner's 11 stick-figure poses
  (`D:/YouTube_Production/TSG_001_Container_Ships/03_Assets/Stickmen`) cut out to transparent PNGs with
  `tools/cutout.py` -> `public/shipguy/stickmen/`. Code-drawn 2D art kit `engine/shipguy/art.tsx` (sky, sea,
  tanker, jets, missile, boom, flames, smoke, Petronas Towers, tiny workers) + 4 test scenes
  `engine/shipguy/scenes.tsx` (composition `ShipGuyScene`, 1920x1080). Review sheet:
  `videos/2026-11-12-seawise-giant/style-test-4-frames.png`. Plain narration for recording: `narration.txt`.
- GATE: waiting for owner OK on the drawn style + owner's voice recording.
- 2026-11-12: owner sent a CapCut TTS voice (`voice-source.mp3`). It also read the instructions + [section headings]
  from narration.txt aloud -> cut out (20.7 s + 3 leftovers, checked by re-transcribing each cut); clean
  `voice.wav` = 6:14 (raw kept as `voice-raw.wav`). 72 beats in `beats.txt` (template + caption + words), timed by
  `tools/shipguy_timeline.py`, mixed (voice + procedural music moods + SFX) by `tools/shipguy_mix.py` ->
  `public/shipguy/seawise/{timeline.json,mix.wav}`. 30 templates in `engine/shipguy/templates.tsx`; compositions
  `ShipGuyVideo` (full) and `ShipGuyBoard` (storyboard pages). Storyboard: `videos/2026-11-12-seawise-giant/storyboard/`.
- Lesson: narration files meant for TTS must contain ONLY the spoken words (no headings/instructions).
- Owner OK'd storyboard -> 60 s test (2.5 min render) -> owner OK'd full render. Fixes after QC: explosion fades,
  every shot drifts (scale 1->1.045 over the beat) so freezedetect finds no still >2 s.
- DONE 2026-11-12: `videos/2026-11-12-seawise-giant/out/seawise-giant-final.mp4` (1080p30, 6:15, -14.9 LUFS,
  0 black, 0 frozen; ~15 min render). Render: bundle, then `node tools/run.mjs render .cache/bundle ShipGuyVideo <out> --props=<{"slug":"seawise"}>`.

## 2026-11-12: The Ship Guy long-form #2 "Every Level of Ship Engine" (script draft v1)
- `videos/2026-11-12-ship-engines/script.md` (8 levels: outboard -> tug -> Wartsila 31 -> LM2500 -> Icon of the Seas
  -> Nimitz A4W -> RT-flex96C; sources + 11 fact notes) and `narration.txt` (spoken words ONLY, for CapCut TTS).
  1,017 words ~5:45 at the CapCut voice pace (~177 wpm measured on Seawise Giant).
- GATE passed 2026-11-12: owner approved script v1. Next: owner records voice (CapCut, narration.txt); I build new templates (engine cut-aways,
  piston/crankshaft, tug top-down, carrier plant) on the existing 2D pipeline.

## 2026-11-12: The Ship Guy long-form #3 "Ever Given in Suez" (script draft v1)
- Owner asked for a new 10–12 min video; picked The Ship Guy + Ever Given (2021 Suez blockage).
- `videos/2026-11-12-ever-given/script.md` (10 sections: hook, the ship, the canal, the grounding, the digger, the
  traffic jam, the salvage, why it happened (bank effect + Panama 2023 report), impounded, canal widening; sources +
  8 fact notes) and `narration.txt` (spoken words ONLY, for CapCut TTS). 1,967 words ~11:00 at ~177 wpm.
- GATE passed 2026-11-12: owner approved script v1. Next: owner records voice (CapCut, narration.txt); I build new
  templates (top-down canal + wedged ship, queue map, dredger cutaway, tug pull, bank-effect diagram) on the 2D pipeline.
- 2026-11-12: owner's CapCut voice for engines (5:45, clean: no headings read). 57 beats (`beats.txt`), 16 new templates
  in `engine/shipguy/templates2.tsx` (piston, crank, engine, rpm, ladder, outboard, tug, ropecars, ferry, destroyer,
  jet2ship, cruise, carrier, emma, direct, versus) + StatX icons. Timeline/mix: `public/shipguy/engines/`.
  Storyboard: `videos/2026-11-12-ship-engines/storyboard/`. GATE: waiting for owner OK -> 60 s test render.
- 2026-11-12: owner sent CapCut voice in 2 parts (part 1 = exactly 10:00 CapCut limit, cut cleanly between sections 8 and 9).
  CapCut mp3s have one broken 26 ms frame at many sentence pauses (harmless); decoded with gaps filled
  (`aresample=async=1`), joined with a 0.55 s pause -> `voice.wav` 10:57. `words.json` = 1,927 words (faster-whisper small).
- Owner asked for the Ship Guy to be animated (not the same still images). New code puppet `engine/shipguy/guy.tsx`
  (posable joints, face parts, blinks, talk mouth, hat pop-off, props, emotes, walk cycle, hand-drawn line wobble) +
  test lab `engine/shipguy/guyLab.tsx` (composition `GuyLab`, demos hello/shock/point/think/push/dig, `sheet=true` = contact
  sheet, `demo=model` = owner's images vs puppet). Stills in `videos/2026-11-12-ever-given/guy-test/`.
- Owner OK'd a test render: 6 GuyLab demos (~75 s render total) joined -> `videos/2026-11-12-ever-given/out/guy-test-all.mp4`
  (1080p30, 25.3 s, silent, no black/frozen stretches).
- 2026-11-13 owner: "move smoother" + "less outline wobble" -> pose easing = gentle bezier ease-in/out, no overshoot,
  every pose change 1.6x longer (`SLOW`), softer pop-ins, smaller walk bounce, calmer talk mouth; line wobble 1.2 px
  (was 2.6) changing every 8 frames (was 4). Mug now leaves the hand before the jump. -> `out/guy-test-v2.mp4`.
- 2026-11-13 owner (screenshots of v2): resting hands showed as black blobs in the middle of the vest. Fixed poses:
  point = free arm hangs at the side; hipWave = fist on the hip beside the vest; chin = elbow out, fist under the jaw, other
  arm relaxed (no arms across the chest). Rule for new poses: free hands never rest on the vest front.
  -> `out/guy-test-v3.mp4`. GATE: waiting for owner feedback on v3.
- DONE 2026-11-13: `videos/2026-11-12-ship-engines/out/ship-engines-final.mp4` (1080p30, 5:47, -14.5 LUFS, 0 black,
  0 frozen) + 3 thumbnails (`thumbnails/`), `ship-engines.en.srt` (124 cues), `youtube-upload.txt` (title, description,
  chapters, tags). Year cards (raw=1) no longer count up.
- NOTE: another session (Ever Given video) shares this repo and rebuilt `.cache/bundle` mid-render, which killed the
  first full render. Ship Guy renders now use their own bundle: `.cache/bundle-shipguy`
  (`node tools/run.mjs bundle src/index.ts --out-dir=.cache/bundle-shipguy`).
- 2026-11-13 owner: "Yes, plan full video" (puppet v3 approved). Plan draft v1: `beats.txt` (110 beats, every narration word
  in order, timed by `tools/shipguy_timeline.py` -> `public/shipguy/evergiven/timeline.json`, 10:59), `plan.md` (overview: gags,
  15 new templates: canal, side, guy, bridge, map, money, dial, tower, boxline, dredger, pools, moon, bankfx, report, lake;
  reused stat + endcard) and `plan-shots.md` (row per shot; Ship Guy in 74/110, 35 of them `corner=` reactions).
  GATE: waiting for owner approval of the plan. Templates not built yet.
- 2026-11-13 owner approved plan v1 -> BUILD: `engine/shipguy/templates3.tsx` (canal, side, guy, bridge + Ship Guy acting
  library `act()`, `CornerGuy`) and `templates3b.tsx` (map, money, dial, tower, boxline, dredger, pools, moon, bankfx, report,
  lake, endcard2). Puppet: outfits pilot/captain, props phone/hammer/rod, `talkFrom()` mouth driven by real word spans
  (timeline.json beats now carry `words`). `Tpl` gets optional `w`. Mixer: SFX for the new templates; mix.wav 658.7 s, -15.0 LUFS.
  Storyboard (7 pages, 1 still per shot at 60%): `videos/2026-11-12-ever-given/storyboard/`.
- 2026-11-13 owner OK'd storyboard -> 60 s test (`out/test-60s.mp4`, frames 0-1799, 104 s render, -15.2 LUFS, no black/frozen).
- 2026-11-13 owner on the test: "long still shots", Ship Guy "too static", "corner guy distracting". Fixes: 11 long shots
  split (121 beats, avg 5.4 s; hook question becomes a 3-shot montage); corner guy kept only for 3 gags (369 ships, $916M
  faint, deal cheer); host shots now change gesture at every spoken phrase (`phraseStarts`, `GEST` in templates3.tsx), nod
  with the words, shift weight, and cut in closer (1.38x) on every other phrase. Re-mixed; `out/test-60s-v2.mp4` (-15.2 LUFS,
  no black/frozen).
- DONE 2026-11-13: owner OK'd full render -> `videos/2026-11-12-ever-given/out/ever-given-final.mp4` (1080p30, 10:59,
  -15.0 LUFS, peak -4.4 dBFS, 0 black, 0 frozen; render 21 min; 240 MB). Extras 2026-11-13: `ever-given.en.srt` (255 cues, words match narration), `thumbnails/thumb-A/B/C.jpg`
  (`engine/shipguy/ThumbEG.tsx`, composition ShipGuyThumb v=EGA/EGB/EGC), `youtube-upload.txt` (title, chapters, sources, tags).
  Owner: thumbnails "not convincing" -> v2: hand-made 3D perspective aerial (`Aerial` in ThumbEG.tsx: ship with hull height,
  container stacks, bridge tower, queue to the horizon) = thumb-D (recommended) / thumb-F; redone bow+digger = thumb-E.
  Owner: "simple yet impactful, no 3D, keep the video format, high CTR" -> v3 flat: thumb-G "STUCK!" (ship jammed across
  the canal + big shocked Ship Guy, recommended) and thumb-H "MOVE!" (Ship Guy pushing the stuck hull).

## 2026-11-13: The Ship Guy long-form #4 "Every Level of Ship by Cost" (script draft v1)
- Owner picked the topic. `videos/2026-11-13-ship-cost/script.md` (9 levels: $2k jon boat -> V12 outboards -> used Damen
  tug EUR4-6M -> ULCS ~$242M -> LNG carrier ~$245M -> Azzam ~$600M (reported) -> Icon of the Seas ~$2B -> Virginia SSN
  ~$4.5-5B -> USS Gerald R. Ford ~$13B; 19 fact notes, 2026 prices) + `narration.txt` (spoken words only, ~5:13).
- GATE passed 2026-11-13: owner approved script v1. Next: owner records voice (CapCut, narration.txt).
- ERRATUM found for #2 (engines): narration says the 600 hp V12 outboard "weighs about as much as a small car"; it is
  ~570 kg (about half a small car). Not yet fixed in `ship-engines-final.mp4` (needs one re-voiced line + re-render).
- 2026-11-13: owner sent the CapCut voice for #4 (5:14, clean) and asked: "make it engaging, keep the music light, use
  sfx, retention to maximum" (saved as a standing rule in memory). Built for retention: 83 beats (avg 3.8 s, max 7 s),
  animated Ship Guy host (`guy` from templates3) on talking lines + climbing the price ladder, a swinging price tag with
  ka-ching on every price, light/hopeful music only, 199 sound events (was 83 on #2). New `engine/shipguy/templates4.tsx`
  (tag, pladder, vsyacht, permetre, stack, factory, listing, cold, slot, sub, kilo, fleet, endhire); `tools/shipguy_words.py`
  (permanent word-timing tool; the old one lived in .cache/tmp and got cleaned). Storyboard:
  `videos/2026-11-13-ship-cost/storyboard/`. GATE: waiting for owner OK -> 60 s test.
- NOTE for the Ever Given session: TEMPLATES3 registers `bridge`, which replaces Seawise Giant's `bridge` scene; re-rendering
  Seawise Giant would now show the Ever Given bridge for beats 13 and 36.
- 2026-11-13 owner on the 60 s test: boats look "very low effort and unrealistic". Owner chose direction A: all ships
  redrawn detailed in `engine/shipguy/ships_hd.tsx` (BoxShipHD, LngHD, YachtHD, CruiseHD, CarrierHD, SubHD, TugHD, JonHD,
  V12HD: gradients, plating, boot-top, antifouling, rust streaks, windows, lifeboats, railings, real ship parts). The old
  names in templates2 (BoxShip, TugArt, CruiseArt, CarrierArt, stat icon outboard, rear-view V12s) and templates4 now
  draw the HD ships, so every video that uses them gets the new look. Gallery composition `ShipLook`
  (`storyboard/ships-hd-gallery.png`). Storyboard re-rendered. GATE: owner OK -> new 60 s test.
- DONE 2026-11-13: `videos/2026-11-13-ship-cost/out/ship-cost-final.mp4` (1080p30, 5:15, -14.7 LUFS, 0 black, 0 frozen;
  detailed HD ships). Upload kit: 3 thumbnails (`thumbnails/`, compositions ShipGuyThumb v=cost1..3 in
  `engine/shipguy/ThumbCost.tsx`), `ship-cost.en.srt` (113 cues), `youtube-upload.txt` (title, description, 11 chapters,
  price list, sources, tags).

## 2026-11-13: second channel research, "BACKWARDS" (where things really come from)
- Owner picked the Backwards idea for a second channel; research only: `docs/channel-backwards-research.md`
  (competition, format rules, sourced topic bank, risks). Finding: topic proven (TED-Ed t-shirt 3.5M) but flooded by
  new low-view faceless channels; backwards + "twist stop" format unused. Suggested test: Apple + Fish Shorts.
- 2026-11-14: style bible draft `docs/backwards-style-bible.md`; owner picked look **A "Cardboard world"**.
  First stills built in code: `engine/backwards/{art,parcel,lab}.tsx` (kraft paper, tape, worn stamps, labels, cut-paper
  factory, lights/baubles; host "Parcel" with 7 poses + stamp progression), composition `BackLab` (view=sheet|frame|thumb).
  Review sheet `docs/backwards/backwards-look-A.png`. GATE: owner to approve look + host + thumbnail, choose channel name.

## 2026-11-16: The Ship Guy long-form #5 "The Tiny Mistake That Brought Down a Bridge" (Dali / Key Bridge, script draft v1)
- Owner picked The Ship Guy + Dali vs Baltimore Key Bridge. `videos/2026-11-16-dali-bridge/script.md` (8 sections, ~1,090 words ~6:10, sources,
  9 fact notes) + `narration.txt` (spoken words only). Hook built on the Seawise retention lesson: story + twist (a plastic
  label) with the story starting by ~0:35, no spec-sheet. Serious tone in the collapse sections (6 deaths, no gags).
- 2026-11-16 owner asked for 10-12 min -> script v2 expanded to ~1,950 words (~11:00) with researched beats: stopping/anchor +
  three ship lengths, the search, the 1980 Sunshine Skyway precedent (35 dead, origin of the 1991 rules), breakers in manual
  (58 s vs 10 s), finding the wire took a month, the port cut off + Chesapeake 1000 (CIA submarine past), temporary channels,
  the anthem-name buoy, Dali repaired in China and back in service Jan 2025. 14 fact notes.
- GATE passed 2026-11-16: owner approved script v2. Next: owner records voice (CapCut, narration.txt; CapCut cuts at 10:00, so
  expect 2 parts); I build the shot plan + new templates (night bridge, blackout cut-away, truss collapse, terminal block, crane).
- 2026-11-16: owner sent the CapCut voice in 2 parts (10:03 + 0:52), joined cleanly at "…responsible." -> `voice.wav` 10:56,
  `words.json` (1,931 words, matches the script apart from number spellings). Shot plan v1: `beats.txt` (161 beats, avg 4.1 s,
  every word in order) -> `public/shipguy/dali/timeline.json`; `plan.md` + `plan-shots.md` (Ship Guy in 74 shots, in-scene only;
  sections 3-4 quiet, no gags).
- 2026-11-16 owner approved the shot plan -> BUILD: `engine/shipguy/templates5.tsx` (night, truss + KeyBridge collapse, topd,
  dali [BoxShipHD named DALI, darkened with a CSS brightness filter], wheel) + `templates5b.tsx` (power, wire, anchor, radio,
  under, memorial, risk, skyway, ntsb, clocks, pump, port, crane, blast, price, usmap [real US outline], fort, route, endcard5).
  Puppet: shades + magnifier/label props; acts pinch/fold/salute/brake/ears/magnify/pushslide/cool/notes/sad; host bg=river.
  Mixer: music=quiet (light theme at 22%) + SFX for the new scenes (no comic sounds in the serious beats). mix.wav 657.1 s,
  -15.0 LUFS, 224 events. Storyboard 11 pages: `videos/2026-11-16-dali-bridge/storyboard/`.
- 2026-11-16 owner OK'd storyboard -> 60 s test `out/test-60s.mp4` (frames 0-1799, 132 s render, -15.3 LUFS, no black/frozen).
- 2026-11-16 owner on the test: "the start has some gaps", "add proper subtitles", rest awesome -> new `tools/shipguy_tighten.py`
  (CapCut pauses > 0.6 s cut to 0.4 s, 63 pauses / 28.4 s removed, originals kept as voice-raw.wav + words-raw.json;
  video now 10:28), new `tools/shipguy_subs.py` -> `public/shipguy/<slug>/subs.json`, drawn by `Subtitles` in Video.tsx
  (sentence cues, 1-2 lines, one yellow word at a time; loaded only if subs.json exists). Cut fade-in softened (no dark dip).
  30 s demo `out/demo-30s.mp4` (-15.4 LUFS, no black/frozen).
- DONE 2026-11-16: `videos/2026-11-16-dali-bridge/out/dali-bridge-final.mp4` (1080p30, 10:29, -15.0 LUFS, peak -4.3 dBFS,
  0 black, 0 frozen; render 31 min; 222 MB). Known cosmetic nits: one long subtitle cue falls back to a wide 2-line box
  ("And nobody went back…"), and the in-scene hint text in the wire scenes (y=900) sits just above the subtitle box.
  Upload kit 2026-11-16: `dali-bridge.en.srt` (233 cues, words match), thumbnails A "THIS?!" (recommended) / B "NO POWER" /
  C "4 MINUTES" (`engine/shipguy/ThumbDali.tsx`, ShipGuyThumb v=DA/DB/DC), `youtube-upload.txt` (title, 10 chapters, facts, sources, tags).

- 2026-11-16 owner on the final: "music too loud and annoying throughout", odd crew hats, "6 people died" visual not understandable,
  "some visuals don't make sense according to the audio". Fixes: `tools/shipguy_mix.py --tracks calm` = real YouTube Audio Library
  tracks (Laniakea tense / Behold The Mystery main / Snowfall quiet / Fascination hopeful), music at 0.075 + ducked ~6 dB under the
  voice (old code bed at 0.16, no ducking). New outfits in guy.tsx: pilot = dark PILOT jacket, no hat; officer = white shirt +
  shoulder boards; coverall = deck crew; road = lime vest + yellow hard hat (road workers no longer look like the Ship Guy).
  Full shot-vs-narration audit -> fixed shots 4 (deck crew fading), 6/126 (wire + label next to a fingertip), 11 (leaving the lit
  port), 25/68 (deck close-up `DeckCrew`), 73 (yellow hard hats + candles, broken bridge behind), 74-77 (real divers, 2x),
  127/140/141 (`TrussPiece` on the bow), 132 (crew cutting with torches). Stills in `videos/2026-11-16-dali-bridge/fixes/`,
  music sample `fixes/music-check.mp3`.
- 2026-11-16 owner: "remove the music and just focus on the video and sfx, nothing else is needed" -> `--tracks none`
  (voice + SFX only, -14.9 LUFS); standing rule for future Ship Guy videos. Sample `fixes/no-music-check.mp3`.
- DONE v2 2026-11-16: `videos/2026-11-16-dali-bridge/out/dali-bridge-final-v2.mp4` (no music, voice + SFX, fixed visuals;
  1080p30, 10:29, -15.0 LUFS, peak -4.3 dBFS, 0 black, 0 frozen; render 27 min; 225 MB). Use v2 for upload (v1 kept until owner says delete).

## 2026-11-19: The Ship Guy long-form #6 "How an Aircraft Carrier Actually Works" (script draft v1)
- Owner asked for a topic from analytics. Read YouTube Studio (The Ship Guy, last 28 days): Shorts 18.9k views (each ~1.0-1.25k,
  79% Shorts-only viewers, 0 regular viewers, +18 subs); long videos 2.8k views, 19.2k impressions, CTR 2.9%, AVD 2:23, 68% Browse.
  Best long: Every Level of Ship by Size 747, Seawise Giant 483. Dali (uploaded as "A Tiny Plastic Part Brought Down This Bridge"):
  AVD 5:45 of 10:29. Niche demand: "Inside the World's Largest Cruise Ship" 2.2M, "How Aircraft Carriers Work" 1.4M,
  "458 Meters of Steel" 279k in 4 weeks. Owner picked the aircraft carrier.
- `videos/2026-11-19-aircraft-carrier/script.md` (hook = night landing; launch, wire, bolter/full throttle, angled deck, barricade,
  jerseys, the Forrestal fire (serious, no gags), island/Air Boss/cycles, hangar + elevators, reactors, water/food, Ford; sources,
  13 fact notes) + `narration.txt` (spoken words only, 1,842 words ~10:15). No music; build part by part.
  GATE: owner approval of script v1.

## 2026-11-19: carrier script v2 (fact-checked revision per owner's editor/fact-checker brief)
- `videos/2026-11-19-aircraft-carrier/script.md` v2 (1,850 words, ~10:15): launch/recovery is the spine; fixes A–L (no "23 t typical",
  no "125 landings", wires 4/3 incl. Reagan/Bush, air wing/strike group/cycles qualified, "about as tall as the Eiffel Tower",
  EMALS stored rotor energy + solid-state conversion, Ford "nearly three times" per Navy, 160/270 = design requirements + DOT&E doubts,
  nuclear ≠ no replenishment, Forrestal: electrical malfunction, Zuni from F-4B → A-4E tank, 134/161/21, Chief Farrier, training changes).
- `revision-v2.md`: fact-check table, editorial notes, scores. `narration.txt` regenerated. GATE passed: owner approved script v2 (2026-11-19). Next: owner records CapCut voice from narration.txt.
- 2026-11-19: owner sent the CapCut voice (10:03 + 0:33) -> `voice.wav` 10:36 raw, 1,827 words; pauses tightened to 10:14
  (`tools/shipguy_tighten.py` got `--hold A-B`: the Forrestal part 388.5-451.5 s keeps its silences). PART 1 (hook, the ship,
  the launch; 0:00-3:04): 57 beats in `beats.txt`, new `engine/shipguy/templates6.tsx` (cockpit, jetside, throttle, cv, eiffel,
  group, deck, plane, runway, cat, emals, wind) + puppet outfits `jersey` (job colour + cranial helmet) and `aviator`.
  Storyboard `videos/2026-11-19-aircraft-carrier/storyboard/p1-*.png`. GATE: owner OK on Part 1 stills.
- 2026-11-19: owner approved Part 1 stills. PART 2 (sections 3-5: meatball, LSO, wires, bolter, angled deck, barricade, jerseys,
  Pri-Fly/Air Boss, cycles; 3:04-6:15): beats 58-104 in `beats.txt`, new `engine/shipguy/templates6b.tsx`. Storyboard
  `storyboard/p2-*.png` (p2-1 also shows the end of Part 1). GATE: owner OK on Part 2 stills.
- 2026-11-20: owner approved Part 2 stills. PART 3 (sections 5b-8: Forrestal [quiet, no gags], hangar + elevators, reactors,
  replenishment at sea, life on board; 6:15-8:53): beats 105-147, new `engine/shipguy/templates6c.tsx`.
  Storyboard `storyboard/p3-*.png`. GATE: owner OK on Part 3 stills.
- 2026-11-20: owner approved Part 3 stills. PART 4 (sections 9-10: the Ford, sortie targets, the final landing, end card;
  8:53-10:16): beats 148-168, new `engine/shipguy/templates6d.tsx` (ford, sorties, finale, endcard6); `lso say=`, `wires night=1`.
  Whole video now timed: 168 beats, 10:16, avg 3.7 s. Storyboard `storyboard/p4-*.png`. GATE: owner OK on Part 4 stills,
  then SFX mix + subtitles + test render (ask first).
- 2026-11-20: owner approved Part 4 stills. Sound: new procedural SFX in `audio/sfx.py` (jet, hiss, twang, zap) + carrier rules in
  `tools/shipguy_mix.py` (Forrestal cuts at whoosh 0.15, no comic sounds). `mix.wav` voice + SFX only (no music), 362 events,
  -15.0 LUFS / -1.4 dBTP. Subtitles: 209 cues (`subs.json`). GATE: ask owner before test/full render.
- 2026-11-20: owner OK'd a test -> `videos/2026-11-19-aircraft-carrier/out/test-60s.mp4` (frames 0-1799, -14.8 LUFS, no black/frozen
  stretches). GATE: owner feedback on the test, then full render.
- DONE 2026-11-20: `videos/2026-11-19-aircraft-carrier/out/carrier-final.mp4` (1080p30, 10:16, -15.0 LUFS, peak -4.3 dBFS, 0 black,
  0 frozen; voice + SFX, no music). Upload kit: `thumbnails/thumb-C{A,B,C}.jpg` (`engine/shipguy/ThumbCarrier.tsx`),
  `aircraft-carrier.en.srt` (224 cues), `youtube-upload.txt` (title, description, 12 chapters, sources, tags, end screen).

## 2026-11-24: The Ship Guy long-form #7 "The Ship That Sank With 4,000 Luxury Cars" (Felicity Ace) — script draft v1
- Analytics (last 28 days, 22 Nov): carrier video (uploaded as "How Aircraft Carriers Stop Fighter Jets in 2 Seconds") 110 views,
  CTR 2.3%, AVD 2:26 of 10:16; money titles click best (cargo-ship cost 5.7%, $100k/day 4.2%); disaster stories hold best (Dali).
  Owner picked the Felicity Ace (disaster + money hook).
- `videos/2026-11-24-felicity-ace/script.md` (1,756 words, ~10:00) + `narration.txt`. Main source: Panama Maritime Authority report
  R-013-2022-DIAM (read in full: 3,965 vehicles / 574 EVs, alarm 08:30 deck 1, foam fans failed, abandon ship, sank 1 Mar 09:11,
  conclusions 8.1-8.16). Plus NTSB Höegh Xiamen, Stuttgart ruling May 2026, Lamborghini restart. GATE passed 2026-11-24: owner approved script v1. Next: owner records CapCut voice from narration.txt.
- 2026-11-24: owner sent the CapCut voice (one file, 10:06) -> `voice.wav`, 1,727 words; pauses tightened to 9:35.
  PART 1 (hook, the ship, the voyage; 0:00-2:04): 30 beats in `beats.txt`, new `engine/shipguy/templates7.tsx` (car carrier `Pctc`,
  generic `Car`/`CarTop` with no logos; pc, lash, route7, parade, price7, ev7, rounds, bridge7, court7). Storyboard `storyboard/p1-*.png`.
  GATE: owner OK on Part 1 stills.
- 2026-11-24 owner: "make the ship like a ship, it looks more like a box" -> `Pctc` redrawn: lower/longer profile, deck sheer from a low
  stern to a high rounded bow that leans forward, bulbous bow, curved stern, bridge house + mast, funnel aft, anchor, lifeboat, side door,
  vents; the sea now covers the hull below the waterline. Part 1 stills re-rendered (`storyboard/p1-*.png`, `ship-v2.png`).
- 2026-11-24: owner approved Part 1 (with the redrawn ship). PART 2 (sections 3-6: smoke on deck one, the foam system, abandon ship,
  rescue, why it burned, Höegh Xiamen; 2:05-5:41): beats 31-80, new `engine/shipguy/templates7b.tsx` (deckmap, lookaft, radio7, door7,
  cool7, foam, abandon, rescue, why7, xiamen). Storyboard `storyboard/p2-*.png`. GATE: owner OK on Part 2 stills.
- 2026-11-24: owner approved Part 2. PART 3 (sections 7-9: salvage + sinking + oil watch, the bill, the mystery/lawsuit/ruling;
  5:47-9:29): beats 81-115, new `engine/shipguy/templates7c.tsx` (salvage, bill, case). Storyboard `storyboard/p3-*.png`.
  GATE: owner OK on Part 3 stills.
- 2026-11-24: owner approved Part 3. PART 4 (sections 10-11: Fremantle Highway [quiet], new guidance/rules, back to 8:30, end card;
  8:34-9:36): beats 116-130, new `engine/shipguy/templates7d.tsx` (fremantle, rules, future, endcard7). Whole video timed: 130 beats,
  9:36, avg 4.4 s. Storyboard `storyboard/p4-*.png`. GATE: owner OK on Part 4, then SFX + subtitles + test render (ask first).
- 2026-11-24: owner approved Part 4. Sound: Felicity Ace rules in `tools/shipguy_mix.py` (Fremantle cuts soft, no comic sounds there);
  `mix.wav` voice + SFX only, 316 events, -15.1 LUFS / -1.4 dBTP. Subtitles: 208 burned-in cues (`subs.json`), YouTube file
  `felicity-ace.en.srt` (219 cues). GATE: ask owner before test/full render.
- 2026-11-24: owner OK'd a test -> `videos/2026-11-24-felicity-ace/out/test-60s.mp4` (frames 0-1799, -14.9 LUFS, no black/frozen).
  GATE: owner feedback, then full render.
- 2026-11-24 owner on the test: "the audio is not smooth, it is cutting"; court visual didn't match "a court still couldn't say what
  started the fire"; Ship Guy standing in the sea (shoebox shot); cars driving over the water (ramp shot). Fixes: pause trimming much
  gentler (`--max 1.1 --keep 0.8`: only 9 gaps, voice 10:00, natural ~0.75 s sentence pauses kept; earlier 0.6/0.4 cut 70 gaps);
  new courtroom (judge, gavel, board "WHAT STARTED THE FIRE?" / "WHO IS TO BLAME?"); `Quay` added: Ship Guy + cars on a quay, stern
  ramp now lowers down onto it. Re-timed, re-mixed, subs rebuilt -> `out/test-60s-v2.mp4` (-14.9 LUFS).
  Lesson: keep CapCut's natural sentence pauses; only trim the really long gaps.
- 2026-11-24 owner: "make parts for better control, make the part2" -> rendering the video part by part (frame ranges from the
  timeline: P1 0-3945, P2 3946-10868, P3 10869-16059, P4 16060-18034). `out/part2.mp4` (3:51, -15.0 LUFS, no black/frozen).
  Note: `npm run cleanup` deletes `.cache/bundle`; rebundle before the next part render.
- 2026-11-24 owner flagged 8 Part 2 shots ("visual and animation need to be fixed"): redrawn with more motion. Puppet: new props
  radio / binoculars / mic / hose, new outfit "fire" (fire helmet, breathing mask, air-tank straps, tan suit). Shots: bridge interior
  with an officer scanning aft; radio call with the sailor walking down stairs; firefighters walking to a smoking door; boundary cooling
  (top deck hosed, steam, fire below); foam diagram on dark bg with pump + growing foam; bridge alarm + smoke + radio call; captain on the
  PA handset with crew in life jackets running; ladder with crew climbing down in turn, boat filling, counter. `out/part2.mp4` v2
  (3:51, -15.0 LUFS, no black/frozen). Lesson: crew on ships use radios, not phones.
- 2026-11-24 owner: binoculars looked like a mask, radios covered faces, extinguisher floated by the head -> officer scans with arms
  folded (eyes move), radios held below the chin (armR [40,128]), new `extinguisher` prop held at the side. `out/part2.mp4` v3.
  Lesson: never put a held prop over the face; check props against the head in a full-size still.
- 2026-11-24: `out/part3.mp4` (2:53, -15.2 LUFS, no black/frozen). Fixed before sending: judge's robe started too high (looked like
  a beard) -> robe from the collar + white collar; removed the caption on the "who was to blame?" court shot (the board already says it).
- 2026-11-25: `out/part4.mp4` (1:06, -15.4 LUFS, no black/frozen). Remaining: full Part 1 render (0-3945), then join P1-P4.
- 2026-11-25: `out/part1.mp4` (2:11, -15.0 LUFS, no black/frozen). Fixed before sending: safety-rounds sailor held a phone -> new
  `torch` prop with the beam from it; the clock now follows the spoken "one / five / seven" (word timings); "~3,500 nautical miles" and
  "(insurance analyst estimate)" moved off the subtitles. All 4 parts rendered; next: join into the final video.
- DONE 2026-11-25: `videos/2026-11-24-felicity-ace/out/felicity-final.mp4` (1080p30, 10:01, 18,035 frames = parts 1-4 joined by stream
  copy + the full mix.wav as audio; -15.1 LUFS, peak -1.2 dBFS, 0 black, 0 frozen). Upload kit: `thumbnails/thumb-F{A,B,C}.jpg`
  (`engine/shipguy/ThumbFelicity.tsx`, Ship Guy in a boat, not in the sea), `felicity-ace.en.srt`, `youtube-upload.txt`
  (title, description, 12 chapters, key facts, sources, tags, end screen).
