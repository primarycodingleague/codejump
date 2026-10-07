// The Stage paint editor (vector + bitmap) in a real browser: a built-in character opens as separate parts, one part can be
// recoloured, parts move / resize / group / layer / undo, new shapes and words are added, bitmap painting crops and saves,
// the ready-made backdrops open, and every drawing survives save → load and the safety checks.
import { serve, browser, openApp, ok, done, sleep } from './lib.mjs';

const site = await serve();
const b = await browser();
const errors = [];
try {
  const { page } = await openApp(b, site.url, { errors });
  await page.setViewportSize({ width: 1366, height: 860 });
  const scr = (x, y) => page.evaluate(([x, y]) => { const s = peToScreen(x, y), r = document.getElementById('pe-cv').getBoundingClientRect(); return { x: r.left + s.x, y: r.top + s.y }; }, [x, y]);
  const click = async (x, y) => { const p = await scr(x, y); await page.mouse.click(p.x, p.y); };
  const drag = async (a, c) => { a = await scr(...a); c = await scr(...c); await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(c.x, c.y, { steps: 8 }); await page.mouse.up(); };

  // ── a built-in character as parts ──
  await page.evaluate(() => { startNewStage('ks2'); openCostumePicker(); });
  await page.click('#cm-edit .cm-paintbtn');
  await page.waitForFunction(() => PE.open && PE.shapes.length > 0);
  const parts = await page.evaluate(() => ({ n: PE.shapes.length, mode: PE.mode, kinds: [...new Set(PE.shapes.map(s => s.k))] }));
  ok(parts.n >= 20 && parts.mode === 'vector', 'the cat opens in the paint editor as separate parts (' + parts.n + ')');
  ok(await page.evaluate(() => COSTUME_KEYS.filter(k => k !== 'microbit').every(k => vecFromBuiltin(k, '#4d96ff', 1).shapes.length >= 6)), 'every built-in character (both poses) turns into parts');

  // fill tool recolours ONE part
  const before = await page.evaluate(() => PE.shapes.map(s => s.f));
  await page.evaluate(() => { peTool('fill'); PE.fill = '#4c97ff'; PE.gt = 1; });
  await click(0, 30);
  const after = await page.evaluate(() => PE.shapes.map(s => s.f));
  const changed = after.filter((f, i) => f !== before[i]).length;
  ok(changed === 1 && after.includes('#4c97ff'), 'the Fill tool recolours just the part clicked (the belly)');
  ok(await page.evaluate(() => PE.shapes.some(s => s.f === '#4c97ff' && s.gt === 1)), '…with the Shaded style');

  // select, move with the mouse, undo
  await page.evaluate(() => peTool('select'));
  await click(0, -20);
  const head = await page.evaluate(() => { const s = PE.sel[0]; return s ? PE.shapes.indexOf(s) : -1; });
  ok(head >= 0, 'clicking a part with Select picks it');
  const m0 = await page.evaluate(i => PE.shapes[i].m.slice(), head);
  await drag([0, -20], [30, -40]);
  const m1 = await page.evaluate(i => PE.shapes[i].m.slice(), head);
  ok(Math.abs(m1[4] - m0[4] - 30) < 1.5 && Math.abs(m1[5] - m0[5] + 20) < 1.5, 'dragging moves the part');
  await page.keyboard.press('Control+z');
  const m2 = await page.evaluate(i => PE.shapes[i].m.slice(), head);
  ok(Math.abs(m2[4] - m0[4]) < 0.01 && Math.abs(m2[5] - m0[5]) < 0.01, 'Ctrl+Z undoes the move');

  // corner handle scales (keeps the shape), the round handle turns
  await click(0, -20);
  const box = await page.evaluate(() => { const b = peSelBox(); return [b.x0, b.y0, b.x1, b.y1]; });
  await drag([box[2], box[3]], [box[2] + 20, box[3] + 20]);
  const box2 = await page.evaluate(() => { const b = peSelBox(); return [b.x0, b.y0, b.x1, b.y1]; });
  ok(box2[2] - box2[0] > box[2] - box[0] + 10 && Math.abs(box2[0] - box[0]) < 1, 'dragging a corner handle makes it bigger from the other corner');
  await drag([(box2[0] + box2[2]) / 2, box2[1] - 26 / await page.evaluate(() => PE.zoom)], [box2[2] + 40, (box2[1] + box2[3]) / 2]);
  ok(await page.evaluate(() => { const m = PE.sel[0].m; return Math.abs(m[1]) > 0.3; }), 'the round handle turns it');

  // shift-click to pick two, group, front / back, delete
  await page.evaluate(() => { peSetSel([PE.shapes[2], PE.shapes[3]]); peGroup(); peSetSel([]); });
  await page.evaluate(() => { peTool('select'); });
  ok(await page.evaluate(() => { const g = PE.shapes[2].g; return g && PE.shapes[3].g === g && peGroupOf(PE.shapes[2]).length === 2; }), 'Group joins parts so they are picked together');
  const order = await page.evaluate(() => { const s = PE.shapes[0]; peSetSel([s]); peOrder(2); return PE.shapes[PE.shapes.length - 1] === s; });
  ok(order, 'To the front puts a part on top');
  const n0 = await page.evaluate(() => PE.shapes.length);
  await page.evaluate(() => peDelete());
  ok(await page.evaluate(() => PE.shapes.length) === n0 - 1, 'Delete removes the picked part');

  // new shapes: rectangle (with shift = square), line, text, brush
  await page.evaluate(() => { peFitAll(); peTool('rect'); PE.fill = '#ffd54a'; PE.gt = 0; PE.sw = 3; PE.stroke = '#000000'; });
  await page.keyboard.down('Shift'); await drag([-120, -120], [-60, -100]); await page.keyboard.up('Shift');
  const sq = await page.evaluate(() => { const s = PE.shapes[PE.shapes.length - 1]; const b = vecShapeBox(s); return [b[2] - b[0], b[3] - b[1], s.f]; });
  ok(Math.abs(sq[0] - sq[1]) < 1 && sq[2] === '#ffd54a', 'Rectangle with Shift draws a square in the Fill colour ' + JSON.stringify(sq));
  await page.evaluate(() => peTool('text')); await click(60, 80); await sleep(80);
  await page.keyboard.type('Hello'); await page.keyboard.press('Enter');
  ok(await page.evaluate(() => PE.shapes.some(s => s.k === 'text' && s.t === 'Hello')), 'Text adds words');
  await page.evaluate(() => { peTool('brush'); PE.bsize = 6; }); await drag([-150, 100], [-90, 140]);
  ok(await page.evaluate(() => { const s = PE.shapes[PE.shapes.length - 1]; return s.k === 'path' && s.s && s.w === 6 && !s.f && s.d.length >= 2; }), 'Brush draws a smooth line');
  await page.evaluate(() => peTool('reshape')); await click(-90, -110);
  const pts = await page.evaluate(() => PE.rs ? peRsPoints(PE.rs).filter(p => p.an).length : 0);
  ok(pts === 4, 'Reshape shows the square\'s 4 corner points');
  await drag([-120, -120], [-140, -140]);
  ok(await page.evaluate(() => { const b = vecShapeBox(PE.rs); return b[0] < -135; }), 'dragging a point changes the shape');

  // colour wheel + eyedropper + hex
  await page.evaluate(() => { peTool('select'); peSetSel([PE.shapes.find(s => s.k === 'text')]); });
  await page.click('#pe-fill-btn');
  ok(await page.isVisible('#pe-wheel'), 'the Fill swatch opens the colour wheel');
  await page.fill('#pe-hex', '#e53935'); await page.press('#pe-hex', 'Enter');
  ok(await page.evaluate(() => PE.shapes.find(s => s.k === 'text').f === '#e53935'), 'typing a colour code recolours the picked part');
  const wb = await page.locator('#pe-wheel').boundingBox();
  await page.mouse.click(wb.x + wb.width * 0.5, wb.y + wb.height * 0.98);
  ok(await page.evaluate(() => { const h = hexToHsv(PE.shapes.find(s => s.k === 'text').f); return h.h > 70 && h.h < 110 && h.s > 0.85; }), 'clicking the wheel picks hue and strength');
  await page.click('#pe-pickb'); await click(-90, -110);
  ok(await page.evaluate(() => PE.shapes.find(s => s.k === 'text').f === '#ffd54a'), 'the eyedropper copies a colour from the picture');

  // save → the costume is a drawing, drawn on the stage, sized from the drawing
  await page.click('#pe-save');
  const saved = await page.evaluate(() => { const s = stageState.sprites[0], co = s.costumes[s.costumeIdx]; return { vec: !!co.vec, n: co.vec && co.vec.shapes.length, half: costumeHalf(s), r: stHitRadius(s) }; });
  ok(saved.vec && saved.n > 20 && saved.half.hw > 20 && saved.r > 10, 'Done keeps the drawing as the costume ' + JSON.stringify(saved));
  await page.evaluate(() => { document.getElementById('costume-modal').classList.add('hide'); stageNeedsDraw = true; drawStage(); });
  // payload round-trip + the safety check
  const rt = await page.evaluate(() => { const p = JSON.parse(JSON.stringify(buildPayload())); applyPayload(p); const co = stageState.sprites[0].costumes[0]; return { vec: !!co.vec, n: co.vec && co.vec.shapes.length }; });
  ok(rt.vec && rt.n === saved.n, 'the drawing survives save → open');
  const san = await page.evaluate(() => sanitizeVec({ w: 480, h: 360, shapes: [{ k: 'path', d: [['M', 0, 0], ['L', 'x', 1e9], ['Q', 1, 2, 3, 4], ['EVIL', 1]], f: 'red;}', s: '#000', w: 5, m: [1, 0, 0, 1, 0, 0], onclick: 'x' }, { k: 'img', src: 'javascript:alert(1)' }, { k: 'text', t: 'x'.repeat(999), f: '#fff', m: [1, 0, 0, 1, 2, 3] }, { k: 'zzz' }] }));
  ok(san.shapes.length === 2 && san.shapes[0].f === null && san.shapes[0].d.length === 3 && san.shapes[0].d[1][2] === 20000 && !('onclick' in san.shapes[0]) && san.shapes[1].t.length === 300, 'unsafe drawing data is cleaned or dropped');

  // ── bitmap: paint, crop, keep the centre ──
  await page.evaluate(() => { openCostumePicker(); cmPaintNew(); });
  await page.waitForFunction(() => PE.open);
  await page.click('#pe-convert');
  ok(await page.evaluate(() => PE.mode === 'bitmap' && document.querySelectorAll('#pe-tools .pe-tool').length === 8), 'Convert to Bitmap gives the bitmap tools');
  await page.evaluate(() => { PE.fill = '#8e24aa'; PE.bsize = 10; });
  await drag([20, -10], [60, -10]);
  await page.evaluate(() => peTool('fill')); await click(-100, 100);
  await page.evaluate(() => peTool('eraser')); await drag([-200, 100], [-150, 100]);
  await page.click('#pe-undo'); await page.click('#pe-undo');
  await page.click('#pe-save');
  const bm = await page.evaluate(() => { const s = stageState.sprites[0], co = s.costumes[s.costumeIdx]; return { img: !!co.img, res: co.res, cx: co.cx, cy: co.cy }; });
  ok(bm.img && bm.res === 2 && bm.cx < -20 && bm.cy > 15, 'a bitmap costume is cropped to the paint and keeps its centre ' + JSON.stringify(bm));
  await page.waitForFunction(() => { const s = stageState.sprites[0]; return costumeImgEl(s.costumes[s.costumeIdx]).complete; });
  ok(await page.evaluate(() => { const h = costumeHalf(stageState.sprites[0]); return h.hw > 55 && h.hw < 70; }), 'its size on the stage comes from the picture');

  // ── backdrops: the library, edit one, solid colour → editor ──
  await page.evaluate(() => { document.getElementById('costume-modal').classList.add('hide'); openBackdropManager(); });
  await page.click('#bd-add-lib');
  ok(await page.locator('.bd-libitem').count() >= 7, 'Choose a backdrop shows the ready-made backdrops');
  await page.click('.bd-libitem[data-key="space"]');
  ok(await page.evaluate(() => { const bd = curBackdrop(); return bd.vec && bd.vec.w === 960 && bd.vec.shapes.length > 40; }), 'a ready-made backdrop is added as editable parts');
  await page.click('#bd-edit .cm-paintbtn');
  await page.waitForFunction(() => PE.open && PE.kind === 'backdrop');
  ok(await page.evaluate(() => PE.W === 960 && PE.H === 576 && PE.shapes.length > 40), 'it opens in the paint editor at stage size');
  await page.evaluate(() => { peTool('fill'); PE.fill = '#123456'; PE.gt = 0; });
  await click(-470, -280);
  await page.click('#pe-save');
  ok(await page.evaluate(() => curBackdrop().vec.shapes[0].f === '#123456' && !curBackdrop().vec.shapes[0].gt), 'recolouring the sky saves into the backdrop');
  await page.evaluate(() => { stageNeedsDraw = true; drawStage(); });
  const px = await page.evaluate(() => { const d = document.getElementById('gc').getContext('2d').getImageData(5, 5, 1, 1).data; return [d[0], d[1], d[2]]; });
  ok(px[0] === 0x12 && px[1] === 0x34 && px[2] === 0x56, 'the stage draws the edited backdrop');

  // cancel with changes asks first
  await page.evaluate(() => bdPaintEdit(curBackdrop()));
  await page.waitForFunction(() => PE.open);
  await page.evaluate(() => { peTool('rect'); });
  await drag([0, 0], [100, 80]);
  await page.click('#pe-cancel');
  ok(await page.isVisible('#cj-dialog'), 'Cancel with changes asks before throwing them away');
  await page.click('#cj-dialog .cj-ok, #cj-ok').catch(() => page.keyboard.press('Enter'));
  await page.waitForFunction(() => !PE.open);
  ok(await page.evaluate(() => curBackdrop().vec.shapes.length) > 40, 'leaving keeps the backdrop as it was');

  ok(errors.length === 0, 'no errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} catch (e) {
  ok(false, 'the paint editor test stopped: ' + (e && e.stack || e));
}
await b.close();
site.close();
done();
