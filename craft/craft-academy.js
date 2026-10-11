/* CodeJump · Build Lab — Robot Helper Academy: a unit of lessons where pupils code the robot helper round Pebble Island,
 * one district (one World Maker world) per lesson, one new coding skill each time. No DOM, so Node tests build and solve them.
 *
 *   ACADEMY → [{id, n, block, title, skill, text}]   (the lessons in order; lessons/lessons.js has the teacher plans)
 *   academyProject(id) → a Build Lab project (with `maker`: characters, tasks, rules) as the lesson starts
 *   ACADEMY_ANSWERS[id] → a Python program that completes every task (the tests prove it; the teacher notes use it)
 *
 * Block 1 "Getting going" (Years 3–4): algorithms → sequence → sequence with actions → loops → loops + efficiency → project.
 * Block 2 "Fix it and decide" (Years 4–5): debugging ×2 → if → if/else + sensing → and/or/not → repeat until.
 * Block 3 "Smart helpers" (Years 5–6): variables → variables + maths → events (chat) → functions → functions with inputs → project.
 * Our own story, places and characters. Every world: an island in the sea, the player standing south looking north at the job.
 */
import { createWorld, W, D, GROUND, BY_NAME, FACE } from './craft-world.js';
import { project } from './craft-maker.js';

const g = GROUND, B = BY_NAME, Y = g + 1;
export const ACADEMY = [
  { id: 'academy-1-crate', n: 1, block: 1, title: 'The lost crate', skill: 'Algorithms', text: 'Plan the helper’s route on paper, then turn the plan into code.' },
  { id: 'academy-2-post', n: 2, block: 1, title: 'The post round', skill: 'Sequencing', text: 'A longer sequence: deliver letters to three houses in the right order.' },
  { id: 'academy-3-flowers', n: 3, block: 1, title: 'The flower bed', skill: 'Sequencing actions', text: 'Mix moves and actions: the helper plants a row of flowers.' },
  { id: 'academy-4-fence', n: 4, block: 1, title: 'Mend the fence', skill: 'Loops', text: 'Ten fence posts — use repeat instead of writing the same blocks again and again.' },
  { id: 'academy-5-pen', n: 5, block: 1, title: 'The sheep pen', skill: 'Loops and efficiency', text: 'A challenge: build a square pen in as few blocks as you can for three stars.' },
  { id: 'academy-6-market', n: 6, block: 1, title: 'Market day', skill: 'Project', text: 'Use everything so far to build market stalls with loops.' },
  { id: 'academy-7-bridge', n: 7, block: 2, title: 'The broken bridge', skill: 'Debugging', text: 'A program with two bugs: watch it run, find the bugs and fix them.' },
  { id: 'academy-8-lighthouse', n: 8, block: 2, title: 'The lighthouse', skill: 'Debugging loops', text: 'Predict, then fix three bugs in a loop that builds a lighthouse.' },
  { id: 'academy-9-beach', n: 9, block: 2, title: 'The rocky beach', skill: 'If', text: 'The helper decides at every step: if there is a rock below, dig it up.' },
  { id: 'academy-10-maze', n: 10, block: 2, title: 'The hedge maze', skill: 'If … else and sensing', text: 'One set of rules that gets the helper through a maze by itself.' },
  { id: 'academy-11-orchard', n: 11, block: 2, title: 'The orchard', skill: 'And, or, not', text: 'Pick the pumpkins OR the melons, but never the bushes.' },
  { id: 'academy-12-mine', n: 12, block: 2, title: 'The gold mine', skill: 'Repeat until', text: 'Dig down until the helper finds gold — however deep it is.' },
  { id: 'academy-13-crops', n: 13, block: 3, title: 'Count the crops', skill: 'Variables', text: 'Count the pumpkins in a variable and say the answer.' },
  { id: 'academy-14-stairs', n: 14, block: 3, title: 'The staircase', skill: 'Variables and maths', text: 'Each step one taller than the last: a variable that changes.' },
  { id: 'academy-15-chat', n: 15, block: 3, title: 'Chat commands', skill: 'Events', text: 'Make your own command: type “lamps 4” and the helper lights the promenade.' },
  { id: 'academy-16-huts', n: 16, block: 3, title: 'My own block', skill: 'Functions', text: 'Make a block called hut, then build a row of beach huts with it.' },
  { id: 'academy-17-towers', n: 17, block: 3, title: 'Towers of any height', skill: 'Functions with inputs', text: 'One block, tower(height), builds towers 3, 5 and 7 tall.' },
  { id: 'academy-18-district', n: 18, block: 3, title: 'Design your district', skill: 'Project', text: 'Plan and code your own part of the island with functions, variables and if.' }
];
export const ACADEMY_BLOCKS = [[1, 'Getting going', 'Years 3–4'], [2, 'Fix it and decide', 'Years 4–5'], [3, 'Smart helpers', 'Years 5–6']];

// The island: grass in the middle, a sandy beach, then the sea. Trees in the corners, away from the jobs.
function island(w) {
  w.reset('flat');
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
    const d = Math.max(Math.abs(x - 31.5), Math.abs(z - 31.5));
    if (d > 27) { w.set(x, g, z, B.WATER); w.set(x, g - 1, z, B.WATER); } else if (d > 25.5) w.set(x, g, z, B.SAND);
  }
  for (const [x, z] of [[9, 9], [54, 10], [10, 53], [53, 54], [14, 30], [50, 24]]) tree(w, x, z);
}
function tree(w, x, z, h = 4) { for (let y = 1; y <= h; y++) w.set(x, g + y, z, B.LOG); w.ball(B.LEAVES, 2, [x, g + h + 1, z], 'SOLID'); }
function house(w, x0, z0, x1, z1, wall, roof, door) { // a little house: walls 3 high, a flat roof, a door gap
  w.fill(wall, [x0, Y, z0], [x1, Y + 2, z1], 'HOLLOW'); w.fill(roof, [x0 - 1, Y + 3, z0 - 1], [x1 + 1, Y + 3, z1 + 1], 'SOLID');
  if (door) { w.set(door[0], Y, door[1], 0); w.set(door[0], Y + 1, door[1], 0); }
  w.fill(B.GLASS, [x0, Y + 1, z0], [x0, Y + 1, z0], 'SOLID');
}
// follow a route from a start → the cells the helper stands in (to lay the path and find where things go)
function route(start, cmds) {
  let x = start.x, z = start.z, f = start.f; const cells = [[x, z]];
  for (const c of cmds) {
    if (c === 'R') f = (f + 1) % 4; else if (c === 'L') f = (f + 3) % 4;
    else for (let i = 0; i < c; i++) { x += FACE[f][0]; z += FACE[f][1]; cells.push([x, z]); }
  }
  return { cells, end: { x, z, f } };
}
const pyRoute = cmds => cmds.map(c => c === 'R' ? 'helper.turn(RIGHT)' : c === 'L' ? 'helper.turn(LEFT)' : 'helper.move(FORWARD, ' + c + ')').join('\n') + '\n';
const cellZone = (id, name, x, z, extra = {}) => ({ id, name, a: [x, Y, z], b: [x, Y, z], msg: '', show: true, colour: '#ffd166', ...extra });
const START = { x: 31.5, y: Y, z: 52.5, yaw: 0 };
const CODE_ONLY = { build: false, break: false, fly: true, python: true, code: 'helper', reset: true };

