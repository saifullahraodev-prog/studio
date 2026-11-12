# studio_bl: building blocks for the Blender test (docs/blender-test-plan.md).
# Real-world scale, metres, Z up. Trench runs along +Y; no-man's-land is the +X side.
# Run inside Blender: blender -b --factory-startup -P blender/<script>.py -- <args>
import bpy, bmesh, math, os, random
from mathutils import Vector, noise

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEX = os.path.join(ROOT, "public", "textures")
PH = os.path.join(ROOT, "public", "models", "polyhaven")
SKY = os.path.join(ROOT, "blender", "assets", "sky")
BTEX = os.path.join(ROOT, "blender", "assets", "tex")

T = dict(W=0.8, D=1.95, Y0=-6.0, Y1=40.0, SN=-3.6, SX=-16.0)  # half-width, depth, from/to; side trench (left, at the far end): near wall y=SN, runs to x=SX


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    random.seed(7)
    return bpy.context.scene


# ── materials ───────────────────────────────────────────────────────────────
def _img(path, data=False):
    im = bpy.data.images.load(path, check_existing=True)
    if data:
        im.colorspace_settings.name = "Non-Color"
    return im


def tex_dir(tex):
    return os.path.join(BTEX, tex) if os.path.isdir(os.path.join(BTEX, tex)) else os.path.join(TEX, tex)


