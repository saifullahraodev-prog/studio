"""Character reference-sheet prompts for the editorial storyboard (v2).

Run (from studio/):  python -I videos/2026-11-17-howwe-forks-v3/make_charsheets.py
Writes character-sheets.md. Style block, negatives and character descriptions are read from make_storyboard.py,
so the sheets use exactly the words the scene prompts use. One sheet per person; families are split per member.
"""
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
src = (HERE / "make_storyboard.py").read_text(encoding="utf-8")
ns = {"__file__": str(HERE / "make_storyboard.py")}
exec(src[:src.index("\nS = []")], ns)  # STYLE, NEG, CHARS, LOCS only (nothing is written)
STYLE, NEG, CHARS = ns["STYLE"], ns["NEG"], ns["CHARS"]

# where each character appears (scene numbers in storyboard v2), for the review list
board = (HERE / "storyboard-editorial.md").read_text(encoding="utf-8")
scenes = re.split(r"\n#### Scene (\d+) ", board)
appear = {k: [] for k in CHARS}
for i in range(1, len(scenes), 2):
    n, body = int(scenes[i]), scenes[i + 1]
    for k, v in CHARS.items():
        if v[:60] in body:
            appear[k].append(n)

# (sheet id, bible entry, who on this sheet, what the hands hold, age/build note for consistency)
SHEETS = [
    ("DINER", "DINER", "the woman described", "a fork in the left hand and a table knife in the right", "slim build, average height"),
    ("SH_GRANDMOTHER", "SHANGHAI_FAMILY", "only the grandmother", "a pair of chopsticks and a small rice bowl", "small, slightly stooped"),
    ("SH_FATHER", "SHANGHAI_FAMILY", "only the father", "a small teapot", "medium build"),
    ("SH_GIRL", "SHANGHAI_FAMILY", "only the ten-year-old girl", "a pair of chopsticks", "child proportions, about 1.4 m"),
    ("DELHI_MOTHER", "DELHI_FAMILY", "only the mother", "a folded roti in the right hand", "medium build"),
    ("DELHI_GRANDFATHER", "DELHI_FAMILY", "only the grandfather", "a torn piece of roti in the right hand, left hand empty and relaxed", "thin, upright posture"),
    ("DELHI_SON", "DELHI_FAMILY", "only the teenage son", "a stainless-steel water jug", "lanky teenager"),
    ("BANGKOK_DINER", "BANGKOK_DINER", "the man described", "a spoon in the right hand and a fork in the left", "slim build"),
    ("SONG_COOK", "SONG_COOK", "the cook described", "a heavy rectangular cleaver", "wiry, strong forearms"),
    ("SEOUL_DINER", "SEOUL_DINER", "the woman described", "flat stainless-steel chopsticks and a long-handled steel spoon", "slim build"),
    ("JP_MOTHER", "JAPAN_FAMILY", "only the mother", "a pair of chopsticks and a rice bowl", "slim build"),
    ("JP_FATHER", "JAPAN_FAMILY", "only the father", "a pair of chopsticks", "medium build"),
    ("JP_SON", "JAPAN_FAMILY", "only the eight-year-old son", "a pair of chopsticks", "child proportions, about 1.3 m"),
    ("BYZANTINE_BRIDE", "BYZANTINE_BRIDE", "the noblewoman described", "a slender golden two-pronged fork", "graceful, upright posture"),
    ("DAMIAN", "DAMIAN", "the monk described", "a quill pen and a parchment sheet", "lean, slightly stooped"),
    ("CORYAT", "CORYAT", "the traveller described", "a walking staff in one hand and a small fork in the other", "tall and thin"),
    ("RICHELIEU", "RICHELIEU", "the cardinal described", "a round-tipped table knife", "lean, very upright"),
    ("ANTHROPOLOGIST", "ANTHROPOLOGIST", "the man described (an illustrative figure, not a likeness of any real person)", "a pair of measuring calipers", "medium build"),
    ("ADDIS_GRANDMOTHER", "ADDIS_FAMILY", "only the grandmother", "a small folded piece of injera in the right hand", "small, warm"),
    ("ADDIS_FATHER", "ADDIS_FAMILY", "only the father", "nothing; hands relaxed", "medium build"),
    ("ADDIS_GRANDSON", "ADDIS_FAMILY", "only the ten-year-old grandson", "nothing; hands relaxed", "child proportions, about 1.4 m"),
    ("SIAM_COURTIER", "SIAM_COURT", "one courtier", "a spoon in the right hand and a fork in the left", "slim build"),
    ("MENCIUS", "MENCIUS", "the philosopher described", "nothing; one hand raised in a gentle explaining gesture", "medium build"),
    ("KING_XUAN", "KING_XUAN", "the king described", "nothing; hands folded in his sleeves", "stout"),
]
# outfit variants that must match their base sheet's face
VARIANTS = [
    ("JAPAN_FAMILY_MOURNING", "JP_MOTHER, JP_FATHER, JP_SON",
     "The same three people from the JP_MOTHER, JP_FATHER and JP_SON sheets, now in black mourning clothes (black suit and tie, black dress, black "
     "school uniform for the boy), standing side by side, front view, calm and quiet expressions.", "scene 31 (funeral half)"),
    ("ADDIS_WEDDING_COUPLE", "new",
     "An Ethiopian bride and groom in their twenties in white habesha kemis and gabi with woven coloured tibeb borders, front and three-quarter views; "
     "the bride with braided hair and a simple headpiece, the groom clean-shaven with short hair.", "scene 67 (gursha panel)"),
]

