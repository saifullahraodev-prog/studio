"""How We Ended Up · build a video from a script: voice -> word timings -> word-synced scenes (retention-first pacing).

Usage (from studio/):  set HF_HUB_OFFLINE=1 ; python -I tools/howwe_build.py <script.json> <slug> [--recording voice.mp3 words.json]
  --recording: use a real narration (e.g. CapCut TTS) instead of Piper. words.json comes from tools/howwe_transcribe.py.
  The script may cover only part of the recording (a video built in parts): it is aligned word by word and each
  scene gets its own slice of the recording.
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
BEAT_GAP = 100  # frames (3.3 s): longest allowed stretch with no visual change before a camera beat is added
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


def recorded_plan(scenes, audio_path, words_path):
    """Real narration, played UNCUT: the recording runs continuously with its own pauses, and each scene is timed
    around it (a scene's line starts 2 frames after its transition finishes; the transition plays in the pause
    before it). Returns (per-scene [(lead, dur, starts, ends)] with word times in s relative to lead, voice track)."""
    import subprocess
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ROOT / audio_path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(raw, np.float32)
    heard = json.loads((ROOT / words_path).read_text(encoding="utf-8"))
    per = [tokens(sc.get("say", "")) for sc in scenes]
    assert all(per), "recording mode: every scene needs a spoken line"
    flat = [t for toks in per for t in toks]
    # align only against the stretch of the recording this script covers (a part of the video)
    sm = difflib.SequenceMatcher(None, [norm(t) for t, _ in flat], [norm(w["word"]) for w in heard], autojunk=False)
    blocks = [b for b in sm.get_matching_blocks() if b.size >= 3]
    j0 = max(0, blocks[0].b - blocks[0].a - 5)
    j1 = min(len(heard), blocks[-1].b + blocks[-1].size + (len(flat) - blocks[-1].a - blocks[-1].size) + 5)
    st, en = align(flat, heard[j0:j1])
    print(f"recording: {sum(b.size for b in blocks)}/{len(flat)} script words matched exactly (rest interpolated)")
    idx, k = [], 0
    for toks in per:
        idx.append((k, k + len(toks)))
        k += len(toks)
    # scene "pauseAfter": {"word": sec} adds silence after that word (placed in the middle of the natural gap)
    ins = []
    for sc, (a, b) in zip(scenes, idx):
        for key, sec in sc.get("pauseAfter", {}).items():
            k = next((j for j in range(a, b) if norm(flat[j][0]) == norm(key)), None)
            if k is None:
                print(f"  ! pauseAfter word '{key}' not found")
                continue
            nxt = st[k + 1] if k + 1 < len(st) else en[k] + 0.3
            ins.append(((en[k] + nxt) / 2, float(sec)))
    if ins:
        ins.sort()
        sh = lambda t: t + sum(sec for p0, sec in ins if p0 <= t)
        st, en = [sh(x) for x in st], [sh(x) for x in en]
        parts, last = [], 0
        for p0, sec in ins:
            parts += [audio[last:int(p0 * SR)], np.zeros(int(sec * SR), np.float32)]
            last = int(p0 * SR)
        audio = np.concatenate(parts + [audio[last:]])
        print(f"recording: {len(ins)} extra pause(s), +{sum(x for _, x in ins):.2f} s")
    t0 = max(0.0, st[0] - 4 / FPS)
    n = len(scenes)
    tin = [0] + [T_IN.get(sc.get("in", "cut"), 0) for sc in scenes[1:]]
    F = [int(round((st[a] - t0) * FPS)) for a, _ in idx]
    lead = [F[0]] + [tin[i] + 2 for i in range(1, n)]
    start = [F[i] - lead[i] for i in range(n)]
    f_end = int(round((en[-1] - t0) * FPS)) + 18
    plan = []
    for i, (a, b) in enumerate(idx):
        dur = (start[i + 1] + tin[i + 1] - start[i]) if i < n - 1 else f_end - start[i]
        base = t0 + F[i] / FPS  # recording time of this scene's lead point
        plan.append((lead[i], dur, [x - base for x in st[a:b]], [x - base for x in en[a:b]]))
    total = start[-1] + plan[-1][1]
    voice = audio[int(t0 * SR):int(t0 * SR) + int(total / FPS * SR)].copy()
    fade = int(0.03 * SR)
    voice[:fade] *= np.linspace(0, 1, fade)
    voice[-int(0.25 * SR):] *= np.linspace(1, 0, int(0.25 * SR))
    return plan, voice


def main():
    script_file, slug = sys.argv[1], sys.argv[2]
    script = json.loads((ROOT / script_file).read_text(encoding="utf-8"))
    scenes = script["scenes"]
    rec = None
    if "--recording" in sys.argv:
        r = sys.argv.index("--recording")
        rec, rec_voice = recorded_plan(scenes, sys.argv[r + 1], sys.argv[r + 2])
    else:
        from faster_whisper import WhisperModel
        from howwe_voice import synth
        from piper import PiperVoice, SynthesisConfig

        voice = PiperVoice.load(str(ROOT / "models" / "piper" / "en_US-ryan-high.onnx"))
        # script-level "voiceScale": 1.0 = Piper default; ~1.15 = natural documentary pace (~150 wpm)
        cfg = SynthesisConfig(length_scale=script.get("voiceScale", 0.95), noise_scale=0.6, noise_w_scale=0.7)
        asr = WhisperModel("small", device="cpu", compute_type="int8")

    clips, built = [], []
    for i, sc in enumerate(scenes):
        say = sc.get("say", "")
        toks = tokens(say)
        if rec:
            lead, dur, st, en = rec[i]
            clip = np.zeros(1, np.float32)
        else:
            clip = synth(voice, cfg, " ".join(t for t, _ in toks)) if say else np.zeros(1, np.float32)
            segs, _ = asr.transcribe(resample(clip, SR, 16000), language="en", word_timestamps=True, vad_filter=False)
            heard = [{"word": w.word.strip(), "start": w.start, "end": w.end} for s in segs for w in s.words]
            st, en = align(toks, heard) if toks else ([], [])
        if not rec:
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
                p["zoomTo"] = [{"f": at(z["on"], 40), "lonlat": z["lonlat"], "zoom": z.get("zoom", 1.7), **({"stay": True} if z.get("stay") else {})} for z in p["zoomTo"]]
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
        # camera beats: wherever nothing visual happens for > BEAT_GAP, reframe gently at the nearest phrase start
        ev = [0, dur] + [w["f0"] for w in words if w["em"]]
        ev += p.get("itemsAt", []) + p.get("orderAt", []) + [k["f"] for k in p.get("cam", [])]
        ev += [z["f"] for z in p.get("zoomTo", []) if "f" in z] + [m["f"] for m in p.get("marks", []) if "f" in m]
        ev += [pn["f"] for pn in p.get("pins", []) if "f" in pn] + [int(r["at"] * dur) for r in p.get("routes", []) if "at" in r]
        ev += [p[k] for k in ("splitAt", "flipAt", "downAt", "answerAt") if k in p]
        starts = [w["f0"] for k, w in enumerate(words) if k == 0 or re.search(r"[.,!?;:…]$", words[k - 1]["w"])]
        beats = []
        for _ in range(12):
            evs = sorted(set(ev + beats))
            gaps = [(b2 - a2, a2, b2) for a2, b2 in zip(evs, evs[1:]) if b2 - a2 > BEAT_GAP]
            if not gaps:
                break
            g, a2, b2 = max(gaps)
            mid = (a2 + b2) / 2
            cand = [f0 for f0 in starts if a2 + 20 < f0 < b2 - 20] or [w["f0"] for w in words if a2 + 20 < w["f0"] < b2 - 20] or [int(mid)]
            beats.append(min(cand, key=lambda f0: abs(f0 - mid)))
        b = {"t": t, "in": sc.get("in", "cut"), "dur": dur, "p": p, "words": words, "say": say, "pillar": sc.get("pillar", "eat"), "beats": sorted(beats)}
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
    if rec:
        out = np.pad(rec_voice, (0, max(0, len(out) - len(rec_voice))))[:len(out)]
    if "--voice" not in sys.argv:
        write_wav(pub / "voice.wav", out / (np.max(np.abs(out)) or 1) * 0.9)
    (pub / "built.json").write_text(json.dumps({"note": script.get("note", ""), "fps": FPS, "scenes": built}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"-> public/howwe/{slug}/built.json, voice.wav  ({total / FPS:.1f} s, {len(built)} scenes)")


if __name__ == "__main__":
    main()
