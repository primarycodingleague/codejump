// The Stage Lab's lesson unit — see lessons/units/README.md. lessons.js merges it in.
// LANTERN STREET THEATRE: a little theatre on Lantern Street, run by a cast of animal friends — Pip the cat (the star),
// Bramble the bear, Dot the bird (the singer), Bun the bunny (the dancer), Biscuit the dog (the ticket booth) and Bolt the
// robot (the stage manager). Pupils rehearse, put on a puppet show, run games night in the foyer and stage the grand show.
// Block 1 First rehearsals (Years 1–2, picture blocks) · Block 2 The puppet show (Years 3–4) · Block 3 Games night (Years 4–5)
// · Block 4 The grand show (Years 5–6). Lesson 6 of each block is a design-and-make project. Five earlier Stage Lab lessons are
// folded in with { adopt }. Starters + answers: lessons/builds/theatre/theatre.mjs; test: tests/unit-stage.test.mjs.
const N = 'Lantern Street Theatre';
const u = (b, m) => `${N} · Block ${b} · Lesson ${m}`;
const KS1 = { ks: 'ks1', years: 'Years 1–2', minutes: 60, type: 'stage', tool: 'Stage Lab (picture blocks)' };
const B2 = { ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'stage', tool: 'Stage Lab (blocks)' };
const B3 = { ks: 'ks2', years: 'Years 4–5', minutes: 60, type: 'stage', tool: 'Stage Lab (blocks)' };
const B4 = { ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'stage', tool: 'Stage Lab (blocks)' };
const DEV = ['A device per pupil or pair, with CodeJump open', 'The board, to show the class'];

