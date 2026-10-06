/* CodeJump · Train Lab project type — the app: build a track from pieces, put trains on it, give each train its own
 * blocks, then press Run and watch them go. Lazy-loaded by CodeJump (build-and-play.html: loadTrainLab) only when a Train
 * Lab project opens, and mounted into #train-ui. CodeJump owns saving and sharing: getProject() goes into the payload
 * (payload.train) and onChange() marks the project dirty.
 *
 *   const app = (await import('./train/train-app.js')).mount(rootEl, { project, onChange, toast, confirm, print });
 *   app.getProject() · app.setProject(p) · app.resume() · app.pause() · app.destroy()
 *
 * A project is train-model.js's { v: 2, pieces, trains: [{ name, color, start, wagon }], wagons, dests, challenge, blocks }: ONE program, with a block category per
 * train (like the smart train's Scratch extension). Uses the page's Blockly 10.
 */
import * as TM from './train-model.js';
import * as TB from './train-blocks.js';
import { createRunner } from './train-runner.js';
import { CHALLENGES, challengeProject } from './train-challenges.js';

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
      <button type="button" class="tl-reset tl-chal" id="tlChal" title="Challenges: try a ready-made one, make your own, print a challenge card">${ic('i-flag')} Challenges</button>
      <span class="tl-status" id="tlStatus" role="status" aria-live="polite"></span>
    </div>
    <div class="tl-stage" id="tlStage">
      <canvas id="tlCanvas" tabindex="0" aria-label="The track. Pick a piece below and tap a blue plus at the end of the track to click it on; tap a piece to turn it."></canvas>
      <div class="tl-check" id="tlCheck" hidden></div>
      <div class="tl-vars" id="tlVars" hidden aria-live="off"></div>
      <div class="tl-zoom" role="group" aria-label="Zoom">
        <button type="button" id="tlZoomIn" title="Zoom in" aria-label="Zoom in">+</button>
        <button type="button" id="tlZoomOut" title="Zoom out" aria-label="Zoom out">&minus;</button>
        <button type="button" id="tlFit" class="on" title="Fit the whole track on the screen">Fit</button>
      </div>
      <div class="tl-loading" id="tlLoading">Getting the Train Lab ready…</div>
    </div>
    <div class="tl-tools" id="tlTools"></div>
    <div class="tl-settings" id="tlSettings">
      <label>Name <input id="tlName" maxlength="14" autocomplete="off"></label>
      <label>Colour <input type="color" id="tlColour"></label>
      <label title="The train starts with a wagon on its magnet"><input type="checkbox" id="tlWagon"> Pulls a wagon</label>
      <button type="button" class="tl-small" id="tlDelTrain">${ic('i-trash')} Remove train</button>
    </div>
  </div>
  <div class="tl-modal" id="tlModal" hidden><div class="tl-mbox" role="dialog" aria-modal="true" aria-labelledby="tlMTitle">
    <button type="button" class="tl-mclose" id="tlMClose" aria-label="Close">${ic('i-x')}</button>
    <div id="tlMBody"></div>
  </div></div>
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
// a wagon from above: white body, sky-blue top, windows and a white arrow on the roof pointing at the engine
export function drawWagon(g, T, x, y, ang, color, opt = {}) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const L = T * 0.34, W = T * 0.19, shell = () => { g.beginPath(); g.roundRect(-L, -W, 2 * L, 2 * W, W * 0.55); };
  g.save(); g.translate(T * 0.025, T * 0.04); shell(); g.fillStyle = 'rgba(20,30,40,0.28)'; g.fill(); g.restore();
  shell(); g.fillStyle = '#ffffff'; g.fill(); g.strokeStyle = shade(color, 0.8); g.lineWidth = Math.max(1, T * 0.02); g.stroke();
  g.fillStyle = color; g.beginPath(); g.roundRect(-L * 0.82, -W * 0.8, L * 1.64, W * 1.6, W * 0.4); g.fill();
  g.fillStyle = tint(color, 0.5); for (const s of [-1, 1]) { g.beginPath(); g.roundRect(-L * 0.6, s > 0 ? W * 0.48 : -W * 0.76, L * 1.2, W * 0.28, W * 0.12); g.fill(); }
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-L * 0.28, -W * 0.36, L * 0.56, W * 0.72, W * 0.15); g.fill();
  g.fillStyle = '#1f2024'; g.beginPath(); g.moveTo(L * 0.2, 0); g.lineTo(-L * 0.12, -W * 0.24); g.lineTo(-L * 0.12, W * 0.24); g.closePath(); g.fill(); // arrow → engine
  g.fillStyle = '#9aa0a8'; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * L * 1.02, 0, T * 0.03, 0, Math.PI * 2); g.fill(); } // magnets
  g.restore();
  if (opt.ring) { g.save(); g.strokeStyle = '#1d6fe0'; g.lineWidth = 2; g.setLineDash([4, 4]); g.beginPath(); g.arc(x, y, T * 0.45, 0, Math.PI * 2); g.stroke(); g.restore(); }
}
// destination signs: a round badge with a little picture, and the name underneath
const DEST_ICON = {
  start(g, r) { g.fillStyle = '#5b5f68'; g.fillRect(-r * 0.55, -r * 0.6, r * 0.1, r * 1.25); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { g.fillStyle = (i + j) % 2 ? '#fff' : '#1f2024'; g.fillRect(-r * 0.45 + i * r * 0.25, -r * 0.6 + j * r * 0.22, r * 0.25, r * 0.22); } g.strokeStyle = '#1f2024'; g.lineWidth = r * 0.05; g.strokeRect(-r * 0.45, -r * 0.6, r, r * 0.66); },
  station(g, r) { g.fillStyle = '#ffd21f'; g.fillRect(-r * 0.6, -r * 0.2, r * 1.2, r * 0.75); g.fillStyle = '#ef4b3c'; g.beginPath(); g.moveTo(-r * 0.75, -r * 0.18); g.lineTo(0, -r * 0.65); g.lineTo(r * 0.75, -r * 0.18); g.closePath(); g.fill(); g.fillStyle = '#1f2024'; g.beginPath(); g.arc(0, -r * 0.3, r * 0.14, 0, 7); g.fill(); g.fillStyle = '#4fc9ea'; g.fillRect(-r * 0.45, r * 0.05, r * 0.25, r * 0.35); g.fillRect(r * 0.2, r * 0.05, r * 0.25, r * 0.35); },
  airport(g, r) { g.fillStyle = '#c9ced6'; g.fillRect(-r * 0.12, -r * 0.2, r * 0.24, r * 0.75); g.fillStyle = '#4fc9ea'; g.beginPath(); g.roundRect(-r * 0.32, -r * 0.42, r * 0.64, r * 0.26, r * 0.06); g.fill(); g.fillStyle = '#ef4b3c'; g.beginPath(); g.moveTo(-r * 0.75, -r * 0.55); g.lineTo(-r * 0.3, -r * 0.62); g.lineTo(-r * 0.2, -r * 0.7); g.lineTo(-r * 0.12, -r * 0.6); g.lineTo(-r * 0.4, -r * 0.48); g.closePath(); g.fill(); },
  museum(g, r) { g.fillStyle = '#d6d9de'; g.beginPath(); g.moveTo(-r * 0.7, -r * 0.25); g.lineTo(0, -r * 0.65); g.lineTo(r * 0.7, -r * 0.25); g.closePath(); g.fill(); for (let i = 0; i < 4; i++) g.fillRect(-r * 0.55 + i * r * 0.33, -r * 0.18, r * 0.14, r * 0.6); g.fillRect(-r * 0.7, r * 0.42, r * 1.4, r * 0.13); g.fillStyle = '#3cb54a'; g.beginPath(); g.arc(0, -r * 0.38, r * 0.1, 0, 7); g.fill(); },
  depot(g, r) { g.fillStyle = '#9aa0a8'; g.fillRect(-r * 0.65, -r * 0.3, r * 1.3, r * 0.85); g.fillStyle = '#ef4b3c'; g.fillRect(-r * 0.7, -r * 0.45, r * 1.4, r * 0.18); g.fillStyle = '#21b8e8'; g.beginPath(); g.moveTo(-r * 0.3, r * 0.55); g.lineTo(-r * 0.3, 0); g.arc(0, 0, r * 0.3, Math.PI, 0); g.lineTo(r * 0.3, r * 0.55); g.closePath(); g.fill(); },
  school(g, r) { g.fillStyle = '#d9663a'; g.fillRect(-r * 0.65, -r * 0.25, r * 1.3, r * 0.8); g.fillStyle = '#7a3b22'; g.beginPath(); g.moveTo(-r * 0.25, -r * 0.25); g.lineTo(0, -r * 0.6); g.lineTo(r * 0.25, -r * 0.25); g.closePath(); g.fill(); g.fillStyle = '#ffd21f'; g.beginPath(); g.arc(0, -r * 0.3, r * 0.08, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillRect(-r * 0.12, r * 0.15, r * 0.24, r * 0.4); },
  farm(g, r) { g.fillStyle = '#c8302a'; g.beginPath(); g.moveTo(-r * 0.6, r * 0.55); g.lineTo(-r * 0.6, -r * 0.1); g.lineTo(0, -r * 0.6); g.lineTo(r * 0.6, -r * 0.1); g.lineTo(r * 0.6, r * 0.55); g.closePath(); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = r * 0.08; g.strokeRect(-r * 0.25, r * 0.1, r * 0.5, r * 0.45); g.beginPath(); g.moveTo(-r * 0.25, r * 0.1); g.lineTo(r * 0.25, r * 0.55); g.moveTo(r * 0.25, r * 0.1); g.lineTo(-r * 0.25, r * 0.55); g.stroke(); },
  harbour(g, r) { g.strokeStyle = '#1f4f8f'; g.lineWidth = r * 0.12; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -r * 0.45); g.lineTo(0, r * 0.5); g.moveTo(-r * 0.3, -r * 0.25); g.lineTo(r * 0.3, -r * 0.25); g.stroke(); g.beginPath(); g.arc(0, r * 0.05, r * 0.48, 0.3, Math.PI - 0.3); g.stroke(); g.beginPath(); g.arc(0, -r * 0.55, r * 0.12, 0, 7); g.stroke(); },
  zoo(g, r) { g.fillStyle = '#e89a2c'; g.beginPath(); g.ellipse(0, r * 0.2, r * 0.32, r * 0.26, 0, 0, 7); g.fill(); for (const [x, y] of [[-0.45, -0.2], [-0.16, -0.45], [0.16, -0.45], [0.45, -0.2]]) { g.beginPath(); g.ellipse(x * r, y * r, r * 0.13, r * 0.16, 0, 0, 7); g.fill(); } },
  castle(g, r) { g.fillStyle = '#9aa0a8'; g.fillRect(-r * 0.6, -r * 0.2, r * 1.2, r * 0.75); for (let i = 0; i < 4; i++) g.fillRect(-r * 0.6 + i * r * 0.34, -r * 0.4, r * 0.18, r * 0.22); g.fillStyle = '#5b5f68'; g.beginPath(); g.moveTo(-r * 0.18, r * 0.55); g.lineTo(-r * 0.18, r * 0.15); g.arc(0, r * 0.15, r * 0.18, Math.PI, 0); g.lineTo(r * 0.18, r * 0.55); g.closePath(); g.fill(); g.fillStyle = '#ef4b3c'; g.beginPath(); g.moveTo(0, -r * 0.75); g.lineTo(r * 0.3, -r * 0.65); g.lineTo(0, -r * 0.55); g.closePath(); g.fill(); g.fillRect(-r * 0.02, -r * 0.75, r * 0.05, r * 0.35); },
  shops(g, r) { g.fillStyle = '#d63fb5'; g.beginPath(); g.roundRect(-r * 0.45, -r * 0.2, r * 0.9, r * 0.75, r * 0.1); g.fill(); g.strokeStyle = '#7a1f66'; g.lineWidth = r * 0.08; g.beginPath(); g.arc(0, -r * 0.2, r * 0.22, Math.PI, 0); g.stroke(); },
  crossing(g, r) { g.lineCap = 'round'; for (const [w, c] of [[r * 0.34, '#ef4b3c'], [r * 0.18, '#ffffff']]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(-r * 0.55, -r * 0.5); g.lineTo(r * 0.55, r * 0.5); g.moveTo(r * 0.55, -r * 0.5); g.lineTo(-r * 0.55, r * 0.5); g.stroke(); } },
  trees(g, r) { g.strokeStyle = '#7a4a25'; g.lineWidth = r * 0.16; g.lineCap = 'round'; g.beginPath(); g.moveTo(-r * 0.6, r * 0.45); g.lineTo(r * 0.3, -r * 0.05); g.stroke(); g.fillStyle = '#3cb54a'; g.beginPath(); g.arc(r * 0.3, -r * 0.15, r * 0.38, 0, 7); g.fill(); g.fillStyle = '#2b8a38'; g.beginPath(); g.arc(r * 0.45, -r * 0.3, r * 0.2, 0, 7); g.fill(); },
  rocks(g, r) { g.fillStyle = '#9aa0a8'; g.beginPath(); g.moveTo(-r * 0.7, r * 0.45); g.lineTo(-r * 0.45, -r * 0.1); g.lineTo(-r * 0.05, -r * 0.2); g.lineTo(r * 0.15, r * 0.45); g.closePath(); g.fill(); g.fillStyle = '#7d848f'; g.beginPath(); g.moveTo(-r * 0.1, r * 0.45); g.lineTo(r * 0.2, -r * 0.45); g.lineTo(r * 0.6, -r * 0.2); g.lineTo(r * 0.7, r * 0.45); g.closePath(); g.fill(); }
};
export function drawDestIcon(g, type, x, y, r) {
  g.save(); g.translate(x, y);
  g.fillStyle = '#ffffff'; g.strokeStyle = '#1f2024'; g.lineWidth = Math.max(1.2, r * 0.09); g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill(); g.stroke();
  if (DEST_ICON[type]) DEST_ICON[type](g, r * 0.78);
  g.restore();
}
export function drawDest(g, T, x, y, type, label) {
  const r = Math.max(9, T * 0.2);
  drawDestIcon(g, type, x, y, r);
  if (label) {
    g.save(); g.font = '800 ' + Math.max(9, Math.round(T * 0.13)) + 'px Montserrat, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
    const w = g.measureText(label).width + 8, ty = y + r + 2;
    g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.roundRect(x - w / 2, ty, w, Math.max(13, T * 0.18), 5); g.fill();
    g.fillStyle = '#1f2024'; g.fillText(label, x, ty + 2); g.restore();
  }
}
// a gold number badge: the place's turn in the order (its job numbers)
export function drawOrderBadge(g, x, y, r, text) {
  g.save(); g.font = '900 ' + Math.round(r * (text.length > 2 ? 0.95 : 1.25)) + 'px Montserrat, sans-serif';
  const w = Math.max(r * 2, g.measureText(text).width + r * 0.9);
  g.fillStyle = '#ffd23a'; g.strokeStyle = '#1f2024'; g.lineWidth = Math.max(1.2, r * 0.16);
  g.beginPath(); g.roundRect(x - w / 2, y - r, w, r * 2, r); g.fill(); g.stroke();
  g.fillStyle = '#1f2024'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x, y + r * 0.06); g.restore();
}
export function orderLabels(challenge) { // { destIndex: '1' | '2, 5' }
  const out = {}; if (!challenge) return out;
  challenge.steps.forEach((s, i) => { out[s.d] = out[s.d] ? out[s.d] + ', ' + (i + 1) : String(i + 1); });
  return out;
}
export function drawDestBadge(g, T, x, y, text) { const r = Math.max(9, T * 0.2); drawOrderBadge(g, x + r * 0.95, y - r * 0.85, Math.max(7, r * 0.55), text); }
// where a destination sign stands: beside the middle of its piece, on its side
export function destSpot(geoms, d) {
  const G = geoms[d.p]; if (!G) return null;
  const q = G.paths[0].at(0.5), side = d.side < 0 ? -1 : 1;
  return { x: q.x - Math.sin(q.ang) * 0.6 * side, y: q.y + Math.cos(q.ang) * 0.6 * side };
}

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
  let cam = null; // null = fit the whole track; else { T, x, y } (scale and the world point in the middle)
  let tool = 'straight', hover = null, undo = [], redo = [], placeType = 'station', checker = null, checkKey = '', cheered = false;
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
    $('tlName').value = t ? t.name : ''; $('tlColour').value = t ? t.color : '#21b8e8'; $('tlWagon').checked = !!(t && t.wagon);
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
  const TOOLS = [...TM.PIECE_KEYS.map(k => ['piece', k, TM.PIECES[k].name]), ...TM.SNAP_KEYS.map(k => ['snap', k, k + ' snap']), ['train', 'train', 'Put the train on the track'], ['wagon', 'wagon', 'Wagon: tap the track to leave a wagon there (tap again to turn it, then to take it away)'], ['place', 'place', 'Places: tap beside the track to put up a sign'], ['order', 'order', 'Order: tap the places in the order the train should visit them (tap the last one again to take it off)'], ['erase', 'erase', 'Rubber: take a piece, a sign or a wagon away']];
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
    else if (kind === 'wagon') { drawWagon(c, S * 0.95, S / 2, S / 2, 0, TM.WAGON_COLOUR); }
    else if (kind === 'place') { drawDestIcon(c, placeType, S / 2, S / 2, 15); }
    else if (kind === 'order') { drawOrderBadge(c, 13, 14, 9, '1'); drawOrderBadge(c, 27, 27, 9, '2'); c.strokeStyle = '#1f2024'; c.lineWidth = 1.5; c.setLineDash([2, 2]); c.beginPath(); c.moveTo(19, 19); c.lineTo(22, 22); c.stroke(); }
    else { c.strokeStyle = '#ffb0b0'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(10, 10); c.lineTo(30, 30); c.moveTo(30, 10); c.lineTo(10, 30); c.stroke(); }
    return cv;
  }
  function renderTools() {
    const box = $('tlTools'); box.innerHTML = '';
    const groups = [['Track', TOOLS.filter(t => t[0] === 'piece')], ['Snaps', TOOLS.filter(t => t[0] === 'snap')], ['', TOOLS.filter(t => t[0] === 'train' || t[0] === 'wagon' || t[0] === 'erase')], ['Places', TOOLS.filter(t => t[0] === 'place' || t[0] === 'order')]];
    for (const [title, list] of groups) {
      const grp = document.createElement('div'); grp.className = 'tl-tgroup';
      if (title) { const h = document.createElement('span'); h.className = 'tl-tlabel'; h.textContent = title; grp.appendChild(h); }
      for (const [kind, key, label] of list) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'tl-tool'; b.dataset.tool = key; b.title = label; b.setAttribute('aria-label', label);
        b.appendChild(iconFor(kind, key)); b.onclick = () => setTool(key); grp.appendChild(b);
      }
      if (title === 'Places') {
        const ps = document.createElement('select'); ps.id = 'tlPlace'; ps.setAttribute('aria-label', 'Which place');
        ps.innerHTML = TM.DEST_KEYS.map(k => `<option value="${k}"${k === placeType ? ' selected' : ''}>${esc(TM.DESTS[k])}</option>`).join('');
        ps.onchange = () => { placeType = ps.value; setTool('place'); }; grp.appendChild(ps);
        const oc = document.createElement('button'); oc.type = 'button'; oc.className = 'tl-small'; oc.id = 'tlOrderClear'; oc.innerHTML = ic('i-x') + ' Clear the order';
        oc.title = 'Take away the order (the numbers on the places)'; oc.onclick = clearOrder; grp.appendChild(oc);
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
    const pb = root.querySelector('.tl-tool[data-tool="place"]'); if (pb) { pb.innerHTML = ''; pb.appendChild(iconFor('place')); }
  }

  // ── editing the track: pieces click onto open ends (the blue + marks); tap a piece to turn it
  const snapshot = () => JSON.stringify({ pieces: proj.pieces, starts: proj.trains.map(t => t.start), wagons: proj.wagons, dests: proj.dests, challenge: proj.challenge });
  function remember() { undo.push(snapshot()); if (undo.length > 80) undo.shift(); redo = []; }
  function restore(s) { const o = JSON.parse(s); proj.pieces = o.pieces; o.starts.forEach((st, i) => { if (proj.trains[i]) proj.trains[i].start = st; }); proj.wagons = o.wagons || []; proj.dests = o.dests || []; proj.challenge = o.challenge || null; afterEdit(); }
  function doUndo() { if (running() || !undo.length) return; redo.push(snapshot()); restore(undo.pop()); }
  function doRedo() { if (running() || !redo.length) return; undo.push(snapshot()); restore(redo.pop()); }
  async function clearTrack() {
    if (running() || !proj.pieces.length) return;
    if (!(await ask('Take every piece of track away?'))) return;
    remember(); proj.pieces = []; proj.wagons = []; proj.dests = []; if (proj.challenge) proj.challenge.steps = []; for (const t of proj.trains) t.start = null; afterEdit();
  }
  function afterEdit() {
    const fixed = TM.cleanProject(proj); // a train whose piece has gone (or changed) comes off the track
    proj.pieces = fixed.pieces; proj.trains.forEach((t, i) => { t.start = fixed.trains[i] ? fixed.trains[i].start : null; });
    proj.wagons = fixed.wagons; proj.dests = fixed.dests; proj.challenge = fixed.challenge;
    rebuild(); renderTrains(); renderCheck(); changed();
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
    if (tool === 'place') return placeSign(x, y);
    if (tool === 'order') return orderSign(x, y);
    if (tool === 'erase') { // a sign or a wagon first, then the piece under it
      const d = destAt(x, y); if (d >= 0) { removeDest(d); return true; }
      const w = wagonAt(x, y); if (w >= 0) { proj.wagons.splice(w, 1); return true; }
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
      proj.wagons = proj.wagons.filter(w => w.p !== i).map(w => (w.p > i ? Object.assign({}, w, { p: w.p - 1 }) : w));
      for (let d = proj.dests.length - 1; d >= 0; d--) if (proj.dests[d].p === i) removeDest(d);
      proj.dests.forEach(d => { if (d.p > i) d.p--; });
      return true;
    }
    if (tool === 'wagon') {
      if (proj.trains.some(o => o.start && o.start.p === i)) { if (host.toast) host.toast('A train is standing there. Put the wagon on another piece.'); return false; }
      const n = TM.PIECES[pc[0]].paths.length, j = proj.wagons.findIndex(w => w.p === i);
      if (j >= 0) { // tap again: turn it round, then the other track, then take it away
        const w = proj.wagons[j], kk = w.k * 2 + (w.rev ? 1 : 0) + 1;
        if (kk >= n * 2) proj.wagons.splice(j, 1); else proj.wagons[j] = { p: i, k: Math.floor(kk / 2), rev: kk % 2 === 1 };
        return true;
      }
      if (proj.wagons.length >= TM.MAX_WAGONS) { if (host.toast) host.toast('That’s enough wagons for one track.'); return false; }
      proj.wagons.push({ p: i, k: 0, rev: false }); return true;
    }
    if (tool === 'train') {
      const t = proj.trains[sel]; if (!t) return false;
      if (proj.trains.some((o, j) => j !== sel && o.start && o.start.p === i) || proj.wagons.some(w => w.p === i)) { if (host.toast) host.toast('There is already a train or a wagon on that piece.'); return false; }
      const n = TM.PIECES[pc[0]].paths.length;
      if (t.start && t.start.p === i) { const kk = (t.start.k * 2 + (t.start.rev ? 1 : 0) + 1) % (n * 2); t.start = { p: i, k: Math.floor(kk / 2), rev: kk % 2 === 1 }; } // tap again: turn it round, then the other track
      else t.start = { p: i, k: 0, rev: false };
      return true;
    }
    return false;
  }
  // ── places (destination signs beside the track) and loose wagons
  function destAt(x, y) {
    let best = -1, bd = 0.32;
    proj.dests.forEach((d, j) => { const q = destSpot(sim.geoms, d); if (q) { const e = Math.hypot(q.x - x, q.y - y); if (e < bd) { bd = e; best = j; } } });
    return best;
  }
  function wagonAt(x, y) {
    let best = -1, bd = 0.35;
    sim.freeWagons().forEach((w, j) => { const e = Math.hypot(w.x - x, w.y - y); if (e < bd) { bd = e; best = j; } });
    return best; // free wagons are in the same order as proj.wagons
  }
  function removeDest(j) {
    proj.dests.splice(j, 1);
    if (proj.challenge) proj.challenge.steps = proj.challenge.steps.filter(s => s.d !== j).map(s => (s.d > j ? { d: s.d - 1, a: s.a } : s));
  }
  // the order: tap signs one after another and each becomes the next job in the challenge (made if there isn't one yet)
  function orderSign(x, y) {
    const j = destAt(x, y);
    if (j < 0) { if (host.toast) host.toast(proj.dests.length ? 'Tap a place’s sign to give it the next number.' : 'Put some places beside the track first, with the Places tool.'); return false; }
    if (!proj.challenge) proj.challenge = { id: '', title: 'My route', text: '', steps: [] };
    const st = proj.challenge.steps, last = st[st.length - 1];
    if (last && last.d === j) { st.pop(); return true; } // tap the last one again: take it off
    if (st.length >= 12) { if (host.toast) host.toast('That’s the most jobs a challenge can have (12).'); return false; }
    const t = proj.dests[j].t;
    st.push({ d: j, a: !st.length ? (t === 'start' ? 'start' : 'stop') : (t === 'start' ? 'end' : 'stop') });
    return true;
  }
  async function clearOrder() {
    const ch = proj.challenge; if (running() || !ch || !ch.steps.length) return;
    if (!(await ask('Take the numbers off the places? (This empties the challenge’s list of jobs.)'))) return;
    remember(); ch.steps = []; afterEdit();
  }
  function placeSign(x, y) {
    const j = destAt(x, y);
    if (j >= 0) { if (proj.dests[j].t === placeType) removeDest(j); else proj.dests[j].t = placeType; return true; } // tap a sign: change it, or take it away
    let best = -1, bd = 1.1, side = 1;
    sim.geoms.forEach((G, p) => { const q = G.paths[0].at(0.5), e = Math.hypot(q.x - x, q.y - y); if (e < bd) { bd = e; best = p; side = (x - q.x) * -Math.sin(q.ang) + (y - q.y) * Math.cos(q.ang) < 0 ? -1 : 1; } });
    if (best < 0) return false;
    const same = proj.dests.findIndex(d => d.p === best && d.side === side);
    if (same >= 0) { proj.dests[same].t = placeType; return true; }
    if (proj.dests.length >= TM.MAX_DESTS) { if (host.toast) host.toast('That’s enough places for one track.'); return false; }
    proj.dests.push({ t: placeType, p: best, side }); return true;
  }
  function tapAt(x, y) { const before = snapshot(); if (running() || !applyTool(x, y)) return false; undo.push(before); if (undo.length > 80) undo.shift(); redo = []; afterEdit(); return true; }

  // ── the view: the whole track always fits, with room round the edges for the next piece
  function view() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const G of sim.geoms) for (const pth of G.paths) for (let i = 0; i <= 4; i++) { const q = pth.at(i / 4); x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
    for (const d of proj.dests) { const q = destSpot(sim.geoms, d); if (q) { x0 = Math.min(x0, q.x - 0.2); x1 = Math.max(x1, q.x + 0.2); y0 = Math.min(y0, q.y - 0.2); y1 = Math.max(y1, q.y + 0.35); } }
    if (!isFinite(x0)) { x0 = -3; x1 = 3; y0 = -2; y1 = 2; }
    const box = $('tlCheck'), top = box && !box.hidden ? box.offsetHeight + 14 : 0, hv = Math.max(80, h - top); // leave room for the challenge's jobs
    const m = 0.8, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, ww = Math.max(6, x1 - x0 + 2 * m), hh = Math.max(3.6, y1 - y0 + 2 * m);
    const T = Math.min(w / ww, hv / hh, 150);
    if (cam) return { T: cam.T, ox: w / 2 - cam.x * cam.T, oy: h / 2 - cam.y * cam.T, w, h, fit: false };
    return { T, ox: w / 2 - cx * T, oy: top + hv / 2 - cy * T, w, h, fit: true };
  }
  // ── zoom and move round: drag the mat to move, wheel / pinch / the + − buttons to zoom, Fit to see the whole track again
  const ZMIN = 12, ZMAX = 260;
  function camNow() { const V = view(); return { T: V.T, x: (V.w / 2 - V.ox) / V.T, y: (V.h / 2 - V.oy) / V.T }; }
  function zoomAt(f, sx, sy) { // keep the world point under (sx, sy) where it is
    const c = camNow(), V = view(), w = V.w, h = V.h;
    if (sx === undefined) { sx = w / 2; sy = h / 2; }
    const wx = (sx - V.ox) / V.T, wy = (sy - V.oy) / V.T, T = Math.max(ZMIN, Math.min(ZMAX, c.T * f));
    cam = { T, x: wx - (sx - w / 2) / T, y: wy - (sy - h / 2) / T }; showFit();
  }
  function panBy(dx, dy) { const c = camNow(); cam = { T: c.T, x: c.x - dx / c.T, y: c.y - dy / c.T }; showFit(); }
  function fitView() { cam = null; showFit(); }
  function showFit() { const b = $('tlFit'); if (b) b.classList.toggle('on', !cam); }
  function localXY(e) { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function worldFromEvent(e) { const p = localXY(e), V = view(); return { x: (p.x - V.ox) / V.T, y: (p.y - V.oy) / V.T }; }
  const ptrs = new Map(); let gesture = null; // gesture: { kind: 'tap'|'pan'|'pinch', ... }
  canvas.addEventListener('pointerdown', e => {
    audio(); // sounds may only start after a tap (iPad)
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* old browsers */ }
    ptrs.set(e.pointerId, localXY(e)); e.preventDefault();
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; gesture = { kind: 'pinch', d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; }
    else if (ptrs.size === 1) { const p = localXY(e); gesture = { kind: 'tap', x0: p.x, y0: p.y, x: p.x, y: p.y, at: worldFromEvent(e) }; }
  });
  canvas.addEventListener('pointermove', e => {
    hover = worldFromEvent(e);
    if (!ptrs.has(e.pointerId) || !gesture) return;
    const p = localXY(e); ptrs.set(e.pointerId, p);
    if (gesture.kind === 'pinch' && ptrs.size >= 2) {
      const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      if (gesture.d > 0) zoomAt(d / gesture.d, mx, my);
      panBy(mx - gesture.mx, my - gesture.my); gesture.d = d; gesture.mx = mx; gesture.my = my; return;
    }
    if (gesture.kind === 'tap' && Math.hypot(p.x - gesture.x0, p.y - gesture.y0) > 7) gesture.kind = 'pan'; // it's a drag, not a tap
    if (gesture.kind === 'pan') { panBy(p.x - gesture.x, p.y - gesture.y); canvas.classList.add('panning'); }
    gesture.x = p.x; gesture.y = p.y;
  });
  function endPointer(e) {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.delete(e.pointerId);
    if (gesture && gesture.kind === 'tap' && e.type === 'pointerup' && !running()) tapAt(gesture.at.x, gesture.at.y);
    if (!ptrs.size) { gesture = null; canvas.classList.remove('panning'); }
    else if (gesture && gesture.kind === 'pinch') { const [a] = [...ptrs.values()]; gesture = { kind: 'pan', x: a.x, y: a.y }; }
  }
  canvas.addEventListener('pointerup', endPointer); canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('pointerleave', () => { hover = null; });
  canvas.addEventListener('wheel', e => {
    e.preventDefault(); const p = localXY(e);
    if (e.ctrlKey || Math.abs(e.deltaY) >= Math.abs(e.deltaX)) zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), p.x, p.y); // wheel / trackpad pinch
    else panBy(-e.deltaX, 0);
  }, { passive: false });

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
    const goal = checker && running() && !checker.complete() ? checker.steps[checker.current()] : null;
    const order = orderLabels(proj.challenge);
    proj.dests.forEach((d, j) => {
      const q = destSpot(sim.geoms, d); if (!q) return;
      if (goal && goal.d === j) { g.save(); g.strokeStyle = '#ffd23a'; g.lineWidth = 4; g.beginPath(); g.arc(ox + q.x * T, oy + q.y * T, Math.max(9, T * 0.2) + 6, 0, Math.PI * 2); g.stroke(); g.restore(); }
      drawDest(g, T, ox + q.x * T, oy + q.y * T, d.t, TM.DESTS[d.t]);
      if (order[j]) drawDestBadge(g, T, ox + q.x * T, oy + q.y * T, order[j]);
    });
    if (hover && !touchy && tool === 'place' && !running()) { g.save(); g.globalAlpha = 0.5; drawDestIcon(g, placeType, ox + hover.x * T, oy + hover.y * T, Math.max(9, T * 0.2)); g.restore(); }
    for (const w of sim.freeWagons()) drawWagon(g, T * TRAIN_SIZE, ox + w.x * T, oy + w.y * T, w.ang, w.color);
    sim.trains.forEach((tr, i) => { const p = sim.wagonPose(i); if (p) drawWagon(g, T * TRAIN_SIZE, ox + p.x * T, oy + p.y * T, p.ang, tr.wagon.color); });
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
    if (runner && runner.running()) {
      runner.tick(dt);
      if (checker) { checker.tick(dt); renderCheck(); if (checker.complete() && !cheered) { cheered = true; playSound('dingdong'); status('Challenge complete! Well done.', 'ok'); } }
    }
    renderVars();
    $('tlRun').classList.toggle('on', running());
    root.querySelector('.tl').classList.toggle('playing', running());
    draw();
  }

  // the program's variables on the board (like Scratch's monitors), so pupils can watch a count go up
  let varsKey = '';
  function renderVars() {
    const v = runner && runner._vars ? runner._vars() : null, names = v ? Object.keys(v).sort() : [];
    const show = v ? names.map(n => [n, typeof v[n] === 'number' ? Math.round(v[n] * 100) / 100 : String(v[n]).slice(0, 20)]) : [];
    const key = JSON.stringify(show); if (key === varsKey) return; varsKey = key;
    const box = $('tlVars'); box.hidden = !show.length;
    box.innerHTML = show.map(([n, x]) => `<div><span>${esc(n)}</span><b>${esc(String(x))}</b></div>`).join('');
  }
  function run() {
    audio();
    if (!ws) return;
    flush(); rebuild();
    if (!sim.trains.some(t => t.on)) { status('Put a train on the track first: pick the train tool and tap a piece.', 'bad'); return; }
    checker = proj.challenge && proj.challenge.steps.length ? TM.createChecker(sim, sim.project.challenge) : null; cheered = false; renderCheck();
    runner.start(ws);
    status('Running · trains with no blocks of their own drive by themselves and follow the snaps', 'ok');
    canvas.focus({ preventScroll: true });
  }
  function stop() { if (runner) runner.stop(); }
  function reset() { if (runner) runner.stop(true); rebuild(); checker = null; renderCheck(); status('Press Run: the trains follow the snaps by themselves. Add blocks to do more.'); }

  function typing(e) { const t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable); }
  function onKey(e) {
    if (!alive || !root.offsetParent || typing(e)) return;
    if (e.type === 'keydown' && (e.ctrlKey || e.metaKey) && !running() && document.activeElement === canvas) {
      if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); if (e.shiftKey) doRedo(); else doUndo(); }
      else if (e.key === 'y') { e.preventDefault(); doRedo(); }
      return;
    }
    if (e.type === 'keydown' && document.activeElement === canvas && !e.ctrlKey && !e.metaKey) {
      if (e.key === '+' || e.key === '=') { zoomAt(1.3); e.preventDefault(); return; }
      if (e.key === '-' || e.key === '_') { zoomAt(1 / 1.3); e.preventDefault(); return; }
      if (e.key === '0') { fitView(); e.preventDefault(); return; }
      if (!running() && KEYNAME[e.key] && e.key !== ' ') { const d = 60; panBy(e.key === 'ArrowLeft' ? d : e.key === 'ArrowRight' ? -d : 0, e.key === 'ArrowUp' ? d : e.key === 'ArrowDown' ? -d : 0); e.preventDefault(); return; }
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
  $('tlWagon').addEventListener('change', () => { const t = proj.trains[sel]; if (!t || running()) return; remember(); t.wagon = $('tlWagon').checked; rebuild(); changed(); });


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

  // ── challenges: the checklist on the board, the Challenges panel and the printable challenge card
  const STEP_WORDS = { start: 'Start at the', pass: 'Go past the', stop: 'Stop at the', reverse: 'Turn back at the', pickup: 'Pick up the wagon at the', drop: 'Drop off the wagon at the', end: 'End your route at the' };
  const placeName = d => (d ? (d.t === 'start' ? 'start flag' : TM.DESTS[d.t].toLowerCase()) : '…');
  const stepText = s => STEP_WORDS[s.a] + ' ' + placeName(proj.dests[s.d]);
  const typed = (v, n) => String(v || '').replace(/[<>]/g, '').slice(0, n);
  const readyOf = ch => (ch && ch.id ? CHALLENGES.find(c => c.id === ch.id) : null);
  function renderCheck() {
    const box = $('tlCheck'), ch = proj.challenge;
    if (!ch || !ch.steps.length) { box.hidden = true; checkKey = ''; return; }
    const live = !!checker, cur = live ? checker.current() : -1, done = live ? checker.done : [], won = live && checker.complete();
    const key = JSON.stringify([ch.title, ch.steps, proj.dests, cur, won, live]);
    if (key === checkKey) return; checkKey = key; box.hidden = false;
    box.innerHTML = `<b>${esc(ch.title || 'My challenge')}</b><ol>${ch.steps.map((s, i) => `<li class="${done[i] ? 'ok' : ''}${i === cur && !won ? ' now' : ''}">${done[i] ? ic('i-check') : ''}${esc(stepText(s))}</li>`).join('')}</ol>` + (won ? `<p class="tl-win">${ic('i-flag')} Challenge complete!</p>` : '');
  }
  function openPanel() { if (running()) stop(); $('tlModal').hidden = false; renderPanel(); const f = $('tlModal').querySelector('button, input'); if (f) f.focus(); }
  function closePanel() { $('tlModal').hidden = true; }
  $('tlMClose').onclick = closePanel;
  $('tlModal').addEventListener('pointerdown', e => { if (e.target === $('tlModal')) closePanel(); });
  $('tlModal').addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); closePanel(); } });
  function destOptions(sel) {
    const seen = {};
    return proj.dests.map((d, j) => { seen[d.t] = (seen[d.t] || 0) + 1; const many = proj.dests.filter(o => o.t === d.t).length > 1; return `<option value="${j}"${j === sel ? ' selected' : ''}>${esc(TM.DESTS[d.t])}${many ? ' ' + seen[d.t] : ''}</option>`; }).join('');
  }
  function renderPanel() {
    const ch = proj.challenge, ready = readyOf(ch), body = $('tlMBody');
    let mine;
    if (!ch) mine = `<p>Make your own: put places beside your track with the <b>Places</b> tool, then give Train 1 some jobs to do there.</p><button type="button" class="tl-small tl-go" id="tlChNew">${ic('i-plus')} Make a challenge for this track</button>`;
    else mine = `
      <label class="tl-field">Title <input id="tlChTitle" maxlength="60" value="${esc(ch.title)}"></label>
      <label class="tl-field">What to do <textarea id="tlChText" maxlength="400" rows="2">${esc(ch.text)}</textarea></label>
      <div class="tl-field">Jobs for Train 1, in order <span class="tl-note" style="margin:0;font-weight:600">· the numbers show on the places too; you can also pick the <b>Order</b> tool and tap the places one after another</span></div>
      ${proj.dests.length ? `<ol class="tl-steps">${ch.steps.map((s, i) => `<li><select data-sd="${i}" aria-label="Job ${i + 1}: what">${Object.keys(TM.ACTIONS).map(a => `<option value="${a}"${a === s.a ? ' selected' : ''}>${esc(STEP_WORDS[a])}</option>`).join('')}</select>
        <select data-sp="${i}" aria-label="Job ${i + 1}: where">${destOptions(s.d)}</select>
        <button type="button" class="tl-small tl-mv" data-su="${i}" aria-label="Move job ${i + 1} up"${i ? '' : ' disabled'}>&#9650;</button><button type="button" class="tl-small tl-mv" data-sw="${i}" aria-label="Move job ${i + 1} down"${i < ch.steps.length - 1 ? '' : ' disabled'}>&#9660;</button>
        <button type="button" class="tl-small" data-sx="${i}" aria-label="Take job ${i + 1} away">${ic('i-x')}</button></li>`).join('')}</ol>
        ${ch.steps.length < 12 ? `<button type="button" class="tl-small" id="tlStepAdd">${ic('i-plus')} Add a job</button>` : ''}`
      : '<p class="tl-note">There are no places beside the track yet. Pick the <b>Places</b> tool and tap beside a piece to put up a sign.</p>'}
      ${ready ? `<p class="tl-note"><b>Hint:</b> ${esc(ready.hint)}</p>` : ''}
      <div class="tl-mrow">
        <label class="tl-check-opt"><input type="checkbox" id="tlCardAns"> Put the snaps on the card (an answer card)</label>
        <button type="button" class="tl-small tl-go" id="tlCardPrint">${ic('i-print')} Print the challenge card</button>
        ${ready ? `<button type="button" class="tl-small" id="tlChAnswer">${ic('i-bulb')} Show the answer</button>` : ''}
        <button type="button" class="tl-small" id="tlChRemove">${ic('i-trash')} Remove the challenge</button>
      </div>`;
    body.innerHTML = `<h2 id="tlMTitle">${ic('i-flag')} Challenges</h2>
      <p class="tl-mlede">A challenge is a track with places beside it and jobs for Train 1 to do. Solve it with snaps (or blocks) and press Run: the jobs tick off as the train does them. Print the card and build it with the real track too.</p>
      <h3>Ready-made challenges</h3>
      <div class="tl-cards">${CHALLENGES.map(c => `<button type="button" class="tl-ccard${ready && ready.id === c.id ? ' on' : ''}" data-ch="${c.id}"><b>${esc(c.title)}</b><small>Level ${c.level}</small><span>${esc(c.text)}</span></button>`).join('')}</div>
      <h3>${ch ? 'This challenge' : 'Your own challenge'}</h3>${mine}`;
    body.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => loadChallenge(b.dataset.ch));
    const on = (id, f) => { const el = $(id); if (el) el.onclick = f; };
    on('tlChNew', () => { remember(); proj.challenge = { id: '', title: 'My challenge', text: '', steps: proj.dests.length ? [{ d: 0, a: proj.dests[0].t === 'start' ? 'start' : 'stop' }] : [] }; challengeEdited(); });
    on('tlStepAdd', () => { remember(); ch.steps.push({ d: Math.min(proj.dests.length - 1, ch.steps.length ? ch.steps[ch.steps.length - 1].d + 1 : 0), a: 'stop' }); challengeEdited(); });
    on('tlChRemove', async () => { if (!(await ask('Take the challenge away? The track and the places stay.'))) return; remember(); proj.challenge = null; challengeEdited(); });
    on('tlChAnswer', showAnswer);
    on('tlCardPrint', () => printCard($('tlCardAns').checked));
    const swap = (i, k) => { if (k < 0 || k >= ch.steps.length) return; remember(); [ch.steps[i], ch.steps[k]] = [ch.steps[k], ch.steps[i]]; challengeEdited(); };
    body.querySelectorAll('[data-su]').forEach(b => b.onclick = () => swap(Number(b.dataset.su), Number(b.dataset.su) - 1));
    body.querySelectorAll('[data-sw]').forEach(b => b.onclick = () => swap(Number(b.dataset.sw), Number(b.dataset.sw) + 1));
    body.querySelectorAll('[data-sx]').forEach(b => b.onclick = () => { remember(); ch.steps.splice(Number(b.dataset.sx), 1); challengeEdited(); });
    body.querySelectorAll('[data-sd]').forEach(s => s.onchange = () => { remember(); ch.steps[Number(s.dataset.sd)].a = s.value; challengeEdited(); });
    body.querySelectorAll('[data-sp]').forEach(s => s.onchange = () => { remember(); ch.steps[Number(s.dataset.sp)].d = Number(s.value); challengeEdited(); });
    const ti = $('tlChTitle'), tx = $('tlChText');
    if (ti) ti.oninput = () => { ch.title = typed(ti.value, 60); ch.id = ''; renderCheck(); changed(); };
    if (tx) tx.oninput = () => { ch.text = typed(tx.value, 400); renderCheck(); changed(); };
  }
  function challengeEdited() { checker = null; renderCheck(); renderPanel(); changed(); }
  async function loadChallenge(id) {
    const c = CHALLENGES.find(x => x.id === id); if (!c) return;
    if (proj.pieces.length && !(await ask('Open the “' + c.title + '” challenge? It takes the place of this track and its blocks (save first if you want to keep them).'))) return;
    if (runner) runner.stop(true);
    proj = TM.cleanProject(challengeProject(id)); sel = 0; undo = []; redo = []; checker = null; cam = null; showFit();
    rebuild(); renderTrains(); renderTools(); renderCheck(); loadBlocks(); changed(); renderPanel();
    status('Challenge: ' + c.title + '. Put snaps on the track so Train 1 does every job, then press Run.');
  }
  async function showAnswer() {
    const ready = readyOf(proj.challenge); if (!ready) return;
    const fresh = challengeProject(ready.id, true);
    if (fresh.pieces.length !== proj.pieces.length || fresh.pieces.some((pc, i) => pc[0] !== proj.pieces[i][0])) { if (host.toast) host.toast('The track has been changed, so the answer won’t fit any more. Open the challenge again to see it.'); return; }
    if (!(await ask('Show the answer? It puts the right snaps on the track for you.'))) return;
    remember(); fresh.pieces.forEach((pc, i) => { proj.pieces[i][4] = pc[4]; }); afterEdit(); closePanel();
    status('Here is one answer. Press Run to watch it.', 'ok');
  }
  // the track as a picture for the card: places, the trains where they start, wagons; snaps only on an answer card
  function trackPicture(withSnaps, W = 1200, H = 720) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, H);
    const P = TM.cleanProject(Object.assign({}, proj, { pieces: proj.pieces.map(pc => [pc[0], pc[1], pc[2], pc[3], withSnaps ? pc[4] : null]) }));
    const s2 = TM.createSim(P);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const grow = (x, y, m) => { x0 = Math.min(x0, x - m); y0 = Math.min(y0, y - m); x1 = Math.max(x1, x + m); y1 = Math.max(y1, y + m); };
    for (const G of s2.geoms) for (const pth of G.paths) for (let i = 0; i <= 6; i++) { const q = pth.at(i / 6); grow(q.x, q.y, 0.3); }
    for (const d of P.dests) { const q = destSpot(s2.geoms, d); if (q) { grow(q.x, q.y, 0.3); grow(q.x, q.y + 0.5, 0); grow(q.x - 0.55, q.y, 0); grow(q.x + 0.55, q.y, 0); } }
    if (!isFinite(x0)) return cv.toDataURL('image/png');
    const T = Math.min(W / (x1 - x0), H / (y1 - y0)) * 0.94, ox = W / 2 - (x0 + x1) / 2 * T, oy = H / 2 - (y0 + y1) / 2 * T;
    s2.geoms.forEach((G, p) => drawPiece(c, T, ox, oy, G, P.pieces[p][4], 'bed'));
    s2.geoms.forEach((G, p) => drawPiece(c, T, ox, oy, G, P.pieces[p][4], 'top'));
    const order = orderLabels(P.challenge);
    P.dests.forEach((d, j) => { const q = destSpot(s2.geoms, d); if (q) { drawDest(c, T, ox + q.x * T, oy + q.y * T, d.t, TM.DESTS[d.t]); if (order[j]) drawDestBadge(c, T, ox + q.x * T, oy + q.y * T, order[j]); } });
    for (const w of s2.freeWagons()) drawWagon(c, T * TRAIN_SIZE, ox + w.x * T, oy + w.y * T, w.ang, w.color);
    s2.trains.forEach((tr, i) => { const p = s2.wagonPose(i); if (p) drawWagon(c, T * TRAIN_SIZE, ox + p.x * T, oy + p.y * T, p.ang, tr.wagon.color); });
    s2.trains.forEach((tr, i) => { const p = s2.pose(i); if (p) drawTrain(c, T * TRAIN_SIZE, ox + p.x * T, oy + p.y * T, p.ang, tr, { label: s2.trains.length > 1 ? tr.name : '' }); });
    return cv.toDataURL('image/png');
  }
  function iconURL(type) { const cv = document.createElement('canvas'); cv.width = cv.height = 64; drawDestIcon(cv.getContext('2d'), type, 32, 32, 28); return cv.toDataURL('image/png'); }
  function cardHTML(withAnswer) {
    const ch = proj.challenge || { title: 'My track', text: '', steps: [] }, ready = readyOf(ch);
    const parts = {}, snaps = {};
    for (const pc of proj.pieces) { parts[pc[0]] = (parts[pc[0]] || 0) + 1; for (const s of pc[4] || []) if (s) snaps[s] = (snaps[s] || 0) + 1; }
    const li = 'margin:0 0 4px;font-size:15px;';
    const steps = ch.steps.map((s, i) => { const d = proj.dests[s.d]; return `<li style="${li}display:flex;align-items:center;gap:10px;margin-bottom:6px"><b style="width:18px">${i + 1}.</b><img src="${d ? iconURL(d.t) : ''}" alt="" style="width:30px;height:30px">${esc(stepText(s))}</li>`; }).join('');
    const partList = Object.keys(parts).map(k => `<li style="${li}">${parts[k]} × ${esc(TM.PIECES[k].name.toLowerCase())}</li>`).join('');
    const snapList = Object.keys(snaps).length ? Object.keys(snaps).map(k => `<li style="${li}display:flex;align-items:center;gap:8px"><span style="display:inline-block;width:16px;height:16px;border-radius:3px;border:1px solid #555;background:${TM.SNAPS[k]}"></span>${snaps[k]} × ${k}</li>`).join('') : `<li style="${li}">No snaps yet.</li>`;
    const extras = [proj.trains.some(t => t.wagon) || proj.wagons.length ? 'a wagon' : '', proj.trains.length > 1 ? proj.trains.length + ' trains' : '1 train'].filter(Boolean).join(' and ');
    return `<div style="font-family:Montserrat,Arial,sans-serif;color:#1f2024;border:3px solid #1f2024;border-radius:18px;padding:18px 22px;max-width:760px;margin:0 auto;break-inside:avoid;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;border-bottom:2px solid #ddd;padding-bottom:6px">
        <h1 style="margin:0;font-size:28px">${esc(ch.title || 'My challenge')}</h1>
        <span style="font-size:13px;font-weight:700;color:#555;white-space:nowrap">Train Lab challenge${ready ? ' · Level ' + ready.level : ''}${withAnswer ? ' · ANSWER' : ''}</span>
      </div>
      ${ch.text ? `<p style="font-size:16px;margin:10px 0">${esc(ch.text)}</p>` : ''}
      <img src="${trackPicture(withAnswer)}" alt="The track" style="width:100%;border:1px solid #ccc;border-radius:10px;margin:6px 0 10px">
      ${steps ? `<h2 style="font-size:19px;margin:6px 0">Your mission</h2><ol style="list-style:none;padding-left:4px;margin:0 0 10px">${steps}</ol>` : ''}
      <div style="display:flex;gap:28px;flex-wrap:wrap">
        <div><h3 style="font-size:15px;margin:6px 0">Track you need</h3><ul style="padding-left:18px;margin:0">${partList}<li style="${li}">${extras}</li></ul></div>
        <div><h3 style="font-size:15px;margin:6px 0">Snaps</h3>${withAnswer ? `<ul style="list-style:none;padding:0;margin:0">${snapList}</ul>` : `<p style="font-size:14px;margin:0;max-width:300px">Work out which snaps you need and where they go. Try it in the Train Lab, then build it with the real track.${ready ? '<br><b>Hint:</b> ' + esc(ready.hint) : ''}</p>`}</div>
      </div>
      <p style="font-size:11px;color:#777;margin:12px 0 0">Made with CodeJump · codejump.co.uk</p>
    </div>`;
  }
  function printCard(withAnswer) {
    const html = cardHTML(withAnswer);
    if (host.print) { host.print(html); return; }
    const w = window.open('', '_blank'); if (!w) return;
    w.document.write('<!doctype html><meta charset="utf-8"><title>Challenge card</title>' + html); w.document.close(); w.focus(); w.print();
  }
  $('tlChal').onclick = openPanel;
  $('tlZoomIn').onclick = () => zoomAt(1.3); $('tlZoomOut').onclick = () => zoomAt(1 / 1.3); $('tlFit').onclick = fitView;

  function getProject() {
    flush();
    return JSON.parse(JSON.stringify({ v: 2, pieces: proj.pieces, trains: proj.trains, wagons: proj.wagons, dests: proj.dests, challenge: proj.challenge, blocks: proj.blocks || null }));
  }
  return {
    ready,
    getProject,
    setProject(p) {
      if (runner) runner.stop(true);
      proj = TM.cleanProject(p || defaultProject()); if (!proj.trains.length) proj = TM.cleanProject(defaultProject());
      sel = 0; undo = []; redo = []; checker = null; cam = null; showFit(); closePanel();
      rebuild(); renderTrains(); renderTools(); renderCheck(); loadBlocks();
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
    run, stop, reset, setTool, selectTrain, zoomAt, panBy, fitView, _cam: () => cam, openChallenges: openPanel, cardHTML, setPlace: k => { if (TM.DESTS[k]) { placeType = k; setTool('place'); } },
    _checker: () => checker,
    _sim: () => sim, _runner: () => runner, _ws: () => ws, _proj: () => proj, _tapWorld: tapAt, _openEnds: () => openEnds(),
  };
}
