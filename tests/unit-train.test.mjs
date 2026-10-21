// Brindlewick Railway — the Train Lab's lesson unit (lessons/units/train.js, 18 lessons in 3 blocks).
// Every lesson is complete; every starter opens in the real app with its Lesson card; and for every lesson that isn't a
// project, the lesson's intended answer (lessons/builds/train/brindlewick.mjs ANSWERS) does what the lesson promises while
// the bare starter does not — proven in Node with the Train Lab's own simulator (train/train-model.js), challenge checker
// and block runner (train/train-runner.js) on a headless Blockly workspace, with scripted key presses (PLAY).
// Project lessons: the starter opens, an example meets every success criterion and the bare starter doesn't.
// TRAIN_CODE=1 runs only the Node checks (for working on the unit).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, require, serve, browser, openApp, ok, done } from './lib.mjs';

const imp = p => import(pathToFileURL(join(ROOT, p)).href);
const U = await imp('lessons/units/train.js');
const L = await imp('lessons/builds/train/brindlewick.mjs');
const TM = await imp('train/train-model.js');
const TB = await imp('train/train-blocks.js');
const { createRunner } = await imp('train/train-runner.js');
const Blockly = require('blockly');
TB.defineBlocks(Blockly);
const ONLY_CODE = process.env.TRAIN_CODE === '1';
const clone = o => JSON.parse(JSON.stringify(o));
const starterJSON = id => JSON.parse(readFileSync(join(ROOT, 'lessons', 'starters', id + '.json'), 'utf8')).train;

// ───────── the unit's data ─────────
const NAME = 'Brindlewick Railway';
if (!ONLY_CODE) {
  const { LESSONS: ALL } = await imp('lessons/lessons.js');
  const UNIT = U.LESSONS.map(x => ALL.find(l => l.id === (x.adopt || x.id)));
  ok(UNIT.length === 18 && UNIT.every(Boolean), `18 lessons in the unit, all in the library (${UNIT.filter(Boolean).length})`);
  ok(UNIT.map(l => l && l.id).join() === L.IDS.join(), 'the unit’s lessons are in the order the programs file expects');
  ok(new Set(ALL.map(l => l.id)).size === ALL.length, 'every lesson id in the library is different');
  ok(['train-snaps', 'smart-trains'].every(id => U.LESSONS.some(x => x.adopt === id)), 'the Train Lab’s two earlier lessons are folded into the unit');
  const YEARS = ['Years 3–4', 'Years 4–5', 'Years 5–6'];
  const words = /Scratch|ScratchJr|Minecraft|Tinkercad|Autodesk|intelino|Ohbot|Bamzooki|BBC|Flock|Flip Computing|Code\.org|Barefoot|Thomas/;
  UNIT.forEach((l, i) => {
    if (!l) return;
    l = Object.assign({ plan: [], steps: [], success: [], words: [], assess: [], need: [], curriculum: [], slides: [] }, l);
    const b = Math.floor(i / 6) + 1, m = i + 1, mins = l.plan.reduce((a, p) => a + p.min, 0), slides = l.slides || [];
    ok(l.unit === `${NAME} · Block ${b} · Lesson ${m}` && l.years === YEARS[b - 1] && l.ks === 'ks2' && l.type === 'train' && l.minutes === 60,
      `${l.id}: Block ${b} · Lesson ${m}, ${l.years}, ${l.ks}, 60 minutes`);
    ok(mins === 60 && l.steps.length >= 4 && l.steps.length <= 9 && l.success.length >= 2 && l.words.length >= 2 && l.assess.length >= 2 && l.support && l.stretch && l.objective && l.summary && l.need.length && l.title,
      `${l.id}: complete (plan ${mins} min, ${l.steps.length} pupil steps)`);
    ok(l.curriculum.length && l.curriculum.every(k => ['design', 'ssr', 'reason', 'data', 'safe'].includes(k)), `${l.id}: Key Stage 2 curriculum keys (${l.curriculum})`);
    ok(slides.length >= 4 && slides.length <= 8 && slides.some(s => s.use === 'steps') && slides.every(s => s.use || (s.t && s.notes)), `${l.id}: ${slides.length} slides with notes and a Your turn slide`);
    // the adopted lessons keep their own text, which names the real smart trains' editor in a teacher note; new lessons name no other product
    if (/^rail-/.test(l.id)) ok(!words.test(JSON.stringify(l)), `${l.id}: no other product’s names`);
    ok(existsSync(join(ROOT, 'lessons', 'starters', l.id + '.json')) && existsSync(join(ROOT, 'lessons', 'pics', l.id + '.jpg')), `${l.id}: starter + picture`);
    if (/^rail-/.test(l.id)) ok(L.STARTERS[l.id] && (L.ANSWERS[l.id] || L.EXAMPLES[l.id]) && L.PLAY[l.id] && existsSync(join(ROOT, 'lessons', 'builds', l.id + '.mjs')), `${l.id}: starter, answer (or example), play script and build file`);
  });
  ok(UNIT.filter((l, i) => i % 6 === 5).every(l => l && /^Project/.test(l.title)), 'lesson 6 of each block is a design-and-make project');
  // the pupil steps name buttons and blocks that really exist
  const BLOCK_WORDS = ['when Run is clicked', 'drive forward', 'stop driving', 'pause driving for', 'set top LED color to', 'on next split go', 'when train sees', 'sensor color',
    'speed (cm/s)', 'wait until', 'repeat', 'forever', 'if', 'key space pressed?', 'timer', 'reset timer', 'broadcast', 'when I receive', 'Create variable', 'change', 'set'];
  const steps = UNIT.filter(Boolean).flatMap(l => l.steps.map(s => s.t + ' ' + s.d)).join('\n');
  ok(BLOCK_WORDS.every(w => steps.includes(w)), 'the pupil steps use the Train Lab’s real block words (' + BLOCK_WORDS.filter(w => !steps.includes(w)).join(', ') + ')');
}