// ── 1 · Algorithms: the lost crate (the harbour) ──
const R1 = { start: { x: 24, z: 46, f: 0 }, cmds: [4, 'R', 5, 'L', 5] };
function crate() {
  const w = createWorld(); island(w);
  w.fill(B.WATER, [16, g - 1, 27], [44, g, 34], 'SOLID'); // the harbour
  w.fill(B.PLANKS, [16, g, 35], [44, g, 36], 'SOLID'); // the quay
  w.fill(B.DARK_PLANKS, [33, g, 29], [38, g, 31], 'SOLID'); w.fill(B.WHITE, [35, Y, 30], [35, Y + 3, 30], 'SOLID'); w.fill(B.RED, [36, Y + 2, 30], [37, Y + 3, 30], 'SOLID'); // a boat
  const { cells, end } = route(R1.start, R1.cmds);
  for (const [x, z] of cells) w.set(x, g, z, B.GRAVEL);
  w.set(end.x, Y, end.z - 1, B.CRATE); // the crate, just past the end of the path
  for (const [x, z, h] of [[26, 44, 2], [27, 44, 1], [22, 40, 2], [26, 39, 1], [31, 42, 2], [32, 42, 1], [27, 38, 1]]) w.fill(B.CRATE, [x, Y, z], [x, Y + h - 1, z], 'SOLID'); // stacks of crates to steer round
  return project(w, {
    title: 'Lesson 1: The lost crate', intro: 'Captain Marlo has lost a crate on the quay. Talk to the captain, then plan the helper’s route on paper before you code it.\n\nRobots need EXACT steps: how far forward, which way to turn.',
    start: START, helper: { x: R1.start.x, y: Y, z: R1.start.z, f: R1.start.f },
    npcs: [{ id: 'npcMarlo', name: 'Captain Marlo', x: 21, y: Y, z: 47, f: 1, colour: '#3b8eea', task: 'tCrate',
      lines: ['Ahoy! I’m Captain Marlo. A crate of apples fell off my boat.', 'It’s at the end of the grey gravel path. Your robot helper can fetch it!', 'But robots need exact steps. Count the squares and write your plan with arrows first.', 'Then build it with Helper blocks and press Run. Every Run starts the helper back here.'],
      done: ['My apples! That was a perfect algorithm. Can you write it out for a friend to check?'] }],
    zones: [cellZone('zCrate', 'the crate', end.x, end.z)],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcMarlo' }, { id: 'tCrate', type: 'helper', zone: 'zCrate', text: 'Get the helper to the crate' }],
    rules: CODE_ONLY
  }, '# Plan your route on paper first, then build it here\nhelper.move(FORWARD, 1)\n');
}

// ── 2 · Sequencing: the post round (the village) ──
const R2 = { start: { x: 20, z: 47, f: 0 }, cmds: [3, 'R', 5, 'L', 4, 'R', 6, 'L', 3, 'L', 4] };
function post() {
  const w = createWorld(); island(w);
  const { cells } = route(R2.start, R2.cmds);
  for (const [x, z] of cells) w.set(x, g, z, B.GRAVEL);
  const stops = [cells[3], cells[12], cells[cells.length - 1]]; // after 3 steps, after the 12th step, the end
  const homes = [
    { name: 'Mill Cottage', box: [16, 42, 18, 45], wall: B.LIGHT_PLANKS, roof: B.ROOF },
    { name: 'the bakery', box: [21, 35, 24, 38], wall: B.BRICKS, roof: B.SLATE },
    { name: 'the school', box: [24, 29, 31, 34], wall: B.STONE_BRICKS, roof: B.ROOF }
  ];
  const onPath = new Set(cells.map(c => c.join(',')));
  homes.forEach((h, i) => { const [x0, z0, x1, z1] = h.box; for (let z = z0 - 1; z <= z1 + 1; z++) for (let x = x0 - 1; x <= x1 + 1; x++) if (onPath.has(x + ',' + z)) throw new Error('house on the path ' + i); house(w, x0, z0, x1, z1, h.wall, h.roof); });
  const box = (s, dx, dz) => w.set(s[0] + dx, Y, s[1] + dz, B.RED); // a red letterbox beside each stop
  box(stops[0], -1, 0); box(stops[1], 0, -1); box(stops[2], 0, -1);
  return project(w, {
    title: 'Lesson 2: The post round', intro: 'Posty Fen has three letters to deliver. The helper must visit each red letterbox along the path, in order.\n\nThis is a long sequence: plan it in chunks, test it a bit at a time, and fix the first mistake first.',
    start: START, helper: { x: R2.start.x, y: Y, z: R2.start.z, f: R2.start.f },
    npcs: [{ id: 'npcFen', name: 'Posty Fen', x: 17, y: Y, z: 48, f: 1, colour: '#e8453c', task: 'tSchool',
      lines: ['Hello! I’m Fen, the island’s post carrier. My feet hurt!', 'Can your helper take the letters? First Mill Cottage, then the bakery, then the school.', 'Follow the gravel path. Each red box is a stop.', 'Tip: build the code for the first stop, press Run to test it, then add the next part.'],
      done: ['All three delivered! A long sequence, and every step in the right order.'] }],
    zones: [cellZone('zMill', homes[0].name, stops[0][0], stops[0][1]), cellZone('zBakery', homes[1].name, stops[1][0], stops[1][1]), cellZone('zSchool', homes[2].name, stops[2][0], stops[2][1])],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcFen' }, { id: 'tMill', type: 'helper', zone: 'zMill', text: 'Deliver to Mill Cottage' }, { id: 'tBakery', type: 'helper', zone: 'zBakery', text: 'Deliver to the bakery' }, { id: 'tSchool', type: 'helper', zone: 'zSchool', text: 'Deliver to the school' }],
    rules: CODE_ONLY
  }, '# First stop: Mill Cottage\nhelper.move(FORWARD, 3)\n');
}

// ── 3 · Sequencing actions: the flower bed (the park) ──
function flowers() {
  const w = createWorld(); island(w);
  w.fill(B.GRAVEL, [27, g, 37], [27, g, 43], 'SOLID'); // the helper's path
  w.fill(B.DIRT, [28, g, 38], [28, g, 42], 'SOLID'); w.fill(B.PLANKS, [29, Y, 37], [29, Y, 43], 'SOLID'); // the bed, edged with planks
  w.set(28, Y, 37, B.PLANKS); w.set(28, Y, 43, B.PLANKS);
  for (const [x, z] of [[33, 36], [34, 41], [24, 35]]) w.set(x, Y, z, B.BLOSSOM); tree(w, 35, 33, 3); w.fill(B.LIGHT_PLANKS, [22, Y, 41], [24, Y, 41], 'SOLID'); // a bench and some blossom
  return project(w, {
    title: 'Lesson 3: The flower bed', intro: 'Gardener Ada needs five flowers planted in the brown flower bed. The helper walks along the path and plants each flower on its RIGHT.\n\nNow your sequence mixes moves and actions — the order really matters!',
    start: START, helper: { x: 27, y: Y, z: 42, f: 0 },
    npcs: [{ id: 'npcAda', name: 'Gardener Ada', x: 25, y: Y, z: 44, f: 1, colour: '#2bb673', task: 'tBed',
      lines: ['Oh hello! I’m Ada. The park needs some colour.', 'The helper should plant a flower to its right, step forward, plant another… five flowers in a row.', 'Use “helper place” with RIGHT. Choose any colours you like!', 'What happens if you move BEFORE you plant? Try it and see.'],
      done: ['Beautiful! Did you notice how many blocks that took? Next time we’ll find a shortcut.'] }],
    zones: [{ id: 'zBed', name: 'the flower bed', a: [28, Y, 38], b: [28, Y, 42], msg: '', show: true, colour: '#7bd88f' }],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcAda' }, { id: 'tBed', type: 'count', zone: 'zBed', block: 'ANY', n: 5, text: 'Plant 5 flowers in the flower bed' }],
    rules: CODE_ONLY
  }, '# Plant a flower, then step forward\nhelper.place(RED, RIGHT)\nhelper.move(FORWARD, 1)\n');
}

