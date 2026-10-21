// The Critter Lab's lesson unit — see lessons/units/README.md. lessons.js merges it in.
// CRITTER WORKSHOP: the class are apprentice engineers at Nell’s Critter Workshop in the valley village of Fernhollow. Every lesson a
// villager brings a job card (carry the post, patrol the duck pond, clear a rockfall…) and the class design, test and improve a Critter
// for it. The Critter Lab has no code blocks, so the unit maps the usual primary computing order onto the lab’s own computing:
// Block 1 Apprentice builders (Years 3–4): algorithms and sequence (the foot loop), decomposition, repetition (the movement cycle),
// debugging · Block 2 Critters that sense and decide (Years 4–5): input (the angle to the target), selection (the turning rule:
// if the target is to the left, the left legs take shorter steps, else…), comparison (better or worse?), loops that check a
// condition (repeat until), debugging conditions and loops · Block 3 Critter science (Years 5–6): variables and fair tests, data
// (tables and graphs from the Results table), reuse (one leg copied = one procedure used twice, its Length an input), combining it all.
// Lesson 6 of each block is a design-and-make project. The Critter Lab’s two earlier lessons (critter-builders, critter-engineers) are
// folded in with { adopt }. Starters, answers and goals: lessons/builds/critter/workshop.mjs; test: tests/unit-critter.test.mjs.
// The goals checklist and the Results table were added to the Critter Lab for this unit (critter/critter-goals.js).
const N = 'Critter Workshop';
const u = m => `${N} · Block ${Math.ceil(m / 6)} · Lesson ${m}`; // m counts on through the whole unit
const C = { ks: 'ks2', minutes: 60, type: 'critter', tool: 'Critter Lab (3D)' };
const B1 = { ...C, years: 'Years 3–4' }, B2 = { ...C, years: 'Years 4–5' }, B3 = { ...C, years: 'Years 5–6' };
const DEV = ['A device per pupil or pair (the Critter Lab needs the internet the first time it opens)', 'The board, to show the class first'];

