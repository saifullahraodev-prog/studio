"""Join Blender cut renders into public/videos/<slug>/blender.mp4 (picture for the BlenderShort composition).

usage: python -I tools/blender_video.py <slug> [preview]
Cuts are taken in scenes.json order from out/blender/<slug>/cut<NN>_####.png. A cut that isn't
rendered yet becomes black frames of the right length, so captions and sound stay in sync.
"""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
slug = sys.argv[1]
preview = len(sys.argv) > 2 and sys.argv[2] == "preview"
data = json.loads((ROOT / "public" / "videos" / slug / "scenes.json").read_text(encoding="utf-8"))
fps = data["fps"]
cuts = [c for b in data["beats"] for c in b["cuts"]]
src = ROOT / "out" / "blender" / (slug + ("-preview" if preview else ""))
tmp = src / "_join"
tmp.mkdir(parents=True, exist_ok=True)
for old in tmp.glob("*.png"):
    old.unlink()

k = 0
first = next(iter(sorted(src.glob("cut*_0001.png"))), None)
size = None
if first:
    probe = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", str(first)], capture_output=True, text=True).stdout.strip()
    size = probe.replace(",", "x")
for i, c in enumerate(cuts):
    n = max(1, round(c["end"] * fps) - round(c["start"] * fps))
    frames = sorted(src.glob(f"cut{i:02d}_*.png"))
    for f in range(n):
        k += 1
        dst = tmp / f"f{k:05d}.png"
        if frames:
            dst.write_bytes(frames[min(f, len(frames) - 1)].read_bytes())
        else:
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"color=black:s={size or '540x960'}", "-frames:v", "1", str(dst)], check=True)
    print(f"cut {i:02d} {c['shot']:<22} {n:3d} frames {'rendered' if frames else 'BLACK (not rendered yet)'}")

out = ROOT / "public" / "videos" / slug / "blender.mp4"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(fps), "-i", str(tmp / "f%05d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", str(out)], check=True)
print(f"-> {out} ({k} frames)")
