// Teacher Guide · AI Lab: screenshots of the real app → guide/tools/out/ai/
import { join } from 'node:path';
import { openPage, shot, saveShots, startLab, HERE } from './lib.mjs';
const DIR = join(HERE, 'out', 'ai');
const S = {};
const { page, errors, close } = await openPage();
page.setDefaultTimeout(120000);
// draw on a pad with the mouse: pts in 0–1 of the pad
async function draw(sel, strokes) {
  const b = await page.locator(sel).boundingBox();
  for (const st of strokes) {
    await page.mouse.move(b.x + st[0][0] * b.width, b.y + st[0][1] * b.height); await page.mouse.down();
    for (const [x, y] of st.slice(1)) await page.mouse.move(b.x + x * b.width, b.y + y * b.height, { steps: 4 });
    await page.mouse.up();
  }
}
const circle = (cx, cy, r) => [Array.from({ length: 25 }, (_, i) => [cx + r * Math.cos(i / 24 * 2 * Math.PI), cy + r * Math.sin(i / 24 * 2 * Math.PI)])];
const tri = [[[0.5, 0.18], [0.82, 0.8], [0.18, 0.8], [0.5, 0.18]]];
try {
  await startLab(page, DIR, S, 's1', 'ai');
  await page.waitForSelector('#alSamples');
  await page.waitForTimeout(1200);
  // 2 labels + ready-made examples
  S.s2a = await shot(page, DIR, 's2a', '#alSamples');
  await page.selectOption('#alSamples', 'shapes'); await page.waitForTimeout(1200);
  S.s2b = await shot(page, DIR, 's2b', '#alLabels', { type: 'look' });
  // 3 draw an example and add it
  await draw('#alTeachPad', circle(0.5, 0.5, 0.33)); await page.waitForTimeout(500);
  S.s3a = await shot(page, DIR, 's3a', '#alTeachSees', { type: 'look' });
  S.s3b = await shot(page, DIR, 's3b', '#alAddEx');
  await page.click('#alAddEx'); await page.waitForTimeout(400);
  // 4 train
  await page.click('#alTabTrain'); await page.waitForTimeout(600);
  S.s4a = await shot(page, DIR, 's4a', '#alTrain');
  await page.click('#alTrain');
  await page.waitForFunction(() => !aiApp._training || !aiApp._training(), null, { timeout: 120000 }).catch(() => {});
  await page.waitForTimeout(2500);
  S.s4b = await shot(page, DIR, 's4b', '#alResult', { type: 'look' });
  // 5 test it
  await draw('#alTestPad', tri); await page.waitForTimeout(1500);
  S.s5 = await shot(page, DIR, 's5', '#alGuess', { type: 'look' });
  // 6 code it
  await page.click('#alTabCode'); await page.waitForTimeout(1500);
  S.s6a = await shot(page, DIR, 's6a', '#alRun');
  await page.click('#alRun'); await page.waitForTimeout(1500);
  await draw('#alPlayPad', circle(0.5, 0.5, 0.3)); await page.waitForTimeout(2600);
  S.s6b = await shot(page, DIR, 's6b', '#alBubble', { type: 'look' });
  saveShots(DIR, S);
  console.log('shots', Object.keys(S).length, 'errors', errors);
} finally { await close(); }
