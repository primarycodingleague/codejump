// Print Lab (projectType 'print3d'): the shapes, holes, groups, checks and print files in Node (Manifold +
// opentype.js straight from print/vendor), then the app — chooser, dragging shapes on, moving, sizing, lifting and
// turning with the handles, grouping a hole, Check & print, downloads, undo, saving and reopening.
import { ok, done, serve, browser, openApp, ROOT, sleep } from './lib.mjs';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';

const PM = await import(pathToFileURL(ROOT + '/print/print-model.js').href);
const { default: Module } = await import(pathToFileURL(ROOT + '/print/vendor/manifold.js').href);
const ot = await import(pathToFileURL(ROOT + '/print/vendor/opentype-2.0.0.min.mjs').href);
const M = await Module(); M.setup();
const fb = readFileSync(ROOT + '/print/vendor/Outfit-Bold.ttf');
const font = ot.parse(fb.buffer.slice(fb.byteOffset, fb.byteOffset + fb.length));
const md = PM.createModel(M, { font });

// every edge of a closed mesh is used by exactly two triangles, once each way
function closed(mesh) {
  const E = new Map(), I = mesh.indices;
  for (let k = 0; k < I.length; k += 3) for (let j = 0; j < 3; j++) { const a = I[k + j], b = I[k + (j + 1) % 3], key = a + ',' + b; E.set(key, (E.get(key) || 0) + 1); }
  for (const [key, n] of E) { const [a, b] = key.split(','); if (n !== 1 || E.get(b + ',' + a) !== 1) return false; }
  return I.length > 0;
}
const near = (a, b, e = 0.05) => Math.abs(a - b) <= e;

// ---- every shape
{
  const bad = [];
  for (const [kind, , w, d, h] of PM.KINDS) {
    const o = PM.makeObj(kind, { text: 'Hi 8' }), b = md.bounds(o), m = md.whole(o);
    if (!m || m.status() !== 'NoError' || m.volume() <= 0 || !closed(md.meshOf(m))) bad.push(kind + ' not closed');
    if (!b || !near(b.max[0] - b.min[0], w) || !near(b.max[1] - b.min[1], d) || !near(b.max[2] - b.min[2], h) || !near(b.min[2], 0)) bad.push(kind + ' wrong size');
    md.free(m);
  }
  ok(!bad.length, 'all ' + PM.KINDS.length + ' shapes are closed solids that fill their size exactly, standing on the plate' + (bad.length ? ' — ' + bad.join(', ') : ''));
  const t = PM.makeObj('tube', {}), tb = md.whole(t); ok(tb.genus() === 1 && near(tb.volume(), Math.PI * (100 - 64) * 20, 40), 'a tube is a ring with 2 mm walls');
  md.free(tb);
  const turned = PM.makeObj('box', { w: 40, d: 10, h: 10, rz: 90 }), tbb = md.bounds(turned);
  ok(near(tbb.max[0] - tbb.min[0], 10) && near(tbb.max[1] - tbb.min[1], 40) && near(tbb.min[2], 0), 'turning a shape 90° turns it about its middle and keeps it on the plate');
  const flipped = PM.makeObj('ramp', { flip: 0 }); flipped.flip = 1; const a = md.whole(PM.makeObj('ramp', {})), f = md.whole(flipped);
  const fa = md.bounds(PM.makeObj('ramp', {})), ff = md.bounds(flipped);
  ok(near(a.volume(), f.volume()) && near(fa.min[0], ff.min[0]) && a.status() === 'NoError' && f.status() === 'NoError' && closed(md.meshOf(f)), 'a flipped shape is a mirror image, still closed');
  md.free(a, f);
  ok(md.textRatio('HELLO') > md.textRatio('Hi'), 'longer text is wider');
}

