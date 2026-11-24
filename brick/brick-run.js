// Brick Lab runtime: runs a program (Blockly's JSON — interpreted, never turned into JavaScript) against a hub driver
// (drivers/hub-driver.js). No DOM, so the tests can run it with the pretend hub.
//
//   const r = createRunner(hub, { onScript(id), onError(e) })   r.start(blocksJSON) · r.stop() · r.running() · r.vars()
// "when tilted" and "when distance <" fire when the reading crosses into the condition (not again until it leaves it).
// Stopping, an error, or the hub disconnecting turns every motor off.

export const TILT_MIN = 15;  // degrees before the hub counts as tilted
// which way is which: [axis, sign]. Checked on a real hub with the testing checklist; flip a sign here if one is backwards.
export const TILT_AXES = { forward: ['y', -1], back: ['y', 1], left: ['x', -1], right: ['x', 1] };
export const DIRS = ['forward', 'back', 'left', 'right'];
export function tiltAngle(t, dir) { if (!t) return 0; const [k, s] = TILT_AXES[dir]; return Math.max(0, (t[k] || 0) * s); }
export function tiltedWay(t) { let best = null, n = 0; for (const d of DIRS) { const a = tiltAngle(t, d); if (a >= TILT_MIN && a > n) { best = d; n = a; } } return best; }
export function isTilted(t, dir) { const w = tiltedWay(t); return dir === 'any' ? !!w : w === dir; }

