/* Brick Lab — code a robotics hub over Web Bluetooth (Phase 1: works with LEGO® Education WeDo 2.0). Blocks on the left,
 * the live hub panel on the right (connect, battery, what's in each port, live readings, the light), Run / Stop.
 * "Try without a hub" uses a pretend hub with on-screen tilt and distance controls.
 * Lazy-loaded by build-and-play.html when a Brick Lab project opens, and mounted into #bricklab-ui. CodeJump owns saving and
 * sharing: getProject() goes into the payload as `bricklab`.
 *   const lab = mount(root, { project, onChange, toast })  → getProject · setProject · resume · pause · destroy · liveParts/liveSet/liveBusy
 * Hubs are reached only through drivers/hub-driver.js; this file has no Bluetooth code of its own. */
import { bluetoothSupport } from './drivers/hub-driver.js';
import { WeDo2Hub } from './drivers/wedo2.js';
import { SimHub } from './drivers/sim.js';
import * as BL from './brick-blocks.js';
import { createRunner, tiltedWay, tiltAngle, DIRS } from './brick-run.js';

const CSS_URL = new URL('./brick-app.css', import.meta.url).href;
const I = d => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  play: I('<path d="M7 4l13 8-13 8z" fill="currentColor"/>'), stop: I('<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>'),
  undo: I('<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>'), redo: I('<path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>'),
  bt: I('<path d="M7 7l10 10-5 5V2l5 5L7 17"/>'), plug: I('<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>'),
  motor: I('<circle cx="12" cy="12" r="8"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4"/>'), tilt: I('<path d="M4 18l16-8"/><circle cx="12" cy="14" r="2"/><path d="M6 21h12"/>'),
  distance: I('<path d="M3 12h4M17 12h4"/><path d="M10 8l-3 4 3 4M14 8l3 4-3 4"/>'), battery: I('<rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 11v2"/>'),
  sim: I('<rect x="3" y="6" width="18" height="12" rx="3"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/>'), x: I('<path d="M6 6l12 12M18 6L6 18"/>')
};
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const UNSUPPORTED = 'Brick Lab needs Chrome or Edge on a Chromebook, Windows PC, Mac or Android tablet.';
const TEMPLATE = `
<div class="bk">
  <div class="bk-bar">
    <input class="bk-title" id="bkTitle" maxlength="40" aria-label="Project name" spellcheck="false">
    <button class="bk-btn run" id="bkRun">${ICON.play}<span>Run</span></button>
    <span class="bk-status" id="bkStatus"></span>
    <span class="bk-sp"></span>
    <button class="bk-btn icon" id="bkUndo" title="Undo (Ctrl+Z)" aria-label="Undo">${ICON.undo}</button>
    <button class="bk-btn icon" id="bkRedo" title="Redo (Ctrl+Y)" aria-label="Redo">${ICON.redo}</button>
  </div>
  <div class="bk-main">
    <div class="bk-blocks" id="bkBlocks"></div>
    <aside class="bk-panel" id="bkPanel" aria-live="polite"></aside>
  </div>
</div>`;

