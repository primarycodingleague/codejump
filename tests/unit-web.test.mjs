// The Hollybrook Web Team — the Web Lab's lesson unit (lessons/units/web.js, 18 lessons in 3 blocks).
// Every lesson is complete; in Node, every lesson's intended answer (lessons/builds/web/hollybrook.mjs) ticks every goal while
// the bare starter ticks none, and a half-done answer doesn't finish the job; in the app, every starter opens with its Lesson
// card and goals strip, and three lessons are followed through the real Web Lab (code tab, CSS class, a fixed bug list).
// WEB_NODE=1 runs only the Node part.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, serve, browser, openApp, ok, done } from './lib.mjs';

const U = await import(pathToFileURL(join(ROOT, 'lessons', 'units', 'web.js')).href);
const H = await import(pathToFileURL(join(ROOT, 'lessons', 'builds', 'web', 'hollybrook.mjs')).href);
const W = await import(pathToFileURL(join(ROOT, 'web', 'web-model.js')).href);
const { LESSONS: ALL } = await import(pathToFileURL(join(ROOT, 'lessons', 'lessons.js')).href);
const ONLY_NODE = process.env.WEB_NODE === '1';
const NAME = 'Hollybrook Web Team';

// ───────── the unit's data ─────────
const UNIT = U.LESSONS.map(x => ALL.find(l => l.id === x.id));
ok(UNIT.length === 18 && UNIT.every(Boolean), `18 lessons in the unit, all in the library (${UNIT.filter(Boolean).length})`);
ok(new Set(ALL.map(l => l.id)).size === ALL.length, 'every lesson id in the library is different');
const YEARS = ['Years 3–4', 'Years 4–5', 'Years 5–6'];
const words = /Scratch|Minecraft|Google Sites|Wix|Squarespace|WordPress|Weebly|Tinkercad|intelino|Ohbot|Bamzooki|BBC|Flock|Code\.org|Barefoot|Mozilla Thimble|Glitch/;
UNIT.forEach((l, i) => {
  if (!l) return;
  const b = Math.floor(i / 6) + 1, m = i + 1, mins = l.plan.reduce((a, p) => a + p.min, 0), slides = l.slides || [];
  ok(l.unit === `${NAME} · Block ${b} · Lesson ${m}` && l.years === YEARS[b - 1] && l.ks === 'ks2' && l.type === 'web' && l.minutes === 60, `${l.id}: Block ${b} · Lesson ${m}, ${l.years}, Web Lab, 60 minutes`);
  ok(mins === 60 && l.steps.length >= 4 && l.steps.length <= 9 && l.success.length >= 2 && l.words.length >= 2 && l.assess.length >= 2 && l.support && l.stretch && l.objective && l.summary && l.need.length,
    `${l.id}: complete (plan ${mins} min, ${l.steps.length} pupil steps)`);
  ok(l.curriculum.length && l.curriculum.every(k => ['design', 'ssr', 'reason', 'data', 'safe'].includes(k)), `${l.id}: Key Stage 2 curriculum keys (${l.curriculum})`);
  ok(slides.length >= 4 && slides.length <= 7 && slides.some(s => s.use === 'steps') && slides.every(s => s.use || (s.t && s.notes)), `${l.id}: ${slides.length} slides with notes and a Your turn slide`);
  ok(!words.test(JSON.stringify(l)), `${l.id}: no other product’s names`);
  ok(existsSync(join(ROOT, 'lessons', 'starters', l.id + '.json')) && existsSync(join(ROOT, 'lessons', 'pics', l.id + '.jpg')) && existsSync(join(ROOT, 'lessons', 'builds', l.id + '.mjs')) && H.UNIT[l.id],
    `${l.id}: starter, picture, build file and answer`);
});

