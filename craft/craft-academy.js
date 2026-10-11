/* CodeJump · Build Lab — Robot Helper Academy: a unit of lessons where pupils code the robot helper round Pebble Island,
 * one district (one World Maker world) per lesson, one new coding skill each time. No DOM, so Node tests build and solve them.
 *
 *   ACADEMY → [{id, n, block, title, skill, text}]   (the lessons in order; lessons/lessons.js has the teacher plans)
 *   academyProject(id) → a Build Lab project (with `maker`: characters, tasks, rules) as the lesson starts
 *   ACADEMY_ANSWERS[id] → a Python program that completes every task (the tests prove it; the teacher notes use it)
 *
 * Block 1 "Getting going" (Years 3–4): algorithms → sequence → sequence with actions → loops → loops + efficiency → project.
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
  { id: 'academy-6-market', n: 6, block: 1, title: 'Market day', skill: 'Project', text: 'Use everything so far to build market stalls with loops.' }
];

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

const MAKERS = { 'academy-1-crate': crate, 'academy-2-post': post, 'academy-3-flowers': flowers, 'academy-4-fence': fence, 'academy-5-pen': pen, 'academy-6-market': market };
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
    'for _ in range(4):\n    for _ in range(3):\n        helper.place(LOG, LEFT)\n        helper.move(UP, 1)\n    helper.place(WHITE, LEFT)\n    helper.move(DOWN, 3)\n    helper.move(FORWARD, 2)\n'
};
