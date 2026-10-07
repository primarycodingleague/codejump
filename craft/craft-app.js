/* CodeJump · Build Lab — the app: code on the left (Blocks or Python, the same program), the block world on the right.
 * You walk round the world, build by hand from the hotbar, type chat commands, and your code drives a robot helper
 * and builder commands. Lazy-loaded by CodeJump (build-and-play.html: loadCraftLab) and mounted into #craft-ui.
 *
 *   const app = (await import('./craft/craft-app.js')).mount(rootEl, { project, onChange, toast, confirm });
 *   app.getProject() · app.setProject(p) · app.resume() · app.pause() · app.destroy()
 *
 * A project is { v:1, mode:'blocks'|'python', blocks, py, world (run-length text), player, helper, time, hot, maker?, progress? }
 * (maker/progress: a World Maker lesson or challenge — see craft-maker.js).
 */
import * as THREE from '../critter/vendor/three-0.186.1-critter.min.js';
import { createWorld, BLOCKS, NBLOCKS, BY_NAME, LABEL_OF, GROUND, rel, isSolid, GROUPS, GROUP_OF, BLOCK_ORDER } from './craft-world.js';
const GROUP_NAME = Object.fromEntries(GROUPS);
import * as L from './craft-lang.js';
import { createRunner } from './craft-runner.js';
import { createPlayer, raycast } from './craft-player.js';
import { createView, blockIcon } from './craft-view.js';
import { createMakerUI } from './craft-maker-ui.js';
import { createComp } from './craft-comp.js';

