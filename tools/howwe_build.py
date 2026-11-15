"""How We Ended Up · build a video from a script: voice -> word timings -> word-synced scenes (retention-first pacing).

Usage (from studio/):  set HF_HUB_OFFLINE=1 ; python -I tools/howwe_build.py <script.json> <slug> [--voice recorded.wav]
Writes public/howwe/<slug>/{voice.wav, built.json}. Then: tools/howwe_mix.py public/howwe/<slug>/built.json <slug> --voice ...
and render HowVideo with props {"slug": "<slug>"}.

Script = {"scenes": [ { "t": template, "in": cut|dolly|door, "say": "line with *emphasis*", "p": {...},
                        "rehook": "chip text", "rehookOn": "word", "pillar": "eat", "hold": 0.0 } ]}
Word anchors in "p" (resolved to frames, local to the scene):
  exhibits  items[i].on              -> itemsAt[i]  (+ automatic camera visit to each exhibit as it is named)
  map       legend[i].on             -> order/orderAt (fill when named);  zoomTo[{on, lonlat, zoom}] -> camera visits
  period    splitOn                  -> splitAt (second room slides in when named)
  cardFlip  flipOn                   -> flipAt
  reveal    downOn / answerOn        -> downAt / answerAt
  any       marks[{on, kind, x, y, w, h}] -> hand-drawn marks drawn when the word is said
Pacing: each scene = transition + 6 frames + the spoken line + 14 frames (+ "hold" s). No dead air.
"""
import difflib
import json
import re
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from howwe_mix import FPS, T_IN, write_wav  # noqa: E402

SR = 48000
LEAD, TAIL, MIN_DUR = 6, 14, 54
XS = {1: [960], 2: [480, 1440], 3: [320, 960, 1600]}


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def tokens(say):
    """script tokens with emphasis flags: [(display, em)]"""
    out = []
    for m in re.finditer(r"\*([^*]+)\*|([^\s*]+)", say):
        if m.group(1):
            for i, t in enumerate(m.group(1).split()):
                out.append((t, True))
        else:
            tok = m.group(2)
            if out and re.fullmatch(r"[.,!?;:…]+", tok):  # punctuation after *emphasis* sticks to the previous word
                out[-1] = (out[-1][0] + tok, out[-1][1])
            else:
                out.append((tok, False))
    return out


def align(toks, words):
    """map script tokens to heard word times (seconds); unheard tokens are interpolated"""
    sn = [norm(t) for t, _ in toks]
    wn = [norm(w["word"]) for w in words]
    st, en = [None] * len(toks), [None] * len(toks)
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, sn, wn, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                st[i1 + k], en[i1 + k] = words[j1 + k]["start"], words[j1 + k]["end"]
        elif op == "replace" and j2 > j1:
            a, e, n = words[j1]["start"], words[j2 - 1]["end"], i2 - i1
            for k in range(n):
                st[i1 + k], en[i1 + k] = a + (e - a) * k / n, a + (e - a) * (k + 1) / n
    known = [i for i in range(len(toks)) if st[i] is not None]
    for i in range(len(toks)):
        if st[i] is None:
            p = max([k for k in known if k < i], default=None)
            q = min([k for k in known if k > i], default=None)
            a = en[p] if p is not None else (words[0]["start"] if words else 0)
            e = st[q] if q is not None else (words[-1]["end"] if words else a + 0.3)
            span = (q if q is not None else len(toks)) - (p if p is not None else -1)
            pos = i - (p if p is not None else -1)
            st[i], en[i] = a + (e - a) * (pos - 1) / span, a + (e - a) * pos / span
    return st, en


def resample(x, sr_in, sr_out):
    n = int(len(x) * sr_out / sr_in)
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)


