/* CodeJump · Train Lab project type — the app: build a track from pieces, put trains on it, give each train its own
 * blocks, then press Run and watch them go. Lazy-loaded by CodeJump (build-and-play.html: loadTrainLab) only when a Train
 * Lab project opens, and mounted into #train-ui. CodeJump owns saving and sharing: getProject() goes into the payload
 * (payload.train) and onChange() marks the project dirty.
 *
 *   const app = (await import('./train/train-app.js')).mount(rootEl, { project, onChange, toast, confirm });
 *   app.getProject() · app.setProject(p) · app.resume() · app.pause() · app.destroy()
 *
 * A project is train-model.js's { cols, rows, tiles, trains: [{ name, color, start, blocks }] }. Uses the page's Blockly 10.
 */
import * as TM from './train-model.js';
import * as TB from './train-blocks.js';
import { createRunner } from './train-runner.js';

const CSS_URL = new URL('./train-app.css', import.meta.url).href;
const ic = id => '<svg class="ic"><use href="#' + id + '"></use></svg>';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const okColour = c => (/^#[0-9a-f]{6}$/i.test(String(c || '')) ? String(c) : null);
const BOARDS = { small: [10, 7], medium: [13, 9], large: [16, 11] };
const KEYNAME = { ' ': 'space', ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };

const TEMPLATE = `
<div class="tl">
  <div class="tl-left">
    <div class="tl-trains" id="tlTrains" role="tablist" aria-label="Trains"></div>
    <div class="tl-blocks" id="tlBlocks" aria-label="Blocks editor for the chosen train"></div>
  </div>
  <div class="tl-view">
    <div class="tl-bar">
      <button type="button" class="tl-run" id="tlRun" title="Run every train's program">${ic('i-play')} Run</button>
      <button type="button" class="tl-stop" id="tlStop" title="Stop every train">${ic('i-stop')} Stop</button>
      <button type="button" class="tl-reset" id="tlReset" title="Put the trains back where they start">${ic('i-reset')} Reset</button>
      <span class="tl-status" id="tlStatus" role="status" aria-live="polite"></span>
    </div>
    <div class="tl-stage" id="tlStage">
      <canvas id="tlCanvas" tabindex="0" aria-label="The track. Pick a piece below and tap a square to lay it; tap it again to turn it. While the program runs, tap a train to start its when-tapped blocks."></canvas>
      <div class="tl-loading" id="tlLoading">Getting the Train Lab ready…</div>
    </div>
    <div class="tl-tools" id="tlTools"></div>
    <div class="tl-settings" id="tlSettings">
      <label>Name <input id="tlName" maxlength="14" autocomplete="off"></label>
      <label>Colour <input type="color" id="tlColour"></label>
      <button type="button" class="tl-small" id="tlDelTrain">${ic('i-trash')} Remove train</button>
      <label class="tl-board">Board <select id="tlBoard"><option value="small">small</option><option value="medium">medium</option><option value="large">large</option></select></label>
    </div>
  </div>
</div>`;

let theme = null;
function tlTheme(Blockly) {
  if (!theme) theme = Blockly.Theme.defineTheme('codejumpTrain', {
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

// ── sounds: a tiny Web Audio synth (no sound files)
let actx = null;
function audio() { if (!actx) { const A = window.AudioContext || window.webkitAudioContext; if (A) try { actx = new A(); } catch (e) { actx = null; } } if (actx && actx.state === 'suspended') actx.resume(); return actx; }
const SOUND_RECIPES = { // [start, dur, wave, fromHz, toHz, gain] or ['noise', start, dur, gain]
  horn: [[0, 0.7, 'sawtooth', 311, 311, 0.12], [0, 0.7, 'sawtooth', 392, 392, 0.12]],
  whistle: [[0, 0.25, 'sine', 1180, 1260, 0.25], [0.3, 0.6, 'sine', 1180, 1300, 0.25]],
  bell: [[0, 0.5, 'triangle', 1568, 1568, 0.35], [0.5, 0.5, 'triangle', 1568, 1568, 0.35]],
  chuff: [['noise', 0, 0.12, 0.4], ['noise', 0.22, 0.12, 0.35], ['noise', 0.44, 0.12, 0.4], ['noise', 0.66, 0.12, 0.35]],
  beep: [[0, 0.18, 'square', 880, 880, 0.2]],
  dingdong: [[0, 0.45, 'sine', 659, 659, 0.4], [0.45, 0.6, 'sine', 523, 523, 0.4]]
};
function playSound(name) {
  const r = SOUND_RECIPES[name]; if (!r) return 0;
  const len = Math.max(...r.map(x => (x[0] === 'noise' ? x[1] + x[2] : x[0] + x[1])));
  const ac = audio(); if (!ac) return len;
  const now = ac.currentTime + 0.02;
  for (const x of r) {
    const g = ac.createGain(); g.connect(ac.destination);
    if (x[0] === 'noise') {
      const [, st, du, gain] = x, n = Math.ceil(ac.sampleRate * du), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const src = ac.createBufferSource(); src.buffer = buf; src.connect(g); g.gain.value = gain; src.start(now + st);
    } else {
      const [st, du, wave, f0, f1, gain] = x, o = ac.createOscillator(); o.type = wave;
      o.frequency.setValueAtTime(f0, now + st); o.frequency.linearRampToValueAtTime(f1, now + st + du);
      g.gain.setValueAtTime(0, now + st); g.gain.linearRampToValueAtTime(gain, now + st + 0.02); g.gain.setValueAtTime(gain, now + st + du * 0.7);
      g.gain.linearRampToValueAtTime(0, now + st + du);
      o.connect(g); o.start(now + st); o.stop(now + st + du + 0.05);
    }
  }
  return len;
}

// ── drawing (shared by the board and the tool icons). Units: one tile = T pixels; (ox, oy) = the board's top-left.
const BED = '#4a4f5a', SLEEPER = '#a0764c', RAIL = '#dfe4ec';
function pathPts(c, r, a, b, n = 14) { const out = []; for (let i = 0; i <= n; i++) out.push(TM.pathPoint(c, r, a, b, i / n)); return out; }
function strokePts(g, pts, T, ox, oy, off) {
  g.beginPath();
  pts.forEach((p, i) => { const x = ox + (p.x - Math.sin(p.ang) * off) * T, y = oy + (p.y + Math.cos(p.ang) * off) * T; if (i) g.lineTo(x, y); else g.moveTo(x, y); });
  g.stroke();
}
export function drawPiece(g, T, ox, oy, c, r, piece, rot, snap, layer) {
  const paths = TM.piecePaths(piece, rot);
  g.lineCap = 'butt'; g.lineJoin = 'round';
  if (layer !== 'rails') {
    g.strokeStyle = BED; g.lineWidth = T * 0.46;
    for (const [a, b] of paths) strokePts(g, pathPts(c, r, a, b), T, ox, oy, 0);
    g.strokeStyle = SLEEPER; g.lineWidth = T * 0.07;
    for (const [a, b] of paths) {
      const len = TM.pathLen(a, b), n = Math.max(2, Math.round(len / 0.2));
      for (let i = 0; i < n; i++) {
        const p = TM.pathPoint(c, r, a, b, (i + 0.5) / n), nx = -Math.sin(p.ang) * 0.2, ny = Math.cos(p.ang) * 0.2;
        g.beginPath(); g.moveTo(ox + (p.x - nx) * T, oy + (p.y - ny) * T); g.lineTo(ox + (p.x + nx) * T, oy + (p.y + ny) * T); g.stroke();
      }
    }
    if (snap && TM.SNAPS[snap]) {
      const [a, b] = paths[0], p = TM.pathPoint(c, r, a, b, a < 0 || b < 0 ? 0.5 : 0.5);
      g.save(); g.translate(ox + p.x * T, oy + p.y * T); g.rotate(p.ang);
      g.fillStyle = TM.SNAPS[snap]; g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = Math.max(1, T * 0.02);
      for (const s of [-1, 1]) { g.beginPath(); g.roundRect(-T * 0.09, s > 0 ? T * 0.2 : -T * 0.34, T * 0.18, T * 0.14, T * 0.03); g.fill(); g.stroke(); }
      g.globalAlpha = 0.85; g.fillRect(-T * 0.07, -T * 0.2, T * 0.14, T * 0.4); g.restore();
    }
  }
  if (layer !== 'bed') {
    g.strokeStyle = RAIL; g.lineWidth = Math.max(1.2, T * 0.05);
    for (const [a, b] of paths) { const pts = pathPts(c, r, a, b); strokePts(g, pts, T, ox, oy, -0.12); strokePts(g, pts, T, ox, oy, 0.12); }
    if (piece === 'end') { // the buffer stop
      const [a, b] = paths[0], p = TM.pathPoint(c, r, a, b, 1);
      g.save(); g.translate(ox + p.x * T, oy + p.y * T); g.rotate(p.ang);
      g.fillStyle = '#d23b3b'; g.strokeStyle = '#3a0d0d'; g.lineWidth = Math.max(1, T * 0.03);
      g.beginPath(); g.roundRect(-T * 0.04, -T * 0.26, T * 0.12, T * 0.52, T * 0.03); g.fill(); g.stroke();
      g.fillStyle = '#ffd23a'; g.fillRect(-T * 0.02, -T * 0.06, T * 0.08, T * 0.12); g.restore();
    }
  }
}
function shade(hex, f) { const n = parseInt(hex.slice(1), 16); const ch = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f))); return 'rgb(' + ch(16) + ',' + ch(8) + ',' + ch(0) + ')'; }
export function drawTrain(g, T, x, y, ang, tr, opt = {}) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const L = T * 0.36, W = T * 0.19;
  if (tr.head) { // the headlight's beam
    const gr = g.createRadialGradient(L, 0, 0, L, 0, T * 0.55); gr.addColorStop(0, tr.head + 'aa'); gr.addColorStop(1, tr.head + '00');
    g.fillStyle = gr; g.beginPath(); g.moveTo(L, 0); g.arc(L, 0, T * 0.55, -0.45, 0.45); g.closePath(); g.fill();
  }
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.roundRect(-L + T * 0.03, -W + T * 0.04, 2 * L, 2 * W, W); g.fill();
  g.fillStyle = '#1b1d22'; for (const sx of [-0.2, 0.2]) for (const sy of [-1, 1]) g.fillRect(sx * T - T * 0.05, sy * W - (sy > 0 ? 0 : T * 0.04), T * 0.1, T * 0.04);
  g.fillStyle = tr.color; g.strokeStyle = shade(tr.color, 0.45); g.lineWidth = Math.max(1, T * 0.025);
  g.beginPath(); g.roundRect(-L, -W, 2 * L, 2 * W, [W * 0.5, W, W, W * 0.5]); g.fill(); g.stroke();
  g.fillStyle = shade(tr.color, 0.7); g.beginPath(); g.roundRect(-L * 0.78, -W * 0.62, L * 1.2, W * 1.24, W * 0.4); g.fill();
  g.fillStyle = '#bfe3ff'; g.beginPath(); g.roundRect(L * 0.46, -W * 0.62, L * 0.28, W * 1.24, W * 0.25); g.fill();
  g.fillStyle = tr.head || '#555'; g.beginPath(); g.arc(L * 0.94, 0, T * 0.045, 0, Math.PI * 2); g.fill();
  const top = tr.top || '#3a3d44';
  if (tr.top) { const gr = g.createRadialGradient(-L * 0.2, 0, 0, -L * 0.2, 0, T * 0.22); gr.addColorStop(0, tr.top + 'cc'); gr.addColorStop(1, tr.top + '00'); g.fillStyle = gr; g.beginPath(); g.arc(-L * 0.2, 0, T * 0.22, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = top; g.strokeStyle = '#111'; g.lineWidth = Math.max(1, T * 0.015); g.beginPath(); g.arc(-L * 0.2, 0, T * 0.065, 0, Math.PI * 2); g.fill(); g.stroke();
  g.restore();
  if (opt.ring) { g.save(); g.strokeStyle = '#ffd23a'; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath(); g.arc(x, y, T * 0.46, 0, Math.PI * 2); g.stroke(); g.restore(); }
  if (opt.label) {
    g.save(); g.font = '800 ' + Math.max(10, Math.round(T * 0.2)) + 'px Montserrat, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'bottom';
    const w = g.measureText(opt.label).width + 10, ty = y - T * 0.42;
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.beginPath(); g.roundRect(x - w / 2, ty - T * 0.26, w, T * 0.27, 6); g.fill();
    g.fillStyle = '#fff'; g.fillText(opt.label, x, ty - T * 0.02); g.restore();
  }
}

export function defaultProject() {
  return Object.assign(TM.starterTrack(), { trains: [{ name: 'Train 1', color: TM.TRAIN_COLOURS[0], start: { c: 6, r: 5, p: 0, rev: false }, blocks: TB.starterProgram() }] });
}

export function mount(root, host) {
  host = host || {};
  if (!document.querySelector('link[data-train-css]')) {
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = CSS_URL; link.setAttribute('data-train-css', '');
    document.head.appendChild(link);
  }
  root.innerHTML = TEMPLATE;
  const $ = id => root.querySelector('#' + id);
  const Blockly = window.Blockly;
  const touchy = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const canvas = $('tlCanvas'), g = canvas.getContext('2d');
  let proj = TM.cleanProject(host.project || defaultProject());
  if (!proj.trains.length) proj = TM.cleanProject(defaultProject());
  let sel = 0, ws = null, sim = null, runner = null, headless = [], alive = true, quiet = false, raf = 0, last = 0, changeTimer = 0;
  let tool = 'straight', lastRot = 0, hover = null, painting = null, undo = [], redo = [];
  const keys = new Set();

  const status = (msg, kind) => { const s = $('tlStatus'); s.textContent = msg || ''; s.className = 'tl-status' + (kind ? ' ' + kind : ''); };
  const changed = () => { clearTimeout(changeTimer); changeTimer = setTimeout(() => { if (alive && host.onChange) host.onChange(); }, 250); };
  const running = () => !!(runner && runner.running());
  const ask = async msg => (host.confirm ? !!(await host.confirm(msg)) : window.confirm(msg));

  // ── the simulator is rebuilt whenever the track or the trains change (the trains go back to their start)
  function rebuild() {
    if (runner) runner.stop(true);
    disposeHeadless();
    sim = TM.createSim(proj, { onEvent: (i, k, d) => { if (runner) runner.event(i, k, d); } });
    runner = createRunner(sim, {
      sound: playSound, keyDown: k => keys.has(k),
      onError: err => { console.error(err); status('Something went wrong in one of your scripts.', 'bad'); },
      onStop: () => { disposeHeadless(); status('Stopped. Press Run to go again, or Reset to put the trains back.'); }
    });
  }
  function disposeHeadless() { for (const w of headless) try { w.dispose(); } catch (e) { /* gone */ } headless = []; }

  // ── blocks: one workspace on screen, showing the chosen train's scripts
  const LOAD = 'tlload';
  function flush() { if (ws && proj.trains[sel]) proj.trains[sel].blocks = Blockly.serialization.workspaces.save(ws); }
  function loadBlocks() {
    if (!ws) return;
    const tr = proj.trains[sel];
    quiet = true; Blockly.Events.setGroup(LOAD);
    try {
      ws.clear();
      try { Blockly.serialization.workspaces.load(tr && tr.blocks ? tr.blocks : TB.newTrainProgram(), ws); }
      catch (e) { ws.clear(); Blockly.serialization.workspaces.load(TB.newTrainProgram(), ws); if (host.toast) host.toast('Some blocks for ' + (tr ? tr.name : 'this train') + ' couldn’t be loaded.'); }
    } finally { quiet = false; Blockly.Events.setGroup(false); }
    try { ws.scroll(20, 20); } catch (e) { /* hidden */ }
  }

  // ── the trains row (tabs) and the chosen train's settings
  function renderTrains() {
    const box = $('tlTrains');
    box.innerHTML = proj.trains.map((t, i) => `<button type="button" role="tab" aria-selected="${i === sel}" class="tl-tab${i === sel ? ' on' : ''}" data-i="${i}"><i style="background:${esc(t.color)}"></i>${esc(t.name)}${t.start ? '' : ' <small>(not on the track)</small>'}</button>`).join('') +
      (proj.trains.length < TM.MAX_TRAINS ? `<button type="button" class="tl-tab tl-add" id="tlAdd">${ic('i-plus')} Add a train</button>` : '');
    box.querySelectorAll('[data-i]').forEach(b => b.onclick = () => selectTrain(Number(b.dataset.i)));
    const add = $('tlAdd'); if (add) add.onclick = addTrain;
    const t = proj.trains[sel];
    $('tlName').value = t ? t.name : ''; $('tlColour').value = t ? t.color : '#e8453c';
    $('tlDelTrain').hidden = proj.trains.length < 2;
    $('tlBoard').value = Object.keys(BOARDS).find(k => BOARDS[k][0] === proj.cols && BOARDS[k][1] === proj.rows) || 'small';
  }
  function selectTrain(i) {
    if (i === sel || !proj.trains[i]) return;
    flush(); sel = i; loadBlocks(); renderTrains();
  }
  function addTrain() {
    if (proj.trains.length >= TM.MAX_TRAINS) return;
    flush();
    const used = new Set(proj.trains.map(t => t.color));
    const color = TM.TRAIN_COLOURS.find(c => !used.has(c)) || TM.TRAIN_COLOURS[proj.trains.length % TM.TRAIN_COLOURS.length];
    let n = proj.trains.length + 1; while (proj.trains.some(t => t.name === 'Train ' + n)) n++;
    proj.trains.push({ name: 'Train ' + n, color, start: null, blocks: TB.newTrainProgram() });
    sel = proj.trains.length - 1; loadBlocks(); rebuild(); renderTrains(); setTool('train'); changed();
    status('Now tap the track to put ' + proj.trains[sel].name + ' on it.');
  }
  async function deleteTrain() {
    if (proj.trains.length < 2) return;
    const t = proj.trains[sel];
    if (!(await ask('Remove ' + t.name + ' and its blocks?'))) return;
    proj.trains.splice(sel, 1); sel = Math.max(0, sel - 1); loadBlocks(); rebuild(); renderTrains(); changed();
  }

  // ── the tools under the board
  const TOOLS = [...TM.PIECE_KEYS.map(k => ['piece', k, TM.PIECES[k].name]), ...TM.SNAP_KEYS.map(k => ['snap', k, k + ' snap']), ['train', 'train', 'Put the train on the track'], ['erase', 'erase', 'Rubber']];
  function iconFor(kind, key) {
    const cv = document.createElement('canvas'), S = 40, d = Math.min(2, window.devicePixelRatio || 1); cv.width = cv.height = S * d; cv.style.width = cv.style.height = S + 'px';
    const c = cv.getContext('2d'); c.scale(d, d);
    if (kind === 'piece') { const rot = key === 'curve' ? 0 : key === 'end' ? 1 : key === 'straight' ? 1 : 0; drawPiece(c, S, 0, 0, 0, 0, key, rot, null); }
    else if (kind === 'snap') { drawPiece(c, S, 0, 0, 0, 0, 'straight', 1, key); }
    else if (kind === 'train') { drawPiece(c, S, 0, 0, 0, 0, 'straight', 1, null); drawTrain(c, S, S / 2, S / 2, 0, { color: proj.trains[sel] ? proj.trains[sel].color : '#e8453c', head: '#ffffff', top: null }); }
    else { c.strokeStyle = '#ffb0b0'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(10, 10); c.lineTo(30, 30); c.moveTo(30, 10); c.lineTo(10, 30); c.stroke(); }
    return cv;
  }
  function renderTools() {
    const box = $('tlTools'); box.innerHTML = '';
    const groups = [['Track', TOOLS.filter(t => t[0] === 'piece')], ['Colour snaps', TOOLS.filter(t => t[0] === 'snap')], ['', TOOLS.filter(t => t[0] === 'train' || t[0] === 'erase')]];
    for (const [title, list] of groups) {
      const grp = document.createElement('div'); grp.className = 'tl-tgroup';
      if (title) { const h = document.createElement('span'); h.className = 'tl-tlabel'; h.textContent = title; grp.appendChild(h); }
      for (const [kind, key, label] of list) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'tl-tool'; b.dataset.tool = key; b.title = label; b.setAttribute('aria-label', label);
        b.appendChild(iconFor(kind, key)); b.onclick = () => setTool(key); grp.appendChild(b);
      }
      box.appendChild(grp);
    }
    const ex = document.createElement('div'); ex.className = 'tl-tgroup';
    ex.innerHTML = `<button type="button" class="tl-small" id="tlUndo" title="Undo (Ctrl+Z)">${ic('i-undo')} Undo</button><button type="button" class="tl-small" id="tlRedo" title="Redo">${ic('i-redo')} Redo</button><button type="button" class="tl-small" id="tlClear" title="Take every piece off the board">${ic('i-trash')} Clear track</button>`;
    box.appendChild(ex);
    $('tlUndo').onclick = doUndo; $('tlRedo').onclick = doRedo; $('tlClear').onclick = clearTrack;
    setTool(tool);
  }
  function setTool(k) {
    tool = k;
    root.querySelectorAll('.tl-tool').forEach(b => b.classList.toggle('on', b.dataset.tool === k));
    const tb = root.querySelector('.tl-tool[data-tool="train"]'); if (tb) { tb.innerHTML = ''; tb.appendChild(iconFor('train')); }
  }

  // ── editing the track
  const key = (c, r) => c + ',' + r;
  const findTile = (c, r) => proj.tiles.findIndex(t => t[0] === c && t[1] === r);
  const snapshot = () => JSON.stringify({ tiles: proj.tiles, starts: proj.trains.map(t => t.start), cols: proj.cols, rows: proj.rows });
  function remember() { undo.push(snapshot()); if (undo.length > 80) undo.shift(); redo = []; }
  function restore(s) {
    const o = JSON.parse(s); proj.tiles = o.tiles; proj.cols = o.cols; proj.rows = o.rows;
    o.starts.forEach((st, i) => { if (proj.trains[i]) proj.trains[i].start = st; });
    afterEdit();
  }
  function doUndo() { if (running() || !undo.length) return; redo.push(snapshot()); restore(undo.pop()); }
  function doRedo() { if (running() || !redo.length) return; undo.push(snapshot()); restore(redo.pop()); }
  async function clearTrack() {
    if (running() || !proj.tiles.length) return;
    if (!(await ask('Take every piece off the board?'))) return;
    remember(); proj.tiles = []; for (const t of proj.trains) t.start = null; afterEdit();
  }
  function afterEdit() {
    // a train whose piece has gone (or changed) comes off the track
    const fixed = TM.cleanProject(proj);
    proj.tiles = fixed.tiles; proj.trains.forEach((t, i) => { t.start = fixed.trains[i] ? fixed.trains[i].start : null; });
    rebuild(); renderTrains(); changed();
  }
  function tileFromEvent(e) {
    const r = canvas.getBoundingClientRect(), L = layout();
    const x = (e.clientX - r.left - L.ox) / L.T, y = (e.clientY - r.top - L.oy) / L.T;
    const c = Math.floor(x), rr = Math.floor(y);
    return { c, r: rr, x, y, inside: c >= 0 && rr >= 0 && c < proj.cols && rr < proj.rows };
  }
  function applyTool(at, first) {
    if (!at.inside) return false;
    const i = findTile(at.c, at.r), tile = i >= 0 ? proj.tiles[i] : null;
    if (TM.PIECES[tool]) {
      if (tile && tile[2] === tool) { if (!first) return false; tile[3] = (tile[3] + 1) % 4; lastRot = tile[3]; return true; } // tap again = turn it
      if (tile) { tile[2] = tool; return true; }
      proj.tiles.push([at.c, at.r, tool, lastRot % 4, null]); return true;
    }
    if (TM.SNAPS[tool]) { if (!tile) return false; const nv = tile[4] === tool && first ? null : tool; if (tile[4] === nv) return false; tile[4] = nv; return true; }
    if (tool === 'erase') { if (!tile) return false; proj.tiles.splice(i, 1); return true; }
    if (tool === 'train' && first) {
      const t = proj.trains[sel]; if (!t || !tile) return false;
      const n = TM.PIECES[tile[2]].paths.length;
      const others = proj.trains.filter((o, j) => j !== sel && o.start && o.start.c === at.c && o.start.r === at.r);
      if (others.length) { if (host.toast) host.toast('There is already a train there.'); return false; }
      if (t.start && t.start.c === at.c && t.start.r === at.r) { // tap again: turn it round, then try the next path
        const k = t.start.p * 2 + (t.start.rev ? 1 : 0) + 1, kk = k % (n * 2);
        t.start = { c: at.c, r: at.r, p: Math.floor(kk / 2), rev: kk % 2 === 1 };
      } else t.start = { c: at.c, r: at.r, p: 0, rev: false };
      return true;
    }
    return false;
  }
  canvas.addEventListener('pointerdown', e => {
    audio(); // sounds may only start after a tap (iPad)
    const at = tileFromEvent(e);
    if (running()) { // tap a train
      for (let i = 0; i < sim.trains.length; i++) { const p = sim.pose(i); if (p && Math.hypot(p.x - at.x, p.y - at.y) < 0.45) { runner.tap(i); return; } }
      return;
    }
    if (!at.inside) return;
    canvas.setPointerCapture(e.pointerId);
    const before = snapshot();
    if (applyTool(at, true)) { undo.push(before); redo = []; afterEdit(); painting = { last: key(at.c, at.r), dirty: true }; }
    else painting = { last: key(at.c, at.r), dirty: false, before };
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', e => {
    const at = tileFromEvent(e); hover = at.inside ? at : null;
    if (!painting || running() || tool === 'train') return;
    const k = key(at.c, at.r); if (k === painting.last) return; painting.last = k;
    if (!painting.dirty && painting.before) { const b = painting.before; if (applyTool(at, false)) { undo.push(b); redo = []; painting.dirty = true; afterEdit(); } return; }
    if (applyTool(at, false)) afterEdit();
  });
  const endPaint = () => { painting = null; };
  canvas.addEventListener('pointerup', endPaint); canvas.addEventListener('pointercancel', endPaint);
  canvas.addEventListener('pointerleave', () => { hover = null; });
  canvas.addEventListener('contextmenu', e => { // right-click turns a piece
    e.preventDefault(); if (running()) return;
    const at = tileFromEvent(e), i = findTile(at.c, at.r); if (i < 0) return;
    remember(); proj.tiles[i][3] = (proj.tiles[i][3] + 1) % 4; afterEdit();
  });

  // ── the board
  function layout() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    const T = Math.max(8, Math.floor(Math.min(w / proj.cols, h / proj.rows)));
    return { T, ox: Math.floor((w - T * proj.cols) / 2), oy: Math.floor((h - T * proj.rows) / 2), w, h };
  }
  function draw() {
    const d = window.devicePixelRatio || 1, cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (!cw || !ch) return;
    if (canvas.width !== Math.round(cw * d) || canvas.height !== Math.round(ch * d)) { canvas.width = Math.round(cw * d); canvas.height = Math.round(ch * d); }
    g.setTransform(d, 0, 0, d, 0, 0);
    const { T, ox, oy, w, h } = layout();
    g.fillStyle = '#1c2a20'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2f5a3a'; g.beginPath(); g.roundRect(ox - 4, oy - 4, T * proj.cols + 8, T * proj.rows + 8, 10); g.fill();
    if (!running()) { // the grid shows while building
      g.strokeStyle = 'rgba(255,255,255,0.09)'; g.lineWidth = 1; g.beginPath();
      for (let c = 0; c <= proj.cols; c++) { g.moveTo(ox + c * T + 0.5, oy); g.lineTo(ox + c * T + 0.5, oy + proj.rows * T); }
      for (let r = 0; r <= proj.rows; r++) { g.moveTo(ox, oy + r * T + 0.5); g.lineTo(ox + proj.cols * T, oy + r * T + 0.5); }
      g.stroke();
    }
    for (const t of proj.tiles) drawPiece(g, T, ox, oy, t[0], t[1], t[2], t[3], t[4], 'bed');
    for (const t of proj.tiles) drawPiece(g, T, ox, oy, t[0], t[1], t[2], t[3], t[4], 'rails');
    if (hover && !running() && !touchy) {
      g.save(); g.globalAlpha = 0.45;
      if (TM.PIECES[tool] && findTile(hover.c, hover.r) < 0) drawPiece(g, T, ox, oy, hover.c, hover.r, tool, lastRot, null);
      g.restore();
      g.strokeStyle = 'rgba(255,210,58,0.8)'; g.lineWidth = 2; g.strokeRect(ox + hover.c * T + 1, oy + hover.r * T + 1, T - 2, T - 2);
    }
    const many = sim.trains.length > 1;
    sim.trains.forEach((tr, i) => {
      const p = sim.pose(i); if (!p) return;
      drawTrain(g, T, ox + p.x * T, oy + p.y * T, p.ang, tr, { ring: !running() && i === sel && many, label: many || !running() ? tr.name : '' });
    });
    if (!proj.tiles.length) {
      g.fillStyle = 'rgba(255,255,255,0.75)'; g.font = '800 16px Montserrat, sans-serif'; g.textAlign = 'center';
      g.fillText('Pick a track piece below, then tap the board to lay it.', w / 2, h / 2);
    }
  }
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
    if (runner && runner.running()) runner.tick(dt);
    $('tlRun').classList.toggle('on', running());
    root.querySelector('.tl').classList.toggle('playing', running());
    draw();
  }

  function run() {
    audio();
    if (!ws) return;
    flush(); rebuild();
    if (!sim.trains.some(t => t.on)) { status('Put a train on the track first: pick the train tool and tap the track.', 'bad'); return; }
    headless = proj.trains.map(t => {
      const w = new Blockly.Workspace();
      try { Blockly.serialization.workspaces.load(t.blocks || TB.newTrainProgram(), w); } catch (e) { /* an empty program */ }
      return w;
    });
    runner.start(headless);
    status('Running · tap a train', 'ok');
    canvas.focus({ preventScroll: true });
  }
  function stop() { if (runner) runner.stop(); }
  function reset() { if (runner) runner.stop(true); disposeHeadless(); rebuild(); status('Press Run to start the trains.'); }

  function typing(e) { const t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable); }
  function onKey(e) {
    if (!alive || !root.offsetParent || typing(e)) return;
    if (e.type === 'keydown' && (e.ctrlKey || e.metaKey) && !running() && document.activeElement === canvas) {
      if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); if (e.shiftKey) doRedo(); else doUndo(); }
      else if (e.key === 'y') { e.preventDefault(); doRedo(); }
      return;
    }
    if (!running()) return;
    const k = KEYNAME[e.key] || (e.key && e.key.length === 1 ? e.key.toLowerCase() : null); if (!k) return;
    if (e.type === 'keydown') { if (!keys.has(k)) runner.key(k); keys.add(k); if (k === 'space' || KEYNAME[e.key]) e.preventDefault(); }
    else keys.delete(k);
  }
  document.addEventListener('keydown', onKey); document.addEventListener('keyup', onKey);

  $('tlRun').onclick = run; $('tlStop').onclick = stop; $('tlReset').onclick = reset;
  $('tlName').addEventListener('input', () => { const t = proj.trains[sel]; if (!t) return; t.name = TM.cleanName($('tlName').value) || 'Train ' + (sel + 1); if (sim.trains[sel]) sim.trains[sel].name = t.name; renderTrainsSoon(); changed(); });
  $('tlColour').addEventListener('input', () => { const t = proj.trains[sel]; if (!t || !okColour($('tlColour').value)) return; t.color = $('tlColour').value; if (sim.trains[sel]) sim.trains[sel].color = t.color; renderTrainsSoon(); setTool(tool); changed(); });
  let rtTimer = 0; function renderTrainsSoon() { clearTimeout(rtTimer); rtTimer = setTimeout(() => { const f = document.activeElement; renderTrains(); if (f && root.contains(f)) f.focus(); }, 300); }
  $('tlDelTrain').onclick = deleteTrain;
  $('tlBoard').onchange = async () => {
    if (running()) { renderTrains(); return; }
    const [cols, rows] = BOARDS[$('tlBoard').value] || BOARDS.small;
    if (proj.tiles.some(t => t[0] >= cols || t[1] >= rows) && !(await ask('Some of your track is outside a board that size and will be taken off. Change the board?'))) { renderTrains(); return; }
    remember(); proj.cols = cols; proj.rows = rows; afterEdit();
  };

  const ro = new ResizeObserver(() => { if (ws) Blockly.svgResize(ws); });
  ro.observe($('tlBlocks'));

  rebuild(); renderTrains(); renderTools();
  const ready = (async () => {
    if (!defined) { TB.defineBlocks(Blockly); defined = true; }
    ws = Blockly.inject($('tlBlocks'), {
      toolbox: TB.toolbox(), renderer: 'zelos', theme: tlTheme(Blockly), scrollbars: true, trashcan: true, media: 'https://unpkg.com/blockly@10.4.3/media/',
      zoom: { controls: true, wheel: true, startScale: touchy ? 0.85 : 0.72, maxScale: 2.5, minScale: 0.35, scaleSpeed: 1.1 },
      grid: { spacing: 24, length: 3, colour: 'rgba(255,255,255,0.08)', snap: true }
    });
    try { ws.connectionChecker.doTypeChecks = () => true; } catch (e) { /* older Blockly */ }
    loadBlocks();
    ws.addChangeListener(e => {
      if (quiet || e.isUiEvent || String(e.group || '').startsWith(LOAD)) return;
      changed();
      if (running()) status('You changed your blocks: press Run to try them.');
    });
    $('tlLoading').hidden = true;
    raf = requestAnimationFrame(tick);
    status('Press Run to start the trains.');
  })().catch(e => { $('tlLoading').textContent = 'The Train Lab could not start. Check your connection and try again.'; console.error(e); });

  function getProject() {
    flush();
    return JSON.parse(JSON.stringify({ cols: proj.cols, rows: proj.rows, tiles: proj.tiles, trains: proj.trains }));
  }
  return {
    ready,
    getProject,
    setProject(p) {
      if (runner) runner.stop(true);
      proj = TM.cleanProject(p || defaultProject()); if (!proj.trains.length) proj = TM.cleanProject(defaultProject());
      sel = 0; undo = []; redo = [];
      rebuild(); renderTrains(); renderTools(); loadBlocks();
      status('Press Run to start the trains.');
      if (!raf && ws) raf = requestAnimationFrame(tick); // reopening after pause() must restart the loop, or Run does nothing
    },
    resume() { if (ws) Blockly.svgResize(ws); if (!raf && ws) raf = requestAnimationFrame(tick); },
    pause() { if (runner) runner.stop(true); disposeHeadless(); cancelAnimationFrame(raf); raf = 0; },
    destroy() {
      alive = false; ro.disconnect(); cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKey);
      if (runner) runner.stop(true); disposeHeadless(); if (ws) ws.dispose();
      root.innerHTML = '';
    },
    run, stop, reset, setTool, selectTrain,
    _sim: () => sim, _runner: () => runner, _ws: () => ws, _proj: () => proj, _tap: (c, r) => { const before = snapshot(); if (!running() && applyTool({ c, r, inside: c >= 0 && r >= 0 && c < proj.cols && r < proj.rows }, true)) { undo.push(before); redo = []; afterEdit(); return true; } return false; }
  };
}
