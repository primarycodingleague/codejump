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
  }
};
