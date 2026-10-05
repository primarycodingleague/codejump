/* CodeJump · Robot Lab — runs a Blockly workspace's scripts against the robot.
 * No DOM: speech, the "ask" box, keys and the mouse come in through `io`, so the runner also works in Node tests.
 *
 *   const run = createRunner(view, io);   // view = createRobotView(...) or a stand-in with the same methods
 *   run.start(workspace) · run.tick(dt) every frame · run.tap(part) · run.key(name) · run.stop() · run.running()
 *
 * Each script is a generator ("fiber"): one step per tick, and every loop pass, wait and motor move yields, so a
 * forever loop never freezes the page. Blockly's own loop/if/maths/text/variable blocks work too.
 */
import { MOTORS, LIGHTS } from './robot-model.js';
import { FACES, LOOKS, VOICES, HATS } from './robot-blocks.js';

const STOP = { stop: true };
const MOTOR_IDS = new Set(MOTORS.map(m => m[0]));
const numOf = v => { const n = Number(v); return isFinite(n) ? n : 0; };

// a rough mouth shape per letter, so the mouth moves in time with the words
function mouthFor(ch) {
  ch = (ch || '').toLowerCase();
  if ('ao'.includes(ch)) return 8; if ('eu'.includes(ch)) return 6; if ('iy'.includes(ch)) return 4.5;
  if ('mbp'.includes(ch)) return 0.5; if (ch === ' ' || ',.!?'.includes(ch)) return 1; return 3.5;
}

