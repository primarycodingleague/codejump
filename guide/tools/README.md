# Teacher Guide video tools

The Teacher Guide (build-and-play.html, "TEACHER GUIDE dashboard") shows each converted topic as step cards with a silent loop per step,
plus one full captioned video with chapters. The words live in `guide/topics.js`; the media in `guide/media/<topic>/`.

Everything is made from the real app on this machine. No real accounts and no live cloud: the capture scripts stub the cloud in
the page (`stubCloud` in lib.mjs) and block every outside request. Sample pupils are made up (rocket-ray, pixel-fox, jump-ace, code-comet,
star-byte, lava-leap).

## Make a topic

1. **Capture**: `node guide/tools/capture-<topic>.mjs` drives the real UI functions and saves screenshots (1280×720 at device scale 1.5)
   with the box of the thing to point at, into `guide/tools/out/<topic>/` (`shots.json`). The out folder is not committed.
2. **Describe the video**: add the topic to `specs.mjs`, listing which shots make each step and how long each is on screen.
   Add `{ type: 'look' }` when nothing is clicked, and `zoom` to zoom closer.
3. **Render**: `node guide/tools/render.mjs <topic>`. `composer.html` draws each frame with a deterministic `render(t)`: a slow zoom
   towards the target, a gold ring, a pointer that clicks it, and a caption bar (step badge, title, subtitle, who). Frames are taken at
   25 fps with Playwright screenshots and piped into ffmpeg (H.264, `-preset veryfast`, yuv420p, `+faststart`):
   - `full.mp4`: 1280×720, captions, CRF 20, with title cards; `full.jpg` poster; `full.vtt` captions as text; `timing.json` (length + step starts)
   - `step<n>.mp4`: 960×540, no captions, CRF 26 (raised by 2 until it is under 450 KB, up to 32); `step<n>.jpg` poster (also the still picture for reduced motion)
4. **Add the data** to `guide/topics.js`: summary, before, video, steps (`at` = the step's start from timing.json), tips.
   `tests/guide.test.mjs` checks the times match the video and every file exists.

Needs ffmpeg and the Playwright Chromium from `tests/` (`cd tests && npm ci`). Fonts: Montserrat (OFL, `fonts/`).
The guide's media are not in the iPad offline list (offline the guide shows the step text alone).
