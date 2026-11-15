"""How We Ended Up · PLACEHOLDER narration from the scene list (each scene's "say" line).

Usage (from studio/):  python -I tools/howwe_voice.py <scenes.json> <slug>
Voice: Piper "Ryan" (models/piper/en_US-ryan-high.onnx, already in the studio). Placeholder only: the owner records
or makes the real narration later; then pass that file to howwe_mix.py --voice instead.
Each line starts just after its scene's transition. Writes public/howwe/<slug>/voice.wav and warns when a line is
longer than its scene.
"""
import io
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from howwe_mix import FPS, T_IN, timeline, write_wav  # noqa: E402

SR = 48000
LEAD = 6  # frames after the transition before the voice starts


def synth(voice, cfg, text):
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        voice.synthesize_wav(text, wf, syn_config=cfg)
    buf.seek(0)
    with wave.open(buf, "rb") as rf:
        sr = rf.getframerate()
        x = np.frombuffer(rf.readframes(rf.getnframes()), np.int16).astype(np.float32) / 32768.0
    # resample to 48 kHz with ffmpeg-free linear interpolation (placeholder quality is fine)
    n = int(len(x) * SR / sr)
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)


def main():
    scenes_file, slug = sys.argv[1], sys.argv[2]
    from piper import PiperVoice, SynthesisConfig

    voice = PiperVoice.load(str(ROOT / "models" / "piper" / "en_US-ryan-high.onnx"))
    cfg = SynthesisConfig(length_scale=1.0, noise_scale=0.6, noise_w_scale=0.7)
    scenes = json.loads((ROOT / scenes_file).read_text(encoding="utf-8"))["scenes"]
    starts, total = timeline(scenes)
    out = np.zeros(int(total / FPS * SR) + SR, dtype=np.float32)
    for i, s in enumerate(scenes):
        if not s.get("say"):
            continue
        x = synth(voice, cfg, s["say"])
        t0 = (starts[i] + (T_IN.get(s.get("in", "cut"), 0) if i > 0 else 0) + LEAD) / FPS
        room = (starts[i] + s["dur"]) / FPS - t0
        flag = "  <-- LONGER THAN SCENE" if len(x) / SR > room else ""
        print(f"scene {i + 1}: {len(x) / SR:.2f}s of {room:.2f}s{flag}")
        p = int(t0 * SR)
        L = min(len(x), len(out) - p)
        out[p:p + L] += x[:L]
    pub = ROOT / "public" / "howwe" / slug
    pub.mkdir(parents=True, exist_ok=True)
    write_wav(pub / "voice.wav", out / (np.max(np.abs(out)) or 1) * 0.9)
    print(f"-> public/howwe/{slug}/voice.wav (placeholder voice)")


if __name__ == "__main__":
    main()
