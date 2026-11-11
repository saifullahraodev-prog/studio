# Blender test 1: our chubby soldier (Mixamo FBX with a move), photo sky, mud ground, sun.
# usage: blender -b --factory-startup -P blender/test_soldier.py -- <engine EEVEE|CYCLES> <out.png>
import bpy, sys, time, os, math
args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
engine = args[0] if args else "EEVEE"
out = os.path.abspath(args[1] if len(args) > 1 else "out/blender/test.png")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

# soldier with a move (Mixamo FBX contains body + animation)
bpy.ops.import_scene.fbx(filepath=r"D:\Test\mixamo\new motion\Rifle Aiming Idle.fbx")
arm = next(o for o in sc.objects if o.type == "ARMATURE")
for o in sc.objects:
    if o.type == "MESH" and o.name.startswith("skin"):
        o.hide_render = True
# cloth-ish materials per part
COL = {"tunic": (0.33, 0.29, 0.17), "trousers": (0.27, 0.24, 0.15), "puttees": (0.24, 0.21, 0.14), "webbing": (0.46, 0.4, 0.26),
       "leather": (0.15, 0.08, 0.04), "boots": (0.05, 0.03, 0.02), "brass": (0.6, 0.42, 0.15), "glove": (0.9, 0.9, 0.9)}
tex = os.path.join(ROOT, "public", "textures", "Fabric026", "Color.jpg")
nrm = os.path.join(ROOT, "public", "textures", "Fabric026", "NormalGL.jpg")
for o in sc.objects:
    if o.type != "MESH": continue
    key = next((k for k in COL if o.name.startswith(k)), None)
    if not key: continue
    m = bpy.data.materials.new(key); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*COL[key], 1)
    b.inputs["Roughness"].default_value = 0.85 if key not in ("brass",) else 0.35
    if key == "brass": b.inputs["Metallic"].default_value = 1.0
    if key in ("tunic", "trousers", "puttees", "webbing"):
        ti = nt.nodes.new("ShaderNodeTexImage"); ti.image = bpy.data.images.load(tex)
        mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (6, 6, 6)
        tc = nt.nodes.new("ShaderNodeTexCoord"); nt.links.new(tc.outputs["UV"], mp.inputs["Vector"]); nt.links.new(mp.outputs["Vector"], ti.inputs["Vector"])
        mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.blend_type = "MULTIPLY"; mix.inputs[0].default_value = 0.8
        mix.inputs[6].default_value = (*COL[key], 1); nt.links.new(ti.outputs["Color"], mix.inputs[7]); nt.links.new(mix.outputs[2], b.inputs["Base Color"])
        ni = nt.nodes.new("ShaderNodeTexImage"); ni.image = bpy.data.images.load(nrm); ni.image.colorspace_settings.name = "Non-Color"
        nt.links.new(mp.outputs["Vector"], ni.inputs["Vector"])
        nm = nt.nodes.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = 1.5
        nt.links.new(ni.outputs["Color"], nm.inputs["Color"]); nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    o.data.materials.clear(); o.data.materials.append(m)

# our round head (white, ink outline via solidify-backface) on the head bone
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.3, segments=48, ring_count=24)
head = bpy.context.object
hm = bpy.data.materials.new("head"); hm.use_nodes = True; hm.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.92, 0.92, 0.9, 1)
hm.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.6
head.data.materials.append(hm)
head.parent = arm; head.parent_type = "BONE"; head.parent_bone = "mixamorig:Head" if "mixamorig:Head" in arm.data.bones else "mixamorigHead"
head.location = (0, 0.22, 0.02)

