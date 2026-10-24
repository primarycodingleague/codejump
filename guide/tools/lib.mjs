// Shared helpers for making Teacher Guide clips: open a local CodeJump with Montserrat, no real cloud, and sample pupils.
// Everything here is made up: no accounts, no network calls leave the machine.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, browser, require } from '../../tests/lib.mjs';
export const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, '..', '..');
const FONTS = join(HERE, 'fonts');
const FONT_CSS = [500, 600, 700, 800].map(w => `@font-face{font-family:'Montserrat';font-weight:${w};font-style:normal;src:url(/__font/${w}.woff2) format('woff2');}`).join('\n');

// sample pupils (obviously made up)
export const PUPILS = [
  { uid: 'u1', displayName: 'rocket-ray', realName: 'Ray' }, { uid: 'u2', displayName: 'pixel-fox', realName: 'Fran' },
  { uid: 'u3', displayName: 'jump-ace', realName: 'Ali' }, { uid: 'u4', displayName: 'code-comet', realName: 'Cara' },
  { uid: 'u5', displayName: 'star-byte', realName: 'Sam' }, { uid: 'u6', displayName: 'lava-leap', realName: 'Leo' }
];

// open the app at 1280×720 (device scale 1.5); the cloud and every other outside request are blocked
export async function openPage({ scale = 1.5, width = 1280, height = 720 } = {}) {
  const site = await serve(), b = await browser();
  const ctx = await b.newContext({ viewport: { width, height }, deviceScaleFactor: scale, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, async route => {
    const url = route.request().url();
    const m = /unpkg\.com\/blockly@10\.4\.3\/(.+)$/.exec(url);
    if (m) return route.fulfill({ path: join(dirname(require.resolve('blockly/package.json')), m[1]), contentType: 'text/javascript' });
    if (/fonts\.googleapis\.com/.test(url)) return route.fulfill({ body: FONT_CSS, contentType: 'text/css' });
    return route.abort(); // the real cloud is never called
  });
  await page.route(/\/__font\/(\d+)\.woff2$/, r => r.fulfill({ body: readFileSync(join(FONTS, `montserrat-latin-${/(\d+)\.woff2$/.exec(r.request().url())[1]}-normal.woff2`)), contentType: 'font/woff2' }));
  await page.addInitScript(() => { localStorage.setItem('bap_seen_version', 'x'); localStorage.setItem('cj_country', 'england'); setInterval(() => { for (const id of ['whatsnew', 'promo-modal']) { const w = document.getElementById(id); if (w) w.classList.add('hide'); } }, 50); });
  await page.goto(site.url + '/build-and-play.html');
  await page.waitForFunction(() => typeof startNewProject === 'function' && typeof openShareModal === 'function');
  await page.evaluate(() => { document.getElementById('splash')?.remove(); document.getElementById('wn-close')?.click(); });
  await page.evaluate(() => document.fonts.ready);
  return { site, b, ctx, page, errors, close: async () => { await b.close(); site.close(); } };
}

// sign in a sample pupil and answer the cloud from sample data (cloudApi is replaced in the page)
export async function stubCloud(page, me, data) {
  await page.evaluate(({ me, data }) => {
    window.__cloudData = data;
    cloudToken = 'sample-token'; cloudMe = Object.assign({ role: 'student', classes: [], projects: [] }, me);
    cloudApi = async (path) => { const d = window.__cloudData[path]; if (d === undefined) throw new Error('not in the sample'); return JSON.parse(JSON.stringify(d)); };
    collabConnect = () => {}; // no live room is opened
    try { updateAccountChips(); } catch (e) {}
    const tc = document.getElementById('t-cloud'); if (tc) tc.style.display = '';
  }, { me, data });
}

// a "shot": the screen now, plus the box (CSS px) of the thing to point at
export async function shot(page, dir, name, target, opts = {}) {
  mkdirSync(dir, { recursive: true });
  await page.waitForTimeout(opts.wait ?? 350);
  let box = null;
  if (target) box = await page.evaluate(sel => { const el = typeof sel === 'string' ? document.querySelector(sel) : null; if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, target);
  if (target && !box) throw new Error('target not found: ' + target);
  await page.screenshot({ path: join(dir, name + '.png') });
  return { img: name + '.png', box, ...(opts.type ? { type: opts.type } : {}) };
}
export function saveShots(dir, shots) { writeFileSync(join(dir, 'shots.json'), JSON.stringify(shots, null, 1)); }

// Step "start a project in this lab": home → Start building → Key Stage 2 → the lab's tile (real clicks). Adds shots
// <p>a/<p>b/<p>c to S and leaves the lab open.
export async function startLab(page, dir, S, p, pt, ks = 'ks2') {
  S[p + 'a'] = await shot(page, dir, p + 'a', '#h-new');
  await page.click('#h-new');
  await page.waitForSelector('#ks-modal:not(.hide) [data-ks=' + ks + ']');
  S[p + 'b'] = await shot(page, dir, p + 'b', '#ks-modal [data-ks=' + ks + ']');
  await page.click('#ks-modal [data-ks=' + ks + ']');
  await page.waitForSelector('#pt-modal:not(.hide) .ks-opt[data-pt="' + pt + '"]');
  S[p + 'c'] = await shot(page, dir, p + 'c', '#pt-modal .ks-opt[data-pt="' + pt + '"]');
  await page.click('#pt-modal .ks-opt[data-pt="' + pt + '"]');
}
