# How We Ended Up: production kit v0.1

Built on 2026-11-15 on top of the approved look (`docs/howwe-visual-direction.md`, `engine/howwe/style-v1.0.json`).

**A video is a scene list (data). The kit turns it into frames.** About 80% of every video comes from the templates below. New topics mostly add *objects*, *rooms* and *costumes*, not new code.

## Files
| File | What it holds |
|---|---|
| `engine/howwe/kit.tsx` | Tokens (from style JSON), Gallery/Pillar/Plinth/LabelCard/Headline/Subtitle/ThenTint/RoomSign, PlasterHand, faceless `Figure` (poses + blending), `WorldMap` (Natural Earth, per-category opacity), `projectEE` |
| `engine/howwe/motion.tsx` | Easing, `prog`, `loop`, `TIMING` (all motion durations), `Cam` (drift + push-in) |
| `engine/howwe/objects.tsx` | Object library `OBJECTS` + `<Exhibit>`, which stands any object ON a plinth top and rises in |
| `engine/howwe/rooms.tsx` | Room library: `EuropeRoom`, `ChinaRoom` (c.1500, placeholders), `TodayRoom`. People loop when given `f`. |
| `engine/howwe/templates.tsx` | The 7 scene templates (below) |
| `engine/howwe/video.tsx` | `HowVideo` composition: plays a scene list with the transitions |
| `engine/howwe/demo-scenes.json` | Kit demo (placeholder text, not video 1) |
| `tools/howwe_storyboard.mjs` | Storyboard stills: contact sheets of scenes and transitions (no video render) |
| `tools/howwe_map.py` | Natural Earth to projected map data |

## Scene list format
```json
{ "scenes": [
  { "t": "exhibits", "dur": 210, "in": "dolly", "p": { ...template props... } }
] }
```
- `t` is the template name. `dur` is the length in frames at 30 fps.
- `in` is the transition *into* this scene:
  - `cut`;
  - `dolly` (22 frames, sideways past a pillar);
  - `door` (20 frames, push in plus an aged-paper wash).
- A transition overlaps the end of the previous scene.
- Map data can be referenced by name, e.g. `"cats": "@EATING_PLACEHOLDER"`, passed in the composition's `cats` prop.

## Templates
| `t` | Use for | Main props |
|---|---|---|
| `exhibits` | Here vs There objects, 1–3 equal plinths | `tag`, `word`, `pillar`, `items[{obj, meta, name, sub}]`, `focus` (index to push in on), `focusAt` (0–1), `subtitle`, `source` |
| `period` | History: one diorama room, or a split of two rooms in the Then tint | `left`, `leftSign`, `right?`, `rightSign?`, `washIn`, `subtitle` |
| `map` | Frame push into a wall map; categories fill in `order`; optional routes | `tag`, `title`, `cats`, `order`, `legend[{cat,label}]`, `routes[{from:[lon,lat], to, at}]` |
| `reveal` | The once-per-video spotlight reveal | `line`, `answer{meta,name,sub}`, `left`/`right` side exhibits |
| `cardFlip` | Myth-check: "The story you heard" flips to "Correction" | `heard`, `actual`, `source` |
| `today` | Modern table, people eating with forks | `subtitle` |
| `titleWall` | Channel title plus the video's question | `question` |

**Built-in timings** (`TIMING` in `motion.tsx`):

| Action | Frames |
|---|---|
| Exhibit rise (small overshoot) | 12 |
| Card prints on, after its exhibit | 6 later, lasts 10 |
| Gap between exhibits | 14 |
| Era tint wash | 15 |
| Map category fill | 20, every 26 frames |
| Lights down | 10 |
| Lights back up | 20 (finished before the outgoing transition) |

Every scene also drifts slowly (+1.5% per 5 s).

## Libraries
- **Objects** (`OBJECTS`): fork, knife, spoon, chopsticks, plate, bowl, hand (plaster cast), teacup, cleaver, bread.
- **Rooms:** europe1500, china1500, today. All costumes, rooms and dates are placeholders until they're drawn from references.
- **Figure poses:** stand, greet, point, fork/forkDown, eatHand/handDown, knife/knifeCut, bowl/bowlDown, chop/chopUp. Animate with `pose`, `pose2` and `mix` (0–1, e.g. `loop(f, 54)`).
- **Outfits:** tee, cardigan, euMan, euWoman, ming, saree, cook.

