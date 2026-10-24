// Which shots make each step of a topic's video, and for how long (seconds). Captions come from the step text.
// Keep titles/subtitles in step with guide/topics.js (the page shows the same words).
export const SPECS = {
  collab: {
    title: 'Live collaboration', sub: 'Up to 6 pupils building one game together', outroText: 'Build together, live!',
    steps: [
      { n: 1, who: 'Everyone', title: 'Every pupil signs in', sub: 'Tap Cloud, then sign in with the login card.',
        beats: [['s1a', 2.3], ['s1b', 2.3], ['s1c', 2.3], ['s1d', 2.1, { type: 'look' }]] },
      { n: 2, who: 'One pupil', title: 'Open the team game and tap Share', sub: 'One pupil opens the game the team will build.',
        beats: [['s2', 3.2]] },
      { n: 3, who: 'One pupil', title: 'Choose Collaborate (live!)', sub: 'It only shows when the pupil is signed in.',
        beats: [['s3', 3.4]] },
      { n: 4, who: 'One pupil', title: 'Tick up to 5 teammates', sub: 'Press Start collaboration. Invite more by display name.',
        beats: [['s4a', 2.6], ['s4b', 2.8], ['s4c', 3]] },
      { n: 5, who: 'Teammates', title: 'Teammates join from Cloud', sub: 'Cloud → Collaborations, then tap the team’s game.',
        beats: [['s5a', 2.8], ['s5b', 2.8]] },
      { n: 6, who: 'Everyone', title: 'Build together, live', sub: 'Changes and coloured pointers appear at once. Tap Leave to finish.',
        beats: [['s6a', 3, { type: 'look', zoom: 1.5 }], ['s6b', 2.4]] }
    ]
  },
  turtle: {
    title: 'Turtle Lab', sub: 'Type Logo code and watch the turtle draw', outroText: 'Happy drawing!',
    steps: [
      { n: 1, who: 'Everyone', title: 'Start a Turtle Lab project', sub: 'Start building → Key Stage 2 → Turtle Lab.',
        beats: [['s1a', 2], ['s1b', 2], ['s1c', 2.2]] },
      { n: 2, who: 'Everyone', title: 'Type commands and press Run', sub: 'fd 100 goes forward 100 steps; rt 90 turns right.',
        beats: [['s2a', 2.6, { type: 'look' }], ['s2b', 2.6]] },
      { n: 3, who: 'Everyone', title: 'Repeat to make shapes', sub: 'repeat 4 [fd 150 rt 90] draws a square. A repeat inside a repeat makes a pattern.',
        beats: [['s3a', 2.8, { type: 'look' }], ['s3b', 2.8, { type: 'look' }]] },
      { n: 4, who: 'Everyone', title: 'Find ideas in Commands and Examples', sub: 'Every command explained, and examples to load and run.',
        beats: [['s4a', 2.6], ['s4b', 2.8]] },
      { n: 5, who: 'Everyone', title: 'Slow the turtle down', sub: 'The Speed slider shows each move, or draws at once.',
        beats: [['s5', 3]] },
      { n: 6, who: 'Everyone', title: 'Teach it your own command', sub: 'to star :size … end, then star 150.',
        beats: [['s6a', 2.8, { type: 'look' }], ['s6b', 2.6, { type: 'look' }]] }
    ]
  },
  stage: {
    title: 'Stage Lab', sub: 'Characters on a stage, coded with blocks', outroText: 'On with the show!',
    steps: [
      { n: 1, who: 'Everyone', title: 'Start a Stage Lab project', sub: 'Start building → Key Stage 2 → Stage Lab.',
        beats: [['s1a', 2], ['s1b', 2], ['s1c', 2.2]] },
      { n: 2, who: 'Everyone', title: 'Snap blocks together', sub: 'Drag blocks out of the coloured categories; they click into place.',
        beats: [['s2a', 2.6], ['s2b', 3, { type: 'look' }]] },
      { n: 3, who: 'Everyone', title: 'Press Run', sub: 'Every character runs its own blocks. Stop puts them back.',
        beats: [['s3a', 2.4], ['s3b', 2.4, { type: 'look' }], ['s3c', 2.2, { type: 'look' }]] },
      { n: 4, who: 'Everyone', title: 'Add characters and costumes', sub: 'Add makes a new character; Costume changes its look.',
        beats: [['s4a', 2.4], ['s4b', 3]] },
      { n: 5, who: 'Everyone', title: 'Choose a backdrop', sub: 'Backdrops → Choose a backdrop, or paint your own.',
        beats: [['s5a', 2.2], ['s5b', 2.6], ['s5c', 2.4, { type: 'look' }]] },
      { n: 6, who: 'Everyone', title: 'Key Stage 1: picture blocks', sub: 'Tap a picture block to add it after the green flag. No reading needed.',
        beats: [['s6a', 2.8], ['s6b', 2.8, { type: 'look' }]] }
    ]
  },
  platformer: {
    title: 'Platformer Lab', sub: 'Build, Play, Code and Design a platform game', outroText: 'Game on!',
    steps: [
      { n: 1, who: 'Everyone', title: 'Start a Platformer Lab project', sub: 'Start building → a key stage → Platformer Lab.',
        beats: [['s1a', 2], ['s1b', 2], ['s1c', 2.2]] },
      { n: 2, who: 'Everyone', title: 'Build: paint blocks on the grid', sub: 'Pick a block on the left, then tap or drag on the grid.',
        beats: [['s2a', 2.4], ['s2b', 2.8, { type: 'look' }]] },
      { n: 3, who: 'Everyone', title: 'Add a Start and a Finish', sub: 'Every game needs both before it can be played.',
        beats: [['s3', 3]] },
      { n: 4, who: 'Everyone', title: 'Play to test it', sub: 'Arrow keys to move, Space to jump. Tablets get buttons.',
        beats: [['s4a', 2.2], ['s4b', 2.8, { type: 'look' }]] },
      { n: 5, who: 'Everyone', title: 'Code the rules', sub: 'Snap blocks together: when I collect a gem, change score by 10.',
        beats: [['s5a', 2.2], ['s5b', 3, { type: 'look' }]] },
      { n: 6, who: 'Everyone', title: 'Design your own pictures', sub: 'Draw 16 × 16 pictures for the player, blocks and background.',
        beats: [['s6a', 2.2], ['s6b', 2.8, { type: 'look' }]] }
    ]
  },
  critter: {
    title: 'Critter Lab', sub: 'Build a 3D creature and test it with real physics', outroText: 'Ready, steady, scuttle!',
    steps: [
      { n: 1, who: 'Everyone', title: 'Start a Critter Lab project', sub: 'Start building → Key Stage 2 → Critter Lab.',
        beats: [['s1a', 2], ['s1b', 2], ['s1c', 2.2]] },
      { n: 2, who: 'Everyone', title: 'Drag parts onto the body', sub: 'Blobs and limbs stick where they touch. Legs come in pairs.',
        beats: [['s2a', 2.6], ['s2b', 3, { type: 'look' }]] },
      { n: 3, who: 'Everyone', title: 'Or start from a Starter Critter', sub: 'Four ready-made Critters that really move.',
        beats: [['s3a', 2.2], ['s3b', 2.6], ['s3c', 2.2, { type: 'look' }]] },
      { n: 4, who: 'Everyone', title: 'Choose a contest in Test it!', sub: 'Sprint, Hurdles, Block Push, High Jump, Lap, races and Sumo.',
        beats: [['s4a', 2.2], ['s4b', 2.6]] },
      { n: 5, who: 'Everyone', title: 'Press Go! and watch', sub: 'Real physics: nothing is scripted, so test, tweak and test again.',
        beats: [['s5a', 2.2], ['s5b', 2.4, { type: 'look' }], ['s5c', 2.6, { type: 'look' }]] },
      { n: 6, who: 'Everyone', title: 'Compare in Results', sub: 'Every test goes in a table, with a note of what you changed.',
        beats: [['s6a', 2.2], ['s6b', 3, { type: 'look' }]] }
    ]
  },
  world3d: {
    title: '3D World', sub: 'Build a 3D world with blocks, then play it', outroText: 'Time to play!',
    steps: [
      { n: 1, who: 'Everyone', title: 'Start a 3D World project', sub: 'Start building → Key Stage 2 → 3D World.',
        beats: [['s1a', 2], ['s1b', 2], ['s1c', 2.2]] },
      { n: 2, who: 'Everyone', title: 'Tap a thing to find its block', sub: 'Before Run the world shows how it starts. Tapping a thing lights up the block that made it.',
        beats: [['s2a', 2.6], ['s2b', 2.8, { type: 'look' }]] },
      { n: 3, who: 'Everyone', title: 'Drag its arrows to move it', sub: 'The new numbers are written back into its block.',
        beats: [['s3', 3.2]] },
      { n: 4, who: 'Everyone', title: 'Add characters, models and code', sub: 'Characters, Models, Events, Motion, Physics, Camera, Sound …',
        beats: [['s4a', 2.4], ['s4b', 2.8, { type: 'look' }]] },
      { n: 5, who: 'Everyone', title: 'Press Run to play', sub: 'Arrow keys walk, Space jumps, and the camera follows.',
        beats: [['s5a', 2.2], ['s5b', 2.8, { type: 'look' }]] },
      { n: 6, who: 'Everyone', title: 'Stop puts everything back', sub: 'Stop returns to the start, ready to change one thing and run again.',
        beats: [['s6a', 2.2], ['s6b', 2.6, { type: 'look' }]] }
    ]
  },
  ai: {
    title: 'AI Lab', sub: 'Teach a computer to recognise drawings or words', outroText: 'Your AI is ready!',
    steps: [
      { n: 1, who: 'Everyone', title: 'Start an AI Lab project', sub: 'Start building → Key Stage 2 → AI Lab.',
        beats: [['s1a', 2], ['s1b', 2], ['s1c', 2.2]] },
      { n: 2, who: 'Everyone', title: 'Make labels', sub: 'New label for each thing to recognise, or Ready-made examples.',
        beats: [['s2a', 2.4], ['s2b', 2.8, { type: 'look' }]] },
      { n: 3, who: 'Everyone', title: 'Draw examples and Add them', sub: 'Under the pad: what the computer sees, a 20 × 20 grid.',
        beats: [['s3a', 2.8, { type: 'look' }], ['s3b', 2.4]] },
      { n: 4, who: 'Everyone', title: 'Train it', sub: 'It practises, then is checked on drawings it never saw.',
        beats: [['s4a', 2.2], ['s4b', 3, { type: 'look' }]] },
      { n: 5, who: 'Everyone', title: 'Test it with a new drawing', sub: 'A bar for every label shows how sure it is.',
        beats: [['s5', 3.2, { type: 'look' }]] },
      { n: 6, who: 'Everyone', title: 'Code it', sub: 'Blocks react to its guesses. Press Run, then draw.',
        beats: [['s6a', 2.4], ['s6b', 3, { type: 'look' }]] }
    ]
  },
  train: {
    title: 'Train Lab', sub: 'A smart-train set to build and code', outroText: 'All aboard!',
    steps: [
      { n: 1, who: 'Everyone', title: 'Start a Train Lab project', sub: 'Start building → Key Stage 2 → Train Lab.',
        beats: [['s1a', 2], ['s1b', 2], ['s1c', 2.2]] },
      { n: 2, who: 'Everyone', title: 'Click track and snaps together', sub: 'Track pieces join end to end; colour snaps click into the slots.',
        beats: [['s2a', 2.6], ['s2b', 2.6]] },
      { n: 3, who: 'Everyone', title: 'Press Run: the trains obey the snaps', sub: 'With no code at all, trains follow snap commands like real smart trains.',
        beats: [['s3a', 2.2], ['s3b', 2.8, { type: 'look' }]] },
      { n: 4, who: 'Everyone', title: 'Add blocks for each train', sub: 'The same blocks as a real smart train, one category per train.',
        beats: [['s4a', 2.2], ['s4b', 2.8, { type: 'look' }]] },
      { n: 5, who: 'Everyone', title: 'Try a challenge', sub: 'Jobs for Train 1 tick off on the board as the train does them.',
        beats: [['s5a', 2.2], ['s5b', 2.6], ['s5c', 2.6, { type: 'look' }]] },
      { n: 6, who: 'Everyone', title: 'Print the challenge card', sub: 'Then build the same challenge with real smart-train track.',
        beats: [['s6', 3]] }
    ]
  },
  build: {
    title: 'Build Lab', sub: 'A block world to build in, and a robot helper to code', outroText: 'Happy building!',
    steps: [
      { n: 1, who: 'Everyone', title: 'Start a Build Lab project', sub: 'Start building → Key Stage 2 → Build Lab.',
        beats: [['s1a', 2], ['s1b', 2], ['s1c', 2.2]] },
      { n: 2, who: 'Everyone', title: 'Walk round and build by hand', sub: 'Pick a block, click to place it. W A S D to walk, F to fly.',
        beats: [['s2a', 2.4], ['s2b', 2.6, { type: 'look' }]] },
      { n: 3, who: 'Everyone', title: 'Code it and press Run', sub: 'Builder blocks build right / up / ahead of where you stand.',
        beats: [['s3a', 2.6, { type: 'look' }], ['s3b', 2.2], ['s3c', 2.6, { type: 'look' }]] },
      { n: 4, who: 'Everyone', title: 'See it as Python', sub: 'The Python tab is the same program, and edits turn back into blocks.',
        beats: [['s4a', 2.2], ['s4b', 3, { type: 'look' }]] },
      { n: 5, who: 'Everyone', title: 'Type a chat command', sub: 'tower 6 runs “when I type tower”, with the 6 in a variable.',
        beats: [['s5a', 2.6], ['s5b', 2.8, { type: 'look' }]] },
      { n: 6, who: 'Everyone', title: 'Open a ready-made world', sub: 'Worlds: the Robot Helper Academy lessons and example worlds.',
        beats: [['s6a', 2.2], ['s6b', 3]] }
    ]
  },
  robot: {
    title: 'Robot Lab', sub: 'Code a talking robot with blocks', outroText: 'Beep boop, well done!',
    steps: [
      { n: 1, who: 'Everyone', title: 'Start a Robot Lab project', sub: 'Start building → Key Stage 2 → Robot Lab.',
        beats: [['s1a', 2], ['s1b', 2], ['s1c', 2.2]] },
      { n: 2, who: 'Everyone', title: 'Name it and choose its colours', sub: 'The name goes on its plinth; Body and Trim change its colours.',
        beats: [['s2a', 2.4], ['s2b', 2.4]] },
      { n: 3, who: 'Everyone', title: 'Snap blocks together', sub: 'Moves, faces, lights, speech, sensing, loops and variables.',
        beats: [['s3', 3, { type: 'look' }]] },
      { n: 4, who: 'Everyone', title: 'Press Run', sub: 'It talks with the browser’s own voice. Nothing is recorded or sent.',
        beats: [['s4a', 2.2], ['s4b', 2.8, { type: 'look' }]] },
      { n: 5, who: 'Everyone', title: 'Tap the robot', sub: '“When the robot is tapped” scripts react to a tap.',
        beats: [['s5a', 2.4], ['s5b', 2.6, { type: 'look' }]] },
      { n: 6, who: 'Everyone', title: 'Ask a question', sub: '“ask and wait” shows a box; the answer block holds what was typed.',
        beats: [['s6a', 2.6, { type: 'look' }], ['s6b', 2.4], ['s6c', 2.6, { type: 'look' }]] }
    ]
  }
};
