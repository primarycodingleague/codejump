/* CodeJump · AI Lab project type — the app. Three steps along the top:
 *   1 Teach  — make labels ("circle", "square"…) and draw examples of each
 *   2 Train & test — the computer learns from the examples (a small neural network, ai-model.js); then draw to test it
 *   3 Code it — blocks that use the AI's guesses ("when the AI thinks it's a circle…") to make a game
 * Lazy-loaded by CodeJump (build-and-play.html: loadAiLab) only when an AI Lab project opens, and mounted into #ai-ui.
 * CodeJump owns saving and sharing: getProject() goes into the payload (payload.ai) and onChange() marks it dirty.
 *
 *   const app = (await import('./ai/ai-app.js')).mount(rootEl, { project, onChange, toast, confirm });
 *   app.getProject() · app.setProject(p) · app.resume() · app.pause() · app.destroy()
 *
 * A project is { kind: 'draw'|'text', labels: [{name, color, ex:[drawing or sentence…]}], blocks: <Blockly JSON>, trained }. Only the examples are
 * saved, never the trained brain: training always gives the same brain for the same examples, so it is simply
 * trained again when the project opens. No camera or microphone is used, and drawings stay in the project.
 */
import * as M from './ai-model.js';
import * as AB from './ai-blocks.js';
import { createRunner } from './ai-runner.js';
import { createSound } from '../world/world-sound.js';

const CSS_URL = new URL('./ai-app.css', import.meta.url).href;
const ic = id => '<svg class="ic"><use href="#' + id + '"></use></svg>';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const okColour = c => (/^#[0-9a-f]{6}$/i.test(String(c || '')) ? String(c) : null);

const TEMPLATE = `
<div class="ailab">
  <div class="al-top" role="tablist" aria-label="AI Lab steps">
    <button type="button" role="tab" class="al-tab" data-tab="teach" id="alTabTeach"><span class="al-n">1</span> Teach</button>
    <button type="button" role="tab" class="al-tab" data-tab="train" id="alTabTrain"><span class="al-n">2</span> Train &amp; test</button>
    <button type="button" role="tab" class="al-tab" data-tab="code" id="alTabCode"><span class="al-n">3</span> Code it</button>
    <span class="al-status" id="alStatus" role="status" aria-live="polite"></span>
  </div>

  <div class="al-view" data-view="teach">
    <div class="al-col al-labels-col">
      <div class="al-kind" role="radiogroup" aria-label="What will your AI learn from?"><span>Teach it with</span>
        <button type="button" role="radio" data-kind="draw">${ic('i-brush')} Drawings</button><button type="button" role="radio" data-kind="text">${ic('i-font')} Words</button></div>
      <div class="al-h">Your labels <small>— the things your AI will learn to recognise</small></div>
      <div class="al-row">
        <button type="button" class="al-btn" id="alAddLabel">${ic('i-plus')} New label</button>
        <label class="al-btn al-sel">Ready-made examples
          <select id="alSamples"><option value="">Choose…</option><optgroup label="Drawings"><option value="shapes">Shapes</option><option value="faces">Happy or sad faces</option></optgroup><optgroup label="Words"><option value="weather">Sunny, rainy or snowy</option><option value="kind">Kind or unkind messages</option></optgroup></select></label>
      </div>
      <div class="al-labels" id="alLabels"></div>
    </div>
    <div class="al-col al-pad-col">
      <div class="al-prompt" id="alPrompt"></div>
      <div class="al-padwrap"><canvas class="al-pad" id="alTeachPad" aria-label="Drawing pad. Draw an example with your finger or mouse."></canvas>
        <textarea class="al-text" id="alTeachText" maxlength="120" rows="3" aria-label="Type an example" placeholder="Type an example, then press Enter"></textarea></div>
      <div class="al-row al-padbtns">
        <button type="button" class="al-btn" id="alTeachUndo">${ic('i-undo')} Undo</button>
        <button type="button" class="al-btn" id="alTeachClear">${ic('i-trash')} Clear</button>
        <button type="button" class="al-btn al-go" id="alAddEx">${ic('i-plus')} Add</button>
      </div>
      <div class="al-sees" id="alTeachSees" hidden><canvas width="60" height="60"></canvas><span><b>What the computer sees:</b> your drawing squashed into a 20 × 20 grid of squares. That’s all it has to go on!</span></div>
      <p class="al-tip" id="alTip"></p>
    </div>
  </div>

  <div class="al-view" data-view="train" hidden>
    <div class="al-col">
      <div class="al-h">Train your AI</div>
      <button type="button" class="al-btn al-go al-big" id="alTrain">${ic('i-play')} Train</button>
      <div class="al-progress" id="alProgress" hidden><div id="alBar"></div></div>
      <canvas class="al-chart" id="alChart" width="440" height="150" aria-label="How often the AI was right while it practised" hidden></canvas>
      <div class="al-result" id="alResult"></div>
      <div class="al-inside" id="alInside"></div>
    </div>
    <div class="al-col al-pad-col">
      <div class="al-prompt" id="alTestPrompt">Draw something to test your AI</div>
      <div class="al-padwrap"><canvas class="al-pad" id="alTestPad" aria-label="Test drawing pad"></canvas>
        <textarea class="al-text" id="alTestText" maxlength="120" rows="3" aria-label="Type something to test your AI" placeholder="Type something to test your AI"></textarea></div>
      <div class="al-row al-padbtns"><button type="button" class="al-btn" id="alTestClear">${ic('i-trash')} Clear</button></div>
      <div class="al-guess" id="alGuess" aria-live="polite"></div>
    </div>
  </div>

  <div class="al-view al-code" data-view="code" hidden>
    <div class="al-blocks" id="alBlocks" aria-label="Blocks editor"></div>
    <div class="al-col al-pad-col">
      <div class="al-row">
        <button type="button" class="al-run" id="alRun">${ic('i-play')} Run</button>
        <button type="button" class="al-btn" id="alStop">${ic('i-stop')} Stop</button>
      </div>
      <div class="al-bubble" id="alBubble"></div>
      <div class="al-padwrap"><canvas class="al-pad" id="alPlayPad" aria-label="Drawing pad for your program"></canvas>
        <textarea class="al-text" id="alPlayText" maxlength="120" rows="3" aria-label="Type for your program" placeholder="Type here, then press Enter"></textarea><div class="al-score" id="alScore" hidden></div></div>
      <div class="al-row al-padbtns">
        <button type="button" class="al-btn" id="alPlayClear">${ic('i-trash')} Clear</button>
        <button type="button" class="al-btn al-go" id="alDone">${ic('i-check')} <span>Done</span></button>
      </div>
      <div class="al-seen" id="alSeen"></div>
    </div>
  </div>
</div>`;

// ── a drawing pad: strokes in a 256×256 box
function makePad(canvas, { onStroke } = {}) {
  let strokes = [], cur = null, bg = '#ffffff', ink = '#1b1b1f';
  const ctx = canvas.getContext('2d');
  function size() { const r = canvas.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1), w = Math.max(50, Math.round(r.width * d)); if (canvas.width !== w) { canvas.width = w; canvas.height = w; } draw(); }
  function draw() {
    const w = canvas.width, k = w / 256; ctx.fillStyle = bg; ctx.fillRect(0, 0, w, w);
    ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = Math.max(2, 6 * k); ctx.lineCap = ctx.lineJoin = 'round';
    for (const s of cur ? strokes.concat([cur]) : strokes) {
      ctx.beginPath(); ctx.moveTo(s[0] * k, s[1] * k);
      if (s.length === 2) ctx.lineTo(s[0] * k + 0.1, s[1] * k);
      for (let i = 2; i < s.length; i += 2) ctx.lineTo(s[i] * k, s[i + 1] * k);
      ctx.stroke();
    }
  }
  const at = e => { const r = canvas.getBoundingClientRect(); return [Math.max(0, Math.min(255, Math.round((e.clientX - r.left) / r.width * 256))), Math.max(0, Math.min(255, Math.round((e.clientY - r.top) / r.height * 256)))]; };
  canvas.addEventListener('pointerdown', e => { if (pad.locked) return; e.preventDefault(); try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* already gone */ } cur = at(e); draw(); });
  canvas.addEventListener('pointermove', e => { if (!cur) return; const [x, y] = at(e), n = cur.length; if (Math.hypot(x - cur[n - 2], y - cur[n - 1]) >= 2) { cur.push(x, y); draw(); } });
  const end = () => { if (!cur) return; strokes.push(M.simplifyStroke(cur, 1.2)); cur = null; draw(); if (onStroke) onStroke(); };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  const pad = {
    locked: false, size, draw,
    get: () => strokes.map(s => s.slice()),
    set(d) { strokes = (d || []).map(s => s.slice()); cur = null; draw(); },
    clear() { strokes = []; cur = null; draw(); },
    undo() { strokes.pop(); draw(); },
    empty: () => !strokes.length,
    colour(c) { bg = okColour(c) || '#ffffff'; draw(); }
  };
  return pad;
}

