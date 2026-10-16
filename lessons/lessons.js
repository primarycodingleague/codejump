/* CodeJump · ready-made lessons.
 * Each lesson is a complete, no-preparation computing lesson for one class: a teacher plan (timings, what to say,
 * key words, support/stretch, assessment, National Curriculum links) plus a starter project (starters/<id>.json,
 * built by make-starters.mjs) and the pupil steps that CodeJump shows in its "Lesson" card while pupils work.
 * The host (build-and-play.html) lazy-loads this file the first time someone opens Lessons.
 *
 * Fields: id · unit? (e.g. 'Robot Helper Academy · Block 1 · Lesson 1') · title · ks ('ks1'|'ks2') · years · minutes · type (projectType of the starter) · tool (what pupils
 * use, in words) · summary · objective ("We are learning to …") · success (pupil "I can" statements) · curriculum
 * (objective keys: alg/debug1/predict/create1 for ages 5–7, design/ssr/reason/data/safe for 7–11 — curricula.js turns them into each
 * country's official statements) · words [[word, meaning]] · need · plan [{min, title, html}] · support · stretch ·
 * assess · steps [{t, d}] (pupil card: short title + one or two plain sentences).
 * Keep the pupil steps in step with the real buttons and block names — tests/lessons.test.mjs opens every starter.
 *
 * Slides (SLIDES below, attached as lesson.slides): the pupil-facing slides a teacher presents on the board. CodeJump
 * builds the deck as: title · "We are learning to" + "I can" · key words · these slides · "How did we do?". A slide is
 * {t (title), lead? (one big sentence), q? (a question to discuss), b? (bullet points), code? (typed code), pic? (true =
 * the starter picture), table? ([[header…], [row…]…]), notes (what the teacher says/does — shown only in Notes and
 * Presenter view)}. {use:'steps'} puts the "Your turn" slide (the pupil Lesson-card steps) at that point.
 */

export const LESSONS = [
  // ───────────────────────────────── KEY STAGE 1 ─────────────────────────────────
  {
    id: 'cat-to-star', title: 'Get the cat to the star', ks: 'ks1', years: 'Years 1–2', minutes: 45, type: 'stage', tool: 'Picture blocks (Stage)',
    summary: 'Pupils write their first algorithm: a sequence of picture blocks that moves the cat to the star.',
    objective: 'We are learning to give a computer clear instructions in the right order.',
    success: ['I can join blocks to make a program.', 'I can press GO to run my program.', 'I can change a number to fix my program.'],
    curriculum: ['alg', 'debug1'],
    words: [['algorithm', 'a set of steps in the right order'], ['program', 'instructions a computer can follow'], ['sequence', 'the order the steps go in'], ['run', 'make the program start']],
    need: ['A device per pupil or pair, with CodeJump open', 'The board, to show the class first'],
    plan: [
      { min: 5, title: 'Warm up: be a robot', html: '<p>Choose a pupil to be the “robot”. Give exact instructions to walk to the door: “Take 3 steps forward. Turn right.” Then give a vague one (“Go over there”). <b>Ask:</b> which instructions worked? Why do computers need exact steps?</p><p>Introduce the word <b>algorithm</b>: a set of steps in the right order.</p>' },
      { min: 10, title: 'Show me', html: '<p>On the board, open the lesson (<b>Open the starter</b>). Point out the cat and the star. Drag the yellow <b>flag</b> block into the script area, then one <b>blue move-right arrow</b> after it. Press <b>GO</b>. The cat moves one step.</p><p><b>Ask:</b> how many steps do we need? Count the squares together. Change the number on the block (tap + or −) and press GO again.</p>' },
      { min: 20, title: 'Your turn', html: '<p>Pupils work through the <b>Lesson</b> card in the corner of the screen (it can read itself aloud). Most will reach the star in a few tries — praise the trying and fixing.</p><p>Circulate and ask: “What will happen if you press GO now?” <b>before</b> they press it.</p>' },
      { min: 10, title: 'Share', html: '<p>Two or three pupils show their program on the board. Read each one aloud as an algorithm: “When GO is pressed, move right 5, then say I did it!”. <b>Ask:</b> did anyone use a different number of blocks to get there?</p>' }
    ],
    support: 'Pair pupils. Let them count the squares with a finger on the screen before choosing the number.',
    stretch: 'Move the star (drag it up a row) and make the cat go right and then up. Add a “say” block and a “hop” to celebrate.',
    assess: ['Joins a start block and move blocks into one program', 'Predicts where the cat will stop before pressing GO', 'Changes a number to correct the program'],
    steps: [
      { t: 'Find the cat and the star', d: 'Your job: make the cat walk to the star. Look at the blocks at the bottom of the screen.' },
      { t: 'Start your program', d: 'Tap the yellow Start blocks. Drag the green flag block down into the empty space.' },
      { t: 'Move right', d: 'Tap the blue Move blocks. Drag the arrow pointing right and join it after the flag.' },
      { t: 'Press GO', d: 'Press GO at the top. How far did the cat go? Tap + on the arrow block to make the number bigger.' },
      { t: 'Reach the star', d: 'Keep changing the number and pressing GO until the cat reaches the star.' },
      { t: 'Celebrate!', d: 'Tap the purple Looks blocks. Add a speech bubble block at the end and type: I did it!' },
      { t: 'Challenge', d: 'Drag the star somewhere new. Can you change your program to reach it again?' }
    ]
  },
  {
    id: 'fix-the-dance', title: 'Fix the dance', ks: 'ks1', years: 'Years 1–2', minutes: 45, type: 'stage', tool: 'Picture blocks (Stage)',
    summary: 'The cat’s dance program has two bugs. Pupils predict, test and debug it.',
    objective: 'We are learning to find and fix mistakes (bugs) in a program.',
    success: ['I can say what I think a program will do.', 'I can find a bug by testing.', 'I can fix a bug by changing a block.'],
    curriculum: ['debug1', 'predict'],
    words: [['bug', 'a mistake in a program'], ['debug', 'find and fix the mistakes'], ['predict', 'say what you think will happen'], ['test', 'run it to check']],
    need: ['A device per pupil or pair, with CodeJump open'],
    plan: [
      { min: 5, title: 'The dance', html: '<p>Write the dance on the board: <b>3 steps right · hop · 3 steps back left · say Ta-da!</b> Do the dance together as a class.</p>' },
      { min: 10, title: 'Predict', html: '<p>Open the starter on the board. Read the program out loud block by block <b>without pressing GO</b>. <b>Ask:</b> will the cat do our dance? Take a vote. Then press GO. Introduce <b>bug</b> and <b>debug</b>.</p>' },
      { min: 20, title: 'Debug it', html: '<p>Pupils follow the Lesson card: run it, spot what is different from the dance, and change one block at a time. There are two bugs: a <b>turn</b> block instead of a <b>hop</b>, and moving back left only <b>2</b> instead of <b>3</b>.</p><p>Encourage “change one thing, then test”.</p>' },
      { min: 10, title: 'Bug hunters', html: '<p>Pupils swap devices, put ONE new bug into a partner’s dance, and swap back to find it. Finish by asking: what is the best way to find a bug?</p>' }
    ],
    support: 'Give a paper copy of the dance with pictures of the blocks to match against the screen.',
    stretch: 'Make the dance longer and put it in a repeat loop (orange Control blocks) so it dances twice.',
    assess: ['Predicts the outcome before running', 'Finds a bug by comparing what happens with what should happen', 'Fixes both bugs'],
    steps: [
      { t: 'The cat’s dance', d: 'The dance should be: 3 steps right, hop, 3 steps back left, then say Ta-da!' },
      { t: 'Predict', d: 'Look at the cat’s blocks. Do you think the cat will do the right dance? Say why to your partner.' },
      { t: 'Test it', d: 'Press GO and watch carefully. What is different from the real dance?' },
      { t: 'Bug 1', d: 'One block makes the cat spin instead of hop. Drag it away (to remove it) and add the hop block from Move.' },
      { t: 'Bug 2', d: 'Does the cat get all the way back? Change the number on the left arrow so it goes back 3.' },
      { t: 'Test again', d: 'Press GO. Does it match the dance now? If not, keep debugging!' },
      { t: 'Challenge', d: 'Add a repeat block from Control and put the dance inside it, so the cat dances twice.' }
    ]
  },
  {
    id: 'level-for-a-friend', title: 'Make a level for a friend', ks: 'ks1', years: 'Years 1–2', minutes: 50, type: 'platformer', tool: 'Platformer Lab (build mode)',
    summary: 'Pupils design a platform game level from Start to Finish, play-test it, then let a friend try.',
    objective: 'We are learning to plan, make and test something on a computer.',
    success: ['I can place blocks to make a path.', 'I can test my level by playing it.', 'I can make my level better after testing.'],
    curriculum: ['create1', 'debug1'],
    words: [['design', 'plan how something will look and work'], ['test', 'try it to check it works'], ['improve', 'make it better']],
    need: ['A device per pupil or pair', 'Optional: squared paper to sketch a level first'],
    plan: [
      { min: 5, title: 'What makes a good level?', html: '<p>Show the starter level on the board. It has a <b>Start</b>, a <b>Finish</b> flag and a big gap. Press <b>Play</b> and fall in the gap! <b>Ask:</b> what do we need to add so the player can reach the Finish?</p>' },
      { min: 25, title: 'Build and test', html: '<p>Pupils follow the Lesson card: add platforms over the gap, add stars to collect, then <b>Play</b> to test. Insist on testing after every few changes — “build a bit, test a bit”.</p>' },
      { min: 15, title: 'Friend test', html: '<p>Pupils swap seats and play a partner’s level. The partner says one thing they liked and one thing to improve. Pupils make one improvement.</p>' },
      { min: 5, title: 'Reflect', html: '<p><b>Ask:</b> why did we test our levels? What did you change after your friend played it?</p>' }
    ],
    support: 'Build the first platform together. Keep levels short.',
    stretch: 'Add a spike or an enemy to make it harder, but make sure it can still be finished.',
    assess: ['Creates a path from Start to Finish', 'Tests and changes the level', 'Responds to a partner’s feedback'],
    steps: [
      { t: 'Try the level', d: 'Press Play. Can you reach the Finish flag? Use the arrow keys to move and jump. Press Build to go back.' },
      { t: 'Fill the gap', d: 'Tap the Platform block in the list, then tap the grid to build a bridge over the gap.' },
      { t: 'Test it', d: 'Press Play. Can you get to the Finish now? If not, change your platforms.' },
      { t: 'Add stars', d: 'Find the Star block (type Star in the Find box). Put some stars above your platforms to collect.' },
      { t: 'Make it fun', d: 'Add some higher platforms to jump on. Test again!' },
      { t: 'Save it', d: 'Press Save and give your level a name.' },
      { t: 'Friend test', d: 'Let a friend play your level. What did they like? What could be better?' }
    ]
  },

  // ───────────────────────────────── KEY STAGE 2 ─────────────────────────────────
  {
    id: 'turtle-shapes', title: 'Shapes with repeat', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'turtle', tool: 'Turtle Lab (typed Logo)',
    summary: 'Pupils turn a long list of commands into a short repeat loop, then work out the rule for drawing any shape.',
    objective: 'We are learning to use repetition (loops) to make programs shorter.',
    success: ['I can spot a pattern in a program.', 'I can use repeat to draw a shape.', 'I can explain how to work out the turn for any shape.'],
    curriculum: ['ssr', 'reason'],
    words: [['repeat / loop', 'do the same steps again'], ['command', 'one instruction, like fd 100'], ['angle', 'how far to turn, in degrees'], ['pattern', 'something that happens again and again']],
    need: ['A device per pupil or pair', 'Optional: protractors / a shape poster'],
    plan: [
      { min: 5, title: 'Spot the pattern', html: '<p>Show the starter code on the board: eight lines that draw a square. Press <b>Run</b>. <b>Ask:</b> what do you notice about the lines? (fd 100 and rt 90 four times.) Introduce <b>repeat</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Replace the eight lines with <code>repeat 4 [fd 100 rt 90]</code> and Run. Same square, one line! Explain the square brackets hold the steps to repeat.</p>' },
      { min: 25, title: 'Shape hunt', html: '<p>Pupils follow the Lesson card: triangle, then hexagon, then any shape. Many will guess <code>rt 60</code> for a triangle — let them test it and see why it fails. Collect a table on the board: sides · turn · sides × turn. Pupils should discover the turns always add up to 360.</p>' },
      { min: 15, title: 'Patterns', html: '<p>Show <code>repeat 12 [repeat 4 [fd 80 rt 90] rt 30]</code> — a loop inside a loop. Pupils make their own pattern and change colours with <code>setpencolor "red</code>.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> how would you draw a 10-sided shape? (repeat 10 [fd 50 rt 36]). Why are loops useful?</p>' }
    ],
    support: 'Give the turn for each shape and let pupils change only the number of sides; use the Examples button for ideas.',
    stretch: 'Draw a 5-pointed star (rt 144). Explain why it works.',
    assess: ['Replaces repeated commands with a repeat loop', 'Draws a triangle and a hexagon correctly', 'States the rule turn = 360 ÷ sides'],
    steps: [
      { t: 'Run the code', d: 'Press Run. The turtle draws a square — but the code is very long! What pattern can you see?' },
      { t: 'Use repeat', d: 'Delete all the lines and type: repeat 4 [fd 100 rt 90] — then press Run. Same square, one line!' },
      { t: 'Triangle', d: 'Change it to repeat 3 and try a turn. Is rt 60 right? Test and find the turn that makes a closed triangle.' },
      { t: 'Hexagon', d: 'Now draw a shape with 6 sides. What turn do you need?' },
      { t: 'Find the rule', d: 'Multiply the sides by the turn for each shape. What number do you always get? Use it to draw an octagon (8 sides).' },
      { t: 'Make a pattern', d: 'Try: repeat 12 [repeat 4 [fd 80 rt 90] rt 30]. Change the numbers. Add setpencolor "blue at the start.' },
      { t: 'Challenge', d: 'Draw a star: repeat 5 [fd 150 rt 144]. Can you explain why 144 works?' }
    ]
  },
  {
    id: 'catch-the-stars', title: 'Catch the stars', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'stage', tool: 'Stage Lab (Scratch-style blocks)',
    summary: 'Pupils finish a catching game: an “if touching” check adds to the score and sends the star back to the top.',
    objective: 'We are learning to use selection (if … then) and a score variable in a game.',
    success: ['I can explain what my program does when the star touches the catcher.', 'I can use an if block with a condition.', 'I can change the score.'],
    curriculum: ['ssr', 'design'],
    words: [['selection', 'choosing what to do with if … then'], ['condition', 'a question that is true or false'], ['variable', 'a named value that can change, like the score'], ['forever loop', 'repeats until the game stops']],
    need: ['A device per pupil or pair'],
    plan: [
      { min: 5, title: 'Play the unfinished game', html: '<p>Open the starter on the board and press <b>Run</b>. The catcher moves with the arrow keys and a star falls — but catching it does nothing. <b>Ask:</b> what should happen when the star touches the catcher? Write it as a sentence: “<b>If</b> the star is touching the catcher, <b>then</b> add 1 to the score and go back to the top.”</p>' },
      { min: 10, title: 'Read the code', html: '<p>Click the <b>Star</b> sprite and read its blocks together: a forever loop moves it down, and an <b>if</b> sends it back to the top when it reaches the bottom. That if is selection! The <b>Catcher</b> moves with two “when key pressed” scripts.</p>' },
      { min: 25, title: 'Finish the game', html: '<p>Pupils follow the Lesson card to add the second if block inside the Star’s forever loop: <b>if touching Catcher then change score by 1, go to random position, set y to 170</b>. Then they reset the score when Run is pressed.</p><p>Common bug: putting the if outside the forever loop, so it only checks once. Ask “how often does the computer check?”</p>' },
      { min: 15, title: 'Make it your own', html: '<p>Stretch ideas on the card: make the star fall faster as the score goes up, or add a rock that loses points.</p>' },
      { min: 5, title: 'Plenary', html: '<p>Pupils explain their if block to a partner using the words <b>condition</b> and <b>selection</b>.</p>' }
    ],
    support: 'Show the finished if block on the board for pupils to copy; focus on explaining it.',
    stretch: 'Speed up: replace “change y by -4” with a speed variable that grows by 1 every 5 points. Add a second sprite to avoid.',
    assess: ['Places an if … then with a touching condition inside the forever loop', 'Changes the score when the condition is true', 'Explains why the check must be inside the loop'],
    steps: [
      { t: 'Play it', d: 'Press Run. Move the catcher with the left and right arrow keys. What happens when you catch the star? (Nothing yet!)' },
      { t: 'Read the Star’s code', d: 'Click the Star in the sprite list. Find the forever loop and the if block. What does each part do?' },
      { t: 'Add an if', d: 'From Control, drag an “if then” block inside the forever loop, under the other if.' },
      { t: 'The condition', d: 'From Sensing, drag “touching … ?” into the if’s gap and choose Catcher.' },
      { t: 'Score!', d: 'From Score, put “change score by 1” inside your new if. Then add “go to random position” and “set y to 170” (Motion) so the star starts again at the top.' },
      { t: 'Test it', d: 'Press Run and catch some stars. Does the score go up by 1 each time?' },
      { t: 'Start at zero', d: 'Put “set score to 0” under “when green flag clicked”, so every game starts from 0.' },
      { t: 'Challenge', d: 'Make the star fall faster (a bigger minus number), or add a rock sprite that takes a point away!' }
    ]
  },
  {
    id: 'microbit-rps', title: 'Rock, paper, scissors on a micro:bit', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'stage', tool: 'micro:bit (on-screen)',
    summary: 'Pupils make a rock, paper, scissors game: shaking the micro:bit picks a random number, and if blocks choose which picture to show.',
    objective: 'We are learning to use input, random numbers, variables and selection to control a device.',
    success: ['I can use an input (shake) to start my code.', 'I can store a random number in a variable.', 'I can use if blocks to choose an output.'],
    curriculum: ['design', 'ssr'],
    words: [['input', 'something the device senses, like a shake or a button'], ['output', 'something the device does, like lighting LEDs'], ['random', 'cannot be predicted'], ['variable', 'a named value that can change'], ['selection', 'choosing what to do with if … then']],
    need: ['A device per pupil or pair', 'Optional: real micro:bits (V2) and USB cables to try it for real'],
    plan: [
      { min: 5, title: 'Play the game', html: '<p>Play rock, paper, scissors with the class. <b>Ask:</b> how could a computer choose fairly? Introduce <b>random</b>.</p>' },
      { min: 10, title: 'Read the starter', html: '<p>Open the starter on the board. Press <b>Run</b>, then press the <b>Shake</b> button under the micro:bit. Read the code: <b>on shake</b> sets <b>hand</b> to a random number from 1 to 3, and <b>if hand = 1</b> shows a rock. Shake a few times — sometimes nothing shows. <b>Ask:</b> why? (2 and 3 have no pictures yet.)</p>' },
      { min: 25, title: 'Finish the game', html: '<p>Pupils follow the Lesson card: duplicate the if block twice, change the numbers to 2 and 3, and draw paper and scissors in the <b>show leds</b> grid by clicking the squares.</p><p>Check understanding: “What is in the variable <b>hand</b> right now?”</p>' },
      { min: 15, title: 'Real micro:bits (optional)', html: '<p>If you have micro:bit V2s, press the <b>micro:bit</b> button in the toolbar and choose <b>Flash over USB</b> (Chrome/Edge) or <b>Download .hex</b> and drag the file onto the MICROBIT drive. Pupils play against each other for real.</p>' },
      { min: 5, title: 'Plenary', html: '<p>Pupils label their code with the words <b>input</b>, <b>variable</b>, <b>random</b>, <b>selection</b> and <b>output</b>.</p>' }
    ],
    support: 'Pre-make the second if block on the board; pupils only change the number and draw.',
    stretch: 'Use button A to keep score of wins, or show “R”, “P” or “S” with show string before the picture.',
    assess: ['Explains that the shake is an input and the LEDs are an output', 'Completes three if blocks for 1, 2 and 3', 'Explains why the variable makes the choice random'],
    steps: [
      { t: 'Try it', d: 'Press Run, then press the Shake button under the micro:bit. Do it a few times. Why does nothing show sometimes?' },
      { t: 'Read the code', d: 'on shake sets hand to a random number from 1 to 3. If hand is 1, it shows a rock. 2 and 3 have no pictures yet!' },
      { t: 'Paper', d: 'Right-click the if block and choose Duplicate. Put the copy under the first if, and change its 1 to 2.' },
      { t: 'Draw paper', d: 'Click the squares in the copy’s show leds grid to draw paper (a big rectangle).' },
      { t: 'Scissors', d: 'Make one more copy for 3 and draw scissors.' },
      { t: 'Test it', d: 'Press Run and Shake again and again. Do you see all three pictures?' },
      { t: 'Challenge', d: 'If you have a real micro:bit, press the micro:bit button at the top to send your game to it!' }
    ]
  },
  {
    id: 'critter-engineers', title: 'Critter engineers', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'critter', tool: 'Critter Lab (3D)',
    summary: 'Pupils run a proper fair test on a wobbly walking creature: they change one variable (the timing of its legs), keep everything else the same, measure the result and record it in a table, then explain what made the difference.',
    objective: 'We are learning to plan and carry out a fair test: change one variable, measure the result, record it and explain it.',
    success: ['I can say which one thing I am changing and what I am keeping the same.', 'I can measure each test and record it in a results table.', 'I can use my results to explain which change made it better, and why.'],
    curriculum: ['design', 'reason'],
    words: [['fair test', 'change only one thing so you know what made the difference'], ['iterate', 'test, improve, test again'], ['timing (beat)', 'when each leg moves in its cycle'], ['debug', 'find and fix what is going wrong']],
    need: ['A device per pupil or pair (Critter Lab needs the internet the first time)', 'A results table: change · Sprint distance'],
    plan: [
      { min: 5, title: 'Engineers test things', html: '<p>Show a video of a robot or animal walking. <b>Ask:</b> how do four-legged animals move their legs? (Not all at once!) Introduce <b>fair test</b>: change one thing at a time.</p>' },
      { min: 10, title: 'Test the starter', html: '<p>Open the starter on the board, press <b>Test it!</b> and watch the Sprint. The front and back feet on each side step at the same time, so it rocks from side to side and barely gets anywhere. Record the distance (about 1 m).</p>' },
      { min: 25, title: 'Improve it', html: '<p>Pupils follow the Lesson card. They click a <b>back</b> foot, open its <b>Motion</b> tab and press <b>Opposite beat</b>, do the same for the other back foot, and test again: now diagonal feet step together (a trot, like a horse) and it goes nearly three times as far. Each change is one row in their results table.</p><p>Then they try their own ideas, one at a time: bigger foot loops, longer legs, different body size.</p>' },
      { min: 15, title: 'Class Showdown (optional)', html: '<p>Signed in with a class? Open <b>Cloud → Teacher → Critter Showdown</b>, pick four pupils and race their Critters on the board.</p>' },
      { min: 5, title: 'Plenary', html: '<p>Which change made the biggest difference? How do you know it was that change and not something else?</p>' }
    ],
    support: 'Watch the Critter Lab video guide 2 “Fix the wobble with beats” (Guides button) together.',
    stretch: 'Try Hurdles: use Lift higher on the feet so it clears the humps. Record both contests.',
    assess: ['Records a result before and after each change', 'Changes one variable at a time', 'Explains why stepping with diagonal feet (a trot) makes it walk better'],
    steps: [
      { t: 'Test it', d: 'Press Test it! and watch the Sprint. How far does the Critter get? Write the distance down.' },
      { t: 'Watch the legs', d: 'Press Build and look at the beat chart at the bottom. The front and back feet on the same side step at the same time — that’s why it rocks.' },
      { t: 'First back foot', d: 'Click one of the back feet (the lowest part of a back leg). Open its Motion tab and press Opposite beat.' },
      { t: 'Other back foot', d: 'Now click the other back foot, open Motion and press Opposite beat too.' },
      { t: 'Test again', d: 'Press Test it! How far now? Write it down. Was it the beat change that made the difference?' },
      { t: 'Your idea', d: 'Change ONE thing (a bigger foot loop, longer legs…), then test. Keep it if it helps, undo if it doesn’t.' },
      { t: 'Challenge', d: 'Choose Hurdles in Test it! Can you get over the humps? Try Lift higher on the feet.' }
    ]
  },
  {
    id: 'obstacle-course', title: '3D obstacle course', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'Pupils build a 3D obstacle course: walls to dodge, a moving block, lava that sends you back, and a finish line event.',
    objective: 'We are learning to use events and loops to make a 3D game work.',
    success: ['I can add and place objects in a 3D world.', 'I can use an event (when … touches …) to make something happen.', 'I can use a forever loop to make an object move.'],
    curriculum: ['design', 'ssr'],
    words: [['event', 'something that happens, like touching, that starts code'], ['x, y, z', 'left/right, up/down and forwards/backwards in 3D'], ['loop', 'repeat code'], ['debug', 'find and fix problems']],
    need: ['A device per pupil or pair (3D World needs the internet the first time)'],
    plan: [
      { min: 5, title: 'Play the course', html: '<p>Open the starter on the board and press <b>Run</b>. Walk the character with the arrow keys to the gold finish block — “You made it!”. <b>Ask:</b> which block made that happen? Find the <b>when player touches finish</b> event.</p>' },
      { min: 10, title: '3D positions', html: '<p>Press <b>Stop</b> to go back to building. Click the wall: its block lights up. Drag the arrows to move it and watch the x, y, z numbers change. Explain x (left/right), y (up), z (forwards).</p>' },
      { min: 25, title: 'Build the course', html: '<p>Pupils follow the Lesson card: add more walls, a moving block (a forever loop with two glides) and lava that sends the player back to the start with another <b>when … touches …</b> event. Each new object needs its own name: show how to make one with <b>Variables → Create variable</b> and pick it in the block’s name list.</p><p>Encourage testing after each new obstacle.</p>' },
      { min: 15, title: 'Swap and play', html: '<p>Pupils play a partner’s course and suggest one improvement.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> which parts of your game were events? Which used a loop?</p>' }
    ],
    support: 'Build the moving block together on the board first.',
    stretch: 'Add a timer or a score with a variable and “show … on the screen”. Use different characters and models.',
    assess: ['Adds and positions objects', 'Uses a touch event correctly', 'Uses a forever loop with glides for a moving obstacle'],
    steps: [
      { t: 'Play it', d: 'Press Run. Walk with the arrow keys (Space jumps) to the gold finish block. Then press Stop.' },
      { t: 'Find the event', d: 'Find the block “when player touches finish”. That’s an event: it runs when the two objects touch.' },
      { t: 'Move things', d: 'Click the wall in the world. Drag its arrows to move it. Watch the x, y, z numbers change in its block.' },
      { t: 'More walls', d: 'In Variables, press Create variable and call it wall2. From Shapes, drag a “make box” block under the others inside “when Run is clicked”, choose wall2 as its name, then change its size and position.' },
      { t: 'Moving block', d: 'Make a variable called mover and a box with that name. From Control, add a forever loop at the end. From Motion, put two “glide mover to …” blocks inside it so the box slides back and forth.' },
      { t: 'Lava!', d: 'Make a flat red box called lava (a new variable again). From Events, add “when player touches lava” and put “move player to x 0 y 0 z 0” (Motion) inside.' },
      { t: 'Test and swap', d: 'Press Run and try your course. Then let a friend play it!' }
    ]
  },
  {
    id: 'smart-trains', title: 'Smart trains: sense, react, decide', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'train', tool: 'Train Lab (blocks)',
    summary: 'Pupils find out how a smart train senses the coloured snaps on its track, write an event script that reacts to what its sensor sees, count laps with a variable, then use if … else so the train decides which way to go at a split: round the oval three times, then off to the depot.',
    objective: 'We are learning how a computer senses the world, reacts to events and uses selection (if … else) to make decisions.',
    success: ['I can explain how the train senses the coloured snaps (an input).', 'I can use an event block to make the train react to a colour.', 'I can count with a variable.', 'I can use if … else with a condition to choose which way the train goes.'],
    curriculum: ['ssr', 'design', 'reason'],
    words: [['sensor', 'a part that measures something about the world, like the colour under the train; it is an input'], ['event', 'something that happens, like the sensor seeing red, that starts a script'],
      ['selection', 'choosing what to do with if … else'], ['condition', 'a question that is true or false, like “laps < 3”'], ['variable', 'a named value that can change, like the number of laps'], ['output', 'what the computer does, like driving the motor or lighting a light']],
    need: ['A device per pupil or pair', 'Optional: red, green and white paper squares for the warm-up', 'Optional: real smart trains and track, to try the same blocks for real'],
    plan: [
      { min: 5, title: 'Be a smart train', html: '<p>Pupils walk slowly round a space as “trains”. Hold up colour cards: <b>red</b> = stop and count to 2, <b>green</b> = walk slowly, <b>white</b> = get ready. <b>Ask:</b> how did you know what to do? Draw out the three parts: your eyes <b>sensed</b> the colour (input), seeing it was the <b>event</b>, and you <b>decided</b> what to do (and your legs were the output).</p>' },
      { min: 10, title: 'How does the train know?', html: '<p>Open the starter on the board and press <b>Run</b>. A smart train has a <b>colour sensor</b> underneath that reads the coloured <b>snaps</b> on the track. Watch it stop at the white-red snaps by the station and slow down at white-green. <b>Ask:</b> what is the input? (the colour sensor) What are the outputs? (the motor, the lights)</p><p>Point out the split in the top straight and the <b>Depot</b> sign on the passing loop: today the train has to decide which way to go.</p>' },
      { min: 15, title: 'Events: react to what it sees', html: '<p>Pupils follow the Lesson card to build <b>when train sees red → set top LED color to red</b> and test it. It only runs when the sensor sees red: that is an <b>event</b>. Then they make a <b>laps</b> variable that goes up each time the train sees red (once every lap, at the station) and watch it count on the board.</p><p>Common bug: putting “set laps to 0” under the red event, so it never gets past 1. Ask “when does each script run?”</p>' },
      { min: 20, title: 'Selection: decide at the split', html: '<p>Write the rule on the board: “<b>If</b> laps &lt; 3, go straight on. <b>Else</b>, go right to the depot.” Pupils add <b>if … else</b> under “change laps by 1”, with <b>laps &lt; 3</b> as the condition and <b>on next split go straight / right</b> inside.</p><p><b>Ask:</b> why do we decide at the station, not at the split? (The decision has to be made before the train gets there, and the station comes just before the split.) Fast finishers try the challenges on the card.</p>' },
      { min: 10, title: 'Plenary', html: '<p>Pupils point to the part of their program that is the <b>input</b>, the <b>event</b>, the <b>variable</b>, the <b>condition</b>, the <b>selection</b> and the <b>output</b>. <b>Ask:</b> where else do computers sense, react and decide? (Automatic doors, traffic lights, railway signals, self-driving cars.)</p>' }
    ],
    support: 'Give pairs the finished red-event script on a card to copy and focus on predicting what the train will do next. The Help → Snap commands tab is a reminder of what each snap does.',
    stretch: 'Make the train stop for good at the depot with a white red blue snap on the passing loop. Make the headlights green whenever the sensor sees green. With real smart trains, the same blocks work in the train’s own Scratch editor.',
    assess: ['Explains that the colour sensor is an input and the snaps are what it senses', 'Uses an event block that reacts to a colour', 'Uses a variable to count laps', 'Uses if … else with a condition to choose the way at the split', 'Explains why the decision is made before the train reaches the split'],
    steps: [
      { t: 'Watch it', d: 'Press Run and watch the train go round. What does it do at the white-red snaps by the station? And at the white-green snaps?' },
      { t: 'An event', d: 'Open the Train 1 blocks. Drag “when train sees red (1)” into the space. Under it put “set top LED color to” and pick red.' },
      { t: 'Test it', d: 'Press Run. Does the light on top go red at the station? The sensor sees red, so your script starts: that is an event.' },
      { t: 'Count the laps', d: 'In Variables, press Create variable and call it laps. Put “change laps by 1” under your red event, and “set laps to 0” at the top of “when Run is clicked”.' },
      { t: 'Watch it count', d: 'Press Run. Watch laps on the board (top right). Does it go up by 1 every time the train passes the station?' },
      { t: 'Decide', d: 'From Control, drag the “if … else” block under “change laps by 1”. From Operators, put the compare block in its gap, choose <, and make it laps < 3.' },
      { t: 'Which way?', d: 'From Train 1, put “on next split go straight” in the if part, and “on next split go right” in the else part.' },
      { t: 'Run it', d: 'Press Run. After 3 laps, does the train turn off to the depot? If not, check your condition and where your blocks are.' },
      { t: 'Challenge', d: 'Make the train stop at the depot: put a white red blue snap on the passing loop. Or make the headlights green when the sensor sees green.' }
    ]
  },
  {
    id: 'teach-the-computer', title: 'Teach the computer', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'ai', tool: 'AI Lab (drawings)',
    summary: 'Pupils train a real neural network to recognise drawings, find out it only knows what it was shown, make it better with more varied examples, test it fairly, then code a game with it.',
    objective: 'We are learning to train an AI well, test it fairly with examples it has never seen, spot bias, and use it in a program.',
    success: ['I can teach an AI with labelled examples.', 'I can test an AI fairly, with examples it has never seen.', 'I can explain why more, and more varied, examples make an AI better.', 'I can use the AI’s guess in a program.'],
    curriculum: ['data', 'reason', 'ssr'],
    words: [['AI (artificial intelligence)', 'a computer doing something that seems clever, like recognising pictures'], ['machine learning', 'a computer learning from examples instead of being given rules'],
      ['label', 'the name of a group of examples, like “circle”'], ['training', 'when the computer practises on the examples'], ['confidence', 'how sure the AI is, from 0 to 100%'], ['bias', 'when an AI is unfair because of the examples it was given']],
    need: ['A device per pupil or pair, with CodeJump open (a touch screen or mouse to draw with)', 'The board, to show the class first'],
    plan: [
      { min: 5, title: 'Rules or examples?', html: '<p><b>Ask:</b> how would you explain to an alien what a <i>cat</i> looks like? Try writing rules (“four legs, pointy ears…”). Then point out a dog also has four legs! Show a few cat pictures instead: people learn from <b>examples</b>. Some computers can too. That’s called <b>machine learning</b>.</p>' },
      { min: 10, title: 'Meet the AI', html: '<p>Open the starter on the board. Step <b>1 Teach</b> shows two <b>labels</b>, <i>circle</i> and <i>triangle</i>, with three drawings each. Go to <b>2 Train &amp; test</b> and press <b>Train</b>: the green line shows how often it was right while it practised.</p><p>Draw a circle on the test pad. The bars show how <b>confident</b> it is. Now draw a <b>square</b>. It still says circle or triangle, often very sure! <b>Ask:</b> why? (It only knows the labels it was taught. It can be <i>confidently wrong</i>.)</p>' },
      { min: 25, title: 'Make it better', html: '<p>Pupils follow the Lesson card: add a <b>square</b> label, draw lots of different examples, retrain and test each other’s drawings. Point out <b>Look inside your AI</b>: the average drawing of each label (all the computer has to go on is a 20 × 20 grid) and the <b>mix-ups</b> table.</p><p>Talk about the fair test: the AI is checked on 1 in 4 drawings it was <i>not</i> allowed to practise on. Why is that fairer than testing it on drawings it has already seen?</p><p>Fast finishers move on to <b>3 Code it</b> and the challenge.</p>' },
      { min: 10, title: 'Is AI always right?', html: '<p>On the board, choose <b>Ready-made examples → Kind or unkind messages</b> (it switches to words), train it, and type a few messages: “I love your drawing” is often called unkind, because “your drawing is rubbish” was in the unkind examples. <b>Ask:</b> would you let this AI decide which messages to block? What would make it fairer? This is <b>bias</b>: an AI is only as good, and as fair, as the examples people give it.</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> how did your AI learn? (From labelled examples, by practising.) How did you make it better? (More, and more different, examples; a label for every kind of thing.) How do we know if it is any good? (Test it on examples it has never seen.)</p>' }
    ],
    support: 'Work in pairs: one draws, one checks the label is right before pressing Add. Use the ready-made Shapes examples if drawing is hard.',
    stretch: 'Make a “Draw it!” game in Code it with a random label, wait for the next guess and a score. Or switch to Words and teach it something new, like sunny, rainy and snowy.',
    assess: ['Teaches at least three labels with varied examples', 'Explains that the AI can only recognise what it was taught', 'Uses the check on unseen drawings to judge the AI', 'Uses the AI’s guess or confidence in a program'],
    steps: [
      { t: 'Meet your AI', d: 'This AI knows circles and triangles. Tap 2 Train & test at the top, press Train and watch the green line.' },
      { t: 'Test it', d: 'Draw a circle on the test pad. Look at the bars: how sure is it? Press Clear and try a triangle.' },
      { t: 'Trick it', d: 'Now draw a square. What does the AI say? Why can’t it get it right?' },
      { t: 'Teach squares', d: 'Tap 1 Teach. Press New label and name it square. Draw at least 6 squares — big, small, wonky — pressing Add after each one.' },
      { t: 'More examples', d: 'Click the circle label and add more circles, then more triangles: at least 6 of each, all a bit different.' },
      { t: 'Train it again', d: 'Tap 2 Train & test and press Train. How many did it get right in the check? Open Look inside your AI.' },
      { t: 'Swap and test', d: 'Ask a partner to draw on your test pad. Does your AI guess their drawings right too?' },
      { t: 'Code it', d: 'Tap 3 Code it and press Run, then draw. Try changing the 60 in the if block to 90. What changes?' }
    ]
  },
  {
    id: 'level-designers', title: 'Level designers: find the bugs', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'platformer', tool: 'Platformer Lab (Build, Play and Code)',
    summary: 'Pupils read the events and rules behind a platform game, test it, and fix two bugs: backwards controls and a gem nobody can reach. Then they change the rules, design their own level and get a partner to test it.',
    objective: 'We are learning to design, test and debug a game, using events and rules.',
    success: ['I can explain which event makes the player move or jump.', 'I can find a bug by testing and fix it.', 'I can change the rules of my game and test that they work.', 'I can improve my level after a partner has played it.'],
    curriculum: ['design', 'reason'],
    words: [['event', 'something that happens, like pressing a key, that makes code run'], ['rule', 'what the game allows, and how you win or lose'],
      ['bug', 'a mistake in a program or a level'], ['debug', 'find and fix the mistakes'], ['test', 'play it to check it works as planned']],
    need: ['A device per pupil or pair, with CodeJump open', 'Optional: squared paper to plan a level'],
    plan: [
      { min: 5, title: 'Games have rules', html: '<p>Ask pupils about a board game or playground game they know. <b>Ask:</b> how do you win? How do you lose? What are you allowed to do? These are the game’s <b>rules</b>. A computer game has rules too, and someone had to code them.</p><p>In Key Stage 1 (“Make a level for a friend”) pupils built a path to the Finish. Today they look at the code behind the game as well.</p>' },
      { min: 10, title: 'Read the code', html: '<p>Open the starter on the board and press <b>Code</b> (open Code before Play). Point out the yellow <b>when … is pressed</b> blocks: these are <b>events</b>. Each one waits for a key and then runs the block joined under it. Under <b>when game starts</b> are the <b>rules</b>: win by collecting all gems, 3 lives, a gem is worth 10 points.</p><p><b>Ask:</b> predict what will happen when we press the Right Arrow. Then press <b>Test it — switch to Play!</b> and try it. The controls are backwards: that is our first <b>bug</b>.</p>' },
      { min: 15, title: 'Debug it', html: '<p>Pupils follow the Lesson card. <b>Bug 1</b> is in the code: the Left Arrow event moves right and the Right Arrow event moves left. They fix it by choosing the other key in each event’s dropdown.</p><p><b>Bug 2</b> is in the level: one gem floats too high to reach, and the rule says you must collect every gem, so the game can never be won. (Reaching the Finish only says “Collect all the gems first!”.) Pupils fix it in <b>Build</b> with platforms as steps, or by moving the gem lower, then test again.</p><p>Encourage “change one thing, then test”. <b>Ask:</b> which bug was in the code and which was in the level?</p>' },
      { min: 20, title: 'Design your own', html: '<p>Pupils change the rules in Code (Rules: lives and points; Win: add “win screen says” with their own message) and make the level their own in Build: spikes, an enemy, more gems and platforms. The test is always: can it still be won, and is it fair?</p><p>Fast finishers try another win rule from the Win blocks, such as “win by surviving 30 seconds”.</p>' },
      { min: 10, title: 'Partner test and plenary', html: '<p>Pupils swap and play a partner’s game, looking for bugs: a gem you can’t reach, a jump that is too far, a rule that doesn’t work. They tell the designer one thing they liked and one bug or improvement, and the designer fixes it.</p><p><b>Ask:</b> how did you find each bug? This prepares pupils for Years 5–6 (“Code the rules”), where they code their own rules with variables and if.</p>' }
    ],
    support: 'Work in pairs: one reads the event blocks aloud, the other presses the keys. Fix bug 1 together on the board first. For bug 2, show where the high gem is.',
    stretch: 'Make a second page (the + Page button in Build) with a Door to reach it. Try a different win rule, and use the Enemies blocks to make Enemy A chase the player.',
    assess: ['Explains that a “when … is pressed” block is an event that starts the code under it', 'Finds and fixes the backwards controls (a bug in the code)', 'Finds and fixes the unreachable gem (a bug in the level) by testing', 'Changes a rule and tests that it works', 'Improves their level after a partner’s test'],
    steps: [
      { t: 'Read the code', d: 'Press Code. The yellow “when … is pressed” blocks are events: each one waits for a key, then runs the block under it.' },
      { t: 'Read the rules', d: 'Look under “when game starts”. These are the rules. How do you win? How many lives do you have?' },
      { t: 'Test it', d: 'Press “Test it — switch to Play!”. Use the arrow keys and the Space Bar. What is wrong with the controls?' },
      { t: 'Fix bug 1', d: 'Press Code. Change the key on the “move right” event to Right Arrow, and on the “move left” event to Left Arrow. Test again.' },
      { t: 'Find bug 2', d: 'Play again and try to collect every gem, then reach the Finish. Why can’t you win?' },
      { t: 'Fix bug 2', d: 'Press Build. Tap Platform and build steps up to the high gem (or erase the gem and put it lower). Test that you can win now.' },
      { t: 'Your rules', d: 'In Code, open Rules and change the lives and the points. From Win, add “win screen says” under the rules and type your own message.' },
      { t: 'Make it your own', d: 'Press Build. Add some Spike and Enemy A blocks and more gems. Test after every change: can it still be won?' },
      { t: 'Partner test', d: 'Swap with a partner and play each other’s games. Did they find a bug? Fix it!' }
    ]
  },
  {
    id: 'code-the-rules', title: 'Code the rules', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'platformer', tool: 'Platformer Lab (Code blocks)',
    summary: 'Pupils turn a level that is far too easy into a real challenge by coding their own game rules: variables for the time and the gems, a countdown every second, extra time for every gem, a bonus life with if, and game over when the time runs out.',
    objective: 'We are learning to use variables and selection (if … then) to make the rules of a game.',
    success: ['I can create a variable and give it a starting value.', 'I can change a variable when an event happens.', 'I can use an if block with a condition to make a rule.', 'I can test my rules and explain what each one does.'],
    curriculum: ['ssr', 'design', 'reason'],
    words: [['variable', 'a named value that can change while the game runs, like time or gems'], ['starting value', 'what a variable is set to when the game begins'],
      ['event', 'something that happens, like collecting a gem, that starts code'], ['selection', 'choosing what to do with if … then'], ['condition', 'a question that is true or false, like “time = 0”']],
    need: ['A device per pupil or pair, with CodeJump open', 'Optional: number cards 0–30 for the warm-up'],
    plan: [
      { min: 5, title: 'Beat the clock', html: '<p>Give one pupil a card that says <b>time = 10</b>. Every time you clap, they change it by −1 (new card or mini whiteboard). Another pupil holds <b>gems = 0</b> and adds 1 whenever you hold up a “gem”. <b>Ask:</b> what is the same about these two cards? (A name and a value that changes.) That is a <b>variable</b>. When does the game end? (<b>If</b> time = 0.)</p>' },
      { min: 10, title: 'Too easy!', html: '<p>Open the starter on the board, press <b>Code</b>, then <b>Test it — switch to Play!</b> and walk to the Finish. Its only rule is “win by reaching the goal”: no time limit, nothing to lose. In “Level designers” (Years 3–4) pupils changed ready-made rule blocks; today they <b>code their own rules</b>.</p><p>Write the rules on the board as sentences: <b>Every second, take 1 off time. If time = 0, then game over. When I collect a gem, add 1 to gems and 5 to time. If gems = 3, then give a bonus life.</b> Underline the variables, the events and the conditions.</p>' },
      { min: 25, title: 'Code the rules', html: '<p>Pupils follow the Lesson card: make the variables <b>time</b> and <b>gems</b> (Variables → Create variable...), set their starting values under <b>when game starts</b>, then add the countdown (<b>every 1 seconds</b>), the <b>if time = 0 → game over</b> rule, the gem rule (<b>when I collect a gem</b>) and the <b>if gems = 3 → change lives by 1</b> bonus.</p><p>Common bugs: forgetting the starting value (time starts at 0 and the game ends at once, or never), putting “set time to 30” inside the countdown so it never goes down, and using a number block where the variable should be. Ask “when does this block run?”.</p>' },
      { min: 15, title: 'Test and invent', html: '<p>Pupils test each rule on purpose, like a fair test: stand still (does the game end at 0?), collect 3 gems (one extra life?), collect a 4th (no more lives: why?). Then they invent one rule of their own (see the challenge on the card) and swap with a partner, who has to work out the new rule by playing.</p><p>Note: messages share one box, so the countdown replaces “Bonus life!” after a second; watch the lives at the top left too.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> why does the bonus life only happen once? (gems = 3 is only true on the 3rd gem.) Pupils point to a <b>variable</b>, an <b>event</b>, a <b>condition</b> and the <b>selection</b> in their code.</p>' }
    ],
    support: 'Pairs build one rule at a time and test after each. Give a printed picture of the finished countdown script to copy, and focus on explaining it.',
    stretch: 'Use Text → join so the message says “Time: 28”. Add a rule: if gems = 6 then win the game. Or make every 10 seconds play a sound and take away 1 life.',
    assess: ['Creates variables and sets their starting values when the game starts', 'Changes a variable when an event happens (every second, collecting a gem)', 'Uses if with a condition (time = 0, gems = 3) to make a rule', 'Tests each rule on purpose and explains why the bonus life happens only once'],
    steps: [
      { t: 'Play it', d: 'Press Code, then “Test it — switch to Play!”. Walk to the Finish. Is it a challenge? Let’s code some rules to make it one.' },
      { t: 'Make variables', d: 'Press Code. Open Variables, press “Create variable...” and call it time. Make another one called gems.' },
      { t: 'Starting values', d: 'From Variables, put “set time to” under “when game starts” and snap a number from Math into it: 30. Add “set gems to” 0 too.' },
      { t: 'Countdown', d: 'From Events, drag out “every 2 seconds” and make it 1. Under it put “change time by” -1, then “show message” (Actions) with time in its gap.' },
      { t: 'Out of time', d: 'From Logic, put an “if” under “show message”. Make its condition time = 0 with the = block, and put “game over” (Actions) inside.' },
      { t: 'Count the gems', d: 'From Events, drag out “when I collect a gem”. Under it put “change gems by” 1 and “change time by” 5, so every gem gives extra time.' },
      { t: 'Bonus life', d: 'Add an “if” under them: if gems = 3, then “change lives by” 1 and “show message” Bonus life!' },
      { t: 'Test it', d: 'Press Test it. Does the time count down? Do you get an extra life on your 3rd gem? What happens if you stand still?' },
      { t: 'Challenge', d: 'Invent a rule of your own, like: if gems = 6 then win the game. Can a partner work out your rule by playing?' }
    ]
  },
  {
    id: 'stage-animate', title: 'Animate a dance party', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'stage', tool: 'Stage Lab (Scratch-style blocks)',
    summary: 'Pupils bring a dance party to life: each sprite starts its own script from a different event, a repeat loop makes the Cat dance, and a bug makes the Robot float away.',
    objective: 'We are learning to use events, sequence and repetition to animate several sprites, and to debug a program.',
    success: ['I can start a script with different events: the green flag, a click or a key.', 'I can use a repeat loop so I don’t have to copy blocks.', 'I can find and fix a bug in a sprite’s code.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['event', 'something that happens, like a click or a key press, that starts a script'], ['sequence', 'the order the blocks run in, top to bottom'], ['repeat loop', 'runs the blocks inside it a number of times'], ['sprite', 'a character on the stage that has its own code'], ['costume', 'one of the looks a sprite can change between'], ['bug', 'a mistake in a program; debugging means finding and fixing it']],
    need: ['A device per pupil or pair, with CodeJump open', 'Paper and pencils for planning a dance move', 'Optional: music to dance to in the warm-up'],
    plan: [
      { min: 5, title: 'Warm up: Simon says, with events', html: '<p>Play a quick game: “<b>When I clap</b>, jump. <b>When I wave</b>, spin. <b>When I say go</b>, march 4 steps.” Each instruction only happens when its signal happens.</p><p>Introduce the word <b>event</b>: something that happens and starts a set of instructions. <b>Ask:</b> what events start things in real life? (a doorbell, a school bell, an alarm clock)</p>' },
      { min: 10, title: 'Show me', html: '<p>On the board, open the starter and press <b>Run</b> (above the stage). The Cat says “Let’s dance!” — and then the party stops. Click each sprite in the sprite list and read its blocks together: the Cat starts <b>when green flag clicked</b>, the Bird has no code yet, and the Robot starts <b>when space key pressed</b>.</p><p>Model one repeat: drag <b>repeat 10</b> under the Cat’s say block and put <b>next costume</b> and <b>wait 1 seconds</b> inside. <b>Ask:</b> what will happen? Then press Run. Point out that the blocks run in <b>sequence</b>: first the say, then the loop.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the <b>Lesson</b> card: make the Cat dance with a repeat loop, make the Bird fly in when it is clicked, then debug the Robot. The Robot’s jump goes up 40 but only comes down 4, so every press of the space bar leaves it higher. Let pupils discover the bug by testing before they look for it.</p><p>Ask pairs to <b>predict</b> before they press Run: “What will the Bird do when you click it?” Common mistakes: putting the wait <b>outside</b> the repeat (the costume flicks too fast to see), and forgetting to press Run before clicking a sprite.</p><p>Early finishers plan a dance move on paper first (their algorithm), then build it, or try the broadcast challenge.</p>' },
      { min: 15, title: 'Party time', html: '<p>Pupils swap seats and run a partner’s party. They tell their partner which event starts each sprite and spot any loops. Then two or three parties go on the board.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> how many events did your party use? Why is a repeat loop better than copying the same blocks 10 times? How did you find the Robot’s bug?</p><p>This lesson gets pupils ready for <b>Catch the stars</b> (Years 5–6), where they use the same Stage blocks and key events, and add <b>if … then</b> and a score.</p>' }
    ],
    support: 'Pair pupils. Show the finished Cat script on the board to copy, and let them do the Bird and Robot together. Give a printed list of the three events with a picture of each block.',
    stretch: 'Plan and build a longer dance for the Robot with a repeat inside a repeat. Then use broadcast and when I receive so everyone dances together when the Cat finishes.',
    assess: ['Uses three different events to start scripts on different sprites', 'Puts blocks inside a repeat loop to repeat a move', 'Explains the Robot’s bug and fixes it by testing'],
    steps: [
      { t: 'Start the party', d: 'Press Run above the stage. The Cat says Let’s dance! — and then nothing else happens. Let’s fix that!' },
      { t: 'Make the Cat dance', d: 'Click the Cat in the sprite list. From Control, drag “repeat 10” under the say block. Put “next costume” (Looks) and “wait 1 seconds” (Control) inside it.' },
      { t: 'Test it', d: 'Press Run. Does the Cat change colour 10 times? Change the wait to 0.5 to make it dance faster.' },
      { t: 'Click the Bird', d: 'Click the Bird. From Events, drag “when this sprite clicked”. Add “glide 1 secs to x 0 y 100” (Motion) and “say Hello! for 2 secs” (Looks) — type Tweet!' },
      { t: 'Test the Bird', d: 'Press Run, then click the Bird on the stage. Does it fly to the middle and say Tweet!?' },
      { t: 'Debug the Robot', d: 'Press Run and press the space bar a few times. The Robot floats away! Click the Robot, read its blocks and change the wrong number so it lands where it started.' },
      { t: 'Your own move', d: 'Plan a dance move for the Robot on paper first. Then build it inside a repeat loop under “when space key pressed”.' },
      { t: 'Challenge', d: 'Put “broadcast party” (Events) at the end of the Cat’s script. Give each sprite “when I receive party” and make everyone dance!' }
    ]
  },
  {
    id: 'turtle-procedures', title: 'Teach the turtle new words', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'turtle', tool: 'Turtle Lab (typed Logo)',
    summary: 'Pupils break a picture into parts and teach the turtle a new command for each part. A parameter lets one command draw a house of any size, and a street command uses the house command three times.',
    objective: 'We are learning to break a problem into parts and write our own procedures with parameters.',
    success: ['I can break a picture into smaller parts.', 'I can write a procedure with to … end and use it.', 'I can use a parameter so one procedure draws different sizes.', 'I can write a procedure that uses another procedure.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['decompose', 'break a big problem into smaller parts'], ['procedure', 'a new command you teach the computer, made from other commands'],
      ['parameter', 'a value you give a procedure each time you use it, like :size'], ['variable', 'a named value that can change; :size is used like a variable'], ['call', 'use a procedure by typing its name']],
    need: ['A device per pupil or pair', 'Optional: squared paper to sketch a street before coding it'],
    plan: [
      { min: 5, title: 'Break it down', html: '<p>Draw a simple street on the board: three houses, each a square with a triangle roof. <b>Ask:</b> what parts is this picture made of? (houses; each house is walls and a roof; walls are a square, a roof is a triangle.) Introduce <b>decompose</b>: breaking a big problem into parts we can solve one at a time.</p><p>Remind pupils of the Years 3–4 turtle lesson (Shapes with repeat): <code>repeat 4 [fd 100 rt 90]</code> draws a square, and sides × turn = 360.</p>' },
      { min: 10, title: 'Show me: a new word', html: '<p>Open the starter on the board and press <b>Run</b>: a house, drawn with two repeats. <b>Ask:</b> which lines draw the walls and which draw the roof? How many numbers would you change to draw a bigger house? (Four of them.)</p><p>Put <code>to house :size</code> above the lines and <code>end</code> below them, and change every 100 to <code>:size</code>. Press Run: nothing is drawn! Teaching the turtle a word is not the same as using it. Type <code>house 100</code> underneath and Run again. Then <code>house 50</code>. <b>:size</b> is a <b>parameter</b>: a different value each time we <b>call</b> the procedure.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: make <b>house</b>, try different sizes, then write <b>street</b>, a procedure that calls house three times, and finally <b>poly</b>, one procedure with two parameters that draws any regular shape.</p><p>Common bugs: a missing <code>end</code> (the status line says so), a space inside <code>:size</code>, or typing <code>size</code> without the colon. Ask “what does the status line say?” before helping. Point out that house ends where it started, facing up: that is why the street lines up.</p>' },
      { min: 15, title: 'Design your own', html: '<p>Pupils sketch a picture of their own on paper (a flower, a robot, a town), decompose it into parts and write a procedure for each part, using <b>poly</b> where they can. Fast finishers add parameters for colour (<code>setpencolor :c</code> takes a number 0–15) or a <b>street :n :size</b> with two parameters.</p>' },
      { min: 5, title: 'Plenary', html: '<p>Pupils show one procedure to a partner and name its parameter. <b>Ask:</b> why are procedures useful? (shorter code, reuse, easier to fix: change house once and every house changes.) Where else do we break a big job into smaller jobs?</p>' }
    ],
    support: 'Give pairs the finished house procedure on a card to type in; they focus on calling it with different sizes and then on the street. Use Examples → Procedure for a ready-made one to read.',
    stretch: 'Give street two parameters: to street :n :size, so it draws any number of houses of any size. Add a door procedure and call it from house. Make a flower: repeat 12 [poly 6 40 rt 30].',
    assess: ['Decomposes a picture into parts', 'Writes a procedure with to … end and calls it', 'Uses a parameter to change what the procedure draws', 'Writes a procedure that calls another procedure', 'Explains why procedures make programs shorter and easier to change'],
    steps: [
      { t: 'Run the house', d: 'Press Run. Which lines draw the walls and which draw the roof? How many numbers would you change to make it bigger?' },
      { t: 'Make a procedure', d: 'Type to house :size on a new line above the walls and end on a new line under the last line. Change every 100 to :size.' },
      { t: 'Nothing happened?', d: 'Press Run. Nothing is drawn! You taught the turtle a new word, but you didn’t use it. Under end, type house 100 and press Run.' },
      { t: 'Change the size', d: 'Change it to house 50, then house 150. :size is a parameter: you give it a new value each time you use house.' },
      { t: 'Build a street', d: 'Under the house procedure, type: to street, then repeat 3 [house 60 pu rt 90 fd 90 lt 90 pd], then end.' },
      { t: 'Use the street', d: 'Delete your house line. At the bottom type: pu setxy -250 0 pd street. Press Run. Three houses from one word!' },
      { t: 'Any shape', d: 'Make poly with two parameters: to poly :sides :size, then repeat :sides [fd :size rt 360 / :sides], then end. Try poly 6 50.' },
      { t: 'Use poly', d: 'In house, change the walls to poly 4 :size and the roof triangle to poly 3 :size. Press Run. Does the street look the same?' },
      { t: 'Challenge', d: 'Give street two parameters: to street :n :size. Or draw your own picture made of procedures, like a flower or a robot.' }
    ]
  },
  {
    id: 'critter-builders', title: 'Critter builders', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'critter', tool: 'Critter Lab (3D)',
    summary: 'Pupils finish a 3D creature that only has front legs, test it in a race, and improve it one change at a time.',
    objective: 'We are learning to design and build something from parts, test it, and improve it by trying ideas.',
    success: ['I can add parts to my Critter.', 'I can test my Critter and write down how far it went.', 'I can make one change, test again and say if it helped.'],
    curriculum: ['design', 'reason'],
    words: [['design', 'a plan or a thing we make to do a job'], ['test', 'try it out to see if it works'], ['improve', 'make it better'], ['debug', 'find out what is going wrong and fix it'], ['one change at a time', 'change just one thing, then test, so you know what made the difference']],
    need: ['A device per pupil or pair (Critter Lab needs the internet the first time)', 'Paper for a results list: what I changed · how far it went'],
    plan: [
      { min: 5, title: 'How do animals move?', html: '<p>Ask two pupils to be a four-legged animal walking across the room. Then ask one to walk using only their arms at the front, dragging their legs behind. <b>Ask:</b> which way is faster? Why?</p><p>Introduce <b>design</b>, <b>test</b> and <b>improve</b>: engineers make something, try it out, then make it better.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter on the board. Meet <b>Scoot</b>: a blue body with one pair of Walking legs at the front. Drag the background to turn it round. <b>Ask:</b> what do you think will happen in a race?</p><p>Press <b>Test it!</b> and watch the Sprint. The back of its body drags on the ground and it gets <b>0.0 m</b>. Write “Starter · 0.0 m” on the board as the first line of a results list. <b>Ask:</b> what is the bug in this design?</p>' },
      { min: 30, title: 'Build, test, improve', html: '<p>Pupils follow the <b>Lesson</b> card. They press <b>Build</b>, click the body, then tap <b>Walking leg</b> under Limbs: a second pair sticks on at the back. Testing again gives about <b>1 m</b>. Then they press <b>Undo</b> to take those legs off, click the body and tap <b>Long leg</b> instead: about <b>4.5 m</b>.</p><p>Every test is one line on their results list. Then they try their own ideas, <b>one change at a time</b> (a tail, a third pair of legs, a longer or shorter body…). Not every change helps: on the Long-leg Critter a third pair of Walking legs or a longer body makes it slower, and a shorter body (the body’s <b>Length</b> slider on its <b>Shape</b> tab) helps a little. If a change makes it worse, press <b>Undo</b>.</p><p>Circulate and ask: “What did you change? How do you know that was what made the difference?”</p>' },
      { min: 10, title: 'Show and tell', html: '<p>Two or three pupils show their Critter on the board and run the Sprint. <b>Ask:</b> what was your best change? Did any change make it worse? Read out a results list together.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> why do we change only one thing at a time? (So we know which change made the difference.)</p><p>This prepares for <b>Critter engineers</b> in Years 5–6, where pupils run fair tests on a four-legged walker like the one they made today, keep a results table and find out why its feet need different timing.</p>' }
    ],
    support: 'Work in pairs: one clicks, one writes the results list. If a Critter goes wrong, press Undo, or re-open the starter.',
    stretch: 'In Test it!, choose Hurdles and try to get over the humps. Or use the Shape tab sliders (Length, Height) on the legs to make them longer or thicker, testing after each change.',
    assess: ['Adds limbs to the Critter in the right place', 'Records a result after each test', 'Changes one thing at a time and says whether it helped'],
    steps: [
      { t: 'Test it', d: 'Press Test it! and watch the Sprint. How far does Scoot go? Write it down.' },
      { t: 'Spot the bug', d: 'Press Build. Drag the background to look from the side. What is dragging on the ground?' },
      { t: 'Add back legs', d: 'Click the blue body. Then tap Walking leg under Limbs. A pair of legs sticks on at the back.' },
      { t: 'Test again', d: 'Press Test it! How far now? Write it down. Was adding legs a good change?' },
      { t: 'Swap the back legs', d: 'Press Build, then Undo (the curved arrow at the top) to take the back legs off. Click the body and tap Long leg instead.' },
      { t: 'Test the swap', d: 'Press Test it! Which back legs went further: Walking legs or Long legs? Keep the best.' },
      { t: 'One change at a time', d: 'Try ONE idea, like a tail or a different body Length (Shape tab). Test it. Better? Keep it. Worse? Press Undo.' },
      { t: 'Make it yours', d: 'Click a part, open its Shape tab and pick a colour. Type a new name in the box at the top.' },
      { t: 'Challenge', d: 'In Test it!, choose Hurdles. Can your Critter get over the humps?' }
    ]
  },
  {
    id: 'robot-storyteller', title: 'Robot storyteller', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'robot', tool: 'Robot Lab (blocks)',
    summary: 'Pupils program a robot to act out a short story: they fix a bug in the order of the scenes, use a repeat loop to make it nod, and add an event so tapping the robot starts a second scene.',
    objective: 'We are learning to put instructions in the right order, use repeat, and start a script with an event.',
    success: ['I can put blocks in the right order to tell a story.', 'I can find and fix a bug in the order.', 'I can use a repeat block instead of copying blocks.', 'I can use an event to start a second scene.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['algorithm', 'a set of steps in the right order'], ['sequence', 'the order the steps go in'], ['bug', 'a mistake in a program'], ['debug', 'find and fix the mistakes'],
      ['repetition', 'doing the same steps again; a repeat block (a loop) does this for you'], ['event', 'something that happens, like a tap or a key press, that starts a script']],
    need: ['A device per pupil or pair, with CodeJump open', 'The board, to show the class first', 'Optional: a pair of socks and shoes for the warm-up'],
    plan: [
      { min: 5, title: 'Warm up: the wrong order', html: '<p>Act out getting dressed in the wrong order: shoes on, <b>then</b> socks. <b>Ask:</b> what went wrong? The steps were all right, but the <b>sequence</b> was wrong. A computer does exactly what you tell it, in exactly that order.</p><p>Introduce <b>algorithm</b>, <b>sequence</b> and <b>bug</b>.</p>' },
      { min: 10, title: 'Meet Sparky', html: '<p>Open the starter on the board. Read the script out loud like a story, <b>without pressing Run</b>: “Sparky’s eyes are off. It makes a sleepy face. It says Zzz… It says Good morning! Then it smiles and lights its eyes.” <b>Ask:</b> what do you think we will see?</p><p>Press <b>Run</b>. Sparky says “Good morning!” while it is still asleep, and only wakes up afterwards. That is a <b>bug</b> in the order. Pupils fix it on their own screens in a moment.</p>' },
      { min: 10, title: 'Fix it, then add to it', html: '<p>Pupils follow the Lesson card: drag <b>make a happy face</b> up under <b>say Zzz… until done</b> (the light block underneath comes with it) and press Run to <b>test</b>. Then they add <b>look</b> blocks so Sparky looks around the room.</p><p>Remind them: change one thing, then press Run to test it.</p>' },
      { min: 15, title: 'Repetition: nod three times', html: '<p>Show a nod as two moves: head up (<b>move head nod to 8</b>), head down (<b>move head nod to 2</b>). <b>Ask:</b> how many blocks for three nods? (Six.) For a hundred nods? Introduce <b>repetition</b>: put the two blocks inside <b>repeat 3 times</b> and the computer does them again for you.</p><p>Pupils add the repeat, then a <b>look ahead</b> block after it. Ask them to count the nods to check the number on the repeat block.</p>' },
      { min: 15, title: 'Events: scene two', html: '<p>So far one script runs when Run is clicked. Introduce <b>event</b>: something that happens and starts a script. Pupils drag <b>when the robot is tapped</b> from Events and build scene two under it (a surprised face and “Who is there?”). It only runs when someone taps the robot, while the program is running.</p><p>Fast finishers try the challenge: a third scene that starts when the space key is pressed.</p>' },
      { min: 5, title: 'Plenary', html: '<p>Two pairs show their story on the board. <b>Ask:</b> which part is the sequence? Where is the repetition? Which event starts scene two? What bug did you find, and how did you know?</p><p>Next time (Years 5–6, <b>Robot quiz</b>) Sparky will ask questions, check the answers and keep score, using the same robot and blocks.</p>' }
    ],
    support: 'Pair pupils. Give a printed storyboard (wake up, smile, say good morning, look around, nod) so they can check the order of their blocks against it. Let them nod only twice to start with.',
    stretch: 'Add the space-key scene from the card. Use “set voice to” to give Sparky a different voice in each scene, change its body colour under the robot, or make it nod faster with “set all motors speed to 10”.',
    assess: ['Fixes the order bug and explains why the story was wrong', 'Uses repeat for the nods instead of copying blocks, and sets the right number', 'Starts a second script with an event (tapping the robot)', 'Tests after each change and can say what they changed'],
    steps: [
      { t: 'Watch the story', d: 'Press Run. Sparky should wake up, smile and then say good morning. Watch its face. What goes wrong?' },
      { t: 'Fix the order', d: 'Drag “make a happy face” up so it sits under “say Zzz… until done”. The block under it comes too. Press Run: does Sparky smile before it speaks now?' },
      { t: 'Look around', d: 'From Moves, drag “look ahead” to the bottom of your script and choose left. Add another one and choose right.' },
      { t: 'Nod three times', d: 'From Control, drag “repeat 3 times” to the bottom. From Moves, put two “move head turn to” blocks inside it. Choose head nod in both, and make one 8 and the other 2.' },
      { t: 'Test it', d: 'Add one more look block after the repeat and choose ahead. Press Run and count the nods. Are there 3?' },
      { t: 'Scene two', d: 'From Events, drag “when the robot is tapped” into an empty space. Under it put “make a happy face” (choose surprised) and “say Hello! until done” from Speech. Change Hello! to Who is there?' },
      { t: 'Tap it', d: 'Press Run. When the story has finished, tap the robot. Does scene two start?' },
      { t: 'Challenge', d: 'Add a scene for “when space key pressed”: say Goodnight!, make a sleepy face, then “turn eyes light off” (choose all).' }
    ]
  },
  {
    id: 'robot-quiz', title: 'Robot quiz', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'robot', tool: 'Robot Lab (blocks)',
    summary: 'Pupils turn the robot into a quiz master: it asks a question, uses if … else to check the answer and react, keeps score in a variable and says the final score. Fast finishers make a random maths quiz.',
    objective: 'We are learning to use input, a variable and selection (if … else) to make a program that reacts to what the user does.',
    success: ['I can use “ask and wait” and “answer” to get input from the user.', 'I can use if … else with a condition to choose what the robot does.', 'I can use a variable to keep score.', 'I can test my program with right and wrong answers.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['input', 'information that goes into a program, like the answer you type'], ['output', 'what the program does, like speaking or making a face'],
      ['selection', 'choosing what to do with if … else'], ['condition', 'a question that is true or false, like “answer = 7”'],
      ['variable', 'a named value that can change, like the score'], ['test data', 'the answers you try, both right and wrong, to check every part of the program works']],
    need: ['A device per pupil or pair, with CodeJump open', 'The board, to show the class first', 'Optional: mini whiteboards for the warm-up quiz'],
    plan: [
      { min: 5, title: 'Warm up: be the quiz master', html: '<p>Ask the class a quick question (“What is 3 + 4?”). Say out loud what you do: “<b>If</b> the answer is 7, I smile and say Correct, and add a point. <b>Else</b>, I look sad and tell you the answer.” Write it on the board as a rule.</p><p>Recap <b>Robot storyteller</b>: there, Sparky did the same thing every time (sequence, repeat, events). Today the robot <b>decides</b> what to do based on what the user types.</p>' },
      { min: 10, title: 'Input and output', html: '<p>Open the starter on the board and press <b>Run</b>. Quizbot asks “What is 3 + 4?”. Type something silly. It just says back whatever you typed. <b>Ask:</b> which block is the <b>input</b>? (ask and wait, and the answer it stores) What are the <b>outputs</b>? (speech, the face)</p><p><b>Ask:</b> what does it need so it can tell right from wrong? (A rule: if … else.)</p>' },
      { min: 15, title: 'Selection: if … else', html: '<p>Pupils follow the Lesson card: make a <b>score</b> variable and set it to 0 at the start, then swap “say answer” for an <b>if … else</b> with the <b>condition</b> “answer = 7”. Happy face, “Correct!” and change score by 1 go in the if part; a sad face and the right answer go in the else part.</p><p>Insist on testing <b>both ways</b>: one right answer and one wrong one. This is <b>test data</b>: one test does not check both branches.</p>' },
      { min: 15, title: 'Variables: keep score', html: '<p>Pupils duplicate the ask and if … else blocks to make a second question, then say the score at the end with <b>create text with</b> “Your score is ” and <b>score</b>.</p><p>Common bugs to look for: “change score by 1” after the if … else (so every answer scores) or in the else part; the answer typed in a different way (“seven” is not 7). <b>Ask:</b> what is the highest score possible? Test it.</p>' },
      { min: 10, title: 'Swap and test', html: '<p>Pairs swap devices and play each other’s quiz, trying right and wrong answers. Did the score come out right? Fast finishers try the challenge: <b>pick random 1 to 10</b> to make a maths quiz that is different every time, inside <b>repeat 3 times</b>.</p>' },
      { min: 5, title: 'Plenary', html: '<p>Pupils point to the <b>input</b>, the <b>condition</b>, the <b>selection</b>, the <b>variable</b> and the <b>outputs</b> in their program. <b>Ask:</b> where else does a computer check an answer and choose what to do? (A password box, a cash machine PIN, a times-tables app.)</p>' }
    ],
    support: 'Give pairs the finished if … else for question 1 on a card to copy. Ask them to test it with 7, then with 5, before adding anything else. Leave out the final score and just use one question.',
    stretch: 'Make a random maths quiz: set two variables to “pick random 1 to 10”, ask the sum using “create text with”, and check “answer = a + b” (Operators). Put it inside “repeat 3 times”. Or add a third face: if the score is 0 at the end, make a sleepy face.',
    assess: ['Uses ask and wait and the answer block to take input', 'Writes a condition (answer = …) and puts the right blocks in the if and else parts', 'Creates a score variable, sets it to 0 and changes it only for a right answer', 'Tests with right and wrong answers and fixes what goes wrong'],
    steps: [
      { t: 'Try it', d: 'Press Run. Quizbot asks a question: type an answer in the box and press Enter (or OK). What does it say back?' },
      { t: 'Make a score', d: 'Open Variables, press Create variable... and call it score. Drag “set score to” under “when Run is clicked”, and put the 0 number block from Operators in its gap.' },
      { t: 'If … else', d: 'Drag “say answer until done” to the bin. From Control, drag the “if … else” block to the bottom of your script.' },
      { t: 'The condition', d: 'From Operators, put the “=” block in the gap next to if. Drag “answer” from Sensing into its first space and type 7 in the second.' },
      { t: 'React', d: 'In the if part put “make a happy face”, “say Hello! until done” (change it to Correct!) and “change score by 1”. In the else part put a sad face and say Not quite. It is 7.' },
      { t: 'Test both ways', d: 'Press Run and answer 7. Then press Run again and give a wrong answer. Does Quizbot react the right way both times?' },
      { t: 'Question 2', d: 'Right-click the ask block and choose Duplicate, then do the same for the if … else block. Join them on at the bottom and change the question and the answer.' },
      { t: 'Say the score', d: 'At the very end, add “say Hello! until done”. From Operators, drop “create text with” on Hello!. Put a text block in its first gap and type Your score is, and the score block in the second.' },
      { t: 'Challenge', d: 'Make a maths quiz with “pick random 1 to 10” from Operators, so the questions are different every time. Put it inside “repeat 3 times”.' }
    ]
  },
  {
    id: 'ai-happy-sad', title: 'Happy or sad?', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'ai', tool: 'AI Lab (drawings)',
    summary: 'Pupils meet machine learning: they train an AI to sort happy and sad faces, find out it only knows the examples it was given (even a wrong one), then make it better with more, and more varied, examples.',
    objective: 'We are learning how a computer can learn to sort things from examples.',
    success: ['I can sort examples into groups with a label.', 'I can train an AI and test it with new drawings.', 'I can find and fix a wrong example.', 'I can explain why more, and more different, examples make an AI better.'],
    curriculum: ['data', 'reason'],
    words: [['AI (artificial intelligence)', 'a computer doing something that seems clever, like sorting pictures'], ['machine learning', 'a computer learning from examples instead of being given rules'],
      ['example', 'one thing we show the computer, like one drawing of a happy face'], ['label', 'the name of a group of examples, like “happy”'],
      ['train', 'let the computer practise on the examples'], ['test', 'try it with something new to see if it is right']],
    need: ['A device per pupil or pair, with CodeJump open (a touch screen or mouse to draw with)', 'The board, to show the class first',
      'For the warm up: about 12 face cards (quick happy and sad faces on paper or sticky notes), with one smiley face hidden in the sad pile'],
    plan: [
      { min: 10, title: 'Warm up: sort the faces', html: '<p>Hold up face cards one at a time. The class says “happy” or “sad” and you put each card in a pile. The name of each pile is its <b>label</b>; each card is an <b>example</b>. <b>Ask:</b> how did you know? (We looked at the mouth.)</p><p>Now choose a pupil to be “the computer”. They have never seen a face before and may only learn by looking at your two piles. Hand them the sad pile, with one smiley face hidden in it, then show them a new happy face. <b>Ask:</b> could they get it wrong? Why? Introduce <b>machine learning</b>: some computers learn from examples like this, instead of being given rules.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter on the board. Step <b>1 Teach</b> shows two labels, <i>happy</i> and <i>sad</i>, with only a few drawings each. Tap <b>2 Train &amp; test</b> and press <b>Train</b>: the green line shows how often it was right while it practised.</p><p>Draw a happy face on the test pad. It usually says <b>sad</b>! The bars show how sure it is. <b>Ask:</b> why do you think it got it wrong? Don’t give the answer yet: that is the pupils’ first job.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the <b>Lesson</b> card. First they test, then hunt through the examples in <b>1 Teach</b>: one of the “sad” drawings is really a smiley face. Tapping a drawing removes it. After training again it is a little better, but still makes mistakes, because three drawings of each is not much to learn from.</p><p>Next they draw at least 5 more of each, all a bit different (big, small, round, wonky), train again and test. Most AIs now get nearly every face right. Circulate and ask: “What will it say if you draw this?” <b>before</b> they draw it.</p>' },
      { min: 5, title: 'Swap and test', html: '<p>Pairs swap devices and draw five faces each on the other’s test pad. They count how many their partner’s AI got right. Collect a few scores on the board.</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> how did our AI learn? (From labelled examples, by practising.) Why did it get happy faces wrong at the start? (A smiley face was in the sad pile, and there were only a few examples.) What made it better? (Taking out the wrong one; more examples; more different examples.)</p><p>Sum up: <b>a computer only learns from the examples it is given</b>, so people have to choose them carefully. In Years 5–6 (<i>Teach the computer</i>) pupils build on this: they test an AI fairly with drawings it has never seen, look for bias and use the AI’s guesses in a program.</p>' }
    ],
    support: 'Work in pairs: one draws, the other checks the right label is chosen before pressing Add. Show the two mouths (a smile curving up, a frown curving down) on the board.',
    stretch: 'Try to trick your AI: draw a tiny face, a face with no eyes, or a very wide smile. When it gets one wrong, teach it a few more like that and test again.',
    assess: ['Explains that a label names a group of examples', 'Finds the wrong example and says why it confused the AI', 'Adds varied examples and trains again', 'Explains that an AI only learns from the examples it is given'],
    steps: [
      { t: 'Meet your AI', d: 'This AI is learning happy and sad faces. Tap 2 Train & test at the top and press Train.' },
      { t: 'Test it', d: 'Draw a happy face on the test pad. What does the AI say? Press Clear and try a few more faces.' },
      { t: 'Find the mistake', d: 'Tap 1 Teach. Look closely at the sad drawings (tap − on this card to fold it away). One of them doesn’t belong. Can you spot it?' },
      { t: 'Fix it', d: 'Tap the wrong drawing to remove it. Then tap 2 Train & test, press Train again and test it. Is it better?' },
      { t: 'More happy faces', d: 'Tap 1 Teach and click the happy label. Draw 5 more happy faces, all a bit different, pressing Add after each one.' },
      { t: 'More sad faces', d: 'Click the sad label and draw 5 more sad faces: big, small, round and wonky.' },
      { t: 'Train and test', d: 'Tap 2 Train & test and press Train. Draw some faces on the test pad. Does it get more right now?' },
      { t: 'Swap and test', d: 'Ask a partner to draw 5 faces on your test pad. How many does your AI get right?' },
      { t: 'Challenge', d: 'Try to trick your AI with a tiny face or one with no eyes. If it gets it wrong, teach it a few more like that.' }
    ]
  },
  {
    id: 'train-snaps', title: 'Snap code: program a train with colours', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'train', tool: 'Train Lab (snaps, no blocks)',
    summary: 'Pupils program a smart train without any blocks: coloured snaps on the track are the code. They predict and fix a buggy stop at the station, then add snaps in the right order and the right place so the train does every job on its route: stop, slow down by the school, turn back and end at the station.',
    objective: 'We are learning to write and debug an algorithm as a sequence of colour commands, where the order and the direction matter.',
    success: ['I can explain the snap rules: white first, no gaps, all on one piece.', 'I can predict what the train will do before I press Run.', 'I can find and fix a bug in a snap command.', 'I can put commands in the right order and place so the train does every job on its route.'],
    curriculum: ['design', 'reason', 'ssr'],
    words: [['algorithm', 'a set of steps in the right order to do a job'], ['command', 'one instruction, like white red (stop for 2 seconds)'],
      ['sequence', 'the order the commands happen in'], ['snap', 'a coloured square on the track that the train reads as it drives over it'],
      ['bug', 'a mistake that stops a program doing what we want'], ['debug', 'find and fix the mistakes'], ['predict', 'say what you think will happen before you test it']],
    need: ['A device per pupil or pair, with CodeJump open', 'The board, to show the class first', 'Optional: white, red, green and blue paper squares for the warm-up', 'Optional: real smart trains, track and snaps, to build a printed challenge card'],
    plan: [
      { min: 5, title: 'Colour code', html: '<p>Pupils stand up as “trains” and walk slowly on the spot. Hold up paper squares in a row: <b>white red</b> = stop and count to 2, <b>white green</b> = walk slowly, <b>white blue</b> = turn round. Then hold up <b>red white</b>. <b>Ask:</b> did anyone stop? Why not? (The command has to start with white: white means “listen, a command is coming”.)</p>' },
      { min: 10, title: 'The snap rules', html: '<p>Open the starter on the board. The train drives itself: there are no blocks today. The coloured <b>snaps</b> on the track are the program, and the train reads them with a colour sensor underneath as it drives over them.</p><p>Show the three rules (Help → Snap commands has them too): a command <b>starts with white</b> in the direction the train is going, has <b>no gaps</b>, and is all on <b>one piece</b> of track. Point to the jobs list at the top of the board: this is the <b>algorithm</b> for the route, in order.</p><p><b>Predict:</b> look at the snaps by the station (red, then white). Will the train stop there? Take a vote, then press <b>Run</b>.</p>' },
      { min: 10, title: 'Debug the station', html: '<p>The train goes straight past the station and job 2 never ticks. Introduce <b>bug</b> and <b>debug</b>. Pupils follow the Lesson card to swap the two snaps: pick the white snap and tap the first slot, then the red snap and tap the second slot. Run again: the train stops for 2 seconds and the job ticks.</p><p>Tip: tapping a slot with the same colour takes the snap off; tapping it with a different colour swaps it.</p>' },
      { min: 20, title: 'Finish the route', html: '<p>Pupils add the rest of the route one job at a time, pressing <b>Run</b> after each one: <b>white green</b> on the school’s piece (slow down), <b>white blue</b> on the fallen trees’ curve (turn back), then <b>white red blue</b> on the station’s piece to end the route.</p><p>The last job is the tricky one: the train comes back the <b>other way</b>, so it reads the station’s snaps from right to left. White has to go in the slot it reaches first (the right-hand end), then red, then blue. <b>Ask:</b> what happened when you put white red blue from the left? (The train read it on the way <i>out</i> and ended its route straight after the station, before the school.) Fast finishers open <b>Challenges</b> and try the ready-made <b>Airport run</b>.</p>' },
      { min: 10, title: 'Challenge card and plenary', html: '<p>Show <b>Challenges → Print the challenge card</b>: a card with the track, the places and the jobs, to build with real track and snaps. <b>Ask:</b> what is the algorithm for our route? Read the snaps in order as a sequence: “white red, white green, white blue, white red blue”. What would happen if we swapped two of them round?</p><p>Next steps (Years 5–6, <i>Smart trains: sense, react, decide</i>): the same colour sensor becomes an input for blocks, so the train can count laps and decide which way to go.</p>' },
      { min: 5, title: 'Reflect', html: '<p>Pupils tell a partner one bug they found and how they fixed it, using the words <b>predict</b>, <b>test</b> and <b>debug</b>.</p>' }
    ],
    support: 'Pair pupils and give them the snap rules on a card. Start with the ready-made First stop challenge (Challenges button), which has just one stop to make. The Hint in the Challenges panel helps too.',
    stretch: 'Open Challenges → Airport run and solve it with snaps. Or make the train speed up again after the school (white green green green), or stop for 5 seconds at the station (white red red). With real smart trains, print the challenge card and build it with the real track.',
    assess: ['States the snap rules (white first, no gaps, one piece)', 'Predicts the buggy station snaps will not stop the train, and explains why', 'Fixes the bug by changing the order of the snaps', 'Places commands so every job ticks off', 'Explains that the train reads snaps in the direction it is going'],
    steps: [
      { t: 'Predict', d: 'Look at the snaps by the train station: red, then white. Will the train stop there? Tell your partner, then press Run.' },
      { t: 'Find the bug', d: 'Did job 2 tick? A command must start with white. Press Stop, then Reset.' },
      { t: 'Fix it', d: 'Press + to zoom in. Under Snaps, pick the white snap and tap the first slot by the station, then the red snap and the second slot. Press Run.' },
      { t: 'Slow down', d: 'Put white then green on the school’s piece, starting at its left end. Run it: does the train slow down past the school?' },
      { t: 'Turn back', d: 'Put white then blue on the curve by the fallen trees. Run it: does the train turn back there?' },
      { t: 'End the route', d: 'The train now comes back the other way. On the station’s piece, put white in the last slot on the right, then red, then blue to its left.' },
      { t: 'Run the route', d: 'Press Run. Do all five jobs tick off? If not, find which job didn’t tick and check its snaps.' },
      { t: 'Challenge', d: 'Press Challenges and open Airport run. Can you do every job with snaps? Print the challenge card to build it for real.' }
    ]
  },
  {
    id: 'world-builders', title: 'World builders', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'Pupils explore a little 3D world, learn what x, y and z mean by moving things, add to a sequence of “make” blocks, then use a repeat loop and a counting variable to build a row of pillars, and a forever loop to make a star spin.',
    objective: 'We are learning to use sequence and repetition to build a 3D world, and to place things with x, y and z.',
    success: ['I can say what x, y and z mean in a 3D world.', 'I can change the numbers in a block to put something exactly where I want it.', 'I can use a repeat loop to build lots of things with a few blocks.', 'I can use a forever loop to make something keep moving.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['x, y, z', 'x is left and right, y is up and down, z is forwards and backwards'], ['sequence', 'the order the blocks run in, from top to bottom'],
      ['repeat / loop', 'do the same blocks again'], ['variable', 'a named value that can change, like “across”'], ['forever loop', 'keeps going until you press Stop']],
    need: ['A device per pupil or pair (3D World needs the internet the first time)', 'Optional: three metre sticks or strips of card for the warm-up (x, y and z)'],
    plan: [
      { min: 5, title: 'Where is it?', html: '<p>Lay three strips of card on a table like the corner of a box: one going left–right (<b>x</b>), one standing up (<b>y</b>) and one going away from you (<b>z</b>). Put a rubber at the corner (0, 0, 0). Move it “3 along x”, then “2 up y”, then “4 along z”. <b>Ask:</b> how many numbers do we need to say exactly where something is in 3D? (Three.)</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter on the board. Drag the empty space to look around. Point out the blocks: everything inside <b>when Run is clicked</b> is a <b>sequence</b> of “make” blocks, read from top to bottom.</p><p>Click the red ball: its <b>make ball</b> block lights up and arrows appear. Drag the red arrow (x), the green arrow (y) and the blue arrow (z) and watch the numbers in the block change. Then type x 0, y 1, z 0 so the ball sits on the gold box.</p>' },
      { min: 10, title: 'Build in order', html: '<p>Pupils follow the Lesson card (steps 1–4): look around, move the ball, put it on the box, and add a <b>make cone</b> block to the sequence. The world changes as soon as the blocks change; there is no need to press Run yet.</p>' },
      { min: 20, title: 'Repeat it', html: '<p>On the board, put a <b>make box</b> block inside a <b>repeat 5 times</b> loop (under <b>set across to -6</b>). <b>Ask:</b> we made 5 boxes, so why can we only see one? (They are all in the same place.) We need x to be different each time round the loop.</p><p>Show the <b>across</b> variable: it starts at -6, goes into the box’s x, and <b>change across by 3</b> adds 3 each time round. Trace it on the board: -6, -3, 0, 3, 6. Pupils follow steps 5–6.</p><p>Common bug: putting <b>change across by 3</b> outside the loop, so every pillar is in the same place.</p>' },
      { min: 10, title: 'Make it spin', html: '<p>Pupils add a <b>forever</b> loop at the end with <b>turn star by … y 5</b> inside, then press <b>Run</b> (step 7). <b>Ask:</b> why does the star only spin after Run? (The forever loop only runs while the program is running; Stop goes back to how the world starts.) Fast finishers try the staircase challenge.</p>' },
      { min: 5, title: 'Plenary', html: '<p><b>Ask:</b> how many blocks did you need for 5 pillars? How many would you need for 50? Which loop stops by itself, and which keeps going?</p><p>Next, in Years 5–6, the “3D obstacle course” lesson builds on this: pupils use what they know about x, y and z and loops, and add a player, <b>events</b> (when … touches …) and a game.</p>' }
    ],
    support: 'Build the repeat loop together on the board first and let pupils copy it. Pairs can share the jobs: one person drags the blocks, the other reads the numbers out.',
    stretch: 'Make a staircase (the challenge on the card). Make two rows of pillars with a loop inside a loop. Use a model from Models (like a tree) inside the loop to plant a row of trees.',
    assess: ['Explains what x, y and z mean', 'Changes the numbers in a make block to place an object exactly', 'Uses a repeat loop with a counting variable to build a row', 'Uses a forever loop to keep an object turning'],
    steps: [
      { t: 'Look around', d: 'Drag the empty space in the world to look around, and scroll to zoom. Find the gold box, the red ball, the tree and the star.' },
      { t: 'Move the ball', d: 'Click the red ball. Drag its arrows and watch the x, y and z numbers change in its “make ball” block.' },
      { t: 'On top of the box', d: 'Type the numbers to put the ball on the box: x 0, y 1, z 0. Which number is how high it is?' },
      { t: 'Add to the sequence', d: 'From Shapes, drag a “make cone” block in under “make ball”. Change its x, y and z to stand it next to the tree.' },
      { t: 'Repeat 5 times', d: 'From Control, drag “repeat 10 times” under “set across to -6” and change 10 to 5. From Shapes, put a “make box” block inside it with height 3 and z 6. Why can you only see one box?' },
      { t: 'Count across', d: 'From Variables, drag the “across” block into the box’s x. Then put “change across by 1” inside the loop under the box, and change 1 to 3. Now you have a row of 5 pillars!' },
      { t: 'Make it spin', d: 'From Control, add “forever” at the very end. From Motion, put a “turn … by x 0 y 45 z 0 degrees” block inside it, choose star, and change 45 to 5. Press Run!' },
      { t: 'Challenge', d: 'Build a staircase! In Variables, press Create variable and call it up. Set up to 1 before the loop, put up in the box’s height, and change up by 1 inside the loop.' }
    ]
  },
  // ───────────── ROBOT HELPER ACADEMY · Block 1 (Build Lab, Years 3–4). Worlds: craft/craft-academy.js ─────────────
  {
    id: 'academy-1-crate', unit: 'Robot Helper Academy · Block 1 · Lesson 1', title: 'The lost crate', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'The first Academy lesson. Pupils plan a route for the robot helper on paper as an algorithm (arrows and numbers), then turn their plan into blocks and test it on Pebble Island’s harbour.',
    objective: 'We are learning to plan an algorithm and turn it into code.',
    success: ['I can write an algorithm as clear steps in the right order.', 'I can turn my plan into blocks.', 'I can test my code and change it until it works.'],
    curriculum: ['design', 'reason'],
    words: [['algorithm', 'a set of exact steps, in order, to do a job'], ['code', 'instructions a computer can follow'], ['sequence', 'the order the steps run in'], ['test', 'run the code to see if it does what you planned']],
    need: ['A device per pupil or pair, with CodeJump open', 'Squared paper and a pencil each (for the plan)', 'Optional: a printed grid on the floor for the warm-up'],
    plan: [
      { min: 8, title: 'Be the robot', html: '<p>Make a route between desks. One pupil is the “robot” and can only do three things: <b>forward (a number of steps)</b>, <b>turn left</b>, <b>turn right</b>. The class gives instructions to reach a box. Try a vague one first (“go round there”). <b>Ask:</b> why didn’t that work? Introduce <b>algorithm</b>: exact steps, in the right order.</p>' },
      { min: 8, title: 'Meet Pebble Island', html: '<p>Open the starter on the board. Explain the unit: the island needs help, and in each lesson the robot helper learns something new. Walk to Captain Marlo (arrow keys or WASD; drag to look) and press <b>E</b> to talk. Point out the grey gravel path and the crate at the end.</p>' },
      { min: 12, title: 'Plan on paper', html: '<p>Pupils switch the camera to <b>Helper</b> to see from above, then draw the path on squared paper and write the algorithm as arrows: <b>↑4 ⟳ ↑5 ⟲ ↑5</b> (forward 4, turn right, forward 5, turn left, forward 5). Pairs swap plans and “run” each other’s with a finger. <b>Ask:</b> does the helper turn on the spot, or move while it turns? (On the spot.)</p>' },
      { min: 24, title: 'Code it', html: '<p>Pupils build their plan with <b>Helper</b> blocks under <b>when Run is clicked</b> and press <b>Run</b>. Every Run starts the helper back at the beginning, so they can change a number and try again. Praise testing and fixing: “What did it do? What did you expect? Which step is different?”</p>' },
      { min: 8, title: 'Plenary', html: '<p>Show one program on the board and read it as an algorithm. <b>Ask:</b> did anyone have a different algorithm that still worked? Is one better? (Both are fine if they work — next lessons we will care about the number of blocks.)</p><p>Answer: forward 4, turn right, forward 5, turn left, forward 5.</p>' }
    ],
    support: 'Give pupils the route already drawn on squared paper; they just count the squares and write the numbers.',
    stretch: 'Write the algorithm for a different route to the crate (going the other way round the crate stacks). Write the plan for a friend’s route home from the quay.',
    assess: ['Writes the route as an ordered set of steps', 'Turns the plan into a matching sequence of blocks', 'Finds which step is wrong when the helper goes the wrong way, and fixes it'],
    steps: [
      { t: 'Meet the captain', d: 'Click “Let’s go!”. Walk to Captain Marlo with the arrow keys (or W A S D) and press E to talk.' },
      { t: 'Look from above', d: 'Press the Helper camera button to see the helper. Find the grey gravel path and the crate at the end.' },
      { t: 'Plan it on paper', d: 'Draw the path on squared paper. Write each step: forward how many? Then turn left or right?' },
      { t: 'Build your plan', d: 'In the Blocks tab, open Helper. Join “helper move forward” and “helper turn” blocks under “when Run is clicked”, in the order of your plan.' },
      { t: 'Test it', d: 'Press Run. Did the helper follow the path? Every Run starts it back at the beginning, so change a number and try again.' },
      { t: 'Reach the crate', d: 'Keep testing until the helper reaches the crate. The task ticks itself off.' },
      { t: 'Challenge', d: 'Write your algorithm out as arrows for a friend. Can they follow it with a finger on the screen?' }
    ]
  },
  {
    id: 'academy-2-post', unit: 'Robot Helper Academy · Block 1 · Lesson 2', title: 'The post round', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'A longer sequence: the helper delivers letters to three houses along a winding path. Pupils build and test their code a chunk at a time, and learn that the order of the steps matters.',
    objective: 'We are learning to build a long sequence by breaking it into parts and testing each part.',
    success: ['I can break a long job into smaller parts.', 'I can test my code a bit at a time.', 'I can find the first mistake in a sequence and fix it.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['sequence', 'steps that run one after another, in order'], ['decompose', 'break a big job into smaller parts'], ['bug', 'a mistake in the code'], ['debug', 'find and fix the mistake']],
    need: ['A device per pupil or pair, with CodeJump open', 'Squared paper (optional, for planning)'],
    plan: [
      { min: 6, title: 'Order matters', html: '<p>Write three steps of making toast on the board in the wrong order (eat it, put bread in, butter it). <b>Ask:</b> what is wrong? A <b>sequence</b> only works in the right order. Recap last lesson’s algorithm.</p>' },
      { min: 8, title: 'The post round', html: '<p>Open the starter. Talk to Posty Fen: three stops — Mill Cottage, the bakery, the school — each with a red letterbox beside the path. <b>Ask:</b> how could we break this big job into parts? (One part per stop: <b>decompose</b>.)</p>' },
      { min: 25, title: 'Chunk by chunk', html: '<p>Pupils code the first part (to Mill Cottage) and press <b>Run</b>. The task ticks when the helper gets there. Then they add the next part, Run again, and so on. Every Run starts from the beginning, so the whole sequence is tested each time.</p><p>Common bug: turning the wrong way. Teach the trick of standing up and facing the same way as the helper. When something goes wrong, the bug is usually in the <b>newest</b> part.</p>' },
      { min: 13, title: 'Bug hunt', html: '<p>On the board, swap two blocks in a finished program (a turn and a move). <b>Ask:</b> predict where the helper will end up. Run it. Fix it together.</p><p>Answer: forward 3 (Mill Cottage), turn right, forward 5, turn left, forward 4 (the bakery), turn right, forward 6, turn left, forward 3, turn left, forward 4 (the school).</p>' },
      { min: 8, title: 'Plenary', html: '<p><b>Ask:</b> how many blocks did your program need? Did anyone spot a pattern that repeats? (Hold the thought: next we meet actions, then loops.)</p>' }
    ],
    support: 'Pupils code only to the first two stops. Give the first chunk on a card.',
    stretch: 'Make the helper say something at each house (helper say). Can you find a shorter route that still passes every letterbox?',
    assess: ['Breaks the route into parts, one per stop', 'Tests after adding each part', 'Uses the newest change to find a bug, and fixes it'],
    steps: [
      { t: 'Talk to Fen', d: 'Walk to Posty Fen and press E. Which three places need a letter?' },
      { t: 'First stop', d: 'The starter goes forward 3 to Mill Cottage. Press Run and watch the task tick.' },
      { t: 'Second stop', d: 'Add blocks to get from Mill Cottage to the bakery. Press Run to test the whole thing.' },
      { t: 'Third stop', d: 'Add blocks to reach the school. If it goes wrong, look at the newest blocks first.' },
      { t: 'All delivered', d: 'Run it from the start until all three tasks are ticked.' },
      { t: 'Challenge', d: 'Add a “helper say” block at each house, like “Post for you!”.' }
    ]
  },
  {
    id: 'academy-3-flowers', unit: 'Robot Helper Academy · Block 1 · Lesson 3', title: 'The flower bed', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'Sequences that mix moves with actions: the helper plants five flowers in a row. Pupils predict what happens when the order of “plant” and “move” changes, and notice a pattern repeating.',
    objective: 'We are learning to put moves and actions in the right order, and to spot a pattern.',
    success: ['I can use an action block (place) as well as moves.', 'I can predict what will happen if two blocks swap places.', 'I can spot the part of my code that repeats.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['action', 'a block that does something (like place a block), not just move'], ['predict', 'say what you think will happen before you test'], ['pattern', 'something that happens again and again'], ['sequence', 'steps in order']],
    need: ['A device per pupil or pair, with CodeJump open'],
    plan: [
      { min: 7, title: 'Plant a row', html: '<p>Act it out: a pupil walks along a line of desks and puts a pencil on each one. Write their actions on the board: <b>put, step, put, step, put</b>. <b>Ask:</b> what happens if you step before you put the first one down?</p>' },
      { min: 8, title: 'Show me', html: '<p>Open the starter. Talk to Gardener Ada. Show the starter code: <b>helper place red block right</b>, then <b>move forward 1</b>. Press Run: one flower. Show how to change the colour in the drop-down.</p>' },
      { min: 25, title: 'Five flowers', html: '<p>Pupils extend the sequence to plant 5 flowers in the brown bed (task ticks at 5). Encourage different colours. Then set a <b>predict</b> challenge: “Swap the first place and move. What will happen?” Pupils write their prediction, then test.</p><p>Answer: place, move, place, move, place, move, place, move, place (9 blocks, plus “when Run is clicked”).</p>' },
      { min: 12, title: 'Spot the pattern', html: '<p>Put a finished program on the board. Circle each “place + move” pair. <b>Ask:</b> what is the same each time? What changes? (Only the colour.) If the bed were 20 flowers long, how many blocks would you need? (39!) Tell them: next lesson we will learn a shortcut — a <b>loop</b>.</p>' },
      { min: 8, title: 'Plenary', html: '<p>Pupils explain to a partner what “place right” does and why the order matters.</p>' }
    ],
    support: 'Pupils build pairs of blocks (place + move) one pair at a time and press Run after each.',
    stretch: 'Make a rainbow order. Plant flowers on both sides of the path (place LEFT as well as RIGHT).',
    assess: ['Uses place and move in the correct order', 'Writes a prediction before testing a change', 'Identifies the repeating pair of blocks'],
    steps: [
      { t: 'Talk to Ada', d: 'Walk to Gardener Ada and press E to hear what the park needs.' },
      { t: 'One flower', d: 'Press Run. The helper plants one red flower on its right, then steps forward.' },
      { t: 'Five in a row', d: 'Add more “helper place … right” and “helper move forward 1” blocks until there are 5 flowers in the bed.' },
      { t: 'Colours', d: 'Click the colour in a place block to choose a different flower.' },
      { t: 'Predict', d: 'What will happen if the very first move comes BEFORE the first place? Say it, then test it.' },
      { t: 'Spot the pattern', d: 'Which two blocks keep repeating? Count how many blocks you used.' }
    ]
  },
  {
    id: 'academy-4-fence', unit: 'Robot Helper Academy · Block 1 · Lesson 4', title: 'Mend the fence', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'Loops: the farm fence has a 10-post gap. Writing it out takes 20 blocks; a repeat loop takes 3. Pupils learn to find the repeating part and put it inside a loop.',
    objective: 'We are learning to use a repeat loop to do the same steps again and again.',
    success: ['I can find the part of a sequence that repeats.', 'I can put blocks inside a repeat loop.', 'I can choose how many times the loop repeats.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['loop', 'code that runs again and again'], ['repeat', 'a loop that runs a set number of times'], ['inside', 'the blocks in the loop’s mouth are the ones that repeat'], ['efficient', 'does the job with fewer blocks']],
    need: ['A device per pupil or pair, with CodeJump open'],
    plan: [
      { min: 6, title: 'Clap it', html: '<p>Clap a pattern: clap, stamp, clap, stamp, clap, stamp. <b>Ask:</b> how could I write this shorter? (“Repeat 3 times: clap, stamp.”) That is a <b>loop</b>.</p>' },
      { min: 8, title: 'The gap', html: '<p>Open the starter and talk to Farmer Kit. The starter does it the long way: place a post (tree trunk) LEFT, move forward, twice. <b>Ask:</b> how many blocks to fill all 10? (20.)</p>' },
      { min: 10, title: 'Show me', html: '<p>On the board, drag <b>repeat 4 times</b> from <b>Loops</b>, move the place and move blocks <b>inside</b> it, change 4 to 10, and attach it under “when Run is clicked”. Press Run. Three blocks instead of twenty!</p>' },
      { min: 28, title: 'Your turn', html: '<p>Pupils follow the card. The task ticks when 10 posts are in the gap and another ticks when the code uses a loop.</p><p>Common bugs: the move is outside the loop (all 10 posts go in the same place — only 1 shows); the loop number is wrong (too few posts); the place and move are swapped (the gap is filled one square later and a post lands on the old fence).</p><p>Answer: repeat 10 times { helper place tree trunk left; helper move forward 1 }.</p>' },
      { min: 8, title: 'Plenary', html: '<p><b>Ask:</b> what would change if the gap was 50 posts long? (Just the number.) What does efficient mean?</p>' }
    ],
    support: 'Give pupils the repeat block already in place; they move the two blocks inside it.',
    stretch: 'Build a second fence on the other side of the path with the same loop (turn round first). Make the fence two posts high (place LEFT, then move UP? Try it!).',
    assess: ['Identifies place + move as the repeating part', 'Puts the right blocks inside a repeat loop', 'Sets the loop count to match the job'],
    steps: [
      { t: 'Talk to Kit', d: 'Walk to Farmer Kit and press E. How many posts are missing?' },
      { t: 'The long way', d: 'Press Run. The starter puts 2 posts in. How many blocks would 10 need?' },
      { t: 'Get a loop', d: 'Open Loops and drag “repeat 4 times” into the code area.' },
      { t: 'Put them inside', d: 'Drag the place and move blocks INSIDE the repeat. Delete any extra copies.' },
      { t: 'Ten times', d: 'Change 4 to 10, join the repeat under “when Run is clicked”, and press Run.' },
      { t: 'Count the blocks', d: 'How many blocks did you use? How many fewer than the long way?' },
      { t: 'Challenge', d: 'Can you build the fence two posts high?' }
    ]
  },
  {
    id: 'academy-5-pen', unit: 'Robot Helper Academy · Block 1 · Lesson 5', title: 'The sheep pen', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'A coding challenge with stars: build a square pen with the helper’s trail. Pupils compare the long way with a loop and aim for the most efficient program (5 blocks for three stars).',
    objective: 'We are learning to make a program more efficient by finding the pattern and using a loop.',
    success: ['I can find the pattern in a shape.', 'I can use a loop to make my code shorter.', 'I can explain why a shorter program can be better.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['efficient', 'gets the job done with as few blocks as possible'], ['pattern', 'the part that happens again and again'], ['trail', 'the helper leaves a block behind wherever it walks'], ['loop', 'code that repeats']],
    need: ['A device per pupil or pair, with CodeJump open'],
    plan: [
      { min: 6, title: 'Walk a square', html: '<p>A pupil walks a square on the floor while the class writes the steps: forward, turn right, forward, turn right… <b>Ask:</b> what repeats, and how many times? (Forward + turn right, 4 times.)</p>' },
      { min: 8, title: 'The challenge', html: '<p>Open the starter, talk to Shepherd Rue and read the welcome card: 3 stars for <b>5 blocks or fewer</b>, counting every block including “when Run is clicked”. Show the new block <b>helper leave a trail of …</b>: wherever the helper walks, it leaves that block behind.</p>' },
      { min: 25, title: 'Go for three stars', html: '<p>Pupils press Run to start (the timer starts too). Many will do it the long way first (11 blocks, 1 star) — great: now make it efficient. The finish pop-up shows the stars and the number of blocks.</p><p>The pen has a gap where the helper ends up: it can’t walk back onto its own trail. Call it the gate!</p><p>Answer (5 blocks): when Run is clicked · helper leave a trail of tree trunk · repeat 4 times { helper move forward 5 · helper turn right }.</p>' },
      { min: 13, title: 'Plenary', html: '<p>Compare programs on the board: 11 blocks vs 5 blocks. <b>Ask:</b> they both build the pen, so why is shorter better? (Easier to read, quicker to change — try a pen of side 8: one number!)</p>' },
      { min: 8, title: 'Link forward', html: '<p>Next lesson is a project: pupils use loops to build their own market stalls.</p>' }
    ],
    support: 'Show the long-way program first and ask pupils to circle the repeating pair before they use a loop.',
    stretch: 'Make a pen of side 8. Build a triangle or a bigger pen around the first one. Can you make the gate somewhere else?',
    assess: ['Explains which part of a square repeats', 'Uses a loop to reduce the number of blocks', 'Explains why efficient code is useful'],
    steps: [
      { t: 'Talk to Rue', d: 'Walk to Shepherd Rue and press E. Read the challenge: 5 blocks or fewer for 3 stars.' },
      { t: 'The trail', d: 'The starter has “helper leave a trail of tree trunk”. Press Run and watch it leave trunks behind.' },
      { t: 'The long way', d: 'Add blocks to walk all the way round the mossy square. How many blocks is that?' },
      { t: 'Find the pattern', d: 'Which two blocks repeat? How many times?' },
      { t: 'Use a loop', d: 'Put the repeating blocks inside a repeat loop. Press Run again.' },
      { t: 'Three stars?', d: 'The finish pop-up shows your stars. Count every block, even “when Run is clicked”.' }
    ]
  },
  {
    id: 'academy-6-market', unit: 'Robot Helper Academy · Block 1 · Lesson 6', title: 'Market day', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'The Block 1 project: pupils plan and code their own market stalls with loops, using sequence, actions and repetition together, then test and improve their design.',
    objective: 'We are learning to plan, code, test and improve our own program using sequence and loops.',
    success: ['I can plan a design before I code it.', 'I can use loops in my own program.', 'I can test my program and make it better.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['design', 'a plan of what you will make and how'], ['loop', 'code that repeats'], ['test', 'run it and check it'], ['improve', 'change it to make it better']],
    need: ['A device per pupil or pair, with CodeJump open', 'Squared paper for the stall design'],
    plan: [
      { min: 7, title: 'What makes a stall?', html: '<p>Open the starter and visit Mayor Juno’s stall: four posts and a striped roof. <b>Ask:</b> what repeats? (The posts are the same; each post is blocks on top of each other; the stalls are alike.)</p>' },
      { min: 10, title: 'Design', html: '<p>Pupils draw their stall on squared paper, from the front and from above, and write which parts a loop could build. Show both ways to build: the <b>helper</b> (place, move up/forward) and the <b>builder</b> commands (fill, line — which count from where <b>you</b> stand, so walk into the square first).</p>' },
      { min: 28, title: 'Build and test', html: '<p>Pupils code their stalls. Tasks: 30 blocks of building in the square, and a loop in the code. This world does not start again on every Run, so stalls stay built. Use the Undo button in the Build Lab to take back a build that went wrong.</p><p>One example answer: the helper walks into the square, then two loops each build four posts 3 high with a coloured top (see the Academy notes).</p>' },
      { min: 10, title: 'Gallery walk', html: '<p>Pupils visit each other’s screens (or share to the board). Each says: <b>“My loop builds … It repeats … times.”</b> One thing they would improve next.</p>' },
      { min: 5, title: 'Block 1 review', html: '<p>Recap the block: algorithm → sequence → actions → loops → efficiency → project. Block 2 starts with debugging and then decisions with “if”.</p>' }
    ],
    support: 'Give a post loop to copy (repeat 3: place, move up). Pupils just add the move to the next post.',
    stretch: 'Use a loop inside a loop to build a whole row of stalls. Add a roof with the builder fill command. Light the market with lanterns.',
    assess: ['Produces a design before coding', 'Uses at least one loop to build part of the design', 'Tests and improves the program after feedback'],
    steps: [
      { t: 'Visit Juno', d: 'Walk to Mayor Juno and press E. Look closely at Juno’s stall: what repeats?' },
      { t: 'Design', d: 'Draw your stall on squared paper. Mark the parts a loop could build.' },
      { t: 'Walk to the square', d: 'Walk into the tiled square. Builder blocks count from where you stand.' },
      { t: 'Code a post', d: 'Use a loop to build one post (place, move up). Press Run to test.' },
      { t: 'Code the stall', d: 'Add more so the whole stall builds. Then build more stalls with a loop.' },
      { t: 'Check the tasks', d: 'You need 30 blocks of building in the square and a loop in your code.' },
      { t: 'Improve it', d: 'Ask a partner for one idea. Change your code to make it better.' }
    ]
  },
  // ───────────── ROBOT HELPER ACADEMY · Block 2 "Fix it and decide" (Years 4–5) ─────────────
  {
    id: 'academy-7-bridge', unit: 'Robot Helper Academy · Block 2 · Lesson 7', title: 'The broken bridge', ks: 'ks2', years: 'Years 4–5', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'Debugging: Odo the bridgekeeper’s program should build a plank bridge across a stream, but it has two bugs. Pupils watch it run, say what went wrong, find each bug and fix one at a time.',
    objective: 'We are learning to find and fix bugs by testing and watching what a program really does.',
    success: ['I can say what a program should do and what it really did.', 'I can find the line that causes a bug.', 'I can fix one bug at a time and test again.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['bug', 'a mistake that makes a program do the wrong thing'], ['debug', 'find and fix bugs'], ['expected', 'what you thought would happen'], ['actual', 'what really happened']],
    need: ['A device per pupil or pair, with CodeJump open'],
    plan: [
      { min: 7, title: 'Spot the bug', html: '<p>Show a recipe with a mistake (“bake for 3 hours”). <b>Ask:</b> how would we know it’s wrong? (We test it!) Introduce <b>bug</b>, <b>debug</b>, <b>expected</b> and <b>actual</b>. Recap Block 1: loops and efficiency.</p>' },
      { min: 10, title: 'Watch it fail', html: '<p>Open the starter and talk to Odo. Press <b>Run</b> and watch the helper with the class. <b>Ask:</b> what did we expect? What actually happened? (The first plank landed on the grass, and there’s a gap at the far end.)</p>' },
      { min: 25, title: 'Debug it', html: '<p>Pupils find and fix the two bugs, changing <b>one thing at a time</b> and pressing Run after each change (every Run starts again). Encourage them to keep a bug log: what was wrong, what they changed.</p><p>Bug 1: <b>move forward 2</b> should be <b>3</b> (the helper must stand on the bank edge before the loop). Bug 2: <b>repeat 4</b> should be <b>5</b> (the stream is 5 wide). Then the helper crosses with move forward 2.</p>' },
      { min: 10, title: 'Make a bug', html: '<p>Pairs swap: each pupil adds one bug to a working program, and their partner debugs it. <b>Ask:</b> which bugs were hardest to find, and why?</p>' },
      { min: 8, title: 'Plenary', html: '<p><b>Ask:</b> what is a good way to debug? (Watch it run, compare expected with actual, find the first thing that went wrong, change one thing, test again.)</p>' }
    ],
    support: 'Tell pupils there is one bug in the first block and one in the loop. Let them change numbers only.',
    stretch: 'Make the bridge 3 planks wide. Add posts at both ends.',
    assess: ['Describes expected and actual behaviour', 'Locates the line that causes each bug', 'Tests after each change'],
    steps: [
      { t: 'Talk to Odo', d: 'Walk to Odo and press E. What should the program do?' },
      { t: 'Watch it run', d: 'Press Run and watch the helper closely. Where did the first plank go? Is there a gap?' },
      { t: 'Expected and actual', d: 'Say (or write) what you expected and what actually happened.' },
      { t: 'Bug 1', d: 'Look at the first move. Is the helper standing on the edge of the bank when the loop starts? Change one number and Run.' },
      { t: 'Bug 2', d: 'Count how wide the stream is. Does the loop repeat enough times? Fix it and Run.' },
      { t: 'Cross the stream', d: 'When the bridge is whole, the helper should reach the far bank. Both tasks tick.' },
      { t: 'Challenge', d: 'Add a bug to your program and let a partner find it.' }
    ]
  },
  {
    id: 'academy-8-lighthouse', unit: 'Robot Helper Academy · Block 2 · Lesson 8', title: 'The lighthouse', ks: 'ks2', years: 'Years 4–5', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'Debugging loops: a lighthouse program has three bugs — the loop count, the order of blocks inside the loop, and the lamp’s direction. Pupils predict before running, then trace the loop to fix it.',
    objective: 'We are learning to debug loops by predicting and tracing what happens each time round.',
    success: ['I can predict what a loop will do before I run it.', 'I can trace a loop one time round at a time.', 'I can fix bugs in a loop’s count and order.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['predict', 'say what you think will happen before testing'], ['trace', 'follow the code step by step'], ['iteration', 'one time round a loop'], ['bug', 'a mistake in a program']],
    need: ['A device per pupil or pair, with CodeJump open', 'A trace table on paper (time round · what the helper does · tower height)'],
    plan: [
      { min: 8, title: 'Predict', html: '<p>Open the starter and talk to Keeper Iska. Show the code on the board. <b>Before running</b>, pupils predict: how tall will the tower be? Where will the lamp go? Take votes.</p>' },
      { min: 10, title: 'Trace it', html: '<p>Fill a trace table together for the first 3 times round: “1: move up, place white in front at height 2…”. <b>Ask:</b> what is at height 1? (Nothing — the first block goes in after moving up.)</p>' },
      { min: 25, title: 'Fix the three bugs', html: '<p>Pupils run, compare with their prediction, and fix: <b>repeat 6 → 8</b>; <b>swap the two blocks inside</b> (place, then move up); lamp direction <b>up → forward</b>. One change, one Run each time.</p><p>Answer: repeat 8 { helper place white forward · helper move up 1 } · helper place lamp forward.</p>' },
      { min: 10, title: 'Off by one', html: '<p>Discuss “off by one” bugs: loops that run one too many or too few times. <b>Ask:</b> how did we know it needed 8?</p>' },
      { min: 7, title: 'Plenary', html: '<p>Pupils explain one bug in their own words: what it did, why, and the fix.</p>' }
    ],
    support: 'Fix the bugs together one at a time; pupils copy each fix.',
    stretch: 'Make the tower stripy (red and white) with a loop inside the loop. Add a balcony under the lamp.',
    assess: ['Makes a prediction before running', 'Traces the first iterations accurately', 'Fixes count, order and direction bugs'],
    steps: [
      { t: 'Talk to Iska', d: 'Walk to Keeper Iska and press E. How tall must the tower be?' },
      { t: 'Predict', d: 'Read the code. How tall will it build? Where will the lamp go? Say it before you Run.' },
      { t: 'Run and compare', d: 'Press Run. Was your prediction right? What is wrong?' },
      { t: 'The count', d: 'How many times should the loop repeat for a tower 8 tall? Fix the number.' },
      { t: 'The order', d: 'Is there a gap at the bottom? Swap the two blocks inside the loop.' },
      { t: 'The lamp', d: 'The lamp should go on top of the tower, not above the helper. Change its direction.' },
      { t: 'Challenge', d: 'Make the lighthouse red and white stripes.' }
    ]
  },
  {
    id: 'academy-9-beach', unit: 'Robot Helper Academy · Block 2 · Lesson 9', title: 'The rocky beach', ks: 'ks2', years: 'Years 4–5', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'Selection: the helper walks up a beach path and decides at each step — IF the block below is a rock, dig it up. The tasks only pass if the sand stays, so digging every step doesn’t work.',
    objective: 'We are learning to use if to make a program decide what to do.',
    success: ['I can explain what an if block does.', 'I can use the helper’s sensor in a condition.', 'I can explain why digging every step would be wrong.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['selection', 'choosing what to do'], ['if', 'run these blocks only when the condition is true'], ['condition', 'a question that is true or false'], ['sensor', 'a way for the helper to find out about the world']],
    need: ['A device per pupil or pair, with CodeJump open'],
    plan: [
      { min: 7, title: 'If it rains…', html: '<p>Play “if”: “If you’re wearing blue, stand up.” Try a few. <b>Ask:</b> what decided who stood up? Introduce <b>condition</b> (true or false) and <b>selection</b>.</p>' },
      { min: 10, title: 'The beach', html: '<p>Open the starter and talk to Lifeguard Pip. The starter walks 12 steps. <b>Ask:</b> what if we put “dig down” in the loop? Try it on the board: the sand disappears too, and the sand task fails. We need the helper to <b>decide</b>.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils put an <b>if</b> inside the loop, with the condition <b>block the helper sees down = cobblestone</b> (from World), and <b>helper dig down</b> inside the if.</p><p>Answer: repeat 12 { helper move forward 1 · if block the helper sees down = cobblestone { helper dig down } }.</p><p>Common bug: the if is outside the loop (it only checks once).</p>' },
      { min: 10, title: 'True or false?', html: '<p>Trace three steps on the board: “step 1: sand → false → do nothing; step 2: cobblestone → true → dig”. <b>Ask:</b> how many times was the condition checked? (12.)</p>' },
      { min: 8, title: 'Plenary', html: '<p><b>Ask:</b> where else do computers use if? (Games: if you touch the coin, add a point.) Next lesson: if … <b>else</b>.</p>' }
    ],
    support: 'Give the condition block ready-made; pupils only place it in the if.',
    stretch: 'Put a shell (white block) on the sand where each rock was: inside the if, after digging, place white down.',
    assess: ['Uses an if inside a loop', 'Builds a condition from the helper’s sensor', 'Explains why the if is needed'],
    steps: [
      { t: 'Talk to Pip', d: 'Walk to Lifeguard Pip and press E. Which blocks must go, and which must stay?' },
      { t: 'Try it without if', d: 'Put “helper dig down” in the loop and Run. What happens to the sand?' },
      { t: 'Add an if', d: 'Take the dig out. From Logic, put an “if” in the loop, after the move.' },
      { t: 'The condition', d: 'From World, use “block the helper sees down = …” and choose cobblestone. Put it in the if.' },
      { t: 'Dig inside', d: 'Put “helper dig down” INSIDE the if. Press Run.' },
      { t: 'All rocks gone?', d: 'The rocks should be dug up and every bit of sand left. Check the task list.' },
      { t: 'Challenge', d: 'After digging, put a white shell where the rock was.' }
    ]
  },
  {
    id: 'academy-10-maze', unit: 'Robot Helper Academy · Block 2 · Lesson 10', title: 'The hedge maze', ks: 'ks2', years: 'Years 4–5', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'If … else with sensing: instead of planning every step, pupils write rules the helper repeats — if there’s a hedge in front, turn (left or right, depending on the left side), else move forward — and it finds its own way through a maze.',
    objective: 'We are learning to use if … else and sensing so a program can respond to what it finds.',
    success: ['I can use if … else to choose between two actions.', 'I can use a sensor (“sees a block?”) in a condition.', 'I can explain why rules can work in any maze.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['if … else', 'do one thing if the condition is true, another if it is false'], ['sense', 'find out about the world (is there a hedge in front?)'], ['nested', 'one block inside another of the same kind'], ['rule', 'a decision the program makes every time']],
    need: ['A device per pupil or pair, with CodeJump open', 'Optional: a maze drawn on paper for the warm-up'],
    plan: [
      { min: 8, title: 'Blindfold maze', html: '<p>A pupil walks a desk “maze” with eyes closed, feeling ahead with a hand. Agree rules: “If there’s a wall in front, turn; else step forward.” <b>Ask:</b> which way to turn?</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and talk to Ren. The starter says: if a hedge is in front, turn right; else move. Run it: it gets stuck at the first left-hand corner. <b>Ask:</b> what extra question does it need? (Is there a hedge on the left?)</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils put a second if … else inside the first: if a hedge on the left, turn right, else turn left. The task ticks at the gold square.</p><p>Answer: repeat 40 { if helper sees a block forward? { if helper sees a block left? { turn right } else { turn left } } else { move forward 1 } }.</p>' },
      { min: 10, title: 'Rules vs routes', html: '<p>Compare: in Lesson 2 we planned every step; today the helper decides. <b>Ask:</b> would our Lesson 2 code work in a new maze? Would today’s? (Rules work in any maze like this.)</p>' },
      { min: 7, title: 'Plenary', html: '<p>Pupils explain the nested if … else using the words <b>condition</b>, <b>true</b>, <b>false</b>.</p>' }
    ],
    support: 'Show the structure on a card with gaps for the conditions and actions.',
    stretch: 'Use “repeat until the helper is on gold” instead of repeat 40 (World → block the helper sees down = gold). Count the steps in a variable.',
    assess: ['Uses if … else correctly', 'Combines two sensor conditions (nested)', 'Explains why a rule-based program is more general'],
    steps: [
      { t: 'Talk to Ren', d: 'Walk to Gardener Ren and press E.' },
      { t: 'Run the starter', d: 'Press Run. Where does the helper get stuck? Why?' },
      { t: 'Look left', d: 'When there’s a hedge in front, the helper should check its LEFT side too.' },
      { t: 'If inside if', d: 'Replace “turn right” with an if … else: if the helper sees a block left, turn right, else turn left.' },
      { t: 'Run it', d: 'Press Run and watch the helper find its own way to the gold square.' },
      { t: 'Explain', d: 'Tell a partner the helper’s rules, in your own words.' },
      { t: 'Challenge', d: 'Use “repeat until” so the helper stops by itself on the gold.' }
    ]
  },
  {
    id: 'academy-11-orchard', unit: 'Robot Helper Academy · Block 2 · Lesson 11', title: 'The orchard', ks: 'ks2', years: 'Years 4–5', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'Logical operators: the helper harvests a plant on its left if it is a pumpkin OR a melon, and never digs the bushes. Pupils compare or and and, and use not.',
    objective: 'We are learning to join conditions with and, or and not.',
    success: ['I can join two conditions with or.', 'I can explain the difference between and and or.', 'I can use not to turn a condition round.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['or', 'true if either condition is true'], ['and', 'true only if both conditions are true'], ['not', 'turns true into false and false into true'], ['operator', 'a word or symbol that works on values']],
    need: ['A device per pupil or pair, with CodeJump open'],
    plan: [
      { min: 8, title: 'And or or?', html: '<p>“Stand up if you have a pet OR a sibling.” Then “…if you have a pet AND a sibling.” <b>Ask:</b> why did fewer stand the second time? Truth tables on the board (true/false for each).</p>' },
      { min: 8, title: 'The orchard', html: '<p>Open the starter and talk to Farmer Bo. The starter picks pumpkins only. Run it: the melons are left. <b>Ask:</b> how can one if pick both?</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils use the <b>and/or</b> block from Logic, set to <b>or</b>, with two “=” conditions: block on the left = pumpkin, block on the left = melon. The bushes must survive.</p><p>Answer: if block the helper sees left = pumpkin <b>or</b> block the helper sees left = melon { dig left }.</p><p>Try <b>and</b> instead: nothing is picked — a block can’t be a pumpkin and a melon at once!</p>' },
      { min: 12, title: 'Not', html: '<p>Show a different way: if <b>not</b> (block on the left = leaves) … — but it would dig empty spaces too (harmless here). <b>Ask:</b> which is clearer?</p>' },
      { min: 7, title: 'Plenary', html: '<p>Pupils write one “or” and one “and” rule from real life.</p>' }
    ],
    support: 'Give the or block with one condition already inside.',
    stretch: 'Count the harvest: a variable that goes up by 1 each time something is picked, said at the end.',
    assess: ['Joins two conditions with or', 'Predicts the result with and', 'Explains not'],
    steps: [
      { t: 'Talk to Bo', d: 'Walk to Farmer Bo and press E. What should be picked, and what must stay?' },
      { t: 'Run the starter', d: 'Press Run. What is left behind?' },
      { t: 'Get an or', d: 'From Logic, drag the “and” block and change it to “or”.' },
      { t: 'Two questions', d: 'Put “block the helper sees left = pumpkin” on one side and “… = melon” on the other.' },
      { t: 'Use it', d: 'Put the or block into the if. Press Run.' },
      { t: 'Try and', d: 'Change or to and and Run. What happens, and why?' },
      { t: 'Challenge', d: 'Count the harvest in a variable and make the helper say it.' }
    ]
  },
  {
    id: 'academy-12-mine', unit: 'Robot Helper Academy · Block 2 · Lesson 12', title: 'The gold mine', ks: 'ks2', years: 'Years 4–5', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'Repeat until: nobody knows how deep the gold is, so a counted loop won’t do. Pupils dig down until the helper’s sensor finds gold, and stop without digging it.',
    objective: 'We are learning to use a loop that stops when a condition becomes true.',
    success: ['I can explain the difference between repeat 5 and repeat until.', 'I can write a condition that stops a loop.', 'I can explain when to use each kind of loop.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['repeat until', 'keep going until a condition is true'], ['while', 'keep going while a condition is true'], ['condition', 'a question that is true or false'], ['infinite loop', 'a loop that never stops']],
    need: ['A device per pupil or pair, with CodeJump open'],
    plan: [
      { min: 8, title: 'Until…', html: '<p>“Keep clapping until I raise my hand.” <b>Ask:</b> did you know how many claps? Compare with “clap 5 times”. Introduce <b>repeat until</b>.</p>' },
      { min: 8, title: 'The mine', html: '<p>Open the starter and talk to Miner Dag. The starter digs 3 times — not deep enough. <b>Ask:</b> could we just try bigger numbers? What if the gold were in a different place?</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils use <b>repeat while</b> from Loops, change it to <b>repeat until</b>, and use the condition block the helper sees <b>down = gold in stone</b>. Inside: dig down, move down 1.</p><p>Answer: repeat until block the helper sees down = gold in stone { helper dig down · helper move down 1 }. The helper stops one block above the gold.</p><p>Common bug: digging after the loop (the gold is gone, so the last task fails).</p>' },
      { min: 12, title: 'Which loop?', html: '<p>Sort examples: “brush teeth for 2 minutes”, “stir until smooth”, “walk 10 steps”, “walk until you reach the door”. <b>Ask:</b> what is an infinite loop and how could we make one by mistake?</p>' },
      { min: 7, title: 'Block 2 review', html: '<p>Recap: debugging, if, if … else, and/or/not, repeat until. Block 3 adds variables, events and our own blocks.</p>' }
    ],
    support: 'Build the loop together; pupils choose the condition.',
    stretch: 'Count how deep the gold is in a variable and make the helper say it. Bring the helper back up to the top with another loop.',
    assess: ['Uses repeat until with a sensor condition', 'Explains why a counted loop is not enough', 'Chooses the right loop for a job'],
    steps: [
      { t: 'Talk to Dag', d: 'Walk to Miner Dag and press E. How deep is the gold?' },
      { t: 'Run the starter', d: 'Press Run. Did the helper reach the gold?' },
      { t: 'Get the loop', d: 'From Loops, drag “repeat while” and change it to “repeat until”.' },
      { t: 'The condition', d: 'From World, put “block the helper sees down = …” in it and choose gold in stone.' },
      { t: 'Dig inside', d: 'Move the dig down and move down blocks INSIDE the loop. Delete the old repeat 3.' },
      { t: 'Run it', d: 'Press Run. The helper should stop right on top of the gold.' },
      { t: 'Challenge', d: 'Count how deep the gold is in a variable and make the helper say it.' }
    ]
  },
  // ───────────── ROBOT HELPER ACADEMY · Block 3 "Smart helpers" (Years 5–6) ─────────────
  {
    id: 'academy-13-crops', unit: 'Robot Helper Academy · Block 3 · Lesson 13', title: 'Count the crops', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'Variables: the helper walks a row of crops and counts the pumpkins in a variable (set to 0, change by 1 when it sees one), then says the total.',
    objective: 'We are learning to use a variable to store and change a value while a program runs.',
    success: ['I can create a variable and give it a starting value.', 'I can change a variable inside a loop.', 'I can use a variable’s value in my program.'],
    curriculum: ['design', 'ssr', 'reason', 'data'],
    words: [['variable', 'a named box that remembers a value'], ['set', 'give a variable a value'], ['change by', 'add to (or take from) a variable'], ['initialise', 'give a variable its starting value']],
    need: ['A device per pupil or pair, with CodeJump open', 'Optional: a box labelled “pumpkins” and counters for the warm-up'],
    plan: [
      { min: 8, title: 'A box with a name', html: '<p>Hold up a box labelled <b>pumpkins</b>. Walk along a row of pictures; each time you see a pumpkin, add a counter. At the end, read the box. <b>Ask:</b> what if we forgot to empty the box first?</p>' },
      { min: 8, title: 'Show me', html: '<p>Open the starter and talk to Judge Mo. Show <b>Variables → Create variable</b> (pumpkins already exists in the starter: set to 0). Show <b>change pumpkins by 1</b> and the <b>pumpkins</b> value block.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils add an if inside the loop: if block the helper sees left = pumpkin, change pumpkins by 1. After the loop: helper say pumpkins. The task ticks when the helper says the right number.</p><p>Answer: pumpkins = 0 · repeat 12 { move forward 1 · if block left = pumpkin { change pumpkins by 1 } } · helper say pumpkins. (There are 7.)</p><p>Common bugs: setting to 0 inside the loop; saying inside the loop.</p>' },
      { min: 12, title: 'Trace the variable', html: '<p>Trace table on the board: step, block on the left, pumpkins. <b>Ask:</b> what would happen if set pumpkins to 0 was inside the loop?</p>' },
      { min: 7, title: 'Plenary', html: '<p><b>Ask:</b> where do games use variables? (Score, lives, time.)</p>' }
    ],
    support: 'Give the if block ready; pupils add the change block and the say block.',
    stretch: 'Count melons too, in a second variable, and say both: use join.',
    assess: ['Initialises a variable before a loop', 'Changes the variable inside the loop under a condition', 'Uses the variable’s value at the end'],
    steps: [
      { t: 'Talk to Mo', d: 'Walk to Judge Mo and press E. What must be counted?' },
      { t: 'The variable', d: 'Find “set pumpkins to 0” in the starter. Open Variables to see the pumpkins blocks.' },
      { t: 'Look left', d: 'Inside the loop, after the move, add an if: block the helper sees left = pumpkin.' },
      { t: 'Count it', d: 'Inside the if, put “change pumpkins by 1”.' },
      { t: 'Say it', d: 'After the loop (not inside it), add “helper say” with the pumpkins value block in it.' },
      { t: 'Run it', d: 'Press Run. Does the helper say the right number? The task ticks if it does.' },
      { t: 'Challenge', d: 'Count the melons too, in their own variable.' }
    ]
  },
  {
    id: 'academy-14-stairs', unit: 'Robot Helper Academy · Block 3 · Lesson 14', title: 'The staircase', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'Variables with maths: a staircase where each step is one block taller. A height variable controls an inner loop and grows by 1 each time round the outer loop.',
    objective: 'We are learning to use a variable that changes each time round a loop to control what the program does.',
    success: ['I can use a variable as the number in a repeat.', 'I can change a variable each time round a loop.', 'I can predict the values a variable will take.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['variable', 'a named value that can change'], ['nested loop', 'a loop inside another loop'], ['increment', 'add 1 to a variable'], ['pattern', '1, 2, 3, 4… a rule that makes a sequence']],
    need: ['A device per pupil or pair, with CodeJump open', 'Interlocking cubes for the warm-up (optional)'],
    plan: [
      { min: 8, title: 'Cube stairs', html: '<p>Build a staircase of cubes: 1, 2, 3, 4. <b>Ask:</b> what is the rule? How many cubes for 6 steps? (21.)</p>' },
      { min: 8, title: 'Show me', html: '<p>Open the starter and talk to Builder Val. The starter has <b>set height to 1</b>. Show a <b>repeat</b> block with the <b>height</b> value block in its number socket.</p>' },
      { min: 26, title: 'Your turn', html: '<p>Pupils build: repeat 6 { repeat height { place stone bricks left · move up 1 } · move down height · move forward 1 · change height by 1 }.</p><p>Common bugs: change height outside the loop (all steps the same); forgetting to come down (the steps float).</p>' },
      { min: 11, title: 'Trace', html: '<p>Trace table: time round, height, blocks placed, total. <b>Ask:</b> what would change height by 2 make?</p>' },
      { min: 7, title: 'Plenary', html: '<p>Pupils explain how one variable controls the size of every step.</p>' }
    ],
    support: 'Give the inner loop (a column) already built; pupils put height into it and add the change.',
    stretch: 'Make the steps go up by 2. Make the staircase go down again afterwards (change height by -1).',
    assess: ['Uses a variable in a loop count', 'Changes the variable each iteration', 'Predicts the values with a trace table'],
    steps: [
      { t: 'Talk to Val', d: 'Walk to Builder Val and press E. How tall is each step?' },
      { t: 'One column', d: 'Make a repeat with “helper place stone bricks left” and “helper move up 1” inside.' },
      { t: 'Use height', d: 'From Variables, drag the height value into the repeat’s number.' },
      { t: 'Come back down', d: 'After that repeat: helper move down — with height as the number — then move forward 1.' },
      { t: 'Grow', d: 'Add “change height by 1”. Put all of this inside a repeat 6.' },
      { t: 'Run it', d: 'Press Run. Are the steps 1, 2, 3, 4, 5, 6 tall?' },
      { t: 'Challenge', d: 'Make it go back down again.' }
    ]
  },
  {
    id: 'academy-15-chat', unit: 'Robot Helper Academy · Block 3 · Lesson 15', title: 'Chat commands', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'Events: pupils make their own chat command — “when I type lamps” — that runs when they type it. The number typed after the word goes into a variable, so “lamps 4” builds four lamp posts.',
    objective: 'We are learning to write code that runs when an event happens, and to pass it a value.',
    success: ['I can explain what an event is.', 'I can make code that runs when I type a word.', 'I can use the number typed after the word in my code.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['event', 'something that happens, which starts some code'], ['trigger', 'what starts the code'], ['input', 'a value given to the program'], ['parameter', 'the variable that holds the value typed (n)']],
    need: ['A device per pupil or pair, with CodeJump open'],
    plan: [
      { min: 8, title: 'Events everywhere', html: '<p>List events: the school bell, a doorbell, pressing a button on a game controller. <b>Ask:</b> what happens after each? The event is the trigger; the code is what happens.</p>' },
      { min: 8, title: 'Show me', html: '<p>Open the starter and talk to Nia. The starter has <b>when I type lamps in the chat</b>. Type <b>lamps</b> in the chat box (press T or Enter): the helper says “Lamps coming!”.</p>' },
      { min: 26, title: 'Your turn', html: '<p>Pupils put a <b>repeat n</b> inside the event, building a post 2 high with a lantern and moving on 3. They type <b>lamps 4</b>. Then <b>lamps 2</b> builds two more!</p><p>Answer: when I type lamps (n) { repeat n { place log left · move up 1 · place log left · move up 1 · place lantern left · move down 2 · move forward 3 } }.</p>' },
      { min: 11, title: 'More commands', html: '<p>Pupils add a second command of their own (e.g. “bench”, “flowers”). <b>Ask:</b> what is the difference between “when Run is clicked” and “when I type…”?</p>' },
      { min: 7, title: 'Plenary', html: '<p>Pupils explain event, trigger and parameter using their own command.</p>' }
    ],
    support: 'Give the post-building blocks; pupils put them in the repeat n.',
    stretch: 'Make a “dark” command that makes it night, and a “day” command. Use the number to change the post height.',
    assess: ['Explains what an event is', 'Builds code under a chat event', 'Uses the parameter n'],
    steps: [
      { t: 'Talk to Nia', d: 'Walk to Nia and press E.' },
      { t: 'Try the command', d: 'Press T (or Enter), type lamps and press Enter. What happens?' },
      { t: 'Repeat n', d: 'From Loops, put a repeat inside the event. From Variables, put n in its number.' },
      { t: 'Build a post', d: 'Inside: place a tree trunk left, move up, another trunk, move up, a lantern, move down 2, move forward 3.' },
      { t: 'Light it up', d: 'Type lamps 4 in the chat. Four lamp posts!' },
      { t: 'Your own command', d: 'Make another “when I type …” command of your own.' }
    ]
  },
  {
    id: 'academy-16-huts', unit: 'Robot Helper Academy · Block 3 · Lesson 16', title: 'My own block', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'Functions (procedures): pupils make their own block called hut that builds one beach hut and moves on, then use it three times. The main program becomes short and readable.',
    objective: 'We are learning to make our own blocks (functions) to reuse code.',
    success: ['I can make my own block with a name.', 'I can use (call) my block more than once.', 'I can explain why functions make programs easier to read and change.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['function', 'a named set of instructions you can use again (also called a procedure)'], ['define', 'make the block and say what it does'], ['call', 'use the block in your program'], ['decompose', 'break a big job into smaller named jobs']],
    need: ['A device per pupil or pair, with CodeJump open'],
    plan: [
      { min: 8, title: 'Named routines', html: '<p>A PE warm-up: “star jumps = jump, arms up, land, arms down”. Once we’ve defined star jumps, the coach just says “10 star jumps”. <b>Ask:</b> why is that easier?</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and talk to Sol. In <b>My blocks</b>, see the block <b>hut</b> (already defined, with one block inside) and the <b>hut</b> call under “when Run is clicked”. Show how to make a new one: drag out <b>to do something</b> from My blocks and type a name.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils fill in the hut definition: 3 columns of planks 3 high with a roof tile on top, then move on 3. The main program: hut · hut · hut.</p><p>Answer: hut = repeat 3 { repeat 3 { place planks left · move up 1 } · place roof tiles left · move down 3 · move forward 1 } · move forward 3.</p><p>In Python it is <code>def hut():</code> and <code>hut()</code>.</p>' },
      { min: 10, title: 'Change it once', html: '<p>Ask pupils to change the hut’s colour. <b>Ask:</b> how many places did you change? (One!) That is why functions help.</p>' },
      { min: 7, title: 'Plenary', html: '<p>Pupils explain define and call.</p>' }
    ],
    support: 'Give the column (inner loop) ready; pupils put it in the hut block and call it three times.',
    stretch: 'Make another block, flower_box, and call it between the huts.',
    assess: ['Defines a function', 'Calls it more than once', 'Explains the benefit'],
    steps: [
      { t: 'Talk to Sol', d: 'Walk to Sol and press E. What does a hut front look like?' },
      { t: 'Find your block', d: 'Open My blocks. The block “hut” is already made, with one block inside it.' },
      { t: 'Build one hut', d: 'Inside the hut block: 3 columns of planks, 3 high, with roof tiles on top — then move forward 3.' },
      { t: 'Test it', d: 'Press Run. Does one hut appear?' },
      { t: 'Use it again', d: 'From My blocks, add two more “hut” blocks under the first.' },
      { t: 'Change it once', d: 'Change the planks to another colour in the hut block. All three huts change!' }
    ]
  },
  {
    id: 'academy-17-towers', unit: 'Robot Helper Academy · Block 3 · Lesson 17', title: 'Towers of any height', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'Functions with inputs: one block, tower(height), builds light towers 3, 5 and 7 tall. Pupils use the block’s input inside it (inputs are added with the gear on the block).',
    objective: 'We are learning to give our own blocks inputs, so one block can do different things.',
    success: ['I can add an input to my own block.', 'I can use the input inside the block.', 'I can call my block with different values.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['input (parameter)', 'a value you give a block when you use it'], ['argument', 'the actual value, like 3 in tower(3)'], ['function', 'a named block you made'], ['generalise', 'make one solution work for many cases']],
    need: ['A device per pupil or pair, with CodeJump open'],
    plan: [
      { min: 8, title: 'One recipe, many sizes', html: '<p>“Make a sandwich with ___ slices of cheese.” <b>Ask:</b> do we need a new recipe for each number? Introduce <b>input</b>.</p>' },
      { min: 8, title: 'Show me', html: '<p>Open the starter and talk to Kai. The block <b>tower</b> has an input called <b>height</b>. Show how to use the height value inside, and how tower(3) passes 3 in.</p>' },
      { min: 26, title: 'Your turn', html: '<p>Pupils finish tower: repeat height { place stone bricks left · move up 1 } · place lantern left · move down height · move forward 5. Then call tower 3, tower 5, tower 7.</p><p>Each tower task ticks when the tower on its gold mark is the right height (with its lantern).</p>' },
      { min: 11, title: 'Compare', html: '<p>Compare with Lesson 16 (no input) and Lesson 14 (a variable). <b>Ask:</b> how is an input like a variable?</p>' },
      { min: 7, title: 'Plenary', html: '<p>Pupils write a call for a tower 10 tall and say what would happen.</p>' }
    ],
    support: 'Give the full tower block; pupils only change the numbers in the calls.',
    stretch: 'Add a second input, colour… or a gap input to change the move forward.',
    assess: ['Adds and uses an input', 'Calls the block with different arguments', 'Explains generalisation'],
    steps: [
      { t: 'Talk to Kai', d: 'Walk to Harbourmaster Kai and press E. How tall must the towers be?' },
      { t: 'Find tower', d: 'Open My blocks. The tower block has an input called height.' },
      { t: 'Use height', d: 'Inside tower: repeat height times — place stone bricks left, move up 1.' },
      { t: 'Lantern and back', d: 'Then place a lantern left, move down height, move forward 5.' },
      { t: 'Three towers', d: 'Under “when Run is clicked”: tower 3, tower 5, tower 7. Press Run.' },
      { t: 'Check the gold marks', d: 'Each tower should stand on a gold mark. The tasks tick when they are right.' },
      { t: 'Challenge', d: 'Add a second input to change the gap between towers.' }
    ]
  },
  {
    id: 'academy-18-district', unit: 'Robot Helper Academy · Block 3 · Lesson 18', title: 'Design your district', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'craft', tool: 'Build Lab (blocks)',
    summary: 'The final project: pupils plan and code their own part of Pebble Island using functions, variables and selection, then test, improve and present it.',
    objective: 'We are learning to design, write and improve a program that uses functions, variables and selection.',
    success: ['I can plan a program and split it into functions.', 'I can use a variable and an if in my own project.', 'I can test my project and improve it.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['design', 'a plan for what you will make'], ['decompose', 'split a big job into smaller parts'], ['function', 'a named block you made'], ['evaluate', 'judge how well it works and what to improve']],
    need: ['A device per pupil or pair, with CodeJump open', 'Squared paper for the plan'],
    plan: [
      { min: 10, title: 'Plan', html: '<p>Open the starter and talk to Mayor Juno. Pupils plan their district on squared paper and list the parts that repeat — each becomes a function (house, tree, lamp…).</p>' },
      { min: 30, title: 'Build', html: '<p>Pupils code their district. Tasks: at least 40 blocks in the plot, and a function, a variable and an if in the code. Hand building is allowed for decoration; the main structures should be coded.</p><p>Example idea: def house(size) builds a square of size; a variable counts houses; if it’s the 2nd house, make it red.</p>' },
      { min: 12, title: 'Show and tell', html: '<p>Pupils present: “My function … builds … My variable … My if decides …”. Peers give one star and one wish.</p>' },
      { min: 8, title: 'Graduation', html: '<p>Recap all three blocks: algorithms, sequence, loops, debugging, selection, operators, repeat until, variables, events, functions. Celebrate the Robot Helper Academy graduates!</p>' }
    ],
    support: 'Provide a house function to adapt; pupils add a variable and an if.',
    stretch: 'Use a function with two inputs. Add chat commands to build parts on demand.',
    assess: ['Plans before coding', 'Uses functions, a variable and selection purposefully', 'Evaluates and improves their program'],
    steps: [
      { t: 'Talk to Juno', d: 'Walk to Mayor Juno and press E.' },
      { t: 'Plan it', d: 'Draw your district on squared paper. Which parts repeat? Each one can be your own block.' },
      { t: 'Make a block', d: 'In My blocks, drag out “to do something”, name it (like house), put code inside and test it.' },
      { t: 'Add a variable', d: 'Use a variable — maybe for a size, or to count what you build.' },
      { t: 'Add an if', d: 'Use an if — maybe to choose a colour, or to build something only sometimes.' },
      { t: 'Check the tasks', d: '40 blocks in the plot, your own block, a variable and an if.' },
      { t: 'Show it off', d: 'Tell a partner what your blocks do. What would you improve?' }
    ]
  },
  {
    id: 'park-1-gate', unit: 'Park Designers · Block 1 · Lesson 1', title: 'Build the gate', ks: 'ks2', years: 'Year 3', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'The first Park Designers lesson. Pupils meet the 3D World and the park they will build this year, write the algorithm for a park gate as ordered steps, then finish the gate with “make” blocks: a second post, a bar across the top and a star.',
    objective: 'We are learning to write an algorithm as a sequence of steps and turn it into code.',
    success: ['I can write the steps to build something in a sensible order.', 'I can use a “make” block to add a shape to the world.', 'I can change x, y and z numbers to put a shape in the right place.', 'I can give a new thing its own name.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['algorithm', 'a set of exact steps, in order, to do a job'], ['sequence', 'the order the steps run in'], ['code', 'instructions a computer can follow'], ['x, y, z', 'three numbers for a place: across, up and forwards or backwards'], ['variable', 'a name the computer remembers, like postR']],
    need: ['A device per pupil or pair, with CodeJump open', 'Building bricks or three pencils and a ruler for the warm-up (optional)', 'Paper for writing the gate algorithm'],
    plan: [
      { min: 8, title: 'Build a gate', html: '<p>Hold up two pencils and a ruler (or bricks). <b>Ask:</b> how would you build a gate with these? Take steps from the class and write them on the board as numbered steps: 1. stand a post on the left, 2. stand a post on the right, 3. put a bar across the top. <b>Ask:</b> could we put the bar first? (Not in real life: it would fall.) Introduce <b>algorithm</b> and <b>sequence</b>.</p>' },
      { min: 8, title: 'Welcome to the park', html: '<p>Explain the unit: this year the class are park designers, and every lesson adds something to the park. Open the starter on the board. Show the two halves: blocks on the left, the world on the right. Drag on the world to look around. Click the pink post: it shows Move arrows. Find its block, <b>make box postL</b>, and change its <b>x</b> from −3 to 0: the post moves at once. Put it back to −3.</p>' },
      { min: 10, title: 'Show me: x, y and z', html: '<p>Stand up. Point left and right: that is <b>x</b>. Point up: <b>y</b>. Point forwards and back: <b>z</b>. On the board, show <b>Right-click → Duplicate</b> on the postL block, join the copy underneath, then <b>Variables → Create variable</b> “postR” and choose postR in the copy’s drop-down. Change x to 3. <b>Ask:</b> why does it need its own name? (So other blocks can tell the two posts apart.)</p>' },
      { min: 24, title: 'Your turn', html: '<p>Pupils follow the steps. The <b>Goals</b> list at the top right of the world ticks while the program runs, so they press <b>Run</b> to check.</p><p>Common bug: the bar is made at y 0, so it sits on the grass between the posts. The posts are 4 tall and a shape’s y is where its bottom sits, so the bar needs y 4. Another: a new block still says box1 or tree1 in its drop-down, so the goal can’t find postR, bar or star — choose the right name.</p><p>Answer: make box postR (pink, width 1 height 4 depth 1, at x 3 y 0 z 6); make box bar (width 7 height 1 depth 1, at x 0 y 4 z 6); make star (Star, size 1, at x 0 y 5 z 6).</p>' },
      { min: 10, title: 'Plenary', html: '<p>Read one finished program aloud as an algorithm, block by block. <b>Ask:</b> does the order of the blocks matter here? (The computer makes them all in a flash, so the gate looks the same — but a name must be made before another block can use it.) <b>Ask:</b> what number would put the star on the left post? Next lesson: a mascot who does something when you click it.</p>' }
    ],
    support: 'Pairs start with the postR block already made on the board for them to copy; they only change the name and x. Give a card that says “x = across, y = up, z = forwards”.',
    stretch: 'Put a cone on top of each post (Shapes → make cone, y 4). Add a second star on each end of the bar. Change the colours to make a park theme.',
    assess: ['Writes the gate steps in a sensible order', 'Adds a shape with a “make” block and a new name', 'Changes x, y or z to place a shape correctly and can explain which way each number moves it'],
    steps: [
      { t: 'Look around', d: 'Drag on the world to look around. Find the pink post. Its block is “make box postL” inside “when Run is clicked”.' },
      { t: 'Try a number', d: 'In the postL block, change x from -3 to 0. Watch the post move. Put it back to -3.' },
      { t: 'A second post', d: 'Right-click the postL block and choose Duplicate. Join the copy underneath. In Variables, press Create variable and type postR. Choose postR in the copy’s drop-down. Change x to 3.' },
      { t: 'The bar', d: 'From Shapes, drag “make box … colour …” under your posts. Create a variable called bar and choose it. Make it width 7, height 1, depth 1, at x 0 y 4 z 6.' },
      { t: 'Test it', d: 'Press Run. Look at the Goals list at the top right. Which goals have ticked?' },
      { t: 'The star', d: 'From Models, drag a “make” block under the bar. Create a variable called star and choose it. Pick the Star picture. Put it at x 0 y 5 z 6. Press Run.' },
      { t: 'Challenge', d: 'Put a cone on top of each post. What y number do they need?' }
    ]
  },
  {
    id: 'park-2-mascot', unit: 'Park Designers · Block 1 · Lesson 2', title: 'Meet the mascot', ks: 'ks2', years: 'Year 3', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'Events: the park’s mascot stands by the gate but does nothing. Pupils add a “when mascot is clicked” block so that clicking the mascot makes it wave and say “Welcome to the park!”.',
    objective: 'We are learning to use an event to start some code.',
    success: ['I can explain what an event is.', 'I can use a “when … is clicked” block.', 'I can make a character move and speak when it is clicked.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['event', 'something that happens, like a click, that starts some code'], ['input', 'what we give the computer, like a click or a key press'], ['output', 'what the computer does back, like a wave or a speech bubble'], ['animation', 'a movement a character can play, like wave or dance']],
    need: ['A device per pupil or pair, with CodeJump open'],
    plan: [
      { min: 8, title: 'What starts it?', html: '<p>Ring a bell or knock on the door. <b>Ask:</b> what happens at home when someone rings the doorbell? (Someone answers.) The ring is an <b>event</b>: something happens, and that starts an action. List events the children know: a school bell, pressing a lift button, tapping an app. Recap last lesson: our code so far ran only <b>when Run is clicked</b> — that is an event too.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter: the gate from last lesson and a cat mascot. Press <b>Run</b> and click the mascot: nothing happens. <b>Ask:</b> why not? (No code tells it what to do.) From <b>Events</b>, drag <b>when … is clicked</b> into an empty space (not inside “when Run is clicked”) and choose <b>mascot</b> in its drop-down. From <b>Characters</b>, drag the animation block inside and choose mascot, wave and once. Run and click.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the steps and watch the Goals tick. Remind them that clicks only work while the program is running: in the edit view, clicking a thing just selects it to move.</p><p>Common bugs: the event block still says box1, so clicking the mascot does nothing; the wave block says player, not mascot; the new blocks were put inside “when Run is clicked”, so the mascot waves straight away without a click.</p><p>Answer: when mascot is clicked { mascot wave once; mascot says “Welcome to the park!” for 3 seconds }.</p>' },
      { min: 9, title: 'Input and output', html: '<p>On the board draw: <b>input</b> (click the mascot) → <b>code</b> → <b>output</b> (wave, speech bubble). <b>Ask:</b> what is the input? What is the output? Pupils who finish add a second event (a click on a post that changes its colour) and say its input and output.</p>' },
      { min: 8, title: 'Plenary', html: '<p><b>Ask:</b> what is the difference between “when Run is clicked” and “when mascot is clicked”? (One runs at the start; one waits for a click, and runs every time you click.) Next lesson: two characters having a conversation, in the right order.</p>' }
    ],
    support: 'Show the finished event block on a card for pupils to copy. Pairs take turns: one drags, one checks the drop-downs.',
    stretch: 'Make the mascot do a different animation each time you click something else: add “when postL is clicked” to make it dance. Add a “set colour of … to …” block to the bar when it is clicked.',
    assess: ['Explains an event as something that starts code', 'Uses “when … is clicked” with the right object chosen', 'Names the input and output of their program'],
    steps: [
      { t: 'Try it', d: 'Press Run and click the mascot. Nothing happens — yet! Press Stop.' },
      { t: 'An event', d: 'From Events, drag “when … is clicked” into an empty space. Click its drop-down and choose mascot.' },
      { t: 'Wave', d: 'From Characters, drag the animation block inside it. Choose mascot, then wave, then once.' },
      { t: 'Say hello', d: 'From Looks, drag “… says … for … seconds” under the wave. Choose mascot. Type Welcome to the park! and make it 3 seconds.' },
      { t: 'Test it', d: 'Press Run, then click the mascot. Does it wave and speak? Check the Goals list.' },
      { t: 'Again!', d: 'Click the mascot again. The event runs every time you click.' },
      { t: 'Challenge', d: 'Add “when postL is clicked”. Make the mascot do a dance when you click the post.' }
    ]
  },
  {
    id: 'park-3-chat', unit: 'Park Designers · Block 1 · Lesson 3', title: 'Help a visitor', ks: 'ks2', years: 'Year 3', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'Sequence and timing: a visitor asks the park guide the way. Pupils build a conversation in the right order with “says … for … seconds” blocks, then make the visitor walk through the gate.',
    objective: 'We are learning to put steps in the right order and use timing so they happen one after another.',
    success: ['I can put speech blocks in the right order to make a conversation.', 'I can explain why “says … for … seconds” waits before the next block.', 'I can make a character walk to a place with a glide block.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['sequence', 'steps that run one after another, in order'], ['timing', 'how long each step takes before the next one starts'], ['glide', 'move smoothly to a place over a number of seconds'], ['predict', 'say what you think will happen before you test']],
    need: ['A device per pupil or pair, with CodeJump open', 'Speech-bubble cards for the warm-up (optional)'],
    plan: [
      { min: 7, title: 'Act it out', html: '<p>Two pupils act a visitor asking the way. Then give them the lines on cards in the wrong order (“Thank you!” first). <b>Ask:</b> what went wrong? A conversation is a <b>sequence</b>. Now ask them to say all their lines at the same time. <b>Ask:</b> why is that no good? Each line needs <b>time</b> before the next.</p>' },
      { min: 8, title: 'Show me', html: '<p>Open the starter: the gate, a guide and a visitor. Press <b>Run</b> and click the visitor: “Where are the rides?”. Show the code under <b>when visitor is clicked</b>. Point out the <b>for 2 seconds</b>: the bubble stays for 2 seconds, and the next block waits until it has gone.</p>' },
      { min: 10, title: 'Predict', html: '<p>On the board, add <b>guide says “Through the gate and turn left!”</b> with the plain <b>… says …</b> block (no seconds), then <b>visitor says “Thank you!” for 2 seconds</b>. <b>Ask:</b> predict — what will happen? Run it. (The guide’s bubble and the thank you appear at once: the plain block does not wait.) Swap it for <b>says … for … seconds</b> and run again.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the steps. The goal for three “says … for … seconds” blocks needs all three inside the <b>when visitor is clicked</b> block.</p><p>Common bugs: a speech block with the wrong character chosen; the glide is above the speech blocks, so the visitor walks off before saying thank you; the walk animation is left out, so the visitor slides.</p><p>Answer: when visitor is clicked { visitor says “Where are the rides?” for 2 seconds; guide reach once; guide says “Through the gate and turn left!” for 2 seconds; visitor says “Thank you!” for 2 seconds; visitor walk over and over; glide visitor to x 2 y 0 z 9 in 3 secs }.</p>' },
      { min: 10, title: 'Plenary', html: '<p>Read a finished program aloud while pupils act it. <b>Ask:</b> which block makes the visitor wait? What would happen if the glide came first? (They would walk away before the guide answers.) Next lesson: we use physics to make things fall.</p>' }
    ],
    support: 'Give the three lines on cards to order before coding. Pupils add one speech block at a time and press Run after each.',
    stretch: 'Make the conversation longer: the guide says “Have fun!” as the visitor walks off. Give the guide an animation (try wave or nod yes). Make the visitor walk back again with a second glide.',
    assess: ['Orders speech blocks to make a sensible conversation', 'Explains that “for … seconds” waits before the next block runs', 'Uses a glide block with x, y and z to move a character to a place'],
    steps: [
      { t: 'Try it', d: 'Press Run and click the visitor. What does the visitor ask?' },
      { t: 'The guide answers', d: 'From Looks, drag “… says … for … seconds” under the visitor’s question, inside “when visitor is clicked”. Choose guide. Type Through the gate and turn left!' },
      { t: 'Say thank you', d: 'Add another “… says … for … seconds” underneath. Choose visitor. Type Thank you!' },
      { t: 'Test the order', d: 'Press Run and click the visitor. Do they take turns? If not, check the order and the names.' },
      { t: 'Start walking', d: 'From Characters, add the animation block at the end. Choose visitor, walk and over and over.' },
      { t: 'Through the gate', d: 'From Motion, add “glide … to x y z in … secs” at the very end. Choose visitor. Make it x 2 y 0 z 9 in 3 secs. Press Run and click the visitor.' },
      { t: 'Check the goals', d: 'Do all four goals tick? If not, read your blocks from the top, one at a time.' },
      { t: 'Challenge', d: 'Make the guide say “Have fun!” as the visitor walks away.' }
    ]
  },
  {
    id: 'park-4-balloons', unit: 'Park Designers · Block 1 · Lesson 4', title: 'Pop the balloons', ks: 'ks2', years: 'Year 3', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'Events and physics: two balloons float over the park, each holding a gift (a heart and a doughnut). Clicking the red balloon only plays a pop. Pupils make each balloon hide when it is clicked and make its gift “fall and bump”, so it drops to the ground.',
    objective: 'We are learning to use physics in our code and to choose which event starts it.',
    success: ['I can make an object disappear with a “hide” block.', 'I can make an object fall with the “fall and bump” block.', 'I can choose the right event to start the fall.', 'I can copy an event and change it for a second object.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['physics', 'how things move in the real world: falling, bumping, bouncing'], ['gravity', 'the pull that makes things fall to the ground'], ['event', 'something that happens, like a click, that starts some code'], ['hide', 'make something disappear from view']],
    need: ['A device per pupil or pair, with CodeJump open', 'A balloon or a ball for the warm-up'],
    plan: [
      { min: 6, title: 'What goes up', html: '<p>Hold up a balloon (or a ball). <b>Ask:</b> if a balloon holding a toy pops, what happens to the toy? (It falls.) Introduce <b>gravity</b>. <b>Ask:</b> what would happen if there were no gravity? In the 3D World, things only feel gravity when we tell them to.</p>' },
      { min: 8, title: 'Show me', html: '<p>Open the starter: a red balloon holding a heart and a blue balloon holding a doughnut. Press <b>Run</b> and click the red balloon: pop! But the balloon is still there and the heart stays in the air. Show the code: <b>when balloon1 is clicked → play sound pop</b>. <b>Ask:</b> what else should happen when a balloon pops? (It disappears and the gift falls.) Show <b>hide …</b> in <b>Looks</b> and <b>make … fall and bump</b> in <b>Physics</b>.</p>' },
      { min: 8, title: 'Predict', html: '<p>On the board, put <b>hide balloon1</b> under the pop. <b>Ask:</b> predict — will the heart fall now? Run it and click. (No: the heart still floats. Hiding the balloon does not tell the heart to fall; the computer only does what our blocks say.) Then put <b>make gift1 fall and bump</b> inside <b>when Run is clicked</b>. <b>Ask:</b> when will it fall? Run it. (Straight away, before anyone clicks.) Move it into <b>when balloon1 is clicked</b>.</p>' },
      { min: 26, title: 'Your turn', html: '<p>Pupils follow the steps. The Goals tick when the red balloon is clicked and each gift reaches the ground. The hide goal needs two hide blocks, one in each click event.</p><p>Common bugs: the drop-down still says box1, or the hide block says gift1 instead of balloon1; after Duplicate, the copy still says balloon1, so clicking the blue balloon does nothing; the copy still says gift1, so the doughnut never falls; the fall block is in “when Run is clicked”, so the gifts drop before the click.</p><p>Answer: when balloon1 is clicked { play sound pop; hide balloon1; make gift1 fall and bump }. when balloon2 is clicked { play sound pop; hide balloon2; make gift2 fall and bump }.</p>' },
      { min: 12, title: 'Plenary', html: '<p><b>Ask:</b> why didn’t the heart fall when the balloon was hidden? (Each object needs its own instruction.) Which event starts the fall, and why? Pupils who tried bounciness show their gifts bouncing. Next lesson: a penalty kick, where we push a ball into a goal.</p>' }
    ],
    support: 'Pupils finish the red balloon first and test. Then they right-click the whole “when balloon1 is clicked” block, choose Duplicate and change only the names: balloon2 (twice) and gift2. Give a card: click → pop → hide → fall.',
    stretch: 'Add “set bounciness of gift1 to 80 %” (Physics) before it falls. Put “wait 1 seconds” between the hide and the fall: what changes? Add a third balloon and gift with new names, balloon3 and gift3.',
    assess: ['Uses “hide” and “make … fall and bump” on the right objects', 'Puts the physics inside the click event, and explains why', 'Makes a second click event for a second object'],
    steps: [
      { t: 'Try it', d: 'Press Run and click the red balloon. Pop! Does it disappear? Does the heart fall? Press Stop.' },
      { t: 'Pop!', d: 'From Looks, drag “hide …” under “play sound pop”, inside “when balloon1 is clicked”. Choose balloon1.' },
      { t: 'Drop the gift', d: 'From Physics, drag “make … fall and bump” under the hide block. Choose gift1.' },
      { t: 'Test it', d: 'Press Run and click the red balloon. Does it disappear? Does the heart fall to the ground?' },
      { t: 'The blue balloon', d: 'Right-click “when balloon1 is clicked” and choose Duplicate. In the copy, change balloon1 to balloon2 (two places) and gift1 to gift2.' },
      { t: 'Test both', d: 'Press Run and click both balloons. Check the Goals list.' },
      { t: 'Predict', d: 'What will happen if “make gift1 fall and bump” goes inside “when Run is clicked”? Say it, try it, then put it back.' },
      { t: 'Challenge', d: 'From Physics, add “set bounciness of gift1 to 80 %” before it falls. Does the heart bounce?' }
    ]
  },
  {
    id: 'park-5-kick', unit: 'Park Designers · Block 1 · Lesson 5', title: 'Penalty kick', ks: 'ks2', years: 'Year 3', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'Physics and forces: a football sits on the penalty spot in front of a goal. Clicking it gives the ball a tiny push that only rolls it a little way. Pupils predict and test, changing one number at a time in “push football by x y z”, so the ball lifts off the ground (y) and travels forward (z) into the goal.',
    objective: 'We are learning that a push (a force) has a direction and a size, and to change one number at a time to control it.',
    success: ['I can explain that a push has a direction and a size.', 'I can say what the y and z numbers in a push do.', 'I can predict, then test, changing one number at a time.', 'I can use my results to score a goal.'],
    curriculum: ['design', 'reason', 'predict'],
    words: [['force', 'a push or a pull'], ['direction', 'which way something goes: across (x), up (y) or forwards (z)'], ['size', 'how strong a push is: a bigger number is a stronger push'], ['predict', 'say what you think will happen before you test'], ['fair test', 'change only one thing at a time, so you know what made the difference']],
    need: ['A device per pupil or pair, with CodeJump open', 'A soft ball for the warm-up', 'A results table on paper (push y, push z, I predict, what happened)'],
    plan: [
      { min: 6, title: 'Kick it', html: '<p>Roll a soft ball gently, then harder. <b>Ask:</b> what changed? (The <b>size</b> of the <b>push</b>, the <b>force</b>.) Now roll it along the floor, then throw it gently up and forwards. <b>Ask:</b> what else changed? (The <b>direction</b>.) A push always has a direction and a size.</p>' },
      { min: 8, title: 'Show me', html: '<p>Open the starter: a pitch, a goal and a white football on the spot. Press <b>Run</b> and click the football: it rolls a tiny bit. Show the code: <b>when football is clicked → push football by x 0 y 0 z 2</b>. Recap x (across), y (up) and z (forwards). The goal is straight ahead along z, about 13 away, and the crossbar is about 2.4 high. The ball already has <b>make football fall and bump</b> in “when Run is clicked”, because only falling things can be pushed.</p>' },
      { min: 10, title: 'Predict', html: '<p>Draw a results table on the board: push y, push z, I predict, what happened. <b>Ask:</b> predict — what will z 6 do? Test it. To try again, press <b>Run</b>: the ball goes back on the spot. Then <b>ask:</b> what will y 4 do, with z still 2? Introduce the <b>fair test</b>: change one number at a time, so you know which number made the difference.</p>' },
      { min: 26, title: 'Experiment', html: '<p>Pupils change z until the ball reaches the goal, then change y so it lifts off the ground, recording each try in the table. The Goals tick when the ball is clicked, when it lifts higher than 1.2 and when it goes in the goal.</p><p>Common bugs: changing x instead of y or z (the ball goes wide of the post); a huge y (the ball flies over the crossbar, or straight up and back down); too small a z (the ball stops short); clicking the ball again without pressing Run, so it is pushed from wherever it stopped.</p><p>Answer: when football is clicked { play sound boing; push football by x 0 y 4 z 10 }. Other numbers work too: pupils find their own by testing.</p>' },
      { min: 10, title: 'Plenary', html: '<p>Share tables. <b>Ask:</b> which number made the ball go further? Which made it lift? What happened when a number was much too big? Did changing one number at a time help? Next lesson is a project: pupils design their own welcome zone using everything from Block 1.</p>' }
    ],
    support: 'Give a partly filled table with z values to try first (4, 8, 12), then y values (2, 4, 6). Pupils change only z, then only y.',
    stretch: 'Score in a corner: try a small x as well, like 1 or -1. Add “set bounciness of football to 60 %” and watch it bounce off the net. Try “set weight of football to 5 kg”: does the same push still score?',
    assess: ['Explains that a push has a direction and a size', 'Says which number pushes up and which pushes forwards', 'Predicts, changes one number at a time and records the result', 'Uses earlier results to choose better numbers'],
    steps: [
      { t: 'Try it', d: 'Press Run and click the football. How far does it go?' },
      { t: 'Find the push', d: 'Find “push football by x 0 y 0 z 2” inside “when football is clicked”. z pushes forwards.' },
      { t: 'Predict', d: 'What will z 6 do? Say it first. Change z to 6, press Run and click the ball. Write down what happened.' },
      { t: 'Reach the goal', d: 'Keep changing z until the ball gets to the goal. Press Run before each try.' },
      { t: 'Lift it', d: 'y pushes up. Change y to 4. Predict, then test. Does the goal “Chip it” tick?' },
      { t: 'Score!', d: 'Change one number at a time until the ball goes into the goal, under the crossbar.' },
      { t: 'Add a sound', d: 'From Sound, drag “play sound …” to the top of “when football is clicked”. Choose boing.' },
      { t: 'Challenge', d: 'Can you score in a corner? Try a small x, like 1 or -1.' }
    ]
  },
  {
    id: 'park-6-welcome', unit: 'Park Designers · Block 1 · Lesson 6', title: 'Project: the welcome zone', ks: 'ks2', years: 'Year 3', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'The Block 1 project: pupils plan and build their own welcome zone by the park gate, with a character that moves and speaks when clicked and something that falls or flies when clicked. The Goals list is the success criteria.',
    objective: 'We are learning to design a program with events, sequence and physics, and to test it against a plan.',
    success: ['I can plan what my program will do before I code it.', 'I can use two click events to start different actions.', 'I can use animation, speech and physics in my own design.', 'I can test my program and improve it.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['design', 'a plan of what you will make and how it will work'], ['event', 'something that happens, like a click, that starts some code'], ['sequence', 'steps in order'], ['evaluate', 'say what works well and what could be better']],
    need: ['A device per pupil or pair, with CodeJump open', 'A planning sheet: a drawing box and “When I click … then …” lines (two of them)'],
    plan: [
      { min: 7, title: 'Recap Block 1', html: '<p>Recap on the board: <b>make</b> blocks and x y z (the gate), <b>when … is clicked</b> (the mascot), <b>says … for … seconds</b> in order (the visitor), <b>hide</b> and <b>fall and bump</b> (the balloons) and <b>push</b> (the football). Show the project goals in the starter: a character, two clicks, an animation, speech, and something that falls or flies when clicked.</p>' },
      { min: 10, title: 'Design on paper', html: '<p>Pupils draw their welcome zone and write two lines: “When I click <i>the host</i>, then <i>it dances and says Have a great day!</i>” and “When I click <i>the bell</i>, then <i>the present falls</i>.” <b>Ask:</b> what needs a name? (Everything you click or move.) Remind them a falling thing must start up in the air (y bigger than 0).</p>' },
      { min: 25, title: 'Build and test', html: '<p>Pupils build from their plans and press <b>Run</b> often. Circulate and ask: “Which goal is next? Which block will tick it?”</p><p>Common bugs: a new character keeps the name player in its drop-down; the falling thing starts at y 0 so it has nowhere to fall; the physics block sits in “when Run is clicked”, so that goal won’t tick; both events use the same object.</p><p>An example answer: make character host (Monkey) at x 0 y 0 z 2; make gift (Diamond) at x 3 y 3 z 3; make box bell at x −3 y 0 z 2. when host is clicked { host dance 1 once; host says “Have a great day!” for 2 seconds }. when bell is clicked { play sound win; make gift fall and bump }.</p>' },
      { min: 12, title: 'Share and evaluate', html: '<p>Pairs swap devices and try each other’s zone without being told what to click. <b>Ask:</b> could you find the things to click? Did it do what the plan said? Each pupil gives one star (something that works well) and one wish (something to improve), then makes one improvement.</p>' },
      { min: 6, title: 'Plenary', html: '<p>Two or three pupils show their zones on the board and read their plan, then their code. Celebrate the end of Block 1: algorithms, sequence, events, timing and physics. Next block: rides that move, with loops.</p>' }
    ],
    support: 'Use the planning sheet with a ready choice: “When I click the host, it waves and says hello. When I click the bell, the gift falls.” Pupils copy the mascot code from lesson 2 as a model.',
    stretch: 'Add a third event and a conversation between two characters. Use push to send something flying across the zone, and a sound when it starts.',
    assess: ['Writes a plan with two “When I click …, then …” events', 'Builds two working click events with animation, speech and physics', 'Tests against the plan and the goals, and makes an improvement'],
    steps: [
      { t: 'Plan it', d: 'On paper, draw your welcome zone. Write two lines: “When I click …, then …”.' },
      { t: 'Add a character', d: 'From Characters, drag “make character …” inside “when Run is clicked”. Create a variable for its name, like host. Put it in front of the gate, at z 2.' },
      { t: 'First click', d: 'From Events, add “when … is clicked” and choose your character. Inside, add an animation and a “says … for … seconds” block.' },
      { t: 'Something to drop', d: 'Make a second thing up in the air (y 3) and a thing to click, like a bell. Give each its own name.' },
      { t: 'Second click', d: 'Add another “when … is clicked” for the bell. Inside, use “make … fall and bump” or “push … by x y z”.' },
      { t: 'Test it', d: 'Press Run and click both things. Use the Goals list to check every part of your design.' },
      { t: 'Swap and try', d: 'Let a partner try your zone. What did they like? What will you improve?' },
      { t: 'Challenge', d: 'Add a third click event, or a sound from the Sound category.' }
    ]
  },
  {
    id: 'park-7-spinner', unit: 'Park Designers · Block 2 · Lesson 1', title: 'The spinner', ks: 'ks2', years: 'Year 4', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'The first lesson on repetition. The spinner ride only turns a quarter of the way round, because its code copies the same two blocks three times. Pupils replace the copies with a repeat loop and work out how many 30° turns make one full spin.',
    objective: 'We are learning to use a repeat loop to run the same blocks a set number of times.',
    success: ['I can spot blocks that repeat in a program.', 'I can put blocks inside a repeat loop.', 'I can work out how many times the loop needs to repeat.', 'I can explain why the wait goes inside the loop.'],
    curriculum: ['ssr', 'design', 'reason'],
    words: [['loop', 'code that runs again and again'], ['repeat', 'a loop that runs a set number of times'], ['inside', 'the blocks in the loop’s mouth are the ones that repeat'], ['degrees', 'how far something turns: 360 degrees is a full circle']],
    need: ['A device per pupil or pair, with CodeJump open', 'Optional: a paper clock face or protractor to show 30° turns'],
    plan: [
      { min: 8, title: 'Turn on the spot', html: '<p>Everyone stands up. Say: “Turn a small step to the right… and again… and again.” Tell them each small step is <b>30 degrees</b>. <b>Ask:</b> how many small steps until you are facing the front again? Count it out together: 12. Write on the board: <b>turn 30, turn 30, turn 30…</b> (twelve times). <b>Ask:</b> how could I write that in a shorter way? (“Repeat 12 times: turn 30.”) That is a <b>loop</b>.</p>' },
      { min: 10, title: 'Meet the spinner', html: '<p>Introduce Block 2: last block we opened the park; now we build rides that move, and every ride needs a loop. Open the starter on the board. Before Run you see the edit view: the world as it starts. Press <b>Run</b>, then click the pink arm. It only turns a quarter of the way. Show the code under <b>when arm is clicked</b>: <b>turn arm by x 0 y 30 z 0 degrees</b>, <b>wait 0.1 seconds</b>, three times over. <b>Ask:</b> how many more copies would a full spin need? (Nine more pairs: 24 blocks in all.) Point out the Goals checklist at the top right: “One full spin”.</p>' },
      { min: 10, title: 'Show me a repeat', html: '<p>Model it on the board. Open <b>Control</b> and drag out <b>repeat 10 times</b>. Drag ONE turn block and ONE wait block <b>inside</b> its mouth. Delete the other copies (drag them to the bin). Put the repeat inside <b>when arm is clicked</b>. <b>Ask:</b> what number goes in the repeat? (12, because 12 × 30 = 360.) Press Run and click the arm. Watch the first goal tick as soon as the turn is inside the repeat: goals about which blocks you used tick straight away.</p>' },
      { min: 22, title: 'Your turn', html: '<p>Pupils follow the steps. All three goals tick when the arm makes one full spin with a wait inside the loop.</p><p>Common bugs: the repeat still says 10, so it turns 300° and stops just short (the spin goal stays empty); the wait is left outside the loop, so the arm flicks round in a blink (the third goal stays empty); old copies of the turn are still under the loop, so it turns too far. Pressing Run again starts the ticks again, so pupils can test after every change.</p><p>Answer: when arm is clicked → repeat 12 times { turn arm by x 0 y 30 z 0 degrees; wait 0.1 seconds }.</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> if each turn was 15 degrees, how many times would we repeat? (24.) If each turn was 90? (4.) What would happen with repeat 24 and turn 30? (Two full spins.) Which is easier to change: 24 copied blocks or one repeat? Next lesson: a loop with a whole sequence inside it.</p>' }
    ],
    support: 'Give pupils the repeat already joined under “when arm is clicked”; they move the turn and wait inside and choose the number from a card showing 30 + 30 + 30… = 360.',
    stretch: 'Make the spinner go two full spins, then spin back the other way (try y -30). Change the wait to make it faster or slower. Add a “play sound” before the loop.',
    assess: ['Identifies the turn and wait as the repeating part', 'Puts blocks inside a repeat loop and removes the copies', 'Works out 12 × 30 = 360 to choose the loop count'],
    steps: [
      { t: 'Try the ride', d: 'Press Run, then click the pink arm. How far does it turn? Press Stop.' },
      { t: 'Read the code', d: 'Look under “when arm is clicked”. Which two blocks are copied again and again?' },
      { t: 'Get a loop', d: 'Open Control and drag “repeat 10 times” into the code area.' },
      { t: 'Put them inside', d: 'Drag one “turn arm by …” block and one “wait 0.1 seconds” block INSIDE the repeat. Drag the other copies to the bin.' },
      { t: 'Join it up', d: 'Put the repeat inside “when arm is clicked”.' },
      { t: 'How many times?', d: 'Each turn is 30 degrees. A full circle is 360. Change 10 to the right number.' },
      { t: 'Test it', d: 'Press Run and click the arm. Keep changing and testing until all the Goals tick.' },
      { t: 'Challenge', d: 'Make it spin twice, then spin back the other way.' }
    ]
  },
  {
    id: 'park-8-droptower', unit: 'Park Designers · Block 2 · Lesson 2', title: 'The drop tower', ks: 'ks2', years: 'Year 4', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'A loop can repeat a whole sequence, not just one block. The drop tower’s seat rises slowly and drops fast, but only once. Pupils put the up-wait-drop sequence inside a repeat so the ride goes three times, and predict what happens when the order inside the loop changes.',
    objective: 'We are learning to repeat a sequence of steps, in the right order, with a loop.',
    success: ['I can put a sequence of several blocks inside a loop.', 'I can predict what will happen if the order inside the loop changes.', 'I can use a wait to make a ride pause at the right moment.'],
    curriculum: ['ssr', 'predict', 'design'],
    words: [['sequence', 'steps that run one after another, in order'], ['loop', 'code that runs again and again'], ['glide', 'move smoothly to a place over some seconds'], ['predict', 'say what you think will happen before you test']],
    need: ['A device per pupil or pair, with CodeJump open', 'Mini whiteboards for predictions (optional)'],
    plan: [
      { min: 7, title: 'Body loop', html: '<p>Play a “drop tower” game. Everyone crouches. Say: “Rise up slowly… wait at the top… drop down fast!” Do it again, and again. <b>Ask:</b> what were the steps? Write them as a sequence: <b>rise, wait, drop</b>. <b>Ask:</b> how can I say “do it three times” without writing it out three times? (Repeat 3 times: rise, wait, drop.) Recap last lesson: the blocks inside the loop are the ones that repeat.</p>' },
      { min: 8, title: 'Predict the starter', html: '<p>Open the starter on the board. Read the code under <b>when seat is clicked</b>: <b>glide seat to x 0 y 9 z 3 in 3 secs</b>, then <b>glide seat to x 0 y 0 z 3 in 0.5 secs</b>. <b>Ask:</b> predict: what will the seat do? Why is one glide 3 seconds and the other 0.5? (Up slowly, down fast.) Press <b>Run</b> and click the yellow seat to check. Show the Goals: “Three drops”.</p>' },
      { min: 10, title: 'Show me', html: '<p>On the board, drag <b>repeat 10 times</b> from <b>Control</b> into <b>when seat is clicked</b> and move BOTH glides inside it. Change 10 to 3. Then add <b>wait 1 seconds</b> between the two glides so riders wait at the top. Read the loop aloud as a sequence: “up, wait, drop; up, wait, drop; up, wait, drop.” Mention that <b>play sound</b> (in <b>Sound</b>) can go inside the loop too: a scream at the top!</p>' },
      { min: 25, title: 'Your turn and predict', html: '<p>Pupils follow the steps until the three Goals tick. Then set a predict task: “Move the wait so it comes AFTER the drop. Predict, then test.” (The seat waits at the bottom instead of the top.) “Put only the up-glide inside the loop. Predict.” (It rises once, the next two glides go to the same place so nothing moves, then it drops once.)</p><p>Common bugs: the wait is outside the loop (the second goal stays empty); one glide is left outside the loop (the first goal stays empty); the seat goes up and down so fast you cannot see it (a glide time of 0).</p><p>Answer: when seat is clicked → repeat 3 times { glide seat to x 0 y 9 z 3 in 2 secs; wait 1 seconds; play sound boing; glide seat to x 0 y 0 z 3 in 0.5 secs }.</p>' },
      { min: 10, title: 'Plenary', html: '<p>Show two loops on the board with the same blocks in a different order. <b>Ask:</b> do they do the same thing? Why not? The order inside a loop matters just as much as in any sequence. Next lesson: a loop that never stops.</p>' }
    ],
    support: 'Give pupils a card with the loop drawn out: repeat 3 → glide up → wait 1 → glide down. They match the blocks to the card.',
    stretch: 'Make each drop a surprise: different wait times at the top. Make the seat stop halfway down for a moment before the final drop. Add a second seat on the other side of the tower.',
    assess: ['Puts a multi-block sequence inside a repeat', 'Writes a prediction before testing a change in order', 'Explains why the wait must be between the two glides'],
    steps: [
      { t: 'Predict', d: 'Read the code under “when seat is clicked”. What will the seat do? Press Run and click the seat to check.' },
      { t: 'Get a loop', d: 'Open Control. Drag “repeat 10 times” inside “when seat is clicked”.' },
      { t: 'Both glides inside', d: 'Drag BOTH “glide seat to …” blocks inside the repeat, up first, then down.' },
      { t: 'Three drops', d: 'Change 10 to 3.' },
      { t: 'Wait at the top', d: 'Put a “wait 1 seconds” block between the two glides.' },
      { t: 'Test it', d: 'Press Run and click the seat. Keep testing until all the Goals tick.' },
      { t: 'Add a sound', d: 'Open Sound and put “play sound” inside the loop, just before the drop.' },
      { t: 'Challenge', d: 'Move the wait to after the drop. Predict what will happen, then test it.' }
    ]
  },
  {
    id: 'park-9-lights', unit: 'Park Designers · Block 2 · Lesson 3', title: 'Carousel lights', ks: 'ks2', years: 'Year 4', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'Pupils meet the forever loop. The carousel’s bulbs light up once and then stay the same. Pupils use a forever loop with random colours and a wait so the lights keep changing for as long as the park is open, and compare forever with repeat.',
    objective: 'We are learning to use a forever loop, and to choose between forever and repeat.',
    success: ['I can use a forever loop to keep something happening.', 'I can explain the difference between forever and repeat.', 'I can use a wait so I can see each change.'],
    curriculum: ['ssr', 'reason', 'design'],
    words: [['forever', 'a loop that never stops until you press Stop'], ['repeat', 'a loop that runs a set number of times'], ['random', 'picked by chance, so you can’t know it before'], ['wait', 'pause for some seconds before the next block']],
    need: ['A device per pupil or pair, with CodeJump open'],
    plan: [
      { min: 6, title: 'What never stops?', html: '<p><b>Ask:</b> what things go round and round and never stop while they are switched on? (Traffic lights, a lighthouse, a clock’s second hand, fairground lights.) Last two lessons our loops had a number. <b>Ask:</b> what number would a lighthouse need? There isn’t one: it should go on <b>forever</b>.</p>' },
      { min: 8, title: 'The carousel', html: '<p>Open the starter. The code under <b>when Run is clicked</b> makes the carousel, its roof and three white bulbs (bulb1, bulb2, bulb3), then <b>set colour of bulb1 to</b> yellow. Press <b>Run</b>. <b>Ask:</b> how many times does bulb1 change? (Once.) Point out that nothing flashes in the edit view before Run; loops only run when you press Run.</p>' },
      { min: 10, title: 'Show me forever', html: '<p>Open <b>Control</b> and drag <b>forever</b> to the very bottom of <b>when Run is clicked</b>, after the make blocks. Show that forever has no bump underneath: nothing can come after it, because it never finishes. Open <b>Looks</b> and drag the ready-made <b>set colour of … to random colour</b> block inside, and pick bulb1 in its drop-down. Add copies for bulb2 and bulb3, then <b>wait 0.3 seconds</b>. Press Run.</p>' },
      { min: 26, title: 'Your turn', html: '<p>Pupils follow the steps. The Goals tick when there is a forever loop with a wait inside it and bulb1 and bulb3 have each changed colour five times.</p><p>Common bugs: the colour blocks are under the forever, not inside it (they cannot join there, so they are not part of the program); no wait, so the bulbs flicker too fast to see and the wait goal stays empty; the old “set colour of bulb1 to yellow” is left above the loop: that is fine, it just runs once first. <b>Ask:</b> would “repeat 10 times” work instead? (Yes, but the lights would stop after 3 seconds.)</p><p>Answer: at the end of when Run is clicked → forever { set colour of bulb1 to random colour; set colour of bulb2 to random colour; set colour of bulb3 to random colour; wait 0.3 seconds }.</p>' },
      { min: 10, title: 'Plenary', html: '<p>Sort examples on the board into “repeat” or “forever”: brushing teeth 30 times, a heartbeat, clapping 5 times, a lighthouse, a spinner that spins once. <b>Ask:</b> how do you stop a forever loop in CodeJump? (Press Stop.) Next lesson: a ride whose loop has bugs in it.</p>' }
    ],
    support: 'Pupils start with just bulb1: a forever loop with one “set colour” and one wait. When that works, add the others.',
    stretch: 'Make the bulbs take turns: bulb1 yellow, wait, bulb2 yellow, wait… Make the whole carousel turn forever too (turn carousel by y 2, inside the loop). Add more bulbs round the edge.',
    assess: ['Places a forever loop at the end of a script', 'Explains when to choose forever and when to choose repeat', 'Keeps a wait inside the loop so each change can be seen'],
    steps: [
      { t: 'Look at the lights', d: 'Press Run. bulb1 turns yellow once and then stays yellow. Press Stop.' },
      { t: 'Get forever', d: 'Open Control. Drag “forever” to the very bottom of “when Run is clicked”.' },
      { t: 'Random colours', d: 'Open Looks. Drag “set colour of … to random colour” inside the forever. Choose bulb1 in the drop-down.' },
      { t: 'All the bulbs', d: 'Add two more, for bulb2 and bulb3.' },
      { t: 'Slow it down', d: 'Put “wait 0.3 seconds” inside the forever, after the colours.' },
      { t: 'Test it', d: 'Press Run and watch the Goals tick. Press Stop to make it stop.' },
      { t: 'Challenge', d: 'Make the whole carousel turn round forever as well.' }
    ]
  },
  {
    id: 'park-10-wheel', unit: 'Park Designers · Block 2 · Lesson 4', title: 'Fix the big wheel', ks: 'ks2', years: 'Year 4', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'A debugging lesson. The big wheel’s code has three bugs: it turns the wrong way (like a door, not a wheel), it stops after 100 degrees, and its wait is outside the loop. Pupils predict, run, describe what really happens and fix one bug at a time.',
    objective: 'We are learning to find and fix bugs in a loop by testing and comparing what happens with what should happen.',
    success: ['I can say what a program should do and what it really does.', 'I can find a bug in a loop and fix it.', 'I can fix one bug at a time and test after each fix.'],
    curriculum: ['reason', 'debug1', 'predict'],
    words: [['bug', 'a mistake in the code'], ['debug', 'find and fix the mistakes'], ['axis', 'the line something turns around: x, y or z'], ['test', 'run the code to check what it really does']],
    need: ['A device per pupil or pair, with CodeJump open', 'A paper plate with a pencil through the middle, to show turning on different axes (optional)'],
    plan: [
      { min: 8, title: 'Spot the bug', html: '<p>Write a dance loop on the board: <b>repeat 3 times: clap, jump</b>, then <b>spin</b>. Say the dance should be “clap, jump, spin” three times. Do it wrong as written. <b>Ask:</b> what went wrong? (The spin is outside the loop.) A <b>bug</b> is a mistake; to <b>debug</b> is to find and fix it. Teach the steps: 1. What should it do? 2. What does it really do? 3. Which block makes the difference? 4. Fix one thing, then test.</p>' },
      { min: 10, title: 'Predict and run', html: '<p>Open the starter. Read <b>when wheel is clicked</b>: <b>repeat 10 times { turn wheel by x 0 y 10 z 0 degrees }</b> then <b>wait 0.1 seconds</b>. <b>Ask:</b> predict: how far will it turn? Press <b>Run</b> and click the blue wheel. Describe together: it swings round like a door, very fast, and stops part of the way. Show the paper plate: spinning round the pencil held upright is <b>y</b>; held pointing at you it turns like a wheel: <b>z</b>.</p>' },
      { min: 25, title: 'Bug hunt', html: '<p>Pairs find and fix the bugs one at a time, pressing Run and clicking the wheel after each fix. The Goals help: “It turns round like a wheel, all the way (360°)” and “It turns slowly: the wait is inside the loop”.</p><p>Common mistakes: fixing the axis but leaving 10 repeats (it only turns 100°, so the first goal stays empty); putting 10 in both y and z (it wobbles in two directions); changing the turn to 36 instead of the repeat (a big jump each time). <b>Ask:</b> 10 degrees each time; how many times for 360? Pupils can test their thinking: 10 × 10 = 100, 10 × 36 = 360.</p>' },
      { min: 7, title: 'The fixes', html: '<p>Go through the three bugs on the board.</p><p>Answer: when wheel is clicked → repeat 36 times { turn wheel by x 0 y 0 z 10 degrees; wait 0.1 seconds }. Bug 1: the turn was on y (like a door) — move the 10 to z. Bug 2: 10 repeats only make 100° — repeat 36 times. Bug 3: the wait was after the loop — drag it inside, under the turn.</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> which bug was hardest to spot? Why does fixing one bug at a time help? (You know which change made the difference.) What would 12 repeats of 30 degrees do? (Also a full turn, but jumpier.) Next lesson: a loop that makes lots of new things.</p>' }
    ],
    support: 'Give pupils a bug card with three boxes: “Which way does it turn?”, “How far does it turn?”, “Can you see it move?”. Fix one box at a time.',
    stretch: 'Make the wheel go round twice, slowly. Add a seat to the wheel and make the wheel turn forever when Run is clicked. Write a buggy loop for a partner to fix.',
    assess: ['Describes the difference between what the program should do and what it does', 'Finds and fixes the axis, the loop count and the misplaced wait', 'Tests after each single change'],
    steps: [
      { t: 'Predict', d: 'Read the code under “when wheel is clicked”. How far will the wheel turn? Which way?' },
      { t: 'Test it', d: 'Press Run and click the blue wheel. What does it really do? Say it out loud. Press Stop.' },
      { t: 'Bug 1: which way?', d: 'It turns like a door. A wheel turns round z. In the turn block, change y to 0 and z to 10.' },
      { t: 'Bug 2: how far?', d: '10 turns of 10 degrees is only 100. Change the repeat so it adds up to 360.' },
      { t: 'Bug 3: too fast', d: 'The wait is outside the loop. Drag “wait 0.1 seconds” inside the repeat, under the turn.' },
      { t: 'Test after each fix', d: 'Press Run and click the wheel after every change. Watch the Goals.' },
      { t: 'Challenge', d: 'Make the wheel go round twice, slowly. Then write a buggy loop for a partner to fix.' }
    ]
  },
  {
    id: 'park-11-fireworks', unit: 'Park Designers · Block 2 · Lesson 5', title: 'Fireworks finale', ks: 'ks2', years: 'Year 4', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'Loops can make things, not just move them. It is night at the park, and clicking the launcher makes just one firework. Pupils put the “make ball” block inside a repeat to make 12 fireworks, each with a pop and a short wait, then use “pick random” and “random colour” so every firework bursts in a different place and colour.',
    objective: 'We are learning to use a loop to make many objects, and random numbers to make each one different.',
    success: ['I can use a loop to make lots of objects.', 'I can use “pick random” to choose a number by chance.', 'I can predict what happens with and without random.'],
    curriculum: ['ssr', 'predict', 'design'],
    words: [['random', 'picked by chance, so you can’t know it before'], ['pick random', 'a block that gives a different number each time, between two numbers'], ['loop', 'code that runs again and again'], ['variable', 'a name that stands for something: here, the newest firework']],
    need: ['A device per pupil or pair, with CodeJump open', 'A dice (for the warm-up)'],
    plan: [
      { min: 7, title: 'Roll the dice', html: '<p>Roll a dice a few times. <b>Ask:</b> can you predict the next number? (No: it is <b>random</b>.) What numbers could it be? (1 to 6.) Explain that the 3D World has a dice block: <b>pick random 1 to 6</b> in <b>Operators</b>. You choose the smallest and biggest number; the computer picks one each time.</p>' },
      { min: 8, title: 'One firework', html: '<p>Open the starter: the park at night with a purple launcher. Under <b>when launcher is clicked</b>: <b>make ball firework colour</b> yellow <b>size 0.6 at x 0 y 10 z 9</b>, then <b>play sound pop</b>. Press <b>Run</b> and click the launcher: one firework. Recap: so far our loops moved and turned things. <b>Ask:</b> what would happen if “make ball” was inside a repeat 12 times? Explain that each new ball is also called firework: the name always means the newest one. There is no physics here, so the fireworks hang in the sky.</p>' },
      { min: 10, title: 'Show me', html: '<p>Drag <b>repeat 10 times</b> into <b>when launcher is clicked</b>, put both blocks inside and change 10 to 12. Add <b>wait 0.15 seconds</b> inside, under the pop. <b>Ask:</b> predict: where will the 12 fireworks be? Run and click: they all appear in the same spot, on top of each other, so it looks like one. Now drag <b>pick random 1 to 10</b> from <b>Operators</b> into the <b>x</b> hole of the make ball block and change it to <b>-8 to 8</b>. Run again.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the steps. Goals tick when “make ball” is inside a repeat, two “pick random” blocks are used, and 12 fireworks appear after clicking the launcher.</p><p>Common bugs: only the make block is inside the loop and the pop and wait are outside (all 12 appear at once with one pop); the repeat is still 10 (only 10 fireworks); “pick random” from 0 in the y hole, so some fireworks are in the ground; a huge range like -100 to 100, so most fireworks are off the screen. The random colour block is at the bottom of <b>Operators</b> and fits the colour hole.</p><p>Answer: when launcher is clicked → repeat 12 times { make ball firework colour (random colour) size 0.6 at x (pick random -8 to 8) y (pick random 7 to 14) z (pick random 6 to 12); play sound pop; wait 0.15 seconds }.</p>' },
      { min: 10, title: 'Plenary', html: '<p>Run the launcher twice on the board. <b>Ask:</b> are the fireworks in the same places both times? Why not? Where else could a park use random? (Which ride a visitor picks, where a prize appears, the weather.) Next lesson you design your own ride using everything from this block.</p>' }
    ],
    support: 'Pupils first get 12 fireworks in one spot (loop only). Then they add one “pick random” to x. Give the numbers on a card: x -8 to 8, y 7 to 14.',
    stretch: 'Make 30 fireworks. Make the size random too (pick random 1 to 3). Add a grand finale: a second repeat after the first that makes 5 big white fireworks.',
    assess: ['Puts a make block inside a repeat, with a wait so each one can be seen', 'Uses pick random with a sensible range in a position input', 'Predicts the difference random makes before testing'],
    steps: [
      { t: 'Try the launcher', d: 'Press Run and click the purple launcher. How many fireworks? Press Stop.' },
      { t: 'Get a loop', d: 'Open Control. Drag “repeat 10 times” inside “when launcher is clicked”.' },
      { t: 'Make lots', d: 'Drag “make ball firework …” and “play sound pop” inside the repeat. Change 10 to 12. Add “wait 0.15 seconds” inside too.' },
      { t: 'Predict', d: 'Where will the 12 fireworks be? Press Run and click the launcher to check.' },
      { t: 'Spread them out', d: 'Open Operators. Drag “pick random” into the x hole of “make ball”. Make it -8 to 8.' },
      { t: 'Up in the sky', d: 'Put another “pick random” in the y hole. Make it 7 to 14. Try one in the z hole too: 6 to 12.' },
      { t: 'Bright colours', d: 'Drag “random colour” from Operators into the colour hole. Press Run and click the launcher until all the Goals tick.' },
      { t: 'Challenge', d: 'Make 30 fireworks, or make the size random too.' }
    ]
  },
  {
    id: 'park-12-ride', unit: 'Park Designers · Block 2 · Lesson 6', title: 'Project: design a ride', ks: 'ks2', years: 'Year 4', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'The Block 2 project. Starting from an empty base, pupils design their own ride on paper, then build it with shapes and code it with loops: it starts when clicked or when a key is pressed, something moves inside a loop, and it plays a sound. The Goals checklist is the success criteria.',
    objective: 'We are learning to design, build, test and improve our own ride using loops and events.',
    success: ['I can plan my ride and its algorithm before I code it.', 'I can use a loop to make part of my ride move.', 'I can start my ride with a click or a key.', 'I can test my ride and make it better.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['design', 'a plan of what you will make and how it will work'], ['loop', 'code that runs again and again'], ['event', 'something that happens, like a click or a key press, that starts code'], ['evaluate', 'say what works well and what could be better']],
    need: ['A device per pupil or pair, with CodeJump open', 'Paper and pencils for the ride design'],
    plan: [
      { min: 8, title: 'Remember the rides', html: '<p>Recap the block on the board: the spinner (repeat a turn), the drop tower (repeat a sequence), the carousel lights (forever), the big wheel (debugging a loop), the fireworks finale (a loop that makes things, with random). <b>Ask:</b> which loop did each ride use, and what was inside it? Show the starter: just a grey base. Read the four Goals together: they are today’s success criteria.</p>' },
      { min: 10, title: 'Design on paper', html: '<p>Pupils sketch their ride and label its parts and names (e.g. arm, car, seat). Underneath they write the algorithm: <b>What starts it?</b> (a click or a key) <b>What repeats?</b> <b>How many times, or forever?</b> <b>What sound?</b> Show how a new object gets a name: <b>Variables → Create variable</b>, then pick that name in the make block’s drop-down.</p>' },
      { min: 27, title: 'Build and test', html: '<p>Pupils build in the edit view first: make blocks under <b>when Run is clicked</b>; click a shape to move it with the Move and Resize tools, or change the numbers. Then they code the ride under <b>when … is clicked</b> or <b>when … key pressed</b>, with a loop from <b>Control</b>, a move from <b>Motion</b> inside it and a <b>play sound</b> from <b>Sound</b>. They press Run, try it and improve it.</p><p>Common problems: the loop is under “when Run is clicked” but the goal wants a click or key event to start the ride (move it into a “when … is clicked” block); the wait is missing so the ride is a blur; the wrong name is picked in a drop-down, so a different shape moves.</p><p>One example answer: an arm (box) on the base and a car (ball). When arm is clicked → play sound magic; repeat 24 times { turn arm by x 0 y 15 z 0 degrees; wait 0.05 seconds }. When space key pressed → repeat 3 times { glide car up; glide car down }.</p>' },
      { min: 10, title: 'Share and evaluate', html: '<p>Gallery ride test: pupils try each other’s rides. Each designer says: <b>“My ride starts when… My loop repeats… times. Inside the loop…”</b> Visitors give one thing that works well and one idea to improve it. Pupils make one improvement if there is time.</p>' },
      { min: 5, title: 'Block 2 review', html: '<p>Recap: repeat, sequences inside loops, forever, debugging loops, loops that make things, random. Block 3 brings the fairground games: rides and stalls that make decisions with <b>if</b>.</p>' }
    ],
    support: 'Pupils remake the spinner from lesson 1 on the base (a box arm, repeat and turn), then add a sound and a key to start it.',
    stretch: 'Add a second part that moves in a different way (a glide inside a forever). Use pick random so the ride is different each time. Add riders with characters and make them wave.',
    assess: ['Produces a labelled design and algorithm before coding', 'Uses a loop with motion inside it, started by an event', 'Tests, takes feedback and improves the ride'],
    steps: [
      { t: 'Design it', d: 'Draw your ride on paper. Label the parts. Write: what starts it, what repeats, how many times.' },
      { t: 'Name your parts', d: 'Open Variables and press Create variable for each part, like arm or car.' },
      { t: 'Build it', d: 'Add shapes from Shapes under “when Run is clicked”. Pick your names in their drop-downs. Click a shape to move it.' },
      { t: 'Start it', d: 'Open Events. Use “when … is clicked” or “when … key pressed” to start your ride.' },
      { t: 'Make it move', d: 'Put a repeat or a forever from Control inside it. Put a turn, glide or move from Motion inside the loop.' },
      { t: 'Add a sound', d: 'Open Sound and add “play sound” to your ride.' },
      { t: 'Test it', d: 'Press Run and try your ride. Check every Goal ticks.' },
      { t: 'Improve it', d: 'Ask a partner to try your ride. Make one change to make it better.' }
    ]
  },
  {
    id: 'park-13-bell', unit: 'Park Designers · Block 3 · Lesson 1', title: 'Ring the bell', ks: 'ks2', years: 'Year 5', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'The first lesson on selection. The fairground’s “test your strength” game has a red puck and a gold bell, but nothing happens when the puck reaches the bell. Pupils add an if inside a forever loop that keeps asking “is the puck touching the bell?” and makes the bell say DING!, then tune the push so the puck gets there.',
    objective: 'We are learning to use an if block so a program can make a decision.',
    success: ['I can explain that an if block only runs its blocks when the question is true.', 'I can use a sensing block (touching) as the question in an if.', 'I can explain why the if goes inside a forever loop.', 'I can test and change a number until my game works.'],
    curriculum: ['ssr', 'reason', 'design'],
    words: [['selection', 'the program chooses whether to run some blocks or not'], ['if', 'a block that runs the blocks inside it only when its question is true'], ['condition', 'the question an if asks; the answer is true or false'], ['sensing', 'blocks that find something out about the world, like what is touching what']],
    need: ['A device per pupil or pair, with CodeJump open', 'Optional: a picture of a “test your strength” fairground game'],
    plan: [
      { min: 8, title: 'Stand up if…', html: '<p>Play “Stand up if…”: “Stand up <b>if</b> you have a pet. Stand up <b>if</b> you are wearing blue.” Everyone hears the same instruction, but only some stand. <b>Ask:</b> why did some people stand and not others? (The answer to the question was true for them.) Introduce <b>selection</b>: the program makes a decision. The question is a <b>condition</b>: its answer is true or false.</p>' },
      { min: 8, title: 'Meet the game', html: '<p>Introduce Block 3: last block we built rides that move with loops; now we build fairground games that make decisions. Open the starter on the board. In the edit view, point out the tall purple pole, the gold <b>bell</b> at the top and the red <b>puck</b> at the bottom. Press <b>Run</b> and press <b>space</b>: the puck jumps, but not very high. Show the code: <b>when space key pressed → push puck by x 0 y 5 z 0</b> (the same push as the star launcher in Block 1). <b>Ask:</b> even if the puck reaches the bell, how would the computer know? Read the Goals checklist “Ring it!” together.</p>' },
      { min: 10, title: 'Show me an if', html: '<p>Model it on the board. From <b>Control</b>, drag out <b>forever</b> and put it at the bottom of <b>when Run is clicked</b>. Drag the <b>if</b> block inside it. From <b>Sensing</b>, drag <b>… touching … ?</b> into the if’s gap and choose <b>puck</b> and <b>bell</b> in its drop-downs. Inside the if, put <b>bell says DING!</b> from <b>Looks</b>. Read it aloud: “Forever: if the puck is touching the bell, the bell says DING!” <b>Ask:</b> why do we need forever? (Without it, the if asks its question once, at the very start, when the puck is on the ground: the answer is false and it never asks again.)</p>' },
      { min: 24, title: 'Your turn', html: '<p>Pupils follow the steps. The first two goals tick as soon as the blocks are in place (goals about which blocks you used follow the blocks all the time). The last two tick while the game runs, when the puck really reaches the bell.</p><p>Common bugs: the if is under the forever instead of inside it, or the forever is missing, so the question is asked only once; the touching block still says <b>player</b> in a drop-down; the push is too small. Encourage pupils to change the push a bit at a time and test: pressing Run again starts the ticks again.</p><p>Answer: at the end of when Run is clicked: forever { if puck touching bell ? do: bell says DING!; set colour of bell to green }. Under when space key pressed: push puck by x 0 y 14 z 0.</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> what is the condition in our game? When is it true? When is it false? What does the program do when it is false? (Nothing: it skips the blocks inside the if.) Write on the board: <b>if [condition] then [do this]</b>. Next lesson: the dodgems, where the question is about a number.</p>' }
    ],
    support: 'Give pupils the forever and the if already joined under “when Run is clicked”; they choose puck and bell in the touching block and add the say block.',
    stretch: 'Make the bell change colour as well as speaking. Add a play sound inside the if. Make the pole taller and move the bell up: how big does the push need to be now?',
    assess: ['Places an if inside a forever so the condition is checked again and again', 'Uses a touching block as the condition and explains when it is true', 'Tests and adjusts the push until the game works'],
    steps: [
      { t: 'Try the game', d: 'Press Run, then press space. Does the puck reach the gold bell? Press Stop.' },
      { t: 'Keep checking', d: 'Open Control. Drag “forever” to the bottom of “when Run is clicked”. Drag the “if” block INSIDE the forever.' },
      { t: 'Ask a question', d: 'Open Sensing. Drag “… touching … ?” into the gap in the if. Choose puck and bell in the drop-downs.' },
      { t: 'Ring the bell', d: 'Open Looks. Put “bell says …” inside the if and type DING!' },
      { t: 'Push harder', d: 'Under “when space key pressed”, change the y in “push puck by …” to a bigger number. Try 14.' },
      { t: 'Test it', d: 'Press Run, then space. Keep changing and testing until all the Goals tick.' },
      { t: 'Challenge', d: 'Inside the if, add “set colour of bell to …” and a sound. Can you make it ring only with a really big push?' }
    ]
  },
  {
    id: 'park-14-dodgems', unit: 'Park Designers · Block 3 · Lesson 2', title: 'Dodgem rules', ks: 'ks2', years: 'Year 5', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'Selection with a number. Pupils drive a dodgem car with the arrow keys, but it can drive straight off the purple floor. They use the car’s x position and a comparison (greater than, less than) in two if blocks inside a forever loop to bump it back at each side.',
    objective: 'We are learning to use a comparison as the condition in an if block.',
    success: ['I can use a position block (x of car) in a condition.', 'I can choose between greater than (>) and less than (<).', 'I can use two if blocks to check two different things.', 'I can find and fix a bug in a condition.'],
    curriculum: ['ssr', 'reason', 'design'],
    words: [['condition', 'the question an if asks; the answer is true or false'], ['compare', 'check if one number is bigger, smaller or the same as another'], ['greater than (>)', 'bigger than'], ['less than (<)', 'smaller than'], ['position', 'where something is: its x, y and z']],
    need: ['A device per pupil or pair, with CodeJump open', 'Mini whiteboards for the number line (optional)'],
    plan: [
      { min: 7, title: 'The number line', html: '<p>Draw a number line on the board from −11 to 11 and mark it “purple floor”. Put a car in the middle at 0. <b>Ask:</b> if the car moves right, does its x get bigger or smaller? (Bigger.) Left? (Smaller, then negative.) Write <b>x > 10</b> and <b>x < −10</b>. <b>Ask:</b> where on the line is each one true? Shade the two ends. Recap last lesson: an if runs its blocks only when its condition is true.</p>' },
      { min: 8, title: 'Meet the dodgems', html: '<p>Open the starter on the board. In the edit view, show the purple floor and the red <b>car</b>. Show the code: <b>control car with the arrow keys speed 6</b> and an empty <b>forever</b> at the end of <b>when Run is clicked</b>. Press <b>Run</b> and drive off the edge. <b>Ask:</b> what rule does the dodgem need? (If the car gets too close to a side, push it back.) Read the Goals checklist “Stay in the arena”.</p>' },
      { min: 10, title: 'Show me a comparison', html: '<p>Model the right-hand side. Drag an <b>if</b> from <b>Control</b> into the forever. From <b>Operators</b>, drag the compare block (<b>0 = 0</b>) into the if and change = to <b>></b>. From <b>Sensing</b>, drag <b>x of …</b> into the left side and choose <b>car</b>; type <b>10</b> on the right. Inside the if: <b>move car by x −0.5 y 0 z 0</b> (Motion) and <b>car says Bump!</b> (Looks). Read it aloud: “Forever: if the car’s x is greater than 10, move it back a little and say Bump!” <b>Ask:</b> why 10 and not 11? (The x is the middle of the car; the car is 1.6 wide, so its edge is still on the floor at 10.)</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils build the right-hand rule, test it, then add a second if for the left-hand side. The “stay” goal checks the car all the time while it runs: after 3 seconds of driving it ticks only while the car is on the floor, and unticks if it escapes.</p><p>Common bugs: the second if is a copy that still says <b>> 10</b>, so the left side leaks (it should be <b>< −10</b>); the move goes the wrong way (+0.5 at the right side pushes the car further out); the if is outside the forever. <b>Ask:</b> which side does the car escape from? That tells you which if to look at.</p><p>Answer: forever { if x of car > 10 do: move car by x −0.5 y 0 z 0; car says Bump! · if x of car < −10 do: move car by x 0.5 y 0 z 0; car says Bump! }.</p>' },
      { min: 10, title: 'Plenary', html: '<p>Put a buggy program on the board with both ifs saying <b>> 10</b>. <b>Ask:</b> predict: which side will the car escape from? Fix it together. <b>Ask:</b> what about the front and back walls? Which position would we use? (z.) Next lesson: an if with an <b>else</b>, so the program chooses between two things.</p>' }
    ],
    support: 'Give pupils the finished right-hand if on a card to copy; they make the left-hand one by duplicating it (right-click, Duplicate) and changing > to < and 10 to −10.',
    stretch: 'Add two more ifs using z of car so the front and back walls bump too. Add a sound inside each if. Make the car change colour when it bumps.',
    assess: ['Uses x of car with > or < as the condition', 'Writes two separate ifs for two sides, with the right numbers and directions', 'Predicts which side a buggy rule will fail on and fixes it'],
    steps: [
      { t: 'Drive off', d: 'Press Run and drive the red car with the arrow keys. Can you drive off the purple floor? Press Stop.' },
      { t: 'An if in the loop', d: 'Open Control. Drag an “if” INSIDE the “forever” at the bottom of “when Run is clicked”.' },
      { t: 'Ask about x', d: 'Open Operators. Drag the compare block into the if and choose >. Open Sensing. Drag “x of …” into its left side, choose car, and type 10 on the right.' },
      { t: 'Bump back', d: 'Inside the if, put “move car by x -0.5 y 0 z 0” from Motion and “car says Bump!” from Looks.' },
      { t: 'Test one side', d: 'Press Run and drive into the right side. Does it bump you back? If it pushes you out, check the -0.5.' },
      { t: 'The other side', d: 'Add a second if in the forever: x of car < -10. Move the car by x 0.5 and say Bump!' },
      { t: 'Test it', d: 'Drive into both sides for a few seconds. Keep fixing until all the Goals tick.' },
      { t: 'Challenge', d: 'Use z of car to make the front and back walls bump too.' }
    ]
  },
  {
    id: 'park-15-weather', unit: 'Park Designers · Block 3 · Lesson 3', title: 'Sunny or rainy?', ks: 'ks2', years: 'Year 5', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'If … else with random. Each time the park opens, the program picks a random number to decide the weather: 1 means a grey, foggy, rainy day and the mascot says the rides are closed; otherwise the sky is blue and the rides are open. Pupils learn that an if … else always does exactly one of its two parts.',
    objective: 'We are learning to use if … else so a program chooses between two things.',
    success: ['I can explain that if … else always runs one part or the other, never both.', 'I can use pick random as part of a condition.', 'I can test a program with a random part by running it many times.'],
    curriculum: ['ssr', 'predict', 'reason'],
    words: [['if … else', 'if the condition is true, do the first part; if not, do the second part'], ['random', 'chosen by chance, so you cannot know it before'], ['condition', 'the question an if asks; the answer is true or false'], ['outcome', 'what happens in the end']],
    need: ['A device per pupil or pair, with CodeJump open', 'A coin or a dice (for the warm-up)'],
    plan: [
      { min: 8, title: 'Heads or tails', html: '<p>Toss a coin. Say: “<b>If</b> it is heads, we line up for play first; <b>else</b> we line up last.” Toss it a few times. <b>Ask:</b> could both things happen at once? Could neither happen? (No: exactly one, every time.) That is <b>if … else</b>. Recap: last lesson each if did something or nothing. Now there is always a second choice.</p>' },
      { min: 8, title: 'Meet the weather', html: '<p>Open the starter on the board: the park gate and the <b>mascot</b>. The code ends with <b>sky colour</b> blue: it is always sunny. <b>Ask:</b> real weather is not the same every day. How could the computer choose? Show <b>pick random 1 to 2</b> in <b>Operators</b>: like a coin, it gives 1 or 2. Read the Goals checklist “Weather report”.</p>' },
      { min: 10, title: 'Show me if … else', html: '<p>Model it. From <b>Control</b>, drag the second if block (the one with <b>else</b>) to the bottom of <b>when Run is clicked</b>. From <b>Operators</b>, drag the compare block (<b>0 = 0</b>) into the if; drag <b>pick random 1 to 2</b> into its left side and type <b>1</b> on the right. In the first part, put a new <b>sky colour</b> (Scene) set to grey, and <b>fog 40</b>. Drag the old blue <b>sky colour</b> block into the <b>else</b> part. Add <b>mascot says … for 3 seconds</b> (Looks) to each part. Read it aloud: “If the random number is 1, it rains; else it is sunny.” <b>Ask:</b> predict: if we press Run ten times, how many rainy days? (About half, but we can’t be sure.)</p>' },
      { min: 24, title: 'Your turn', html: '<p>Pupils follow the steps. Three goals are about the blocks, so they tick as soon as the blocks are in place; the mascot goal ticks when the program runs. Pupils should press Run many times to see both outcomes: testing a random program means testing it more than once.</p><p>Common bugs: the old blue sky is left under the if … else, so it is always sunny in the end (it runs last and paints over the grey); both skies are in the same part; the number on the right is 3, which pick random 1 to 2 never gives, so it is always sunny.</p><p>Answer: if pick random 1 to 2 = 1 do: sky colour grey; fog 40; mascot says “The rides are closed. It’s raining!” for 3 seconds · else: sky colour blue; mascot says “All the rides are open!” for 3 seconds.</p>' },
      { min: 10, title: 'Plenary', html: '<p>Tally on the board: each pair runs it ten times and counts rainy days. <b>Ask:</b> did everyone get the same? Why not? How could we make rain rarer? (pick random 1 to 4 = 1: rain only one time in four.) Next lesson: the ghost train has bugs, and we will hunt them down.</p>' }
    ],
    support: 'Give pupils the if … else with the condition already built; they put one sky block in each part and add the mascot’s words.',
    stretch: 'Make rain rarer: pick random 1 to 4. Use a second if … else inside the else to add a third kind of weather (snowy: a white ground colour). Make the mascot do a different animation for each.',
    assess: ['Builds an if … else and explains that exactly one part runs', 'Uses pick random in a condition', 'Runs a random program many times to test both outcomes'],
    steps: [
      { t: 'Always sunny', d: 'Press Run a few times. Is the weather ever different? Press Stop.' },
      { t: 'Get if … else', d: 'Open Control. Drag the if block that has “else” to the bottom of “when Run is clicked”.' },
      { t: 'Toss a coin', d: 'Open Operators. Drag the compare block into the if. Put “pick random 1 to 2” in its left side and type 1 on the right.' },
      { t: 'Rainy day', d: 'Open Scene. Put a “sky colour” block in the first part and make it grey. Add “fog 40” too.' },
      { t: 'Sunny day', d: 'Drag the old blue “sky colour” block into the else part.' },
      { t: 'Tell the visitors', d: 'Open Looks. Put “mascot says … for 3 seconds” in each part, with different words.' },
      { t: 'Test it', d: 'Press Run lots of times. Do you see both kinds of weather? Check every Goal ticks.' },
      { t: 'Challenge', d: 'Make rain rarer by changing the random numbers. Can you add a snowy day too?' }
    ]
  },
  {
    id: 'park-16-ghost', unit: 'Park Designers · Block 3 · Lesson 4', title: 'Debug the ghost train', ks: 'ks2', years: 'Year 5', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'Testing and debugging. The ghost train has three bugs: the cart goes the wrong way, the ghost waits for the wrong thing, and the wrong object says Boo! Pupils test, compare what happens with what should happen, and fix one bug at a time, using the Goals checklist to see which bug they have fixed.',
    objective: 'We are learning to test a program, find the bugs and fix them one at a time.',
    success: ['I can describe what a program should do and what it actually does.', 'I can find the block that causes a bug.', 'I can fix one bug at a time and test after each fix.'],
    curriculum: ['debug1', 'reason', 'ssr'],
    words: [['bug', 'a mistake in a program'], ['debug', 'find and fix the mistakes'], ['test', 'run the program to check what it does'], ['expected', 'what should happen'], ['actual', 'what really happens']],
    need: ['A device per pupil or pair, with CodeJump open', 'A bug-hunt sheet with three columns: expected, actual, fix (optional)'],
    plan: [
      { min: 7, title: 'Expected and actual', html: '<p>Read out a buggy recipe: “Put the bread in the toaster, butter it, then take it out.” <b>Ask:</b> what did you expect? What would actually happen? Introduce the words <b>expected</b> and <b>actual</b>. A <b>bug</b> is where they are different. Good debuggers change one thing at a time and test again.</p>' },
      { min: 10, title: 'Ride the ghost train', html: '<p>Open the starter on the board. In the edit view, show the grey track, the dark <b>tunnel</b> at the far end, the red <b>cart</b>, a <b>tree</b> by the track (the ghost is hidden). Describe what SHOULD happen: the cart rolls into the tunnel, the ghost appears there and the ghost says Boo! Press <b>Run</b>. <b>Ask:</b> what actually happened? (The cart rolled backwards away from the tunnel and nothing else happened.) Read the Goals checklist “Find the three bugs”: each goal is one bug.</p>' },
      { min: 8, title: 'Read the code', html: '<p>Show both <b>when Run is clicked</b> blocks: they both start at Run. The first builds the ride and glides the cart. The second has <b>forever</b> with an <b>if cart touching tree ?</b> that shows the ghost and makes the cart say Boo! <b>Ask:</b> which numbers tell us where the cart goes? Where is the tunnel? (Click the tunnel in the edit view: it is at the far end, where z is about 10.) Pupils fill in the expected / actual columns for bug 1 before they touch the code.</p>' },
      { min: 25, title: 'Bug hunt', html: '<p>Pupils fix one bug at a time and press Run after each fix. The goals show their progress: bug 1 ticks when the cart touches the tunnel; bug 2 when the ghost appears; bug 3 when the ghost says Boo! Bug 2 can’t be seen until bug 1 is fixed, which is a good point to make: one bug can hide another.</p><p>The three bugs and fixes: <b>1.</b> glide cart to x 0 y 0.1 z <b>−9</b> → z <b>9</b> (it went the wrong way). <b>2.</b> if cart touching <b>tree</b> ? → <b>tunnel</b> (the cart never goes near the tree). <b>3.</b> <b>cart</b> says Boo! → <b>ghost</b> says Boo! (change the drop-down).</p><p>Common mistake: changing several things at once, then not knowing what fixed it. Another: deleting the forever, so the ghost check happens only once, at the start.</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> which bug was hardest to find? Why couldn’t we see bug 2 at first? What is a good way to hunt bugs? Collect a class list: run it, say expected and actual, find the block, change one thing, test again. Next lesson: the splash fountain, where the if … else asks how far away the player is.</p>' }
    ],
    support: 'Tell pupils which block each bug is in; they work out what to change. Or work on bug 1 together first.',
    stretch: 'Make the ghost do something more: an animation, a sound, or glide towards the cart. Put a new bug in your program for a partner to find, and write the expected and actual for it.',
    assess: ['Describes the expected and actual behaviour for each bug', 'Finds the block that causes each bug', 'Fixes one bug at a time and tests after each change'],
    steps: [
      { t: 'What should happen?', d: 'Read the Goals. The cart should go into the tunnel, the ghost should appear and the ghost should say Boo!' },
      { t: 'What does happen?', d: 'Press Run and watch. What is different? Press Stop.' },
      { t: 'Bug 1', d: 'Find “glide cart to …”. The tunnel is at the far end. Which number sends the cart the wrong way? Fix it and press Run.' },
      { t: 'Bug 2', d: 'Look in the other “when Run is clicked”. The if asks about the wrong thing. Change the drop-down so it asks about the tunnel. Test.' },
      { t: 'Bug 3', d: 'Who says Boo! now? Change the say block so the ghost says it. Test.' },
      { t: 'All fixed?', d: 'Press Run again and check all three Goals tick.' },
      { t: 'Challenge', d: 'Add one new bug to your ride and swap with a partner. Can they find it?' }
    ]
  },
  {
    id: 'park-17-splash', unit: 'Park Designers · Block 3 · Lesson 5', title: 'The splash fountain', ks: 'ks2', years: 'Year 5', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'If … else with distance. Pupils walk a character around the park with the arrow keys. They code the fountain so that, when the player is close to the pond, the water appears and the player says Splash!, and when they walk away, the water disappears again. They see why else matters: without it, the water never goes away.',
    objective: 'We are learning to use if … else with a distance check, so a program reacts to where the player is.',
    success: ['I can use “distance from … to …” in a condition.', 'I can use if … else inside a forever loop to keep checking.', 'I can explain what the else part is for in my program.'],
    curriculum: ['ssr', 'reason', 'design'],
    words: [['distance', 'how far apart two things are'], ['if … else', 'if the condition is true, do the first part; if not, do the second part'], ['less than (<)', 'smaller than'], ['input', 'something the user does, like pressing a key, that the program reacts to']],
    need: ['A device per pupil or pair, with CodeJump open', 'Optional: a metre stick or a hoop for the warm-up'],
    plan: [
      { min: 7, title: 'Hot or cold', html: '<p>Put a hoop on the floor as the “pond”. A pupil walks towards it. The class says “<b>Splash!</b>” when they are closer than one big step, and “dry” when they are further away. <b>Ask:</b> what is the rule? (If the distance is less than one step, splash; else, dry.) Recap: last time if … else chose the weather; today the condition is about how far away something is.</p>' },
      { min: 8, title: 'Meet the fountain', html: '<p>Open the starter on the board. Show the <b>player</b> (a character you walk with the arrow keys), the <b>pond</b>, and the code: <b>make water …</b> then <b>hide water</b>, and an empty <b>forever</b> at the bottom of <b>when Run is clicked</b>. Press <b>Run</b> and walk to the pond: nothing happens. Read the Goals checklist “Get splashed”.</p>' },
      { min: 10, title: 'Show me', html: '<p>Model it. Drag the if block with <b>else</b> from <b>Control</b> into the forever. From <b>Operators</b>, drag the compare block in and choose <b><</b>. From <b>Sensing</b>, drag <b>distance from … to …</b> into the left side and choose <b>player</b> and <b>pond</b>; type <b>4</b> on the right. In the first part: <b>show water</b> and <b>player says Splash!</b>. In the else: <b>hide water</b> and <b>player says</b> with nothing in the box (saying nothing takes the bubble away). <b>Ask:</b> what would go wrong without the else? (Once the water appears, nothing ever hides it again.)</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the steps, then experiment with the number: 4 is about right; try 2 and 8. The block goals tick as soon as the blocks are in place; the water and Splash! goals tick when they walk up to the pond while it runs.</p><p>Common bugs: the compare is <b>></b>, so it splashes everywhere except near the pond; the distance drop-downs still say the wrong objects; the number is too small, so you have to stand in the very middle; show and hide are in the wrong parts. <b>Ask:</b> “Walk towards it slowly: where does it change?” to help pupils find the number.</p><p>Answer: forever { if distance from player to pond < 4 do: show water; player says Splash! · else: hide water; player says (nothing) }.</p>' },
      { min: 10, title: 'Plenary', html: '<p>Show two versions on the board: with else and without. <b>Ask:</b> predict what each does when you walk away. Run them to check. <b>Ask:</b> what other park things could use distance? (A shop that says hello when you get close, a gate that opens.) Next lesson is the Block 3 project: design your own game stall.</p>' }
    ],
    support: 'Give pupils the if … else with the condition already built; they put show and hide in the right parts and add the speech.',
    stretch: 'Add a second if … else so the player says something different when they are a medium distance away (“I can hear water!”). Make the water a different colour each time it appears. Make a bench that says “Have a rest” when you are close.',
    assess: ['Uses distance from … to … with < in a condition', 'Uses if … else inside forever, with the right blocks in each part', 'Explains why the else is needed to hide the water'],
    steps: [
      { t: 'Walk to the pond', d: 'Press Run. Walk with the arrow keys to the pond. Does anything happen? Press Stop.' },
      { t: 'Keep checking', d: 'Open Control. Drag the if block with “else” INSIDE the forever at the bottom of “when Run is clicked”.' },
      { t: 'How far?', d: 'Open Operators. Drag the compare block into the if and choose <. Open Sensing. Put “distance from … to …” on the left. Choose player and pond. Type 4 on the right.' },
      { t: 'Splash!', d: 'Open Looks. In the first part put “show water” and “player says Splash!”.' },
      { t: 'Dry again', d: 'In the else part put “hide water” and “player says” with nothing in the box.' },
      { t: 'Test it', d: 'Press Run. Walk up to the pond, then walk away. Keep testing until all the Goals tick.' },
      { t: 'Change the number', d: 'Try 2 and 8 instead of 4. Which feels best?' },
      { t: 'Challenge', d: 'Add a second if … else so the player says “I can hear water!” when they are a bit further away.' }
    ]
  },
  {
    id: 'park-18-stall', unit: 'Park Designers · Block 3 · Lesson 6', title: 'Project: a game stall', ks: 'ks2', years: 'Year 5', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'The Block 3 project. Starting from an empty pink stall, pupils design their own fairground game (a coconut shy, a hoopla, a high striker…) on paper, then build and code it: the player presses a key or clicks to play, an if … else checks something in the world, and the game tells the player how they did. The Goals checklist is the success criteria.',
    objective: 'We are learning to design, build, test and improve our own game that uses selection.',
    success: ['I can plan my game and write its rule as “if … else …” before I code it.', 'I can start my game with a key press or a click.', 'I can use if … else with a sensing block to decide if the player wins.', 'I can test my game and make it better.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['design', 'a plan of what you will make and how it will work'], ['selection', 'the program chooses what to do with if or if … else'], ['condition', 'the question an if asks; the answer is true or false'], ['evaluate', 'say what works well and what could be better']],
    need: ['A device per pupil or pair, with CodeJump open', 'Paper and pencils for the game design'],
    plan: [
      { min: 8, title: 'Remember the games', html: '<p>Recap the block on the board: the bell (if + touching), the dodgems (if + x position and > <), the weather (if … else + random), the ghost train (debugging), the fountain (if … else + distance). <b>Ask:</b> what question did each if ask? Show the starter: just a pink stall. Read the four Goals together: they are today’s success criteria. Show one example idea: a tin can on the stall and a ball you throw with space; “if y of can < 2, You win a prize!, else Knock me off!”.</p>' },
      { min: 10, title: 'Design on paper', html: '<p>Pupils sketch their stall and label every object with a name (e.g. can, ball, hoop). Underneath they write: <b>How do you play?</b> (a key or a click) <b>What is the rule?</b> as “if … else …” <b>What does the game say?</b> Show how a new object gets a name: <b>Variables → Create variable</b>, then pick that name in the make block’s drop-down. Remind them of useful blocks: <b>make … fall and bump</b> and <b>push … by</b> (Physics), and the Sensing blocks <b>touching</b>, <b>distance from … to …</b>, <b>x / y / z of …</b>, <b>key … pressed?</b></p>' },
      { min: 30, title: 'Build and test', html: '<p>Pupils build in the edit view first: make blocks under <b>when Run is clicked</b>; click a shape to move it with the Move and Resize tools, or change the numbers. Then they add the way to play (<b>when … key pressed</b> or <b>when … is clicked</b>), and a <b>forever</b> with an <b>if … else</b> that checks something and uses <b>says</b> to tell the player. They press Run, play, and improve.</p><p>Common problems: the if … else is not inside a forever, so it checks once at the start and never again; a thrown ball has no <b>fall and bump</b>, so push does nothing; a target with no physics floats in the air; the condition never becomes true (test it by moving the thing by hand in the edit view and reading its numbers). Pressing Run again starts the ticks again.</p><p>Example answer: stall solid but still; a can on top that falls and bumps; a ball that falls and bumps; when space key pressed → push ball by x 0 y 10 z 6; forever { if y of can < 2 do: can says You win a prize! · else: can says Knock me off! }.</p>' },
      { min: 8, title: 'Share and evaluate', html: '<p>Fairground walk: pupils play each other’s stalls. Each designer explains: <b>“To play, you… My if checks… If it is true… Else…”</b> Visitors give one thing that works well and one idea to make it better or fairer. Pupils make one improvement if there is time.</p>' },
      { min: 4, title: 'Block 3 review', html: '<p>Recap: if, conditions from sensing (touching, position, distance), comparisons, if … else, random, debugging. Block 4 is about running the park: counting visitors, keeping score and timing with <b>variables</b>.</p>' }
    ],
    support: 'Pupils remake the bell game from lesson 1 on the stall (a puck, a bell, space to push), then change the if into an if … else so it also says “Try again!”.',
    stretch: 'Give the player three goes, or more than one target. Add a sound for winning and a different one for losing. Use an if … else inside the else for three outcomes (win, nearly, try again).',
    assess: ['Plans a game rule as if … else before coding', 'Uses a sensing block in the condition of an if … else inside a forever', 'Tests the game, evaluates a partner’s and makes an improvement'],
    steps: [
      { t: 'Plan it', d: 'On paper, draw your stall. Name every object. Write your rule: “if … then the player wins, else …”.' },
      { t: 'Build it', d: 'Make your objects under “when Run is clicked”. Make a variable for each name first (Variables → Create variable).' },
      { t: 'Add physics', d: 'Anything that is thrown or knocked over needs “make … fall and bump”. The stall can be “solid but still”.' },
      { t: 'Play button', d: 'Add “when … key pressed” or “when … is clicked” from Events, with a block that starts the game, like “push … by”.' },
      { t: 'The rule', d: 'Add a forever. Put an if … else inside it. Use a Sensing block in the condition: touching, distance, x/y/z of, or key pressed?' },
      { t: 'Tell the player', d: 'Use a “says” block from Looks in each part, so the player knows how they did.' },
      { t: 'Test and improve', d: 'Play it lots of times. Use the Goals as your checklist. Then let a partner play and listen to their ideas.' }
    ]
  },
  {
    id: 'park-19-tickets', unit: 'Park Designers · Block 4 · Lesson 1', title: 'The ticket counter', ks: 'ks2', years: 'Year 6', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'Variables: the park is open and the gate has a green turnstile. Pupils make a tickets variable count up by 1 each time the turnstile is clicked and show “Tickets:” and the number on the screen, then let 5 visitors in.',
    objective: 'We are learning to use a variable to store a number and change it while a program runs.',
    success: ['I can explain what a variable is and why it needs a starting value.', 'I can change a variable by 1 when an event happens.', 'I can join words and a variable to show its value on the screen.'],
    curriculum: ['ssr', 'design', 'predict'],
    words: [['variable', 'a named box that remembers a value, like the number of tickets'], ['set', 'give a variable a value (often a starting value)'], ['change by', 'add to (or take from) a variable'], ['join', 'stick words and a value together to show them']],
    need: ['A device per pupil or pair, with CodeJump open', 'A clicker counter or a tally on the board for the warm-up (optional)'],
    plan: [
      { min: 8, title: 'Counting visitors', html: '<p>Welcome to Block 4: the park is built, the rides move and the games work. Now we must <b>run</b> it, and that means keeping track of numbers. Click a clicker counter (or add a tally mark) each time a pupil “walks through the gate”. <b>Ask:</b> what does the counter remember? What should it say at the start of the day? What happens if nobody resets it?</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter on the board. Point out <b>set tickets to 0</b> at the end of <b>when Run is clicked</b>: this is the starting value. Then find <b>when turnstile is clicked</b>, which only plays a click. Press Run and click the turnstile: it clicks but nothing counts. Open <b>Variables</b> and show <b>change tickets by 1</b> and the round <b>tickets</b> value block.</p><p>Show the ready-made <b>show … on the screen</b> block in Looks, the one that already says “Score: ”. Change the words to <b>Tickets: </b> and drop the <b>tickets</b> value block into the gap where the 0 is.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card. The Goals checklist at the top right of the world ticks as they go.</p><p><b>The answer:</b> when turnstile is clicked { play sound click · change tickets by 1 · show (create text with “Tickets: ”, tickets) on the screen }. Then press Run and click the turnstile 5 times. Putting the same show block under set tickets to 0 as well makes “Tickets: 0” appear at the start.</p><p><b>Common bugs:</b> the change block placed in when Run is clicked (it counts once, not per click); “Tickets: tickets” typed as words, so the number never appears (the round variable block must go in the gap); the show block put before the change block, so the screen is always one behind. <b>Ask:</b> “Your screen says 4 but you clicked 5 times. Read your blocks in order: what happens first?”</p>' },
      { min: 10, title: 'Predict', html: '<p>On the board write: set tickets to 0, then click 3 times, then change tickets by 2 on each click instead. <b>Ask:</b> what will the screen show after 3 clicks? (6.) What if we forgot set tickets to 0? (The program would not know where to start; in many languages that is an error.) Pupils try “change tickets by -1” to make a counter that goes down.</p>' },
      { min: 7, title: 'Plenary', html: '<p><b>Ask:</b> where else in a theme park would you need a variable? (Money taken, people on a ride, queue time, scores at a stall.) Next lesson: we film a ride with a camera and use messages to start the ending.</p>' }
    ],
    support: 'Give pupils the show block already joined to the tickets variable; they only add “change tickets by 1” and put the blocks in order.',
    stretch: 'Make a second variable called people that counts down from 20 places left in the park. Show both on the screen with one join (use the gear on the join block to add more gaps).',
    assess: ['Explains that a variable is a named value that can change', 'Changes the variable inside the click event', 'Shows the variable’s value by joining it to words'],
    steps: [
      { t: 'Try it', d: 'Press Run and click the green turnstile. You hear a click, but nothing is counted. Press Stop.' },
      { t: 'Find the variable', d: 'Find “set tickets to 0” in “when Run is clicked”. That is the starting value. Open Variables to see the tickets blocks.' },
      { t: 'Count', d: 'From Variables, drag “change tickets by 1” into “when turnstile is clicked”, under the sound.' },
      { t: 'Show it', d: 'From Looks, drag the “show … on the screen” block that says “Score: ” under the change block. Change Score to Tickets.' },
      { t: 'Show the number', d: 'From Variables, drag the round tickets block into the gap where the 0 is.' },
      { t: 'Let them in', d: 'Press Run and click the turnstile 5 times. Watch the number go up and the Goals tick.' },
      { t: 'Challenge', d: 'Show “Tickets: 0” at the start too. Then make each click count 2 people. What does the screen say after 5 clicks?' }
    ]
  },
  {
    id: 'park-20-coastercam', unit: 'Park Designers · Block 4 · Lesson 2', title: 'Coaster cam', ks: 'ks2', years: 'Year 6', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'Cameras and messages: the coaster car already rides over the hill to the end of the track. Pupils make the camera ride along behind the car, then broadcast a message at the end so a “when I receive” script films the mascot clapping.',
    objective: 'We are learning to control the camera with code and to use messages (broadcast and when I receive) so one script can start another.',
    success: ['I can make the camera follow an object from behind.', 'I can broadcast a message when something has finished.', 'I can start a new script with “when I receive”.', 'I can explain why messages help to split a program into parts.'],
    curriculum: ['ssr', 'design', 'alg'],
    words: [['camera', 'the view you see the world through'], ['broadcast', 'send a message to every “when I receive” block'], ['message', 'a word one script sends to start another script'], ['script', 'a stack of blocks under one event']],
    need: ['A device per pupil or pair, with CodeJump open', 'A phone or toy camera for the warm-up (optional)'],
    plan: [
      { min: 8, title: 'Lights, camera…', html: '<p>Show a ride video filmed from the front seat, or act it out: one pupil is the coaster, another holds a “camera” and must follow. <b>Ask:</b> where should the camera be to make the ride exciting? When should the film cut to the crowd? Last lesson a variable remembered a number; today our code moves the camera and sends a message.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press Run: the car waits 1 second, glides up the hill and down to the end. The view stays still. Open <b>Camera</b>: show <b>camera follows car from behind</b> and <b>camera distance</b> (3 = close, 80 = far). Put them before the wait and Run again.</p><p>Then open <b>Events</b>. Show <b>broadcast</b> and <b>when I receive</b>. Both have a word box that says “go”: type <b>finish</b> in both. The words must match exactly.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card and watch the Goals tick.</p><p><b>The answer:</b> in when Run is clicked, before the wait: camera follows car from behind · camera distance 8. After the last glide: broadcast finish. A new script: when I receive finish { point camera at x 3 y 1 z 18 · camera distance 10 · mascot clap once · mascot says “What a ride!” for 3 seconds }.</p><p><b>Common bugs:</b> “Finish” in one block and “finish” in the other, or a space after the word, so the message never arrives; broadcast put at the top, so the mascot claps before the ride; the camera still follows the car at the end, so the mascot is hard to see (point camera at stops the following). <b>Ask:</b> “Which block sends the message? Which block is listening? Do they say exactly the same word?”</p>' },
      { min: 10, title: 'Why messages?', html: '<p>Draw two boxes on the board: the ride script and the ending script, with an arrow labelled <b>finish</b>. <b>Ask:</b> could we put the ending blocks straight after the glides instead? (Yes, but messages keep each job in its own script, and many scripts can listen to one message: the lights, a sound and the mascot could all start on finish.) Pupils add a second when I receive finish that plays the win sound.</p>' },
      { min: 7, title: 'Plenary', html: '<p><b>Ask:</b> which camera view would be best for a game where you walk around the park? Next lesson we use a score variable in a star hunt, with the camera following the player.</p>' }
    ],
    support: 'Give pupils the when I receive script ready-made; they add the camera blocks and the broadcast, and check the words match.',
    stretch: 'Try the camera from above and from the side. Add a sound and a colour change to the ending, each in its own “when I receive finish” script.',
    assess: ['Uses a camera block to follow an object', 'Broadcasts a message at the right point in the sequence', 'Starts a second script with a matching “when I receive”'],
    steps: [
      { t: 'Watch the ride', d: 'Press Run. The car rides to the end, but the camera stays still. Press Stop.' },
      { t: 'Ride along', d: 'From Camera, put “camera follows car from behind” inside “when Run is clicked”, before the wait. Choose car in the drop-down.' },
      { t: 'Get closer', d: 'Add “camera distance” under it and make it 8. Press Run. Do you feel like you are on the ride?' },
      { t: 'Send a message', d: 'From Events, put “broadcast” after the last glide. Click its word and type finish.' },
      { t: 'Listen for it', d: 'Drag “when I receive” into an empty space. Type finish, exactly the same.' },
      { t: 'The ending', d: 'Inside it, add “point camera at x 3 y 1 z 18”, then a Characters block set to mascot, clap, once. Add “mascot says What a ride! for 3 seconds”.' },
      { t: 'Run it', d: 'Press Run. When the car reaches the end, does the camera turn to the mascot clapping? Check the Goals.' },
      { t: 'Challenge', d: 'Add another “when I receive finish” that plays a sound. One message can start lots of scripts!' }
    ]
  },
  {
    id: 'park-21-stars', unit: 'Park Designers · Block 4 · Lesson 3', title: 'Star hunt', ks: 'ks2', years: 'Year 6', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'A score variable: a player walks down the park path (with the arrow keys) towards a star. Pupils make the score go up by 1 each time the player touches the star, show the score, and move the star on by z 4 so it can be caught again, then catch 5 stars.',
    objective: 'We are learning to use a variable as a score that changes when an event happens in a game.',
    success: ['I can add 1 to a score when two objects touch.', 'I can show the score on the screen after it changes.', 'I can move an object on so the game keeps going.'],
    curriculum: ['ssr', 'design', 'reason'],
    words: [['score', 'a variable that counts how well you are doing'], ['event', 'something that happens, like touching, that starts code'], ['update', 'show the new value after it changes'], ['reset', 'put a variable back to its starting value']],
    need: ['A device per pupil or pair, with CodeJump open', 'Mini whiteboards for the trace table (optional)'],
    plan: [
      { min: 7, title: 'Keeping score', html: '<p>Recap: in lesson 1 a click changed tickets by 1. <b>Ask:</b> what in a game should change the score? (Catching something, reaching a place, hitting a target.) Today the event is a <b>touch</b>: when the player touches a star.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press Run. Walk forward with the up arrow: the camera follows the player, the player reaches the star and you hear a magic sound, but the score stays at 0 and the player walks straight past. Find <b>set score to 0</b> and <b>show (Score: score) on the screen</b> in when Run is clicked. <b>Ask:</b> why does the screen say 0? Then find <b>when player touches star</b>: this is where the scoring goes.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card and watch the Goals tick.</p><p><b>The answer:</b> when player touches star { play sound magic · change score by 1 · show (create text with “Score: ”, score) on the screen · move star by x 0 y 0 z 4 }. Press Run and hold the up arrow: the star keeps moving 4 ahead, and 5 catches tick the last goal.</p><p><b>Common bugs:</b> no show block after the change, so the score changes but the screen still says 0 (the screen only updates when you show it again); the star is not moved, so the player stands on it and only scores once; the star is moved behind or sideways, so it can’t be reached by walking forward. <b>Ask:</b> “The variable changed. Has anything told the screen?”</p>' },
      { min: 11, title: 'Trace the score', html: '<p>Trace table on the board: stars caught, score, star’s z. Start at score 0, z −2. After 1 catch: 1, 2. After 2: 2, 6. <b>Ask:</b> where is the star after 5 catches? (z 18.) What happens to the score when you press Stop and Run again? (set score to 0 resets it.)</p>' },
      { min: 7, title: 'Plenary', html: '<p><b>Ask:</b> is this a fun game yet? What is missing? (A time limit, a way to win.) Next lesson: a countdown clock and a decision at the end.</p>' }
    ],
    support: 'Give pupils the show block ready (from the when Run script, right-click → Duplicate); they add the change block and the move block.',
    stretch: 'Instead of moving the star straight ahead, use “move star by” with x “pick random -3 to 3”, so the player has to steer. Add a second star that is worth 5 points.',
    assess: ['Changes the score in the touch event', 'Updates the display after the variable changes', 'Moves the star so the game can continue'],
    steps: [
      { t: 'Play it', d: 'Press Run and hold the up arrow. The star makes a magic sound, but the score stays at 0. Press Stop.' },
      { t: 'Find the event', d: 'Find “when player touches star”. Everything inside runs each time they touch.' },
      { t: 'Score a point', d: 'From Variables, put “change score by 1” under the magic sound.' },
      { t: 'Show the score', d: 'Right-click the “show … on the screen” block in “when Run is clicked” and choose Duplicate. Put the copy under the change block.' },
      { t: 'Move the star on', d: 'From Motion, add “move star by x 0 y 0 z 4” at the end, so the star jumps further along the path.' },
      { t: 'Catch 5', d: 'Press Run and walk forward with the arrow keys. Catch 5 stars and watch the Goals tick.' },
      { t: 'Challenge', d: 'Put “pick random -3 to 3” (Operators) in the x of the move block, so you have to steer to catch the star.' }
    ]
  },
  {
    id: 'park-22-clock', unit: 'Park Designers · Block 4 · Lesson 4', title: 'Beat the clock', ks: 'ks2', years: 'Year 6', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'A countdown and decisions: the star hunt from last lesson now has a clock variable set to 10. Pupils count it down to 0 with “repeat until”, show the time left, and then use if … else to make the player say whether they won.',
    objective: 'We are learning to use a variable as a countdown and to make a decision with its value at the end of a game.',
    success: ['I can make a variable count down using “repeat until”.', 'I can show the time left on the screen.', 'I can use if … else with a variable to decide who won.', 'I can explain how two scripts can run at the same time.'],
    curriculum: ['ssr', 'reason', 'design'],
    words: [['countdown', 'a number that goes down to 0, like a timer'], ['repeat until', 'keep repeating until something is true'], ['condition', 'a question with a yes or no answer, like clock = 0'], ['decrement', 'take 1 away from a variable']],
    need: ['A device per pupil or pair, with CodeJump open', 'A stopwatch or a countdown on the board (optional)'],
    plan: [
      { min: 7, title: 'Ten seconds!', html: '<p>Count down from 10 together, one number a second. <b>Ask:</b> what did we do each second? (Wait, take 1 away, say the number.) When did we stop? (When we reached 0.) That is a loop with a condition, and the number is a variable.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter. It is last lesson’s finished star hunt, plus <b>set clock to 10</b> at the end of when Run is clicked. From Control, drag out <b>repeat while</b> and change its drop-down to <b>repeat until</b>. From Operators, drag the <b>=</b> block into it; put the <b>clock</b> value block on the left and type 0 on the right.</p><p>Model the inside: <b>wait 1 seconds</b>, <b>change clock by -1</b>, then a show block with “Time: ” and clock.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card and watch the Goals tick.</p><p><b>The answer:</b> after set clock to 10: repeat until clock = 0 { wait 1 seconds · change clock by -1 · show (create text with “Time: ”, clock) on the screen }. Then: if score ≥ 5 { player says “I win!” for 3 seconds } else { player says “Time’s up!” for 3 seconds }.</p><p><b>Common bugs:</b> change clock by 1 instead of -1 (the clock goes up forever and the game never ends); no wait inside the loop (the clock reaches 0 at once); the if … else put inside the loop (the player talks every second). <b>Ask:</b> “Read the condition out loud. Will clock ever equal 0 with your blocks?”</p><p>Point out that the touch script and the countdown run at the same time: catching a star shows the score, and the next second shows the time again.</p>' },
      { min: 11, title: 'Make it fair', html: '<p>Pupils play each other’s games. <b>Ask:</b> is 10 seconds and 5 stars too easy or too hard? Change one number to make it fairer and test again. The stretch shows the score and the time together: click the gear on the join block to add more gaps.</p>' },
      { min: 7, title: 'Plenary', html: '<p><b>Ask:</b> which variables does our game use now, and what is each one for? (score counts up, clock counts down.) Next lesson: two variables and a decision together, at the ice cream stand.</p>' }
    ],
    support: 'Give pupils the repeat until loop with its condition ready; they add the three blocks inside and the if … else after it.',
    stretch: 'Show both at once: “Score: ” score “  Time: ” clock (use the gear to give the join block four gaps). Add a bonus: catching a star adds 2 seconds to the clock.',
    assess: ['Builds a countdown with a variable and repeat until', 'Shows the changing value on the screen', 'Uses if … else on the score after the loop'],
    steps: [
      { t: 'Find the clock', d: 'Find “set clock to 10” at the end of “when Run is clicked”.' },
      { t: 'Repeat until', d: 'From Control, drag “repeat while” under it. Change while to until.' },
      { t: 'The condition', d: 'From Operators, put the = block in the gap. Put the clock block (Variables) on the left and 0 on the right.' },
      { t: 'Tick down', d: 'Inside the loop: “wait 1 seconds”, then “change clock by -1”.' },
      { t: 'Show the time', d: 'Under them, add a “show … on the screen” block. Make it join “Time: ” and the clock block.' },
      { t: 'Who won?', d: 'After the loop (not inside it), add “if … else” from Control. If score ≥ 5, the player says I win! for 3 seconds. Else the player says Time’s up! for 3 seconds.' },
      { t: 'Play it', d: 'Press Run and catch stars before the clock reaches 0. Check the Goals.' },
      { t: 'Challenge', d: 'Show the score and the time together. Or give 2 extra seconds for each star.' }
    ]
  },
  {
    id: 'park-23-icecream', unit: 'Park Designers · Block 4 · Lesson 5', title: 'The ice cream stand', ks: 'ks2', years: 'Year 6', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'Variables and decisions together: the ice cream stand shows two variables on the screen, stock (5 ice creams) and sold (0). Clicking the stand sells one, but it has a bug: it keeps selling when there are none left, so stock goes below 0. Pupils use if stock > 0 … else to say “Sold out!”, make clicking the van deliver 10 more, then sell 8 ice creams.',
    objective: 'We are learning to use if … else to check a variable before changing it, and to make two variables work together.',
    success: ['I can use if … else to check a variable before something happens.', 'I can change two variables when something is sold.', 'I can find a bug by watching a variable on the screen.', 'I can add to a variable with a second event.'],
    curriculum: ['ssr', 'reason', 'debug1'],
    words: [['stock', 'how many things a shop has left to sell'], ['condition', 'a question with a yes or no answer, like stock > 0'], ['if … else', 'do one thing if the condition is true, and something else if it is not'], ['bug', 'a mistake in the code that makes it do the wrong thing']],
    need: ['A device per pupil or pair, with CodeJump open', 'Five counters or paper “ice creams” for the warm-up'],
    plan: [
      { min: 8, title: 'The ice cream seller', html: '<p>One pupil is the seller with 5 counters (ice creams). Others come up one at a time to buy one, while the class keeps two tallies on the board: <b>left</b> and <b>sold</b>. When the counters run out, one more pupil asks. <b>Ask:</b> what should the seller say? (Sorry, sold out!) What does a real seller check before every sale? (Have I got any left?) That check is a <b>condition</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press Run. The screen shows <b>Ice creams left: 5  Sold: 0</b>. Click the pink stand: left 4, sold 1, and the stand says Enjoy!. Keep clicking: 0, then −1, −2. <b>Ask:</b> what is wrong? (It sells ice creams it hasn’t got.) Read the code under <b>when stand is clicked</b>: change stock by -1, change sold by 1, show, says Enjoy!. Nothing checks the stock. Model: from <b>Control</b>, drag <b>if … else</b> into when stand is clicked; from <b>Operators</b>, the compare block with <b>stock</b> on the left, <b>&gt;</b> and <b>0</b> on the right.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card and watch the Goals tick. To tick the Sold out goal they must click the stand until the stock runs out.</p><p><b>The answer:</b> when stand is clicked { if stock &gt; 0 { change stock by -1 · change sold by 1 · show (create text with “Ice creams left: ”, stock, “  Sold: ”, sold) on the screen · stand says “Enjoy!” } else { stand says “Sold out!” } }. when van is clicked { change stock by 10 · show (the same) on the screen · van says “Delivery!” for 2 seconds }. Then sell 5, see Sold out!, click the van and sell 3 more.</p><p><b>Common bugs:</b> the selling blocks left under the if … else instead of inside the if part (it still sells when sold out); the condition the wrong way round (0 &gt; stock), so it never sells; stock ≥ 0, so it sells one too many and stock reaches −1; the van changes stock by -10, or changes sold; no show block in the van event, so the screen is out of date until the next sale. <b>Ask:</b> “Is stock &gt; 0 true or false right now? So which part runs?”</p>' },
      { min: 10, title: 'Trace it', html: '<p>Trace table on the board: click, stock &gt; 0?, stock, sold, the stand says. Start: 5, 0. After each sale stock goes down and sold goes up. On the 6th click: stock &gt; 0 is false, so the else part runs: Sold out!, and stock stays 0. The van: stock 10, sold 5. <b>Ask:</b> how many more clicks to reach 8 sold? (3.) What if the van brought only 2?</p>' },
      { min: 7, title: 'Plenary', html: '<p><b>Ask:</b> which variables does the stand use, and which events change each one? Why must the check come before the sale? Next lesson is the grand opening: you design your own park game with everything from Block 4.</p>' }
    ],
    support: 'Give pupils the if … else with stock > 0 already in it; they drag the four selling blocks into the if part and add “stand says Sold out!” in the else part.',
    stretch: 'Add a money variable that goes up by 2 for every ice cream sold, and show it on the screen too. Make the van only deliver when stock is less than 3; otherwise the van says “You still have some!”.',
    assess: ['Finds the bug by watching the variable on the screen', 'Checks a variable with if … else before changing it', 'Changes stock and sold correctly, and adds a delivery with a second event'],
    steps: [
      { t: 'Find the bug', d: 'Press Run and click the pink stand 7 times. Watch “Ice creams left”. What goes wrong? Press Stop.' },
      { t: 'If … else', d: 'From Control, drag “if … else” into “when stand is clicked”, above the other blocks.' },
      { t: 'The condition', d: 'From Operators, put a compare block in the if. Make it stock > 0 (the stock block from Variables, then >, then 0).' },
      { t: 'Sell one', d: 'Drag the two change blocks, the show block and “stand says Enjoy!” into the top gap of the if.' },
      { t: 'Sold out', d: 'In the else gap, add “… says …”. Choose stand and type Sold out! Press Run and click the stand until it says Sold out!' },
      { t: 'A delivery', d: 'Drag “when … is clicked” into an empty space and choose van. Inside: “change stock by 10”, a copy of the show block, and “van says Delivery! for 2 seconds”.' },
      { t: 'Sell 8', d: 'Press Run. Sell until it is sold out, click the van, then sell again until 8 are sold. Check the Goals.' },
      { t: 'Challenge', d: 'Add a money variable that goes up by 2 for every ice cream sold.' }
    ]
  },
  {
    id: 'park-24-opening', unit: 'Park Designers · Block 4 · Lesson 6', title: 'Project: the grand opening', ks: 'ks2', years: 'Year 6', minutes: 60, type: '3d', tool: '3D World (blocks)',
    summary: 'The final project of Park Designers: pupils plan, build and test their own park game for the grand opening, using a variable, an if, an event, a camera block and something shown on the screen, then share it and evaluate a partner’s game.',
    objective: 'We are learning to design, write, test and improve our own game that uses variables, selection, events and the camera.',
    success: ['I can plan a game and decide which variables it needs.', 'I can use a variable, an if and an event in my own game.', 'I can use the camera and the screen to help the player.', 'I can test my game, get feedback and improve it.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['design', 'a plan for what you will make'], ['variable', 'a named value that changes, like a score, money or time'], ['test', 'try your game to check it works as planned'], ['evaluate', 'judge how well it works and what to improve']],
    need: ['A device per pupil or pair, with CodeJump open', 'A planning sheet or paper for the design', 'Sticky notes for feedback (optional)'],
    plan: [
      { min: 10, title: 'Plan on paper', html: '<p>Open the starter: the park gate and two trees, ready for the grand opening. Pupils plan a small game on paper: what the player does, how you win, and a table of variables (name, starting value, what changes it). <b>Ask:</b> which event starts the action: a click, a key, a touch or a message? Where will the camera be?</p><p>Remind them of Block 4: tickets (counting), coaster cam (camera, messages), star hunt (score), beat the clock (countdown, if … else), the ice cream stand (stock, sold and if … else).</p>' },
      { min: 30, title: 'Build and test', html: '<p>Pupils build their game. The Goals checklist is the success criteria: a variable changes, an if decides something, an event starts the action, a camera block, and something shown on the screen. Encourage Run after every few blocks.</p><p><b>Example answer:</b> a player (Characters, “make … fall and bump”, “control player with the arrow keys”, camera follows player from behind), a Diamond called prize, set gems to 0 and show “Gems: ” gems. When player touches prize { change gems by 1 · show the gems · move prize by x 0 y 0 z 5 · if gems = 3 { player says “Park complete!” for 3 seconds } }.</p><p><b>Common bugs:</b> a new object that has no name (each needs its own variable, made with Variables → Create variable); a variable never set at the start; the show block not repeated after a change. <b>Ask:</b> “Show me in your plan which block changes this variable.”</p>' },
      { min: 13, title: 'Grand opening', html: '<p>Pupils swap seats and play a partner’s game. They leave one star (what works well) and one wish (one thing to improve), naming a block if they can. Pupils then make one improvement from their feedback.</p>' },
      { min: 7, title: 'Evaluate', html: '<p>Pupils finish the sentence: “My game uses the variable … which changes when … My if decides … I improved …”. Celebrate the Park Designers: sequence and events, loops, selection and now variables, cameras and messages.</p>' }
    ],
    support: 'Start from the star hunt idea: one player, one thing to collect and a score. Add an if when the score reaches 3.',
    stretch: 'Use two variables that work together (a score and a clock, or stock and sold) and a broadcast to start a winning ending.',
    assess: ['Plans the game and its variables before coding', 'Uses a variable, selection, an event and the camera purposefully', 'Tests, responds to feedback and improves the game'],
    steps: [
      { t: 'Plan it', d: 'On paper: what does the player do? How do you win? Which variables do you need, and what changes them?' },
      { t: 'Build your park', d: 'Add a player or rides, things to catch or click. Give each new thing its own name with Variables → Create variable.' },
      { t: 'A variable', d: 'Set your variable at the start of “when Run is clicked”, then change it when something happens.' },
      { t: 'An event and an if', d: 'Use a “when … is clicked”, “when … key pressed” or “when … touches …” event. Put an if inside to decide something, like if score = 3.' },
      { t: 'Camera and screen', d: 'Add a block from Camera, and show your variable with “show … on the screen”.' },
      { t: 'Check the Goals', d: 'Press Run and play. Do all five Goals tick? Fix anything that doesn’t.' },
      { t: 'Grand opening', d: 'Let a partner play. Ask for one star and one wish, then make one improvement.' }
    ]
  }
];

const SLIDES = {
  'academy-7-bridge': [
    { t: 'Bugs', lead: 'A bug is a mistake that makes a program do the wrong thing.', b: ['Expected: what we thought would happen', 'Actual: what really happened'], notes: 'Recipe with a mistake as the warm-up.' },
    { t: 'The broken bridge', pic: true, b: ['Odo’s program has TWO bugs', 'Watch it run before changing anything'], notes: 'Run the starter on the board and watch together.' },
    { t: 'How to debug', b: ['1. Watch it run', '2. Expected vs actual', '3. Find the FIRST thing that went wrong', '4. Change one thing', '5. Test again'], notes: 'Pupils keep a bug log.' },
    { use: 'steps' },
    { t: 'Think', q: 'Which bug was hardest to find? Why?', notes: 'Answer: move forward 3 (not 2) and repeat 5 (not 4).' }
  ],
  'academy-8-lighthouse': [
    { t: 'Predict first', q: 'How tall will this build? Where will the lamp go?', code: 'repeat 6:\n    move up 1\n    place white forward\nplace lamp up', notes: 'Votes before running.' },
    { t: 'Trace a loop', table: [['Time round', 'Helper height', 'Block placed at'], ['1', '2', '2'], ['2', '3', '3'], ['3', '4', '4']], q: 'What is at height 1?', notes: 'Nothing: the move comes before the place.' },
    { t: 'The lighthouse', pic: true, b: ['8 blocks tall', 'Starting on the ground', 'Lamp on top'], notes: 'Three bugs: count, order, lamp direction.' },
    { use: 'steps' },
    { t: 'Off by one', lead: 'Loops that run one time too many or too few are very common bugs.', notes: 'Answer: repeat 8 { place white forward · move up 1 } · place lamp forward.' }
  ],
  'academy-9-beach': [
    { t: 'If…', q: 'Stand up IF you are wearing blue.', notes: 'The condition decides who stands.' },
    { t: 'Condition', lead: 'A condition is a question that is true or false.', b: ['Is the block below cobblestone?', 'true → dig it', 'false → leave it'], notes: 'Selection = choosing what to do.' },
    { t: 'The rocky beach', pic: true, b: ['Dig up the rocks', 'Keep the sand'], notes: 'Show why “dig every step” fails the sand task.' },
    { use: 'steps' },
    { t: 'Think', q: 'How many times did the helper check the condition?', notes: '12 — once every time round the loop. Next: if … else.' }
  ],
  'academy-10-maze': [
    { t: 'Blindfold maze', q: 'If there is a wall in front, which way should you turn?', notes: 'Act it out with desks.' },
    { t: 'If … else', code: 'if hedge in front:\n    if hedge on the left:\n        turn right\n    else:\n        turn left\nelse:\n    move forward 1', notes: 'An if inside an if: nested.' },
    { t: 'The hedge maze', pic: true, b: ['Don’t plan every step', 'Write rules the helper repeats'], notes: 'The starter only turns right, so it gets stuck.' },
    { use: 'steps' },
    { t: 'Rules vs routes', q: 'Would your code work in a different maze?', notes: 'Rules work in any corridor maze; a planned route only works in one.' }
  ],
  'academy-11-orchard': [
    { t: 'And or or?', b: ['Stand up if you have a pet OR a sibling', 'Stand up if you have a pet AND a sibling'], notes: 'Fewer stand for and.' },
    { t: 'Truth table', table: [['pumpkin?', 'melon?', 'or', 'and'], ['true', 'false', 'true', 'false'], ['false', 'true', 'true', 'false'], ['false', 'false', 'false', 'false']], notes: 'A block can’t be both, so “and” never picks anything.' },
    { t: 'The orchard', pic: true, b: ['Pick pumpkins OR melons', 'Keep the bushes'], notes: 'The starter only picks pumpkins.' },
    { use: 'steps' },
    { t: 'Not', lead: '“not” turns true into false.', q: 'Could “if not bush” work here?', notes: 'It would also dig empty spaces, which is harmless here but less clear.' }
  ],
  'academy-12-mine': [
    { t: 'Until…', q: 'Keep clapping until I raise my hand. How many claps?', notes: 'Nobody knew the number in advance.' },
    { t: 'Two kinds of loop', table: [['repeat 5', 'repeat until'], ['you know how many times', 'you know when to stop'], ['walk 10 steps', 'walk until you reach the door']], notes: 'While = until turned round.' },
    { t: 'The gold mine', pic: true, b: ['How deep is the gold? Nobody knows!', 'Stop right on top of it'], notes: 'The starter digs only 3 times.' },
    { use: 'steps' },
    { t: 'Block 2 done!', b: ['Debugging', 'If and if … else', 'And, or, not', 'Repeat until'], notes: 'Next: variables, events and our own blocks.' }
  ],
  'academy-13-crops': [
    { t: 'A box with a name', lead: 'A variable is a named box that remembers a value.', notes: 'Use a real box labelled pumpkins and counters.' },
    { t: 'Three things to do', b: ['Set it: pumpkins = 0 (before the loop)', 'Change it: pumpkins + 1 (when you see one)', 'Use it: say pumpkins (after the loop)'], notes: 'Common bugs: set inside the loop, say inside the loop.' },
    { t: 'Count the crops', pic: true, b: ['12 plants in the row', 'How many are pumpkins?'], notes: 'There are 7.' },
    { use: 'steps' },
    { t: 'Trace it', table: [['Step', 'On the left', 'pumpkins'], ['1', 'pumpkin', '1'], ['2', 'melon', '1'], ['3', 'pumpkin', '2']], q: 'Where do games use variables?', notes: 'Score, lives, time.' }
  ],
  'academy-14-stairs': [
    { t: 'Cube stairs', q: '1, 2, 3, 4… how many cubes for 6 steps?', notes: '21.' },
    { t: 'A loop inside a loop', code: 'height = 1\nrepeat 6:\n    repeat height:\n        place, move up\n    move down height\n    move forward 1\n    height = height + 1', notes: 'The variable controls the inner loop.' },
    { t: 'The staircase', pic: true, b: ['Steps 1 to 6 tall', 'Up to the castle'], notes: 'Builder Val explains.' },
    { use: 'steps' },
    { t: 'Trace it', table: [['Time round', 'height', 'Total blocks'], ['1', '1', '1'], ['2', '2', '3'], ['3', '3', '6'], ['6', '6', '21']], notes: 'What would change height by 2 do?' }
  ],
  'academy-15-chat': [
    { t: 'Events', b: ['The bell rings → go to class', 'Doorbell → open the door', 'Press A → jump'], notes: 'The event triggers the code.' },
    { t: 'Your own command', code: 'when I type lamps (n):\n    repeat n:\n        build a lamp post\n        move forward 3', notes: 'The number typed after the word goes into n.' },
    { t: 'The promenade', pic: true, b: ['Type: lamps 4', 'Four lamp posts!'], notes: 'Press T or Enter to open the chat.' },
    { use: 'steps' },
    { t: 'Think', q: 'What is the difference between “when Run is clicked” and “when I type …”?', notes: 'Different events. A program can have many.' }
  ],
  'academy-16-huts': [
    { t: 'Star jumps', lead: 'Once a coach has defined “star jumps”, they just say “10 star jumps”.', notes: 'A function is a named routine.' },
    { t: 'Define and call', code: 'define hut:\n    build one hut front\n    move on\n\nhut\nhut\nhut', notes: 'Python: def hut(): … and hut()' },
    { t: 'Beach huts', pic: true, b: ['Three huts, all the same', 'One block that builds a hut'], notes: 'Sol explains.' },
    { use: 'steps' },
    { t: 'Change it once', q: 'How many places did you change to recolour all the huts?', notes: 'One. That is the power of functions.' }
  ],
  'academy-17-towers': [
    { t: 'One recipe, many sizes', q: 'Do we need a new recipe for 2 slices of cheese and for 3?', notes: 'No: the recipe takes an input.' },
    { t: 'Inputs', code: 'define tower(height):\n    repeat height:\n        place, move up\n    lantern\n\ntower(3)\ntower(5)\ntower(7)', notes: 'height is the input; 3, 5 and 7 are the values passed in.' },
    { t: 'The harbour lights', pic: true, b: ['Towers 3, 5 and 7 tall', 'A lantern on each'], notes: 'Each tower stands on a gold mark.' },
    { use: 'steps' },
    { t: 'Think', q: 'How is an input like a variable?', notes: 'It is a variable that gets its value when the block is used.' }
  ],
  'academy-18-district': [
    { t: 'Your district', pic: true, b: ['Plan it', 'Code it with your own blocks', 'Use a variable and an if'], notes: 'Mayor Juno gives each pupil a plot.' },
    { t: 'Plan first', b: ['What will you build?', 'Which parts repeat? → your own blocks', 'What could change? → a variable', 'What needs a decision? → an if'], notes: 'Squared paper.' },
    { use: 'steps' },
    { t: 'Show and tell', lead: '“My block … builds … My variable … My if decides …”', notes: 'One star and one wish each.' },
    { t: 'Academy graduates!', b: ['Algorithms and sequence', 'Loops and efficiency', 'Debugging and selection', 'Variables, events and functions'], notes: 'Celebrate!' }
  ],
  'academy-1-crate': [
    { t: 'Be the robot', q: 'Which instruction can a robot follow?', b: ['“Go round there and get the box.”', '“Forward 3. Turn right. Forward 2.”'], notes: 'Act it out with a pupil “robot” who can only go forward a number of steps, turn left or turn right. Try the vague instruction first.' },
    { t: 'Algorithm', lead: 'An algorithm is a set of exact steps, in the right order, to do a job.', notes: 'Say the word together. Our robot algorithm used numbers and turns.' },
    { t: 'Welcome to Pebble Island', pic: true, b: ['A robot helper to code', 'Characters who need help', 'One new skill every lesson'], notes: 'Introduce the Academy: each lesson is a new part of the island. Today: the harbour.' },
    { t: 'Plan before you code', lead: 'Draw it, then write it with arrows.', code: '↑ 4\n⟳ turn right\n↑ 5\n⟲ turn left\n↑ 5', notes: 'Pupils draw the path from the Helper camera and write their own plan. This is the answer, so show it only at the end if you prefer.' },
    { use: 'steps' },
    { t: 'Think', q: 'Was everyone’s algorithm the same? Did they all work?', b: ['Test, look, change, test again.'], notes: 'Next lesson: a much longer sequence.' }
  ],
  'academy-2-post': [
    { t: 'Order matters', q: 'What is wrong with this toast?', b: ['1. Eat it', '2. Put the bread in the toaster', '3. Butter it'], notes: 'A sequence only works in the right order.' },
    { t: 'Decompose', lead: 'Break a big job into smaller parts.', b: ['Part 1: to Mill Cottage', 'Part 2: to the bakery', 'Part 3: to the school'], notes: 'One part per letterbox. Code a part, Run, then add the next part.' },
    { t: 'The post round', pic: true, b: ['Follow the gravel path', 'Stop at each red letterbox'], notes: 'Talk to Posty Fen in the starter. The tasks tick when the helper passes each letterbox.' },
    { use: 'steps' },
    { t: 'Bug hunt', q: 'If we swap a turn and a move, where will the helper end up?', b: ['Predict first', 'Then test', 'Look at the newest change first'], notes: 'Swap two blocks in a finished program on the board and debug it together.' },
    { t: 'Think', q: 'Did you see anything that repeated?', notes: 'Hold that thought: loops are coming in lesson 4.' }
  ],
  'academy-3-flowers': [
    { t: 'Put, step, put, step', q: 'What if you step before you put the first one down?', notes: 'Act out putting a pencil on each desk in a row.' },
    { t: 'Actions', lead: 'Some blocks move the helper. Some blocks DO something.', b: ['helper move forward 1 (a move)', 'helper place red block right (an action)'], notes: 'Show the colour drop-down in the place block.' },
    { t: 'The flower bed', pic: true, b: ['Plant 5 flowers in the brown bed', 'Any colours you like'], notes: 'Gardener Ada explains the job.' },
    { use: 'steps' },
    { t: 'Spot the pattern', lead: 'place, move, place, move, place, move…', q: 'How many blocks for 20 flowers?', notes: '39 blocks! Next lesson we learn a shortcut: a loop.' }
  ],
  'academy-4-fence': [
    { t: 'Clap it', q: 'Clap, stamp, clap, stamp, clap, stamp. How can we say that shorter?', notes: '“Repeat 3 times: clap, stamp.” That is a loop.' },
    { t: 'Loop', lead: 'A loop runs the same blocks again and again.', code: 'repeat 10 times:\n    place a post on the left\n    move forward 1', notes: 'The blocks INSIDE the loop are the ones that repeat.' },
    { t: 'Mend the fence', pic: true, b: ['A gap of 10 posts', 'The long way: 20 blocks', 'With a loop: 3 blocks'], notes: 'Farmer Kit explains the job.' },
    { use: 'steps' },
    { t: 'Common bugs', b: ['The move is outside the loop: only one post', 'The number is wrong: too few posts', 'Place and move swapped: one square late'], notes: 'Debug these on the board if pupils get stuck.' },
    { t: 'Think', q: 'What would you change for a gap of 50?', notes: 'Just the number. That is efficient.' }
  ],
  'academy-5-pen': [
    { t: 'Walk a square', q: 'What repeats when you walk round a square?', notes: 'Forward and turn right, four times.' },
    { t: 'Efficient', lead: 'An efficient program does the job with as few blocks as possible.', notes: 'Easier to read, easier to change.' },
    { t: 'The sheep pen challenge', pic: true, b: ['Build the pen with a trail of tree trunks', '3 stars for 5 blocks or fewer', 'Count every block'], notes: 'Pressing Run starts the challenge clock.' },
    { use: 'steps' },
    { t: 'Compare', table: [['The long way', 'With a loop'], ['11 blocks', '5 blocks'], ['1 star', '3 stars']], q: 'Both work. Which is better, and why?', notes: 'For a bigger pen the loop version only changes one number.' }
  ],
  'academy-6-market': [
    { t: 'Market day!', pic: true, b: ['Build stalls in the tiled square', 'Use at least one loop', '30 blocks of building'], notes: 'Visit Mayor Juno’s stall for ideas.' },
    { t: 'What repeats?', b: ['A post: blocks on top of each other', 'A stall: four posts the same', 'A market: stalls that look alike'], notes: 'Each of these could be a loop.' },
    { t: 'Design first', lead: 'Draw it from the front and from above. Mark the loops.', notes: 'Pupils plan on squared paper before coding.' },
    { use: 'steps' },
    { t: 'Share', lead: '“My loop builds … It repeats … times.”', q: 'What would you improve next?', notes: 'Gallery walk, then recap Block 1: algorithm, sequence, actions, loops, efficiency, project.' }
  ],
  'cat-to-star': [
    { t: 'Be a robot!', q: 'Which instruction can a robot follow?', b: ['“Take 3 steps forward. Turn right.”', '“Go over there.”'], notes: 'Choose a pupil to be the robot. Give the exact instruction first, then the vague one. Ask which worked and why computers need exact steps.' },
    { t: 'Algorithm', lead: 'An algorithm is a set of steps in the right order.', notes: 'Say the word together. Ask: what was the algorithm for our robot?' },
    { t: 'Our mission', pic: true, b: ['Make the cat walk to the star.', 'Join blocks to make a program.', 'Press GO to run it.'], notes: 'Press Open the starter (under the slide). Drag the flag block into the script area, then one move-right arrow. Press GO: the cat moves one step.' },
    { t: 'Count the squares', q: 'How many steps does the cat need to reach the star?', notes: 'Count together. Change the number on the block with + or − and press GO again.' },
    { use: 'steps' },
    { t: 'Show and tell', b: ['Read your program out loud.', '“When GO is pressed, move right 5, then say I did it!”'], q: 'Did anyone use different blocks to get there?', notes: 'Two or three pupils show their program on the board. Read each one aloud as an algorithm.' }
  ],
  'fix-the-dance': [
    { t: 'The dance', b: ['3 steps right', 'hop', '3 steps back left', 'say “Ta-da!”'], lead: 'Let’s all do it!', notes: 'Do the dance together as a class.' },
    { t: 'Predict', pic: true, q: 'Will the cat do our dance?', b: ['Read the blocks one by one.', 'Don’t press GO yet!', 'Vote: yes or no?'], notes: 'Open the starter. Read the program aloud block by block without pressing GO. Take a vote, then press GO.' },
    { t: 'Bugs', lead: 'A bug is a mistake in a program. To debug means to find and fix the mistakes.', notes: 'There are two bugs: a turn block instead of a hop, and moving back left only 2 instead of 3. Don’t give them away!' },
    { t: 'How to debug', b: ['Test: press GO and watch.', 'Spot what is different.', 'Change ONE block.', 'Test again.'], notes: 'Encourage “change one thing, then test”.' },
    { use: 'steps' },
    { t: 'Bug hunters', b: ['Swap with a partner.', 'Put ONE new bug in their dance.', 'Swap back. Can they find it?'], notes: 'Pupils swap devices, add one bug, swap back and debug.' },
    { t: 'Think', q: 'What is the best way to find a bug?', notes: 'Look for: test it, compare what happens with what should happen, change one thing at a time.' }
  ],
  'level-for-a-friend': [
    { t: 'What makes a good level?', pic: true, q: 'What do we need to add so the player can reach the Finish?', notes: 'Open the starter. It has a Start, a Finish flag and a big gap. Press Play and fall in the gap!' },
    { t: 'Build a bit, test a bit', b: ['Build a few blocks.', 'Press Play to test.', 'Fix it.', 'Build some more!'], notes: 'Insist on testing after every few changes.' },
    { use: 'steps' },
    { t: 'Friend test', b: ['Swap seats.', 'Play your partner’s level.', 'Say one thing you liked.', 'Say one thing to make better.'], notes: 'Model kind, helpful feedback first.' },
    { t: 'Make it better', lead: 'Make one change after your friend’s test.', notes: 'Pupils go back to their own level and improve one thing.' },
    { t: 'Think', q: 'Why did we test our levels?', b: ['What did you change after your friend played?'], notes: 'Draw out: testing finds problems we didn’t know were there.' }
  ],
  'turtle-shapes': [
    { t: 'Spot the pattern', pic: true, code: 'fd 100\nrt 90\nfd 100\nrt 90\nfd 100\nrt 90\nfd 100\nrt 90', q: 'What do you notice?', notes: 'Open the starter and press Run. fd 100 and rt 90 happen four times.' },
    { t: 'Repeat', code: 'repeat 4 [fd 100 rt 90]', b: ['The number says how many times.', 'The [square brackets] hold the steps to repeat.'], notes: 'Replace the eight lines with this and Run. Same square, one line!' },
    { t: 'Shape hunt', table: [['Shape', 'Sides', 'Turn', 'Sides × turn'], ['Square', '4', '90', '360'], ['Triangle', '3', '?', '?'], ['Hexagon', '6', '?', '?'], ['Octagon', '8', '?', '?']], notes: 'Many will guess rt 60 for a triangle. Let them test it and see why it fails. Fill the table in as pupils find each turn (120, 60, 45): sides × turn is always 360.' },
    { use: 'steps' },
    { t: 'A loop inside a loop', code: 'repeat 12 [repeat 4 [fd 80 rt 90] rt 30]', b: ['Change the numbers.', 'Add setpencolor "blue at the start.'], notes: 'Pupils make their own pattern and change colours.' },
    { t: 'Think', q: 'How would you draw a 10-sided shape?', b: ['Why are loops useful?'], notes: 'Answer: repeat 10 [fd 50 rt 36] — 360 ÷ 10 = 36.' }
  ],
  'catch-the-stars': [
    { t: 'Play the game', pic: true, q: 'What should happen when the star touches the catcher?', notes: 'Open the starter and press Run. The catcher moves with the arrow keys, but catching the star does nothing.' },
    { t: 'If … then', lead: 'If the star is touching the catcher, then add 1 to the score and go back to the top.', b: ['Choosing what to do is called selection.', '“touching Catcher?” is the condition: true or false.'], notes: 'Write the sentence on the board too.' },
    { t: 'Read the Star’s code', b: ['A forever loop moves it down.', 'An if sends it back to the top when it reaches the bottom.'], q: 'Where should our new if go?', notes: 'Click the Star sprite and read its blocks together. That first if is selection already!' },
    { use: 'steps' },
    { t: 'How often does it check?', q: 'What happens if the if block is outside the forever loop?', notes: 'It only checks once, at the start. Inside the loop it checks every moment.' },
    { t: 'Explain it', b: ['Tell a partner what your if block does.', 'Use the words condition and selection.'], notes: 'Listen for: the condition is “touching Catcher?”; selection chooses whether to add to the score.' }
  ],
  'microbit-rps': [
    { t: 'Rock, paper, scissors', q: 'How could a computer choose fairly?', notes: 'Play a round or two with the class first.' },
    { t: 'Random', lead: 'Random means it cannot be predicted.', b: ['Like rolling a dice.'], notes: 'Ask for other random things: shuffling cards, picking a name from a hat.' },
    { t: 'Read the starter', pic: true, b: ['on shake: the input', 'set hand to random 1 to 3: a variable', 'if hand = 1: selection', 'show leds: the output'], q: 'Why does nothing show sometimes?', notes: 'Open the starter, press Run, then the Shake button a few times. 2 and 3 have no pictures yet.' },
    { use: 'steps' },
    { t: 'Real micro:bits', b: ['Press the micro:bit button at the top.', 'Flash over USB (Chrome or Edge),', 'or Download .hex and drag it onto the MICROBIT drive.'], notes: 'Optional: needs micro:bit V2 boards and USB cables.' },
    { t: 'Label your code', b: ['input', 'variable', 'random', 'selection', 'output'], q: 'Which part of your code is each one?', notes: 'Pupils point to or label each part of their program.' }
  ],
  'critter-engineers': [
    { t: 'How do animals walk?', q: 'Do four-legged animals move all their legs at once?', notes: 'Show a video of a horse or a dog walking if you can.' },
    { t: 'Fair test', lead: 'Change only ONE thing, then test again.', b: ['Then you know what made the difference.'], notes: 'Engineers test like this.' },
    { t: 'Test the starter', pic: true, b: ['Press Test it!', 'Watch the Sprint.', 'Write down the distance.'], notes: 'It rocks from side to side and gets about 1 m: the front and back feet on each side step at the same time.' },
    { t: 'Results table', table: [['Change', 'Sprint distance'], ['Starter (no change)', ''], ['', ''], ['', ''], ['', '']], notes: 'Pupils copy this table and add one row for every change.' },
    { use: 'steps' },
    { t: 'Think', q: 'Which change made the biggest difference?', b: ['How do you know it was that change?'], notes: 'Opposite beat on both back feet makes diagonal feet step together (a trot), nearly 3 m. We know because it was the only change.' }
  ],
  'obstacle-course': [
    { t: 'Play the course', pic: true, b: ['Press Run.', 'Arrow keys walk. Space jumps.', 'Reach the gold finish block!'], q: 'Which block made “You made it!” appear?', notes: 'Open the starter and play it on the board.' },
    { t: 'Events', lead: 'An event is something that happens, like touching, that starts code.', b: ['when player touches finish → say “You made it!”'], notes: 'Find the event block together.' },
    { t: 'Where is it?', b: ['x: left and right', 'y: up and down', 'z: forwards and backwards'], notes: 'Press Stop, click the wall and drag its arrows. Watch the x, y, z numbers change in its block.' },
    { t: 'Every object needs a name', b: ['Variables → Create variable', 'Pick the name in the make block.'], notes: 'Show this once on the board before pupils add their own walls.' },
    { use: 'steps' },
    { t: 'Swap and play', b: ['Play a partner’s course.', 'Suggest one improvement.'], notes: 'Pupils return to their own course to make the change.' },
    { t: 'Think', q: 'Which parts of your game were events? Which used a loop?', notes: 'Touch events: finish and lava. Loop: the forever loop that glides the mover.' }
  ],
  'smart-trains': [
    { t: 'Be a smart train', q: 'How did you know when to stop?', b: ['Red = stop and count to 2', 'Green = walk slowly', 'White = get ready'], notes: 'Pupils walk as trains while you hold up colour cards. Then ask how they knew: they sensed the colour with their eyes and decided what to do.' },
    { t: 'Sense, decide, act', lead: 'A sensor is an input: it tells the computer about the world.', b: ['Input: the colour sensor under the train', 'Decide: what should it do about it?', 'Output: the motor and the lights'], notes: 'Link back to the warm-up: eyes = sensor, legs = motor.' },
    { t: 'Watch the train', pic: true, q: 'What does the train do at each coloured snap?', notes: 'Open the starter and press Run. It stops at white-red by the station and slows down at white-green. Point out the split and the Depot sign on the passing loop.' },
    { t: 'Events', lead: 'An event is something that happens that starts a script.', b: ['when train sees red (1)', '→ set top LED color to red'], notes: 'The script waits until the sensor sees red. Build it together, then pupils build their own.' },
    { t: 'Decide at the split', lead: 'If laps < 3, go straight on. Else, go right to the depot.', b: ['“laps < 3” is the condition: true or false.', 'Choosing which way is called selection.'], q: 'Why decide at the station, not at the split?', notes: 'The decision has to be made before the train reaches the split, and the station (red) comes just before it.' },
    { use: 'steps' },
    { t: 'Where else?', b: ['Automatic doors', 'Traffic lights', 'Railway signals', 'Self-driving cars'], q: 'What does each one sense? What does it decide?', notes: 'For example: an automatic door senses a person coming; if someone is there it opens, else it stays shut.' },
    { t: 'Label your program', b: ['input (sensor)', 'event', 'variable', 'condition', 'selection', 'output'], q: 'Which block is each one?', notes: 'Pupils point to each part of their program, or label a screenshot.' }
  ],
  'teach-the-computer': [
    { t: 'Describe a cat', q: 'Can you write rules that describe every cat — and only cats?', b: ['Four legs? So does a dog.', 'Pointy ears? So does a fox.'], notes: 'Let pupils try for a minute. Rules get very hard very quickly.' },
    { t: 'Learning from examples', lead: 'Machine learning: the computer learns from lots of labelled examples instead of being given rules.', b: ['Examples → practise → test'], notes: 'People learn what a cat is from seeing lots of cats. Some AI learns the same way.' },
    { t: 'Meet the AI', pic: true, b: ['Two labels: circle and triangle', 'Three drawings each', 'Train it, then test it'], notes: 'Open the starter. Press Train in 2 Train & test. Draw a circle, then a triangle, on the test pad.' },
    { t: 'Confidently wrong', q: 'We draw a square. What will it say?', b: ['It only knows circle and triangle.', 'It has to pick one — and it can be very sure and still wrong!'], notes: 'Draw a square on the test pad. It usually says circle or triangle with a high percentage.' },
    { t: 'A fair test', lead: 'Test an AI on examples it has never seen.', b: ['The AI Lab hides 1 in 4 of your drawings while it practises.', 'Then it asks the AI about them.'], notes: 'Ask: why is it not fair to test it only on the drawings it practised on? (It could just remember them.)' },
    { use: 'steps' },
    { t: 'Is AI always right?', q: 'Would you let an AI decide which messages to block?', b: ['Try the “Kind or unkind messages” examples.', '“I love your drawing” → unkind?!'], notes: 'Demo it on the board (Ready-made examples → Kind or unkind messages, Train, type messages). The AI learned that “your drawing” went with unkind messages. This is bias.' },
    { t: 'Think', q: 'How did you make your AI better?', b: ['Why does it matter who chooses the examples?'], notes: 'Listen for: more examples, more varied examples, a label for every kind of thing, and testing on new examples. Bias: if the examples are unfair or narrow, so is the AI.' }
  ],
  'level-designers': [
    { t: 'Games have rules', q: 'How do you win a game you know? How do you lose?', b: ['What are you allowed to do?', 'What is not allowed?'], notes: 'Take examples from board games and playground games. Today we look at the rules behind a computer game.' },
    { t: 'Events', lead: 'An event is something that happens, like pressing a key, that makes code run.', b: ['when Right Arrow is pressed → move right', 'when Space Bar is pressed → jump'], notes: 'Act it out: when I clap, you stand up. The clap is the event; standing up is the code it runs.' },
    { t: 'Read the code', pic: true, b: ['Events: which key does what?', 'Rules: how do you win? How many lives?'], q: 'What will happen when we press the Right Arrow?', notes: 'Open the starter and press Code before Play. Read the blocks together, take predictions, then press Test it — switch to Play! The controls are backwards: the first bug.' },
    { t: 'How to debug', b: ['Test: play it and watch.', 'Spot what is different from the plan.', 'Change ONE thing.', 'Test again.'], notes: 'There are two bugs: one in the code (backwards controls) and one in the level (a gem too high to reach, so you can never collect them all). Don’t give the second one away!' },
    { use: 'steps' },
    { t: 'Partner test', b: ['Play your partner’s game.', 'Can it be won?', 'Say one thing you liked.', 'Say one bug or improvement.'], notes: 'Designers fix what their tester found, then test again.' },
    { t: 'Think', q: 'Which bug was in the code, and which was in the level?', b: ['How did testing help you find them?'], notes: 'Bug 1 (backwards controls) was in the events; bug 2 (the high gem) was in the level, and it broke the rule “win by collecting all gems”. Both were found by testing and comparing with the plan.' }
  ],
  'code-the-rules': [
    { t: 'Too easy!', pic: true, q: 'What rules could make this level a challenge?', notes: 'Open the starter, press Code, then Test it — switch to Play! and walk to the Finish. Its only rule is win by reaching the goal.' },
    { t: 'Variables', lead: 'A variable is a named value that can change while the game runs.', b: ['time: 30, 29, 28 …', 'gems: 0, 1, 2 …'], notes: 'Link to the warm-up cards: each card had a name and a value that changed.' },
    { t: 'Our rules', b: ['Every second, take 1 off time.', 'If time = 0, then game over.', 'When I collect a gem, add 1 to gems and 5 to time.', 'If gems = 3, then give a bonus life.'], q: 'Which words are variables? Which are events?', notes: 'Underline the variables (time, gems), the events (every second, when I collect a gem) and the conditions (time = 0, gems = 3).' },
    { t: 'Selection', lead: 'If … then: the computer checks a condition and only runs the blocks inside when it is true.', q: 'At the start, is “time = 0” true or false?', notes: 'False: time is 30. It only becomes true when the countdown reaches 0, and then game over runs.' },
    { use: 'steps' },
    { t: 'Test every rule', b: ['Stand still: does the game end at 0?', 'Collect 3 gems: one extra life?', 'Collect a 4th gem: another life?'], notes: 'Test each rule on purpose, one at a time. The 4th gem gives no life because gems = 3 is no longer true.' },
    { t: 'Think', q: 'Why does the bonus life only happen once?', b: ['Point to a variable, an event, a condition and the selection in your code.'], notes: 'gems = 3 is only true on the 3rd gem. Listen for the key words used correctly.' }
  ],
  'stage-animate': [
    { t: 'Simon says… with events', q: 'What makes you start each move?', b: ['When I clap → jump', 'When I wave → spin', 'When I say go → march 4 steps'], notes: 'Play for a minute. Each move only happens when its signal happens. Introduce the word event: something that happens and starts a set of instructions.' },
    { t: 'Meet the party', pic: true, b: ['The Cat starts when the green flag is clicked (Run).', 'The Bird has no code yet.', 'The Robot starts when the space key is pressed.'], q: 'Which event starts each sprite?', notes: 'Open the starter and press Run. Click each sprite in the sprite list and read its blocks together.' },
    { t: 'Repeat', lead: 'A repeat loop runs the blocks inside it again and again.', b: ['repeat 10: next costume, wait 1 seconds', '= 20 blocks in just 3!'], q: 'What would happen without the wait?', notes: 'Model the Cat’s loop on the board, then press Run. Without the wait the costume changes too fast to see.' },
    { t: 'Sequence', lead: 'Blocks run in order, from top to bottom.', b: ['First: say Let’s dance! for 2 secs', 'Then: the repeat loop'], q: 'What happens if we put the say block after the loop?', notes: 'Swap the order on the board to show that the order changes what the Cat does.' },
    { use: 'steps' },
    { t: 'The floating Robot', q: 'Why does the Robot get higher every time?', b: ['change y by 40 (up)', 'wait 0.3 seconds', 'change y by -4 (down)'], notes: 'Up 40 but down only 4, so each jump leaves it 36 higher. Fix: change y by -40. Ask how pupils found it: by testing and reading the blocks.' },
    { t: 'Think', q: 'How many events did your party use?', b: ['Why is a repeat loop better than copying blocks?', 'How did you find the Robot’s bug?'], notes: 'Listen for: green flag, click and key events; loops make programs shorter and easier to change; testing showed the bug and reading the numbers found it. Next time (Catch the stars) we add if … then and a score.' }
  ],
  'turtle-procedures': [
    { t: 'Break it down', q: 'What parts is this street made of?', b: ['A street is 3 houses.', 'A house is walls and a roof.', 'Walls are a square; a roof is a triangle.'], notes: 'Draw three simple houses on the board first. Introduce decompose: breaking a big problem into smaller parts.' },
    { t: 'A house, the long way', pic: true, code: 'repeat 4 [fd 100 rt 90]\nfd 100\nrt 30\nrepeat 3 [fd 100 rt 120]\nlt 30\nbk 100', q: 'Which lines are the walls? Which are the roof?', notes: 'Open the starter and press Run. To make it bigger you would have to change four numbers, and it only draws one house.' },
    { t: 'Teach the turtle a new word', code: 'to house :size\n  repeat 4 [fd :size rt 90]\n  fd :size\n  rt 30\n  repeat 3 [fd :size rt 120]\n  lt 30\n  bk :size\nend\n\nhouse 100\nhouse 50', b: ['to … end teaches a procedure.', 'house 100 calls (uses) it.', ':size is a parameter: a new value each time.'], notes: 'Build it live. Press Run before typing house 100: nothing is drawn, because defining a procedure does not use it.' },
    { t: 'A procedure that uses a procedure', code: 'to street\n  repeat 3 [house 60 pu rt 90 fd 90 lt 90 pd]\nend\n\npu setxy -250 0 pd\nstreet', q: 'Why does the street line up neatly?', notes: 'House finishes where it started, facing up. If it didn’t, every house would start somewhere strange. pu and pd lift and lower the pen between houses.' },
    { use: 'steps' },
    { t: 'One procedure, any shape', code: 'to poly :sides :size\n  repeat :sides [fd :size rt 360 / :sides]\nend', b: ['Two parameters.', 'Remember: sides × turn = 360, so turn = 360 ÷ sides.', 'poly 4 :size makes the walls, poly 3 :size the roof.'], notes: 'This uses the rule from the Shapes with repeat lesson. Ask: what does poly 360 1 draw? (Nearly a circle.)' },
    { t: 'Think', q: 'Why are procedures useful?', b: ['What would you change to give every house a door?', 'Where else do we break a big job into smaller jobs?'], notes: 'Listen for: shorter code, reuse, easier to fix (change house once and every house changes). Examples: recipes, getting ready for school, building with Lego.' }
  ],
  'critter-builders': [
    { t: 'How do animals move?', q: 'Is it faster to walk on four legs, or to pull yourself along with just your arms?', notes: 'Two pupils act it out: one walks on all fours, one drags their legs behind. Link to Scoot, who only has front legs.' },
    { t: 'Design, test, improve', lead: 'Engineers make something, try it out, then make it better.', b: ['Design: make it', 'Test: try it out', 'Improve: change it and test again'], notes: 'Introduce the three words. We will go round this loop lots of times today.' },
    { t: 'Meet Scoot', pic: true, b: ['Press Test it!', 'Watch the Sprint.', 'How far did it go?'], q: 'What is the bug in this design?', notes: 'Open the starter and run the Sprint. It gets 0.0 m: the back of the body drags on the ground. Ask pupils to spot why before they start.' },
    { t: 'Results list', table: [['What I changed', 'How far it went'], ['Starter (no change)', '0.0 m'], ['', ''], ['', ''], ['', '']], notes: 'Pupils copy this and add one line every time they test. With Walking legs at the back it gets about 1 m; with Long legs at the back, about 4.5 m.' },
    { t: 'One change at a time', lead: 'Change just ONE thing, then test.', b: ['Better? Keep it.', 'Worse? Press Undo.'], notes: 'If you change two things at once, you cannot tell which one made the difference.' },
    { use: 'steps' },
    { t: 'Think', q: 'Which change made the biggest difference? Did any change make it worse?', b: ['How do you know it was that change?'], notes: 'Long legs at the back were the biggest jump. A third pair of Walking legs or a longer body made it slower: more is not always better. In Years 5–6 (Critter engineers) we will test the timing of the legs.' }
  ],
  'robot-storyteller': [
    { t: 'The wrong order', q: 'Shoes on, then socks. What went wrong?', b: ['Every step was right.', 'The order was wrong!'], notes: 'Act it out. Draw out that the steps were fine but the sequence was wrong, and that a computer follows the order you give it exactly.' },
    { t: 'Sequence', lead: 'An algorithm is a set of steps. The sequence is the order they go in.', notes: 'Say both words together. Ask: what is the sequence for brushing your teeth?' },
    { t: 'Meet Sparky', pic: true, q: 'Read the blocks like a story. What will Sparky do?', b: ['Don’t press Run yet!', 'Then press Run and watch its face.'], notes: 'Open the starter. Read the script aloud, take predictions, then press Run. Sparky says Good morning while still asleep and only smiles afterwards: a bug in the order.' },
    { t: 'Repeat', lead: 'A repeat block does the same steps again, so you don’t have to copy them.', b: ['One nod = move head nod to 8, then to 2', 'Three nods = repeat 3 times'], q: 'How many blocks would 100 nods need without repeat?', notes: 'Without repeat, 100 nods is 200 blocks. With repeat it is still 3 blocks: change one number.' },
    { t: 'Events', lead: 'An event is something that happens that starts a script.', b: ['when Run is clicked', 'when the robot is tapped', 'when space key pressed'], notes: 'Scene two only runs when someone taps the robot while the program is running. Ask: what events start things in real life? (A doorbell, an alarm clock.)' },
    { use: 'steps' },
    { t: 'Show your story', q: 'Where is the sequence? The repetition? The event?', b: ['What bug did you find?', 'How did you know it was a bug?'], notes: 'Two pairs show their story on the board. Next time, in Robot quiz, Sparky asks questions and keeps score.' }
  ],
  'robot-quiz': [
    { t: 'Be the quiz master', q: 'What is 3 + 4?', b: ['If the answer is 7: smile, say Correct!, add a point.', 'Else: look sad and say the right answer.'], notes: 'Ask the class, then say the rule out loud and write it on the board. Recap Robot storyteller: there Sparky always did the same thing; today the robot decides.' },
    { t: 'Input and output', pic: true, b: ['Input: ask and wait, and the answer', 'Outputs: speech and faces'], q: 'Quizbot says back whatever you type. What does it need to tell right from wrong?', notes: 'Open the starter and press Run. Type something silly. The answer is the input; it needs a rule (if … else) to decide.' },
    { t: 'Selection', lead: 'If the condition is true, do one thing. Else, do another.', b: ['Condition: answer = 7', 'If: happy face, Correct!, change score by 1', 'Else: sad face, Not quite. It is 7.'], notes: 'A condition is a question with a true or false answer. Only one of the two parts runs each time.' },
    { t: 'A variable keeps score', lead: 'A variable is a named value that can change.', b: ['set score to 0 at the start', 'change score by 1 for a right answer', 'say “Your score is ” and score at the end'], q: 'Where must “change score by 1” go? Why?', notes: 'Only in the if part. After the if … else, every answer would score; in the else part, only wrong answers would.' },
    { t: 'Test both ways', b: ['A right answer', 'A wrong answer', 'The highest score possible', 'Something odd, like “seven”'], q: 'Why is one test not enough?', notes: 'Each test only checks one branch. Good test data tries every path through the program.' },
    { use: 'steps' },
    { t: 'Where else?', b: ['A password box', 'A cash machine PIN', 'A times-tables app'], q: 'What is the input? What is the condition? What happens if it is true, and else?', notes: 'For example: a password box takes your typing as input; if it matches, it lets you in, else it says try again.' },
    { t: 'Label your program', b: ['input', 'condition', 'selection', 'variable', 'output'], q: 'Which block is each one?', notes: 'Pupils point to each part of their program, or label a screenshot.' }
  ],
  'ai-happy-sad': [
    { t: 'Sort the faces', q: 'Is this face happy or sad? How do you know?', b: ['Each pile has a label: happy or sad.', 'Each card is an example.'], notes: 'Hold up the face cards and sort them into two piles with the class. Most pupils will say they look at the mouth.' },
    { t: 'Be the computer', q: 'Our “computer” has only seen these piles. Will it get the new face right?', b: ['It can only learn from the examples it is given.'], notes: 'A pupil plays the computer and learns only from your piles, with one smiley face hidden in the sad pile. Show a new happy face and see what they say.' },
    { t: 'Learning from examples', lead: 'Machine learning: the computer learns from labelled examples instead of being given rules.', b: ['Examples → train → test'], notes: 'People learn what a happy face is by seeing lots of them. Some computers learn the same way. Training means letting it practise on the examples.' },
    { t: 'Meet the AI', pic: true, b: ['Two labels: happy and sad', 'Only a few drawings of each', 'Train it, then test it'], q: 'What will it say if we draw a happy face?', notes: 'Open the starter. Tap 2 Train & test and press Train. Draw a happy face on the test pad: it usually says sad. Ask pupils why, but leave the answer for them to find.' },
    { use: 'steps' },
    { t: 'Better examples', b: ['The right label on every example', 'More examples', 'More different examples: big, small, round, wonky'], q: 'Which of these made the biggest difference to your AI?', notes: 'Pupils share what happened. Taking out the wrong drawing helped a little; adding lots of different faces helped the most.' },
    { t: 'Think', q: 'Why does a computer need good examples?', b: ['Where else might a computer learn from examples?'], notes: 'Listen for: it only knows what it was shown, so wrong or too few examples give wrong answers. Other examples: a phone sorting photos, a spam filter, a voice assistant learning words.' }
  ],
  'train-snaps': [
    { t: 'Colour code', q: 'Which row of colours made you stop?', b: ['white red = stop for 2 seconds', 'white green = go slowly', 'white blue = turn back', 'red white = ?'], notes: 'Pupils walk on the spot as trains while you hold up paper squares. Finish with red white: nobody should stop, because a command starts with white.' },
    { t: 'The snaps are the program', pic: true, lead: 'The train reads the coloured snaps with a sensor underneath it. No blocks today!', b: ['The jobs list at the top is the route.', 'Each job needs the right command in the right place.'], notes: 'Open the starter. Point out the start flag, the train station, the school and the fallen trees, and the jobs list at the top of the board.' },
    { t: 'Snap rules', lead: 'Start with WHITE (the way the train is going). No gaps. All on one piece.', table: [['Command', 'What it does'], ['white red', 'stop for 2 seconds'], ['white green', 'go slowly'], ['white blue', 'turn back'], ['white red blue', 'end the route']], notes: 'Help → Snap commands has the full list. Leave this slide up while pupils work if you can.' },
    { t: 'Predict', q: 'The station has red, then white. Will the train stop?', b: ['Vote: yes or no?', 'Then press Run and watch job 2.'], notes: 'It drives straight past: the train only reads a command that starts with white. This is the bug they will fix first.' },
    { use: 'steps' },
    { t: 'Which way is it going?', lead: 'The train reads snaps in the direction it is going.', b: ['Going right: white is on the left.', 'Coming back: white goes on the right.'], q: 'What happens if white red blue goes from the left?', notes: 'After white blue at the fallen trees, the train comes back the other way, so it meets the right-hand end of the station piece first: white must be in the slot it reaches first. From the left, the train reads white red blue on the way OUT and ends its route straight after the station.' },
    { t: 'Read the algorithm', b: ['white red · white green · white blue · white red blue'], q: 'What would happen if we swapped two commands round?', notes: 'Read the route as a sequence. Next in Years 5–6: the same sensor becomes an input for blocks, so the train can count and decide.' }
  ],
  'world-builders': [
    { t: 'Where is it?', q: 'How many numbers do we need to say exactly where something is?', b: ['Left or right?', 'Up or down?', 'Forwards or backwards?'], notes: 'Use three strips of card like the corner of a box and move a rubber along each one. The answer is three numbers.' },
    { t: 'x, y and z', lead: 'In 3D, every thing has three numbers.', b: ['x: left and right (the red arrow)', 'y: up and down (the green arrow)', 'z: forwards and backwards (the blue arrow)'], notes: 'y = 0 means standing on the ground. A bigger y floats higher.' },
    { t: 'Our world', pic: true, b: ['A gold box, a red ball, a tree and a star', 'Click a thing to move it.', 'Watch the numbers change in its block.'], notes: 'Open the starter. Drag to look around, click the ball and drag its arrows. Then type x 0, y 1, z 0 to put it on the box.' },
    { t: 'Sequence', lead: 'The blocks in “when Run is clicked” run in order, from top to bottom.', b: ['sky colour', 'make box box1', 'make ball ball1', 'make tree1', 'make star', 'set across to -6'], notes: 'Read the starter program out loud as a list of instructions. The last block gets the across variable ready for later.' },
    { t: 'Why only one box?', q: 'We made 5 boxes. Where are they?', b: ['repeat 5 times: make box at x 0', 'All 5 are in the same place!'], notes: 'Build this on the board before showing the across variable. Let pupils work out that the boxes are on top of each other.' },
    { t: 'Counting across', lead: 'A variable can change each time round the loop.', table: [['Time round', 'across', 'Pillar at x'], ['1', '-6', '-6'], ['2', '-3', '-3'], ['3', '0', '0'], ['4', '3', '3'], ['5', '6', '6']], notes: 'across starts at -6. The box uses it for x, then change across by 3 adds 3. Trace it together.' },
    { use: 'steps' },
    { t: 'Think', q: 'How many blocks for 5 pillars? How many for 50?', b: ['repeat stops by itself.', 'forever keeps going until Stop.'], notes: 'With a loop it is the same number of blocks: just change 5 to 50. Next time (Years 5–6): add a player and events to make a game.' }
  ],
  'park-1-gate': [
    { t: 'Welcome, park designers!', pic: true, b: ['This year we design and run a theme park', 'Every lesson adds something new', 'Today: the park gate'], notes: 'Open the starter and drag on the world to look around. Point out the blocks on the left and the world on the right.' },
    { t: 'How do you build a gate?', q: 'What are the steps, in order?', b: ['1. A post on the left', '2. A post on the right', '3. A bar across the top'], notes: 'Build it with pencils and a ruler. Could the bar go first? Not in real life.' },
    { t: 'Algorithm', lead: 'An algorithm is a set of exact steps, in the right order, to do a job.', notes: 'Say the word together. The order of the steps is the sequence.' },
    { t: 'x, y and z', table: [['Number', 'Direction'], ['x', 'across (left and right)'], ['y', 'up and down'], ['z', 'forwards and backwards']], notes: 'Stand up and point each way. A shape’s y is where its bottom sits, so a bar on 4-tall posts needs y 4.' },
    { use: 'steps' },
    { t: 'Think', q: 'What number would put the star on top of the left post?', b: ['Every new thing needs its own name'], notes: 'x −3, y 4. Next lesson: a mascot who does something when you click it.' }
  ],
  'park-2-mascot': [
    { t: 'Ding dong!', q: 'What happens when someone rings your doorbell?', notes: 'Ring a bell or knock. The ring starts an action: someone answers.' },
    { t: 'Event', lead: 'An event is something that happens, like a click, that starts some code.', b: ['when Run is clicked', 'when mascot is clicked'], notes: 'We have been using an event already: when Run is clicked.' },
    { t: 'Meet the mascot', pic: true, b: ['Click the mascot: nothing happens', 'Make it wave', 'Make it say “Welcome to the park!”'], notes: 'Press Run and click the mascot in the starter. Clicks only work while the program is running.' },
    { use: 'steps' },
    { t: 'Input and output', table: [['Input', 'Code', 'Output'], ['Click the mascot', 'when mascot is clicked', 'Wave and a speech bubble']], notes: 'Ask pupils to name the input and output of their own program.' },
    { t: 'Think', q: 'What is different about “when Run is clicked” and “when mascot is clicked”?', notes: 'One runs at the start; one waits for a click and runs every time. Next lesson: a conversation.' }
  ],
  'park-3-chat': [
    { t: 'Can you help me?', q: 'What goes wrong if everyone says their lines at once?', notes: 'Act out a visitor asking the way. Try the lines in the wrong order, then all at once.' },
    { t: 'Sequence and timing', lead: 'Steps run one after another. Some steps wait before the next one starts.', b: ['“says … for 2 seconds” waits 2 seconds', '“says …” does not wait'], notes: 'This is why the conversation needs the “for … seconds” block.' },
    { t: 'Help a visitor', pic: true, b: ['The visitor asks the way', 'The guide answers', 'The visitor says thank you and walks through the gate'], notes: 'Press Run and click the visitor in the starter.' },
    { t: 'Predict', q: 'The guide uses “says” with no seconds. What will happen?', notes: 'Both bubbles appear at once. Swap it for “says … for … seconds” and run again.' },
    { use: 'steps' },
    { t: 'Think', q: 'What would happen if the glide block came first?', notes: 'The visitor would walk away before the guide answers. Next lesson: physics.' }
  ],
  'park-4-balloons': [
    { t: 'Pop!', q: 'If a balloon holding a toy pops, what happens to the toy?', notes: 'Hold up a balloon or a ball. It falls: gravity pulls it down.' },
    { t: 'Physics', lead: 'Physics makes things move like real things: falling, bumping, bouncing.', b: ['make … fall and bump: gravity pulls it down', 'make … solid but still: things bump into it, but it never moves'], notes: 'In the 3D World, things only fall when we tell them to.' },
    { t: 'Pop the balloons', pic: true, b: ['Click a balloon: it pops and hides', 'Its gift falls to the ground', 'A heart and a doughnut'], notes: 'Press Run and click the red balloon in the starter: it pops, but the balloon stays and the heart floats.' },
    { t: 'Predict', q: 'We hide balloon1. Will the heart fall now?', b: ['The computer only does what our blocks say'], notes: 'No: the heart needs its own block, make gift1 fall and bump, inside when balloon1 is clicked. In when Run is clicked it would fall before the click.' },
    { use: 'steps' },
    { t: 'Think', q: 'Why does each gift need its own block to fall?', notes: 'Each object only does what its blocks say. Next lesson: a penalty kick.' }
  ],
  'park-5-kick': [
    { t: 'Kick it!', q: 'How do you make a ball go further? How do you make it go up as well as forwards?', notes: 'Roll a soft ball gently, then harder. Then roll it along the floor, then throw it up and forwards.' },
    { t: 'Force', lead: 'A force is a push or a pull. It has a direction and a size.', b: ['push football by x … y … z …', 'z pushes forwards, y pushes up', 'A bigger number is a stronger push'], notes: 'Only things with “fall and bump” can be pushed.' },
    { t: 'Penalty kick', pic: true, b: ['Click the football', 'Lift it off the ground', 'Get it in the goal'], notes: 'Press Run and click the ball in the starter: it only rolls a little. Press Run again to put the ball back on the spot.' },
    { t: 'Fair test', lead: 'Predict first. Change only one number at a time.', table: [['push y', 'push z', 'I predict…', 'What happened?'], ['0', '2', '', 'a little roll'], ['0', '6', '', ''], ['?', '?', '', '']], notes: 'Pupils copy this table and fill it in as they test.' },
    { use: 'steps' },
    { t: 'Think', q: 'Which number made the ball go further? Which made it lift?', notes: 'z pushes forwards, y pushes up. Did changing one number at a time help? Next lesson: your own welcome zone.' }
  ],
  'park-6-welcome': [
    { t: 'Project: the welcome zone', pic: true, b: ['A character who moves and speaks when clicked', 'Something that falls or flies when clicked', 'Your own design'], notes: 'Show the starter and its Goals list: these are the success criteria.' },
    { t: 'What we know', table: [['Lesson', 'Skill'], ['The gate', 'make blocks and x, y, z'], ['The mascot', 'when … is clicked'], ['The visitor', 'says … for … seconds, in order'], ['The balloons and the football', 'hide, fall and bump, push']], notes: 'Recap Block 1 quickly.' },
    { t: 'Design first', lead: 'When I click …, then …', b: ['Draw your zone', 'Write two click events', 'Give everything you click a name'], notes: 'A falling thing must start up in the air: y bigger than 0.' },
    { use: 'steps' },
    { t: 'Swap and try', b: ['Try your partner’s zone', 'Can you find what to click?', 'One star and one wish'], notes: 'Each pupil then makes one improvement.' },
    { t: 'Block 1 done!', b: ['Algorithms and sequence', 'Events', 'Timing', 'Physics and forces'], notes: 'Celebrate! Next block: rides that move, with loops.' }
  ],
  'park-7-spinner': [
    { t: 'Turn on the spot', q: 'How many small turns of 30 degrees make a full circle?', notes: 'Everyone stands and turns in small steps. Count together: 12 turns of 30 is 360.' },
    { t: 'Loop', lead: 'A loop runs the same blocks again and again.', b: ['repeat 12 times:', 'turn arm by y 30 degrees', 'wait 0.1 seconds'], notes: 'The blocks INSIDE the loop are the ones that repeat. Block 2 is all about loops.' },
    { t: 'The spinner', pic: true, b: ['Press Run, then click the arm', 'It only turns a quarter of the way', 'The same two blocks are copied three times'], notes: 'Open the starter. Ask how many more copies a full spin would need (24 blocks in all).' },
    { use: 'steps' },
    { t: 'Common bugs', b: ['Repeat 10: it stops just short (300°)', 'Wait outside the loop: it spins in a blink', 'Old copies left over: it turns too far'], notes: 'Pressing Run again starts the Goal ticks again.' },
    { t: 'Think', q: 'If each turn was 15 degrees, how many repeats? And 90 degrees?', notes: '24 and 4. Next lesson: a whole sequence inside a loop.' }
  ],
  'park-8-droptower': [
    { t: 'Rise, wait, drop!', q: 'How can we say “do it three times” without writing it three times?', notes: 'Play the body loop game: crouch, rise slowly, wait, drop fast.' },
    { t: 'A sequence in a loop', lead: 'A loop can repeat a whole sequence, in order.', b: ['repeat 3 times:', 'glide up slowly', 'wait at the top', 'glide down fast'], notes: 'Read it aloud: up, wait, drop; up, wait, drop; up, wait, drop.' },
    { t: 'The drop tower', pic: true, b: ['Click the yellow seat', 'Up in 3 seconds, down in 0.5', 'Only one ride so far'], notes: 'Ask pupils to predict before you press Run and click the seat.' },
    { use: 'steps' },
    { t: 'Predict', q: 'What if the wait comes AFTER the drop?', b: ['Write your prediction', 'Then test it'], notes: 'It waits at the bottom instead of the top. The order inside a loop matters.' },
    { t: 'Think', q: 'Same blocks, different order: does the ride do the same thing?', notes: 'No. Next lesson: a loop that never stops.' }
  ],
  'park-9-lights': [
    { t: 'What never stops?', q: 'Traffic lights, a lighthouse, a clock. What number of repeats would they need?', notes: 'None: they go on forever while switched on.' },
    { t: 'Forever', lead: 'A forever loop never stops, until you press Stop.', b: ['Nothing can go after it', 'Put it at the very end', 'Keep a wait inside'], notes: 'Show that the forever block has no bump underneath.' },
    { t: 'Carousel lights', pic: true, b: ['Three bulbs: bulb1, bulb2, bulb3', 'bulb1 changes colour once', 'Make them change forever'], notes: 'Loops do not run in the edit view: press Run to see the lights.' },
    { use: 'steps' },
    { t: 'Repeat or forever?', table: [['Repeat', 'Forever'], ['Clap 5 times', 'A heartbeat'], ['Spin once', 'A lighthouse'], ['Three drops', 'Carousel lights']], notes: 'Sort more examples together.' },
    { t: 'Think', q: 'What happens if you take the wait out?', notes: 'The lights flicker too fast to see. Next lesson: a ride with bugs in its loop.' }
  ],
  'park-10-wheel': [
    { t: 'Spot the bug', q: 'Repeat 3 times: clap, jump. Then spin. What went wrong?', notes: 'The spin is outside the loop. A bug is a mistake; to debug is to find and fix it.' },
    { t: 'How to debug', b: ['1. What should it do?', '2. What does it really do?', '3. Which block makes the difference?', '4. Fix one thing, then test'], notes: 'Keep this slide up during the bug hunt.' },
    { t: 'Fix the big wheel', pic: true, b: ['It should turn round like a wheel', 'All the way round, slowly', 'It has three bugs'], notes: 'Predict first, then press Run and click the wheel. Show the paper plate to explain the y and z axes.' },
    { use: 'steps' },
    { t: 'The three bugs', table: [['Bug', 'Fix'], ['Turns like a door (y)', 'Turn on z instead'], ['Only 100° (10 × 10)', 'Repeat 36 times'], ['Wait after the loop', 'Wait inside the loop']], notes: 'Show this at the end, or as hints for pairs who are stuck.' },
    { t: 'Think', q: 'Why does fixing one bug at a time help?', notes: 'You know which change made the difference. Next lesson: a loop that makes things.' }
  ],
  'park-11-fireworks': [
    { t: 'Roll the dice', q: 'Can you predict the next number?', notes: 'No: it is random. Introduce “pick random 1 to 6” in Operators.' },
    { t: 'Loops can make things', lead: 'Put a “make” block inside a loop to make lots of objects.', b: ['Each new ball is called firework', 'The name means the newest one', 'A wait lets you see each one appear'], notes: 'The goal counts 12 fireworks.' },
    { t: 'Fireworks finale', pic: true, b: ['Click the launcher', 'Only one firework so far', 'Make 12, all over the sky'], notes: 'Ask: predict where 12 fireworks will appear without random. (All in one spot, so it looks like one.)' },
    { use: 'steps' },
    { t: 'Random', lead: 'pick random -8 to 8', b: ['A different number every time', 'Put it in the x hole and the y hole', '“random colour” for the colour'], notes: 'Run it twice: the fireworks burst in different places each time.' },
    { t: 'Think', q: 'Where else could a park use random?', notes: 'Prizes, the weather, which ride a visitor chooses. Next lesson: design your own ride.' }
  ],
  'park-12-ride': [
    { t: 'Design a ride!', pic: true, b: ['Start from the empty base', 'Build it with shapes', 'Code it with loops'], notes: 'The Goals checklist is the success criteria for today.' },
    { t: 'Our rides so far', table: [['Ride', 'Loop'], ['Spinner', 'repeat a turn'], ['Drop tower', 'repeat a sequence'], ['Carousel lights', 'forever'], ['Fireworks finale', 'repeat a make block']], notes: 'Recap the block. Which would you like to build on?' },
    { t: 'Plan first', b: ['What starts it? A click or a key', 'What repeats?', 'How many times, or forever?', 'What sound does it make?'], notes: 'Pupils sketch and label the ride and write the algorithm. New names: Variables → Create variable.' },
    { use: 'steps' },
    { t: 'Ride test', lead: '“My ride starts when… My loop repeats… times. Inside the loop…”', q: 'What works well? What could be better?', notes: 'Pupils try each other’s rides and give one star and one wish.' },
    { t: 'Block 2 done!', b: ['repeat', 'A sequence in a loop', 'forever', 'Debugging loops', 'Loops that make things, and random'], notes: 'Celebrate. Block 3: fairground games that decide with “if”.' }
  ],
  'park-13-bell': [
    { t: 'Stand up if…', q: 'Why did some people stand up and others stay sitting?', b: ['Stand up if you have a pet.', 'Stand up if you are wearing blue.'], notes: 'Everyone hears the same instruction, but only those for whom it is true stand. That is selection.' },
    { t: 'Selection', lead: 'An if block runs the blocks inside it only when its question is true.', b: ['The question is called a condition.', 'Its answer is true or false.'], notes: 'Block 3 is all about programs that make decisions.' },
    { t: 'Ring the bell', pic: true, b: ['Press space to push the puck', 'The gold bell is at the top', 'Nothing knows when the puck gets there'], notes: 'Open the starter. Press Run, then space: the puck does not reach. Read the Goals “Ring it!”.' },
    { t: 'Keep checking', table: [['Code', 'Means'], ['forever', 'keep asking, again and again'], ['if puck touching bell ?', 'is the puck at the bell?'], ['bell says DING!', 'only when the answer is true']], notes: 'Without forever the if asks once, at the start, when the answer is false.' },
    { use: 'steps' },
    { t: 'Think', q: 'What does the program do when the condition is false?', notes: 'Nothing: it skips the blocks inside the if. Next lesson: a condition about a number.' }
  ],
  'park-14-dodgems': [
    { t: 'The number line', q: 'Where on the line is x > 10 true? And x < -10?', b: ['-11 … 0 … 11', 'The purple floor'], notes: 'Draw the line on the board and shade the two ends.' },
    { t: 'Compare', lead: 'A comparison asks about two numbers. The answer is true or false.', table: [['Block', 'Means'], ['x of car > 10', 'the car is near the right side'], ['x of car < -10', 'the car is near the left side']], notes: 'The compare block is in Operators; “x of …” is in Sensing.' },
    { t: 'Dodgem rules', pic: true, b: ['Drive with the arrow keys', 'The car can drive off the floor', 'It needs a rule for each side'], notes: 'Open the starter and drive off the edge. Read the Goals “Stay in the arena”.' },
    { use: 'steps' },
    { t: 'Common bugs', b: ['Both ifs say > 10: the left side leaks', 'Move by +0.5 on the right: the car is pushed out', 'The if is outside the forever'], notes: 'Ask which side the car escapes from: that tells you which if to look at.' },
    { t: 'Think', q: 'How would we stop the car leaving by the front or back?', notes: 'Use z of car. Next lesson: if … else.' }
  ],
  'park-15-weather': [
    { t: 'Heads or tails', q: 'If heads we go first, else we go last. Could both happen?', notes: 'Toss a coin a few times. Exactly one thing happens every time.' },
    { t: 'If … else', lead: 'If the condition is true, do the first part. If not, do the else part.', b: ['Always one part.', 'Never both. Never neither.'], notes: 'Last lesson each if did something or nothing; now there is always a second choice.' },
    { t: 'Sunny or rainy?', pic: true, b: ['The sky is always blue', 'pick random 1 to 2 is like a coin', '1 = rain, 2 = sun'], notes: 'Open the starter. Find pick random in Operators. Read the Goals “Weather report”.' },
    { use: 'steps' },
    { t: 'Test it lots', table: [['Run', 'Weather'], ['1', ''], ['2', ''], ['3', ''], ['…', '']], q: 'How many rainy days in ten runs?', notes: 'A random program must be tested many times. Tally the class results.' },
    { t: 'Think', q: 'How could we make rain happen less often?', notes: 'pick random 1 to 4 = 1. Next lesson: debugging the ghost train.' }
  ],
  'park-16-ghost': [
    { t: 'Expected and actual', q: 'Put the bread in, butter it, take it out. What goes wrong?', b: ['Expected: what should happen', 'Actual: what really happens'], notes: 'A bug is where expected and actual are different.' },
    { t: 'The ghost train', pic: true, b: ['The cart should roll into the tunnel', 'The ghost should appear', 'The ghost should say Boo!'], notes: 'Open the starter and press Run. The cart rolls backwards and nothing else happens.' },
    { t: 'Bug hunt sheet', table: [['Bug', 'Expected', 'Actual', 'Fix'], ['1', '', '', ''], ['2', '', '', ''], ['3', '', '', '']], notes: 'Pupils fill in expected and actual before changing any code.' },
    { use: 'steps' },
    { t: 'How to hunt bugs', b: ['Run it. Say expected and actual.', 'Find the block that does it.', 'Change one thing.', 'Test again.'], notes: 'One bug can hide another: the ghost bug can’t be seen until the cart goes the right way.' },
    { t: 'Think', q: 'Which bug was hardest to find, and why?', notes: 'Answers: z -9 to 9; tree to tunnel; cart says to ghost says. Next lesson: the splash fountain.' }
  ],
  'park-17-splash': [
    { t: 'Hot or cold', q: 'What is the rule for “Splash!”?', notes: 'A pupil walks towards a hoop. The class says Splash! when they are closer than one big step.' },
    { t: 'Distance', lead: '“distance from player to pond” tells you how far apart they are.', b: ['Close: a small number', 'Far away: a big number'], notes: 'It is in Sensing. The compare block is in Operators.' },
    { t: 'The splash fountain', pic: true, b: ['Walk with the arrow keys', 'The water is hidden', 'Close to the pond: Splash!'], notes: 'Open the starter and walk to the pond. Read the Goals “Get splashed”.' },
    { use: 'steps' },
    { t: 'Why else?', table: [['Without else', 'With else'], ['The water appears', 'The water appears'], ['It never goes away', 'It hides when you walk off']], notes: 'Predict first, then run both versions on the board.' },
    { t: 'Think', q: 'What else in a park could react when you get close?', notes: 'A shop that says hello, a gate that opens. Next lesson: design your own game stall.' }
  ],
  'park-18-stall': [
    { t: 'Your game stall', pic: true, b: ['Design your own fairground game', 'A key or a click to play', 'An if … else decides who wins'], notes: 'Show the starter: just a pink stall. Read the four Goals: they are the success criteria.' },
    { t: 'Ideas', b: ['Knock the can off the stall', 'Throw a ball into a hoop', 'Ring a bell', 'Get close enough to win'], notes: 'Each idea needs a Sensing block: touching, distance, x/y/z of, or key pressed?' },
    { t: 'Plan first', lead: 'Name every object. Write your rule as “if … else …”.', b: ['How do you play?', 'What is the rule?', 'What does the game say?'], notes: 'Pupils plan on paper before coding. New names: Variables, Create variable.' },
    { use: 'steps' },
    { t: 'Share', lead: '“To play, you… My if checks… If it is true… Else…”', q: 'What works well? What would make it better or fairer?', notes: 'Fairground walk, then recap Block 3: if, conditions, comparisons, if … else, random, debugging. Block 4: variables.' }
  ],
  'park-19-tickets': [
    { t: 'Running the park', lead: 'The park is open! Now we need to keep track of numbers.', b: ['How many visitors came in?', 'How much money did we take?', 'How long is the queue?'], notes: 'Introduce Block 4: variables, cameras and messages. Use a clicker counter or a tally.' },
    { t: 'A variable', lead: 'A variable is a named box that remembers a value.', b: ['Set it: set tickets to 0 (at the start)', 'Change it: change tickets by 1 (each click)', 'Use it: show Tickets: and the number'], notes: 'The starter already has the tickets variable and set tickets to 0.' },
    { t: 'The ticket counter', pic: true, b: ['Click the green turnstile', 'Count every visitor', 'Let 5 visitors in'], notes: 'The Goals checklist at the top right ticks as pupils work.' },
    { use: 'steps' },
    { t: 'Predict', q: 'Each click does change tickets by 2. What does the screen say after 3 clicks?', b: ['Start: set tickets to 0', 'Click, click, click'], notes: '6. What if the show block was before the change block? It would always be one click behind.' },
    { t: 'Think', q: 'Where else does a theme park need a variable?', notes: 'Money, people on a ride, queue time, scores. Next lesson: a camera and messages.' }
  ],
  'park-20-coastercam': [
    { t: 'Film the ride', q: 'Where should the camera be to make a ride exciting?', notes: 'Act it out: one pupil is the coaster, one follows with a “camera”.' },
    { t: 'Camera blocks', b: ['camera follows car from behind', 'camera distance 8 (3 = close, 80 = far)', 'point camera at x y z (stops following)'], notes: 'All in the Camera category.' },
    { t: 'Coaster cam', pic: true, b: ['The car rides over the hill', 'Ride along with it', 'Then cut to the mascot clapping'], notes: 'In the starter the car moves but the camera stays still.' },
    { t: 'Messages', lead: 'One script can start another.', code: 'ride script:   … glide … glide → broadcast finish\nending script: when I receive finish → camera, clap, say', notes: 'The words must match exactly: finish and finish. Many scripts can listen for one message.' },
    { use: 'steps' },
    { t: 'Think', q: 'Which camera view would suit a walking game?', b: ['From behind', 'From above', 'From the side'], notes: 'Next lesson: a score in a star hunt, with the camera following the player.' }
  ],
  'park-21-stars': [
    { t: 'Keeping score', q: 'What in a game should make the score go up?', notes: 'Catching, reaching, hitting. Today: touching a star.' },
    { t: 'Star hunt', pic: true, b: ['Walk forward with the up arrow', 'Each star = 1 point', 'Catch 5'], notes: 'In the starter the star makes a magic sound but the score stays at 0.' },
    { t: 'When the player touches the star', b: ['change score by 1', 'show Score: and the score', 'move the star on by z 4'], notes: 'The screen only changes when you show it again. If the star isn’t moved, the player stands on it.' },
    { use: 'steps' },
    { t: 'Trace the score', table: [['Stars caught', 'score', 'star’s z'], ['0', '0', '-2'], ['1', '1', '2'], ['2', '2', '6'], ['5', '5', '?']], notes: 'After 5 catches the star is at z 18.' },
    { t: 'Think', q: 'Is it a fun game yet? What is missing?', notes: 'A time limit and a way to win. Next lesson: beat the clock.' }
  ],
  'park-22-clock': [
    { t: 'Ten seconds!', q: 'Count down from 10. What do we do each second? When do we stop?', notes: 'Wait, take 1 away, say it; stop at 0.' },
    { t: 'Beat the clock', pic: true, b: ['10 seconds on the clock', 'Catch 5 stars', 'Did you win?'], notes: 'The starter is last lesson’s finished game plus set clock to 10.' },
    { t: 'Count down', code: 'set clock to 10\nrepeat until clock = 0:\n    wait 1 seconds\n    change clock by -1\n    show Time: clock\nif score ≥ 5:\n    player says I win!\nelse:\n    player says Time’s up!', notes: 'The if … else goes after the loop, not inside it. Change by -1, not 1.' },
    { use: 'steps' },
    { t: 'Make it fair', q: 'Too easy or too hard? Change one number and test again.', b: ['The time on the clock', 'The stars you need', 'How far the star moves on'], notes: 'Pupils play each other’s games.' },
    { t: 'Think', q: 'Which variables does our game use, and what does each one do?', notes: 'score counts up, clock counts down. Next lesson: the ice cream stand.' }
  ],
  'park-23-icecream': [
    { t: 'The ice cream seller', q: 'The seller has 5 ice creams. What should happen when the sixth person asks?', notes: 'Act it out with counters. Before every sale the seller checks: have I got any left?' },
    { t: 'The ice cream stand', pic: true, b: ['Two variables on the screen: stock and sold', 'Click the stand to sell one', 'Click the van for a delivery'], notes: 'In the starter, keep clicking the stand: stock goes to -1, -2… That is the bug.' },
    { t: 'Check first', code: 'when stand is clicked:\n    if stock > 0:\n        change stock by -1\n        change sold by 1\n        show the stock and sold\n        stand says Enjoy!\n    else:\n        stand says Sold out!', notes: 'The check comes before the sale. stock > 0, not 0 > stock.' },
    { use: 'steps' },
    { t: 'Trace it', table: [['Click', 'stock > 0?', 'stock', 'sold'], ['start', '', '5', '0'], ['1st sale', 'yes', '4', '1'], ['6th click', 'no: Sold out!', '0', '5'], ['the van', '', '10', '5']], notes: 'On the 6th click the else part runs. Three more sales after the delivery make 8.' },
    { t: 'Think', q: 'Why must the check come before the sale?', notes: 'Otherwise it sells an ice cream it hasn’t got. Next lesson: the grand opening.' }
  ],
  'park-24-opening': [
    { t: 'The grand opening', pic: true, b: ['Design your own park game', 'Plan it, build it, test it', 'Then open it to a partner'], notes: 'The starter is the park gate and two trees.' },
    { t: 'Plan first', b: ['What does the player do?', 'How do you win?', 'Which variables? What changes them?', 'Which event starts the action?', 'Where is the camera?'], notes: 'Plan on paper with a table of variables: name, starting value, what changes it.' },
    { t: 'Your Goals', b: ['A variable changes', 'An if decides something', 'An event starts the action', 'A camera block', 'Something shown on the screen'], notes: 'The Goals checklist is the success criteria and ticks while the game runs.' },
    { use: 'steps' },
    { t: 'Star and wish', lead: '“My game uses the variable … My if decides … I improved …”', notes: 'Partners play each other’s games and leave one star and one wish.' },
    { t: 'Park Designers!', b: ['Sequence and events', 'Loops', 'Selection and debugging', 'Variables, cameras and messages'], notes: 'Celebrate the whole unit.' }
  ]
};
for (const l of LESSONS) l.slides = SLIDES[l.id] || [];

export { CURRICULA, curriculumLinks } from './curricula.js';
export function lesson(id) { return LESSONS.find(l => l.id === id) || null; }
