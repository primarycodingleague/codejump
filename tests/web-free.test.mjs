// Web Lab, more customising (Nov 2026): free layout (drag anywhere, resize, snap, layers, phone stacking), bundled fonts,
// colour sets (saved, surprise), gradients and patterns, block styling (border, corners, shadow, tilt, see-through,
// animations), shapes and the click-to-reveal block — in the model (Node) and in the real app.
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, serve, browser, openApp, ok, done } from './lib.mjs';

const W = await import(pathToFileURL(join(ROOT, 'web', 'web-model.js')).href);
const strip = bs => JSON.stringify(bs, (k, v) => k === 'id' ? undefined : v);
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── model ──
{ // fonts: every bundled font has its files, and only woff2 data URLs become @font-face rules
  const bundled = Object.entries(W.FONTS).filter(([, f]) => f[3]);
  ok(Object.keys(W.FONTS).length >= 30 && bundled.length >= 24, `${Object.keys(W.FONTS).length} fonts, ${bundled.length} of them bundled`);
  ok(bundled.every(([, f]) => existsSync(join(ROOT, 'web', 'fonts', f[3] + '-400.woff2')) && (!f[4] || existsSync(join(ROOT, 'web', 'fonts', f[3] + '-700.woff2'))) && existsSync(join(ROOT, 'web', 'fonts', 'licences', f[3] + '.txt'))),
    'every bundled font has its file(s) and its licence');
  const total = bundled.reduce((a, [, f]) => a + statSync(join(ROOT, 'web', 'fonts', f[3] + '-400.woff2')).size, 0);
  ok(total < 1500000, `the fonts are small enough for the iPad offline copy (${Math.round(total / 1024)} KB)`);
  ok(Object.values(W.FONTS).every(f => W.FONT_GROUPS.some(g => g[0] === f[2])), 'every font is in a group of the font chooser');
  const css = W.fontFaceCSS({ lobster: { 400: 'data:font/woff2;base64,AAAA' }, pacifico: { 400: 'https://evil.example/f.woff2' }, nope: { 400: 'data:font/woff2;base64,AA' }, caveat: { 400: 'data:font/woff2;base64,AA");}body{x:url(y' } });
  ok(/font-family: "Lobster"/.test(css) && !/evil|Pacifico|nope|Caveat/.test(css), 'only real woff2 data becomes a font (no outside font files, no CSS tricks)');
  const p = W.newProject('blank'); p.site.theme.font = 'lexend'; p.site.theme.hfont = 'bangers'; p.site.css = 'h2 { font-family: "Pacifico" }';
  p['p' + p.site.order[0]].blocks[0].font = 'pixel';
  ok(JSON.stringify(W.usedFonts(p).sort()) === JSON.stringify(['bangers', 'lexend', 'pacifico', 'pixel']), 'the fonts a site uses are found (theme, headings, a block, its own CSS): ' + W.usedFonts(p));
  ok(/font-src data:/.test(W.siteHTML(p)) && !/<script/.test(W.siteHTML(p)), 'the website may only use fonts that are inside it');
}
{ // colour sets, gradients and patterns
  ok(Object.keys(W.THEMES).length >= 20, Object.keys(W.THEMES).length + ' ready-made colour sets');
  const bad = Object.entries(W.THEMES).filter(([k, t]) => k !== 'night' && (W.contrast(t.text, t.bg) < 4.5 || W.contrast(t.head, t.bg) < 3 || W.contrast('#ffffff', t.accent) < 3)).map(([k]) => k);
  ok(!bad.length, 'every new colour set passes Check my site' + (bad.length ? ': ' + bad : ''));
  const t = W.cleanProject({ site: { theme: { bg: '#ffffff', bg2: '#ff00aa', grad: 'diag', pat: 'dots', fsize: 99, hfont: 'lobster' } } }).site.theme;
  ok(t.grad === 'diag' && t.bg2 === '#ff00aa' && t.pat === 'dots' && t.fsize === 28 && t.hfont === 'lobster', 'gradient, pattern, heading font and word size are kept (size capped at 28)');
  const t2 = W.cleanProject({ site: { theme: { bg2: 'red;background:url(x)', grad: 'expression(x)', pat: 'url(x)' } } }).site.theme;
  ok(t2.bg2 === '' && t2.grad === 'none' && t2.pat === 'none', 'bad gradient/pattern values are thrown away');
  const css = W.siteCSS({ site: { theme: t, css: '' } });
  ok(/linear-gradient\(135deg, #ffffff, #ff00aa\)/.test(css) && /radial-gradient\(rgba/.test(css) && /font-family: "Lobster"/.test(css), 'the page background has the gradient and the dots; headings use their own font');
  const p = W.newProject('blank'); Object.assign(p.site.theme, { bg: '#ffffff', text: '#222222', bg2: '#111111', grad: 'down' });
  ok(W.checkSite(p).some(x => /second background colour/.test(x.text)), 'Check my site notices words that are hard to read on the second gradient colour');
}
{ // block styling + new blocks: round trip through the Code tab, and cleaning
  const p = W.newProject('club'), id = p.site.order[0], pg = p['p' + id];
  ok(pg.layout === 'free' && pg.blocks.every(b => b.pos && b.pos.w >= 1), 'a new website is a free layout: every block has a place');
  Object.assign(pg.blocks[0], { font: 'lobster', fs: 40, bg2: '#ff00aa', grad: 'radial', bw: 4, bc: '#112233', bs: 'dotted', rad: 30, sh: 'retro', op: 70, rot: -5, pad: 20, anim: 'bounce', hov: 'wiggle', z: 4 });
  pg.blocks.push(Object.assign(W.blockOf('shape'), { shape: 'hexagon', text: 'Hi <b>there</b>', bg: '#00aa55', pos: { x: 70, y: 3, w: 20, h: 18 }, anim: 'spin', z: 2 }));
  pg.blocks.push(Object.assign(W.blockOf('reveal'), { q: 'Why did the robot <i>cross</i> the road?', a: 'It was <b>programmed</b> to!', pos: { x: 2, y: 90, w: 50, h: 8 }, bg: '#fde68a' }));
  pg.blocks.push(Object.assign(W.blockOf('button'), { label: 'Go', link: '#p-' + p.site.order[1], bg: '#123456', rad: 0, sh: 'glow', hov: 'grow', pos: { x: 40, y: 100, w: 16, h: 6 } }));
  const c = W.cleanProject(p), html = W.pageHTML(c, id, { code: true }), back = W.fromHTML(html, c).blocks;
  ok(strip(back) === strip(c['p' + id].blocks), 'every style, the place of every block, shapes, reveal and a styled button survive the Code tab');
  ok(/<div class="free" style="grid-template-rows/.test(html) && /grid-area: \d+ \/ \d+ \/ span \d+ \/ span \d+/.test(html) && /class="shape shape-hexagon a-spin"/.test(html) && /<details class="reveal"/.test(html),
    'the Code tab shows the grid, grid-area places, shape classes and <details>');
  const bad = W.cleanProject({ site: { order: ['aaaaaa'] }, paaaaaa: { layout: 'free', blocks: [{ t: 'text', html: 'x', pos: { x: -5, y: 'a', w: 500, h: 2 } }, { t: 'shape', shape: 'skull', bg: 'url(x)', rot: 900, op: 0, fs: 1e9, anim: 'explode', sh: 'x;y', bw: 99, font: 'evil' }] } });
  const [b1, b2] = bad.paaaaaa.blocks;
  ok(b1.pos.x === 0 && b1.pos.w === 96 && b1.pos.y >= 0 && b2.shape === 'circle' && !b2.bg && b2.rot === 180 && b2.op === 5 && b2.fs === 160 && !b2.anim && !b2.sh && b2.bw === 20 && !b2.font && b2.pos,
    'bad places and styles are clamped or thrown away');
  const st = W.cleanProject({ site: { order: ['aaaaaa'] }, paaaaaa: { blocks: [{ t: 'text', html: 'x', pos: { x: 3, y: 3, w: 9, h: 9 }, z: 5 }] } });
  ok(!st.paaaaaa.blocks[0].pos && !st.paaaaaa.blocks[0].z, 'a stack page has no places');
  const inner = W.cleanProject({ site: { order: ['aaaaaa'] }, paaaaaa: { layout: 'free', blocks: [{ t: 'columns', cols: [[{ t: 'text', html: 'a', pos: { x: 1, y: 1, w: 2, h: 2 } }], []] }] } });
  ok(!inner.paaaaaa.blocks[0].cols[0][0].pos && inner.paaaaaa.blocks[0].pos, 'blocks inside columns flow inside their column');
  const out = W.cleanHTML('<details open><summary>Q</summary><p>A</p></details><p style="grid-area: 1/1/span 2/span 2; z-index: 3; rotate: 10deg; position: fixed">x</p>');
  ok(/<details>/.test(out) && /<summary>Q<\/summary>/.test(out) && /grid-area/.test(out) && !/position/.test(out), 'your own HTML can use details/summary and grid places, never position');
}
{ // placing, sorting, switching layouts
  const blocks = [Object.assign(W.blockOf('text'), { pos: { x: 50, y: 20, w: 40, h: 5 } }), Object.assign(W.blockOf('heading'), { pos: { x: 0, y: 2, w: 96, h: 6 } }), Object.assign(W.blockOf('image'), { pos: { x: 0, y: 20, w: 40, h: 30 } })];
  W.sortFree(blocks);
  ok(blocks.map(b => b.t).join() === 'heading,image,text', 'blocks are kept in reading order (top to bottom, left to right) for phones and screen readers');
  const pg = { name: 'x', blocks: [W.blockOf('heading'), W.blockOf('text'), W.blockOf('image')] };
  W.setLayout(pg, 'free');
  ok(pg.layout === 'free' && pg.blocks.every((b, i) => b.pos && (!i || b.pos.y > pg.blocks[i - 1].pos.y)), 'switching to free places every block, one under another');
  W.setLayout(pg, 'stack'); ok(!pg.layout && pg.blocks.every(b => !b.pos), 'switching back to stack removes the places');
  const p = W.newProject('blank'), id = W.addPage(p, 'Two', undefined, 'free');
  ok(p['p' + id].layout === 'free' && p['p' + id].blocks[0].pos, 'a new page on a free website is free too');
  const css = W.siteCSS(p);
  ok(/@media \(max-width: 640px\) \{\s*\.free \{ display: flex; flex-direction: column/.test(css), 'on a phone a free page becomes one column');
  ok(/@keyframes cj-bounce/.test(css) && /prefers-reduced-motion: reduce/.test(css), 'animations are built in, and switch off for people who prefer less movement');
}

// ── the app ──
const site = await serve(), b = await browser(), errors = [];
const { page } = await openApp(b, site.url, { errors });
await page.setViewportSize({ width: 1440, height: 900 });
await page.evaluate(() => startNewWeb('ks2'));
await page.waitForSelector('.wl-tpl [data-tpl="about"]'); await page.click('.wl-tpl [data-tpl="about"]'); await sleep(400);
const P = () => page.evaluate(() => webApp._proj());
const pageId = async () => page.evaluate(() => webApp._page());
const blockOf = async t => { const p = await P(); return p['p' + await pageId()].blocks.find(x => x.t === t); };
const centre = id => page.evaluate(id => { const r = webApp._shadow().querySelector(`[data-bid="${id}"]`).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
// drag a picture
let img = await blockOf('image'); const was = img.pos;
let c = await centre(img.id);
await page.mouse.move(c.x, c.y); await page.mouse.down(); await page.mouse.move(c.x + 150, c.y + 30, { steps: 8 });
ok(await page.evaluate(() => !!webApp._shadow().querySelector('.free.wl-dragging') && !!webApp._overlay()), 'while dragging the grid shows, with the move frame');
await page.mouse.move(c.x + 300, c.y + 60, { steps: 8 }); await page.mouse.up(); await sleep(300);
img = await blockOf('image');
ok(img.pos.x > was.x + 15 && img.pos.w === was.w && img.pos.h === was.h && await page.evaluate(id => webApp._sel() === id, img.id), `drag moves a block anywhere (x ${was.x} → ${img.pos.x}) and keeps its size`);
// snap: drag it so its left edge is close to the page's left edge
c = await centre(img.id);
const colW = await page.evaluate(() => webApp._shadow().querySelector('.free').clientWidth / 96);
await page.mouse.move(c.x, c.y); await page.mouse.down(); await page.mouse.move(c.x - (img.pos.x - 1) * colW, c.y, { steps: 10 });
const guide = await page.evaluate(() => webApp._shadow().querySelectorAll('.wl-gl').length);
await page.mouse.up(); await sleep(300); img = await blockOf('image');
ok(img.pos.x === 0 && guide > 0, `it snaps to the page edge with a pink guide line (x ${img.pos.x}, ${guide} guide)`);
// resize from the bottom-right handle with Shift (keeps its shape)
const h = await page.evaluate(() => { const r = webApp._shadow().querySelector('.wl-h[data-h="se"]').getBoundingClientRect(); return { x: r.x + 8, y: r.y + 8 }; });
const before = img.pos;
await page.mouse.move(h.x, h.y); await page.keyboard.down('Shift'); await page.mouse.down(); await page.mouse.move(h.x + 120, h.y + 10, { steps: 8 }); await page.mouse.up(); await page.keyboard.up('Shift'); await sleep(300);
img = await blockOf('image');
ok(img.pos.w > before.w + 8 && img.pos.h > before.h + 6, `Shift + corner handle makes it bigger and keeps its shape (${before.w}×${before.h} → ${img.pos.w}×${img.pos.h})`);
// keys: arrows nudge, Alt+↑ brings forward
await page.keyboard.press('ArrowRight'); await page.keyboard.press('Shift+ArrowDown'); await sleep(200);
const n = (await blockOf('image')).pos;
await page.keyboard.press('Alt+ArrowUp'); await sleep(200);
ok(n.x === img.pos.x + 1 && n.y === img.pos.y + 5 && (await blockOf('image')).z === 1, 'arrow keys move it (Shift = 5) and Alt+↑ brings it forward');
// the Place boxes
await page.fill('[data-pos="w"]', '20'); await page.dispatchEvent('[data-pos="w"]', 'change'); await sleep(200);
ok((await blockOf('image')).pos.w === 20, 'typing a width in Place resizes it');
// adding a block under the chosen one pushes the rest down
const p0 = await P(), list0 = p0['p' + await pageId()].blocks, text = list0.find(x => x.t === 'text'), below = list0.filter(x => x.pos.y > text.pos.y);
await page.evaluate(id => webApp._select(id), text.id); await page.click('.wl-tile[data-add="reveal"]'); await sleep(300);
const p1 = await P(), list1 = p1['p' + await pageId()].blocks, rv = list1.find(x => x.t === 'reveal');
ok(rv && rv.pos.y === text.pos.y + text.pos.h + 1 && below.every(o => list1.find(x => x.id === o.id).pos.y > o.pos.y) && list1.indexOf(rv) === list1.indexOf(list1.find(x => x.id === text.id)) + 1,
  'Add → Click to reveal goes under the chosen block and pushes what is below it down');
ok(await page.evaluate(() => [...webApp._shadow().querySelectorAll('details')].every(d => d.open)), 'in Design a reveal shows its answer so it can be typed');
// a shape, styled from the inspector
await page.click('.wl-tile[data-add="shape"]'); await sleep(300);
await page.click('.wl-shp[data-v="star"]'); await sleep(200);
await page.click('#wlRight [data-more="bg"]'); await page.click('#wlRight [data-sw="bg"][data-v="#ec4899"]'); await sleep(200);
await page.evaluate(() => { for (const d of document.querySelectorAll('#wlRight details')) d.open = true; });
await page.selectOption('[data-sel="anim"]', 'pop'); await sleep(300);
let sh = await blockOf('shape');
ok(sh.shape === 'star' && sh.bg === '#ec4899' && sh.anim === 'pop', 'a shape: pick Star, a palette colour and an animation');
await page.evaluate(() => { for (const d of document.querySelectorAll('#wlRight details')) d.open = true; });
await page.evaluate(() => { const r = document.querySelector('#wlRight [data-n="rot"]'); r.value = '15'; r.dispatchEvent(new Event('input')); r.dispatchEvent(new Event('change')); });
await page.evaluate(() => { const r = document.querySelector('#wlRight [data-n="bw"]'); r.value = '5'; r.dispatchEvent(new Event('input')); r.dispatchEvent(new Event('change')); });
await page.selectOption('[data-sel="sh"]', 'glow'); await sleep(300);
sh = await blockOf('shape');
const look = await page.evaluate(id => { const e = webApp._shadow().querySelector(`[data-bid="${id}"]`), s = getComputedStyle(e); return { rot: s.rotate, border: s.borderTopWidth, clip: s.clipPath }; }, sh.id);
ok(sh.rot === 15 && sh.bw === 5 && sh.sh === 'glow' && look.rot === '15deg' && look.border === '5px' && /polygon/.test(look.clip), `tilt, border and shadow show on the page (${JSON.stringify(look)})`);
// layers
await page.click('#wlRight [data-act="back"]'); await sleep(200);
ok(!(await blockOf('shape')).z && (await P())['p' + await pageId()].blocks.filter(x => x.t !== 'shape').every(x => (x.z || 0) >= 1), 'Send to the back puts it under everything');
// block font
await page.click('#wlBFont'); await page.click('.wl-pop .wl-font[data-font="creepster"]'); await sleep(300);
ok((await blockOf('shape')).font === 'creepster' && await page.evaluate(() => document.fonts.check('16px "Creepster"')), 'a block can have its own font, and the font loads');
// style panel: surprise, save my colours, pattern, gradient, heading font
await page.click('.wl-side-tab[data-side="style"]');
await page.click('#wlSurprise'); await sleep(200);
let t = (await P()).site.theme;
ok(W.contrast(t.text, t.bg) >= 4.5 && W.contrast('#ffffff', t.accent) >= 3, 'Surprise me makes a colour set that is easy to read');
await page.click('#wlSaveSet'); await page.fill('#wlSetName', 'Rocket'); await page.click('#wlSetOk'); await sleep(200);
ok(await page.isVisible('[data-myset="0"]') && (await page.textContent('[data-myset="0"]')).includes('Rocket') && await page.evaluate(() => JSON.parse(localStorage.getItem('cj-web-sets'))[0].name === 'Rocket'), 'Save my colours keeps the set on this device');
await page.click('[data-set="mint"]'); await page.click('[data-myset="0"]'); await sleep(200);
ok((await P()).site.theme.bg === t.bg, 'a saved colour set can be used again');
await page.click('.wl-pat[data-v="stripes"]'); await page.selectOption('#wlGrad', 'radial'); await sleep(200);
await page.click('#wlFontHead'); await page.click('.wl-pop .wl-font[data-font="pacifico"]'); await sleep(300);
t = (await P()).site.theme;
const bg = await page.evaluate(() => getComputedStyle(webApp._shadow().querySelector('.wl-body')).backgroundImage);
ok(t.pat === 'stripes' && t.grad === 'radial' && t.bg2 && t.hfont === 'pacifico' && /repeating-linear-gradient/.test(bg) && /radial-gradient/.test(bg), 'stripes, a gradient and a heading font show on the page');
// stack ↔ free keeps the look
await page.evaluate(() => webApp._select(null));
await page.click('.wl-side-tab[data-side="pages"]');
const pid = await pageId();
await page.evaluate(() => webApp._layout('stack')); await sleep(300);
ok(!(await P())['p' + pid].layout && await page.evaluate(() => !webApp._shadow().querySelector('.free')), 'Stack puts blocks back one under another');
const tops = await page.evaluate(() => [...webApp._shadow().querySelectorAll('#wlPage > [data-bid]')].map(e => Math.round(e.getBoundingClientRect().top)));
await page.evaluate(() => webApp._layout('free')); await sleep(400);
const tops2 = await page.evaluate(() => [...webApp._shadow().querySelectorAll('.free > [data-bid]')].map(e => Math.round(e.getBoundingClientRect().top)));
ok((await P())['p' + pid].layout === 'free' && tops.length === tops2.length && tops2.every((y, i) => Math.abs(y - tops[i]) < 40), 'Free from a stack page keeps every block where it was (' + tops + ' → ' + tops2 + ')');
// phone: design shows the stacking note, preview stacks
await page.evaluate(() => webApp._device('phone')); await sleep(300);
ok(await page.evaluate(() => !!webApp._shadow().querySelector('.wl-phonenote') && getComputedStyle(webApp._shadow().querySelector('.free')).display === 'flex' && !webApp._overlay()), 'on the phone screen the page shows as one column (no dragging there)');
await page.click('.wl-tab[data-tab="preview"]'); await sleep(1500);
const fr = await (await page.$('#wlFrameView')).contentFrame();
const pv = await fr.evaluate(async () => { await document.fonts.load('20px "Creepster"'); return { disp: getComputedStyle(document.querySelector('.page.home .free')).display, fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family) }; });
ok(pv.disp === 'flex' && pv.fonts.some(f => /Pacifico/.test(f)) && pv.fonts.some(f => /Creepster/.test(f)), `the preview on a phone is one column and uses the bundled fonts (${pv.fonts.join(', ')})`);
await page.evaluate(() => webApp._device('computer')); await sleep(1500);
const pc = await (await page.$('#wlFrameView')).contentFrame();
ok(await pc.evaluate(() => getComputedStyle(document.querySelector('.page.home .free')).display) === 'grid', 'on a computer the preview keeps the free layout');
// download carries the fonts
await page.click('.wl-tab[data-tab="design"]');
const dl = page.waitForEvent('download'); await page.click('#wlDownload'); const d = await dl;
const file = await (await import('node:fs/promises')).readFile(await d.path(), 'utf8');
ok(/@font-face \{ font-family: "Pacifico"; src: url\(data:font\/woff2;base64,/.test(file) && /font-src data:/.test(file) && !/<script/i.test(file), 'the downloaded website has its fonts inside it');
// save and reopen
const pay = await page.evaluate(() => JSON.stringify(buildPayload()));
await page.evaluate(() => startNewProject('ks2')); await page.evaluate(pl => applyPayload(JSON.parse(pl)), pay); await sleep(800);
const re = await P();
ok(re['p' + pid].layout === 'free' && re['p' + pid].blocks.some(x => x.t === 'shape' && x.font === 'creepster' && x.rot === 15) && re.site.theme.pat === 'stripes', 'everything comes back after saving and reopening');
ok(errors.filter(e => !/sandboxed|allow-scripts/.test(e)).length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
await b.close(); site.close(); done();
