/* CodeJump · Train Lab — the track and the trains (no DOM, so it also runs in Node tests).
 *
 * The track is a grid of square pieces. Each piece has paths between its edges (0 = top, 1 = right, 2 = bottom,
 * 3 = left; -1 = the middle, for a buffer stop), turned by `rot` quarter turns clockwise:
 *   straight · curve · split-right / split-left (straight on, or turn) · split-Y (left or right) · crossing · buffer stop
 * A piece can carry a coloured "snap" that a train sees as it passes the middle of the piece.
 *
 *   const sim = createSim(project, { onEvent(trainIndex, kind, data) })   // kind: 'colour' | 'split' | 'end' | 'bump'
 *   sim.step(dt) · sim.pose(i) → {x, y, ang} in tile units · sim.reset() · sim.trains[i] (speed, lights, …)
 *   drive: sim.setTarget(i, tilesPerSecond) · sim.turnAround(i) · train.next / train.dflt = 'left'|'straight'|'right'|'random'
 *
 * A train that is stopped by a buffer stop or a bump remembers its speed in `cruise`, so "turn around" sets off again.
 *
 * A project is { cols, rows, tiles: [[c, r, piece, rot, snap|null]], trains: [{ name, color, start: {c, r, p, rev}|null, blocks }] }.
 */

export const PIECES = {
  straight: { name: 'Straight', paths: [[0, 2]] },
  curve: { name: 'Curve', paths: [[2, 1]] },
  splitR: { name: 'Split (right)', paths: [[2, 0], [2, 1]] },
  splitL: { name: 'Split (left)', paths: [[2, 0], [2, 3]] },
  splitY: { name: 'Y split', paths: [[2, 3], [2, 1]] },
  cross: { name: 'Crossing', paths: [[0, 2], [1, 3]] },
  end: { name: 'Buffer stop', paths: [[2, -1]] }
};
export const PIECE_KEYS = Object.keys(PIECES);
export const SNAPS = { red: '#ff3b3b', green: '#29c46a', blue: '#2f7bff', yellow: '#ffd23a', magenta: '#e04cd8', cyan: '#2fd6e6' };
export const SNAP_KEYS = Object.keys(SNAPS);
export const SPEEDS = { slow: 0.9, medium: 1.7, fast: 2.6 }; // tiles per second
export const MAX_SPEED = 3; // 100%
export const MAX_TRAINS = 3;
export const TRAIN_COLOURS = ['#e8453c', '#2f7bff', '#29b45a', '#ffb31a'];
export const SIZE = { cols: 10, rows: 7, min: 4, max: 16 };
const ACCEL = 2.6; // tiles/s² when speeding up or braking
const BUMP = 0.62; // trains closer than this (tiles) have bumped

