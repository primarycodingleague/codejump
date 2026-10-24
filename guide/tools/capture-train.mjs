// Teacher Guide · Train Lab: screenshots of the real app → guide/tools/out/train/
import { join } from 'node:path';
import { openPage, shot, saveShots, startLab, mark, HERE } from './lib.mjs';
const DIR = join(HERE, 'out', 'train');
const S = {};
const { page, errors, close } = await openPage();
page.setDefaultTimeout(120000);
try {
  await startLab(page, DIR, S, 's1', 'train');
  await page.waitForSelector('#tlTools .tl-tool');
  await page.waitForTimeout(1500);
  // 2 track pieces and snaps
  const piece = await mark(page, () => document.querySelector('#tlTools .tl-tgroup .tl-tool'));
  S.s2a = await shot(page, DIR, 's2a', piece);
  const snap = await mark(page, () => document.querySelectorAll('#tlTools .tl-tgroup')[1].querySelector('.tl-tool'));
  S.s2b = await shot(page, DIR, 's2b', snap);
  // 3 Run: the trains obey the snaps with no code
  S.s3a = await shot(page, DIR, 's3a', '#tlRun');
  await page.click('#tlRun'); await page.mouse.move(640, 700); await page.waitForTimeout(3500);
  S.s3b = await shot(page, DIR, 's3b', '#tlCanvas', { type: 'look', wait: 50 });
  await page.click('#tlStop').catch(() => {}); await page.click('#tlReset').catch(() => {});
  // 4 blocks per train
  const cat = await mark(page, () => [...document.querySelectorAll('#tlBlocks .blocklyTreeRow')].find(r => /Train 1|Bramble/.test(r.textContent)) || document.querySelectorAll('#tlBlocks .blocklyTreeRow')[1]);
  S.s4a = await shot(page, DIR, 's4a', cat);
  await page.click(cat); await page.waitForTimeout(1000);
  const fly = await mark(page, () => document.querySelector('#tlBlocks .blocklyFlyout .blocklyDraggable'));
  S.s4b = await shot(page, DIR, 's4b', fly, { type: 'look' });
  await page.mouse.click(5, 400); await page.keyboard.press('Escape');
  // 5 a challenge
  S.s5a = await shot(page, DIR, 's5a', '#tlChal');
  await page.click('#tlChal'); await page.waitForSelector('[data-ch]'); await page.waitForTimeout(500);
  const card = await mark(page, () => document.querySelector('[data-ch]'));
  S.s5b = await shot(page, DIR, 's5b', card);
  await page.click(card); await page.waitForTimeout(800);
  if (await page.locator('#cj-dialog .cj-dlg-btn.ok').count()) { await page.click('#cj-dialog .cj-dlg-btn.ok'); await page.waitForTimeout(1000); }
  if (!(await page.evaluate(() => document.getElementById('tlModal').hidden))) await page.click('#tlMClose');
  await page.waitForTimeout(800);
  S.s5c = await shot(page, DIR, 's5c', '#tlCheck', { type: 'look' });
  // 6 print the challenge card
  await page.click('#tlChal'); await page.waitForSelector('#tlCardPrint'); await page.evaluate(() => document.getElementById('tlCardPrint').scrollIntoView({ block: 'center' })); await page.waitForTimeout(500);
  S.s6 = await shot(page, DIR, 's6', '#tlCardPrint');
  saveShots(DIR, S);
  console.log('shots', Object.keys(S).length, 'errors', errors);
} finally { await close(); }
