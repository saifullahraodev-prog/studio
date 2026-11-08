"""Build a video's data from its scene file.

    python -I tools/build_video.py videos/<date>-<slug> [--retts] [--recording]

Steps:
  1. parse scenes.txt -> beats
  2. voice: placeholder TTS per line (Windows voice), joined with pauses -> voice.wav
     (--recording: use your own voice.wav as-is; beats are aligned from word timings)
  3. faster-whisper word timings -> words.json
  4. beat timing + keyword cue times -> scenes.json
  5. audio mix: voice + quiet generated sea ambience, ducked under the voice, loudness
     levelled for YouTube (-14 LUFS) -> mix.wav
  6. copy scenes.json + mix.wav to public/videos/<slug>/ for Remotion
"""
import json
import re
import shutil
import subprocess
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEAD = 0.45  # silence before the first line (s)
GAP = 0.32  # pause between lines (s)
TAIL = 1.1  # hold after the last line (s)
FPS = 30
TARGET_LUFS = -14.0  # YouTube's playback reference loudness


def parse_scenes(path: Path):
    meta, beats, cur = {}, [], None
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r"\[beat\s+(\d+)\]", line)
        if m:
            cur = {"id": f"b{m.group(1)}"}
            beats.append(cur)
            continue
        if ":" in line:
            k, v = line.split(":", 1)
            (cur if cur is not None else meta)[k.strip()] = v.strip()
    for b in beats:
        b.setdefault("subtitle", b["say"])
    return meta, beats


def wav_seconds(p: Path) -> float:
    with wave.open(str(p)) as w:
        return w.getnframes() / w.getframerate()


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        print(r.stdout, r.stderr)
        raise SystemExit(f"command failed: {cmd[0]}")
    return r


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


