# Storyboard rules: action first (review 2, 2026-11-10)

Every shot is **someone doing something**: subject + verb + object.

| Weak (avoid) | Strong (use) |
|---|---|
| stoker looks shocked | stoker **drops** his shovel and **runs** for the stairs |
| crowd on deck | crowd **surges** to the rail; an officer **shoves** a man back |
| "20 BOATS" label | a sailor **cranks** a davit; the boat **lurches** down the side |
| Inspector talks | Inspector **slams** the rulebook on the crate |

## Rules
1. **At least 4 in 5 shots have an action** (`do=` on the cut, or a template that is an action).
   Reaction close-ups (a face and nothing else) are at most **1 in 5**, and never two in a row.
2. **Bodies travel.** In most shots something moves through the frame: a run, jump, stumble, push,
   climb, a boat lowering, a crowd surging.
3. **Hands hold things.** Oars, lanterns, life jackets, rope, rockets, binoculars, telegrams. A held
   prop gets used (rowed, swung, thrown, fired, dropped).
4. **Cause, then effect.** Show the push, then the fall; the bell, then the turn; the order, then the
   crowd moving.
5. **Numbers are objects.** Show the 20 boats being lowered next to the crowd, not just a label.
6. **Layer the frame**: foreground thing / character / busy background (sets and framing work, coming next).

## Checker
`python -I tools/build_video.py <video>` prints a storyboard report: the share of action shots, reaction
close-ups and back-to-back reactions. It warns when a rule is broken.
