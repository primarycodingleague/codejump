/* Zook Lab — core: the Zook data model, motion (swings, IK motion paths, steering towards the red
 * target) and the Rapier physics contests.
 *
 * An ES module with no DOM and no rendering, so it runs in the browser and in Node (for tuning the
 * starter Zooks headlessly). Rapier is passed in (createSim(RAPIER, …)) rather than imported, so the
 * builder can load before the 1.6 MB physics engine has arrived.
 *
 * A Zook is one JSON document, the single source of truth (units: centimetres, degrees, seconds):
 *   { version: 3, id, name, motion: { period, sharpness, smoothness, power }, blocks: [...], joints: [...],
 *     best: { contest: score } }
 *   block = { id, kind, size: [length, height, width], square (0–1), point (0–1), friction, colour, eyes,
 *             twin?, mount: { parent, face, at: [a, b], lean, splay, hinge }, path?: { points: [[u, v], …], phase } }
 *   joint = { id, blockA (parent), blockB (child), minAngle, maxAngle, motion: { amplitude, phase }, aim: { on, angle } }
 *
 * Parts are "blobs" (as in the original Zook Kit): superellipsoids that go from egg-shaped (square 0) to
 * boxy (square 1), tapering towards their far end with `point`. World axes: +x forwards (the way the
 * eyes face), +y up, +z to the Zook's right. Every block except the root hangs off a face of its parent
 * ('+x', '-y', …) at `at` (fractions across that face, projected onto the blob's surface). Its long axis
 * points straight out of the face, tipped by `splay` (about its own y) and `lean` (about its own z). Its
 * joint is a hinge about one of its own axes: 'swing' (z), 'sweep' (y) or 'twist' (x).
 *
 * Motion, all on one beat (motion.period = the Zook Kit's "cycle speed"):
 *  - a joint can swing to and fro (motion.amplitude, motion.phase), or
 *  - a limb tip with a `path` follows a loop of IK points (in the plane its top joint swings in, relative
 *    to the block the limb hangs from); the limb's joints (up to 3) are solved by IK to reach it.
 *  - steering: the Zook turns towards its red target by shortening the stride (or swing) on the inside
 *    of the turn (turning sharpness: down to walking backwards, i.e. pivoting) and by bending any joint
 *    with aim.on towards the target (the Zook Kit's "part targeting").
 */

export var VERSION = 3;
export var DEG = Math.PI / 180;
export var MAX_BLOCKS = 32;
export var STEP = 1 / 60;
var CM = 0.01; // physics runs in metres

export var FRICTION = { slippy: 0.05, normal: 0.5, grippy: 1.3 };

// Single blobs. size = [length, height, width] in cm.
export var PARTS = {
  body:    { label: 'Blob',      size: [90, 34, 50], square: 0.55, point: 0,   friction: FRICTION.normal, colour: '#38b6ff' },
  leg:     { label: 'Leg bit',   size: [50, 14, 14], square: 0.3,  point: 0.2, friction: FRICTION.normal, colour: '#f59f18' },
  long:    { label: 'Long bit',  size: [80, 14, 14], square: 0.3,  point: 0.2, friction: FRICTION.normal, colour: '#ff751f' },
  foot:    { label: 'Foot pad',  size: [30, 10, 26], square: 0.8,  point: 0,   friction: FRICTION.grippy, colour: '#00bf63' },
  flipper: { label: 'Flipper',   size: [56, 6, 40],  square: 0.7,  point: 0.4, friction: FRICTION.normal, colour: '#ff66c4' }
};

// Ready-made limbs (chains of blobs) for the palette.
export var LIMBS = {
  leg2:  { label: 'Walking leg', blurb: 'Two parts that follow a stepping loop', parts: ['leg', 'leg'], knee: -30, path: true },
  leg3:  { label: 'Long leg',    blurb: 'Three parts and a foot loop', parts: ['long', 'leg', 'foot'], knee: -35, path: true },
  tail:  { label: 'Tail',        blurb: 'Three segments that wave', parts: ['leg', 'leg', 'leg'], knee: 0, wave: true },
  neck:  { label: 'Neck & head', blurb: 'Turns to look at the target', parts: ['leg', 'body'], knee: 0, aim: true }
};

// Contests (the Zook Kit's trials, plus TV-style contests).
export var CONTESTS = {
  sprint:    { label: 'Sprint',       seconds: 15, unit: 'm',  icon: 'zap',           about: 'Race towards the red target. How far in 15 seconds?' },
  hurdles:   { label: 'Hurdles',      seconds: 20, unit: 'm',  icon: 'mountain',      about: 'A sprint over humps that get steeper and steeper.' },
  blockpush: { label: 'Block Push',   seconds: 13, unit: 'm',  icon: 'box',           about: 'Shove ten big blocks. Score = how far they all moved.' },
  highjump:  { label: 'High Jump',    seconds: 10, unit: 'cm', icon: 'arrow-up-from-line', about: 'How high can it get its body off the ground?' },
  lap:       { label: 'Lap',          seconds: 60, unit: 'flags', icon: 'flag',      about: 'Follow the target round eight flags in a circle.' },
  race:      { label: 'Head-to-head', seconds: 15, unit: 'm',  icon: 'users',         about: 'Two Zooks, two lanes, one race.', two: true },
  sumo:      { label: 'Super Sumo',   seconds: 30, unit: '',   icon: 'swords',        about: 'Push the other Zook off the platform!', two: true },
  roam:      { label: 'Free roam',    seconds: 0,  unit: 'targets', icon: 'crosshair', about: 'Tap the ground to move the red target. Watch it steer.' }
};

export var HINGES = { swing: [0, 0, 1], sweep: [0, 1, 0], twist: [1, 0, 0] };

/* ------------------------------------------------------------------ small 3D maths (arrays) */

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }
export function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
export function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
export function scale(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
export function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
export function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function len(a) { return Math.sqrt(dot(a, a)); }
function norm(a) { var l = len(a); return l > 1e-9 ? scale(a, 1 / l) : [0, 0, 0]; }
export function qMul(a, b) {
  return [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
          a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
          a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
          a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
}
export function qAxis(axis, ang) { var s = Math.sin(ang / 2); return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(ang / 2)]; }
export function qConj(q) { return [-q[0], -q[1], -q[2], q[3]]; }
export function qRot(q, v) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var tx = 2 * (y * v[2] - z * v[1]), ty = 2 * (z * v[0] - x * v[2]), tz = 2 * (x * v[1] - y * v[0]);
  return [v[0] + w * tx + y * tz - z * ty, v[1] + w * ty + z * tx - x * tz, v[2] + w * tz + x * ty - y * tx];
}
function qBasis(X, Y, Z) { // rotation whose columns are X, Y, Z
  var m00 = X[0], m10 = X[1], m20 = X[2], m01 = Y[0], m11 = Y[1], m21 = Y[2], m02 = Z[0], m12 = Z[1], m22 = Z[2];
  var tr = m00 + m11 + m22, s;
  if (tr > 0) { s = 0.5 / Math.sqrt(tr + 1); return [(m21 - m12) * s, (m02 - m20) * s, (m10 - m01) * s, 0.25 / s]; }
  if (m00 > m11 && m00 > m22) { s = 2 * Math.sqrt(1 + m00 - m11 - m22); return [0.25 * s, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s]; }
  if (m11 > m22) { s = 2 * Math.sqrt(1 + m11 - m00 - m22); return [(m01 + m10) / s, 0.25 * s, (m12 + m21) / s, (m02 - m20) / s]; }
  s = 2 * Math.sqrt(1 + m22 - m00 - m11); return [(m02 + m20) / s, (m12 + m21) / s, 0.25 * s, (m10 - m01) / s];
}
var QI = [0, 0, 0, 1];

