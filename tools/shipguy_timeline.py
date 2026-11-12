"""The Ship Guy: time every beat in beats.txt to the voice recording.

Usage: python -I tools/shipguy_timeline.py videos/<dir> <slug>
Needs <dir>/beats.txt, <dir>/voice.wav, <dir>/words.json (faster-whisper word timings).
Writes public/shipguy/<slug>/timeline.json and copies voice.wav next to it.
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from build_video import align  # noqa: E402  (same word aligner as the Shorts pipeline)

FPS = 30


def parse(path: Path):
    beats = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        spec, cap, say = [x.strip() for x in line.split("||")]
        parts = spec.split()
        params = dict(kv.split("=", 1) for kv in parts[1:])
        beats.append({"tpl": parts[0], "p": params, "cap": cap, "say": say})
    return beats


def duration(path: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True, check=True).stdout
    return float(out.strip())


def main(vdir: str, slug: str):
    vd = ROOT / vdir
    beats = parse(vd / "beats.txt")
    words = json.loads((vd / "words.json").read_text(encoding="utf-8"))
    total = duration(vd / "voice.wav")
    al = align(" ".join(b["say"] for b in beats), words)
    k = 0
    for b in beats:
        n = len(re.findall(r"[A-Za-z0-9'’\-]+[?.!,]?", b["say"]))
        seg = al[k:k + n]
        k += n
        b["voiceStart"], b["voiceEnd"] = seg[0][1], seg[-1][2]
    lead = 0.15  # cut a little before the first word of the beat
    out = []
    for i, b in enumerate(beats):
        start = 0.0 if i == 0 else b["voiceStart"] - lead
        end = beats[i + 1]["voiceStart"] - lead if i + 1 < len(beats) else total + 1.5
        f0, f1 = round(start * FPS), round(end * FPS)
        out.append({"tpl": b["tpl"], "p": b["p"], "cap": b["cap"], "from": f0, "dur": max(1, f1 - f0), "say": b["say"]})
    pub = ROOT / "public" / "shipguy" / slug
    pub.mkdir(parents=True, exist_ok=True)
    shutil.copy(vd / "voice.wav", pub / "voice.wav")
    frames = out[-1]["from"] + out[-1]["dur"]
    (pub / "timeline.json").write_text(json.dumps({"fps": FPS, "frames": frames, "beats": out}, indent=1), encoding="utf-8")
    durs = [b["dur"] / FPS for b in out]
    print(f"{len(out)} beats, {frames / FPS:.1f}s, beat length min {min(durs):.1f}s / avg {sum(durs) / len(durs):.1f}s / max {max(durs):.1f}s")
    for b in out:
        if b["dur"] / FPS > 9:
            print(f"  long beat {b['dur'] / FPS:.1f}s at {b['from'] / FPS:.1f}s: {b['say'][:60]}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