// ── 4 · Loops: mend the fence (the farm) ──
function fence() {
  const w = createWorld(); island(w);
  for (let z = 22; z <= 50; z++) if (z < 35 || z > 44) w.set(29, Y, z, B.LOG); // the fence, with a gap of 10
  w.fill(B.LOG, [19, Y, 22], [29, Y, 22], 'SOLID'); w.fill(B.LOG, [19, Y, 50], [29, Y, 50], 'SOLID');
  w.fill(B.GRAVEL, [30, g, 34], [30, g, 45], 'SOLID'); // the helper's path beside the gap
  for (const [x, z] of [[23, 27], [22, 33], [24, 40], [21, 45]]) w.set(x, Y, z, B.HAY); w.set(25, Y, 30, B.PUMPKIN); w.set(22, Y, 38, B.PUMPKIN);
  house(w, 35, 30, 40, 35, B.RED, B.DARK_PLANKS, [37, 35]); // the barn
  return project(w, {
    title: 'Lesson 4: Mend the fence', intro: 'Farmer Kit’s fence has a gap of 10 posts and the hay could roll away! The helper puts a post (a tree trunk block) on its LEFT, then steps forward.\n\nThat is 20 blocks the long way. A repeat loop does it in far fewer.',
    start: START, helper: { x: 30, y: Y, z: 44, f: 0 },
    npcs: [{ id: 'npcKit', name: 'Farmer Kit', x: 33, y: Y, z: 46, f: 3, colour: '#f5a623', task: 'tPosts',
      lines: ['Morning! I’m Kit. Can you see the gap in my fence?', 'It needs 10 posts. Place a tree trunk on the LEFT, step forward, again and again…', 'Writing that 10 times is a lot of blocks! Find the repeat block in Loops.', 'Put the place and move blocks INSIDE the repeat, and set it to 10.'],
      done: ['Fixed! A loop saved you writing the same two blocks ten times.'] }],
    zones: [{ id: 'zGap', name: 'the gap', a: [29, Y, 35], b: [29, Y, 44], msg: '', show: true, colour: '#ffd166' }],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcKit' }, { id: 'tPosts', type: 'count', zone: 'zGap', block: 'LOG', n: 10, text: 'Put 10 fence posts in the gap' }, { id: 'tLoop', type: 'uses', feature: 'loop', text: 'Use a repeat loop' }],
    rules: CODE_ONLY
  }, '# The long way… can you use a repeat instead?\nhelper.place(LOG, LEFT)\nhelper.move(FORWARD, 1)\nhelper.place(LOG, LEFT)\nhelper.move(FORWARD, 1)\n');
}

// ── 5 · Loops and efficiency: the sheep pen (a timed challenge with stars) ──
function pen() {
  const w = createWorld(); island(w);
  w.fill(B.MOSS, [26, g, 37], [31, g, 42], 'OUTLINE'); // a mossy square marks where the pen goes
  w.fill(B.HAY, [28, Y, 39], [28, Y, 39], 'SOLID'); w.set(29, Y, 40, B.HAY);
  for (const [x, z] of [[20, 33], [36, 45], [38, 34]]) w.set(x, Y, z, B.WHITE); // sheep-ish (soon to be safe)
  return project(w, {
    title: 'Lesson 5: The sheep pen', intro: 'A challenge! Shepherd Rue needs a square pen. The helper can leave a TRAIL of tree trunks behind it as it walks: walk 5, turn right… four times.\n\nThree stars if your code uses 5 blocks or fewer (count every block, even “when Run is clicked”).',
    start: START, helper: { x: 26, y: Y, z: 42, f: 0 },
    npcs: [{ id: 'npcRue', name: 'Shepherd Rue', x: 23, y: Y, z: 45, f: 1, colour: '#9b59d0', task: 'tPen',
      lines: ['Hello! I’m Rue. My sheep keep wandering off.', 'Follow the mossy square: walk 5, turn right, and do that 4 times. Leave a trail of tree trunks.', 'You could write it all out… but how few blocks can you use?', 'Look for the pattern that repeats. That goes inside the loop.'],
      done: ['A perfect pen! Did you get three stars?'] }],
    zones: [{ id: 'zPen', name: 'the pen', a: [26, Y, 37], b: [31, Y, 42], msg: '', show: false }],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcRue' }, { id: 'tPen', type: 'count', zone: 'zPen', block: 'LOG', n: 19, text: 'Build the pen all the way round' }, { id: 'tLoop', type: 'uses', feature: 'loop', text: 'Use a loop' }],
    rules: CODE_ONLY, challenge: { on: true, time: 0, par: 5 }
  }, '# Leave a trail of tree trunks, then walk round the square\nhelper.trail(LOG)\nhelper.move(FORWARD, 5)\nhelper.turn(RIGHT)\n');
}

// ── 6 · Project: market day (the square) ──
function market() {
  const w = createWorld(); island(w);
  w.fill(B.TILES, [22, g, 30], [41, g, 44], 'SOLID'); // the market square
  // Mayor Juno's own stall, outside the square, as an example: four posts and a striped roof
  for (const [x, z] of [[14, 38], [17, 38], [14, 41], [17, 41]]) w.fill(B.LOG, [x, Y, z], [x, Y + 2, z], 'SOLID');
  for (let x = 14; x <= 17; x++) w.fill(x % 2 ? B.RED : B.WHITE, [x, Y + 3, 38], [x, Y + 3, 41], 'SOLID'); w.fill(B.CRATE, [15, Y, 39], [16, Y, 39], 'SOLID');
  return project(w, {
    title: 'Lesson 6: Market day', intro: 'It’s market day on Pebble Island! Mayor Juno wants stalls in the tiled square. Use code — with at least one loop — to build them. Look at Juno’s stall for ideas.\n\nYou can use the helper and the builder commands. Plan it, build it, test it, improve it.',
    start: START, helper: { x: 25, y: Y, z: 43, f: 0 },
    npcs: [{ id: 'npcJuno', name: 'Mayor Juno', x: 19, y: Y, z: 44, f: 1, colour: '#17b8a6', task: 'tStalls',
      lines: ['Welcome! I’m Juno, the island’s mayor. Market day is tomorrow!', 'We need stalls in the tiled square — at least 30 blocks of building.', 'Use loops: a stall has 4 posts the same, and stalls are all alike too.', 'Builder blocks place things from where YOU stand, so walk to the square first.'],
      done: ['What a market! Tell me about the loops you used.'] }],
    zones: [{ id: 'zSquare', name: 'the market square', a: [22, Y, 30], b: [41, Y + 8, 44], msg: 'This is the market square. Build your stalls here!', show: true, colour: '#ffd166' }],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcJuno' }, { id: 'tStalls', type: 'count', zone: 'zSquare', block: 'ANY', n: 30, text: 'Build 30 blocks of stalls in the square' }, { id: 'tLoop', type: 'uses', feature: 'loop', text: 'Use a loop in your code' }],
    rules: { build: true, break: true, fly: true, python: true, code: 'all', reset: false }
  }, '# Plan your stalls, then code them. Use a loop!\nhelper.move(FORWARD, 3)\n');
}

