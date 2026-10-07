/* CodeJump · Build Lab — the block world (no DOM, so it runs in Node tests too).
 *
 * A world is a box of W×H×D cells; each cell holds a block id (0 = air). x runs east, y up, z south.
 * The robot helper and the player live here too; the view (craft-view.js) only draws what this file says.
 *
 *   const w = createWorld();            // the starter world: grass, a few trees, a pond
 *   w.get(x,y,z) · w.set(x,y,z,id) · w.fill(id, a, b, mode) · w.line(id, a, b) · w.ball(id, r, c, mode)
 *   w.save() → string (run-length + base64)  ·  w.load(str)  ·  w.onChange(fn(x,y,z))
 *
 * Positions pupils type are relative to the player: right, up, ahead (see `rel`), so "fill … from 0 0 2 to 4 3 2"
 * always builds in front of them, whichever way they face.
 */
export const W = 64, H = 40, D = 64, GROUND = 12;

// id, Python name, label, colour (for the map / dropdown swatches), solid?, see-through?
export const BLOCKS = [
  [0, 'AIR', 'air (nothing)', '#000000', false, true],
  [1, 'GRASS', 'grass', '#62b13a', true, false],
  [2, 'DIRT', 'dirt', '#8a5a33', true, false],
  [3, 'STONE', 'stone', '#8d9096', true, false],
  [4, 'COBBLE', 'cobblestone', '#7a7d84', true, false],
  [5, 'PLANKS', 'wood planks', '#c08a4b', true, false],
  [6, 'LOG', 'tree trunk', '#7a5530', true, false],
  [7, 'LEAVES', 'leaves', '#3f9a3a', true, true],
  [8, 'SAND', 'sand', '#e8d395', true, false],
  [9, 'WATER', 'water', '#3b84e0', false, true],
  [10, 'GLASS', 'glass', '#cfeefa', true, true],
  [11, 'BRICKS', 'bricks', '#b4533d', true, false],
  [12, 'RED', 'red block', '#e53935', true, false],
  [13, 'ORANGE', 'orange block', '#fb8c00', true, false],
  [14, 'YELLOW', 'yellow block', '#fdd835', true, false],
  [15, 'LIME', 'lime block', '#7cd332', true, false],
  [16, 'BLUE', 'blue block', '#1e6fe0', true, false],
  [17, 'PURPLE', 'purple block', '#8e3fd0', true, false],
  [18, 'PINK', 'pink block', '#f48fb1', true, false],
  [19, 'WHITE', 'white block', '#f2f2f2', true, false],
  [20, 'BLACK', 'black block', '#26262b', true, false],
  [21, 'GOLD', 'gold block', '#f4c531', true, false],
  [22, 'GEM', 'gem block', '#35d6c9', true, false],
  [23, 'SNOW', 'snow', '#f7fbff', true, false],
  [24, 'LAMP', 'lamp', '#ffe08a', true, false]
];
export const NBLOCKS = BLOCKS.length;
export const BY_NAME = Object.fromEntries(BLOCKS.map(b => [b[1], b[0]]));
export const NAME_OF = id => (BLOCKS[id] ? BLOCKS[id][1] : 'AIR');
export const LABEL_OF = id => (BLOCKS[id] ? BLOCKS[id][2] : 'air');
export const isSolid = id => !!(BLOCKS[id] && BLOCKS[id][4]);
export const isClear = id => !BLOCKS[id] || BLOCKS[id][5];

