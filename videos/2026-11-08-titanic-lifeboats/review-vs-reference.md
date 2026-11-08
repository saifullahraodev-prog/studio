# Review: our Short v1 vs. reference Short (owner feedback, 2026-11-08)

Reference: "Were Colt Lightning Rifles Useless? #shorts" (youtube.com/shorts/IdUVd-PXeC8), 29.0 s.
Method: reference sampled every 0.5 s (58 frames) for content and every 0.1 s for motion/caption
changes, in the built-in browser. Ours measured from `titanic-lifeboats-1080p.mp4` + `scenes.json`.
Note: I could analyse the reference's picture and captions, not its sound.
Visual: `out/compare/first-6s-side-by-side.png` (top = reference, bottom = ours, same 6 seconds).

## The numbers

| | Reference | Ours v1 | Gap |
|---|---|---|---|
| Length | 29.0 s | 36.5 s | ours 26% longer for a simpler story |
| Distinct shots / visual events | ~45–55 (new image every ~0.6 s) | 9 (one every 4.1 s) | **~7× fewer** |
| Frames with big picture change (0.1 s sampling) | 154 of 290 (camera almost never still) | ~9 cuts, slow glides between | screen is near-static in ours |
| Words spoken per second | ~3.7 (one caption word per spoken word) | 2.5 | ours ~33% slower |
| Silence | none audible in captions | 4.1 s total (0.32 s after every line + 1.1 s tail) | 11% dead air |
| Caption | 1 word at a time, every word, lower-middle | full sentence on top + 1 keyword per line | ours = 9 caption changes, theirs ≈ 107 |
| First 3 s | character in a scene + "One night…" story + "Thinking / Why" | "Safety Inspector here. Today's case: the Titanic." (channel intro) | no hook in ours |

## Frame-by-frame differences (what they do that we don't)

1. **Every phrase gets its own picture.** "thinking" → hand-on-chin close-up (1.1 s); "why" →
   whip-blurred pan (1.6 s); "using Winchester 1873s" → three different rifle inserts (2.0–3.5 s);
   "feeds incorrectly" → macro shot of the cartridge jamming (20.6 s). Ours shows one picture per
   whole sentence (8–20 words).
2. **The camera never rests.** Whip pans with motion blur between shots, punch-ins on stressed
   words, low heroic angles, tilted (dutch) angles, over-the-shoulder, extreme close-ups with a
   wide lens close to the face (big-head distortion = comedy). Ours: eye-level medium shots with
   slow, polite glides.
3. **Characters act all the time.** Hands are in almost every frame: pulling the lever, pointing,
   waving, counting, recoiling; one character is knocked flying (17.6 s). Expressions change every
   phrase. Ours: characters mostly stand still with one expression per line; only the stoker runs.
4. **Hands and objects in macro.** ~30% of their frames are inserts of hands/props (gloves on the
   lever, bullets, cards, coins). We have zero insert shots.
5. **Comedy = deadpan face + absurd action.** Shout faces, screaming mid-action, slapstick hits,
   the "thinking" pose. Ours: one size gag, otherwise straight.
6. **Captions drive the eye.** One big word per spoken word keeps the eye moving and lets viewers
   follow with sound off. Our top sentence + one keyword is calm and readable, but slow.
7. **Narration pace and hook.** Theirs starts mid-story in 0.3 s and never pauses. Ours opens with a
   channel intro and pauses after every line; the placeholder voice is also slow and flat.
8. **Reveal structure.** Our best line ("Illegal? No.") arrives at 17 s, spoken flatly, with no
   setup beat, no reaction shot and no sound hit. The reveal needs a pause, a reaction face and a
   punchline image.

## What is already fine
Fact-checking, look (faces, lighting, lens blur), the scene-file pipeline, lip-sync, and
render speed. The problem is **direction and editing**, not the art style. Rendering cost depends
on the number of frames, not the number of cuts, so cutting faster costs almost nothing extra.

## Solution (optimized for our engine and this PC)

### 1. Script v2: hook-first, faster, built for reveals (same verified facts)
Target ~100 words at ~3.4 words/s ≈ 30 s. Inspector still opens and closes.
See "Script v2 draft" below. Every fact is from the approved fact-check table.

### 2. Micro-beats: one image per phrase (the biggest win)
- Split every line into **phrases of 2–5 words** using faster-whisper word timings.
  Target a new shot every **0.6–1.2 s** (≈ 30–40 shots per Short).
- Scene file gains a phrase line per visual: `| count the lifeboats -> insert:fingers-counting`.
  Where I don't specify one, an **auto-director** fills in with a rotation: reaction close-up →
  insert of the prop just mentioned → wide/establishing → over-the-shoulder.
- Rule: never hold one framing longer than 1.5 s unless it's a deliberate comic pause.

