/* CodeJump · AI Lab — the "brain": turns drawings into pictures the computer can learn from, trains a small neural
 * network on the pupil's own examples, and makes guesses. No DOM and no network: it runs in the browser and in Node
 * tests, and nothing a pupil draws ever leaves their device (except inside their own saved project).
 *
 * A drawing is a list of strokes; a stroke is a flat list of points [x0,y0,x1,y1,…] in a 256×256 box (whole numbers).
 * A project's examples are { labels: [{ name, color, ex: [drawing, …] }, …] }.
 *
 *   const g = trainer(labels);             // a generator: for (const p of g) shows progress p = {phase, done, acc}
 *   const brain = result of the generator  // (the value it returns)
 *   guess(brain, drawing) -> { label, index, conf, probs }   ·   similar(brain, drawing, n) -> [{li, ei, score}]
 *
 * How it learns (kept simple on purpose so it can be explained to a class): every drawing is scaled to fit a 20×20
 * grid of squares (so size and position don't matter), lightly blurred, and fed to a neural network with one hidden
 * layer of 32 "neurons". It practises on each example many times, slightly turned and stretched each time, so it copes
 * with drawings that are a bit different from the ones it was shown. Training uses a fixed random seed, so the same
 * examples always make the same brain — that's why a project only saves the examples, never the brain itself.
 */

export const G = 20;              // the grid each drawing is turned into
export const MAX_LABELS = 6, MIN_LABELS = 2, MAX_EXAMPLES = 30, MIN_EXAMPLES = 3;
export const COLOURS = ['#e8533f', '#2f80ed', '#27ae60', '#f2b705', '#9b51e0', '#ff7ab6'];
const HIDDEN = 32;

// ── random numbers that are the same every time (mulberry32)
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ── drawings
export function pointCount(d) { let n = 0; for (const s of d || []) n += (s.length >> 1); return n; }

