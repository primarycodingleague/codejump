/* CodeJump · Build Lab — World Maker: lessons, coding challenges and competition arenas made inside a world. No DOM.
 *
 * A project may carry `maker` (made by a teacher, or a pupil, in Make mode):
 *   { v:1, title, intro, lock (a short hash of the teacher's unlock word, or ''),
 *     start:{x,y,z,yaw} (where you begin), helper:{x,y,z,f}, startWorld (run-length world text, the world as the lesson begins),
 *     npcs:[{id,name,x,y,z,f,colour,lines:[…],task,done}]   characters you talk to (click them or press E near them)
 *     zones:[{id,name,a:[x,y,z],b:[x,y,z],msg,show,colour}] areas: a pop-up when you walk in, task targets, protected spots
 *     tasks:[{id,type,text,…}]                              the checklist (see TASK_TYPES)
 *     rules:{build,break,fly,python,blocks:[ids]|null,code:'all'|'helper'|'builder'|'none',protect:[zone ids]}
 *     challenge:{on,time (s, 0 = no limit),par (blocks for 3 stars)} }
 * and `progress` { done:[task ids], best:{time,blocks} } so a hand-in shows how far a pupil got.
 *
 *   cleanMaker(m) → a safe copy (or null) · createChecker(maker) → {check(ctx) → [newly done ids], done, talk(id), chat(word), reset()}
 *   makeMaze(world, zone, opts) · programStats(state) · EXAMPLES / exampleProject(id)
 */
import { createWorld, W, H, D, GROUND, NBLOCKS, BY_NAME, isSolid } from './craft-world.js';
import * as L from './craft-lang.js';

export const TASK_TYPES = {
  visit: { label: 'Walk to an area', needs: ['zone'] },
  helper: { label: 'Get the helper to an area', needs: ['zone'] },
  talk: { label: 'Talk to a character', needs: ['npc'] },
  count: { label: 'Put blocks in an area', needs: ['zone', 'block', 'n'] },
  fill: { label: 'Fill an area with one block', needs: ['zone', 'block'] },
  clear: { label: 'Clear an area (dig it out)', needs: ['zone'] },
  tower: { label: 'Build a tower in an area', needs: ['zone', 'n'] },
  chat: { label: 'Type a chat command', needs: ['word'] },
  uses: { label: 'Use something in the code', needs: ['feature'] }
};
export const FEATURES = { loop: 'a loop (repeat, count, while)', if: 'an if', variable: 'a variable', chat: 'a chat command', helper: 'the robot helper', builder: 'a builder command' };
const FEATURE_TYPES = {
  loop: t => /^(controls_repeat_ext|controls_for|controls_whileUntil|cr_forever)$/.test(t), if: t => t === 'controls_if',
  variable: t => /^(variables_set|math_change)$/.test(t), chat: t => t === 'cr_on_chat', helper: t => t.startsWith('cr_h_'), builder: t => t.startsWith('cr_b_')
};
export const NPC_COLOURS = ['#e8453c', '#3b8eea', '#2bb673', '#f5a623', '#9b59d0', '#ec6fa8', '#17b8a6', '#6d5d4b'];
const MAX_ZONE = 32768, MAX_NPCS = 20, MAX_ZONES = 30, MAX_TASKS = 30;