// ════════════ Block 2 "Fix it and decide" (Years 4–5): debugging → if → if/else → and/or/not → repeat until ════════════
const BUILD_CODE = { build: false, break: false, fly: true, python: true, code: 'helper', reset: true };

// ── 7 · Debugging: the broken bridge (a stream to cross; the bridgekeeper's program has two bugs) ──
function bridge() {
  const w = createWorld(); island(w);
  w.fill(B.WATER, [5, g - 1, 34], [58, g, 38], 'SOLID'); // the stream, west to east
  for (const x of [29, 31]) { w.set(x, Y, 39, B.LOG); w.set(x, Y, 33, B.LOG); } // posts at both ends of the crossing
  w.fill(B.GRAVEL, [30, g, 39], [30, g, 42], 'SOLID'); w.fill(B.GRAVEL, [30, g, 28], [30, g, 33], 'SOLID');
  house(w, 26, 24, 34, 28, B.STONE_BRICKS, B.ROOF, [30, 28]); // the mill on the far side
  return project(w, {
    title: 'Lesson 7: The broken bridge', intro: 'Odo the bridgekeeper wrote a program to build a plank bridge across the stream — but it has bugs! The helper stops short and the bridge has gaps.\n\nPress Run and watch closely. Find each bug, fix it, and test again.',
    start: START, helper: { x: 30, y: Y, z: 42, f: 0 },
    npcs: [{ id: 'npcOdo', name: 'Odo', x: 27, y: Y, z: 43, f: 1, colour: '#6d5d4b', task: 'tBridge',
      lines: ['I’m Odo, the bridgekeeper. The old bridge washed away!', 'I wrote a program for the helper to build a new one, but it goes wrong. There are TWO bugs.', 'Press Run and watch. Where does the first plank go? How many planks are there?', 'Change one thing at a time, and test after each change.'],
      done: ['A whole bridge! You found both bugs. Good debugging!'] }],
    zones: [{ id: 'zBridge', name: 'the crossing', a: [30, g, 34], b: [30, g, 38], msg: '', show: true, colour: '#ffd166' },
      { id: 'zFar', name: 'the far bank', a: [29, Y, 29], b: [31, Y + 1, 32], msg: '', show: false }],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcOdo' }, { id: 'tBridge', type: 'fill', zone: 'zBridge', block: 'PLANKS', text: 'Build the bridge all the way across' }, { id: 'tFar', type: 'helper', zone: 'zFar', text: 'Get the helper to the far bank' }],
    rules: BUILD_CODE
  }, '# Odo’s program has two bugs. Can you find them?\nhelper.move(FORWARD, 2)\nfor _ in range(4):\n    helper.move(FORWARD, 1)\n    helper.place(PLANKS, DOWN)\nhelper.move(FORWARD, 2)\n');
}

// ── 8 · Debugging loops: the lighthouse (three bugs: the count, the order inside the loop, and the lamp's direction) ──
function lighthouse() {
  const w = createWorld(); island(w);
  w.fill(B.WATER, [14, g - 1, 14], [50, g, 32], 'SOLID'); w.fill(B.COBBLE, [29, g, 33], [35, g, 37], 'SOLID'); // the bay and a rocky point
  w.fill(B.STONE, [31, g, 35], [33, g, 37], 'SOLID'); for (const [x, z] of [[29, 33], [35, 33], [28, 36]]) w.set(x, Y, z, B.COBBLE);
  return project(w, {
    title: 'Lesson 8: The lighthouse', intro: 'Keeper Iska’s lighthouse fell down in a storm. Her program should build a white tower 8 blocks tall with a lamp on top — but the loop has bugs.\n\nPredict what the code will do BEFORE you press Run. Then find and fix the bugs.',
    start: START, helper: { x: 32, y: Y, z: 37, f: 0 },
    npcs: [{ id: 'npcIska', name: 'Keeper Iska', x: 29, y: Y, z: 39, f: 1, colour: '#3b8eea', task: 'tTower',
      lines: ['Hello, I’m Iska. Ships need my light tonight!', 'The tower must be 8 blocks tall, starting on the ground, with a lamp right on top.', 'My loop has three bugs. Read it line by line and say what you think it will do.', 'Is the loop the right number of times? Are the blocks inside in the right order? Which way does the lamp go?'],
      done: ['The light is on! Ships are safe. That was careful debugging.'] }],
    zones: [{ id: 'zTower', name: 'the lighthouse', a: [32, Y, 36], b: [32, Y + 7, 36], msg: '', show: true, colour: '#ffd166' }, { id: 'zLamp', name: 'the lamp', a: [32, Y + 8, 36], b: [32, Y + 8, 36], msg: '', show: false }],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcIska' }, { id: 'tTower', type: 'tower', zone: 'zTower', n: 8, text: 'Build the tower 8 blocks tall, from the ground' }, { id: 'tLamp', type: 'count', zone: 'zLamp', block: 'LAMP', n: 1, text: 'Put the lamp on top' }],
    rules: BUILD_CODE
  }, '# Iska’s program: it should build a tower 8 tall with a lamp on top\nfor _ in range(6):\n    helper.move(UP, 1)\n    helper.place(WHITE, FORWARD)\nhelper.place(LAMP, UP)\n');
}

