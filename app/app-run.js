// App Lab runtime: draws an app's screen as plain elements and runs its blocks (Blockly's JSON, interpreted — never turned
// into JavaScript). Used by the editor (Design draws with { edit: true }; Run runs) and by the full-screen player
// (app/index.html, "Put it on my phone"), which never loads Blockly.
//
//   drawScreen(host, project, screenId, { edit, state })   → the .ap-screen element (PHONE.w × PHONE.h px; scale it yourself)
//   const r = createRunner(host, project, { onScript(hatId), onScreen(id), store, sounds })
//   r.start() · r.stop() · r.press(partId) · r.screen() · r.vars() · r.state(partId) · r.running()
import { PHONE, PICTURES, pictureURL, esc, safeColour, findPart } from './app-model.js';

// ── drawing ──
const CSS = `
.ap-screen{position:relative;width:${PHONE.w}px;height:${PHONE.h}px;overflow:hidden;font-family:"Trebuchet MS","Segoe UI",system-ui,sans-serif;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;touch-action:manipulation}
.ap-bar{position:absolute;left:0;top:0;right:0;height:${PHONE.bar}px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:20px;padding:0 16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 6px rgba(0,0,0,.15);z-index:1}
.ap-part{position:absolute;box-sizing:border-box;margin:0}
.ap-button{border:0;border-radius:14px;font:inherit;font-weight:800;cursor:pointer;box-shadow:0 4px 0 rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.1;padding:4px 10px;overflow:hidden}
.ap-run .ap-button:active{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.18)}
.ap-label{display:flex;align-items:center;line-height:1.15;overflow:hidden;white-space:pre-wrap;word-break:break-word}
.ap-label.center{justify-content:center;text-align:center}.ap-label.right{justify-content:flex-end;text-align:right}
.ap-image{object-fit:contain;-webkit-user-drag:none}
.ap-textbox{border:2px solid #cbd5e1;border-radius:12px;padding:0 12px;font:inherit;background:#fff;color:#111827;outline:none;user-select:text;-webkit-user-select:text}
.ap-textbox:focus{border-color:#2563eb}
.ap-slider{display:flex;align-items:center}.ap-slider input{width:100%;margin:0;height:28px}
.ap-switch{display:flex;align-items:center;gap:10px;cursor:pointer;font-weight:700}
.ap-switch i{flex:none;width:52px;height:30px;border-radius:15px;background:#cbd5e1;position:relative;transition:background .15s}
.ap-switch i::after{content:'';position:absolute;left:3px;top:3px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:left .15s}
.ap-switch.on i::after{left:25px}.ap-switch span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ap-list{list-style:none;padding:6px;border-radius:12px;overflow:auto}
.ap-list li{padding:8px 10px;border-bottom:1px solid rgba(0,0,0,.08);overflow:hidden;text-overflow:ellipsis}
.ap-list li:last-child{border-bottom:0}
.ap-hidden{display:none!important}
.ap-edit .ap-hidden{display:flex!important;opacity:.35}
.ap-edit .ap-part{pointer-events:none}
.ap-edit .ap-textbox,.ap-edit .ap-slider input{pointer-events:none}
.ap-msg{position:absolute;left:20px;right:20px;bottom:40px;background:rgba(17,24,39,.92);color:#fff;border-radius:14px;padding:14px 16px;font-weight:700;font-size:18px;text-align:center;z-index:5;animation:ap-in .2s ease-out}
@keyframes ap-in{from{transform:translateY(10px);opacity:0}}
`;
let cssDone = false;
export function ensureCSS(doc = document) { if (cssDone && doc === document) return; const s = doc.createElement('style'); s.textContent = CSS; s.setAttribute('data-app-run', ''); doc.head.appendChild(s); if (doc === document) cssDone = true; }