// ---- holes and groups
{
  const p = PM.newProject();
  p.objs.push(PM.makeObj('box', { id: 'o1', w: 40, d: 40, h: 10 }), PM.makeObj('cylinder', { id: 'o2', w: 10, d: 10, h: 20, z: -5, hole: true }));
  const c1 = md.check(p);
  ok(c1.some(c => c.level === 'warn' && /grouped/.test(c.text) && c.ids.includes('o2')), 'a hole on its own is pointed out (it doesn’t cut anything yet)');
  const g = md.group(p, ['o1', 'o2']);
  ok(p.objs.length === 1 && g.kind === 'group' && g.children.length === 2 && near(g.w, 40) && near(g.h, 10) && near(g.z, 0), 'grouping makes one object the size of the result (the hole doesn’t add to it)');
  const m = md.whole(g);
  ok(near(m.volume(), 40 * 40 * 10 - Math.PI * 25 * 10, 15) && m.genus() === 1, 'the grouped hole cuts straight through the box');
  md.free(m);
  ok(md.check(p).some(c => c.level === 'ok'), 'then it’s ready to print');
  g.w = 80; g.rz = 90; g.x = 10;
  const before = md.bounds(g), kids = md.ungroup(p, g.id);
  const after = kids.filter(k => !k.hole).map(k => md.bounds(k)).reduce((b, q) => ({ min: b.min.map((v, i) => Math.min(v, q.min[i])), max: b.max.map((v, i) => Math.max(v, q.max[i])) }));
  ok(kids.length === 2 && kids[1].hole && before.min.every((v, i) => near(v, after.min[i], 0.2)) && before.max.every((v, i) => near(v, after.max[i], 0.2)), 'ungrouping a stretched, turned group puts every part back exactly where it was');
  const parts = [PM.makeObj('box', { id: 'a', color: '#e8453c' }), PM.makeObj('box', { id: 'b', x: 10, color: '#3b7fc4' })];
  const q = PM.newProject(); q.objs = parts; const g2 = md.group(q, ['a', 'b']);
  ok(md.pieces(g2).map(x => x.color).join() === '#e8453c,#3b7fc4', 'a group keeps the colour of each part');
  const holes = PM.newProject(); holes.objs.push(PM.makeObj('box', { id: 'h1', hole: true }), PM.makeObj('sphere', { id: 'h2', hole: true, x: 15 }));
  const hg = md.group(holes, ['h1', 'h2']); ok(hg.hole && md.pieces(hg).length === 1, 'a group of holes is one bigger hole');
}

// ---- checks
{
  const at = o => { const p = PM.newProject(); p.objs.push(PM.makeObj('box', { id: 'o1' }), Object.assign(PM.makeObj('box', { id: 'o2' }), o)); return md.check(p); };
  ok(md.check(PM.newProject())[0].level === 'stop', 'an empty plate can’t be printed');
  ok(at({ x: 60, z: 25 }).some(c => /floating/.test(c.text) && c.ids.includes('o2')), 'something floating in the air is found');
  ok(!at({ z: 20 }).some(c => /floating/.test(c.text)), 'a box standing on another box isn’t floating');
  ok(at({ x: 60, z: -5 }).some(c => /under the build plate/.test(c.text)), 'something under the plate is found');
  ok(at({ x: 95 }).some(c => /off the build plate/.test(c.text)), 'something off the plate is found');
  ok(at({ x: 40, h: 0.5 }).some(c => /thinner than 1 mm/.test(c.text)), 'something thinner than 1 mm is found');
  ok(at({ x: 40 }).some(c => c.level === 'tip' && /2 separate pieces/.test(c.text)), 'separate pieces get a friendly note');
}

// ---- the examples and the files
{
  for (const [id, title] of PM.EXAMPLES) {
    const p = PM.exampleProject(id), holeIds = p.objs.filter(o => o.hole).map(o => o.id);
    if (holeIds.length) md.group(p, p.objs.map(o => o.id));
    const ch = md.check(p), w = md.exportWhole(p), parts = md.exportParts(p);
    const stl = PM.toSTL([w]), tris = w.indices.length / 3;
    const okParts = parts.every(x => closed(x) && x.volume > 0) && Math.abs(parts.reduce((t, x) => t + x.volume, 0) - w.volume) < w.volume * 0.002;
    ok(!ch.some(c => c.level === 'warn' || c.level === 'stop') && w.status === 'NoError' && closed(w) && stl.byteLength === 84 + 50 * tris && okParts,
      'example “' + title + '”: ready to print, one closed solid in the .stl, one closed part per colour (' + parts.length + ')');
  }
  const p = PM.exampleProject('rocket'), z = PM.to3MF(md.exportParts(p), 'Rocket'), txt = new TextDecoder().decode(z);
  ok(z[0] === 0x50 && z[1] === 0x4b && txt.includes('3D/3dmodel.model') && txt.includes('[Content_Types].xml') && (txt.match(/<object id=/g) || []).length === 4 && txt.includes('displaycolor="#E8453CFF"'),
    'the .3mf is a zip with the model, a part per colour (+ the whole) and the colours');
}