// Ramer–Douglas–Peucker: keeps a stroke's shape with far fewer points (smaller saves)
export function simplifyStroke(s, eps = 1.6) {
  const n = s.length >> 1; if (n <= 2) return s.slice();
  const keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1;
  const stack = [[0, n - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let best = -1, bi = -1;
    const ax = s[a * 2], ay = s[a * 2 + 1], bx = s[b * 2], by = s[b * 2 + 1], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
    for (let i = a + 1; i < b; i++) { // distance to the line a→b (or to the point a, when a stroke ends where it began)
      const d = (dx || dy) ? Math.abs(dy * s[i * 2] - dx * s[i * 2 + 1] + bx * ay - by * ax) / L : Math.hypot(s[i * 2] - ax, s[i * 2 + 1] - ay);
      if (d > best) { best = d; bi = i; }
    }
    if (best > eps) { keep[bi] = 1; stack.push([a, bi], [bi, b]); }
  }
  const out = []; for (let i = 0; i < n; i++) if (keep[i]) out.push(s[i * 2], s[i * 2 + 1]);
  return out;
}

// checks a drawing from a saved file: numbers 0–255, sensible sizes; returns null if there's nothing usable
export function cleanDrawing(d) {
  if (!Array.isArray(d)) return null;
  const out = []; let pts = 0;
  for (const s of d.slice(0, 60)) {
    if (!Array.isArray(s) || s.length < 2) continue;
    const t = [];
    for (let i = 0; i + 1 < s.length && t.length < 1200; i += 2) {
      const x = Number(s[i]), y = Number(s[i + 1]); if (!isFinite(x) || !isFinite(y)) continue;
      t.push(Math.max(0, Math.min(255, Math.round(x))), Math.max(0, Math.min(255, Math.round(y))));
    }
    if (t.length >= 2 && pts + t.length / 2 <= 2400) { out.push(t); pts += t.length / 2; }
  }
  return out.length ? out : null;
}
export const cleanName = n => String(n == null ? '' : n).replace(/[<>"]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
const okColour = c => (/^#[0-9a-f]{6}$/i.test(String(c || '')) ? String(c).toLowerCase() : null);

// checks the labels part of a saved project
export function cleanLabels(list) {
  const out = [], seen = new Set();
  for (const l of Array.isArray(list) ? list : []) {
    if (!l || typeof l !== 'object' || out.length >= MAX_LABELS) continue;
    let name = cleanName(l.name) || 'thing ' + (out.length + 1);
    while (seen.has(name.toLowerCase())) name = name.slice(0, 17) + ' ' + (out.length + 1);
    seen.add(name.toLowerCase());
    const ex = [];
    for (const d of Array.isArray(l.ex) ? l.ex : []) { const c = cleanDrawing(d); if (c && ex.length < MAX_EXAMPLES) ex.push(c); }
    out.push({ name, color: okColour(l.color) || COLOURS[out.length % COLOURS.length], ex });
  }
  return out;
}

// a drawing → a G×G grid of numbers 0..1. `tf` (optional) turns/stretches/wobbles it first (for practice copies)
export function rasterize(d, tf) {
  const grid = new Float32Array(G * G);
  let pts = [];
  for (const s of d || []) { const p = []; for (let i = 0; i + 1 < s.length; i += 2) p.push(s[i], s[i + 1]); pts.push(p); }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of pts) for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]); }
  if (!isFinite(x0)) return grid;
  if (tf) {
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, c = Math.cos(tf.rot || 0), s = Math.sin(tf.rot || 0), j = tf.jitter || 0, r = tf.rand || Math.random;
    pts = pts.map(p => { const q = []; for (let i = 0; i < p.length; i += 2) { const x = (p[i] - cx) * (tf.sx || 1), y = (p[i + 1] - cy) * (tf.sy || 1); q.push(x * c - y * s + (r() - 0.5) * j, x * s + y * c + (r() - 0.5) * j); } return q; });
    x0 = y0 = Infinity; x1 = y1 = -Infinity;
    for (const p of pts) for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]); }
  }
  // fit the longer side into the grid (keeping the shape), centred; a tiny dot isn't blown up to fill everything
  const box = G - 3, scale = box / Math.max(x1 - x0, y1 - y0, 40);
  const ox = (G - (x1 - x0) * scale) / 2, oy = (G - (y1 - y0) * scale) / 2;
  const R = 0.85;
  const ink = (ax, ay, bx, by) => {
    const gx0 = Math.max(0, Math.floor(Math.min(ax, bx) - R - 1)), gx1 = Math.min(G - 1, Math.ceil(Math.max(ax, bx) + R + 1));
    const gy0 = Math.max(0, Math.floor(Math.min(ay, by) - R - 1)), gy1 = Math.min(G - 1, Math.ceil(Math.max(ay, by) + R + 1));
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const px = gx + 0.5, py = gy + 0.5;
      let t = L2 ? ((px - ax) * dx + (py - ay) * dy) / L2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy)), v = Math.min(1, Math.max(0, R + 0.5 - d));
      const k = gy * G + gx; if (v > grid[k]) grid[k] = v;
    }
  };
  for (const p of pts) {
    const X = i => (p[i] - x0) * scale + ox, Y = i => (p[i + 1] - y0) * scale + oy;
    if (p.length === 2) ink(X(0), Y(0), X(0), Y(0));
    for (let i = 2; i < p.length; i += 2) ink(X(i - 2), Y(i - 2), X(i), Y(i));
  }
  // a light blur, so a line one square away still counts for something
  const out = new Float32Array(G * G); let mx = 0;
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
    let s = 0, w = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const xx = x + i, yy = y + j; if (xx < 0 || yy < 0 || xx >= G || yy >= G) continue;
      const k = (i ? 1 : 2) * (j ? 1 : 2); s += grid[yy * G + xx] * k; w += k;
    }
    const v = s / 16 * 0.6 + grid[y * G + x] * 0.4; out[y * G + x] = v; if (v > mx) mx = v;
  }
  if (mx > 0) for (let i = 0; i < out.length; i++) out[i] /= mx;
  return out;
}

