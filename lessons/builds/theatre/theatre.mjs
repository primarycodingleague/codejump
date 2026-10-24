// Lantern Street Theatre — the Stage Lab's lesson unit (lessons/units/stage.js). One place for every new lesson's starter
// (SPECS), its pictures (PAINTS, drawn into editable Stage drawings by the app's own vecRecord) and the intended answer
// (ANSWERS), so the starters (lessons/builds/theatre-*.mjs → make-starters.mjs) and the tests (tests/unit-stage.test.mjs)
// can never drift apart. This folder is not a lesson: make-starters.mjs only reads the *.mjs files directly in builds/.
//
// A spec: { ks: 'ks1'|'ks2', backdrops: [{name, paint, opt} | {name, lib} | {name, color}], sprites: [{name, costumes, x, y,
//   size?, xml? (KS2 Blockly XML), ks1? (KS1 picture-block scripts)}], vars?, lists?, sel? }.
// Positions: KS1 specs use stage pixels (0,0 top left, 960×576, like the KS1 engine); KS2 specs use Stage block coordinates
// (0,0 in the middle, y up, like "go to x … y …").
// An answer: { sprites: { <sprite name>: xml | ks1 scripts }, vars?, lists? } — only the sprites the pupils change.

// ───────────────────────────── pictures (each runs in the page on a recording 2D context) ─────────────────────────────
// The theatre: back wall, wooden stage, red curtains, a valance and two lanterns. opt: dark | lit | spot | steps
function theatre(c, o) {
  o = o || {};
  const lg = (x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  c.fillStyle = lg(0, 0, 0, 420, o.dark ? '#0d0816' : '#2d1b45', o.dark ? '#1c1230' : '#5a3a78'); c.fillRect(0, 0, 960, o.steps ? 540 : 420);
  if (!o.dark) { c.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 5; i++) c.fillRect(190 + i * 120, 120, 80, 250); }
  if (o.lit || o.spot) { c.fillStyle = 'rgba(255,240,180,0.16)'; c.beginPath(); c.moveTo(430, 0); c.lineTo(530, 0); c.lineTo(640, 470); c.lineTo(320, 470); c.closePath(); c.fill(); }
  const top = o.steps ? 426 : 400;
  if (o.steps) {
    c.fillStyle = lg(0, 540, 0, 576, '#8d5a2b', '#6b4120'); c.fillRect(0, 540, 960, 36); // the hall floor, in front of the stage
    c.fillStyle = lg(0, top, 0, 540, '#d39a5c', '#a8703a'); c.fillRect(300, top, 520, 114); // the raised stage
    c.fillStyle = '#5a3418'; c.fillRect(300, top - 4, 520, 8);
    [[240, 502], [270, 464], [300, 426]].forEach(([x, y]) => { c.fillStyle = '#c4874a'; c.fillRect(x, y, 330 - x, 540 - y); c.fillStyle = '#5a3418'; c.fillRect(x, y - 3, 330 - x, 6); });
  } else {
    c.fillStyle = lg(0, top, 0, 576, o.dark ? '#7a5230' : '#d39a5c', o.dark ? '#4a3018' : '#8d5a2b'); c.fillRect(0, top, 960, 576 - top);
    c.strokeStyle = 'rgba(90,50,20,0.55)'; c.lineWidth = 2;
    for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(0, top + i * 30); c.lineTo(960, top + i * 30); c.stroke(); }
    c.fillStyle = '#5a3418'; c.fillRect(0, top - 4, 960, 8);
  }
  if (o.spot) { c.fillStyle = 'rgba(255,236,160,0.5)'; c.beginPath(); c.ellipse(480, 470, 150, 34, 0, 0, Math.PI * 2); c.fill(); }
  for (let side = 0; side < 2; side++) for (let k = 0; k < 4; k++) {
    const X = x => side ? 960 - x : x, x0 = k * 34, x1 = x0 + 46, sw = 14 + k * 12;
    c.fillStyle = lg(X(x0), 0, X(x1), 0, '#d8314c', '#78101f');
    c.beginPath(); c.moveTo(X(x0), 0); c.lineTo(X(x1), 0); c.bezierCurveTo(X(x1 - 6), 160, X(x1 + sw), 300, X(x1 + sw - 8), 576); c.lineTo(X(x0), 576); c.closePath(); c.fill();
  }
  c.fillStyle = '#e8b04a'; [[0, 1], [1, -1]].forEach(([s]) => { c.beginPath(); c.ellipse(s ? 870 : 90, 300, 26, 9, 0, 0, Math.PI * 2); c.fill(); });
  c.fillStyle = '#b3172f'; c.fillRect(0, 0, 960, 52);
  for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(40 + i * 80, 52, 40, 0, Math.PI); c.fill(); }
  c.fillStyle = '#f2c14e'; c.fillRect(0, 0, 960, 8); c.fillRect(0, 50, 960, 4);
  [250, 710].forEach(x => {
    c.strokeStyle = '#2b2240'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, 54); c.lineTo(x, 96); c.stroke();
    c.fillStyle = o.dark ? 'rgba(255,190,90,0.2)' : 'rgba(255,200,90,0.35)'; c.beginPath(); c.arc(x, 124, 46, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2b2240'; c.fillRect(x - 16, 94, 32, 8); c.fillRect(x - 16, 148, 32, 8);
    c.fillStyle = o.dark ? '#a8742c' : '#ffb347'; c.beginPath(); c.ellipse(x, 125, 20, 24, 0, 0, Math.PI * 2); c.fill();
  });
  if (!o.steps) for (let i = 0; i < 9; i++) { c.fillStyle = o.dark ? '#6b5a2a' : '#ffe08a'; c.beginPath(); c.ellipse(120 + i * 90, 568, 16, 7, 0, 0, Math.PI * 2); c.fill(); }
}
// The audience hall, seen from the stage: walls, a red carpet and the stage edge at the top.
function hall(c) {
  const lg = (x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  c.fillStyle = lg(0, 0, 0, 200, '#3a1830', '#6b2a3e'); c.fillRect(0, 0, 960, 200);
  c.fillStyle = 'rgba(255,220,150,0.25)'; [160, 480, 800].forEach(x => { c.beginPath(); c.arc(x, 80, 30, 0, Math.PI * 2); c.fill(); });
  c.fillStyle = '#ffd27a'; [160, 480, 800].forEach(x => { c.beginPath(); c.arc(x, 80, 12, 0, Math.PI * 2); c.fill(); });
  c.fillStyle = lg(0, 200, 0, 576, '#8c1d2c', '#4d0d18'); c.fillRect(0, 200, 960, 376);
  c.fillStyle = '#5a3418'; c.fillRect(0, 196, 960, 10);
  c.strokeStyle = 'rgba(255,210,120,0.25)'; c.lineWidth = 3;
  for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(0, 200 + i * 62); c.lineTo(960, 200 + i * 62); c.stroke(); }
  c.fillStyle = '#ffd27a'; for (let y = 240; y < 576; y += 56) { c.beginPath(); c.arc(40, y, 5, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(920, y, 5, 0, Math.PI * 2); c.fill(); }
}
// Costumes are drawn round (0, 0), the costume's centre, in stage pixels.
function seat(c) { // a red theatre seat
  c.fillStyle = '#2b2240'; c.fillRect(-20, 16, 6, 14); c.fillRect(14, 16, 6, 14);
  c.fillStyle = '#c21f3a'; c.beginPath(); c.roundRect(-22, -30, 44, 36, 8); c.fill();
  c.fillStyle = '#e04a62'; c.beginPath(); c.roundRect(-18, -26, 36, 14, 5); c.fill();
  c.fillStyle = '#9b1530'; c.beginPath(); c.roundRect(-24, 2, 48, 16, 6); c.fill();
  c.fillStyle = '#f2c14e'; c.beginPath(); c.arc(0, -20, 3, 0, Math.PI * 2); c.fill();
}
function curtain(c) { // a red curtain as big as the stage
  const lg = (x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  for (let k = 0; k < 16; k++) { const x = -480 + k * 60; c.fillStyle = lg(x, 0, x + 60, 0, '#d8314c', '#7a1020'); c.fillRect(x, -288, 61, 576); }
  c.fillStyle = '#f2c14e'; c.fillRect(-480, 268, 960, 20);
  for (let k = 0; k < 16; k++) { c.beginPath(); c.arc(-450 + k * 60, 268, 9, 0, Math.PI * 2); c.fill(); }
}
function spot(c, col) { // a pool of light
  c.fillStyle = col === 'pink' ? 'rgba(255,120,200,0.45)' : 'rgba(255,236,140,0.5)'; c.beginPath(); c.ellipse(0, 0, 90, 90, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = col === 'pink' ? 'rgba(255,160,220,0.35)' : 'rgba(255,248,200,0.45)'; c.beginPath(); c.ellipse(0, 0, 55, 55, 0, 0, Math.PI * 2); c.fill();
}
export const PAINTS = { theatre: theatre.toString(), hall: hall.toString(), seat: seat.toString(), curtain: curtain.toString(), spot: spot.toString() };

// ───────────────────────────── the build (runs in the page; used by every theatre-*.mjs) ─────────────────────────────
export function build({ spec, paints }) {
  startNewStage(spec.ks);
  const ks1 = spec.ks === 'ks1', P = k => (0, eval)('(' + paints[k] + ')');
  const sign = { k: 'text', t: 'LANTERN STREET THEATRE', z: 22, fo: 0, f: '#ffe9a8', m: [1, 0, 0, 1, -158, -282] };
  const bd = b => {
    if (b.paint) { const v = { w: 960, h: 576, shapes: vecRecord(c => P(b.paint)(c, b.opt), [1, 0, 0, 1, -480, -288]) }; if (b.paint === 'theatre') v.shapes.push(Object.assign({}, sign)); return { name: b.name, vec: v }; }
    if (b.lib) return { name: b.name, vec: vecFromBackdrop(b.lib) };
    return { name: b.name, color: b.color || '#bfe3ff' };
  };
  const co = c => c.paint ? { name: c.name, vec: { w: 480, h: 360, shapes: vecRecord(x => P(c.paint)(x, c.opt)) } } : Object.assign({}, c);
  const sprites = spec.sprites.map((d, i) => {
    const s = blankSprite(d.name, i);
    s.costumes = d.costumes.map(co); s.costumeIdx = 0; s.size = d.size || 100; s.dir = 90; s.visible = d.visible !== false;
    s.x = ks1 ? d.x : CW / 2 + d.x; s.y = ks1 ? d.y : CH / 2 - d.y;
    s.xml = d.xml || ''; s.ks1 = d.ks1 ? JSON.parse(JSON.stringify(d.ks1)) : [];
    return s;
  });
  stageState.sprites.length = 0; sprites.forEach(s => stageState.sprites.push(s));
  stageState.backdrops = spec.backdrops.map(bd); stageState.backdropIdx = 0; stageState.bg = '#2d1b45';
  stageState.vars = (spec.vars || []).slice(); stageState.lists = (spec.lists || []).slice();
  stageSel = spec.sel || 0;
  if (ks1) {
    stageState.pages = [{ sprites: stageState.sprites, backdropIdx: 0 }]; stageState.pageIdx = 0;
    const s = stageState.sprites[stageSel]; ks1Target = { si: s.ks1.length ? 0 : -1, rep: -1 };
    ks1RenderSprites(); ks1RenderScripts(); ks1RenderPages();
  } else { stageLoadSpriteScripts(stageSel); renderSpritePanel(); }
}
export function args(id) { if (!SPECS[id]) throw new Error('no theatre spec ' + id); return { spec: SPECS[id], paints: PAINTS }; }

// ───────────────────────────── Blockly XML, written compactly ─────────────────────────────
// blk(type, fields, values, statements): fields {NAME: value | {v: name, id} (a variable) | {v, id, list: 1}};
// values {NAME: number | {t: 'text'} | blk(...)}; statements {NAME: [blk, …]}
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const blk = (t, f, v, s) => ({ t, f: f || {}, v: v || {}, s: s || {} });
const fieldXml = (k, x) => x && typeof x === 'object'
  ? `<field name="${k}" id="${x.id}"${x.list ? ' variabletype="list"' : ''}>${esc(x.v)}</field>` : `<field name="${k}">${esc(x)}</field>`;
const valXml = x => typeof x === 'number' ? `<shadow type="math_number"><field name="NUM">${x}</field></shadow>`
  : (x && x.t !== undefined && typeof x.t === 'string' && !x.f) ? `<shadow type="text"><field name="TEXT">${esc(x.t)}</field></shadow>` : one(x, []);
function one(b, rest) {
  let s = `<block type="${b.t}">`;
  for (const [k, x] of Object.entries(b.f)) s += fieldXml(k, x);
  for (const [k, x] of Object.entries(b.v)) s += `<value name="${k}">${valXml(x)}</value>`;
  for (const [k, x] of Object.entries(b.s)) s += `<statement name="${k}">${seq(x)}</statement>`;
  return s + (rest.length ? `<next>${seq(rest)}</next>` : '') + '</block>';
}
const seq = arr => arr.length ? one(arr[0], arr.slice(1)) : '';
// a sprite's program: scripts = [[hat, …blocks], …]; vars = names used (made with ids v_<name>), lists = list names (l_<name>)
export function xml(scripts, vars = [], lists = []) {
  const vs = vars.map(n => `<variable id="v_${n}">${esc(n)}</variable>`).concat(lists.map(n => `<variable type="list" id="l_${n}">${esc(n)}</variable>`));
  let y = 20;
  const tops = scripts.map(sc => { const s = seq(sc).replace(/^<block type="([^"]+)">/, `<block type="$1" x="20" y="${y}">`); y += 60 + 34 * depth(sc); return s; });
  return `<xml xmlns="https://developers.google.com/blockly/xml">${vs.length ? '<variables>' + vs.join('') + '</variables>' : ''}${tops.join('')}</xml>`;
}
const depth = sc => sc.reduce((a, b) => a + 1 + Object.values(b.s).reduce((m, x) => m + depth(x), 0), 0);
export const V = n => ({ v: n, id: 'v_' + n }), Ls = n => ({ v: n, id: 'l_' + n, list: 1 });
// the blocks the unit uses
const flag = () => blk('st_when_flag'), clicked = () => blk('st_when_clicked'), key = k => blk('st_when_key', { KEY: k });
const sayFor = (txt, secs) => blk('st_say_secs', { TXT: txt, SECS: secs }), say = txt => blk('st_say', { TXT: txt }), think = txt => blk('st_think', { TXT: txt });
const wait = n => blk('st_wait', { N: n }), gotoXY = (x, y) => blk('st_goto_xy', { X: x, Y: y }), glide = (s, x, y) => blk('st_glide_xy', { SECS: s, X: x, Y: y });
const chX = n => blk('st_change_x', { N: n }), chY = n => blk('st_change_y', { N: n }), setX = x => blk('st_set_x', { X: x }), move = n => blk('st_move', { N: n });
const repeat = (n, body) => blk('st_repeat', { N: n }, {}, { DO: body }), forever = body => blk('st_forever', {}, {}, { DO: body });
const iff = (cond, body) => blk('st_if', {}, { COND: cond }, { DO: body }), ifElse = (cond, a, b) => blk('st_if_else', {}, { COND: cond }, { DO: a, ELSE: b });
const repeatUntil = (cond, body) => blk('st_repeat_until', {}, { COND: cond }, { DO: body }), waitUntil = cond => blk('st_wait_until', {}, { COND: cond });
const cmp = (op, a, b) => blk('logic_compare', { OP: op }, { A: a, B: b }), and = (a, b) => blk('logic_operation', { OP: 'AND' }, { A: a, B: b });
const xpos = () => blk('st_xpos'), ypos = () => blk('st_ypos'), text = t => blk('text', { TEXT: t }), touching = n => blk('st_touching', { TARGET: n });
const keyDown = k => blk('st_key_pressed', { KEY: k }), attr = (a, n) => blk('st_attr_of', { ATTR: a, TARGET: n });
const backdrop = n => blk('st_switch_backdrop', { BD: n }), nextCos = () => blk('st_next_costume'), show = () => blk('st_show'), hide = () => blk('st_hide');
const setVar = (n, v) => blk('variables_set', { VAR: V(n) }, { VALUE: v }), chVar = (n, d) => blk('math_change', { VAR: V(n) }, { DELTA: d });
const getVar = n => blk('variables_get', { VAR: V(n) }), showVar = n => blk('st_show_var', { VAR: V(n) });
const bcastWait = m => blk('st_broadcast_wait', { MSG: m }), bcast = m => blk('st_broadcast', { MSG: m }), recv = m => blk('st_when_receive', { MSG: m });

// ───────────────────────────── costumes ─────────────────────────────
const two = (b, color, n1 = 'costume1', n2 = 'costume2') => [{ name: n1, builtin: b, color }, { name: n2, builtin: b, color, pose: 1 }];
const one1 = (b, color, n = 'costume1') => [{ name: n, builtin: b, color }];
const PIP = two('cat', '#f59f18'), BRAMBLE = two('bear', '#b07a4a'), DOT = two('bird', '#4dabf7'), BOLT = two('robot', '#adb5bd'),
  BUN = two('bunny', '#ffb0c8'), BISCUIT = two('dog', '#c8915a');
const THEATRE = (name = 'Theatre', opt) => ({ name, paint: 'theatre', opt });
const CURTAIN = { name: 'Curtain', costumes: [{ name: 'curtain', paint: 'curtain' }], x: 0, y: 0 };

// KS1 picture blocks
const k = (t, n) => n === undefined ? { t } : { t, n };
const ksay = text => ({ t: 'say', text }), krep = (n, body) => ({ t: 'repeat', n, body });

// ───────────────────────────── starters ─────────────────────────────
export const SPECS = {
  // ── Block 1 (Years 1–2, picture blocks) ──
  'theatre-2-steps': { ks: 'ks1', backdrops: [THEATRE('Theatre', { steps: 1 })], sprites: [
    { name: 'Bun', costumes: BUN, x: 168, y: 500, ks1: [[k('flag'), k('right', 2)]] },
    { name: 'Star', costumes: one1('star', '#ffd43b'), x: 408, y: 386 }] },
  'theatre-4-ball': { ks: 'ks1', backdrops: [THEATRE()], sprites: [
    { name: 'Ball', costumes: one1('ball', '#ff6b6b'), x: 216, y: 480, ks1: [[k('flag'), k('right', 1), k('hop', 1)]] },
    { name: 'Bramble', costumes: BRAMBLE, x: 560, y: 466 }] },
  'theatre-5-wake': { ks: 'ks1', backdrops: [THEATRE('Theatre', { dark: 1 })], sprites: [
    { name: 'Pip', costumes: PIP, x: 260, y: 466, ks1: [[k('flag'), ksay('Zzz…')]] },
    { name: 'Bramble', costumes: BRAMBLE, x: 480, y: 466, ks1: [[k('flag'), ksay('Zzz…')]] },
    { name: 'Dot', costumes: DOT, x: 700, y: 466, ks1: [[k('flag'), ksay('Zzz…')]] }] },
  'theatre-6-show': { ks: 'ks1', backdrops: [THEATRE('Theatre', { lit: 1 })], sprites: [
    { name: 'Pip', costumes: PIP, x: 240, y: 466 },
    { name: 'Dot', costumes: DOT, x: 700, y: 300 },
    { name: 'Star', costumes: one1('star', '#ffd43b'), x: 480, y: 150 }] },
  // ── Block 2 (Years 3–4) ──
  'theatre-7-joke': { ks: 'ks2', backdrops: [THEATRE()], sel: 1, sprites: [
    { name: 'Pip', costumes: PIP, x: -150, y: -150, xml: xml([[flag(), sayFor('Knock knock!', 2), wait(2), sayFor('Pip!', 2), wait(2), sayFor('Pip pip hooray, the show is starting!', 3)]]) },
    { name: 'Bramble', costumes: BRAMBLE, x: 150, y: -150, xml: xml([[flag(), sayFor('Who’s there?', 2)]]) }] },
  'theatre-9-scenes': { ks: 'ks2', backdrops: [{ name: 'Night garden', lib: 'night' }, { name: 'Day garden', lib: 'meadow' }], sprites: [
    { name: 'Sun', costumes: one1('ball', '#ffd43b'), size: 160, x: 250, y: -250, xml: xml([[flag(), backdrop('Night garden'), gotoXY(250, -250)]]) },
    { name: 'Dot', costumes: DOT, x: -380, y: 200, xml: xml([[flag(), gotoXY(-380, 200)]]) },
    { name: 'Bramble', costumes: BRAMBLE, x: 150, y: -170, xml: xml([[flag(), think('Zzz…')]]) }] },
  'theatre-10-seats': { ks: 'ks2', backdrops: [{ name: 'Hall', paint: 'hall' }], sprites: [
    { name: 'Seat', costumes: [{ name: 'seat', paint: 'seat' }], x: -240, y: -40,
      xml: xml([[flag(), blk('st_pen_clear'), show(), gotoXY(-240, -40), blk('st_pen_stamp'), chX(60), blk('st_pen_stamp'), chX(60), blk('st_pen_stamp')]]) },
    { name: 'Bramble', costumes: BRAMBLE, size: 80, x: 390, y: -200 }] },
  'theatre-11-rehearsal': { ks: 'ks2', backdrops: [THEATRE()], sprites: [
    { name: 'Pip', costumes: PIP, x: -250, y: -150, xml: xml([[flag(), gotoXY(-250, -150), repeat(10, [nextCos(), wait(0.1)]), move(25)]]) },
    { name: 'Bolt', costumes: BOLT, x: 220, y: -150, xml: xml([[flag(), sayFor('Beep! Welcome!', 2)]]) },
    { name: 'Dot', costumes: DOT, x: 0, y: 120, xml: xml([[key('space'), sayFor('Goodbye!', 2), sayFor('Hello!', 2)]]) }] },
  'theatre-12-puppets': { ks: 'ks2', backdrops: [THEATRE(), THEATRE('Night', { dark: 1 })], sprites: [
    { name: 'Pip', costumes: PIP, x: -200, y: -150 },
    { name: 'Bramble', costumes: BRAMBLE, x: 200, y: -150 },
    { name: 'Dot', costumes: DOT, x: 0, y: 150 }] },
  // ── Block 3 (Years 4–5) ──
  'theatre-14-door': { ks: 'ks2', backdrops: [{ name: 'Outside', lib: 'city' }, THEATRE('Backstage', { lit: 1 })], sprites: [
    { name: 'Bolt', costumes: BOLT, x: 150, y: -150, xml: xml([[flag(), backdrop('Outside'), sayFor('I guard the stage door.', 2)],
      [clicked(), blk('st_ask', { Q: 'What’s the magic word?' }), sayFor('Hmm, let me think…', 2)]]) },
    { name: 'Biscuit', costumes: BISCUIT, x: -200, y: -150 }] },
  'theatre-15-spotlight': { ks: 'ks2', backdrops: [THEATRE('Theatre', { spot: 1 })], sprites: [
    { name: 'Pip', costumes: PIP, x: 0, y: -150, xml: xml([
      [flag(), gotoXY(0, -150), forever([ifElse(cmp('GT', xpos(), -150), [say('I’m in the spotlight!')], [say('It’s dark out here!')])])],
      [key('right'), chX(10)], [key('left'), chX(-10)]]) }] },
  'theatre-16-curtain': { ks: 'ks2', backdrops: [THEATRE()], sel: 1, sprites: [
    { name: 'Pip', costumes: PIP, x: 0, y: -150, xml: xml([[flag(), sayFor('Welcome to the show!', 2)]]) },
    Object.assign({}, CURTAIN, { xml: xml([[flag(), show(), gotoXY(0, 0), forever([chY(5)])]]) })] },
  'theatre-17-lights': { ks: 'ks2', backdrops: [THEATRE()], sprites: [
    { name: 'Spot', costumes: [{ name: 'warm', paint: 'spot', opt: 'warm' }, { name: 'pink', paint: 'spot', opt: 'pink' }], x: -300, y: -150,
      xml: xml([[flag(), iff(keyDown('space'), [nextCos(), wait(0.2)]), forever([blk('st_goto', { WHERE: 'Pip' })])]]) },
    { name: 'Pip', costumes: PIP, x: -300, y: -150, xml: xml([[flag(), gotoXY(-300, -150), repeatUntil(cmp('LT', xpos(), 200), [chX(4)])]]) },
    { name: 'Dot', costumes: DOT, x: 250, y: -120, xml: xml([[flag(), waitUntil(touching('_edge')), sayFor('Bravo!', 2)]]) }] },
  'theatre-18-games': { ks: 'ks2', backdrops: [{ name: 'Foyer', lib: 'room' }], sprites: [
    { name: 'Pip', costumes: PIP, x: 0, y: -180 },
    { name: 'Ball', costumes: one1('ball', '#ff6b6b'), x: 0, y: 150 },
    { name: 'Star', costumes: one1('star', '#ffd43b'), x: 220, y: 100 }] },
  // ── Block 4 (Years 5–6) ──
  'theatre-19-tickets': { ks: 'ks2', backdrops: [{ name: 'Lantern Street', lib: 'city' }], sprites: [
    { name: 'Biscuit', costumes: BISCUIT, x: 0, y: -150, xml: xml([[flag(), sayFor('Tickets for tonight’s show!', 2)], [clicked(), sayFor('Here’s your ticket!', 1)]]) }] },
  'theatre-21-cues': { ks: 'ks2', backdrops: [THEATRE('Dark stage', { dark: 1 }), THEATRE('Lit stage', { lit: 1 })], sel: 2, sprites: [
    { name: 'Dot', costumes: DOT, x: 0, y: -130 },
    Object.assign({}, CURTAIN, { xml: xml([[flag(), show(), gotoXY(0, 0)]]) }),
    { name: 'Bolt', costumes: BOLT, x: -330, y: -150, xml: xml([[flag(), backdrop('Dark stage'), sayFor('Lights!', 1), sayFor('Curtain up!', 1), sayFor('Music!', 1)]]) }] },
  'theatre-22-votes': { ks: 'ks2', backdrops: [THEATRE('Theatre', { lit: 1 })], vars: ['count', 'i'], lists: ['votes'], sel: 3, sprites: [
    { name: 'Pip', costumes: PIP, x: -220, y: -150, xml: xml([[clicked(), sayFor('Thank you!', 1)]]) },
    { name: 'Dot', costumes: DOT, x: 0, y: -130, xml: xml([[clicked(), sayFor('Thank you!', 1)]]) },
    { name: 'Bolt', costumes: BOLT, x: 220, y: -150, xml: xml([[clicked(), sayFor('Thank you!', 1)]]) },
    { name: 'Bramble', costumes: BRAMBLE, size: 80, x: 380, y: 170 }] },
  'theatre-23-chorus': { ks: 'ks2', backdrops: [THEATRE('Theatre', { lit: 1 })], sprites: [
    { name: 'Dancer', costumes: BUN, x: 0, y: -150, xml: xml([[flag(), show(), gotoXY(0, -150), repeat(10, [nextCos(), wait(0.3)])]]) }] },
  'theatre-24-gala': { ks: 'ks2', backdrops: [THEATRE('Dark stage', { dark: 1 }), THEATRE('Lit stage', { lit: 1 })], sel: 3, sprites: [
    { name: 'Dot', costumes: DOT, x: 0, y: -130 },
    Object.assign({}, CURTAIN),
    { name: 'Pip', costumes: PIP, x: -220, y: -150 },
    { name: 'Bolt', costumes: BOLT, x: -360, y: -150, xml: xml([[flag(), backdrop('Dark stage'), sayFor('Welcome to the grand show!', 2)]]) }] }
};
// Bramble counts the votes for Pip: the starter has the loop that walks through the list; pupils add the if inside it.
const votesStart = () => [flag(), blk('st_list_delete_all', { LIST: Ls('votes') }), blk('st_show_list', { LIST: Ls('votes') }), sayFor('Click your favourite act to vote!', 2)];
const countLoop = body => [key('space'), setVar('count', 0), setVar('i', 1), showVar('count'),
  repeatUntil(cmp('GT', getVar('i'), blk('st_list_length', { LIST: Ls('votes') })), body.concat([chVar('i', 1)]))];
SPECS['theatre-22-votes'].sprites[3].xml = xml([votesStart(), countLoop([])], ['count', 'i'], ['votes']);

// ───────────────────────────── the intended answers ─────────────────────────────
const addVote = n => blk('st_list_add', { LIST: Ls('votes') }, { ITEM: { t: n } });
export const ANSWERS = {
  'theatre-2-steps': { sprites: { Bun: [[k('flag'), k('right', 2), k('up', 3), k('right', 3)]] } },
  'theatre-4-ball': { sprites: { Ball: [[k('flag'), krep(5, [k('right', 1), k('hop', 1)])]] } },
  'theatre-5-wake': { sprites: {
    Pip: [[k('flag'), ksay('Zzz…')], [k('tap'), ksay('Good morning!'), k('hop', 1)]],
    Bramble: [[k('flag'), ksay('Zzz…')], [k('tap'), k('grow', 2), ksay('Hello!')]],
    Dot: [[k('flag'), ksay('Zzz…')], [k('tap'), k('up', 3), k('down', 3)]] } },
  'theatre-6-show': { sprites: {
    Pip: [[k('flag'), k('right', 3), ksay('Welcome to our show!'), krep(3, [k('hop', 1)])], [k('tap'), ksay('Thank you!'), k('turnR', 12)]],
    Dot: [[k('flag'), krep(2, [k('down', 1), k('up', 1)])], [k('tap'), k('pop')]] } },
  'theatre-7-joke': { sprites: { Bramble: xml([[flag(), wait(2), sayFor('Who’s there?', 2), wait(2), sayFor('Pip who?', 2)]]) } },
  'theatre-9-scenes': { sprites: {
    Sun: xml([[flag(), backdrop('Night garden'), gotoXY(250, -250), glide(3, 250, 180), backdrop('Day garden')]]),
    Dot: xml([[flag(), gotoXY(-380, 200), wait(3), glide(2, -100, 60), sayFor('Tweet tweet!', 2)]]),
    Bramble: xml([[flag(), think('Zzz…'), wait(6), sayFor('What a lovely morning!', 2)]]) } },
  'theatre-10-seats': { sprites: { Seat: xml([[flag(), blk('st_pen_clear'), show(), gotoXY(-240, -40),
    repeat(3, [repeat(9, [blk('st_pen_stamp'), chX(60)]), setX(-240), chY(-70)]), hide()]]) } },
  'theatre-11-rehearsal': { sprites: {
    Pip: xml([[flag(), gotoXY(-250, -150), repeat(10, [move(25), nextCos(), wait(0.1)])]]),
    Bolt: xml([[clicked(), sayFor('Beep! Welcome!', 2)]]),
    Dot: xml([[key('space'), sayFor('Hello!', 2), sayFor('Goodbye!', 2)]]) } },
  'theatre-12-puppets': { sprites: {
    Pip: xml([[flag(), backdrop('Theatre'), gotoXY(-200, -150), sayFor('Hello! Welcome to our puppet show.', 2), wait(2), repeat(4, [nextCos(), chX(20), wait(0.2)]), sayFor('Shall we dance, Bramble?', 2)],
      [clicked(), sayFor('That tickles!', 1)]]),
    Bramble: xml([[flag(), wait(2), sayFor('Hello, Pip! Hello, everyone!', 2), wait(3), sayFor('Yes please!', 2)]]),
    Dot: xml([[key('space'), repeat(6, [chY(20), wait(0.1), chY(-20), wait(0.1)]), sayFor('Tweet!', 1)]]) } },
  'theatre-14-door': { sprites: { Bolt: xml([[flag(), backdrop('Outside'), sayFor('I guard the stage door.', 2)],
    [clicked(), blk('st_ask', { Q: 'What’s the magic word?' }), ifElse(cmp('EQ', blk('st_answer'), text('please')),
      [sayFor('Come in!', 2), backdrop('Backstage')], [sayFor('That’s not the magic word!', 2)])]]) } },
  'theatre-15-spotlight': { sprites: { Pip: xml([
    [flag(), gotoXY(0, -150), forever([ifElse(and(cmp('GT', xpos(), -150), cmp('LT', xpos(), 150)), [say('I’m in the spotlight!')], [say('It’s dark out here!')])])],
    [key('right'), chX(10)], [key('left'), chX(-10)]]) } },
  'theatre-16-curtain': { sprites: {
    Curtain: xml([[flag(), show(), gotoXY(0, 0), repeatUntil(cmp('GT', ypos(), 250), [chY(5)]), hide()]]),
    Pip: xml([[flag(), waitUntil(cmp('GT', attr('ypos', 'Curtain'), 250)), sayFor('Welcome to the show!', 2)]]) } },
  'theatre-17-lights': { sprites: {
    Spot: xml([[flag(), forever([blk('st_goto', { WHERE: 'Pip' }), iff(keyDown('space'), [nextCos(), wait(0.2)])])]]),
    Pip: xml([[flag(), gotoXY(-300, -150), repeatUntil(cmp('GT', xpos(), 200), [chX(4)])]]),
    Dot: xml([[flag(), waitUntil(touching('Pip')), sayFor('Bravo!', 2)]]) } },
  'theatre-18-games': { sprites: {
    Pip: xml([[flag(), gotoXY(0, -180)], [key('right'), chX(15)], [key('left'), chX(-15)]]),
    Ball: xml([[flag(), blk('st_set_score', { N: 0 }), gotoXY(0, 150), repeatUntil(cmp('EQ', blk('st_score'), 3), [chY(-6),
      iff(touching('Pip'), [blk('st_change_score', { N: 1 }), blk('st_play_sound', { SND: 'coin' }), gotoXY(0, 150)]),
      iff(cmp('LT', ypos(), -250), [gotoXY(0, 150)])]), sayFor('You win!', 2)]]) } },
  'theatre-19-tickets': { vars: ['seats', 'sold'], sprites: { Biscuit: xml([
    [flag(), setVar('seats', 20), setVar('sold', 0), showVar('seats'), showVar('sold'), sayFor('Tickets for tonight’s show!', 2)],
    [clicked(), ifElse(cmp('GT', getVar('seats'), 0), [chVar('seats', -1), chVar('sold', 1), sayFor('Here’s your ticket!', 1)], [sayFor('Sorry, sold out!', 2)])]], ['seats', 'sold']) } },
  'theatre-21-cues': { sprites: {
    Bolt: xml([[flag(), backdrop('Dark stage'), sayFor('Lights!', 1), bcastWait('lights'), sayFor('Curtain up!', 1), bcastWait('curtain'), sayFor('Music!', 1), bcastWait('music'), sayFor('Bravo, Dot!', 2)]]),
    Curtain: xml([[flag(), show(), gotoXY(0, 0)], [recv('lights'), backdrop('Lit stage')], [recv('curtain'), repeatUntil(cmp('GT', ypos(), 250), [chY(8)]), hide()]]),
    Dot: xml([[recv('music'), blk('st_play_sound', { SND: 'magic' }), sayFor('La la laaa!', 2)]]) } },
  'theatre-22-votes': { sprites: {
    Pip: xml([[clicked(), addVote('Pip'), sayFor('Thank you!', 1)]], [], ['votes']),
    Dot: xml([[clicked(), addVote('Dot'), sayFor('Thank you!', 1)]], [], ['votes']),
    Bolt: xml([[clicked(), addVote('Bolt'), sayFor('Thank you!', 1)]], [], ['votes']),
    Bramble: xml([votesStart(), countLoop([iff(cmp('EQ', blk('st_list_item', { LIST: Ls('votes') }, { INDEX: getVar('i') }), text('Pip')), [chVar('count', 1)])])], ['count', 'i'], ['votes']) } },
  'theatre-23-chorus': { sprites: { Dancer: xml([[flag(), hide(), gotoXY(-300, -150), repeat(6, [blk('st_clone', { WHICH: '_myself' }), chX(120)])],
    [blk('st_when_clone_start'), show(), repeat(10, [nextCos(), wait(0.3)])]]) } },
  'theatre-24-gala': { vars: ['applause'], sprites: {
    Bolt: xml([[flag(), backdrop('Dark stage'), setVar('applause', 0), showVar('applause'), sayFor('Welcome to the grand show!', 2), bcastWait('curtain'), bcastWait('song'),
      iff(cmp('GT', getVar('applause'), 2), [sayFor('What a crowd! Encore!', 2), bcast('song')])]], ['applause']),
    Curtain: xml([[flag(), show(), gotoXY(0, 0)], [recv('curtain'), backdrop('Lit stage'), repeatUntil(cmp('GT', ypos(), 250), [chY(8)]), hide()]]),
    Dot: xml([[recv('song'), repeat(4, [nextCos(), sayFor('La!', 0.5)])], [clicked(), chVar('applause', 1)]], ['applause']),
    Pip: xml([[recv('song'), repeat(4, [chY(30), wait(0.2), chY(-30), wait(0.2)])], [clicked(), chVar('applause', 1)]], ['applause']) } }
};


// ───────────────────────────── project lessons: the success criteria, checked from the programs ─────────────────────────────
// ks1: scripts per sprite; ks2: xml per sprite. Each returns [{text, ok}].
export function criteria(id, programs) {
  const all = Object.values(programs);
  if (id === 'theatre-6-show') {
    const scripts = all.flat(), flat = sc => sc.flatMap(b => [b, ...flat(b.body || [])]);
    return [
      { text: 'A green flag program with at least three blocks', ok: scripts.some(sc => sc[0] && sc[0].t === 'flag' && flat(sc).length >= 4) },
      { text: 'A repeat (or for ever) loop', ok: scripts.some(sc => flat(sc).some(b => b.t === 'repeat' || b.t === 'forever')) },
      { text: 'Something happens when you tap a character', ok: scripts.some(sc => sc[0] && sc[0].t === 'tap' && sc.length > 1) },
      { text: 'A character says something', ok: scripts.some(sc => flat(sc).some(b => b.t === 'say')) }];
  }
  const has = (re) => all.filter(x => re.test(x || '')).length, count = (re) => all.reduce((a, x) => a + ((x || '').match(re) || []).length, 0);
  const hats = new Set(); all.forEach(x => (x || '').replace(/type="(st_when_[a-z_]+|st_when_flag)"/g, (m, t) => hats.add(t)));
  if (id === 'theatre-12-puppets') return [
    { text: 'At least two sprites have code', ok: has(/<block/) >= 2 },
    { text: 'At least two different events start scripts', ok: hats.size >= 2 },
    { text: 'A repeat loop', ok: count(/type="st_repeat"/g) >= 1 },
    { text: 'At least four lines of dialogue, with timing', ok: count(/type="st_say_secs"/g) >= 4 }];
  if (id === 'theatre-18-games') return [
    { text: 'An if block inside a loop', ok: all.some(x => /type="st_(forever|repeat_until|repeat)">[\s\S]*type="st_if(_else)?"/.test(x || '')) },
    { text: 'A sensing condition (touching, a key, the answer or the mouse)', ok: count(/type="st_(touching|key_pressed|answer|mouse_down|distance_to)"/g) >= 1 },
    { text: 'A comparison (=, < or >) or and / or', ok: count(/type="(logic_compare|logic_operation|st_compare)"/g) >= 1 },
    { text: 'A loop that checks a condition (repeat until or wait until)', ok: count(/type="st_(repeat_until|wait_until)"/g) >= 1 },
    { text: 'The player gets feedback (a score or a message)', ok: count(/type="st_(change_score|say_secs|say)"/g) >= 1 }];
  if (id === 'theatre-24-gala') return [
    { text: 'A variable that changes', ok: count(/type="math_change"/g) >= 1 },
    { text: 'Messages: a broadcast and a “when I receive”', ok: count(/type="st_broadcast(_wait)?"/g) >= 1 && count(/type="st_when_receive"/g) >= 1 },
    { text: 'An if block that decides something', ok: count(/type="st_if(_else)?"/g) >= 1 },
    { text: 'A loop', ok: count(/type="st_(repeat|repeat_until|forever)"/g) >= 1 },
    { text: 'At least three sprites have code', ok: has(/<block/) >= 3 }];
  return [];
}