const str = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, n);
const lines = (v, n, each) => (Array.isArray(v) ? v : String(v || '').split('\n')).map(s => str(s, each).trim()).filter(Boolean).slice(0, n);
const int = (v, lo, hi, d) => { v = Math.round(Number(v)); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; };
const num = (v, lo, hi, d) => { v = Number(v); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; };
const id = (v, p) => (/^[a-z0-9_-]{1,24}$/i.test(String(v || '')) ? String(v) : p + Math.random().toString(36).slice(2, 8));
const col = (v, d) => (/^#[0-9a-f]{6}$/i.test(String(v || '')) ? String(v) : d);
const cell = (a, d) => (Array.isArray(a) && a.length === 3 ? [int(a[0], 0, W - 1, d[0]), int(a[1], 0, H - 1, d[1]), int(a[2], 0, D - 1, d[2])] : d.slice());
export const uid = p => p + Math.random().toString(36).slice(2, 8);

// a zone as min/max corners (inclusive)
export function box(z) { return { x0: Math.min(z.a[0], z.b[0]), x1: Math.max(z.a[0], z.b[0]), y0: Math.min(z.a[1], z.b[1]), y1: Math.max(z.a[1], z.b[1]), z0: Math.min(z.a[2], z.b[2]), z1: Math.max(z.a[2], z.b[2]) }; }
export const inZone = (z, x, y, zz) => { const b = box(z); return x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1 && zz >= b.z0 && zz <= b.z1; };
const volume = z => { const b = box(z); return (b.x1 - b.x0 + 1) * (b.y1 - b.y0 + 1) * (b.z1 - b.z0 + 1); };

export function blankMaker() {
  return { v: 1, title: 'My world', intro: '', lock: '', start: null, helper: null, startWorld: null, npcs: [], zones: [], tasks: [],
    rules: { build: true, break: true, fly: true, python: true, blocks: null, code: 'all', protect: [] }, challenge: { on: false, time: 0, par: 0 } };
}

export function cleanMaker(m) {
  if (!m || typeof m !== 'object') return null;
  const out = blankMaker();
  out.title = str(m.title, 60).trim() || 'My world'; out.intro = str(m.intro, 1200); out.lock = /^[0-9a-f]{8}$/.test(String(m.lock || '')) ? m.lock : '';
  if (m.start && typeof m.start === 'object') out.start = { x: num(m.start.x, 0.5, W - 0.5, 32), y: num(m.start.y, 1, H + 4, GROUND + 1), z: num(m.start.z, 0.5, D - 0.5, 40), yaw: num(m.start.yaw, -100, 100, 0) };
  if (m.helper && typeof m.helper === 'object') out.helper = { x: int(m.helper.x, 0, W - 1, 32), y: int(m.helper.y, 1, H - 1, GROUND + 1), z: int(m.helper.z, 0, D - 1, 38), f: int(m.helper.f, 0, 3, 0) };
  if (typeof m.startWorld === 'string' && m.startWorld.length < 3000000) out.startWorld = m.startWorld;
  const seen = new Set();
  for (const n of (Array.isArray(m.npcs) ? m.npcs : []).slice(0, MAX_NPCS)) {
    if (!n || typeof n !== 'object') continue; const nid = id(n.id, 'n'); if (seen.has(nid)) continue; seen.add(nid);
    out.npcs.push({ id: nid, name: str(n.name, 24).trim() || 'Guide', x: int(n.x, 0, W - 1, 32), y: int(n.y, 1, H - 1, GROUND + 1), z: int(n.z, 0, D - 1, 32), f: int(n.f, 0, 3, 2),
      colour: col(n.colour, NPC_COLOURS[0]), lines: lines(n.lines, 12, 240), task: n.task ? str(n.task, 24) : '', done: lines(n.done, 6, 240) });
  }
  for (const z of (Array.isArray(m.zones) ? m.zones : []).slice(0, MAX_ZONES)) {
    if (!z || typeof z !== 'object') continue; const zid = id(z.id, 'z'); if (seen.has(zid)) continue; seen.add(zid);
    const q = { id: zid, name: str(z.name, 30).trim() || 'Area', a: cell(z.a, [30, GROUND + 1, 30]), b: cell(z.b, [33, GROUND + 3, 33]), msg: str(z.msg, 400), show: z.show !== false, colour: col(z.colour, '#ffd166') };
    if (volume(q) > MAX_ZONE) q.b = [Math.min(q.b[0], q.a[0] + 31), Math.min(q.b[1], q.a[1] + 31), Math.min(q.b[2], q.a[2] + 31)];
    out.zones.push(q);
  }
  const zIds = new Set(out.zones.map(z => z.id)), nIds = new Set(out.npcs.map(n => n.id));
  for (const t of (Array.isArray(m.tasks) ? m.tasks : []).slice(0, MAX_TASKS)) {
    if (!t || typeof t !== 'object' || !TASK_TYPES[t.type]) continue; const tid = id(t.id, 't'); if (seen.has(tid)) continue; seen.add(tid);
    const q = { id: tid, type: t.type, text: str(t.text, 160).trim(), hint: str(t.hint, 240) };
    if (TASK_TYPES[t.type].needs.includes('zone')) { if (!zIds.has(t.zone)) continue; q.zone = t.zone; }
    if (t.type === 'talk') { if (!nIds.has(t.npc)) continue; q.npc = t.npc; }
    if (TASK_TYPES[t.type].needs.includes('block')) q.block = t.block === 'ANY' ? 'ANY' : (t.block in BY_NAME && t.block !== 'AIR' ? t.block : 'STONE');
    if (TASK_TYPES[t.type].needs.includes('n')) q.n = int(t.n, 1, 999, t.type === 'tower' ? 5 : 10);
    if (t.type === 'chat') q.word = str(t.word, 20).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'go';
    if (t.type === 'uses') q.feature = FEATURES[t.feature] ? t.feature : 'loop';
    if (!q.text) q.text = taskText(q, out);
    out.tasks.push(q);
  }
  for (const n of out.npcs) if (n.task && !out.tasks.some(t => t.id === n.task)) n.task = '';
  const r = m.rules && typeof m.rules === 'object' ? m.rules : {};
  out.rules = { build: r.build !== false, break: r.break !== false, fly: r.fly !== false, python: r.python !== false,
    blocks: Array.isArray(r.blocks) ? [...new Set(r.blocks.map(Number).filter(v => Number.isInteger(v) && v > 0 && v < NBLOCKS))].slice(0, NBLOCKS) : null,
    code: ['all', 'helper', 'builder', 'none'].includes(r.code) ? r.code : 'all', protect: (Array.isArray(r.protect) ? r.protect : []).filter(z => zIds.has(z)) };
  if (out.rules.blocks && !out.rules.blocks.length) out.rules.blocks = null;
  const c = m.challenge && typeof m.challenge === 'object' ? m.challenge : {};
  out.challenge = { on: !!c.on, time: int(c.time, 0, 3600, 0), par: int(c.par, 0, 500, 0) };
  return out;
}
export function cleanProgress(p, maker) {
  if (!p || typeof p !== 'object' || !maker) return null;
  const ids = new Set(maker.tasks.map(t => t.id));
  const b = p.best && typeof p.best === 'object' ? { time: num(p.best.time, 0, 36000, 0), blocks: int(p.best.blocks, 0, 9999, 0), stars: int(p.best.stars, 0, 3, 0) } : null;
  return { done: (Array.isArray(p.done) ? p.done : []).filter(x => ids.has(x)), best: b };
}

// a sentence for a task when the maker leaves the text empty
export function taskText(t, m) {
  const zn = id => ((m.zones || []).find(z => z.id === id) || {}).name || 'the area', nn = id => ((m.npcs || []).find(n => n.id === id) || {}).name || 'the character';
  const bn = b => (b === 'ANY' ? 'blocks' : ((L.ENUMS.blockAir.find(o => o[1] === b) || [b])[0]));
  switch (t.type) {
    case 'visit': return 'Walk to ' + zn(t.zone);
    case 'helper': return 'Get the helper to ' + zn(t.zone);
    case 'talk': return 'Talk to ' + nn(t.npc);
    case 'count': return 'Put ' + t.n + ' × ' + bn(t.block) + ' in ' + zn(t.zone);
    case 'fill': return 'Fill ' + zn(t.zone) + ' with ' + bn(t.block);
    case 'clear': return 'Clear ' + zn(t.zone);
    case 'tower': return 'Build a tower ' + t.n + ' high in ' + zn(t.zone);
    case 'chat': return 'Type “' + t.word + '” in the chat';
    case 'uses': return 'Use ' + FEATURES[t.feature] + ' in your code';
  }
  return 'A task';
}

// every block in a program (Blockly JSON), so challenges can count them and tasks can look for loops etc.
export function programTypes(state) {
  const out = [];
  const walk = b => { if (!b || typeof b !== 'object') return; out.push(b.type); for (const k in b.inputs || {}) { const i = b.inputs[k]; if (i && i.block) walk(i.block); } if (b.next && b.next.block) walk(b.next.block); };
  for (const b of (state && state.blocks && state.blocks.blocks) || []) walk(b);
  return out;
}
export function programStats(state) { const t = programTypes(state); return { blocks: t.length, types: t }; }
export function stars(blocks, par) { if (!par) return 3; return blocks <= par ? 3 : blocks <= Math.ceil(par * 1.5) ? 2 : 1; }

// checks the tasks. ctx = {world, player:{x,y,z}, helper:{x,y,z}, program (Blockly JSON)}
export function createChecker(maker) {
  const done = new Set(), talked = new Set(), chatted = new Set();
  const zone = idz => maker.zones.find(z => z.id === idz);
  const each = (z, fn) => { const b = box(z); for (let y = b.y0; y <= b.y1; y++) for (let zz = b.z0; zz <= b.z1; zz++) for (let x = b.x0; x <= b.x1; x++) if (fn(x, y, zz) === false) return false; return true; };
  function ok(t, ctx) {
    const z = t.zone && zone(t.zone); const w = ctx.world;
    switch (t.type) {
      case 'visit': { const p = ctx.player; return !!(p && z && (inZone(z, Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)) || inZone(z, Math.floor(p.x), Math.floor(p.y + 1), Math.floor(p.z)))); }
      case 'helper': { const h = ctx.helper; return !!(h && z && inZone(z, h.x, h.y, h.z)); }
      case 'talk': return talked.has(t.npc);
      case 'chat': return chatted.has(t.word);
      case 'uses': return programTypes(ctx.program).some(FEATURE_TYPES[t.feature] || (() => false));
      case 'count': { if (!z) return false; const want = t.block === 'ANY' ? null : BY_NAME[t.block]; let n = 0; each(z, (x, y, q) => { const v = w.get(x, y, q); if (want === null ? isSolid(v) : v === want) n++; }); return n >= t.n; }
      case 'fill': { if (!z) return false; const want = BY_NAME[t.block]; return each(z, (x, y, q) => w.get(x, y, q) === want); }
      case 'clear': { if (!z) return false; return each(z, (x, y, q) => { const v = w.get(x, y, q); return v === 0 || v === 9; }); }
      case 'tower': {
        if (!z) return false; const b = box(z);
        for (let q = b.z0; q <= b.z1; q++) for (let x = b.x0; x <= b.x1; x++) { let run = 0; for (let y = b.y0; y <= Math.min(H - 1, b.y1 + t.n); y++) { run = isSolid(w.get(x, y, q)) ? run + 1 : 0; if (run >= t.n) return true; } }
        return false;
      }
    }
    return false;
  }
  return {
    done, talk(n) { talked.add(n); }, chat(word) { chatted.add(String(word).toLowerCase()); },
    reset() { done.clear(); talked.clear(); chatted.clear(); },
    restore(ids) { for (const i of ids || []) done.add(i); },
    check(ctx) { const fresh = []; for (const t of maker.tasks) if (!done.has(t.id) && ok(t, ctx)) { done.add(t.id); fresh.push(t.id); } return fresh; },
    complete() { return maker.tasks.length > 0 && maker.tasks.every(t => done.has(t.id)); },
    _ok: ok
  };
}

