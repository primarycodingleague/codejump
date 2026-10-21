// The Train Lab's lesson unit — see lessons/units/README.md. lessons.js merges it in.
// BRINDLEWICK RAILWAY: the little town of Brindlewick is getting its railway back, and the class are its engineers. Mrs Achebe the
// station master gives them a job every lesson: finish the line, program the routes, run the signals and the junctions, and finally
// run the whole railway, with a second engine (Fern) on the branch line to Brindle Farm, for the open day.
// Block 1 Opening the line (Years 3–4) · Block 2 Signals and switches (Years 4–5) · Block 3 Running the railway (Years 5–6).
// Lesson 6 of each block is a design-and-make project. The Train Lab's two earlier lessons (train-snaps, smart-trains) are folded in
// with { adopt }. Starters + answers + examples: lessons/builds/train/brindlewick.mjs; test: tests/unit-train.test.mjs.
// The Train Lab has no "My blocks" (procedures), so Block 3 is variables, data, messages and putting it all together.
const N = 'Brindlewick Railway';
const u = m => `${N} · Block ${Math.ceil(m / 6)} · Lesson ${m}`; // m counts on through the whole unit
const T = { ks: 'ks2', minutes: 60, type: 'train' };
const SNAPS = { ...T, tool: 'Train Lab (track and snaps)' }, BLOCKS = { ...T, tool: 'Train Lab (blocks)' };
const Y34 = 'Years 3–4', Y45 = 'Years 4–5', Y56 = 'Years 5–6';
const DEV = ['A device per pupil or pair, with CodeJump open', 'The board, to show the class'];