def main():
    script_file, slug = sys.argv[1], sys.argv[2]
    script = json.loads((ROOT / script_file).read_text(encoding="utf-8"))
    scenes = script["scenes"]
    from faster_whisper import WhisperModel
    from howwe_voice import synth
    from piper import PiperVoice, SynthesisConfig

    voice = PiperVoice.load(str(ROOT / "models" / "piper" / "en_US-ryan-high.onnx"))
    cfg = SynthesisConfig(length_scale=0.95, noise_scale=0.6, noise_w_scale=0.7)
    asr = WhisperModel("small", device="cpu", compute_type="int8")

    clips, built = [], []
    for i, sc in enumerate(scenes):
        say = sc.get("say", "")
        toks = tokens(say)
        clip = synth(voice, cfg, " ".join(t for t, _ in toks)) if say else np.zeros(1, np.float32)
        segs, _ = asr.transcribe(resample(clip, SR, 16000), language="en", word_timestamps=True, vad_filter=False)
        heard = [{"word": w.word.strip(), "start": w.start, "end": w.end} for s in segs for w in s.words]
        st, en = align(toks, heard) if toks else ([], [])
        lead = (T_IN.get(sc.get("in", "cut"), 0) if i > 0 else 0) + (LEAD if i > 0 else 4)
        speech_f = int(np.ceil(len(clip) / SR * FPS))
        dur = max(MIN_DUR, lead + speech_f + TAIL + int(sc.get("hold", 0) * FPS))
        words = [{"w": t, "f0": int(round(lead + s * FPS)), "f1": int(round(lead + e * FPS)), "em": em} for (t, em), s, e in zip(toks, st, en)]
        clips.append((lead, clip))

        def at(word, default=None):
            n = norm(word)
            for w in words:
                if norm(w["w"]).startswith(n):
                    return w["f0"]
            print(f"  ! scene {i + 1}: anchor word '{word}' not in the line")
            return default

        p = json.loads(json.dumps(sc.get("p", {})))
        t = sc["t"]
        if t == "exhibits" and any("on" in it for it in p.get("items", [])):
            n = len(p["items"])
            p["itemsAt"] = [max(2, (at(it["on"], 8 + k * 14) or 8) - 4) for k, it in enumerate(p["items"])]
            keys = []
            for k, f0 in enumerate(p["itemsAt"]):
                keys.append({"f": f0 + 4, "zoom": 1.22, "fx": XS[n][k], "fy": 600, "d": 10})
            back = p["itemsAt"][-1] + 34
            if back < dur - 8:
                keys.append({"f": back, "zoom": 1.0, "fx": 960, "fy": 540, "d": 14})
            p["cam"] = keys
        if t == "map":
            legend = p.get("legend", [])
            if any("on" in l for l in legend):
                timed = sorted(((at(l["on"], 30) if "on" in l else None), l["cat"]) for l in legend if "on" in l)
                p["order"] = [c for _, c in timed]
                p["orderAt"] = [f0 for f0, _ in timed]
            for pn in p.get("pins", []):
                if "on" in pn:
                    pn["f"] = max(0, at(pn.pop("on"), 20) - 2)
            for r in p.get("routes", []):
                if "on" in r:
                    r["at"] = round(at(r.pop("on"), int(dur * 0.5)) / dur, 4)
            if p.get("zoomTo"):
                p["zoomTo"] = [{"f": at(z["on"], 40), "lonlat": z["lonlat"], "zoom": z.get("zoom", 1.7)} for z in p["zoomTo"]]
        if "splitOn" in p:
            p["splitAt"] = max(0, at(p.pop("splitOn"), 0) - 4)
        if "flipOn" in p:
            p["flipAt"] = at(p.pop("flipOn"), int(dur * 0.45))
        if "downOn" in p:
            p["downAt"] = max(0, at(p.pop("downOn"), int(dur * 0.12)) - 3)
        if "answerOn" in p:
            p["answerAt"] = at(p.pop("answerOn"), int(dur * 0.38))
        if p.get("marks"):
            p["marks"] = [{**{k: v for k, v in m.items() if k != "on"}, "f": at(m["on"], 20)} for m in p["marks"]]
        b = {"t": t, "in": sc.get("in", "cut"), "dur": dur, "p": p, "words": words, "say": say, "pillar": sc.get("pillar", "eat")}
        if sc.get("rehook"):
            b["rehook"] = sc["rehook"]
            b["rehookAt"] = at(sc["rehookOn"], dur - 45) if sc.get("rehookOn") else max(0, dur - 45)
        built.append(b)
        print(f"scene {i + 1} {t:9s} {dur / FPS:5.2f}s  speech {len(clip) / SR:4.2f}s  pops {sum(w['em'] for w in words)}")

    # voice track on the final timeline
    starts, t = [], 0
    for i, b in enumerate(built):
        if i > 0:
            t -= T_IN.get(b["in"], 0)
        starts.append(t)
        t += b["dur"]
    total = t
    out = np.zeros(int(total / FPS * SR) + SR, np.float32)
    for (lead, clip), s0 in zip(clips, starts):
        p0 = int((s0 + lead) / FPS * SR)
        out[p0:p0 + len(clip)] += clip[: max(0, len(out) - p0)]
    pub = ROOT / "public" / "howwe" / slug
    pub.mkdir(parents=True, exist_ok=True)
    if "--voice" not in sys.argv:
        write_wav(pub / "voice.wav", out / (np.max(np.abs(out)) or 1) * 0.9)
    (pub / "built.json").write_text(json.dumps({"note": script.get("note", ""), "fps": FPS, "scenes": built}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"-> public/howwe/{slug}/built.json, voice.wav  ({total / FPS:.1f} s, {len(built)} scenes)")


if __name__ == "__main__":
    main()
