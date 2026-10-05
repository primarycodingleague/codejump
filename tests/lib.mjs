// Shared helpers for the CodeJump tests.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..'); // the repo = the live site
export const require = createRequire(import.meta.url);

let failed = 0;
export function ok(cond, msg) { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) failed++; return !!cond; }
export function done() { process.exit(failed ? 1 : 0); }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.wasm': 'application/wasm', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary',
  '.otf': 'font/otf', '.mp4': 'video/mp4', '.hex': 'text/plain' };

// Serve the repo folder like GitHub Pages does (404.html is not needed for the app itself).
export function serve() {
  return new Promise(res => {
    const srv = http.createServer(async (req, out) => {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const file = join(ROOT, path.endsWith('/') ? path + 'index.html' : path);
      if (!file.startsWith(ROOT) || !existsSync(file)) { out.writeHead(404); out.end('not found'); return; }
      try { const body = await readFile(file); out.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' }); out.end(body); }
      catch (e) { out.writeHead(404); out.end('not found'); }
    });
    srv.listen(0, '127.0.0.1', () => res({ url: 'http://127.0.0.1:' + srv.address().port, close: () => srv.close() }));
  });
}

// A Chromium browser. Locally the session's preinstalled Chromium is used; in GitHub Actions, Playwright's own.
export async function browser() {
  const { chromium } = await import('playwright');
  const opts = { args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
  if (existsSync('/opt/pw-browsers/chromium')) opts.executablePath = '/opt/pw-browsers/chromium';
  return chromium.launch(opts);
}

// Open CodeJump in a fresh browser profile. Everything off the test server is blocked (fonts, the real cloud) except
// Blockly, which is answered from node_modules so the tests never depend on unpkg. `cloud` (optional) answers
// requests to the CodeJump cloud: (path, method, body) → {status, json}.
export async function openApp(b, base, { page: pagePath = '/build-and-play.html', cloud, errors = [], init } = {}) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, async route => {
    const url = route.request().url();
    const m = /unpkg\.com\/blockly@10\.4\.3\/(.+)$/.exec(url);
    if (m) return route.fulfill({ path: join(dirname(require.resolve('blockly/package.json')), m[1]), contentType: 'text/javascript' });
    if (cloud && /codejump-cloud\./.test(url)) {
      const u = new URL(url), r = await cloud(u.pathname, route.request().method(), route.request().postData());
      return route.fulfill({ status: r.status || 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(r.json || {}) });
    }
    return route.abort();
  });
  // the What's New popup can appear at any time; keep it out of the way
  await page.addInitScript(() => { setInterval(() => { const w = document.getElementById('whatsnew'); if (w) w.classList.add('hide'); }, 50); });
  if (init) await page.addInitScript(init);
  await page.goto(base + pagePath);
  await page.waitForFunction(() => typeof startNewProject === 'function' && typeof buildPayload === 'function');
  await page.evaluate(() => document.getElementById('splash')?.remove());
  return { ctx, page };
}

export const sleep = ms => new Promise(r => setTimeout(r, ms));
