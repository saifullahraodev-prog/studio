# How We Ended Up: Visual Direction v1.0 (recommendation)

**Date:** 2026-11-15. **Status:** **APPROVED by owner 2026-11-15** (style frames `docs/howwe/frames/`). Locked values: `engine/howwe/style-v1.0.json`. Golden frames: `golden/howwe-*.png`.

## Owner decisions this is built on (Q&A, 2026-11-15)
| Question | Answer |
|---|---|
| Who animates | **Claude, in code** (Remotion studio). Owner reviews stills and previews. |
| People | **Simple people, minimal faces.** Posture, clothing and props tell the story. |
| Then vs Now | **Same drawing style, era tint.** "Then" is on aged paper with muted inks; "Now" is clean and bright. |
| Detail level | **Medium:** clean shapes on texture. |
| Mood | **Premium documentary**, refined to **daylight galleries with a dark spotlight reveal** once per video. |

Earlier look tests (all in `docs/howwe/`):
- `board.png`: A Paper Atlas, B Riso Print, C Museum dark.
- `museum-dark-vs-daylight.png`: C vs D.

---

## 1. Reference study: borrow vs avoid

The reference notes come from general familiarity with each channel's published style. The view counts were pulled live on 2026-11-15 (see `../YouTube-Niche-Research-Report.md`).

