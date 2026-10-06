/* CodeJump · Train Lab — the track and the trains (no DOM, so it also runs in Node tests).
 *
 * The track is made the way a real smart-train set is: pieces that click together end to end, not squares on a grid.
 * Units: a straight piece is 1 long; curves turn 45° (8 make a circle, radius R); headings are radians with y pointing
 * down (so a bigger heading turns right on screen). Each piece sits at (x, y) = its end 0, turned d × 45°.
 *   straight · short (half) · curve left / right · split left / right (a straight with a 45° branch; built-in colour
 *   markers) · crossing
 * A piece's ends join any other piece end in the same place facing the other way, so loops close by themselves.
 *
 * Snaps sit in slots down the middle of a piece. With snap commands on (the default) a train obeys them like the real
 * thing: a command starts with WHITE (in the direction of travel), has no gaps and is all on one piece —
 *   white green / green green / green green green = slow / medium / fast · white red / red red / red red red = stop 2 / 5 / 10 s
 *   white blue = reverse · white red blue = end route · white yellow (… red / … blue) = wagon drop-offs · white magenta X = custom
 * Splits start with built-in cyan + red (straight-or-left) or cyan + blue (straight-or-right) markers and then one slot:
 *   green straight · red left · blue right · yellow alternate · magenta turn, straight, straight · empty = a random choice.
 *
 *   const sim = createSim(project, { onEvent(trainIndex, kind, data) })  // kind: colour | command | split | end | bump
 *   sim.go() (= pressing the train's button) · sim.step(dt) · sim.pose(i) → {x, y, ang} · sim.reset()
 *   sim.setTarget(i, speed) · sim.turnAround(i) · sim.stopFor(i, secs) · train.next / train.dflt = 'left'|'straight'|'right'|'random'
 *
 * A project is { v: 2, pieces: [[type, x, y, d, snaps|null]], trains: [{ name, color, start: {p, k, rev}|null, blocks }] }.
 */

