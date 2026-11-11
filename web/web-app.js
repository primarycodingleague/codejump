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
const esc = W.esc;
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
      S.innerHTML = `<h3>Pages</h3>${pagesHTML()}<div class="wl-acts"><button class="wl-btn" id="wlAddPage"${proj.site.order.length >= W.LIMITS.pages ? ' disabled' : ''}>${ICON.plus} Add a page</button></div><p class="wl-hint">The first page is the home page: it opens first. The menu at the top of every page links them all.</p>`;
      bindPages(S);
      S.querySelector('#wlAddPage').onclick = () => { const id = W.addPage(proj, 'Page ' + (proj.site.order.length + 1)); if (!id) return; page = id; sel = null; changed(true); render(); renamePage(id); };
    } else styleSide(S);
  }
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
  function styleSide(S) {
    const t = proj.site.theme;
    const seg = (k, opts) => `<div class="wl-seg" role="group">${opts.map(([v, n]) => `<button data-theme="${k}" data-v="${v}" aria-pressed="${t[k] === v}">${n}</button>`).join('')}</div>`;
    S.innerHTML = `<h3>Colour sets</h3><div class="wl-sets">${Object.entries(W.THEMES).map(([k, c]) => `<button class="wl-set" data-set="${k}" style="background:${c.bg};color:${c.head}"><span class="sw">${['head', 'accent', 'text'].map(x => `<i style="background:${c[x]}"></i>`).join('')}</span>${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div>
      <h3>Colours</h3>${[['bg', 'Background'], ['text', 'Words'], ['head', 'Headings'], ['accent', 'Buttons and menu'], ['link', 'Links']].map(([k, n]) => `<label class="wl-colour"><input type="color" data-col="${k}" value="${t[k].length === 4 ? '#' + t[k].slice(1).split('').map(x => x + x).join('') : t[k]}"><span>${n}</span></label>`).join('')}
      <h3>Font</h3><label class="wl-field"><select id="wlFont">${Object.entries(W.FONTS).map(([k, f]) => `<option value="${k}"${t.font === k ? ' selected' : ''} style="font-family:${esc(f[1])}">${esc(f[0])}</option>`).join('')}</select></label>
      <h3>Page width</h3>${seg('width', [['narrow', 'Narrow'], ['normal', 'Normal'], ['wide', 'Wide']])}
      <h3>Menu</h3>${seg('nav', [['bar', 'Bar'], ['tabs', 'Tabs'], ['none', 'None']])}
      <h3>Corners</h3>${seg('corners', [['round', 'Round'], ['sharp', 'Sharp']])}
      <p class="wl-hint">Want more? Open <b>Code</b> and write your own CSS.</p>`;
    S.querySelectorAll('[data-set]').forEach(b => b.onclick = () => { Object.assign(proj.site.theme, W.THEMES[b.dataset.set]); changed(true); render(); });
    S.querySelectorAll('[data-col]').forEach(inp => { inp.oninput = () => { proj.site.theme[inp.dataset.col] = inp.value; canvas(); changed(); }; inp.onchange = () => changed(true); });
    S.querySelector('#wlFont').onchange = e => { proj.site.theme.font = e.target.value; changed(true); canvas(); };
    S.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => { proj.site.theme[b.dataset.theme] = b.dataset.v; changed(true); render(); });
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
    .columns > .col:empty::after { content: 'Empty column: choose it, then add blocks'; display: block; color: #aaa; font: italic 14px sans-serif; padding: 16px; border: 2px dashed #ddd; border-radius: 10px; }`;
  function navHTML() {
    const t = proj.site.theme; if (t.nav === 'none' || proj.site.order.length < 2) return '';
    return `<nav class="site-nav${t.nav === 'tabs' ? ' tabs' : ''}">${t.nav === 'bar' ? `<span class="site-name">${esc(proj.site.title)}</span>` : ''}${proj.site.order.map(id => `<a href="#p-${id}" data-goto="${id}"${id === page ? ' class="here"' : ''}>${esc(proj['p' + id].name)}</a>`).join('')}</nav>`;
  }
  function canvas() {
    if (tab !== 'design') return;
    const pg = proj['p' + page]; if (!pg) return;
    const body = pg.blocks.map(b => W.blockHTML(b, { pages: proj.site.order, imgs: proj.imgs, edit: true })).join('\n');
    // a shadow root has no :root or <body>: the site's rules for those apply to the host and a wrapper instead
    const css = W.siteCSS(proj).replace(/^:root \{/m, ':host {').replace(/^body \{/m, '.wl-body {').replace(/^\* \{/m, '* {');
    shadow.innerHTML = `<style>${css}${EDIT_CSS}</style><div class="wl-body"><div class="page" id="wlPage">${navHTML()}${body || ''}<div class="wl-addhere">${pg.blocks.length ? 'Choose a block, then add another from the left' : 'This page is empty. Add a block from the left.'}</div></div></div>`;
    $('wlFrame').className = 'wl-frame ' + device;
    $('wlFrame').style.background = proj.site.theme.bg;
    if (sel) editable(sel);
  }
  // the selected block's words can be typed straight onto the page
  const RICH = { heading: 1, text: 1, list: 1, quote: 1, banner: 1, card: 1, table: 1, image: 1 };
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
    const place = () => { if (!tbar) return; const r = el.getBoundingClientRect(), w = wl.getBoundingClientRect(), st = $('wlStage').getBoundingClientRect(); tbar.style.left = Math.max(8, r.left - w.left) + 'px'; tbar.style.top = Math.max(st.top - w.top + 4, r.top - w.top - 40) + 'px'; tbar.hidden = r.bottom < st.top || r.top > st.bottom; };
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
    const a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault();
    const go = a && a.dataset.goto; if (go && !e.target.closest('[data-bid]')) { page = go; sel = null; render(); return; }
    const el = e.target.closest && e.target.closest('[data-bid]');
    if (!el) { if (sel) { sel = null; hideToolbar(); render(); } return; }
    const id = el.dataset.bid;
    // inside columns, a click on an inner block chooses that block
    if (id !== sel) { sel = id; render(); const n = shadow.querySelector(`[data-bid="${id}"] [contenteditable], [data-bid="${id}"][contenteditable]`); if (n) placeCaret(n, e); }
  });
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
    if (proj['p' + page].blocks.length > W.LIMITS.blocks) { proj['p' + page].blocks.pop(); toast('This page is full. Add a new page instead.'); return; }
    sel = b.id; changed(true); render();
    const el = shadow.querySelector(`[data-bid="${b.id}"]`); if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function moveBlock(d) { const f = sel && findBlock(sel); if (!f) return; const j = f.i + d; if (j < 0 || j >= f.list.length) return; [f.list[f.i], f.list[j]] = [f.list[j], f.list[f.i]]; changed(true); render(); }
  function dupBlock() { const f = sel && findBlock(sel); if (!f) return; const c = JSON.parse(JSON.stringify(f.b)); const re = x => { x.id = W.newId(); if (x.cols) x.cols.forEach(col => col.forEach(re)); }; re(c); f.list.splice(f.i + 1, 0, c); sel = c.id; changed(true); render(); }
  function delBlock() { const f = sel && findBlock(sel); if (!f) return; f.list.splice(f.i, 1); sel = (f.list[f.i] || f.list[f.i - 1] || {}).id || (f.parent ? f.parent.id : null); changed(true); render(); }

  // ── the inspector ──
  function right() {
    const R = $('wlRight');
    const f = sel && findBlock(sel);
    if (!f) { R.innerHTML = `<div class="wl-insp-h">${ICON.page} ${esc(proj['p' + page].name)}</div><p class="wl-hint">Click anything on the page to change it, or add a block from the left.</p>
      <h3>This page</h3><label class="wl-field">Page name<input id="wlPgName" maxlength="40" value="${esc(proj['p' + page].name)}"></label>`;
      R.querySelector('#wlPgName').onchange = e => { const v = e.target.value.trim(); if (v) { proj['p' + page].name = v; changed(true); render(); } };
      return; }
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
    }
    h += `<h3>Look</h3>${b.t !== 'space' && b.t !== 'divider' ? `<div class="wl-row"><span class="wl-hint" style="margin:0">Line up</span><div class="wl-seg" role="group">${[['left', 'Left'], ['center', 'Middle'], ['right', 'Right']].map(([v, n]) => `<button data-set="align" data-v="${v}" aria-pressed="${(b.align || 'left') === v}">${n}</button>`).join('')}</div></div>` : ''}
      ${b.t !== 'space' ? `<div class="wl-row" style="margin-top:6px"><span class="wl-hint" style="margin:0">Size</span><div class="wl-seg" role="group">${[['s', 'S'], ['', 'M'], ['l', 'L'], ['xl', 'XL']].map(([v, n]) => `<button data-set="size" data-v="${v}" aria-pressed="${(b.size || '') === v}">${n}</button>`).join('')}</div></div>
      <label class="wl-colour"><input type="color" data-colour="color" value="${b.color || proj.site.theme.text}"><span>Colour</span><button class="wl-mini" data-clear="color" title="Back to normal" aria-label="Back to normal colour"${b.color ? '' : ' disabled'}>${ICON.x}</button></label>
      <label class="wl-colour"><input type="color" data-colour="bg" value="${b.bg || '#ffffff'}"><span>Background</span><button class="wl-mini" data-clear="bg" title="No background" aria-label="No background"${b.bg ? '' : ' disabled'}>${ICON.x}</button></label>` : ''}
      <details${b.cls ? ' open' : ''}><summary>Class name (for your own CSS)</summary><input class="wl-in" data-in="cls" maxlength="60" value="${esc(b.cls || '')}" placeholder="e.g. special"></details>
      <h3>Block</h3><div class="wl-acts"><button class="wl-btn" data-act="up" title="Move up (Alt+↑)">${ICON.up}</button><button class="wl-btn" data-act="down" title="Move down (Alt+↓)">${ICON.down}</button><button class="wl-btn" data-act="dup" title="Make a copy (Ctrl+D)">${ICON.copy} Copy</button><button class="wl-btn danger" data-act="del" title="Delete (Delete key)">${ICON.trash} Delete</button></div>`;
    R.innerHTML = h;
    const set = (k, v, re = true) => { if (v === '' || v == null) delete b[k]; else b[k] = v; changed(true); if (re) render(); else canvas(); };
    R.querySelectorAll('[data-set]').forEach(x => x.onclick = () => { const k = x.dataset.set, v = x.dataset.v; set(k, k === 'level' ? +v : k === 'ordered' ? v === '1' : v); });
    R.querySelectorAll('[data-in]').forEach(x => x.oninput = () => { const k = x.dataset.in; let v = x.value;
      if (k === 'caption') v = esc(v); if (k === 'html') { clearTimeout(x._t); x._t = setTimeout(() => { b.html = W.cleanHTML(x.value, proj.site.order, proj.imgs); changed(true); canvas(); }, 600); return; }
      if (k === 'cls') v = v.replace(/[^\w\s-]/g, '');
      b[k] = v; if (k === 'alt' || k === 'caption' || k === 'label' || k === 'by' || k === 'cls') canvas(); changed(); goalsSoon(); });
    R.querySelectorAll('[data-in="alt"],[data-in="caption"]').forEach(x => x.onchange = () => right());
    R.querySelectorAll('[data-num]').forEach(x => { x.oninput = () => { b[x.dataset.num] = +x.value; canvas(); changed(); const l = x.closest('label'); if (l) l.firstChild.textContent = (x.dataset.num === 'w' ? 'Size: ' + x.value + '%' : 'Height: ' + x.value + 'px'); }; x.onchange = () => changed(true); });
    R.querySelectorAll('[data-bool]').forEach(x => x.onchange = () => set(x.dataset.bool, x.checked));
    R.querySelectorAll('[data-colour]').forEach(x => { x.oninput = () => { b[x.dataset.colour] = x.value; canvas(); changed(); }; x.onchange = () => { changed(true); right(); }; });
    R.querySelectorAll('[data-clear]').forEach(x => x.onclick = e => { e.preventDefault(); set(x.dataset.clear, ''); });
    R.querySelectorAll('[data-pic]').forEach(x => x.onclick = () => { b[x.dataset.pic] = x.dataset.v; if (b.t === 'image' && x.dataset.v.startsWith('lib:') && (!b.alt || W.PICTURE_KEYS.some(k => b.alt === W.PICTURES[k][0]))) b.alt = W.PICTURES[x.dataset.v.slice(4)][0]; changed(true); render(); });
    R.querySelectorAll('[data-upload]').forEach(x => x.onclick = () => upload(url => { b[x.dataset.upload] = url; if (b.t === 'image' && !b.alt) b.alt = ''; changed(true); render(); }));
    R.querySelectorAll('[data-link]').forEach(x => x.onchange = () => { const url = R.querySelector(`[data-linkurl="${x.dataset.link}"]`); if (x.value === 'web') { url.hidden = false; url.focus(); return; } url.hidden = true; set(x.dataset.link, x.value); });
    R.querySelectorAll('[data-linkurl]').forEach(x => x.onchange = () => { let v = x.value.trim(); if (v && !/^https?:\/\//i.test(v)) v = 'https://' + v; const ok = W.cleanHref(v, proj.site.order); if (v && !ok) { toast('That isn’t a web address CodeJump can link to.'); return; } set(x.dataset.linkurl, ok || ''); });
    R.querySelectorAll('[data-act]').forEach(x => x.onclick = () => {
      const a = x.dataset.act;
      if (a === 'up') moveBlock(-1); else if (a === 'down') moveBlock(1); else if (a === 'dup') dupBlock(); else if (a === 'del') delBlock();
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
  function preview() {
    if (tab !== 'preview') return;
    const html = W.siteHTML(proj, { home: page, srcdoc: true }); // opens on the page you were looking at
    const f = $('wlFrameView'); f.className = device; f.srcdoc = html;
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
  function download() {
    const blob = new Blob([W.siteHTML(proj)], { type: 'text/html' }), a = document.createElement('a');
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
    else if (sel && e.altKey && e.key === 'ArrowUp') { e.preventDefault(); moveBlock(-1); }
    else if (sel && e.altKey && e.key === 'ArrowDown') { e.preventDefault(); moveBlock(1); }
    else if (sel && mod && e.key.toLowerCase() === 'd') { e.preventDefault(); dupBlock(); }
    else if (e.key === 'Escape' && sel) { sel = null; render(); }
  }
  document.addEventListener('keydown', onKey);
  const onResize = () => { if (tbar && sel) { const el = shadow.querySelector(`[data-bid="${sel}"]`); if (el) toolbarFor(el); } };
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
    _shadow: () => shadow, _add: addBlock, _codeEdits: () => codeEdits, _goals: () => proj.goals ? W.checkGoals(proj.goals, proj, { codeEdits }) : null,
    _applyHTML(txt) { $('wlHtml').value = txt; edPaint($('wlHtmlEd'), 'html'); $('wlHtml').dispatchEvent(new Event('blur')); },
    _applyCSS(txt) { $('wlCss').value = txt; edPaint($('wlCssEd'), 'css'); $('wlCss').dispatchEvent(new Event('blur')); }
  };
}
