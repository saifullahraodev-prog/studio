# studio

Code-driven pipeline for 3D-animated YouTube videos: "Rules written in disaster".

Common commands (run in this folder):

| What | Command |
|---|---|
| Open the live preview editor | `npm run studio` |
| Render one still | `npm run still -- ToonCubeTest out/test.png --frame=40` |
| Render 720p preview | `npm run render -- ToonCubeTest out/test-720.mp4` |
| Render 1080p final | `npm run render -- ToonCubeTest out/test-1080.mp4 --props=engine/presets/res-1080.json` |
| Contact sheet of a video | `python tools/contact_sheet.py out/test-1080.mp4` |
| WebGL / speed test | `npm run gltest` |
| Clean temp files | `npm run cleanup` |

See `CLAUDE.md` for locked decisions and `PROGRESS.md` for status.