export const R = 0.884; // curve radius: makes 2 splits + a short exactly as long as their passing loop, so loops close
const H = Math.PI / 4, CE = R * Math.SQRT1_2, CY = R * (1 - Math.SQRT1_2), PI = Math.PI;
const CURVE_LEN = R * H;
const slotsOn = (len, n, first, gap) => Array.from({ length: n }, (_, k) => (first + k * gap) / len);
// ends: [x, y, out-heading] (out = pointing away from the piece); paths: [end, end, shape]; slots: fractions along path 0
export const PIECES = {
  straight: { name: 'Straight', ends: [[0, 0, PI], [1, 0, 0]], paths: [[0, 1, 'line']], slots: slotsOn(1, 6, 0.175, 0.13) },
  short: { name: 'Short straight', ends: [[0, 0, PI], [0.5, 0, 0]], paths: [[0, 1, 'line']], slots: slotsOn(0.5, 2, 0.12, 0.13) },
  curveL: { name: 'Curve left', ends: [[0, 0, PI], [CE, -CY, -H]], paths: [[0, 1, 'arcL']], slots: slotsOn(CURVE_LEN, 3, CURVE_LEN / 2 - 0.13, 0.13) },
  curveR: { name: 'Curve right', ends: [[0, 0, PI], [CE, CY, H]], paths: [[0, 1, 'arcR']], slots: slotsOn(CURVE_LEN, 3, CURVE_LEN / 2 - 0.13, 0.13) },
  splitL: { name: 'Split (straight or left)', ends: [[0, 0, PI], [1, 0, 0], [CE, -CY, -H]], paths: [[0, 1, 'line'], [0, 2, 'arcL']], marks: ['cyan', 'red'], slots: [0.385] },
  splitR: { name: 'Split (straight or right)', ends: [[0, 0, PI], [1, 0, 0], [CE, CY, H]], paths: [[0, 1, 'line'], [0, 2, 'arcR']], marks: ['cyan', 'blue'], slots: [0.385] },
  cross: { name: 'Crossing', ends: [[0, 0, PI], [1, 0, 0], [0.5, -0.5, -PI / 2], [0.5, 0.5, PI / 2]], paths: [[0, 1, 'line'], [2, 3, 'line']], slots: [] }
};
export const MARK_U = [0.125, 0.255]; // where a split's built-in markers are (fractions of its straight path)
export const PIECE_KEYS = Object.keys(PIECES);
export const SNAPS = { white: '#f6f6f6', red: '#ef4b3c', green: '#3cb54a', blue: '#1f6fd1', yellow: '#ffd21f', magenta: '#d63fb5', cyan: '#4fc9ea' };
export const SNAP_KEYS = Object.keys(SNAPS);
export const slotCount = t => (PIECES[t] ? PIECES[t].slots.length : 0);
export const SPEEDS = { slow: 1.1, medium: 1.65, fast: 2.2 }; // pieces per second (the real 30 / 45 / 60 cm/s, scaled)
export const MAX_SPEED = 2.75; // 100%
export const MAX_TRAINS = 3;
export const MAX_PIECES = 200;
export const TRAIN_COLOURS = ['#21b8e8', '#f0623c', '#3cbf5a', '#9b6cf0'];
const ACCEL = 3; // pieces/s² when speeding up or braking
const BUMP = 0.5; // trains closer than this have bumped
const okColour = c => (/^#[0-9a-f]{6}$/i.test(String(c || '')) ? String(c) : null);
export const cleanName = n => String(n || '').replace(/[<>]/g, '').trim().slice(0, 14);
const wrap = a => { while (a > PI) a -= 2 * PI; while (a <= -PI) a += 2 * PI; return a; };

// ── geometry of one placed piece, in world units
export function pieceGeom(pc) {
  const [t, x, y, d] = pc, P = PIECES[t], phi = d * H, cs = Math.cos(phi), sn = Math.sin(phi);
  const tf = (lx, ly) => [x + cs * lx - sn * ly, y + sn * lx + cs * ly];
  const ends = P.ends.map(([lx, ly, h]) => { const [wx, wy] = tf(lx, ly); return { x: wx, y: wy, h: wrap(h + phi) }; });
  const paths = P.paths.map(([a, b, kind]) => {
    if (kind === 'line') {
      const A = ends[a], B = ends[b], len = Math.hypot(B.x - A.x, B.y - A.y), ang = Math.atan2(B.y - A.y, B.x - A.x);
      return { a, b, len, at: u => ({ x: A.x + (B.x - A.x) * u, y: A.y + (B.y - A.y) * u, ang }) };
    }
    const left = kind === 'arcL', [cx, cy] = tf(0, left ? -R : R);
    const t0 = (left ? PI / 2 : -PI / 2) + phi, t1 = t0 + (left ? -H : H);
    return { a, b, len: CURVE_LEN, at: u => { const th = t0 + (t1 - t0) * u; return { x: cx + R * Math.cos(th), y: cy + R * Math.sin(th), ang: th + (left ? -PI / 2 : PI / 2) }; } };
  });
  return { t, ends, paths };
}
// where piece type t must sit so that its end k joins an open end at (x, y) that points out at heading h
export function placeAt(t, k, x, y, h) {
  const [lx, ly, lh] = PIECES[t].ends[k];
  const d = ((Math.round(wrap(h + PI - lh) / H) % 8) + 8) % 8, phi = d * H;
  const r6 = v => Math.round(v * 1e6) / 1e6;
  return [t, r6(x - (Math.cos(phi) * lx - Math.sin(phi) * ly)), r6(y - (Math.sin(phi) * lx + Math.cos(phi) * ly)), d, null];
}
// which ends meet which: links['p:e'] = { p, e }
export function linkUp(geoms) {
  const links = {}, all = [];
  geoms.forEach((g, p) => g.ends.forEach((E, e) => all.push({ p, e, E })));
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const A = all[i], B = all[j];
    if (A.p === B.p || links[A.p + ':' + A.e] || links[B.p + ':' + B.e]) continue;
    if (Math.hypot(A.E.x - B.E.x, A.E.y - B.E.y) < 0.05 && Math.abs(wrap(A.E.h - B.E.h - PI)) < 0.05) {
      links[A.p + ':' + A.e] = { p: B.p, e: B.e }; links[B.p + ':' + B.e] = { p: A.p, e: A.e };
    }
  }
  return links;
}

