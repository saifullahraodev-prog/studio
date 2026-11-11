# Blender test, step 1: the trench world only, stills from the 3 test cameras.
# usage: blender -b --factory-startup -P blender/test_world.py -- <outdir> [EEVEE|CYCLES]
import bpy, sys, os, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import studio_bl as S

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
out = os.path.abspath(args[0] if args else "out/blender")
engine = args[1] if len(args) > 1 else "CYCLES"
os.makedirs(out, exist_ok=True)

S.reset()
S.render_setup(engine, 540, 960, 48)
S.sky("lilienstein_4k.hdr", 1.0, rot=1.2)
S.sun(elev=50, azim=40, energy=3.5)
ground = S.build_trench()
craters = [(6, 4, 1.6), (11, -3, 2.2), (9, 12, 1.8), (16, 6, 2.6), (20, -7, 2.0), (-7, 3, 1.5), (-12, 10, 2.2), (14, 20, 2.4), (5, 24, 1.3)]
S.dress(lambda x, y: S._height(x, y, craters))

D = S.T["D"]
cams = {
    "A": dict(loc=(15.0, 4.0, D + 5.0), target=(1.0, 2.0, D - 0.3), lens=30),
    "B": dict(loc=(-0.45, -0.6, 0.6), target=(1.2, 0.4, D + 1.2), lens=20),
    "C": dict(loc=(0.4, 10.0, 1.3), target=(0.0, -3.0, 0.9), lens=24),
}
for k, c in cams.items():
    cam = S.camera(c["loc"], c["target"], c["lens"])
    bpy.context.scene.render.filepath = os.path.join(out, f"world-{k}.png")
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    print(f"RENDER {k} {engine} {time.time() - t0:.1f}s")
