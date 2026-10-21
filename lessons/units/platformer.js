// The Platformer Lab's lesson unit — see lessons/units/README.md. lessons.js appends these lessons (in this order, which
// is also the Next-lesson order) and attaches SLIDES.
//
// SKY ISLES EXPLORERS — our own story: Pip the explorer has landed on the Sky Isles, a chain of floating islands. Captain
// Wren, the old lighthouse keeper, needs Pip's help to explore them, collect the sun gems and relight the lighthouse
// before the storm. Pupils are the level designers and coders who build Pip's adventures.
// 24 lessons in 4 blocks of 6 (lesson 6 of each block is a design-and-make project):
//   Block 1 · First steps (Years 1–2, Key Stage 1 editor): algorithms, sequence, predicting + debugging, repeating
//            patterns, events, then a level for a friend (the lab's existing KS1 lesson).
//   Block 2 · Island builders (Years 3–4): decomposition, events and rules (existing "Level designers"), longer
//            sequences, count-controlled loops, debugging sequences and loops, then the Island challenge.
//   Block 3 · Weather and wonders (Years 4–5): if, if … else, comparison and logic operators, repeat until, debugging
//            loops and conditions, then the Sky arcade.
//   Block 4 · Keepers of the light (Years 5–6): variables (existing "Code the rules"), data and fair tests, functions
//            with inputs, combining them, debugging variables and functions, then the Grand tour.
// Starters: lessons/builds/sky-*.mjs (the existing lessons keep theirs). Tests: tests/unit-platformer.test.mjs.
// The Platformer Lab has no broadcast/message blocks, so Block 4 uses functions, pages and events in their place.

const U = 'Sky Isles Explorers';
const u = (n, m) => `${U} · Block ${n} · Lesson ${m}`;
const KS1 = { ks: 'ks1', years: 'Years 1–2', minutes: 60, type: 'platformer' };
const Y34 = { ks: 'ks2', years: 'Years 3–4', minutes: 60, type: 'platformer' };
const Y45 = { ks: 'ks2', years: 'Years 4–5', minutes: 60, type: 'platformer' };
const Y56 = { ks: 'ks2', years: 'Years 5–6', minutes: 60, type: 'platformer' };
const DEVICE = 'A device per pupil or pair, with CodeJump open';

