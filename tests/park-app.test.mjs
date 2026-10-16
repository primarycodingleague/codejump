// Park Designers in the real app: a lesson world opens in the 3D World with its Goals checklist, "uses" goals follow the
// blocks, the rest tick while it runs, every goal ticking says so, the goals survive a save and reopen, and an ordinary
// 3D World project has no checklist.
import { serve, browser, openApp, ok, done, sleep } from './lib.mjs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './lib.mjs';

const PK = await import(pathToFileURL(join(ROOT, 'world', 'world-park.js')).href);
const site = await serve();
const b = await browser();
const errors = [];
try {
  const { page } = await openApp(b, site.url, { errors });
  await page.evaluate(() => startNew3D('ks2'));
  await page.waitForFunction(() => worldApp && worldApp._world && worldApp._world() && worldApp._world().editing(), null, { timeout: 60000 });
  ok(await page.evaluate(() => document.getElementById('w3Goals').hidden), 'an ordinary 3D World project has no Goals checklist');

  // the tickets lesson: starter
  await page.evaluate(p => worldApp.setProject(p), PK.parkProject('park-19-tickets'));
  await page.waitForFunction(() => worldApp._world().editing() && worldApp._world().objects().some(o => o.id === 'turnstile'), null, { timeout: 60000 });
  const st = await page.evaluate(() => ({ shown: !document.getElementById('w3Goals').hidden, n: document.querySelectorAll('#w3GoalsList li').length,
    title: document.getElementById('w3GoalsTitle').textContent, count: document.getElementById('w3GoalsCount').textContent }));
  ok(st.shown && st.n === 3 && st.title === 'Count the visitors' && st.count === '0/3', 'a lesson world shows its checklist: ' + JSON.stringify(st));

  // the finished program: the "uses" goal ticks straight away in the edit view
  await page.evaluate(p => worldApp.setProject(p), { blocks: PK.parkAnswer('park-19-tickets'), goals: PK.parkGoals('park-19-tickets') });
  await page.waitForFunction(() => worldApp._world().editing() && worldApp._world().objects().some(o => o.id === 'turnstile'), null, { timeout: 60000 });
  ok(await page.evaluate(() => document.querySelector('#w3GoalsList li').classList.contains('done') && document.getElementById('w3GoalsCount').textContent === '1/3'),
    '"uses" goals follow the blocks before Run');

  // Run and let 5 visitors in
  await page.click('#w3Run');
  await page.waitForFunction(() => worldApp._world().running(), null, { timeout: 30000 });
  for (let i = 0; i < 5; i++) { await page.evaluate(() => worldApp._world().click('turnstile')); await sleep(150); }
  await page.waitForFunction(() => document.getElementById('w3Goals').classList.contains('all'), null, { timeout: 15000 }).catch(() => {});
  const run = await page.evaluate(() => ({ count: document.getElementById('w3GoalsCount').textContent, all: document.getElementById('w3Goals').classList.contains('all'),
    banner: document.getElementById('w3Banner').textContent }));
  ok(run.all && run.count === '3/3' && /Tickets: 5/.test(run.banner), 'every goal ticks while it runs: ' + JSON.stringify(run));
  await page.screenshot({ path: '/tmp/park-app.png' }).catch(() => {});

  // Run again: the live goals start again, the blocks goal stays
  await page.click('#w3Run'); await sleep(400);
  ok(await page.evaluate(() => { const li = [...document.querySelectorAll('#w3GoalsList li')].map(x => x.classList.contains('done')); return li[0] && !li[2] && !document.getElementById('w3Goals').classList.contains('all'); }),
    'Run again: the checklist starts again (the blocks goal stays ticked, 5 visitors needs doing again)');

  // folding it away
  await page.click('#w3GoalsHead');
  ok(await page.evaluate(() => document.getElementById('w3Goals').classList.contains('min') && getComputedStyle(document.getElementById('w3GoalsList')).display === 'none'), 'the checklist folds away');
  await page.click('#w3GoalsHead');

  // save and reopen: the goals travel in the payload
  const payload = await page.evaluate(() => JSON.stringify(buildPayload()));
  ok(JSON.parse(payload).world.goals && JSON.parse(payload).world.goals.list.length === 3, 'the goals are saved with the project');
  await page.evaluate(() => startNewProject('ks2'));
  await page.evaluate(p => applyPayload(JSON.parse(p)), payload);
  await page.waitForFunction(() => document.body.classList.contains('threed-mode') && worldApp._world() && worldApp._world().editing(), null, { timeout: 60000 });
  await sleep(500);
  ok(await page.evaluate(() => !document.getElementById('w3Goals').hidden && document.getElementById('w3GoalsTitle').textContent === 'Count the visitors'),
    'reopened: the checklist is back');
  // a lesson opened from the library: ticking every goal brings up Next lesson on the Lesson card
  await page.evaluate(() => { clearDirty(); lessonOpenStarter('park-19-tickets'); });
  await page.waitForFunction(() => lessonActive && lessonActive.id === 'park-19-tickets' && worldApp._world() && worldApp._world().editing(), null, { timeout: 60000 });
  await page.evaluate(p => worldApp.setProject(p), { blocks: PK.parkAnswer('park-19-tickets'), goals: PK.parkGoals('park-19-tickets') });
  await page.waitForFunction(() => worldApp._world().editing() && worldApp._world().objects().some(o => o.id === 'turnstile'), null, { timeout: 60000 });
  await page.click('#w3Run');
  await page.waitForFunction(() => worldApp._world().running(), null, { timeout: 30000 });
  for (let i = 0; i < 5; i++) { await page.evaluate(() => worldApp._world().click('turnstile')); await sleep(150); }
  await page.waitForFunction(() => lessonActive && lessonActive.done, null, { timeout: 15000 }).catch(() => {});
  const nx = await page.evaluate(() => ({ done: !!(lessonActive && lessonActive.done), shown: !document.getElementById('lg-go').classList.contains('hide'), t: document.getElementById('lg-go-t').textContent }));
  ok(nx.done && nx.shown && nx.t === 'Coaster cam', 'every goal ticked: the Lesson card offers “Next lesson: Coaster cam”: ' + JSON.stringify(nx));
  ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