// one input = a drawing pad and a text box; the project's kind decides which one shows
function makeInput(canvas, text, kindNow, { onStroke, onType, onEnter } = {}) {
  const pad = makePad(canvas, { onStroke });
  let typeTimer = 0;
  text.addEventListener('input', () => { clearTimeout(typeTimer); if (onType) typeTimer = setTimeout(onType, 250); });
  text.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (onEnter) onEnter(); } });
  const T = () => kindNow() === 'text';
  return {
    pad, text, size: () => pad.size(),
    get: () => (T() ? M.cleanText(text.value) : pad.get()),
    set(v) { if (typeof v === 'string') text.value = v; else pad.set(v); },
    clear() { pad.clear(); text.value = ''; },
    undo() { pad.undo(); },
    empty: () => (T() ? !M.words(text.value).length : pad.empty()),
    colour(c) { pad.colour(c); text.style.background = okColour(c) || ''; }
  };
}
// a G×G grid of 0..1 as a little picture (dark = ink)
function gridPic(g, px, col) {
  const c = document.createElement('canvas'), n = M.G; c.width = c.height = n; c.style.width = c.style.height = px + 'px'; c.className = 'al-grid';
  const x = c.getContext('2d'), im = x.createImageData(n, n), rgb = (col || '#1b1b1f').match(/[0-9a-f]{2}/gi).map(h => parseInt(h, 16));
  for (let i = 0; i < n * n; i++) { const v = g[i]; im.data[i * 4] = 255 + (rgb[0] - 255) * v; im.data[i * 4 + 1] = 255 + (rgb[1] - 255) * v; im.data[i * 4 + 2] = 255 + (rgb[2] - 255) * v; im.data[i * 4 + 3] = 255; }
  x.putImageData(im, 0, 0); return c;
}
// a little picture of a drawing
function thumb(d, px, col) {
  const c = document.createElement('canvas'), k = 2; c.width = c.height = px * k; c.style.width = c.style.height = px + 'px';
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  x.strokeStyle = col || '#1b1b1f'; x.lineWidth = Math.max(1.5, px * k / 40); x.lineCap = x.lineJoin = 'round';
  const s = c.width / 256;
  for (const st of d || []) { x.beginPath(); x.moveTo(st[0] * s, st[1] * s); if (st.length === 2) x.lineTo(st[0] * s + 0.1, st[1] * s); for (let i = 2; i < st.length; i += 2) x.lineTo(st[i] * s, st[i + 1] * s); x.stroke(); }
  return c;
}