// ── 9 · If: the rocky beach (dig up the rocks, keep the sand) ──
const ROCKS = [0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0]; // 1 = a rock under that step of the path
function beach() {
  const w = createWorld(); island(w);
  w.fill(B.SAND, [26, g, 30], [34, g, 45], 'SOLID'); w.fill(B.WATER, [14, g - 1, 14], [50, g, 28], 'SOLID');
  ROCKS.forEach((r, i) => w.set(30, g, 43 - i, r ? B.COBBLE : B.SAND));
  w.set(30, g, 44, B.SAND); w.fill(B.LIGHT_PLANKS, [32, Y, 40], [33, Y, 40], 'SOLID'); w.set(27, Y, 35, B.CRATE); // a bench and a crate
  return project(w, {
    title: 'Lesson 9: The rocky beach', intro: 'The beach path is full of rocks. The helper walks up the path and, IF the block under it is a rock (cobblestone), digs it up. Sand stays!\n\nYou need an if block: “if the block below is cobblestone, dig down”.',
    start: START, helper: { x: 30, y: Y, z: 44, f: 0 },
    npcs: [{ id: 'npcPip', name: 'Lifeguard Pip', x: 33, y: Y, z: 45, f: 3, colour: '#ec6fa8', task: 'tRocks',
      lines: ['Hi! I’m Pip, the lifeguard. People keep tripping on rocks on the path.', 'The helper should walk up the path 12 steps. Each step, it looks DOWN.', 'IF it sees a rock (cobblestone), it digs it up. If it’s sand, it leaves it alone.', 'Look in Logic for “if”, and in World for “block the helper sees … = …”.'],
      done: ['No more rocks, and the sand’s still there. That if made a good decision every step!'] }],
    zones: [{ id: 'zPath', name: 'the beach path', a: [30, g, 32], b: [30, g, 43], msg: '', show: true, colour: '#ffd166' }],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcPip' }, { id: 'tRocks', type: 'none', zone: 'zPath', block: 'COBBLE', text: 'Dig up every rock on the path' }, { id: 'tSand', type: 'count', keep: true, zone: 'zPath', block: 'SAND', n: ROCKS.filter(r => !r).length, text: 'Keep all the sand (checked at the end)' }, { id: 'tIf', type: 'uses', feature: 'if', text: 'Use an if' }],
    rules: BUILD_CODE
  }, '# Walk up the path, one step at a time\nfor _ in range(12):\n    helper.move(FORWARD, 1)\n');
}

// ── 10 · If/else and sensing: the hedge maze (a corridor with left and right turns) ──
const R10 = { start: { x: 24, z: 46, f: 0 }, cmds: [3, 'R', 4, 'L', 4, 'L', 3, 'R', 3, 'R', 5, 'L', 3] };
function maze() {
  const w = createWorld(); island(w);
  const { cells, end } = route(R10.start, R10.cmds), open = new Set(cells.map(c => c.join(',')));
  const xs = cells.map(c => c[0]), zs = cells.map(c => c[1]);
  const x0 = Math.min(...xs) - 1, x1 = Math.max(...xs) + 1, z0 = Math.min(...zs) - 1, z1 = Math.max(...zs) + 1;
  for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) if (!open.has(x + ',' + z) && !(x === R10.start.x && z === z1)) { w.set(x, Y, z, B.LEAVES); w.set(x, Y + 1, z, B.LEAVES); }
  for (const [x, z] of cells) w.set(x, g, z, B.GRAVEL);
  w.set(end.x, g, end.z, B.GOLD);
  return project(w, {
    title: 'Lesson 10: The hedge maze', intro: 'The garden maze! The helper can SENSE: “helper sees a block forward?” is true when a hedge is in front of it.\n\nWrite ONE set of rules the helper repeats: if there’s a hedge in front, turn (which way? check the left side!), else step forward. It must work at every corner.',
    start: { x: 31.5, y: Y, z: 53.5, yaw: 0.35 }, helper: { x: R10.start.x, y: Y, z: R10.start.z, f: R10.start.f },
    npcs: [{ id: 'npcRen', name: 'Gardener Ren', x: 21, y: Y, z: 49, f: 1, colour: '#2bb673', task: 'tGold',
      lines: ['Welcome to my maze! I’m Ren. There’s a gold square at the end.', 'Don’t plan every step — make the helper DECIDE. Look in Logic for “if … else”.', 'If there’s a hedge in front: if there’s a hedge on the left too, turn right, else turn left.', 'Otherwise (else), move forward 1. Put it all inside a repeat 40 times.'],
      done: ['You made the helper think for itself! The same rules would work in a different maze too.'] }],
    zones: [cellZone('zGold', 'the gold square', end.x, end.z), { id: 'zMaze', name: 'the maze', a: [x0, Y, z0], b: [x1, Y + 1, z1], msg: '', show: false }],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcRen' }, { id: 'tGold', type: 'helper', zone: 'zGold', text: 'Get the helper to the gold square' }],
    rules: Object.assign({}, BUILD_CODE, { protect: ['zMaze'] })
  }, '# Make the helper decide at every step\nfor _ in range(40):\n    if helper.detect(FORWARD):\n        helper.turn(RIGHT)\n    else:\n        helper.move(FORWARD, 1)\n');
}

// ── 11 · Operators: the orchard (harvest pumpkins OR melons, never the bushes) ──
const ROW11 = ['PUMPKIN', 'LEAVES', 'MELON', 'PUMPKIN', 'LEAVES', 'MELON', 'LEAVES', 'PUMPKIN', 'MELON', 'LEAVES', 'PUMPKIN', 'MELON'];
function orchard() {
  const w = createWorld(); island(w);
  w.fill(B.DIRT, [29, g, 32], [29, g, 43], 'SOLID'); w.fill(B.GRAVEL, [30, g, 32], [30, g, 44], 'SOLID');
  ROW11.forEach((b, i) => w.set(29, Y, 43 - i, B[b]));
  for (const [x, z] of [[24, 34], [24, 40], [36, 37]]) tree(w, x, z, 3);
  w.fill(B.HAY, [33, Y, 44], [34, Y, 44], 'SOLID');
  return project(w, {
    title: 'Lesson 11: The orchard', intro: 'Harvest time! Along the path are pumpkins, melons and little bushes. The helper should pick (dig) a plant on its LEFT if it is a pumpkin OR a melon — but never dig up the bushes.\n\nOne if, with “or” joining two questions.',
    start: START, helper: { x: 30, y: Y, z: 44, f: 0 },
    npcs: [{ id: 'npcBo', name: 'Farmer Bo', x: 32, y: Y, z: 46, f: 3, colour: '#f5a623', task: 'tPumpkins',
      lines: ['Hello! I’m Bo. My pumpkins and melons are ready to pick.', 'Walk up the path. At each step, look to the LEFT.', 'If it’s a pumpkin OR a melon, dig it. The bushes stay!', 'Look in Logic for the “and / or” block, and put two “=” questions inside it.'],
      done: ['A full harvest, and my bushes are safe. “Or” made one question out of two!'] }],
    zones: [{ id: 'zRow', name: 'the crop row', a: [29, Y, 32], b: [29, Y, 43], msg: '', show: true, colour: '#7bd88f' }],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcBo' }, { id: 'tPumpkins', type: 'none', zone: 'zRow', block: 'PUMPKIN', text: 'Pick every pumpkin' }, { id: 'tMelons', type: 'none', zone: 'zRow', block: 'MELON', text: 'Pick every melon' },
      { id: 'tBushes', type: 'count', keep: true, zone: 'zRow', block: 'LEAVES', n: ROW11.filter(b => b === 'LEAVES').length, text: 'Leave all the bushes (checked at the end)' }, { id: 'tOr', type: 'uses', feature: 'logic', text: 'Use “or” (or “and” / “not”)' }],
    rules: BUILD_CODE
  }, '# Walk up the path and pick the pumpkins… and the melons?\nfor _ in range(12):\n    helper.move(FORWARD, 1)\n    if helper.inspect(LEFT) == PUMPKIN:\n        helper.dig(LEFT)\n');
}

