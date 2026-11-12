"""The Ship Guy: cut a vertical Short's data from a long-form timeline.

Usage: python -I tools/shipguy_short.py videos/<dir> <slug> <first_beat> <last_beat>   (1-based, inclusive)
Writes public/shipguy/<slug>/short.json (beats re-timed from 0 + per-word captions in script spelling)
and public/shipguy/<slug>/short.wav (the mix for that span, short fade-out).
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from build_video import align  # noqa: E402

TOK = r"[A-Za-z0-9'’\-]+[?.!,]?"


def main(vdir, slug, a, b):
    a, b = int(a) - 1, int(b) - 1
    pub = ROOT / "public" / "shipguy" / slug
    tl = json.loads((pub / "timeline.json").read_text(encoding="utf-8"))
    fps = tl["fps"]
    beats = tl["beats"][a:b + 1]
    f0 = beats[0]["from"]
    f1 = beats[-1]["from"] + beats[-1]["dur"]
    words = json.loads((ROOT / vdir / "words.json").read_text(encoding="utf-8"))
    t0, t1 = f0 / fps, f1 / fps
    span = [w for w in words if t0 - 0.05 <= w["start"] < t1]
    text = " ".join(x["say"] for x in beats)
    al = align(text, span)
    caps, k = [], 0
    for w in text.split():
        n = len(re.findall(TOK, w))
        if n == 0:
            continue
        seg = al[k:k + n]; k += n
        caps.append({"w": w, "s": round(seg[0][1] - t0, 3), "e": round(seg[-1][2] - t0, 3)})
    out = [{**x, "from": x["from"] - f0} for x in beats]
    dur = (f1 - f0) / fps
    (pub / "short.json").write_text(json.dumps({"fps": fps, "frames": f1 - f0, "beats": out, "words": caps}, indent=1), encoding="utf-8")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t0:.3f}", "-t", f"{dur:.3f}", "-i", str(pub / "mix.wav"),
                    "-af", f"afade=t=out:st={max(0, dur - 0.15):.3f}:d=0.15", str(pub / "short.wav")], check=True)
    print(f"short: beats {a + 1}-{b + 1}, {dur:.1f}s, {len(caps)} caption words")


if __name__ == "__main__":
    main(*sys.argv[1:5])
