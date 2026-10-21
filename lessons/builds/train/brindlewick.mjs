// BRINDLEWICK RAILWAY — the Train Lab's lesson unit (lessons/units/train.js): the starter project for each new lesson,
// the answer that does what the lesson promises, and (for the projects) an example that meets every success criterion.
// The test (tests/unit-train.test.mjs) runs them with the Train Lab's own simulator and runner (train/train-model.js,
// train/train-runner.js) on a headless Blockly workspace in Node.
//
// The story: the little town of Brindlewick is getting its railway back. The class are the railway's engineers; Mrs Achebe
// the station master gives them a job every lesson. The engine is Bramble; later a second engine, Fern, runs the branch
// line to Brindle Farm.
//
// A project is train-model.js's { v: 2, pieces, trains, wagons, dests, challenge, blocks } (what trainApp.setProject takes).
// Programs are Blockly JSON workspace states written with the small helpers below. PLAY[id] says how the test runs a lesson:
// { secs, keys: [{ at | near: placeIndex, down | press | up: key }] } — the same for the starter and the answer.
const TM = await import(new URL('../../../train/train-model.js', import.meta.url).href);
const { chain, pieceGeom, TRAIN_COLOURS } = TM;

// ── track
const C4 = ['curveR', 'curveR', 'curveR', 'curveR'];
// an oval going clockwise: n straights along the top (left → right), 4 curves, n along the bottom, 4 curves; outside = side -1
export function oval(n, at = { x: 0, y: 0, h: 0 }) {
  const pieces = [];
  chain(pieces, at, [...Array(n).fill('straight'), ...C4, ...Array(n).fill('straight'), ...C4]);
  return pieces;
}
// the oval with a passing loop on the top (0 straight, 1 split, 2 short, 3 split, 4 straight, 5–8 curves, 9–13 bottom, 14–17
// curves, 18–19 the loop, which the split at piece 1 turns right into)
export function passingLoop() {
  const pieces = [];
  chain(pieces, { x: 0, y: 0, h: 0 }, ['straight', 'splitR', 'short', ['splitL', 1, 0], 'straight', ...C4, 'straight', 'straight', 'short', 'straight', 'straight', ...C4]);
  chain(pieces, pieceGeom(pieces[1]).ends[2], ['curveL', 'curveL']);
  return pieces;
}
const line = n => Array.from({ length: n }, (_, i) => ['straight', i, 0, 0, null]);
// snaps on a piece: slot → colour (a straight has 7 slots, a curve 3)
const snaps = (pieces, p, list) => { const n = TM.slotCount(pieces[p][0]), a = new Array(n).fill(null); list.forEach((c, k) => { if (c) a[k] = c; }); pieces[p][4] = a; };
const one = (pieces, p, slot, col) => { const a = pieces[p][4] ? pieces[p][4].slice() : new Array(TM.slotCount(pieces[p][0])).fill(null); a[slot] = col; pieces[p][4] = a; };