// ── 12 · Repeat until: the gold mine (dig down until the helper finds gold) ──
function mine() {
  const w = createWorld(); island(w);
  w.set(32, 4, 38, B.GOLD_ORE); for (const [y, z] of [[7, 38], [9, 37], [5, 39]]) w.set(32, y, z, B.COAL_ORE); w.set(31, 6, 38, B.IRON_ORE);
  w.fill(B.GRAVEL, [31, g, 37], [33, g, 39], 'OUTLINE'); w.set(32, g, 38, B.GRAVEL); // the mine entrance
  for (const x of [30, 34]) { w.fill(B.LOG, [x, Y, 38], [x, Y + 2, 38], 'SOLID'); } w.fill(B.LOG, [30, Y + 3, 38], [34, Y + 3, 38], 'SOLID'); w.set(32, Y + 4, 38, B.LANTERN);
  return project(w, {
    title: 'Lesson 12: The gold mine', intro: 'There is gold deep under the mine entrance — but nobody knows how deep! A “repeat 5 times” loop might stop too soon, or dig too far.\n\nUse “repeat until”: keep digging down UNTIL the block below the helper is gold. Then stop — don’t dig the gold!',
    start: START, helper: { x: 32, y: Y, z: 38, f: 0 },
    npcs: [{ id: 'npcDag', name: 'Miner Dag', x: 28, y: Y, z: 41, f: 1, colour: '#e8453c', task: 'tGold',
      lines: ['Ho there! I’m Dag. There’s gold down this shaft somewhere.', 'Dig down, move down, dig down, move down… but how many times? I don’t know!', 'In Loops, find “repeat while”. Change it to “repeat until”.', 'Repeat until the block the helper sees DOWN = gold in stone. Inside: dig down, move down 1.'],
      done: ['GOLD! And you stopped right on top of it. That loop knew when to stop by itself.'] }],
    zones: [{ id: 'zAbove', name: 'just above the gold', a: [32, 5, 38], b: [32, 5, 38], msg: '', show: false }, { id: 'zGold', name: 'the gold', a: [32, 4, 38], b: [32, 4, 38], msg: '', show: false }],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcDag' }, { id: 'tGold', type: 'helper', zone: 'zAbove', text: 'Stop the helper right on top of the gold' }, { id: 'tKeep', type: 'count', keep: true, zone: 'zGold', block: 'GOLD_ORE', n: 1, text: 'Don’t dig up the gold (checked at the end)' }, { id: 'tUntil', type: 'uses', feature: 'until', text: 'Use repeat until (or while)' }],
    rules: BUILD_CODE
  }, '# Dig down… but how many times?\nfor _ in range(3):\n    helper.dig(DOWN)\n    helper.move(DOWN, 1)\n');
}

// ════════════ Block 3 "Smart helpers" (Years 5–6): variables → variables + maths → events → functions → inputs → project ════════════

// ── 13 · Variables: count the crops ──
const ROW13 = ['PUMPKIN', 'MELON', 'PUMPKIN', 'PUMPKIN', 'HAY', 'MELON', 'PUMPKIN', 'HAY', 'PUMPKIN', 'MELON', 'PUMPKIN', 'PUMPKIN'];
const PUMPKINS13 = ROW13.filter(b => b === 'PUMPKIN').length;
function crops() {
  const w = createWorld(); island(w);
  w.fill(B.DIRT, [29, g, 32], [29, g, 43], 'SOLID'); w.fill(B.GRAVEL, [30, g, 32], [30, g, 44], 'SOLID');
  ROW13.forEach((b, i) => w.set(29, Y, 43 - i, B[b]));
  house(w, 34, 32, 39, 37, B.RED, B.DARK_PLANKS, [36, 37]);
  return project(w, {
    title: 'Lesson 13: Count the crops', intro: 'The island show needs to know how many PUMPKINS grew in this row. The helper walks along and counts them in a variable — a box with a name that remembers a number.\n\nAt the end, the helper says the number.',
    start: START, helper: { x: 30, y: Y, z: 44, f: 0 },
    npcs: [{ id: 'npcMo', name: 'Judge Mo', x: 32, y: Y, z: 46, f: 3, colour: '#9b59d0', task: 'tSay',
      lines: ['Good day! I’m Mo, the show judge. How many pumpkins are in this row?', 'Don’t count them yourself — make the helper count!', 'Make a variable called pumpkins. Set it to 0 at the start.', 'Each step, if the helper sees a pumpkin on its LEFT, change pumpkins by 1. At the end, helper say pumpkins.'],
      done: ['That’s right! A variable remembered the count for you.'] }],
    zones: [{ id: 'zRow', name: 'the pumpkin row', a: [29, Y, 32], b: [29, Y, 43], msg: '', show: true, colour: '#7bd88f' }],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcMo' }, { id: 'tSay', type: 'say', word: String(PUMPKINS13), text: 'Make the helper say how many pumpkins there are' }, { id: 'tVar', type: 'uses', feature: 'variable', text: 'Count with a variable' }],
    rules: BUILD_CODE
  }, '# Count the pumpkins with a variable\npumpkins = 0\nfor _ in range(12):\n    helper.move(FORWARD, 1)\n');
}

// ── 14 · Variables and maths: the staircase (each step one taller) ──
function stairs() {
  const w = createWorld(); island(w);
  w.fill(B.MARBLE, [28, g, 34], [30, g, 41], 'SOLID'); w.fill(B.GRAVEL, [30, g, 34], [30, g, 41], 'SOLID');
  w.fill(B.STONE_BRICKS, [26, Y, 30], [32, Y + 7, 32], 'HOLLOW'); w.set(29, Y, 32, 0); w.set(29, Y + 1, 32, 0); // the castle wall the stairs lead up to
  return project(w, {
    title: 'Lesson 14: The staircase', intro: 'Build a staircase up to the castle: the first step is 1 block tall, the next 2, then 3… up to 6.\n\nUse a variable called height. Build a column that tall, then change height by 1 — and do it 6 times.',
    start: START, helper: { x: 30, y: Y, z: 40, f: 0 },
    npcs: [{ id: 'npcVal', name: 'Builder Val', x: 33, y: Y, z: 42, f: 3, colour: '#17b8a6', task: 'tStairs',
      lines: ['I’m Val. The castle needs a staircase, 6 steps up.', 'Each step is one block taller than the one before: 1, 2, 3, 4, 5, 6.', 'A variable called height can remember how tall the next step is.', 'Inside the loop: build a column height tall on the LEFT, come back down, move forward, then change height by 1.'],
      done: ['Six steps, each one taller. That’s 21 blocks from about 10 lines of code!'] }],
    zones: [{ id: 'zStairs', name: 'the staircase', a: [29, Y, 35], b: [29, Y + 6, 40], msg: '', show: true, colour: '#ffd166' }, { id: 'zTop', name: 'the top step', a: [29, Y, 35], b: [29, Y, 35], msg: '', show: false }],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcVal' }, { id: 'tStairs', type: 'count', zone: 'zStairs', block: 'ANY', n: 21, text: 'Build all 6 steps (21 blocks)' }, { id: 'tTop', type: 'tower', zone: 'zTop', n: 6, text: 'The last step is 6 tall' }, { id: 'tVar', type: 'uses', feature: 'variable', text: 'Use a variable' }],
    rules: BUILD_CODE
  }, '# A staircase: 1, 2, 3, 4, 5, 6\nheight = 1\n');
}

