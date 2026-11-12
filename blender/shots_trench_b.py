# Trench Trap shots, lines 2-6 (Blender). Same names as the approved three.js cut templates.
# Trench along +Y (back wall y = -6), side trench to -X at y -6..-3.6, no-man's-land on +X.
import bpy, math
import studio_bl as S
import studio_chars as C
import studio_fx as FX
from shots_trench import D, cam_keys

def empty_at(name, loc):
    bpy.ops.object.empty_add(location=loc)
    e = bpy.context.object
    e.name = name
    return e


def fire_light(loc, energy=600):
    bpy.ops.object.light_add(type="POINT", location=loc)
    L = bpy.context.object
    L.data.color = (1.0, 0.55, 0.2)
    L.data.energy = energy
    L.data.shadow_soft_size = 0.8
    return L


# line 2: "so you make a plan."
def you_plan_chin(n):
    """Close on you against the back wall: eyes narrow, glove to the chin (reference 5.2 s)."""
    arm, head, piv = C.soldier("Standing Yell", (0.15, -5.45, 0.06), rot_z=math.pi, who="tommy", uniform="khaki", expr="determined",
                               helmet_kind="brodie", frames=(1, n), speed=0.15)
    chin = C.head_target(piv, "chin", (0.08, -0.27, -0.14))
    C.reach(arm, "Right", chin, [(1, 0.0), (7, 1.0)])
    cam = S.camera((0.35, -2.75, 1.4), (0.12, -5.45, 1.38), lens=42, fstop=2.8, focus=2.7, roll=0.06)
    cam_keys(cam, [(1, (0.35, -2.75, 1.4), (0.12, -5.45, 1.38)), (n, (0.32, -3.05, 1.4), (0.12, -5.45, 1.38))])
    return cam


# line 3: "One of them climbs up and hoses the trench with fire."
def flame_leap(n):
    """Low from the trench floor: the flamethrower man leaps onto the lip against the sky."""
    path = [(1, (3.6, 0.4, D)), (9, (2.3, 0.4, D + 0.9)), (17, (1.3, 0.4, D + 0.05)), (max(18, n), (1.25, 0.4, D + 0.05))]
    C.soldier("Rifle Run", (3.6, 0.4, D), rot_z=-math.pi / 2, who="flamer", uniform="fieldgrey", expr="angry", helmet_kind="stahl",
              frames=(1, n), weapon="lance", tanks=True, path=path)
    cam = S.camera((-0.45, -1.4, 0.55), (1.4, 0.4, D + 1.1), lens=20, roll=0.08)
    bpy.context.scene.render.use_motion_blur = True
    return cam


def flame_scowl(n):
    """Looking up at his angry face on the lip, nozzle toward us (reference 6.7 s)."""
    C.soldier("Rifle Aiming Idle", (1.3, 0.4, D), rot_z=-math.pi / 2 + 0.75, who="flamer", uniform="fieldgrey", expr="angry",
              helmet_kind="stahl", frames=(1, n), offset=10, weapon="lance", tanks=True)
    cam = S.camera((-0.25, -0.5, 1.55), (1.25, 0.35, D + 1.3), lens=38, fstop=2.8, focus=2.3)
    cam_keys(cam, [(1, (-0.25, -0.5, 1.55), (1.25, 0.35, D + 1.3)), (n, (-0.1, -0.4, 1.6), (1.25, 0.35, D + 1.3))])
    return cam


def flame_fire_side(n):
    """Side-on: he blasts fire down into the trench (reference 7.4 s)."""
    C.soldier("Firing Rifle", (1.35, 3.0, D), rot_z=-0.35, who="flamer", uniform="fieldgrey", expr="angry", helmet_kind="stahl",
              frames=(1, n), weapon="lance", tanks=True)
    FX.fire_jet((1.05, 2.3, D + 1.0), (0.0, -3.2, 0.55), f0=2, grow=7)
    FX.floor_fire((0.0, -1.5, 0.0), f0=9, n=5, spread=2.4)
    cam = S.camera((5.0, -0.8, D + 1.7), (0.9, 1.6, D + 0.6), lens=28, fstop=6.3, focus=4.6)
    cam_keys(cam, [(1, (5.0, -0.8, D + 1.7), (0.9, 1.6, D + 0.6)), (n, (4.8, -0.85, D + 1.65), (0.9, 1.6, D + 0.6))])
    return cam


def fire_wall(n):
    """In the trench: a wall of fire rolls down it toward the camera (reference 8.1 s)."""
    FX.fire_jet((1.0, 6.5, D + 1.0), (0.0, -2.6, 0.6), f0=-6, grow=7, r1=0.95)
    FX.floor_fire((0.0, 1.5, 0.0), f0=-4, n=7, spread=3.2, height=1.7)
    cam = S.camera((0.15, -5.0, 1.0), (0.0, 3.0, 1.25), lens=24)
    cam_keys(cam, [(1, (0.15, -5.0, 1.0), (0.0, 3.0, 1.25)), (n, (0.15, -5.3, 0.95), (0.0, 3.0, 1.3))])
    return cam


