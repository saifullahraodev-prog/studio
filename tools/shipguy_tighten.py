"""The Ship Guy: shorten long silences in a CapCut voice (owner 2026-11-16: "the start has some gaps").

Usage: python -I tools/shipguy_tighten.py videos/<dir> [--max 0.6] [--keep 0.4] [--hold 389-452 ...]
(--hold A-B: seconds in the RAW voice where pauses are left untouched.)
Every pause between two words longer than --max seconds is cut down to --keep seconds (the cut is taken from the
middle of the silence, with short crossfades, so no word is touched). Word timings are shifted to match.
The first run saves the originals as voice-raw.wav / words-raw.json and always works from those, so it can be re-run.
"""
import json
import shutil
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000


def read(p: Path) -> np.ndarray:
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0


def main(vdir: str, mx: float = 0.6, keep: float = 0.4, hold: tuple = ()):
    vd = Path(vdir)
    raw_v, raw_w = vd / "voice-raw.wav", vd / "words-raw.json"
    if not raw_v.exists():
        shutil.copy(vd / "voice.wav", raw_v)
        shutil.copy(vd / "words.json", raw_w)
    x = read(raw_v)
    words = json.loads(raw_w.read_text(encoding="utf-8"))
    cuts = []  # (start_s, end_s) of audio to remove
    for a, b in zip(words, words[1:]):
        gap = b["start"] - a["end"]
        if any(h0 <= a["end"] <= h1 for h0, h1 in hold):
            continue  # a quiet section whose pauses must stay (e.g. a memorial part)
        if gap > mx:
            remove = gap - keep
            mid = (a["end"] + b["start"]) / 2
            cuts.append((mid - remove / 2, mid + remove / 2))
    fade = int(0.012 * SR)
    out, pos = [], 0
    for s, e in cuts:
        i, j = int(s * SR), int(e * SR)
        seg = x[pos:i].copy()
        if len(seg) > fade:
            seg[-fade:] *= np.linspace(1, 0, fade)
        out.append(seg)
        pos = j
        nxt = x[pos:pos + fade]
        if len(nxt) == fade:
            x[pos:pos + fade] = nxt * np.linspace(0, 1, fade)
    out.append(x[pos:])
    y = np.concatenate(out)
    with wave.open(str(vd / "voice.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())

    def shift(t: float) -> float:
        return t - sum(min(e, t) - s for s, e in cuts if s < t)

    nw = [{"word": w["word"], "start": round(shift(w["start"]), 3), "end": round(shift(w["end"]), 3)} for w in words]
    (vd / "words.json").write_text(json.dumps(nw, indent=1), encoding="utf-8")
    saved = sum(e - s for s, e in cuts)
    print(f"{len(cuts)} pauses shortened, {saved:.1f} s removed: {len(x) / SR:.1f} s -> {len(y) / SR:.1f} s")


if __name__ == "__main__":
    args = sys.argv[1:]
    mx = float(args[args.index("--max") + 1]) if "--max" in args else 0.6
    kp = float(args[args.index("--keep") + 1]) if "--keep" in args else 0.4
    hold = tuple(tuple(float(v) for v in args[i + 1].split("-")) for i, a in enumerate(args) if a == "--hold")
    main(args[0], mx, kp, hold)
