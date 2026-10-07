/* CodeJump · Build Lab — the app: code on the left (Blocks or Python, the same program), the block world on the right.
 * You walk round the world, build by hand from the hotbar, type chat commands, and your code drives a robot helper
 * and builder commands. Lazy-loaded by CodeJump (build-and-play.html: loadCraftLab) and mounted into #craft-ui.
 *
 *   const app = (await import('./craft/craft-app.js')).mount(rootEl, { project, onChange, toast, confirm });
 *   app.getProject() · app.setProject(p) · app.resume() · app.pause() · app.destroy()
 *
 * A project is { v:1, mode:'blocks'|'python', blocks, py, world (run-length text), player, helper, time, hot }.
 */
import * as THREE from '../critter/vendor/three-0.186.1-critter.min.js';
import { createWorld, BLOCKS, NBLOCKS, BY_NAME, LABEL_OF, GROUND, rel, isSolid } from './craft-world.js';
import * as L from './craft-lang.js';
import { createRunner } from './craft-runner.js';
import { createPlayer, raycast } from './craft-player.js';
import { createView, blockIcon } from './craft-view.js';

const CSS_URL = new URL('./craft-app.css', import.meta.url).href;
const ic = id => '<svg class="ic"><use href="#' + id + '"></use></svg>';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const HOT_DEFAULT = [5, 3, 11, 10, 6, 7, 12, 14, 16];
const START = { x: 32.5, z: 40.5 };

const TEMPLATE = `
<div class="cr">
  <div class="cr-code">
    <div class="cr-bar">
      <div class="cr-tabs" role="tablist"><button type="button" role="tab" class="cr-tab on" data-m="blocks" id="crTabB">Blocks</button><button type="button" role="tab" class="cr-tab" data-m="python" id="crTabP">Python</button></div>
      <button type="button" class="cr-run" id="crRun" title="Run your program (the “when Run is clicked” blocks)">${ic('i-play')} Run</button>
      <button type="button" class="cr-btn" id="crStop" title="Stop every script">${ic('i-stop')} Stop</button>
      <button type="button" class="cr-btn" id="crUndo" title="Take back the last build (by code or by hand)">${ic('i-undo')} Undo</button>
      <button type="button" class="cr-btn" id="crNew" title="Start again with a fresh world (your code stays)">${ic('i-reset')} New world</button>
    </div>
    <div class="cr-blocks" id="crBlocks" aria-label="Blocks editor"></div>
    <div class="cr-py" id="crPy" hidden>
      <div class="cr-pyhead"><span>Python — the same program as your blocks.</span><button type="button" class="cr-mini" id="crCmds">Commands</button></div>
      <div class="cr-editor"><div class="cr-gutter" id="crGutter" aria-hidden="true"></div><div class="cr-text"><pre class="cr-hl" id="crHl" aria-hidden="true"></pre><textarea id="crSrc" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Python code"></textarea></div></div>
      <div class="cr-err" id="crErr" hidden></div>
    </div>
    <div class="cr-status" id="crStatus" role="status" aria-live="polite"></div>
  </div>
  <div class="cr-view" id="crView">
    <canvas id="crCanvas" tabindex="0" aria-label="The block world. Drag to look round. W A S D or the arrows to walk, Space to jump. Click to place a block, right-click to break one."></canvas>
    <div class="cr-loading" id="crLoading">Building the world…</div>
    <div class="cr-cams" role="group" aria-label="Camera"><button type="button" class="cr-cam on" data-cam="me" title="See through your own eyes">Me</button><button type="button" class="cr-cam" data-cam="helper" title="Follow the robot helper">Helper</button><button type="button" class="cr-cam" id="crFly" title="Fly (F). Space goes up, Shift goes down.">Fly</button></div>
    <div class="cr-chat"><div class="cr-log" id="crLog" aria-live="polite"></div>
      <form class="cr-chatin" id="crChatForm"><input id="crChat" maxlength="60" autocomplete="off" placeholder="Type a chat command, like: tower 6" aria-label="Chat"><button type="submit" title="Send">${ic('i-send')}</button></form></div>
    <div class="cr-hot" id="crHot" role="toolbar" aria-label="Blocks to build with"></div>
    <div class="cr-pick" id="crPick" hidden></div>
    <div class="cr-pad" id="crPad" aria-hidden="true"><button data-k="f">▲</button><button data-k="l">◀</button><button data-k="b">▼</button><button data-k="r">▶</button></div>
    <div class="cr-pad2" id="crPad2" aria-hidden="true"><button data-k="j">Jump</button><button data-k="d">Down</button></div>
    <div class="cr-tip" id="crTip">Drag to look round · W A S D to walk · click to build · right-click to break</div>
  </div>
  <div class="cr-modal" id="crModal" hidden><div class="cr-modalbox"><button type="button" class="cr-x" id="crModalX" aria-label="Close">×</button><div id="crModalBody"></div></div></div>
</div>`;

