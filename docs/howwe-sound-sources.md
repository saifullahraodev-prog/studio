# How We Ended Up: where the reference channels get their music and sound

**Researched 2026-11-15.** The owner asked: "find the reference channels, see what music or sound they are using."

## What the reference channels actually use
These are read from each channel's own video descriptions (the 4 latest uploads, pulled 2026-11-15) plus each channel's own pages.

| Channel | Music | Sound | Source |
|---|---|---|---|
| **Kurzgesagt** | Custom score for every video by **Epic Mountain** (a Munich music and sound studio) | Epic Mountain | Every description has "700+ minutes of kurzgesagt soundtracks by Epic Mountain"; [kurzgesagt.org/youtube](https://kurzgesagt.org/youtube/); [Bandcamp](https://epicmountainmusic.bandcamp.com/) |
| **TED-Ed** | **Commissioned per film** from audio studios: [Wonder Boy Audio](https://www.wonderboyaudio.com) (the pepper and salt lessons, Nov 2026), [Camp Studio](https://www.campstudio.co) | Same studios | "Music: …" line in each description; [example lesson page](https://ed.ted.com/lessons/the-secrets-to-writing-the-perfect-pop-song-think-like-a-musician) |
| **Johnny Harris** | **Libraries:** Epidemic Sound, Musicbed, Soundstripe. **Plus original music** by composer Tom Fox on some videos. | (not credited) | "Music by: Epidemic, MusicBed, Soundstripe, Tom Fox" in descriptions; his video [How I Use Music](https://rosetta.to/u/johnnyharris/how-i-use-music-thoughts-on-the-creative-power-of-music) splits music into "feeling music" and neutral "thinking music" under information |
| **Wendover Productions** | (not credited) | **Professional sound designers:** "Sound by Manni Simon and Dony Bullen" | Descriptions of the 4 latest videos |
| Half as Interesting, Vox, Tasting History, Weird History, Infographics Show, History Matters | **Not credited** in descriptions | — | Checked; nothing listed (unknown, not guessed) |

**The pattern:** every channel that credits its music uses **human-made music**, either from a licensed library or a hired composer. None uses code-generated music. That's why my synthesized beds sounded thin, and no amount of tweaking will reach this level.

## Prices (checked Nov 2026; confirm on the official page before paying)
| Option | Cost | Covers | Notes |
|---|---|---|---|
| **Epidemic Sound**, personal/creator tier | about **$9.99/mo** billed yearly (more month-to-month) | Music **and** SFX, monetised YouTube on 1 channel per platform | Used by Johnny Harris; channel allow-list against Content ID claims. [review 1](https://wyzowl.com/epidemic-sound-review/), [review 2](https://scored.tools/blog/epidemic-sound-review-2026/) |
| **Artlist** Music & SFX Social | about **$9.99/mo** billed yearly ($14.99 monthly) | Music **and** SFX, personal channels | [pricing Nov 2026](https://photutorial.com/artlist-pricing/) |
| Musicbed / Soundstripe | higher | Music | Used by Johnny Harris; more cinematic; costs more |
| **YouTube Audio Library** | **free** | Music + SFX inside YouTube Studio, monetisation allowed | Filter for "no attribution required"; download only from YouTube Studio. [Google help](https://support.google.com/youtube/answer/4523596) |

## Recommendation
1. **Music: human-made, never synthesized.**
   - **Start free** with the YouTube Audio Library while the channel is new.
   - **Move to Epidemic Sound** (about $10/mo) once you're publishing weekly. It's the library a reference channel actually uses, it includes sound effects, and it protects the channel from Content ID claims.
   - Paying for anything is your decision. I can't sign up or download from your accounts.
2. **What to search for in the library** (this channel's mood):
   - **Use:** "curious", "documentary", "thinking", "minimal piano", "light pizzicato", "warm ambient", "investigation light", about 80–100 bpm, no vocals.
   - **Avoid:** "epic", "trailer", "dark", "suspense". That's the "dark dramatic history" look we ruled out.
   - **Closest references:**
     - Kurzgesagt's warm ambient synths;
     - TED-Ed's (Wonder Boy Audio) light orchestral plucks and mallets;
     - Johnny Harris's neutral "thinking music" under explanations.
3. **Use 2–3 signature tracks per video**, matched to the beats:
   - a curious bed for questions and exhibits;
   - a softer one for history and period rooms;
   - a sparse one for the reveal.
   Reuse a short "How We Ended Up" sting on the title wall, so the sound itself becomes part of the brand.
4. **Sound effects:**
   - Use library SFX for footsteps, the door, paper and the light switch, which the synth versions can't match. Epidemic and Artlist include them; [BigSoundBank](https://bigsoundbank.com) (CC0) is already used in this studio for free.
   - The synthesized kit stays as a fallback.

## How a downloaded track plugs in (ready now)
```
python -I tools/howwe_mix.py <scenes.json> <slug> --voice <voice.wav> --music audio/library/howwe/<track>.mp3
```
- The track is looped (2-second crossfade) or trimmed to the video length.
- It drops to 25% during the reveal and ducks under the voice.
- The mix is loudness-normalised.
- Keep every downloaded file plus its licence and source in `audio/LICENSES.md` (studio rule).