let theme = null;
function alTheme(Blockly) {
  if (!theme) theme = Blockly.Theme.defineTheme('codejumpAi', {
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

// the browser's own speech (iPads only speak after speech has been started from a tap: see unlock())
let speechUnlocked = false;
function unlockSpeech() {
  const S = window.speechSynthesis; if (speechUnlocked || !S || typeof SpeechSynthesisUtterance === 'undefined') return;
  try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; S.resume(); S.speak(u); speechUnlocked = true; } catch (e) { /* no speech */ }
}
function speak(text, onEnd) {
  const S = window.speechSynthesis; if (!S || typeof SpeechSynthesisUtterance === 'undefined' || !text) return null;
  try {
    const u = new SpeechSynthesisUtterance(text);
    const vs = S.getVoices(); const en = vs.find(x => /en-GB/i.test(x.lang)) || vs.find(x => /^en/i.test(x.lang)); if (en) u.voice = en;
    u.lang = en ? en.lang : 'en-GB'; u.onend = u.onerror = () => onEnd();
    let gone = false, timer = 0;
    const go = () => { timer = 0; if (!gone) { try { S.resume(); S.speak(u); } catch (e) { onEnd(); } } };
    if (S.speaking || S.pending) { S.cancel(); timer = setTimeout(go, 120); } else go();
    return { cancel() { gone = true; clearTimeout(timer); u.onend = u.onerror = null; if (S.speaking || S.pending) S.cancel(); } };
  } catch (e) { return null; }
}

// every label name the saved blocks use (so their dropdowns keep them even if the label has gone)
function blockLabelNames(json) {
  const out = [];
  const walk = o => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) { o.forEach(walk); return; } if (o.fields && typeof o.fields.LABEL === 'string') out.push(o.fields.LABEL); for (const k in o) if (k !== 'fields') walk(o[k]); };
  walk(json); return out;
}

