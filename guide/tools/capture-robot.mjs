// Teacher Guide · Robot Lab: screenshots of the real app → guide/tools/out/robot/
import { join } from 'node:path';
import { openPage, shot, saveShots, startLab, mark, HERE } from './lib.mjs';
const DIR = join(HERE, 'out', 'robot');
const S = {};
const { page, errors, close } = await openPage();
page.setDefaultTimeout(180000);
try {
  await startLab(page, DIR, S, 's1', 'robot');
  await page.waitForSelector('#rbRun');
  await page.waitForFunction(() => robotApp && robotApp._view && robotApp._view());
  await page.waitForTimeout(3500);
  // 2 name and colours
  await page.fill('#rbName', 'Pixel'); await page.dispatchEvent('#rbName', 'change');
  S.s2a = await shot(page, DIR, 's2a', '#rbName');
  await page.evaluate(() => { const b = document.getElementById('rbBody'); b.value = '#f5a623'; b.dispatchEvent(new Event('input', { bubbles: true })); b.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.waitForTimeout(800);
  S.s2b = await shot(page, DIR, 's2b', '#rbBody');
  // 3 blocks
  const hat = await mark(page, () => robotApp._ws().getTopBlocks(true)[0].getSvgRoot());
  S.s3 = await shot(page, DIR, 's3', hat, { type: 'look' });
  // 4 Run
  S.s4a = await shot(page, DIR, 's4a', '#rbRun');
  await page.click('#rbRun'); await page.mouse.move(640, 700); await page.waitForTimeout(500);
  S.s4b = await shot(page, DIR, 's4b', '#rbStage', { type: 'look', wait: 50 });
  // 5 tap the robot
  await page.waitForTimeout(6000);
  const c = await page.locator('#rbCanvas').boundingBox();
  const tap = await mark(page, ([x, y]) => { const d = document.createElement('div'); d.style.cssText = `position:fixed;left:${x - 40}px;top:${y - 40}px;width:80px;height:80px;pointer-events:none`; document.body.appendChild(d); return d; }, [c.x + c.width * 0.5, c.y + c.height * 0.4]);
  S.s5a = await shot(page, DIR, 's5a', tap);
  await page.mouse.click(c.x + c.width * 0.5, c.y + c.height * 0.4); await page.mouse.move(640, 700); await page.waitForTimeout(450);
  S.s5b = await shot(page, DIR, 's5b', '#rbStage', { type: 'look', wait: 50 });
  // 6 ask and answer
  await page.click('#rbStop').catch(() => {});
  await page.evaluate(() => {
    const ws = robotApp._ws(); ws.clear();
    Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [{ type: 'rb_when_run', x: 24, y: 24, next: { block: { type: 'rb_face', fields: { FACE: 'thinking' }, next: { block: { type: 'rb_ask', inputs: { TEXT: { shadow: { type: 'text', fields: { TEXT: 'What is your favourite book?' } } } }, next: { block: { type: 'rb_face', fields: { FACE: 'happy' }, next: { block: { type: 'rb_say_wait', inputs: { TEXT: { block: { type: 'rb_answer' } } } } } } } } } } } }] } }, ws);
  });
  await page.waitForTimeout(600);
  const ask = await mark(page, () => robotApp._ws().getAllBlocks(false).find(b => b.type === 'rb_ask').getSvgRoot());
  S.s6a = await shot(page, DIR, 's6a', ask, { type: 'look' });
  await page.click('#rbRun'); await page.waitForSelector('#rbAsk:not([hidden])', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.fill('#rbAnswer', 'The Lost Lighthouse');
  S.s6b = await shot(page, DIR, 's6b', '#rbAnswer');
  await page.press('#rbAnswer', 'Enter'); await page.mouse.move(640, 700); await page.waitForTimeout(450);
  S.s6c = await shot(page, DIR, 's6c', '#rbStage', { type: 'look', wait: 50 });
  saveShots(DIR, S);
  console.log('shots', Object.keys(S).length, 'errors', errors);
} finally { await close(); }
