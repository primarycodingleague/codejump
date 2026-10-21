// The Print Lab's lesson unit — see lessons/units/README.md. lessons.js merges it in.
// MAPLE STREET MAKERS: the class run a little design workshop on Maple Street. Every lesson a shop or a neighbour sends in an
// order (a design brief whose rules tick themselves): Rosa at the Corner Café, Mr Adeyemi at the Leaf & Root garden centre,
// the Book Nook, the Toy Box, Pip's Pet Parlour, Gem & Thread, Ollie's Workbench and Maple Street School. The year ends with
// the Maple Street Fair.
// Block 1 Opening the workshop (Years 3–4) · Block 2 Orders with rules (Years 4–5) · Block 3 The big commission (Years 5–6).
// The Print Lab is hands-on design, not coding, so the computing progression is mapped onto designing: precise steps
// (algorithms), decomposition, repeating a part (count-controlled repetition), debugging a design; then conditions (a brief's
// rules are conditions: comparisons, ranges made of two conditions, measuring as an input, repeat-until-it-ticks, debugging
// the conditions); then variables (a named number used in a calculation), procedures with inputs (a grouped part reused at
// different sizes), data (versions, estimates, totals), formulas, and a final project. Lesson 6 of each block is a project.
// The Print Lab's two earlier lessons (print-keyring, print-phone-stand) are folded in with { adopt }.
// Starters + answers: lessons/builds/print/maple.mjs; test: tests/unit-print.test.mjs.
const N = 'Maple Street Makers';
const u = m => `${N} · Block ${Math.ceil(m / 6)} · Lesson ${m}`; // m counts on through the whole unit
const T = { ks: 'ks2', minutes: 60, type: 'print3d', tool: 'Print Lab (shapes)' };
const Y34 = 'Years 3–4', Y45 = 'Years 4–5', Y56 = 'Years 5–6';
const DEV = ['A device per pupil or pair, with CodeJump open', 'The board, to show the class'];
const PRINTER = 'Optional: a 3D printer, to print two or three of the class’s designs after the lesson';

