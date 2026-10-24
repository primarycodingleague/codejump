// Teacher Guide · Build Lab: screenshots of the real app → guide/tools/out/build/
import { join } from 'node:path';
import { openPage, shot, saveShots, startLab, mark, HERE } from './lib.mjs';
const DIR = join(HERE, 'out', 'build');
const S = {};
const { page, errors, close } = await openPage();
page.setDefaultTimeout(180000);
try {
  await startLab(page, DIR, S, 's1', 'craft');
  await page.waitForSelector('#crRun');
  await page.waitForFunction(() => craftApp && craftApp._world && craftApp._world());
  await page.waitForTimeout(4000);
  // 2 build by hand: pick a block, click to place it
  const slot = await mark(page, () => document.querySelectorAll('#crHot > *')[3] || document.querySelector('#crHot > *'));
  S.s2a = await shot(page, DIR, 's2a', slot);
  await page.click(slot);
  const v = await page.locator('#crCanvas').boundingBox();
  for (const [dx, dy] of [[-0.18, 0.6], [-0.22, 0.6], [-0.18, 0.56]]) { await page.mouse.click(v.x + v.width * (0.5 + dx), v.y + v.height * dy); await page.waitForTimeout(250); }
  await page.mouse.move(v.x + v.width - 30, v.y + 30);
  S.s2b = await shot(page, DIR, 's2b', '#crCanvas', { type: 'look' });
  // step back so the helper's build is in view
  await page.evaluate(() => document.getElementById('crCanvas').focus());
  await page.keyboard.down('KeyS'); await page.waitForTimeout(1300); await page.keyboard.up('KeyS'); await page.waitForTimeout(500);
  // 3 code the robot helper: the starter program, Run
  const hat = await mark(page, () => craftApp._ws().getTopBlocks(true)[0].getSvgRoot());
  S.s3a = await shot(page, DIR, 's3a', hat, { type: 'look' });
  S.s3b = await shot(page, DIR, 's3b', '#crRun');
  await page.click('#crRun'); await page.mouse.move(v.x + v.width - 30, v.y + 30);
  await page.waitForTimeout(5000);
  S.s3c = await shot(page, DIR, 's3c', '#crCanvas', { type: 'look' });
  // 4 the same program in Python
  S.s4a = await shot(page, DIR, 's4a', '#crTabP');
  await page.click('#crTabP'); await page.waitForTimeout(1000);
  S.s4b = await shot(page, DIR, 's4b', '#crSrc', { type: 'look' });
  await page.click('#crTabB'); await page.waitForTimeout(600);
  // 5 chat command
  await page.click('#crChat'); await page.keyboard.type('tower 6');
  S.s5a = await shot(page, DIR, 's5a', '#crChat');
  await page.keyboard.press('Enter'); await page.mouse.move(v.x + v.width - 30, v.y + 30);
  await page.waitForTimeout(3500);
  await page.evaluate(() => document.getElementById('crCanvas').focus());
  await page.keyboard.down('KeyS'); await page.waitForTimeout(1600); await page.keyboard.up('KeyS'); await page.waitForTimeout(400);
  S.s5b = await shot(page, DIR, 's5b', '#crCanvas', { type: 'look' });
  // 6 Worlds: the Robot Helper Academy and ready-made worlds
  S.s6a = await shot(page, DIR, 's6a', '#crWorldsBtn');
  await page.click('#crWorldsBtn'); await page.waitForTimeout(1200);
  const ac = await mark(page, () => document.querySelector('[data-ac]') || document.querySelector('#crModalBody'));
  S.s6b = await shot(page, DIR, 's6b', ac);
  saveShots(DIR, S);
  console.log('shots', Object.keys(S).length, 'errors', errors);
} finally { await close(); }