// Face frames: x = straight out of the face; y, z = across it. Mirror images of each other in z,
// so a part and its twin have the same lean and opposite splay.
export var FACES = {
  '+x': { n: [1, 0, 0],  y: [0, 1, 0],  z: [0, 0, 1] },
  '-x': { n: [-1, 0, 0], y: [0, -1, 0], z: [0, 0, 1] },
  '+y': { n: [0, 1, 0],  y: [-1, 0, 0], z: [0, 0, 1] },
  '-y': { n: [0, -1, 0], y: [1, 0, 0],  z: [0, 0, 1] },
  '+z': { n: [0, 0, 1],  y: [0, 1, 0],  z: [-1, 0, 0] },
  '-z': { n: [0, 0, -1], y: [0, 1, 0],  z: [1, 0, 0] }
};
Object.keys(FACES).forEach(function (k) { var f = FACES[k]; f.q = qBasis(f.n, f.y, f.z); });

function dimAlong(size, dir) { return Math.abs(dir[0]) * size[0] + Math.abs(dir[1]) * size[1] + Math.abs(dir[2]) * size[2]; }

/* ------------------------------------------------------------------ blob shapes */

function expo(b) { return 1 - 0.88 * clamp(num(b.square, 0.5), 0, 1); }
function taper(b, x) { return 1 - clamp(num(b.point, 0), 0, 1) * 0.8 * (x / (b.size[0] / 2) + 1) / 2; }
function spow(t, e) { return t < 0 ? -Math.pow(-t, e) : Math.pow(t, e); }

// Points on a blob's surface in its own frame (cm): rows from the back end (-x) to the front end (+x).
export function blobGrid(b, nLat, nLon) {
  var e = expo(b), a = b.size[0] / 2, hb = b.size[1] / 2, hc = b.size[2] / 2, rows = [];
  for (var i = 0; i <= nLat; i++) {
    var u = -Math.PI / 2 + Math.PI * i / nLat, su = Math.sin(u), cu = Math.cos(u), row = [];
    var x = a * spow(su, e), w = spow(cu, e), s = taper(b, x);
    for (var j = 0; j < nLon; j++) {
      var v = -Math.PI + 2 * Math.PI * j / nLon;
      row.push([x, hb * w * spow(Math.sin(v), e) * s, hc * w * spow(Math.cos(v), e) * s]);
    }
    rows.push(row);
  }
  return rows;
}

function insideBlob(b, p) {
  var r = 2 / expo(b), s = Math.max(0.05, taper(b, clamp(p[0], -b.size[0] / 2, b.size[0] / 2)));
  return Math.pow(Math.abs(p[0] / (b.size[0] / 2)), r) + Math.pow(Math.abs(p[1] / (b.size[1] / 2 * s)), r) +
    Math.pow(Math.abs(p[2] / (b.size[2] / 2 * s)), r) <= 1;
}

// Where a part attaches: the point on the parent's box face, pulled in towards the centre until it
// sits on the blob's surface.
var faceCache = new Map();
function facePoint(b, face, at) {
  var key = b.size.join(',') + '|' + b.square + '|' + b.point + '|' + face + '|' + at.join(',');
  var hit = faceCache.get(key);
  if (hit) return hit;
  if (faceCache.size > 5000) faceCache.clear();
  var p = facePointRaw(b, face, at);
  faceCache.set(key, p);
  return p;
}
function facePointRaw(b, face, at) {
  var f = FACES[face], size = b.size;
  var p = add(add(scale(f.n, dimAlong(size, f.n) / 2), scale(f.y, at[0] * dimAlong(size, f.y))), scale(f.z, at[1] * dimAlong(size, f.z)));
  if (insideBlob(b, p)) return p;
  var lo = 1, hi = 0; // fraction of p: 1 = outside, 0 = centre (inside)
  for (var i = 0; i < 18; i++) { var mid = (lo + hi) / 2; if (insideBlob(b, scale(p, mid))) hi = mid; else lo = mid; }
  return scale(p, hi);
}

// A point on a blob's surface, in its own frame (for eyes and attachments).
export function surfaceAt(b, face, at) { return facePoint(b, face, at); }

function volume(b) { return b.size[0] * b.size[1] * b.size[2] * (0.52 + 0.45 * num(b.square, 0.5)) * (1 - 0.45 * num(b.point, 0)); }

/* ------------------------------------------------------------------ the document */

