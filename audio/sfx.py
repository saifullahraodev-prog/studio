"""Procedural sound library: every sound is synthesised in code (no downloads,
no licences). 48 kHz float32 mono arrays in -1..1.

    whoosh hit boom crunch pop boing ding stamp fire tick
    music_bed(segments, duration)  -> light plucky comedy loop / tense pulse
"""
import numpy as np

SR = 48000
_rng = np.random.default_rng(7)


def _t(sec):
    return np.arange(int(sec * SR)) / SR


def _env(n, attack=0.005, release=0.2, sec=None):
    a = max(1, int(attack * SR))
    r = max(1, int(release * SR))
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    if r < n:
        e[-r:] *= np.linspace(1, 0, r) ** 2
    return e


def _noise(n):
    return _rng.uniform(-1, 1, n)


def _lp(x, cutoff):
    # one-pole low-pass (cutoff may be an array for sweeps)
    c = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x)
    s = 0.0
    for i in range(len(x)):
        s = (1 - a[i]) * x[i] + a[i] * s
        y[i] = s
    return y


def _bp(x, lo, hi):
    return _lp(x, hi) - _lp(x, lo)


def _sine_sweep(f0, f1, sec, curve=1.0):
    t = _t(sec)
    f = f0 + (f1 - f0) * (t / sec) ** curve
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1
    return (x / m * peak).astype(np.float32)


# ── sounds ──────────────────────────────────────────────────────────────────
def whoosh(sec=0.38):
    n = int(sec * SR)
    t = np.linspace(0, 1, n)
    centre = 400 + 2600 * np.sin(np.pi * t) ** 1.5
    x = _bp(_noise(n), centre * 0.6, centre * 1.4)
    return norm(x * np.sin(np.pi * t) ** 2, 0.8)


def hit(sec=0.28):
    body = _sine_sweep(140, 45, sec, 0.4) * _env(int(sec * SR), 0.002, sec * 0.9)
    click = _lp(_noise(int(0.02 * SR)), 3000)
    body[: len(click)] += click * 0.6
    return norm(body, 0.95)


def boom(sec=1.4):
    n = int(sec * SR)
    low = _sine_sweep(70, 32, sec, 0.5) * np.exp(-_t(sec) * 2.2)
    rumble = _lp(_noise(n), 180) * np.exp(-_t(sec) * 1.6) * 3
    return norm(low + rumble, 0.95)


def crunch(sec=0.7):
    n = int(sec * SR)
    x = np.zeros(n)
    # cluster of cracks (ice breaking) + a heavy thump
    for _ in range(38):
        p = int(_rng.uniform(0, 0.45) * SR)
        L = int(_rng.uniform(0.004, 0.03) * SR)
        if p + L < n:
            x[p : p + L] += _lp(_noise(L), _rng.uniform(1500, 6000)) * _rng.uniform(0.3, 1)
    x += _sine_sweep(90, 38, sec, 0.5) * np.exp(-_t(sec) * 4) * 1.4
    return norm(x * _env(n, 0.001, 0.25), 0.95)


def pop(sec=0.09):
    return norm(_sine_sweep(520, 980, sec, 0.6) * _env(int(sec * SR), 0.001, 0.07), 0.7)


def boing(sec=0.55):
    t = _t(sec)
    f = 180 + 220 * (1 - np.exp(-t * 9)) + 35 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 3)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return norm(x * _env(len(t), 0.003, 0.35), 0.75)


def ding(sec=0.9):
    t = _t(sec)
    x = np.sin(2 * np.pi * 1318.5 * t) + 0.45 * np.sin(2 * np.pi * 2637 * t) + 0.2 * np.sin(2 * np.pi * 3950 * t)
    return norm(x * np.exp(-t * 4.5) * _env(len(t), 0.002, 0.1), 0.6)


def stamp(sec=0.22):
    body = _sine_sweep(180, 70, sec, 0.3) * np.exp(-_t(sec) * 18)
    click = _lp(_noise(int(0.015 * SR)), 5000)
    body[: len(click)] += click * 0.8
    return norm(body, 0.95)