// a maze inside an area (walls 2 high on the area's floor); returns where to start and the goal cell
function mulberry(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function makeMaze(world, zone, opts = {}) {
  const b = box(zone), wall = opts.wall || BY_NAME.LEAVES, hgt = opts.height || 2, R = mulberry(opts.seed || 7);
  const cw = Math.floor((b.x1 - b.x0) / 2), ch = Math.floor((b.z1 - b.z0) / 2);
  if (cw < 2 || ch < 2) throw new Error('Make the area at least 5 × 5 blocks for a maze.');
  const y0 = b.y0, open = new Set();
  const key = (i, j) => i + ',' + j, cx = i => b.x0 + 1 + i * 2, cz = j => b.z0 + 1 + j * 2;
  const stack = [[0, 0]]; const seen = new Set([key(0, 0)]); open.add(cx(0) + ',' + cz(0));
  while (stack.length) {
    const [i, j] = stack[stack.length - 1];
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, c]) => [i + a, j + c]).filter(([a, c]) => a >= 0 && c >= 0 && a < cw && c < ch && !seen.has(key(a, c)));
    if (!nb.length) { stack.pop(); continue; }
    const [a, c] = nb[Math.floor(R() * nb.length)]; seen.add(key(a, c)); stack.push([a, c]);
    open.add(cx(a) + ',' + cz(c)); open.add((cx(i) + cx(a)) / 2 + ',' + (cz(j) + cz(c)) / 2);
  }
  for (let z = b.z0; z <= b.z1; z++) for (let x = b.x0; x <= b.x1; x++) for (let y = y0; y < y0 + hgt; y++) world.set(x, y, z, open.has(x + ',' + z) ? 0 : wall);
  for (let z = b.z0; z <= b.z1; z++) for (let x = b.x0; x <= b.x1; x++) if (world.get(x, y0 - 1, z) === 0) world.set(x, y0 - 1, z, BY_NAME.GRASS);
  return { start: [cx(0), y0, cz(0)], goal: [cx(cw - 1), y0, cz(ch - 1)], wall };
}

