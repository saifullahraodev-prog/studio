# Trench Trap shots in Blender (same names as the three.js cut templates in engine/shots/cuts.tsx).
# Coordinates: metres, Z up; trench along +Y (corner/back wall at y = -6), no-man's-land on +X.
# Each shot: fn(n) builds actors + camera for an n-frame cut (frames 1..n) and returns the camera.
import bpy, math
import studio_bl as S
import studio_chars as C

D = S.T["D"]
CRATERS = [(6, 4, 1.6), (11, -3, 2.2), (9, 12, 1.8), (16, 6, 2.6), (20, -7, 2.0), (-7, 3, 1.5), (-12, 10, 2.2), (14, 20, 2.4), (5, 24, 1.3)]


def H(x, y):
    return S._height(x, y, CRATERS)


def world():
    S.sky("lilienstein_4k.hdr", 1.0, rot=1.2)
    S.sun(elev=68, azim=185, energy=4.0)
    # soft sky bounce inside the trench (real trenches are lit by the bright sky above them)
    bpy.ops.object.light_add(type="AREA", location=(0, 8, S.T["D"] + 1.2))
    a = bpy.context.object
    a.data.shape = "RECTANGLE"
    a.data.size, a.data.size_y = 1.6, 40.0
    a.data.energy = 900
    a.data.color = (0.85, 0.9, 1.0)
    S.build_trench()
    S.dress(H)


def cam_keys(cam, keys):
    """Animate a camera: keys = [(frame, loc, target)] (target via the aim empty)."""
    aim = cam.constraints["Track To"].target
    for f, loc, tgt in keys:
        cam.location = loc
        cam.keyframe_insert("location", frame=f)
        aim.location = tgt
        aim.keyframe_insert("location", frame=f)


# ── line 1: "Enemy soldiers have you cornered in your own trench," ─────────────
A_CAM = ((17.5, 2.6, D + 4.6), (2.5, 1.0, D - 0.2))


def enemies_close_in(n):
    """High, behind the enemy: six soldiers with rifles walk in on the trench; barrels in the foreground."""
    for pid, x, y, rz in [("wooden_barrels_01", 14.6, 3.8, 0.6), ("wooden_military_crate", 15.2, 5.4, -0.3), ("ammo_box", 14.9, 1.9, 1.1)]:
        S.prop(pid, (x, y, H(x, y) - 0.03), rz)
    for x, y, off in [(8.6, 1.0, 0), (9.6, 3.2, 9), (8.0, -1.4, 17), (10.4, -0.4, 5), (11.2, 4.6, 24), (12.0, -2.6, 13)]:
        C.soldier("Walk With Rifle", (x, y, H(x, y) - 0.02), rot_z=-math.pi / 2, who="enemy", uniform="fieldgrey", expr="angry",
                  helmet_kind="stahl", offset=off, run_dir=(-1, 0), frames=(1, n), weapon="rifle")
    cam = S.camera(*A_CAM, lens=30, fstop=5.6, focus=10.0)
    cam_keys(cam, [(1, A_CAM[0], A_CAM[1]), (n, (16.6, 2.4, D + 4.3), (2.5, 1.0, D - 0.2))])  # slow push-in
    return cam


B_CAM = ((-0.35, -2.2, 1.05), (0.3, -5.6, 1.75))


def you_trapped(n, dive=15):
    """You, cornered at the end of the trench, cowering; rifles pop up over every lip and aim down.
    The first `dive` frames: the camera swoops down from the high shot into the trench."""
    C.soldier("Terrified", (0.3, -5.35, 0.06), rot_z=math.pi, who="tommy", uniform="khaki", expr="scared", helmet_kind="brodie",
              frames=(1, n), offset=60)
    for i, (x, y, rz, d) in enumerate([(1.55, -4.2, math.pi / 2, 4), (-1.5, -3.3, -math.pi / 2, 9), (0.2, -7.1, 0.0, 14), (1.6, -2.0, math.pi / 2 + 0.2, 19)]):
        f0 = dive + d
        path = [(1, (x, y, D - 1.6)), (f0, (x, y, D - 1.6)), (f0 + 7, (x, y, D))]
        C.soldier("Rifle Aiming Idle", (x, y, D), rot_z=rz, who="enemy", uniform="fieldgrey", expr="angry", helmet_kind="stahl",
                  frames=(1, n), offset=i * 17, weapon="rifle", path=path)
    cam = S.camera(*B_CAM, lens=26, fstop=4.0, focus=3.5)
    cam_keys(cam, [(1, A_CAM[0], A_CAM[1]), (dive, B_CAM[0], B_CAM[1]), (n, (-0.32, -2.5, 1.05), (0.3, -5.6, 1.8))])
    for fc in cam.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = "BEZIER"
            kp.easing = "EASE_IN_OUT"
    bpy.context.scene.render.use_motion_blur = True  # the dive smears like a real fast camera move
    bpy.context.scene.render.motion_blur_shutter = 0.6
    return cam


SHOTS = {"enemies-close-in": enemies_close_in, "you-trapped": you_trapped}
