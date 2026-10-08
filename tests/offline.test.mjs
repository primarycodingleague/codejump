// iPad offline mode: only iPads get the Home Screen app + offline helper; the Home Screen app copies every file in
// offline.json, then CodeJump opens and runs with the internet cut off or a school filter answering every request with
// its own "blocked" page; updates fetch only the files that changed. Other devices get none of it.
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { ROOT, ok, done, browser, sleep, require } from './lib.mjs';

const IPAD_UA = 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary', '.webmanifest': 'application/manifest+json' };

// a GitHub-Pages-like server that can pretend to be behind a school filter, and can serve an "updated" file
let blocked = false, changed = null; const hits = [];
const srv = http.createServer((req, out) => {
  const u = new URL(req.url, 'http://x'); hits.push(u.pathname + u.search);
  if (blocked) { out.writeHead(200, { 'Content-Type': 'text/html' }); out.end('<h1>This site is blocked (games)</h1>'); return; }
  const path = decodeURIComponent(u.pathname);
  if (changed && changed[path]) { out.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'text/plain' }); out.end(changed[path]); return; }
  const file = join(ROOT, path.endsWith('/') ? path + 'index.html' : path);
  if (!file.startsWith(ROOT) || !existsSync(file)) { out.writeHead(404); out.end('not found'); return; }
  out.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' }); out.end(readFileSync(file));
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
const B = await browser();

// the internet: Blockly from node_modules, a pretend font, the micro:bit tools; nothing at all once "offline"
let netOff = false; const extHits = [];
async function newCtx(opts = {}) {
  const ctx = await B.newContext({ viewport: { width: 1180, height: 820 }, ...opts });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, async route => {
    const url = route.request().url(); extHits.push(url);
    if (netOff || blocked) return route.abort();
    const cors = { 'Access-Control-Allow-Origin': '*' };
    const m = /unpkg\.com\/blockly@10\.4\.3\/(.+)$/.exec(url);
    if (m) return route.fulfill({ path: join(dirname(require.resolve('blockly/package.json')), m[1]), headers: cors, contentType: /\.js$/.test(m[1]) ? 'text/javascript' : undefined });
    if (/fonts\.googleapis\.com\/css2/.test(url)) return route.fulfill({ headers: cors, contentType: 'text/css', body: "@font-face{font-family:'Montserrat';src:url(https://fonts.gstatic.com/s/montserrat/test.woff2) format('woff2');}" });
    if (/fonts\.gstatic\.com/.test(url)) return route.fulfill({ headers: cors, contentType: 'font/woff2', body: 'not-a-real-font' });
    if (/cdn\.jsdelivr\.net/.test(url)) return route.fulfill({ headers: cors, contentType: 'text/javascript', body: '/* micro:bit tool */' });
    return route.abort();
  });
  await ctx.addInitScript(() => { try { localStorage.setItem('bap_seen_version', 'x'); } catch (e) {} setInterval(() => { const w = document.getElementById('whatsnew'); if (w) w.classList.add('hide'); const pm = document.getElementById('promo-modal'); if (pm) pm.classList.add('hide'); }, 50); });
  return ctx;
}
async function open(ctx, path = '/') {
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(base + path);
  await page.waitForFunction(() => typeof startNewProject === 'function' && typeof offPrepare === 'function', null, { timeout: 30000 });
  await page.evaluate(() => document.getElementById('splash')?.remove());
  return page;
}
const list = JSON.parse(readFileSync(join(ROOT, 'offline.json'), 'utf8'));

// ── not an iPad: nothing changes ──
{
  const ctx = await newCtx();
  const page = await open(ctx);
  await sleep(1500);
  const r = await page.evaluate(async () => ({ on: CJ_OFFLINE_ON, manifest: !!document.querySelector('link[rel=manifest]'), touch: !!document.querySelector('link[rel=apple-touch-icon]'),
    btn: !document.getElementById('h-offline').classList.contains('hide'), sw: (await navigator.serviceWorker.getRegistrations()).length, caches: (await caches.keys()).length }));
  ok(!r.on && !r.manifest && !r.touch && !r.btn && r.sw === 0 && r.caches === 0, 'a laptop gets no Home Screen app, no offline helper and no Use offline button');
  await ctx.close();
}