let theme = null, defined = false;
function crTheme(Blockly) {
  if (!theme) theme = Blockly.Theme.defineTheme('codejumpCraft', {
    base: Blockly.Themes.Zelos || Blockly.Themes.Classic, startHats: true,
    fontStyle: { family: "'Montserrat', sans-serif", weight: '600', size: 11 },
    componentStyles: { workspaceBackgroundColour: '#1e1e1e', toolboxBackgroundColour: '#2a2a2a', toolboxForegroundColour: '#fff', flyoutBackgroundColour: '#252526',
      flyoutForegroundColour: '#ccc', flyoutOpacity: 1, scrollbarColour: '#797979', insertionMarkerColour: '#fff', insertionMarkerOpacity: 0.3, scrollbarOpacity: 0.4, cursorColour: '#d0d0d0' }
  });
  return theme;
}
// Python colouring for the editor
const KW = /\b(def|for|in|range|while|if|elif|else|and|or|not|pass|True|False)\b/;
function highlight(src) {
  return src.split('\n').map(line => {
    let out = '', i = 0;
    const re = /(#.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)|(@on_chat)|\b(helper|builder|player|world)\b(?=\.)|\b(def|for|in|range|while|if|elif|else|and|or|not|pass|True|False|wait|random|str|print)\b|\b([A-Z][A-Z_]+)\b|\b(\d+(?:\.\d+)?)\b/g;
    let m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(i, m.index));
      const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'd' : m[4] ? 'o' : m[5] ? 'k' : m[6] ? (L.CONSTANTS.has(m[6]) ? 'n' : '') : m[7] ? 'm' : '';
      out += cls ? '<span class="' + cls + '">' + esc(m[0]) + '</span>' : esc(m[0]);
      i = m.index + m[0].length;
    }
    return out + esc(line.slice(i));
  }).join('\n') + '\n';
}
void KW;