def pbr(name, tex, scale=4.0, tint=(1, 1, 1), rough=1.0, bump=1.0, coords="UV", metal=0.0, gray=False):
    """Photo material from blender/assets/tex/<tex> or public/textures/<tex> ({Color,NormalGL,Roughness}.jpg)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (scale, scale, scale)
    nt.links.new(tc.outputs["Object" if coords == "Object" else "UV"], mp.inputs["Vector"])
    col = nt.nodes.new("ShaderNodeTexImage")
    col.image = _img(os.path.join(tex_dir(tex), "Color.jpg"))
    nrm = nt.nodes.new("ShaderNodeTexImage")
    nrm.image = _img(os.path.join(tex_dir(tex), "NormalGL.jpg"), True)
    rgh = nt.nodes.new("ShaderNodeTexImage")
    rgh.image = _img(os.path.join(tex_dir(tex), "Roughness.jpg"), True)
    for n in (col, nrm, rgh):
        if coords == "Object":
            n.projection = "BOX"
            n.projection_blend = 0.3
        nt.links.new(mp.outputs["Vector"], n.inputs["Vector"])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs[0].default_value = 1.0
    if gray:
        hs = nt.nodes.new("ShaderNodeHueSaturation")
        hs.inputs["Saturation"].default_value = 0.0
        hs.inputs["Value"].default_value = 1.6
        nt.links.new(col.outputs["Color"], hs.inputs["Color"])
        nt.links.new(hs.outputs["Color"], mix.inputs[6])
    else:
        nt.links.new(col.outputs["Color"], mix.inputs[6])
    mix.inputs[7].default_value = (*tint, 1)
    nt.links.new(mix.outputs[2], b.inputs["Base Color"])
    rm = nt.nodes.new("ShaderNodeMath")
    rm.operation = "MULTIPLY"
    rm.inputs[1].default_value = rough
    nt.links.new(rgh.outputs["Color"], rm.inputs[0])
    nt.links.new(rm.outputs[0], b.inputs["Roughness"])
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = bump
    nt.links.new(nrm.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    b.inputs["Metallic"].default_value = metal
    return m


def flat(name, rgb, rough=0.8, metal=0.0, emit=None, strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = strength
    return m


def obj_from_bm(name, bm, mat=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    if mat:
        me.materials.append(mat)
    for p in me.polygons:
        p.use_smooth = True
    return ob


# ── world: sky, sun, render settings ────────────────────────────────────────
def sky(hdr="lilienstein_4k.hdr", strength=1.0, rot=0.0):
    sc = bpy.context.scene
    w = bpy.data.worlds.new("sky")
    sc.world = w
    w.use_nodes = True
    nt = w.node_tree
    env = nt.nodes.new("ShaderNodeTexEnvironment")
    env.image = _img(os.path.join(SKY, hdr))
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Rotation"].default_value = (0, 0, rot)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], env.inputs["Vector"])
    bg = nt.nodes["Background"]
    bg.inputs["Strength"].default_value = strength
    nt.links.new(env.outputs["Color"], bg.inputs["Color"])


def sun(elev=48, azim=35, energy=3.2, angle=2.5):
    bpy.ops.object.light_add(type="SUN", rotation=(math.radians(90 - elev), 0, math.radians(azim)))
    s = bpy.context.object
    s.data.energy = energy
    s.data.angle = math.radians(angle)
    s.data.color = (1.0, 0.96, 0.9)
    return s


def render_setup(engine="CYCLES", w=540, h=960, samples=48):
    sc = bpy.context.scene
    r = sc.render
    r.resolution_x, r.resolution_y = w, h
    r.fps = 30
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.view_settings.exposure = -0.3
    if engine == "CYCLES":
        r.engine = "CYCLES"
        cp = bpy.context.preferences.addons["cycles"].preferences
        cp.compute_device_type = "CUDA"
        cp.get_devices()
        for d in cp.devices:
            d.use = d.type == "CUDA"
        sc.cycles.device = "GPU"
        sc.cycles.samples = samples
        sc.cycles.use_denoising = True
        sc.cycles.max_bounces = 4
    else:
        r.engine = "BLENDER_EEVEE_NEXT"
        sc.eevee.taa_render_samples = samples
        sc.eevee.use_shadows = True


def camera(loc, target, lens=35, fstop=None, focus=None, roll=0.0):
    bpy.ops.object.empty_add(location=target)
    aim = bpy.context.object
    aim.name = "cam_aim"
    bpy.ops.object.camera_add(location=loc)
    cam = bpy.context.object
    cam.data.lens = lens
    c = cam.constraints.new("TRACK_TO")
    c.target = aim
    c.track_axis = "TRACK_NEGATIVE_Z"
    c.up_axis = "UP_Y"
    if roll:
        cam.delta_rotation_euler = (0, 0, roll)
    if fstop:
        cam.data.dof.use_dof = True
        cam.data.dof.aperture_fstop = fstop
        cam.data.dof.focus_distance = focus if focus else (Vector(loc) - Vector(target)).length
    bpy.context.scene.camera = cam
    return cam


# ── the trench set ──────────────────────────────────────────────────────────
def ground_material():
    """Churned mud near the trench and in craters, patchy sparse grass further out."""
    mud = pbr("mud_part", "brown_mud_02", scale=0.4, tint=(0.85, 0.78, 0.7), rough=1.0, bump=1.6, coords="Object")
    grass = pbr("grass_part", "sparse_grass", scale=0.35, tint=(0.9, 0.9, 0.8), rough=1.0, bump=1.0, coords="Object")
    m = bpy.data.materials.new("ground")
    m.use_nodes = True
    nt = m.node_tree
    out = nt.nodes["Material Output"]
    for n in list(nt.nodes):
        if n.type == "BSDF_PRINCIPLED":
            nt.nodes.remove(n)
    # copy the two node trees in as groups would be cleaner; here: rebuild both BSDFs inline
    def inline(src):
        b = nt.nodes.new("ShaderNodeBsdfPrincipled")
        sb = src.node_tree.nodes["Principled BSDF"]
        mapping = {}
        for n in src.node_tree.nodes:
            if n.type in ("OUTPUT_MATERIAL", "BSDF_PRINCIPLED"):
                continue
            c = nt.nodes.new(n.bl_idname)
            for attr in ("image", "projection", "projection_blend", "data_type", "blend_type", "operation"):
                if hasattr(n, attr):
                    try:
                        setattr(c, attr, getattr(n, attr))
                    except Exception:
                        pass
            for i, inp in enumerate(n.inputs):
                if hasattr(inp, "default_value"):
                    try:
                        c.inputs[i].default_value = inp.default_value
                    except Exception:
                        pass
            mapping[n] = c
        mapping[sb] = b
        for l in src.node_tree.links:
            if l.from_node in mapping and l.to_node in mapping:
                fo = [o for o in l.from_node.outputs].index(l.from_socket)
                ti = [i for i in l.to_node.inputs].index(l.to_socket)
                nt.links.new(mapping[l.from_node].outputs[fo], mapping[l.to_node].inputs[ti])
        return b
    b1 = inline(mud)
    b2 = inline(grass)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 0.12
    nz.inputs["Detail"].default_value = 6
    nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.48
    ramp.color_ramp.elements[1].position = 0.6
    nt.links.new(nz.outputs["Fac"], ramp.inputs["Fac"])
    mx = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(ramp.outputs["Color"], mx.inputs[0])
    nt.links.new(b1.outputs[0], mx.inputs[1])
    nt.links.new(b2.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs["Surface"])
    return m


def _height(x, y, craters):
    """Ground height outside the trench: soft mounds + shell craters, flat near the trench lip."""
    W, D = T["W"], T["D"]
    edge = abs(x) - W
    h = 0.35 * noise.noise(Vector((x * 0.07, y * 0.07, 0.3))) + 0.12 * noise.noise(Vector((x * 0.4, y * 0.4, 1.7)))
    for cx, cy, r in craters:
        d = math.hypot(x - cx, y - cy) / r
        if d < 1.6:
            h += -0.6 * r * max(0.0, 1 - d * d) + 0.18 * r * math.exp(-((d - 1.05) ** 2) * 18)
    calm = min(1.0, max(0.0, (edge - 0.3) / 2.0))  # no bumps right at the lip
    return D + h * calm


def build_trench():
    W, D, Y0, Y1 = T["W"], T["D"], T["Y0"], T["Y1"]
    mud = ground_material()
    wetmud = pbr("wetmud", "muddy_tracks", scale=0.5, tint=(0.8, 0.72, 0.62), rough=0.6, bump=1.2, coords="Object")
    planks = pbr("planks", "weathered_planks", scale=0.6, tint=(1.0, 0.92, 0.82), rough=1.0, bump=1.2)
    bagmat = pbr("sandbag", "Fabric026", scale=2.0, tint=(0.62, 0.55, 0.42), rough=1.0, bump=2.0, gray=True)

    craters = [(6, 4, 1.6), (11, -3, 2.2), (9, 12, 1.8), (16, 6, 2.6), (20, -7, 2.0), (-7, 3, 1.5), (-12, 10, 2.2), (14, 20, 2.4), (5, 24, 1.3)]
    # ground: a big grid, the trench rectangle cut out
    bm = bmesh.new()
    N, S = 150, 60.0
    verts = {}
    for i in range(N + 1):
        for j in range(N + 1):
            x = -S / 2 + S * i / N
            y = Y0 - 20 + S * j / N
            verts[i, j] = bm.verts.new((x, y, _height(x, y, craters)))
    for i in range(N):
        for j in range(N):
            cx = -S / 2 + S * (i + 0.5) / N
            cy = Y0 - 20 + S * (j + 0.5) / N
            if abs(cx) < W + S / N * 0.5 and Y0 < cy < Y1:
                continue
            if T["SX"] - 0.2 < cx < -W + 0.2 and Y0 < cy < T["SN"]:  # side trench
                continue
            bm.faces.new((verts[i, j], verts[i + 1, j], verts[i + 1, j + 1], verts[i, j + 1]))
    ground = obj_from_bm("ground", bm, mud)
    # far ground out to the horizon (meets the field in the sky photo)
    # a 600 m square with a hole where the detailed grid (and the trench) is
    fb = bmesh.new()
    gx0, gx1, gy0, gy1 = -S / 2 + 0.5, S / 2 - 0.5, Y0 - 20 + 0.5, Y0 - 20 + S - 0.5
    o = [fb.verts.new((x, y, D - 0.12)) for x, y in ((-300, -300), (300, -300), (300, 300), (-300, 300))]
    i_ = [fb.verts.new((x, y, D - 0.12)) for x, y in ((gx0, gy0), (gx1, gy0), (gx1, gy1), (gx0, gy1))]
    for k in range(4):
        fb.faces.new((o[k], o[(k + 1) % 4], i_[(k + 1) % 4], i_[k]))
    obj_from_bm("far_ground", fb, mud)
    # trench floor + walls (plank revetment) + back wall
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, (Y0 + Y1) / 2, 0))
    fl = bpy.context.object
    fl.scale = (2 * W + 0.4, Y1 - Y0, 1)
    fl.data.materials.append(wetmud)
    SN, SX = T["SN"], T["SX"]
    for sx in (-1, 1):
        ya = SN if sx < 0 else Y0  # the left wall stops where the side trench opens
        bpy.ops.mesh.primitive_plane_add(size=1, location=(sx * W, (ya + Y1) / 2, D / 2), rotation=(0, math.pi / 2, 0))
        wall = bpy.context.object
        wall.scale = (D + 0.3, Y1 - ya, 1)
        wall.data.materials.append(planks)
        bpy.ops.object.transform_apply(scale=True)
        _uv_world(wall, 1.2)
    # back wall: closes the main trench and runs on as the side trench's far wall
    bpy.ops.mesh.primitive_plane_add(size=1, location=((W + SX) / 2, Y0, D / 2), rotation=(math.pi / 2, 0, 0))
    back = bpy.context.object
    back.scale = (W - SX, D + 0.3, 1)
    back.data.materials.append(planks)
    bpy.ops.object.transform_apply(scale=True)
    _uv_world(back, 1.2)
    # side trench: near wall + floor
    bpy.ops.mesh.primitive_plane_add(size=1, location=((SX - W) / 2, SN, D / 2), rotation=(math.pi / 2, 0, 0))
    sw = bpy.context.object
    sw.scale = (-W - SX, D + 0.3, 1)
    sw.data.materials.append(planks)
    bpy.ops.object.transform_apply(scale=True)
    _uv_world(sw, 1.2)
    bpy.ops.mesh.primitive_plane_add(size=1, location=((SX - W) / 2, (Y0 + SN) / 2, 0.002))
    sf = bpy.context.object
    sf.scale = (-W - SX, SN - Y0, 1)
    sf.data.materials.append(wetmud)
    # wall posts
    post = flat("post", (0.18, 0.12, 0.08), 0.9)
    for sx in (-1, 1):
        y = Y0 + 0.6 if sx > 0 else SN + 0.3
        while y < Y1:
            bpy.ops.mesh.primitive_cube_add(size=1, location=(sx * (W - 0.05), y, D / 2 - 0.05))
            p = bpy.context.object
            p.scale = (0.1, 0.12, D + 0.2)
            p.data.materials.append(post)
            y += 1.4
    # duckboards
    duck = pbr("duck", "Planks037A", scale=1.0, tint=(0.55, 0.45, 0.35), rough=1.0, bump=1.0)
    x = -W - 0.1
    while x > SX:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, (Y0 + SN) / 2, 0.06))
        s = bpy.context.object
        s.scale = (0.13, 1.0, 0.04)
        s.rotation_euler = (0, 0, random.uniform(-0.04, 0.04))
        s.data.materials.append(duck)
        x -= 0.2
    y = Y0 + 0.3
    while y < Y1:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, y, 0.06))
        s = bpy.context.object
        s.scale = (1.0, 0.13, 0.04)
        s.rotation_euler = (0, 0, random.uniform(-0.04, 0.04))
        s.data.materials.append(duck)
        y += 0.2
    # sandbags: two staggered rows on both lips + the back
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=16, ring_count=8)
    bag = bpy.context.object
    bag.scale = (0.3, 0.17, 0.12)
    bpy.ops.object.transform_apply(scale=True)
    bag.data.materials.append(bagmat)
    _uv_world(bag, 0.5)
    bag.location = (0, 0, -50)
    for sx in (-1, 1):
        for row in range(2):
            y = (Y0 if sx > 0 else SN) + 0.2 + row * 0.15
            while y < Y1 - 10:
                o = bag.copy()
                bpy.context.scene.collection.objects.link(o)
                o.location = (sx * (W + 0.25 + row * 0.05), y, D + 0.08 + row * 0.18)
                o.rotation_euler = (random.uniform(-0.1, 0.1), random.uniform(-0.1, 0.1), math.pi / 2 + random.uniform(-0.15, 0.15))
                y += 0.58
    # lips of the side trench and of the back wall
    for row in range(2):
        for (ly, x0, x1) in ((SN + 0.25 + row * 0.05, SX, -W), (Y0 - 0.25 - row * 0.05, SX, W)):
            x = x0 + 0.2 + row * 0.15
            while x < x1 - 0.1:
                o = bag.copy()
                bpy.context.scene.collection.objects.link(o)
                o.location = (x, ly, D + 0.08 + row * 0.18)
                o.rotation_euler = (random.uniform(-0.1, 0.1), random.uniform(-0.1, 0.1), random.uniform(-0.15, 0.15))
                x += 0.58
    return ground


def _uv_world(ob, scale):
    """Simple box UVs in world metres (so planks/fabric tile at a real size)."""
    me = ob.data
    if not me.uv_layers:
        me.uv_layers.new()
    uv = me.uv_layers.active.data
    mw = ob.matrix_world
    for poly in me.polygons:
        n = poly.normal
        ax = max(range(3), key=lambda k: abs(n[k]))
        for li in poly.loop_indices:
            co = mw @ me.vertices[me.loops[li].vertex_index].co
            a, b = [(co.y, co.z), (co.x, co.z), (co.x, co.y)][ax]
            uv[li].uv = (a / scale, b / scale)


def barbed_wire(x, y0, y1, z):
    wire = flat("wire", (0.12, 0.11, 0.1), 0.5, 0.8)
    cu = bpy.data.curves.new("coil", "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = 0.006
    sp = cu.splines.new("POLY")
    n = int((y1 - y0) / 0.04)
    sp.points.add(n - 1)
    for i in range(n):
        t = i / n
        y = y0 + (y1 - y0) * t
        a = i * 0.35
        sp.points[i].co = (x + 0.35 * math.cos(a), y, z + 0.4 + 0.35 * math.sin(a), 1)
    ob = bpy.data.objects.new("wire", cu)
    bpy.context.scene.collection.objects.link(ob)
    ob.data.materials.append(wire)
    post = flat("wpost", (0.2, 0.15, 0.1), 0.9)
    yy = y0
    while yy <= y1:
        for a in (-0.35, 0.35):
            bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=1.2, location=(x, yy, z + 0.5), rotation=(a, 0, 0))
            bpy.context.object.data.materials.append(post)
        yy += 3.0


def prop(pid, loc, rot_z=0.0, scale=1.0):
    """Import a Poly Haven glTF prop (public/models/polyhaven/<id>)."""
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(PH, pid, pid + ".gltf"))
    new = [o for o in bpy.context.scene.objects if o not in before]
    roots = [o for o in new if o.parent is None]
    for r in roots:
        r.location = loc
        r.rotation_euler = (r.rotation_euler[0], r.rotation_euler[1], rot_z)
        r.scale = (scale, scale, scale)
    return roots


def dress(ground_h):
    """No-man's-land and trench clutter (real CC0 models)."""
    D = T["D"]
    for pid, x, y, rz, s in [
        ("dead_tree_trunk", 7.5, 9.0, 0.8, 2.2), ("dead_tree_trunk", -9, -2, 2.2, 2.5), ("tree_stump_01", 4.2, 2.5, 0.0, 1.0),
        ("tree_stump_02", 12, 4, 1.0, 1.2), ("rock_07", 5.5, -1.5, 0.5, 1.0), ("stone_01", 8.5, 6.5, 1.3, 0.8),
        ("dry_branches_medium_01", 3.0, 6.0, 0.3, 1.0), ("Barrel_01", 2.0, -3.8, 0.4, 1.0), ("wooden_military_crate", 2.6, -4.6, 0.9, 1.0),
    ]:
        prop(pid, (x, y, ground_h(x, y) - 0.05), rz, s)
    for pid, x, y, rz in [("wooden_military_crate", 0.45, 2.0, 0.2), ("ammo_box", -0.5, 4.0, 1.1), ("wooden_barrels_01", 0.4, 7.5, 0.0),
                          ("wooden_bucket_01", -0.55, 9.0, 0.0), ("rusted_spade_01", -0.6, -3.5, 0.6), ("old_gas_mask", 0.3, -1.0, 2.0)]:
        prop(pid, (x, y, 0.1), rz, 1.0)
    barbed_wire(3.4, -6, 22, 0)
    for o in bpy.context.scene.objects:
        if o.name.startswith("wire"):
            pass
    _snap_wire(ground_h)


def _snap_wire(ground_h):
    for o in bpy.context.scene.objects:
        if o.type == "CURVE" and o.name.startswith("wire"):
            for sp in o.data.splines:
                for p in sp.points:
                    p.co.z += ground_h(p.co.x, p.co.y)
        elif o.type == "MESH" and o.name.startswith("Cylinder"):
            o.location.z += ground_h(o.location.x, o.location.y)