// ── an iPad in Safari: the Home Screen tags + instructions, but no 30 MB download in Safari ──
{
  const ctx = await newCtx({ userAgent: IPAD_UA, hasTouch: true });
  const page = await open(ctx);
  await page.waitForFunction(async () => (await navigator.serviceWorker.getRegistrations()).length === 1, null, { timeout: 10000 });
  const r = await page.evaluate(() => ({ on: CJ_OFFLINE_ON, standalone: CJ_STANDALONE, manifest: document.querySelector('link[rel=manifest]')?.getAttribute('href'),
    title: document.querySelector('meta[name=apple-mobile-web-app-title]')?.content, btn: document.getElementById('h-offline').textContent.trim() }));
  ok(r.on && !r.standalone && r.manifest === 'app.webmanifest' && r.title === 'CodeJump', 'an iPad gets the Home Screen app details and the offline helper');
  ok(r.btn === 'Use offline', 'the home page shows a Use offline button on an iPad');
  await page.click('#h-offline');
  const txt = await page.textContent('#offline-modal');
  ok(/Add to Home Screen/.test(txt) && /keeps its own saves/.test(txt) && /still need the internet/.test(txt), 'it explains Add to Home Screen, separate saves and what still needs the internet');
  await sleep(3500);
  ok((await page.evaluate(async () => (await caches.keys()).filter(k => /^cj-app-/.test(k)).length)) === 0, 'Safari itself does not download the offline copy');
  const man = JSON.parse(readFileSync(join(ROOT, 'app.webmanifest'), 'utf8'));
  ok(man.display === 'standalone' && man.icons.every(i => existsSync(join(ROOT, i.src))), 'the app manifest opens full screen and its icons exist');
  await ctx.close();
}

// ── the Home Screen app on an iPad ──
const ctx = await newCtx({ userAgent: IPAD_UA, hasTouch: true });
await ctx.addInitScript(() => Object.defineProperty(navigator, 'standalone', { get: () => true }));
let page = await open(ctx);
await page.waitForFunction(() => { try { return !!JSON.parse(localStorage.getItem('cj_offline')); } catch (e) { return false; } }, null, { timeout: 120000 });
let st = await page.evaluate(async () => { const k = (await caches.keys()).filter(k => /^cj-app-/.test(k)); const c = await caches.open(k[0]);
  return { k, n: (await c.keys()).length, cur: await (await (await caches.open('cj-meta')).match('current')).text(), btn: document.getElementById('h-offline').textContent.trim(),
    blockly: !!(await c.match('https://unpkg.com/blockly@10.4.3/blockly_compressed.js')), font: !!(await c.match('https://fonts.gstatic.com/s/montserrat/test.woff2')) }; });
ok(st.k.length === 1 && st.k[0] === 'cj-app-' + list.v && st.cur === st.k[0], 'opening the Home Screen app copies CodeJump onto the iPad by itself');
ok(st.n === list.files.length + list.ext.length + 1, `every file is stored (${st.n}: ${list.files.length} CodeJump files, Blockly, fonts, micro:bit tools)`);
ok(st.blockly && st.font, 'Blockly and the fonts are stored too');
ok(st.btn === 'Ready offline', 'the button now says Ready offline');

