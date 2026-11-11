/* Web Lab — build a website with blocks (Design), see and edit its real HTML and CSS (Code), and try it (Preview).
 * Lazy-loaded by build-and-play.html when a Web Lab project opens, and mounted into #web-ui. CodeJump owns saving and
 * sharing: getProject() goes into the payload as `web`.
 *   const app = mount(root, { project, onChange, toast, confirm, failed, onGoalsDone })
 *   app.getProject() · app.setProject(p) · app.resume() · app.pause() · app.destroy() · liveParts() / liveSet() / liveBusy()
 * The page being designed is drawn inside a shadow root (the site's own CSS can't leak into CodeJump); Preview shows the
 * real site in a sandboxed frame with no scripts. Nothing a pupil types can run code: web-model.js rebuilds every piece of
 * HTML/CSS from a whitelist. */
import * as W from './web-model.js';

const CSS_URL = new URL('./web-app.css', import.meta.url).href;
const I = (d, extra = '') => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${d}</svg>`;
const ICON = {
  heading: I('<path d="M6 4v16M18 4v16M6 12h12"/>'), text: I('<path d="M4 6h16M4 10h16M4 14h12M4 18h9"/>'),
  image: I('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>'),
  button: I('<rect x="3" y="7" width="18" height="10" rx="5"/><path d="M9 12h6"/>'), list: I('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>'),
  quote: I('<path d="M7 7h4v6H5v-2a4 4 0 0 1 2-4zM15 7h4v6h-6v-2a4 4 0 0 1 2-4z"/>'), banner: I('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 11h12M8 15h8"/>'),
  card: I('<rect x="4" y="3" width="16" height="18" rx="2"/><rect x="7" y="6" width="10" height="6" rx="1"/><path d="M7 15h10M7 18h6"/>'),
  columns: I('<rect x="3" y="4" width="8" height="16" rx="1"/><rect x="13" y="4" width="8" height="16" rx="1"/>'), table: I('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M10 4v16"/>'),
  divider: I('<path d="M3 12h18"/><path d="M7 7h10M7 17h10" opacity=".4"/>'), space: I('<path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4"/>'), code: I('<path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>'),
  design: I('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'), eye: I('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  undo: I('<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>'), redo: I('<path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>'),
  check: I('<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>'), download: I('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>'), trash: I('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'), up: I('<path d="M12 19V5M6 11l6-6 6 6"/>'), down: I('<path d="M12 5v14M6 13l6 6 6-6"/>'),
  copy: I('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'), upload: I('<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>'),
  page: I('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>'), style: I('<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1.3"/><circle cx="12" cy="7.5" r="1.3"/><circle cx="15.5" cy="10" r="1.3"/><path d="M12 21a3 3 0 0 1 0-6h2"/>'),
  computer: I('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'), tablet: I('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M11 18h2"/>'), phone: I('<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>'),
  sparkle: I('<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>'), link: I('<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>'), x: I('<path d="M6 6l12 12M18 6L6 18"/>')
};
Object.assign(ICON, {
  shape: I('<circle cx="8" cy="8" r="5"/><path d="M15 3l5 8h-10z" transform="translate(0 1)"/><rect x="11" y="14" width="9" height="7" rx="1"/>'),
  reveal: I('<rect x="3" y="5" width="18" height="6" rx="2"/><path d="M8 8h8"/><path d="M6 15h12M6 19h8" opacity=".5"/>'),
  move: I('<path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>'),
  dice: I('<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2"/><circle cx="15" cy="15" r="1.2"/><circle cx="15" cy="9" r="1.2"/><circle cx="9" cy="15" r="1.2"/>'),
  play: I('<path d="M8 5l11 7-11 7z"/>'), font: I('<path d="M4 20l6-16h2l6 16M7 14h8"/>'), save: I('<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7M8 21v-7h8v7"/>'),
  front: I('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11" opacity=".5"/>'), back: I('<rect x="4" y="4" width="12" height="12" rx="2" opacity=".5"/><path d="M20 8v11a1 1 0 0 1-1 1H8"/>'),
  free: I('<rect x="3" y="3" width="8" height="7" rx="1"/><rect x="13" y="6" width="8" height="9" rx="1"/><rect x="5" y="13" width="7" height="8" rx="1"/>'), stack: I('<rect x="4" y="3" width="16" height="5" rx="1"/><rect x="4" y="10" width="16" height="4" rx="1"/><rect x="4" y="16" width="16" height="5" rx="1"/>')
});
const esc = W.esc;
// ── fonts: our bundled open-licence fonts are loaded only when a site uses them ──
const FONT_BASE = new URL('./fonts/', import.meta.url).href;
const fontLoads = {}, fontURLs = {};
const weights = f => ['400', f[4] ? '700' : null].filter(Boolean);
function ensureFonts(keys) {
  if (typeof FontFace === 'undefined') return Promise.resolve();
  return Promise.all(keys.map(k => { const f = W.FONTS[k]; if (!f || !f[3]) return null;
    if (!fontLoads[k]) fontLoads[k] = Promise.all(weights(f).map(wt => new FontFace(f[0], `url(${FONT_BASE}${f[3]}-${wt}.woff2)`, { weight: wt }).load().then(ff => { document.fonts.add(ff); }))).catch(() => { delete fontLoads[k]; });
    return fontLoads[k]; }));
}
// the same fonts as data: URLs, to go inside the preview and the downloaded file (a website file can't fetch anything)
async function fontData(keys) {
  const out = {};
  await Promise.all(keys.map(async k => { const f = W.FONTS[k]; if (!f || !f[3]) return; out[k] = {};
    for (const wt of weights(f)) { const key = f[3] + '-' + wt;
      if (!fontURLs[key]) fontURLs[key] = fetch(FONT_BASE + key + '.woff2').then(r => { if (!r.ok) throw new Error('font'); return r.blob(); })
        .then(b => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).replace(/^data:[^;,]*;base64,/, 'data:font/woff2;base64,')); fr.onerror = rej; fr.readAsDataURL(b); }))
        .catch(() => { delete fontURLs[key]; return null; });
      const u = await fontURLs[key]; if (u) out[k][wt] = u; } }));
  return out;
}
// ── colours ──
const SWATCHES = ['#ffffff', '#f3f4f6', '#9ca3af', '#4b5563', '#111827', '#fecaca', '#ef4444', '#b91c1c', '#fed7aa', '#f97316', '#fde68a', '#facc15', '#a16207', '#bbf7d0', '#22c55e', '#15803d', '#a5f3fc', '#06b6d4', '#bfdbfe', '#3b82f6', '#1d4ed8', '#ddd6fe', '#8b5cf6', '#6d28d9', '#fbcfe8', '#ec4899', '#be185d', '#7c2d12'];
const hex6 = c => c && c.length === 4 ? '#' + c.slice(1).split('').map(x => x + x).join('') : (c || '#000000');
function hsl(h, sat, l) { sat /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = sat * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join(''); }
// a random colour set that still passes Check my site
export function surpriseColours(rnd = Math.random) {
  for (let i = 0; i < 80; i++) {
    const h = Math.floor(rnd() * 360), dark = rnd() < 0.3, h2 = (h + [30, 150, 180, 210, 330][Math.floor(rnd() * 5)]) % 360;
    const t = dark ? { bg: hsl(h, 35, 10), text: hsl(h, 20, 93), head: hsl(h2, 85, 72), accent: hsl(h2, 70, 40), link: hsl(h2, 85, 76) }
      : { bg: hsl(h, 75, 97), text: hsl(h, 30, 14), head: hsl(h, 70, 33), accent: hsl(h2, 72, 36), link: hsl(h, 72, 30) };
    if (W.contrast(t.text, t.bg) < 4.5 || W.contrast(t.head, t.bg) < 3 || W.contrast('#ffffff', t.accent) < 3 || W.contrast(t.link, t.bg) < 4.5) continue;
    t.bg2 = ''; t.grad = 'none';
    if (rnd() < 0.5) { const g = dark ? hsl(h2, 40, 17) : hsl(h2, 75, 92); if (W.contrast(t.text, g) >= 4.5) { t.bg2 = g; t.grad = ['down', 'diag', 'radial'][Math.floor(rnd() * 3)]; } }
    return t;
  }
  return Object.assign({ bg2: '', grad: 'none' }, W.THEMES.sky);
}
const SETS_KEY = 'cj-web-sets';
function mySets() { try { const v = JSON.parse(localStorage.getItem(SETS_KEY) || '[]'); return Array.isArray(v) ? v.filter(x => x && W.safeColour(x.bg)).slice(0, 12) : []; } catch (_) { return []; } }
function saveSets(list) { try { localStorage.setItem(SETS_KEY, JSON.stringify(list.slice(0, 12))); return true; } catch (_) { return false; } }
const SET_KEYS = ['bg', 'text', 'head', 'accent', 'link', 'bg2', 'grad', 'pat'];
const TEMPLATE = `
<div class="wl">
  <div class="wl-bar">
    <input class="wl-title" id="wlTitle" maxlength="80" aria-label="Website name" spellcheck="false">
    <div class="wl-tabs" role="tablist" aria-label="View">
      <button class="wl-tab" role="tab" data-tab="design" aria-selected="true">${ICON.design} Design</button>
      <button class="wl-tab" role="tab" data-tab="code" aria-selected="false">${ICON.code} Code</button>
      <button class="wl-tab" role="tab" data-tab="preview" aria-selected="false">${ICON.eye} Preview</button>
    </div>
    <span class="wl-sp"></span>
    <button class="wl-btn icon" id="wlUndo" title="Undo (Ctrl+Z)" aria-label="Undo">${ICON.undo}</button>
    <button class="wl-btn icon" id="wlRedo" title="Redo (Ctrl+Y)" aria-label="Redo">${ICON.redo}</button>
    <button class="wl-btn" id="wlCheck" title="Look for things to fix: picture descriptions, colours that are hard to read, broken links">${ICON.check}<span class="lbl">Check my site</span></button>
    <button class="wl-btn" id="wlDownload" title="Save the whole website as one .html file">${ICON.download}<span class="lbl">Download</span></button>
  </div>
  <div class="wl-goals" id="wlGoals" hidden></div>
  <div class="wl-main">
    <aside class="wl-left" id="wlLeft"></aside>
    <section class="wl-centre">
      <div class="wl-devbar">
        <span class="wl-pname" id="wlPname"></span>
        <span class="wl-status" id="wlStatus"></span>
        <span class="wl-sp"></span>
        <div class="wl-seg" id="wlDevice" role="group" aria-label="Screen size">
          <button data-dev="computer" aria-pressed="true" title="Computer">${ICON.computer}</button>
          <button data-dev="tablet" aria-pressed="false" title="Tablet">${ICON.tablet}</button>
          <button data-dev="phone" aria-pressed="false" title="Phone">${ICON.phone}</button>
        </div>
      </div>
      <div class="wl-stage" id="wlStage"><div class="wl-frame" id="wlFrame"><div class="wl-canvas" id="wlCanvas"></div></div></div>
      <div class="wl-code" id="wlCode" hidden>
        <div class="wl-pane">
          <div class="wl-pane-h">HTML <span id="wlCodePage"></span><span class="wl-status" id="wlHtmlStatus"></span></div>
          <div class="wl-ed" id="wlHtmlEd"><div class="ln"></div><pre aria-hidden="true"></pre><textarea id="wlHtml" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="This page's HTML"></textarea></div>
          <div class="wl-note" id="wlHtmlNote" hidden></div>
        </div>
        <div class="wl-pane">
          <div class="wl-pane-h">My CSS <span class="wl-status" id="wlCssStatus">Rules you write here style every page.</span></div>
          <div class="wl-ed" id="wlCssEd"><div class="ln"></div><pre aria-hidden="true"></pre><textarea id="wlCss" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Your own CSS"></textarea></div>
          <div class="wl-note" id="wlCssNote" hidden></div>
          <details><summary>The CSS from your Style choices (read only)</summary><pre class="wl-theme-css" id="wlThemeCss"></pre></details>
        </div>
      </div>
      <div class="wl-preview" id="wlPreview" hidden><iframe id="wlFrameView" title="Your website" sandbox="allow-popups allow-popups-to-escape-sandbox"></iframe></div>
    </section>
    <aside class="wl-right" id="wlRight"></aside>
  </div>
