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
```
A full video render (`HowVideo`) needs the owner's OK first (standing rule: stills first).

## Rules
1. Values only come from `style-v1.0.json`.
2. Add an object or room by drawing it from a documented reference, and log that reference in the video folder.
3. Split colours belong to screen position, never to a culture.
4. Run `node tools/golden.mjs check howwe` after any kit change.

## Known gaps (next)
- No sound yet. Planned: footsteps, door, light clunk, card thunk, room tone, music bed.
- Subtitles are one line per scene. Word-timed subtitles come with the voice pipeline.
- Only 3 rooms and 10 objects so far. Video 1 research decides what's added next.
- A full-motion preview render hasn't been done yet, so render time is unmeasured.
