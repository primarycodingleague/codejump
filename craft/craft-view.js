/* CodeJump · Build Lab — draws the block world with Three.js (the bundle the Critter Lab ships).
 *   const v = createView(THREE, canvas, world)
 *   v.render(cam, helper, opts) every frame · v.dirty(x,y,z) / v.dirtyAll() after edits · v.setTime('DAY'|'SUNSET'|'NIGHT')
 *   v.highlight(hit|null) · v.resize() · v.dispose() · v.screenRay(px, py) → {o, d} for picking
 * The look is "toy blocks": smooth painted tiles (64 px, our own, drawn here in code) with soft bevels, lit by a sun with
 * soft shadows and a sky, plus corner shading baked into vertex colours. Deliberately NOT pixel art.
 */
import { W, H, D, GROUND, BLOCKS, NBLOCKS } from './craft-world.js';

const CS = 16;                 // chunk size
const S = 64, G = 8, CELL = S + G * 2, ATLAS_COLS = 16; // tile size, gutter (stops colours bleeding at a distance)
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hexRgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const css = (c, a = 1) => 'rgba(' + c.map(v => Math.max(0, Math.min(255, Math.round(v)))).join(',') + ',' + a + ')';
const shade = (c, k) => c.map(v => v * k);

// ── painting one tile (S×S) with the 2D canvas ──
function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function grad(g, c1, c2, x0 = 0, y0 = 0, x1 = 0, y1 = S) { const q = g.createLinearGradient(x0, y0, x1, y1); q.addColorStop(0, c1); q.addColorStop(1, c2); return q; }
function bevel(g, k) { // light top/left, dark bottom/right: makes each block read as a moulded toy block
  if (!k) return; const b = 5;
  g.fillStyle = grad(g, 'rgba(255,255,255,' + 0.55 * k + ')', 'rgba(255,255,255,0)', 0, 0, 0, b); g.fillRect(0, 0, S, b);
  g.fillStyle = grad(g, 'rgba(255,255,255,' + 0.35 * k + ')', 'rgba(255,255,255,0)', 0, 0, b, 0); g.fillRect(0, 0, b, S);
  g.fillStyle = grad(g, 'rgba(0,0,0,0)', 'rgba(0,0,0,' + 0.4 * k + ')', 0, S - b, 0, S); g.fillRect(0, S - b, S, b);
  g.fillStyle = grad(g, 'rgba(0,0,0,0)', 'rgba(0,0,0,' + 0.28 * k + ')', S - b, 0, S, 0); g.fillRect(S - b, 0, b, S);
}
function blobs(g, R, col, a, n, r0, r1) {
  for (let i = 0; i < n; i++) {
    const x = R() * S, y = R() * S, r = r0 + R() * (r1 - r0), q = g.createRadialGradient(x, y, 0, x, y, r);
    q.addColorStop(0, css(col, a)); q.addColorStop(1, css(col, 0)); g.fillStyle = q;
    for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) { g.save(); g.translate(dx, dy); g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); } // wraps, so tiles join without seams
  }
}
function pebbles(g, R, col, a, n, r0, r1) { for (let i = 0; i < n; i++) { g.fillStyle = css(col, a); g.beginPath(); g.ellipse(4 + R() * (S - 8), 4 + R() * (S - 8), r0 + R() * (r1 - r0), (r0 + R() * (r1 - r0)) * 0.7, R() * 3, 0, 7); g.fill(); } }
const DIRT = [154, 106, 67], GRASS = [118, 196, 76];
function paintDirt(g, R) { g.fillStyle = grad(g, css(DIRT), css(shade(DIRT, 0.88))); g.fillRect(0, 0, S, S); blobs(g, R, shade(DIRT, 0.8), 0.35, 5, 8, 16); pebbles(g, R, [110, 72, 44], 0.55, 6, 2, 4); pebbles(g, R, [196, 150, 106], 0.45, 5, 1.5, 3); }
function paintTile(g, id, face, R) {
  const base = hexRgb(BLOCKS[id][3]);
  g.clearRect(0, 0, S, S);
  switch (id) {
    case 1: // grass
      if (face === 0) { g.fillStyle = grad(g, css(shade(GRASS, 1.05)), css(shade(GRASS, 0.93)), 0, 0, S, S); g.fillRect(0, 0, S, S); blobs(g, R, [160, 226, 110], 0.35, 6, 8, 16); blobs(g, R, [80, 160, 60], 0.25, 4, 6, 12);
        g.strokeStyle = 'rgba(70,140,50,.45)'; g.lineWidth = 1.4; g.lineCap = 'round'; for (let i = 0; i < 9; i++) { const x = 4 + R() * 56, y = 6 + R() * 54; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 1, y - 3, x + 2.5, y - 5); g.stroke(); }
        bevel(g, 0.05); return; }
      paintDirt(g, R); if (face === 2) { bevel(g, 0.18); return; }
      { const ph = R() * 6, edge = x => 14 + Math.sin(x * 0.19 + ph) * 3 + Math.sin(x * 0.53 + ph * 2) * 1.5;
        g.fillStyle = grad(g, css(shade(GRASS, 1.04)), css(shade(GRASS, 0.86)), 0, 0, 0, 20); g.beginPath(); g.moveTo(0, 0); g.lineTo(S, 0);
        for (let x = S; x >= 0; x -= 4) g.lineTo(x, edge(x)); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(60,120,40,.5)'; g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= S; x += 4) g.lineTo(x, edge(x) + 1); g.stroke(); }
      bevel(g, 0.18); return;
    case 2: paintDirt(g, R); bevel(g, 0.18); return;
    case 3: g.fillStyle = grad(g, '#a3aab2', '#8f969e'); g.fillRect(0, 0, S, S); blobs(g, R, [180, 188, 196], 0.35, 5, 8, 18); blobs(g, R, [110, 116, 124], 0.3, 5, 6, 14);
      g.strokeStyle = 'rgba(90,95,104,.45)'; g.lineWidth = 1.2; for (let i = 0; i < 2; i++) { let x = R() * S, y = R() * S; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (R() - 0.5) * 14; y += 4 + R() * 5; g.lineTo(x, y); } g.stroke(); }
      bevel(g, 0.22); return;
    case 4: { g.fillStyle = '#5f646c'; g.fillRect(0, 0, S, S);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const w = 18 + R() * 3, h = 17 + R() * 3, x = c * 21.3 + 1 + (R() - 0.5) * 2 + (r & 1) * 4 - 2, y = r * 21.3 + 1.5 + (R() - 0.5) * 2;
        const t = 0.85 + R() * 0.25, q = g.createRadialGradient(x + w * 0.35, y + h * 0.3, 1, x + w / 2, y + h / 2, w * 0.75); q.addColorStop(0, css(shade([190, 196, 204], t))); q.addColorStop(1, css(shade([128, 134, 142], t)));
        rrect(g, x, y, w, h, 7); g.fillStyle = q; g.fill(); g.strokeStyle = 'rgba(40,44,50,.35)'; g.lineWidth = 1; g.stroke(); }
      bevel(g, 0.12); return; }
    case 5: { for (let b = 0; b < 4; b++) { const y = b * 16, t = 0.92 + R() * 0.16, c = shade([204, 150, 86], t); g.fillStyle = grad(g, css(shade(c, 1.06)), css(shade(c, 0.94)), 0, y, 0, y + 16); g.fillRect(0, y, S, 16);
        g.strokeStyle = css(shade(c, 0.78), 0.4); g.lineWidth = 1; for (let k = 0; k < 2; k++) { const gy = y + 4 + R() * 8; g.beginPath(); g.moveTo(0, gy); g.bezierCurveTo(20, gy + (R() - 0.5) * 4, 40, gy + (R() - 0.5) * 4, S, gy + (R() - 0.5) * 3); g.stroke(); }
        g.fillStyle = 'rgba(255,240,210,.35)'; g.fillRect(0, y, S, 1.5); g.fillStyle = 'rgba(110,64,26,.75)'; g.fillRect(0, y + 14.5, S, 1.5);
        const sx = (b & 1) ? 22 : 48; g.fillStyle = 'rgba(110,64,26,.6)'; g.fillRect(sx, y, 1.5, 15); g.fillStyle = 'rgba(80,60,50,.7)'; g.beginPath(); g.arc(sx - 5, y + 8, 1.3, 0, 7); g.arc(sx + 6, y + 8, 1.3, 0, 7); g.fill(); }
      bevel(g, 0.14); return; }
    case 6: if (face !== 1) { g.fillStyle = '#6e4a2a'; g.fillRect(0, 0, S, S); const q = g.createRadialGradient(32, 32, 2, 32, 32, 27); q.addColorStop(0, '#e8bd82'); q.addColorStop(1, '#c9955c');
        g.fillStyle = q; g.beginPath(); g.arc(32, 32, 26, 0, 7); g.fill(); g.strokeStyle = 'rgba(150,100,55,.6)'; g.lineWidth = 1.5; for (let r = 6; r < 25; r += 5) { g.beginPath(); g.arc(32 + (R() - 0.5), 32 + (R() - 0.5), r, 0, 7); g.stroke(); } bevel(g, 0.2); return; }
      g.fillStyle = grad(g, '#86603a', '#74512f', 0, 0, S, 0); g.fillRect(0, 0, S, S);
      for (let i = 0; i < 7; i++) { const x = 4 + i * 9 + (R() - 0.5) * 3; g.strokeStyle = 'rgba(70,44,22,.55)'; g.lineWidth = 2 + R() * 1.5; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + (R() - 0.5) * 6, 20, x + (R() - 0.5) * 6, 44, x, S); g.stroke();
        g.strokeStyle = 'rgba(170,125,80,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 3, 0); g.lineTo(x + 3 + (R() - 0.5) * 3, S); g.stroke(); }
      bevel(g, 0.12); return;
    case 7: { g.fillStyle = '#3f8f35'; g.fillRect(0, 0, S, S); const cs = ['#4fae41', '#5cbf4b', '#3d9634', '#6acb55'];
      for (let i = 0; i < 26; i++) { g.fillStyle = cs[i % 4]; g.beginPath(); g.ellipse(R() * S, R() * S, 5 + R() * 5, 3 + R() * 3, R() * 3, 0, 7); g.fill(); }
      blobs(g, R, [190, 240, 150], 0.25, 4, 6, 12); g.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(6 + R() * 52, 6 + R() * 52, 2.5 + R() * 2.5, 2 + R() * 2, R() * 3, 0, 7); g.fill(); }
      g.globalCompositeOperation = 'source-over'; return; }
    case 8: g.fillStyle = grad(g, '#f1e0a8', '#e2cb8c'); g.fillRect(0, 0, S, S); blobs(g, R, [250, 238, 200], 0.4, 4, 8, 16);
      g.strokeStyle = 'rgba(205,180,120,.6)'; g.lineWidth = 1.5; for (let k = 0; k < 3; k++) { const y0 = 10 + k * 20 + R() * 6, ph = R() * 6; g.beginPath(); for (let x = 0; x <= S; x += 4) g.lineTo(x, y0 + Math.sin(x * 0.15 + ph) * 2.5); g.stroke(); }
      pebbles(g, R, [190, 160, 100], 0.5, 6, 0.8, 1.6); bevel(g, 0.12); return;
    case 9: { g.fillStyle = grad(g, 'rgba(80,165,240,.74)', 'rgba(44,118,214,.8)'); g.fillRect(0, 0, S, S); g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.lineCap = 'round';
      for (let k = 0; k < 5; k++) { const x = R() * 44, y = 6 + R() * 52; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 6, y - 3, x + 12, y); g.stroke(); } return; }
    case 10: { g.fillStyle = 'rgba(214,240,255,.16)'; g.fillRect(0, 0, S, S); rrect(g, 2, 2, S - 4, S - 4, 5); g.strokeStyle = 'rgba(240,252,255,.95)'; g.lineWidth = 3.5; g.stroke();
      rrect(g, 6, 6, S - 12, S - 12, 3); g.strokeStyle = 'rgba(150,205,235,.5)'; g.lineWidth = 1; g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(14, 30); g.lineTo(30, 14); g.moveTo(16, 40); g.lineTo(40, 16); g.stroke(); return; }
    case 11: { g.fillStyle = '#ddd2c4'; g.fillRect(0, 0, S, S);
      for (let r = 0; r < 4; r++) for (let c = -1; c < 2; c++) { const x = c * 32 + (r & 1) * 16 + 1.5, y = r * 16 + 1.5, t = 0.9 + R() * 0.18, col = shade([196, 86, 62], t);
        rrect(g, x, y, 29, 13, 3); g.fillStyle = grad(g, css(shade(col, 1.08)), css(shade(col, 0.88)), 0, y, 0, y + 13); g.fill(); g.fillStyle = 'rgba(255,220,200,.3)'; g.fillRect(x + 3, y + 1, 23, 1.5); }
      bevel(g, 0.1); return; }
    case 21: g.fillStyle = grad(g, '#ffe680', '#e3a82b', 0, 0, S, S); g.fillRect(0, 0, S, S); rrect(g, 7, 7, S - 14, S - 14, 7); g.strokeStyle = 'rgba(180,120,20,.35)'; g.lineWidth = 2; g.stroke();
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(10, S); g.lineTo(24, S); g.lineTo(S, 24); g.lineTo(S, 10); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,240,.9)'; for (const [x, y] of [[18, 18], [44, 40]]) { g.beginPath(); g.moveTo(x, y - 5); g.lineTo(x + 1.3, y - 1.3); g.lineTo(x + 5, y); g.lineTo(x + 1.3, y + 1.3); g.lineTo(x, y + 5); g.lineTo(x - 1.3, y + 1.3); g.lineTo(x - 5, y); g.lineTo(x - 1.3, y - 1.3); g.closePath(); g.fill(); }
      bevel(g, 0.35); return;
    case 22: { g.fillStyle = '#128a84'; g.fillRect(0, 0, S, S); const P = (pts, c) => { g.fillStyle = c; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); };
      P([[32, 8], [56, 32], [32, 56], [8, 32]], '#35d6c9'); P([[32, 8], [32, 32], [8, 32]], '#8ff7ec'); P([[32, 8], [56, 32], [32, 32]], '#5ae6da'); P([[8, 32], [32, 32], [32, 56]], '#22b3a8'); P([[32, 32], [56, 32], [32, 56]], '#1a9a91');
      g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(24, 22, 2.2, 0, 7); g.fill(); bevel(g, 0.25); return; }
    case 23: g.fillStyle = grad(g, '#ffffff', '#e4eef8'); g.fillRect(0, 0, S, S); blobs(g, R, [190, 214, 240], 0.3, 5, 8, 16); bevel(g, 0.12); return;
    case 24: { g.fillStyle = '#7a5530'; g.fillRect(0, 0, S, S); const q = g.createRadialGradient(32, 32, 2, 32, 32, 30); q.addColorStop(0, '#fffbe3'); q.addColorStop(0.6, '#ffe28a'); q.addColorStop(1, '#ffbf3a');
      rrect(g, 6, 6, S - 12, S - 12, 6); g.fillStyle = q; g.fill(); g.fillStyle = 'rgba(122,85,48,.85)'; g.fillRect(30.5, 6, 3, S - 12); g.fillRect(6, 30.5, S - 12, 3); bevel(g, 0.2); return; }
    default: { // the coloured toy blocks
      g.fillStyle = grad(g, css(shade(base, 1.1)), css(shade(base, 0.9))); g.fillRect(0, 0, S, S);
      rrect(g, 8, 8, S - 16, S - 16, 9); g.fillStyle = 'rgba(255,255,255,' + (id === 20 ? 0.07 : 0.12) + ')'; g.fill(); g.strokeStyle = css(shade(base, 0.82), 0.5); g.lineWidth = 1.5; g.stroke();
      bevel(g, id === 19 ? 0.5 : 0.32); }
  }
}
export function makeAtlas(doc) {
  const cv = doc.createElement('canvas'); cv.width = ATLAS_COLS * CELL; cv.height = Math.ceil(NBLOCKS * 3 / ATLAS_COLS) * CELL;
  const g = cv.getContext('2d');
  const tile = doc.createElement('canvas'); tile.width = tile.height = S; const tg = tile.getContext('2d');
  for (let id = 1; id < NBLOCKS; id++) for (let face = 0; face < 3; face++) {
    const t = id * 3 + face, ox = (t % ATLAS_COLS) * CELL + G, oy = Math.floor(t / ATLAS_COLS) * CELL + G;
    paintTile(tg, id, face, rng(id * 97 + face * 13 + 5));
    g.drawImage(tile, ox, oy);
    // copy the edges out into the gutter so mipmaps don't pick up the neighbours
    g.drawImage(tile, 0, 0, 1, S, ox - G, oy, G, S); g.drawImage(tile, S - 1, 0, 1, S, ox + S, oy, G, S);
    g.drawImage(cv, ox - G, oy, S + G * 2, 1, ox - G, oy - G, S + G * 2, G); g.drawImage(cv, ox - G, oy + S - 1, S + G * 2, 1, ox - G, oy + S, S + G * 2, G);
  }
  return cv;
}
const tileXY = id => f => { const t = id * 3 + f; return [(t % ATLAS_COLS) * CELL + G, Math.floor(t / ATLAS_COLS) * CELL + G]; };
// a small picture of one block (for the hotbar and the block picker)
export function blockIcon(doc, atlas, id, size = 40) {
  const sc = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1), px = Math.round(size * sc);
  const cv = doc.createElement('canvas'); cv.width = cv.height = px; cv.style.width = cv.style.height = size + 'px'; const g = cv.getContext('2d');
  if (!id) return cv;
  const T = tileXY(id), s = px / 2, top = T(0), side = T(1), k = S;
  g.save(); g.setTransform(s / k, s / (2 * k), -s / k, s / (2 * k), s, px * 0.06); g.drawImage(atlas, top[0], top[1], k, k, 0, 0, k, k); g.restore();
  g.save(); g.setTransform(s / k, s / (2 * k), 0, s / k * 1.12, 0, px * 0.06 + s / 2); g.drawImage(atlas, side[0], side[1], k, k, 0, 0, k, k); g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(0, 0, k, k); g.restore();
  g.save(); g.setTransform(s / k, -s / (2 * k), 0, s / k * 1.12, s, px * 0.06 + s); g.drawImage(atlas, side[0], side[1], k, k, 0, 0, k, k); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, 0, k, k); g.restore();
  return cv;
}

