# Blender test: plan (updated for the trench reference)

**Goal:** find out, with ONE short test sequence, whether Blender gets the studio close to the
production quality of the reference channel (Circle Toon History), measured against the Short
the owner is testing now: **"The Smartest Flamethrower Trench Trick"**
(youtube.com/shorts/Q0g-PUwRfTw, 18 s).

What that reference does (frames sampled every 0.75 s):
- **Set:** WW1-style trench: muddy, cratered ground; wooden plank walls; sandbags; barbed wire;
  timber posts; pine forest and a bright blue sky with clouds behind. Sunny daylight, soft shadows,
  near-photoreal materials.
- **Characters:** chubby soldiers, round white heads with simple faces, realistic helmets
  (Allied + German), uniforms and webbing, motion capture.
- **Shots:** a new shot about every 0.7 s: high wide shots of enemies crossing no-man's-land,
  low close-ups in the trench, the flamethrower man on the trench edge against the sky,
  fire jet + explosion flash, stagger, machine-gun close-ups.
- **Captions:** one big white word per spoken word.

**If the test passes:** the studio pipeline (scene files, Whisper timings, sound, captions) moves
to Blender step by step, starting with the Trench Trap. **If not:** compare with Unreal Engine 5
plus a better graphics card.

---

## 1. The test sequence: 3 shots, about 6 seconds (Trench Trap lines 1 and 3)

| # | Length | Shot | Tests |
|---|---|---|---|
| A | ~2 s | **Enemies advance.** High wide angle over no-man's-land: 5–6 enemy soldiers run toward the trench with rifles; craters, wire, posts; forest + sky behind. Slow push-in. | terrain, depth, crowd of characters, sky/forest |
| B | ~1.5 s | **Flamethrower man leaps up.** Low angle from inside the trench: he jumps onto the trench edge against the bright sky, tanks on his back, lance in his hands. | character close-up quality, mocap jump, sky light, our face |
| C | ~2.5 s | **Fire down the trench.** Side view along the trench: a fire jet shoots down it, flames roll along the planks, orange light and smoke, small camera shake; the hero ducks at the far end. | fire/smoke, firelight on set and characters, trench set detail |

- Format: 1080×1920 vertical, 30 fps (previews at 540×960).
- Cuts between shots are hard cuts, like the reference.
- Sound: the owner's existing Trench Trap recording for lines 1 and 3, plus the studio's sound
  effects (optional for the test; picture first).
- Stills at 3 moments per shot (9 in total) for side-by-side comparison with reference frames.

## 2. Success criteria (score each 1–5, side by side with the reference frames)

1. **Trench set:** mud, planks, sandbags, wire: full and real, not empty.
2. **Landscape:** no-man's-land, craters, forest and sky: depth and scale.
3. **Fire/smoke:** looks volumetric and lights the trench and characters.
4. **Lighting:** sunny daylight, soft shadows, haze in the distance, depth of field on close-ups.
5. **Characters fit the world:** same light, grounded (shadows, contact), helmets and uniforms read well.
6. **Motion:** run, leap, duck feel natural (mocap); camera feels cinematic.
7. **Render time per frame** on the laptop (must fit a weekly schedule).

Pass = average 4 or more, nothing below 3.

## 3. What you need

### Software (free)
- **Blender 4.5 LTS** (about 400 MB). Long-term support, so the scripts stay stable.
- Optional: the **BlenderKit** add-on (free account) for more assets.

### Assets (all free; licence written into `CREDITS.md`)
| What | Where | Licence |
|---|---|---|
| Trench geometry (walls, floor, parapet, duckboards) | **built by Claude's script** (planks, posts and sandbags placed procedurally along a zig-zag trench path) | ours |
| Mud, forest ground, wood planks, sandbag cloth, rusty metal textures | Poly Haven / ambientCG (studio already uses ambientCG) | CC0 |
| Sandbags, crates, ammo boxes, barrels | Poly Haven / BlenderKit free / Sketchfab | CC0 / CC-BY |
| Barbed wire + posts | built by script (curves + simple posts) | ours |
| Pine trees | BlenderKit free / Sketchfab CC0 low-poly pines, or tree cards | CC0 / CC-BY |
| Sky | Poly Haven HDRI (sunny, clouds) | CC0 |
| Fire + smoke | Blender's built-in fire/smoke simulation (Mantaflow), small, baked once | — |
| Soldiers | the studio's **ChubbyActor** (Mixamo-rigged chubby WW1 soldier) as FBX; enemy variant with the German helmet | ours / Mixamo |
| Animations | Mixamo: "Running", "Jump", "Rifle run", "Crouch/Duck", "Firing" style clips (the owner downloads) | Mixamo terms (free for videos) |
| Flamethrower (tanks + lance) | built by script from simple shapes, or a CC0/CC-BY model | ours / CC |
| Faces | our existing face sprites from `public/characters/faces/` | ours |

Downloads that need an account (Mixamo, Sketchfab, BlenderKit) are done by the owner; Claude
gives the exact list and file names first.

### Hardware (laptop: i5-10300H, 16 GB RAM, Quadro P620 2 GB)
- Render engine **Eevee** (fast). The 2 GB graphics memory is the limit: textures 2K, trees as
  low-poly or cards, volumetrics medium, simulations small.
