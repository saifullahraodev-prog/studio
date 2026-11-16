"""The Ship Guy: burned-in subtitles (owner 2026-11-16: "add proper subtitles").

Usage: python -I tools/shipguy_subs.py videos/<dir> <slug>
Text from beats.txt (correct spellings), timing from words.json. Cues: whole sentences where they fit, split at
commas / balanced points, max 2 lines x 42 chars and ~4.5 s. Each cue keeps its word timings so the video can
highlight the word being spoken. Writes public/shipguy/<slug>/subs.json (frames at 30 fps).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from build_video import align  # noqa: E402
from shipguy_timeline import parse  # noqa: E402

FPS = 30
TOK = r"[A-Za-z0-9'’\-]+[?.!,]?"
MAX_CHARS, MAX_LINE, MAX_SEC = 84, 42, 4.5


def lines_of(words: list) -> list:
    """split a cue's words into 1-2 balanced lines (each <= MAX_LINE chars)."""
    txt = " ".join(w["w"] for w in words)
    if len(txt) <= MAX_LINE:
        return [len(words)]
    best, bd = len(words), 1e9
    for i in range(1, len(words)):
        a = len(" ".join(w["w"] for w in words[:i])); b = len(" ".join(w["w"] for w in words[i:]))
        if a <= MAX_LINE and b <= MAX_LINE and abs(a - b) < bd:
            best, bd = i, abs(a - b)
    return [best, len(words)]


def main(vdir: str, slug: str):
    vd = ROOT / vdir
    beats = parse(vd / "beats.txt")
    words = json.loads((vd / "words.json").read_text(encoding="utf-8"))
    text = " ".join(b["say"] for b in beats)
    al = align(text, words)
    disp, k = [], 0
    for w in text.split():
        n = len(re.findall(TOK, w))
        if n == 0:
            if disp:
                disp[-1]["w"] += " " + w
            continue
        seg = al[k:k + n]; k += n
        disp.append({"w": w, "s": seg[0][1], "e": seg[-1][2]})
    # sentences -> cues
    sents, cur = [], []
    for d in disp:
        cur.append(d)
        if re.search(r"[.?!]$", d["w"]):
            sents.append(cur); cur = []
    if cur:
        sents.append(cur)
    cues = []
    for sent in sents:
        stack = [sent]
        while stack:
            c = stack.pop(0)
            txt = " ".join(x["w"] for x in c)
            if (len(txt) <= MAX_CHARS and c[-1]["e"] - c[0]["s"] <= MAX_SEC) or len(c) < 3:
                cues.append(c); continue
            mid = len(txt) / 2
            best, sc, pos = 1, 1e9, 0
            for i, x in enumerate(c[:-1]):
                pos += len(x["w"]) + 1
                s = abs(pos - mid) - (12 if x["w"].endswith(",") else 0)
                if s < sc:
                    best, sc = i + 1, s
            stack[0:0] = [c[:best], c[best:]]
    out = []
    for i, c in enumerate(cues):
        nxt = cues[i + 1][0]["s"] if i + 1 < len(cues) else c[-1]["e"] + 1.5
        f0 = round(c[0]["s"] * FPS) - 2
        f1 = round(min(c[-1]["e"] + 0.5, nxt - 0.03) * FPS)
        br = lines_of(c)
        out.append({"from": max(0, f0), "to": f1, "lines": br,
                    "words": [{"w": x["w"], "f0": round(x["s"] * FPS), "f1": round(x["e"] * FPS)} for x in c]})
    pub = ROOT / "public" / "shipguy" / slug
    (pub / "subs.json").write_text(json.dumps(out, indent=0), encoding="utf-8")
    print(f"{len(out)} subtitle cues -> {pub / 'subs.json'}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