// ── the project: checked and tidied whenever it is loaded
export function cleanSnaps(t, v) {
  const n = slotCount(t); if (!n || !Array.isArray(v)) return null;
  const out = new Array(n).fill(null);
  for (let k = 0; k < n; k++) if (SNAPS[v[k]]) out[k] = v[k];
  return out.some(Boolean) ? out : null;
}
export function cleanProject(p) {
  p = p && typeof p === 'object' ? p : {};
  const pieces = [];
  for (const q of Array.isArray(p.pieces) ? p.pieces.slice(0, MAX_PIECES) : []) {
    if (!Array.isArray(q) || !PIECES[q[0]]) continue;
    const x = Number(q[1]), y = Number(q[2]), d = Number(q[3]);
    if (!isFinite(x) || !isFinite(y) || Math.abs(x) > 500 || Math.abs(y) > 500 || !Number.isInteger(d) || d < 0 || d > 7) continue;
    pieces.push([q[0], x, y, d, cleanSnaps(q[0], q[4])]);
  }
  const trains = [];
  for (const tr of Array.isArray(p.trains) ? p.trains.slice(0, MAX_TRAINS) : []) {
    if (!tr || typeof tr !== 'object') continue;
    const i = trains.length, s = tr.start;
    let start = null;
    if (s && typeof s === 'object' && Number.isInteger(s.p) && pieces[s.p] && Number.isInteger(s.k) && s.k >= 0 && s.k < PIECES[pieces[s.p][0]].paths.length) start = { p: s.p, k: s.k, rev: !!s.rev };
    trains.push({ name: cleanName(tr.name) || 'Train ' + (i + 1), color: okColour(tr.color) || TRAIN_COLOURS[i % TRAIN_COLOURS.length], start,
      blocks: tr.blocks && typeof tr.blocks === 'object' ? tr.blocks : null });
  }
  return { v: 2, pieces, trains };
}

// lay pieces one after another from an open end; a step is a type or [type, end to join (0), end to carry on from]
export function chain(pieces, from, steps) {
  let at = from;
  for (const st of steps) {
    const [t, k = 0, out = k === 0 ? 1 : 0] = Array.isArray(st) ? st : [st];
    const pc = placeAt(t, k, at.x, at.y, at.h); pieces.push(pc);
    at = pieceGeom(pc).ends[out];
  }
  return at;
}
// the track a new project starts with: an oval with a passing loop (a split each end), a slow-down and a speed-up on
// the top and a "stop 2 seconds" station on the bottom — the same kind of layout as the snap-training sheets
export function starterTrack() {
  const pieces = [];
  chain(pieces, { x: 0, y: 0, h: 0 }, ['straight', 'splitR', 'short', ['splitL', 1, 0], 'straight', 'curveR', 'curveR', 'curveR', 'curveR',
    'straight', 'straight', 'short', 'straight', 'straight', 'curveR', 'curveR', 'curveR', 'curveR']);
  chain(pieces, pieceGeom(pieces[1]).ends[2], ['curveL', 'curveL']); // the passing loop
  pieces[0][4] = ['white', 'green', null, null, null, null];           // slow
  pieces[4][4] = ['white', 'green', 'green', 'green', null, null];     // fast
  pieces[10][4] = [null, 'white', 'red', null, null, null];            // stop for 2 seconds (a station)
  return { v: 2, pieces };
}
export const STARTER_TRAIN = { p: 9, k: 0, rev: false }; // on the bottom, just before the station