export function uid(prefix) { return prefix + '-' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
function nextId(list, prefix) { var n = 1, ids = {}; list.forEach(function (o) { ids[o.id] = 1; }); while (ids[prefix + n]) n++; return prefix + n; }

export function newZook(name) {
  var p = PARTS.body;
  return { version: VERSION, id: uid('zook'), name: name || 'My Zook', motion: { period: 1, sharpness: 0.6, smoothness: 0.5, power: 1 },
    blocks: [{ id: 'b1', kind: 'body', size: p.size.slice(), square: p.square, point: p.point, friction: p.friction, colour: p.colour, eyes: true }],
    joints: [], best: {} };
}

export function block(z, id) { for (var i = 0; i < z.blocks.length; i++) if (z.blocks[i].id === id) return z.blocks[i]; return null; }
export function jointFor(z, childId) { for (var i = 0; i < z.joints.length; i++) if (z.joints[i].blockB === childId) return z.joints[i]; return null; }
export function children(z, id) { return z.blocks.filter(function (b) { return b.mount && b.mount.parent === id; }); }

// Swing limits follow the swing, with a little slack for knocks; limbs driven by a path bend freely.
export function fitLimits(j) { var lim = Math.max(20, Math.abs(j.motion.amplitude) + 15); j.minAngle = -lim; j.maxAngle = lim; }

function defaultHinge(qRest) {
  var zW = qRot(qRest, HINGES.swing), yW = qRot(qRest, HINGES.sweep);
  if (Math.abs(zW[2]) > 0.7) return 'swing';
  if (Math.abs(yW[1]) > 0.7) return 'sweep';
  return 'swing';
}

function onCentreline(face, at) { return face !== '+z' && face !== '-z' && Math.abs(at[1]) < 0.04; }
function mirrorFace(face) { return face === '+z' ? '-z' : face === '-z' ? '+z' : face; }
function mirrorAt(face, at) { return face === '+z' || face === '-z' ? at.slice() : [at[0], -at[1]]; }

/* Attach a new blob of `kind` to `parentId` on `face` at `at`. With opts.mirror, a part off the
 * centreline (or on a part that already has a twin) gets a mirror-image twin on the other side, on the
 * opposite beat. Returns the new block (or null when the Zook is full). */
export function attach(z, kind, parentId, face, at, opts) {
  opts = opts || {};
  var parent = block(z, parentId);
  if (!parent || !FACES[face]) return null;
  at = [clamp(num(at[0], 0), -0.5, 0.5), clamp(num(at[1], 0), -0.5, 0.5)];
  var twinParent = parent.twin ? block(z, parent.twin) : parent;
  var wantTwin = opts.mirror && (parent.twin || !onCentreline(face, at));
  if (z.blocks.length + (wantTwin ? 2 : 1) > MAX_BLOCKS) return null;
  var p = PARTS[kind] || PARTS.leg;
  var swingers = z.joints.filter(function (j) { return j.motion.amplitude > 0; }).length;
  var phase = opts.phase != null ? opts.phase : (swingers % 2 ? 0.5 : 0);
  var amp = opts.amplitude != null ? opts.amplitude : kind === 'foot' || kind === 'body' ? 0 : 30;
  var b = makePart(z, kind, p, parentId, face, at, opts.lean || 0, opts.splay || 0, phase, amp);
  if (wantTwin) {
    var pj = jointFor(z, parent.id), tj = parent.twin && jointFor(z, parent.twin);
    var offset = pj && tj ? tj.motion.phase - pj.motion.phase : 0.5;
    var t = makePart(z, kind, p, twinParent.id, mirrorFace(face), mirrorAt(face, at), opts.lean || 0, -(opts.splay || 0), (phase + offset + 1) % 1, amp);
    b.twin = t.id; t.twin = b.id;
  }
  return b;
}

function makePart(z, kind, p, parentId, face, at, lean, splay, phase, amp) {
  var b = { id: nextId(z.blocks, 'b'), kind: kind, size: p.size.slice(), square: p.square, point: p.point, friction: p.friction, colour: p.colour, eyes: false,
    mount: { parent: parentId, face: face, at: at, lean: lean, splay: splay, hinge: 'swing' } };
  z.blocks.push(b);
  var j = { id: nextId(z.joints, 'j'), blockA: parentId, blockB: b.id, minAngle: -45, maxAngle: 45,
    motion: { amplitude: amp, phase: phase }, aim: { on: false, angle: 30 } };
  fitLimits(j);
  z.joints.push(j);
  b.mount.hinge = defaultHinge(pose(z).blocks[b.id].q);
  return b;
}

/* Attach a ready-made limb (LIMBS[preset]); with opts.mirror the whole limb gets a twin. Returns the
 * first (top) block. Walking legs come with a stepping loop on their tip, on opposite beats left/right. */
export function attachLimb(z, preset, parentId, face, at, opts) {
  opts = opts || {};
  var L = LIMBS[preset];
  if (!L) return attach(z, preset, parentId, face, at, opts);
  var room = MAX_BLOCKS - z.blocks.length, need = L.parts.length * (opts.mirror && (block(z, parentId).twin || !onCentreline(face, at)) ? 2 : 1);
  if (need > room) return null;
  var phase = opts.phase != null ? opts.phase : 0;
  // on the sides, walking legs sprawl like a lizard's: out and down, hip sweeping forwards and back
  var side = L.path && (face === '+z' || face === '-z');
  var top = attach(z, L.parts[0], parentId, face, at, { mirror: opts.mirror, lean: opts.lean != null ? opts.lean : side ? -15 : 0, splay: opts.splay, phase: phase, amplitude: L.path ? 0 : L.wave ? 25 : 0 });
  if (side) [top].concat(top.twin ? [block(z, top.twin)] : []).forEach(function (b) { b.mount.hinge = 'sweep'; });
  var prev = top;
  for (var i = 1; i < L.parts.length; i++) {
    var kind = L.parts[i], last = i === L.parts.length - 1;
    var nb = attach(z, kind, prev.id, '+x', [0, 0], { mirror: opts.mirror, lean: kind === 'foot' ? 70 : i === 1 ? (side ? -70 : L.knee) : -L.knee * 0.4,
      phase: L.wave ? (phase + i * 0.2) % 1 : phase, amplitude: L.wave ? 25 + 10 * i : 0 });
    if (side && i === 1) [nb].concat(nb.twin ? [block(z, nb.twin)] : []).forEach(function (b) { b.mount.hinge = 'swing'; });
    if (L.aim && last) { nb.size = [40, 30, 30]; nb.eyes = true; nb.colour = '#38b6ff'; var tw = nb.twin && block(z, nb.twin); if (tw) { tw.size = nb.size.slice(); tw.eyes = true; tw.colour = nb.colour; } }
    prev = nb;
  }
  if (L.aim) [top].concat(top.twin ? [block(z, top.twin)] : []).forEach(function (b) {
    var j = jointFor(z, b.id); j.aim = { on: true, angle: 35 };
    b.mount.hinge = 'sweep';
  });
  if (L.path) {
    defaultPath(z, prev.id, phase);
    if (prev.twin) { defaultPath(z, prev.twin, (phase + 0.5) % 1); }
  }
  return top;
}

// Copy a part's shape, grip, colour, tilt, hinge, swing and path onto its twin (mirrored). Timing stays its own.
export function syncTwin(z, b) {
  var t = b && b.twin && block(z, b.twin);
  if (!t) return;
  t.size = b.size.slice(); t.square = b.square; t.point = b.point; t.friction = b.friction; t.colour = b.colour; t.eyes = b.eyes;
  if (b.mount && t.mount) {
    t.mount.lean = b.mount.lean; t.mount.splay = -b.mount.splay; t.mount.hinge = b.mount.hinge;
    t.mount.at = mirrorAt(b.mount.face, b.mount.at);
  }
  if (b.path) t.path = { points: b.path.points.map(function (p) { return p.slice(); }), phase: t.path ? t.path.phase : (b.path.phase + 0.5) % 1 };
  else delete t.path;
  var j = jointFor(z, b.id), tj = jointFor(z, t.id);
  if (j && tj) { tj.motion.amplitude = j.motion.amplitude; tj.minAngle = j.minAngle; tj.maxAngle = j.maxAngle; tj.aim = { on: j.aim.on, angle: j.aim.angle }; }
}

// The ids of a block and everything hanging off it.
export function subtree(z, id) {
  var out = {}; out[id] = true;
  var grew = true;
  while (grew) {
    grew = false;
    z.blocks.forEach(function (c) { if (!out[c.id] && c.mount && out[c.mount.parent]) { out[c.id] = true; grew = true; } });
  }
  return out;
}

/* Move a part (and everything hanging off it) to a new spot: `parentId`, `face`, `at`. Its twin moves to the
 * mirror-image spot. Moving a part onto the middle line (where its twin would land on top of it) removes the
 * twin. Returns false if the spot isn't allowed (on the part itself, or on anything hanging off it or its twin). */
export function move(z, id, parentId, face, at) {
  var b = block(z, id), parent = block(z, parentId);
  if (!b || !b.mount || !parent || !FACES[face]) return false;
  var mine = subtree(z, id), twin = b.twin && block(z, b.twin), theirs = twin ? subtree(z, twin.id) : {};
  if (mine[parentId] || theirs[parentId]) return false;
  at = [Math.round(clamp(num(at[0], 0), -0.5, 0.5) * 100) / 100, Math.round(clamp(num(at[1], 0), -0.5, 0.5) * 100) / 100];
  var wasSide = b.mount.face === '+z' || b.mount.face === '-z', isSide = face === '+z' || face === '-z';
  b.mount.parent = parentId; b.mount.face = face; b.mount.at = at;
  jointFor(z, id).blockA = parentId;
  if (twin) {
    if (!parent.twin && onCentreline(face, at)) { delete b.twin; delete twin.twin; remove(z, twin.id); }
    else {
      var tp = parent.twin || parentId;
      twin.mount.parent = tp; twin.mount.face = mirrorFace(face); twin.mount.at = mirrorAt(face, at);
      jointFor(z, twin.id).blockA = tp;
    }
  }
  // A walking leg moved between underneath and a side takes that spot's posture (like a fresh one would)
  if (wasSide !== isSide) [b].concat(b.twin ? [block(z, b.twin)] : []).forEach(function (top) { limbPosture(z, top, isSide); });
  return true;
}

// Posture for a limb that walks on a stepping loop: sprawled out and down on a side (hip sweeps forwards and
// back, knee lifts), or hanging straight down underneath. Its loops are redrawn to fit.
function limbPosture(z, top, side) {
  var tips = z.blocks.filter(function (t) { return t.path && Z_chainTop(z, t.id) === top.id; });
  if (!tips.length) return;
  top.mount.hinge = side ? 'sweep' : 'swing'; top.mount.lean = side ? -15 : 0;
  var knee = children(z, top.id).filter(function (c) { return tips.some(function (t) { return chainOf(z, t.id).blocks.indexOf(c.id) >= 0; }); })[0];
  if (knee) { knee.mount.hinge = 'swing'; knee.mount.lean = side ? -70 : -30; }
  tips.forEach(function (t) { defaultPath(z, t.id, t.path.phase); });
}
function Z_chainTop(z, tipId) { return chainOf(z, tipId).blocks[0]; }

// Remove a block, its twin, everything hanging off them, and their joints. The root block stays.
export function remove(z, id) {
  var b = block(z, id);
  if (!b || !b.mount) return [];
  var gone = {}; gone[id] = true;
  if (b.twin) gone[b.twin] = true;
  var changed = true;
  while (changed) {
    changed = false;
    z.blocks.forEach(function (c) { if (!gone[c.id] && c.mount && gone[c.mount.parent]) { gone[c.id] = true; changed = true; } });
  }
  z.blocks = z.blocks.filter(function (c) { return !gone[c.id]; });
  z.joints = z.joints.filter(function (j) { return !gone[j.blockA] && !gone[j.blockB]; });
  z.blocks.forEach(function (c) { if (c.twin && gone[c.twin]) delete c.twin; });
  return Object.keys(gone);
}

/* ------------------------------------------------------------------ pose (forward kinematics) */

// Rest transform of block b given its parent's transform; `ang` = joint bend in degrees.
function place(z, b, parentT, ang) {
  var m = b.mount, pb = block(z, m.parent);
  var anchor = add(parentT.p, qRot(parentT.q, facePoint(pb, m.face, m.at)));
  var qRest = qMul(qMul(qMul(parentT.q, FACES[m.face].q), qAxis([0, 1, 0], num(m.splay, 0) * DEG)), qAxis([0, 0, 1], num(m.lean, 0) * DEG));
  var hingeLocal = HINGES[m.hinge] || HINGES.swing;
  var q = ang ? qMul(qRest, qAxis(hingeLocal, ang * DEG)) : qRest;
  var reach = b.size[0] / 2 - Math.min(b.size[1] / 2, b.size[0] / 4);
  return { p: add(anchor, qRot(q, [reach, 0, 0])), q: q, size: b.size, anchor: anchor, axis: qRot(qRest, hingeLocal) };
}

/* Where every block sits: { blocks: { id: { p, q, size } }, anchors: { jointId: p }, axes: { jointId: dir } }.
 * `angles` maps joint ids to bends in degrees (from motionAngles); omit it for the built pose. */
export function pose(z, angles) {
  var out = {}, anchors = {}, axes = {};
  z.blocks.forEach(function (b, i) {
    var parent = b.mount && out[b.mount.parent];
    if (i === 0 || !parent) { out[b.id] = { p: [0, 0, 0], q: QI, size: b.size }; return; }
    var j = jointFor(z, b.id);
    var t = place(z, b, parent, angles && j ? angles[j.id] || 0 : 0);
    out[b.id] = t;
    if (j) { anchors[j.id] = t.anchor; axes[j.id] = t.axis; }
  });
  return { blocks: out, anchors: anchors, axes: axes };
}

export function tipOf(b, t) { return add(t.p, qRot(t.q, [b.size[0] / 2, 0, 0])); }

export function bounds(z, p) {
  p = p || pose(z);
  var b = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  z.blocks.forEach(function (blk) {
    var t = p.blocks[blk.id];
    blobGrid(blk, 6, 8).forEach(function (row) { row.forEach(function (lp) {
      var c = add(t.p, qRot(t.q, lp));
      for (var k = 0; k < 3; k++) { b.min[k] = Math.min(b.min[k], c[k]); b.max[k] = Math.max(b.max[k], c[k]); }
    }); });
  });
  return b;
}

// Which face of a block does the local-space point lp sit nearest, and where on it? (for drag & drop)
export function faceAt(size, lp) {
  var best = null;
  Object.keys(FACES).forEach(function (k) {
    var f = FACES[k], d = dot(lp, f.n) / (dimAlong(size, f.n) / 2);
    if (!best || d > best.d) best = { face: k, d: d };
  });
  var f = FACES[best.face];
  var snap = function (v) { v = clamp(v, -0.5, 0.5); return Math.abs(v) < 0.06 ? 0 : Math.round(v * 20) / 20; };
  return { face: best.face, at: [snap(dot(lp, f.y) / dimAlong(size, f.y)), snap(dot(lp, f.z) / dimAlong(size, f.z))] };
}

/* ------------------------------------------------------------------ IK motion paths */

// A limb tip's chain: the joints (top first, up to 3) its motion path drives, and the block they hang from.
export function chainOf(z, tipId) {
  var ids = [], b = block(z, tipId);
  while (b && b.mount && ids.length < 3) { ids.unshift(b.id); b = block(z, b.mount.parent); }
  return { blocks: ids, base: b ? b.id : z.blocks[0].id };
}

// Which path tip (if any) drives this block's joint?
export function drivenBy(z, id) {
  for (var i = 0; i < z.blocks.length; i++) {
    var t = z.blocks[i];
    if (t.path && t.path.points.length >= 2 && chainOf(z, t.id).blocks.indexOf(id) >= 0) return t.id;
  }
  return null;
}

// The chain in the base block's frame, with joint bends `angs` (degrees, top first).
function chainFK(z, chain, angs) {
  var T = { p: [0, 0, 0], q: QI }, out = [];
  chain.blocks.forEach(function (id, k) { T = place(z, block(z, id), T, angs[k]); out.push(T); });
  return out;
}

// The plane a path lives in (base frame): a side view (u = forwards, v = up) through the limb's foot,
// whichever way its joints hinge, so the same loop works for legs underneath and legs out to the side.
export function pathFrame(z, tipId) {
  var chain = chainOf(z, tipId);
  var fk = chainFK(z, chain, chain.blocks.map(function () { return 0; }));
  var o = fk[0].anchor, tip = tipOf(block(z, tipId), fk[fk.length - 1]), rel = sub(tip, o);
  var U = [1, 0, 0], V = [0, 1, 0], W = [0, 0, 1];
  return { chain: chain, origin: add(o, scale(W, rel[2])), U: U, V: V, axis: W, rest: [rel[0], rel[1]] };
}

// A stepping loop under the tip: push back along the ground, lift, swing forwards.
export function defaultPath(z, tipId, phase) {
  var b = block(z, tipId), f = pathFrame(z, tipId), r = f.rest;
  var reach = Math.max(10, len([r[0], r[1], 0]));
  var stride = Math.round(reach * 0.55), lift = Math.round(reach * 0.3), down = Math.round(reach * 0.06);
  b.path = { points: [[r[0] + stride / 2, r[1] - down], [r[0] - stride / 2, r[1] - down], [r[0] - stride / 4, r[1] + lift], [r[0] + stride / 4, r[1] + lift]].map(function (p) { return [Math.round(p[0]), Math.round(p[1])]; }),
    phase: phase || 0 };
  chainOf(z, tipId).blocks.forEach(function (id) { var j = jointFor(z, id); j.motion.amplitude = 0; j.minAngle = -120; j.maxAngle = 120; });
  return b.path;
}

// Position on a closed loop of points at fraction s (0–1), evenly by distance.
export function pathAt(points, s) {
  var n = points.length, lens = [], total = 0;
  for (var i = 0; i < n; i++) { var a = points[i], b = points[(i + 1) % n]; var l = Math.hypot(b[0] - a[0], b[1] - a[1]); lens.push(l); total += l; }
  if (total < 1e-6) return points[0].slice();
  var d = (((s % 1) + 1) % 1) * total;
  for (i = 0; i < n; i++) {
    if (d <= lens[i] || i === n - 1) { var f = lens[i] ? d / lens[i] : 0, p = points[i], q = points[(i + 1) % n]; return [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f]; }
    d -= lens[i];
  }
  return points[0].slice();
}

// Solve a chain's bends so its tip reaches `target` (base frame), by cyclic coordinate descent.
function solveIK(z, chain, tipBlock, target, angs, limits, iters) {
  for (var it = 0; it < (iters || 10); it++) {
    for (var k = angs.length - 1; k >= 0; k--) {
      var fk = chainFK(z, chain, angs), tip = tipOf(tipBlock, fk[fk.length - 1]);
      var n = norm(fk[k].axis), a = sub(tip, fk[k].anchor), b = sub(target, fk[k].anchor);
      a = sub(a, scale(n, dot(a, n))); b = sub(b, scale(n, dot(b, n)));
      if (len(a) < 1e-3 || len(b) < 1e-3) continue;
      var delta = Math.atan2(dot(n, cross(a, b)), dot(a, b)) / DEG;
      angs[k] = clamp(angs[k] + delta, limits[k][0], limits[k][1]);
    }
  }
  return angs;
}

/* A motion controller for one Zook: angles(t, steer) gives every joint's bend (degrees) at time t.
 * steer = { turn: -1 (hard left) … 1 (hard right), aim: bearing to target in degrees (+ = left) } or null.
 * IK solutions warm-start from the last call, so limbs move smoothly. */
export function controller(z) {
  var period = Math.max(0.25, num(z.motion && z.motion.period, 1));
  var sharp = clamp(num(z.motion && z.motion.sharpness, 0.6), 0, 1);
  var restPose = pose(z), root = z.blocks[0];
  // which side of the body each part is on (for steering): z in the root's frame at its anchor
  function side(id) {
    var c = chainOf(z, id), top = c.blocks[0], b = block(z, top), t = restPose.blocks[top];
    if (!b || !b.mount) return 0;
    var zpos = t.anchor ? t.anchor[2] : 0;
    return Math.abs(zpos) < 3 ? 0 : zpos > 0 ? 1 : -1;
  }
  var paths = z.blocks.filter(function (b) { return b.path && b.path.points.length >= 2; }).map(function (b) {
    var f = pathFrame(z, b.id), lim = f.chain.blocks.map(function (id) { var j = jointFor(z, id); return [j.minAngle, j.maxAngle]; });
    var cx = b.path.points.reduce(function (s, p) { return s + p[0]; }, 0) / b.path.points.length;
    return { tip: b, frame: f, limits: lim, angs: f.chain.blocks.map(function () { return 0; }), side: side(b.id), cx: cx,
      joints: f.chain.blocks.map(function (id) { return jointFor(z, id).id; }) };
  });
  var driven = {};
  paths.forEach(function (p) { p.joints.forEach(function (id) { driven[id] = true; }); });
  var sides = {};
  z.joints.forEach(function (j) { sides[j.id] = side(j.blockB); });

  // how much of its stride/swing each side keeps while turning (1 = full, -1 = backwards)
  function sideFactor(s, steer) {
    if (!steer || !s || !steer.turn) return 1;
    var inner = (steer.turn < 0 && s < 0) || (steer.turn > 0 && s > 0);
    return inner ? 1 - Math.abs(steer.turn) * (0.6 + 1.4 * sharp) : 1;
  }

  return {
    period: period, paths: paths,
    angles: function (t, steer) {
      var out = {};
      z.joints.forEach(function (j) {
        if (driven[j.id]) return;
        var amp = num(j.motion.amplitude, 0) * sideFactor(sides[j.id], steer);
        var a = amp * Math.sin(2 * Math.PI * (t / period + num(j.motion.phase, 0)));
        if (steer && j.aim && j.aim.on) {
          var b = block(z, j.blockB), ax = restPose.axes[j.id] || [0, 1, 0];
          if (b && Math.abs(ax[1]) > 0.5) a += clamp(steer.aim * Math.sign(ax[1]) * 0.9, -j.aim.angle, j.aim.angle);
        }
        out[j.id] = clamp(a, j.minAngle, j.maxAngle);
      });
      paths.forEach(function (p) {
        var k = sideFactor(p.side, steer);
        var uv = pathAt(p.tip.path.points, t / period + num(p.tip.path.phase, 0));
        uv = [p.cx + (uv[0] - p.cx) * k, uv[1]];
        var f = p.frame, target = add(add(f.origin, scale(f.U, uv[0])), scale(f.V, uv[1]));
        solveIK(z, f.chain, p.tip, target, p.angs, p.limits, p.warm ? 4 : 12); // warm-started from the last call
        p.warm = true;
        p.joints.forEach(function (id, i) { out[id] = p.angs[i]; });
      });
      return out;
    }
  };
}

/* ------------------------------------------------------------------ tidy any input */

// Make any Zook JSON (imported files, share links, old saves) into a safe, complete document.
// Version 1 (2D prototype) and 2 (3D boxes) Zooks are converted.
export function normalise(src) {
  src = src && typeof src === 'object' ? src : {};
  var ver = Number(src.version) || 1;
  var m0 = src.motion || {};
  var periods = (Array.isArray(src.joints) ? src.joints : []).map(function (j) { return j && j.motion && Number(j.motion.period); }).filter(function (p) { return p > 0; });
  var z = { version: VERSION, id: String(src.id || uid('zook')).slice(0, 60), name: String(src.name || 'My Zook').slice(0, 40),
    motion: { period: clamp(num(m0.period, periods.length ? periods[0] : 1), 0.3, 3), sharpness: clamp(num(m0.sharpness, 0.6), 0, 1),
      smoothness: clamp(num(m0.smoothness, 0.5), 0, 1), power: clamp(num(m0.power, 1), 0.3, 2.5) },
    blocks: [], joints: [], best: {} };
  if (ver === VERSION && src.best && typeof src.best === 'object') Object.keys(CONTESTS).forEach(function (k) {
    if (src.best[k] !== null && isFinite(Number(src.best[k]))) z.best[k] = Math.round(Number(src.best[k]) * 100) / 100;
  });
  var seen = {};
  (Array.isArray(src.blocks) ? src.blocks : []).slice(0, MAX_BLOCKS).forEach(function (b, i) {
    if (!b || typeof b !== 'object') return;
    var id = String(b.id || 'b' + (i + 1)).slice(0, 20);
    if (seen[id]) return;
    var kind = PARTS[b.kind] ? b.kind : b.isFoot ? 'foot' : 'leg', P = PARTS[kind];
    var size = Array.isArray(b.size) ? b.size : P.size;
    var nb = { id: id, kind: kind,
      size: [clamp(num(size[0], 60), 6, 220), clamp(num(size[1], 20), 4, 140), clamp(num(size[2], P.size[2]), 4, 160)],
      square: clamp(num(b.square, ver < 3 ? 0.85 : P.square), 0, 1), point: clamp(num(b.point, 0), 0, 1),
      friction: clamp(num(b.friction, 0.5), 0, 2),
      colour: /^#[0-9a-f]{6}$/i.test(b.colour || '') ? b.colour : P.colour, eyes: b.eyes != null ? !!b.eyes : i === 0 };
    var m = b.mount;
    if (m && seen[m.parent] && Array.isArray(m.at)) {
      if (ver === 1) nb.mount = fromV1(m);
      else if (FACES[m.face]) nb.mount = { parent: String(m.parent), face: m.face,
        at: [clamp(num(m.at[0], 0), -0.5, 0.5), clamp(num(m.at[1], 0), -0.5, 0.5)],
        lean: clamp(num(m.lean, 0), -180, 180), splay: clamp(num(m.splay, 0), -90, 90), hinge: HINGES[m.hinge] ? m.hinge : 'swing' };
    }
    if (ver > 1 && typeof b.twin === 'string') nb.twin = b.twin.slice(0, 20);
    if (b.path && Array.isArray(b.path.points)) {
      var pts = b.path.points.filter(function (p) { return Array.isArray(p) && isFinite(Number(p[0])) && isFinite(Number(p[1])); }).slice(0, 12)
        .map(function (p) { return [clamp(Math.round(Number(p[0])), -400, 400), clamp(Math.round(Number(p[1])), -400, 400)]; });
      if (pts.length >= 2) nb.path = { points: pts, phase: ((num(b.path.phase, 0) % 1) + 1) % 1 };
    }
    seen[id] = true;
    z.blocks.push(nb);
  });
  if (!z.blocks.length) z.blocks = newZook().blocks;
  delete z.blocks[0].mount; delete z.blocks[0].twin; delete z.blocks[0].path;
  z.blocks.forEach(function (b) { var t = b.twin && block(z, b.twin); if (!t || t.twin !== b.id || t === b) delete b.twin; });
  var paired = {};
  (Array.isArray(src.joints) ? src.joints : []).forEach(function (j, i) {
    if (!j || !seen[j.blockA] || !seen[j.blockB] || j.blockA === j.blockB || paired[j.blockB]) return;
    var m = j.motion || {}, aim = j.aim || {};
    paired[j.blockB] = true;
    z.joints.push({ id: String(j.id || 'j' + (i + 1)).slice(0, 20), blockA: j.blockA, blockB: j.blockB,
      minAngle: clamp(num(j.minAngle, -45), -150, 0), maxAngle: clamp(num(j.maxAngle, 45), 0, 150),
      motion: { amplitude: clamp(num(m.amplitude, 0), 0, 90), phase: ((num(m.phase, 0) % 1) + 1) % 1 },
      aim: { on: !!aim.on, angle: clamp(num(aim.angle, 30), 5, 90) } });
  });
  z.blocks = z.blocks.filter(function (b, i) { return i === 0 || b.mount; });
  z.joints = z.joints.filter(function (j) { var b = block(z, j.blockB); return b && b.mount; });
  z.blocks.forEach(function (b) {
    if (!b.mount) return;
    var j = jointFor(z, b.id);
    if (!j) { j = { id: nextId(z.joints, 'j'), blockB: b.id, minAngle: -20, maxAngle: 20, motion: { amplitude: 0, phase: 0 }, aim: { on: false, angle: 30 } }; z.joints.push(j); }
    j.blockA = b.mount.parent;
  });
  return z;
}

// 2D prototype mounts: at = [u, v] on the parent's outline (screen y down), angle relative to the parent.
function fromV1(m) {
  var u = clamp(num(m.at[0], 0), -0.5, 0.5), v = clamp(num(m.at[1], 0), -0.5, 0.5), face, a, normal;
  if (Math.abs(v) >= 0.49) { face = v > 0 ? '-y' : '+y'; a = v > 0 ? u : -u; normal = v > 0 ? 90 : -90; }
  else { face = u >= 0 ? '+x' : '-x'; a = u >= 0 ? -v : v; normal = u >= 0 ? 0 : 180; }
  var d = ((num(m.angle, normal) - normal) % 360 + 540) % 360 - 180;
  return { parent: String(m.parent), face: face, at: [a, 0], lean: -d, splay: 0, hinge: 'swing' };
}

/* ------------------------------------------------------------------ starter Zooks */

function setSwing(z, b, amplitude, phase) {
  var j = jointFor(z, b.id);
  j.motion = { amplitude: amplitude, phase: phase };
  fitLimits(j);
}

export var STARTER_TUNING = {
  scuttler: { period: 0.6, stride: 50, lift: 8, ph: [0, 0.25], at: 0.4, lean: 0, splay: 15, knee: -70, hipLen: 50, kneeLen: 46, sharp: 0.5, smooth: 0.8, power: 2 },
  crab:     { period: 1.2, amp: 40, ph: [0, 0], offset: 0.5, lean: -15, sharp: 0.6 },
  wriggler: { period: 0.6, amp1: 40, amp2: 50, phase: 0.25, f: ['grippy', 'normal', 'normal'] },
  hopper:   { period: 0.7, amp: 60, lean: 0, knee: -90, kneeAmp: 70, kneePhase: 0, power: 2 }
};

// Ready-made creatures that really do move, tuned headlessly with runHeadless.
export var STARTERS = {
  scuttler: { label: 'Scuttler', blurb: 'Four sprawling legs following stepping loops. Steers well.', make: function (c) {
    c = c || STARTER_TUNING.scuttler;
    var z = newZook('Scuttler'), body = z.blocks[0];
    body.size = [100, 30, 56]; body.square = 0.45;
    z.motion.period = c.period; z.motion.sharpness = c.sharp; z.motion.smoothness = c.smooth; z.motion.power = c.power;
    [[c.at, c.ph[0]], [-c.at, c.ph[1]]].forEach(function (row) {
      // on the right-hand face, across-the-face z points backwards, so -row[0] is towards the front
      var hip = attach(z, 'leg', body.id, '+z', [0, -row[0]], { mirror: true, lean: c.lean, splay: c.splay * (row[0] > 0 ? 1 : -1), amplitude: 0, phase: row[1] });
      var knee = attach(z, 'leg', hip.id, '+x', [0, 0], { mirror: true, lean: c.knee, amplitude: 0 });
      [hip, block(z, hip.twin)].forEach(function (h) { h.mount.hinge = 'sweep'; h.size = [c.hipLen, 14, 14]; });
      [knee, block(z, knee.twin)].forEach(function (k, i) {
        k.mount.hinge = 'swing'; k.friction = FRICTION.grippy; k.colour = '#ff751f'; k.size = [c.kneeLen, 14, 14];
        var p = defaultPath(z, k.id, (row[1] + i * 0.5) % 1), r = pathFrame(z, k.id).rest;
        p.points = [[r[0] + c.stride / 2, r[1] - 3], [r[0] - c.stride / 2, r[1] - 3], [r[0] - c.stride / 4, r[1] + c.lift], [r[0] + c.stride / 4, r[1] + c.lift]].map(function (q) { return [Math.round(q[0]), Math.round(q[1])]; });
      });
    });
    return z;
  } },
  crab: { label: 'Crab', blurb: 'Legs out to the sides that row it along. Fast on the flat!', make: function (c) {
    c = c || STARTER_TUNING.crab;
    var z = newZook('Crab'), body = z.blocks[0];
    body.size = [70, 26, 70]; body.colour = '#e10000'; body.square = 0.7;
    z.motion.period = c.period; z.motion.sharpness = c.sharp;
    [[0.3, c.ph[0]], [-0.3, c.ph[1]]].forEach(function (row) {
      var leg = attach(z, 'long', body.id, '+z', [0, row[0]], { mirror: true, lean: c.lean, amplitude: c.amp, phase: row[1] });
      [leg, block(z, leg.twin)].forEach(function (b, i) {
        b.mount.hinge = 'sweep'; b.friction = FRICTION.grippy; b.colour = '#ff751f'; b.size = [86, 14, 14]; b.square = 0.3;
        setSwing(z, b, c.amp, (row[1] + i * c.offset) % 1);
      });
    });
    return z;
  } },
  wriggler: { label: 'Wriggler', blurb: 'No legs at all: three segments that ripple along.', make: function (c) {
    c = c || STARTER_TUNING.wriggler;
    var z = newZook('Wriggler'), a = z.blocks[0];
    z.motion.period = c.period;
    a.size = [60, 20, 44]; a.friction = FRICTION[c.f[0]]; a.square = 0.6;
    var b = attach(z, 'body', a.id, '-x', [0, 0]); b.size = [60, 20, 44]; b.friction = FRICTION[c.f[1]]; b.colour = '#ff66c4'; b.square = 0.6;
    setSwing(z, b, c.amp1, 0);
    var d = attach(z, 'body', b.id, '+x', [0, 0]); d.size = [60, 20, 44]; d.friction = FRICTION[c.f[2]]; d.colour = '#8a63d2'; d.square = 0.6; d.point = 0.6;
    setSwing(z, d, c.amp2, c.phase);
    return z;
  } },
  hopper: { label: 'Hopper', blurb: 'Springy legs that all push at once. Built for the High Jump.', make: function (c) {
    c = c || STARTER_TUNING.hopper;
    var z = newZook('Hopper'), body = z.blocks[0];
    body.size = [70, 40, 50]; body.colour = '#00bf63'; body.square = 0.2;
    z.motion.period = c.period; z.motion.power = c.power;
    [0.3, -0.3].forEach(function (u) {
      var thigh = attach(z, 'long', body.id, '-y', [u, 0.42], { mirror: true, lean: u > 0 ? c.lean : -c.lean, amplitude: c.amp, phase: 0 });
      [thigh, block(z, thigh.twin)].forEach(function (t) { setSwing(z, t, c.amp, 0); });
      var shin = attach(z, 'long', thigh.id, '+x', [0, 0], { mirror: true, lean: u > 0 ? c.knee : -c.knee, amplitude: c.kneeAmp, phase: c.kneePhase });
      [shin, block(z, shin.twin)].forEach(function (s) { s.friction = FRICTION.grippy; s.colour = '#f59f18'; setSwing(z, s, c.kneeAmp, c.kneePhase); });
    });
    return z;
  } }
};

/* ------------------------------------------------------------------ physics (Rapier 3D) */

export var MOTOR = { stiffness: 900, damping: 60, maxForce: 400, density: 300 };
var G_GROUND = 0x0001, G_PROP = 0x0004;
function groups(member, filter) { return (member << 16) | filter; }

// Static ground + decorations (metres) for a contest; props are moving things (blocks).
function buildCourse(R, world, kind) {
  var shapes = [], props = [];
  var ground = world.createRigidBody(R.RigidBodyDesc.fixed());
  var GROUND = groups(G_GROUND, 0xffff);
  function col(desc, p, q) {
    desc.setTranslation(p[0], p[1], p[2]).setFriction(1.3).setCollisionGroups(GROUND);
    if (q) desc.setRotation({ x: q[0], y: q[1], z: q[2], w: q[3] });
    world.createCollider(desc, ground);
  }
  var floorY = kind === 'sumo' ? -1.5 : 0;
  col(R.ColliderDesc.cuboid(300, 1, 300), [0, floorY - 1, 0]);
  shapes.push({ type: 'floor', y: floorY });
  if (kind === 'sprint' || kind === 'hurdles' || kind === 'blockpush' || kind === 'highjump') shapes.push({ type: 'track', from: -2, to: kind === 'blockpush' || kind === 'highjump' ? 12 : 60, z: 0, width: 2.4 });
  if (kind === 'race') { shapes.push({ type: 'track', from: -2, to: 60, z: -1.4, width: 2.2 }); shapes.push({ type: 'track', from: -2, to: 60, z: 1.4, width: 2.2 }); }
  if (kind === 'hurdles') {
    // humps of increasing steepness: same length, taller each time
    for (var k = 0; k < 7; k++) {
      var x0 = 2.5 + k * 3.2, h = 0.06 + k * 0.05, L = 1.4;
      var pts = [[x0, 0, -2], [x0 + L / 2, h, -2], [x0 + L, 0, -2], [x0, 0, 2], [x0 + L / 2, h, 2], [x0 + L, 0, 2]];
      var flat = new Float32Array([].concat.apply([], pts));
      var d = R.ColliderDesc.convexHull(flat);
      if (d) col(d, [0, 0, 0]);
      shapes.push({ type: 'prism', x0: x0, length: L, height: h, width: 4 });
    }
  } else if (kind === 'blockpush') {
    for (var i = 0; i < 10; i++) {
      var bx = 1.8 + Math.floor(i / 5) * 0.5, bz = (i % 5 - 2) * 0.48, hs = 0.2;
      var rb = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(bx, hs + 0.001, bz).setLinearDamping(0.3).setAngularDamping(0.3));
      world.createCollider(R.ColliderDesc.cuboid(hs, hs, hs).setDensity(120).setFriction(0.6).setCollisionGroups(groups(G_PROP, 0xffff)), rb);
      props.push({ body: rb, half: [hs, hs, hs], x0: bx, colour: i % 2 ? '#ae853e' : '#c9a25a' });
    }
  } else if (kind === 'sumo') {
    col(R.ColliderDesc.cylinder(0.75, 2.6), [0, -0.75, 0]);
    shapes.push({ type: 'platform', r: 2.6, h: 1.5 });
  } else if (kind === 'lap') {
    shapes.push({ type: 'ring', c: [0, 0, -5], r: 5, width: 1.6 });
  } else if (kind === 'highjump') {
    shapes.push({ type: 'pole', x: 1.6, z: -1.1 });
  }
  return { shapes: shapes, props: props };
}

var LAP = { c: [0, 0, -5], r: 5, n: 8 };
function lapFlag(k) { var th = 2 * Math.PI * k / LAP.n; return [LAP.c[0] + LAP.r * Math.sin(th), 0, LAP.c[2] + LAP.r * Math.cos(th)]; }

/* Put one Zook into the world at `at` ([x, z]) facing `yaw` (radians about +y). Bodies start unrotated
 * (each collider carries its blob's rotation), so joint anchors and axes are given in world axes. */
function addZook(R, world, zook, at, yaw, member, filter) {
  var z = normalise(zook);
  var ps = pose(z), bb = bounds(z, ps);
  var qy = qAxis([0, 1, 0], yaw || 0);
  var centre = [(bb.min[0] + bb.max[0]) / 2, bb.min[1], (bb.min[2] + bb.max[2]) / 2];
  function toWorld(p) { var r = qRot(qy, sub(p, centre)); return [r[0] * CM + at[0], r[1] * CM + 0.03 + (at[1] || 0), r[2] * CM + at[2]]; }
  var GROUP = groups(member, filter);
  var power = clamp(num(z.motion.power, 1), 0.3, 2.5);
  var bodies = {}, list = [], vols = {};
  z.blocks.forEach(function (b) { vols[b.id] = volume(b); });
  z.blocks.forEach(function (b) {
    var t = ps.blocks[b.id], p = toWorld(t.p), q = qMul(qy, t.q);
    var rb = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(p[0], p[1], p[2]).setLinearDamping(0.05).setAngularDamping(0.2));
    var pts = [];
    blobGrid(b, 6, 10).forEach(function (row, i, rows) {
      (i === 0 || i === rows.length - 1 ? row.slice(0, 1) : row).forEach(function (lp) { var w = qRot(q, lp); pts.push(w[0] * CM, w[1] * CM, w[2] * CM); });
    });
    var cd = R.ColliderDesc.convexHull(new Float32Array(pts));
    if (!cd) { var h = scale(b.size, CM / 2); cd = R.ColliderDesc.cuboid(h[0], h[1], h[2]).setRotation({ x: q[0], y: q[1], z: q[2], w: q[3] }); }
    cd.setDensity(MOTOR.density).setFriction(b.friction).setFrictionCombineRule(R.CoefficientCombineRule.Min).setRestitution(0).setCollisionGroups(GROUP);
    world.createCollider(cd, rb);
    bodies[b.id] = rb;
    list.push({ block: b, body: rb, q0: q, vol: vols[b.id] });
  });
  // kilograms each joint has to swing: its part and everything hanging off it
  function load(id) { var m = vols[id] * 1e-6 * MOTOR.density; children(z, id).forEach(function (c) { m += load(c.id); }); return m; }
  var motors = [], ctrl = controller(z), driven = {};
  ctrl.paths.forEach(function (p) { p.joints.forEach(function (id) { driven[id] = true; }); });
  z.joints.forEach(function (j) {
    var A = bodies[j.blockA], B = bodies[j.blockB];
    if (!A || !B) return;
    var a = toWorld(ps.anchors[j.id]), axis = qRot(qy, ps.axes[j.id]), ta = A.translation(), tb = B.translation();
    var data = R.JointData.revolute({ x: a[0] - ta.x, y: a[1] - ta.y, z: a[2] - ta.z }, { x: a[0] - tb.x, y: a[1] - tb.y, z: a[2] - tb.z }, { x: axis[0], y: axis[1], z: axis[2] });
    var rj = world.createImpulseJoint(data, A, B, true);
    rj.setLimits(j.minAngle * DEG, j.maxAngle * DEG);
    rj.configureMotorModel(R.MotorModel.ForceBased);
    var kg = Math.max(0.3, load(j.blockB)) * power;
    rj.setMotorMaxForce(MOTOR.maxForce * kg);
    motors.push({ joint: j, rj: rj, kg: kg });
  });
  var zs = { zook: z, list: list, motors: motors, ctrl: ctrl, turn: 0, root: bodies[z.blocks[0].id], out: false };
  zs.start = comOf(zs);
  return zs;
}