export function mount(root, host) {
  host = host || {};
  if (!document.querySelector('link[data-craft-css]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = CSS_URL; l.setAttribute('data-craft-css', ''); document.head.appendChild(l); }
  root.innerHTML = TEMPLATE;
  const $ = id => root.querySelector('#' + id);
  const Blockly = window.Blockly;
  const touchy = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const world = createWorld();
  const player = createPlayer(world, START.x, GROUND + 1, START.z);
  let ws = null, view = null, alive = true, raf = 0, last = 0, quiet = false, changeTimer = 0;
  let mode = 'blocks', pyText = '', hot = HOT_DEFAULT.slice(), slot = 1, cam = 'me', undo = [];
  const keys = new Set(), pad = new Set();
  const status = (msg, kind) => { const s = $('crStatus'); s.textContent = msg || ''; s.className = 'cr-status' + (kind ? ' ' + kind : ''); };
  const changed = () => { if (quiet) return; clearTimeout(changeTimer); changeTimer = setTimeout(() => { if (alive && host.onChange) host.onChange(); }, 300); };
  const toast = (m, c) => { if (host.toast) host.toast(m, c); };

  // ── chat log ──
  function log(text, who) {
    const el = document.createElement('div'); el.className = 'cr-msg ' + (who || 'sys');
    el.innerHTML = (who === 'helper' ? '<b>Helper:</b> ' : who === 'me' ? '<b>You:</b> ' : '') + esc(text);
    const lg = $('crLog'); lg.appendChild(el); while (lg.children.length > 7) lg.firstChild.remove();
    setTimeout(() => el.classList.add('old'), 9000);
  }
  // ── the runner ──
  const runner = createRunner(world, {
    player: () => ({ x: player.x, y: player.y, z: player.z, facing: player.facing() }),
    teleport: (x, y, z) => { player.x = Math.max(0.5, Math.min(world.W - 0.5, x)); player.y = Math.max(1, Math.min(world.H + 4, y)); player.z = Math.max(0.5, Math.min(world.D - 0.5, z)); player.vy = 0; player.unstick(); },
    say: (t, who) => log(t, who), time: n => { if (view) view.setTime(n); changed(); },
    error: msg => { status(msg, 'bad'); log(msg, 'err'); },
    placed: () => player.unstick()
  });
  world.onChange(() => changed());
  function placeHelperNearPlayer() { const c = rel([Math.floor(player.x), Math.floor(player.y), Math.floor(player.z)], player.facing(), 3, 1, 2); Object.assign(runner.helper, { x: c[0], y: c[1], z: c[2], f: player.facing(), from: null, t: 1 }); }

  // ── the program: blocks or Python → JSON state ──
  function programState() {
    if (mode === 'python') { const r = L.fromPython(pyText); if (r.error) { showPyError(r.error); return null; } hidePyError(); return r.state; }
    return ws ? Blockly.serialization.workspaces.save(ws) : L.starterProgram();
  }
  function snapshot() { undo.push(world.save()); if (undo.length > 20) undo.shift(); }
  function run() {
    const st = programState(); if (!st) { status('Fix the Python first (see the red line).', 'bad'); return; }
    snapshot(); runner.load(st); runner.start(); status(runner.running() ? 'Running… type a chat command too.' : 'Done. Type a chat command, or press Run again.', 'ok');
    $('crCanvas').focus({ preventScroll: true });
  }
  function chat(text) {
    const parts = String(text).trim().split(/\s+/); const word = (parts[0] || '').toLowerCase().replace(/^\//, ''); if (!word) return;
    log(text, 'me');
    const st = programState(); if (!st) { log('Your Python has a mistake, so nothing ran. Fix the red line first.', 'err'); return; }
    runner.load(st);
    const nums = parts.slice(1).map(Number).filter(n => isFinite(n));
    snapshot();
    if (!runner.chat(word, nums)) { undo.pop(); const ws2 = runner.words(); log('Nothing in your code listens for “' + word + '”. Add a “when I type ' + word + ' in the chat” block' + (ws2.length ? ' — or try: ' + ws2.join(', ') : '') + '.', 'err'); }
    else status('Running “' + word + '”…', 'ok');
  }
  $('crChatForm').addEventListener('submit', e => { e.preventDefault(); const v = $('crChat').value; $('crChat').value = ''; chat(v); $('crCanvas').focus({ preventScroll: true }); });
  $('crRun').onclick = run;
  $('crStop').onclick = () => { runner.stop(); status('Stopped.'); };
  $('crUndo').onclick = () => { const s = undo.pop(); if (!s) { status('Nothing to take back.'); return; } runner.stop(); world.load(s); player.unstick(); status('Took back the last build.'); };
  $('crNew').onclick = async () => {
    const ok = host.confirm ? await host.confirm('Start again with a fresh world? Your code stays, but everything built goes.') : window.confirm('Start again with a fresh world?');
    if (!ok) return; snapshot(); runner.stop(); world.reset(); player.x = START.x; player.z = START.z; player.y = GROUND + 1; player.yaw = 0; player.pitch = -0.15; placeHelperNearPlayer(); if (view) view.setTime('DAY'); status('A fresh world.');
  };

  // ── Blocks ⇄ Python ──
  function setMode(m) {
    if (m === mode) return;
    if (m === 'python') { pyText = ws ? L.toPython(Blockly.serialization.workspaces.save(ws)) : pyText; $('crSrc').value = pyText; renderPy(); hidePyError(); }
    else {
      const r = L.fromPython($('crSrc').value);
      if (r.error) { showPyError(r.error); status('Fix the red line before going back to blocks.', 'bad'); return; }
      loadBlocks(r.state, true);
    }
    mode = m;
    $('crBlocks').hidden = m !== 'blocks'; $('crPy').hidden = m !== 'python';
    root.querySelectorAll('.cr-tab').forEach(t => { t.classList.toggle('on', t.dataset.m === m); t.setAttribute('aria-selected', t.dataset.m === m); });
    if (m === 'blocks' && ws) setTimeout(() => Blockly.svgResize(ws), 0);
    changed();
  }
  root.querySelectorAll('.cr-tab').forEach(t => t.onclick = () => setMode(t.dataset.m));
  const src = $('crSrc');
  function renderPy() {
    $('crHl').innerHTML = highlight(src.value);
    const n = src.value.split('\n').length; let g = ''; for (let i = 1; i <= n; i++) g += '<div' + (errLine === i ? ' class="bad"' : '') + '>' + i + '</div>'; $('crGutter').innerHTML = g;
    syncScroll();
  }
  function syncScroll() { $('crHl').scrollTop = src.scrollTop; $('crHl').scrollLeft = src.scrollLeft; $('crGutter').scrollTop = src.scrollTop; }
  let errLine = 0, pyTimer = 0;
  function showPyError(e) { errLine = e.line; const el = $('crErr'); el.hidden = false; el.textContent = 'Line ' + e.line + ': ' + e.msg; renderPy(); }
  function hidePyError() { errLine = 0; $('crErr').hidden = true; }
  src.addEventListener('input', () => { pyText = src.value; renderPy(); changed(); clearTimeout(pyTimer); pyTimer = setTimeout(() => { const r = L.fromPython(pyText); if (r.error) showPyError(r.error); else { hidePyError(); renderPy(); } }, 700); });
  src.addEventListener('scroll', syncScroll);
  src.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Tab') { e.preventDefault(); const s = src.selectionStart; src.setRangeText('    ', s, src.selectionEnd, 'end'); src.dispatchEvent(new Event('input')); }
    else if (e.key === 'Enter') { // keep the indent, and add 4 after a ":"
      e.preventDefault(); const s = src.selectionStart, before = src.value.slice(0, s), lineStart = before.lastIndexOf('\n') + 1, line = before.slice(lineStart);
      let ind = /^ */.exec(line)[0]; if (/:\s*$/.test(line)) ind += '    ';
      src.setRangeText('\n' + ind, s, src.selectionEnd, 'end'); src.dispatchEvent(new Event('input'));
    }
  });
  $('crCmds').onclick = () => {
    const rows = L.API.map(a => '<tr><td><code>' + esc(a[2]) + '(' + a[4].map(x => x[0].toLowerCase()).join(', ') + ')</code></td><td>' + esc(a[3].replace(/\s*\|/g, '').replace(/%([A-Z0-9]+)/g, (m, n) => n.toLowerCase())) + '</td></tr>').join('');
    modal('<h3>Python commands</h3><p>Positions are <b>right, up, ahead</b> from where you stand. Use these names for blocks: ' + BLOCKS.map(b => '<code>' + b[1] + '</code>').join(' ') +
      '. Directions: <code>FORWARD BACK LEFT RIGHT UP DOWN</code>.</p><table class="cr-cmds">' + rows +
      '<tr><td><code>@on_chat("word")<br>def word(n):</code></td><td>runs when you type the word in the chat (n = a number typed after it)</td></tr><tr><td><code>for i in range(5):</code> · <code>while …:</code> · <code>if … elif … else</code></td><td>loops and choices</td></tr><tr><td><code>random(1, 6)</code></td><td>a random whole number</td></tr></table>');
  };
  function modal(html) { $('crModalBody').innerHTML = html; $('crModal').hidden = false; }
  $('crModalX').onclick = () => { $('crModal').hidden = true; };

  // ── hotbar + block picker ──
  function renderHot() {
    const h = $('crHot'); h.innerHTML = '';
    const mk = (i, inner, title) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'cr-slot' + (i === slot ? ' on' : ''); b.title = title; b.innerHTML = inner; b.onclick = () => { slot = i; renderHot(); }; return b; };
    h.appendChild(mk(0, '<span class="cr-dig">⛏</span><i>0</i>', 'Break blocks (or right-click)'));
    hot.forEach((id, k) => { const b = mk(k + 1, '<i>' + (k + 1) + '</i>', LABEL_OF(id)); if (view) b.prepend(blockIcon(document, view.atlas, id, 34)); h.appendChild(b); });
    const more = document.createElement('button'); more.type = 'button'; more.className = 'cr-slot cr-more'; more.textContent = 'More'; more.title = 'Choose a different block for this slot'; more.onclick = togglePick; h.appendChild(more);
  }
  function togglePick() {
    const p = $('crPick'); if (!p.hidden) { p.hidden = true; return; }
    p.innerHTML = '<div class="cr-pickh">Pick a block for slot ' + (slot || 1) + '</div>';
    for (let id = 1; id < NBLOCKS; id++) { const b = document.createElement('button'); b.type = 'button'; b.title = LABEL_OF(id); b.appendChild(blockIcon(document, view.atlas, id, 36)); const s = document.createElement('span'); s.textContent = LABEL_OF(id); b.appendChild(s);
      b.onclick = () => { if (!slot) slot = 1; hot[slot - 1] = id; p.hidden = true; renderHot(); changed(); }; p.appendChild(b); }
    p.hidden = false;
  }

  // ── looking, walking, building by hand ──
  const cv = $('crCanvas');
  let drag = null, hover = null, wasBusy = false;
  function camPose() {
    if (cam === 'helper') {
      const h = runner.helper, f = [[0, -1], [1, 0], [0, 1], [-1, 0]][h.f || 0], hx = h.x + 0.5, hy = h.y + 0.5, hz = h.z + 0.5;
      const cx = hx - f[0] * 5 + 1.5, cy = hy + 3.5, cz = hz - f[1] * 5 + 1.5;
      return { x: cx, y: cy, z: cz, dx: hx - cx, dy: hy - cy, dz: hz - cz };
    }
    const l = player.look(); return { x: player.x, y: player.y + 1.6, z: player.z, dx: l[0], dy: l[1], dz: l[2] };
  }
  function pick(px, py) { if (!view) return null; const r = view.screenRay(px, py); return raycast(world, r.o, r.d, cam === 'me' ? 7 : 30); }
  function act(px, py, breakIt) {
    const h = pick(px, py); if (!h) return;
    snapshot();
    if (breakIt || slot === 0) { if (h.y > 0) world.set(h.x, h.y, h.z, 0); }
    else {
      const x = h.x + h.nx, y = h.y + h.ny, z = h.z + h.nz, id = hot[slot - 1];
      if (y < 1 || !world.inside(x, y, z)) { undo.pop(); return; }
      if (isSolid(id) && Math.abs(x + 0.5 - player.x) < 0.8 && Math.abs(z + 0.5 - player.z) < 0.8 && y >= Math.floor(player.y) - 0 && y <= Math.floor(player.y + 1.7)) { undo.pop(); return; } // not inside you
      world.set(x, y, z, id);
    }
  }
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('pointerdown', e => { cv.focus({ preventScroll: true }); cv.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false, btn: e.button, t: performance.now() }; $('crPick').hidden = true; $('crTip').classList.add('gone'); });
  cv.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect();
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag.moved = true;
      if (drag.moved && cam === 'me') { player.yaw -= dx * 0.0055; player.pitch = Math.max(-1.5, Math.min(1.5, player.pitch - dy * 0.0055)); }
    }
    hover = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  cv.addEventListener('pointerleave', () => { hover = null; });
  cv.addEventListener('pointerup', e => {
    if (!drag) return; const d = drag; drag = null; if (d.moved) return;
    const r = cv.getBoundingClientRect(); const long = performance.now() - d.t > 450;
    act(e.clientX - r.left, e.clientY - r.top, d.btn === 2 || (e.pointerType === 'touch' && long));
  });
  const KEYMAP = { KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r', Space: 'j', ShiftLeft: 'd', ShiftRight: 'd' };
  cv.addEventListener('keydown', e => {
    if (e.code === 'KeyT' || e.code === 'Enter' || e.code === 'Slash') { e.preventDefault(); $('crChat').focus(); return; }
    if (e.code === 'KeyF') { toggleFly(); return; }
    if (/^Digit[0-9]$/.test(e.code)) { slot = Math.min(hot.length, +e.code.slice(5)); renderHot(); return; }
    const k = KEYMAP[e.code]; if (k) { keys.add(k); e.preventDefault(); }
  });
  window.addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) keys.delete(k); });
  cv.addEventListener('blur', () => keys.clear());
  function toggleFly() { player.fly = !player.fly; $('crFly').classList.toggle('on', player.fly); root.querySelector('#crPad2 [data-k="d"]').hidden = !player.fly; changed(); }
  $('crFly').onclick = toggleFly;
  root.querySelectorAll('.cr-cam[data-cam]').forEach(b => b.onclick = () => { cam = b.dataset.cam; root.querySelectorAll('.cr-cam[data-cam]').forEach(x => x.classList.toggle('on', x === b)); });
  root.querySelectorAll('#crPad button, #crPad2 button').forEach(b => {
    const k = b.dataset.k;
    b.addEventListener('pointerdown', e => { e.preventDefault(); pad.add(k); b.setPointerCapture(e.pointerId); });
    const up = () => pad.delete(k); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
  });
  if (touchy) root.querySelector('.cr').classList.add('touch');

  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    const on = k => keys.has(k) || pad.has(k);
    player.step(dt, { fwd: (on('f') ? 1 : 0) - (on('b') ? 1 : 0), side: (on('r') ? 1 : 0) - (on('l') ? 1 : 0), jump: on('j'), down: on('d') });
    runner.tick(dt);
    const busy = runner.running(); $('crRun').classList.toggle('on', busy);
    if (wasBusy && !busy && /^Running/.test($('crStatus').textContent)) status('Done. Type a chat command, or press Run again.', 'ok');
    wasBusy = busy;
    if (!view) return;
    if (hover && !drag) view.highlight(pick(hover.x, hover.y)); else if (!hover) view.highlight(null);
    view.render(camPose(), runner.helper, { me: { x: player.x, y: player.y, z: player.z, yaw: player.yaw }, showMe: cam !== 'me' });
  }

  // ── saving ──
  function getProject() {
    const st = ws ? Blockly.serialization.workspaces.save(ws) : null;
    return { v: 1, mode, blocks: st, py: mode === 'python' ? src.value : undefined, world: world.save(),
      player: { x: +player.x.toFixed(2), y: +player.y.toFixed(2), z: +player.z.toFixed(2), yaw: +player.yaw.toFixed(3), pitch: +player.pitch.toFixed(3), fly: !!player.fly },
      helper: { x: runner.helper.x, y: runner.helper.y, z: runner.helper.z, f: runner.helper.f }, time: view ? view.time() : 'DAY', hot: hot.slice() };
  }
  const num = (v, lo, hi, d) => { v = Number(v); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; };
  function loadBlocks(state, cleanUp) {
    if (!ws) return; quiet = true;
    try { ws.clear(); Blockly.serialization.workspaces.load(state || L.starterProgram(), ws); if (cleanUp) ws.cleanUp(); }
    catch (e) { ws.clear(); Blockly.serialization.workspaces.load(L.starterProgram(), ws); toast('Some blocks couldn’t be loaded, so the example is back.'); }
    finally { quiet = false; }
    try { ws.scroll(20, 20); } catch (e) { /* hidden */ }
  }
  let pending = host.project || null;
  function setProject(p) {
    p = p && typeof p === 'object' ? p : {};
    runner.stop(); undo = [];
    quiet = true;
    try {
      if (typeof p.world === 'string' && p.world.length < 3000000 && world.load(p.world)) { /* loaded */ } else world.reset();
      const pl = p.player || {};
      player.x = num(pl.x, 0.5, world.W - 0.5, START.x); player.z = num(pl.z, 0.5, world.D - 0.5, START.z); player.y = num(pl.y, 1, world.H + 4, GROUND + 1);
      player.yaw = num(pl.yaw, -100, 100, 0); player.pitch = num(pl.pitch, -1.5, 1.5, -0.15); player.fly = !!pl.fly; player.vy = 0; player.unstick();
      const hp = p.helper; if (hp && isFinite(hp.x)) Object.assign(runner.helper, { x: num(hp.x, 0, world.W - 1, 32) | 0, y: num(hp.y, 1, world.H - 1, GROUND + 1) | 0, z: num(hp.z, 0, world.D - 1, 30) | 0, f: num(hp.f, 0, 3, 0) | 0, from: null, t: 1, trail: 0 });
      else placeHelperNearPlayer();
      hot = Array.isArray(p.hot) && p.hot.length === 9 ? p.hot.map(v => (Number.isInteger(v) && v > 0 && v < NBLOCKS ? v : 3)) : HOT_DEFAULT.slice();
      if (view) view.setTime(['DAY', 'SUNSET', 'NIGHT'].includes(p.time) ? p.time : 'DAY');
      loadBlocks(p.blocks && typeof p.blocks === 'object' ? p.blocks : null, !(p.blocks && typeof p.blocks === 'object'));
      mode = 'blocks'; $('crBlocks').hidden = false; $('crPy').hidden = true; root.querySelectorAll('.cr-tab').forEach(t => t.classList.toggle('on', t.dataset.m === 'blocks'));
      if (p.mode === 'python' && typeof p.py === 'string') { pyText = p.py.slice(0, 50000); src.value = pyText; mode = 'python'; $('crBlocks').hidden = true; $('crPy').hidden = false; root.querySelectorAll('.cr-tab').forEach(t => t.classList.toggle('on', t.dataset.m === 'python')); renderPy(); const r = L.fromPython(pyText); if (r.error) showPyError(r.error); else hidePyError(); }
      $('crFly').classList.toggle('on', player.fly); root.querySelector('#crPad2 [data-k="d"]').hidden = !player.fly;
    } finally { quiet = false; }
    renderHot();
    status('Press Run, or type a chat command. Click the world, then W A S D to walk.');
  }

  const ro = new ResizeObserver(() => { if (view) view.resize(); if (ws && mode === 'blocks') Blockly.svgResize(ws); });
  ro.observe($('crView')); ro.observe($('crBlocks'));

  const ready = (async () => {
    if (!defined) { L.defineBlocks(Blockly.common || Blockly); defined = true; }
    ws = Blockly.inject($('crBlocks'), {
      toolbox: L.toolbox(), renderer: 'zelos', theme: crTheme(Blockly), scrollbars: true, trashcan: true, media: 'https://unpkg.com/blockly@10.4.3/media/',
      zoom: { controls: true, wheel: true, startScale: touchy ? 0.8 : 0.68, maxScale: 2.5, minScale: 0.3, scaleSpeed: 1.1 },
      grid: { spacing: 24, length: 3, colour: 'rgba(255,255,255,0.08)', snap: true }
    });
    try { ws.connectionChecker.doTypeChecks = () => true; } catch (e) { /* older Blockly */ }
    ws.addChangeListener(e => { if (quiet || e.isUiEvent) return; changed(); });
    view = createView(THREE, cv, world);
    setProject(pending); pending = null;
    $('crLoading').hidden = true; view.resize(); raf = requestAnimationFrame(tick);
  })().catch(e => { console.error(e); $('crLoading').textContent = 'The Build Lab needs the internet the first time it opens. Check your connection and try again.'; });

  return {
    ready, getProject,
    setProject(p) { if (!ws) { pending = p; return; } setProject(p); if (!raf && view) raf = requestAnimationFrame(tick); },
    resume() { if (view) view.resize(); if (ws) Blockly.svgResize(ws); if (!raf && view) raf = requestAnimationFrame(tick); },
    pause() { runner.stop(); keys.clear(); pad.clear(); cancelAnimationFrame(raf); raf = 0; },
    destroy() { alive = false; ro.disconnect(); cancelAnimationFrame(raf); runner.stop(); if (view) view.dispose(); if (ws) ws.dispose(); root.innerHTML = ''; },
    run, chat, setMode,
    _world: () => world, _player: () => player, _runner: () => runner, _ws: () => ws, _view: () => view, _act: act, _pick: pick, _slot: n => { slot = n; renderHot(); }
  };
}
