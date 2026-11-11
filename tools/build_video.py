"""Build a video's data from its scene file.

    python -I tools/build_video.py videos/<date>-<slug> [--retts] [--recording]

Steps:
  1. parse scenes.txt -> beats (+ cuts, emphasis, pauses)
  2. voice: placeholder TTS per line (Piper if `voice: piper`, else the Windows voice),
     joined with per-line pauses -> voice.wav   (--recording: use your own voice.wav)
  3. faster-whisper word timings -> words.json
  4. beat + cut timing (cuts start on their cue words), keyword cues, caption words -> scenes.json
  5. audio: voice + music bed (light/tense by lighting preset) + procedural SFX on cuts,
     music ducked under the voice, two-pass loudness to -14 LUFS -> mix.wav
  6. copy scenes.json + mix.wav to public/videos/<slug>/ for Remotion
"""
import importlib.util
import json
import re
import shutil
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
TARGET_LUFS = -14.0  # YouTube's playback reference loudness
STYLE = json.loads((ROOT / "engine" / "look" / "style-v1.4.json").read_text(encoding="utf-8"))
PACING = STYLE.get("pacing", {})


def load_sfx():
    spec = importlib.util.spec_from_file_location("sfx", ROOT / "audio" / "sfx.py")
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def parse_scenes(path: Path):
    meta, beats, cur = {}, [], None
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r"\[beat\s+(\w+)\]", line)
        if m:
            cur = {"id": f"b{m.group(1)}", "cuts": []}
            beats.append(cur)
            continue
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        k, v = k.strip(), v.strip()
        if cur is None:
            meta[k] = v
        elif k == "shot":
            parts = [x.strip() for x in v.split("|")]
            sh = {"cue": parts[0], "spec": parts[1] if len(parts) > 1 else "medium"}
            for x in parts[2:]:
                if "=" in x:
                    a, b = x.split("=", 1)
                    sh[a.strip()] = b.strip()
                elif x == "punch":
                    sh["punch"] = True
            cur.setdefault("shots", []).append(sh)
        elif k == "cut":
            parts = [p.strip() for p in v.split("|")]
            cut = {"cue": parts[0], "shot": parts[1] if len(parts) > 1 else cur.get("shot", "")}
            for p in parts[2:]:
                if "=" in p:
                    a, b = p.split("=", 1)
                    cut[a.strip()] = b.strip()
            cur["cuts"].append(cut)
        else:
            cur[k] = v
    for b in beats:
        b.setdefault("subtitle", b["say"])
        b["pause"] = float(b.get("pause", PACING.get("lineGap", 0.32) if (b["cuts"] or b.get("place")) else 0.32))
        b["emph"] = [e.strip() for e in b.get("emph", "").split(",") if e.strip()]
    return meta, beats


def wav_seconds(p: Path) -> float:
    with wave.open(str(p)) as w:
        return w.getnframes() / w.getframerate()


def write_wav(path: Path, x: np.ndarray, sr=48000):
    x = np.clip(x, -1, 1)
    data = (x * 32767).astype("<i2")
    ch = 1 if x.ndim == 1 else x.shape[1]
    with wave.open(str(path), "wb") as w:
        w.setnchannels(ch)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(data.tobytes())


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        print(r.stdout, r.stderr)
        raise SystemExit(f"command failed: {cmd[0]}")
    return r


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


NUMBER_WORDS = set("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million fortysix seventyfive ninetyfour".split())


