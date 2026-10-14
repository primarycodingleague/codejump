// CodeJump 3D Print Lab — the model (no DOM; runs in Node too).
//
// Pupils design things to 3D print from ready-made shapes: drop shapes on the build plate, size them in
// millimetres, turn any shape into a HOLE, and GROUP shapes so the holes cut the solid shapes. The real
// shape maths (joining and cutting) is done by Manifold (print/vendor/manifold.js, Apache-2.0), which always
// gives closed, printable meshes. createModel(M, {font}) takes the started Manifold module and, for text, a
// parsed opentype.js font.
//
// Project = {v:1, title, plate:{w, d}, objs:[obj…]}   (millimetres, Z is up, the plate's centre is 0,0)
// obj     = {id, kind, hole, color, x, y, z, w, d, h, rx, ry, rz, flip, text?, wall?}
//   kind  = one of KINDS (or 'group'); x, y = the middle of the shape, z = its bottom; w × d × h its size
//           (before turning); rx, ry, rz = turns in degrees (x first, then y, then z); flip = bits 1 x, 2 y, 4 z.
//   group = {…, kind:'group', bw, bd, bh, children:[obj…]} — children in the group's own space (the group's
//           bottom middle at 0,0,0, its size bw × bd × bh); w/bw, d/bd, h/bh stretch it. Inside a group the
//           hole children cut the solid children. A hole that isn't in a group cuts nothing and isn't printed.

export const KINDS = [
  // kind, label, w, d, h
  ['box', 'Box', 20, 20, 20],
  ['cylinder', 'Cylinder', 20, 20, 20],
  ['sphere', 'Ball', 20, 20, 20],
  ['cone', 'Cone', 20, 20, 20],
  ['pyramid', 'Pyramid', 20, 20, 20],
  ['roof', 'Roof', 20, 20, 15],
  ['ramp', 'Ramp', 20, 20, 15],
  ['dome', 'Dome', 20, 20, 10],
  ['tube', 'Tube', 20, 20, 20],
  ['ring', 'Ring', 24, 24, 5],
  ['hexagon', 'Hexagon', 20, 20, 10],
  ['star', 'Star', 24, 24, 5],
  ['heart', 'Heart', 24, 22, 5],
  ['text', 'Text', 30, 15, 5]
];
export const KIND = Object.fromEntries(KINDS.map(k => [k[0], k]));
export const COLOURS = ['#e8453c', '#f59f18', '#f5d63c', '#5cb85c', '#2fb7a8', '#3b7fc4', '#7c5cff', '#e45fa5', '#ffffff', '#9aa3ad', '#3a3f47', '#8b5a2b'];
export const PLATES = [['small', 'Small printer (120 mm)', 120, 120], ['medium', 'Most printers (180 mm)', 180, 180], ['large', 'Big printer (250 mm)', 250, 250]];
export const LIMITS = { objs: 300, depth: 6, size: 1000, text: 40 };
export const SEG = 48;

const r1 = v => Math.round(v * 10) / 10;
const num = (v, lo, hi, def) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : def; };
const isCol = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);

export function newProject() {
  return { v: 1, title: '', plate: { w: 180, d: 180 }, objs: [] };
}

// A new shape of a kind, with its default size, standing in the middle of the plate.
export function makeObj(kind, o = {}) {
  const k = KIND[kind] || KIND.box;
  const ob = { id: o.id || 'o1', kind: k[0], hole: !!o.hole, color: isCol(o.color) ? o.color : COLOURS[5], x: 0, y: 0, z: 0, w: k[2], d: k[3], h: k[4], rx: 0, ry: 0, rz: 0, flip: 0 };
  if (kind === 'text') ob.text = o.text != null ? String(o.text).slice(0, LIMITS.text) : 'Hi';
  if (kind === 'tube') ob.wall = 2;
  for (const f of ['x', 'y', 'z', 'w', 'd', 'h', 'rx', 'ry', 'rz']) if (o[f] != null) ob[f] = o[f];
  return ob;
}