export const LESSONS = [
  // ═══════════════════════ BLOCK 1 · OPENING THE WORKSHOP (Years 3–4) ═══════════════════════
  {
    id: 'print-1-stand', unit: u(1), title: 'Follow the plan: a table number', ...T, years: Y34,
    summary: 'The first Maple Street Makers lesson. The class open their design workshop and take their first order: a number stand for each table at the Corner Café. Pupils follow a written plan with exact measurements, step by step, then write a plan of their own for a partner to follow.',
    objective: 'We are learning to follow and write an algorithm: exact steps, in the right order, with measurements.',
    success: ['I can follow a plan one step at a time.', 'I can set a shape’s size in millimetres.', 'I can write steps exact enough for a partner to follow.'],
    curriculum: ['design', 'reason'],
    words: [['algorithm', 'exact steps, in the right order, to do a job'], ['millimetre (mm)', 'a tiny length: 10 mm make 1 cm'],
      ['width, depth, height', 'how wide (left to right), how deep (front to back) and how tall a shape is'], ['design brief', 'what a design must do, and the rules it must keep to']],
    need: [...DEV, 'A ruler per pair', 'The plan on the board (or printed): base, back, number', PRINTER],
    plan: [
      { min: 8, title: 'Welcome to Maple Street', html: '<p>Tell the class that this year they run a design workshop on <b>Maple Street</b>. The shops send in orders, and the class design what they need on the computer, ready for a 3D printer. The first order is from <b>Rosa at the Corner Café</b>: a number for every table.</p><p>Warm up: one pupil gives another instructions to draw a rectangle on the board. First vague (“draw a box”), then exact (“a rectangle 6 squares wide and 4 tall”). <b>Ask:</b> which drawing matched? Introduce <b>algorithm</b>: exact steps in order.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter. Point out the challenge card at the top left: it is Rosa’s <b>design brief</b>, and its rules tick themselves. The base is already made. Click it and show its <b>Width</b>, <b>Depth</b> and <b>Height</b> in the panel on the right. Show 60 mm on a ruler.</p><p>Read the plan on the board: <b>1</b> base 60 × 20 × 5 (done) · <b>2</b> a Box 60 wide, 4 deep, 40 tall, at Y 8 · <b>3</b> Text with the table number, Up 5, Y −4.</p>' },
      { min: 22, title: 'Follow the plan', html: '<p>Pupils follow the Lesson card, one step at a time, typing each number exactly. <b>Ask</b> before they press Check &amp; print: “Which rules will tick now?”</p><p>Pairs who finish write a plan for a different number stand (taller, or with a heart on top) and swap it with another pair, who must follow it <b>exactly</b>, even if it is wrong.</p>' },
      { min: 10, title: 'Swap and test', html: '<p>Pairs compare the stand they built with what the plan’s author meant. <b>Ask:</b> where was a step not exact enough? What number or word was missing?</p>' },
      { min: 10, title: 'Share', html: '<p>Read one good plan aloud. Agree what made it easy to follow: one step per line, every measurement given, in an order that works. Next lesson: a keyring, where the order of the steps really matters.</p>' }
    ],
    support: 'Give a card with the plan as boxes to tick. Pupils only need to type numbers into the panel; show where Width, Depth and Height are.',
    stretch: 'Add a second number stand for table 12, next to the first, using Duplicate. Write the steps you used.',
    assess: ['Follows a written plan step by step', 'Sets sizes and positions in millimetres', 'Writes a plan with exact measurements in a sensible order'],
    steps: [
      { t: 'Read the order', d: 'Read Rosa’s challenge card at the top left. Which rules are ticked already?' },
      { t: 'Step 1: the base', d: 'The base is already there. Click it: in the panel it is 60 wide, 20 deep and 5 tall.' },
      { t: 'Step 2: the back', d: 'Tap Box. In the panel type Width 60, Depth 4, Height 40. Then type Y 8 and X 0 so it stands at the back of the base.' },
      { t: 'Step 3: the number', d: 'Tap Text. Type your table number in the Text box. Type Up 5, Y -4 and X 0 so it sits on the base, in front.' },
      { t: 'Check the rules', d: 'Press Check & print. Does every rule on the challenge card tick? Fix any step you missed.' },
      { t: 'Write a plan', d: 'Write your own plan for a different stand, with every measurement. Swap it with a partner and follow theirs exactly.' }
    ]
  },
  {
    // The keyring lesson (from lessons.js) as the unit's second order: Maple Street's gift shop wants name keyrings.
    adopt: 'print-keyring', unit: u(2), years: Y34,
    plan: [
      { min: 5, title: 'Real things are designed', html: '<p>Hold up a keyring (or a bottle top, a toy brick). <b>Ask:</b> somebody designed this on a computer before it was made. What shapes is it made of? Pupils point out the simple shapes: a flat box, a ring, a cylinder. Introduce <b>design brief</b>: the job a design has to do, and its rules.</p>' },
      { min: 5, title: 'How big is 60 mm?', html: '<p>Pairs use a ruler to show 60 mm (6 cm) and 3 mm. Everything in the Print Lab is measured in <b>millimetres</b>: each square on the build plate is 10 mm. A keyring that fits in a pocket is no wider than about 70 mm.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter on the board. Read the challenge card at the top left: its rules tick themselves. Show how to click a shape, drag it, drag a white corner to resize it and type a size in the panel on the right. Drag <b>Text</b> onto the plate and type a name in the panel.</p>' },
      { min: 25, title: 'Design it', html: '<p>Pupils follow the Lesson card: put their name on the tag, make the tag fit the name, then add a <b>Hole cylinder</b> near one end. <b>Ask:</b> why doesn’t the hole cut yet? Show how to Shift-click the hole and the tag and press <b>Group</b>. Pupils who finish add a second colour or round the corners.</p>' },
      { min: 10, title: 'Check & print', html: '<p>Pupils press <b>Check &amp; print</b> and fix anything it finds (floating letters, a hole that isn’t grouped). Read the plastic and the print time together. If you have a printer, choose two or three designs to print and download them as .stl.</p>' },
      { min: 5, title: 'Reflect', html: '<p><b>Ask:</b> which rule of the brief was hardest to meet? What would you change if you printed it and it didn’t fit on your keys?</p>' }
    ]
  },
  {
    id: 'print-3-birdbox', unit: u(3), title: 'Break it down: a bird box', ...T, years: Y34,
    summary: 'Mr Adeyemi at the Leaf & Root garden centre wants a bird box to sell. Pupils decompose the bird box into simple parts on paper (base, box, roof, door, perch), give each part a shape and a size, then build it part by part, using a turned Hole cylinder for the round door.',
    objective: 'We are learning to decompose a design: break it into smaller parts that are easier to make.',
    success: ['I can break an object into simple parts.', 'I can choose a shape and a size for each part.', 'I can build the parts one at a time and join them up.'],
    curriculum: ['design', 'reason'],
    words: [['decompose', 'break a big problem into smaller parts'], ['part', 'one piece of a design, like the roof'],
      ['Tip', 'turns a shape forwards or backwards (in the panel)'], ['overlap', 'two shapes sharing a little space, so they join when printed']],
    need: [...DEV, 'Paper for the parts table', 'Optional: a picture of a real bird box', PRINTER],
    plan: [
      { min: 8, title: 'What is it made of?', html: '<p>Show a picture of a bird box. <b>Ask:</b> if you had to make this, where would you start? Collect ideas, then introduce <b>decompose</b>: break it into parts. Together list the parts: base, box, roof, round door, perch.</p>' },
      { min: 12, title: 'The parts table', html: '<p>Pairs copy and fill in a table: <b>Part · Shape · Size (mm) · Where</b>. Show the first row: Base · Box · 60 × 60 × 4 · on the plate. Pupils choose the rest. Remind them of the brief: no taller than 90 mm, made of at least 4 shapes, using a roof, with a door cut out.</p>' },
      { min: 25, title: 'Build it part by part', html: '<p>Open the starter (the base is there). Pupils follow the Lesson card, building one row of their table at a time and ticking it off. Show how <b>Tip 90</b> turns a Hole cylinder so it points through the front wall, and remind them the door only cuts once the hole and the box are grouped.</p><p>The perch must overlap the front wall a little, or Check &amp; print says it is floating.</p>' },
      { min: 10, title: 'Check and compare', html: '<p>Pupils press <b>Check &amp; print</b> and fix anything it finds. Pairs compare their tables: different parts lists can make a good bird box.</p>' },
      { min: 5, title: 'Reflect', html: '<p><b>Ask:</b> how did breaking it down help? Which part was hardest, and could you break that part down further?</p>' }
    ],
    support: 'Give a parts table with the shapes filled in; pupils add the sizes.',
    stretch: 'Add a hook on the roof (a Ring), or a sign with the garden centre’s name. Add the new parts to your table first.',
    assess: ['Lists the parts of an object with a shape and size for each', 'Builds a design one part at a time', 'Explains how decomposing made the job easier'],
    steps: [
      { t: 'Parts table', d: 'On paper, list the parts of a bird box: base, box, roof, door, perch. Write a shape and a size for each.' },
      { t: 'The box', d: 'Tap Box. Make it Width 50, Depth 50, Height 60 and set Up to 4, so it stands on the base.' },
      { t: 'The roof', d: 'Tap Roof. Make it 60 wide, 60 deep and 20 tall. Set Up to 64 so it sits on top of the box.' },
      { t: 'The door', d: 'Tap Hole cylinder. Make it 25 wide, 25 deep, 12 tall, then set Tip to 90. Move it to the front of the box (Y -25, Up 32).' },
      { t: 'Cut the door', d: 'Shift-click the door and the box, then press Group. The door cuts through the front.' },
      { t: 'The perch', d: 'Tap Cylinder: 6 wide, 6 deep, 10 tall, Tip 90. Put it just under the door (Y -29, Up 22) so it touches the box.' },
      { t: 'Check', d: 'Press Check & print. Does every rule tick? Tick off your parts table too.' }
    ]
  },
  {
    id: 'print-4-pencils', unit: u(4), title: 'Repeat it: a pencil block', ...T, years: Y34,
    summary: 'The Book Nook wants a block that holds five pencils in a row. Pupils make one hole, then repeat it: Duplicate, move it the same distance, four times. They spot the pattern in the numbers (−30, −15, 0, 15, 30) and describe it as “repeat 4 times: duplicate, add 15 to X”.',
    objective: 'We are learning to use repetition: do the same steps a set number of times to make a pattern.',
    success: ['I can spot steps that repeat.', 'I can repeat a part the right number of times with the same spacing.', 'I can describe my steps as a repeat (“4 times: …”).'],
    curriculum: ['design', 'reason'],
    words: [['repeat', 'do the same steps again'], ['count-controlled', 'repeated a set number of times, like “4 times”'],
      ['pattern', 'something that goes up by the same amount each time'], ['Duplicate', 'makes a copy of the selected shape']],
    need: [...DEV, '5 pencils to show the spacing', PRINTER],
    plan: [
      { min: 8, title: 'Spot the repeat', html: '<p>Lay five pencils in a row on the visualiser, 15 mm apart. <b>Ask:</b> how would you tell someone to lay them out? Pupils write long instructions; then show the short way: “Put one at the start. <b>Repeat 4 times:</b> put the next one 15 mm to the right.” Introduce <b>count-controlled repetition</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter: a block and one Hole cylinder at X −30 (the brief wants 5 holes, all the same). Show <b>Duplicate</b>: the copy appears a little to the side, then you type its new <b>X</b> and <b>Y</b>. Do one together: X −15, Y 0.</p>' },
      { min: 22, title: 'Repeat it', html: '<p>Pupils follow the Lesson card. Before each copy, they say the next X out loud (−15, 0, 15, 30). Then they select every hole and the block and press <b>Group</b>.</p><p><b>Ask:</b> how many times did you repeat? Why 4 and not 5?</p>' },
      { min: 12, title: 'Change the pattern', html: '<p>Challenge: what would change for 6 pencils, 12 mm apart? Pupils write the new repeat (“5 times: add 12”) and work out the X numbers before trying it (Undo puts the old design back).</p>' },
      { min: 8, title: 'Share', html: '<p>Pupils read their design as a repeat. Link to code: in a program a loop does exactly this. Next lesson: the Toy Box has sent back a broken boat to debug.</p>' }
    ],
    support: 'Write the five X numbers on a card for pupils to tick off as they make each copy.',
    stretch: 'Make a second row of 5 holes behind the first (Y 8), or a bigger hole for a glue stick at one end. Is that still the same repeat?',
    assess: ['Repeats a part the right number of times', 'Keeps the spacing the same each time', 'Describes the steps as a count-controlled repeat'],
    steps: [
      { t: 'The order', d: 'Read the challenge card: 5 holes, all the same. The first hole is there at X -30.' },
      { t: 'The pattern', d: 'Each hole goes 15 mm to the right of the last one. Write the 5 X numbers: -30, -15, …' },
      { t: 'Repeat 4 times', d: 'Click the hole and press Duplicate. Type the new X and set Y to 0. Do it 4 times, adding 15 each time.' },
      { t: 'Group', d: 'Hold Shift and click every hole and the block (or press Ctrl+A), then press Group. The holes cut the block.' },
      { t: 'Check', d: 'Press Check & print. Do all the rules tick?' },
      { t: 'Change it', d: 'How would the repeat change for 6 pencils, 12 mm apart? Write it down, then try it.' }
    ]
  },
  {
    id: 'print-5-boat', unit: u(5), title: 'Debug the design: a toy boat', ...T, years: Y34,
    summary: 'The Toy Box has sent back a toy boat that won’t print. It has four bugs: the hull goes under the plate, the cabin floats in the air, the mast is too thin and the porthole cuts nothing. Pupils predict, use Check & print and Show me to find each bug, and fix them one at a time, testing after each fix.',
    objective: 'We are learning to find and fix bugs in a design by testing it and fixing one thing at a time.',
    success: ['I can use Check & print to test a design.', 'I can find a bug and say what is wrong.', 'I can fix one bug at a time and test again.'],
    curriculum: ['design', 'reason'],
    words: [['bug', 'a mistake that stops something working'], ['debug', 'find and fix the bugs'],
      ['test', 'check whether it works'], ['floating', 'not resting on the plate or on another part: a printer can’t print it']],
    need: [...DEV, 'A bug-hunt sheet: Bug · What was wrong · How I fixed it', PRINTER],
    plan: [
      { min: 8, title: 'Why it won’t print', html: '<p>Remind the class: a 3D printer builds from the plate upwards, one thin layer at a time. <b>Ask:</b> what would happen to a part floating in the air? A part 0.5 mm thin? A part under the plate? Introduce <b>bug</b> and <b>debug</b>.</p>' },
      { min: 10, title: 'Predict', html: '<p>Open the starter on the board. Turn the view (Home, Front, Side). <b>Before</b> pressing Check &amp; print, pairs predict what is wrong with the boat and write it on their sheet.</p>' },
      { min: 25, title: 'Debug it', html: '<p>Pupils press <b>Check &amp; print</b> and use <b>Show me</b> to see which part each problem is about. They fix <b>one bug at a time</b>, then test again. The bugs: the hull goes under the plate (Drop to plate), the cabin floats (Up 10), the mast is 0.5 mm wide (make it 3), the porthole isn’t grouped (Group it with the cabin).</p><p>Ask pupils to fill in the bug-hunt sheet as they go.</p>' },
      { min: 10, title: 'Bug swap', html: '<p>Pairs put ONE new bug into their boat (lift a part, or make something 0.5 mm thin) and swap screens. Their partner finds it with Check &amp; print.</p>' },
      { min: 7, title: 'Reflect', html: '<p><b>Ask:</b> why fix one bug at a time? Which bug did you predict, and which surprised you? Next lesson: your own design for a Maple Street shop.</p>' }
    ],
    support: 'Tell pupils how many bugs there are (4) and give the bug-hunt sheet with the four “What was wrong” boxes filled in.',
    stretch: 'Make the boat better once it prints: add a flag (a thin box on the mast, at least 1 mm thick) and check it again.',
    assess: ['Predicts problems before testing', 'Uses Check & print and Show me to find bugs', 'Fixes one bug at a time and tests again'],
    steps: [
      { t: 'Predict', d: 'Look at the boat from the Front and Side views. What do you think is wrong? Write it down.' },
      { t: 'Test', d: 'Press Check & print. Read each problem and press Show me to see which part it means.' },
      { t: 'Bug: under the plate', d: 'Click the blue hull and press Drop to plate.' },
      { t: 'Bug: floating cabin', d: 'Click the white cabin and set Up to 10, so it sits on the deck.' },
      { t: 'Bug: thin mast', d: 'Click the mast and make its Width and Depth 3.' },
      { t: 'Bug: the porthole', d: 'Shift-click the porthole hole and the cabin, then press Group.' },
      { t: 'Test again', d: 'Press Check & print after each fix. When it says Ready to print, every rule should tick.' }
    ]
  },
  {
    id: 'print-6-gift', unit: u(6), title: 'Project: a gift for a Maple Street shop', ...T, years: Y34,
    summary: 'The first design-and-make project. Pupils choose a shop on Maple Street and design something it could sell, using everything from Block 1: a written plan (algorithm), a parts table (decomposition), a repeated part (repetition) and testing and fixing (debugging).',
    objective: 'We are learning to plan, build and test a design of our own using algorithms, decomposition, repetition and debugging.',
    success: ['I can plan my design as parts and steps.', 'I can repeat a part to make a pattern.', 'I can test my design and fix the bugs.', 'I can say how my design meets the brief.'],
    curriculum: ['design', 'reason', 'ssr'],
    words: [['design brief', 'what the design must do, and its rules'], ['plan', 'the parts and steps, written before you build'],
      ['evaluate', 'say what is good and what could be better'], ['customer', 'the person the design is for']],
    need: [...DEV, 'A planning sheet: Shop · What it is · Parts table · Steps', PRINTER],
    plan: [
      { min: 8, title: 'The shops', html: '<p>Recap the shops the class has met: the Corner Café, Leaf &amp; Root, the Book Nook, the Toy Box. <b>Ask:</b> what else could they sell? Read the project brief: at least 4 shapes, one part repeated at least 3 times, no bigger than 100 × 100 × 60 mm, ready to print.</p>' },
      { min: 12, title: 'Plan', html: '<p>Pupils fill in the planning sheet: which shop, what the design is, a parts table (part, shape, size) and the steps, including the repeat (“3 times: duplicate, add 20 to X”). Check plans before building.</p>' },
      { min: 25, title: 'Make', html: '<p>Pupils build from their plan, ticking off parts. Remind them to test with Check &amp; print as they go and fix bugs one at a time. Ideas: a fence planter, a coaster with a pattern of holes, a bookend, a toy train with wheels.</p>' },
      { min: 10, title: 'Customer check', html: '<p>Pairs swap: one plays the shopkeeper and checks the design against the brief’s rules and against the plan. They give one star and one wish.</p>' },
      { min: 5, title: 'Celebrate', html: '<p>Choose two or three designs to print if you have a printer. Block 2 will add rules that check sizes for you: conditions.</p>' }
    ],
    support: 'Offer a ready plan (the fence planter: a base and 4 posts, 20 mm apart, with a rail along the top) to build and then change.',
    stretch: 'Use a repeat with a turn as well as a move (for example 6 copies, each Turn 30 more), or cut a pattern of holes.',
    assess: ['Plans the design as parts and steps before building', 'Uses a repeated part with even spacing', 'Tests and fixes the design until it is ready to print', 'Evaluates the design against the brief'],
    steps: [
      { t: 'Choose a shop', d: 'Which Maple Street shop is it for? What will you make? Read the challenge card.' },
      { t: 'Plan it', d: 'On paper, write a parts table (part, shape, size) and your steps. Which part will you repeat?' },
      { t: 'Build it', d: 'Build one part at a time from your plan. Tick each part off.' },
      { t: 'Repeat a part', d: 'Use Duplicate to repeat a part at least 3 times, moving it the same amount each time.' },
      { t: 'Test and fix', d: 'Press Check & print. Fix one bug at a time until every rule on the challenge card ticks.' },
      { t: 'Customer check', d: 'Swap with a partner. Do they think the shop would sell it? Ask for one star and one wish.' }
    ]
  },

  // ═══════════════════════ BLOCK 2 · ORDERS WITH RULES (Years 4–5) ═══════════════════════
  {
    id: 'print-7-bookmark', unit: u(7), title: 'Rules that check themselves: a bookmark', ...T, years: Y45,
    summary: 'The Book Nook orders a bookmark with exact rules. Pupils learn that each rule on a challenge card is a condition the computer tests: if the width is 160 mm or less, tick; else no tick. They predict which rules will tick, read the signs ≤ and ≥, and change the design until every condition is true.',
    objective: 'We are learning that a condition is a test that is either true or false, and to use comparisons (less than or equal to, more than or equal to).',
    success: ['I can say whether a condition is true or false.', 'I can read “no more than” as ≤ and “at least” as ≥.', 'I can predict which rules will tick and change my design to make them true.'],
    curriculum: ['design', 'reason'],
    words: [['condition', 'a test that is either true or false'], ['true / false', 'the two answers a condition can have'],
      ['≤ (no more than)', 'less than or equal to'], ['≥ (at least)', 'more than or equal to'], ['if … then', 'if the condition is true, then do something']],
    need: [...DEV, 'A real bookmark and a book', 'Mini whiteboards for true / false', PRINTER],
    plan: [
      { min: 8, title: 'True or false?', html: '<p>Quick-fire on whiteboards: “This book is at least 20 cm tall.” True or false? Measure it. “The table is no more than 70 cm high.” Introduce <b>condition</b>: a test that is true or false. Write <b>no more than = ≤</b> and <b>at least = ≥</b>.</p>' },
      { min: 10, title: 'The computer checks', html: '<p>Open the starter. Read each rule on the Book Nook’s challenge card and write it as a condition: <b>if width ≥ 140 then tick</b>; <b>if width ≤ 160 then tick</b>; <b>if height ≤ 3 then tick</b>. Click the bookmark: it is 100 wide and 5 tall. <b>Predict</b> together which rules are ticked, then check the card.</p>' },
      { min: 25, title: 'Make every condition true', html: '<p>Pupils follow the Lesson card. Before every change they predict which ticks will change. Encourage them to try a width of 170 too: which condition becomes false?</p>' },
      { min: 10, title: 'Make your own conditions', html: '<p>Pairs write two conditions of their own for a bookmark (“if it has a heart then tick”, “if the depth ≤ 30 then tick”) and test a partner’s design against them, saying true or false.</p>' },
      { min: 7, title: 'Reflect', html: '<p><b>Ask:</b> why are two rules (≥ 140 and ≤ 160) needed for the length? Next lesson: both at once — between two numbers.</p>' }
    ],
    support: 'Give a table: Rule · As a condition · My design · True or false? with the first two rows filled in.',
    stretch: 'Make a second bookmark that is true for every rule except one, and ask a partner to find the false one.',
    assess: ['Says whether a condition is true or false for a design', 'Reads ≤ and ≥ correctly', 'Predicts the effect of a change on each condition'],
    steps: [
      { t: 'Read the rules', d: 'Read the challenge card. Write each rule as “if … then tick”, e.g. if the width ≥ 140 then tick.' },
      { t: 'Predict', d: 'Click the bookmark: it is 100 wide and 5 tall. Which rules are true? Which are false? Check the card.' },
      { t: 'Long enough', d: 'Change the Width to 150. Which conditions changed to true?' },
      { t: 'Thin enough', d: 'Change the Height to 2. Now try Height 4. Which rule changes? Put it back to 2.' },
      { t: 'A word', d: 'Tap Text and type READ in the Text box. Set its Height to 1, Up to 2, X to 10 and Y to 0 so it lies on the bookmark.' },
      { t: 'A ribbon hole', d: 'Tap Hole cylinder: 5 wide, 5 deep, 6 tall, Up -1. Move it near one end (X -66), then Group it with the bookmark.' },
      { t: 'All true', d: 'Press Check & print. Is every condition on the challenge card true now?' }
    ]
  },
  {
    id: 'print-8-trophy', unit: u(8), title: 'Between two numbers: a trophy', ...T, years: Y45,
    summary: 'Maple Street School orders a sports day trophy that must be between 80 and 100 mm tall and between 40 and 60 mm wide. Pupils learn that “between” is two conditions joined with AND, both of which must be true, test values on a number line, then fix the starter trophy, which is far too tall, has no star and only one colour.',
    objective: 'We are learning to combine two conditions with AND, so both must be true.',
    success: ['I can write “between” as two conditions joined by AND.', 'I can test a number against both conditions.', 'I can change a design so every condition is true at once.'],
    curriculum: ['design', 'reason'],
    words: [['AND', 'joins two conditions: the answer is true only if both are true'], ['range', 'all the numbers between a smallest and a biggest'],
      ['between', 'at least the smallest AND no more than the biggest'], ['number line', 'a line showing numbers in order']],
    need: [...DEV, 'A number line from 0 to 150 on the board', PRINTER],
    plan: [
      { min: 8, title: 'AND', html: '<p>Play “Stand up if…”: “Stand up if you are wearing black shoes AND you have a pet.” <b>Ask:</b> why did fewer people stand? Introduce <b>AND</b>: both conditions must be true. Draw a number line and shade 80 to 100: “at least 80 AND no more than 100”.</p>' },
      { min: 10, title: 'Test some numbers', html: '<p>Test heights on the number line: 70 (first condition false), 90 (both true), 120 (second false). Open the starter and read the trophy’s rules as pairs joined with AND.</p>' },
      { min: 25, title: 'Fix the trophy', html: '<p>Pupils follow the Lesson card. The starter is 120 mm tall: the “no taller than 100” condition is false. They work out the column height so the whole trophy (base 10 + column + star 5) lands between 80 and 100 <b>before</b> typing it.</p><p><b>Ask:</b> what column heights would work? (65 to 85.)</p>' },
      { min: 10, title: 'Too small?', html: '<p>Pupils try a column of 50: which condition becomes false now? Then make it right again. They write the smallest and biggest column that works.</p>' },
      { min: 7, title: 'Reflect', html: '<p><b>Ask:</b> how is AND like the rules on the card (every rule must tick)? Next lesson: using a measurement from the real world as an input.</p>' }
    ],
    support: 'Give the sum on a card: 10 (base) + column + 5 (star) = total. Pupils try numbers for the column.',
    stretch: 'Add a name plate that keeps the trophy between 40 and 60 mm wide. Write the conditions it must meet first.',
    assess: ['Writes a range as two conditions joined with AND', 'Tests values against both conditions', 'Calculates a size that makes both conditions true'],
    steps: [
      { t: 'Read the rules', d: 'Find the two rules about height. Write them as one condition: height ≥ 80 AND height ≤ 100.' },
      { t: 'Test it', d: 'The trophy is 10 + 110 = 120 mm tall. Which height condition is false?' },
      { t: 'Work it out', d: 'Base 10 + column + star 5 must be between 80 and 100. Choose a column height that works.' },
      { t: 'Change the column', d: 'Click the gold column and type your Height. Did both height rules tick?' },
      { t: 'The star', d: 'Tap Star. Make it 40 wide, 40 deep, 5 tall, set X and Y to 0 and Up to the top of the column (10 + your column height).' },
      { t: 'Two colours', d: 'Click the base and choose a different colour. Every rule should tick now.' },
      { t: 'Too small?', d: 'Try a column of 50. Which condition is false? Put it back so everything ticks.' }
    ]
  },
  {
    id: 'print-9-fit', unit: u(9), title: 'Measure and test: a fit test card', ...T, years: Y45,
    summary: 'Printers aren’t perfectly exact, so a hole the same size as a pencil may be too tight. Pupils measure a real pencil (the input), then design a card with five holes that start at that size and get 0.4 mm wider each time. They plan how to use the printed card: if the pencil fits, that is our size, else try the next hole.',
    objective: 'We are learning to use a measurement as an input and to plan a test that decides what to do (if it fits … else …).',
    success: ['I can measure a real object and use the number in my design.', 'I can make a pattern that changes by the same amount each time.', 'I can write an if … else rule for using the test card.'],
    curriculum: ['design', 'reason', 'data'],
    words: [['input', 'information that goes into a design or a program, like a measurement'], ['tolerance', 'a little extra room so parts fit'],
      ['if … else', 'if the condition is true do one thing, else do another'], ['diameter', 'the distance across a circle, through the middle']],
    need: [...DEV, 'Pencils and rulers (or callipers if you have them)', 'Optional: a fit test card printed before the lesson', PRINTER],
    plan: [
      { min: 8, title: 'Will it fit?', html: '<p>Show a pencil and a hole cut in card exactly the same size. <b>Ask:</b> will it slide in? Introduce <b>tolerance</b>: a little extra room, because printers aren’t exact. How much extra? We need to <b>test</b> our printer.</p>' },
      { min: 10, title: 'The input', html: '<p>Pairs measure their pencil’s <b>diameter</b> (most are about 7 mm). This number is the <b>input</b> to the design. Open the starter: the card has one hole of 7 mm.</p>' },
      { min: 22, title: 'Make the test card', html: '<p>Pupils follow the Lesson card: each new hole is 0.4 mm wider than the last and 17 mm further along (7, 7.4, 7.8, 8.2, 8.6). <b>Ask:</b> what stays the same each time? What changes? (Spacing is a repeat; the size goes up by 0.4.)</p>' },
      { min: 12, title: 'If it fits…', html: '<p>Pairs write how to use the printed card as an if … else rule: <b>if</b> the pencil slides into the hole <b>then</b> write down that size <b>else</b> try the next, wider hole. <b>Ask:</b> what if none of them fit? (Make a new card starting wider.)</p>' },
      { min: 8, title: 'Reflect', html: '<p>If you have a printed card, try a pencil in it now and agree the class’s tolerance. Next lesson: a loop that keeps changing a design until every rule ticks.</p>' }
    ],
    support: 'Give the five hole sizes and X positions in a table to type in.',
    stretch: 'Make a second row for felt-tip pens (measure them first). Label the sizes with small Text.',
    assess: ['Measures an object and uses the measurement as an input', 'Makes a pattern that changes by a fixed amount', 'Writes an if … else rule for using the test'],
    steps: [
      { t: 'Measure', d: 'Measure across your pencil with a ruler. That is the input. Most pencils are about 7 mm.' },
      { t: 'The first hole', d: 'Click the hole on the card: it is 7 wide and 7 deep, at X -36. Change it to your pencil’s size if it is different.' },
      { t: 'The next holes', d: 'Duplicate the hole. Make the copy 0.4 mm wider and deeper, and 17 mm further along (X -19, Y 0). Do it until there are 5.' },
      { t: 'Group', d: 'Select the holes and the card (Ctrl+A) and press Group.' },
      { t: 'A label', d: 'Tap Text, type PENCIL and make it 5 deep, 1 tall, Up 3. Put it under the holes (X 0, Y -7).' },
      { t: 'If … else', d: 'Write how to use the card: if the pencil fits then … else … Then press Check & print.' }
    ]
  },
  {
    id: 'print-10-pot', unit: u(10), title: 'Keep going until it ticks: a plant pot', ...T, years: Y45,
    summary: 'Leaf & Root’s plant pot is too wide, too short, has walls only 1 mm thick and no drainage hole. Pupils work in a loop that checks a condition: change one thing, test, and repeat until every rule ticks. They record each pass of the loop, then compare it with a repeat-until loop in code.',
    objective: 'We are learning to repeat changes until a condition is met (a loop that checks a condition).',
    success: ['I can change one thing and test it, again and again.', 'I can say when to stop: when every rule is true.', 'I can record what I changed each time.'],
    curriculum: ['design', 'reason'],
    words: [['repeat until', 'keep doing something until a condition is true'], ['iterate', 'change, test, and go round again'],
      ['wall', 'the solid part round a hole'], ['drainage hole', 'a hole in the bottom so water can run out']],
    need: [...DEV, 'A loop record sheet: Pass · What I changed · Rules ticked', 'Optional: a real plant pot with a drainage hole', PRINTER],
    plan: [
      { min: 8, title: 'Repeat until', html: '<p>Game: a pupil guesses your number from 1 to 50; you only say “higher” or “lower”. <b>Ask:</b> when do they stop guessing? (When it is right.) Introduce <b>repeat until</b>: keep going until a condition is true.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter. Read the rules: only “Ready to print” ticks. Show how to <b>Ungroup</b> the pot to change the pot and its hole separately. Draw the loop on the board: <b>repeat until every rule ticks: change one thing → check the card.</b></p>' },
      { min: 25, title: 'Go round the loop', html: '<p>Pupils follow the Lesson card, filling in the loop record after each change. They change ONE thing per pass. When the walls are at least 2 mm, the pot is no wider than 80 and at least 60 tall, they add the drainage hole and Group everything.</p><p><b>Ask:</b> how many passes did you need? Did any change make a tick go away?</p>' },
      { min: 10, title: 'Loops in code', html: '<p>Show “repeat until” as a code block on the board: <b>repeat until all rules tick { change one thing }</b>. Compare with “repeat 4 times” from Block 1: one counts, the other checks a condition.</p>' },
      { min: 7, title: 'Reflect', html: '<p><b>Ask:</b> what would happen if the condition could never be true (e.g. a rule saying no wider than 5 mm)? Next lesson: debugging rules that are wrong.</p>' }
    ],
    support: 'Give the target numbers (pot 76 wide, 65 tall; hole 70 wide, Up 3) and ask pupils to change one per pass and note which rule ticks.',
    stretch: 'Add a saucer for the pot to stand in. Which rules must it keep? Keep going round the loop until they tick.',
    assess: ['Changes one thing at a time and tests after each change', 'Stops when the condition (every rule ticks) is met', 'Records each pass of the loop'],
    steps: [
      { t: 'Read the rules', d: 'Which rules tick? Which don’t? Write pass 0 on your loop record.' },
      { t: 'Ungroup', d: 'Click the pot and press Ungroup. Now you can change the pot and its hole one at a time.' },
      { t: 'Pass 1, 2, 3…', d: 'Change ONE number, then look at the card. Try the pot 76 wide and deep, and 65 tall. Write down what ticked.' },
      { t: 'Strong walls', d: 'Make the hole 70 wide, 70 deep and 65 tall, with Up 3, so the walls and floor are 3 mm.' },
      { t: 'Drainage', d: 'Tap Hole cylinder: 8 wide, 8 deep, 10 tall, Up -1, in the middle (X 0, Y 0).' },
      { t: 'Group', d: 'Press Ctrl+A, then Group. Keep going round the loop until every rule ticks.' }
    ]
  },
  {
    id: 'print-11-tag', unit: u(11), title: 'Debug the rules: a pet tag', ...T, years: Y45,
    summary: 'Pip’s Pet Parlour typed their order in a hurry, and two of the challenge’s rules have bugs: a wrong number (3 instead of 35) and the wrong comparison (at least instead of no more than). Pupils compare the customer’s words with each condition, fix the rules with Change, then fix the design’s own bug (no hole for the ring).',
    objective: 'We are learning to debug conditions: check that each rule really tests what we meant.',
    success: ['I can compare a rule with what the customer asked for.', 'I can spot a wrong number or a wrong comparison (≤ or ≥).', 'I can fix the rule and test the design again.'],
    curriculum: ['design', 'reason'],
    words: [['debug', 'find and fix mistakes'], ['logic error', 'a mistake in what a test checks, so it gives the wrong answer'],
      ['comparison', 'a test like ≤ (no more than) or ≥ (at least)'], ['requirement', 'something the customer asked for']],
    need: [...DEV, PRINTER],
    plan: [
      { min: 8, title: 'The rule was wrong', html: '<p>Tell a story: a sign says “Children must be at least 1 metre tall to go on the slide” but it should have said “no more than”. <b>Ask:</b> who would be let on? Introduce <b>logic error</b>: the test itself is wrong, so it gives the wrong answer.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter. Read the customer’s words on the challenge card, then each rule underneath. The tag looks right, yet two rules don’t tick. <b>Ask:</b> is the design wrong, or the rule? Pairs compare words and rules line by line.</p>' },
      { min: 25, title: 'Fix the rules, then the design', html: '<p>Pupils follow the Lesson card. They press <b>Change</b> on the challenge card, fix the width rule (3 → 35) and swap “At least … mm tall” for “No taller than … mm” with 4. Then they fix the design’s real bug: there’s no hole for the ring.</p>' },
      { min: 10, title: 'Bug swap', html: '<p>Pairs put one logic error into a rule (a wrong number or the wrong comparison) and swap. The partner finds it by comparing the rules with the customer’s words.</p>' },
      { min: 7, title: 'Reflect', html: '<p><b>Ask:</b> how did you know it was the rule and not the design that was wrong? Next lesson: you write the whole order yourself.</p>' }
    ],
    support: 'Underline the numbers in the customer’s words and ask pupils to find the same numbers in the rules.',
    stretch: 'Add a rule of your own that the customer would want (e.g. uses at least 2 colours) and change the tag to meet it.',
    assess: ['Compares each rule with the requirement it should test', 'Finds a wrong value and a wrong comparison', 'Retests after fixing the conditions'],
    steps: [
      { t: 'Words and rules', d: 'Read Pip’s words on the challenge card, then each rule. Do they say the same thing?' },
      { t: 'Bug 1: a number', d: 'Pip said no wider than 35 mm. Press Change on the challenge card and fix the number in that rule.' },
      { t: 'Bug 2: a comparison', d: 'Pip said no taller than 4 mm, but the rule says at least. Choose “No taller than … mm” and type 4. Press Save the challenge.' },
      { t: 'The design’s bug', d: 'The hole rule is still false. Tap Hole cylinder: 4 wide, 4 deep, 4 tall, Up -1, at X 0 and Y 10.' },
      { t: 'Group', d: 'Shift-click the hole and the pink disc, then press Group.' },
      { t: 'Test', d: 'Does every rule tick now? Press Check & print to be sure.' }
    ]
  },
  {
    id: 'print-12-order', unit: u(12), title: 'Project: write the order, then make it', ...T, years: Y45,
    summary: 'The Block 2 project. Pupils are the customer AND the designer: they write a challenge of their own with Make a challenge… (at least four rules, including a range made of two conditions), then design something that makes every condition true, and finally test a partner’s design against their rules.',
    objective: 'We are learning to write our own conditions and design something that meets them all.',
    success: ['I can write at least 4 rules for a design, including a range (between two numbers).', 'I can design something that makes every rule true.', 'I can test someone else’s design against my rules.'],
    curriculum: ['design', 'reason', 'ssr'],
    words: [['condition', 'a test that is true or false'], ['range', 'between a smallest and a biggest number'],
      ['criteria', 'the rules a design is judged against'], ['evaluate', 'judge how well it meets the criteria']],
    need: [...DEV, 'A planning sheet: Customer · What they want · My rules (as conditions)', PRINTER],
    plan: [
      { min: 8, title: 'Be the customer', html: '<p>Recap Block 2: conditions, ≤ and ≥, AND for a range, measuring as an input, repeat until, debugging rules. Pupils choose a customer on Maple Street and what they want.</p>' },
      { min: 12, title: 'Write the order', html: '<p>Show <b>Make a challenge…</b> in the Challenges section: a title, the customer’s words and rules (Add a rule). Pupils write at least 4 rules, including a range (e.g. At least 30 mm tall AND No taller than 40 mm) and Ready to print. Check that each rule matches the words (no logic errors!).</p>' },
      { min: 25, title: 'Make it', html: '<p>Pupils design to their own order, going round the loop (change, test) until every condition is true.</p>' },
      { min: 10, title: 'Customer check', html: '<p>Pairs swap screens. The customer reads their own rules aloud and tests the partner’s design: true or false for each one. One star and one wish.</p>' },
      { min: 5, title: 'Celebrate', html: '<p>Print two or three designs if you can. Block 3: variables, reusable parts and data, for the big commission.</p>' }
    ],
    support: 'Give a ready order to adapt (a ring holder: 30 to 40 mm tall, no wider than 40 mm, a hole, ready to print).',
    stretch: 'Add a rule that is hard to meet together with another (e.g. at least 5 shapes AND no wider than 30 mm) and solve it.',
    assess: ['Writes conditions that match the customer’s words, including a range', 'Designs until every condition is true', 'Evaluates a design against each condition'],
    steps: [
      { t: 'The customer', d: 'Choose a Maple Street customer and write what they want in one or two sentences.' },
      { t: 'Make a challenge', d: 'In Challenges, press Make a challenge… Type a title and the customer’s words.' },
      { t: 'Your rules', d: 'Press Add a rule until you have at least 4. Include a range: an At least rule AND a No more than rule for the same size. Press Save the challenge.' },
      { t: 'Design it', d: 'Build your design. Change one thing at a time until every rule ticks.' },
      { t: 'Check & print', d: 'Press Check & print and fix anything it finds.' },
      { t: 'Customer check', d: 'Swap with a partner. Read your rules aloud: true or false for their design?' }
    ]
  },

  // ═══════════════════════ BLOCK 3 · THE BIG COMMISSION (Years 5–6) ═══════════════════════
  {
    id: 'print-13-box', unit: u(13), title: 'Variables: a box with a wall', ...T, years: Y56,
    summary: 'Gem & Thread want a trinket box with walls exactly 3 mm thick. Pupils store the wall thickness in a variable called wall and calculate the hole from it (hole width = box width − 2 × wall, floor = wall). Then the customer changes their mind (wall = 4) and pupils see that one change to the variable updates every calculation.',
    objective: 'We are learning to use a variable: a name for a number that we use in calculations and can change in one place.',
    success: ['I can say what a variable is and give it a name and a value.', 'I can use a variable in a calculation.', 'I can change the variable and work out every size again.'],
    curriculum: ['design', 'reason'],
    words: [['variable', 'a name for a value that can change, like wall = 3'], ['value', 'what the variable holds right now'],
      ['calculation', 'working out a number from other numbers'], ['formula', 'a rule for a calculation, like hole width = width − 2 × wall']],
    need: [...DEV, 'A calculation sheet with a box for the variable “wall”', PRINTER],
    plan: [
      { min: 8, title: 'A name for a number', html: '<p>Write <b>wall = 3</b> on the board in a labelled box. <b>Ask:</b> if the box is 50 mm wide and has a wall on each side, how wide is the hole? Draw it: 50 − 3 − 3 = 44. Write it as a <b>formula</b>: hole width = width − 2 × wall. Introduce <b>variable</b>.</p>' },
      { min: 10, title: 'Calculate first', html: '<p>Pupils fill in the calculation sheet before touching the computer: hole width = 50 − 2 × wall, hole depth = 40 − 2 × wall, floor (Up) = wall. Open the starter: the hole is beside the box with the wrong size.</p>' },
      { min: 20, title: 'Make it', html: '<p>Pupils follow the Lesson card: type the calculated sizes, move the hole into the box, Group. The “walls at least 3 mm” rule tells them if their calculation was right.</p>' },
      { min: 15, title: 'The customer changes their mind', html: '<p>“Gem &amp; Thread want stronger walls: wall = 4.” Pupils change only the variable on their sheet, recalculate every size, Ungroup, and change the hole. <b>Ask:</b> how many numbers changed because of one variable? (Three.) Show how a program would do this: one variable, used in every calculation.</p>' },
      { min: 7, title: 'Reflect', html: '<p><b>Ask:</b> why is a variable better than typing 44 everywhere? Next lesson: a part you make once and use again with different inputs.</p>' }
    ],
    support: 'Give the formulas with the numbers filled in except the variable, so pupils only substitute wall.',
    stretch: 'Add a lid. Use the variable: the lid is width × depth × wall, with a lip that is 0.3 mm smaller than the hole on every side.',
    assess: ['Names a variable and gives it a value', 'Uses the variable in calculations before building', 'Changes the variable and recalculates every dependent size'],
    steps: [
      { t: 'The variable', d: 'On your sheet write wall = 3. The box is 50 wide, 40 deep, 30 tall.' },
      { t: 'Calculate', d: 'Hole width = 50 − 2 × wall. Hole depth = 40 − 2 × wall. Floor (Up) = wall. Work them out.' },
      { t: 'Size the hole', d: 'Click the hole beside the box. Type your Width, Depth and Up. Then set X to 0 and Y to 0 to move it into the box.' },
      { t: 'Group and test', d: 'Shift-click the hole and the box and press Group. Does the walls rule tick?' },
      { t: 'wall = 4', d: 'The customer wants wall = 4. Work out the new sizes, Ungroup, change the hole and Group again.' },
      { t: 'Check', d: 'Press Check & print. How many numbers changed when you changed one variable?' }
    ]
  },
  {
    id: 'print-14-knobs', unit: u(14), title: 'Make your own part: drawer knobs', ...T, years: Y56,
    summary: 'Ollie’s Workbench needs knobs for small, medium and large drawers. Pupils make one knob from a stem, a cap and a screw hole and group it: the group is like a procedure (a block of their own) that they define once. They then use it three times with a different input each time (its size: 24, 36 and 48 mm), keeping its shape.',
    objective: 'We are learning to make a reusable part (like a procedure) and use it again with different inputs.',
    success: ['I can group shapes into one part that I can reuse.', 'I can use my part again with a different input (size).', 'I can explain how a reusable part saves work, like a procedure in code.'],
    curriculum: ['design', 'reason'],
    words: [['procedure', 'a set of steps with a name that you can use again and again'], ['input', 'a value you give a procedure, like a size'],
      ['define', 'make the procedure (once)'], ['call', 'use the procedure'], ['scale', 'make bigger or smaller, keeping the shape']],
    need: [...DEV, 'Optional: real knobs of different sizes', PRINTER],
    plan: [
      { min: 8, title: 'Do it once, use it again', html: '<p>Write on the board: “make a knob” as a list of steps (stem, cap, screw hole). <b>Ask:</b> what if we need 30 knobs? Introduce <b>procedure</b>: give the steps a name, define them once, then <b>call</b> them. And if the knobs come in sizes? The procedure takes an <b>input</b>: knob(size).</p>' },
      { min: 10, title: 'Define the part', html: '<p>Open the starter: a stem, a dome cap and a screw hole, not yet joined. Pupils select all three and press <b>Group</b>: that is the definition of the part.</p>' },
      { min: 22, title: 'Call it three times', html: '<p>Pupils follow the Lesson card: Duplicate the knob twice, tick <b>Keep its shape when I change the size</b>, and type a Width for each: 24 (small), 36 (medium), 48 (large). The “same group 3 times” rule ticks only if all three come from the one part.</p>' },
      { min: 12, title: 'Change the definition', html: '<p><b>Ask:</b> Ollie now wants a flatter cap. What happens if we change one knob? Pupils try: Ungroup one, change it, regroup — the rule unticks, because it is no longer the same part. In code, you would change the procedure once and every call would change.</p>' },
      { min: 8, title: 'Reflect', html: '<p>Pupils write the knob as code-like steps: <b>knob(24) · knob(36) · knob(48)</b>. Next lesson: a phone stand, compared version by version.</p>' }
    ],
    support: 'Do the grouping together on the board; pupils focus on duplicating and setting the three sizes.',
    stretch: 'Make a second part of your own (a hook, or a handle) and use it at two sizes.',
    assess: ['Groups shapes into a reusable part', 'Reuses the part with different size inputs', 'Explains the link to defining and calling a procedure'],
    steps: [
      { t: 'The parts', d: 'A stem, a cap and a screw hole make one knob. Click each one and look at its size.' },
      { t: 'Define it', d: 'Press Ctrl+A to select all three, then press Group. That is your knob part.' },
      { t: 'Call it again', d: 'With the knob selected, press Duplicate twice. Move the copies apart (type new X numbers).' },
      { t: 'Inputs', d: 'Click a copy and tick Keep its shape when I change the size. Type Width 36. Make the other copy Width 48.' },
      { t: 'Check', d: 'Does the “same group 3 times” rule tick? Press Check & print.' },
      { t: 'Write it as code', d: 'Write your design as knob(24), knob(36), knob(48). What is the input?' }
    ]
  },
  {
    adopt: 'print-phone-stand', unit: u(15), years: Y56
  },
  {
    id: 'print-16-medals', unit: u(16), title: 'Data: 30 medals from one reel', ...T, years: Y56,
    summary: 'The school needs 30 medals and has one 250 g reel of plastic. Pupils collect data: they change one thing at a time (the thickness, then the width), read the plastic and print time from Check & print for each version, record it in a table, spot the pattern, and calculate whether 30 medals fit on the reel. They choose the version that does, using the data as evidence.',
    objective: 'We are learning to collect data in a table, spot a pattern and use calculations to make a decision.',
    success: ['I can change one thing at a time and record the result.', 'I can spot a pattern in my data.', 'I can calculate a total and use it to choose a design.'],
    curriculum: ['data', 'design', 'reason'],
    words: [['data', 'facts and numbers we collect'], ['fair test', 'changing only one thing at a time'],
      ['estimate', 'a careful guess, like the plastic and time Check & print shows'], ['total', 'the amount for all of them together']],
    need: [...DEV, 'A data table: Version · Width · Thickness · Plastic (g) · Time · × 30', 'Calculators', PRINTER],
    plan: [
      { min: 8, title: 'Will it fit on the reel?', html: '<p>Show (or describe) a reel of plastic: 250 g. The school wants 30 medals. <b>Ask:</b> how heavy can each medal be? (250 ÷ 30 ≈ 8 g; the brief says 6 g to leave some spare.) Open the starter and press <b>Check &amp; print</b>: about 9 g. 30 × 9 = 270 g: too much!</p>' },
      { min: 20, title: 'Collect the data', html: '<p>Pupils follow the Lesson card. Fair test first: change only the <b>thickness</b> (6, 5, 4, 3) and record the plastic each time; then only the <b>width</b>. They fill in the table and the × 30 column.</p>' },
      { min: 12, title: 'Spot the pattern', html: '<p><b>Ask:</b> what happens to the plastic when the thickness halves? Does width or thickness make more difference? Pairs sketch a quick bar chart of their thickness results.</p>' },
      { min: 12, title: 'Decide', html: '<p>Pupils choose the version to make (it must still have writing and a ribbon hole and be no more than 6 g), finish it and justify the choice with their data: “30 × 4 g = 120 g, so it fits on one reel with plastic to spare.”</p>' },
      { min: 8, title: 'Reflect', html: '<p><b>Ask:</b> why change only one thing at a time? What else would you collect data on (the print time for 30)? Next lesson: a formula for gears.</p>' }
    ],
    support: 'Give a table with the versions already listed; pupils only type the sizes and read the plastic.',
    stretch: 'Add the print time to the table and work out how many school days printing 30 medals would take if the printer runs 6 hours a day.',
    assess: ['Records data from a fair test in a table', 'Describes a pattern in the data', 'Uses a calculation from the data to justify a decision'],
    steps: [
      { t: 'Version 1', d: 'Press Check & print. Write the plastic (g) in your table. Times 30: does it fit on a 250 g reel?' },
      { t: 'Change the thickness', d: 'Click the gold disc. Try Height 5, then 4, then 3. Record the plastic each time (move the text Up to match).' },
      { t: 'Change the width', d: 'Keep the best thickness. Try Width and Depth 50, then 45. Record the plastic again.' },
      { t: 'Spot the pattern', d: 'Which change made the biggest difference? Draw a bar chart of your thickness data.' },
      { t: 'Finish it', d: 'Make a disc 45 wide, 45 deep, 3 tall, text Up 3, and a Hole cylinder (5 wide, 5 deep, 5 tall, Up -1, X 0, Y 16) grouped with the disc.' },
      { t: 'Decide', d: 'Is every rule ticked? Write: 30 × … g = … g, so …' }
    ]
  },
  {
    id: 'print-17-gears', unit: u(17), title: 'Formulas: a gear set that turns', ...T, years: Y56,
    summary: 'The Toy Box wants three gears that turn each other. Gears only mesh when their teeth are the same size, so pupils use two variables (teeth and tooth size) in a formula: width = teeth × tooth size. They work out why the starter’s two gears don’t mesh (2.5 mm vs 1.7 mm teeth), fix the big gear and add a third, calculating each width before making it.',
    objective: 'We are learning to use a formula with variables to calculate sizes, and to check our answers.',
    success: ['I can calculate with a formula that uses two variables.', 'I can use the formula to explain why something doesn’t work.', 'I can use the formula to design new parts that work together.'],
    curriculum: ['design', 'reason', 'data'],
    words: [['formula', 'a rule for working something out, like width = teeth × tooth size'], ['variable', 'a named value that can change'],
      ['mesh', 'when gear teeth fit together so one gear turns the other'], ['ratio', 'how many times one gear turns for each turn of another']],
    need: [...DEV, 'Calculators', 'Optional: real toy gears', PRINTER],
    plan: [
      { min: 8, title: 'Why gears mesh', html: '<p>Show two gears (real or on the board). <b>Ask:</b> what has to be the same for the teeth to fit together? The tooth size. Write the formula: <b>tooth size = width ÷ teeth</b>, so <b>width = teeth × tooth size</b>.</p>' },
      { min: 12, title: 'Debug with the formula', html: '<p>Open the starter. Click each gear and read its Width and Teeth. Calculate: 30 ÷ 12 = 2.5 mm; 40 ÷ 24 ≈ 1.7 mm. The “same size teeth” rule is false. <b>Ask:</b> what width should the 24-tooth gear be? (24 × 2.5 = 60.)</p>' },
      { min: 22, title: 'Make the set', html: '<p>Pupils follow the Lesson card: fix the big gear, then add a third gear with 18 teeth, calculating its width first (45). They place the gears in a row, nearly touching, with a gap of about 1 mm so they print as separate pieces.</p>' },
      { min: 10, title: 'Turns and ratios', html: '<p><b>Ask:</b> when the small gear (12 teeth) turns twice, how many times does the big gear (24 teeth) turn? Pupils work out the ratios for their set.</p>' },
      { min: 8, title: 'Reflect', html: '<p><b>Ask:</b> how did the formula help you find the bug? What else could you work out with variables? Next lesson: the final project for the Maple Street Fair.</p>' }
    ],
    support: 'Give a table: Gear · Teeth · Tooth size · Width = teeth × tooth size, with the first row done.',
    stretch: 'Add a fourth gear with 30 teeth. Then make a hole in each gear bigger for a pencil axle (use your fit test results).',
    assess: ['Calculates with a formula that has two variables', 'Uses the formula to explain a bug', 'Calculates sizes for new parts that work together'],
    steps: [
      { t: 'Read the gears', d: 'Click each gear. Write down its Width and Teeth.' },
      { t: 'Tooth size', d: 'Work out tooth size = width ÷ teeth for each gear. Are they the same?' },
      { t: 'Fix the big gear', d: 'Width = teeth × tooth size = 24 × 2.5. Type that Width and Depth for the orange gear.' },
      { t: 'A third gear', d: 'Tap Gear (in Parts). Set Teeth to 18 and work out its Width and Depth with the formula.' },
      { t: 'Line them up', d: 'Put the gears in a row so their teeth nearly touch (about 1 mm apart). Does the gear rule tick?' },
      { t: 'Ratios', d: 'If the 12-tooth gear turns twice, how many turns does the 24-tooth gear make? Press Check & print.' }
    ]
  },
  {
    id: 'print-18-fair', unit: u(18), title: 'Project: the Maple Street Fair', ...T, years: Y56,
    summary: 'The final project. Every shop on Maple Street will sell the class’s designs at the fair. Pupils design a small product range that combines the whole unit: a reusable grouped part used at two or more sizes (procedure with an input), walls calculated from a variable, a plastic budget checked with data, and a plan, tests and fixes throughout.',
    objective: 'We are learning to combine variables, reusable parts, data and testing to design a product range for a real customer.',
    success: ['I can use a variable in my calculations.', 'I can reuse a part I made at two or more sizes.', 'I can use data to show my range keeps to the plastic budget.', 'I can evaluate my range against the brief.'],
    curriculum: ['design', 'reason', 'data', 'ssr'],
    words: [['product range', 'one design made in several sizes or versions'], ['budget', 'the most you are allowed to use'],
      ['evaluate', 'judge how well it meets the brief, with evidence'], ['commission', 'an order for a design from a customer']],
    need: [...DEV, 'A project sheet: Customer · Variables · Parts · Data table · Evaluation', 'Calculators', PRINTER],
    plan: [
      { min: 8, title: 'The fair', html: '<p>Announce the <b>Maple Street Fair</b>. Each pair designs a product range for one shop. Read the brief: one part grouped and used at 2 or more sizes, walls at least 2 mm, no more than 40 g of plastic for the whole range, ready to print.</p>' },
      { min: 12, title: 'Plan', html: '<p>Pupils fill in the project sheet: the variables (e.g. wall = 2.5), the formulas they will use, the part they will reuse and its sizes, and a data table for plastic.</p>' },
      { min: 25, title: 'Make, test, improve', html: '<p>Pupils build, using everything from the unit. They record the plastic for each version in their data table and go round the loop until every rule ticks. Examples: pots in two sizes for Leaf &amp; Root, a set of nesting trays for Gem &amp; Thread, cups for the café’s pens.</p>' },
      { min: 10, title: 'Fair preview', html: '<p>Pairs present their range to another pair, as if to the shopkeeper, using their data: “Our range uses 25 g, so we could make one and a half sets from…”. Partners evaluate against every rule.</p>' },
      { min: 5, title: 'Celebrate', html: '<p>Choose designs to print for a real fair or display. Look back at the whole unit: algorithms, decomposition, repetition, debugging, conditions, loops, variables, procedures and data.</p>' }
    ],
    support: 'Start from a pot made from a cylinder and a hole (wall 3) and use it at two sizes.',
    stretch: 'Add a third size and a matching lid for each, calculated from the same variables. Keep to the budget.',
    assess: ['Uses a variable and formulas in the design', 'Reuses a grouped part at different sizes', 'Uses data to show the range is within budget', 'Evaluates the range against the brief'],
    steps: [
      { t: 'Choose a shop', d: 'Which shop is your range for? What will you make? Read the challenge card.' },
      { t: 'Variables', d: 'Write your variables (e.g. wall = 3) and the formulas for each size.' },
      { t: 'Make the part', d: 'Build one part and Group it. Check the walls rule ticks.' },
      { t: 'Different sizes', d: 'Duplicate it and change its size (tick Keep its shape). Make at least 2 sizes.' },
      { t: 'Data', d: 'Press Check & print. Record the plastic. Is the whole range 40 g or less?' },
      { t: 'Improve', d: 'Change one thing at a time until every rule ticks. Write how your range meets the brief.' }
    ]
  }
];

