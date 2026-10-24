// Teacher Guide · Platformer Lab (the four modes): screenshots of the real app → guide/tools/out/platformer/
import { join } from 'node:path';
import { openPage, shot, saveShots, startLab, mark, HERE } from './lib.mjs';
const DIR = join(HERE, 'out', 'platformer');
const S = {};
const { page, errors, close } = await openPage();
// the screen position of a grid cell (build view shows the whole level)
const cell = (c, r) => page.evaluate(([c, r]) => { const cv = document.getElementById('gc'), b = cv.getBoundingClientRect(); return { x: b.x + (c + 0.5) * b.width / COLS, y: b.y + (r + 0.5) * b.height / ROWS }; }, [c, r]);
const pick = label => page.click(`.pal-item[data-label="${label}"]`);
const tap = async (c, r) => { const p = await cell(c, r); await page.mouse.click(p.x, p.y); };
const drag = async (c0, c1, r) => { const a = await cell(c0, r), z = await cell(c1, r); await page.mouse.move(a.x, a.y); await page.mouse.down(); for (let c = c0; c <= c1; c++) { const p = await cell(c, r); await page.mouse.move(p.x, p.y, { steps: 3 }); } await page.mouse.up(); };
try {
  // 1 start
  await startLab(page, DIR, S, 's1', 'platformer');
  await page.waitForSelector('.pal-item[data-label="grass top"]');
  await page.waitForTimeout(600);
  await page.evaluate(() => document.getElementById('tutorial').classList.add('hide'));
  // 2 Build: pick a block, paint the grid
  const grass = await mark(page, () => document.querySelector('.pal-item[data-label="grass top"]'));
  S.s2a = await shot(page, DIR, 's2a', grass);
  await pick('grass top');
  await drag(0, 7, 11); await drag(11, 19, 11); await drag(5, 9, 8); await drag(13, 16, 6);
  await pick('gem'); await tap(7, 7); await tap(14, 5); await tap(15, 5);
  const area = await mark(page, () => document.getElementById('gc'));
  S.s2b = await shot(page, DIR, 's2b', area, { type: 'look' });
  // 3 Start and Finish
  await pick('start'); await tap(1, 10);
  await pick('finish'); await tap(18, 10);
  const fin = await mark(page, () => document.querySelector('.pal-item[data-label="finish"]'));
  S.s3 = await shot(page, DIR, 's3', fin);
  // 4 Play
  S.s4a = await shot(page, DIR, 's4a', '#btn-play');
  await page.click('#btn-play'); await page.mouse.move(640, 700); await page.waitForTimeout(700);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(900); await page.keyboard.press('Space'); await page.waitForTimeout(500);
  S.s4b = await shot(page, DIR, 's4b', '#gc', { type: 'look', wait: 50 });
  await page.keyboard.up('ArrowRight');
  // 5 Code
  S.s5a = await shot(page, DIR, 's5a', '#btn-code');
  await page.click('#btn-code'); await page.waitForTimeout(1200);
  await page.mouse.move(640, 700);
  await page.evaluate(() => { blocklyWorkspace.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(`<xml xmlns="https://developers.google.com/blockly/xml"><block type="when_key_pressed" x="20" y="20"><field name="KEY">left</field><next><block type="player_move_left"></block></next></block><block type="when_key_pressed" x="230" y="20"><field name="KEY">right</field><next><block type="player_move_right"></block></next></block><block type="when_collect_gem" x="20" y="150"><next><block type="change_score"><value name="N"><shadow type="math_number"><field name="NUM">10</field></shadow></value><next><block type="show_message"><value name="MSG"><shadow type="text"><field name="TEXT">Gem!</field></shadow></value></block></next></block></next></block></xml>`), blocklyWorkspace); });
  await page.waitForTimeout(400);
  const gemHat = await mark(page, () => blocklyWorkspace.getTopBlocks(true).find(b => b.type === 'when_collect_gem').getSvgRoot());
  S.s5b = await shot(page, DIR, 's5b', gemHat, { type: 'look' });
  // 6 Design
  S.s6a = await shot(page, DIR, 's6a', '#btn-design');
  await page.click('#btn-design'); await page.mouse.move(640, 700); await page.waitForTimeout(900);
  S.s6b = await shot(page, DIR, 's6b', await mark(page, () => document.querySelector('#design-modal canvas') || document.getElementById('design-box')), { type: 'look' });
  saveShots(DIR, S);
  console.log('shots', Object.keys(S).length, 'errors', errors);
} finally { await close(); }
