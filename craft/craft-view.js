/* CodeJump · Build Lab — draws the block world with Three.js (the bundle the Critter Lab ships).
 *   const v = createView(THREE, canvas, world)
 *   v.render(cam, helper, opts) every frame · v.dirty(x,y,z) / v.dirtyAll() after edits · v.setTime('DAY'|'SUNSET'|'NIGHT')
 *   v.highlight(hit|null) · v.resize() · v.dispose() · v.screenRay(px, py) → {o, d} for picking
 * Textures are pixel art drawn here in code (our own), 16×16 per face, in one atlas. Lighting is baked into vertex
 * colours (face brightness + corner shading), so the world draws with cheap unlit materials.
 */
import { W, H, D, BLOCKS, NBLOCKS } from './craft-world.js';

const CS = 16; // chunk size
const TILE = 16, ATLAS_COLS = 16;
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
const shade = (c, k) => c.map(v => Math.max(0, Math.min(255, Math.round(v * k))));

// paints one 16×16 tile; px(x,y,[r,g,b,a])
function paintTile(id, face, px, R) {
  const base = hexRgb(BLOCKS[id][3]);
  const noise = (c, amt) => shade(c, 1 + (R() - 0.5) * amt);
  const fillN = (c, amt) => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(x, y, noise(c, amt)); };
  switch (id) {
    case 1: // grass
      if (face === 0) { fillN([98, 177, 58], 0.28); for (let i = 0; i < 18; i++) px(R() * 16 | 0, R() * 16 | 0, [130, 205, 80]); }
      else if (face === 2) { fillN([138, 90, 51], 0.3); }
      else { fillN([138, 90, 51], 0.3); for (let x = 0; x < 16; x++) { const h = 3 + (R() * 2.6 | 0); for (let y = 0; y < h; y++) px(x, y, noise([98, 177, 58], 0.25)); } }
      return;
    case 2: fillN(base, 0.32); for (let i = 0; i < 10; i++) px(R() * 16 | 0, R() * 16 | 0, shade(base, 0.7)); return;
    case 3: fillN(base, 0.18); for (let i = 0; i < 4; i++) { let x = R() * 16 | 0, y = R() * 16 | 0; for (let k = 0; k < 5; k++) { px(x & 15, y & 15, shade(base, 0.78)); x += R() < 0.5 ? 1 : 0; y += R() < 0.5 ? 1 : -1; } } return;
    case 4: { fillN([90, 92, 98], 0.1); for (let cy = 0; cy < 4; cy++) for (let cx = 0; cx < 4; cx++) { const c = noise(base, 0.35); const ox = cx * 4 + (cy & 1) * 2; for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) px((ox + x) & 15, cy * 4 + y, shade(c, y === 0 ? 1.12 : 1)); } return; }
    case 5: { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const row = y >> 2, edge = (y & 3) === 3, seam = ((x + row * 7) & 15) === 0; px(x, y, edge || seam ? shade(base, 0.68) : noise(base, 0.12)); } px(2, 1, [80, 55, 30]); px(13, 9, [80, 55, 30]); return; }
    case 6: if (face !== 1) { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const r = Math.hypot(x - 7.5, y - 7.5); px(x, y, r > 7 ? shade(base, 0.8) : (Math.round(r) % 3 === 0 ? [150, 110, 65] : [190, 145, 90])); } }
      else for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(x, y, (x % 4 === 0 || R() < 0.08) ? shade(base, 0.7) : noise(base, 0.18));
      return;
    case 7: for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { if (R() < 0.14) px(x, y, [0, 0, 0, 0]); else px(x, y, noise(base, 0.45)); } return;
    case 8: fillN(base, 0.12); for (let i = 0; i < 12; i++) px(R() * 16 | 0, R() * 16 | 0, shade(base, 0.85)); return;
    case 9: for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const w = Math.sin((x + y * 0.5) * 0.8) > 0.85; px(x, y, w ? [150, 200, 250, 200] : [59, 132, 224, 170]); } return;
    case 10: for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const edge = x === 0 || y === 0 || x === 15 || y === 15, streak = (x - y === 3 || x - y === 4) && x > 4 && x < 10; px(x, y, edge ? [220, 245, 255, 255] : streak ? [255, 255, 255, 170] : [200, 238, 250, 40]); } return;
    case 11: for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const row = y >> 2, mortar = (y & 3) === 3 || ((x + (row & 1) * 4) & 7) === 7; px(x, y, mortar ? [205, 195, 180] : noise(base, 0.2)); } return;
    case 21: fillN(base, 0.15); for (let i = 0; i < 6; i++) { const x = R() * 14 | 0, y = R() * 14 | 0; px(x, y, [255, 250, 200]); px(x + 1, y, [255, 235, 140]); } for (let x = 0; x < 16; x++) { px(x, 0, shade(base, 1.15)); px(x, 15, shade(base, 0.8)); } return;
    case 22: fillN(base, 0.15); for (let i = 0; i < 5; i++) { const x = 2 + (R() * 12 | 0), y = 2 + (R() * 12 | 0); px(x, y, [255, 255, 255]); px(x + 1, y, [190, 255, 250]); px(x, y + 1, [190, 255, 250]); } return;
    case 23: fillN(base, 0.06); for (let i = 0; i < 8; i++) px(R() * 16 | 0, R() * 16 | 0, [220, 235, 250]); return;
    case 24: for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const frame = x < 2 || y < 2 || x > 13 || y > 13 || x === 7 || x === 8 || y === 7 || y === 8; px(x, y, frame ? [120, 85, 45] : noise([255, 224, 138], 0.1)); } return;
    default: // the coloured blocks: a soft speckle and a darker edge
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const edge = x === 0 || y === 0 || x === 15 || y === 15; px(x, y, edge ? shade(base, 0.82) : noise(base, 0.1)); }
  }
}
export function makeAtlas(doc) {
  const cv = doc.createElement('canvas'); cv.width = ATLAS_COLS * TILE; cv.height = Math.ceil(NBLOCKS * 3 / ATLAS_COLS) * TILE;
  const g = cv.getContext('2d'), img = g.createImageData(cv.width, cv.height);
  for (let id = 1; id < NBLOCKS; id++) for (let face = 0; face < 3; face++) {
    const t = id * 3 + face, ox = (t % ATLAS_COLS) * TILE, oy = Math.floor(t / ATLAS_COLS) * TILE, R = rng(id * 97 + face * 13 + 5);
    paintTile(id, face, (x, y, c) => { const i = ((oy + y) * cv.width + ox + x) * 4; img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = c.length > 3 ? c[3] : 255; }, R);
  }
  g.putImageData(img, 0, 0);
  return cv;
}
// a small picture of one block (for the hotbar and the block picker)
export function blockIcon(doc, atlas, id, size = 40) {
  const cv = doc.createElement('canvas'); cv.width = cv.height = size; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  if (!id) return cv;
  const tile = f => { const t = id * 3 + f; return [(t % ATLAS_COLS) * TILE, Math.floor(t / ATLAS_COLS) * TILE]; };
  const s = size / 2, top = tile(0), side = tile(1);
  // a little isometric cube: top, left and right faces
  g.save(); g.setTransform(s / 16, s / 32, -s / 16, s / 32, s, size * 0.06); g.drawImage(atlas, top[0], top[1], 16, 16, 0, 0, 16, 16); g.restore();
  g.save(); g.setTransform(s / 16, s / 32, 0, s / 16 * 1.12, 0, size * 0.06 + s / 2); g.drawImage(atlas, side[0], side[1], 16, 16, 0, 0, 16, 16); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, 16, 16); g.restore();
  g.save(); g.setTransform(s / 16, -s / 32, 0, s / 16 * 1.12, s, size * 0.06 + s); g.drawImage(atlas, side[0], side[1], 16, 16, 0, 0, 16, 16); g.fillStyle = 'rgba(0,0,0,.34)'; g.fillRect(0, 0, 16, 16); g.restore();
  return cv;
}

