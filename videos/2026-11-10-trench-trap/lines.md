# "Trench Trap": built ONE NARRATION LINE AT A TIME (owner's new step, 2026-11-10)

Workflow for every line:
1. Owner gives the narration line + the scenes he wants under it.
2. I build the shots for that line only, render a short 720p clip of just that line (placeholder voice),
   and send it.
3. Owner approves or asks for changes. Approved lines are marked below and stay locked.
4. Next line. When all lines are approved, the owner records the voice for the whole script and
   I time everything to it (`--recording`) and render the full Short.

`scenes.txt` holds only the lines worked on so far (one [beat] per line).

| # | Narration | Scenes (owner) | Shots | Status |
|---|---|---|---|---|
| 1 | Enemy soldiers have you cornered in your own trench, (owner voice, CapCut take 0.00-2.62 s) | (a) enemies running toward you, guns in their hands; (b) you down in the trench, seeing enemies surround you | `enemies-close-in` -> camera dive (`tr=dive`) -> `you-trapped`; chubby mocap soldiers (ChubbyActor), real props | **APPROVED 2026-11-11** |
| 2 | so you make a plan. (owner voice, CapCut take 2.88-3.68 s) | owner: follow the reference -> its 5.2 s close-up: hero against the plank wall, sly squint, hand on chin | `you-plan-chin` (Standing Yell base + arm IK to the chin) | **APPROVED 2026-11-11** |
| 3 | One of them climbs up and hoses the trench with fire. (owner voice, CapCut take 4.08-6.68 s) | owner: follow the reference -> its 6.0-8.1 s: enemy leaps over the edge against the sky, close scowl, side-on flame blast, wall of fire down the trench | `flame-leap`, `flame-scowl`, `flame-fire-side`, `fire-wall` (ChubbyActor flamethrower: tanks, lance, jet) | **APPROVED 2026-11-11** |
| 4 | You scream, throw down your rifle, and stagger away like you've lost your mind. (owner voice, CapCut take 7.12-11.36 s) | owner: follow the reference -> its 8.7-10.1 s: low close scream with arms up, rifle dropped, staggering toward camera | `you-scream-low` (yell + arm targets), `you-drop-rifle`, `you-stagger-away` (Drunk Run) | **APPROVED 2026-11-11** |
| 5 | You duck around the corner, and go dead quiet. (owner voice, CapCut take 11.94-14.52 s) | owner: follow the reference -> its 10.8-12.0 s: panic act dropped, slips round the corner, sly hidden grin | `you-duck-corner` (Crouch Walk), `you-dead-quiet` (finger to lips) | **APPROVED 2026-11-11** |
| 6 | They think you're finished, so they charge in after you, (owner voice, CapCut take 15.06-17.5 s) | owner: follow the reference -> its 13.2-15.3 s: smug flamethrower close-up, grinning pack charging down the trench, rushing past | `they-think-smug`, `enemies-charge-down`, `enemies-rush-past` | preview sent, waiting |
