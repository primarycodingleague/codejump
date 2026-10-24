// The Robot Lab's lesson unit — see lessons/units/README.md. lessons.js merges it in.
// ROBOT LIBRARIAN: Willow Lane Library has a new robot helper, Sparky. Ms Okafor the librarian gives the class a job for Sparky
// every lesson: wake up and welcome visitors, show them round, lead story-time stretches, run the help desk and the returns desk,
// host quiz night, run a reading survey and finally star in the library's Open Day.
// Block 1 Hello, library! (Years 3–4) · Block 2 The help desk (Years 4–5) · Block 3 Open Day (Years 5–6).
// Lesson 6 of each block is a design-and-make project. The Robot Lab's two earlier lessons (robot-storyteller, robot-quiz) are
// folded in with { adopt }. Starters + answers + play scripts: lessons/builds/robot/library.mjs; test: tests/unit-robot.test.mjs.
// Lessons 16–18 use My blocks (Blockly's own "to do something" blocks), added to the Robot Lab for this unit.
const N = 'Robot Librarian';
const u = m => `${N} · Block ${Math.ceil(m / 6)} · Lesson ${m}`; // m counts on through the whole unit
const R = { ks: 'ks2', minutes: 60, type: 'robot', tool: 'Robot Lab (blocks)' };
const B1 = { ...R, years: 'Years 3–4' }, B2 = { ...R, years: 'Years 4–5' }, B3 = { ...R, years: 'Years 5–6' };
const DEV = ['A device per pupil or pair, with CodeJump open', 'The board, to show the class'];

