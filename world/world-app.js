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
const ASSETS = new URL('./assets/', import.meta.url).href;
const DRACO = new URL('./vendor/draco/', import.meta.url).href;

// The models are Draco-compressed: decode with our own copy of the decoder, not Babylon's CDN
if (B.DracoDecoder) B.DracoDecoder.DefaultConfiguration = { wasmUrl: DRACO + 'draco_wasm_wrapper_gltf.js', wasmBinaryUrl: DRACO + 'draco_decoder_gltf.wasm', fallbackUrl: DRACO + 'draco_decoder_gltf.js' };
async function loadAsset(path) {
  const res = await fetch(ASSETS + path);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.arrayBuffer();
}

function ic(id) { return '<svg class="ic"><use href="#' + id + '"></use></svg>'; }

const TEMPLATE = `
<div class="w3">
  <div class="w3-blocks" id="w3Blocks" aria-label="Blocks editor"></div>
  <div class="w3-view">
    <div class="w3-bar">
      <button type="button" class="w3-run" id="w3Run" title="Run your program from the start">${ic('i-play')} Run</button>
      <button type="button" class="w3-stop" id="w3Stop" title="Stop, and go back to how your world starts">${ic('i-stop')} Stop</button>
      <div class="w3-tools" id="w3Tools" role="radiogroup" aria-label="What dragging does">
        <button type="button" class="w3-tool on" data-tool="move" role="radio" aria-checked="true" title="Drag the arrows to move the thing you clicked">Move</button>
        <button type="button" class="w3-tool" data-tool="resize" role="radio" aria-checked="false" title="Drag the handles to make the thing you clicked bigger or smaller">Resize</button>
      </div>
      <span class="w3-status" id="w3Status" role="status" aria-live="polite"></span>
    </div>
    <div class="w3-canvas-wrap" id="w3Wrap">
      <canvas id="w3Canvas" tabindex="0" aria-label="Your 3D world. Drag to look around, scroll or pinch to zoom. Before you press Run, click a thing to move or resize it; while it runs, clicking fires its when-clicked blocks."></canvas>
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
  let changeTimer = 0, editTimer = 0, selBlock = null, tool = 'move', staleWarned = false;
  const GIZMO = 'w3gizmo';
  const EDIT_TIP = 'Click a thing to move it, or its block to find it. Press Run to play.';

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

  // ── running, and the edit view (the world as it starts, before you press Run) ──
  function compile() {
    try { return WB.compile(Blockly, gen, ws); } catch (e) { status('Your blocks couldn’t be turned into a program: ' + e.message, 'bad'); return null; }
  }
  function setMode(playing) {
    $('w3Run').classList.toggle('on', playing);
    $('w3Tools').hidden = playing;
    $('w3Tip').textContent = playing ? 'Drag to look around · scroll to zoom' : 'Click a thing to move it · drag empty space to look around';
  }
  async function run() {
    if (!world || !ws) return;
    clearTimeout(editTimer);
    const code = compile(); if (code == null) return;
    status(''); setMode(true); staleWarned = false;
    const ok = await world.run(code);
    if (ok && world.running()) status('Running', 'ok');
    $('w3Canvas').focus({ preventScroll: true });
  }
  async function edit() {
    if (!world || !ws) return;
    clearTimeout(editTimer);
    const code = compile(); if (code == null) return;
    setMode(false); status(EDIT_TIP);
    await world.run(code, { layout: true });
    world.setTool(tool);
    if (selBlock) pickBlock(selBlock, true);
  }
  function editSoon() { clearTimeout(editTimer); editTimer = setTimeout(() => { if (alive && world && world.editing()) edit(); }, 300); }
  function stop() { if (world) edit(); }

  // ── linking objects and blocks ──
  function deselectBlock() { try { const b = Blockly.common.getSelected(); if (b) b.unselect(); } catch (e) { /* none */ } }
  // a block was chosen in the editor (or its object was clicked): show its object with the gizmo
  function pickBlock(id, quietly) {
    const block = id && ws.getBlockById(id);
    if (!block || !WB.MAKERS.includes(block.type)) { selBlock = null; world.select(null); return; }
    selBlock = id;
    const made = world.objectsOfBlock(id);
    if (made.length === 1) { world.select(made[0]); if (!quietly) status(tool === 'move' ? 'Drag the arrows to move it.' : 'Drag the handles to resize it.'); return; }
    world.select(null);
    if (quietly) return;
    if (made.length > 1) status('This block makes ' + made.length + ' things (it’s inside a loop), so change its numbers instead.');
    else status('This block hasn’t made anything yet. Is it inside “when Run is clicked”?');
  }
  function onPick(objId) {
    if (!objId) { selBlock = null; world.select(null); deselectBlock(); status(EDIT_TIP); return; }
    const blockId = world.blockOf(objId), block = blockId && ws.getBlockById(blockId);
    if (!block) return;
    pickBlock(blockId);
    block.select();
    try { ws.centerOnBlock(blockId); } catch (e) { /* hidden */ }
  }
  // the gizmo moved or resized an object: write the new numbers into the block that made it
  const r1 = v => Math.round(v * 10) / 10;
  function numberIn(block, name) {
    const t = block.getInputTargetBlock(name);
    return t && t.type === 'math_number' ? t : null;
  }
  function onEdit(e) {
    const block = e.blockId && ws.getBlockById(e.blockId);
    if (!block) { edit(); return; }
    const set = changes => {
      Blockly.Events.setGroup(GIZMO + Date.now());
      try { for (const [nb, v] of changes) nb.setFieldValue(String(v), 'NUM'); } finally { Blockly.Events.setGroup(false); }
    };
    if (e.kind === 'move') {
      const axes = ['X', 'Y', 'Z'].map(a => [a, numberIn(block, a)]);
      if (axes.some(([, nb]) => !nb)) { status('Its position comes from other blocks, so change those instead.', 'bad'); edit(); return; }
      set(axes.map(([a, nb]) => {
        let v = r1(Number(nb.getFieldValue('NUM')) + e.delta[a.toLowerCase()]);
        if (a === 'Y') v = Math.max(0, v);
        return [nb, v];
      }));
      status('Moved. Press Run to play.', 'ok');
      return;
    }
    // resize: boxes stretch on each axis, round shapes keep their shape, models scale evenly
    const f = e.factor, even = (f.x + f.y + f.z) / 3, flat = (f.x + f.z) / 2;
    const plan = { w3_box: { W: f.x, H: f.y, D: f.z }, w3_sphere: { W: even }, w3_cylinder: { W: flat, H: f.y }, w3_cone: { W: flat, H: f.y },
      w3_capsule: { W: flat, H: f.y }, w3_character: { SCALE: even }, w3_object: { SCALE: even } }[block.type] || {};
    const changes = [];
    for (const k in plan) {
      const nb = numberIn(block, k);
      if (!nb) { status('Its size comes from other blocks, so change those instead.', 'bad'); edit(); return; }
      changes.push([nb, Math.max(0.1, r1(Number(nb.getFieldValue('NUM')) * plan[k]))]);
    }
    set(changes);
    status('Resized. Press Run to play.', 'ok');
    editSoon(); // rebuild it at its new size
  }

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
  root.querySelectorAll('.w3-tool').forEach(b => b.addEventListener('click', () => {
    tool = b.getAttribute('data-tool');
    root.querySelectorAll('.w3-tool').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', String(on)); });
    if (world) world.setTool(tool);
    if (selBlock) pickBlock(selBlock);
  }));

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
      if (quiet) return;
      if (e.isUiEvent) {
        if (e.type === Blockly.Events.SELECTED && world && world.editing() && e.newElementId !== selBlock) pickBlock(e.newElementId);
        return;
      }
      clearTimeout(changeTimer); changeTimer = setTimeout(() => { if (alive && host.onChange) host.onChange(); }, 250);
      if (!world || String(e.group || '').startsWith(GIZMO)) return; // the gizmo already moved it
      if (world.editing()) editSoon(); // the starting layout follows your blocks as you change them
      else if (world.running() && !staleWarned) { staleWarned = true; status('You changed your blocks: press Run to try them.'); }
    });

    let havok = null;
    try { havok = await B.HavokPhysics(); } catch (e) { toast('Physics couldn’t start, so things won’t fall or bump.'); }
    if (!alive) return;
    world = createWorld(B, { canvas: $('w3Canvas'), havok, loadAsset, onError: m => status(m, 'bad'), onPad: setPad, onPick, onEdit, gizmoScale: touchy ? 1.9 : 1.3,
      onLoading: n => {
        if (n > 0) { status('Loading models…'); return; }
        if ($('w3Status').textContent === 'Loading models…') { if (world && world.running()) status('Running', 'ok'); else status(EDIT_TIP); }
      } });
    $('w3Loading').hidden = true;
    world.start(); world.resize();
    edit();
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
      selBlock = null;
      if (world) { world.start(); world.resize(); Blockly.svgResize(ws); edit(); }
    },
    resume() {
      if (world) { world.start(); world.resize(); if (!world.running() && !world.editing()) edit(); }
      if (ws) Blockly.svgResize(ws);
      setPad(padWanted);
    },
    pause() { if (world) { world.stop(); world.pause(); } setMode(false); status(''); },
    destroy() {
      alive = false; ro.disconnect();
      document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKey);
      if (world) world.dispose(); if (ws) ws.dispose();
      root.innerHTML = '';
    },
    _world: () => world, _ws: () => ws
  };
}
