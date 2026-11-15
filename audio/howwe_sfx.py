"""How We Ended Up · sound kit ("The Gallery"). Everything synthesised in code: no downloads, no licences.
48 kHz float32 mono, built on the helpers in audio/sfx.py.

Identity (different from Ship Guy's plucky comedy):
  a calm museum: soft footsteps, wooden knocks, paper, a light switch, gentle chimes,
  quiet room tone, and a light curious music bed (marimba + pizzicato + soft pad, 92 bpm, D major).
"""
import numpy as np

from sfx import SR, NOTE, _add, _env, _movavg, _noise, _pluck, _sine_sweep, _t, norm

_rng = np.random.default_rng(23)


def _lpf(x, cutoff):
    """fast low-pass (moving average ~ cutoff), fine for sound design"""
    return _movavg(x, max(1, int(SR / max(cutoff, 1) / 2)))


def _bpf(x, lo, hi):
    return _lpf(x, hi) - _lpf(x, lo)


def _room(x, sec=1.1, wet=0.22, decay=5.5):
    """small gallery reverb: decaying filtered noise convolved by FFT"""
    n = int(sec * SR)
    ir = _rng.uniform(-1, 1, n) * np.exp(-_t(sec) * decay)
    ir = _lpf(ir, 2500)
    L = len(x) + n
    y = np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)
    y = y / (np.max(np.abs(y)) or 1) * (np.max(np.abs(x)) or 1)
    return np.concatenate([x, np.zeros(n)]) * (1 - wet) + y * wet


def _decay(sec, rate):
    return np.exp(-_t(sec) * rate)


# ── one-shots ───────────────────────────────────────────────────────────────
def step(seed=0):
    """soft shoe on a hard gallery floor"""
    r = np.random.default_rng(100 + seed)
    sec = 0.16
    n = int(sec * SR)
    heel = _bpf(r.uniform(-1, 1, n), 300, 2400) * _decay(sec, 60)
    thump = _sine_sweep(140, 70, sec, 0.6) * _decay(sec, 35) * 0.6
    return norm(_room(heel + thump, 0.9, 0.3), 0.8)


def footsteps(count=3, gap=0.24):
    out = np.zeros(int((count * gap + 1.2) * SR))
    for i in range(count):
        _add(out, step(i) * (0.75 + 0.25 * (i % 2)), i * gap)
    return norm(out, 0.8)


def door():
    """wooden door: short creak + soft latch thunk"""
    sec = 0.55
    t = _t(sec)
    creak_f = 180 + 70 * np.sin(2 * np.pi * 3.5 * t) + 40 * t
    creak = np.sin(2 * np.pi * np.cumsum(creak_f) / SR) * (0.6 + 0.4 * _rng.uniform(-1, 1, len(t)))
    creak = _bpf(creak, 200, 1800) * np.sin(np.pi * t / sec) ** 1.5 * 0.5
    th = int(0.2 * SR)
    thunk = (_sine_sweep(110, 60, 0.2, 0.5) * _decay(0.2, 25) + _bpf(_noise(th), 200, 900) * _decay(0.2, 40) * 0.5)
    out = np.zeros(int(0.8 * SR))
    _add(out, creak, 0)
    _add(out, thunk, 0.5)
    return norm(_room(out, 1.0, 0.28), 0.8)


def clunk():
    """big gallery light switch (lights down / up)"""
    sec = 0.25
    click = _bpf(_noise(int(0.012 * SR)), 1500, 8000) * _env(int(0.012 * SR), 0.0005, 0.008)
    body = _sine_sweep(95, 55, sec, 0.4) * _decay(sec, 18)
    out = np.zeros(int(sec * SR))
    _add(out, click, 0)
    _add(out, body * 0.9, 0.004)
    return norm(_room(out, 1.4, 0.35, 3.5), 0.9)


def hum(sec=3.0):
    """spotlight hum while the lights are down (very quiet, faded)"""
    t = _t(sec)
    x = np.sin(2 * np.pi * 100 * t) * 0.5 + np.sin(2 * np.pi * 200 * t) * 0.25 + np.sin(2 * np.pi * 300 * t) * 0.1
    x *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.7 * t)
    f = int(0.4 * SR)
    e = np.ones(len(t))
    e[:f] = np.linspace(0, 1, f)
    e[-f:] = np.linspace(1, 0, f)
    return norm(x * e, 0.5)


