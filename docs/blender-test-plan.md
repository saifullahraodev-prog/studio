# Blender test: plan

**Goal:** find out, with ONE short shot, whether Blender gets the studio close to the
production quality of the reference channel (Circle Toon History): dense detailed sets,
realistic water, fire and glow, cinematic light. The characters stay ours.

**If yes:** the studio pipeline (scene files, Whisper timings, sound, captions) moves to
Blender step by step. **If no:** we compare with Unreal Engine 5 plus a better graphics card.

---

## 1. The test shot

| | |
|---|---|
| Length | 5 seconds (150 frames, 30 fps) |
| Format | 1080×1920 vertical (preview at 540×960) |
| Story | Night. Your **stoker** stands on a busy ship deck; a cargo hatch behind him bursts into fire; he **drops his shovel and runs** toward the camera. |
| Camera | Low angle, slow push-in, a small shake when the fire bursts, shallow depth of field |
| Must contain | detailed deck (planks, rails, ropes, crates, barrels, lanterns, funnel/mast), real ocean with waves, fire + smoke + orange glow on the character and deck, moonlit sky, our round comic face |

The same shot is also rendered as a still at three moments (0.5 s, 2.5 s, 4.5 s) for side-by-side
comparison with reference frames.

## 2. Success criteria (score each 1–5, compare side by side with the reference)

1. **Set density:** the frame looks full and real, not empty.
2. **Water:** waves, foam, reflections.
3. **Fire/smoke:** looks volumetric and lights the scene.
4. **Lighting:** soft shadows, warm/cool contrast, depth (haze, depth of field).
5. **Character fits the world:** lit by the same light, grounded (shadows, contact).
6. **Motion:** the drop-and-run feels natural (mocap), the camera feels cinematic.
7. **Render time per frame** on your laptop (must fit a weekly video schedule).

Pass = average 4 or more, with nothing below 3.

## 3. What you need

### Software (free)
- **Blender 4.5 LTS** (about 400 MB). Long-term support, so the scripts stay stable.
- Nothing else is required. Optional: the **BlenderKit** add-on (free account) for more assets.

### Assets (all free; licence written into `CREDITS.md`)
| What | Where | Licence to check |
|---|---|---|
| Ship / deck | Sketchfab (filter: downloadable, CC0 or CC-BY) or BlenderKit free | CC0 / CC-BY (credit in description) |
| Props: crates, barrels, ropes, lanterns | Poly Haven models | CC0 |
| Wood, metal, rope textures | Poly Haven / ambientCG (already used in studio) | CC0 |
| Night sky | Poly Haven HDRI (moonlit / night) | CC0 |
| Ocean | Blender's built-in **Ocean** modifier | — |
| Fire + smoke | Blender's built-in fire/smoke simulation (Mantaflow), small and baked once | — |
| Character body + animation | **Mixamo** (you already use it): stoker body + "Terrified", "Running", "Drop object" clips | Mixamo terms (free for videos) |
| Face | our existing face sprites from `public/characters/faces/` | ours |

Downloads that need an account (Mixamo, Sketchfab, BlenderKit) are done by you; Claude
gives you the exact list and file names first.

### Hardware (your laptop: i5-10300H, 16 GB RAM, Quadro P620 2 GB)
- Render engine **Eevee** (fast, real time). The 2 GB graphics memory is the limit, so keep
  textures at 2K, volumetrics at medium, and simulations small.
- Fallback: **Cycles on the CPU** for the final if Eevee runs out of graphics memory (slower, but works).
- Expected: preview frame 2–10 s, final frame 10–40 s → 5-second shot ≈ 25–100 min for the final.
  Step 0 measures the real numbers.

## 4. Who does what

| You | Claude |
|---|---|
| Install Blender | Writes all Python scripts (no clicking needed) |
| Download assets that need an account (list from Claude) | Imports, scales and places assets; materials; lights; ocean; fire setup |
| Choose between options Claude shows | Character: Mixamo body + our face on the head + animation clips |
| Judge the side-by-side sheets and score them | Camera moves, depth of field, render settings |
| Approve each step | Headless renders (`blender -b … -P script.py`), contact sheets, side-by-side with reference frames, timing measurements |

