// App Lab model: a pupil's phone app as plain data, and everything that can be done with it without a page (Node-testable).
//
// Project (also exactly what a live room keeps: each top-level field is one live part):
//   { v:1,
//     app: { id, title, order:[screenId…] },                 // id: 8 letters, names the app's "remembered" values on a phone
//     imgs: { <imgId>: 'data:image/jpeg;base64,…' },        // pictures pupils uploaded
//     s<screenId>: { name, title, bar, bg, parts:[part…] }, // one field per screen (ids = 6 lower-case letters)
//     code: { blocks: <Blockly JSON workspace> } }          // every script, for every screen
// A part: { id, t, name, x, y, w, h, …its own fields (see PARTS) } on a PHONE.w × PHONE.h screen (px). Blocks name parts by id,
// so renaming a part never breaks its code. The first screen in order is where the app starts.
//
// Blocks are Blockly's own JSON. app-run.js runs them straight from this data (the player page never loads Blockly);
// app-blocks.js defines them for the editor. Nothing a pupil makes can run code of its own: parts are drawn as plain
// elements from these fields, and the blocks are interpreted, never turned into JavaScript.
import { PICTURES, PICTURE_KEYS, pictureURL } from '../web/web-pictures.js';
export { PICTURES, PICTURE_KEYS, pictureURL };

export const PHONE = { w: 360, h: 640, bar: 56 };
export const LIMITS = { screens: 8, parts: 40, text: 300, items: 50, imgs: 16, img: 450000, blocks: 600000 };

// ── small helpers ──
export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const str = (v, max = 200) => (typeof v === 'string' ? v : v == null ? '' : String(v)).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0, max);
const clamp = (v, a, b, d) => { v = Number(v); return Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : d; };
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
export function newId(rnd = Math.random, n = 6) { let s = ''; for (let i = 0; i < n; i++) s += LETTERS[Math.floor(rnd() * 26)]; return s; }
const isId = s => typeof s === 'string' && /^[a-z]{6}$/.test(s);
export const safeColour = v => (typeof v === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim())) ? v.trim().toLowerCase() : null;
const one = (v, list, d) => list.includes(v) ? v : d;

// ── parts: [label, icon, size {w,h}, fields()] ──
export const PARTS = {
  button: ['Button', 'button', { w: 200, h: 56 }, () => ({ text: 'Press me', size: 20, color: '#ffffff', bg: '#2563eb' })],
  label: ['Text', 'text', { w: 300, h: 44 }, () => ({ text: 'Hello!', size: 24, color: '#1f2937', align: 'center', bold: true })],
  image: ['Picture', 'image', { w: 120, h: 120 }, () => ({ src: 'lib:star', alt: 'Star' })],
  textbox: ['Text box', 'textbox', { w: 280, h: 48 }, () => ({ text: '', hint: 'Type here', size: 18 })],
  slider: ['Slider', 'slider', { w: 280, h: 40 }, () => ({ min: 0, max: 10, value: 5, color: '#2563eb' })],
  switch: ['Switch', 'switch', { w: 220, h: 44 }, () => ({ text: 'Switch', on: false, size: 18, color: '#1f2937', bg: '#22c55e' })],
  list: ['List', 'list', { w: 300, h: 180 }, () => ({ items: ['First thing', 'Second thing'], size: 18, color: '#1f2937', bg: '#f3f4f6' })],
  box: ['Shape', 'box', { w: 160, h: 100 }, () => ({ bg: '#fde68a', round: 16 })]
};
export const PART_KEYS = Object.keys(PARTS);
// which parts each kind of block can use
export const CAN = {
  text: ['button', 'label', 'textbox', 'switch'],     // set … text to / text of …
  colour: ['button', 'label', 'switch', 'list', 'slider', 'box', 'textbox'],
  changed: ['textbox', 'slider', 'switch'],          // when … is changed
  slider: ['slider'], switch: ['switch'], list: ['list'], image: ['image']
};
export const SOUNDS = ['Pop', 'Ding', 'Cheer', 'Drum', 'Boing', 'Coin', 'Buzz', 'Whoosh'];

