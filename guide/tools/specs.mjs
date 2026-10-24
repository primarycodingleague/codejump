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
  }
};