Claude can't see the Blender window; it checks everything through rendered stills and frame
strips. Small, fast preview stills keep that loop quick.

## 5. Steps (each ends with stills for you to approve)

**Step 0: setup and speed check (½ session)**
- Install Blender 4.5 LTS; Claude runs a headless test render (cube + light + a volume).
- Measure seconds per frame for Eevee and Cycles at 540×960 and 1080×1920.
- Stop if Eevee can't render at all → go straight to the Cycles-on-CPU plan or a cloud GPU.

**Step 1: the set, no character (1 session)**
- Ship deck asset + props layout (layered: foreground props / middle deck / background funnel and sea).
- Ocean modifier, night HDRI sky, moonlight, lanterns, haze.
- Deliverable: 3 still angles + side-by-side with 3 reference frames. **Your score for set, water, light.**

**Step 2: the character (1 session)**
- Mixamo stoker body imported; round head with our comic face sprite; cap and gloves.
- Animation: idle → "drop object" → "running", blended; shovel attached to the hand, falls with physics or a keyed drop.
- Deliverable: 3 stills + a 540×960 frame strip (every 3rd frame). **Your score for fit and motion.**

**Step 3: fire, camera, preview (1 session)**
- Fire + smoke simulation in the hatch (small, baked once), orange light that flickers with it.
- Camera: low angle, push-in, shake on the burst, depth of field on the face.
- Deliverable: 540×960 preview video (5 s) + render time.

**Step 4: final and decision (½ session)**
- 1080×1920 final (overnight if needed), one sound mix with the existing studio sound tools.
- Side-by-side sheet: ours vs reference vs our current three.js look.
- **Decision:** move to Blender / try Unreal / keep three.js.

About **4 sessions** in total.

## 6. Folder layout (inside the studio repo)

```
studio/
└── blender/
    ├── test-01/
    │   ├── build_scene.py      # builds the whole shot from scratch (assets, set, light, ocean, fire, camera)
    │   ├── character.py        # Mixamo body + our face + animation clips
    │   ├── render.py           # preview / final settings, stills, frame strips
    │   ├── shot.json           # shot data: timings, camera keys, which assets
    │   └── out/                # renders (git-ignored)
    └── assets/                 # downloaded assets (git-ignored, listed in CREDITS.md)
```

Everything is rebuilt from scripts, so a change means "edit the script, re-run", not
hand-editing a .blend file. That is what lets Claude do the work and keeps results repeatable.

## 7. Risks and fallbacks

| Risk | Fallback |
|---|---|
| 2 GB graphics memory too small for Eevee volumetrics | Lower settings; fire as a baked image sequence; Cycles on CPU for the final |
| Fire simulation too slow to bake | Smaller domain, or a free CC0 fire flipbook on a card |
| No good free ship asset | Combine a simpler ship with dense Poly Haven props; or one paid asset (ask first) |
| Face looks pasted on | Face as a decal with the scene's light and a slight sheen (the studio's v1.3 face trick) |
| Asset licences | Only CC0 / CC-BY; every file in `CREDITS.md` with author and link |

## 8. Keep it ours

The reference is for **production quality** only: sets, water, fire, light, camera.
Our characters (round comic faces, the Inspector with glasses, white gloves), our topics
("Rules written in disaster") and our own stories and shots stay ours. No copied story, shots or
character design.

## 9. Prompt to start the test with Claude (in the studio project)

> Read `docs/blender-test-plan.md`. We are doing Step 0 only: give me the exact Blender 4.5 LTS download
> to install, then write a headless test script that renders a cube with a light and a smoke volume
> with Eevee and Cycles at 540×960 and 1080×1920, and report the seconds per frame. Don't change the
> three.js engine. Stop after Step 0 and show me the results.