// a name for a new part that isn't used yet: Button1, Button2…
export function partName(p, t) {
  const base = PARTS[t][0].replace(/\s+/g, '');
  const used = new Set(); for (const id of p.app.order) for (const x of p['s' + id].parts) used.add(x.name.toLowerCase());
  let n = 1; while (used.has((base + n).toLowerCase())) n++;
  return base + n;
}
export function partOf(p, t, rnd, extra) {
  const P = PARTS[t];
  return Object.assign({ id: newId(rnd), t, name: p ? partName(p, t) : P[0].replace(/\s+/g, '') + '1', x: Math.round((PHONE.w - P[2].w) / 2), y: 120, w: P[2].w, h: P[2].h }, P[3](), extra || {});
}

function cleanSrc(s, imgs) {
  s = String(s || '');
  if (/^lib:[a-z]+$/.test(s) && PICTURES[s.slice(4)]) return s;
  if (/^img:[a-z]{6}$/.test(s) && imgs && imgs[s.slice(4)]) return s;
  return null;
}
export function cleanPart(x, ctx) {
  if (!x || typeof x !== 'object' || !PARTS[x.t]) return null;
  const d = PARTS[x.t][3](), sz = PARTS[x.t][2];
  const out = { id: isId(x.id) && !ctx.seen.has(x.id) ? x.id : newId(), t: x.t };
  ctx.seen.add(out.id);
  let name = str(x.name, 24).replace(/[^\w]/g, '') || partName(ctx.p, x.t);
  if (ctx.names.has(name.toLowerCase())) { let n = 2; while (ctx.names.has((name + n).toLowerCase())) n++; name += n; }
  ctx.names.add(name.toLowerCase()); out.name = name;
  out.w = clamp(x.w, 16, PHONE.w, sz.w) | 0; out.h = clamp(x.h, 16, PHONE.h, sz.h) | 0;
  out.x = clamp(x.x, -out.w + 16, PHONE.w - 16, 0) | 0; out.y = clamp(x.y, -out.h + 16, PHONE.h - 16, 0) | 0;
  if (x.hidden) out.hidden = true;
  for (const k of Object.keys(d)) {
    const v = x[k];
    if (k === 'text' || k === 'hint' || k === 'alt') out[k] = str(v == null ? d[k] : v, LIMITS.text);
    else if (k === 'color' || k === 'bg') out[k] = safeColour(v) || d[k];
    else if (k === 'size') out[k] = clamp(v, 8, 96, d[k]) | 0;
    else if (k === 'round') out[k] = clamp(v, 0, 200, d[k]) | 0;
    else if (k === 'min' || k === 'max' || k === 'value') out[k] = clamp(v, -100000, 100000, d[k]);
    else if (k === 'on' || k === 'bold') out[k] = typeof v === 'boolean' ? v : d[k];
    else if (k === 'align') out[k] = one(v, ['left', 'center', 'right'], d[k]);
    else if (k === 'src') out[k] = cleanSrc(v, ctx.imgs) || d[k];
    else if (k === 'items') out[k] = (Array.isArray(v) ? v : d[k]).slice(0, LIMITS.items).map(i => str(i, 120));
  }
  if (out.t === 'slider') { if (out.max <= out.min) out.max = out.min + 1; out.value = Math.min(out.max, Math.max(out.min, out.value)); }
  return out;
}
export function cleanScreen(s, ctx) {
  s = s && typeof s === 'object' ? s : {};
  return { name: str(s.name, 30).trim() || 'Screen', title: str(s.title, 60), bar: safeColour(s.bar) || '#2563eb', bg: safeColour(s.bg) || '#ffffff',
    parts: (Array.isArray(s.parts) ? s.parts : []).slice(0, LIMITS.parts).map(x => cleanPart(x, ctx)).filter(Boolean) };
}
// Blockly's JSON: only plain data of a sensible size is kept (app-run.js checks every block it runs)
function cleanCode(c) {
  const b = c && typeof c === 'object' && c.blocks && typeof c.blocks === 'object' ? c.blocks : null;
  if (!b) return { blocks: null };
  try { const s = JSON.stringify(b); if (s.length > LIMITS.blocks) return { blocks: null }; return { blocks: JSON.parse(s) }; } catch (e) { return { blocks: null }; }
}
export function cleanProject(p) {
  p = p && typeof p === 'object' ? p : {};
  const a = p.app && typeof p.app === 'object' ? p.app : {};
  const imgs = {};
  if (p.imgs && typeof p.imgs === 'object') for (const [k, v] of Object.entries(p.imgs).slice(0, LIMITS.imgs))
    if (isId(k) && typeof v === 'string' && v.length <= LIMITS.img && /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(v)) imgs[k] = v;
  let order = (Array.isArray(a.order) ? a.order : []).filter(id => isId(id) && p['s' + id] && typeof p['s' + id] === 'object');
  order = [...new Set(order)].slice(0, LIMITS.screens);
  const out = { v: 1, app: { id: /^[a-z]{8}$/.test(a.id || '') ? a.id : newId(Math.random, 8), title: str(a.title, 40).trim() || 'My app', order }, imgs };
  if (!order.length) { const id = newId(); order.push(id); p = Object.assign({}, p, { ['s' + id]: { name: 'Screen 1', title: out.app.title, parts: [] } }); }
  const ctx = { p: out, imgs, seen: new Set(), names: new Set() };
  for (const id of order) out['s' + id] = cleanScreen(p['s' + id], ctx);
  out.code = cleanCode(p.code);
  if (p.goals && typeof p.goals === 'object') out.goals = cleanGoals(p.goals);
  return out;
}
export const screensOf = p => p.app.order.map(id => Object.assign({ id }, p['s' + id]));
export function allParts(p) { const out = []; for (const id of p.app.order) for (const x of p['s' + id].parts) out.push(Object.assign({ screen: id }, x)); return out; }
export function findPart(p, id) { for (const sid of p.app.order) { const s = p['s' + sid], i = s.parts.findIndex(x => x.id === id); if (i >= 0) return { part: s.parts[i], screen: sid, i }; } return null; }
export function addScreen(p, name, rnd) {
  if (p.app.order.length >= LIMITS.screens) return null;
  const id = newId(rnd); p.app.order.push(id);
  const first = p['s' + p.app.order[0]];
  p['s' + id] = { name: str(name, 30) || 'Screen ' + p.app.order.length, title: str(name, 60) || p.app.title, bar: first ? first.bar : '#2563eb', bg: first ? first.bg : '#ffffff', parts: [] };
  return id;
}
export function removeScreen(p, id) { if (p.app.order.length < 2) return false; p.app.order = p.app.order.filter(x => x !== id); delete p['s' + id]; return true; }

