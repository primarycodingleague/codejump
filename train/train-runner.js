/* CodeJump · Train Lab — runs every train's blocks against the simulator (train-model.js createSim).
 * No DOM: sound and keys come in through `io`, so the runner also works in Node tests.
 *
 *   const run = createRunner(sim, io);
 *   run.start([workspaceForTrain0, workspaceForTrain1, …]) · run.tick(dt) every frame (also moves the trains)
 *   run.event(i, kind, data) (wire to createSim's onEvent) · run.tap(i) · run.key(name) · run.stop() · run.running()
 *
 * Each script is a generator ("fiber"): one step per tick, and every loop pass and wait yields, so a forever loop never
 * freezes the page. Variables are shared by all the trains (by name), like Scratch's "for all sprites".
 */
import { SPEEDS, MAX_SPEED } from './train-model.js';
import { HATS } from './train-blocks.js';

const STOP = { stop: true };
const numOf = v => { const n = Number(v); return isFinite(n) ? n : 0; };

export function createRunner(sim, io = {}) {
  let fibers = [], live = false, t = 0, timerBase = 0, vars = Object.create(null), hats = [];
  const queue = [];

  const field = (b, n) => b.getFieldValue(n);
  const input = (b, n) => b.getInputTargetBlock(n);
  const varName = (b, n = 'VAR') => { const id = field(b, n); const v = b.workspace.getVariableById(id); return v ? v.name : String(id); };

  function val(b, me) {
    if (!b) return 0;
    const tr = sim.trains[me];
    switch (b.type) {
      case 'math_number': return numOf(field(b, 'NUM'));
      case 'text': return String(field(b, 'TEXT') ?? '');
      case 'logic_boolean': return field(b, 'BOOL') === 'TRUE';
      case 'math_arithmetic': {
        const a = numOf(val(input(b, 'A'), me)), c = numOf(val(input(b, 'B'), me));
        switch (field(b, 'OP')) { case 'ADD': return a + c; case 'MINUS': return a - c; case 'MULTIPLY': return a * c; case 'DIVIDE': return c ? a / c : 0; case 'POWER': return Math.pow(a, c); }
        return 0;
      }
      case 'math_round': { const a = numOf(val(input(b, 'NUM'), me)); const op = field(b, 'OP'); return op === 'ROUNDUP' ? Math.ceil(a) : op === 'ROUNDDOWN' ? Math.floor(a) : Math.round(a); }
      case 'math_modulo': { const a = numOf(val(input(b, 'DIVIDEND'), me)), c = numOf(val(input(b, 'DIVISOR'), me)); return c ? ((a % c) + c) % c : 0; }
      case 'tr_random': { let a = Math.round(numOf(val(input(b, 'A'), me))), c = Math.round(numOf(val(input(b, 'B'), me))); if (a > c) [a, c] = [c, a]; return a + Math.floor(Math.random() * (c - a + 1)); }
      case 'logic_compare': {
        let a = val(input(b, 'A'), me), c = val(input(b, 'B'), me);
        const bothNum = a !== '' && c !== '' && isFinite(Number(a)) && isFinite(Number(c));
        if (bothNum) { a = Number(a); c = Number(c); } else { a = String(a).toLowerCase(); c = String(c).toLowerCase(); }
        switch (field(b, 'OP')) { case 'EQ': return a === c; case 'NEQ': return a !== c; case 'LT': return a < c; case 'LTE': return a <= c; case 'GT': return a > c; case 'GTE': return a >= c; }
        return false;
      }
      case 'logic_operation': { const a = !!val(input(b, 'A'), me), c = !!val(input(b, 'B'), me); return field(b, 'OP') === 'AND' ? a && c : a || c; }
      case 'logic_negate': return !val(input(b, 'BOOL'), me);
      case 'text_join': { let s = ''; for (let i = 0; b.getInput('ADD' + i); i++) s += String(val(input(b, 'ADD' + i), me)); return s; }
      case 'variables_get': { const v = vars[varName(b)]; return v === undefined ? 0 : v; }
      case 'tr_last_colour': return tr ? tr.lastColour : '';
      case 'tr_saw': return !!tr && tr.lastColour === field(b, 'COL');
      case 'tr_speed': return tr ? Math.round(tr.v / MAX_SPEED * 100) : 0;
      case 'tr_moving': return !!tr && tr.v > 0.001;
      case 'tr_distance': return tr ? Math.round(tr.dist * 10) / 10 : 0;
      case 'tr_key_pressed': return !!(io.keyDown && io.keyDown(field(b, 'KEY')));
      case 'tr_timer': return Math.round((t - timerBase) * 100) / 100;
      default: return 0;
    }
  }

  function* waitSecs(s) { const end = t + Math.max(0, s); while (t < end) yield; }
  function* brake(me) { sim.setTarget(me, 0); const tr = sim.trains[me]; while (tr && tr.on && tr.v > 0) yield; }
  function sound(name) { return io.sound ? numOf(io.sound(name)) : 0; }

  function* run(b, me) { // one statement, for train `me`
    const tr = sim.trains[me];
    switch (b.type) {
      // drive
      case 'tr_drive': sim.setTarget(me, SPEEDS[field(b, 'SPEED')] || SPEEDS.medium); break;
      case 'tr_set_speed': sim.setTarget(me, Math.max(0, Math.min(100, numOf(val(input(b, 'N'), me)))) / 100 * MAX_SPEED); break;
      case 'tr_drive_pieces': {
        if (!tr || !tr.on) break;
        const goal = tr.dist + Math.max(0, numOf(val(input(b, 'N'), me))), v = SPEEDS[field(b, 'SPEED')] || SPEEDS.medium;
        sim.setTarget(me, v);
        // brake in time to stop close to the goal (braking distance v²/2a)
        while (tr.on && !tr.ended && tr.dist < goal - (tr.v * tr.v) / (2 * 2.6) - 0.01) yield;
        yield* brake(me); break;
      }
      case 'tr_stop': yield* brake(me); break;
      case 'tr_stop_for': { const was = tr ? tr.vt : 0; yield* brake(me); yield* waitSecs(numOf(val(input(b, 'S'), me))); if (was > 0) sim.setTarget(me, was); break; }
      case 'tr_turn_around': { const was = tr ? tr.vt || tr.cruise || 0 : 0; yield* brake(me); sim.turnAround(me); if (was > 0) sim.setTarget(me, was); break; }
      case 'tr_next_split': if (tr) tr.next = field(b, 'WAY'); break;
      case 'tr_every_split': if (tr) tr.dflt = field(b, 'WAY'); break;
      // lights & sound
      case 'tr_headlight': if (tr) tr.head = field(b, 'COL'); break;
      case 'tr_toplight': if (tr) tr.top = field(b, 'COL'); break;
      case 'tr_lights_off': { const w = field(b, 'WHICH'); if (tr) { if (w !== 'top') tr.head = null; if (w !== 'head') tr.top = null; } break; }
      case 'tr_sound': sound(field(b, 'SND')); break;
      case 'tr_sound_wait': yield* waitSecs(sound(field(b, 'SND'))); break;
      case 'tr_reset_timer': timerBase = t; break;
      // control
      case 'tr_wait': yield* waitSecs(numOf(val(input(b, 'S'), me))); break;
      case 'tr_wait_until': while (!val(input(b, 'COND'), me)) yield; break;
      case 'tr_forever': for (;;) { yield* seq(input(b, 'DO'), me); yield; }
      case 'controls_repeat_ext': { const n = Math.floor(numOf(val(input(b, 'TIMES'), me))); for (let i = 0; i < n; i++) { yield* seq(input(b, 'DO'), me); yield; } break; }
      case 'controls_whileUntil': { const until = field(b, 'MODE') === 'UNTIL'; while (until ? !val(input(b, 'BOOL'), me) : !!val(input(b, 'BOOL'), me)) { yield* seq(input(b, 'DO'), me); yield; } break; }
      case 'controls_if': {
        for (let i = 0; b.getInput('IF' + i); i++) if (val(input(b, 'IF' + i), me)) { yield* seq(input(b, 'DO' + i), me); return; }
        if (b.getInput('ELSE')) yield* seq(input(b, 'ELSE'), me);
        break;
      }
      case 'tr_stop_all': throw STOP;
      case 'tr_send': broadcast(field(b, 'MSG')); break;
      // variables
      case 'variables_set': vars[varName(b)] = val(input(b, 'VALUE'), me); break;
      case 'math_change': { const n = varName(b); vars[n] = numOf(vars[n]) + numOf(val(input(b, 'DELTA'), me)); break; }
      default: break;
    }
  }
  function* seq(b, me) { while (b) { if (!b.isEnabled || b.isEnabled()) yield* run(b, me); b = b.getNextBlock(); } }

  function spawn(h) {
    // starting a script that is already running starts it again from the top (like Scratch)
    fibers = fibers.filter(f => f.h !== h);
    fibers.push({ h, g: seq(h.block.getNextBlock(), h.me) });
  }
  const hatsOf = (type, me) => hats.filter(h => h.type === type && (me == null || h.me === me));
  function broadcast(msg) { const m = String(msg).trim().toLowerCase(); for (const h of hatsOf('tr_when_message')) if (String(h.block.getFieldValue('MSG')).trim().toLowerCase() === m) spawn(h); }

  const api = {
    start(workspaces) {
      api.stop(true);
      live = true; t = 0; timerBase = 0; vars = Object.create(null); hats = []; queue.length = 0;
      sim.reset();
      (workspaces || []).forEach((ws, me) => {
        if (!ws || !sim.trains[me]) return;
        for (const v of ws.getAllVariables()) if (!(v.name in vars)) vars[v.name] = 0;
        for (const top of ws.getTopBlocks(true)) {
          if (!HATS.includes(top.type) || (top.isEnabled && !top.isEnabled())) continue;
          const h = { type: top.type, block: top, me };
          hats.push(h);
        }
      });
      for (const h of hatsOf('tr_when_run')) spawn(h);
    },
    // events from the simulator are queued and started on the next tick (so a script never starts inside another's step)
    event(me, kind, data) {
      if (!live) return;
      queue.push([me, kind, data]);
    },
    tick(dt) {
      if (!live) return;
      t += dt;
      for (const f of fibers.slice()) {
        if (f.done) continue;
        try { const r = f.g.next(); if (r.done) f.done = true; }
        catch (e) {
          if (e === STOP) { api.stop(); return; }
          f.done = true; if (io.onError) io.onError(e);
        }
      }
      fibers = fibers.filter(f => !f.done);
      sim.step(dt);
      while (queue.length) {
        const [me, kind, data] = queue.shift();
        if (kind === 'colour') { for (const h of hatsOf('tr_when_colour', me)) { const c = h.block.getFieldValue('COL'); if (c === 'any' || c === data) spawn(h); } }
        else if (kind === 'split') hatsOf('tr_when_split', me).forEach(spawn);
        else if (kind === 'end') hatsOf('tr_when_end', me).forEach(spawn);
        else if (kind === 'bump') hatsOf('tr_when_bump', me).forEach(spawn);
      }
    },
    tap(me) { if (live) hatsOf('tr_when_tapped', me).forEach(spawn); },
    key(name) { if (live) for (const h of hatsOf('tr_when_key')) if (h.block.getFieldValue('KEY') === name) spawn(h); },
    stop(quietly) {
      const was = live;
      fibers = []; live = false; queue.length = 0;
      for (const tr of sim.trains) { tr.vt = 0; tr.v = 0; }
      if (was && !quietly && io.onStop) io.onStop();
    },
    running: () => live,
    busy: () => live && (fibers.length > 0 || sim.trains.some(tr => tr.v > 0)),
    _vars: () => vars, _t: () => t
  };
  return api;
}