const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
const okColour = c => (/^#[0-9a-f]{6}$/i.test(String(c || '')) ? String(c) : null);
const int = (v, lo, hi, d) => { const n = Math.round(Number(v)); return isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };
export const cleanName = n => String(n || '').replace(/[<>]/g, '').trim().slice(0, 14);

export function piecePaths(piece, rot) {
  const P = PIECES[piece]; if (!P) return [];
  return P.paths.map(([a, b]) => [a < 0 ? a : (a + rot) % 4, b < 0 ? b : (b + rot) % 4]);
}
export const pathLen = (a, b) => (a < 0 || b < 0 ? 0.5 : (a + 2) % 4 === b ? 1 : Math.PI / 4);

// a point on a path in tile (c, r), u = 0 at edge a … 1 at edge b; ang = direction of travel (radians, 0 = right, y down)
const edgePt = (c, r, e) => (e < 0 ? [c + 0.5, r + 0.5] : [c + 0.5 + DX[e] * 0.5, r + 0.5 + DY[e] * 0.5]);
export function pathPoint(c, r, a, b, u) {
  const A = edgePt(c, r, a), B = edgePt(c, r, b);
  if (a < 0 || b < 0 || (a + 2) % 4 === b) return { x: A[0] + (B[0] - A[0]) * u, y: A[1] + (B[1] - A[1]) * u, ang: Math.atan2(B[1] - A[1], B[0] - A[0]) };
  // a quarter circle round the corner the two edges share
  const kx = c + 0.5 + (DX[a] + DX[b]) * 0.5, ky = r + 0.5 + (DY[a] + DY[b]) * 0.5;
  const t0 = Math.atan2(A[1] - ky, A[0] - kx); let t1 = Math.atan2(B[1] - ky, B[0] - kx);
  let d = t1 - t0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
  const t = t0 + d * u;
  return { x: kx + Math.cos(t) * 0.5, y: ky + Math.sin(t) * 0.5, ang: t + (d > 0 ? Math.PI / 2 : -Math.PI / 2) };
}
// which way a path turns for a train that came in through edge e
export function turnOf(e, o) { const d = (e + 2) % 4; return o === d || o < 0 ? 'straight' : o === (d + 1) % 4 ? 'right' : 'left'; }

// ── the project: checked and tidied whenever it is loaded
export function cleanProject(p) {
  p = p && typeof p === 'object' ? p : {};
  const cols = int(p.cols, SIZE.min, SIZE.max, SIZE.cols), rows = int(p.rows, SIZE.min, SIZE.max, SIZE.rows);
  const seen = new Set(), tiles = [];
  for (const t of Array.isArray(p.tiles) ? p.tiles : []) {
    if (!Array.isArray(t)) continue;
    const c = int(t[0], 0, cols - 1, -1), r = int(t[1], 0, rows - 1, -1);
    if (c !== Number(t[0]) || r !== Number(t[1]) || !PIECES[t[2]] || seen.has(c + ',' + r)) continue;
    seen.add(c + ',' + r);
    tiles.push([c, r, t[2], int(t[3], 0, 3, 0), SNAPS[t[4]] ? t[4] : null]);
  }
  const trains = [];
  for (const tr of Array.isArray(p.trains) ? p.trains.slice(0, MAX_TRAINS) : []) {
    if (!tr || typeof tr !== 'object') continue;
    const i = trains.length;
    let start = null;
    if (tr.start && typeof tr.start === 'object') {
      const s = tr.start, c = Number(s.c), r = Number(s.r);
      const tile = tiles.find(t => t[0] === c && t[1] === r);
      if (tile && Number.isInteger(s.p) && s.p >= 0 && s.p < PIECES[tile[2]].paths.length) start = { c, r, p: s.p, rev: !!s.rev };
    }
    trains.push({ name: cleanName(tr.name) || 'Train ' + (i + 1), color: okColour(tr.color) || TRAIN_COLOURS[i % TRAIN_COLOURS.length], start,
      blocks: tr.blocks && typeof tr.blocks === 'object' ? tr.blocks : null });
  }
  return { cols, rows, tiles, trains };
}

// the track a new project starts with: a loop with a shortcut, a red "station" snap and a blue snap before the split
export function starterTrack() {
  const t = [];
  const put = (c, r, piece, rot, snap) => t.push([c, r, piece, rot, snap || null]);
  put(1, 1, 'curve', 0); put(8, 1, 'curve', 1); put(8, 5, 'curve', 2); put(1, 5, 'curve', 3);
  for (let c = 2; c <= 7; c++) { put(c, 1, 'straight', 1); put(c, 5, 'straight', 1, c === 4 ? 'red' : null); put(c, 3, 'straight', 1); }
  put(1, 2, 'straight', 0); put(1, 4, 'straight', 0, 'blue'); put(8, 2, 'straight', 0); put(8, 4, 'straight', 0);
  put(1, 3, 'splitR', 0); put(8, 3, 'splitL', 0);
  return { cols: 10, rows: 7, tiles: t };
}

export function createSim(project, opts = {}) {
  const P = cleanProject(project);
  const map = new Map(P.tiles.map(t => [t[0] + ',' + t[1], t]));
  const tileAt = (c, r) => map.get(c + ',' + r) || null;
  const emit = (i, kind, data) => { if (opts.onEvent) opts.onEvent(i, kind, data); };
  const rnd = opts.random || Math.random;

  function place(tr) {
    const st = tr.start, tile = st && tileAt(st.c, st.r);
    tr.on = false; tr.v = 0; tr.vt = 0;
    if (!tile) return;
    const paths = piecePaths(tile[2], tile[3]); const pth = paths[st.p]; if (!pth) return;
    let [a, b] = pth; if (st.rev) [a, b] = [b, a];
    tr.c = st.c; tr.r = st.r; tr.a = a; tr.b = b; tr.s = pathLen(a, b) * 0.5; tr.on = true;
  }
  const trains = P.trains.map((t, i) => ({ i, name: t.name, color: t.color, start: t.start }));
  function reset() {
    for (const tr of trains) {
      place(tr);
      Object.assign(tr, { next: null, dflt: 'straight', cruise: 0, dist: 0, head: '#ffffff', top: null, lastColour: '', touching: new Set(), ended: false });
    }
  }
  reset();

  function choose(tr, opts2) { // opts2 = [{o, turn}]
    let want = tr.next || tr.dflt || 'straight'; tr.next = null;
    if (want === 'random') return opts2[Math.floor(rnd() * opts2.length)];
    return opts2.find(x => x.turn === want) || opts2.find(x => x.turn === 'straight') || opts2.find(x => x.turn === 'left') || opts2[0];
  }
  // move one train along the track by d tiles (may cross several pieces)
  function advance(tr, d) {
    let guard = 0;
    while (d > 0 && guard++ < 50) {
      const len = pathLen(tr.a, tr.b), half = len / 2;
      const before = tr.s;
      const step = Math.min(d, len - tr.s);
      tr.s += step; d -= step; tr.dist += step;
      if (before < half && tr.s >= half) {
        const tile = tileAt(tr.c, tr.r);
        if (tile && tile[4]) { tr.lastColour = tile[4]; emit(tr.i, 'colour', tile[4]); }
      }
      if (tr.s < len - 1e-9) break;
      // at the end of this piece
      if (tr.b < 0) { stopDead(tr); emit(tr.i, 'end', 'buffer'); return; }
      const nc = tr.c + DX[tr.b], nr = tr.r + DY[tr.b], e = (tr.b + 2) % 4, tile = tileAt(nc, nr);
      const opts2 = tile ? piecePaths(tile[2], tile[3]).flatMap(([x, y]) => (x === e ? [{ o: y }] : y === e ? [{ o: x }] : [])) : [];
      if (!opts2.length) { stopDead(tr); emit(tr.i, 'end', 'track'); return; }
      for (const x of opts2) x.turn = turnOf(e, x.o);
      const pick = opts2.length > 1 ? choose(tr, opts2) : opts2[0];
      tr.c = nc; tr.r = nr; tr.a = e; tr.b = pick.o; tr.s = 0;
      if (opts2.length > 1) emit(tr.i, 'split', pick.turn);
    }
  }
  function stopDead(tr) { tr.s = pathLen(tr.a, tr.b); tr.cruise = tr.vt || tr.cruise; tr.v = 0; tr.vt = 0; tr.ended = true; }

  function pose(i) {
    const tr = trains[i]; if (!tr || !tr.on) return null;
    const len = pathLen(tr.a, tr.b);
    return pathPoint(tr.c, tr.r, tr.a, tr.b, Math.max(0, Math.min(1, tr.s / len)));
  }
  const gap = (i, j) => { const p = pose(i), q = pose(j); return p && q ? Math.hypot(p.x - q.x, p.y - q.y) : Infinity; };
  const nearest = i => { let m = Infinity; for (const o of trains) if (o.i !== i && o.on) m = Math.min(m, gap(i, o.i)); return m; };

  function step(dt) {
    for (const tr of trains) {
      if (!tr.on) continue;
      const dv = ACCEL * dt;
      tr.v = tr.v < tr.vt ? Math.min(tr.vt, tr.v + dv) : Math.max(tr.vt, tr.v - dv);
      if (tr.v <= 0) continue;
      const saved = { c: tr.c, r: tr.r, a: tr.a, b: tr.b, s: tr.s, dist: tr.dist };
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
    for (const tr of trains) for (const j of [...tr.touching]) if (gap(tr.i, j) > BUMP + 0.12) tr.touching.delete(j);
  }

  return {
    project: P, trains, tileAt, step, pose, reset,
    setTarget(i, v) { const tr = trains[i]; if (tr && tr.on) { tr.vt = Math.max(0, Math.min(MAX_SPEED, Number(v) || 0)); if (tr.vt > 0) tr.ended = false; } },
    turnAround(i) { // flip the direction of travel where the train is
      const tr = trains[i]; if (!tr || !tr.on) return;
      const len = pathLen(tr.a, tr.b); [tr.a, tr.b] = [tr.b, tr.a]; tr.s = len - tr.s; tr.ended = false;
    }
  };
}