// ── blocks as JSON (for starter apps and lessons) ──
export const B = {
  N: n => ({ shadow: { type: 'math_number', fields: { NUM: n } } }),
  T: t => ({ shadow: { type: 'text', fields: { TEXT: t } } }),
  in: (block, shadow) => Object.assign({}, shadow || {}, { block }),
  chain(list) { let first = null, prev = null; for (const b of list) { if (!b) continue; if (prev) prev.next = { block: b }; else first = b; prev = b; } return first; },
  hat(type, fields, body, x, y) { const h = { type, x: x || 0, y: y || 0 }; if (fields) h.fields = fields; const c = B.chain(body || []); if (c) h.next = { block: c }; return h; },
  get: v => ({ type: 'variables_get', fields: { VAR: { id: v } } }),
  set: (v, input) => ({ type: 'variables_set', fields: { VAR: { id: v } }, inputs: { VALUE: input } }),
  change: (v, n) => ({ type: 'math_change', fields: { VAR: { id: v } }, inputs: { DELTA: B.N(n) } }),
  setText: (part, input) => ({ type: 'app_set_text', fields: { PART: part }, inputs: { TEXT: input } }),
  sound: s => ({ type: 'app_play_sound', fields: { SOUND: s } }),
  go: s => ({ type: 'app_goto', fields: { SCREEN: s } }),
  if: (cond, then, els) => ({ type: 'controls_if', extraState: els ? { hasElse: true } : undefined, inputs: Object.assign({ IF0: { block: cond }, DO0: { block: B.chain(then) } }, els ? { ELSE: { block: B.chain(els) } } : {}) }),
  cmp: (op, a, b) => ({ type: 'logic_compare', fields: { OP: op }, inputs: { A: a, B: b } }),
  rand: (a, b) => ({ type: 'math_random_int', inputs: { FROM: B.N(a), TO: B.N(b) } }),
  join: (...items) => ({ type: 'text_join', extraState: { itemCount: items.length }, inputs: Object.fromEntries(items.map((x, i) => ['ADD' + i, x])) }),
  workspace(vars, tops) { // lay scripts out in two columns
    tops.forEach((t, i) => { t.x = 24 + (i % 2) * 380; t.y = 24 + Math.floor(i / 2) * 260; });
    const out = { blocks: { languageVersion: 0, blocks: tops } }; if (vars.length) out.variables = vars.map(([id, name]) => ({ id, name })); return out;
  }
};