// ── blocks
const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const V = x => (typeof x === 'number' ? N(x) : { block: x });
export const chainB = list => { let first = null, prev = null; for (const b of list.filter(Boolean)) { if (prev) prev.next = { block: b }; else first = b; prev = b; } return first; };
const body = list => { const c = chainB(list); return c ? { block: c } : undefined; };
const tt = (t, op) => 't' + t + '_' + op;
// train statements (t = 1 Bramble, 2 Fern)
const drive = (speed, t = 1, dir = 1) => ({ type: tt(t, 'startDriving'), fields: { DIRECTION: dir < 0 ? '-1' : '1' }, inputs: { SPEED: V(speed) } });
const driveFor = (cm, speed, t = 1, dir = 1) => ({ type: tt(t, 'moveFixedDistance'), fields: { DIRECTION: dir < 0 ? '-1' : '1' }, inputs: { DISTANCE: V(cm), SPEED: V(speed) } });
const stopDriving = (t = 1) => ({ type: tt(t, 'stopDriving') });
const pause = (s, t = 1) => ({ type: tt(t, 'pauseDriving'), inputs: { TIME: V(s) } });
const LEDS = { top: '1', head: '2', tail: '4' };
const led = (col, t = 1, g = 'top') => ({ type: tt(t, 'setLedColorPicker'), fields: { LEDGROUP: LEDS[g], COLOR: col } });
const SIDES = { left: '1', right: '2', straight: '3', default: '0' };
const nextSplit = (side, t = 1) => ({ type: tt(t, 'setNextSplitDecision'), fields: { SIDE: SIDES[side] } });
const COL = { black: '0', red: '1', green: '2', yellow: '3', blue: '4', magenta: '5', cyan: '6', white: '7' };
const sensor = (t = 1) => ({ type: tt(t, 'getSensorColor') });
const colour = (c, t = 1) => ({ type: tt(t, 'classifiedColor'), fields: { COLOR: COL[c] } });
const speedOf = (t = 1) => ({ type: tt(t, 'getSpeedCmps') });
// control, sensing, operators, variables
const wait = s => ({ type: 'tr_wait', inputs: { S: V(s) } });
const waitUntil = cond => ({ type: 'tr_wait_until', inputs: { COND: { block: cond } } });
const repeat = (n, list) => ({ type: 'controls_repeat_ext', inputs: { TIMES: V(n), DO: body(list) } });
const forever = list => ({ type: 'tr_forever', inputs: { DO: body(list) } });
const iff = (cond, yes) => ({ type: 'controls_if', inputs: { IF0: { block: cond }, DO0: body(yes) } });
const ifElse = (cond, yes, no) => ({ type: 'controls_if', extraState: { hasElse: true }, inputs: { IF0: { block: cond }, DO0: body(yes), ELSE: body(no) } });
const OPS = { '=': 'EQ', '≠': 'NEQ', '<': 'LT', '≤': 'LTE', '>': 'GT', '≥': 'GTE' };
const cmp = (a, op, b) => ({ type: 'logic_compare', fields: { OP: OPS[op] }, inputs: { A: V(a), B: V(b) } });
const keyDown = k => ({ type: 'tr_key_pressed', fields: { KEY: k } });
const timer = () => ({ type: 'tr_timer' });
const resetTimer = () => ({ type: 'tr_reset_timer' });
const vid = n => 'v_' + n.replace(/\s+/g, '_');
const set = (n, x) => ({ type: 'variables_set', fields: { VAR: { id: vid(n) } }, inputs: { VALUE: V(x) } });
const change = (n, x) => ({ type: 'math_change', fields: { VAR: { id: vid(n) } }, inputs: { DELTA: V(x) } });
const get = n => ({ type: 'variables_get', fields: { VAR: { id: vid(n) } } });
const broadcast = msg => ({ type: 'tr_broadcast', fields: { MSG: msg } });
// scripts (hats)
const at = (b, x, y) => Object.assign(b, { x, y });
const whenRun = (list, x = 24, y = 24) => at({ type: 'tr_when_run', next: body(list) }, x, y);
const whenKey = (key, list, x, y) => at({ type: 'tr_when_key', fields: { KEY: key }, next: body(list) }, x, y);
const whenMsg = (msg, list, x, y) => at({ type: 'tr_when_message', fields: { MSG: msg }, next: body(list) }, x, y);
const whenSees = (c, list, x, y, t = 1) => at({ type: tt(t, 'whenColorChanged'), fields: { COLOR: COL[c] }, next: body(list) }, x, y);
const prog = (scripts, vars = []) => ({ blocks: { languageVersion: 0, blocks: scripts }, ...(vars.length ? { variables: vars.map(n => ({ name: n, id: vid(n) })) } : {}) });
const NONE = prog([]);

// ── the railway
const BRAMBLE = (start, extra) => ({ name: 'Bramble', color: TRAIN_COLOURS[0], start, ...extra });
const FERN = start => ({ name: 'Fern', color: TRAIN_COLOURS[1], start });
const project = (pieces, trains, dests, challenge, blocks) => ({ v: 2, pieces, trains, wagons: [], dests, challenge: challenge || null, blocks: blocks || NONE });
const challenge = (title, text, steps) => ({ id: '', title, text, steps: steps.map(([d, a]) => ({ d, a })) });
const clone = o => JSON.parse(JSON.stringify(o));
const R = '#ff0000', G = '#00ff00';

