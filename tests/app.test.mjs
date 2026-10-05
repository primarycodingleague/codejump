// The app in a real browser: it loads cleanly, every project type starts, projects save, share and reopen, and the
// move from the old address brings saved games across. The cloud is a stand-in answered inside the test.
import { serve, browser, openApp, ok, done, sleep } from './lib.mjs';

const site = await serve();
const b = await browser();
const errors = [];
const shares = {}, moves = {};
const cloud = async (path, method, body) => {
  if (path === '/share' && method === 'POST') { const code = 'abc' + (Object.keys(shares).length + 1000); shares[code] = JSON.parse(body).payload; return { json: { code } }; }
  let m = /^\/share\/(\w+)$/.exec(path); if (m) return shares[m[1]] ? { json: { payload: shares[m[1]] } } : { status: 404, json: { error: 'not found' } };
  m = /^\/move\/(\w+)$/.exec(path); if (m) { const d = moves[m[1]]; delete moves[m[1]]; return d ? { json: { data: d } } : { status: 404, json: {} }; }
  return { status: 404, json: { error: 'not in this test' } };
};

try {
  const { page } = await openApp(b, site.url, { errors, cloud });
  await sleep(1500);
  ok(await page.evaluate(() => !document.getElementById('home').classList.contains('hide')), 'the home page shows');
  ok(errors.length === 0, 'no errors while loading' + (errors.length ? ': ' + errors.join(' | ') : ''));

  // ---- every project type starts
  await page.evaluate(() => startNewProject('ks2'));
  ok(await page.evaluate(() => projectType === 'platformer' && !document.getElementById('app').classList.contains('hide')), 'Platformer opens');
  await page.evaluate(() => { grid[5][5] = T.STAR; markDirty(); });
  const plat = await page.evaluate(() => JSON.stringify(buildPayload()));

  await page.evaluate(() => startNewStage('ks2'));
  await page.waitForFunction(() => document.body.classList.contains('stage-mode') && typeof blocklyWorkspace !== 'undefined' && blocklyWorkspace && blocklyWorkspace.getAllBlocks(false).length > 0, null, { timeout: 20000 });
  ok(true, 'Stage (KS2) opens with its blocks');
  await page.evaluate(() => { stageStart(); for (let i = 0; i < 30; i++) stageFrame(); stageStop(); });
  ok(errors.length === 0, 'the Stage program runs and stops' + (errors.length ? ': ' + errors.join(' | ') : ''));
  const stage = await page.evaluate(() => JSON.stringify(buildPayload()));

  await page.evaluate(() => startNewStage('ks1'));
  ok(await page.evaluate(() => document.body.classList.contains('ks1-mode') && !document.getElementById('ks1-ui').classList.contains('hide')), 'Stage (KS1, picture blocks) opens');

  await page.evaluate(() => startNewTurtle('ks2'));
  await page.evaluate(() => { document.getElementById('turtle-code').value = 'repeat 4 [fd 80 rt 90]'; turtleSpeed = 10; turtleRun(); });
  await page.waitForFunction(() => /Done/.test(document.getElementById('turtle-status').textContent), null, { timeout: 10000 }).catch(() => {});
  ok(await page.evaluate(() => /Done/.test(document.getElementById('turtle-status').textContent)), 'Turtle draws a square (' + await page.evaluate(() => document.getElementById('turtle-status').textContent.trim()) + ')');

  await page.evaluate(() => startNewCritter('ks2'));
  await page.waitForFunction(() => critterApp && document.getElementById('buildCanvas') && document.getElementById('buildCanvas').clientWidth > 0, null, { timeout: 30000 });
  ok(true, 'Critter Lab opens');
  const critter = await page.evaluate(() => JSON.stringify(buildPayload()));

  await page.evaluate(() => startNew3D('ks2'));
  await page.waitForFunction(() => worldApp && worldApp._world && worldApp._world() && worldApp._world().editing() && worldApp._world().objects().length >= 6, null, { timeout: 60000 });
  ok(true, '3D World opens with the starter world');
  const world = await page.evaluate(() => JSON.stringify(buildPayload()));
  ok(errors.length === 0, 'no errors starting the project types' + (errors.length ? ': ' + errors.join(' | ') : ''));

  // ---- every project reopens from its saved payload
  for (const [name, json, type] of [['Platformer', plat, 'platformer'], ['Stage', stage, 'stage'], ['Critter', critter, 'critter'], ['3D World', world, '3d']]) {
    await page.evaluate(j => applyPayload(JSON.parse(j)), json);
    await sleep(500);
    ok(await page.evaluate(t => projectType === t, type), name + ' reopens from its save');
  }
  await page.evaluate(j => applyPayload(JSON.parse(j)), plat);
  ok(await page.evaluate(() => grid[5][5] === T.STAR && T.STAR > 0), 'the platformer kept the star placed on it');

  // ---- device save, then load from the home screen
  await page.evaluate(() => { saveCurrentLevel(); });
  await page.waitForSelector('.cj-dlg-input'); await page.fill('.cj-dlg-input', 'Test game'); await page.click('.cj-dlg-btn.ok');
  await sleep(300);
  ok(await page.evaluate(() => getSaves().some(s => s.name === 'Test game')), 'Save keeps the game on this device');
  await page.evaluate(() => { showHome(); renderHomeSaves(); });
  ok(await page.evaluate(() => [...document.querySelectorAll('#home-saves .save-item')].some(e => /Test game/.test(e.textContent))), 'the saved game shows under My projects');

  // ---- share link → open it in a fresh browser
  await page.evaluate(j => applyPayload(JSON.parse(j)), stage);
  await page.evaluate(() => { window.__copied = null; copyText = t => { window.__copied = t; }; return copyShareLink(); });
  const link = await page.evaluate(() => window.__copied);
  ok(/^https:\/\/codejump\.co\.uk\/\?s=\w+$/.test(link || ''), 'Share makes a short codejump.co.uk link (' + link + ')');
  const code = link && link.split('?s=')[1];
  const { page: p2 } = await openApp(b, site.url, { errors, cloud, page: '/build-and-play.html?s=' + code });
  await p2.waitForFunction(() => projectType === 'stage' && document.body.classList.contains('stage-mode'), null, { timeout: 20000 }).catch(() => {});
  ok(await p2.evaluate(() => projectType === 'stage'), 'opening the share link shows the shared Stage project');

  // ---- arriving from the old address brings saved games across
  moves.cafe1234cafe1234 = { bap_saves: JSON.stringify([JSON.parse(plat)].map(s => Object.assign(s, { id: '42', name: 'Moved game' }))), bap_a11y: '{"bigtext":true}' };
  const { page: p3 } = await openApp(b, site.url, { errors, cloud, page: '/build-and-play.html?cjmove=cafe1234cafe1234' });
  await p3.waitForFunction(() => getSaves().some(s => s.name === 'Moved game'), null, { timeout: 10000 }).catch(() => {});
  ok(await p3.evaluate(() => getSaves().some(s => s.name === 'Moved game')), 'a game saved at the old address arrives');
  ok(await p3.evaluate(() => !location.search.includes('cjmove') && localStorage.getItem('bap_a11y') === '{"bigtext":true}'), 'settings come too, and the code leaves the address bar');

  ok(errors.length === 0, 'no errors anywhere' + (errors.length ? ': ' + errors.join(' | ') : ''));
} catch (e) {
  ok(false, 'the browser test stopped: ' + (e && e.message));
} finally {
  await b.close(); site.close();
}
done();