# line 4: "You scream, throw down your rifle, and stagger away like you have lost your mind."
def you_scream_low(n):
    """Low and tilted: both arms fly up, rifle in one fist (reference 8.7 s)."""
    arm, head, piv = C.soldier("Standing Yell", (0.1, -4.3, 0.06), rot_z=math.pi, who="tommy", uniform="khaki", expr="shocked",
                               helmet_kind="brodie", frames=(1, n), offset=20)
    # hands-up spots in the world (he stands still, facing the camera): above and beside the head
    bx, by = 0.1, -4.3
    up_r = empty_at("upR", (bx - 0.55, by + 0.3, 1.95))
    up_l = empty_at("upL", (bx + 0.55, by + 0.3, 1.9))
    C.reach(arm, "Right", up_r, [(1, 0.2), (5, 1.0)])
    C.reach(arm, "Left", up_l, [(1, 0.2), (5, 1.0)])
    C.hold_one_hand(arm, "Right", "rifle")
    fire_light((0.0, 1.5, 1.2), 500)
    cam = S.camera((0.4, -1.5, 0.95), (0.1, -4.3, 1.5), lens=26, roll=0.08)
    cam_keys(cam, [(1, (0.4, -1.5, 0.95), (0.1, -4.3, 1.5)), (n, (0.38, -1.9, 0.95), (0.1, -4.3, 1.55))])
    return cam


def you_drop_rifle(n):
    """He lets go: the rifle drops and bounces on the duckboards; a sad little face (reference 9.4 s)."""
    C.soldier("Standing Yell", (0.0, -4.4, 0.06), rot_z=math.pi, who="tommy", uniform="khaki", expr="sad",
              helmet_kind="brodie", frames=(1, n), speed=0.12)
    C.drop_prop("rifle", (0.22, -4.1, 0.85), (0.32, -3.7, 0.06), f0=8)
    fire_light((0.0, 1.5, 1.2), 400)
    cam = S.camera((0.35, -1.9, 1.15), (0.0, -4.3, 0.85), lens=32, fstop=4.0, focus=2.6)
    return cam


def you_stagger_away(n):
    """Reeling down the trench toward the camera, fire behind him."""
    arm, head, piv = C.soldier("Drunk Run Forward", (0.0, 4.0, 0.06), rot_z=0.0, who="tommy", uniform="khaki", expr="shocked",
                               helmet_kind="brodie", frames=(1, n), run_dir=(0, -1))
    ys = [kp.co.y for fc in arm.animation_data.action.fcurves if fc.data_path == "location" and fc.array_index == 1 for kp in fc.keyframe_points]
    sp = abs(ys[-1] - ys[0]) if len(ys) > 1 else 0.0
    FX.floor_fire((0.0, 7.5, 0.0), f0=-20, n=5, spread=2.6)
    cam = S.camera((0.25, 0.6, 1.2), (0.0, 4.0, 1.15), lens=30, fstop=4.0, focus=3.4)
    cam_keys(cam, [(1, (0.25, 0.6, 1.2), (0.0, 4.0, 1.15)), (n, (0.25, 0.6 - sp, 1.2), (0.0, 4.0 - sp, 1.15))])
    return cam


# line 5: "You duck around the corner, and go dead quiet."
def you_duck_corner(n):
    """From inside the side trench: you come round the corner, crouched, sly (reference 10.8-11.5 s)."""
    t = max(4, n - 1)
    path = [(1, (0.0, -2.4, 0.06)), (int(t * 0.4), (0.0, -4.75, 0.06)), (t, (-3.4, -4.8, 0.06))]
    arm, head, piv = C.soldier("Rifle Crouch Walk To Kneel", (0.0, -2.4, 0.06), rot_z=0.0, who="tommy", uniform="khaki",
                               expr="determined", helmet_kind="brodie", frames=(1, n), path=path, speed=1.4)
    arm.rotation_euler[2] = 0.0
    arm.keyframe_insert("rotation_euler", index=2, frame=int(t * 0.35))
    arm.rotation_euler[2] = -math.pi / 2
    arm.keyframe_insert("rotation_euler", index=2, frame=int(t * 0.55))
    for pid, x, y, rz in [("cement_bag", -4.9, -5.4, 0.3), ("cement_bag", -4.8, -4.0, 1.4)]:
        S.prop(pid, (x, y, 0.06), rz)
    cam = S.camera((-5.6, -4.75, 0.9), (-0.8, -4.6, 0.95), lens=30, fstop=4.0, focus=4.0)
    return cam