// ── starter apps: [title, blurb, icon picture, make()] ──
function build(title, screens, code) { // screens: [[name, title, bar, bg, parts]]
  const p = { v: 1, app: { title, order: [] }, imgs: {} };
  screens.forEach(([sid, name, t, bar, bg, parts]) => { p.app.order.push(sid); p['s' + sid] = { name, title: t, bar, bg, parts }; });
  p.code = { blocks: code };
  return cleanProject(p);
}
const at = (t, id, name, x, y, w, h, f) => Object.assign({ id, t, name, x, y, w, h }, PARTS[t][3](), f || {});
export const STARTERS = {
  blank: ['Empty app', 'One empty screen. Make anything!', 'idea', () => build('My app', [['aaaaaa', 'Screen 1', 'My app', '#2563eb', '#ffffff', [at('label', 'lbaaaa', 'Text1', 30, 120, 300, 44, { text: 'Hello!' })]]], null)],
  kind: ['Kindness counter', 'Count kind things you do. It remembers, even when you close it.', 'heart', () => build('Kindness counter', [
    ['scrone', 'Screen 1', 'Kindness counter', '#e8618c', '#fff6f2', [
      at('image', 'picone', 'Picture1', 120, 84, 120, 120, { src: 'lib:heart', alt: 'A smiling heart' }),
      at('label', 'lblone', 'Label1', 30, 220, 300, 40, { text: 'Kind things today', size: 22, color: '#6b7280' }),
      at('label', 'lbltwo', 'Count', 30, 262, 300, 96, { text: '0', size: 80, color: '#ae853e' }),
      at('button', 'btnone', 'KindButton', 40, 380, 280, 80, { text: 'I was kind!', size: 28, bg: '#e8618c' }),
      at('button', 'btntwo', 'ResetButton', 120, 490, 120, 48, { text: 'Reset', size: 18, color: '#1f2937', bg: '#e5e7eb' })]],
    ['scrtwo', 'Screen 2', 'Well done!', '#e8618c', '#fff6f2', [
      at('image', 'pictwo', 'Picture2', 110, 110, 140, 140, { src: 'lib:star', alt: 'A star' }),
      at('label', 'lblthr', 'Label2', 20, 280, 320, 110, { text: 'Ten kind things! You are a kindness superstar.', size: 24, color: '#1f2937' }),
      at('button', 'btnthr', 'BackButton', 110, 440, 140, 52, { text: 'Back', bg: '#e8618c' })]]],
  B.workspace([['vcount', 'count']], [
    B.hat('app_when_starts', null, [B.set('vcount', { block: { type: 'app_remembered', fields: { VAR: { id: 'vcount' } } } }), B.setText('lbltwo', B.in(B.get('vcount'), B.T('')))]),
    B.hat('app_when_pressed', { PART: 'btnone' }, [B.change('vcount', 1), B.setText('lbltwo', B.in(B.get('vcount'), B.T(''))), B.sound('Pop'), { type: 'app_remember', fields: { VAR: { id: 'vcount' } } },
      B.if(B.cmp('EQ', B.in(B.get('vcount'), B.N(0)), B.N(10)), [B.sound('Cheer'), B.go('scrtwo')])]),
    B.hat('app_when_pressed', { PART: 'btntwo' }, [B.set('vcount', B.N(0)), B.setText('lbltwo', B.in(B.get('vcount'), B.T(''))), { type: 'app_remember', fields: { VAR: { id: 'vcount' } } }]),
    B.hat('app_when_pressed', { PART: 'btnthr' }, [B.go('scrone')])]))],
  quiz: ['Quiz', 'Ask a question, check the answer and keep score.', 'question', () => build('Space quiz', [
    ['qzaaaa', 'Question', 'Space quiz', '#4c6ef5', '#f4f6ff', [
      at('image', 'qpicaa', 'Picture1', 130, 76, 100, 100, { src: 'lib:planet', alt: 'A planet' }),
      at('label', 'qlblaa', 'Question', 20, 190, 320, 80, { text: 'Which planet is the biggest?', size: 24 }),
      at('button', 'qbtnaa', 'AnswerA', 40, 290, 280, 56, { text: 'Mars', bg: '#4c6ef5' }),
      at('button', 'qbtnbb', 'AnswerB', 40, 360, 280, 56, { text: 'Jupiter', bg: '#4c6ef5' }),
      at('button', 'qbtncc', 'AnswerC', 40, 430, 280, 56, { text: 'Earth', bg: '#4c6ef5' }),
      at('label', 'qlblbb', 'Result', 20, 510, 320, 44, { text: '', size: 22, color: '#4c6ef5' }),
      at('label', 'qlblcc', 'Score', 20, 570, 320, 36, { text: 'Score: 0', size: 18, color: '#6b7280', bold: false })]]],
  B.workspace([['vscore', 'score']], [
    B.hat('app_when_pressed', { PART: 'qbtnbb' }, [B.setText('qlblbb', B.T('Yes! Jupiter is the biggest.')), B.change('vscore', 1), B.setText('qlblcc', B.in(B.join(B.T('Score: '), { block: B.get('vscore') }), B.T(''))), B.sound('Cheer')]),
    B.hat('app_when_pressed', { PART: 'qbtnaa' }, [B.setText('qlblbb', B.T('Not quite. Try again!')), B.sound('Buzz')]),
    B.hat('app_when_pressed', { PART: 'qbtncc' }, [B.setText('qlblbb', B.T('Not quite. Try again!')), B.sound('Buzz')])]))],
  sounds: ['Soundboard', 'A grid of buttons that each play a sound.', 'music', () => build('Soundboard', [
    ['sbaaaa', 'Screen 1', 'Soundboard', '#cf63cf', '#fdf4ff', SOUNDS.slice(0, 6).map((s, i) => at('button', 'sb' + 'abcdef'[i] + 'btn', s + 'Button', 24 + (i % 2) * 164, 100 + Math.floor(i / 2) * 150, 148, 130, { text: s, size: 24, bg: ['#a21caf', '#3b5bdb', '#15803d', '#c2410c', '#dc2626', '#0f766e'][i] }))]],
  B.workspace([], SOUNDS.slice(0, 6).map((s, i) => B.hat('app_when_pressed', { PART: 'sb' + 'abcdef'[i] + 'btn' }, [B.sound(s)]))))],
  pet: ['Pet tracker', 'Feed and walk a pet. Its happiness goes down over time.', 'dog', () => build('My pet', [
    ['ptaaaa', 'Screen 1', 'My pet', '#2f9e44', '#f3faf1', [
      at('image', 'ppicaa', 'Pet', 110, 80, 140, 140, { src: 'lib:dog', alt: 'A dog' }),
      at('label', 'plblaa', 'Mood', 20, 236, 320, 40, { text: 'Happiness: 5', size: 24 }),
      at('slider', 'psldaa', 'HappyBar', 40, 284, 280, 40, { min: 0, max: 10, value: 5, color: '#2f9e44' }),
      at('button', 'pbtnaa', 'FeedButton', 30, 360, 140, 60, { text: 'Feed', bg: '#c2410c' }),
      at('button', 'pbtnbb', 'WalkButton', 190, 360, 140, 60, { text: 'Walk', bg: '#2f9e44' }),
      at('label', 'plblbb', 'Note', 20, 450, 320, 60, { text: 'Look after your pet!', size: 18, color: '#6b7280', bold: false })]]],
  B.workspace([['vhappy', 'happy']], [
    B.hat('app_when_starts', null, [B.set('vhappy', B.N(5)), { type: 'app_every', inputs: { SECS: B.N(5), DO: { block: B.chain([
      B.change('vhappy', -1),
      B.if(B.cmp('LT', B.in(B.get('vhappy'), B.N(0)), B.N(0)), [B.set('vhappy', B.N(0))]),
      { type: 'app_set_value', fields: { PART: 'psldaa' }, inputs: { VALUE: B.in(B.get('vhappy'), B.N(0)) } },
      B.if(B.cmp('LT', B.in(B.get('vhappy'), B.N(0)), B.N(3)), [B.setText('plblbb', B.T('Your pet is sad. Feed it or take it for a walk!'))])]) } } }]),
    B.hat('app_when_pressed', { PART: 'pbtnaa' }, [B.change('vhappy', 2), B.if(B.cmp('GT', B.in(B.get('vhappy'), B.N(0)), B.N(10)), [B.set('vhappy', B.N(10))]), { type: 'app_set_value', fields: { PART: 'psldaa' }, inputs: { VALUE: B.in(B.get('vhappy'), B.N(0)) } }, B.sound('Coin'), B.setText('plblbb', B.T('Yum!'))]),
    B.hat('app_when_pressed', { PART: 'pbtnbb' }, [B.change('vhappy', 3), B.if(B.cmp('GT', B.in(B.get('vhappy'), B.N(0)), B.N(10)), [B.set('vhappy', B.N(10))]), { type: 'app_set_value', fields: { PART: 'psldaa' }, inputs: { VALUE: B.in(B.get('vhappy'), B.N(0)) } }, B.sound('Whoosh'), B.setText('plblbb', B.T('What a lovely walk!'))]),
    B.hat('app_when_changed', { PART: 'psldaa' }, [B.set('vhappy', { block: { type: 'app_slider_value', fields: { PART: 'psldaa' } } }),
      B.setText('plblaa', B.in(B.join(B.T('Happiness: '), { block: { type: 'app_slider_value', fields: { PART: 'psldaa' } } }), B.T('')))])]))],
  dice: ['Dice & spinner', 'Roll a dice or spin for a random choice.', 'trophy', () => build('Dice', [
    ['dcaaaa', 'Screen 1', 'Dice', '#c2410c', '#fffbeb', [
      at('box', 'dboxaa', 'DiceBox', 100, 100, 160, 160, { bg: '#ffffff', round: 28 }),
      at('label', 'dlblaa', 'Number', 100, 130, 160, 100, { text: '?', size: 80, color: '#c2410c' }),
      at('button', 'dbtnaa', 'RollButton', 60, 300, 240, 64, { text: 'Roll!', size: 26, bg: '#c2410c' }),
      at('label', 'dlblbb', 'Choice', 20, 400, 320, 44, { text: '', size: 22, color: '#1f2937' }),
      at('button', 'dbtnbb', 'SpinButton', 60, 460, 240, 56, { text: 'Spin: what shall we play?', size: 16, bg: '#4c6ef5' })]]],
  B.workspace([['vroll', 'roll']], [
    B.hat('app_when_pressed', { PART: 'dbtnaa' }, [B.sound('Drum'), B.set('vroll', { block: B.rand(1, 6) }), B.setText('dlblaa', B.in(B.get('vroll'), B.T(''))),
      B.if(B.cmp('EQ', B.in(B.get('vroll'), B.N(0)), B.N(6)), [B.sound('Cheer'), { type: 'app_message', inputs: { TEXT: B.T('A six!') } }])]),
    B.hat('app_when_pressed', { PART: 'dbtnbb' }, [B.sound('Whoosh'), B.set('vroll', { block: B.rand(1, 3) }),
      B.if(B.cmp('EQ', B.in(B.get('vroll'), B.N(0)), B.N(1)), [B.setText('dlblbb', B.T('Tag!'))]),
      B.if(B.cmp('EQ', B.in(B.get('vroll'), B.N(0)), B.N(2)), [B.setText('dlblbb', B.T('Football!'))]),
      B.if(B.cmp('EQ', B.in(B.get('vroll'), B.N(0)), B.N(3)), [B.setText('dlblbb', B.T('Hopscotch!'))])])]))]
};
export const STARTER_KEYS = Object.keys(STARTERS);
export function newProject(kind = 'blank') { const s = STARTERS[kind] || STARTERS.blank; const p = s[3](); p.app.id = newId(Math.random, 8); return p; }