**[TED-Ed](https://www.youtube.com/@TEDEd)** (23M subs; recent food-origin lessons got 256K and 347K views in under a week)
- **Borrow:** one clear visual metaphor per sentence, calm pacing, and illustration that treats adults as smart.
- **Avoid:** TED-Ed commissions a *different* artist and style for nearly every film. That works for a 23M-subscriber institution, but it kills brand recognition for a new channel.

**[Half as Interesting](https://www.youtube.com/@HalfAsInteresting)** (e.g. [Rolex, 1.8M](https://www.youtube.com/watch?v=ENkbkzeCYYM))
- **Borrow:**
  - deadpan on-screen text jokes;
  - fast map zooms;
  - a visual change every few seconds;
  - one running gag per video.
- **Avoid:** stock-footage collage. It has no ownable look, and it's exactly what AI slideshows imitate.

**[Johnny Harris](https://www.youtube.com/@JohnnyHarris)** (8.02M subs)
- **Borrow:**
  - maps treated as *physical objects* (paper, tracing overlays, hand-drawn circles and arrows);
  - annotation that builds up as the argument builds.
- **Avoid:** presenter-led, travel-shot, high-budget production, which is impossible solo and weekly.

**[Vox](https://www.youtube.com/@Vox)**
- **Borrow:** kinetic typography that isolates the key word, and clean "explainer card" layouts.
- **Avoid:** glossy newsroom-corporate polish. It feels like an outlet, not a channel with a personality.

**[The Infographics Show](https://www.youtube.com/@TheInfographicsShow)** (15.5M subs)
- **Borrow:** a *template system*. Their consistency is why they can publish daily.
- **Avoid:** generic big-head cartoon characters (child-like), and clickbait-catastrophe tone (recent titles: "…Collapse…", "…freaking out…").

**[Weird History](https://www.youtube.com/@weirdhistory)** (4.74M subs)
- **Borrow:** recurring illustrated "you are there" period scenes, and costume accuracy as entertainment.
- **Avoid:** crude cartoon humour, and the drift toward dark and horror topics ("Unsettling Medical Cases").

**[Tasting History](https://www.youtube.com/@TastingHistory)** (4.52M subs, recent 649K–3.2M)
- **Borrow:**
  - physical objects as the hero;
  - a *ritual segment* every episode (their tasting becomes our "Back to Your Table");
  - warmth.
- **Avoid:** dependence on an on-camera presenter.

**What nobody in this group does, which is our opening:** a single, consistent *place* the viewer returns to every week. Ours is a gallery where every culture's answer stands on an equal plinth.

---

## 2. Five visual directions compared

### D1 · The Gallery (daylight museum + dark reveal) ★ winner
- **What the viewer sees:** a calm, bright, modern museum. Everyday objects stand on plinths as exhibits with label cards. Two galleries side by side, divided by a wall pillar, form the split screen. Historical scenes are **period rooms** (as real museums have) shown in the "Then" tint. Maps hang as framed wall maps the camera pushes into. Once per video, the lights drop and a single spotlight reveals the answer.
- **Illustration:** flat-shaded vector with one shadow tone and one highlight, and a 3.5 px graphite outline at 1080p.
- **Characters:** faceless figures that read like museum diorama figures (see §5.4).
- **Background:** ivory walls, warm floor, soft daylight gradient, and a faint paper grain overlay.
- **Maps:** framed museum wall maps with cream land, pale sea, dashed routes and mono labels.
- **Objects:** exhibit-quality and centred, consistently lit from the top left.
- **Animation:** the camera does most of the moving (gallery dolly, push-ins). Exhibits rise onto plinths, cards print on, and people are cut-out puppets.
- **Transitions:** walk through the pillar into the next room; lights-down for the reveal; flip a card for a correction.
- **Comparisons:** always two (or three) equal plinths at the same height, size and light. The design itself says "equally valid answers".
- **Recognizable by:** the ivory gallery, the centre pillar, the plinths with accent strips, the label cards, and the spotlight moment.

### D2 · Paper Atlas (traveller's notebook)
- **What the viewer sees:** old map paper, ink linework, watercolour washes, a torn-paper seam, handwritten notes.
- **Characters:** ink-line figures with a watercolour fill.
- **Maps:** excellent, because the whole world is a map.
- **Animation:** ink draw-on, paper slides, washes blooming.
- **Transitions:** page turns, a torn seam opening.
- **Comparisons:** the left and right pages of a notebook.
- **Recognizable by:** the torn seam and handwriting.
- **Weakness:** gets busy, and feels nostalgic rather than premium.

### D3 · Riso Print (bold editorial print)
- **What the viewer sees:** two- or three-ink poster prints with halftone, grain and misregistration.
- **Characters:** silhouettes and flat shapes.
- **Maps:** graphic but low on detail.
- **Animation:** shapes stamp in, ink layers slide into register.
- **Comparisons:** one ink colour per side.
- **Recognizable by:** the colour overprint.
- **Weakness:** loses nuance in historical scenes, gets tiring over 12 minutes, and is the hardest to make warm.

### D4 · Archival documentary motion graphics (Johnny Harris / Vox family)
- **What the viewer sees:** real archival paintings, photos and engravings with paper textures, red-pen annotations, tracking map moves.
- **Characters:** none drawn; real historical images instead.
- **Strength:** the most "real".
- **Weakness:**
  - needs licensed archive images for every topic, and many cultures have thin public-domain imagery;
  - the look depends on what images exist, so brand consistency drops;
  - it's crowded with big newsrooms.

### D5 · TED-Ed-style rich 2D animation
- **What the viewer sees:** fully painted scenes with animated characters acting.
- **Strength:** the best storytelling ceiling.
- **Weakness:**
  - the slowest to make by far, since every scene is new art;
  - risks feeling like a kids' film;
  - impossible weekly in code.

### Scores (weights: Very high = 3, High = 2)
| Criterion (weight) | D1 Gallery | D2 Paper Atlas | D3 Riso | D4 Archival | D5 TED-Ed |
|---|---|---|---|---|---|
| Visual attractiveness (2) | 8 | 8 | 9 | 8 | 9 |
| Adult audience appeal (2) | 9 | 7 | 8 | 9 | 6 |
| Educational clarity (3) | 9 | 8 | 6 | 7 | 8 |
| Brand recognition (3) | 9 | 8 | 9 | 5 | 6 |
| Production speed (2) | 8 | 7 | 9 | 5 | 3 |
| Consistency across 70+ topics (3) | 9 | 8 | 8 | 5 | 6 |
| AI-assisted compatibility (2) | 7 | 7 | 5 | 6 | 6 |
| Historical storytelling (3) | 8 | 9 | 5 | 8 | 9 |
| Long-term scalability (3) | 9 | 8 | 7 | 5 | 4 |
| **Weighted /10** | **8.5** | **7.9** | **7.3** | **6.3** | **6.4** |

**Why each scored as it did:**
- **D1 Gallery:**
  - A fixed "place" plus templates gives the best consistency and speed.
  - The plinth comparison is the clearest way to show two answers as equals.
  - Period rooms handle history well, slightly below Paper Atlas because rooms are more formal than freehand notebook scenes.
- **D2 Paper Atlas:** the best for maps and history, but texture-heavy frames slow production and hurt clarity on phones.
- **D3 Riso:** a feed-stopper, but two inks can't carry 70 topics of cultural nuance, and AI tools don't produce clean riso separations.
- **D4 Archival:** credible, but brand and consistency depend on outside images.
- **D5 TED-Ed:** beautiful, but production speed and scalability fail the weekly-solo requirement.

---

## 3. The same 60-second opening in four directions

**Draft narration.** This is a placeholder for testing visuals. Every claim marked [verify] must be fact-checked before scripting.

| Time | Narration (draft) |
|---|---|
| 0:00–0:08 | "You probably used a fork today. It feels like the normal way to eat. But at this moment, most people on Earth are eating without one. [verify: the often-quoted 'one-third forks, one-third chopsticks, one-third hands']" |
| 0:08–0:16 | "Some pick up their food with two sticks. Many more use their hands, and in many places, that's the polite way." |
| 0:16–0:26 | "Draw it on a map and the world splits into three eating cultures." |
| 0:26–0:36 | "Five hundred years ago, a European nobleman wouldn't have used a fork either. His knife and his fingers were enough. [verify]" |
| 0:36–0:46 | "Meanwhile in China, chopsticks had been on tables for centuries, because the cutting happened in the kitchen, not at the table. [verify]" |
| 0:46–0:54 | "Which raises the real question: was it taste, religion, fuel, or something else? [verify claims behind each]" |
| 0:54–1:00 | "So how did we end up here?" (title card) |

### D1 · The Gallery
| Scene | What the viewer sees and how it moves | How it supports the narration |
|---|---|---|
| 1. Modern person with fork (0:00–0:08) | The "Today" room: a faceless figure at a modern table lifts a fork (3-pose puppet loop). The camera slowly pushes in. On "most people", the camera pulls back through a doorway: the table is an exhibit in a gallery. | The reveal of the museum frame says "your habit is one exhibit among many". |
| 2. Fork vs chopsticks vs hands (0:08–0:16) | The camera dollies right. Three equal plinths rise one by one (12-frame ease-out): fork, chopsticks, and an open right hand (a sculpted "hand" exhibit). Label cards print on in mono. | Equal plinths = equal answers, timed to each noun. |
| 3. World map (0:16–0:26) | The camera pushes into a framed wall map until it fills the screen. Regions fill in three accent tints, one per eating culture; a legend card slides in. | The word "map" cues the push. Colours fill as each culture is named. |
| 4. Historical European dining (0:26–0:36) | Door sign "PERIOD ROOM · EUROPE · c. 1500" [verify date]. The room is in the Then tint: a long table, faceless diners with knives, bread trenchers. One diner lifts food by hand (pose swap). | The "Then" tint signals time without a caption. |
| 5. Historical East Asian dining (0:36–0:46) | Split screen: the centre pillar slides in and the right half becomes "PERIOD ROOM · CHINA · c. 1500" [verify] in the same tint. A cook chops in the kitchen; diners hold bowls and chopsticks. | Here vs There at the same moment in history, side by side. |
| 6. How practices developed (0:46–0:54) | **Lights down.** A spotlight hits one plinth holding a "?" exhibit card. Three candidate-cause cards (taste, religion, fuel) lie face-down beside it, a teaser of the investigation. | The signature dramatic beat is used as the hook into the story. |
| 7. Back to the modern comparison (0:54–1:00) | Lights back up. A wide shot of the gallery with all three plinths, then the title card "HOW WE ENDED UP" on the gallery wall. | Brand moment and promise. |

### D2 · Paper Atlas
| Scene | What the viewer sees and how it moves | How it supports the narration |
|---|---|---|
| 1 | An ink sketch of a person with a fork draws on stroke by stroke; a watercolour wash blooms behind. | Handmade, intimate. |
| 2 | The page splits into three torn columns: fork, chopsticks and hand sketches, each with a handwritten caption. | Notebook-page comparison. |
| 3 | The whole page *is* a map: ink coastlines draw in, washes fill three regions, and handwritten region notes appear. | Strongest map moment of the four. |
| 4 | Europe, c. 1500 [verify]: a sepia ink sketch of a banquet drawn over the map area. | Drawing over the map ties history to place. |
| 5 | The torn seam opens to China, c. 1500, in the same ink style. | Here vs There via the seam. |
| 6 | Handwritten question list: "taste? religion? fuel?", circled and arrowed. | Investigation notebook. |
| 7 | The page turns back to the modern sketch, and the title is handwritten. | Gentle, but less dramatic. |

### D3 · Riso Print
| Scene | What the viewer sees and how it moves | How it supports the narration |
|---|---|---|
| 1 | A pink silhouette eating with a fork stamps in, with a halftone background. | Bold. |
| 2 | Three ink colours, one per utensil, stamp in a row. | Graphic comparison. |
| 3 | A flat three-ink world map; the inks overprint where cultures mix. | Striking but low on detail. |
| 4 | A banquet as flat silhouettes in one ink. | History reads as decoration and loses texture. |
| 5 | China silhouettes in the second ink, split by a thick black bar. | Clear split, little cultural detail. |
| 6 | Huge "WHY?" typography overprinted in yellow. | Energy, no nuance. |
| 7 | The title stamps in with misregistration. | Memorable. |

### D4 · Archival documentary motion graphics
| Scene | What the viewer sees and how it moves | How it supports the narration |
|---|---|---|
| 1 | Stock or filmed footage of a modern meal with a fork, plus kinetic text. | Real, but generic stock. |
| 2 | A three-panel split of real photos (fork, chopsticks, hand eating) with labels. | Clear, needs licensed photos. |
| 3 | A textured paper map with red-pen circles and tracking moves. | Strong (the Johnny Harris technique). |
| 4 | A Ken Burns move across a public-domain banquet painting, with a red-pen circle on a knife. | Credible *if* a suitable public-domain painting exists [check]. |
| 5 | A Ming-era painting or scroll detail, if a suitable public-domain image is found [check]. | Depends on archive availability, and is inconsistent across cultures. |
| 6 | Annotated question cards over archive images. | Fine. |
| 7 | Back to stock modern footage, then the title. | Looks like a hundred other channels. |

**Takeaway:** only D1 delivers four things together:
- a *place* the viewer recognizes;
- equal-status comparison built into the design;
- history that keeps the same look as the present;
- one repeatable dramatic beat.

D2 wins only the map scene.

---

## 4. Winning direction and why it wins

**A. Winner: D1 · The Gallery.** A bright modern museum of everyday life, with period rooms for history, framed wall maps, and a lights-down spotlight reveal once per video.

**B. Why it wins:**
1. **Brand:** viewers return to the *same place* every week. Recognizable without a logo (see §9).
2. **Respect is built into the design.** Every culture's answer gets an identical plinth, height, light and label card, so the visuals can't rank cultures. Faceless figures avoid caricature.
3. **Storytelling:** museums already have the vocabulary we need: exhibits (objects), period rooms (history), wall maps (geography), label corrections (myth-checks) and spotlights (reveals).
4. **Production in code:** it's built from a fixed kit. Room shells, plinths, cards, frames, people puppets and objects are reusable, so a new topic mostly means new *exhibits*, not new worlds.
5. **Premium without darkness:** it meets the owner's "premium" wish and avoids the brief's "dark, overly dramatic" ban, because the dark is rationed to one signature moment.

**Honest risks:**
- A gallery can feel static. The animation language (§6) must keep it moving.
- Light thumbnails can blend into YouTube's light mode. The thumbnail rules (§5.8) counter this.

---

## 5. Visual style guide (v1.0 values)

Values are at 1920×1080. In code they will live in one versioned file: `engine/howwe/style-v1.0.json`.

### 5.1 Colour
**Room neutrals**
| Token | Hex | Use |
|---|---|---|
| wall | #EEE7DA | Gallery walls |
| wallLight | #FFFBF2 | Daylight gradient, top left |
| floor | #D9CEB9 → #C9BCA2 | Floor gradient |
| plinth / plinthSide | #FBF8F2 / #E4DBCA | Exhibit plinths |
| ink | #1E1E24 | Titles and outlines (graphite, never pure black) |
| label | #6B6252 | Mono meta text |
| card | #FFFFFF | Exhibit label cards |

**Era tint (Then)**
- Paper overlay #E7D8B4, multiply 35%.
- Desaturate 40%.
- Outline ink shifts to #4A3F33.

**Reveal (lights down)**
- Room darkens to #141A19 at 85%.
- Spotlight cone #FFF4D6, radial falloff.

**Split sides.** These are fixed *by position*, never assigned to a culture, so no culture "owns" a colour.
| Side | Name | Hex | Use |
|---|---|---|---|
| Left | Clay | #B8735C | Wall tint 7%, card edge, map highlight |
| Right | Slate | #557F8E | Wall tint 7%, card edge, map highlight |
| Third (when needed) | Moss | #7C8F5A | Same uses |

**Pillar accents.** Used for the chapter tag, the plinth top strip on intro shots, and the thumbnail bottom bar.
| Pillar | Name | Hex |
|---|---|---|
| EAT | Saffron | #E3A72F |
| WEAR | Indigo | #4B57A3 |
| HOME | Sage | #7C9A57 |
| TIME & MONEY | Emerald | #2E7D5E |
| MANNERS & SIGNALS | Rose | #C25F7E |
| GETTING AROUND | Lagoon | #1F9AA8 |

**Skin tones:** a fixed, realistic range of 8 tones (to be defined in the style frames). Never exaggerated, and never used to code a culture.

### 5.2 Typography
| Role | Font | Settings |
|---|---|---|
| Primary display (keywords, exhibit names, titles, thumbnails) | **Playfair Display Black** | Keywords 104–140 px, tight tracking |
| Secondary (labels, dates, chapter tags, map labels, sources) | **IBM Plex Mono** (400/600) | Chapter tag 24 px, tracking 8, uppercase |
| Reading text (subtitles, longer captions) | **Inter SemiBold** | 40 px on an ivory bar at 85% opacity, max 2 lines |

Rule: never more than **one** Playfair keyword on screen at a time.

### 5.3 Illustration rules
- Flat fills plus **one** shadow tone (15% darker) plus an optional single highlight.
- No gradients on objects except metal sheen.
- Outline 3.5 px graphite (#26262C). The Then tint shifts it to #4A3F33.
- Light always comes from the **top left**. Shadows fall bottom right at 18% opacity.
- Paper grain overlay on everything (2% opacity, static, deterministic), so frames feel printed, not digital.
- **Cultural accuracy rule:** every object, garment and room is drawn from a documented reference (museum collection photos preferred), and the reference is logged in the video folder.

### 5.4 Character design: "diorama figures"
- About 6 heads tall, with adult proportions. This avoids the chibi and child look.
- **Faceless:**
  - The head is a smooth oval in a skin tone, with hair and headwear shapes.
  - No eyes, mouth or nose.
  - A small directional "nose tip" bump shows head direction in profile.
- Emotion comes from **posture and gesture only**: lean, shrug, raise a hand, bow, lift a utensil.
- Cut-out puppet build: head, torso, upper and lower arms, hands (4 shapes), legs. Each figure has 5–8 poses, plus 2–3 small loops (eating, chopping, talking gesture).
- **Clothing sets** are per region and era, built from references. They swap onto the same body bases, so one body system covers all 70 topics.
- No accents, costumes or features used as jokes.

### 5.5 Room kit (the "world")
1. **Gallery** (the default): two bays with a centre pillar = the Here vs There split.
2. **Period room** (Then): a doorway sign in mono ("PERIOD ROOM · REGION · c. YEAR") with the era tint.
3. **Map room:** a framed wall map the camera pushes into.
4. **Today room:** a modern kitchen, table or street. Clean and bright.
5. **Reveal state:** any room with the lights down and one spotlight.

### 5.6 Map design
- Framed like a museum wall map: a 24 px frame (#3A3A40) and an ivory mount.
- Land #E9E1D0, sea #DCE3E0, borders 1.5 px #8A7E68.
- Highlights use the split-side colours (Clay, Slate, Moss).
- Routes are dashed 6 px lines in ink and draw on.
- Labels in Plex Mono, uppercase, 22 px.
- Geography from real public-domain data (Natural Earth) when the map kit is built. **This is a download; it needs owner approval.**

### 5.7 Object illustration
- Each exhibit is drawn once at a large size and reused forever: the object library.
- View is **3/4 from above** for tableware and tools, and front-on for clothing and signs.
- Objects sit on plinths with a contact shadow, and never float, except in the "rising" animation.

### 5.8 Thumbnail design language
- **Two exhibits** on plinths left and right, split by the centre pillar. Objects fill **≥55% of the height**. The look test showed small objects disappear at feed size.
- **At most 3 words** in Playfair Display Black, graphite, at the top.
- A **pillar-accent bar** along the bottom edge (14 px) and a faint vignette, so light thumbnails separate from YouTube's light mode.
- **No faces, arrows, red circles or fake "BANNED" stamps.**
- An optional third element: the spotlight on one exhibit for myth-check videos.

### 5.9 On-screen text
- **Chapter tags:** THE QUESTION · THE FORGOTTEN PROBLEM · THE FORK IN THE ROAD · THE STORY YOU HEARD · BACK TO YOUR TABLE, in Plex Mono with the pillar accent.
- **One keyword per beat** in Playfair Display.
- **Label cards** for every exhibit: region · date · name · one-line function.
- **Sources** shown on screen as tiny mono footnotes (`[1] Author, Year`) when a claim appears. This is part of the trust brand.

### 5.10 Transition language (only these, every video)
| Transition | When | Sound |
|---|---|---|
| **Gallery dolly** (sideways slide past a pillar into the next bay) | Normal scene change | Soft footsteps plus room tone |
| **Doorway** (push through a period-room door; the tint washes in) | Into or out of history | Door creak, light |
| **Frame push** (into a wall map until it fills the screen) | To maps | Low air swell |
| **Lights down** (spotlight) | The one big reveal per video | Light-switch clunk plus a hum |
| **Card flip** (a label card flips to "CORRECTION") | Myth-checks | Card thunk |

No other wipes, glitches or whooshes. Consistency *is* the brand.

---

## 6. Animation language

- **The camera does most of the work.**
  - It always drifts slowly (scale +1.5% per 5 s).
  - It pushes in on the keyword word (8 frames, ease-out).
  - It dollies sideways between bays.
- **Something changes every 3–5 s** (the standing retention rule): a new exhibit, a card, a pose, a camera move or a map fill.
- **Exhibit entrance:** rises from the plinth top with a slight scale overshoot (12 frames). The label card prints on 6 frames later.
- **People:** pose swaps on narration beats, plus small loops. No lip-sync, no walk cycles except short "step into frame" moves.
- **Maps:** fills spread from the region's centre (20 frames), routes draw at a constant speed, and labels type on in mono.
- **Era change:** the tint washes left to right in 15 frames, like sunlight moving.
- **Reveal:** room lights fade 85% in 10 frames, the spotlight snaps on, hold 2 s, the answer card rises, and the lights come back over 20 frames.
- **Pacing targets for long-form:** average shot about 5 s, chapters every 2–3 minutes, and a re-hook line before each chapter.

---

## 7. First video: full visual treatment summary

**"Why Half the World Doesn't Use Forks"**, EAT pillar (Saffron).
- **0:00–1:00 Opening:** the D1 table in §3.
- **Chapter 1, The Question:** the gallery with three plinths (fork, chopsticks, hand). The map room shows the three-culture world map.
- **Chapter 2, The Forgotten Problem:**
  - A Europe period room (knives and fingers at the table) and a China period room (kitchen cutting, bowls) in a split.
  - Fuel and cooking-method exhibits: a cleaver, a wok and a kettle, as candidate causes [verify all causes].
- **Chapter 3, The Fork in the Road:**
  - Map routes showing how the fork spread through Europe, and how chopsticks spread across East Asia [verify].
  - South Asia, the Middle East and Africa period rooms for hand-eating traditions, shown as deliberate, rule-rich etiquette (for example right-hand customs) [verify]. Respect checklist applies.
- **Chapter 4, The Story You Heard:** card flip on a popular claim (to be chosen after research). **Lights-down reveal** of the real answer.
- **Chapter 5, Back to Your Table:** the Today room. Three modern tables, then the title wall, then "next question" exhibits teasing video 2 (Korea vs Japan spice).
- **Thumbnail:** fork and chopsticks on plinths, filling the height. "NO FORKS?" in Playfair at the top. Saffron bar at the bottom.

---

## 8. Production workflow (weekly, Claude builds in code)

### Before launch: asset library sprint (about 2–3 weeks)
1. **Style frames for owner approval (GATE):**
   - gallery;
   - period room (Then);
   - map room;
   - reveal;
   - people line-up (6 figures, 3 eras);
   - thumbnail.
2. **Kits built in code:**
   - room shells;
   - plinths and cards;
   - map kit (Natural Earth geography, after download approval);
   - body bases plus 12 poses;
   - the first clothing sets (Europe c.1500, China c.1500, South Asia, modern);
   - the first 30 objects;
   - the transition components.
3. **Scene templates:**
   - `exhibit2` and `exhibit3` (split plinths);
   - `periodRoom` and `periodSplit`;
   - `mapPush`;
   - `reveal`;
   - `cardFlip`;
   - `todayTable`;
   - `titleWall`.
   About 80% of shots come from these.
4. **Sound kit:** room tone, footsteps, door, light clunk, card thunk, soft curious music theme.

### Weekly cycle (one 10–16 min video plus 2–3 Shorts)
| Day | Owner | Claude |
|---|---|---|
| 1 | Approves topic | Research pack with sources, then script draft |
| 2 | Reviews script (fact-check sign-off) | Revisions. Scene list (one row per beat, §8.3 template) |
| 3 | Records voice (or TTS for now) | Word timings. New exhibits and clothing drawn for this topic (reference-logged) |
| 4 | Reviews **storyboard stills** (one per beat) | Builds scenes from templates, plus 2–3 hand-crafted hero shots |
| 5 | Reviews a **720p preview** | Fixes. Thumbnail (2–3 variants for YouTube's Test & Compare) |
| 6 | Final OK | 1080p render, QC (loudness, black/freeze frames), Shorts cut-downs (9:16 re-layout of the best reveal) |
| 7 | Uploads, pins the "Your country vs mine" comment | Updates PROGRESS, adds new objects to the library |

**Render time for a 12-minute 2D video in this engine hasn't been measured yet.** The first pilot will measure it. Unlike the 3D/Blender channel, the 2D Remotion pipeline is expected to be far cheaper, but that's an assumption until tested.

### 8.1 What AI is and isn't used for
| Use AI for | Don't use AI for |
|---|---|
| Research assistance (always verified against real sources) | People, faces, clothing or cultural objects in the final frame (drift and stereotype risk) |
| *Optional* painted backdrop plates for period rooms (no people, no text), then tinted and framed in code | Maps (accuracy) |
| Reference-gathering ideas, then checked against museum images | Whole-shot generation or AI video animation (inconsistent, "AI slideshow" look, policy risk) |
| Thumbnail brainstorming | Final narration (plan: human voice by about video 10) |

### 8.2 Keeping it consistent
- One style JSON.
- One object library: draw once, reuse forever.
- One body system with swappable clothing.
- A golden-frame check (like the studio's existing `golden/` process) before any style change.

### 8.3 Scene prompt template (H): narration sentence to scene
Each beat of narration becomes one row:
```
[beat 12]
say:        "Meanwhile in China, chopsticks had been on tables for centuries."
room:       periodSplit            # gallery | periodRoom | periodSplit | mapPush | reveal | todayTable | titleWall
split:      here-there             # none | here-there | then-now
left:       period:europe-1500 pose:diner-knife
right:      period:china-1500  pose:diner-bowl-chopsticks
tint:       then                   # then | now
exhibits:   chopsticks@right
card:       "CHINA · c. 1500 · Chopsticks · food cut in the kitchen"
keyword:    "Centuries"
camera:     dolly-right → push-in on "centuries"
sfx:        door, footsteps
source:     [2] (fill after fact-check)
backdrop:   AI plate? no (use kit room)
```

---

## 9. Master AI image prompt (G)

Use only for optional **backdrop plates** (empty rooms and landscapes). Everything people read is drawn in code.

> **MASTER STYLE PROMPT (backdrop plates):**
> Flat editorial illustration of an empty interior, styled as a museum period-room diorama. Clean vector shapes with flat colour fills and one soft shadow tone. Thin graphite outlines (#26262C). Soft daylight from the upper left. Calm, premium, uncluttered composition. Muted, warm palette based on ivory #EEE7DA, warm stone #D9CEB9, with small accents only. Subtle paper grain. Medium detail: a few accurate, well-chosen period details, not crowded. Historically accurate architecture and furniture for {REGION}, {ERA}, based on documented references. Straight-on, slightly elevated eye-level view, centred, with space in the lower third for figures to be added later. No people, no faces, no text, no logos, no watermarks. Not photorealistic, not 3D render, not anime, not children's cartoon, not dark, not dramatic lighting, no fantasy elements, no stereotypes or exaggerated cultural clichés.

**Scene-plate template**, filled per scene:
> {MASTER STYLE PROMPT} Subject: {ROOM TYPE, e.g. "a dining hall of a wealthy household"}, {REGION}, {ERA}. Key accurate details: {2–4 documented details, e.g. "long trestle table, wooden benches, tapestry on stone wall"}. Mood: {calm / busy / formal}. Aspect 16:9, 1920×1080.

**After generation:**
- Check it against references.
- Reject anything inaccurate or stereotyped.
- The code applies the era tint, frame and grain, so plates always match.

---

## 10. Brand recognition test (I)

A viewer should recognize How We Ended Up from any 3-second clip, with no logo, by these **seven constants**:
1. **The ivory gallery with a centre pillar dividing the frame** (Here vs There, Then vs Now).
2. **Equal plinths** with a thin accent strip, objects on top.
3. **White exhibit label cards:** mono meta line plus a Playfair name.
4. **One Playfair Black keyword** per beat, with a mono chapter tag above.
5. **Faceless diorama figures** in accurate dress.
6. **The Then tint** (aged paper) for every historical scene, and framed wall maps for geography.
7. **The lights-down spotlight reveal** with its light-switch "clunk", once per video.

**Never changes between videos:** palette tokens, fonts, outline weight, light direction, transition set, thumbnail layout.

**Changes every video:** the exhibits, the period rooms, the pillar accent, and the words.

---

## 11. Gate result
**Approved 2026-11-15.** Next: asset kits (Natural Earth map data needs a download OK), then the video 1 script.

## (original gate note)
Build the **real style frames** in this direction and show them as stills for approval before building the full kits:
- gallery 3-plinth;
- period-room split;
- map room;
- reveal;
- people line-up;
- thumbnail.

Nothing is locked until then.
