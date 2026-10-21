// The Turtle Lab's lesson unit — see lessons/units/README.md. lessons.js merges it in.
// DRIFTWOOD BAY ARTISTS: Tilly, a young sea turtle, is the new artist of Driftwood Bay, a little seaside town. Everyone in the
// bay has a drawing job for her — Captain Pearl the harbour master (maps and the regatta), Mrs Kelp at the beach café (signs
// and surveys), Mr Gull the lighthouse keeper, and the festival team (bunting, the fair, fireworks). Pupils write the typed
// Logo that tells Tilly what to draw.
// Block 1 Mapping the bay (Years 3–4) · Block 2 Festival week (Years 4–5) · Block 3 Building the seafront (Years 5–6).
// Lesson 6 of each block is a design-and-make project. The Turtle Lab's two earlier lessons (turtle-shapes, turtle-procedures)
// are folded in with { adopt }. Starters + answers: lessons/builds/bay/bay.mjs; test: tests/unit-turtle.test.mjs.
// The Turtle Lab has no events or messages (a program runs from top to bottom when Run is pressed), so the unit teaches
// sequence, repetition, selection, condition-checked loops, variables, procedures with inputs and data instead.
const N = 'Driftwood Bay Artists';
const u = (b, m) => `${N} · Block ${b} · Lesson ${(b - 1) * 6 + m}`; // m = the lesson in its block; the unit counts on through every block
const T = { ks: 'ks2', minutes: 60, type: 'turtle', tool: 'Turtle Lab (typed Logo)' };
const B1 = { ...T, years: 'Years 3–4' }, B2 = { ...T, years: 'Years 4–5' }, B3 = { ...T, years: 'Years 5–6' };
const DEV = ['A device per pupil or pair, with CodeJump open', 'The board, to show the class'];

