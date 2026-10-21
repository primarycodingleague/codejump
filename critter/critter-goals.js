/* CodeJump · Critter Lab — lesson goals and the results log (no DOM; runs in Node). Used by the Critter Workshop lessons
 * (lessons/units/critter.js); any Critter can carry them. critter-core.js normalise() keeps both through cleanGoals/cleanLog.
 *
 *   critter.goals = { title, list: [ { type, text, ...settings } ] }
 *   critter.log   = [ { c: contest, s: score, k: design key, o?: opponent ('self' | a Starter key), w?: 1 won | 0 lost | -1 draw,
 *                       n?: the pupil's note } ]   (newest last, at most MAX_LOG rows) — one row per finished Test it! run
 *
 * Goal types — about the results (from the log, so they stay ticked once done, and survive saving):
 *   score    { contest, min }          a test in this contest scored min or more (m, cm or flags, like the contest)
 *   tests    { contest?, n }           n different designs tested (in this contest, or in any)
 *   contests { n }                     tested in n different contests
 *   wins     { contest = 'sumo', n }   ONE design beat n different Starter Critters in this two-Critter contest
 * …about the design (they follow the Critter all the time, so they can untick again):
 *   feet     { n }                     n or more parts that follow a motion path (walking feet)
 *   swings   { n }                     n or more joints that swing to and fro
 *   kind     { kind, n }               n or more parts of this kind (body, leg, long, foot, flipper)
 *   grip     { grip, n }               n or more parts with this grip (slippy, normal, grippy)
 *   aim      { n }                     n or more joints that bend towards the target
 *   pairs    { n }                     n or more mirrored pairs
 *   colours  { n }                     n or more different colours
 *   parts    { min, max }              the number of parts is between min and max
 *   setting  { key, min, max }         a Motion setting on the body, as the slider shows it: speed (1–10), sharpness,
 *                                      smoothness (0–100 %), power (30–250 %)
 *   named    { not }                   the Critter has a name of its own (not `not`, not "My Critter")
 */
export const GOAL_TYPES = ['score', 'tests', 'contests', 'wins', 'feet', 'swings', 'kind', 'grip', 'aim', 'pairs', 'colours', 'parts', 'setting', 'named'];
export const CONTEST_KEYS = ['sprint', 'hurdles', 'blockpush', 'highjump', 'lap', 'race', 'sumo'];
export const OPPONENTS = ['self', 'scuttler', 'crab', 'wriggler', 'hopper'];
export const SETTINGS = ['speed', 'sharpness', 'smoothness', 'power'];
export const MAX_GOALS = 12, MAX_LOG = 60;
var KINDS = ['body', 'leg', 'long', 'foot', 'flipper'];
var GRIP = { slippy: 0.05, normal: 0.5, grippy: 1.3 };

function str(v, n) { return typeof v === 'string' ? v.replace(/[<>]/g, '').slice(0, n || 60) : ''; }
function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }
function int(v, d, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(num(v, d)))); }

export function cleanGoals(g) {
  if (!g || typeof g !== 'object' || !Array.isArray(g.list)) return null;
  var list = [];
  g.list.slice(0, MAX_GOALS).forEach(function (x) {
    if (!x || GOAL_TYPES.indexOf(x.type) < 0) return;
    var o = { type: x.type, text: str(x.text, 120) || x.type };
    switch (x.type) {
      case 'score': if (CONTEST_KEYS.indexOf(x.contest) < 0) return; o.contest = x.contest; o.min = num(x.min, 1); break;
      case 'tests': if (CONTEST_KEYS.indexOf(x.contest) >= 0) o.contest = x.contest; o.n = int(x.n, 2, 1, MAX_LOG); break;
      case 'contests': o.n = int(x.n, 2, 1, CONTEST_KEYS.length); break;
      case 'wins': o.contest = x.contest === 'race' ? 'race' : 'sumo'; o.n = int(x.n, 1, 1, OPPONENTS.length - 1); break;
      case 'kind': if (KINDS.indexOf(x.kind) < 0) return; o.kind = x.kind; o.n = int(x.n, 1, 1, 32); break;
      case 'grip': if (!GRIP[x.grip]) return; o.grip = x.grip; o.n = int(x.n, 1, 1, 32); break;
      case 'parts': o.min = int(x.min, 1, 1, 32); o.max = int(x.max, 32, 1, 32); break;
      case 'setting':
        if (SETTINGS.indexOf(x.key) < 0) return; o.key = x.key;
        if (x.min != null) o.min = num(x.min, 0);
        if (x.max != null) o.max = num(x.max, 999);
        break;
      case 'named': o.not = str(x.not, 40); break;
      default: o.n = int(x.n, 1, 1, 32);
    }
    list.push(o);
  });
  return list.length ? { title: str(g.title, 60) || 'Goals', list: list } : null;
}