// ───────── the Train Lab, headless: the real simulator, checker and runner on a Blockly workspace ─────────
// play(project, { secs, keys, hold }) → { sim, runner, checker, log, frames }. keys: a list of steps done in order —
//   { at: secs } waits for a time · { near: placeIndex, after? } waits until Train 1 is close to a place · { wait: secs } after the last
//   step · press: key name (a key press) · down / up: hold a key down / let go.
function play(project, sc = {}) {
  const ws = new Blockly.Workspace();
  if (project.blocks) Blockly.serialization.workspaces.load(clone(project.blocks), ws);
  const held = new Set(sc.hold || []), log = [], frames = [];
  let runner = null, t = 0;
  const sim = TM.createSim(clone(project), { random: () => 0.3, onEvent: (i, k, d) => { log.push({ t, i, k, d }); if (runner) runner.event(i, k, d); } });
  runner = createRunner(sim, { keyDown: k => held.has(k), onError: e => log.push({ t, k: 'error', d: String(e && e.message || e) }) });
  const checker = sim.project.challenge && sim.project.challenge.steps.length ? TM.createChecker(sim, sim.project.challenge) : null;
  runner.start(ws);
  const spot = j => { const d = sim.project.dests[j]; const q = sim.geoms[d.p].paths[0].at(0.5); return q; };
  const steps = (sc.keys || []).map(s => ({ ...s })); let si = 0, lastAt = 0, wasNear = false;
  const dt = 1 / 60;
  for (let n = 0; n * dt < (sc.secs || 20); n++) {
    t = n * dt;
    const s = steps[si];
    if (s) {
      let go = false;
      if (s.at != null) go = t >= s.at;
      else if (s.wait != null) go = t >= lastAt + s.wait;
      else if (s.near != null) { const q = spot(s.near), me = sim.pose(0), d = me ? Math.hypot(me.x - q.x, me.y - q.y) : 99; const now = d < 0.25; go = now && (!s.fresh || !wasNear); wasNear = now; }
      if (go) {
        if (s.press) runner.key(s.press);
        if (s.down) held.add(s.down);
        if (s.up) held.delete(s.up);
        si++; lastAt = t; wasNear = false;
      }
    }
    runner.tick(dt);
    if (checker) checker.tick(dt);
    const trs = sim.trains.map(tr => ({ p: tr.p, v: tr.v, cms: Math.round(tr.v * TM.CM), top: tr.top, head: tr.head, back: tr.back, on: tr.on, pause: !!tr.pause }));
    frames.push({ t, trs, vars: { ...runner._vars() } });
  }
  return { sim, runner, checker, log, frames, ws };
}
const doneAll = r => !!(r.checker && r.checker.complete());
const jobs = r => r.checker ? r.checker.done.filter(Boolean).length + '/' + r.checker.steps.length : '-';
const events = (r, k, i = 0) => r.log.filter(e => e.k === k && (e.i === i || e.i === undefined));
const visited = (r, ps, i = 0) => r.frames.some(f => ps.includes(f.trs[i].p));
const errorsIn = r => r.log.filter(e => e.k === 'error');
const blocksOf = (project, ...types) => { const all = JSON.stringify(project.blocks || {}); return types.every(t => all.includes('"' + t + '"')); };
const both = id => [play(L.STARTERS[id], L.PLAY[id]), play(L.ANSWERS[id], L.PLAY[id])];
const R = '#ff0000', G = '#00ff00';

