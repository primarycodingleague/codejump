// Teacher Guide · Turtle Lab: screenshots of the real app → guide/tools/out/turtle/
import { join } from 'node:path';
import { openPage, shot, saveShots, startLab, HERE } from './lib.mjs';
const DIR = join(HERE, 'out', 'turtle');
const { page, errors, close } = await openPage();
const S = {};
const type = async code => { await page.fill('#turtle-code', code); };
const run = async () => { await page.click('#tt-run'); await page.waitForFunction(() => /Done/.test(document.getElementById('turtle-status').textContent), null, { timeout: 30000 }); };
try {
  // 1 start a Turtle Lab project
  await startLab(page, DIR, S, 's1', 'turtle');
  await page.waitForSelector('body.turtle-mode #turtle-code');
  await page.evaluate(() => { document.getElementById('turtle-speed').value = 10; document.getElementById('turtle-speed').dispatchEvent(new Event('input')); });
  // 2 type commands, press Run
  await type('fd 100\nrt 90\nfd 100');
  S.s2a = await shot(page, DIR, 's2a', '#turtle-code', { type: 'look' });
  await run();
  S.s2b = await shot(page, DIR, 's2b', '#tt-run');
  // 3 repeat
  await type('repeat 4 [fd 150 rt 90]');
  await page.click('#tt-clear').catch(() => {});
  await run();
  S.s3a = await shot(page, DIR, 's3a', '#turtle-code', { type: 'look' });
  await type('setpencolor "red\nrepeat 36 [repeat 4 [fd 120 rt 90] rt 10]');
  await run();
  S.s3b = await shot(page, DIR, 's3b', '#turtle-canvas', { type: 'look' });
  // 4 Commands and Examples
  await page.click('#tt-cmds'); await page.waitForTimeout(400);
  S.s4a = await shot(page, DIR, 's4a', '#tt-cmds');
  await page.evaluate(() => document.getElementById('turtle-modal').classList.add('hide'));
  await page.click('#tt-examples'); await page.waitForTimeout(400);
  S.s4b = await shot(page, DIR, 's4b', '#tt-examples');
  await page.evaluate(() => document.getElementById('turtle-modal').classList.add('hide'));
  // 5 speed
  await page.evaluate(() => { const s = document.getElementById('turtle-speed'); s.value = 3; s.dispatchEvent(new Event('input')); });
  S.s5 = await shot(page, DIR, 's5', '#turtle-speed');
  await page.evaluate(() => { const s = document.getElementById('turtle-speed'); s.value = 10; s.dispatchEvent(new Event('input')); });
  // 6 your own command
  await type('to star :size\n  repeat 5 [fd :size rt 144]\nend\n\nsetpencolor "blue\nstar 150\npu fd 40 pd\nsetpencolor "orange\nstar 60');
  await run();
  S.s6a = await shot(page, DIR, 's6a', '#turtle-code', { type: 'look' });
  S.s6b = await shot(page, DIR, 's6b', '#turtle-canvas', { type: 'look' });
  saveShots(DIR, S);
  console.log('shots', Object.keys(S).length, 'errors', errors);
} finally { await close(); }
