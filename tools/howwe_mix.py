"""How We Ended Up · auto sound mix from a scene list.

Usage (from studio/):  python -I tools/howwe_mix.py <scenes.json> <slug> [--voice path.wav] [--music piano|pizz|path/to/track.mp3|curious=a.mp3,soft=b.mp3,sparse=c.mp3] [--out name.wav]
Writes public/howwe/<slug>/mix.wav (-14 LUFS, true peak -1.5 dB) + public/howwe/<slug>/cues.json (every cue, for review).

Cue rules follow the animation timings in engine/howwe/motion.tsx (TIMING) and templates.tsx. Keep them in sync.
Music ducks under a voice track when one is given; it "hushes" (pad only) while the reveal lights are down.
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "audio"))
import howwe_sfx as hx  # noqa: E402
from sfx import SR, _add, _movavg  # noqa: E402

FPS = 30
TIMING = {"rise": 12, "cardDelay": 6, "card": 10, "stagger": 14, "mapFill": 20, "lightsDown": 10, "lightsUp": 20, "dolly": 22, "door": 20}
T_IN = {"cut": 0, "dolly": TIMING["dolly"], "door": TIMING["door"]}


def timeline(scenes):
    starts, t = [], 0
    for i, s in enumerate(scenes):
        if i > 0:
            t -= T_IN.get(s.get("in", "cut"), 0)
        starts.append(t)
        t += s["dur"]
    return starts, t


def cues(scenes):
    """-> list of (sec, sound, gain, note) + hush windows [(t0, t1)] + hum windows"""
    starts, total = timeline(scenes)
    ev, hush, hums = [], [], []
    sec = lambda fr: fr / FPS
    for i, s in enumerate(scenes):
        t0, d, p, kind = starts[i], s["dur"], s.get("p", {}), s["t"]
        tin = s.get("in", "cut")
        if i > 0 and tin == "dolly":
            ev.append((sec(t0), "footsteps", 1.0, "dolly"))
        if i > 0 and tin == "door":
            ev.append((sec(t0), "door", 1.0, "door"))
        if kind == "exhibits":
            for k, _ in enumerate(p.get("items", [])):
                st = t0 + 8 + k * TIMING["stagger"]
                ev.append((sec(st + 9), "place", 1.0 - 0.08 * k, f"exhibit {k + 1} lands"))
                ev.append((sec(st + TIMING["cardDelay"] + 2), "paper", 1.0, f"card {k + 1}"))
            if "focus" in p:
                ev.append((sec(t0 + d * p.get("focusAt", 0.55)), "air", 0.8, "push-in"))
        elif kind == "map":
            ev.append((sec(t0 + 6), "air", 1.0, "frame push"))
            scale = [74, 78, 81, 86]  # D, F#, A, D (rising chimes per category)
            for k, _ in enumerate(p.get("order", [])):
                ev.append((sec(t0 + 30 + k * 26), "chime", 1.0, f"fill {k + 1}", scale[k % 4]))
            for r in p.get("routes", []):
                ev.append((sec(t0 + d * r["at"]), "pen", 1.0, "route"))
        elif kind == "period":
            if p.get("washIn", True):
                ev.append((sec(t0 + 2), "paper", 0.8, "tint wash"))
            rooms = [p.get("left"), p.get("right")]
            if "china1500" in rooms:  # cook chops every 16 frames (chopUp loop)
                f = 8
                while f < d - 10:
                    ev.append((sec(t0 + f), "chop", 0.9 if (f // 16) % 3 else 0.6, "chop", (f // 16) % 3))
                    f += 16
        elif kind == "today":
            for k, f in enumerate(range(20, d - 10, 52)):
                ev.append((sec(t0 + f), "clink", 1.0, "clink", k))
        elif kind == "cardFlip":
            ev.append((sec(t0 + 10), "place", 0.8, "card lands"))
            ev.append((sec(t0 + d * 0.45 + 6), "flip", 1.0, "flip to correction"))
        elif kind == "reveal":
            down = t0 + d * 0.12
            up = t0 + d - TIMING["lightsUp"] - TIMING["dolly"]
            ev.append((sec(down), "clunk", 1.0, "lights down"))
            ev.append((sec(t0 + d * 0.38 + 6), "flip", 1.0, "answer card"))
            ev.append((sec(t0 + d * 0.45), "chime", 0.9, "answer line", 69))
            ev.append((sec(up), "clunk", 0.6, "lights up"))
            hush.append((sec(down), sec(up + 6)))
            hums.append((sec(down + 4), sec(up)))
        elif kind == "titleWall":
            for k, m in enumerate([74, 78, 81]):
                ev.append((sec(t0 + 4 + k * 5), "chime", 0.9, "title", m))
    return ev, hush, hums, total / FPS


def render(ev, hums, dur):
    out = np.zeros(int((dur + 3) * SR), dtype=np.float32)
    cache = {}
    for e in ev:
        t, name, g = e[0], e[1], e[2]
        arg = e[4] if len(e) > 4 else None
        key = (name, arg)
        if key not in cache:
            fn = hx.SOUNDS[name]
            cache[key] = (fn(arg) if arg is not None else fn()) * hx.GAINS[name]
        _add(out, cache[key] * g, t)
    for a, b in hums:
        _add(out, hx.hum(max(0.5, b - a)) * hx.GAINS["hum"], a)
    return out[: int(dur * SR)]


def track_bed(path, dur, hush):
    """A downloaded music track as the bed: looped (2 s crossfade) or trimmed to the video length,
    loudness-levelled (RMS), and softened to 25% during reveal hush windows."""
    x = read_wav(path)
    n = int(dur * SR) + SR
    xf = 2 * SR
    y = x[:n].copy()
    while len(y) < n:
        ramp = np.linspace(0, 1, xf, dtype=np.float32)
        y[-xf:] = y[-xf:] * (1 - ramp) + x[:xf] * ramp
        y = np.concatenate([y, x[xf:]])[:n]
    # level by average loudness (RMS -> about -16 dBFS), not by peak, so every track sits at the same level; cap peaks
    rms = float(np.sqrt(np.mean(y.astype(np.float64) ** 2))) or 1.0
    y = y * (0.16 / rms)
    y = y / max(1.0, float(np.max(np.abs(y))) / 0.95)
    env = np.ones(len(y))
    r = int(0.4 * SR)
    for a, b in hush:
        ia, ib = int(a * SR), int(b * SR)
        env[ia:ib] = 0.25
        env[max(0, ia - r):ia] = np.linspace(1, 0.25, ia - max(0, ia - r))
        env[ib:ib + r] = np.linspace(0.25, 1, len(env[ib:ib + r]))
    return (y * env)[: int(dur * SR)]


MOOD_BY_TEMPLATE = {"today": "curious", "exhibits": "curious", "map": "curious", "cardFlip": "curious",
                    "period": "soft", "reveal": "sparse", "titleWall": "sparse"}


def mood_beds(scenes, spec, dur, hush, xfade=1.5):
    """One track per mood (scene "music" field, else MOOD_BY_TEMPLATE). All tracks run on the same clock from t=0,
    so a crossfade (xfade s) at each mood change never restarts a song."""
    import re
    paths = dict(kv.split("=", 1) for kv in re.split(r",(?=\w+=)", spec))  # file names may contain commas
    beds = {m: track_bed(ROOT / p, dur, hush) for m, p in paths.items()}
    starts, _ = timeline(scenes)
    n = int(dur * SR)
    moods = [s.get("music") or MOOD_BY_TEMPLATE.get(s["t"], "curious") for s in scenes]
    weights = {m: np.zeros(n) for m in beds}
    for i, m in enumerate(moods):
        a = int(starts[i] / FPS * SR)
        b = int(starts[i + 1] / FPS * SR) if i + 1 < len(scenes) else n
        weights.setdefault(m, np.zeros(n))[a:b] = 1.0
    k = max(1, int(xfade * SR))
    out = np.zeros(n)
    for m, w in weights.items():
        if m in beds:
            out += beds[m][:n] * _movavg(w, k)  # O(n) smoothing = crossfade
    return out


def read_wav(p):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0


def write_wav(p, x):
    x = np.clip(x, -1, 1)
    with wave.open(str(p), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def main():
    args = sys.argv[1:]
    scenes_file, slug = args[0], args[1]
    voice_path = args[args.index("--voice") + 1] if "--voice" in args else None
    style = args[args.index("--music") + 1] if "--music" in args else "piano"
    out_name = args[args.index("--out") + 1] if "--out" in args else "mix.wav"
    scenes = json.loads((ROOT / scenes_file).read_text(encoding="utf-8"))["scenes"]
    ev, hush, hums, dur = cues(scenes)
    n = int(dur * SR)
    sfx = render(ev, hums, dur)
    if "=" in style:  # mood set: "curious=a.mp3,soft=b.mp3,sparse=c.mp3" -> crossfade by scene
        mus = mood_beds(scenes, style, dur, hush) * hx.GAINS["music"]
    elif Path(style).suffix.lower() in (".mp3", ".wav", ".flac", ".ogg", ".m4a"):
        mus = track_bed(ROOT / style, dur, hush) * hx.GAINS["music"]  # a real (licensed) music file
    else:
        mus = hx.music(dur, hush=hush, style=style) * hx.GAINS["music"]
    tone = hx.roomtone(dur) * hx.GAINS["roomtone"]
    if voice_path:
        voice = read_wav(ROOT / voice_path)
        voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]
        # duck music under speech (smoothed envelope)
        env = np.abs(voice)
        env = _movavg(env, int(0.25 * SR))
        duck = 1 - 0.5 * np.clip(env / (np.max(env) * 0.25 or 1), 0, 1)
        mus = mus * duck
    else:
        voice = np.zeros(n)
    # fade music in/out
    f = int(1.0 * SR)
    mus[:f] *= np.linspace(0, 1, f)
    mus[-2 * f:] *= np.linspace(1, 0, 2 * f)
    mix = voice + sfx[:n] + mus[:n] + tone[:n]
    pub = ROOT / "public" / "howwe" / slug
    pub.mkdir(parents=True, exist_ok=True)
    tmp = pub / "_premix.wav"
    write_wav(tmp, mix / (np.max(np.abs(mix)) or 1) * 0.8)
    # two-pass loudnorm: measure, then apply linearly (single pass under-shoots on sparse material)
    m = subprocess.run(["ffmpeg", "-v", "info", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
    ln = ("loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:"
          f"measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af", ln, "-ar", str(SR), str(pub / out_name)], check=True)
    tmp.unlink()
    (pub / "cues.json").write_text(json.dumps({"duration": dur, "hush": hush, "cues": [[round(e[0], 2), e[1], e[3]] for e in sorted(ev)]}, indent=1), encoding="utf-8")
    print(f"{len(ev)} cues, {dur:.1f} s, music={style} -> public/howwe/{slug}/{out_name}")


if __name__ == "__main__":
    main()
