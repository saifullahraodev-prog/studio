"""Golden test: no stripe pattern (moire / shadow acne) on any face, in any lighting preset.

    python -I tools/facecheck.py            (renders with node tools/still.mjs, ~10 s per preset)

For each preset it renders the FaceCheck composition twice (pen hatching on / off) and measures the
fine-detail energy that hatching adds INSIDE each face. Faces must be identical -> score < LIMIT.
It also measures raw fine-stripe energy on each face (catches shadow acne, which would show in both).
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out" / "facecheck"
STYLE = json.loads((ROOT / "engine" / "look" / "style-v1.2.json").read_text(encoding="utf-8"))
W, H, N = 2400, 600, 8
PX_PER_UNIT = H / (2 * 26 * np.tan(np.radians(3.3)))
GAP_PX = 1.45 * PX_PER_UNIT
LIMIT_DIFF, LIMIT_STRIPE = 0.35, 3.0


def load(png):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(png), "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(H, W).astype(np.float32)


def highpass(a):
    b = (a[:-2, 1:-1] + a[2:, 1:-1] + a[1:-1, :-2] + a[1:-1, 2:] + 4 * a[1:-1, 1:-1]) / 8
    return a[1:-1, 1:-1] - b


def faces(img):
    hp = np.abs(highpass(img))
    for i in range(N):
        cx = int(W / 2 + (i - (N - 1) / 2) * GAP_PX)
        r = int(0.85 * 0.62 * PX_PER_UNIT)  # the head disk (lit + shadow side), minus the outline
        yield i, hp[300 - r // 2 : 300 + r, cx - r : cx + r]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    ok = True
    for preset in STYLE["lighting"]:
        imgs = {}
        for hatch in ("true", "false"):
            f = OUT / f"{preset}-{hatch}.png"
            r = subprocess.run([sys.executable if False else "node", "tools/still.mjs", "FaceCheck", str(f.relative_to(ROOT)), f"preset={preset}", f"hatch={hatch}"], cwd=ROOT, capture_output=True, text=True)
            if r.returncode != 0:
                print(r.stdout[-400:], r.stderr[-400:])
                raise SystemExit(f"render failed: {preset}")
            imgs[hatch] = load(f)
        worst_diff = worst_stripe = 0.0
        for (i, a), (_, b) in zip(faces(imgs["true"]), faces(imgs["false"])):
            worst_diff = max(worst_diff, float(np.mean(np.abs(a - b))))
            worst_stripe = max(worst_stripe, float(np.mean(a)))  # whole-head fine detail (acne would raise it)
        good = worst_diff < LIMIT_DIFF and worst_stripe < LIMIT_STRIPE
        ok &= good
        print(f"{'ok  ' if good else 'FAIL'} {preset:<9} hatch-on-face {worst_diff:5.2f} (< {LIMIT_DIFF})   stripe energy {worst_stripe:5.2f} (< {LIMIT_STRIPE})")
    print("All faces clean." if ok else "Stripes found on faces.")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