// faces: normal, 4 corners (unit cube), which tile (0 top, 1 side, 2 bottom)
const FACES = [
  { n: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], t: 0 },
  { n: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], t: 2 },
  { n: [1, 0, 0], c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], t: 1 },
  { n: [-1, 0, 0], c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], t: 1 },
  { n: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], t: 1 },
  { n: [0, 0, -1], c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], t: 1 }
];
for (const f of FACES) f.ax = [0, 1, 2].filter(i => !f.n[i]);
const UV = [[0, 1], [1, 1], [1, 0], [0, 0]];
const kindOf = id => (id === 9 || id === 10 ? 2 : id === 7 ? 1 : id === 24 ? 3 : 0); // 0 solid, 1 cut-out, 2 see-through, 3 glowing

const TIMES = {
  DAY: { top: '#2f7fe0', hor: '#a9d8fb', sun: '#fff1dc', si: 2.4, hi: 1.8, hs: '#d4e9ff', hg: '#7d6e55', dir: [0.55, 0.85, 0.4], orb: '#fff6d8', stars: 0, exp: 1 },
  SUNSET: { top: '#3a4f9a', hor: '#ffae78', sun: '#ffa66b', si: 1.9, hi: 1.05, hs: '#ffd0b0', hg: '#6a5050', dir: [0.95, 0.32, 0.15], orb: '#ff8c45', stars: 0.25, exp: 1 },
  NIGHT: { top: '#040a20', hor: '#1d2c5c', sun: '#a7bcff', si: 0.55, hi: 0.6, hs: '#7a90d8', hg: '#262a3c', dir: [-0.4, 0.9, 0.35], orb: '#eef2ff', stars: 1, exp: 1.1 }
};