export const LESSONS = [
  // ═══════════════════════════════ BLOCK 1 · FIRST STEPS (Years 1–2) ═══════════════════════════════
  {
    id: 'sky-1-map', unit: u(1, 1), title: 'Follow the map', ...KS1, tool: 'Platformer Lab (Build and Play)',
    summary: 'The first lesson of Sky Isles Explorers. Pip the explorer has landed on the Sky Isles, and Captain Wren the lighthouse keeper has sent a map with exact instructions for Pip’s first island. Pupils find out why vague instructions go wrong, then follow the map step by step (an algorithm): a Start, a Finish and a bridge of 4 blocks over the river of spiky rocks.',
    objective: 'We are learning to follow clear, exact instructions in order (an algorithm).',
    success: ['I can follow instructions one step at a time.', 'I can say why exact instructions are better than vague ones.', 'I can test my level by playing it.'],
    curriculum: ['alg', 'create1'],
    words: [['algorithm', 'a set of exact instructions, in order, to do a job'], ['instruction', 'one step that tells someone exactly what to do'], ['exact', 'clear, with nothing left to guess: “4 blocks”, not “some blocks”'], ['test', 'try it out to check it works']],
    need: [DEVICE, 'The map slide on the board (or printed, one per pair)', 'Optional: building bricks or cubes for the warm-up'],
    plan: [
      { min: 8, title: 'Warm up: build my tower', html: '<p>Give a volunteer some cubes. First give a <b>vague</b> instruction: “Put some blocks on top of each other.” Then an <b>exact</b> one: “Put 3 red blocks in a line. Put 1 blue block on the middle one.” <b>Ask:</b> which instruction was easier to follow? Would everyone build the same tower from the first one?</p><p>Introduce the word <b>algorithm</b>: exact instructions, in order, to do a job. Computers need algorithms because they cannot guess.</p>' },
      { min: 7, title: 'Meet Pip and Captain Wren', html: '<p>Tell the story of the unit: Pip the explorer has landed on the Sky Isles, a chain of islands floating in the sky. Captain Wren, the old lighthouse keeper, needs help to explore them before a storm comes. We are the level designers who build Pip’s adventures.</p><p>Open the starter on the board (<b>Open the starter</b>). There is grass, a river of spiky rocks and nothing else. Press <b>Play</b>: CodeJump says “Add a Finish to end your game!” <b>Ask:</b> what does Pip need? (Somewhere to start, somewhere to finish, a way across.)</p>' },
      { min: 10, title: 'Read the map together', html: '<p>Show Captain Wren’s map (slide). Read each step aloud and count squares on the board together with a finger: “2nd square from the left” means count 1, 2 from the left edge. Model step 1 only: tap <b>Start</b> in the list on the left, then tap the square standing on the grass, 2nd from the left. Point out that the instruction says exactly <b>where</b>.</p><p><b>Ask:</b> what would happen if the map just said “put a bridge somewhere”?</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the <b>Lesson</b> card (it can read itself aloud). In pairs, one pupil reads the next instruction from the map and the other does it; they swap after each step. Insist that they check each step against the map before going on.</p><p>Common mistakes: putting the bridge on top of the spiky rocks instead of covering them (tap each spiky rock with Platform selected and it is swapped for a block), counting from the wrong side, or forgetting to press <b>Build</b> after playing. If Pip loses a life, ask: which instruction did we not follow exactly?</p>' },
      { min: 10, title: 'Share and plenary', html: '<p>Show two or three pupils’ levels side by side. <b>Ask:</b> why do they all look the same? (Everyone followed the same exact algorithm.) Then turn one vague instruction into an exact one together, such as “Put a gem near the bridge” → “Put a Gem on top of the 2nd bridge block”.</p><p>Next lesson: the order of the steps matters too.</p>' }
    ],
    support: 'Pair pupils so one reads and one builds. Give a printed map with the squares already numbered from the left.',
    stretch: 'Write one more exact instruction for a partner, such as “Put a Gem on top of the 2nd bridge block”, and check that they follow it exactly.',
    assess: ['Follows the map’s instructions in order', 'Places the Start, Finish and bridge exactly where the map says', 'Explains why exact instructions work better than vague ones'],
    steps: [
      { t: 'Meet the island', d: 'Pip needs a path to the Finish. Press Play. What does it say? Press Build to go back.' },
      { t: 'Step 1: the Start', d: 'Tap Start in the list of blocks. Tap the square on top of the grass, 2nd from the left.' },
      { t: 'Step 2: the Finish', d: 'Tap Finish. Tap the square on top of the grass, 2nd from the right.' },
      { t: 'Step 3: the bridge', d: 'Tap Platform. Tap each spiky rock in the river to cover it. Count them: 1, 2, 3, 4.' },
      { t: 'Test it', d: 'Press Play. Walk Pip with the arrow keys over the bridge to the Finish. Did the map work?' },
      { t: 'Challenge', d: 'Make up one exact instruction for your partner, like “Put a Gem on the 2nd bridge block”.' }
    ]
  },
  {
    id: 'sky-2-steps', unit: u(1, 2), title: 'Step by step', ...KS1, tool: 'Platformer Lab (Build and Play)',
    summary: 'Sequence. Pip’s route has parts that must happen in order: hop over the log, climb the steps, walk along the cliff top, reach the Finish. But the steps are missing and the cliff is 4 blocks high, too high to jump. Pupils build steps 1, 2 and 3 blocks high in order, find out that the wrong order does not work, and write Pip’s moves as a sequence of arrows.',
    objective: 'We are learning that the order of the steps (the sequence) matters.',
    success: ['I can put steps in the right order.', 'I can say what happens when the order is wrong.', 'I can write Pip’s moves as a sequence.'],
    curriculum: ['alg', 'predict'],
    words: [['sequence', 'the order that things happen in'], ['order', 'which comes first, next and last'], ['route', 'the way Pip goes from the Start to the Finish'], ['predict', 'say what you think will happen']],
    need: [DEVICE, 'Paper strips and pencils for writing a sequence of arrows', 'Optional: picture cards for getting dressed (socks, shoes, coat)'],
    plan: [
      { min: 8, title: 'Warm up: getting dressed', html: '<p>Show picture cards in a muddle: shoes, socks, coat. Ask pupils to put them in order. <b>Ask:</b> what happens if you put your shoes on before your socks? Introduce <b>sequence</b>: the order things happen in. Some sequences only work in the right order.</p>' },
      { min: 7, title: 'Where does Pip get stuck?', html: '<p>Open the starter on the board and press <b>Play</b>. Walk Pip right with the arrow keys and press the <b>Space Bar</b> to hop over the log. Then try to jump up the cliff: Pip cannot. Press <b>Build</b> and count the blocks in the cliff together: 4. Pip can only jump about 2 blocks high.</p><p>Read Pip’s route as a sequence: 1 hop the log, 2 climb the steps, 3 walk along the cliff, 4 reach the Finish. <b>Ask:</b> which part is missing?</p>' },
      { min: 10, title: 'Predict', html: '<p>Model one wrong idea on the board: build one tall tower of 3 blocks next to the cliff. <b>Ask:</b> predict, will Pip get up now? Press Play and test: no, 3 blocks is too high to jump from the grass. Take it away. <b>Ask:</b> how could we make steps that Pip can climb one at a time? (Small first, then bigger: 1, then 2, then 3.)</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: steps 1, 2 and 3 blocks high in order, test, then swap them round on purpose (tallest first) to see the sequence fail, and put them back. Finally they write Pip’s moves on a paper strip with arrows (→ walk, ↑ jump) and check by playing them exactly.</p><p>Encourage them to <b>predict</b> before each test: “Will Pip get up now?”</p>' },
      { min: 10, title: 'Plenary', html: '<p>Two pupils read their arrow sequences aloud while another plays them on the board. <b>Ask:</b> what happened when the steps were in the wrong order? Why does the order matter? Find another sequence from school life where the order matters.</p>' }
    ],
    support: 'Build the first step together. Give a strip with the arrows already drawn for pupils to put in order.',
    stretch: 'Add a second cliff with a Finish on top and build a sequence of steps going down the other side too. Write the whole route as arrows.',
    assess: ['Builds steps in an order Pip can climb', 'Explains why the wrong order does not work', 'Records a sequence of moves and tests it'],
    steps: [
      { t: 'Try it', d: 'Press Play. Walk with the arrow keys and jump with the Space Bar. Where does Pip get stuck?' },
      { t: 'Count the cliff', d: 'Press Build. Count how many blocks high the cliff is. Pip can only jump about 2 blocks.' },
      { t: 'Step 1', d: 'Tap Platform. Leave 3 empty squares next to the cliff. In the first one, put 1 block on the grass.' },
      { t: 'Steps 2 and 3', d: 'Next to it build a tower 2 blocks high. Then, touching the cliff, a tower 3 blocks high.' },
      { t: 'Test it', d: 'Press Play. Can Pip climb the steps one at a time and reach the Finish?' },
      { t: 'Wrong order?', d: 'Swap the steps round so the tallest is first. Press Play. What happens? Put them back in order.' },
      { t: 'Write the moves', d: 'On paper, draw Pip’s moves in order with arrows: → for walk, ↑ for jump.' }
    ]
  },
  {
    id: 'sky-3-bounce', unit: u(1, 3), title: 'Predict and fix', ...KS1, tool: 'Platformer Lab (Build and Play)',
    summary: 'Predicting and debugging. Captain Wren’s helper built a level to reach the lighthouse on the high island, but it has two bugs. Pupils predict where Pip will land before they press Play, test, spot where it goes wrong and fix one bug at a time: the bounce mushroom is too far from the island, and a wall of blocks hides the Finish.',
    objective: 'We are learning to predict what will happen, and to find and fix bugs.',
    success: ['I can say what I think will happen before I press Play.', 'I can find where something goes wrong by testing.', 'I can fix one bug at a time and test again.'],
    curriculum: ['predict', 'debug1'],
    words: [['predict', 'say what you think will happen before you try it'], ['bug', 'a mistake that stops something working'], ['debug', 'find and fix the bugs'], ['test', 'play it to check if it works']],
    need: [DEVICE, 'Sticky notes or mini whiteboards for predictions'],
    plan: [
      { min: 7, title: 'Warm up: predict', html: '<p>Hold up a ball. <b>Ask:</b> what will happen if I drop it? Pupils predict, then you test. Then a tricky one: will a paper aeroplane go further than a screwed-up paper ball? Predict, then test. Introduce <b>predict</b>: say what you think will happen before you try it.</p>' },
      { min: 8, title: 'The helper’s level', html: '<p>Open the starter on the board. Point out the red <b>Bounce!</b> mushroom in the grass, the high island and the Finish on top. Explain: when Pip walks onto a mushroom in the grass, it throws Pip high into the air.</p><p><b>Ask:</b> predict, where will Pip land? Pupils point or write their prediction. Then press <b>Play</b> and hold the Right Arrow. Pip bounces, but lands on the grass and bumps into the island. Was your prediction right? Introduce <b>bug</b> and <b>debug</b>.</p>' },
      { min: 10, title: 'Fix one bug', html: '<p>Model the fix: press <b>Build</b>, tap <b>Erase</b> and tap the mushroom, then tap <b>Grass Top</b> and fill the hole. Tap <b>Bounce!</b> and tap a grass block right next to the island to swap it for a mushroom. <b>Ask:</b> predict again, where will Pip land now? Test it. Pip lands on the island, but something else stops him: there is a second bug! Leave it for pupils to find.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: predict, test, fix the mushroom, predict and test again, then find and fix bug 2 (the wall of 3 blocks in front of the Finish) with <b>Erase</b>. Encourage “change one thing, then test”.</p><p>If the mushroom is placed on top of the grass rather than in it, Pip walks straight through it: ask “where is the mushroom? Where was the one that worked?”</p>' },
      { min: 10, title: 'Bug hunters', html: '<p>Pupils add ONE new bug to their level (for example move the mushroom away again, or put a spike near the Finish) and swap with a partner, who predicts, tests and fixes it. <b>Ask:</b> what is the best way to find a bug? (Predict, test, watch where it goes wrong, fix one thing, test again.)</p>' }
    ],
    support: 'Show where the mushroom should go with a sticker on the screen. Fix bug 1 together on the board before pupils find bug 2.',
    stretch: 'Make the island higher (add a row of blocks on top). Does the mushroom still work? Where is the best place for it now?',
    assess: ['Makes a prediction before pressing Play', 'Finds where the level goes wrong by testing', 'Fixes both bugs, one at a time, testing after each'],
    steps: [
      { t: 'Predict', d: 'Look at the red mushroom. When Pip walks onto it, where will he land? Point to the square.' },
      { t: 'Test it', d: 'Press Play and hold the Right Arrow. Were you right? Where did Pip land?' },
      { t: 'Fix bug 1', d: 'Press Build. Tap Erase and tap the mushroom. Tap Grass Top and fill the hole.' },
      { t: 'Move the mushroom', d: 'Tap Bounce!. Tap a grass block right next to the high island to swap it for a mushroom.' },
      { t: 'Predict and test', d: 'Where will Pip land now? Press Play. Something else stops Pip: that is bug 2!' },
      { t: 'Fix bug 2', d: 'Press Build. Tap Erase and take away the wall in front of the Finish. Test again.' }
    ]
  },
  {
    id: 'sky-4-stones', unit: u(1, 4), title: 'Stepping stones', ...KS1, tool: 'Platformer Lab (Build and Play)',
    summary: 'Repeating patterns. Pip must cross a wide lake of spiky rocks. Captain Wren has started a pattern of stepping stones: 2 spiky rocks, then 2 stones, with a gem on the second stone. Pupils spot the part that repeats, say it as “repeat 3 times”, build it two more times so the pattern crosses the lake, and test.',
    objective: 'We are learning to spot a pattern and repeat it.',
    success: ['I can spot the part of a pattern that repeats.', 'I can say how many times it repeats.', 'I can build a repeating pattern and test it.'],
    curriculum: ['alg', 'create1'],
    words: [['pattern', 'something that happens again and again in the same way'], ['repeat', 'do the same thing again'], ['loop', 'when a computer repeats some instructions'], ['times', 'how many: “repeat 3 times” means do it 3 times']],
    need: [DEVICE, 'Coloured cubes or counters for making patterns'],
    plan: [
      { min: 8, title: 'Warm up: clap the pattern', html: '<p>Clap and stamp a pattern: clap, clap, stamp. Clap, clap, stamp. Pupils join in. <b>Ask:</b> which part repeats? How many times did we do it? Instead of saying all the claps and stamps, we can say: <b>repeat 3 times: clap, clap, stamp</b>. Computers do this too: a <b>loop</b>.</p>' },
      { min: 7, title: 'The lake', html: '<p>Open the starter on the board. The lake is full of spiky rocks. Captain Wren has made the start of a path: 2 spiky rocks, then 2 stepping stones with a gem on the second one. Press <b>Play</b> and try to cross: Pip can hop to the first stones but no further.</p><p><b>Ask:</b> what is the pattern? How many times does it need to repeat to reach the other side? (3 times in all: once is done.)</p>' },
      { min: 10, title: 'Make the pattern with cubes', html: '<p>Pairs make the pattern with cubes: 2 red (spiky rocks), 2 brown (stones), 1 yellow on top (gem). Then repeat it 3 times. Count together: how many stones? (6) How many gems? (3)</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: repeat the pattern twice more with <b>Platform</b> and <b>Gem</b>, then play. Hop with the <b>Space Bar</b> from stone to stone. Check: did you collect 3 gems?</p><p>Common mistakes: stones in the wrong place so the gaps are different (the pattern is broken and the jump is too far), or the gem missing. <b>Ask:</b> is your pattern the same every time?</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> how could we tell a friend how to build the path, in one sentence? (“Repeat 3 times: 2 spiky rocks, 2 stones, 1 gem.”) Why is “repeat 3 times” better than saying every block? Next lesson: we look inside the code for the first time.</p>' }
    ],
    support: 'Make the cube pattern first and keep it next to the device to copy. Point to where each new stone goes.',
    stretch: 'Make a new lake on the other side with a different pattern, like 1 spiky rock, 1 stone. Say it as “repeat … times”.',
    assess: ['Spots the part of the pattern that repeats', 'Says how many times it repeats', 'Builds the repeated pattern correctly and tests it'],
    steps: [
      { t: 'Spot the pattern', d: 'Look at the lake: 2 spiky rocks, then 2 stones with a gem on the second one. That is one pattern.' },
      { t: 'Repeat it', d: 'Tap Platform. After the next 2 spiky rocks, cover the next 2 rocks to make 2 stones.' },
      { t: 'Add the gem', d: 'Tap Gem. Put a gem on top of the second new stone.' },
      { t: 'Once more', d: 'Do the whole pattern again: 2 spiky rocks, 2 stones, 1 gem. That makes 3 times in all.' },
      { t: 'Test it', d: 'Press Play. Hop from stone to stone with the Space Bar. Can you get all 3 gems and reach the Finish?' },
      { t: 'Say it as a loop', d: 'Tell your partner: “Repeat 3 times: 2 spiky rocks, 2 stones, 1 gem.”' }
    ]
  },
  {
    id: 'sky-5-keys', unit: u(1, 5), title: 'Pip’s new controls', ...KS1, tool: 'Platformer Lab (Code blocks)',
    summary: 'Events. Captain Wren’s game pad uses the W, A and D keys, like lots of computer games. In Code, the A key already moves Pip left, but nothing happens when you press D or W. Pupils learn that “when … is pressed” is an event that starts an action, add events for D (move right) and W (jump), discover that the Right Arrow stops working, then use the “when game starts” event to play music and set a win message.',
    objective: 'We are learning that an event, like pressing a key, makes something happen in a program.',
    success: ['I can say what happens when a key is pressed.', 'I can join an event block to an action block.', 'I can use “when game starts” to make something happen at the start.'],
    curriculum: ['alg', 'predict', 'create1'],
    words: [['event', 'something that happens, like pressing a key, that starts an action'], ['action', 'what Pip does, like move or jump'], ['program', 'instructions that a computer follows'], ['key', 'a button on the keyboard']],
    need: [DEVICE, 'Optional: cards with “When …” on one side and an action on the other for the warm-up'],
    plan: [
      { min: 8, title: 'Warm up: when I…', html: '<p>Play a game: “<b>When</b> I clap, jump. <b>When</b> I wave, sit down. <b>When</b> I say go, march.” Each action only happens when its signal happens. Introduce <b>event</b>: something that happens and starts an action. <b>Ask:</b> what events start things at school? (The bell rings, so we line up.)</p>' },
      { min: 10, title: 'Look inside the code', html: '<p>Open the starter on the board and press <b>Code</b> for the first time. Read the yellow block together: “when A key is pressed, move left”. The event is pressing A; the action is move left. Under “when game starts” there is a rule: win by reaching the goal.</p><p>Press <b>Play</b> and press A: Pip moves left. <b>Ask:</b> predict, what will happen if I press D? Try it: nothing! There is no event for D yet. The arrow keys still work, but Captain Wren’s game pad has W, A and D.</p>' },
      { min: 10, title: 'Show me', html: '<p>Model adding one event: press <b>Code</b>, tap <b>When…</b>, drag out “when … is pressed”, tap its key and choose <b>D key</b>. Tap <b>Move</b> and join <b>move right</b> underneath so it clicks into place. Press Play and test D.</p><p><b>Ask:</b> now press the Right Arrow. What happens? (Nothing! The move right action now waits for the D event instead.)</p>' },
      { min: 22, title: 'Your turn', html: '<p>Pupils follow the Lesson card: the D event, the W event for jump, then test by playing the level with W, A and D. Then they use the <b>when game starts</b> event: from <b>Sound</b>, <b>play music</b>, and from <b>Win</b>, <b>win screen says</b> with their own message.</p><p>Common mistake: the action block not joined to the event (it sits loose, so nothing happens). <b>Ask:</b> is it clicked on?</p>' },
      { min: 10, title: 'Plenary', html: '<p>Two pupils show their controls. <b>Ask:</b> what is the event? What is the action? What happens at the very start of the game, and which event makes it happen? Next lesson is a project: a level for a friend, using everything from this block.</p>' }
    ],
    support: 'Give the D event already built; pupils add the W event by copying it. Use the read-aloud on the Lesson card.',
    stretch: 'Add “set player speed to” (Move) under “when game starts” and choose fast. Predict what will change, then test it.',
    assess: ['Explains that a “when … is pressed” block is an event that starts an action', 'Joins events to actions so D moves right and W jumps', 'Uses “when game starts” to change the music or the win message'],
    steps: [
      { t: 'Look at the code', d: 'Press Code. Read: “when A key is pressed, move left”. Press Play and press A, then D. What happens?' },
      { t: 'Make D work', d: 'Press Code. Tap When…, drag out “when … is pressed” and choose D key. Tap Move and join “move right” under it.' },
      { t: 'Make W jump', d: 'Drag out another “when … is pressed” and choose W key. Join “jump” from Move under it.' },
      { t: 'Test it', d: 'Press Play. Use A, D and W to get Pip to the Finish. Does the Right Arrow still work? Why not?' },
      { t: 'When the game starts', d: 'Press Code. Join “play music” (Sound) and “win screen says” (Win) under “win by reaching the goal”. Type Well done, Pip!' },
      { t: 'Play it', d: 'Press Play and reach the Finish. Do you hear the music and see your message?' }
    ]
  },
  {
    adopt: 'level-for-a-friend', unit: u(1, 6), minutes: 60, title: 'Make a level for a friend',
    summary: 'The Block 1 project. Pupils design Pip’s next island for a friend to explore: they plan it on paper, build a path from the Start to the Finish over the gap, add a repeating pattern and some stars, predict and test, then let a friend play it and improve it.',
    plan: [
      { min: 5, title: 'The project', html: '<p>Tell the class: Captain Wren needs a new island for Pip, and you are the designers. Show the starter on the board: a <b>Start</b>, a <b>Finish</b> and a big gap. Press <b>Play</b> and fall in the gap! <b>Ask:</b> what have we learned this block that will help? (Exact instructions, the right order, predicting and fixing bugs, repeating patterns.)</p>' },
      { min: 10, title: 'Plan it', html: '<p>Pupils plan their island on squared paper: where the bridge or stepping stones go (a repeating pattern), where the stars go, and one thing to make it fun, like steps up to a high platform. They write the moves Pip will need as arrows.</p>' },
      { min: 25, title: 'Build and test', html: '<p>Pupils follow the Lesson card: build over the gap, add stars, add higher platforms. Insist on “build a bit, test a bit”: before each test, <b>predict</b> what will happen. If something goes wrong, that is a bug: find it and fix it.</p>' },
      { min: 15, title: 'Friend test', html: '<p>Pupils swap seats. Before playing, the friend predicts how hard the level will be. They play it, then say one thing they liked and one thing to improve. The designer makes one improvement and the friend tests again.</p>' },
      { min: 5, title: 'Reflect', html: '<p><b>Ask:</b> why did we test our levels? What did you change after your friend played it? Celebrate the end of Block 1 of Sky Isles Explorers.</p>' }
    ],
    stretch: 'Add a spike or an enemy to make it harder, but make sure it can still be finished. Add a repeating pattern of stars and say it as “repeat … times”.'
  },

  // ═══════════════════════════════ BLOCK 2 · ISLAND BUILDERS (Years 3–4) ═══════════════════════════════
  {
    id: 'sky-7-islands', unit: u(2, 7), title: 'Plan the islands', ...Y34, tool: 'Platformer Lab (Build, pages and Play)',
    summary: 'Algorithms and decomposition. Captain Wren wants a three-island adventure, but that is a big job, so the game has been broken down into three pages with one problem on each, explained on a sign: a bridge and a door, a cliff to climb, and a lighthouse high up. Pupils write an algorithm for each part, build it, and test each part on its own with This Page before playing the whole game.',
    objective: 'We are learning to break a big problem into smaller parts (decomposition) and solve each part.',
    success: ['I can break a big job into smaller parts.', 'I can write an algorithm for one part.', 'I can test one part on its own.', 'I can join the parts into one game that works.'],
    curriculum: ['design', 'reason'],
    words: [['decompose', 'break a big problem into smaller parts that are easier to solve'], ['algorithm', 'exact steps, in order, to do a job'], ['page', 'one part of a CodeJump game; a Door takes the player to the next page'], ['test', 'try something to check that it works']],
    need: [DEVICE, 'A planning sheet with three boxes (Part 1, Part 2, Part 3)'],
    plan: [
      { min: 7, title: 'Warm up: a big job', html: '<p>Ask: how would you plan a class party? It is too big to do all at once, so we break it into parts: food, music, games, decorations, and different people do each part. Introduce <b>decompose</b>: break a big problem into smaller parts. In Years 1–2 (Block 1) pupils followed and wrote algorithms for one small island; now the islands get bigger.</p>' },
      { min: 8, title: 'Meet the three islands', html: '<p>Open the starter on the board. Point out the three pages on the left: Captain Wren has already decomposed the game into three parts. Tap each page and tap its sign to read the job. Press <b>Play</b> on page 1: Pip falls on the spiky rocks, so nothing works yet.</p><p>Show <b>This Page</b>: it tests just the page you are building. <b>Ask:</b> why is it useful to test one part on its own? (You find bugs faster, and know which part they are in.)</p>' },
      { min: 10, title: 'Plan each part', html: '<p>On the planning sheet, pupils write an algorithm (2 or 3 exact steps) for each part, for example Part 2: “1. Build a Ladder next to the cliff, from the grass to one block above the top. 2. Put a Door on top of the cliff, at the right.” Share one plan for each part.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: solve page 1, test it with <b>This Page</b>, then page 2, then page 3, and finally press <b>Play</b> for the whole game. On page 2, Pip climbs by standing on the ladder and pressing the <b>Up Arrow</b>; the ladder must go one block above the cliff so he can step off. On page 3 the mushroom must be <b>in</b> the grass (tap a grass block to swap it).</p><p>Pupils who choose steps instead of a ladder are solving the same part in a different way: praise it. <b>Ask:</b> which part are you on? How do you know it works?</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> was it easier to build the game in three parts? Which part was hardest, and how did testing that page on its own help? This block, pupils build Captain Wren’s island games and start coding them too.</p>' }
    ],
    support: 'Work in pairs, one part each, then swap. Show the ladder on page 2 on the board first.',
    stretch: 'Add a fourth page with a problem of your own, write its job on a sign (tap Sign, then tap the sign to write in it) and solve it.',
    assess: ['Explains how the game was broken into parts', 'Writes a short algorithm for at least one part', 'Tests a part on its own with This Page', 'Joins the three parts into a game that can be finished'],
    steps: [
      { t: 'Read the plan', d: 'Tap pages 1, 2 and 3 on the left in turn. On each page, tap the sign to read its job.' },
      { t: 'Part 1: the bridge', d: 'On page 1, cover the 4 spiky rocks with Platform. Put a Door on the grass at the far right. Test with This Page.' },
      { t: 'Part 2: the cliff', d: 'On page 2, build a Ladder next to the cliff, from the grass to one block above the top. Put a Door on the cliff top.' },
      { t: 'Test part 2', d: 'Press This Page. Walk to the ladder, press the Up Arrow to climb, then walk to the Door.' },
      { t: 'Part 3: the lighthouse', d: 'On page 3, tap Bounce! and tap a grass block two squares before the tall tower. Test with This Page.' },
      { t: 'Join it up', d: 'Press Play to play all three islands one after another. Does the whole game work?' },
      { t: 'Challenge', d: 'Add a 4th page with a new problem. Write its job on a sign, then solve it.' }
    ]
  },
  { adopt: 'level-designers', unit: u(2, 8) },
  {
    id: 'sky-9-welcome', unit: u(2, 9), title: 'Captain Wren’s welcome', ...Y34, tool: 'Platformer Lab (Code blocks)',
    summary: 'Longer sequences. When the game starts, Captain Wren only says “Welcome to the Sky Isles!”. Pupils plan and build a longer sequence of messages and waits: three instructions for the player, then a 3, 2, 1 countdown, “Go!” and a sound. They learn that blocks run from top to bottom, that the order matters, and why a wait is needed between messages.',
    objective: 'We are learning to write a longer sequence of instructions in the right order.',
    success: ['I can plan a sequence before I build it.', 'I can put blocks in the right order under an event.', 'I can explain why I need wait blocks between messages.'],
    curriculum: ['ssr', 'design', 'reason'],
    words: [['sequence', 'instructions that run one after another, in order'], ['message', 'words the game shows to the player'], ['wait', 'a block that pauses before the next block runs'], ['event', 'something that happens, like the game starting, that runs the blocks under it']],
    need: [DEVICE, 'Paper for planning the welcome'],
    plan: [
      { min: 7, title: 'Warm up: a rocket launch', html: '<p>Do a class countdown, but say “Go!” first and then “3, 2, 1”. <b>Ask:</b> what went wrong? Then say all the words at once, very fast. <b>Ask:</b> could anyone follow it? A good sequence needs the right <b>order</b> and the right <b>timing</b>.</p>' },
      { min: 8, title: 'One message', html: '<p>Open the starter on the board. Press <b>Code</b>, then <b>Test it — switch to Play!</b>. One message appears at the bottom: “Welcome to the Sky Isles!”. Press <b>Code</b> and show where it comes from: the last block under <b>when game starts</b>. Last lesson pupils saw events; this event runs its blocks, from top to bottom, when the game starts.</p>' },
      { min: 10, title: 'Plan and show me', html: '<p>Pupils plan Captain Wren’s welcome on paper: three instructions, then 3, 2, 1, Go! Model the first part: from <b>Actions</b>, drag <b>wait 1 seconds</b> under the welcome message and change 1 to 2, then add <b>show message</b> and type “Collect the sun gems.”. Test it. Then take the wait away and test: the first message disappears at once. <b>Ask:</b> why do we need the wait?</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card to build the whole sequence: 3 instructions with “wait 2 seconds” between them, then 3, 2, 1 with “wait 1 seconds” between, then “Go!” and <b>play sound</b> (power). They test after each few blocks.</p><p>Common bugs: a message without a wait after it (it is replaced straight away), blocks dropped beside the stack instead of joined to it (they never run), and numbers in the wrong order.</p>' },
      { min: 10, title: 'Plenary', html: '<p>Play two pupils’ welcomes on the board. <b>Ask:</b> what is the first block that runs? The last? What would happen if we moved “Go!” to the top? Next lesson: if the same blocks appear again and again, there is a quicker way.</p>' }
    ],
    support: 'Give a printed plan of the sequence with the blocks drawn; pupils build it in order and tick each block off.',
    stretch: 'Add the player’s name to the welcome, and make the countdown play a sound on every number. Can you make the whole welcome take exactly 10 seconds?',
    assess: ['Plans the sequence before building it', 'Builds a sequence of at least 10 blocks in the right order', 'Explains why the waits are needed'],
    steps: [
      { t: 'Run it', d: 'Press Code, then “Test it — switch to Play!”. Watch the bottom of the screen. How many messages are there?' },
      { t: 'Plan it', d: 'On paper, write the welcome in order: 3 instructions, then 3, 2, 1, Go!' },
      { t: 'Wait, then a message', d: 'Press Code. From Actions, add “wait 1 seconds” under the welcome and make it 2. Add “show message” and type Collect the sun gems.' },
      { t: 'Keep going', d: 'Add “wait 2 seconds” and “show message: Watch out for the spiky rocks!”, then 3, 2, 1 with “wait 1 seconds” between them.' },
      { t: 'Go!', d: 'Finish with “show message: Go!” and “play sound” (Actions). Choose power.' },
      { t: 'Test it', d: 'Press Test it. Does every message show, one at a time, in order? What if you take one wait away?' }
    ]
  },
  {
    id: 'sky-10-repeat', unit: u(2, 10), title: 'Sun gem fanfare', ...Y34, tool: 'Platformer Lab (Code blocks)',
    summary: 'Count-controlled loops. The start fanfare is the same two blocks copied four times, and a sun gem only says “Sun gem!”. Pupils spot the repeated blocks, replace all 8 with one repeat 4 loop, change one number to make the fanfare longer, then use a repeat 5 loop to make every sun gem pay a bonus that counts up 10 points at a time.',
    objective: 'We are learning to use a repeat loop to run blocks a set number of times.',
    success: ['I can spot blocks that are repeated.', 'I can use a repeat loop instead of copying blocks.', 'I can change how many times a loop repeats.', 'I can explain which blocks run inside the loop.'],
    curriculum: ['ssr', 'reason'],
    words: [['loop', 'blocks that repeat'], ['repeat … times', 'a loop that runs the blocks inside it a set number of times'], ['count-controlled', 'a loop that repeats a number of times you choose'], ['inside', 'the blocks in the gap of a loop: they run each time round']],
    need: [DEVICE],
    plan: [
      { min: 7, title: 'Warm up: the long way', html: '<p>Write on the board: “Clap. Clap. Clap. Clap. Clap. Clap. Clap. Clap. Clap. Clap.” <b>Ask:</b> is there a shorter way to write this? (“Clap 10 times.”) Pupils met repeating patterns in Block 1; in code, a <b>loop</b> repeats blocks. A <b>repeat … times</b> loop is <b>count-controlled</b>: you choose how many times.</p>' },
      { min: 8, title: 'Spot the copies', html: '<p>Open the starter, press <b>Code</b> and then <b>Test it</b>. Listen to the fanfare at the start: 4 notes, then “Go!”. Press <b>Code</b> and look under “play music”: <b>play sound</b> and <b>wait 0.5 seconds</b>, copied 4 times. <b>Ask:</b> how could we make it play 20 notes? (Copying 40 blocks!)</p>' },
      { min: 10, title: 'Show me a loop', html: '<p>Model it: drag the first copied <b>play sound</b> out of the stack (everything under it comes too), then put back “show message: Go!” under “play music”. From <b>Loops</b>, put <b>repeat 10 times</b> between “play music” and “show message: Go!”, put one <b>play sound</b> and one <b>wait</b> inside it, change 10 to 4, and drag the spare copies to the bin. Test it: the same 4 notes from 3 blocks instead of 8.</p><p><b>Ask:</b> what do we change to play 10 notes? (Just one number.)</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: the fanfare loop, then the sun gem bonus. In <b>when I collect a gem</b> they add <b>repeat 5 times</b> with <b>change score by 10</b>, <b>play sound</b> (coin) and <b>wait 0.2 seconds</b> inside it. Collecting a gem now counts the score up 10 at a time.</p><p>Common bugs: blocks placed under the loop instead of inside it (they run once, after the loop), and forgetting the wait (the coins all arrive at once). <b>Ask:</b> which blocks are inside the loop? How many times do they run?</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> how many points is one sun gem worth now? (10 for the gem rule + 5 × 10 = 60.) Why is a loop better than copying blocks? (Shorter, and one number changes it.) Next lesson: Captain Wren’s lighthouse show has bugs in its sequences and loops.</p>' }
    ],
    support: 'Build the fanfare loop together on the board. Give the gem loop with the repeat already in place; pupils fill in the inside.',
    stretch: 'Make the fanfare play a different sound on each note by putting two play sound blocks inside the loop. How many notes does repeat 4 play now?',
    assess: ['Recognises repeated blocks and replaces them with a loop', 'Changes the number of repeats to change the result', 'Explains which blocks run inside the loop and how many times'],
    steps: [
      { t: 'Listen', d: 'Press Code, then Test it. Count the notes at the start. Press Code: which blocks are copied?' },
      { t: 'Use a loop', d: 'From Loops, put “repeat 10 times” under “play music”. Put one “play sound” and one “wait” inside. Change 10 to 4. Bin the spare copies.' },
      { t: 'Test it', d: 'Press Test it. Do you hear 4 notes, then Go!? Change 4 to 10 and test again.' },
      { t: 'Sun gem bonus', d: 'Find “when I collect a gem”. Under “show message”, put “repeat 10 times” and change it to 5.' },
      { t: 'Inside the loop', d: 'From Actions, put “change score by” (10), “play sound” (coin) and “wait” (0.2) inside the repeat.' },
      { t: 'Test it', d: 'Test it and collect a sun gem. Watch the score count up. How much is one gem worth now?' }
    ]
  },
  {
    id: 'sky-11-debug', unit: u(2, 11), title: 'Fix the lighthouse show', ...Y34, tool: 'Platformer Lab (Code blocks)',
    summary: 'Debugging sequences and loops. Captain Wren’s lighthouse show has three bugs: the countdown goes 1, 2, 3 instead of 3, 2, 1; the sun gem bonus pays 500 points instead of 50; and all the bonus coins arrive at once. Pupils predict, test, find which block causes each bug and fix one at a time, then explain whether each bug was in the order, the number of repeats, or what is inside the loop.',
    objective: 'We are learning to find and fix bugs in sequences and loops.',
    success: ['I can test a program and describe what goes wrong.', 'I can find which block causes a bug.', 'I can fix a bug and test again.', 'I can explain the difference between a block inside a loop and after it.'],
    curriculum: ['reason', 'ssr'],
    words: [['bug', 'a mistake in a program'], ['debug', 'find and fix the bugs'], ['predict', 'say what you think the code will do before you run it'], ['inside / after', 'blocks inside a loop repeat; blocks after it run once, when the loop has finished']],
    need: [DEVICE, 'A “bug report” sheet: what should happen, what happens, which block, the fix'],
    plan: [
      { min: 7, title: 'Warm up: spot the bug', html: '<p>Show a recipe with a bug: “Repeat 3 times: crack an egg. Put the cake in the oven. Mix the eggs.” <b>Ask:</b> what is wrong? (The order.) Then “Repeat 30 times: crack an egg.” (The number.) Bugs in loops and sequences are often in the <b>order</b>, the <b>number</b> or <b>what is inside</b>.</p>' },
      { min: 8, title: 'Predict, then test', html: '<p>Open the starter on the board and press <b>Code</b>. Read the code together without running it. <b>Ask:</b> predict, what will the countdown say? How many points will a gem be worth? Press <b>Test it</b>, watch the countdown and collect a gem. Compare with the predictions.</p>' },
      { min: 10, title: 'Bug reports', html: '<p>Pupils run the program themselves and fill in a bug report for each problem: what should happen, what happens, which block causes it. Share: the countdown order (sequence), repeat 50 (should be 5), and the coins arriving all at once (the wait is after the loop, not inside it).</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card and fix one bug at a time, testing after each fix. For bug 3, they drag <b>wait 0.2 seconds</b> from under the loop to inside it, under <b>play sound</b>: <b>Ask:</b> how many times does it run now?</p><p>Early finishers write a new bug into their program and swap with a partner, who has to find it with a bug report.</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> which bug was in the order? Which was in the number of repeats? Which was about inside or after the loop? What is a good way to find a bug? (Predict, test, compare, change one thing, test again.) Next lesson is the Block 2 project.</p>' }
    ],
    support: 'Point to the block for each bug and ask pupils to predict what changing it will do.',
    stretch: 'The gem bonus should say “Bonus!” only once, after all the coins. Where must the show message block go?',
    assess: ['Describes what goes wrong for each bug', 'Finds the block causing each bug', 'Fixes each bug and tests again', 'Explains inside versus after a loop'],
    steps: [
      { t: 'Test it', d: 'Press Code, then Test it. Watch the countdown and collect a sun gem. Write down what goes wrong.' },
      { t: 'Bug 1: the countdown', d: 'Under “when game starts”, change the messages so the countdown says 3, 2, 1, then Go!' },
      { t: 'Bug 2: too many points', d: 'Under “when I collect a gem”, how many times does it repeat? Change it to 5.' },
      { t: 'Bug 3: all at once', d: 'The coins should count up slowly. Drag “wait 0.2 seconds” INSIDE the repeat, under “play sound”.' },
      { t: 'Test again', d: 'Press Test it. Is each bug fixed? One gem should now be worth 10 + 50 = 60.' },
      { t: 'Bug swap', d: 'Put one new bug in your code. Swap with a partner. Can they find and fix it?' }
    ]
  },
  {
    id: 'sky-12-island', unit: u(2, 12), title: 'Island challenge', ...Y34, tool: 'Platformer Lab (Build, Play and Code)',
    summary: 'The Block 2 project. Captain Wren challenges pupils to turn a plain island into their own game. They plan it in parts (decomposition), build the level, then code a welcome sequence, a repeat loop and at least two different events, testing and debugging as they go, and finally swap games with a partner.',
    objective: 'We are learning to design, build and debug our own game using sequences, loops and events.',
    success: ['I can plan my game in parts.', 'I can code a welcome sequence with waits.', 'I can use a repeat loop.', 'I can use at least two different events.', 'I can test my game and fix bugs.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['design', 'plan how something will look and work'], ['decompose', 'break a big job into parts'], ['sequence', 'instructions in order'], ['loop', 'blocks that repeat'], ['event', 'something that happens and starts code']],
    need: [DEVICE, 'A planning sheet: level sketch, welcome, repeat, events'],
    plan: [
      { min: 5, title: 'The challenge', html: '<p>Read Captain Wren’s sign in the starter: make this island your own game. Recap the block: decomposition, events and rules, sequences, loops and debugging. Share the success criteria: a welcome sequence, a repeat, two events, and a game that can be won.</p>' },
      { min: 10, title: 'Plan it', html: '<p>Pupils plan in parts on the planning sheet: a sketch of the level, the welcome messages in order, what their loop will repeat, and which two events they will use (for example <b>when I collect a gem</b> and <b>when I get hurt</b>).</p>' },
      { min: 30, title: 'Build, code, test', html: '<p>Pupils follow the Lesson card. Encourage building one part at a time and testing it before the next. Circulate and ask: “Which part are you on? How do you know it works? What did you change after testing?”</p><p>Remind pupils to press <b>Build</b> before <b>Code</b> after a test, and to keep a <b>Start</b> and a <b>Finish</b>.</p>' },
      { min: 10, title: 'Swap and review', html: '<p>Pairs swap and play each other’s games. The reviewer finds the welcome, the loop and the two events, and gives one star (something good) and one wish (something to improve or a bug they found).</p>' },
      { min: 5, title: 'Reflect', html: '<p><b>Ask:</b> what was the hardest bug you fixed today? How did you find it? Celebrate the end of Block 2.</p>' }
    ],
    support: 'Pupils start from the code of the last two lessons (welcome and gem bonus) and change the messages and numbers to make it their own.',
    stretch: 'Add a second page with a Door, and use “when I land on a page” to show a message when the player arrives.',
    assess: ['Plans the game in parts', 'Codes a welcome sequence with waits', 'Uses a repeat loop correctly', 'Uses at least two different events', 'Tests and fixes bugs'],
    steps: [
      { t: 'Plan it', d: 'On paper, plan your island in parts: the level, a welcome, something to repeat, and two events.' },
      { t: 'Build the level', d: 'Press Build. Change the island: blocks, gems and hazards. Keep a Start and a Finish.' },
      { t: 'Welcome sequence', d: 'Press Code. Under “when game starts”, add at least 3 messages with waits between them.' },
      { t: 'A loop', d: 'Use “repeat … times” somewhere, like a sun gem bonus or a fanfare.' },
      { t: 'Two events', d: 'Use two events from Events, like “when I collect a gem” and “when I get hurt”.' },
      { t: 'Test and swap', d: 'Test every part and fix any bugs. Then swap with a partner and play each other’s games.' }
    ]
  },
  // ═══════════════════════════════ BLOCK 3 · WEATHER AND WONDERS (Years 4–5) ═══════════════════════════════
  {
    id: 'sky-13-enough', unit: u(3, 13), title: 'Enough sun gems?', ...Y45, tool: 'Platformer Lab (Code blocks)',
    summary: 'The first lesson on selection. Sun Gem Island has five sun gems but no way off, and Mist Island (page 2) has the Finish. Pupils learn that an if block only runs the blocks inside it when its condition is true, then code the sky bridge: when I collect a gem, if score = 50, show “The sky bridge is open!”, wait a second and go to the next page.',
    objective: 'We are learning to use an if block so a program can make a decision.',
    success: ['I can explain that an if only runs its blocks when its condition is true.', 'I can use the score in a condition.', 'I can test that my if works only at the right time.'],
    curriculum: ['ssr', 'reason', 'design'],
    words: [['selection', 'the program chooses whether to run some blocks or not'], ['if', 'a block that runs the blocks inside it only when its condition is true'], ['condition', 'a question whose answer is true or false, like “score = 50”'], ['true / false', 'the two possible answers to a condition']],
    need: [DEVICE],
    plan: [
      { min: 7, title: 'Warm up: stand up if…', html: '<p>Play “Stand up if…”: “Stand up <b>if</b> you have a pet. Stand up <b>if</b> your birthday is in winter.” Everyone hears the same instruction, but only some stand. <b>Ask:</b> why did some people stand and not others? (The answer was true for them.) Introduce <b>selection</b> and <b>condition</b>: a question that is true or false.</p><p>Block 3 of Sky Isles Explorers is about games that make decisions.</p>' },
      { min: 8, title: 'Stuck on Sun Gem Island', html: '<p>Open the starter on the board, press <b>Code</b>, then <b>Test it — switch to Play!</b>. Read the sign: the sky bridge opens when you have all 5 sun gems. Collect them all: nothing happens. Press <b>Build</b> and show page 2, Mist Island, with the Finish.</p><p>Press <b>Code</b>. Every gem runs “when I collect a gem → show message: Sun gem!”. <b>Ask:</b> how can the game know when you have all five? (The score: 5 gems × 10 = 50.)</p>' },
      { min: 10, title: 'Show me an if', html: '<p>Model it: from <b>Logic</b>, drag <b>if</b> under “show message: Sun gem!”. From <b>Logic</b>, put the <b>=</b> block into the if. From <b>Values</b>, drag <b>score</b> into its left gap; from <b>Math</b>, a number into the right gap: 50. Read it aloud: “If score equals 50, do…”.</p><p><b>Ask:</b> after the first gem, the score is 10. Is the condition true or false? What happens? Trace it for each gem in a table on the board.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: the if, the condition, then inside it <b>show message</b> “The sky bridge is open!”, <b>wait 1 seconds</b> and <b>go to next page</b>. They test that 4 gems do nothing and the 5th takes Pip to Mist Island.</p><p>Common bugs: the go to next page block under the if instead of inside it (it runs after the first gem!), the number 50 typed as text, or the score block on the wrong side (that still works: = does not mind). Remind pupils to press <b>Build</b>, then <b>Code</b> after a test that reached page 2.</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> when is the condition true? What does the if do when it is false? (It skips the blocks inside.) Write on the board: <b>if [condition] do [this]</b>. Next lesson: what if we want the program to do something else when the condition is false?</p>' }
    ],
    support: 'Give the if and the = block already joined; pupils add score, 50 and the three blocks inside.',
    stretch: 'Change the rule so a gem is worth 20 points. Does the bridge still open? Fix the condition so it opens after 5 gems again.',
    assess: ['Explains that the blocks inside an if run only when the condition is true', 'Builds the condition score = 50', 'Tests with 4 gems and with 5 to check the if'],
    steps: [
      { t: 'Try it', d: 'Press Code, then “Test it — switch to Play!”. Collect all 5 sun gems. Can you leave Sun Gem Island?' },
      { t: 'Add an if', d: 'Press Build, then Code. From Logic, drag “if” under “show message: Sun gem!” in “when I collect a gem”.' },
      { t: 'The condition', d: 'From Logic, put “=” in the if. Put “score” (Values) in its left gap and a number (Math) in the right gap: 50.' },
      { t: 'Open the bridge', d: 'Inside the if, put “show message” (The sky bridge is open!), “wait 1 seconds” and “go to next page” from Actions.' },
      { t: 'Test it', d: 'Test it. After 4 gems, nothing happens. After the 5th, do you cross to Mist Island?' },
      { t: 'Challenge', d: 'Make a gem worth 20 points (Rules). Then fix your condition so the bridge still opens after 5 gems.' }
    ]
  },
  {
    id: 'sky-14-ouch', unit: u(3, 14), title: 'Ouch or last life?', ...Y45, tool: 'Platformer Lab (Code blocks)',
    summary: 'Selection with if … else. Every time Pip gets hurt the game just says “Ouch!”. Pupils use the lives value and an if … else so the game chooses between two messages: “Ouch! Lives left: 2” while there is more than one life, otherwise “Last life! Be careful!” with a warning sound. They test both paths.',
    objective: 'We are learning to use if … else so a program chooses between two actions.',
    success: ['I can explain what if … else does.', 'I can use lives and greater than (>) in a condition.', 'I can join words and a number in a message.', 'I can test both paths of my if … else.'],
    curriculum: ['ssr', 'reason'],
    words: [['if … else', 'if the condition is true do one thing, otherwise (else) do another'], ['greater than (>)', 'a comparison: 3 > 1 is true, 1 > 1 is false'], ['path', 'one of the ways a program can go through an if … else'], ['create text with', 'a block that joins words and numbers into one message']],
    need: [DEVICE],
    plan: [
      { min: 7, title: 'Warm up: umbrella or sun hat?', html: '<p>Say: “<b>If</b> it is raining, take an umbrella, <b>else</b> take a sun hat.” <b>Ask:</b> what do you take today? Every answer takes one of the two, never both and never neither. Compare with last lesson’s if, which did nothing when the condition was false.</p>' },
      { min: 8, title: 'Always Ouch!', html: '<p>Open the starter, press <b>Code</b>, then <b>Test it</b>. Touch the spikes twice. Both times the game says “Ouch!”, even when Pip is down to his last life. Show the code: <b>when I get hurt → show message: Ouch!</b>. <b>Ask:</b> what would be more helpful to the player?</p>' },
      { min: 10, title: 'Show me if … else', html: '<p>Model it: drag “show message: Ouch!” away. From <b>Logic</b>, put <b>if</b> under <b>when I get hurt</b>, click its blue cog and drag <b>else</b> into the <b>if</b> in the little box. From <b>Logic</b>, put the <b>=</b> block in and change it to <b>></b>; put <b>lives</b> (Values) on the left and <b>1</b> (Math) on the right.</p><p>Note: “when I get hurt” runs after the life has been taken away, so the first time lives is already 2. Trace both paths on the board: lives 2 → 2 > 1 is true → “Ouch!”; lives 1 → 1 > 1 is false → else.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card. For the do path they use <b>create text with</b> (Text) to join “Ouch! Lives left: ” and <b>lives</b>; for else, “Last life! Be careful!” and <b>play sound</b> (zap). They test both paths by getting hurt twice.</p><p>Common bugs: using = instead of > (only true for exactly one value), the messages the wrong way round, forgetting the space in “Lives left: ”. <b>Ask:</b> which path did the program take, and why?</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> how is if … else different from if? Why do we need to test BOTH paths? Next lesson: comparing numbers to give medals, with more than two choices.</p>' }
    ],
    support: 'Give the if … else and its condition already built; pupils fill in the two paths.',
    stretch: 'Use the cog to add an “else if” so the game says something different with 2 lives, 1 life and none to spare.',
    assess: ['Explains that if … else always runs exactly one of its two paths', 'Builds the condition lives > 1', 'Joins text and a value in a message', 'Tests both paths'],
    steps: [
      { t: 'Get hurt', d: 'Press Code, then Test it. Touch the spikes twice. What does the game say each time?' },
      { t: 'If … else', d: 'Press Code. Drag “show message: Ouch!” away. Put an “if” (Logic) under “when I get hurt”. Click its blue cog and drag “else” into the “if”.' },
      { t: 'The condition', d: 'Put “=” (Logic) in the if and change it to “>”. Put “lives” (Values) on the left and 1 (Math) on the right.' },
      { t: 'Two messages', d: 'In do: show a message made with “create text with” (Text): Ouch! Lives left: and lives. In else: Last life! Be careful! and play sound zap.' },
      { t: 'Test both paths', d: 'Test it and get hurt twice. Do you see both messages, in the right order?' },
      { t: 'Challenge', d: 'Click the cog and add “else if”, so each number of lives gets its own message.' }
    ]
  },
  {
    id: 'sky-15-medals', unit: u(3, 15), title: 'Speed medals', ...Y45, tool: 'Platformer Lab (Code blocks)',
    summary: 'Comparison and logic operators. Pip races to the door against a 60-second clock, then arrives at the medal podium on page 2. Pupils use “seconds left” with greater than (>) in an if … else if … else to award Gold, Silver or Bronze, then join two conditions with “and” for a Perfect run bonus, and test every path.',
    objective: 'We are learning to use comparison operators and “and” in conditions.',
    success: ['I can use > to compare a value with a number.', 'I can use else if to choose between three things.', 'I can use “and” to check two things at once.', 'I can test my program with different times to check every medal.'],
    curriculum: ['ssr', 'reason', 'design'],
    words: [['operator', 'a symbol that compares or combines, like >, < or and'], ['comparison', 'checking how two values compare: bigger, smaller or equal'], ['else if', 'another condition checked only when the ones before it were false'], ['and', 'true only when BOTH conditions are true']],
    need: [DEVICE, 'Mini whiteboards for the true or false warm-up'],
    plan: [
      { min: 7, title: 'Warm up: true or false?', html: '<p>Show statements on the board and pupils hold up true or false: 45 > 40, 40 > 40, 12 < 20, (3 = 3 and 50 > 40), (3 = 2 and 50 > 40). Introduce <b>operators</b>: > greater than, < less than, = equals, and <b>and</b>, which needs both sides to be true.</p>' },
      { min: 8, title: 'Race to the podium', html: '<p>Open the starter, press <b>Code</b>, then <b>Test it</b>. The seconds left count down at the top of the screen. Race to the door: on page 2, the medal podium only says “Welcome to the medal podium!”.</p><p>Show the code: <b>when I land on a page → if page number = 2 → show message</b>. (This event also runs on page 1, so the if checks which page.) Agree the medal rules: more than 40 seconds left = Gold, more than 20 = Silver, otherwise Bronze.</p>' },
      { min: 10, title: 'Show me else if', html: '<p>Press <b>Build</b>, then <b>Code</b>. Model it: add <b>wait 2 seconds</b> under the welcome message, then an <b>if</b>; click its blue cog and drag in one <b>else if</b> and one <b>else</b>. Build the first condition: <b>seconds left</b> (Values) <b>></b> <b>40</b>. <b>Ask:</b> with 30 seconds left, which path runs? (Not the first; the else if checks > 20: true, so Silver.) Why don’t we need “and less than 40” in the else if?</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: the three medals with a score bonus each, then the Perfect run: after <b>wait 2 seconds</b>, an if with <b>and</b> (Logic) joining <b>lives = 3</b> and <b>seconds left > 40</b>.</p><p>To test every path, pupils race fast, dawdle on purpose, and get hurt once. Common bugs: the conditions in the wrong order (checking > 20 first gives everyone Silver), and < instead of >.</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> why does the order of the conditions matter in if … else if? What is the difference between “and” and two separate ifs? Next lesson: a loop that keeps checking a condition.</p>' }
    ],
    support: 'Give a table of the three medals with the conditions written in; pupils build them one at a time and test each.',
    stretch: 'Add a fourth medal (Platinum for more than 50 seconds left). Where in the order must it go? Then use “or” for a different bonus.',
    assess: ['Uses > with seconds left to compare values', 'Builds if … else if … else in the right order', 'Uses “and” to join two conditions', 'Tests every path by changing how fast they race'],
    steps: [
      { t: 'Race', d: 'Press Code, then Test it. Watch the seconds left at the top and race to the door. What happens on the podium?' },
      { t: 'Wait first', d: 'Press Build, then Code. In “when I land on a page”, add “wait 2 seconds” under the welcome message.' },
      { t: 'Three choices', d: 'Add an “if” under the wait. Click its blue cog and drag in one “else if” and one “else”.' },
      { t: 'The medals', d: 'If seconds left > 40: Gold medal! and change score by 300. Else if seconds left > 20: Silver medal! and 200. Else: Bronze medal! and 100.' },
      { t: 'Perfect run', d: 'Add “wait 2 seconds”, then an if with “and” (Logic): lives = 3 and seconds left > 40. Inside: Perfect run! and change score by 100.' },
      { t: 'Test every path', d: 'Race fast, then slowly, then get hurt once. Can you earn every medal?' }
    ]
  },
  {
    id: 'sky-16-storm', unit: u(3, 16), title: 'Storm warning', ...Y45, tool: 'Platformer Lab (Code blocks)',
    summary: 'Loops that check a condition. Captain Wren says a storm is coming: Pip must reach the lighthouse within 60 seconds, but nothing warns the player when time is running out. Pupils use repeat until with a condition (seconds left < 20) and a wait inside, so the program keeps checking once a second and then warns: “The storm is coming! Hurry!”.',
    objective: 'We are learning to use a loop that repeats until a condition is true.',
    success: ['I can explain the difference between “repeat 10 times” and “repeat until”.', 'I can use seconds left and less than (<) in a condition.', 'I can explain why the loop needs a wait inside it.'],
    curriculum: ['ssr', 'reason'],
    words: [['repeat until', 'a loop that keeps repeating until its condition becomes true'], ['less than (<)', 'a comparison: 19 < 20 is true, 20 < 20 is false'], ['check', 'ask the condition again'], ['condition-controlled loop', 'a loop that stops because of a condition, not a count']],
    need: [DEVICE],
    plan: [
      { min: 7, title: 'Warm up: are we there yet?', html: '<p>Act it out: a pupil asks “Are we there yet?” every few seconds until you say yes. <b>Ask:</b> how many times did they ask? (We did not know in advance!) In Block 2, <b>repeat 4 times</b> knew the number. A <b>repeat until</b> loop keeps checking a condition until it becomes true.</p>' },
      { min: 8, title: 'No warning', html: '<p>Open the starter, press <b>Code</b>, then <b>Test it</b>. Read the sign. Stand still and watch the seconds left at the top: the time runs out with no warning at all. Show the rule: <b>win by reaching the goal within 60 seconds</b>. <b>Ask:</b> when should the game warn the player? (When fewer than 20 seconds are left.)</p>' },
      { min: 10, title: 'Show me repeat until', html: '<p>Press <b>Build</b>, then <b>Code</b>. From <b>Loops</b>, put <b>repeat while</b> under “play music” and change while to <b>until</b>. Build the condition: <b>seconds left</b> (Values) <b><</b> <b>20</b>. Inside the loop put <b>wait 1 seconds</b>. Under the loop (not inside!) put <b>show message: The storm is coming! Hurry!</b>.</p><p>Read it aloud: “Keep waiting a second, until fewer than 20 seconds are left. Then warn the player.” <b>Ask:</b> why is the message under the loop, not inside it?</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card and test by waiting. Then, as a deliberate experiment, they take the wait out of the loop and test: the game says “Your code ran too long and was stopped!”, because the loop checked thousands of times in one go. They put the wait back.</p><p>Early finishers add a second warning loop for lives: repeat until lives < 2, then “Last life!”.</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> what are the two kinds of loop we know? When would you use each? Why does the repeat until loop need a wait inside? Next lesson: the weather station program has bugs in its loops and conditions.</p>' }
    ],
    support: 'Give the loop already built with its condition; pupils add the wait and the warning in the right places and test.',
    stretch: 'Add a second loop, in another “when game starts”, that repeats until lives < 2 and then says “Last life! Be careful!”.',
    assess: ['Builds repeat until with the condition seconds left < 20', 'Puts the wait inside the loop and the warning after it', 'Explains the difference between count-controlled and condition-controlled loops'],
    steps: [
      { t: 'Play it', d: 'Press Code, then Test it. Stand still and watch the seconds left. Does anything warn you?' },
      { t: 'Repeat until', d: 'Press Build, then Code. From Loops, put “repeat while” under “play music” in “when game starts”. Change while to until.' },
      { t: 'The condition', d: 'Put “=” (Logic) in the gap and change it to “<”. Put “seconds left” (Values) on the left and 20 (Math) on the right.' },
      { t: 'Wait inside', d: 'From Actions, put “wait 1 seconds” INSIDE the loop, so it checks once every second.' },
      { t: 'The warning', d: 'UNDER the loop, add “show message: The storm is coming! Hurry!” and “play sound” zap.' },
      { t: 'Test it', d: 'Test it and wait. Does the warning come with 19 seconds left? Try it with the wait taken out: what happens?' }
    ]
  },
  {
    id: 'sky-17-debug', unit: u(3, 17), title: 'Fix the weather station', ...Y45, tool: 'Platformer Lab (Code blocks)',
    summary: 'Debugging loops and conditions. The weather station program has three bugs: the storm warning’s loop has no wait inside, so it runs too long and is stopped; the sky bridge checks score > 50, which is never true with 5 gems worth 10 each; and the hurt messages are the wrong way round. Pupils test, trace each condition with real values in a table and fix the bugs.',
    objective: 'We are learning to find and fix bugs in loops and conditions.',
    success: ['I can test a program and describe each bug.', 'I can trace a condition with real values to see if it is true or false.', 'I can fix a loop and a condition.', 'I can explain the difference between > and ≥.'],
    curriculum: ['reason', 'ssr'],
    words: [['trace', 'work through the code step by step with real values'], ['greater than or equal to (≥)', 'true when the left value is bigger than, or the same as, the right'], ['bug', 'a mistake in a program'], ['loop', 'blocks that repeat']],
    need: [DEVICE, 'A tracing table: value, condition, true or false?'],
    plan: [
      { min: 7, title: 'Warm up: trace it', html: '<p>Write <b>if score > 50</b> on the board. Pupils hold up true or false for score = 40, 50, 60. Then <b>score ≥ 50</b> for the same values. <b>Ask:</b> which one is true when the score is exactly 50? This is <b>tracing</b>: working through a condition with real values.</p>' },
      { min: 8, title: 'Test the station', html: '<p>Open the starter, press <b>Code</b>, then <b>Test it</b>. Read the message that appears at the start: “Your code ran too long and was stopped!”. Get hurt once and read the message. Collect all five gems. Pupils list what goes wrong: no storm warning, the bridge never opens, and the first hurt says “Last life!”.</p>' },
      { min: 10, title: 'Find the blocks', html: '<p>Press <b>Build</b>, then <b>Code</b>, and read each script together. For each bug, pupils find the block that causes it and fill in the tracing table: the bridge with score 50 (50 > 50 is false); the hurt message with lives 2 (2 > 1 is true, so the do path runs, but it holds the “Last life!” message); the loop with nothing inside it, which checks thousands of times in one go.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card and fix one bug at a time, testing after each: the wait inside the loop, > changed to ≥ (or = 50), and the two messages swapped between do and else. To test the storm warning they wait until fewer than 20 seconds are left.</p><p>Early finishers write a new bug into a condition, swap with a partner and trace each other’s bug with a table.</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> which bug did tracing help you find? What kinds of bugs do loops and conditions have? (A loop with no wait, the wrong operator, the paths the wrong way round.) Next lesson is the Block 3 project.</p>' }
    ],
    support: 'Fill in the first row of the tracing table together, and show where the wait block goes.',
    stretch: 'Change the bridge so it opens when score ≥ 50 AND lives > 1. Trace it for three different cases.',
    assess: ['Describes each bug from testing', 'Traces conditions with real values', 'Fixes the loop, the operator and the if … else', 'Explains > versus ≥'],
    steps: [
      { t: 'Test it', d: 'Press Code, then Test it. Read the first message. Get hurt once, then collect all 5 gems. Write down 3 things that go wrong.' },
      { t: 'Bug 1: the loop', d: 'Press Build, then Code. In “when game starts”, the “repeat until” loop is empty. Put “wait 1 seconds” inside it.' },
      { t: 'Bug 2: the bridge', d: 'Trace it: after 5 gems the score is 50. Is 50 > 50 true? In “when I collect a gem”, change > to ≥.' },
      { t: 'Bug 3: the messages', d: 'In “when I get hurt”, the two messages are the wrong way round. Swap what is in do and else.' },
      { t: 'Test again', d: 'Test every fix: get hurt twice, collect the gems, and wait for the storm warning (19 seconds left).' },
      { t: 'Bug swap', d: 'Put a new bug in a condition. Swap with a partner. Can they trace it and fix it?' }
    ]
  },
  {
    id: 'sky-18-arcade', unit: u(3, 18), title: 'Sky arcade', ...Y45, tool: 'Platformer Lab (Build, Play and Code)',
    summary: 'The Block 3 project. Pupils design an arcade-style island game that makes its own decisions: an if … else, comparisons with score, lives or seconds left, and a loop that keeps checking a condition. They plan the rules as sentences first (“if … then … else …”), build and code them, test every path and swap games.',
    objective: 'We are learning to design and build a game that makes decisions, using selection, comparisons and loops.',
    success: ['I can plan rules as if … else sentences.', 'I can code an if … else with a comparison.', 'I can code a loop that keeps checking a condition.', 'I can test every path of my rules.'],
    curriculum: ['design', 'ssr', 'reason'],
    words: [['selection', 'the program chooses what to do'], ['condition', 'a question that is true or false'], ['operator', '>, <, =, ≥, and, or'], ['path', 'one of the ways through an if … else']],
    need: [DEVICE, 'A planning sheet: three rules written as sentences'],
    plan: [
      { min: 5, title: 'The arcade', html: '<p>Open the starter: an island with gems, spikes and a 90-second race. The job: make a game that makes its own decisions. Recap the block: if, if … else, comparisons and “and”, repeat until, and tracing bugs.</p>' },
      { min: 10, title: 'Plan the rules', html: '<p>Pupils write three rules as sentences on the planning sheet, such as “If score ≥ 40, then bonus 100, else say Keep collecting”, “Repeat until seconds left < 30, then warn the player”, “If lives > 1, then Ouch, else Last life”. They mark the condition and the operator in each.</p>' },
      { min: 30, title: 'Build, code, test', html: '<p>Pupils follow the Lesson card. For each rule: build it, then test it so the condition is true once and false once. Circulate and ask pupils to trace one of their conditions for you with real values.</p>' },
      { min: 10, title: 'Swap and review', html: '<p>Partners play each other’s games and try to work out the rules from playing alone. Then the designer shows the code: were they right? One star and one wish.</p>' },
      { min: 5, title: 'Reflect', html: '<p><b>Ask:</b> which rule was hardest to test? Celebrate the end of Block 3.</p>' }
    ],
    support: 'Start from one rule from this block’s lessons (the storm warning or the hurt messages) and change the numbers and messages.',
    stretch: 'Use else if for three or more choices, and “and” or “or” to join two conditions. Add a second page with a door.',
    assess: ['Plans rules as conditions', 'Codes if … else with a comparison', 'Codes a condition-controlled loop with a wait', 'Tests both paths of each rule'],
    steps: [
      { t: 'Plan your rules', d: 'On paper, write 3 rules as sentences, like: if score ≥ 40, then a bonus, else Keep collecting.' },
      { t: 'Build the island', d: 'Press Build. Make the island yours: gems, spikes and platforms. Keep a Start and a Finish.' },
      { t: 'If … else', d: 'Press Code. Code one rule with if … else, using score, lives or seconds left.' },
      { t: 'Keep checking', d: 'Code a “repeat until” loop with a wait inside that warns the player about something.' },
      { t: 'Test every path', d: 'Test so each condition is true once and false once. Fix any bugs you find.' },
      { t: 'Swap', d: 'Swap with a partner. Can they work out your rules just by playing?' }
    ]
  },

  // ═══════════════════════════════ BLOCK 4 · KEEPERS OF THE LIGHT (Years 5–6) ═══════════════════════════════
  { adopt: 'code-the-rules', unit: u(4, 19) },
  {
    id: 'sky-20-pilots', unit: u(4, 20), title: 'Test pilots', ...Y56, tool: 'Platformer Lab (Code blocks)',
    summary: 'Variables and data. Captain Wren needs test pilots to find the best settings for Pip’s jump. Pupils create variables seconds, hurts and gems, change them with events (every 1 seconds, when I get hurt, when I collect a gem) and show the results when Pip reaches the results room on page 2. Then they run a fair test: change ONE setting at a time, play the course, record the data in a table and use it to decide which settings are best.',
    objective: 'We are learning to use variables to collect data, and to use the data to answer a question.',
    success: ['I can create variables and give them starting values.', 'I can change a variable when an event happens.', 'I can show variables in a message.', 'I can run a fair test by changing one thing at a time and record the results.'],
    curriculum: ['ssr', 'data', 'design'],
    words: [['variable', 'a named value that can change while the program runs'], ['data', 'facts and numbers we collect, like times and scores'], ['fair test', 'a test where you change only one thing, so you know what made the difference'], ['starting value', 'what a variable is set to at the start']],
    need: [DEVICE, 'A results table: setting, seconds, hurts, gems'],
    plan: [
      { min: 7, title: 'Warm up: which is best?', html: '<p><b>Ask:</b> how could we find out which paper aeroplane design flies furthest? Agree what makes a <b>fair test</b>: change one thing, keep everything else the same, and measure. In the last lesson (“Code the rules”) pupils made variables for the rules of a game; today variables collect <b>data</b>.</p>' },
      { min: 8, title: 'The test course', html: '<p>Open the starter, press <b>Code</b>. Point out the settings under “when game starts”: <b>jump height is normal</b> and <b>gravity is normal</b>. Captain Wren wants to know which jump height makes the course easiest. <b>Ask:</b> what data should we collect? (How long it takes, how often Pip gets hurt, how many gems he gets.)</p>' },
      { min: 10, title: 'Show me', html: '<p>Model one variable: <b>Variables → Create variable...</b>, call it <b>seconds</b>. Under “gravity is normal” put <b>set seconds to 0</b> (a number from Math). From <b>Events</b>, drag out <b>every 2 seconds</b>, change it to 1, and put <b>change seconds by 1</b> under it. Then show the results on page 2 with <b>when I land on a page</b>, <b>if page number = 2</b> and <b>show message</b> with <b>create text with</b> (use its cog to add more items).</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: three variables, three events, the results message, then the fair test. Each pupil flies the course three times with jump height low, normal and high (changing nothing else) and records seconds, hurts and gems in the table.</p><p>Common bugs: no starting value, “set” instead of “change” in an event (it never counts up), and putting the variable’s name in a text block instead of the variable block. Remind pupils to press <b>Build</b>, then <b>Code</b> after reaching page 2.</p>' },
      { min: 10, title: 'Use the data', html: '<p>Pairs compare their tables. <b>Ask:</b> which jump height was best? How do you know? Was it a fair test? What else could change the results (the person playing!)? How could we make the test fairer? (More tests, the same player, an average.)</p>' }
    ],
    support: 'Build the seconds variable together; pupils copy the pattern for hurts and gems. Give a results message already started.',
    stretch: 'Test gravity as well (floaty, normal, heavy), keeping jump height the same. Draw a bar chart of the seconds for each setting.',
    assess: ['Creates variables with starting values', 'Changes variables when events happen', 'Shows the data in a message', 'Records results in a table and draws a sensible conclusion'],
    steps: [
      { t: 'Make variables', d: 'Press Code. Open Variables, press “Create variable...” and make seconds, hurts and gems.' },
      { t: 'Start at 0', d: 'Under “gravity is normal”, put “set seconds to” with 0 (Math). Do the same for hurts and gems.' },
      { t: 'Count them', d: 'From Events: “every 2 seconds” (make it 1) → “change seconds by 1”. “when I get hurt” → “change hurts by 1”. “when I collect a gem” → “change gems by 1”.' },
      { t: 'Show the results', d: 'Add “when I land on a page” → if page number = 2 → show message with “create text with”: Time:, seconds, Hurts:, hurts, Gems:, gems.' },
      { t: 'Fly the course', d: 'Test it and reach the door. Write the results in your table.' },
      { t: 'Fair test', d: 'Change ONLY “jump height is” to low, then high. Test each and record. Which is best? Why?' }
    ]
  },
  {
    id: 'sky-21-reward', unit: u(4, 21), title: 'Reward function', ...Y56, tool: 'Platformer Lab (Code blocks)',
    summary: 'Functions with inputs. Captain Wren pays rewards: the gem event and the button event both do the same three things (change the score, play a sound, show a message) with different numbers. Pupils make one function, reward, with an input called points, call it with 5 and 50 instead of the copies, then reuse it for a new reward of 100 when Pip reaches Lighthouse Island on page 2.',
    objective: 'We are learning to make a function with an input and use it more than once.',
    success: ['I can spot code that is repeated with different numbers.', 'I can make a function with an input.', 'I can call a function with different inputs.', 'I can explain why a function makes code easier to change.'],
    curriculum: ['ssr', 'design', 'reason'],
    words: [['function', 'a named set of blocks you can use again and again'], ['input', 'a value you give a function each time you call it'], ['call', 'use a function: its blocks run with the input you give'], ['reuse', 'use the same code again for a new job']],
    need: [DEVICE],
    plan: [
      { min: 7, title: 'Warm up: a recipe card', html: '<p>Show two recipes that are the same except for one number: “Mix 2 eggs, stir, bake” and “Mix 6 eggs, stir, bake”. <b>Ask:</b> how could we write this once? (“Mix EGGS eggs, stir, bake”, and say how many each time.) That is a <b>function</b> with an <b>input</b>.</p>' },
      { min: 8, title: 'Spot the copies', html: '<p>Open the starter, press <b>Code</b> and compare <b>when I collect a gem</b> with <b>when a button is pressed</b>: change score by 5 / 50, play sound coin, show message +5 / +50. <b>Ask:</b> what is the same? What is different? Captain Wren wants a new reward of 100 on Lighthouse Island. Do we copy the blocks again?</p>' },
      { min: 10, title: 'Show me a function', html: '<p>Model it: from <b>Functions</b>, drag out <b>to do something</b>, click its name and type <b>reward</b>. Click its blue cog and drag <b>input name</b> into <b>inputs</b>; name it <b>points</b>. Inside: <b>change score by</b> with <b>points</b> (from Variables), <b>play sound</b> coin, and <b>show message</b> with <b>create text with</b>: “+” and <b>points</b>.</p><p>Now <b>Functions</b> has a new block: <b>reward with points</b>. Replace the gem blocks with <b>reward</b> and the number 5. <b>Ask:</b> what happens when the function is called with 5? With 50?</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: make the function, call it from both events, then reuse it: <b>when I land on a page → if page number = 2 → reward 100</b>. They test that each reward still works and that the messages say +5, +50 and +100.</p><p>Then a change test: Captain Wren wants every reward to play the power sound. <b>Ask:</b> how many blocks do you change now? (One, inside the function.)</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> what is the input of our function? Where do its values come from? Why is a function better than copies? Next lesson: a shop that uses a variable, a function and if … else together.</p>' }
    ],
    support: 'Give the function already defined with its input; pupils fill in the three blocks and make the calls.',
    stretch: 'Add a second input to the function, sound, so each reward can choose its own sound. Or give a reward of −20 when Pip gets hurt.',
    assess: ['Identifies repeated code with different values', 'Defines a function with an input', 'Calls it with different inputs', 'Explains how a function makes changes easier'],
    steps: [
      { t: 'Spot the copies', d: 'Press Code. Compare “when I collect a gem” and “when a button is pressed”. What is the same? What is different?' },
      { t: 'Make a function', d: 'From Functions, drag out “to do something” and name it reward. Click its blue cog and drag “input name” in. Name it points.' },
      { t: 'Fill it', d: 'Inside reward: “change score by” with points (Variables), “play sound” coin, and “show message” with “create text with”: + and points.' },
      { t: 'Call it', d: 'Bin the old blocks. Under “when I collect a gem” put “reward” (Functions) with 5. Under “when a button is pressed”, reward with 50.' },
      { t: 'Reuse it', d: 'Add “when I land on a page” → if page number = 2 → reward with 100.' },
      { t: 'Test it', d: 'Test it: get a gem, stand on the red button, go through the door. Do you see +5, +50 and +100?' }
    ]
  },
  {
    id: 'sky-22-shop', unit: u(4, 22), title: 'The sky shop', ...Y56, tool: 'Platformer Lab (Code blocks)',
    summary: 'Variables, functions and selection together. The red button is Captain Wren’s sky shop, where an extra life costs 30 points. Pupils keep the price in a variable, write a function buy with an input cost: if score ≥ cost, take the cost off the score and give an extra life, else say how many points are needed. The button calls buy with the price. They test both paths and change the price in one place.',
    objective: 'We are learning to combine a variable, a function with an input and if … else in one program.',
    success: ['I can use a variable to store a value that the program uses.', 'I can write a function with an input.', 'I can use if … else inside a function.', 'I can test both paths of my program.'],
    curriculum: ['ssr', 'reason', 'design'],
    words: [['variable', 'a named value that can change, like price'], ['function', 'a named set of blocks you can call'], ['input', 'the value a function is given when it is called, like cost'], ['≥ (greater than or equal to)', 'true when the left is bigger than or the same as the right']],
    need: [DEVICE],
    plan: [
      { min: 7, title: 'Warm up: the tuck shop', html: '<p>Role-play a shop: “If you have at least 30p, you can buy it and I take 30p; else I tell you how much you need.” Pupils say what happens with 20p, 30p and 50p. Pick out the parts: the price (a <b>variable</b>), buying (a <b>function</b> with the cost as its <b>input</b>) and the decision (<b>if … else</b> with <b>≥</b>).</p>' },
      { min: 8, title: 'The sky shop', html: '<p>Open the starter and press <b>Code</b>, then <b>Test it</b>. Collect gems (10 points each) and stand on the red button: a gate opens, but nothing is sold. Read the sign: an extra life costs 30 points. <b>Ask:</b> what will the program need to know? What will it decide?</p>' },
      { min: 10, title: 'Show me the plan', html: '<p>Write the program as pseudocode on the board first:<br>when game starts: set price to 30<br>to buy with cost: if score ≥ cost then change score by (0 − cost), change lives by 1, say Extra life! else say You need cost points<br>when a button is pressed: buy with price</p><p>Model creating the <b>price</b> variable and the <b>buy</b> function with its input <b>cost</b> (blue cog).</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card. The subtraction uses <b>Math</b>: the <b>+</b> block changed to <b>−</b>, with 0 and <b>cost</b>. They test both paths: press the button with 20 points (else), then with 30 or more (do). Then they change the price to 20 in ONE place and test again.</p><p>Common bugs: the condition the wrong way round, change score by cost (adds instead of takes away), and calling buy with a number instead of the price variable.</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> where in the program is the price stored? Why is that useful? Trace buy with score 20 and cost 30, then score 40 and cost 30. Next lesson: debugging a program with variables and functions.</p>' }
    ],
    support: 'Give the pseudocode on a card and the function shell already made; pupils build the if … else inside.',
    stretch: 'Add a second item: a button of another colour (with a gate of the same colour) that sells a big score bonus. Call buy with a different price.',
    assess: ['Stores the price in a variable and uses it', 'Writes a function with an input', 'Uses if … else with ≥ inside the function', 'Tests both paths'],
    steps: [
      { t: 'Visit the shop', d: 'Press Code, then Test it. Collect 2 gems and stand on the red button. Does it sell you anything?' },
      { t: 'The price', d: 'Press Build, then Code. Create a variable called price. Under “play music”, put “set price to” 30.' },
      { t: 'The buy function', d: 'From Functions, make “to buy”. Click its blue cog and add an input called cost. Inside, add if … else (blue cog on the if).' },
      { t: 'Can I afford it?', d: 'Condition: score ≥ cost. In do: change score by 0 − cost (Math), change lives by 1, show Extra life! In else: show You need, cost, points.' },
      { t: 'Open the shop', d: 'Add “when a button is pressed” and call buy (Functions) with the price variable.' },
      { t: 'Test both paths', d: 'Test it with 20 points, then with 30. Does each path work? Change the price to 20 and test again.' }
    ]
  },
  {
    id: 'sky-23-debug', unit: u(4, 23), title: 'Fix the storm game', ...Y56, tool: 'Platformer Lab (Code blocks)',
    summary: 'Debugging variables and functions. Captain Wren’s storm game should make the storm grow by 1 every second, report it with the function report(level), calm it by 3 for every sun gem, and end the game when the storm reaches 10. It has three bugs: the storm is set instead of changed, the report function ignores its input, and the game-over check uses the score instead of the storm. Pupils trace the variables in a table, find and fix each bug, and test.',
    objective: 'We are learning to find and fix bugs in programs that use variables and functions.',
    success: ['I can trace a variable’s value in a table.', 'I can explain the difference between “set” and “change”.', 'I can check that a function uses its input.', 'I can fix bugs and test again.'],
    curriculum: ['reason', 'ssr', 'data'],
    words: [['trace', 'follow a variable’s value step by step, often in a table'], ['set', 'give a variable a new value, forgetting the old one'], ['change', 'add to (or take from) a variable’s value'], ['input', 'the value a function is called with']],
    need: [DEVICE, 'A tracing table: seconds, what storm should be, what storm is'],
    plan: [
      { min: 7, title: 'Warm up: set or change?', html: '<p>A pupil holds a card: <b>storm = 0</b>. Read instructions: “Change storm by 1. Change storm by 1. Set storm to 0. Change storm by 1.” The class traces the value after each one. <b>Ask:</b> what is the difference between set and change?</p>' },
      { min: 8, title: 'Test the storm game', html: '<p>Open the starter, read the sign, press <b>Code</b> and then <b>Test it</b>. Watch the messages for a few seconds, then collect a sun gem. Pupils list what goes wrong: it always says “Storm: 1”, and one gem ends the game.</p>' },
      { min: 10, title: 'Trace it', html: '<p>Pupils fill in the tracing table for the first 4 seconds: what storm should be (1, 2, 3, 4) and what it is. Then read the code together: <b>every 1 seconds</b> sets storm to 0 every time (bug 1); <b>report</b> shows the number 1, not its input <b>level</b> (bug 2); the game-over check uses <b>score</b>, so one gem (10 points) ends the game (bug 3).</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card and fix one bug at a time, testing after each. After bug 1 the storm grows, but the message still says “Storm: 1”, which helps them find bug 2. After the fixes: the storm counts up, a gem takes 3 off it, and the game ends when it reaches 10.</p><p>Early finishers add a feature without adding a bug: report plays a warning sound when the level is 7 or more (it already does: can they find it?), then make gems calm the storm by 4.</p>' },
      { min: 10, title: 'Plenary', html: '<p><b>Ask:</b> which bug did tracing help with? How can you tell if a function really uses its input? What is your best tip for debugging? Next lesson is the final project of Sky Isles Explorers.</p>' }
    ],
    support: 'Fill in the first two rows of the tracing table together, and point to the script for each bug.',
    stretch: 'Turn the calming into a function calm with an input amount that shows a message, and call it from “when I collect a gem” with 3. (Keep the change to storm in the event.)',
    assess: ['Traces a variable in a table', 'Explains set versus change', 'Checks a function uses its input', 'Fixes and retests all three bugs'],
    steps: [
      { t: 'Test it', d: 'Press Code, then Test it. Watch the storm messages, then collect a sun gem. What goes wrong?' },
      { t: 'Trace it', d: 'On paper, make a table: seconds, what storm should be, what it is. Fill in 4 rows.' },
      { t: 'Bug 1: set or change?', d: 'Press Build, then Code. In “every 1 seconds”, swap “set storm to 0” for “change storm by 1”.' },
      { t: 'Bug 2: the input', d: 'In the report function, the message shows the number 1. Put the input level (Variables) there instead.' },
      { t: 'Bug 3: the wrong value', d: 'The game-over check uses score. Swap it for the storm variable.' },
      { t: 'Test again', d: 'Does the storm grow, does a gem calm it by 3, and does the storm win at 10?' }
    ]
  },
  {
    id: 'sky-24-tour', unit: u(4, 24), title: 'The grand tour', ...Y56, tool: 'Platformer Lab (Build, Play and Code)',
    summary: 'The final project of Sky Isles Explorers. Pupils design and build a three-island grand tour that brings together everything from the unit: a decomposed plan, a level tested page by page, and code that uses variables, a function with an input, selection, a loop and events. They test and debug, then present their game to the class.',
    objective: 'We are learning to plan, build, test and present a complete game that combines everything we have learned.',
    success: ['I can plan a game in parts.', 'I can use variables and a function with an input.', 'I can use selection and a loop.', 'I can test and debug my game.', 'I can explain how my code works.'],
    curriculum: ['design', 'ssr', 'reason', 'data'],
    words: [['decompose', 'break a big job into parts'], ['variable', 'a named value that changes'], ['function', 'a named set of blocks with inputs'], ['selection', 'choosing with if … else'], ['evaluate', 'judge how well something works and how to improve it']],
    need: [DEVICE, 'A planning sheet for the three islands', 'Optional: the board for presentations'],
    plan: [
      { min: 5, title: 'The grand tour', html: '<p>Captain Wren’s lighthouse is lit, and the Sky Isles are open to visitors. Pupils design the grand tour game. Open the starter: three islands joined by doors, a blue button and gate, a Gloomer and the lighthouse Finish. Share the success criteria.</p>' },
      { min: 10, title: 'Plan it', html: '<p>Pupils plan on the sheet: the job on each island (decomposition), their variables and what changes them, their function and its input, and their rules (if … else, a loop).</p>' },
      { min: 30, title: 'Build, code, test', html: '<p>Pupils follow the Lesson card, testing each island with <b>This Page</b> and the whole tour with <b>Play</b>. Remind them to press <b>Build</b>, then <b>Code</b> after a test that reached another page. Circulate and ask pupils to explain one script: what happens, when, and why.</p>' },
      { min: 12, title: 'Present', html: '<p>Volunteers present on the board: play one island, show one script and explain it with the unit’s words (event, loop, condition, variable, function, input).</p>' },
      { min: 3, title: 'Celebrate', html: '<p>Celebrate the whole unit: algorithms and patterns, sequences and loops, decisions, variables and functions. <b>Ask:</b> what would you add next?</p>' }
    ],
    support: 'Start from the code of earlier lessons (the reward function, the storm warning) and adapt it.',
    stretch: 'Add a fourth island, a function with two inputs, or a fair test that uses your variables to compare two versions of an island.',
    assess: ['Plans the game in parts', 'Uses variables and a function with an input correctly', 'Uses selection and a loop', 'Tests and debugs the game', 'Explains their code using the right words'],
    steps: [
      { t: 'Plan the tour', d: 'On paper, plan your 3 islands: the job on each page, your variables, your function and your rules.' },
      { t: 'Build the islands', d: 'Press Build. Change the three pages and test each one with This Page.' },
      { t: 'Variables', d: 'Press Code. Make at least one variable (like coins) and change it when something happens.' },
      { t: 'A function', d: 'Make a function with an input and call it with different values.' },
      { t: 'Decisions and loops', d: 'Use if … else, and a loop (repeat or repeat until with a wait inside).' },
      { t: 'Test and present', d: 'Test the whole tour, fix the bugs, then show your game and explain one script.' }
    ]
  }

];

export const SLIDES = {
  'sky-1-map': [
    { t: 'Build my tower', q: 'Which instruction was easier to follow? Why?', b: ['“Put some blocks on top of each other.”', '“Put 3 red blocks in a line. Put 1 blue block on the middle one.”'], notes: 'Do the warm-up with real cubes. Everyone builds a different tower from the vague instruction and the same tower from the exact one.' },
    { t: 'Welcome to the Sky Isles!', pic: true, lead: 'Pip the explorer has landed on the Sky Isles. Captain Wren the lighthouse keeper has sent a map.', notes: 'Introduce the story of the unit. Open the starter and press Play: “Add a Finish to end your game!”' },
    { t: 'Captain Wren’s map', table: [['Step', 'Instruction'], ['1', 'Put the Start on top of the grass, 2nd square from the left.'], ['2', 'Put the Finish on top of the grass, 2nd square from the right.'], ['3', 'Cover all 4 spiky rocks with Platform blocks.'], ['4', 'Press Play and walk Pip to the Finish.']], notes: 'This is an algorithm: exact steps in order. Count squares together on the board before pupils start.' },
    { use: 'steps' },
    { t: 'Make it exact', q: 'How could we make “Put a bridge somewhere” an exact instruction?', notes: 'Rewrite vague instructions together. Next lesson: the order of the steps matters too.' }
  ],
  'sky-2-steps': [
    { t: 'Getting dressed', q: 'What happens if you put your shoes on before your socks?', notes: 'Use picture cards in a muddle and put them in order. Introduce sequence.' },
    { t: 'Pip’s route', pic: true, b: ['1. Hop over the log', '2. Climb the steps', '3. Walk along the cliff', '4. Reach the Finish'], notes: 'Open the starter and play it. Pip gets stuck: the cliff is 4 blocks high and the steps are missing.' },
    { t: 'Which order?', table: [['Steps', 'Will Pip get up?'], ['1 block, 2 blocks, 3 blocks', 'Yes, one step at a time'], ['3 blocks, 2 blocks, 1 block', 'No, the first step is too high']], notes: 'Predict first, then test both orders. The same blocks in a different order give a different result.' },
    { use: 'steps' },
    { t: 'Write the moves', lead: '→ → ↑ → → ↑ ↑ ↑ → → →', q: 'Can a partner play your arrows exactly?', notes: 'Pupils read their sequence aloud while a partner plays it. Does it reach the Finish?' }
  ],
  'sky-3-bounce': [
    { t: 'Predict', q: 'What will happen if I drop this ball? Will a paper plane fly further than a paper ball?', notes: 'Predict, then test. Introduce the word predict.' },
    { t: 'The helper’s level', pic: true, lead: 'Where will Pip land when he walks onto the red mushroom?', notes: 'Pupils predict before you press Play. Then test: Pip lands short. That is a bug.' },
    { t: 'How to debug', b: ['Predict what will happen', 'Test it', 'Find where it goes wrong', 'Fix ONE thing', 'Test again'], notes: 'Model fixing bug 1 by moving the mushroom next to the island. Leave bug 2 for pupils to find.' },
    { use: 'steps' },
    { t: 'Bug hunters', q: 'What is the best way to find a bug?', notes: 'Pupils add one bug to their level and swap with a partner to find and fix it.' }
  ],
  'sky-4-stones': [
    { t: 'Clap the pattern', lead: 'Clap, clap, stamp. Clap, clap, stamp. Clap, clap, stamp.', q: 'Which part repeats? How many times?', notes: 'Say it as “repeat 3 times: clap, clap, stamp”. A computer repeating instructions is a loop.' },
    { t: 'The spiky lake', pic: true, b: ['2 spiky rocks', '2 stones', '1 gem on the second stone'], notes: 'Captain Wren has done the pattern once. It needs 3 times in all to cross the lake.' },
    { t: 'Say it as a loop', lead: 'Repeat 3 times: 2 spiky rocks, 2 stones, 1 gem.', notes: 'Make the pattern with cubes first. Count the stones (6) and the gems (3).' },
    { use: 'steps' },
    { t: 'Why repeat?', q: 'Why is “repeat 3 times” better than saying every block?', notes: 'It is shorter and easier to change. Next lesson: we look inside the code.' }
  ],
  'sky-5-keys': [
    { t: 'When I…', b: ['When I clap, jump.', 'When I wave, sit down.', 'When I say go, march.'], q: 'What makes each action happen?', notes: 'An event is something that happens and starts an action.' },
    { t: 'Inside the code', pic: true, lead: 'when A key is pressed → move left', notes: 'Press Code for the first time. The event is pressing A; the action is move left. D and W do nothing yet.' },
    { t: 'Event and action', table: [['Event (when…)', 'Action'], ['A key is pressed', 'move left'], ['D key is pressed', 'move right'], ['W key is pressed', 'jump'], ['game starts', 'play music, win screen says']], notes: 'Pupils add the D and W rows. When D moves right, the Right Arrow stops working: the action now waits for D.' },
    { use: 'steps' },
    { t: 'What happened?', q: 'Why did the Right Arrow stop working when you added the D event?', notes: 'The move right action now listens for the D event instead. Next lesson: a project using everything from this block.' }
  ],
  'sky-7-islands': [
    { t: 'A big job', q: 'How would you plan a class party?', notes: 'Break it into parts: food, music, games. That is decomposition.' },
    { t: 'Three islands', pic: true, b: ['Page 1: a bridge and a door', 'Page 2: climb the cliff', 'Page 3: reach the lighthouse'], notes: 'Tap each page and its sign. Show This Page: it tests one page on its own.' },
    { t: 'Plan each part', table: [['Part', 'My algorithm'], ['1', 'Cover the 4 spiky rocks. Put a Door at the far right.'], ['2', 'Ladder next to the cliff, one block taller. Door on top.'], ['3', 'Bounce! mushroom in the grass before the tower.']], notes: 'Pupils write their own plan for each part before building.' },
    { use: 'steps' },
    { t: 'Why parts?', q: 'How did testing one page on its own help you?', notes: 'You find bugs faster and know which part they are in.' }
  ],
  'sky-9-welcome': [
    { t: 'Countdown', q: 'What went wrong when I said “Go! 3, 2, 1”? And when I said it all at once?', notes: 'A good sequence needs the right order and the right timing.' },
    { t: 'Captain Wren’s welcome', pic: true, code: 'when game starts\n  … the rules …\n  show message: Welcome to the Sky Isles!', notes: 'Blocks under an event run from top to bottom when the event happens.' },
    { t: 'Plan the sequence', table: [['Block', 'Then'], ['show message: Welcome…', 'wait 2 seconds'], ['show message: Collect the sun gems.', 'wait 2 seconds'], ['show message: Watch out for the spiky rocks!', 'wait 2 seconds'], ['3, 2, 1', 'wait 1 second after each'], ['Go!', 'play sound: power']], notes: 'Show what happens with no wait: each message is replaced straight away.' },
    { use: 'steps' },
    { t: 'Think', q: 'What would happen if we moved “Go!” to the top?', notes: 'Order matters. Next lesson: a quicker way to write blocks that repeat.' }
  ],
  'sky-10-repeat': [
    { t: 'The long way', lead: 'Clap. Clap. Clap. Clap. Clap. Clap. Clap. Clap. Clap. Clap.', q: 'Is there a shorter way to say this?', notes: '“Clap 10 times” is a count-controlled loop.' },
    { t: 'Spot the copies', pic: true, code: 'play sound: jump\nwait 0.5 seconds\nplay sound: jump\nwait 0.5 seconds\n… 4 times', notes: 'Listen to the fanfare, then find the 8 copied blocks.' },
    { t: 'Use a loop', code: 'repeat 4 times\n  play sound: jump\n  wait 0.5 seconds\nshow message: Go!', notes: 'The same 4 notes from 3 blocks. To play 10 notes, change one number.' },
    { use: 'steps' },
    { t: 'How many points?', q: 'How much is one sun gem worth now?', notes: '10 for the gem rule + 5 × 10 from the loop = 60. Next lesson: debugging sequences and loops.' }
  ],
  'sky-11-debug': [
    { t: 'Recipe bugs', b: ['Repeat 3 times: crack an egg. Put the cake in the oven. Mix the eggs.', 'Repeat 30 times: crack an egg.'], q: 'What is wrong with each recipe?', notes: 'Bugs in loops and sequences are often in the order, the number, or what is inside.' },
    { t: 'The lighthouse show', pic: true, b: ['A countdown', 'A sun gem bonus'], q: 'Predict: what will the countdown say? How much is a gem worth?', notes: 'Read the code before running it, then test and compare.' },
    { t: 'Bug report', table: [['Should happen', 'Happens', 'Which block?'], ['3, 2, 1, Go!', '1, 2, 3, Go!', 'the messages'], ['+50 bonus', '+500', 'repeat 50'], ['coins one by one', 'all at once', 'wait after the loop']], notes: 'Fix one bug at a time and test after each.' },
    { use: 'steps' },
    { t: 'Inside or after?', q: 'Why did moving the wait inside the loop fix the coins?', notes: 'Blocks inside run every time round; blocks after run once. Next lesson: the Block 2 project.' }
  ],
  'sky-12-island': [
    { t: 'Island challenge', pic: true, lead: 'Make this island your own game!', notes: 'The Block 2 project. Read Captain Wren’s sign together.' },
    { t: 'Success criteria', b: ['A welcome sequence with waits', 'A repeat loop', 'Two different events', 'A game that can be won', 'Tested and debugged'], notes: 'Pupils plan each part on the planning sheet before building.' },
    { use: 'steps' },
    { t: 'Star and wish', lead: '“I liked … I wish …”', notes: 'Partners swap, find the welcome, the loop and the two events, and give a star and a wish.' }
  ],
  'sky-13-enough': [
    { t: 'Stand up if…', q: 'Why did some people stand up and others stay sitting?', b: ['Stand up if you have a pet.', 'Stand up if your birthday is in winter.'], notes: 'Everyone hears the same instruction; only those for whom it is true stand. That is selection.' },
    { t: 'Stuck on Sun Gem Island', pic: true, lead: 'The sky bridge opens when you have all 5 sun gems.', notes: 'Collect all five in the starter: nothing happens. Show Mist Island on page 2.' },
    { t: 'Trace the condition', table: [['Gems', 'Score', 'score = 50?'], ['1', '10', 'false'], ['4', '40', 'false'], ['5', '50', 'true: open the bridge!']], notes: 'The if runs its blocks only when the condition is true.' },
    { use: 'steps' },
    { t: 'Think', q: 'What does the if do when its condition is false?', notes: 'It skips the blocks inside. Next lesson: if … else, which does something else instead.' }
  ],
  'sky-14-ouch': [
    { t: 'Umbrella or sun hat?', lead: 'If it is raining, take an umbrella, else take a sun hat.', q: 'Can you ever take both? Or neither?', notes: 'If … else always runs exactly one of its two paths.' },
    { t: 'Always Ouch!', pic: true, code: 'when I get hurt\n  show message: Ouch!', notes: 'Get hurt twice in the starter: the same message, even on the last life.' },
    { t: 'Two paths', code: 'when I get hurt\n  if lives > 1\n    show: Ouch! Lives left: (lives)\n  else\n    show: Last life! Be careful!\n    play sound: zap', notes: '“when I get hurt” runs after the life is taken: the first time, lives is already 2.' },
    { use: 'steps' },
    { t: 'Test both paths', q: 'Why do we need to test BOTH paths of an if … else?', notes: 'A bug can hide in the path you did not test. Next lesson: more than two choices.' }
  ],
  'sky-15-medals': [
    { t: 'True or false?', b: ['45 > 40', '40 > 40', '12 < 20', '3 = 3 and 50 > 40', '3 = 2 and 50 > 40'], notes: 'Pupils hold up true or false. “and” needs both sides to be true.' },
    { t: 'The medal podium', pic: true, table: [['Seconds left', 'Medal', 'Bonus'], ['more than 40', 'Gold', '300'], ['more than 20', 'Silver', '200'], ['otherwise', 'Bronze', '100']], notes: 'Race to the door in the starter: the podium only says welcome.' },
    { t: 'else if', code: 'if seconds left > 40\n  Gold medal!\nelse if seconds left > 20\n  Silver medal!\nelse\n  Bronze medal!', notes: 'Conditions are checked from the top; the first true one wins. The order matters.' },
    { use: 'steps' },
    { t: 'Think', q: 'Why does the else if not need “and seconds left < 40”?', notes: 'It is only checked when the first condition was false. Next lesson: a loop that keeps checking.' }
  ],
  'sky-16-storm': [
    { t: 'Are we there yet?', q: 'How many times did they ask? Did we know before we started?', notes: 'A repeat until loop keeps checking a condition until it becomes true.' },
    { t: 'A storm is coming', pic: true, lead: 'Reach the lighthouse within 60 seconds, but nothing warns you when time is running out.', notes: 'Stand still in the starter and watch the seconds left at the top.' },
    { t: 'Repeat until', code: 'repeat until seconds left < 20\n  wait 1 seconds\nshow message: The storm is coming! Hurry!\nplay sound: zap', notes: 'The wait goes inside: the loop checks once a second. The warning goes after: it runs once, when the loop ends.' },
    { use: 'steps' },
    { t: 'Two kinds of loop', table: [['Loop', 'Stops when…'], ['repeat 10 times', 'it has counted to 10'], ['repeat until …', 'its condition is true']], notes: 'Count-controlled and condition-controlled. Next lesson: debugging loops and conditions.' }
  ],
  'sky-17-debug': [
    { t: 'Trace it', table: [['score', 'score > 50', 'score ≥ 50'], ['40', 'false', 'false'], ['50', 'false', 'true'], ['60', 'true', 'true']], notes: 'Tracing: work through a condition with real values.' },
    { t: 'The weather station', pic: true, b: ['A storm warning', 'A sky bridge after 5 gems', 'Messages when you get hurt'], notes: 'Test the starter: the loop runs too long, the bridge never opens, the first hurt says “Last life!”.' },
    { t: 'Three bugs', table: [['Bug', 'Fix'], ['repeat until with nothing inside', 'put wait 1 seconds inside'], ['score > 50', 'score ≥ 50'], ['do and else swapped', 'swap the messages']], notes: 'Fix one at a time and test after each.' },
    { use: 'steps' },
    { t: 'Think', q: 'Which bug did tracing help you find?', notes: 'Next lesson: the Block 3 project.' }
  ],
  'sky-18-arcade': [
    { t: 'Sky arcade', pic: true, lead: 'Make a game that makes its own decisions.', notes: 'The Block 3 project. Recap: if, if … else, operators, repeat until, tracing.' },
    { t: 'Rules as sentences', b: ['If score ≥ 40, then a bonus, else keep collecting.', 'Repeat until seconds left < 30, then warn the player.', 'If lives > 1, then Ouch!, else Last life!'], notes: 'Pupils plan three rules and mark the condition in each.' },
    { use: 'steps' },
    { t: 'Guess the rules', q: 'Can your partner work out your rules just by playing?', notes: 'Swap, play, then show the code. One star and one wish.' }
  ],
  'sky-20-pilots': [
    { t: 'Which is best?', q: 'How could we find out which paper aeroplane flies furthest, fairly?', notes: 'A fair test: change one thing, keep everything else the same, and measure.' },
    { t: 'The test course', pic: true, b: ['jump height is normal', 'gravity is normal'], q: 'What data should a test pilot collect?', notes: 'Time, hurts and gems: three variables.' },
    { t: 'Collect the data', code: 'every 1 seconds → change seconds by 1\nwhen I get hurt → change hurts by 1\nwhen I collect a gem → change gems by 1\non page 2 → show Time, Hurts, Gems', notes: 'Every variable needs a starting value under “when game starts”.' },
    { use: 'steps' },
    { t: 'Results', table: [['Jump height', 'Seconds', 'Hurts', 'Gems'], ['low', '', '', ''], ['normal', '', '', ''], ['high', '', '', '']], notes: 'Pupils fill in their own table. Which setting was best? Was it a fair test?' }
  ],
  'sky-21-reward': [
    { t: 'Recipe cards', b: ['Mix 2 eggs, stir, bake.', 'Mix 6 eggs, stir, bake.'], q: 'How could we write this once?', notes: '“Mix EGGS eggs, stir, bake”: a function with an input.' },
    { t: 'Spot the copies', pic: true, table: [['Event', 'Blocks'], ['when I collect a gem', 'score +5, coin, show +5'], ['when a button is pressed', 'score +50, coin, show +50']], notes: 'The same three blocks with different numbers.' },
    { t: 'One function', code: 'to reward with: points\n  change score by points\n  play sound: coin\n  show message: + points\n\nwhen I collect a gem → reward 5\nwhen a button is pressed → reward 50\non page 2 → reward 100', notes: 'Make the input with the blue cog. Calls appear in Functions once the function exists.' },
    { use: 'steps' },
    { t: 'Change it once', q: 'Captain Wren wants every reward to play the power sound. How many blocks do you change?', notes: 'One, inside the function. Next lesson: a shop with a variable, a function and if … else.' }
  ],
  'sky-22-shop': [
    { t: 'The tuck shop', q: 'What happens if you have 20p? 30p? 50p?', notes: 'If you have at least the price, pay it and get the item; else, say how much you need.' },
    { t: 'The sky shop', pic: true, lead: 'An extra life costs 30 points.', notes: 'Stand on the red button in the starter: the gate opens but nothing is sold.' },
    { t: 'The plan', code: 'when game starts → set price to 30\n\nto buy with: cost\n  if score ≥ cost\n    change score by 0 − cost\n    change lives by 1\n    show: Extra life! Points left: score\n  else\n    show: You need cost points\n\nwhen a button is pressed → buy with price', notes: 'Pseudocode first, then build it.' },
    { use: 'steps' },
    { t: 'Trace it', table: [['score', 'cost', 'score ≥ cost?', 'What happens'], ['20', '30', 'false', 'You need 30 points'], ['40', '30', 'true', 'extra life, 10 points left']], notes: 'Next lesson: debugging variables and functions.' }
  ],
  'sky-23-debug': [
    { t: 'Set or change?', lead: 'storm = 0. Change by 1. Change by 1. Set to 0. Change by 1.', q: 'What is storm now?', notes: 'Trace it together: 1, 2, 0, 1.' },
    { t: 'The storm game', pic: true, b: ['Storm grows by 1 every second', 'Each sun gem calms it by 3', 'At 10, the storm wins'], notes: 'Test the starter: it always says “Storm: 1”, and one gem ends the game.' },
    { t: 'Trace the storm', table: [['Seconds', 'Should be', 'Is'], ['1', '1', '0'], ['2', '2', '0'], ['3', '3', '0']], notes: 'Tracing points to bug 1: set instead of change.' },
    { use: 'steps' },
    { t: 'Debugging tips', b: ['Test and describe the bug', 'Trace the variables', 'Check each function uses its inputs', 'Fix one thing, test again'], notes: 'Next lesson: the final project.' }
  ],
  'sky-24-tour': [
    { t: 'The grand tour', pic: true, lead: 'Three islands. One game. Everything you have learned.', notes: 'The final project of Sky Isles Explorers.' },
    { t: 'Success criteria', b: ['A plan in parts', 'Variables', 'A function with an input', 'If … else and a loop', 'Tested and debugged', 'Explained to the class'], notes: 'Pupils plan on the sheet before building.' },
    { use: 'steps' },
    { t: 'Present', q: 'Which script are you proudest of? Explain it with our words: event, loop, condition, variable, function, input.', notes: 'Volunteers present on the board. Celebrate the unit.' }
  ],
};
