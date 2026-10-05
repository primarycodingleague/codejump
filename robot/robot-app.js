/* CodeJump · Robot Lab project type — the app: a Blockly editor on the left, the 3D robot on the right, Run / Stop /
 * Reset, and the robot's name and colours. Lazy-loaded by CodeJump (build-and-play.html: loadRobotLab) only when a
 * Robot Lab project opens, and mounted into #robot-ui. CodeJump owns saving and sharing: getProject() goes into the
 * payload (payload.robot) and onChange() marks the project dirty.
 *
 *   const app = (await import('./robot/robot-app.js')).mount(rootEl, { project, onChange, toast });
 *   app.getProject() · app.setProject(p) · app.resume() · app.pause() · app.destroy()
 *
 * A project is { blocks: <Blockly JSON workspace>, name, body, trim }. Uses the page's Blockly 10 (window.Blockly) and the
 * Three.js bundle the Critter Lab already ships.
 */
import * as THREE from '../critter/vendor/three-0.186.1-critter.min.js';
import { createRobotView } from './robot-model.js';
import * as RB from './robot-blocks.js';
import { createRunner } from './robot-runner.js';

const CSS_URL = new URL('./robot-app.css', import.meta.url).href;
const DEF = { name: 'Sparky', body: '#eef2f6', trim: '#2b6fd8' };
const ic = id => '<svg class="ic"><use href="#' + id + '"></use></svg>';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const okColour = c => (/^#[0-9a-f]{6}$/i.test(String(c || '')) ? String(c) : null);
const cleanName = n => String(n || '').replace(/[<>]/g, '').trim().slice(0, 14);

const TEMPLATE = `
<div class="rb">
  <div class="rb-blocks" id="rbBlocks" aria-label="Blocks editor"></div>
  <div class="rb-view">
    <div class="rb-bar">
      <button type="button" class="rb-run" id="rbRun" title="Run your program">${ic('i-play')} Run</button>
      <button type="button" class="rb-stop" id="rbStop" title="Stop every script">${ic('i-stop')} Stop</button>
      <button type="button" class="rb-reset" id="rbReset" title="Put the robot back how it started">${ic('i-reset')} Reset</button>
      <span class="rb-status" id="rbStatus" role="status" aria-live="polite"></span>
    </div>
    <div class="rb-stage" id="rbStage">
      <canvas id="rbCanvas" tabindex="0" aria-label="Your robot. Drag to look around it, scroll or pinch to zoom. While your program runs, tap the robot to start its when-tapped blocks."></canvas>
      <div class="rb-loading" id="rbLoading">Getting the robot ready…</div>
      <div class="rb-bubble" id="rbBubble" hidden></div>
      <form class="rb-ask" id="rbAsk" hidden><label for="rbAnswer" id="rbAskQ"></label><div><input id="rbAnswer" autocomplete="off" maxlength="200"><button type="submit">OK</button></div></form>
    </div>
    <div class="rb-settings">
      <label>Name <input id="rbName" maxlength="14" autocomplete="off"></label>
      <label>Body <input type="color" id="rbBody"></label>
      <label>Trim <input type="color" id="rbTrim"></label>
    </div>
  </div>
</div>`;

let theme = null;
function rbTheme(Blockly) {
  if (!theme) theme = Blockly.Theme.defineTheme('codejumpRobot', {
    base: Blockly.Themes.Zelos || Blockly.Themes.Classic,
    fontStyle: { family: "'Montserrat', sans-serif", weight: '600', size: 11 },
    componentStyles: {
      workspaceBackgroundColour: '#1e1e1e', toolboxBackgroundColour: '#2a2a2a', toolboxForegroundColour: '#fff',
      flyoutBackgroundColour: '#252526', flyoutForegroundColour: '#ccc', flyoutOpacity: 1, scrollbarColour: '#797979',
      insertionMarkerColour: '#fff', insertionMarkerOpacity: 0.3, scrollbarOpacity: 0.4, cursorColour: '#d0d0d0'
    }
  });
  return theme;
}
let defined = false;

// the browser's own speech (no account, nothing sent anywhere by us); null when there is none
function speak(text, v, onEnd) {
  const S = window.speechSynthesis; if (!S || typeof SpeechSynthesisUtterance === 'undefined') return null;
  try {
    S.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const vs = S.getVoices(); const en = vs.find(x => /en-GB/i.test(x.lang)) || vs.find(x => /^en/i.test(x.lang)); if (en) u.voice = en;
    u.pitch = v.pitch; u.rate = v.rate; u.onend = u.onerror = () => onEnd();
    S.speak(u);
    return { cancel() { u.onend = u.onerror = null; S.cancel(); } };
  } catch (e) { return null; }
}
const KEYNAME = { ' ': 'space', ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };

export function mount(root, host) {
  host = host || {};
  if (!document.querySelector('link[data-robot-css]')) {
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = CSS_URL; link.setAttribute('data-robot-css', '');
    document.head.appendChild(link);
  }
  root.innerHTML = TEMPLATE;
  const $ = id => root.querySelector('#' + id);
  const Blockly = window.Blockly;
  const touchy = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  let ws = null, view = null, runner = null, alive = true, quiet = false, raf = 0, last = 0;
  let proj = Object.assign({}, DEF, host.project || {});
  let changeTimer = 0;
  const keys = new Set(), mouse = { x: 5, y: 5 };
  let askCb = null;

  const status = (msg, kind) => { const s = $('rbStatus'); s.textContent = msg || ''; s.className = 'rb-status' + (kind ? ' ' + kind : ''); };
  const changed = () => { clearTimeout(changeTimer); changeTimer = setTimeout(() => { if (alive && host.onChange) host.onChange(); }, 250); };
  function restyle() { if (!view) return; view.setBody(okColour(proj.body) || DEF.body); view.setAccent(okColour(proj.trim) || DEF.trim); view.setName(proj.name || DEF.name); }
  function showSettings() { $('rbName').value = proj.name || ''; $('rbBody').value = okColour(proj.body) || DEF.body; $('rbTrim').value = okColour(proj.trim) || DEF.trim; }

  function loadBlocks(p) {
    quiet = true;
    try {
      ws.clear();
      const data = p && p.blocks && typeof p.blocks === 'object' ? p.blocks : RB.starterProgram(proj.name || DEF.name);
      try { Blockly.serialization.workspaces.load(data, ws); } catch (e) {
        ws.clear(); Blockly.serialization.workspaces.load(RB.starterProgram(proj.name || DEF.name), ws);
        if (host.toast) host.toast('Some blocks in this project couldn’t be loaded, so it starts from the example instead.');
      }
    } finally { quiet = false; }
    try { ws.scroll(20, 20); } catch (e) { /* hidden */ }
  }
  function getProject() {
    return { blocks: ws ? Blockly.serialization.workspaces.save(ws) : (proj.blocks || null), name: cleanName(proj.name) || DEF.name,
      body: okColour(proj.body) || DEF.body, trim: okColour(proj.trim) || DEF.trim };
  }

  // speech bubble + ask box
  function bubble(text) { const b = $('rbBubble'); b.textContent = text || ''; b.hidden = !text; }
  function ask(q, cb) { askCb = cb; $('rbAskQ').textContent = q; $('rbAnswer').value = ''; $('rbAsk').hidden = false; setTimeout(() => $('rbAnswer').focus(), 30); }
  function cancelAsk() { if (askCb) { const cb = askCb; askCb = null; cb(''); } $('rbAsk').hidden = true; }
  $('rbAsk').addEventListener('submit', e => { e.preventDefault(); const cb = askCb; askCb = null; $('rbAsk').hidden = true; if (cb) cb($('rbAnswer').value); $('rbCanvas').focus(); });

  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
    if (runner) runner.tick(dt);
    const on = runner && runner.running();
    $('rbRun').classList.toggle('on', !!on);
  }
  function run() {
    if (!ws || !view) return;
    cancelAsk(); view.reset(true); restyle();
    runner.start(ws);
    status('Running · tap the robot', 'ok');
    $('rbCanvas').focus({ preventScroll: true });
  }
  function stop() { if (runner) runner.stop(); }
  function reset() { if (runner) runner.stop(true); cancelAsk(); if (view) { view.reset(false); restyle(); } status('Press Run to start your program.'); }

  // keys go to the program only while it runs and you're not typing
  function typing(e) { const t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable); }
  function onKey(e) {
    if (!alive || !root.offsetParent || typing(e) || !runner || !runner.running()) return;
    const k = KEYNAME[e.key] || (e.key && e.key.length === 1 ? e.key.toLowerCase() : null); if (!k) return;
    if (e.type === 'keydown') { if (!keys.has(k)) runner.key(k); keys.add(k); if (k === 'space' || KEYNAME[e.key]) e.preventDefault(); }
    else keys.delete(k);
  }
  document.addEventListener('keydown', onKey); document.addEventListener('keyup', onKey);
  $('rbCanvas').addEventListener('pointermove', e => { const r = e.target.getBoundingClientRect(); mouse.x = Math.max(0, Math.min(10, (e.clientX - r.left) / r.width * 10)); mouse.y = Math.max(0, Math.min(10, 10 - (e.clientY - r.top) / r.height * 10)); });

  $('rbRun').onclick = run; $('rbStop').onclick = stop; $('rbReset').onclick = reset;
  $('rbName').addEventListener('input', () => { proj.name = cleanName($('rbName').value); if (view) view.setName(proj.name || DEF.name); changed(); });
  $('rbBody').addEventListener('input', () => { proj.body = $('rbBody').value; restyle(); changed(); });
  $('rbTrim').addEventListener('input', () => { proj.trim = $('rbTrim').value; restyle(); changed(); });

  const ro = new ResizeObserver(() => { if (view) view.resize(); if (ws) Blockly.svgResize(ws); });
  ro.observe($('rbStage')); ro.observe($('rbBlocks'));

  const ready = (async () => {
    if (!defined) { RB.defineBlocks(Blockly); defined = true; }
    ws = Blockly.inject($('rbBlocks'), {
      toolbox: RB.toolbox(), renderer: 'zelos', theme: rbTheme(Blockly), scrollbars: true, trashcan: true, media: 'https://unpkg.com/blockly@10.4.3/media/',
      zoom: { controls: true, wheel: true, startScale: touchy ? 0.85 : 0.72, maxScale: 2.5, minScale: 0.35, scaleSpeed: 1.1 },
      grid: { spacing: 24, length: 3, colour: 'rgba(255,255,255,0.08)', snap: true }
    });
    try { ws.connectionChecker.doTypeChecks = () => true; } catch (e) { /* older Blockly */ }
    loadBlocks(proj);
    ws.addChangeListener(e => {
      if (quiet || e.isUiEvent) return;
      changed();
      if (runner && runner.running()) status('You changed your blocks: press Run to try them.');
    });
    const OrbitControls = THREE.OrbitControls || null;
    view = createRobotView(THREE, $('rbCanvas'), { controls: OrbitControls, name: proj.name || DEF.name, onPick: part => { if (runner) runner.tap(part); } });
    runner = createRunner(view, {
      speak, bubble, ask, cancelAsk, restyle,
      keyDown: k => keys.has(k), mouse: () => mouse,
      onError: err => { console.error(err); status('Something went wrong in one of your scripts.', 'bad'); },
      onStop: () => status('Stopped. Press Run to start again, or Reset to put the robot back.')
    });
    restyle(); showSettings();
    $('rbLoading').hidden = true;
    view.start(); view.resize(); raf = requestAnimationFrame(tick);
    status('Press Run to start your program.');
  })().catch(e => { $('rbLoading').textContent = 'The Robot Lab needs the internet the first time it opens. Check your connection and try again.'; console.error(e); });

  return {
    ready,
    getProject,
    setProject(p) {
      proj = Object.assign({}, DEF, p || {}); proj.name = cleanName(proj.name) || DEF.name;
      if (runner) runner.stop(true);
      if (ws) loadBlocks(proj);
      if (view) { view.reset(true); restyle(); }
      showSettings();
    },
    resume() { if (view) { view.start(); view.resize(); } if (ws) Blockly.svgResize(ws); if (!raf) raf = requestAnimationFrame(tick); },
    pause() { if (runner) runner.stop(true); cancelAsk(); if (view) view.stop(); cancelAnimationFrame(raf); raf = 0; },
    destroy() {
      alive = false; ro.disconnect(); cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKey);
      if (runner) runner.stop(true); if (view) view.dispose(); if (ws) ws.dispose();
      root.innerHTML = '';
    },
    _view: () => view, _runner: () => runner, _ws: () => ws, run, stop, reset
  };
}
