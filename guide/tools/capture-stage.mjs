// Teacher Guide · Stage Lab: screenshots of the real app → guide/tools/out/stage/
import { join } from 'node:path';
import { openPage, shot, saveShots, startLab, mark, HERE } from './lib.mjs';
const DIR = join(HERE, 'out', 'stage');
const S = {};
const PROGRAM = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="st_when_flag" x="30" y="30"><next><block type="st_say_secs"><field name="TXT">Welcome to the show!</field><field name="SECS">2</field><next>
<block type="st_repeat"><field name="N">12</field><statement name="DO"><block type="st_move"><field name="N">12</field><next><block type="st_next_costume"><next>
<block type="st_wait"><field name="N">0.15</field></block></next></block></next></block></statement></block></next></block></next></block></xml>`;
{
  const { page, errors, close } = await openPage();
  try {
    // 1 start a Stage Lab project (Key Stage 2)
    await startLab(page, DIR, S, 's1', 'stage');
    await page.waitForFunction(() => document.body.classList.contains('stage-mode') && typeof blocklyWorkspace !== 'undefined' && blocklyWorkspace);
    await page.waitForTimeout(800);
    // 2 snap blocks together
    const motion = await mark(page, () => [...document.querySelectorAll('.blocklyTreeRow')].find(r => /Motion/.test(r.textContent)));
    S.s2a = await shot(page, DIR, 's2a', motion);
    await page.evaluate(x => { blocklyWorkspace.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x), blocklyWorkspace); stageSaveCurrent(); }, PROGRAM);
    await page.waitForTimeout(400);
    const hat = await mark(page, () => blocklyWorkspace.getTopBlocks()[0].getSvgRoot());
    S.s2b = await shot(page, DIR, 's2b', hat, { type: 'look' });
    // 3 press Run
    S.s3a = await shot(page, DIR, 's3a', '#st-run');
    await page.click('#st-run');
    await page.waitForTimeout(1200);
    S.s3b = await shot(page, DIR, 's3b', '#stage-canvas-holder', { type: 'look' });
    await page.waitForTimeout(2600);
    S.s3c = await shot(page, DIR, 's3c', '#stage-canvas-holder', { type: 'look' });
    await page.click('#st-stop');
    // 4 add a character and choose its costume
    S.s4a = await shot(page, DIR, 's4a', '#add-sprite');
    await page.click('#add-sprite'); await page.waitForTimeout(400);
    await page.click('#cm-costume-btn'); await page.waitForTimeout(600);
    S.s4b = await shot(page, DIR, 's4b', '#cm-costume-btn');
    await page.evaluate(() => document.getElementById('costume-modal').classList.add('hide'));
    // 5 choose a backdrop
    S.s5a = await shot(page, DIR, 's5a', '#sp-backdrops');
    await page.click('#sp-backdrops'); await page.waitForTimeout(400);
    await page.click('#bd-add-lib'); await page.waitForTimeout(600);
    const lib = await mark(page, () => document.querySelectorAll('#bd-lib > *')[2] || document.querySelector('#bd-lib > *'));
    S.s5b = await shot(page, DIR, 's5b', lib);
    await page.click(lib); await page.waitForTimeout(500);
    await page.evaluate(() => { document.getElementById('backdrop-modal').classList.add('hide'); drawStage(); });
    await page.waitForTimeout(300);
    S.s5c = await shot(page, DIR, 's5c', '#stage-canvas-holder', { type: 'look' });
    console.log('ks2 errors', errors);
  } finally { await close(); }
}
{
  // 6 Key Stage 1: picture blocks
  const { page, errors, close } = await openPage();
  try {
    await startLab(page, DIR, {}, 'x', 'stage', 'ks1');
    await page.waitForSelector('body.ks1-mode #ks1-palette .ks1-block');
    await page.waitForTimeout(600);
    await page.evaluate(() => { ks1AddBlock('flag'); });
    await page.click('#ks1-cats > *:nth-child(2)'); await page.waitForTimeout(300);
    const right = await mark(page, () => document.querySelector('#ks1-palette .ks1-block'));
    S.s6a = await shot(page, DIR, 's6a', right);
    await page.evaluate(() => { ks1AddBlock('right'); ks1AddBlock('hop'); ks1AddBlock('right'); });
    await page.waitForTimeout(400);
    S.s6b = await shot(page, DIR, 's6b', '#ks1-scripts', { type: 'look' });
    console.log('ks1 errors', errors);
  } finally { await close(); }
}
saveShots(DIR, S);
console.log('shots', Object.keys(S).length);