function srcOf(src, p) { if (src.startsWith('lib:')) return pictureURL(PICTURES[src.slice(4)] ? src.slice(4) : 'question'); if (src.startsWith('img:')) return (p.imgs && p.imgs[src.slice(4)]) || pictureURL('question'); return pictureURL('question'); }
// one part as an element (st = its current state: the part's own fields, changed by blocks while running)
export function partEl(st, p, doc = document) {
  let el;
  const box = `left:${st.x}px;top:${st.y}px;width:${st.w}px;height:${st.h}px;`;
  switch (st.t) {
    case 'button': el = doc.createElement('button'); el.type = 'button'; el.className = 'ap-part ap-button'; el.textContent = st.text;
      el.style.cssText = box + `background:${st.bg};color:${st.color};font-size:${st.size}px`; break;
    case 'label': el = doc.createElement('div'); el.className = 'ap-part ap-label ' + st.align; el.textContent = st.text;
      el.style.cssText = box + `color:${st.color};font-size:${st.size}px;font-weight:${st.bold ? 800 : 500}`; break;
    case 'image': el = doc.createElement('img'); el.className = 'ap-part ap-image'; el.src = srcOf(st.src, p); el.alt = st.alt; el.draggable = false; el.style.cssText = box; break;
    case 'textbox': el = doc.createElement('input'); el.className = 'ap-part ap-textbox'; el.value = st.text; el.placeholder = st.hint; el.setAttribute('aria-label', st.hint || st.name);
      el.style.cssText = box + `font-size:${st.size}px`; break;
    case 'slider': { el = doc.createElement('div'); el.className = 'ap-part ap-slider'; el.style.cssText = box;
      const r = doc.createElement('input'); r.type = 'range'; r.min = st.min; r.max = st.max; r.step = 'any'; r.value = st.value; r.style.accentColor = st.color; r.setAttribute('aria-label', st.name); el.appendChild(r); break; }
    case 'switch': { el = doc.createElement('div'); el.className = 'ap-part ap-switch' + (st.on ? ' on' : ''); el.setAttribute('role', 'switch'); el.setAttribute('aria-checked', String(!!st.on)); el.tabIndex = 0;
      el.style.cssText = box + `color:${st.color};font-size:${st.size}px`;
      const i = doc.createElement('i'); if (st.on) i.style.background = st.bg; const s = doc.createElement('span'); s.textContent = st.text; el.append(i, s); break; }
    case 'list': { el = doc.createElement('ul'); el.className = 'ap-part ap-list'; el.style.cssText = box + `background:${st.bg};color:${st.color};font-size:${st.size}px`;
      for (const t of st.items) { const li = doc.createElement('li'); li.textContent = t; el.appendChild(li); } break; }
    case 'box': el = doc.createElement('div'); el.className = 'ap-part ap-box'; el.style.cssText = box + `background:${st.bg};border-radius:${st.round}px`; break;
    default: el = doc.createElement('div'); el.className = 'ap-part';
  }
  el.dataset.pid = st.id;
  if (st.hidden) el.classList.add('ap-hidden');
  return el;
}
export function drawScreen(host, p, sid, opts = {}) {
  const doc = host.ownerDocument || document; ensureCSS(doc);
  const s = p['s' + sid]; host.innerHTML = '';
  const scr = doc.createElement('div'); scr.className = 'ap-screen' + (opts.edit ? ' ap-edit' : ' ap-run'); scr.style.background = s.bg; scr.dataset.sid = sid;
  if (s.title) { const bar = doc.createElement('div'); bar.className = 'ap-bar'; bar.style.background = s.bar; bar.textContent = s.title; scr.appendChild(bar); }
  for (const x of s.parts) scr.appendChild(partEl(opts.state ? opts.state[x.id] || x : x, p, doc));
  host.appendChild(scr);
  return scr;
}