export const SLIDES = {
  // the adopted keyring lesson's slides, with the last note pointing on to the next lesson in this unit
  'print-keyring': [
    { t: 'Who designed this?', q: 'What simple shapes is a keyring made of?', b: ['A flat box (the tag)', 'A ring (the hole)', 'Some letters on top'], notes: 'Hold up a real keyring or toy. Everything made in a factory was designed on a computer first, often from simple shapes like these.' },
    { t: 'Millimetres', lead: '10 mm = 1 cm. Each square on the build plate is 10 mm.', b: ['A pocket keyring: no wider than 70 mm', 'A tag: about 3 mm thick', 'A hole for the ring: about 6 mm'], notes: 'Pairs show 60 mm and 3 mm on a ruler. Printers work in millimetres, so designers do too.' },
    { t: 'The design brief', pic: true, lead: 'A brief says what the design has to do. Our rules tick themselves.', b: ['No wider than 70 mm', 'No taller than 8 mm', 'Has writing on it', 'Has a hole cut out', 'Ready to print'], notes: 'Open the starter and read the challenge card at the top left.' },
    { t: 'Holes cut when grouped', lead: 'A hole on its own does nothing. Group it with a shape to cut it out.', b: ['1. Put the hole where the gap should be', '2. Shift-click the hole and the tag', '3. Press Group'], notes: 'Show this on the board before pupils try. Ask why the hole doesn’t cut until it is grouped (the computer needs to know which shape to cut).' },
    { use: 'steps' },
    { t: 'Check before you print', q: 'Why check a design before we print it?', b: ['Floating parts would fall', 'Too thin parts break', 'Printing takes time and plastic'], notes: 'Check & print shows the plastic and the time it would take. Printing a mistake wastes both. Next Maple Street lesson: a bird box for the garden centre, broken down into parts.' }
  ],
  'print-1-stand': [
    { t: 'Welcome to Maple Street Makers', pic: true, lead: 'This year you run a design workshop. The shops on Maple Street send in orders.', b: ['Design it on the computer', 'Check it against the order', 'Make it on a 3D printer'], notes: 'Introduce the unit. Every lesson a shop sends an order (a design brief) whose rules tick themselves. First order: Rosa at the Corner Café.' },
    { t: 'Algorithms', q: 'Which instructions would you rather follow?', b: ['“Draw a box.”', '“Draw a rectangle 6 squares wide and 4 squares tall.”'], notes: 'Warm-up with drawing on the board. An algorithm is exact steps in the right order.' },
    { t: 'The plan', table: [['Step', 'Shape', 'Size (mm)', 'Where'], ['1', 'Box (the base)', '60 × 20 × 5', 'already there'], ['2', 'Box (the back)', '60 × 4 × 40', 'Y 8'], ['3', 'Text (the number)', 'Height 2', 'Up 5, Y -4']], notes: 'Pupils follow this plan exactly. Width is left to right, Depth is front to back, Height is how tall.' },
    { use: 'steps' },
    { t: 'Was the plan exact?', q: 'Could your partner follow your plan without asking you anything?', b: ['One step per line', 'Every size given', 'In an order that works'], notes: 'Partners follow each other’s plans exactly. Next lesson: a keyring.' }
  ],
  'print-3-birdbox': [
    { t: 'A bird box for Leaf & Root', pic: true, q: 'Where would you start?', notes: 'Show a real bird box if you can. Collect ideas before introducing decompose.' },
    { t: 'Decompose', lead: 'Break a big job into smaller parts.', table: [['Part', 'Shape', 'Size (mm)'], ['Base', 'Box', '60 × 60 × 4'], ['Box', 'Box', '50 × 50 × 60'], ['Roof', 'Roof', '60 × 60 × 20'], ['Door', 'Hole cylinder, Tip 90', '25 across'], ['Perch', 'Cylinder, Tip 90', '6 across, 10 long']], notes: 'Pupils make their own table first; this one is for checking.' },
    { t: 'A door in the front', b: ['Tip 90 turns the cylinder to point through the front', 'Group the hole with the box to cut it', 'The perch must touch the box, or it floats'], notes: 'Demonstrate Tip in the panel.' },
    { use: 'steps' },
    { t: 'How did breaking it down help?', q: 'Which part could you break down even further?', notes: 'Next lesson: repeating a part with a pattern.' }
  ],
  'print-4-pencils': [
    { t: 'A pencil block for the Book Nook', pic: true, lead: '5 pencils in a row, all the same distance apart.', notes: 'Lay five pencils 15 mm apart on the visualiser.' },
    { t: 'Repeat', lead: 'Put the first hole at X -30. Repeat 4 times: duplicate, add 15 to X.', table: [['Hole', '1', '2', '3', '4', '5'], ['X', '-30', '-15', '0', '15', '30']], notes: 'Count-controlled repetition: we know how many times before we start.' },
    { use: 'steps' },
    { t: 'Change the pattern', q: '6 pencils, 12 mm apart: how many repeats? What are the X numbers?', notes: 'Pupils write the new repeat before they try it. In code, a loop does exactly this.' }
  ],
  'print-5-boat': [
    { t: 'The boat came back', pic: true, q: 'Why won’t it print? Predict before you test.', notes: 'Let pupils turn the view and predict.' },
    { t: 'How a printer builds', b: ['From the plate upwards, one thin layer at a time', 'Nothing can float in the air', 'Parts thinner than 1 mm break', 'A hole cuts only when it’s grouped'], notes: 'These are the rules Check & print tests.' },
    { t: 'Debug one bug at a time', b: ['Test: Check & print', 'Find: Show me', 'Fix ONE thing', 'Test again'], notes: 'Fill in the bug-hunt sheet as you go.' },
    { use: 'steps' },
    { t: 'Bug swap', q: 'Put one new bug into your boat. Can your partner find it?', notes: 'Finish by asking why one bug at a time is a good idea.' }
  ],
  'print-6-gift': [
    { t: 'Project: a gift for a Maple Street shop', lead: 'Plan it, build it, test it, sell it!', b: ['At least 4 shapes', 'One part repeated at least 3 times', 'No bigger than 100 × 100 × 60 mm', 'Ready to print'], notes: 'The challenge card shows these rules.' },
    { t: 'Plan first', table: [['Part', 'Shape', 'Size (mm)', 'Repeated?'], ['', '', '', ''], ['', '', '', '']], notes: 'Pupils fill in the planning sheet before they build.' },
    { use: 'steps' },
    { t: 'Customer check', q: 'Would the shop sell it?', b: ['One star', 'One wish'], notes: 'Celebrate Block 1: algorithms, decomposition, repetition and debugging.' }
  ],
  'print-7-bookmark': [
    { t: 'True or false?', q: 'This book is at least 20 cm tall.', notes: 'Whiteboards: true or false. Measure to check.' },
    { t: 'Conditions', lead: 'A condition is a test that is true or false.', b: ['no more than = ≤', 'at least = ≥', 'if width ≥ 140 then tick'], notes: 'Each rule on the challenge card is a condition the computer tests.' },
    { t: 'The Book Nook’s order', pic: true, table: [['Rule', 'As a condition', 'Starter', 'True?'], ['At least 140 mm wide', 'width ≥ 140', '100', 'false'], ['No wider than 160 mm', 'width ≤ 160', '100', 'true'], ['No taller than 3 mm', 'height ≤ 3', '5', 'false']], notes: 'Predict each before checking the card.' },
    { use: 'steps' },
    { t: 'Why two rules for the length?', q: 'What if there was only “at least 140”?', notes: 'A 500 mm bookmark would pass! Next lesson: between two numbers.' }
  ],
  'print-8-trophy': [
    { t: 'Stand up if…', q: 'You have black shoes AND a pet.', notes: 'Fewer people stand: both conditions must be true.' },
    { t: 'Between = two conditions', lead: 'height ≥ 80 AND height ≤ 100', table: [['Height', '≥ 80?', '≤ 100?', 'Both?'], ['70', 'false', 'true', 'false'], ['90', 'true', 'true', 'true'], ['120', 'true', 'false', 'false']], notes: 'Shade 80–100 on a number line.' },
    { t: 'The trophy', pic: true, lead: '10 (base) + column + 5 (star) must be between 80 and 100.', notes: 'Pupils calculate the column height before typing it: anything from 65 to 85 works.' },
    { use: 'steps' },
    { t: 'AND everywhere', q: 'How is the challenge card like one big AND?', notes: 'Every rule must be true for the challenge to be complete.' }
  ],
  'print-9-fit': [
    { t: 'Will it fit?', q: 'A 7 mm pencil in a 7 mm hole?', notes: 'Printers are not perfectly exact; plastic spreads a little. We need tolerance.' },
    { t: 'The input', lead: 'Measure the pencil. That number goes into the design.', pic: true, notes: 'Most pencils are about 7 mm across.' },
    { t: 'The test card', table: [['Hole', '1', '2', '3', '4', '5'], ['Size (mm)', '7.0', '7.4', '7.8', '8.2', '8.6'], ['X', '-36', '-19', '-2', '15', '32']], notes: 'The spacing repeats; the size goes up by 0.4 each time.' },
    { use: 'steps' },
    { t: 'If … else', code: 'for each hole, smallest first:\n  if the pencil slides in\n    write down this size\n  else\n    try the next hole', notes: 'Use a printed card now if you have one, and agree the class tolerance.' }
  ],
  'print-10-pot': [
    { t: 'Guess my number', q: 'When do you stop guessing?', notes: 'When it is right: repeat until a condition is true.' },
    { t: 'Leaf & Root’s pot', pic: true, b: ['Too wide', 'Too short', 'Walls only 1 mm', 'No drainage hole'], notes: 'Only Ready to print ticks at the start.' },
    { t: 'The loop', code: 'repeat until every rule ticks\n  change one thing\n  check the card', notes: 'Pupils record each pass: what changed, what ticked.' },
    { use: 'steps' },
    { t: 'Two kinds of loop', table: [['Loop', 'Stops when…', 'Example'], ['repeat 4 times', 'it has counted 4', 'the pencil holes'], ['repeat until', 'a condition is true', 'the plant pot']], notes: 'Next lesson: when the rules themselves are wrong.' }
  ],
  'print-11-tag': [
    { t: 'The slide sign', q: '“You must be AT LEAST 1 metre tall to go on the slide.” But it should say NO MORE THAN. Who gets on?', notes: 'A logic error: the test itself is wrong.' },
    { t: 'Pip’s order', pic: true, lead: 'Compare the words with every rule.', b: ['Words: no wider than 35 mm', 'Rule: No wider than 3 mm', 'Words: no taller than 4 mm', 'Rule: At least 4 mm tall'], notes: 'Two bugs: a wrong number and a wrong comparison.' },
    { t: 'Rule or design?', b: ['Fix the rules with Change', 'Then fix the design: it has no hole for the ring', 'Test again'], notes: 'Pupils press Change on the challenge card to edit the rules.' },
    { use: 'steps' },
    { t: 'Bug swap', q: 'Put one logic error into a rule. Can your partner find it?', notes: 'Next lesson: pupils write the whole order themselves.' }
  ],
  'print-12-order': [
    { t: 'Project: write the order, then make it', lead: 'You are the customer AND the designer.', b: ['At least 4 rules', 'A range: At least … AND No more than …', 'Ready to print'], notes: 'Recap Block 2 first.' },
    { t: 'Make a challenge…', b: ['A title', 'The customer’s words', 'Add a rule (at least 4)', 'Save the challenge'], notes: 'Check that every rule matches the words — no logic errors.' },
    { use: 'steps' },
    { t: 'Customer check', q: 'True or false for each of your rules?', notes: 'Partners test each other’s designs. Block 3: variables, reusable parts and data.' }
  ],
  'print-13-box': [
    { t: 'A trinket box for Gem & Thread', pic: true, lead: 'Walls and floor exactly 3 mm thick.', notes: 'Draw the box from above with a wall on each side.' },
    { t: 'A variable', code: 'wall = 3\nhole width = 50 − 2 × wall   (44)\nhole depth = 40 − 2 × wall   (34)\nfloor (Up) = wall            (3)', notes: 'A variable is a name for a value. Calculate before building.' },
    { use: 'steps' },
    { t: 'The customer changes their mind', code: 'wall = 4\nhole width = 50 − 2 × wall   (?)\nhole depth = 40 − 2 × wall   (?)\nfloor (Up) = wall            (?)', notes: 'One change to the variable changes three numbers.' },
    { t: 'Why use a variable?', q: 'Why not just type 44 everywhere?', notes: 'Change it in one place and every calculation follows. Next lesson: reusable parts.' }
  ],
  'print-14-knobs': [
    { t: 'Knobs for Ollie’s Workbench', pic: true, q: 'Small, medium and large drawers: do we design three knobs?', notes: 'Introduce procedure: define once, call many times.' },
    { t: 'A procedure with an input', code: 'define knob(size):\n  stem, cap, screw hole\n\nknob(24)\nknob(36)\nknob(48)', notes: 'Group = the definition. Duplicate + resize = calling it with an input.' },
    { use: 'steps' },
    { t: 'Change the definition', q: 'What if Ollie wants a flatter cap on every knob?', notes: 'In code, change the procedure once and every call changes.' }
  ],
  'print-16-medals': [
    { t: '30 medals, one reel', pic: true, lead: 'A reel holds 250 g. 30 medals × 9 g = 270 g. Too much!', notes: 'Press Check & print on the starter to read the 9 g.' },
    { t: 'A fair test', table: [['Version', 'Thickness', 'Width', 'Plastic (g)', '× 30'], ['1', '6', '60', '', ''], ['2', '5', '60', '', ''], ['3', '4', '60', '', ''], ['4', '3', '60', '', '']], notes: 'Change only one thing at a time.' },
    { use: 'steps' },
    { t: 'Spot the pattern', q: 'Which made the bigger difference: thickness or width?', notes: 'Pupils sketch a bar chart.' },
    { t: 'Decide with data', lead: '“30 × … g = … g, so it fits on one reel.”', notes: 'Every rule must still tick. Next lesson: a formula for gears.' }
  ],
  'print-17-gears': [
    { t: 'A gear set for the Toy Box', pic: true, q: 'Why won’t these two gears turn each other?', notes: 'Click each gear and read its Width and Teeth.' },
    { t: 'The formula', code: 'tooth size = width ÷ teeth\nwidth = teeth × tooth size\n\n30 ÷ 12 = 2.5\n40 ÷ 24 ≈ 1.7   ← the bug', notes: 'Gears mesh only when the tooth size is the same.' },
    { use: 'steps' },
    { t: 'Ratios', table: [['Small gear turns', 'Teeth', 'Big gear turns'], ['2', '12 → 24', '1'], ['3', '12 → 18', '?']], notes: 'Work out the ratios for the whole set.' }
  ],
  'print-18-fair': [
    { t: 'The Maple Street Fair', lead: 'Design a product range for one shop.', b: ['A grouped part used at 2 or more sizes', 'Walls at least 2 mm', 'No more than 40 g for the whole range', 'Ready to print'], notes: 'The final project brings the whole unit together.' },
    { t: 'Plan with variables and data', table: [['Size', 'Variables and formulas', 'Plastic (g)'], ['Small', '', ''], ['Large', '', ''], ['Total', '', '≤ 40']], notes: 'Pupils plan before they build.' },
    { use: 'steps' },
    { t: 'Present your range', q: 'How does your range meet the brief? Show your data.', notes: 'Partners evaluate against every rule.' },
    { t: 'Maple Street Makers!', b: ['Algorithms and decomposition', 'Repetition and debugging', 'Conditions and loops', 'Variables, reusable parts and data'], notes: 'Celebrate the whole unit.' }
  ]
};
