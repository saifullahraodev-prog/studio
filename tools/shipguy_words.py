"""The Ship Guy: word timings for a voice file (faster-whisper "small", CPU, offline).

Usage: HF_HUB_OFFLINE=1 python tools/shipguy_words.py <voice.wav> <words.json>
Writes [{"word", "start", "end"}, ...] in seconds.
"""
import json
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel


def main(src: str, out: str):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = model.transcribe(audio, language="en", word_timestamps=True, vad_filter=False)
    words = [{"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)} for s in segs for w in s.words]
    with open(out, "w", encoding="utf-8") as f:
        f.write(json.dumps(words, indent=1))
    print(len(words), "words, last at", words[-1]["end"])


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