function comOf(zs) {
  var x = 0, y = 0, zz = 0, m = 0;
  zs.list.forEach(function (o) { var t = o.body.translation(), k = o.vol; x += t.x * k; y += t.y * k; zz += t.z * k; m += k; });
  return { x: x / m, y: y / m, z: zz / m };
}

// Which way the Zook faces (on the ground), and the signed bearing (degrees, + = left) to a point.
function bearing(zs, target) {
  var r = zs.root.rotation(), f = qRot(qMul([r.x, r.y, r.z, r.w], zs.list[0].q0), [1, 0, 0]), c = comOf(zs);
  var dx = target[0] - c.x, dz = target[2] - c.z;
  var cr = f[2] * dx - f[0] * dz, dt = f[0] * dx + f[2] * dz;
  return Math.atan2(cr, dt) / DEG;
}

/* Build a contest. zooks = [yourZook, opponent?]. Returns a sim you step(); each tick every Zook's
 * controller turns towards its target and the joint motors chase the resulting angles. */
export function createSim(R, contest, zooks, opts) {
  opts = opts || {};
  contest = CONTESTS[contest] ? contest : 'sprint';
  var C = CONTESTS[contest];
  var world = new R.World({ x: 0, y: -9.81, z: 0 });
  world.timestep = STEP;
  world.numSolverIterations = 8;
  var course = buildCourse(R, world, contest);
  var two = C.two && zooks[1];
  var Z0 = 0x0002, Z1 = 0x0008, GROUND_ALL = G_GROUND | G_PROP;
  var list = [];
  if (contest === 'sumo') {
    list.push(addZook(R, world, zooks[0], [-1.2, 0, 0], 0, Z0, GROUND_ALL | Z1));
    if (two) list.push(addZook(R, world, zooks[1], [1.2, 0, 0], Math.PI, Z1, GROUND_ALL | Z0));
  } else if (contest === 'race') {
    list.push(addZook(R, world, zooks[0], [0, 0, -1.4], 0, Z0, GROUND_ALL));
    if (two) list.push(addZook(R, world, zooks[1], [0, 0, 1.4], 0, Z1, GROUND_ALL));
  } else {
    list.push(addZook(R, world, zooks[0], [0, 0, 0], 0, Z0, GROUND_ALL));
  }
  var sim = { R: R, contest: contest, C: C, world: world, course: course.shapes, props: course.props, zooks: list, t: 0,
    seconds: C.seconds || Infinity, broken: false, flags: 0, reached: 0, maxRise: 0, roamTarget: [6, 0, 0], ended: false };
  sim.targetFor = function (i) {
    var zs = list[i], c = comOf(zs);
    switch (contest) {
      case 'lap': return lapFlag(sim.flags + 1);
      case 'sumo': var o = list[1 - i]; if (!o) return [0, 0, 0]; var oc = comOf(o); return [oc.x, 0, oc.z];
      case 'roam': return sim.roamTarget;
      case 'blockpush': return [9, 0, 0];
      case 'highjump': return [c.x + 3, 0, zs.start.z];
      default: return [60, 0, zs.start.z];
    }
  };
  sim.markers = function () {
    var m = [];
    if (contest === 'lap') { for (var k = 1; k <= LAP.n; k++) m.push({ p: lapFlag(k), kind: k <= sim.flags ? 'done' : k === sim.flags + 1 ? 'target' : 'flag' }); }
    else if (contest === 'roam') m.push({ p: sim.roamTarget, kind: 'target' });
    else if (contest !== 'sumo') list.forEach(function (zs, i) { m.push({ p: sim.targetFor(i), kind: 'target', far: contest !== 'blockpush' }); });
    return m;
  };
  sim.setTarget = function (p) { if (contest === 'roam') sim.roamTarget = [p[0], 0, p[2]]; };
  sim.step = function () { step(sim); };
  sim.com = function (i) { return comOf(list[i || 0]); };
  sim.done = function () { return sim.ended || sim.broken || (sim.seconds !== Infinity && sim.t >= sim.seconds - 1e-9); };
  sim.free = function () { try { world.free(); } catch (e) { /* already freed */ } };
  sim.result = function () { return result(sim); };
  return sim;
}

