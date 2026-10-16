/* CodeJump · 3D World — "Park Designers": a unit of 24 lessons (Years 3–6, four blocks of six) in which pupils design and
 * run a 3D theme park. Our own unit: it follows the usual primary computing order of skills (sequence and events →
 * repetition → selection and debugging → variables and game systems); the story, worlds and wording are ours.
 * No DOM; runs in Node (tests/park.test.mjs proves every answer ticks every goal and no starter does).
 *
 *   PARK                list of { id, block, n, title, years, concept }
 *   PARK_BLOCKS         [ [n, name, years] ]
 *   parkProject(id)     the starter project for the 3D World: { blocks, goals }
 *   parkAnswer(id)      a finished program (Blockly JSON state) that ticks every goal
 *   PARK_PLAY[id]       what the tests do after pressing Run: [['wait', s] | ['click', id] | ['key', k, s]]
 *
 * Programs are written with the small helpers below and turned into Blockly's JSON (the same shape world-blocks.js
 * saves). Object names live in variables (v_<name>); every name used is declared in the workspace's variable list.
 */

export const PARK_BLOCKS = [
  [1, 'Opening day', 'Year 3'],
  [2, 'Rides that move', 'Year 4'],
  [3, 'Fairground games', 'Year 5'],
  [4, 'Running the park', 'Year 6']
];