### 3. Camera language kit (new code, used by every template)
punch-in on stressed word (fast 0.15 s zoom with overshoot) · whip-pan transition (4–6 frames,
directional motion blur, sideways slide across the cut) · dutch tilt · low hero angle ·
wide-lens face close-up (fov ~60, camera 1.2 m from face) · over-the-shoulder · macro insert with
shallow focus · micro handheld shake on impacts. Constant small motion so no frame is ever frozen.

### 4. Acting kit (gesture library, procedural, ~12 actions)
point · thinking (hand on chin) · facepalm · shrug · count on fingers · wave arms (panic) · grab
head · recoil/flinch · thumbs-up · tick clipboard · run · slapstick fall/knock-back. Each with
anticipation + overshoot easing (squash & stretch feel), plus blinks, head bobs on stressed words
and an expression change per phrase. Narrated words can trigger gestures automatically.

### 5. Captions v2 (needs your approval: changes the locked look → style v1.1)
One word at a time on every spoken word (from word timings), bold rounded font, lower-middle,
pop-in scale; keywords (numbers, key nouns) get a colour accent and bigger size. Drop the top
sentence subtitle. (YouTube's auto-captions remain available for accessibility.)

### 6. Sound design (needs a download: free CC0 sound packs, I'll ask first)
whoosh on every whip/cut · hit/boing on gags · ticks/pops for word captions (very quiet) · one
light comedic music bed per mood, ducked under the voice · a 0.3 s silence + bass hit before
each reveal. This is the Phase 4 SFX library, pulled forward.

### 7. Comedy beats (one every ~5 s), written into the scene file
- Stoker counts lifeboats on his fingers… runs out of fingers… borrows a passenger's hand.
- Crowd vs. boats: 20 boats appear as tiny icons, 2,200 people pile up and spill off the frame.
- "It was legal": the Inspector stamps APPROVED on the Titanic, then freezes.
- 1894 rulebook: the table literally ends with a cliff edge at "10,000 tons and upwards"; the
  Titanic model doesn't fit on the page.
- Ending: Inspector proudly shows the modern orange lifeboat, it's packed with life rafts (pop!).

### 8. Delivery (your recording, or a better placeholder)
Faster, punchy, conversational, with a deliberate pause only before reveals. The Windows voice
can't do this well; for previews I can use a free offline neural voice (Piper, ~60 MB download,
I'll ask first). Your own recording replaces it at the end either way.

## Plan
| Step | What | Needs from you |
|---|---|---|
| A | Approve script v2 (below) | approval |
| B | Micro-beat director + camera kit + gesture kit + word-by-word captions | approve captions change (style v1.1) |
| C | SFX/music library (CC0) + better placeholder voice | OK to download (I'll list files + sizes) |
| D | Re-cut Titanic Short v2 → 720p preview → side-by-side with the reference | review |
| E | Lock improvements into templates so every future video gets them for free | none |

Render cost estimate for v2: ~30 s Short ≈ 900 frames ≈ 5–6 min at 1080p (same as now).

## Script v2 draft (for approval; same facts and sources as v1)

| # | Who | Line (spoken) | Visual idea (micro-beats) |
|---|---|---|---|
| 1 | INSPECTOR (on camera, hook) | "The Titanic carried MORE lifeboats than the law required. So why did more than fifteen hundred people die?" | punch-in on "MORE", Inspector taps rulebook; whip to sinking silhouette on "die" |
| 2 | VO | "It's 1912. You're a stoker. Night shift." | macro: coal shovel, fire glow; stoker wipes brow |
| 3 | VO | "Then… CRUNCH." | 0.3 s silence → shake → iceberg fills the frame |
| 4 | VO | "You sprint up on deck and count the lifeboats." | run cycle, low angle; fingers counting insert |
| 5 | VO | "Twenty. For over two thousand two hundred people." | stoker runs out of fingers; crowd piles in |
| 6 | VO | "Seats for about half of you." | half the crowd gets boat icons, other half stares at camera |
| 7 | VO | "But here's the twist… it was totally legal." | beat; Inspector stamps APPROVED, freezes, sweat drop |
| 8 | VO | "The rulebook was from 1894, and its biggest size was 'ten thousand tons and up.'" | rulebook page ends in a cliff edge |
| 9 | VO | "Titanic? Forty-six thousand. Same rule. Sixteen boats. She even brought four extra." | Titanic model too big for the page; "+4" pops |
| 10 | INSPECTOR (on camera) | "And that's why, today, every passenger ship must carry a lifeboat or life-raft seat for everyone on board." | modern orange lifeboat, rafts pop out; clipboard tick |

Fact notes: "MORE lifeboats than required" (20 vs. 16 minimum, capacity 1,178 vs. 962 required);
"more than 1,500 died" (Britannica ~1,500; inquiries 1,490–1,517); "over 2,200 people" (2,201–2,240
in sources); "biggest size 10,000 tons and up" (1894 table top category); "46,000" (46,328 GRT);
"sixteen boats… four extra" (16 required under davits; 20 carried). All sourced in `script.md`.