// faces: dir, normal, 4 corners (unit cube), brightness
const FACES = [
  { n: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], k: 1.0, t: 0 },
  { n: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], k: 0.55, t: 2 },
  { n: [1, 0, 0], c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], k: 0.72, t: 1 },
  { n: [-1, 0, 0], c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], k: 0.72, t: 1 },
  { n: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], k: 0.86, t: 1 },
  { n: [0, 0, -1], c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], k: 0.86, t: 1 }
];
for (const f of FACES) f.ax = [0, 1, 2].filter(i => !f.n[i]);
const UV = [[0, 1], [1, 1], [1, 0], [0, 0]];
const kindOf = id => (id === 9 || id === 10 ? 2 : id === 7 ? 1 : id === 24 ? 3 : 0); // 0 solid, 1 cut-out, 2 see-through, 3 glowing

export function createView(THREE, canvas, world) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, 1, 0.08, 220);
  const sky = new THREE.Color('#8fd3ff'); scene.background = sky; scene.fog = new THREE.Fog(sky, 40, 110);
  const atlas = makeAtlas(document);
  const tex = new THREE.CanvasTexture(atlas); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false;
  if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
  const mats = [
    new THREE.MeshBasicMaterial({ map: tex, vertexColors: true }),
    new THREE.MeshBasicMaterial({ map: tex, vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ map: tex, vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ map: tex, vertexColors: true })
  ];
  const tint = new THREE.Color(1, 1, 1);
  const chunks = new Map(); const dirtySet = new Set();
  const NX = Math.ceil(W / CS), NY = Math.ceil(H / CS), NZ = Math.ceil(D / CS);
  for (let cy = 0; cy < NY; cy++) for (let cz = 0; cz < NZ; cz++) for (let cx = 0; cx < NX; cx++) dirtySet.add(cx + ',' + cy + ',' + cz);

  const solidish = id => id && kindOf(id) !== 2 && id !== 7;
  function buildChunk(cx, cy, cz) {
    const key = cx + ',' + cy + ',' + cz, arrs = [0, 1, 2, 3].map(() => ({ p: [], u: [], c: [], i: [] }));
    for (let y = cy * CS; y < Math.min(H, (cy + 1) * CS); y++) for (let z = cz * CS; z < Math.min(D, (cz + 1) * CS); z++) for (let x = cx * CS; x < Math.min(W, (cx + 1) * CS); x++) {
      const id = world.get(x, y, z); if (!id) continue;
      const kind = kindOf(id), A = arrs[kind];
      for (const f of FACES) {
        const nid = world.get(x + f.n[0], y + f.n[1], z + f.n[2]);
        if (nid === id && kind !== 0) continue; // glass next to glass, water next to water: no face between
        if (nid && solidish(nid) && kindOf(nid) !== 1) continue;
        if (y + f.n[1] < 0) continue;
        const t = id * 3 + f.t, u0 = (t % ATLAS_COLS) / ATLAS_COLS, v0 = Math.floor(t / ATLAS_COLS) * TILE / atlas.height, du = 1 / ATLAS_COLS, dv = TILE / atlas.height;
        const base = A.p.length / 3;
        for (let k = 0; k < 4; k++) {
          const c = f.c[k];
          let py = y + c[1]; if (id === 9 && c[1] === 1 && world.get(x, y + 1, z) !== 9) py -= 0.12;
          A.p.push(x + c[0], py, z + c[2]);
          A.u.push(u0 + UV[k][0] * du * 0.999 + du * 0.0005, 1 - (v0 + UV[k][1] * dv * 0.999 + dv * 0.0005));
          // corner shading: count solid blocks round this corner on the outside of the face
          let ao = 0;
          if (kind !== 3) { // corner shading: the blocks beside and across this corner, just outside the face
            const ax = f.ax, bx = x + f.n[0], by = y + f.n[1], bz = z + f.n[2], o1 = [0, 0, 0], o2 = [0, 0, 0];
            o1[ax[0]] = c[ax[0]] ? 1 : -1; o2[ax[1]] = c[ax[1]] ? 1 : -1;
            const s1 = solidish(world.get(bx + o1[0], by + o1[1], bz + o1[2])), s2 = solidish(world.get(bx + o2[0], by + o2[1], bz + o2[2]));
            const cn = solidish(world.get(bx + o1[0] + o2[0], by + o1[1] + o2[1], bz + o1[2] + o2[2]));
            ao = s1 && s2 ? 3 : (s1 ? 1 : 0) + (s2 ? 1 : 0) + (cn ? 1 : 0);
          }
          const b = kind === 3 ? 1 : f.k * (1 - ao * 0.13);
          A.c.push(b, b, b);
        }
        A.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
      }
    }
    const old = chunks.get(key); if (old) for (const m of old) { scene.remove(m); m.geometry.dispose(); }
    const meshes = [];
    arrs.forEach((A, k) => {
      if (!A.i.length) return;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(A.p, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(A.u, 2));
      g.setAttribute('color', new THREE.Float32BufferAttribute(A.c, 3)); g.setIndex(A.i); g.computeBoundingSphere();
      const m = new THREE.Mesh(g, mats[k]); if (k === 2) m.renderOrder = 2; scene.add(m); meshes.push(m);
    });
    chunks.set(key, meshes);
  }
  function dirty(x, y, z) {
    if (x < 0) { dirtyAll(); return; }
    const mark = (a, b, c) => { if (a < 0 || b < 0 || c < 0 || a >= W || b >= H || c >= D) return; dirtySet.add(Math.floor(a / CS) + ',' + Math.floor(b / CS) + ',' + Math.floor(c / CS)); };
    mark(x, y, z); mark(x - 1, y, z); mark(x + 1, y, z); mark(x, y - 1, z); mark(x, y + 1, z); mark(x, y, z - 1); mark(x, y, z + 1);
  }
  function dirtyAll() { for (let cy = 0; cy < NY; cy++) for (let cz = 0; cz < NZ; cz++) for (let cx = 0; cx < NX; cx++) dirtySet.add(cx + ',' + cy + ',' + cz); }

  // ── the robot helper (our own design): a rounded hovering cube with a screen face, antenna and side fins ──
  const helperG = new THREE.Group();
  const lit = c => new THREE.MeshLambertMaterial({ color: c });
  const hb = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.56, 0.58), lit(0xeef3f7)); helperG.add(hb);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.12, 0.6), lit(0x20b2aa)); band.position.y = -0.2; helperG.add(band);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.3, 0.02), new THREE.MeshBasicMaterial({ color: 0x1d2433 })); screen.position.set(0, 0.04, -0.3); helperG.add(screen);
  const eyeM = new THREE.MeshBasicMaterial({ color: 0x6ff7ff });
  for (const sx of [-0.1, 0.1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.02), eyeM); e.position.set(sx, 0.06, -0.315); helperG.add(e); }
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.02), eyeM); mouth.position.set(0, -0.04, -0.315); helperG.add(mouth);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18), lit(0x5d636e)); ant.position.y = 0.36; helperG.add(ant);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff7a2f })); tip.position.y = 0.47; helperG.add(tip);
  for (const sx of [-1, 1]) { const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.3), lit(0x20b2aa)); fin.position.set(sx * 0.35, 0, 0); helperG.add(fin); }
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), new THREE.MeshBasicMaterial({ color: 0x6ff7ff, transparent: true, opacity: 0.55 })); glow.rotation.x = Math.PI / 2; glow.position.y = -0.29; helperG.add(glow);
  scene.add(helperG);
  const shadowM = new THREE.Mesh(new THREE.CircleGeometry(0.32, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25, depthWrite: false }));
  shadowM.rotation.x = -Math.PI / 2; scene.add(shadowM);
  // the player, seen from the helper camera: a simple rounded figure in CodeJump gold
  const meG = new THREE.Group();
  const meBody = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 1.05, 14), lit(0xae853e)); meBody.position.y = 0.55; meG.add(meBody);
  const meHead = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), lit(0xf2c9a0)); meHead.position.y = 1.35; meG.add(meHead);
  const meCap = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), lit(0x2b2240)); meCap.position.y = 1.38; meG.add(meCap);
  scene.add(meG);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x667788, 1.1)); const sun = new THREE.DirectionalLight(0xffffff, 0.9); sun.position.set(0.4, 1, 0.3); scene.add(sun);
  // the outline round the block you point at
  const hl = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004, 1.004, 1.004)), new THREE.LineBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.7 }));
  hl.visible = false; scene.add(hl);
  // sun / moon
  const orb = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ color: 0xfff1a8, fog: false })); scene.add(orb);
  let timeName = 'DAY';
  const TIMES = { DAY: { sky: '#8fd3ff', t: 1, orb: '#fff1a8', oy: 70 }, SUNSET: { sky: '#ffad7a', t: 0.82, orb: '#ff8a3c', oy: 22 }, NIGHT: { sky: '#0e1636', t: 0.38, orb: '#e8eefc', oy: 60 } };
  function setTime(n) { timeName = TIMES[n] ? n : 'DAY'; const T = TIMES[timeName]; sky.set(T.sky); scene.fog.color.set(T.sky); tint.setRGB(T.t, T.t, T.t * (timeName === 'NIGHT' ? 1.15 : 1)); for (const k of [0, 1, 2]) mats[k].color.copy(tint); orb.material.color.set(T.orb); }
  setTime('DAY');

  let builtFirst = false;
  function render(cam, helper, opts) {
    opts = opts || {};
    // rebuild a few changed chunks each frame (all of them the first time)
    let budget = builtFirst ? 6 : 1e9;
    for (const key of dirtySet) { if (budget-- <= 0) break; dirtySet.delete(key); const [a, b, c] = key.split(',').map(Number); buildChunk(a, b, c); }
    builtFirst = true;
    // helper: glide between cells, turn smoothly, bob
    const t = helper.t == null ? 1 : helper.t, fr = helper.from || helper, e = t * t * (3 - 2 * t);
    const hx = fr.x + (helper.x - fr.x) * e + 0.5, hy = fr.y + (helper.y - fr.y) * e + 0.36 + Math.sin(performance.now() / 380) * 0.05, hz = fr.z + (helper.z - fr.z) * e + 0.5;
    let a0 = -(fr.f || 0) * Math.PI / 2, a1 = -(helper.f || 0) * Math.PI / 2; while (a1 - a0 > Math.PI) a1 -= Math.PI * 2; while (a0 - a1 > Math.PI) a1 += Math.PI * 2;
    helperG.position.set(hx, hy, hz); helperG.rotation.y = a0 + (a1 - a0) * e;
    let gy = Math.floor(hy); while (gy > 0 && !world.get(Math.floor(hx), gy - 1, Math.floor(hz))) gy--; shadowM.position.set(hx, gy + 0.02, hz); shadowM.visible = hy - gy < 6;
    tip.material.color.set(Math.sin(performance.now() / 260) > 0 ? 0xff7a2f : 0xffc23c);
    if (opts.me) { meG.visible = !!opts.showMe; meG.position.set(opts.me.x, opts.me.y, opts.me.z); meG.rotation.y = opts.me.yaw; }
    camera.position.set(cam.x, cam.y, cam.z);
    camera.lookAt(cam.x + cam.dx, cam.y + cam.dy, cam.z + cam.dz);
    orb.position.set(cam.x + 30, TIMES[timeName].oy, cam.z - 80); orb.lookAt(cam.x, cam.y, cam.z);
    renderer.render(scene, camera);
  }
  function highlight(h) { if (!h) { hl.visible = false; return; } hl.visible = true; hl.position.set(h.x + 0.5, h.y + 0.5, h.z + 0.5); }
  function resize() { const w = canvas.clientWidth || 300, h = canvas.clientHeight || 200; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function screenRay(px, py) {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    const v = new THREE.Vector3((px / w) * 2 - 1, -(py / h) * 2 + 1, 0.5).unproject(camera).sub(camera.position).normalize();
    return { o: [camera.position.x, camera.position.y, camera.position.z], d: [v.x, v.y, v.z] };
  }
  world.onChange((x, y, z) => dirty(x, y, z));
  return { render, dirty, dirtyAll, setTime, time: () => timeName, highlight, resize, screenRay, atlas, renderer, camera,
    dispose() { renderer.dispose(); tex.dispose(); for (const ms of chunks.values()) for (const m of ms) m.geometry.dispose(); }, _chunks: chunks };
}