// ── program helpers ──
let used = null; // variable names seen while building one program
const vid = n => { if (used) used.add(n); return { id: 'v_' + n }; };
function val(x) {
  if (x && typeof x === 'object' && x.type) return { block: x };
  if (typeof x === 'number') return { shadow: { type: 'math_number', fields: { NUM: x } } };
  if (typeof x === 'string' && /^#[0-9a-f]{6}$/i.test(x)) return { shadow: { type: 'colour_picker', fields: { COLOUR: x } } };
  return { shadow: { type: 'text', fields: { TEXT: String(x) } } };
}
function chain(list) {
  list = (list || []).filter(Boolean);
  for (let i = list.length - 2; i >= 0; i--) list[i].next = { block: list[i + 1] };
  return list[0] || null;
}
// a block: obj = names of object/variable fields → variable names; f = other fields; v = value inputs; s = statement inputs
function bk(type, { obj, f, v, s, extra } = {}) {
  const b = { type };
  const fields = {};
  for (const k in obj || {}) fields[k] = vid(obj[k]);
  Object.assign(fields, f || {});
  if (Object.keys(fields).length) b.fields = fields;
  const inputs = {};
  for (const k in v || {}) if (v[k] != null) inputs[k] = val(v[k]);
  for (const k in s || {}) { const c = chain(s[k]); if (c) inputs[k] = { block: c }; }
  if (Object.keys(inputs).length) b.inputs = inputs;
  if (extra) Object.assign(b, extra);
  return b;
}
const XYZ = (x, y, z) => ({ X: x, Y: y, Z: z });

// scene
const sky = c => bk('w3_sky', { v: { COLOR: c } });
const ground = c => bk('w3_ground', { v: { COLOR: c } });
const fog = a => bk('w3_fog', { v: { AMOUNT: a } });
// shapes
const box = (n, c, w, h, d, x, y, z) => bk('w3_box', { obj: { VAR: n }, v: Object.assign({ COLOR: c, W: w, H: h, D: d }, XYZ(x, y, z)) });
const ball = (n, c, size, x, y, z) => bk('w3_sphere', { obj: { VAR: n }, v: Object.assign({ COLOR: c, W: size }, XYZ(x, y, z)) });
const cyl = (n, c, w, h, x, y, z) => bk('w3_cylinder', { obj: { VAR: n }, v: Object.assign({ COLOR: c, W: w, H: h }, XYZ(x, y, z)) });
const cone = (n, c, w, h, x, y, z) => bk('w3_cone', { obj: { VAR: n }, v: Object.assign({ COLOR: c, W: w, H: h }, XYZ(x, y, z)) });
const person = (n, model, scale, x, y, z) => bk('w3_character', { obj: { VAR: n }, f: { MODEL: model }, v: Object.assign({ SCALE: scale }, XYZ(x, y, z)) });
const thing = (n, model, scale, x, y, z) => bk('w3_object', { obj: { VAR: n }, f: { MODEL: model }, v: Object.assign({ SCALE: scale }, XYZ(x, y, z)) });
// characters
const anim = (n, a, mode) => bk('w3_animate', { obj: { VAR: n }, f: { ANIM: a, MODE: mode || 'once' } });
// motion
const moveBy = (n, x, y, z) => bk('w3_move_by', { obj: { VAR: n }, v: XYZ(x, y, z) });
const moveTo = (n, x, y, z) => bk('w3_move_to', { obj: { VAR: n }, v: XYZ(x, y, z) });
const glide = (n, x, y, z, s) => bk('w3_glide_to', { obj: { VAR: n }, v: Object.assign(XYZ(x, y, z), { SECS: s }) });
const turn = (n, x, y, z) => bk('w3_turn_by', { obj: { VAR: n }, v: XYZ(x, y, z) });
const pointTo = (n, x, y, z) => bk('w3_turn_to', { obj: { VAR: n }, v: XYZ(x, y, z) });
// looks
const colour = (n, c) => bk('w3_set_colour', { obj: { VAR: n }, v: { COLOR: c } });
const say = (n, t) => bk('w3_say', { obj: { VAR: n }, v: { TEXT: t } });
const sayFor = (n, t, s) => bk('w3_say_for', { obj: { VAR: n }, v: { TEXT: t, SECS: s } });
const showText = t => bk('w3_show_text', { v: { TEXT: t } });
const showIt = n => bk('w3_show', { obj: { VAR: n } });
const hide = n => bk('w3_hide', { obj: { VAR: n } });
const del = n => bk('w3_delete', { obj: { VAR: n } });
// physics, game, camera, sound
const phys = (n, kind) => bk('w3_physics', { obj: { VAR: n }, f: { KIND: kind } });
const bounce = (n, a) => bk('w3_bounce', { obj: { VAR: n }, v: { AMOUNT: a } });
const push = (n, x, y, z) => bk('w3_push', { obj: { VAR: n }, v: XYZ(x, y, z) });
const control = (n, sp) => bk('w3_control', { obj: { VAR: n }, v: { SPEED: sp } });
const follow = n => bk('w3_follow', { obj: { VAR: n } });
const camView = (n, view) => bk('w3_camera_view', { obj: { VAR: n }, f: { VIEW: view } });
const camZoom = d => bk('w3_camera_zoom', { v: { AMOUNT: d } });
const camLook = (x, y, z) => bk('w3_camera_look', { v: XYZ(x, y, z) });
const sound = s => bk('w3_play_sound', { f: { SOUND: s } });
// events
const onRun = (body, x, y) => bk('w3_when_run', { s: { DO: body }, extra: { x: x || 20, y: y || 20 } });
const onClick = (n, body, x, y) => bk('w3_when_clicked', { obj: { VAR: n }, s: { DO: body }, extra: { x: x || 480, y: y || 20 } });
const onKey = (k, body, x, y) => bk('w3_when_key', { f: { KEY: k }, s: { DO: body }, extra: { x: x || 480, y: y || 20 } });
const onTouch = (a, b, body, x, y) => bk('w3_when_touch', { obj: { A: a, B: b }, s: { DO: body }, extra: { x: x || 480, y: y || 20 } });
const onReceive = (m, body, x, y) => bk('w3_when_receive', { f: { MSG: m }, s: { DO: body }, extra: { x: x || 480, y: y || 300 } });
const broadcast = m => bk('w3_broadcast', { f: { MSG: m } });
// control
const wait = s => bk('w3_wait', { v: { SECS: s } });
const repeat = (n, body) => bk('controls_repeat_ext', { v: { TIMES: n }, s: { DO: body } });
const forever = body => bk('w3_forever', { s: { DO: body } });
const iff = (cond, then, els) => bk('controls_if', { v: { IF0: cond }, s: Object.assign({ DO0: then }, els ? { ELSE: els } : {}), extra: els ? { extraState: { hasElse: true } } : undefined });
const until = (cond, body) => bk('controls_whileUntil', { f: { MODE: 'UNTIL' }, v: { BOOL: cond }, s: { DO: body } });
// sensing, operators, variables
const posOf = (axis, n) => bk('w3_position', { obj: { VAR: n }, f: { AXIS: axis } });
const dist = (a, b) => bk('w3_distance', { obj: { A: a, B: b } });
const touching = (a, b) => bk('w3_touching', { obj: { A: a, B: b } });
const rnd = (a, b) => bk('w3_random', { v: { A: a, B: b } });
const OPS = { '=': 'EQ', '!=': 'NEQ', '<': 'LT', '<=': 'LTE', '>': 'GT', '>=': 'GTE' };
const cmp = (a, op, b) => bk('logic_compare', { f: { OP: OPS[op] }, v: { A: a, B: b } });
const math = (a, op, b) => bk('math_arithmetic', { f: { OP: { '+': 'ADD', '-': 'MINUS', '*': 'MULTIPLY', '/': 'DIVIDE' }[op] }, v: { A: a, B: b } });
const randomColour = () => bk('colour_random');
const join = (...parts) => bk('text_join', { v: Object.fromEntries(parts.map((p, i) => ['ADD' + i, p])), extra: { extraState: { itemCount: parts.length } } });
const get = n => bk('variables_get', { obj: { VAR: n } });
const setVar = (n, v) => bk('variables_set', { obj: { VAR: n }, v: { VALUE: v } });
const change = (n, by) => bk('math_change', { obj: { VAR: n }, v: { DELTA: by } });

// a whole program from its top blocks (hats); every variable used is listed
function program(...hats) {
  used = new Set();
  const built = hats.map(h => (typeof h === 'function' ? h() : h)); // build inside, so names are collected
  const names = [...used]; used = null;
  return { blocks: { languageVersion: 0, blocks: built }, variables: names.map(n => ({ name: n, id: 'v_' + n })) };
}
const P = (...hats) => () => program(...hats.map(h => (typeof h === 'function' ? h : () => h)));

// ── shared scenery ──
const SKY = '#8fd0f7', GRASS = '#7cc46a';
const parkGround = () => [sky(SKY), ground(GRASS)];
const gate = () => [
  box('postL', '#d1477a', 1, 4, 1, -3, 0, 6), box('postR', '#d1477a', 1, 4, 1, 3, 0, 6),
  box('bar', '#f2b61d', 7, 1, 1, 0, 4, 6)
];
const trees = () => [thing('tree1', 'tree', 1, -8, 0, 8), thing('tree2', 'tree4', 1, 8, 0, 9)];

// ── the 24 lessons ──
// goals: the checklist pupils see (and the tests prove). play: what the tests do after Run.
const L = [];
function lesson(o) { L.push(o); }

// ════════ Block 1 · Year 3 · Opening day: sequence, events, physics, animation, speech ════════
lesson({
  id: 'park-1-gate', block: 1, n: 1, title: 'Build the gate', concept: 'algorithms and sequence',
  starter: P(() => onRun([...parkGround(), ...trees(), box('postL', '#d1477a', 1, 4, 1, -3, 0, 6)])),
  answer: P(() => onRun([...parkGround(), ...trees(), ...gate(), thing('star', 'Star', 1, 0, 5, 6)])),
  goals: { title: 'Build the park gate', list: [
    { type: 'has', id: 'postR', text: 'Make a second post called postR' },
    { type: 'has', id: 'bar', text: 'Make a bar called bar' },
    { type: 'reach', id: 'bar', axis: 'y', op: '>', v: 3.5, text: 'Put the bar on top of the posts' },
    { type: 'has', id: 'star', text: 'Put a star called star on the very top' }
  ] },
  play: [['wait', 1]]
});
lesson({
  id: 'park-2-mascot', block: 1, n: 2, title: 'Meet the mascot', concept: 'events',
  starter: P(() => onRun([...parkGround(), ...gate(), person('mascot', 'Liz1', 1, 0, 0, 2)])),
  answer: P(() => onRun([...parkGround(), ...gate(), person('mascot', 'Liz1', 1, 0, 0, 2)]),
    () => onClick('mascot', [anim('mascot', 'Wave', 'once'), sayFor('mascot', 'Welcome to the park!', 3)])),
  goals: { title: 'Welcome the visitors', list: [
    { type: 'uses', blocks: ['w3_when_clicked'], text: 'Use a "when … is clicked" block' },
    { type: 'anim', id: 'mascot', anim: 'Wave', text: 'Click the mascot: it waves' },
    { type: 'say', id: 'mascot', match: 'welcome', text: 'The mascot says “Welcome…”' }
  ] },
  play: [['wait', 0.5], ['click', 'mascot'], ['wait', 1]]
});
lesson({
  id: 'park-3-chat', block: 1, n: 3, title: 'Help a visitor', concept: 'sequence and timing',
  starter: P(() => onRun([...parkGround(), ...gate(), person('guide', 'Block3', 1, -2, 0, 2), person('visitor', 'Block5', 1, 2, 0, 2), pointTo('guide', 0, 90, 0), pointTo('visitor', 0, -90, 0)]),
    () => onClick('visitor', [sayFor('visitor', 'Where are the rides?', 2)])),
  answer: P(() => onRun([...parkGround(), ...gate(), person('guide', 'Block3', 1, -2, 0, 2), person('visitor', 'Block5', 1, 2, 0, 2), pointTo('guide', 0, 90, 0), pointTo('visitor', 0, -90, 0)]),
    () => onClick('visitor', [sayFor('visitor', 'Where are the rides?', 2), anim('guide', 'Idle_Attack', 'once'), sayFor('guide', 'Through the gate and turn left!', 2),
      sayFor('visitor', 'Thank you!', 2), anim('visitor', 'Walk', 'loop'), glide('visitor', 2, 0, 9, 3)])),
  goals: { title: 'A conversation, in order', list: [
    { type: 'say', id: 'guide', text: 'The guide answers the visitor' },
    { type: 'say', id: 'visitor', match: 'thank', text: 'The visitor says thank you' },
    { type: 'uses', blocks: ['w3_say_for'], n: 3, inside: ['w3_when_clicked'], text: 'Three “says … for … seconds” blocks, in the right order' },
    { type: 'reach', id: 'visitor', axis: 'z', op: '>', v: 7, text: 'The visitor walks through the gate' }
  ] },
  play: [['wait', 0.5], ['click', 'visitor'], ['wait', 10]]
});
lesson({
  id: 'park-4-drop', block: 1, n: 4, title: 'The apple drop', concept: 'events and physics',
  starter: P(() => onRun([...parkGround(), thing('tree', 'tree', 2, 0, 0, 4), thing('apple1', 'apple', 1, -1, 3, 3), thing('apple2', 'apple', 1, 1, 3.4, 3),
    box('button', '#e03131', 1, 0.4, 1, 4, 0, 1), sayFor('button', 'Click me!', 3)]),
    () => onClick('button', [colour('button', '#2dc653')])),
  answer: P(() => onRun([...parkGround(), thing('tree', 'tree', 2, 0, 0, 4), thing('apple1', 'apple', 1, -1, 3, 3), thing('apple2', 'apple', 1, 1, 3.4, 3),
    box('button', '#e03131', 1, 0.4, 1, 4, 0, 1), sayFor('button', 'Click me!', 3)]),
    () => onClick('button', [colour('button', '#2dc653'), phys('apple1', 'dynamic'), wait(0.5), phys('apple2', 'dynamic')])),
  goals: { title: 'Drop the apples', list: [
    { type: 'click', id: 'button', text: 'Click the red button' },
    { type: 'uses', blocks: ['w3_physics'], inside: ['w3_when_clicked'], text: 'Make the apples “fall and bump” when the button is clicked' },
    { type: 'reach', id: 'apple1', axis: 'y', op: '<', v: 0.6, text: 'The first apple falls to the ground' },
    { type: 'reach', id: 'apple2', axis: 'y', op: '<', v: 0.6, text: 'The second apple falls too' }
  ] },
  play: [['wait', 0.5], ['click', 'button'], ['wait', 3]]
});
lesson({
  id: 'park-5-launch', block: 1, n: 5, title: 'Star launcher', concept: 'physics and forces',
  starter: P(() => onRun([...parkGround(), cyl('pad', '#4c7fe0', 3, 0.5, 0, 0, 0), phys('pad', 'static'),
    thing('star', 'Star', 1, 0, 0.6, 0), phys('star', 'dynamic'), cyl('target', '#f2b61d', 4, 0.5, 8, 0, 0), phys('target', 'static')]),
    () => onClick('pad', [push('star', 0, 2, 0)])),
  answer: P(() => onRun([...parkGround(), cyl('pad', '#4c7fe0', 3, 0.5, 0, 0, 0), phys('pad', 'static'),
    thing('star', 'Star', 1, 0, 0.6, 0), phys('star', 'dynamic'), cyl('target', '#f2b61d', 4, 0.5, 8, 0, 0), phys('target', 'static')]),
    () => onClick('pad', [sound('jump'), push('star', 3, 14, 0)])),
  goals: { title: 'Launch the star', list: [
    { type: 'click', id: 'pad', text: 'Click the blue launch pad' },
    { type: 'reach', id: 'star', axis: 'y', op: '>', v: 6, text: 'Push the star higher than 6' },
    { type: 'reach', id: 'star', axis: 'x', op: '>', v: 4, text: 'Push it sideways towards the yellow target too' }
  ] },
  play: [['wait', 0.5], ['click', 'pad'], ['wait', 4]]
});
lesson({
  id: 'park-6-welcome', block: 1, n: 6, title: 'Project: the welcome zone', concept: 'design a sequence of events',
  starter: P(() => onRun([...parkGround(), ...gate(), ...trees()])),
  answer: P(() => onRun([...parkGround(), ...gate(), ...trees(), person('host', 'Liz2', 1, 0, 0, 2), thing('gift', 'Gem2', 1, 3, 3, 3), box('bell', '#f2b61d', 1, 1, 1, -3, 0, 2)]),
    () => onClick('host', [anim('host', 'Dance1', 'once'), sayFor('host', 'Have a great day!', 2)]),
    () => onClick('bell', [sound('win'), phys('gift', 'dynamic')], 480, 260)),
  goals: { title: 'Your welcome zone', list: [
    { type: 'uses', blocks: ['w3_character'], text: 'Add a character' },
    { type: 'uses', blocks: ['w3_when_clicked'], n: 2, text: 'Two things happen when they are clicked' },
    { type: 'anim', text: 'A character moves (an animation)' },
    { type: 'say', text: 'A character says something' },
    { type: 'uses', blocks: ['w3_physics', 'w3_push'], inside: ['w3_when_clicked'], text: 'Something falls or flies when it’s clicked' }
  ] },
  play: [['wait', 0.5], ['click', 'host'], ['click', 'bell'], ['wait', 2]]
});

// ════════ Block 2 · Year 4 · Rides that move: repetition ════════
const spinner = () => [...parkGround(), cyl('base', '#555555', 2, 1, 0, 0, 4), box('arm', '#d1477a', 9, 0.6, 1.2, 0, 1, 4)];
lesson({
  id: 'park-7-spinner', block: 2, n: 1, title: 'The spinner', concept: 'count-controlled loops (repeat)',
  starter: P(() => onRun(spinner()), () => onClick('arm', [turn('arm', 0, 30, 0), wait(0.1), turn('arm', 0, 30, 0), wait(0.1), turn('arm', 0, 30, 0), wait(0.1)])),
  answer: P(() => onRun(spinner()), () => onClick('arm', [repeat(12, [turn('arm', 0, 30, 0), wait(0.1)])])),
  goals: { title: 'One full spin', list: [
    { type: 'uses', blocks: ['w3_turn_by'], inside: ['controls_repeat_ext'], text: 'Put the turn block inside a repeat' },
    { type: 'turn', id: 'arm', axis: 'y', deg: 360, text: 'Click the arm: it spins a full circle (360°)' },
    { type: 'uses', blocks: ['w3_wait'], inside: ['controls_repeat_ext'], text: 'Keep a wait in the loop, so you can see it spin' }
  ] },
  play: [['wait', 0.5], ['click', 'arm'], ['wait', 2]]
});
const tower = () => [...parkGround(), cyl('tower', '#4c7fe0', 1.2, 10, 0, 0, 4), box('seat', '#f2b61d', 2.4, 0.6, 1.2, 0, 0, 3)];
lesson({
  id: 'park-8-droptower', block: 2, n: 2, title: 'The drop tower', concept: 'repeating a sequence',
  starter: P(() => onRun(tower()), () => onClick('seat', [glide('seat', 0, 9, 3, 3), glide('seat', 0, 0, 3, 0.5)])),
  answer: P(() => onRun(tower()), () => onClick('seat', [repeat(3, [glide('seat', 0, 9, 3, 2), wait(1), sound('boing'), glide('seat', 0, 0, 3, 0.5)])])),
  goals: { title: 'Three drops', list: [
    { type: 'uses', blocks: ['w3_glide_to'], n: 2, inside: ['controls_repeat_ext'], text: 'Both glides go inside a repeat' },
    { type: 'uses', blocks: ['w3_wait'], inside: ['controls_repeat_ext'], text: 'Wait at the top before the drop' },
    { type: 'reach', id: 'seat', axis: 'y', op: '>', v: 8.5, text: 'Click the seat: it rises to the top' }
  ] },
  play: [['wait', 0.5], ['click', 'seat'], ['wait', 4]]
});
const lights = () => [...parkGround(), cyl('carousel', '#8a5fd6', 6, 0.6, 0, 0, 4), cone('roof', '#e03131', 7, 2, 0, 3.5, 4),
  ball('bulb1', '#ffffff', 0.6, -3, 3, 4), ball('bulb2', '#ffffff', 0.6, 3, 3, 4), ball('bulb3', '#ffffff', 0.6, 0, 3, 1)];
lesson({
  id: 'park-9-lights', block: 2, n: 3, title: 'Carousel lights', concept: 'forever loops',
  starter: P(() => onRun([...lights(), colour('bulb1', '#f2b61d')])),
  answer: P(() => onRun([...lights(), forever([colour('bulb1', randomColour()), colour('bulb2', randomColour()), colour('bulb3', randomColour()), wait(0.3)])])),
  goals: { title: 'Lights that never stop', list: [
    { type: 'uses', blocks: ['w3_forever'], text: 'Use a forever loop' },
    { type: 'uses', blocks: ['w3_wait'], inside: ['w3_forever'], text: 'Put a wait inside it' },
    { type: 'colours', id: 'bulb1', n: 5, text: 'bulb1 changes colour again and again' },
    { type: 'colours', id: 'bulb3', n: 5, text: 'So does bulb3' }
  ] },
  play: [['wait', 3]]
});
const wheel = () => [...parkGround(), box('stand', '#555555', 1, 5, 1, 0, 0, 5), box('wheel', '#4c7fe0', 8, 8, 0.4, 0, 1.5, 4.2), ball('hub', '#f2b61d', 1, 0, 5, 3.8)];
lesson({
  id: 'park-10-wheel', block: 2, n: 4, title: 'Fix the big wheel', concept: 'debugging loops',
  starter: P(() => onRun(wheel()), () => onClick('wheel', [repeat(10, [turn('wheel', 0, 10, 0)]), wait(0.1)])),
  answer: P(() => onRun(wheel()), () => onClick('wheel', [repeat(36, [turn('wheel', 0, 0, 10), wait(0.1)])])),
  goals: { title: 'Mend the wheel', list: [
    { type: 'turn', id: 'wheel', axis: 'z', deg: 360, text: 'It turns round like a wheel, all the way (360°)' },
    { type: 'uses', blocks: ['w3_wait'], inside: ['controls_repeat_ext'], text: 'It turns slowly: the wait is inside the loop' }
  ] },
  play: [['wait', 0.5], ['click', 'wheel'], ['wait', 5]]
});
const cannon = () => [...parkGround(), cyl('cannon', '#e03131', 1.5, 2, 0, 0, 3)];
lesson({
  id: 'park-11-confetti', block: 2, n: 5, title: 'The confetti cannon', concept: 'loops that make things, and random',
  starter: P(() => onRun(cannon()), () => onClick('cannon', [ball('confetti', '#f2b61d', 0.4, 0, 8, 3), phys('confetti', 'dynamic')])),
  answer: P(() => onRun(cannon()), () => onClick('cannon', [sound('pop'), repeat(20, [ball('confetti', randomColour(), 0.4, rnd(-4, 4), 8, rnd(0, 6)), phys('confetti', 'dynamic'), wait(0.05)])])),
  goals: { title: 'Party time', list: [
    { type: 'uses', blocks: ['w3_sphere'], inside: ['controls_repeat_ext'], text: 'Make the confetti inside a repeat' },
    { type: 'uses', blocks: ['w3_random'], n: 2, text: 'Use “pick random” so it lands all over' },
    { type: 'has', id: 'confetti', n: 20, text: 'Click the cannon: 20 pieces of confetti' }
  ] },
  play: [['wait', 0.5], ['click', 'cannon'], ['wait', 3]]
});
lesson({
  id: 'park-12-ride', block: 2, n: 6, title: 'Project: design a ride', concept: 'design with loops',
  starter: P(() => onRun([...parkGround(), cyl('base', '#555555', 2, 1, 0, 0, 4)])),
  answer: P(() => onRun([...parkGround(), cyl('base', '#555555', 2, 1, 0, 0, 4), box('arm', '#2dc653', 8, 0.5, 1, 0, 1, 4), ball('car', '#e03131', 1, 3.5, 1.5, 4)]),
    () => onClick('arm', [sound('magic'), repeat(24, [turn('arm', 0, 15, 0), wait(0.05)])]),
    () => onKey('space', [repeat(3, [glide('car', 3.5, 4, 4, 0.5), glide('car', 3.5, 1.5, 4, 0.5)])], 480, 280)),
  goals: { title: 'Your ride', list: [
    { type: 'uses', blocks: ['controls_repeat_ext', 'w3_forever'], text: 'Use a loop' },
    { type: 'uses', blocks: ['w3_turn_by', 'w3_glide_to', 'w3_move_by'], inside: ['controls_repeat_ext', 'w3_forever'], text: 'Something moves inside the loop' },
    { type: 'uses', blocks: ['w3_when_clicked', 'w3_when_key'], text: 'It starts when you click it or press a key' },
    { type: 'uses', blocks: ['w3_play_sound', 'w3_play_sound_wait', 'w3_play_note'], text: 'Add a sound' }
  ] },
  play: [['wait', 0.5], ['click', 'arm'], ['key', 'space', 0.2], ['wait', 2]]
});

// ════════ Block 3 · Year 5 · Fairground games: selection, input, debugging ════════
const bellGame = () => [...parkGround(), box('pole', '#8a5fd6', 0.6, 10, 0.6, -1.2, 0, 4), cyl('bell', '#f2b61d', 1.4, 0.8, 0, 8, 4), phys('bell', 'static'),
  box('puck', '#e03131', 1, 0.5, 1, 0, 0, 4), phys('puck', 'dynamic'), say('bell', 'Press space!')];
lesson({
  id: 'park-13-bell', block: 3, n: 1, title: 'Ring the bell', concept: 'selection (if) and sensing',
  starter: P(() => onRun(bellGame()), () => onKey('space', [push('puck', 0, 5, 0)])),
  answer: P(() => onRun([...bellGame(), forever([iff(touching('puck', 'bell'), [say('bell', 'DING!'), colour('bell', '#2dc653')])])]),
    () => onKey('space', [push('puck', 0, 14, 0)])),
  goals: { title: 'Ring it!', list: [
    { type: 'uses', blocks: ['controls_if'], inside: ['w3_forever'], text: 'Keep checking: an if inside a forever' },
    { type: 'uses', blocks: ['w3_touching'], inside: ['controls_if'], text: 'The if asks: is the puck touching the bell?' },
    { type: 'touch', a: 'puck', b: 'bell', text: 'Press space hard enough to reach the bell' },
    { type: 'say', id: 'bell', match: 'ding', text: 'The bell says DING!' }
  ] },
  play: [['wait', 0.5], ['key', 'space', 0.1], ['wait', 3]]
});
const arena = () => [...parkGround(), box('floor', '#c8b6ff', 22, 0.1, 22, 0, 0, 0), box('car', '#e03131', 1.6, 0.8, 1.2, 0, 0.1, 0), control('car', 6)];
lesson({
  id: 'park-14-dodgems', block: 3, n: 2, title: 'Dodgem rules', concept: 'selection with sensing and comparison',
  starter: P(() => onRun([...arena(), forever([])])),
  answer: P(() => onRun([...arena(), forever([
    iff(cmp(posOf('X', 'car'), '>', 10), [moveBy('car', -0.5, 0, 0), say('car', 'Bump!')]),
    iff(cmp(posOf('X', 'car'), '<', -10), [moveBy('car', 0.5, 0, 0), say('car', 'Bump!')])])])),
  goals: { title: 'Stay in the arena', list: [
    { type: 'uses', blocks: ['controls_if'], n: 2, inside: ['w3_forever'], text: 'Two ifs in the forever loop: one for each side' },
    { type: 'uses', blocks: ['w3_position'], text: 'Use the car’s x position' },
    { type: 'stay', id: 'car', axis: 'x', min: -11, max: 11, secs: 3, text: 'Drive into the sides: the car never leaves the purple floor' },
    { type: 'say', id: 'car', match: 'bump', text: 'The car says Bump!' }
  ] },
  play: [['wait', 0.3], ['key', 'right', 3], ['key', 'left', 5], ['wait', 0.5]]
});
const weatherScene = () => [...parkGround(), ...gate(), person('mascot', 'Liz1', 1, 0, 0, 2)];
lesson({
  id: 'park-15-weather', block: 3, n: 3, title: 'Sunny or rainy?', concept: 'if … else with random',
  starter: P(() => onRun([...weatherScene(), sky('#8fd0f7')])),
  answer: P(() => onRun([...weatherScene(), iff(cmp(rnd(1, 2), '=', 1), [sky('#7a8899'), fog(40), sayFor('mascot', 'The rides are closed. It’s raining!', 3)],
    [sky('#8fd0f7'), sayFor('mascot', 'All the rides are open!', 3)])])),
  goals: { title: 'Weather report', list: [
    { type: 'uses', blocks: ['controls_if_else'], text: 'Use an if … else block' },
    { type: 'uses', blocks: ['w3_random'], inside: ['controls_if'], text: 'The if picks a random number' },
    { type: 'uses', blocks: ['w3_sky'], n: 2, inside: ['controls_if'], text: 'A different sky for each answer' },
    { type: 'say', id: 'mascot', text: 'The mascot tells the visitors' }
  ] },
  play: [['wait', 1]]
});
const ghostTrain = () => [...parkGround(), box('track', '#555555', 1.4, 0.1, 16, 0, 0, 4), box('tunnel', '#2b2240', 4, 4, 3, 0, 0, 10),
  box('cart', '#e03131', 1.2, 1, 1.6, 0, 0.1, -3), thing('tree', 'tree3', 1, 4, 0, 6), person('ghost', 'Liz5', 1, -2.5, 0, 9), hide('ghost')];
lesson({
  id: 'park-16-ghost', block: 3, n: 4, title: 'Debug the ghost train', concept: 'testing and debugging',
  starter: P(() => onRun([...ghostTrain(), glide('cart', 0, 0.1, -9, 4)]),
    () => onRun([forever([iff(touching('cart', 'tree'), [showIt('ghost'), say('cart', 'Boo!')])])], 480, 20)),
  answer: P(() => onRun([...ghostTrain(), glide('cart', 0, 0.1, 9, 4)]),
    () => onRun([forever([iff(touching('cart', 'tunnel'), [showIt('ghost'), say('ghost', 'Boo!')])])], 480, 20)),
  goals: { title: 'Find the three bugs', list: [
    { type: 'touch', a: 'cart', b: 'tunnel', text: 'Bug 1: the cart goes into the tunnel' },
    { type: 'has', id: 'ghost', text: 'Bug 2: the ghost appears at the tunnel' },
    { type: 'say', id: 'ghost', match: 'boo', text: 'Bug 3: the ghost (not the cart) says Boo!' }
  ] },
  play: [['wait', 6]]
});
const fountain = () => [...parkGround(), thing('pond', 'pond', 1.5, 0, 0, 6), ball('water', '#4dabf7', 2, 0, 1, 6), hide('water'),
  person('player', 'Block5', 1, 0, 0, -4), phys('player', 'dynamic'), control('player', 5)];
lesson({
  id: 'park-17-splash', block: 3, n: 5, title: 'The splash fountain', concept: 'if … else with distance',
  starter: P(() => onRun([...fountain(), forever([])])),
  answer: P(() => onRun([...fountain(), forever([iff(cmp(dist('player', 'pond'), '<', 4), [showIt('water'), say('player', 'Splash!')], [hide('water'), say('player', '')])])])),
  goals: { title: 'Get splashed', list: [
    { type: 'uses', blocks: ['controls_if_else'], inside: ['w3_forever'], text: 'Keep checking with if … else' },
    { type: 'uses', blocks: ['w3_distance'], text: 'Use the distance from the player to the pond' },
    { type: 'has', id: 'water', text: 'Walk up to the pond: the water appears' },
    { type: 'say', id: 'player', match: 'splash', text: 'The player says Splash!' }
  ] },
  play: [['wait', 0.5], ['key', 'up', 1.6], ['wait', 1]]
});
lesson({
  id: 'park-18-stall', block: 3, n: 6, title: 'Project: a game stall', concept: 'design a game with selection',
  starter: P(() => onRun([...parkGround(), box('stall', '#d1477a', 6, 3, 1, 0, 0, 9)])),
  answer: P(() => onRun([...parkGround(), box('stall', '#d1477a', 6, 3, 1, 0, 0, 9), phys('stall', 'static'), box('can', '#f2b61d', 0.8, 1.2, 0.8, 0, 3, 9), phys('can', 'dynamic'),
    ball('throw', '#e03131', 0.6, 0, 0, 0), phys('throw', 'dynamic'),
    forever([iff(cmp(posOf('Y', 'can'), '<', 2), [say('can', 'You win a prize!')], [say('can', 'Knock me off!')])])]),
    () => onKey('space', [push('throw', 0, 10, 6)])),
  goals: { title: 'Your stall', list: [
    { type: 'uses', blocks: ['w3_when_key', 'w3_when_clicked', 'w3_when_touch'], text: 'Players press a key or click to play' },
    { type: 'uses', blocks: ['controls_if_else'], text: 'Use if … else to decide' },
    { type: 'uses', blocks: ['w3_touching', 'w3_distance', 'w3_position', 'w3_key_down'], inside: ['controls_if'], text: 'The if checks something in the world' },
    { type: 'say', text: 'Something tells the player how they did' }
  ] },
  play: [['wait', 0.5], ['key', 'space', 0.1], ['wait', 3]]
});

// ════════ Block 4 · Year 6 · Running the park: variables, cameras, game systems ════════
const gateTurnstile = () => [...parkGround(), ...gate(), box('turnstile', '#2dc653', 1.5, 1.2, 0.4, 0, 0, 6)];
lesson({
  id: 'park-19-tickets', block: 4, n: 1, title: 'The ticket counter', concept: 'variables',
  starter: P(() => onRun([...gateTurnstile(), setVar('tickets', 0)]), () => onClick('turnstile', [sound('click')])),
  answer: P(() => onRun([...gateTurnstile(), setVar('tickets', 0), showText(join('Tickets: ', get('tickets')))]),
    () => onClick('turnstile', [sound('click'), change('tickets', 1), showText(join('Tickets: ', get('tickets')))])),
  goals: { title: 'Count the visitors', list: [
    { type: 'uses', blocks: ['math_change'], inside: ['w3_when_clicked'], text: 'Change tickets by 1 when the turnstile is clicked' },
    { type: 'show', match: 'Tickets', text: 'Show “Tickets:” and the number on the screen' },
    { type: 'var', name: 'tickets', op: '>=', v: 5, text: 'Let 5 visitors in' }
  ] },
  play: [['wait', 0.3], ['click', 'turnstile'], ['wait', 0.2], ['click', 'turnstile'], ['wait', 0.2], ['click', 'turnstile'], ['wait', 0.2], ['click', 'turnstile'], ['wait', 0.2], ['click', 'turnstile'], ['wait', 0.5]]
});
const coaster = () => [...parkGround(), box('rail1', '#555555', 1.4, 0.1, 22, 0, 0, 8), box('car', '#e03131', 1.2, 1, 1.8, 0, 0.1, -2),
  person('mascot', 'Liz1', 1, 3, 0, 18), pointTo('mascot', 0, 180, 0)];
lesson({
  id: 'park-20-coastercam', block: 4, n: 2, title: 'Coaster cam', concept: 'cameras and messages',
  starter: P(() => onRun([...coaster(), wait(1), glide('car', 0, 3, 8, 2), glide('car', 0, 0.1, 18, 2)])),
  answer: P(() => onRun([...coaster(), camView('car', 'behind'), camZoom(8), wait(1), glide('car', 0, 3, 8, 2), glide('car', 0, 0.1, 18, 2), broadcast('finish')]),
    () => onReceive('finish', [camLook(3, 1, 18), camZoom(10), anim('mascot', 'Clap', 'once'), sayFor('mascot', 'What a ride!', 3)])),
  goals: { title: 'Film the ride', list: [
    { type: 'uses', blocks: ['w3_camera_view', 'w3_follow'], text: 'The camera rides along with the car' },
    { type: 'reach', id: 'car', axis: 'z', op: '>', v: 16, text: 'The car reaches the end of the track' },
    { type: 'uses', blocks: ['w3_when_receive'], text: 'A “when I receive” block starts the ending' },
    { type: 'anim', id: 'mascot', anim: 'Clap', text: 'The mascot claps at the end' }
  ] },
  play: [['wait', 6]]
});
const coinGame = () => [...parkGround(), person('player', 'Block5', 1, 0, 0, -6), phys('player', 'dynamic'), control('player', 6), follow('player'),
  thing('coin', 'Coin', 1, 0, 0.3, -2), setVar('score', 0), showText(join('Score: ', get('score')))];
lesson({
  id: 'park-21-coins', block: 4, n: 3, title: 'Collect the coins', concept: 'a score variable',
  starter: P(() => onRun(coinGame()), () => onTouch('player', 'coin', [sound('coin')])),
  answer: P(() => onRun(coinGame()), () => onTouch('player', 'coin', [sound('coin'), change('score', 1), showText(join('Score: ', get('score'))), moveBy('coin', 0, 0, 4)])),
  goals: { title: 'Five coins', list: [
    { type: 'uses', blocks: ['math_change'], inside: ['w3_when_touch'], text: 'Add 1 to score when the player touches the coin' },
    { type: 'uses', blocks: ['w3_move_by', 'w3_move_to'], inside: ['w3_when_touch'], text: 'Move the coin on, so it can be caught again' },
    { type: 'show', match: 'Score', text: 'Show the score on the screen' },
    { type: 'var', name: 'score', op: '>=', v: 5, text: 'Walk forward and collect 5 coins' }
  ] },
  play: [['wait', 0.5], ['key', 'up', 6], ['wait', 0.5]]
});
const clockGame = () => [...coinGame(), setVar('clock', 10)];
lesson({
  id: 'park-22-clock', block: 4, n: 4, title: 'Beat the clock', concept: 'a countdown and decisions',
  starter: P(() => onRun(clockGame()), () => onTouch('player', 'coin', [sound('coin'), change('score', 1), showText(join('Score: ', get('score'))), moveBy('coin', 0, 0, 4)])),
  answer: P(() => onRun([...clockGame(), until(cmp(get('clock'), '=', 0), [wait(1), change('clock', -1), showText(join('Score: ', get('score'), '  Time: ', get('clock')))]),
    iff(cmp(get('score'), '>=', 5), [sayFor('player', 'I win!', 3)], [sayFor('player', 'Time’s up!', 3)])]),
    () => onTouch('player', 'coin', [sound('coin'), change('score', 1), showText(join('Score: ', get('score'))), moveBy('coin', 0, 0, 4)])),
  goals: { title: 'Ten seconds', list: [
    { type: 'uses', blocks: ['controls_whileUntil'], text: 'Count down with “repeat until”' },
    { type: 'show', match: 'Time', text: 'Show the time left on the screen' },
    { type: 'var', name: 'clock', op: '<=', v: 0, text: 'The clock counts down to 0' },
    { type: 'say', id: 'player', text: 'Then the player says if they won' }
  ] },
  play: [['wait', 0.5], ['key', 'up', 6], ['wait', 6]]
});
const grow = () => [...parkGround(), box('shop', '#f2b61d', 2, 2, 2, 0, 0, 2), setVar('money', 0), setVar('visitors', 1)];
const earn = () => forever([wait(1), change('money', get('visitors')), showText(join('Money: ', get('money'), '  Visitors: ', get('visitors')))]);
lesson({
  id: 'park-23-grow', block: 4, n: 5, title: 'Grow the park', concept: 'variables that control a game',
  starter: P(() => onRun([...grow(), earn()]), () => onClick('shop', [say('shop', 'Coming soon')])),
  answer: P(() => onRun([...grow(), earn()]),
    () => onClick('shop', [iff(cmp(get('money'), '>=', 10), [change('money', -10), change('visitors', 1), thing('tent', 'hut3', 1, rnd(-8, 8), 0, rnd(6, 12)), sayFor('shop', 'New ride!', 2)],
      [sayFor('shop', 'Not enough money yet', 2)])])),
  goals: { title: 'Buy new rides', list: [
    { type: 'uses', blocks: ['controls_if_else'], inside: ['w3_when_clicked'], text: 'When the shop is clicked: if money ≥ 10 … else …' },
    { type: 'say', id: 'shop', match: 'not enough', text: 'Too soon? The shop says not enough money' },
    { type: 'has', id: 'tent', n: 2, text: 'Buy two new rides' },
    { type: 'var', name: 'visitors', op: '>=', v: 3, text: 'More rides bring more visitors (3)' }
  ] },
  play: [['wait', 1.5], ['click', 'shop'], ['wait', 9.5], ['click', 'shop'], ['wait', 6.5], ['click', 'shop'], ['wait', 1]]
});
lesson({
  id: 'park-24-opening', block: 4, n: 6, title: 'Project: the grand opening', concept: 'design a park game',
  starter: P(() => onRun([...parkGround(), ...gate(), ...trees()])),
  answer: P(() => onRun([...parkGround(), ...gate(), person('player', 'Block1', 1, 0, 0, -4), phys('player', 'dynamic'), control('player', 6), camView('player', 'behind'),
    thing('prize', 'Gem2', 1, 0, 0.5, 2), setVar('gems', 0), showText(join('Gems: ', get('gems')))]),
    () => onTouch('player', 'prize', [change('gems', 1), showText(join('Gems: ', get('gems'))), moveBy('prize', 0, 0, 5),
      iff(cmp(get('gems'), '=', 3), [sayFor('player', 'Park complete!', 3)])])),
  goals: { title: 'Your park game', list: [
    { type: 'uses', blocks: ['math_change'], text: 'A variable changes (a score, money or time)' },
    { type: 'uses', blocks: ['controls_if'], text: 'An if decides something' },
    { type: 'uses', blocks: ['w3_when_clicked', 'w3_when_key', 'w3_when_touch', 'w3_when_receive'], text: 'An event starts the action' },
    { type: 'uses', blocks: ['w3_camera_view', 'w3_follow', 'w3_camera_look'], text: 'Use a camera block' },
    { type: 'show', text: 'Show something on the screen' }
  ] },
  play: [['wait', 0.5], ['key', 'up', 3], ['wait', 0.5]]
});

// ── exports ──
const YEARS = Object.fromEntries(PARK_BLOCKS.map(b => [b[0], b[2]]));
export const PARK = L.map(l => ({ id: l.id, block: l.block, n: l.n, title: l.title, years: YEARS[l.block], concept: l.concept }));
export const PARK_PLAY = Object.fromEntries(L.map(l => [l.id, l.play]));
const byId = id => L.find(l => l.id === id);
export function parkProject(id) { const l = byId(id); return l ? { blocks: l.starter(), goals: JSON.parse(JSON.stringify(l.goals)) } : null; }
export function parkAnswer(id) { const l = byId(id); return l ? l.answer() : null; }
export function parkGoals(id) { const l = byId(id); return l ? JSON.parse(JSON.stringify(l.goals)) : null; }
