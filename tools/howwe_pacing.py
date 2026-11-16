"""How We Ended Up · pacing / retention checker for a scene list (built.json from howwe_build.py, or a plain scenes.json).

Usage (from studio/):  python -I tools/howwe_pacing.py <built.json or scenes.json>
Counts every VISUAL CHANGE the viewer sees (scene/transition, exhibit appears, camera move, keyword pop, map fill,
mark drawn, card flip, lights, split opens, re-hook) and reports the rules from the retention playbook:
  R1 first hook (first keyword pop or visual event after 0 s) within 3 s
  R2 longest stretch with no visual change <= 4 s       (captions changing do NOT count)
  R3 average gap between visual changes <= 3 s
  R4 no dead air: gaps between spoken words <= 1.2 s (scene changes included)
  R5 shots: average scene <= 6 s
"""
import json
import sys
from pathlib import Path

FPS = 30
T_IN = {"cut": 0, "dolly": 22, "door": 20}
TIMING = {"stagger": 14}


def events(scenes):
    starts, t = [], 0
    for i, s in enumerate(scenes):
        if i > 0:
            t -= T_IN.get(s.get("in", "cut"), 0)
        starts.append(t)
        t += s["dur"]
    total = t
    ev, words = [], []
    for i, s in enumerate(scenes):
        t0, p, d = starts[i], s.get("p", {}), s["dur"]
        ev.append((t0, f"scene {i + 1} {s['t']} ({s.get('in', 'cut')})"))
        for w in s.get("words", []):
            words.append((t0 + w["f0"], t0 + w["f1"]))
            if w.get("em"):
                ev.append((t0 + w["f0"], f"pop '{w['w']}'"))
        kind = s["t"]
        if kind == "exhibits":
            for k, _ in enumerate(p.get("items", [])):
                ev.append((t0 + (p.get("itemsAt") or [8 + j * 14 for j in range(9)])[k], f"exhibit {k + 1}"))
        if kind == "map":
            ev.append((t0 + 6, "frame push"))
            for k, f0 in enumerate(p.get("orderAt") or [30 + j * 26 for j in range(len(p.get("order", [])))]):
                ev.append((t0 + f0, f"map fill {k + 1}"))
            for pn in p.get("pins", []):
                ev.append((t0 + pn.get("f", 0), "pin"))
            for r in p.get("routes", []):
                ev.append((t0 + int(r.get("at", 0.5) * d), "route draws"))
            for z in p.get("zoomTo", []):
                if "f" in z:
                    ev.append((t0 + z["f"], "map zoom"))
        for k in p.get("cam", []):
            ev.append((t0 + k["f"], "camera move"))
        for m in p.get("marks", []):
            if "f" in m:
                ev.append((t0 + m["f"], f"mark {m['kind']}"))
        if kind == "cardFlip":
            ev.append((t0 + p.get("flipAt", int(d * 0.45)), "card flip"))
        if kind == "reveal":
            ev.append((t0 + p.get("downAt", int(d * 0.12)), "lights down"))
            ev.append((t0 + p.get("answerAt", int(d * 0.38)), "answer"))
        if kind == "period" and p.get("right"):
            ev.append((t0 + p.get("splitAt", 0), "split opens"))
        if kind == "period" and not p.get("right"):
            ev.append((t0 + 10, "diorama push"))
        if kind == "today":
            ev.append((t0 + 2, "camera push"))
        if s.get("rehook"):
            ev.append((t0 + s.get("rehookAt", d - 45), "re-hook chip"))
    return sorted(ev), sorted(words), total, [s["dur"] for s in scenes]


def main():
    data = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    ev, words, total, durs = events(data["scenes"])
    times = sorted({round(t) for t, _ in ev if t < total} | {total})
    gaps = [(b - a, a) for a, b in zip([0] + times, times)]
    longest, at = max(gaps)
    avg = total / max(1, len(times))
    first = min((t for t, n in ev if t > 0), default=total)
    first_pop = min((t for t, n in ev if n.startswith("pop")), default=None)
    dead = [(b0 - a1, a1) for (a0, a1), (b0, b1) in zip(words, words[1:]) if b0 - a1 > 1.2 * FPS]
    if words:
        dead = [(words[0][0], 0)] * (words[0][0] > 1.2 * FPS) + dead
    ok = lambda c: "OK  " if c else "FAIL"
    print(f"length {total / FPS:.1f} s, {len(durs)} scenes, {len(times)} visual changes")
    print(f"{ok(first <= 3 * FPS)} R1 first change at {first / FPS:.2f} s; first keyword pop at {first_pop / FPS if first_pop is not None else float('nan'):.2f} s (<= 3 s)")
    print(f"{ok(longest <= 4 * FPS)} R2 longest gap without a visual change {longest / FPS:.2f} s at {at / FPS:.1f} s (<= 4 s)")
    print(f"{ok(avg <= 3 * FPS)} R3 average gap {avg / FPS:.2f} s (<= 3 s)")
    print(f"{ok(not dead)} R4 dead air (silence > 1.2 s): {len(dead)}" + (f"  e.g. {dead[0][0] / FPS:.1f} s at {dead[0][1] / FPS:.1f} s" if dead else ""))
    print(f"{ok(sum(durs) / len(durs) <= 6 * FPS)} R5 average scene {sum(durs) / len(durs) / FPS:.2f} s (<= 6 s)")
    over = [(g, a) for g, a in gaps if g > 4 * FPS]
    if len(over) > 1:
        print("     all gaps over 4 s: " + ", ".join(f"{g / FPS:.1f} s at {a / FPS:.1f} s" for g, a in sorted(over, key=lambda x: x[1])))
    if "-v" in sys.argv:
        for t, n in ev:
            print(f"   {t / FPS:6.2f}s  {n}")


if __name__ == "__main__":
    main()
