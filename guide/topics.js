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
  { id: 'modes', group: 0, title: 'The four modes', legacy: ['The four modes'] },
  { id: 'keystages', group: 0, title: 'Key Stage 1, 2 and 3', legacy: ['Key Stage 1 vs Key Stage 2'] },
  { id: 'size', group: 0, title: 'Game size', legacy: ['Game size'] },
  // The labs
  { id: 'stage', group: 1, title: 'Platformer, Stage & Turtle Labs', legacy: ['The Platformer Lab, Stage Lab'] },
  { id: 'turtle', group: 1, title: 'Turtle Lab (Logo)', legacy: ['Turtle Lab (Logo)'] },
  { id: 'critter', group: 1, title: 'Critter Lab', legacy: ['Critter Lab'] },
  { id: 'world3d', group: 1, title: '3D World', legacy: ['3D World'] },
  { id: 'ai', group: 1, title: 'AI Lab', legacy: ['AI Lab'] },
  { id: 'train', group: 1, title: 'Train Lab', legacy: ['Train Lab'] },
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
