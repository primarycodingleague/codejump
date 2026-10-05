/* CodeJump · AI Lab — runs a Blockly workspace's scripts. No DOM: the screen, speech, sound and the AI's guesses
 * come in through `io`, so the runner also works in Node tests.
 *
 *   const run = createRunner(io);   // io: { say(text), speak(text, done) -> {cancel}|null, sound(name) -> secs,
 *                                   //       colour(c), score(n|null), clear(), guess() -> {label, conf, probs}|null,
 *                                   //       labels() -> [name…], onError(e), onStop() }
 *   run.start(workspace) · run.tick(dt) every frame · run.guessed() after each new guess · run.stop() · run.running()
 *
 * Each script is a generator ("fiber"): one step per tick, and every loop pass and wait yields, so a forever loop never
 * freezes the page.
 */
import { HATS } from './ai-blocks.js';

const STOP = { stop: true };
const numOf = v => { const n = Number(v); return isFinite(n) ? n : 0; };

export function createRunner(io = {}) {
  let fibers = [], ws = null, vars = Object.create(null), t = 0, live = false, score = 0, scoreUsed = false, guesses = 0;
  const hats = { guess: [], thinks: [], msg: [] };
  const field = (b, n) => b.getFieldValue(n);
  const input = (b, n) => b.getInputTargetBlock(n);
  const cur = () => (io.guess ? io.guess() : null);
  const same = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
  function setScore(n) { score = n; scoreUsed = true; if (io.score) io.score(score); }

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
      case 'ai_random': { let a = Math.round(numOf(val(input(b, 'A')))), c = Math.round(numOf(val(input(b, 'B')))); if (a > c) [a, c] = [c, a]; return a + Math.floor(Math.random() * (c - a + 1)); }
      case 'logic_compare': {
        let a = val(input(b, 'A')), c = val(input(b, 'B'));
        const bothNum = a !== '' && c !== '' && typeof a !== 'boolean' && typeof c !== 'boolean' && isFinite(Number(a)) && isFinite(Number(c));
        if (bothNum) { a = Number(a); c = Number(c); } else { a = String(a).toLowerCase(); c = String(c).toLowerCase(); }
        switch (field(b, 'OP')) { case 'EQ': return a === c; case 'NEQ': return a !== c; case 'LT': return a < c; case 'LTE': return a <= c; case 'GT': return a > c; case 'GTE': return a >= c; }
        return false;
      }
      case 'logic_operation': { const a = !!val(input(b, 'A')), c = !!val(input(b, 'B')); return field(b, 'OP') === 'AND' ? a && c : a || c; }
      case 'logic_negate': return !val(input(b, 'BOOL'));
      case 'text_join': { let s = ''; for (let i = 0; b.getInput('ADD' + i); i++) s += String(val(input(b, 'ADD' + i))); return s; }
      case 'variables_get': { const v = vars[field(b, 'VAR')]; return v === undefined ? 0 : v; }
      case 'ai_guess': { const g = cur(); return g ? g.label : ''; }
      case 'ai_confidence': { const g = cur(); return g ? g.conf : 0; }
      case 'ai_thinks': { const g = cur(); return !!g && same(g.label, field(b, 'LABEL')); }
      case 'ai_conf_of': {
        const g = cur(); if (!g) return 0;
        const i = (io.labels ? io.labels() : []).findIndex(n => same(n, field(b, 'LABEL')));
        return i >= 0 && g.probs ? g.probs[i] || 0 : 0;
      }
      case 'ai_random_label': { const L = io.labels ? io.labels() : []; return L.length ? L[Math.floor(Math.random() * L.length)] : ''; }
      case 'ai_score': return score;
      default: return 0;
    }
  }

  let talk = null;
  function stopTalking() { if (talk && talk.handle && talk.handle.cancel) talk.handle.cancel(); talk = null; }
  function* speak(text) {
    stopTalking();
    text = String(text ?? ''); if (io.say) io.say(text);
    const me = { done: false, min: t + 0.3 + text.length / 16, until: t + 1 + text.length / 11 };
    me.handle = io.speak ? io.speak(text, () => { me.done = true; }) : null;
    talk = me;
    // wait for the voice to finish; a device with no voice just waits about as long as reading it would take
    while (talk === me && !((me.done && t >= me.min) || (!me.handle && t >= me.until) || t > me.until + 8)) yield;
    if (talk === me) talk = null;
  }
  function* waitSecs(s) { const end = t + Math.max(0, s); while (t < end) yield; }

  function* run(b) {
    switch (b.type) {
      case 'ai_say': if (io.say) io.say(String(val(input(b, 'TEXT')) ?? '')); break;
      case 'ai_say_for': if (io.say) io.say(String(val(input(b, 'TEXT')) ?? '')); yield* waitSecs(numOf(val(input(b, 'S')))); if (io.say) io.say(''); break;
      case 'ai_speak': yield* speak(val(input(b, 'TEXT'))); break;
      case 'ai_colour': if (io.colour) io.colour(field(b, 'COL')); break;
      case 'ai_sound': if (io.sound) io.sound(field(b, 'S')); break;
      case 'ai_change_score': setScore(score + numOf(val(input(b, 'N')))); break;
      case 'ai_set_score': setScore(numOf(val(input(b, 'N')))); break;
      case 'ai_clear': if (io.clear) io.clear(); break;
      case 'ai_wait_drawing': { const n = guesses; while (guesses === n) yield; break; }
      case 'ai_wait': yield* waitSecs(numOf(val(input(b, 'S')))); break;
      case 'ai_wait_until': while (!val(input(b, 'COND'))) yield; break;
      case 'ai_forever': for (;;) { yield* seq(input(b, 'DO')); yield; }
      case 'controls_repeat_ext': { const n = Math.floor(numOf(val(input(b, 'TIMES')))); for (let i = 0; i < n; i++) { yield* seq(input(b, 'DO')); yield; } break; }
      case 'controls_whileUntil': { const until = field(b, 'MODE') === 'UNTIL'; while (until ? !val(input(b, 'BOOL')) : !!val(input(b, 'BOOL'))) { yield* seq(input(b, 'DO')); yield; } break; }
      case 'controls_if': {
        for (let i = 0; b.getInput('IF' + i); i++) if (val(input(b, 'IF' + i))) { yield* seq(input(b, 'DO' + i)); return; }
        if (b.getInput('ELSE')) yield* seq(input(b, 'ELSE'));
        break;
      }
      case 'ai_stop': throw STOP;
      case 'ai_send': broadcast(field(b, 'MSG')); break;
      case 'variables_set': vars[field(b, 'VAR')] = val(input(b, 'VALUE')); break;
      case 'math_change': vars[field(b, 'VAR')] = numOf(vars[field(b, 'VAR')]) + numOf(val(input(b, 'DELTA'))); break;
      default: break;
    }
  }
  function* seq(b) { while (b) { if (!b.isEnabled || b.isEnabled()) yield* run(b); b = b.getNextBlock(); } }

  function spawn(hat) { fibers = fibers.filter(f => f.hat !== hat.id); fibers.push({ hat: hat.id, g: seq(hat.getNextBlock()) }); }
  function broadcast(msg) { for (const h of hats.msg) if (same(h.getFieldValue('MSG'), msg)) spawn(h); }

  const api = {
    start(workspace) {
      api.stop(true);
      ws = workspace; live = true; t = 0; vars = Object.create(null); score = 0; scoreUsed = false; guesses = 0;
      if (io.score) io.score(null);
      for (const v of ws.getAllVariables()) vars[v.getId()] = 0;
      hats.guess = []; hats.thinks = []; hats.msg = [];
      for (const top of ws.getTopBlocks(true)) {
        if (!HATS.includes(top.type) || (top.isEnabled && !top.isEnabled())) continue;
        if (top.type === 'ai_when_run') spawn(top);
        else if (top.type === 'ai_when_guess') hats.guess.push(top);
        else if (top.type === 'ai_when_thinks') hats.thinks.push(top);
        else if (top.type === 'ai_when_message') hats.msg.push(top);
      }
    },
    tick(dt) {
      if (!live) return;
      t += dt;
      for (const f of fibers.slice()) {
        if (f.done) continue;
        try { const r = f.g.next(); if (r.done) f.done = true; }
        catch (e) { if (e === STOP) { api.stop(); return; } f.done = true; if (io.onError) io.onError(e); }
      }
      fibers = fibers.filter(f => !f.done);
    },
    guessed() { // a drawing was finished and the AI has guessed it
      if (!live) return;
      guesses++;
      const g = cur();
      for (const h of hats.guess) spawn(h);
      if (g) for (const h of hats.thinks) if (same(h.getFieldValue('LABEL'), g.label)) spawn(h);
    },
    stop(quietly) { fibers = []; live = false; stopTalking(); if (!quietly && io.onStop) io.onStop(); },
    running: () => live,
    busy: () => live && fibers.length > 0,
    scoreUsed: () => scoreUsed,
    _vars: () => vars
  };
  return api;
}
