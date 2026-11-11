# Blender test: the 3 test shots (docs/blender-test-plan.md), stills or frame ranges.
# usage: blender -b --factory-startup -P blender/test_shots.py -- <shot A|B|C> <outdir> <frame|start-end> [samples]
import bpy, sys, os, time, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import studio_bl as S
import studio_chars as C
import studio_fx as FX

args = sys.argv[sys.argv.index("--") + 1:]
shot, out, frames = args[0], os.path.abspath(args[1]), args[2]
samples = int(args[3]) if len(args) > 3 else 48
os.makedirs(out, exist_ok=True)

S.reset()
S.render_setup("CYCLES", 540, 960, samples)
S.sky("lilienstein_4k.hdr", 1.0, rot=1.2)
S.sun(elev=55, azim=200, energy=3.6)
S.build_trench()
craters = [(6, 4, 1.6), (11, -3, 2.2), (9, 12, 1.8), (16, 6, 2.6), (20, -7, 2.0), (-7, 3, 1.5), (-12, 10, 2.2), (14, 20, 2.4), (5, 24, 1.3)]
H = lambda x, y: S._height(x, y, craters)
S.dress(H)
D = S.T["D"]
sc = bpy.context.scene
sc.frame_start, sc.frame_end = 1, 90

if shot == "A":
    # high, behind the enemy: soldiers with rifles cross no-man's-land toward the trench
    for i, (x, y, off) in enumerate([(9.5, 1.0, 0), (10.8, 3.2, 7), (11.4, -1.4, 13), (12.6, 1.6, 4), (13.8, 4.6, 10), (14.6, -0.6, 16)]):
        C.soldier("Rifle Run", (x, y, H(x, y) - 0.02), rot_z=-math.pi / 2, who="enemy", uniform="fieldgrey", expr="angry",
                  helmet_kind="stahl", offset=off, travel=(-2.6, 0, 0), frames=(1, 90), weapon="rifle")
    S.camera((19.5, 3.0, D + 4.2), (4.0, 1.4, D + 0.2), lens=32, fstop=4.0, focus=10.0)
elif shot == "B":
    # low from the trench floor: the flamethrower man leaps onto the lip against the sky
    path = [(1, (3.6, 0.4, D)), (9, (2.4, 0.4, D + 0.8)), (17, (1.3, 0.4, D + 0.05)), (90, (1.25, 0.4, D + 0.05))]
    C.soldier("Rifle Run", (3.6, 0.4, D), rot_z=-math.pi / 2, who="flamer", uniform="fieldgrey", expr="angry", helmet_kind="stahl",
              frames=(1, 90), weapon="lance", tanks=True, path=path)
    S.camera((-0.45, -1.6, 0.55), (1.4, 0.4, D + 1.0), lens=20, roll=0.08)
elif shot == "P":
    # portrait check: face, outline, helmet, mittens
    C.soldier("Rifle Aiming Idle", (1.3, 12.6, D), rot_z=-0.4, who="enemy", uniform="fieldgrey", expr="angry", helmet_kind="stahl", frames=(1, 90), weapon="rifle", offset=20)
    S.camera((3.4, 10.8, D + 1.15), (1.2, 12.3, D + 0.95), lens=40)
elif shot == "C":
    # along the trench: fire pours down it, the hero ducks at the far end (fire added in step 4)
    C.soldier("Idle Crouching", (0.05, -4.6, 0.08), rot_z=0.0, who="tommy", uniform="khaki", expr="scared", helmet_kind="brodie", frames=(1, 90))
    # the flamethrower man on the right lip, hosing the trench toward the far end
    C.soldier("Firing Rifle", (1.35, 7.0, D), rot_z=0.25, who="flamer", uniform="fieldgrey", expr="angry", helmet_kind="stahl",
              frames=(1, 90), weapon="lance", tanks=True)
    FX.fire_jet((1.05, 6.2, D + 1.0), (0.0, -1.5, 0.5), f0=10, grow=8)
    FX.floor_fire((0.0, 0.0, 0.0), f0=16, n=6, spread=2.5)
    S.camera((-0.35, 11.5, 1.45), (0.2, -3.0, 1.0), lens=24, fstop=6.3, focus=12.0)

if "-" in frames:
    a, b = map(int, frames.split("-"))
    sc.frame_start, sc.frame_end = a, b
    sc.render.filepath = os.path.join(out, f"shot{shot}_")
    sc.render.image_settings.file_format = "PNG"
    t0 = time.time()
    bpy.ops.render.render(animation=True)
    print(f"RENDER {shot} frames {a}-{b} {time.time() - t0:.1f}s")
else:
    sc.frame_set(int(frames))
    sc.render.filepath = os.path.join(out, f"shot{shot}-f{frames}.png")
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    print(f"RENDER {shot} f{frames} {time.time() - t0:.1f}s")