def flip():
    """label card flip: paper flick + soft card thunk"""
    sec = 0.18
    flick = _bpf(_noise(int(sec * SR)), 1800, 9000) * np.sin(np.pi * _t(sec) / sec) ** 3
    thunk = _sine_sweep(160, 90, 0.14, 0.5) * _decay(0.14, 30) * 0.7
    out = np.zeros(int(0.4 * SR))
    _add(out, flick * 0.7, 0)
    _add(out, thunk, 0.12)
    return norm(_room(out, 0.7, 0.2), 0.8)


def place():
    """object set down on a plinth: soft wooden knock with a little ring"""
    sec = 0.35
    knock = _bpf(_noise(int(sec * SR)), 500, 1600) * _decay(sec, 45)
    tone = np.sin(2 * np.pi * 620 * _t(sec)) * _decay(sec, 14) * 0.35 + np.sin(2 * np.pi * 1240 * _t(sec)) * _decay(sec, 22) * 0.12
    return norm(_room(knock + tone, 0.8, 0.22), 0.8)


def paper():
    """label card printing / sliding on"""
    sec = 0.28
    x = _bpf(_noise(int(sec * SR)), 2500, 10000) * np.sin(np.pi * _t(sec) / sec) ** 2
    return norm(x, 0.6)


def chime(midi=74, sec=1.6):
    """soft celesta/bell note (map fills, title)"""
    t = _t(sec)
    f = NOTE(midi)
    x = (np.sin(2 * np.pi * f * t) * _decay(sec, 3.0) + np.sin(2 * np.pi * f * 2.01 * t) * _decay(sec, 5.5) * 0.35
         + np.sin(2 * np.pi * f * 3.99 * t) * _decay(sec, 9) * 0.15)
    x[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
    return norm(_room(x, 1.4, 0.3, 3.0), 0.7)


def pen(sec=1.0):
    """pen scratching a route on the map"""
    n = int(sec * SR)
    x = _bpf(_noise(n), 1500, 6000)
    mod = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * _t(sec) + 2 * np.sin(2 * np.pi * 1.3 * _t(sec))))
    f = int(0.05 * SR)
    e = np.ones(n)
    e[:f] = np.linspace(0, 1, f)
    e[-f:] = np.linspace(1, 0, f)
    return norm(x * mod * e, 0.5)


def air(sec=0.7):
    """soft air swell (camera push into a framed map)"""
    n = int(sec * SR)
    x = _lpf(_noise(n), 900) * np.sin(np.pi * _t(sec) / sec) ** 2
    return norm(x, 0.6)


def clink(seed=0):
    """fork on a plate (Today room)"""
    r = np.random.default_rng(300 + seed)
    sec = 0.4
    f = 2600 + r.uniform(-200, 200)
    x = (np.sin(2 * np.pi * f * _t(sec)) * _decay(sec, 22) + np.sin(2 * np.pi * f * 1.52 * _t(sec)) * _decay(sec, 30) * 0.5
         + _bpf(r.uniform(-1, 1, int(sec * SR)), 3000, 9000) * _decay(sec, 80) * 0.4)
    return norm(x, 0.6)


def chop(seed=0):
    """cleaver on a wooden board (period kitchen)"""
    r = np.random.default_rng(400 + seed)
    sec = 0.18
    x = _bpf(r.uniform(-1, 1, int(sec * SR)), 400, 2200) * _decay(sec, 50) + _sine_sweep(180, 90, sec, 0.5) * _decay(sec, 40) * 0.5
    return norm(_room(x, 0.6, 0.18), 0.7)


def roomtone(sec):
    """quiet gallery air: low noise with slow movement"""
    n = int(sec * SR)
    x = _lpf(_rng.uniform(-1, 1, n), 400) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.11 * _t(sec)))
    return norm(x, 0.5)


# ── music bed: light, curious, museum (92 bpm, D major) ─────────────────────
def _marimba(midi, sec=0.9):
    t = _t(sec)
    f = NOTE(midi)
    x = np.sin(2 * np.pi * f * t) * _decay(sec, 7) + np.sin(2 * np.pi * f * 4.0 * t) * _decay(sec, 25) * 0.25
    a = int(0.003 * SR)
    x[:a] *= np.linspace(0, 1, a)
    return x


