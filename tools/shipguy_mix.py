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
        if p.get("stamp") and p.get("stamp") != "0":
            ev.append((t0 + b["dur"] / fps * 0.15, "stamp", 0.9))
        if tpl == "stat":
            ev.append((t0 + 0.15, "riser", 0.4)); ev.append((t0 + 1.15, "pop", 0.8))
        if tpl in ("names", "card", "batillus", "gates"):
            ev.append((t0 + 0.4, "ding", 0.35))
        if tpl == "bridge" and p.get("shake") == "1":
            ev.append((t0, "crunch", 0.5))
        if tpl == "lengthen" and p.get("phase") == "3":
            ev.append((t0 + 0.2, "ding", 0.5))
        # --- Ever Given templates (video #3)
        sec = b["dur"] / fps
        if tpl == "canal" and p.get("impact") == "1":
            ev.append((t0 + 0.1, "impact", 0.8))
        if tpl == "canal" and p.get("state") == "free":
            ev.append((t0 + sec * 0.5, "ding", 0.5))
        if tpl == "bridge" and p.get("act") == "impact":
            ev.append((t0 + 0.4, "impact", 0.9)); ev.append((t0 + 0.9, "crunch", 0.5))
        if tpl == "dial":
            ev.append((t0 + 0.2, "riser", 0.3))
        if tpl == "money" and p.get("mode") in ("day", "pct"):
            ev.append((t0 + 0.15, "riser", 0.4)); ev.append((t0 + 1.4, "pop", 0.7))
        if tpl == "money" and p.get("mode") == "invoice":
            ev.append((t0 + 0.3, "pop", 0.6))
            if p.get("step") == "3":
                ev.append((t0 + 0.25, "stamp", 0.9)); ev.append((t0 + 0.9, "ding", 0.45))
        if tpl in ("map", "boxline", "pools", "tower", "moon") or (tpl == "side" and p.get("scene") in ("flags", "stack", "pitches")):
            ev.append((t0 + 0.5, "ding", 0.3))
        if tpl == "report" and p.get("step") in ("2", "3", "4"):
            ev.append((t0 + 0.25, "stamp", 0.6))
        if tpl == "side" and p.get("scene") == "cheer":
            ev.append((t0, "crowd_bed", 0.55, sec))
        if tpl == "side" and p.get("scene") in ("digger", "digging", "push", "bow"):
            ev.append((t0 + 0.3, "boing", 0.25))
        if p.get("guy") == "shock" or p.get("act") == "shock" or p.get("corner") in ("shock", "faint"):
            ev.append((t0 + 0.35, "boing", 0.35))
        if p.get("act") == "laugh":
            ev.append((t0 + 0.2, "pop", 0.4))
        # --- Ship cost templates (video #4): a sound on every reveal (owner: retention first)
        if tpl == "tag":
            ev.append((t0 + 0.42, "pop", 0.8)); ev.append((t0 + 0.5, "ding", 0.55))
        if tpl == "pladder":
            ev.append((t0, "riser", 0.3)); ev.append((t0 + 0.3, "boing", 0.25)); ev.append((t0 + 0.55, "pop", 0.5))
        if tpl == "vsyacht":
            ev.append((t0 + 0.5, "hit", 0.45) if p.get("mode") == "scale" else (t0 + 0.3, "riser", 0.3))
        if tpl == "permetre":
            ev.append((t0 + 0.1, "riser", 0.35)); ev.append((t0 + 0.9, "pop", 0.5))
            if p.get("mode") == "both":
                ev.append((t0 + 1.7, "ding", 0.5))
        if tpl == "stack":
            for k in range(3):
                ev.append((t0 + k * 0.33, "pop", 0.6))
            ev.append((t0 + 1.15, "ding", 0.5))
        if tpl == "listing":
            ev.append((t0 + 0.1, "pop", 0.5)); ev.append((t0 + 0.75, "ding", 0.55))
        if tpl == "cold":
            m = p.get("mode")
            if m == "temp": ev.append((t0 + 0.1, "riser", 0.4))
            if m == "crack": ev.append((t0 + 0.4, "crunch", 0.6))
            if m == "fuel": ev.append((t0 + 0.3, "fire", 0.35))
            if m == "cut": ev.append((t0 + 0.8, "pop", 0.4))
        if tpl == "slot":
            ev.append((t0 + 0.5, "pop", 0.6)); ev.append((t0 + 0.75, "ding", 0.5))
        if tpl == "kilo":
            ev.append((t0 + 0.1, "pop", 0.5)); ev.append((t0 + 0.55, "stamp", 0.8))
        if tpl == "fleet":
            ev.append((t0 + 0.1, "riser", 0.4))
            for k in range(6):
                ev.append((t0 + 0.2 + k * 0.22, "tick", 0.6))
            ev.append((t0 + 1.5, "ding", 0.5))
        if tpl == "sub" and p.get("cut") != "1":
            ev.append((t0 + 0.1, "boom", 0.3))
        if p.get("act") == "amazed":
            ev.append((t0 + 0.15, "pop", 0.45))
        if tpl == "endhire":
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