TEMPLATE = ("Character reference sheet (model sheet) for an illustrated documentary. {who_line} Show this one person three times side by side, "
            "full body, standing in a relaxed neutral pose: front view, three-quarter view, side profile. Below them, two small close-ups: "
            "the face with a calm, natural expression, and the hands holding {hands}. Build: {build}. Identical face, hairstyle, skin tone, "
            "proportions and clothing in every view. Plain warm paper-cream background, even soft light, no scenery, no props other than "
            "those named. ")

L = ["# Character reference sheets (storyboard v2)\n",
     "Generate these **before any scene**. Approve one image per sheet, save it as `refs/<SHEET ID>.png` in this folder, and use it as the "
     "character or image reference for every scene that character appears in. That is what keeps 83 generations looking like one documentary.\n",
     "Every prompt uses the same character description as the scene prompts, word for word, plus the channel style block.\n",
     "\n## Review checklist (for each sheet before approving)\n",
     "- Same face in all three views: eyes, nose, jaw and hairline don't drift.",
     "- Clothing matches the description exactly (colours, collar, sleeves, accessories); nothing invented, no costume stereotypes.",
     "- Hands: five fingers each; utensils held the right way (chopsticks between thumb and fingers, not fists); "
     "right versus left hand as written.",
     "- Age reads correctly (grandparents look their age, children look like children).",
     "- Style: charcoal outlines, flat muted colours, paper grain, cream background; not glossy, not 3D, not anime.",
     "- No text, logos or watermarks.",
     "\n## Sheets\n",
     f"{len(SHEETS)} people + {len(VARIANTS)} variants. 'Appears in' lists storyboard v2 scene numbers.\n"]
# family members: their own clause, cut word for word from the bible entry (checked), so one person is drawn, not the family
MEMBERS = {
    "SH_GRANDMOTHER": ("a Shanghai family", "a grandmother in her sixties with short permed grey hair and a navy cardigan"),
    "SH_FATHER": ("a Shanghai family", "a father in his forties with short black hair and a grey sweater"),
    "SH_GIRL": ("a Shanghai family", "a ten-year-old girl with a high ponytail and a blue school tracksuit"),
    "DELHI_MOTHER": ("a Delhi family", "a mother in her forties in a muted-teal cotton salwar kameez with her hair in a low bun"),
    "DELHI_GRANDFATHER": ("a Delhi family", "a grandfather in his seventies with a trimmed white beard in a white kurta and grey sleeveless vest"),
    "DELHI_SON": ("a Delhi family", "a teenage son in a plain sand-coloured T-shirt"),
    "JP_MOTHER": ("a Japanese family", "a mother in her forties with a short bob and a grey knit top"),
    "JP_FATHER": ("a Japanese family", "a father in his forties with thin-rimmed glasses and a navy shirt"),
    "JP_SON": ("a Japanese family", "an eight-year-old son with a bowl haircut and a striped T-shirt"),
    "ADDIS_GRANDMOTHER": ("an Addis Ababa family", "a grandmother in her seventies wearing a white cotton netela shawl with a woven coloured border"),
    "ADDIS_FATHER": ("an Addis Ababa family", "a father in his forties in a dark-blue shirt"),
    "ADDIS_GRANDSON": ("an Addis Ababa family", "a ten-year-old grandson in a sand-coloured sweater"),
    "SIAM_COURTIER": ("Siamese courtiers of the 1860s-1880s", "men with short cropped hair in patterned chong kraben wrap trousers and high-collared white jackets"),
}
for sid, key, who, hands, build in SHEETS:
    desc = CHARS[key]
    if sid in MEMBERS:
        fam, clause = MEMBERS[sid]
        assert clause in desc, (sid, clause)
        who_line = f"The character, one person from {fam}: {clause}." if sid != "SIAM_COURTIER" else f"The character, one of the {fam}: {clause} (draw one man)."
    else:
        who_line = f"The character: {desc}."
    prompt = TEMPLATE.format(who_line=who_line, hands=hands, build=build) + STYLE + " " + NEG
    L.append(f"\n### {sid}\n")
    L.append(f"**Appears in:** scenes {', '.join(map(str, appear[key])) or 'n/a'}  ·  **Save as:** `refs/{sid}.png`\n")
    L.append(f"```\n{prompt}\n```\n")
L.append("\n## Outfit and cast variants\n")
for vid, base, text, used in VARIANTS:
    prompt = ("Character reference sheet (model sheet) for an illustrated documentary. " + text +
              " Identical faces to the reference images. Plain warm paper-cream background, even soft light, no scenery. " + STYLE + " " + NEG)
    L.append(f"\n### {vid}\n")
    L.append(f"**Based on:** {base}  ·  **Used in:** {used}  ·  **Save as:** `refs/{vid}.png`\n")
    L.append(f"```\n{prompt}\n```\n")
(HERE / "character-sheets.md").write_text("\n".join(L), encoding="utf-8")
print(f"{len(SHEETS)} sheets + {len(VARIANTS)} variants -> character-sheets.md")
for sid, key, *_ in SHEETS:
    if not appear[key]:
        print("  ! no scenes found for", sid)
