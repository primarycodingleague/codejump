/* CodeJump · AI Lab — lesson goals: a checklist that ticks itself as pupils teach, train, test and run their AI
 * (no DOM; runs in Node). Used by the Wildwood Spotters lessons; any AI Lab project can carry one.
 *
 *   goals = { title, list: [ { type, text, ...settings } ] }      (kept in the project: project.goals)
 *
 * Goal types — about the AI (these follow the project all the time, so they can untick again):
 *   labels   { n = 2, names: [] }      at least n labels, including every name in `names` (any capitals)
 *   examples { n, label }              every label (or just `label`) has at least n examples
 *   kind     { kind: 'draw'|'text' }   the AI learns from drawings or from words
 *   trained  {}                        the AI has been trained on the examples it has now
 *   check    { pct = 0 }               trained with the fair check (4+ examples of each label), and it got pct% or more right
 *   reads    { text, label }           the trained AI thinks this message is `label` (words AIs)
 *   tested   { n = 1 }                 n drawings or messages tried on the test pad with the trained AI
 * …about the program (also follow the blocks all the time; only scripts under a "when" block count):
 *   uses     { blocks: [types], n = 1, inside, has, fields }  n of these blocks (inside a block of type `inside`; with a block
 *                                      of type `has` in them; with these field values, e.g. {OP: 'OR'}). The pseudo-type
 *                                      controls_if_else = an if block with an else.
 *   thinks   { n }                     "when the AI thinks it's …" scripts for n different labels the AI has
 * …and about what the program did while it ran (they tick, and stay ticked until Run is pressed again):
 *   said     { match }                 the program showed or said something containing `match`
 *   score    { n }                     the score reached n or more
 *   guesses  { n }                     the program saw n guesses in one run
 *   var      { name, op: '>='|'<='|'=='|'text', v }   the variable reached this value ('text' = it held some words)
 *   msg      { match }                 a message (containing `match`) was sent
 */
export const GOAL_TYPES = ['labels', 'examples', 'kind', 'trained', 'check', 'reads', 'tested', 'uses', 'thinks', 'said', 'score', 'guesses', 'var', 'msg'];
export const RUN_TYPES = ['said', 'score', 'guesses', 'var', 'msg'];
export const MAX_GOALS = 12;
export const HAT_TYPES = ['ai_when_run', 'ai_when_guess', 'ai_when_thinks', 'ai_when_message'];

const str = (v, n) => (typeof v === 'string' ? v.replace(/[<>]/g, '').slice(0, n || 60) : '');
const numv = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
const int = (v, d, lo, hi) => Math.max(lo, Math.min(hi, Math.round(numv(v, d))));
const TYPE = /^[a-z0-9_]{2,40}$/i;
const types = v => (Array.isArray(v) ? v : v ? [v] : []).filter(t => typeof t === 'string' && TYPE.test(t)).slice(0, 8);
const low = s => String(s == null ? '' : s).trim().toLowerCase();

export function cleanGoals(g) {
  if (!g || typeof g !== 'object' || !Array.isArray(g.list)) return null;
  const list = [];
  for (const x of g.list.slice(0, MAX_GOALS)) {
    if (!x || !GOAL_TYPES.includes(x.type)) continue;
    const o = { type: x.type, text: str(x.text, 120) || x.type };
    switch (x.type) {
      case 'labels': o.n = int(x.n, 2, 1, 6); o.names = (Array.isArray(x.names) ? x.names : []).map(n => str(n, 20)).filter(Boolean).slice(0, 6); break;
      case 'examples': o.n = int(x.n, 3, 1, 30); o.label = str(x.label, 20); break;
      case 'kind': o.kind = x.kind === 'text' ? 'text' : 'draw'; break;
      case 'trained': break;
      case 'check': o.pct = int(x.pct, 0, 0, 100); break;
      case 'reads': o.match = str(x.match, 120); o.label = str(x.label, 20); if (!o.match || !o.label) continue; break;
      case 'tested': o.n = int(x.n, 1, 1, 99); break;
      case 'uses': {
        o.blocks = types(x.blocks); if (!o.blocks.length) continue;
        o.n = int(x.n, 1, 1, 99);
        const ins = types(x.inside), has = types(x.has);
        if (ins.length) o.inside = ins;
        if (has.length) o.has = has;
        if (x.fields && typeof x.fields === 'object') { const f = {}; for (const k of Object.keys(x.fields).slice(0, 3)) if (TYPE.test(k) && typeof x.fields[k] === 'string') f[k] = x.fields[k].slice(0, 40); if (Object.keys(f).length) o.fields = f; }
        break;
      }
      case 'thinks': o.n = int(x.n, 1, 1, 6); break;
      case 'said': case 'msg': o.match = str(x.match, 60); break;
      case 'score': o.n = numv(x.n, 1); break;
      case 'guesses': o.n = int(x.n, 1, 1, 99); break;
      case 'var': o.name = str(x.name, 40); o.op = ['>=', '<=', '==', 'text'].includes(x.op) ? x.op : '>='; o.v = numv(x.v, 1); if (!o.name) continue; break;
    }
    list.push(o);
  }
  return list.length ? { title: str(g.title, 80) || 'Goals', list } : null;
}

