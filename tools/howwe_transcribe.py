"""Transcribe a recorded narration once (faster-whisper small, word timings) -> <out>.json  [{word,start,end}].
Usage (from studio/): set HF_HUB_OFFLINE=1 ; python -I tools/howwe_transcribe.py <voice.mp3|wav> <out.json>"""
import json
import subprocess
import sys

import numpy as np


def load16k(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def main():
    src, out = sys.argv[1], sys.argv[2]
    from faster_whisper import WhisperModel
    asr = WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = asr.transcribe(load16k(src), language="en", word_timestamps=True, vad_filter=False)
    words = [{"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)} for s in segs for w in s.words]
    open(out, "w", encoding="utf-8").write(json.dumps(words, indent=0))
    print(f"{len(words)} words -> {out}")


if __name__ == "__main__":
    main()
