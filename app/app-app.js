/* App Lab — design a phone app (Design: drag parts onto a phone), code it with blocks (Code), and try it (Run). "Put it on my
 * phone" makes a link that opens the app full screen on any phone (app/index.html), which can be added to the home screen.
 * Lazy-loaded by build-and-play.html when an App Lab project opens, and mounted into #app-ui. CodeJump owns saving and
 * sharing: getProject() goes into the payload as `app`.
 *   const lab = mount(root, { project, onChange, toast, confirm, failed, onGoalsDone, shareApp(payloadApp) → Promise<url> })
 *   lab.getProject() · lab.setProject(p) · lab.resume() · lab.pause() · lab.destroy() · liveParts() / liveSet() / liveBusy()
 * Uses the page's Blockly 10 (window.Blockly). Parts are drawn by app-run.js, the same code the phone player uses. */
import * as M from './app-model.js';
import * as R from './app-run.js';
import * as BL from './app-blocks.js';

const CSS_URL = new URL('./app-app.css', import.meta.url).href;
const I = (d) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  button: I('<rect x="3" y="7" width="18" height="10" rx="5"/><path d="M9 12h6"/>'), text: I('<path d="M5 6h14M12 6v13"/>'),
  image: I('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>'),
  textbox: I('<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 10v4"/>'), slider: I('<path d="M3 12h18"/><circle cx="10" cy="12" r="3" fill="currentColor"/>'),
  switch: I('<rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="16" cy="12" r="3" fill="currentColor"/>'), list: I('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>'),
  box: I('<rect x="4" y="5" width="16" height="14" rx="4"/>'), design: I('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
  code: I('<path d="M4 6h7v4H4zM4 14h11v4H4z"/><path d="M11 8h2M15 16h2"/>'), play: I('<path d="M7 4l13 8-13 8z" fill="currentColor"/>'), stop: I('<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>'),
  undo: I('<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>'), redo: I('<path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>'),
  check: I('<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>'), phone: I('<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>'),
  sparkle: I('<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>'), plus: I('<path d="M12 5v14M5 12h14"/>'), trash: I('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  copy: I('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'), up: I('<path d="M12 19V5M6 11l6-6 6 6"/>'), down: I('<path d="M12 5v14M6 13l6 6 6-6"/>'),
  x: I('<path d="M6 6l12 12M18 6L6 18"/>'), screen: I('<rect x="6" y="3" width="12" height="18" rx="2"/>'), upload: I('<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>'), link: I('<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>')
};
const esc = M.esc;
const TEMPLATE = `
<div class="al">
  <div class="al-bar">
    <input class="al-title" id="alTitle" maxlength="40" aria-label="App name" spellcheck="false">
    <div class="al-tabs" role="tablist" aria-label="View">
      <button class="al-tab" role="tab" data-tab="design" aria-selected="true">${ICON.design} Design</button>
      <button class="al-tab" role="tab" data-tab="code" aria-selected="false">${ICON.code} Code</button>
    </div>
    <button class="al-btn run" id="alRun" title="Try your app" data-pv-go="phone">${ICON.play}<span>Run</span></button>
    <span class="al-sp"></span>
    <button class="al-btn icon" id="alUndo" title="Undo (Ctrl+Z)" aria-label="Undo">${ICON.undo}</button>
    <button class="al-btn icon" id="alRedo" title="Redo (Ctrl+Y)" aria-label="Redo">${ICON.redo}</button>
    <button class="al-btn" id="alCheck" title="Look for things to fix" aria-label="Check my app">${ICON.check}<span class="lbl">Check my app</span></button>
    <button class="al-btn" id="alStarters" title="Start again from a ready-made app" aria-label="Starter apps">${ICON.sparkle}<span class="lbl">Starter apps</span></button>
    <button class="al-btn gold" id="alPhone" title="Make a link that opens your app on a phone" aria-label="Put it on my phone">${ICON.phone}<span class="lbl">Put it on my phone</span></button>
  </div>
  <div class="al-goals" id="alGoals" hidden></div>
  <div class="al-main">
    <aside class="al-left" id="alLeft"></aside>
    <section class="al-centre">
      <div class="al-stage" id="alStage"><div class="al-phone" id="alPhoneFrame"><div class="al-notch"></div><div class="al-host" id="alHost"></div></div><div class="al-stagehint" id="alHint"></div></div>
      <div class="al-blocks" id="alBlocks" hidden></div>
    </section>
    <aside class="al-right" id="alRight"></aside>
  </div>
</div>`;

export function mount(root, host) {
  host = host || {};
  if (!document.querySelector('link[data-app-css]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = CSS_URL; l.setAttribute('data-app-css', ''); document.head.appendChild(l); }
  R.ensureCSS();
  root.innerHTML = TEMPLATE;
  const $ = id => root.querySelector('#' + id), al = root.querySelector('.al');
  const toast = m => { if (host.toast) host.toast(m); else { const t = document.createElement('div'); t.className = 'al-toast'; t.textContent = m; al.appendChild(t); setTimeout(() => t.remove(), 2200); } };
  const confirm = async m => host.confirm ? !!(await host.confirm(m)) : window.confirm(m);
  const Blockly = window.Blockly;
  const touch = () => document.body.classList.contains('is-touch'), pvOn = () => document.body.classList.contains('pv-on');

  let proj, screen, sel = null, tab = 'design', ws = null, runner = null, destroyed = false, quiet = false, wsQuiet = false;
  let undo = [], redo = [], lastSnap = '', goalsWereDone = false;
  const pool = {};
  // a test run remembers only while the lab is open, so the classroom computer doesn't keep one pupil's values for the next
  const memStore = { m: {}, getItem(k) { return k in this.m ? this.m[k] : null; }, setItem(k, v) { this.m[k] = String(v); } };
  BL.defineBlocks(Blockly, () => proj);

  function load(p, fresh) {
    stopRun();
    proj = M.cleanProject(p || M.newProject('blank'));
    screen = proj.app.order[0]; sel = null; undo = []; redo = []; lastSnap = snap(); goalsWereDone = false;
    if (ws) loadBlocks();
    clearTimeout(chooseT); if (fresh) chooseT = setTimeout(() => starters(true), 50);
  }
  let chooseT = 0;
  // the design (not the code: Blockly has its own undo) as one string
  const snap = () => JSON.stringify(Object.assign({}, proj, { code: undefined }));
  let changeT = 0;
  function changed(now) {
    clearTimeout(changeT);
    const go = () => { const s = snap(); if (s === lastSnap) return; undo.push(lastSnap); if (undo.length > 80) undo.shift(); redo = []; lastSnap = s; bar(); if (!quiet && host.onChange) host.onChange(); goals(); };
    if (now) go(); else changeT = setTimeout(go, 400);
  }
  function restore(s) { const code = proj.code; proj = M.cleanProject(Object.assign(JSON.parse(s), { code })); lastSnap = s; if (!proj.app.order.includes(screen)) screen = proj.app.order[0]; if (sel && !M.findPart(proj, sel)) sel = null; render(); if (host.onChange) host.onChange(); goals(); refreshFields(); }
  function doUndo() { if (tab === 'code' && ws) { ws.undo(false); return; } changed(true); if (!undo.length) return; redo.push(lastSnap); restore(undo.pop()); }
  function doRedo() { if (tab === 'code' && ws) { ws.undo(true); return; } if (!redo.length) return; undo.push(lastSnap); restore(redo.pop()); }

  const scr = () => proj['s' + screen];
  const selPart = () => { const f = sel && M.findPart(proj, sel); return f && f.screen === screen ? f.part : null; };

  // ── bar ──
  function bar() {
    $('alUndo').disabled = tab === 'design' && !undo.length; $('alRedo').disabled = tab === 'design' && !redo.length;
    if (document.activeElement !== $('alTitle')) $('alTitle').value = proj.app.title;
    root.querySelectorAll('.al-tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    const r = runner && runner.running(); $('alRun').innerHTML = r ? `${ICON.stop}<span>Stop</span>` : `${ICON.play}<span>Run</span>`; $('alRun').classList.toggle('on', !!r);
    al.classList.toggle('code', tab === 'code'); al.classList.toggle('running', !!r);
    const hint = root.querySelector('.al-right .al-hint.center'); if (hint) hint.innerHTML = r ? 'Your app is running: tap it to try it. Press <b>Stop</b> to change it.' : 'Press <b>Run</b> to try your blocks.';
  }

  // ── left: parts to add, screens ──
  function left() {
    const L = $('alLeft');
    if (tab === 'code') { L.innerHTML = ''; return; }
    L.innerHTML = `<div class="al-side"><h3>Add a part</h3><p class="al-hint">${pvOn() ? 'Tap a part to add it to the phone.' : touch() ? 'Tap a part to add it, or slide it sideways onto the phone.' : 'Drag a part onto the phone, or tap it to add it.'}</p>
      <div class="al-tiles">${M.PART_KEYS.map(t => `<button class="al-tile" data-add="${t}"${pvOn() ? ' data-pv-go="phone"' : ''} title="${esc(M.PARTS[t][0])}">${ICON[M.PARTS[t][1]]}<span>${esc(M.PARTS[t][0])}</span></button>`).join('')}</div>
      <h3>Screens</h3><ul class="al-screens">${proj.app.order.map((id, i) => `<li><button class="al-scr${id === screen ? ' on' : ''}" data-scr="${id}" data-pv-go="phone">${ICON.screen}<span>${esc(proj['s' + id].name)}</span><small>${i === 0 ? 'START' : proj['s' + id].parts.length + ' parts'}</small></button></li>`).join('')}</ul>
      <button class="al-btn wide" id="alAddScreen"${proj.app.order.length >= M.LIMITS.screens ? ' disabled' : ''}>${ICON.plus} Add a screen</button>
      <p class="al-hint">Your app starts on the first screen. Use a <b>go to</b> block to move between screens.</p></div>`;
    L.querySelectorAll('[data-add]').forEach(b => tileDrag(b, b.dataset.add));
    L.querySelectorAll('[data-scr]').forEach(b => b.onclick = () => { screen = b.dataset.scr; sel = null; stopRun(); render(); });
    L.querySelector('#alAddScreen').onclick = () => { const id = M.addScreen(proj, 'Screen ' + (proj.app.order.length + 1)); if (!id) return; screen = id; sel = null; changed(true); render(); refreshFields(); toast('A new screen. Add parts to it, then use a “go to” block to show it.'); };
  }

  // ── the phone ──
  let scale = 1;
  function fitPhone() {
    const stage = tab === 'code' ? $('alRight') : $('alStage'), fr = $('alPhoneFrame');
    // the room the phone has: its box minus padding and whatever else is in it (the hint under it, or the heading and hint on the right)
    let other = 0; for (const c of stage.children) if (!c.contains(fr) && c.offsetParent !== null) { const cs = getComputedStyle(c); other += c.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom); }
    const cs = getComputedStyle(stage), pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + (parseFloat(cs.rowGap) || 0) * Math.max(0, stage.children.length - 1);
    const availH = Math.max(160, stage.clientHeight - pad - other - 4), availW = Math.max(140, stage.clientWidth - 32);
    scale = Math.max(0.2, Math.min(1.2, availH / (M.PHONE.h + 24), availW / (M.PHONE.w + 24)));
    fr.style.width = (M.PHONE.w + 24) * scale + 'px'; fr.style.height = (M.PHONE.h + 24) * scale + 'px';
    const h = $('alHost'); h.style.transform = `scale(${scale})`; h.style.left = 12 * scale + 'px'; h.style.top = 12 * scale + 'px';
    placeSel();
  }
  function phone() {
    // the phone lives in the centre (Design) or on the right (Code)
    const fr = $('alPhoneFrame'), want = tab === 'code' ? $('alPhoneSlot') : $('alStage');
    if (want && fr.parentNode !== want) want.prepend(fr);
    if (runner && runner.running()) { fitPhone(); return; }
    const s = R.drawScreen($('alHost'), proj, screen, { edit: true });
    s.classList.toggle('al-designing', tab === 'design');
    if (tab === 'design') { const box = document.createElement('div'); box.className = 'al-sel'; box.id = 'alSel'; box.innerHTML = '<i data-h="nw"></i><i data-h="ne"></i><i data-h="sw"></i><i data-h="se"></i><i data-h="e"></i><i data-h="s"></i>'; s.appendChild(box); }
    $('alHint').innerHTML = tab === 'design' ? (scr().parts.length ? (touch() ? 'Slide parts to move them. Pull the round handles to resize. Tap the background to change the screen.' : 'Drag parts to move them. Drag the corners to resize. Tap the background to change the screen.') : (touch() ? 'This screen is empty. Tap a part in ' + (pvOn() ? 'Parts' : 'the list') + ' to add it.' : 'This screen is empty. Drag a part onto it from the left.')) : '';
    fitPhone();
  }
  function placeSel() {
    const box = $('alSel'), p = selPart(); if (!box) return;
    if (!p || tab !== 'design') { box.style.display = 'none'; return; }
    Object.assign(box.style, { display: 'block', left: p.x + 'px', top: p.y + 'px', width: p.w + 'px', height: p.h + 'px' });
    box.dataset.name = p.name;
  }
  // logical phone coordinates of a pointer event
  const toPhone = e => { const r = $('alHost').getBoundingClientRect(); return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale, inside: e.clientX >= r.left && e.clientX <= r.left + M.PHONE.w * scale && e.clientY >= r.top && e.clientY <= r.top + M.PHONE.h * scale }; };
  const hit = pt => { const ps = scr().parts; for (let i = ps.length - 1; i >= 0; i--) { const q = ps[i]; if (pt.x >= q.x && pt.x <= q.x + q.w && pt.y >= q.y && pt.y <= q.y + q.h) return q; } return null; };
  const snap4 = v => Math.round(v / 4) * 4;
  let drag = null;
  $('alHost').addEventListener('pointerdown', e => {
    if (tab !== 'design' || (runner && runner.running()) || e.button !== 0) return;
    const pt = toPhone(e), h = e.target.dataset && e.target.dataset.h;
    const p = h ? selPart() : hit(pt);
    if (!p) { if (sel) { sel = null; render(); } else right(); return; }
    e.preventDefault();
    if (p.id !== sel) { sel = p.id; render(); }
    drag = { p, h, x0: pt.x, y0: pt.y, o: { x: p.x, y: p.y, w: p.w, h: p.h }, moved: false };
    $('alHost').setPointerCapture(e.pointerId);
  });
  $('alHost').addEventListener('pointermove', e => {
    if (!drag) return;
    const pt = toPhone(e), dx = pt.x - drag.x0, dy = pt.y - drag.y0, o = drag.o, p = drag.p, h = drag.h;
    if (!drag.moved && Math.hypot(dx, dy) < 3) return; drag.moved = true;
    if (!h) { p.x = snap4(o.x + dx); p.y = snap4(o.y + dy); }
    else {
      if (h.includes('e')) p.w = Math.max(16, snap4(o.w + dx)); if (h.includes('s')) p.h = Math.max(16, snap4(o.h + dy));
      if (h.includes('w')) { const w = Math.max(16, snap4(o.w - dx)); p.x = o.x + o.w - w; p.w = w; }
      if (h === 'nw' || h === 'ne') { const hh = Math.max(16, snap4(o.h - dy)); p.y = o.y + o.h - hh; p.h = hh; }
    }
    const el = $('alHost').querySelector(`[data-pid="${p.id}"]`); if (el) Object.assign(el.style, { left: p.x + 'px', top: p.y + 'px', width: p.w + 'px', height: p.h + 'px' });
    placeSel(); status(`x ${p.x} · y ${p.y} · ${p.w} × ${p.h}`);
  });
  const endDrag = () => { if (!drag) return; const d = drag; drag = null; status(''); if (d.moved) { const c = M.cleanPart(d.p, { p: proj, imgs: proj.imgs, seen: new Set(), names: new Set() }); Object.assign(d.p, { x: c.x, y: c.y, w: c.w, h: c.h }); changed(true); phone(); right(); } };
  $('alHost').addEventListener('pointerup', endDrag); $('alHost').addEventListener('pointercancel', endDrag);
  function status(m) { const h = $('alHint'); if (h && m) h.textContent = m; }

  // a palette tile: tap to add, or drag onto the phone. The palette must still scroll by touch (touch-action: pan-y), so on a
  // touch screen a drag starts after a sideways slide, or after pressing and holding; an up/down swipe scrolls the list.
  function tileDrag(btn, t) {
    let d = null;
    const ghost = (e) => { d.ghost = document.createElement('div'); d.ghost.className = 'al-ghost'; d.ghost.innerHTML = ICON[M.PARTS[t][1]] + esc(M.PARTS[t][0]); document.body.appendChild(d.ghost); d.ghost.style.left = e.clientX + 'px'; d.ghost.style.top = e.clientY + 'px'; };
    btn.addEventListener('pointerdown', e => {
      if (e.button !== 0) return; d = { x: e.clientX, y: e.clientY, ghost: null, touch: e.pointerType !== 'mouse' };
      try { btn.setPointerCapture(e.pointerId); } catch (err) { /* gone */ }
      if (d.touch) { const me = d, ev = { clientX: e.clientX, clientY: e.clientY }; me.hold = setTimeout(() => { if (d === me && !me.ghost && !pvOn()) { ghost(ev); btn.classList.add('al-held'); } }, 380); }
    });
    btn.addEventListener('pointermove', e => {
      if (!d) return;
      const dx = Math.abs(e.clientX - d.x), dy = Math.abs(e.clientY - d.y);
      if (!d.ghost) {
        if (d.touch && dy > 8 && dy >= dx) { clearTimeout(d.hold); return; } // a swipe up or down: the list scrolls
        if (dx > 8 || (!d.touch && Math.hypot(dx, dy) > 6)) { clearTimeout(d.hold); if (!pvOn()) ghost(e); }
      }
      if (d.ghost) { d.ghost.style.left = e.clientX + 'px'; d.ghost.style.top = e.clientY + 'px'; }
    });
    // once a drag has started, the finger moves the part, not the list
    btn.addEventListener('touchmove', e => { if (d && d.ghost && e.cancelable) e.preventDefault(); }, { passive: false });
    const end = e => {
      if (!d) return; const was = d; d = null; clearTimeout(was.hold); btn.classList.remove('al-held');
      const moved = Math.hypot(e.clientX - was.x, e.clientY - was.y) > 10;
      if (was.ghost) { was.ghost.remove(); const pt = toPhone(e); if (pt.inside) addPart(t, pt); else if (!moved && e.type === 'pointerup') addPart(t); }
      else if (e.type === 'pointerup' && !moved) addPart(t);
    };
    btn.addEventListener('pointerup', end); btn.addEventListener('pointercancel', end);
    btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addPart(t); } });
  }
  function addPart(t, pt) {
    stopRun();
    if (scr().parts.length >= M.LIMITS.parts) { toast('This screen is full. Add another screen.'); return; }
    const x = M.partOf(proj, t);
    if (pt) { x.x = Math.max(0, Math.min(M.PHONE.w - x.w, snap4(pt.x - x.w / 2))); x.y = Math.max(0, Math.min(M.PHONE.h - x.h, snap4(pt.y - x.h / 2))); }
    else { const s = scr(), bottom = s.parts.reduce((m, q) => Math.max(m, q.y + q.h), s.title ? M.PHONE.bar : 0); x.y = Math.min(M.PHONE.h - x.h - 8, snap4(bottom + 16)); }
    const c = M.cleanPart(x, { p: proj, imgs: proj.imgs, seen: new Set(), names: new Set() }); Object.assign(x, { x: c.x, y: c.y });
    scr().parts.push(x); sel = x.id; changed(true); render(); refreshFields();
  }
  function delPart() { const f = sel && M.findPart(proj, sel); if (!f) return; proj['s' + f.screen].parts.splice(f.i, 1); sel = null; changed(true); render(); refreshFields(); }
  function dupPart() { const p = selPart(); if (!p) return; const c = JSON.parse(JSON.stringify(p)); c.id = M.newId(); c.name = M.partName(proj, c.t); c.x += 16; c.y += 16; scr().parts.push(c); sel = c.id; changed(true); render(); refreshFields(); }
  function order(d) { const f = sel && M.findPart(proj, sel); if (!f) return; const list = proj['s' + f.screen].parts, j = f.i + d; if (j < 0 || j >= list.length) return; [list[f.i], list[j]] = [list[j], list[f.i]]; changed(true); phone(); }

  // ── right: the inspector (Design) / the phone (Code) ──
  function right() {
    const Rt = $('alRight'), fr = $('alPhoneFrame');
    if (fr && tab !== 'code' && Rt.contains(fr)) $('alStage').prepend(fr); // the phone was on the right for Code: put it back before the inspector replaces it
    if (tab === 'code') { if (!$('alPhoneSlot')) Rt.innerHTML = `<h3 class="al-phone-h">Your app</h3><div id="alPhoneSlot" class="al-slot"></div><p class="al-hint center"></p>`; bar(); return; }
    const p = selPart(), s = scr();
    const field = (label, html) => `<label class="al-field">${label}${html}</label>`;
    const colour = (k, label, v) => `<label class="al-colour"><input type="color" data-col="${k}" value="${v.length === 4 ? '#' + v.slice(1).split('').map(x => x + x).join('') : v}"><span>${label}</span></label>`;
    if (!p) {
      Rt.innerHTML = `<div class="al-insp-h">${ICON.screen} ${esc(s.name)}</div><p class="al-hint">Tap a part on the phone to change it.</p>
        ${field('Screen name', `<input data-scr-in="name" maxlength="30" value="${esc(s.name)}">`)}
        ${field('Title at the top (leave empty for none)', `<input data-scr-in="title" maxlength="60" value="${esc(s.title)}">`)}
        ${colour('bar', 'Title bar', s.bar)}${colour('bg', 'Background', s.bg)}
        <h3>This screen</h3><div class="al-acts">${proj.app.order[0] !== screen ? `<button class="al-btn" data-act="first">Start here</button>` : ''}<button class="al-btn danger" data-act="delscr"${proj.app.order.length < 2 ? ' disabled' : ''}>${ICON.trash} Delete screen</button></div>`;
      Rt.querySelectorAll('[data-scr-in]').forEach(x => x.oninput = () => { s[x.dataset.scrIn] = x.value; phone(); if (x.dataset.scrIn === 'name') { left(); refreshFields(); } changed(); });
      Rt.querySelectorAll('[data-col]').forEach(x => { x.oninput = () => { s[x.dataset.col] = x.value; phone(); changed(); }; });
      Rt.querySelectorAll('[data-act]').forEach(x => x.onclick = async () => {
        if (x.dataset.act === 'first') { proj.app.order = [screen].concat(proj.app.order.filter(i => i !== screen)); changed(true); render(); }
        if (x.dataset.act === 'delscr' && await confirm(`Delete ${s.name} and everything on it?`)) { M.removeScreen(proj, screen); screen = proj.app.order[0]; changed(true); render(); refreshFields(); }
      });
      return;
    }
    const B = M.PARTS[p.t];
    let h = `<div class="al-insp-h">${ICON[B[1]]} <span>${esc(p.name)}</span><small>${esc(B[0])}</small></div>
      ${field('Name (used in your blocks)', `<input data-name maxlength="24" value="${esc(p.name)}">`)}`;
    if ('text' in p && p.t !== 'textbox') h += field(p.t === 'switch' ? 'Words next to it' : 'Words', p.t === 'label' ? `<textarea data-in="text" maxlength="300">${esc(p.text)}</textarea>` : `<input data-in="text" maxlength="300" value="${esc(p.text)}">`);
    if (p.t === 'textbox') h += field('Hint (shown before anyone types)', `<input data-in="hint" maxlength="80" value="${esc(p.hint)}">`);
    if ('size' in p) h += field('Size of words: ' + p.size, `<input type="range" min="10" max="80" data-num="size" value="${p.size}">`);
    if (p.t === 'label') h += `<div class="al-seg" role="group">${[['left', 'Left'], ['center', 'Middle'], ['right', 'Right']].map(([v, n]) => `<button data-set="align" data-v="${v}" aria-pressed="${p.align === v}">${n}</button>`).join('')}</div><label class="al-colour"><input type="checkbox" data-bool="bold"${p.bold ? ' checked' : ''}><span>Bold</span></label>`;
    if ('color' in p) h += colour('color', p.t === 'slider' ? 'Colour' : 'Words colour', p.color);
    if ('bg' in p) h += colour('bg', p.t === 'switch' ? 'Colour when on' : 'Background', p.bg);
    if (p.t === 'box') h += field('Round corners: ' + p.round, `<input type="range" min="0" max="100" data-num="round" value="${p.round}">`);
    if (p.t === 'image') h += `<h3>Picture</h3><div class="al-pics">${Object.entries(proj.imgs).map(([k, d]) => `<button class="al-pic" data-pic="img:${k}" aria-pressed="${p.src === 'img:' + k}" title="Your picture"><img src="${d}" alt=""></button>`).join('')}${M.PICTURE_KEYS.map(k => `<button class="al-pic" data-pic="lib:${k}" aria-pressed="${p.src === 'lib:' + k}" title="${esc(M.PICTURES[k][0])}"><img src="${M.pictureURL(k)}" alt="${esc(M.PICTURES[k][0])}"></button>`).join('')}</div>
      <div class="al-acts"><button class="al-btn" data-act="upload">${ICON.upload} Use my own picture</button></div><p class="al-hint">Only use pictures you made or are allowed to use, and never photos of people.</p>
      ${field('Description (alt text)', `<input data-in="alt" maxlength="200" value="${esc(p.alt)}" placeholder="Say what the picture shows">`)}`;
    if (p.t === 'slider') h += `<div class="al-pos">${['min', 'max', 'value'].map(k => field({ min: 'Lowest', max: 'Highest', value: 'Starts at' }[k], `<input type="number" data-numin="${k}" value="${p[k]}">`)).join('')}</div>`;
    if (p.t === 'switch') h += `<label class="al-colour"><input type="checkbox" data-bool="on"${p.on ? ' checked' : ''}><span>Starts on</span></label>`;
    if (p.t === 'list') h += field('Lines (one on each line)', `<textarea data-items>${esc(p.items.join('\n'))}</textarea>`);
    h += `<label class="al-colour"><input type="checkbox" data-bool="hidden"${p.hidden ? ' checked' : ''}><span>Hidden when the app starts</span></label>
      <h3>Place</h3><div class="al-pos">${[['x', 'Across'], ['y', 'Down'], ['w', 'Width'], ['h', 'Height']].map(([k, n]) => field(n, `<input type="number" data-numin="${k}" value="${p[k]}">`)).join('')}</div>
      <div class="al-acts"><button class="al-btn" data-act="centre">Centre it</button><button class="al-btn icon" data-act="fwd" title="Bring forward">${ICON.up}</button><button class="al-btn icon" data-act="back" title="Send back">${ICON.down}</button></div>
      <h3>Part</h3><div class="al-acts"><button class="al-btn" data-act="dup" title="Copy (Ctrl+D)">${ICON.copy} Copy</button><button class="al-btn danger" data-act="del" title="Delete">${ICON.trash} Delete</button></div>
      <button class="al-btn gold wide" data-act="code" data-pv-go="code">${ICON.code} ${['textbox', 'slider', 'switch'].includes(p.t) ? 'Code: when it changes' : 'Code: when it’s pressed'}</button>`;
    Rt.innerHTML = h;
    const redraw = () => { phone(); };
    Rt.querySelector('[data-name]').onchange = e => { const v = e.target.value.replace(/[^\w]/g, '').slice(0, 24); const taken = M.allParts(proj).some(q => q.id !== p.id && q.name.toLowerCase() === v.toLowerCase()); if (!v || taken) { toast(taken ? 'Another part already has that name.' : 'Use letters and numbers only.'); e.target.value = p.name; return; } p.name = v; changed(true); right(); refreshFields(); };
    Rt.querySelectorAll('[data-in]').forEach(x => x.oninput = () => { p[x.dataset.in] = x.value; redraw(); changed(); });
    Rt.querySelectorAll('[data-num]').forEach(x => { x.oninput = () => { p[x.dataset.num] = +x.value; const l = x.closest('label'); if (l) l.firstChild.textContent = l.firstChild.textContent.replace(/\d+$/, x.value); redraw(); changed(); }; });
    Rt.querySelectorAll('[data-numin]').forEach(x => x.onchange = () => { const v = Number(x.value); if (!Number.isFinite(v)) { right(); return; } p[x.dataset.numin] = v; const c = M.cleanPart(p, { p: proj, imgs: proj.imgs, seen: new Set(), names: new Set() }); for (const k of ['x', 'y', 'w', 'h', 'min', 'max', 'value']) if (k in c) p[k] = c[k]; changed(true); redraw(); right(); });
    Rt.querySelectorAll('[data-set]').forEach(x => x.onclick = () => { p[x.dataset.set] = x.dataset.v; changed(true); redraw(); right(); });
    Rt.querySelectorAll('[data-bool]').forEach(x => x.onchange = () => { if (x.checked) p[x.dataset.bool] = true; else if (x.dataset.bool === 'hidden') delete p.hidden; else p[x.dataset.bool] = false; changed(true); redraw(); });
    Rt.querySelectorAll('[data-col]').forEach(x => { x.oninput = () => { p[x.dataset.col] = x.value; redraw(); changed(); }; });
    Rt.querySelectorAll('[data-pic]').forEach(x => x.onclick = () => { p.src = x.dataset.pic; if (p.src.startsWith('lib:') && (!p.alt || M.PICTURE_KEYS.some(k => p.alt === M.PICTURES[k][0]))) p.alt = M.PICTURES[p.src.slice(4)][0]; changed(true); redraw(); right(); });
    const items = Rt.querySelector('[data-items]'); if (items) items.oninput = () => { p.items = items.value.split('\n').slice(0, M.LIMITS.items).map(s => s.slice(0, 120)); redraw(); changed(); };
    Rt.querySelectorAll('[data-act]').forEach(x => x.onclick = () => {
      const a = x.dataset.act;
      if (a === 'del') delPart(); else if (a === 'dup') dupPart(); else if (a === 'fwd') order(1); else if (a === 'back') order(-1);
      else if (a === 'centre') { p.x = Math.round((M.PHONE.w - p.w) / 2); changed(true); redraw(); right(); }
      else if (a === 'upload') upload(url => { p.src = url; p.alt = ''; changed(true); redraw(); right(); });
      else if (a === 'code') codeFor(p);
    });
  }
  // a picture from the pupil's device: made smaller and kept inside the project
  function upload(done) {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      if (Object.keys(proj.imgs).length >= M.LIMITS.imgs) { toast('This app has lots of your own pictures already. Delete one first.'); return; }
      const img = new Image(), url = URL.createObjectURL(f);
      img.onload = () => { const k = Math.min(1, 600 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        let q = 0.85, d = c.toDataURL('image/jpeg', q); while (d.length > M.LIMITS.img && q > 0.3) { q -= 0.15; d = c.toDataURL('image/jpeg', q); }
        if (d.length > M.LIMITS.img) { toast('That picture is too big.'); return; }
        const id = M.newId(); proj.imgs[id] = d; done('img:' + id); };
      img.onerror = () => { URL.revokeObjectURL(url); toast('That file isn’t a picture CodeJump can use.'); };
      img.src = url;
    };
    inp.click();
  }

  // ── Code: Blockly ──
  function ensureWs() {
    if (ws || !Blockly) return;
    const touchy = touch() || (window.matchMedia && matchMedia('(pointer: coarse)').matches);
    ws = Blockly.inject($('alBlocks'), {
      toolbox: BL.toolbox(), renderer: 'zelos', theme: BL.appTheme(Blockly), scrollbars: true, trashcan: true, media: window.CJ_BLOCKLY_MEDIA || 'https://unpkg.com/blockly@10.4.3/media/',
      zoom: { controls: true, wheel: true, startScale: touchy ? 0.85 : $('alBlocks').clientWidth < 760 ? 0.58 : 0.72, maxScale: 2.5, minScale: 0.35, scaleSpeed: 1.1 }, // finger-sized blocks on touch screens; small laptop windows start further out so both columns show
      grid: { spacing: 24, length: 3, colour: 'rgba(255,255,255,0.08)', snap: true }
    });
    try { ws.connectionChecker.doTypeChecks = () => true; } catch (e) { /* older Blockly */ }
    ws.registerToolboxCategoryCallback('APP_VARS', w => BL.varsFlyout(Blockly, w));
    ws.addChangeListener(e => {
      if (wsQuiet || e.isUiEvent) return;
      clearTimeout(codeT); codeT = setTimeout(saveCode, 300);
    });
    loadBlocks();
  }
  let codeT = 0;
  function saveCode() { if (!ws) return; const b = Blockly.serialization.workspaces.save(ws); if (JSON.stringify(b) === JSON.stringify(proj.code.blocks)) return; proj.code = { blocks: b }; if (!quiet && host.onChange) host.onChange(); goals(); }
  function loadBlocks() {
    if (!ws) return; wsQuiet = true;
    try { ws.clear(); if (proj.code.blocks) Blockly.serialization.workspaces.load(proj.code.blocks, ws); tidy(); } catch (e) { ws.clear(); } finally { wsQuiet = false; }
    try { ws.clearUndo(); } catch (e) { /* ok */ }
  }
  // scripts that overlap (a starter app, or code from a lesson) are laid out in columns; a pupil's own tidy layout is kept
  function tidy() {
    const tops = ws.getTopBlocks(true), boxes = tops.map(b => b.getBoundingRectangle());
    const clash = boxes.some((r, i) => boxes.some((q, j) => j > i && r.left < q.right && q.left < r.right && r.top < q.bottom && q.top < r.bottom));
    if (!clash) return;
    const cols = [{ x: 24, y: 24, w: 0 }, { x: 0, y: 24, w: 0 }];
    tops.forEach((b, i) => { const c = cols[i % 2 && tops.length > 2 ? 1 : 0]; c.w = Math.max(c.w, boxes[i].right - boxes[i].left); });
    cols[1].x = cols[0].x + cols[0].w + 48;
    tops.forEach((b, i) => { const c = cols[i % 2 && tops.length > 2 ? 1 : 0], r = b.getBoundingRectangle(); b.moveTo(new Blockly.utils.Coordinate(c.x, c.y)); c.y += (r.bottom - r.top) + 40; });
  }
  function refreshFields() { if (!ws) return; for (const b of ws.getAllBlocks(false)) for (const inp of b.inputList) for (const f of inp.fieldRow) if (f.partKind && f.forceRerender) f.forceRerender(); }
  // the part's "when … is pressed / changed" script: found, or made, then shown
  function codeFor(p) {
    tab = 'code'; render(); if (!ws) return;
    const type = ['textbox', 'slider', 'switch'].includes(p.t) ? 'app_when_changed' : 'app_when_pressed';
    let hat = ws.getTopBlocks(false).find(b => b.type === type && b.getFieldValue('PART') === p.id);
    if (!hat) { hat = ws.newBlock(type); hat.setFieldValue(p.id, 'PART'); hat.initSvg(); hat.render(); const m = ws.getBlocksBoundingBox(); hat.moveBy(40, (m && isFinite(m.bottom) && ws.getTopBlocks(false).length > 1 ? m.bottom : 0) + 40); saveCode(); }
    hat.select(); ws.centerOnBlock(hat.id);
  }

  // ── Run ──
  function startRun() {
    if (tab === 'code') saveCode();
    R.unlockAudio();
    const snapP = M.cleanProject(JSON.parse(JSON.stringify(proj)));
    runner = R.createRunner($('alHost'), snapP, { onScript: id => { if (ws && tab === 'code' && id) { try { ws.highlightBlock(id); setTimeout(() => { try { ws.highlightBlock(null); } catch (e) { /* gone */ } }, 500); } catch (e) { /* no block */ } } },
      onScreen: id => { if (tab === 'design' && id !== screen) { screen = id; left(); } }, store: memStore });
    runner.start(); bar(); panes(); fitPhone();
    $('alHint').textContent = 'Your app is running. Tap it to try it. Press Stop to change it.';
  }
  function stopRun() { if (!runner) return; runner.stop(); runner = null; if (proj) { bar(); panes(); phone(); } }
  $('alRun').onclick = () => { if (runner && runner.running()) stopRun(); else startRun(); };

  // ── pop-ups ──
  function pop(inner, bind) {
    closePop(); const p = document.createElement('div'); p.className = 'al-pop'; p.innerHTML = `<div class="al-pop-box" role="dialog" aria-modal="true">${inner}</div>`; al.appendChild(p);
    p.addEventListener('click', e => { if (e.target === p || e.target.closest('[data-close]')) closePop(); }); if (bind) bind(p); const f = p.querySelector('button, input'); if (f) f.focus(); return p;
  }
  function closePop() { const p = al.querySelector('.al-pop'); if (p) p.remove(); }
  function starters(first) {
    pop(`<div class="al-pop-h"><h2>What app shall we make?</h2>${first ? '' : `<button class="al-btn icon" data-close aria-label="Close">${ICON.x}</button>`}</div>
      <p class="al-hint">${first ? 'Start from one of these and change it, or start with an empty app.' : 'Starting again replaces the app you have open. Save it first if you want to keep it.'}</p>
      <div class="al-starters">${M.STARTER_KEYS.map(k => { const S = M.STARTERS[k]; return `<button class="al-starter" data-starter="${k}"><img src="${M.pictureURL(S[2])}" alt=""><b>${esc(S[0])}</b><span>${esc(S[1])}</span></button>`; }).join('')}</div>`,
    p => p.querySelectorAll('[data-starter]').forEach(b => b.onclick = async () => {
      if (!first && !(await confirm('Start a new app? The one you have open will be replaced.'))) return;
      const keepGoals = proj.goals; load(M.newProject(b.dataset.starter)); if (keepGoals) proj.goals = keepGoals; closePop(); render(); changed(true); if (host.onChange) host.onChange();
      toast(b.dataset.starter === 'blank' ? touch() ? 'An empty app. Tap a part to put it on the phone!' : 'An empty app. Drag parts onto the phone!' : 'Press Run to try it, then open Code to see how it works.');
    }));
  }
  function check() {
    const list = M.checkApp(proj);
    pop(`<div class="al-pop-h"><h2>Check my app</h2><button class="al-btn icon" data-close aria-label="Close">${ICON.x}</button></div>
      ${list.length ? `<ul class="al-checks">${list.map((x, i) => `<li class="${x.level}"><span>${esc(x.text)}</span>${x.part || x.screen ? `<button class="al-btn" data-show="${i}">Show me</button>` : ''}</li>`).join('')}</ul>` : '<p>Nothing to fix. Your app looks great!</p>'}`,
    p => p.querySelectorAll('[data-show]').forEach(b => b.onclick = () => { const x = list[+b.dataset.show]; if (x.screen) screen = x.screen; sel = x.part || null; tab = 'design'; closePop(); render(); }));
  }
  async function toPhoneDialog() {
    stopRun(); if (tab === 'code') saveCode();
    const box = pop(`<div class="al-pop-h"><h2>Put it on my phone</h2><button class="al-btn icon" data-close aria-label="Close">${ICON.x}</button></div><div id="alShare"><p>Making a link for your app…</p></div>`);
    let url = null;
    try { url = host.shareApp ? await host.shareApp(getProject()) : null; } catch (e) { url = null; }
    const S = box.querySelector('#alShare'); if (!S) return;
    if (!url) { S.innerHTML = '<p>CodeJump couldn’t make a link just now. Check you’re online, then try again.</p>'; return; }
    S.innerHTML = `<div class="al-share"><div class="al-qr" id="alQR" aria-label="A QR code for the link"></div><div>
      <ol class="al-steps"><li>On the phone, <b>scan the code</b> with the camera, or type the link.</li><li>The app opens full screen. Try it!</li>
      <li>Keep it: on an iPhone or iPad press <b>Share</b> then <b>Add to Home Screen</b>; on Android open the <b>⋮</b> menu and choose <b>Add to Home screen</b> (or <b>Install app</b>).</li></ol>
      <div class="al-link"><input id="alLink" readonly value="${esc(url)}"><button class="al-btn" id="alCopy">${ICON.copy} Copy</button></div>
      <p class="al-hint">Anyone with the link can open your app, so only share it with people you know. Ask your teacher or a grown-up first. The link shows the app as it is now: make it again after changes.</p></div></div>`;
    S.querySelector('#alCopy').onclick = () => { try { navigator.clipboard.writeText(url).then(() => toast('Link copied!')); } catch (e) { S.querySelector('#alLink').select(); } };
    drawQR(S.querySelector('#alQR'), url);
  }
  async function drawQR(el, text) {
    try {
      const mod = await import(new URL('../vendor/qrcode-generator.js', import.meta.url).href); const qr = mod.default(0, 'M'); qr.addData(text); qr.make();
      const n = qr.getModuleCount(), c = document.createElement('canvas'), k = Math.floor(200 / (n + 8)); c.width = c.height = k * (n + 8);
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#000';
      for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) if (qr.isDark(r, q)) g.fillRect((q + 4) * k, (r + 4) * k, k, k);
      el.appendChild(c);
    } catch (e) { el.textContent = text.length > 1500 ? 'This link is too long for a QR code: copy it and send it to the phone instead.' : 'Type the link on the phone.'; }
  }

  // ── goals (lessons) ──
  function goals() {
    const G = $('alGoals'); if (!proj.goals) { G.hidden = true; return; }
    const r = M.checkGoals(proj.goals, proj), n = r.filter(x => x.ok).length, done = n === r.length && r.length > 0;
    G.hidden = false; G.classList.toggle('done', done);
    G.innerHTML = `<b>${esc(proj.goals.title)}</b> <span>${n}/${r.length}</span>${r.map(x => `<span class="al-goal${x.ok ? ' ok' : ''}"><i></i>${esc(x.text)}</span>`).join('')}`;
    if (done && !goalsWereDone && host.onGoalsDone) host.onGoalsDone(); goalsWereDone = done;
  }

  // portrait tablets: one pane at a time (CodeJump's switch at the bottom; app-app.css shows the chosen one). Design: Parts /
  // Phone / Settings; Code: Code / Phone; while the app runs in Design, just the phone.
  function panes() {
    if (!window.cjPanes || !root.isConnected || !document.body.classList.contains('applab-mode')) return;
    const r = runner && runner.running();
    window.cjPanes(tab === 'code' ? [['code', 'Code', 'i-code'], ['phone', 'Phone', 'i-applab']] : r ? null : [['parts', 'Parts', 'i-plus'], ['phone', 'Phone', 'i-applab'], ['settings', 'Settings', 'i-gear']]);
  }
  function render() {
    if (destroyed) return;
    if (!proj['s' + screen]) screen = proj.app.order[0];
    if (sel && !selPart()) sel = null;
    $('alStage').hidden = tab !== 'design'; $('alBlocks').hidden = tab !== 'code';
    panes(); bar(); left(); right(); phone(); goals();
    if (tab === 'code') { ensureWs(); if (ws) setTimeout(() => { Blockly.svgResize(ws); fitPhone(); }, 0); }
  }

  // ── events ──
  root.querySelectorAll('.al-tab').forEach(b => b.onclick = () => { if (tab === 'code') saveCode(); tab = b.dataset.tab; render(); });
  $('alTitle').oninput = () => { proj.app.title = $('alTitle').value.slice(0, 40); changed(); };
  $('alTitle').onchange = () => { if (!proj.app.title.trim()) proj.app.title = 'My app'; changed(true); };
  $('alUndo').onclick = doUndo; $('alRedo').onclick = doRedo; $('alCheck').onclick = check; $('alStarters').onclick = () => starters(false); $('alPhone').onclick = toPhoneDialog;
  const editingText = () => { const a = document.activeElement; return !!(a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))); };
  function onKey(e) {
    if (destroyed || !root.isConnected || root.offsetParent === null) return;
    if (document.querySelector('[id$="-modal"]:not(.hide), #cj-dialog') && !al.querySelector('.al-pop')) return;
    if (e.key === 'Escape' && al.querySelector('.al-pop')) { closePop(); return; }
    if (tab !== 'design' || editingText() || (runner && runner.running())) return;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && !e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); doUndo(); return; }
    if (mod && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); doRedo(); return; }
    const p = selPart(); if (!p) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); delPart(); }
    else if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); dupPart(); }
    else if (/^Arrow/.test(e.key)) { e.preventDefault(); const n = e.shiftKey ? 8 : 1, d = { ArrowUp: [0, -n], ArrowDown: [0, n], ArrowLeft: [-n, 0], ArrowRight: [n, 0] }[e.key]; p.x += d[0]; p.y += d[1]; changed(); phone(); }
    else if (e.key === 'Escape') { sel = null; render(); }
  }
  document.addEventListener('keydown', onKey);
  const ro = new ResizeObserver(() => { fitPhone(); if (ws && tab === 'code') Blockly.svgResize(ws); }); ro.observe(root); ro.observe($('alStage')); ro.observe($('alRight')); ro.observe($('alBlocks')); // panes shown / hidden on a portrait tablet change these, not root

  load(host.project, !host.project);
  render();

  function getProject() { if (tab === 'code') saveCode(); const out = JSON.parse(JSON.stringify(proj)); const used = new Set(M.allParts(out).map(x => x.src).filter(s => s && s.startsWith('img:')).map(s => s.slice(4))); for (const k of Object.keys(out.imgs)) if (!used.has(k)) delete out.imgs[k]; return out; }
  return {
    getProject,
    setProject(p) { quiet = true; try { closePop(); load(p, !p); render(); } finally { quiet = false; } },
    resume() { render(); },
    pause() { stopRun(); closePop(); if (tab === 'code') saveCode(); },
    destroy() { destroyed = true; stopRun(); document.removeEventListener('keydown', onKey); ro.disconnect(); if (ws) ws.dispose(); root.innerHTML = ''; },
    // live collaboration: the app (title, screen order), the pictures, each screen and the code are separate parts, so two
    // pupils can design different screens, or one designs while another codes. Screens go first (see the Web Lab).
    liveParts() {
      if (tab === 'code') saveCode();
      const o = {}; for (const k of Object.keys(pool)) if (!proj[k]) o[k] = { [k]: pool[k] };
      for (const id of proj.app.order) o['s' + id] = { ['s' + id]: proj['s' + id] };
      o.imgs = { imgs: proj.imgs }; o.code = { code: proj.code }; o.app = { app: proj.app }; return JSON.parse(JSON.stringify(o));
    },
    liveSet(part, v) {
      if (!v || typeof v !== 'object') return;
      for (const k of Object.keys(v)) if (/^s[a-z]{6}$/.test(k)) pool[k] = v[k];
      const codeBefore = JSON.stringify(proj.code);
      const merged = Object.assign({}, pool, proj, v);
      proj = M.cleanProject(merged); for (const id of proj.app.order) pool['s' + id] = proj['s' + id];
      lastSnap = snap(); undo = []; redo = [];
      if (!proj.app.order.includes(screen)) screen = proj.app.order[0];
      if (sel && !M.findPart(proj, sel)) sel = null;
      if (JSON.stringify(proj.code) !== codeBefore) loadBlocks();
      render(); refreshFields();
    },
    liveBusy() { return !!drag || editingText() || !!al.querySelector('.al-pop') || !!(ws && ws.isDragging && ws.isDragging()); },
    // test hooks
    _proj: () => proj, _screen: () => screen, _sel: () => sel, _select(id) { const f = M.findPart(proj, id); if (f) screen = f.screen; sel = id; render(); }, _tab(t) { tab = t; render(); },
    _blocks: () => ws, _runner: () => runner, _run: startRun, _stop: stopRun, _add: addPart, _codeFor: id => { const f = M.findPart(proj, id); if (f) codeFor(f.part); }
  };
}