const CSS_URL = new URL('./craft-app.css', import.meta.url).href;
const ic = id => '<svg class="ic"><use href="#' + id + '"></use></svg>';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const chev = deg => '<svg viewBox="0 0 24 24" width="22" height="22" style="transform:rotate(' + deg + 'deg)"><path d="M6 15l6-6 6 6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// our own pickaxe: the "break blocks" slot
const PICK = '<svg class="cr-dig" viewBox="0 0 32 32" width="30" height="30"><path d="M9 25L21 13" stroke="#8a5a33" stroke-width="3.6" stroke-linecap="round"/><path d="M9 25L21 13" stroke="#c08a4b" stroke-width="1.6" stroke-linecap="round"/><path d="M10 7c6-1.5 11 0 15 4l-2 2c-3-3-7-4.3-11.6-3.6z" fill="#b8c2cc" stroke="#3a4250" stroke-width="1.2" stroke-linejoin="round"/><path d="M25 11c1.5 4 1.2 8-.4 11.5l-2.4-1.2c1.2-3 1.3-5.8.4-8.3z" fill="#d6dde4" stroke="#3a4250" stroke-width="1.2" stroke-linejoin="round"/></svg>';
const GRID = '<svg viewBox="0 0 24 24" width="18" height="18"><g fill="#fff"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></g></svg>';
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
    <div class="cr-topr"><div class="cr-mkbtns" id="crMkBtns"></div><div class="cr-cams" role="group" aria-label="Camera"><button type="button" class="cr-cam on" data-cam="me" title="See through your own eyes">Me</button><button type="button" class="cr-cam" data-cam="helper" title="Follow the robot helper">Helper</button><button type="button" class="cr-cam" id="crFly" title="Fly (F). Space goes up, Shift goes down.">Fly</button></div></div>
    <div class="cr-chat"><div class="cr-log" id="crLog" aria-live="polite"></div>
      <form class="cr-chatin" id="crChatForm"><input id="crChat" maxlength="60" autocomplete="off" placeholder="Type a chat command, like: tower 6" aria-label="Chat"><button type="submit" title="Send">${ic('i-send')}</button></form></div>
    <div class="cr-hot" id="crHot" role="toolbar" aria-label="Blocks to build with"></div>
    <div class="cr-pick" id="crPick" hidden></div>
    <div class="cr-cross" aria-hidden="true"></div>
    <div class="cr-pad" id="crPad" aria-hidden="true"><button data-k="f">${chev(0)}</button><button data-k="l">${chev(270)}</button><button data-k="b">${chev(180)}</button><button data-k="r">${chev(90)}</button></div>
    <div class="cr-pad2" id="crPad2" aria-hidden="true"><button data-k="j">Jump</button><button data-k="d">Down</button></div>
    <div class="cr-tip" id="crTip"><span><b>Drag</b> to look</span><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> walk</span><span><kbd>Space</kbd> jump</span><span><b>Click</b> build</span><span><b>Right-click</b> break</span><span><kbd>F</kbd> fly</span></div>
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
  let mode = 'blocks', pyText = '', hot = HOT_DEFAULT.slice(), slot = 1, cam = 'me', undo = [], savedHot = null, allowed = null, codeRule = 'all', flyOk = true;
  const keys = new Set(), pad = new Set();
  const status = (msg, kind) => { const s = $('crStatus'); s.textContent = msg || ''; s.className = 'cr-status' + (kind ? ' ' + kind : ''); };
  const changed = () => { if (quiet) return;  clearTimeout(changeTimer); changeTimer = setTimeout(() => { if (alive && host.onChange) host.onChange(); }, 300); };
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
  function programState(silent) {
    if (mode === 'python') { const r = L.fromPython(pyText); if (r.error) { if (!silent) showPyError(r.error); return null; } if (!silent) hidePyError(); return r.state; }
    return ws ? Blockly.serialization.workspaces.save(ws) : L.starterProgram();
  }
  function snapshot() { undo.push(world.save()); if (undo.length > 20) undo.shift(); }
  function run() {
    mk.onRun();
    const st = programState(); if (!st) { status('Fix the Python first (see the red line).', 'bad'); return; }
    snapshot(); runner.load(st); runner.start(); status(runner.running() ? 'Running… type a chat command too.' : 'Done. Type a chat command, or press Run again.', 'ok');
    $('crCanvas').focus({ preventScroll: true });
  }
  function chat(text) {
    const parts = String(text).trim().split(/\s+/); const word = (parts[0] || '').toLowerCase().replace(/^\//, ''); if (!word) return;
    log(text, 'me'); mk.onChat(word);
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
  src.addEventListener('input', () => { pyText = src.value; renderPy(); changed(); sendCodeSoon(); clearTimeout(pyTimer); pyTimer = setTimeout(() => { const r = L.fromPython(pyText); if (r.error) showPyError(r.error); else { hidePyError(); renderPy(); } }, 700); });
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
    modal('<h3>Python commands</h3><p>Positions are <b>right, up, ahead</b> from where you stand. Use these names for blocks:</p>' + GROUPS.map(([g, n]) => '<p><b>' + n + ':</b> ' + BLOCK_ORDER.filter(id => GROUP_OF(id) === g).map(id => '<code title="' + BLOCKS[id][2] + '">' + BLOCKS[id][1] + '</code>').join(' ') + '</p>').join('') + '<p><code>AIR</code> = nothing (dig a hole). Directions: <code>FORWARD BACK LEFT RIGHT UP DOWN</code>.</p><table class="cr-cmds">' + rows +
      '<tr><td><code>@on_chat("word")<br>def word(n):</code></td><td>runs when you type the word in the chat (n = a number typed after it)</td></tr><tr><td><code>for i in range(5):</code> · <code>while …:</code> · <code>if … elif … else</code></td><td>loops and choices</td></tr><tr><td><code>random(1, 6)</code></td><td>a random whole number</td></tr></table>');
  };
  function modal(html) { $('crModalBody').innerHTML = html; $('crModal').hidden = false; const f = $('crModalBody').querySelector('input,select,textarea,button'); if (f) setTimeout(() => f.focus(), 30); }
  const closeModal = () => { $('crModal').hidden = true; cv.focus({ preventScroll: true }); };
  $('crModalX').onclick = closeModal;
  $('crModal').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') closeModal(); });

  // ── hotbar + block picker ──
  function renderHot() {
    const h = $('crHot'); h.innerHTML = '';
    const mk = (i, inner, title) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'cr-slot' + (i === slot ? ' on' : ''); b.title = title; b.innerHTML = inner; b.onclick = () => { slot = i; renderHot(); }; return b; };
    h.appendChild(mk(0, PICK + '<i>0</i>', 'Break blocks (or right-click)'));
    hot.forEach((id, k) => { const b = mk(k + 1, '<i>' + (k + 1) + '</i>', LABEL_OF(id)); if (view) b.prepend(blockIcon(document, view.atlas, id, 34)); h.appendChild(b); });
    const more = document.createElement('button'); more.type = 'button'; more.className = 'cr-slot cr-more'; more.innerHTML = GRID + '<span>More</span>'; more.title = 'Choose a different block for this slot'; more.onclick = togglePick; h.appendChild(more);
  }
  function togglePick() {
    const p = $('crPick'); if (!p.hidden) { p.hidden = true; return; }
    $('crTip').classList.add('gone'); // it would cover the picker's title
    p.innerHTML = '<div class="cr-pickh">Pick a block for slot ' + (slot || 1) + '</div>';
    let grp = '';
    for (const id of BLOCK_ORDER) { if (allowed && !allowed.includes(id)) continue;
      if (GROUP_OF(id) !== grp) { grp = GROUP_OF(id); const h = document.createElement('div'); h.className = 'cr-pickg'; h.textContent = GROUP_NAME[grp] || grp; p.appendChild(h); }
      const b = document.createElement('button'); b.type = 'button'; b.title = LABEL_OF(id); b.appendChild(blockIcon(document, view.atlas, id, 36)); const s = document.createElement('span'); s.textContent = LABEL_OF(id); b.appendChild(s);
      b.onclick = () => { if (!slot) slot = 1; hot[slot - 1] = id; p.hidden = true; renderHot(); changed(); }; p.appendChild(b); }
    p.hidden = false;
  }

  // ── looking, walking, building by hand ──
  const cv = $('crCanvas');
  // ── World Maker (craft-maker-ui.js) ──
  function applyRules(r) {
    allowed = r && r.blocks ? r.blocks.slice() : null;
    if (allowed) { if (!savedHot) savedHot = hot.slice(); hot = allowed.slice(0, 9); slot = Math.min(Math.max(1, slot), hot.length); }
    else if (savedHot) { hot = savedHot; savedHot = null; }
    renderHot(); $('crHot').hidden = !!r && !r.build && !r.break; // nothing to build with by hand: no block bar
    flyOk = !r || r.fly; if (!flyOk && player.fly) toggleFly(); $('crFly').hidden = !flyOk;
    $('crTabP').hidden = !!r && !r.python; if (r && !r.python && mode === 'python') setMode('blocks');
    const code = r ? r.code : 'all'; root.querySelector('.cr').classList.toggle('nocode', code === 'none');
    if (code !== codeRule) { codeRule = code; if (ws) { try { ws.updateToolbox(L.toolbox(code === 'none' ? 'all' : code)); } catch (e) { /* older Blockly */ } } }
    if (view) setTimeout(() => view.resize(), 0);
  }
  const mk = createMakerUI({ $, root, world, player, runner, view: () => view, changed, log, status, toast, programState,
    confirm: msg => (host.confirm ? host.confirm(msg) : Promise.resolve(window.confirm(msg))),
    prompt: (msg, d) => (host.prompt ? host.prompt(msg, d) : Promise.resolve(window.prompt(msg, d))),
    modal, closeModal, applyRules, focus: () => cv.focus({ preventScroll: true }),
    placeAt(st, hp) {
      if (st) { player.x = st.x; player.y = st.y; player.z = st.z; player.yaw = st.yaw || 0; player.pitch = -0.2; player.vy = 0; player.unstick(); }
      if (hp) Object.assign(runner.helper, { x: hp.x, y: hp.y, z: hp.z, f: hp.f || 0, from: null, t: 1, trail: 0 });
    },
    clearUndo: () => { undo = []; }, snapshotUndo: snapshot,
    snapshot: () => ({ world: world.save(), player: { x: player.x, y: player.y, z: player.z, yaw: player.yaw, pitch: player.pitch }, helper: { ...runner.helper } }),
    restore(sn) { runner.stop(); world.load(sn.world); Object.assign(player, sn.player); player.vy = 0; Object.assign(runner.helper, sn.helper, { from: null, t: 1 }); },
    openProject(p) { comp.leave(true); setProject(p); mk.viewReady(); changed(); }
  });
  // ── competitions (craft-comp.js; the cloud comes from the host) ──
  let codeSendT = 0;
  const comp = createComp({ $, world, player, runner, view: () => view, log, status, toast, modal, closeModal,
    cloud: () => host.cloud || null,
    confirm: msg => (host.confirm ? host.confirm(msg) : Promise.resolve(window.confirm(msg))),
    prompt: (msg, d) => (host.prompt ? host.prompt(msg, d) : Promise.resolve(window.prompt(msg, d))),
    openProject(p, opts) { setProject(p, opts); mk.viewReady(); },
    currentProject: () => getProject(),
    loadProgram(blocks) { if (mode === 'python') { pyText = L.toPython(blocks); src.value = pyText; renderPy(); } loadBlocks(blocks); },
    busyEditing: () => !!(ws && ws.isDragging && ws.isDragging()) || document.activeElement === src,
    compRules(r) { $('crHot').hidden = !!r && (r.ro || r.kind === 'code'); if (r && r.ro) status(r.kind === 'code' ? 'You’re watching — this is the team’s code.' : 'You’re watching — you can walk round but not build.'); }
  });
  // ── live collaboration (Share → Collaborate; the host passes host.live = {active, send, me, members}) ──
  // Block changes go in batches; the cloud numbers them and sends them to everyone (us too), so every screen applies them
  // in the same order and ends up the same. A world loaded by hand (Undo, New world, Restart) goes as a whole world. The
  // code, the World Maker setup and the time of day are kept in step by the host (liveParts / liveSet).
  const live = { seq: 0, pending: [], t: 0, reset: 0, lastPos: '', mates: {} };
  const liveOn = () => !!(host.live && host.live.active() && !comp.inRoom());
  world.onChange((x, y, z, id, old, remote) => {
    if (remote || quiet || !liveOn()) return;
    if (x < 0) { clearTimeout(live.reset); live.reset = setTimeout(() => { if (!liveOn()) return; live.pending = []; clearTimeout(live.t); live.t = 0; host.live.send({ k: 'cr_world', world: world.save() }); }, 60); return; }
    live.pending.push([x, y, z, id]); if (!live.t) live.t = setTimeout(liveFlush, 120);
  });
  function liveFlush() { live.t = 0; if (!liveOn()) { live.pending = []; return; } while (live.pending.length) host.live.send({ k: 'cr_sets', sets: live.pending.splice(0, 2000) }); }
  function remoteSets(sets) { world.remote = true; try { for (const q of sets) if (Array.isArray(q) && q.length === 4) world.set(q[0], q[1], q[2], q[3]); } finally { world.remote = false; } }
  function liveOp(op, from) {
    if (!op || comp.inRoom()) return;
    if (op.k === 'cr_sets' && Array.isArray(op.sets)) { remoteSets(op.sets); if (op.seq) live.seq = Math.max(live.seq, op.seq); return; }
    if (op.k === 'cr_world' && typeof op.world === 'string') {
      world.remote = true; try { world.load(op.world); } finally { world.remote = false; }
      remoteSets(live.pending); // our own changes that haven't gone yet stay on top
      if (op.seq) live.seq = Math.max(live.seq, op.seq); player.unstick(); return;
    }
    if (op.k === 'cr_need') { if (liveOn()) host.live.send({ k: 'cr_snap', world: world.save(), seq: live.seq }); return; }
    if (op.k === 'cr_pos' && from && op.p) { live.mates[from] = op.p; showMates(); }
  }
  function showMates() {
    if (!view) return; const ms = liveOn() && host.live.members ? host.live.members() : {}, me = host.live && host.live.me ? host.live.me() : null;
    for (const u of Object.keys(live.mates)) if (!ms[u] || u === me) delete live.mates[u];
    if (!comp.inRoom()) view.setMates(Object.keys(live.mates).map(u => ({ uid: u, name: ms[u].name, color: ms[u].color, ...live.mates[u] })));
  }
  setInterval(() => {
    if (!alive) return;
    if (!liveOn()) { if (Object.keys(live.mates).length) { live.mates = {}; if (view && !comp.inRoom()) view.setMates([]); } return; }
    const p = { x: +player.x.toFixed(2), y: +player.y.toFixed(2), z: +player.z.toFixed(2), yaw: +player.yaw.toFixed(2) }, k = JSON.stringify(p);
    if (k !== live.lastPos) { live.lastPos = k; host.live.send({ k: 'cr_pos', p }); }
  }, 400);
  let lastCode = null;
  const liveApi = {
    liveInit(doc) { // just joined: the room's world is in the project already; replay the changes made since it was saved
      live.seq = 0; live.pending = []; live.mates = {}; live.lastPos = '';
      if (!doc) return;
      for (const o of Array.isArray(doc.crLog) ? doc.crLog : []) if (o && o.seq > (doc.crWseq | 0) && Array.isArray(o.sets)) remoteSets(o.sets);
      live.seq = doc.crSeq | 0; player.unstick();
    },
    liveOp, liveMembers: showMates,
    liveParts() {
      const st = programState(true); if (st) lastCode = st;
      return { code: { blocks: lastCode || programState(true) }, maker: { maker: mk.save().maker }, time: { time: view ? view.time() : 'DAY' } };
    },
    liveSet(part, v) {
      if (!v || typeof v !== 'object') return;
      if (part === 'code' && v.blocks && typeof v.blocks === 'object') { lastCode = v.blocks; const cur = programState(true); if (!cur || JSON.stringify(cur) !== JSON.stringify(v.blocks)) { if (mode === 'python') { pyText = L.toPython(v.blocks); src.value = pyText; renderPy(); hidePyError(); } loadBlocks(v.blocks); } }
      else if (part === 'maker') mk.liveSet(v.maker);
      else if (part === 'time' && view && ['DAY', 'SUNSET', 'NIGHT'].includes(v.time)) view.setTime(v.time);
    },
    liveBusy: () => !!(ws && ws.isDragging && ws.isDragging()) || document.activeElement === src || comp.inRoom()
  };
  function sendCodeSoon() { if (!comp.canCode()) return; clearTimeout(codeSendT); codeSendT = setTimeout(() => { const st = programState(true); if (st) comp.codeChanged(st); }, 900); }
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
    const h = pick(px, py);
    if (mk.click(h, px, py)) return; // Make-mode tools, or talking to a character
    if (!h) return;
    const breaking = breakIt || slot === 0;
    if (!mk.canEdit(breaking ? 'break' : 'build')) { status(breaking ? 'Breaking blocks by hand is switched off in this world.' : 'Building by hand is switched off in this world — use code!', 'bad'); return; }
    snapshot();
    if (breaking) { if (h.y > 0 && !world.set(h.x, h.y, h.z, 0)) { undo.pop(); if (world.guard) status('That area is protected — it can’t be changed.', 'bad'); } }
    else {
      const x = h.x + h.nx, y = h.y + h.ny, z = h.z + h.nz, id = hot[slot - 1];
      if (y < 1 || !world.inside(x, y, z)) { undo.pop(); return; }
      if (isSolid(id) && Math.abs(x + 0.5 - player.x) < 0.8 && Math.abs(z + 0.5 - player.z) < 0.8 && y >= Math.floor(player.y) - 0 && y <= Math.floor(player.y + 1.7)) { undo.pop(); return; } // not inside you
      if (!world.set(x, y, z, id)) { undo.pop(); if (world.guard) status('That area is protected — it can’t be changed.', 'bad'); }
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
    if (mk.key(e)) { e.preventDefault(); return; }
    if (e.code === 'KeyT' || e.code === 'Enter' || e.code === 'Slash') { e.preventDefault(); $('crChat').focus(); return; }
    if (e.code === 'KeyF') { toggleFly(); return; }
    if (/^Digit[0-9]$/.test(e.code)) { slot = Math.min(hot.length, +e.code.slice(5)); renderHot(); return; }
    const k = KEYMAP[e.code]; if (k) { keys.add(k); e.preventDefault(); }
  });
  window.addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) keys.delete(k); });
  cv.addEventListener('blur', () => keys.clear());
  function toggleFly() { if (!flyOk && !player.fly) { status('Flying is switched off in this world.'); return; } player.fly = !player.fly; $('crFly').classList.toggle('on', player.fly); root.querySelector('#crPad2 [data-k="d"]').hidden = !player.fly; changed(); }
  $('crFly').onclick = toggleFly;
  root.querySelectorAll('.cr-cam[data-cam]').forEach(b => b.onclick = () => { cam = b.dataset.cam; root.querySelectorAll('.cr-cam[data-cam]').forEach(x => x.classList.toggle('on', x === b)); $('crView').classList.toggle('cam-helper', cam === 'helper'); });
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
    runner.tick(dt); mk.tick(dt);
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
      helper: { x: runner.helper.x, y: runner.helper.y, z: runner.helper.z, f: runner.helper.f }, time: view ? view.time() : 'DAY', hot: (savedHot || hot).slice(), ...mk.save() };
  }
  const num = (v, lo, hi, d) => { v = Number(v); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; };
  function loadBlocks(state, cleanUp) {
    if (!ws) return; quiet = true;
    Blockly.Events.setGroup('crload' + Date.now()); // Blockly fires events after a timeout, so quiet alone can't hide them
    try { ws.clear(); Blockly.serialization.workspaces.load(state || L.starterProgram(), ws); if (cleanUp) ws.cleanUp(); }
    catch (e) { ws.clear(); Blockly.serialization.workspaces.load(L.starterProgram(), ws); toast('Some blocks couldn’t be loaded, so the example is back.'); }
    finally { quiet = false; Blockly.Events.setGroup(false); }
    try { ws.scroll(20, 20); } catch (e) { /* hidden */ }
  }
  let pending = host.project || null;
  function setProject(p, opts) {
    p = p && typeof p === 'object' ? p : {}; opts = opts || {};
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
      savedHot = null; mk.load(p.maker, p.progress, opts);
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
    ws.addChangeListener(e => { if (quiet || e.isUiEvent || String(e.group || '').startsWith('crload') || (e.reason && e.reason.includes('cleanup'))) return; changed(); sendCodeSoon(); });
    view = createView(THREE, cv, world);
    setProject(pending); pending = null; mk.viewReady();
    $('crLoading').hidden = true; view.resize(); raf = requestAnimationFrame(tick);
  })().catch(e => { console.error(e); $('crLoading').textContent = 'The Build Lab needs the internet the first time it opens. Check your connection and try again.'; });

  return {
    ready, getProject, ...liveApi,
    setProject(p) { if (!ws) { pending = p; return; } comp.leave(true); setProject(p); mk.viewReady(); if (!raf && view) raf = requestAnimationFrame(tick); },
    resume() { if (view) view.resize(); if (ws) Blockly.svgResize(ws); if (!raf && view) raf = requestAnimationFrame(tick); },
    pause() { comp.leave(true); runner.stop(); keys.clear(); pad.clear(); cancelAnimationFrame(raf); raf = 0; },
    destroy() { comp.leave(true); alive = false; ro.disconnect(); cancelAnimationFrame(raf); runner.stop(); if (view) view.dispose(); if (ws) ws.dispose(); root.innerHTML = ''; },
    run, chat, setMode, openComp: code => comp.open(code), compPanel: () => comp.panel(), _comp: () => comp,
    _mk: () => mk, _world: () => world, _player: () => player, _runner: () => runner, _ws: () => ws, _view: () => view, _act: act, _pick: pick, _slot: n => { slot = n; renderHot(); }
  };
}