// ── sounds: made on the spot with Web Audio (no files) ──
let actx = null;
function ac() { if (!actx) { const A = window.AudioContext || window.webkitAudioContext; if (A) actx = new A(); } if (actx && actx.state === 'suspended') actx.resume(); return actx; }
export function unlockAudio() { try { ac(); } catch (e) { /* no audio */ } }
function tone(c, t0, f0, f1, dur, type = 'sine', vol = 0.3) {
  const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t0); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur); o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.02);
}
function noise(c, t0, dur, vol = 0.3, hp = 800) {
  const n = c.createBufferSource(), b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; const g = c.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  n.buffer = b; n.connect(f); f.connect(g); g.connect(c.destination); n.start(t0);
}
export function playSound(name) {
  let c; try { c = ac(); } catch (e) { return; } if (!c) return; const t = c.currentTime + 0.01;
  switch (name) {
    case 'Pop': tone(c, t, 900, 300, 0.09, 'sine', 0.4); break;
    case 'Ding': tone(c, t, 1318, 1318, 0.6, 'sine', 0.25); tone(c, t, 2637, 2637, 0.3, 'sine', 0.06); break;
    case 'Cheer': [523, 659, 784, 1047].forEach((f, i) => tone(c, t + i * 0.09, f, f, 0.25, 'triangle', 0.22)); break;
    case 'Drum': tone(c, t, 160, 50, 0.25, 'sine', 0.6); noise(c, t, 0.08, 0.15, 1500); break;
    case 'Boing': tone(c, t, 180, 600, 0.35, 'sine', 0.3); break;
    case 'Coin': tone(c, t, 988, 988, 0.08, 'square', 0.12); tone(c, t + 0.08, 1319, 1319, 0.3, 'square', 0.12); break;
    case 'Buzz': tone(c, t, 140, 120, 0.4, 'sawtooth', 0.18); break;
    case 'Whoosh': noise(c, t, 0.4, 0.25, 400); break;
  }
}
function say(text) { try { const S = window.speechSynthesis; if (!S) return; S.cancel(); const u = new SpeechSynthesisUtterance(String(text).slice(0, 300)); u.lang = 'en-GB'; S.speak(u); } catch (e) { /* no speech */ } }

// ── values ──
const isNum = v => typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)));
const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
export function show(v) { if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(Math.round(v * 1e6) / 1e6); if (typeof v === 'boolean') return v ? 'true' : 'false'; return v == null ? '' : String(v); }
const truthy = v => typeof v === 'string' ? v !== '' && v.toLowerCase() !== 'false' && v !== '0' : !!v;
function compare(op, a, b) {
  let x = a, y = b;
  if (isNum(a) && isNum(b)) { x = Number(a); y = Number(b); } else { x = show(a).toLowerCase(); y = show(b).toLowerCase(); }
  switch (op) { case 'EQ': return x === y; case 'NEQ': return x !== y; case 'LT': return x < y; case 'LTE': return x <= y; case 'GT': return x > y; case 'GTE': return x >= y; }
  return false;
}
const varId = f => (f && typeof f === 'object' ? f.id : f) || '';
const field = (b, k) => (b.fields || {})[k];
const input = (b, k) => { const i = b.inputs && b.inputs[k]; return i ? i.block || i.shadow || null : null; };
const next = b => (b.next && b.next.block) || null;

