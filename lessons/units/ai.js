// The AI Lab's lesson unit — see lessons/units/README.md. lessons.js merges it in.
// WILDWOOD SPOTTERS: the class are the new Spotters at Wildwood Nature Reserve. Ranger Rosa looks after the reserve, and
// Hoot is the reserve's computer, an owl-shaped screen in the Spotters' Hut. Hoot can learn, but only from the examples the
// Spotters give it: animal tracks, trail signs and messages in the visitor book. Pupils teach it, test it, and code with it.
// Block 1 Hoot's first lessons (Years 3–4) · Block 2 Hoot on patrol (Years 4–5) · Block 3 Hoot runs the visitor centre
// (Years 5–6). Lesson 6 of each block is a design-and-make project. The AI Lab's two earlier lessons (ai-happy-sad,
// teach-the-computer) are folded in with { adopt }. Starters, answers and goals: lessons/builds/ai/wildwood.mjs (the goals
// checklist is ai/ai-goals.js); test: tests/unit-ai.test.mjs.
// Skill order (one new skill a lesson): learning from labelled examples → the algorithm for making an AI → events →
// count-controlled loops → debugging → project · selection on confidence → selection on the guess → and / or → loops that
// check a condition → debugging loops and conditions → project · unknowns and fair testing → variables → messages → words as
// data → bias and fairness → project.
const N = 'Wildwood Spotters';
const u = (b, n) => `${N} · Block ${b} · Lesson ${n}`; // n counts on through the whole unit (1–18)
const T = { ks: 'ks2', minutes: 60, type: 'ai' };
const DRAW = { ...T, tool: 'AI Lab (drawings)' }, WORDS = { ...T, tool: 'AI Lab (words)' }, CODE = { ...T, tool: 'AI Lab (drawings and blocks)' };
const Y34 = { years: 'Years 3–4' }, Y45 = { years: 'Years 4–5' }, Y56 = { years: 'Years 5–6' };
const DEV = ['A device per pupil or pair, with CodeJump open (a touch screen or mouse to draw with)', 'The board, to show the class'];
const TRACKS = 'The track guide on the board: a <b>deer</b> track is two pointed halves side by side; a <b>fox</b> track is a big pad with four toes above it; a <b>duck</b> track is three long toes with webbing between them.';

