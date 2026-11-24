"""Editorial storyboard (owner's PREMIUM EDITORIAL DOCUMENTARY brief, 2026-11-24) for video 1 v3.

Run (from studio/):  python -I videos/2026-11-17-howwe-forks-v3/make_storyboard.py
Writes storyboard-editorial.md next to this file. Checks:
  - the scenes' narration joins up to narration.txt word for word (nothing skipped, nothing invented);
  - every {CHARACTER} reference resolves to the character bible (same description in every prompt);
  - timecodes come from the approved final (public/howwe/forks-v3-p1..p6/built.json word timings).
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent

STYLE = ("Premium editorial documentary illustration in the style of a high-end illustrated magazine or museum exhibition plate. "
         "Clean, slightly hand-drawn charcoal outlines (#34332F) of one consistent medium weight; flat muted colours with subtle soft shading "
         "and a fine paper grain; warm paper-cream ground (#F3EFE5) and soft sand (#D7D0C1); controlled accents of muted blue (#718A91) and "
         "terracotta (#A66D51). Natural proportions, believable individual people with restrained expressions, elegant balanced composition, "
         "detailed but uncluttered. 16:9 frame.")
STYLE_DARK = STYLE.replace("warm paper-cream ground (#F3EFE5) and soft sand (#D7D0C1)",
                           "a deep charcoal ground (#34332F) with warm pools of light in paper-cream (#F3EFE5)")
NEG = ("Avoid: photorealism, 3D render, anime, children's cartoon, glossy vector clip-art, saturated or neon colours, any text or lettering, "
       "watermarks, extra fingers, stereotyped costume, mixing unrelated cultures.")
KEEP = ("Preserve the illustration exactly: same line weight, colours, paper grain, faces and costumes; no morphing, no style drift, "
        "no new objects. Motion is slow, smooth and deliberate.")

# ── character bible: one fixed description per recurring character, inserted verbatim into every prompt ──
CHARS = {
    "DINER": "the modern diner, a woman in her early thirties with shoulder-length wavy dark-brown hair, light olive skin, small gold hoop earrings, "
             "a rust-terracotta knit cardigan over a cream top",
    "SHANGHAI_FAMILY": "a Shanghai family: a grandmother in her sixties with short permed grey hair and a navy cardigan, a father in his forties "
                       "with short black hair and a grey sweater, and a ten-year-old girl with a high ponytail and a blue school tracksuit",
    "DELHI_FAMILY": "a Delhi family: a mother in her forties in a muted-teal cotton salwar kameez with her hair in a low bun, a grandfather in his "
                    "seventies with a trimmed white beard in a white kurta and grey sleeveless vest, and a teenage son in a plain sand-coloured T-shirt",
    "BANGKOK_DINER": "a Bangkok office worker in his late twenties with short black hair, a light-blue short-sleeved shirt and a staff lanyard",
    "SONG_COOK": "a Song-dynasty cook in his forties: wiry, short black beard, rust-brown hemp tunic with sleeves tied back, dark cloth head wrap, "
                 "cream apron",
    "SEOUL_DINER": "a Seoul office worker in her thirties with a neat black bob and a charcoal blazer",
    "JAPAN_FAMILY": "a Japanese family: a mother in her forties with a short bob and a grey knit top, a father in his forties with thin-rimmed "
                    "glasses and a navy shirt, and an eight-year-old son with a bowl haircut and a striped T-shirt",
    "BYZANTINE_BRIDE": "the Byzantine noblewoman, in her twenties, dark eyes, hair under a fine cream silk veil held by a pearl-studded band, "
                       "a deep-blue silk tunic with gold-embroidered borders and a pearl collar",
    "DAMIAN": "Peter Damian, an eleventh-century Italian monk in his sixties with tonsured grey hair, a lean thoughtful face and a plain dark "
              "woollen habit",
    "CORYAT": "Thomas Coryat, an English traveller in his early thirties with a long thin face, a pointed brown beard, a tall black hat, "
              "a dark-green doublet, a worn brown cloak, travel-stained boots and a walking staff",
    "RICHELIEU": "Cardinal Richelieu, a lean man in his fifties with a grey moustache and small pointed beard, in a red cardinal's cassock, "
                 "short red cape and red skullcap",
    "ANTHROPOLOGIST": "an American anthropologist of the 1980s (illustrative figure, not a likeness): a man in his fifties with short grey hair, "
                      "reading glasses and rolled-up shirt sleeves",
    "ADDIS_FAMILY": "an Addis Ababa family: a grandmother in her seventies wearing a white cotton netela shawl with a woven coloured border, "
                    "a father in his forties in a dark-blue shirt, and a ten-year-old grandson in a sand-coloured sweater",
    "SIAM_COURT": "Siamese courtiers of the 1860s-1880s: men with short cropped hair in patterned chong kraben wrap trousers and high-collared "
                  "white jackets",
    "MENCIUS": "Mencius, a Warring-States philosopher in his fifties with a long greying beard, a topknot and a dark scholar's robe",
    "KING_XUAN": "King Xuan of Qi, a stout man in his forties in rich layered Warring-States robes with a tall formal cap",
}
LOCS = {
    "Modern apartment": "small round oak table by a tall window, linen napkin, white plate, glass of water, soft afternoon light (scenes 1-2, 84-90)",
    "Shanghai home": "compact modern dining room, round wooden dining table (no turntable: that is mostly a restaurant fixture), shared dishes in the middle, rice bowls, a calendar on the wall",
    "Delhi home": "tiled floor, low table and chairs, stainless-steel thalis and katoris, a steel water jug, ceiling fan",
    "Bangkok shophouse": "open-front shophouse eatery, steel tables, plastic stools, condiment caddy with chilli and fish sauce, street light",
    "Song kitchen": "brick stove with a small fire, iron wok, thick wooden chopping block, hanging bundles of herbs, ceramic jars",
    "Medieval hall": "14th-century hall, long trestle table with white cloth, bread trenchers, a high table, tapestries, a carver's board",
    "Venetian palace": "11th-century Venetian hall with Byzantine-style arches, silk hangings, oil lamps, a view to the lagoon",
    "Addis home": "living room with a traditional woven mesob basket-table (many families also use an ordinary table), injera on a round tray, coffee-ceremony set in a corner",
}

S = []


def sc(tech, narr, vis, comp, chars, env, anim, prompt, aprompt, trans, dark=False, note="", reuse=None):
    S.append(dict(tech=tech, narr=narr, vis=vis, comp=comp, chars=chars, env=env, anim=anim, prompt=prompt, aprompt=aprompt, trans=trans, dark=dark, note=note, reuse=reuse))


EXH, CUL, MAP, CMP, HIS = "Exhibition", "Cultural Scene", "World Map", "Comparison", "Historical Explanation"

# ═════════ OPENING HOOK ═════════
sc(CUL, "The plate arrives.",
   "A white plate of roast chicken, potatoes and green beans is set down in front of the diner.",
   "Eye-level medium shot; the diner seated at right third, plate entering from the left; window light from behind.",
   "{DINER}, relaxed, napkin on lap, glancing down at the plate.", "Modern apartment.",
   "A hand (sleeve only) slides the plate in; the camera eases in slightly.",
   "{DINER} seated at a small round oak table by a tall window in a modern apartment; a hand in a grey sleeve sets down a white plate of roast chicken, "
   "potatoes and green beans; linen napkin, glass of water, soft afternoon light.",
   "The plate slides in from frame left and settles; she glances down; light steam rises from the food; slow 5% push-in.",
   "Match cut: push into the plate.")
sc(CUL, "Without thinking, your hands do something they've done thousands of times. Fork in the left. Knife in the right. Cut, lift, eat.",
   "Close-up of her hands: fork in the left, knife in the right, cutting a piece of chicken and lifting it.",
   "Top-down close-up on the plate; hands enter from the bottom edge; fork and knife form a V.",
   "{DINER}: only her hands and cardigan cuffs visible.", "Modern apartment, table top.",
   "Fork lands on 'left', knife on 'right'; one clean cut, the bite lifts out of frame on 'eat'.",
   "Top-down close-up of a white plate with roast chicken, potatoes and green beans; two hands with terracotta knit cuffs hold a fork in the left hand "
   "and a table knife in the right, mid-cut; oak table edge, linen napkin.",
   "The fork presses down, the knife saws once, a bite-sized piece separates and the fork lifts it out of frame; small crumbs settle.",
   "Whip-pan right along the table edge into the next table.")
sc(CUL, "Now picture the same moment in Shanghai. A knife usually isn't part of the meal. Nobody misses it.",
   "The Shanghai family shares dinner: bite-sized shared dishes in the middle of the table, rice bowls, chopsticks, no knives anywhere.",
   "Three-quarter high angle over the round table; grandmother serving at left, girl reaching with chopsticks at right.",
   "{SHANGHAI_FAMILY}; the grandmother places a piece of fish in the girl's bowl.", "Shanghai home.",
   "Location tag 'SHANGHAI' (edit); the grandmother serves the girl; little else moves.",
   "{SHANGHAI_FAMILY} sharing dinner around a round wooden dining table in a compact modern Shanghai home: shared dishes in the middle (stir-fried "
   "greens, sliced pork, steamed fish, tofu), rice bowls, chopsticks, no knives on the table; warm evening light.",
   "The grandmother lifts a piece of fish into the girl's bowl; gentle steam rises; very slow push-in.",
   "Cut on the girl's lifting chopsticks.",
   note="Removed the lazy Susan: in China it is mostly a restaurant fixture, so in a home it reads as a cliche. Fewer simultaneous actions.")
sc(CUL, "At a family meal in many Indian homes, the right hand does all the work.",
   "The Delhi family eats dal, rice and sabzi from steel thalis with their right hands.",
   "Eye-level medium-wide; grandfather centre, mother left, son right; their right hands clearly in use, left hands resting.",
   "{DELHI_FAMILY}; grandfather mixing rice and dal with his fingertips.", "Delhi home.",
   "Location tag 'DELHI' (edit); hands mix and lift; subtle ceiling-fan movement.",
   "{DELHI_FAMILY} eating lunch at a low table in a Delhi home: stainless-steel thalis with rice, yellow dal, potato sabzi, rotis and pickle; "
   "each eats with the right hand, left hand resting; tiled floor, steel water jug, ceiling fan, morning light.",
   "Right hands gather rice and dal with fingertips and lift; the ceiling fan turns slowly; the son reaches for a roti.",
   "Cut on motion: the lifted hand leads into the next frame.")
sc(CUL, "And in Bangkok, you usually get a spoon and a fork. But no knife, and often no chopsticks either.",
   "The Bangkok diner at a shophouse eats basil-pork rice with a fried egg, spoon in the right hand, fork in the left.",
   "Medium shot from across the steel table; condiment caddy foreground left; street and scooters soft behind.",
   "{BANGKOK_DINER}, mid-bite, relaxed.", "Bangkok shophouse.",
   "Tag 'BANGKOK' (edit); the fork nudges rice onto the spoon; traffic glides past behind.",
   "{BANGKOK_DINER} eating at an open-front Bangkok shophouse: plate of rice with stir-fried holy-basil pork and a crispy fried egg, a spoon in his "
   "right hand and a fork in his left, no knife, no chopsticks; steel table, plastic stool, condiment caddy with chilli flakes and fish sauce, "
   "warm street light.",
   "The fork pushes rice onto the spoon and the spoon lifts; a scooter passes in the soft background; steam drifts.",
   "Pull back into a four-panel grid.")
sc(CMP, "Same hunger. Same food on the plate. Completely different tools.",
   "Four panels side by side: the apartment, Shanghai, Delhi and Bangkok, each at the same moment of lifting a bite.",
   "Four equal vertical panels on cream with thin charcoal gutters; the tool in each panel highlighted with a soft terracotta halo.",
   "{DINER}; {SHANGHAI_FAMILY} (the girl); {DELHI_FAMILY} (the grandfather); {BANGKOK_DINER}.", "All four locations, simplified.",
   "Panels cut in one per phrase (edit); on 'tools' the four tools glow in turn.",
   "Four equal vertical panels: {DINER} lifting a bite with a fork; the ten-year-old Shanghai girl lifting food with chopsticks; the Delhi "
   "grandfather lifting rice with his right hand; {BANGKOK_DINER} lifting rice with a spoon; same moment, same pose, warm cream gutters.",
   "Hold the still image; a soft terracotta halo glows around each tool in turn (overlay added in the edit, not generated motion).",
   "The four panels shrink into map pins.",
   note="Animation simplified: four synchronised character actions are hard to keep consistent; a still grid with an overlay highlight reads faster.")
sc(MAP, "So if eating is the most universal thing humans do, why did we never agree on how to do it?",
   "An elegant world map with four pins (Europe/USA, Shanghai, Delhi, Bangkok) and the title 'Why half the world doesn't use forks'.",
   "Full world map in Equal Earth projection centred on the Old World; title space top centre (title added in edit).",
   "None.", "Cream map with sand land, muted-blue sea.",
   "Pins drop; thin lines link them; title types on in edit.",
   "An elegant illustrated world map, Equal Earth projection, sand-coloured land with thin charcoal coastlines, muted-blue sea with fine hatching, "
   "four small terracotta location pins over London, Shanghai, Delhi and Bangkok, generous empty space at the top for a title.",
   "Pins drop one by one with a soft bounce; thin dotted lines draw between them; slow push-in.",
   "The map dissolves into a parchment-coloured kitchen wall.")
sc(HIS, "The answer starts with a problem every cook in history has faced.",
   "A timeless cook stands before a whole roast on a wooden block, sleeves rolled, deciding where to cut.",
   "Low three-quarter angle; the roast dominates the foreground, cook behind it.",
   "A sturdy cook of no specific era, plain linen shirt, apron, sleeves rolled.", "Plain stone kitchen, single window.",
   "Firelight flickers; the cook's hand hovers over the meat.",
   "A cook in a plain linen shirt and apron with rolled sleeves studies a large roasted joint of meat on a thick wooden block in a simple stone "
   "kitchen; firelight from a hearth; no specific era.",
   "Firelight flickers across the roast; the cook's hand hovers, then taps the joint; slow push-in.",
   "Push into the roast, then cut to a mouth in the same framing.")
sc(EXH, "And it ends somewhere you'd never expect. Inside your own mouth.",
   "A side-profile close-up of a smiling face, lips parted, front teeth just visible, like a plate from an anatomy book.",
   "Extreme close-up, profile facing left, cream background, delicate dotted guide line pointing at the front teeth.",
   "{DINER}, profile close-up.", "Plain cream ground.",
   "Dotted line draws to the teeth on 'mouth'; brief hold.",
   "Extreme close-up profile of {DINER} smiling, lips slightly parted, upper front teeth just visible; a delicate dotted guide line points at the "
   "front teeth, like an anatomy-book plate; plain cream background.",
   "The dotted guide line draws itself toward the teeth; she smiles a little wider; hold.",
   "Hard cut to black-to-cream wipe: the story starts.")

# ═════════ HANDS FIRST ═════════
sc(HIS, "For most of human history, the answer was simple. Your hands.",
   "A prehistoric family shares roasted food around a hearth, eating with their hands.",
   "Wide, low angle across the fire; family in a semicircle; warm glow.",
   "Neolithic family of five in hide and woven-fibre clothing, individual faces and ages.", "Rock shelter, hearth, wooden bowls.",
   "Fire flickers; hands tear and share food.",
   "A Neolithic family of five sitting around a hearth in a rock shelter, sharing roasted meat and flatbread with their hands; hide and woven-fibre "
   "clothing, wooden bowls, warm firelight on individual faces.",
   "Flames flicker; a child is handed a piece of meat; hands tear bread; embers drift upward.",
   "Embers rise and become the oil-lamp glow of a Roman dining room.")
sc(HIS, "Even in ancient Rome, a wealthy diner mostly ate with his fingers. There were spoons for soup and eggs. There were forks too, but they stayed in the kitchen, for hauling meat out of a pot.",
   "One cutaway of a Roman house: left, a wealthy diner reclining and eating with his fingers, a small pointed-handled spoon (cochlear) by an egg; right, through the wall, a cook lifting meat from a cauldron with a large fork.",
   "Dollhouse-style cutaway: dining room left two-thirds, kitchen right third; one camera pan from left to right.",
   "A wealthy Roman man in his forties in a cream tunic, reclining; a kitchen worker in a plain short tunic.", "Roman house: frescoed triclinium; masonry kitchen hearth.",
   "One slow pan from the diner to the kitchen as the narration moves there.",
   "A cutaway view of a Roman house: on the left a wealthy Roman man in a cream tunic reclines on a couch in a frescoed triclinium, eating with his "
   "fingers, a small pointed-handled spoon beside an egg on the low table; on the right, through the wall, a kitchen worker in a plain short tunic "
   "lifts boiled meat out of a bronze cauldron with a large two-pronged iron fork on a masonry hearth; oil-lamp light.",
   "Slow camera pan from the reclining diner on the left to the kitchen on the right; the fork lifts the meat once; steam rises.",
   "The meat swings toward camera and becomes a roast on a board.",
   note="Merged two scenes into one cutaway: same information, one image, one pan. The cochlear egg spoon is museum-verified (Met; National Museums Scotland).")
sc(EXH, "But hands have a limit. A roasted leg of lamb doesn't arrive in bite-sized pieces. Somebody has to cut it.",
   "A roasted leg of lamb on a board; a hand reaches and hesitates; a knife slides into frame.",
   "Clean museum-like table-top composition, lamb centre, slight shadow; hand from left, knife from right.",
   "Hands only.", "Cream tabletop.",
   "Hand approaches, pauses; knife enters on 'cut'.",
   "A roasted leg of lamb on a wooden board on a cream table, beautifully illustrated; a bare hand reaches in from the left and stops just short; "
   "a plain steel knife lies at the right edge; soft shadow.",
   "The hand reaches and hesitates; the knife slides into the frame and stops beside the lamb.",
   "A vertical line draws down the centre and splits the frame.")
sc(CMP, "And that's where the world splits. Because the real question isn't what you eat with. It's where the cutting happens.",
   "Split screen: left, a European table where a carver cuts a roast in front of diners; right, a Chinese kitchen where a cook chops before serving.",
   "Exact 50/50 split with a thin charcoal divider; matching eye-lines; each side has one point of focus (the blade).",
   "Left: a medieval carver in a tunic; diners. Right: {SONG_COOK}.", "Left: Medieval hall. Right: Song kitchen.",
   "The divider draws down on 'splits'; both blades move on 'cutting'.",
   "A split composition with a thin vertical charcoal divider: on the left a medieval European hall where a carver slices a roast at the table "
   "in front of seated diners; on the right {SONG_COOK} chopping meat into small pieces on a wooden block in a Song-dynasty kitchen before serving.",
   "The divider draws from top to bottom; the carver slices on the left while the cook chops on the right, in rhythm.",
   "Push into the right half: China.")

# ═════════ CHINA: THE KITCHEN ═════════
sc(MAP, "Let's start in China, where the answer was: in the kitchen.",
   "Map of East Asia with China gently highlighted in terracotta.",
   "Map zoomed to East Asia; China centre; label space.", "None.", "Map.",
   "China fills with terracotta; camera dives toward it.",
   "An illustrated map of East Asia, sand land and muted-blue sea, China softly filled with terracotta wash, thin charcoal borders, "
   "no labels.",
   "The terracotta fill spreads across China; slow push toward eastern China.",
   "Map dissolves through a paper texture into the kitchen.")
sc(HIS, "Chinese cooks cut almost everything before it ever reached a diner.",
   "The Song-era cook works at a chopping block; a server carries out plates of bite-sized food.",
   "Wide shot of the kitchen; cook left, server walking right toward a doorway to a dining room.",
   "{SONG_COOK}; a young server in a grey tunic.", "Song kitchen.",
   "Cleaver chops; server walks out of frame.",
   "{SONG_COOK} chopping at a thick wooden block in a Song-dynasty kitchen with a brick stove, iron wok and ceramic jars, while a young server in a "
   "grey tunic carries plates of bite-sized food toward a doorway.",
   "The cleaver rises and falls in a steady rhythm; the server walks through the doorway; smoke curls from the stove.",
   "Tilt down onto the chopping block.")
sc(CUL, "Thin strips of meat. Diced vegetables. All of it, chopped with a single heavy cleaver.",
   "Top-down: neat piles of thin pork strips, diced vegetables and the heavy cleaver.",
   "Overhead flat-lay; three groups in a row, cleaver diagonal; cook's hands at top.",
   "{SONG_COOK}: hands and sleeves only.", "Song kitchen block.",
   "Each pile appears with its words; cleaver lands on 'cleaver'.",
   "Overhead view of a wooden chopping block: a neat pile of thin pork strips, a pile of diced vegetables (scallions, mushrooms, ginger), and a heavy "
   "rectangular cleaver lying diagonally; the cook's hands with rust-brown sleeves at the top edge.",
   "Strips slide into a pile, cubes tumble into another, then the cleaver drops onto the board with a small bounce.",
   "Follow the food into the wok.")
sc(HIS, "Why? One popular explanation is fuel. Firewood was precious, and small pieces cook fast.",
   "A small fire of thin sticks under a wok; the small pieces sear in seconds.",
   "Low angle at stove height; the firebox opening glows; wok above.",
   "{SONG_COOK}, tossing the wok.", "Song kitchen stove.",
   "Only a few sticks are fed in; food flips briefly.",
   "Close view of a brick stove: a small fire of a few thin sticks glowing in the firebox, an iron wok above where small pieces of meat and "
   "vegetables sear; {SONG_COOK} tossing them; a small neat stack of firewood.",
   "The cook feeds in one stick; flames rise; the food flips once and is done; smoke wisps.",
   "The wok tips onto a serving plate; cut to the dining room.")
sc(CUL, "But that changes the whole meal. If the food arrives already bite-sized, you don't need a knife at dinner at all.",
   "A Song-era family meal: several small dishes of bite-sized food, chopsticks and spoons, and no knife.",
   "Eye-level medium-wide; low table centre; four diners; empty space where a knife would be (subtly).",
   "A Song-era family: elder in a dark robe, couple in muted silk, a child.", "Song dining room with lattice window.",
   "Dishes are set down; chopsticks pick up pieces.",
   "A Song-dynasty family of four dining at a table by a lattice window: several small dishes of bite-sized stir-fries, rice bowls, chopsticks and "
   "spoons, no knives; elder in a dark robe, couple in muted silk robes, a child.",
   "A server sets down a final dish; chopsticks lift pieces; the child reaches; warm steam.",
   "Stay in the room; slight camera turn to a guest.")
sc(CUL, "Bringing one out could seem a little rude, as if the cook hadn't finished the job.",
   "A guest half-draws a small knife; the host and the cook in the doorway exchange a look.",
   "Medium shot; guest foreground left, host centre, cook framed in the kitchen doorway at back right.",
   "A visiting guest in a travelling robe; the host (the elder); {SONG_COOK} in the doorway.", "Song dining room.",
   "Knife half out; small raised eyebrows; guest slides it back.",
   "In a Song-dynasty dining room, a visiting guest in a travelling robe half-draws a small knife at a table of bite-sized dishes; the elderly host "
   "raises an eyebrow; {SONG_COOK} watches from the kitchen doorway with a faint wounded look; gentle humour.",
   "The guest pulls the knife halfway, notices the looks, and slides it back; the cook folds his arms.",
   "Cut to a museum case.")
sc(EXH, "So what do you eat with instead? Surprisingly, for a long time, the answer was a spoon.",
   "An ancient Chinese bronze spoon on a museum stand, beside a question mark shaped from a pair of chopsticks.",
   "Exhibition composition: spoon centre on a plinth, chopsticks forming a faint question mark behind; label card (edit).",
   "None.", "Cream museum wall, soft spotlight.",
   "Chopsticks appear first (the guess), then fade as the spoon rises into the light.",
   "An ancient Chinese bronze spoon with a long handle displayed on a cream museum plinth under a soft spotlight; behind it, a pair of faint "
   "chopsticks arranged loosely like a question mark; elegant shadow.",
   "The chopsticks fade in, then out; the spoon catches the light as the camera pushes in.",
   "Match cut from the spoon to a bone stick in the soil.")
sc(HIS, "Chopsticks are ancient. Archaeologists have found bone sticks in China that are thousands of years old, though nobody can be sure what they were used for.",
   "An archaeologist brushes soil from a pair of slender bone sticks in an excavation trench.",
   "Overhead three-quarter view into a trench; grid strings; tools; the sticks centre.",
   "A Chinese archaeologist in her forties, sun hat, khaki field shirt, kneeling.", "Excavation trench with string grid, trowel, labels.",
   "Brush strokes reveal the sticks; a small '?' tag appears (edit).",
   "A Chinese archaeologist in a sun hat and khaki field shirt kneels in an excavation trench, gently brushing soil from two slender bone sticks; "
   "string grid, trowel, small numbered tags, layered soil.",
   "The brush sweeps soil away; the bone sticks emerge; a breeze moves the hat brim.",
   "Dissolve back in time: the sticks become chopsticks in an ancient pot.")
sc(HIS, "And for a long time, chopsticks were the helpers. They fished vegetables out of soup and turned food over the fire. The grain itself, a millet porridge, was eaten with a spoon.",
   "One household in early imperial northern China: at the hearth a woman uses long chopsticks to fish greens from a soup pot; on the mat beside her, the family eats millet porridge with spoons.",
   "Medium-wide; hearth left (chopsticks as cooking helpers), family mat right (spoons for the grain): the two tools in two zones.",
   "A woman in a plain wrapped robe with hair in a low knot; her husband in a plain robe; a child.", "Simple earthen house, tripod pot over a fire, mats, ceramic bowls.",
   "Camera drifts from the hearth to the mat; small hand movements only.",
   "Inside a simple earthen house in early imperial northern China: on the left, a woman in a plain wrapped robe with hair in a low knot uses long "
   "wooden chopsticks to fish greens out of a soup pot over a small fire; on the right, her husband and child sit on a mat eating yellow millet "
   "porridge from ceramic bowls with spoons.",
   "Slow drift from the hearth to the mat; the woman lifts a leaf from the soup; the child lifts a spoonful; steam rises.",
   "Timeline wipe: a field of millet sways and becomes wheat.",
   note="Merged two scenes: one image shows both roles at once (chopsticks at the pot, spoons for the grain), which makes the point clearer.")
sc(HIS, "Then, slowly, the menu changed. Wheat became more important, and with it came noodles and dumplings.",
   "A timeline strip: millet field turns to wheat; a cook stretches noodles; another folds dumplings.",
   "Horizontal three-part illustrated timeline on cream; thin terracotta ribbon underneath.",
   "Two Song-era cooks: a woman folding dumplings, a man stretching noodles.", "Fields, then a kitchen counter.",
   "The ribbon draws left to right; each vignette builds in.",
   "A horizontal illustrated timeline on cream paper: on the left a millet field, in the middle a golden wheat field, on the right a Song-dynasty "
   "kitchen counter where a man stretches noodles and a woman folds dumplings; a thin terracotta ribbon runs beneath.",
   "The ribbon draws from left to right; the fields sway; the noodles stretch and the dumplings fold as the ribbon reaches them.",
   "Push into the noodles.")
sc(CUL, "Try lifting a noodle with a spoon. Gradually, chopsticks moved to the centre of the meal.",
   "A diner's spoon fails to hold slippery noodles; chopsticks lift them easily.",
   "Close-up over a bowl of noodle soup; spoon from left, chopsticks from right.",
   "A Song-era diner (hands and sleeves).", "Bowl of noodle soup on a wooden table.",
   "Spoon scoops, noodles slide off; chopsticks lift a long strand.",
   "Close-up of a bowl of noodle soup on a wooden table: a spoon from the left lets noodles slide off its edge, while chopsticks from the right lift "
   "a long noodle cleanly; muted-silk sleeves.",
   "The spoon scoops and the noodles slither back; the chopsticks lift a long strand high; steam.",
   "The noodle strand becomes a route line on the map.")
sc(MAP, "From China, they travelled to Korea, Japan and Vietnam. And each place made them its own.",
   "East Asia map: routes draw from China to Korea, Japan and Vietnam; at each, a small illustration of that country's chopsticks.",
   "Map of East Asia; three insets beside the destinations.", "None.", "Map.",
   "Routes draw on each name; insets pop in.",
   "An illustrated map of East Asia with thin curved route lines from China to Korea, Japan and Vietnam; beside each, a small inset: flat "
   "stainless-steel chopsticks with a spoon (Korea), short tapered lacquered chopsticks on a rest (Japan), long plain wooden chopsticks (Vietnam).",
   "Routes draw one at a time; each inset rises with a gentle bounce.",
   "Push into the Korea inset.")
sc(CUL, "In Korea, they're often metal, and they still come with a spoon.",
   "A Seoul lunch: rice, stew, side dishes, flat stainless chopsticks and a long-handled spoon side by side.",
   "Three-quarter high angle on the tray; diner's hands entering.",
   "{SEOUL_DINER}.", "Small Seoul restaurant, wooden table.",
   "She picks up the spoon and the chopsticks together.",
   "{SEOUL_DINER} at a small Seoul restaurant: rice, a bubbling stew, several banchan side dishes, flat stainless-steel chopsticks and a long-handled "
   "steel spoon laid side by side; wooden table, warm light.",
   "She lifts the spoon for stew, then the chopsticks for a side dish; the stew bubbles.",
   "Pan across centuries to a royal table.")
sc(HIS, "Legend says royalty ate with silver chopsticks, because silver would turn black near poison.",
   "A Joseon royal table set with a silver spoon and silver chopsticks among many dishes; officials kneel at the edges of the room.",
   "Symmetrical medium-wide on the low royal table; the silver utensils at the centre catch the light; officials soft in the background.",
   "Joseon court officials in dark-red danryeong robes with black winged samo caps (court dress), kneeling at the edges.", "Joseon palace room, folding screen with painted peonies, low lacquer tables.",
   "A slow glint runs along the silver chopsticks; nothing else.",
   "A Joseon-dynasty royal dining room: a low lacquered royal table laid with many dishes, a silver spoon and silver chopsticks at the centre "
   "catching the light; a folding screen with painted peonies behind; court officials in dark-red danryeong robes and black winged samo caps "
   "kneeling at the edges; calm candlelight. Generate wide and high-resolution (it is reused).",
   "A slow glint travels along the silver chopsticks; candle flames flicker slightly.",
   "Push into the chopstick tips.",
   note="Removed the court lady 'testing for poison': that ritual is not well sourced for Joseon. Fixed court headwear (samo caps, not gat). Silver stayed a court custom, not an everyday one (KOCIS).")
sc(EXH, "Silver really can darken when it meets certain sulphur compounds. But that doesn't make it a reliable poison detector.",
   "A simple diagram: a silver chopstick tip touching a boiled egg darkens; beside it, a poison bottle with a question mark.",
   "Exhibition table-top: egg left, chopstick tip centre, small dark bottle right; generous white space.",
   "None.", "Cream ground.",
   "The tip tarnishes; the bottle gets a faint question mark (edit).",
   "Editorial science diagram on cream: a silver chopstick tip touching a halved boiled egg, the tip slightly darkened; beside it a small dark "
   "glass bottle; clean shadows, no labels.",
   "The tip slowly darkens where it touches the yolk; the bottle stays unchanged; small pause.",
   "Pull back to the banquet table.")
sc(HIS, "And at the royal table, silver was also a display of status.",
   "Reuse of the royal-table image, pulled wider so the whole silver setting and the officials read as status.",
   "Same image as the legend scene, wider crop.", "Same officials.", "Same palace room.",
   "Slow pull-out; one glint.",
   "(Reuse the royal-table image from the silver-legend scene; no new generation.)",
   "Slow pull-out from the chopsticks to the whole table; a single glint crosses the silverware.",
   "Cut to a modern Japanese home.",
   note="Now a reuse of the legend image: one fewer generation, and returning to the same table turns 'status' into a reveal.", reuse="the silver-legend scene")
sc(CUL, "In Japan, chopsticks come with rules. Never stand them upright in a bowl of rice. That's how rice is offered to the dead.",
   "The Japanese family at dinner; the son is about to stick his chopsticks upright in rice; inset: a home altar with a rice offering and upright chopsticks.",
   "Medium shot of the table; inset panel top right showing the butsudan.",
   "{JAPAN_FAMILY}; the mother gently reaches to stop the son.", "Modern Japanese dining room, chopstick rests.",
   "Son's chopsticks hover over the rice; mother's hand stops him; inset fades in.",
   "{JAPAN_FAMILY} at dinner in a modern Japanese dining room: rice bowls, miso soup, grilled fish, chopsticks on small rests; the son is about to "
   "stand his chopsticks upright in his rice and the mother gently reaches out to stop him; an inset panel shows a small home Buddhist altar with "
   "a bowl of rice and chopsticks standing upright as an offering.",
   "The son's chopsticks hover above the rice; the mother's hand touches his wrist; the altar inset fades in with a thin incense curl.",
   "Inset expands; colour drains slightly to muted greys.")
sc(CUL, "And never pass food from one pair of chopsticks to another. At Japanese funerals, that's how family members pass the bones after a cremation.",
   "Back at the table the father offers food chopstick-to-chopstick and stops himself; then a respectful, muted funeral scene of family in black holding long chopsticks together.",
   "Two beats: table close-up, then a quiet wide funeral composition with no remains shown (out of frame).",
   "{JAPAN_FAMILY} at the table; then the same family in black mourning clothes.", "Dining room; a plain funeral hall.",
   "Passing pauses; dissolve to the funeral; nothing graphic.",
   "Two-part image: left, at the dinner table the father almost passes food from his chopsticks to his son's, then pauses; right, in a quiet plain "
   "funeral hall, the same family in black mourning clothes stand together, two of them holding long chopsticks over a white-covered tray, its "
   "contents out of view; muted greys, respectful.",
   "Left: the passing hand stops mid-air. Right: no character motion at all; only a very slow push-in.",
   "Fade through cream to the split callback.",
   note="The funeral half stays completely still: motion there would feel disrespectful.")
sc(CMP, "So in East Asia, the cutting moved into the kitchen. In Europe, it stayed right there at the table.",
   "Callback to the split screen: the Song kitchen on one side, the medieval table on the other, with the cutting highlighted.",
   "Same 50/50 composition as the earlier split, mirrored: kitchen left, table right.",
   "{SONG_COOK}; the medieval carver.", "Song kitchen; Medieval hall.",
   "Highlight moves from kitchen to table.",
   "A split composition with a thin charcoal divider: left, {SONG_COOK} chopping in a Song-dynasty kitchen; right, a medieval European carver "
   "slicing a roast at a long table in front of diners; terracotta glow around each blade.",
   "A soft terracotta glow on the cook's cleaver fades, then rises on the carver's knife; camera drifts right.",
   "Push into the right half: Europe.")

# ═════════ EUROPE: THE TABLE ═════════
sc(HIS, "European meat was often roasted in large pieces, and at a feast, the carving happened in front of the diners. So diners needed a blade.",
   "A 14th-century feast: a carver slices a large roast at the high table while guests watch.",
   "Wide establishing shot of the hall; carver at the centre of the high table.",
   "A carver in a parti-coloured tunic; nobles and guests in fur-trimmed gowns and hoods.", "Medieval hall.",
   "Carver slices; servers move; guests lean in.",
   "A 14th-century European great hall feast: a carver in a parti-coloured tunic slices a large roast at the high table in front of nobles in "
   "fur-trimmed gowns; along the long trestle table in the foreground, seated guests with small sheathed knives on their belts; white cloths, "
   "bread trenchers, tapestries, candlelight. Generate wide and high-resolution (it is reused).",
   "The carver's knife moves in long strokes; a server carries a platter; guests lean forward.",
   "Tilt down to a guest's belt.")
sc(CUL, "But in the Middle Ages, your host usually didn't give you one. You brought your own.",
   "A guest arrives, draws his own knife from a sheath on his belt and sits; the table has trenchers but no knives.",
   "Medium shot; guest centre; host gesturing to the seat at right.",
   "A guest in a dark-blue hooded cloak; the host in a fur-trimmed gown.", "Medieval hall, near the door.",
   "Hand to the belt; knife drawn; he sits.",
   "In a medieval hall a guest in a dark-blue hooded cloak draws his own small knife from a leather sheath on his belt as the host in a "
   "fur-trimmed gown gestures to a seat; the table is set with bread trenchers and cups but no knives.",
   "The guest unhooks the knife and sits; the host smiles and gestures.",
   "Cut to the knife on display.")
sc(EXH, "Many diners carried a knife on their belt, for cutting dinner, and, if necessary, for fighting.",
   "A medieval eating knife and its leather sheath displayed, with two small vignettes: cutting bread, and a guarded stance.",
   "Museum-plate composition: knife and sheath centre; two circular vignettes left and right.",
   "Small figures in the vignettes.", "Cream ground.",
   "Vignettes draw in on 'dinner' and 'fighting'.",
   "A medieval pointed eating knife with a wooden handle and its tooled leather belt sheath displayed like a museum plate on cream; two small "
   "circular vignettes: a hand cutting bread, and a man in a hood standing on guard with the same knife.",
   "Knife rotates slightly into the light; the left vignette draws in, then the right one.",
   "Back to the feast, wide.")
sc(CUL, "Picture it. A long table, a roast in the middle, and guests with blades on their belts.",
   "Reuse of the great-hall feast image: the camera glides along the foreground guests' belts, each with a sheathed knife, the roast in the middle.",
   "Same image, tight crop at belt height, lateral pan.", "Same guests.", "Medieval hall.",
   "Lateral pan at belt height; no character animation.",
   "(Reuse the great-hall feast image from the carving scene; it is generated wide and high-resolution for this crop.)",
   "Slow lateral pan along the guests' belts in the foreground; each knife handle catches a small glint as the camera passes.",
   "A candle flame wipes the frame to the map.",
   note="Reuse instead of a new image: the narration says 'picture it', so going back to the same hall is clearer than a new one.", reuse="the carving scene")
sc(MAP, "Now picture Venice, around a thousand years ago. Into the family of its ruler, the doge, comes a Byzantine noblewoman. In Constantinople, wealthy people already ate with forks.",
   "Map of the eastern Mediterranean: a small illustrated Venice in its lagoon, a route from Constantinople with a ship, and an inset of a wealthy Byzantine dinner with forks.",
   "Map with Venice upper left and Constantinople right; inset bottom right.", "Inset: Byzantine diners in silk.", "Map; Byzantine dining-room inset.",
   "Start on Venice; the route draws; the inset opens on 'forks'.",
   "Illustrated map of the eastern Mediterranean with a tiny illustrated early-medieval Venice in its lagoon, a thin route from Constantinople to "
   "Venice with a small sailing ship, and an inset vignette of a wealthy Byzantine dining room where diners in silk robes eat with small "
   "two-pronged forks.",
   "The camera starts on Venice; the route draws from Constantinople as the ship moves; the inset opens like a window.",
   "Push into Venice: the palace hall.",
   note="Merged the 3-second Venice establishing shot into the map: the map carries Venice and Constantinople together.")
sc(HIS, "So at dinner, she has her servants cut her food into little pieces, and she lifts them to her mouth with a golden instrument with two prongs.",
   "The noblewoman at a Venetian table: attendants cut her food small; she lifts a piece with a golden two-pronged fork; Venetians stare.",
   "Medium shot; her centre; attendants at left; two Venetian nobles at right, staring.",
   "{BYZANTINE_BRIDE}; two attendants in plain tunics; Venetian nobles in red and brown mantles.", "Venetian palace.",
   "Attendants cut; she lifts the fork; nobles' eyebrows rise.",
   "{BYZANTINE_BRIDE} at an 11th-century Venetian dinner: two attendants cut her food into small pieces; she lifts a piece to her mouth with a slender "
   "golden two-pronged fork; two Venetian nobles in red and brown mantles stare in surprise; Byzantine-style arches, oil lamps.",
   "She lifts the golden fork to her mouth, slowly; everyone else stays still except one noble turning his head.",
   "The golden fork glints and becomes an ink drawing in a manuscript.")
sc(HIS, "Decades later, a churchman named Peter Damian wrote about her, holding up her habits as a warning against sinful luxury. A fork. As a warning.",
   "Peter Damian writes by candlelight; a small ink sketch of the fork appears in his manuscript margin.",
   "Medium close-up at desk height; candle left; page centre.",
   "{DAMIAN}.", "Monastery cell: stone wall, desk, candle, inkwell.",
   "Quill writes; margin fork appears; he looks up sternly.",
   "{DAMIAN} writing with a quill by candlelight at a wooden desk in a stone monastery cell; a parchment letter with a small ink drawing of a "
   "two-pronged fork in the margin; stern, thoughtful expression.",
   "The quill moves; the fork sketch draws itself in the margin; he looks up, unimpressed.",
   "Page turns into a century timeline.")
sc(CUL, "And for centuries, most of Europe kept eating with its fingers.",
   "A lively medieval town meal: families eat with fingers and bread; a thin timeline ribbon 1000 to 1300 underneath.",
   "Wide, cosy; table centre; ribbon along the bottom.",
   "A townsman's family in wool tunics and linen coifs.", "Timber-framed house interior.",
   "Fingers tear bread; ribbon dates advance.",
   "A medieval European townsman's family in wool tunics and linen coifs eating stew and bread mostly with their fingers at a plain table in a "
   "timber-framed house, a few knives and wooden spoons on the table; a thin terracotta timeline ribbon along the bottom edge.",
   "Hands tear bread and dip it; the ribbon slides along under the scene.",
   "Map: Italy lights up.")
sc(CUL, "Except Italy. By the fourteenth century, forks were becoming common at wealthier Italian tables.",
   "Italy highlighted on the map, then a Florentine merchant family c. 1350 eating with small forks.",
   "Brief map beat, then medium shot of the table with a loggia view.",
   "A Florentine merchant family in rich wool and silk gowns.", "Florentine palazzo room, painted beams.",
   "Map flash then cut; forks lift.",
   "A wealthy Florentine merchant family around 1350 dining in a palazzo room with painted ceiling beams: small silver forks beside knives, "
   "glazed maiolica dishes, rich wool and silk gowns, a loggia view of terracotta rooftops.",
   "Forks lift small pieces; a servant pours wine; light shifts across the loggia.",
   "Close on a bowl of pasta.")
sc(CMP, "And one popular explanation will sound familiar. Pasta. Try eating long noodles with a knife.",
   "Split callback: left, the Chinese noodle lifted with chopsticks (earlier scene); right, Italian long pasta lifted with a fork, while a knife fails.",
   "50/50 split with matched bowl positions; the rhyme is the point.",
   "Hands only.", "Song table / Italian table.",
   "Left lifts; right: the knife slips, the fork lifts.",
   "A split composition: left, chopsticks lift a long noodle from a Chinese bowl; right, an Italian bowl of long pasta where a knife lets the "
   "strands slide off while a fork lifts them; matched framing, cream background.",
   "Both bowls lift strands at the same moment; on the right the knife slips first, then the fork succeeds.",
   "Wipe north across the Alps.")
sc(CMP, "By the fifteen hundreds, France's elite were starting to adopt the fork too. But in England, the idea was still strange.",
   "Split: a French Renaissance court table with forks; an English Tudor table with knives and fingers, a puzzled diner holding a fork.",
   "50/50 split; matching table lines.",
   "French courtiers in slashed doublets and ruffs; a Tudor family in dark wool, one man frowning at a fork.", "Château dining room / Tudor hall.",
   "Left: forks lift. Right: the man turns the fork over, baffled.",
   "A split composition: left, French nobles around 1580 in a château dining room, two of them eating with small forks while others still use "
   "knives and fingers; right, an English Tudor family in dark wool at an oak table eating with knives and fingers while one man frowns at a fork "
   "he is holding.",
   "Left: one diner lifts a fork. Right: the man turns the fork over, puzzled.",
   "A dotted walking route draws across the map.",
   note="Only some French diners use forks: the elite were 'starting to', and the fork caught on slowly (National Geographic).")
sc(MAP, "Then, in 1608, an English traveller named Thomas Coryat toured Italy, walking almost half of his journey.",
   "Coryat walks a dusty poplar-lined road across the plain of northern Italy, a dotted route from England to Venice drawn faintly over the sky like a map.",
   "Wide landscape, Coryat small on the road at the left third; route overlay across the top.",
   "{CORYAT}.", "Poplar-lined road on the Lombard plain.",
   "He walks; the dotted route extends ahead.",
   "{CORYAT} walking along a dusty poplar-lined road across the flat plain of northern Italy, farmhouses in the distance, with a dotted route line "
   "from England to Venice faintly drawn across the sky like a map overlay.",
   "He walks steadily along the road; the dotted route line extends ahead of him; poplars sway.",
   "He walks through a doorway into a Venetian dining room.",
   note="Fact fix: Coryat did not walk over the Alps; guides carried him up the Mont Cenis pass in a chair (Osher Map Library). He walked other stretches, so a lowland road is accurate.")
sc(HIS, "He watched Italians eating with forks, and he helped make the habit known back home.",
   "Coryat at a Venetian table in 1608, notebook open, watching diners use forks; then at an English table showing the fork.",
   "Two beats in one frame: Venetian table left, English table right, Coryat in both.",
   "{CORYAT}; Venetian diners in black and crimson; English friends.", "Venetian dining room / English parlour.",
   "He sketches; then he demonstrates.",
   "A two-part image: left, {CORYAT} at a Venetian table in 1608, notebook open, watching Italians eat with forks; right, back in England he "
   "demonstrates a fork to curious friends at an oak table.",
   "Left: he sketches a fork in his notebook. Right: he lifts a piece of meat on a fork; friends lean in.",
   "Cut to the tavern laughter.")
sc(CUL, "His friends gave him a nickname. Furcifer. Latin for fork-bearer. And also, for rascal.",
   "A London tavern: Coryat's friends laugh and raise tankards; he grins with a fork in hand.",
   "Medium-wide; table centre; Coryat seated right; friends left.",
   "{CORYAT}; four friends in early-17th-century doublets and falling collars.", "Timbered London tavern.",
   "Laughter, tankards up; the nickname card appears (edit).",
   "A timber-beamed London tavern around 1611: four friends in doublets and falling lace collars laugh and raise tankards toward {CORYAT}, who "
   "grins and holds up a fork; candlelight, pewter, smoke.",
   "Friends laugh and clink tankards; Coryat raises the fork with mock dignity.",
   "Camera slides along the tavern table to a lone knife.")
sc(EXH, "But the fork's real breakthrough was tied to the other tool on the table. The knife.",
   "A fork lies on a cloth; the camera slides right to a pointed knife beside it.",
   "Table-top close-up; fork left soft, knife right sharp.",
   "None.", "White tablecloth, period setting.",
   "Rack focus from fork to knife on 'The knife.'",
   "A period table-top close-up: a two-pronged fork on a white linen cloth at the left, and to the right a pointed personal knife with a wooden "
   "handle, its sharp tip catching the light.",
   "The camera slides from the fork to the knife; the knife tip glints.",
   "Split into before and after.")
sc(CMP, "Remember those pointed blades? Over time, manners changed. Pointed personal knives became less welcome at dinner, and blunt table knives became more common.",
   "Before and after: a 1500s place with a pointed personal knife; a 1700s place with a matched blunt table knife.",
   "50/50 split; identical plate positions; only the knife changes.",
   "None.", "Two table settings, period-correct.",
   "Left tip glints; right blade rounds.",
   "A before-and-after split of two place settings: left, around 1550, a pointed personal knife beside a wooden plate; right, around 1700, a "
   "matched silver-handled table knife with a rounded tip beside a porcelain plate.",
   "The left tip glints; then the right knife slides into place; a soft arrow ribbon flows from left to right.",
   "Cut to the cardinal's dinner.")
sc(HIS, "There's a famous story that Cardinal Richelieu, disgusted by a guest picking his teeth with his knife, had the tips of his own table knives ground round.",
   "Richelieu frowns as a guest picks his teeth with a knife point; then a steward grinds knife tips round at a wheel.",
   "Two beats: dinner (left two-thirds), grinding wheel (right third).",
   "{RICHELIEU}; a guest in a 1630s doublet; a steward.", "Paris palace dining room; servants' workshop.",
   "Guest picks; Richelieu's frown; sparks at the wheel.",
   "A 1630s Paris dining room: {RICHELIEU} frowns with distaste as a guest in a doublet picks his teeth with the point of his knife; in a side panel, "
   "a steward grinds the tips of table knives round on a grinding wheel; candlelight.",
   "Richelieu's frown deepens slightly; the side-panel grinding wheel turns; nothing else.",
   "Sparks fly into a town square.",
   note="Kept, framed as 'a famous story' (tradition, not documented: Wikipedia, Table knife). Motion cut to one gesture and a turning wheel.")
sc(HIS, "And in 1669, Louis the Fourteenth banned pointed knives in part of his kingdom.",
   "A herald reads a royal edict in a northern French town square; a cutler listens at his shop door.",
   "Wide town square; herald on steps centre; cutler shop right.",
   "A royal herald in blue tabard with fleurs-de-lis; a cutler in a leather apron; townsfolk in 1660s dress.", "Brick town square, stepped gables.",
   "Herald unrolls the edict; heads turn. Illustrative staging: the 1669 edict is attested, but its scope is disputed, so no specific town is named.",
   "A brick town square in a northern French province in 1669 with stepped gables: a royal herald in a blue tabard reads an edict from a sealed "
   "parchment; a cutler in a leather apron listens at his shop door among displayed knives; townsfolk in 1660s dress.",
   "The herald unrolls the parchment; the crowd turns; the cutler glances at his pointed knives.",
   "Cut to a single plate demonstration.")
sc(EXH, "But a blunt knife can cut. It can't spear. Something else had to hold the food steady.",
   "Demonstration: a round-tipped knife cuts meat but cannot spear it; a fork pins it.",
   "Top-down on a plate; knife left; fork enters right.",
   "Hands only.", "Plate on cream.",
   "Knife cuts; poke fails; fork pins.",
   "Top-down editorial demonstration: on a white plate a round-tipped table knife cuts a piece of meat, and a fork pins the meat steady; hands in "
   "18th-century cuffs; cream ground.",
   "The knife cuts; it pokes the piece and slides off; the fork arrives and pins it.",
   "Pull back into a timeline of forks.")
sc(HIS, "So the fork became more useful, and it changed shape. Two prongs became three. And by the eighteenth century, the four-pronged fork was becoming the familiar shape we recognise today.",
   "An illustrated timeline of forks: two prongs, three prongs, four prongs curved, with century markers.",
   "Horizontal timeline on cream; three forks standing on a thin ribbon; century ticks.",
   "None.", "Cream ground.",
   "Each fork rises on its words; ribbon draws.",
   "An elegant horizontal timeline on cream paper with three forks standing upright above a thin terracotta ribbon: a two-pronged fork, a "
   "three-pronged fork, and a curved four-pronged fork; small tick marks for centuries, no text.",
   "The ribbon draws left to right; each fork rises into place in turn; a soft light settles on the four-pronged fork.",
   "Hard cut to the mouth close-up.")

# ═════════ TEETH ═════════
sc(EXH, "And this is where the story gets strange.",
   "Callback to the opening mouth close-up, now with a faint question mark drawn beside the teeth.",
   "Same framing as scene 9.", "{DINER}, profile close-up.", "Plain cream ground.",
   "Brief push-in; light dims slightly.",
   "(Reuse the mouth close-up from the opening teaser; no new generation.)",
   "Slow push-in toward the teeth; the light dims a little.",
   "Dissolve to a lab bench.",
   note="Reuse: the callback is the point.", reuse="the opening mouth teaser")
sc(HIS, "The American anthropologist Charles Loring Brace spent years studying human teeth.",
   "An anthropologist's lab: skulls and dental casts on shelves, calipers, index cards.",
   "Medium shot at bench height; researcher centre; shelves behind.",
   "{ANTHROPOLOGIST}.", "University museum lab, 1980s.",
   "Calipers measure a jaw; cards flip.",
   "{ANTHROPOLOGIST} measuring a dental cast with calipers at a lab bench in a university museum; shelves of skull casts and jaws behind, index "
   "cards, a desk lamp, 1980s equipment.",
   "He adjusts the calipers and writes on an index card; the desk lamp hums softly.",
   "Push into the cast; it becomes a diagram.")
sc(CMP, "He noticed that most people today have an overbite: the top front teeth sit in front of the bottom ones. But in old European skulls, he mostly found the teeth meeting edge to edge.",
   "Two clean side-view dental diagrams: a modern overbite, then an old European skull's edge-to-edge bite beside it.",
   "Left diagram alone at centre first; it slides left as the right one appears; identical scale; a fine guide line.",
   "None.", "Cream ground.",
   "One diagram, then two; the overlap and then the meeting edges get a soft terracotta outline.",
   "Two editorial anatomical side-view diagrams of human front teeth in their gums on cream, front of the mouth facing left, identical scale and "
   "line style: left, a modern overbite with the upper incisors overlapping in front of the lower ones; right, an old European skull's front "
   "teeth meeting edge to edge, tip to tip.",
   "Start on the left diagram alone; it slides left as the right diagram builds in; a fine horizontal guide line shows where the tips meet.",
   "Cut to a medieval meal.",
   note="Merged two diagram scenes into one build: one image, and the comparison is clearer side by side.")
sc(HIS, "His explanation was this. Before knives and forks, people often clamped a piece of meat in their front teeth and sliced off a mouthful.",
   "A medieval man holds a strip of meat in his front teeth and slices it off with a small knife near his lips.",
   "Close side profile; the knife moves away from the face (safe, not threatening).",
   "A medieval peasant in his thirties, short beard, wool hood.", "Rustic cottage table.",
   "Clamp, slice, chew.",
   "Side-profile close-up of a medieval man with a short beard and wool hood holding a strip of roast meat in his front teeth and slicing off a "
   "mouthful with a small knife, blade angled away from his face; rustic cottage background.",
   "He clamps the meat, slices once outward, and chews; firelight.",
   "Generational strip appears.")
sc(HIS, "Once Europeans started cutting food into small pieces on the plate, the front teeth no longer had to grip. Over generations of childhoods, the bite changed.",
   "Three generations of children at the table across the 1600s to 1800s, each with a small bite-diagram inset that slowly shifts.",
   "Three panels, left to right; children eating with knife and fork; small circular inset below each.",
   "Three children: 1650 in a lace collar, 1750 in a waistcoat, 1850 in a pinafore.", "Three period dining rooms.",
   "Panels fade in left to right; the insets are still drawings.",
   "Three side-by-side panels: a child in 1650 with a lace collar, a child in 1750 in a waistcoat, a child in 1850 in a pinafore, each cutting food "
   "on a plate with knife and fork; below each a small circular inset of front teeth, shifting from edge-to-edge to a slight overbite.",
   "No morphing: the three panels fade in one after another, left to right; each inset is a separate still drawing.",
   "Map: China highlighted again.")
sc(MAP, "Brace also pointed to evidence from Song dynasty China, suggesting the same change may have appeared there much earlier, among people eating pre-cut food with chopsticks.",
   "China highlighted; inset of a Song family eating pre-cut food with chopsticks and a small jaw diagram.",
   "Map left two-thirds; inset right third.",
   "Song-era family (from the earlier scene).", "Map; Song dining room inset.",
   "China fills; inset opens; jaw shows overbite.",
   "An illustrated map of East Asia with China in terracotta wash, and an inset of a Song-dynasty family eating bite-sized food with chopsticks, "
   "with a small side-view jaw diagram showing an overbite.",
   "China fills with colour; the inset opens; the jaw diagram draws in.",
   "Cut to a two-sided page.",
   note="Brace's Song-China point rests on very little evidence (he discusses one individual), so the inset stays small and the next scene stresses the debate.")
sc(CMP, "But this is one researcher's explanation, not a settled answer. Others link it to softer food in general, going back thousands of years.",
   "A balanced two-sided page: left, the cutlery explanation (knife, fork, plate); right, early farmers grinding grain into soft porridge.",
   "50/50 composition like an open book; equal weight to both sides.",
   "Right: a Neolithic farming couple grinding grain on a quern.", "Cream book-page layout.",
   "Both sides build; a 'still debated' tag (edit).",
   "An open-book composition on cream: left page shows a knife, a fork and a plate of cut food; right page shows a Neolithic farming couple grinding "
   "grain on a saddle quern and a pot of soft porridge; equal visual weight.",
   "Left page illustrations settle; the right-hand couple grind grain; a page edge flutters.",
   "Cut back to the modern diner.")
sc(CUL, "Still, if Brace is right, the way your ancestors cut their dinner is still written in your face.",
   "The diner smiles at her table; behind her, faint silhouettes of ancestors at their own tables, as if drawn in pencil.",
   "Medium close-up of her smiling; ghostly pencil ancestors behind at decreasing size.",
   "{DINER}; faint pencil ancestors (medieval, 1700s, 1800s).", "Modern apartment.",
   "Slow push-in.",
   "Medium close-up of {DINER} smiling at her table, front teeth just visible; behind her, faint pencil-sketch silhouettes of ancestors at their "
   "own tables from medieval, 18th- and 19th-century times, receding into the cream background.",
   "The faint ancestors are part of the still; only a slow push-in on her smile.",
   "The ancestors fade; a map rises.")

# ═════════ THE HAND ═════════
sc(MAP, "And then there's the third answer, the oldest of all.",
   "World map: South Asia, the Middle East and much of Africa softly highlighted.",
   "Map centred on the Indian Ocean.", "None.", "Map.",
   "Regions fill gently.",
   "An illustrated world map centred on the Indian Ocean, sand land, muted-blue sea; South Asia, the Middle East and East and West Africa softly "
   "washed in terracotta; no labels.",
   "The terracotta wash spreads region by region; slow push-in.",
   "Push into a pair of hands.")
sc(CUL, "Eating with your hands isn't the absence of a tool. It's a tradition, with rules.",
   "Close-up: hands washed before a meal with water poured from a jug over a basin.",
   "Close-up, centred; water arc; basin below.",
   "{DELHI_FAMILY}: the grandfather's hands; the son pours.", "Delhi home.",
   "Water pours; hands rub; towel.",
   "Close-up of an elderly man's hands being washed before a meal, a common custom in many households, as a teenager pours water from a steel jug over a basin; white kurta cuffs; "
   "towel nearby; Delhi home tiles.",
   "Water pours in a smooth arc; the hands rub together; droplets fall into the basin.",
   "Pull back to the family meal.")
sc(CUL, "Across much of South Asia, the Middle East and Africa, the first rule is simple. You eat with your right hand.",
   "The Delhi family at their meal again; right hands eating, left hands resting.",
   "Callback to the opening Delhi composition, slightly closer.",
   "{DELHI_FAMILY}.", "Delhi home.",
   "Right hands lift; a soft highlight on the right hands.",
   "{DELHI_FAMILY} eating lunch at a low table in a Delhi home from stainless-steel thalis; each eats with the right hand while the left rests on the "
   "lap; soft warm light.",
   "Right hands lift food in turn; a soft terracotta highlight rings the right hands.",
   "Close on the grandfather tearing roti.")
sc(CUL, "Often, the bread is the cutlery. In many Indian dining traditions, flatbread becomes a scoop.",
   "The grandfather tears a piece of roti with one hand and scoops dal with it.",
   "Close-up of right hand and thali; overhead three-quarter.",
   "{DELHI_FAMILY}: the grandfather.", "Delhi home.",
   "Tear, fold, scoop.",
   "Close-up of the Delhi grandfather's right hand tearing a piece of roti and folding it into a scoop to lift dal from a steel katori on a thali.",
   "He tears the roti with one hand, folds it and scoops the dal; steam rises.",
   "Match cut: the torn roti becomes torn injera.")
sc(CUL, "In Ethiopia, the spongy bread called injera is the plate and the spoon at the same time. You tear, you fold, you lift.",
   "The Addis family around a mesob with injera covered in stews; close-up of tear, fold, lift.",
   "Overhead three-quarter on the injera; family around; hands at centre.",
   "{ADDIS_FAMILY}.", "Addis home.",
   "Three beats: tear, fold, lift.",
   "{ADDIS_FAMILY} around a woven mesob basket-table with a large round of injera topped with several stews (red lentil, greens, chicken); a right "
   "hand tears a piece of injera, folds it around stew and lifts it; coffee-ceremony set in the corner.",
   "A hand tears injera, folds it around stew, lifts it; steam and incense smoke drift.",
   "Stay; the grandmother prepares a mouthful.")
sc(CUL, "There's even a gesture for love. In Ethiopia, it's called gursha.",
   "The grandmother wraps a careful mouthful of injera and turns toward her grandson.",
   "Close two-shot; grandmother left, grandson right.",
   "{ADDIS_FAMILY}: grandmother and grandson.", "Addis home.",
   "She wraps the morsel; he looks up.",
   "In an Addis Ababa home, the grandmother of {ADDIS_FAMILY} carefully wraps a mouthful of injera and stew with her fingers and turns toward her "
   "smiling grandson; warm light.",
   "She wraps the morsel slowly; he looks up and leans in.",
   "Three vignettes slide in.")
sc(CMP, "You take a mouthful, and you feed it to someone else, with your own hand. A guest, an elder, a newly married partner.",
   "Three warm vignettes of gursha: to a guest, to an elder, between a bride and groom.",
   "Three equal panels; each with one feeding gesture.",
   "{ADDIS_FAMILY}; a visiting guest; an elder; a bride and groom in white habesha kemis and gabi with woven borders.", "Addis home; wedding.",
   "Each panel lights on its words.",
   "Three equal panels of Ethiopian gursha: a host feeding a visiting guest; a grandson feeding his grandmother; a bride and groom in white habesha "
   "kemis and gabi with woven coloured borders feeding each other at their wedding; warm, joyful.",
   "Each panel lights in turn as the feeding hand reaches the mouth; small smiles.",
   "Map: Thailand.")
sc(HIS, "And here's a twist. Thailand used to eat with hands too.",
   "A Siamese household of the early 1800s eating with hands from shared dishes on a floor mat.",
   "Wide, low angle; family on the mat; teak house.",
   "A Siamese family of the early 1800s in chong kraben and simple wraps.", "Raised teak house, floor mat, shared bowls.",
   "Hands eat; the camera rises.",
   "A Siamese family of the early 1800s sitting on a woven mat in a raised teak house, eating rice and curries from shared bowls with their hands; "
   "chong kraben and simple wraps; tropical light.",
   "Hands roll rice and dip into curry; palms sway outside.",
   "Track up into a palace.")
sc(HIS, "Then, during the eighteen hundreds, Siam's royal court and elites began adopting Western spoons and forks. Then the habit spread.",
   "A Siamese court banquet with a Western table setting; courtiers handle spoons and forks.",
   "Wide banquet, symmetrical.",
   "{SIAM_COURT}.", "Palace hall with Western table, Thai roof finials through windows.",
   "Spoons lift; slow push-in.",
   "{SIAM_COURT} at a long Western-style banquet table in a palace hall of the 1860s-1880s: white cloth, silver spoons and forks, porcelain; Thai "
   "roof finials visible through the windows.",
   "Two courtiers lift spoons and forks; slow push-in. 'Then the habit spread' is carried by the cut to modern Bangkok.",
   "Match cut to the modern spoon.")
sc(CUL, "Today, the spoon goes in your right hand, and the fork pushes food onto it. That's why there's no knife, and usually no chopsticks.",
   "Callback to the Bangkok diner: the fork pushes rice onto the spoon.",
   "Close-up on the plate; spoon right, fork left.",
   "{BANGKOK_DINER}.", "Bangkok shophouse.",
   "Push, lift; hold.",
   "Close-up of {BANGKOK_DINER}'s hands: the fork in the left hand pushes rice and basil pork onto the spoon in the right hand; no knife, no "
   "chopsticks on the steel table.",
   "The fork pushes; the spoon lifts; hold on the empty space where a knife would be.",
   "Cut to the case-file desk.")

# ═════════ THE STORY YOU HEARD ═════════
sc(EXH, "So where does that leave the stories you've probably heard?",
   "An editor's desk: three folders, a magnifying glass and old books, like a fact-checking file.",
   "Top-down desk composition; three folders in a row.",
   "None.", "Wooden desk, cream paper.",
   "Folders slide in; magnifier hovers.",
   "Top-down view of a wooden desk with three cream folders in a row, a brass magnifying glass, old books and a pencil, like a fact-checking file; "
   "no text.",
   "The three folders slide in; the magnifying glass glides over them.",
   "Open the first folder.")
sc(HIS, "Here is the story you heard. Confucius banned knives from the dinner table, because knives meant violence.",
   "The legend as an old storybook plate: a sage gestures at a knife on a table, framed by a decorative border.",
   "Storybook vignette inside an ornate frame on the desk (signals 'legend').",
   "An ancient Chinese sage in a dark robe (illustrative, legendary framing).", "Storybook frame.",
   "Frame draws; sage points; the frame gently tilts (doubt).",
   "An old-storybook-style vignette inside an ornate border: an ancient Chinese sage in a dark robe points disapprovingly at a knife on a dining "
   "table; framed like a legend plate.",
   "The ornate border draws in; the sage points; the whole frame tilts slightly as if doubted.",
   "The frame flips over.")
sc(HIS, "What's true? There is a famous Chinese saying: a gentleman keeps away from the kitchen.",
   "A scholar walks past a kitchen doorway in a Warring-States courtyard; the saying in calligraphy on a scroll (add text in edit).",
   "Wide courtyard; doorway right; scroll area left.",
   "A Warring-States scholar in a dark robe and topknot.", "Courtyard with kitchen doorway, steam.",
   "He walks past; steam drifts; scroll unrolls.",
   "A Warring-States Chinese scholar in a dark robe and topknot walks past an open kitchen doorway in a courtyard, steam drifting out; a blank "
   "hanging scroll on the left for calligraphy.",
   "The scholar walks steadily past the doorway; steam curls out; the scroll unrolls.",
   "Turn to the hall.")
sc(HIS, "What's wrong? It comes from Mencius, not Confucius. And in context, he's talking about a king who couldn't bear to see an ox led to its death. It's about compassion, not table manners.",
   "Mencius speaks with King Xuan in a hall; through the open door an ox is led past; the king looks moved.",
   "Medium-wide; Mencius left, king right; doorway centre-back with the ox.",
   "{MENCIUS}; {KING_XUAN}; an attendant leading an ox.", "Warring-States palace hall.",
   "Ox passes; king's expression softens.",
   "{MENCIUS} speaking with {KING_XUAN} in a Warring-States palace hall; through the open doorway an attendant leads an ox past; the king turns "
   "toward it with a compassionate, troubled expression.",
   "The ox walks slowly past the doorway; the king's expression softens; Mencius gestures gently.",
   "Map of Italy and France.")
sc(MAP, "Here's another. Catherine de' Medici brought the fork from Italy to France. It's a lovely story.",
   "Map: a route from Florence to France; inset of young Catherine arriving with a fork on a cushion, storybook-framed.",
   "Map left; storybook inset right.",
   "Young Catherine de' Medici in 1533, about fourteen, in brocade with a jewelled cap.", "Map; storybook inset.",
   "Route draws; inset opens.",
   "An illustrated map of Italy and France with a thin route from Florence to Marseille, and an ornate storybook inset of young Catherine de' Medici "
   "in 1533, about fourteen, in a brocade gown and jewelled cap, arriving with a fork presented on a velvet cushion.",
   "The route draws; the storybook inset opens with a gentle flourish.",
   "Close the storybook onto an archive table.")
sc(EXH, "Historians aren't convinced. The evidence is thin.",
   "An archive table: a very thin folder, a magnifying glass, mostly empty pages.",
   "Table-top; the thin folder centre; lots of empty space.",
   "None.", "Archive table, cream pages.",
   "Folder opens; pages are nearly blank.",
   "An archive table with a very thin open folder holding one or two nearly blank pages, a magnifying glass resting beside it, soft window light; "
   "lots of empty space.",
   "The folder opens; one page turns, nearly blank; the magnifier slides over it.",
   "Pull back to a timeline.")
sc(CMP, "And the biggest one of all. That forks are simply the civilised way to eat. Europe spent six centuries thinking the opposite.",
   "A timeline from 1000 to 1600: Peter Damian's scolding letter at the start, fingers and knives along the way, forks only at the end.",
   "Horizontal timeline; vignettes above; the fork appears only at the far right.",
   "{DAMIAN} (small); diners of each century.", "Cream timeline.",
   "Ribbon draws; vignettes appear; the fork arrives last.",
   "A horizontal illustrated timeline on cream from about 1000 to 1600: at the left {DAMIAN} writing his letter, then medieval diners eating with "
   "fingers and knives, and only at the far right a diner with a fork; thin terracotta ribbon beneath.",
   "The ribbon draws left to right; each vignette rises as it passes; the fork appears last.",
   "Three panels slide in.")
sc(CMP, "And every tradition in this story comes with manners just as strict as any dinner party in Paris.",
   "Triptych: a Japanese table with chopstick rests; an Ethiopian gursha; a formal Paris dinner party.",
   "Three equal panels with matching table heights.",
   "{JAPAN_FAMILY}; {ADDIS_FAMILY}; Parisian guests in evening wear.", "Three dining rooms.",
   "Each panel performs one etiquette gesture.",
   "A triptych of three equal panels: the Japanese family placing chopsticks neatly on rests; the Addis Ababa grandmother offering gursha; a formal "
   "Paris dinner party with guests in evening wear and a full silver place setting.",
   "Each panel performs one small etiquette gesture in turn.",
   "Lights go down.")
sc(EXH, "None of these tools is better. Each one is a smart answer to a different problem.",
   "Three equal plinths under three equal spotlights: fork and knife; chopsticks; a hand holding injera.",
   "Symmetrical; dark ground justified for the reveal; equal light on each.",
   "A hand (neutral) holding a piece of injera.", "Dark gallery, spotlights.",
   "Spotlights switch on one by one, all equal.",
   "A darkened gallery with three equal plinths under three equal spotlights: a fork and knife; a pair of chopsticks; a right hand holding a piece of "
   "injera; perfectly balanced, no single winner.",
   "The spotlights switch on one by one; each pool of light is the same size and brightness.",
   "Lights rise to daylight: the apartment.", dark=True)

# ═════════ BACK TO THE PLATE ═════════
sc(CUL, "So let's go back to that plate.",
   "Callback: the diner at her table, plate in front of her, exactly as in the opening.",
   "Same framing as scene 1.", "{DINER}.", "Modern apartment.",
   "Slow push-in.",
   "(Reuse the opening image of the diner at her table; no new generation.)",
   "Slow push-in toward the plate.",
   "Push into the knife.",
   note="Reuse of the opening frame: the visual rhyme signals the ending.", reuse="the opening plate scene")
sc(CUL, "The round tip on your knife? Centuries of changing table manners, and maybe one fussy cardinal.",
   "Close-up of her knife's round tip; in its reflection, a tiny frowning Richelieu.",
   "Extreme close-up; knife tip centre; reflection inside the blade.",
   "{DINER}'s hand; {RICHELIEU} tiny, in the reflection.", "Table top.",
   "Tip glints; reflection appears and frowns.",
   "Extreme close-up of a round-tipped table knife in a woman's hand with a terracotta cardigan cuff; in the polished blade, a tiny reflection of "
   "{RICHELIEU} frowning.",
   "The knife tilts slightly; a glint crosses the blade; the reflection is part of the still (no animated face).",
   "Slide to the fork.")
sc(CUL, "The four prongs on your fork? The seventeen hundreds.",
   "Close-up of the four prongs; a faint ribbon timeline behind it stopping at the 1700s.",
   "Close-up; fork upright; ribbon behind.",
   "{DINER}'s hand.", "Table top.",
   "Prongs count up 1-2-3-4 with tiny glints.",
   "Close-up of a four-pronged fork held upright in a woman's hand with a terracotta cardigan cuff; behind it, a faint terracotta timeline ribbon "
   "on cream.",
   "Each prong glints in turn; the ribbon draws behind and stops.",
   "Pull back; a medieval table ghosts in.")
sc(CUL, "And the cutting you're about to do, right there at the table? That's Europe's answer, from a time when diners brought their own blades.",
   "The diner cuts her food; behind her, the medieval feast appears faintly like a pencil sketch.",
   "Medium shot; she cuts; sketch overlay behind.",
   "{DINER}; faint medieval guests.", "Modern apartment, medieval sketch layer.",
   "She cuts; sketch blooms behind; guests' knives glint.",
   "{DINER} cutting her chicken at her table; behind her, a faint pencil-sketch medieval feast with guests carrying knives on their belts.",
   "She cuts once; the faint pencil feast is part of the still; slow push-in.",
   "Split into three windows.")
sc(CMP, "In Shanghai, the cutting happened hours ago, in a kitchen. In Addis Ababa, the bread is doing the work. And in Bangkok, the spoon and fork began at a royal court in the eighteen hundreds.",
   "Triptych callback: the Shanghai family's kitchen; the Addis family's injera; the Bangkok diner with a faint Siamese court behind.",
   "Three equal panels, each with its signature action.",
   "{SHANGHAI_FAMILY}; {ADDIS_FAMILY}; {BANGKOK_DINER}; faint {SIAM_COURT}.", "Shanghai home kitchen; Addis home; Bangkok shophouse.",
   "Each panel lights on its city.",
   "A triptych of three equal panels: the Shanghai grandmother chopping vegetables in her home kitchen; the Addis Ababa family tearing injera; "
   "{BANGKOK_DINER} eating with a spoon and fork while a faint sketch of {SIAM_COURT} at a banquet appears behind.",
   "Each panel lights and animates in turn: chopping, tearing, spooning.",
   "The panels merge into the four-panel grid.")
sc(CMP, "Same problem. How do you get food from the plate to your mouth? Three brilliant answers.",
   "Callback to the four-panel grid, then the panels collapse into three tools side by side.",
   "Grid then three tools centred.",
   "Same as the earlier four panels.", "Cream ground.",
   "Grid lifts; tools resolve.",
   "Three tools side by side on cream, centred and equal: a fork with a table knife, a pair of chopsticks, and a right hand holding flatbread; "
   "elegant shadows.",
   "Hold; a soft light rises on each tool in turn (edit overlay).",
   "Back to the diner's smile.")
sc(CUL, "And one of them may even be shaping your teeth.",
   "The diner smiles; the faint dotted line from the opening returns to her teeth.",
   "Close-up three-quarter; smile; dotted line.",
   "{DINER}.", "Modern apartment.",
   "Dotted line draws; she smiles.",
   "Close-up of {DINER} smiling at her table, front teeth visible; a delicate dotted guide line points to her front teeth.",
   "The dotted line draws to her teeth (edit overlay).",
   "Cut to two tables.",
   note="Simplified: the guide line is added in the edit so her face stays consistent.")
sc(CMP, "And if you're wondering why a Korean meal so often comes glowing red with chili, while a Japanese meal usually doesn't, that's a story about a plant that crossed the world. And it starts in the Americas.",
   "Split: a red-hued Korean table (kimchi, stew) vs a pale Japanese table (miso, sashimi); then a map route from the Americas to East Asia with a chilli pepper.",
   "50/50 split, then a map beat for the route; end-card space.",
   "{SEOUL_DINER}; {JAPAN_FAMILY}.", "Korean table; Japanese table; world map.",
   "Red glow builds on the left; route draws from the Americas.",
   "A split composition: left, {SEOUL_DINER} at a Korean table glowing red with kimchi, red stew and chilli paste; right, {JAPAN_FAMILY} at a pale "
   "Japanese table with miso soup, rice and grilled fish; across the top a thin route line from the Americas to East Asia carrying a small red "
   "chilli pepper.",
   "The red tones warm on the left; the route line draws from the Americas, carrying the chilli across the map.",
   "End card.",
   note="Teaser kept, now tied to this video: the Seoul diner and the Japanese family come back, so the next episode grows out of this one.")


# ── build: verify narration coverage, resolve characters, add timecodes ──
def plain(s):
    return re.sub(r"\s+", " ", s).strip()


narr = plain((HERE / "narration.txt").read_text(encoding="utf-8"))
joined = plain(" ".join(x["narr"] for x in S))
if joined != narr:
    a, b = joined.split(" "), narr.split(" ")
    i = next((k for k in range(min(len(a), len(b))) if a[k] != b[k]), min(len(a), len(b)))
    sys.exit(f"MISMATCH at word {i}:\n  board:     {' '.join(a[max(0, i - 8):i + 8])}\n  narration: {' '.join(b[max(0, i - 8):i + 8])}")


def fill(t):
    def rep(m):
        k = m.group(1)
        if k not in CHARS:
            sys.exit(f"unknown character {{{k}}}")
        return CHARS[k]
    return re.sub(r"\{([A-Z_]+)\}", rep, t)


# word start times in the final video (6 approved parts, back to back)
T_IN = {"dolly": 22, "door": 20, "cut": 0}
times, off = [], 0.0
for n in range(1, 7):
    b = json.loads((ROOT / f"public/howwe/forks-v3-p{n}/built.json").read_text(encoding="utf-8"))["scenes"]
    t = 0
    for i, s in enumerate(b):
        if i:
            t -= T_IN[s["in"]]
        times += [off + (t + w["f0"]) / 30 for w in s["words"]]
        t += s["dur"]
    off += t / 30
total = off
assert len(times) == len(narr.split(" ")), (len(times), len(narr.split(" ")))
k = 0
for x in S:
    x["t0"] = times[k]
    k += len(plain(x["narr"]).split(" "))
for i, x in enumerate(S):
    x["t1"] = S[i + 1]["t0"] if i + 1 < len(S) else total

mmss = lambda s: f"{int(s // 60)}:{int(s % 60):02d}"
counts = {}
for x in S:
    counts[x["tech"]] = counts.get(x["tech"], 0) + 1

# revision notes for scenes changed in v2 only by motion or detail (narration prefix -> note)
EXTRA_NOTES = {
    "So at dinner, she has her servants": "Motion cut to one action (the fork lift). The attendants cutting her food is in Peter Damian's own account (Met Museum).",
    "And for centuries, most of Europe kept eating": "Added knives and spoons on the table: medieval diners used them too; 'fingers' was never the whole story.",
    "And in 1669, Louis the Fourteenth": "Marked as illustrative staging: the edict is attested, but its scope is disputed (Flemish provinces per Wikipedia), so no real town is named.",
    "Once Europeans started cutting food": "Removed the morphing insets (hard to generate consistently); three still panels fade in instead.",
    "Still, if Brace is right": "The pencil ancestors are part of the still image instead of drawing themselves in: simpler and steadier.",
    "Eating with your hands isn't the absence": "Qualifier added: hand-washing before meals is common in many households, not a universal rule.",
    "Then, during the eighteen hundreds, Siam": "Removed the spreading-dots inset (one idea per scene); costume dates narrowed to the 1860s-1880s, when Western dress elements appear at court.",
    "The round tip on your knife?": "The Richelieu reflection is part of the still (no animated face): consistent and less gimmicky.",
    "And the cutting you're about to do": "The pencil feast is part of the still; one cutting action only.",
    "Same problem. How do you get food": "Grid-collapse animation removed; three tools hold with an overlay highlight.",
    "In Shanghai, the cutting happened hours ago": "Kept; each panel animates only after the previous one finishes, to keep one action on screen at a time.",
}
for x in S:
    if not x["note"]:
        for k, v in EXTRA_NOTES.items():
            if x["narr"].startswith(k):
                x["note"] = v
new_imgs = sum(1 for x in S if not x["reuse"])
L = []
head = HERE / "storyboard-v2-audit.md"   # Parts A-D (hand-written audit); Part F after the marker
audit = head.read_text(encoding="utf-8") if head.exists() else ""
L.append(audit.split("<!-- PART F -->")[0])
L.append("\n## PART E: Revised storyboard\n")
L.append(f"{len(S)} scenes over {mmss(total)} ({new_imgs} new images, {len(S) - new_imgs} reuses), timed to the approved CapCut narration. "
         "Narration quoted exactly (checked word for word against `narration.txt`). Timecodes are from the approved final. No images generated yet.\n")
L.append("\n### How to use the prompts\n")
L.append("- Every **Image Generation Prompt** is complete: scene content + the channel style block + fixed character descriptions are merged in. Paste as is.")
L.append("- Every **Animation Prompt** includes the consistency rule. Use the generated still as the first frame.")
L.append("- Text (location tags, titles, dates, the Mencius calligraphy, 'Furcifer') and highlight overlays are added in the edit, never generated.")
L.append("- **Reuse** scenes take an image generated earlier; generate those images wide and high-resolution so they can be cropped.\n")
L.append("\n### Style block (in every prompt)\n")
L.append(f"> {STYLE}\n>\n> {NEG}\n")
L.append("\nThe one dark scene (the three-spotlight reveal) swaps the ground to charcoal; everything else stays on cream.\n")
L.append("\n### Character bible (same words in every prompt they appear in)\n")
for kk, v in CHARS.items():
    L.append(f"- **{kk}**: {v}")
L.append("\n### Recurring locations\n")
for kk, v in LOCS.items():
    L.append(f"- **{kk}**: {v}")
L.append("\n### Technique mix\n")
L.append(" · ".join(f"{kk}: {v}" for kk, v in sorted(counts.items(), key=lambda z: -z[1])) + "\n")
L.append("\n---\n")
for i, x in enumerate(S, 1):
    st = STYLE_DARK if x["dark"] else STYLE
    tag = " · REUSE" if x["reuse"] else ""
    L.append(f"\n#### Scene {i} · {mmss(x['t0'])}–{mmss(x['t1'])} ({x['t1'] - x['t0']:.1f} s) · {x['tech']}{tag}\n")
    L.append(f"**Revision:** {x['note'] or 'Kept as in v1.'}\n")
    L.append(f"**Narration:** \"{x['narr']}\"\n")
    L.append(f"**Visual Technique:** {x['tech']}\n")
    L.append(f"**Scene Description:** {fill(x['vis'])}\n")
    L.append(f"**Composition and framing:** {x['comp']}\n")
    L.append(f"**Characters:** {fill(x['chars'])}\n")
    L.append(f"**Environment and cultural details:** {x['env']}\n")
    L.append(f"**Animation Direction:** {x['anim']}\n")
    if x["reuse"]:
        L.append(f"**Image Generation Prompt:** none: reuse the image from {x['reuse']}.\n")
    else:
        L.append(f"**Image Generation Prompt:**\n```\n{fill(x['prompt'])} {st} {NEG}\n```\n")
    L.append(f"**Animation Prompt:**\n```\n{fill(x['aprompt'])} {KEEP}\n```\n")
    L.append(f"**Transition out:** {x['trans']}\n")
if "<!-- PART F -->" in audit:
    L.append(audit.split("<!-- PART F -->")[1])
(HERE / "storyboard-editorial.md").write_text("\n".join(L), encoding="utf-8")
long_ = [(i + 1, x["t1"] - x["t0"]) for i, x in enumerate(S) if x["t1"] - x["t0"] > 12]
print(f"{len(S)} scenes ({new_imgs} new images), {mmss(total)}, narration matches word for word; techniques: {counts}")
print("revised:", [i + 1 for i, x in enumerate(S) if x["note"]])
print("reuse:", [i + 1 for i, x in enumerate(S) if x["reuse"]])
print("scenes over 12 s:", long_)
