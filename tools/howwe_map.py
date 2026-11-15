"""Convert Natural Earth admin-0 countries (public domain) into projected SVG paths for How We Ended Up maps.

Usage (from studio/):  python -I tools/howwe_map.py 110m|50m
Input:  public/howwe/naturalearth/ne_<res>_admin_0_countries.geojson  (downloaded 2026-11-15, see CREDITS.md)
Output: engine/howwe/data/world-<res>.json  -> {"w":1000,"h":..., "countries": {A3: {"n": name, "d": svg path, "lx","ly": label pt}}}
Projection: Equal Earth (Šavrič, Patterson, Jenny 2018), width 1000 units, Antarctica dropped.
"""
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
A1, A2, A3, A4 = 1.340264, -0.081106, 0.000893, 0.003796
M = math.sqrt(3) / 2
XMAX, YMAX = 2.70663, 1.31731  # Equal Earth extents for lon ±180, lat ±90
W = 1000.0
H = W * YMAX / XMAX


def project(lon, lat):
    lam, phi = math.radians(lon), math.radians(lat)
    th = math.asin(M * math.sin(phi))
    t2 = th * th
    t6 = t2 * t2 * t2
    x = lam * math.cos(th) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)))
    y = th * (A1 + A2 * t2 + t6 * (A3 + A4 * t2))
    return round((x + XMAX) / (2 * XMAX) * W, 1), round((YMAX - y) / (2 * YMAX) * H, 1)


def ring_path(ring):
    pts = []
    last = None
    for lon, lat in ring:
        p = project(lon, lat)
        if p != last:
            pts.append(p)
            last = p
    if len(pts) < 3:
        return ""
    return "M" + "L".join(f"{x:g} {y:g}" for x, y in pts) + "Z"


def main(res):
    src = ROOT / "public" / "howwe" / "naturalearth" / f"ne_{res}_admin_0_countries.geojson"
    data = json.loads(src.read_text(encoding="utf-8"))
    out = {}
    for f in data["features"]:
        p = f["properties"]
        a3 = p.get("ADM0_A3")
        if a3 == "ATA":
            continue
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        d = "".join(ring_path(r) for poly in polys for r in poly)
        lx, ly = project(p.get("LABEL_X", 0), p.get("LABEL_Y", 0))
        out[a3] = {"n": p.get("NAME"), "d": d, "lx": lx, "ly": ly}
    dst = ROOT / "engine" / "howwe" / "data" / f"world-{res}.json"
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(json.dumps({"w": W, "h": round(H, 1), "source": f"Natural Earth {res} admin-0 (public domain)", "countries": out}, separators=(",", ":")), encoding="utf-8")
    print(f"{len(out)} countries -> {dst.relative_to(ROOT)} ({dst.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "110m")