// which blocks a program uses (only scripts that start with a "when" block run, so only those count)
export function programInfo(state) {
  const all = [], thinks = [];
  const walk = (b, anc) => {
    for (; b; b = b.next && b.next.block) {
      if (b.enabled === false) continue;
      const me = { types: [b.type], fields: b.fields || {}, anc, kids: [] };
      if (b.type === 'controls_if' && b.extraState && b.extraState.hasElse) me.types.push('controls_if_else');
      all.push(me);
      for (const a of anc) a.kids.push(me);
      for (const k in b.inputs || {}) { const inp = b.inputs[k]; if (inp && inp.block) walk(inp.block, anc.concat([me])); }
    }
  };
  const top = state && state.blocks && state.blocks.blocks;
  if (Array.isArray(top)) for (const b of top) {
    if (!b || !HAT_TYPES.includes(b.type) || b.enabled === false) continue;
    if (b.type === 'ai_when_thinks' && b.fields && typeof b.fields.LABEL === 'string') thinks.push(b.fields.LABEL);
    walk(b, []);
  }
  return { all, thinks };
}
export function countUses(info, x) {
  let n = 0;
  for (const b of info.all) {
    if (!x.blocks.some(t => b.types.includes(t))) continue;
    if (x.inside && !b.anc.some(a => x.inside.some(t => a.types.includes(t)))) continue;
    if (x.has && !b.kids.some(k => x.has.some(t => k.types.includes(t)))) continue;
    if (x.fields && !Object.keys(x.fields).every(k => String(b.fields[k]) === x.fields[k])) continue;
    n++;
  }
  return n;
}

// what a run did: the app (and the tests) add to it while the program runs
export function newRecord() { return { said: [], msgs: [], score: null, guesses: 0 }; }

const has = (text, part) => !part || low(text).includes(low(part));
const cmp = (a, op, v) => (op === '<=' ? a <= v : op === '==' ? Math.abs(a - v) < 1e-9 : a >= v);

/* state (all optional): { kind, labels:[{name, ex}], trained (up to date), check {right,total}, tested, blocks (Blockly JSON),
 *   readAs(text) -> label name | null, rec (newRecord, while running), vars {name: value} } */
export function createGoals(goals) {
  const g = cleanGoals(goals);
  const list = g ? g.list : [];
  let ticks = list.map(() => false);
  function now(x, s, info) {
    const labels = s.labels || [];
    switch (x.type) {
      case 'labels': return labels.length >= x.n && x.names.every(n => labels.some(l => low(l.name) === low(n)));
      case 'examples': {
        const L = x.label ? labels.filter(l => low(l.name) === low(x.label)) : labels;
        return L.length > 0 && L.every(l => (l.ex || []).length >= x.n);
      }
      case 'kind': return (s.kind === 'text' ? 'text' : 'draw') === x.kind;
      case 'trained': return !!s.trained;
      case 'check': return !!s.trained && !!s.check && s.check.total > 0 && s.check.right * 100 >= x.pct * s.check.total;
      case 'reads': { if (!s.trained || !s.readAs) return false; const r = s.readAs(x.match); return !!r && low(r) === low(x.label); }
      case 'tested': return (s.tested || 0) >= x.n;
      case 'uses': return countUses(info, x) >= x.n;
      case 'thinks': return new Set(info.thinks.map(low).filter(n => labels.some(l => low(l.name) === n))).size >= x.n;
      default: return false;
    }
  }
  function ran(x, rec, vars) {
    switch (x.type) {
      case 'said': return rec.said.some(t => has(t, x.match));
      case 'msg': return rec.msgs.some(t => has(t, x.match));
      case 'score': return typeof rec.score === 'number' && rec.score >= x.n;
      case 'guesses': return rec.guesses >= x.n;
      case 'var': {
        const v = (vars || {})[x.name];
        if (x.op === 'text') return typeof v === 'string' && v.trim() !== '';
        return typeof v === 'number' && cmp(v, x.op, x.v);
      }
      default: return false;
    }
  }
  return {
    goals: g,
    // Run was pressed: the "while it ran" goals start again
    reset() { ticks = list.map((x, i) => (RUN_TYPES.includes(x.type) ? false : ticks[i])); },
    update(s) {
      s = s || {};
      const info = programInfo(s.blocks);
      list.forEach((x, i) => {
        if (!RUN_TYPES.includes(x.type)) { try { ticks[i] = now(x, s, info); } catch (e) { ticks[i] = false; } }
        else if (!ticks[i] && s.rec) { try { ticks[i] = ran(x, s.rec, s.vars); } catch (e) { /* not yet */ } }
      });
      return ticks.slice();
    },
    ticks: () => ticks.slice(),
    allDone: () => list.length > 0 && ticks.every(Boolean)
  };
}