// ---- saved projects are checked
{
  const deep = { kind: 'group', children: [] }; let at = deep; for (let i = 0; i < 10; i++) { const k = { kind: 'group', children: [PM.makeObj('box')] }; at.children.push(k); at = k; }
  const c = PM.cleanProject({ plate: { w: 9999 }, objs: [{ kind: 'nope' }, { kind: 'box', w: -5, x: 'a', color: 'red', id: '<x>' }, { kind: 'text', text: 'x'.repeat(200) }, deep, ...Array(400).fill({ kind: 'box' })] });
  const b = c.objs[0];
  ok(c.plate.w === 400 && b.kind === 'box' && b.w === 0.2 && b.x === 0 && /^#[0-9a-f]{6}$/.test(b.color) && b.id === 'o1' && c.objs[1].text.length === PM.LIMITS.text, 'bad kinds, numbers, colours and ids are cleaned up');
  let n = 0, depth = 0; const walk = (os, d) => { for (const o of os) { n++; depth = Math.max(depth, d); if (o.children) walk(o.children, d + 1); } }; walk(c.objs, 0);
  ok(n <= PM.LIMITS.objs && depth <= PM.LIMITS.depth, 'at most ' + PM.LIMITS.objs + ' shapes and ' + PM.LIMITS.depth + ' groups deep (' + n + ', ' + depth + ')');
  ok(new Set([...PM.allIds(c.objs)]).size === n, 'every id is different');
}

// ---- more shapes, parts, drawings
{
  const h = PM.makeObj('hinge', {}), hm = md.whole(h), comps = hm.decompose();
  const [a, c] = comps, gap = a.minGap(c, 2);
  ok(comps.length === 2 && closed(md.meshOf(hm)) && gap >= PM.GAP - 0.05, 'the hinge prints already joined: two separate parts with a ' + gap.toFixed(2) + ' mm gap all round');
  md.free(hm, ...comps);
  const r = PM.makeObj('rounded', { w: 20, d: 20, h: 10 }), rm = md.whole(r), rb = md.bounds(r);
  ok(rm.volume() < 4000 && rm.volume() > 3500 && near(rb.min[2], 0) && near(rb.max[2], 10), 'a rounded box has rounded edges and a flat bottom');
  md.free(rm);
  const g12 = md.whole(PM.makeObj('gear', { teeth: 12 })), g24 = md.whole(PM.makeObj('gear', { teeth: 24, w: 60, d: 60 }));
  ok(g12.genus() === 1 && g24.genus() === 1 && g12.status() === 'NoError', 'gears have teeth and a hole for an axle');
  md.free(g12, g24);
  const up = PM.makeObj('sketch', { pts: [[0, 0], [1000, 0], [500, 1000]] }), spin = PM.makeObj('sketch', { mode: 'spin', pts: [[0, 0], [500, 0], [200, 500], [400, 1000], [0, 1000]] });
  const ub = md.bounds(up), sb = md.bounds(spin), sm = md.whole(spin);
  ok(near(ub.max[0] - ub.min[0], 30) && near(ub.max[2], 10) && near(sb.max[0] - sb.min[0], 30) && near(sb.max[1] - sb.min[1], 30) && closed(md.meshOf(sm)), 'a drawing stands up into a solid, or spins round into a round one');
  md.free(sm);
  ok(md.pieces(PM.makeObj('sketch', { pts: [[0, 0], [500, 500], [1000, 1000]] })).length === 0, 'a drawing that has no area makes nothing (and doesn’t crash)');
  ok(PM.cleanPts([[0, 0], [2000, -5], ['a', 1], [3, 4]]).join(';') === '0,0;1000,0;3,4' && PM.cleanPts([[1, 1]]) === null, 'drawings are checked when they load');
  const pr = PM.newProject(), all = PM.PARTS.flatMap(([id]) => { const os = PM.partObjs(id, pr, 0, 0); pr.objs.push(...os); return os; });
  ok(PM.PARTS.every(([id]) => PM.partObjs(id, pr).length) && new Set(all.map(o => o.id)).size === all.length, 'every ready-made part makes shapes with new ids');
  const bl = PM.newProject(); bl.objs = PM.partObjs('boxlid', bl);
  const [box, lid] = bl.objs.map(o => md.bounds(o));
  ok(!md.check(bl).some(c => c.level === 'warn' || c.level === 'stop') && box.max[0] < lid.min[0] && near(box.max[2], 25) && near(lid.max[2], 5), 'the box and lid sit side by side, ready to print');
  const pg = PM.newProject(); pg.objs = PM.partObjs('pegs', pg); const [peg, hole] = pg.objs;
  ok(hole.hole && near(hole.w - peg.w, 0.6), 'the hole for a peg is 0.6 mm wider than the peg');
}
// ---- align, measure-free maths, estimates
{
  const p = PM.newProject(); p.objs = [PM.makeObj('box', { id: 'a', x: -20, y: 5 }), PM.makeObj('cylinder', { id: 'b', x: 30, y: -10, w: 10, d: 10, z: 7 })];
  md.align(p, ['a', 'b'], 1, 'min'); const A = md.bounds(p.objs[0]), B = md.bounds(p.objs[1]);
  ok(near(A.min[1], B.min[1]) && near(A.min[1], -15), 'Line up → Front puts their front edges together');
  md.align(p, ['a', 'b'], 2, 'min'); ok(near(md.bounds(p.objs[1]).min[2], 0), 'Line up → Bottom puts them on the same level');
  const cube = PM.newProject(); cube.objs = [PM.makeObj('box', { id: 'a' })];
  const e = md.estimate(cube), big = PM.newProject(); big.objs = [PM.makeObj('box', { id: 'a', w: 60, d: 60, h: 60 })];
  const e2 = md.estimate(big);
  ok(e.grams > 2 && e.grams < 5 && e.minutes[0] < e.minutes[1] && e2.grams > e.grams * 5 && e2.minutes[1] > e.minutes[1], 'a 20 mm cube is about ' + e.grams + ' g and ' + PM.timeText(e.minutes) + '; a bigger design takes more of both');
}
// ---- design challenges
{
  ok(PM.BRIEFS.length >= 5 && PM.BRIEFS.every(b => PM.cleanBrief(b).rules.length === b.rules.length), 'the ready-made challenges are all valid');
  ok(PM.BRIEFS.every(b => { const p = PM.briefProject(b.id); return !PM.briefCheck(md, p, p.brief).every(r => r.ok); }), 'an empty plate doesn’t finish any challenge');
  const k = PM.exampleProject('keyring'); k.brief = PM.cleanBrief(PM.BRIEFS.find(b => b.id === 'keyring'));
  ok(PM.briefCheck(md, k, k.brief).every(r => r.ok), 'the ready-made name keyring meets the keyring challenge');
  k.objs[0].w = 80; k.objs[0].bw = 60; const res = PM.briefCheck(md, k, k.brief);
  ok(!res.find(r => r.k === 'maxw').ok && res.find(r => r.k === 'hole').ok, 'stretching it to 80 mm breaks just the width rule');
  // the phone stand lesson's answer (its Lesson card steps)
  const s = PM.briefProject('phonestand');
  s.objs.push(PM.makeObj('box', { id: 'o1', w: 70, d: 70, h: 6 }), PM.makeObj('box', { id: 'o2', w: 70, d: 6, h: 80, y: 30, rx: -15 }), PM.makeObj('box', { id: 'o3', w: 70, d: 6, h: 14, y: -30, z: 6 }));
  const b2 = md.bounds(s.objs[1]); s.objs[1].z -= b2.min[2];
  const sr = PM.briefCheck(md, s, s.brief);
  ok(sr.every(r => r.ok), 'the phone stand lesson’s steps finish its challenge' + (sr.every(r => r.ok) ? '' : ': ' + sr.filter(r => !r.ok).map(r => r.text).join(', ')));
  const st = JSON.parse(readFileSync(ROOT + '/lessons/starters/print-keyring.json', 'utf8')).print3d;
  ok(st && st.brief && !PM.briefCheck(md, PM.cleanProject(st), PM.cleanProject(st).brief).every(r => r.ok), 'the keyring lesson starter doesn’t finish its challenge by itself');
  const kr = PM.cleanProject(st); kr.objs.push(PM.makeObj('text', { id: 'o2', text: 'AMY', w: 30, d: 12, h: 2, z: 3, x: 5 }), PM.makeObj('cylinder', { id: 'o3', hole: true, x: -19, w: 6, d: 6, h: 6, z: -1 }));
  md.group(kr, ['o1', 'o3']);
  ok(PM.briefCheck(md, kr, kr.brief).every(r => r.ok), 'the keyring lesson’s steps finish its challenge');
  const cb = PM.cleanBrief({ title: 'x'.repeat(99), rules: [{ k: 'maxw', v: 5000 }, { k: 'nope' }, { k: 'uses', v: 'sketch' }, { k: 'uses', v: 'bad' }, { k: 'hole', v: 3 }] });
  ok(cb.title.length === 60 && cb.rules.length === 3 && cb.rules[0].v === 1000 && cb.rules[2].v === undefined, 'challenges are checked when they load');
  ok(PM.cleanProject({ objs: [], brief: { title: 'T', rules: [{ k: 'text' }] } }).brief.rules[0].k === 'text', 'a challenge travels with the saved design');
}

// ---- the app
const srv = await serve(), b = await browser();
try {
  const errors = [];
  const { page } = await openApp(b, srv.url, { errors });
  const p3 = () => page.evaluate(() => p3dApp._proj());

  // from the home page: Key Stage 1 doesn't get it, Key Stage 2 does
  ok(await page.evaluate(() => !!document.querySelector('.hm-tile[data-start="print3d"] img')), 'the Print Lab has a tile on the home page');
  await page.click('.hm-tile[data-start="print3d"]'); await page.click('#ks-modal .ks-opt[data-ks="ks1"]');
  ok(await page.evaluate(() => !document.body.classList.contains('print3d-mode') && getComputedStyle(document.querySelector('#pt-modal .ks-opt[data-pt="print3d"]')).display === 'none'), 'Key Stage 1 doesn’t get the Print Lab');
  await page.evaluate(() => { document.getElementById('pt-modal').classList.add('hide'); showHome(); });
  await page.click('.hm-tile[data-start="print3d"]'); await page.click('#ks-modal .ks-opt[data-ks="ks2"]');
  await page.waitForFunction(() => typeof p3dApp !== 'undefined' && p3dApp && p3dApp._model && p3dApp._model() && document.querySelectorAll('.pl-tile img[src^="data:"]').length > 10, null, { timeout: 90000 });
  ok(await page.evaluate(() => document.body.classList.contains('print3d-mode') && document.querySelectorAll('.pl-tile').length === 25), 'it opens with the shapes, 2 holes and 5 parts, each with a picture');

  // drag the Box tile onto the middle of the plate
  const tile = await page.locator('.pl-tile[data-kind="box"]:not(.hole)').boundingBox();
  const mid = await page.evaluate(() => p3dApp._screen([0, 0, 0]));
  await page.mouse.move(tile.x + tile.width / 2, tile.y + tile.height / 2); await page.mouse.down();
  await page.mouse.move(mid[0] - 30, mid[1], { steps: 6 }); await page.mouse.move(mid[0], mid[1], { steps: 6 }); await page.mouse.up();
  let pr = await p3();
  ok(pr.objs.length === 1 && pr.objs[0].kind === 'box' && Math.abs(pr.objs[0].x) <= 2 && Math.abs(pr.objs[0].y) <= 2 && pr.objs[0].z === 0, 'dragging a shape from the panel drops it where you let go (' + pr.objs[0].x + ', ' + pr.objs[0].y + ')');

  // tap Cylinder: it goes somewhere free
  await page.click('.pl-tile[data-kind="cylinder"]:not(.hole)');
  pr = await p3();
  const [bx, cy] = [pr.objs[0], pr.objs[1]];
  ok(pr.objs.length === 2 && (Math.abs(cy.x - bx.x) >= 20 || Math.abs(cy.y - bx.y) >= 20), 'tapping a shape puts it in a free spot on the plate');

  // drag the box along the plate
  await page.evaluate(() => p3dApp._select(['o1']));
  const from = await page.evaluate(() => p3dApp._screen([0, -5, 20]));
  const to = await page.evaluate(() => p3dApp._screen([-30, -25, 20]));
  await page.mouse.move(from[0], from[1]); await page.mouse.down(); await page.mouse.move(to[0], to[1], { steps: 10 }); await page.mouse.up();
  pr = await p3();
  ok(Math.abs(pr.objs[0].x + 30) <= 1.01 && Math.abs(pr.objs[0].y + 20) <= 1.01 && Number.isInteger(pr.objs[0].x) && pr.objs[0].z === 0, 'dragging a shape moves it along the plate in 1 mm steps (' + pr.objs[0].x + ', ' + pr.objs[0].y + ')');

  async function dragHandle(match, toPoint) {
    const h = await page.evaluate(m => p3dApp._handles().find(x => Object.entries(m).every(([k, v]) => x[k] === v)), match);
    const s = await page.evaluate(p => p3dApp._screen(p), h.p), t = await page.evaluate(p => p3dApp._screen(p), toPoint(h.p));
    await page.mouse.move(s[0], s[1]); await page.mouse.down(); await page.mouse.move(t[0], t[1], { steps: 10 }); await page.mouse.up();
    return (await p3()).objs[0];
  }
  let o = (await p3()).objs[0];
  o = await dragHandle({ kind: 'corner', sx: 1, sy: 1 }, p => [p[0] + 10, p[1] + 6, p[2]]);
  ok(Math.abs(o.w - 30) <= 1 && Math.abs(o.d - 26) <= 1 && Math.abs(o.x - (-30 + (o.w - 20) / 2)) < 0.01, 'the corner handle makes it wider and deeper, keeping the other corner still (' + o.w + ' × ' + o.d + ')');
  o = await dragHandle({ kind: 'top' }, p => [p[0], p[1], p[2] + 10]);
  ok(Math.abs(o.h - 30) <= 1 && o.z === 0, 'the top handle makes it taller (' + o.h + ')');
  o = await dragHandle({ kind: 'lift' }, p => [p[0], p[1], p[2] + 8]);
  ok(o.z >= 6 && o.z <= 10, 'the arrow lifts it off the plate (' + o.z + ')');
  await page.click('#plDrop'); o = (await p3()).objs[0];
  ok(o.z === 0, 'Drop to plate puts it back down');
  const cen = [o.x, o.y, 0];
  o = await dragHandle({ kind: 'rot', axis: 'z' }, p => { const a = Math.atan2(p[1] - cen[1], p[0] - cen[0]) + Math.PI / 4 + 0.05, r = Math.hypot(p[0] - cen[0], p[1] - cen[1]); return [cen[0] + Math.cos(a) * r, cen[1] + Math.sin(a) * r, p[2]]; });
  ok(o.rz > 0 && o.rz % 15 === 0, 'the curved arrow turns it in 15° steps (' + o.rz + '°)');

  // numbers in the panel
  await page.fill('#plInsp [data-f="rz"]', '0'); await page.press('#plInsp [data-f="rz"]', 'Enter');
  await page.fill('#plInsp [data-f="w"]', '40'); await page.press('#plInsp [data-f="w"]', 'Enter');
  o = (await p3()).objs[0]; ok(o.rz === 0 && o.w === 40, 'typing numbers in the panel sets the turn and the size');

  // make the cylinder a hole, put it in the box, group
  await page.evaluate(() => p3dApp._select(['o2']));
  await page.click('#plInsp [data-hole="1"]');
  await page.evaluate(() => { const b = p3dApp._proj().objs[0]; p3dApp._select(['o2']); });
  await page.fill('#plInsp [data-f="x"]', String(o.x)); await page.press('#plInsp [data-f="x"]', 'Enter');
  await page.fill('#plInsp [data-f="y"]', String(o.y)); await page.press('#plInsp [data-f="y"]', 'Enter');
  await page.fill('#plInsp [data-f="h"]', '40'); await page.press('#plInsp [data-f="h"]', 'Enter');
  await page.fill('#plInsp [data-f="z"]', '3'); await page.press('#plInsp [data-f="z"]', 'Enter');
  pr = await p3(); ok(pr.objs[1].hole && pr.objs[1].x === o.x && pr.objs[1].z === 3, 'Hole turns the cylinder into a hole');
  await page.click('#plPrintBtn');
  ok(await page.locator('.pl-checks li.warn', { hasText: 'grouped' }).count() === 1, 'Check & print says the hole isn’t grouped yet');
  await page.click('#plMClose');
  // shift-click the box to pick both
  await page.evaluate(() => p3dApp._setView('home'));
  const bs = await page.evaluate(o => p3dApp._screen([o.x - o.w / 2 + 3, o.y - o.d / 2, 15]), o);
  await page.keyboard.down('Shift'); await page.mouse.click(bs[0], bs[1]); await page.keyboard.up('Shift');
  ok((await page.evaluate(() => p3dApp._sel())).length === 2, 'Shift-click picks a second shape');
  await page.click('#plGroup');
  pr = await p3();
  ok(pr.objs.length === 1 && pr.objs[0].kind === 'group' && pr.objs[0].children.some(c => c.hole), 'Group joins them into one group');
  const vol = await page.evaluate(() => { const m = p3dApp._model(), w = m.whole(p3dApp._proj().objs[0]), v = w.volume(); m.free(w); return v; });
  ok(vol < 40 * 26 * 30 - 1000, 'the hole is cut out of the box (' + Math.round(vol) + ' mm³)');
  await page.click('#plPrintBtn');
  ok(await page.locator('.pl-checks li.ok', { hasText: 'Ready to print' }).count() === 1, 'now it’s ready to print');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#plSTL')]);
  const stl = readFileSync(await dl.path());
  ok(dl.suggestedFilename() === 'my-design.stl' && stl.length === 84 + 50 * stl.readUInt32LE(80) && stl.readUInt32LE(80) > 50, 'Download for printing gives a binary .stl (' + stl.readUInt32LE(80) + ' triangles)');
  const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('#pl3MF')]);
  const z = readFileSync(await dl2.path());
  ok(dl2.suggestedFilename() === 'my-design.3mf' && z[0] === 0x50 && z[1] === 0x4b, 'Download with colours gives a .3mf');
  await page.click('#plMClose');

  // undo / redo, delete, duplicate
  await page.click('#plUndo'); ok((await p3()).objs.length === 2, 'Undo takes the group apart again');
  await page.click('#plRedo'); ok((await p3()).objs.length === 1, 'Redo groups them again');
  await page.evaluate(() => p3dApp._select([p3dApp._proj().objs[0].id])); await page.focus('#plCanvas');
  await page.keyboard.press('Control+d'); ok((await p3()).objs.length === 2, 'Ctrl+D duplicates');
  await page.keyboard.press('Delete'); ok((await p3()).objs.length === 1, 'Delete deletes');
  await page.evaluate(() => p3dApp._select([p3dApp._proj().objs[0].id]));
  await page.click('#plUngroup'); ok((await p3()).objs.length === 2, 'Ungroup takes it apart');
  await page.click('#plUndo');

  // save + reopen
  await page.fill('#plTitle', 'Pot'); await page.press('#plTitle', 'Enter');
  const saved = await page.evaluate(() => { const p = buildPayload(); return { pt: p.projectType, p: p.print3d }; });
  ok(saved.pt === 'print3d' && saved.p.title === 'Pot' && saved.p.objs.length === 1, 'the design goes in the saved project');
  await page.evaluate(() => { startNewPrint3D('ks2'); });
  await page.waitForFunction(() => p3dApp._proj().objs.length === 0);
  await page.evaluate(p => { const pl = buildPayload(); pl.print3d = p; pl.projectType = 'print3d'; applyPayload(pl); }, saved.p);
  await page.waitForFunction(() => p3dApp._proj().objs.length === 1);
  ok((await page.evaluate(() => document.getElementById('plTitle').value)) === 'Pot' && (await p3()).objs[0].kind === 'group', 'it reopens just as it was saved');

  // examples
  page.once('dialog', d => d.accept());
  await page.evaluate(() => { window._cjc = window.cjConfirm; window.cjConfirm = () => Promise.resolve(true); });
  await page.click('[data-ex="keyring"]'); await page.waitForFunction(() => p3dApp._proj().title === 'Name keyring');
  ok((await p3()).objs.some(o => o.kind === 'text'), 'Examples open a ready-made design');


  // parts, drawing, measuring, lining up, challenges
  await page.evaluate(() => startNewPrint3D('ks2'));
  await page.waitForFunction(() => p3dApp._model() && p3dApp._proj().objs.length === 0);
  await page.click('[data-part="hinge"]');
  ok((await p3()).objs.length === 1 && (await p3()).objs[0].kind === 'hinge', 'tapping a part adds it');
  await page.click('#plDraw');
  const cv = await page.locator('#plDrawCv').boundingBox();
  for (const [x, y] of [[0.2, 0.9], [0.8, 0.9], [0.5, 0.2]]) await page.mouse.click(cv.x + cv.width * x, cv.y + cv.height * y);
  await page.click('#plDrawOk');
  pr = await p3(); const sk = pr.objs.find(o => o.kind === 'sketch');
  ok(sk && sk.pts.length === 3 && sk.mode === 'up', 'Draw a shape: three clicks and Make it give a new shape from the drawing');
  await page.click('#plInsp #plEditDraw'); await page.click('[data-dm="spin"]'); await page.click('#plDrawClear');
  await page.click('#plDrawOk'); ok(await page.locator('#plDrawMsg', { hasText: '3 points' }).count() === 1, 'it asks for at least 3 points');
  for (const [x, y] of [[0.5, 0.9], [0.8, 0.9], [0.6, 0.5], [0.5, 0.1]]) await page.mouse.click(cv.x + cv.width * x, cv.y + cv.height * y);
  await page.click('#plDrawOk');
  ok((await p3()).objs.find(o => o.id === sk.id).mode === 'spin', 'Change the drawing → Spin it round turns it into a round shape');
  await page.click('#plMeasure');
  for (const pt of [[-50, -70, 0], [10, -70, 0]]) { const q = await page.evaluate(p => p3dApp._screen(p), pt); await page.mouse.click(q[0], q[1]); }
  const m = await page.evaluate(() => p3dApp._measurePts());
  ok(m && m.length === 2 && Math.abs(Math.hypot(m[1][0] - m[0][0], m[1][1] - m[0][1]) - 60) < 1.5 && await page.locator('#plMLabel b', { hasText: 'mm' }).isVisible(), 'Measure: two clicks show the distance between them (' + (m && Math.hypot(m[1][0] - m[0][0], m[1][1] - m[0][1]).toFixed(1)) + ' mm)');
  await page.keyboard.press('Escape');
  await page.evaluate(() => p3dApp._select(p3dApp._proj().objs.map(o => o.id)));
  await page.click('#plInsp [data-al="1min"]');
  const fronts = await page.evaluate(() => p3dApp._proj().objs.map(o => p3dApp._model().bounds(o).min[1]));
  ok(Math.abs(fronts[0] - fronts[1]) < 0.05, 'Line them up → Front lines up the front edges');
  await page.click('#plPrintBtn');
  ok(await page.locator('.pl-facts', { hasText: 'of plastic' }).count() === 1 && await page.locator('.pl-facts', { hasText: 'min' }).count() === 1, 'Check & print says roughly how much plastic and how long');
  await page.click('#plMClose');
  await page.click('[data-brief="badge"]');
  await page.waitForFunction(() => p3dApp._proj().brief && !document.getElementById('plBrief').hidden);
  ok(await page.locator('#plBrief li').count() === 6 && (await p3()).objs.length === 0, 'a ready-made challenge opens on a clear plate with its checklist');
  await page.evaluate(() => { p3dApp._add('box'); });
  await page.fill('#plInsp [data-f="h"]', '3'); await page.press('#plInsp [data-f="h"]', 'Enter');
  await page.waitForFunction(() => document.querySelectorAll('#plBrief li.ok').length >= 3);
  ok(await page.locator('#plBrief li.ok', { hasText: 'No taller than 6 mm' }).count() === 1, 'its rules tick themselves as you design');
  await page.click('#plBriefEdit');
  await page.fill('#plBTitle', 'Bird feeder'); await page.click('#plBAdd'); await page.click('#plBSave');
  ok((await p3()).brief.title === 'Bird feeder' && (await p3()).brief.rules.length === 7, 'Make a challenge: a teacher can write their own (title and rules)');


  // home and back
  await page.evaluate(() => showHome());
  ok(await page.evaluate(() => !document.body.classList.contains('print3d-mode')), 'going home leaves the lab');
  ok(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await b.close(); srv.close(); }
done();
