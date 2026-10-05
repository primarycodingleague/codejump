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

// the browser's own speech (no account, nothing sent anywhere by us); null when there is none.
// iPads/iPhones only let a page speak after speech has been started straight from a tap, so unlockSpeech() is called
// from the Run button and from taps on the robot; and they can drop a sentence that is spoken in the same moment as
// cancel(), so a new sentence waits a moment after cancelling the old one.
let speechUnlocked = false;
export function unlockSpeech() {
  const S = window.speechSynthesis; if (speechUnlocked || !S || typeof SpeechSynthesisUtterance === 'undefined') return;
  try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; S.resume(); S.speak(u); speechUnlocked = true; } catch (e) { /* no speech */ }
}
function speak(text, v, onEnd) {
  const S = window.speechSynthesis; if (!S || typeof SpeechSynthesisUtterance === 'undefined') return null;
  try {
    const u = new SpeechSynthesisUtterance(text);
    const vs = S.getVoices(); const en = vs.find(x => /en-GB/i.test(x.lang)) || vs.find(x => /^en/i.test(x.lang)); if (en) u.voice = en;
    u.lang = en ? en.lang : 'en-GB'; u.pitch = v.pitch; u.rate = v.rate; u.onend = u.onerror = () => onEnd();
    let gone = false, timer = 0;
    const go = () => { timer = 0; if (!gone) { try { S.resume(); S.speak(u); } catch (e) { onEnd(); } } };
    if (S.speaking || S.pending) { S.cancel(); timer = setTimeout(go, 120); } else go();
    return { cancel() { gone = true; clearTimeout(timer); u.onend = u.onerror = null; if (S.speaking || S.pending) S.cancel(); } };
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

  const LOAD = 'rbload', REMOTE = 'rbremote'; let groupN = 0;
  function loadBlocks(p) {
    quiet = true;
    Blockly.Events.setGroup(LOAD + (++groupN)); // opening a project is not an edit (not sent to partners, not "unsaved")
    try {
      ws.clear();
      const data = p && p.blocks && typeof p.blocks === 'object' ? p.blocks : RB.starterProgram(proj.name || DEF.name);
      try { Blockly.serialization.workspaces.load(data, ws); } catch (e) {
        ws.clear(); Blockly.serialization.workspaces.load(RB.starterProgram(proj.name || DEF.name), ws);
        if (host.toast) host.toast('Some blocks in this project couldn’t be loaded, so it starts from the example instead.');
      }
    } finally { quiet = false; Blockly.Events.setGroup(false); }
    try { ws.scroll(20, 20); } catch (e) { /* hidden */ }
  }

  // ── live collaboration (host.collab = { active(), send(op) }, CodeJump's live rooms) — the same way as 3D World:
  // each block change goes out as Blockly's own event JSON ({k:'rb_ev'}); 1.5 s after you stop, a full copy
  // ({k:'rb_doc'}: blocks + name + colours) follows, which the room keeps for late joiners and which settles everyone on
  // one version (newest copy wins: time, then this screen's random id). The name and colours go out at once ({k:'rb_set'}).
  // Run, Stop and Reset only happen on your own screen.
  let outBox = [], outTimer = 0, docTimer = 0, setTimer = 0, needDoc = false, mySent = null, retryTimer = 0;
  const cid = Math.random().toString(36).slice(2, 10);
  const newer = (a, b) => (a.t !== b.t ? a.t > b.t : a.cid > b.cid);
  const collabOn = () => !!(host.collab && host.collab.active());
  // the name and colours carry their own "last changed" stamp, so a block copy made before a rename can't undo the rename
  let setStamp = { t: Number(proj.st) || 0, cid: String(proj.scid || '') };
  const settings = () => ({ name: cleanName(proj.name) || DEF.name, body: okColour(proj.body) || DEF.body, trim: okColour(proj.trim) || DEF.trim, st: setStamp.t, scid: setStamp.cid });
  function flushOut() { outTimer = 0; if (outBox.length && collabOn()) host.collab.send({ k: 'rb_ev', evs: outBox }); outBox = []; }
  function sendDocSoon() {
    clearTimeout(docTimer);
    docTimer = setTimeout(() => {
      docTimer = 0;
      if (!alive || !ws || !collabOn()) return;
      mySent = { t: Date.now(), cid };
      host.collab.send(Object.assign({ k: 'rb_doc', blocks: Blockly.serialization.workspaces.save(ws), t: mySent.t, cid }, settings()));
    }, 1500);
  }
  function shareEvent(e) { try { outBox.push(e.toJson()); } catch (err) { return; } if (!outTimer) outTimer = setTimeout(flushOut, 100); sendDocSoon(); }
  function shareSettings() {
    setStamp = { t: Date.now(), cid };
    if (!collabOn()) return;
    clearTimeout(setTimer); setTimer = setTimeout(() => { setTimer = 0; if (collabOn()) host.collab.send(Object.assign({ k: 'rb_set' }, settings())); }, 150);
    sendDocSoon();
  }
  function takeSettings(o) {
    const theirs = { t: Number(o.st) || 0, cid: String(o.scid || '') };
    if (!newer(theirs, setStamp)) return;
    setStamp = theirs;
    let ch = false;
    if (o.name != null) { const n = cleanName(o.name) || DEF.name; if (n !== proj.name) { proj.name = n; ch = true; } }
    for (const k of ['body', 'trim']) if (okColour(o[k]) && o[k] !== proj[k]) { proj[k] = o[k]; ch = true; }
    if (!ch) return;
    restyle();
    if (document.activeElement !== $('rbName')) $('rbName').value = proj.name;
    $('rbBody').value = okColour(proj.body) || DEF.body; $('rbTrim').value = okColour(proj.trim) || DEF.trim;
  }
  const same = (a, b) => {
    const norm = d => JSON.stringify(Object.assign({}, d, { blocks: d && d.blocks && Object.assign({}, d.blocks, { blocks: (d.blocks.blocks || []).slice().sort((x, y) => (x.id < y.id ? -1 : 1)) }) }));
    return norm(a) === norm(b);
  };
  const busy = () => (ws.isDragging && ws.isDragging()) || (Blockly.WidgetDiv && Blockly.WidgetDiv.isVisible()) || (Blockly.DropDownDiv && Blockly.DropDownDiv.isVisible());
  function applyRemote(op) {
    if (!op) return;
    if (op.k === 'rb_set') { takeSettings(op); return; }
    if (!ws) { if (op.k === 'rb_doc' && op.blocks) { proj = Object.assign({}, proj, { blocks: op.blocks }); takeSettings(op); } return; }
    const undo = Blockly.Events.getRecordUndo ? Blockly.Events.getRecordUndo() : true;
    if (op.k === 'rb_ev' && Array.isArray(op.evs)) {
      Blockly.Events.setGroup(REMOTE + (++groupN));
      if (Blockly.Events.setRecordUndo) Blockly.Events.setRecordUndo(false); // Ctrl+Z only undoes your own changes
      try { for (const j of op.evs) { try { Blockly.Events.fromJson(j, ws).run(true); } catch (err) { needDoc = true; } } }
      finally { Blockly.Events.setGroup(false); if (Blockly.Events.setRecordUndo) Blockly.Events.setRecordUndo(undo); }
      return;
    }
    if (op.k === 'rb_doc' && op.blocks && typeof op.blocks === 'object') {
      const theirs = { t: Number(op.t) || 0, cid: String(op.cid || '') };
      const mine = Blockly.serialization.workspaces.save(ws);
      takeSettings(op); // the name and colours follow their own stamp, whatever happens to the blocks
      if (same(mine, op.blocks)) { needDoc = false; return; }
      if (busy()) { clearTimeout(retryTimer); retryTimer = setTimeout(() => applyRemote(op), 500); return; }
      if (!needDoc) {
        if (outTimer || docTimer) return; // your own change is on its way, and its newer copy will settle everyone
        if (mySent && newer(mySent, theirs)) return; // yours is newer: they'll take yours
      }
      const sx = ws.scrollX, sy = ws.scrollY;
      Blockly.Events.setGroup(REMOTE + (++groupN));
      if (Blockly.Events.setRecordUndo) Blockly.Events.setRecordUndo(false);
      try { ws.clear(); Blockly.serialization.workspaces.load(op.blocks, ws); } catch (err) { /* keep what we have */ } finally {
        Blockly.Events.setGroup(false); if (Blockly.Events.setRecordUndo) Blockly.Events.setRecordUndo(undo);
      }
      try { ws.scroll(sx, sy); } catch (err) { /* hidden */ }
      needDoc = false;
    }
  }
  function getProject() {
    return { blocks: ws ? Blockly.serialization.workspaces.save(ws) : (proj.blocks || null), name: cleanName(proj.name) || DEF.name,
      body: okColour(proj.body) || DEF.body, trim: okColour(proj.trim) || DEF.trim, st: setStamp.t || undefined, scid: setStamp.cid || undefined };
  }

  // speech bubble + ask box
  function bubble(text) { const b = $('rbBubble'); b.textContent = text || ''; b.hidden = !text; }
  function ask(q, cb) { askCb = cb; $('rbAskQ').textContent = q; $('rbAnswer').value = ''; $('rbAsk').hidden = false; setTimeout(() => $('rbAnswer').focus(), 30); }
  function cancelAsk() { if (askCb) { const cb = askCb; askCb = null; cb(''); } $('rbAsk').hidden = true; }
  $('rbAsk').addEventListener('submit', e => { e.preventDefault(); unlockSpeech(); const cb = askCb; askCb = null; $('rbAsk').hidden = true; if (cb) cb($('rbAnswer').value); $('rbCanvas').focus(); });

  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
    if (runner) runner.tick(dt);
    const on = runner && runner.running();
    $('rbRun').classList.toggle('on', !!on);
  }
  function run() {
    unlockSpeech(); // must happen inside the tap on Run (iPad)
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
  $('rbName').addEventListener('input', () => { proj.name = cleanName($('rbName').value); if (view) view.setName(proj.name || DEF.name); changed(); shareSettings(); });
  $('rbBody').addEventListener('input', () => { proj.body = $('rbBody').value; restyle(); changed(); shareSettings(); });
  $('rbTrim').addEventListener('input', () => { proj.trim = $('rbTrim').value; restyle(); changed(); shareSettings(); });

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
      const grp = String(e.group || '');
      if (grp.startsWith(LOAD)) return; // opening a project
      if (!grp.startsWith(REMOTE) && collabOn()) shareEvent(e); // a partner's change isn't sent back
      changed();
      if (runner && runner.running()) status('You changed your blocks: press Run to try them.');
    });
    const OrbitControls = THREE.OrbitControls || null;
    view = createRobotView(THREE, $('rbCanvas'), { controls: OrbitControls, name: proj.name || DEF.name, onPick: part => { unlockSpeech(); if (runner) runner.tap(part); } });
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
      setStamp = { t: Number(proj.st) || 0, cid: String(proj.scid || '') };
      if (runner) runner.stop(true);
      if (ws) loadBlocks(proj);
      if (view) { view.reset(true); restyle(); view.start(); }
      showSettings();
      if (!raf && view) raf = requestAnimationFrame(tick); // reopening after pause() must restart the loop, or Run does nothing
    },
    resume() { if (view) { view.start(); view.resize(); } if (ws) Blockly.svgResize(ws); if (!raf) raf = requestAnimationFrame(tick); },
    pause() { if (runner) runner.stop(true); cancelAsk(); if (view) view.stop(); cancelAnimationFrame(raf); raf = 0; },
    destroy() {
      alive = false; ro.disconnect(); cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKey);
      if (runner) runner.stop(true); if (view) view.dispose(); if (ws) ws.dispose();
      root.innerHTML = '';
    },
    applyRemote,
    _view: () => view, _runner: () => runner, _ws: () => ws, run, stop, reset
  };
}