# ground: mud texture plane
bpy.ops.mesh.primitive_plane_add(size=40)
g = bpy.context.object
gm = bpy.data.materials.new("mud"); gm.use_nodes = True; gnt = gm.node_tree; gb = gnt.nodes["Principled BSDF"]
gti = gnt.nodes.new("ShaderNodeTexImage"); gti.image = bpy.data.images.load(os.path.join(ROOT, "public", "textures", "Ground054", "Color.jpg"))
gmp = gnt.nodes.new("ShaderNodeMapping"); gmp.inputs["Scale"].default_value = (12, 12, 12)
gtc = gnt.nodes.new("ShaderNodeTexCoord"); gnt.links.new(gtc.outputs["UV"], gmp.inputs["Vector"]); gnt.links.new(gmp.outputs["Vector"], gti.inputs["Vector"])
gdk = gnt.nodes.new("ShaderNodeMix"); gdk.data_type = "RGBA"; gdk.blend_type = "MULTIPLY"; gdk.inputs[0].default_value = 1.0
gdk.inputs[7].default_value = (0.45, 0.38, 0.3, 1); gnt.links.new(gti.outputs["Color"], gdk.inputs[6]); gnt.links.new(gdk.outputs[2], gb.inputs["Base Color"]); gb.inputs["Roughness"].default_value = 0.9
g.data.materials.append(gm)

# photo sky + sun
w = bpy.data.worlds.new("sky"); sc.world = w; w.use_nodes = True
env = w.node_tree.nodes.new("ShaderNodeTexEnvironment")
env.image = bpy.data.images.load(os.path.join(ROOT, "public", "sky", "kloofendal_48d_partly_cloudy_puresky.hdr"))
w.node_tree.links.new(env.outputs["Color"], w.node_tree.nodes["Background"].inputs["Color"])
bpy.ops.object.light_add(type="SUN", rotation=(math.radians(50), 0, math.radians(30)))
bpy.context.object.data.energy = 3.0; bpy.context.object.data.angle = math.radians(3)

# camera
sc.frame_set(20)
bpy.context.view_layer.update()
import mathutils
pts = [o.matrix_world @ mathutils.Vector(c) for o in sc.objects if o.type == "MESH" and o.parent == arm for c in o.bound_box]
lo = mathutils.Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
hi = mathutils.Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
print("SOLDIER BOX", tuple(round(v, 2) for v in lo), tuple(round(v, 2) for v in hi))
k = 1.45 / max(1e-6, hi.z - lo.z)  # the FBX comes in centimetre-scaled: bring the body to 1.45 m
arm.scale = arm.scale * k
bpy.context.view_layer.update()
pts = [o.matrix_world @ mathutils.Vector(c) for o in sc.objects if o.type == "MESH" and o.parent == arm for c in o.bound_box]
lo = mathutils.Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
hi = mathutils.Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
print("SOLDIER BOX scaled", tuple(round(v, 2) for v in lo), tuple(round(v, 2) for v in hi))
centre = (lo + hi) / 2
bpy.ops.object.empty_add(location=(centre.x, centre.y, centre.z + 0.15)); aim = bpy.context.object
bpy.ops.object.camera_add(location=(centre.x + 0.9, centre.y - 3.4, centre.z + 0.2))
cam = bpy.context.object; sc.camera = cam; cam.data.lens = 40
c = cam.constraints.new("TRACK_TO"); c.target = aim; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"
sc.view_settings.view_transform = "AgX"; sc.view_settings.exposure = -0.8

r = sc.render; r.resolution_x, r.resolution_y = 540, 960; r.filepath = out
if engine == "CYCLES":
    r.engine = "CYCLES"
    cp = bpy.context.preferences.addons["cycles"].preferences; cp.compute_device_type = "CUDA"; cp.get_devices()
    for d in cp.devices: d.use = d.type == "CUDA"
    sc.cycles.device = "GPU"; sc.cycles.samples = 64; sc.cycles.use_denoising = True
else:
    r.engine = "BLENDER_EEVEE_NEXT"
    sc.eevee.taa_render_samples = 32
t0 = time.time(); bpy.ops.render.render(write_still=True); print(f"RENDER {engine} {time.time() - t0:.1f}s -> {out}")
