"""Video 1 v3 · scene list for the APPROVED narration (narration.txt, owner-approved 2026-11-17).

Run (from studio/):  python -I videos/2026-11-17-howwe-forks-v3/make_scenes.py
Writes script.json next to this file and VERIFIES that the scenes' spoken words equal narration.txt word for word
(the build fails loudly if a scene drifts from the approved text). *stars* = emphasis (keyword pop).
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
S = []
PART = [1]


def part(n):
    PART[0] = n


def add(t, say, p=None, inn="dolly", **kw):
    S.append({"t": t, "in": inn, "pillar": "eat", "part": PART[0], "say": say, "p": p or {}, **kw})


def M(say, tag, title, z=None, pins=(), routes=(), inn="dolly", **kw):
    p = {"tag": tag, "title": title, "cats": {}, "legend": [], "pins": list(pins), "routes": list(routes)}
    if z:
        p["zoomTo"] = z
    add("map", say, p, inn, **kw)


def E(say, tag, word, items, inn="dolly", **kw):
    add("exhibits", say, {"tag": tag, "word": word, "items": [{"obj": o, "meta": m, "name": n, "sub": s, "on": on} for (o, m, n, s, on) in items]}, inn, **kw)


def C(say, front, heard, back, actual, flipOn, source="", inn="dolly", **kw):
    add("cardFlip", say, {"frontLabel": front, "heard": heard, "backLabel": back, "actual": actual, "source": source, "flipOn": flipOn}, inn, **kw)


def P(say, left, sign, right=None, rsign=None, splitOn=None, marks=(), wash=False, inn="dolly", **kw):
    p = {"left": left, "leftSign": sign, "washIn": wash, "marks": list(marks)}
    if right:
        p.update({"right": right, "rightSign": rsign})
        if splitOn:
            p["splitOn"] = splitOn
    add("period", say, p, inn, **kw)


pin = lambda ll, label, on, below=False: {"lonlat": ll, "label": label, "on": on, "below": below}
zm = lambda on, ll, z, stay=False: {"on": on, "lonlat": ll, "zoom": z, **({"stay": True} if stay else {})}
SHANGHAI, DELHI, BANGKOK, ROME = [121.47, 31.23], [77.2, 28.6], [100.5, 13.75], [12.5, 41.9]
ANYANG, BEIJING, SEOUL, NARA, HANOI = [114.35, 36.1], [116.4, 39.9], [126.98, 37.57], [135.8, 34.68], [105.85, 21.03]
VENICE, CONST, FLORENCE, ODCOMBE, LONDON, PARIS = [12.34, 45.44], [28.98, 41.01], [11.25, 43.77], [-2.70, 50.94], [-0.13, 51.51], [2.35, 48.86]
ADDIS, MEXICO = [38.74, 9.03], [-99.1, 19.4]
EU_HAND = {"kind": "circle", "x": 751, "y": 657, "w": 120, "h": 110}

# ── cold open ──
add("today", "The plate arrives. Without thinking, your hands do something they've done *thousands* of times.", inn="cut")
E("Fork in the left. Knife in the right. Cut, lift, *eat*.", "YOUR TABLE", "Fork and knife.",
  [("fork", "LEFT HAND", "Fork", "holds", "Fork"), ("knifeRound", "RIGHT HAND", "Knife", "cuts", "Knife")])
M("Now picture the same moment in *Shanghai*.", "SHANGHAI", "Same moment", [zm("Now", SHANGHAI, 1.8, True)], [pin(SHANGHAI, "Shanghai", "Shanghai")])
E("A knife usually isn't part of the meal. Nobody *misses* it.", "SHANGHAI · TODAY", "No knife needed.",
  [("chopsticks", "SHANGHAI", "Chopsticks", "no knife", "knife"), ("bowl", "SHANGHAI", "Bowl", "bite-sized food", "meal")], inn="cut")
P("At a family meal in many *Indian* homes, the *right* hand does all the work.", "india", "INDIA · A FAMILY MEAL", inn="door",
  marks=[{"on": "right", "kind": "circle", "x": 753, "y": 620, "w": 120, "h": 110}])
E("And in *Bangkok*, you usually get a *spoon* and a fork. But no knife, and often no chopsticks either.", "BANGKOK", "Spoon and fork.",
  [("spoon", "BANGKOK", "Spoon", "right hand", "spoon"), ("fork", "BANGKOK", "Fork", "left hand", "fork")], inn="door")
E("Same hunger. Same food on the plate. Completely different *tools*.", "THE QUESTION", "Three answers.",
  [("fork", "EUROPE", "Fork", "and knife", "hunger"), ("chopsticks", "EAST ASIA", "Chopsticks", "no knife", "food"), ("hand", "SOUTH ASIA · AFRICA", "The hand", "and bread", "Completely")])
add("titleWall", "So if eating is the most *universal* thing humans do, why did we never agree on how to do it?", {"question": "Why half the world doesn't use forks"})
E("The answer starts with a problem every cook in history has faced. And it ends somewhere you'd never expect. Inside your own *mouth*.", "COMING UP", "A mystery.",
  [("cleaver", "THE PROBLEM", "Every cook's problem", "coming up", "cook"), ("mouth", "THE ENDING", "Inside your mouth", "coming up", "Inside")], pauseAfter={"mouth": 0.6})

# ── hands first ──
E("For most of human history, the answer was simple. Your *hands*.", "THE BEGINNING", "Your hands.", [("hand", "EXHIBIT 01", "The hand", "the first tool", "hands")],
  pauseAfter={"simple": 0.25, "hands": 0.25})
M("Even in ancient *Rome*, a wealthy diner mostly ate with his fingers.", "ANCIENT ROME", "Fingers first", [zm("Even", ROME, 2.3, True)], [pin(ROME, "Rome", "Rome")])
E("There were *spoons* for soup and eggs. There were forks too, but they stayed in the *kitchen*, for hauling meat out of a pot.",
  "ANCIENT ROME", "Kitchen, not table.", [("spoon", "ROME · TABLE", "Spoon", "soup and eggs", "spoons"), ("fork2", "ROME · KITCHEN", "Kitchen fork", "STAND-IN drawing", "forks")])
E("But hands have a limit. A roasted leg of lamb doesn't arrive in *bite-sized* pieces. Somebody has to *cut* it.", "THE LIMIT", "Somebody has to cut.",
  [("hand", "THE LIMIT", "Hands", "can't cut", "hands"), ("plate", "THE PROBLEM", "A roast", "too big to bite", "lamb"), ("knife", "THE SOLUTION", "A blade", "somebody cuts", "cut")])
P("And that's where the world *splits*. Because the real question isn't what you eat with. It's where the *cutting* happens.",
  "europe1500", "EUROPE · CUT AT THE TABLE", "china1500", "CHINA · CUT IN THE KITCHEN", splitOn="splits")

part(2)
# ── China: the kitchen (rewritten 2026-11-18 for the edited narration: one picture per line) ──
CHINA = [112, 33]
M("Let's start in *China*, where the answer was: in the *kitchen*.", "PART ONE", "China", [zm("China", CHINA, 1.8, True)], [pin(ANYANG, "China", "China")])
P("Chinese cooks cut almost everything before it ever reached a *diner*.", "china1500", "CHINA · THE KITCHEN", inn="door", wash=True)
E("Thin strips of meat. Diced vegetables. All of it, chopped with a single heavy *cleaver*.", "THE KITCHEN", "One cleaver.",
  [("plate", "STEP 1", "Thin strips", "of meat", "strips"), ("bowl", "STEP 2", "Diced", "vegetables", "Diced"), ("cleaver", "ONE TOOL", "Cleaver", "for everything", "cleaver")], inn="cut")
P("Why? One popular explanation is *fuel*. Firewood was precious, and small pieces cook *fast*.", "china1500", "CHINA · A POPULAR EXPLANATION", inn="cut",
  marks=[{"on": "Firewood", "kind": "circle", "x": 1280, "y": 600, "w": 240, "h": 200}])
P("But that changes the whole meal. If the food arrives already *bite-sized*, you don't need a knife at dinner at all.",
  "europe1500", "EUROPE · CUT AT THE TABLE", "china1500", "CHINA · ALREADY CUT", splitOn="changes", marks=[{"on": "bite-sized", "kind": "circle", "x": 1760, "y": 690, "w": 260, "h": 220}])
C("Bringing one out could seem a little *rude*, as if the cook hadn't finished the job.", "AT A CHINESE TABLE", "A knife?", "WHY NOT", "The cook already did the cutting.", "as", inn="cut")
E("So what do you eat with instead? Surprisingly, for a long time, the answer was a *spoon*.", "EARLY CHINA", "A surprise.",
  [("chopsticks", "YOUR GUESS", "Chopsticks?", "not yet", "instead"), ("spoon", "ACTUALLY", "Spoon", "for a long time", "spoon")], pauseAfter={"spoon": 0.5})
E("Chopsticks are ancient. Archaeologists have found bone sticks in China that are *thousands* of years old, though nobody can be sure what they were used for.",
  "ARCHAEOLOGY", "Bone sticks.", [("chopsticksBone", "CHINA · ANCIENT", "Bone sticks", "use uncertain", "bone")])
E("And for a long time, chopsticks were the *helpers*. They fished vegetables out of soup and turned food over the fire.", "THE HELPERS", "Helpers.",
  [("bowl", "JOB 1", "Fishing in soup", "for vegetables", "soup"), ("chopsticks", "JOB 2", "Turning food", "over the fire", "fire")])
E("The grain itself, a millet porridge, was eaten with a *spoon*.", "THE MAIN MEAL", "Porridge.",
  [("bowl", "THE GRAIN", "Millet porridge", "every day", "porridge"), ("spoon", "THE TOOL", "Spoon", "for porridge", "spoon")], inn="cut", pauseAfter={"spoon": 0.5})
E("Then, slowly, the menu changed. Wheat became more important, and with it came *noodles* and dumplings.", "THE MENU CHANGES", "Wheat.",
  [("bread", "WHEAT", "Wheat", "more important", "Wheat"), ("pasta", "NEW FOOD", "Noodles", "and dumplings", "noodles")])
E("Try lifting a noodle with a *spoon*. Gradually, chopsticks moved to the *centre* of the meal.", "THE SWITCH", "Chopsticks win.",
  [("spoon", "THE SPOON", "Noodles slip off", "try it", "spoon"), ("chopsticks", "THE NEW MAIN TOOL", "Chopsticks", "centre of the meal", "Gradually")], inn="cut")
M("From China, they travelled to *Korea*, *Japan* and *Vietnam*. And each place made them its own.", "SPREAD", "One tool, many tables", [zm("From", [118, 30], 1.45, True)],
  [pin(ANYANG, "China", "From"), pin(SEOUL, "Korea", "Korea"), pin(NARA, "Japan", "Japan"), pin(HANOI, "Vietnam", "Vietnam", True)],
  [{"from": ANYANG, "to": SEOUL, "on": "Korea"}, {"from": ANYANG, "to": NARA, "on": "Japan"}, {"from": ANYANG, "to": HANOI, "on": "Vietnam"}])
E("In Korea, they're often *metal*, and they still come with a *spoon*.", "KOREA", "Metal and a spoon.",
  [("chopsticksMetal", "KOREA", "Metal chopsticks", "often steel", "metal"), ("spoon", "KOREA", "Spoon", "served together", "spoon")])
E("Legend says royalty ate with *silver* chopsticks, because silver would turn black near *poison*.", "A LEGEND", "Silver.",
  [("chopsticksSilver", "ROYAL TABLE · LEGEND", "Silver chopsticks", "said to detect poison", "Legend")], inn="cut")
C("Silver really can darken when it meets certain *sulphur* compounds. But that doesn't make it a reliable poison detector.", "THE LEGEND", "Silver detects poison.",
  "THE CHEMISTRY", "Silver darkens with some sulphur. It's no reliable poison detector.", "But", "Smithsonian Magazine")
E("And at the royal table, silver was also a display of *status*.", "THE ROYAL TABLE", "Status.",
  [("chopsticksSilver", "KOREA · ROYAL", "Silver", "a display of status", "royal")], inn="cut")
P("In Japan, chopsticks come with *rules*. Never stand them *upright* in a bowl of rice. That's how rice is offered to the *dead*.", "japan", "JAPAN · A FAMILY MEAL", inn="door",
  marks=[{"on": "upright", "kind": "circle", "x": 1290, "y": 600, "w": 150, "h": 190}])
P("And never pass food from one pair of chopsticks to *another*. At Japanese funerals, that's how family members pass the *bones* after a cremation.", "japan", "JAPAN · A FAMILY MEAL", inn="cut",
  marks=[{"on": "another", "kind": "underline", "x": 810, "y": 690, "w": 280}])
P("So in East Asia, the cutting moved into the *kitchen*. In Europe, it stayed right there at the *table*.", "europe1500", "EUROPE · AT THE TABLE", "china1500", "EAST ASIA · IN THE KITCHEN", splitOn="East")

part(3)
# ── Europe: the table (rewritten 2026-11-18: one picture per line, holds after end-of-line reveals) ──
P("European meat was often roasted in large pieces, and at a feast, the *carving* happened in front of the diners.", "europe1500", "PART TWO · EUROPE", inn="door", wash=True)
E("So diners needed a *blade*. But in the Middle Ages, your host usually didn't give you one. You brought your *own*.", "THE MIDDLE AGES", "Bring your own.",
  [("knifePointed", "AT A FEAST", "A blade", "everyone needed one", "blade"), ("hand", "THE GUEST", "Your own", "hosts didn't provide one", "brought")])
E("Many diners carried a knife on their belt, for cutting dinner, and, if necessary, for *fighting*.", "THE MIDDLE AGES", "One knife, two jobs.",
  [("knifePointed", "AT THE TABLE", "Eating knife", "for dinner", "cutting"), ("knifePointed", "ON THE ROAD", "The same knife", "for self-defence", "fighting")], inn="cut", pauseAfter={"fighting": 0.3})
P("Picture it. A long table, a roast in the middle, and guests with *blades* on their belts.", "europe1500", "EUROPE · A FEAST", inn="cut",
  marks=[{**EU_HAND, "on": "blades"}], pauseAfter={"belts": 0.4})
M("Now picture *Venice*, around a thousand years ago.", "VENICE", "About 1,000 years ago", [zm("picture", VENICE, 2.6, True)], [pin(VENICE, "Venice", "Venice")])
M("Into the family of its ruler, the doge, comes a *Byzantine* noblewoman.", "BYZANTIUM TO VENICE", "A noblewoman arrives", [zm("Into", [20, 43], 2.6, True)],
  [pin(VENICE, "Venice", "doge"), pin(CONST, "Constantinople", "Byzantine")], [{"from": CONST, "to": VENICE, "on": "noblewoman"}], inn="cut")
E("In Constantinople, wealthy people already ate with *forks*.", "CONSTANTINOPLE", "Forks already.", [("fork2", "BYZANTIUM", "Table fork", "in wealthy homes", "wealthy")])
E("So at dinner, she has her servants cut her food into little *pieces*, and she lifts them to her mouth with a *golden* instrument with two prongs.", "VENICE · AT DINNER", "Two prongs.",
  [("plate", "HER SERVANTS", "Cut small", "little pieces", "pieces"), ("fork2", "HER TOOL", "A golden fork", "two prongs", "golden")], pauseAfter={"prongs": 0.4})
C("Decades later, a churchman named Peter *Damian* wrote about her, holding up her habits as a warning against sinful luxury. A fork. As a *warning*.",
  "PETER DAMIAN, c. 1070", "She ate with a golden fork.", "HIS VERDICT", "Sinful luxury.", "holding", "Peter Damian's letter, via the Met Museum", pauseAfter={"warning": 0.4})
E("And for centuries, most of Europe kept eating with its *fingers*.", "MEDIEVAL EUROPE", "Fingers.", [("hand", "EUROPE", "Fingers", "for centuries", "centuries")], inn="cut")
M("Except *Italy*. By the fourteenth century, forks were becoming common at wealthier Italian tables.", "ITALY", "The fork stays", [zm("Except", [12, 44], 3.4, True)],
  [pin([12.3, 42.6], "Italy", "Italy")])
E("And one popular explanation will sound familiar. *Pasta*. Try eating long noodles with a knife.", "A POPULAR EXPLANATION", "Pasta.",
  [("pasta", "ITALY", "Long pasta", "a popular explanation", "Pasta"), ("knifePointed", "TRY IT", "A knife", "doesn't work", "Try")], pauseAfter={"knife": 0.4})
M("By the fifteen hundreds, France's *elite* were starting to adopt the fork too. But in *England*, the idea was still strange.", "FRANCE AND ENGLAND", "Yes, and not yet",
  [zm("By", [1, 50], 3.6, True)], [pin(PARIS, "France", "France's", True), pin(LONDON, "England", "England")])
M("Then, in *1608*, an English traveller named Thomas Coryat toured Italy, walking almost *half* of his journey.", "1608", "A long walk", [zm("Then", [5, 48], 3.2, True)],
  [pin(ODCOMBE, "Odcombe", "Thomas"), pin(VENICE, "Venice", "Italy", True)], [{"from": ODCOMBE, "to": VENICE, "on": "toured"}], inn="cut")
M("He watched Italians eating with forks, and he helped make the habit known back *home*.", "1608", "The habit comes home", [zm("He", [5, 48], 3.2, True)],
  [pin(VENICE, "Venice", "Italians", True), pin(LONDON, "England", "home")], [{"from": VENICE, "to": LONDON, "on": "helped"}], inn="cut")
C("His friends gave him a nickname. *Furcifer*. Latin for fork-bearer. And also, for *rascal*.", "HIS FRIENDS CALLED HIM", "“Furcifer”", "LATIN FOR", "Fork-bearer. And also: rascal.", "Latin",
  "Coryat's Crudities (1611)", pauseAfter={"rascal": 0.4})
E("But the fork's real breakthrough was tied to the other tool on the table. The *knife*.", "THE OTHER TOOL", "The knife.",
  [("fork", "THE FORK", "Fork", "waiting", "fork's"), ("knifePointed", "THE OTHER TOOL", "Knife", "sharp and pointed", "other")])
E("Remember those pointed blades? Over time, manners changed. Pointed personal knives became less welcome at dinner, and blunt table knives became more *common*.", "MANNERS CHANGE", "Pointed to blunt.",
  [("knifePointed", "BEFORE", "Pointed", "personal knife", "Remember"), ("knifeRound", "AFTER", "Blunt", "table knife", "blunt")])
C("There's a famous story that Cardinal *Richelieu*, disgusted by a guest picking his teeth with his knife, had the tips of his own table knives ground *round*.",
  "A FAMOUS STORY", "A guest picks his teeth with a knife.", "SO, THE STORY GOES", "Richelieu had his knives ground round.", "had", "A tradition (Wikipedia: Table knife)")
E("And in *1669*, Louis the Fourteenth banned pointed knives in part of his kingdom.", "FRANCE · 1669", "Banned.",
  [("knifePointed", "FRANCE · 1669", "Pointed knife", "banned in part of the kingdom", "Louis")], inn="cut")
E("But a blunt knife can *cut*. It can't *spear*. Something else had to hold the food steady.", "A NEW PROBLEM", "Who holds it?",
  [("knifeRound", "THE KNIFE", "Cuts", "can't spear", "cut"), ("fork2", "THE FORK", "Holds", "the food steady", "Something")], pauseAfter={"steady": 0.3})
E("So the fork became more useful, and it changed shape. Two prongs became *three*. And by the eighteenth century, the four-pronged fork was becoming the familiar shape we recognise *today*.",
  "THE FORK GROWS UP", "More prongs.", [("fork2", "TWO", "Two prongs", "medieval", "Two"), ("fork3", "THREE", "Three prongs", "later", "three"), ("fork", "FOUR", "Four prongs", "by the 1700s", "four-pronged")],
  pauseAfter={"today": 0.4})

part(4)
# ── the strangest consequence: teeth ──
E("And here's where the story gets *strange*. In the nineteen seventies, an American anthropologist named Charles Loring *Brace* was studying human teeth.",
  "THE STRANGEST CONSEQUENCE", "Your teeth.", [("biteOver", "C. L. BRACE", "Human teeth", "1970s research", "teeth")])
E("He noticed that most people today have an *overbite*: the top front teeth sit in front of the bottom ones. But in Europe, skulls older than a few centuries mostly *don't*.",
  "WHAT BRACE NOTICED", "Two bites.", [("biteOver", "MOST PEOPLE TODAY", "Overbite", "top in front", "overbite"), ("biteEdge", "OLDER EUROPEAN SKULLS", "Edge to edge", "mostly", "don't")])
E("His explanation was this. Before knives and forks, people often *clamped* a piece of meat in their front teeth and sliced off a mouthful.", "BRACE'S EXPLANATION", "Clamp and slice.",
  [("biteEdge", "THE GRIP", "Clamp", "front teeth", "clamped"), ("knifePointed", "THE CUT", "Slice", "at the lips", "sliced")])
E("That habit kept the teeth meeting *edge* to edge. Once Europeans began cutting food into small pieces on the *plate*, the front teeth no longer had to grip. Over generations of childhoods, the bite *changed*.",
  "BRACE'S EXPLANATION", "The bite changes.", [("biteEdge", "BEFORE", "Edge to edge", "teeth grip", "edge"), ("fork", "THEN", "Cut on the plate", "knife and fork", "plate"), ("biteOver", "AFTER", "Overbite", "no grip needed", "changed")])
M("And in *China*, Brace said he found the same overbite much earlier, around a thousand years ago, in a culture that had been eating pre-cut food with *chopsticks* for centuries.",
  "CHINA · SONG ERA", "Earlier still", [zm("China", ANYANG, 1.9)], [pin(SHANGHAI, "Song-era jaw", "thousand", True)])
C("It's one researcher's *theory*, and it's still debated. But if he's right, the way your ancestors cut their dinner is still written in your *face*.",
  "A THEORY", "Cutlery changed our bite.", "IF HE'S RIGHT", "Your ancestors' dinners are written in your face.", "if", "C. L. Brace (1977), via Bee Wilson")

part(5)
# ── the hand ──
M("And then there's the third answer, the *oldest* one of all.", "PART THREE", "The hand", [zm("oldest", [55, 15], 1.5)], [pin(DELHI, "India", "oldest"), pin(ADDIS, "Ethiopia", "answer", True)])
E("Eating with your hands isn't the absence of a tool. It's a tradition, with *rules*.", "NOT A MISSING TOOL", "A tradition.", [("hand", "THE HAND", "A tradition", "with rules", "hands")])
P("Across much of South Asia, the Middle East and Africa, the first rule is simple. You eat with your *right* hand.", "india", "INDIA · A FAMILY MEAL", inn="door",
  marks=[{"on": "right", "kind": "circle", "x": 753, "y": 620, "w": 120, "h": 110}])
E("And very often, the bread is the *cutlery*. In India, a piece of flatbread becomes a *scoop*.", "BREAD AS CUTLERY", "The scoop.",
  [("flatbread", "INDIA", "Flatbread", "STAND-IN drawing", "cutlery"), ("hand", "THE HAND", "Scoop", "right hand", "scoop")])
E("In Ethiopia, the spongy bread called *injera* is the plate and the spoon at the same time. You tear, you fold, you *lift*.", "ETHIOPIA", "Plate and spoon.",
  [("flatbread", "ETHIOPIA", "Injera", "STAND-IN drawing", "injera"), ("hand", "THE HAND", "Tear, fold, lift", "right hand", "lift")])
P("There's even a gesture for *love*. In Ethiopia, it's called *gursha*.", "ethiopia", "ETHIOPIA · A FAMILY MEAL", inn="door")
P("You take a mouthful, and you feed it to someone else, with your own *hand*. A guest, an elder, a newly married partner.", "ethiopia", "ETHIOPIA · GURSHA", inn="cut",
  marks=[{"on": "hand", "kind": "circle", "x": 871, "y": 640, "w": 130, "h": 120}])
M("And here's a twist. *Thailand* used to eat with hands too.", "A TWIST", "Thailand", [zm("Thailand", BANGKOK, 2.2)], [pin(BANGKOK, "Bangkok", "Thailand")])
E("Then, in the eighteen hundreds, the royal court of Siam adopted Western *spoons* and *forks*.", "SIAM, 1800s", "A royal choice.",
  [("spoon", "SIAM", "Spoon", "from the West", "spoons"), ("fork", "SIAM", "Fork", "from the West", "forks")])
E("Today, the spoon goes in your *right* hand, and the fork pushes food onto it.", "A THAI TABLE", "How it works.",
  [("spoon", "RIGHT HAND", "Spoon", "eats", "right"), ("fork", "LEFT HAND", "Fork", "pushes", "pushes")])
C("That's why a Thai meal usually comes with a spoon and a fork, and not with *chopsticks*.", "A THAI TABLE", "Chopsticks?", "USUALLY", "A spoon and a fork.", "not")

part(6)
# ── the story you heard ──
C("So where does that leave the stories you've probably *heard*?", "THE STORY YOU HEARD", "Three famous stories.", "LET'S CHECK", "True, exaggerated, or debated?", "heard")
C("Here is the story you heard. *Confucius* banned knives from the dinner table, because knives meant violence. What's true? There is a famous Chinese saying: a gentleman keeps away from the *kitchen*.",
  "THE STORY YOU HEARD", "Confucius banned knives from the table.", "WHAT'S TRUE", "“A gentleman keeps away from the kitchen.”", "What's")
C("What's wrong? It comes from *Mencius*, not Confucius.", "WHO SAID IT?", "Confucius?", "WHAT'S WRONG", "It was Mencius.", "Mencius", "Stanford Encyclopedia of Philosophy")
C("And in context, he's talking about a king who couldn't bear to see an *ox* led to its death. It's about *compassion*, not table manners.", "IN CONTEXT", "A king spares an ox.",
  "IT'S ABOUT", "Compassion. Not table manners.", "compassion", "Mengzi 1A7")
C("Here's another. *Catherine* de' Medici brought the fork from Italy to France. It's a lovely story, and you'll find it everywhere. Historians aren't *convinced*. The evidence for it is thin.",
  "THE STORY YOU HEARD", "Catherine de' Medici brought the fork to France.", "THE EVIDENCE", "Thin. Historians aren't convinced.", "Historians", "National Geographic")
C("And the biggest one of all. That forks are simply the *civilised* way to eat. Europe spent *six centuries* thinking the opposite.", "THE BIGGEST ONE", "Forks are the civilised way to eat.",
  "CORRECTION", "Europe thought the opposite for six centuries.", "Europe")
E("And every tradition in this story, from Japanese *chopsticks* to Ethiopian *gursha*, comes with manners just as strict as any dinner party in *Paris*.", "EVERY TRADITION", "Strict manners.",
  [("chopsticks", "JAPAN", "Chopstick rules", "from funerals", "chopsticks"), ("hand", "ETHIOPIA", "Gursha", "a gesture of love", "gursha"), ("fork", "FRANCE", "Dinner party", "Paris", "Paris")])
add("reveal", "None of these tools is *better*. Each one is a smart answer to a different *problem*.",
    {"tag": "THE ANSWER", "line": "None is better.", "left": "fork", "right": "hand", "answer": {"meta": "THE ANSWER", "name": "Different problems", "sub": "different answers"},
     "downOn": "None", "answerOn": "smart"}, hold=0.3)

# ── back to the plate ──
add("today", "So let's go back to that *plate*.")
E("The round tip on your knife? A *cardinal* and a king, who were tired of armed guests.", "YOUR TABLE", "The round tip.", [("knifeRound", "FRANCE, 1600s", "Round-tipped knife", "a cardinal and a king", "knife")])
E("The four prongs on your fork? Eighteenth-century *Germany*.", "YOUR TABLE", "Four prongs.", [("fork", "GERMANY, 1700s", "Four prongs", "about 250 years old", "fork")], inn="cut")
add("today", "The cutting you're about to do, right there at the table? That's Europe's *answer*, from a time when meat came in big pieces and everyone carried a blade.", inn="cut")
P("In Shanghai, the cutting happened hours ago, in a *kitchen*, to save fuel.", "china1500", "SHANGHAI · THE KITCHEN", inn="door")
P("In Addis Ababa, the *bread* is doing the work.", "ethiopia", "ADDIS ABABA · THE BREAD", inn="cut")
M("And in *Bangkok*, a royal court decided it in the eighteen hundreds.", "BANGKOK", "A royal decision", [zm("Bangkok", BANGKOK, 2.2)], [pin(BANGKOK, "Bangkok", "Bangkok")], inn="cut")
E("Same problem. How do you get food from the plate to your mouth? Three brilliant *answers*.", "THREE ANSWERS", "One problem.",
  [("fork", "AT THE TABLE", "Knife and fork", "Europe", "problem"), ("chopsticks", "IN THE KITCHEN", "Chopsticks", "East Asia", "plate"), ("hand", "IN THE BREAD", "The hand", "South Asia, Africa", "answers")])
E("And one of them may even be shaping your *teeth*.", "AND ONE MORE THING", "Your teeth.", [("biteOver", "YOU", "Your bite", "a theory", "teeth")], inn="cut")
M("And if you're wondering why a *Korean* meal so often comes glowing red with chili, while a *Japanese* meal usually doesn't, that's a story about a plant that crossed the world. And it starts in the *Americas*.",
  "NEXT TIME", "A plant that crossed the world", [zm("Korean", [128, 36], 2.0), zm("Americas", [-40, 20], 1.0)],
  [pin(SEOUL, "Korea", "Korean"), pin(NARA, "Japan", "Japanese", True), pin(MEXICO, "The Americas", "Americas")], [{"from": MEXICO, "to": SEOUL, "on": "Americas"}],
  rehook="Next: Korea vs Japan, the chili mystery", hold=1.2)

# ── write + verify against the approved narration ──
# --part=N: verify and write only that part (script-pN.json). The part's text must equal the narration between
# its first words and the first words of the next part.
plain = lambda s: re.sub(r"\s+", " ", s.replace("*", "")).strip()
approved = plain((HERE / "narration.txt").read_text(encoding="utf-8"))
arg = next((a for a in sys.argv[1:] if a.startswith("--part=")), None)
if arg:
    n = int(arg[7:])
    mine_sc = [x for x in S if x["part"] == n]
    nxt = [x for x in S if x["part"] == n + 1]
    mine = plain(" ".join(x["say"] for x in mine_sc))
    a0 = approved.index(" ".join(mine.split(" ")[:5]))
    nxt_start = " ".join(plain(nxt[0]["say"]).split(" ")[:5]) if nxt else None
    if nxt_start and nxt_start in approved[a0:]:
        a1 = approved.index(nxt_start, a0)
    else:  # next part not rewritten yet: end at this part's last words, and require the next words to start a new sentence
        tail = " ".join(mine.split(" ")[-5:])
        a1 = approved.index(tail, a0) + len(tail) if tail in approved[a0:] else len(approved)
    want = approved[a0:a1].strip()
else:
    mine_sc, mine, want = S, plain(" ".join(x["say"] for x in S)), approved
if mine != want:
    a, b = mine.split(" "), want.split(" ")
    i = next((k for k in range(min(len(a), len(b))) if a[k] != b[k]), min(len(a), len(b)))
    print("MISMATCH at word", i, "\n  scenes:  ", " ".join(a[max(0, i - 8):i + 8]), "\n  approved:", " ".join(b[max(0, i - 8):i + 8]))
    sys.exit(1)
note = "How We Ended Up · video 1 v3 · scenes for the owner-approved narration. Placeholders: map colours, costumes, stand-in drawings."
out = HERE / (f"script-p{n}.json" if arg else "script.json")
out.write_text(json.dumps({"note": note, "voiceScale": 1.15, "scenes": mine_sc}, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"{len(mine_sc)} scenes, {len(want.split())} words, text matches the narration -> {out.name}")
