# studio_chars: the chubby Mixamo soldier in Blender, with our round head (bean-eye face),
# realistic steel helmet, cartoon mittens, two-hand rifle / flamethrower lance, fuel tanks.
import bpy, bmesh, math, os
from mathutils import Vector
from studio_bl import ROOT, pbr, flat, obj_from_bm, _img

FACES = os.path.join(ROOT, "blender", "assets", "faces")
MOVES = r"D:\Test\mixamo\new motion"
UNIFORM = {
    "khaki": {"tunic": (0.42, 0.37, 0.24), "trousers": (0.36, 0.32, 0.21), "puttees": (0.33, 0.29, 0.19), "webbing": (0.55, 0.49, 0.34)},
    "fieldgrey": {"tunic": (0.33, 0.35, 0.3), "trousers": (0.28, 0.3, 0.26), "puttees": (0.22, 0.2, 0.17), "webbing": (0.32, 0.27, 0.2)},
}
_mats = {}
WRINKLES = False
SMOOTH = False  # subdivision: off (it distorts the cloth UVs; fix later)
GRIP = 0.55  # where the fist closes, along the hand bone (0 = wrist, 1 = knuckles)  # procedural folds: off until the scale problem is solved


def _cloth(key, rgb):
    k = f"{key}{rgb}"
    if k not in _mats:
        m = pbr(f"cloth_{key}", "Fabric026", scale=7.0, tint=rgb, rough=1.0, bump=1.6, gray=True)
        nt = m.node_tree
        b = nt.nodes["Principled BSDF"]
        nm = next(n for n in nt.nodes if n.type == "NORMAL_MAP")
        tc = nt.nodes.new("ShaderNodeTexCoord")
        wave = nt.nodes.new("ShaderNodeTexWave")  # long soft folds
        wave.inputs["Scale"].default_value = 2.2
        wave.inputs["Distortion"].default_value = 9.0
        wave.inputs["Detail"].default_value = 3.0
        wave.inputs["Detail Scale"].default_value = 1.5
        nt.links.new(tc.outputs["Generated"], wave.inputs["Vector"])  # 0..1 over each part: size-independent
        nz = nt.nodes.new("ShaderNodeTexNoise")  # small creases
        nz.inputs["Scale"].default_value = 14.0
        nz.inputs["Detail"].default_value = 4.0
        nt.links.new(tc.outputs["Generated"], nz.inputs["Vector"])
        mx = nt.nodes.new("ShaderNodeMath")
        mx.operation = "MULTIPLY_ADD"
        mx.inputs[1].default_value = 0.35
        nt.links.new(nz.outputs["Fac"], mx.inputs[0])
        nt.links.new(wave.outputs["Fac"], mx.inputs[2])
        bump = nt.nodes.new("ShaderNodeBump")
        bump.inputs["Strength"].default_value = 0.55
        bump.inputs["Distance"].default_value = 0.02
        nt.links.new(mx.outputs[0], bump.inputs["Height"])
        nt.links.new(nm.outputs["Normal"], bump.inputs["Normal"])
        if WRINKLES:
            nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
        b.inputs["Sheen Weight"].default_value = 0.4  # soft wool sheen at grazing angles
        _mats[k] = m
    return _mats[k]


def cartoon_glove(fist=True):
    """White 4-finger cartoon glove (palm, 3 fingers, thumb, cuff); fingers along +Y (Mixamo hand bone)."""
    mat = flat("glove_white", (0.9, 0.9, 0.88), 0.65)
    parts = []
    def add(op, loc, sc, rot=(0, 0, 0)):
        op(location=loc, rotation=rot)
        o = bpy.context.object
        o.scale = sc
        parts.append(o)
    add(lambda **k: bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=24, ring_count=12, **k), (0, 0.05, 0), (0.055, 0.06, 0.03))
    add(lambda **k: bpy.ops.mesh.primitive_cylinder_add(radius=1, depth=1, vertices=24, **k), (0, -0.015, 0), (0.042, 0.03, 0.035), (math.pi / 2, 0, 0))
    for i, x in enumerate((-0.033, 0.0, 0.033)):
        if fist:
            add(lambda **k: bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=16, ring_count=8, **k), (x, 0.1, 0.018), (0.02, 0.026, 0.024))
        else:
            add(lambda **k: bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=16, ring_count=8, **k), (x, 0.13 + (0.01 if i == 1 else 0), 0), (0.018, 0.05, 0.018))
    add(lambda **k: bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=16, ring_count=8, **k), (0.055, 0.05, 0.02), (0.018, 0.035, 0.018), (0, 0, -0.6))
    bpy.ops.object.select_all(action="DESELECT")
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    g = bpy.context.object
    bpy.ops.object.transform_apply(scale=True)
    for p in g.data.polygons:
        p.use_smooth = True
    g.data.materials.append(mat)
    g.name = "cartoon_glove"
    return g