// ── ready-made worlds ────────────────────────────────────────────────────────
const P = s => L.fromPython(s).state;
function project(world, maker, py, extra = {}) {
  const m = cleanMaker(maker); m.startWorld = world.save();
  return Object.assign({ v: 1, mode: 'blocks', blocks: P(py == null ? 'player.say("Let’s go!")\n' : py), world: m.startWorld, player: { x: m.start.x, y: m.start.y, z: m.start.z, yaw: m.start.yaw, pitch: -0.2, fly: false },
    helper: m.helper, time: 'DAY', hot: null, maker: m }, extra);
}
export const EXAMPLES = [
  { id: 'first-steps', title: 'Helper’s first steps', kind: 'Coding · Years 3–4', text: 'Code the robot helper along a path to the flag, then use a loop to do it in fewer blocks.' },
  { id: 'bridge', title: 'Build a bridge', kind: 'Building · Years 3–6', text: 'A character asks you to build a bridge of wood planks over the river, by hand or with code.' },
  { id: 'maze', title: 'Maze run challenge', kind: 'Coding challenge · Years 5–6', text: 'A timed challenge: code the helper through the hedge maze to the gold. Fewer blocks = more stars.' },
  { id: 'garden', title: 'Design a garden', kind: 'Building · Years 1–4', text: 'Plant at least 8 coloured flowers in the garden and build a tower 5 blocks tall.' },
  { id: 'arena', title: 'Build competition arena', kind: 'Competition map', text: 'A flat plot with a marked building area — ready for a build competition or your own lesson.' }
];
export function exampleProject(name) {
  const w = createWorld(), g = GROUND, B = BY_NAME;
  if (name === 'first-steps') {
    w.reset('flat');
    w.fill(B.SAND, [26, g, 36], [26, g, 26], 'SOLID'); w.fill(B.SAND, [26, g, 26], [33, g, 26], 'SOLID'); // an L-shaped path
    w.set(33, g + 1, 25, B.GOLD); for (let y = 1; y <= 4; y++) w.set(34, g + y, 25, B.LOG); w.fill(B.RED, [35, g + 3, 25], [36, g + 4, 25], 'SOLID'); // a flag
    for (const [x, z] of [[22, 30], [30, 33], [37, 29], [21, 22]]) { for (let y = 1; y <= 3; y++) w.set(x, g + y, z, B.LOG); w.ball(B.LEAVES, 2, [x, g + 4, z], 'SOLID'); }
    return project(w, {
      title: 'Helper’s first steps', intro: 'Your robot helper needs to get to the gold block at the end of the sandy path.\n\nUse the Helper blocks: move forward, turn right… then press Run.',
      start: { x: 29.5, y: g + 1, z: 42.5, yaw: 0.3 }, helper: { x: 26, y: g + 1, z: 36, f: 0 },
      npcs: [{ id: 'npcRo', name: 'Ro', x: 23, y: g + 1, z: 37, f: 1, colour: '#3b8eea', task: 'tGoal', lines: ['Hi! I’m Ro. My helper wants to reach the gold block.', 'It goes forward 10 steps up the path, turns right, then forward 7.', 'Try it with blocks, then press Run!'], done: ['It made it! Can you do it with a loop now?'] }],
      zones: [{ id: 'zGoal', name: 'the gold', a: [33, g + 1, 26], b: [33, g + 2, 26], msg: '', show: true, colour: '#ffd166' }],
      tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcRo' }, { id: 'tGoal', type: 'helper', zone: 'zGoal', text: 'Get the helper to the gold' }, { id: 'tLoop', type: 'uses', feature: 'loop', text: 'Use a loop to make your code shorter' }],
      rules: { build: false, break: false, fly: true, python: true, code: 'helper' }
    }, '# Code the helper to the gold block\nhelper.move(FORWARD, 2)\n');
  }
  if (name === 'bridge') {
    w.reset('flat');
    for (let x = 0; x < W; x++) for (let z = 28; z <= 33; z++) { w.set(x, g, z, B.WATER); w.set(x, g - 1, z, B.WATER); if (z === 28 || z === 33) w.set(x, g, z, B.SAND); }
    for (const [x, z] of [[14, 20], [46, 18], [20, 44], [44, 42]]) { for (let y = 1; y <= 4; y++) w.set(x, g + y, z, B.LOG); w.ball(B.LEAVES, 2, [x, g + 5, z], 'SOLID'); }
    return project(w, {
      title: 'Build a bridge', intro: 'The village is cut off by the river! Talk to Bea, then build a bridge of wood planks across the river.\n\nYou can build by hand (pick wood planks and click) or use the builder blocks.',
      start: { x: 33.5, y: g + 1, z: 42.5, yaw: 0.15 }, helper: { x: 36, y: g + 1, z: 38, f: 0 },
      npcs: [{ id: 'npcBea', name: 'Bea', x: 29, y: g + 1, z: 36, f: 0, colour: '#2bb673', task: 'tBridge', lines: ['Oh no, the river is too wide to jump!', 'Please build a bridge of WOOD PLANKS across, right where the posts are.', 'It needs to go all the way from one bank to the other.'], done: ['A bridge! Now everyone can cross. Thank you!'] }],
      zones: [{ id: 'zBridge', name: 'the bridge spot', a: [31, g, 29], b: [33, g, 32], msg: 'Build your bridge here, across the water.', show: true, colour: '#ffd166' },
        { id: 'zFar', name: 'the far bank', a: [26, g + 1, 22], b: [38, g + 3, 27], msg: 'You crossed the river!', show: false, colour: '#7bd88f' }],
      tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcBea' }, { id: 'tBridge', type: 'fill', zone: 'zBridge', block: 'PLANKS', text: 'Fill the bridge spot with wood planks' }, { id: 'tCross', type: 'visit', zone: 'zFar', text: 'Walk across to the far bank' }],
      rules: { build: true, break: true, fly: false, python: true, blocks: [B.PLANKS, B.LOG, B.STONE, B.COBBLE, B.GLASS, B.LAMP], code: 'all' }
    }, null);
  }
  if (name === 'maze') {
    w.reset('flat');
    const zone = { a: [22, g + 1, 18], b: [42, g + 2, 38] };
    const mz = makeMaze(w, zone, { seed: 11 });
    w.set(mz.goal[0], g, mz.goal[2], B.GOLD);
    return project(w, {
      title: 'Maze run challenge', intro: 'A coding challenge! Press START, then code the robot helper through the hedge maze to the gold square.\n\nThe clock is ticking — and fewer blocks earn more stars.',
      start: { x: 32.5, y: g + 6, z: 44.5, yaw: 0 }, helper: { x: mz.start[0], y: g + 1, z: mz.start[2], f: 2 },
      zones: [{ id: 'zMaze', name: 'the maze', a: zone.a, b: zone.b, msg: '', show: false }, { id: 'zGold', name: 'the gold square', a: [mz.goal[0], g + 1, mz.goal[2]], b: [mz.goal[0], g + 1, mz.goal[2]], msg: '', show: true, colour: '#ffd166' }],
      tasks: [{ id: 'tGold', type: 'helper', zone: 'zGold', text: 'Get the helper to the gold square' }],
      rules: { build: false, break: false, fly: true, python: true, code: 'helper', protect: ['zMaze'] }, challenge: { on: true, time: 600, par: 14 }
    }, '# Get the helper through the maze to the gold\n');
  }
  if (name === 'garden') {
    w.reset('flat');
    w.fill(B.DIRT, [26, g, 26], [37, g, 35], 'SOLID'); w.fill(B.PLANKS, [25, g + 1, 25], [38, g + 1, 36], 'OUTLINE'); w.fill(0, [25, g + 1, 26], [38, g + 1, 35], 'SOLID'); w.fill(0, [26, g + 1, 25], [37, g + 1, 36], 'SOLID');
    for (let x = 25; x <= 38; x += 13) for (let z = 25; z <= 36; z += 11) w.set(x, g + 1, z, B.PLANKS);
    return project(w, {
      title: 'Design a garden', intro: 'Welcome to the garden! Plant at least 8 flowers (any coloured block) in the brown soil, and build a tower 5 blocks tall in the garden for the birds.',
      start: { x: 33.5, y: g + 1, z: 44.5, yaw: 0.2 }, helper: { x: 36, y: g + 1, z: 41, f: 0 },
      npcs: [{ id: 'npcPip', name: 'Pip', x: 28, y: g + 1, z: 38, f: 0, colour: '#ec6fa8', task: '', lines: ['Hello gardener! The soil is ready.', 'Plant colourful flowers — red, yellow, pink, purple…', 'Then build a bird tower 5 blocks high.'], done: [] }],
      zones: [{ id: 'zGarden', name: 'the garden', a: [26, g + 1, 26], b: [37, g + 8, 35], msg: 'This is the garden. Plant your flowers here!', show: true, colour: '#7bd88f' }],
      tasks: [{ id: 'tTalk', type: 'talk', npc: 'npcPip' }, { id: 'tFlowers', type: 'count', zone: 'zGarden', block: 'ANY', n: 8, text: 'Plant 8 flowers in the garden' }, { id: 'tTower', type: 'tower', zone: 'zGarden', n: 5, text: 'Build a bird tower 5 high' }],
      rules: { build: true, break: true, fly: false, python: true, blocks: [B.RED, B.ORANGE, B.YELLOW, B.PINK, B.PURPLE, B.WHITE, B.BLUE, B.LEAVES, B.PLANKS, B.LOG], code: 'all' }
    }, null);
  }
  // arena: a flat plot with a gold-edged building area
  w.reset('flat');
  w.fill(B.STONE, [20, g, 20], [43, g, 43], 'SOLID'); w.fill(B.GOLD, [19, g, 19], [44, g, 44], 'OUTLINE'); w.fill(B.STONE, [20, g, 20], [43, g, 43], 'SOLID');
  return project(w, {
    title: 'Build arena', intro: 'Build inside the gold square. Good luck!', start: { x: 31.5, y: g + 1, z: 48.5, yaw: 0 }, helper: { x: 34, y: g + 1, z: 46, f: 0 },
    zones: [{ id: 'zPlot', name: 'the building plot', a: [20, g + 1, 20], b: [43, g + 24, 43], msg: '', show: true, colour: '#ffd166' }],
    tasks: [], rules: { build: true, break: true, fly: true, python: true, code: 'all' }
  }, null);
}