// ── Check my app: friendly advice ──
function lum(hex) { const c = safeColour(hex); if (!c) return 0; const h = c.length === 4 ? c.slice(1).split('').map(x => x + x).join('') : c.slice(1); return [0, 2, 4].map(i => { const v = parseInt(h.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0); }
export function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
export function eachBlock(code, fn) {
  const walk = b => { if (!b || typeof b !== 'object') return; fn(b); if (b.inputs) for (const k of Object.keys(b.inputs)) { walk(b.inputs[k].block); walk(b.inputs[k].shadow); } if (b.next) walk(b.next.block); };
  const tops = code && code.blocks && code.blocks.blocks && code.blocks.blocks.blocks; if (Array.isArray(tops)) tops.forEach(walk);
}
export const HATS = ['app_when_starts', 'app_when_pressed', 'app_when_opens', 'app_when_changed'];
export function checkApp(p) {
  const out = [], ids = new Set(allParts(p).map(x => x.id)), pressed = new Set(), screensGone = new Set(), used = new Set();
  eachBlock(p.code, b => { const f = b.fields || {}; if (b.type === 'app_when_pressed') pressed.add(f.PART); if (f.PART) used.add(f.PART); if (f.SCREEN) used.add('screen:' + f.SCREEN); if (f.PART && !ids.has(f.PART)) out.push({ level: 'warn', text: 'Some blocks use a part that has been deleted.' }); if (f.SCREEN && !p.app.order.includes(f.SCREEN)) screensGone.add(f.SCREEN); });
  if (screensGone.size) out.push({ level: 'warn', text: 'Some blocks go to a screen that has been deleted.' });
  for (const s of screensOf(p)) {
    for (const x of s.parts) {
      if (x.t === 'button' && !pressed.has(x.id)) out.push({ level: 'tip', screen: s.id, part: x.id, text: `${x.name} doesn't do anything yet. Give it a “when ${x.name} is pressed” script in Code.` });
      if (x.t === 'image' && !x.alt.trim()) out.push({ level: 'warn', screen: s.id, part: x.id, text: `${x.name} has no description, so people who can't see it won't know what it shows.` });
      if ((x.t === 'button' || x.t === 'label' || x.t === 'switch') && contrast(x.color, x.t === 'button' ? x.bg : s.bg) < 3) out.push({ level: 'warn', screen: s.id, part: x.id, text: `${x.name}'s words are hard to read on that colour.` });
      if (x.t === 'button' && (x.w < 44 || x.h < 44)) out.push({ level: 'tip', screen: s.id, part: x.id, text: `${x.name} is small: fingers find buttons at least 44 wide and 44 tall easier to press.` });
      if (x.x + x.w > PHONE.w + 4 || x.y + x.h > PHONE.h + 4 || x.x < -4 || x.y < (s.title ? PHONE.bar - 4 : -4)) out.push({ level: 'tip', screen: s.id, part: x.id, text: `${x.name} goes off the edge of the screen.` });
    }
    const others = p.app.order.indexOf(s.id) > 0;
    if (others && !used.has('screen:' + s.id)) out.push({ level: 'tip', screen: s.id, text: `Nothing goes to ${s.name} yet. Use a “go to ${s.name}” block.` });
  }
  return out;
}

// ── lesson goals (ticked by what's in the app) ──
export function cleanGoals(g) {
  if (!g || typeof g !== 'object') return null;
  const list = (Array.isArray(g.list) ? g.list : []).slice(0, 8).map(x => x && typeof x === 'object' ? {
    type: one(x.type, ['parts', 'screens', 'block', 'pressed', 'text', 'named', 'sound', 'remember', 'picture'], 'parts'),
    t: PARTS[x.t] ? x.t : undefined, block: typeof x.block === 'string' ? x.block.slice(0, 40) : undefined, n: clamp(x.n, 1, 50, 1) | 0, value: str(x.value, 80), text: str(x.text, 120) } : null).filter(Boolean);
  return { title: str(g.title, 80) || 'Goals', list };
}
export function checkGoals(goals, p) {
  if (!goals) return [];
  const parts = allParts(p), types = new Map(); eachBlock(p.code, b => types.set(b.type, (types.get(b.type) || 0) + 1));
  const pressed = new Set(); eachBlock(p.code, b => { if (b.type === 'app_when_pressed' && b.fields && b.next) pressed.add(b.fields.PART); });
  return goals.list.map(x => {
    let ok = false;
    if (x.type === 'parts') ok = parts.filter(q => !x.t || q.t === x.t).length >= x.n;
    else if (x.type === 'screens') ok = p.app.order.length >= x.n;
    else if (x.type === 'block') ok = (types.get(x.block) || 0) >= x.n;
    else if (x.type === 'pressed') ok = parts.filter(q => pressed.has(q.id)).length >= x.n;
    else if (x.type === 'text') ok = parts.some(q => (q.text || '').toLowerCase().includes(x.value.toLowerCase()));
    else if (x.type === 'named') ok = parts.filter(q => !/^(Button|Text|Picture|Textbox|Slider|Switch|List|Shape)\d+$/.test(q.name)).length >= x.n;
    else if (x.type === 'sound') ok = (types.get('app_play_sound') || 0) >= x.n;
    else if (x.type === 'remember') ok = (types.get('app_remember') || 0) >= 1 && (types.get('app_remembered') || 0) >= 1;
    else if (x.type === 'picture') ok = parts.filter(q => q.t === 'image' && q.alt.trim()).length >= x.n;
    return { text: x.text, ok };
  });
}