// a school filter that answers everything with its own page, then no internet at all
for (const how of ['filter', 'offline']) {
  blocked = how === 'filter'; netOff = how === 'offline'; if (netOff) await ctx.setOffline(true);
  hits.length = 0;
  page = await open(ctx, '/?s=abc1234');
  const r = await page.evaluate(async () => ({ blockly: typeof Blockly === 'object' && !!Blockly.inject, still: !!JSON.parse(localStorage.getItem('cj_offline')) }));
  ok(r.blockly && r.still, `CodeJump opens with ${how === 'filter' ? 'a school filter blocking it' : 'no internet'} (Blockly too)`);
  if (how === 'filter') ok(hits.filter(h => !/offline\.json/.test(h) && !/sw\.js/.test(h)).length === 0, 'nothing but the update check went to the (blocked) network');
  await page.evaluate(() => startNewCraft('ks2'));
  await page.waitForFunction(() => typeof craftApp !== 'undefined' && craftApp && craftApp._ws() && craftApp._world(), null, { timeout: 60000 });
  ok(await page.evaluate(() => craftApp._ws().getTopBlocks().length > 0 && craftApp._world().get(5, 12, 5) > 0), `the Build Lab opens and works (${how})`);
  const mods = await page.evaluate(async () => { const out = []; for (const f of [loadRobotLab, loadAiLab, loadTrainLab, loadLessons]) { try { await f(); out.push(1); } catch (e) { out.push(0); } } return out.join(''); });
  ok(mods === '1111', `the Robot, AI and Train Labs and the lessons load (${how})`);
  const files = await page.evaluate(async () => { const r = await Promise.all(['world/world-app.js', 'critter/vendor/rapier3d-compat-0.21.0.min.js', 'lessons/starters/turtle-shapes.json', 'home/craft.jpg'].map(p => fetch(p).then(x => x.ok ? x.blob() : null).catch(() => null))); return r.map(b => b && b.size > 100 ? 1 : 0).join(''); });
  ok(files === '1111', `the 3D World, Critter Lab, lesson starters and pictures are there (${how})`);
  ok(await page.evaluate(async () => { try { await offPrepare(); return false; } catch (e) { return /internet/.test(e.message); } }), `checking for updates says it can't reach CodeJump, and keeps the copy (${how})`);
  if (netOff) await ctx.setOffline(false);
  blocked = netOff = false;
}

// an update: only the changed file is downloaded; the new version is used next time CodeJump opens
{
  const p = 'robot/robot-blocks.js', body = readFileSync(join(ROOT, p), 'utf8') + '\n// update test\n';
  const { createHash } = await import('node:crypto');
  const h = createHash('sha256').update(body).digest('hex').slice(0, 16);
  const nl = { ...list, files: list.files.map(f => f[0] === p ? [p, Buffer.byteLength(body), h] : f) }; nl.v = 'test' + h.slice(0, 6);
  changed = { ['/' + p]: body, '/offline.json': JSON.stringify(nl) };
  hits.length = 0;
  page = await open(ctx);
  await page.waitForFunction(v => { try { return JSON.parse(localStorage.getItem('cj_offline')).v === v; } catch (e) { return false; } }, nl.v, { timeout: 60000 });
  const got = hits.filter(x => /\?cjv=/.test(x));
  ok(got.length === 1 && got[0].startsWith('/' + p), 'an update downloads only the file that changed (' + got.join(', ') + ')');
  const ks = await page.evaluate(async () => (await caches.keys()).filter(k => /^cj-app-/.test(k)).sort());
  ok(ks.length === 2 && ks.includes('cj-app-' + nl.v), 'the old copy is kept for pages still open, the new one becomes current');
  ok(!(await page.evaluate(async () => (await (await fetch('robot/robot-blocks.js')).text()).includes('update test'))), 'the open page keeps using the version it started with');
  page = await open(ctx);
  ok(await page.evaluate(async () => (await (await fetch('robot/robot-blocks.js')).text()).includes('update test')), 'the next time it opens, it uses the new version');
  changed = null;
}

// a download cut short by a broken file keeps the working copy
{
  changed = { '/offline.json': JSON.stringify({ ...list, v: 'broken1', files: list.files.map(f => f[0] === 'ai/ai-model.js' ? [f[0], f[1], '0000000000000000'] : f) }) };
  const err = await page.evaluate(async () => { try { await offPrepare(); return ''; } catch (e) { return e.message; } });
  const cur = await page.evaluate(async () => (await (await caches.open('cj-meta')).match('current')).text());
  ok(/part way/.test(err) && cur !== 'cj-app-broken1', 'a download that goes wrong part way says so and keeps the working copy');
  changed = null;
}
await ctx.close();
await B.close(); srv.close();
done();