export function createRunner(view, io = {}) {
  let fibers = [], ws = null, vars = Object.create(null), t = 0, timerBase = 0, answer = '', voice = 'robot', live = false;
  let talk = null; // {text, i, next, done, handle}
  const hats = { tap: [], key: [], msg: [] };

  const field = (b, n) => b.getFieldValue(n);
  const input = (b, n) => b.getInputTargetBlock(n);

  function val(b) {
    if (!b) return 0;
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
      case 'rb_random': { let a = Math.round(numOf(val(input(b, 'A')))), c = Math.round(numOf(val(input(b, 'B')))); if (a > c) [a, c] = [c, a]; return a + Math.floor(Math.random() * (c - a + 1)); }
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
      case 'variables_get': { const v = vars[field(b, 'VAR')]; return v === undefined ? 0 : v; }
      case 'rb_speaking': return !!talk;
      case 'rb_answer': return answer;
      case 'rb_position': return Math.round(view.at(field(b, 'M')) * 10) / 10;
      case 'rb_key_pressed': return !!(io.keyDown && io.keyDown(field(b, 'KEY')));
      case 'rb_mouse': { const m = io.mouse ? io.mouse() : { x: 5, y: 5 }; return Math.round((field(b, 'AX') === 'y' ? m.y : m.x) * 10) / 10; }
      case 'rb_timer': return Math.round((t - timerBase) * 100) / 100;
      default: return 0;
    }
  }

  // ── speech: one voice at a time; the mouth follows the letters until the speech ends
  function say(text) {
    stopTalking();
    text = String(text ?? '');
    const v = VOICES[voice] || VOICES.robot;
    const me = { text, i: 0, next: 0, done: false };
    // a safety net for devices without speech: assume ~13 letters a second
    me.until = t + 0.6 + text.length / 13 / (v.rate || 1);
    me.min = t + 0.35 + text.length / 17 / (v.rate || 1); // keep the mouth and bubble going at least this long, even if the device has no voice
    me.handle = io.speak ? io.speak(text, v, () => { me.done = true; }) : null;
    if (!me.handle) me.silent = true;
    talk = me;
    if (io.bubble) io.bubble(text);
    return me;
  }
  function stopTalking() {
    if (talk && talk.handle && talk.handle.cancel) talk.handle.cancel();
    talk = null; view.setTalk(null); if (io.bubble) io.bubble('');
  }
  function talkStep() {
    if (!talk) return;
    if ((talk.done && t >= talk.min) || (talk.silent && t >= talk.until) || t > talk.until + 8) { stopTalking(); return; }
    if (t >= talk.next) { const ch = talk.text[talk.i % Math.max(1, talk.text.length)]; talk.i++; talk.next = t + 0.075; view.setTalk(mouthFor(ch)); }
  }

  function* waitSecs(s) { const end = t + Math.max(0, s); while (t < end) yield; }
  function* moveAndWait(m, v) { view.setTarget(m, v); while (!view.arrived(m)) yield; }

  function* run(b) { // one statement
    switch (b.type) {
      // moves
      case 'rb_move': { const m = field(b, 'M'); if (MOTOR_IDS.has(m)) yield* moveAndWait(m, numOf(val(input(b, 'N')))); break; }
      case 'rb_start_move': { const m = field(b, 'M'); if (MOTOR_IDS.has(m)) view.setTarget(m, numOf(val(input(b, 'N')))); break; }
      case 'rb_change': { const m = field(b, 'M'); if (MOTOR_IDS.has(m)) yield* moveAndWait(m, view.target(m) + numOf(val(input(b, 'N')))); break; }
      case 'rb_move_time': {
        const m = field(b, 'M'); if (!MOTOR_IDS.has(m)) break;
        const to = Math.max(0, Math.min(10, numOf(val(input(b, 'N'))))), secs = Math.max(0, numOf(val(input(b, 'S')))), from = view.at(m), t0 = t;
        while (t - t0 < secs) { view.jump(m, from + (to - from) * ((t - t0) / secs)); yield; }
        view.jump(m, to); break;
      }
      case 'rb_speed': view.setSpeed(field(b, 'M'), numOf(val(input(b, 'N')))); break;
      case 'rb_look': { const L = LOOKS[field(b, 'DIR')] || LOOKS.ahead; for (const m in L) view.setTarget(m, L[m]); while (Object.keys(L).some(m => !view.arrived(m))) yield; break; }
      case 'rb_reset': stopTalking(); view.reset(false); if (io.restyle) io.restyle(); while (MOTORS.some(m => !view.arrived(m[0]))) yield; break;
      // face & lights
      case 'rb_face': { const f = FACES[field(b, 'FACE')] || FACES.normal; for (const m in f.m) view.setTarget(m, f.m[m]); view.setBrowTilt(f.tilt); while (Object.keys(f.m).some(m => !view.arrived(m))) yield; break; }
      case 'rb_blink': view.blink(); yield* waitSecs(0.22); break;
      case 'rb_light': view.setLight(field(b, 'PART'), field(b, 'COL')); break;
      case 'rb_light_off': view.lightsOff(field(b, 'PART')); break;
      case 'rb_body': if (field(b, 'WHAT') === 'trim') view.setAccent(field(b, 'COL')); else view.setBody(field(b, 'COL')); break;
      // speech
      case 'rb_say': say(val(input(b, 'TEXT'))); break;
      case 'rb_say_wait': { const me = say(val(input(b, 'TEXT'))); while (talk === me) yield; break; }
      case 'rb_voice': if (VOICES[field(b, 'V')]) voice = field(b, 'V'); break;
      // sensing
      case 'rb_ask': {
        const q = String(val(input(b, 'TEXT')) ?? ''), me = say(q);
        let got = null; if (io.ask) io.ask(q, a => { got = a == null ? '' : String(a); }); else got = '';
        while (got === null) yield;
        answer = got; if (talk === me) stopTalking(); break;
      }
      case 'rb_reset_timer': timerBase = t; break;
      // control
      case 'rb_wait': yield* waitSecs(numOf(val(input(b, 'S')))); break;
      case 'rb_wait_until': while (!val(input(b, 'COND'))) yield; break;
      case 'rb_forever': for (;;) { yield* seq(input(b, 'DO')); yield; }
      case 'controls_repeat_ext': { const n = Math.floor(numOf(val(input(b, 'TIMES')))); for (let i = 0; i < n; i++) { yield* seq(input(b, 'DO')); yield; } break; }
      case 'controls_whileUntil': { const until = field(b, 'MODE') === 'UNTIL'; while (until ? !val(input(b, 'BOOL')) : !!val(input(b, 'BOOL'))) { yield* seq(input(b, 'DO')); yield; } break; }
      case 'controls_if': {
        for (let i = 0; b.getInput('IF' + i); i++) if (val(input(b, 'IF' + i))) { yield* seq(input(b, 'DO' + i)); return; }
        if (b.getInput('ELSE')) yield* seq(input(b, 'ELSE'));
        break;
      }
      case 'rb_stop': throw STOP;
      case 'rb_send': broadcast(field(b, 'MSG')); break;
      // variables
      case 'variables_set': vars[field(b, 'VAR')] = val(input(b, 'VALUE')); break;
      case 'math_change': vars[field(b, 'VAR')] = numOf(vars[field(b, 'VAR')]) + numOf(val(input(b, 'DELTA'))); break;
      default: break;
    }
  }
  function* seq(b) { while (b) { if (!b.isEnabled || b.isEnabled()) yield* run(b); b = b.getNextBlock(); } }

  function spawn(hat) {
    // starting a script that is already running starts it again from the top (like Scratch)
    fibers = fibers.filter(f => f.hat !== hat.id);
    fibers.push({ hat: hat.id, g: seq(hat.getNextBlock()) });
  }
  function broadcast(msg) { for (const h of hats.msg) if (String(h.getFieldValue('MSG')).trim().toLowerCase() === String(msg).trim().toLowerCase()) spawn(h); }

  const api = {
    start(workspace) {
      api.stop(true);
      ws = workspace; live = true; t = 0; timerBase = 0; answer = ''; voice = 'robot'; vars = Object.create(null);
      for (const v of ws.getAllVariables()) vars[v.getId()] = 0;
      hats.tap = []; hats.key = []; hats.msg = [];
      for (const top of ws.getTopBlocks(true)) {
        if (!HATS.includes(top.type) || (top.isEnabled && !top.isEnabled())) continue;
        if (top.type === 'rb_when_run') spawn(top);
        else if (top.type === 'rb_when_tapped') hats.tap.push(top);
        else if (top.type === 'rb_when_key') hats.key.push(top);
        else if (top.type === 'rb_when_message') hats.msg.push(top);
      }
    },
    tick(dt) {
      if (!live) return;
      t += dt;
      talkStep();
      for (const f of fibers.slice()) {
        if (f.done) continue;
        try { const r = f.g.next(); if (r.done) f.done = true; }
        catch (e) {
          if (e === STOP) { api.stop(); return; }
          f.done = true; if (io.onError) io.onError(e);
        }
      }
      fibers = fibers.filter(f => !f.done);
    },
    tap(part) { if (!live) return; for (const h of hats.tap) { const p = h.getFieldValue('PART'); if (p === 'any' || p === part) spawn(h); } },
    key(name) { if (!live) return; for (const h of hats.key) if (h.getFieldValue('KEY') === name) spawn(h); },
    stop(quietly) {
      fibers = []; live = false; stopTalking(); if (io.cancelAsk) io.cancelAsk();
      if (!quietly && io.onStop) io.onStop();
    },
    running: () => live,
    busy: () => live && (fibers.length > 0 || !!talk),
    _vars: () => vars
  };
  return api;
}

export { LIGHTS };