function step(sim) {
  if (sim.done()) return;
  var t = sim.t + STEP, ease = Math.min(1, t / 0.5);
  sim.zooks.forEach(function (zs, i) {
    var m = zs.zook.motion, target = sim.targetFor(i), e = bearing(zs, target);
    // turning smoothness: how far off course before turning hard, and how quickly the turn builds
    var want = clamp(e / (12 + 50 * m.smoothness), -1, 1);
    zs.turn += (want - zs.turn) * (0.25 - 0.22 * m.smoothness);
    // turn > 0 means turn left (target on the left): the left side (z < 0) is the inside
    var steer = { turn: -zs.turn, aim: e };
    var ang = zs.ctrl.angles(t, steer);
    zs.motors.forEach(function (mo) {
      var a = (ang[mo.joint.id] || 0) * ease;
      mo.rj.configureMotorPosition(a * DEG, MOTOR.stiffness * mo.kg, MOTOR.damping * mo.kg);
    });
  });
  sim.world.step();
  sim.t = t;
  sim.zooks.forEach(function (zs, i) {
    var c = comOf(zs);
    if (!isFinite(c.x) || !isFinite(c.y) || c.y < -30 || c.y > 80) sim.broken = true;
    if (i === 0) sim.maxRise = Math.max(sim.maxRise, c.y - zs.start.y);
    if (sim.contest === 'sumo' && !zs.out && (c.y < -0.7 || Math.hypot(c.x, c.z) > 3.2)) zs.out = true;
  });
  var c0 = comOf(sim.zooks[0]);
  if (sim.contest === 'lap') {
    var f = lapFlag(sim.flags + 1);
    if (Math.hypot(c0.x - f[0], c0.z - f[2]) < 0.9) { sim.flags++; if (sim.flags >= LAP.n) { sim.ended = true; sim.lapTime = sim.t; } }
  } else if (sim.contest === 'roam') {
    if (Math.hypot(c0.x - sim.roamTarget[0], c0.z - sim.roamTarget[2]) < 0.7) { sim.reached++; sim.justReached = sim.t; sim.roamTarget = [c0.x + 6 * Math.cos(sim.reached * 2.2), 0, c0.z + 6 * Math.sin(sim.reached * 2.2)]; }
  } else if (sim.contest === 'sumo') {
    if (sim.zooks.some(function (zs) { return zs.out; })) sim.ended = true;
  }
}