def align(say: str, words):
    """Map every token of the script line to a time, using the heard words.
    Returns [(token, start, end, heard_text_or_None)]; unheard tokens get interpolated times."""
    import difflib

    toks = re.findall(r"[A-Za-z0-9'’\-]+[?.!,]?", say)
    sn = [norm(t) for t in toks]
    wn = [norm(w["word"]) for w in words]
    t_start = [None] * len(toks)
    t_end = [None] * len(toks)
    heard = [None] * len(toks)
    sm = difflib.SequenceMatcher(None, sn, wn, autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                w = words[j1 + k]
                t_start[i1 + k], t_end[i1 + k], heard[i1 + k] = w["start"], w["end"], w["word"]
        elif op == "replace" and j2 > j1:
            a, e = words[j1]["start"], words[j2 - 1]["end"]
            n = i2 - i1
            for k in range(n):
                t_start[i1 + k] = a + (e - a) * k / n
                t_end[i1 + k] = a + (e - a) * (k + 1) / n
            # numbers: keep whisper's digits ("1912") for the captions
            if any(any(ch.isdigit() for ch in wn[j]) for j in range(j1, j2)):
                # fold only the NUMBER words into the digits; ordinary words keep their own caption
                heard[i1] = " ".join(words[j]["word"] for j in range(j1, j2) if any(ch.isdigit() for ch in words[j]["word"]))
                for k in range(1, n):
                    parts = re.split(r"[-\s]", toks[i1 + k].lower())
                    if all(norm(x) in NUMBER_WORDS or norm(x) == "oh" for x in parts if norm(x)):
                        heard[i1 + k] = ""
    # interpolate anything still missing between known neighbours
    known = [i for i in range(len(toks)) if t_start[i] is not None]
    for i in range(len(toks)):
        if t_start[i] is None:
            prev = max([k for k in known if k < i], default=None)
            nxt = min([k for k in known if k > i], default=None)
            a = t_end[prev] if prev is not None else (words[0]["start"] if words else 0)
            e = t_start[nxt] if nxt is not None else (words[-1]["end"] if words else a + 0.3)
            span = (nxt if nxt is not None else len(toks)) - (prev if prev is not None else -1)
            pos = i - (prev if prev is not None else -1)
            t_start[i] = a + (e - a) * (pos - 1) / span
            t_end[i] = a + (e - a) * pos / span
    return [(toks[i], round(t_start[i], 3), round(t_end[i], 3), heard[i]) for i in range(len(toks))]


def tts_piper(beats, linedir: Path, scale=None):
    from piper import PiperVoice, SynthesisConfig

    voice = PiperVoice.load(str(ROOT / "models" / "piper" / "en_US-ryan-high.onnx"))
    cfg = SynthesisConfig(length_scale=scale or PACING.get("voiceLengthScale", 0.9), noise_scale=0.6, noise_w_scale=0.7)
    linedir.mkdir(parents=True, exist_ok=True)
    for b in beats:
        with wave.open(str(linedir / f"{b['id']}.wav"), "wb") as wf:
            voice.synthesize_wav(b["say"], wf, syn_config=cfg)
        print(f"  piper {b['id']}: {wav_seconds(linedir / (b['id'] + '.wav')):.2f}s")


PLACE_MOOD = {"office": "light", "factory": "ragtime", "stairwell": "tense", "street": "tense", "courtroom": "investigate"}


def cut_audio(beats):
    """v2 cut mode (explicit `cut:` lines): sounds on cuts + light/tense music by preset."""
    sets = json.loads((ROOT / "engine" / "shots" / "sets.json").read_text(encoding="utf-8"))
    place = lambda shot: sets["sets"].get(shot, sets["default"])
    offset = {"whoosh": -0.1, "stamp": 0.32, "impact": 0.06, "scream": 0.55}  # stamp lands at 0.32 s
    events, prev = [], None
    for b in beats:
        for c in b["cuts"]:
            fxs = [f for f in c.get("fx", "").split("+") if f]
            for f in fxs:
                f, _, dur = f.partition(":")  # "fire_big:3.5" = library bed cropped to 3.5 s
                at = c["start"] + offset.get(f, 0.0)
                events.append((at, f, 1.0, float(dur)) if dur else (at, f))
                if c.get("pre") == "riser" and f == fxs[0].partition(":")[0]:  # suck-in that ends exactly on the hit: no dead air
                    events.append((at - 0.5, "riser"))
            # whoosh only where the picture really whips to a new place (same place = camera move, silent)
            new_place = prev is None or place(prev) != place(c["shot"])
            if c["tr"] == "whip" and new_place and "whoosh" not in fxs:
                events.append((c["start"] - 0.06, "whoosh"))
            if c["tr"] == "flash":
                events.append((c["start"], "tick"))
            prev = c["shot"]
    segs = []
    for b in beats:
        mood = b.get("music") or ("tense" if b.get("preset") in ("night", "storm") else "light")
        if segs and segs[-1][2] == mood:
            segs[-1] = (segs[-1][0], b["end"], mood)
        else:
            segs.append((b["start"], b["end"], mood))
    return events, segs


def director_audio(beats, total, sfx):
    """Director mode: sound events + music segments from places and beat fields.
    - `fx: name[@cue], ...` per beat (cue word -> exact time), whoosh on place-change whips,
      tick on flashes, `pre=riser` style rises via `fx: riser@cue`
    - ambience beds per run of beats in the same place (sewing room, fire, street, crowd)
    - music: beat `music:` mood, else the place's default (fire turns the factory tense)"""
    events = []
    prev_place = None
    for b in beats:
        c0 = b["cuts"][0] if b["cuts"] else None
        if c0 and c0["tr"] == "whip" and b["place"] != prev_place:
            events.append((c0["start"] - 0.06, "whoosh"))
        if c0 and c0["tr"] == "flash":
            events.append((c0["start"], "tick"))
        for item in [x.strip() for x in b.get("fx", "").split(",") if x.strip()]:
            name, _, cue = item.partition("@")
            at = b["voiceStart"]
            if cue:
                hit = next((a for tok, a, e, h in b.get("aligned", []) if norm(tok).startswith(norm(cue)[:5])), None)
                at = hit if hit is not None else at
            if name == "riser":
                at -= 0.5
            events.append((at, name))
        prev_place = b["place"]
    # ambience runs
    runs = []
    for b in beats:
        fire = max(b["fire"] or [0])
        if b["place"] == "factory":
            bed = "fire_bed" if fire > 0.1 else "sewing"
        elif b["place"] == "stairwell":
            bed = "fire_bed" if fire > 0.1 else None
        elif b["place"] == "street":
            bed = "crowd_bed" if fire > 0.1 else "street_bed"
        else:
            bed = None
        if runs and runs[-1][2] == bed:
            runs[-1][1] = b["end"]
        else:
            runs.append([b["start"], b["end"], bed])
    for a, e, bed in runs:
        if bed:
            events.append((a, bed, 0.55, e - a))
    # music segments
    # music only changes where a beat asks for it (`music:`); otherwise it carries on
    segs = []
    mood = None
    for b in beats:
        fire = max(b["fire"] or [0])
        mood = b.get("music") or mood or ("tense" if (b["place"] == "factory" and fire > 0.1) else PLACE_MOOD.get(b["place"], "light"))
        if segs and segs[-1][2] == mood:
            segs[-1] = (segs[-1][0], b["end"], mood)
        else:
            segs.append((b["start"], b["end"], mood))
    print(f"  director audio: {len(events)} events; music: {', '.join(f'{m} {a:.0f}-{e:.0f}s' for a, e, m in segs)}")
    return events, segs


# storyboard rules (docs/storyboard-rules.md): action first
REACTION_SHOTS = {"stoker-eyes", "insp-eyes", "stoker-shocked-cu", "insp-punch", "today-punch", "close"}
ACTION_SHOTS = {"run-low", "crowd-pile", "crowd-half", "stamp", "ship-too-big", "boats-16", "boats-20", "boats-plus4", "officer-wave",
                "boat-away", "iceberg-hit", "ship-sinking", "count-fingers", "fingers-out", "furnace-insert", "stoker-furnace", "crowd-2200",
                "deck-surge", "officer-shove", "climb-boat", "rocket-fire", "stoker-dash", "boat-lowering", "man-leap",
                "enemies-close-in", "you-trapped", "you-plan-chin", "flame-leap", "flame-scowl", "flame-fire-side", "fire-wall", "trench-cornered", "you-plan", "flame-climb", "flame-blast", "you-drop", "you-stagger", "you-corner", "you-quiet", "enemies-charge", "mg-reveal", "mg-final"}
STILL_GESTURES = {"", "think", "tap", "tick", "talk", "point", "shrug", "count"}


def storyboard_report(beats):
    shots = []
    for b in beats:
        for c in b["cuts"]:
            name = c["shot"] if isinstance(c["shot"], str) else c["shot"].get("type", "")
            act = (c.get("do") or "") not in STILL_GESTURES or name in ACTION_SHOTS
            react = name in REACTION_SHOTS and not act
            shots.append((name, act, react))
    if not shots:
        return
    n = len(shots)
    acts = sum(a for _, a, _ in shots)
    reacts = sum(r for _, _, r in shots)
    pairs = sum(1 for i in range(1, n) if shots[i][2] and shots[i - 1][2])
    print(f"  storyboard: {acts}/{n} action shots ({acts / n:.0%}, rule >= 80%), {reacts} reaction close-ups ({reacts / n:.0%}, rule <= 20%), {pairs} back-to-back reactions (rule 0)")
    if acts / n < 0.8 or reacts / n > 0.2 or pairs:
        print("  storyboard WARNING: too few action shots, see docs/storyboard-rules.md")


def main():
    vdir = (ROOT / sys.argv[1]).resolve()
    retts = "--retts" in sys.argv
    recording = "--recording" in sys.argv
    meta, beats = parse_scenes(vdir / "scenes.txt")
    slug = meta.get("slug", vdir.name)
    director = any(b.get("place") for b in beats)
    cut_mode = director or any(b["cuts"] for b in beats)
    tmp = ROOT / ".cache" / "tmp"
    tmp.mkdir(parents=True, exist_ok=True)
    linedir = vdir / "voice-lines"
    lead, tail = (0.25, 0.8) if cut_mode else (0.45, 1.1)
    lead = float(meta.get("lead", lead))  # `lead: 1.0` = picture runs 1 s before the first word (cold open)

    # ── 2. voice ──
    if not recording:
        missing = [b for b in beats if retts or not (linedir / f"{b['id']}.wav").exists()]
        if missing:
            if meta.get("voice") == "piper":
                tts_piper(missing, linedir, float(meta["voice_scale"]) if meta.get("voice_scale") else None)
            else:
                lj = tmp / "lines.json"
                lj.write_text(json.dumps([{"id": b["id"], "say": b["say"]} for b in missing]), encoding="utf-8")
                run(["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(ROOT / "tools" / "tts_placeholder.ps1"), str(lj), str(linedir), "Microsoft David Desktop", "3"])
        t = lead
        parts, inputs = [], []
        step = 60 / PACING.get("bpm", 112) / 2
        for i, b in enumerate(beats):
            if i > 0:
                t += b["pause"]
                # reveal lines (explicit pause) start on the music's eighth-note grid, so the
                # hit lands in rhythm instead of the voice drifting against the beat
                if b.get("snap") or b["pause"] >= 0.15:
                    # nearest grid point, but keep at least half the pause (never adds more than half a step)
                    g = round(np.round((t - 0.03) / step) * step + 0.03, 3)
                    t = g if g >= t - b["pause"] * 0.5 else round(g + step, 3)
            d = wav_seconds(linedir / f"{b['id']}.wav")
            b["voiceStart"], b["voiceEnd"] = round(t, 3), round(t + d, 3)
            t += d
        total = beats[-1]["voiceEnd"] + tail
        for i, b in enumerate(beats):
            inputs += ["-i", str(linedir / f"{b['id']}.wav")]
            ms = int(b["voiceStart"] * 1000)
            d = b["voiceEnd"] - b["voiceStart"]
            parts.append(f"[{i}]aresample=48000,afade=t=in:d=0.012,afade=t=out:st={max(0.0, d - 0.03):.3f}:d=0.03,adelay={ms}|{ms}[a{i}]")
        filt = ";".join(parts) + ";" + "".join(f"[a{i}]" for i in range(len(beats))) + f"amix=inputs={len(beats)}:normalize=0,apad,atrim=0:{total:.3f}[out]"
        run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", filt, "-map", "[out]", "-ac", "1", "-ar", "48000", str(vdir / "voice.wav")])
    else:
        total = wav_seconds(vdir / "voice.wav") + 0.3

    # ── 3. word timings ──
    from faster_whisper import WhisperModel

    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(vdir / "voice.wav"), "-f", "s16le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = model.transcribe(audio, language="en", word_timestamps=True, vad_filter=False)
    words = [{"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)} for s in segs for w in s.words]
    (vdir / "words.json").write_text(json.dumps(words, indent=1), encoding="utf-8")

    # ── 4. beats timing ──
    if recording:
        # align the WHOLE script to the recording at once (word-by-word), then each line starts at
        # its first word and ends at its last. Robust when lines begin with common words ("The", "You").
        full = " ".join(b["say"] for b in beats)
        al = align(full, words)
        k = 0
        for b in beats:
            n = len(re.findall(r"[A-Za-z0-9'’\-]+[?.!,]?", b["say"]))
            seg = al[k : k + n]
            k += n
            b["voiceStart"] = seg[0][1] if seg else (beats[-1].get("voiceEnd", 0) if beats else 0)
            b["voiceEnd"] = seg[-1][2] if seg else b["voiceStart"]
    lead_cut = 0.08 if cut_mode else 0.12
    for i, b in enumerate(beats):
        b["start"] = 0.0 if i == 0 else round(b["voiceStart"] - lead_cut, 3)
        b["end"] = round(beats[i + 1]["voiceStart"] - lead_cut, 3) if i + 1 < len(beats) else round(total, 3)
        b["words"] = [w for w in words if b["voiceStart"] - 0.05 <= w["start"] < b["voiceEnd"] + 0.05]
        cue = norm(b.get("cue", ""))
        kw = norm(b.get("keyword", ""))

        def is_cue(word: str, cue=cue, kw=kw) -> bool:
            n = norm(word)
            if not n:
                return False
            if cue and n.startswith(cue[:5]):
                return True
            return n.isdigit() and kw.isdigit() and kw.startswith(n)

        hit = next((w for w in b["words"] if is_cue(w["word"])), None)
        b["cueAt"] = round(hit["start"], 3) if hit else round(b["voiceStart"], 3)

        # cuts: each starts on its cue word (script aligned to the heard words, in order)
        b["aligned"] = align(b["say"], b["words"])
        si = 0
        for ci, c in enumerate(b["cuts"]):
            target = norm(c["cue"])
            found = next((j for j in range(si, len(b["aligned"])) if norm(b["aligned"][j][0]) == target), None)
            if found is None:
                found = next((j for j in range(si, len(b["aligned"])) if norm(b["aligned"][j][0]).startswith(target[:4])), None)
            if ci == 0:
                c["start"] = b["start"]
            elif found is not None:
                c["start"] = round(max(b["start"], b["aligned"][found][1] - 0.04), 3)
            else:
                c["start"] = round(b["start"] + (b["end"] - b["start"]) * ci / len(b["cuts"]), 3)
                print(f"  note: cue '{c['cue']}' not in the line of {b['id']}; cut placed evenly")
            if found is not None:
                si = found + 1
        for ci, c in enumerate(b["cuts"]):
            c["end"] = b["cuts"][ci + 1]["start"] if ci + 1 < len(b["cuts"]) else b["end"]
            c["face"] = c.get("face", b.get("face", "neutral"))
            c["tr"] = c.get("tr", "cut")
            if c["end"] - c["start"] < PACING.get("minShot", 0.45) - 0.05:
                print(f"  warn: {b['id']} cut '{c['cue']}' is only {c['end'] - c['start']:.2f}s")

    if director:
        spec = importlib.util.spec_from_file_location("director", ROOT / "tools" / "director.py")
        dmod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(dmod)
        prev_place, counter = None, {}
        for b in beats:
            b["cast"] = dmod.parse_cast(b.get("cast", ""))
            b["fire"] = dmod.rng(b.get("fire"))
            b["smoke"] = dmod.rng(b.get("smoke"))
            st = {}
            if b.get("doorshake"):
                st["doorShake"] = float(b["doorshake"])
            if b.get("dooropen"):
                st["doorOpen"] = dmod.rng(b["dooropen"])
            if b.get("sprinkler"):
                st["sprinkler"] = float(b["sprinkler"])
            b["state"] = st
            b["extras"] = b.get("extras", "yes") != "no"
            dmod.plan(b, prev_place, PACING, counter)
            prev_place = b["place"]

    # caption words (word-by-word mode): emphasis from `emph:` + any word with digits
    cap = []
    for b in beats:
        emph = {norm(e) for e in b["emph"]}
        for tok, a, e, heard in b.get("aligned") or [(w["word"], w["start"], w["end"], w["word"]) for w in b["words"]]:
            if heard == "":
                continue  # folded into a number shown on the previous token
            text = heard if heard and any(ch.isdigit() for ch in heard) else tok
            text = re.sub(r"[^\w'’?,\- ]", "", text).strip(", ")
            text = re.sub(r",(?=\S)", ", ", text)  # "25th,1911" -> "25th, 1911"
            if re.fullmatch(r"\d{1,2}[ .:]\d{2}", text):  # clock times: "2 05" / "2.05" -> "2:05"
                text = re.sub(r"[ .]", ":", text)
            if not text:
                continue
            # numbers read better with thousands separators (but leave years like 1894 / 1912 alone)
            if text.isdigit() and len(text) >= 4 and not (1800 <= int(text) <= 2099):
                text = f"{int(text):,}"
            n = norm(text)
            cap.append({"text": text, "start": a, "end": e, "emph": bool(n in emph or norm(tok) in emph or any(ch.isdigit() for ch in n)), "brk": bool(re.search(r"[.?!,;:]$", tok))})
    data = {"slug": slug, "format": meta.get("format", "short"), "world": meta.get("world"), "fps": FPS, "duration": round(total, 3), "beats": beats, "captionWords": cap}
    (vdir / "scenes.json").write_text(json.dumps(data, indent=1), encoding="utf-8")

    # ── 5. audio mix ──
    mix = vdir / "mix.wav"
    pre = tmp / "premix.wav"
    if cut_mode:
        sfx = load_sfx()
        if director:
            events, segs = director_audio(beats, total, sfx)
        else:
            events, segs = cut_audio(beats)
        fx_track = sfx.render_events(events, total)
        music = sfx.music_bed(segs, total)
        write_wav(tmp / "fx.wav", fx_track)
        write_wav(tmp / "music.wav", music)
        filt = (
            # no ducking: the music sits at one steady level ~18 dB under the voice, so it never
            # pumps and never leaves a silent hole between lines
            "[1]volume=-14dB[mus];[2]volume=-4dB[fx];[0][mus][fx]amix=inputs=3:normalize=0[out]"
        )
        run(["ffmpeg", "-v", "error", "-y", "-i", str(vdir / "voice.wav"), "-i", str(tmp / "music.wav"), "-i", str(tmp / "fx.wav"), "-filter_complex", filt, "-map", "[out]", "-ar", "48000", "-ac", "2", "-t", f"{total:.3f}", str(pre)])
        print(f"  sfx: {len(events)} events; music: {', '.join(f'{m} {a:.1f}-{e:.1f}s' for a, e, m in segs)}")
    else:
        filt = (
            f"anoisesrc=color=brown:amplitude=0.6:duration={total:.3f}:sample_rate=48000,lowpass=f=520,highpass=f=40,"
            f"volume=-24dB,tremolo=f=0.12:d=0.5[amb];"
            f"[0]asplit=2[v][sc];[amb][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck];"
            f"[v][duck]amix=inputs=2:normalize=0[out]"
        )
        run(["ffmpeg", "-v", "error", "-y", "-i", str(vdir / "voice.wav"), "-filter_complex", filt, "-map", "[out]", "-ar", "48000", "-ac", "2", str(pre)])
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(pre), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    summary = meas[meas.rfind("Summary:"):]
    integ = float(re.search(r"I:\s+(-?[\d.]+) LUFS", summary).group(1))
    gain = TARGET_LUFS - integ
    run(["ffmpeg", "-v", "error", "-y", "-i", str(pre), "-af", f"volume={gain:.2f}dB,alimiter=limit=0.79:attack=5:release=50:level=false", "-ar", "48000", "-ac", "2", str(mix)])
    print(f"  loudness: premix {integ:.1f} LUFS -> gain {gain:+.1f} dB (target {TARGET_LUFS} LUFS, limiter -1.5 dBTP)")

    # ── 6. publish for Remotion ──
    pub = ROOT / "public" / "videos" / slug
    pub.mkdir(parents=True, exist_ok=True)
    shutil.copy(vdir / "scenes.json", pub / "scenes.json")
    shutil.copy(mix, pub / "mix.wav")

    storyboard_report(beats)
    ncuts = sum(len(b["cuts"]) for b in beats)
    print(f"{slug}: {len(beats)} beats, {ncuts} cuts, {total:.2f}s ({round(total * FPS)} frames), {len(words)} words = {len(words) / total:.2f} words/s")
    for b in beats:
        print(f"  {b['id']}  {b['start']:6.2f}-{b['end']:6.2f}s  voice {b['voiceStart']:6.2f}-{b['voiceEnd']:6.2f}")
        for c in b["cuts"]:
            shot = c["shot"] if isinstance(c["shot"], str) else " ".join(str(v) for k, v in c["shot"].items() if k in ("type", "subject", "prop"))
            print(f"      {c['start']:6.2f}-{c['end']:6.2f}  {shot:<26} {c.get('do', '')} {c.get('fx', '')} {c['tr']}")


if __name__ == "__main__":
    main()
