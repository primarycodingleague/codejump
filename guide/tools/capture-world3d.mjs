// Teacher Guide · 3D World: screenshots of the real app → guide/tools/out/world3d/
import { join } from 'node:path';
import { openPage, shot, saveShots, startLab, mark, HERE } from './lib.mjs';
const DIR = join(HERE, 'out', 'world3d');
const S = {};
const { page, errors, close } = await openPage();
page.setDefaultTimeout(180000);
// where a 3D object is on the screen
const at = name => page.evaluate(n => {
  const W = worldApp._world(), B = W.B, m = W.scene.getMeshByName(n) || W.scene.meshes.find(x => x.name.startsWith(n));
  const c = W.engine.getRenderingCanvas(), r = c.getBoundingClientRect();
  const bb = m.getHierarchyBoundingVectors ? m.getHierarchyBoundingVectors(true) : null;
  const p = bb ? bb.min.add(bb.max).scale(0.5) : m.getAbsolutePosition();
  const v = B.Vector3.Project(p, B.Matrix.Identity(), W.scene.getTransformMatrix(), W.camera.viewport.toGlobal(c.width, c.height));
  return { x: r.x + v.x * r.width / c.width, y: r.y + v.y * r.height / c.height };
}, name);
try {
  // 1 start
  await startLab(page, DIR, S, 's1', '3d');
  await page.waitForFunction(() => typeof worldApp !== 'undefined' && worldApp && worldApp._world && worldApp._world() && worldApp._world().editing());
  await page.waitForTimeout(4000);
  const names = await page.evaluate(() => worldApp._world().objects().map(o => o.id));
  console.log('objects', names.join(', '));
  // 2 tap a thing: its block lights up
  const target = names.find(n => /star/i.test(n)) || names[1];
  const p = await at(target);
  await page.mouse.click(p.x, p.y); await page.waitForTimeout(1200);
  const picked = await page.evaluate(() => worldApp._world().selected()); console.log('selected', picked);
  S.s2a = await shot(page, DIR, 's2a', await mark(page, ([x, y]) => { const d = document.createElement('div'); d.style.cssText = `position:fixed;left:${x - 30}px;top:${y - 30}px;width:60px;height:60px;pointer-events:none`; document.body.appendChild(d); return d; }, [p.x, p.y]));
  const blk = await mark(page, () => { const W = worldApp._world(), ws = worldApp._ws(); const id = W.blockOf(W.selected()); return ws.getBlockById(id).getSvgRoot(); });
  S.s2b = await shot(page, DIR, 's2b', blk, { type: 'look' });
  // 3 drag its arrows: the numbers in the block change
  await page.evaluate(n => { const W = worldApp._world(), gm = W._gizmo(), pg = gm.gizmos.positionGizmo, m = W.scene.getMeshByName(n) || W.scene.meshes.find(x => x.name.startsWith(n)); pg.onDragStartObservable.notifyObservers({}); m.position.x += 3; pg.onDragEndObservable.notifyObservers({}); }, picked);
  await page.waitForTimeout(1500);
  const xin = await mark(page, () => { const W = worldApp._world(), ws = worldApp._ws(); const b = ws.getBlockById(W.blockOf(W.selected()) || '') || ws.getAllBlocks(false).find(b => b.getInput && b.getInput('X')); const t = b.getInputTargetBlock('X'); return (t || b).getSvgRoot(); });
  S.s3 = await shot(page, DIR, 's3', xin);
  // 4 blocks from the categories
  const cat = await mark(page, () => [...document.querySelectorAll('#w3Blocks .blocklyTreeRow')].find(r => /Characters/.test(r.textContent)));
  S.s4a = await shot(page, DIR, 's4a', cat);
  await page.click(cat); await page.waitForTimeout(1200);
  const fly = await mark(page, () => document.querySelector('#w3Blocks .blocklyFlyout .blocklyDraggable'));
  S.s4b = await shot(page, DIR, 's4b', fly, { type: 'look' });
  await page.mouse.click(5, 400); await page.keyboard.press('Escape');
  // 5 Run and play
  S.s5a = await shot(page, DIR, 's5a', '#w3Run');
  await page.click('#w3Run'); await page.waitForTimeout(3000);
  const cv = await page.locator('#w3Canvas').boundingBox();
  await page.mouse.click(cv.x + cv.width / 2, cv.y + cv.height - 30);
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(1800); await page.keyboard.up('ArrowUp');
  S.s5b = await shot(page, DIR, 's5b', '#w3Canvas', { type: 'look', wait: 200 });
  // 6 Stop goes back to the start
  S.s6a = await shot(page, DIR, 's6a', '#w3Stop');
  await page.click('#w3Stop'); await page.waitForTimeout(2500);
  S.s6b = await shot(page, DIR, 's6b', '#w3Canvas', { type: 'look' });
  saveShots(DIR, S);
  console.log('shots', Object.keys(S).length, 'errors', errors);
} finally { await close(); }