export const LESSONS = [
  // ═══════════════════════ BLOCK 1 · FIRST REHEARSALS (Years 1–2, picture blocks) ═══════════════════════
  {
    adopt: 'cat-to-star', unit: u(1, 1), minutes: 60, tool: 'Stage Lab (picture blocks)',
    summary: 'The first Lantern Street Theatre lesson. Pip the cat must walk to the star on the stage. Pupils give a “robot” exact instructions, then write their first algorithm: a flag block and a move block, changing the number until Pip reaches the star.',
    plan: [
      { min: 5, title: 'Welcome to Lantern Street Theatre', html: '<p>Tell the class that this year they will help a little theatre on Lantern Street. A cast of animal friends — Pip the cat, Bramble the bear, Dot the bird, Bun the bunny and Bolt the robot — are getting ready for their shows, and the class will write the programs that make them act. Today: Pip learns to walk to his spot on the stage.</p>' },
      { min: 10, title: 'Warm up: be a robot', html: '<p>Choose a pupil to be the “robot”. Give exact instructions to walk to the door: “Take 3 steps forward. Turn right.” Then give a vague one (“Go over there”). <b>Ask:</b> which instructions worked? Why do computers need exact steps?</p><p>Introduce the word <b>algorithm</b>: a set of steps in the right order. Write “Pip’s algorithm” on the board with an arrow for each step.</p>' },
      { min: 10, title: 'Show me', html: '<p>On the board, open the lesson (<b>Open the starter</b>). Point out Pip and the star. Tap the yellow <b>Start</b> tab and tap the <b>flag</b> block, then tap the blue <b>Move</b> tab and tap the <b>move right</b> arrow. Press <b>GO</b>. Pip moves one step.</p><p><b>Ask:</b> how many steps do we need? Count the steps together. Change the number on the block (tap + or −) and press GO again.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils work through the <b>Lesson</b> card in the corner of the screen (it can read itself aloud). Most will reach the star in a few tries — praise the trying and fixing.</p><p>Circulate and ask: “What will happen if you press GO now?” <b>before</b> they press it. Early finishers drag the star somewhere new and change their program to reach it.</p>' },
      { min: 10, title: 'Share', html: '<p>Two or three pupils show their program on the board. Read each one aloud as an algorithm: “When GO is pressed, move right 5, then say I did it!”. <b>Ask:</b> did anyone use a different number of blocks to get there? Next lesson: Bun the bunny climbs the steps up to the stage.</p>' }
    ]
  },
  {
    id: 'theatre-2-steps', unit: u(1, 2), title: 'Up to the stage', ...KS1,
    summary: 'Bun the bunny has to climb the steps to reach the spotlight star on the stage. Pupils plan an algorithm with arrow cards first — right, then up, then right again — and then build the longer program with move blocks.',
    objective: 'We are learning to plan an algorithm with steps in more than one direction, and turn it into a program.',
    success: ['I can plan the steps with arrow cards before I code.', 'I can use move blocks that go right and up.', 'I can put my blocks in the same order as my plan.'],
    curriculum: ['alg', 'create1'],
    words: [['algorithm', 'a set of steps in the right order'], ['plan', 'working out the steps before you start'], ['sequence', 'the order the steps go in'], ['direction', 'which way something moves: right, left, up or down']],
    need: [...DEV, 'Arrow cards (right, left, up, down) — a set per pair', 'Squared paper or a floor grid for the warm-up (optional)'],
    plan: [
      { min: 8, title: 'Warm up: arrow walk', html: '<p>Draw a 5 × 5 grid on the board (or use floor squares). Put a “star” in one square and a pupil in another. Hold up arrow cards one by one (→ → ↑ ↑ →) and the pupil follows them. <b>Ask:</b> how many cards did we need? Could we have used fewer?</p><p>Remind pupils: an <b>algorithm</b> is a set of steps in order. Today the steps go in more than one direction.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter. Bun is at the bottom of the steps; the spotlight star is up on the stage. Bun already has a program: the <b>flag</b> and <b>move right 2</b>. Press <b>GO</b>: Bun walks to the bottom of the steps and stops.</p><p><b>Ask:</b> which way must Bun go next? How many? Count the steps together (3 up, then 3 right). Lay out the arrow cards on the table: → → ↑ ↑ ↑ → → →.</p>' },
      { min: 7, title: 'Plan it', html: '<p>Pairs plan Bun’s whole route with their arrow cards before they touch the screen. Each pair shows you their plan. Ask: “Read your algorithm to me.”</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: add <b>move up</b> (set it to 3) and another <b>move right</b> (set it to 3), then press GO. They compare what Bun does with their arrow cards.</p><p>Common bugs: up and down mixed up; the second move right still says 1; blocks added to a new strip instead of after the flag (tap the strip to choose it first). Answer: flag, move right 2, move up 3, move right 3.</p>' },
      { min: 10, title: 'Share and think', html: '<p>Read a finished program aloud. <b>Ask:</b> what happens if we put move up first? (Bun floats up in the air before the steps — the program still ends at the star, but it isn’t the route we planned.) Why does planning first help? Next lesson: Pip’s dance has bugs to fix.</p>' }
    ],
    support: 'Give pairs the arrow cards already in order; they match each card to a block. Count the steps with a finger on the screen.',
    stretch: 'Add a speech bubble when Bun reaches the star, then plan and build the way back down (left 3, down 3, left 2).',
    assess: ['Plans the route with arrow cards before coding', 'Uses move blocks in two directions with the right numbers', 'Keeps the blocks in the same order as the plan'],
    steps: [
      { t: 'Bun’s job', d: 'Bun the bunny wants to reach the spotlight star on the stage. Press GO. Where does Bun stop?' },
      { t: 'Plan it', d: 'Use your arrow cards to plan the rest: which way does Bun go next, and how many steps?' },
      { t: 'Go up', d: 'Tap the blue Move tab. Tap the up arrow to add it after move right. Tap + until it says 3.' },
      { t: 'Go right again', d: 'Tap the right arrow again. Tap + until it says 3.' },
      { t: 'Test it', d: 'Press GO. Does Bun follow your plan and stop on the star?' },
      { t: 'Celebrate', d: 'Tap the purple Looks tab. Add say something at the end and type: I’m on stage!' }
    ]
  },
  {
    adopt: 'fix-the-dance', unit: u(1, 3), minutes: 60, tool: 'Stage Lab (picture blocks)',
    summary: 'Pip is rehearsing his dance for the theatre’s first show, but his program has two bugs. Pupils predict what it will do, test it, and debug it one block at a time.',
    plan: [
      { min: 8, title: 'The dance', html: '<p>Pip is rehearsing a dance for the Lantern Street Theatre show. Write it on the board: <b>3 steps right · hop · 3 steps back left · say Ta-da!</b> Do the dance together as a class, twice.</p>' },
      { min: 12, title: 'Predict', html: '<p>Open the starter on the board. Read the program out loud block by block <b>without pressing GO</b>. <b>Ask:</b> will Pip do our dance? Take a vote. Then press GO. Introduce <b>bug</b> (a mistake in a program) and <b>debug</b> (find and fix it). <b>Ask:</b> what was different from our dance?</p>' },
      { min: 22, title: 'Debug it', html: '<p>Pupils follow the Lesson card: run it, spot what is different from the dance, and change one block at a time. There are two bugs: a <b>turn</b> block instead of a <b>hop</b>, and moving back left only <b>2</b> instead of <b>3</b>.</p><p>Encourage “change one thing, then test”. Ask pupils to say what they <b>predict</b> before each GO.</p>' },
      { min: 13, title: 'Bug hunters', html: '<p>Pupils swap devices, put ONE new bug into a partner’s dance, and swap back to find it.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> what is the best way to find a bug? (Test it, compare what happens with what should happen, change one thing at a time.) Next lesson: a ball bounces across the stage — and we find a quicker way to do the same thing again and again.</p>' }
    ]
  },
  {
    id: 'theatre-4-ball', unit: u(1, 4), title: 'Bounce the ball to Bramble', ...KS1,
    summary: 'Simple repeats. A ball must bounce across the stage to Bramble the bear: move right, hop — five times. Pupils see how long the program gets when they copy blocks, then put the two blocks inside a repeat block instead.',
    objective: 'We are learning to use a repeat block so the same steps happen again without copying them.',
    success: ['I can spot steps that happen again and again.', 'I can put blocks inside a repeat block.', 'I can change the number on the repeat to choose how many times.'],
    curriculum: ['alg', 'create1', 'predict'],
    words: [['repeat', 'do the same steps again'], ['loop', 'another word for a repeat'], ['pattern', 'something that happens again and again'], ['predict', 'say what you think will happen']],
    need: [...DEV, 'A soft ball for the warm-up (optional)'],
    plan: [
      { min: 8, title: 'Warm up: a bouncy pattern', html: '<p>Do a pattern together: “step and clap, step and clap, step and clap…” five times. <b>Ask:</b> how could I write that down quickly? Write “step and clap” once and “× 5” next to it. That is a <b>repeat</b>: the same steps, again and again.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter. The ball has a program: <b>flag, move right 1, hop</b>. Press <b>GO</b>: it bounces once. <b>Ask:</b> how many bounces to reach Bramble? (5.) We could add 4 more “move right, hop” pairs — that is 10 more blocks! Show the orange <b>Control</b> tab and the <b>repeat</b> block.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: remove the two blocks, tap <b>repeat</b> (it opens so the next blocks go inside it), add <b>move right</b> and <b>hop</b>, and set the repeat number to 5. Before pressing GO they <b>predict</b> where the ball will stop.</p><p>Common bugs: the move and hop land after the repeat instead of inside (tap the repeat block to open it, then add them); the repeat still says 2. Answer: flag, repeat 5 [move right 1, hop].</p><p>Early finishers make Bramble say “Thank you!” and try other numbers: what does repeat 3 do?</p>' },
      { min: 12, title: 'Compare', html: '<p>Show two programs on the board: one with ten copied blocks and one with a repeat. <b>Ask:</b> which is easier to read? Which is easier to change if we want 8 bounces?</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> where else do we repeat steps? (Brushing teeth, a song’s chorus, skipping.) Next lesson: waking up the cast with a tap.</p>' }
    ],
    support: 'Pairs. Show the finished repeat on the board for pupils to match. Count the bounces out loud together.',
    stretch: 'Make the ball bounce back with a second repeat (move left, hop). Use a repeat to make Bramble grow three times when the ball arrives.',
    assess: ['Recognises a step pattern that repeats', 'Puts blocks inside a repeat block', 'Changes the repeat number and predicts the result'],
    steps: [
      { t: 'One bounce', d: 'Press GO. The ball bounces once. Bramble is 5 bounces away!' },
      { t: 'Clear the way', d: 'Tap the ✕ on the move right block and the hop block to take them away. Keep the flag.' },
      { t: 'Repeat', d: 'Tap the orange Control tab. Tap the repeat block. It opens, so the next blocks go inside it.' },
      { t: 'Inside the repeat', d: 'Tap the Move tab. Tap move right, then hop. They go inside the repeat.' },
      { t: 'How many?', d: 'Tap + on the repeat block until it says 5. Predict: where will the ball stop?' },
      { t: 'Test it', d: 'Press GO. Does the ball bounce 5 times and stop next to Bramble?' }
    ]
  },
  {
    id: 'theatre-5-wake', unit: u(1, 5), title: 'Wake up the cast', ...KS1,
    summary: 'Events. It is the morning of the show and the cast are fast asleep. Pupils give each character a “when you tap this character” program, so tapping Pip makes him say good morning, tapping Dot makes her fly and tapping Bramble makes him grow.',
    objective: 'We are learning that an event, like a tap, can start a program.',
    success: ['I can start a program with the tap block.', 'I can give different characters different programs.', 'I can explain the difference between GO and a tap.'],
    curriculum: ['alg', 'create1'],
    words: [['event', 'something that happens, like a tap, that starts a program'], ['trigger', 'the block at the start that says when a program runs'], ['program', 'instructions a computer can follow'], ['character', 'one of the actors on the stage']],
    need: [...DEV, 'A bell or clapper for the warm-up'],
    plan: [
      { min: 7, title: 'Warm up: wake-up calls', html: '<p>Give three pupils a job: when you hear the bell, stand up; when I clap, wave; when I click my fingers, jump. Make the sounds in a random order. <b>Ask:</b> what made each person move? Introduce the word <b>event</b>: something that happens and starts a program.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter. Press <b>GO</b>: everyone says “Zzz…”. Tap Pip on the stage: nothing happens. Choose Pip in the character list, tap the yellow <b>Start</b> tab and tap <b>when you tap this character</b> (the finger). Add <b>say something</b> and type “Good morning!”. Press GO, then tap Pip.</p><p><b>Ask:</b> which program runs when we press GO? Which runs when we tap Pip?</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card to give Pip, Dot and Bramble a tap program each. Remind them to choose the character in the list on the left before adding blocks, and to press GO before tapping (taps only work while the show is running).</p><p>Common bugs: blocks added to the wrong character; the tap block added to the end of the flag program instead of a new strip (a yellow Start block always starts a new strip).</p><p>Answer: Pip — tap, say “Good morning!”, hop · Dot — tap, move up 3, move down 3 · Bramble — tap, get bigger 2, say “Hello!”.</p>' },
      { min: 13, title: 'Tap tester', html: '<p>Pairs swap and tap each other’s characters. Can they guess what each one will do before tapping?</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> what is the difference between the flag and the tap block? (The flag starts everything when GO is pressed; the tap only starts that one character’s program, every time you tap it.) Next lesson: our first show!</p>' }
    ],
    support: 'Give each pair one character to start with; show the finished Pip program on the board.',
    stretch: 'Add a “when characters bump” program: make Dot fly down to Bramble and have Bramble say “Ouch!” when they bump.',
    assess: ['Starts a program with the tap trigger', 'Gives different characters their own programs', 'Explains that GO starts flag programs and a tap starts tap programs'],
    steps: [
      { t: 'Sleepy cast', d: 'Press GO. Everyone is asleep! Tap Pip on the stage. Does anything happen?' },
      { t: 'Wake Pip', d: 'Tap Pip in the list on the left. Tap the yellow Start tab and tap when you tap this character (the finger).' },
      { t: 'Good morning', d: 'Tap the Looks tab, add say something and type Good morning! Then add hop from the Move tab.' },
      { t: 'Wake Dot', d: 'Tap Dot in the list. Add when you tap this character, then move up 3 and move down 3.' },
      { t: 'Wake Bramble', d: 'Tap Bramble. Add when you tap this character, then get bigger 2 and say Hello!' },
      { t: 'Test it', d: 'Press GO, then tap each character on the stage. Does each one wake up in its own way?' }
    ]
  },
  {
    id: 'theatre-6-show', unit: u(1, 6), title: 'Project: our first show', ...KS1,
    summary: 'The Block 1 design project. Pupils plan and make a short show for Pip and Dot on the lit stage, using everything from this block: a sequence of blocks after the flag, a repeat, a tap program and a speech bubble. They test it, fix it and perform it for a partner.',
    objective: 'We are learning to plan, make, test and improve our own program.',
    success: ['I can plan my show with pictures before I code.', 'I can use a flag program, a repeat and a tap program.', 'I can test my show and fix a bug.'],
    curriculum: ['create1', 'alg', 'debug1'],
    words: [['design', 'planning what you will make'], ['algorithm', 'a set of steps in the right order'], ['repeat', 'do the same steps again'], ['event', 'something that starts a program, like GO or a tap'], ['debug', 'find and fix the mistakes']],
    need: [...DEV, 'A planning sheet: three boxes for the start, middle and end of the show'],
    plan: [
      { min: 8, title: 'What makes a good show?', html: '<p>Show the starter: the lit stage, Pip, Dot and a star. Tell the class the theatre wants a short show from every pair. <b>Ask:</b> what could Pip and Dot do? Walk on, bow, dance, fly, sing? Share the <b>success criteria</b> (on the next slide).</p>' },
      { min: 10, title: 'Plan', html: '<p>Pairs draw their show in three boxes: start, middle and end. Under each picture they write or draw the blocks (arrows, a repeat sign, a finger for a tap). Check each plan has a flag program, a repeat and a tap.</p>' },
      { min: 25, title: 'Make and test', html: '<p>Pupils build their show from their plan, pressing GO often. Walk round and ask: “What will happen next? Is that what you planned?” Celebrate bugs that get fixed.</p><p>An example that meets every criterion: Pip — flag, move right 3, say “Welcome to our show!”, repeat 3 [hop]; tap, say “Thank you!”, turn · Dot — flag, repeat 2 [move down, move up]; tap, pop.</p>' },
      { min: 12, title: 'Perform', html: '<p>Pairs perform their show for another pair (press GO, then invite the audience to tap). The audience says one thing they liked and checks the success criteria.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> what did you change after testing? What are you most proud of? This is the end of Block 1 — you can now plan algorithms, use repeats and events, and debug.</p>' }
    ],
    support: 'Give a ready-made plan with the start of each program drawn in. Pairs build one character first.',
    stretch: 'Add a second page (the + by the page number) for scene 2 and use go to page at the end of scene 1. Record your own sound for Dot.',
    assess: ['Plans a show with pictures before coding', 'Uses a flag program, a repeat and a tap program in their own show', 'Tests the show and fixes at least one bug'],
    steps: [
      { t: 'Plan your show', d: 'Draw your show in three boxes: start, middle, end. What will Pip and Dot do?' },
      { t: 'Start the show', d: 'Choose Pip. Add the green flag, then at least three blocks: walk on, say hello…' },
      { t: 'Add a repeat', d: 'Use a repeat block from the Control tab for something that happens again and again.' },
      { t: 'Add a tap', d: 'Give a character a when you tap this character program for the audience to tap.' },
      { t: 'Test and fix', d: 'Press GO. Does it match your plan? Fix anything that goes wrong.' },
      { t: 'Showtime!', d: 'Perform your show for another pair. Ask them to tap your characters!' }
    ]
  },

  // ═══════════════════════ BLOCK 2 · THE PUPPET SHOW (Years 3–4) ═══════════════════════
  {
    id: 'theatre-7-joke', unit: u(2, 7), title: 'The knock-knock joke', ...B2,
    summary: 'The first lesson in the blocks editor. Pip and Bramble rehearse a knock-knock joke, but Bramble says his line at the same time as Pip. Pupils write Bramble’s part as a longer sequence, using “wait” blocks so the lines take turns.',
    objective: 'We are learning to write a longer sequence of blocks and use timing so that two sprites take turns.',
    success: ['I can read a script from top to bottom.', 'I can use wait blocks to time a sequence.', 'I can make two sprites take turns to talk.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['sequence', 'the order the blocks run in, top to bottom'], ['sprite', 'a character on the stage that has its own code'], ['script', 'a stack of blocks that starts with an event'], ['timing', 'when each step happens'], ['algorithm', 'a set of exact steps in order']],
    need: [...DEV, 'A printed copy of the joke for each pair (optional)'],
    plan: [
      { min: 8, title: 'Act it out', html: '<p>Tell a knock-knock joke with a pupil. Then do it again with both of you speaking at once. <b>Ask:</b> what went wrong? (The lines need to take turns: each person waits while the other speaks.)</p><p>Explain: this block the class are making a puppet show for Lantern Street Theatre, now with the full blocks editor.</p>' },
      { min: 12, title: 'Show me the editor', html: '<p>Open the starter. Show the parts: blocks on the left, the stage on the right, the <b>sprites</b> under the stage. Click Pip and read his <b>script</b> top to bottom: “say Knock knock! for 2 secs, wait 2 seconds, say Pip! for 2 secs…”. Press <b>Run</b>. <b>Ask:</b> what is wrong? (Bramble says “Who’s there?” at the same time as “Knock knock!”.)</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card to write Bramble’s part: <b>wait 2 seconds</b> first, then <b>say Who’s there? for 2 secs</b>, <b>wait 2 seconds</b>, <b>say Pip who? for 2 secs</b>. Encourage them to write a timeline on paper: 0–2 s Pip, 2–4 s Bramble, 4–6 s Pip…</p><p>Common bugs: the wait is under the say instead of above it, so Bramble still talks over Pip; a wait of 1 second, so the lines overlap.</p>' },
      { min: 10, title: 'Our own joke', html: '<p>Pairs change the words to a joke of their own (keep it kind!) and fix the timing so it still takes turns.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> why did Bramble need a wait at the start? What would happen with a wait of 3 seconds? Next lesson: a dance party where events start the scripts.</p>' }
    ],
    support: 'Give the timeline on paper with Bramble’s blocks drawn in; pupils match them to the editor.',
    stretch: 'Add a third sprite who laughs at the end (“Ha ha!”) at exactly the right moment. Work out from the timeline how long it must wait.',
    assess: ['Reads a script in order and explains what each block does', 'Uses wait blocks to time a sequence', 'Makes two sprites take turns without talking over each other'],
    steps: [
      { t: 'Listen', d: 'Press Run above the stage. Bramble talks over Pip! Click Pip in the sprite list and read his script.' },
      { t: 'Bramble waits', d: 'Click Bramble. From Control, drag “wait 1 seconds” in between “when green flag clicked” and the say block. Change it to 2.' },
      { t: 'Test it', d: 'Press Run. Does Bramble say Who’s there? after Knock knock! now?' },
      { t: 'The next line', d: 'Under Bramble’s say block, add another wait 2 seconds and then “say … for 2 secs” (Looks). Type Pip who?' },
      { t: 'Check the timing', d: 'Press Run. Do Pip and Bramble take turns all the way to the end?' },
      { t: 'Challenge', d: 'Change the words to your own kind joke. Keep the timing right!' }
    ]
  },
  {
    adopt: 'stage-animate', unit: u(2, 8), tool: 'Stage Lab (blocks)',
    plan: [
      { min: 5, title: 'Warm up: Simon says, with events', html: '<p>Play a quick game: “<b>When I clap</b>, jump. <b>When I wave</b>, spin. <b>When I say go</b>, march 4 steps.” Each instruction only happens when its signal happens.</p><p>Introduce the word <b>event</b>: something that happens and starts a set of instructions. <b>Ask:</b> what events start things in real life? (a doorbell, a school bell, an alarm clock)</p>' },
      { min: 10, title: 'Show me', html: '<p>On the board, open the starter and press <b>Run</b> (above the stage). It is the after-show party at Lantern Street Theatre. The Cat says “Let’s dance!” — and then the party stops. Click each sprite in the sprite list and read its blocks together: the Cat starts <b>when green flag clicked</b>, the Bird has no code yet, and the Robot starts <b>when space key pressed</b>.</p><p>Model one repeat: drag <b>repeat 10</b> under the Cat’s say block and put <b>next costume</b> and <b>wait 1 seconds</b> inside. <b>Ask:</b> what will happen? Then press Run. Point out that the blocks run in <b>sequence</b>: first the say, then the loop.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the <b>Lesson</b> card: make the Cat dance with a repeat loop, make the Bird fly in when it is clicked, then debug the Robot. The Robot’s jump goes up 40 but only comes down 4, so every press of the space bar leaves it higher. Let pupils discover the bug by testing before they look for it.</p><p>Ask pairs to <b>predict</b> before they press Run: “What will the Bird do when you click it?” Common mistakes: putting the wait <b>outside</b> the repeat (the costume flicks too fast to see), and forgetting to press Run before clicking a sprite.</p><p>Early finishers plan a dance move on paper first (their algorithm), then build it, or try the broadcast challenge.</p>' },
      { min: 15, title: 'Party time', html: '<p>Pupils swap seats and run a partner’s party. They tell their partner which event starts each sprite and spot any loops. Then two or three parties go on the board.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> how many events did your party use? Why is a repeat loop better than copying the same blocks 10 times? How did you find the Robot’s bug?</p><p>Next lesson: <b>Scene by scene</b> — breaking a bigger scene into parts.</p>' }
    ]
  },
  {
    id: 'theatre-9-scenes', unit: u(2, 9), title: 'Scene by scene', ...B2,
    summary: 'Decomposition. The puppet show opens with a sunrise scene: night turns to day, the sun rises, Dot flies in singing and Bramble wakes up. Pupils break the scene into parts, give each part to one sprite as its own script, and time the parts so they happen in order.',
    objective: 'We are learning to break a bigger problem into smaller parts (decomposition) and give each part its own script.',
    success: ['I can break a scene into smaller parts.', 'I can give each sprite its own script for its part.', 'I can use glide and wait blocks so the parts happen in the right order.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['decompose', 'break a big job into smaller parts'], ['storyboard', 'pictures that plan a scene, box by box'], ['glide', 'move smoothly to a place over some seconds'], ['backdrop', 'the picture behind the stage'], ['x and y', 'two numbers for a place: across, and up or down']],
    need: [...DEV, 'A four-box storyboard sheet per pair'],
    plan: [
      { min: 8, title: 'How do you make a sunrise?', html: '<p>Show a sunrise photo. <b>Ask:</b> what happens, in order? Build a storyboard with the class: 1 it is night · 2 the sun rises and it becomes day · 3 a bird flies in and sings · 4 a bear wakes up. Introduce <b>decompose</b>: breaking a big job into smaller parts that are easier to solve.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter. Press <b>Run</b>: it is night and nothing happens. Click each sprite: the Sun only switches to the night backdrop and goes to the bottom; Dot goes to the top left; Bramble thinks “Zzz…”. <b>Ask:</b> which sprite should do which part of our storyboard? Write the owner under each box.</p><p>Model the Sun’s part: <b>glide 3 secs to x 250 y 180</b> then <b>switch backdrop to Day garden</b>. Run it.</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card, one part (one sprite) at a time, pressing Run after each. Dot must wait until the sun is up (3 seconds) before she glides in, and Bramble waits until Dot has sung.</p><p>Answer — Sun: switch backdrop to Night garden, go to x 250 y −250, glide 3 secs to x 250 y 180, switch backdrop to Day garden · Dot: go to x −380 y 200, wait 3, glide 2 secs to x −100 y 60, say Tweet tweet! for 2 · Bramble: think Zzz…, wait 6, say What a lovely morning! for 2.</p><p>Common bugs: a glide with y the wrong way (minus is down); waits too short, so the parts overlap.</p>' },
      { min: 10, title: 'Add a part', html: '<p>Pairs add a fifth part of their own to the storyboard and build it (another sprite, or the scene ending with a bow).</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> why was it easier to build one part at a time? Which part did you test first? Next lesson: a repeat inside a repeat fills the theatre seats.</p>' }
    ],
    support: 'Give each pair one part to finish first (the Sun), with the glide block numbers written on the storyboard.',
    stretch: 'Use “when backdrop switches to Day garden” (Events) instead of a wait, so Dot starts at the exact moment day comes.',
    assess: ['Breaks the scene into parts on a storyboard', 'Builds each part as its own sprite’s script', 'Times the parts with glide and wait so they happen in order'],
    steps: [
      { t: 'The storyboard', d: '1 Night · 2 The sun rises and it becomes day · 3 Dot flies in and sings · 4 Bramble wakes up. Press Run: only part 1 works!' },
      { t: 'The Sun’s part', d: 'Click the Sun. Under its blocks add “glide 1 secs to x y” (Motion): 3 secs to x 250 y 180. Then “switch backdrop to” Day garden (Looks).' },
      { t: 'Dot’s part', d: 'Click Dot. Add wait 3 seconds, then glide 2 secs to x -100 y 60, then say Tweet tweet! for 2 secs.' },
      { t: 'Bramble’s part', d: 'Click Bramble. Under think Zzz… add wait 6 seconds, then say What a lovely morning! for 2 secs.' },
      { t: 'Test the whole scene', d: 'Press Run. Do the four parts happen in order? Change a wait if two parts happen at once.' },
      { t: 'Challenge', d: 'Add a part of your own to the scene: plan it on the storyboard first!' }
    ]
  },
  {
    id: 'theatre-10-seats', unit: u(2, 10), title: 'Fill the seats', ...B2,
    summary: 'Count-controlled repetition. The theatre needs seats for the audience. The starter stamps three seats by copying blocks. Pupils swap the copies for a repeat, then put that repeat inside another repeat to stamp three rows of nine seats.',
    objective: 'We are learning to use count-controlled loops, including a loop inside a loop.',
    success: ['I can replace copied blocks with a repeat.', 'I can work out how many times to repeat.', 'I can put a repeat inside a repeat to make rows.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['repeat loop', 'runs the blocks inside it a set number of times'], ['count-controlled', 'a loop that runs a number of times you choose'], ['nested loop', 'a loop inside another loop'], ['stamp', 'prints a copy of the sprite onto the stage'], ['efficient', 'doing the job with fewer blocks']],
    need: [...DEV, 'Squared paper for planning the rows (optional)'],
    plan: [
      { min: 8, title: 'Seats, seats, seats', html: '<p>Draw a theatre on the board: three rows of nine seats. <b>Ask:</b> if I had to tell a robot how to draw these one at a time, how many instructions would that be? (27 stamps and 27 moves!) Is there a quicker way? Recap <b>repeat</b> from the dance party.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter: the empty hall. Click the Seat sprite and read its script: <b>stamp, change x by 60, stamp, change x by 60, stamp</b>. Press <b>Run</b>: three seats. <b>Ask:</b> what pattern can you see? Replace the copies with <b>repeat 9</b> [stamp, change x by 60] and Run: a whole row.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: make one row with a repeat, then wrap the row in <b>repeat 3</b> with <b>set x to −240</b> (back to the start of the row) and <b>change y by −70</b> (down a row) after the inner repeat.</p><p>Common bugs: the set x and change y inside the inner repeat (seats go diagonally); a repeat of 10 that runs off the edge; forgetting “erase all”, so old seats stay.</p><p>Answer: erase all, show, go to x −240 y −40, repeat 3 [repeat 9 [stamp, change x by 60], set x to −240, change y by −70], hide.</p>' },
      { min: 12, title: 'Count the blocks', html: '<p>Pairs count the blocks in their program and compare with how many it would take without loops. <b>Ask:</b> how would you make 5 rows of 6? Pupils change the numbers and test.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> what is a nested loop? How many seats does repeat 4 [repeat 7 [...]] stamp? (28.) Next lesson: debugging the dress rehearsal.</p>' }
    ],
    support: 'Do the single row together first; give the outer repeat blocks pre-sorted on a card.',
    stretch: 'Make each row a different colour (stretch: change the costume or use set ghost effect) or leave a gap for an aisle in the middle of each row.',
    assess: ['Replaces repeated blocks with a repeat loop', 'Chooses the right count for a row', 'Nests one loop inside another to make rows'],
    steps: [
      { t: 'Three seats', d: 'Press Run. Three seats! Click the Seat sprite and look at the copied blocks.' },
      { t: 'A row with a repeat', d: 'Drag the copied stamp and change x blocks away. From Control, add “repeat 10” and put stamp and change x by 60 inside. Make it repeat 9.' },
      { t: 'Test the row', d: 'Press Run. Do you get a row of 9 seats?' },
      { t: 'More rows', d: 'Drag a new repeat around your row repeat and set it to 3. Under the row (inside the big repeat) add “set x to -240” and “change y by -70”.' },
      { t: 'Test the rows', d: 'Press Run. Do you get 3 rows of 9? Add hide at the very end so the last seat doesn’t float.' },
      { t: 'Challenge', d: 'How many blocks did you use? Change the numbers to make 4 rows of 7 seats.' }
    ]
  },
  {
    id: 'theatre-11-rehearsal', unit: u(2, 11), title: 'Debug the dress rehearsal', ...B2,
    summary: 'Debugging. It is the dress rehearsal and three things go wrong: Pip doesn’t walk to the middle, Bolt the robot speaks before anyone clicks him, and Dot says her lines in the wrong order. Pupils compare what should happen with what does happen, find each bug and fix it.',
    objective: 'We are learning to find and fix bugs in sequence, repetition and events by testing.',
    success: ['I can compare what a program does with what it should do.', 'I can find a bug in a loop, an event or a sequence.', 'I can fix one bug at a time and test again.'],
    curriculum: ['reason', 'ssr', 'design'],
    words: [['bug', 'a mistake in a program'], ['debug', 'find and fix the mistakes'], ['test', 'run the program to check it'], ['expected', 'what should happen'], ['actual', 'what really happens']],
    need: [...DEV, 'A printed “what should happen” list for each pair (from the slides)'],
    plan: [
      { min: 8, title: 'What should happen?', html: '<p>Read out the director’s notes: <b>1</b> When the flag is clicked, Pip walks to the middle of the stage, changing costume as he walks. <b>2</b> When you click Bolt, he says “Beep! Welcome!”. <b>3</b> When you press space, Dot says “Hello!” and then “Goodbye!”. Introduce <b>expected</b> (what should happen) and <b>actual</b> (what really happens).</p>' },
      { min: 10, title: 'Test it', html: '<p>Open the starter and press <b>Run</b>. Watch carefully, then click Bolt and press space. Make a table on the board: expected / actual. Don’t fix anything yet — just record what is different.</p>' },
      { min: 25, title: 'Debug it', html: '<p>Pupils follow the Lesson card, one bug at a time, testing after each fix. The bugs: <b>Pip</b> — “move 25 steps” is under the repeat instead of inside it, so he only moves once · <b>Bolt</b> — his script starts “when green flag clicked” instead of “when this sprite clicked” · <b>Dot</b> — her two say blocks are the wrong way round.</p><p>Ask: “Is it the loop, the event or the order?” Encourage pupils to explain the bug before they fix it.</p>' },
      { min: 12, title: 'Bug swap', html: '<p>Pairs put ONE bug into their fixed program (a wrong number, a block outside a loop, a wrong event or order) and swap with another pair, who find it using the expected/actual table.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> which bug was hardest to find? What is a good way to debug? (Test, compare expected with actual, fix one thing, test again.) Next lesson: your own puppet show.</p>' }
    ],
    support: 'Tell pupils which sprite each bug is in; give them the expected/actual table half filled.',
    stretch: 'Make Pip walk back after a pause with a second repeat. Give Dot a second key (when right arrow key pressed) with a line of her own, and check it with the expected/actual table.',
    assess: ['Records expected and actual behaviour', 'Finds bugs in a loop, an event and a sequence', 'Fixes one bug at a time and retests'],
    steps: [
      { t: 'The director’s notes', d: '1 Pip walks to the middle. 2 Click Bolt: he says Beep! Welcome! 3 Press space: Dot says Hello! then Goodbye!' },
      { t: 'Test it', d: 'Press Run. Click Bolt. Press space. Which notes go wrong?' },
      { t: 'Bug 1: Pip', d: 'Click Pip. Is “move 25 steps” inside the repeat? Drag it inside, above next costume. Run it: Pip should stop in the middle.' },
      { t: 'Bug 2: Bolt', d: 'Click Bolt. He talks as soon as you press Run. Swap “when green flag clicked” for “when this sprite clicked” (Events).' },
      { t: 'Bug 3: Dot', d: 'Click Dot. Her lines are in the wrong order. Drag the blocks so Hello! comes first.' },
      { t: 'Test again', d: 'Press Run and check all three notes. Do they all work now?' }
    ]
  },
  {
    id: 'theatre-12-puppets', unit: u(2, 12), title: 'Project: the puppet show', ...B2,
    summary: 'The Block 2 design project. Pupils storyboard and build a short puppet show for Pip, Bramble and Dot: a conversation with good timing, at least two different events, a repeat loop and scenes that happen in order. They test, debug and perform it.',
    objective: 'We are learning to design, build and debug an animated story using sequence, events and repetition.',
    success: ['I can plan my show on a storyboard and decide which sprite does each part.', 'I can use at least two different events and a repeat loop.', 'I can time a conversation so sprites take turns.', 'I can test and debug my show.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['storyboard', 'pictures that plan a scene, box by box'], ['decompose', 'break a big job into smaller parts'], ['event', 'something that starts a script, like a click or a key'], ['repeat loop', 'runs the blocks inside it a number of times'], ['debug', 'find and fix the mistakes']],
    need: [...DEV, 'A six-box storyboard sheet per pair'],
    plan: [
      { min: 8, title: 'The brief', html: '<p>Lantern Street Theatre wants a short puppet show from every pair. Share the <b>success criteria</b>: at least two sprites with code, at least two different events (green flag, a click, a key…), a repeat loop, and at least four lines of dialogue that take turns. Show one finished example on the board.</p>' },
      { min: 12, title: 'Storyboard', html: '<p>Pairs storyboard their show in six boxes and write, under each box, which sprite does it and which event starts it. They mark where a repeat is needed (a dance, a walk, a flap). Check plans before pupils open the starter.</p>' },
      { min: 25, title: 'Build and test', html: '<p>Pupils build part by part, pressing Run after each. Remind them of the skills of the block: timing with waits (the knock-knock joke), events (the dance party), parts on different sprites (scene by scene), repeats (the seats) and debugging (the rehearsal). The second backdrop “Night” is there if they want a change of scene.</p>' },
      { min: 10, title: 'Opening night', html: '<p>Pairs perform their show for another pair, who check the success criteria and give a star (something good) and a wish (something to improve).</p>' },
      { min: 5, title: 'Plenary', html: '<p>Pupils make one improvement from their wish. <b>Ask:</b> what did you debug? Which skill from this block helped most? Next block: games night, where programs make decisions.</p>' }
    ],
    support: 'Give a storyboard with the first two boxes done and their blocks listed; pairs add the rest.',
    stretch: 'Use broadcast and when I receive so one sprite’s line starts another sprite’s script exactly when it finishes, instead of using waits.',
    assess: ['Plans with a storyboard and splits the show between sprites', 'Uses two or more events and a repeat loop', 'Times dialogue so sprites take turns', 'Tests and debugs before performing'],
    steps: [
      { t: 'Storyboard it', d: 'Plan six boxes. Under each box write which sprite does it and which event starts it.' },
      { t: 'Opening lines', d: 'Give Pip and Bramble a conversation: “say … for 2 secs” blocks with waits so they take turns.' },
      { t: 'A repeat', d: 'Use a repeat for something that happens again and again: a dance, a walk or a flap.' },
      { t: 'Another event', d: 'Give a sprite a script that starts when it is clicked or when a key is pressed.' },
      { t: 'Test and debug', d: 'Press Run. Does it match your storyboard? Fix one thing at a time.' },
      { t: 'Opening night', d: 'Perform your show for another pair. Ask for a star and a wish!' }
    ]
  },

  // ═══════════════════════ BLOCK 3 · GAMES NIGHT (Years 4–5) ═══════════════════════
  {
    adopt: 'catch-the-stars', unit: u(3, 13), years: 'Years 4–5', tool: 'Stage Lab (blocks)',
    summary: 'Games night begins in the theatre foyer. Pupils finish a catching game: an “if touching” check inside the star’s forever loop adds to the score and sends the star back to the top.'
  },
  {
    id: 'theatre-14-door', unit: u(3, 14), title: 'The magic word', ...B3,
    summary: 'If … then … else with an input. Bolt the robot guards the stage door on games night. He asks for the magic word but lets everyone think. Pupils use “ask and wait”, the answer and an if … else block, so “please” opens the door to backstage and anything else gets a polite “no”.',
    objective: 'We are learning to use if … else to choose between two actions, using an input from the user.',
    success: ['I can use ask and wait to get an input.', 'I can use an if … else block to choose between two things.', 'I can explain why “Please” and “please” are different to a computer.'],
    curriculum: ['ssr', 'reason', 'design'],
    words: [['input', 'information that goes into a program, like a typed answer'], ['selection', 'choosing what to do with if … else'], ['condition', 'a question that is true or false'], ['if … else', 'do one thing if the condition is true, another if it is false'], ['answer', 'what the user typed']],
    need: [...DEV],
    plan: [
      { min: 8, title: 'Password game', html: '<p>Stand at the classroom door. “If you say the password, you may come in; else you must wait.” Pupils try. <b>Ask:</b> what question am I asking myself? (“Is it the password?” — true or false.) Introduce <b>condition</b>, <b>if … else</b> and <b>selection</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>, then click Bolt. He asks “What’s the magic word?” — type anything in the box over the stage and press Enter. He always says “Hmm, let me think…”. <b>Ask:</b> what should he do instead? Write it as an algorithm: <b>if</b> the answer is “please”, say “Come in!” and switch to the Backstage backdrop, <b>else</b> say “That’s not the magic word!”.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card to build the if … else. The condition is the green <b>=</b> block from Operators, with <b>answer</b> (Sensing) on the left and a text block saying please on the right.</p><p>Test with “please”, “pizza” and “Please”. The last one is a great discussion: a computer compares exactly, so a capital letter makes the condition false. (Stretch: the “contains” block, or an <b>or</b>.)</p><p>Common bugs: the if … else is outside the click script; the answer block missing so the computer compares 0 with please; the backdrop switch in the else.</p>' },
      { min: 12, title: 'Try to get in', html: '<p>Pupils change their magic word and challenge a partner to guess it, giving clues. They add a second else line, or a different backdrop.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> what is the condition in your program? When is it true? Why did “Please” not work? Next lesson: comparing numbers to keep Pip in the spotlight.</p>' }
    ],
    support: 'Give the finished if … else on the board; pupils focus on building the condition and testing it.',
    stretch: 'Let in “please” OR “Please” using an or block (Operators). Count wrong guesses with the score and lock the door after 3.',
    assess: ['Uses ask and wait and the answer block', 'Builds an if … else with a condition', 'Explains how the condition decides which branch runs'],
    steps: [
      { t: 'Knock knock', d: 'Press Run, then click Bolt. Type a word in the box over the stage and press Enter. What does Bolt say?' },
      { t: 'An if … else', d: 'Click Bolt. From Control, drag “if then else” under “ask … and wait”. Drag the say Hmm block away.' },
      { t: 'The condition', d: 'From Operators, drag the “0 = 10” block into the if. Put “answer” (Sensing) in the left side. Drag the empty text block "" onto the right side and type please.' },
      { t: 'Come in!', d: 'Inside “then”, add say Come in! for 2 secs and “switch backdrop to” Backstage.' },
      { t: 'Not that word', d: 'Inside “else”, add say That’s not the magic word! for 2 secs.' },
      { t: 'Test it', d: 'Press Run and try please, pizza and Please. What happens each time? Why?' }
    ]
  },
  {
    id: 'theatre-15-spotlight', unit: u(3, 15), title: 'Stay in the spotlight', ...B3,
    summary: 'Comparison and “and”. Pip moves with the arrow keys and should say whether he is in the spotlight. The starter only checks one side, so far to the right he still thinks he is in the light. Pupils compare his x position with two numbers and join the comparisons with “and”.',
    objective: 'We are learning to use comparison operators (<, >) and “and” to build a condition.',
    success: ['I can use x position to sense where a sprite is.', 'I can compare numbers with < and >.', 'I can join two conditions with and.'],
    curriculum: ['ssr', 'reason'],
    words: [['operator', 'a block that compares or combines, like < > = and or'], ['greater than (>)', 'bigger than'], ['less than (<)', 'smaller than'], ['and', 'true only when both conditions are true'], ['x position', 'how far left or right a sprite is']],
    need: [...DEV, 'A number line from −300 to 300 on the board'],
    plan: [
      { min: 8, title: 'On the number line', html: '<p>Draw a number line from −300 to 300 and shade the spotlight from −150 to 150. Point to numbers: is 0 in the light? 200? −250? <b>Ask:</b> how do you know? (It must be bigger than −150 AND smaller than 150.) Introduce <b>&gt;</b>, <b>&lt;</b> and <b>and</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Move Pip with the arrow keys. On the left he says “It’s dark out here!”, in the middle “I’m in the spotlight!” — but far right he still says he’s in the spotlight. Click Pip and read the condition: <b>x position &gt; −150</b>. <b>Ask:</b> why is that true on the far right? (250 is bigger than −150 too.)</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card to build <b>(x position &gt; −150) and (x position &lt; 150)</b> and put it in the if … else. They test at the left edge, the middle and the right edge, and record results in a table.</p><p>Common bugs: the two numbers swapped; < and > swapped; using “or”, which is true almost everywhere. Answer: if &lt;(x position &gt; −150) and (x position &lt; 150)&gt; then say I’m in the spotlight! else say It’s dark out here!</p>' },
      { min: 12, title: 'Change the light', html: '<p>Pairs make the spotlight smaller (−80 to 80) or move it, and test. Fast finishers add a second condition for a “nearly in the light” message.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> when is an and condition true? When would or be true? Next lesson: loops that check a condition, to raise the curtain.</p>' }
    ],
    support: 'Give the comparison blocks ready-made on the board; pupils put them into the and block and test.',
    stretch: 'Change the spotlight to go up and down as well: add y position checks. Use a set ghost effect to make Pip fade in the dark.',
    assess: ['Uses x position as an input', 'Builds a comparison with < or >', 'Joins two comparisons with and and explains when it is true'],
    steps: [
      { t: 'Try it', d: 'Press Run. Move Pip with the left and right arrow keys. Is he right about the spotlight everywhere?' },
      { t: 'Read the condition', d: 'Click Pip. The if checks “x position > -150”. Why is that true on the far right too?' },
      { t: 'An and block', d: 'From Operators, drag the “and” block out. Drag the x position > -150 block into its left side.' },
      { t: 'The other side', d: 'From Operators, drag a compare block into the right side of “and”. Choose <, put x position (Motion) on the left and type 150 on the right.' },
      { t: 'Put it back', d: 'Drag the whole “and” block into the if … else.' },
      { t: 'Test both sides', d: 'Press Run. Walk Pip to the left, the middle and the right. Is he right every time?' }
    ]
  },
  {
    id: 'theatre-16-curtain', unit: u(3, 16), title: 'Raise the curtain', ...B3,
    summary: 'Loops that check a condition. The curtain should rise and then disappear before Pip welcomes the audience, but the starter’s forever loop never stops and Pip talks behind the curtain. Pupils use “repeat until” to stop the curtain at the top and “wait until” so Pip waits for it.',
    objective: 'We are learning to use loops that keep checking a condition: repeat until and wait until.',
    success: ['I can explain the difference between forever and repeat until.', 'I can use repeat until to stop a loop at the right moment.', 'I can use wait until to make a sprite wait for something to happen.'],
    curriculum: ['ssr', 'reason', 'design'],
    words: [['repeat until', 'repeats until a condition becomes true'], ['wait until', 'waits until a condition becomes true'], ['forever', 'repeats and never stops'], ['condition', 'a question that is true or false'], ['y position', 'how far up or down a sprite is']],
    need: [...DEV],
    plan: [
      { min: 8, title: 'Until…', html: '<p>Ask pupils to clap <b>until</b> you raise your hand. Then ask them to sit still and <b>wait until</b> you say “go”. <b>Ask:</b> how is that different from “clap 10 times” or “clap for ever”? The loop keeps checking a condition.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Pip says “Welcome to the show!” behind the curtain, and the curtain rises but never goes away. Click the Curtain: <b>forever</b> [change y by 5]. <b>Ask:</b> when should the curtain stop? (When its y position is more than 250 — at the top.)</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: swap forever for <b>repeat until</b> &lt;y position &gt; 250&gt; and add <b>hide</b> after the loop. Then make Pip <b>wait until</b> &lt;(y position of Curtain) &gt; 250&gt; before he speaks — the “x position of …” block is in Sensing; change its first choice to y position and its second to Curtain.</p><p>Common bugs: hide inside the loop (the curtain vanishes at once); the condition the wrong way round (&lt; 250 is already true, so the loop never runs); Pip’s wait until checking his own y position.</p>' },
      { min: 12, title: 'Make it better', html: '<p>Pairs make the curtain rise faster or slower and check Pip still waits. Fast finishers add a “wait until key space pressed?” so the show starts only when the stage manager presses space.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> what would happen with repeat 10 instead of repeat until? Why is repeat until better here? Next lesson: debugging loops and conditions.</p>' }
    ],
    support: 'Build the curtain’s repeat until together; pupils do Pip’s wait until on their own.',
    stretch: 'Make the curtain come down again at the end: repeat until y position < 1, then Pip says goodnight. Use a timer to show how long the show lasted.',
    assess: ['Explains forever versus repeat until', 'Stops a loop with a repeat until condition', 'Uses wait until to sync two sprites'],
    steps: [
      { t: 'Watch', d: 'Press Run. Pip talks behind the curtain, and the curtain never goes away!' },
      { t: 'Stop at the top', d: 'Click the Curtain. Drag “change y by 5” out of forever, then drag forever away. From Control, add “repeat until” and put change y by 5 inside.' },
      { t: 'The condition', d: 'From Operators, put a compare block into repeat until. Choose >, put “y position” (Motion) on the left and type 250.' },
      { t: 'Hide it', d: 'Under the repeat until (not inside it), add hide (Looks). Press Run: does the curtain stop and disappear?' },
      { t: 'Pip waits', d: 'Click Pip. Put “wait until” (Control) above his say block. Inside it: a > block with “y position of Curtain” (Sensing) and 250.' },
      { t: 'Test it', d: 'Press Run. Does Pip wait until the curtain has gone before he speaks?' }
    ]
  },
  {
    id: 'theatre-17-lights', unit: u(3, 17), title: 'Debug the light show', ...B3,
    summary: 'Debugging loops and conditions. The light show for games night is broken: Pip never walks across, the spotlight never changes colour, and Dot never cheers. Each bug is in a loop or a condition — an if outside its loop, a comparison the wrong way round and a condition that can never be true.',
    objective: 'We are learning to debug loops and conditions by reasoning about when a condition is true.',
    success: ['I can find a condition that is the wrong way round.', 'I can spot an if that is outside its loop and only checks once.', 'I can fix a condition that can never become true.'],
    curriculum: ['reason', 'ssr'],
    words: [['bug', 'a mistake in a program'], ['condition', 'a question that is true or false'], ['trace', 'follow a program step by step to see what it does'], ['loop', 'blocks that run again and again'], ['debug', 'find and fix the mistakes']],
    need: [...DEV, 'The director’s notes printed for each pair'],
    plan: [
      { min: 8, title: 'The director’s notes', html: '<p>Read the notes: <b>1</b> The spotlight follows Pip all the time and changes colour while you hold the space key. <b>2</b> Pip walks right until his x position is more than 200. <b>3</b> Dot waits until Pip reaches her, then says “Bravo!”. Remind pupils of expected and actual from the dress rehearsal.</p>' },
      { min: 10, title: 'Trace it', html: '<p>Open the starter, press <b>Run</b> and hold space. Nothing goes right. Trace Pip’s script out loud: “repeat until x position &lt; 200” — <b>Ask:</b> Pip starts at −300. Is −300 less than 200? (Yes!) So the condition is already true and the loop never runs.</p>' },
      { min: 25, title: 'Debug it', html: '<p>Pupils follow the Lesson card. The bugs: <b>Pip</b> — &lt; should be &gt; · <b>Spot</b> — the “if key space pressed” is above the forever loop, so it is checked once, at the very start; it must go inside the loop · <b>Dot</b> — “wait until touching the edge” can never be true where Dot stands; it should be touching Pip.</p><p>Ask pupils to say <b>when</b> each condition becomes true before they change anything.</p>' },
      { min: 12, title: 'Bug swap', html: '<p>Pairs put one condition bug into their fixed program and swap. The other pair must trace it and explain it before they fix it.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> why does an if outside a loop only check once? How do you check a condition? (Try a number in it.) Next lesson: your own games night game.</p>' }
    ],
    support: 'Tell pairs which sprite to look at first; give a table: condition · true at the start? · true at the end?',
    stretch: 'Make Dot also cheer “Encore!” if Pip comes back past x position 0. Add a score that goes up each time the spotlight changes colour.',
    assess: ['Traces a condition and says when it is true', 'Moves an if inside a loop so it is checked again and again', 'Fixes conditions that are the wrong way round or never true'],
    steps: [
      { t: 'Test it', d: 'Press Run and hold the space key. Read the director’s notes. What goes wrong?' },
      { t: 'Bug 1: Pip', d: 'Click Pip. Pip starts at x -300. Is -300 < 200? Change the < to > so he walks until x position > 200.' },
      { t: 'Bug 2: the Spot', d: 'Click Spot. The if is above the forever loop, so it only checks once. Drag the if inside forever, under go to Pip.' },
      { t: 'Bug 3: Dot', d: 'Click Dot. She waits until she touches the edge — that never happens! Change the touching drop-down to Pip.' },
      { t: 'Test again', d: 'Press Run and hold space as Pip walks. Do all three notes work now?' },
      { t: 'Explain it', d: 'Tell your partner when each condition becomes true.' }
    ]
  },
  {
    id: 'theatre-18-games', unit: u(3, 18), title: 'Project: games night', ...B3,
    summary: 'The Block 3 design project. Pupils design and build a game for games night in the theatre foyer, using selection inside a loop, a sensing condition, a comparison, a loop that checks a condition and feedback for the player. They plan, build, test and debug, then swap games.',
    objective: 'We are learning to design and build a game that makes decisions with conditions and loops.',
    success: ['I can plan my game’s rules as if … then sentences.', 'I can use an if inside a loop with a sensing condition.', 'I can use a comparison and a loop that checks a condition.', 'I can test and debug my game.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['rule', 'something that always happens in a game, written as if … then'], ['selection', 'choosing what to do with if'], ['sensing', 'checking what is happening, like touching or a key'], ['repeat until', 'repeats until a condition becomes true'], ['feedback', 'what the game tells the player, like a score']],
    need: [...DEV, 'A game planning sheet: “If … then …” rules, how to win, how to lose'],
    plan: [
      { min: 8, title: 'Rules are conditions', html: '<p>Play a quick playground game (e.g. “If I point up, jump; if I point down, crouch; you win when…”). <b>Ask:</b> what are the rules? Write them as “if … then …”. Share the success criteria for today’s game.</p>' },
      { min: 10, title: 'Plan', html: '<p>Open the starter: the foyer, Pip, a ball and a star. Pairs plan a game on paper: what the player controls, what moves by itself, the if … then rules, and how you win (a <b>repeat until</b> or <b>wait until</b> the score reaches a number). Example on the board: keepy-uppy — the ball falls; if it touches Pip, score goes up and it goes back to the top; repeat until score = 3, then “You win!”.</p>' },
      { min: 25, title: 'Build and test', html: '<p>Pairs build from their plan. Check each game has: an if inside a loop · a sensing condition (touching, a key, the answer or the mouse) · a comparison (=, &lt;, &gt;) or and/or · a loop that checks a condition · feedback (score or a message). Ask: “What is your condition? When does it become true?”</p>' },
      { min: 12, title: 'Games night', html: '<p>Pairs swap and play each other’s games, then give a star and a wish. Players try to find a bug and report it kindly.</p>' },
      { min: 5, title: 'Plenary', html: '<p>Pairs fix one thing from their feedback. <b>Ask:</b> which condition in your game was hardest to get right? Next block: the grand show, with variables, messages and data.</p>' }
    ],
    support: 'Build the keepy-uppy example together as a base; pairs change one rule and add one of their own.',
    stretch: 'Add a second level: when the score reaches 3, switch backdrop and make the ball faster. Add a timer so you must win in 20 seconds.',
    assess: ['Writes game rules as if … then', 'Uses selection inside a loop with a sensing condition', 'Uses a comparison and a condition-controlled loop', 'Tests, debugs and acts on feedback'],
    steps: [
      { t: 'Plan the rules', d: 'Write your game’s rules as “if … then …”. How do you win?' },
      { t: 'The player', d: 'Make Pip move with the arrow keys (when key pressed, change x by).' },
      { t: 'A rule in a loop', d: 'Give the Ball a loop with an if inside: if touching Pip? then change score by 1 …' },
      { t: 'Winning', d: 'Use repeat until (or wait until) with a compare block, so the game ends when the score reaches your number.' },
      { t: 'Test and debug', d: 'Play your game. Does every rule work? Fix one thing at a time.' },
      { t: 'Games night', d: 'Swap with another pair and play their game. Give a star and a wish.' }
    ]
  },

  // ═══════════════════════ BLOCK 4 · THE GRAND SHOW (Years 5–6) ═══════════════════════
  {
    id: 'theatre-19-tickets', unit: u(4, 19), title: 'The ticket booth', ...B4,
    summary: 'Variables. Biscuit the dog sells tickets for the grand show, but nobody is counting. Pupils make two variables — seats (seats left) and sold (tickets sold) — set them at the start, show them on the stage and change them with every sale, then use an if … else so Biscuit never sells a seat he hasn’t got.',
    objective: 'We are learning to create variables, set and change their values, and use them in a condition.',
    success: ['I can make a variable and give it a starting value.', 'I can change a variable when something happens.', 'I can use a variable’s value in a condition.'],
    curriculum: ['ssr', 'data', 'design'],
    words: [['variable', 'a named value the program remembers, which can change'], ['set', 'give a variable a value'], ['change', 'add to (or take away from) a variable'], ['initialise', 'set a variable’s starting value'], ['monitor', 'the box on the stage that shows a variable’s value']],
    need: [...DEV, 'Two labelled boxes (or pots) and 20 counters for the warm-up'],
    plan: [
      { min: 8, title: 'The box office', html: '<p>Two labelled pots: “seats” with 20 counters and “sold” (empty). Sell tickets to pupils: each sale moves one counter. <b>Ask:</b> what two numbers is the box office keeping track of? What happens when “seats” is empty? Introduce <b>variable</b>: a named value that can change.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>, then click Biscuit a few times. He says “Here’s your ticket!” but nothing is counted. Show the Variables category and <b>Make a Variable</b> → seats. Add <b>set seats to 20</b> and <b>show variable seats</b> under the green flag. Run: the monitor appears on the stage. Explain <b>initialise</b>: always set the starting value when the program starts.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: make <b>seats</b> and <b>sold</b>, set them to 20 and 0, show them, then in “when this sprite clicked” <b>change seats by −1</b> and <b>change sold by 1</b>. Finally wrap the sale in <b>if seats &gt; 0 … else say Sorry, sold out!</b> (the compare block, with the seats variable on the left).</p><p>Test by setting seats to 2 at the start and clicking three times. Common bugs: set blocks inside the click script (so the count resets every sale); change by 1 for seats instead of −1; the if checking sold instead of seats.</p>' },
      { min: 12, title: 'Check the numbers', html: '<p>Pairs predict the monitors after 5 sales, then test. <b>Ask:</b> what is seats + sold always equal to? (20.) Why?</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> what is a variable? Why must we set it at the start? Next lesson: random numbers and inputs on a micro:bit for the interval game.</p>' }
    ],
    support: 'Make the variables together on the board; pupils add the change blocks and test.',
    stretch: 'Add a price variable (£5) and a takings variable that goes up by the price with each sale. Give a discount on the last 5 tickets.',
    assess: ['Creates and initialises variables', 'Changes variables in response to an event', 'Uses a variable in a condition to control what happens'],
    steps: [
      { t: 'Nobody’s counting', d: 'Press Run and click Biscuit a few times. How many tickets are left? Nobody knows!' },
      { t: 'Make variables', d: 'Click Biscuit. In Variables, press Make a Variable and call it seats. Make another called sold.' },
      { t: 'Start the count', d: 'Under “when green flag clicked” add “set seats to 20” and “set sold to 0”, then “show variable seats” and “show variable sold”.' },
      { t: 'Count each sale', d: 'In the “when this sprite clicked” script add “change seats by -1” and “change sold by 1”. Run it and click Biscuit.' },
      { t: 'Sold out', d: 'Wrap the sale in “if then else” (Control): if seats > 0 then sell, else say Sorry, sold out! for 2 secs.' },
      { t: 'Test it', d: 'Set seats to 2 at the start, run it and click Biscuit 3 times. Does the third person get “Sorry, sold out!”?' }
    ]
  },
  {
    adopt: 'microbit-rps', unit: u(4, 20), tool: 'Stage Lab (micro:bit blocks)',
    summary: 'The interval game. While the audience waits for the second half, they play rock, paper, scissors on a micro:bit: shaking it puts a random number in a variable, and if blocks choose which picture to show.'
  },
  {
    id: 'theatre-21-cues', unit: u(4, 21), title: 'On cue', ...B4,
    summary: 'Messages. Bolt the stage manager calls the cues — “Lights!”, “Curtain up!”, “Music!” — but nobody hears him. Pupils use broadcast and wait so each cue sends a message, and “when I receive” scripts on the other sprites switch on the lights, raise the curtain and start Dot’s song, always in the right order.',
    objective: 'We are learning to use messages (broadcast and when I receive) so sprites work together in the right order.',
    success: ['I can send a message with broadcast.', 'I can start a script with when I receive.', 'I can explain the difference between broadcast and broadcast and wait.'],
    curriculum: ['ssr', 'design', 'reason'],
    words: [['broadcast', 'send a message to every sprite'], ['message', 'a signal with a name, like “lights”'], ['when I receive', 'an event that starts a script when a message arrives'], ['cue', 'the signal for something to happen in a show'], ['synchronise', 'make things happen at the right time together']],
    need: [...DEV, 'Three cue cards: LIGHTS, CURTAIN, MUSIC'],
    plan: [
      { min: 8, title: 'Stage manager', html: '<p>Give three pupils cue cards (lights, curtain, music) and a job each. You are the stage manager: call “Lights!” and the lights pupil flicks an imaginary switch, and so on. <b>Ask:</b> how did each person know when to act? They were listening for a <b>message</b>. In a show these are called <b>cues</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Bolt calls “Lights!”, “Curtain up!”, “Music!” — and nothing happens. Click Bolt. Model the first cue: add <b>broadcast lights and wait</b> after “say Lights!”. Click the Curtain and add <b>when I receive lights</b> → <b>switch backdrop to Lit stage</b>. Run it.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card to add the curtain and music cues. Discuss <b>broadcast</b> versus <b>broadcast and wait</b>: “and wait” makes Bolt wait until every script that received the message has finished — so he only says “Bravo, Dot!” after the song.</p><p>Answer — Bolt: switch backdrop to Dark stage, say Lights! for 1, broadcast lights and wait, say Curtain up! for 1, broadcast curtain and wait, say Music! for 1, broadcast music and wait, say Bravo, Dot! for 2 · Curtain: when I receive lights → switch backdrop to Lit stage; when I receive curtain → repeat until y position &gt; 250 [change y by 8], hide · Dot: when I receive music → play sound magic, say La la laaa! for 2.</p><p>Common bugs: message names that don’t match exactly (“Lights” vs “lights”); plain broadcast, so Bolt says Bravo during the song.</p>' },
      { min: 12, title: 'Add a cue', html: '<p>Pairs add a fourth cue of their own (applause, a bow, a costume change) and test that it happens in order.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> why are messages better than lots of waits? When do you need “and wait”? Next lesson: using a list to collect the audience’s votes.</p>' }
    ],
    support: 'Give the message names on cards; model the lights cue fully before pupils start.',
    stretch: 'Make the curtain come down again with a “finale” message after the song, and have every sprite bow when it receives “bow”.',
    assess: ['Sends messages with broadcast', 'Starts scripts with when I receive', 'Chooses broadcast and wait to keep events in order and explains why'],
    steps: [
      { t: 'Nobody hears', d: 'Press Run. Bolt calls the cues, but nothing happens! Click Bolt and read his script.' },
      { t: 'Lights!', d: 'Under “say Lights! for 1 secs” add “broadcast message1 and wait” (Events). Type lights in it.' },
      { t: 'Hear the cue', d: 'Click the Curtain. Add “when I receive” and type lights. Under it put “switch backdrop to” Lit stage.' },
      { t: 'Curtain up!', d: 'Bolt: broadcast curtain and wait after Curtain up!. Curtain: when I receive curtain → repeat until y position > 250 [change y by 8], then hide.' },
      { t: 'Music!', d: 'Bolt: broadcast music and wait after Music!, then say Bravo, Dot! for 2 secs. Dot: when I receive music → play sound magic and say La la laaa! for 2 secs.' },
      { t: 'Test it', d: 'Press Run. Do the cues happen in order, with Bravo after the song?' }
    ]
  },
  {
    id: 'theatre-22-votes', unit: u(4, 22), title: 'The audience vote', ...B4,
    summary: 'Data in a list. The audience votes for their favourite act by clicking Pip, Dot or Bolt. Pupils add each vote to a list, then finish Bramble’s counting loop, which goes through the list item by item and counts the votes for Pip.',
    objective: 'We are learning to collect data in a list and use a loop to count items in it.',
    success: ['I can add items to a list when something happens.', 'I can use item and length of a list.', 'I can use a loop, a counter and an if to count the items that match.'],
    curriculum: ['data', 'ssr', 'reason'],
    words: [['list', 'a variable that stores many items in order'], ['item', 'one thing in a list, found by its number'], ['length', 'how many items are in a list'], ['data', 'facts and figures we collect'], ['counter', 'a variable that goes up by one each time something is counted']],
    need: [...DEV, 'Sticky notes for the warm-up vote'],
    plan: [
      { min: 8, title: 'A class vote', html: '<p>Pupils vote for their favourite fruit on sticky notes and stick them in a line on the board. <b>Ask:</b> how do we count the votes for apple? (Go along the line one note at a time; each time it says apple, add one to a tally.) That is an algorithm the computer can follow: a <b>loop</b> through a <b>list</b> with a <b>counter</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. The empty votes list shows on the stage. Click Pip: he says thank you, but no vote goes in the list. Click Pip and add <b>add Pip to votes</b> (Lists) under “when this sprite clicked”. Run and click Pip three times: three items.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: add votes for Dot and Bolt, then click Bramble and read his counting script: when space is pressed, count = 0, i = 1, repeat until i &gt; length of votes [change i by 1]. They add the missing <b>if (item i of votes) = Pip then change count by 1</b> inside the loop, above change i by 1.</p><p>Trace it on the board with a list of five votes: i = 1, 2, 3… Common bugs: the if below change i by 1 (it checks the wrong item); typing “pip” instead of “Pip”; using item 1 instead of item i.</p>' },
      { min: 12, title: 'Who won?', html: '<p>Pairs make two more counter variables (dotCount, boltCount) and count every act in the same loop, then announce the winner with if blocks.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> why do we need i? What does length of votes tell us? Where else do computers count data in lists? Next lesson: one script that makes a whole chorus line.</p>' }
    ],
    support: 'Trace the loop on paper with sticky notes first; give the finished if block on the board.',
    stretch: 'Count every act and say who won. Stop people voting twice in a row by checking the last item of the list.',
    assess: ['Adds items to a list in response to clicks', 'Uses item i and length of a list in a loop', 'Counts matching items with an if and a counter'],
    steps: [
      { t: 'Try voting', d: 'Press Run. Click Pip, Dot and Bolt. Does the votes list on the stage change? (Not yet!)' },
      { t: 'Record a vote', d: 'Click Pip. From Lists, put “add thing to votes” under “when this sprite clicked”. Type Pip instead of thing.' },
      { t: 'Every act', d: 'Do the same for Dot (add Dot to votes) and Bolt (add Bolt to votes). Run it and vote a few times.' },
      { t: 'Read the counter', d: 'Click Bramble. When space is pressed he goes through the list with i: 1, 2, 3… but doesn’t count anything yet.' },
      { t: 'Count Pip’s votes', d: 'Inside the repeat until, above change i by 1, add an “if then”. Its condition: the 0 = 10 block with “item 1 of votes” on the left (drop the i variable onto the 1) and a text block saying Pip on the right. Inside: change count by 1.' },
      { t: 'Test it', d: 'Run, vote Pip, Dot, Pip, Bolt, Pip, then press space. Does count say 3?' }
    ]
  },
  {
    id: 'theatre-23-chorus', unit: u(4, 23), title: 'The chorus line', ...B4,
    summary: 'One script, many dancers. Bun the bunny dances alone, but the grand show needs a chorus line of six. Instead of making six sprites with six copies of the code, pupils use clones: one script makes the clones in a line, and one “when I start as a clone” script makes every clone dance.',
    objective: 'We are learning to use clones so one script can be reused for many copies of a sprite (generalising).',
    success: ['I can create clones with a repeat.', 'I can use when I start as a clone to give every clone the same script.', 'I can explain why one script for many clones is better than copying sprites.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['clone', 'a copy of a sprite made while the program runs'], ['generalise', 'make one solution that works for many cases'], ['instance', 'one copy of something'], ['efficient', 'doing the job with fewer blocks'], ['repeat loop', 'runs the blocks inside it a number of times']],
    need: [...DEV],
    plan: [
      { min: 8, title: 'One instruction, many dancers', html: '<p>Ask six pupils to stand in a line. Give ONE instruction to all of them: “Every dancer: wave, then turn round.” <b>Ask:</b> did I need to tell each person separately? That is the idea of a <b>clone</b>: one set of instructions, many copies.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>: Bun dances alone in the middle. <b>Ask:</b> how could we get six dancers? (Make five more sprites and copy the code into each — and change all six every time we change the dance!) Show <b>create clone of myself</b> and <b>when I start as a clone</b> in Control.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: the flag script hides Bun, goes to x −300, and <b>repeat 6</b> [create clone of myself, change x by 120]. A new script <b>when I start as a clone</b> → show, repeat 10 [next costume, wait 0.3].</p><p>Common bugs: the dance left in the flag script (only the hidden original dances); show missing, so the clones are invisible too; change x inside the clone script instead of the loop.</p><p>Ask: “If we want them to dance faster, how many blocks do we change?” (One.)</p>' },
      { min: 12, title: 'Make it your own', html: '<p>Pairs change the line: more dancers (watch the spacing!), two rows with a nested repeat, or a broadcast “bow” that every clone receives.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> what is the same about every clone? What is different? (Their x position.) Why is one script better? Next lesson: the grand show, your final project.</p>' }
    ],
    support: 'Build the clone loop together; pupils make the clone script and test.',
    stretch: 'Use a variable “dancer” that goes up by 1 for each clone and make every second clone jump. Make all the clones bow when they receive “bow”.',
    assess: ['Creates clones with a repeat', 'Gives clones behaviour with when I start as a clone', 'Explains how clones generalise one script to many copies'],
    steps: [
      { t: 'A lonely dancer', d: 'Press Run. Bun dances on her own. The show needs six!' },
      { t: 'Hide the original', d: 'Click Dancer. Take the repeat 10 dance off the flag script and put it to one side. Swap show for hide and change go to x to -300.' },
      { t: 'Make the line', d: 'Under go to x -300 add repeat 6 with “create clone of myself” (Control) and “change x by 120” inside.' },
      { t: 'Every clone dances', d: 'Start a new script with “when I start as a clone” (Control). Add show, then attach the repeat 10 dance underneath.' },
      { t: 'Test it', d: 'Press Run. Do six dancers appear in a line and dance together?' },
      { t: 'One change', d: 'Change the wait in the clone script to 0.15. How many dancers changed?' }
    ]
  },
  {
    id: 'theatre-24-gala', unit: u(4, 24), title: 'Project: the grand show', ...B4,
    summary: 'The final project. Pupils plan and build the Lantern Street Theatre grand show: a variable that changes (applause, tickets, a score), messages that cue the acts, an if that decides something, loops — and anything else from the unit. They test, debug and present their show.',
    objective: 'We are learning to design, build and evaluate a program that combines variables, messages, selection and repetition.',
    success: ['I can plan a program and decompose it into scripts.', 'I can use a variable, messages, an if and loops together.', 'I can test, debug and improve my show.', 'I can explain how my program works.'],
    curriculum: ['design', 'ssr', 'reason', 'data'],
    words: [['decompose', 'break a big job into smaller parts'], ['variable', 'a named value that can change'], ['broadcast', 'send a message to every sprite'], ['selection', 'choosing what to do with if'], ['evaluate', 'judge how well something works and how to improve it']],
    need: [...DEV, 'A planning sheet: acts, cues (messages), variables and their starting values, rules (if … then)'],
    plan: [
      { min: 8, title: 'The brief', html: '<p>The grand show is the theatre’s biggest night. Share the success criteria: a variable that changes, a broadcast with a “when I receive”, an if that decides something, a loop, and at least three sprites with code. Show the example idea: Bolt welcomes the audience, cues the curtain and Dot’s song; the audience clicks Pip to clap (applause + 1); if applause &gt; 2, Bolt calls an encore.</p>' },
      { min: 12, title: 'Plan', html: '<p>Pairs plan on the sheet: the acts in order, the message for each cue, each variable with its starting value and what changes it, and the if … then rules. Check plans before building.</p>' },
      { min: 25, title: 'Build and test', html: '<p>Pupils build cue by cue, testing as they go. Prompt them to use what they have learned: timing and sequence, repeats, decomposition onto sprites, conditions and repeat until, variables, messages and broadcast and wait, lists or clones if they want them. Ask: “Which message starts this? Where is the variable set? What is your condition?”</p>' },
      { min: 10, title: 'Gala night', html: '<p>Pairs present their show to another pair and explain one part of the code. The audience checks the success criteria and gives a star and a wish.</p>' },
      { min: 5, title: 'Evaluate', html: '<p>Pupils write two sentences: what works well, and what they would improve next. Celebrate the whole unit: from walking Pip to his star to running the grand show!</p>' }
    ],
    support: 'Start from the example idea; pairs build it first, then change one act.',
    stretch: 'Use a list (a programme of acts) and go through it with a loop to cue each act, or a chorus line of clones for the finale.',
    assess: ['Plans and decomposes the show into scripts and messages', 'Combines a variable, messages, selection and loops', 'Tests, debugs and evaluates the program'],
    steps: [
      { t: 'Plan the show', d: 'On your sheet: the acts, the message for each cue, your variables and your if … then rules.' },
      { t: 'The welcome', d: 'Bolt starts the show: set your variables, show them, and say the welcome.' },
      { t: 'Cue the acts', d: 'Use broadcast … and wait for each cue, and when I receive scripts for the curtain and the acts.' },
      { t: 'A variable that changes', d: 'Let the audience click to clap (change applause by 1), or count tickets or points.' },
      { t: 'A decision', d: 'Use an if: for example, if applause > 2 then call an encore.' },
      { t: 'Test, then present', d: 'Run it, fix it, then present your show to another pair and explain how it works.' }
    ]
  }
];

export const SLIDES = {
  'theatre-2-steps': [
    { t: 'Up to the stage', pic: true, b: ['Bun is at the bottom of the steps', 'The spotlight star is up on the stage', 'Plan the route, then code it'], notes: 'Open the starter and press GO: Bun walks right 2 and stops at the bottom of the steps.' },
    { t: 'Plan with arrows', lead: '→ → ↑ ↑ ↑ → → →', q: 'How many blocks will that be?', notes: 'Lay out arrow cards. Three blocks: move right 2, move up 3, move right 3 — the numbers save us from lots of blocks.' },
    { t: 'Algorithm', lead: 'An algorithm is a set of steps in the right order.', b: ['Plan it first', 'Then turn it into blocks'], notes: 'Pupils plan with arrow cards before touching the screen.' },
    { use: 'steps' },
    { t: 'Think', q: 'Does the order of the blocks matter?', notes: 'Try move up first: Bun floats up in the air before reaching the steps. It still ends on the star, but it is not the route we planned. Next lesson: debugging Pip’s dance.' }
  ],
  'theatre-4-ball': [
    { t: 'Step and clap!', lead: 'step and clap × 5', q: 'How can we write a pattern quickly?', notes: 'Do the pattern together, then write it once with × 5.' },
    { t: 'Bounce the ball', pic: true, b: ['Move right, hop… one bounce', 'Bramble is 5 bounces away', 'Copy the blocks 5 times? Or…'], notes: 'Press GO in the starter: one bounce.' },
    { t: 'Repeat', lead: 'A repeat block does the blocks inside it again and again.', b: ['Tap repeat: it opens', 'Tap move right and hop: they go inside', 'Set the number to 5'], notes: 'Show the orange Control tab and the repeat block.' },
    { use: 'steps' },
    { t: 'Think', q: 'Which is easier to change to 8 bounces: 10 copied blocks or a repeat?', notes: 'The repeat: change one number. Next lesson: waking up the cast with a tap.' }
  ],
  'theatre-5-wake': [
    { t: 'Wake-up calls', q: 'What made each person move?', b: ['Bell → stand up', 'Clap → wave', 'Click → jump'], notes: 'The warm-up game. Each signal starts an action.' },
    { t: 'Event', lead: 'An event is something that happens, like a tap, that starts a program.', notes: 'The green flag is an event too: it starts when GO is pressed.' },
    { t: 'The sleepy cast', pic: true, b: ['Press GO: everyone says Zzz…', 'Tap Pip: nothing happens', 'Give each character a tap program'], notes: 'Remember: taps only work after pressing GO.' },
    { use: 'steps' },
    { t: 'Think', table: [['Block', 'When does it run?'], ['the green flag', 'when GO is pressed'], ['when you tap this character', 'every time you tap that character']], notes: 'Next lesson: our first show.' }
  ],
  'theatre-6-show': [
    { t: 'Our first show', pic: true, b: ['Pip and Dot on the lit stage', 'Plan it, build it, test it', 'Then perform it!'], notes: 'Each pair makes a short show.' },
    { t: 'Success criteria', b: ['A green flag program with at least three blocks', 'A repeat', 'Something happens when you tap a character', 'A character says something'], notes: 'Pupils tick these off as they build.' },
    { t: 'Plan first', b: ['Start', 'Middle', 'End'], q: 'What will Pip and Dot do in each part?', notes: 'Draw three boxes and the blocks under each.' },
    { use: 'steps' },
    { t: 'Showtime!', lead: 'Perform your show. Say one thing you liked about your partner’s show.', notes: 'End of Block 1: algorithms, repeats, events and debugging.' }
  ],
  'theatre-7-joke': [
    { t: 'The puppet show', lead: 'This block we make a puppet show for Lantern Street Theatre — with the full blocks editor.', notes: 'Introduce the new editor: blocks left, stage right, sprites underneath.' },
    { t: 'Knock knock!', pic: true, b: ['Pip tells the joke', 'Bramble answers — but too early!'], notes: 'Press Run in the starter: Bramble talks over Pip.' },
    { t: 'A timeline', table: [['Seconds', 'Pip', 'Bramble'], ['0–2', 'Knock knock!', '(waits)'], ['2–4', '(waits)', 'Who’s there?'], ['4–6', 'Pip!', '(waits)'], ['6–8', '(waits)', 'Pip who?'], ['8–11', 'Pip pip hooray…', '']], notes: 'Each sprite runs its own sequence at the same time; waits make them take turns.' },
    { use: 'steps' },
    { t: 'Think', q: 'Why did Bramble need a wait at the start?', notes: 'So his first line starts after Pip’s. Next lesson: a dance party started by events.' }
  ],
  'theatre-9-scenes': [
    { t: 'The sunrise scene', pic: true, b: ['1 It is night', '2 The sun rises and it becomes day', '3 Dot flies in and sings', '4 Bramble wakes up'], notes: 'Press Run in the starter: only part 1 happens.' },
    { t: 'Decompose', lead: 'Decompose: break a big job into smaller parts that are easier to solve.', notes: 'Each part of the scene goes to one sprite.' },
    { t: 'Who does what?', table: [['Part', 'Sprite', 'Blocks'], ['Sunrise', 'Sun', 'glide, switch backdrop'], ['Song', 'Dot', 'wait, glide, say'], ['Wake up', 'Bramble', 'wait, say']], notes: 'Build and test one part at a time.' },
    { use: 'steps' },
    { t: 'Think', q: 'Why is it easier to build one part at a time?', notes: 'Each part is small enough to test and fix on its own. Next lesson: filling the seats with loops.' }
  ],
  'theatre-10-seats': [
    { t: 'Seats for the audience', pic: true, q: 'How many instructions for 27 seats, one at a time?', notes: '27 stamps and 27 moves! Open the starter: three seats from copied blocks.' },
    { t: 'A row', code: 'repeat 9\n    stamp\n    change x by 60', notes: 'One repeat stamps a whole row.' },
    { t: 'Rows of seats', code: 'repeat 3\n    repeat 9\n        stamp\n        change x by 60\n    set x to -240\n    change y by -70', notes: 'A nested loop: the inner loop makes a row, the outer loop makes the rows.' },
    { use: 'steps' },
    { t: 'Think', q: 'How many seats does repeat 4 [repeat 7 […]] stamp?', notes: '28. Next lesson: debugging the dress rehearsal.' }
  ],
  'theatre-11-rehearsal': [
    { t: 'The director’s notes', b: ['1 Pip walks to the middle, changing costume', '2 Click Bolt: he says Beep! Welcome!', '3 Press space: Dot says Hello! then Goodbye!'], notes: 'These are the expected results.' },
    { t: 'Dress rehearsal', pic: true, q: 'What actually happens?', notes: 'Run the starter, click Bolt, press space. Record what is different.' },
    { t: 'Expected and actual', table: [['Note', 'Expected', 'Actual'], ['1', 'Pip reaches the middle', '?'], ['2', 'Bolt talks when clicked', '?'], ['3', 'Hello!, then Goodbye!', '?']], notes: 'Fill in the Actual column together. Is it a loop, an event or an order bug?' },
    { use: 'steps' },
    { t: 'Think', q: 'What is a good way to debug?', notes: 'Test, compare expected with actual, fix one thing, test again. Next lesson: your own puppet show.' }
  ],
  'theatre-12-puppets': [
    { t: 'The puppet show', pic: true, b: ['Pip, Bramble and Dot', 'A Theatre and a Night backdrop', 'Your story!'], notes: 'The Block 2 project.' },
    { t: 'Success criteria', b: ['At least two sprites have code', 'At least two different events', 'A repeat loop', 'At least four lines of dialogue that take turns'], notes: 'Pupils check these off as they build.' },
    { t: 'Storyboard', b: ['Six boxes', 'Which sprite does each part?', 'Which event starts it?', 'Where do you need a repeat?'], notes: 'Check plans before building.' },
    { use: 'steps' },
    { t: 'Opening night', lead: 'A star (something good) and a wish (something to improve).', notes: 'Next block: games night, where programs make decisions.' }
  ],
  'theatre-14-door': [
    { t: 'The stage door', pic: true, b: ['Bolt asks for the magic word', 'He always says the same thing', 'Let’s make him decide!'], notes: 'Run the starter, click Bolt and type an answer.' },
    { t: 'If … else', code: 'if answer = please then\n    say Come in!\n    switch backdrop to Backstage\nelse\n    say That’s not the magic word!', notes: 'The condition is true or false; only one branch runs.' },
    { t: 'Test it', table: [['Answer', 'Condition', 'Bolt says'], ['please', 'true', 'Come in!'], ['pizza', 'false', 'That’s not the magic word!'], ['Please', '?', '?']], notes: 'Please with a capital is false: the computer compares exactly.' },
    { use: 'steps' },
    { t: 'Think', q: 'How could Bolt let in “please” and “Please”?', notes: 'An or block, or the contains block. Next lesson: comparing numbers.' }
  ],
  'theatre-15-spotlight': [
    { t: 'In the spotlight?', pic: true, q: 'Is Pip in the light at x = 250?', notes: 'Run the starter and move Pip to the far right: he says he is in the spotlight — wrong!' },
    { t: 'The number line', lead: '−300 ……… −150 [ spotlight ] 150 ……… 300', b: ['Bigger than −150', 'AND smaller than 150'], notes: 'Both must be true.' },
    { t: 'Operators', table: [['Block', 'True when…'], ['x position > -150', 'Pip is right of −150'], ['x position < 150', 'Pip is left of 150'], ['… and …', 'both are true']], notes: '“or” would be true almost everywhere.' },
    { use: 'steps' },
    { t: 'Think', q: 'When is an and condition true? When is an or condition true?', notes: 'And: both. Or: at least one. Next lesson: raising the curtain with repeat until.' }
  ],
  'theatre-16-curtain': [
    { t: 'Curtain up!', pic: true, b: ['The curtain rises… for ever', 'Pip talks behind it'], notes: 'Run the starter.' },
    { t: 'Loops that check', table: [['Block', 'Stops when…'], ['repeat 10', 'it has run 10 times'], ['forever', 'never'], ['repeat until …', 'the condition is true'], ['wait until …', 'waits until the condition is true']], notes: 'Repeat until and wait until check the condition again and again.' },
    { t: 'The plan', code: 'Curtain:\n    repeat until y position > 250\n        change y by 5\n    hide\nPip:\n    wait until (y position of Curtain) > 250\n    say Welcome to the show!', notes: 'Hide goes after the loop, not inside it.' },
    { use: 'steps' },
    { t: 'Think', q: 'Why is repeat until better than repeat 10 here?', notes: 'It stops at the right place even if the speed changes. Next lesson: debugging loops and conditions.' }
  ],
  'theatre-17-lights': [
    { t: 'The director’s notes', b: ['1 The spotlight follows Pip and changes colour while space is held', '2 Pip walks right until x position > 200', '3 Dot waits until Pip reaches her, then says Bravo!'], notes: 'These are the expected results.' },
    { t: 'The light show', pic: true, q: 'What goes wrong?', notes: 'Run the starter and hold space. Nothing works.' },
    { t: 'Trace the conditions', table: [['Condition', 'True at the start?', 'Ever true?'], ['x position < 200 (Pip at −300)', 'yes', '—'], ['key space pressed? (checked once)', 'no', 'not checked again'], ['touching the edge (Dot)', 'no', 'never']], notes: 'Each bug is in a condition or where it is checked.' },
    { use: 'steps' },
    { t: 'Think', q: 'Why does an if outside a loop only check once?', notes: 'It runs once, in sequence, before the loop starts. Next lesson: your own game.' }
  ],
  'theatre-18-games': [
    { t: 'Games night', pic: true, b: ['The foyer, Pip, a ball and a star', 'Design your own game'], notes: 'The Block 3 project.' },
    { t: 'Rules are conditions', b: ['If the ball touches Pip, then score goes up', 'If the ball falls off the bottom, then it goes back to the top', 'Repeat until score = 3, then You win!'], notes: 'An example: keepy-uppy.' },
    { t: 'Success criteria', b: ['An if inside a loop', 'A sensing condition', 'A comparison or and / or', 'A loop that checks a condition', 'Feedback: a score or a message'], notes: 'Pupils tick these off.' },
    { use: 'steps' },
    { t: 'Star and wish', lead: 'Play a partner’s game. Find a bug kindly!', notes: 'Next block: the grand show.' }
  ],
  'theatre-19-tickets': [
    { t: 'The ticket booth', pic: true, b: ['Biscuit sells the tickets', 'Nobody is counting!'], notes: 'Run the starter and click Biscuit.' },
    { t: 'Variable', lead: 'A variable is a named value that the program remembers — and it can change.', b: ['seats = 20', 'sold = 0'], notes: 'The two pots of counters from the warm-up.' },
    { t: 'Set, change, use', code: 'when green flag clicked\n    set seats to 20\n    set sold to 0\nwhen this sprite clicked\n    if seats > 0 then\n        change seats by -1\n        change sold by 1\n    else\n        say Sorry, sold out!', notes: 'Initialise at the start; change on each event; use the value in a condition.' },
    { use: 'steps' },
    { t: 'Think', q: 'What is seats + sold always equal to? Why?', notes: '20 — every sale moves one from seats to sold. Next lesson: the interval game on a micro:bit.' }
  ],
  'theatre-21-cues': [
    { t: 'Stage manager', q: 'How did each person know when to act?', notes: 'The cue cards warm-up.' },
    { t: 'On cue', pic: true, b: ['Bolt calls the cues', 'Nobody hears them!'], notes: 'Run the starter.' },
    { t: 'Messages', table: [['Block', 'What it does'], ['broadcast lights', 'sends the message and carries on'], ['broadcast lights and wait', 'sends it and waits until every receiver has finished'], ['when I receive lights', 'starts a script when the message arrives']], notes: 'Message names must match exactly.' },
    { use: 'steps' },
    { t: 'Think', q: 'Why does Bolt need “and wait” before Bravo?', notes: 'So he waits for the whole song. Next lesson: collecting votes in a list.' }
  ],
  'theatre-22-votes': [
    { t: 'The audience vote', pic: true, b: ['Click your favourite act', 'Pip, Dot or Bolt', 'Bramble counts the votes'], notes: 'Run the starter: the votes list stays empty.' },
    { t: 'A list', lead: 'A list stores many items in order: item 1, item 2, item 3…', b: ['Pip', 'Dot', 'Pip', 'Bolt', 'Pip'], notes: 'The sticky notes from the warm-up.' },
    { t: 'Counting', code: 'set count to 0\nset i to 1\nrepeat until i > length of votes\n    if item i of votes = Pip then\n        change count by 1\n    change i by 1', notes: 'Trace it: i = 1, 2, 3, 4, 5. count = 3.' },
    { use: 'steps' },
    { t: 'Think', q: 'Why do we need the variable i?', notes: 'It says which item we are looking at. Next lesson: a chorus line of clones.' }
  ],
  'theatre-23-chorus': [
    { t: 'The chorus line', pic: true, b: ['Bun dances alone', 'The show needs six dancers'], notes: 'Run the starter.' },
    { t: 'Clones', lead: 'A clone is a copy of a sprite made while the program runs. Every clone runs the same clone script.', notes: 'One set of instructions, many copies.' },
    { t: 'One script, six dancers', code: 'when green flag clicked\n    hide\n    go to x -300 y -150\n    repeat 6\n        create clone of myself\n        change x by 120\nwhen I start as a clone\n    show\n    repeat 10\n        next costume\n        wait 0.3', notes: 'Change one block and every clone changes.' },
    { use: 'steps' },
    { t: 'Think', q: 'What is the same about every clone, and what is different?', notes: 'Same script; different x position. Next lesson: the grand show.' }
  ],
  'theatre-24-gala': [
    { t: 'The grand show', pic: true, b: ['The final project', 'Plan it, build it, test it', 'Present it'], notes: 'The starter has the stage, the curtain and the cast.' },
    { t: 'Success criteria', b: ['A variable that changes', 'A broadcast and a when I receive', 'An if that decides something', 'A loop', 'At least three sprites with code'], notes: 'Pupils tick these off as they build.' },
    { t: 'Plan', table: [['Act', 'Message (cue)', 'Variable', 'Rule (if … then)'], ['Welcome', '—', 'applause = 0', ''], ['Curtain', 'curtain', '', ''], ['Song', 'song', 'applause + 1 per click', 'if applause > 2: encore']], notes: 'An example plan.' },
    { use: 'steps' },
    { t: 'Lantern Street Theatre!', b: ['Sequence, repeats and events', 'Decomposition and debugging', 'Selection and conditions', 'Variables, messages, lists and clones'], notes: 'Celebrate the whole unit.' }
  ]
};