// The contest's score for the player's Zook (index 0), plus a short sentence about it.
function result(sim) {
  var zs = sim.zooks[0], c = comOf(zs), C = sim.C, r = { contest: sim.contest, unit: C.unit, broken: sim.broken };
  switch (sim.contest) {
    case 'blockpush':
      r.score = sim.props.reduce(function (s, p) { return s + Math.max(0, p.body.translation().x - p.x0); }, 0);
      r.text = r.score.toFixed(1) + ' m of blocks shoved'; break;
    case 'highjump':
      r.score = Math.max(0, sim.maxRise * 100); r.text = Math.round(r.score) + ' cm high'; break;
    case 'lap':
      r.score = sim.flags; r.text = sim.flags >= LAP.n ? 'Full lap in ' + sim.lapTime.toFixed(1) + ' s' : sim.flags + ' of ' + LAP.n + ' flags';
      if (sim.flags >= LAP.n) r.score = LAP.n + Math.max(0, (60 - sim.lapTime) / 60); // faster laps score higher
      break;
    case 'roam':
      r.score = sim.reached; r.text = sim.reached + (sim.reached === 1 ? ' target' : ' targets') + ' reached'; break;
    case 'sumo':
      var o = sim.zooks[1];
      if (!o) { r.score = 0; r.text = 'No opponent'; break; }
      var me = zs.out, them = o.out;
      if (me !== them) r.win = !me;
      else { var dc = Math.hypot(c.x, c.z), oc = comOf(o), dO = Math.hypot(oc.x, oc.z); r.win = me ? null : dc < dO; r.points = !me; }
      r.score = r.win ? 1 : 0;
      r.text = r.win === null ? 'Both fell off!' : r.win ? (r.points ? 'Won on points (nearer the middle)' : 'Pushed them off!') : (r.points ? 'Lost on points' : 'Pushed off!');
      break;
    case 'race':
      r.score = c.x - zs.start.x;
      if (sim.zooks[1]) { var oc2 = comOf(sim.zooks[1]), od = oc2.x - sim.zooks[1].start.x; r.win = r.score > od; r.other = od; }
      r.text = r.score.toFixed(1) + ' m' + (r.other != null ? ' vs ' + r.other.toFixed(1) + ' m' : ''); break;
    default:
      r.score = c.x - zs.start.x; r.text = r.score.toFixed(1) + ' m';
  }
  if (r.score != null && !isFinite(r.score)) r.score = 0;
  return r;
}

// World transform of each block of Zook i, for drawing.
export function transforms(sim, i) {
  return sim.zooks[i || 0].list.map(function (o) {
    var t = o.body.translation(), r = o.body.rotation();
    return { id: o.block.id, p: [t.x, t.y, t.z], q: qMul([r.x, r.y, r.z, r.w], o.q0) };
  });
}

// Run a whole contest without drawing (tests and tuning). Free roam is capped at 30 s.
export function runHeadless(R, zook, contest, opponent) {
  var sim = createSim(R, contest || 'sprint', [zook, opponent]);
  var cap = sim.seconds === Infinity ? 30 : sim.seconds;
  while (!sim.done() && sim.t < cap - 1e-9) sim.step();
  var r = sim.result(), c = sim.com(0);
  r.sideways = c.z - sim.zooks[0].start.z; r.seconds = sim.t;
  sim.free();
  return r;
}