def fire(sec=1.6):
    n = int(sec * SR)
    x = _lp(_noise(n), 900) * 0.4
    for _ in range(60):
        p = int(_rng.uniform(0, sec - 0.02) * SR)
        L = int(0.006 * SR)
        x[p : p + L] += _noise(L) * _rng.uniform(0.2, 0.9)
    return norm(x * _env(n, 0.15, 0.4), 0.6)


def tick(sec=0.03):
    return norm(_lp(_noise(int(sec * SR)), 4000) * _env(int(sec * SR), 0.001, 0.02), 0.4)


SOUNDS = {"whoosh": whoosh, "hit": hit, "boom": boom, "crunch": crunch, "pop": pop, "boing": boing, "ding": ding, "stamp": stamp, "fire": fire, "tick": tick}
GAINS = {"whoosh": 0.45, "hit": 0.8, "boom": 0.9, "crunch": 0.95, "pop": 0.45, "boing": 0.5, "ding": 0.45, "stamp": 0.8, "fire": 0.35, "tick": 0.25}


# ── music ───────────────────────────────────────────────────────────────────
def _pluck(freq, sec=0.5):
    # Karplus-Strong plucked string
    n = int(sec * SR)
    period = max(2, int(SR / freq))
    buf = _noise(period) * 0.5
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = 0.5 * (buf[i % period] + buf[(i + 1) % period]) * 0.996
    return out


NOTE = lambda m: 440.0 * 2 ** ((m - 69) / 12)  # midi -> Hz


def music_bed(segments, duration):
    """segments: [(start_sec, end_sec, mood)] with mood 'light' | 'tense'."""
    out = np.zeros(int(duration * SR) + SR)
    bpm = 112
    step = 60 / bpm / 2  # eighth notes
    light_prog = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]  # C Am F G
    tense_prog = [[45, 48, 52], [45, 48, 51], [44, 48, 51], [43, 46, 50]]  # Am-ish chromatic walk
    plucks = {}
    for s0, s1, mood in segments:
        i = 0
        t = s0
        while t < s1:
            bar = int(i // 8) % 4
            if mood == "light":
                chord = light_prog[bar]
                pattern = [0, 2, 1, 2, 0, 2, 1, 2]
                m = chord[pattern[i % 8]] + 12
                key = ("l", m)
                if key not in plucks:
                    plucks[key] = _pluck(NOTE(m), 0.45) * 0.5
                note = plucks[key]
                if i % 8 == 0:  # bass on the bar
                    bk = ("b", chord[0] - 12)
                    if bk not in plucks:
                        plucks[bk] = _pluck(NOTE(chord[0] - 12), 0.9) * 0.9
                    _add(out, plucks[bk], t)
            else:
                chord = tense_prog[bar]
                if i % 2 == 0:  # low pulsing eighths
                    m = chord[0] - 12
                    key = ("t", m)
                    if key not in plucks:
                        plucks[key] = (np.sin(2 * np.pi * NOTE(m) * _t(0.22)) * np.exp(-_t(0.22) * 9)) * 0.9
                    note = plucks[key]
                else:
                    note = None
            if note is not None:
                _add(out, note, t)
            i += 1
            t += step
    return norm(out[: int(duration * SR)], 0.8)


def _add(out, x, t):
    p = int(t * SR)
    if p >= len(out):
        return
    L = min(len(x), len(out) - p)
    out[p : p + L] += x[:L]


def render_events(events, duration):
    """events: [(time_sec, name)] -> mono track."""
    out = np.zeros(int(duration * SR) + SR, dtype=np.float32)
    cache = {}
    for t, name in events:
        if name not in SOUNDS:
            continue
        if name not in cache:
            cache[name] = SOUNDS[name]() * GAINS[name]
        _add(out, cache[name], max(0.0, t))
    return out[: int(duration * SR)]