def head_material(face_png, r):
    """White matte head with the drawn face on the front (object-space projection, face looks -Y)."""
    m = bpy.data.materials.new("head")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.75
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs[0])

    def lin(src, mul, add):
        a = nt.nodes.new("ShaderNodeMath")
        a.operation = "MULTIPLY_ADD"
        nt.links.new(src, a.inputs[0])
        a.inputs[1].default_value = mul
        a.inputs[2].default_value = add
        return a.outputs[0]

    u = lin(sep.outputs["X"], 1 / (1.742 * r), 0.5)
    v = lin(sep.outputs["Z"], 1 / (1.29 * r), 0.5 + 0.129 / 1.29)
    comb = nt.nodes.new("ShaderNodeCombineXYZ")
    nt.links.new(u, comb.inputs[0])
    nt.links.new(v, comb.inputs[1])
    img = nt.nodes.new("ShaderNodeTexImage")
    img.image = _img(face_png)
    img.extension = "CLIP"
    nt.links.new(comb.outputs[0], img.inputs["Vector"])
    front = nt.nodes.new("ShaderNodeMath")
    front.operation = "LESS_THAN"
    front.inputs[1].default_value = 0.0
    nt.links.new(sep.outputs["Y"], front.inputs[0])
    k = nt.nodes.new("ShaderNodeMath")
    k.operation = "MULTIPLY"
    nt.links.new(img.outputs["Alpha"], k.inputs[0])
    nt.links.new(front.outputs[0], k.inputs[1])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    nt.links.new(k.outputs[0], mix.inputs[0])
    mix.inputs[6].default_value = (0.93, 0.93, 0.91, 1)
    nt.links.new(img.outputs["Color"], mix.inputs[7])
    nt.links.new(mix.outputs[2], b.inputs["Base Color"])
    return m


def outline_material():
    if "outline" in _mats:
        return _mats["outline"]
    m = bpy.data.materials.new("outline")
    m.use_nodes = True
    nt = m.node_tree
    out = nt.nodes["Material Output"]
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (0.02, 0.02, 0.02, 1)
    mx = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(geo.outputs["Backfacing"], mx.inputs[0])
    nt.links.new(tr.outputs[0], mx.inputs[1])
    nt.links.new(em.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs["Surface"])
    _mats["outline"] = m
    return m


def helmet(kind, parent, r):
    """Realistic steel helmet (lathe profile, worn paint) round a head of radius r."""
    tint = (0.17, 0.19, 0.12) if kind == "brodie" else (0.13, 0.14, 0.13)
    metal = pbr(f"helmet_{kind}", "PaintedMetal004", scale=1.5, tint=tint, rough=1.4, bump=0.8, gray=True)
    prof = ([(0.0, 1.08), (0.6, 0.98), (0.95, 0.62), (1.1, 0.36), (1.12, 0.33), (1.55, 0.27), (1.57, 0.24)] if kind == "brodie"
            else [(0.0, 1.12), (0.65, 1.0), (1.0, 0.62), (1.1, 0.3), (1.13, 0.1), (1.2, -0.12), (1.3, -0.3)])
    bm = bmesh.new()
    rings = []
    seg = 48
    for (pr, pz) in prof:
        ring = []
        for i in range(seg):
            a = 2 * math.pi * i / seg
            zz = pz * r
            if kind == "stahl" and pz < 0.3:  # skirt cut away over the face (face side = -Y)
                front = max(0.0, -math.sin(a))
                zz = zz + (0.3 * r - zz) * (front ** 1.5)
            ring.append(bm.verts.new((pr * r * math.cos(a), pr * r * math.sin(a), zz)))
        rings.append(ring)
    for k in range(len(rings) - 1):
        for i in range(seg):
            bm.faces.new((rings[k][i], rings[k][(i + 1) % seg], rings[k + 1][(i + 1) % seg], rings[k + 1][i]))
    ob = obj_from_bm(f"helmet_{kind}", bm, metal)
    sol = ob.modifiers.new("thick", "SOLIDIFY")
    sol.thickness = 0.02 * r / 0.3
    ob.parent = parent
    return ob