// Checks everything a saved/shared project holds (numbers, kinds, colours, depth, how many).
export function cleanProject(p) {
  const out = newProject();
  if (!p || typeof p !== 'object') return out;
  if (typeof p.title === 'string') out.title = p.title.slice(0, 60);
  if (p.plate && typeof p.plate === 'object') { out.plate.w = num(p.plate.w, 50, 400, 180); out.plate.d = num(p.plate.d, 50, 400, 180); }
  let count = 0; const ids = new Set();
  const clean = (o, depth) => {
    if (!o || typeof o !== 'object' || count >= LIMITS.objs) return null;
    const kind = o.kind === 'group' ? 'group' : KIND[o.kind] ? o.kind : null;
    if (!kind) return null;
    if (kind === 'group' && depth >= LIMITS.depth) return null;
    count++;
    let id = typeof o.id === 'string' && /^[a-z0-9_-]{1,20}$/i.test(o.id) ? o.id : '';
    if (!id || ids.has(id)) { let n = ids.size + 1; while (ids.has('o' + n)) n++; id = 'o' + n; }
    ids.add(id);
    const S = LIMITS.size;
    const c = { id, kind, hole: !!o.hole, color: isCol(o.color) ? o.color.toLowerCase() : COLOURS[5],
      x: num(o.x, -S, S, 0), y: num(o.y, -S, S, 0), z: num(o.z, -S, S, 0),
      w: num(o.w, 0.2, S, 20), d: num(o.d, 0.2, S, 20), h: num(o.h, 0.2, S, 20),
      rx: num(o.rx, -360, 360, 0), ry: num(o.ry, -360, 360, 0), rz: num(o.rz, -360, 360, 0), flip: num(o.flip, 0, 7, 0) | 0 };
    if (kind === 'text') c.text = typeof o.text === 'string' ? o.text.slice(0, LIMITS.text) : 'Hi';
    if (kind === 'tube') c.wall = num(o.wall, 0.4, 100, 2);
    if (kind === 'group') {
      c.bw = num(o.bw, 0.2, S, c.w); c.bd = num(o.bd, 0.2, S, c.d); c.bh = num(o.bh, 0.2, S, c.h);
      c.children = (Array.isArray(o.children) ? o.children : []).map(k => clean(k, depth + 1)).filter(Boolean);
      if (!c.children.length) { count--; ids.delete(id); return null; }
    }
    return c;
  };
  out.objs = (Array.isArray(p.objs) ? p.objs : []).map(o => clean(o, 0)).filter(Boolean);
  return out;
}

// Every id in the project, and a fresh one.
export function allIds(objs, set = new Set()) { for (const o of objs) { set.add(o.id); if (o.children) allIds(o.children, set); } return set; }
export function newId(project) { const s = allIds(project.objs); let n = s.size + 1; while (s.has('o' + n)) n++; return 'o' + n; }
export function findObj(project, id) { return project.objs.find(o => o.id === id) || null; }

/* ------------------------------------------------------------------ turning maths (3×3, rows) */

const rad = a => a * Math.PI / 180;
export function rotMatrix(rx, ry, rz) { // = Rz · Ry · Rx (Manifold's rotate: x first, then y, then z)
  const [a, b, c] = [rad(rx), rad(ry), rad(rz)];
  const cx = Math.cos(a), sx = Math.sin(a), cy = Math.cos(b), sy = Math.sin(b), cz = Math.cos(c), sz = Math.sin(c);
  return [
    [cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx],
    [sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx],
    [-sy, cy * sx, cy * cx]
  ];
}
export function mul3(A, B) { return A.map(r => [0, 1, 2].map(j => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j])); }
export function apply3(A, v) { return A.map(r => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]); }
export function eulerOf(R) {
  const deg = v => { const d = Math.round(v * 180 / Math.PI * 100) / 100; return Object.is(d, -0) ? 0 : d; };
  const sy = -R[2][0];
  if (Math.abs(sy) > 0.99999) { // straight up or down: put all the z turn into x
    return [deg(Math.atan2(-R[1][2], R[1][1]) * Math.sign(sy)), sy > 0 ? 90 : -90, 0];
  }
  return [deg(Math.atan2(R[2][1], R[2][2])), deg(Math.asin(sy)), deg(Math.atan2(R[1][0], R[0][0]))];
}

/* ------------------------------------------------------------------ the shapes */