export function createView(THREE, canvas, world) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, 1, 0.08, 600);
  const horizon = new THREE.Color('#c4e6ff'); scene.background = horizon; scene.fog = new THREE.Fog(horizon, 48, 130);

  // ── textures + materials ──
  const atlas = makeAtlas(document);
  const tex = new THREE.CanvasTexture(atlas); tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1);
  if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
  const mats = [
    new THREE.MeshLambertMaterial({ map: tex, vertexColors: true }),
    new THREE.MeshLambertMaterial({ map: tex, vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide }),
    new THREE.MeshPhongMaterial({ map: tex, vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, shininess: 90, specular: 0x88aacc }),
    new THREE.MeshBasicMaterial({ map: tex, vertexColors: true })
  ];

  // ── chunks ──
  const chunks = new Map(); const dirtySet = new Set();
  const NX = Math.ceil(W / CS), NY = Math.ceil(H / CS), NZ = Math.ceil(D / CS);
  function dirtyAll() { for (let cy = 0; cy < NY; cy++) for (let cz = 0; cz < NZ; cz++) for (let cx = 0; cx < NX; cx++) dirtySet.add(cx + ',' + cy + ',' + cz); }
  dirtyAll();
  const solidish = id => id && kindOf(id) !== 2 && id !== 7;
  const du = CELL / atlas.width, dv = CELL / atlas.height, iu = S / atlas.width, iv = S / atlas.height, gu = G / atlas.width, gv = G / atlas.height;
  function buildChunk(cx, cy, cz) {
    const key = cx + ',' + cy + ',' + cz, arrs = [0, 1, 2, 3].map(() => ({ p: [], n: [], u: [], c: [], i: [] }));
    for (let y = cy * CS; y < Math.min(H, (cy + 1) * CS); y++) for (let z = cz * CS; z < Math.min(D, (cz + 1) * CS); z++) for (let x = cx * CS; x < Math.min(W, (cx + 1) * CS); x++) {
      const id = world.get(x, y, z); if (!id) continue;
      const kind = kindOf(id), A = arrs[kind];
      for (const f of FACES) {
        const nid = world.get(x + f.n[0], y + f.n[1], z + f.n[2]);
        if (nid === id && kind !== 0) continue; // glass next to glass, water next to water: no face between
        if (nid && solidish(nid) && kindOf(nid) !== 1) continue;
        if (y + f.n[1] < 0) continue;
        const t = id * 3 + f.t, u0 = (t % ATLAS_COLS) * du + gu, v0 = Math.floor(t / ATLAS_COLS) * dv + gv;
        const base = A.p.length / 3;
        for (let k = 0; k < 4; k++) {
          const c = f.c[k];
          let py = y + c[1]; if (id === 9 && c[1] === 1 && world.get(x, y + 1, z) !== 9) py -= 0.12;
          A.p.push(x + c[0], py, z + c[2]); A.n.push(f.n[0], f.n[1], f.n[2]);
          A.u.push(u0 + UV[k][0] * iu, 1 - (v0 + UV[k][1] * iv));
          let ao = 0;
          if (kind !== 3) { // corner shading: the blocks beside and across this corner, just outside the face
            const ax = f.ax, bx = x + f.n[0], by = y + f.n[1], bz = z + f.n[2], o1 = [0, 0, 0], o2 = [0, 0, 0];
            o1[ax[0]] = c[ax[0]] ? 1 : -1; o2[ax[1]] = c[ax[1]] ? 1 : -1;
            const s1 = solidish(world.get(bx + o1[0], by + o1[1], bz + o1[2])), s2 = solidish(world.get(bx + o2[0], by + o2[1], bz + o2[2]));
            const cn = solidish(world.get(bx + o1[0] + o2[0], by + o1[1] + o2[1], bz + o1[2] + o2[2]));
            ao = s1 && s2 ? 3 : (s1 ? 1 : 0) + (s2 ? 1 : 0) + (cn ? 1 : 0);
          }
          const b = 1 - ao * 0.15; A.c.push(b, b, b);
        }
        A.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
      }
    }
    const old = chunks.get(key); if (old) for (const m of old) { scene.remove(m); m.geometry.dispose(); }
    const meshes = [];
    arrs.forEach((A, k) => {
      if (!A.i.length) return;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(A.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(A.n, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(A.u, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(A.c, 3)); g.setIndex(A.i); g.computeBoundingSphere();
      const m = new THREE.Mesh(g, mats[k]); m.receiveShadow = k !== 3; m.castShadow = k === 0 || k === 1; if (k === 2) m.renderOrder = 2;
      scene.add(m); meshes.push(m);
    });
    chunks.set(key, meshes);
  }
  function dirty(x, y, z) {
    if (x < 0) { dirtyAll(); return; }
    const mark = (a, b, c) => { if (a < 0 || b < 0 || c < 0 || a >= W || b >= H || c >= D) return; dirtySet.add(Math.floor(a / CS) + ',' + Math.floor(b / CS) + ',' + Math.floor(c / CS)); };
    mark(x, y, z); mark(x - 1, y, z); mark(x + 1, y, z); mark(x, y - 1, z); mark(x, y + 1, z); mark(x, y, z - 1); mark(x, y, z + 1);
  }

  // ── light, sky, clouds, the meadow round the edge ──
  const hemi = new THREE.HemisphereLight(0xd4e9ff, 0x7d6e55, 1.8); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.4); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -34; sc.right = 34; sc.top = 34; sc.bottom = -34; sc.near = 1; sc.far = 220; sc.updateProjectionMatrix();
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04; sun.shadow.radius = 3; scene.add(sun); scene.add(sun.target);
  const skyGeo = new THREE.SphereGeometry(400, 32, 16), skyCol = new Float32Array(skyGeo.attributes.position.count * 3);
  skyGeo.setAttribute('color', new THREE.BufferAttribute(skyCol, 3));
  const skyM = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); skyM.renderOrder = -10; scene.add(skyM);
  const starPos = []; { const R = rng(7); for (let i = 0; i < 500; i++) { const a = R() * Math.PI * 2, e = 0.08 + R() * 1.4, r = 380; starPos.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r); } }
  const starG = new THREE.BufferGeometry(); starG.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starG, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0, depthWrite: false })); scene.add(stars);
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), q = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    q.addColorStop(0, 'rgba(255,255,255,1)'); q.addColorStop(0.22, 'rgba(255,255,255,1)'); q.addColorStop(0.3, 'rgba(255,255,255,.45)'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const orb = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.MeshBasicMaterial({ map: glowTex, color: 0xfff6d8, transparent: true, fog: false, depthWrite: false, toneMapped: false })); orb.renderOrder = -9; scene.add(orb);
  const clouds = new THREE.Group(), cloudM = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x8fa0b4, emissiveIntensity: 0.45 }), puffG = new THREE.SphereGeometry(1, 16, 10);
  { const R = rng(11); for (let i = 0; i < 12; i++) { const cg = new THREE.Group(), n = 3 + (R() * 3 | 0);
      for (let k = 0; k < n + 2; k++) { const r = 2.6 + R() * 2.4, m = new THREE.Mesh(puffG, cloudM); m.scale.set(r * 1.25, r * 0.8, r); m.position.set(k * 3.4 - n * 1.9 + (R() - 0.5) * 2, (k % 2) * 0.9 + R() * 0.6, (R() - 0.5) * 3.5); cg.add(m); }
      cg.position.set(-60 + R() * 190, 46 + R() * 10, -60 + R() * 190); cg.userData.v = 0.4 + R() * 0.5; clouds.add(cg); } }
  scene.add(clouds);
  const meadowM = new THREE.MeshLambertMaterial({ color: 0x6fbf4a }), MG = 400;
  for (const [x0, z0, x1, z1] of [[-MG, -MG, W + MG, 0], [-MG, D, W + MG, D + MG], [-MG, 0, 0, D], [W, 0, W + MG, D]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), meadowM); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, GROUND + 0.98, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m);
  }

  // ── the robot helper (our own design): a glossy rounded robot with a screen face, side pods and a hover ring ──
  const pmrem = new THREE.PMREMGenerator(renderer);
  { const es = new THREE.Scene(), eg = new THREE.SphereGeometry(10, 24, 12), ec = [], p = eg.attributes.position;
    for (let i = 0; i < p.count; i++) { const t = p.getY(i) / 10, c = t > 0 ? new THREE.Color('#bfe2ff').lerp(new THREE.Color('#ffffff'), t) : new THREE.Color('#bfe2ff').lerp(new THREE.Color('#6d7a62'), -t); ec.push(c.r, c.g, c.b); }
    eg.setAttribute('color', new THREE.Float32BufferAttribute(ec, 3)); es.add(new THREE.Mesh(eg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); lamp.position.set(4, 7, 3); es.add(lamp);
    var envTex = pmrem.fromScene(es, 0.04).texture; } // only the helper and you shine with it (on the blocks it would drown out the sun)
  const helperG = new THREE.Group(), bodyG = new THREE.Group(); helperG.add(bodyG);
  const shell = new THREE.MeshPhysicalMaterial({ color: 0xf5f8fc, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12 });
  const teal = new THREE.MeshPhysicalMaterial({ color: 0x18b3a6, roughness: 0.38, clearcoat: 0.6 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x0f1522, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 });
  const neon = new THREE.MeshBasicMaterial({ color: 0x7ff6ff, toneMapped: false });
  const add = (geo, mat, x, y, z, parent = bodyG) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  add(new THREE.RoundedBoxGeometry(0.66, 0.58, 0.6, 5, 0.17), shell, 0, 0, 0);
  add(new THREE.RoundedBoxGeometry(0.68, 0.09, 0.62, 4, 0.045), teal, 0, -0.17, 0);
  add(new THREE.RoundedBoxGeometry(0.5, 0.32, 0.06, 4, 0.06), glass, 0, 0.05, -0.285);
  const eyes = [-0.1, 0.1].map(x => { const e = add(new THREE.CapsuleGeometry(0.036, 0.05, 4, 10), neon, x, 0.08, -0.322); e.castShadow = false; return e; });
  const smile = add(new THREE.TorusGeometry(0.06, 0.013, 6, 18, Math.PI), neon, 0, 0.0, -0.322); smile.rotation.z = Math.PI; smile.castShadow = false;
  for (const sx of [-1, 1]) { const pod = add(new THREE.CylinderGeometry(0.12, 0.12, 0.07, 24), teal, sx * 0.35, 0.02, 0); pod.rotation.z = Math.PI / 2;
    const ring = add(new THREE.TorusGeometry(0.075, 0.014, 8, 24), neon, sx * 0.39, 0.02, 0); ring.rotation.y = Math.PI / 2; ring.castShadow = false; }
  add(new THREE.RoundedBoxGeometry(0.34, 0.2, 0.05, 3, 0.025), teal, 0, 0.06, 0.29);
  for (const y of [0.02, 0.1]) { const v = add(new THREE.CapsuleGeometry(0.018, 0.18, 3, 8), glass, 0, y, 0.318); v.rotation.z = Math.PI / 2; }
  add(new THREE.CylinderGeometry(0.014, 0.014, 0.16, 8), new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: 0.8, roughness: 0.3 }), 0, 0.36, 0);
  const tip = add(new THREE.SphereGeometry(0.048, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff7a2f, toneMapped: false }), 0, 0.46, 0);
  const ringB = add(new THREE.TorusGeometry(0.15, 0.025, 10, 32), neon, 0, -0.3, 0); ringB.rotation.x = Math.PI / 2; ringB.castShadow = false;
  scene.add(helperG);
  const useEnv = g => g.traverse(o => { if (o.material && (o.material.isMeshStandardMaterial)) { o.material.envMap = envTex; o.material.envMapIntensity = 0.9; } });
  useEnv(helperG);
  const blobTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), q = g.createRadialGradient(32, 32, 0, 32, 32, 32); q.addColorStop(0, 'rgba(0,0,0,.45)'); q.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = q; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const shadowM = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })); shadowM.rotation.x = -Math.PI / 2; scene.add(shadowM);

  // ── you, seen from the helper camera: a rounded figure in CodeJump gold ──
  const meG = new THREE.Group();
  const mm = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55 });
  const part = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; meG.add(m); return m; };
  part(new THREE.CapsuleGeometry(0.27, 0.5, 6, 16), mm(0xc8973f), 0, 0.62, 0);
  part(new THREE.SphereGeometry(0.25, 24, 16), mm(0xf2c9a0), 0, 1.33, 0);
  part(new THREE.SphereGeometry(0.26, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.1), mm(0x2b2240), 0, 1.36, 0.01);
  for (const x of [-0.08, 0.08]) part(new THREE.SphereGeometry(0.035, 10, 8), mm(0x1b1b22), x, 1.35, -0.225);
  meG.visible = false; useEnv(meG); scene.add(meG);

  // ── World Maker: characters, areas, the start spot ──
  const markG = new THREE.Group(); scene.add(markG);
  const npcObjs = new Map(); let lastMarkers = null;
  function label(text, bg, fg, scale) { // a rounded name tag (always faces you)
    const c = document.createElement('canvas'), g = c.getContext('2d'); g.font = '700 44px Montserrat, Arial, sans-serif';
    const w = Math.min(1000, Math.ceil(g.measureText(text).width) + 48); c.width = w; c.height = 72;
    g.font = '700 44px Montserrat, Arial, sans-serif'; g.fillStyle = bg; g.beginPath(); g.roundRect ? g.roundRect(2, 2, w - 4, 68, 30) : g.rect(2, 2, w - 4, 68); g.fill();
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, 38);
    const t = new THREE.CanvasTexture(c); if ('colorSpace' in t) t.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false })); sp.scale.set(scale * w / 72, scale, 1); sp.renderOrder = 5; return sp;
  }
  function npcModel(n) {
    const G = new THREE.Group(), shirt = new THREE.MeshStandardMaterial({ color: n.colour, roughness: 0.55 }), skin = new THREE.MeshStandardMaterial({ color: 0xf0c49c, roughness: 0.6 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x2b2240, roughness: 0.5 });
    const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.userData.npc = n.id; G.add(o); return o; };
    add(new THREE.CapsuleGeometry(0.27, 0.5, 6, 16), shirt, 0, 0.62, 0);
    add(new THREE.SphereGeometry(0.25, 24, 16), skin, 0, 1.33, 0);
    add(new THREE.SphereGeometry(0.262, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.2), dark, 0, 1.37, 0.01);
    for (const x of [-0.085, 0.085]) add(new THREE.SphereGeometry(0.036, 10, 8), dark, x, 1.34, -0.225);
    const smile = add(new THREE.TorusGeometry(0.06, 0.012, 6, 14, Math.PI), dark, 0, 1.27, -0.235); smile.rotation.z = Math.PI;
    G.traverse(o => { if (o.material && o.material.isMeshStandardMaterial) { o.material.envMap = envTex; o.material.envMapIntensity = 0.7; } });
    const tag = label(n.name, 'rgba(20,22,30,0.78)', '#ffffff', 0.32); tag.position.set(0, 2.05, 0); G.add(tag);
    const mark = label('!', '#ffb000', '#2b2240', 0.42); mark.position.set(0, 2.5, 0); mark.visible = false; G.add(mark);
    G.userData = { id: n.id, mark, f: n.f || 0 };
    G.position.set(n.x + 0.5, n.y, n.z + 0.5); G.rotation.y = -(n.f || 0) * Math.PI / 2;
    return G;
  }
  function setMarkers(m) {
    lastMarkers = m;
    for (const o of [...markG.children]) { markG.remove(o); o.traverse(q => { if (q.geometry) q.geometry.dispose(); if (q.material) { if (q.material.map) q.material.map.dispose(); q.material.dispose(); } }); }
    npcObjs.clear();
    if (!m) return;
    for (const n of m.npcs || []) { const G = npcModel(n); G.userData.mark.visible = !!(m.attention && m.attention.has(n.id)); markG.add(G); npcObjs.set(n.id, G); }
    for (const z of m.zones || []) {
      if (!m.editing && !z.show) continue;
      const x0 = Math.min(z.a[0], z.b[0]), x1 = Math.max(z.a[0], z.b[0]) + 1, y0 = Math.min(z.a[1], z.b[1]), y1 = Math.max(z.a[1], z.b[1]) + 1, z0 = Math.min(z.a[2], z.b[2]), z1 = Math.max(z.a[2], z.b[2]) + 1;
      const geo = new THREE.BoxGeometry(x1 - x0 + 0.02, y1 - y0 + 0.02, z1 - z0 + 0.02), c = new THREE.Color(z.colour || '#ffd166');
      const fill = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: m.editing ? 0.14 : 0.08, depthWrite: false, side: THREE.DoubleSide }));
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.95 }));
      const G = new THREE.Group(); G.add(fill); G.add(edge); fill.renderOrder = 3; edge.renderOrder = 4; G.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
      if (m.editing || m.labels) { const t = label(z.name, 'rgba(20,22,30,0.72)', z.colour || '#ffd166', 0.3); t.position.set(0, (y1 - y0) / 2 + 0.35, 0); G.add(t); }
      markG.add(G);
    }
    if (m.editing && m.start) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 8, 32), new THREE.MeshBasicMaterial({ color: 0xffd166, toneMapped: false }));
      ring.rotation.x = Math.PI / 2; ring.position.set(m.start.x, m.start.y + 0.05, m.start.z); markG.add(ring);
      const t = label('Start', 'rgba(20,22,30,0.72)', '#ffd166', 0.28); t.position.set(m.start.x, m.start.y + 0.6, m.start.z); markG.add(t);
    }
  }
  function setAttention(set) { for (const [id, G] of npcObjs) G.userData.mark.visible = !!(set && set.has(id)); }
  // teammates in a competition room: a figure in their colour with their name, gliding to where they are
  const mates = new Map();
  function setMates(list) {
    const seen = new Set();
    for (const m of list || []) {
      seen.add(m.uid); let G = mates.get(m.uid);
      if (!G) { G = npcModel({ id: 'mate:' + m.uid, name: m.name, colour: m.color || '#ffd166', f: 0, x: m.x - 0.5, y: m.y, z: m.z - 0.5 }); G.userData.mate = true; markG.parent.add(G); mates.set(m.uid, G); G.position.set(m.x, m.y, m.z); }
      G.userData.to = { x: m.x, y: m.y, z: m.z, yaw: m.yaw };
    }
    for (const [uid, G] of mates) if (!seen.has(uid)) { scene.remove(G); G.traverse(q => { if (q.geometry) q.geometry.dispose(); }); mates.delete(uid); }
  }
  const rc = new THREE.Raycaster();
  function pickNpc(px, py) {
    if (!npcObjs.size) return null;
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1; rc.setFromCamera(new THREE.Vector2((px / w) * 2 - 1, -(py / h) * 2 + 1), camera);
    const hits = rc.intersectObjects([...npcObjs.values()], true).filter(i => i.object.userData.npc);
    return hits.length ? { id: hits[0].object.userData.npc, dist: hits[0].distance } : null;
  }

  // ── the block you point at ──
  const hl = new THREE.Group();
  hl.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.006, 1.006, 1.006)), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })));
  hl.add(new THREE.Mesh(new THREE.BoxGeometry(1.004, 1.004, 1.004), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.13, depthWrite: false })));
  hl.visible = false; scene.add(hl);

  // ── little puffs when a block goes in or comes out ──
  const PN = 160, pMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xffffff }), PN);
  pMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); pMesh.frustumCulled = false; const parts = []; const tmpM = new THREE.Matrix4(), tmpC = new THREE.Color();
  for (let i = 0; i < PN; i++) { pMesh.setMatrixAt(i, tmpM.makeScale(0, 0, 0)); pMesh.setColorAt(i, tmpC.set(0xffffff)); parts.push({ life: 0 }); }
  scene.add(pMesh); let pNext = 0, puffs = 0;
  function puff(x, y, z, id) {
    if (!id || puffs > 3) return; puffs++;
    tmpC.set(BLOCKS[id][3]);
    for (let k = 0; k < 7; k++) { const i = pNext, p = parts[i]; pNext = (pNext + 1) % PN;
      Object.assign(p, { x: x + 0.2 + Math.random() * 0.6, y: y + 0.2 + Math.random() * 0.6, z: z + 0.2 + Math.random() * 0.6, vx: (Math.random() - 0.5) * 3, vy: 1.5 + Math.random() * 2.5, vz: (Math.random() - 0.5) * 3, life: 0.55 + Math.random() * 0.3, s: 0.1 + Math.random() * 0.08 });
      pMesh.setColorAt(i, tmpC); }
    pMesh.instanceColor.needsUpdate = true;
  }

  // ── time of day ──
  let timeName = 'DAY';
  const topC = new THREE.Color(), horC = new THREE.Color(), tmp = new THREE.Color(), sunDir = new THREE.Vector3();
  function setTime(n) {
    timeName = TIMES[n] ? n : 'DAY'; const T = TIMES[timeName];
    topC.set(T.top); horC.set(T.hor); horizon.copy(horC); scene.fog.color.copy(horC);
    const p = skyGeo.attributes.position; for (let i = 0; i < p.count; i++) { const t = Math.max(0, p.getY(i) / 400); tmp.copy(horC).lerp(topC, Math.pow(t, 0.55)); skyCol[i * 3] = tmp.r; skyCol[i * 3 + 1] = tmp.g; skyCol[i * 3 + 2] = tmp.b; }
    skyGeo.attributes.color.needsUpdate = true;
    sun.color.set(T.sun); sun.intensity = T.si; hemi.color.set(T.hs); hemi.groundColor.set(T.hg); hemi.intensity = T.hi;
    sunDir.set(...T.dir).normalize(); orb.material.color.set(T.orb); stars.material.opacity = T.stars; renderer.toneMappingExposure = T.exp;
    meadowM.color.set(timeName === 'NIGHT' ? 0x5f9a48 : 0x6fbf4a);
  }
  setTime('DAY');

  let builtFirst = false, lastT = performance.now(), blinkAt = 2;
  function render(cam, helper, opts) {
    opts = opts || {};
    const now = performance.now(), dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    let budget = builtFirst ? 6 : 1e9; // rebuild a few changed chunks each frame (all of them the first time)
    for (const key of dirtySet) { if (budget-- <= 0) break; dirtySet.delete(key); const [a, b, c] = key.split(',').map(Number); buildChunk(a, b, c); }
    builtFirst = true; puffs = 0;
    // helper: glide between cells, turn smoothly, bob, blink
    const t = helper.t == null ? 1 : helper.t, fr = helper.from || helper, e = t * t * (3 - 2 * t);
    const hx = fr.x + (helper.x - fr.x) * e + 0.5, hy = fr.y + (helper.y - fr.y) * e + 0.42 + Math.sin(now / 420) * 0.05, hz = fr.z + (helper.z - fr.z) * e + 0.5;
    let a0 = -(fr.f || 0) * Math.PI / 2, a1 = -(helper.f || 0) * Math.PI / 2; while (a1 - a0 > Math.PI) a1 -= Math.PI * 2; while (a0 - a1 > Math.PI) a1 += Math.PI * 2;
    helperG.position.set(hx, hy, hz); helperG.rotation.y = a0 + (a1 - a0) * e;
    bodyG.rotation.x = t < 1 ? -0.12 * Math.sin(t * Math.PI) : 0; // leans into each move
    blinkAt -= dt; const bl = blinkAt < 0.12 && blinkAt > 0 ? 0.15 : 1; if (blinkAt < 0) blinkAt = 2.5 + Math.random() * 2.5; for (const ey of eyes) ey.scale.y = bl;
    ringB.scale.setScalar(1 + Math.sin(now / 200) * 0.06);
    let gy = Math.floor(hy); while (gy > 0 && !world.get(Math.floor(hx), gy - 1, Math.floor(hz))) gy--;
    shadowM.position.set(hx, gy + 0.015, hz); shadowM.visible = hy - gy < 6; shadowM.scale.setScalar(1 - Math.min(0.5, Math.max(0, hy - gy - 0.4) * 0.1));
    tip.material.color.set(Math.sin(now / 260) > 0 ? 0xff7a2f : 0xffc23c);
    if (opts.me) { meG.visible = !!opts.showMe; meG.position.set(opts.me.x, opts.me.y, opts.me.z); meG.rotation.y = opts.me.yaw;
      for (const G of npcObjs.values()) { // characters turn to look at you when you come close
        const dx = opts.me.x - G.position.x, dz = opts.me.z - G.position.z, near = dx * dx + dz * dz < 36;
        let want = near ? Math.atan2(-dx, -dz) : -G.userData.f * Math.PI / 2, cur = G.rotation.y; while (want - cur > Math.PI) want -= Math.PI * 2; while (cur - want > Math.PI) want += Math.PI * 2;
        G.rotation.y = cur + (want - cur) * Math.min(1, dt * 6); G.userData.mark.position.y = 2.5 + Math.sin(now / 300) * 0.06; } }
    for (const G of mates.values()) { const to = G.userData.to; if (!to) continue; const k = Math.min(1, dt * 8); G.position.x += (to.x - G.position.x) * k; G.position.y += (to.y - G.position.y) * k; G.position.z += (to.z - G.position.z) * k; G.rotation.y = to.yaw; }
    // puffs
    let live = false;
    for (let i = 0; i < PN; i++) { const p = parts[i]; if (p.life <= 0) continue; live = true; p.life -= dt; p.vy -= 12 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      const s = p.life > 0 ? p.s * Math.min(1, p.life * 3) : 0; tmpM.makeScale(s, s, s).setPosition(p.x, p.y, p.z); pMesh.setMatrixAt(i, tmpM); }
    if (live || pMesh.userData.live) pMesh.instanceMatrix.needsUpdate = true; pMesh.userData.live = live;
    // camera, sky and the sun's shadow box follow you
    camera.position.set(cam.x, cam.y, cam.z);
    camera.lookAt(cam.x + cam.dx, cam.y + cam.dy, cam.z + cam.dz);
    skyM.position.copy(camera.position); stars.position.copy(camera.position);
    orb.position.copy(camera.position).addScaledVector(sunDir, 300); orb.lookAt(camera.position);
    const fx = Math.round(cam.x + cam.dx * 12), fz = Math.round(cam.z + cam.dz * 12);
    sun.target.position.set(fx, GROUND, fz); sun.position.set(fx + sunDir.x * 90, GROUND + sunDir.y * 90, fz + sunDir.z * 90);
    for (const c of clouds.children) { c.position.x += c.userData.v * dt; if (c.position.x > W + 110) c.position.x = -110; }
    renderer.render(scene, camera);
  }
  function highlight(h) { if (!h) { hl.visible = false; return; } hl.visible = true; hl.position.set(h.x + 0.5, h.y + 0.5, h.z + 0.5); }
  function resize() { const w = canvas.clientWidth || 300, h = canvas.clientHeight || 200; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function screenRay(px, py) {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    const v = new THREE.Vector3((px / w) * 2 - 1, -(py / h) * 2 + 1, 0.5).unproject(camera).sub(camera.position).normalize();
    return { o: [camera.position.x, camera.position.y, camera.position.z], d: [v.x, v.y, v.z] };
  }
  world.onChange((x, y, z, id, old) => { dirty(x, y, z); if (x >= 0 && builtFirst) puff(x, y, z, id || old); });
  return { render, dirty, dirtyAll, setTime, time: () => timeName, highlight, resize, screenRay, atlas, renderer, camera, scene, setMarkers, setAttention, pickNpc, setMates,
    dispose() { renderer.dispose(); tex.dispose(); pmrem.dispose(); for (const ms of chunks.values()) for (const m of ms) m.geometry.dispose(); }, _chunks: chunks };
}
