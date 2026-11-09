"""The director: turns a beat (place + cast + spoken line with word timings) into timed cuts.

Used by tools/build_video.py for beats that name a `place:`. Rules (in order):
  1. explicit `shot:` lines in the scene file win (cue word | type [subject] [prop] | face= | do=)
  2. a new place opens on an ESTABLISHING shot
  3. a phrase that mentions a prop of this place gets an INSERT of that prop
  4. a phrase with an emphasised word gets a punch-in CLOSE on the subject
  5. a question gets a LOW angle
  6. otherwise rotate medium / wide / two-shot / over-the-shoulder / close, never the same twice in a row
Phrases are split at punctuation, merged when shorter than minShot and split when longer than maxShot.
"""
import re

PROP_WORDS = {
    "office": {"exit": ["exit", "door", "doors", "outward", "unlocked", "push"], "sprinkler": ["sprinkler", "sprinklers"], "alarm": ["alarm", "alarms", "drill", "drills"]},
    "factory": {"door": ["locked", "door", "doors", "stealing"], "bin": ["scrap", "scraps", "bin", "match", "cigarette"], "machines": ["sew", "sewing", "machines", "machine", "shirtwaists", "blouses"], "windows": ["windows", "window"]},
    "stairwell": {"door": ["locked", "door", "washington"], "hole": ["coming", "stairs"], "elevator": ["elevator", "elevators", "operators", "trip"], "window": []},
    "street": {"ladder": ["ladder", "ladders", "reach"], "top": ["smoke", "ninth"], "fireescape": ["escape", "collapses", "twists"], "windows": ["jump", "choice"], "engine": ["department", "hoses", "water", "engines"]},
    "courtroom": {"bench": ["trial", "guilty", "jury", "manslaughter", "court"]},
}

ROTATION = ["medium", "wide", "two", "close", "ots", "medium", "low"]


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def phrases(aligned, min_shot, max_shot):
    """[(i0, i1)] token index ranges (inclusive) split at punctuation, sized to min/max shot."""
    segs, cur = [], []
    for i, (tok, a, e, _h) in enumerate(aligned):
        cur.append(i)
        if re.search(r"[.?!,;:]$", tok) or tok.endswith("..."):
            segs.append(cur)
            cur = []
    if cur:
        segs.append(cur)
    dur = lambda s: aligned[s[-1]][2] - aligned[s[0]][1]
    # split long phrases at the middle word
    out = []
    for s in segs:
        stack = [s]
        while stack:
            x = stack.pop(0)
            if dur(x) > max_shot and len(x) >= 4:
                m = len(x) // 2
                stack[:0] = [x[:m], x[m:]]
            else:
                out.append(x)
    # merge phrases that are too short into the next one
    merged = []
    for s in out:
        if merged and dur(merged[-1]) < min_shot:
            merged[-1] = merged[-1] + s
        else:
            merged.append(s)
    if len(merged) > 1 and dur(merged[-1]) < min_shot * 0.6:
        last = merged.pop()
        merged[-1] = merged[-1] + last
    return [(s[0], s[-1]) for s in merged]


