# Render a video's cuts in Blender from its scenes.json (same cut timings as the three.js version).
# usage: blender -b --factory-startup -P blender/render_video.py -- <slug> <mode> [cut indices, e.g. 0,1]
#   mode: stills  = one frame from the middle of each cut (cheap check for approval)
#         preview = all frames, half size, 6 samples (motion check, ~4 s/frame)
#         final   = all frames, 540x960, 48 samples
# Frames go to out/blender/<slug>/cut<NN>_####.png; tools/blender_video.py joins them into
# public/videos/<slug>/blender.mp4 for the BlenderShort composition (captions + sound on top).
import bpy, sys, os, json, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import studio_bl as S
import shots_trench as T
import shots_trench_b as TB
T.SHOTS.update(TB.SHOTS_B)
import studio_chars as CH

args = sys.argv[sys.argv.index("--") + 1:]
slug, mode = args[0], args[1]
only = [int(x) for x in args[2].split(",")] if len(args) > 2 else None
data = json.load(open(os.path.join(S.ROOT, "public", "videos", slug, "scenes.json"), encoding="utf-8"))
fps = data["fps"]
cuts = [c for b in data["beats"] for c in b["cuts"]]
out = os.path.join(S.ROOT, "out", "blender", slug + ("-preview" if mode == "preview" else ""))
os.makedirs(out, exist_ok=True)

for i, c in enumerate(cuts):
    if only is not None and i not in only:
        continue
    fn = T.SHOTS.get(c["shot"])
    n = max(1, round(c["end"] * fps) - round(c["start"] * fps))
    if not fn:
        print(f"SKIP cut {i} {c['shot']}: no Blender version yet")
        continue
    S.reset()
    CH._mats.clear()  # material cache points into the old scene's data
    sc = bpy.context.scene
    if mode == "final":
        S.render_setup("CYCLES", 540, 960, 32)
    else:
        S.render_setup("CYCLES", 540, 960, 6 if mode == "preview" else 24)
        if mode == "preview":
            sc.render.resolution_percentage = 50
    sc.render.fps = fps
    T.world()
    fn(n)
    sc.frame_start, sc.frame_end = 1, n
    t0 = time.time()
    if mode == "stills":
        sc.frame_set(max(1, n // 2) if c.get("tr") != "dive" else max(1, n - 5))
        sc.render.filepath = os.path.join(out, f"still{i:02d}_{c['shot']}.png")
        bpy.ops.render.render(write_still=True)
    else:
        sc.render.filepath = os.path.join(out, f"cut{i:02d}_")
        sc.render.image_settings.file_format = "PNG"
        sc.render.use_overwrite = False  # resumable: frames already on disk are skipped
        sc.render.use_placeholder = True
        bpy.ops.render.render(animation=True)
    print(f"RENDER cut {i} {c['shot']} ({n} frames, {mode}) {time.time() - t0:.0f}s")
