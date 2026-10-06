/* CodeJump · Train Lab project type — the app: build a track from pieces, put trains on it, give each train its own
 * blocks, then press Run and watch them go. Lazy-loaded by CodeJump (build-and-play.html: loadTrainLab) only when a Train
 * Lab project opens, and mounted into #train-ui. CodeJump owns saving and sharing: getProject() goes into the payload
 * (payload.train) and onChange() marks the project dirty.
 *
 *   const app = (await import('./train/train-app.js')).mount(rootEl, { project, onChange, toast, confirm });
 *   app.getProject() · app.setProject(p) · app.resume() · app.pause() · app.destroy()
 *
 * A project is train-model.js's { v: 2, pieces, trains: [{ name, color, start }], blocks }: ONE program, with a block category per
 * train (like the smart train's Scratch extension). Uses the page's Blockly 10.
 */
import * as TM from './train-model.js';
import * as TB from './train-blocks.js';
import { createRunner } from './train-runner.js';

const CSS_URL = new URL('./train-app.css', import.meta.url).href;
const ic = id => '<svg class="ic"><use href="#' + id + '"></use></svg>';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const okColour = c => (/^#[0-9a-f]{6}$/i.test(String(c || '')) ? String(c) : null);
const KEYNAME = { ' ': 'space', ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };

const TEMPLATE = `
<div class="tl">
  <div class="tl-left">
    <div class="tl-trains" id="tlTrains" role="tablist" aria-label="Trains"></div>
    <div class="tl-blocks" id="tlBlocks" aria-label="Blocks editor"></div>
  </div>
  <div class="tl-view">
    <div class="tl-bar">
      <button type="button" class="tl-run" id="tlRun" title="Run every train's program">${ic('i-play')} Run</button>
      <button type="button" class="tl-stop" id="tlStop" title="Stop every train">${ic('i-stop')} Stop</button>
      <button type="button" class="tl-reset" id="tlReset" title="Put the trains back where they start">${ic('i-reset')} Reset</button>
      <span class="tl-status" id="tlStatus" role="status" aria-live="polite"></span>
    </div>
    <div class="tl-stage" id="tlStage">
      <canvas id="tlCanvas" tabindex="0" aria-label="The track. Pick a piece below and tap a blue plus at the end of the track to click it on; tap a piece to turn it."></canvas>
      <div class="tl-loading" id="tlLoading">Getting the Train Lab ready…</div>
    </div>
    <div class="tl-tools" id="tlTools"></div>
    <div class="tl-settings" id="tlSettings">
      <label>Name <input id="tlName" maxlength="14" autocomplete="off"></label>
      <label>Colour <input type="color" id="tlColour"></label>
      <button type="button" class="tl-small" id="tlDelTrain">${ic('i-trash')} Remove train</button>
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

// ── drawing. World units: a straight piece is 1 long; T = pixels per unit; (ox, oy) = where world (0, 0) is on screen.
// The look of a smart-train set: slim black track with two white dashed lines down the middle and a round jigsaw joint
// where pieces meet; square colour snaps over the dashes; splits with their built-in colour markers; a light play mat;
// a white engine with a coloured top, side windows and lights on its roof.
const TRACK = '#1f2024', SEAM = '#55575e', DASH = '#ffffff', TW = 0.24, SNAP = 0.105;
const sample = (pth, u0 = 0, u1 = 1) => { const n = pth.len > 1.01 || pth.at(0.5).ang !== pth.at(0).ang ? 14 : 2, out = []; for (let i = 0; i <= n; i++) out.push(pth.at(u0 + (u1 - u0) * i / n)); return out; };
function strokePts(g, pts, T, ox, oy, off) {
  g.beginPath();
  pts.forEach((p, i) => { const x = ox + (p.x - Math.sin(p.ang) * off) * T, y = oy + (p.y + Math.cos(p.ang) * off) * T; if (i) g.lineTo(x, y); else g.moveTo(x, y); });
  g.stroke();
}
function tint(hex, f) { const n = parseInt(hex.slice(1), 16); const ch = s => Math.round(((n >> s) & 255) + (255 - ((n >> s) & 255)) * f); return 'rgb(' + ch(16) + ',' + ch(8) + ',' + ch(0) + ')'; }
function shade(hex, f) { const n = parseInt(hex.slice(1), 16); const ch = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f))); return 'rgb(' + ch(16) + ',' + ch(8) + ',' + ch(0) + ')'; }
// one snap, centred at screen (x, y) and turned to the track's direction (ghost = a see-through preview)
export function drawSnap(g, T, x, y, ang, col, ghost) {
  const s = T * SNAP;
  g.save(); g.translate(x, y); g.rotate(ang); if (ghost) g.globalAlpha = 0.55;
  g.fillStyle = TM.SNAPS[col]; g.strokeStyle = col === 'white' ? '#a3a9b2' : shade(TM.SNAPS[col], 0.65); g.lineWidth = Math.max(0.8, T * 0.008);
  g.beginPath(); g.roundRect(-s / 2, -s / 2, s, s, s * 0.12); g.fill(); g.stroke();
  g.restore();
}
// the slots of a piece: [{x, y, ang, k}] (a split's one slot is its steering choice)
export function slotPoints(geom) {
  const def = TM.PIECES[geom.t], p0 = geom.paths[0];
  return def.slots.map((u, k) => Object.assign(p0.at(u), { k }));
}
// layer 'bed' = the black track (drawn first for every piece), 'top' = dashes, joints, markers and snaps
export function drawPiece(g, T, ox, oy, geom, snaps, layer) {
  const def = TM.PIECES[geom.t];
  g.lineCap = 'butt'; g.lineJoin = 'round';
  if (layer !== 'top') {
    g.strokeStyle = 'rgba(30,45,60,0.16)'; g.lineWidth = T * (TW + 0.03);
    for (const pth of geom.paths) strokePts(g, sample(pth), T, ox + T * 0.015, oy + T * 0.025, 0);
    g.strokeStyle = TRACK; g.lineWidth = T * TW;
    for (const pth of geom.paths) strokePts(g, sample(pth), T, ox, oy, 0);
  }
  if (layer === 'bed') return;
  // the white dashes (on a split, only where the two tracks have parted; the markers and slot sit before that)
  g.strokeStyle = DASH; g.lineWidth = Math.max(0.8, T * 0.016); g.setLineDash([T * 0.055, T * 0.042]);
  geom.paths.forEach(pth => { const pts = sample(pth, def.marks ? 0.47 : 0, 1); strokePts(g, pts, T, ox, oy, -0.042); strokePts(g, pts, T, ox, oy, 0.042); });
  g.setLineDash([]);
  // jigsaw joints at the ends
  g.strokeStyle = SEAM; g.lineWidth = Math.max(0.8, T * 0.012);
  for (const E of geom.ends) {
    const nx = -Math.sin(E.h) * TW / 2, ny = Math.cos(E.h) * TW / 2, x = ox + E.x * T, y = oy + E.y * T;
    g.beginPath(); g.moveTo(x - nx * T, y - ny * T); g.lineTo(x + nx * T, y + ny * T); g.stroke();
    g.beginPath(); g.arc(x - Math.cos(E.h) * T * 0.035, y - Math.sin(E.h) * T * 0.035, T * 0.035, E.h - Math.PI / 2, E.h + Math.PI / 2); g.stroke();
  }
  if (def.marks) def.marks.forEach((m, k) => { const p = geom.paths[0].at(TM.MARK_U[k]); drawSnap(g, T, ox + p.x * T, oy + p.y * T, p.ang, m); });
  if (snaps) for (const q of slotPoints(geom)) if (snaps[q.k]) drawSnap(g, T, ox + q.x * T, oy + q.y * T, q.ang, snaps[q.k]);
}
// the engine from above (T here is the size of the train): white body, a top in the train's own colour that wraps over
// the rounded nose, side windows, four LED bars (bright while it moves) and the colour light on the roof, a yellow
// button and red stripes at the back
export function drawTrain(g, T, x, y, ang, tr, opt = {}) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const L = T * 0.38, W = T * 0.2;
  const shell = () => { g.beginPath(); g.roundRect(-L, -W, 2 * L, 2 * W, [W * 0.5, W * 0.95, W * 0.95, W * 0.5]); };
  if (tr.head) {
    const gr = g.createRadialGradient(L, 0, 0, L, 0, T * 0.6); gr.addColorStop(0, tr.head + 'b0'); gr.addColorStop(1, tr.head + '00');
    g.fillStyle = gr; g.beginPath(); g.moveTo(L, 0); g.arc(L, 0, T * 0.6, -0.42, 0.42); g.closePath(); g.fill();
  }
  g.save(); g.translate(T * 0.025, T * 0.04); shell(); g.fillStyle = 'rgba(20,30,40,0.28)'; g.fill(); g.restore();
  shell(); g.fillStyle = '#ffffff'; g.fill(); g.strokeStyle = shade(tr.color, 0.8); g.lineWidth = Math.max(1, T * 0.022); g.stroke();
  g.save(); shell(); g.clip(); g.strokeStyle = '#ef4b3c'; g.lineWidth = T * 0.03;
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { g.beginPath(); g.moveTo(-L + T * (0.02 + k * 0.05), s * W * 0.95); g.lineTo(-L + T * (0.06 + k * 0.05), s * W * 0.55); g.stroke(); }
  g.restore();
  g.fillStyle = tr.color; g.beginPath(); g.roundRect(-L * 0.72, -W * 0.82, L * 1.68, W * 1.64, [W * 0.3, W * 0.85, W * 0.85, W * 0.3]); g.fill();
  g.fillStyle = tint(tr.color, 0.5); for (const s of [-1, 1]) { g.beginPath(); g.roundRect(-L * 0.55, s > 0 ? W * 0.5 : -W * 0.78, L * 1.05, W * 0.28, W * 0.12); g.fill(); }
  g.fillStyle = tint(tr.color, 0.82); for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(L * (0.62 + k * 0.08), -W * 0.45); g.lineTo(L * (0.68 + k * 0.08), -W * 0.45); g.lineTo(L * (0.62 + k * 0.08), -W * 0.2); g.lineTo(L * (0.56 + k * 0.08), -W * 0.2); g.fill(); }
  for (let k = 0; k < 4; k++) { g.fillStyle = opt.moving ? '#ff4a3a' : '#a8442f'; g.beginPath(); g.roundRect(-L * 0.42 + k * L * 0.12, -W * 0.36, L * 0.06, W * 0.72, L * 0.02); g.fill(); }
  const top = (tr.flash && tr.flash.col) || tr.top;
  if (top) { const gr = g.createRadialGradient(L * 0.2, 0, 0, L * 0.2, 0, T * 0.2); gr.addColorStop(0, top + 'cc'); gr.addColorStop(1, top + '00'); g.fillStyle = gr; g.beginPath(); g.arc(L * 0.2, 0, T * 0.2, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = top || '#7d848f'; g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1; g.beginPath(); g.roundRect(L * 0.08, -W * 0.42, L * 0.24, W * 0.84, L * 0.05); g.fill(); g.stroke();
  g.fillStyle = '#ffd23a'; g.beginPath(); g.roundRect(-L * 0.95, -W * 0.22, L * 0.14, W * 0.44, L * 0.03); g.fill();
  g.fillStyle = tr.head || '#3a3d44'; g.beginPath(); g.arc(L * 0.98, 0, T * 0.035, 0, Math.PI * 2); g.fill();
  g.fillStyle = tr.tail || '#4a2a2a'; for (const s of [-1, 1]) { g.beginPath(); g.arc(-L * 0.99, s * W * 0.6, T * 0.025, 0, Math.PI * 2); g.fill(); } // taillights
  g.restore();
  if (opt.ring) { g.save(); g.strokeStyle = '#1d6fe0'; g.lineWidth = 2.5; g.setLineDash([5, 4]); g.beginPath(); g.arc(x, y, T * 0.5, 0, Math.PI * 2); g.stroke(); g.restore(); }
  if (opt.label) {
    g.save(); g.font = '800 ' + Math.max(10, Math.round(T * 0.18)) + 'px Montserrat, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'bottom';
    const w = g.measureText(opt.label).width + 10, ty = y - T * 0.4, hh = Math.max(14, T * 0.25);
    g.fillStyle = 'rgba(20,24,30,0.8)'; g.beginPath(); g.roundRect(x - w / 2, ty - hh, w, hh, 6); g.fill();
    g.fillStyle = '#fff'; g.fillText(opt.label, x, ty - hh * 0.12); g.restore();
  }
}
const TRAIN_SIZE = 0.68; // the engine is about two thirds of a straight piece long

export function defaultProject() {
  return Object.assign(TM.starterTrack(), { trains: [{ name: 'Train 1', color: TM.TRAIN_COLOURS[0], start: Object.assign({}, TM.STARTER_TRAIN) }], blocks: TB.starterProgram() });
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
  let sel = 0, ws = null, sim = null, runner = null, alive = true, quiet = false, raf = 0, last = 0, changeTimer = 0;
  let tool = 'straight', hover = null, undo = [], redo = [];
  const keys = new Set();

  const status = (msg, kind) => { const s = $('tlStatus'); s.textContent = msg || ''; s.className = 'tl-status' + (kind ? ' ' + kind : ''); };
  const changed = () => { clearTimeout(changeTimer); changeTimer = setTimeout(() => { if (alive && host.onChange) host.onChange(); }, 250); };
  const running = () => !!(runner && runner.running());
  const ask = async msg => (host.confirm ? !!(await host.confirm(msg)) : window.confirm(msg));

  // ── the simulator is rebuilt whenever the track or the trains change (the trains go back to their start)
  function rebuild() {
    if (runner) runner.stop(true);
    sim = TM.createSim(proj, { onEvent: (i, k, d) => { if (runner) runner.event(i, k, d); } });
    runner = createRunner(sim, {
      sound: playSound, keyDown: k => keys.has(k),
      onError: err => { console.error(err); status('Something went wrong in one of your scripts.', 'bad'); },
      onStop: () => { status('Stopped. Press Run to go again, or Reset to put the trains back.'); }
    });
  }

  // ── blocks: one program for every train; the toolbox has a category per train, named after it
  const LOAD = 'tlload';
  function flush() { if (ws) proj.blocks = Blockly.serialization.workspaces.save(ws); }
  function loadBlocks() {
    if (!ws) return;
    quiet = true; Blockly.Events.setGroup(LOAD);
    try {
      ws.updateToolbox(TB.toolbox(proj.trains));
      ws.clear();
      try { Blockly.serialization.workspaces.load(proj.blocks || TB.starterProgram(), ws); }
      catch (e) { ws.clear(); if (host.toast) host.toast('Some blocks in this project couldn’t be loaded.'); }
    } finally { quiet = false; Blockly.Events.setGroup(false); }
    try { ws.scroll(20, 20); } catch (e) { /* hidden */ }
  }
  function refreshToolbox() { if (ws) try { ws.updateToolbox(TB.toolbox(proj.trains)); } catch (e) { /* hidden */ } }

  // ── the trains row (tabs) and the chosen train's settings
  function renderTrains() {
    const box = $('tlTrains');
    box.innerHTML = proj.trains.map((t, i) => `<button type="button" role="tab" aria-selected="${i === sel}" class="tl-tab${i === sel ? ' on' : ''}" data-i="${i}"><i style="background:${esc(t.color)}"></i>${esc(t.name)}${t.start ? '' : ' <small>(not on the track)</small>'}</button>`).join('') +
      (proj.trains.length < TM.MAX_TRAINS ? `<button type="button" class="tl-tab tl-add" id="tlAdd">${ic('i-plus')} Add a train</button>` : '');
    box.querySelectorAll('[data-i]').forEach(b => b.onclick = () => selectTrain(Number(b.dataset.i)));
    const add = $('tlAdd'); if (add) add.onclick = addTrain;
    const t = proj.trains[sel];
    $('tlName').value = t ? t.name : ''; $('tlColour').value = t ? t.color : '#21b8e8';
    // like the real extension, trains are numbered: only the last one can be taken away
    $('tlDelTrain').hidden = proj.trains.length < 2 || sel !== proj.trains.length - 1;
  }
  function selectTrain(i) {
    if (i === sel || !proj.trains[i]) return;
    sel = i; renderTrains(); setTool(tool);
  }
  function addTrain() {
    if (proj.trains.length >= TM.MAX_TRAINS) return;
    const used = new Set(proj.trains.map(t => t.color));
    const color = TM.TRAIN_COLOURS.find(c => !used.has(c)) || TM.TRAIN_COLOURS[proj.trains.length % TM.TRAIN_COLOURS.length];
    let n = proj.trains.length + 1; while (proj.trains.some(t => t.name === 'Train ' + n)) n++;
    proj.trains.push({ name: 'Train ' + n, color, start: null });
    sel = proj.trains.length - 1; refreshToolbox(); rebuild(); renderTrains(); setTool('train'); changed();
    status('Now tap the track to put ' + proj.trains[sel].name + ' on it.');
  }
  async function deleteTrain() {
    if (proj.trains.length < 2) return;
    const t = proj.trains[sel];
    if (sel !== proj.trains.length - 1 || !(await ask('Remove ' + t.name + ' and its blocks?'))) return;
    if (ws) { const pre = TB.typeOf(sel, ''); for (const b of ws.getAllBlocks(false).filter(x => x.type.startsWith(pre))) if (!b.isDeadOrDying || !b.isDeadOrDying()) b.dispose(true); }
    proj.trains.splice(sel, 1); sel = Math.max(0, sel - 1); flush(); refreshToolbox(); rebuild(); renderTrains(); changed();
  }

  // ── the tools under the board
  const TOOLS = [...TM.PIECE_KEYS.map(k => ['piece', k, TM.PIECES[k].name]), ...TM.SNAP_KEYS.map(k => ['snap', k, k + ' snap']), ['train', 'train', 'Put the train on the track'], ['erase', 'erase', 'Rubber: take a piece away']];
  function iconFor(kind, key) {
    const cv = document.createElement('canvas'), S = 40, dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = cv.height = S * dpr; cv.style.width = cv.style.height = S + 'px';
    const c = cv.getContext('2d'); c.scale(dpr, dpr);
    if (kind !== 'erase') { c.fillStyle = '#eef3f6'; c.fillRect(0, 0, S, S); }
    if (kind === 'piece') {
      const geom = TM.pieceGeom([key, 0, 0, key === 'cross' ? 0 : 0]);
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const p of geom.paths) for (let i = 0; i <= 8; i++) { const q = p.at(i / 8); x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
      const T = Math.min(28 / Math.max(0.6, x1 - x0 + TW), 28 / Math.max(0.6, y1 - y0 + TW));
      drawPiece(c, T, S / 2 - (x0 + x1) / 2 * T, S / 2 - (y0 + y1) / 2 * T, geom, null);
    } else if (kind === 'snap') { drawSnap(c, S * 2.4, S / 2, S / 2, 0, key); }
    else if (kind === 'train') { drawTrain(c, S * 0.95, S / 2, S / 2, 0, { color: proj.trains[sel] ? proj.trains[sel].color : TM.TRAIN_COLOURS[0], head: null, top: null }); }
    else { c.strokeStyle = '#ffb0b0'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(10, 10); c.lineTo(30, 30); c.moveTo(30, 10); c.lineTo(10, 30); c.stroke(); }
    return cv;
  }
  function renderTools() {
    const box = $('tlTools'); box.innerHTML = '';
    const groups = [['Track', TOOLS.filter(t => t[0] === 'piece')], ['Snaps', TOOLS.filter(t => t[0] === 'snap')], ['', TOOLS.filter(t => t[0] === 'train' || t[0] === 'erase')]];
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
    ex.innerHTML = `<button type="button" class="tl-small" id="tlUndo" title="Undo (Ctrl+Z)">${ic('i-undo')} Undo</button><button type="button" class="tl-small" id="tlRedo" title="Redo">${ic('i-redo')} Redo</button><button type="button" class="tl-small" id="tlClear" title="Take every piece away">${ic('i-trash')} Clear track</button>`;
    box.appendChild(ex);
    $('tlUndo').onclick = doUndo; $('tlRedo').onclick = doRedo; $('tlClear').onclick = clearTrack;
    setTool(tool);
  }
  function setTool(k) {
    tool = k;
    root.querySelectorAll('.tl-tool').forEach(b => b.classList.toggle('on', b.dataset.tool === k));
    const tb = root.querySelector('.tl-tool[data-tool="train"]'); if (tb) { tb.innerHTML = ''; tb.appendChild(iconFor('train')); }
  }

  // ── editing the track: pieces click onto open ends (the blue + marks); tap a piece to turn it
  const snapshot = () => JSON.stringify({ pieces: proj.pieces, starts: proj.trains.map(t => t.start) });
  function remember() { undo.push(snapshot()); if (undo.length > 80) undo.shift(); redo = []; }
  function restore(s) { const o = JSON.parse(s); proj.pieces = o.pieces; o.starts.forEach((st, i) => { if (proj.trains[i]) proj.trains[i].start = st; }); afterEdit(); }
  function doUndo() { if (running() || !undo.length) return; redo.push(snapshot()); restore(undo.pop()); }
  function doRedo() { if (running() || !redo.length) return; undo.push(snapshot()); restore(redo.pop()); }
  async function clearTrack() {
    if (running() || !proj.pieces.length) return;
    if (!(await ask('Take every piece of track away?'))) return;
    remember(); proj.pieces = []; for (const t of proj.trains) t.start = null; afterEdit();
  }
  function afterEdit() {
    const fixed = TM.cleanProject(proj); // a train whose piece has gone (or changed) comes off the track
    proj.pieces = fixed.pieces; proj.trains.forEach((t, i) => { t.start = fixed.trains[i] ? fixed.trains[i].start : null; });
    rebuild(); renderTrains(); changed();
  }
  function openEnds() {
    const out = [];
    sim.geoms.forEach((G, p) => G.ends.forEach((E, e) => { if (!sim.links[p + ':' + e]) out.push({ p, e, x: E.x, y: E.y, h: E.h }); }));
    return out;
  }
  const near = (list, x, y, r) => { let best = null, bd = r; for (const o of list) { const d = Math.hypot(o.x - x, o.y - y); if (d < bd) { bd = d; best = o; } } return best; };
  function pieceAt(x, y) {
    let best = -1, bd = TW * 0.75;
    sim.geoms.forEach((G, p) => { for (const pth of G.paths) for (let i = 0; i <= 12; i++) { const q = pth.at(i / 12), d = Math.hypot(q.x - x, q.y - y); if (d < bd) { bd = d; best = p; } } });
    return best;
  }
  const endTarget = (x, y) => near(openEnds().map(o => Object.assign({}, o, { x: o.x + Math.cos(o.h) * 0.14, y: o.y + Math.sin(o.h) * 0.14, ex: o.x, ey: o.y })), x, y, 0.32);
  function turnPiece(i) {
    const pc = proj.pieces[i], G = sim.geoms[i], joined = G.ends.map((E, e) => sim.links[i + ':' + e]).map((l, e) => (l ? { e, l } : null)).filter(Boolean);
    if (joined.length > 1) { if (host.toast) host.toast('That piece is joined at both ends, so it can’t turn. Take a neighbour away first.'); return false; }
    if (!joined.length) { pc[3] = (pc[3] + 1) % 8; return true; } // a piece on its own turns 45° each tap
    const { e, l } = joined[0], E = sim.geoms[l.p].ends[l.e], n = TM.PIECES[pc[0]].ends.length;
    const np = TM.placeAt(pc[0], (e + 1) % n, E.x, E.y, E.h); np[4] = pc[4];
    proj.pieces[i] = np; return true; // joined by its next end instead: a curve now bends the other way, a split faces the other way
  }
  function applyTool(x, y) {
    if (TM.PIECES[tool]) {
      const end = endTarget(x, y);
      if (end) { if (proj.pieces.length >= TM.MAX_PIECES) { if (host.toast) host.toast('That’s the biggest track the Train Lab can hold.'); return false; } proj.pieces.push(TM.placeAt(tool, 0, end.ex, end.ey, end.h)); return true; }
      const i = pieceAt(x, y); if (i >= 0) return turnPiece(i);
      proj.pieces.push([tool, Math.round(x * 2) / 2, Math.round(y * 2) / 2, 0, null]); return true; // on the empty mat: start a new bit of track
    }
    const i = pieceAt(x, y);
    if (i < 0) return false;
    const pc = proj.pieces[i];
    if (TM.SNAPS[tool]) {
      const pts = slotPoints(sim.geoms[i]);
      if (!pts.length) { if (host.toast) host.toast('Snaps don’t go on a crossing.'); return false; }
      const k = near(pts, x, y, 9).k, arr = pc[4] ? pc[4].slice() : new Array(pts.length).fill(null);
      arr[k] = arr[k] === tool ? null : tool; pc[4] = arr.some(Boolean) ? arr : null; return true;
    }
    if (tool === 'erase') {
      proj.pieces.splice(i, 1);
      for (const t of proj.trains) if (t.start) { if (t.start.p === i) t.start = null; else if (t.start.p > i) t.start = Object.assign({}, t.start, { p: t.start.p - 1 }); }
      return true;
    }
    if (tool === 'train') {
      const t = proj.trains[sel]; if (!t) return false;
      if (proj.trains.some((o, j) => j !== sel && o.start && o.start.p === i)) { if (host.toast) host.toast('There is already a train on that piece.'); return false; }
      const n = TM.PIECES[pc[0]].paths.length;
      if (t.start && t.start.p === i) { const kk = (t.start.k * 2 + (t.start.rev ? 1 : 0) + 1) % (n * 2); t.start = { p: i, k: Math.floor(kk / 2), rev: kk % 2 === 1 }; } // tap again: turn it round, then the other track
      else t.start = { p: i, k: 0, rev: false };
      return true;
    }
    return false;
  }
  function tapAt(x, y) { const before = snapshot(); if (running() || !applyTool(x, y)) return false; undo.push(before); if (undo.length > 80) undo.shift(); redo = []; afterEdit(); return true; }

  // ── the view: the whole track always fits, with room round the edges for the next piece
  function view() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const G of sim.geoms) for (const pth of G.paths) for (let i = 0; i <= 4; i++) { const q = pth.at(i / 4); x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
    if (!isFinite(x0)) { x0 = -3; x1 = 3; y0 = -2; y1 = 2; }
    const m = 1.1, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, ww = Math.max(6, x1 - x0 + 2 * m), hh = Math.max(3.6, y1 - y0 + 2 * m);
    const T = Math.min(w / ww, h / hh, 150);
    return { T, ox: w / 2 - cx * T, oy: h / 2 - cy * T, w, h };
  }
  function worldFromEvent(e) { const r = canvas.getBoundingClientRect(), V = view(); return { x: (e.clientX - r.left - V.ox) / V.T, y: (e.clientY - r.top - V.oy) / V.T }; }
  canvas.addEventListener('pointerdown', e => {
    audio(); // sounds may only start after a tap (iPad)
    const at = worldFromEvent(e);
    if (running()) return;
    tapAt(at.x, at.y); e.preventDefault();
  });
  canvas.addEventListener('pointermove', e => { hover = worldFromEvent(e); });
  canvas.addEventListener('pointerleave', () => { hover = null; });

  function draw() {
    const dpr = window.devicePixelRatio || 1, cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (!cw || !ch) return;
    if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) { canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr); }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { T, ox, oy, w, h } = view();
    g.fillStyle = '#eef3f6'; g.fillRect(0, 0, w, h);
    sim.geoms.forEach((G, p) => drawPiece(g, T, ox, oy, G, proj.pieces[p][4], 'bed'));
    sim.geoms.forEach((G, p) => drawPiece(g, T, ox, oy, G, proj.pieces[p][4], 'top'));
    if (!running()) {
      const tgt = hover && TM.PIECES[tool] ? endTarget(hover.x, hover.y) : null;
      for (const o of openEnds()) { // where the next piece can go
        const x = ox + (o.x + Math.cos(o.h) * 0.14) * T, y = oy + (o.y + Math.sin(o.h) * 0.14) * T, r = Math.max(7, T * 0.09);
        g.fillStyle = tgt && tgt.p === o.p && tgt.e === o.e ? '#1d6fe0' : 'rgba(29,111,224,0.75)'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#fff'; g.lineWidth = Math.max(1.5, r * 0.28); g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
      }
      if (tgt && !touchy) { g.save(); g.globalAlpha = 0.45; const G = TM.pieceGeom(TM.placeAt(tool, 0, tgt.ex, tgt.ey, tgt.h)); drawPiece(g, T, ox, oy, G, null, 'bed'); drawPiece(g, T, ox, oy, G, null, 'top'); g.restore(); }
      if (hover && !touchy && TM.SNAPS[tool]) { const i = pieceAt(hover.x, hover.y); if (i >= 0) { const pts = slotPoints(sim.geoms[i]); if (pts.length) { const q = near(pts, hover.x, hover.y, 9); drawSnap(g, T, ox + q.x * T, oy + q.y * T, q.ang, tool, true); } } }
    }
    const many = sim.trains.length > 1;
    sim.trains.forEach((tr, i) => {
      const p = sim.pose(i); if (!p) return;
      drawTrain(g, T * TRAIN_SIZE, ox + p.x * T, oy + p.y * T, p.ang, tr, { ring: !running() && i === sel && many, label: many || !running() ? tr.name : '', moving: tr.v > 0.01 });
    });
    if (!proj.pieces.length) {
      g.fillStyle = '#3c4a55'; g.font = '800 16px Montserrat, sans-serif'; g.textAlign = 'center';
      g.fillText('Pick a track piece below, then tap here to put it down.', w / 2, h / 2);
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
    if (!sim.trains.some(t => t.on)) { status('Put a train on the track first: pick the train tool and tap a piece.', 'bad'); return; }
    runner.start(ws);
    status('Running · trains with no blocks of their own drive by themselves and follow the snaps', 'ok');
    canvas.focus({ preventScroll: true });
  }
  function stop() { if (runner) runner.stop(); }
  function reset() { if (runner) runner.stop(true); rebuild(); status('Press Run: the trains follow the snaps by themselves. Add blocks to do more.'); }

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
  $('tlName').addEventListener('input', () => { const t = proj.trains[sel]; if (!t) return; t.name = TM.cleanName($('tlName').value) || 'Train ' + (sel + 1); if (sim.trains[sel]) sim.trains[sel].name = t.name; renderTrainsSoon(); toolboxSoon(); changed(); });
  $('tlColour').addEventListener('input', () => { const t = proj.trains[sel]; if (!t || !okColour($('tlColour').value)) return; t.color = $('tlColour').value; if (sim.trains[sel]) sim.trains[sel].color = t.color; renderTrainsSoon(); setTool(tool); changed(); });
  let tbTimer = 0; function toolboxSoon() { clearTimeout(tbTimer); tbTimer = setTimeout(refreshToolbox, 500); }
  let rtTimer = 0; function renderTrainsSoon() { clearTimeout(rtTimer); rtTimer = setTimeout(() => { const f = document.activeElement; renderTrains(); if (f && root.contains(f)) f.focus(); }, 300); }
  $('tlDelTrain').onclick = deleteTrain;


  const ro = new ResizeObserver(() => { if (ws) Blockly.svgResize(ws); });
  ro.observe($('tlBlocks'));

  rebuild(); renderTrains(); renderTools();
  const ready = (async () => {
    if (!defined) { TB.defineBlocks(Blockly); defined = true; }
    ws = Blockly.inject($('tlBlocks'), {
      toolbox: TB.toolbox(proj.trains), renderer: 'zelos', theme: tlTheme(Blockly), scrollbars: true, trashcan: true, media: 'https://unpkg.com/blockly@10.4.3/media/',
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
    status('Press Run: the trains follow the snaps by themselves. Add blocks to do more.');
  })().catch(e => { $('tlLoading').textContent = 'The Train Lab could not start. Check your connection and try again.'; console.error(e); });

  function getProject() {
    flush();
    return JSON.parse(JSON.stringify({ v: 2, pieces: proj.pieces, trains: proj.trains, blocks: proj.blocks || null }));
  }
  return {
    ready,
    getProject,
    setProject(p) {
      if (runner) runner.stop(true);
      proj = TM.cleanProject(p || defaultProject()); if (!proj.trains.length) proj = TM.cleanProject(defaultProject());
      sel = 0; undo = []; redo = [];
      rebuild(); renderTrains(); renderTools(); loadBlocks();
      status('Press Run: the trains follow the snaps by themselves. Add blocks to do more.');
      if (!raf && ws) raf = requestAnimationFrame(tick); // reopening after pause() must restart the loop, or Run does nothing
    },
    resume() { if (ws) Blockly.svgResize(ws); if (!raf && ws) raf = requestAnimationFrame(tick); },
    pause() { if (runner) runner.stop(true); cancelAnimationFrame(raf); raf = 0; },
    destroy() {
      alive = false; ro.disconnect(); cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKey);
      if (runner) runner.stop(true); if (ws) ws.dispose();
      root.innerHTML = '';
    },
    run, stop, reset, setTool, selectTrain,
    _sim: () => sim, _runner: () => runner, _ws: () => ws, _proj: () => proj, _tapWorld: tapAt, _openEnds: () => openEnds(),
  };
}
