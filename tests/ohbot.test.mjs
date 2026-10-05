// The on-screen Ohbot (Stage): hidden unless ?ohbot=1, drawn in 3D (ohbot/ohbot-3d.js), and every motor block moves it.
import { ok, done, serve, browser, openApp } from './lib.mjs';
const site = await serve(), b = await browser(), errors = [];
const hasCat = page => page.evaluate(() => JSON.stringify(stageToolbox()).includes('"Ohbot"'));
const program = (page, steps) => page.evaluate(steps => {
  const ws = new Blockly.Workspace(); let prev = ws.newBlock('st_when_flag');
  for (const [t, f] of steps) { const bl = ws.newBlock(t); Object.entries(f).forEach(([k, v]) => bl.setFieldValue(String(v), k)); prev.nextConnection.connect(bl.previousConnection); prev = bl; }
  stageState.sprites[0].xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(ws)); stageSel = 99; stageStart(); for (let i = 0; i < 80; i++) stageFrame(); drawStage();
  return Object.assign({}, stageState.sprites[0]._ob);
}, steps);
try {
  {
    const { page } = await openApp(b, site.url, { errors });
    await page.evaluate(() => { startNewStage('ks2'); document.getElementById('tutorial').classList.add('hide'); });
    ok(!(await hasCat(page)) && !(await page.evaluate(() => pickableCostumes().includes('ohbot'))), 'the Ohbot is hidden on the normal site');
    await page.context().close();
  }
  const { page } = await openApp(b, site.url, { errors, page: '/build-and-play.html?ohbot=1' });
  await page.evaluate(() => { startNewStage('ks2'); document.getElementById('tutorial').classList.add('hide');
    const s = stageState.sprites[0]; s.costumes = [{ name: 'Ohbot', builtin: 'ohbot', color: '#1f3fbf' }]; s.costumeIdx = 0; renderSpritePanel(); stageNeedsDraw = true; });
  ok(await hasCat(page), '?ohbot=1 shows the Ohbot blocks');
  await page.waitForFunction(() => ohbot3d, null, { timeout: 30000 });
  ok(true, 'the 3D Ohbot loads when a sprite wears the Ohbot costume');
  const pix = () => page.evaluate(() => { drawStage(); const s = stageState.sprites[0], c = document.getElementById('gc').getContext('2d');
    const d = c.getImageData(s.x - 110, s.y - 116, 220, 220).data; let h = 0; for (let i = 0; i < d.length; i += 16) h = (h * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7) >>> 0; return h; });
  const before = await pix();
  const ob = await program(page, [['ob_move', { M: 'HeadTurn', N: 9 }], ['ob_change', { M: 'TopLip', N: 3 }], ['ob_move', { M: 'HeadRoll', N: 8 }], ['ob_eyecolor', { COLOR: '#ff3355' }]]);
  ok(ob.HeadTurn === 9 && ob.TopLip === 8 && ob.HeadRoll === 8 && ob.color === '#ff3355', 'move, change by, HeadRoll and eye colour blocks set the motors');
  ok((await pix()) !== before, 'the 3D head is drawn in its new pose');
  const r = await program(page, [['ob_move', { M: 'Lid', N: 10 }], ['ob_reset', {}]]);
  ok(r.HeadTurn === 5 && r.HeadRoll === 5 && r.Lid === 0 && r.color === null, 'reset puts every motor back');
  ok(await page.evaluate(() => { const s = stageState.sprites[0]; return stageSpriteAt(s.x + 60, s.y - 80) === 0; }), 'you can grab the whole 3D robot, not just its middle');
  ok(errors.length === 0, 'no errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