export function createModel(M, opts = {}) {
  const { Manifold, CrossSection } = M;
  let font = opts.font || null;
  const unitCache = new Map();      // kind|text → a shape filling the unit box [-.5,.5]² × [0,1]
  const cache = new Map();          // JSON of an object → its pieces [{m, color, id}] (most recent last)
  const CACHE_MAX = 400;

  // Free a list of Manifold/CrossSection objects (they live in WebAssembly memory).
  const free = (...xs) => { for (const x of xs) if (x && x.delete) try { x.delete(); } catch (e) { /* already gone */ } };

  // Scale and move any shape so it fills the unit box exactly.
  function fitUnit(m) {
    const b = m.boundingBox(), sx = b.max[0] - b.min[0], sy = b.max[1] - b.min[1], sz = b.max[2] - b.min[2];
    const t = m.translate([-(b.min[0] + b.max[0]) / 2, -(b.min[1] + b.max[1]) / 2, -b.min[2]]);
    const s = t.scale([1 / (sx || 1), 1 / (sy || 1), 1 / (sz || 1)]);
    free(m, t);
    return s;
  }
  function prism(poly) { const cs = new CrossSection([poly], 'NonZero'); const m = Manifold.extrude(cs, 1); free(cs); return fitUnit(m); }

  // Letters one by one (no fancy font shaping, which opentype.js can't do for every font).
  function layout(text) {
    const cmds = []; let x = 0, prev = null; const k = 100 / font.unitsPerEm;
    for (const ch of String(text)) {
      const g = font.charToGlyph(ch);
      if (prev) { try { x += font.getKerningValue(prev, g) * k; } catch (e) { /* no kerning */ } }
      cmds.push(...g.getPath(x, 0, 100).commands);
      x += (g.advanceWidth || 0) * k; prev = g;
    }
    return { commands: cmds };
  }
  function textShape(text) {
    if (!font || !text.trim()) return null;
    const path = layout(text), polys = [];
    let cur = null, px = 0, py = 0;
    const pt = (x, y) => { cur.push([x, -y]); px = x; py = y; };
    for (const c of path.commands) {
      if (c.type === 'M') { if (cur && cur.length > 2) polys.push(cur); cur = []; pt(c.x, c.y); }
      else if (c.type === 'L') pt(c.x, c.y);
      else if (c.type === 'Q') { const x0 = px, y0 = py; for (let i = 1; i <= 6; i++) { const t = i / 6, u = 1 - t; pt(u * u * x0 + 2 * u * t * c.x1 + t * t * c.x, u * u * y0 + 2 * u * t * c.y1 + t * t * c.y); } }
      else if (c.type === 'C') { const x0 = px, y0 = py; for (let i = 1; i <= 8; i++) { const t = i / 8, u = 1 - t; pt(u * u * u * x0 + 3 * u * u * t * c.x1 + 3 * u * t * t * c.x2 + t * t * t * c.x, u * u * u * y0 + 3 * u * u * t * c.y1 + 3 * u * t * t * c.y2 + t * t * t * c.y); } }
      else if (c.type === 'Z') { if (cur && cur.length > 2) polys.push(cur); cur = null; }
    }
    if (cur && cur.length > 2) polys.push(cur);
    if (!polys.length) return null;
    const cs = new CrossSection(polys, 'NonZero');
    if (cs.isEmpty()) { free(cs); return null; }
    const m = Manifold.extrude(cs, 1), b = cs.bounds(); free(cs);
    const u = fitUnit(m); u.__w = b.max[0] - b.min[0]; u.__h = b.max[1] - b.min[1];
    return u;
  }

  function unit(kind, text) {
    const key = kind === 'text' ? 'text|' + text : kind;
    if (unitCache.has(key)) return unitCache.get(key);
    let m = null;
    if (kind === 'box') m = Manifold.cube([1, 1, 1], false).translate([-0.5, -0.5, 0]);
    else if (kind === 'cylinder' || kind === 'tube') m = Manifold.cylinder(1, 0.5, 0.5, SEG, false);
    else if (kind === 'cone') m = Manifold.cylinder(1, 0.5, 0, SEG, false);
    else if (kind === 'sphere') { const s = Manifold.sphere(0.5, SEG); m = s.translate([0, 0, 0.5]); free(s); }
    else if (kind === 'pyramid') { const c = Manifold.cylinder(1, Math.SQRT1_2, 0, 4, false); m = c.rotate([0, 0, 45]); free(c); }
    else if (kind === 'hexagon') m = fitUnit(Manifold.cylinder(1, 0.5, 0.5, 6, false));
    else if (kind === 'dome') { const s = Manifold.sphere(0.5, SEG), cut = Manifold.cube([2, 2, 1], false).translate([-1, -1, 0]); const hm = s.intersect(cut); free(s, cut); m = fitUnit(hm); }
    else if (kind === 'roof' || kind === 'ramp') {
      const tri = kind === 'roof' ? [[-0.5, 0], [0.5, 0], [0, 1]] : [[-0.5, 0], [0.5, 0], [-0.5, 1]];
      const cs = new CrossSection([tri]), e = Manifold.extrude(cs, 1), r = e.rotate([90, 0, 0]); free(cs, e); m = fitUnit(r);
    } else if (kind === 'ring') {
      const c = CrossSection.circle(0.15, 24), t = c.translate([0.35, 0]), r = Manifold.revolve(t, SEG); free(c, t); m = fitUnit(r);
    } else if (kind === 'star') {
      const p = []; for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.2 : 0.5; p.push([Math.cos(a) * r, Math.sin(a) * r]); }
      m = prism(p);
    } else if (kind === 'heart') {
      const p = []; for (let i = 0; i < 64; i++) { const t = i / 64 * Math.PI * 2, s = Math.sin(t); p.push([16 * s * s * s, 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)]); }
      m = prism(p);
    } else if (kind === 'text') m = textShape(text);
    unitCache.set(key, m);
    return m;
  }

  // A plain shape in its parent's space.
  function primitive(o) {
    let base = null; const tmp = [];
    if (o.kind === 'tube') {
      const u = unit('tube'), wall = Math.max(0.4, o.wall || 2);
      const outer = u.scale([o.w, o.d, o.h]); tmp.push(outer);
      const iw = o.w - 2 * wall, id = o.d - 2 * wall;
      if (iw > 0.2 && id > 0.2) { const inner = u.scale([iw, id, o.h + 2]), inner2 = inner.translate([0, 0, -1]); tmp.push(inner, inner2); base = outer.subtract(inner2); }
      else base = outer.translate([0, 0, 0]);
    } else {
      const u = unit(o.kind, o.text || '');
      if (!u) return null;
      base = u.scale([o.w, o.d, o.h]);
    }
    let m = base;
    for (const [bit, n] of [[1, [1, 0, 0]], [2, [0, 1, 0]], [4, [0, 0, 1]]]) if (o.flip & bit) { tmp.push(m); m = m.mirror(n); if (bit === 4) { tmp.push(m); m = m.translate([0, 0, o.h]); } }
    const out = place(m, o); tmp.push(m);
    free(...tmp);
    return out;
  }
  // Turn about the middle, then stand the bottom at z.
  function place(m, o) {
    const a = m.translate([0, 0, -o.h / 2]), b = (o.rx || o.ry || o.rz) ? a.rotate([o.rx, o.ry, o.rz]) : a, c = b.translate([o.x, o.y, o.z + o.h / 2]);
    free(a); if (b !== a) free(b);
    return c;
  }

  // The shape(s) of an object in its parent's space: [{m, color, id}] (a group keeps each child's colour).
  function pieces(o) {
    const key = JSON.stringify(o);
    if (cache.has(key)) { const v = cache.get(key); cache.delete(key); cache.set(key, v); return v; }
    let out = [];
    if (o.kind !== 'group') { const m = primitive(o); if (m) out = [{ m, color: o.color, id: o.id }]; }
    else {
      const solids = [], holes = [];
      for (const c of o.children) { const ps = pieces(c); (c.hole ? holes : solids).push(...ps); }
      const holeU = holes.length ? Manifold.union(holes.map(p => p.m)) : null;
      const sx = o.w / o.bw, sy = o.d / o.bd, sz = o.h / o.bh;
      for (const p of solids) {
        const cut = holeU ? p.m.subtract(holeU) : p.m;
        if (cut.isEmpty()) { if (cut !== p.m) free(cut); continue; }
        const s = cut.scale([sx, sy, sz]); if (cut !== p.m) free(cut);
        const m = place(s, o); free(s);
        out.push({ m, color: p.color, id: o.id });
      }
      if (!solids.length && holes.length) { // a group made only of holes (for making a hole shape)
        const s = holeU.scale([sx, sy, sz]); out.push({ m: place(s, o), color: o.color, id: o.id }); free(s);
      }
      free(holeU);
    }
    cache.set(key, out);
    while (cache.size > CACHE_MAX) { const [k, v] = cache.entries().next().value; cache.delete(k); for (const p of v) free(p.m); }
    return out;
  }
  // The whole shape of an object (all its pieces joined) — the caller frees it.
  function whole(o) { const ps = pieces(o); return ps.length ? Manifold.union(ps.map(p => p.m)) : null; }
  function bounds(o) {
    const ps = pieces(o); if (!ps.length) return null;
    const b = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    for (const p of ps) { const q = p.m.boundingBox(); for (let i = 0; i < 3; i++) { b.min[i] = Math.min(b.min[i], q.min[i]); b.max[i] = Math.max(b.max[i], q.max[i]); } }
    return b;
  }
  function meshOf(m) {
    const g = m.getMesh(), n = g.numProp, V = g.vertProperties;
    let pos = V;
    if (n !== 3) { pos = new Float32Array(V.length / n * 3); for (let i = 0, j = 0; i < V.length; i += n, j += 3) { pos[j] = V[i]; pos[j + 1] = V[i + 1]; pos[j + 2] = V[i + 2]; } }
    return { positions: Float32Array.from(pos), indices: Uint32Array.from(g.triVerts) };
  }

  /* -------------------------------------------------------------- grouping */

  // Put the objects with these ids into one new group (holes cut the solids). Returns the group.
  function group(project, ids) {
    const kids = project.objs.filter(o => ids.includes(o.id));
    if (kids.length < 2) return null;
    const tmp = { id: 'tmp', kind: 'group', hole: false, color: kids.find(k => !k.hole)?.color || kids[0].color, x: 0, y: 0, z: 0, w: 1, d: 1, h: 1, bw: 1, bd: 1, bh: 1, rx: 0, ry: 0, rz: 0, flip: 0, children: kids.map(k => JSON.parse(JSON.stringify(k))) };
    let b = bounds(tmp);
    if (!b) { b = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }; for (const k of kids) { const q = bounds(k); if (q) for (let i = 0; i < 3; i++) { b.min[i] = Math.min(b.min[i], q.min[i]); b.max[i] = Math.max(b.max[i], q.max[i]); } } }
    if (!Number.isFinite(b.min[0])) return null;
    const cx = (b.min[0] + b.max[0]) / 2, cy = (b.min[1] + b.max[1]) / 2, cz = b.min[2];
    const g = { id: newId(project), kind: 'group', hole: kids.every(k => k.hole), color: tmp.color,
      x: cx, y: cy, z: cz, w: Math.max(0.2, b.max[0] - b.min[0]), d: Math.max(0.2, b.max[1] - b.min[1]), h: Math.max(0.2, b.max[2] - b.min[2]), rx: 0, ry: 0, rz: 0, flip: 0 };
    g.bw = g.w; g.bd = g.d; g.bh = g.h;
    g.children = tmp.children.map(k => { k.x -= cx; k.y -= cy; k.z -= cz; return k; });
    const at = project.objs.findIndex(o => ids.includes(o.id));
    project.objs = project.objs.filter(o => !ids.includes(o.id));
    project.objs.splice(Math.min(at, project.objs.length), 0, g);
    return g;
  }

  // Take a group apart again: its children come back as separate objects, turned and stretched like the group.
  function ungroup(project, id) {
    const i = project.objs.findIndex(o => o.id === id), g = project.objs[i];
    if (!g || g.kind !== 'group') return [];
    const S = [g.w / g.bw, g.d / g.bd, g.h / g.bh], Rg = rotMatrix(g.rx, g.ry, g.rz);
    const used = allIds(project.objs);
    const out = g.children.map(c0 => {
      const c = JSON.parse(JSON.stringify(c0));
      // how much each of the child's own sides is stretched (exact when it's square to the group)
      const Rc = rotMatrix(c.rx, c.ry, c.rz), f = [0, 1, 2].map(i => Math.hypot(S[0] * Rc[0][i], S[1] * Rc[1][i], S[2] * Rc[2][i]));
      const centre = [c.x * S[0], c.y * S[1], (c.z + c.h / 2) * S[2] - g.h / 2];
      const wc = apply3(Rg, centre);
      c.w = r1(c.w * f[0]) || 0.2; c.d = r1(c.d * f[1]) || 0.2; c.h = r1(c.h * f[2]) || 0.2;
      if (g.rx || g.ry || g.rz) { const e = eulerOf(mul3(Rg, rotMatrix(c.rx, c.ry, c.rz))); c.rx = e[0]; c.ry = e[1]; c.rz = e[2]; }
      c.x = r1(g.x + wc[0]); c.y = r1(g.y + wc[1]); c.z = r1(g.z + g.h / 2 + wc[2] - c.h / 2);
      if (g.hole) c.hole = true;
      return c;
    });
    project.objs.splice(i, 1, ...out);
    return out;
  }

  /* -------------------------------------------------------------- checks + making the print */

  // Things to fix before printing: [{level:'stop'|'warn'|'tip', text, ids}]
  function check(project) {
    const out = [], solids = project.objs.filter(o => !o.hole);
    if (!solids.length) { out.push({ level: 'stop', text: 'There’s nothing to print yet — add a solid shape.', ids: [] }); return out; }
    const holes = project.objs.filter(o => o.hole);
    if (holes.length) out.push({ level: 'warn', text: 'A hole only cuts once it’s grouped with a shape. Select the hole and the shape, then press Group. (Holes on their own aren’t printed.)', ids: holes.map(h => h.id) });
    const pw = project.plate.w / 2, pd = project.plate.d / 2, under = [], off = [], thin = [];
    let top = 0;
    for (const o of solids) {
      const b = bounds(o); if (!b) continue;
      if (b.min[2] < -0.05) under.push(o.id);
      if (b.min[0] < -pw - 0.05 || b.max[0] > pw + 0.05 || b.min[1] < -pd - 0.05 || b.max[1] > pd + 0.05) off.push(o.id);
      if (o.kind !== 'group' && Math.min(o.w, o.d, o.h) < 1) thin.push(o.id);
      top = Math.max(top, b.max[2]);
    }
    if (under.length) out.push({ level: 'warn', text: 'Part of your design goes under the build plate — the printer can’t print below it. Select it and press Drop to plate.', ids: under });
    if (off.length) out.push({ level: 'warn', text: 'Part of your design hangs off the build plate — it’s too big for the printer, or it needs moving.', ids: off });
    if (thin.length) out.push({ level: 'warn', text: 'Something is thinner than 1 mm. That’s too thin to print well — make it at least 1 or 2 mm.', ids: thin });
    if (top > 200) out.push({ level: 'warn', text: 'Your design is ' + Math.round(top) + ' mm tall — taller than most school printers can print.', ids: [] });
    // Floating parts: anything not joined to something that touches the plate
    const all = Manifold.union(solids.flatMap(o => pieces(o).map(p => p.m)));
    const comps = all.decompose(), floating = [];
    for (const c of comps) {
      const b = c.boundingBox();
      if (b.min[2] > 0.3) for (const o of solids) { const q = bounds(o); if (q && q.min[2] < b.max[2] + 0.01 && q.max[2] > b.min[2] - 0.01 && q.min[0] < b.max[0] && q.max[0] > b.min[0] && q.min[1] < b.max[1] && q.max[1] > b.min[1]) floating.push(o.id); }
    }
    free(all, ...comps);
    if (floating.length) out.push({ level: 'warn', text: 'Something is floating in the air. A printer builds from the plate up, so it would fall — rest it on the plate or join it to the rest.', ids: [...new Set(floating)] });
    if (comps.length > 1 && !floating.length) out.push({ level: 'tip', text: 'Your design is ' + comps.length + ' separate pieces. That’s fine — they’ll print side by side.', ids: [] });
    if (!out.length) out.push({ level: 'ok', text: 'Ready to print!', ids: [] });
    return out;
  }

  // One closed mesh per colour (the first colour wins where colours overlap), for the 3MF file.
  function exportParts(project) {
    const ps = project.objs.filter(o => !o.hole).flatMap(o => pieces(o));
    const order = [...new Set(ps.map(p => p.color))], parts = [];
    let taken = null;
    for (const col of order) {
      const u = Manifold.union(ps.filter(p => p.color === col).map(p => p.m));
      const mine = taken ? u.subtract(taken) : u;
      if (!mine.isEmpty()) { const mesh = meshOf(mine); parts.push({ positions: mesh.positions, indices: mesh.indices, colour: col, name: 'Colour ' + (parts.length + 1), volume: mine.volume() }); }
      const nt = taken ? Manifold.union([taken, u]) : u.translate([0, 0, 0]);
      if (mine !== u) free(mine);
      free(u, taken); taken = nt;
    }
    free(taken);
    return parts;
  }
  // Everything joined into one closed mesh (for the STL file).
  function exportWhole(project) {
    const ps = project.objs.filter(o => !o.hole).flatMap(o => pieces(o));
    if (!ps.length) return null;
    const u = Manifold.union(ps.map(p => p.m));
    const mesh = meshOf(u), info = { volume: u.volume(), genus: u.genus(), status: u.status(), box: u.boundingBox() };
    free(u);
    return { positions: mesh.positions, indices: mesh.indices, colour: ps[0].color, name: project.title || 'My design', ...info };
  }

  return {
    pieces, whole, bounds, meshOf, group, ungroup, check, exportParts, exportWhole, free,
    setFont(f) { font = f; for (const [k, v] of unitCache) if (k.startsWith('text|')) { free(v); unitCache.delete(k); } this.clear(); },
    hasFont: () => !!font,
    clear() { for (const v of cache.values()) for (const p of v) free(p.m); cache.clear(); },
    textRatio(text) { // width ÷ height of the letters as the font draws them
      if (!font || !String(text).trim()) return 2;
      const u = unit('text', String(text)); if (!u) return 2;
      return Math.max(0.1, (u.__w || 1) / (u.__h || 1));
    }
  };
}

