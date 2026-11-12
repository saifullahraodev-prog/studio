"""The Ship Guy: YouTube subtitle file (.srt) from the script text + word timings.

Usage: python -I tools/shipguy_srt.py videos/<dir> <out.srt>
Text comes from beats.txt (correct spellings: Seawise Giant, C. Y. Tung...), timing from words.json
(faster-whisper on the final voice). Cues: max 2 lines x 42 chars, 1-6 s, split at sentence/clause ends.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from build_video import align  # noqa: E402
from shipguy_timeline import parse  # noqa: E402

TOK = r"[A-Za-z0-9'’\-]+[?.!,]?"
MAX_CHARS, MAX_LINE, MAX_SEC, MIN_SEC = 84, 42, 6.0, 1.0


def ts(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def two_lines(text: str) -> str:
    if len(text) <= MAX_LINE:
        return text
    # break points: every space, or (if needed) right after a hyphen ("six-hundred-|horsepower")
    best, best_d = text, 1e9
    points = [i for i, ch in enumerate(text) if ch == " "]
    hyph = [i + 1 for i, ch in enumerate(text) if ch == "-"]
    for cands, is_h in ((points, False), (hyph, True)):
        for i in cands:
            a, b = (text[:i], text[i:]) if is_h else (text[:i], text[i + 1:])
            if len(a) <= MAX_LINE and len(b) <= MAX_LINE and abs(len(a) - len(b)) < best_d:
                best, best_d = f"{a}\n{b}", abs(len(a) - len(b))
        if best_d < 1e9:
            break
    return best


def main(vdir: str, out: str):
    vd = ROOT / vdir
    beats = parse(vd / "beats.txt")
    words = json.loads((vd / "words.json").read_text(encoding="utf-8"))
    text = " ".join(b["say"] for b in beats)
    al = align(text, words)
    # map each display word (split on spaces, punctuation kept) to its token times
    disp = []
    k = 0
    for w in text.split():
        n = len(re.findall(TOK, w))
        if n == 0:
            if disp:
                disp[-1] = (disp[-1][0] + " " + w, disp[-1][1], disp[-1][2])
            continue
        seg = al[k:k + n]; k += n
        disp.append((w, seg[0][1], seg[-1][2]))
    # 1) sentences; 2) split long sentences into balanced chunks, preferring breaks after commas
    sents, cur = [], []
    for d in disp:
        cur.append(d)
        if re.search(r"[.?!]$", d[0]) and not re.fullmatch(r"[A-Z]\.", d[0]):  # "C. Y. Tung" is not 3 sentences
            sents.append(cur); cur = []
    if cur:
        sents.append(cur)
    cues = []
    TARGET = 70
    for sent in sents:
        txt = " ".join(x[0] for x in sent)
        n = max(1, -(-len(txt) // TARGET), -(-int((sent[-1][2] - sent[0][1]) * 10) // int(MAX_SEC * 10)))
        if n == 1:
            cues.append([sent[0][1], sent[-1][2], txt]); continue
        # cumulative char position at the end of each word
        pos, c = [], 0
        for w in sent:
            c += len(w[0]) + 1; pos.append(c)
        cuts, start = [], 0
        for j in range(1, n):
            goal = len(txt) * j / n
            best, score = None, 1e9
            for i in range(start, len(sent) - 1):
                s = abs(pos[i] - goal) - (14 if sent[i][0].endswith(",") else 0)
                if s < score:
                    best, score = i, s
            cuts.append(best); start = best + 1
        a = 0
        for b in cuts + [len(sent) - 1]:
            chunk = sent[a:b + 1]
            cues.append([chunk[0][1], chunk[-1][2], " ".join(x[0] for x in chunk)]); a = b + 1
    # a cue that can't fit in 2 x 42 chars is split in two near its middle (time shared by length)
    fixed = []
    for s, e, txt in cues:
        if len(txt) <= MAX_CHARS:
            fixed.append([s, e, txt]); continue
        mid = len(txt) // 2
        cut = min((i for i, ch in enumerate(txt) if ch == " "), key=lambda i: abs(i - mid))
        k = cut / len(txt)
        fixed += [[s, s + (e - s) * k, txt[:cut]], [s + (e - s) * k, e, txt[cut + 1:]]]
    cues = fixed
    # tidy timing: min duration, hold until just before the next cue
    for i, c in enumerate(cues):
        nxt = cues[i + 1][0] if i + 1 < len(cues) else c[1] + 2
        c[1] = min(max(c[1] + 0.25, c[0] + MIN_SEC), nxt - 0.05)
    lines = []
    for i, (s, e, t) in enumerate(cues, 1):
        lines += [str(i), f"{ts(s)} --> {ts(e)}", two_lines(t), ""]
    Path(out).write_text("\n".join(lines), encoding="utf-8")
    print(f"{len(cues)} cues -> {out}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
