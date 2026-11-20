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


TRACKS_DIR = ROOT / "audio" / "library" / "howwe"  # YouTube Audio Library tracks (licence in audio/LICENSES.md)
TRACK_SETS = {
    # owner 2026-11-16: "the music is too loud and annoying" -> real, calm tracks instead of the code-made bed
    "calm": {"tense": "sparse-Laniakea - The Grey Room, Density & Time.mp3", "main": "curious-Behold The Mystery - Asher Fulero.mp3",
             "quiet": "soft-Snowfall - Asher Fulero.mp3", "hopeful": "soft-Fascination - Gregory Allison.mp3"},
}
MOOD_TO_TRACK = {"tense": "tense", "investigate": "main", "light": "main", "ragtime": "main", "somber": "quiet", "quiet": "quiet", "hopeful": "hopeful"}


def track_bed(path: Path, n: int) -> np.ndarray:
    """a music file looped (2 s crossfade) or trimmed to n samples, levelled by RMS."""
    x = read_wav(path)
    xf = 2 * SR
    y = x[:n].copy()
    while len(y) < n:
        r = np.linspace(0, 1, xf, dtype=np.float32)
        y[-xf:] = y[-xf:] * (1 - r) + x[:xf] * r
        y = np.concatenate([y, x[xf:]])[:n]
    rms = float(np.sqrt(np.mean(y.astype(np.float64) ** 2))) or 1.0
    return y * (0.16 / rms)