def you_dead_quiet(n):
    """Pressed against the wall: sly squint, finger to the lips (reference 12.0 s)."""
    arm, head, piv = C.soldier("Idle Crouching", (-2.6, -4.05, 0.06), rot_z=0.0, who="tommy", uniform="khaki", expr="determined",
                               helmet_kind="brodie", frames=(1, n))
    lips = C.head_target(piv, "lips", (0.0, -0.34, -0.06))
    C.reach(arm, "Right", lips, [(1, 0.0), (6, 1.0)])
    cam = S.camera((-1.6, -5.85, 0.95), (-2.6, -4.05, 0.95), lens=26, fstop=2.8, focus=2.0)
    cam_keys(cam, [(1, (-1.6, -5.85, 0.95), (-2.6, -4.05, 0.95)), (n, (-1.7, -5.8, 0.96), (-2.6, -4.05, 0.95))])
    return cam


# line 6: "They think you are finished, so they charge in after you,"
def they_think_smug(n):
    """The flamethrower man, smug and laughing, fire behind him (reference 13.2 s)."""
    C.soldier("Rifle Aiming Idle", (0.05, 3.6, 0.06), rot_z=0.25, who="flamer", uniform="fieldgrey", expr="happy", helmet_kind="stahl",
              frames=(1, n), offset=30, weapon="lance", tanks=True)
    C.soldier("Walk With Rifle", (-0.4, 7.6, 0.06), rot_z=0.0, who="enemy", uniform="fieldgrey", expr="happy", helmet_kind="stahl",
              frames=(1, n), run_dir=(0, -1), weapon="rifle")
    FX.floor_fire((0.0, 10.0, 0.0), f0=-30, n=5, spread=2.4)
    cam = S.camera((0.35, 1.1, 1.3), (0.0, 3.6, 1.35), lens=40, fstop=2.8, focus=2.6)
    cam_keys(cam, [(1, (0.35, 1.1, 1.3), (0.0, 3.6, 1.35)), (n, (0.33, 1.4, 1.3), (0.0, 3.6, 1.35))])
    return cam


def enemies_charge_down(n):
    """A grinning pack charges down the trench at us, past a crate (reference 13.9-14.6 s)."""
    S.prop("wooden_military_crate", (0.45, -3.4, 0.06), 0.5)
    S.prop("ammo_box", (-0.5, -2.7, 0.06), -0.4)
    for i, (x, y, off, who) in enumerate([(0.05, 2.0, 0, "enemy"), (-0.35, 3.3, 7, "enemy"), (0.35, 4.0, 13, "flamer"), (-0.1, 5.4, 4, "enemy")]):
        C.soldier("Rifle Run", (x, y, 0.06), rot_z=0.0, who=who, uniform="fieldgrey", expr="happy" if i % 2 else "angry", helmet_kind="stahl",
                  frames=(1, n), offset=off, run_dir=(0, -1), weapon="lance" if who == "flamer" else "rifle", tanks=who == "flamer")
    FX.floor_fire((0.0, 12.0, 0.0), f0=-40, n=4, spread=2.4)
    cam = S.camera((0.25, -5.3, 0.7), (0.0, 3.0, 1.15), lens=30, fstop=5.6, focus=6.0)
    return cam


def enemies_rush_past(n):
    """Low against the wall as they rush right past the camera (reference 15.3 s)."""
    for x, y, off in [(-0.3, 2.0, 2), (0.25, 3.3, 9), (-0.4, 4.6, 15)]:
        C.soldier("Rifle Run", (x, y, 0.06), rot_z=0.0, who="enemy", uniform="fieldgrey", expr="angry", helmet_kind="stahl",
                  frames=(1, n), offset=off, run_dir=(0, -1), weapon="rifle")
    FX.floor_fire((0.0, 11.0, 0.0), f0=-50, n=4, spread=2.4)
    cam = S.camera((0.6, -2.4, 0.42), (-0.15, 2.0, 1.0), lens=18, roll=-0.08)
    bpy.context.scene.render.use_motion_blur = True
    return cam


SHOTS_B = {
    "you-plan-chin": you_plan_chin, "flame-leap": flame_leap, "flame-scowl": flame_scowl, "flame-fire-side": flame_fire_side,
    "fire-wall": fire_wall, "you-scream-low": you_scream_low, "you-drop-rifle": you_drop_rifle, "you-stagger-away": you_stagger_away,
    "you-duck-corner": you_duck_corner, "you-dead-quiet": you_dead_quiet, "they-think-smug": they_think_smug,
    "enemies-charge-down": enemies_charge_down, "enemies-rush-past": enemies_rush_past,
}
