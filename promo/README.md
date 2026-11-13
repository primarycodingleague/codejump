# Launch video

`node promo/make.mjs` makes the 42-second launch video in three shapes (about 2½ minutes):

- `codejump-launch-vertical.mp4` 1080×1920: Reels, TikTok, Shorts, Stories
- `codejump-launch-square.mp4` 1080×1080: Instagram and Facebook feeds
- `codejump-launch-wide.mp4` 1920×1080: YouTube, X, LinkedIn, a website

The lab clips are the Teacher Guide's own (guide/media, real app). Words, clips and timings are in `make.mjs` (`LABS`, `spec`);
`composer.html` draws each frame (`render(t)`), `music.mjs` makes the backing track in code (ours, no licence needed).
One bar of music = 2 s = one lab, so keep scene lengths in whole bars. `node promo/make.mjs vertical still 9 26.5` saves test frames to `promo/out/`.
The lesson count on the teachers' slide is counted from `lessons/pics`. Not in the iPad offline list.
