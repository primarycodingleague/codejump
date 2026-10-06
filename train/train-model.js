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
 *   white blue = reverse (drives tail first) · white red blue = end route · white yellow (… red / … blue) = wagon drop-offs · white magenta X = custom
 * Splits start with built-in cyan + red (straight-or-left) or cyan + blue (straight-or-right) markers and then one slot:
 *   green straight · red left · blue right · yellow alternate (straight first) · magenta turn, straight, straight · empty = random.
 *
 *   const sim = createSim(project, { onEvent(trainIndex, kind, data) })
 *   sim.go(i?) (= pressing the train's button) · sim.step(dt) · sim.pose(i) → {x, y, ang of the front} · sim.reset()
 *   sim.drive(i, backward, speed) · sim.setTarget(i, speed) · sim.turnAround(i) · sim.stopFor(i, secs)
 *   train.next / train.dflt = 'left'|'straight'|'right'|'random' · events: snap (4 colours) | command | colour (sensor) | split | end | bump | feedback
 *   Speeds are pieces per second; CM converts to the real train's cm.
 *
 * A project is { v: 2, pieces: [[type, x, y, d, snaps|null]], trains: [{ name, color, start: {p, k, rev}|null }], blocks }.
 */

export const R = 0.884; // curve radius: makes 2 splits + a short exactly as long as their passing loop, so loops close
const H = Math.PI / 4, CE = R * Math.SQRT1_2, CY = R * (1 - Math.SQRT1_2), PI = Math.PI;
const CURVE_LEN = R * H;
const slotsOn = (len, n, first, gap) => Array.from({ length: n }, (_, k) => (first + k * gap) / len);
// ends: [x, y, out-heading] (out = pointing away from the piece); paths: [end, end, shape]; slots: fractions along path 0
export const PIECES = {
  straight: { name: 'Straight', ends: [[0, 0, PI], [1, 0, 0]], paths: [[0, 1, 'line']], slots: slotsOn(1, 7, 0.14, 0.12) },
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
export const SNAP_KEYS = ['white', 'red', 'green', 'blue', 'yellow', 'magenta']; // the snaps in the box (cyan is only built into splits)
// colour numbers, as the train reports them to Scratch
export const COLOUR_NUM = { black: 0, red: 1, green: 2, yellow: 3, blue: 4, magenta: 5, cyan: 6, white: 7 };
export const slotCount = t => (PIECES[t] ? PIECES[t].slots.length : 0);
export const CM = 25; // how many cm one straight piece stands for (speeds and distances in blocks are in cm, like the real train)
export const SPEEDS = { slow: 30 / CM, medium: 45 / CM, fast: 60 / CM }; // the real 30 / 45 / 60 cm/s
export const MAX_SPEED = 100 / CM; // the real train's top speed, 100 cm/s
export const MAX_TRAINS = 3;
export const MAX_PIECES = 200;
export const TRAIN_COLOURS = ['#21b8e8', '#f0623c', '#f5b31b']; // blue, red, yellow, like the trains in the Scratch extension
const WGAP = 0.56; // engine centre to wagon centre
const COUPLE = 0.6; // backing this close to a wagon picks it up
export const WAGON_COLOUR = '#21b8e8';
const ACCEL = 3, DECEL = 8; // pieces/s²: it speeds up gently and stops quickly, like the real train // pieces/s² when speeding up or braking
const BUMP = 0.5; // trains closer than this have bumped
const okColour = c => (/^#[0-9a-f]{6}$/i.test(String(c || '')) ? String(c) : null);
export const MAX_WAGONS = 6, MAX_DESTS = 16;
// destinations: signs beside the track, for challenges (and to copy onto a real layout)
export const DESTS = { start: 'Start', station: 'Train station', airport: 'Airport', museum: 'Museum', depot: 'Depot', school: 'School', farm: 'Farm',
  harbour: 'Harbour', zoo: 'Zoo', castle: 'Castle', shops: 'Shops', crossing: 'Level crossing', trees: 'Fallen trees', rocks: 'Rock fall' };
export const DEST_KEYS = Object.keys(DESTS);
// what a challenge asks the train to do at a destination
export const ACTIONS = { start: 'start here', pass: 'go past', stop: 'stop here', reverse: 'turn back here', pickup: 'pick up the wagon', drop: 'drop off the wagon', end: 'end the route here' };
const cleanText = (v, n) => String(v || '').replace(/[<>]/g, '').trim().slice(0, n);
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
    trains.push({ name: cleanName(tr.name) || 'Train ' + (i + 1), color: okColour(tr.color) || TRAIN_COLOURS[i % TRAIN_COLOURS.length], start, wagon: !!tr.wagon });
  }
  const onPiece = (q, paths) => q && typeof q === 'object' && Number.isInteger(q.p) && pieces[q.p] && (!paths || (Number.isInteger(q.k) && q.k >= 0 && q.k < PIECES[pieces[q.p][0]].paths.length));
  // wagons standing on their own (to be picked up), and destinations beside the track
  const wagons = (Array.isArray(p.wagons) ? p.wagons : []).filter(w => onPiece(w, true)).slice(0, MAX_WAGONS).map(w => ({ p: w.p, k: w.k, rev: !!w.rev }));
  const dests = (Array.isArray(p.dests) ? p.dests : []).filter(d => onPiece(d) && DESTS[d.t]).slice(0, MAX_DESTS).map(d => ({ t: d.t, p: d.p, side: d.side < 0 ? -1 : 1 }));
  const ch = p.challenge && typeof p.challenge === 'object' ? p.challenge : null;
  const challenge = ch ? { id: cleanText(ch.id, 40), title: cleanText(ch.title, 60), text: cleanText(ch.text, 400),
    steps: (Array.isArray(ch.steps) ? ch.steps : []).filter(st => st && Number.isInteger(st.d) && dests[st.d] && ACTIONS[st.a]).slice(0, 12).map(st => ({ d: st.d, a: st.a })) } : null;
  return { v: 2, pieces, trains, wagons, dests, challenge, blocks: p.blocks && typeof p.blocks === 'object' ? p.blocks : null }; // one program for all the trains
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
  let free = []; // wagons standing on the track on their own: { cur, color, rev }

  // a cursor is a place on the track: piece p, path k, going from end `from` to end `to`, s along it
  const lenOf = c => geoms[c.p].paths[c.k].len;
  const pathOf = tr => geoms[tr.p].paths[tr.k];
  const fwdOf = c => geoms[c.p].paths[c.k].a === c.from;
  const fwd = fwdOf;
  const seg = c => ({ p: c.p, k: c.k, from: c.from, to: c.to });
  const flipCur = c => { [c.from, c.to] = [c.to, c.from]; c.s = lenOf(c) - c.s; };
  const flipSeg = g => ({ p: g.p, k: g.k, from: g.to, to: g.from });
  function poseOf(c, backward) {
    const pth = geoms[c.p].paths[c.k], f = fwdOf(c), u = Math.max(0, Math.min(1, c.s / pth.len)), q = pth.at(f ? u : 1 - u);
    return { x: q.x, y: q.y, ang: (f ? q.ang : q.ang + PI) + (backward ? PI : 0) };
  }
  // the next piece along from a cursor's `to` end: { link, opts: [{k, o, turn}] } or null at an open end
  function ahead(c) {
    const link = links[c.p + ':' + c.to]; if (!link) return null;
    const g = geoms[link.p], e = link.e, inH = wrap(g.ends[e].h + PI);
    const o = g.paths.map((q, k) => (q.a === e ? { k, o: q.b } : q.b === e ? { k, o: q.a } : null)).filter(Boolean);
    for (const x of o) { const dh = wrap(g.ends[x.o].h - inH); x.turn = Math.abs(dh) < 0.1 ? 'straight' : dh > 0 ? 'right' : 'left'; }
    return { link, opts: o };
  }
  // walk a cursor d along the track (taking straight on at splits); returns the segments it went through
  function walk(c, d) {
    const segs = [seg(c)];
    for (let guard = 0; guard < 20; guard++) {
      const room = lenOf(c) - c.s;
      if (d <= room) { c.s += d; break; }
      d -= room;
      const a = ahead(c); if (!a) { c.s = lenOf(c); break; }
      const pick = a.opts.find(x => x.turn === 'straight') || a.opts[0];
      Object.assign(c, { p: a.link.p, k: pick.k, from: a.link.e, to: pick.o, s: 0 }); segs.push(seg(c));
    }
    return segs;
  }

  function place(tr) {
    tr.on = false; tr.v = 0; tr.vt = 0;
    const st = tr.start; if (!st || !geoms[st.p] || !geoms[st.p].paths[st.k]) return;
    const pth = geoms[st.p].paths[st.k];
    tr.p = st.p; tr.k = st.k; tr.from = st.rev ? pth.b : pth.a; tr.to = st.rev ? pth.a : pth.b; tr.s = pth.len * 0.5; tr.on = true;
  }
  // hitch a wagon to the engine's tail: it sits WGAP behind the engine's front, and `trail` lists the track pieces from the
  // back car to the front car in the direction of travel (the front car chooses the way, the back car follows the trail)
  function hitch(tr, color) {
    const eng = { p: tr.p, k: tr.k, from: tr.from, to: tr.to, s: tr.s };
    const c = Object.assign({}, eng);
    if (!tr.back) flipCur(c); // the tail points against the way it is going
    const segs = walk(c, WGAP);
    if (!tr.back) { flipCur(c); tr.wagon = { color, cur: c, trail: segs.reverse().map(flipSeg) }; }
    else tr.wagon = { color, cur: c, trail: segs };
  }
  const trains = P.trains.map((x, i) => ({ i, name: x.name, color: x.color, start: x.start, startWagon: x.wagon }));
  function reset() {
    t = 0;
    for (const tr of trains) {
      place(tr);
      // back: driving tail first (the engine never turns round; "reverse" just drives the other way)
      Object.assign(tr, { back: false, next: null, dflt: null, cruise: 0, dist: 0, odo0: 0, head: '#ffffff', tail: '#ff2a1a', top: null, flash: null,
        sensor: 'black', sensorTill: 0, lastColour: '', lastCommand: '', lastTurn: 0, touching: new Set(), ended: false, cmd: null, pause: null,
        alt: 0, mag: 0, snapsOn: true, feedbackSound: true, feedbackLights: true, wagon: null });
      if (tr.on && tr.startWagon) hitch(tr, WAGON_COLOUR);
    }
    free = [];
    for (const w of P.wagons) {
      const pth = geoms[w.p] && geoms[w.p].paths[w.k]; if (!pth) continue;
      free.push({ cur: { p: w.p, k: w.k, from: pth.a, to: pth.b, s: pth.len / 2 }, rev: !!w.rev, color: WAGON_COLOUR });
    }
  }
  reset();

  // ── reading snaps like the real train: a command starts with white and ends at a gap, another white or the piece's end.
  // Every command it carries out (and, with snap commands off, every row it reads) is a "snap" event of 4 colours,
  // padded with 'black' (none), like the train reports to Scratch.
  const COMMANDS = {
    'white green': ['slow', tr => setSpeed(tr, SPEEDS.slow)], 'white green green': ['medium', tr => setSpeed(tr, SPEEDS.medium)],
    'white green green green': ['fast', tr => setSpeed(tr, SPEEDS.fast)],
    'white red': ['stop 2 seconds', tr => stopFor(tr, 2)], 'white red red': ['stop 5 seconds', tr => stopFor(tr, 5)], 'white red red red': ['stop 10 seconds', tr => stopFor(tr, 10)],
    'white blue': ['reverse', tr => reverse(tr)], 'white red blue': ['end route', tr => { tr.pause = null; tr.vt = 0; tr.cruise = 0; }],
    'white yellow': ['drop on the go', tr => decouple(tr)],
    'white yellow red': ['stop and drop', tr => { stopFor(tr, 2); decouple(tr); }],
    'white yellow blue': ['reverse drop', tr => { if (decouple(tr)) reverse(tr); }]
  };
  const pad4 = c => [...c, 'black', 'black', 'black', 'black'].slice(0, 4);
  function feedback(tr, col) {
    if (tr.feedbackLights) tr.flash = { col: SNAPS[col] || '#ffffff', until: t + 0.6 };
    if (tr.feedbackSound) emit(tr.i, 'feedback', col);
  }
  function finish(tr) {
    const c = tr.cmd; tr.cmd = null;
    if (!c || c.length < 2) return;
    const key = c.join(' '), custom = c.length <= 3 && c[1] === 'magenta';
    if (!tr.snapsOn) { emit(tr.i, 'snap', pad4(c)); return; } // commands off: the train only reports what it read
    let name = null;
    if (COMMANDS[key]) { name = COMMANDS[key][0]; COMMANDS[key][1](tr); }
    else if (custom) name = 'custom ' + (c[2] || 'none');
    if (!name) return;
    tr.lastCommand = name; emit(tr.i, 'snap', pad4(c)); emit(tr.i, 'command', name); feedback(tr, c[1]);
  }
  function see(tr, col) { tr.sensor = col; tr.sensorTill = tr.dist + 0.09; tr.lastColour = col; emit(tr.i, 'colour', col); }
  function readSlot(tr, col) {
    if (!col) { finish(tr); return; }
    see(tr, col);
    if (col === 'white') { finish(tr); tr.cmd = ['white']; }
    else if (tr.cmd) tr.cmd.push(col);
  }
  function setSpeed(tr, v) { tr.pause = null; tr.vt = v; if (v > 0) tr.cruise = v; tr.ended = false; }
  function stopFor(tr, secs) { const back = tr.pause ? tr.pause.resume : tr.vt || tr.cruise; tr.vt = 0; tr.pause = { until: t + secs, resume: back }; }
  function reverse(tr) {
    if (!tr.on) return;
    tr.cmd = null; flipCur(tr); tr.back = !tr.back; tr.ended = false;
    if (tr.wagon) { flipCur(tr.wagon.cur); tr.wagon.trail = tr.wagon.trail.reverse().map(flipSeg); }
  }
  // let go of the wagon: it stays on the track where it is
  function decouple(tr) {
    if (!tr.wagon) return false;
    free.push({ cur: Object.assign({}, tr.wagon.cur), rev: tr.back, color: tr.wagon.color });
    tr.wagon = null; emit(tr.i, 'wagon', 'dropped'); return true;
  }

  // ── splits: the way to go comes from (1) "on next split go …", (2) the snap in the split's slot, (3) a block's
  // "at every split" choice, or (4) a random choice — exactly what the real train does with an empty slot
  function choose(tr, pc, opts2) {
    const turn = opts2.find(o => o.turn !== 'straight'), straight = opts2.find(o => o.turn === 'straight');
    const pick = w => (w === 'random' ? opts2[Math.floor(rnd() * opts2.length)] : w === 'turn' ? turn : opts2.find(o => o.turn === w)) || straight || opts2[0];
    if (tr.next) { const w = tr.next; tr.next = null; return pick(w); }
    const slot = tr.snapsOn && pc[4] && pc[4][0];
    if (slot === 'green') return pick('straight');
    if (slot === 'red') return pick('left');
    if (slot === 'blue') return pick('right');
    if (slot === 'yellow') { tr.alt = (tr.alt + 1) % 2; return pick(tr.alt === 1 ? 'straight' : 'turn'); } // straight first, then turn (the command sheet's 1, 2)
    if (slot === 'magenta') { const m = tr.mag; tr.mag = (tr.mag + 1) % 3; return pick(m === 0 ? 'turn' : 'straight'); }
    return pick(tr.dflt || 'random');
  }

  // move the engine along the track by d (may cross several pieces). With a wagon it either leads (front first: it chooses
  // the way and adds to the trail) or follows the trail the wagon in front of it has made (tail first)
  function advance(tr, d) {
    let guard = 0;
    while (d > 0 && guard++ < 60) {
      const pth = pathOf(tr), len = pth.len, before = tr.s;
      const step = Math.min(d, len - tr.s);
      tr.s += step; d -= step; tr.dist += step;
      const pc = P.pieces[tr.p], def = PIECES[pc[0]];
      if (def.slots.length && !def.marks && tr.k === 0) { // a split's slot is its steering choice, read as it decides
        const list = def.slots.map((u, k) => [fwd(tr) ? u * len : len - u * len, k]).sort((x, y) => x[0] - y[0]);
        for (const [at, k] of list) if (before < at && tr.s >= at) readSlot(tr, pc[4] ? pc[4][k] : null);
      }
      if (tr.s < len - 1e-9) break;
      finish(tr); // a command is always on one piece
      if (tr.wagon && tr.back) { // following the wagon's trail
        const tl = tr.wagon.trail; tl.shift();
        const nx = tl[0]; if (!nx) { stopDead(tr); return; }
        Object.assign(tr, nx, { s: 0 }); tr.cmd = null; continue;
      }
      const a = ahead(tr);
      if (!a) { stopDead(tr); emit(tr.i, 'end', 'track'); return; }
      const npc = P.pieces[a.link.p], ndef = PIECES[npc[0]];
      let pick = a.opts[0];
      if (a.opts.length > 1) { // facing a split: it reads cyan, its marker and the slot, then decides
        const slot = (npc[4] && npc[4][0]) || 'black';
        see(tr, slot === 'black' ? ndef.marks[1] : slot);
        pick = choose(tr, npc, a.opts);
        tr.lastTurn = pick.turn;
        emit(tr.i, 'snap', ['cyan', ndef.marks[1], slot, 'black']);
        emit(tr.i, 'split', pick.turn);
      }
      Object.assign(tr, { p: a.link.p, k: pick.k, from: a.link.e, to: pick.o, s: 0 }); tr.cmd = null;
      if (tr.wagon) tr.wagon.trail.push(seg(tr));
    }
  }
  // the wagon: leads (pushed, tail first) by choosing like the train, or follows the trail (pulled)
  function moveWagon(tr, d) {
    const w = tr.wagon, c = w.cur;
    for (let guard = 0; d > 0 && guard < 60; guard++) {
      const step = Math.min(d, lenOf(c) - c.s); c.s += step; d -= step;
      if (c.s < lenOf(c) - 1e-9) break;
      if (!tr.back) { // pulled: follow the trail
        w.trail.shift(); const nx = w.trail[0]; if (!nx) { c.s = lenOf(c); return false; }
        Object.assign(c, nx, { s: 0 }); continue;
      }
      const a = ahead(c); // pushed in front: it goes where the train would steer it
      if (!a) { c.s = lenOf(c); return false; }
      const pick = a.opts.length > 1 ? choose(tr, P.pieces[a.link.p], a.opts) : a.opts[0];
      Object.assign(c, { p: a.link.p, k: pick.k, from: a.link.e, to: pick.o, s: 0 }); w.trail.push(seg(c));
    }
    return true;
  }
  function stopDead(tr) { tr.s = pathOf(tr).len; tr.cruise = tr.vt || tr.cruise; tr.v = 0; tr.vt = 0; tr.pause = null; tr.ended = true; }

  // where a train is; ang = the way its FRONT points (it may be driving backwards)
  function pose(i) { const tr = trains[i]; return tr && tr.on ? poseOf(tr, tr.back) : null; }
  function wagonPose(i) { const tr = trains[i]; return tr && tr.on && tr.wagon ? poseOf(tr.wagon.cur, tr.back) : null; }
  const freePose = w => poseOf(w.cur, w.rev);
  // every car on the track: { train, kind: 'engine'|'wagon'|'free', x, y }
  function cars() {
    const out = [];
    trains.forEach((tr, i) => { if (!tr.on) return; out.push(Object.assign({ train: i, kind: 'engine' }, pose(i))); if (tr.wagon) out.push(Object.assign({ train: i, kind: 'wagon' }, wagonPose(i))); });
    free.forEach((w, j) => out.push(Object.assign({ train: -1, kind: 'free', j }, freePose(w))));
    return out;
  }
  const dist2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  // the closest car of anything else to this train's own cars
  function nearestOther(i) {
    const all = cars(), mine = all.filter(c => c.train === i), others = all.filter(c => c.train !== i);
    let m = Infinity, who = null;
    for (const a of mine) for (const b of others) { const d = dist2(a, b); if (d < m) { m = d; who = b; } }
    return { d: m, who };
  }
  const trainGap = (i, j) => { let m = Infinity; for (const a of cars().filter(c => c.train === i)) for (const b of cars().filter(c => c.train === j)) m = Math.min(m, dist2(a, b)); return m; };

  function step(dt) {
    t += dt;
    for (const tr of trains) {
      if (!tr.on) continue;
      if (tr.pause && t >= tr.pause.until) { tr.vt = tr.pause.resume; tr.pause = null; }
      if (tr.flash && t >= tr.flash.until) tr.flash = null;
      if (tr.sensor !== 'black' && tr.dist >= tr.sensorTill) { tr.sensor = 'black'; emit(tr.i, 'colour', 'black'); }
      tr.v = tr.v < tr.vt ? Math.min(tr.vt, tr.v + ACCEL * dt) : Math.max(tr.vt, tr.v - DECEL * dt);
      if (tr.v <= 0) continue;
      const saved = { p: tr.p, k: tr.k, from: tr.from, to: tr.to, s: tr.s, dist: tr.dist,
        wagon: tr.wagon && { color: tr.wagon.color, cur: Object.assign({}, tr.wagon.cur), trail: tr.wagon.trail.map(g => Object.assign({}, g)) } };
      const was = nearestOther(tr.i).d, d = tr.v * dt;
      if (tr.wagon && tr.back) { if (!moveWagon(tr, d)) { stopDead(tr); emit(tr.i, 'end', 'track'); continue; } advance(tr, d); }
      else { advance(tr, d); if (tr.wagon) moveWagon(tr, d); }
      const now = nearestOther(tr.i);
      if (now.d < COUPLE && now.who && now.who.kind === 'free' && !tr.wagon && tr.back) { // backing into a wagon: the magnet picks it up
        const w = free[now.who.j]; free.splice(now.who.j, 1); hitch(tr, w.color); emit(tr.i, 'wagon', 'picked up'); continue;
      }
      if (now.d < BUMP && now.d < was) { // driving into another train or a wagon: stay put and feel the bump
        Object.assign(tr, saved); tr.cruise = tr.vt || tr.cruise; tr.v = 0; tr.vt = 0;
        const o = now.who && now.who.train >= 0 ? trains[now.who.train] : null;
        if (o && !tr.touching.has(o.i)) {
          tr.touching.add(o.i); o.touching.add(tr.i); o.cruise = o.vt || o.cruise; o.v = 0; o.vt = 0;
          emit(tr.i, 'bump', o.name); emit(o.i, 'bump', tr.name);
        } else if (!o && !tr.touching.has('w')) { tr.touching.add('w'); emit(tr.i, 'bump', 'wagon'); }
      }
    }
    for (const tr of trains) for (const j of [...tr.touching]) {
      const g = j === 'w' ? nearestOther(tr.i).d : trainGap(tr.i, j);
      if (g > BUMP + 0.1) tr.touching.delete(j);
    }
  }

  return {
    project: P, geoms, links, trains, step, pose, wagonPose, freeWagons: () => free.map(w => Object.assign({ color: w.color }, freePose(w))), cars, reset, time: () => t,
    // pressing Run with no blocks for a train is like pressing its button: it sets off at medium speed
    go(i) { for (const tr of trains) if (tr.on && (i == null || tr.i === i)) setSpeed(tr, SPEEDS.medium); },
    // drive forward (front first) or backward at a speed (pieces/s); 0 = stop
    drive(i, backward, v) {
      const tr = trains[i]; if (!tr || !tr.on) return;
      if (!!backward !== tr.back) reverse(tr);
      setSpeed(tr, Math.max(0, Math.min(MAX_SPEED, Number(v) || 0)));
    },
    setTarget(i, v) { const tr = trains[i]; if (tr && tr.on) setSpeed(tr, Math.max(0, Math.min(MAX_SPEED, Number(v) || 0))); },
    stopFor(i, secs) { const tr = trains[i]; if (tr && tr.on) stopFor(tr, secs); },
    turnAround(i) { const tr = trains[i]; if (tr) reverse(tr); },
    decouple(i) { const tr = trains[i]; return !!(tr && decouple(tr)); }
  };
}

// ── challenges: a schedule of things to do at destinations, ticked off as Train 1 does them
export function createChecker(sim, challenge) {
  const P = sim.project, steps = (challenge && challenge.steps) || [], dests = P.dests;
  const spot = d => { const dd = dests[d]; if (!dd || !sim.geoms[dd.p]) return null; const q = sim.geoms[dd.p].paths[0].at(0.5); return { x: q.x, y: q.y }; };
  const done = steps.map(() => false);
  let i = 0, still = 0, backWas = null, finished = false;
  const near = (a, b, r = 0.8) => a && b && Math.hypot(a.x - b.x, a.y - b.y) < r;
  return {
    done, steps,
    current: () => i,
    complete: () => finished,
    tick(dt) {
      const tr = sim.trains[0]; if (!tr || !tr.on || i >= steps.length) return;
      const s = steps[i], at = spot(s.d), me = sim.pose(0), here = near(me, at);
      still = tr.v <= 0.001 ? still + dt : 0;
      let ok = false;
      switch (s.a) {
        case 'start': ok = here || sim.time() < 0.5; break;
        case 'pass': ok = here; break;
        case 'stop': ok = here && still >= 0.8; break;
        case 'end': ok = here && still >= 3; break;
        case 'reverse': if (here) { if (backWas === null) backWas = tr.back; else if (tr.back !== backWas) ok = true; } else backWas = null; break;
        case 'pickup': ok = !!tr.wagon && (here || near(sim.wagonPose(0), at)); break;
        case 'drop': ok = sim.freeWagons().some(w => near(w, at, 0.9)); break;
        default: ok = here;
      }
      if (ok) { done[i] = true; i++; still = 0; backWas = null; if (i >= steps.length) finished = true; }
    }
  };
}