export const LESSONS = [
  // ═══════════════════════ BLOCK 1 · APPRENTICE BUILDERS (Years 3–4) ═══════════════════════
  { adopt: 'critter-builders', unit: u(1) },
  {
    id: 'workshop-2-loop', unit: u(2), title: 'The foot loop', ...B1,
    summary: 'Trundle, the workshop’s new walker, shuffles nowhere. Each foot follows a loop of points, one after another, every cycle: an algorithm. Pupils read the loop as a sequence (push back, lift, swing forwards, put down), find that it runs the wrong way round, fix the order with Reverse and prove the fix with a test.',
    objective: 'We are learning that the order of the steps in an algorithm matters, and to fix a sequence that is in the wrong order.',
    success: ['I can describe a foot loop as a sequence of steps.', 'I can explain why the order of the steps matters.', 'I can fix the order and test to show it worked.'],
    curriculum: ['design', 'reason'],
    words: [['algorithm', 'a set of steps, in order, to do a job'], ['sequence', 'the order the steps go in'], ['cycle', 'one go round the loop; then it starts again'], ['debug', 'find what is wrong and fix it']],
    need: [...DEV, 'Paper for drawing a foot loop'],
    plan: [
      { min: 8, title: 'Welcome back to the Workshop', html: '<p>Remind the class that they are apprentices at <b>Nell’s Critter Workshop</b> in Fernhollow. Nell has built a new walker, <b>Trundle</b>, for the miller, but it hardly moves.</p><p>Warm up: everyone stands and walks on the spot in slow motion. <b>Ask:</b> what does one foot do, step by step? Write the class’s steps on the board: <b>1 put the foot down in front · 2 push it back along the floor · 3 lift it · 4 swing it forwards</b>. Then do it again… and again. That is a <b>cycle</b>. Now walk with the steps backwards (lift at the front, push forwards along the floor). <b>Ask:</b> where do you end up?</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter. Press <b>Test it!</b>: Trundle rocks and shuffles about a metre in the Sprint. Press <b>Build</b>, click a <b>Foot pad</b> and open its <b>Motion</b> tab. Point out the white loop of points under the foot and the arrows: the foot follows the points <b>in order</b>, once every cycle. That loop is the foot’s <b>algorithm</b>.</p><p><b>Ask:</b> follow the arrows. Is the foot pushing back when it touches the ground, or is it lifted? (It is lifted at the back and pushes forwards along the ground: the sequence is the wrong way round.)</p>' },
      { min: 25, title: 'Debug the sequence', html: '<p>Pupils follow the Lesson card. They test first (one row in the Results table), then press <b>Reverse</b> on a front foot (its twin on the other side changes too) and on a back foot, and test again: Trundle now walks about <b>5 m</b>. The goals checklist at the top ticks itself.</p><p>Fast finishers draw Trundle’s loop on paper as four numbered points with arrows, then try <b>Lift higher</b> or <b>Longer steps</b> and test after each change.</p>' },
      { min: 12, title: 'Show and explain', html: '<p>Open <b>Results</b> on the board to show a before and after. <b>Ask:</b> the steps were the same four points before and after: what changed? (Only the order.) Where else does order matter? (Getting dressed, a recipe, brushing teeth.)</p>' },
      { min: 5, title: 'Plenary', html: '<p>Everyone says the foot’s algorithm aloud in the right order. Next lesson: Nell asks us to build a Critter from a parts list.</p>' }
    ],
    support: 'Work in pairs: one reads the loop’s arrows aloud, one clicks. Show the Reverse button on the board.',
    stretch: 'Click a point on the loop and drag it to make a loop of your own. Test it. Can you make Trundle faster than 5 m?',
    assess: ['Describes the foot loop as steps in order', 'Explains that the order, not the steps, was the bug', 'Tests before and after the change'],
    steps: [
      { t: 'Test Trundle', d: 'Press Test it! and watch the Sprint. How far does Trundle get?' },
      { t: 'Find the loop', d: 'Press Build. Click a Foot pad (the green part at the bottom of a leg) and open its Motion tab. Follow the white loop’s arrows.' },
      { t: 'Spot the bug', d: 'When the foot is on the ground, does it push backwards? Or is it going the wrong way round?' },
      { t: 'Reverse the front', d: 'Press Reverse. The loop now goes the other way round, on this foot and its twin.' },
      { t: 'Reverse the back', d: 'Click a back Foot pad, open its Motion tab and press Reverse too.' },
      { t: 'Test again', d: 'Press Test it! How far now? Press Results to see before and after.' }
    ]
  },
  {
    id: 'workshop-3-parts', unit: u(3), title: 'Lizzie’s parts list', ...B1,
    summary: 'The farmer needs a lookout to walk the hills. Pupils decompose the job into smaller problems (moving, seeing the way, getting over bumps), match each one to a part, build Lizzie part by part from the list, and test each part does its job.',
    objective: 'We are learning to decompose a big problem into smaller parts and solve them one at a time.',
    success: ['I can break a big job into smaller jobs.', 'I can match each small job to a part of my Critter.', 'I can build and test one part at a time.'],
    curriculum: ['design'],
    words: [['decompose', 'break a big problem into smaller ones'], ['part', 'one piece of a bigger design'], ['plan', 'what you will do, written down first'], ['test', 'try it to see if it works']],
    need: [...DEV, 'A parts-list sheet: job · part · done?'],
    plan: [
      { min: 8, title: 'A big job', html: '<p>The farmer in Fernhollow wants a <b>lookout</b> that walks the bumpy hills and keeps its eyes on where it is going. <b>Ask:</b> that is a big job. What smaller jobs is it made of? Collect ideas and sort them into three: <b>move</b>, <b>see the way</b>, <b>get over the bumps</b>. Introduce <b>decompose</b>.</p><p>Make a parts list on the board: move → <b>Long leg</b> pairs · see → a <b>Neck & head</b> that turns to the target · bumps → test it in <b>Hurdles</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter: Lizzie is just a body. Show that every part hangs from another part: you <b>click the body</b> first, then tap <b>Long leg</b>, so the legs hang from the body (not from the last part you added). Drag <b>Neck & head</b> onto the <b>front</b> of the body (the end with the eyes). Show the goals checklist at the top: it is the parts list.</p>' },
      { min: 27, title: 'Build it part by part', html: '<p>Pupils follow the Lesson card, ticking their paper list as each part goes on and testing after each one. Two pairs of Long legs and a head give a lookout that walks about 5 m in the Sprint and in Hurdles.</p><p>Circulate: “Which job does that part solve? How do you know it works?” If a leg ends up hanging from a foot, press <b>Undo</b>, click the body, and tap again.</p>' },
      { min: 10, title: 'Share', html: '<p>Two pairs show Lizzie and talk through their list. <b>Ask:</b> was it easier to build from a list? Which part would you build first next time, and why?</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> where else do we decompose? (A project into chapters, a meal into dishes, a game into levels.) Next lesson: how often the legs repeat their loop.</p>' }
    ],
    support: 'Give a parts-list sheet with the three jobs already written; pupils add the part names.',
    stretch: 'Add a fourth job of your own (balance? style?) and a part for it, for example a Tail. Test: does it help or hurt? Keep it only if it helps.',
    assess: ['Breaks the job into smaller jobs', 'Matches parts to jobs', 'Builds and tests one part at a time'],
    steps: [
      { t: 'Read the list', d: 'Lizzie needs to: move, see the way, and get over bumps. Look at the goals at the top.' },
      { t: 'Move: first legs', d: 'Click the green body. Tap Long leg under Limbs. A pair sticks on underneath.' },
      { t: 'Move: more legs', d: 'Click the body again, then tap Long leg again. Now there are four feet.' },
      { t: 'See: a head', d: 'Drag Neck & head onto the front of the body. It turns to look at the red target.' },
      { t: 'Bumps: test it', d: 'Press Test it! for the Sprint. Then choose Hurdles and press Go!' },
      { t: 'Check the list', d: 'Is every goal ticked? Which part did each job?' }
    ]
  },
  {
    id: 'workshop-4-cycles', unit: u(4), title: 'Count the cycles', ...B1,
    summary: 'Dash must carry the baker’s bread across the valley, fast. Every leg repeats the same loop again and again: count-controlled repetition. Pupils count how many times the loop repeats in a 15-second Sprint, predict what a shorter cycle will do, and test three cycle speeds.',
    objective: 'We are learning that repetition does the same steps again and again, and that changing how many times they repeat changes the result.',
    success: ['I can count how many times a cycle repeats.', 'I can predict what changing the cycle speed will do.', 'I can test three cycle speeds and say which was best.'],
    curriculum: ['design', 'ssr'],
    words: [['repeat', 'do the same steps again'], ['cycle', 'one go round the loop'], ['count-controlled', 'repeat a set number of times'], ['predict', 'say what you think will happen before you test']],
    need: [...DEV, 'Mini whiteboards for predictions'],
    plan: [
      { min: 8, title: 'Repeat after me', html: '<p>Clap a pattern (clap, clap, stamp) and ask the class to repeat it 4 times. Then 8 times, faster. <b>Ask:</b> in 10 seconds, would we do more patterns slowly or quickly? Introduce <b>repeat</b> and <b>cycle</b>.</p>' },
      { min: 10, title: 'Meet Dash', html: '<p>Open the starter and press <b>Test it!</b>. Dash wobbles but goes nowhere. Press <b>Build</b>, click the <b>body</b> and open its <b>Motion</b> tab. The <b>Cycle speed</b> slider shows how long one cycle takes: “1.78 s a cycle”. Every leg does its loop once each cycle.</p><p><b>Ask:</b> the Sprint lasts 15 seconds. About how many cycles is that? (15 ÷ 1.78 ≈ 8.) What if a cycle took 0.58 s? (About 26.)</p>' },
      { min: 25, title: 'Predict, test, record', html: '<p>Pupils follow the Lesson card. For each cycle speed they <b>predict</b> on a whiteboard, then test. Cycle speed 4 goes nowhere, 6 creeps along, and 9 (0.58 s a cycle, about 26 repeats) runs about 8 m. Every test goes in the <b>Results</b> table.</p><p>Fast finishers try 10. Is the fastest always the best? (No: at 10 it goes a little less far. More repeats only help while the legs can keep up.)</p>' },
      { min: 12, title: 'Share', html: '<p>Open Results on the board. <b>Ask:</b> how many repeats in 15 seconds at each speed? Which went furthest? Did your prediction match?</p>' },
      { min: 5, title: 'Plenary', html: '<p>Repetition means we write the loop once and the Critter does it again and again. Next lesson: Nell’s broken Critter needs debugging.</p>' }
    ],
    support: 'Give the number of cycles for each speed on a card so pupils only predict further or not as far.',
    stretch: 'Work out the number of cycles for every speed from 1 to 10 (15 ÷ seconds a cycle). Which speed does Dash like best?',
    assess: ['Counts or calculates the number of repeats', 'Makes a prediction before testing', 'Records results and names the best setting'],
    steps: [
      { t: 'Test Dash', d: 'Press Test it! and watch the Sprint. How far does Dash get?' },
      { t: 'Find the cycle', d: 'Press Build. Click the body and open its Motion tab. How many seconds is one cycle?' },
      { t: 'Count', d: 'The Sprint lasts 15 seconds. How many cycles is that? Write it down.' },
      { t: 'Predict and test 6', d: 'Move Cycle speed to 6. Will Dash go further? Predict, then press Test it!' },
      { t: 'Predict and test 9', d: 'Move Cycle speed to 9 and test again. How many cycles now?' },
      { t: 'Look back', d: 'Press Results. Which cycle speed went furthest?' }
    ]
  },
  {
    id: 'workshop-5-bugs', unit: u(5), title: 'Bug hunt: fix Bramble', ...B1,
    summary: 'Bramble the hedge-trimmer has three bugs and barely moves. Pupils test, look for one bug at a time (a foot loop the wrong way round, slippy feet, weak muscles), fix it, and test again after each fix, recording what each fix did.',
    objective: 'We are learning to debug: test, find one bug, fix it and test again.',
    success: ['I can test to find out what is going wrong.', 'I can fix one bug at a time and test after each fix.', 'I can explain what each fix changed.'],
    curriculum: ['reason', 'design'],
    words: [['bug', 'a mistake that stops something working'], ['debug', 'find and fix the bugs'], ['grip', 'how much a part sticks to the ground'], ['muscle power', 'how strongly every joint pushes']],
    need: [...DEV, 'A bug-hunt sheet: what I saw · what I fixed · how far now'],
    plan: [
      { min: 7, title: 'Bug hunters', html: '<p>Nell’s hedge-trimmer, <b>Bramble</b>, has stopped working. She thinks there are <b>three bugs</b>. <b>Ask:</b> if three things are wrong, should we fix them all at once? Why not? (We would not know which fix worked.) Remind the class: <b>test, find one bug, fix it, test again</b>.</p>' },
      { min: 8, title: 'Show me', html: '<p>Open the starter and press <b>Test it!</b>: Bramble shuffles about. Press <b>Build</b> and model looking for clues: click a <b>back Foot pad</b> and open <b>Motion</b>. Compare its loop with a front foot’s loop (one goes the other way round: the same bug as Trundle). Do not fix it yet.</p>' },
      { min: 30, title: 'Hunt and fix', html: '<p>Pupils follow the Lesson card, one bug at a time, testing after each fix and writing what happened:</p><ul><li><b>Bug 1</b>: the back loop goes the wrong way round → <b>Reverse</b> it.</li><li><b>Bug 2</b>: the feet are <b>Slippy</b> (Shape tab, Grip) → make them <b>Grippy</b> (front pair and back pair).</li><li><b>Bug 3</b>: the body’s <b>Muscle power</b> is only 50% → set it to <b>100%</b>.</li></ul><p>Bramble only walks well (about 5 m) once all three are fixed, so pupils will see small changes after the first two fixes: that is normal, and a good discussion point.</p>' },
      { min: 10, title: 'Share', html: '<p>Open <b>Results</b> on the board. <b>Ask:</b> which fix made the biggest difference? Why did the first fixes seem to do little? (The other bugs were still holding it back.)</p>' },
      { min: 5, title: 'Plenary', html: '<p>Recap the debugging loop: test → find → fix → test. Next lesson is a project: design a Critter for the post office.</p>' }
    ],
    support: 'Tell pupils where each bug is (back foot, all feet, body) and let them find what is wrong there.',
    stretch: 'Swap with a partner: add one bug to their Critter for them to find. Can they find it by testing?',
    assess: ['Tests before changing anything', 'Fixes one bug at a time and tests after each', 'Explains what each fix did'],
    steps: [
      { t: 'Test Bramble', d: 'Press Test it! and watch. Write down how far Bramble gets.' },
      { t: 'Bug 1: the loops', d: 'Press Build. Click a back Foot pad, open Motion. Is its loop the wrong way round? Press Reverse. Test.' },
      { t: 'Bug 2: the grip', d: 'Click a Foot pad, open Shape. Grip says Slippy! Press Grippy. Do the same on the other pair. Test.' },
      { t: 'Bug 3: the muscles', d: 'Click the body, open Motion. Muscle power is 50%. Slide it to 100%. Test.' },
      { t: 'Look back', d: 'Press Results. Type next to each test what you fixed. Which fix helped most?' }
    ]
  },
  {
    id: 'workshop-6-post', unit: u(6), title: 'Project: the Post Critter', ...B1,
    summary: 'A design-and-make project. The Fernhollow post office needs a Critter to carry letters along the lane and over the bumpy bridge. Pupils plan a design on paper, build it from a bare body using everything from Block 1 (parts, foot loops, cycle speed, debugging), test it in Sprint and Hurdles and improve it.',
    objective: 'We are learning to plan, build, test and improve our own design to meet a brief.',
    success: ['I can plan my design before I build it.', 'I can build and test my design.', 'I can improve it using test results, and say what I changed.'],
    curriculum: ['design', 'reason'],
    words: [['brief', 'what the design must do'], ['plan', 'drawing and notes made before building'], ['evaluate', 'judge how well it meets the brief'], ['improve', 'change it to make it better']],
    need: [...DEV, 'A planning sheet: sketch · parts list · tests'],
    plan: [
      { min: 8, title: 'The brief', html: '<p>Read the job card from the post office: <b>walk the lane (Sprint 3 m or more) and cross the bumpy bridge (Hurdles 3 m or more), with at least four walking feet, a name and its own colours</b>. Show the goals checklist: it is the brief.</p>' },
      { min: 10, title: 'Plan', html: '<p>Pairs sketch their Critter and write a parts list in order, like Lizzie’s. Remind them: click the <b>body</b> before tapping a limb. Check plans before anyone builds: “Which part does which job?”</p>' },
      { min: 27, title: 'Build, test, improve', html: '<p>Pupils build from their plan and test in <b>Sprint</b> and <b>Hurdles</b>. If it doesn’t meet the brief, they debug one thing at a time: the foot loops (Reverse, Longer steps, Lift higher), the grip, the cycle speed. Everything goes in the <b>Results</b> table with a note.</p><p>A Critter with two pairs of Long legs and a Neck & head meets the brief, but encourage pupils’ own ideas.</p>' },
      { min: 10, title: 'Post office trial', html: '<p>Pairs show their Critter on the board and run Hurdles. The class checks it against the brief.</p>' },
      { min: 5, title: 'Evaluate', html: '<p>Each pair writes one sentence: “Our design meets the brief because… Next time we would…”. Celebrate the end of Block 1.</p>' }
    ],
    support: 'Start from the Lizzie plan and change one thing. Pairs can keep a printed parts list beside them.',
    stretch: 'Make it meet the brief with the fewest parts you can. Or reach 6 m in Hurdles.',
    assess: ['Plans before building', 'Tests against the brief and records results', 'Improves the design and explains the change'],
    steps: [
      { t: 'Read the brief', d: 'Look at the goals at the top. That is what the post office needs.' },
      { t: 'Plan it', d: 'Draw your Critter on paper and write your parts list in order.' },
      { t: 'Build it', d: 'Click the body, then tap a limb. Click the body again for the next one. Follow your plan.' },
      { t: 'Test it', d: 'Press Test it! for the Sprint. Then choose Hurdles and press Go!' },
      { t: 'Improve it', d: 'Change one thing, then test. Better? Keep it. Worse? Press Undo.' },
      { t: 'Make it yours', d: 'Type a new name in the box at the top. Click parts and pick colours on their Shape tab.' }
    ]
  },

  // ═══════════════════════ BLOCK 2 · CRITTERS THAT SENSE AND DECIDE (Years 4–5) ═══════════════════════
  {
    id: 'workshop-7-sense', unit: u(7), title: 'Which way is the flag?', ...B2,
    summary: 'Scout patrols the duck pond, following eight flags round a circle. Every moment, Scout senses one input: how far the next flag is off to the left or right. Pupils explore inputs in Free roam, then find that Scout reacts too hard to small changes (it zig-zags) and set how far off course it must be before it turns hard.',
    objective: 'We are learning that a computer system takes an input, decides what to do and gives an output.',
    success: ['I can name the input Scout senses and its outputs.', 'I can explain how the input changes what Scout does.', 'I can change a setting so Scout follows all the flags.'],
    curriculum: ['ssr', 'design'],
    words: [['input', 'information that goes into a system, like the direction of the target'], ['output', 'what the system does, like moving its legs'], ['sense', 'find out something about the world'], ['system', 'parts that work together']],
    need: [...DEV],
    plan: [
      { min: 8, title: 'Be a sensor', html: '<p>A volunteer is blindfolded; a partner says “left”, “right” or “straight” to guide them to a chair. <b>Ask:</b> what was the input (the words)? What was the output (the walking)? Who decided? Introduce <b>input</b>, <b>output</b> and <b>system</b>.</p><p>Block 2 story: the village’s ducks need a patrol round the pond, and Nell has built <b>Scout</b>.</p>' },
      { min: 10, title: 'Free roam', html: '<p>Open the starter, press <b>Test it!</b> and choose <b>Free roam</b>. Tap the ground to move the red target. Scout turns towards it. <b>Ask:</b> how does Scout know where to go? Every moment it senses one input: how many degrees the target is off to its left or right. Its outputs: the steps of its legs.</p>' },
      { min: 25, title: 'Round the pond', html: '<p>Pupils follow the Lesson card. In <b>Lap</b> (tick <b>Turbo</b> to speed it up) Scout zig-zags and misses flags: it gets 6 of 8. Its <b>Turning smoothness</b> is 0%, so even a tiny change in the input makes it turn as hard as it can. Raising it to 20% or more means it waits until it is further off course before turning hard, and Scout completes the full lap.</p><p>Ask pupils to watch Scout’s path before and after: zig-zag, then a smooth curve.</p>' },
      { min: 12, title: 'Share', html: '<p><b>Ask:</b> what was Scout’s input? What were its outputs? What did smoothness change: the input, the output, or how Scout decides? (How it decides: how big the input must be before it turns hard.)</p>' },
      { min: 5, title: 'Plenary', html: '<p>Where else do machines sense and react? (Automatic doors, thermostats, a car’s parking sensor.) Next lesson: the rule Scout uses to decide which way to turn.</p>' }
    ],
    support: 'Draw input → decide → output on the board with Scout’s parts written in each box.',
    stretch: 'Try smoothness 100%. Is it still a full lap? Is it faster or slower? (Look at the time.)',
    assess: ['Names the input and the outputs', 'Explains how the input affects what Scout does', 'Changes the setting and tests to show it worked'],
    steps: [
      { t: 'Free roam', d: 'Press Test it! and choose Free roam. Tap the ground to move the red target. Watch Scout turn.' },
      { t: 'Try the Lap', d: 'Choose Lap, tick Turbo and press Go!. How many flags does Scout reach?' },
      { t: 'Find the setting', d: 'Press Build. Click the body, open Motion. Look at Turning smoothness: 0%.' },
      { t: 'Smooth it', d: 'Slide Turning smoothness to 50%. Scout now waits until it is more off course before turning hard.' },
      { t: 'Test again', d: 'Press Test it!, choose Lap and press Go!. Does Scout follow all 8 flags?' }
    ]
  },
  {
    id: 'workshop-8-turns', unit: u(8), title: 'If left, then…', ...B2,
    summary: 'Every Critter steers with the same rule: if the target is to the left, the legs on the left take shorter steps, else the legs on the right do. Pupils act out the rule, write it as if … then … else, and use Turning sharpness (how much shorter the inside steps get) to stop Spinner spinning in circles.',
    objective: 'We are learning how selection (if … then … else) makes a system choose between actions.',
    success: ['I can say the steering rule as if … then … else.', 'I can explain what each part of the rule makes the Critter do.', 'I can test different settings and choose the best one.'],
    curriculum: ['ssr', 'reason'],
    words: [['selection', 'choosing what to do depending on a condition'], ['condition', 'something that is true or false, like “the target is to the left”'], ['if … then … else', 'if the condition is true do one thing, otherwise do another'], ['sharpness', 'how much shorter the inside steps get when turning']],
    need: [...DEV, 'Two cones or chairs for the warm-up'],
    plan: [
      { min: 10, title: 'Act out the rule', html: '<p>Pairs link arms and walk towards a cone. Rule: <b>if</b> the cone is to your left, <b>then</b> the left person takes small steps, <b>else</b> the right person takes small steps. They reach it! Now try “the inside person walks <b>backwards</b>”: they spin on the spot. Introduce <b>selection</b>, <b>condition</b>, <b>if … then … else</b>.</p>' },
      { min: 10, title: 'Meet Spinner', html: '<p>Open the starter, press <b>Test it!</b>, choose <b>Lap</b>, tick <b>Turbo</b> and <b>Go!</b>. Spinner turns round and round and reaches only 2 flags. Press <b>Build</b>, click the body, open <b>Motion</b>: <b>Turning sharpness</b> is 100%, so on every turn the inside legs don’t just take shorter steps, they walk backwards. Write the rule on the board with the sharpness in it.</p>' },
      { min: 25, title: 'Test the settings', html: '<p>Pupils follow the Lesson card and test sharpness 100%, 80% and 50%, recording flags each time. At 80% it still spins; at 50% Spinner follows about 7 flags. Each test goes in <b>Results</b>.</p><p>Fast finishers write the rule for a Critter that turns gently and for one that pivots on the spot.</p>' },
      { min: 10, title: 'Share', html: '<p>Open Results on the board. <b>Ask:</b> which part of the rule did sharpness change: the condition, the then, or the else? (What happens in then and else: how much shorter the inside steps get.)</p>' },
      { min: 5, title: 'Plenary', html: '<p>Say the rule together. Next lesson: comparing results to decide whether a change is better or worse.</p>' }
    ],
    support: 'Give the rule as a fill-the-gap sentence: if the target is to the ____, then the ____ legs take shorter steps, else the ____ legs do.',
    stretch: 'Find the highest sharpness that still follows 6 flags or more (try 60%, 70%). Explain why too much is a problem.',
    assess: ['Says the rule as if … then … else', 'Explains what sharpness changes', 'Tests several settings and picks one using results'],
    steps: [
      { t: 'Watch Spinner', d: 'Press Test it!, choose Lap, tick Turbo and press Go!. What goes wrong?' },
      { t: 'Read the rule', d: 'If the target is to the left, then the left legs take shorter steps, else the right legs do.' },
      { t: 'Find sharpness', d: 'Press Build. Click the body, open Motion. Turning sharpness is 100%: the inside legs walk backwards!' },
      { t: 'Try 80%', d: 'Slide Turning sharpness to 80%. Test the Lap again. How many flags?' },
      { t: 'Try 50%', d: 'Slide it to 50% and test again. Does Spinner stop spinning?' },
      { t: 'Compare', d: 'Press Results. Which sharpness was best?' }
    ]
  },
  {
    id: 'workshop-9-better', unit: u(9), title: 'Better or worse?', ...B2,
    summary: 'Hilda must climb the hill trail. Pupils use comparison (greater than, less than, equal to) to decide after every test: if the new result is greater than the old one, keep the change, else Undo. One idea makes Hilda worse and another much better, so the comparison matters.',
    objective: 'We are learning to compare results with > , < and = and use the comparison to decide what to keep.',
    success: ['I can compare two results with >, < or =.', 'I can use a comparison to decide whether to keep a change.', 'I can explain my decision with numbers.'],
    curriculum: ['reason', 'ssr'],
    words: [['compare', 'look at two things to see which is bigger'], ['greater than (>)', 'bigger than'], ['less than (<)', 'smaller than'], ['operator', 'a symbol like > that compares or works things out']],
    need: [...DEV, 'Mini whiteboards'],
    plan: [
      { min: 8, title: 'Higher or lower', html: '<p>Play “higher or lower” with number cards. Write two results on the board: 7.2 and 6.9. <b>Ask:</b> which symbol goes between them? (7.2 > 6.9.) Introduce <b>compare</b> and the <b>operators</b> >, < and =.</p>' },
      { min: 10, title: 'The decision rule', html: '<p>Open the starter, press <b>Test it!</b>, choose <b>Hurdles</b> and <b>Go!</b>: Hilda gets about 7.2 m. Write the rule we will use all lesson: <b>if new result > best result then keep the change, else Undo</b>. Show that the result card says <b>New best!</b> only when the comparison is true.</p>' },
      { min: 25, title: 'Try, compare, decide', html: '<p>Pupils follow the Lesson card. They try <b>Lift higher</b> on both foot pairs: about 6.9 m. 6.9 < 7.2, so <b>Undo</b>. Then <b>Longer steps</b> on both foot pairs: about 9.7 m. 9.7 > 7.2: keep it! They write each comparison on a whiteboard before deciding.</p><p>Fast finishers try more changes, comparing every time.</p>' },
      { min: 12, title: 'Share', html: '<p>Open <b>Results</b> on the board and read the comparisons. <b>Ask:</b> what would you do if the new result = the old one? (Either: say which you would choose and why.)</p>' },
      { min: 5, title: 'Plenary', html: '<p>Computers compare all the time: “if score > high score then…”. Next lesson: repeat until the job is done.</p>' }
    ],
    support: 'Give a comparison sheet: old result ___ new result, circle > < =, keep or undo?',
    stretch: 'Press Longer steps twice. Compare again. Is two times better than once?',
    assess: ['Writes comparisons correctly with >, <, =', 'Keeps or undoes a change because of a comparison', 'Explains decisions with numbers'],
    steps: [
      { t: 'Test Hilda', d: 'Press Test it!, choose Hurdles and press Go!. Write down the distance.' },
      { t: 'Idea 1: Lift higher', d: 'Press Build. Click a front foot (the lower part of a leg with a white loop), open Motion, press Lift higher. Do the same on a back foot.' },
      { t: 'Compare', d: 'Test Hurdles again. Is the new result > or < the first one? If it is less, press Undo twice.' },
      { t: 'Idea 2: Longer steps', d: 'On a front foot and a back foot, press Longer steps. Test Hurdles again.' },
      { t: 'Decide', d: 'Is it > your best? Keep it! Press Results to see every comparison.' }
    ]
  },
  {
    id: 'workshop-10-rocks', unit: u(10), title: 'Repeat until the road is clear', ...B2,
    summary: 'A rockfall blocks the lane. Digger must shove the rocks out of the way. Pupils use a loop that checks a condition: repeat (make the body 4 cm wider, test) until 2 m of blocks are shoved, and discuss what to do if the condition never comes true.',
    objective: 'We are learning how a loop can repeat until a condition is true.',
    success: ['I can explain the difference between repeat 3 times and repeat until.', 'I can follow a repeat-until loop and stop when the condition is true.', 'I can say what to do if the condition never comes true.'],
    curriculum: ['ssr', 'reason'],
    words: [['repeat until', 'keep repeating until a condition is true'], ['condition', 'a question with a true or false answer'], ['loop', 'steps that repeat'], ['width', 'how wide the body is, side to side']],
    need: [...DEV],
    plan: [
      { min: 8, title: 'Until…', html: '<p>“Stand up. Repeat: take one step forwards <b>until</b> you touch a wall.” Compare with “take 3 steps”. <b>Ask:</b> which is better if you don’t know how far away the wall is? Introduce <b>repeat until</b> and <b>condition</b>.</p>' },
      { min: 10, title: 'The rockfall', html: '<p>Open the starter, press <b>Test it!</b>, choose <b>Block Push</b> and <b>Go!</b>: Digger shoves about 1.4 m of blocks. Write the loop on the board: <b>repeat: make the body 4 cm wider, then test · until: Block Push is 2 m or more</b>. Show where <b>Width</b> is (click the body, <b>Shape</b> tab).</p>' },
      { min: 25, title: 'Run the loop', html: '<p>Pupils follow the Lesson card: 56 → 60 cm (about 1.0 m: worse!) → 64 cm (about 2.6 m: done, so the loop stops). The condition is checked after every test; the loop stops as soon as it is true.</p><p><b>Ask:</b> what if we had kept going? Pupils who carry on find that much wider is not always better (around 88 cm it shoves almost nothing). A loop needs a condition that can come true, or a limit.</p>' },
      { min: 12, title: 'Share', html: '<p>Open <b>Results</b>. <b>Ask:</b> how many times did your loop repeat? Why can’t we know that number before we start? (That is why we use repeat until.)</p>' },
      { min: 5, title: 'Plenary', html: '<p>Where do we repeat until? (Stir until smooth, practise until perfect.) Next lesson: debugging Scout’s patrol.</p>' }
    ],
    support: 'Give a loop table: width · blocks shoved · is it 2 m or more? (yes/no).',
    stretch: 'Keep the loop going to 100 cm and draw a graph of width against blocks shoved. What is the best width?',
    assess: ['Explains repeat until vs repeat a number of times', 'Stops the loop when the condition is true', 'Suggests a limit or a better condition'],
    steps: [
      { t: 'Test Digger', d: 'Press Test it!, choose Block Push and press Go!. How many metres of blocks?' },
      { t: 'Find Width', d: 'Press Build. Click the body and open its Shape tab. Width is 56 cm.' },
      { t: 'Loop: 60', d: 'Slide Width to 60. Test Block Push. 2 m or more? If not, go round again.' },
      { t: 'Loop: 64', d: 'Slide Width to 64. Test again. 2 m or more? Then stop the loop!' },
      { t: 'Count', d: 'Press Results. How many times did your loop repeat?' }
    ]
  },
  {
    id: 'workshop-11-patrol', unit: u(11), title: 'Debug the patrol', ...B2,
    summary: 'Somebody has been fiddling with the pond patrol and it no longer finishes a lap. Pupils debug a loop (the cycle repeats too slowly), a condition (the turning rule snaps and spins) and the grip, testing after each fix and explaining each bug using this block’s ideas.',
    objective: 'We are learning to debug loops and conditions by testing, finding one bug at a time and explaining it.',
    success: ['I can find a bug by testing and looking at the settings.', 'I can say whether a bug is in a loop, a condition or the design.', 'I can fix the bugs one at a time and prove it works.'],
    curriculum: ['reason', 'ssr'],
    words: [['debug', 'find and fix the bugs'], ['loop', 'the movement cycle that repeats'], ['condition', 'the turning rule’s “is the target left or right?”'], ['test', 'run it to check what it really does']],
    need: [...DEV, 'A bug report sheet: what I saw · where the bug was · what I changed · result'],
    plan: [
      { min: 7, title: 'Something’s wrong', html: '<p>Nell’s note: “Somebody changed Patrol’s settings. It doesn’t finish the lap any more. There are three bugs.” Recap the block: loops (the cycle), conditions and selection (the turning rule), and testing.</p>' },
      { min: 8, title: 'Show me', html: '<p>Open the starter, press <b>Test it!</b>, choose <b>Lap</b>, tick <b>Turbo</b> and <b>Go!</b>. Patrol slides and spins and reaches about 1 flag. Model a bug report: “I saw it spinning. I think the bug is in the turning rule.”</p>' },
      { min: 30, title: 'Debug', html: '<p>Pupils follow the Lesson card, testing the Lap after each fix:</p><ul><li><b>Loop bug</b>: Cycle speed is 7; the loop repeats too slowly → <b>9</b>.</li><li><b>Condition bug</b>: Turning sharpness 100% and smoothness 0% make it snap and spin → sharpness <b>50%</b>, smoothness <b>80%</b>.</li><li><b>Design bug</b>: the feet are <b>Slippy</b> → <b>Grippy</b> (both pairs).</li></ul><p>Patrol finishes a full lap only when all three are fixed. Pupils fill in a bug report for each.</p>' },
      { min: 10, title: 'Share', html: '<p>Pairs read a bug report. <b>Ask:</b> which bug was in the loop, which in the condition? How did testing help?</p>' },
      { min: 5, title: 'Plenary', html: '<p>Next lesson: the Block 2 project, your own pond patrol.</p>' }
    ],
    support: 'Tell pupils which three places to look: body Motion tab (two bugs) and the feet’s Shape tab.',
    stretch: 'Can you make the lap faster? Look at the time on the result card and compare in Results.',
    assess: ['Tests and observes before changing', 'Names the kind of bug', 'Fixes bugs one at a time and proves it with a test'],
    steps: [
      { t: 'Test the Lap', d: 'Press Test it!, choose Lap, tick Turbo and press Go!. What goes wrong?' },
      { t: 'Loop bug', d: 'Press Build. Click the body, open Motion. Set Cycle speed to 9. Test the Lap.' },
      { t: 'Condition bug', d: 'Set Turning sharpness to 50% and Turning smoothness to 80%. Test the Lap.' },
      { t: 'Grip bug', d: 'Click a foot (the lower part of a leg), open Shape, press Grippy. Do the same on the other pair. Test.' },
      { t: 'Report', d: 'Press Results. Next to each test, type which bug you fixed.' }
    ]
  },
  {
    id: 'workshop-12-pond', unit: u(12), title: 'Project: pond patrol', ...B2,
    summary: 'A design-and-make project. Design the village’s own pond patrol: it must follow all eight flags and climb the reed bank (Hurdles). Pupils start from a poorly set-up walker, plan with input → decide → output, and use loops, the turning rule, comparison and debugging to meet the brief.',
    objective: 'We are learning to use inputs, selection and loops in our own design and to improve it using comparisons.',
    success: ['I can plan how my Critter senses and decides.', 'I can test against the brief and compare results.', 'I can explain my design using input, condition, selection and loop.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['brief', 'what the design must do'], ['input', 'what the Critter senses'], ['selection', 'the turning rule'], ['iterate', 'test, improve, test again']],
    need: [...DEV, 'A planning sheet: input · decide · output · tests'],
    plan: [
      { min: 8, title: 'The brief', html: '<p>The goals checklist: a full lap of 8 flags, Hurdles 9 m or more, at least 4 different designs tested, a name of its own and three colours. Pairs fill in input → decide → output for their patrol.</p>' },
      { min: 32, title: 'Design and test', html: '<p>Pupils open the starter (a walker with poor settings) and work through their plan, comparing every result with their best and keeping only changes that are better. Useful levers from the block: Cycle speed, Turning sharpness and smoothness, Longer steps, Lift higher, Grip.</p><p>One way to meet the brief: Cycle speed 9, sharpness 50%, smoothness 80%, and Longer steps on both foot pairs.</p>' },
      { min: 12, title: 'Patrol trials', html: '<p>Pairs run the Lap and Hurdles on the board. The class checks the goals.</p>' },
      { min: 8, title: 'Evaluate', html: '<p>Pairs write: “Our patrol senses… It decides… Our best change was… because the results went from … to …”. Celebrate the end of Block 2.</p>' }
    ],
    support: 'Give the levers as a checklist to try one at a time.',
    stretch: 'Make the lap as fast as possible, or reach 10 m in Hurdles while still finishing the lap.',
    assess: ['Plans using input/decide/output', 'Uses comparisons to keep or undo changes', 'Meets the brief and explains the design with the key words'],
    steps: [
      { t: 'Read the brief', d: 'Look at the goals at the top. Plan: what does your patrol sense, decide and do?' },
      { t: 'Test first', d: 'Press Test it!, choose Lap, tick Turbo and press Go!. Write down the flags.' },
      { t: 'Improve', d: 'Change ONE setting or part, then test. If the new result > your best, keep it; else Undo.' },
      { t: 'Hurdles too', d: 'Test Hurdles as well. Can you meet both goals with one design?' },
      { t: 'Make it yours', d: 'Give it a new name and at least three colours.' },
      { t: 'Show your data', d: 'Press Results and type a note next to each test.' }
    ]
  },

  // ═══════════════════════ BLOCK 3 · CRITTER SCIENCE (Years 5–6) ═══════════════════════
  { adopt: 'critter-engineers', unit: u(13) },
  {
    id: 'workshop-14-speeds', unit: u(14), title: 'Speed trials: find the best', ...B3,
    summary: 'Strider is a new long-legged walker. Is faster always better? Pupils treat Cycle speed as a variable, test every value from 1 to 10 in the Sprint (keeping everything else the same), record the data in the Results table, draw a line graph and use it to find the best setting.',
    objective: 'We are learning to collect data in a fair way, present it as a graph and use it to answer a question.',
    success: ['I can say which variable I change, which I measure and which I keep the same.', 'I can collect and record a set of results.', 'I can draw a graph and use it to find the best value.'],
    curriculum: ['data', 'design'],
    words: [['variable', 'something that can change'], ['data', 'facts and numbers we collect'], ['line graph', 'a graph that shows how one thing changes with another'], ['optimum', 'the best value']],
    need: [...DEV, 'Squared paper for a line graph'],
    plan: [
      { min: 8, title: 'Is faster better?', html: '<p>Recap Count the cycles (Block 1): a faster cycle means more repeats. <b>Ask:</b> so is the fastest cycle speed always best? Take a vote. Today we answer with <b>data</b>, not opinions.</p><p>Set up the fair test: change <b>Cycle speed</b> (the variable we change), measure <b>Sprint distance</b>, keep everything else the same.</p>' },
      { min: 7, title: 'Show me', html: '<p>Open the starter and test it at Cycle speed 4 (about 1.6 m). Show the <b>Results</b> table and type “speed 4” in the note box.</p>' },
      { min: 25, title: 'Collect the data', html: '<p>Pupils follow the Lesson card, testing speeds 1 to 10 (pairs can split the speeds and share). The data rises slowly to a peak at speed 7 (about 2.4 m), then falls fast: at 9 and 10 Strider’s legs can’t keep up and it trips, even going backwards. They draw a line graph: cycle speed across, distance up.</p>' },
      { min: 15, title: 'Use the graph', html: '<p><b>Ask:</b> where is the best value (the optimum)? Was the class vote right? Why does the data fall after 7? Compare with Dash in Block 1, whose best was 9: different designs have different best settings, so you need data for each one.</p>' },
      { min: 5, title: 'Plenary', html: '<p>Next lesson: reusing a good part, like a programmer reuses a good procedure.</p>' }
    ],
    support: 'Give a results table with the speeds filled in and a graph with axes drawn.',
    stretch: 'Strider’s first design walked 5 m at 1.00 s a cycle, a value between the slider’s steps. Explain why a graph with only ten points can miss the very best value.',
    assess: ['Identifies the variable changed, measured and kept the same', 'Records a complete data set', 'Draws a graph and reads the optimum from it'],
    steps: [
      { t: 'Plan the test', d: 'You change Cycle speed. You measure the Sprint. Everything else stays the same.' },
      { t: 'First result', d: 'Press Test it! (Sprint). Press Results and type “speed 4” next to the test.' },
      { t: 'Change the variable', d: 'Press Build, click the body, open Motion and move Cycle speed to 1. Test it.' },
      { t: 'Collect it all', d: 'Do speeds 2, 3, 5, 6, 7, 8, 9 and 10 too, testing each one. Type each speed in Results.' },
      { t: 'Graph it', d: 'Draw a line graph: cycle speed across, distance up. Where is the peak?' },
      { t: 'Best setting', d: 'Set Strider to its best cycle speed and test again to check.' }
    ]
  },
  {
    id: 'workshop-15-copy', unit: u(15), title: 'One great leg, used twice', ...B3,
    summary: 'Patch has a brilliant pair of front legs and a poor pair at the back, and it walks backwards. Programmers write a procedure once and use it again; pupils do the same with a part: remove the poor legs, Copy the good leg and Paste it on, then change its Length like giving a procedure a different input.',
    objective: 'We are learning that reusing a tested part, like calling a procedure, saves time and avoids mistakes, and that an input can change what it does.',
    success: ['I can reuse a part by copying and pasting it.', 'I can explain how this is like using a procedure.', 'I can change one input (Length) and test what it does.'],
    curriculum: ['design', 'ssr'],
    words: [['procedure', 'a named set of steps you write once and use many times'], ['reuse', 'use something again instead of making it all over again'], ['input (parameter)', 'a value you give a procedure that changes what it does'], ['copy and paste', 'make an exact copy of something']],
    need: [...DEV],
    plan: [
      { min: 8, title: 'Write it once', html: '<p>Show a recipe that says “make the pastry” twice, written out in full both times. <b>Ask:</b> how could we write it shorter? (Write “make the pastry” once as its own recipe and say “do make the pastry” twice.) Introduce <b>procedure</b> and <b>reuse</b>. A pastry recipe with an input: “make the pastry (size: large)”.</p>' },
      { min: 10, title: 'Meet Patch', html: '<p>Open the starter and press <b>Test it!</b>: Patch walks <b>backwards</b> (about −2 m). The front Long legs are good; the back Walking legs fight them. Model the fix without building new back legs: reuse the front leg.</p>' },
      { min: 25, title: 'Reuse it', html: '<p>Pupils follow the Lesson card: click a back <b>Leg bit</b> (the top part of a back leg) → Shape → <b>Remove this pair</b>; click a front <b>Long bit</b> (the top part of a front leg) → <b>Copy</b>; click the <b>body</b> → <b>Paste</b>. The copy (and its twin) goes on at the back. Test: about <b>5 m</b>.</p><p>Then the input: click a pasted Long bit, change its <b>Length</b> (its twin copies it) and test. Like calling the procedure with a different input, the same part behaves differently.</p>' },
      { min: 12, title: 'Share', html: '<p><b>Ask:</b> what did reuse save us? (Time, and the copy was already tested.) What was the input? Did a different input make it better or worse? Show Results.</p>' },
      { min: 5, title: 'Plenary', html: '<p>Next lesson: trials in different contests, and choosing the right job for a Critter using data.</p>' }
    ],
    support: 'Do the remove, copy and paste together on the board, one step at a time.',
    stretch: 'Try Duplicate (it copies and pastes in one go) on a different part. Where does the copy go? Use Length as an input and find the best value for the back legs.',
    assess: ['Reuses a part with copy and paste', 'Explains the link to procedures', 'Changes an input and tests its effect'],
    steps: [
      { t: 'Test Patch', d: 'Press Test it!. Which way does Patch go in the Sprint?' },
      { t: 'Remove the poor legs', d: 'Press Build. Click the top part of a back leg (a Leg bit). On its Shape tab press Remove this pair.' },
      { t: 'Copy the good leg', d: 'Click the top part of a front leg (a Long bit). Press Copy.' },
      { t: 'Paste it on', d: 'Click the body, then press Paste. The copied leg pair goes on at the back.' },
      { t: 'Test it', d: 'Press Test it!. How far now?' },
      { t: 'Change the input', d: 'Click a back Long bit, open Shape and change its Length. Test. Better or worse?' }
    ]
  },
  {
    id: 'workshop-16-trials', unit: u(16), title: 'Which job suits it?', ...B3,
    summary: 'Five villagers each want a Critter for a different job. Pupils test one Critter in four contests, compare it with a second design, put the data in a table and use it to recommend which jobs each design should do, explaining their choice with numbers.',
    objective: 'We are learning to collect data from several tests, organise it in a table and use it to make a recommendation.',
    success: ['I can collect results from several contests.', 'I can organise the data in a table to compare two designs.', 'I can make a recommendation and back it up with data.'],
    curriculum: ['data', 'reason'],
    words: [['data', 'facts and numbers we collect'], ['table', 'rows and columns that organise data'], ['compare', 'look at two things to see how they differ'], ['recommend', 'suggest the best choice and say why']],
    need: [...DEV, 'A comparison table: contest · design 1 · design 2'],
    plan: [
      { min: 8, title: 'Job adverts', html: '<p>Read five villagers’ job adverts: the baker (Sprint: fast deliveries), the shepherd (Hurdles: hills), the builder (Block Push: moving stones), the apple picker (High Jump), the pond keeper (Lap). <b>Ask:</b> how could we decide which Critter suits which job? (Test it in each one and compare the data.)</p>' },
      { min: 25, title: 'Run the trials', html: '<p>Pupils follow the Lesson card: test Trialist in <b>Sprint</b>, <b>Hurdles</b>, <b>Block Push</b> and <b>High Jump</b> (Turbo helps). Then they make design 2 with <b>Longer steps</b> on both foot pairs and test it in Sprint and Hurdles. Everything appears in <b>Results</b>; pupils copy it into a comparison table.</p>' },
      { min: 15, title: 'Recommend', html: '<p>Pairs write a recommendation for each villager: “For the shepherd we recommend design 2 because it went 9.7 m in Hurdles and design 1 only went 7.2 m.” <b>Ask:</b> is a design good at everything? (Trialist is a strong walker but hardly jumps: a few centimetres in High Jump.)</p>' },
      { min: 7, title: 'Share', html: '<p>Pairs read recommendations; the class checks they used numbers.</p>' },
      { min: 5, title: 'Plenary', html: '<p>Data helps us choose, but only if we test the right things. Next lesson: Super Sumo.</p>' }
    ],
    support: 'Give the comparison table with the contests already filled in.',
    stretch: 'Add Lap to the table. Make a design 3 for the apple picker that jumps higher, and test it.',
    assess: ['Collects results from four contests', 'Organises results in a table', 'Recommends with reasons based on data'],
    steps: [
      { t: 'Sprint', d: 'Press Test it! and let the Sprint finish.' },
      { t: 'Three more contests', d: 'Choose Hurdles, press Go!. Then Block Push, then High Jump. Tick Turbo to save time.' },
      { t: 'Design 2', d: 'Press Build. On a front foot and a back foot (the lower parts with white loops) press Longer steps.' },
      { t: 'Test design 2', d: 'Test design 2 in Sprint and Hurdles.' },
      { t: 'Table and recommend', d: 'Press Results. Copy the data into your table. Which design suits which job? Say why, with numbers.' }
    ]
  },
  {
    id: 'workshop-17-sumo', unit: u(17), title: 'Super Sumo science', ...B3,
    summary: 'The village fair has a Super Sumo ring. Rumble beats two of the four Starter Critters but loses to the others. Pupils test against every opponent, record wins and losses, change one variable (body Width) at a time and retest the whole set, until one design beats all four.',
    objective: 'We are learning to evaluate a design against several tests, change one variable at a time and use data to decide what to keep.',
    success: ['I can test my design against every opponent and record the results.', 'I can change one variable and retest everything.', 'I can use the data to explain why my final design is the best.'],
    curriculum: ['design', 'data', 'reason'],
    words: [['evaluate', 'judge how good something is, using evidence'], ['variable', 'something you can change'], ['evidence', 'results that show something is true'], ['trade-off', 'when a change makes one thing better but another worse']],
    need: [...DEV, 'A results grid: width · Scuttler · Crab · Wriggler · Hopper · wins'],
    plan: [
      { min: 8, title: 'Fair-day sumo', html: '<p>Explain Super Sumo: push the other Critter off the platform; if nobody falls, the one nearer the middle wins on points. <b>Ask:</b> if Rumble beats one opponent, is it a champion? (We need to test against everyone.) Introduce <b>evaluate</b> and <b>evidence</b>.</p>' },
      { min: 10, title: 'First bouts', html: '<p>Open the starter, press <b>Test it!</b>, choose <b>Super Sumo</b>, pick each opponent in the <b>Against</b> list in turn and press <b>Go!</b>. Rumble beats the Scuttler and the Hopper but loses to the Crab and the Wriggler: 2 wins out of 4. Start the results grid.</p>' },
      { min: 25, title: 'Change, retest, decide', html: '<p>Pupils follow the Lesson card, changing the body’s <b>Width</b> (Shape tab) one step at a time and fighting all four opponents each time. A change that beats the Crab may lose to the Wriggler (a <b>trade-off</b>), so every change needs all four bouts. At a width of 70 cm Rumble beats all four.</p><p>The checklist only ticks when <b>one</b> design beats all four, which shows why evidence must come from the same design.</p>' },
      { min: 12, title: 'Share', html: '<p>Pairs present their grid. <b>Ask:</b> which change gave the biggest improvement? Did any change make things worse against one opponent but better against another?</p>' },
      { min: 5, title: 'Plenary', html: '<p>Next lesson: the final project, the Fernhollow Games.</p>' }
    ],
    support: 'Give the grid with widths 56, 60, 66, 70 to try.',
    stretch: 'Find a different winning design that keeps the width at 56: try Height, Length or the body’s Muscle power. Test all four opponents each time.',
    assess: ['Tests against all opponents and records the outcomes', 'Changes one variable at a time', 'Justifies the final design with evidence'],
    steps: [
      { t: 'Choose Super Sumo', d: 'Press Test it! and choose Super Sumo. In Against, pick Scuttler and press Go!.' },
      { t: 'Every opponent', d: 'Pick Crab, Wriggler and Hopper in turn, pressing Go! each time. Record win or lose.' },
      { t: 'Change one thing', d: 'Press Build. Click the body, open Shape and change Width (try 70).' },
      { t: 'Retest them all', d: 'Fight all four opponents again with the new design. How many wins now?' },
      { t: 'Check the evidence', d: 'Press Results. Which design beat all four?' }
    ]
  },
  {
    id: 'workshop-18-games', unit: u(18), title: 'Project: the Fernhollow Games', ...B3,
    summary: 'The final design-and-make project. The Fernhollow Games need an all-round champion: fast in the Sprint, strong in Hurdles, steady round the Lap and tough in Super Sumo. Pupils plan, run fair tests, keep data in the Results table, reuse what works and present their champion with evidence.',
    objective: 'We are learning to combine everything from the unit to design, test, evaluate and present a solution to a complex brief.',
    success: ['I can plan a design to meet several goals at once.', 'I can test fairly and use data to improve my design.', 'I can present my design and back it up with evidence.'],
    curriculum: ['design', 'data', 'reason'],
    words: [['brief', 'what the design must do'], ['fair test', 'change one thing at a time'], ['evidence', 'results that show something is true'], ['evaluate', 'judge how well it meets the brief']],
    need: [...DEV, 'A planning and evidence sheet'],
    plan: [
      { min: 8, title: 'The Games brief', html: '<p>Read the goals checklist: Sprint 6 m+, Hurdles 8 m+, a full Lap, beat three Starter Critters in Super Sumo with one design, at least six designs tested, and a name. Pairs plan: which settings and parts will they try first, and in what order? (Decompose the brief!)</p>' },
      { min: 32, title: 'Design, test, improve', html: '<p>Pupils open the starter (Champion, with poor settings) and work through their plan using the whole unit: cycle speed (loops), turning sharpness and smoothness (the steering rule), foot loops, width, fair tests and the Results table. They type a note next to every test.</p><p>One way to meet the brief: Cycle speed 9, sharpness 50%, smoothness 80%, Longer steps on both foot pairs and a body Width of 70.</p>' },
      { min: 15, title: 'Champion presentations', html: '<p>Each pair presents its champion for one minute, using the Results table as evidence: “We changed … because … and the data shows …”. Optionally hold a class <b>Showdown</b> (Cloud → Critter Showdown) with four champions.</p>' },
      { min: 5, title: 'Celebrate', html: '<p>Award the Fernhollow Games medals. Recap the unit: algorithms and loops, sensing and deciding, data and fair tests.</p>' }
    ],
    support: 'Give a checklist of levers to try in order, one at a time.',
    stretch: 'Add another goal of your own (High Jump? Block Push?) and meet it without losing any of the others. Or 3D print your champion (3D print button).',
    assess: ['Plans to meet several goals', 'Uses fair tests and data to improve', 'Presents a design with evidence'],
    steps: [
      { t: 'Plan', d: 'Read every goal at the top. Plan which changes you will try, one at a time.' },
      { t: 'Test first', d: 'Press Test it! for the Sprint. Then try Hurdles and Lap (tick Turbo).' },
      { t: 'Improve', d: 'Change one thing. Test. Keep it if the result is better, else Undo.' },
      { t: 'Super Sumo', d: 'Choose Super Sumo. In Against, fight each Starter Critter. Can one design win three bouts?' },
      { t: 'Name it', d: 'Give your champion a name of its own in the box at the top.' },
      { t: 'Evidence', d: 'Press Results. Type a note next to each test. Use it to present your champion.' }
    ]
  }
];

export const SLIDES = {
  'workshop-2-loop': [
    { t: 'Walk in slow motion', q: 'What does one foot do, step by step?', b: ['Put it down in front', 'Push it back along the floor', 'Lift it', 'Swing it forwards'], notes: 'Everyone walks on the spot slowly. Then try the steps in the reverse order and ask where they end up.' },
    { t: 'Meet Trundle', pic: true, b: ['Press Test it!', 'How far does it get?'], notes: 'Trundle shuffles about 1 m. Its foot loops go round the wrong way.' },
    { t: 'The foot loop is an algorithm', lead: 'The foot visits the points in order, once every cycle.', b: ['The order of the points is the sequence.', 'Wrong order = a bug, even if every point is right.'], notes: 'Click a Foot pad, open Motion, and follow the arrows on the white loop.' },
    { use: 'steps' },
    { t: 'Think', q: 'The points were the same before and after. What changed?', notes: 'Only the order. Trundle goes about 5 m once both pairs are reversed.' }
  ],
  'workshop-3-parts': [
    { t: 'A big job', lead: 'Walk the hills and keep your eyes on the way.', q: 'What smaller jobs is that made of?', notes: 'Sort ideas into move, see the way, get over the bumps.' },
    { t: 'Decompose', lead: 'Break a big problem into smaller ones.', table: [['Small job', 'Part'], ['Move', 'Long leg pairs'], ['See the way', 'Neck & head'], ['Bumps', 'Test in Hurdles']], notes: 'This is Lizzie’s parts list; the goals checklist matches it.' },
    { t: 'Meet Lizzie', pic: true, b: ['Click the body first', 'Then tap a limb', 'Drag Neck & head to the front'], notes: 'If a leg hangs off a foot, Undo, click the body and try again.' },
    { use: 'steps' },
    { t: 'Think', q: 'Was it easier to build from a list? Which part would you build first next time?', notes: 'Link to other decomposition: chapters of a story, levels of a game.' }
  ],
  'workshop-4-cycles': [
    { t: 'Repeat after me', b: ['clap · clap · stamp', 'Again… and again… faster!'], q: 'In 10 seconds, more patterns slowly or quickly?', notes: 'Introduce repeat and cycle.' },
    { t: 'Meet Dash', pic: true, b: ['Press Test it!', 'Body → Motion → Cycle speed'], notes: 'Dash barely moves at Cycle speed 4 (1.78 s a cycle).' },
    { t: 'How many repeats?', table: [['Cycle speed', 'Seconds a cycle', 'Repeats in 15 s'], ['4', '1.78', 'about 8'], ['6', '1.30', 'about 12'], ['9', '0.58', 'about 26']], notes: 'Pupils predict before each test.' },
    { use: 'steps' },
    { t: 'Think', q: 'Is the fastest always the best?', notes: 'Speed 9 runs about 8 m; speed 10 a little less. More repeats help only while the legs keep up.' }
  ],
  'workshop-5-bugs': [
    { t: 'Bramble is broken', lead: 'Three bugs. Fix them one at a time.', b: ['Test', 'Find one bug', 'Fix it', 'Test again'], notes: 'Why not fix them all at once? We would not know which fix worked.' },
    { t: 'Where to look', pic: true, b: ['The foot loops (Motion tab)', 'The feet’s Grip (Shape tab)', 'The body’s Muscle power (Motion tab)'], notes: 'Model looking for clues on the back foot first.' },
    { use: 'steps' },
    { t: 'Bug report', table: [['What I saw', 'What I fixed', 'How far now'], ['', '', ''], ['', '', ''], ['', '', '']], notes: 'Bramble only walks well (about 5 m) once all three bugs are fixed.' },
    { t: 'Think', q: 'Why did the first fixes seem to do little?', notes: 'The other bugs were still holding it back.' }
  ],
  'workshop-6-post': [
    { t: 'The post office brief', pic: true, b: ['Sprint 3 m or more', 'Hurdles 3 m or more', 'Four walking feet', 'A name and three colours'], notes: 'The goals checklist is the brief.' },
    { t: 'Plan first', b: ['Sketch it', 'Parts list, in order', 'Which part does which job?'], notes: 'Check plans before pupils build.' },
    { use: 'steps' },
    { t: 'Evaluate', lead: '“Our design meets the brief because… Next time we would…”', notes: 'Celebrate the end of Block 1.' }
  ],
  'workshop-7-sense': [
    { t: 'Be a sensor', q: 'What was the input? What was the output? Who decided?', notes: 'A blindfolded walker guided by “left, right, straight”.' },
    { t: 'Input → decide → output', table: [['Input', 'Decide', 'Output'], ['How far the flag is to the left or right', 'Which way to turn, and how hard', 'The legs’ steps']], notes: 'Scout senses one input all the time.' },
    { t: 'Meet Scout', pic: true, b: ['Free roam: tap to move the target', 'Lap: follow 8 flags (tick Turbo)'], notes: 'Scout zig-zags and gets 6 of 8 flags with smoothness 0%.' },
    { use: 'steps' },
    { t: 'Think', q: 'What did smoothness change: the input, the output or the deciding?', notes: 'The deciding: how big the input must be before it turns hard. At 20% or more Scout finishes the lap.' }
  ],
  'workshop-8-turns': [
    { t: 'The steering rule', lead: 'If the target is to the left, then the left legs take shorter steps, else the right legs do.', notes: 'Act it out in pairs, arms linked.' },
    { t: 'Selection', b: ['Condition: is the target to the left? (true or false)', 'Then: left legs shorter', 'Else: right legs shorter'], notes: 'Sharpness = how much shorter. At 100% the inside legs walk backwards.' },
    { t: 'Meet Spinner', pic: true, q: 'Why does it spin round and round?', notes: 'Sharpness 100%: 2 flags. 80%: still spins. 50%: about 7 flags.' },
    { use: 'steps' },
    { t: 'Think', q: 'Which part of the rule did sharpness change?', notes: 'What happens in then and else, not the condition.' }
  ],
  'workshop-9-better': [
    { t: 'Higher or lower?', b: ['7.2 ? 6.9', '9.7 ? 7.2', '5 ? 5'], notes: 'Fill in >, < or =.' },
    { t: 'The decision rule', lead: 'If new result > best result then keep it, else Undo.', notes: '“New best!” appears only when the comparison is true.' },
    { t: 'Meet Hilda', pic: true, b: ['Hurdles: about 7.2 m', 'Idea 1: Lift higher', 'Idea 2: Longer steps'], notes: 'Lift higher gives about 6.9 m (worse: Undo); Longer steps about 9.7 m (keep).' },
    { use: 'steps' },
    { t: 'Think', q: 'What would you do if new result = best result?', notes: 'Either is fine with a reason.' }
  ],
  'workshop-10-rocks': [
    { t: 'Repeat until', lead: 'Keep repeating until a condition is true.', b: ['Take a step until you touch the wall', 'Stir until smooth'], notes: 'Compare with repeat 3 times.' },
    { t: 'The loop', b: ['Repeat: make the body 4 cm wider, then test', 'Until: Block Push is 2 m or more'], pic: true, notes: 'Width is on the body’s Shape tab. Digger starts at 56 cm and about 1.4 m.' },
    { use: 'steps' },
    { t: 'Loop table', table: [['Width', 'Blocks shoved', '2 m or more?'], ['56', '', ''], ['60', '', ''], ['64', '', '']], notes: '60 cm is worse (about 1.0 m), 64 cm about 2.6 m: the loop stops.' },
    { t: 'Think', q: 'What if the condition never comes true?', notes: 'Wider is not always better: a loop needs a condition that can come true, or a limit.' }
  ],
  'workshop-11-patrol': [
    { t: 'Three bugs', pic: true, b: ['A loop bug', 'A condition bug', 'A design bug'], notes: 'Patrol reaches about 1 flag.' },
    { t: 'Where to look', table: [['Bug', 'Where'], ['Loop: repeats too slowly', 'Body → Motion → Cycle speed'], ['Condition: snaps and spins', 'Turning sharpness and smoothness'], ['Design: slips', 'Feet → Shape → Grip']], notes: 'Only show this after pupils have tried to find the bugs.' },
    { use: 'steps' },
    { t: 'Think', q: 'Which bug was in the loop? Which in the condition? How did testing help?', notes: 'Patrol finishes the full lap only when all three are fixed.' }
  ],
  'workshop-12-pond': [
    { t: 'The pond patrol brief', pic: true, b: ['A full lap: 8 flags', 'Hurdles 9 m or more', '4 designs tested', 'Its own name and 3 colours'], notes: 'The goals checklist is the brief.' },
    { t: 'Plan', table: [['Input', 'Decide', 'Output'], ['', '', '']], notes: 'Pairs fill this in for their own patrol.' },
    { use: 'steps' },
    { t: 'Evaluate', lead: '“Our patrol senses… It decides… Our best change was… because…”', notes: 'Celebrate the end of Block 2.' }
  ],
  'workshop-14-speeds': [
    { t: 'Is faster always better?', q: 'Vote: will the fastest cycle speed win?', notes: 'Today we answer with data.' },
    { t: 'A fair test', table: [['Change', 'Measure', 'Keep the same'], ['Cycle speed', 'Sprint distance', 'Everything else']], notes: 'Variables we change, measure and control.' },
    { t: 'Meet Strider', pic: true, b: ['Test speeds 1 to 10', 'Note each speed in Results'], notes: 'Rises to a peak at speed 7 (about 2.4 m), then falls; at 10 it goes backwards.' },
    { use: 'steps' },
    { t: 'Read the graph', q: 'Where is the optimum? Why does it fall after the peak?', notes: 'Compare with Dash (best at 9): every design needs its own data.' }
  ],
  'workshop-15-copy': [
    { t: 'Write it once', lead: 'A procedure is a set of steps you write once and use many times.', b: ['“make the pastry” … “make the pastry” again', 'Inputs change it: make the pastry (size: large)'], notes: 'Introduce procedure, reuse and input.' },
    { t: 'Meet Patch', pic: true, q: 'Why does Patch walk backwards?', notes: 'The back Walking legs fight the front Long legs: about −2 m.' },
    { t: 'Reuse the good leg', b: ['Remove the poor pair', 'Copy a front Long bit', 'Click the body, Paste'], notes: 'About 5 m once the copy is on.' },
    { use: 'steps' },
    { t: 'Think', q: 'What did reuse save? What was the input?', notes: 'Time, and a part already tested. The input was Length.' }
  ],
  'workshop-16-trials': [
    { t: 'Five job adverts', b: ['Baker: Sprint', 'Shepherd: Hurdles', 'Builder: Block Push', 'Apple picker: High Jump', 'Pond keeper: Lap'], notes: 'How do we decide which Critter suits which job?' },
    { t: 'Meet Trialist', pic: true, b: ['Test 4 contests', 'Make design 2', 'Compare'], notes: 'Trialist walks well but hardly jumps.' },
    { use: 'steps' },
    { t: 'Comparison table', table: [['Contest', 'Design 1', 'Design 2'], ['Sprint', '', ''], ['Hurdles', '', ''], ['Block Push', '', '—'], ['High Jump', '', '—']], notes: 'Design 2 (Longer steps) goes further in Sprint and Hurdles.' },
    { t: 'Recommend', lead: '“For the … we recommend design … because …”', notes: 'Every recommendation must use a number.' }
  ],
  'workshop-17-sumo': [
    { t: 'Super Sumo', b: ['Push the other Critter off', 'Nobody falls? Nearer the middle wins'], q: 'Beat one opponent: is that a champion?', notes: 'We need to test against everyone.' },
    { t: 'Meet Rumble', pic: true, b: ['Against: Scuttler, Crab, Wriggler, Hopper'], notes: 'Rumble wins 2 of 4 at first.' },
    { t: 'Results grid', table: [['Width', 'Scuttler', 'Crab', 'Wriggler', 'Hopper', 'Wins'], ['56', '', '', '', '', ''], ['', '', '', '', '', ''], ['', '', '', '', '', '']], notes: 'Change one variable, then retest all four.' },
    { use: 'steps' },
    { t: 'Think', q: 'Did a change help against one opponent but hurt against another?', notes: 'That is a trade-off. At 70 cm wide Rumble beats all four.' }
  ],
  'workshop-18-games': [
    { t: 'The Fernhollow Games', pic: true, b: ['Sprint 6 m+', 'Hurdles 8 m+', 'A full Lap', 'Beat 3 in Super Sumo', '6 designs tested', 'A name'], notes: 'The goals checklist is the brief.' },
    { t: 'Plan', b: ['Decompose the brief', 'Which change first? Then?', 'One change at a time'], notes: 'Pairs plan before building.' },
    { use: 'steps' },
    { t: 'Present your champion', lead: '“We changed … because … and the data shows …”', notes: 'One minute each, using the Results table. Optionally a class Showdown.' },
    { t: 'Critter Workshop', b: ['Algorithms, loops and debugging', 'Sensing and deciding', 'Data and fair tests'], notes: 'Celebrate the whole unit.' }
  ]
};