// ── the runner ──
export function createRunner(host, p, opts = {}) {
  const store = opts.store || (() => { try { return window.localStorage; } catch (e) { return null; } })();
  const names = {}; for (const v of (p.code && p.code.blocks && p.code.blocks.variables) || []) names[v.id] = v.name;
  const tops = ((p.code && p.code.blocks && p.code.blocks.blocks && p.code.blocks.blocks.blocks) || []).filter(b => b && typeof b === 'object');
  let gen = 0, cur = p.app.order[0], scr = null, vars = {}, st = {}, runs = {}, steps = 0, live = false, timers = new Set(), msgT = 0;

  function reset() {
    vars = {}; for (const id of Object.keys(names)) vars[id] = 0;
    st = {}; for (const sid of p.app.order) for (const x of p['s' + sid].parts) st[x.id] = JSON.parse(JSON.stringify(x));
  }
  function draw() {
    scr = drawScreen(host, p, cur, { state: st });
    scr.addEventListener('click', e => { const el = e.target.closest && e.target.closest('[data-pid]'); if (el && live) { unlockAudio(); fire('app_when_pressed', el.dataset.pid); } });
    scr.addEventListener('input', e => { const el = e.target.closest && e.target.closest('[data-pid]'); if (!el || !live) return; const s = st[el.dataset.pid]; if (!s) return;
      if (s.t === 'textbox') s.text = e.target.value; else if (s.t === 'slider') s.value = Number(e.target.value); fire('app_when_changed', s.id); });
    scr.addEventListener('click', e => { const el = e.target.closest && e.target.closest('.ap-switch'); if (!el || !live) return; const s = st[el.dataset.pid]; s.on = !s.on; redraw(s.id); fire('app_when_changed', s.id); });
    scr.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && e.target.classList && e.target.classList.contains('ap-switch')) { e.preventDefault(); e.target.click(); } });
    if (opts.onScreen) opts.onScreen(cur);
  }
  function redraw(pid) {
    const s = st[pid]; if (!s || !scr) return;
    const old = scr.querySelector(`[data-pid="${pid}"]`); if (!old) return; // on another screen: drawn when that screen opens
    const keepFocus = old === (scr.ownerDocument || document).activeElement;
    const el = partEl(s, p, scr.ownerDocument || document); old.replaceWith(el); if (keepFocus && el.focus) el.focus();
  }
  function message(t) {
    if (!scr) return; const old = scr.querySelector('.ap-msg'); if (old) old.remove();
    const m = (scr.ownerDocument || document).createElement('div'); m.className = 'ap-msg'; m.textContent = show(t).slice(0, 200); scr.appendChild(m);
    clearTimeout(msgT); msgT = setTimeout(() => m.remove(), 2500);
  }
  const sleep = (ms, ctx) => new Promise(res => { const t = setTimeout(() => { timers.delete(t); res(); }, Math.max(0, ms)); timers.add(t); ctx.wake = res; });
  const alive = ctx => live && ctx.gen === gen && runs[ctx.hat] === ctx.run && (!ctx.scope || ctx.scope === cur);
  async function tick(ctx) { if (++steps % 400 === 0) await sleep(0, ctx); } // a loop with no wait still lets the page breathe
  const key = v => 'cjapp:' + p.app.id + ':' + (names[v] || v);

  async function val(b, ctx) {
    if (!b) return '';
    switch (b.type) {
      case 'math_number': return num(field(b, 'NUM'));
      case 'text': return show(field(b, 'TEXT'));
      case 'logic_boolean': return field(b, 'BOOL') === 'TRUE';
      case 'variables_get': return vars[varId(field(b, 'VAR'))] ?? 0;
      case 'math_arithmetic': { const a = num(await val(input(b, 'A'), ctx)), c = num(await val(input(b, 'B'), ctx));
        switch (field(b, 'OP')) { case 'ADD': return a + c; case 'MINUS': return a - c; case 'MULTIPLY': return a * c; case 'DIVIDE': return c === 0 ? 0 : a / c; case 'POWER': return Math.pow(a, c); } return 0; }
      case 'math_random_int': { let a = Math.round(num(await val(input(b, 'FROM'), ctx))), c = Math.round(num(await val(input(b, 'TO'), ctx))); if (a > c) [a, c] = [c, a]; return a + Math.floor(Math.random() * (c - a + 1)); }
      case 'math_round': { const a = num(await val(input(b, 'NUM'), ctx)); const op = field(b, 'OP'); return op === 'ROUNDUP' ? Math.ceil(a) : op === 'ROUNDDOWN' ? Math.floor(a) : Math.round(a); }
      case 'math_modulo': { const a = num(await val(input(b, 'DIVIDEND'), ctx)), c = num(await val(input(b, 'DIVISOR'), ctx)); return c === 0 ? 0 : ((a % c) + c) % c; }
      case 'logic_compare': return compare(field(b, 'OP'), await val(input(b, 'A'), ctx), await val(input(b, 'B'), ctx));
      case 'logic_operation': { const a = truthy(await val(input(b, 'A'), ctx)); if (field(b, 'OP') === 'AND') return a && truthy(await val(input(b, 'B'), ctx)); return a || truthy(await val(input(b, 'B'), ctx)); }
      case 'logic_negate': return !truthy(await val(input(b, 'BOOL'), ctx));
      case 'text_join': { const n = Math.min(20, num((b.extraState || {}).itemCount ?? 2)); let s = ''; for (let i = 0; i < n; i++) s += show(await val(input(b, 'ADD' + i), ctx)); return s.slice(0, 2000); }
      case 'text_length': return show(await val(input(b, 'VALUE'), ctx)).length;
      case 'app_remembered': { try { const v = store && store.getItem(key(varId(field(b, 'VAR')))); return v == null ? 0 : JSON.parse(v); } catch (e) { return 0; } }
      case 'app_text_of': { const s = st[field(b, 'PART')]; return s ? show(s.t === 'slider' ? s.value : s.text) : ''; }
      case 'app_slider_value': { const s = st[field(b, 'PART')]; return s ? Math.round(num(s.value) * 100) / 100 : 0; }
      case 'app_switch_on': { const s = st[field(b, 'PART')]; return !!(s && s.on); }
      case 'app_list_count': { const s = st[field(b, 'PART')]; return s && s.items ? s.items.length : 0; }
    }
    return '';
  }
  async function exec(b, ctx) {
    await tick(ctx); if (!alive(ctx)) return;
    if (b.enabled === false) return;
    const s = st[field(b, 'PART')];
    switch (b.type) {
      case 'variables_set': vars[varId(field(b, 'VAR'))] = await val(input(b, 'VALUE'), ctx); break;
      case 'math_change': { const k = varId(field(b, 'VAR')); vars[k] = num(vars[k]) + num(await val(input(b, 'DELTA'), ctx)); break; }
      case 'app_remember': { const k = varId(field(b, 'VAR')); try { if (store) store.setItem(key(k), JSON.stringify(vars[k] ?? 0)); } catch (e) { /* full or blocked */ } break; }
      case 'app_set_text': if (s) { s.text = show(await val(input(b, 'TEXT'), ctx)).slice(0, 300); redraw(s.id); } break;
      case 'app_set_colour': if (s) { const c = safeColour(field(b, 'COL')); if (c) { if (field(b, 'WHAT') === 'bg' || s.t === 'box') s.bg = c; else s.color = c; redraw(s.id); } } break;
      case 'app_show': if (s) { s.hidden = false; redraw(s.id); } break;
      case 'app_hide': if (s) { s.hidden = true; redraw(s.id); } break;
      case 'app_move': if (s) { s.x = Math.round(num(await val(input(b, 'X'), ctx))); s.y = Math.round(num(await val(input(b, 'Y'), ctx))); redraw(s.id); } break;
      case 'app_set_value': if (s && s.t === 'slider') { s.value = Math.min(s.max, Math.max(s.min, num(await val(input(b, 'VALUE'), ctx)))); redraw(s.id); } break;
      case 'app_set_switch': if (s && s.t === 'switch') { s.on = field(b, 'ON') === 'on'; redraw(s.id); } break;
      case 'app_set_picture': if (s && s.t === 'image') { const k = field(b, 'PIC'); if (PICTURES[k]) { s.src = 'lib:' + k; s.alt = PICTURES[k][0]; redraw(s.id); } } break;
      case 'app_list_add': if (s && s.items) { s.items.push(show(await val(input(b, 'TEXT'), ctx)).slice(0, 120)); if (s.items.length > 200) s.items.shift(); redraw(s.id); } break;
      case 'app_list_clear': if (s && s.items) { s.items = []; redraw(s.id); } break;
      case 'app_play_sound': if (!opts.mute) playSound(field(b, 'SOUND')); if (opts.sounds) opts.sounds.push(field(b, 'SOUND')); break;
      case 'app_say': { const t = await val(input(b, 'TEXT'), ctx); if (!opts.mute) say(t); message(t); break; }
      case 'app_message': message(await val(input(b, 'TEXT'), ctx)); break;
      case 'app_goto': { const to = field(b, 'SCREEN'); if (p['s' + to] && to !== cur) { cur = to; draw(); fire('app_when_opens', to); } break; }
      case 'app_wait': await sleep(Math.min(600, Math.max(0, num(await val(input(b, 'SECS'), ctx)))) * 1000, ctx); break;
      case 'controls_if': {
        const n = num((b.extraState || {}).elseIfCount || 0);
        for (let i = 0; i <= n; i++) if (truthy(await val(input(b, 'IF' + i), ctx))) { await stack(input(b, 'DO' + i), ctx); return; }
        if (input(b, 'ELSE')) await stack(input(b, 'ELSE'), ctx); break;
      }
      case 'controls_repeat_ext': { const n = Math.min(10000, Math.round(num(await val(input(b, 'TIMES'), ctx)))); for (let i = 0; i < n && alive(ctx); i++) { await stack(input(b, 'DO'), ctx); await tick(ctx); } break; }
      case 'controls_whileUntil': { const until = field(b, 'MODE') === 'UNTIL'; while (alive(ctx)) { const c = truthy(await val(input(b, 'BOOL'), ctx)); if (until ? c : !c) break; await stack(input(b, 'DO'), ctx); await sleep(0, ctx); } break; }
      case 'app_every': { const secs = Math.min(600, Math.max(0.1, num(await val(input(b, 'SECS'), ctx)))); while (alive(ctx)) { await sleep(secs * 1000, ctx); if (!alive(ctx)) break; await stack(input(b, 'DO'), ctx); } break; }
    }
  }
  async function stack(b, ctx) { for (; b && alive(ctx); b = next(b)) await exec(b, ctx); }
  function fire(type, arg) {
    for (const h of tops) {
      if (h.type !== type || h.enabled === false) continue;
      if (type === 'app_when_pressed' || type === 'app_when_changed') { if (field(h, 'PART') !== arg) continue; }
      if (type === 'app_when_opens' && field(h, 'SCREEN') !== arg) continue;
      const hat = h.id || (h.type + ':' + JSON.stringify(h.fields || {}) + tops.indexOf(h));
      const ctx = { gen, hat, run: (runs[hat] || 0) + 1, scope: type === 'app_when_opens' ? arg : null };
      runs[hat] = ctx.run; // pressing again restarts that script
      if (opts.onScript) opts.onScript(h.id);
      stack(next(h), ctx).catch(e => { if (opts.onError) opts.onError(e); });
    }
  }
  return {
    start() { this.stop(); gen++; live = true; steps = 0; runs = {}; reset(); cur = p.app.order[0]; draw(); fire('app_when_starts'); fire('app_when_opens', cur); },
    stop() { live = false; gen++; for (const t of timers) clearTimeout(t); timers.clear(); clearTimeout(msgT); try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { /* none */ } },
    running: () => live, screen: () => cur, vars: () => Object.fromEntries(Object.entries(vars).map(([k, v]) => [names[k] || k, v])), state: id => st[id],
    press(pid) { if (live) { const s = st[pid]; if (s && s.t === 'switch') { s.on = !s.on; redraw(pid); fire('app_when_changed', pid); } else fire('app_when_pressed', pid); } },
    change(pid, v) { const s = st[pid]; if (!live || !s) return; if (s.t === 'textbox') s.text = show(v); else if (s.t === 'slider') s.value = num(v); else if (s.t === 'switch') s.on = !!v; redraw(pid); fire('app_when_changed', pid); },
    drawStill(sid) { this.stop(); reset(); cur = sid || p.app.order[0]; scr = drawScreen(host, p, cur, { state: st, edit: true }); return scr; }
  };
}
export { findPart };
