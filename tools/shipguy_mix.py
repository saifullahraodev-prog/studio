"""The Ship Guy: mix voice + procedural music bed + sound effects for a timeline.

Usage: python -I tools/shipguy_mix.py <slug>
Reads public/shipguy/<slug>/timeline.json + voice.wav, writes public/shipguy/<slug>/mix.wav (-14 LUFS).
Music mood per beat comes from the beat's `music=` param (sticky until changed); default "investigate".
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "audio"))
import sfx  # noqa: E402

SR = sfx.SR


def read_wav(p: Path) -> np.ndarray:
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0


def write_wav(p: Path, x: np.ndarray):
    y = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(p), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())


def main(slug: str):
    pub = ROOT / "public" / "shipguy" / slug
    tl = json.loads((pub / "timeline.json").read_text(encoding="utf-8"))
    fps = tl["fps"]
    dur = tl["frames"] / fps
    voice = read_wav(pub / "voice.wav")
    n = int(dur * SR)
    voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]

    # music: segments from the sticky music= param
    segs, mood = [], "investigate"
    for b in tl["beats"]:
        mood = b["p"].get("music", mood)
        s0, s1 = b["from"] / fps, (b["from"] + b["dur"]) / fps
        if segs and segs[-1][2] == mood:
            segs[-1] = (segs[-1][0], s1, mood)
        else:
            segs.append((s0, s1, mood))
    music = sfx.music_bed(segs, dur)

    # sound effects
    ev = []
    for i, b in enumerate(tl["beats"]):
        t0 = b["from"] / fps
        if i > 0:
            ev.append((t0, "whoosh", 0.45))
        tpl, p = b["tpl"], b["p"]
        if tpl == "attack":
            ev.append((t0 + 1.2, "impact", 0.9))
        if tpl == "sea" and p.get("state") == "fire":
            ev.append((t0, "fire_bed", 0.5, b["dur"] / fps))
        if p.get("stamp"):
            ev.append((t0 + b["dur"] / fps * 0.15, "stamp", 0.9))
        if tpl == "stat":
            ev.append((t0 + 0.15, "riser", 0.4)); ev.append((t0 + 1.15, "pop", 0.8))
        if tpl in ("names", "card", "batillus", "gates"):
            ev.append((t0 + 0.4, "ding", 0.35))
        if tpl == "bridge" and p.get("shake") == "1":
            ev.append((t0, "crunch", 0.5))
        if tpl == "lengthen" and p.get("phase") == "3":
            ev.append((t0 + 0.2, "ding", 0.5))
    fx = sfx.render_events(ev, dur)[:n]
    fx = np.pad(fx, (0, max(0, n - len(fx))))

    mix = voice * 1.0 + music * 0.16 + fx * 0.35
    tmp = pub / "mix-raw.wav"
    write_wav(tmp, mix / max(1.0, np.abs(mix).max()))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), str(pub / "mix.wav")], check=True)
    tmp.unlink()
    print(f"mix.wav: {dur:.1f}s, {len(segs)} music segments, {len(ev)} sound events")


if __name__ == "__main__":
    main(sys.argv[1])