export const LESSONS = [
  // ═══════════════════════ BLOCK 1 · OPENING THE LINE (Years 3–4) ═══════════════════════
  {
    id: 'rail-1-track', unit: u(1), title: 'Lay the line', ...SNAPS, years: Y34,
    summary: 'The first Brindlewick Railway lesson. The workers have gone home with the line only half built, so Bramble the engine runs off the end before it gets back to the station. Pupils write a build plan as exact instructions in order, follow it piece by piece and test that the line joins up.',
    objective: 'We are learning to write an algorithm as clear, exact instructions in the right order, and to follow one.',
    success: ['I can write instructions that are exact enough for someone else to follow.', 'I can follow an algorithm one step at a time.', 'I can test my work and say if it did what I planned.'],
    curriculum: ['design', 'reason'],
    words: [['algorithm', 'a set of exact instructions, in the right order, to do a job'], ['instruction', 'one step, like “add a straight piece”'],
      ['sequence', 'the order the steps go in'], ['predict', 'say what you think will happen before you test it'], ['test', 'try it to check it works']],
    need: [...DEV, 'Paper and pencils for the build plan', 'Optional: strips of card (straights) and quarter-circles (curves) for the warm-up'],
    plan: [
      { min: 8, title: 'Welcome to Brindlewick', html: '<p>Tell the class that this term they are the engineers of the <b>Brindlewick Railway</b>. The little town is getting its railway back, and <b>Mrs Achebe</b>, the station master, will give them a job every lesson. Their first engine is called <b>Bramble</b>.</p><p>Warm up: lay a few card “track pieces” on the floor and ask one pupil to give another instructions to add three more. Start vague (“put some track there”), then exact (“a straight piece on the end, then a curve that turns right”). <b>Ask:</b> which instructions worked? Introduce <b>algorithm</b>: exact instructions in the right order.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter (<b>Open the starter</b>) and point out the station, the farm and the jobs list at the top of the board. <b>Predict:</b> what will Bramble do when we press <b>Run</b>? Press it. Bramble stops at the station, goes past the farm… and stops dead at the end of the unfinished line. Job 3 never ticks.</p><p>Press <b>Reset</b>. Show the <b>blue +</b> marks: they are the open ends where a new piece can click on. Hover over the pieces under <b>Track</b> to read their names.</p>' },
      { min: 10, title: 'Write the build plan', html: '<p>Pairs look at the finished half of the line (the top and the right-hand bend) and write the build plan for the missing half on paper as numbered steps: <b>1</b> one straight, <b>2–5</b> four curve rights. Check a few plans: “Could someone follow this without asking you anything?”</p><p>Ask: would it work in a different order? (Try it later: curves first doesn’t join up.)</p>' },
      { min: 22, title: 'Your turn', html: '<p>Pupils follow the Lesson card: one partner reads the plan aloud, step by step, the other builds exactly what they hear. Then <b>Run</b>. When every job ticks, they swap roles and try a different order on purpose to see what happens (Undo puts it back).</p><p>Common slips: tapping the + at the station end instead of the farm end; picking Curve left. Both are easy to see when you test, and Undo fixes them.</p>' },
      { min: 10, title: 'Share', html: '<p>Two pairs read their build plan while you build it on the board, following it exactly, even if it is wrong. <b>Ask:</b> what made a plan easy to follow? Why does the order matter? Next lesson: the coloured snaps on the track become Bramble’s program.</p>' }
    ],
    support: 'Give pairs the plan on a card (“1 Straight, 2 Curve right, 3 Curve right, 4 Curve right, 5 Curve right”) and let them tick each step as they build it.',
    stretch: 'Make the oval longer: add a straight to the top and to the bottom so it still joins up. Write the new plan first. Or add a second loop of your own on the empty mat.',
    assess: ['Writes a build plan as exact steps in order', 'Follows a plan step by step', 'Tests the line and explains why the order of the pieces matters'],
    steps: [
      { t: 'Meet Bramble', d: 'Press Run. Bramble stops at the station and goes past the farm. What happens at the end of the line? Press Reset.' },
      { t: 'Write the plan', d: 'On paper, write the steps to finish the line: which pieces, in which order? Look at the half that is already built.' },
      { t: 'A straight', d: 'Under Track, pick the Straight piece. Tap the blue + at the end of the line by the farm.' },
      { t: 'Four curves', d: 'Pick Curve right and tap the blue + at the end of the line four times, one after another. Watch the line bend round.' },
      { t: 'Does it join?', d: 'When the line joins up with the start, the blue + marks disappear. If not, press Undo and check your plan.' },
      { t: 'Test it', d: 'Press Run. Do all three jobs tick off? Then try the pieces in a different order. What happens?' }
    ]
  },
  {
    adopt: 'train-snaps', unit: u(2), years: Y34, title: 'Snap code: the village line',
    summary: 'Mrs Achebe’s first route for Bramble, and no blocks at all: coloured snaps on the track are the program. Pupils predict and fix a buggy stop at the station, then add snaps in the right order and the right place so Bramble does every job on the village line: stop, slow down by the school, turn back and end at the station.',
    plan: [
      { min: 5, title: 'Colour code', html: '<p>Pupils stand up as “trains” and walk slowly on the spot. Hold up paper squares in a row: <b>white red</b> = stop and count to 2, <b>white green</b> = walk slowly, <b>white blue</b> = turn round. Then hold up <b>red white</b>. <b>Ask:</b> did anyone stop? Why not? (The command has to start with white: white means “listen, a command is coming”.)</p>' },
      { min: 10, title: 'The snap rules', html: '<p>Open the starter on the board. Mrs Achebe has a new route for Bramble: the village line. Bramble drives itself today: there are no blocks. The coloured <b>snaps</b> on the track are the program, and the train reads them with a colour sensor underneath as it drives over them.</p><p>Show the three rules (Help → Snap commands has them too): a command <b>starts with white</b> in the direction the train is going, has <b>no gaps</b>, and is all on <b>one piece</b> of track. Point to the jobs list at the top of the board: this is the <b>algorithm</b> for the route, in order.</p><p><b>Predict:</b> look at the snaps by the station (red, then white). Will the train stop there? Take a vote, then press <b>Run</b>.</p>' },
      { min: 10, title: 'Debug the station', html: '<p>The train goes straight past the station and job 2 never ticks. Introduce <b>bug</b> and <b>debug</b>. Pupils follow the Lesson card to swap the two snaps: pick the white snap and tap the first slot, then the red snap and tap the second slot. Run again: the train stops for 2 seconds and the job ticks.</p><p>Tip: tapping a slot with the same colour takes the snap off; tapping it with a different colour swaps it.</p>' },
      { min: 20, title: 'Finish the route', html: '<p>Pupils add the rest of the route one job at a time, pressing <b>Run</b> after each one: <b>white green</b> on the school’s piece (slow down), <b>white blue</b> on the fallen trees’ curve (turn back), then <b>white red blue</b> on the station’s piece to end the route.</p><p>The last job is the tricky one: the train comes back the <b>other way</b>, so it reads the station’s snaps from right to left. White has to go in the slot it reaches first (the right-hand end), then red, then blue. <b>Ask:</b> what happened when you put white red blue from the left? (The train read it on the way <i>out</i> and ended its route straight after the station, before the school.) Fast finishers open <b>Challenges</b> and try the ready-made <b>Airport run</b>.</p>' },
      { min: 10, title: 'Challenge card and plenary', html: '<p>Show <b>Challenges → Print the challenge card</b>: a card with the track, the places and the jobs, to build with real track and snaps. <b>Ask:</b> what is the algorithm for our route? Read the snaps in order as a sequence: “white red, white green, white blue, white red blue”. What would happen if we swapped two of them round?</p><p>Next lesson: market day in Brindlewick, and Bramble’s first blocks.</p>' },
      { min: 5, title: 'Reflect', html: '<p>Pupils tell a partner one bug they found and how they fixed it, using the words <b>predict</b>, <b>test</b> and <b>debug</b>.</p>' }
    ]
  },
  {
    id: 'rail-3-market', unit: u(3), title: 'Market day', ...BLOCKS, years: Y34,
    summary: 'It is market day and Mrs Achebe wants Bramble to stop at the school, then the shops, then end at the harbour. Pupils meet the Train Lab’s blocks, decompose the run into three legs, measure each leg by counting track pieces (25 cm each) and build the program one leg at a time.',
    objective: 'We are learning to break a big job into smaller parts (decomposition) and to build and test a program one part at a time.',
    success: ['I can break the run into legs.', 'I can measure each leg by counting pieces of track.', 'I can build and test my program one leg at a time.'],
    curriculum: ['design', 'reason'],
    words: [['decompose', 'break a big job into smaller parts'], ['leg', 'one part of a journey, from one stop to the next'], ['block', 'one instruction you can drag into a program'], ['measure', 'find out how long something is'], ['sequence', 'the order the steps go in']],
    need: [...DEV, 'Paper and pencils', 'Optional: a ruler or tape measure for the warm-up'],
    plan: [
      { min: 7, title: 'Big jobs, small parts', html: '<p><b>Ask:</b> how would you plan a trip to the seaside? It is easier in parts: walk to the bus stop, bus to the station, train to the sea. Introduce <b>decompose</b>: breaking a big job into smaller parts. Each part (a <b>leg</b>) is easier to plan and to check.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter. This time Bramble has <b>blocks</b>: click a category on the left (Events, Control… and <b>Bramble</b>) to see them. Read the program: “when Run is clicked, drive forward 75 cm at 30 cm/s, wait 2 seconds.” Press <b>Run</b>: Bramble does leg 1 and stops at the school.</p><p>One piece of track is <b>25 cm</b>. Count the pieces from the start flag to the school together: 3 pieces = 75 cm. That is how the 75 was worked out.</p>' },
      { min: 8, title: 'Decompose and measure', html: '<p>Pairs write the run as three legs on paper (start → school, school → shops, shops → harbour), count the pieces in each and multiply by 25: 75 cm, 50 cm and 75 cm. Each leg needs the same two blocks: <b>drive forward … cm</b>, then <b>wait 2 seconds</b> (so Bramble stays at the stop).</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card, adding leg 2, pressing Run, then leg 3. Insist on Run after each leg: it is much easier to find a mistake in one leg than in the whole run. The jobs list ticks off each stop.</p><p>Common slips: forgetting to change 10 to the leg’s length; a drive block dropped loose in the space (it must click on under the others); counting the stop’s own piece twice.</p>' },
      { min: 10, title: 'Share', html: '<p><b>Ask:</b> how many legs? Which numbers did you use and why? If Bramble had stopped in the wrong place at the shops, which leg would you check? Next lesson: the school shuttle, and a way to do the same thing again without more blocks.</p>' }
    ],
    support: 'Give pairs the three leg lengths (75, 50, 75) so they can focus on dragging and joining the blocks.',
    stretch: 'Make Bramble wait longer at the shops (5 seconds) for the market shoppers. Then add a leg 4 back to the shops by driving backward (choose backward in the drive block).',
    assess: ['Splits the run into legs', 'Works out each leg’s length by counting pieces', 'Builds and tests the program one leg at a time'],
    steps: [
      { t: 'Leg 1', d: 'Press Run. Bramble drives 75 cm to the school and waits there. That is leg 1 of the market day run.' },
      { t: 'Break it up', d: 'On paper, write the legs: start to school, school to shops, shops to harbour. Count the pieces in each leg.' },
      { t: 'Measure', d: 'One piece of track is 25 cm. Leg 1 is 3 pieces = 75 cm. Work out legs 2 and 3.' },
      { t: 'Leg 2', d: 'Click Bramble. Drag “drive forward 10 cm at 30 cm/s” under “wait 2 seconds” and change 10 to your leg 2 number. From Control, add “wait 1 seconds” and make it 2.' },
      { t: 'Test leg 2', d: 'Press Run. Does Bramble stop at the shops? If not, check your number. Press Reset.' },
      { t: 'Leg 3', d: 'Add one more “drive forward … cm” block for leg 3, to the harbour. Press Run. Do all four jobs tick?' }
    ]
  },
  {
    id: 'rail-4-shuttle', unit: u(4), title: 'The school shuttle', ...BLOCKS, years: Y34,
    summary: 'Bramble runs the school shuttle: from the station to the school and back, three times every morning. The starter does one trip. Pupils work out that three trips would need twelve blocks, then use a repeat loop so the same four blocks run three times.',
    objective: 'We are learning to use a count-controlled loop (repeat) to run the same steps again and again.',
    success: ['I can spot the part of a program that repeats.', 'I can put blocks inside a repeat loop.', 'I can change the number of times a loop repeats.'],
    curriculum: ['design', 'ssr'],
    words: [['repeat', 'do the same thing again'], ['loop', 'a block that runs the blocks inside it again and again'], ['count-controlled', 'a loop that repeats a set number of times'], ['trip', 'one journey there and back']],
    need: DEV,
    plan: [
      { min: 7, title: 'Again and again', html: '<p>Clap a pattern: clap, clap, stamp. Now do it three times. <b>Ask:</b> how would you write that down? “Clap, clap, stamp” three times takes nine instructions, or one: <b>repeat 3 times</b>: clap, clap, stamp. Introduce <b>loop</b> and <b>repeat</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Bramble drives 100 cm to the school, waits, drives 100 cm backward to the station and waits. That is <b>one trip</b>. Three of the seven jobs tick. Mrs Achebe needs three trips.</p><p><b>Ask:</b> how many blocks would three trips need if we copied them? (12.) Which blocks would be the same each time? (All four.)</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: drag a <b>repeat 10 times</b> loop from Control, drag the four trip blocks into it (dragging the first block brings the ones under it too), put the loop under “when Run is clicked” and change 10 to 3. Run it and watch all seven jobs tick.</p><p>Common slips: the loop left loose in the space (it never runs); only some of the blocks inside the loop (Bramble ends up at the school); 10 trips instead of 3.</p>' },
      { min: 10, title: 'Count the blocks', html: '<p>Pairs count: how many blocks with the loop? (6.) Without? (13.) <b>Ask:</b> what would you change for five trips? Twenty? Just one number. Where else do people repeat things? (Songs, skipping, buses that run every day.)</p>' },
      { min: 8, title: 'Share', html: '<p>One pair explains their program on the board. <b>Ask:</b> what is inside the loop, and why? Next lesson: Bramble gets a driver, and pupils control it with the keyboard.</p>' }
    ],
    support: 'Give pairs the finished program on a card to copy and talk through. Let them try “repeat 2 times” first and count the jobs.',
    stretch: 'Make Bramble flash its top light while it waits at the school: put “set top LED color to” blocks (red, then green) inside the loop. Does the loop still do 3 trips?',
    assess: ['Spots the four blocks that make one trip', 'Puts them inside a repeat loop', 'Changes the number of repeats to make three trips'],
    steps: [
      { t: 'One trip', d: 'Press Run. Bramble goes to the school and back once. How many jobs tick? Press Reset.' },
      { t: 'Spot the pattern', d: 'The jobs want three trips. Which blocks make one trip? How many blocks would three trips need?' },
      { t: 'A loop', d: 'Click Control. Drag “repeat 10 times” into the space next to your program.' },
      { t: 'Fill the loop', d: 'Drag the first block under “when Run is clicked” into the repeat. The other three blocks come with it.' },
      { t: 'Three times', d: 'Put the repeat back under “when Run is clicked”. Change 10 to 3. Press Run.' },
      { t: 'Check', d: 'Do all seven jobs tick off? What one number would you change for five trips?' }
    ]
  },
  {
    id: 'rail-5-driver', unit: u(5), title: 'In the driver’s cab', ...BLOCKS, years: Y34,
    summary: 'Today the pupils are Bramble’s driver. The g key starts the train, but there is no way to stop it. Pupils learn that an event (a key press) starts a script, add “when s key pressed → stop driving” and drive Bramble to every stop themselves.',
    objective: 'We are learning that an event, like pressing a key, can start a script, and to use events to control a train.',
    success: ['I can explain what an event is.', 'I can make a key press start a script.', 'I can use two events to start and stop the train.'],
    curriculum: ['design', 'ssr'],
    words: [['event', 'something that happens, like pressing a key, that starts a script'], ['script', 'a stack of blocks that starts with an event'], ['input', 'something we give the computer, like a key press'], ['control', 'make something do what we want, when we want']],
    need: DEV,
    plan: [
      { min: 7, title: 'When … then', html: '<p>Play a game: “When I clap, stand up. When I click my fingers, sit down.” <b>Ask:</b> how did you know when to move? Something <b>happened</b> first. Introduce <b>event</b>: something that happens and starts a script.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter. Read the only script: “when g key pressed → drive forward at 45 cm/s”. Press <b>Run</b>. Nothing happens! <b>Ask:</b> why? (The script is waiting for its event.) Press <b>g</b>: Bramble sets off. Try to stop it at the station… you can’t.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: from Events they drag “when space key pressed”, choose <b>s</b>, and put “stop driving” (from Bramble) under it. Then they drive: Run, g to go, s to stop at the station, g again, s at the depot. The jobs list ticks as they go.</p><p>It takes practice to stop in the right place: the jobs tick if Bramble stops near the sign. Fast finishers add a <b>b</b> key that drives backward.</p>' },
      { min: 10, title: 'Events everywhere', html: '<p><b>Ask:</b> what other events start things? (A doorbell button, a lift button, a crossing button, a tap on a tablet.) Look at the program: two scripts, two events, and both can run whenever their key is pressed.</p>' },
      { min: 8, title: 'Share', html: '<p>Pairs race to complete all four jobs in the fewest key presses. <b>Ask:</b> is it better for a person or a program to drive? Next lesson: the Block 1 project, a new line of your own.</p>' }
    ],
    support: 'Build the s key script together on the board first, then let pairs take turns at driving.',
    stretch: 'Add “when b key pressed → drive backward at 30 cm/s” (choose backward in the drive block), and an h key that sets the headlights to yellow. Can you back Bramble into the depot?',
    assess: ['Explains that the script waits for its event', 'Makes a key press start a script', 'Uses two events to drive and stop the train'],
    steps: [
      { t: 'Run … nothing?', d: 'Press Run. Nothing happens! Read the script: what is it waiting for? Press g.' },
      { t: 'No brakes', d: 'Bramble goes round and round. There is no way to stop it! Press Stop.' },
      { t: 'A stop key', d: 'From Events, drag “when space key pressed” into the space. Click space and choose s.' },
      { t: 'Stop driving', d: 'Click Bramble. Drag “stop driving” and join it under “when s key pressed”.' },
      { t: 'Drive!', d: 'Press Run. Press g to go and s to stop at the station. Then g again, past the farm, and s at the depot.' },
      { t: 'Check', d: 'Do all four jobs tick? Can you do it with fewer key presses?' }
    ]
  },
  {
    id: 'rail-6-project', unit: u(6), title: 'Project: a new line for Brindlewick', ...BLOCKS, years: Y34,
    summary: 'The Block 1 project. Mrs Achebe wants a new line for Brindlewick. Pupils plan a loop of track with at least three places, give Bramble a route of jobs with the Order tool, then program it with snaps and blocks (a repeat or a key event), test it, fix it and swap with a partner.',
    objective: 'We are learning to design, build, test and improve a program for a route we planned ourselves.',
    success: ['I can plan my line and my route before I build it.', 'I can program the route using snaps and blocks.', 'I can use a repeat loop or a key event.', 'I can test and fix my route until every job ticks.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['design', 'plan what you will make before you make it'], ['algorithm', 'exact steps in the right order'], ['test', 'try it to check it works'], ['debug', 'find and fix the mistakes'], ['evaluate', 'say what works well and what could be better']],
    need: [...DEV, 'Squared paper for the plan'],
    plan: [
      { min: 8, title: 'The brief', html: '<p>Mrs Achebe wants a new line: a loop, at least <b>three places</b> (the castle? the zoo? the school?) and a route of at least <b>four jobs</b> for Bramble. It must use <b>snaps</b>, and a <b>repeat</b> loop or a <b>key event</b>. Show the success criteria on the board.</p>' },
      { min: 10, title: 'Plan it', html: '<p>Pairs sketch their line on squared paper: the pieces, the places, the jobs in order, and which snaps or blocks will do each job. Check: is it a loop? Does every job have a command?</p>' },
      { min: 27, title: 'Build, test, fix', html: '<p>Pupils follow the Lesson card: build the loop (no blue + left), put up the places (Places list, then tap beside the track), number the jobs with the <b>Order</b> tool, then program. Remind them of the snap rules (white first, no gaps, one piece) and to test after each job.</p><p>Fast finishers print their challenge card (<b>Challenges → Print the challenge card</b>).</p>' },
      { min: 10, title: 'Swap and evaluate', html: '<p>Pairs swap devices, press Run, and give one star (something that works well) and one wish (something to improve). <b>Ask:</b> which skill from this block did you use: algorithm, sequence, decomposition, repeat, events, debugging?</p>' },
      { min: 5, title: 'Celebrate', html: '<p>Show two or three lines on the board. Next block: signals and switches — Bramble starts to sense the track and make decisions.</p>' }
    ],
    support: 'Start from the oval in lesson 1 (build plan: 2 straights, 4 curves, 2 straights, 4 curves) and add three places to it.',
    stretch: 'Add a split and a passing loop, or a second section of track. Use white red red (stop 5 seconds) for a busy station, and a repeat loop that flashes the top light.',
    assess: ['Plans the line and the route before building', 'Programs every job with snaps and/or blocks', 'Uses a repeat loop or a key event', 'Tests and fixes until every job ticks', 'Gives a partner useful feedback'],
    steps: [
      { t: 'Plan it', d: 'On paper, draw your line: a loop, at least 3 places, and the jobs Bramble will do, in order.' },
      { t: 'Build the loop', d: 'Under Track, add pieces at the blue + marks until your line joins up and no blue + is left.' },
      { t: 'Places', d: 'Choose a place from the Places list, then tap beside the track. Put up at least 3.' },
      { t: 'The jobs', d: 'Pick the Order tool and tap your places in the order Bramble should visit them. The jobs appear at the top.' },
      { t: 'Program it', d: 'Use snaps (white first!) and blocks: “when Run is clicked” or a key event, and a repeat loop.' },
      { t: 'Test and fix', d: 'Press Run. Fix one thing at a time until every job ticks. Then swap with a partner and try theirs.' }
    ]
  },

  // ═══════════════════════ BLOCK 2 · SIGNALS AND SWITCHES (Years 4–5) ═══════════════════════
  {
    id: 'rail-7-signal', unit: u(7), title: 'The red signal', ...BLOCKS, years: Y45,
    summary: 'Brindlewick has new signals: a red marker by the station and a green one by the farm. Bramble drives straight past the red one! Pupils find out how the colour sensor under the train is an input, and use a sensor event (“when train sees red”) to stop the train and show a red light: input → event → output.',
    objective: 'We are learning how a sensor gives a computer an input, and to make a program react to what the sensor sees.',
    success: ['I can explain that the colour sensor is an input.', 'I can use “when train sees …” to start a script.', 'I can make the train react with an output: stopping and a light.'],
    curriculum: ['design', 'ssr'],
    words: [['sensor', 'a part that measures something about the world, like the colour under the train'], ['input', 'information that goes into a computer'], ['output', 'something the computer does, like driving the motor or lighting a light'], ['signal', 'a light that tells a train to stop or go'], ['event', 'something that happens that starts a script']],
    need: [...DEV, 'Optional: red and green card for the warm-up'],
    plan: [
      { min: 7, title: 'Red means stop', html: '<p>Pupils walk slowly as trains. Hold up red or green card: they stop for a count of 3 at red and point at you (a light!), and walk on at green. <b>Ask:</b> how did you know? Your eyes <b>sensed</b> the colour (input) and you <b>did</b> something (output). Introduce <b>sensor</b>, <b>input</b> and <b>output</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Bramble drives straight past the red signal by the station. <b>Ask:</b> why doesn’t the snap stop it? (A command must start with white. This lone red snap is a <b>marker</b>, not a command.) But the colour sensor under the train still <b>sees</b> it.</p><p>Show the block <b>when train sees red (1)</b> in the Bramble category: a script that starts when the sensor sees red.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: “when train sees red (1)” → “pause driving for 3 seconds” and “set top LED color to” red; then a second script for green. Press Run and watch the jobs tick as Bramble waits at the signal every time round.</p><p>Common slips: picking the wrong colour in the “when train sees” dropdown; using “stop driving” (Bramble never goes again — ask why “pause” is better here).</p>' },
      { min: 10, title: 'Input, event, output', html: '<p>Pairs point to each part of their program: the <b>input</b> (the sensor), the <b>event</b> (“when train sees red”), the <b>outputs</b> (pausing the motor, the light). <b>Ask:</b> where else do sensors start things? (Automatic doors, hand dryers, street lights at night.)</p>' },
      { min: 8, title: 'Share', html: '<p>Run one program on the board. <b>Ask:</b> what would happen with a blue marker and no script for blue? Next lesson: Bramble makes a decision at a split in the track.</p>' }
    ],
    support: 'Build the red script together on the board, then pairs add the green one on their own.',
    stretch: 'Add a third marker of your own (Snaps → yellow, on any piece) and a script that sets the headlights to yellow when Bramble sees it. Use “set top LED hue to” to pick any colour.',
    assess: ['Explains that the colour sensor is an input', 'Uses “when train sees …” to start a script', 'Makes the train pause and change its light (outputs)'],
    steps: [
      { t: 'Watch', d: 'Press Run. Bramble drives straight past the red signal by the station! Press Stop.' },
      { t: 'The sensor', d: 'Bramble has a colour sensor underneath. A red snap on its own isn’t a command, but the sensor still sees it.' },
      { t: 'When it sees red', d: 'Click Bramble. Drag “when train sees red (1)” into the space. Under it put “pause driving for 2 seconds” and make it 3.' },
      { t: 'A red light', d: 'Add “set top LED color to” under the pause. Click its colour and pick red. Press Run.' },
      { t: 'Green for go', d: 'Drag another “when train sees” block, choose green (2), and put “set top LED color to” green under it.' },
      { t: 'Check', d: 'Press Run. Does Bramble wait at the red signal every time round? Do all four jobs tick?' }
    ]
  },
  {
    id: 'rail-8-platform', unit: u(8), title: 'Which platform?', ...BLOCKS, years: Y45,
    summary: 'The station is on a loop off the main line. Some mornings there are passengers waiting, some mornings there aren’t. The signal box holds the space key down when there are passengers. Pupils use selection — if … else with a condition (key space pressed?) — so Bramble decides which way to go at the split.',
    objective: 'We are learning to use selection (if … else) with a condition so a program chooses between two ways.',
    success: ['I can explain what a condition is.', 'I can use if … else so the train goes one way or the other.', 'I can test both ways: when the condition is true and when it is false.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['selection', 'choosing what to do with if … else'], ['condition', 'a question that is true or false, like “is the space key pressed?”'], ['true / false', 'the two answers a condition can have'], ['split', 'a piece of track where the train can go two ways'], ['branch', 'one of the two ways a program can go after an if']],
    need: DEV,
    plan: [
      { min: 7, title: 'If … else', html: '<p>Play “If … else”: “<b>If</b> you are wearing a jumper, stand up, <b>else</b> sit on the floor.” Then: “If it is raining, take the bus, else walk.” <b>Ask:</b> what is the question each time? Introduce <b>condition</b> (a question with a true or false answer) and <b>selection</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. At the split, Bramble always goes straight on, past the shops. The station is on the loop! Show the script “when train sees yellow (3) → on next split go straight”: the yellow marker is just before the split, so Bramble chooses its way there, in time.</p><p>Write the rule: “<b>If</b> the space key is pressed (passengers waiting), go right. <b>Else</b>, go straight.”</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: the “if … else” block from Control goes into the yellow script, “key space pressed?” from Sensing goes in its gap, “on next split go right” goes in the if part and “on next split go straight” in the else part. Test <b>both</b> ways: hold space as Bramble reaches the yellow marker, then don’t.</p><p>Common slips: using the plain “if” (no else), so Bramble picks a random way when space isn’t held; letting go of space before the marker.</p>' },
      { min: 10, title: 'Test both branches', html: '<p>Pairs fill in a table: “space held? → which way?” for three laps. <b>Ask:</b> why do we have to test both ways? (A bug can hide in the branch you didn’t try.)</p>' },
      { min: 8, title: 'Share', html: '<p><b>Ask:</b> what was the condition? What happens when it is true? False? Where else does a computer choose between two ways? Next lesson: Bramble backs into the shed and has to know when to stop.</p>' }
    ],
    support: 'Give pairs a picture of the finished yellow script to copy. Let one partner drive the space key while the other watches the split.',
    stretch: 'Use the other condition: from Operators, use “pick random 1 to 10” and “=” so Bramble sometimes visits the station by itself. Or light the top LED green when it takes the loop.',
    assess: ['Explains the condition and its two answers', 'Uses if … else to choose the way at the split', 'Tests both branches and records the result'],
    steps: [
      { t: 'Always straight', d: 'Press Run. At the split, Bramble always goes straight past the shops. The station is on the loop! Press Stop.' },
      { t: 'The marker', d: 'Find the script “when train sees yellow (3)”. It chooses the way just before the split.' },
      { t: 'Decide', d: 'From Control, drag the “if … else” block (the if with else) into “when train sees yellow (3)”.' },
      { t: 'The condition', d: 'From Sensing, put “key space pressed?” into the gap next to “if”.' },
      { t: 'Which way?', d: 'From Bramble, put “on next split go straight” in the if part and choose right. Move the old “on next split go straight” into the else part.' },
      { t: 'Test both ways', d: 'Press Run. Hold space as Bramble reaches the yellow marker: does it take the loop? Next time don’t: does it go straight?' }
    ]
  },
  {
    id: 'rail-9-shed', unit: u(9), title: 'Into the shed', ...BLOCKS, years: Y45,
    summary: 'At the end of the day Bramble backs slowly into the engine shed (the depot), but it doesn’t know when to stop and crashes into the buffers. Pupils use a loop that checks a condition — wait until sensor color = red (1) — with a comparison operator, so Bramble stops on the red marker.',
    objective: 'We are learning to use a loop that waits until a condition is true, and to compare a sensor value with an operator.',
    success: ['I can use “wait until” to wait for a condition.', 'I can use = to compare the sensor color with a colour.', 'I can explain why the train stops in the right place.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['wait until', 'a block that keeps checking a condition and waits until it is true'], ['operator', 'a block that compares or works things out, like ='], ['compare', 'check if two things are the same, bigger or smaller'], ['condition', 'a question that is true or false'], ['buffers', 'the end of the line, where a train must stop']],
    need: DEV,
    plan: [
      { min: 7, title: 'Wait until…', html: '<p>Ask a pupil to walk slowly backwards towards a red card on the floor and stop exactly on it. <b>Ask:</b> what were you doing all the time? Checking “am I on the red yet?” again and again. Introduce <b>wait until</b>: keep checking a condition until it is true.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Bramble backs into the depot… and crashes into the buffers at the end of the line. <b>Ask:</b> what does it need to know? When it is over the red marker. Show the <b>sensor color</b> block: it gives the colour under the sensor as a number (red is 1). The <b>red (1)</b> block is the number for red.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: “wait until” (Control) under “drive backward at 20 cm/s”, the compare block from Operators in its gap, “sensor color” on the left, “red (1)” on the right, then “stop driving”. Run it: Bramble stops on the marker and both jobs tick.</p><p>Common slips: putting “stop driving” inside the wait until’s gap; leaving 0 = 50 in the compare block; comparing with red without the = sign.</p>' },
      { min: 10, title: 'Speed and safety', html: '<p>Pairs try faster speeds: 40, 60, 100 cm/s. <b>Ask:</b> does it still stop on the marker? Why might a real driver go slowly into the shed? (A fast train needs further to stop.)</p>' },
      { min: 8, title: 'Share', html: '<p><b>Ask:</b> what is the difference between “when train sees red” (last week) and “wait until sensor color = red”? (One is an event that starts a script; one is a script that waits in the middle.) Next lesson: a check that never stops.</p>' }
    ],
    support: 'Build the compare block together on the board. Pairs then put it into “wait until” and add “stop driving”.',
    stretch: 'Use “repeat until” instead: repeat until sensor color = red (1), set the headlights to yellow then white (a flashing warning light). Then stop driving.',
    assess: ['Uses “wait until” with a condition', 'Compares the sensor colour with red using =', 'Explains why the train now stops on the marker'],
    steps: [
      { t: 'Crash!', d: 'Press Run. Bramble backs into the depot and hits the buffers at the end of the line! Press Stop.' },
      { t: 'The marker', d: 'There is a red marker in the depot. Bramble must stop when its sensor sees it.' },
      { t: 'Wait until', d: 'From Control, drag “wait until” under “drive backward at 20 cm/s”.' },
      { t: 'The question', d: 'From Operators, put the “0 = 50” block in its gap. From Bramble, put “sensor color” on the left and “red (1)” on the right.' },
      { t: 'Stop', d: 'From Bramble, add “stop driving” under “wait until”. Press Run.' },
      { t: 'Check', d: 'Does Bramble stop on the red marker, before the buffers? Do both jobs tick? Try a faster speed.' }
    ]
  },
  {
    id: 'rail-10-speed', unit: u(10), title: 'The speed check', ...BLOCKS, years: Y45,
    summary: 'Snaps make Bramble go fast on the top of the line and slow on the bottom. Mrs Achebe wants a warning light: red whenever the train goes faster than 50 cm/s, green otherwise. Pupils use a forever loop with if … else inside it and the > operator, so the program checks the speed all the time.',
    objective: 'We are learning to use a loop that keeps checking a condition, with an operator (>) to compare numbers.',
    success: ['I can use a forever loop to keep checking.', 'I can use > to compare the speed with a number.', 'I can explain why the check has to be inside the loop.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['forever', 'a loop that never stops (until Stop is pressed)'], ['greater than (>)', 'bigger than'], ['operator', 'a block that compares or works things out'], ['speed', 'how fast something is going, here in cm per second'], ['check', 'ask a question to find out']],
    need: DEV,
    plan: [
      { min: 7, title: 'Keep checking', html: '<p>Pupils are “speed cameras”. Walk past at different speeds. They hold up red if you are going “too fast” and green if not. <b>Ask:</b> when did you check? All the time, not just once! That is a <b>forever</b> loop with an <b>if … else</b> inside.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. The snaps make Bramble speed up on the top (white green green green = fast, 60 cm/s) and slow down on the bottom (white green = slow, 30 cm/s). The top light is always green. <b>Ask:</b> the starter sets the light once, at the start. Why doesn’t it change?</p><p>Write the rule: forever: <b>if</b> speed (cm/s) &gt; 50 then red <b>else</b> green.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: forever under the green light block, if … else inside it, the compare block with “speed (cm/s)” &gt; 50, green in the else part and red in the if part. Run and watch the light follow the speed.</p><p>Common slips: the if … else <i>under</i> forever instead of <i>inside</i> it (it checks once); &lt; instead of &gt;.</p>' },
      { min: 10, title: 'Why forever?', html: '<p>Pairs take the if … else out of the forever loop and run it again. <b>Ask:</b> what changed? Then put it back. Ask them to explain to their partner why the check has to be inside the loop.</p>' },
      { min: 8, title: 'Share', html: '<p><b>Ask:</b> what was compared with what? What did &gt; mean? Next lesson: Mrs Achebe’s signal box has three bugs.</p>' }
    ],
    support: 'Give pairs the finished program as a picture. They build it and focus on explaining what forever does.',
    stretch: 'Make three lights: red over 50, yellow over 35, green otherwise (put a second if … else inside the else part). Show the speed on the board: make a variable and set it to speed (cm/s) inside the loop.',
    assess: ['Uses forever to keep checking', 'Compares the speed with 50 using >', 'Explains why the check must be inside the loop'],
    steps: [
      { t: 'Watch the light', d: 'Press Run. Bramble goes fast on the top and slow on the bottom, but its light is always green. Press Stop.' },
      { t: 'The rule', d: 'Mrs Achebe wants: red light when Bramble goes faster than 50 cm/s, green light when it doesn’t.' },
      { t: 'Keep checking', d: 'From Control, drag “forever” under “set top LED color to”.' },
      { t: 'If … else', d: 'Put an “if … else” inside forever. From Operators, put the compare block in its gap: make it speed (cm/s) > 50.' },
      { t: 'The lights', d: 'Move the green “set top LED color to” into the else part. Put another one in the if part and pick red.' },
      { t: 'Check', d: 'Press Run. Is the light red on the fast part and green on the slow part, every time round?' }
    ]
  },
  {
    id: 'rail-11-debug', unit: u(11), title: 'The faulty signal box', ...BLOCKS, years: Y45,
    summary: 'The signal box program has three bugs, one in each part. Mrs Achebe’s bug report: Bramble doesn’t stop at the red signal, the space key sends it the wrong way at the split, and the speed light is red at the wrong times. Pupils test, read the blocks, and fix the conditions and events one at a time.',
    objective: 'We are learning to find and fix bugs in events, conditions and loops by testing one thing at a time.',
    success: ['I can test a program against what it should do.', 'I can find a bug by reading the blocks and comparing.', 'I can fix one bug at a time and test again.'],
    curriculum: ['reason', 'design'],
    words: [['bug', 'a mistake in a program'], ['debug', 'find and fix the mistakes'], ['bug report', 'a list of what goes wrong'], ['condition', 'a question that is true or false'], ['test', 'run it to check one thing']],
    need: [...DEV, 'A printed bug report (or the slide) for each pair'],
    plan: [
      { min: 7, title: 'The bug report', html: '<p>Show Mrs Achebe’s bug report: 1 Bramble must stop at the red signal by the station; 2 holding space at the yellow marker must take the loop to the school, not holding it must go straight; 3 the light must be red when Bramble goes faster than 50 cm/s, green otherwise. <b>Ask:</b> how would you test each one?</p>' },
      { min: 8, title: 'Test first', html: '<p>Open the starter on the board and press <b>Run</b>. Test each line of the report together: it fails all three! Model the debugging questions: What should happen? What actually happens? Which script does that part? What is different?</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card, fixing one bug at a time and pressing Run after each. The bugs: the “when train sees” block that pauses the train watches for <b>green</b> instead of red; the if … else has right and straight the <b>wrong way round</b>; the speed check uses <b>&lt;</b> instead of &gt;.</p><p>Encourage “change one thing, then test”. Ask pairs to write each bug and its fix in one sentence.</p>' },
      { min: 10, title: 'Bug swap', html: '<p>Pairs put ONE new bug into their working program, swap devices and find each other’s bug using the bug report.</p>' },
      { min: 8, title: 'Share', html: '<p><b>Ask:</b> which bug was hardest to find? Why does testing one thing at a time help? Next lesson: the Block 2 project, a junction controller of your own.</p>' }
    ],
    support: 'Tell pairs which script each bug is in. Start with bug 1 (the easiest to see).',
    stretch: 'Add a fourth check to the bug report and program it: the headlights should go yellow while Bramble is on the loop (when train sees yellow and the space key is pressed).',
    assess: ['Tests the program against each line of the bug report', 'Finds each bug by reading and comparing the blocks', 'Fixes the bugs one at a time and tests again'],
    steps: [
      { t: 'The bug report', d: '1 Stop at the red signal. 2 Space at the yellow marker = take the loop, no space = straight on. 3 Red light when faster than 50 cm/s.' },
      { t: 'Test it', d: 'Press Run and test each line. Hold space when Bramble reaches the yellow marker. What goes wrong?' },
      { t: 'Bug 1', d: 'Bramble doesn’t wait at the red signal. Find the “when train sees” block with the pause in it. Which colour is it watching for?' },
      { t: 'Bug 2', d: 'Hold space at the yellow marker: which way does Bramble go? Look inside the if … else. Are right and straight in the right parts?' },
      { t: 'Bug 3', d: 'Watch the light on the fast part. Read the compare block in the forever loop: is it < or >?' },
      { t: 'Test again', d: 'Fix one bug at a time and press Run after each. Do all four jobs tick? Does each line of the report work?' }
    ]
  },
  {
    id: 'rail-12-project', unit: u(12), title: 'Project: the junction controller', ...BLOCKS, years: Y45,
    summary: 'The Block 2 project. Pupils design a controller for a junction: they add markers, places and jobs to a track with a passing loop, then program Bramble with a sensor event, an if … else decision at the split and a loop that keeps checking a condition. They test both ways and improve it.',
    objective: 'We are learning to design and build a program that senses, decides and keeps checking, and to test every branch.',
    success: ['I can plan where the markers go and what each one does.', 'I can use a sensor event and if … else to decide at the split.', 'I can use a loop that checks a condition (forever or wait until).', 'I can test both ways at the split.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['input', 'information going in, like the sensor colour or a key'], ['selection', 'choosing what to do with if … else'], ['condition', 'a question that is true or false'], ['loop', 'blocks that run again and again'], ['evaluate', 'say what works well and what could be better']],
    need: [...DEV, 'Paper for the plan'],
    plan: [
      { min: 8, title: 'The brief', html: '<p>Mrs Achebe wants a <b>junction controller</b> for the line with the passing loop. It must use: a marker snap and a <b>“when train sees …”</b> event, an <b>if … else</b> that decides the way at the split, and a loop that keeps checking (<b>forever</b> or <b>wait until</b>). Add at least two places and a route of jobs.</p>' },
      { min: 10, title: 'Plan it', html: '<p>Pairs plan on paper: where do the markers go? What decides the way: a key, a count, a random number? What does the loop check (the speed? a colour?) and what does it do? Which jobs will the route have?</p>' },
      { min: 27, title: 'Build, test, fix', html: '<p>Pupils follow the Lesson card. Remind them: markers are lone colour snaps (no white); decide <b>before</b> the split; test <b>both</b> branches. Circulate and ask: “What is your condition? What happens when it is false?”</p>' },
      { min: 10, title: 'Swap and evaluate', html: '<p>Pairs swap and test each other’s controller both ways, then give a star and a wish.</p>' },
      { min: 5, title: 'Celebrate', html: '<p>Show two controllers on the board. Next block: running the whole railway, with variables, data and messages between two trains.</p>' }
    ],
    support: 'Start from the Which platform? program (lesson 8): add a red signal and the speed check from lesson 10.',
    stretch: 'Make the decision with a variable: count the laps and take the loop every second lap. Or add a second split.',
    assess: ['Plans the markers, the decision and the checks', 'Uses a sensor event and if … else at the split', 'Uses a loop that checks a condition', 'Tests both branches and improves the program'],
    steps: [
      { t: 'Plan it', d: 'On paper: where do your markers go? What decides the way at the split? What does your loop keep checking?' },
      { t: 'Markers', d: 'Under Snaps, put lone colour snaps (no white in front) where Bramble needs to sense something, like before the split.' },
      { t: 'Places and jobs', d: 'Put up at least 2 places with the Places list, then use the Order tool to give Bramble its jobs.' },
      { t: 'Decide', d: 'Use “when train sees …” and an “if … else” to choose “on next split go …” before the split.' },
      { t: 'Keep checking', d: 'Add a forever loop or a “wait until” that checks a condition, like the speed or a colour.' },
      { t: 'Test both ways', d: 'Press Run. Test when your condition is true AND when it is false. Then swap with a partner.' }
    ]
  },

  // ═══════════════════════ BLOCK 3 · RUNNING THE RAILWAY (Years 5–6) ═══════════════════════
  {
    adopt: 'smart-trains', unit: u(13), years: Y56, title: 'Smart trains: count the laps',
    stretch: 'Make the train stop for good at the depot with a white red blue snap on the passing loop. Make the headlights green whenever the sensor sees green. With real smart trains, the same blocks work in the trains’ own block editor.',
    summary: 'Mrs Achebe wants the evening train to do three laps of the town and then go to the depot. Pupils revisit sensing and events from Block 2, then meet variables: a laps variable goes up every time the train sees the red station snap, and if … else uses it to decide which way to go at the split — round again, or off to the depot after lap 3.',
    plan: [
      { min: 5, title: 'Be a smart train', html: '<p>Pupils walk slowly round a space as “trains”. Hold up colour cards: <b>red</b> = stop and count to 2, <b>green</b> = walk slowly, <b>white</b> = get ready. Tell them to <b>count</b> how many reds they see, and after the third red to walk to the “depot” (a corner). <b>Ask:</b> how did you know when to go to the depot? You remembered a number that changed: a <b>variable</b>.</p>' },
      { min: 10, title: 'How does the train know?', html: '<p>Open the starter on the board and press <b>Run</b>. Remind the class (Block 2): the <b>colour sensor</b> underneath is an input, and “when train sees …” starts a script. Watch it stop at the white-red snaps by the station and slow down at white-green.</p><p>Point out the split in the top straight and the <b>Depot</b> sign on the passing loop: today the train has to count its laps and then decide.</p>' },
      { min: 15, title: 'A variable that counts', html: '<p>Pupils follow the Lesson card to build <b>when train sees red → set top LED color to red</b> (quick revision), then make a <b>laps</b> variable that goes up each time the train sees red (once every lap, at the station) and watch it count on the board.</p><p>Common bug: putting “set laps to 0” under the red event, so it never gets past 1. Ask “when does each script run?”</p>' },
      { min: 20, title: 'Selection with a variable', html: '<p>Write the rule on the board: “<b>If</b> laps &lt; 3, go straight on. <b>Else</b>, go right to the depot.” Pupils add <b>if … else</b> under “change laps by 1”, with <b>laps &lt; 3</b> as the condition and <b>on next split go straight / right</b> inside.</p><p><b>Ask:</b> why do we decide at the station, not at the split? (The decision has to be made before the train gets there, and the station comes just before the split.) Fast finishers try the challenges on the card.</p>' },
      { min: 10, title: 'Plenary', html: '<p>Pupils point to the part of their program that is the <b>input</b>, the <b>event</b>, the <b>variable</b>, the <b>condition</b>, the <b>selection</b> and the <b>output</b>. <b>Ask:</b> what else could a variable count on a railway? (Passengers, tickets, minutes late.) Next lesson: timing the laps and collecting data.</p>' }
    ]
  },
  {
    id: 'rail-14-laps', unit: u(14), title: 'Lap times', ...BLOCKS, years: Y56,
    summary: 'The railway needs a timetable, so Mrs Achebe needs to know how long a lap takes at each speed. Pupils make a lap time variable that is set from the timer each time Bramble crosses the red timing line (then the timer is reset), collect lap times at three speeds in a table, spot the pattern and use it to predict.',
    objective: 'We are learning to use a variable and the timer to collect data, and to use the data to spot a pattern and make a prediction.',
    success: ['I can set a variable to the timer to measure something.', 'I can collect results in a table.', 'I can spot a pattern in my data and use it to predict.'],
    curriculum: ['data', 'design', 'reason'],
    words: [['data', 'facts and numbers we collect'], ['variable', 'a named value that can change, like lap time'], ['timer', 'counts the seconds since it was last reset'], ['pattern', 'a rule we can see in the data'], ['predict', 'use what we know to say what will happen']],
    need: [...DEV, 'A results table (speed · lap 1 · lap 2 · lap 3) for each pair'],
    plan: [
      { min: 7, title: 'Timetables', html: '<p>Show a real bus or train timetable. <b>Ask:</b> how does the railway know when the train will arrive? Someone measured how long each part takes. Today Bramble measures its own lap times. Introduce <b>data</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Point out the <b>red timing line</b> just behind Bramble, by the station. <b>Ask:</b> how long is a lap? Guess, then time one with a stopwatch: hard to be exact! Show the <b>timer</b> block (Sensing): the program can time it exactly.</p><p>The plan: when Bramble sees red, <b>set lap time to timer</b>, then <b>reset timer</b> for the next lap.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: make the variable, build the red script, add “reset timer” at the start, then run three laps at 30 cm/s and write the lap times in the table. Then 45 and 60 cm/s. The variable shows on the board (top right).</p><p>Common slips: reset timer <i>before</i> setting lap time (it always says 0); speed changed while running (press Run again).</p>' },
      { min: 10, title: 'Spot the pattern', html: '<p><b>Ask:</b> are the lap times at the same speed the same? (Nearly: the first lap includes setting off.) What happens to the time when the speed doubles? (It halves.) Predict the lap time at 90 cm/s, then test it.</p>' },
      { min: 8, title: 'Share', html: '<p>Collect the class’s results on the board. <b>Ask:</b> why is it useful for a program to collect data? Next lesson: two trains, and a message between them.</p>' }
    ],
    support: 'Give pairs the red script as a picture. Let them collect data at two speeds only.',
    stretch: 'Make a second variable, laps, that counts the laps, and a third, best, that keeps the shortest lap time (if lap time < best, set best to lap time). Draw a bar chart of your results.',
    assess: ['Sets a variable from the timer at the right moment', 'Records results accurately in a table', 'Describes the pattern and uses it to predict'],
    steps: [
      { t: 'The timing line', d: 'Press Run. Bramble crosses the red timing line by the station every lap. How long does a lap take? Guess! Press Stop.' },
      { t: 'A variable', d: 'Click Variables, press Create variable and call it lap time.' },
      { t: 'Time each lap', d: 'Click Bramble. Drag “when train sees red (1)” into the space. Under it put “set lap time to” with “timer” (Sensing) in its gap, then “reset timer”.' },
      { t: 'Start the clock', d: 'From Sensing, put “reset timer” under “when Run is clicked” too, above the drive block.' },
      { t: 'Collect data', d: 'Press Run and write lap time (top right of the board) for 3 laps. Change 30 to 45, then 60. Fill in your table.' },
      { t: 'Spot the pattern', d: 'What happens to the lap time when the speed goes up? Predict the time at 90 cm/s, then test it.' }
    ]
  },
  {
    id: 'rail-15-connect', unit: u(15), title: 'The connection', ...BLOCKS, years: Y56,
    summary: 'A second engine, Fern, runs the branch line to Brindle Farm. Fern must wait for the passengers from Bramble’s train before she leaves — but she sets off straight away. Pupils use messages: Bramble broadcasts “connection” when it reaches the station, and Fern’s script starts when she receives it.',
    objective: 'We are learning to send and receive messages (broadcast) so that one part of a program can start another.',
    success: ['I can broadcast a message when something happens.', 'I can start a script when a message is received.', 'I can explain how the two trains work together.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['broadcast', 'send a message to every script'], ['message', 'a word one script sends to start another'], ['receive', 'get a message; “when I receive” starts a script'], ['connection', 'a train that waits for passengers from another train'], ['parallel', 'two things happening at the same time']],
    need: [...DEV, 'Optional: two pupils and a whistle for the warm-up'],
    plan: [
      { min: 7, title: 'Pass it on', html: '<p>Two pupils are trains on two lines. Train A walks to the “station”; train B must wait there until A arrives. A blows a whistle (a <b>message</b>) when it arrives, and only then does B set off. <b>Ask:</b> how did B know? Introduce <b>broadcast</b> and <b>receive</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter: two lines, two trains, and two categories of blocks, <b>Bramble</b> and <b>Fern</b> (click a train’s tab to see its name and colour). Press <b>Run</b>. Fern leaves the farm at once and goes round once — before Bramble’s passengers have even arrived. <b>Ask:</b> what should start Fern? Bramble arriving at the station.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: Bramble’s “when train sees red (1)” sends <b>broadcast connection</b>; a new “when I receive connection” script gets Fern’s drive block (dragged out of “when Run is clicked”). Run it and watch Fern wait at the farm every time until Bramble reaches the station.</p><p>Common slips: the message spelt differently in the two blocks (capitals don’t matter, spaces and spelling do); Fern’s drive block left in “when Run is clicked”.</p>' },
      { min: 10, title: 'Trace it', html: '<p>Pairs write the order things happen in: Run → Bramble drives → Bramble sees red at the station → broadcast connection → Fern receives it → Fern drives → Fern sees red at the farm → Fern stops. <b>Ask:</b> which scripts run at the same time?</p>' },
      { min: 8, title: 'Share', html: '<p><b>Ask:</b> where else are messages used? (A school bell, a text message, a starting pistol.) Next lesson: the express test, where a variable sets the speed.</p>' }
    ],
    support: 'Make the two message blocks together on the board so the spelling matches, then pairs move Fern’s drive block.',
    stretch: 'Fern sends a message back: when Fern sees red (back at the farm), broadcast “ready”, and Bramble turns its top light green when it receives it. Count Fern’s trips with a variable.',
    assess: ['Broadcasts a message at the right moment', 'Starts a script with “when I receive”', 'Explains the order the two trains’ scripts run in'],
    steps: [
      { t: 'Too early!', d: 'Press Run. Fern leaves the farm straight away, before Bramble’s passengers arrive. Press Stop.' },
      { t: 'Send a message', d: 'Click Bramble. Drag “when train sees red (1)” into the space. From Events, put “broadcast message1” under it and change message1 to connection.' },
      { t: 'Receive it', d: 'From Events, drag “when I receive message1” into the space and change message1 to connection.' },
      { t: 'Move Fern', d: 'Drag the “drive forward at 45 cm/s” block with Fern’s orange engine on it out of “when Run is clicked” and join it under “when I receive connection”.' },
      { t: 'Test it', d: 'Press Run. Does Fern wait at the farm until Bramble reaches the station, every time round?' },
      { t: 'Trace it', d: 'Write the order things happen in, from Run to Fern stopping at the farm.' }
    ]
  },
  {
    id: 'rail-16-express', unit: u(16), title: 'The express test', ...BLOCKS, years: Y56,
    summary: 'Brindlewick is testing a new express service. The engineers want Bramble to do its first lap at 20 cm/s and go 10 cm/s faster every lap, then stop at the station after the 60 cm/s lap. Pupils use a variable as the input to a block (the drive speed), change it with each lap and use an operator to decide when to stop.',
    objective: 'We are learning to use a variable as an input to a command, change it as the program runs, and use it in a condition.',
    success: ['I can put a variable into a block instead of a number.', 'I can change a variable each time something happens.', 'I can use the variable in a condition to decide when to stop.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['variable', 'a named value that can change'], ['input', 'a value a block uses, like the speed in a drive block'], ['increase', 'make bigger'], ['operator', 'a block that compares or works things out, like >'], ['trace', 'follow a program step by step, writing down the values']],
    need: [...DEV, 'A trace table (lap · test speed) for each pair'],
    plan: [
      { min: 7, title: 'Faster each time', html: '<p>Clap a beat, then a bit faster each time, and stop after the fifth. <b>Ask:</b> what did I have to remember? The speed now, so I could make it a bit faster. That is a <b>variable</b>, used as the speed.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>: Bramble always goes at 20 cm/s, because the drive block has a fixed number. Show that a <b>variable</b> can go in that gap instead. Write the plan: at the start, test speed = 20; every time Bramble sees red (each lap), add 10; if test speed &gt; 60, stop, else drive at test speed.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: create the variable, set it to 20, drag “test speed” into the drive block, add “change test speed by 10” and the if … else in the red script. Run it and watch test speed on the board.</p><p>Common slips: forgetting to put the variable into the drive block inside the else part (Bramble keeps going at 20); setting the variable to 20 inside the red script.</p>' },
      { min: 10, title: 'Trace it', html: '<p>Pairs fill in a trace table: lap 1: 20, lap 2: 30, … <b>Ask:</b> on which lap does test speed become 70? What happens then? How many laps does Bramble do? (5.)</p>' },
      { min: 8, title: 'Share', html: '<p><b>Ask:</b> what would you change for steps of 5 cm/s? A top speed of 100? Next lesson: the evening timetable has bugs.</p>' }
    ],
    support: 'Give pairs the red script as a picture to build. Focus on dragging the variable into the drive blocks.',
    stretch: 'Add lap times from lesson 14 to collect data for each speed. Or make Bramble slow down again after 60 instead of stopping (change test speed by -10).',
    assess: ['Uses a variable as the drive speed', 'Changes the variable once every lap', 'Uses the variable in a condition to stop at the right time', 'Traces the values lap by lap'],
    steps: [
      { t: 'Always 20', d: 'Press Run. Bramble always goes at 20 cm/s: the drive block has a fixed number. Press Stop.' },
      { t: 'A variable', d: 'Click Variables, press Create variable and call it test speed.' },
      { t: 'Start at 20', d: 'Put “set test speed to” above the drive block in “when Run is clicked”. From Operators, drag the number block (0) into its gap and make it 20. Then drag “test speed” into the drive block’s 20 gap.' },
      { t: 'Faster each lap', d: 'Click Bramble. Drag “when train sees red (1)” into the space and put “change test speed by 10” under it (change 1 to 10).' },
      { t: 'Stop or go faster?', d: 'Add an “if … else” under it: if test speed > 60, “stop driving”; else “drive forward at” with test speed in its gap.' },
      { t: 'Trace it', d: 'Press Run. Write test speed for each lap. Does Bramble stop at the station after the 60 cm/s lap?' }
    ]
  },
  {
    id: 'rail-17-debug', unit: u(17), title: 'The evening timetable', ...BLOCKS, years: Y56,
    summary: 'The evening timetable program has three bugs. Bramble should make three trips to the station and then stay there for the night; Fern should leave the farm every time Bramble arrives. Instead Bramble never stops and Fern never leaves. Pupils trace the variable, compare the messages and check the condition to find and fix each bug.',
    objective: 'We are learning to debug programs with variables, messages and conditions by tracing values and testing one fix at a time.',
    success: ['I can trace a variable to find where it goes wrong.', 'I can spot a message that doesn’t match.', 'I can fix an off-by-one bug in a condition.'],
    curriculum: ['reason', 'design'],
    words: [['trace', 'follow a program step by step, watching the values'], ['off by one', 'a bug where something happens one time too many or too few'], ['message', 'a word one script sends to start another'], ['≥ (greater than or equal to)', 'bigger than or the same as'], ['debug', 'find and fix the mistakes']],
    need: [...DEV, 'A trace table (trip · trips) for each pair'],
    plan: [
      { min: 7, title: 'The timetable', html: '<p>Read Mrs Achebe’s evening timetable: Bramble makes <b>three</b> trips to the station, then stays there for the night. Fern leaves the farm <b>every time</b> Bramble arrives. Open the starter and press <b>Run</b>. <b>Ask:</b> what goes wrong? (Bramble never stops; Fern never moves.)</p>' },
      { min: 8, title: 'How to trace', html: '<p>Model tracing: watch <b>trips</b> on the board as Bramble passes the station. It stays at 1! <b>Ask:</b> which block changes trips? Which other block sets it? Read the red script line by line, writing the value after each block.</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card, fixing and testing one bug at a time. The bugs: an extra <b>set trips to 0</b> inside the red script (it resets the count every lap); the message is broadcast as <b>conection</b> but Fern waits for <b>connection</b>; the condition is <b>trips &gt; 3</b>, so Bramble makes four trips, not three (off by one: it should be ≥).</p><p>Ask pairs to write each bug and its fix in one sentence, using the words variable, message and condition.</p>' },
      { min: 10, title: 'Bug swap', html: '<p>Pairs add one new bug to their working program and swap. Can their partner trace it and fix it?</p>' },
      { min: 8, title: 'Share', html: '<p><b>Ask:</b> which bug did tracing help you find? Why is an off-by-one bug easy to miss? Next lesson: the final project, Brindlewick’s open day.</p>' }
    ],
    support: 'Tell pairs which script each bug is in. Fix the trips bug together first.',
    stretch: 'Add a fourth rule to the timetable and program it: Fern’s top light turns red when Bramble’s last trip is done (broadcast “home” and receive it).',
    assess: ['Traces trips to find the reset bug', 'Spots the message that doesn’t match', 'Fixes the off-by-one condition and explains it'],
    steps: [
      { t: 'Test it', d: 'Press Run. Bramble should make 3 trips and stay at the station; Fern should leave the farm each time. What goes wrong?' },
      { t: 'Trace trips', d: 'Watch trips on the board (top right). It never gets past 1! Read the “when train sees red (1)” script: which block sets trips back to 0?' },
      { t: 'Fern waits', d: 'Fern never leaves. Compare the broadcast block with “when I receive”. Are the messages spelt the same?' },
      { t: 'One too many?', d: 'Count Bramble’s trips. Does it stop after 3 or 4? Read the if: should it be > or ≥?' },
      { t: 'Test again', d: 'Fix one bug at a time and press Run after each. Do all six jobs tick? Does Fern go every time?' },
      { t: 'Explain', d: 'Write each bug and how you fixed it in one sentence, using variable, message and condition.' }
    ]
  },
  {
    id: 'rail-18-project', unit: u(18), title: 'Project: Brindlewick open day', ...BLOCKS, years: Y56,
    summary: 'The final project. It is the railway’s open day and the class runs the whole railway: both lines, both engines. Pupils design a route of jobs and program Bramble and Fern together using a variable, a message, if … else and sensor events, test it against their plan, improve it and present it.',
    objective: 'We are learning to design, build, test and improve a program that combines variables, messages, selection and events to control two trains.',
    success: ['I can plan a program for two trains, with a table of my variables and messages.', 'I can use a variable, a message and if … else in my program.', 'I can test my program against my plan and improve it.', 'I can explain how my program works.'],
    curriculum: ['design', 'ssr', 'reason', 'data'],
    words: [['design', 'plan what you will make before you make it'], ['variable', 'a named value that can change'], ['message', 'a word one script sends to start another'], ['selection', 'choosing what to do with if … else'], ['evaluate', 'say what works well and what could be better']],
    need: [...DEV, 'A planning sheet: places and jobs · variables (name, start value, what changes it) · messages (who sends, who receives)'],
    plan: [
      { min: 8, title: 'The brief', html: '<p>It is Brindlewick’s open day! The class runs the whole railway. The program must: use a <b>variable</b> (visitors, trips, laps or time), a <b>message</b> between the two trains, an <b>if … else</b> and a <b>sensor event</b>; and Bramble must complete a route of at least four jobs. Show the success criteria on the board.</p>' },
      { min: 10, title: 'Plan it', html: '<p>Pairs fill in the planning sheet: places and jobs in order, a table of variables (name, starting value, what changes it) and messages (who sends, who receives, when). Check a few plans before anyone builds.</p>' },
      { min: 27, title: 'Build, test, improve', html: '<p>Pupils follow the Lesson card: places and jobs first, then markers or snaps, then the scripts for each train, testing each part as they add it. Remind them of the debugging skills from lessons 11 and 17: trace the variables on the board, check the message names match, test both branches.</p>' },
      { min: 10, title: 'Open day', html: '<p>Pairs present their railway to another pair: run it, explain one variable, one message and one decision, and get a star and a wish.</p>' },
      { min: 5, title: 'Celebrate the unit', html: '<p>Look back over Brindlewick Railway: algorithms and sequence, decomposition, repeat, events, sensors, selection, loops that check, debugging, variables, data and messages. <b>Ask:</b> which was the most useful? What would you build next?</p>' }
    ],
    support: 'Start from the connection (lesson 15) and add a variable that counts Bramble’s trips, and an if … else that stops it after three.',
    stretch: 'Use a wagon (the Pulls a wagon box): drop it off at the farm with white yellow snaps. Or collect data: time Fern’s laps and show the fastest.',
    assess: ['Plans the program with tables of variables and messages', 'Uses a variable, a message, if … else and a sensor event', 'Tests against the plan and makes improvements', 'Explains how the program works'],
    steps: [
      { t: 'Plan it', d: 'Fill in your planning sheet: places and jobs, a table of variables, and the messages between Bramble and Fern.' },
      { t: 'Places and jobs', d: 'Put up places with the Places list. Use the Order tool to give Bramble at least 4 jobs.' },
      { t: 'Bramble', d: 'Program Bramble: “when Run is clicked”, a sensor event (“when train sees …”), a variable and an if … else.' },
      { t: 'Fern', d: 'Program Fern with “when I receive” so she runs when Bramble sends a message.' },
      { t: 'Test and improve', d: 'Press Run. Watch your variables on the board. Fix one thing at a time until every job ticks.' },
      { t: 'Open day', d: 'Show your railway to another pair. Explain one variable, one message and one decision.' }
    ]
  }
];

export const SLIDES = {
  'rail-1-track': [
    { t: 'Brindlewick Railway', lead: 'Brindlewick is getting its railway back — and we are the engineers!', b: ['Mrs Achebe the station master gives us a job every lesson', 'Our first engine is called Bramble'], notes: 'Introduce the unit, the town and Mrs Achebe. Every lesson the class programs part of the railway.' },
    { t: 'Exact instructions', q: '“Put some track there.” Could you follow that?', b: ['Which piece?', 'Where?', 'Which way?'], notes: 'Card track warm-up: vague instructions, then exact ones. An algorithm is exact instructions in the right order.' },
    { t: 'The unfinished line', pic: true, q: 'What will Bramble do when we press Run?', b: ['Stop at the station', 'Go past the farm', 'Then…?'], notes: 'Take predictions, then press Run. Bramble stops dead at the end of the line and job 3 never ticks. Show the blue + marks.' },
    { t: 'Write the build plan', code: '1  Straight\n2  Curve right\n3  Curve right\n4  Curve right\n5  Curve right', q: 'Would a different order work?', notes: 'Pairs write their own plan first; reveal this one after. Curves first does not join up — let them find out.' },
    { use: 'steps' },
    { t: 'Plan swap', q: 'Was your plan exact enough for someone else to follow?', b: ['What made a plan easy to follow?', 'Why does the order matter?'], notes: 'Build two plans on the board exactly as read. Next lesson: snap code.' }
  ],
  'rail-3-market': [
    { t: 'Big jobs, small parts', q: 'How would you plan a trip to the seaside?', b: ['Walk to the bus stop', 'Bus to the station', 'Train to the sea'], notes: 'Each part is a leg. Breaking a big job into parts = decompose.' },
    { t: 'Market day', pic: true, b: ['Stop at the school', 'Stop at the shops', 'End at the harbour'], notes: 'Open the starter, show the blocks, press Run: Bramble does leg 1 only.' },
    { t: 'Measure the legs', table: [['Leg', 'Pieces', 'cm'], ['start → school', '3', '75'], ['school → shops', '?', '?'], ['shops → harbour', '?', '?']], lead: 'One piece of track = 25 cm', notes: 'Pairs count and multiply. Answers: 2 pieces = 50 cm, 3 pieces = 75 cm.' },
    { t: 'One leg = two blocks', code: 'drive forward … cm at 30 cm/s\nwait 2 seconds', notes: 'The same pattern for every leg. Test after each leg.' },
    { use: 'steps' },
    { t: 'Think', q: 'If Bramble stopped in the wrong place at the shops, which leg would you check?', notes: 'Leg 2. Decomposing makes bugs easier to find. Next lesson: the school shuttle and repeat.' }
  ],
  'rail-4-shuttle': [
    { t: 'Again and again', q: 'Clap, clap, stamp — three times. How many instructions?', b: ['Nine… or one: repeat 3 times'], notes: 'Introduce loop and repeat.' },
    { t: 'The school shuttle', pic: true, b: ['Station → school → station = one trip', 'Mrs Achebe needs three trips'], notes: 'Run the starter: one trip, three of seven jobs tick.' },
    { t: 'Copy, or loop?', table: [['Way', 'Blocks'], ['Copy the trip 3 times', '13'], ['repeat 3 times', '6']], notes: 'The loop is shorter and only one number changes for more trips.' },
    { t: 'The loop', code: 'when Run is clicked\nrepeat 3 times:\n    drive forward 100 cm at 30 cm/s\n    wait 2 seconds\n    drive backward 100 cm at 30 cm/s\n    wait 2 seconds', notes: 'Dragging the first block brings the ones under it.' },
    { use: 'steps' },
    { t: 'Think', q: 'What would you change for 20 trips? Where else do we repeat things?', notes: 'One number. Next lesson: the driver’s cab and events.' }
  ],
  'rail-5-driver': [
    { t: 'When … then', q: 'When I clap, stand up. How did you know when to move?', notes: 'Something happened first: an event.' },
    { t: 'The driver’s cab', pic: true, q: 'We press Run. Why doesn’t Bramble move?', b: ['when g key pressed → drive forward'], notes: 'The script waits for its event. Press g: it goes, but there is no way to stop it.' },
    { t: 'Two events', code: 'when g key pressed\n    drive forward at 45 cm/s\n\nwhen s key pressed\n    stop driving', notes: 'Each script waits for its own key.' },
    { use: 'steps' },
    { t: 'Events everywhere', b: ['A doorbell button', 'A lift button', 'A crossing button', 'A tap on a tablet'], q: 'What event starts each one?', notes: 'Next lesson: the Block 1 project.' }
  ],
  'rail-6-project': [
    { t: 'A new line', lead: 'Mrs Achebe wants a new line for Brindlewick.', b: ['A loop of track', 'At least 3 places', 'A route of at least 4 jobs'], notes: 'Share the brief and the success criteria.' },
    { t: 'Must use', b: ['Snaps: white first, no gaps, one piece', 'A repeat loop or a key event', 'Test and fix until every job ticks'], notes: 'Leave this up while pupils work.' },
    { t: 'Plan first', b: ['Draw the track', 'Mark the places', 'Number the jobs', 'Snaps or blocks for each job?'], notes: 'Plans on squared paper before building.' },
    { use: 'steps' },
    { t: 'Star and wish', lead: '“A star: … works really well. A wish: …”', notes: 'Pairs swap and evaluate. Next block: signals and switches.' }
  ],
  'rail-7-signal': [
    { t: 'Red means stop', q: 'How did you know when to stop?', b: ['Your eyes sensed the colour: input', 'You stopped and pointed: output'], notes: 'Warm-up with red and green card.' },
    { t: 'The red signal', pic: true, q: 'Why doesn’t the red snap stop Bramble?', notes: 'A lone colour snap is a marker, not a command (no white). But the sensor still sees it.' },
    { t: 'Input → event → output', code: 'when train sees red (1)\n    pause driving for 3 seconds\n    set top LED color to red', b: ['Input: the colour sensor', 'Event: when train sees red', 'Outputs: pausing, the light'], notes: 'Build it together.' },
    { use: 'steps' },
    { t: 'Sensors everywhere', b: ['Automatic doors', 'Hand dryers', 'Street lights at night'], q: 'What does each one sense? What does it do?', notes: 'Next lesson: deciding at a split.' }
  ],
  'rail-8-platform': [
    { t: 'If … else', q: 'If you are wearing a jumper, stand up, else sit down. What was the question?', notes: 'A condition: a question with a true or false answer.' },
    { t: 'Which platform?', pic: true, b: ['The station is on the loop', 'Passengers waiting? The signal box holds space'], notes: 'Run the starter: Bramble always goes straight.' },
    { t: 'The rule', code: 'when train sees yellow (3)\n    if key space pressed?\n        on next split go right\n    else\n        on next split go straight', notes: 'Decide at the yellow marker, before the split.' },
    { use: 'steps' },
    { t: 'Test both branches', table: [['Space held?', 'Which way?'], ['yes', '?'], ['no', '?']], q: 'Why test both ways?', notes: 'A bug can hide in the branch you didn’t try. Next lesson: into the shed.' }
  ],
  'rail-9-shed': [
    { t: 'Wait until…', q: 'Walk backwards and stop exactly on the red card. What were you doing all the time?', notes: 'Checking again and again: wait until.' },
    { t: 'Crash!', pic: true, q: 'What does Bramble need to know?', notes: 'Run the starter: it backs into the buffers. It needs to know when it is over the red marker.' },
    { t: 'Compare the sensor', code: 'drive backward at 20 cm/s\nwait until sensor color = red (1)\nstop driving', b: ['sensor color: the colour under the train, as a number', 'red (1): the number for red'], notes: 'The = block is from Operators.' },
    { use: 'steps' },
    { t: 'Event or wait?', q: 'How is “when train sees red” different from “wait until sensor color = red”?', notes: 'One starts a script; one waits in the middle of one. Next lesson: a check that never stops.' }
  ],
  'rail-10-speed': [
    { t: 'Speed cameras', q: 'When did you check my speed?', b: ['Not just once — all the time!'], notes: 'Warm-up: walk past fast and slow.' },
    { t: 'The speed check', pic: true, b: ['Fast on the top: 60 cm/s', 'Slow on the bottom: 30 cm/s', 'The light is always green'], notes: 'Run the starter. The light is set once.' },
    { t: 'Keep checking', code: 'forever\n    if speed (cm/s) > 50\n        set top LED color to red\n    else\n        set top LED color to green', notes: 'The if … else must be INSIDE forever.' },
    { use: 'steps' },
    { t: 'Why forever?', q: 'What happens if the if … else is under forever, not inside it?', notes: 'It checks once and never again. Next lesson: the faulty signal box.' }
  ],
  'rail-11-debug': [
    { t: 'The bug report', b: ['1 Stop at the red signal', '2 Space at the yellow marker = the loop; no space = straight', '3 Red light when faster than 50 cm/s'], notes: 'Pupils keep this up while they work.' },
    { t: 'Test first', pic: true, q: 'Which lines of the report work?', notes: 'Run the starter: none of them!' },
    { t: 'Debugging questions', b: ['What should happen?', 'What actually happens?', 'Which script does that?', 'Change one thing, then test'], notes: 'Model these with bug 1.' },
    { use: 'steps' },
    { t: 'Bug swap', lead: 'Plant one bug. Can your partner find it with the bug report?', notes: 'Next lesson: the Block 2 project.' }
  ],
  'rail-12-project': [
    { t: 'The junction controller', lead: 'Sense, decide, keep checking.', b: ['A marker and “when train sees …”', 'An if … else at the split', 'A loop that keeps checking'], notes: 'Share the brief and success criteria.' },
    { t: 'Plan it', b: ['Where do the markers go?', 'What decides the way?', 'What does the loop check?', 'Which jobs?'], notes: 'Plans before building.' },
    { t: 'Remember', b: ['Markers: lone colour snaps, no white', 'Decide BEFORE the split', 'Test true AND false'], notes: 'Leave this up while pupils work.' },
    { use: 'steps' },
    { t: 'Star and wish', q: 'Did your partner’s controller work both ways?', notes: 'Next block: running the railway with two trains.' }
  ],
  'rail-14-laps': [
    { t: 'Timetables', q: 'How does the railway know when the train will arrive?', notes: 'Show a real timetable. Someone measured it: data.' },
    { t: 'The timing line', pic: true, q: 'How long does a lap take? Guess!', notes: 'Time one lap with a stopwatch: hard to be exact.' },
    { t: 'Time each lap', code: 'when Run is clicked\n    reset timer\n    drive forward at 30 cm/s\n\nwhen train sees red (1)\n    set lap time to timer\n    reset timer', notes: 'Set lap time BEFORE resetting the timer.' },
    { use: 'steps' },
    { t: 'Our data', table: [['Speed (cm/s)', 'Lap 1', 'Lap 2', 'Lap 3'], ['30', '', '', ''], ['45', '', '', ''], ['60', '', '', ''], ['90', 'predict:', '', '']], q: 'What happens when the speed doubles?', notes: 'The time halves (about 8 s at 30, 4 s at 60). Next lesson: two trains and a message.' }
  ],
  'rail-15-connect': [
    { t: 'Pass it on', q: 'How did train B know when to go?', notes: 'Warm-up with two pupils and a whistle: a message.' },
    { t: 'Two lines, two trains', pic: true, b: ['Bramble on the main line', 'Fern on the branch line to Brindle Farm'], notes: 'Run the starter: Fern leaves too early.' },
    { t: 'Send and receive', code: 'when Bramble sees red (1)\n    broadcast connection\n\nwhen I receive connection\n    Fern: drive forward at 45 cm/s', notes: 'The message names must match.' },
    { use: 'steps' },
    { t: 'Trace it', b: ['Run', 'Bramble sees red at the station', 'broadcast connection', 'Fern receives it and drives', 'Fern sees red at the farm and stops'], q: 'Which scripts run at the same time?', notes: 'Next lesson: the express test.' }
  ],
  'rail-16-express': [
    { t: 'Faster each time', q: 'What did I have to remember to clap faster each time?', notes: 'The speed now: a variable.' },
    { t: 'The express test', pic: true, b: ['First lap: 20 cm/s', '10 cm/s faster every lap', 'Stop after the 60 cm/s lap'], notes: 'Run the starter: always 20.' },
    { t: 'A variable as the speed', code: 'set test speed to 20\ndrive forward at (test speed) cm/s\n\nwhen train sees red (1)\n    change test speed by 10\n    if test speed > 60\n        stop driving\n    else\n        drive forward at (test speed) cm/s', notes: 'The variable goes into the drive block’s gap.' },
    { use: 'steps' },
    { t: 'Trace it', table: [['Lap', 'test speed'], ['1', '20'], ['2', '30'], ['3', '?'], ['4', '?'], ['5', '?'], ['after 5', '?']], notes: '40, 50, 60, then 70 > 60 so it stops. Next lesson: the evening timetable.' }
  ],
  'rail-17-debug': [
    { t: 'The evening timetable', b: ['Bramble: 3 trips to the station, then stay there', 'Fern: leave the farm every time Bramble arrives'], notes: 'Run the starter: Bramble never stops, Fern never leaves.' },
    { t: 'Trace the variable', pic: true, table: [['Trip', 'trips should be', 'trips is'], ['1', '1', '1'], ['2', '2', '?'], ['3', '3', '?']], notes: 'Watch trips on the board: it stays at 1.' },
    { t: 'Look for…', b: ['A variable that is set back by mistake', 'Messages that don’t match', 'One time too many: > or ≥?'], notes: 'Three bugs, three kinds.' },
    { use: 'steps' },
    { t: 'Off by one', q: 'Why is “one time too many” such an easy bug to miss?', notes: 'It nearly works. Next lesson: the final project.' }
  ],
  'rail-18-project': [
    { t: 'Open day!', lead: 'Run the whole railway: two lines, two trains.', b: ['A variable', 'A message between the trains', 'An if … else', 'A sensor event', 'A route of at least 4 jobs'], notes: 'Share the brief and success criteria.' },
    { t: 'Plan it', table: [['Variable', 'Starts at', 'What changes it?'], ['', '', ''], ['', '', '']], b: ['Messages: who sends? who receives?'], notes: 'Planning sheets before building.' },
    { t: 'Debugging tips', b: ['Trace your variables on the board', 'Check message names match', 'Test both branches of every if'], notes: 'From lessons 11 and 17.' },
    { use: 'steps' },
    { t: 'Brindlewick Railway', b: ['Algorithms and decomposition', 'Repeat and events', 'Sensors, selection and loops that check', 'Variables, data and messages'], q: 'Which skill was the most useful?', notes: 'Celebrate the unit.' }
  ]
};