// ── Block 1 · Opening the line (Years 3–4)
{ // 1 Lay the line: one straight and four curve rights close the oval, so Bramble gets past the farm and back to the station
  const [s, a] = both('rail-1-track');
  const links = p => { const g = p.pieces.map(TM.pieceGeom), l = TM.linkUp(g); return g.flatMap((G, i) => G.ends.map((E, e) => !!l[i + ':' + e])).every(Boolean); };
  // the same five pieces in the wrong order (curves first) don't close the loop
  const wrong = clone(L.STARTERS['rail-1-track']); TM.chain(wrong.pieces, TM.pieceGeom(wrong.pieces[6]).ends[1], ['curveR', 'curveR', 'curveR', 'curveR', 'straight']);
  ok(doneAll(a) && !doneAll(s) && links(L.ANSWERS['rail-1-track']) && !links(wrong) && events(s, 'end').length > 0 && events(a, 'end').length === 0,
    `Lay the line: straight + 4 curve rights close the loop and every job ticks (${jobs(a)}); the starter runs off the end of the unfinished line (${jobs(s)}); curves first doesn’t join up`);
}
{ // 2 Snap code (adopted): the starter's red-white station doesn't stop the train; the answer's snaps do every job
  const st = starterJSON('train-snaps'), ans = clone(st);
  ans.pieces[0][4] = ['white', 'red', null, null, null, null, null]; ans.pieces[1][4] = ['white', 'green', null, null, null, null, null];
  ans.pieces[3][4] = ['white', 'blue', null]; ans.pieces[0][4] = [null, null, null, null, 'blue', 'red', 'white'].map((c, k) => c || ans.pieces[0][4][k]);
  const s = play(st, { secs: 60 }), a = play(ans, { secs: 60 });
  ok(doneAll(a) && !doneAll(s) && !s.checker.done[1], `Snap code: the fixed and finished snaps do all five jobs (${jobs(a)}); the buggy red-white station is driven straight past (${jobs(s)})`);
}
{ // 3 Market day: three legs (75, 50, 75 cm), each “drive forward … cm” + “wait 2”
  const [s, a] = both('rail-3-market');
  ok(doneAll(a) && !doneAll(s) && s.checker.done[1] && !s.checker.done[2], `Market day: three legs reach the school, the shops and the harbour (${jobs(a)}); the starter only does leg 1 (${jobs(s)})`);
}
{ // 4 The school shuttle: repeat 3 times does three return trips
  const [s, a] = both('rail-4-shuttle');
  const repeats = blocksOf(L.ANSWERS['rail-4-shuttle'], 'controls_repeat_ext') && JSON.stringify(L.ANSWERS['rail-4-shuttle'].blocks).split('moveFixedDistance').length - 1 === 2;
  ok(doneAll(a) && !doneAll(s) && jobs(s) === '3/7' && repeats, `The school shuttle: repeat 3 around one trip (still only 2 drive blocks) does all three trips (${jobs(a)}); the starter does one (${jobs(s)})`);
}
{ // 5 The driver's cab: g sets off; “when s key pressed → stop driving” lets the driver stop at the station and the depot
  const [s, a] = both('rail-5-driver');
  const still = r => r.frames.filter(f => f.t > 1 && f.trs[0].v === 0).length;
  ok(doneAll(a) && !doneAll(s) && still(s) === 0 && events(a, 'command').length === 0, `In the driver’s cab: g and s keys drive Bramble to every job (${jobs(a)}); without the s key event it never stops (${jobs(s)})`);
}
{ // 6 Project: the example meets the success criteria; the starter (one straight, no route) doesn't
  const ex = L.EXAMPLES['rail-6-project'], st = L.STARTERS['rail-6-project'];
  const closed = p => { const g = p.pieces.map(TM.pieceGeom), l = TM.linkUp(g); return p.pieces.length > 2 && g.every((G, i) => G.ends.every((E, e) => l[i + ':' + e])); };
  const crit = p => { const r = play(p, L.PLAY['rail-6-project']); return closed(p) && p.dests.length >= 3 && p.challenge && p.challenge.steps.length >= 4 && doneAll(r)
    && p.pieces.some(q => q[4]) && blocksOf(p, 'controls_repeat_ext'); };
  ok(crit(ex) && !crit(st), 'Project · a new line: the example is a closed loop with 4 places, a 5-job challenge it completes, snaps and a repeat; the starter meets none of it');
}

