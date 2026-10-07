/* CodeJump · ready-made lessons.
 * Each lesson is a complete, no-preparation computing lesson for one class: a teacher plan (timings, what to say,
 * key words, support/stretch, assessment, National Curriculum links) plus a starter project (starters/<id>.json,
 * built by make-starters.mjs) and the pupil steps that CodeJump shows in its "Lesson" card while pupils work.
 * The host (build-and-play.html) lazy-loads this file the first time someone opens Lessons.
 *
 * Fields: id · title · ks ('ks1'|'ks2') · years · minutes · type (projectType of the starter) · tool (what pupils
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
    id: 'level-for-a-friend', title: 'Make a level for a friend', ks: 'ks1', years: 'Years 1–2', minutes: 50, type: 'platformer', tool: 'Platformer (build mode)',
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
    id: 'turtle-shapes', title: 'Shapes with repeat', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'turtle', tool: 'Turtle (typed Logo)',
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
    id: 'catch-the-stars', title: 'Catch the stars', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'stage', tool: 'Stage (Scratch-style blocks)',
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
    id: 'level-designers', title: 'Level designers: find the bugs', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'platformer', tool: 'Platformer (Build, Play and Code)',
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
    id: 'code-the-rules', title: 'Code the rules', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'platformer', tool: 'Platformer (Code blocks)',
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
    id: 'stage-animate', title: 'Animate a dance party', ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'stage', tool: 'Stage (Scratch-style blocks)',
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
    id: 'turtle-procedures', title: 'Teach the turtle new words', ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'turtle', tool: 'Turtle (typed Logo)',
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
  }
];

const SLIDES = {
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
  ]
};
for (const l of LESSONS) l.slides = SLIDES[l.id] || [];

export { CURRICULA, curriculumLinks } from './curricula.js';
export function lesson(id) { return LESSONS.find(l => l.id === id) || null; }