/* ------------------------------------------------------------------ STL */

export function toSTL(parts, head = 'CodeJump 3D Print Lab') {
  const tris = parts.reduce((t, p) => t + p.indices.length / 3, 0);
  const buf = new ArrayBuffer(84 + 50 * tris), dv = new DataView(buf); let o = 84;
  for (let h = 0; h < Math.min(80, head.length); h++) dv.setUint8(h, head.charCodeAt(h) & 0x7f);
  dv.setUint32(80, tris, true);
  for (const p of parts) {
    const P = p.positions, I = p.indices;
    for (let k = 0; k < I.length; k += 3) {
      const a = I[k] * 3, b = I[k + 1] * 3, c = I[k + 2] * 3;
      const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1;
      dv.setFloat32(o, nx / l, true); dv.setFloat32(o + 4, ny / l, true); dv.setFloat32(o + 8, nz / l, true); o += 12;
      for (const q of [a, b, c]) { dv.setFloat32(o, P[q], true); dv.setFloat32(o + 4, P[q + 1], true); dv.setFloat32(o + 8, P[q + 2], true); o += 12; }
      dv.setUint16(o, 0, true); o += 2;
    }
  }
  return buf;
}

/* ------------------------------------------------------------------ 3MF (a zip of XML) */

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
const n3 = v => (Math.round(v * 1000) / 1000).toString();

