# PROGRESS

## Current phase: Phase 1 (Setup), waiting at GATE 1

### Done (Phase 1, 2026-11-08)
- Toolchain verified: Node 24.22 (LTS), npm 11, Python 3.12.10, FFmpeg 9.0.2, Git 2.56,
  faster-whisper 1.2.1 (already installed).
- Remotion 4.0.541 + @remotion/three + three 0.180 + react-three-fiber 9.3 installed.
  Chrome Headless Shell (131 MB) downloaded by Remotion.
- Remotion official agent skills installed (`.agents/skills`).
- Folder structure created; git repo initialised; first commit.
- WebGL test across 6 GL modes: **all work**. `angle` uses the Intel UHD GPU (hardware);
  the rest use software rendering.
- 5-second test scene (spinning toon cube + caption + keyword) rendered at 720p and 1080p.
- Tools: `tools/run.mjs` (keeps temp on D:), `tools/cleanup.mjs`, `tools/contact_sheet.py`,
  `tools/gltest.mjs`, `tools/stresstest.mjs`.

### Measured render speed
| Test | Result |
|---|---|
| Toon cube, 150 frames (5 s), 1080p | 15.7 s total (incl. ~7 s startup) |
| Stress scene (400 objects, ~1.6M triangles, shadows), 60 frames 1080p, angle, 2 workers | ~13 s total → ~0.1 s/frame steady |
| Same, 1 / 2 / 4 workers | 15.1 / 12.9 / 13.4 s |
| Estimate: 40 s Short at 1080p | ~3–6 min |
| Estimate: 10 min video at 1080p | ~30–90 min (scene-dependent) |

### Next (Phase 2: style creation)
1. The Inspector: 3 face-panel variants (stills), then turnaround.
2. Face system: 8 expressions + 5 mouth shapes.
3. Ship-deck world with 4 lighting presets.
4. Real caption system.
5. 4 style-test stills → GATE 2.

### GitHub
- Private repo: https://github.com/saifullahraodev-prog/studio (GitHub CLI 2.103.3 installed and signed in).

### Open decisions (owner)
- Optional speed-up: make headless Chrome use the NVIDIA Quadro P620 (Windows Settings →
  Display → Graphics → add `chrome-headless-shell.exe` → High performance). Owner must do this;
  then I re-run `npm run gltest`.
