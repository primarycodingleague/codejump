// Tablets: every screen at iPad and Fire 8 sizes, landscape and portrait, as a touch screen. Charlie (26 Nov 2026): "on tablets
// it feels clanky; things don't resize properly". For each screen and size this checks that nothing makes the page scroll
// sideways, that the important controls can be reached (on screen, or scrolled into view inside a panel that scrolls), that
// the main touch controls are at least 40px, that canvases fit their space, and in portrait that the Code / Run switch shows
// one pane at a time and each pane fills the screen. TABLET=<name> runs only screens whose name contains it.
import { serve, browser, sleep, ok, done, require } from './lib.mjs';
import { join, dirname } from 'node:path';

export const PROFILES = [
  { id: 'ipadL', w: 1024, h: 700, dpr: 2 }, { id: 'ipadP', w: 768, h: 950, dpr: 2 },
  { id: 'fireL', w: 962, h: 540, dpr: 1.33 }, { id: 'fireP', w: 601, h: 900, dpr: 1.33 }
];
const portrait = p => p.h > p.w;

// a touch context that serves Blockly locally, like openApp
async function touchPage(b, base, prof, errors) {
  const ctx = await b.newContext({ viewport: { width: prof.w, height: prof.h }, deviceScaleFactor: prof.dpr, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(prof.id + ': ' + e.message));
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, async route => {
    const m = /unpkg\.com\/blockly@10\.4\.3\/(.+)$/.exec(route.request().url());
    if (m) return route.fulfill({ path: join(dirname(require.resolve('blockly/package.json')), m[1]), contentType: 'text/javascript' });
    return route.abort();
  });
  await page.addInitScript(() => { setInterval(() => { for (const id of ['whatsnew', 'promo-modal']) { const w = document.getElementById(id); if (w) w.classList.add('hide'); } }, 100); try { localStorage.setItem('bap_tutorial_done', '1'); } catch (e) { /* none */ } });
  await page.goto(base + '/build-and-play.html');
  await page.waitForFunction(() => typeof startNewProject === 'function');
  await page.evaluate(() => document.getElementById('splash')?.remove());
  return { ctx, page };
}

// can every selector be reached? (visible, and inside the window after scrolling it into view)
async function reach(page, sels) {
  return page.evaluate(sels => sels.map(sel => {
    const el = document.querySelector(sel); if (!el) return sel + ': missing';
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const r = el.getBoundingClientRect(), st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || r.width < 2 || r.height < 2) return sel + ': hidden';
    const W = innerWidth, H = innerHeight, bar = document.body.classList.contains('pv-on') ? 58 : 0;
    if (r.right < 1 || r.left > W - 1 || r.bottom < 1 || r.top > H - bar - 1 || r.bottom > H - bar + 1 && r.height < H / 2 || r.top < -1 && r.height < H / 2) return sel + ': off screen (' + Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + '×' + Math.round(r.height) + ')';
    return null;
  }).filter(Boolean), sels);
}
async function tapSizes(page, sels) {
  return page.evaluate(sels => { const out = []; for (const sel of sels) for (const el of document.querySelectorAll(sel)) { const r = el.getBoundingClientRect(); if (r.width < 2 || getComputedStyle(el).display === 'none') continue; if (r.height < 39.5 || r.width < 39.5) out.push(sel + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); } return out; }, sels);
}
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1 ? document.documentElement.scrollWidth : 0);

// the screens. open(page) gets there; reach = must be reachable; taps = must be ≥40px; panes = the portrait panes and, for
// each, a selector that should then fill most of the screen; fit = [canvas, its box] that must fit
export const SCREENS = [
  { name: 'home', open: async () => {}, reach: ['#h-new'], taps: ['#h-new'] },
  { name: 'chooser', open: async page => { await page.evaluate(() => { document.getElementById('ks-modal').classList.remove('hide'); }); }, reach: ['#ks-modal h2', '#ks-modal [data-ks=ks2]', '#ks-cancel'] },
  { name: 'labs', open: async page => { await page.evaluate(() => { _pendingKs = 'ks2'; document.getElementById('pt-modal').classList.remove('hide'); }); }, reach: ['#pt-modal .ks-opt[data-pt="platformer"]', '#pt-cancel'] },
  { name: 'platformer', open: async page => { await page.evaluate(() => startNewProject('ks2')); await sleep(600); },
    reach: ['#btn-build', '#btn-play', '#btn-code'], taps: ['#toolbar .tbtn:not(.hide)', '#toolbar .mode-btn'], fit: ['#gc', '#cwrap'] },
  { name: 'stage', open: async page => { await page.evaluate(() => startNewStage('ks2')); await page.waitForFunction(() => document.querySelector('#blockly-div .blocklyWorkspace'), null, { timeout: 30000 }); await sleep(500); },
    reach: ['#st-run'], taps: ['#toolbar .tbtn:not(.hide)', '.blocklyTreeRow'], panes: { code: '#code-panel', run: '#stage-right' }, paneReach: { run: ['#st-run'] } },
  { name: 'stage-ks1', open: async page => { await page.evaluate(() => startNewStage('ks1')); await sleep(800); }, reach: ['#ks1-ui'] },
  { name: 'turtle', open: async page => { await page.evaluate(() => startNewTurtle('ks2')); await sleep(600); },
    reach: ['#tt-run', '#turtle-code'], taps: ['#turtle-bar button'], panes: { code: '#turtle-left', run: '#turtle-right' } }
];