export function mount(root, host) {
  host = host || {};
  if (!document.querySelector('link[data-ai-css]')) {
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = CSS_URL; link.setAttribute('data-ai-css', '');
    document.head.appendChild(link);
  }
  root.innerHTML = TEMPLATE;
  const $ = id => root.querySelector('#' + id);
  const Blockly = window.Blockly;
  const touchy = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  let kind = 'draw', labels = [], target = 0, tab = 'teach', ws = null, runner = null, brain = null, training = null, alive = true, quiet = false;
  let raf = 0, last = 0, changeTimer = 0, lastGuess = null, idleTimer = 0, savedBlocks = null, wantTrained = false;
  const sound = createSound();
  const ask = (msg) => (host.confirm ? host.confirm(msg) : Promise.resolve(window.confirm(msg)));

  const status = (msg, kind) => { const s = $('alStatus'); s.textContent = msg || ''; s.className = 'al-status' + (kind ? ' ' + kind : ''); };
  const changed = () => { clearTimeout(changeTimer); changeTimer = setTimeout(() => { if (alive && !quiet && host.onChange) host.onChange(); }, 250); };
  const stale = () => !brain || brain.key !== M.dataKey(labels, kind);
  const T = () => kind === 'text';
  const noun = n => (T() ? (n === 1 ? 'example' : 'examples') : (n === 1 ? 'drawing' : 'drawings'));
  // an example as a picture (drawing) or a word chip (text)
  function exampleEl(ex, px, col) {
    if (typeof ex !== 'string') return thumb(ex, px, col);
    const s = document.createElement('span'); s.className = 'al-chip'; s.textContent = ex; if (col) s.style.borderColor = col; return s;
  }
  const names = () => labels.map(l => l.name);

  // ── step 1: Teach
  function syncNames() { AB.setLabelNames(names().concat(ws ? blockLabelNames(Blockly.serialization.workspaces.save(ws)) : blockLabelNames(savedBlocks))); }
  function renderLabels() {
    const box = $('alLabels'); box.innerHTML = '';
    if (target >= labels.length) target = Math.max(0, labels.length - 1);
    labels.forEach((l, li) => {
      const card = document.createElement('div'); card.className = 'al-label' + (li === target ? ' on' : ''); card.style.setProperty('--lc', l.color);
      card.innerHTML = `<div class="al-lhead"><span class="al-dot"></span><input class="al-lname" maxlength="20" aria-label="Label name" value="${esc(l.name)}">
        <span class="al-count">${l.ex.length} ${noun(l.ex.length)}</span>
        <button type="button" class="al-x" title="Delete this label" aria-label="Delete the label ${esc(l.name)}">${ic('i-trash')}</button></div><div class="al-exs"></div>`;
      card.addEventListener('click', e => { if (e.target.closest('input,button')) return; target = li; renderLabels(); });
      const inp = card.querySelector('.al-lname');
      inp.addEventListener('focus', () => { if (target !== li) { target = li; markTarget(); } });
      inp.addEventListener('change', () => renameLabel(li, inp.value));
      card.querySelector('.al-x').onclick = async () => {
        if (labels.length <= M.MIN_LABELS) { status('Your AI needs at least two labels.', 'bad'); return; }
        if (l.ex.length && !(await ask('Delete “' + l.name + '” and its ' + l.ex.length + ' ' + noun(l.ex.length) + '?'))) return;
        labels.splice(li, 1); afterExamples(); renderLabels();
      };
      const exs = card.querySelector('.al-exs');
      l.ex.forEach((d, ei) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'al-ex' + (T() ? ' al-tex' : ''); b.title = 'Remove this ' + noun(1); b.setAttribute('aria-label', 'Remove ' + noun(1) + ' ' + (ei + 1) + ' of ' + l.name);
        b.appendChild(exampleEl(d, 44)); b.insertAdjacentHTML('beforeend', '<span class="al-del">' + ic('i-x') + '</span>');
        b.onclick = () => { l.ex.splice(ei, 1); afterExamples(); renderLabels(); };
        exs.appendChild(b);
      });
      if (!l.ex.length) exs.innerHTML = '<span class="al-none">No ' + noun(2) + ' yet</span>';
      box.appendChild(card);
    });
    $('alAddLabel').disabled = labels.length >= M.MAX_LABELS;
    markTarget();
  }
  function markTarget() {
    root.querySelectorAll('.al-label').forEach((c, i) => c.classList.toggle('on', i === target));
    const l = labels[target]; if (!l) return;
    $('alPrompt').innerHTML = (T() ? 'Type an example of ' : 'Draw a ') + '<b style="color:' + l.color + '">' + esc(l.name) + '</b>';
    const add = $('alAddEx'); add.innerHTML = ic('i-plus') + ' Add to “' + esc(l.name) + '”'; add.style.background = l.color;
    add.disabled = l.ex.length >= M.MAX_EXAMPLES;
  }
  function renameLabel(li, v) {
    const l = labels[li], n = M.cleanName(v);
    if (!n || labels.some((x, i) => i !== li && x.name.toLowerCase() === n.toLowerCase())) { status(n ? 'You already have a label called “' + n + '”.' : 'A label needs a name.', 'bad'); renderLabels(); return; }
    const old = l.name; if (old === n) return;
    l.name = n;
    if (brain) brain.names = names(); // the brain doesn't need training again for a new name
    syncNames();
    if (ws) { // blocks that used the old name follow the new one
      quiet = true; try { for (const b of ws.getAllBlocks(false)) { const f = b.getField('LABEL'); if (f && f.getValue() === old) { f.getOptions(false); f.setValue(n); } } } finally { quiet = false; }
    }
    syncNames(); renderLabels(); changed();
  }
  function addLabel() {
    if (labels.length >= M.MAX_LABELS) return;
    let i = labels.length + 1, n; do n = 'thing ' + i++; while (labels.some(l => l.name === n));
    const used = new Set(labels.map(l => l.color));
    labels.push({ name: n, color: M.COLOURS.find(c => !used.has(c)) || M.COLOURS[labels.length % M.COLOURS.length], ex: [] });
    target = labels.length - 1; afterExamples(); renderLabels();
    setTimeout(() => { const ins = root.querySelectorAll('.al-lname'); const x = ins[ins.length - 1]; if (x) { x.focus(); x.select(); } }, 30);
  }
  function addExample() {
    const l = labels[target]; if (!l) return;
    if (teachPad.empty()) { status(T() ? 'Type an example first.' : 'Draw something on the pad first.', 'bad'); return; }
    if (l.ex.length >= M.MAX_EXAMPLES) { status('That’s plenty of ' + noun(2) + ' for “' + l.name + '”.', 'bad'); return; }
    const d = T() ? M.cleanText(teachPad.get()) : M.cleanDrawing(teachPad.get()); if (!d) return;
    if (T() && l.ex.some(x => x.toLowerCase() === d.toLowerCase())) { status('You already have that one. Try saying it a different way!', 'bad'); return; }
    l.ex.push(d); teachPad.clear(); $('alTeachSees').hidden = true; afterExamples(); renderLabels();
    if (T()) $('alTeachText').focus();
    status(l.ex.length < M.MIN_EXAMPLES ? 'Added! ' + (T() ? 'Type ' : 'Draw ') + (M.MIN_EXAMPLES - l.ex.length) + ' more of “' + l.name + '” at least.' : 'Added! ' + l.ex.length + ' ' + noun(2) + ' of “' + l.name + '”.', 'ok');
  }
  function afterExamples() { syncNames(); changed(); showTrainState(); }
  function showKind() {
    root.querySelector('.ailab').classList.toggle('k-text', T());
    root.querySelectorAll('.al-kind button').forEach(b => { const on = b.dataset.kind === kind; b.classList.toggle('on', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); });
    $('alTip').textContent = T() ? 'Tip: say each example a different way — different words, short and long. Your AI only knows the words you teach it.'
      : 'Tip: draw each example a bit differently — bigger, smaller, neater, messier. The more different your examples, the cleverer your AI.';
    $('alTestPrompt').textContent = T() ? 'Type something to test your AI' : 'Draw something to test your AI';
    $('alDone').querySelector('span').textContent = T() ? 'Send' : 'Done';
    $('alTeachUndo').hidden = T();
    $('alTeachSees').hidden = true;
  }
  async function setKind(k, quietly) {
    k = k === 'text' ? 'text' : 'draw'; if (k === kind) return true;
    if (!quietly && labels.some(l => l.ex.length) && !(await ask('Switch to ' + (k === 'text' ? 'words' : 'drawings') + '? Your labels stay, but their ' + noun(2) + ' will be cleared.'))) return false;
    kind = k; for (const l of labels) l.ex = [];
    brain = null; wantTrained = false; teachPad.clear(); testPad.clear(); playPad.clear();
    $('alGuess').innerHTML = ''; $('alInside').innerHTML = ''; $('alChart').hidden = true;
    showKind(); afterExamples(); renderLabels();
    return true;
  }
  function teachSees() { // "what the computer sees" under the teaching pad
    const box = $('alTeachSees'); if (T() || teachPad.empty()) { box.hidden = true; return; }
    const g = M.rasterize(teachPad.get()), c = box.querySelector('canvas'), pic = gridPic(g, 60);
    c.replaceWith(pic); box.hidden = false;
  }

  // ── step 2: Train & test
  function showTrainState() {
    const why = M.canTrain(labels, kind);
    $('alTrain').disabled = !!why || !!training;
    const r = $('alResult');
    if (training) return;
    $('alInside').innerHTML = '';
    if (why) { r.innerHTML = '<p class="al-warn">' + esc(why) + '</p>'; return; }
    if (stale()) { r.innerHTML = brain ? '<p class="al-warn">You’ve changed your examples since the AI last trained. Press <b>Train</b> again so it learns them.</p>' : '<p>Press <b>Train</b>. Your AI will practise on every ' + noun(1) + ' you taught it, many times over.</p>'; return; }
    showResult();
  }
  function showResult() {
    const r = $('alResult'), c = brain.check;
    let h = '<p class="al-good"><b>Your AI has learned your ' + labels.reduce((n, l) => n + l.ex.length, 0) + ' ' + noun(2) + '.</b> Now test it: ' + (T() ? 'type in the box.' : 'draw on the pad.') + '</p>';
    if (c) {
      h += '<p>We hid 1 in 4 of your ' + noun(2) + ' while it practised, then asked it about them. It got <b>' + c.right + ' out of ' + c.total + '</b> right.</p>';
      if (c.wrong.length) h += '<p>It got these wrong:</p><div class="al-wrong"></div>';
    } else h += '<p>' + (T() ? 'Type' : 'Draw') + ' 4 or more of each label and it will also check itself on ' + noun(2) + ' it hasn’t practised with.</p>';
    r.innerHTML = h;
    if (c && c.wrong.length) {
      const box = r.querySelector('.al-wrong');
      for (const w of c.wrong.slice(0, 8)) {
        const L = labels[w.li], G = labels[w.guess]; if (!L || !L.ex[w.ei] || !G) continue;
        const f = document.createElement('figure'); if (T()) f.className = 'wide'; f.appendChild(exampleEl(L.ex[w.ei], 54, L.color));
        f.insertAdjacentHTML('beforeend', '<figcaption>a <b>' + esc(L.name) + '</b>, it said <b>' + esc(G.name) + '</b></figcaption>'); box.appendChild(f);
      }
    }
    showInside();
  }
  // "Look inside your AI": what it has to go on, and what it mixes up
  function showInside() {
    const box = $('alInside'); box.innerHTML = '';
    if (!brain || stale()) return;
    let h = '<details class="al-look" open><summary>Look inside your AI</summary>';
    if (T()) h += '<p>The words that on their own make it surest of each label. Are they the words <i>you</i> would look for?</p><div class="al-kw"></div>';
    else h += '<p>Every drawing is squashed into a 20 × 20 grid of squares before the AI sees it. Here is the <b>average</b> of each label’s drawings, as the computer sees them:</p><div class="al-avg"></div>';
    const c = brain.check;
    if (c && c.matrix) {
      h += '<p><b>Mix-ups</b> (from the check): each row is what it really was, each column is what the AI said.</p><table class="al-mix"><tr><th></th>' + labels.map(l => '<th>said<br>' + esc(l.name) + '</th>').join('') + '</tr>' +
        c.matrix.map((row, i) => '<tr><th>' + esc(labels[i] ? labels[i].name : '') + '</th>' + row.map((n, j) => '<td class="' + (i === j ? 'ok' : n ? 'bad' : '') + '">' + n + '</td>').join('') + '</tr>').join('') + '</table>';
    }
    box.innerHTML = h + '</details>';
    if (T()) {
      const kw = box.querySelector('.al-kw'), K = M.keyWords(brain, labels);
      labels.forEach((l, i) => {
        const row = document.createElement('div'); row.className = 'al-kwrow';
        row.innerHTML = '<b style="color:' + l.color + '">' + esc(l.name) + '</b>';
        for (const w of K[i] || []) { const s = document.createElement('span'); s.className = 'al-chip'; s.style.borderColor = l.color; s.textContent = w.word; row.appendChild(s); }
        if (!(K[i] || []).length) row.insertAdjacentHTML('beforeend', '<span class="al-none">no single word is enough</span>');
        kw.appendChild(row);
      });
    } else {
      const av = box.querySelector('.al-avg');
      M.averages(labels).forEach((g, i) => { const f = document.createElement('figure'); f.appendChild(gridPic(g, 80, labels[i].color)); f.insertAdjacentHTML('beforeend', '<figcaption>' + esc(labels[i].name) + '</figcaption>'); av.appendChild(f); });
    }
  }
  function drawChart(points) {
    const cv = $('alChart'), x = cv.getContext('2d'), W = cv.width, H = cv.height; cv.hidden = false;
    x.fillStyle = '#151515'; x.fillRect(0, 0, W, H);
    x.strokeStyle = '#333'; x.lineWidth = 1; x.font = '600 12px Montserrat, sans-serif'; x.fillStyle = '#999';
    for (const p of [0, 50, 100]) { const y = H - 18 - (H - 30) * p / 100; x.beginPath(); x.moveTo(34, y); x.lineTo(W - 6, y); x.stroke(); x.fillText(p + '%', 2, y + 4); }
    x.fillText('How often it was right while practising', 40, H - 3);
    if (points.some(p => p.phase === 'check')) { x.fillStyle = '#9ca3af'; x.fillText('check', 40, 30); x.fillStyle = '#3fae5e'; x.fillText('final', W - 46, 30); }
    for (const phase of ['check', 'learn']) {
      const ps = points.filter(p => p.phase === phase); if (!ps.length) continue;
      x.strokeStyle = phase === 'learn' ? '#3fae5e' : '#6b7280'; x.lineWidth = 3; x.beginPath();
      ps.forEach((p, i) => { const px = 34 + (W - 40) * p.done, py = H - 18 - (H - 30) * p.acc; if (i) x.lineTo(px, py); else x.moveTo(px, py); });
      x.stroke();
    }
  }
  function startTraining(silent) {
    const why = M.canTrain(labels, kind); if (why) { if (!silent) status(why, 'bad'); return; }
    if (training) training.cancel = true;
    const me = { g: M.trainer(labels.map(l => ({ name: l.name, color: l.color, ex: l.ex })), { kind }), cancel: false, pts: [] };
    training = me;
    $('alTrain').disabled = true;
    if (!silent) { $('alProgress').hidden = false; $('alResult').innerHTML = '<p>' + (T() ? 'Practising… it reads every example many times, sometimes with a word left out.' : 'Practising… it looks at every drawing many times, a little bit turned and stretched each time.') + '</p>'; $('alInside').innerHTML = ''; status('Training…'); }
    else status('Waking up your AI…');
    const step = () => {
      if (me.cancel || !alive) return;
      let r;
      try { r = me.g.next(); } catch (e) { training = null; status(String(e.message || e), 'bad'); showTrainState(); return; }
      if (!r.done) {
        me.pts.push(r.value);
        if (!silent) { $('alBar').style.width = Math.round(r.value.done * 100) + '%'; drawChart(me.pts); }
        setTimeout(step, 0); return;
      }
      brain = r.value; training = null; wantTrained = true;
      $('alProgress').hidden = true;
      status(silent ? 'Your AI is ready.' : 'Trained! Now test it.', 'ok');
      showTrainState(); testGuess(); changed();
    };
    setTimeout(step, silent ? 30 : 60);
  }
  function bars(g) {
    const out = document.createElement('div'); out.className = 'al-bars';
    labels.forEach((l, i) => {
      const p = g ? g.probs[i] || 0 : 0;
      out.insertAdjacentHTML('beforeend', '<div class="al-barrow"><span class="al-bn">' + esc(l.name) + '</span><span class="al-bt"><span style="width:' + p + '%;background:' + l.color + '"></span></span><span class="al-bp">' + p + '%</span></div>');
    });
    return out;
  }
  function testGuess() {
    const box = $('alGuess'); box.innerHTML = '';
    if (testPad.empty()) return;
    if (!brain) { box.innerHTML = '<p class="al-warn">Train your AI first.</p>'; return; }
    const d = testPad.get(), g = M.guess(brain, d); if (!g) return;
    const L = labels[g.index], sure = g.conf >= 60;
    box.insertAdjacentHTML('beforeend', '<p class="al-big">' + (sure ? 'I think it’s a <b style="color:' + L.color + '">' + esc(g.label) + '</b>' : 'I’m not sure… maybe a <b style="color:' + L.color + '">' + esc(g.label) + '</b>?') + ' <small>(' + g.conf + '% sure)</small></p>');
    box.appendChild(bars(g));
    const like = M.similar(brain, d, 3).filter(s => labels[s.li] && labels[s.li].ex[s.ei]);
    if (like.length) {
      const w = document.createElement('div'); w.className = 'al-like'; w.innerHTML = '<span>' + (T() ? 'It thinks this is most like these examples you taught it:' : 'It looks most like these drawings you taught it:') + '</span>';
      for (const s of like) w.appendChild(exampleEl(labels[s.li].ex[s.ei], 48, labels[s.li].color));
      box.appendChild(w);
    }
    if (!T()) {
      const w = document.createElement('div'); w.className = 'al-sees'; w.appendChild(gridPic(M.rasterize(d), 60));
      w.insertAdjacentHTML('beforeend', '<span><b>What the computer sees</b> when you draw that.</span>'); box.appendChild(w);
    } else {
      const unknown = M.words(d).filter(x => !labels.some(l => l.ex.some(e => M.words(e).includes(x))));
      if (unknown.length) box.insertAdjacentHTML('beforeend', '<p class="al-tipline">Words it has never seen in your examples: <b>' + esc(unknown.slice(0, 8).join(', ')) + '</b>. It can only guess from the rest (and from bits of words).</p>');
    }
  }

  // ── step 3: Code it
  function bubble(t) { const b = $('alBubble'); b.textContent = t || ''; b.classList.toggle('on', !!t); }
  function showScore(n) { const s = $('alScore'); s.hidden = n == null; if (n != null) s.textContent = 'Score: ' + n; }
  function playGuess() {
    clearTimeout(idleTimer); idleTimer = 0;
    if (playPad.empty()) { status(T() ? 'Type something first.' : 'Draw something first.', 'bad'); return; }
    lastGuess = brain ? M.guess(brain, playPad.get()) : null;
    $('alSeen').textContent = lastGuess ? 'AI’s guess: ' + lastGuess.label + ' (' + lastGuess.conf + '% sure)' : 'Your AI hasn’t been trained yet (step 2), so it can’t guess.';
    if (runner && runner.running()) runner.guessed();
  }
  function run() {
    unlockSpeech(); if (sound.unlock) sound.unlock();
    if (!ws) return;
    if (training) { status('Wait a moment: your AI is still training.', 'bad'); return; }
    playPad.clear(); playPad.colour('#ffffff'); bubble(''); showScore(null); lastGuess = null; $('alSeen').textContent = '';
    runner.start(ws);
    status(brain && !stale() ? (T() ? 'Running · type in the box and press Enter' : 'Running · draw on the pad') : brain ? 'Running · (you changed your examples: train again in step 2 to use them)' : 'Running · but your AI hasn’t been trained yet (step 2)', brain ? 'ok' : 'bad');
  }
  function stop() { if (runner) runner.stop(); }
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
    if (runner) runner.tick(dt);
    $('alRun').classList.toggle('on', !!(runner && runner.running()));
  }

  // ── tabs
  function show(which) {
    tab = which;
    root.querySelectorAll('.al-tab').forEach(b => { const on = b.dataset.tab === which; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    root.querySelectorAll('.al-view').forEach(v => { v.hidden = v.dataset.view !== which; });
    if (which !== 'code' && runner && runner.running()) runner.stop(true);
    requestAnimationFrame(() => {
      teachPad.size(); testPad.size(); playPad.size();
      if (which === 'code' && ws) { syncNames(); Blockly.svgResize(ws); }
    });
    if (which === 'train') { showTrainState(); if (!training && brain && !stale()) status(T() ? 'Type in the box to test your AI.' : 'Draw on the pad to test your AI.'); }
    if (which === 'code') status(brain ? (T() ? 'Press Run, then type in the box.' : 'Press Run, then draw on the pad.') : 'Tip: teach and train your AI (steps 1 and 2) before you run your program.');
    if (which === 'teach') status('');
  }
  root.querySelectorAll('.al-tab').forEach(b => { b.onclick = () => show(b.dataset.tab); });

  const kindNow = () => kind;
  const teachPad = makeInput($('alTeachPad'), $('alTeachText'), kindNow, { onStroke: () => teachSees(), onEnter: () => addExample() });
  const testPad = makeInput($('alTestPad'), $('alTestText'), kindNow, { onStroke: () => testGuess(), onType: () => testGuess(), onEnter: () => testGuess() });
  const playPad = makeInput($('alPlayPad'), $('alPlayText'), kindNow, { onStroke: () => { clearTimeout(idleTimer); if (runner && runner.running()) idleTimer = setTimeout(playGuess, 1300); }, onEnter: () => { unlockSpeech(); playGuess(); } });
  root.querySelectorAll('.al-kind button').forEach(b => { b.onclick = () => setKind(b.dataset.kind); });
  $('alTeachUndo').onclick = () => { teachPad.undo(); teachSees(); };
  $('alTeachClear').onclick = () => { teachPad.clear(); teachSees(); };
  $('alAddEx').onclick = addExample;
  $('alAddLabel').onclick = addLabel;
  $('alSamples').onchange = async e => {
    const set = e.target.value; e.target.value = ''; if (!set) return;
    if (labels.some(l => l.ex.length) && !(await ask('Swap your labels and ' + noun(2) + ' for the ready-made “' + M.SAMPLE_SETS[set].title + '” examples?'))) return;
    await setKind(M.SAMPLE_SETS[set].kind, true);
    labels = M.sampleLabels(set, 10); target = 0; brain = null; wantTrained = false; afterExamples(); renderLabels();
    status('Loaded ' + labels.length + ' labels with ' + labels[0].ex.length + ' ' + noun(2) + ' each. Add some of your own, then train it!', 'ok');
  };
  $('alTrain').onclick = () => startTraining(false);
  $('alTestClear').onclick = () => { testPad.clear(); testGuess(); };
  $('alRun').onclick = run; $('alStop').onclick = stop;
  $('alPlayClear').onclick = () => { clearTimeout(idleTimer); playPad.clear(); };
  $('alDone').onclick = () => { unlockSpeech(); playGuess(); };

  const ro = new ResizeObserver(() => { teachPad.size(); testPad.size(); playPad.size(); if (ws && tab === 'code') Blockly.svgResize(ws); });
  for (const id of ['alTeachPad', 'alTestPad', 'alPlayPad', 'alBlocks']) ro.observe($(id));

  function loadProject(p) {
    p = p || {};
    if (training) { training.cancel = true; training = null; }
    if (runner) runner.stop(true);
    kind = p.kind === 'text' ? 'text' : 'draw';
    labels = M.cleanLabels(p.labels, kind);
    if (labels.length < M.MIN_LABELS) labels = labels.concat([{ name: 'thing 1', ex: [] }, { name: 'thing 2', ex: [] }].slice(0, M.MIN_LABELS - labels.length).map((l, i) => {
      let n = l.name, k = labels.length + i + 1; while (labels.some(x => x.name === n)) n = 'thing ' + (++k);
      return { name: n, color: M.COLOURS[(labels.length + i) % M.COLOURS.length], ex: [] };
    }));
    brain = null; target = 0; lastGuess = null; wantTrained = !!p.trained;
    savedBlocks = p.blocks && typeof p.blocks === 'object' ? p.blocks : null;
    syncNames();
    if (ws) loadBlocks();
    teachPad.clear(); testPad.clear(); playPad.clear(); playPad.colour('#ffffff'); bubble(''); showScore(null);
    $('alGuess').innerHTML = ''; $('alSeen').textContent = ''; $('alChart').hidden = true; $('alProgress').hidden = true;
    $('alInside').innerHTML = '';
    showKind(); renderLabels(); showTrainState();
    // it was trained when it was saved: train it again (same examples → the same brain)
    if (p.trained && !M.canTrain(labels, kind)) startTraining(true);
    show(labels.some(l => l.ex.length) ? (p.trained ? 'code' : 'teach') : 'teach');
  }
  const LOAD = 'alload'; let groupN = 0;
  function loadBlocks() {
    quiet = true; Blockly.Events.setGroup(LOAD + (++groupN));
    try {
      ws.clear();
      try { Blockly.serialization.workspaces.load(savedBlocks || AB.starterProgram(kind), ws); } catch (e) {
        ws.clear(); Blockly.serialization.workspaces.load(AB.starterProgram(kind), ws);
        if (host.toast) host.toast('Some blocks in this project couldn’t be loaded, so it starts from the example instead.');
      }
    } finally { quiet = false; Blockly.Events.setGroup(false); }
    try { ws.scroll(20, 20); } catch (e) { /* hidden */ }
  }
  function getProject() {
    return {
      kind,
      labels: labels.map(l => ({ name: l.name, color: l.color, ex: l.ex })),
      blocks: ws ? Blockly.serialization.workspaces.save(ws) : savedBlocks,
      trained: (!!brain && !stale()) || (!brain && wantTrained && !M.canTrain(labels, kind))
    };
  }

  loadProject(host.project);
  const ready = (async () => {
    if (!defined) { AB.defineBlocks(Blockly); defined = true; }
    syncNames();
    ws = Blockly.inject($('alBlocks'), {
      toolbox: AB.toolbox(), renderer: 'zelos', theme: alTheme(Blockly), scrollbars: true, trashcan: true, media: 'https://unpkg.com/blockly@10.4.3/media/',
      zoom: { controls: true, wheel: true, startScale: touchy ? 0.85 : 0.72, maxScale: 2.5, minScale: 0.35, scaleSpeed: 1.1 },
      grid: { spacing: 24, length: 3, colour: 'rgba(255,255,255,0.08)', snap: true }
    });
    try { ws.connectionChecker.doTypeChecks = () => true; } catch (e) { /* older Blockly */ }
    loadBlocks();
    ws.addChangeListener(e => {
      if (quiet || e.isUiEvent || String(e.group || '').startsWith(LOAD)) return;
      changed();
      if (runner && runner.running()) status('You changed your blocks: press Run to try them.');
    });
    runner = createRunner({
      say: bubble, speak, sound: n => sound.play(n), colour: c => playPad.colour(c), score: showScore,
      clear: () => { clearTimeout(idleTimer); playPad.clear(); }, guess: () => lastGuess, labels: names,
      onError: err => { console.error(err); status('Something went wrong in one of your scripts.', 'bad'); },
      onStop: () => status('Stopped. Press Run to start again.')
    });
    raf = requestAnimationFrame(tick);
    if (tab === 'code') Blockly.svgResize(ws);
  })().catch(e => { status('The AI Lab needs the internet the first time it opens.', 'bad'); console.error(e); });

  return {
    ready,
    getProject,
    setProject(p) { loadProject(p); if (!raf) raf = requestAnimationFrame(tick); }, // reopening after pause() must restart the loop, or Run does nothing
    resume() { teachPad.size(); testPad.size(); playPad.size(); if (ws) Blockly.svgResize(ws); if (!raf) raf = requestAnimationFrame(tick); },
    pause() { if (runner) runner.stop(true); cancelAnimationFrame(raf); raf = 0; clearTimeout(idleTimer); },
    destroy() { alive = false; ro.disconnect(); cancelAnimationFrame(raf); if (training) training.cancel = true; if (runner) runner.stop(true); if (ws) ws.dispose(); root.innerHTML = ''; },
    show, run, stop, setKind,
    // live collaboration (Share → Collaborate): the examples and the blocks go separately, so one person can draw while
    // another codes. A partner's examples replace ours; the brain then needs training again on each screen.
    liveParts() { return { data: { kind, labels: labels.map(l => ({ name: l.name, color: l.color, ex: l.ex })) }, blocks: { blocks: ws ? Blockly.serialization.workspaces.save(ws) : savedBlocks } }; },
    liveSet(part, v) {
      if (!v || typeof v !== 'object') return;
      if (part === 'data') {
        const k = v.kind === 'text' ? 'text' : 'draw', newKind = k !== kind; kind = k;
        const ls = M.cleanLabels(v.labels, kind); if (ls.length < M.MIN_LABELS) return; labels = ls;
        target = Math.min(target, labels.length - 1); syncNames();
        if (newKind) { brain = null; teachPad.clear(); testPad.clear(); showKind(); }
        renderLabels(); showTrainState();
      } else if (part === 'blocks' && v.blocks && typeof v.blocks === 'object') {
        if (ws && JSON.stringify(Blockly.serialization.workspaces.save(ws)) === JSON.stringify(v.blocks)) return;
        savedBlocks = v.blocks; syncNames(); if (ws) loadBlocks();
      }
    },
    liveBusy() { return !!training || !!(ws && ws.isDragging && ws.isDragging()); },
    _brain: () => brain, _labels: () => labels, _ws: () => ws, _runner: () => runner, _training: () => !!training,
    _pads: { teach: teachPad, test: testPad, play: playPad }, _playGuess: playGuess, _testGuess: testGuess, _addExample: addExample
  };
}