export function mount(root, host) {
  host = host || {};
  if (!document.querySelector('link[data-brick-css]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = CSS_URL; l.setAttribute('data-brick-css', ''); document.head.appendChild(l); }
  root.innerHTML = TEMPLATE;
  const $ = id => root.querySelector('#' + id), bk = root.querySelector('.bk');
  const toast = m => { if (host.toast) host.toast(m); };
  const Blockly = window.Blockly;
  const support = host.bluetooth === undefined ? bluetoothSupport() : (host.bluetooth ? { ok: true } : { ok: false, reason: 'no-api' });
  let proj, ws = null, quiet = false, destroyed = false, hub = null, offHub = [], everConnected = false, lost = false;
  BL.defineBlocks(Blockly);
  const runner = createRunner(() => hub, { onScript: id => { if (ws && id) { try { ws.highlightBlock(id); setTimeout(() => { try { ws.highlightBlock(null); } catch (e) { /* gone */ } }, 400); } catch (e) { /* none */ } } } });

  function clean(p) {
    p = p && typeof p === 'object' ? p : {};
    const ok = v => ['motor', 'tilt', 'distance', ''].includes(v) ? v : null;
    const sim = p.sim && typeof p.sim === 'object' ? p.sim : {};
    let blocks = p.blocks && typeof p.blocks === 'object' ? p.blocks : BL.starterProgram();
    try { if (JSON.stringify(blocks).length > 500000) blocks = BL.starterProgram(); } catch (e) { blocks = BL.starterProgram(); }
    return { v: 1, title: String(p.title || 'My hub project').slice(0, 40), hub: 'wedo2', blocks, sim: { A: ok(sim.A) ?? 'motor', B: ok(sim.B) ?? 'tilt' } };
  }
  function load(p) {
    proj = clean(p);
    if (ws) { quiet = true; try { ws.clear(); Blockly.serialization.workspaces.load(proj.blocks, ws); ws.clearUndo(); } catch (e) { ws.clear(); } finally { quiet = false; } }
    $('bkTitle').value = proj.title;
    if (hub && hub.kind === 'sim') hub.configure(proj.sim);
  }
  function saveBlocks() { if (!ws) return; const b = Blockly.serialization.workspaces.save(ws); if (JSON.stringify(b) === JSON.stringify(proj.blocks)) return; proj.blocks = b; if (!quiet && host.onChange) host.onChange(); }

  // ── the hub ──
  function useHub(h) {
    for (const f of offHub) f(); offHub = [];
    hub = h; lost = false;
    offHub.push(h.on('change', panel), h.on('value', values), h.on('disconnect', () => {
      if (runner.running()) { runner.stop(false); bar(); }
      if (h.kind !== 'sim') { lost = true; toast('Your hub has disconnected.'); }
      panel();
    }));
  }
  async function connectReal(again) {
    if (!support.ok) return;
    try {
      const h = again && hub && hub.kind === 'wedo2' ? hub : new WeDo2Hub(host.bluetooth || navigator.bluetooth);
      if (!(again && h === hub)) { if (hub && hub.kind === 'sim') hub.disconnect(); await h.request(); useHub(h); } // the picker: straight from the tap
      panel(); await h.connect(); everConnected = true; lost = false;
      h.light(0, 0, 255); toast('Connected to ' + h.name + '.');
    } catch (e) {
      const msg = String(e && (e.name || e.message) || '');
      if (/NotFound|cancel/i.test(msg)) { /* the pupil closed the picker */ } else toast(again ? 'Couldn’t reach the hub. Is it switched on? Press its button, then try again.' : 'Couldn’t connect. Switch the hub on, press its button, then try again.');
    }
    panel();
  }
  function trySim() { if (hub && hub.kind !== 'sim') { runner.stop(); hub.disconnect(); } const h = new SimHub(proj.sim); useHub(h); h.connect(); everConnected = true; panel(); }
  function disconnect() { runner.stop(); if (hub) hub.disconnect(); if (hub && hub.kind === 'sim') { for (const f of offHub) f(); offHub = []; hub = null; } lost = false; bar(); panel(); }

  // ── the panel ──
  const DEV = { motor: ['Motor', ICON.motor], tilt: ['Tilt sensor', ICON.tilt], distance: ['Distance sensor', ICON.distance], unknown: ['Something we don’t know', ICON.plug] };
  function reading(p) {
    const d = hub.ports[p] && hub.ports[p].device, v = hub.values[p] || {};
    if (d === 'motor') { const pw = hub.kind === 'sim' ? hub.motors[p] : null; return pw == null ? '' : `<div class="bk-motor${pw ? ' on' : ''}" style="--spin:${pw ? (1.6 - Math.abs(pw) / 100).toFixed(2) + 's' : '0s'};--dir:${pw < 0 ? 'reverse' : 'normal'}"><i></i><span>${pw ? (pw > 0 ? 'Turning this way' : 'Turning that way') + ' · ' + Math.abs(pw) : 'Off'}</span></div>`; }
    if (d === 'tilt') { const t = v.tilt, w = tiltedWay(t); return `<div class="bk-read"><b>${w ? 'Tilted ' + w : 'Level'}</b>${t ? `<span>forward ${tiltAngle(t, 'forward')}° · back ${tiltAngle(t, 'back')}° · left ${tiltAngle(t, 'left')}° · right ${tiltAngle(t, 'right')}°</span>` : '<span>Waiting for a reading…</span>'}</div>`; }
    if (d === 'distance') { const n = v.distance; return `<div class="bk-read"><b>${n == null ? '…' : n}</b><span class="bk-meter"><i style="width:${n == null ? 0 : Math.min(100, n)}%"></i></span></div>`; }
    return '';
  }
  function panel() {
    if (destroyed) return;
    const P = $('bkPanel'), st = hub ? hub.state : 'disconnected', on = st === 'connected', sim = hub && hub.kind === 'sim';
    let h = `<h3>Your hub</h3>`;
    if (!support.ok && !sim) h += `<div class="bk-note warn">${esc(UNSUPPORTED)}</div><p class="bk-hint">You can still write code and test it with a pretend hub.</p>`;
    h += `<div class="bk-state ${st}"><i></i><span>${on ? 'Connected' : st === 'connecting' ? 'Connecting…' : 'Not connected'}</span>${hub && (on || st === 'connecting') ? `<b>${esc(hub.name)}</b>` : ''}</div>`;
    if (lost && !on) h += `<div class="bk-note">Your hub has disconnected. It may be switched off or too far away. Switch it on, then press <b>Reconnect</b>.</div>`;
    if (!on && st !== 'connecting') {
      h += `<div class="bk-acts">${support.ok ? (lost ? `<button class="bk-btn gold big" id="bkReconnect">${ICON.bt} Reconnect</button><button class="bk-btn" id="bkConnect">Choose another hub</button>` : `<button class="bk-btn gold big" id="bkConnect">${ICON.bt} Connect WeDo 2.0</button>`) : ''}
        <button class="bk-btn" id="bkSim">${ICON.sim} Try without a hub</button></div>
        ${support.ok ? '<p class="bk-hint">Switch the hub on (press its green button) so its light flashes, then press Connect and choose it from the list.</p>' : ''}`;
    }
    if (on) {
      h += `<div class="bk-row">${ICON.battery}<span>${hub.battery != null ? 'Battery ' + hub.battery + '%' : hub.batteryLow ? 'Battery low' : 'Battery OK'}</span>${hub.batteryLow ? '<b class="bk-low">Change the batteries soon</b>' : ''}</div>`;
      h += ['A', 'B'].map(p => { const d = hub.ports[p] && hub.ports[p].device, D = DEV[d]; return `<div class="bk-port${d ? '' : ' empty'}"><div class="bk-port-h"><span class="bk-letter">${p}</span>${D ? D[1] + `<b>${D[0]}</b>` : '<b>Nothing plugged in</b>'}</div>${d ? reading(p) : ''}
        ${sim ? `<select class="bk-pick" data-port="${p}" aria-label="What is plugged into port ${p}"><option value="">Nothing</option>${['motor', 'tilt', 'distance'].map(k => `<option value="${k}"${d === k ? ' selected' : ''}>${DEV[k][0]}</option>`).join('')}</select>` : ''}</div>`; }).join('');
      if (sim) h += simControls();
      const c = sim ? hub.colour : null;
      h += `<div class="bk-row">${c ? `<i class="bk-swatch" style="background:rgb(${c.join(',')})"></i>` : ''}<span>${sim ? 'Hub light' : 'The hub’s light shows the colour your blocks choose.'}</span></div>`;
      h += `<div class="bk-acts"><button class="bk-btn" id="bkDisconnect">${sim ? 'Stop pretending' : 'Disconnect'}</button></div>`;
    }
    h += `<p class="bk-small">Works with LEGO® Education WeDo 2.0. LEGO is a trademark of the LEGO Group, which does not sponsor, authorise or endorse CodeJump.</p>`;
    P.innerHTML = h;
    const b = id => P.querySelector('#' + id);
    if (b('bkConnect')) b('bkConnect').onclick = () => connectReal(false);
    if (b('bkReconnect')) b('bkReconnect').onclick = () => connectReal(true);
    if (b('bkSim')) b('bkSim').onclick = trySim;
    if (b('bkDisconnect')) b('bkDisconnect').onclick = disconnect;
    P.querySelectorAll('[data-port]').forEach(s => s.onchange = () => { proj.sim[s.dataset.port] = s.value; hub.configure(proj.sim); if (host.onChange) host.onChange(); });
    bindSim(P);
  }
  // the pretend hub's tilt pad and distance slider
  function simControls() {
    const t = hub.portWith('tilt'), d = hub.portWith('distance');
    let h = '';
    if (t) h += `<div class="bk-sim"><b>Tilt it</b><div class="bk-pad">${DIRS.map(k => `<button data-tilt="${k}" class="t-${k}" aria-label="Tilt ${k}">${{ forward: '▲', back: '▼', left: '◀', right: '▶' }[k]}</button>`).join('')}<button data-tilt="level" class="t-level">Level</button></div></div>`;
    if (d) h += `<div class="bk-sim"><b>Move your hand</b><label class="bk-field">Distance<input type="range" min="0" max="100" value="${hub.values[d].distance}" data-dist></label></div>`;
    return h;
  }
  function bindSim(P) {
    P.querySelectorAll('[data-tilt]').forEach(x => x.onclick = () => { const k = x.dataset.tilt, a = 30; hub.setTilt(k === 'left' ? -a : k === 'right' ? a : 0, k === 'forward' ? -a : k === 'back' ? a : 0); });
    const r = P.querySelector('[data-dist]'); if (r) r.oninput = () => hub.setDistance(+r.value);
  }
  // live readings: only the port cards change, so the slider being dragged isn't redrawn under the pupil's finger
  function values(p) { const card = $('bkPanel').querySelectorAll('.bk-port')[p === 'A' ? 0 : 1]; if (!card || !hub) return; const old = card.querySelector('.bk-read, .bk-motor'); const html = reading(p); if (old) old.outerHTML = html || '<span></span>'; }

  // ── Run ──
  function bar() { const r = runner.running(); $('bkRun').innerHTML = r ? `${ICON.stop}<span>Stop</span>` : `${ICON.play}<span>Run</span>`; $('bkRun').classList.toggle('on', r); bk.classList.toggle('running', r); }
  $('bkRun').onclick = () => {
    if (runner.running()) { runner.stop(); bar(); $('bkStatus').textContent = ''; return; }
    saveBlocks();
    if (!hub || hub.state !== 'connected') toast(support.ok ? 'Connect your hub (or press Try without a hub) to see your code move something.' : 'Press Try without a hub to see your code work.');
    runner.start(proj.blocks); bar(); $('bkStatus').textContent = 'Running';
  };
  $('bkTitle').oninput = () => { proj.title = $('bkTitle').value.slice(0, 40); if (host.onChange) host.onChange(); };
  $('bkUndo').onclick = () => ws && ws.undo(false); $('bkRedo').onclick = () => ws && ws.undo(true);

  // ── Blockly ──
  load(host.project);
  const touchy = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  ws = Blockly.inject($('bkBlocks'), {
    toolbox: BL.toolbox(), renderer: 'zelos', theme: BL.appTheme(Blockly), scrollbars: true, trashcan: true, media: window.CJ_BLOCKLY_MEDIA || 'https://unpkg.com/blockly@10.4.3/media/',
    zoom: { controls: true, wheel: true, startScale: touchy ? 0.85 : 0.8, maxScale: 2.5, minScale: 0.35, scaleSpeed: 1.1 },
    grid: { spacing: 24, length: 3, colour: 'rgba(255,255,255,0.08)', snap: true }
  });
  try { ws.connectionChecker.doTypeChecks = () => true; } catch (e) { /* older Blockly */ }
  ws.addChangeListener(e => { if (quiet || e.isUiEvent) return; clearTimeout(saveT); saveT = setTimeout(saveBlocks, 300); });
  let saveT = 0;
  load(proj); panel(); bar();
  const ro = new ResizeObserver(() => { if (ws) Blockly.svgResize(ws); }); ro.observe(root); ro.observe($('bkBlocks'));
  requestAnimationFrame(() => { if (ws) Blockly.svgResize(ws); });
  // a hidden tab or a closed page must not leave motors running
  const offPage = () => { if (document.visibilityState === 'hidden' && runner.running()) { runner.stop(); bar(); } };
  document.addEventListener('visibilitychange', offPage);
  const bye = () => { try { runner.stop(); if (hub) hub.stopAll(); } catch (e) { /* closing */ } };
  window.addEventListener('pagehide', bye);

  function getProject() { saveBlocks(); return JSON.parse(JSON.stringify(proj)); }
  return {
    getProject,
    setProject(p) { runner.stop(); bar(); load(p); panel(); },
    resume() { if (ws) setTimeout(() => Blockly.svgResize(ws), 0); panel(); },
    pause() { runner.stop(); bar(); saveBlocks(); },
    destroy() { destroyed = true; runner.stop(); if (hub) hub.disconnect(); for (const f of offHub) f(); ro.disconnect(); document.removeEventListener('visibilitychange', offPage); window.removeEventListener('pagehide', bye); if (ws) ws.dispose(); root.innerHTML = ''; },
    // live collaboration: the code and the project's name are shared; each pupil's own hub (or pretend hub) stays on their own device
    liveParts() { saveBlocks(); return JSON.parse(JSON.stringify({ code: { blocks: proj.blocks }, info: { title: proj.title } })); },
    liveSet(part, v) {
      if (!v || typeof v !== 'object') return;
      if (part === 'code' && v.blocks && typeof v.blocks === 'object') { if (JSON.stringify(v.blocks) === JSON.stringify(proj.blocks)) return; proj.blocks = v.blocks; quiet = true; try { ws.clear(); Blockly.serialization.workspaces.load(proj.blocks, ws); } catch (e) { /* keep ours */ } finally { quiet = false; } }
      if (part === 'info' && typeof v.title === 'string') { proj.title = v.title.slice(0, 40); if (document.activeElement !== $('bkTitle')) $('bkTitle').value = proj.title; }
    },
    liveBusy() { return !!(ws && ws.isDragging && ws.isDragging()) || document.activeElement === $('bkTitle'); },
    // test hooks
    _ws: () => ws, _hub: () => hub, _runner: () => runner, _proj: () => proj, _panel: panel
  };
}