const isNum = v => typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)));
const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
export function show(v) { if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(Math.round(v * 1e6) / 1e6); if (typeof v === 'boolean') return v ? 'true' : 'false'; return v == null ? '' : String(v); }
const truthy = v => typeof v === 'string' ? v !== '' && v.toLowerCase() !== 'false' && v !== '0' : !!v;
function compare(op, a, b) {
  let x, y; if (isNum(a) && isNum(b)) { x = Number(a); y = Number(b); } else { x = show(a).toLowerCase(); y = show(b).toLowerCase(); }
  return { EQ: x === y, NEQ: x !== y, LT: x < y, LTE: x <= y, GT: x > y, GTE: x >= y }[op] || false;
}
const field = (b, k) => (b.fields || {})[k];
const input = (b, k) => { const i = b.inputs && b.inputs[k]; return i ? i.block || i.shadow || null : null; };
const next = b => (b.next && b.next.block) || null;
const varId = f => (f && typeof f === 'object' ? f.id : f) || '';
const hexRGB = h => { const m = /^#?([0-9a-f]{6})$/i.exec(String(h || '')); const v = m ? parseInt(m[1], 16) : 0; return [v >> 16 & 255, v >> 8 & 255, v & 255]; };

export function createRunner(hub, opts = {}) {
  let gen = 0, live = false, tops = [], names = {}, vars = {}, runs = {}, steps = 0, timers = new Set(), poll = 0, edge = {};
  let motors = {};
  const getHub = () => (typeof hub === 'function' ? hub() : hub);
  const sleep = ms => new Promise(res => { const t = setTimeout(() => { timers.delete(t); res(); }, Math.max(0, ms)); timers.add(t); });
  const alive = ctx => live && ctx.gen === gen && runs[ctx.hat] === ctx.run;
  async function tick() { if (++steps % 300 === 0) await sleep(0); }
  const tilt = () => { const h = getHub(); const p = h && h.portWith('tilt'); return p && h.values[p] ? h.values[p].tilt : null; };
  const distance = () => { const h = getHub(); const p = h && h.portWith('distance'); return p && h.values[p] && h.values[p].distance != null ? h.values[p].distance : null; };
  const which = w => { const h = getHub(); if (!h || h.state !== 'connected') return []; const ps = h.motorPorts(); return w === 'all' || !w ? ps : ps.filter(p => p === w); };
  const m = p => motors[p] || (motors[p] = { power: 100, dir: 1, on: false });
  const apply = p => { const h = getHub(), s = m(p); if (h && h.state === 'connected') h.motor(p, s.on ? s.power * s.dir : 0); };

  async function val(b, ctx) {
    if (!b) return '';
    switch (b.type) {
      case 'math_number': return num(field(b, 'NUM'));
      case 'text': return show(field(b, 'TEXT'));
      case 'logic_boolean': return field(b, 'BOOL') === 'TRUE';
      case 'variables_get': return vars[varId(field(b, 'VAR'))] ?? 0;
      case 'math_arithmetic': { const a = num(await val(input(b, 'A'), ctx)), c = num(await val(input(b, 'B'), ctx));
        return { ADD: a + c, MINUS: a - c, MULTIPLY: a * c, DIVIDE: c === 0 ? 0 : a / c, POWER: Math.pow(a, c) }[field(b, 'OP')] ?? 0; }
      case 'math_random_int': { let a = Math.round(num(await val(input(b, 'FROM'), ctx))), c = Math.round(num(await val(input(b, 'TO'), ctx))); if (a > c) [a, c] = [c, a]; return a + Math.floor(Math.random() * (c - a + 1)); }
      case 'math_round': { const a = num(await val(input(b, 'NUM'), ctx)), op = field(b, 'OP'); return op === 'ROUNDUP' ? Math.ceil(a) : op === 'ROUNDDOWN' ? Math.floor(a) : Math.round(a); }
      case 'logic_compare': return compare(field(b, 'OP'), await val(input(b, 'A'), ctx), await val(input(b, 'B'), ctx));
      case 'logic_operation': { const a = truthy(await val(input(b, 'A'), ctx)); return field(b, 'OP') === 'AND' ? a && truthy(await val(input(b, 'B'), ctx)) : a || truthy(await val(input(b, 'B'), ctx)); }
      case 'logic_negate': return !truthy(await val(input(b, 'BOOL'), ctx));
      case 'text_join': { const n = Math.min(20, num((b.extraState || {}).itemCount ?? 2)); let s = ''; for (let i = 0; i < n; i++) s += show(await val(input(b, 'ADD' + i), ctx)); return s.slice(0, 2000); }
      case 'br_tilted': return isTilted(tilt(), field(b, 'DIR') || 'any');
      case 'br_tilt_angle': return tiltAngle(tilt(), field(b, 'DIR') || 'forward');
      case 'br_distance': { const d = distance(); return d == null ? 0 : d; }
    }
    return '';
  }
  async function exec(b, ctx) {
    await tick(); if (!alive(ctx) || b.enabled === false) return;
    switch (b.type) {
      case 'variables_set': vars[varId(field(b, 'VAR'))] = await val(input(b, 'VALUE'), ctx); break;
      case 'math_change': { const k = varId(field(b, 'VAR')); vars[k] = num(vars[k]) + num(await val(input(b, 'DELTA'), ctx)); break; }
      case 'br_motor_on': for (const p of which(field(b, 'MOTOR'))) { m(p).on = true; apply(p); } break;
      case 'br_motor_off': for (const p of which(field(b, 'MOTOR'))) { m(p).on = false; apply(p); } break;
      case 'br_motor_for': {
        const ps = which(field(b, 'MOTOR')), secs = Math.min(600, Math.max(0, num(await val(input(b, 'SECS'), ctx))));
        for (const p of ps) { m(p).on = true; apply(p); }
        await sleep(secs * 1000);
        if (alive(ctx)) for (const p of ps) { m(p).on = false; apply(p); }
        break;
      }
      case 'br_motor_power': { const v = Math.min(100, Math.max(0, num(await val(input(b, 'POWER'), ctx)))); for (const p of which(field(b, 'MOTOR'))) { m(p).power = v; if (m(p).on) apply(p); } break; }
      case 'br_motor_dir': { const d = field(b, 'DIR'); for (const p of which(field(b, 'MOTOR'))) { const s = m(p); s.dir = d === 'reverse' ? -s.dir : d === 'that' ? -1 : 1; if (s.on) apply(p); } break; }
      case 'br_light': { const h = getHub(); if (h && h.state === 'connected') h.light(...hexRGB(field(b, 'COL'))); break; }
      case 'br_light_off': { const h = getHub(); if (h && h.state === 'connected') h.light(0, 0, 0); break; }
      case 'br_wait': await sleep(Math.min(600, Math.max(0, num(await val(input(b, 'SECS'), ctx)))) * 1000); break;
      case 'br_wait_until': while (alive(ctx) && !truthy(await val(input(b, 'COND'), ctx))) await sleep(50); break;
      case 'br_forever': while (alive(ctx)) { await stack(input(b, 'DO'), ctx); await sleep(0); } break;
      case 'br_stop': stopAll(); break;
      case 'controls_repeat_ext': { const n = Math.min(100000, Math.round(num(await val(input(b, 'TIMES'), ctx)))); for (let i = 0; i < n && alive(ctx); i++) { await stack(input(b, 'DO'), ctx); await tick(); } break; }
      case 'controls_whileUntil': { const until = field(b, 'MODE') === 'UNTIL'; while (alive(ctx)) { const c = truthy(await val(input(b, 'BOOL'), ctx)); if (until ? c : !c) break; await stack(input(b, 'DO'), ctx); await sleep(0); } break; }
      case 'controls_if': {
        const n = num((b.extraState || {}).elseIfCount || 0);
        for (let i = 0; i <= n; i++) if (truthy(await val(input(b, 'IF' + i), ctx))) { await stack(input(b, 'DO' + i), ctx); return; }
        if (input(b, 'ELSE')) await stack(input(b, 'ELSE'), ctx); break;
      }
    }
  }
  async function stack(b, ctx) { for (; b && alive(ctx); b = next(b)) await exec(b, ctx); }
  function fire(h) {
    const hat = h.id || String(tops.indexOf(h));
    const ctx = { gen, hat, run: (runs[hat] || 0) + 1 }; runs[hat] = ctx.run; // a hat that fires again restarts its script
    if (opts.onScript) opts.onScript(h.id);
    stack(next(h), ctx).catch(e => { if (opts.onError) opts.onError(e); });
  }
  // sensor hats: checked 20 times a second; they fire when their condition becomes true
  function check(prime) {
    if (!live) return;
    for (const h of tops) {
      if (h.enabled === false) continue;
      let now;
      if (h.type === 'br_when_tilted') now = isTilted(tilt(), field(h, 'DIR') || 'any');
      else if (h.type === 'br_when_distance') { const d = distance(), lim = num(field(h, 'N')); now = d != null && d < lim; }
      else continue;
      const k = h.id || tops.indexOf(h); if (now && !edge[k] && !prime) fire(h); edge[k] = now;
    }
  }
  function stopAll() { const h = getHub(); for (const p of Object.keys(motors)) motors[p].on = false; if (h && h.state === 'connected') h.stopAll(); }
  return {
    start(blocks) {
      this.stop(false); gen++; live = true; steps = 0; runs = {}; edge = {}; motors = {};
      names = {}; for (const v of (blocks && blocks.variables) || []) names[v.id] = v.name;
      vars = {}; for (const id of Object.keys(names)) vars[id] = 0;
      tops = ((blocks && blocks.blocks && blocks.blocks.blocks) || []).filter(b => b && typeof b === 'object');
      // a sensor that's already in its condition when Run is pressed doesn't count as "just happened"
      check(true);
      for (const h of tops) if (h.type === 'br_when_run' && h.enabled !== false) fire(h);
      poll = setInterval(() => check(false), 50);
    },
    stop(motorsOff = true) { const was = live; live = false; gen++; clearInterval(poll); for (const t of timers) clearTimeout(t); timers.clear(); if (motorsOff && was) stopAll(); },
    running: () => live,
    vars: () => Object.fromEntries(Object.entries(vars).map(([k, v]) => [names[k] || k, v]))
  };
}