export const LESSONS = [
  // ═══════════════════════ BLOCK 1 · HELLO, LIBRARY! (Years 3–4) ═══════════════════════
  {
    id: 'library-1-welcome', unit: u(1), title: 'Wake up, Sparky!', ...B1,
    summary: 'The first Robot Librarian lesson. Willow Lane Library has a new robot helper, Sparky, but it is still switched off. Pupils act out precise instructions, plan Sparky’s welcome as an algorithm on paper, then build it in blocks: eyes on, a smile, a welcome, a look around the room.',
    objective: 'We are learning to write an algorithm as clear, exact steps in the right order, and turn it into a program.',
    success: ['I can plan an algorithm before I code it.', 'I can join blocks in the same order as my plan.', 'I can run my program and check it does what I planned.'],
    curriculum: ['design', 'reason'],
    words: [['algorithm', 'a set of exact steps, in the right order, to do a job'], ['program', 'an algorithm written in a language a computer understands'], ['sequence', 'the order the steps go in'], ['run', 'make the program start']],
    need: [...DEV, 'Paper and a pencil per pair, for the plan'],
    plan: [
      { min: 8, title: 'Welcome to Willow Lane Library', html: '<p>Tell the class that this term they work for <b>Ms Okafor</b>, the librarian at Willow Lane Library. The library has a new robot helper called <b>Sparky</b>, and the class will write every program it runs. Sparky only does exactly what its blocks say, in exactly that order.</p><p>Warm up: you are the robot. Ask the class to tell you how to welcome a visitor at the door. Follow vague instructions badly (“be friendly” — you stand still). <b>Ask:</b> what do I need? Exact steps, in order: “smile, say hello, look at them.” Introduce <b>algorithm</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter (<b>Open the starter</b>) and press <b>Run</b>. Sparky’s eyes go dark and it makes a sleepy face: it is switched off. Ms Okafor’s job: <b>wake Sparky up and welcome the visitors</b>.</p><p>Show the categories on the left (Events, Moves, Face & lights, Speech…). Drag <b>set eyes light to</b> from Face & lights under the last block and press Run again. <b>Ask:</b> what changed? What should come next?</p>' },
      { min: 8, title: 'Plan it on paper', html: '<p>Pairs write the welcome as a numbered algorithm before they touch the screen: 1 eyes on · 2 happy face · 3 say the welcome · 4 look left · 5 look right · 6 look ahead · 7 blink. Check a few plans: “Read it to me. Is anything missing? Is anything in the wrong order?”</p>' },
      { min: 24, title: 'Your turn', html: '<p>Pupils follow the Lesson card and build their plan, one block at a time, pressing Run after each block. Encourage them to tick each step of the paper plan as it works.</p><p>Common slips: a block dropped loose in the space (it doesn’t run — it must click on under the others); the welcome said before the smile (the order matters!).</p>' },
      { min: 10, title: 'Share', html: '<p>Two pairs run their welcome on the board while the class reads along with their paper plan. <b>Ask:</b> did the program do exactly what the plan said? What would happen if we swapped two steps? Next lesson: Sparky shows a visitor round the library.</p>' }
    ],
    support: 'Give pairs the plan already written on a card (the seven steps) to match block by block. Let them leave out the looking around at first.',
    stretch: 'Use “set voice to” to choose Sparky’s voice, and “set body colour to” to give it a library uniform. Add “say … until done” lines so Sparky introduces itself.',
    assess: ['Writes an algorithm as clear steps in order before coding', 'Joins blocks in the same order as the plan', 'Runs the program and checks it against the plan'],
    steps: [
      { t: 'Meet Sparky', d: 'Press Run. Sparky is still asleep! Your job: wake it up and welcome the visitors to the library.' },
      { t: 'Plan it', d: 'On paper, write your algorithm: eyes on, smile, say welcome, look left, look right, look ahead, blink.' },
      { t: 'Eyes on', d: 'From Face & lights, drag “set eyes light to” and join it under “make a sleepy face”. Click the colour and pick yellow.' },
      { t: 'Smile and welcome', d: 'Add “make a happy face”. From Speech, add “say Hello! until done” and change Hello! to Welcome to Willow Lane Library!' },
      { t: 'Look around', d: 'From Moves, add “look ahead” three times: choose left, then right, then ahead. From Face & lights, add “blink”.' },
      { t: 'Test it', d: 'Press Run. Does Sparky do every step of your plan, in the same order? Tick each step on your paper.' }
    ]
  },
  {
    id: 'library-2-tour', unit: u(2), title: 'The library tour', ...B1,
    summary: 'Ms Okafor wants Sparky to show new visitors round the library. Pupils decompose the tour into parts (the story corner, the computers, the returns box, goodbye), see that each part is the same pattern — look, then talk — and build a longer sequence one part at a time.',
    objective: 'We are learning to break a big job into smaller parts (decomposition) and build a longer sequence part by part.',
    success: ['I can break the tour into smaller parts.', 'I can build and test one part at a time.', 'I can spot the pattern that each part follows.'],
    curriculum: ['design', 'ssr'],
    words: [['decompose', 'break a big job into smaller parts'], ['sequence', 'the order the steps go in'], ['pattern', 'something that happens the same way again and again'], ['test', 'run it to check it works']],
    need: [...DEV, 'A simple map of a library (or of your own classroom) to label the tour stops'],
    plan: [
      { min: 8, title: 'Big jobs, small parts', html: '<p><b>Ask:</b> how do you tidy your bedroom? It feels huge, so we break it up: clothes, then books, then toys. Introduce <b>decompose</b>: breaking a big job into smaller parts. Each part is easier to do and to check.</p><p>Show a map of the library with four stops: the story corner (left), the computers (right), the returns box (down by Sparky’s feet), and the door.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Sparky starts the tour, looks left and says “This is the story corner.” Then it stops: only part 1 is done.</p><p><b>Ask:</b> what two things did Sparky do for part 1? (Look, then talk.) That is the <b>pattern</b> for every part. Write the tour as four parts on the board, each with “look ___, say ___”.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card, building part 2, testing it, then part 3, and so on. Insist on Run after each part — it is much easier to find a mistake in a small part than in the whole tour.</p><p>Common slips: “say” instead of “say … until done” (Sparky turns before it finishes talking — compare the two); a part with the look after the talk.</p>' },
      { min: 10, title: 'Make it yours', html: '<p>Fast finishers add a part of their own (the new books shelf? the quiet room?) and change what Sparky says to suit their own school library.</p>' },
      { min: 7, title: 'Share', html: '<p>Run two tours on the board. <b>Ask:</b> how many parts did your tour have? What was the same about every part? Why did testing one part at a time help? Next lesson: Sparky’s bedtime story has a bug.</p>' }
    ],
    support: 'Give pairs the four parts on cards (look left / story corner…) so they only have to build them. Start with just parts 2 and 4.',
    stretch: 'Add a fifth part of your own. Use “move head nod to 2 in 1 seconds” to make Sparky look down slowly at the returns box.',
    assess: ['Splits the tour into separate parts', 'Builds and tests one part at a time', 'Explains the look-then-talk pattern each part follows'],
    steps: [
      { t: 'Watch part 1', d: 'Press Run. Sparky does part 1 of the tour: it looks left and talks about the story corner. Then it stops.' },
      { t: 'Plan the parts', d: 'On paper, write the four parts: 1 story corner (left), 2 computers (right), 3 returns box (down), 4 goodbye (ahead).' },
      { t: 'Part 2', d: 'Under the last block, add “look ahead” (choose right) and “say Hello! until done”. Change Hello! to Here are the computers. Press Run to test.' },
      { t: 'Part 3', d: 'Add “look ahead” (choose down) and “say … until done”: The returns box is down here. Test it.' },
      { t: 'Part 4', d: 'Add “look ahead” and “say … until done”: Enjoy your visit! Test the whole tour.' },
      { t: 'Challenge', d: 'Add a part of your own for a place in YOUR library. Remember the pattern: look, then talk.' }
    ]
  },
  {
    adopt: 'robot-storyteller', unit: u(3), title: 'Story time: fix the bug', years: 'Years 3–4',
    summary: 'Sparky wakes up to read the morning story, but its program has a bug: it says good morning while it is still asleep. Pupils read the blocks and predict what will happen, run the program, spot where it goes wrong, fix the order and test again. Then they plant a bug for a partner to find.',
    objective: 'We are learning to predict what a program will do, and to find and fix a bug in its order (debugging).',
    success: ['I can read a program and say what it will do before I run it.', 'I can find the block that is in the wrong place.', 'I can fix the bug and test my program again.'],
    curriculum: ['design', 'reason'],
    words: [['predict', 'say what you think will happen before you run it'], ['bug', 'a mistake in a program'], ['debug', 'find and fix the mistakes'], ['sequence', 'the order the steps go in'], ['test', 'run it to check it works']],
    need: [...DEV, 'Optional: a pair of socks and shoes for the warm-up'],
    plan: [
      { min: 7, title: 'Warm up: the wrong order', html: '<p>Act out getting dressed in the wrong order: shoes on, <b>then</b> socks. <b>Ask:</b> what went wrong? Every step was right, but the <b>sequence</b> was wrong. Introduce <b>bug</b> (a mistake in a program) and <b>debug</b> (finding and fixing it).</p><p>Tell the class that Ms Okafor says Sparky’s morning story program has a bug in it.</p>' },
      { min: 10, title: 'Predict', html: '<p>Open the starter on the board. Read the blocks aloud like a story, <b>without pressing Run</b>: “Sparky’s eyes go off. It makes a sleepy face. It says Zzz… It says Good morning! Then it smiles and lights its eyes.” Pupils <b>predict</b> with a partner: what will we see? Take a vote.</p><p>Press <b>Run</b>. Sparky says “Good morning!” while it is still asleep. <b>Ask:</b> was your prediction right? Which block is in the wrong place?</p>' },
      { min: 15, title: 'Debug it', html: '<p>Pupils follow the Lesson card: they find the bug, drag <b>make a happy face</b> up under <b>say Zzz… until done</b> (the light block underneath comes with it) and press Run to <b>test</b>.</p><p>Model the debugging questions: What should happen? What actually happens? Where does it start to go wrong?</p>' },
      { min: 15, title: 'Bug swap', html: '<p>Pupils add the end of the story (Sparky looks down at the book and says it is time for a story), test it, then plant ONE bug by swapping two blocks. Partners swap devices: <b>predict</b> by reading the blocks, run, find the bug and fix it.</p>' },
      { min: 13, title: 'Share and think', html: '<p>Two pairs explain the bug they found and how they knew. <b>Ask:</b> what is the best way to find a bug? (Read the blocks, predict, run, and spot where what happens stops matching what should happen.) Next lesson: Sparky leads a stretch break and we stop copying blocks.</p>' }
    ],
    support: 'Pair pupils. Give a printed storyboard (sleep, wake up and smile, say good morning) to compare against the blocks, one block at a time.',
    stretch: 'Plant two bugs for your partner instead of one. Use “set voice to” to give Sparky a sleepy voice and then a wide-awake voice.',
    assess: ['Predicts what the program will do by reading the blocks', 'Finds the block in the wrong place and explains why it is a bug', 'Fixes the order and tests again', 'Plants and finds a bug with a partner'],
    steps: [
      { t: 'Predict', d: 'Read Sparky’s blocks like a story. Don’t press Run yet! Tell your partner what you think Sparky will do.' },
      { t: 'Run it', d: 'Press Run and watch Sparky’s face. Was your prediction right? What goes wrong?' },
      { t: 'Find the bug', d: 'Which block is in the wrong place? Point to it and tell your partner why.' },
      { t: 'Fix it', d: 'Drag “make a happy face” up so it sits under “say Zzz… until done”. The block under it comes too.' },
      { t: 'Test it', d: 'Press Run. Does Sparky smile and light its eyes BEFORE it says good morning?' },
      { t: 'Finish the story', d: 'At the bottom, add “look ahead” (choose down) and “say … until done”: Time for a story! Test it.' },
      { t: 'Bug swap', d: 'Swap two of your blocks to make a bug. Swap devices with a partner: can they predict, find and fix it?' }
    ]
  },
  {
    id: 'library-4-stretch', unit: u(4), title: 'Stretch break', ...B1,
    summary: 'After the story, Sparky leads the children in a stretch break: five nods and three head tilts. The starter does just one nod and one tilt, written out the long way. Pupils use repeat blocks (count-controlled loops) instead of copying blocks, and set the count to match the job.',
    objective: 'We are learning to use a repeat loop to do the same steps again, and to set how many times it repeats.',
    success: ['I can spot steps that happen again and again.', 'I can put steps inside a repeat block.', 'I can set the number so it repeats the right number of times.'],
    curriculum: ['ssr', 'design'],
    words: [['repetition', 'doing the same steps again'], ['loop', 'a block that runs the blocks inside it again and again'], ['count', 'how many times the loop repeats'], ['efficient', 'doing a job with fewer blocks']],
    need: [...DEV],
    plan: [
      { min: 8, title: 'Warm up: stretch!', html: '<p>Lead a stretch break: nod five times, tilt side to side three times. <b>Ask:</b> if I wrote that as instructions, how many lines would it be? (Ten for the nods!) Is there a quicker way to say it? “Nod <b>five times</b>.” That is <b>repetition</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Sparky says “Nod your head with me, five times!” and then nods… once. <b>Ask:</b> how many blocks make one nod? (Two: head nod to 8, then to 2.) How many for five nods? (Ten.) For a hundred?</p><p>Show <b>repeat 3 times</b> in Control. The blocks inside it run again and again: it is a <b>loop</b>. Demonstrate the drag: blocks under the one you drag come with it, so drag the extra ones back out.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: a repeat around the nod (count 5), then a repeat around the tilt (count 3). Ask them to <b>count out loud</b> as Sparky nods: is it exactly 5?</p><p>Common slips: “look ahead” left inside the repeat (Sparky looks ahead between every nod); the count left at 3; “move head tilt to 5” inside the tilt loop.</p>' },
      { min: 10, title: 'How many blocks?', html: '<p>Pairs count the blocks in their program with and without the loops. <b>Ask:</b> what would change if Ms Okafor wanted 20 nods? (Just one number.) Introduce <b>efficient</b>.</p>' },
      { min: 7, title: 'Share', html: '<p>A pupil leads the class in Sparky’s stretch from the board. <b>Ask:</b> where else do we use repetition? (Songs with a chorus, skipping, times tables.) Next lesson: Sparky gets help-desk buttons.</p>' }
    ],
    support: 'Do the nod loop together on the board first; pupils copy it and then build the tilt loop on their own.',
    stretch: 'Add a “wiggle” loop: repeat 4 times move eyes left/right to 2, then 8. Use “set all motors speed to 10” to make the stretch faster.',
    assess: ['Recognises steps that repeat', 'Puts the right blocks inside a repeat', 'Sets the count to match the job (5 nods, 3 tilts)'],
    steps: [
      { t: 'Count the nods', d: 'Press Run. Sparky asks for five nods, but how many does it do?' },
      { t: 'Get a repeat', d: 'From Control, drag “repeat 3 times” into an empty space next to your script.' },
      { t: 'Put the nod inside', d: 'Drag “move head nod to 8” into the repeat — the blocks under it come too. Drag “look ahead” back out and join it under the repeat.' },
      { t: 'Join it up', d: 'Join the repeat under “say Nod your head with me, five times! until done”. Change 3 to 5. Press Run and count.' },
      { t: 'Tilt three times', d: 'Do the same for the tilt: a repeat 3 times around “move head tilt to 2” and “move head tilt to 8”. Leave “move head tilt to 5” after the repeat.' },
      { t: 'Test it', d: 'Press Run and count out loud. Exactly 5 nods and 3 tilts?' }
    ]
  },
  {
    id: 'library-5-buttons', unit: u(5), title: 'Help desk buttons', ...B1,
    summary: 'Visitors need help when Sparky isn’t talking. Pupils use events: tapping Sparky’s head tells you the opening times, and the B and C keys are the help desk buttons that point the way to the books and the computers. Each event starts its own script.',
    objective: 'We are learning to use events (a tap or a key press) to start different scripts.',
    success: ['I can explain what an event is.', 'I can start a script when the robot is tapped.', 'I can start different scripts with different keys.'],
    curriculum: ['ssr', 'design'],
    words: [['event', 'something that happens, like a tap or a key press, that starts a script'], ['script', 'a group of blocks joined together under an event'], ['input', 'information that goes into a computer, like a key press'], ['output', 'what the computer does, like speaking or moving']],
    need: [...DEV],
    plan: [
      { min: 7, title: 'Warm up: what starts it?', html: '<p><b>Ask:</b> what makes a doorbell ring? A lift move? A crossing light change? Something has to <b>happen</b> first: a press. Introduce <b>event</b>. Play “events”: when I clap, you stand up; when I click, you sit down.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Sparky says “Tap my head, or press B or C”. Tap it: nothing happens! So far every script started with <b>when Run is clicked</b>.</p><p>Show the Events category. Drag <b>when the robot is tapped</b> into an empty space, choose <b>head</b>, add a say block under it. Run, then tap the head. <b>Ask:</b> what is the event? What is the output?</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: the tap script (opening times), then <b>when space key pressed</b> changed to <b>b</b> (look left to the books) and <b>c</b> (look right to the computers).</p><p>Remind them: events only work while the program is running — press Run first. If keys do nothing, click on the robot picture so the page isn’t typing into a box.</p>' },
      { min: 10, title: 'Test with a visitor', html: '<p>Pairs swap places: one is a visitor who only gets the instruction “tap or press a button”; the other watches. Does every button do what it should?</p>' },
      { min: 8, title: 'Share', html: '<p><b>Ask:</b> how many scripts does your program have? What starts each one? Why are events useful for a help desk? (Visitors choose what they need, when they need it.) Next lesson: design your own welcome robot.</p>' }
    ],
    support: 'Build the tap script together on the board. Pupils copy it, then make just the B button.',
    stretch: 'Add a button for the toilets (look down) and one that makes Sparky sleepy at closing time. Make each button light the chest light a different colour.',
    assess: ['Explains that an event starts a script', 'Builds a script under “when the robot is tapped”', 'Uses two different keys to start two different scripts'],
    steps: [
      { t: 'Try it', d: 'Press Run, then tap Sparky’s head. Does anything happen?' },
      { t: 'Tap event', d: 'From Events, drag “when the robot is tapped” into an empty space. Click robot and choose head.' },
      { t: 'Opening times', d: 'Under it, add “make a happy face” (choose surprised) and “say Hello! until done”: The library is open from 9 till 5. Run it and tap the head.' },
      { t: 'Button B', d: 'From Events, drag “when space key pressed” into an empty space and choose b. Add “look ahead” (choose left), “say … until done”: The books are on the left. Then “look ahead”.' },
      { t: 'Button C', d: 'Make another one for c: look right and say The computers are on the right.' },
      { t: 'Test every button', d: 'Press Run. Tap the head, press B, press C. Does each one start the right script?' }
    ]
  },
  {
    id: 'library-6-project', unit: u(6), title: 'Project: Sparky’s welcome show', ...B1,
    summary: 'The Block 1 project. Ms Okafor wants a welcome show for the library’s front desk. Pupils design their own show for Sparky on paper (a sequence with at least three things said, a repeat, and two events for visitors to try), then build it, test it and improve it.',
    objective: 'We are learning to design, build and test our own program using sequence, repetition and events.',
    success: ['I can plan my show before I build it.', 'My show has a sequence of at least three things Sparky says.', 'My show uses a repeat loop.', 'My show has two events that visitors can try.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['design', 'plan what your program will do before you build it'], ['sequence', 'the order the steps go in'], ['repetition', 'doing the same steps again with a loop'], ['event', 'something that happens that starts a script'], ['evaluate', 'decide what is good and what could be better']],
    need: [...DEV, 'A planning sheet per pair: three boxes (When Run is clicked · When the robot is tapped · When a key is pressed)'],
    plan: [
      { min: 8, title: 'The brief', html: '<p>Ms Okafor’s brief: “Sparky needs a <b>welcome show</b> for the front desk. It must welcome visitors, do something with a loop, and have two things visitors can try.” Write the success criteria on the board: a sequence with at least three things said · a repeat · two events.</p><p>Recap the block skills: sequence (lessons 1–3), repetition (lesson 4), events (lesson 5).</p>' },
      { min: 10, title: 'Design', html: '<p>Pairs fill in the planning sheet: what happens when Run is clicked, what the tap does, what a key does. They write block names in each box and circle where the repeat goes. Check plans before anyone builds.</p>' },
      { min: 27, title: 'Build and test', html: '<p>Pupils open the starter and build their plan one script at a time, pressing Run after each part. Circulate with the success criteria: “Show me your repeat. Show me your two events.”</p>' },
      { min: 10, title: 'Visitors', html: '<p>Pairs leave their show running and walk round as “visitors”, trying other shows. Each visitor leaves one star (something good) and one wish (something to improve) on a sticky note.</p>' },
      { min: 5, title: 'Improve and evaluate', html: '<p>Pairs read their notes and make one improvement. <b>Ask:</b> which part of your design worked best? What did you change after testing? Next block: Sparky starts working on the help desk and has to make decisions.</p>' }
    ],
    support: 'Give a part-filled planning sheet (the Run script done). Pupils add the repeat and one event first, then a second event.',
    stretch: 'Add a third event (another key, or tapping the plinth). Use “start moving” so two motors move at once, or change Sparky’s voice for a character.',
    assess: ['Plans a show with sequence, a repeat and events before building', 'Builds and tests one script at a time', 'Meets every success criterion', 'Improves the show after feedback'],
    steps: [
      { t: 'Plan your show', d: 'On your planning sheet, plan what Sparky does when Run is clicked, when it is tapped and when a key is pressed.' },
      { t: 'The welcome', d: 'Build your Run script: at least three things Sparky says, in the right order. Press Run to test it.' },
      { t: 'A loop', d: 'Add a “repeat” from Control with some moves inside it, like nods or blinks. Test it.' },
      { t: 'Two events', d: 'From Events, add “when the robot is tapped” and “when space key pressed” scripts. Test each one.' },
      { t: 'Check the list', d: 'Three things said? A repeat? Two events? Tick them off on your sheet.' },
      { t: 'Star and wish', d: 'Try a partner’s show as a visitor. Tell them one star and one wish, then improve your own.' }
    ]
  },

  // ═══════════════════════ BLOCK 2 · THE HELP DESK (Years 4–5) ═══════════════════════
  {
    id: 'library-7-signin', unit: u(7), title: 'Signing in', ...B2,
    summary: 'Block 2 begins: Sparky moves to the help desk, where it has to listen to visitors, not just talk. Pupils use “ask and wait” to take input from the user, and join the answer into what Sparky says next, so each visitor gets their own reply.',
    objective: 'We are learning to take input from the user and use it in the program’s output.',
    success: ['I can use “ask and wait” to get an answer from the user.', 'I can use the answer block in what the robot says.', 'I can join words and the answer together.'],
    curriculum: ['ssr', 'design'],
    words: [['input', 'information that goes into a program, like the answer you type'], ['output', 'what the program does, like speaking or moving'], ['answer', 'the block that holds what was typed in the last “ask” box'], ['join', 'put two pieces of text together into one']],
    need: [...DEV],
    plan: [
      { min: 7, title: 'Warm up: a real conversation', html: '<p>Welcome the class to <b>Block 2: the help desk</b>. Have a conversation where you ignore what pupils say (“What is your name?” — “Lovely to meet you, Bob!” to everyone). <b>Ask:</b> what went wrong? I didn’t use what you told me. A program can take <b>input</b> and use it in its <b>output</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Sparky just says “Please sign in.” Show <b>ask What is your name? and wait</b> from Sensing: a box appears and Sparky waits. Show the <b>answer</b> block: it holds what was typed.</p><p>Build “say answer until done” and run it. Then show <b>create text with</b> from Operators: a text block “Hello, ” in the first gap and answer in the second.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: ask for the name and greet the visitor by name; then ask for a favourite book and reply using it.</p><p>Common slips: forgetting the space after “Hello,” (Hello,Amara); putting a say before the ask (Sparky answers before you type); typing into the robot picture instead of the box.</p>' },
      { min: 10, title: 'Test with different visitors', html: '<p>Pupils test with several different names and books, including silly ones. <b>Ask:</b> does it work for every visitor? What happens if you just press OK without typing? (The answer is empty.)</p>' },
      { min: 8, title: 'Share', html: '<p><b>Ask:</b> what is the input? What is the output? Where else does a computer ask for input and use it? (Logging in, a search box, a quiz.) Remind pupils never to type real personal details into apps they don’t know. Next lesson: Sparky makes a decision based on the answer.</p>' }
    ],
    support: 'Build the name question together. Pupils copy it, then make the book question by duplicating (right-click → Duplicate) and changing the words.',
    stretch: 'Ask a third question (How old are you? or What is your favourite animal?) and use both answers in one sentence. Change Sparky’s voice to “high” for a cheerful welcome.',
    assess: ['Uses ask and wait to take input', 'Uses the answer block in the output', 'Joins text and the answer with create text with', 'Tests with different inputs'],
    steps: [
      { t: 'Try it', d: 'Press Run. Sparky asks visitors to sign in, but it never listens!' },
      { t: 'Ask a question', d: 'From Sensing, drag “ask What is your name? and wait” and join it under the say block.' },
      { t: 'Say hello', d: 'From Speech, add “say Hello! until done”. From Operators, drop “create text with” on Hello!' },
      { t: 'Join the answer', d: 'From Operators, put a text block in the first gap and type Hello, (with a space after it). From Sensing, put “answer” in the second gap. Run it and type your name.' },
      { t: 'Favourite book', d: 'Add another ask: What is your favourite book? Then a say with “create text with”: answer first, then the text  is a great choice!' },
      { t: 'Test it', d: 'Run it three times with different names and books. Does Sparky reply to each visitor properly?' }
    ]
  },
  {
    id: 'library-8-shelves', unit: u(8), title: 'Stories or facts?', ...B2,
    summary: 'A visitor at the help desk wants a book. Sparky asks “Do you like stories or facts?” and must point the right way: the story books are on the left, the fact books on the right. Pupils use selection — if … else with a condition — so the program decides what to do.',
    objective: 'We are learning to use selection (if … else) with a condition so a program chooses what to do.',
    success: ['I can explain what a condition is.', 'I can use if … else so the robot does one thing or another.', 'I can test both ways: when the condition is true and when it is false.'],
    curriculum: ['ssr', 'reason'],
    words: [['selection', 'choosing what to do with if … else'], ['condition', 'a question that is true or false, like “answer = stories”'], ['true / false', 'the two answers a condition can have'], ['branch', 'one of the two ways a program can go after an if']],
    need: [...DEV, 'Two signs for the warm-up: STORIES (left wall) and FACTS (right wall)'],
    plan: [
      { min: 8, title: 'Warm up: which way?', html: '<p>Put STORIES on the left wall and FACTS on the right. Say the rule: “<b>If</b> you like stories best, point left, <b>else</b> point right.” Pupils point. Write the rule on the board as if … else. Introduce <b>condition</b>: a question with a true or false answer.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Answer “stories”, then run again and answer “facts”. Sparky says the same thing both times! <b>Ask:</b> what does Sparky need? (A rule to decide.)</p><p>Show <b>if … else</b> in Control and the <b>=</b> block in Operators. Build the condition “answer = stories” together, pointing out that a number gap needs a text block for a word.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: the if … else, the condition, look left + say in the first part, look right + say in the else part.</p><p>Insist on <b>testing both branches</b>: run once with stories and once with facts. Common slips: “answer” left out of the condition; the word typed into a number gap (it won’t go in — use a text block); the look blocks in the wrong branches.</p>' },
      { min: 10, title: 'Odd answers', html: '<p><b>Ask:</b> what happens if a visitor types “STORIES”? (It still works: Sparky ignores capital letters.) “Story”? “Comics”? (They all go to the else branch — facts!) Discuss: is that what we want? Fast finishers add a second question in the else branch.</p>' },
      { min: 7, title: 'Share', html: '<p><b>Ask:</b> what is the condition? When is it true? Which branch runs when it is false? Where else do computers make choices like this? (A lift going up or down, a game checking if you have won.) Next lesson: Sparky keeps checking, all the time.</p>' }
    ],
    support: 'Give the finished condition on a card to copy. Pupils only build the two branches.',
    stretch: 'In the else part, put another if … else so “facts” goes right and anything else gets “Sorry, try stories or facts.” Add a different face for each branch.',
    assess: ['Explains a condition as a true/false question', 'Builds if … else with the right blocks in each branch', 'Tests both branches with different inputs'],
    steps: [
      { t: 'Try it', d: 'Press Run and answer stories. Run again and answer facts. Does Sparky help you either way?' },
      { t: 'If … else', d: 'Drag “say Let me help you find a book. until done” to the bin. From Control, drag “if … else” under the ask block.' },
      { t: 'The condition', d: 'From Operators, put the “=” block in the gap next to if. From Sensing, put “answer” in its first space.' },
      { t: 'The word', d: 'From Operators, drop a text block on the second space and type stories.' },
      { t: 'Two branches', d: 'In the first part: “look ahead” (choose left) and say Story books are on the left! In the else part: look right and say Fact books are on the right!' },
      { t: 'Test both ways', d: 'Run it twice: answer stories, then facts. Does Sparky point the right way each time?' }
    ]
  },
  {
    id: 'library-9-door', unit: u(9), title: 'Watching the door', ...B2,
    summary: 'Sparky should turn its head to greet whoever comes in, wherever they stand. The mouse is the visitor: pupils use the sensing block “mouse x” with the comparison operators < and > inside a forever loop, so Sparky keeps checking and looks left, right or ahead.',
    objective: 'We are learning to use comparison operators (< and >) with a sensor value, checked again and again in a loop.',
    success: ['I can use < and > to compare a number.', 'I can use a sensor value (mouse x) in a condition.', 'I can explain why the check is inside a forever loop.'],
    curriculum: ['ssr', 'reason'],
    words: [['sensor', 'something that measures the world, like where the mouse is'], ['operator', 'a block that compares or works things out, like < or >'], ['less than (<) / greater than (>)', 'compare two numbers'], ['forever', 'a loop that keeps going until you press Stop']],
    need: [...DEV, 'A number line from 0 to 10 on the board'],
    plan: [
      { min: 8, title: 'Warm up: the number line', html: '<p>Draw a number line 0–10 on the board: 0 is the left of Sparky’s picture, 10 the right. Mark 4 and 6. A pupil stands somewhere along it. <b>Ask:</b> is their number less than 4? Greater than 6? Introduce <b>&lt;</b> and <b>&gt;</b> and practise a few: is 2 &lt; 4? Is 9 &gt; 6? Is 5 &lt; 4?</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Move the mouse over the robot from left to right. Sparky looks left… and never looks back. Read the program: <b>forever</b>, if <b>mouse x &lt; 4</b>, look left. <b>Ask:</b> what about visitors on the right, or in the middle? Why is the if inside a forever? (So Sparky keeps checking.)</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: replace the if with an if … else, and put a second if … else in the else part: mouse x &gt; 6 → look right, else → look ahead.</p><p>Test all three places. Common slips: &lt; and &gt; swapped (Sparky looks the wrong way); both numbers 5 (there is no “middle”); the if … else outside the forever (Sparky only checks once).</p>' },
      { min: 10, title: 'Explain it', html: '<p>Pairs trace the program for three visitors on the number line: x = 1, x = 5, x = 9. Which branch runs each time? They write it as a table: mouse x · first condition · second condition · what Sparky does.</p>' },
      { min: 7, title: 'Share', html: '<p><b>Ask:</b> what is the sensor? What are the operators? Why do we need forever? Where do real machines use sensors like this? (Automatic doors, street lights that come on in the dark.) Next lesson: a loop that stops by itself.</p>' }
    ],
    support: 'Give pupils the finished first if … else to copy; they add only the second one. On a tablet, slide a finger slowly across the robot picture.',
    stretch: 'Use “mouse y” too: if mouse y > 7 look up. Or make Sparky say Hello! only when a visitor is in the middle.',
    assess: ['Uses < and > correctly to compare numbers', 'Uses a sensor value in a condition', 'Explains why the checks go inside forever', 'Tests every position'],
    steps: [
      { t: 'Try it', d: 'Press Run. Move the mouse slowly across the robot from left to right. Where does Sparky look?' },
      { t: 'If … else', d: 'From Control, drag “if … else” into an empty space. Drag the “mouse x < 4” block out of the old if and into the new one. Put “look left” in its first part.' },
      { t: 'Swap them', d: 'Drag the old empty if to the bin. Put your new if … else inside forever.' },
      { t: 'The right side', d: 'In the else part, put another “if … else”. From Operators, put “=” in its gap and change = to >. Put “mouse x” from Sensing in the first space and type 6 in the second.' },
      { t: 'Right and middle', d: 'Put “look ahead” (choose right) in its first part and “look ahead” in its else part.' },
      { t: 'Test it', d: 'Run it and move the mouse left, middle and right. Does Sparky always look at the visitor?' }
    ]
  },
  {
    id: 'library-10-closing', unit: u(10), title: 'Closing time', ...B2,
    summary: 'At the end of the day Sparky should blink calmly until it is nearly closing time, warn the visitors, then wait for Ms Okafor to press the space bar before saying goodbye. The starter uses forever, so Sparky never gets there. Pupils use loops that check a condition: repeat until the timer passes 8 seconds, and wait until a key is pressed.',
    objective: 'We are learning to use loops that stop when a condition becomes true (repeat until, wait until).',
    success: ['I can explain why a forever loop never lets the program carry on.', 'I can use repeat until with a condition to stop a loop.', 'I can use wait until to pause until something happens.'],
    curriculum: ['ssr', 'reason'],
    words: [['repeat until', 'a loop that keeps going until its condition is true, then stops'], ['wait until', 'pause until a condition is true'], ['timer', 'counts the seconds since Run was clicked'], ['condition', 'a question that is true or false']],
    need: [...DEV],
    plan: [
      { min: 7, title: 'Warm up: until…', html: '<p>Play “clap until I say stop”, then “keep reading <b>until</b> the bell rings”. <b>Ask:</b> how do you know when to stop? (Something becomes true.) Compare with “clap forever” — you would never go home!</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Sparky blinks… and blinks… <b>Ask:</b> will it ever tell people the library is closing? Look at the blocks: <b>forever</b> has no gap at the bottom, so nothing can come after it.</p><p>Show <b>repeat while</b> in Control and change it to <b>repeat until</b>. Show <b>timer</b> in Sensing. Build “repeat until timer &gt; 8” together.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: swap forever for repeat until, warn the visitors, then <b>wait until key space pressed?</b> before a sleepy goodbye.</p><p>Common slips: the condition left as “while” (the loop never starts — the timer isn’t above 8 yet); timer &lt; 8 instead of &gt; 8; the goodbye blocks put inside the loop.</p>' },
      { min: 10, title: 'Change the condition', html: '<p>Pupils try different numbers (timer &gt; 3, timer &gt; 15) and predict how many blinks there will be before running. <b>Ask:</b> why isn’t it exactly 8 blinks? (Each loop pass takes a blink plus 1 second.)</p>' },
      { min: 8, title: 'Share', html: '<p><b>Ask:</b> which loops stop by themselves, and which never do? When is a forever loop the right choice? (Watching the door in lesson 9.) When is repeat until better? Next lesson: debug the returns desk.</p>' }
    ],
    support: 'Build the repeat until together on the board; pupils add only the warning and the goodbye.',
    stretch: 'Make the warning repeat: repeat until key c pressed, say “Closing soon!” and wait 2 seconds. Or reset the timer and do a second countdown.',
    assess: ['Explains why nothing can come after forever', 'Uses repeat until with a timer condition', 'Uses wait until with a key condition', 'Predicts how the number changes the result'],
    steps: [
      { t: 'Try it', d: 'Press Run and wait. Does Sparky ever tell visitors the library is closing? Why not?' },
      { t: 'A loop that stops', d: 'From Control, drag “repeat while” into an empty space. Click while and choose until. Move “blink” and “wait 1 seconds” out of forever into it.' },
      { t: 'The condition', d: 'From Operators, put “=” in its gap and change = to >. Put “timer” from Sensing in the first space and type 8. Drag forever to the bin and join your loop on.' },
      { t: 'Warn the visitors', d: 'Under the loop, add “say … until done”: The library closes in five minutes!' },
      { t: 'Wait for the librarian', d: 'From Control, add “wait until”. From Sensing, put “key space pressed?” in its gap. Then add a sleepy face and say Goodbye!' },
      { t: 'Test it', d: 'Press Run. Wait for the warning, then press space. Does Sparky wait for you before it says goodbye?' }
    ]
  },
  {
    id: 'library-11-returns', unit: u(11), title: 'Fix the returns desk', ...B2,
    summary: 'Ms Okafor wrote a program for the returns desk: for each of three books, Sparky asks what kind it is and points to the right shelf, then says “All done” once at the end. But it has three bugs, in the loop and in the if … else. Pupils debug methodically: predict, test with chosen answers, find each bug and fix it.',
    objective: 'We are learning to debug loops and conditions by predicting, testing with chosen inputs and fixing one bug at a time.',
    success: ['I can compare what a program does with what it should do.', 'I can find bugs in a loop and in an if … else.', 'I can choose test answers that check every branch.'],
    curriculum: ['design', 'reason'],
    words: [['debug', 'find and fix the mistakes in a program'], ['test data', 'the answers you choose to try, so every part of the program is checked'], ['loop count', 'how many times a repeat runs'], ['branch', 'one of the two ways after an if … else']],
    need: [...DEV, 'A bug-hunt sheet per pair: what should happen · what happens · the bug · the fix'],
    plan: [
      { min: 7, title: 'Warm up: bug detectives', html: '<p>Recap debugging from lesson 3, but now bugs can hide in loops and decisions. Introduce <b>test data</b>: answers chosen on purpose so that every part of the program gets tried. <b>Ask:</b> to test a program that sorts story books and fact books, what answers should we try? (At least one of each.)</p>' },
      { min: 10, title: 'The job', html: '<p>Show what Ms Okafor wants on the board: “For <b>3</b> books: ask story or fact; story → look <b>left</b> (story shelves are on the left, like lesson 8), fact → look <b>right</b>. Then say <b>All done</b> once.” Open the starter. Pairs read the blocks and <b>predict</b> without running. Then run it with story, fact, story.</p>' },
      { min: 25, title: 'Bug hunt', html: '<p>Pupils follow the Lesson card and fill in the bug-hunt sheet for each bug. Bug 1: the loop count is 2, not 3. Bug 2: the branches point the wrong way (story looks right). Bug 3: “All done” is inside the loop, so it is said after every book.</p><p>Encourage: fix ONE bug, test, then the next. Don’t tell them where the bugs are — ask “what should happen at this point? What actually happened?”</p>' },
      { min: 10, title: 'Prove it', html: '<p>Pairs test the fixed program with new test data: fact, fact, fact and story, story, fact. <b>Ask:</b> did you test every branch? How do you know the loop runs exactly 3 times?</p>' },
      { min: 8, title: 'Share', html: '<p>Pairs share their bug-hunt sheets. <b>Ask:</b> which bug was hardest to find? Why does a bug inside a loop happen again and again? Next lesson: build the whole help desk yourselves.</p>' }
    ],
    support: 'Tell pupils there are three bugs and give a hint for each on a folded card (the number, the looks, where All done is).',
    stretch: 'Add a third kind of book (comic → look up) with another if … else in the else part, and test it with test data that tries all three.',
    assess: ['Predicts the program’s behaviour before running', 'Uses chosen test data to try both branches', 'Finds and fixes the loop count, the branches and the misplaced block', 'Explains why a bug inside a loop repeats'],
    steps: [
      { t: 'The job', d: 'For 3 books: ask story or fact. Story → look left. Fact → look right. Then say All done once, at the end.' },
      { t: 'Predict, then test', d: 'Read the blocks first. Then press Run and answer story, fact, story. Write down what goes wrong.' },
      { t: 'Bug 1: how many?', d: 'How many books does Sparky ask about? Fix the number on the repeat block. Test again.' },
      { t: 'Bug 2: which way?', d: 'Does a story book make Sparky look left? Fix the look blocks in the if … else. Test with story AND fact.' },
      { t: 'Bug 3: All done', d: 'How many times does Sparky say All done? Drag that block out of the loop and join it under the repeat.' },
      { t: 'Prove it', d: 'Test once more with fact, fact, fact. Does everything happen exactly as the job says?' }
    ]
  },
  {
    id: 'library-12-project', unit: u(12), title: 'Project: the help desk', ...B2,
    summary: 'The Block 2 project. Pupils design and build Sparky’s help desk: it keeps asking “How can I help?” until the visitor says bye, and gives a different answer for each thing a visitor might ask for, with a polite reply for anything it doesn’t know. They use input, if … else, a loop that checks a condition, and test it with planned test data.',
    objective: 'We are learning to design, build and test a program that uses input, selection and a loop that checks a condition.',
    success: ['My help desk asks a question and uses the answer.', 'It gives a different reply for at least three choices, and a polite reply for anything else.', 'It keeps going until the visitor says bye.', 'I tested it with planned test data.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['input', 'information that goes into a program'], ['selection', 'choosing what to do with if … else'], ['repeat until', 'a loop that keeps going until its condition is true'], ['test data', 'answers chosen so every branch gets tried'], ['evaluate', 'decide what is good and what could be better']],
    need: [...DEV, 'A planning sheet per pair: the question · the choices and replies · the test data table'],
    plan: [
      { min: 8, title: 'The brief', html: '<p>Ms Okafor’s brief: “Sparky must run the help desk on its own. It keeps asking how it can help until the visitor says bye. It needs a reply for at least three things, and a polite reply when it doesn’t understand.” Success criteria on the board. Recap Block 2: input (7), selection (8), operators and sensors (9), condition loops (10), debugging (11).</p>' },
      { min: 10, title: 'Design', html: '<p>Pairs plan on the sheet: the question; three or more choices (books, computers, toilets, the printer, the quiet room…) and Sparky’s reply and look for each; and a <b>test data</b> table listing every answer they will try, including something unexpected and bye.</p>' },
      { min: 27, title: 'Build and test', html: '<p>Pupils build in stages: the repeat until loop with the ask (test that bye stops it) → the first if … else → more if … else blocks inside the else parts → the polite “sorry” reply → the goodbye. Run the test data after each stage.</p><p>Hint for the sorry reply: “bye” would also land in the last else, so check “answer ≠ bye” there (≠ is in the = block’s list).</p>' },
      { min: 10, title: 'Visitors', html: '<p>Pairs swap and use each other’s help desk as visitors, trying every choice and something silly. They leave a star and a wish.</p>' },
      { min: 5, title: 'Evaluate', html: '<p><b>Ask:</b> did your test data find any bugs? Which branch was hardest to get right? Next block: Open Day — Sparky learns to remember things with variables.</p>' }
    ],
    support: 'Start from the lesson 8 program (one if … else) and wrap it in repeat until answer = bye. Aim for two choices plus the sorry reply.',
    stretch: 'Use mouse x as well: if a visitor is standing on the left, Sparky looks at them before asking. Or give each reply a different chest light colour.',
    assess: ['Plans choices, replies and test data before building', 'Uses ask, if … else and repeat until together', 'Handles unexpected answers politely', 'Tests every branch and fixes what goes wrong'],
    steps: [
      { t: 'Plan it', d: 'On your sheet: Sparky’s question, at least three choices and the reply for each, and your test data.' },
      { t: 'The loop', d: 'From Control, add “repeat while”, choose until, and make the condition answer = bye. Put an ask inside it. Test: does bye stop it?' },
      { t: 'The first choice', d: 'Under the ask, add “if … else”: if answer = books, Sparky looks and replies. Test it.' },
      { t: 'More choices', d: 'Put another “if … else” in the else part for each choice. Test each one.' },
      { t: 'Anything else', d: 'At the end, reply politely if Sparky doesn’t know the answer (but not for bye!). After the loop, say goodbye.' },
      { t: 'Test data', d: 'Run every answer in your test data table and tick each one. Then let a partner try it.' }
    ]
  },

  // ═══════════════════════ BLOCK 3 · OPEN DAY (Years 5–6) ═══════════════════════
  {
    adopt: 'robot-quiz', unit: u(13), title: 'Quiz night: keep the score', years: 'Years 5–6',
    summary: 'Block 3 begins: the library is getting ready for Open Day, starting with quiz night. Sparky dresses up as Quizbot. Pupils already know input and if … else from Block 2; the new idea is a variable — a score that Sparky sets to 0, changes only for a right answer and says at the end.',
    objective: 'We are learning to use a variable to remember and change a value (a score) while a program runs.',
    success: ['I can create a variable and set it to a starting value.', 'I can change a variable only when the answer is right.', 'I can use the variable’s value in what the robot says.', 'I can test my program with right and wrong answers.'],
    plan: [
      { min: 7, title: 'Warm up: keeping score', html: '<p>Welcome the class to <b>Block 3: Open Day</b>. First event: quiz night, hosted by Sparky in its Quizbot outfit. Ask the class two quick questions and keep score on the board, rubbing out and rewriting the number each time. <b>Ask:</b> what did I need to remember? (The score.) What happened to it? (It started at 0 and changed.) That is a <b>variable</b>: a named value that can change.</p>' },
      { min: 10, title: 'Input and selection again', html: '<p>Open the starter and press <b>Run</b>. Quizbot asks “What is 3 + 4?” and just says back whatever you type. <b>Ask:</b> which blocks from Block 2 do we need? (ask and answer = input; if … else = selection.) Today we add the missing piece: something that <b>remembers</b>.</p>' },
      { min: 15, title: 'Selection: if … else', html: '<p>Pupils follow the Lesson card: make a <b>score</b> variable and set it to 0 at the start, then swap “say answer” for an <b>if … else</b> with the condition “answer = 7”. Happy face, “Correct!” and change score by 1 go in the if part; a sad face and the right answer go in the else part.</p>' },
      { min: 15, title: 'Variables: keep score', html: '<p>Pupils duplicate the ask and if … else blocks to make a second question, then say the score at the end with <b>create text with</b> “Your score is ” and <b>score</b>.</p><p>Common bugs to look for: “change score by 1” after the if … else (so every answer scores) or in the else part; no “set score to 0” (the score isn’t reset for the next player). <b>Ask:</b> what is the highest score possible? Test it.</p>' },
      { min: 8, title: 'Swap and test', html: '<p>Pairs swap devices and play each other’s quiz, trying right and wrong answers. Did the score come out right? Fast finishers try the challenge: <b>pick random 1 to 10</b> to make a maths quiz that is different every time, inside <b>repeat 3 times</b>.</p>' },
      { min: 5, title: 'Plenary', html: '<p>Pupils point to the <b>variable</b> and the three things that happen to it: <b>set</b> (start), <b>change</b> (during), <b>use</b> (at the end). <b>Ask:</b> what other things could a variable remember? (Lives in a game, the number of visitors, money in a till.) Next lesson: two variables collect data for a survey.</p>' }
    ]
  },
  {
    id: 'library-14-survey', unit: u(14), title: 'The reading survey', ...B3,
    summary: 'For Open Day, Ms Okafor wants to know: do visitors like stories or facts best? Sparky asks five visitors. The starter asks but forgets every answer. Pupils use two variables as tallies to collect the data, then report the totals and compare them to say which wins.',
    objective: 'We are learning to collect data with variables and use it to answer a question.',
    success: ['I can use two variables to count two different answers.', 'I can report the totals when the survey is finished.', 'I can compare two variables to decide the result.', 'I can check the program’s totals against a tally on paper.'],
    curriculum: ['data', 'ssr'],
    words: [['data', 'facts and numbers we collect to answer a question'], ['variable', 'a named value that can change'], ['tally', 'a count that goes up by one each time'], ['survey', 'asking lots of people the same question'], ['compare', 'decide which is bigger, smaller or the same']],
    need: [...DEV, 'Squared paper for a paper tally chart'],
    plan: [
      { min: 8, title: 'Warm up: a class survey', html: '<p>Ask the class: stories or facts? Keep a <b>tally</b> on the board, one mark each. <b>Ask:</b> how many things did I have to remember? (Two counts.) What did I do with each answer? (Add one to the right count.) What did we find out? This is collecting <b>data</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>, answering five times. Sparky says “Thank you!” five times and then “The survey is finished.” <b>Ask:</b> so who won? Sparky can’t tell us: it forgot every answer. We need two variables: <b>stories</b> and <b>facts</b>.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: create the two variables and set them to 0 at the start; inside the loop, an if … else changes one of them by 1; after the loop, say both totals and compare them with &gt;.</p><p>Have pupils keep a paper tally of what they type and check it against Sparky’s totals. Common slips: setting the variables to 0 inside the loop (they reset every time); “change stories by 1” in both branches.</p>' },
      { min: 10, title: 'Is it fair?', html: '<p><b>Ask:</b> what if a visitor types “comics”? (It counts as facts — is that fair?) What if there were 6 visitors and it was 3 each? (Facts win — is that right?) Fast finishers add a third variable for other answers, or a draw.</p>' },
      { min: 7, title: 'Share', html: '<p>Pairs run their survey on the class (five volunteers). <b>Ask:</b> what was the data? Which blocks collected it, and which used it? How could Ms Okafor use the result? (Buy more of the books people like.) Next lesson: messages make Sparky do two things at once.</p>' }
    ],
    support: 'Give the if … else for the tally ready-made on a card. Pupils create the variables and say the totals.',
    stretch: 'Handle a draw: if stories = facts, say It’s a draw! Add a third choice (comics) with its own variable, and say the percentage of visitors who chose stories (stories × 100 ÷ 5).',
    assess: ['Creates two variables and sets them to 0 before the loop', 'Changes the right variable in each branch', 'Reports both totals after the loop', 'Compares the variables to decide the winner, and checks against a paper tally'],
    steps: [
      { t: 'Try it', d: 'Press Run and answer five times. Can Sparky tell you who won? Why not?' },
      { t: 'Two variables', d: 'Open Variables and press Create variable... twice: call them stories and facts. Put “set stories to 0” and “set facts to 0” at the top of the script.' },
      { t: 'Count each answer', d: 'Inside the repeat, under the ask, add “if … else”: if answer = stories, “change stories by 1”, else “change facts by 1”.' },
      { t: 'Say the totals', d: 'After the repeat, add two says with “create text with”: Stories:  and the stories block, then Facts:  and the facts block.' },
      { t: 'Who wins?', d: 'Add “if … else”: if stories > facts say Stories win!, else say Facts win!' },
      { t: 'Check the data', d: 'Keep a tally on paper while you answer. Do Sparky’s totals match yours?' }
    ]
  },
  {
    id: 'library-15-lights', unit: u(15), title: 'The light show', ...B3,
    summary: 'Sparky opens Open Day with a light show, but in the starter the lights only flash after it has finished talking. Pupils use messages: “send message” starts a “when I receive” script, so the lights flash at the same time as Sparky talks — and the same message can be sent again from a second place, when a visitor taps the robot.',
    objective: 'We are learning to use messages (broadcasts) so one script can start another, and scripts can run at the same time.',
    success: ['I can send a message to start another script.', 'I can make two scripts run at the same time.', 'I can send the same message from more than one place.'],
    curriculum: ['ssr', 'design'],
    words: [['message', 'a signal one script sends to start other scripts'], ['broadcast', 'sending a message that every script listening for it hears'], ['receive', 'a “when I receive” script starts when its message is sent'], ['at the same time', 'two scripts running together (in parallel)']],
    need: [...DEV, 'Two pupils and a whistle for the warm-up'],
    plan: [
      { min: 7, title: 'Warm up: on my signal', html: '<p>One pupil reads a sentence aloud. Another is the “light show” and waves their arms — but only after the reader finishes. Then try with a <b>signal</b>: the reader blows the whistle as they start, and the light show begins straight away, while the reading carries on. Introduce <b>message</b> and <b>broadcast</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Sparky talks, and only then do the lights flash. <b>Ask:</b> why? (Everything is in one script, one step after another.) Show <b>send message</b> and <b>when I receive</b> in Events. Whatever is under “when I receive lights” starts when the message lights is sent — and the sending script carries straight on.</p>' },
      { min: 23, title: 'Your turn', html: '<p>Pupils follow the Lesson card: move the flashing repeat under “when I receive lights”, send lights before the talking, and run. The lights now flash while Sparky speaks. Then a tap script sends lights again.</p><p>Common slips: the message names don’t match exactly (lights / light); “send message” put after the say … until done (the lights wait for the talking again).</p>' },
      { min: 12, title: 'One message, many scripts', html: '<p>Challenge: add a second “when I receive lights” script with a surprised face. <b>Ask:</b> what happens now when the message is sent? (Both scripts start: a broadcast reaches everyone listening.) Pupils sketch their program as boxes with arrows from each send to each receive.</p>' },
      { min: 8, title: 'Share', html: '<p><b>Ask:</b> what does a message let us do that one long script can’t? Where else do signals start several things at once? (A fire alarm, a starting pistol.) Next lesson: our own blocks.</p>' }
    ],
    support: 'Build the receive script together on the board. Pupils make only the send and test it.',
    stretch: 'Add a “bow” message sent when the speech ends, with its own receive script. Use “start moving” in a receive script so the head and eyes move together while the lights flash.',
    assess: ['Sends a message that starts a receive script', 'Makes the lights and the speech happen at the same time', 'Sends the same message from two places', 'Explains broadcast to many scripts'],
    steps: [
      { t: 'Try it', d: 'Press Run. When do the lights flash: while Sparky talks, or after?' },
      { t: 'Receive', d: 'From Events, drag “when I receive go” into an empty space. Click go and type lights.' },
      { t: 'Move the show', d: 'Drag the “repeat 6 times” flashing block under it. The blocks under the repeat come too: drag them back to the Run script, under the say.' },
      { t: 'Send', d: 'From Events, drag “send message go” and put it under “make a happy face”, before the say. Type lights. Press Run: do the lights flash while Sparky talks?' },
      { t: 'Again!', d: 'Add “when the robot is tapped” with “send message lights” under it. Run, wait, then tap Sparky.' },
      { t: 'Challenge', d: 'Add another “when I receive lights” script with a surprised face. What happens when the message is sent now?' }
    ]
  },
  {
    id: 'library-16-myblocks', unit: u(16), title: 'My own blocks', ...B3,
    summary: 'Sparky plays a yes-or-no game at Open Day, nodding for yes and shaking its head for no. The starter copies the same three moves every time. Pupils make their own blocks (procedures) in My blocks — “nod yes” and “shake no” — use them instead of the copies, and see how easy it is to add a new question.',
    objective: 'We are learning to make our own blocks (procedures) for steps we use again and again, and give them clear names.',
    success: ['I can spot a group of blocks that is copied in a program.', 'I can make my own block with a clear name.', 'I can use my block instead of the copies.'],
    curriculum: ['design', 'ssr'],
    words: [['procedure', 'a named group of blocks you can use again; your own block'], ['define', 'build what your own block does, under “to …”'], ['call', 'use your own block in a script'], ['abstraction', 'hiding the details behind a simple name like “nod yes”']],
    need: [...DEV],
    plan: [
      { min: 7, title: 'Warm up: a recipe word', html: '<p><b>Ask:</b> in a recipe, what does “whisk” mean? Nobody writes “move the fork round fast in a circle 50 times” every time — they just say <b>whisk</b>. Giving a name to a set of steps is a <b>procedure</b>. The name hides the details: <b>abstraction</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Read the blocks: the same three “head nod” moves appear twice, and the head turn moves once. <b>Ask:</b> what would we have to do to add five more questions? (Copy the moves again and again.)</p><p>Open <b>My blocks</b>. Drag “to do something” into the space and rename it <b>nod yes</b>. Move the three nod blocks under it. A new <b>nod yes</b> block appears in My blocks.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: make <b>nod yes</b> and <b>shake no</b>, replace every copy with a call, then add a fourth question “Can robots read?” using nod yes.</p><p>Common slips: dragging the first nod block pulls the rest of the script with it — drag the blocks under the third nod back to the Run script; leaving one old copy in place. Run after each change: the game should behave exactly the same as before.</p>' },
      { min: 10, title: 'Count and compare', html: '<p>Pairs count the blocks before and after. Then each adds two more questions. <b>Ask:</b> which version is easier to read? To change? If Sparky should nod faster, how many places do you change now? (One: inside “to nod yes”.)</p>' },
      { min: 8, title: 'Share', html: '<p><b>Ask:</b> what is the definition? What is a call? Why is “nod yes” a better name than “block 1”? Next lesson: our own blocks get inputs.</p>' }
    ],
    support: 'Make “nod yes” together on the board. Pupils make “shake no” on their own.',
    stretch: 'Make a “not sure” block (head tilt one way and the other, and a thinking face) and use it for a tricky question. Use “nod yes” inside a repeat.',
    assess: ['Recognises the repeated group of blocks', 'Defines a procedure with a clear name', 'Replaces every copy with a call', 'Adds a new question quickly using the procedure'],
    steps: [
      { t: 'Spot the copies', d: 'Press Run. Then find the three “move head nod” blocks. Where are they copied?' },
      { t: 'Make a block', d: 'Open My blocks. Drag “to do something” into an empty space. Click do something and type nod yes.' },
      { t: 'Fill it', d: 'Drag the first “move head nod to 8” block under “to nod yes”. Drag the blocks after the third head nod block back to your script.' },
      { t: 'Use it', d: 'Open My blocks: there is a “nod yes” block now. Put it where the nod blocks were, and in place of the other copy.' },
      { t: 'Shake no', d: 'Do the same for the three “move head turn” blocks: make a “shake no” block and use it.' },
      { t: 'A new question', d: 'Add say Can robots read? and a “nod yes” at the end. Run it: nod, shake, nod, nod?' }
    ]
  },
  {
    id: 'library-17-inputs', unit: u(17), title: 'Blocks with inputs', ...B3,
    summary: 'At the Willow Lane Book Awards Sparky cheers each winning book with a nod for every star: three, two and one. The starter’s “cheer” block always nods three times. Pupils give their own block an input called stars and use it in the repeat, so one block works for any number of stars.',
    objective: 'We are learning to give our own block an input, so one block can do a job in different ways.',
    success: ['I can add an input to my own block.', 'I can use the input inside the block.', 'I can call my block with different values.'],
    curriculum: ['design', 'ssr'],
    words: [['input (parameter)', 'a gap in your own block that takes a value, like the number of stars'], ['value', 'the number or text you put in the gap when you use the block'], ['generalise', 'make one block that works for many cases'], ['procedure', 'a named group of blocks you can use again']],
    need: [...DEV, 'Star stickers or cards for the warm-up (optional)'],
    plan: [
      { min: 7, title: 'Warm up: clap for…', html: '<p>Play “clap for”: “clap for 3”, “clap for 1”, “clap for 5”. The instruction is the same each time — only the number changes. <b>Ask:</b> how is that like a block? (The number is an <b>input</b>.) “Move head nod to 8” has an input already: the 8.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Count the cheers: 3, 3, 3 — but Space Cats has two stars and Fish Facts has one! Look at “to cheer”: the repeat always says 3.</p><p>Show the cog on “to cheer”: drag <b>input name</b> into <b>inputs</b> and call it <b>stars</b>. The block now says “to cheer with: stars”, and a <b>stars</b> block appears in Variables.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: add the input, use <b>stars</b> in the repeat, and give each call its number. Run and count: 3, 2, 1.</p><p>Common slips: the input added but the repeat still says 3 (the input isn’t used); a call left with an empty gap (it cheers 0 times); “stars” dragged into the Run script (it only has a value inside “to cheer”).</p>' },
      { min: 10, title: 'Two inputs', html: '<p>Fast finishers make an <b>award</b> block with two inputs, book and stars, that says the book’s name with “create text with” and then calls cheer with stars. <b>Ask:</b> how short is the Run script now?</p>' },
      { min: 8, title: 'Share', html: '<p><b>Ask:</b> what is the input of your block? What values did you give it? Which built-in blocks have inputs too? (move … to, say, repeat.) Next lesson: the Open Day project brings everything together.</p>' }
    ],
    support: 'Add the input together on the board. Pupils use stars in the repeat and fill in the three numbers.',
    stretch: 'Make the two-input “award (book, stars)” block. Or add a second input, speed, and use “set head nod speed to” inside cheer.',
    assess: ['Adds an input to a procedure using the cog', 'Uses the input inside the procedure', 'Calls the procedure with different values and checks the result'],
    steps: [
      { t: 'Count the cheers', d: 'Press Run. Count the nods for each book. Do they match the stars?' },
      { t: 'Open the cog', d: 'Click the cog on the “to cheer” block. Drag “input name: x” into “inputs” and type stars. Click the cog again to close it.' },
      { t: 'Use the input', d: 'Open Variables. Drag the stars block into the repeat inside “to cheer”, on top of the 3.' },
      { t: 'Give it numbers', d: 'Each “cheer” block now has a gap. From Operators, put a number block in each: 3, then 2, then 1.' },
      { t: 'Test it', d: 'Press Run and count: 3 nods, then 2, then 1?' },
      { t: 'Challenge', d: 'Add a fourth book with five stars. How many blocks did you need to add?' }
    ]
  },
  {
    id: 'library-18-project', unit: u(18), title: 'Project: Open Day', ...B3,
    summary: 'The final project of the unit. It is Open Day at Willow Lane Library and Sparky is the star. Pupils design and build their own interactive Open Day robot that brings together everything from the unit: input, selection, a loop that checks a condition, a variable, a message and their own blocks with inputs — then test it with planned test data and evaluate it with real visitors.',
    objective: 'We are learning to design, build, test and evaluate a program that combines variables, messages, procedures, selection and input.',
    success: ['My program uses a variable that changes while it runs.', 'It sends a message that starts another script.', 'It uses at least one of my own blocks.', 'It asks questions and uses if … else to decide what to do.', 'I tested it with planned test data and improved it.'],
    curriculum: ['design', 'ssr', 'reason', 'data'],
    words: [['variable', 'a named value that can change'], ['message', 'a signal one script sends to start others'], ['procedure', 'your own named block'], ['selection', 'choosing what to do with if … else'], ['evaluate', 'decide what is good and what could be better']],
    need: [...DEV, 'A planning sheet per pair: a storyboard of the visit, a list of variables (name, start value, what changes it), messages and My blocks, and a test data table'],
    plan: [
      { min: 7, title: 'The brief', html: '<p>Ms Okafor’s brief: “Open Day! Sparky must welcome each visitor, let them choose things to do (a quiz, a light show, a story, a survey…) until they say bye, and remember something about the visit.” Success criteria on the board: a variable · a message · your own block · if … else · ask.</p><p>Recap the whole unit with the class: Block 1 sequence, repetition, events; Block 2 input, selection, operators, condition loops, debugging; Block 3 variables, data, messages, procedures.</p>' },
      { min: 10, title: 'Design', html: '<p>Pairs plan on the sheet: a storyboard of one visit; the variables they need (name, start value, what changes it); the messages and their receive scripts; their own blocks and inputs; and test data. Check plans against the success criteria before building.</p>' },
      { min: 28, title: 'Build and test', html: '<p>Pupils open the starter and build in stages, testing after each: welcome and name → the menu loop (repeat until answer = bye) → each choice with if … else → the variable → a message → their own block. Remind them of lesson 11: when it goes wrong, predict, test with chosen data and fix one bug at a time.</p>' },
      { min: 10, title: 'Open Day', html: '<p>Half the class are visitors, half are hosts; then swap. Visitors try every choice and fill in a quick feedback slip: what worked, what was confusing, one idea.</p>' },
      { min: 5, title: 'Evaluate and celebrate', html: '<p>Pairs read their feedback, make one improvement, and write a short evaluation: what they are proud of, what they would add next. Celebrate the end of the Robot Librarian unit — Sparky is the best helper Willow Lane Library has ever had.</p>' }
    ],
    support: 'Start from the lesson 13 quiz or lesson 15 light show, wrap it in a menu loop with two choices, and add one My block (like a bow).',
    stretch: 'Count the visitors with a variable that is never reset, give each visitor a score, or make a My block with two inputs (a message to send and a number of nods).',
    assess: ['Plans variables, messages and procedures before building', 'Combines input, selection, a condition loop, a variable, a message and a procedure', 'Tests systematically with planned test data', 'Evaluates the program using visitors’ feedback'],
    steps: [
      { t: 'Plan your visit', d: 'Storyboard one visit to Sparky. List your variables, your messages and your own blocks on the sheet.' },
      { t: 'Welcome', d: 'Ask the visitor’s name and greet them with it. Test it.' },
      { t: 'The menu', d: 'Add “repeat while” (choose until) with answer = bye. Inside, ask what they would like to do, and use if … else for each choice.' },
      { t: 'Remember something', d: 'Use a variable: a score, a count of visitors, or survey totals. Set it, change it and say it.' },
      { t: 'Messages and My blocks', d: 'Send a message to start a light show or a dance, and make your own block (with an input if you can).' },
      { t: 'Test and improve', d: 'Try every choice from your test data table, then let a visitor try. Fix one thing they tell you.' }
    ]
  }
];

export const SLIDES = {
  'library-1-welcome': [
    { t: 'Robot Librarian', lead: 'Willow Lane Library has a new robot helper: Sparky!', b: ['Ms Okafor the librarian gives us a job every lesson', 'We write every program Sparky runs'], notes: 'Introduce the unit and the setting. Sparky only does exactly what its blocks say, in exactly that order.' },
    { t: 'Be the robot', q: 'How do I welcome a visitor?', b: ['“Be friendly” — what does that mean to a robot?', 'Exact steps, in the right order'], notes: 'Follow vague instructions badly, then exact ones. Introduce algorithm.' },
    { t: 'Sparky is asleep', pic: true, q: 'What does Sparky need to do to wake up and welcome visitors?', notes: 'Open the starter and press Run: the eyes go dark and Sparky makes a sleepy face.' },
    { t: 'Plan it first', b: ['1 eyes on', '2 happy face', '3 say the welcome', '4 look left', '5 look right', '6 look ahead', '7 blink'], notes: 'Pairs write their own plan on paper before building. Check plans for order and missing steps.' },
    { use: 'steps' },
    { t: 'Does it match?', q: 'Did Sparky do exactly what your plan said, in the same order?', b: ['What happens if two steps swap?'], notes: 'Two pairs run their welcome while the class reads along. Next lesson: the library tour.' }
  ],
  'library-2-tour': [
    { t: 'Big jobs, small parts', q: 'How do you tidy a really messy bedroom?', b: ['Clothes, then books, then toys', 'Breaking it up = decompose'], notes: 'Draw out that small parts are easier to do and to check.' },
    { t: 'The tour', pic: true, b: ['1 the story corner (left)', '2 the computers (right)', '3 the returns box (down)', '4 goodbye (ahead)'], notes: 'Run the starter: only part 1 is done.' },
    { t: 'Spot the pattern', lead: 'Every part: look, then talk.', b: ['look ___', 'say ___ until done'], notes: 'Write each part with the same pattern. Compare say and say … until done: with plain say, Sparky turns before it finishes talking.' },
    { use: 'steps' },
    { t: 'Tour guides', q: 'How many parts did your tour have? Why test one part at a time?', notes: 'Run two tours on the board. Next lesson: Sparky’s story has a bug.' }
  ],
  'robot-storyteller': [
    { t: 'The wrong order', q: 'Shoes on, then socks. What went wrong?', b: ['Every step was right.', 'The order was wrong!'], notes: 'Act it out. A mistake in a program is a bug; finding and fixing it is debugging.' },
    { t: 'Predict first', pic: true, q: 'Read the blocks like a story. What will Sparky do?', b: ['Don’t press Run yet!'], notes: 'Read the script aloud, take predictions and a vote, then press Run. Sparky says Good morning while still asleep.' },
    { t: 'Debugging questions', b: ['What should happen?', 'What actually happens?', 'Where does it start to go wrong?', 'Change one thing, then test'], notes: 'Model these questions; pupils use them to find the happy face block in the wrong place.' },
    { use: 'steps' },
    { t: 'Bug swap', lead: 'Plant one bug. Can your partner predict it, find it and fix it?', notes: 'Pupils swap two blocks, swap devices, and debug each other’s story.' },
    { t: 'Bug hunters', q: 'What is the best way to find a bug?', notes: 'Read the blocks, predict, run and spot where it stops matching. Next lesson: stretch break with repeat loops.' }
  ],
  'library-4-stretch': [
    { t: 'Stretch break!', q: 'Nod five times. Tilt three times. How many instructions is that?', notes: 'Lead the stretch, then count the instructions: ten for the nods alone.' },
    { t: 'Only one nod?', pic: true, b: ['One nod = head nod to 8, then to 2', 'Five nods = 10 blocks?'], notes: 'Run the starter: Sparky asks for five nods and does one.' },
    { t: 'Repeat', lead: 'A repeat loop runs the blocks inside it again and again.', b: ['repeat 5 times: nod', 'repeat 3 times: tilt'], q: 'What changes if we want 20 nods?', notes: 'Just one number. Show how dragging a block brings the blocks under it, and how to drag the extra ones back out.' },
    { use: 'steps' },
    { t: 'Efficient', q: 'How many blocks with loops? Without?', b: ['Where else do we repeat? Songs, skipping, times tables'], notes: 'Pairs count blocks. Next lesson: help desk buttons (events).' }
  ],
  'library-5-buttons': [
    { t: 'What starts it?', q: 'What makes a doorbell ring? A crossing light change?', b: ['Something happens first: an event'], notes: 'Play “when I clap, stand up”. Introduce event.' },
    { t: 'Tap me!', pic: true, q: 'Sparky asks you to tap its head. What happens?', notes: 'Run the starter and tap: nothing. Every script so far starts with when Run is clicked.' },
    { t: 'Events start scripts', b: ['when the robot is tapped → opening times', 'when b key pressed → look left to the books', 'when c key pressed → look right to the computers'], notes: 'Each event has its own script. Events only work while the program runs.' },
    { use: 'steps' },
    { t: 'Help desk', q: 'How many scripts does your program have? What starts each one?', notes: 'Visitors choose what they need, when they need it. Next lesson: the Block 1 project.' }
  ],
  'library-6-project': [
    { t: 'The brief', lead: 'Design a welcome show for the library’s front desk.', b: ['A sequence: at least 3 things Sparky says', 'A repeat loop', 'Two events visitors can try'], notes: 'These are the success criteria. Recap lessons 1–5.' },
    { t: 'Design first', pic: true, b: ['When Run is clicked …', 'When the robot is tapped …', 'When a key is pressed …'], notes: 'Pairs fill in the planning sheet before building.' },
    { use: 'steps' },
    { t: 'Star and wish', lead: '“I liked … I wish …”', notes: 'Pupils try each other’s shows as visitors and leave a star and a wish.' },
    { t: 'Block 1 done!', b: ['Algorithms and sequence', 'Decomposition', 'Debugging', 'Repetition', 'Events'], notes: 'Celebrate. Next block: the help desk, where Sparky makes decisions.' }
  ],
  'library-7-signin': [
    { t: 'Block 2: The help desk', lead: 'Sparky has to listen to visitors, not just talk.', notes: 'Have a conversation where you ignore every answer. What went wrong?' },
    { t: 'Input and output', pic: true, b: ['Input: ask … and wait, and the answer block', 'Output: what Sparky says'], notes: 'Run the starter: Sparky never listens. Show ask and answer.' },
    { t: 'Join it', lead: 'create text with: “Hello, ” + answer → Hello, Amara', b: ['Don’t forget the space!'], notes: 'Build it together. A word needs a text block from Operators.' },
    { use: 'steps' },
    { t: 'Where else?', q: 'Where does a computer ask for input and use it?', b: ['Only type real details into apps you trust'], notes: 'Logging in, a search box, a quiz. Next lesson: Sparky makes a decision.' }
  ],
  'library-8-shelves': [
    { t: 'Which way?', lead: 'If you like stories, point left. Else, point right.', notes: 'Put STORIES and FACTS signs on the walls. Pupils point.' },
    { t: 'Same answer every time?', pic: true, q: 'What does Sparky need to decide?', notes: 'Run the starter with stories, then facts: the same reply.' },
    { t: 'Selection', b: ['Condition: answer = stories (true or false)', 'If true: look left, story books', 'Else: look right, fact books'], notes: 'Only one branch runs each time. A word in the condition needs a text block.' },
    { use: 'steps' },
    { t: 'Test both ways', q: 'What happens with STORIES? Story? Comics?', notes: 'Capital letters are ignored. Anything else goes to the else branch. Is that what we want?' }
  ],
  'library-9-door': [
    { t: 'The number line', lead: '0 = left of the picture, 10 = right', b: ['Is 2 < 4?', 'Is 9 > 6?', 'Is 5 < 4?'], notes: 'Practise less than and greater than on a number line.' },
    { t: 'Look at the visitor', pic: true, q: 'Sparky looks left… and never looks back. Why?', notes: 'Run the starter and move the mouse across the robot.' },
    { t: 'Three places', b: ['mouse x < 4 → look left', 'else, mouse x > 6 → look right', 'else → look ahead'], q: 'Why is all of this inside forever?', notes: 'So Sparky keeps checking. The mouse position is a sensor value.' },
    { use: 'steps' },
    { t: 'Trace it', table: [['mouse x', 'x < 4?', 'x > 6?', 'Sparky looks'], ['1', 'true', '–', 'left'], ['5', 'false', 'false', 'ahead'], ['9', 'false', 'true', 'right']], notes: 'Pairs trace the program for three visitors. Real machines with sensors: automatic doors, street lights.' }
  ],
  'library-10-closing': [
    { t: 'Until…', q: 'Clap until I say stop. Clap forever?', notes: 'Something becoming true is what stops us.' },
    { t: 'Forever and ever', pic: true, q: 'Will Sparky ever say the library is closing?', notes: 'Forever has no gap at the bottom: nothing can come after it.' },
    { t: 'Loops that check', b: ['repeat until timer > 8: blink', 'say the library is closing', 'wait until key space pressed?', 'say goodbye'], notes: 'repeat while is in Control: change it to until.' },
    { use: 'steps' },
    { t: 'Which loop?', q: 'When is forever right? When is repeat until better?', notes: 'Forever for watching the door (lesson 9); repeat until when something should end. Next lesson: debugging.' }
  ],
  'library-11-returns': [
    { t: 'The returns desk', b: ['For 3 books: ask story or fact', 'Story → look left · Fact → look right', 'Then say All done once'], notes: 'This is what should happen. The starter has three bugs.' },
    { t: 'Test data', lead: 'Choose answers on purpose so every part gets tried.', b: ['story, fact, story', 'fact, fact, fact'], notes: 'One test only checks one branch.' },
    { t: 'Bug hunt', pic: true, table: [['What should happen', 'What happens', 'The bug', 'The fix'], ['', '', '', '']], notes: 'Pairs fill in a row for each bug. Fix one bug, then test, then the next.' },
    { use: 'steps' },
    { t: 'Bugs in loops', q: 'Why does a bug inside a loop happen again and again?', notes: 'Discuss the three bugs: the count, the branches, All done inside the loop.' }
  ],
  'library-12-project': [
    { t: 'The brief', lead: 'Sparky runs the help desk on its own.', b: ['Keeps asking until the visitor says bye', 'A reply for at least three choices', 'A polite reply for anything else'], notes: 'Recap Block 2: input, selection, operators, condition loops, debugging.' },
    { t: 'Plan with test data', pic: true, table: [['Answer', 'Sparky should…', 'OK?'], ['books', 'look left, say where', ''], ['juggling', 'say sorry', ''], ['bye', 'say goodbye and stop', '']], notes: 'Pairs plan the choices and the test data before building.' },
    { use: 'steps' },
    { t: 'Visitors', lead: 'Try every choice — and something silly!', notes: 'Pairs swap and leave a star and a wish.' },
    { t: 'Block 2 done!', b: ['Input', 'Selection', 'Operators and sensors', 'Loops that check', 'Debugging'], notes: 'Celebrate. Next block: Open Day.' }
  ],
  'robot-quiz': [
    { t: 'Block 3: Open Day', lead: 'First event: quiz night, with Sparky dressed as Quizbot.', notes: 'Ask two questions and keep score on the board, rubbing out the number each time.' },
    { t: 'What did I remember?', pic: true, b: ['The score started at 0', 'It changed for a right answer', 'I said it at the end'], notes: 'Run the starter: Quizbot says back whatever you type. Input and if … else are from Block 2.' },
    { t: 'A variable', lead: 'A variable is a named value that can change.', b: ['set score to 0 — at the start', 'change score by 1 — only for a right answer', 'say “Your score is ” and score — at the end'], q: 'Where must change score by 1 go? Why?', notes: 'Only in the if part. After the if … else, every answer would score.' },
    { use: 'steps' },
    { t: 'Test both ways', b: ['Right, right → 2', 'Right, wrong → 1', 'Wrong, wrong → 0'], notes: 'Pairs swap and play each other’s quiz.' },
    { t: 'What else?', q: 'What else could a variable remember?', notes: 'Lives in a game, visitors, money in a till. Next lesson: a survey with two variables.' }
  ],
  'library-14-survey': [
    { t: 'Stories or facts?', pic: true, q: 'Who wins in our class?', notes: 'Tally the class on the board. Then run the starter: Sparky forgets every answer.' },
    { t: 'Two tallies', b: ['set stories to 0, set facts to 0', 'if answer = stories: change stories by 1', 'else: change facts by 1'], notes: 'Set them to 0 BEFORE the loop, or they reset every time.' },
    { t: 'Use the data', b: ['say Stories: … and Facts: …', 'if stories > facts: Stories win!', 'else: Facts win!'], notes: 'Compare the two variables with >.' },
    { use: 'steps' },
    { t: 'Is it fair?', q: 'What if someone types comics? What if it is 3 each?', notes: 'Comics count as facts and a draw gives facts the win. How could we fix it?' }
  ],
  'library-15-lights': [
    { t: 'On my signal', lead: 'A signal can start something while you carry on.', notes: 'The whistle warm-up: the light show starts while the reading carries on.' },
    { t: 'Lights after talking?', pic: true, q: 'Why do the lights only flash when Sparky has stopped?', notes: 'One script runs one step after another.' },
    { t: 'Messages', b: ['send message lights → carries straight on', 'when I receive lights → starts the light show', 'Both run at the same time'], notes: 'The names must match exactly.' },
    { use: 'steps' },
    { t: 'One message, many scripts', q: 'Two scripts receive lights. What happens?', notes: 'Both start: a broadcast reaches everyone listening. Like a fire alarm or a starting pistol.' }
  ],
  'library-16-myblocks': [
    { t: 'Whisk!', q: 'What does “whisk” mean in a recipe?', notes: 'A name for a set of steps is a procedure. The name hides the details: abstraction.' },
    { t: 'Spot the copies', pic: true, q: 'Which blocks are copied?', notes: 'Run the starter and find the head nod and head turn groups.' },
    { t: 'My blocks', b: ['to nod yes: head nod 8, 2, 5', 'to shake no: head turn 2, 8, 5', 'Use nod yes and shake no in the game'], notes: 'Defining is building “to …”; calling is using the block.' },
    { use: 'steps' },
    { t: 'Easier to change', q: 'To make Sparky nod faster, how many places do you change now?', notes: 'One: inside to nod yes. Next lesson: blocks with inputs.' }
  ],
  'library-17-inputs': [
    { t: 'Clap for…', q: 'Clap for 3. Clap for 1. What changes?', notes: 'Only the number: that is an input.' },
    { t: '3, 3, 3?', pic: true, b: ['The Owl Who Read Too Much ★★★', 'Space Cats ★★', 'Fish Facts ★'], notes: 'Run the starter and count: every book gets three cheers.' },
    { t: 'An input', b: ['to cheer with: stars', 'repeat stars times: nod', 'cheer 3 · cheer 2 · cheer 1'], notes: 'Use the cog to add the input; the stars block is in Variables.' },
    { use: 'steps' },
    { t: 'Inputs everywhere', q: 'Which built-in blocks have inputs?', notes: 'move … to, say, repeat. Next lesson: the Open Day project.' }
  ],
  'library-18-project': [
    { t: 'Open Day!', lead: 'Welcome each visitor and let them choose what to do until they say bye.', b: ['a variable', 'a message', 'your own block', 'if … else', 'ask'], notes: 'These are the success criteria.' },
    { t: 'Plan it', pic: true, table: [['Variable', 'Starts at', 'What changes it'], ['score', '0', 'a right quiz answer'], ['', '', '']], notes: 'Pairs storyboard a visit and plan variables, messages and My blocks before building.' },
    { use: 'steps' },
    { t: 'Open Day', lead: 'Half of you are visitors, half are hosts — then swap.', notes: 'Visitors fill in a feedback slip.' },
    { t: 'Robot Librarian!', b: ['Sequence, repetition, events', 'Input, selection, condition loops, debugging', 'Variables, data, messages, procedures'], notes: 'Celebrate the whole unit.' }
  ]
};
