// The Teacher Guide's topics, as data. The app (build-and-play.html, "TEACHER GUIDE dashboard") builds every page from this file.
// A topic is either:
//   • text-only: its words come from the old guide (teacherGuideHTML() in the app), found by the h3 headings in `legacy`;
//   • converted: it also has summary / before / video / steps / tips. Its old text stays under "Full notes".
// Media paths are relative to this folder (guide/). Make media with guide/tools (see its README).
// To add a converted topic: capture shots, render, then fill in the fields below. No markup needed.

export const GROUPS = ['Getting started', 'The labs', 'Coding', 'Your class', 'Help & safety'];

// who chips (keys used in steps)
export const WHO = { all: 'Everyone', one: 'One pupil', mates: 'Teammates', teacher: 'Teacher' };

export const TOPICS = [
  // Getting started
  { id: 'what', group: 0, title: 'What is CodeJump?', legacy: ['What is CodeJump?'] },
  {
    id: 'modes', group: 0, title: 'Platformer Lab: the four modes', legacy: ['The four modes'],
    summary: 'The Platformer Lab is the original CodeJump: pupils build a level on a grid, play it, code its rules with blocks and draw their own pictures, all on one screen.',
    video: { src: 'media/platformer/full.mp4', poster: 'media/platformer/full.jpg', captions: 'media/platformer/full.vtt', length: 34.4 },
    steps: [
      { who: 'all', title: 'Start a Platformer Lab project', text: 'Press Start building, choose the key stage, then Platformer Lab.', clip: 'media/platformer/step1', at: 2.4 },
      { who: 'all', title: 'Build: paint blocks on the grid', text: 'Pick a block on the left, then tap or drag on the 20 × 12 grid. Fill Row, Erase, Undo and Clear help.', clip: 'media/platformer/step2', at: 8.6 },
      { who: 'all', title: 'Add a Start and a Finish', text: 'Every game needs a Start and a Finish before it can be played or shared.', clip: 'media/platformer/step3', at: 13.8 },
      { who: 'all', title: 'Play to test it', text: 'Press Play: arrow keys move, Space jumps, and tablets get on-screen buttons.', clip: 'media/platformer/step4', at: 16.8 },
      { who: 'all', title: 'Code the rules', text: 'Press Code and snap blocks together, such as when I collect a gem → change score by 10.', clip: 'media/platformer/step5', at: 21.8 },
      { who: 'all', title: 'Design your own pictures', text: 'Press Design to draw 16 × 16 pictures for the player, the blocks, keys and the background.', clip: 'media/platformer/step6', at: 27 }
    ],
    tips: [
      'This Page tests just the page you are building, handy in levels with several pages.',
      'Key Stage 1 gets a smaller, friendlier set of blocks; Key Stage 3 writes Python-style code instead of blocks.',
      'The Sky Isles Explorers unit has 24 ready-made Platformer Lab lessons for Years 1–6 (Ready-made lessons).'
    ]
  },
  { id: 'keystages', group: 0, title: 'Key Stage 1, 2 and 3', legacy: ['Key Stage 1 vs Key Stage 2'] },
  { id: 'size', group: 0, title: 'Game size', legacy: ['Game size'] },
  // The labs
  {
    id: 'stage', group: 1, title: 'Stage Lab', legacy: ['The Platformer Lab, Stage Lab'],
    summary: 'Characters (sprites) on a stage, brought to life with snap-together blocks. Key Stage 2 and 3 get nearly the whole Scratch-style palette; Key Stage 1 gets big picture blocks.',
    video: { src: 'media/stage/full.mp4', poster: 'media/stage/full.jpg', captions: 'media/stage/full.vtt', length: 41.8 },
    steps: [
      { who: 'all', title: 'Start a Stage Lab project', text: 'Press Start building, choose the key stage, then Stage Lab.', clip: 'media/stage/step1', at: 2.4 },
      { who: 'all', title: 'Snap blocks together', text: 'Pick a category (Motion, Looks, Events …) and drag blocks under a “when green flag clicked” hat until they click together.', clip: 'media/stage/step2', at: 8.6 },
      { who: 'all', title: 'Press Run', text: 'Every character runs its own blocks at once; Stop puts them back where they started.', clip: 'media/stage/step3', at: 14.2 },
      { who: 'all', title: 'Add characters and costumes', text: 'Add makes a new character; Costume picks its look and colour, or opens the paint editor.', clip: 'media/stage/step4', at: 21.2 },
      { who: 'all', title: 'Choose a backdrop', text: 'Backdrops → Choose a backdrop gives seven ready-made scenes; you can also paint one or pick a solid colour.', clip: 'media/stage/step5', at: 26.6 },
      { who: 'all', title: 'Key Stage 1: picture blocks', text: 'Younger pupils tap big picture blocks that join left to right after a start block, then press Go. No reading needed.', clip: 'media/stage/step6', at: 33.8 }
    ],
    tips: [
      'Hover over (or press and hold) any Stage block to see what it does, in every key stage.',
      'Give a character the micro:bit costume for an on-screen micro:bit: LEDs, A and B buttons, shake, sensors, music and radio. No hardware needed.',
      'The Lantern Street Theatre unit has 24 ready-made Stage Lab lessons for Years 1–6 (Ready-made lessons).',
      'The paint editor works like a real drawing app: shapes you can recolour, move, reshape and layer, a colour wheel, gradients and an eyedropper.'
    ]
  },
  {
    id: 'turtle', group: 1, title: 'Turtle Lab (Logo)', legacy: ['Turtle Lab (Logo)'],
    summary: 'Pupils type Logo commands on the left and a turtle draws them on the right. A gentle bridge from blocks to typed code, full of maths: angles, repeats and shapes.',
    before: 'The Turtle Lab is for Key Stage 2 upward (it isn’t offered for Key Stage 1, because it needs typing). Nothing to set up.',
    video: { src: 'media/turtle/full.mp4', poster: 'media/turtle/full.jpg', captions: 'media/turtle/full.vtt', length: 35.6 },
    steps: [
      { who: 'all', title: 'Start a Turtle Lab project', text: 'Press Start building, choose Key Stage 2, then Turtle Lab. It opens empty, ready to type.', clip: 'media/turtle/step1', at: 2.4 },
      { who: 'all', title: 'Type commands and press Run', text: 'fd 100 moves forward 100 steps and rt 90 turns right; press Run to draw, Stop or Clear to start again.', clip: 'media/turtle/step2', at: 8.6 },
      { who: 'all', title: 'Repeat to make shapes', text: 'repeat 4 [fd 150 rt 90] draws a square, and a repeat inside a repeat makes a pattern.', clip: 'media/turtle/step3', at: 13.8 },
      { who: 'all', title: 'Find ideas in Commands and Examples', text: 'Commands explains every command; Examples loads a ready-made drawing to run and change.', clip: 'media/turtle/step4', at: 19.4 },
      { who: 'all', title: 'Slow the turtle down', text: 'Drag the Speed slider down to watch each move, or up to draw at once.', clip: 'media/turtle/step5', at: 24.8 },
      { who: 'all', title: 'Teach it your own command', text: 'to star :size … end makes a new command; then star 150 and star 60 draw two sizes.', clip: 'media/turtle/step6', at: 27.8 }
    ],
    tips: [
      'It also knows pu / pd, setpencolor, setpensize, setbg, setxy, seth, home, if / ifelse, make "x with :x, sums and random.',
      'Mistakes get a friendly message, such as I don’t understand "x" or a missing ] or end.',
      'The Driftwood Bay Artists unit has 18 ready-made Turtle Lab lessons for Years 3–6 (Ready-made lessons).',
      'Teammates can type one drawing together live (Share → Collaborate).'
    ]
  },
  {
    id: 'critter', group: 1, title: 'Critter Lab', legacy: ['Critter Lab'],
    summary: 'Pupils build a 3D creature from blobs and limbs, then test it in contests with real physics. Nothing is scripted, so they learn by predicting, testing and tweaking.',
    before: 'Key Stage 2 and 3 only. The 3D engine downloads the first time a Critter opens, so that needs the internet, and the computer needs 3D graphics (WebGL).',
    video: { src: 'media/critter/full.mp4', poster: 'media/critter/full.jpg', captions: 'media/critter/full.vtt', length: 40.8 },
    steps: [
      { who: 'all', title: 'Start a Critter Lab project', text: 'Press Start building, choose Key Stage 2 (or 3), then Critter Lab.', clip: 'media/critter/step1', at: 2.4 },
      { who: 'all', title: 'Drag parts onto the body', text: 'Drag blobs and limbs from the left onto the Critter; they stick where they touch, and legs are added in pairs.', clip: 'media/critter/step2', at: 8.6 },
      { who: 'all', title: 'Or start from a Starter Critter', text: 'Starter Critters gives four ready-made Critters (Scuttler, Crab, Wriggler, Hopper) that really move.', clip: 'media/critter/step3', at: 14.2 },
      { who: 'all', title: 'Choose a contest in Test it!', text: 'Press Test it! and pick a contest: Sprint, Hurdles, Block Push, High Jump, Lap, Head-to-head, Super Sumo or Free roam.', clip: 'media/critter/step4', at: 21.2 },
      { who: 'all', title: 'Press Go! and watch', text: 'The Critter heads for the red target under real physics; Turbo speeds it up, and the best score is kept.', clip: 'media/critter/step5', at: 26 },
      { who: 'all', title: 'Compare in Results', text: 'Results lists every finished test with a note box for what was changed, plus a bar chart per contest.', clip: 'media/critter/step6', at: 33.2 }
    ],
    tips: [
      'Guides plays three short captioned videos that take pupils from an empty body to a walking Critter. Good as a lesson starter on the board.',
      '3D print downloads the Critter as STL or 3MF (8, 12 or 16 cm), made in the browser; nothing is uploaded.',
      'Critter Showdown races up to four pupils’ Critters live on your screen (Cloud → Teacher, choose the class, Critter Showdown).',
      'The Critter Workshop unit has 18 ready-made lessons for Years 3–6 (Ready-made lessons).'
    ]
  },
  {
    id: 'world3d', group: 1, title: '3D World', legacy: ['3D World'],
    summary: 'A block-coded 3D scene and game builder: shapes, characters and models, brought to life with events, motion, loops, sensing, variables, sound and real physics.',
    before: 'Key Stage 2 and 3. The 3D engine and models download the first time a 3D project opens (about 1 MB to start), so that needs the internet, and the computer needs 3D graphics (WebGL).',
    video: { src: 'media/world3d/full.mp4', poster: 'media/world3d/full.jpg', captions: 'media/world3d/full.vtt', length: 34.6 },
    steps: [
      { who: 'all', title: 'Start a 3D World project', text: 'Press Start building, choose Key Stage 2 (or 3), then 3D World.', clip: 'media/world3d/step1', at: 2.4 },
      { who: 'all', title: 'Tap a thing to find its block', text: 'Before Run, the world shows how it starts; tapping a thing lights up the block that made it.', clip: 'media/world3d/step2', at: 8.6 },
      { who: 'all', title: 'Drag its arrows to move it', text: 'Dragging the arrows (or the Resize handles) writes the new numbers straight back into that block.', clip: 'media/world3d/step3', at: 14 },
      { who: 'all', title: 'Add characters, models and code', text: 'Pick a category such as Characters (12, recolourable, 42 animations) or Models (73 ready-made things) and drag blocks in.', clip: 'media/world3d/step4', at: 17.2 },
      { who: 'all', title: 'Press Run to play', text: 'Run plays the world: with a “control with the arrow keys” block, arrow keys walk, Space jumps and the camera follows.', clip: 'media/world3d/step5', at: 22.4 },
      { who: 'all', title: 'Stop puts everything back', text: 'Stop returns the world to how it starts, ready to change one thing and run it again.', clip: 'media/world3d/step6', at: 27.4 }
    ],
    tips: [
      'The Park Designers unit has 24 ready-made lessons for Years 3–6, each with a Goals checklist that ticks itself as pupils work.',
      'Teammates can build one world together live (Share → Collaborate); Run plays on each pupil’s own screen.',
      'The characters and models come from Kenney’s free CC0 packs, so schools can use them freely, and they are light enough for Chromebooks.'
    ]
  },
  {
    id: 'ai', group: 1, title: 'AI Lab', legacy: ['AI Lab'],
    summary: 'Pupils teach a computer to recognise their own drawings or words (machine learning), test how well it learned, then use it in a block-coded game.',
    before: 'Key Stage 2 and 3. Drawings and typed words only: no camera, no microphone, and training happens in the browser.',
    video: { src: 'media/ai/full.mp4', poster: 'media/ai/full.jpg', captions: 'media/ai/full.vtt', length: 35.2 },
    steps: [
      { who: 'all', title: 'Start an AI Lab project', text: 'Press Start building, choose Key Stage 2 (or 3), then AI Lab.', clip: 'media/ai/step1', at: 2.4 },
      { who: 'all', title: 'Make labels', text: 'Choose Drawings or Words, then make 2–6 labels with New label, or load a Ready-made examples set.', clip: 'media/ai/step2', at: 8.6 },
      { who: 'all', title: 'Draw examples and Add them', text: 'Draw on the pad and press Add; under the pad pupils see what the computer sees, a 20 × 20 grid.', clip: 'media/ai/step3', at: 13.8 },
      { who: 'all', title: 'Train it', text: 'On Train & test press Train; when every label has 4 or more examples it is also checked on drawings it never practised with.', clip: 'media/ai/step4', at: 19 },
      { who: 'all', title: 'Test it with a new drawing', text: 'Draw something new: a bar for every label shows how sure it is, plus the examples it thinks are most alike.', clip: 'media/ai/step5', at: 24.2 },
      { who: 'all', title: 'Code it', text: 'On Code it, blocks such as “when the AI makes a guess” react to its guesses; press Run, then draw.', clip: 'media/ai/step6', at: 27.4 }
    ],
    tips: [
      'Big ideas: it finds patterns in examples rather than following rules, more varied examples help, and it gives a confidence, not a certainty.',
      'The Kind or unkind messages set is deliberately unbalanced, to show bias: “I love your drawing” comes out unkind.',
      'The Wildwood Spotters unit has 18 ready-made AI Lab lessons for Years 3–6 (Ready-made lessons).',
      'A team can teach and code one AI together live (Share → Collaborate).'
    ]
  },
  {
    id: 'train', group: 1, title: 'Train Lab', legacy: ['Train Lab'],
    summary: 'A smart-train set to build and code. With no code at all the trains obey colour snaps on the track; then pupils add blocks that carry straight over to real smart trains.',
    before: 'Key Stage 2 and 3. Real smart trains and track are optional: everything works on screen, and challenge cards can be printed to build with real track.',
    video: { src: 'media/train/full.mp4', poster: 'media/train/full.jpg', captions: 'media/train/full.vtt', length: 36.6 },
    steps: [
      { who: 'all', title: 'Start a Train Lab project', text: 'Press Start building, choose Key Stage 2 (or 3), then Train Lab. It opens with a track to change.', clip: 'media/train/step1', at: 2.4 },
      { who: 'all', title: 'Click track and snaps together', text: 'Track pieces (straights, curves, splits, crossings) click onto open ends; colour snaps click into the slots.', clip: 'media/train/step2', at: 8.6 },
      { who: 'all', title: 'Press Run: the trains obey the snaps', text: 'With no code, trains set off and follow snap commands such as white-red (stop for 2 seconds), and choose a way at each split.', clip: 'media/train/step3', at: 13.8 },
      { who: 'all', title: 'Add blocks for each train', text: 'Each train has its own block category (drive, pause, lights, split decisions, snap and colour events), as on a real smart train.', clip: 'media/train/step4', at: 18.8 },
      { who: 'all', title: 'Try a challenge', text: 'Challenges has four ready-made ones (levels 1–3), or make your own: jobs for Train 1 tick off on the board as it does them.', clip: 'media/train/step5', at: 23.8 },
      { who: 'all', title: 'Print the challenge card', text: 'Print the challenge card shows the track, the jobs and the pieces needed; tick the option for an answer card with the snaps.', clip: 'media/train/step6', at: 31.2 }
    ],
    tips: [
      'Trains can pull a wagon, leave it at a white-yellow snap and collect it by reversing into it (the magnet is at the back).',
      'The Places tool puts signs beside the track; the Order tool numbers them for a route.',
      'The Brindlewick Railway unit has 18 ready-made Train Lab lessons for Years 3–6 (Ready-made lessons).',
      'While a program runs, its variables show in the top-right corner of the board.'
    ]
  },
  { id: 'build', group: 1, title: 'Build Lab', legacy: ['Build Lab'] },
  { id: 'robot', group: 1, title: 'Robot Lab', legacy: ['Robot Lab'] },
  // Coding
  { id: 'tiles', group: 2, title: 'Every block & tile', legacy: ['Every block'] },
  { id: 'blocks', group: 2, title: 'Coding blocks (Key Stage 2)', legacy: ['Coding blocks'] },
  { id: 'python', group: 2, title: 'Text coding (Key Stage 3)', legacy: ['Key Stage 3'] },
  // Your class
  { id: 'lessons', group: 3, title: 'Ready-made lessons', legacy: ['Ready-made lessons'] },
  { id: 'running', group: 3, title: 'Running a lesson', legacy: ['Running a lesson'] },
  { id: 'cloud', group: 3, title: 'Cloud save & classes', legacy: ['Cloud save'] },
  { id: 'classes', group: 3, title: 'Managing your classes', legacy: ['Managing your classes'] },
  {
    id: 'collab', group: 3, title: 'Live collaboration', legacy: ['Live collaboration'],
    summary: 'Up to 6 pupils can work on the same CodeJump project at the same time, each on their own device. Ideal for League teams of up to six.',
    before: 'Every pupil needs a CodeJump class login. Collaborate only appears in the Share menu when a pupil is signed in. Set up a class in Teacher Hub → My classes and print the login cards first.',
    video: { src: 'media/collab/full.mp4', poster: 'media/collab/full.jpg', captions: 'media/collab/full.vtt', length: 39.8 },
    steps: [
      { who: 'all', title: 'Every pupil signs in', text: 'Tap Cloud, then sign in with the display name and password from the login card.', clip: 'media/collab/step1', at: 2.4 },
      { who: 'one', title: 'Open the team game and tap Share', text: 'One pupil opens the game the team will build and taps Share (a Platformer game needs a Start and a Finish first).', clip: 'media/collab/step2', at: 11.4 },
      { who: 'one', title: 'Choose Collaborate (live!)', text: 'It is only shown when the pupil is signed in.', clip: 'media/collab/step3', at: 14.6 },
      { who: 'one', title: 'Tick up to 5 teammates', text: 'Pick the class, tick up to 5 classmates and press Start collaboration; more can be invited by display name.', clip: 'media/collab/step4', at: 18 },
      { who: 'mates', title: 'Teammates join from Cloud', text: 'Cloud → Collaborations, then tap the team’s game.', clip: 'media/collab/step5', at: 26.4 },
      { who: 'all', title: 'Build together, live', text: 'Blocks, code and coloured pointers appear on every screen at once; tap Leave to finish.', clip: 'media/collab/step6', at: 32 }
    ],
    tips: [
      'A room holds 6 people. A seventh sees “That live room is full”.',
      'Play, Run and Test it! only play on each pupil’s own screen, so everyone can test without stopping the others.',
      'Works in every lab: the Platformer, Stage, Turtle, Build, Critter, AI, Train and Robot Labs and the 3D World. In the Build Lab teammates also see each other walking round the world.',
      'Not in a class with anyone yet? The pupil can still press Start a live game and invite teammates by display name.'
    ]
  },
  // Help & safety
  { id: 'safety', group: 4, title: 'Saving, sharing & safety', legacy: ['Saving, sharing'] },
  { id: 'a11y', group: 4, title: 'Accessibility', legacy: ['Accessibility'] },
  { id: 'ipad', group: 4, title: 'iPads without Wi-Fi', legacy: ['iPads without Wi-Fi'] },
  { id: 'trouble', group: 4, title: 'Troubleshooting', legacy: ['Troubleshooting'] },
  { id: 'curriculum', group: 4, title: 'Curriculum links', legacy: ['Curriculum links'] }
];

export const topic = id => TOPICS.find(t => t.id === id) || null;
export const converted = t => !!(t && t.steps && t.steps.length);
