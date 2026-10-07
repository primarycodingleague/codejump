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
    summary: 'Pupils test a wobbly walking robot creature, change one thing at a time, and measure how much further it goes.',
    objective: 'We are learning to test and improve a design, changing one thing at a time.',
    success: ['I can test my Critter and record the result.', 'I can change one thing and test again (a fair test).', 'I can explain which change made it better.'],
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
    objective: 'We are learning how a computer can learn from examples (machine learning).',
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
  ]
};
for (const l of LESSONS) l.slides = SLIDES[l.id] || [];

export { CURRICULA, curriculumLinks } from './curricula.js';
export function lesson(id) { return LESSONS.find(l => l.id === id) || null; }