// facing: 0 = north (−z), 1 = east (+x), 2 = south (+z), 3 = west (−x)
export const FACE = [[0, -1], [1, 0], [0, 1], [-1, 0]];
export const DIRS = ['FORWARD', 'BACK', 'LEFT', 'RIGHT', 'UP', 'DOWN'];
// a direction word relative to a facing → a step [dx, dy, dz]
export function dirStep(dir, facing) {
  const f = FACE[((facing % 4) + 4) % 4], r = FACE[(((facing + 1) % 4) + 4) % 4];
  switch (dir) {
    case 'FORWARD': return [f[0], 0, f[1]]; case 'BACK': return [-f[0], 0, -f[1]];
    case 'RIGHT': return [r[0], 0, r[1]]; case 'LEFT': return [-r[0], 0, -r[1]];
    case 'UP': return [0, 1, 0]; case 'DOWN': return [0, -1, 0];
  }
  return [0, 0, 0];
}
// (right, up, ahead) from an origin + facing → a world cell
export function rel(origin, facing, right, up, ahead) {
  const f = FACE[((facing % 4) + 4) % 4], r = FACE[(((facing + 1) % 4) + 4) % 4];
  return [Math.round(origin[0] + r[0] * right + f[0] * ahead), Math.round(origin[1] + up), Math.round(origin[2] + r[1] * right + f[1] * ahead)];
}
export const MAX_BUILD = 40000; // blocks one builder command may change

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function toB64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i], b = bytes[i + 1], c = bytes[i + 2], n = (a << 16) | ((b || 0) << 8) | (c || 0);
    s += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + (i + 1 < bytes.length ? B64[(n >> 6) & 63] : '=') + (i + 2 < bytes.length ? B64[n & 63] : '=');
  }
  return s;
}
function fromB64(s) {
  s = String(s).replace(/[^A-Za-z0-9+/]/g, ''); const out = [];
  for (let i = 0; i < s.length; i += 4) {
    const n = (B64.indexOf(s[i]) << 18) | (B64.indexOf(s[i + 1] || 'A') << 12) | (B64.indexOf(s[i + 2] || 'A') << 6) | B64.indexOf(s[i + 3] || 'A');
    out.push((n >> 16) & 255); if (i + 2 < s.length) out.push((n >> 8) & 255); if (i + 3 < s.length) out.push(n & 255);
  }
  return out;
}