def weapon_mesh(kind="rifle"):
    wood = flat("rifle_wood", (0.32, 0.17, 0.08), 0.6)
    steel = flat("rifle_steel", (0.08, 0.08, 0.08), 0.35, 0.9)
    brass = flat("brass", (0.6, 0.42, 0.15), 0.35, 1.0)
    if kind == "rifle":
        spec = [((0, -0.22, -0.02), (0.035, 0.32, 0.06), wood), ((0, 0.25, 0), (0.03, 0.5, 0.035), wood),
                ((0, 0.6, 0.012), (0.012, 0.28, 0.012), steel), ((0, 0.83, 0.005), (0.006, 0.18, 0.016), steel)]
    else:
        spec = [((0, 0.25, 0), (0.022, 0.7, 0.022), steel), ((0, 0.62, 0), (0.035, 0.06, 0.035), brass), ((0, -0.02, -0.04), (0.03, 0.09, 0.05), wood)]
    parts = []
    for loc, sc, mat in spec:
        bpy.ops.mesh.primitive_cube_add(size=2, location=loc)
        o = bpy.context.object
        o.scale = sc
        o.data.materials.append(mat)
        parts.append(o)
    bpy.ops.object.select_all(action="DESELECT")
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    g = bpy.context.object
    bpy.context.scene.cursor.location = (0, 0, 0)
    bpy.ops.object.origin_set(type="ORIGIN_CURSOR")  # pivot = the grip (0,0,0), not the first part
    bpy.ops.object.transform_apply(scale=True)
    g.name = kind
    return g