const site = await serve(), b = await browser(), errors = [];
const only = process.env.TABLET;
try {
  for (const prof of PROFILES) {
    for (const sc of SCREENS) {
      if (only && !sc.name.includes(only)) continue;
      const { ctx, page } = await touchPage(b, site.url, prof, errors);
      const tag = sc.name + ' · ' + prof.id;
      try {
        await sc.open(page); await sleep(300);
        const ov = await overflow(page); ok(!ov, tag + ': nothing makes the page scroll sideways' + (ov ? ' (' + ov + 'px wide)' : ''));
        const want = sc.reach && sc.panes && portrait(prof) && sc.paneReach ? sc.reach.filter(x => !Object.values(sc.paneReach).flat().includes(x)) : sc.reach;
        if (want) { const r = await reach(page, want); ok(!r.length, tag + ': the important controls can be reached' + (r.length ? ' — ' + r.join('; ') : '')); }
        if (sc.taps) { const t = await tapSizes(page, sc.taps); ok(!t.length, tag + ': touch controls are at least 40px' + (t.length ? ' — ' + t.slice(0, 6).join('; ') : '')); }
        if (sc.fit) { const f = await page.evaluate(([c, w]) => { const a = document.querySelector(c).getBoundingClientRect(), z = document.querySelector(w).getBoundingClientRect(); return a.left >= z.left - 1 && a.right <= z.right + 1 && a.top >= z.top - 1 && a.bottom <= z.bottom + 1 && a.width > z.width * 0.6 || a.height > z.height * 0.6 ? null : [a.left, a.top, a.width, a.height, z.left, z.top, z.width, z.height].map(Math.round).join(','); }, sc.fit);
          ok(!f, tag + ': the canvas fits its space' + (f ? ' (' + f + ')' : '')); }
        if (sc.panes && portrait(prof)) {
          const ids = Object.keys(sc.panes);
          ok(await page.evaluate(ids => document.body.classList.contains('pv-on') && [...document.querySelectorAll('#pv-bar [data-pv]')].map(x => x.dataset.pv).join() === ids.join(), ids), tag + ': the Code / Run switch shows ' + ids.join(' / '));
          for (const id of ids) {
            await page.evaluate(id => cjPane(id), id); await sleep(250);
            const fill = await page.evaluate(([sel, others]) => { const el = document.querySelector(sel), r = el.getBoundingClientRect(); const hidden = others.every(o => { const x = document.querySelector(o); return !x || getComputedStyle(x).display === 'none' || x.getBoundingClientRect().height < 2; }); return { h: r.height / (innerHeight - 58), w: r.width / innerWidth, hidden }; }, [sc.panes[id], ids.filter(x => x !== id).map(x => sc.panes[x])]);
            ok(fill.h > 0.6 && fill.w > 0.85 && fill.hidden, tag + ': the ' + id + ' pane fills the screen on its own (' + Math.round(fill.h * 100) + '% tall, ' + Math.round(fill.w * 100) + '% wide)');
            if (sc.paneReach && sc.paneReach[id]) { const r = await reach(page, sc.paneReach[id]); ok(!r.length, tag + ': the ' + id + ' pane’s controls can be reached' + (r.length ? ' — ' + r.join('; ') : '')); }
          }
        } else if (sc.panes) ok(!(await page.evaluate(() => document.body.classList.contains('pv-on'))), tag + ': landscape shows everything side by side (no switch)');
      } catch (e) { ok(false, tag + ': ' + e.message.split('\n')[0]); }
      await ctx.close();
    }
  }
  ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 4).join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
