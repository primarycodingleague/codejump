/* CodeJump · 3D World project type — the app: a Blockly editor on the left, the 3D world on the right,
 * Run / Stop, and on-screen buttons for tablets. Lazy-loaded by CodeJump (build-and-play.html: loadWorldEngine)
 * only when a 3D World project opens, and mounted into #world-ui. CodeJump owns saving and sharing:
 * getProject() goes into the payload (payload.world) and onChange() marks the project dirty.
 *
 *   const app = (await import('./world/world-app.js')).mount(rootEl, { project, onChange, toast });
 *   app.getProject() · app.setProject(p) · app.pause() · app.destroy()
 *
 * A project is { blocks: <Blockly JSON workspace> }. Uses the page's Blockly 10 (window.Blockly) plus
 * Blockly's JavaScript generator from vendor/, which world-blocks.js drives.
 */
import * as B from './vendor/babylon-world.min.js';
import { createWorld, keyName } from './world-runtime.js';
import * as WB from './world-blocks.js';

const CSS_URL = new URL('./world-app.css', import.meta.url).href;
const GEN_URL = new URL('./vendor/blockly-javascript-10.4.3.min.js', import.meta.url).href;

function ic(id) { return '<svg class="ic"><use href="#' + id + '"></use></svg>'; }

const TEMPLATE = `
<div class="w3">
  <div class="w3-blocks" id="w3Blocks" aria-label="Blocks editor"></div>
  <div class="w3-view">
    <div class="w3-bar">
      <button type="button" class="w3-run" id="w3Run" title="Run your program from the start">${ic('i-play')} Run</button>
      <button type="button" class="w3-stop" id="w3Stop" title="Stop everything">${ic('i-stop')} Stop</button>
      <span class="w3-status" id="w3Status" role="status" aria-live="polite"></span>
    </div>
    <div class="w3-canvas-wrap" id="w3Wrap">
      <canvas id="w3Canvas" tabindex="0" aria-label="Your 3D world. Drag to look around, scroll or pinch to zoom, click an object to fire its when-clicked blocks."></canvas>
      <div class="w3-loading" id="w3Loading">Getting the 3D world ready…</div>
      <div class="w3-tip" id="w3Tip">Drag to look around · scroll to zoom</div>
      <div class="w3-pad" id="w3Pad" hidden>
        <div class="w3-dpad">
          <button type="button" data-k="up" aria-label="Forward">▲</button>
          <div class="w3-mid"><button type="button" data-k="left" aria-label="Left">◀</button><button type="button" data-k="right" aria-label="Right">▶</button></div>
          <button type="button" data-k="down" aria-label="Back">▼</button>
        </div>
        <button type="button" class="w3-jump" data-k="space" aria-label="Jump">Jump</button>
      </div>
    </div>
  </div>
</div>`;

function loadScript(src) {
  return new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = src;
    s.onload = () => ok(); s.onerror = () => no(new Error('Could not load ' + src));
    document.head.appendChild(s);
  });
}

let genReady = null;
function loadGenerator() {
  if (window.javascript && window.javascript.javascriptGenerator) return Promise.resolve();
  if (!genReady) genReady = loadScript(GEN_URL).catch(e => { genReady = null; throw e; });
  return genReady;
}