def plan(beat, prev_place, pacing, counter):
    """Fill beat['cuts'] with director cuts. `counter` is a dict carried across beats (variety)."""
    aligned = beat["aligned"]
    place = beat["place"]
    cast = [m["name"] for m in beat["cast"]]
    subject = beat.get("focus") or (beat["speaker"] if beat["speaker"] in cast else (cast[0] if cast else None))
    other = next((c for c in cast if c != subject), None)
    emph = {norm(e) for e in beat["emph"]}
    min_shot = float(beat.get("minshot", pacing.get("dirMinShot", 1.0)))
    max_shot = float(beat.get("maxshot", pacing.get("dirMaxShot", 2.6)))
    explicit = beat.get("shots", [])

    if not aligned:
        segs = [(0, -1)]
    else:
        segs = phrases(aligned, min_shot, max_shot)
    # explicit shots start new segments at their cue words
    starts = {i0 for i0, _ in segs}
    exp_at = {}
    si = 0
    for sh in explicit:
        j = next((k for k in range(si, len(aligned)) if norm(aligned[k][0]).startswith(norm(sh["cue"])[:5])), None)
        if j is None:
            print(f"  note: shot cue '{sh['cue']}' not found in {beat['id']}")
            continue
        exp_at[j] = sh
        starts.add(j)
        si = j + 1
    bounds = sorted(starts)
    cuts = []
    last_type = counter.get("last")
    for n, i0 in enumerate(bounds):
        i1 = (bounds[n + 1] - 1) if n + 1 < len(bounds) else len(aligned) - 1
        words = [norm(aligned[k][0]) for k in range(i0, i1 + 1)] if aligned else []
        text = " ".join(aligned[k][0] for k in range(i0, i1 + 1)) if aligned else ""
        spec = {"subject": subject, "other": other, "variant": counter.get("v", 0)}
        face = do = None
        if i0 in exp_at:
            sh = exp_at[i0]
            parts = sh["spec"].split()
            spec["type"] = parts[0]
            named = [x for x in parts[1:] if x in cast]  # first cast name = subject, second = other
            if named:
                spec["subject"] = named[0]
                spec["other"] = named[1] if len(named) > 1 else next((c for c in cast if c != named[0]), None)
            for x in parts[1:]:
                if x not in cast:
                    spec["prop"] = x
            face, do = sh.get("face"), sh.get("do")
            if sh.get("punch"):
                spec["punch"] = True
        elif n == 0 and place != prev_place:
            spec["type"] = "establish"
        else:
            props = PROP_WORDS.get(place, {})
            hit = next((p for p, kws in props.items() if any(w in kws for w in words)), None)
            if hit and counter.get("lastprop") != (place, hit):
                spec["type"] = "insert"
                spec["prop"] = hit
                counter["lastprop"] = (place, hit)
            elif any(w in emph for w in words) and subject:
                spec["type"] = "close"
                spec["punch"] = True
            elif text.rstrip().endswith("?") and subject:
                spec["type"] = "low"
            else:
                k = counter.get("rot", 0)
                for _ in range(len(ROTATION)):
                    cand = ROTATION[k % len(ROTATION)]
                    k += 1
                    if cand in ("two", "ots") and not other:
                        continue
                    if not subject and cand != "wide":
                        cand = "establish"
                    if cand != last_type:
                        break
                counter["rot"] = k
                spec["type"] = cand
        if beat.get("shake") and spec["type"] in ("establish", "wide", "insert"):
            spec["shake"] = float(beat["shake"])
        start = beat["start"] if n == 0 else round(aligned[i0][1] - 0.04, 3)
        cut = {"start": round(max(beat["start"], start), 3), "shot": {k: v for k, v in spec.items() if v is not None}, "tr": "cut"}
        cut["explicit"] = i0 in exp_at
        if face:
            cut["face"] = face
        if do:
            cut["do"] = do
        if n == 0:
            cut["tr"] = beat.get("tr") or ("whip" if place != prev_place else "cut")
        cuts.append(cut)
        last_type = spec["type"]
        counter["v"] = counter.get("v", 0) + 1
    # no flash-frames: a cut shorter than ~0.5 s is folded into its neighbour
    # (an explicit shot keeps its spot and swallows the auto shot before it)
    tiny = float(pacing.get("dirTiny", 0.5))
    k = 1
    while k < len(cuts):
        nxt = cuts[k + 1]["start"] if k + 1 < len(cuts) else beat["end"]
        prev_len = cuts[k]["start"] - cuts[k - 1]["start"]
        if nxt - cuts[k]["start"] < tiny and not cuts[k]["explicit"]:
            cuts.pop(k)
            continue
        if prev_len < tiny and k - 1 > 0 and not cuts[k - 1]["explicit"]:
            cuts.pop(k - 1)
            continue
        if prev_len < tiny and cuts[k]["explicit"] and k - 1 == 0:
            cuts[k]["start"] = cuts[0]["start"]
            cuts[k]["tr"] = cuts[0]["tr"]
            cuts.pop(0)
            continue
        k += 1
    for n, c in enumerate(cuts):
        c["end"] = cuts[n + 1]["start"] if n + 1 < len(cuts) else beat["end"]
        c.pop("explicit", None)
    counter["last"] = cuts[-1]["shot"]["type"] if cuts else last_type
    beat["cuts"] = cuts
    return cuts


def parse_cast(s):
    """'insp=inspector@center do=talk face=determined; w=worker@aisle do=sew' -> list"""
    out = []
    for part in [p.strip() for p in s.split(";") if p.strip()]:
        toks = part.split()
        name, rest = toks[0].split("=", 1)
        char, spot = (rest.split("@", 1) + [""])[:2]
        m = {"name": name, "char": char, "spot": spot}
        for t in toks[1:]:
            if "=" in t:
                k, v = t.split("=", 1)
                m[k] = v
        out.append(m)
    return out


def rng(s):
    """'0.2-0.8' -> [0.2, 0.8]; '0.5' -> [0.5, 0.5]"""
    if s is None or s == "":
        return None
    a, _, b = s.partition("-")
    return [float(a), float(b or a)]
