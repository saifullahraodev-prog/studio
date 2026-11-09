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


def riser(sec=0.5):
    n = int(sec * SR)
    t = np.linspace(0, 1, n)
    centre = 300 + 3500 * t ** 2
    x = _bp(_noise(n), centre * 0.6, centre * 1.4) * t ** 2.2
    x[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
    return norm(x, 0.8)



# ── soft whooshes: 4 variants (length / pitch / brightness), picked in turn so they never repeat
def _whoosh_var(sec, lo, hi, seed):
    r = np.random.default_rng(seed)
    n = int(sec * SR)
    t = np.linspace(0, 1, n)
    centre = lo + (hi - lo) * np.sin(np.pi * t) ** 1.5
    x = _bp(r.uniform(-1, 1, n), centre * 0.7, centre * 1.3)
    x = _lp(x, 2500)  # airy, not hissy
    return norm(x * np.sin(np.pi * t) ** 2.5, 0.8)


WHOOSHES = [lambda: _whoosh_var(0.30, 300, 1400, 1), lambda: _whoosh_var(0.36, 250, 1100, 2),
            lambda: _whoosh_var(0.26, 400, 1800, 3), lambda: _whoosh_var(0.40, 200, 900, 4)]


def _reverb(x, sec=1.6, wet=0.35):
    """cheap room/hull reverb: decaying noise convolution (FFT)"""
    n = int(sec * SR)
    ir = _rng.uniform(-1, 1, n) * np.exp(-_t(sec) * 4.5)
    ir = _lp(ir, 3000)
    L = len(x) + n
    y = np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)
    y = y / (np.max(np.abs(y)) or 1) * np.max(np.abs(x))
    return np.concatenate([x, np.zeros(n)]) * (1 - wet) + y * wet


def impact(sec=2.8):
    """big iceberg hit: crack cluster + deep boom + long hull groan, with a reverb tail,
    so the hit carries smoothly into the next shot instead of stopping dead"""
    n = int(sec * SR)
    x = np.zeros(n)
    c = crunch(0.7)
    x[: len(c)] += c * 0.9
    x += _sine_sweep(75, 30, sec, 0.45) * np.exp(-_t(sec) * 1.4) * 1.1  # boom
    x += _lp(_noise(n), 220) * np.exp(-_t(sec) * 1.1) * 2.2  # rumble
    # metal hull groan: slow detuned low saws, bandpassed
    t = _t(sec)
    g = np.zeros(n)
    for f0, d in [(62, 0.0), (64.5, 0.7), (93, 1.3)]:
        f = f0 * (1 + 0.04 * np.sin(2 * np.pi * 0.7 * t + d))
        ph = np.cumsum(f) / SR
        g += 2 * (ph % 1) - 1
    g = _bp(g, 80, 600) * np.clip((t - 0.15) / 0.4, 0, 1) * np.exp(-np.maximum(t - 0.6, 0) * 1.3)
    x += g * 0.9
    y = _reverb(x * _env(n, 0.001, 0.6), 1.4, 0.3)
    return norm(y, 0.95)


def scream(sec=1.8, seed=11):
    """distant crowd screams: several voices (glottal saw + vibrato + pitch glide) through
    'ah' / 'ee' vowel formants, staggered, with reverb (they are far away on deck)"""
    r = np.random.default_rng(seed)
    n = int(sec * SR)
    out = np.zeros(n)
    formants = {"ah": [(800, 1.0), (1150, 0.6), (2900, 0.25)], "ee": [(350, 0.8), (2300, 0.6), (3000, 0.3)], "eh": [(600, 1.0), (1900, 0.5), (2600, 0.25)]}
    for v in range(6):
        start = r.uniform(0, 0.45)
        dur = r.uniform(0.7, 1.25)
        m = int(dur * SR)
        t = _t(dur)
        base = r.choice([380.0, 450.0, 520.0, 300.0, 610.0])
        # rise fast, hold with vibrato, fall at the end
        f = base * (0.75 + 0.35 * np.clip(t / 0.12, 0, 1) - 0.3 * np.clip((t - dur * 0.7) / (dur * 0.3), 0, 1) ** 2)
        f *= 1 + 0.025 * np.sin(2 * np.pi * r.uniform(5.5, 7.5) * t) + 0.01 * r.uniform(-1, 1, m).cumsum() / np.sqrt(m)
        ph = np.cumsum(f) / SR
        src = (2 * (ph % 1) - 1) + _rng.uniform(-1, 1, m) * 0.25  # rough, breathy
        vowel = formants[r.choice(list(formants))]
        y = sum(_bp(src, fc * 0.88, fc * 1.12) * a for fc, a in vowel)
        y *= _env(m, 0.04, dur * 0.4) * r.uniform(0.5, 1.0)
        p0 = int(start * SR)
        L = min(m, n - p0)
        out[p0 : p0 + L] += y[:L]
    out = _lp(out, 3800)
    return norm(_reverb(out, 1.2, 0.45), 0.8)


SOUNDS = {"impact": impact, "scream": scream, "riser": riser, "whoosh": whoosh, "hit": hit, "boom": boom, "crunch": crunch, "pop": pop, "boing": boing, "ding": ding, "stamp": stamp, "fire": fire, "tick": tick}
GAINS = {"impact": 1.0, "scream": 0.42, "riser": 0.3, "swish": 0.16, "whoosh": 0.22, "hit": 0.8, "boom": 0.9, "crunch": 0.95, "pop": 0.45, "boing": 0.5, "ding": 0.45, "stamp": 0.8, "fire": 0.35, "tick": 0.25}


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