- Fallback: **Cycles on the CPU** for the final if Eevee runs out of graphics memory.
- Expected: preview frame 2–10 s, final frame 10–40 s → the 6-second test (180 frames) ≈ 30–120 min
  final. Step 0 measures the real numbers.
- Daylight is easier on the hardware than the night/fire look: the main heavy part is shot C.

## 4. Who does what

| Owner | Claude |
|---|---|
| Install Blender | Writes all Python scripts (no clicking needed) |
| Download assets that need an account (list from Claude) | Builds the trench, wire and landscape by script; imports and places assets |
| Choose between options Claude shows | Characters: ChubbyActor FBX + our faces + Mixamo clips; flamethrower |
| Score the side-by-side sheets | Cameras, depth of field, fire, light, render settings |
| Approve each step | Headless renders (`blender -b … -P script.py`), frame strips, side-by-side sheets, timing |

Claude can't see the Blender window; it checks everything through rendered stills and frame
strips. Small, fast preview stills keep that loop quick.

## 5. Steps (each ends with stills for the owner to approve)

**Step 0: setup and speed check (½ session)**
- Install Blender 4.5 LTS; Claude runs a headless test render (ground plane + a few planks + sun + HDRI sky + a small smoke volume).
- Measure seconds per frame for Eevee and Cycles at 540×960 and 1080×1920.
- Stop if Eevee can't render at all → Cycles-on-CPU plan or a cloud GPU.

**Step 1: the world, no characters (1 session)**
- Trench by script: zig-zag path, plank walls with posts, duckboard floor, sandbag parapet, mud
  textures, puddles; no-man's-land with craters, barbed wire, posts; pine forest + sunny HDRI sky; haze.
- Deliverable: stills for the 3 camera angles (A, B, C) + side-by-side with 3 reference frames.
  **Owner scores set, landscape, light.**

**Step 2: the characters (1 session)**
- ChubbyActor FBX in Blender: Allied hero (round helmet) and German enemies (deep helmet);
  our faces on the heads; rifles; flamethrower tanks + lance.
- Animations: enemies running (shot A), leap onto the edge (shot B), hero duck (shot C).
- Deliverable: stills + 540×960 frame strips (every 3rd frame). **Owner scores fit and motion.**

**Step 3: fire, cameras, preview (1 session)**
- Fire jet from the lance + rolling flames along the trench (small baked simulation), orange
  light that flickers with it, smoke, camera shake; explosion flash option.
- Cameras: A high wide push-in, B low angle against the sky, C side view along the trench; hard cuts.
- Deliverable: 540×960 preview video (~6 s) with the owner's voice for lines 1 and 3 + render time.

**Step 4: final and decision (½ session)**
- 1080×1920 final (overnight if needed) + sound mix with the studio's sound tools.
- Side-by-side sheet: ours (Blender) vs reference vs the current three.js Trench Trap line 1/3 renders.
- **Decision:** move to Blender / try Unreal / keep three.js.

About **4 sessions** in total.

## 6. Folder layout (inside the studio repo)

```
studio/
└── blender/
    ├── test-01-trench/
    │   ├── build_world.py      # trench, wire, craters, landscape, trees, sky, light (all by script)
    │   ├── characters.py       # ChubbyActor FBX + faces + helmets + Mixamo clips + flamethrower
    │   ├── shots.py            # shots A/B/C: cameras, timings, fire, cuts
    │   ├── render.py           # preview / final settings, stills, frame strips
    │   ├── shots.json          # shot data: timings, camera keys, assets
    │   └── out/                # renders (git-ignored)
    └── assets/                 # downloaded assets (git-ignored, listed in CREDITS.md)
```

Everything is rebuilt from scripts, so a change means "edit the script, re-run", not
hand-editing a .blend file. That lets Claude do the work and keeps results repeatable.

## 7. Risks and fallbacks

| Risk | Fallback |
|---|---|
| 2 GB graphics memory too small (trees, volumetrics) | Low-poly trees / tree cards, fewer trees in view, HDRI with forest; Cycles on CPU for the final |
| Fire simulation too slow to bake | Smaller domain, or a free CC0 fire flipbook on cards along the jet |
| Script-built trench looks too clean | Displacement + mud decals + scattered debris (planks, cans, shells) by script |
| Mixamo jump doesn't land on the edge | Root-motion offset by script, or a short keyed jump on top of the clip |
| Faces look pasted on | Face as a decal lit by the scene with a slight sheen (the studio's v1.3 face trick) |
| Asset licences | Only CC0 / CC-BY; every file in `CREDITS.md` with author and link |

## 8. Keep it ours

The reference is for **production quality** only: set density, landscape, fire, light, camera.
Our own characters (round comic faces, white gloves, our helmets and colours), our topics
("Rules written in disaster") and our own script wording stay ours. The Trench Trap already
follows the reference story closely; for publishing, keep the shots and wording our own so the
channel isn't flagged as reused content.

## 9. Prompt to start the test with Claude (in the studio project)

> Read `docs/blender-test-plan.md`. We are doing Step 0 only: give me the exact Blender 4.5 LTS
> download to install, then write a headless test script that renders a ground plane with a few
> planks, a sun, an HDRI sky and a small smoke volume with Eevee and Cycles at 540×960 and
> 1080×1920, and report the seconds per frame. Don't change the three.js engine. Stop after Step 0
> and show me the results.