def real_music(segs, dur: float, voice: np.ndarray, set_name: str) -> np.ndarray:
    n = int(dur * SR)
    files = TRACK_SETS[set_name]
    beds = {k: track_bed(TRACKS_DIR / f, n) for k, f in files.items()}
    w = {k: np.zeros(n, dtype=np.float32) for k in beds}
    level = np.zeros(n, dtype=np.float32)
    for s0, s1, m in segs:
        k = MOOD_TO_TRACK.get(m, "main")
        a, b = int(s0 * SR), int(s1 * SR)
        w[k][a:b] = 1.0
        level[a:b] = 0.45 if m == "quiet" else 1.0  # the serious part: soft track, even lower
    k = int(1.5 * SR)

    def smooth(x: np.ndarray, kk: int = k) -> np.ndarray:  # centred moving average via cumulative sum (fast)
        c = np.cumsum(np.concatenate([np.zeros(1), x.astype(np.float64)]))
        i = np.arange(len(x)); lo = np.clip(i - kk // 2, 0, len(x)); hi = np.clip(i + kk // 2, 0, len(x))
        return ((c[hi] - c[lo]) / np.maximum(1, hi - lo)).astype(np.float32)
    out = sum(beds[m] * smooth(w[m]) for m in beds) * smooth(level)
    # duck under the voice (about -6 dB while speaking)
    env = smooth(np.abs(voice), int(0.25 * SR))
    duck = 1 - 0.5 * np.clip(env / ((np.max(env) * 0.2) or 1), 0, 1)
    out = out * duck
    f = int(1.0 * SR)
    out[:f] *= np.linspace(0, 1, f); out[-2 * f:] *= np.linspace(1, 0, 2 * f)
    return out.astype(np.float32)


def main(slug: str, tracks: str = ""):
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
    # "quiet" (video #5, the serious part): the light theme, played very low
    segs_raw = list(segs)
    quiet = [(s0, s1) for s0, s1, m in segs if m == "quiet"]
    segs = [(s0, s1, "light" if m == "quiet" else m) for s0, s1, m in segs]
    music = sfx.music_bed(segs, dur) if not tracks else np.zeros(1, dtype=np.float32)
    for s0, s1 in (quiet if not tracks else []):
        a, b = int(s0 * SR), int(s1 * SR)
        ramp_n = int(1.5 * SR)
        env = np.ones(b - a, dtype=np.float32) * 0.22
        env[:ramp_n] = np.linspace(1.0, 0.22, min(ramp_n, b - a))[: len(env[:ramp_n])]
        music[a:b] *= env[: len(music[a:b])]

    # sound effects
    ev = []
    for i, b in enumerate(tl["beats"]):
        t0 = b["from"] / fps
        tpl, p = b["tpl"], b["p"]
        if i > 0:
            # carrier video: the Forrestal part is quiet (a soft cut sound only, no comic sounds)
            ev.append((t0, "whoosh", 0.15 if tpl == "forrestal" else 0.45))
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
        # --- Dali templates (video #5). Serious beats (radio/under/memorial) get no comic sounds.
        if tpl == "truss" and p.get("mode") == "hit":
            ev.append((t0 + 0.1, "impact", 0.55))
        if tpl == "truss" and p.get("mode") == "collapse":
            ev.append((t0 + 0.4, "crunch", 0.35))
        if tpl == "night" and p.get("state") in ("dark", "flicker") or tpl == "wheel" and p.get("act") in ("dark", "dark2"):
            ev.append((t0 + 0.4, "hit", 0.35))
        if tpl == "wire" and p.get("step") == "loose":
            ev.append((t0 + 0.7, "pop", 0.6))
        if tpl in ("price", "clocks") or (tpl == "dali" and p.get("scene") in ("stack", "weight")) or (tpl == "port" and p.get("step") in ("cars", "pile")):
            ev.append((t0 + 0.15, "riser", 0.35)); ev.append((t0 + 1.2, "pop", 0.6))
        if tpl == "blast" and p.get("step") == "2":
            ev.append((t0 + 0.35, "boom", 0.7))
        if tpl in ("power", "route", "usmap", "fort", "ntsb", "pump") or (tpl == "wire" and p.get("step") in ("labels", "wrong", "half", "wall")):
            ev.append((t0 + 0.4, "ding", 0.28))
        if p.get("act") in ("brake", "pushslide", "cool", "ears") or p.get("guy") in ("push", "pushslide") or (tpl == "crane" and p.get("step") == "secret"):
            ev.append((t0 + 0.3, "boing", 0.35))
        if tpl == "anchor" and p.get("step") == "drop":
            ev.append((t0 + 0.5, "crunch", 0.3))
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
        # --- carrier templates (video #6)
        st = p.get("step") or p.get("mode") or p.get("view") or ""
        if tpl == "jetside" and st == "fly" or tpl == "plane" and p.get("kind") == "growler":
            ev.append((t0, "jet", 0.4))
        if tpl == "jetside" and st == "touch":
            ev.append((t0 + 0.45, "hit", 0.8)); ev.append((t0 + 0.55, "jet", 0.6))
        if tpl == "jetside" and st == "grab":
            for k in range(5): ev.append((t0 + 0.6 + k * 0.4, "tick", 0.7))
        if tpl == "jetside" and st == "climb":
            ev.append((t0, "jet", 0.5))
        if tpl == "throttle":
            ev.append((t0 + 0.27, "stamp", 0.6)); ev.append((t0 + 0.3, "jet", 0.7))
        if tpl == "cockpit" and (p.get("ring") == "1" or st == "box"):
            ev.append((t0 + 0.35, "ding", 0.3))
        if tpl == "cv" and st in ("length", "weight", "xray"):
            ev.append((t0 + 0.15, "riser", 0.35)); ev.append((t0 + 0.9, "pop", 0.6))
        if tpl == "cv" and st in ("two", "town", "helps", "title"):
            ev.append((t0 + 0.4, "pop", 0.5))
        if tpl == "cv" and st == "speed":
            ev.append((t0 + 0.2, "boing", 0.35))
        if tpl == "eiffel":
            ev.append((t0 + 0.3, "riser", 0.4)); ev.append((t0 + 1.2, "ding", 0.5))
        if tpl == "group":
            ev.append((t0 + 0.3, "pop", 0.45))
            if st == "escorts": ev.append((t0 + 1.5, "hit", 0.35))
        if tpl == "deck":
            for k in range(4): ev.append((t0 + 0.1 + k * 0.15, "pop", 0.4))
        if tpl == "plane":
            ev.append((t0 + 0.4, "ding", 0.3))
        if tpl == "runway" and st in ("compare", "short"):
            ev.append((t0 + 0.5, "boing", 0.3))
        if tpl == "cat":
            if st == "hold": ev.append((t0, "jet", 0.45))
            if st == "jbd": ev.append((t0 + 0.2, "crunch", 0.25))
            if st == "shooter": ev.append((t0 + 0.8, "ding", 0.35))
            if st == "launch": ev.append((t0 + 0.4, "hiss", 0.8)); ev.append((t0 + 0.45, "jet", 0.6)); ev.append((t0 + 0.6, "boing", 0.3))
            if st == "speed": ev.append((t0 + 0.1, "riser", 0.4)); ev.append((t0 + 2.1, "ding", 0.5))
            if st == "steam": ev.append((t0 + 0.7, "hiss", 0.6))
            if st in ("track", "hook", "check"): ev.append((t0 + 0.3, "pop", 0.45))
        if tpl == "emals":
            ev.append((t0 + 0.3, "zap", 0.6))
        if tpl == "wind":
            ev.append((t0 + 0.2, "whoosh", 0.35))
        if tpl == "meatball":
            ev.append((t0 + 0.3, "ding", 0.3))
        if tpl == "lso" and p.get("talk") == "1":
            ev.append((t0 + 0.3, "pop", 0.45))
        if tpl == "wires":
            if st in ("top", "count", "aim", "margin"): ev.append((t0 + 0.3, "pop", 0.45))
            if st == "catch": ev.append((t0 + 0.9, "hit", 0.7)); ev.append((t0 + 1.1, "twang", 0.8))
            if st == "below": ev.append((t0 + 0.4, "hiss", 0.5))
            if st == "stop": ev.append((t0 + 0.2, "twang", 0.5))
            if st == "pile": ev.append((t0 + 0.1, "twang", 0.7)); ev.append((t0 + 0.6, "boing", 0.45)); ev.append((t0 + 0.9, "crunch", 0.3))
            if st == "beat":
                for k in range(3): ev.append((t0 + 0.2 + k * 0.45, "hit", 0.35))
            if st == "inspect": ev.append((t0 + 0.6, "ding", 0.35))
        if tpl == "bolter":
            if st == "miss": ev.append((t0 + 0.6, "hit", 0.4)); ev.append((t0 + 0.9, "jet", 0.5))
            if p.get("label") == "1": ev.append((t0 + 0.15, "stamp", 0.8))
            if st == "low": ev.append((t0 + 1.6, "boom", 0.35))
            if st == "go": ev.append((t0 + 0.2, "jet", 0.6))
        if tpl == "angled":
            ev.append((t0 + 0.3, "ding", 0.35))
        if tpl == "barricade":
            ev.append((t0 + 0.3, "riser" if p.get("step") == "1" else "crunch", 0.35))
        if tpl == "flightdeck":
            ev.append((t0, "jet", 0.3))
        if tpl in ("jersey", "jerseys"):
            ev.append((t0 + 0.2, "pop", 0.5))
            if tpl == "jersey" and p.get("c") == "purple": ev.append((t0 + 1.4, "boing", 0.3))
        if tpl in ("island", "cycle"):
            ev.append((t0 + 0.4, "ding", 0.3))
        if tpl in ("hangar", "elevator"):
            ev.append((t0 + 0.3, "pop", 0.45))
            if tpl == "elevator" and p.get("step") == "2": ev.append((t0 + 0.4, "riser", 0.35))
        if tpl == "reactor":
            ev.append((t0 + 0.2, "zap" if st in ("ford", "ford2", "emals") else "pop", 0.45))
            if st == "steam": ev.append((t0 + 0.3, "hiss", 0.5))
        if tpl == "unrep":
            ev.append((t0 + 0.3, "pop", 0.45))
            if st == "2": ev.append((t0, "jet", 0.35))
        if tpl == "town":
            if st in ("meals", "water", "litres"): ev.append((t0 + 0.15, "riser", 0.35)); ev.append((t0 + 1.2, "ding", 0.45))
            elif st == "bunks": ev.append((t0 + 1.4, "boing", 0.45))
            elif st == "extras":
                for k in range(4): ev.append((t0 + k * (b["dur"] / fps) / 4, "pop", 0.5))
            else: ev.append((t0 + 0.3, "pop", 0.4))
        if tpl == "ford":
            if st == "commission": ev.append((t0 + 0.7, "pop", 0.5)); ev.append((t0 + 0.8, "ding", 0.5))
            if st == "cost": ev.append((t0 + 0.15, "stamp", 0.7)); ev.append((t0 + 0.5, "boing", 0.35))
            if st in ("parts1", "parts2"): ev.append((t0 + 0.2, "ding", 0.35)); ev.append((t0 + 1.0, "ding", 0.35))
            if st == "goal": ev.append((t0, "jet", 0.35))
        if tpl == "sorties":
            if st in ("160", "270"): ev.append((t0 + 0.1, "riser", 0.4)); ev.append((t0 + 1.3, "ding", 0.45))
            else: ev.append((t0 + 0.2, "stamp", 0.7))
        if tpl == "finale":
            if st == "stop": ev.append((t0 + 0.2, "ding", 0.5))
            if st == "sum":
                for k in range(3): ev.append((t0 + 0.7 + k * 1.33, "pop", 0.55))
            if st == "job": ev.append((t0 + 0.2, "jet", 0.4))
        if tpl == "endcard6":
            ev.append((t0 + 0.2, "ding", 0.5))
        if tpl == "guy" and p.get("act") == "think":
            ev.append((t0 + 0.25, "pop", 0.4))
    fx = sfx.render_events(ev, dur)[:n]
    fx = np.pad(fx, (0, max(0, n - len(fx))))

    if tracks == "none":
        # owner 2026-11-16: "remove the music, just the video and sfx" -> voice + sound effects only
        mix = voice * 1.0 + fx * 0.3
    elif tracks:
        music = real_music(segs_raw, dur, voice, tracks)
        mix = voice * 1.0 + music * 0.075 + fx * 0.3   # real tracks, well under the voice
    else:
        mix = voice * 1.0 + music * 0.16 + fx * 0.35
    tmp = pub / "mix-raw.wav"
    write_wav(tmp, mix / max(1.0, np.abs(mix).max()))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), str(pub / "mix.wav")], check=True)
    tmp.unlink()
    print(f"mix.wav: {dur:.1f}s, {len(segs)} music segments, {len(ev)} sound events")


if __name__ == "__main__":
    a = sys.argv[1:]
    main(a[0], a[a.index("--tracks") + 1] if "--tracks" in a else "")