export const STARTERS = {}, ANSWERS = {}, EXAMPLES = {}, PLAY = {};

// ═══════════════ BLOCK 1 · OPENING THE LINE (Years 3–4) ═══════════════
// 1 Lay the line: the oval is only half built. The plan: 1 straight, then 4 curve rights, closes it. The train stops at the
// station (white red), goes past the farm, then hits the end of the unfinished line; once it's finished it gets back to the
// station and stops there again.
{
  const full = oval(2); snaps(full, 1, ['white', 'red']);
  const dests = [{ t: 'start', p: 0, side: 1 }, { t: 'station', p: 1, side: -1 }, { t: 'farm', p: 6, side: -1 }];
  const ch = challenge('Opening day', 'Lay the rest of the line so Bramble can go past the farm and come all the way back to the station.', [[0, 'start'], [2, 'pass'], [1, 'stop']]);
  STARTERS['rail-1-track'] = project(full.slice(0, 7).map(p => p.slice()), [BRAMBLE({ p: 0, k: 0, rev: false })], dests, ch);
  ANSWERS['rail-1-track'] = project(clone(full), [BRAMBLE({ p: 0, k: 0, rev: false })], dests, ch);
  PLAY['rail-1-track'] = { secs: 30 };
}
// 3 The market day run (decomposition): a straight line with three stops; the starter does leg 1 (to the school)
{
  const dests = [{ t: 'start', p: 0, side: 1 }, { t: 'school', p: 3, side: -1 }, { t: 'shops', p: 5, side: -1 }, { t: 'harbour', p: 8, side: -1 }];
  const ch = challenge('Market day', 'Stop at the school, then at the shops, then end the run at the harbour.', [[0, 'start'], [1, 'stop'], [2, 'stop'], [3, 'end']]);
  const leg = (cm) => [driveFor(cm, 30), wait(2)];
  STARTERS['rail-3-market'] = project(line(10), [BRAMBLE({ p: 0, k: 0, rev: false })], dests, ch, prog([whenRun([...leg(75)])]));
  ANSWERS['rail-3-market'] = project(line(10), [BRAMBLE({ p: 0, k: 0, rev: false })], dests, ch, prog([whenRun([...leg(75), ...leg(50), ...leg(75)])]));
  PLAY['rail-3-market'] = { secs: 30 };
}
// 4 The school shuttle (count-controlled repetition): one trip there and back, three times with repeat 3
{
  const dests = [{ t: 'station', p: 1, side: -1 }, { t: 'school', p: 5, side: -1 }];
  const ch = challenge('The school shuttle', 'Take the children from the station to the school and back three times.', [[0, 'start'], [1, 'stop'], [0, 'stop'], [1, 'stop'], [0, 'stop'], [1, 'stop'], [0, 'stop']]);
  const trip = () => [driveFor(100, 30), wait(2), driveFor(100, 30, 1, -1), wait(2)];
  STARTERS['rail-4-shuttle'] = project(line(7), [BRAMBLE({ p: 1, k: 0, rev: false })], dests, ch, prog([whenRun(trip())]));
  ANSWERS['rail-4-shuttle'] = project(line(7), [BRAMBLE({ p: 1, k: 0, rev: false })], dests, ch, prog([whenRun([repeat(3, trip())])]));
  PLAY['rail-4-shuttle'] = { secs: 45 };
}
// 5 In the driver's cab (events): g sets off; the answer adds "when s key pressed → stop driving"
{
  const dests = [{ t: 'depot', p: 7, side: -1 }, { t: 'station', p: 1, side: -1 }, { t: 'farm', p: 4, side: -1 }];
  const ch = challenge('Driver’s cab', 'Drive Bramble yourself: stop at the station, go past the farm, then stop back at the depot.', [[0, 'start'], [1, 'stop'], [2, 'pass'], [0, 'end']]);
  const go = whenKey('g', [drive(45)], 24, 24);
  STARTERS['rail-5-driver'] = project(oval(2), [BRAMBLE({ p: 7, k: 0, rev: false })], dests, ch, prog([go]));
  ANSWERS['rail-5-driver'] = project(oval(2), [BRAMBLE({ p: 7, k: 0, rev: false })], dests, ch, prog([clone(go), whenKey('s', [stopDriving()], 24, 140)]));
  // the driver: press g, press s at the station, g again 2 s later, s at the depot
  PLAY['rail-5-driver'] = { secs: 30, keys: [{ at: 0.2, press: 'g' }, { near: 1, after: 0.2, press: 's' }, { wait: 2, press: 'g' }, { near: 2, press: null }, { near: 0, press: 's' }] };
}
// 6 Project: a new line for Brindlewick — the starter is one straight with the station and Bramble on it; the example is a
// closed loop with four places, a five-job challenge, snaps and a repeat
{
  STARTERS['rail-6-project'] = project([['straight', 0, 0, 0, null]], [BRAMBLE({ p: 0, k: 0, rev: false })], [{ t: 'station', p: 0, side: -1 }], null);
  const pc = oval(2); snaps(pc, 1, ['white', 'red']); snaps(pc, 6, ['white', 'red', 'red']); snaps(pc, 7, ['white', 'red', 'blue']);
  const dests = [{ t: 'depot', p: 7, side: -1 }, { t: 'station', p: 1, side: -1 }, { t: 'castle', p: 3, side: -1 }, { t: 'school', p: 6, side: -1 }];
  EXAMPLES['rail-6-project'] = project(pc, [BRAMBLE({ p: 7, k: 0, rev: false })], dests,
    challenge('The castle line', 'Stop at the station, go past the castle, stop at the school, then end the route at the depot.', [[0, 'start'], [1, 'stop'], [2, 'pass'], [3, 'stop'], [0, 'end']]),
    prog([whenRun([drive(45), repeat(4, [led(R), wait(0.5), led(G), wait(0.5)])])]));
  PLAY['rail-6-project'] = { secs: 40 };
}

