"""How We Ended Up · Video 1 "Why Half the World Doesn't Use Forks" · FULL SCRIPT v1 (2026-11-16).

Run (from studio/):  python -I videos/2026-11-16-howwe-forks-full/make_script.py
Writes, next to this file:
  script.json    scenes for tools/howwe_build.py (say lines with *emphasis* and word triggers)
  narration.txt  spoken words only, one line per scene (paste into CapCut TTS / read aloud)
  script.md      readable script: chapter, narration, what is on screen
Facts + sources: sources.md (same folder). "STAND-IN" = visual placeholder until the asset is drawn from a reference.
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
scenes, chapters = [], []


def chapter(name):
    chapters.append((len(scenes), name))


def add(t, say, p, inn="dolly", **kw):
    scenes.append({"t": t, "in": inn, "pillar": "eat", "say": say, "p": p, **kw})


def M(say, tag, title, zoom=None, pins=(), routes=(), inn="dolly", **kw):
    p = {"tag": tag, "title": title, "cats": {}, "legend": [], "pins": list(pins), "routes": list(routes)}
    if zoom:
        p["zoomTo"] = zoom
    add("map", say, p, inn, **kw)


def E(say, tag, word, items, inn="dolly", **kw):
    add("exhibits", say, {"tag": tag, "word": word, "items": [
        {"obj": o, "meta": m, "name": n, "sub": s, "on": on} for (o, m, n, s, on) in items]}, inn, **kw)


def C(say, front, heard, back, actual, flipOn, source="", inn="dolly", **kw):
    add("cardFlip", say, {"frontLabel": front, "heard": heard, "backLabel": back, "actual": actual, "source": source, "flipOn": flipOn}, inn, **kw)


def P(say, left, sign, right=None, rsign=None, splitOn=None, marks=(), wash=True, inn="dolly", **kw):
    p = {"left": left, "leftSign": sign, "washIn": wash, "marks": list(marks)}
    if right:
        p.update({"right": right, "rightSign": rsign})
        if splitOn:
            p["splitOn"] = splitOn
    add("period", say, p, inn, **kw)


pin = lambda lonlat, label, on, below=False: {"lonlat": lonlat, "label": label, "on": on, "below": below}
zoom = lambda on, lonlat, z: {"on": on, "lonlat": lonlat, "zoom": z}
VENICE, LONDON, PARIS, FLORENCE = [12.34, 45.44], [-0.13, 51.51], [2.35, 48.86], [11.25, 43.77]
ANYANG, SEOUL, NARA, HANOI = [114.35, 36.1], [126.98, 37.57], [135.8, 34.68], [105.85, 21.03]
DELHI, ADDIS, BANGKOK, GERMANY = [77.2, 28.6], [38.74, 9.03], [100.5, 13.75], [10.4, 51.1]

# ── COLD OPEN ────────────────────────────────────────────────────────────────
chapter("Cold open")
add("map", "Right now, more than a billion people are eating with *chopsticks*. Hundreds of millions are eating with their *hands*. And the *fork*? It's the newcomer.",
    {"tag": "THE MAP", "title": "Three ways to eat", "cats": "@EATING_PLACEHOLDER",
     "legend": [{"cat": "a", "label": "FORK", "on": "fork"}, {"cat": "b", "label": "CHOPSTICKS", "on": "chopsticks"}, {"cat": "c", "label": "HANDS", "on": "hands"}],
     "zoomTo": [zoom("chopsticks", [112, 30], 1.55), zoom("hands", [45, 12], 1.4), zoom("fork", [0, 22], 1.12)]}, "cut")
add("titleWall", "So how did the world end up eating *three* different ways?", {"question": "Why half the world doesn't use forks"})

# ── CHAPTER 1 · THE QUESTION ────────────────────────────────────────────────
chapter("1 · The question")
E("Here's the thing. None of these is the *natural* way to eat. The fork. Chopsticks. The hand.", "THE QUESTION", "Three solutions.",
  [("fork", "EXHIBIT 01 · FORK", "The Fork", "Europe", "fork"), ("chopsticks", "EXHIBIT 02 · CHOPSTICKS", "Chopsticks", "East Asia", "Chopsticks"),
   ("hand", "EXHIBIT 03 · HANDS", "The Hand", "South Asia, Middle East, Africa", "hand")])
C("Each one is an *answer*. And every answer starts with a *problem*.", "WHAT THEY ARE", "Three habits.", "WHAT THEY REALLY ARE", "Three answers to one problem.", "every")

# ── CHAPTER 2 · THE FORK ────────────────────────────────────────────────────
chapter("2 · The newcomer: the fork")
M("Let's start with the newcomer. Our story begins in *Venice*, in the eleventh century.", "PART ONE", "The fork",
  zoom=[zoom("Venice", VENICE, 2.1)], pins=[pin(VENICE, "Venice", "Venice")])
E("A *Byzantine* bride sits down at her *wedding* feast, and picks up her food with a little *golden* fork.", "VENICE · 11TH CENTURY", "A wedding feast.",
  [("fork2", "EXHIBIT 04 · VENICE, 11TH C.", "A golden fork", "two prongs", "golden")], "cut")
C("A churchman was *horrified*. God, he said, had already given us forks: our *fingers*. And Europe agreed with him, for *centuries*.",
  "A VENETIAN CLERGYMAN, 11TH C.", "“God has provided man with natural forks: his fingers.”",
  "WHAT HAPPENED NEXT", "Most of Europe ignored the fork for centuries.", "Europe", "National Geographic")
M("Except Italy. By the fourteenth century, forks were becoming *common* at Italian tables.", "ITALY", "The fork stays",
  zoom=[zoom("Italy", [12, 43], 2.2)], pins=[pin(VENICE, "Venice", "Except"), pin(FLORENCE, "Florence", "common", True)])
E("One popular explanation? *Pasta*. Try eating long noodles with a knife.", "A POPULAR EXPLANATION", "Pasta.",
  [("pasta", "EXHIBIT 05 · ITALY", "Long pasta", "a popular explanation", "Pasta")])
P("Elsewhere, even *five hundred* years later, most Europeans still ate with a *knife*, and their *fingers*.", "europe1500", "PERIOD ROOM · EUROPE · c. 1500",
  marks=[{"on": "fingers", "kind": "circle", "x": 973, "y": 548, "w": 130, "h": 110}], inn="door")
M("Then, in *1608*, an English traveller named Thomas Coryat saw Italians eating with forks, and brought one *home*.", "1608", "The fork goes to England",
  zoom=[zoom("Thomas", [6, 49], 2.0), zoom("home", [6, 49], 2.0)],
  pins=[pin(VENICE, "Venice", "Italians", True), pin(LONDON, "London", "home")], routes=[{"from": VENICE, "to": LONDON, "on": "brought"}], hold=0.3)
C("His friends gave him a nickname: *Furcifer*. Latin for fork-bearer. And also, for *rascal*.", "HIS FRIENDS CALLED HIM", "“Furcifer”",
  "LATIN FOR", "Fork-bearer. And also: rascal.", "Latin", "Coryat's Crudities (1611)")
M("In *France*, the fork reached the royal court in the early *sixteen hundreds*. And that's when the *knife* changed too.", "FRANCE", "The knife changes",
  zoom=[zoom("France", PARIS, 2.2)], pins=[pin(PARIS, "Paris", "France")])
E("Look at the knife on your table. Its tip is probably *round*.", "YOUR TABLE", "Look closer.",
  [("knife", "EXHIBIT 06 · BEFORE", "Pointed knife", "for spearing food", "knife"), ("knifeRound", "EXHIBIT 07 · AFTER", "Round-tipped knife", "for your table", "round")])
C("The story goes that Cardinal *Richelieu* was so *annoyed* by guests picking their teeth with knife points, that he had his knives ground *round*.",
  "THE STORY GOES", "Guests picked their teeth with knife points.", "SO, THE STORY GOES", "Richelieu had his knives ground round.", "ground", "Wikipedia: Table knife (a tradition)")
E("And in *1669*, King *Louis* the Fourteenth reportedly banned pointed table knives *altogether*.", "FRANCE · 1669", "Banned.",
  [("knife", "FRANCE · 1669", "Pointed table knife", "reportedly banned", "banned")])
E("With no point on the knife, the fork had to do the *spearing*.", "THE JOB MOVES", "The fork takes over.",
  [("knifeRound", "THE KNIFE", "Cuts", "no point", "knife"), ("fork2", "THE FORK", "Spears", "two prongs", "spearing")])
E("So it grew more *teeth*. Two prongs. Then three. And by the eighteenth century, in Germany, *four*.",
  "THE FORK EVOLVES", "More teeth.",
  [("fork2", "TWO PRONGS", "Two", "medieval", "Two"), ("fork3", "THREE PRONGS", "Three", "early 1700s", "three"), ("fork", "FOUR PRONGS", "Four", "Germany, 1700s", "four")])
add("today", "That's the *fork* you used today. In its modern shape, it's only about *two hundred and fifty* years old.", {})

# ── CHAPTER 3 · CHOPSTICKS ──────────────────────────────────────────────────
chapter("3 · The elder: chopsticks")
M("Now let's go east. Because in *China*, the story runs the other way.", "PART TWO", "Chopsticks", zoom=[zoom("China", ANYANG, 1.9)], pins=[pin(ANYANG, "Anyang", "China")])
E("The oldest chopsticks ever found are over *three thousand* years old. And they weren't for eating. They were *cooking* tools.", "ANYANG, CHINA", "c. 1200 BC",
  [("chopsticks", "EXHIBIT 08 · SHANG PERIOD", "Bronze chopsticks", "c. 1200 BC · Yinxu", "oldest")])
P("Chinese cooks did the cutting in the *kitchen*. By the time food reached the table, it was already bite-sized.", "europe1500", "EUROPE · c. 1500", "china1500", "CHINA · c. 1500",
  splitOn="Chinese", marks=[{"on": "kitchen", "kind": "circle", "x": 1760, "y": 690, "w": 260, "h": 220}], wash=False)
C("You may have heard that Confucius *banned* knives from the table. There's a famous line: a gentleman keeps away from the *kitchen*.",
  "THE STORY YOU HEARD", "Confucius banned knives from the table.", "THE FAMOUS LINE", "“A gentleman keeps away from the kitchen.”", "famous")
C("But it comes from *Mencius*, not Confucius. And he meant a gentleman shouldn't watch animals *die*.",
  "WHO SAID IT?", "Confucius?", "CORRECTION", "Mencius. And it's about compassion.", "Mencius", "Mengzi 1A7; Stanford Encyclopedia of Philosophy")
E("One popular theory is more practical: *firewood*. Small pieces cook *faster*, and save fuel.", "A POPULAR THEORY", "Firewood.",
  [("cleaver", "THE KITCHEN", "Cleaver", "cut small first", "pieces"), ("bowl", "THE TABLE", "Bowl", "already bite-sized", "faster")])
M("Over the centuries, chopsticks spread with Chinese food and culture: to *Korea*, *Japan*, and *Vietnam*.", "SPREAD", "One tool, many tables",
  zoom=[zoom("spread", [120, 33], 1.9)],
  pins=[pin(ANYANG, "China", "spread"), pin(SEOUL, "Korea", "Korea"), pin(NARA, "Japan", "Japan"), pin(HANOI, "Vietnam", "Vietnam", True)],
  routes=[{"from": ANYANG, "to": SEOUL, "on": "Korea"}, {"from": ANYANG, "to": NARA, "on": "Japan"}, {"from": ANYANG, "to": HANOI, "on": "Vietnam"}])
E("And each place made them its own. In Korea, they're often *metal*, and they come with a *spoon*.", "KOREA", "Metal and a spoon.",
  [("chopsticks", "EXHIBIT 09 · KOREA", "Metal chopsticks", "STAND-IN drawing", "metal"), ("spoon", "EXHIBIT 10 · KOREA", "Spoon", "served together", "spoon")])

# ── CHAPTER 4 · HANDS ───────────────────────────────────────────────────────
chapter("4 · The oldest tool: the hand")
M("And then there's the oldest tool of all.", "PART THREE", "The hand", zoom=[zoom("oldest", [55, 15], 1.5)],
  pins=[pin(DELHI, "India", "oldest"), pin(ADDIS, "Ethiopia", "tool", True)])
E("Eating with your hands isn't the absence of a tool. It's a tradition, with *rules*.", "NOT A MISSING TOOL", "A tradition.",
  [("hand", "EXHIBIT 11 · THE HAND", "The Hand", "a tradition with rules", "hands")])
C("Across much of South *Asia*, the Middle *East* and *Africa*, the rule is simple. Eat with your *right* hand.", "THE FIRST RULE", "Which hand?", "THE ANSWER", "Your right hand.", "simple")
E("And often, the bread *is* the utensil. In Ethiopia, injera is the plate, and the *spoon*.", "ETHIOPIA", "Bread as a spoon.",
  [("flatbread", "EXHIBIT 12 · ETHIOPIA", "Injera", "STAND-IN drawing", "bread"), ("hand", "THE HAND", "Tear and scoop", "right hand only", "spoon")])
M("And here's a twist. *Thailand* used to eat with hands too.", "A TWIST", "Thailand", zoom=[zoom("Thailand", BANGKOK, 2.2)], pins=[pin(BANGKOK, "Bangkok", "Thailand")])
E("Then, in the *eighteen hundreds*, the royal court of *Siam* adopted Western *spoons* and *forks*.",
  "SIAM, 1800s", "A royal choice.",
  [("spoon", "EXHIBIT 13 · SIAM", "Spoon", "in the right hand", "spoons"), ("fork", "EXHIBIT 14 · SIAM", "Fork", "pushes food onto the spoon", "forks")])
C("That's why Thai food usually comes with a spoon and fork. Not *chopsticks*.", "A THAI TABLE TODAY", "Chopsticks?", "USUALLY", "A spoon and a fork.", "Not")

# ── CHAPTER 5 · THE STORY YOU HEARD + REVEAL ────────────────────────────────
chapter("5 · The story you heard")
C("So, is the fork the most *civilised* way to eat? Europeans didn't think so, for *six hundred* years. Every one of these traditions has its own *manners*.",
  "THE STORY YOU HEARD", "Forks are the civilised way to eat.", "CORRECTION", "Every tradition has its own manners.", "Europeans")
add("reveal", "So what really split the world *three* ways? It comes down to one simple question. Who does the *cutting*?",
    {"tag": "THE ANSWER", "line": "Who does the cutting?", "left": "fork", "right": "hand",
     "answer": {"meta": "THE REAL QUESTION", "name": "Who cuts?", "sub": "table, kitchen, or bread"}, "downOn": "really", "answerOn": "cutting"}, hold=0.15)
E("Cut at the table, and you need a knife and fork. Cut in the kitchen, and chopsticks are enough. Cook with flatbread, and your hand does the rest.",
  "THE ANSWER", "Who cuts?",
  [("fork", "CUT AT THE TABLE", "Knife and fork", "Europe", "table"), ("chopsticks", "CUT IN THE KITCHEN", "Chopsticks", "East Asia", "kitchen"),
   ("hand", "BREAD DOES THE WORK", "The hand", "South Asia, Africa", "flatbread")])

# ── CHAPTER 6 · BACK TO YOUR TABLE ──────────────────────────────────────────
chapter("6 · Back to your table")
add("today", "So next time you sit down to eat, look at your table.", {})
E("The round-tipped knife? Blame a cardinal, and a king. The four-pronged fork? Eighteenth-century Germany.", "YOUR TABLE", "Where it came from.",
  [("knifeRound", "FRANCE, 1600s", "Round-tipped knife", "a cardinal and a king", "knife"), ("fork", "GERMANY, 1700s", "Four prongs", "about 250 years old", "fork")])
add("titleWall", "And next time: why is *Korean* food spicy, when *Japanese* food isn't?", {"question": "Next: why Korean food is spicy, and Japanese food isn't"},
    rehook="Next: Korea vs Japan, the chili mystery", hold=1.0)

# ── write outputs ────────────────────────────────────────────────────────────
note = ("How We Ended Up · video 1 'Why Half the World Doesn't Use Forks' · FULL SCRIPT v1, fact-checked 2026-11-16 "
        "(sources.md). Map country colours = simplified placeholder data. STAND-IN = placeholder drawing. Voice = placeholder TTS.")
(HERE / "script.json").write_text(json.dumps({"note": note, "scenes": scenes}, ensure_ascii=False, indent=1), encoding="utf-8")
plain = lambda s: s.replace("*", "")
(HERE / "narration.txt").write_text("\n\n".join(plain(s["say"]) for s in scenes) + "\n", encoding="utf-8")
md = ["# Why Half the World Doesn't Use Forks: full script v1", "",
      "Generated by `make_script.py`. Sources: `sources.md`. **Bold** = emphasised word (keyword pop). Visual = template + what appears.", ""]
ci = dict(chapters)
for i, s in enumerate(scenes):
    if i in ci:
        md += [f"## {ci[i]}", ""]
    vis = s["t"]
    p = s["p"]
    if s["t"] == "exhibits":
        vis += ": " + ", ".join(f"{it['name']} (on \"{it['on']}\")" for it in p["items"])
    elif s["t"] == "map":
        vis += f": {p.get('title')}" + (" · pins " + ", ".join(x["label"] for x in p.get("pins", [])) if p.get("pins") else "")
    elif s["t"] == "cardFlip":
        vis += f": \"{p['heard']}\" → \"{p['actual']}\""
    elif s["t"] == "period":
        vis += f": {p['left']}" + (f" | {p['right']}" if p.get("right") else "")
    elif s["t"] == "reveal":
        vis += f": lights down, answer \"{p['answer']['name']}\""
    say = re.sub(r"\*([^*]+)\*", r"**\1**", s["say"])
    md += [f"{i + 1}. {say}  \n   *Visual: {vis}*", ""]
words = sum(len(plain(s["say"]).split()) for s in scenes)
md += ["---", f"{len(scenes)} scenes · {words} words · about {words / 150:.1f} min at a natural reading pace."]
(HERE / "script.md").write_text("\n".join(md) + "\n", encoding="utf-8")
print(f"{len(scenes)} scenes, {words} words -> script.json, narration.txt, script.md")