// ── Block 2 · Signals and switches (Years 4–5)
{ // 7 The red signal: “when train sees red” → pause + red light, every time round
  const [s, a] = both('rail-7-signal');
  const atStation = a.frames.filter(f => f.trs[0].pause), lightRed = atStation.length > 0 && atStation.every(f => f.trs[0].top === R);
  const green = a.frames.some(f => f.trs[0].p === 6 && f.trs[0].top === G);
  ok(doneAll(a) && !doneAll(s) && lightRed && green, `The red signal: the sensor event stops Bramble at the red signal every lap with a red light, green after the farm (${jobs(a)}); the starter drives past (${jobs(s)})`);
}
{ // 8 Which platform? if key space pressed → right (the loop with the station), else straight
  const id = 'rail-8-platform', loop = [18, 19];
  const aNo = play(L.ANSWERS[id], L.PLAY[id]), aYes = play(L.ANSWERS[id], { ...L.PLAY[id], hold: ['space'] });
  const sNo = play(L.STARTERS[id], L.PLAY[id]), sYes = play(L.STARTERS[id], { ...L.PLAY[id], hold: ['space'] });
  ok(visited(aYes, loop) && !visited(aNo, loop) && !visited(sYes, loop) && !visited(sNo, loop) && events(aYes, 'split').length >= 1,
    'Which platform?: with if … else, holding space at the yellow marker sends Bramble round the loop to the station and not holding it keeps it on the main line; the starter always goes straight');
}
{ // 9 Into the shed: drive backward until the sensor sees red, then stop — not into the buffers
  const [s, a] = both('rail-9-shed');
  ok(doneAll(a) && !doneAll(s) && events(a, 'end').length === 0 && events(s, 'end').length === 1, `Into the shed: “wait until sensor color = red” stops Bramble on the marker (${jobs(a)}); the starter backs into the buffers (${jobs(s)})`);
}
{ // 10 The speed check: forever { if speed > 50 → red, else green }
  const [s, a] = both('rail-10-speed');
  const agree = r => { const fs = r.frames.slice(1).filter((f, k) => Math.abs(f.trs[0].cms - r.frames[k].trs[0].cms) < 2); const fast = fs.filter(f => f.trs[0].cms > 52), slow = fs.filter(f => f.trs[0].cms < 48);
    return { fast: fast.length, ok: fast.length > 30 && slow.length > 30 && fast.every(f => f.trs[0].top === R) && slow.every(f => f.trs[0].top === G) }; };
  const ga = agree(a), gs = agree(s);
  ok(ga.ok && !gs.ok, `The speed check: inside forever, if speed > 50 keeps the light red when fast and green when slow, all the time (${ga.fast} fast frames); the starter’s light stays green`);
}
{ // 11 The faulty signal box: three bugs (green instead of red; the if … else ways swapped; < instead of >)
  const id = 'rail-11-debug', loop = [18, 19];
  const check = p => {
    const no = play(p, L.PLAY[id]), yes = play(p, { ...L.PLAY[id], hold: ['space'] });
    const fs = no.frames.slice(1).filter((f, k) => Math.abs(f.trs[0].cms - no.frames[k].trs[0].cms) < 2);
    const light = fs.some(f => f.trs[0].cms > 52) && fs.filter(f => f.trs[0].cms > 52).every(f => f.trs[0].top === R) && fs.filter(f => f.trs[0].cms < 48).every(f => f.trs[0].top === G);
    return { stops: doneAll(no), way: visited(yes, loop) && !visited(no, loop), light };
  };
  const s = check(L.STARTERS[id]), a = check(L.ANSWERS[id]);
  ok(a.stops && a.way && a.light && !s.stops && !s.way && !s.light, 'The faulty signal box: with all three bugs fixed it stops at the red signal, the space key picks the loop and the speed light is right; the starter gets all three wrong ' + JSON.stringify(s));
}
{ // 12 Project: the junction controller — the example uses an event, if … else, a loop and a marker, and does its challenge
  const ex = L.EXAMPLES['rail-12-project'], st = L.STARTERS['rail-12-project'];
  const crit = p => { const r = play(p, L.PLAY['rail-12-project']); return p.pieces.some(q => /^split/.test(q[0])) && p.pieces.some(q => q[4]) && blocksOf(p, 't1_whenColorChanged', 'controls_if', 'tr_forever', 'logic_compare', 't1_setNextSplitDecision')
    && JSON.stringify(p.blocks).includes('hasElse') && doneAll(r) && visited(r, [18, 19]); };
  ok(crit(ex) && !crit(st), 'Project · the junction controller: the example’s marker, sensor event, if … else and forever loop do its whole challenge (via the loop); the starter has none of it');
}