// One mesh object per colour, joined as the parts of one object, so a slicer can give each colour a filament.
export function to3MF(parts, title) {
  title = title || 'My design';
  let x = '<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-GB" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">\n' +
    '<metadata name="Title">' + esc(title) + '</metadata>\n<metadata name="Application">CodeJump 3D Print Lab</metadata>\n<resources>\n<basematerials id="1">\n';
  parts.forEach((p, i) => { x += '<base name="' + esc(p.name || 'Part ' + (i + 1)) + '" displaycolor="' + p.colour.toUpperCase() + 'FF"/>\n'; });
  x += '</basematerials>\n';
  const chunks = [x];
  parts.forEach((p, i) => {
    const P = p.positions, I = p.indices, v = [], t = [];
    for (let k = 0; k < P.length; k += 3) v.push('<vertex x="' + n3(P[k]) + '" y="' + n3(P[k + 1]) + '" z="' + n3(P[k + 2]) + '"/>');
    for (let k = 0; k < I.length; k += 3) t.push('<triangle v1="' + I[k] + '" v2="' + I[k + 1] + '" v3="' + I[k + 2] + '"/>');
    chunks.push('<object id="' + (i + 2) + '" type="model" name="' + esc(p.name || 'Part') + '" pid="1" pindex="' + i + '"><mesh><vertices>' + v.join('') + '</vertices><triangles>' + t.join('') + '</triangles></mesh></object>\n');
  });
  const asm = parts.length + 2;
  chunks.push('<object id="' + asm + '" type="model" name="' + esc(title) + '"><components>' + parts.map((p, i) => '<component objectid="' + (i + 2) + '"/>').join('') + '</components></object>\n</resources>\n<build><item objectid="' + asm + '"/></build>\n</model>\n');
  const enc = new TextEncoder();
  return zip([
    ['[Content_Types].xml', enc.encode('<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>')],
    ['_rels/.rels', enc.encode('<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>')],
    ['3D/3dmodel.model', enc.encode(chunks.join(''))]
  ]);
}