// ── 15 · Events: chat commands (light the promenade) ──
function promenade() {
  const w = createWorld(); island(w);
  w.fill(B.WATER, [8, g - 1, 8], [56, g, 36], 'SOLID'); w.fill(B.TILES, [20, g, 37], [46, g, 41], 'SOLID'); // the sea and the promenade
  w.fill(B.LOG, [20, Y, 38], [46, Y, 38], 'SOLID'); for (let x = 20; x <= 46; x += 2) w.set(x, Y, 38, 0); // a low wooden rail with gaps
  return project(w, {
    title: 'Lesson 15: Chat commands', intro: 'It’s getting dark on the promenade! Make your OWN command: when you type “lamps” in the chat, the helper builds lamp posts.\n\nThe number you type after the word goes into a variable, so “lamps 4” builds 4 lamp posts.',
    start: { x: 25.5, y: Y, z: 46.5, yaw: -0.35 }, helper: { x: 21, y: Y, z: 40, f: 1 },
    npcs: [{ id: 'npcNia', name: 'Nia', x: 23, y: Y, z: 43, f: 0, colour: '#ec6fa8', task: 'tLamps',
      lines: ['Hi, I’m Nia. The promenade is so dark at night!', 'Make a command. In Events, use “when I type … in the chat”, and type the word lamps.', 'Inside: repeat n times — build a post 2 high on the LEFT with a lantern on top, then move forward 3.', 'Then type “lamps 4” in the chat box (press T or Enter). Your code runs when YOU type it: that’s an event.'],
      done: ['Lovely! Every time you type lamps, the event starts your code.'] }],
    zones: [{ id: 'zProm', name: 'the promenade', a: [20, Y, 39], b: [46, Y + 3, 39], msg: '', show: false }],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcNia' }, { id: 'tWord', type: 'chat', word: 'lamps', text: 'Type “lamps” and a number in the chat' }, { id: 'tLamps', type: 'count', zone: 'zProm', block: 'LANTERN', n: 4, text: 'Light 4 lamps on the promenade' }],
    rules: Object.assign({}, BUILD_CODE, { reset: false })
  }, '# Type "lamps 4" in the chat to run this\n@on_chat("lamps")\ndef lamps(n):\n    helper.say("Lamps coming!")\n', { time: 'SUNSET' });
}

// ── 16 · Functions: make your own block (beach huts) ──
function huts() {
  const w = createWorld(); island(w);
  w.fill(B.WATER, [8, g - 1, 8], [56, g, 33], 'SOLID'); w.fill(B.SAND, [8, g, 34], [56, g, 44], 'SOLID'); w.fill(B.LIGHT_PLANKS, [20, g, 41], [46, g, 41], 'SOLID');
  for (let x = 20; x <= 40; x += 6) w.set(x + 1, g, 39, B.CRATE); // markers where each hut goes
  return project(w, {
    title: 'Lesson 16: My own block', intro: 'The beach needs a row of beach huts — all the same. Instead of building each one with a long list of blocks, MAKE YOUR OWN BLOCK called hut. Then use it again and again.\n\nYour block “hut” is already started (look in My blocks). Put the building code inside it, then use it three times.',
    start: { x: 31.5, y: Y, z: 50.5, yaw: 0 }, helper: { x: 20, y: Y, z: 41, f: 1 },
    npcs: [{ id: 'npcSol', name: 'Sol', x: 18, y: Y, z: 43, f: 1, colour: '#f5a623', task: 'tHuts',
      lines: ['Hello! I’m Sol and I rent out beach huts. I need three in a row.', 'A hut front is 3 columns of planks, 3 high, with roof tiles on top, on the LEFT of the helper.', 'Make a block called hut that builds one hut and then walks on to the next spot.', 'Then your program just says: hut, hut, hut!'],
      done: ['Three matching huts! Your own block saved you writing the same code three times.'] }],
    zones: [{ id: 'zHuts', name: 'the beach huts', a: [20, Y, 40], b: [40, Y + 3, 40], msg: '', show: true, colour: '#ffd166' }],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcSol' }, { id: 'tPlanks', type: 'count', zone: 'zHuts', block: 'PLANKS', n: 27, text: 'Build 3 hut fronts of planks' }, { id: 'tRoofs', type: 'count', zone: 'zHuts', block: 'ROOF', n: 9, text: 'Put roof tiles on all 3' }],
    rules: BUILD_CODE
  }, '# Make a block called hut, then use it 3 times\ndef hut():\n    helper.place(PLANKS, LEFT)\n\nhut()\n');
}

// ── 17 · Functions with inputs: towers of any height (the harbour lights) ──
const T17 = [[24, 3], [29, 5], [34, 7]];
function towers() {
  const w = createWorld(); island(w);
  w.fill(B.WATER, [8, g - 1, 8], [56, g, 36], 'SOLID'); w.fill(B.COBBLE, [20, g, 37], [40, g, 40], 'SOLID');
  for (const [x] of T17) w.set(x, g, 38, B.GOLD); // gold marks each spot
  return project(w, {
    title: 'Lesson 17: Towers of any height', intro: 'The harbour needs three light towers: one 3 tall, one 5 tall and one 7 tall, each with a lantern on top.\n\nMake ONE block called tower with an INPUT called height. Then tower(3), tower(5), tower(7) builds all three.',
    start: { x: 29.5, y: Y, z: 49.5, yaw: 0 }, helper: { x: 24, y: Y, z: 39, f: 1 },
    npcs: [{ id: 'npcKai', name: 'Harbourmaster Kai', x: 21, y: Y, z: 42, f: 1, colour: '#3b8eea', task: 'tT7',
      lines: ['Ahoy, I’m Kai. Ships need three light towers on the gold marks.', 'The first is 3 tall, the next 5 tall, the last 7 tall, all with a lantern on top.', 'The block tower already has an input called height. (To add an input to a block, click its gear.)', 'Inside: repeat height times, then a lantern, then come down and move on 5. Use it: tower 3, tower 5, tower 7.'],
      done: ['Three towers from one block! The input made each one a different height.'] }],
    zones: T17.map(([x, h], i) => ({ id: 'zT' + i, name: 'tower ' + (i + 1), a: [x, Y, 38], b: [x, Y, 38], msg: '', show: true, colour: '#ffd166' })),
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcKai' }, ...T17.map(([x, h], i) => ({ id: 'tT' + h, type: 'tower', zone: 'zT' + i, n: h + 1, text: 'Tower ' + (i + 1) + ': ' + h + ' tall with a lantern' }))],
    rules: BUILD_CODE
  }, '# Make a block called tower with an input called height\ndef tower(height):\n    helper.place(STONE_BRICKS, LEFT)\n\ntower(3)\n');
}