## Commands
```
node tools/howwe_storyboard.mjs engine/howwe/demo-scenes.json docs/howwe/kit-v0.1 --rebundle
node tools/still.mjs HowVideo out/x.png --frame=300
node tools/golden.mjs check howwe
node tools/run.mjs render src/index.ts HowVideo out/howwe/x-720p.mp4 --width=1280 --height=720 --concurrency=2   # owner OK first
```
A full video render (`HowVideo`) needs the owner's OK first (standing rule: stills first).

## Sound kit (added 2026-11-15)
All sounds are made in code (`audio/howwe_sfx.py`, no downloads, no licences). The identity is a calm museum, deliberately different from Ship Guy's plucky comedy.

**Sounds:**
- footsteps (dolly);
- door (doorway transition);
- place (exhibit lands);
- paper (card prints, tint wash);
- flip (card flip, answer card);
- clunk (lights down/up) plus a whisper-quiet spotlight hum;
- air (camera push);
- chime (rising D–F#–A–D as map categories fill; title wall);
- pen (map route);
- clink (Today room forks);
- chop (period kitchen);
- room tone.

**Music bed** (`music(duration, hush, style)`), always *under* the voice:
- **A · `piano`** (default): "Gallery piano". Felt piano and warm strings, 72 bpm, Dm–B♭–F–C. Calm, curious, premium.
- **B · `pizz`**: "Quiet curiosity". Sparse pizzicato, celesta and a soft pad, 84 bpm, F–Dm–B♭–C.
- `marimba`: the v0 bed, kept for reference. The owner said it was the wrong mood.

The music "hushes" (melody and bass out, pad softened) while the reveal lights are down.

**Levels** (v2, after owner feedback that v1 was too loud):
- Effects peak about 8 dB under the voice.
- Music sits about 20 dB under the voice while it speaks, and about 15 dB under in the gaps.

**Placeholder narration:**
- `python -I tools/howwe_voice.py <scenes.json> <slug>` speaks each scene's `say` line with the Piper Ryan voice (already in the studio).
- Each line starts 6 frames after the scene's transition. The tool warns when a line is longer than its scene.
- Output: `public/howwe/<slug>/voice.wav`. It's a placeholder only; the real narration replaces it.

**Real music (preferred):** use YouTube Audio Library tracks, one per mood (`--music "curious=…,soft=…,sparse=…"`). Details and the chosen tracks: `docs/howwe-sound-sources.md`. The synthesized beds are only a fallback.

**Auto mix:** `python -I tools/howwe_mix.py <scenes.json> <slug> [--voice voice.wav] [--music piano|pizz] [--out name.wav]`.
- It places every cue from the scene list using the same timings as the animation. Keep `TIMING` in both files in sync.
- It ducks the music under the voice.
- Two-pass loudness to −14 LUFS, true peak −1.5 dB. With voice it lands around −15, because the peak limit holds it back.
- Output: `public/howwe/<slug>/mix.wav` (git-ignored, rebuild any time) and `cues.json`, the list of every cue for review.
- Hook the mix into the video with the `audio: "howwe/<slug>/mix.wav"` prop on `HowVideo`.

If only the sound changed, lay the new mix onto an existing render instead of re-rendering:
`ffmpeg -i video.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -shortest out.mp4`

## Rules
1. Values only come from `style-v1.0.json`.
2. Add an object or room by drawing it from a documented reference, and log that reference in the video folder.
3. Split colours belong to screen position, never to a culture.
4. Run `node tools/golden.mjs check howwe` after any kit change.

## Known gaps (next)
- Subtitles are one line per scene. Word-timed subtitles come with the voice pipeline.
- Only 3 rooms and 10 objects so far. Video 1 research decides what's added next.
- Render speed (measured 2026-11-15): about 2.6 s per second of video at 720p, so a 12-minute video takes about 31 min. 1080p hasn't been measured yet.