// ═══════════════ BLOCK 2 · SIGNALS AND SWITCHES (Years 4–5) ═══════════════
// 7 The red signal (sensing → event → output): a lone red snap by the station, a lone green one by the farm
{
  const pc = oval(2); one(pc, 1, 3, 'red'); one(pc, 6, 3, 'green');
  const dests = [{ t: 'depot', p: 7, side: -1 }, { t: 'station', p: 1, side: -1 }, { t: 'farm', p: 4, side: -1 }];
  const ch = challenge('Mind the signal', 'Stop at the red signal by the station every time round.', [[0, 'start'], [1, 'stop'], [2, 'pass'], [1, 'stop']]);
  const run = whenRun([drive(45)]);
  STARTERS['rail-7-signal'] = project(pc, [BRAMBLE({ p: 7, k: 0, rev: false })], dests, ch, prog([run]));
  ANSWERS['rail-7-signal'] = project(clone(pc), [BRAMBLE({ p: 7, k: 0, rev: false })], dests, ch,
    prog([clone(run), whenSees('red', [pause(3), led(R)], 24, 140), whenSees('green', [led(G)], 24, 260)]));
  PLAY['rail-7-signal'] = { secs: 30 };
}
// 8 Which platform? (selection): a yellow marker before the split; hold space = passengers at the station on the loop
{
  const pc = passingLoop(); one(pc, 0, 3, 'yellow');
  const dests = [{ t: 'start', p: 12, side: -1 }, { t: 'shops', p: 2, side: -1 }, { t: 'station', p: 18, side: 1 }];
  const run = whenRun([drive(45)]);
  STARTERS['rail-8-platform'] = project(pc, [BRAMBLE({ p: 12, k: 0, rev: false })], dests, null, prog([run, whenSees('yellow', [nextSplit('straight')], 24, 140)]));
  ANSWERS['rail-8-platform'] = project(clone(pc), [BRAMBLE({ p: 12, k: 0, rev: false })], dests, null,
    prog([clone(run), whenSees('yellow', [ifElse(keyDown('space'), [nextSplit('right')], [nextSplit('straight')])], 24, 140)]));
  PLAY['rail-8-platform'] = { secs: 12 };
}
// 9 Into the shed (wait until + compare): drive backward slowly until the sensor sees the red marker, then stop
{
  const pc = line(6); one(pc, 1, 3, 'red');
  const dests = [{ t: 'start', p: 4, side: 1 }, { t: 'depot', p: 1, side: -1 }];
  const ch = challenge('Into the shed', 'Back Bramble into the depot and stop on the red marker, before the buffers at the end.', [[0, 'start'], [1, 'end']]);
  STARTERS['rail-9-shed'] = project(pc, [BRAMBLE({ p: 4, k: 0, rev: false })], dests, ch, prog([whenRun([drive(20, 1, -1)])]));
  ANSWERS['rail-9-shed'] = project(clone(pc), [BRAMBLE({ p: 4, k: 0, rev: false })], dests, ch,
    prog([whenRun([drive(20, 1, -1), waitUntil(cmp(sensor(), '=', colour('red'))), stopDriving()])]));
  PLAY['rail-9-shed'] = { secs: 16 };
}
// 10 The speed check (forever + if … else + >): fast on the top, slow on the bottom; red light whenever over 50 cm/s
{
  const pc = oval(2); snaps(pc, 0, ['white', 'green', 'green', 'green']); snaps(pc, 6, ['white', 'green']);
  const dests = [{ t: 'start', p: 7, side: -1 }, { t: 'school', p: 1, side: -1 }];
  STARTERS['rail-10-speed'] = project(pc, [BRAMBLE({ p: 7, k: 0, rev: false })], dests, null, prog([whenRun([drive(45), led(G)])]));
  ANSWERS['rail-10-speed'] = project(clone(pc), [BRAMBLE({ p: 7, k: 0, rev: false })], dests, null,
    prog([whenRun([drive(45), forever([ifElse(cmp(speedOf(), '>', 50), [led(R)], [led(G)])])])]));
  PLAY['rail-10-speed'] = { secs: 24 };
}
// 11 The faulty signal box (debugging loops and conditions): three bugs, one in each part
{
  const pc = passingLoop(); one(pc, 0, 3, 'yellow'); one(pc, 10, 3, 'red'); snaps(pc, 4, ['white', 'green', 'green', 'green']); snaps(pc, 12, ['white', 'green', 'green']);
  const dests = [{ t: 'start', p: 12, side: -1 }, { t: 'station', p: 10, side: -1 }, { t: 'school', p: 18, side: 1 }];
  const ch = challenge('Signal box check', 'Stop at the station’s red signal, then do it again next time round.', [[0, 'start'], [1, 'stop'], [1, 'pass'], [1, 'stop']]);
  const make = (stopCol, swap, op) => prog([
    whenRun([drive(45), forever([ifElse(cmp(speedOf(), op, 50), [led(R)], [led(G)])])]),
    whenSees(stopCol, [pause(2)], 480, 24),
    whenSees('yellow', [ifElse(keyDown('space'), [nextSplit(swap ? 'straight' : 'right')], [nextSplit(swap ? 'right' : 'straight')])], 480, 140)
  ]);
  STARTERS['rail-11-debug'] = project(pc, [BRAMBLE({ p: 12, k: 0, rev: false })], dests, ch, make('green', true, '<'));
  ANSWERS['rail-11-debug'] = project(clone(pc), [BRAMBLE({ p: 12, k: 0, rev: false })], dests, ch, make('red', false, '>'));
  PLAY['rail-11-debug'] = { secs: 30 };
}
// 12 Project: the junction controller — the starter is the passing-loop track with no snaps or blocks; the example uses a
// marker, an event, if … else and a forever loop
{
  STARTERS['rail-12-project'] = project(passingLoop(), [BRAMBLE({ p: 12, k: 0, rev: false })], [{ t: 'start', p: 12, side: -1 }], null);
  const pc = passingLoop(); one(pc, 0, 3, 'yellow'); one(pc, 10, 3, 'red'); snaps(pc, 4, ['white', 'green', 'green', 'green']);
  const dests = [{ t: 'start', p: 12, side: -1 }, { t: 'station', p: 10, side: -1 }, { t: 'museum', p: 18, side: 1 }, { t: 'castle', p: 6, side: -1 }];
  EXAMPLES['rail-12-project'] = project(pc, [BRAMBLE({ p: 12, k: 0, rev: false })], dests,
    challenge('Museum express', 'Stop at the station, take the loop to the museum, go past the castle and stop at the station again.', [[0, 'start'], [1, 'stop'], [2, 'pass'], [3, 'pass'], [1, 'stop']]),
    prog([whenRun([set('trips', 0), drive(45), forever([ifElse(cmp(speedOf(), '>', 50), [led(R)], [led(G)])])]),
      whenSees('red', [pause(2), change('trips', 1)], 24, 230),
      whenSees('yellow', [ifElse(cmp(get('trips'), '=', 1), [nextSplit('right')], [nextSplit('straight')])], 24, 330)], ['trips']));
  PLAY['rail-12-project'] = { secs: 40 };
}

