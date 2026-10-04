# CodeJump: old address

CodeJump moved to **https://codejump.co.uk** (October 2026). This repo serves the old address,
codejump.primarycodingleague.co.uk, on GitHub Pages: every page (index.html and 404.html are the same file)
forwards to the same path on codejump.co.uk, keeping ?query and #hash so old share links still work.

If the browser has projects saved on the old address, it first offers to bring them across: it opens
codejump.co.uk with `?cjmove=1` and posts its localStorage to that window only; the app (build-and-play.html,
"Moving house" script) merges it (device saves by id, everything else only if missing).
