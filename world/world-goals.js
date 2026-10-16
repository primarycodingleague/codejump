/* CodeJump · 3D World — lesson goals: a checklist that ticks itself while the program runs (no DOM; runs in Node).
 *
 *   goals = { title, list: [ { type, text, ...settings } ] }      (kept in the project: project.goals)
 *
 * Goal types (an object `id` also matches its copies made by a loop: "coin" matches coin, coin_2, coin_3 …):
 *   uses    { blocks: [types], n = 1, inside }  the program has n of these blocks (inside a block of type `inside`, if given)
 *   has     { id, n = 1 }                        n of these things are in the world
 *   reach   { id, axis, op: '>'|'<', v }         it has been higher/lower (further/nearer) than v on that axis
 *   turn    { id, axis = 'y', deg }              it has turned this many degrees in all
 *   say     { id, text }                         it said something (containing text, if given)
 *   show    { text }                             "show … on the screen" showed something containing text
 *   var     { name, op: '>='|'<='|'==', v }      the variable reached this value
 *   colours { id, n }                            its colour changed n times
 *   anim    { id, anim }                         it played this animation (any, if anim is empty)
 *   touch   { a, b }                             the two touched
 *   click   { id }                               it was clicked
 *   gone    { id }                               none of these things are left (deleted or hidden)
 *   stay    { id, axis, min, max, secs }         after secs of playing it has never gone outside min…max on that axis
 *                                                (this one can untick again: it goes out → not done)
 * "uses" can name the pseudo-type controls_if_else (an if block with an else), and `inside` can be a list of types.
 *
 * "uses" goals follow the blocks at all times. The rest tick while the program runs and stay ticked until Run is
 * pressed again, so pupils can see what their last run did.
 */
export const GOAL_TYPES = ['uses', 'has', 'reach', 'turn', 'say', 'show', 'var', 'colours', 'anim', 'touch', 'click', 'gone', 'stay'];
export const MAX_GOALS = 12;

const str = (v, n) => (typeof v === 'string' ? v.slice(0, n || 60) : '');
const numv = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
const AXES = ['x', 'y', 'z'];

export function cleanGoals(g) {
  if (!g || typeof g !== 'object' || !Array.isArray(g.list)) return null;
  const list = [];
  for (const x of g.list.slice(0, MAX_GOALS)) {
    if (!x || !GOAL_TYPES.includes(x.type)) continue;
    const o = { type: x.type, text: str(x.text, 120) || x.type };
    if (x.type === 'uses') {
      o.blocks = (Array.isArray(x.blocks) ? x.blocks : []).filter(t => typeof t === 'string' && /^[a-z0-9_]{2,40}$/i.test(t)).slice(0, 10);
      if (!o.blocks.length) continue;
      o.n = Math.max(1, Math.min(99, Math.round(numv(x.n, 1))));
      const ins = (Array.isArray(x.inside) ? x.inside : x.inside ? [x.inside] : []).filter(t => typeof t === 'string' && /^[a-z0-9_]{2,40}$/i.test(t)).slice(0, 6);
      if (ins.length) o.inside = ins;
    } else if (x.type === 'var') {
      o.name = str(x.name, 40); o.op = ['>=', '<=', '=='].includes(x.op) ? x.op : '>='; o.v = numv(x.v, 1);
      if (!o.name) continue;
    } else if (x.type === 'touch') {
      o.a = str(x.a, 40); o.b = str(x.b, 40); if (!o.a || !o.b) continue;
    } else if (x.type === 'show') {
      o.text2 = str(x.match, 60);
    } else {
      o.id = str(x.id, 40);
      if (!o.id && x.type !== 'say' && x.type !== 'anim') continue;
      if (x.type === 'has') o.n = Math.max(1, Math.min(999, Math.round(numv(x.n, 1))));
      if (x.type === 'reach') { o.axis = AXES.includes(x.axis) ? x.axis : 'y'; o.op = x.op === '<' ? '<' : '>'; o.v = numv(x.v, 0); }
      if (x.type === 'turn') { o.axis = AXES.includes(x.axis) ? x.axis : 'y'; o.deg = Math.max(1, Math.min(100000, numv(x.deg, 360))); }
      if (x.type === 'say') o.match = str(x.match, 60);
      if (x.type === 'colours') o.n = Math.max(1, Math.min(50, Math.round(numv(x.n, 1))));
      if (x.type === 'anim') o.anim = str(x.anim, 40);
      if (x.type === 'stay') { o.axis = AXES.includes(x.axis) ? x.axis : 'x'; o.min = numv(x.min, -10); o.max = numv(x.max, 10); o.secs = Math.max(0.5, Math.min(600, numv(x.secs, 3))); }
    }
    list.push(o);
  }
  return list.length ? { title: str(g.title, 80) || 'Goals', list } : null;
}