def main():
    vdir = (ROOT / sys.argv[1]).resolve()
    retts = "--retts" in sys.argv
    recording = "--recording" in sys.argv
    meta, beats = parse_scenes(vdir / "scenes.txt")
    slug = meta.get("slug", vdir.name)
    tmp = ROOT / ".cache" / "tmp"
    tmp.mkdir(parents=True, exist_ok=True)
    linedir = vdir / "voice-lines"

    # ── 2. voice ──
    if not recording:
        missing = [b for b in beats if retts or not (linedir / f"{b['id']}.wav").exists()]
        if missing:
            lj = tmp / "lines.json"
            lj.write_text(json.dumps([{"id": b["id"], "say": b["say"]} for b in missing]), encoding="utf-8")
            run(["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(ROOT / "tools" / "tts_placeholder.ps1"), str(lj), str(linedir), "Microsoft David Desktop", "3"])
        # join: lead + line + gap + line ... + tail, record where each line sits
        t = LEAD
        parts, inputs = [], []
        for b in beats:
            d = wav_seconds(linedir / f"{b['id']}.wav")
            b["voiceStart"], b["voiceEnd"] = round(t, 3), round(t + d, 3)
            t += d + GAP
        total = beats[-1]["voiceEnd"] + TAIL
        # build with ffmpeg: adelay each line to its start, then mix
        for i, b in enumerate(beats):
            inputs += ["-i", str(linedir / f"{b['id']}.wav")]
            ms = int(b["voiceStart"] * 1000)
            parts.append(f"[{i}]aresample=48000,adelay={ms}|{ms}[a{i}]")
        filt = ";".join(parts) + ";" + "".join(f"[a{i}]" for i in range(len(beats))) + f"amix=inputs={len(beats)}:normalize=0,apad,atrim=0:{total:.3f}[out]"
        run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", filt, "-map", "[out]", "-ac", "1", "-ar", "48000", str(vdir / "voice.wav")])
    else:
        total = wav_seconds(vdir / "voice.wav") + 0.3

    # ── 3. word timings ──
    from faster_whisper import WhisperModel

    import numpy as np

    # decode with ffmpeg ourselves (16 kHz mono float) - avoids a PyAV version mismatch
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(vdir / "voice.wav"), "-f", "s16le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = model.transcribe(audio, language="en", word_timestamps=True, vad_filter=False)
    words = [{"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)} for s in segs for w in s.words]
    (vdir / "words.json").write_text(json.dumps(words, indent=1), encoding="utf-8")

    # ── 4. beats timing ──
    if recording:
        # align beats by walking the transcript: each beat starts at the first word of its text
        wi = 0
        for b in beats:
            first = norm(b["say"].split()[0])
            while wi < len(words) and not norm(words[wi]["word"]).startswith(first[:4]):
                wi += 1
            b["voiceStart"] = words[min(wi, len(words) - 1)]["start"]
        for i, b in enumerate(beats):
            nxt = beats[i + 1]["voiceStart"] if i + 1 < len(beats) else total
            inside = [w for w in words if b["voiceStart"] <= w["start"] < nxt]
            b["voiceEnd"] = inside[-1]["end"] if inside else nxt
    for i, b in enumerate(beats):
        # each beat (shot) starts a little before its line and runs until the next one starts
        b["start"] = 0.0 if i == 0 else round(b["voiceStart"] - 0.12, 3)
        b["end"] = round(beats[i + 1]["voiceStart"] - 0.12, 3) if i + 1 < len(beats) else round(total, 3)
        b["words"] = [w for w in words if b["voiceStart"] - 0.05 <= w["start"] < b["voiceEnd"] + 0.05]
        cue = norm(b.get("cue", ""))
        kw = norm(b.get("keyword", ""))

        def is_cue(word: str) -> bool:
            n = norm(word)
            if not n:
                return False
            if cue and n.startswith(cue[:5]):
                return True
            # whisper writes numbers as digits ("20", "1894", "46 ,000"): match the keyword's digits
            return n.isdigit() and kw.isdigit() and kw.startswith(n)

        hit = next((w for w in b["words"] if is_cue(w["word"])), None)
        b["cueAt"] = round(hit["start"], 3) if hit else round(b["voiceStart"], 3)
        if cue and not hit:
            print(f"  note: cue '{b['cue']}' not heard in {b['id']}; keyword pops at line start")

    data = {"slug": slug, "format": meta.get("format", "short"), "world": meta.get("world"), "fps": FPS, "duration": round(total, 3), "beats": beats}
    (vdir / "scenes.json").write_text(json.dumps(data, indent=1), encoding="utf-8")

    # ── 5. mix: voice + sea ambience (generated), ducked, -14 LUFS ──
    mix = vdir / "mix.wav"
    pre = tmp / "premix.wav"
    filt = (
        f"anoisesrc=color=brown:amplitude=0.6:duration={total:.3f}:sample_rate=48000,lowpass=f=520,highpass=f=40,"
        f"volume=-24dB,tremolo=f=0.12:d=0.5[amb];"
        f"[0]asplit=2[v][sc];[amb][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck];"
        f"[v][duck]amix=inputs=2:normalize=0[out]"
    )
    run(["ffmpeg", "-v", "error", "-y", "-i", str(vdir / "voice.wav"), "-filter_complex", filt, "-map", "[out]", "-ar", "48000", "-ac", "2", str(pre)])
    # two-pass loudness: measure, then apply exact gain + true-peak limiter (one-pass undershoots on short clips)
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(pre), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    summary = meas[meas.rfind("Summary:"):]
    integ = float(re.search(r"I:\s+(-?[\d.]+) LUFS", summary).group(1))
    gain = TARGET_LUFS - integ
    run(["ffmpeg", "-v", "error", "-y", "-i", str(pre), "-af", f"volume={gain:.2f}dB,alimiter=limit=0.84:attack=5:release=50:level=false", "-ar", "48000", "-ac", "2", str(mix)])
    print(f"  loudness: premix {integ:.1f} LUFS -> gain {gain:+.1f} dB (target {TARGET_LUFS} LUFS, limiter -1.5 dBTP)")

    # ── 6. publish for Remotion ──
    pub = ROOT / "public" / "videos" / slug
    pub.mkdir(parents=True, exist_ok=True)
    shutil.copy(vdir / "scenes.json", pub / "scenes.json")
    shutil.copy(mix, pub / "mix.wav")

    print(f"{slug}: {len(beats)} beats, {total:.2f}s ({round(total * FPS)} frames)")
    for b in beats:
        print(f"  {b['id']}  {b['start']:6.2f}-{b['end']:6.2f}s  voice {b['voiceStart']:6.2f}-{b['voiceEnd']:6.2f}  cue {b['cueAt']:6.2f}  {b['shot']}")


if __name__ == "__main__":
    main()
