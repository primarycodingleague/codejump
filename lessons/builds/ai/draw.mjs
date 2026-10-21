// Wildwood Spotters (the AI Lab's lesson unit): drawings made by code, a bit wobbly like a pupil's, so every starter and
// every test is the same each time. A drawing is a list of strokes; a stroke is [x0,y0,x1,y1,…] in a 256×256 box.
//   tracks: deer (two pointed halves of a hoof) · fox (a pad and four toes) · duck (three toes with webbing)
//   signs:  left (an arrow pointing left) · right (an arrow pointing right) · closed (a circle with a bar: no entry)
import { rng, simplifyStroke } from '../../../ai/ai-model.js';

const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
// turn a list of [x,y] points into a stroke: moved, turned, sized, and wobbled
function stroke(pts, f, r, w = 4) { const s = []; for (const [x, y] of pts) { const [X, Y] = f(x, y); s.push(clamp(X + (r() - 0.5) * w), clamp(Y + (r() - 0.5) * w)); } return simplifyStroke(s); }
function oval(cx, cy, rx, ry, n = 18, a0 = 0) { const p = []; for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI * 2; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
function line(x1, y1, x2, y2, n = 6) { const p = []; for (let i = 0; i <= n; i++) p.push([x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n]); return p; }
// where the drawing goes on the pad: centre, size and a little turn
function place(r, size = 1) {
  const cx = 128 + (r() - 0.5) * 40, cy = 128 + (r() - 0.5) * 40, k = size * (0.8 + r() * 0.45), t = (r() - 0.5) * 0.3, c = Math.cos(t), s = Math.sin(t);
  return (x, y) => [cx + (x * c - y * s) * k, cy + (x * s + y * c) * k];
}

export const DRAW = {
  deer(r) { // two halves of a hoof, pointed at the top, with a gap between them
    const f = place(r), out = [], gap = 5 + r() * 6;
    for (const side of [-1, 1]) {
      const cx = side * (gap + 20), p = [];
      for (let i = 0; i <= 22; i++) { const a = -Math.PI / 2 + i / 22 * Math.PI * 2, k = 0.22 + 0.78 * (1 + Math.sin(a)) / 2; p.push([cx + Math.cos(a) * 22 * k * (1.2 + r() * 0.2), Math.sin(a) * 58]); }
      out.push(stroke(p, f, r));
    }
    return out;
  },
  fox(r) { // a big pad underneath and four toes in an arc above it
    const f = place(r), out = [stroke(oval(0, 30, 30 + r() * 6, 24 + r() * 5, 18), f, r)];
    for (const [x, y] of [[-36, -14], [-13, -38], [13, -38], [36, -14]]) out.push(stroke(oval(x, y, 10 + r() * 3, 13 + r() * 3, 10), f, r, 3));
    return out;
  },
  duck(r) { // three long toes from the heel, and webbing between the tips
    const f = place(r), out = [], L = 78 + r() * 14, tips = [];
    for (const a of [-0.95, 0, 0.95]) { const ang = a + (r() - 0.5) * 0.15 - Math.PI / 2, x = Math.cos(ang) * L, y = 40 + Math.sin(ang) * L; tips.push([x, y]); out.push(stroke(line(0, 40, x, y), f, r)); }
    const web = []; for (let i = 0; i < 2; i++) { const [ax, ay] = tips[i], [bx, by] = tips[i + 1], mx = (ax + bx) / 2, my = (ay + by) / 2 + 20; for (let k = 0; k <= 6; k++) { const t = k / 6; web.push([(1 - t) * (1 - t) * ax + 2 * (1 - t) * t * mx + t * t * bx, (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * my + t * t * by]); } }
    out.push(stroke(web, f, r, 3));
    return out;
  },
  left(r) { return arrow(r, -1); },
  right(r) { return arrow(r, 1); },
  closed(r) { // a no-entry sign: a circle with a bar across the middle
    const f = place(r), R = 60 + r() * 8;
    return [stroke(oval(0, 0, R, R * (0.9 + r() * 0.15), 24, r() * 6), f, r), stroke([[-R * 0.62, -8], [R * 0.62, -8], [R * 0.62, 8], [-R * 0.62, 8], [-R * 0.62, -8]], f, r, 3)];
  }
};
function arrow(r, dir) { // a long shaft and a head at one end
  const f = place(r), L = 70 + r() * 15, H = 30 + r() * 10, tip = dir * L;
  return [stroke(line(-tip, 0, tip, 0, 8), f, r), stroke([[tip - dir * H, -H], [tip, 0], [tip - dir * H, H]], f, r, 3)];
}

// n drawings of one thing (seeded: the same every time)
export function draws(name, n, seed) { const r = rng(seed); return Array.from({ length: n }, () => DRAW[name](r)); }
export function draw(name, seed) { return DRAW[name](rng(seed)); }