let theme = null;
function cjTheme(Blockly) {
  if (!theme) theme = Blockly.Theme.defineTheme('codejump3d', {
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

export function mount(root, host) {
  host = host || {};
  if (!document.querySelector('link[data-world-css]')) {
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = CSS_URL; link.setAttribute('data-world-css', '');
    document.head.appendChild(link);
  }
  root.innerHTML = TEMPLATE;
  const $ = id => root.querySelector('#' + id);
  const Blockly = window.Blockly;
  const touchy = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  let ws = null, world = null, gen = null, alive = true, quiet = false, pendingProject = host.project || null, padWanted = false;
  let changeTimer = 0;

  function status(msg, kind) { const s = $('w3Status'); s.textContent = msg || ''; s.className = 'w3-status' + (kind ? ' ' + kind : ''); }
  function toast(msg) { if (host.toast) host.toast(msg); }
  function setPad(on) { padWanted = on; $('w3Pad').hidden = !(on && touchy); }

  // ── editor ──
  function loadProject(p) {
    quiet = true;
    try {
      ws.clear();
      const data = p && p.blocks && typeof p.blocks === 'object' ? p.blocks : WB.starterProgram();
      try { Blockly.serialization.workspaces.load(data, ws); } catch (e) {
        ws.clear(); Blockly.serialization.workspaces.load(WB.starterProgram(), ws);
        toast('Some blocks in this project couldn’t be loaded, so it starts from the example instead.');
      }
    } finally { quiet = false; }
    // start at the top-left of the program, where the "when Run is clicked" block sits
    try { const top = ws.getTopBlocks(true)[0]; if (top) { const xy = top.getRelativeToSurfaceXY(), sc = ws.scale; ws.scroll(-(xy.x * sc) + 20, -(xy.y * sc) + 20); } } catch (e) { /* hidden */ }
  }
  function getProject() { return ws ? { blocks: Blockly.serialization.workspaces.save(ws) } : pendingProject; }

  // ── running ──
  async function run() {
    if (!world || !ws) return;
    let code;
    try { code = WB.compile(Blockly, gen, ws); } catch (e) { status('Your blocks couldn’t be turned into a program: ' + e.message, 'bad'); return; }
    status('');
    $('w3Run').classList.add('on');
    const ok = await world.run(code);
    if (ok) status('Running', 'ok');
    $('w3Canvas').focus({ preventScroll: true });
  }
  function stop() { if (world) world.stop(); $('w3Run').classList.remove('on'); status('Stopped'); }

  // ── keyboard: only when you're not typing in a box or a Blockly field ──
  function keyTarget(e) {
    const t = e.target;
    if (!t || !t.closest) return true;
    if (t.closest('input,textarea,select,[contenteditable="true"],.blocklyWidgetDiv,.blocklyDropDownDiv')) return false;
    if (document.querySelector('#cj-dialog:not(.hide), [id$="-modal"]:not(.hide)')) return false; // a CodeJump popup is open
    return root.offsetParent !== null;
  }
  function onKey(e) {
    if (!world || !alive || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = keyName(e.key); if (!k || !keyTarget(e)) return;
    const down = e.type === 'keydown';
    if (world.running() && (k === 'space' || k === 'up' || k === 'down' || k === 'left' || k === 'right')) {
      // keep arrow keys / space for the game (no page scroll), unless focus is in the blocks editor
      if (!e.target.closest || !e.target.closest('.w3-blocks')) e.preventDefault();
      else return;
    } else if (e.target.closest && e.target.closest('.w3-blocks')) return;
    if (down && e.repeat) return;
    world.key(k, down);
  }
  document.addEventListener('keydown', onKey);
  document.addEventListener('keyup', onKey);
  window.addEventListener('blur', () => { if (world) for (const k of ['up', 'down', 'left', 'right', 'space', 'w', 'a', 's', 'd']) world.key(k, false); });

  root.querySelectorAll('.w3-pad button').forEach(b => {
    const k = b.getAttribute('data-k');
    const dn = e => { e.preventDefault(); if (world) world.pad(k, true); };
    const up = e => { e.preventDefault(); if (world) world.pad(k, false); };
    b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up);
  });
  $('w3Run').onclick = run;
  $('w3Stop').onclick = stop;

  const ro = new ResizeObserver(() => { if (world) world.resize(); if (ws) Blockly.svgResize(ws); });
  ro.observe($('w3Wrap')); ro.observe($('w3Blocks'));

  // ── start up: generator + Havok, then the editor and the world ──
  const ready = (async () => {
    await loadGenerator();
    gen = window.javascript.javascriptGenerator;
    WB.defineBlocks(Blockly, gen, window.javascript.Order);
    ws = Blockly.inject($('w3Blocks'), {
      toolbox: WB.toolbox(), renderer: 'zelos', theme: cjTheme(Blockly), scrollbars: true, trashcan: true,
      zoom: { controls: true, wheel: true, startScale: touchy ? 0.9 : 0.75, maxScale: 2.5, minScale: 0.35, scaleSpeed: 1.1 },
      grid: { spacing: 24, length: 3, colour: 'rgba(255,255,255,0.08)', snap: true }
    });
    // any value can go in any socket, like CodeJump's other editors (the runtime turns values into numbers/colours)
    try { ws.connectionChecker.doTypeChecks = () => true; } catch (e) { /* older Blockly */ }
    loadProject(pendingProject);
    ws.addChangeListener(e => {
      if (quiet || e.isUiEvent) return;
      clearTimeout(changeTimer); changeTimer = setTimeout(() => { if (alive && host.onChange) host.onChange(); }, 250);
    });

    let havok = null;
    try { havok = await B.HavokPhysics(); } catch (e) { toast('Physics couldn’t start, so things won’t fall or bump.'); }
    if (!alive) return;
    world = createWorld(B, { canvas: $('w3Canvas'), havok, onError: m => status(m, 'bad'), onPad: setPad });
    $('w3Loading').hidden = true;
    world.start(); world.resize();
    run();
  })().catch(e => {
    $('w3Loading').textContent = 'The 3D world needs the internet the first time it opens. Check your connection and try again.';
    console.error(e);
  });

  return {
    ready,
    getProject,
    setProject(p) {
      pendingProject = p || null;
      if (!ws) return;
      loadProject(pendingProject);
      if (world) { world.start(); world.resize(); Blockly.svgResize(ws); run(); }
    },
    resume() { if (world) { world.start(); world.resize(); } if (ws) Blockly.svgResize(ws); setPad(padWanted); },
    pause() { if (world) { world.stop(); world.pause(); } $('w3Run').classList.remove('on'); status(''); },
    destroy() {
      alive = false; ro.disconnect();
      document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKey);
      if (world) world.dispose(); if (ws) ws.dispose();
      root.innerHTML = '';
    },
    _world: () => world, _ws: () => ws
  };
}