export function createWorld() {
  const cells = new Uint8Array(W * H * D);
  const listeners = [];
  const idx = (x, y, z) => (y * D + z) * W + x;
  const inside = (x, y, z) => x >= 0 && y >= 0 && z >= 0 && x < W && y < H && z < D;
  const w = {
    W, H, D, cells,
    inside,
    get(x, y, z) { x = Math.floor(x); y = Math.floor(y); z = Math.floor(z); return inside(x, y, z) ? cells[idx(x, y, z)] : (y < 0 ? 3 : 0); },
    set(x, y, z, id) {
      x = Math.round(x); y = Math.round(y); z = Math.round(z);
      if (!inside(x, y, z) || id < 0 || id >= NBLOCKS) return false;
      if (y === 0 && id === 0) return false; // the bottom layer can't be dug away (you'd fall out of the world)
      const i = idx(x, y, z); if (cells[i] === id) return false;
      cells[i] = id; for (const f of listeners) f(x, y, z); return true;
    },
    onChange(f) { listeners.push(f); },
    // a box between two corners. mode: 'SOLID' fills it, 'HOLLOW' = walls, floor and roof with air inside,
    // 'OUTLINE' = walls, floor and roof, leaving what's inside alone. Returns how many cells it touched.
    fill(id, a, b, mode) {
      const x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), y0 = Math.min(a[1], b[1]), y1 = Math.max(a[1], b[1]), z0 = Math.min(a[2], b[2]), z1 = Math.max(a[2], b[2]);
      const n = (x1 - x0 + 1) * (y1 - y0 + 1) * (z1 - z0 + 1);
      if (n > MAX_BUILD) throw new Error('That is too big to build in one go (' + n + ' blocks). Try something smaller than ' + MAX_BUILD + '.');
      let c = 0;
      for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) {
        const edge = x === x0 || x === x1 || y === y0 || y === y1 || z === z0 || z === z1;
        if (mode === 'HOLLOW') { if (w.set(x, y, z, edge ? id : 0)) c++; }
        else if (mode === 'OUTLINE') { if (edge && w.set(x, y, z, id)) c++; }
        else if (w.set(x, y, z, id)) c++;
      }
      return c;
    },
    line(id, a, b) {
      const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), Math.abs(b[2] - a[2]));
      if (n > MAX_BUILD) throw new Error('That line is too long.');
      let c = 0;
      for (let i = 0; i <= n; i++) { const t = n ? i / n : 0; if (w.set(Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t), id)) c++; }
      return c;
    },
    ball(id, r, c0, mode) {
      r = Math.max(0, Math.min(30, Math.round(r))); let c = 0;
      for (let y = -r; y <= r; y++) for (let z = -r; z <= r; z++) for (let x = -r; x <= r; x++) {
        const d = Math.sqrt(x * x + y * y + z * z);
        if (d > r + 0.5) continue;
        if (mode === 'HOLLOW' && d < r - 0.5) continue;
        if (w.set(c0[0] + x, c0[1] + y, c0[2] + z, id)) c++;
      }
      return c;
    },
    groundAt(x, z) { for (let y = H - 1; y >= 0; y--) if (isSolid(w.get(x, y, z))) return y + 1; return 1; },
    // run-length encoded (count up to 255, id) pairs, base64 — a flat world saves in a few hundred characters
    save() {
      const out = []; let prev = cells[0], run = 0;
      for (let i = 0; i < cells.length; i++) {
        const v = cells[i];
        if (v === prev && run < 255) run++; else { out.push(run, prev); prev = v; run = 1; }
      }
      out.push(run, prev);
      return toB64(out);
    },
    load(str) {
      const bytes = fromB64(str); if (!bytes.length) return false;
      const tmp = new Uint8Array(cells.length); let p = 0;
      for (let i = 0; i + 1 < bytes.length && p < tmp.length; i += 2) {
        const n = bytes[i], v = bytes[i + 1] < NBLOCKS ? bytes[i + 1] : 0;
        for (let k = 0; k < n && p < tmp.length; k++) tmp[p++] = v;
      }
      if (p !== tmp.length) return false; // a damaged save: keep what we have
      cells.set(tmp); for (const f of listeners) f(-1, -1, -1); return true;
    },
    reset() { starter(w); for (const f of listeners) f(-1, -1, -1); }
  };
  starter(w);
  return w;
}

// the starter world: three layers of dirt under grass, stone below, a pond, some sand, trees and flowers of colour
function starter(w) {
  const c = w.cells; c.fill(0);
  const put = (x, y, z, id) => { if (w.inside(x, y, z)) c[(y * D + z) * W + x] = id; };
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
    for (let y = 0; y < GROUND - 3; y++) put(x, y, z, 3);
    for (let y = GROUND - 3; y < GROUND; y++) put(x, y, z, 2);
    put(x, GROUND, z, 1);
  }
  // a pond to the west, with a sandy edge
  for (let z = 24; z < 36; z++) for (let x = 8; x < 20; x++) {
    const d = Math.hypot((x - 13.5) / 6, (z - 29.5) / 5.5);
    if (d < 1) { put(x, GROUND, z, 9); if (d < 0.6) put(x, GROUND - 1, z, 9); }
    else if (d < 1.3) put(x, GROUND, z, 8);
  }
  const tree = (x, z, h) => {
    for (let y = 1; y <= h; y++) put(x, GROUND + y, z, 6);
    for (let y = h - 1; y <= h + 1; y++) for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + Math.abs(dz) > (y === h + 1 ? 1 : 3)) continue;
      if (dx === 0 && dz === 0 && y <= h) continue;
      if (c[((GROUND + y) * D + z + dz) * W + x + dx] === 0) put(x + dx, GROUND + y, z + dz, 7);
    }
    put(x, GROUND + h + 2, z, 7);
  };
  tree(10, 12, 4); tree(50, 14, 5); tree(52, 46, 4); tree(14, 50, 5); tree(44, 28, 4);
}