export function cleanLog(log) {
  if (!Array.isArray(log)) return [];
  return log.slice(-MAX_LOG).filter(function (r) { return r && CONTEST_KEYS.indexOf(r.c) >= 0 && isFinite(Number(r.s)); }).map(function (r) {
    var o = { c: r.c, s: Math.round(Number(r.s) * 100) / 100, k: /^[0-9a-f]{1,12}$/.test(r.k) ? r.k : '0' };
    if (OPPONENTS.indexOf(r.o) >= 0) o.o = r.o;
    if (r.w === 1 || r.w === 0 || r.w === -1) o.w = r.w;
    var n = str(r.n, 60); if (n) o.n = n;
    return o;
  });
}

// A short fingerprint of the design (shape, joints, motion; not its name, results or goals), so the log knows when
// two tests were of the same Critter.
export function designKey(z) {
  var s = JSON.stringify([z && z.motion, z && z.blocks, z && z.joints]), h = 0x811c9dc5;
  for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16);
}

// One finished run → a log row. result = critter-core's sim.result(); opponent = the Test it! choice ('self' | 'starter:crab').
export function logRow(z, contest, result, opponent) {
  var r = { c: contest, s: Math.round(num(result && result.score, 0) * 100) / 100, k: designKey(z) };
  if (contest === 'sumo' || contest === 'race') {
    var o = String(opponent || 'self').replace(/^starter:/, '');
    r.o = OPPONENTS.indexOf(o) >= 0 ? o : 'self';
    r.w = result && result.win === true ? 1 : result && result.win === false ? 0 : -1;
  }
  return r;
}
export function addLog(z, row) { z.log = cleanLog((z.log || []).concat([row])); return z.log; }

export function speedOf(period) { return Math.round(Math.max(1, Math.min(10, 1 + (2.5 - period) / 0.24))); } // the Cycle speed slider
function settingValue(z, key) {
  var m = z.motion || {};
  if (key === 'speed') return speedOf(num(m.period, 1));
  return Math.round(num(m[key], 0) * 100);
}
function joints(z) { return Array.isArray(z.joints) ? z.joints : []; }
function blocks(z) { return Array.isArray(z.blocks) ? z.blocks : []; }
function drivenIds(z) { // joints moved by a motion path (they don't count as swings)
  var out = {}, bs = blocks(z), byId = {};
  bs.forEach(function (b) { byId[b.id] = b; });
  bs.forEach(function (b) {
    if (!b.path) return;
    var c = b, k = 0;
    while (c && c.mount && k < 3) { out[c.id] = true; c = byId[c.mount.parent]; k++; }
  });
  return out;
}

// Is each goal done? → [true/false, …]
export function checkGoals(goals, z) {
  if (!goals || !z) return [];
  var log = Array.isArray(z.log) ? z.log : [], best = z.best || {}, bs = blocks(z);
  return goals.list.map(function (g) {
    switch (g.type) {
      case 'score':
        return (best[g.contest] != null && best[g.contest] >= g.min - 1e-9) || log.some(function (r) { return r.c === g.contest && r.s >= g.min - 1e-9; });
      case 'tests': {
        var keys = {};
        log.forEach(function (r) { if (!g.contest || r.c === g.contest) keys[r.k] = 1; });
        return Object.keys(keys).length >= g.n;
      }
      case 'contests': { var cs = {}; log.forEach(function (r) { cs[r.c] = 1; }); return Object.keys(cs).length >= g.n; }
      case 'wins': {
        var by = {};
        log.forEach(function (r) { if (r.c === g.contest && r.w === 1 && r.o && r.o !== 'self') (by[r.k] = by[r.k] || {})[r.o] = 1; });
        return Object.keys(by).some(function (k) { return Object.keys(by[k]).length >= g.n; });
      }
      case 'feet': return bs.filter(function (b) { return b.path; }).length >= g.n;
      case 'swings': {
        var dr = drivenIds(z);
        return joints(z).filter(function (j) { return j.motion && j.motion.amplitude > 0 && !dr[j.blockB]; }).length >= g.n;
      }
      case 'kind': return bs.filter(function (b) { return b.kind === g.kind; }).length >= g.n;
      case 'grip': return bs.filter(function (b) { return Math.abs(num(b.friction, 0.5) - GRIP[g.grip]) < 0.02; }).length >= g.n;
      case 'aim': return joints(z).filter(function (j) { return j.aim && j.aim.on; }).length >= g.n;
      case 'pairs': return bs.filter(function (b) { return b.twin; }).length / 2 >= g.n;
      case 'colours': { var cols = {}; bs.forEach(function (b) { cols[String(b.colour).toLowerCase()] = 1; }); return Object.keys(cols).length >= g.n; }
      case 'parts': return bs.length >= g.min && bs.length <= g.max;
      case 'setting': {
        var v = settingValue(z, g.key);
        return (g.min == null || v >= g.min) && (g.max == null || v <= g.max);
      }
      case 'named': { var nm = String(z.name || '').trim(); return !!nm && nm !== 'My Critter' && nm !== g.not; }
    }
    return false;
  });
}
export function allDone(goals, z) { var t = checkGoals(goals, z); return t.length > 0 && t.every(Boolean); }