def _beds(duration, bpm=112):
    """Both moods rendered on ONE shared beat grid from t=0, so switching mood never
    restarts or shifts the rhythm. Returns (light, tense, step)."""
    step = 60 / bpm / 2  # eighth notes
    n = int(duration * SR) + SR
    light, tense = np.zeros(n), np.zeros(n)
    light_prog = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]  # C Am F G
    tense_prog = [[45, 48, 52], [45, 48, 51], [44, 48, 51], [43, 46, 50]]  # Am-ish chromatic walk
    cache = {}

    def get(key, make):
        if key not in cache:
            cache[key] = make()
        return cache[key]

    kick = lambda: _sine_sweep(110, 45, 0.16, 0.5) * np.exp(-_t(0.16) * 22) * 0.9
    hat = lambda: _bp(_noise(int(0.035 * SR)), 6000, 12000) * _env(int(0.035 * SR), 0.001, 0.03) * 0.35
    i, t = 0, 0.0
    while t < duration:
        bar = (i // 8) % 4
        # shared groove in both moods: soft kick on beats 1+3, hat on every eighth
        if i % 4 == 0:
            _add(light, get("k", kick), t)
            _add(tense, get("k", kick), t)
        h = get("h", hat) * (1.0 if i % 2 else 0.55)
        _add(light, h, t)
        _add(tense, h, t)
        # light: plucky arpeggio + bass on the bar
        ch = light_prog[bar]
        m = ch[[0, 2, 1, 2, 0, 2, 1, 2][i % 8]] + 12
        _add(light, get(("l", m), lambda: _pluck(NOTE(m), 0.45) * 0.5), t)
        if i % 8 == 0:
            _add(light, get(("b", ch[0]), lambda: _pluck(NOTE(ch[0] - 12), 0.9) * 0.9), t)
        # tense: driving low pulse on every eighth (accent on the beat) + a high tick
        ch = tense_prog[bar]
        m = ch[0] - 12
        pulse = get(("t", m), lambda: np.sin(2 * np.pi * NOTE(m) * _t(0.2)) * np.exp(-_t(0.2) * 11))
        _add(tense, pulse * (0.95 if i % 2 == 0 else 0.55), t)
        if i % 8 == 4:
            _add(tense, get(("tt", ch[2]), lambda: _pluck(NOTE(ch[2] + 12), 0.3) * 0.35), t)
        i += 1
        t += step
    # tense: a low sustained drone under the pulse, following the chord root, so the bed
    # never drops to silence between notes
    tt = np.arange(n) / SR
    bar_idx = ((tt / (step * 8)).astype(int)) % 4
    root = np.array([NOTE(c[0] - 12) for c in tense_prog])[bar_idx]
    k = int(0.08 * SR)
    root = np.convolve(root, np.ones(k) / k, mode="same")  # glide between chords
    ph = np.cumsum(root) / SR
    drone = (2 * (ph % 1) - 1) + (2 * ((ph * 1.004) % 1) - 1)
    drone = _lp(drone, 380) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.25 * tt))
    tense += drone * 0.22
    return light, tense, step


def music_bed(segments, duration, xfade=0.35):
    """segments: [(start_sec, end_sec, mood)] with mood 'light' | 'tense'.
    One continuous groove; moods cross-fade instead of restarting."""
    light, tense, _ = _beds(duration)
    n = len(light)
    w = np.zeros(n)  # 0 = light, 1 = tense
    for s0, s1, mood in segments:
        if mood == "tense":
            w[int(s0 * SR) : int(s1 * SR)] = 1.0
    if segments:
        w[int(segments[-1][1] * SR) :] = w[max(0, int(segments[-1][1] * SR) - 1)]
    k = max(1, int(xfade * SR))
    w = np.convolve(w, np.ones(k) / k, mode="same")  # smooth mood switches
    w = np.clip(w, 0.0, 1.0)
    light = light * 2.2  # level-match the plucky bed to the tense one (measured ~7 dB quieter)
    out = light * np.sqrt(1 - w) + tense * np.sqrt(w)
    return norm(out[: int(duration * SR)], 0.8)


def beat_step(bpm=112):
    return 60 / bpm / 2


def _add(out, x, t):
    p = int(t * SR)
    if p >= len(out):
        return
    L = min(len(x), len(out) - p)
    out[p : p + L] += x[:L]


def render_events(events, duration):
    """events: [(time_sec, name)] or [(time_sec, name, gain)] -> mono track.
    'whoosh' / 'swish' rotate through 4 variants so repeats never sound the same."""
    out = np.zeros(int(duration * SR) + 3 * SR, dtype=np.float32)
    cache = {}
    k = 0
    for ev in events:
        t, name = ev[0], ev[1]
        g = ev[2] if len(ev) > 2 else 1.0
        if name in ("whoosh", "swish"):
            key = (name, k % len(WHOOSHES))
            k += 1
            if key not in cache:
                cache[key] = WHOOSHES[key[1]]() * GAINS[name]
        elif name in SOUNDS:
            key = name
            if key not in cache:
                cache[key] = SOUNDS[name]() * GAINS[name]
        else:
            continue
        _add(out, cache[key] * g, max(0.0, t))
    return out[: int(duration * SR) + SR]
