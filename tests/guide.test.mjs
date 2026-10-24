// The Teacher Guide dashboard: topic list, #guide/<id> links, converted topics (steps, loops, the full video and its chapters),
// the old text for every other topic, phones, reduced motion, offline (no media), print, and no lost words.
import { readFileSync, existsSync, statSync, mkdtempSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { serve, browser, openApp, ok, done, sleep, ROOT } from './lib.mjs';

const G = await import(join(ROOT, 'guide', 'topics.js'));
const site = await serve(), b = await browser();
const errors = [];

// ---- data (Node) ----
ok(G.TOPICS.length >= 20 && new Set(G.TOPICS.map(t => t.id)).size === G.TOPICS.length, 'topics have unique ids');
ok(G.TOPICS.every(t => t.group >= 0 && t.group < G.GROUPS.length && t.legacy && t.legacy.length), 'every topic has a group and its old text');
for (const t of G.TOPICS.filter(G.converted)) {
  ok(t.summary && t.steps.length >= 3 && t.steps.length <= 6, t.id + ': summary and 3–6 steps');
  ok(t.steps.every(s => s.title && s.text && G.WHO[s.who]), t.id + ': every step has a title, an instruction and a who chip');
  ok(!t.tips || (t.tips.length >= 2 && t.tips.length <= 4), t.id + ': 2–4 Good to know facts');
  const timing = JSON.parse(readFileSync(join(ROOT, 'guide', t.video.src.replace('full.mp4', 'timing.json'), '..', 'timing.json').replace('/media/', '/media/'), 'utf8'));
  ok(Math.abs(timing.length - t.video.length) < 0.05 && t.steps.every((s, i) => Math.abs(s.at - timing.starts[i]) < 0.05), t.id + ': step times match the rendered video');
  const files = [t.video.src, t.video.poster, t.video.captions, ...t.steps.flatMap(s => [s.clip + '.mp4', s.clip + '.jpg'])];
  ok(files.every(f => existsSync(join(ROOT, 'guide', f))), t.id + ': every video, loop and poster file exists');
  const loops = t.steps.map(s => statSync(join(ROOT, 'guide', s.clip + '.mp4')).size);
  ok(loops.every(n => n < 600e3), t.id + ': step loops are small (' + loops.map(n => Math.round(n / 1e3) + ' KB').join(', ') + ')');
}

// The open-source Chromium the tests use can't play H.264 (Chrome, Edge and Safari can), so it is given WebM copies of the
// same videos. Without ffmpeg the playback checks are skipped and only the "media can't load" path is seen.
const probe = await (await b.newContext()).newPage();
const H264 = !!await probe.evaluate(() => document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028"'));
let WEBM = null;
if (!H264 && !process.env.GUIDE_NOVIDEO) try {
  WEBM = mkdtempSync(join(tmpdir(), 'cj-guide-'));
  for (const d of readdirSync(join(ROOT, 'guide', 'media'))) for (const f of readdirSync(join(ROOT, 'guide', 'media', d)).filter(f => f.endsWith('.mp4')))
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', join(ROOT, 'guide', 'media', d, f), '-c:v', 'libvpx-vp9', '-deadline', 'realtime', '-cpu-used', '8', '-b:v', '600k', '-an', join(WEBM, d + '-' + f.replace('.mp4', '.webm'))]);
} catch (e) { WEBM = null; console.log('NOTE no ffmpeg: video playback is not checked here'); }
const PLAYS = H264 || !!WEBM;
// answers like GitHub Pages does, with byte ranges (a video can only jump to a time when the server allows ranges)
const ranged = (route, file, type) => { const buf = readFileSync(file), h = route.request().headers().range, m = h && /bytes=(\d*)-(\d*)/.exec(h);
  if (!m) return route.fulfill({ status: 200, body: buf, headers: { 'Content-Type': type, 'Accept-Ranges': 'bytes' } });
  const a = m[1] ? +m[1] : 0, z = m[2] ? Math.min(+m[2], buf.length - 1) : buf.length - 1;
  return route.fulfill({ status: 206, body: buf.subarray(a, z + 1), headers: { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${a}-${z}/${buf.length}` } }); };
const media = async pg => { await pg.route(/\/guide\/media\/([\w-]+)\/([\w-]+)\.mp4$/, r => { const m = /\/guide\/media\/([\w-]+)\/([\w-]+)\.mp4$/.exec(r.request().url());
  return WEBM ? ranged(r, join(WEBM, m[1] + '-' + m[2] + '.webm'), 'video/webm') : ranged(r, join(ROOT, 'guide', 'media', m[1], m[2] + '.mp4'), 'video/mp4'); }); };

// ---- the app ----
const { ctx, page } = await openApp(b, site.url, { errors, init: () => {} });
await media(page);
const H = await page.evaluate(() => {
  // every h3 of the old guide belongs to exactly one topic
  const d = document.createElement('div'); d.innerHTML = teacherGuideHTML();
  return [...d.querySelectorAll('h3')].map(h => h.textContent.trim());
});
ok(H.every(h => G.TOPICS.filter(t => t.legacy.some(k => h.startsWith(k))).length === 1), 'every section of the old guide is in exactly one topic (' + H.length + ')');

await page.evaluate(() => { document.getElementById('h-guide').click(); });
await page.waitForSelector('.gd-nav .gd-topic');
ok(await page.locator('.gd-group h2').count() === 6 - 1 && await page.locator('.gd-topic').count() === G.TOPICS.length + 1, 'topic list: 5 groups, every topic + the whole guide');
ok(await page.locator('.gd-topic[data-topic=collab] .gd-dot').count() === 1 && await page.locator('.gd-topic[data-topic=what] .gd-dot').count() === 0, 'converted topics have a dot');
ok(await page.locator('.gd-main h1').textContent() === G.TOPICS[0].title, 'opens on the first topic');

// an unconverted topic shows its old text
await page.click('.gd-topic[data-topic=ipad]');
ok(/#guide\/ipad$/.test(page.url()) && /Use offline/.test(await page.locator('.gd-legacy').textContent()), 'an unconverted topic shows the old text and sets #guide/ipad');
ok(await page.locator('.gd-topic.on').getAttribute('aria-current') === 'page', 'the open topic is marked');

// the converted topic
await page.click('.gd-topic[data-topic=collab]');
const t = G.topic('collab');
ok(await page.locator('.gd-eyebrow').textContent() === 'Your class' && await page.locator('.gd-sum').textContent() === t.summary, 'collab: eyebrow, title and summary');
ok((await page.locator('.gd-before').textContent()).includes('Teacher Hub → My classes'), 'collab: Before you start');
ok(/Watch it all\s*0:40/.test(await page.locator('#gd-watch').textContent()), 'Watch it all shows the length');
ok(await page.locator('.gd-step').count() === 6 && await page.locator('.gd-who').first().textContent() === 'Everyone', '6 step cards with who chips');
ok(await page.locator('.gd-tips li').count() === 4 && await page.locator('details.gd-more .gd-legacy').count() === 1, 'Good to know + the full old notes');
const v = await page.evaluate(() => { const m = document.querySelector('.gd-clip video'); return m && { muted: m.muted, loop: m.loop, inline: m.playsInline, pre: m.preload }; });
ok(!PLAYS || (v && v.muted && v.loop && v.inline && v.pre === 'none'), 'step clips are muted, looping, inline and lazy');
await sleep(800);
const loaded = await page.evaluate(() => [...document.querySelectorAll('.gd-clip video')].map(m => !!m.getAttribute('src')));
ok(!PLAYS || (loaded[0] && !loaded[5]), 'only clips on screen are loaded (' + loaded.map(Number).join('') + ')');

// clicking a step's clip opens the full video at that step
await page.locator('.gd-step[data-i="3"]').scrollIntoViewIfNeeded(); await sleep(400);
await page.evaluate(() => document.getElementById('teacher').scrollTo(0, 99999)); await sleep(900);
const vis = await page.evaluate(() => [...document.querySelectorAll('.gd-clip video')].map(m => { const r = m.getBoundingClientRect(); return { on: r.bottom > -100 && r.top < innerHeight + 100, play: !m.paused }; }));
ok(!PLAYS || (vis.some(v => v.play) && vis.every(v => v.on || !v.play) && vis.some(v => !v.on)), 'loops play only while on screen (' + vis.map(v => (v.on ? 'S' : 's') + (v.play ? 'P' : 'p')).join(' ') + ')');
await page.click(PLAYS ? '.gd-step[data-i="3"] .gd-clip' : '#gd-watch');
await page.waitForFunction(() => !document.getElementById('gd-player').classList.contains('hide'));
ok(await page.evaluate(() => document.getElementById('gd-full').getAttribute('src') || document.getElementById('gd-full').src) !== '', 'clicking a clip opens the full video');
if (PLAYS) {
  await page.waitForFunction(() => document.getElementById('gd-full').currentTime >= 17.9, null, { timeout: 15000 });
  const at = await page.evaluate(() => document.getElementById('gd-full').currentTime);
  ok(at >= 17.9 && at < 21, 'the full video starts at step 4 (' + at.toFixed(1) + ' s)');
  await page.waitForFunction(() => document.querySelector('.gd-step.now'), null, { timeout: 8000 }).catch(() => {});
  ok(await page.evaluate(() => document.querySelector('.gd-step.now')?.dataset.i === '3' && document.querySelector('.gd-chap.now')?.dataset.i === '3'), 'while it plays, step 4 and its chapter are highlighted');
  await page.click('.gd-chap[data-i="1"]');
  await page.waitForFunction(() => { const c = document.getElementById('gd-full').currentTime; return c >= 11.3 && c < 14; }, null, { timeout: 8000 });
  ok(true, 'a chapter button jumps to its step');
}
ok((await page.locator('.gd-chap').first().textContent()).replace(/\s+/g, ' ').trim() === '0:02 Step 1', 'chapter buttons show the time and step');

// a link straight to a topic, on a fresh page
const p2 = await ctx.newPage(); p2.on('pageerror', e => errors.push(e.message));
await p2.addInitScript(() => setInterval(() => { for (const id of ['whatsnew', 'promo-modal']) document.getElementById(id)?.classList.add('hide'); }, 50));
await media(p2);
await p2.goto(site.url + '/build-and-play.html#guide/train');
await p2.waitForSelector('.gd-topic.on[data-topic=train]', { timeout: 15000 });
ok(/Train Lab/.test(await p2.locator('.gd-main h1').textContent()), 'a #guide/train link opens that topic');
await p2.evaluate(() => { location.hash = '#guide/collab'; });
await p2.waitForSelector('.gd-topic.on[data-topic=collab]');
ok(true, 'changing the hash changes the topic');
await p2.click('#t-guide .th-chip.gold');
ok(!/#guide/.test(p2.url()), 'leaving the guide clears the link');
await p2.close();

// print = words, not videos
const pr = await page.evaluate(() => guidePrintHTML());
ok(!/<video|<img/.test(pr) && pr.includes('Tick up to 5 teammates') && pr.includes('Use offline') && pr.includes('Good to know'), 'print has every topic’s words and no videos');

// the whole guide on one page keeps every old word
await page.click('.gd-topic[data-topic=all]');
ok((await page.locator('.gd-legacy h3').count()) === H.length, 'the whole old guide is still reachable');

// phone width
const ph = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const pp = await ph.newPage(); pp.on('pageerror', e => errors.push(e.message));
await pp.addInitScript(() => setInterval(() => { for (const id of ['whatsnew', 'promo-modal']) document.getElementById(id)?.classList.add('hide'); }, 50));
await pp.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
await pp.goto(site.url + '/build-and-play.html#guide/collab');
await pp.waitForSelector('.gd-topic.on[data-topic=collab]', { timeout: 15000 });
const lay = await pp.evaluate(() => { const n = document.querySelector('.gd-nav'), s = document.querySelector('.gd-step'); return { navScroll: n.scrollWidth > n.clientWidth, navH: n.getBoundingClientRect().height, stepW: s.getBoundingClientRect().width, page: document.documentElement.scrollWidth }; });
ok(lay.navScroll && lay.navH < 90 && lay.stepW > 300 && lay.page <= 390, 'phone: the topics scroll sideways and the steps fill the width (' + JSON.stringify(lay) + ')');
await ph.close();

// reduced motion: stills, no videos playing
const rm = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
const rp = await rm.newPage(); rp.on('pageerror', e => errors.push(e.message));
await rp.addInitScript(() => setInterval(() => { for (const id of ['whatsnew', 'promo-modal']) document.getElementById(id)?.classList.add('hide'); }, 50));
await rp.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
await rp.goto(site.url + '/build-and-play.html#guide/collab');
await rp.waitForSelector('.gd-step');
await sleep(500);
ok(await rp.locator('.gd-clip img').count() === 6 && await rp.locator('.gd-clip video').count() === 0, 'reduced motion: a still picture per step, no loops');
await rm.close();

// offline: the media can't load, the words still make sense
const off = await b.newContext({ viewport: { width: 1280, height: 800 } });
const op = await off.newPage(); op.on('pageerror', e => errors.push(e.message));
await op.addInitScript(() => setInterval(() => { for (const id of ['whatsnew', 'promo-modal']) document.getElementById(id)?.classList.add('hide'); }, 50));
await op.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
await op.route(/\/guide\/media\//, r => r.abort());
await op.goto(site.url + '/build-and-play.html#guide/collab');
await op.waitForSelector('.gd-step');
await op.mouse.wheel(0, 2000); await sleep(1200); await op.mouse.wheel(0, -2000); await sleep(600);
ok(await op.locator('.gd-step h3').count() === 6 && (await op.locator('.gd-step').first().textContent()).includes('Every pupil signs in'), 'offline: every step’s words are there');
const left = await op.locator('.gd-clip').count();
ok(left < 6, 'offline: clips that fail to load are taken away (' + left + ' left)');
await op.click('#gd-watch');
await op.waitForSelector('#gd-vmsg:not(.hide)', { timeout: 8000 }).catch(() => {});
ok(await op.locator('#gd-vmsg:not(.hide)').count() === 1, 'offline: the full video says it can’t load and points at the steps');
await off.close();

// the module itself can't load: the old guide is shown whole
const nm = await b.newContext({ viewport: { width: 1280, height: 800 } });
const np = await nm.newPage();
await np.addInitScript(() => setInterval(() => { for (const id of ['whatsnew', 'promo-modal']) document.getElementById(id)?.classList.add('hide'); }, 50));
await np.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
await np.route(/\/guide\/topics\.js/, r => r.abort());
await np.goto(site.url + '/build-and-play.html#guide/collab');
await np.waitForSelector('.gd-fallback', { timeout: 15000 });
ok((await np.locator('.gd-fallback h3').count()) === H.length, 'if the guide data can’t load, the whole old guide shows');
await nm.close();

ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
await b.close(); site.close(); done();
