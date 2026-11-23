// App Lab: the model in Node (starter apps, cleaning, Check my app, goals), the runtime in a browser (every starter app runs,
// remember, screens, sliders), the editor (starter chooser, drag a part on, move it, rename it and its blocks follow, Run,
// Code, Check my app, Put it on my phone with a QR code, save/reopen) and the phone player (app/?s= and app/#a=).
import { join } from 'node:path';
import { serve, browser, openApp, ok, done, sleep, ROOT } from './lib.mjs';

const M = await import(join(ROOT, 'app', 'app-model.js'));

// ── model ──
for (const k of M.STARTER_KEYS) {
  const p = M.newProject(k);
  ok(JSON.stringify(M.cleanProject(JSON.parse(JSON.stringify(p)))) === JSON.stringify(p), k + ': cleaning a saved app changes nothing');
  ok(M.checkApp(p).every(x => x.level !== 'warn'), k + ': the starter app passes Check my app' + M.checkApp(p).filter(x => x.level === 'warn').map(x => ' · ' + x.text).join(''));
  const ids = new Set(M.allParts(p).map(x => x.id)); let bad = 0;
  M.eachBlock(p.code, b => { const f = b.fields || {}; if (f.PART && !ids.has(f.PART)) bad++; if (f.SCREEN && !p.app.order.includes(f.SCREEN)) bad++; });
  ok(!bad, k + ': every block names a part or screen that is in the app');
}
{
  const p = M.newProject('kind'), s = p['s' + p.app.order[0]], bad = JSON.parse(JSON.stringify(p));
  const bs = bad['s' + p.app.order[0]];
  bs.parts.push({ t: 'script', text: 'x' }, { t: 'button', id: bs.parts[0].id, name: 'KindButton', color: 'red;background:url(x)', x: 99999, w: -5, text: '<img src=x onerror=alert(1)>' });
  bs.parts[0].src = 'https://evil.example/x.png'; bs.bg = 'url(javascript:x)'; bad.imgs.zzzzzz = 'data:text/html;base64,PHNjcmlwdD4=';
  const c = M.cleanProject(bad), cs = c['s' + c.app.order[0]];
  const nb = cs.parts[cs.parts.length - 1];
  ok(cs.parts.length === s.parts.length + 1 && nb.id !== bs.parts[0].id && nb.name !== 'KindButton' && nb.color === '#ffffff' && nb.x <= M.PHONE.w && nb.w >= 16, 'cleanProject drops unknown parts and fixes a copied id, a taken name, a bad colour and an off-screen size');
  ok(cs.bg === '#ffffff' && !c.imgs.zzzzzz && cs.parts[0].src === 'lib:star', 'cleanProject drops a bad background, a bad picture and a picture from another website');
  ok(nb.text === '<img src=x onerror=alert(1)>', 'words are kept as words (they are drawn with textContent, never as HTML)');
  const huge = JSON.parse(JSON.stringify(p)); huge.code.blocks.blocks.blocks.push({ type: 'text', fields: { TEXT: 'x'.repeat(700000) } });
  ok(M.cleanProject(huge).code.blocks === null, 'code that is far too big is not kept');
  const p2 = M.newProject('blank'); p2['s' + p2.app.order[0]].parts.push(M.partOf(p2, 'button', undefined, { color: '#ffff00', bg: '#ffffff' }));
  const ch = M.checkApp(p2);
  ok(ch.some(x => /hard to read/.test(x.text)) && ch.some(x => /doesn't do anything yet/.test(x.text)), 'Check my app finds unreadable words and a button with no code');
  const g = M.cleanGoals({ title: 'Goals', list: [{ type: 'screens', n: 2, text: '2 screens' }, { type: 'remember', text: 'remember' }, { type: 'pressed', n: 2, text: '2 buttons work' }, { type: 'sound', n: 1, text: 'a sound' }] });
  ok(JSON.stringify(M.checkGoals(g, M.newProject('kind')).map(x => x.ok)) === '[true,true,true,true]' && JSON.stringify(M.checkGoals(g, M.newProject('blank')).map(x => x.ok)) === '[false,false,false,false]', 'goals tick for the Kindness counter and not for an empty app');
  ok(M.addScreen(p, 'Three') && p.app.order.length === 3 && M.removeScreen(p, p.app.order[2]) && p.app.order.length === 2, 'screens can be added and deleted');
}

// ── the app ──
const site = await serve(), b = await browser(), errors = [];
const shares = [];
const cloud = async (path, method, body) => {
  if (path === '/share' && method === 'POST') { shares.push(JSON.parse(body).payload); return { json: { code: 'APP' + shares.length } }; }
  const m = /^\/share\/(.+)$/.exec(path); if (m) { const i = +m[1].replace('APP', '') - 1; return shares[i] ? { json: { payload: shares[i] } } : { status: 404, json: { error: 'not found' } }; }
  return { status: 404, json: {} };
};
const { ctx, page } = await openApp(b, site.url, { errors, cloud });
await page.setViewportSize({ width: 1366, height: 860 });
const P = () => page.evaluate(() => appLabApp._proj());

// the runtime: every starter app, pressed three times
const rt = await page.evaluate(async () => {
  const M = await import('./app/app-model.js'), R = await import('./app/app-run.js'), host = document.createElement('div'); document.body.appendChild(host);
  const store = { m: {}, getItem(k) { return k in this.m ? this.m[k] : null; }, setItem(k, v) { this.m[k] = String(v); } }, out = {};
  for (const k of M.STARTER_KEYS) {
    const p = M.newProject(k), sounds = [], r = R.createRunner(host, p, { mute: true, sounds, store });
    r.start(); await new Promise(z => setTimeout(z, 30));
    const btn = M.allParts(p).find(x => x.t === 'button' && x.screen === p.app.order[0]);
    for (let i = 0; i < 3 && btn; i++) { r.press(btn.id); await new Promise(z => setTimeout(z, 20)); }
    out[k] = { vars: r.vars(), sounds: sounds.length, screen: r.screen() };
    if (k === 'kind') { for (let i = 0; i < 7; i++) { r.press('btnone'); await new Promise(z => setTimeout(z, 20)); } out.kind10 = r.screen(); r.start(); await new Promise(z => setTimeout(z, 30)); out.kindAgain = r.state('lbltwo').text; }
    if (k === 'pet') { r.change('psldaa', 9); await new Promise(z => setTimeout(z, 30)); out.pet9 = r.state('plblaa').text; }
    if (k === 'dice') { const seen = new Set(); for (let i = 0; i < 60; i++) { r.press('dbtnaa'); await new Promise(z => setTimeout(z, 2)); seen.add(r.vars().roll); } out.dice = [...seen].sort().join(''); }
    r.stop();
  }
  host.remove(); return out;
});
ok(rt.kind.vars.count === 3 && rt.kind10 === 'scrtwo' && rt.kindAgain === '10', 'Kindness counter: counts, goes to Screen 2 at 10, and remembers the count next time');
ok(rt.quiz.vars.score === 0 && rt.quiz.sounds === 3, 'Quiz: a wrong answer buzzes and scores nothing');
ok(rt.sounds.sounds === 3 && rt.pet.vars.happy === 10 && rt.pet9 === 'Happiness: 9', 'Soundboard plays; the pet’s happiness stops at 10 and the slider shows it');
ok(rt.dice === '123456', 'the dice rolls every number from 1 to 6 and nothing else: ' + rt.dice);

// the editor
await page.evaluate(() => document.getElementById('pt-modal').classList.add('hide'));
await page.click('#h-new'); await page.click('#ks-modal [data-ks=ks1]');
ok(!(await page.isVisible('#pt-modal .ks-opt[data-pt="applab"]')), 'the App Lab isn’t offered for Key Stage 1');
await page.evaluate(() => document.getElementById('pt-modal').classList.add('hide'));
await page.click('#h-new'); await page.click('#ks-modal [data-ks=ks2]'); await page.click('#pt-modal .ks-opt[data-pt="applab"]');
await page.waitForSelector('.al-starter', { timeout: 30000 });
ok(await page.evaluate(() => projectType === 'applab' && document.body.classList.contains('applab-mode')) && (await page.$$('.al-starter')).length === M.STARTER_KEYS.length, 'Start building → App Lab opens the lab and offers the starter apps');
await page.click('[data-starter="kind"]'); await sleep(300);
let p = await P();
ok(p.app.title === 'Kindness counter' && await page.isVisible('#alHost [data-pid="btnone"]'), 'the Kindness counter opens on the phone');
// drag a part from the palette onto the phone
const tile = await page.locator('[data-add="switch"]').boundingBox(), ph = await page.locator('#alHost').boundingBox();
await page.mouse.move(tile.x + 20, tile.y + 20); await page.mouse.down(); await page.mouse.move(ph.x + ph.width / 2, ph.y + ph.height * 0.85, { steps: 8 }); await page.mouse.up(); await sleep(300);
p = await P(); let sw = p.sscrone.parts.find(x => x.t === 'switch');
ok(sw && sw.name === 'Switch1' && sw.y > 400 && sw.x >= 0 && sw.x + sw.w <= M.PHONE.w && await page.evaluate(() => appLabApp._sel()) === sw.id, 'dragging Switch onto the phone puts Switch1 where it was dropped, on the screen, and chooses it');
// move a part by dragging it
const kb = await page.locator('#alHost [data-pid="btnone"]').boundingBox();
await page.mouse.move(kb.x + kb.width / 2, kb.y + kb.height / 2); await page.mouse.down(); await page.mouse.move(kb.x + kb.width / 2, kb.y + kb.height / 2 - 60, { steps: 6 }); await page.mouse.up(); await sleep(200);
p = await P(); ok(p.sscrone.parts.find(x => x.id === 'btnone').y < 380, 'dragging a part moves it');
// rename: the blocks follow
await page.fill('.al-right [data-name]', 'BigKindButton'); await page.press('.al-right [data-name]', 'Tab'); await sleep(200);
await page.click('.al-right [data-act="code"]'); await sleep(1200);
ok(await page.evaluate(() => { const ws = appLabApp._blocks(), sel = Blockly.getSelected && Blockly.getSelected(); return !!ws && sel && sel.type === 'app_when_pressed' && sel.getFieldValue('PART') === 'btnone' && sel.getField('PART').getText() === 'BigKindButton'; }), 'renaming a part renames it in its blocks, and “Code: when it’s pressed” finds its script');
// change a block, then run: the app counts in 2s
await page.evaluate(() => { const c = appLabApp._blocks().getAllBlocks(false).find(b => b.type === 'math_change'); c.getInputTargetBlock('DELTA').setFieldValue(2, 'NUM'); });
await sleep(500); await page.click('#alRun'); await sleep(300);
for (let i = 0; i < 3; i++) { await page.click('#alHost [data-pid="btnone"]'); await sleep(120); }
ok((await page.textContent('#alHost [data-pid="lbltwo"]')) === '6' && await page.evaluate(() => document.querySelector('.al').classList.contains('running')), 'Run uses the edited blocks: three presses count to 6');
await page.click('#alRun'); await sleep(200);
ok(!(await page.evaluate(() => appLabApp._runner())), 'Stop stops the app');
// a block for the new switch
await page.evaluate(id => appLabApp._codeFor(id), sw.id); await sleep(400);
ok(await page.evaluate(id => appLabApp._blocks().getTopBlocks(false).some(b => b.type === 'app_when_changed' && b.getFieldValue('PART') === id), sw.id), 'a switch gets a “when Switch1 is changed” script');
// back to Design: Check my app
await page.click('.al-tab[data-tab="design"]'); await sleep(200);
await page.click('#alCheck'); await sleep(200);
ok(/Check my app/.test(await page.textContent('.al-pop')), 'Check my app opens'); await page.keyboard.press('Escape');
// Put it on my phone: a short link and a QR code
await page.evaluate(() => { cloudToken = null; });
await page.click('#alPhone'); await page.waitForSelector('#alLink', { timeout: 10000 });
const link = await page.inputValue('#alLink');
ok(/\/app\/\?s=APP1$/.test(link) && await page.isVisible('#alQR canvas') && shares[0].projectType === 'applab' && shares[0].applab.app.title === 'Kindness counter', 'Put it on my phone makes a short link and a QR code: ' + link);
await page.keyboard.press('Escape');
// save and reopen
const pl = await page.evaluate(() => buildPayload());
await page.evaluate(d => applyPayload(d), JSON.parse(JSON.stringify(pl))); await sleep(800);
p = await P(); ok(p.sscrone.parts.some(x => x.name === 'BigKindButton') && JSON.stringify(p.code).includes('app_when_changed'), 'a saved app reopens with its parts and code');
// the phone player
const ph2 = await ctx.newPage(); ph2.on('pageerror', e => errors.push('player: ' + e.message));
await ph2.route(/codejump-cloud\./, async r => { const u = new URL(r.request().url()), x = await cloud(u.pathname, r.request().method(), r.request().postData()); return r.fulfill({ status: x.status || 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(x.json || {}) }); });
await ph2.setViewportSize({ width: 390, height: 844 });
await ph2.goto(link.replace(/^https:\/\/codejump\.co\.uk/, site.url)); await ph2.waitForSelector('[data-pid="btnone"]', { timeout: 10000 });
await ph2.click('[data-pid="btnone"]'); await sleep(150);
ok((await ph2.title()) === 'Kindness counter' && (await ph2.textContent('[data-pid="lbltwo"]')) === '2' && await ph2.evaluate(() => !!document.querySelector('link[rel=manifest]') && !!document.querySelector('link[rel=apple-touch-icon]')), 'the link opens the app full screen on a phone, ready to add to the home screen');
await ph2.reload(); await ph2.waitForSelector('[data-pid="btnone"]'); await sleep(150);
ok((await ph2.textContent('[data-pid="lbltwo"]')) === '2', 'remember keeps the count on the phone');
const small = Buffer.from(JSON.stringify(M.newProject('quiz'))).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
await ph2.goto(site.url + '/app/#a=' + small); await ph2.waitForSelector('[data-pid="qbtnbb"]'); await ph2.click('[data-pid="qbtnbb"]'); await sleep(150);
ok(/Jupiter/.test(await ph2.textContent('[data-pid="qlblbb"]')), 'an app packed into the link (#a=) opens too');
await ph2.goto(site.url + '/app/?s=APP99'); await sleep(800);
ok(/can’t be opened/.test(await ph2.textContent('#note')), 'a link to an app that isn’t there says so');
await ph2.close();
// phone width
await page.setViewportSize({ width: 390, height: 844 }); await sleep(300);
ok(await page.evaluate(() => document.documentElement.scrollWidth <= 400 || document.getElementById('applab-ui').scrollWidth <= 400), 'the lab fits a phone screen');
await page.setViewportSize({ width: 1366, height: 860 });
await page.evaluate(() => startNewWeb('ks2')); await sleep(400);
ok(await page.evaluate(() => !document.body.classList.contains('applab-mode') && document.body.classList.contains('web-mode')), 'opening another lab leaves the App Lab');
ok(errors.filter(e => !/sandboxed|allow-scripts/.test(e)).length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
await b.close(); site.close(); done();