</div>`;

export function mount(root, host) {
  host = host || {};
  if (!document.querySelector('link[data-web-css]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = CSS_URL; l.setAttribute('data-web-css', ''); document.head.appendChild(l); }
  root.innerHTML = TEMPLATE;
  const $ = id => root.querySelector('#' + id), wl = root.querySelector('.wl');
  const toast = (m) => { if (host.toast) host.toast(m); else { const t = document.createElement('div'); t.className = 'wl-toast'; t.textContent = m; wl.appendChild(t); setTimeout(() => t.remove(), 2200); } };
  const confirm = async m => host.confirm ? !!(await host.confirm(m)) : window.confirm(m);
  const canvasHost = $('wlCanvas'), shadow = canvasHost.attachShadow({ mode: 'open' });

  let proj, page, sel = null, tab = 'design', side = 'add', device = 'computer';
  let undo = [], redo = [], lastSnap = '', codeEdits = 0, goalsFolded = false, goalsWereDone = false, destroyed = false;
  const pool = {}; // live: page fields received before the site that lists them
  let quiet = false;

  function load(p, fresh) {
    proj = W.cleanProject(p || W.newProject('blank'));
    page = proj.site.order[0]; sel = null; undo = []; redo = []; lastSnap = JSON.stringify(proj); codeEdits = 0; goalsWereDone = false;
    clearTimeout(tplT); if (fresh) tplT = setTimeout(() => templates(true), 50);
  }
  let tplT = 0;
  load(host.project, !host.project);

  // ── changes, undo ──
  let changeT = 0;
  function changed(now) { // the project changed: remember it for undo (soon), tell CodeJump, tick goals
    clearTimeout(changeT);
    const go = () => { const s = JSON.stringify(proj); if (s === lastSnap) return; undo.push(lastSnap); if (undo.length > 80) undo.shift(); redo = []; lastSnap = s; bar(); if (!quiet && host.onChange) host.onChange(); goals(); };
    if (now) go(); else changeT = setTimeout(go, 400);
  }
  function restore(s) { proj = W.cleanProject(JSON.parse(s)); lastSnap = s; if (!proj.site.order.includes(page)) page = proj.site.order[0]; if (sel && !findBlock(sel)) sel = null; render(); if (host.onChange) host.onChange(); goals(); }
  function doUndo() { changed(true); if (!undo.length) return; redo.push(lastSnap); restore(undo.pop()); }
  function doRedo() { if (!redo.length) return; undo.push(lastSnap); restore(redo.pop()); }

  // ── finding blocks ──
  function findBlock(id, pid = page) {
    const pg = proj['p' + pid]; if (!pg) return null;
    for (let i = 0; i < pg.blocks.length; i++) {
      const b = pg.blocks[i]; if (b.id === id) return { b, list: pg.blocks, i, parent: null };
      if (b.t === 'columns') for (let c = 0; c < b.cols.length; c++) { const j = b.cols[c].findIndex(x => x.id === id); if (j >= 0) return { b: b.cols[c][j], list: b.cols[c], i: j, parent: b, col: c }; }
    }
    return null;
  }

  // ── bar ──
  function bar() {
    $('wlUndo').disabled = !undo.length; $('wlRedo').disabled = !redo.length;
    if (document.activeElement !== $('wlTitle')) $('wlTitle').value = proj.site.title;
    root.querySelectorAll('.wl-tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    root.querySelectorAll('#wlDevice button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.dev === device)));
    $('wlPname').textContent = (proj['p' + page] || {}).name || '';
    wl.classList.toggle('code', tab === 'code'); wl.classList.toggle('preview', tab === 'preview');
  }
  function status(m) { $('wlStatus').textContent = m || ''; }

  // ── left panel ──
  function left() {
    const L = $('wlLeft');
    if (tab === 'code') { L.innerHTML = `<div class="wl-side"><h3>Pages</h3>${pagesHTML()}<p class="wl-hint">The HTML on the right is the page you pick here. Change it and your page changes too. Things a website can’t safely run (like &lt;script&gt;) are taken out.</p></div>`; bindPages(L); return; }
    L.innerHTML = `<div class="wl-side-tabs" role="tablist">${[['add', 'Add'], ['pages', 'Pages'], ['style', 'Style']].map(([k, n]) => `<button class="wl-side-tab" role="tab" data-side="${k}" aria-selected="${side === k}">${n}</button>`).join('')}</div><div class="wl-side" id="wlSide"></div>`;
    L.querySelectorAll('[data-side]').forEach(b => b.onclick = () => { side = b.dataset.side; left(); });
    const S = L.querySelector('#wlSide');
    if (side === 'add') {
      S.innerHTML = `<h3>Add to the page</h3><div class="wl-tiles">${W.BLOCK_KEYS.map(k => `<button class="wl-tile" data-add="${k}" title="Add a ${esc(W.BLOCKS[k][0].toLowerCase())}">${ICON[W.BLOCKS[k][1]] || ICON.text}${esc(W.BLOCKS[k][0])}</button>`).join('')}</div>
        <p class="wl-hint">Tap a block to add it under the one you have chosen. Click anything on the page to change it.</p>
        <button class="wl-btn" id="wlTpl" style="width:100%">${ICON.sparkle} Start from a template</button>`;
      S.querySelectorAll('[data-add]').forEach(b => b.onclick = () => addBlock(b.dataset.add));
      S.querySelector('#wlTpl').onclick = () => templates(false);
    } else if (side === 'pages') {
      S.innerHTML = `<h3>Pages</h3>${pagesHTML()}<div class="wl-acts"><button class="wl-btn" id="wlAddPage"${proj.site.order.length >= W.LIMITS.pages ? ' disabled' : ''}>${ICON.plus} Add a page</button></div><p class="wl-hint">The first page is the home page: it opens first. The menu at the top of every page links them all.</p>${layoutHTML()}`;
      bindPages(S); bindLayout(S);
      S.querySelector('#wlAddPage').onclick = () => { const id = W.addPage(proj, 'Page ' + (proj.site.order.length + 1), undefined, proj['p' + page].layout); if (!id) return; page = id; sel = null; changed(true); render(); renamePage(id); };
    } else styleSide(S);
  }
  function layoutHTML() {
    const free = proj['p' + page].layout === 'free';
    return `<h3>Layout of this page</h3><div class="wl-seg wl-layout" role="group"><button data-layout="free" aria-pressed="${free}">${ICON.free} Free</button><button data-layout="stack" aria-pressed="${!free}">${ICON.stack} Stack</button></div>
      <p class="wl-hint">${free ? '<b>Free:</b> drag blocks anywhere and change their size. On phones they go one under another.' : '<b>Stack:</b> blocks go one under another. Choose Free to put things anywhere you like.'}</p>`;
  }
  function bindLayout(box) { box.querySelectorAll('[data-layout]').forEach(b => b.onclick = async () => { const v = b.dataset.layout; if (v === 'stack' && proj['p' + page].layout === 'free' && !(await confirm('Put every block back one under another? (Undo brings your layout back.)'))) return; setLayout(v); }); }
  function pagesHTML() {
    return `<ul class="wl-pages">${proj.site.order.map((id, i) => `<li class="wl-page${id === page ? ' on' : ''}" data-pid="${id}"><button class="name" data-open="${id}" title="Open this page">${ICON.page} ${esc(proj['p' + id].name)}</button>${i === 0 ? '<small>Home</small>' : ''}
      ${tab === 'code' ? '' : `<button class="wl-mini" data-ren="${id}" title="Rename" aria-label="Rename ${esc(proj['p' + id].name)}">${ICON.design}</button><button class="wl-mini" data-pup="${id}" title="Move up" aria-label="Move up"${i ? '' : ' disabled'}>${ICON.up}</button><button class="wl-mini" data-pdel="${id}" title="Delete page" aria-label="Delete ${esc(proj['p' + id].name)}"${proj.site.order.length > 1 ? '' : ' disabled'}>${ICON.trash}</button>`}</li>`).join('')}</ul>`;
  }
  function bindPages(S) {
    S.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { page = b.dataset.open; sel = null; render(); });
    S.querySelectorAll('[data-ren]').forEach(b => b.onclick = () => renamePage(b.dataset.ren));
    S.querySelectorAll('[data-pup]').forEach(b => b.onclick = () => { const o = proj.site.order, i = o.indexOf(b.dataset.pup); if (i > 0) { [o[i - 1], o[i]] = [o[i], o[i - 1]]; changed(true); render(); } });
    S.querySelectorAll('[data-pdel]').forEach(b => b.onclick = async () => { const id = b.dataset.pdel; if (!(await confirm(`Delete the page “${proj['p' + id].name}” and everything on it?`))) return; W.removePage(proj, id); if (page === id) page = proj.site.order[0]; sel = null; changed(true); render(); });
  }
  function renamePage(id) {
    const li = $('wlLeft').querySelector(`[data-pid="${id}"]`); if (!li) return;
    const btn = li.querySelector('.name'), inp = document.createElement('input'); inp.className = 'wl-in'; inp.value = proj['p' + id].name; inp.maxLength = 40; inp.setAttribute('aria-label', 'Page name');
    btn.replaceWith(inp); inp.focus(); inp.select();
    const done = () => { const v = inp.value.trim(); if (v && v !== proj['p' + id].name) { proj['p' + id].name = v; changed(true); } render(); };
    inp.onkeydown = e => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') { inp.value = proj['p' + id].name; inp.blur(); } };
    inp.onblur = done;
  }
  // a colour chooser: the site's own colours, a palette, and any colour at all
  function colourHTML(attr, key, value, label, clear) {
    const t = proj.site.theme, mine = [...new Set([t.bg, t.text, t.head, t.accent, t.link, t.bg2].filter(Boolean).map(c => hex6(c).toLowerCase()))];
    return `<div class="wl-cpick" data-cwrap="${key}"><div class="wl-cpick-h"><input type="color" ${attr}="${key}" value="${hex6(value)}" aria-label="${esc(label)}"><span>${esc(label)}</span>${clear ? `<button class="wl-mini" data-clear="${key}" title="${esc(clear)}" aria-label="${esc(clear)}"${value ? '' : ' disabled'}>${ICON.x}</button>` : ''}<button class="wl-mini" data-more="${key}" title="More colours" aria-label="More colours" aria-expanded="false">${ICON.style}</button></div>
      <div class="wl-sws" hidden>${mine.map(c => `<button class="wl-sw mine" data-sw="${key}" data-v="${c}" style="background:${c}" title="${c} (from your colours)"></button>`).join('')}${SWATCHES.map(c => `<button class="wl-sw" data-sw="${key}" data-v="${c}" style="background:${c}" title="${c}"></button>`).join('')}</div></div>`;
  }
  // binds colour choosers inside box: live(key, value) while choosing, done() when finished
  function bindColours(box, attr, live, done) {
    box.querySelectorAll(`[${attr}]`).forEach(inp => { inp.oninput = () => live(inp.getAttribute(attr), inp.value); inp.onchange = () => done(); });
    box.querySelectorAll('[data-more]').forEach(b => b.onclick = e => { e.preventDefault(); const w = b.closest('.wl-cpick').querySelector('.wl-sws'); w.hidden = !w.hidden; b.setAttribute('aria-expanded', String(!w.hidden)); });
    box.querySelectorAll('[data-sw]').forEach(b => b.onclick = e => { e.preventDefault(); live(b.dataset.sw, b.dataset.v); done(); });
  }
  function fontButton(id, key, label, allowSame) {
    const f = W.FONTS[key];
    return `<button class="wl-fontbtn" id="${id}" style="font-family:${esc(f ? f[1] : 'inherit')}">${ICON.font}<span>${esc(f ? f[0] : allowSame || 'Normal')}</span><small>${esc(label)}</small></button>`;
  }
  // the font picker: every font, in groups, each name written in its own font
  function fontPicker(current, title, extra, onPick) {
    ensureFonts(Object.keys(W.FONTS));
    pop(`<h2>${esc(title)}</h2>${extra ? `<button class="wl-font${current ? '' : ' on'}" data-font="">${esc(extra)}</button>` : ''}
      ${W.FONT_GROUPS.map(([g, n]) => `<h3>${esc(n)}</h3><div class="wl-fonts">${Object.entries(W.FONTS).filter(([, f]) => f[2] === g).map(([k, f]) => `<button class="wl-font${current === k ? ' on' : ''}" data-font="${k}" style="font-family:${esc(f[1])}"><b>${esc(f[0])}</b><span>The quick brown fox</span></button>`).join('')}</div>`).join('')}
      <div class="wl-acts"><button class="wl-btn" data-close>Close</button></div>`, box => {
      box.classList.add('wide');
      box.querySelectorAll('[data-font]').forEach(b => b.onclick = () => { closePop(); onPick(b.dataset.font); });
    });
  }
  function styleSide(S) {
    const t = proj.site.theme, sets = mySets();
    const seg = (k, opts) => `<div class="wl-seg" role="group">${opts.map(([v, n]) => `<button data-theme="${k}" data-v="${v}" aria-pressed="${t[k] === v}">${n}</button>`).join('')}</div>`;
    const setBtn = (c, name, attrs) => `<button class="wl-set" ${attrs} style="background:${c.grad && c.grad !== 'none' && c.bg2 ? `linear-gradient(135deg, ${c.bg}, ${c.bg2})` : c.bg};color:${c.head}"><span class="sw">${['head', 'accent', 'text'].map(x => `<i style="background:${c[x]}"></i>`).join('')}</span>${esc(name)}</button>`;
    const patTile = k => { const c = { bg: '#ffffff', text: '#000000', pat: k, grad: 'none' }; return `<button class="wl-pat" data-theme="pat" data-v="${k}" aria-pressed="${t.pat === k}" title="${esc(W.PATTERNS[k])}"><i style="background:${esc(W.backgroundCSS(Object.assign({}, c, { text: '#444444' }), 0.45))}"></i>${esc(W.PATTERNS[k])}</button>`; };
    S.innerHTML = `<h3>Colour sets</h3><div class="wl-sets">${Object.entries(W.THEMES).map(([k, c]) => setBtn(c, k[0].toUpperCase() + k.slice(1), `data-set="${k}"`)).join('')}</div>
      <div class="wl-acts"><button class="wl-btn" id="wlSurprise">${ICON.dice} Surprise me</button><button class="wl-btn" id="wlSaveSet">${ICON.save} Save my colours</button></div>
      ${sets.length ? `<h3>My colour sets</h3><div class="wl-sets">${sets.map((c, i) => `<span class="wl-myset">${setBtn(c, c.name || 'My set ' + (i + 1), `data-myset="${i}"`)}<button class="wl-mini" data-delset="${i}" title="Delete this set" aria-label="Delete ${esc(c.name || 'this set')}">${ICON.x}</button></span>`).join('')}</div><p class="wl-hint">Your colour sets are kept on this device, for all your websites.</p>` : ''}
      <h3>Colours</h3>${[['bg', 'Background'], ['text', 'Words'], ['head', 'Headings'], ['accent', 'Buttons and menu'], ['link', 'Links']].map(([k, n]) => colourHTML('data-col', k, t[k], n)).join('')}
      <h3>Background</h3><label class="wl-field">Blend into a second colour<select id="wlGrad">${Object.entries(W.GRADS).map(([k, n]) => `<option value="${k}"${t.grad === k ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
      ${t.grad !== 'none' ? colourHTML('data-col', 'bg2', t.bg2 || t.accent, 'Second colour') : ''}
      <div class="wl-pats">${Object.keys(W.PATTERNS).map(patTile).join('')}</div>
      <h3>Fonts</h3>${fontButton('wlFontBody', t.font, 'Words')}${fontButton('wlFontHead', t.hfont, 'Headings', 'Same as the words')}
      <label class="wl-field">Size of words: ${t.fsize}px<input type="range" min="14" max="26" id="wlFsize" value="${t.fsize}"></label>
      <h3>Page width</h3>${seg('width', [['narrow', 'Narrow'], ['normal', 'Normal'], ['wide', 'Wide']])}
      <h3>Menu</h3>${seg('nav', [['bar', 'Bar'], ['tabs', 'Tabs'], ['none', 'None']])}
      <h3>Corners</h3>${seg('corners', [['round', 'Round'], ['sharp', 'Sharp']])}
      <p class="wl-hint">Want more? Open <b>Code</b> and write your own CSS.</p>`;
    const th = proj.site.theme, apply = c => { for (const k of SET_KEYS) { if (k === 'bg2') th.bg2 = c.bg2 || ''; else if (k === 'grad') th.grad = c.grad || 'none'; else if (k === 'pat') { if (c.pat) th.pat = c.pat; } else if (c[k]) th[k] = c[k]; } changed(true); render(); };
    S.querySelectorAll('[data-set]').forEach(b => b.onclick = () => apply(W.THEMES[b.dataset.set]));
    S.querySelectorAll('[data-myset]').forEach(b => b.onclick = () => apply(sets[+b.dataset.myset]));
    S.querySelectorAll('[data-delset]').forEach(b => b.onclick = async () => { const i = +b.dataset.delset; if (!(await confirm(`Delete the colour set “${sets[i].name || 'My set'}”?`))) return; sets.splice(i, 1); saveSets(sets); left(); });
    S.querySelector('#wlSurprise').onclick = () => apply(surpriseColours());
    S.querySelector('#wlSaveSet').onclick = () => {
      if (sets.length >= 12) { toast('You have 12 colour sets already. Delete one first.'); return; }
      pop(`<h2>Save my colours</h2><p class="wl-hint">Give this colour set a name. You can use it again on any of your websites on this device.</p><label class="wl-field">Name<input id="wlSetName" maxlength="24" value="My colours ${sets.length + 1}"></label><div class="wl-acts"><button class="wl-btn gold" id="wlSetOk">Save</button><button class="wl-btn" data-close>Cancel</button></div>`, box => {
        const go = () => { const c = { name: box.querySelector('#wlSetName').value.trim().slice(0, 24) || 'My colours' }; for (const k of SET_KEYS) c[k] = th[k]; sets.push(c); if (!saveSets(sets)) toast('This device won’t let CodeJump keep it.'); closePop(); left(); toast('Saved. It’s under My colour sets.'); };
        box.querySelector('#wlSetOk').onclick = go; box.querySelector('#wlSetName').onkeydown = e => { if (e.key === 'Enter') go(); };
      });
    };
    bindColours(S, 'data-col', (k, v) => { th[k] = v; canvas(); changed(); }, () => { changed(true); left(); });
    S.querySelector('#wlGrad').onchange = e => { th.grad = e.target.value; if (th.grad !== 'none' && !th.bg2) th.bg2 = th.accent; changed(true); render(); };
    S.querySelector('#wlFontBody').onclick = () => fontPicker(th.font, 'Font for the words', '', k => { if (k) { th.font = k; changed(true); render(); } });
    S.querySelector('#wlFontHead').onclick = () => fontPicker(th.hfont, 'Font for the headings', 'Same as the words', k => { th.hfont = k; changed(true); render(); });
    const fsz = S.querySelector('#wlFsize'); fsz.oninput = () => { th.fsize = +fsz.value; fsz.closest('label').firstChild.textContent = 'Size of words: ' + fsz.value + 'px'; canvas(); changed(); }; fsz.onchange = () => changed(true);
    S.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => { th[b.dataset.theme] = b.dataset.v; changed(true); render(); });
  }

  // ── the design canvas ──
  const EDIT_CSS = `
    [data-bid] { outline: 2px dashed transparent; outline-offset: 3px; cursor: pointer; transition: outline-color .15s; }
    [data-bid]:hover { outline-color: rgba(174,133,62,.55); }
    [data-bid].wl-sel { outline: 3px solid #ae853e; }
    [contenteditable] { cursor: text; outline: none; }
    [contenteditable]:focus { box-shadow: 0 0 0 2px rgba(174,133,62,.35); border-radius: 4px; }
    .page { display: block !important; min-height: 420px; }
    .wl-body { min-height: 100%; padding-bottom: 1px; }
    .wl-ph { color: #999; font-style: italic; }
    .wl-addhere { margin: 18px auto; text-align: center; color: #999; font: 600 14px sans-serif; padding: 18px; border: 2px dashed #ccc; border-radius: 12px; }
    .columns > .col:empty::after { content: 'Empty column: choose it, then add blocks'; display: block; color: #aaa; font: italic 14px sans-serif; padding: 16px; border: 2px dashed #ddd; border-radius: 10px; }
    .wl-body { container: wlpage / inline-size; }
    [class*="a-"]:not(.wl-play) { animation: none !important; }
    [class*="h-"]:hover { animation: none !important; transform: none !important; }
    img { -webkit-user-drag: none; user-select: none; }
    .free { position: relative; min-height: 360px; }
    .free > [data-bid] { cursor: grab; }
    .free > [data-bid].wl-sel { touch-action: none; }
    .free > [data-bid] [contenteditable], .free > [data-bid][contenteditable] { cursor: text; }
    .free.wl-dragging { background-image: linear-gradient(90deg, rgba(174,133,62,.13) 1px, transparent 1px); background-size: calc(100% / 24) 100%; }
    .free.wl-dragging > [data-bid] { cursor: grabbing; }
    .wl-ov { position: absolute; pointer-events: none; border: 2px solid #ae853e; z-index: 1000; box-sizing: border-box; }
    .wl-h { position: absolute; width: 16px; height: 16px; background: #fff; border: 2px solid #ae853e; border-radius: 4px; pointer-events: auto; touch-action: none; box-sizing: border-box; }
    .wl-h[data-h="nw"] { left: -9px; top: -9px; cursor: nwse-resize; } .wl-h[data-h="n"] { left: calc(50% - 8px); top: -9px; cursor: ns-resize; }
    .wl-h[data-h="ne"] { right: -9px; top: -9px; cursor: nesw-resize; } .wl-h[data-h="e"] { right: -9px; top: calc(50% - 8px); cursor: ew-resize; }
    .wl-h[data-h="se"] { right: -9px; bottom: -9px; cursor: nwse-resize; } .wl-h[data-h="s"] { left: calc(50% - 8px); bottom: -9px; cursor: ns-resize; }
    .wl-h[data-h="sw"] { left: -9px; bottom: -9px; cursor: nesw-resize; } .wl-h[data-h="w"] { left: -9px; top: calc(50% - 8px); cursor: ew-resize; }
    .wl-grip { position: absolute; left: -2px; bottom: 100%; pointer-events: auto; background: #ae853e; color: #1b1408; font: 700 12px/1 system-ui, sans-serif; padding: 6px 10px; border-radius: 6px 6px 0 0; cursor: grab; touch-action: none; display: flex; gap: 5px; align-items: center; white-space: nowrap; }
    .wl-grip svg { width: 14px; height: 14px; }
    .wl-size { position: absolute; right: -2px; top: 100%; margin-top: 4px; background: #1b1408; color: #fff; font: 600 11px system-ui, sans-serif; padding: 3px 7px; border-radius: 5px; white-space: nowrap; }
    .wl-gl { position: absolute; background: #ec4899; pointer-events: none; z-index: 1001; }
    .wl-phonenote { margin: 10px 0; padding: 10px 14px; border-radius: 10px; background: #1b1408; color: #f5e6c8; font: 600 13px system-ui, sans-serif; }`;
  function navHTML() {
    const t = proj.site.theme; if (t.nav === 'none' || proj.site.order.length < 2) return '';
    return `<nav class="site-nav${t.nav === 'tabs' ? ' tabs' : ''}">${t.nav === 'bar' ? `<span class="site-name">${esc(proj.site.title)}</span>` : ''}${proj.site.order.map(id => `<a href="#p-${id}" data-goto="${id}"${id === page ? ' class="here"' : ''}>${esc(proj['p' + id].name)}</a>`).join('')}</nav>`;
  }
  function canvas() {
    if (tab !== 'design') return;
    const pg = proj['p' + page]; if (!pg) return;
    ensureFonts(W.usedFonts(proj));
    const body = W.pageHTML(proj, page, { edit: true });
    // a shadow root has no :root or <body>: the site's rules for those apply to the host and a wrapper instead; and the
    // phone-size rules follow the width of the page being designed, not the window
    const css = W.siteCSS(proj).replace(/^:root \{/m, ':host {').replace(/^body \{/m, '.wl-body {').replace(/^\* \{/m, '* {').replace(/@media \(max-width: (\d+)px\)/g, '@container wlpage (max-width: $1px)');
    const free = pg.layout === 'free', phone = free && device === 'phone';
    shadow.innerHTML = `<style>${css}${EDIT_CSS}</style><div class="wl-body"><div class="page" id="wlPage">${navHTML()}${phone ? '<div class="wl-phonenote">On a phone, blocks go one under another in reading order. Choose Computer to move them about.</div>' : ''}${body || ''}<div class="wl-addhere">${pg.blocks.length ? (free ? 'Drag blocks anywhere. Pull the white handles to change their size.' : 'Choose a block, then add another from the left') : 'This page is empty. Add a block from the left.'}</div></div></div>`;
    shadow.querySelectorAll('details').forEach(d => { d.open = true; });
    $('wlFrame').className = 'wl-frame ' + device;
    $('wlFrame').style.background = W.backgroundCSS(proj.site.theme);
    if (sel) editable(sel);
    overlay();
  }
  // the selected block's words can be typed straight onto the page
  const RICH = { heading: 1, text: 1, list: 1, quote: 1, banner: 1, card: 1, table: 1, image: 1, reveal: 1, shape: 1 };
  function editable(id) {
    const el = shadow.querySelector(`[data-bid="${id}"]`), f = findBlock(id); if (!el || !f) return;
    el.classList.add('wl-sel');
    const b = f.b, bind = (node, get, set, opts = {}) => {
      if (!node) return;
      node.contentEditable = opts.plain ? 'plaintext-only' : 'true';
      if (opts.plain && node.contentEditable !== 'plaintext-only') node.contentEditable = 'true';
      node.spellcheck = true;
      node.addEventListener('input', () => { set(opts.plain ? node.textContent.replace(/\s+/g, ' ').slice(0, 60) : W.cleanInline(node.innerHTML, proj.site.order)); changed(); goalsSoon(); });
      node.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          if (b.t === 'list') { e.preventDefault(); const i = [...el.querySelectorAll('li')].indexOf(node); b.items.splice(i + 1, 0, ''); changed(true); canvas(); const li = shadow.querySelectorAll(`[data-bid="${id}"] li`)[i + 1]; if (li) { li.focus(); } return; }
          if (b.t === 'text' || b.t === 'quote' || (b.t === 'card' && node.tagName === 'P')) { e.preventDefault(); document.execCommand('insertLineBreak'); return; }
          e.preventDefault(); node.blur();
        }
        if (e.key === 'Backspace' && b.t === 'list' && !node.textContent && b.items.length > 1) { e.preventDefault(); const i = [...el.querySelectorAll('li')].indexOf(node); b.items.splice(i, 1); changed(true); canvas(); const li = shadow.querySelectorAll(`[data-bid="${id}"] li`)[Math.max(0, i - 1)]; if (li) li.focus(); }
      });
      node.addEventListener('paste', e => { e.preventDefault(); const t = (e.clipboardData || window.clipboardData).getData('text/plain'); document.execCommand('insertText', false, t); });
    };
    if (b.t === 'heading' || b.t === 'text') bind(el, null, v => { if (b.t === 'heading') b.text = v; else b.html = v; });
    if (b.t === 'list') el.querySelectorAll('li').forEach((li, i) => bind(li, null, v => { b.items[i] = v; }));
    if (b.t === 'quote') bind(el.querySelector('p'), null, v => { b.html = v; });
    if (b.t === 'banner') { bind(el.querySelector('h1'), null, v => { b.title = v; }); bind(el.querySelector('p'), null, v => { b.sub = v; }); }
    if (b.t === 'card') { bind(el.querySelector('h3'), null, v => { b.title = v; }); bind(el.querySelector('p'), null, v => { b.html = v; }); }
    if (b.t === 'table') el.querySelectorAll('tr').forEach((tr, r) => tr.querySelectorAll('td,th').forEach((td, c) => bind(td, null, v => { b.rows[r][c] = v; })));
    if (b.t === 'button') bind(el.querySelector('a'), null, v => { b.label = v; }, { plain: true });
    if (b.t === 'image' && b.caption) bind(el.querySelector('figcaption'), null, v => { b.caption = v; });
    if (b.t === 'shape' && b.text) bind(el.querySelector('span'), null, v => { b.text = v; });
    if (b.t === 'reveal') { bind(el.querySelector('summary'), null, v => { b.q = v; }); bind(el.querySelector('p'), null, v => { b.a = v; }); }
    if (RICH[b.t] && b.t !== 'image') toolbarFor(el); else hideToolbar();
  }
  // B / I / U / link toolbar over the chosen block
  let tbar = null, savedRange = null;
  function hideToolbar() { if (tbar) { tbar.remove(); tbar = null; } }
  function toolbarFor(el) {
    hideToolbar();
    tbar = document.createElement('div'); tbar.className = 'wl-tbar'; tbar.setAttribute('role', 'toolbar'); tbar.setAttribute('aria-label', 'Text style');
    tbar.innerHTML = `<button data-cmd="bold" title="Bold (Ctrl+B)" aria-label="Bold"><b>B</b></button><button data-cmd="italic" title="Slanted (Ctrl+I)" aria-label="Italic"><i>I</i></button><button data-cmd="underline" title="Underline" aria-label="Underline"><u>U</u></button><button data-cmd="link" title="Make a link" aria-label="Link">${ICON.link}</button><button data-cmd="unlink" title="Remove the link" aria-label="Remove link">${ICON.x}</button>`;
    wl.appendChild(tbar);
    const place = () => { if (!tbar) return; const r = el.getBoundingClientRect(), w = wl.getBoundingClientRect(), st = $('wlStage').getBoundingClientRect(); tbar.style.left = Math.max(8, r.left - w.left + (isFree() && el.matches('.free > *') ? 96 : 0)) + 'px'; tbar.style.top = Math.max(st.top - w.top + 4, r.top - w.top - 40) + 'px'; tbar.hidden = r.bottom < st.top || r.top > st.bottom; };
    place(); $('wlStage').onscroll = place;
    tbar.addEventListener('mousedown', e => { e.preventDefault(); keepRange(); });
    tbar.querySelectorAll('[data-cmd]').forEach(btn => btn.onclick = e => {
      e.preventDefault(); const cmd = btn.dataset.cmd;
      if (cmd === 'link') { linkPopup(); return; }
      restoreRange(); document.execCommand(cmd, false, null); syncFocused();
    });
  }
  const shadowSel = () => (shadow.getSelection ? shadow.getSelection() : document.getSelection());
  function keepRange() { const s = shadowSel(); if (s && s.rangeCount && shadow.contains(s.anchorNode)) savedRange = s.getRangeAt(0).cloneRange(); }
  function restoreRange() { if (!savedRange) return; const s = document.getSelection(); s.removeAllRanges(); s.addRange(savedRange); }
  function syncFocused() { // after a toolbar command, read the changed text back
    const n = savedRange && savedRange.commonAncestorContainer; let node = n && (n.nodeType === 1 ? n : n.parentElement);
    while (node && node.contentEditable !== 'true' && node.contentEditable !== 'plaintext-only') node = node.parentElement;
    if (node) node.dispatchEvent(new Event('input'));
  }
  function linkPopup() {
    keepRange();
    if (!savedRange || savedRange.collapsed) { toast('First choose some words to make into a link.'); return; }
    pop(`<h2>Make a link</h2><p class="wl-hint">Choose where the words should go.</p>
      <label class="wl-field">Another page of this website<select id="wlLinkPage"><option value="">—</option>${proj.site.order.map(id => `<option value="#p-${id}">${esc(proj['p' + id].name)}</option>`).join('')}</select></label>
      <label class="wl-field">Or a web address<input id="wlLinkUrl" placeholder="https://"></label>
      <div class="wl-acts"><button class="wl-btn gold" id="wlLinkOk">Make the link</button><button class="wl-btn" data-close>Cancel</button></div>`, box => {
      box.querySelector('#wlLinkOk').onclick = () => {
        let h = box.querySelector('#wlLinkPage').value || box.querySelector('#wlLinkUrl').value.trim();
        if (h && !/^#p-|^https?:\/\//i.test(h)) h = 'https://' + h;
        const ok = W.cleanHref(h, proj.site.order);
        if (!ok) { toast('That isn’t a web address CodeJump can link to. Try one that starts with https://'); return; }
        closePop(); restoreRange(); document.execCommand('createLink', false, ok); syncFocused();
      };
    });
  }

  // clicking on the page: choose a block (links don't go anywhere while designing)
  shadow.addEventListener('click', e => {
    if (justDragged) { justDragged = false; return; }
    if (e.target.closest && e.target.closest('summary')) e.preventDefault();
    if (e.target.closest && e.target.closest('.wl-ov')) return;
    const a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault();
    const go = a && a.dataset.goto; if (go && !e.target.closest('[data-bid]')) { page = go; sel = null; render(); return; }
    const el = e.target.closest && e.target.closest('[data-bid]');
    if (!el) { if (sel) { sel = null; hideToolbar(); render(); } return; }
    const id = el.dataset.bid;
    // inside columns, a click on an inner block chooses that block
    if (id !== sel) { sel = id; render(); const n = shadow.querySelector(`[data-bid="${id}"] [contenteditable], [data-bid="${id}"][contenteditable]`); if (n) placeCaret(n, e); }
  });
  // ── free layout: drag to move, handles to resize, snapping to the grid and to other blocks ──
  let justDragged = false, drag = null;
  const isFree = () => tab === 'design' && device !== 'phone' && (proj['p' + page] || {}).layout === 'free';
  const topBlock = id => { const f = findBlock(id); return f && !f.parent ? f : null; };
  const freeEl = () => shadow.querySelector('.free');
  function metrics() {
    const g = freeEl(); if (!g) return null;
    const colW = g.clientWidth / W.COLS, rows = getComputedStyle(g).gridTemplateRows.split(' ').map(parseFloat).filter(n => !isNaN(n)), tops = [0];
    for (const r of rows) tops.push(tops[tops.length - 1] + r);
    const topOf = i => i < tops.length ? tops[i] : tops[tops.length - 1] + (i - tops.length + 1) * W.ROW;
    const nearest = px => { if (px <= 0) return 0; const last = tops.length - 1; if (px >= tops[last]) return last + Math.round((px - tops[last]) / W.ROW); let best = 0; for (let i = 1; i <= last; i++) if (Math.abs(tops[i] - px) < Math.abs(tops[best] - px)) best = i; return best; };
    return { g, colW, topOf, nearest };
  }
  function overlay(live) {
    shadow.querySelectorAll('.wl-ov, .wl-gl').forEach(x => x.remove());
    if (!isFree() || !sel) return;
    const f = topBlock(sel), el = shadow.querySelector(`.free > [data-bid="${sel}"]`), g = freeEl(); if (!f || !el || !g) return;
    const ov = document.createElement('div'); ov.className = 'wl-ov';
    ov.style.cssText = `left:${el.offsetLeft}px;top:${el.offsetTop}px;width:${el.offsetWidth}px;height:${el.offsetHeight}px`;
    const p = (live && live.pos) || f.b.pos;
    ov.innerHTML = `<div class="wl-grip" data-grip="1" title="Drag to move (or use the arrow keys)">${ICON.move} Move</div>${['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(h => `<div class="wl-h" data-h="${h}" title="Drag to change the size (Shift keeps its shape)"></div>`).join('')}<div class="wl-size">${p.w} wide × ${p.h} tall</div>`;
    g.appendChild(ov);
    if (live && live.guides) for (const [kind, v] of live.guides) { const l = document.createElement('div'); l.className = 'wl-gl'; l.style.cssText = kind === 'v' ? `left:${v}px;top:0;width:2px;height:${g.scrollHeight}px` : `top:${v}px;left:0;height:2px;width:${g.clientWidth}px`; g.appendChild(l); }
  }
  // lines a moving edge can snap to, in grid units: the page's edges and middle, and every other block's edges and middle
  function snapLines(skip) {
    const xs = [0, W.COLS, W.COLS / 2], ys = [];
    for (const b of proj['p' + page].blocks) if (b.id !== skip && b.pos) { xs.push(b.pos.x, b.pos.x + b.pos.w, b.pos.x + b.pos.w / 2); ys.push(b.pos.y, b.pos.y + b.pos.h, b.pos.y + b.pos.h / 2); }
    return { xs, ys };
  }
  function snap(vals, lines, tol) { let best = null; vals.forEach((v, i) => { for (const l of lines) { const d = l - v; if (Math.abs(d) <= tol && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, line: l, i }; } }); return best; }
  function startDrag(e, id, handle) {
    const f = topBlock(id), m = metrics(), el = shadow.querySelector(`.free > [data-bid="${id}"]`); if (!f || !m || !el) return;
    e.preventDefault();
    drag = { id, handle, f, m, el, x0: e.clientX, y0: e.clientY, p0: Object.assign({}, f.b.pos), moved: false, lines: snapLines(id), pointer: e.pointerId };
    drag.top0 = m.topOf(drag.p0.y); drag.bot0 = m.topOf(drag.p0.y + drag.p0.h); drag.aspect = (drag.p0.w * m.colW) / Math.max(1, drag.bot0 - drag.top0);
    window.addEventListener('pointermove', dragMove); window.addEventListener('pointerup', dragEnd); window.addEventListener('pointercancel', dragEnd);
  }
  function dragMove(e) {
    if (!drag || e.pointerId !== drag.pointer) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    if (!drag.moved) { drag.moved = true; hideToolbar(); drag.m.g.classList.add('wl-dragging'); if (sel !== drag.id) { sel = drag.id; shadow.querySelectorAll('.wl-sel').forEach(x => x.classList.remove('wl-sel')); drag.el.classList.add('wl-sel'); } }
    const { m, p0, lines } = drag, C = W.COLS, p = Object.assign({}, p0), guides = [], free = e.altKey; // Alt: no snapping to other blocks
    if (!drag.handle) {
      p.x = Math.max(0, Math.min(C - p.w, Math.round((p0.x * m.colW + dx) / m.colW)));
      p.y = Math.max(0, m.nearest(drag.top0 + dy));
      if (!free) {
        const sx = snap([p.x, p.x + p.w / 2, p.x + p.w], lines.xs, 1.5); if (sx) { p.x = Math.max(0, Math.min(C - p.w, Math.round(p.x + sx.d))); guides.push(['v', sx.line * m.colW]); }
        const sy = snap([p.y, p.y + p.h / 2, p.y + p.h], lines.ys, 1.2); if (sy) { p.y = Math.max(0, Math.round(p.y + sy.d)); guides.push(['h', m.topOf(Math.round(sy.line))]); }
      }
    } else {
      const h = drag.handle, right0 = (p0.x + p0.w) * m.colW, left0 = p0.x * m.colW;
      if (h.includes('e')) { let r = Math.round((right0 + dx) / m.colW); if (!free) { const s1 = snap([r], lines.xs, 1.5); if (s1) { r = Math.round(r + s1.d); guides.push(['v', s1.line * m.colW]); } } p.w = Math.max(2, Math.min(C - p.x, r - p.x)); }
      if (h.includes('w')) { let l = Math.round((left0 + dx) / m.colW); if (!free) { const s1 = snap([l], lines.xs, 1.5); if (s1) { l = Math.round(l + s1.d); guides.push(['v', s1.line * m.colW]); } } l = Math.max(0, Math.min(p0.x + p0.w - 2, l)); p.w = p0.x + p0.w - l; p.x = l; }
      if (h.includes('s')) { p.h = Math.max(2, m.nearest(drag.bot0 + dy) - p.y); }
      if (h.includes('n')) { const t = Math.max(0, Math.min(p0.y + p0.h - 2, m.nearest(drag.top0 + dy))); p.h = p0.y + p0.h - t; p.y = t; }
      if (e.shiftKey && h.length === 2) { // keep its shape: height follows width
        const hpx = p.w * m.colW / drag.aspect;
        if (h.includes('s')) p.h = Math.max(2, m.nearest(m.topOf(p.y) + hpx) - p.y); else { const t = Math.max(0, m.nearest(m.topOf(p0.y + p0.h) - hpx)); p.h = Math.max(2, p0.y + p0.h - t); p.y = p0.y + p0.h - p.h; }
      }
    }
    drag.pos = p;
    drag.el.style.gridArea = `${p.y + 1} / ${p.x + 1} / span ${p.h} / span ${p.w}`;
    overlay({ pos: p, guides });
  }
  function dragEnd(e) {
    if (!drag || (e && e.pointerId !== drag.pointer)) return;
    window.removeEventListener('pointermove', dragMove); window.removeEventListener('pointerup', dragEnd); window.removeEventListener('pointercancel', dragEnd);
    const d = drag; drag = null; if (d.m.g) d.m.g.classList.remove('wl-dragging');
    if (!d.moved || !d.pos) { if (d.handle || d.grip) overlay(); return; }
    justDragged = true; setTimeout(() => { justDragged = false; }, 50);
    d.f.b.pos = d.pos; W.sortFree(proj['p' + page].blocks); sel = d.id; changed(true); render();
  }
  shadow.addEventListener('pointerdown', e => {
    if (!isFree() || e.button > 0) return;
    const h = e.target.closest && e.target.closest('.wl-h'); if (h && sel) { startDrag(e, sel, h.dataset.h); return; }
    if (e.target.closest && e.target.closest('.wl-grip') && sel) { startDrag(e, sel, null); if (drag) drag.grip = true; return; }
    const el = e.target.closest && e.target.closest('.free > [data-bid]'); if (!el) return;
    const id = el.dataset.bid, ed = e.target.closest('[contenteditable="true"], [contenteditable="plaintext-only"]');
    if (id === sel && ed) return; // typing into the chosen block
    if (findBlock(id) && findBlock(id).parent) return;
    if (e.pointerType === 'touch' && id !== sel) return; // on a tablet: tap to choose, then drag
    startDrag(e, id, null);
  });
  shadow.addEventListener('dragstart', e => e.preventDefault());
  function nudge(dx, dy) { const f = topBlock(sel); if (!f || !f.b.pos) return; const p = f.b.pos; p.x = Math.max(0, Math.min(W.COLS - p.w, p.x + dx)); p.y = Math.max(0, p.y + dy); W.sortFree(proj['p' + page].blocks); changed(); render(); }
  function layer(how) { // z order on a free page
    const f = topBlock(sel); if (!f) return; const all = proj['p' + page].blocks.map(b => b.z || 0), top = Math.max(0, ...all), low = Math.min(0, ...all);
    let z = f.b.z || 0; z = how === 'front' ? top + 1 : how === 'back' ? Math.max(0, low - 1) : how === 'fwd' ? z + 1 : Math.max(0, z - 1);
    if (how === 'back' && z === 0) for (const b of proj['p' + page].blocks) if (b !== f.b) b.z = Math.min(99, (b.z || 0) + 1);
    if (z) f.b.z = Math.min(99, z); else delete f.b.z; changed(true); render();
  }
  // switch a page between free and stack. Going free keeps the look: each block is placed where it is on the screen now
  function setLayout(layout) {
    const pg = proj['p' + page];
    if (layout === 'free' && pg.layout !== 'free') {
      const host = shadow.querySelector('#wlPage'), pr = host && host.getBoundingClientRect(), place = {};
      if (pr && pr.width) { const cs = getComputedStyle(host), padL = parseFloat(cs.paddingLeft), inner = pr.width - padL - parseFloat(cs.paddingRight); let first = null;
        for (const b of pg.blocks) { const el = shadow.querySelector(`#wlPage > [data-bid="${b.id}"]`); if (!el) continue; const r = el.getBoundingClientRect(); if (first == null) first = r.top;
          const vis = (b.t === 'image' && el.querySelector('img')) || (b.t === 'button' && el.querySelector('.btn')) || el, rv = vis.getBoundingClientRect(); // a picture or button: just the picture or button
          const x = Math.max(0, Math.round((rv.left - pr.left - padL) / inner * W.COLS)), w = Math.max(2, Math.min(W.COLS - x, Math.round(rv.width / inner * W.COLS)));
          place[b.id] = { x, w, y: Math.round((r.top - first) / W.ROW) + 1, h: Math.max(2, Math.round(r.height / W.ROW)), top: r.top - first }; } }
      W.setLayout(pg, 'free'); for (const b of pg.blocks) if (place[b.id]) { const { top, ...pos } = place[b.id]; b.pos = pos; } W.sortFree(pg.blocks);
      // rows grow to fit what is in them, so check where each block really lands and nudge it (a few passes)
      for (let pass = 0; pass < 4 && pr && pr.width; pass++) {
        canvas(); let moved = false, base = null;
        for (const b of pg.blocks) { const el = shadow.querySelector(`.free > [data-bid="${b.id}"]`); if (!el || !place[b.id]) continue; const t = el.getBoundingClientRect().top; if (base == null) { base = t - place[b.id].top; continue; }
          const d = Math.round((place[b.id].top - (t - base)) / W.ROW); if (d) { b.pos.y = Math.max(0, b.pos.y + d); moved = true; } }
        if (!moved) break;
      }
      toast('Free layout: drag blocks anywhere, and pull the handles to change their size.');
    } else if (layout !== 'free') W.setLayout(pg, 'stack');
    changed(true); render();
  }
  function watch() { // play the chosen block's animation once on the page
    const el = shadow.querySelector(`[data-bid="${sel}"]`), b = sel && findBlock(sel) && findBlock(sel).b; if (!el || !b) return;
    const t = b.t === 'button' ? el.querySelector('.btn') : el; if (!t) return;
    t.classList.remove('wl-play'); void t.offsetWidth; t.classList.add('wl-play'); setTimeout(() => t.classList.remove('wl-play'), 1600);
  }
  function placeCaret(n, e) {
    n.focus();
    try { const r = document.caretRangeFromPoint ? document.caretRangeFromPoint(e.clientX, e.clientY) : null; if (r && n.contains(r.startContainer)) { const s = document.getSelection(); s.removeAllRanges(); s.addRange(r); } } catch (_) {}
  }

  // ── adding / moving blocks ──
  function addBlock(t) {
    const b = W.blockOf(t); if (t === 'button' && proj.site.order.length > 1) b.link = '#p-' + proj.site.order.find(x => x !== page);
    const f = sel && findBlock(sel);
    if (f && f.b.t === 'columns') f.b.cols[0].push(t === 'columns' ? W.blockOf('text') : b);
    else if (f) f.list.splice(f.i + 1, 0, f.parent && t === 'columns' ? W.blockOf('text') : b);
    else proj['p' + page].blocks.push(b);
    const pg = proj['p' + page];
    if (pg.layout === 'free' && pg.blocks.includes(b)) { // on a free page: under the chosen block, pushing what is below it down
      const w = f && f.b.pos && !['image', 'shape', 'button', 'card'].includes(t) ? f.b.pos.w : W.defaultWidth(b), x = f && f.b.pos ? Math.min(W.COLS - w, f.b.pos.x) : Math.round((W.COLS - w) / 2);
      const y = f && f.b.pos ? f.b.pos.y + f.b.pos.h + 1 : W.bottomOf(pg.blocks) + 1, h = W.estimateRows(b, w);
      for (const o of pg.blocks) if (o !== b && o.pos && o.pos.y >= y) o.pos.y += h + 1;
      b.pos = { x, y, w, h }; W.sortFree(pg.blocks);
    }
    if (proj['p' + page].blocks.length > W.LIMITS.blocks) { proj['p' + page].blocks.pop(); toast('This page is full. Add a new page instead.'); return; }
    sel = b.id; changed(true); render();
    const el = shadow.querySelector(`[data-bid="${b.id}"]`); if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function moveBlock(d) { const f = sel && findBlock(sel); if (!f) return; const j = f.i + d; if (j < 0 || j >= f.list.length) return; [f.list[f.i], f.list[j]] = [f.list[j], f.list[f.i]]; changed(true); render(); }
  function dupBlock() { const f = sel && findBlock(sel); if (!f) return; const c = JSON.parse(JSON.stringify(f.b)); const re = x => { x.id = W.newId(); if (x.cols) x.cols.forEach(col => col.forEach(re)); }; re(c);
    if (c.pos) { c.pos.x = Math.min(W.COLS - c.pos.w, c.pos.x + 3); c.pos.y += 3; c.z = Math.min(99, (c.z || 0) + 1); }
    f.list.splice(f.i + 1, 0, c); if (c.pos) W.sortFree(f.list); sel = c.id; changed(true); render(); }
  function delBlock() { const f = sel && findBlock(sel); if (!f) return; f.list.splice(f.i, 1); sel = (f.list[f.i] || f.list[f.i - 1] || {}).id || (f.parent ? f.parent.id : null); changed(true); render(); }

  // ── the inspector ──
  function right() {
    const R = $('wlRight');
    const f = sel && findBlock(sel);
    if (!f) { R.innerHTML = `<div class="wl-insp-h">${ICON.page} ${esc(proj['p' + page].name)}</div><p class="wl-hint">Click anything on the page to change it, or add a block from the left.</p>
      <h3>This page</h3><label class="wl-field">Page name<input id="wlPgName" maxlength="40" value="${esc(proj['p' + page].name)}"></label>${layoutHTML()}`;
      R.querySelector('#wlPgName').onchange = e => { const v = e.target.value.trim(); if (v) { proj['p' + page].name = v; changed(true); render(); } };
      bindLayout(R); return; }
    const b = f.b, B = W.BLOCKS[b.t];
    const field = (label, html) => `<label class="wl-field">${label}${html}</label>`;
    const linkSel = (key, v) => { const web = v && /^https/.test(v); return field('Goes to', `<select data-link="${key}"><option value="">Nowhere yet</option>${proj.site.order.map(id => `<option value="#p-${id}"${v === '#p-' + id ? ' selected' : ''}>The page “${esc(proj['p' + id].name)}”</option>`).join('')}<option value="web"${web ? ' selected' : ''}>A web address…</option></select>`) + `<input class="wl-in" data-linkurl="${key}" placeholder="https://" value="${web ? esc(v) : ''}"${web ? '' : ' hidden'}>`; };
    const pics = (key, v, allowNone) => `<div class="wl-pics" role="group" aria-label="Pictures">${allowNone ? `<button class="wl-pic" data-pic="${key}" data-v="" aria-pressed="${!v}" title="No picture" style="display:flex;align-items:center;justify-content:center;color:#888">${ICON.x}</button>` : ''}${Object.entries(proj.imgs).map(([k, d]) => `<button class="wl-pic" data-pic="${key}" data-v="img:${k}" aria-pressed="${v === 'img:' + k}" title="Your picture"><img src="${d}" alt=""></button>`).join('')}${W.PICTURE_KEYS.map(k => `<button class="wl-pic" data-pic="${key}" data-v="lib:${k}" aria-pressed="${v === 'lib:' + k}" title="${esc(W.PICTURES[k][0])}"><img src="${W.pictureURL(k)}" alt="${esc(W.PICTURES[k][0])}"></button>`).join('')}</div>
      <div class="wl-acts"><button class="wl-btn" data-upload="${key}">${ICON.upload} Use my own picture</button></div><p class="wl-hint">Only use pictures you made or are allowed to use, and never photos of people.</p>`;
    let h = `<div class="wl-insp-h">${ICON[B[1]] || ICON.text} ${esc(B[0])}</div>`;
    if (RICH[b.t] && b.t !== 'image') h += `<p class="wl-hint">Type straight onto the page. Choose words, then use <b>B</b>, <i>I</i>, <u>U</u> or the link button above them.</p>`;
    switch (b.t) {
      case 'heading': h += `<h3>Size</h3><div class="wl-seg" role="group">${[[1, 'Big'], [2, 'Medium'], [3, 'Small']].map(([v, n]) => `<button data-set="level" data-v="${v}" aria-pressed="${b.level === v}">${n}</button>`).join('')}</div><p class="wl-hint">Big = &lt;h1&gt;, the title of the page. Use Medium (&lt;h2&gt;) for sections.</p>`; break;
      case 'image': h += `<h3>Picture</h3>${pics('src', b.src)}${field('Description (alt text)', `<input data-in="alt" maxlength="200" value="${esc(b.alt)}" placeholder="Say what the picture shows">`)}${b.alt.trim() ? '' : '<p class="wl-alt-warn">Add a description so people who can’t see the picture know what it shows.</p>'}${field('Size: ' + b.w + '%', `<input type="range" min="10" max="100" step="5" data-num="w" value="${b.w}">`)}<label class="wl-colour"><input type="checkbox" data-bool="round"${b.round ? ' checked' : ''}><span>Round</span></label>${field('Caption (words under it)', `<input data-in="caption" maxlength="200" value="${esc(W.plainText(b.caption))}">`)}`; break;
      case 'button': h += field('Words on the button', `<input data-in="label" maxlength="60" value="${esc(b.label)}">`) + linkSel('link', b.link); break;
      case 'list': h += `<div class="wl-seg" role="group"><button data-set="ordered" data-v="0" aria-pressed="${!b.ordered}">• Bullets</button><button data-set="ordered" data-v="1" aria-pressed="${b.ordered}">1. Numbers</button></div><div class="wl-acts"><button class="wl-btn" data-act="item+">${ICON.plus} Add an item</button></div><p class="wl-hint">Press Enter at the end of an item to start a new one.</p>`; break;
      case 'quote': h += field('Who said it', `<input data-in="by" maxlength="80" value="${esc(b.by)}">`); break;
      case 'banner': h += `<h3>Picture (optional)</h3>${pics('src', b.src, true)}`; break;
      case 'card': h += `<h3>Picture</h3>${pics('src', b.src, true)}${b.src ? field('Description (alt text)', `<input data-in="alt" maxlength="200" value="${esc(b.alt)}">`) : ''}${linkSel('link', b.link)}`; break;
      case 'columns': h += `<h3>Columns</h3><div class="wl-seg" role="group">${[2, 3].map(n => `<button data-act="cols${n}" aria-pressed="${b.cols.length === n}">${n}</button>`).join('')}</div><p class="wl-hint">Choose a block inside a column, then add more from the left. To start an empty column, choose it on the page.</p><div class="wl-acts">${b.cols.map((c, i) => `<button class="wl-btn" data-act="colAdd${i}">${ICON.plus} Text in column ${i + 1}</button>`).join('')}</div>`; break;
      case 'table': h += `<div class="wl-acts"><button class="wl-btn" data-act="row+">${ICON.plus} Row</button><button class="wl-btn" data-act="row-">− Row</button><button class="wl-btn" data-act="col+">${ICON.plus} Column</button><button class="wl-btn" data-act="col-">− Column</button></div><label class="wl-colour"><input type="checkbox" data-bool="head"${b.head ? ' checked' : ''}><span>The first row is headings</span></label>`; break;
      case 'space': h += field('Height: ' + b.h + 'px', `<input type="range" min="8" max="300" step="4" data-num="h" value="${b.h}">`); break;
      case 'html': h += field('Your HTML', `<textarea data-in="html" spellcheck="false">${esc(b.html)}</textarea>`) + '<p class="wl-hint">Only safe HTML is kept: no scripts, forms or outside pictures.</p>'; break;
      case 'divider': h += '<p class="wl-hint">A line across the page, in the accent colour (or its own colour).</p>'; break;
      case 'shape': h += `<h3>Shape</h3><div class="wl-shapes">${Object.entries(W.SHAPES).map(([k, n]) => `<button class="wl-shp" data-set="shape" data-v="${k}" aria-pressed="${b.shape === k}" title="${esc(n)}"><i class="s-${k}"></i>${esc(n)}</button>`).join('')}</div>${field('Words on it', `<input data-in="text" maxlength="120" value="${esc(W.plainText(b.text))}" placeholder="(none)">`)}`; break;
      case 'reveal': h += '<p class="wl-hint">Visitors see the question. When they click it, the answer appears. Great for quizzes and jokes!</p>'; break;
    }
    const top = !f.parent && b.pos, num = (k, label, min, max, step, val, unit, reset) => `<label class="wl-field wl-num">${label}: <b>${val == null ? (reset || 'normal') : val + (unit || '')}</b><span class="wl-numrow"><input type="range" min="${min}" max="${max}" step="${step}" data-n="${k}" value="${val == null ? (k === 'op' ? 100 : k === 'fs' ? 18 : 0) : val}">${val != null ? `<button class="wl-mini" data-clear="${k}" title="Back to normal" aria-label="Back to normal">${ICON.x}</button>` : ''}</span></label>`;
    if (top) h += `<h3>Place</h3><div class="wl-grid4">${[['x', 'Across'], ['y', 'Down'], ['w', 'Width'], ['h', 'Height']].map(([k, n]) => `<label class="wl-field">${n}<input type="number" data-pos="${k}" min="${k === 'w' || k === 'h' ? 1 : 0}" max="${k === 'x' ? W.COLS - 1 : k === 'w' ? W.COLS : 3000}" value="${b.pos[k]}"></label>`).join('')}</div>
      <p class="wl-hint">Drag the block on the page, or pull its white handles. The page is ${W.COLS} squares across. Arrow keys move it by one.</p>
      <div class="wl-acts"><button class="wl-btn" data-act="front" title="Bring to the front">${ICON.front} Front</button><button class="wl-btn" data-act="fwd" title="Forward one">${ICON.up}</button><button class="wl-btn" data-act="bwd" title="Back one">${ICON.down}</button><button class="wl-btn" data-act="back" title="Send to the back">${ICON.back} Back</button></div>`;
    h += `<h3>Look</h3>${b.t !== 'space' && b.t !== 'divider' && b.t !== 'shape' ? `<div class="wl-row"><span class="wl-hint" style="margin:0">Line up</span><div class="wl-seg" role="group">${[['left', 'Left'], ['center', 'Middle'], ['right', 'Right']].map(([v, n]) => `<button data-set="align" data-v="${v}" aria-pressed="${(b.align || 'left') === v}">${n}</button>`).join('')}</div></div>` : ''}
      ${!['space', 'divider'].includes(b.t) ? `${fontButton('wlBFont', b.font, 'Font', 'The site’s font')}${num('fs', 'Size of words', 10, 120, 1, b.fs, 'px', b.size ? { s: 'small', l: 'large', xl: 'extra large' }[b.size] : 'normal')}
      ${colourHTML('data-colour', 'color', b.color || '', 'Colour of words', 'Back to normal')}` : ''}
      ${b.t !== 'divider' ? `${colourHTML('data-colour', 'bg', b.bg || '', b.t === 'shape' ? 'Shape colour' : 'Background', 'No background')}
      ${b.bg ? `<label class="wl-field">Blend into a second colour<select data-sel="grad"><option value="">No</option>${Object.entries(W.GRADS).filter(([k]) => k !== 'none').map(([k, n]) => `<option value="${k}"${b.grad === k ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></label>${b.grad ? colourHTML('data-colour', 'bg2', b.bg2 || '#ffffff', 'Second colour') : ''}` : ''}` : colourHTML('data-colour', 'color', b.color || '', 'Colour of the line', 'Back to normal')}
      <details class="wl-more"${b.bw || b.rad != null || b.sh || b.pad != null ? ' open' : ''}><summary>Border, corners and shadow</summary>
        ${num('bw', b.t === 'divider' ? 'Thickness' : 'Border', 0, 20, 1, b.bw || null, 'px', 'none')}
        ${b.bw ? `<div class="wl-seg" role="group">${Object.entries(W.BORDERS).map(([k, n]) => `<button data-set="bs" data-v="${k === 'solid' ? '' : k}" aria-pressed="${(b.bs || 'solid') === k}">${n}</button>`).join('')}</div>${b.t !== 'divider' ? colourHTML('data-colour', 'bc', b.bc || '', 'Border colour', 'Same as the words') : ''}` : ''}
        ${b.t !== 'divider' ? `${num('rad', 'Corners', 0, 120, 1, b.rad, 'px')}${num('pad', 'Space inside', 0, 80, 1, b.pad, 'px')}
        <label class="wl-field">Shadow<select data-sel="sh"><option value="">None</option>${Object.keys(W.SHADOWS).map(k => `<option value="${k}"${b.sh === k ? ' selected' : ''}>${k[0].toUpperCase() + k.slice(1)}</option>`).join('')}</select></label>` : ''}
      </details>
      <details class="wl-more"${b.op || b.rot || b.anim || b.hov ? ' open' : ''}><summary>Tilt, see-through and moving</summary>
        ${num('rot', 'Tilt', -45, 45, 1, b.rot || null, '°', 'straight')}${num('op', 'See-through', 10, 100, 5, b.op || null, '%', 'solid')}
        <label class="wl-field">When the page opens<select data-sel="anim"><option value="">Stay still</option>${Object.entries(W.ANIMS).map(([k, n]) => `<option value="${k}"${b.anim === k ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
        <label class="wl-field">When the mouse is on it<select data-sel="hov"><option value="">Nothing</option>${Object.entries(W.HOVERS).map(([k, n]) => `<option value="${k}"${b.hov === k ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
        ${b.anim ? `<div class="wl-acts"><button class="wl-btn" data-act="watch">${ICON.play} Watch it</button></div>` : ''}<p class="wl-hint">Moving things play in Preview and on the real website.</p>
      </details>
      <details${b.cls ? ' open' : ''}><summary>Class name (for your own CSS)</summary><input class="wl-in" data-in="cls" maxlength="60" value="${esc(b.cls || '')}" placeholder="e.g. special"></details>
      <h3>Block</h3><div class="wl-acts">${top ? '' : `<button class="wl-btn" data-act="up" title="Move up (Alt+↑)">${ICON.up}</button><button class="wl-btn" data-act="down" title="Move down (Alt+↓)">${ICON.down}</button>`}<button class="wl-btn" data-act="dup" title="Make a copy (Ctrl+D)">${ICON.copy} Copy</button><button class="wl-btn danger" data-act="del" title="Delete (Delete key)">${ICON.trash} Delete</button></div>`;
    R.innerHTML = h;
    const set = (k, v, re = true) => { if (v === '' || v == null) delete b[k]; else b[k] = v; changed(true); if (re) render(); else canvas(); };
    R.querySelectorAll('[data-set]').forEach(x => x.onclick = () => { const k = x.dataset.set, v = x.dataset.v; set(k, k === 'level' ? +v : k === 'ordered' ? v === '1' : v); });
    R.querySelectorAll('[data-in]').forEach(x => x.oninput = () => { const k = x.dataset.in; let v = x.value;
      if (k === 'caption' || (k === 'text' && b.t === 'shape')) v = esc(v); if (k === 'html') { clearTimeout(x._t); x._t = setTimeout(() => { b.html = W.cleanHTML(x.value, proj.site.order, proj.imgs); changed(true); canvas(); }, 600); return; }
      if (k === 'cls') v = v.replace(/[^\w\s-]/g, '');
      b[k] = v; if (k === 'alt' || k === 'caption' || k === 'label' || k === 'by' || k === 'cls' || k === 'text') canvas(); changed(); goalsSoon(); });
    R.querySelectorAll('[data-in="alt"],[data-in="caption"]').forEach(x => x.onchange = () => right());
    R.querySelectorAll('[data-num]').forEach(x => { x.oninput = () => { b[x.dataset.num] = +x.value; canvas(); changed(); const l = x.closest('label'); if (l) l.firstChild.textContent = (x.dataset.num === 'w' ? 'Size: ' + x.value + '%' : 'Height: ' + x.value + 'px'); }; x.onchange = () => changed(true); });
    R.querySelectorAll('[data-bool]').forEach(x => x.onchange = () => set(x.dataset.bool, x.checked));
    bindColours(R, 'data-colour', (k, v) => { b[k] = v; canvas(); changed(); }, () => { changed(true); right(); });
    R.querySelectorAll('[data-n]').forEach(x => { const k = x.dataset.n; x.oninput = () => { b[k] = +x.value; if (k === 'fs') delete b.size; if ((k === 'bw' || k === 'rot') && !b[k]) delete b[k]; if (k === 'op' && b.op >= 100) delete b.op; const l = x.closest('label').querySelector('b'); if (l) l.textContent = x.value + ({ rot: '°', op: '%' }[k] || 'px'); canvas(); changed(); }; x.onchange = () => { changed(true); right(); }; });
    R.querySelectorAll('[data-sel]').forEach(x => x.onchange = () => { const k = x.dataset.sel; if (k === 'grad' && x.value && !b.bg2) b.bg2 = '#ffffff'; set(k, x.value); if (k === 'anim' && x.value) setTimeout(watch, 60); });
    R.querySelectorAll('[data-pos]').forEach(x => x.onchange = () => { const p = Object.assign({}, b.pos, { [x.dataset.pos]: +x.value }); b.pos = W.cleanPos(p) || b.pos; W.sortFree(proj['p' + page].blocks); changed(true); render(); });
    const bf = R.querySelector('#wlBFont'); if (bf) bf.onclick = () => fontPicker(b.font, 'Font for this block', 'The site’s font', k => set('font', k));
    R.querySelectorAll('[data-clear]').forEach(x => x.onclick = e => { e.preventDefault(); set(x.dataset.clear, ''); });
    R.querySelectorAll('[data-pic]').forEach(x => x.onclick = () => { b[x.dataset.pic] = x.dataset.v; if (b.t === 'image' && x.dataset.v.startsWith('lib:') && (!b.alt || W.PICTURE_KEYS.some(k => b.alt === W.PICTURES[k][0]))) b.alt = W.PICTURES[x.dataset.v.slice(4)][0]; changed(true); render(); });
    R.querySelectorAll('[data-upload]').forEach(x => x.onclick = () => upload(url => { b[x.dataset.upload] = url; if (b.t === 'image' && !b.alt) b.alt = ''; changed(true); render(); }));
    R.querySelectorAll('[data-link]').forEach(x => x.onchange = () => { const url = R.querySelector(`[data-linkurl="${x.dataset.link}"]`); if (x.value === 'web') { url.hidden = false; url.focus(); return; } url.hidden = true; set(x.dataset.link, x.value); });
    R.querySelectorAll('[data-linkurl]').forEach(x => x.onchange = () => { let v = x.value.trim(); if (v && !/^https?:\/\//i.test(v)) v = 'https://' + v; const ok = W.cleanHref(v, proj.site.order); if (v && !ok) { toast('That isn’t a web address CodeJump can link to.'); return; } set(x.dataset.linkurl, ok || ''); });
    R.querySelectorAll('[data-act]').forEach(x => x.onclick = () => {
      const a = x.dataset.act;
      if (a === 'up') moveBlock(-1); else if (a === 'down') moveBlock(1); else if (a === 'dup') dupBlock(); else if (a === 'del') delBlock();
      else if (['front', 'fwd', 'bwd', 'back'].includes(a)) layer(a); else if (a === 'watch') watch();
      else if (a === 'item+') { b.items.push('New item'); changed(true); render(); }
      else if (a === 'cols2' || a === 'cols3') { const n = +a.slice(4); if (n < b.cols.length) { const gone = b.cols.slice(n).flat(); b.cols = b.cols.slice(0, n); b.cols[n - 1].push(...gone); } else while (b.cols.length < n) b.cols.push([]); changed(true); render(); }
      else if (a.startsWith('colAdd')) { const t = W.blockOf('text'); b.cols[+a.slice(6)].push(t); sel = t.id; changed(true); render(); }
      else if (a === 'row+' && b.rows.length < W.LIMITS.rows) { b.rows.push(b.rows[0].map(() => '')); changed(true); render(); }
      else if (a === 'row-' && b.rows.length > 1) { b.rows.pop(); changed(true); render(); }
      else if (a === 'col+' && b.rows[0].length < W.LIMITS.cells) { b.rows.forEach(r => r.push('')); changed(true); render(); }
      else if (a === 'col-' && b.rows[0].length > 1) { b.rows.forEach(r => r.pop()); changed(true); render(); }
    });
  }
  // a picture from the pupil's device: made smaller and kept inside the project
  function upload(done) {
    if (Object.keys(proj.imgs).length >= W.LIMITS.imgs) { toast('This website has as many of your own pictures as it can hold.'); return; }
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/png,image/jpeg,image/gif,image/webp';
    inp.onchange = () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      if (!/^image\/(png|jpeg|gif|webp)$/.test(f.type)) { toast('That isn’t a picture CodeJump can use.'); return; }
      const img = new Image(), url = URL.createObjectURL(f);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let max = 1000, data = '';
        for (let q = 0.85; ; q -= 0.12) {
          const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
          const g = c.getContext('2d'); g.fillStyle = '#fff'; if (f.type === 'image/jpeg') g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
          data = f.type === 'image/png' && c.width * c.height < 160000 ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', Math.max(0.4, q));
          if (data.length <= W.LIMITS.img || max < 300) break;
          max = Math.round(max * 0.75);
        }
        if (data.length > W.LIMITS.img) { toast('That picture is too big. Try a smaller one.'); return; }
        const id = W.newId(); proj.imgs[id] = data; done('img:' + id);
      };
      img.onerror = () => { URL.revokeObjectURL(url); toast('That picture couldn’t be opened.'); };
      img.src = url;
    };
    inp.click();
  }

  // ── Code tab ──
  const HI = {
    html: s => esc(s).replace(/(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?)([a-zA-Z][\w-]*)((?:[^&]|&(?!gt;))*?)(\/?&gt;)/g, (m, com, open, tag, attrs, close) => com ? `<span class="t-com">${com}</span>` :
      `<span class="t-tag">${open}${tag}</span>${attrs.replace(/([\w-]+)(=)(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;)/g, '<span class="t-attr">$1</span>$2<span class="t-str">$3</span>')}<span class="t-tag">${close}</span>`),
    css: s => esc(s).replace(/(\/\*[\s\S]*?\*\/)|([^{}]+)(\{)([^}]*)(\})/g, (m, com, sel, o, body, c) => com ? `<span class="t-com">${com}</span>` :
      `<span class="t-sel">${sel}</span>${o}${body.replace(/([\w-]+)(\s*:\s*)([^;]+)/g, '<span class="t-prop">$1</span>$2<span class="t-val">$3</span>')}${c}`)
  };
  function edPaint(ed, kind) {
    const ta = ed.querySelector('textarea'), pre = ed.querySelector('pre'), ln = ed.querySelector('.ln');
    pre.innerHTML = HI[kind](ta.value) + '\n';
    ln.textContent = ta.value.split('\n').map((_, i) => i + 1).join('\n');
    ta.style.height = 'auto'; ta.style.height = Math.max(ed.clientHeight, pre.scrollHeight) + 'px';
  }
  function edBind(ed, kind, apply) {
    const ta = ed.querySelector('textarea');
    ta.addEventListener('input', () => { edPaint(ed, kind); clearTimeout(ta._t); ta._t = setTimeout(apply, 700); });
    ta.addEventListener('keydown', e => {
      if (e.key === 'Tab') { e.preventDefault(); document.execCommand('insertText', false, '  '); }
      if (e.key === 'Enter') { const v = ta.value, s = ta.selectionStart, line = v.slice(v.lastIndexOf('\n', s - 1) + 1, s), ind = (/^\s*/.exec(line) || [''])[0]; e.preventDefault(); document.execCommand('insertText', false, '\n' + ind); }
    });
    ta.addEventListener('blur', () => { clearTimeout(ta._t); apply(); });
  }
  function code() {
    if (tab !== 'code') return;
    $('wlCodePage').textContent = '· ' + proj['p' + page].name;
    const h = $('wlHtml'), c = $('wlCss');
    if (document.activeElement !== h) h.value = W.pageHTML(proj, page, { code: true });
    if (document.activeElement !== c) c.value = proj.site.css;
    $('wlThemeCss').textContent = W.siteCSS(Object.assign({}, proj, { site: Object.assign({}, proj.site, { css: '' }) }));
    edPaint($('wlHtmlEd'), 'html'); edPaint($('wlCssEd'), 'css');
  }
  edBind($('wlHtmlEd'), 'html', () => {
    const txt = $('wlHtml').value, cur = W.pageHTML(proj, page, { code: true });
    if (txt === cur) return;
    const r = W.fromHTML(txt, proj), pg = proj['p' + page];
    pg.blocks = r.blocks; sel = null; codeEdits++;
    if (pg.layout === 'free') { W.placeMissing(pg.blocks); W.sortFree(pg.blocks); }
    const note = $('wlHtmlNote');
    note.hidden = !r.removed.length; note.className = 'wl-note bad';
    note.textContent = r.removed.length ? 'Taken out, because a CodeJump website can’t use them: ' + r.removed.map(t => '<' + t + '>').join(', ') + '.' : '';
    $('wlHtmlStatus').textContent = 'Saved · ' + pg.blocks.length + ' block' + (pg.blocks.length === 1 ? '' : 's');
    changed(true);
  });
  edBind($('wlCssEd'), 'css', () => {
    const txt = $('wlCss').value; const clean = W.cleanCSS(txt);
    if (clean === proj.site.css && txt.trim() === clean) return;
    const rules = (txt.replace(/\/\*[\s\S]*?\*\//g, '').match(/\{/g) || []).length, kept = (clean.match(/\{/g) || []).length;
    proj.site.css = clean; codeEdits++;
    const note = $('wlCssNote'); note.hidden = kept >= rules; note.className = 'wl-note';
    note.textContent = kept < rules ? `${rules - kept} rule${rules - kept === 1 ? '' : 's'} couldn’t be used (only plain selectors and safe properties work, and no url()).` : '';
    $('wlCssStatus').textContent = kept + ' rule' + (kept === 1 ? '' : 's') + ' in use';
    changed(true);
  });

  // ── Preview tab ──
  let previewN = 0;
  function preview() {
    if (tab !== 'preview') return;
    const f = $('wlFrameView'); f.className = device;
    const n = ++previewN, keys = W.usedFonts(proj);
    fontData(keys).then(fonts => { if (n !== previewN || tab !== 'preview') return; f.srcdoc = W.siteHTML(proj, { home: page, srcdoc: true, fonts }); }); // opens on the page you were looking at
  }

  // ── pop-ups: templates, check, link ──
  function pop(inner, bind) {
    closePop();
    const p = document.createElement('div'); p.className = 'wl-pop'; p.innerHTML = `<div class="wl-pop-box" role="dialog" aria-modal="true">${inner}</div>`;
    wl.appendChild(p); p.addEventListener('click', e => { if (e.target === p || e.target.closest('[data-close]')) closePop(); });
    p.addEventListener('keydown', e => { if (e.key === 'Escape') closePop(); });
    if (bind) bind(p.querySelector('.wl-pop-box'));
    const f = p.querySelector('button, input, select'); if (f) f.focus();
  }
  function closePop() { const p = wl.querySelector('.wl-pop'); if (p) p.remove(); }
  function templates(first) {
    pop(`<h2>${first ? 'What kind of website?' : 'Start from a template'}</h2><p class="wl-hint">${first ? 'Pick a start. You can change everything afterwards.' : 'This swaps your pages for the template’s. Your style choices stay.'}</p>
      <div class="wl-tpl">${Object.entries(W.TEMPLATES).map(([k, t]) => `<button data-tpl="${k}"><b>${esc(t[0])}</b><span>${esc(t[1])}</span></button>`).join('')}</div>
      ${first ? '' : '<div class="wl-acts"><button class="wl-btn" data-close>Cancel</button></div>'}`, box => {
      box.querySelectorAll('[data-tpl]').forEach(b => b.onclick = async () => {
        if (!first && !(await confirm('Swap your pages for the template? (Undo brings them back.)'))) return;
        const n = W.newProject(b.dataset.tpl), theme = proj.site.theme, goalsKeep = proj.goals;
        changed(true);
        for (const id of proj.site.order) delete proj['p' + id];
        Object.assign(proj, n); proj.site.theme = first ? n.site.theme : theme; if (goalsKeep) proj.goals = goalsKeep;
        page = proj.site.order[0]; sel = null; closePop(); changed(true); render();
      });
    });
  }
  function check() {
    const list = W.checkSite(proj);
    pop(`<h2>Check my site</h2><ul class="wl-checks">${list.map((x, i) => `<li class="${x.level}"><b>${x.level === 'warn' ? 'Fix' : x.level === 'tip' ? 'Tip' : 'Good'}</b><span>${esc(x.text)}</span>${x.page ? `<button class="wl-btn" data-show="${i}">Show me</button>` : ''}</li>`).join('')}</ul><div class="wl-acts"><button class="wl-btn gold" data-close>Done</button></div>`, box => {
      box.querySelectorAll('[data-show]').forEach(b => b.onclick = () => { const x = list[+b.dataset.show]; page = x.page; sel = x.block; tab = 'design'; closePop(); render(); const el = shadow.querySelector(`[data-bid="${x.block}"]`); if (el) el.scrollIntoView({ block: 'center' }); });
    });
  }
  async function download() {
    const fonts = await fontData(W.usedFonts(proj));
    const blob = new Blob([W.siteHTML(proj, { fonts })], { type: 'text/html' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = (proj.site.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'my-website') + '.html';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast('Downloaded! Open the file in any web browser.');
  }

  // ── goals ──
  let goalsT = 0;
  function goalsSoon() { clearTimeout(goalsT); goalsT = setTimeout(goals, 300); }
  function goals() {
    const G = $('wlGoals');
    if (!proj.goals || !proj.goals.list.length) { G.hidden = true; return; }
    const ticks = W.checkGoals(proj.goals, proj, { codeEdits }), n = ticks.filter(x => x.ok).length, all = n === ticks.length;
    G.hidden = false; G.classList.toggle('done', all);
    G.innerHTML = `<b>${esc(proj.goals.title)}</b> <span>${n}/${ticks.length}</span>${goalsFolded ? '' : ticks.map(x => `<span class="wl-goal${x.ok ? ' ok' : ''}"><i></i>${esc(x.text)}</span>`).join('')}<button class="wl-fold" aria-expanded="${!goalsFolded}">${goalsFolded ? 'Show' : 'Hide'}</button>`;
    G.querySelector('.wl-fold').onclick = () => { goalsFolded = !goalsFolded; goals(); };
    if (all && !goalsWereDone) { goalsWereDone = true; toast('Every goal done. Brilliant!'); if (host.onGoalsDone) host.onGoalsDone(); }
    if (!all) goalsWereDone = false;
  }

  // ── draw everything ──
  function render() {
    if (destroyed) return;
    if (!proj['p' + page]) page = proj.site.order[0];
    if (sel && !findBlock(sel)) sel = null;
    bar(); left(); right();
    $('wlStage').hidden = tab !== 'design'; $('wlCode').hidden = tab !== 'code'; $('wlPreview').hidden = tab !== 'preview';
    if (tab === 'design') canvas(); else hideToolbar();
    code(); preview(); goals();
  }

  // ── events ──
  root.querySelectorAll('.wl-tab').forEach(b => b.onclick = () => { if (tab === 'code') { $('wlHtml').blur(); $('wlCss').blur(); } tab = b.dataset.tab; sel = tab === 'design' ? sel : null; render(); });
  root.querySelectorAll('#wlDevice button').forEach(b => b.onclick = () => { device = b.dataset.dev; bar(); canvas(); preview(); });
  $('wlTitle').oninput = () => { proj.site.title = $('wlTitle').value.slice(0, 80); changed(); goalsSoon(); };
  $('wlTitle').onchange = () => { if (!proj.site.title.trim()) proj.site.title = 'My website'; changed(true); canvas(); };
  $('wlUndo').onclick = doUndo; $('wlRedo').onclick = doRedo;
  $('wlCheck').onclick = check; $('wlDownload').onclick = download;
  const editingText = () => { const a = shadow.activeElement || document.activeElement; return !!(a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))); };
  function onKey(e) {
    if (destroyed || !root.isConnected || root.offsetParent === null) return;
    if (document.querySelector('[id$="-modal"]:not(.hide), #cj-dialog') && !wl.querySelector('.wl-pop')) return;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && !e.shiftKey && e.key.toLowerCase() === 'z' && !editingText()) { e.preventDefault(); doUndo(); return; }
    if (mod && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z')) && !editingText()) { e.preventDefault(); doRedo(); return; }
    if (tab !== 'design' || editingText()) return;
    if (sel && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); delBlock(); }
    else if (sel && isFree() && topBlock(sel) && e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); layer(e.key === 'ArrowUp' ? 'fwd' : 'bwd'); }
    else if (sel && isFree() && topBlock(sel) && /^Arrow/.test(e.key)) { e.preventDefault(); const n = e.shiftKey ? 5 : 1; nudge(e.key === 'ArrowLeft' ? -n : e.key === 'ArrowRight' ? n : 0, e.key === 'ArrowUp' ? -n : e.key === 'ArrowDown' ? n : 0); }
    else if (sel && e.altKey && e.key === 'ArrowUp') { e.preventDefault(); moveBlock(-1); }
    else if (sel && e.altKey && e.key === 'ArrowDown') { e.preventDefault(); moveBlock(1); }
    else if (sel && mod && e.key.toLowerCase() === 'd') { e.preventDefault(); dupBlock(); }
    else if (e.key === 'Escape' && sel) { sel = null; render(); }
  }
  document.addEventListener('keydown', onKey);
  const onResize = () => { if (tbar && sel) { const el = shadow.querySelector(`[data-bid="${sel}"]`); if (el) toolbarFor(el); } overlay(); };
  window.addEventListener('resize', onResize);

  render();

  function getProject() {
    // pictures nobody uses any more are left out of the save
    const used = new Set(); W.eachBlock(proj, b => { for (const k of ['src']) if (b[k] && b[k].startsWith('img:')) used.add(b[k].slice(4)); if (b.t === 'html') for (const m of b.html.matchAll(/img:([a-z]{6})/g)) used.add(m[1]); });
    const out = JSON.parse(JSON.stringify(proj)); for (const k of Object.keys(out.imgs)) if (!used.has(k)) delete out.imgs[k];
    return out;
  }
  return {
    getProject,
    setProject(p) { quiet = true; try { closePop(); load(p, !p); render(); } finally { quiet = false; } },
    resume() { render(); },
    pause() { hideToolbar(); closePop(); },
    destroy() { destroyed = true; document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); hideToolbar(); root.innerHTML = ''; },
    // live collaboration: the site (title, theme, page order, CSS), the pictures, and each page are separate parts, so two pupils
    // can build different pages at the same time. Pages go first so a partner never sees a page listed before it arrives.
    liveParts() {
      const o = {};
      // pages a partner sent before their site listed them are reported as they arrived, so CodeJump never mistakes
      // them for a change of ours (and sends an old copy over theirs) once the site does list them
      for (const k of Object.keys(pool)) if (!proj[k]) o[k] = { [k]: pool[k] };
      for (const id of proj.site.order) o['p' + id] = { ['p' + id]: proj['p' + id] };
      o.imgs = { imgs: proj.imgs }; o.site = { site: proj.site }; return JSON.parse(JSON.stringify(o));
    },
    liveSet(part, v) {
      if (!v || typeof v !== 'object') return;
      for (const k of Object.keys(v)) if (/^p[a-z]{6}$/.test(k)) pool[k] = v[k];
      const merged = Object.assign({}, pool, proj, v); // a page that arrived earlier (in pool) is used once the site lists it
      const was = sel; proj = W.cleanProject(merged);
      for (const id of proj.site.order) pool['p' + id] = proj['p' + id];
      lastSnap = JSON.stringify(proj); undo = []; redo = [];
      if (!proj.site.order.includes(page)) page = proj.site.order[0];
      sel = was && findBlock(was) ? was : null; render(); goals();
    },
    liveBusy() { return editingText() || !!wl.querySelector('.wl-pop'); },
    // test hooks
    _proj: () => proj, _page: () => page, _sel: () => sel, _select(id, pid) { if (pid) page = pid; sel = id; render(); }, _tab(t) { tab = t; render(); },
    _shadow: () => shadow, _add: addBlock, _layout: setLayout, _device(d) { device = d; render(); }, _overlay: () => shadow.querySelector('.wl-ov'), _codeEdits: () => codeEdits, _goals: () => proj.goals ? W.checkGoals(proj.goals, proj, { codeEdits }) : null,
    _applyHTML(txt) { $('wlHtml').value = txt; edPaint($('wlHtmlEd'), 'html'); $('wlHtml').dispatchEvent(new Event('blur')); },
    _applyCSS(txt) { $('wlCss').value = txt; edPaint($('wlCssEd'), 'css'); $('wlCss').dispatchEvent(new Event('blur')); }
  };
}
