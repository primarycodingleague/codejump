// Teacher Guide · Critter Lab: screenshots of the real app → guide/tools/out/critter/
import { join } from 'node:path';
import { openPage, shot, saveShots, startLab, mark, HERE } from './lib.mjs';
const DIR = join(HERE, 'out', 'critter');
const S = {};
const { page, errors, close } = await openPage();
page.setDefaultTimeout(120000);
try {
  // 1 start
  await startLab(page, DIR, S, 's1', 'critter');
  await page.waitForSelector('#zLimbs .zl-part', { timeout: 120000 });
  await page.waitForTimeout(2500);
  // 2 build: drag a pair of walking legs onto the body
  const leg = await mark(page, () => document.querySelector('#zLimbs .zl-part'));
  S.s2a = await shot(page, DIR, 's2a', leg);
  const from = await page.locator(leg).boundingBox(), cv = await page.locator('#buildCanvas').boundingBox();
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2); await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(from.x + (cv.x + cv.width * 0.5 - from.x) * i / 12, from.y + (cv.y + cv.height * 0.55 - from.y) * i / 12);
  await page.mouse.up(); await page.mouse.move(cv.x + cv.width - 20, cv.y + 20);
  await page.waitForTimeout(1500);
  S.s2b = await shot(page, DIR, 's2b', '#buildCanvas', { type: 'look' });
  // 3 a Starter Critter
  S.s3a = await shot(page, DIR, 's3a', '#zStarters');
  await page.click('#zStarters'); await page.waitForSelector('[data-open]'); await page.waitForTimeout(800);
  S.s3b = await shot(page, DIR, 's3b', '[data-open="scuttler"]');
  await page.click('[data-open="scuttler"]'); await page.mouse.move(cv.x + cv.width - 20, cv.y + 20); await page.waitForTimeout(2000);
  S.s3c = await shot(page, DIR, 's3c', '#buildCanvas', { type: 'look' });
  // 4 Test it! and pick a contest
  S.s4a = await shot(page, DIR, 's4a', '.zl-mode[data-mode=test]');
  await page.click('.zl-mode[data-mode=test]'); await page.waitForTimeout(2500);
  // Test it! starts a run by itself; stop it so the shots show Go! being pressed
  await page.waitForFunction(() => critterApp._state().running, null, { timeout: 60000 }).catch(() => {});
  if (await page.evaluate(() => critterApp._state().running)) { await page.click('#zGo'); await page.waitForTimeout(500); }
  S.s4b = await shot(page, DIR, 's4b', '.zl-contest[data-c=sprint]');
  // 5 Go!
  S.s5a = await shot(page, DIR, 's5a', '#zGo');
  await page.check('#zTurbo');
  await page.click('#zGo'); await page.mouse.move(cv.x + cv.width - 20, cv.y + 20);
  await page.waitForTimeout(2500);
  S.s5b = await shot(page, DIR, 's5b', '#zHud', { type: 'look', wait: 50 });
  await page.waitForFunction(() => !document.getElementById('zResult')?.hidden, null, { timeout: 120000 });
  await page.waitForTimeout(800);
  S.s5c = await shot(page, DIR, 's5c', '#zResult', { type: 'look' });
  // 6 Results
  S.s6a = await shot(page, DIR, 's6a', '#zResults');
  await page.click('#zResults'); await page.waitForTimeout(1200);
  S.s6b = await shot(page, DIR, 's6b', await mark(page, () => document.querySelector('dialog[open] table') || document.querySelector('dialog[open]')), { type: 'look' });
  saveShots(DIR, S);
  console.log('shots', Object.keys(S).length, 'errors', errors);
} finally { await close(); }