// which blocks a program uses: counts per type, and per "type inside type"
export function programInfo(state) {
  const counts = {}, inside = {};
  const walk = (b, anc) => {
    for (; b; b = b.next && b.next.block) {
      const types = [b.type];
      if (b.type === 'controls_if' && b.extraState && b.extraState.hasElse) types.push('controls_if_else');
      for (const t of types) {
        counts[t] = (counts[t] || 0) + 1;
        for (const a of new Set(anc)) { const k = t + '<' + a; inside[k] = (inside[k] || 0) + 1; }
      }
      const sub = anc.concat(types);
      for (const k in b.inputs || {}) {
        const inp = b.inputs[k];
        if (inp && inp.block) walk(inp.block, sub);
      }
    }
  };
  const top = state && state.blocks && state.blocks.blocks;
  if (Array.isArray(top)) for (const b of top) walk(b, []);
  return { counts, inside };
}

const match = (oid, id) => oid === id || oid.startsWith(id + '_');
const has = (text, part) => !part || String(text).toLowerCase().includes(String(part).toLowerCase());
const cmp = (a, op, v) => (op === '<=' ? a <= v : op === '==' ? Math.abs(a - v) < 1e-9 : a >= v);

export function createGoals(goals) {
  const g = cleanGoals(goals);
  const list = g ? g.list : [];
  let ticks = list.map(() => false), info = { counts: {}, inside: {} }, seen = list.map(() => false);
  function usesOk(x) {
    let n = 0;
    for (const t of x.blocks) {
      if (!x.inside) { n += info.counts[t] || 0; continue; }
      // inside any of the listed blocks (counted once even when it's inside two of them)
      let best = 0; for (const a of x.inside) best = Math.max(best, info.inside[t + '<' + a] || 0);
      n += best;
    }
    return n >= x.n;
  }
  function liveOk(x, world) {
    const objs = world.objects().filter(o => o.visible);
    const rec = world.record();
    switch (x.type) {
      case 'has': return objs.filter(o => match(o.id, x.id)).length >= x.n;
      case 'reach': return objs.some(o => match(o.id, x.id) && (x.op === '>' ? o.hi && o.hi[x.axis] > x.v : o.lo && o.lo[x.axis] < x.v));
      case 'turn': return objs.some(o => match(o.id, x.id) && Math.abs(o.spun[x.axis]) >= x.deg - 1e-6);
      case 'say': return rec.said.some(s => (!x.id || match(s.id, x.id)) && has(s.text, x.match));
      case 'show': return rec.shown.some(t => has(t, x.text2));
      case 'var': { const v = world.vars()[x.name]; return typeof v === 'number' && cmp(v, x.op, x.v); }
      case 'colours': return Object.keys(rec.colours).some(id => match(id, x.id) && rec.colours[id].length >= x.n);
      case 'anim': return rec.anims.some(a => (!x.id || match(a.id, x.id)) && (!x.anim || a.name === x.anim));
      case 'touch': {
        const A = objs.filter(o => match(o.id, x.a)), Bs = objs.filter(o => match(o.id, x.b));
        return A.some(a => Bs.some(b => world.touchingIds(a.id, b.id)));
      }
      case 'click': return rec.clicks.some(id => match(id, x.id));
      case 'gone': return !objs.some(o => match(o.id, x.id));
      case 'stay': {
        const mine = world.objects().filter(o => match(o.id, x.id) && o.lo);
        return mine.length > 0 && world.playTime() >= x.secs && mine.every(o => o.lo[x.axis] >= x.min && o.hi[x.axis] <= x.max);
      }
      default: return false;
    }
  }
  return {
    goals: g,
    // a new run: everything but "uses" starts again
    reset() { ticks = list.map((x, i) => (x.type === 'uses' ? ticks[i] : false)); seen = list.map(() => false); },
    // the blocks changed (pass the workspace's JSON state)
    program(state) { info = programInfo(state); list.forEach((x, i) => { if (x.type === 'uses') ticks[i] = usesOk(x); }); },
    // call often while the world runs
    check(world) {
      if (!world || !world.running()) return ticks.slice();
      for (let i = 0; i < list.length; i++) {
        const x = list[i];
        if (x.type === 'uses') continue;
        // "gone" needs the things to have been there first
        if (x.type === 'gone' && !seen[i]) { seen[i] = world.objects().some(o => o.visible && match(o.id, x.id)); continue; }
        if (x.type === 'stay') { try { ticks[i] = liveOk(x, world); } catch (e) { ticks[i] = false; } continue; }
        if (!ticks[i]) { try { ticks[i] = liveOk(x, world); } catch (e) { /* not ready yet */ } }
      }
      return ticks.slice();
    },
    ticks: () => ticks.slice(),
    allDone: () => list.length > 0 && ticks.every(Boolean)
  };
}
