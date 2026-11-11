# studio_fx: volumetric fire for the Blender test (flamethrower jet + burning floor + smoke).
import bpy, math
from mathutils import Vector


def fire_material(name="fire", heat=1.0, smoke=0.0, falloff=False):
    """Animated volume: 4D noise drives density + glow, blackbody colour (orange/yellow core)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    out = nt.nodes["Material Output"]
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    vol = nt.nodes.new("ShaderNodeVolumePrincipled")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.noise_dimensions = "4D"
    nz.inputs["Scale"].default_value = 5.5
    nz.inputs["Detail"].default_value = 8
    nz.inputs["Roughness"].default_value = 0.6
    nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
    # animate the noise through time (W) with a driver on the frame
    d = nz.inputs["W"].driver_add("default_value").driver
    d.expression = "frame / 9.0"
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.5
    ramp.color_ramp.elements[1].position = 0.68
    nt.links.new(nz.outputs["Fac"], ramp.inputs["Fac"])
    dens = nt.nodes.new("ShaderNodeMath")
    dens.operation = "MULTIPLY"
    dens.inputs[1].default_value = 2.2 if not smoke else 2.5
    nt.links.new(ramp.outputs["Color"], dens.inputs[0])
    shaped = dens.outputs[0]
    if falloff:  # soft round edges instead of the container's hard surface
        gr = nt.nodes.new("ShaderNodeTexGradient")
        gr.gradient_type = "SPHERICAL"
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Location"].default_value = (-1.0, -1.0, -1.0)
        mp.inputs["Scale"].default_value = (2, 2, 2)
        nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"])
        mp2 = nt.nodes.new("ShaderNodeVectorMath")
        mp2.operation = "SCALE"
        mp2.inputs["Scale"].default_value = 1.0
        nt.links.new(mp.outputs["Vector"], gr.inputs["Vector"])
        g2 = nt.nodes.new("ShaderNodeMath")
        g2.operation = "MULTIPLY"
        nt.links.new(shaped, g2.inputs[0])
        nt.links.new(gr.outputs["Fac"], g2.inputs[1])
        shaped = g2.outputs[0]
    nt.links.new(shaped, vol.inputs["Density"])
    if smoke:
        vol.inputs["Color"].default_value = (0.05, 0.045, 0.04, 1)
        vol.inputs["Emission Strength"].default_value = 0.0
    else:
        vol.inputs["Color"].default_value = (0.02, 0.01, 0.005, 1)
        vol.inputs["Absorption Color"].default_value = (0.05, 0.02, 0.01, 1)
        em = nt.nodes.new("ShaderNodeMath")
        em.operation = "MULTIPLY"
        em.inputs[1].default_value = 28.0 * heat
        nt.links.new(shaped, em.inputs[0])
        nt.links.new(em.outputs[0], vol.inputs["Emission Strength"])
        # hot yellow core -> orange -> deep red edges, from the same noise
        er = nt.nodes.new("ShaderNodeValToRGB")
        er.color_ramp.elements[0].position = 0.3
        er.color_ramp.elements[0].color = (0.9, 0.12, 0.01, 1)
        er.color_ramp.elements[1].position = 0.85
        er.color_ramp.elements[1].color = (1.0, 0.55, 0.12, 1)
        nt.links.new(nz.outputs["Fac"], er.inputs["Fac"])
        nt.links.new(er.outputs["Color"], vol.inputs["Emission Color"])
    nt.links.new(vol.outputs[0], out.inputs["Volume"])
    return m


def fire_jet(start, end, f0, grow=7, r0=0.06, r1=0.75, drop=0.6):
    """A tapering tube of fire from start to end; the front races out over `grow` frames from frame f0."""
    s, e = Vector(start), Vector(end)
    cu = bpy.data.curves.new("jet", "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = 1.0
    cu.bevel_resolution = 6
    cu.use_fill_caps = True
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(2)
    mid = (s + e) / 2 + Vector((0, 0, drop * 0.5))
    for bp, p, rad in zip(sp.bezier_points, (s, mid, e), (r0, (r0 + r1) / 2, r1)):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = "AUTO"
        bp.radius = rad
    ob = bpy.data.objects.new("fire_jet", cu)
    bpy.context.scene.collection.objects.link(ob)
    ob.data.materials.append(fire_material("fire_jet"))
    cu.bevel_factor_mapping_end = "SPLINE"
    cu.bevel_factor_end = 0.0
    cu.keyframe_insert("bevel_factor_end", frame=f0)
    cu.bevel_factor_end = 1.0
    cu.keyframe_insert("bevel_factor_end", frame=f0 + grow)
    # orange light along the jet (it lights the trench walls and faces)
    for i, k in enumerate((0.35, 0.75)):
        bpy.ops.object.light_add(type="POINT", location=s.lerp(e, k) + Vector((0, 0, 0.2)))
        L = bpy.context.object
        L.data.color = (1.0, 0.55, 0.2)
        L.data.shadow_soft_size = 0.6
        L.data.energy = 0.0
        L.data.keyframe_insert("energy", frame=f0 + int(grow * k) - 1)
        L.data.energy = 900.0
        L.data.keyframe_insert("energy", frame=f0 + int(grow * k) + 2)
    return ob


def floor_fire(center, f0, n=5, spread=1.2, height=1.4):
    """Burning patches on the trench floor + a smoke column, starting at frame f0."""
    c = Vector(center)
    mat = fire_material("floor_fire", 0.8, falloff=True)
    for i in range(n):
        a = i * 2.4
        loc = c + Vector((math.cos(a) * spread * 0.3, (i - n / 2) * spread * 0.5, height * 0.4))
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=1, location=loc)
        b = bpy.context.object
        b.data.materials.append(mat)
        b.scale = (0.001, 0.001, 0.001)
        b.keyframe_insert("scale", frame=f0 + i)
        b.scale = (0.45, 0.45, height * 0.6)
        b.keyframe_insert("scale", frame=f0 + i + 6)
    bpy.ops.mesh.primitive_cylinder_add(radius=1.2, depth=6, location=c + Vector((0, 0, 3.5)))
    sm = bpy.context.object
    sm.data.materials.append(fire_material("smoke", smoke=1.0, falloff=True))
    sm.scale = (0.001, 0.001, 0.001)
    sm.keyframe_insert("scale", frame=f0)
    sm.scale = (1, 1, 1)
    sm.keyframe_insert("scale", frame=f0 + 12)