def _pad(midis, sec):
    t = _t(sec)
    x = sum(np.sin(2 * np.pi * NOTE(m) * t) + 0.6 * np.sin(2 * np.pi * NOTE(m) * 1.003 * t) for m in midis)
    a = int(min(0.6, sec / 3) * SR)
    e = np.ones(len(t))
    e[:a] = np.linspace(0, 1, a)
    e[-a:] = np.linspace(1, 0, a)
    return _lpf(x, 1200) * e


def _hush_env(n, hush):
    env = np.ones(n)
    ramp = int(0.35 * SR)
    for a, b in hush:
        ia, ib = int(a * SR), int(b * SR)
        env[ia:ib] = 0
        env[max(0, ia - ramp):ia] = np.minimum(env[max(0, ia - ramp):ia], np.linspace(1, 0, ia - max(0, ia - ramp)))
        env[ib:ib + ramp] = np.minimum(env[ib:ib + ramp], np.linspace(0, 1, len(env[ib:ib + ramp])))
    return env


def _piano(midi, sec=2.6):
    """soft felt piano: few decaying partials, gentle hammer, darkened"""
    t = _t(sec)
    f = NOTE(midi)
    x = sum(a * np.sin(2 * np.pi * f * k * t) * _decay(sec, r) for k, a, r in ((1, 1.0, 1.6), (2, 0.42, 2.6), (3, 0.18, 4.0), (4, 0.08, 6.0)))
    ham = _lpf(_noise(int(0.02 * SR)), 1500) * _env(int(0.02 * SR), 0.001, 0.015) * 0.15
    x[: len(ham)] += ham
    a = int(0.008 * SR)
    x[:a] *= np.linspace(0, 1, a)
    return _lpf(x, 2600)


def _strings(midis, sec):
    """warm string pad: detuned harmonic stacks, slow swell"""
    t = _t(sec)
    x = np.zeros(len(t))
    for m in midis:
        for det in (0.997, 1.0, 1.004):
            f = NOTE(m) * det
            x += sum(np.sin(2 * np.pi * f * k * t + k) / k for k in range(1, 7))
    a = int(min(1.4, sec / 2.5) * SR)
    r = int(min(1.0, sec / 3) * SR)
    e = np.ones(len(t))
    e[:a] = np.linspace(0, 1, a) ** 1.5
    e[-r:] = np.linspace(1, 0, r)
    return _lpf(x, 900) * e


def _celesta(midi, sec=1.8):
    t = _t(sec)
    f = NOTE(midi)
    x = np.sin(2 * np.pi * f * t) * _decay(sec, 3.5) + np.sin(2 * np.pi * f * 4 * t) * _decay(sec, 12) * 0.2
    a = int(0.003 * SR)
    x[:a] *= np.linspace(0, 1, a)
    return x


