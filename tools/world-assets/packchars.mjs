// Kenney Mini Characters (CC0) -> self-contained GLBs whose parts can be recoloured one by one.
// Every (part, swatch) the character uses is copied into its own 32x128 slot in the unused top half of the
// colour map and the UVs moved there, so the app can repaint one part by repainting its slots.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { readGLB, writeGLB, acc, addView } from './glb.mjs';
const [src, out, ...names] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const raw = png => execFileSync('convert', [png, '-depth', '8', 'rgba:-'], { maxBuffer: 1 << 24 });
const toPng = rgba => execFileSync('convert', ['-size', '512x512', '-depth', '8', 'rgba:-', '-define', 'png:compression-level=9', 'png:-'], { input: rgba, maxBuffer: 1 << 24 });
const CMAP = raw(src + '/Textures/colormap.png');
const cell = (u, v) => [Math.min(15, Math.floor(u * 16)), Math.min(15, Math.floor(v * 16))];
const band = cv => (cv >= 12 ? 1 : 0);
const SKIN = new Set(['0,0', '5,1', '6,1', '7,1']); // column pairs (col>>1, band) that hold skin tones
const table = {}; const DROP = { Liz1: [7, 11] }; const K = 2.8 / 0.75;
for (const [id, file] of names.map(x => x.split('='))) {
  const g = readGLB(src + '/' + file + '.glb');
  const prims = []; g.json.meshes.forEach(m => m.primitives.forEach(p => prims.push({ head: /head/.test(m.name), p })));
  const read = (p, name) => { const a = acc(g, p.attributes[name]); const arr = []; for (let k = 0; k < a.count; k++) { const r = []; for (let c = 0; c < a.n; c++) r.push(a.get(k, c)); arr.push(r); } return arr; };
  // the head's skin = the swatch of the head block itself: the full-width piece that reaches lowest (hair starts higher up;
  // beards are narrower)
  let headSkin = null;
  for (const { head, p } of prims) if (head) {
    const P = read(p, 'POSITION'), UV = read(p, 'TEXCOORD_0'), c = {};
    P.forEach((q, k) => { const [cu, cv] = cell(...UV[k]); const key = (cu >> 1) + ',' + band(cv); const e = c[key] || (c[key] = { lo: 9, x0: 9, x1: -9 }); e.lo = Math.min(e.lo, q[1]); e.x0 = Math.min(e.x0, q[0]); e.x1 = Math.max(e.x1, q[0]); });
    headSkin = Object.entries(c).filter(([, e]) => e.x1 - e.x0 >= 0.4).sort((a, b) => a[1].lo - b[1].lo)[0][0];
  }
  const slots = new Map(), parts = {};
  const slotOf = (part, cu, cb) => { const k = part + '|' + cu + '|' + cb; if (!slots.has(k)) { const s = slots.size; slots.set(k, { s, cu, cb }); (parts[part] = parts[part] || []).push(s); } return slots.get(k).s; };
  for (const { head, p } of prims) {
    const attrs = Object.fromEntries(Object.keys(p.attributes).map(n => [n, read(p, n)]));
    const ia = acc(g, p.indices), idx = []; for (let t = 0; t < ia.count; t++) idx.push(ia.get(t, 0));
    const P = attrs.POSITION, UV = attrs.TEXCOORD_0, J = attrs.JOINTS_0;
    // eyes and mouth: small separate dark pieces on the head, or dark bits low in the middle of the face
    const eyes = new Set(), drop = new Set();
    {
      const n = P.length, par = [...Array(n).keys()], f = x => (par[x] === x ? x : (par[x] = f(par[x])));
      for (let t = 0; t < idx.length; t += 3) { par[f(idx[t + 1])] = f(idx[t]); par[f(idx[t + 2])] = f(idx[t]); }
      const byPos = new Map(); for (let k = 0; k < n; k++) { const kk = P[k].map(x => x.toFixed(4)).join() + '|' + cell(...UV[k]).join(); if (byPos.has(kk)) par[f(k)] = f(byPos.get(kk)); else byPos.set(kk, k); }
      const comp = new Map(); for (let k = 0; k < n; k++) { const r = f(k); if (!comp.has(r)) comp.set(r, []); comp.get(r).push(k); }
      for (const ks of comp.values()) {
        const [cu, cv] = cell(...UV[ks[0]]); let lo = [9, 9, 9], hi = [-9, -9, -9];
        for (const k of ks) for (let c = 0; c < 3; c++) { lo[c] = Math.min(lo[c], P[k][c]); hi[c] = Math.max(hi[c], P[k][c]); }
        if (head && Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) < 0.06 && band(cv) === 1 && cu <= 5) ks.forEach(k => eyes.add(k));
        // things held in the hands (a toy blaster) are left out
        const cols = new Set(ks.map(k => cell(...UV[k])[0])), js = new Set(ks.map(k => J[k][0]));
        if (!head && DROP[id] && [...js].every(j => j === 4 || j === 5) && [...cols].every(c => DROP[id].includes(c))) ks.forEach(k => drop.add(k));
      }
    }
    // a part for every triangle
    const tri = [];
    { const keep = []; for (let t = 0; t < idx.length; t += 3) if (!drop.has(idx[t])) keep.push(idx[t], idx[t + 1], idx[t + 2]); idx.length = 0; idx.push(...keep); }
    for (let t = 0; t < idx.length; t += 3) {
      const vs = [idx[t], idx[t + 1], idx[t + 2]], [cu, cv] = cell(...UV[vs[0]]);
      const skin = (cu >> 1) + ',' + band(cv) === headSkin, cy = vs.reduce((a, k) => a + P[k][1], 0) / 3;
      let part;
      if (head) {
        const face = !skin && cu <= 5 && band(cv) === 1 && vs.every(k => Math.abs(P[k][0]) < 0.06 && P[k][1] < 0.47 && P[k][2] > 0.12);
        part = vs.every(k => eyes.has(k)) || face ? 'eyes' : skin ? 'skin' : 'hair';
      } else if (skin) part = 'skin';
      else { const js = vs.map(k => J[k][0]); const leg = js.filter(j => j === 1 || j === 2).length >= 2; part = leg ? (cy < 0.05 ? 'shoes' : 'shorts') : 'tshirt'; }
      tri.push(slotOf(part, cu, band(cv)));
    }
    // copy a corner when two triangles want it in different slots
    const vslot = new Array(P.length).fill(-1), newIdx = [];
    const extra = Object.fromEntries(Object.keys(attrs).map(n => [n, []]));
    for (let t = 0; t < tri.length; t++) for (let c = 0; c < 3; c++) {
      let k = idx[t * 3 + c];
      if (vslot[k] === -1) vslot[k] = tri[t];
      else if (vslot[k] !== tri[t]) { const nk = P.length + extra.POSITION.length; for (const n in attrs) extra[n].push(attrs[n][k]); vslot.push(tri[t]); k = nk; }
      newIdx.push(k);
    }
    for (const n in attrs) attrs[n] = attrs[n].concat(extra[n]);
    // move each corner's UV into its slot (keeping where it sat inside the swatch, so the shading stays)
    const sl = [...slots.values()];
    attrs.TEXCOORD_0 = attrs.TEXCOORD_0.map(([u, v], k) => {
      const s = sl.find(x => x.s === vslot[k]); if (!s) return [u, v];
      const fu = u * 16 - s.cu, fv = v * 16 - (s.cb ? 12 : 8);
      return [((s.s % 16) + fu) / 16, ((s.s >> 4) * 4 + fv) / 16];
    });
    // write the primitive again (plain, non-interleaved)
    for (const n in attrs) {
      const a = g.json.accessors[p.attributes[n]], comps = attrs[n][0].length, ct = a.componentType, sz = ct === 5126 ? 4 : ct === 5123 ? 2 : 1;
      const buf = Buffer.alloc(attrs[n].length * comps * sz);
      attrs[n].forEach((r, k) => r.forEach((x, c) => { const o = (k * comps + c) * sz; if (sz === 4) buf.writeFloatLE(x, o); else if (sz === 2) buf.writeUInt16LE(x, o); else buf.writeUInt8(x, o); }));
      const na = { ...a, bufferView: addView(g, buf), byteOffset: 0, count: attrs[n].length };
      if (n === 'POSITION') { na.min = [0, 1, 2].map(c => Math.min(...attrs[n].map(r => r[c]))); na.max = [0, 1, 2].map(c => Math.max(...attrs[n].map(r => r[c]))); }
      else { delete na.min; delete na.max; }
      g.json.accessors.push(na); p.attributes[n] = g.json.accessors.length - 1;
    }
    const ib = Buffer.alloc(newIdx.length * 2); newIdx.forEach((x, i) => ib.writeUInt16LE(x, i * 2));
    if (Math.max(...newIdx) > 65535) throw new Error('too many vertices');
    g.json.accessors.push({ bufferView: addView(g, ib), componentType: 5123, count: newIdx.length, type: 'SCALAR' }); p.indices = g.json.accessors.length - 1;
  }
  if (slots.size > 32) throw new Error(id + ': ' + slots.size + ' slots');
  // the colour map with every slot filled from its swatch
  const img = Buffer.from(CMAP);
  for (const { s, cu, cb } of slots.values()) {
    const dx = (s % 16) * 32, dy = (s >> 4) * 128, sx = cu * 32, sy = 256 + cb * 128;
    for (let y = 0; y < 128; y++) img.copy(img, ((dy + y) * 512 + dx) * 4, ((sy + y) * 512 + sx) * 4, ((sy + y) * 512 + sx + 32) * 4);
  }
  const pngv = addView(g, toPng(img));
  g.json.images = [{ bufferView: pngv, mimeType: 'image/png', name: 'colormap' }];
  // the old attribute data is left unused in the buffer: pack it out by rebuilding with only used views
  compact(g);
  // stand them as tall as the old characters (2.8 m) under one scaled node
  { const sc = g.json.scenes[g.json.scene || 0]; g.json.nodes.push({ name: id, scale: [K, K, K], children: sc.nodes }); sc.nodes = [g.json.nodes.length - 1]; }
  writeFileSync(out + '/' + id + '.glb', writeGLB(g));
  table[id] = parts;
  console.log(id, file, 'slots', slots.size, JSON.stringify(parts));
}
writeFileSync(out + '/slots.json', JSON.stringify(table));
function compact(g) {
  const used = new Set(); g.json.accessors.forEach(a => { if (a.bufferView != null) used.add(a.bufferView); }); (g.json.images || []).forEach(i => i.bufferView != null && used.add(i.bufferView));
  // drop unused accessors too
  const keepA = new Set(); const mark = i => i != null && keepA.add(i);
  g.json.meshes.forEach(m => m.primitives.forEach(p => { Object.values(p.attributes).forEach(mark); mark(p.indices); (p.targets || []).forEach(t => Object.values(t).forEach(mark)); }));
  (g.json.skins || []).forEach(s => mark(s.inverseBindMatrices));
  (g.json.animations || []).forEach(a => a.samplers.forEach(s => { mark(s.input); mark(s.output); }));
  const amap = new Map(), accs = []; g.json.accessors.forEach((a, i) => { if (keepA.has(i)) { amap.set(i, accs.length); accs.push(a); } });
  const rA = i => amap.get(i);
  g.json.meshes.forEach(m => m.primitives.forEach(p => { for (const k in p.attributes) p.attributes[k] = rA(p.attributes[k]); if (p.indices != null) p.indices = rA(p.indices); }));
  (g.json.skins || []).forEach(s => { if (s.inverseBindMatrices != null) s.inverseBindMatrices = rA(s.inverseBindMatrices); });
  (g.json.animations || []).forEach(a => a.samplers.forEach(s => { s.input = rA(s.input); s.output = rA(s.output); }));
  g.json.accessors = accs;
  const views = new Set(accs.map(a => a.bufferView)); (g.json.images || []).forEach(i => views.add(i.bufferView));
  let bin = Buffer.alloc(0); const vmap = new Map(), nv = [];
  g.json.bufferViews.forEach((v, i) => { if (!views.has(i)) return; const pad = (4 - bin.length % 4) % 4; bin = Buffer.concat([bin, Buffer.alloc(pad)]); const off = bin.length; bin = Buffer.concat([bin, g.bin.slice(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength)]); vmap.set(i, nv.length); nv.push({ ...v, byteOffset: off }); });
  accs.forEach(a => a.bufferView = vmap.get(a.bufferView)); (g.json.images || []).forEach(i => i.bufferView = vmap.get(i.bufferView));
  g.json.bufferViews = nv; g.bin = bin; g.json.buffers = [{ byteLength: bin.length }];
}
