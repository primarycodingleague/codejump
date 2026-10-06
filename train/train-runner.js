/* CodeJump · Train Lab — runs the program (one Blockly workspace, with a block category per train) against the simulator.
 * No DOM: sound and keys come in through `io`, so the runner also works in Node tests.
 *
 *   const run = createRunner(sim, io);
 *   run.start(workspace) · run.tick(dt) every frame (also moves the trains) · run.event(i, kind, data) (wire to createSim's
 *   onEvent) · run.key(name) · run.stop() · run.running()
 *
 * Each script is a generator ("fiber"): one step per tick, and every loop pass and wait yields, so a forever loop never
 * freezes the page. Train hats ("when movement …", "when … seen", …) work like the Scratch extension's: they are checked
 * every tick and start their script when they turn from false to true. A train with no blocks of its own just drives when
 * Run is pressed and obeys the snaps — like pressing the button on a real train.
 */
import { SPEEDS, CM } from './train-model.js';
import { HATS, TRAIN_HATS, parseType, colourOfNum, COLOUR_NUM, LED } from './train-blocks.js';

const STOP = { stop: true };
const numOf = v => { const n = Number(v); return isFinite(n) ? n : 0; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hex = (r, g, b) => '#' + [r, g, b].map(v => clamp(Math.round(numOf(v)), 0, 255).toString(16).padStart(2, '0')).join('');
function hsv(h) { // hue 0–100 → a full, bright colour
  h = ((numOf(h) % 100) + 100) % 100 * 3.6; const f = n => { const k = (n + h / 60) % 6; return 255 * (1 - Math.max(0, Math.min(k, 4 - k, 1))); };
  return hex(f(5), f(3), f(1));
}
const SPLIT_NUM = { left: 1, right: 2, straight: 3 };
const NUM_SPLIT = { 1: 'left', 2: 'right', 3: 'straight' };

export function createRunner(sim, io = {}) {
  let fibers = [], live = false, t = 0, timerBase = 0, vars = Object.create(null), hats = [], ws = null;
  let events = sim.trains.map(() => []), pending = sim.trains.map(() => []);

  const field = (b, n) => b.getFieldValue(n);
  const input = (b, n) => b.getInputTargetBlock(n);
  const varName = (b, n = 'VAR') => { const id = field(b, n); const v = b.workspace.getVariableById(id); return v ? v.name : String(id); };
  const TR = i => sim.trains[i];
  const dirOf = tr => (!tr || !tr.on || tr.v <= 0.001 ? 0 : tr.back ? -1 : 1);

  function val(b) {
    if (!b) return 0;
    const p = parseType(b.type);
    if (p) {
      const tr = TR(p.train); if (!tr) return 0;
      switch (p.op) {
        case 'getDirection': return dirOf(tr);
        case 'getSpeedCmps': return Math.round(tr.v * CM);
        case 'getOdometerCm': return Math.floor((tr.dist - tr.odo0) * CM);
        case 'getNextSplitDecision': return SPLIT_NUM[tr.next] || 0;
        case 'getLastSplitDecision': return SPLIT_NUM[tr.lastTurn] || 0;
        case 'splitDecisions': return numOf(field(b, 'SIDE'));
        case 'getSensorColor': return COLOUR_NUM[tr.sensor] || 0;
        case 'classifiedColor': return numOf(field(b, 'COLOR'));
        default: return 0;
      }
    }
    switch (b.type) {
      case 'math_number': return numOf(field(b, 'NUM'));
      case 'text': return String(field(b, 'TEXT') ?? '');
      case 'logic_boolean': return field(b, 'BOOL') === 'TRUE';
      case 'math_arithmetic': {
        const a = numOf(val(input(b, 'A'))), c = numOf(val(input(b, 'B')));
        switch (field(b, 'OP')) { case 'ADD': return a + c; case 'MINUS': return a - c; case 'MULTIPLY': return a * c; case 'DIVIDE': return c ? a / c : 0; case 'POWER': return Math.pow(a, c); }
        return 0;
      }
      case 'math_round': { const a = numOf(val(input(b, 'NUM'))); const op = field(b, 'OP'); return op === 'ROUNDUP' ? Math.ceil(a) : op === 'ROUNDDOWN' ? Math.floor(a) : Math.round(a); }
      case 'math_modulo': { const a = numOf(val(input(b, 'DIVIDEND'))), c = numOf(val(input(b, 'DIVISOR'))); return c ? ((a % c) + c) % c : 0; }
      case 'tr_random': { let a = Math.round(numOf(val(input(b, 'A')))), c = Math.round(numOf(val(input(b, 'B')))); if (a > c) [a, c] = [c, a]; return a + Math.floor(Math.random() * (c - a + 1)); }
      case 'logic_compare': {
        let a = val(input(b, 'A')), c = val(input(b, 'B'));
        const bothNum = a !== '' && c !== '' && isFinite(Number(a)) && isFinite(Number(c));
        if (bothNum) { a = Number(a); c = Number(c); } else { a = String(a).toLowerCase(); c = String(c).toLowerCase(); }
        switch (field(b, 'OP')) { case 'EQ': return a === c; case 'NEQ': return a !== c; case 'LT': return a < c; case 'LTE': return a <= c; case 'GT': return a > c; case 'GTE': return a >= c; }
        return false;
      }
      case 'logic_operation': { const a = !!val(input(b, 'A')), c = !!val(input(b, 'B')); return field(b, 'OP') === 'AND' ? a && c : a || c; }
      case 'logic_negate': return !val(input(b, 'BOOL'));
      case 'text_join': { let s = ''; for (let i = 0; b.getInput('ADD' + i); i++) s += String(val(input(b, 'ADD' + i))); return s; }
      case 'variables_get': { const v = vars[varName(b)]; return v === undefined ? 0 : v; }
      case 'tr_key_pressed': return !!(io.keyDown && io.keyDown(field(b, 'KEY')));
      case 'tr_timer': return Math.round((t - timerBase) * 100) / 100;
      default: return 0;
    }
  }

  function* waitSecs(s) { const end = t + Math.max(0, s); while (t < end) yield; }
  function setLed(tr, group, col) {
    if (group === LED.top) tr.top = col; else if (group === LED.head) tr.head = col; else if (group === LED.tail) tr.tail = col;
  }
  // speed in cm/s like the real train: 10–100, anything 0 or less stops it
  const speed = cms => (cms <= 0 ? 0 : clamp(cms, 10, 100) / CM);

  function* trainStatement(b, p) {
    const i = p.train, tr = TR(i); if (!tr) return;
    switch (p.op) {
      case 'startDriving': sim.drive(i, numOf(field(b, 'DIRECTION')) < 0, speed(numOf(val(input(b, 'SPEED'))))); break;
      case 'moveFixedDistance': {
        const cm = numOf(val(input(b, 'DISTANCE'))); if (cm <= 0 || !tr.on) break;
        sim.drive(i, numOf(field(b, 'DIRECTION')) < 0, speed(numOf(val(input(b, 'SPEED')))));
        const goal = tr.dist + cm / CM;
        while (tr.on && !tr.ended && tr.vt > 0 && tr.dist < goal) yield;
        sim.setTarget(i, 0); break;
      }
      case 'stopDriving': sim.setTarget(i, 0); break;
      case 'pauseDriving': sim.stopFor(i, clamp(numOf(val(input(b, 'TIME'))), 0, 25.5)); break;
      case 'resetOdometer': tr.odo0 = tr.dist; break;
      case 'decoupleWagon': sim.decouple(i); yield* waitSecs(1.5); break; // like the real train, it takes a moment
      case 'setLedColorPicker': setLed(tr, numOf(field(b, 'LEDGROUP')), field(b, 'COLOR')); break;
      case 'setLedHue': setLed(tr, numOf(field(b, 'LEDGROUP')), hsv(val(input(b, 'HUE')))); break;
      case 'setLedColor': setLed(tr, numOf(field(b, 'LEDGROUP')), hex(val(input(b, 'RED')), val(input(b, 'GREEN')), val(input(b, 'BLUE')))); break;
      case 'setNextSplitDecision': tr.next = NUM_SPLIT[numOf(field(b, 'SIDE'))] || null; break;
      case 'clearCustomSnapCommands': break;
      case 'setSnapExecution': tr.snapsOn = numOf(field(b, 'STATUS')) !== 0; break;
      case 'setSnapBehaviorFeedback': tr.feedbackSound = numOf(field(b, 'SOUNDS')) !== 0; tr.feedbackLights = numOf(field(b, 'LIGHTS')) !== 0; break;
      default: break;
    }
  }

  function* run(b) { // one statement
    const p = parseType(b.type);
    if (p) { yield* trainStatement(b, p); return; }
    switch (b.type) {
      case 'tr_reset_timer': timerBase = t; break;
      case 'tr_wait': yield* waitSecs(numOf(val(input(b, 'S')))); break;
      case 'tr_wait_until': while (!val(input(b, 'COND'))) yield; break;
      case 'tr_forever': for (;;) { yield* seq(input(b, 'DO')); yield; }
      case 'controls_repeat_ext': { const n = Math.floor(numOf(val(input(b, 'TIMES')))); for (let i = 0; i < n; i++) { yield* seq(input(b, 'DO')); yield; } break; }
      case 'controls_whileUntil': { const until = field(b, 'MODE') === 'UNTIL'; while (until ? !val(input(b, 'BOOL')) : !!val(input(b, 'BOOL'))) { yield* seq(input(b, 'DO')); yield; } break; }
      case 'controls_if': {
        for (let i = 0; b.getInput('IF' + i); i++) if (val(input(b, 'IF' + i))) { yield* seq(input(b, 'DO' + i)); return; }
        if (b.getInput('ELSE')) yield* seq(input(b, 'ELSE'));
        break;
      }
      case 'tr_stop_all': throw STOP;
      case 'tr_broadcast': broadcast(field(b, 'MSG')); break;
      case 'tr_broadcast_wait': { const started = broadcast(field(b, 'MSG')); while (started.some(f => !f.done && fibers.includes(f))) yield; break; }
      case 'variables_set': vars[varName(b)] = val(input(b, 'VALUE')); break;
      case 'math_change': { const n = varName(b); vars[n] = numOf(vars[n]) + numOf(val(input(b, 'DELTA'))); break; }
      default: break;
    }
  }
  function* seq(b) { while (b) { if (!b.isEnabled || b.isEnabled()) yield* run(b); b = b.getNextBlock(); } }

  function spawn(h) {
    // starting a script that is already running starts it again from the top (like Scratch)
    fibers = fibers.filter(f => f.h !== h);
    const f = { h, g: seq(h.block.getNextBlock()) }; fibers.push(f); return f;
  }
  function broadcast(msg) { const m = String(msg).trim().toLowerCase(); return hats.filter(h => h.type === 'tr_when_message' && String(h.block.getFieldValue('MSG')).trim().toLowerCase() === m).map(spawn); }

  // ── train hats: true/false each tick, from the train's state and this tick's events
  const sameSnap = (ev, want) => ev.length === 4 && want.every((c, k) => ev[k] === c);
  function hatTrue(h) {
    const tr = TR(h.p.train); if (!tr || !tr.on) return false;
    const b = h.block, evs = events[h.p.train];
    switch (h.p.op) {
      case 'whenMovement': {
        const m = numOf(b.getFieldValue('MOVEMENT'));
        if (m === 4) return !!tr.pause;
        const d = dirOf(tr); return m === 1 ? d === 1 : m === 2 ? d === -1 : m === 3 ? d === 0 : false;
      }
      case 'whenDistance': return (tr.dist - tr.odo0) * CM >= numOf(val(b.getInputTargetBlock('DISTANCE')));
      case 'whenOnSplitTrack': return evs.some(e => e[0] === 'snap' && e[1][0] === 'cyan');
      case 'whenCustomSnapDetected': { const c = colourOfNum(b.getFieldValue('COLOR')); return evs.some(e => e[0] === 'snap' && sameSnap(e[1], ['white', 'magenta', c, 'black'])); }
      case 'whenSnapDetected': { const want = ['COLOR1', 'COLOR2', 'COLOR3', 'COLOR4'].map(n => colourOfNum(b.getFieldValue(n))); return evs.some(e => e[0] === 'snap' && sameSnap(e[1], want)); }
      case 'whenColorChanged': return tr.sensor === colourOfNum(b.getFieldValue('COLOR'));
      default: return false;
    }
  }

  const api = {
    start(workspace) {
      api.stop(true);
      ws = workspace; live = true; t = 0; timerBase = 0; vars = Object.create(null); hats = [];
      events = sim.trains.map(() => []); pending = sim.trains.map(() => []);
      sim.reset();
      const own = new Set(); // trains that have blocks of their own
      if (ws) {
        for (const v of ws.getAllVariables()) if (!(v.name in vars)) vars[v.name] = 0;
        for (const b of ws.getAllBlocks(false)) { const p = parseType(b.type); if (p && (!b.isEnabled || b.isEnabled())) own.add(p.train); }
        for (const top of ws.getTopBlocks(true)) {
          if (top.isEnabled && !top.isEnabled()) continue;
          const p = parseType(top.type);
          if (HATS.includes(top.type) || (p && TRAIN_HATS.includes(p.op))) hats.push({ type: top.type, block: top, p, was: false });
        }
      }
      sim.trains.forEach((tr, i) => { if (!own.has(i)) sim.go(i); }); // no blocks for this train: off it goes, like pressing its button
      for (const h of hats) if (h.type === 'tr_when_run') spawn(h);
    },
    event(i, kind, data) { if (live && pending[i]) { pending[i].push([kind, data]); if (kind === 'feedback' && io.sound) io.sound('beep'); } },
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
      events = pending; pending = sim.trains.map(() => []);
      for (const h of hats) {
        if (!h.p) continue;
        const now = !!hatTrue(h);
        if (now && !h.was) spawn(h);
        h.was = now;
      }
    },
    key(name) { if (live) for (const h of hats) if (h.type === 'tr_when_key' && h.block.getFieldValue('KEY') === name) spawn(h); },
    stop(quietly) {
      const was = live;
      fibers = []; live = false;
      for (const tr of sim.trains) { tr.vt = 0; tr.v = 0; tr.pause = null; }
      if (was && !quietly && io.onStop) io.onStop();
    },
    running: () => live,
    busy: () => live && (fibers.length > 0 || sim.trains.some(tr => tr.v > 0)),
    _vars: () => vars, _t: () => t
  };
  return api;
}

export { SPEEDS };