export const LESSONS = [
  // ═══════════════════════ BLOCK 1 · HOOT'S FIRST LESSONS (Years 3–4) ═══════════════════════
  {
    adopt: 'ai-happy-sad', unit: u(1, 1), ...Y34,
    summary: 'The first Wildwood Spotters lesson. Visitors to Wildwood Nature Reserve leave a happy or a sad face on a card, and Ranger Rosa wants Hoot, the reserve’s computer, to sort them. Pupils meet machine learning: they train an AI to sort happy and sad faces, find out it only knows the examples it was given (even a wrong one), then make it better with more, and more varied, examples.',
    plan: [
      { min: 10, title: 'Warm up: sort the faces', html: '<p>Introduce the unit: this term the class are the new <b>Spotters</b> at <b>Wildwood Nature Reserve</b>. Ranger Rosa looks after the reserve, and <b>Hoot</b>, an owl-shaped computer in the Spotters’ Hut, can learn, but only from the examples the Spotters give it. Its first job: sorting the faces visitors draw on the feedback cards.</p><p>Hold up face cards one at a time. The class says “happy” or “sad” and you put each card in a pile. The name of each pile is its <b>label</b>; each card is an <b>example</b>. <b>Ask:</b> how did you know? (We looked at the mouth.)</p><p>Now choose a pupil to be “the computer”. They have never seen a face before and may only learn by looking at your two piles. Hand them the sad pile, with one smiley face hidden in it, then show them a new happy face. <b>Ask:</b> could they get it wrong? Why? Introduce <b>machine learning</b>: some computers learn from examples like this, instead of being given rules.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter on the board. Step <b>1 Teach</b> shows two labels, <i>happy</i> and <i>sad</i>, with only a few drawings each. Tap <b>2 Train &amp; test</b> and press <b>Train</b>: the green line shows how often it was right while it practised.</p><p>Draw a happy face on the test pad. It usually says <b>sad</b>! The bars show how sure it is. <b>Ask:</b> why do you think it got it wrong? Don’t give the answer yet: that is the pupils’ first job.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the <b>Lesson</b> card. First they test, then hunt through the examples in <b>1 Teach</b>: one of the “sad” drawings is really a smiley face. Tapping a drawing removes it. After training again it is a little better, but still makes mistakes, because three drawings of each is not much to learn from.</p><p>Next they draw at least 5 more of each, all a bit different (big, small, round, wonky), train again and test. Most AIs now get nearly every face right. Circulate and ask: “What will it say if you draw this?” <b>before</b> they draw it.</p>' },
      { min: 5, title: 'Swap and test', html: '<p>Pairs swap devices and draw five faces each on the other’s test pad. They count how many their partner’s AI got right. Collect a few scores on the board.</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> how did our AI learn? (From labelled examples, by practising.) Why did it get happy faces wrong at the start? (A smiley face was in the sad pile, and there were only a few examples.) What made it better? (Taking out the wrong one; more examples; more different examples.)</p><p>Sum up: <b>a computer only learns from the examples it is given</b>, so people have to choose them carefully. Next lesson Hoot has a bigger job: telling the animal tracks in the reserve apart, and the Spotters build that AI themselves, from nothing.</p>' }
    ]
  },
  {
    id: 'ai-2-tracks', unit: u(1, 2), title: 'Whose footprints?', ...DRAW, ...Y34,
    summary: 'Ranger Rosa has found footprints in the mud by the pond. Pupils put the steps for making an AI in order (choose labels, collect examples, train, test, improve), then follow their algorithm to build a new AI from nothing that tells deer, fox and duck tracks apart. The checklist at the top ticks as each step is done.',
    objective: 'We are learning to break making an AI into steps and follow them in the right order.',
    success: ['I can put the steps for making an AI in the right order.', 'I can make labels and collect examples for each one.', 'I can train my AI and test it with new drawings.'],
    curriculum: ['design', 'data'],
    words: [['algorithm', 'a set of steps in the right order to do a job'], ['decompose', 'break a big job into smaller steps'], ['label', 'the name of a group of examples, like “fox”'], ['data', 'the examples a computer learns from'], ['test', 'try it with something new to check it works']],
    need: [...DEV, 'Five step cards per pair, cut up and jumbled: Choose the labels · Collect examples for each label · Train · Test with new examples · Make it better', 'The track guide drawn on the board (deer, fox, duck)'],
    plan: [
      { min: 8, title: 'Tracks in the mud', html: '<p>Recap Happy or sad?: Hoot learned from labelled examples. Today Ranger Rosa has a new job: she found footprints in the mud by the pond and wants Hoot to say <b>whose</b> they are. Draw the track guide on the board. ' + TRACKS + '</p><p><b>Ask:</b> last time the labels and examples were ready for us. What will we have to do ourselves this time?</p>' },
      { min: 10, title: 'Order the steps', html: '<p>Pairs put the jumbled step cards in order: <b>1</b> Choose the labels · <b>2</b> Collect examples for each label · <b>3</b> Train · <b>4</b> Test with new examples · <b>5</b> Make it better. <b>Ask:</b> can we train before we have examples? Can we test before we train? Introduce <b>algorithm</b> (steps in the right order) and <b>decompose</b> (breaking a big job, “make an AI”, into smaller ones).</p><p>Open the starter on the board. It is an empty AI with two labels called <i>thing 1</i> and <i>thing 2</i>. Point out the checklist at the top: it is our algorithm, and it ticks itself.</p>' },
      { min: 27, title: 'Follow the algorithm', html: '<p>Pupils follow the Lesson card with their step cards beside them, turning each card over when it is done. Step 1: rename the labels <i>deer</i> and <i>fox</i> and press <b>New label</b> for <i>duck</i>. Step 2: draw at least 5 of each, pressing <b>Add</b> after each. Step 3: <b>2 Train &amp; test</b>, <b>Train</b>. Step 4: test with 3 new drawings (press <b>Clear</b> between them).</p><p>Circulate and ask “Which step are you on? What comes next?”. If a test goes wrong, that is step 5: add more examples like the one it got wrong and train again.</p>' },
      { min: 10, title: 'Swap and test', html: '<p>Pairs draw three tracks on a partner’s test pad without saying which is which. Did the partner’s AI get them right? Which track gets mixed up most?</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> what would happen if we did the steps in a different order? (You can’t train with no examples; testing before training tells you nothing.) Next lesson Hoot starts to <i>talk</i>: we give it a script to run for each track.</p>' }
    ],
    support: 'Give the step cards already in order, with pictures. Pairs share the drawing: one draws, one checks the right label is chosen before pressing Add.',
    stretch: 'Add a fourth label (a rabbit: two long ovals and two small ones). Which step of the algorithm do you have to go back to?',
    assess: ['Orders the five steps and explains why the order matters', 'Makes three labels and adds varied examples to each', 'Trains and tests the AI with new drawings'],
    steps: [
      { t: 'Step 1: labels', d: 'Tap 1 Teach. Click in the box that says thing 1 and type deer. Change thing 2 to fox. Then press New label and call it duck.' },
      { t: 'Step 2: examples', d: 'Click the deer label. Draw a deer track (two pointed halves) and press Add. Draw 5 deer tracks, all a bit different.' },
      { t: 'More examples', d: 'Click the fox label and draw 5 fox tracks (a pad and four toes). Then 5 duck tracks (three long toes with webbing).' },
      { t: 'Step 3: train', d: 'Tap 2 Train & test and press Train. Watch the green line climb.' },
      { t: 'Step 4: test', d: 'Draw a new track on the test pad. Was Hoot right? Press Clear and test 3 tracks. Look at the checklist at the top.' },
      { t: 'Step 5: make it better', d: 'Did it get one wrong? Go back to 1 Teach, add a few more like that one, and train again.' }
    ]
  },
  {
    id: 'ai-3-events', unit: u(1, 3), title: 'Hoot says what it sees', ...CODE, ...Y34,
    summary: 'Hoot can recognise the tracks; now it should say something about each one. Pupils use events: a “when the AI thinks it’s …” script runs whenever the AI sees that track. The starter only has a script for the deer, so pupils add one for the fox and one for the duck, each with its own message and sound.',
    objective: 'We are learning to use events to start a script when something happens.',
    success: ['I can explain what an event is.', 'I can make a script that starts when the AI thinks it sees a fox.', 'I can test that every script works.'],
    curriculum: ['design', 'ssr'],
    words: [['event', 'something that happens, like the AI making a guess, that starts a script'], ['script', 'a stack of blocks that runs together'], ['output', 'what the computer shows or plays, like a message or a sound'], ['run', 'start the program']],
    need: DEV,
    plan: [
      { min: 8, title: 'When … then', html: '<p>Play a quick game: “When I clap, stand up. When I click my fingers, sit down. When I say <i>owl</i>, flap your arms.” <b>Ask:</b> what started each action? Introduce <b>event</b>: something that happens and starts a set of instructions.</p><p>Hoot can now tell deer, fox and duck tracks apart (the class did that last lesson). Ranger Rosa wants it to say something to visitors when it sees each one.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter on the board: it opens on <b>3 Code it</b> with a trained AI. Read the two scripts together: <b>when Run is clicked</b> → <b>show</b> a welcome; <b>when the AI thinks it’s deer</b> → show “A deer walked here!” and play a sound.</p><p>Press <b>Run</b>, draw a deer track and press <b>Done</b>. Then draw a fox track. <b>Ask:</b> why did nothing happen for the fox? (There is no script for the fox event.)</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card: drag another <b>when the AI thinks it’s</b> block from <b>Events</b>, choose <i>fox</i> in its box, and add a <b>show</b> block (Screen) and a <b>play sound</b> block (Sound). Then the same for the duck. They test all three tracks in one run.</p><p>Common bugs: a <b>show</b> block left loose (not joined under the event, so it never runs); two scripts for the same label. The checklist at the top ticks when every track has a script and each one has been tested.</p>' },
      { min: 10, title: 'Show and tell', html: '<p>Two or three pairs run their program on the board while the class draws the tracks. <b>Ask:</b> which event started which script? What are the outputs?</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> what is an event? Where else do events start things? (A doorbell, a phone ringing, a goal in a football game.) Next lesson Hoot does a survey of five tracks, and we find a quicker way to repeat steps.</p>' }
    ],
    support: 'Start with the fox only: drag one event block and one show block. Use the Copy option (right-click the deer script and choose Duplicate) and change the label.',
    stretch: 'Add “set the pad colour to” (Screen) to each script so each animal has its own colour, and a “when the AI makes a guess” script that plays a click every time.',
    assess: ['Explains that an event starts a script', 'Adds an event script for the fox and the duck', 'Tests every script and fixes one that doesn’t run'],
    steps: [
      { t: 'Try it', d: 'Press Run. Draw a deer track on the pad and press Done. What does Hoot say? Now draw a fox track. What happens?' },
      { t: 'A fox event', d: 'From Events, drag “when the AI thinks it’s” into the space. Click its box and choose fox.' },
      { t: 'Say it', d: 'From Screen, drag “show” and join it under your fox event. Type A fox trotted past! From Sound, add play sound.' },
      { t: 'A duck event', d: 'Make one more script: “when the AI thinks it’s duck” → show A duck waddled by!' },
      { t: 'Test them all', d: 'Press Run. Draw a deer, a fox and a duck track (press Done after each). Does every track get its own message?' },
      { t: 'Challenge', d: 'Add “set the pad colour to” to each script, so every animal has its own colour.' }
    ]
  },
  {
    id: 'ai-4-survey', unit: u(1, 4), title: 'The track survey', ...CODE, ...Y34,
    summary: 'Every week the Spotters survey five tracks. The starter program does the survey steps for one track, written out twice, so it stops after two. Pupils spot the pattern and wrap the steps in a repeat loop to survey five, with the score counting each track.',
    objective: 'We are learning to use a repeat loop to run the same steps a set number of times.',
    success: ['I can spot steps that repeat in a program.', 'I can use a repeat loop instead of copying blocks.', 'I can change the number in a loop to repeat more or fewer times.'],
    curriculum: ['ssr', 'reason'],
    words: [['repeat', 'do the same steps again'], ['loop', 'a block that runs the blocks inside it more than once'], ['count-controlled loop', 'a loop that repeats a set number of times'], ['pattern', 'something that happens again and again']],
    need: [...DEV, 'Optional: a printout of the starter program to circle the repeated part'],
    plan: [
      { min: 8, title: 'Spot the pattern', html: '<p>Write on the board: <i>clap, stamp, clap, stamp, clap, stamp, clap, stamp, clap, stamp</i>. <b>Ask:</b> how could I say that more quickly? (“Clap, stamp, five times.”) That is a <b>loop</b>: a <b>count-controlled loop</b> repeats a set number of times.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter (it opens on <b>3 Code it</b>). Ranger Rosa’s survey needs five tracks, but the program does the survey steps (show, wait for the next guess, show what it saw, change score by 1, clear the pad) written out twice. Press <b>Run</b> and survey two tracks. <b>Ask:</b> how many blocks would five tracks need? (30!) And a hundred?</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card: drag one copy of the survey steps away to the bin, put a <b>repeat</b> block (Control) under “set score to 0” and “wait 1 seconds”, move the remaining steps <b>inside</b> it, and change 3 to 5. Then add <b>show</b> “Survey done!” <b>after</b> the loop.</p><p>Common bugs: “Survey done!” put inside the loop (it shows five times); a step left outside; the loop set to 3. The checklist ticks when the score reaches 5 and Hoot says “Survey done!”.</p>' },
      { min: 10, title: 'Change the number', html: '<p>Pupils change the survey to 3 tracks, then to 8. <b>Ask:</b> how many blocks did you change? (One number.) What if Ranger Rosa wants 100?</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> why is a loop better than copying blocks? (Shorter, fewer mistakes, easy to change.) Where do we repeat things a set number of times in real life? (Laps of a track, steps in a dance.) Next lesson Hoot’s program has got into a muddle, and we debug it.</p>' }
    ],
    support: 'Print the starter program and circle the repeated steps first. Pairs can build the loop together, one dragging, one checking.',
    stretch: 'Make Hoot say the number of the track: put a “create text with” block from Operators in the show block: Track number, then the score.',
    assess: ['Spots the repeated steps', 'Replaces copies with a repeat loop', 'Puts the end message after the loop and explains why'],
    steps: [
      { t: 'Try it', d: 'Press Run and do the survey: draw a track and press Done, twice. How many tracks did it survey? Ranger Rosa needs 5.' },
      { t: 'Spot the pattern', d: 'Look at the blocks. Which steps are written out twice?' },
      { t: 'Keep one copy', d: 'Drag the second “show Draw a track” block (and everything under it) to the bin. Now the steps are there once.' },
      { t: 'Add a loop', d: 'From Control, drag the repeat block. Put the survey steps inside it, under “wait 1 seconds”. Change 3 to 5.' },
      { t: 'The end', d: 'From Screen, put “show” after the loop (not inside it) and type Survey done!' },
      { t: 'Test it', d: 'Press Run and survey 5 tracks. Does the score reach 5? Does Hoot say Survey done! once, at the end?' }
    ]
  },
  {
    id: 'ai-5-muddle', unit: u(1, 5), title: 'Hoot’s muddle', ...CODE, ...Y34,
    summary: 'Someone has been fiddling with Hoot! Its survey program now has three bugs: the survey stops after 3 tracks, the score only goes up once, and a duck track makes Hoot shout about a fox. Pupils predict, test, find and fix each bug, one at a time.',
    objective: 'We are learning to find and fix bugs by predicting, testing and changing one thing at a time.',
    success: ['I can say what I think a program will do before I run it.', 'I can find a bug by comparing what happens with what should happen.', 'I can fix bugs one at a time and test after each fix.'],
    curriculum: ['reason', 'design'],
    words: [['bug', 'a mistake in a program'], ['debug', 'find and fix the mistakes'], ['predict', 'say what you think will happen'], ['test', 'run it to check']],
    need: [...DEV, 'A “bug hunt” sheet per pair: What should happen? · What did happen? · Which block? · What I changed'],
    plan: [
      { min: 8, title: 'A muddled recipe', html: '<p>Read out a muddled recipe for a jam sandwich (“Spread the jam on the plate. Put one slice of bread on top. Repeat 3 times: eat it.”). <b>Ask:</b> what went wrong? Introduce <b>bug</b> and <b>debug</b>. The best debuggers <b>predict</b>, <b>test</b>, then change <b>one thing at a time</b>.</p>' },
      { min: 10, title: 'Predict', html: '<p>Open the starter on the board. The program should survey 5 tracks, count each one, and say the right animal. Read it together <b>without pressing Run</b>. <b>Ask:</b> how many tracks will it survey? What will the score be? What will it say for a duck? Take predictions.</p><p>Press <b>Run</b> and draw a duck track. It says “A fox trotted past!” and “A duck waddled by!”. That is the first clue.</p>' },
      { min: 27, title: 'Bug hunt', html: '<p>Pairs fill in the bug hunt sheet as they follow the Lesson card. The three bugs: <b>1</b> the second “when the AI thinks it’s” script is set to <i>duck</i> instead of <i>fox</i> · <b>2</b> the repeat says 3, not 5 · <b>3</b> “change score by 1” is <i>after</i> the loop, so it only counts once — it belongs inside the loop.</p><p>Insist on one change, then a test. The checklist ticks as each bug is fixed. Don’t give the third bug away: let pupils notice the score says 1 after a whole survey.</p>' },
      { min: 10, title: 'Bug swap', html: '<p>Pairs put ONE new bug into their program (a wrong label, a wrong number, a block in the wrong place) and swap with another pair to find it.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> which bug was hardest to find? How did you find it? (By testing and comparing with what should happen.) Next lesson is a project: your own spotter’s guide.</p>' }
    ],
    support: 'Tell pupils which script each bug is in. Give the bug hunt sheet with the “What should happen?” column filled in.',
    stretch: 'Make the survey say how many tracks were counted at the end, using a “create text with” block and the score.',
    assess: ['Predicts what the program will do before running it', 'Finds bugs by comparing what happens with what should happen', 'Fixes all three bugs, testing after each change'],
    steps: [
      { t: 'Predict', d: 'Read the blocks but don’t press Run yet. How many tracks will the survey ask for? What should the score be at the end?' },
      { t: 'Test', d: 'Press Run. Draw a duck track and press Done. What does Hoot say? Is that right?' },
      { t: 'Bug 1', d: 'One “when the AI thinks it’s” script has the wrong animal in its box. Find it and choose fox.' },
      { t: 'Bug 2', d: 'The survey should ask for 5 tracks. Find the repeat block and fix its number.' },
      { t: 'Bug 3', d: 'Run a whole survey. Is the score 5 at the end? Find “change score by 1” and move it to where it runs once for every track.' },
      { t: 'Test again', d: 'Press Run and survey 5 tracks: deer, fox and duck. Does every goal in the checklist tick?' }
    ]
  },
  {
    id: 'ai-6-guide', unit: u(1, 6), title: 'Project: a spotter’s guide', ...CODE, ...Y34,
    summary: 'A design-and-make project. Each pair designs Hoot’s next job: a spotter’s guide for three things you might see at Wildwood (minibeasts, leaves, birds’ nests, trail signs…). They plan on paper, teach and train their AI, test it, then code an event script for each label and a repeat loop. The checklist at the top is the success criteria.',
    objective: 'We are learning to plan, make, test and improve an AI of our own, with events and a loop.',
    success: ['I can plan my labels and how to draw them.', 'I can teach, train and test an AI with three labels.', 'I can code an event for each label and use a repeat loop.', 'I can improve my project after a partner tests it.'],
    curriculum: ['design', 'data', 'ssr'],
    words: [['design', 'plan how something will look and work'], ['label', 'the name of a group of examples'], ['event', 'something that happens that starts a script'], ['loop', 'a block that repeats the blocks inside it'], ['evaluate', 'decide how well it works and how to make it better']],
    need: [...DEV, 'A planning sheet per pair: my 3 labels · a quick sketch of each · what Hoot says for each · what my loop does'],
    plan: [
      { min: 10, title: 'The brief', html: '<p>Ranger Rosa wants a spotter’s guide for visitors: Hoot should recognise <b>three</b> things you might see at Wildwood and say something about each. Show the starter: three empty labels and a welcome script. Read the checklist at the top together: it is the success criteria.</p><p>Ideas: minibeasts (spider, snail, butterfly), leaves (oak, holly, ash), trail signs, nests, flowers. Choose things that look <b>different</b> from each other: <b>Ask:</b> why?</p>' },
      { min: 10, title: 'Plan', html: '<p>Pairs fill in the planning sheet: the 3 labels, a quick sketch of each, what Hoot will say, and what their repeat loop will do (a 3-go quiz? a survey?). Check plans before they start: “How will you draw it so the AI can tell it apart?”</p>' },
      { min: 25, title: 'Make and test', html: '<p>Pupils follow their plan and the Lesson card, using the algorithm from Whose footprints? (labels, examples, train, test, improve) and the blocks from lessons 3–5. Remind them to test as they go, and that a loose block never runs.</p><p>Circulate with the checklist: which goals are ticked? What is next?</p>' },
      { min: 10, title: 'Partner test', html: '<p>Pairs swap and use each other’s guide: draw each thing at least once. The tester gives one star (something that works well) and one wish (something to improve). Pairs make one improvement and test again.</p>' },
      { min: 5, title: 'Evaluate', html: '<p><b>Ask:</b> which of your labels did the AI find hardest? Why? What did you improve after the partner test? Celebrate the end of Block 1: labels, examples, the algorithm, events, loops and debugging.</p>' }
    ],
    support: 'Use the three trail signs (an arrow left, an arrow right, a no-entry circle) as the labels. Give a half-built program with one event script to copy.',
    stretch: 'Add a fourth label, a sound for each event, and a survey loop that counts with the score.',
    assess: ['Plans three distinct labels', 'Teaches, trains and tests the AI', 'Codes an event for each label and a repeat loop', 'Improves the project after testing'],
    steps: [
      { t: 'Plan', d: 'On your planning sheet, choose 3 things you might see at Wildwood. Sketch each one. What will Hoot say about it?' },
      { t: 'Labels and examples', d: 'Tap 1 Teach. Rename thing 1, 2 and 3 to your labels. Draw at least 6 of each, all a bit different, pressing Add each time.' },
      { t: 'Train and test', d: 'Tap 2 Train & test, press Train, then test 3 new drawings (press Clear between them).' },
      { t: 'Events', d: 'Tap 3 Code it. Make a “when the AI thinks it’s” script for each of your labels, with a show block.' },
      { t: 'A loop', d: 'Use a repeat block: maybe a 3-go quiz with “wait for the next guess” and “clear the pad” inside it.' },
      { t: 'Partner test', d: 'Swap with a partner and try each other’s guides. Fix one thing they found. Is every goal in the checklist ticked?' }
    ]
  },

  // ═══════════════════════ BLOCK 2 · HOOT ON PATROL (Years 4–5) ═══════════════════════
  {
    id: 'ai-7-sure', unit: u(2, 7), title: 'Is Hoot sure?', ...CODE, ...Y45,
    summary: 'Hoot names every drawing as a track, even a scribble or a dot. Pupils find out that the AI also says how sure it is (0–100%), and use an if … else block with a comparison so Hoot only names a track when it is more than 80% sure, and otherwise asks for a better drawing.',
    objective: 'We are learning to use if … else and a comparison so a program makes a decision.',
    success: ['I can explain what an input and a condition are.', 'I can use “how sure the AI is” in a comparison, like > 80.', 'I can use if … else to do one thing or another.', 'I can test both ways through my program.'],
    curriculum: ['ssr', 'reason'],
    words: [['input', 'information that goes into a program, like a drawing'], ['condition', 'a question that is true or false, like “is it more than 80% sure?”'], ['selection', 'the program chooses what to do, using if … else'], ['confidence', 'how sure the AI is, from 0 to 100%'], ['comparison', 'checking if one value is bigger, smaller or the same as another']],
    need: DEV,
    plan: [
      { min: 8, title: 'How sure are you?', html: '<p>Show three pictures: a clear photo of a fox, a blurry one and a fox-shaped cloud. For each, pupils hold up fingers: how sure are they it’s a fox, out of 10? <b>Ask:</b> should a nature reserve tell visitors “it’s a fox!” when it’s only a cloud? Introduce <b>confidence</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter (it opens on <b>3 Code it</b>). The script is <b>when the AI makes a guess</b> → show “It’s a … !”. Press <b>Run</b>, draw a fox track: good. Now draw a dot or a quick scribble: Hoot still names an animal! Point to the line under the pad: <i>AI’s guess: duck (41% sure)</i>.</p><p>Write the rule on the board: <b>if</b> Hoot is more than 80% sure, name the track, <b>else</b> say “Hmm, I’m not sure. Draw it again!”. The drawing is the <b>input</b>; “more than 80% sure” is the <b>condition</b>.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: an <b>if … else</b> block (Control) in the guess script, a comparison block (Operators) in its gap, <b>how sure the AI is (%)</b> (AI) in the comparison’s left side, choose <b>&gt;</b> and type 80. The existing show block goes in the <i>if</i> part; a new show block goes in the <i>else</i> part.</p><p>They test <b>both ways</b>: a clear track and a scribble. The checklist ticks when both have happened. Common bugs: &lt; instead of &gt;; the two show blocks swapped; the comparison left empty.</p>' },
      { min: 12, title: 'Sure but wrong?', html: '<p>Pupils try drawing a square or a happy face. Hoot is often 100% sure it’s a deer! <b>Ask:</b> why? (It only knows three labels, so it must pick one of them.) The if … else helps with messy drawings but not with things it was never taught: we come back to this in Block 3.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> what is the input, the condition and the selection in your program? Where do real machines check how sure they are? (Face unlock on a phone; a parcel scanner that asks a person when it can’t read the label.) Next lesson Hoot reads trail signs and makes a three-way choice.</p>' }
    ],
    support: 'Give a picture of the finished if … else block to build from. Pairs can test while the other drives.',
    stretch: 'Try 60, 80 and 95. Which number works best? Add a third message: if Hoot is more than 50% sure, say “I think it might be a …”.',
    assess: ['Explains input, condition and selection in their program', 'Builds if … else with how sure the AI is > 80', 'Tests a clear drawing and a messy one'],
    steps: [
      { t: 'Try it', d: 'Press Run. Draw a fox track and press Done. Then draw a dot. Does Hoot still name an animal? Look at the line under the pad: how sure was it?' },
      { t: 'If … else', d: 'From Control, drag the “if … else” block into the “when the AI makes a guess” script, at the top.' },
      { t: 'The condition', d: 'From Operators, put the compare block (0 = 50) in the gap after if. Put “how sure the AI is (%)” from AI in its first space. Choose > and type 80.' },
      { t: 'Two answers', d: 'Move the “show It’s a …” block into the if part. Put a new show block in the else part: Hmm, I’m not sure. Draw it again!' },
      { t: 'Test both ways', d: 'Press Run. Draw a clear track, then a scribble. Does Hoot answer differently? Check the checklist at the top.' },
      { t: 'Challenge', d: 'Draw a square. Is Hoot sure it’s an animal? Why can that happen?' }
    ]
  },
  {
    id: 'ai-8-signs', unit: u(2, 8), title: 'Which way, ranger?', ...CODE, ...Y45,
    summary: 'Hoot has been taught three trail signs: an arrow left, an arrow right and a no-entry sign. Its program only knows what to do for the left arrow. Pupils use “AI thinks it’s … ?” as a condition and put an if … else inside the else of another, so one script makes a three-way choice.',
    objective: 'We are learning to use the AI’s guess as a condition and to put one if … else inside another to choose between three things.',
    success: ['I can use “AI thinks it’s … ?” as a condition.', 'I can put an if … else inside another to make a three-way choice.', 'I can test every path through my program.'],
    curriculum: ['ssr', 'reason'],
    words: [['condition', 'a question that is true or false'], ['selection', 'choosing what to do with if … else'], ['nested', 'one block inside another of the same kind'], ['path', 'one way through a program'], ['test data', 'the inputs you try, to check every path']],
    need: [...DEV, 'The three trail signs drawn on the board: an arrow pointing left, an arrow pointing right, a circle with a bar across (no entry)'],
    plan: [
      { min: 8, title: 'Which way?', html: '<p>Draw a flowchart on the board: a diamond “Is it a left arrow?” → yes: “turn left” / no: another diamond “Is it a right arrow?” → yes: “turn right” / no: “path closed”. Walk it through with three signs. <b>Ask:</b> how many questions do we need for three answers? (Two.)</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter (on <b>3 Code it</b>, already trained on the three signs). Read the guess script: <b>if AI thinks it’s left ?</b> → show “Turn left at the old oak tree.”. Press <b>Run</b> and draw each sign. <b>Ask:</b> what happens for the right arrow and the no-entry sign? (Nothing is shown.)</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card: swap the <b>if</b> for an <b>if … else</b> (or add else with the gear), put a second <b>if … else</b> in the first one’s else part with <b>AI thinks it’s right ?</b>, and fill in the three messages. Then they test all three paths: the checklist ticks for each sign.</p><p>Compare with Hoot says what it sees (events for each label): this time <b>one</b> script makes the whole decision. <b>Ask:</b> what happens if the AI thinks it’s none of them? (It goes to the last else.)</p>' },
      { min: 10, title: 'Test data', html: '<p>Pairs write a test table: sign drawn · what should happen · what did happen. Each pair tests a partner’s program with three signs and one odd drawing.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> why do we need to test every path? (A bug might be in a path you didn’t try.) Next lesson: two clues are better than one, with “and” and “or”.</p>' }
    ],
    support: 'Give the flowchart printed, with the blocks labelled on it. Start with two signs (left and right) before adding the third.',
    stretch: 'Make each sign set the pad colour (green for left and right, red for closed) and play a different sound.',
    assess: ['Uses AI thinks it’s … ? as a condition', 'Puts an if … else inside another for three outcomes', 'Tests all three paths with test data'],
    steps: [
      { t: 'Try it', d: 'Press Run. Draw a left arrow, a right arrow and a no-entry sign (press Done after each). Which signs get an answer?' },
      { t: 'If … else', d: 'Drag the “if … else” block from Control into the guess script. Move “AI thinks it’s left ?” and its show block into it. Bin the old if block.' },
      { t: 'Another question', d: 'Put a second “if … else” in the else part. From AI, put “AI thinks it’s left ?” in its gap and choose right.' },
      { t: 'Three answers', d: 'Add show blocks: Turn right to the pond. in the new if part, and This path is closed. Go back! in the last else part.' },
      { t: 'Test every path', d: 'Press Run and draw all three signs. Does each one get the right answer? Check the checklist at the top.' }
    ]
  },
  {
    id: 'ai-9-clues', unit: u(2, 9), title: 'Mammal or bird?', ...CODE, ...Y45,
    summary: 'Ranger Rosa wants Hoot to tell visitors whether a track was made by a mammal or a bird, and to log a fox sighting only when it is really sure. Pupils join two conditions with “or” (deer or fox = a mammal, else a bird) and with “and” (a fox and more than 90% sure = log it).',
    objective: 'We are learning to join conditions with “and” and “or”.',
    success: ['I can explain the difference between “and” and “or”.', 'I can use “or” so either condition makes something happen.', 'I can use “and” so both conditions must be true.'],
    curriculum: ['reason', 'ssr'],
    words: [['and', 'both conditions must be true'], ['or', 'at least one condition must be true'], ['operator', 'a block that joins or compares values, like and, or, >'], ['Boolean', 'a value that is only true or false']],
    need: DEV,
    plan: [
      { min: 8, title: 'Stand up if…', html: '<p>“Stand up if you have a pet <b>and</b> you walked to school.” Then “Stand up if you have a pet <b>or</b> you walked to school.” <b>Ask:</b> why did more people stand the second time? Write: <b>and</b> = both must be true; <b>or</b> = at least one.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter (<b>3 Code it</b>, the tracks AI). It has two separate if blocks, one for deer and one for fox, both saying “A mammal! It has fur.” — and nothing for ducks. Press <b>Run</b> and try all three tracks. <b>Ask:</b> how could ONE question cover deer and fox? (Deer <b>or</b> fox.)</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: an <b>if … else</b> with an <b>or</b> block (Operators) holding <b>AI thinks it’s deer ?</b> and <b>AI thinks it’s fox ?</b>; “A mammal!” in the if part and “A bird! It has feathers.” in the else part. Then a second <b>if</b> with <b>and</b>: AI thinks it’s fox <b>and</b> how sure the AI is &gt; 90 → change score by 1 (a logged sighting).</p><p>The checklist ticks when both operators are used and each message has appeared.</p>' },
      { min: 12, title: 'Truth table', html: '<p>Pairs fill in a table for the “and” rule: fox? (yes/no) · more than 90% sure? (yes/no) · logged? Four rows. Then the same for “or”. <b>Ask:</b> which rows log a sighting?</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> when would you use “and”? When “or”? Where do real systems use them? (“Free entry if you are under 5 <b>or</b> over 65.” “The door opens if the card is right <b>and</b> it is daytime.”)</p>' }
    ],
    support: 'Do the “or” part together on the board first. Give the truth table half filled in.',
    stretch: 'Use “not”: if not (AI thinks it’s duck), say “No ducks here!”. Can you get the same result another way?',
    assess: ['Explains and / or with an example', 'Uses or to combine deer and fox', 'Uses and to need a fox and high confidence'],
    steps: [
      { t: 'Try it', d: 'Press Run and draw a deer, a fox and a duck track (press Done after each). What does Hoot say for the duck?' },
      { t: 'Or', d: 'Drag an “if … else” from Control into the guess script. From Operators, put the “and” block in its gap and change and to or.' },
      { t: 'Two clues', d: 'Put “AI thinks it’s deer ?” in one side of or and “AI thinks it’s fox ?” in the other. Move “show A mammal! It has fur.” into the if part and bin the two old if blocks.' },
      { t: 'Else', d: 'Put show A bird! It has feathers. in the else part. Test all three tracks.' },
      { t: 'And', d: 'Add an “if” block. Put an and block in it: “AI thinks it’s fox ?” and (how sure the AI is (%) > 90). Inside, put change score by 1.' },
      { t: 'Test', d: 'Press Run. Draw a clear fox: does the score go up? Draw a messy fox: does it stay the same?' }
    ]
  },
  {
    id: 'ai-10-ducks', unit: u(2, 10), title: 'Count the ducks', ...CODE, ...Y45,
    summary: 'Ranger Rosa is counting ducks at the pond. The starter program says “Three ducks!” after any three drawings, even when one is a fox, because it uses repeat 3. Pupils change it to a loop that checks a condition, “repeat until score = 3”, so it keeps going until three ducks have really been counted.',
    objective: 'We are learning to use a loop that repeats until a condition is true.',
    success: ['I can explain the difference between “repeat 3 times” and “repeat until”.', 'I can make a loop that stops when a condition is true.', 'I can test my loop with drawings that should and shouldn’t count.'],
    curriculum: ['ssr', 'reason'],
    words: [['condition-controlled loop', 'a loop that keeps going until (or while) something is true'], ['repeat until', 'run the blocks inside again and again until the condition is true'], ['count-controlled loop', 'a loop that repeats a set number of times'], ['condition', 'a question that is true or false']],
    need: DEV,
    plan: [
      { min: 8, title: 'Until…', html: '<p>Two instructions: “Clap 3 times.” and “Keep clapping until I raise my hand.” <b>Ask:</b> which one could go on for ever? Which one do you know the length of before you start? Introduce <b>count-controlled</b> (repeat 3) and <b>condition-controlled</b> (repeat until) loops.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter (<b>3 Code it</b>). Read it: set score to 0, repeat 3 times: wait for the next guess, if AI thinks it’s duck → change score by 1, clear the pad; then “Three ducks! Well done!”. Press <b>Run</b> and draw duck, fox, duck. It says “Three ducks!” with a score of 2. <b>Ask:</b> what is the bug? (It counts drawings, not ducks.)</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: replace <b>repeat 3 times</b> with <b>repeat until</b> (the “repeat while” block from Control, changed to until), with the condition <b>score = 3</b> (a compare block from Operators and <b>score</b> from Score). Then test with a fox in the middle.</p><p>The checklist ticks when the loop checks the score, three ducks are counted and Hoot says well done. Common bugs: “repeat while” left on while (the loop never runs, because score = 3 is false at the start); the condition set to score = 30.</p>' },
      { min: 12, title: 'Which loop?', html: '<p>Card sort in pairs: “Brush your teeth for 2 minutes”, “Stir until it’s smooth”, “Do 10 star jumps”, “Wait until the bus comes”, “Sing the chorus twice”. Count-controlled or condition-controlled?</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> when is repeat until better than repeat 3? (When you don’t know how many goes it will take.) Next lesson someone has broken Hoot’s night patrol loop.</p>' }
    ],
    support: 'Show the finished loop on the board. Pupils build it, then test with the class’s three drawings.',
    stretch: 'Count the foxes too (use how sure it’s fox, or a second if) and say how many foxes were drawn by mistake.',
    assess: ['Explains count- and condition-controlled loops', 'Builds repeat until score = 3', 'Tests with a drawing that should not count'],
    steps: [
      { t: 'Try it', d: 'Press Run. Draw a duck, then a fox, then a duck (press Done after each). What does Hoot say? What is the score?' },
      { t: 'Find the bug', d: 'Why does it say Three ducks! when there were only 2? Look at the repeat block.' },
      { t: 'Repeat until', d: 'From Control, drag “repeat while” and change while to until, so it says repeat until. Move the blocks from inside repeat 3 into it, and bin repeat 3.' },
      { t: 'The condition', d: 'From Operators, put the compare block in the gap. Put score from Score in the first space and type 3 in the second.' },
      { t: 'Test it', d: 'Press Run. Draw duck, fox, duck, duck. Does Hoot wait for the third duck before it says well done?' }
    ]
  },
  {
    id: 'ai-11-patrol', unit: u(2, 11), title: 'Fix the night patrol', ...CODE, ...Y45,
    summary: 'Hoot’s night patrol program should keep watch until it has seen two foxes, only counting a fox when it is sure. But it ends straight away! Pupils debug a loop and a condition: a “wait for the next guess” outside the loop, a loop that checks the wrong condition, and a comparison the wrong way round.',
    objective: 'We are learning to debug loops and conditions by tracing what a program does step by step.',
    success: ['I can trace a loop step by step to find where it goes wrong.', 'I can fix a condition that is the wrong way round.', 'I can explain why a block must be inside or outside a loop.'],
    curriculum: ['reason', 'ssr'],
    words: [['trace', 'follow a program one step at a time, writing down what happens'], ['bug', 'a mistake in a program'], ['condition', 'a question that is true or false'], ['loop', 'a block that repeats the blocks inside it']],
    need: [...DEV, 'A trace table per pair: step · score · is the condition true? · what Hoot shows'],
    plan: [
      { min: 8, title: 'Trace it', html: '<p>Write on the board: <i>score = 0 · repeat until score &lt; 2: add 1 to score · say “done”</i>. Trace it together in a table. <b>Ask:</b> how many times does the loop run? (None: 0 &lt; 2 is already true.) Introduce <b>trace</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter (<b>3 Code it</b>). What it should do: watch until <b>2</b> foxes have been seen; for each drawing, if it is a fox and Hoot is more than 80% sure, add 1 and say “Fox spotted!”, else “Not a fox. Keep watching.”. Press <b>Run</b>, draw one fox: “Patrol over” straight away, with no foxes counted.</p>' },
      { min: 25, title: 'Debug', html: '<p>Pairs trace the program in their table, then follow the Lesson card. The bugs: <b>1</b> the loop says <i>until score &lt; 2</i> (true at once, so it never runs) — it should be <i>until score = 2</i> · <b>2</b> <i>wait for the next guess</i> is <b>before</b> the loop, so Hoot only waits once — it must be the first block <b>inside</b> the loop · <b>3</b> the condition says how sure the AI is <b>&lt;</b> 80, so only unsure foxes count — it should be &gt;.</p><p>One fix, one test. Fixing bug 1 first makes the loop run for ever without waiting, counting the same fox twice: a great moment to trace again.</p>' },
      { min: 12, title: 'Bug report', html: '<p>Pairs write a short bug report for Ranger Rosa: what went wrong, how they found it, how they fixed it. Two pairs read theirs out.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> what do you check first when a loop ends too soon, or never ends? (The condition, and what is inside or outside the loop.) Next lesson is the Block 2 project: the trail gate.</p>' }
    ],
    support: 'Give the trace table with the first two rows filled in. Tell pupils there are three bugs and which blocks to look at.',
    stretch: 'Add a “give up” rule: the patrol also ends after 6 drawings (use a variable or the score in an “or”).',
    assess: ['Traces a loop and says where it goes wrong', 'Fixes the loop condition and the comparison', 'Explains why wait for the next guess must be inside the loop'],
    steps: [
      { t: 'Try it', d: 'Press Run. Draw a fox track and press Done. Does the patrol last until 2 foxes? What does Hoot say?' },
      { t: 'Trace it', d: 'In your trace table, follow the blocks one at a time. At the start the score is 0. Is “score < 2” true or false?' },
      { t: 'Bug 1: the loop', d: 'Change the condition in the “repeat until” block from < to =, so it says repeat until score = 2.' },
      { t: 'Bug 2: the wait', d: 'Run it again: one fox counts twice! Move “wait for the next guess” to the top, inside the repeat until loop.' },
      { t: 'Bug 3: the condition', d: 'Hoot should only count a fox when it’s sure. Find how sure the AI is (%) < 80 and change < to >.' },
      { t: 'Test', d: 'Press Run. Draw a fox, a deer and a fox. Does the score reach 2 and the patrol end? Check the checklist.' }
    ]
  },
  {
    id: 'ai-12-gate', unit: u(2, 12), title: 'Project: the trail gate', ...CODE, ...Y45,
    summary: 'A design-and-make project. The gate to the reserve’s secret wildflower meadow needs a password made of trail signs. Pupils design the rule (for example: three sure right arrows in a row; or left then right), then code it with selection, a loop that checks a condition and comparisons, using Hoot’s guesses as the input. The checklist at the top is the success criteria.',
    objective: 'We are learning to design and build a program that uses selection, a condition-controlled loop and the AI’s guesses.',
    success: ['I can design a rule for my gate and write it as steps.', 'I can use if … else, repeat until and a comparison in my program.', 'I can test my gate with right and wrong signs.', 'I can improve my program after testing.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['algorithm', 'the steps for your gate, in order'], ['selection', 'choosing what to do with if … else'], ['condition-controlled loop', 'a loop that repeats until something is true'], ['test', 'try it with inputs that should and shouldn’t work']],
    need: [...DEV, 'A planning sheet per pair: the password rule · a flowchart · what happens for a right sign and a wrong sign · how the gate opens'],
    plan: [
      { min: 10, title: 'The brief', html: '<p>Ranger Rosa has a secret wildflower meadow behind a gate. Visitors must draw the right trail signs for Hoot to open it. Open the starter (<b>3 Code it</b>, the trail signs AI) and read the checklist: an if … else, a loop that checks a condition, a comparison (or and/or), the AI’s guess, three test drawings in one run, and a gate that opens.</p><p>Show one example rule: “three right arrows, Hoot must be sure each time; a wrong sign starts again”.</p>' },
      { min: 10, title: 'Plan', html: '<p>Pairs design their own rule and draw a flowchart on the planning sheet. Check: where is the loop? What is its condition? Where is the if … else? What does a wrong sign do?</p>' },
      { min: 25, title: 'Make and test', html: '<p>Pupils build their gate, using blocks from lessons 7–11. Remind them of the debugging habits: trace, change one thing, test. They test with right <b>and</b> wrong signs, and a scribble.</p>' },
      { min: 10, title: 'Partner test', html: '<p>Pairs swap: can the partner open the gate from the instructions on the screen? Can they find a way to open it without the password (a bug!)? One star, one wish, one fix.</p>' },
      { min: 5, title: 'Evaluate', html: '<p><b>Ask:</b> what was the hardest part of your rule to code? What did your tester find? Celebrate the end of Block 2: confidence, selection, and/or, loops that check conditions and debugging.</p>' }
    ],
    support: 'Start from the example rule (three right arrows) and build it step by step with the Lesson card.',
    stretch: 'Make a two-sign password (left, then right) using the score to remember how far through the password the visitor is.',
    assess: ['Designs a rule and a flowchart', 'Uses if … else, repeat until and a comparison', 'Tests with right and wrong inputs and fixes bugs'],
    steps: [
      { t: 'Plan', d: 'Choose your password rule and draw a flowchart. What happens for a right sign? A wrong one? When does the gate open?' },
      { t: 'The loop', d: 'In 3 Code it, under “when Run is clicked”, set score to 0 and add “repeat until” (from Control) with a condition, like score = 3.' },
      { t: 'The decision', d: 'Inside the loop: wait for the next guess, then an if … else using “AI thinks it’s … ?” and how sure the AI is (%).' },
      { t: 'Open the gate', d: 'After the loop, show The gate is open! Add a sound from Sound.' },
      { t: 'Test', d: 'Press Run. Try right signs, wrong signs and a scribble. Does it only open with the password?' },
      { t: 'Partner test', d: 'Swap with a partner. Can they open it? Can they trick it? Fix one thing and check the checklist.' }
    ]
  },

  // ═══════════════════════ BLOCK 3 · HOOT RUNS THE VISITOR CENTRE (Years 5–6) ═══════════════════════
  {
    adopt: 'teach-the-computer', unit: u(3, 13), ...Y56,
    summary: 'Hoot is moving into the visitor centre, where it will meet things it was never taught. Pupils train a real neural network to recognise drawings, find out it only knows what it was shown (it is confidently wrong about a shape it has never seen), make it better with a new label and more varied examples, test it fairly with drawings it has never seen, and meet bias, then code a game with it.',
    plan: [
      { min: 5, title: 'Rules or examples?', html: '<p>Block 3 begins: Hoot is moving into the visitor centre, where hundreds of visitors will show it things it has never seen. Before that, the Spotters need to know how to judge an AI properly.</p><p><b>Ask:</b> how would you explain to an alien what a <i>cat</i> looks like? Try writing rules (“four legs, pointy ears…”). Then point out a dog also has four legs! Show a few cat pictures instead: people learn from <b>examples</b>. Some computers can too. That’s called <b>machine learning</b>.</p>' },
      { min: 10, title: 'Meet the AI', html: '<p>Open the starter on the board. Step <b>1 Teach</b> shows two <b>labels</b>, <i>circle</i> and <i>triangle</i>, with three drawings each. Go to <b>2 Train &amp; test</b> and press <b>Train</b>: the green line shows how often it was right while it practised.</p><p>Draw a circle on the test pad. The bars show how <b>confident</b> it is. Now draw a <b>square</b>. It still says circle or triangle, often very sure! <b>Ask:</b> why? (It only knows the labels it was taught. It can be <i>confidently wrong</i>: in Is Hoot sure? the if … else couldn’t catch this either.)</p>' },
      { min: 25, title: 'Make it better', html: '<p>Pupils follow the Lesson card: add a <b>square</b> label, draw lots of different examples, retrain and test each other’s drawings. Point out <b>Look inside your AI</b>: the average drawing of each label (all the computer has to go on is a 20 × 20 grid) and the <b>mix-ups</b> table.</p><p>Talk about the fair test: the AI is checked on 1 in 4 drawings it was <i>not</i> allowed to practise on. Why is that fairer than testing it on drawings it has already seen?</p><p>Fast finishers move on to <b>3 Code it</b> and the challenge.</p>' },
      { min: 10, title: 'Is AI always right?', html: '<p>On the board, choose <b>Ready-made examples → Kind or unkind messages</b> (it switches to words), train it, and type a few messages: “I love your drawing” is often called unkind, because “your drawing is rubbish” was in the unkind examples. <b>Ask:</b> would you let this AI decide which messages to block? What would make it fairer? This is <b>bias</b>: an AI is only as good, and as fair, as the examples people give it. In lesson 17 the Spotters find and fix a bias in Hoot’s own visitor book.</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> how did your AI learn? (From labelled examples, by practising.) How did you make it better? (More, and more different, examples; a label for every kind of thing.) How do we know if it is any good? (Test it on examples it has never seen.)</p>' }
    ]
  },
  {
    id: 'ai-14-target', unit: u(3, 14), title: 'Draw what Hoot asks', ...CODE, ...Y56,
    summary: 'Hoot is making a spotting game for young visitors: it asks for a track, and you have to draw it. But the starter forgets what it asked for, so it can’t tell if you were right. Pupils create variables: “target” remembers the random label Hoot asked for, and “goes” counts the turns; then they compare the AI’s guess with target.',
    objective: 'We are learning to create variables and use them to remember and compare values.',
    success: ['I can create a variable and set it to a value.', 'I can use a variable to remember something the program needs later.', 'I can compare the AI’s guess with a variable.', 'I can use a variable to count.'],
    curriculum: ['ssr', 'reason'],
    words: [['variable', 'a named store for a value that can change, like target'], ['set', 'put a value into a variable'], ['change by', 'add to (or take from) a number variable'], ['compare', 'check whether two values are the same']],
    need: [...DEV, 'Sticky notes labelled “target” and “goes” for the warm up'],
    plan: [
      { min: 8, title: 'Remember it', html: '<p>Pick a pupil to be the quiz master. Whisper “fox” to them; they ask the class to draw it on mini whiteboards, then must check every board… but they have to remember “fox” to check. Give them a sticky note labelled <b>target</b> to write it on. That sticky note is a <b>variable</b>: a named store for a value that can change. Another note, <b>goes</b>, counts the turns.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter (<b>3 Code it</b>). Press <b>Run</b>: Hoot asks for a random track (a random label). Draw it: Hoot just says what it sees. <b>Ask:</b> can it tell you if you were right? Why not? (It didn’t remember what it asked for — “a random label” picks again every time it is used.)</p><p>Show how to make a variable: <b>Variables → Create variable…</b>, type <i>target</i>.</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card to build the game in the <b>when Run is clicked</b> script: set score to 0 and <i>goes</i> to 0; repeat 3 times: set <i>target</i> to a random label, show “Draw a … track!” using target, wait for the next guess, change <i>goes</i> by 1, if AI’s guess = target then change score by 1 and say “Yes!”, else say what it looks like; clear the pad. At the end, show the score and the goes.</p><p>The checklist ticks when target holds a label, the guess is compared with target, goes reaches 3 and the score reaches 3. Common bug: using “a random label” again in the comparison instead of the variable.</p>' },
      { min: 10, title: 'Variable detectives', html: '<p>Pairs fill in the variable table on the slide: after each round, what is in <i>target</i>, <i>goes</i> and the score? Then they check by running the game (the end message shows the score and goes). <b>Ask:</b> which variable holds words? Which holds a number?</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> why did the game need a variable? (To remember the label so it could compare later.) Next lesson Hoot sends messages between scripts when it spots a fox.</p>' }
    ],
    support: 'Build the first round without a loop, then wrap it in repeat 3. Use the picture of the finished script on the board.',
    stretch: 'Make the game end early if you get 2 wrong (use repeat until with an “or”), or add a third variable, best, for the best score.',
    assess: ['Creates and sets variables', 'Uses target to remember the random label and compare with the guess', 'Uses goes to count'],
    steps: [
      { t: 'Try it', d: 'Press Run and draw what Hoot asks for. Does Hoot tell you if you were right? Why can’t it?' },
      { t: 'Make variables', d: 'Click Variables, press Create variable… and make target. Make another called goes.' },
      { t: 'Remember the target', d: 'In the when Run is clicked script: “set target to” with “a random label” (from AI) in it. Then show Draw a … track! with target in a “create text with” block.' },
      { t: 'Wait and count', d: 'Next: wait for the next guess, then change goes by 1. Put these steps inside a repeat 3 block, with set score to 0 and set goes to 0 before it.' },
      { t: 'Compare', d: 'Inside the loop: an if … else with AI’s guess = target (a compare block from Operators). If: change score by 1 and show Yes! Else: show what Hoot saw. Then clear the pad.' },
      { t: 'Test', d: 'Press Run and play 3 rounds. Get one wrong on purpose. Do target, goes and the score do their jobs? Check the checklist.' }
    ]
  },
  {
    id: 'ai-15-alert', unit: u(3, 15), title: 'Ranger alert!', ...CODE, ...Y56,
    summary: 'When Hoot spots a fox by the hen house, three things must happen: the alarm colour, a message for the rangers and the fox count going up. Pupils split the job into scripts that talk to each other with messages: the guess script sends “fox alert” or “all clear”, and “when I receive” scripts do the rest, with a variable counting the foxes.',
    objective: 'We are learning to use messages so separate scripts can work together, and to break a job into parts.',
    success: ['I can send a message from one script.', 'I can make a script that starts when it receives a message.', 'I can split a big job into scripts that each do one part.', 'I can use a variable to count.'],
    curriculum: ['design', 'ssr'],
    words: [['message', 'a signal one script sends to start other scripts'], ['broadcast', 'send a message to every script that is listening'], ['decompose', 'break a job into smaller parts'], ['variable', 'a named store for a value that can change']],
    need: [...DEV, 'Three envelopes labelled “fox alert” for the warm up'],
    plan: [
      { min: 8, title: 'Pass the message', html: '<p>Choose three pupils: a “lookout”, a “siren” and a “counter”. When the lookout sees you hold up a fox picture, they hold up a card saying <b>fox alert</b>. The siren and the counter don’t watch the pictures: they only do their job (“Nee-naw!”, tally mark) when they see the card. <b>Ask:</b> why is this a good way to share the work? Introduce <b>message</b> (or <b>broadcast</b>).</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter (<b>3 Code it</b>). One script: when the AI thinks it’s fox → show “A fox! Quick, somebody do something!”. Ranger Rosa wants more: the pad to turn red, an alarm sound, a message for the rangers, the foxes counted, and an “all clear” for any other track. <b>Ask:</b> how could we decompose this into scripts, like our lookout, siren and counter?</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card: a <b>when the AI makes a guess</b> script with an if … else: AI thinks it’s fox → <b>send message</b> fox alert, else → send message all clear. Then two <b>when I receive</b> scripts: fox alert → set the pad colour, play a sound, show “Ranger alert: a fox by the hen house!”, change <i>foxes</i> by 1; all clear → a green pad and “All clear”. They make the variable <i>foxes</i> and set it to 0 when Run is clicked.</p><p>The checklist ticks when both messages are sent, the rangers are called and foxes reaches 2. Common bug: the message name typed differently in send and receive (“fox alert” vs “Fox Alert!”).</p>' },
      { min: 10, title: 'Add a part', html: '<p>Pairs add one more “when I receive fox alert” script of their own (a speech with “say … out loud”, or a second sound). <b>Ask:</b> did you have to change the guess script? (No: that is the power of messages.)</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> where do real systems send messages? (A fire alarm sets off bells and tells the fire station; a doorbell rings in every room.) Next lesson Hoot learns to read the visitor book: words instead of drawings.</p>' }
    ],
    support: 'Build the fox alert part only, then add all clear. Check message names match by copying them.',
    stretch: 'Send a third message, “count”, every 5 foxes, which shows a report for Ranger Rosa.',
    assess: ['Sends a message from the guess script', 'Uses when I receive scripts to do the parts of the job', 'Counts with a variable'],
    steps: [
      { t: 'Try it', d: 'Press Run and draw a fox track, then a duck track. What happens? Ranger Rosa wants an alarm, a ranger alert and a fox count.' },
      { t: 'Send a message', d: 'Make a “when the AI makes a guess” script with an if … else: if AI thinks it’s fox ?, send message fox alert. Else, send message all clear.' },
      { t: 'Receive it', d: 'From Events, drag “when I receive” and type fox alert. Under it: set the pad colour, play sound, show Ranger alert: a fox by the hen house!' },
      { t: 'Count the foxes', d: 'Make a variable called foxes. Set it to 0 under when Run is clicked, and put change foxes by 1 in the fox alert script.' },
      { t: 'All clear', d: 'Make a “when I receive all clear” script that turns the pad green and shows All clear.' },
      { t: 'Test', d: 'Press Run. Draw a fox, a duck and a fox. Does foxes reach 2? Check the checklist.' }
    ]
  },
  {
    id: 'ai-16-book', unit: u(3, 16), title: 'The visitor book', ...WORDS, ...Y56,
    summary: 'Hoot learns to read the visitor book. A words AI turns each message into numbers from its words, word pairs and bits of words. The starter only knows praise and problems, so every question (“where is the car park?”) is read as one or the other. Pupils add a question label, collect more and more varied messages, use the fair check and the key words to judge it, and test it with new messages.',
    objective: 'We are learning how a computer can learn from words, and how to collect and check data so an AI works well.',
    success: ['I can explain how a computer turns words into data it can learn from.', 'I can add a missing label and collect more examples.', 'I can use the fair check and key words to judge my AI.', 'I can test it with messages it has never seen.'],
    curriculum: ['data', 'reason'],
    words: [['data', 'facts or examples a computer can use, like messages in a visitor book'], ['dataset', 'all the examples you teach an AI with'], ['key words', 'the words that make the AI surest of a label'], ['fair check', 'testing the AI on examples it didn’t practise with'], ['accuracy', 'how many it gets right out of how many it tried']],
    need: [...DEV, 'Optional: a few real (or made-up) visitor book messages on cards'],
    plan: [
      { min: 8, title: 'Sort the book', html: '<p>Read out visitor book messages: “What a lovely walk”, “The bins are overflowing”, “Is there a café?”. Pupils show a thumbs up (praise), thumbs down (problem) or a question mark (question). <b>Ask:</b> which words gave it away? (lovely, overflowing, is there…)</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter: it opens on <b>1 Teach</b> with <b>Words</b> chosen and two labels, praise and problem, with three messages each. Train it (<b>2 Train &amp; test</b>, <b>Train</b>) and type “where is the car park?” on the test box. It is read as a problem or praise. <b>Ask:</b> why? (There is no question label: it has to pick one it knows.)</p><p>Explain how it reads: it doesn’t understand words like we do. It counts which words, pairs of words and bits of words are in the message, so a message becomes a long list of numbers: <b>data</b>.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: add a <b>question</b> label and type at least 8 messages for every label, each said a different way. Train, then read the result: “We hid 1 in 4…” is the <b>fair check</b> (accuracy on messages it didn’t practise with). Open <b>Look inside your AI</b>: are the key words the ones a person would use?</p><p>The checklist ticks for the three labels, 8 messages each, a fair check of at least half, and the car park question being read as a question.</p>' },
      { min: 12, title: 'Swap and test', html: '<p>Pairs type five new messages into a partner’s test box and score it out of 5. Which messages fooled it? Did it meet words it had never seen (it lists them)? What could be added to the dataset?</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> what made your AI better: more messages, or more <i>different</i> messages? How did the key words help? Next lesson: what if the visitor book teaches Hoot something unfair?</p>' }
    ],
    support: 'Give a bank of 10 messages for each label to choose from and type. Pairs take turns: one types, one checks the label.',
    stretch: 'Add a fourth label (“sighting”: “we saw a kingfisher!”). Which other labels does it get mixed up with in the mix-ups table?',
    assess: ['Explains that words become numbers the computer can learn from', 'Adds a label and varied examples', 'Uses the fair check, key words and new test messages to judge the AI'],
    steps: [
      { t: 'Try it', d: 'Tap 2 Train & test and press Train. Type where is the car park? in the test box. What does Hoot think it is? Why?' },
      { t: 'A new label', d: 'Tap 1 Teach. Press New label and call it question.' },
      { t: 'Collect data', d: 'Click a label, type a message in the box and press Add (or Enter). Make 8 or more for every label, each said a different way.' },
      { t: 'Train', d: 'Tap 2 Train & test and press Train. How many did it get right in the fair check? Open Look inside your AI: what are its key words?' },
      { t: 'Test new messages', d: 'Type messages it has never seen. Does where is the car park? come out as a question now?' },
      { t: 'Swap and test', d: 'Ask a partner to type 5 new messages. How many does your AI get right?' }
    ]
  },
  {
    id: 'ai-17-fair', unit: u(3, 17), title: 'Is Hoot fair?', ...WORDS, ...Y56,
    summary: 'Hoot has been sorting the visitor book into praise and problems, but dog walkers are upset: every kind message about a dog is filed as a complaint. Pupils investigate: in the examples, every message that mentions a dog is a problem, so the AI learned that “dog” means problem. They find the bias with tests and key words, fix the dataset with fairer examples, retrain and prove it is fairer.',
    objective: 'We are learning how bias gets into an AI through its data, and how to find it and make the AI fairer.',
    success: ['I can explain what bias is and how it gets into an AI.', 'I can find bias by testing and by looking at the key words.', 'I can make the data fairer and test that the AI has improved.', 'I can explain why people must check AI decisions.'],
    curriculum: ['data', 'safe', 'reason'],
    words: [['bias', 'when an AI treats some things unfairly because of the examples it learned from'], ['dataset', 'all the examples you teach an AI with'], ['balanced', 'every kind of example is there, in fair numbers'], ['fair', 'treating everyone the same way'], ['evidence', 'facts that show something is true, like test results']],
    need: [...DEV, 'Five test messages on the board: “my dog had a great time”, “our dog loved the woods”, “the path by the lake is flooded”, “the bins are full”, “thank you for a lovely walk”'],
    plan: [
      { min: 8, title: 'A complaint', html: '<p>Read out an (invented) email to Ranger Rosa: “I wrote in the visitor book that my dog had a great time, and Hoot sent it to the complaints pile!” <b>Ask:</b> why might Hoot do that? Take ideas. Recap from Teach the computer: an AI is only as fair as the examples it was given. Introduce <b>bias</b>.</p>' },
      { min: 12, title: 'Investigate', html: '<p>Open the starter: a words AI, already trained, with praise and problem examples from Hoot’s visitor book. Test the five messages on the board (<b>2 Train &amp; test</b>, type in the test box) and record the results in a table: message · what Hoot said · fair? Open <b>Look inside your AI</b>: “dog” and “dogs” are key words for <i>problem</i>.</p><p>Now look at the evidence in <b>1 Teach</b>: every example that mentions a dog is a problem; none are praise. <b>Ask:</b> is Hoot being unkind to dog owners on purpose? (No: it learned the pattern from the data people gave it.)</p>' },
      { min: 20, title: 'Make it fair', html: '<p>Pupils follow the Lesson card: add kind messages that mention dogs (“our dog loved the woodland walk”), and problem messages that don’t (“the toilets were dirty”), until each label has at least 12. Then train again and re-test the same five messages. The checklist ticks when “my dog had a great time” is praise <b>and</b> real problems are still problems.</p><p>Point out that fixing bias isn’t just deleting words: the data has to show a fairer picture of real visitors.</p>' },
      { min: 12, title: 'Who decides?', html: '<p>Discuss: Ranger Rosa wants Hoot to <b>delete</b> messages it thinks are complaints. Is that a good idea? What should happen instead? (A person checks; Hoot only sorts.) Link to real AI used to sort job applications, photos or messages, and why people must check and challenge it.</p>' },
      { min: 8, title: 'Plenary', html: '<p>Pupils write one sentence: “Bias can get into an AI when…” and one: “To make it fairer we…”. Share a few. Next lesson is the final project: Hoot’s visitor centre.</p>' }
    ],
    support: 'Give a bank of fairer messages to type. Work in pairs: one tests, one records the table.',
    stretch: 'Find another unfair pattern of your own: write a test message the fixed AI still gets wrong, work out why, and fix it.',
    assess: ['Explains bias in terms of the examples the AI learned from', 'Finds the bias with tests and key words', 'Balances the data and shows with tests that the AI is fairer', 'Explains why people should check AI decisions'],
    steps: [
      { t: 'Test it', d: 'Tap 2 Train & test. Type my dog had a great time in the test box. Is that a problem? Try the other messages on the board.' },
      { t: 'Look inside', d: 'Open Look inside your AI. Which key words make Hoot sure something is a problem?' },
      { t: 'Find the evidence', d: 'Tap 1 Teach and read the examples. Which label has all the messages about dogs?' },
      { t: 'Kind dog messages', d: 'Click praise. Type kind messages that mention dogs, like our dog loved the woodland walk, pressing Add after each one.' },
      { t: 'Other problems', d: 'Click problem. Add problems that aren’t about dogs, like the toilets were dirty. Get 12 or more for each label.' },
      { t: 'Train and re-test', d: 'Tap 2 Train & test, press Train and test the same messages again. Is Hoot fairer? Check the checklist.' }
    ]
  },
  {
    id: 'ai-18-centre', unit: u(3, 18), title: 'Project: Hoot’s visitor centre', ...WORDS, ...Y56,
    summary: 'The final project. Pairs design Hoot’s job in the new visitor centre: an AI of their own (words or drawings) with at least three labels and a fair check of 60% or more, and a program that uses a variable, a message and an if … else. They test it with “visitors”, check it for bias and evaluate it. The checklist at the top is the success criteria.',
    objective: 'We are learning to design, build, test and evaluate an AI and a program that uses it, bringing together everything from the unit.',
    success: ['I can plan an AI and a program for a real job.', 'I can collect fair, varied data and use the fair check to judge my AI.', 'I can use a variable, a message and an if … else in my program.', 'I can test my project with users, check it for bias and improve it.'],
    curriculum: ['design', 'data', 'ssr', 'safe'],
    words: [['design', 'plan how something will look and work'], ['dataset', 'all the examples you teach an AI with'], ['variable', 'a named store for a value that can change'], ['message', 'a signal one script sends to start others'], ['evaluate', 'decide how well it works, for everyone, and how to make it better']],
    need: [...DEV, 'A planning sheet per pair: the job · labels · where the data will come from · the program (variable, message, if … else) · how we’ll test it for fairness'],
    plan: [
      { min: 8, title: 'The brief', html: '<p>The new visitor centre opens next week, and Hoot will be on the front desk. Each pair designs one job for it. Ideas: sorting the visitor book and counting jobs for the rangers; a “what did you see today?” sightings board; a junior spotters’ quiz with drawings. Open the starter (the visitor book AI, four messages per label) and read the checklist together.</p>' },
      { min: 10, title: 'Plan', html: '<p>Pairs complete the planning sheet. Check each plan has: 3+ labels that really are different, enough varied data (8+ each), a variable, a message, an if … else, and a fairness test (“who might our AI treat unfairly? How will we check?”).</p>' },
      { min: 25, title: 'Make and test', html: '<p>Pupils build in the order they learned: data first (teach, train, fair check, key words or Look inside), then the program, testing as they go. They may keep the visitor book or switch to drawings (Teach it with Drawings). Circulate with the checklist.</p>' },
      { min: 12, title: 'Visitor test', html: '<p>Pairs act as visitors at another pair’s desk and use it three times. The testers note one thing that worked, one thing that was wrong, and anything that seemed unfair. Pairs make one improvement.</p>' },
      { min: 5, title: 'Evaluate and celebrate', html: '<p>Each pair writes three sentences: how well it works (with their fair check result), one fairness check they did, and what they would improve. Celebrate the Wildwood Spotters: data, algorithms, events, loops, selection, variables, messages, fair testing and bias.</p>' }
    ],
    support: 'Keep the visitor book AI and build the example program: if Hoot is sure and it’s a problem, send message new job; when I receive new job, change jobs by 1 and thank the visitor.',
    stretch: 'Use two AIs’ worth of ideas: a drawings quiz with a variable for the target, and messages for right and wrong answers. Or show a report of every label counted.',
    assess: ['Plans and builds an AI with 3+ labels and a fair check of 60% or more', 'Uses a variable, a message and an if … else with the AI’s guesses', 'Tests with users, checks for bias and improves the project'],
    steps: [
      { t: 'Plan', d: 'On your planning sheet: Hoot’s job, your labels, your data, and your program (a variable, a message, an if … else).' },
      { t: 'Data', d: 'Tap 1 Teach. Keep the visitor book or choose Teach it with Drawings. Make 3 or more labels with at least 8 varied examples each.' },
      { t: 'Train and check', d: 'Tap 2 Train & test and press Train. Is the fair check 60% or more? Look inside your AI: is anything unfair?' },
      { t: 'Program', d: 'Tap 3 Code it. Use “when the AI makes a guess”, an if … else, send message and when I receive, and a variable.' },
      { t: 'Test', d: 'Press Run and be 3 visitors: type a message and press Send (or draw and press Done) each time.' },
      { t: 'Visitor test', d: 'Swap with another pair and be their visitors. Fix one thing they found. Is every goal in the checklist ticked?' }
    ]
  }
];

export const SLIDES = {
  'ai-2-tracks': [
    { t: 'Tracks in the mud', lead: 'Whose footprints are these?', b: ['Deer: two pointed halves side by side', 'Fox: a big pad and four toes', 'Duck: three long toes with webbing'], notes: 'Draw the three tracks on the board. Ranger Rosa found them by the pond and wants Hoot to recognise them. Leave them up all lesson.' },
    { t: 'Order the steps', table: [['Step', 'What we do'], ['1', 'Choose the labels'], ['2', 'Collect examples for each label'], ['3', 'Train'], ['4', 'Test with new examples'], ['5', 'Make it better']], q: 'Can we train before we have examples?', notes: 'Pairs order the jumbled cards first, then reveal this table. This is an algorithm: steps in the right order. Making an AI has been decomposed into five smaller jobs.' },
    { t: 'An empty AI', pic: true, b: ['Two labels: thing 1 and thing 2', 'No drawings yet', 'The checklist at the top is our algorithm'], notes: 'Open the starter. Point out the checklist: it ticks itself as each step is done.' },
    { use: 'steps' },
    { t: 'Think', q: 'What happens if we do the steps in a different order?', b: ['Which track did your AI find hardest?', 'Which step did you go back to?'], notes: 'You can’t train with no examples; testing before training tells you nothing; step 5 sends you back to step 2.' }
  ],
  'ai-3-events': [
    { t: 'When … then', b: ['When I clap → stand up', 'When I click my fingers → sit down', 'When I say owl → flap your arms'], q: 'What started each action?', notes: 'Play for a minute. Introduce event: something that happens and starts a script.' },
    { t: 'Hoot’s scripts', pic: true, b: ['when Run is clicked → show a welcome', 'when the AI thinks it’s deer → show A deer walked here!'], q: 'What happens when we draw a fox?', notes: 'Run the starter and draw a deer, then a fox. Nothing happens for the fox: there is no script for that event.' },
    { t: 'One script for each event', lead: 'when the AI thinks it’s fox → show A fox trotted past!', b: ['Event: the AI thinks it’s a fox', 'Outputs: a message and a sound'], notes: 'Build the fox script live. Point out that the show block must be joined under the event, or it never runs.' },
    { use: 'steps' },
    { t: 'Think', q: 'Where else do events start things?', b: ['A doorbell', 'A phone ringing', 'A goal in a football game'], notes: 'Listen for the idea that the event comes first and starts the action. Next lesson: a survey of five tracks, and loops.' }
  ],
  'ai-4-survey': [
    { t: 'Spot the pattern', lead: 'clap, stamp, clap, stamp, clap, stamp, clap, stamp, clap, stamp', q: 'How can I say that more quickly?', notes: '“Clap, stamp, five times.” That is a loop.' },
    { t: 'The survey', pic: true, b: ['Show Draw a track', 'Wait for the next guess', 'Show what it saw', 'Change score by 1', 'Clear the pad'], q: 'How many blocks for 5 tracks? For 100?', notes: 'Open the starter and run it: it stops after 2 tracks because the steps are written out twice.' },
    { t: 'Repeat', lead: 'A count-controlled loop repeats the blocks inside it a set number of times.', b: ['repeat 5 times: the survey steps', 'then: show Survey done!'], q: 'What would happen if Survey done! went inside the loop?', notes: 'It would show five times. Order matters: inside the loop repeats; after the loop runs once.' },
    { use: 'steps' },
    { t: 'Think', q: 'Why is a loop better than copying blocks?', b: ['How many blocks did you change for 8 tracks?'], notes: 'Shorter, fewer mistakes, easier to change: one number. Next lesson someone has muddled Hoot’s program.' }
  ],
  'ai-5-muddle': [
    { t: 'A muddled recipe', b: ['Spread the jam on the plate.', 'Put one slice of bread on top.', 'Repeat 3 times: eat it.'], q: 'What went wrong?', notes: 'Introduce bug and debug. Every step was nearly right: debugging is finding which one.' },
    { t: 'Predict first', pic: true, q: 'How many tracks will the survey ask for? What will the score be? What will Hoot say for a duck?', notes: 'Read the program without running it. Take predictions, then press Run and draw a duck: it says A fox trotted past!' },
    { t: 'How to debug', b: ['Predict what should happen', 'Test: run it and watch', 'Compare: what is different?', 'Change ONE thing', 'Test again'], notes: 'There are three bugs: the wrong label in an event, the repeat number, and change score by 1 outside the loop. Don’t give the third away.' },
    { use: 'steps' },
    { t: 'Think', q: 'Which bug was hardest to find? How did you find it?', notes: 'Bug 3 is usually hardest: nothing looks wrong until you check the score at the end. Testing and comparing found it.' }
  ],
  'ai-6-guide': [
    { t: 'The brief', lead: 'A spotter’s guide: Hoot recognises three things you might see at Wildwood.', b: ['Minibeasts?', 'Leaves?', 'Nests, flowers, trail signs?'], q: 'Why choose things that look different from each other?', notes: 'So the AI can tell them apart. Show the starter: three empty labels and a welcome script.' },
    { t: 'Success criteria', pic: true, b: ['3 labels, 6+ drawings of each', 'Trained and tested', 'An event for each label', 'A repeat loop'], notes: 'The checklist at the top of the starter is the success criteria and ticks itself.' },
    { t: 'Plan first', table: [['My label', 'Sketch', 'Hoot says…'], ['', '', ''], ['', '', ''], ['', '', '']], notes: 'Pairs plan on paper before they open the AI Lab. Check plans for labels that look too alike.' },
    { use: 'steps' },
    { t: 'Star and wish', lead: '“I liked… I wish…”', b: ['Did the AI recognise every label?', 'Did each event work?'], notes: 'Partner test, then one improvement. Celebrate the end of Block 1.' }
  ],
  'ai-7-sure': [
    { t: 'How sure are you?', q: 'Out of 10, how sure are you it’s a fox?', b: ['A clear photo', 'A blurry photo', 'A fox-shaped cloud'], notes: 'Pupils show fingers. Introduce confidence: how sure the AI is, from 0 to 100%.' },
    { t: 'Hoot names everything', pic: true, q: 'Should Hoot say “It’s a duck!” about a dot?', notes: 'Run the starter: draw a fox, then a dot. Point to the line under the pad that shows how sure it was.' },
    { t: 'Selection', lead: 'if how sure the AI is > 80 → name the track, else → “Hmm, I’m not sure. Draw it again!”', b: ['Input: the drawing', 'Condition: more than 80% sure?', 'Selection: if … else picks one'], notes: 'Build it live. A condition is a question that is true or false. Only one of the two parts runs each time.' },
    { use: 'steps' },
    { t: 'Sure but wrong', q: 'Why is Hoot 100% sure a square is a deer?', notes: 'It only knows three labels and must pick one. The if … else catches messy drawings, not things it was never taught. We come back to this in Block 3.' }
  ],
  'ai-8-signs': [
    { t: 'Which way?', lead: 'Two questions, three answers.', b: ['Is it a left arrow? → turn left', 'Else, is it a right arrow? → turn right', 'Else → path closed'], notes: 'Draw it as a flowchart with two diamonds. Walk through it with all three signs.' },
    { t: 'Hoot only knows left', pic: true, q: 'What happens for the right arrow and the no-entry sign?', notes: 'Run the starter and draw each sign. Only the left arrow gets an answer.' },
    { t: 'Nested selection', lead: 'An if … else inside the else of another if … else', b: ['AI thinks it’s left ? → Turn left', 'else: AI thinks it’s right ? → Turn right', 'else → This path is closed'], notes: 'Build it live. Compare with Hoot says what it sees: there, one event per label; here, one script decides.' },
    { use: 'steps' },
    { t: 'Test every path', table: [['Sign drawn', 'Should say', 'Did say'], ['left arrow', 'turn left', ''], ['right arrow', 'turn right', ''], ['no entry', 'path closed', ''], ['a scribble', '?', '']], notes: 'Testing every path is how you find bugs hiding in a path you didn’t try.' }
  ],
  'ai-9-clues': [
    { t: 'Stand up if…', b: ['…you have a pet AND you walked to school', '…you have a pet OR you walked to school'], q: 'Why did more people stand the second time?', notes: 'and: both must be true. or: at least one.' },
    { t: 'Mammal or bird?', pic: true, b: ['Deer: mammal', 'Fox: mammal', 'Duck: bird'], q: 'How can ONE question cover deer and fox?', notes: 'Run the starter: two separate ifs, and nothing for the duck.' },
    { t: 'Truth table: and', table: [['A fox?', 'More than 90% sure?', 'Log it?'], ['yes', 'yes', 'yes'], ['yes', 'no', 'no'], ['no', 'yes', 'no'], ['no', 'no', 'no']], notes: 'Only the first row logs a sighting. Ask pupils to make the same table for “or”.' },
    { use: 'steps' },
    { t: 'Where else?', b: ['Free entry if you are under 5 OR over 65', 'The door opens if the card is right AND it is daytime'], q: 'Can you think of another rule with and or or?', notes: 'Pupils make up rules for the reserve.' }
  ],
  'ai-10-ducks': [
    { t: 'Until…', b: ['Clap 3 times.', 'Keep clapping until I raise my hand.'], q: 'Which could go on for ever?', notes: 'Count-controlled (repeat 3) vs condition-controlled (repeat until).' },
    { t: 'Three ducks?', pic: true, q: 'Duck, fox, duck… why does Hoot say “Three ducks!”?', notes: 'Run the starter with a fox in the middle. repeat 3 counts drawings, not ducks.' },
    { t: 'Repeat until', lead: 'repeat until score = 3: wait for the next guess, if it’s a duck → change score by 1', b: ['The loop checks the condition each time round', 'It stops when the condition is true'], notes: 'The block in Control says repeat while: change it to until. With while, the loop never runs here.' },
    { use: 'steps' },
    { t: 'Which loop?', table: [['Job', 'Count or condition?'], ['Do 10 star jumps', ''], ['Stir until it’s smooth', ''], ['Wait until the bus comes', ''], ['Sing the chorus twice', '']], notes: 'Card sort in pairs.' }
  ],
  'ai-11-patrol': [
    { t: 'Trace it', code: 'score = 0\nrepeat until score < 2:\n    add 1 to score\nsay done', q: 'How many times does the loop run?', notes: 'None: 0 < 2 is already true. Trace it together in a table.' },
    { t: 'The night patrol', pic: true, b: ['Watch until 2 foxes', 'Count a fox only when sure', 'Else: keep watching'], q: 'Why does the patrol end straight away?', notes: 'Run the starter and draw a fox. Patrol over, no foxes counted.' },
    { t: 'Trace table', table: [['Step', 'score', 'Condition true?', 'Hoot shows'], ['start', '0', '', ''], ['', '', '', ''], ['', '', '', '']], notes: 'Pairs trace before changing anything. Three bugs: the loop condition, the wait outside the loop, and < instead of >.' },
    { use: 'steps' },
    { t: 'Think', q: 'What do you check first when a loop ends too soon, or never ends?', notes: 'The condition, and which blocks are inside or outside the loop.' }
  ],
  'ai-12-gate': [
    { t: 'The secret meadow', lead: 'Draw the right trail signs to open the gate.', pic: true, notes: 'Open the starter: the trail signs AI, trained, and a gate that is closed.' },
    { t: 'Success criteria', b: ['An if … else', 'A loop that checks a condition', 'A comparison, and or or', 'Uses what the AI thinks', 'Tested 3 times in one run', 'The gate opens'], notes: 'The checklist at the top ticks itself.' },
    { t: 'An example rule', b: ['Three right arrows in a row', 'Hoot must be sure each time', 'A wrong sign starts again'], q: 'What rule will you design?', notes: 'Pupils can use this rule or design their own (left then right, two closed signs…).' },
    { use: 'steps' },
    { t: 'Can you trick it?', q: 'Can your tester open the gate without the password?', notes: 'If they can, that is a bug to fix. Celebrate the end of Block 2.' }
  ],
  'ai-14-target': [
    { t: 'Remember it', lead: 'A variable is a named store for a value that can change.', b: ['target: the track Hoot asked for', 'goes: how many turns so far'], notes: 'Use sticky notes labelled target and goes in the warm up.' },
    { t: 'Hoot forgets', pic: true, q: 'Can Hoot tell you if you drew the right track?', notes: 'Run the starter. “a random label” picks again every time it is used, so Hoot can’t check.' },
    { t: 'Set, change, compare', b: ['set target to a random label', 'show Draw a … track! (with target)', 'change goes by 1', 'if AI’s guess = target → change score by 1'], notes: 'Variables → Create variable… makes target and goes.' },
    { use: 'steps' },
    { t: 'Variable detectives', table: [['After…', 'target', 'goes', 'score'], ['set up', '', '0', '0'], ['round 1', '', '', ''], ['round 2', '', '', '']], notes: 'Pupils predict each value, then check by running.' }
  ],
  'ai-15-alert': [
    { t: 'Pass the message', b: ['Lookout: sees the fox, holds up “fox alert”', 'Siren: hears “fox alert”, goes nee-naw', 'Counter: hears “fox alert”, adds a tally mark'], notes: 'Act it out. The siren and counter never look at the pictures: they only listen for the message.' },
    { t: 'Too much for one script', pic: true, b: ['Alarm colour', 'Alarm sound', 'A message for the rangers', 'Count the foxes', 'All clear for other tracks'], notes: 'Decompose the job into scripts that talk with messages.' },
    { t: 'Messages', lead: 'send message fox alert → every “when I receive fox alert” script starts', b: ['The guess script decides', 'The receiving scripts do the jobs'], notes: 'The message names must match exactly.' },
    { use: 'steps' },
    { t: 'Where else?', b: ['A fire alarm', 'A doorbell', 'A school bell'], q: 'Who sends the message? Who receives it?', notes: 'A fire alarm sends to the bells and to the fire station.' }
  ],
  'ai-16-book': [
    { t: 'Sort the book', b: ['What a lovely walk', 'The bins are overflowing', 'Is there a café?'], q: 'Praise, problem or question? Which words gave it away?', notes: 'Thumbs up, thumbs down or a question mark.' },
    { t: 'A missing label', pic: true, q: 'Hoot reads “where is the car park?” as … ?', notes: 'Train the starter and test it: with no question label it has to pick praise or problem.' },
    { t: 'Words become numbers', lead: 'Hoot counts which words, pairs of words and bits of words are in a message.', b: ['“bins are full” → bins · are · full · bins are · are full · bin · ful …', 'A message becomes a long list of numbers: data'], notes: 'It doesn’t understand like we do. That is why the same idea said different ways helps it.' },
    { use: 'steps' },
    { t: 'Judge it', b: ['The fair check: right out of tried', 'The key words: do they make sense?', 'New messages from a partner'], q: 'What made your AI better: more messages, or more different messages?', notes: 'Next lesson: what if the visitor book teaches Hoot something unfair?' }
  ],
  'ai-17-fair': [
    { t: 'A complaint', lead: '“I wrote that my dog had a great time, and Hoot put it in the complaints pile!”', q: 'Why might Hoot do that?', notes: 'Take ideas. Introduce bias.' },
    { t: 'Investigate', pic: true, table: [['Message', 'Hoot said', 'Fair?'], ['my dog had a great time', '', ''], ['our dog loved the woods', '', ''], ['the path by the lake is flooded', '', ''], ['the bins are full', '', '']], notes: 'Test the messages and fill in the table. Then open Look inside your AI: dog is a key word for problem.' },
    { t: 'Where bias comes from', lead: 'In Hoot’s examples, every message about a dog was a problem.', b: ['Hoot learned the pattern: dog → problem', 'It isn’t being unkind on purpose', 'The data was unbalanced'], notes: 'Fixing bias means making the data show a fairer picture, not just deleting words.' },
    { use: 'steps' },
    { t: 'Who decides?', q: 'Should Hoot delete messages it thinks are complaints?', b: ['What should a person check?', 'Where else is AI used to sort people’s things?'], notes: 'Job applications, photos, messages. People must check and challenge AI decisions.' }
  ],
  'ai-18-centre': [
    { t: 'The visitor centre', lead: 'Hoot is on the front desk. What job will you give it?', b: ['Sort the visitor book and count jobs', 'A sightings board', 'A junior spotters’ quiz'], pic: true, notes: 'Open the starter: the visitor book AI with four messages per label, and a welcome script.' },
    { t: 'Success criteria', b: ['3+ labels, 8+ examples each', 'Fair check 60% or more', 'A variable, a message and an if … else', 'Tested with 3 visitors'], notes: 'The checklist at the top ticks itself.' },
    { t: 'Plan', table: [['Hoot’s job', 'Labels', 'Data from', 'Variable', 'Message', 'If … else']], q: 'Who might your AI treat unfairly? How will you check?', notes: 'Every plan includes a fairness check.' },
    { use: 'steps' },
    { t: 'Evaluate', b: ['How well does it work? (fair check)', 'One fairness check we did', 'What we would improve'], notes: 'Celebrate the Wildwood Spotters: data, algorithms, events, loops, selection, variables, messages, fair testing and bias.' }
  ]
};