def music(duration, hush=(), style="piano"):
    """Music bed. style:
      piano   (A, default) "Gallery piano": felt piano + warm strings, 72 bpm, Dm Bb F C. Calm, curious, premium.
      pizz    (B) "Quiet curiosity": sparse pizzicato + celesta + soft pad, 84 bpm, F Dm Bb C.
      marimba (old v0, owner: wrong mood) busy marimba arpeggio, 92 bpm.
    `hush` = [(t0, t1)]: melody/bass drop out and the pad softens (reveal)."""
    if style == "marimba":
        return _music_marimba(duration, hush)
    n = int(duration * SR) + 3 * SR
    lead, low, pad = np.zeros(n), np.zeros(n), np.zeros(n)
    cache = {}

    def get(k, make):
        if k not in cache:
            cache[k] = make()
        return cache[k]

    if style == "piano":
        beat = 60 / 72
        bar = beat * 4
        prog = [(50, [62, 65, 69]), (46, [62, 65, 70]), (53, [60, 65, 69]), (48, [60, 64, 67])]  # Dm Bb F C (bass, voicing)
        melody = [74, None, 72, None, 69, None, 72, 74]  # one note every other bar, gentle question/answer
        b, t = 0, 0.0
        while t < duration + bar:
            root, chord = prog[b % 4]
            _add(low, get(("pb", root), lambda: _piano(root, 3.2)), t)
            _add(pad, get(("st", b % 4), lambda: _strings([c - 12 for c in chord], bar + 1.0)), t)
            # broken chord: beat 2, beat 2.5, beat 3.5 (sparse, never busy)
            for k, off in enumerate((1.0, 1.5, 2.5)):
                m = chord[k]
                _add(lead, get(("p", m), lambda: _piano(m, 2.2)) * (0.55 - 0.1 * k), t + off * beat)
            mel = melody[b % len(melody)]
            if mel:
                _add(lead, get(("p", mel), lambda: _piano(mel, 2.8)) * 0.6, t + 3 * beat)
            b += 1
            t += bar
        env = _hush_env(n, hush)
        x = (lead * 0.55 + low * 0.45) * env + pad * 0.08 * (0.4 + 0.6 * env)
    else:  # pizz
        beat = 60 / 84
        bar = beat * 4
        prog = [(53, [65, 69, 72]), (50, [62, 65, 69]), (46, [62, 65, 70]), (48, [64, 67, 72])]  # F Dm Bb C
        b, t = 0, 0.0
        while t < duration + bar:
            root, chord = prog[b % 4]
            _add(low, get(("pz", root - 12), lambda: _pluck(NOTE(root - 12), 0.9)), t)
            _add(pad, get(("pd", b % 4), lambda: _strings([c - 12 for c in chord], bar + 0.8)), t)
            for k, off in enumerate((1.0, 2.0, 2.5, 3.5)):
                m = chord[k % 3]
                _add(lead, get(("pzz", m), lambda: _pluck(NOTE(m), 0.6)) * 0.5, t + off * beat)
            if b % 2 == 0:
                c = chord[2] + 12
                _add(lead, get(("ce", c), lambda: _celesta(c)) * 0.35, t)
            b += 1
            t += bar
        env = _hush_env(n, hush)
        x = (lead * 0.6 + low * 0.5) * env + pad * 0.07 * (0.4 + 0.6 * env)
    return norm(x[: int(duration * SR)], 0.8)


def _music_marimba(duration, hush=(), bpm=92):
    """v0 marimba bed (kept for reference; owner said wrong mood)."""
    beat = 60 / bpm
    bar = beat * 4
    prog = [(62, [62, 66, 69]), (59, [59, 62, 66]), (55, [55, 59, 62]), (57, [57, 61, 64])]  # D Bm G A
    n = int(duration * SR) + 2 * SR
    mel, bass, pad = np.zeros(n), np.zeros(n), np.zeros(n)
    cache = {}

    def get(k, make):
        if k not in cache:
            cache[k] = make()
        return cache[k]

    patt = [0, 2, 1, 2, 0, 2, 1, 2]
    i, t = 0, 0.0
    while t < duration + bar:
        root, chord = prog[(i // 8) % 4]
        if i % 8 == 0:
            _add(pad, get(("pad", root), lambda: _pad([c - 12 for c in chord], bar + 0.4)), t)
        if i % 4 == 0:
            _add(bass, get(("b", root), lambda: _pluck(NOTE(root - 24), 0.7)), t)
        if i % 2 == 0 or (i % 8) in (3, 7):
            m = chord[patt[i % 8]] + (12 if (i // 32) % 2 else 0)
            _add(mel, get(("m", m), lambda: _marimba(m)), t)
        i += 1
        t += beat / 2
    env = _hush_env(n, hush)
    x = (mel * 0.55 + bass * 0.5) * env + pad * 0.18 * (0.4 + 0.6 * env)
    return norm(x[: int(duration * SR)], 0.8)


SOUNDS = {"step": step, "footsteps": footsteps, "door": door, "clunk": clunk, "flip": flip, "place": place, "paper": paper,
          "air": air, "pen": pen, "chime": chime, "clink": clink, "chop": chop}
GAINS = {"footsteps": 0.16, "door": 0.26, "clunk": 0.4, "flip": 0.28, "place": 0.24, "paper": 0.12, "air": 0.16,
         "pen": 0.12, "chime": 0.2, "clink": 0.08, "chop": 0.1, "hum": 0.02, "roomtone": 0.035, "music": 0.2}
