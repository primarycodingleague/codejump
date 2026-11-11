// Web Lab: the model in Node (clean, HTML out and back in, the safety whitelist, Check my site, goals) and the app in a browser
// (chooser, templates, typing on the page, inspector, pages, style, Code, Preview, Check, undo, save/reopen, live parts).
import { join } from 'node:path';
import { serve, browser, openApp, ok, done, sleep, ROOT } from './lib.mjs';

const W = await import(join(ROOT, 'web', 'web-model.js'));
const strip = bs => JSON.stringify(bs, (k, v) => k === 'id' ? undefined : v);

// ── model ──
for (const t of Object.keys(W.TEMPLATES)) {
  const p = W.newProject(t);
  ok(JSON.stringify(W.cleanProject(JSON.parse(JSON.stringify(p)))) === JSON.stringify(p), t + ': cleaning a saved project changes nothing');
  ok(p.site.order.every(id => strip(W.fromHTML(W.pageHTML(p, id, { code: true }), p).blocks) === strip(p['p' + id].blocks)), t + ': every page goes to HTML and back unchanged');
  const html = W.siteHTML(p);
  ok(/Content-Security-Policy" content="default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'"/.test(html) && !/<script/i.test(html), t + ': the site has a no-scripts security policy');
}
const ATTACKS = ['<script>alert(1)</script><p>hi</p>', '<img src=x onerror=alert(1)>', '<a href="javascript:alert(1)">x</a>', '<a href="JaVaScRiPt:alert(1)">x</a>',
  '<p style="background:url(javascript:alert(1));color:red">y</p>', '<iframe src="https://evil.example"></iframe>ok', '<svg onload=alert(1)><circle/></svg>',
  '<p onclick="x()">z</p>', '<style>body{display:none}</style><b>b</b>', '<img src="data:image/svg+xml,<svg onload=alert(1)>">', '<img src="https://tracker.example/a.png">',
  '<form action="https://x.example"><input name=p></form>', '<object data="x"></object>', '<p style="position:fixed;inset:0">cover</p>', '<a href="data:text/html,<script>x</script>">d</a>',
  '<math><mi xlink:href="javascript:alert(1)">m</mi></math>', '<base href="https://evil.example/">', '<meta http-equiv="refresh" content="0;url=https://evil.example">'];
for (const a of ATTACKS) {
  const out = W.cleanHTML(a);
  ok(!/<(script|style|iframe|svg|form|input|object|base|meta|math)\b|\son\w+=|javascript:|url\(|position|https:\/\/(evil|tracker|x)\.example|data:text/i.test(out), 'the cleaner removes: ' + a.slice(0, 50));
}
ok(W.cleanInline('<b>bold</b> <div>x</div><img src="lib:star">') === '<b>bold</b> x', 'inline text keeps only inline tags');
ok(W.cleanCSS('@import url(x); h1 { color: red; background: url(x) } .big{font-size:2em} body:has(x){color:red} @font-face{src:url(x)} h2{position:fixed}') === 'h1 { color: red; }\n.big { font-size: 2em; }', 'pupils’ CSS keeps only safe rules');
ok(W.cleanHref('https://www.example.org/a') && W.cleanHref('http://www.example.org') === 'https://www.example.org' && !W.cleanHref('javascript:x') && !W.cleanHref('http://192.168.1.1/'), 'links: https web pages only (http is upgraded)');
{
  const p = W.newProject('about'), bad = JSON.parse(JSON.stringify(p));
  bad.imgs.zzzzzz = 'data:text/html;base64,PHNjcmlwdD4='; bad.site.theme.bg = 'red;background:url(x)'; bad['p' + p.site.order[0]].blocks.push({ t: 'image', src: 'https://evil.example/x.png', alt: 'x' }, { t: 'nope' });
  const c = W.cleanProject(bad);
  ok(!c.imgs.zzzzzz && c.site.theme.bg === W.DEFAULT_THEME.bg && c['p' + p.site.order[0]].blocks.slice(-1)[0].src === 'lib:question', 'cleanProject drops bad pictures, colours and unknown blocks');
  ok(W.checkSite(p).every(x => x.level !== 'warn'), 'a template passes Check my site');
  p.site.theme.text = '#eef4fb'; const img = p['p' + p.site.order[0]].blocks.find(b => b.t === 'image'); img.alt = '';
  const ch = W.checkSite(p);
  ok(ch.some(x => /hard to read/.test(x.text)) && ch.some(x => /no description/.test(x.text) && x.block === img.id), 'Check my site finds unreadable colours and a picture with no description');
  const r = W.fromHTML('<h1>Hi</h1><p>One<p>Two<ul><li>a<li>b</ul>loose <i>text</i><script>bad()</script>', p);
  ok(strip(r.blocks) === strip([{ t: 'heading', text: 'Hi', level: 1 }, { t: 'text', html: 'One' }, { t: 'text', html: 'Two' }, { t: 'list', items: ['a', 'b'], ordered: false }, { t: 'text', html: 'loose <i>text</i>' }]) && r.removed.includes('script'), 'freehand HTML becomes blocks; a script is reported as taken out');
  const g = W.cleanGoals({ title: 'Goals', list: [{ type: 'pages', n: 3, text: '3 pages' }, { type: 'picture', n: 1, alt: true, text: 'a described picture' }, { type: 'link', to: 'page', text: 'a link to a page' }, { type: 'named', text: 'a name' }] });
  ok(JSON.stringify(W.checkGoals(g, W.newProject('club')).map(x => x.ok)) === '[true,true,true,true]' && JSON.stringify(W.checkGoals(g, W.newProject('blank')).map(x => x.ok)) === '[false,false,false,false]', 'goals tick for the club template and not for a blank site');
}

// ── the app ──
const site = await serve(), b = await browser(), errors = [];
const { ctx, page } = await openApp(b, site.url, { errors });
await page.setViewportSize({ width: 1366, height: 860 });
const P = () => page.evaluate(() => webApp._proj());
await page.click('#h-new'); await page.click('#ks-modal [data-ks=ks1]');
ok(!(await page.isVisible('#pt-modal .ks-opt[data-pt="web"]')), 'the Web Lab isn’t offered for Key Stage 1');
await page.evaluate(() => document.getElementById('pt-modal').classList.add('hide'));
await page.click('#h-new'); await page.click('#ks-modal [data-ks=ks2]'); await page.click('#pt-modal .ks-opt[data-pt="web"]');
await page.waitForSelector('.wl-tpl [data-tpl]', { timeout: 30000 });
ok(await page.evaluate(() => projectType === 'web' && document.body.classList.contains('web-mode')), 'Start building → Web Lab opens the lab and asks for a template');
await page.click('.wl-tpl [data-tpl="club"]');
let p = await P();
ok(p.site.order.length === 3 && p.site.title === 'Club or team', 'the Club template gives 3 pages');
// type straight onto the page
const home = p.site.order[0];
const textId = p['p' + home].blocks.find(x => x.t === 'text').id;
await page.click(`#wlCanvas >> [data-bid="${textId}"]`);
await page.keyboard.press('ControlOrMeta+a'); await page.keyboard.type('We build robots every week.');
await page.keyboard.press('ControlOrMeta+a'); await page.click('.wl-tbar [data-cmd="bold"]');
await sleep(500);
p = await P();
ok(p['p' + home].blocks.find(x => x.id === textId).html === '<b>We build robots every week.</b>', 'typing on the page and pressing B makes bold text: ' + p['p' + home].blocks.find(x => x.id === textId).html);
// add a picture, check its description, change the size
await page.click('.wl-tile[data-add="image"]');
p = await P(); const imgB = p['p' + home].blocks.find(x => x.t === 'image');
ok(imgB && p['p' + home].blocks.indexOf(imgB) === p['p' + home].blocks.findIndex(x => x.id === textId) + 1 && await page.evaluate(() => webApp._sel()) === imgB.id, 'Add → Picture goes under the chosen block and is chosen');
await page.click('.wl-pic[data-v="lib:robot"]');
p = await P();
ok(p['p' + home].blocks.find(x => x.t === 'image').src === 'lib:robot' && p['p' + home].blocks.find(x => x.t === 'image').alt === 'Robot', 'choosing a library picture fills in its description');
await page.fill('[data-in="alt"]', ''); await sleep(500);
ok(W.checkSite(await P()).some(x => /no description/.test(x.text)), 'an empty description is found by Check my site');
await page.fill('[data-in="alt"]', 'A friendly robot'); await sleep(500);
// a button that goes to a page
await page.click('.wl-tile[data-add="button"]');
await page.fill('[data-in="label"]', 'See the news');
const newsId = p.site.order[2];
await page.selectOption('[data-link="link"]', '#p-' + newsId); await sleep(400);
p = await P(); const btn = p['p' + home].blocks.find(x => x.t === 'button' && x.label === 'See the news');
ok(btn && btn.link === '#p-' + newsId, 'a button can go to another page');
// pages
await page.click('.wl-side-tab[data-side="pages"]'); await page.click('#wlAddPage');
await page.keyboard.press('ControlOrMeta+a'); await page.keyboard.type('Members'); await page.keyboard.press('Enter'); await sleep(300);
p = await P();
ok(p.site.order.length === 4 && p['p' + p.site.order[3]].name === 'Members' && await page.evaluate(() => webApp._page()) === p.site.order[3], 'Add a page, type its name: a 4th page called Members is open');
// style
await page.click('.wl-side-tab[data-side="style"]'); await page.click('[data-set="night"]');
await page.click('#wlFontBody'); await page.click('.wl-pop .wl-font[data-font="rounded"]'); await sleep(200);
p = await P();
ok(p.site.theme.bg === W.THEMES.night.bg && p.site.theme.font === 'rounded', 'Style: a colour set and a font');
const shadowBg = await page.evaluate(() => getComputedStyle(webApp._shadow().querySelector('.wl-body')).backgroundColor);
ok(shadowBg === 'rgb(20, 24, 38)', 'the design view shows the site’s own colours (' + shadowBg + ')');
// undo / redo
await page.click('#wlUndo'); await sleep(200);
ok((await P()).site.theme.font !== 'rounded', 'Undo takes the font back');
await page.click('#wlRedo'); await sleep(200);
ok((await P()).site.theme.font === 'rounded', 'Redo puts it back');
// Code: the HTML of the page, edited
await page.evaluate(id => webApp._select(null, id), home);
await page.click('.wl-tab[data-tab="code"]'); await sleep(300);
const html = await page.inputValue('#wlHtml');
ok(html.includes('<b>We build robots every week.</b>') && html.includes('src="pictures/robot.svg"') && html.includes('href="#news"') && !html.includes('data:image'), 'the Code tab shows the page as tidy HTML (pictures/robot.svg, #news)');
await page.evaluate(() => webApp._applyHTML(webApp._proj() && document.getElementById('wlHtml').value + '\n<h2 class="special">Join us!</h2>\n<script>alert(1)</script>'));
await sleep(300);
p = await P();
ok(p['p' + home].blocks.some(x => x.t === 'heading' && x.text === 'Join us!' && x.cls === 'special') && await page.isVisible('#wlHtmlNote') && /script/.test(await page.textContent('#wlHtmlNote')), 'edited HTML becomes blocks; the script is taken out and the pupil is told');
await page.evaluate(() => webApp._applyCSS('.special { color: #ff00aa; text-align: center }\nh1 { background: url(https://x.example/a.png) }'));
await sleep(300);
p = await P();
ok(p.site.css === '.special { color: #ff00aa; text-align: center; }' && /couldn’t be used/.test(await page.textContent('#wlCssNote')), 'My CSS keeps the good rule and explains the one it dropped');
// Preview: the real site in a sandboxed frame
await page.click('.wl-tab[data-tab="preview"]'); await sleep(600);
const fr = await page.evaluate(() => { const f = document.getElementById('wlFrameView'); return { sandbox: f.getAttribute('sandbox'), html: f.srcdoc }; });
ok(fr.sandbox === 'allow-popups allow-popups-to-escape-sandbox' && /Content-Security-Policy/.test(fr.html) && !/<script/i.test(fr.html) && fr.html.includes('class="page home" id="p-' + home + '"'), 'Preview shows the site in a frame that can’t run scripts, on the page you were on');
const frame = await (await page.$('#wlFrameView')).contentFrame();
ok(frame && (await frame.evaluate(() => getComputedStyle(document.querySelector('.special')).color)) === 'rgb(255, 0, 170)', 'the pupil’s CSS styles the previewed site');
await frame.click('.page.home .site-nav a:nth-of-type(2)');
await sleep(300);
ok(await frame.evaluate(() => location.href.startsWith('about:srcdoc#p-') && [...document.querySelectorAll('.page')].filter(s => getComputedStyle(s).display === 'block').length === 1 && getComputedStyle(document.querySelector('.page:target')).display === 'block'), 'the menu moves between pages inside the preview, with no scripts (CSS :target)');
// Check my site + download
await page.click('#wlCheck');
ok(await page.isVisible('.wl-checks') && (await page.textContent('.wl-checks')).length > 10, 'Check my site lists its findings');
await page.click('.wl-pop [data-close]');
const dl = page.waitForEvent('download'); await page.click('#wlDownload'); const d = await dl;
ok(d.suggestedFilename() === 'club-or-team.html', 'Download saves the website as one .html file (' + d.suggestedFilename() + ')');
// save, go home, reopen
await page.click('.wl-tab[data-tab="design"]');
const pay = await page.evaluate(() => JSON.stringify(buildPayload()));
await page.evaluate(() => { startNewProject('ks2'); });
await page.evaluate(pl => applyPayload(JSON.parse(pl)), pay); await sleep(800);
p = await P();
ok(await page.evaluate(() => projectType === 'web' && document.body.classList.contains('web-mode')) && p.site.order.length === 4 && p.site.css.includes('.special') && p['p' + home].blocks.some(x => x.text === 'Join us!'), 'a saved Web Lab project reopens with every page, block and the CSS');
// live parts: a partner's new page arrives before the site that lists it
const live = await page.evaluate(() => {
  const a = webApp, parts = a.liveParts(), keys = Object.keys(parts);
  const id = 'zzzzzz', site = JSON.parse(JSON.stringify(a._proj().site)); site.order.push(id);
  a.liveSet('p' + id, { ['p' + id]: { name: 'From Ben', blocks: [{ id: 'yyyyyy', t: 'heading', text: 'Hello from Ben', level: 1 }] } });
  const before = a._proj().site.order.includes(id);
  a.liveSet('site', { site });
  return { first: keys[0], last: keys[keys.length - 1], before, after: a._proj().site.order.includes(id) && a._proj()['p' + id].name === 'From Ben' };
});
ok(/^p[a-z]{6}$/.test(live.first) && live.last === 'site' && !live.before && live.after, 'live: pages go before the site, and a page that arrives first appears once the site lists it');
// goals tick and the lesson card would move on
await page.evaluate(() => { const p = webApp.getProject(); p.goals = { title: 'Goals', list: [{ type: 'pages', n: 6, text: 'Make 6 pages' }, { type: 'css', n: 1, text: 'Write a CSS rule' }] }; webApp.setProject(p); });
await sleep(400);
ok(await page.isVisible('#wlGoals') && (await page.textContent('#wlGoals')).includes('1/2'), 'a lesson’s goals show and tick (1 of 2)');
await page.evaluate(() => webApp._add('text'));
await page.click('.wl-side-tab[data-side="pages"]'); await page.click('#wlAddPage'); await page.keyboard.press('Enter'); await sleep(600);
ok((await page.textContent('#wlGoals')).includes('2/2') && await page.evaluate(() => document.querySelector('#wlGoals').classList.contains('done')), 'adding a 6th page ticks the last goal');
// phone width
await page.setViewportSize({ width: 390, height: 844 }); await sleep(300);
ok(await page.evaluate(() => document.documentElement.scrollWidth <= 400 || document.getElementById('web-ui').scrollWidth <= 400), 'the lab fits a phone screen');
await page.setViewportSize({ width: 1366, height: 860 });
// other labs still switch cleanly
await page.evaluate(() => startNewAI('ks2')); await sleep(400);
ok(await page.evaluate(() => !document.body.classList.contains('web-mode') && document.body.classList.contains('ai-mode')), 'opening another lab leaves the Web Lab');
ok(errors.filter(e => !/sandboxed|allow-scripts/.test(e)).length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
await b.close(); site.close(); done();