// ── 18 · Project: your own district ──
function district() {
  const w = createWorld(); island(w);
  w.fill(B.GRASS, [18, g, 22], [45, g, 45], 'SOLID'); w.fill(B.GOLD, [17, g, 21], [46, g, 46], 'OUTLINE'); // a big plot with a gold edge
  return project(w, {
    title: 'Lesson 18: Design your district', intro: 'The last Academy job: design and code a new part of Pebble Island inside the gold edge — a village, a park, a harbour… you choose!\n\nYour code must use your own block (a function), a variable and an if. Plan it first, then build, test and improve.',
    start: { x: 31.5, y: Y, z: 50.5, yaw: 0 }, helper: { x: 22, y: Y, z: 42, f: 0 },
    npcs: [{ id: 'npcJuno', name: 'Mayor Juno', x: 22, y: Y, z: 48, f: 0, colour: '#17b8a6', task: 'tBuild',
      lines: ['You’ve finished the Academy! I’m giving you a whole district to design.', 'Plan it on paper first. What will you build? Which parts repeat?', 'Use your own blocks for the parts you build lots of — houses, trees, lamps.', 'Use a variable (maybe to change sizes) and an if (maybe to choose colours). Then show me!'],
      done: ['Wonderful! You’re a Robot Helper Academy graduate!'] }],
    zones: [{ id: 'zPlot', name: 'your district', a: [18, Y, 22], b: [45, Y + 16, 45], msg: 'This is your district. Build inside the gold edge!', show: true, colour: '#ffd166' }],
    tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcJuno' }, { id: 'tBuild', type: 'count', zone: 'zPlot', block: 'ANY', n: 40, text: 'Build at least 40 blocks in your district' },
      { id: 'tFn', type: 'uses', feature: 'function', text: 'Use your own block' }, { id: 'tVar', type: 'uses', feature: 'variable', text: 'Use a variable' }, { id: 'tIf', type: 'uses', feature: 'if', text: 'Use an if' }],
    rules: { build: true, break: true, fly: true, python: true, code: 'all', reset: false }
  }, '# Plan your district, then code it!\nhelper.say("Let’s build!")\n');
}

const MAKERS = { 'academy-1-crate': crate, 'academy-2-post': post, 'academy-3-flowers': flowers, 'academy-4-fence': fence, 'academy-5-pen': pen, 'academy-6-market': market,
  'academy-7-bridge': bridge, 'academy-8-lighthouse': lighthouse, 'academy-9-beach': beach, 'academy-10-maze': maze, 'academy-11-orchard': orchard, 'academy-12-mine': mine,
  'academy-13-crops': crops, 'academy-14-stairs': stairs, 'academy-15-chat': promenade, 'academy-16-huts': huts, 'academy-17-towers': towers, 'academy-18-district': district };
export function academyProject(id) { const f = MAKERS[id]; if (!f) throw new Error('No Academy world called ' + id); return f(); }

const plant = c => 'helper.place(' + c + ', RIGHT)\n';
export const ACADEMY_ANSWERS = {
  'academy-1-crate': pyRoute(R1.cmds),
  'academy-2-post': pyRoute(R2.cmds),
  'academy-3-flowers': ['RED', 'YELLOW', 'PINK', 'PURPLE', 'ORANGE'].map((c, i) => plant(c) + (i < 4 ? 'helper.move(FORWARD, 1)\n' : '')).join(''),
  'academy-4-fence': 'for _ in range(10):\n    helper.place(LOG, LEFT)\n    helper.move(FORWARD, 1)\n',
  'academy-5-pen': 'helper.trail(LOG)\nfor _ in range(4):\n    helper.move(FORWARD, 5)\n    helper.turn(RIGHT)\n',
  // three stalls side by side: four posts each (a loop), then a roof
  'academy-6-market': 'helper.move(FORWARD, 3)\nhelper.turn(RIGHT)\nfor _ in range(4):\n    for _ in range(3):\n        helper.place(LOG, LEFT)\n        helper.move(UP, 1)\n    helper.place(RED, LEFT)\n    helper.move(DOWN, 3)\n    helper.move(FORWARD, 2)\n' +
    'for _ in range(4):\n    for _ in range(3):\n        helper.place(LOG, LEFT)\n        helper.move(UP, 1)\n    helper.place(WHITE, LEFT)\n    helper.move(DOWN, 3)\n    helper.move(FORWARD, 2)\n',
  'academy-7-bridge': 'helper.move(FORWARD, 3)\nfor _ in range(5):\n    helper.move(FORWARD, 1)\n    helper.place(PLANKS, DOWN)\nhelper.move(FORWARD, 2)\n',
  'academy-8-lighthouse': 'for _ in range(8):\n    helper.place(WHITE, FORWARD)\n    helper.move(UP, 1)\nhelper.place(LAMP, FORWARD)\n',
  'academy-9-beach': 'for _ in range(12):\n    helper.move(FORWARD, 1)\n    if helper.inspect(DOWN) == COBBLE:\n        helper.dig(DOWN)\n',
  'academy-10-maze': 'for _ in range(40):\n    if helper.detect(FORWARD):\n        if helper.detect(LEFT):\n            helper.turn(RIGHT)\n        else:\n            helper.turn(LEFT)\n    else:\n        helper.move(FORWARD, 1)\n',
  'academy-11-orchard': 'for _ in range(12):\n    helper.move(FORWARD, 1)\n    if helper.inspect(LEFT) == PUMPKIN or helper.inspect(LEFT) == MELON:\n        helper.dig(LEFT)\n',
  'academy-12-mine': 'while not helper.inspect(DOWN) == GOLD_ORE:\n    helper.dig(DOWN)\n    helper.move(DOWN, 1)\n',
  'academy-13-crops': 'pumpkins = 0\nfor _ in range(12):\n    helper.move(FORWARD, 1)\n    if helper.inspect(LEFT) == PUMPKIN:\n        pumpkins += 1\nhelper.say(pumpkins)\n',
  'academy-14-stairs': 'height = 1\nfor _ in range(6):\n    for _ in range(height):\n        helper.place(STONE_BRICKS, LEFT)\n        helper.move(UP, 1)\n    helper.move(DOWN, height)\n    helper.move(FORWARD, 1)\n    height += 1\n',
  'academy-15-chat': '@on_chat("lamps")\ndef lamps(n):\n    for _ in range(n):\n        helper.place(LOG, LEFT)\n        helper.move(UP, 1)\n        helper.place(LOG, LEFT)\n        helper.move(UP, 1)\n        helper.place(LANTERN, LEFT)\n        helper.move(DOWN, 2)\n        helper.move(FORWARD, 3)\n',
  'academy-16-huts': 'def hut():\n    for _ in range(3):\n        for _ in range(3):\n            helper.place(PLANKS, LEFT)\n            helper.move(UP, 1)\n        helper.place(ROOF, LEFT)\n        helper.move(DOWN, 3)\n        helper.move(FORWARD, 1)\n    helper.move(FORWARD, 3)\n\nhut()\nhut()\nhut()\n',
  'academy-17-towers': 'def tower(height):\n    for _ in range(height):\n        helper.place(STONE_BRICKS, LEFT)\n        helper.move(UP, 1)\n    helper.place(LANTERN, LEFT)\n    helper.move(DOWN, height)\n    helper.move(FORWARD, 5)\n\ntower(3)\ntower(5)\ntower(7)\n',
  'academy-18-district': 'def house(size):\n    for _ in range(4):\n        for _ in range(size):\n            helper.place(BRICKS, LEFT)\n            helper.move(FORWARD, 1)\n        helper.turn(RIGHT)\n\ncolour = 0\nfor _ in range(3):\n    colour += 1\n    if colour == 2:\n        helper.trail(RED)\n    else:\n        helper.trail(AIR)\n    house(5)\n    helper.turn(RIGHT)\n    helper.move(FORWARD, 7)\n    helper.turn(LEFT)\n'
};