def soldier(move, loc, rot_z=0.0, who="tommy", uniform="khaki", expr="neutral", helmet_kind="brodie",
            offset=0, travel=(0.0, 0.0, 0.0), frames=(1, 120), weapon=None, tanks=False, size=1.0, head_r=0.3, path=None):
    """One soldier: Mixamo FBX (body + move) from MOVES, looping from `offset`; moves by `travel` (m/s)
    or along `path` [(frame, (x, y, z)), ...]."""
    sc = bpy.context.scene
    before = set(sc.objects)
    bpy.ops.import_scene.fbx(filepath=os.path.join(MOVES, move + ".fbx"))
    new = [o for o in sc.objects if o not in before]
    arm = next(o for o in new if o.type == "ARMATURE")
    bpy.context.view_layer.update()
    zs = [(o.matrix_world @ Vector(c)).z for o in new if o.type == "MESH" and not o.name.startswith("skin") for c in o.bound_box]
    k = 1.45 * size / max(1e-6, max(zs) - min(zs))
    arm.scale = arm.scale * k
    arm.rotation_euler = (arm.rotation_euler[0], arm.rotation_euler[1], rot_z)
    act = arm.animation_data.action
    arm.animation_data.action = None
    tr = arm.animation_data.nla_tracks.new()
    L = max(1.0, act.frame_range[1] - act.frame_range[0])
    st = tr.strips.new("move", int(frames[0] - offset), act)
    st.repeat = max(1.0, (frames[1] - frames[0] + offset) / L + 1)
    fps = sc.render.fps
    keys = path or [(f, (loc[0] + travel[0] * (f - frames[0]) / fps, loc[1] + travel[1] * (f - frames[0]) / fps, loc[2] + travel[2] * (f - frames[0]) / fps)) for f in (frames[0], frames[1])]
    for f, p in keys:
        arm.location = p
        arm.keyframe_insert("location", frame=f)
    if not path:
        for fc in arm.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR"
    U = UNIFORM[uniform]
    for o in new:
        if o.type != "MESH":
            continue
        key = o.name.split(".")[0]
        if SMOOTH and key not in ("skin", "brass"):
            sub = o.modifiers.new("smooth", "SUBSURF")
            sub.levels = 1
            sub.render_levels = 2
        for p in o.data.polygons:
            p.use_smooth = True
        o.data.materials.clear()
        if key == "skin":
            o.hide_render = True
        elif key in U:
            o.data.materials.append(_cloth(key, U[key]))
        elif key == "leather":
            o.data.materials.append(flat("leather", (0.14, 0.07, 0.03), 0.55))
        elif key == "boots":
            o.data.materials.append(flat("boots", (0.05, 0.035, 0.025), 0.45))
        elif key == "brass":
            o.data.materials.append(flat("brass", (0.6, 0.42, 0.15), 0.35, 1.0))
        elif key == "glove":
            o.hide_render = True
    # head: follows the head bone's position, turns with the hips only (stays upright)
    bpy.ops.object.empty_add(location=(0, 0, 0))
    piv = bpy.context.object
    piv.name = f"headpivot_{who}"
    c1 = piv.constraints.new("COPY_LOCATION")
    c1.target = arm
    c1.subtarget = "mixamorig:Head"
    c1.head_tail = 0.3
    c2 = piv.constraints.new("COPY_ROTATION")
    c2.target = arm
    c2.subtarget = "mixamorig:Hips"
    c2.use_x = False
    c2.use_y = False
    r = head_r * size
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=64, ring_count=32)
    head = bpy.context.object
    head.name = f"head_{who}"
    head.parent = piv
    head.location = (0, 0, r * 0.66)
    head.scale = (1.0, 1.0, 1.08)
    for p in head.data.polygons:
        p.use_smooth = True
    head.data.materials.append(head_material(os.path.join(FACES, f"{who}-{expr}.png"), r))
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r * 1.05, segments=64, ring_count=32)
    ol = bpy.context.object
    ol.parent = head
    for p in ol.data.polygons:
        p.use_smooth = True
    ol.data.materials.append(outline_material())
    # the ink rim must not block light on the head inside it
    for attr in ("visible_shadow", "visible_diffuse", "visible_glossy", "visible_transmission", "visible_volume_scatter"):
        setattr(ol, attr, False)
    helmet("brodie" if helmet_kind == "brodie" else "stahl", head, r)
    for hb in ("mixamorig:LeftHand", "mixamorig:RightHand"):
        gl = cartoon_glove(fist=bool(weapon))
        gl.parent = arm
        gl.parent_type = "BONE"
        gl.parent_bone = hb
        gl.matrix_parent_inverse.identity()
        bl = arm.data.bones[hb].length
        gl.location = (0, -bl, 0)  # BONE parenting starts at the bone tail; move back to the wrist
        gl.scale = (1.6 * size / arm.scale[0],) * 3  # world size: undo the armature scale
    if weapon:
        g = weapon_mesh("rifle" if weapon == "rifle" else "lance")
        g.scale = (size * 1.4,) * 3
        # grip in the middle of the right fist, barrel through the middle of the left fist
        cl = g.constraints.new("COPY_LOCATION")
        cl.target = arm
        cl.subtarget = "mixamorig:RightHand"
        cl.head_tail = GRIP
        dt_ = g.constraints.new("DAMPED_TRACK")
        dt_.target = arm
        dt_.subtarget = "mixamorig:LeftHand"
        dt_.head_tail = GRIP
        dt_.track_axis = "TRACK_Y"
    if tanks:
        steel = pbr("tank", "PaintedMetal004", scale=1.0, tint=(0.25, 0.27, 0.23), rough=0.6, bump=0.6, gray=True)
        for sx in (-1, 1):
            bpy.ops.mesh.primitive_cylinder_add(radius=0.075 * size * 1.4, depth=0.45 * size * 1.4)
            t = bpy.context.object
            t.data.materials.append(steel)
            c = t.constraints.new("CHILD_OF")
            c.target = arm
            c.subtarget = "mixamorig:Spine2"
            c.set_inverse_pending = False
            c.inverse_matrix.identity()
            t.location = (sx * 0.09 * size * 1.4, 0.18 * size, 0.0)
    return arm, head, piv