// ═══════════════ BLOCK 3 · RUNNING THE RAILWAY (Years 5–6) ═══════════════
// 13 = the adopted 'smart-trains' lesson (its own starter, lessons/make-starters.mjs); its answer, for the test:
ANSWERS['smart-trains'] = prog([
  whenRun([set('laps', 0), drive(45)]),
  whenSees('red', [led(R), change('laps', 1), ifElse(cmp(get('laps'), '<', 3), [nextSplit('straight')], [nextSplit('right')])], 24, 200)
], ['laps']);
// 14 Lap times (data): a timing line by the station (Bramble starts just past it, so every lap is a whole lap); "lap time" = the timer when Bramble crosses it, then reset the timer
{
  const pc = oval(2); one(pc, 1, 0, 'red');
  const dests = [{ t: 'start', p: 0, side: 1 }, { t: 'station', p: 1, side: -1 }];
  STARTERS['rail-14-laps'] = project(pc, [BRAMBLE({ p: 1, k: 0, rev: false })], dests, null, prog([whenRun([drive(30)])]));
  ANSWERS['rail-14-laps'] = project(clone(pc), [BRAMBLE({ p: 1, k: 0, rev: false })], dests, null,
    prog([whenRun([resetTimer(), drive(30)]), whenSees('red', [set('lap time', timer()), resetTimer()], 24, 140)], ['lap time']));
  PLAY['rail-14-laps'] = { secs: 40 };
}
// 15 The connection (broadcast): Bramble on the main line, Fern on the branch line to the farm; Fern must wait for Bramble's
// passengers. Two separate loops.
const twoLines = () => {
  const main = oval(2); snaps(main, 1, ['white', 'red']);
  const branch = oval(1, { x: 0.5, y: 3.2, h: 0 }); one(branch, 0, 0, 'red');
  return [...main, ...branch]; // the branch line's pieces are 12–21; Fern's station is 12
};
{
  const pc = twoLines();
  const dests = [{ t: 'station', p: 1, side: -1 }, { t: 'farm', p: 12, side: 1 }];
  const trains = () => [BRAMBLE({ p: 7, k: 0, rev: false }), FERN({ p: 12, k: 0, rev: false })];
  const fernStop = whenSees('red', [stopDriving(2)], 24, 300, 2);
  STARTERS['rail-15-connect'] = project(pc, trains(), dests, null, prog([whenRun([drive(45), drive(45, 2)]), fernStop]));
  ANSWERS['rail-15-connect'] = project(clone(pc), trains(), dests, null, prog([whenRun([drive(45)]),
    whenSees('red', [broadcast('connection')], 24, 140), whenMsg('connection', [drive(45, 2)], 340, 24), clone(fernStop)]));
  PLAY['rail-15-connect'] = { secs: 30 };
}
// 16 The express test (a variable as an input): 20 cm/s for the first lap, 10 cm/s faster every time round; after the 60 cm/s lap it stops
{
  const pc = oval(2); one(pc, 1, 0, 'red');
  const dests = [{ t: 'start', p: 0, side: 1 }, { t: 'station', p: 1, side: -1 }];
  STARTERS['rail-16-express'] = project(pc, [BRAMBLE({ p: 1, k: 0, rev: false })], dests, null, prog([whenRun([drive(20)])]));
  ANSWERS['rail-16-express'] = project(clone(pc), [BRAMBLE({ p: 1, k: 0, rev: false })], dests, null, prog([
    whenRun([set('test speed', 20), drive(get('test speed'))]),
    whenSees('red', [change('test speed', 10), ifElse(cmp(get('test speed'), '>', 60), [stopDriving()], [drive(get('test speed'))])], 24, 140)
  ], ['test speed']));
  PLAY['rail-16-express'] = { secs: 50 };
}
// 17 The evening timetable (debugging variables and messages): three bugs — trips reset every time, a misspelt message,
// and > 3 where it should be ≥ 3 (one trip too many)
{
  const pc = twoLines(); pc[1][4] = null; one(pc, 1, 3, 'red'); // the main station: a red marker, the blocks do the stopping
  const dests = [{ t: 'start', p: 7, side: 1 }, { t: 'station', p: 1, side: -1 }, { t: 'farm', p: 12, side: 1 }];
  const ch = challenge('Evening timetable', 'Three trips to the station, then Bramble stays there for the night.', [[0, 'start'], [1, 'stop'], [1, 'pass'], [1, 'stop'], [1, 'pass'], [1, 'end']]);
  const trains = () => [BRAMBLE({ p: 7, k: 0, rev: false }), FERN({ p: 12, k: 0, rev: false })];
  const make = bugs => prog([
    whenRun([set('trips', 0), drive(45)]),
    whenSees('red', [...(bugs ? [set('trips', 0)] : []), change('trips', 1), broadcast(bugs ? 'conection' : 'connection'),
      ifElse(cmp(get('trips'), bugs ? '>' : '≥', 3), [stopDriving()], [pause(2)])], 24, 240),
    whenMsg('connection', [drive(45, 2)], 500, 24),
    whenSees('red', [stopDriving(2)], 500, 140, 2)
  ], ['trips']);
  STARTERS['rail-17-debug'] = project(pc, trains(), dests, ch, make(true));
  ANSWERS['rail-17-debug'] = project(clone(pc), trains(), dests, ch, make(false));
  PLAY['rail-17-debug'] = { secs: 45 };
}
// 18 Project: Brindlewick open day — the starter is both lines with their stations and no blocks; the example uses a
// variable, a message, if … else and a sensor event, and does its challenge
{
  const pc = twoLines(); pc[1][4] = null;
  STARTERS['rail-18-project'] = project(pc, [BRAMBLE({ p: 7, k: 0, rev: false }), FERN({ p: 12, k: 0, rev: false })], [{ t: 'station', p: 1, side: -1 }, { t: 'farm', p: 12, side: 1 }], null);
  const ex = twoLines(); ex[1][4] = null; one(ex, 1, 3, 'red'); one(ex, 4, 1, 'yellow');
  const dests = [{ t: 'start', p: 7, side: 1 }, { t: 'station', p: 1, side: -1 }, { t: 'castle', p: 4, side: -1 }, { t: 'farm', p: 12, side: 1 }];
  EXAMPLES['rail-18-project'] = project(ex, [BRAMBLE({ p: 7, k: 0, rev: false }), FERN({ p: 12, k: 0, rev: false })], dests,
    challenge('Open day', 'Stop at the station twice, go past the castle, then end the day at the station.', [[0, 'start'], [1, 'stop'], [2, 'pass'], [1, 'stop'], [2, 'pass'], [1, 'end']]),
    prog([
      whenRun([set('visitors', 0), drive(45)]),
      whenSees('red', [change('visitors', 25), broadcast('connection'), ifElse(cmp(get('visitors'), '≥', 75), [stopDriving(), led(R)], [pause(2)])], 24, 140),
      whenSees('yellow', [led('#ffd21f'), led('#ffffff', 1, 'head')], 24, 330),
      whenMsg('connection', [drive(45, 2)], 400, 24),
      whenSees('red', [stopDriving(2)], 400, 140, 2)
    ], ['visitors']));
  PLAY['rail-18-project'] = { secs: 45 };
}

export const IDS = ['rail-1-track', 'train-snaps', 'rail-3-market', 'rail-4-shuttle', 'rail-5-driver', 'rail-6-project',
  'rail-7-signal', 'rail-8-platform', 'rail-9-shed', 'rail-10-speed', 'rail-11-debug', 'rail-12-project',
  'smart-trains', 'rail-14-laps', 'rail-15-connect', 'rail-16-express', 'rail-17-debug', 'rail-18-project'];