// Minimal zip writer (stored, no compression) — enough for a 3MF package.
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(d) { let c = 0xFFFFFFFF; for (let i = 0; i < d.length; i++) c = CRC[(c ^ d[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function zip(files) {
  const enc = new TextEncoder(), locals = [], central = []; let offset = 0;
  for (const f of files) {
    const name = enc.encode(f[0]), data = f[1], crc = crc32(data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
    lh.setUint16(10, 0, true); lh.setUint16(12, 0x21, true); lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
    lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
    ch.setUint16(12, 0, true); ch.setUint16(14, 0x21, true); ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
    ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
    locals.push(new Uint8Array(lh.buffer), name, data); central.push(new Uint8Array(ch.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const cdSize = central.reduce((t, a) => t + a.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
  const all = locals.concat(central, [new Uint8Array(end.buffer)]), len = all.reduce((t, a) => t + a.length, 0);
  const out = new Uint8Array(len); let o = 0; for (const a of all) { out.set(a, o); o += a.length; }
  return out;
}

/* ------------------------------------------------------------------ ready-made starters */

// A few designs to open from the Examples menu (made from the same shapes pupils use).
export const EXAMPLES = [
  ['keyring', 'Name keyring', 'A tag with a hole for a key ring and your name on top.'],
  ['pencilpot', 'Pencil pot', 'A tube with a bottom — the hole is a cylinder grouped with it.'],
  ['house', 'Little house', 'A box with a roof, and a door cut out with a hole.'],
  ['rocket', 'Rocket', 'A cylinder, a cone and three fins.']
];
export function exampleProject(id) {
  const p = newProject(); let n = 0;
  const mk = (kind, o) => { const ob = makeObj(kind, { ...o, id: 'o' + (++n) }); for (const f of ['wall', 'flip']) if (o[f] != null) ob[f] = o[f]; return ob; };
  const add = (kind, o) => { const ob = mk(kind, o); p.objs.push(ob); return ob; };
  // a ready-made group whose solid parts fill w × d × h, centred on the plate (pupils can Ungroup it to see how it's made)
  const grp = (children, w, d, h, color) => { const g = { id: 'o' + (++n), kind: 'group', hole: false, color, x: 0, y: 0, z: 0, w, d, h, bw: w, bd: d, bh: h, rx: 0, ry: 0, rz: 0, flip: 0, children }; p.objs.push(g); return g; };
  if (id === 'keyring') {
    p.title = 'Name keyring';
    grp([mk('box', { w: 60, d: 22, h: 3, color: '#3b7fc4' }), mk('cylinder', { x: -25, w: 6, d: 6, h: 10, z: -2, hole: true })], 60, 22, 3, '#3b7fc4');
    add('text', { text: 'SAM', x: 4, w: 36, d: 12, h: 2, z: 3, color: '#ffffff' });
  } else if (id === 'pencilpot') {
    p.title = 'Pencil pot';
    grp([mk('cylinder', { w: 60, d: 60, h: 80, color: '#7c5cff' }), mk('cylinder', { w: 54, d: 54, h: 80, z: 3, hole: true })], 60, 60, 80, '#7c5cff');
  } else if (id === 'house') {
    p.title = 'Little house';
    grp([mk('box', { w: 40, d: 30, h: 25, color: '#f5d63c' }), mk('roof', { w: 44, d: 34, h: 18, z: 25, color: '#e8453c' }), mk('box', { w: 10, d: 6, h: 15, y: -14, z: 0, hole: true })], 44, 34, 43, '#f5d63c');
  } else if (id === 'rocket') {
    p.title = 'Rocket';
    add('cylinder', { w: 20, d: 20, h: 50, color: '#ffffff' });
    add('cone', { w: 20, d: 20, h: 22, z: 50, color: '#e8453c' });
    for (let i = 0; i < 3; i++) { const a = i * 120; add('ramp', { w: 14, d: 2, h: 20, x: Math.round(Math.cos(a * Math.PI / 180) * 160) / 10, y: Math.round(Math.sin(a * Math.PI / 180) * 160) / 10, rz: a, color: '#3b7fc4' }); }
  } else return null;
  return p;
}