export function createSim(project, opts = {}) {
  const P = cleanProject(project);
  const geoms = P.pieces.map(pieceGeom), links = linkUp(geoms);
  const emit = (i, kind, data) => { if (opts.onEvent) opts.onEvent(i, kind, data); };
  const rnd = opts.random || Math.random;
  let t = 0;

  const pathOf = tr => geoms[tr.p].paths[tr.k];
  const fwd = tr => pathOf(tr).a === tr.from;
  function place(tr) {
    tr.on = false; tr.v = 0; tr.vt = 0;
    const st = tr.start; if (!st || !geoms[st.p] || !geoms[st.p].paths[st.k]) return;
    const pth = geoms[st.p].paths[st.k];
    tr.p = st.p; tr.k = st.k; tr.from = st.rev ? pth.b : pth.a; tr.to = st.rev ? pth.a : pth.b; tr.s = pth.len * 0.5; tr.on = true;
  }
  const trains = P.trains.map((x, i) => ({ i, name: x.name, color: x.color, start: x.start }));
  function reset() {
    t = 0;
    for (const tr of trains) {
      place(tr);
      Object.assign(tr, { next: null, dflt: null, cruise: 0, dist: 0, head: '#ffffff', top: null, lastColour: '', lastCommand: '', touching: new Set(),
        ended: false, cmd: null, pause: null, alt: 0, mag: 0, snapsOn: true });
    }
  }
  reset();

  // ── reading snaps like the real train: a command starts with white and ends at a gap, another white or the piece's end
  const COMMANDS = {
    'white green': ['slow', tr => setSpeed(tr, SPEEDS.slow)], 'white green green': ['medium', tr => setSpeed(tr, SPEEDS.medium)],
    'white green green green': ['fast', tr => setSpeed(tr, SPEEDS.fast)],
    'white red': ['stop 2 seconds', tr => stopFor(tr, 2)], 'white red red': ['stop 5 seconds', tr => stopFor(tr, 5)], 'white red red red': ['stop 10 seconds', tr => stopFor(tr, 10)],
    'white blue': ['reverse', tr => turnAround(tr)], 'white red blue': ['end route', tr => { tr.pause = null; tr.vt = 0; tr.cruise = 0; }],
    'white yellow': ['drop off wagon', () => {}], 'white yellow red': ['stop and drop off wagon', tr => stopFor(tr, 2)], 'white yellow blue': ['reverse drop off wagon', () => {}]
  };
  function finish(tr) {
    const c = tr.cmd; tr.cmd = null;
    if (!c || c.length < 2 || !tr.snapsOn) return;
    const key = c.join(' ');
    let name = null;
    if (COMMANDS[key]) { name = COMMANDS[key][0]; COMMANDS[key][1](tr); }
    else if (c.length === 3 && c[1] === 'magenta') name = 'custom ' + c[2];
    if (name) { tr.lastCommand = name; emit(tr.i, 'command', name); }
  }
  function readSlot(tr, col) {
    if (!col) { finish(tr); return; }
    tr.lastColour = col; emit(tr.i, 'colour', col);
    if (col === 'white') { finish(tr); tr.cmd = ['white']; }
    else if (tr.cmd) tr.cmd.push(col);
  }
  function setSpeed(tr, v) { tr.pause = null; tr.vt = v; if (v > 0) tr.cruise = v; tr.ended = false; }
  function stopFor(tr, secs) { const back = tr.pause ? tr.pause.resume : tr.vt || tr.cruise; tr.vt = 0; tr.pause = { until: t + secs, resume: back }; }
  function turnAround(tr) { if (!tr.on) return; tr.cmd = null; [tr.from, tr.to] = [tr.to, tr.from]; tr.s = pathOf(tr).len - tr.s; tr.ended = false; }

  // ── splits: the way to go comes from (1) a block's "at the next split", (2) the snap in the split's slot, (3) a block's
  // "at every split", or (4) a random choice — exactly what the real train does with an empty slot
  function choose(tr, pc, opts2) {
    const turn = opts2.find(o => o.turn !== 'straight'), straight = opts2.find(o => o.turn === 'straight');
    const pick = w => (w === 'random' ? opts2[Math.floor(rnd() * opts2.length)] : w === 'turn' ? turn : opts2.find(o => o.turn === w)) || straight || opts2[0];
    if (tr.next) { const w = tr.next; tr.next = null; return pick(w); }
    const slot = tr.snapsOn && pc[4] && pc[4][0];
    if (slot === 'green') return pick('straight');
    if (slot === 'red') return pick('left');
    if (slot === 'blue') return pick('right');
    if (slot === 'yellow') { tr.alt = (tr.alt + 1) % 2; return pick(tr.alt === 1 ? 'turn' : 'straight'); }
    if (slot === 'magenta') { const m = tr.mag; tr.mag = (tr.mag + 1) % 3; return pick(m === 0 ? 'turn' : 'straight'); }
    return pick(tr.dflt || 'random');
  }

  // move one train along the track by d (may cross several pieces)
  function advance(tr, d) {
    let guard = 0;
    while (d > 0 && guard++ < 60) {
      const pth = pathOf(tr), len = pth.len, before = tr.s;
      const step = Math.min(d, len - tr.s);
      tr.s += step; d -= step; tr.dist += step;
      const pc = P.pieces[tr.p], def = PIECES[pc[0]];
      if (def.slots.length && !def.marks && tr.k === 0) { // a split's slot is its steering choice, read when it decides
        const list = def.slots.map((u, k) => [fwd(tr) ? u * len : len - u * len, k]).sort((x, y) => x[0] - y[0]);
        for (const [at, k] of list) if (before < at && tr.s >= at) readSlot(tr, pc[4] ? pc[4][k] : null);
      }
      if (tr.s < len - 1e-9) break;
      finish(tr); // a command is always on one piece
      const link = links[tr.p + ':' + tr.to];
      if (!link) { stopDead(tr); emit(tr.i, 'end', 'track'); return; }
      const g = geoms[link.p], e = link.e, inH = wrap(g.ends[e].h + PI);
      const opts2 = g.paths.map((q, k) => (q.a === e ? { k, o: q.b } : q.b === e ? { k, o: q.a } : null)).filter(Boolean);
      for (const o of opts2) { const dh = wrap(g.ends[o.o].h - inH); o.turn = Math.abs(dh) < 0.1 ? 'straight' : dh > 0 ? 'right' : 'left'; }
      const pick = opts2.length > 1 ? choose(tr, P.pieces[link.p], opts2) : opts2[0];
      tr.p = link.p; tr.k = pick.k; tr.from = e; tr.to = pick.o; tr.s = 0; tr.cmd = null;
      if (opts2.length > 1) emit(tr.i, 'split', pick.turn);
    }
  }
  function stopDead(tr) { tr.s = pathOf(tr).len; tr.cruise = tr.vt || tr.cruise; tr.v = 0; tr.vt = 0; tr.pause = null; tr.ended = true; }

  function pose(i) {
    const tr = trains[i]; if (!tr || !tr.on) return null;
    const pth = pathOf(tr), f = fwd(tr), u = Math.max(0, Math.min(1, tr.s / pth.len)), q = pth.at(f ? u : 1 - u);
    return { x: q.x, y: q.y, ang: f ? q.ang : q.ang + PI };
  }
  const gap = (i, j) => { const a = pose(i), b = pose(j); return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : Infinity; };
  const nearest = i => { let m = Infinity; for (const o of trains) if (o.i !== i && o.on) m = Math.min(m, gap(i, o.i)); return m; };

  function step(dt) {
    t += dt;
    for (const tr of trains) {
      if (!tr.on) continue;
      if (tr.pause && t >= tr.pause.until) { tr.vt = tr.pause.resume; tr.pause = null; }
      const dv = ACCEL * dt;
      tr.v = tr.v < tr.vt ? Math.min(tr.vt, tr.v + dv) : Math.max(tr.vt, tr.v - dv);
      if (tr.v <= 0) continue;
      const saved = { p: tr.p, k: tr.k, from: tr.from, to: tr.to, s: tr.s, dist: tr.dist };
      const was = nearest(tr.i);
      advance(tr, tr.v * dt);
      const now = nearest(tr.i);
      if (now < BUMP && now < was) { // driving into another train: stay put and both feel the bump
        const hit = trains.filter(o => o.i !== tr.i && o.on && gap(tr.i, o.i) < BUMP);
        Object.assign(tr, saved); tr.cruise = tr.vt || tr.cruise; tr.v = 0; tr.vt = 0;
        for (const o of hit) {
          if (tr.touching.has(o.i)) continue;
          tr.touching.add(o.i); o.touching.add(tr.i); o.cruise = o.vt || o.cruise; o.v = 0; o.vt = 0;
          emit(tr.i, 'bump', o.name); emit(o.i, 'bump', tr.name);
        }
      }
    }
    for (const tr of trains) for (const j of [...tr.touching]) if (gap(tr.i, j) > BUMP + 0.1) tr.touching.delete(j);
  }

  return {
    project: P, geoms, links, trains, step, pose, reset, time: () => t,
    // pressing Run is like pressing the button on each train: it sets off at medium speed
    go() { for (const tr of trains) if (tr.on) setSpeed(tr, SPEEDS.medium); },
    setTarget(i, v) { const tr = trains[i]; if (tr && tr.on) setSpeed(tr, Math.max(0, Math.min(MAX_SPEED, Number(v) || 0))); },
    stopFor(i, secs) { const tr = trains[i]; if (tr && tr.on) stopFor(tr, secs); },
    turnAround(i) { const tr = trains[i]; if (tr) turnAround(tr); }
  };
}