// ── the neural network: input (G×G) → 32 hidden (ReLU) → one output per label (softmax)
function newNet(K, rand) {
  const D = G * G, H = HIDDEN, n = () => { let u = 0, v = 0; while (!u) u = rand(); v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const W1 = new Float32Array(H * D), b1 = new Float32Array(H), W2 = new Float32Array(K * H), b2 = new Float32Array(K);
  const s1 = Math.sqrt(2 / D), s2 = Math.sqrt(2 / H);
  for (let i = 0; i < W1.length; i++) W1[i] = n() * s1;
  for (let i = 0; i < W2.length; i++) W2[i] = n() * s2;
  return { K, D, H, W1, b1, W2, b2 };
}
function forward(net, x, h, o) {
  const { D, H, K, W1, b1, W2, b2 } = net;
  for (let j = 0; j < H; j++) { let s = b1[j]; const r = j * D; for (let i = 0; i < D; i++) s += W1[r + i] * x[i]; h[j] = s > 0 ? s : 0; }
  let mx = -Infinity;
  for (let k = 0; k < K; k++) { let s = b2[k]; const r = k * H; for (let j = 0; j < H; j++) s += W2[r + j] * h[j]; o[k] = s; if (s > mx) mx = s; }
  let z = 0; for (let k = 0; k < K; k++) { o[k] = Math.exp(o[k] - mx); z += o[k]; }
  for (let k = 0; k < K; k++) o[k] /= z;
  return o;
}

// practice copies of one drawing: the original plus `n` turned / stretched / wobbly ones
function practiceSet(labels, which, copies, rand) {
  const out = [];
  for (const [li, ei] of which) {
    const d = labels[li].ex[ei];
    out.push({ x: rasterize(d), y: li });
    for (let c = 0; c < copies; c++) {
      const tf = { rot: (rand() - 0.5) * 0.45, sx: 0.8 + rand() * 0.4, sy: 0.8 + rand() * 0.4, jitter: 6, rand };
      out.push({ x: rasterize(d, tf), y: li });
    }
  }
  return out;
}

// trains one network on a set of practice pictures; yields after each round so the page stays responsive
function* fit(samples, K, rand, rounds, report) {
  const net = newNet(K, rand), { D, H } = net;
  const P = [net.W1, net.b1, net.W2, net.b2], M = P.map(p => new Float32Array(p.length)), V = P.map(p => new Float32Array(p.length)), Gr = P.map(p => new Float32Array(p.length));
  const h = new Float32Array(H), o = new Float32Array(K), dh = new Float32Array(H);
  const lr = 0.006, B1 = 0.9, B2 = 0.999, batch = 16, decay = 1e-4;
  let step = 0;
  const order = samples.map((_, i) => i);
  for (let r = 0; r < rounds; r++) {
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    let right = 0;
    for (let s0 = 0; s0 < order.length; s0 += batch) {
      for (const g of Gr) g.fill(0);
      const end = Math.min(order.length, s0 + batch);
      for (let q = s0; q < end; q++) {
        const { x, y } = samples[order[q]];
        forward(net, x, h, o);
        let best = 0; for (let k = 1; k < K; k++) if (o[k] > o[best]) best = k; if (best === y) right++;
        dh.fill(0);
        for (let k = 0; k < K; k++) {
          const e = o[k] - (k === y ? 1 : 0), r2 = k * H; Gr[3][k] += e;
          for (let j = 0; j < H; j++) { Gr[2][r2 + j] += e * h[j]; dh[j] += e * net.W2[r2 + j]; }
        }
        for (let j = 0; j < H; j++) {
          if (h[j] <= 0) continue;
          const e = dh[j], r1 = j * D; Gr[1][j] += e;
          for (let i = 0; i < D; i++) if (x[i]) Gr[0][r1 + i] += e * x[i];
        }
      }
      step++;
      const n = end - s0, c1 = 1 - Math.pow(B1, step), c2 = 1 - Math.pow(B2, step);
      for (let p = 0; p < P.length; p++) {
        const w = P[p], g = Gr[p], m = M[p], v = V[p], wd = p % 2 === 0 ? decay : 0;
        for (let i = 0; i < w.length; i++) {
          const gi = g[i] / n + wd * w[i];
          m[i] = B1 * m[i] + (1 - B1) * gi; v[i] = B2 * v[i] + (1 - B2) * gi * gi;
          w[i] -= lr * (m[i] / c1) / (Math.sqrt(v[i] / c2) + 1e-8);
        }
      }
    }
    yield report(r + 1, right / order.length);
  }
  return net;
}

export function canTrain(labels) {
  if (!Array.isArray(labels) || labels.length < MIN_LABELS) return 'Make at least two labels to teach your AI.';
  const few = labels.find(l => l.ex.length < MIN_EXAMPLES);
  if (few) return 'Draw at least ' + MIN_EXAMPLES + ' examples of “' + few.name + '” first.';
  return '';
}

// Trains a brain on every example. First, if there are enough examples, a "check" brain learns from 3 in every 4 of
// them and is tested on the rest — drawings it has never seen — which is the honest way to say how good it is.
// Yields progress {phase:'check'|'learn', done:0..1, acc}; returns the brain.
export function* trainer(labels, opts = {}) {
  const msg = canTrain(labels); if (msg) throw new Error(msg);
  const K = labels.length, seed = opts.seed || 20261005, copies = opts.copies == null ? 5 : opts.copies, rounds = opts.rounds || 14;
  const all = []; labels.forEach((l, li) => l.ex.forEach((_, ei) => all.push([li, ei])));
  const doCheck = labels.every(l => l.ex.length >= 4);
  let check = null;
  if (doCheck) {
    const rand = rng(seed + 7);
    const held = all.filter(([, ei]) => ei % 4 === 3), learn = all.filter(([, ei]) => ei % 4 !== 3);
    const net = yield* fit(practiceSet(labels, learn, copies, rand), K, rand, rounds, (r, acc) => ({ phase: 'check', done: r / rounds * 0.4, acc }));
    const h = new Float32Array(net.H), o = new Float32Array(K), wrong = [];
    for (const [li, ei] of held) {
      forward(net, rasterize(labels[li].ex[ei]), h, o);
      let best = 0; for (let k = 1; k < K; k++) if (o[k] > o[best]) best = k;
      if (best !== li) wrong.push({ li, ei, guess: best });
    }
    check = { total: held.length, right: held.length - wrong.length, wrong };
  }
  const rand = rng(seed);
  const net = yield* fit(practiceSet(labels, all, copies, rand), K, rand, rounds, (r, acc) => ({ phase: 'learn', done: (doCheck ? 0.4 : 0) + r / rounds * (doCheck ? 0.6 : 1), acc }));
  // remember how each example "looks" to the brain (its hidden neurons), to find the most similar ones later
  const h = new Float32Array(net.H), o = new Float32Array(K), seen = [];
  for (const [li, ei] of all) { forward(net, rasterize(labels[li].ex[ei]), h, o); seen.push({ li, ei, h: Float32Array.from(h) }); }
  return { net, names: labels.map(l => l.name), check, seen, key: dataKey(labels) };
}
export function train(labels, opts) { const g = trainer(labels, opts); let r; do r = g.next(); while (!r.done); return r.value; }

// a short fingerprint of the examples, so the app knows when the brain is out of date
export function dataKey(labels) {
  let h = 2166136261 >>> 0;
  const add = v => { h ^= v; h = Math.imul(h, 16777619) >>> 0; };
  for (const l of labels || []) { add(l.ex.length + 7); for (const d of l.ex) for (const s of d) { add(s.length); for (let i = 0; i < s.length; i += 3) add(s[i]); } }
  return (labels || []).length + ':' + h.toString(36);
}

export function guess(brain, d) {
  if (!brain || !d || !d.length) return null;
  const { net, names } = brain, h = new Float32Array(net.H), o = new Float32Array(net.K);
  forward(net, rasterize(d), h, o);
  let best = 0; for (let k = 1; k < net.K; k++) if (o[k] > o[best]) best = k;
  return { label: names[best], index: best, conf: Math.round(o[best] * 100), probs: Array.from(o, p => Math.round(p * 100)) };
}

// the examples the brain thinks are most like this drawing ("why did it guess that?")
export function similar(brain, d, n = 3) {
  if (!brain || !d || !d.length) return [];
  const { net } = brain, h = new Float32Array(net.H), o = new Float32Array(net.K);
  forward(net, rasterize(d), h, o);
  const nh = Math.hypot(...h) || 1;
  return brain.seen.map(s => { let dot = 0; for (let j = 0; j < h.length; j++) dot += h[j] * s.h[j]; return { li: s.li, ei: s.ei, score: dot / nh / (Math.hypot(...s.h) || 1) }; })
    .sort((a, b) => b.score - a.score).slice(0, n);
}

// ── ready-made example sets (drawn by code, a bit wobbly like a person's), for a quick start or a demo
function wobbly(rand, pts, w = 5) { const s = []; for (const [x, y] of pts) s.push(Math.round(Math.max(0, Math.min(255, x + (rand() - 0.5) * w))), Math.round(Math.max(0, Math.min(255, y + (rand() - 0.5) * w)))); return s; }
function ring(cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, n = 28) { const p = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
function poly(corners, per = 6) { const p = []; for (let i = 0; i < corners.length - 1; i++) for (let k = 0; k < per; k++) { const t = k / per, a = corners[i], b = corners[i + 1]; p.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); } p.push(corners[corners.length - 1]); return p; }
const SHAPES = {
  circle: r => { const cx = 128 + (r() - 0.5) * 50, cy = 128 + (r() - 0.5) * 50, rx = 45 + r() * 50, ry = rx * (0.8 + r() * 0.4), a = r() * 6; return [wobbly(r, ring(cx, cy, rx, ry, a, a + Math.PI * 2 * (0.95 + r() * 0.1)))]; },
  square: r => { const cx = 128 + (r() - 0.5) * 50, cy = 128 + (r() - 0.5) * 50, w = 45 + r() * 50, h = w * (0.8 + r() * 0.4), t = (r() - 0.5) * 0.25, c = Math.cos(t), s = Math.sin(t);
    const P = [[-w, -h], [w, -h], [w, h], [-w, h], [-w, -h]].map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]); return [wobbly(r, poly(P))]; },
  triangle: r => { const cx = 128 + (r() - 0.5) * 50, cy = 128 + (r() - 0.5) * 50, w = 45 + r() * 50, h = w * (0.8 + r() * 0.5), t = (r() - 0.5) * 0.25, c = Math.cos(t), s = Math.sin(t);
    const P = [[0, -h], [w, h * 0.8], [-w, h * 0.8], [0, -h]].map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]); return [wobbly(r, poly(P, 8))]; },
  happy: r => face(r, 1), sad: r => face(r, -1)
};
function face(r, mood) {
  const cx = 128 + (r() - 0.5) * 30, cy = 128 + (r() - 0.5) * 30, R = 70 + r() * 35, e = R * 0.35;
  const head = wobbly(r, ring(cx, cy, R, R * (0.9 + r() * 0.2), r() * 6, r() * 6 + Math.PI * 2, 30));
  const eye = x => wobbly(r, ring(x, cy - R * 0.3, 4, 4, 0, Math.PI * 2, 6), 2);
  const my = cy + R * (mood > 0 ? 0.2 : 0.5), mw = R * (0.45 + r() * 0.15), mh = R * (0.25 + r() * 0.12);
  const mouth = wobbly(r, ring(cx, my, mw, mh, mood > 0 ? 0.15 : Math.PI + 0.15, mood > 0 ? Math.PI - 0.15 : Math.PI * 2 - 0.15, 14), 3);
  return [head, eye(cx - e), eye(cx + e), mouth];
}
export const SAMPLE_SETS = {
  shapes: { title: 'Shapes', labels: ['circle', 'square', 'triangle'] },
  faces: { title: 'Happy or sad', labels: ['happy', 'sad'] }
};
export function sampleLabels(set, per = 10, seed = 11) {
  const s = SAMPLE_SETS[set]; if (!s) return null;
  const r = rng(seed);
  return s.labels.map((name, i) => ({ name, color: COLOURS[i], ex: Array.from({ length: per }, () => SHAPES[name](r).map(st => simplifyStroke(st))) }));
}
export function sampleDrawing(name, seed = 99) { return SHAPES[name] ? SHAPES[name](rng(seed)) : null; }
