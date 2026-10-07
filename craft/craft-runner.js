/* CodeJump · Build Lab — runs a program (Blockly's JSON save format) in the block world. No DOM, so Node tests use it.
 *
 *   const r = createRunner(world, io);
 *   r.load(state) · r.start() (the "when Run is clicked" scripts) · r.chat('tower', [5]) → true if a script listens
 *   r.tick(dt) every frame · r.stop() · r.running() · r.helper  (the robot helper: {x,y,z,f, from, t, trail})
 *
 * io (all optional): player() → {x,y,z,facing}, teleport(x,y,z), say(text, who), time(name), error(msg), placed(), sound(name)
 * Every script is a generator ("fiber"): helper moves take a moment and every loop pass waits a frame, so nothing freezes.
 */
import { BY_NAME, NAME_OF, isSolid, dirStep, rel, W, H, D } from './craft-world.js';
import { API_BY_TYPE } from './craft-lang.js';

const STOP = { stop: true };
const STEP = 0.18, ACT = 0.1; // seconds per helper move / place / dig
const numOf = v => { const n = Number(v); return isFinite(n) ? n : 0; };

export function createRunner(world, io = {}) {
  let tops = [], fibers = [], vars = Object.create(null), live = false, allow = null, steps = 0;
  const helper = { x: 32, y: 13, z: 30, f: 0, from: null, t: 1, trail: 0 };

  const field = (b, n) => (b && b.fields ? b.fields[n] : undefined);
  const input = (b, n) => b && b.inputs && b.inputs[n] && (b.inputs[n].block || b.inputs[n].shadow);
  const varId = f => (f && (f.id || f.name)) || 'x';
  const player = () => (io.player ? io.player() : { x: 32, y: 13, z: 34, facing: 0 });
  const here = () => { const p = player(); return [Math.floor(p.x), Math.floor(p.y), Math.floor(p.z), p.facing | 0]; };
  const at = (x, y, z) => { const h = here(); return rel(h, h[3], numOf(x), numOf(y), numOf(z)); };
  const blockId = name => (name in BY_NAME ? BY_NAME[name] : 3);

  function val(b) {
    if (!b) return 0;
    switch (b.type) {
      case 'math_number': return numOf(field(b, 'NUM'));
      case 'text': return String(field(b, 'TEXT') ?? '');
      case 'logic_boolean': return field(b, 'BOOL') === 'TRUE';
      case 'cr_block': return String(field(b, 'B') || 'STONE');
      case 'variables_get': { const v = vars[varId(field(b, 'VAR'))]; return v === undefined ? 0 : v; }
      case 'math_arithmetic': {
        const a = val(input(b, 'A')), c = val(input(b, 'B')), op = field(b, 'OP');
        if (op === 'ADD' && (typeof a === 'string' || typeof c === 'string')) return String(a) + String(c);
        const x = numOf(a), y = numOf(c);
        switch (op) { case 'ADD': return x + y; case 'MINUS': return x - y; case 'MULTIPLY': return x * y; case 'DIVIDE': return y ? x / y : 0; case 'POWER': return Math.pow(x, y); }
        return 0;
      }
      case 'math_modulo': { const a = numOf(val(input(b, 'DIVIDEND'))), c = numOf(val(input(b, 'DIVISOR'))); return c ? ((a % c) + c) % c : 0; }
      case 'math_random_int': { let a = Math.round(numOf(val(input(b, 'FROM')))), c = Math.round(numOf(val(input(b, 'TO')))); if (a > c) [a, c] = [c, a]; return a + Math.floor(Math.random() * (c - a + 1)); }
      case 'logic_compare': {
        let a = val(input(b, 'A')), c = val(input(b, 'B'));
        const bothNum = a !== '' && c !== '' && typeof a !== 'boolean' && typeof c !== 'boolean' && isFinite(Number(a)) && isFinite(Number(c));
        if (bothNum) { a = Number(a); c = Number(c); } else { a = String(a).toLowerCase(); c = String(c).toLowerCase(); }
        switch (field(b, 'OP')) { case 'EQ': return a === c; case 'NEQ': return a !== c; case 'LT': return a < c; case 'LTE': return a <= c; case 'GT': return a > c; case 'GTE': return a >= c; }
        return false;
      }
      case 'logic_operation': { const a = !!val(input(b, 'A')), c = !!val(input(b, 'B')); return field(b, 'OP') === 'OR' ? a || c : a && c; }
      case 'logic_negate': return !val(input(b, 'BOOL'));
      case 'text_join': { const n = (b.extraState && b.extraState.itemCount) != null ? b.extraState.itemCount : 2; let s = ''; for (let i = 0; i < n; i++) s += String(val(input(b, 'ADD' + i))); return s; }
      case 'cr_h_detect': { const d = dirStep(field(b, 'DIR') || 'FORWARD', helper.f); return isSolid(world.get(helper.x + d[0], helper.y + d[1], helper.z + d[2])); }
      case 'cr_h_inspect': { const d = dirStep(field(b, 'DIR') || 'DOWN', helper.f); return NAME_OF(world.get(helper.x + d[0], helper.y + d[1], helper.z + d[2])); }
      case 'cr_w_block': { const c = at(val(input(b, 'X')), val(input(b, 'Y')), val(input(b, 'Z'))); return NAME_OF(world.get(c[0], c[1], c[2])); }
    }
    return 0;
  }
  const truthy = v => (typeof v === 'string' ? v !== '' && v !== '0' && v.toLowerCase() !== 'false' : !!v);
  const say = (t, who) => { if (io.say) io.say(String(t), who); };

  function* moveHelper(dir, n) {
    n = Math.max(0, Math.min(200, Math.round(numOf(n))));
    for (let i = 0; i < n; i++) {
      const d = dirStep(dir, helper.f), nx = helper.x + d[0], ny = helper.y + d[1], nz = helper.z + d[2];
      if (isSolid(world.get(nx, ny, nz)) || nx < 0 || nz < 0 || nx >= W || nz >= D || ny < 1 || ny >= H) { yield ACT; return; } // blocked: it stays put
      const old = [helper.x, helper.y, helper.z];
      helper.from = { x: helper.x, y: helper.y, z: helper.z, f: helper.f }; helper.t = 0;
      helper.x = nx; helper.y = ny; helper.z = nz; steps++;
      if (helper.trail) world.set(old[0], old[1], old[2], helper.trail);
      yield STEP;
    }
  }
  function* runOne(b) {
    if (allow && b.type && !allow(b.type)) throw new Error(allow.why || 'This world doesn’t allow that block.');
    switch (b.type) {
      case 'controls_repeat_ext': { const n = Math.max(0, Math.min(100000, Math.round(numOf(val(input(b, 'TIMES')))))); for (let i = 0; i < n; i++) { yield* runSeq(input(b, 'DO')); yield 0; } return; }
      case 'controls_for': {
        const v = varId(field(b, 'VAR')); let from = numOf(val(input(b, 'FROM'))); const to = numOf(val(input(b, 'TO'))); let by = Math.abs(numOf(val(input(b, 'BY')))) || 1;
        if (from > to) by = -by; let guard = 0;
        for (let i = from; by > 0 ? i <= to : i >= to; i += by) { vars[v] = i; yield* runSeq(input(b, 'DO')); yield 0; if (++guard > 100000) break; }
        return;
      }
      case 'controls_whileUntil': { const until = field(b, 'MODE') === 'UNTIL'; while (until ? !truthy(val(input(b, 'BOOL'))) : truthy(val(input(b, 'BOOL')))) { yield* runSeq(input(b, 'DO')); yield 0; } return; }
      case 'cr_forever': for (;;) { yield* runSeq(input(b, 'DO')); yield 0; }
      case 'controls_if': {
        const es = b.extraState || {}, n = es.elseIfCount || 0;
        for (let i = 0; i <= n; i++) if (truthy(val(input(b, 'IF' + i)))) { yield* runSeq(input(b, 'DO' + i)); return; }
        if (es.hasElse) yield* runSeq(input(b, 'ELSE'));
        return;
      }
      case 'variables_set': vars[varId(field(b, 'VAR'))] = val(input(b, 'VALUE')); return;
      case 'math_change': { const k = varId(field(b, 'VAR')); vars[k] = numOf(vars[k]) + numOf(val(input(b, 'DELTA'))); return; }
      case 'cr_wait': yield Math.max(0, Math.min(600, numOf(val(input(b, 'S'))))); return;
      case 'cr_h_move': yield* moveHelper(field(b, 'DIR') || 'FORWARD', val(input(b, 'N'))); return;
      case 'cr_h_turn': helper.from = { x: helper.x, y: helper.y, z: helper.z, f: helper.f }; helper.t = 0; helper.f = (helper.f + (field(b, 'D') === 'LEFT' ? 3 : 1)) % 4; yield STEP; return;
      case 'cr_h_place': case 'cr_h_dig': {
        const d = dirStep(field(b, 'DIR') || 'FORWARD', helper.f), x = helper.x + d[0], y = helper.y + d[1], z = helper.z + d[2];
        if (b.type === 'cr_h_place') { if (!isSolid(world.get(x, y, z))) world.set(x, y, z, blockId(field(b, 'B'))); }
        else world.set(x, y, z, 0);
        yield ACT; return;
      }
      case 'cr_h_trail': helper.trail = blockId(field(b, 'B') || 'AIR'); return;
      case 'cr_h_come': {
        const p = player(), fc = p.facing | 0, c = rel([Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)], fc, 0, 1, 2);
        helper.from = { x: helper.x, y: helper.y, z: helper.z, f: helper.f }; helper.t = 0;
        helper.x = c[0]; helper.y = Math.max(1, Math.min(H - 1, c[1])); helper.z = c[2]; helper.f = fc; yield 0.35; return;
      }
      case 'cr_h_say': say(val(input(b, 'T')), 'helper'); return;
      case 'cr_p_say': say(val(input(b, 'T')), 'me'); return;
      case 'cr_p_tp': { const c = at(val(input(b, 'X')), val(input(b, 'Y')), val(input(b, 'Z'))); if (io.teleport) io.teleport(c[0] + 0.5, c[1], c[2] + 0.5); yield 0; return; }
      case 'cr_w_time': if (io.time) io.time(field(b, 'T') || 'DAY'); return;
      case 'cr_b_place': { const c = at(val(input(b, 'X')), val(input(b, 'Y')), val(input(b, 'Z'))); world.set(c[0], c[1], c[2], blockId(field(b, 'B'))); if (io.placed) io.placed(); return; }
      case 'cr_b_fill': case 'cr_b_line': {
        const a = at(val(input(b, 'X1')), val(input(b, 'Y1')), val(input(b, 'Z1'))), c = at(val(input(b, 'X2')), val(input(b, 'Y2')), val(input(b, 'Z2')));
        if (b.type === 'cr_b_fill') world.fill(blockId(field(b, 'B')), a, c, field(b, 'M') || 'SOLID'); else world.line(blockId(field(b, 'B')), a, c);
        if (io.placed) io.placed(); yield 0; return;
      }
      case 'cr_b_ball': { const c = at(val(input(b, 'X')), val(input(b, 'Y')), val(input(b, 'Z'))); world.ball(blockId(field(b, 'B')), numOf(val(input(b, 'R'))), c, field(b, 'M') || 'SOLID'); if (io.placed) io.placed(); yield 0; return; }
    }
    if (API_BY_TYPE[b.type] || /^(math_|text|logic_|variables_get|cr_block)/.test(b.type)) { val(b); return; } // a value block on its own: work it out, do nothing
  }
  function* runSeq(b) { for (; b; b = b.next && b.next.block) yield* runOne(b); }
  function spawn(first, setup) { const f = { gen: null, wait: 0 }; f.gen = (function* () { if (setup) setup(); yield* runSeq(first); })(); fibers.push(f); live = true; }

  return {
    helper,
    load(state) { tops = ((state && state.blocks && state.blocks.blocks) || []).slice().sort((a, b) => (a.y || 0) - (b.y || 0)); },
    start() { this.stop(); vars = Object.create(null); for (const t of tops) if (t.type === 'cr_on_run') spawn(t.next && t.next.block); live = true; },
    chat(word, args) {
      word = String(word || '').toLowerCase(); let hit = false;
      for (const t of tops) if (t.type === 'cr_on_chat' && String(field(t, 'WORD') || '').trim().toLowerCase() === word) {
        hit = true; const v = varId(field(t, 'VAR')), n = args && args.length ? numOf(args[0]) : 0;
        spawn(t.next && t.next.block, () => { vars[v] = n; });
      }
      return hit;
    },
    has(word) { word = String(word || '').toLowerCase(); return tops.some(t => t.type === 'cr_on_chat' && String(field(t, 'WORD') || '').trim().toLowerCase() === word); },
    words() { return tops.filter(t => t.type === 'cr_on_chat').map(t => String(field(t, 'WORD') || '').trim().toLowerCase()); },
    tick(dt) {
      if (helper.t < 1) helper.t = Math.min(1, helper.t + dt / STEP);
      if (!fibers.length) { live = false; return; }
      for (const f of fibers.slice()) {
        if (f.wait > 0) { f.wait -= dt; if (f.wait > 0) continue; }
        let steps = 0;
        try {
          for (;;) {
            const r = f.gen.next();
            if (r.done) { fibers.splice(fibers.indexOf(f), 1); break; }
            if (r.value > 0) { f.wait = r.value; break; }
            if (r.value === 0 || ++steps > 5000) break; // one loop pass per frame
          }
        } catch (e) {
          const i = fibers.indexOf(f); if (i >= 0) fibers.splice(i, 1);
          if (e !== STOP && io.error) io.error(e && e.message ? e.message : String(e));
        }
      }
      live = fibers.length > 0;
    },
    stop() { fibers = []; live = false; },
    setAllow(fn) { allow = fn || null; }, steps: () => steps, resetSteps() { steps = 0; },
    running() { return live && fibers.length > 0; },
    _vars: () => vars
  };
}