// ── Block 3 · Running the railway (Years 5–6)
{ // 13 Smart trains (adopted): laps goes up at the station; after lap 3 the split sends it to the depot (the loop)
  const st = starterJSON('smart-trains'), ans = { ...st, blocks: L.ANSWERS['smart-trains'] };
  const s = play(st, { secs: 50 }), a = play(ans, { secs: 50 });
  const firstLoop = r => r.frames.find(f => [18, 19].includes(f.trs[0].p));
  const f = firstLoop(a);
  ok(f && f.vars.laps === 3 && !firstLoop(s), `Smart trains: laps counts each lap and the if … else sends it to the depot after lap 3 (laps = ${f && f.vars.laps}); the starter never goes there`);
}
{ // 14 Lap times: the lap time variable = how long one lap took (timer, then reset timer); faster speed → shorter laps
  const [s, a] = both('rail-14-laps');
  const reds = a.log.filter(e => e.k === 'colour' && e.d === 'red').map(e => e.t);
  const laps = []; a.frames.forEach(f => { const v = f.vars['lap time']; if (v !== undefined && v !== laps[laps.length - 1]) laps.push(v); });
  const real = reds.length >= 2 ? reds[1] - reds[0] : 0, got = laps.filter(x => x > 0);
  const fast = clone(L.ANSWERS['rail-14-laps']); JSON.stringify(fast); fast.blocks.blocks.blocks[0].next.block.next.block.inputs.SPEED = { shadow: { type: 'math_number', fields: { NUM: 60 } } };
  const af = play(fast, L.PLAY['rail-14-laps']), fl = []; af.frames.forEach(f => { const v = f.vars['lap time']; if (v && v !== fl[fl.length - 1]) fl.push(v); });
  ok(got.length >= 2 && Math.abs(got[1] - real) < 0.1 && s.frames.every(f => f.vars['lap time'] === undefined) && fl[1] < got[1] * 0.6,
    `Lap times: “set lap time to timer, reset timer” at the timing line measures each lap (${got[1]} s, really ${real.toFixed(2)} s); at 60 cm/s a lap takes ${fl[1]} s; the starter measures nothing`);
}
{ // 15 The connection: Fern leaves only when Bramble's message says it has arrived
  const [s, a] = both('rail-15-connect');
  const arrive = r => r.log.filter(e => e.i === 0 && e.k === 'colour' && e.d === 'red').map(e => e.t);
  const leaves = r => { const out = []; r.frames.forEach((f, k) => { if (k && r.frames[k - 1].trs[1].v === 0 && f.trs[1].v > 0) out.push(f.t); }); if (r.frames[0].trs[1].v > 0) out.unshift(0); return out; };
  const ar = arrive(a), lv = leaves(a), ls = leaves(s), as = arrive(s);
  const matched = lv.length >= 3 && lv.every(t => ar.some(x => t >= x && t - x < 0.3));
  ok(matched && ls[0] < as[0] && ls.length === 1, `The connection: Fern sets off each time Bramble broadcasts “connection” at the station (${lv.length} times, each within 0.3 s); in the starter she leaves at once, before Bramble arrives, and never again`);
}
{ // 16 The express test: a variable as the speed; 10 cm/s faster every lap; it stops after the 60 cm/s lap
  const [s, a] = both('rail-16-express');
  // as pupils build it: a real number block (from Operators) in “set test speed to”, not a shadow
  const real = clone(L.ANSWERS['rail-16-express']); real.blocks.blocks.blocks[0].next.block.inputs.VALUE = { block: { type: 'math_number', fields: { NUM: 20 } } };
  ok(play(real, L.PLAY['rail-16-express']).frames.some(f => f.vars['test speed'] === 20), 'a number block from Operators sets a variable (set test speed to 20)');
  const cruise = r => { const out = []; r.frames.forEach(f => { const v = f.trs[0].cms; if (f.trs[0].v > 0 && r.frames.filter(g => Math.abs(g.t - f.t) < 0.5).every(g => g.trs[0].cms === v) && out[out.length - 1] !== v) out.push(v); }); return out; };
  const ca = cruise(a), cs = cruise(s), last = a.frames[a.frames.length - 1];
  const station = a.sim.geoms[1].paths[0].at(0.5), me = a.sim.pose(0);
  ok(ca.join() === '20,30,40,50,60' && last.trs[0].v === 0 && last.vars['test speed'] === 70 && Math.hypot(me.x - station.x, me.y - station.y) < 0.8 && cs.join() === '20',
    `The express test: the speed variable goes 20, 30, 40, 50, 60 cm/s lap by lap (${ca}), then it stops at the station; the starter stays at ${cs}`);
}
{ // 17 The evening timetable: three bugs (trips reset in the event, a misspelt message, > instead of ≥)
  const [s, a] = both('rail-17-debug');
  const fernGoes = r => { let n = 0; r.frames.forEach((f, k) => { if (k && r.frames[k - 1].trs[1].v === 0 && f.trs[1].v > 0) n++; }); return n; };
  const last = r => r.frames[r.frames.length - 1];
  ok(doneAll(a) && last(a).vars.trips === 3 && fernGoes(a) === 3 && !doneAll(s) && fernGoes(s) === 0 && last(s).vars.trips === 1,
    `The evening timetable: fixed, Bramble makes 3 trips and stays at the station, and Fern sets off after each (${jobs(a)}, Fern ${fernGoes(a)}×); the starter never stops and Fern never goes (${jobs(s)})`);
  // each bug on its own
  const fix = (n) => { const p = clone(L.STARTERS['rail-17-debug']), red = p.blocks.blocks.blocks[1];
    if (n === 0) red.next = red.next.block.next; // take out the extra “set trips to 0”
    return p; };
  const one = play(fix(0), L.PLAY['rail-17-debug']);
  ok(last(one).vars.trips >= 4 && fernGoes(one) === 0, 'The evening timetable: fixing only the reset makes trips count, but with > 3 it goes round once too often and Fern still waits (the message is misspelt)');
}
{ // 18 Project: Brindlewick open day — the example uses a variable, a message, if … else and sensor events for both trains
  const ex = L.EXAMPLES['rail-18-project'], st = L.STARTERS['rail-18-project'];
  const crit = p => { const r = play(p, L.PLAY['rail-18-project']); let fern = 0; r.frames.forEach((f, k) => { if (k && r.frames[k - 1].trs[1].v === 0 && f.trs[1].v > 0) fern++; });
    return p.trains.length === 2 && blocksOf(p, 'variables_set', 'math_change', 'tr_broadcast', 'tr_when_message', 'controls_if', 't1_whenColorChanged', 't2_startDriving') && doneAll(r) && fern >= 2 && errorsIn(r).length === 0; };
  ok(crit(ex) && !crit(st), 'Project · open day: the example’s two trains, variable, message and if … else do its whole challenge, and Fern runs when Bramble calls; the starter has none of it');
}
// no answer or example throws an error in the runner
{
  const all = [...Object.entries(L.ANSWERS).filter(([k]) => k !== 'smart-trains'), ...Object.entries(L.EXAMPLES)];
  const bad = all.filter(([id, p]) => errorsIn(play(p, L.PLAY[id] || {})).length);
  ok(bad.length === 0, 'every answer and example runs with no errors' + (bad.length ? ': ' + bad.map(b => b[0]).join(', ') : ''));
}