export const LESSONS = [
  // ═══════════════════════ BLOCK 1 · MAPPING THE BAY (Years 3–4) ═══════════════════════
  {
    id: 'bay-1-jetty', unit: u(1, 1), title: 'Walk to the jetty', ...B1,
    summary: 'The first Driftwood Bay lesson. Tilly the turtle must walk from the beach hut to the jetty without going through the rock pool or the sandcastle. Pupils plan the route on squared paper, then type it as an algorithm of fd, rt and lt commands.',
    objective: 'We are learning to plan an algorithm and turn it into exact typed commands.',
    success: ['I can plan a route before I code it.', 'I can use fd, rt and lt to move the turtle.', 'I can test my route and fix it if it goes wrong.'],
    curriculum: ['design', 'reason'],
    words: [['algorithm', 'a set of exact steps, in the right order, to do a job'], ['command', 'one instruction, like fd 100'], ['fd', 'forward: move this many steps'], ['rt / lt', 'turn right or left this many degrees'], ['debug', 'find and fix a mistake']],
    need: [...DEV, 'Squared paper and a pencil per pair (one square = 50 steps)', 'Optional: a printout of the map from the starter'],
    plan: [
      { min: 8, title: 'Welcome to Driftwood Bay', html: '<p>Tell the class that this term they will help <b>Tilly</b>, a young sea turtle who has just become the artist of Driftwood Bay, a little seaside town. Everyone in the bay has a drawing job for her, and the class will write the instructions. Tilly only understands typed commands: <code>fd 100</code> (forward 100 steps), <code>rt 90</code> (turn right 90 degrees) and <code>lt 90</code> (turn left).</p><p>Warm up: a pupil is “Tilly” and walks across the classroom. Give exact commands: “fd 3 steps, rt 90, fd 2 steps.” Then a vague one: “go round the table.” <b>Ask:</b> which worked? Why does a computer need exact commands? Introduce <b>algorithm</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter (<b>Open the starter</b>) and press <b>Run</b>. Captain Pearl the harbour master needs Tilly to walk from the orange beach hut (bottom left) to the bottom of the brown jetty (top right). She must not walk through the grey rock pool or the gold sandcastle. Each grey square is 50 steps.</p><p>The starter already has <code>fd 100</code>. <b>Ask:</b> where does Tilly stop? (Two squares up.) Which way must she turn next? Type <code>rt 90</code> on a new line under <code>fd 100</code> and press Run: she turns but does not move. We need another <code>fd</code>!</p>' },
      { min: 10, title: 'Plan it on paper', html: '<p>Pairs draw the map on squared paper (or use a printout) and plan Tilly’s route as a list: <code>fd 100</code>, <code>rt 90</code>, <code>fd …</code>. They count squares and multiply by 50. Check each plan: “Read me your algorithm. Where does Tilly turn?”</p>' },
      { min: 22, title: 'Your turn', html: '<p>Pupils follow the Lesson card: type the plan under <code>fd 100</code> (one command per line), press Run, and fix it until the red line ends at the jetty without crossing the rocks or the sandcastle.</p><p>One answer: <code>fd 100</code>, <code>rt 90</code>, <code>fd 400</code>, <code>lt 90</code>, <code>fd 250</code>. Common bugs: rt and lt mixed up (stand up and turn with Tilly), counting squares but forgetting to multiply by 50, typing <code>fd100</code> with no space (the status line says it doesn’t understand). Ask “what does the status line say?” before helping.</p>' },
      { min: 10, title: 'Share', html: '<p>Two pairs show different routes on the board. Read each one out as an algorithm. <b>Ask:</b> which route is shorter? Which has fewer commands? Did anyone go straight up first? (Through the rock pool!) Next lesson: Mrs Kelp at the beach café needs a sign.</p>' }
    ],
    support: 'Give pairs a route card with the turns already written in (rt 90, lt 90); they work out the fd numbers by counting squares.',
    stretch: 'Plan a second route that goes round the other side of the sandcastle, then add a route back from the jetty to the beach hut in another colour (setpencolor "blue).',
    assess: ['Plans a route on paper before typing it', 'Types fd, rt and lt commands that match the plan', 'Tests the route and corrects a wrong number or turn'],
    steps: [
      { t: 'Meet Tilly', d: 'Press Run. Tilly is at the orange beach hut. She must walk to the bottom of the brown jetty, top right. Don’t go through the rock pool or the sandcastle!' },
      { t: 'Plan the route', d: 'On squared paper, plan the way to the jetty. Each grey square is 50 steps. Write the commands: fd, rt or lt.' },
      { t: 'Turn', d: 'Under fd 100, type rt 90 on a new line. Press Run. Tilly turns to face right.' },
      { t: 'Keep going', d: 'Type the rest of your plan, one command on each line, like fd 400 and lt 90. Press Run after each one.' },
      { t: 'Test and fix', d: 'Does the red line stop at the jetty? Does it miss the rocks and the sandcastle? If not, change a number and Run again.' },
      { t: 'Challenge', d: 'Add a way back to the beach hut. Type setpencolor "blue first so the way back is blue.' }
    ]
  },
  {
    id: 'bay-2-sign', unit: u(1, 2), title: 'A sign for the café', ...B1,
    summary: 'Mrs Kelp at the beach café needs a sign: a post, a board and an arrow. Pupils decompose the sign into parts, write a longer sequence for each part, and use pu and pd to move between parts without leaving a line.',
    objective: 'We are learning to break a drawing into parts and write a longer sequence of commands for each part.',
    success: ['I can break a picture into smaller parts.', 'I can write a sequence of commands to draw a rectangle.', 'I can use pu and pd to move without drawing.'],
    curriculum: ['design', 'ssr'],
    words: [['decompose', 'break a big job into smaller parts'], ['sequence', 'the order the commands go in'], ['pu', 'pen up: move without drawing'], ['pd', 'pen down: start drawing again'], ['setxy', 'jump to a spot, like setxy -60 -10']],
    need: [...DEV, 'Squared paper to sketch the sign'],
    plan: [
      { min: 8, title: 'What is it made of?', html: '<p>Draw a café sign on the board: a post, a rectangle board and an arrow. <b>Ask:</b> what parts is this made of? Number them 1, 2, 3. Introduce <b>decompose</b>: breaking a big job into smaller parts we can do one at a time. Recap Walk to the jetty: <code>fd</code>, <code>rt</code>, <code>lt</code>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Part 1, the post, is done: Tilly is at the top of it, facing up. The comments (lines starting with <code>;</code>) show where parts 2 and 3 go. The board is 200 wide and 80 tall, with the post in the middle of its bottom edge.</p><p>Plan the board together, standing up and turning: <b>turn left, 100 to the corner, turn right, up 80, turn right, along 200, turn right, down 80, turn right, back 100</b>. Write it on the board as commands.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: type the board under the Part 2 comment, press Run, then the arrow under Part 3. The arrow must not join on to the board, so they lift the pen (<code>pu</code>), jump with <code>setxy -60 -10</code>, point right with <code>seth 90</code> and put the pen down (<code>pd</code>).</p><p>Board answer: <code>setpencolor "blue</code>, <code>lt 90 fd 100</code>, <code>rt 90 fd 80</code>, <code>rt 90 fd 200</code>, <code>rt 90 fd 80</code>, <code>rt 90 fd 100</code>. Arrow: <code>pu setxy -60 -10 seth 90 pd</code>, <code>setpencolor "red</code>, <code>fd 120</code>, <code>lt 135 fd 30 bk 30</code>, <code>rt 270 fd 30</code>.</p><p>Common bugs: forgetting <code>pu</code>, so a stray blue line crosses the board; the board not closing (count the turns: four rt 90s after the first lt 90).</p>' },
      { min: 12, title: 'Design your own', html: '<p>Fast finishers design their own sign for another shop in the bay (an ice-cream kiosk, a boat hire hut) and write each part under its own comment. Everyone else finishes the arrow.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> why did it help to do one part at a time? (Each part is small enough to test and fix.) What did pu and pd do? Next lesson: Mr Gull wants window shapes for the lighthouse, and we find a quicker way to repeat commands.</p>' }
    ],
    support: 'Give pupils the board commands on a card in the wrong order to sort, then type. Draw the board on squared paper first.',
    stretch: 'Add a fourth part: the word CAFE in straight lines, or a little cup on the board. Write each part under its own ; comment.',
    assess: ['Names the parts of the sign before coding', 'Writes a sequence that draws a closed rectangle', 'Uses pu and pd so there is no stray line between parts'],
    steps: [
      { t: 'The post', d: 'Press Run. Part 1, the post, is already drawn. Tilly is at the top of it, facing up.' },
      { t: 'Plan the board', d: 'The board is 200 wide and 80 tall, with the post in the middle of the bottom. Plan the commands on paper.' },
      { t: 'Draw the board', d: 'Under the Part 2 line, type setpencolor "blue, then lt 90 fd 100, rt 90 fd 80, rt 90 fd 200, rt 90 fd 80, rt 90 fd 100. Press Run.' },
      { t: 'Jump without drawing', d: 'Under the Part 3 line, type pu setxy -60 -10 seth 90 pd. pu lifts the pen, so the jump leaves no line.' },
      { t: 'Draw the arrow', d: 'Type setpencolor "red, then fd 120, then lt 135 fd 30 bk 30, then rt 270 fd 30. Press Run.' },
      { t: 'Check it', d: 'Is the board closed? Is there a stray line? Take out pu to see what it does, then put it back.' },
      { t: 'Challenge', d: 'Design a sign for another shop in the bay. Write each part under its own ; comment.' }
    ]
  },
  {
    adopt: 'turtle-shapes', unit: u(1, 3), years: 'Years 3–4',
    summary: 'Mr Gull the lighthouse keeper wants square, triangle and hexagon windows, and the code for one square is eight lines long. Pupils turn the long list of commands into a short repeat loop, then work out the rule for the turn in any shape.',
    plan: [
      { min: 5, title: 'Spot the pattern', html: '<p>Tell the class that Mr Gull, the lighthouse keeper at Driftwood Bay, wants Tilly to draw window shapes for his lighthouse. Show the starter code on the board: eight lines that draw a square window. Press <b>Run</b>. <b>Ask:</b> what do you notice about the lines? (fd 100 and rt 90 four times.) Introduce <b>repeat</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Replace the eight lines with <code>repeat 4 [fd 100 rt 90]</code> and Run. Same square, one line! Explain the square brackets hold the steps to repeat, and the number says how many times. Compare with the sign from last lesson: how many lines could repeat have saved?</p>' },
      { min: 25, title: 'Shape hunt', html: '<p>Pupils follow the Lesson card: triangle, then hexagon, then any shape. Many will guess <code>rt 60</code> for a triangle — let them test it and see why it fails. Collect a table on the board: sides · turn · sides × turn. Pupils should discover the turns always add up to 360.</p>' },
      { min: 15, title: 'Patterns', html: '<p>Show <code>repeat 12 [repeat 4 [fd 80 rt 90] rt 30]</code> — a loop inside a loop, like a round window with a pattern. Pupils make their own window pattern and change colours with <code>setpencolor "red</code>.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> how would you draw a 10-sided window? (repeat 10 [fd 50 rt 36]). Why are loops useful? Next lesson: the festival team want bunting, and we use a repeat to fill a whole string with flags.</p>' }
    ]
  },
  {
    id: 'bay-4-bunting', unit: u(1, 4), title: 'Bunting for the festival', ...B1,
    summary: 'The festival team want a string of bunting. Pupils find the part that repeats (one flag and a gap), work out how many times it must repeat to fill a 500-step string exactly, and write a repeat inside a repeat.',
    objective: 'We are learning to find the part of a pattern that repeats and work out how many times to repeat it.',
    success: ['I can find the part of a pattern that repeats.', 'I can work out how many times a loop needs to repeat.', 'I can put a repeat inside another repeat.'],
    curriculum: ['ssr', 'reason'],
    words: [['repeat / loop', 'do the same commands again'], ['count-controlled loop', 'a loop that repeats a set number of times'], ['nested loop', 'a loop inside another loop'], ['pattern', 'something that happens again and again']],
    need: [...DEV, 'A strip of paper 50 cm long and paper triangles (optional, for the warm-up)'],
    plan: [
      { min: 8, title: 'Make some bunting', html: '<p>Hold up a paper strip with a few paper flags. <b>Ask:</b> what is the bit that happens again and again? (A flag, then a gap.) If the string is 50 cm and each flag plus its gap takes 5 cm, how many flags fit? (10.) Recap Shapes with repeat: <code>repeat 3 [fd 40 rt 120]</code> draws a triangle.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. The festival team’s string is 500 steps long. The starter draws one flag the long way (<code>fd 40 rt 120</code> three times), then moves along 50 steps with the pen up.</p><p>Turn the long flag into <code>repeat 3 [fd 40 rt 120]</code>. Point out that Tilly is facing right, so <code>rt 120</code> makes the flag hang <b>down</b> from the string. <b>Ask:</b> what is the part that repeats now? (The flag AND the move along.) How many times? (500 ÷ 50 = 10.)</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card to wrap the flag and the move in an outer loop: <code>repeat 10 [repeat 3 [fd 40 rt 120] pu fd 50 pd]</code>. They <b>predict</b> where the last flag will be before pressing Run.</p><p>Common bugs: the move along is left outside the outer loop (all ten flags are drawn on top of each other); a missing <code>]</code> (the status line says so); repeat 12 (flags run off the end of the string — ask them to check the sum). Use the line breaks to show which bracket belongs to which repeat.</p>' },
      { min: 12, title: 'Change the pattern', html: '<p>Pupils try other bunting: smaller flags (fd 20, move 25 — how many now?), or a different colour for each flag with <code>setpencolor repcount</code>. They always check that the flags fill the string exactly.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> how did you know it was 10? What would you change for 20 flags? Next lesson: the lighthouse program has bugs, and we become bug hunters.</p>' }
    ],
    support: 'Give the outer loop on a card: repeat 10 [ … ]. Pupils decide which lines go inside the brackets.',
    stretch: 'Make the flags change colour with setpencolor repcount at the start of the outer loop. Add a second string of bunting lower down with 20 smaller flags.',
    assess: ['Identifies the flag and the move as the repeating unit', 'Calculates the number of repeats from the string length', 'Writes a nested loop that draws the right number of flags'],
    steps: [
      { t: 'One flag', d: 'Press Run. Tilly draws the string and one flag, then moves along 50 steps. The string is 500 steps long.' },
      { t: 'Shorter flag', d: 'Change the three flag lines to: repeat 3 [fd 40 rt 120]. Press Run. Same flag!' },
      { t: 'How many?', d: 'Each flag and its gap take 50 steps. How many fit on a 500-step string? Work it out.' },
      { t: 'Repeat the flag and the move', d: 'Wrap the flag and pu fd 50 pd inside a new loop: repeat 10 [repeat 3 [fd 40 rt 120] pu fd 50 pd]' },
      { t: 'Predict and test', d: 'Where will the last flag be? Press Run. Do the flags fill the string exactly?' },
      { t: 'Challenge', d: 'Put setpencolor repcount at the start of the big loop. What happens? Try smaller flags too.' }
    ]
  },
  {
    id: 'bay-5-lighthouse', unit: u(1, 5), title: 'Fix the lighthouse', ...B1,
    summary: 'Mr Gull’s lighthouse program has three bugs: a wrong turn in the tower, a missing side in the lamp room and a stray line where the pen was left down. Pupils compare what should happen with what does happen and debug one part at a time.',
    objective: 'We are learning to find and fix bugs by comparing what a program should do with what it really does.',
    success: ['I can say what a program should do and what it really does.', 'I can find which part of a program has a bug.', 'I can fix a bug and test again.'],
    curriculum: ['reason', 'design'],
    words: [['bug', 'a mistake in a program'], ['debug', 'find and fix the mistakes'], ['expected', 'what should happen'], ['actual', 'what really happens'], ['comment', 'a line starting with ; that the turtle ignores: notes for people']],
    need: [...DEV, 'A “bug hunt” sheet: three rows with Expected / Actual / Fix'],
    plan: [
      { min: 7, title: 'Bug hunters', html: '<p>Read Mr Gull’s note (the comment lines at the top of the starter) aloud: a red tower 80 wide and 200 tall, a gold lamp room 40 by 40 on top, three orange beams. Sketch it on the board. Introduce <b>expected</b> (what should happen) and <b>actual</b> (what really happens), and <b>bug</b> / <b>debug</b>.</p>' },
      { min: 10, title: 'Predict, then test', html: '<p>Open the starter. Before pressing Run, read the tower part out loud together and <b>predict</b> its shape. Press <b>Run</b>. <b>Ask:</b> what is different from the sketch? Pupils note three differences: the tower is a staircase, the lamp room has a side missing, and there is a line through the lamp room.</p>' },
      { min: 25, title: 'Debug it', html: '<p>Pupils follow the Lesson card and fill in their bug hunt sheet, fixing one part at a time and pressing Run after each fix. Remind them the comments tell them which lines draw which part.</p><p>The bugs: <b>1</b> the tower’s loop has <code>lt 90</code> where it needs <code>rt 90</code> (<code>repeat 2 [fd 200 rt 90 fd 80 rt 90]</code>); <b>2</b> the lamp room repeats 3 times instead of 4; <b>3</b> the jump to the beams has no <code>pu</code> before it and no <code>pd</code> after (<code>pu setxy 0 40 seth 30 pd</code>).</p><p>Strategy to praise: change one thing, then test.</p>' },
      { min: 13, title: 'Swap and bug', html: '<p>Pairs put ONE new bug into their fixed lighthouse, swap devices with another pair and hunt for it. Each pair explains how they found it.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> what is the best way to find a bug? (Compare expected and actual, find the part, change one thing, test again.) How did the comments help? Next lesson: the Block 1 project, your own map of the bay.</p>' }
    ],
    support: 'Tell pupils which part each bug is in (tower, lamp room, beams) so they only have to find the line.',
    stretch: 'Add three more beams shining to the left, and stripes on the tower. Write a comment above each new part.',
    assess: ['Describes the difference between expected and actual output', 'Locates each bug in the right part of the program', 'Fixes all three bugs, testing after each change'],
    steps: [
      { t: 'Read the plan', d: 'Read the comments at the top: what should the lighthouse look like? Draw a quick sketch.' },
      { t: 'Predict and run', d: 'Read the tower lines. What shape will they make? Press Run. What is different from your sketch?' },
      { t: 'Bug 1: the tower', d: 'The tower should be a rectangle. Look at the turns in its repeat. Fix one, then press Run.' },
      { t: 'Bug 2: the lamp room', d: 'The lamp room is a square with a side missing. How many times should its repeat go round?' },
      { t: 'Bug 3: the stray line', d: 'A line crosses the lamp room. Tilly moves to the beams with her pen down! Add pu before setxy and pd after seth 30.' },
      { t: 'Test it all', d: 'Press Run. Is everything like the plan now? Fill in your bug hunt sheet.' },
      { t: 'Challenge', d: 'Add three more beams shining to the left.' }
    ]
  },
  {
    id: 'bay-6-map', unit: u(1, 6), title: 'Project: a map of Driftwood Bay', ...B1,
    summary: 'The Block 1 design project. Captain Pearl wants a new map of the bay for visitors. Pupils plan a map with at least three places, draw each place with a sequence or a repeat, move between places with pu and pd, and add a route — then test, debug and share it.',
    objective: 'We are learning to plan, write, test and improve our own program using sequence, repetition and decomposition.',
    success: ['I can plan my map on paper and break it into parts.', 'I can use repeat and pu/pd in my program.', 'I can test my map and fix bugs.'],
    curriculum: ['design', 'ssr'],
    words: [['design', 'planning what you will make before you make it'], ['decompose', 'break a big job into smaller parts'], ['repeat', 'do the same commands again'], ['debug', 'find and fix the mistakes'], ['evaluate', 'say what went well and what to improve']],
    need: [...DEV, 'Squared paper for the plan (one square = 50 steps)', 'Coloured pencils'],
    plan: [
      { min: 8, title: 'The brief', html: '<p>Captain Pearl wants a map of Driftwood Bay for visitors. Show the starter (the sea is drawn) and the <b>success criteria</b> in its comments: at least 3 places in at least 2 colours, repeat used at least twice, pu and pd between places, and a red route from one place to another. Show an example quickly: a beach hut (repeat 4), a rock pool (repeat 2), a lighthouse and a red path.</p>' },
      { min: 10, title: 'Plan', html: '<p>Pairs plan on squared paper: which places, where (count squares from the middle: 1 square = 50 steps, so a place 3 squares left is <code>setxy -150 …</code>), what shape each is, and which can use repeat. They write a comment line for each part, like <code>; The beach hut</code>.</p>' },
      { min: 27, title: 'Make, test, debug', html: '<p>Pupils type one place at a time under “Your map starts here”, pressing Run after each. Walk round and ask: “Which part are you on? What should it look like? What does it look like?” Celebrate bugs that get fixed.</p><p>Remind them of the tools from this block: <code>repeat</code>, <code>pu setxy x y pd</code> to jump, <code>seth 0</code> to face up again, <code>setpencolor "red</code>.</p>' },
      { min: 10, title: 'Gallery walk', html: '<p>Leave maps on screen. Pupils walk round and use the success criteria to give each map two stars and a wish.</p>' },
      { min: 5, title: 'Evaluate', html: '<p><b>Ask:</b> which part was hardest? What bug did you fix? End of Block 1: you can plan algorithms, decompose, use repeat and debug. Next block: festival week, where the turtle starts making choices.</p>' }
    ],
    support: 'Give a part-finished plan with the places chosen and the setxy numbers worked out. Pupils draw two places and the route.',
    stretch: 'Add a key (a small square of each colour with a line pointing to it), a compass arrow, and use nested repeats for a row of boats.',
    assess: ['Plans the map in parts before coding', 'Uses repeat at least twice and pu/pd between places', 'Tests and debugs the map', 'Evaluates their own and others’ maps against the criteria'],
    steps: [
      { t: 'Plan your map', d: 'On squared paper, plan at least 3 places for the map. Where does each go? Which can use repeat?' },
      { t: 'First place', d: 'Under “Your map starts here”, jump with pu setxy … pd, then draw your first place. Press Run.' },
      { t: 'More places', d: 'Add the other places, one at a time. Write a ; comment above each one. Use at least 2 colours.' },
      { t: 'Use repeat', d: 'Check you have used repeat at least twice, for shapes or patterns.' },
      { t: 'The route', d: 'Use setpencolor "red and draw a route from one place to another.' },
      { t: 'Test and improve', d: 'Press Run. Does it match your plan? Fix any bugs, then share your map.' }
    ]
  },

  // ═══════════════════════ BLOCK 2 · FESTIVAL WEEK (Years 4–5) ═══════════════════════
  {
    id: 'bay-7-slide', unit: u(2, 1), title: 'The helter-skelter', ...B2,
    summary: 'Festival week begins. The fairground helter-skelter, seen from above, is a square spiral: every line 10 steps longer than the last. The starter goes round the same square 20 times. Pupils use repcount and the * operator so the loop calculates a new length each time.',
    objective: 'We are learning to use a value that changes in a loop (repcount) and operators to calculate numbers.',
    success: ['I can say what repcount is each time round a loop.', 'I can use * and + to calculate a number in a command.', 'I can predict what a calculation will draw.'],
    curriculum: ['ssr', 'reason'],
    words: [['repcount', 'which time round the repeat is on: 1, 2, 3…'], ['operator', 'a symbol that does maths: + − * /'], ['expression', 'a calculation, like repcount * 10'], ['spiral', 'a line that winds round and gets bigger']],
    need: [...DEV, 'Mini whiteboards for the prediction table'],
    plan: [
      { min: 8, title: 'Festival week!', html: '<p>Tell the class it is festival week in Driftwood Bay: the fair has arrived, and Tilly is drawing it. First, the helter-skelter, seen from above: a square spiral. Draw one on the board: each line a bit longer than the one before. Recap Block 1: <code>repeat</code> does the same thing every time. <b>Ask:</b> how can a loop do something a bit different each time?</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>: Tilly goes round the same square 20 times. Introduce <b>repcount</b>: it is 1 the first time round the loop, 2 the second time, and so on. <b>Ask:</b> what is <code>repcount * 10</code> the first time? (10.) The fifth? (50.) <code>*</code> means times. Fill a table together: repcount · repcount * 10.</p><p>Change the loop to <code>repeat 20 [fd repcount * 10 rt 90]</code> and Run.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: make the spiral, then change the numbers and <b>predict</b> before running: <code>rt 91</code> (it twists), <code>fd 20 + repcount * 5</code> (it starts bigger and grows more slowly), <code>repeat 40</code>.</p><p>Common bugs: <code>repcount*10</code> needs no spaces but <code>fd repcount 10</code> is wrong (the status line says it doesn’t understand 10); putting repcount outside the loop (it is 0 there).</p>' },
      { min: 12, title: 'Spiral gallery', html: '<p>Pupils make their own festival spiral with a colour change: <code>setpencolor repcount</code> inside the loop gives a new colour each time. Share a few on the board and read their expressions aloud.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> why did the starter go round the same square? (fd 50 every time.) What changes when we use repcount? Next lesson: Hook a duck, where the turtle decides what to do with <b>if</b>.</p>' }
    ],
    support: 'Give the table of repcount and repcount * 10 already filled in for the first three rows. Pupils fill in the rest, then type the loop.',
    stretch: 'Make a triangle spiral (rt 120) and a hexagon spiral. Which turn makes a spiral that looks like a flower? Try rt 121.',
    assess: ['States the value of repcount on a given time round the loop', 'Writes fd repcount * 10 inside the loop', 'Predicts the effect of changing the expression'],
    steps: [
      { t: 'Run it', d: 'Press Run. Tilly goes round the same square 20 times. The helter-skelter should be a spiral!' },
      { t: 'What is repcount?', d: 'repcount is 1 the first time round the loop, then 2, then 3… What is repcount * 10 the third time?' },
      { t: 'Make the spiral', d: 'Change fd 50 to fd repcount * 10. Press Run. Each line is 10 steps longer than the last.' },
      { t: 'Predict, then test', d: 'What will rt 91 do instead of rt 90? Say it, then Run it. Change it back.' },
      { t: 'Start bigger', d: 'Try fd 20 + repcount * 5. How is the spiral different?' },
      { t: 'Challenge', d: 'Put setpencolor repcount inside the loop for a rainbow slide. Try a triangle spiral with rt 120.' }
    ]
  },
  {
    id: 'bay-8-ducks', unit: u(2, 2), title: 'Hook a duck', ...B2,
    summary: 'Selection. At the hook-a-duck stall, eight ducks float past. Duck 5 is the gold prize duck and ducks 7 and 8 are red try-again ducks. Pupils use if with a condition that compares repcount (=, >) so the loop chooses a colour for each duck.',
    objective: 'We are learning to use if with a condition so a program chooses what to do.',
    success: ['I can write a condition that is true or false.', 'I can use if to run commands only when the condition is true.', 'I can use =, < and > to compare numbers.'],
    curriculum: ['ssr', 'reason'],
    words: [['selection', 'choosing what to do with if'], ['condition', 'a question that is true or false, like repcount = 5'], ['comparison', 'checking numbers with = (equal), < (less than) or > (more than)'], ['true / false', 'the two answers a condition can have']],
    need: [...DEV, 'Number cards 1–8 for the warm-up'],
    plan: [
      { min: 8, title: 'Duck game', html: '<p>Give eight pupils number cards 1–8; they file past one at a time. Rule: “<b>If</b> your number is 5, jump.” Then: “<b>If</b> your number is more than 6, wave.” <b>Ask:</b> how did you know whether to do it? Introduce <b>condition</b> (a question that is true or false) and <b>selection</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>: eight blue ducks. Read the loop: every duck sets the colour to blue, draws a circle and moves along. Type <code>if repcount = 5 [setpencolor "gold]</code> on a new line under <code>setpencolor "blue</code> (inside the big loop, before the circle). Run. <b>Ask:</b> why only duck 5? Why does it go back to blue for duck 6?</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: make duck 5 gold, then ducks 7 and 8 red with <code>if repcount &gt; 6 [setpencolor "red]</code>, then try their own rules (<code>repcount &lt; 3</code>, <code>repcount = 1</code>).</p><p>Common bugs: putting the if inside the small <code>repeat 36</code> loop (then repcount counts the circle’s steps, not the ducks); putting it before <code>setpencolor "blue</code> (blue wins); writing <code>if repcount = 5 setpencolor "gold</code> without the brackets.</p>' },
      { min: 12, title: 'Rule makers', html: '<p>Pairs write a secret rule (e.g. ducks bigger than 2 and the last duck different) and swap; partners work out the rule from the picture and check it in the code.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> what is the condition in your if? When is it true? Next lesson: the dancing crab flips a coin and chooses between <b>two</b> things.</p>' }
    ],
    support: 'Give the if line on a card; pupils decide where it goes and test it. Use the number cards to act out each condition.',
    stretch: 'Make the ducks after duck 5 bigger with if repcount > 5 [setpensize 8]. Make every duck except duck 1 green with if repcount > 1.',
    assess: ['Writes a condition using =, < or >', 'Places the if inside the right loop', 'Explains when the condition is true'],
    steps: [
      { t: 'Run it', d: 'Press Run. Eight blue ducks float past. Duck 5 should be the gold prize duck!' },
      { t: 'The prize duck', d: 'Under setpencolor "blue, type: if repcount = 5 [setpencolor "gold] then press Run.' },
      { t: 'Why only one?', d: 'The condition repcount = 5 is only true the fifth time round. Every other time it is false.' },
      { t: 'Try again ducks', d: 'Ducks 7 and 8 should be red. Type: if repcount > 6 [setpencolor "red] under your first if.' },
      { t: 'Test it', d: 'Press Run. Is duck 5 gold, ducks 7 and 8 red, and the rest blue?' },
      { t: 'Challenge', d: 'Write your own rule with < or >, like if repcount < 3 [setpencolor "green]. Can a partner guess it?' }
    ]
  },
  {
    id: 'bay-9-crab', unit: u(2, 3), title: 'The dancing crab', ...B2,
    summary: 'A crab dances at the festival. Every beat it flips a coin: heads, a red step left; tails, a blue step right. Pupils use random and ifelse so the program chooses one of two things each time round the loop, and see that every dance is different.',
    objective: 'We are learning to use ifelse and random so a program chooses between two actions.',
    success: ['I can use random to get a surprise number.', 'I can use ifelse to do one thing or another.', 'I can explain why the dance is different every time.'],
    curriculum: ['ssr', 'reason'],
    words: [['ifelse', 'if the condition is true do the first [ ], else do the second [ ]'], ['random', 'a surprise number: random 2 gives 0 or 1'], ['condition', 'a question that is true or false'], ['input', 'something that changes what a program does']],
    need: [...DEV, 'A coin per pair'],
    plan: [
      { min: 8, title: 'Coin dance', html: '<p>Pupils stand. Flip a coin six times: heads, everyone steps left; tails, step right. <b>Ask:</b> could you know the dance before we started? Recap Hook a duck: <code>if</code> does something only when the condition is true. Today we need <b>two</b> choices: <b>ifelse</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b> twice: the crab always steps right. Show <code>random 2</code>: a surprise number, 0 or 1, like a coin. Write on the board: <code>ifelse random 2 = 0 [ heads … ] [ tails … ]</code>. The first brackets run when the condition is true, the second when it is false.</p><p>Replace the two lines <code>setpencolor "blue</code> and <code>rt 90 fd 20 lt 90</code> with: <code>ifelse random 2 = 0 [setpencolor "red lt 90 fd 20 rt 90] [setpencolor "blue rt 90 fd 20 lt 90]</code>. Run it a few times.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card. They run the dance three times and compare with a partner (different every time!), then count the red and blue steps.</p><p>Common bugs: one pair of brackets missing (the status line says a [ is expected); swapping lt and rt inside the brackets so the crab goes the wrong way; leaving the old <code>setpencolor "blue</code> line after the ifelse (every step turns blue).</p>' },
      { min: 12, title: 'Unfair coin?', html: '<p>Challenge: <code>random 4 = 0</code> is true only 1 time in 4. Pupils predict which way the crab will drift, then run it several times. Link to fair and unfair games.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> what decides which brackets run? Why is the dance different each time? Next lesson: Tilly walks to the sea, and a loop keeps checking where she is.</p>' }
    ],
    support: 'Give the ifelse line on a card with gaps for the two sets of commands. Pupils flip a real coin and follow along.',
    stretch: 'Add a third choice: a crab that sometimes does a little spin. Hint: put an if inside one of the ifelse brackets. Or use random 4 to make an unfair coin.',
    assess: ['Uses random 2 to get 0 or 1', 'Writes an ifelse with two sets of commands', 'Explains why each run is different'],
    steps: [
      { t: 'Run it', d: 'Press Run twice. The crab always steps right. Boring!' },
      { t: 'A coin', d: 'random 2 gives 0 or 1, like flipping a coin. Heads is 0, tails is 1.' },
      { t: 'Make a choice', d: 'Delete setpencolor "blue and rt 90 fd 20 lt 90. In their place type: ifelse random 2 = 0 [setpencolor "red lt 90 fd 20 rt 90] [setpencolor "blue rt 90 fd 20 lt 90]' },
      { t: 'Dance!', d: 'Press Run three times. Is the dance different each time? Compare with a partner.' },
      { t: 'Count', d: 'How many red steps and blue steps did your crab do? Are they always the same?' },
      { t: 'Challenge', d: 'Try random 4 = 0 instead. Which way does the crab go most? Why?' }
    ]
  },
  {
    id: 'bay-10-tide', unit: u(2, 4), title: 'Walk to the sea', ...B2,
    summary: 'Tilly starts somewhere different on the sand every time and must stop exactly at the edge of the sea. A fixed fd 200 never works. Pupils write a loop that checks a condition every step (if ycor < -150 [stop]), using ycor as the turtle’s own sensor.',
    objective: 'We are learning to write a loop that checks a condition every time round and stops when it is true.',
    success: ['I can explain why a fixed number of steps doesn’t work.', 'I can use ycor to find where the turtle is.', 'I can write a loop that stops when a condition is true.'],
    curriculum: ['ssr', 'design'],
    words: [['ycor', 'how high up the turtle is (its y position)'], ['condition', 'a question that is true or false, like ycor < -150'], ['stop', 'end the program (or the procedure) straight away'], ['sense', 'find something out, like where the turtle is']],
    need: [...DEV, 'A blindfold (optional) and a rope or tape line on the floor for the warm-up'],
    plan: [
      { min: 8, title: 'Walk to the line', html: '<p>Put a tape line on the floor. Pupils start at different places and must stop exactly on the line with their eyes closed, following one instruction: “take 5 steps.” Only some stop on it. Now try: “take a step, check with your foot, take a step, check…” until they feel the line. <b>Ask:</b> which instruction works from anywhere? That is a loop that <b>checks a condition</b> every time round.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b> three times: Tilly starts at a different height each time (<code>random 250</code>) and <code>fd 200</code> stops her in a different place — never quite at the sea. Introduce <b>ycor</b>: how high Tilly is. The sea’s edge is at y = −150. <b>Ask:</b> when should she stop? (When ycor is less than −150.)</p><p>Replace <code>fd 200</code> with a loop of small steps that checks every time: <code>repeat 500 [if ycor &lt; -150 [stop] fd 2]</code>.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card, pressing Run many times to test from different starting places. They <b>predict</b> what happens with <code>fd 20</code> steps instead of <code>fd 2</code> (Tilly overshoots by more: the check only happens between steps).</p><p>Common bugs: <code>if ycor &gt; -150</code> (true at once, so Tilly never moves); the check after the loop instead of inside it; writing <code>ycor &lt; -150</code> with a space inside <code>-150</code>. Explain that <code>stop</code> ends the whole program here, so the walk goes last.</p>' },
      { min: 12, title: 'More sensing', html: '<p>Pupils use <code>xcor</code> too: start Tilly on the left with <code>seth 90</code> and walk right until she reaches a rock at x = 200. Or walk to the sea and then <b>repeat</b> the whole thing in a different colour.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> why does a loop that checks work from anywhere, but fd 200 doesn’t? Where else do machines check and stop? (A lift at a floor, a kettle when it boils, an automatic door.) Next lesson: the pier lights have bugs in their loops and conditions.</p>' }
    ],
    support: 'Act it out first with the floor line. Give the repeat line on a card; pupils fill in the condition.',
    stretch: 'Make Tilly walk right until xcor > 200, then down to the sea. (Use two loops; only the last one can use stop, or put each walk in its own procedure: stop only leaves the procedure.)',
    assess: ['Explains why a fixed distance fails from a random start', 'Uses ycor in a comparison', 'Writes a loop that checks the condition every step and stops at the sea'],
    steps: [
      { t: 'Run it three times', d: 'Press Run three times. Tilly starts somewhere different each time. Does fd 200 ever stop her at the sea?' },
      { t: 'Where is Tilly?', d: 'ycor tells you how high Tilly is. The sea’s edge is at y -150. When should she stop?' },
      { t: 'A loop that checks', d: 'Delete fd 200. Type: repeat 500 [if ycor < -150 [stop] fd 2]' },
      { t: 'Test it lots', d: 'Press Run again and again. Does Tilly stop at the sea every time, wherever she starts?' },
      { t: 'Bigger steps', d: 'Change fd 2 to fd 20. Predict, then Run. Why does she go further into the sea?' },
      { t: 'Challenge', d: 'Start Tilly on the left facing right (seth 90) and walk until xcor > 200.' }
    ]
  },
  {
    id: 'bay-11-lights', unit: u(2, 5), title: 'Fix the pier lights', ...B2,
    summary: 'The festival’s pier lights program has three bugs in its loop and conditions: the loop runs 9 times instead of 10, the colour condition is the wrong way round, and the check for the big last light is outside the loop. Pupils test against the plan and debug each one.',
    objective: 'We are learning to debug loops and conditions by testing what a program does against what it should do.',
    success: ['I can check a program against its plan.', 'I can find a bug in a loop or a condition.', 'I can explain why my fix works.'],
    curriculum: ['reason', 'ssr'],
    words: [['debug', 'find and fix the mistakes'], ['condition', 'a question that is true or false'], ['trace', 'follow a program step by step to see what it does'], ['repcount', 'which time round the loop it is']],
    need: [...DEV, 'A tracing table: repcount · condition true or false? · colour'],
    plan: [
      { min: 8, title: 'The plan', html: '<p>Read the plan in the starter’s comments: 10 lights; lights 1 to 5 yellow, 6 to 10 pink; light 10 big (pen size 8). Draw it on the board. Recap the block so far: repcount, if, ifelse, loops that check.</p>' },
      { min: 10, title: 'Trace it', html: '<p>Open the starter and press <b>Run</b>. Count the lights together (9!). Introduce <b>tracing</b>: fill in the table for repcount 1, 2, 6, 7 — is <code>repcount &gt; 6</code> true or false? Which colour? <b>Ask:</b> what does the plan say for light 1? What does the program do?</p>' },
      { min: 25, title: 'Debug it', html: '<p>Pupils follow the Lesson card, fixing one bug at a time and pressing Run after each fix.</p><p>The bugs: <b>1</b> <code>repeat 9</code> should be <code>repeat 10</code>; <b>2</b> <code>repcount &gt; 6</code> is the wrong condition — <code>ifelse repcount &lt; 6 [setpencolor "yellow] [setpencolor "pink]</code> (or keep &gt; but write <code>repcount &gt; 5</code> and swap the colours); <b>3</b> <code>if repcount = 10 [setpensize 8]</code> is after the loop, where repcount is 0 and every light is already drawn — it belongs inside the loop, before the circle.</p><p>Ask pupils to explain each fix with “because…”.</p>' },
      { min: 12, title: 'Off by one', html: '<p>Discuss the classic bug: <code>&lt; 6</code> and <code>&lt;= 5</code> and <code>&gt; 5</code>. Which lights does each pick? Pupils test their predictions by changing the condition.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> which bug was hardest to spot? How did tracing help? Next lesson: the Block 2 project, a fireworks finale that uses everything from festival week.</p>' }
    ],
    support: 'Pupils trace only lights 5, 6 and 10 in the table. Tell them the three bugs are: how many, which colour, how big.',
    stretch: 'Make the middle two lights (5 and 6) white with an extra if. Make every light after light 3 a bit bigger with setpensize repcount.',
    assess: ['Traces the loop to predict colours', 'Finds and fixes the loop count, the condition and the misplaced if', 'Explains why the if must be inside the loop'],
    steps: [
      { t: 'Read the plan', d: 'Read the comments at the top. Then press Run. How many lights are there? Which colours?' },
      { t: 'Bug 1: how many?', d: 'There should be 10 lights. Fix the number in the big repeat. Press Run.' },
      { t: 'Bug 2: which colour?', d: 'Lights 1 to 5 should be yellow. Change the condition to repcount < 6. Press Run.' },
      { t: 'Bug 3: the big light', d: 'Light 10 isn’t big. The if is after the loop, where repcount is 0. Move it inside the loop, just before repeat 18.' },
      { t: 'Check the plan', d: 'Press Run. 10 lights, 1 to 5 yellow, 6 to 10 pink, and light 10 big?' },
      { t: 'Challenge', d: 'Make lights 5 and 6 white with another if.' }
    ]
  },
  {
    id: 'bay-12-fireworks', unit: u(2, 6), title: 'Project: the fireworks finale', ...B2,
    summary: 'The Block 2 design project. The festival ends with fireworks over the bay. Pupils design a firework show that is different every time: a repeat, random positions, an if or ifelse that chooses colours or sizes with a comparison — then test it, debug it and present it.',
    objective: 'We are learning to design and write our own program that uses repetition, selection and random choices.',
    success: ['I can plan a program that uses repeat, random and if or ifelse.', 'I can write conditions with comparisons.', 'I can test my program and improve it.'],
    curriculum: ['design', 'ssr'],
    words: [['design', 'planning what you will make'], ['selection', 'choosing what to do with if or ifelse'], ['random', 'a surprise number'], ['comparison', '= < or > in a condition'], ['evaluate', 'say what went well and what to improve']],
    need: [...DEV, 'A planning sheet: what repeats? what is random? what choice does the program make?'],
    plan: [
      { min: 8, title: 'The brief', html: '<p>Show the starter: a night sky and one firework (<code>repeat 12 [fd 60 bk 60 rt 30]</code>). Read the success criteria in its comments: a repeat, random, an if or ifelse, a comparison and at least 2 colours. Show an example idea: 8 fireworks at random places (<code>pu setxy random 500 - 250 random 300 - 50 pd</code>), <code>ifelse random 2 = 0</code> for pink or cyan, and gold for any firework higher than 150 (<code>if ycor &gt; 150</code>).</p>' },
      { min: 10, title: 'Plan', html: '<p>Pairs fill in the planning sheet: what repeats (how many fireworks? how many sparks?), what is random (place, size, colour?), what choice the program makes and its condition. Check every plan has all five criteria.</p>' },
      { min: 27, title: 'Make, test, debug', html: '<p>Pupils build their show under the starter firework, pressing Run often — and several times, because random makes every run different. Ask: “What is your condition? When is it true? Can you make it happen?”</p><p>Useful reminders: <code>random 500 - 250</code> gives a number from −250 to 249; <code>repcount</code> can change sizes (<code>fd repcount * 5</code>); <code>setpensize</code> makes thicker sparks.</p>' },
      { min: 10, title: 'Fireworks show', html: '<p>Pairs present their show to another pair, run it three times and point to the repeat, the random and the condition. The audience checks the criteria.</p>' },
      { min: 5, title: 'Evaluate', html: '<p><b>Ask:</b> what would you add next? End of Block 2: you can use repcount and operators, if and ifelse, random, and loops that check. Next block: building the seafront, with variables and procedures.</p>' }
    ],
    support: 'Start from the example idea on a card and change the numbers and colours. Add one if of their own.',
    stretch: 'Make rockets that fly up first (a loop that checks ycor) and then burst. Make big fireworks for the last three with if repcount > 5.',
    assess: ['Plans a program that meets all five criteria', 'Uses random, a repeat and a condition with a comparison correctly', 'Tests and improves the program', 'Evaluates against the criteria'],
    steps: [
      { t: 'Plan your show', d: 'What repeats? What is random? What choice does your program make, and when?' },
      { t: 'More fireworks', d: 'Under the first firework, use repeat to make more. Jump to a random place with pu setxy random 500 - 250 random 300 - 50 pd' },
      { t: 'Make a choice', d: 'Use if or ifelse with a comparison to choose a colour or size, like ifelse random 2 = 0 [setpencolor "pink] [setpencolor "cyan]' },
      { t: 'Run it lots', d: 'Press Run several times. Is it different each time? Does your choice happen?' },
      { t: 'Check the criteria', d: 'repeat, random, if or ifelse, a comparison, 2 colours. Tick them off.' },
      { t: 'Show it', d: 'Run your show for another pair and explain how it works.' }
    ]
  },

  // ═══════════════════════ BLOCK 3 · BUILDING THE SEAFRONT (Years 5–6) ═══════════════════════
  {
    id: 'bay-13-size', unit: u(3, 1), title: 'One number to change them all', ...B3,
    summary: 'Driftwood Bay is building new beach huts along the seafront, in different sizes. The starter hut has its size typed in four different ways (80, 30, 40, 20). Pupils make a variable, size, and write every number as a calculation from it, so changing one line resizes the whole hut.',
    objective: 'We are learning to create a variable and use it in calculations, so one change updates a whole program.',
    success: ['I can make a variable with make and use it with a colon.', 'I can write a number as a calculation from a variable.', 'I can change one value and predict the result.'],
    curriculum: ['ssr', 'reason'],
    words: [['variable', 'a named box that holds a value, like size'], ['make', 'make "size 80 puts 80 in the box called size'], [':size', 'use whatever value is in the box'], ['value', 'what the variable holds right now'], ['expression', 'a calculation, like :size / 4']],
    need: [...DEV, 'Labelled boxes or envelopes for the warm-up'],
    plan: [
      { min: 8, title: 'A box with a name', html: '<p>Hold up an envelope labelled <b>size</b> with a card “80” inside. Explain a <b>variable</b>: a box with a name holding a value. Pupils answer: “walls are size long — how long?”, “the door is size ÷ 4 wide — how wide?”. Swap the card for 160 and ask again. <b>Ask:</b> what changed? (Only the card, but every answer.)</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>: a beach hut with a red door. The hut is 80 wide; the door is placed 30 along, is 40 tall and 20 wide. <b>Ask:</b> how would you make a hut 160 wide? (Change four numbers and get the maths right!) Try changing only the 80 in the walls: the door stays small.</p><p>Show <code>make "size 80</code> (a quote mark before the name to make it) and <code>:size</code> (a colon to use it). Change the walls to <code>repeat 4 [fd :size rt 90]</code>.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card, turning each number into an expression: 30 = <code>:size * 3 / 8</code>, 40 = <code>:size / 2</code>, 20 = <code>:size / 4</code>. They check the hut looks exactly the same with size 80, then change only the make line to 160, 40 and 120 and <b>predict</b> each time.</p><p>Common bugs: <code>make size 80</code> without the quote mark, <code>: size</code> with a space, using <code>:size</code> before the make line (the status line says it doesn’t know the variable).</p>' },
      { min: 12, title: 'A second variable', html: '<p>Pupils add <code>make "c 4</code> and <code>setpencolor :c</code> for the walls (colours 0–15 are numbers; see Commands). Fast finishers draw a row of huts that grow: <code>make "size :size + 20</code> changes the value while the program runs.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> why is one variable better than four numbers? Where do grown-ups use variables? (A spreadsheet total, a game’s score, a recipe for 4 people or 8.) Next lesson: we teach Tilly new words — procedures — for a whole street.</p>' }
    ],
    support: 'Give the three expressions on a card for pupils to match to the numbers 30, 40 and 20 (with size 80).',
    stretch: 'Add a window: a square :size / 4 wide, :size / 8 from the right wall. Then make "size :size + 20 inside a loop to draw three huts that grow.',
    assess: ['Creates a variable with make and uses it with a colon', 'Replaces fixed numbers with expressions of the variable', 'Predicts the effect of changing the variable’s value'],
    steps: [
      { t: 'Run the hut', d: 'Press Run. Change only the 80 in the walls to 160 and Run. What goes wrong with the door? Change it back.' },
      { t: 'Make a variable', d: 'At the very top, type: make "size 80' },
      { t: 'Use it', d: 'In the walls, change fd 80 to fd :size. The colon means “what is in the box”.' },
      { t: 'The door', d: 'Change 30 to :size * 3 / 8, 40 to :size / 2 and 20 to :size / 4. Press Run. Same hut?' },
      { t: 'One number', d: 'Change only make "size 80 to make "size 160. Predict, then Run. Try 40 and 120 too.' },
      { t: 'Challenge', d: 'Add make "c 4 and setpencolor :c for the walls. Or draw three huts that grow with make "size :size + 20.' }
    ]
  },
  {
    adopt: 'turtle-procedures', unit: u(3, 2), years: 'Years 5–6',
    summary: 'The seafront needs a whole street of houses. Pupils break the picture into parts and teach Tilly a new command for each part. A parameter (like the size variable from last lesson) lets one command draw a house of any size, and a street command uses the house command three times.',
    plan: [
      { min: 5, title: 'Break it down', html: '<p>Captain Pearl wants a street of houses along the Driftwood Bay seafront. Draw a simple street on the board: three houses, each a square with a triangle roof. <b>Ask:</b> what parts is this picture made of? (houses; each house is walls and a roof; walls are a square, a roof is a triangle.) Recap <b>decompose</b> from A sign for the café. Remind pupils of last lesson: <code>make "size 80</code> and <code>:size</code>, and from Block 1: sides × turn = 360.</p>' },
      { min: 10, title: 'Show me: a new word', html: '<p>Open the starter on the board and press <b>Run</b>: a house, drawn with two repeats. <b>Ask:</b> which lines draw the walls and which draw the roof? How many numbers would you change to draw a bigger house? (Four of them.)</p><p>Put <code>to house :size</code> above the lines and <code>end</code> below them, and change every 100 to <code>:size</code>. Press Run: nothing is drawn! Teaching the turtle a word is not the same as using it. Type <code>house 100</code> underneath and Run again. Then <code>house 50</code>. <b>:size</b> is a <b>parameter</b>: like last lesson’s variable, but it gets a new value each time we <b>call</b> the procedure.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: make <b>house</b>, try different sizes, then write <b>street</b>, a procedure that calls house three times, and finally <b>poly</b>, one procedure with two parameters that draws any regular shape.</p><p>Common bugs: a missing <code>end</code> (the status line says so), a space inside <code>:size</code>, or typing <code>size</code> without the colon. Ask “what does the status line say?” before helping. Point out that house ends where it started, facing up: that is why the street lines up.</p>' },
      { min: 15, title: 'Design your own', html: '<p>Pupils sketch a seafront building of their own on paper (a café, a boat shed, a fish shop), decompose it into parts and write a procedure for each part, using <b>poly</b> where they can. Fast finishers add parameters for colour (<code>setpencolor :c</code> takes a number 0–15) or a <b>street :n :size</b> with two parameters.</p>' },
      { min: 5, title: 'Plenary', html: '<p>Pupils show one procedure to a partner and name its parameter. <b>Ask:</b> why are procedures useful? (shorter code, reuse, easier to fix: change house once and every house changes.) Next lesson: Mrs Kelp’s beach survey, where a procedure with two inputs draws a bar chart from real data.</p>' }
    ]
  },
  {
    id: 'bay-15-survey', unit: u(3, 3), title: 'The beach survey', ...B3,
    summary: 'Mrs Kelp counted the ice creams she sold on Saturday and wants a bar chart for her café window. Pupils write a bar procedure with two inputs (how many and which colour) and call it once for each piece of data, then collect and chart the class’s own data and answer questions from the chart.',
    objective: 'We are learning to present data with a program, using a procedure with two inputs.',
    success: ['I can write a procedure with two inputs.', 'I can turn data into a bar chart with my procedure.', 'I can answer questions using my chart.'],
    curriculum: ['data', 'ssr'],
    words: [['data', 'facts and numbers we collect, like how many ice creams'], ['bar chart', 'a chart where the height of each bar shows a number'], ['input / parameter', 'a value you give a procedure when you call it'], ['scale', 'how many steps stand for one item (here 20 steps = 1 ice cream)']],
    need: [...DEV, 'A tally chart on the board for the class survey (e.g. favourite sea creature)'],
    plan: [
      { min: 8, title: 'Collect some data', html: '<p>Quick class survey: favourite sea creature from four choices (crab, seal, puffin, jellyfish). Tally it on the board. <b>Ask:</b> how can we show this so people see the answer at a glance? (A bar chart.) Introduce <b>data</b> and <b>scale</b>: if each vote is 20 steps, how tall is a bar for 7 votes? (140.)</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>. Mrs Kelp’s data is in the comments: strawberry 6, chocolate 9, mint 4, vanilla 7. The axes and the first bar are drawn: <code>repeat 2 [fd 6 * 20 rt 90 fd 40 rt 90]</code>. <b>Ask:</b> what changes from bar to bar? (The number and the colour.) So the procedure needs two inputs.</p><p>Write it together: <code>to bar :n :c</code>, <code>setpencolor :c</code>, <code>repeat 2 [fd :n * 20 rt 90 fd 40 rt 90]</code>, <code>pu rt 90 fd 60 lt 90 pd</code>, <code>end</code>. Then <code>bar 6 12</code> (12 is a pink colour number).</p>' },
      { min: 22, title: 'Your turn', html: '<p>Pupils follow the Lesson card: replace the first bar with the procedure, then call it four times: <code>bar 6 12</code>, <code>bar 9 8</code>, <code>bar 4 2</code>, <code>bar 7 9</code>. They answer questions from the chart: which flavour sold most? How many more chocolate than mint?</p><p>Common bugs: inputs in the wrong order (<code>bar 12 6</code> draws a very tall bar!), a colour name instead of a number (inputs here must be numbers: see Commands for 0–15), forgetting the move at the end of bar (all the bars on top of each other).</p>' },
      { min: 15, title: 'Our data', html: '<p>Pupils chart the class survey from the board with their procedure. Fast finishers change the scale (<code>:n * 30</code>) when the numbers are small, or add a fifth choice. Discuss: what does the chart show? Is a chart easier to read than the tally?</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> why was a procedure with inputs good for a chart? (One bar procedure, any data.) What would happen to the chart if the scale were 5? Next lesson: the seafront huts program has bugs in its procedure and variable.</p>' }
    ],
    support: 'Give the bar procedure on a card; pupils type it and focus on calling it with the right data and answering questions.',
    stretch: 'Add a third input for the width. Draw a label line under each bar. Collect data in the playground (e.g. kinds of birds) and chart it.',
    assess: ['Writes a procedure with two inputs and calls it correctly', 'Draws a bar chart that matches the data', 'Interprets the chart to answer questions'],
    steps: [
      { t: 'The data', d: 'Press Run. Read the data in the comments. Only the strawberry bar is drawn so far.' },
      { t: 'A bar procedure', d: 'Delete the 3 lines of the first bar (keep the comment). Type: to bar :n :c, then setpencolor :c, then repeat 2 [fd :n * 20 rt 90 fd 40 rt 90], then pu rt 90 fd 60 lt 90 pd, then end.' },
      { t: 'Start the chart', d: 'Under end, type: pu setxy -200 -150 seth 0 pd and then bar 6 12. Press Run.' },
      { t: 'All the data', d: 'Add bar 9 8, bar 4 2 and bar 7 9. Press Run. Four bars!' },
      { t: 'Read the chart', d: 'Which flavour sold most? How many more chocolate than mint?' },
      { t: 'Our survey', d: 'Change the inputs to chart the class survey. Choose a colour number for each bar.' },
      { t: 'Challenge', d: 'Add a third input, :w, for the width of each bar.' }
    ]
  },
  {
    id: 'bay-16-seafront', unit: u(3, 4), title: 'Fix the seafront', ...B3,
    summary: 'The seafront program should draw four beach huts that grow (70, 80, 90, 100), each with a door in the middle. It has three bugs: a fixed number where the input should be, a procedure that doesn’t take Tilly back to where she started, and a variable reset inside the loop. Pupils trace and debug procedures and variables.',
    objective: 'We are learning to debug programs that use procedures and variables.',
    success: ['I can trace the value of a variable through a loop.', 'I can check that a procedure uses its input and ends where it started.', 'I can fix bugs and explain each fix.'],
    curriculum: ['reason', 'ssr'],
    words: [['trace', 'follow a program step by step, writing down the values'], ['input / parameter', 'the value a procedure is given, like :size'], ['state', 'where the turtle is and which way it faces'], ['reset', 'put a value back to where it started']],
    need: [...DEV, 'A trace table: time round the loop · size before · size after'],
    plan: [
      { min: 8, title: 'The plan', html: '<p>Read the plan in the starter’s comments: four huts of 70, 80, 90 and 100, side by side, each with a red door in the middle. Sketch it. Recap: procedures with inputs (Teach the turtle new words), variables (One number to change them all).</p>' },
      { min: 10, title: 'Run and trace', html: '<p>Open the starter and press <b>Run</b>. <b>Ask:</b> what is wrong? (The huts are all the same size, the doors are off-centre, and the huts drift.) Trace the main loop on the board with the trace table: <code>make "size 70</code> is the first line inside the loop, so size is 70 every time round.</p>' },
      { min: 25, title: 'Debug it', html: '<p>Pupils follow the Lesson card, fixing one bug at a time and running after each fix.</p><p>The bugs: <b>1</b> <code>repeat 4 [fd 80 rt 90]</code> ignores the input — it should be <code>fd :size</code>; <b>2</b> hut moves along to draw the door but never comes back, so the next hut starts in the wrong place — add <code>pu lt 90 fd :size * 3 / 8 rt 90 pd</code> before <code>end</code>; <b>3</b> <code>make "size 70</code> is inside the loop, so it is reset every time — move it above <code>repeat 4</code>.</p><p>Teach the rule: a procedure should leave the turtle where it found it (same place, same direction).</p>' },
      { min: 12, title: 'Explain it', html: '<p>Pairs write one sentence per bug: “The bug was … It happened because … We fixed it by …”. Share a few.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> which bug was hardest to see in the code but easy to see in the picture? Next lesson: the regatta, where we combine a procedure, variables and a choice.</p>' }
    ],
    support: 'Tell pupils where each bug is (in the walls, at the end of hut, in the main loop). Trace the loop together.',
    stretch: 'Give hut a second input for the door colour. Make the gap between huts a variable that also grows.',
    assess: ['Traces a variable’s value through the loop', 'Fixes the fixed number, the procedure’s end position and the reset variable', 'Explains each bug in a sentence'],
    steps: [
      { t: 'Read and run', d: 'Read the plan in the comments, then press Run. What is different from the plan?' },
      { t: 'Bug 1: the walls', d: 'In the hut procedure the walls use fd 80. They should use the input. Change it to fd :size.' },
      { t: 'Bug 2: back to the start', d: 'hut moves to the door but never comes back. Before end, type: pu lt 90 fd :size * 3 / 8 rt 90 pd' },
      { t: 'Trace size', d: 'Follow the main loop. What is size each time round? Why does it never grow?' },
      { t: 'Bug 3: the reset', d: 'Move make "size 70 from inside the loop to the line above repeat 4. Press Run.' },
      { t: 'Check the plan', d: 'Four huts of 70, 80, 90 and 100, each with its door in the middle?' },
      { t: 'Challenge', d: 'Give hut a second input, :d, for the door colour: setpencolor :d.' }
    ]
  },
  {
    id: 'bay-17-regatta', unit: u(3, 5), title: 'The regatta', ...B3,
    summary: 'Captain Pearl’s regatta: four boats of sizes 30, 45, 60 and 75 line up side by side, and the boat procedure itself chooses the sail colour — red for big boats (size more than 50), blue for small ones. Pupils combine a procedure with an input, two variables that change in a loop and an ifelse inside the procedure.',
    objective: 'We are learning to combine procedures, variables, repetition and selection in one program.',
    success: ['I can give a procedure an input and use it in calculations.', 'I can change two variables each time round a loop.', 'I can use ifelse inside a procedure to make a choice.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['procedure', 'a new command you teach the computer'], ['input / parameter', 'a value given to a procedure, like :size'], ['variable', 'a named value that can change, like :x'], ['selection', 'choosing with if or ifelse'], ['combine', 'use several ideas together in one program']],
    need: [...DEV, 'A table to plan the line-up: boat · size · x position · sail colour'],
    plan: [
      { min: 8, title: 'Line them up', html: '<p>Captain Pearl is running the Driftwood Bay regatta. Four boats line up: sizes 30, 45, 60 and 75. Each boat is twice its size wide, and there is a gap of 20 between boats. Fill the planning table together: boat 1 at x −260, boat 2 at −260 + 30 × 2 + 20 = −180, and so on. Sail rule: size more than 50 → red, else blue.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Run</b>: one boat, and the boat procedure has no input — every number is fixed for size 40. Model turning one number into an expression: <code>to boat :size</code>, then <code>fd 80</code> becomes <code>fd :size * 2</code>, and every 40 becomes <code>:size</code>. Point out the other numbers pupils will need to change (60 is size × 1.5, 56.56 is size × 1.414, 20 is size ÷ 2).</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card in three parts: (1) give boat its input and test <code>boat 40</code> looks the same as before; (2) the sail choice: replace <code>setpencolor "blue</code> with <code>ifelse :size &gt; 50 [setpencolor "red] [setpencolor "blue]</code>; (3) the race line-up with two variables:</p><p><code>make "x -260</code>, <code>make "size 30</code>, <code>repeat 4 [pu setxy :x -100 seth 0 pd boat :size make "x :x + :size * 2 + 20 make "size :size + 15]</code>.</p><p>Common bugs: changing size before x (the gap is then worked out from the next boat’s size, so boats overlap); a forgotten number inside boat (that part doesn’t grow); <code>bk :size</code> written as <code>bk size</code>.</p>' },
      { min: 10, title: 'Make it yours', html: '<p>Pupils change the rule (three colours with an if inside the else), the number of boats, or how fast they grow. They check their planning table still matches.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> point to the procedure, the input, the two variables, the loop and the selection. Next lesson: the final project, a postcard from Driftwood Bay.</p>' }
    ],
    support: 'Give the finished boat procedure on a card; pupils write the line-up loop with the two variables.',
    stretch: 'Add flags to the masts of boats bigger than 60 only. Make a second row of boats sailing the other way, getting smaller.',
    assess: ['Turns fixed numbers into expressions of the input', 'Updates two variables correctly in the loop', 'Uses ifelse with a comparison inside a procedure'],
    steps: [
      { t: 'One fixed boat', d: 'Press Run. One boat, size 40. The boat procedure can only draw that size.' },
      { t: 'Give it an input', d: 'Change to boat into to boat :size. Change 80 to :size * 2, every 40 to :size, 60 to :size * 1.5, 56.56 to :size * 1.414 and 20 to :size / 2. At the bottom, change boat to boat 40. Same boat?' },
      { t: 'Choose the sail', d: 'Inside boat, change setpencolor "blue to: ifelse :size > 50 [setpencolor "red] [setpencolor "blue]. Try boat 60.' },
      { t: 'Two variables', d: 'Delete the last two lines (the setxy line and boat 40). Type make "x -260 and make "size 30.' },
      { t: 'The line-up', d: 'Type: repeat 4 [pu setxy :x -100 seth 0 pd boat :size make "x :x + :size * 2 + 20 make "size :size + 15]. Press Run.' },
      { t: 'Check', d: 'Four boats, getting bigger, not overlapping? Small boats blue, big boats red?' },
      { t: 'Challenge', d: 'Add a third sail colour for boats bigger than 70, or a fifth boat.' }
    ]
  },
  {
    id: 'bay-18-postcard', unit: u(3, 6), title: 'Project: a postcard from Driftwood Bay', ...B3,
    summary: 'The final design project. Tilly’s last job of the year: a postcard of Driftwood Bay for visitors to send home. Pupils design and program their own postcard using a procedure with an input (used more than once), a variable, repeats and an if or ifelse — then test, debug, evaluate and share.',
    objective: 'We are learning to design, write, debug and evaluate a program that combines procedures, variables, repetition and selection.',
    success: ['I can plan my postcard and decompose it into procedures.', 'I can use a procedure with an input, a variable, repeat and if or ifelse.', 'I can test, debug and evaluate my program.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['design', 'planning what you will make'], ['decompose', 'break a big job into smaller parts'], ['procedure', 'a new command you teach the computer'], ['variable', 'a named value that can change'], ['evaluate', 'say what went well and what to improve']],
    need: [...DEV, 'A planning sheet: sketch, list of parts, which part is a procedure, its input, the variable, the condition'],
    plan: [
      { min: 8, title: 'The brief', html: '<p>Show the starter (a postcard edge) and its success criteria: a procedure with an input used more than once, a variable (make), a repeat, an if or ifelse, and at least 3 colours. Show an example: a <b>wave :size</b> procedure used for rows of sea and a big wave, a variable for the height of each row, and a sun that is gold if it is high in the sky (<code>ifelse ycor &gt; 100</code>).</p>' },
      { min: 10, title: 'Plan', html: '<p>Pupils sketch their postcard (a harbour, the lighthouse at night, the fair, the beach huts…), list its parts, and decide which part becomes a procedure with an input (things that appear more than once at different sizes), which value is a variable, and what choice the program makes. Check plans against the criteria.</p>' },
      { min: 27, title: 'Make, test, debug', html: '<p>Pupils write and test one procedure at a time, then the main program. Remind them: procedures go at the top or bottom (to … end), a procedure should end where it started, and the status line names the bug. Ask: “Which part are you on? What is its input? What does your condition check?”</p>' },
      { min: 10, title: 'Postcard exhibition', html: '<p>Pairs show their postcard and their code to another pair, pointing to the procedure, the input, the variable, the repeat and the condition. The audience gives two stars and a wish against the criteria.</p>' },
      { min: 5, title: 'Evaluate', html: '<p>Pupils write two sentences: what they are proud of and what they would improve. End of the unit: you can now design programs with sequence, repetition, selection, variables and procedures. Well done, Driftwood Bay Artists!</p>' }
    ],
    support: 'Start from the example postcard: change the wave sizes, colours and the sun’s condition, then add one procedure of their own.',
    stretch: 'Use a procedure that calls another procedure (a harbour that calls boat), a procedure with two inputs, and a loop that checks a condition.',
    assess: ['Decomposes the postcard into procedures', 'Uses a procedure with an input more than once, a variable, a repeat and a condition', 'Debugs the program', 'Evaluates the finished program against the criteria'],
    steps: [
      { t: 'Plan your postcard', d: 'Sketch it. List the parts. Which part can be a procedure with an input? What will your variable hold?' },
      { t: 'A procedure', d: 'Write a procedure with an input, like to wave :size … end. Test it by calling it.' },
      { t: 'Use it again', d: 'Call your procedure more than once, with different inputs or in a repeat.' },
      { t: 'A variable', d: 'Use make for something that changes, like the height of each row: make "y :y + 30.' },
      { t: 'A choice', d: 'Use if or ifelse with a comparison, like ifelse ycor > 100 [setpencolor "gold] [setpencolor "orange].' },
      { t: 'Check the criteria', d: 'Procedure with an input (used twice), make, repeat, if or ifelse, 3 colours. Tick them off.' },
      { t: 'Share', d: 'Show your postcard and point to each part of your code.' }
    ]
  }
];

export const SLIDES = {
  'bay-1-jetty': [
    { t: 'Welcome to Driftwood Bay', pic: true, b: ['Tilly the turtle is the town’s new artist', 'Everyone in the bay has a drawing job for her', 'Today: a route from the beach hut to the jetty'], notes: 'Open the starter and press Run. Point out the beach hut, the jetty, the rock pool and the sandcastle. Each grey square is 50 steps.' },
    { t: 'Tilly’s commands', table: [['Command', 'What it does'], ['fd 100', 'forward 100 steps'], ['rt 90', 'turn right 90 degrees'], ['lt 90', 'turn left 90 degrees']], notes: 'Act them out. A quarter turn is 90 degrees.' },
    { t: 'Algorithm', lead: 'An algorithm is a set of exact steps, in the right order, to do a job.', q: 'Why won’t “go round the rocks” work for a computer?', notes: 'A computer needs exact commands: which way, how far.' },
    { t: 'Plan first', code: 'fd 100\nrt 90\nfd ...\nlt 90\nfd ...', q: 'How many squares? Times 50!', notes: 'Pairs plan on squared paper before typing. One answer: fd 100, rt 90, fd 400, lt 90, fd 250.' },
    { use: 'steps' },
    { t: 'Think', q: 'Which route used the fewest commands?', b: ['What happened if Tilly went straight up first?'], notes: 'Straight up crosses the rock pool. Next lesson: a sign for the beach café.' }
  ],
  'bay-2-sign': [
    { t: 'A sign for the café', pic: true, b: ['1 the post (done)', '2 the board', '3 the arrow'], notes: 'Mrs Kelp at the beach café wants a sign. Run the starter: only the post is drawn.' },
    { t: 'Decompose', lead: 'Decompose: break a big job into smaller parts.', b: ['Do one part at a time', 'Test each part before the next'], notes: 'The comments in the starter show where each part goes.' },
    { t: 'The board', code: 'setpencolor "blue\nlt 90 fd 100\nrt 90 fd 80\nrt 90 fd 200\nrt 90 fd 80\nrt 90 fd 100', notes: 'Stand up and walk it with Tilly. The post is in the middle of the bottom edge, so the first move is 100, not 200.' },
    { t: 'Pen up, pen down', code: 'pu setxy -60 -10 seth 90 pd', b: ['pu: move without drawing', 'setxy: jump to a spot', 'seth 90: face right', 'pd: draw again'], notes: 'Take out pu to show the stray line, then put it back.' },
    { use: 'steps' },
    { t: 'Think', q: 'Why did it help to do one part at a time?', notes: 'Small parts are easier to test and fix. Next lesson: window shapes with repeat.' }
  ],
  'bay-4-bunting': [
    { t: 'Bunting for the festival', pic: true, b: ['A string 500 steps long', 'One flag so far'], q: 'What is the part that repeats?', notes: 'Run the starter. One flag, then a move of 50 steps with the pen up.' },
    { t: 'One flag', code: 'repeat 3 [fd 40 rt 120]', notes: 'Tilly faces right, so turning right makes the flag hang down from the string.' },
    { t: 'How many?', lead: '500 ÷ 50 = 10', b: ['Each flag and its gap take 50 steps'], notes: 'Count-controlled loop: we work out the count before we start.' },
    { t: 'A loop inside a loop', code: 'repeat 10 [\n  repeat 3 [fd 40 rt 120]\n  pu fd 50 pd\n]', b: ['The inner loop draws one flag', 'The outer loop does flag + move 10 times'], notes: 'Line breaks help to see which bracket belongs to which repeat.' },
    { use: 'steps' },
    { t: 'Think', q: 'What would you change for 20 flags on the same string?', notes: 'Flags and moves half the size (fd 20, fd 25) and repeat 20. Next lesson: fix the lighthouse.' }
  ],
  'bay-5-lighthouse': [
    { t: 'Mr Gull’s lighthouse', b: ['A red tower: 80 wide, 200 tall', 'A gold lamp room on top: 40 by 40', '3 orange beams'], notes: 'Read the comments at the top of the starter and sketch the lighthouse.' },
    { t: 'Expected or actual?', pic: true, q: 'What is different from the plan?', notes: 'Run the starter. The tower is a staircase, the lamp room has a side missing, a line crosses the lamp room.' },
    { t: 'Bug hunt', table: [['Part', 'Expected', 'Actual', 'Fix'], ['Tower', 'a rectangle', '?', '?'], ['Lamp room', 'a square', '?', '?'], ['Beams', 'no stray line', '?', '?']], notes: 'Fixes: rt 90 instead of lt 90; repeat 4 instead of 3; pu before setxy and pd after seth 30.' },
    { use: 'steps' },
    { t: 'Think', q: 'What is the best way to find a bug?', b: ['Compare expected and actual', 'Find the part', 'Change one thing, then test'], notes: 'Next lesson: the Block 1 project, a map of the bay.' }
  ],
  'bay-6-map': [
    { t: 'A map of Driftwood Bay', pic: true, lead: 'Captain Pearl wants a map for visitors.', notes: 'The Block 1 project. The sea is drawn in the starter.' },
    { t: 'Success criteria', b: ['At least 3 places, in at least 2 colours', 'repeat used at least twice', 'pu and pd to move between places', 'A red route from one place to another'], notes: 'Pupils tick these off as they build.' },
    { t: 'Plan in parts', code: '; The beach hut\npu setxy -200 -150 seth 0 pd\nrepeat 4 [fd 60 rt 90]', b: ['1 square = 50 steps', 'A comment above each part'], notes: 'Pupils plan on squared paper, then write one part at a time.' },
    { use: 'steps' },
    { t: 'Two stars and a wish', q: 'What is great about this map? What could be better?', notes: 'Gallery walk. End of Block 1: algorithms, decomposition, repeat and debugging. Next: festival week.' }
  ],
  'bay-7-slide': [
    { t: 'Festival week: the helter-skelter', pic: true, q: 'Why does Tilly go round the same square?', notes: 'Run the starter: fd 50 every time round the loop.' },
    { t: 'repcount', table: [['Time round', 'repcount', 'repcount * 10'], ['1st', '1', '10'], ['2nd', '2', '20'], ['3rd', '3', '?'], ['10th', '?', '?']], notes: 'repcount counts the times round the loop. * means times.' },
    { t: 'The spiral', code: 'repeat 20 [fd repcount * 10 rt 90]', b: ['Every line is 10 longer than the last'], notes: 'The expression is worked out again every time round.' },
    { use: 'steps' },
    { t: 'Predict', q: 'What will fd 20 + repcount * 5 draw? And rt 91?', notes: 'It starts at 25 and grows by 5; rt 91 twists the spiral. Next lesson: if.' }
  ],
  'bay-8-ducks': [
    { t: 'Hook a duck', pic: true, b: ['Duck 5 is the gold prize duck', 'Ducks 7 and 8 are red “try again” ducks'], notes: 'Run the starter: all eight are blue.' },
    { t: 'Selection', lead: 'if runs the commands in the brackets only when the condition is true.', code: 'if repcount = 5 [setpencolor "gold]', notes: 'The condition repcount = 5 is true only the 5th time round.' },
    { t: 'Comparisons', table: [['Sign', 'Means', 'True for ducks'], ['repcount = 5', 'equals', '5'], ['repcount > 6', 'more than', '7, 8'], ['repcount < 3', 'less than', '1, 2']], notes: 'Act it out with the number cards.' },
    { use: 'steps' },
    { t: 'Think', q: 'Why must the if go inside the big loop but not inside repeat 36?', notes: 'Inside repeat 36, repcount counts the steps of the circle, not the ducks. Next lesson: ifelse.' }
  ],
  'bay-9-crab': [
    { t: 'The dancing crab', pic: true, q: 'How can the crab choose a way to go?', notes: 'Run the starter twice: always right.' },
    { t: 'Flip a coin', code: 'random 2', b: ['gives 0 or 1', 'heads = 0, tails = 1'], notes: 'Like a coin: you can’t know which before.' },
    { t: 'ifelse', code: 'ifelse random 2 = 0\n  [setpencolor "red lt 90 fd 20 rt 90]\n  [setpencolor "blue rt 90 fd 20 lt 90]', b: ['True: the first brackets', 'False: the second brackets'], notes: 'Exactly one of the two runs each time round.' },
    { use: 'steps' },
    { t: 'Think', q: 'Is random 4 = 0 a fair coin?', notes: 'True only 1 time in 4, so the crab drifts right. Next lesson: a loop that checks.' }
  ],
  'bay-10-tide': [
    { t: 'Walk to the sea', pic: true, q: 'Will fd 200 stop Tilly at the sea?', notes: 'Run the starter three times. random 250 picks a new start each time.' },
    { t: 'Where is Tilly?', lead: 'ycor tells us how high the turtle is.', b: ['The sea’s edge is at y -150', 'Stop when ycor < -150'], notes: 'The turtle senses its own position.' },
    { t: 'A loop that checks', code: 'repeat 500 [\n  if ycor < -150 [stop]\n  fd 2\n]', b: ['Check, then step. Check, then step…'], notes: 'stop ends the program here, so the walk goes last.' },
    { use: 'steps' },
    { t: 'Think', q: 'Where else do machines keep checking and stop?', notes: 'A lift at a floor, a kettle, an automatic door, a washing machine filling with water. Next lesson: debug the pier lights.' }
  ],
  'bay-11-lights': [
    { t: 'The pier lights', b: ['10 lights', '1 to 5 yellow, 6 to 10 pink', 'Light 10 is big'], notes: 'Read the plan in the comments, then Run the starter.' },
    { t: 'Trace it', table: [['repcount', 'repcount > 6?', 'Colour'], ['1', 'false', 'pink'], ['6', '?', '?'], ['7', '?', '?']], notes: 'Tracing shows the condition is the wrong way round.' },
    { t: 'Three bugs', b: ['How many? repeat 9 → repeat 10', 'Which colour? repcount < 6 for yellow', 'How big? the if must be inside the loop'], notes: 'Outside the loop repcount is 0 and the lights are already drawn.' },
    { use: 'steps' },
    { t: 'Off by one', q: 'Which lights do < 6, <= 5 and > 5 pick?', notes: 'Lights 1–5, 1–5 and 6–10. Next lesson: the fireworks project.' }
  ],
  'bay-12-fireworks': [
    { t: 'The fireworks finale', pic: true, lead: 'A show that is different every time.', notes: 'The Block 2 project. One firework is in the starter.' },
    { t: 'Success criteria', b: ['A repeat', 'random', 'An if or ifelse', 'A comparison: < > or =', 'At least 2 colours'], notes: 'Pupils tick these off.' },
    { t: 'An idea', code: 'repeat 8 [\n  pu setxy random 500 - 250 random 300 - 50 pd\n  ifelse random 2 = 0 [setpencolor "pink] [setpencolor "cyan]\n  if ycor > 150 [setpencolor "gold]\n  repeat 10 [fd 40 bk 40 rt 36]\n]', notes: 'Fireworks higher than 150 are gold. Pupils make their own.' },
    { use: 'steps' },
    { t: 'Evaluate', q: 'Point to your repeat, your random and your condition.', notes: 'End of Block 2. Next block: building the seafront with variables and procedures.' }
  ],
  'bay-13-size': [
    { t: 'The beach hut', pic: true, q: 'How many numbers change for a hut 160 wide?', notes: 'Run the starter. 80, 30, 40 and 20 all depend on the size.' },
    { t: 'A variable', lead: 'A variable is a named box that holds a value.', code: 'make "size 80\nfd :size', b: ['make "size … puts a value in the box', ':size uses what is in the box'], notes: 'Quote mark to make it, colon to use it.' },
    { t: 'Every number from size', table: [['Size 80', 'Expression'], ['80', ':size'], ['30', ':size * 3 / 8'], ['40', ':size / 2'], ['20', ':size / 4']], notes: 'Check each one with size 80.' },
    { use: 'steps' },
    { t: 'Think', q: 'Why is one variable better than four numbers?', notes: 'Change one line and everything stays right. Next lesson: procedures.' }
  ],
  'bay-15-survey': [
    { t: 'The beach survey', pic: true, table: [['Flavour', 'Ice creams'], ['strawberry', '6'], ['chocolate', '9'], ['mint', '4'], ['vanilla', '7']], notes: 'Mrs Kelp’s data. Run the starter: only the first bar is drawn.' },
    { t: 'A bar procedure', code: 'to bar :n :c\n  setpencolor :c\n  repeat 2 [fd :n * 20 rt 90 fd 40 rt 90]\n  pu rt 90 fd 60 lt 90 pd\nend', b: [':n how many, :c the colour number', '20 steps for each ice cream'], notes: 'Two inputs, because two things change from bar to bar.' },
    { t: 'The chart', code: 'pu setxy -200 -150 seth 0 pd\nbar 6 12\nbar 9 8\nbar 4 2\nbar 7 9', notes: 'Colour numbers: see Commands (0–15).' },
    { use: 'steps' },
    { t: 'Read the chart', q: 'Which flavour sold most? How many more chocolate than mint?', notes: 'Chocolate; 5 more. Then chart the class survey. Next lesson: debug the seafront.' }
  ],
  'bay-16-seafront': [
    { t: 'The seafront', b: ['4 huts: 70, 80, 90, 100', 'Side by side', 'A red door in the middle of each'], notes: 'Read the plan in the comments, then Run the starter.' },
    { t: 'Trace size', table: [['Time round', 'size at the start', 'size at the end'], ['1', '70', '80'], ['2', '?', '?'], ['3', '?', '?']], notes: 'make "size 70 inside the loop resets it to 70 every time.' },
    { t: 'A good procedure…', b: ['uses its input, not a fixed number', 'ends where it started, facing the same way'], notes: 'Otherwise every hut after the first starts in the wrong place.' },
    { use: 'steps' },
    { t: 'Explain it', q: 'The bug was… It happened because… We fixed it by…', notes: 'Pairs write one sentence per bug. Next lesson: the regatta.' }
  ],
  'bay-17-regatta': [
    { t: 'The regatta', pic: true, b: ['Boats of 30, 45, 60 and 75', 'Big boats (more than 50): red sails', 'Small boats: blue sails'], notes: 'Run the starter: one fixed boat.' },
    { t: 'Plan the line-up', table: [['Boat', 'size', 'x', 'sail'], ['1', '30', '-260', 'blue'], ['2', '45', '-180', '?'], ['3', '60', '?', '?'], ['4', '75', '?', '?']], notes: 'Next x = x + size × 2 + 20. Answers: −70 and 70; blue, red, red.' },
    { t: 'The choice is inside the procedure', code: 'ifelse :size > 50 [setpencolor "red] [setpencolor "blue]', notes: 'The procedure decides for itself from its input.' },
    { t: 'Two variables', code: 'make "x -260\nmake "size 30\nrepeat 4 [\n  pu setxy :x -100 seth 0 pd\n  boat :size\n  make "x :x + :size * 2 + 20\n  make "size :size + 15\n]', notes: 'x must change before size, so the gap uses this boat’s size.' },
    { use: 'steps' },
    { t: 'Think', q: 'Point to the procedure, the input, the variables, the loop and the selection.', notes: 'Next lesson: the final project.' }
  ],
  'bay-18-postcard': [
    { t: 'A postcard from Driftwood Bay', pic: true, lead: 'Tilly’s last job: a postcard for visitors to send home.', notes: 'The final project. The starter draws the postcard’s edge.' },
    { t: 'Success criteria', b: ['A procedure with an input, used more than once', 'A variable (make)', 'A repeat', 'An if or ifelse', 'At least 3 colours'], notes: 'Pupils tick these off.' },
    { t: 'An example idea', code: 'to wave :size\n  repeat 9 [fd :size / 10 rt 10]\n  repeat 9 [fd :size / 10 lt 10]\nend', b: ['Rows of waves: make "y :y + 30', 'A sun: ifelse ycor > 100 [gold] [orange]'], notes: 'Show the example, then pupils plan their own.' },
    { use: 'steps' },
    { t: 'Evaluate', q: 'What are you proud of? What would you improve?', notes: 'End of the unit: sequence, repetition, selection, variables and procedures. Well done, Driftwood Bay Artists!' }
  ]
};