// ───────── Node: answers tick every goal, starters none ─────────
const ticks = (id, p, c) => H.ticks(id, p, c);
for (const id of Object.keys(H.UNIT)) {
  const s = H.starterProject(id), a = H.answerProject(id, s), ts = ticks(id, s, 0), ta = ticks(id, a, H.UNIT[id].code || 0);
  ok(ta.length >= 2 && ta.every(x => x.ok) && ts.every(x => !x.ok), `${id}: the answer ticks all ${ta.length} goals; the bare starter ticks none` + (ta.some(x => !x.ok) ? ' — missing: ' + ta.filter(x => !x.ok).map(x => x.text).join(', ') : ''));
  const saved = JSON.parse(JSON.stringify(a)), back = W.cleanProject(saved);
  ok(JSON.stringify(back) === JSON.stringify(a), `${id}: the finished site survives saving and reopening unchanged`);
}
// the lesson's own promises, beyond the checklist
const S = id => H.starterProject(id), A = id => H.answerProject(id);
{ const p = S('web-5-fix'), part = JSON.parse(JSON.stringify(p)); part.site.theme.text = '#1f2a37'; part.site.theme.nav = 'bar';
  const left = W.checkSite(W.cleanProject(part)).filter(x => x.level !== 'ok').length;
  ok(W.checkSite(p).filter(x => x.level === 'warn' || x.level === 'tip').length >= 4 && left === 2 && !ticks('web-5-fix', W.cleanProject(part))[0].ok,
    `Sports day: the starter has 4 bugs; fixing only the colours and the menu still leaves 2 (the picture and the button) — ${left} left`); }
{ const p = A('web-7-code'); ok(!ticks('web-7-code', p, 0)[0].ok && ticks('web-7-code', p, 1).every(x => x.ok), 'Peek at the code: the same change only counts when it was made in the Code tab'); }
{ const r = A('web-8-tags'), h = W.pageHTML(r, r.site.order[0], { code: true });
  ok(/<ul>[\s\S]*<li>100g butter<\/li>[\s\S]*<\/ul>/.test(h) && /<ol>[\s\S]*<\/ol>/.test(h), 'Your own HTML: the recipe’s lists come out as real <ul>/<ol> lists in the code'); }
{ const p = A('web-9-web'), html = W.siteHTML(p); ok(/href="https:\/\/www\.example\.org\/romans"/.test(html) && /target="_blank"/.test(html), 'Links to the wider web: the trusted links are real https links that open in a new tab'); }
{ ok(W.checkSite(S('web-10-design')).some(x => /hard to read/.test(x.text)) && !W.checkSite(A('web-10-design')).some(x => x.level === 'warn'), 'Design for visitors: the starter’s colours are flagged as hard to read; the answer’s are not'); }
{ const p = S('web-11-debug'), found = W.checkSite(p).filter(x => x.level !== 'ok').map(x => x.text).join(' | ');
  ok(/level 3 heading/.test(found) && /very long/.test(found) && /empty/.test(found) && /same name/.test(found), 'Debug the festival: Check my site finds all 4 hidden bugs in the starter'); }
{ const p = A('web-13-css'), css = W.siteCSS(p); ok(/h1\s*\{[^}]*color:\s*#7a3b10/.test(css) && /h2\s*\{[^}]*border-bottom/.test(css), 'Style rules: both CSS rules reach the finished site'); }
{ const p = A('web-14-classes'), html = W.siteHTML(p); ok(/class="card special"/.test(html) && /\.special\s*\{/.test(html) && (html.match(/class="card special"/g) || []).length === 1, 'Classes: only the chosen card gets the class, and its rule is in the site'); }
{ const p = A('web-15-data'), html = W.siteHTML(p); ok(/<th>Kind of book<\/th>/.test(html) && /<td>Adventure<\/td>\s*<td>18<\/td>/.test(html), 'Data on a web page: the results are a real table with a header row'); }
{ const half = JSON.parse(JSON.stringify(S('web-17-safe'))); half['p' + half.site.order[0]].blocks[1].html = 'Sam won the spelling bee!';
  const t = ticks('web-17-safe', W.cleanProject(half)); ok(t[0].ok && !t[1].ok, 'A responsible web author: removing the address alone still leaves the phone number to find'); }
{ const p = A('web-18-festival'); ok(W.checkSite(p).every(x => x.level === 'ok'), 'Final project: the example site has nothing at all for Check my site'); }

// ───────── the app ─────────
if (!ONLY_NODE) {
  const site = await serve(), b = await browser(), errors = [];
  const { ctx, page } = await openApp(b, site.url, { errors });
  await page.setViewportSize({ width: 1280, height: 760 });
  const open = async id => {
    await page.evaluate(id => { clearDirty(); lessonOpenStarter(id); }, id);
    await page.waitForFunction(id => typeof lessonActive !== 'undefined' && lessonActive && lessonActive.id === id && webApp && webApp._goals && webApp._goals() && document.body.classList.contains('web-mode'), id, { timeout: 30000 });
    await page.waitForTimeout(150);
  };
  for (const l of UNIT) {
    await open(l.id);
    const r = await page.evaluate(() => ({ card: !document.getElementById('lesson-guide').classList.contains('hide'), strip: !!document.querySelector('#wlGoals') && getComputedStyle(document.querySelector('#wlGoals')).display !== 'none',
      goals: webApp._goals(), chooser: !!document.querySelector('.wl-pop') }));
    ok(r.card && r.strip && r.goals.length >= 2 && r.goals.every(g => !g.ok) && !r.chooser, `${l.id}: opens with its Lesson card and ${r.goals.length} unticked goals (no template chooser)`);
  }
  // lesson 7 followed in the Code tab
  await open('web-7-code');
  await page.evaluate(() => webApp._tab('code'));
  const html = await page.evaluate(() => document.getElementById('wlHtml').value);
  await page.evaluate(h => webApp._applyHTML(h), html.replace('Library news', 'Story time is back!').replace(/Something exciting[^<]*/, 'Story time is every <b>Tuesday</b> at 10am.'));
  await page.waitForTimeout(300);
  let g = await page.evaluate(() => webApp._goals());
  ok(g.every(x => x.ok) && await page.evaluate(() => !document.getElementById('lg-go').classList.contains('hide')), 'Peek at the code: changing the HTML in the Code tab ticks every goal and shows the Next lesson button');
  // lesson 14: a class name on the card + a rule in My CSS
  await open('web-14-classes');
  await page.evaluate(() => { webApp._tab('design'); let c = null; const walk = bl => bl.forEach(b => { if (!c && b.t === 'card') c = b; if (b.cols) b.cols.forEach(walk); }); walk(webApp._proj()['p' + webApp._page()].blocks); webApp._select(c.id); });
  await page.click('.wl details:has([data-in="cls"]) summary');
  await page.fill('.wl [data-in="cls"]', 'special'); await page.dispatchEvent('.wl [data-in="cls"]', 'change');
  await page.evaluate(() => webApp._applyCSS('.special { border: 4px solid orange; }'));
  await page.waitForTimeout(300);
  g = await page.evaluate(() => webApp._goals());
  const shadowHas = await page.evaluate(() => [...webApp._shadow().querySelectorAll('.special')].length);
  ok(g.every(x => x.ok) && shadowHas === 1, `Classes: a class name typed in the inspector and a .special rule tick both goals, and exactly one block on the page has the class (${shadowHas})`);
  // lesson 5: fix the four bugs through the real panels
  await open('web-5-fix');
  await page.evaluate(() => { const p = webApp._proj(), bl = p['p' + p.site.order[0]].blocks; webApp._select(bl.find(b => b.t === 'image').id); });
  await page.fill('.wl [data-in="alt"]', 'A football'); await page.dispatchEvent('.wl [data-in="alt"]', 'change');
  await page.evaluate(() => { const p = webApp._proj(), bl = p['p' + p.site.order[0]].blocks; webApp._select(bl.find(b => b.t === 'button').id); });
  const sel = await page.$('.wl select[data-link]');
  if (sel) { const v = await page.evaluate(s => [...s.options].find(o => /Results/.test(o.textContent))?.value, sel); if (v) await sel.selectOption(v); }
  await page.click('.wl [data-side="style"]');
  await page.evaluate(() => { const i = document.querySelector('.wl [data-col="text"]'); i.value = '#1f2a37'; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); });
  const navBtn = await page.$('.wl [data-theme="nav"][data-v="bar"]'); if (navBtn) await navBtn.click();
  await page.waitForTimeout(400);
  g = await page.evaluate(() => webApp._goals());
  ok(g.every(x => x.ok), 'Debug the sports day site: fixing the picture, the button, the colour and the menu in the panels ticks every goal — ' + JSON.stringify(g.map(x => x.ok)));
  // Next lesson goes through the unit in order
  const next = await page.evaluate(ids => ids.map(id => (lessonNeighbours(lessonsMod.LESSONS.find(o => o.id === id)).next[0] || {}).id || null), UNIT.map(l => l.id));
  ok(next.slice(0, -1).every((n, i) => n === UNIT[i + 1].id), 'Next lesson goes through the Hollybrook Web Team in order');
  ok(!errors.filter(e => !/sandboxed|allow-scripts/.test(e)).length, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await ctx.close(); await b.close(); site.close();
}
done();