if (ONLY_CODE) done();
// ───────── in the app: every starter opens with its Lesson card ─────────
const { LESSONS: ALL } = await imp('lessons/lessons.js');
const UNIT = U.LESSONS.map(x => ALL.find(l => l.id === (x.adopt || x.id))).filter(Boolean);
const site = await serve();
const b = await browser();
const errors = [];
try {
  const { page } = await openApp(b, site.url, { errors });
  // (the first one, Lay the line, has a challenge: a challenge as the first Train Lab project used to stop the lab opening)
  for (const l of UNIT) {
    await page.evaluate(id => { clearDirty(); lessonOpenStarter(id); }, l.id); // not returned: a big starter’s promise can be collected
    await page.waitForFunction(id => lessonActive && lessonActive.id === id, l.id, { timeout: 60000 });
    await page.waitForFunction(() => projectType === 'train' && trainApp && trainApp._ws() && trainApp._sim(), null, { timeout: 60000 });
    const want = starterJSON(l.id);
    await page.waitForFunction(n => trainApp._proj().pieces.length === n, want.pieces.length, { timeout: 20000 }).catch(() => {});
    const st = await page.evaluate(() => ({ card: !document.getElementById('lesson-guide').classList.contains('hide'), pieces: trainApp._proj().pieces.length,
      tops: trainApp._ws().getTopBlocks(false).length, trains: trainApp._proj().trains.length, title: document.getElementById('lesson-guide').textContent,
      jobs: document.getElementById('tlCheck').hidden ? 0 : document.querySelectorAll('#tlCheck li').length }));
    const tops = ((want.blocks && want.blocks.blocks && want.blocks.blocks.blocks) || []).length, jobsWant = want.challenge ? want.challenge.steps.length : 0;
    ok(st.card && st.pieces === want.pieces.length && st.tops === tops && st.trains === want.trains.length && st.jobs === jobsWant && st.title.includes(l.title),
      `${l.id}: the starter opens in the Train Lab with its Lesson card (${st.pieces} pieces, ${st.tops} scripts, ${st.jobs} jobs)`);
  }
  // the number block in Operators (added for this unit: “set test speed to 20” needs a number to put in its gap)
  const ops = await page.evaluate(() => { const c = trainApp._ws().getToolbox().getToolboxItems().find(x => x.getName && x.getName() === 'Operators'); return c.getContents().map(x => x.type); });
  ok(ops[0] === 'math_number', 'the Train Lab’s Operators category starts with a number block (for “set … to 20”)');
  // one answer end to end in the real app: the red signal stops Bramble at the station with a red light, and the jobs tick off
  await page.evaluate(p => { trainApp.setProject(p); trainApp.run(); }, L.ANSWERS['rail-7-signal']);
  await page.waitForFunction(() => trainApp._checker() && trainApp._checker().complete(), null, { timeout: 60000 });
  const app = await page.evaluate(() => ({ text: document.getElementById('tlCheck').textContent, top: trainApp._sim().trains[0].top }));
  ok(/Challenge complete/.test(app.text) && app.top, 'The red signal’s answer runs in the real Train Lab and every job ticks off: ' + app.top);
  // and a Years 5–6 one: the connection, with Fern's moves following Bramble's message
  await page.evaluate(() => trainApp.stop());
  await page.evaluate(p => { trainApp.setProject(p); trainApp.run(); }, L.ANSWERS['rail-15-connect']);
  await page.waitForFunction(() => trainApp._sim().trains[1].dist > 2, null, { timeout: 60000 });
  ok(await page.evaluate(() => trainApp._sim().trains[0].dist > 3), 'The connection’s answer runs in the real Train Lab: Fern sets off once Bramble has reached the station');
  await page.evaluate(() => trainApp.stop());
  ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
