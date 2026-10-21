// Robot Librarian — the Robot Lab's lesson unit (lessons/units/robot.js, 18 lessons in 3 blocks).
// Every lesson is complete; every starter opens in the real app with its Lesson card; and for every lesson that isn't a
// project, the lesson's intended answer (lessons/builds/robot/library.mjs ANSWERS) does what the lesson promises while the
// bare starter does not — proven by running the blocks with the Robot Lab's own runner (robot/robot-runner.js) on a headless
// Blockly workspace in Node, with a stand-in robot that records every motor move, face, light, blink and word, plus scripted
// answers, taps, keys and mouse moves (PLAY). Project lessons: the starter opens, an example meets every success criterion
// and the bare starter doesn't. In the app: My blocks (used by lessons 16–18) is in the toolbox and runs.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, require, serve, browser, openApp, ok, done } from './lib.mjs';

const imp = p => import(pathToFileURL(join(ROOT, p)).href);
const U = await imp('lessons/units/robot.js');
const L = await imp('lessons/builds/robot/library.mjs');
const RB = await imp('robot/robot-blocks.js');
const { createRunner } = await imp('robot/robot-runner.js');
const { DEFAULTS } = await imp('robot/robot-model.js');
const { LESSONS: ALL } = await imp('lessons/lessons.js');
const Blockly = require('blockly');
RB.defineBlocks(Blockly);

const ADOPTED = { 'robot-storyteller': (await imp('lessons/builds/robot-storyteller.mjs')).makeArgs().robot, 'robot-quiz': (await imp('lessons/builds/robot-quiz.mjs')).makeArgs().robot };
const starterOf = id => L.STARTERS[id] || ADOPTED[id];

// ───────── the unit's data ─────────
const NAME = 'Robot Librarian';
const ONLY_CODE = process.env.ROBOT_CODE === '1'; // just the Node checks (for working on the unit)
const UNIT = U.LESSONS.map(x => ALL.find(l => l.id === (x.adopt || x.id)));
if (!ONLY_CODE) {
ok(UNIT.length === 18 && UNIT.every(Boolean), `18 lessons in the unit, all in the library (${UNIT.filter(Boolean).length})`);
ok(new Set(ALL.map(l => l.id)).size === ALL.length, 'every lesson id in the library is different');
ok(['robot-storyteller', 'robot-quiz'].every(id => U.LESSONS.some(x => x.adopt === id)), 'the Robot Lab’s two earlier lessons are folded into the unit');
const YEARS = ['Years 3–4', 'Years 4–5', 'Years 5–6'];
const words = /Scratch|ScratchJr|Minecraft|Tinkercad|Autodesk|intelino|Ohbot|Bamzooki|BBC|Flock|Flip Computing|Code\.org|Barefoot/;
UNIT.forEach((l, i) => {
  if (!l) return;
  l = Object.assign({ plan: [], steps: [], success: [], words: [], assess: [], need: [], curriculum: [], slides: [] }, l);
  const b = Math.floor(i / 6) + 1, m = i + 1, mins = l.plan.reduce((a, p) => a + p.min, 0), slides = l.slides || [];
  ok(l.unit === `${NAME} · Block ${b} · Lesson ${m}` && l.years === YEARS[b - 1] && l.ks === 'ks2' && l.type === 'robot' && l.minutes === 60,
    `${l.id}: Block ${b} · Lesson ${m}, ${l.years}, ${l.ks}, 60 minutes`);
  ok(mins === 60 && l.steps.length >= 4 && l.steps.length <= 9 && l.success.length >= 2 && l.words.length >= 2 && l.assess.length >= 2 && l.support && l.stretch && l.objective && l.summary && l.need.length && l.title,
    `${l.id}: complete (plan ${mins} min, ${l.steps.length} pupil steps)`);
  ok(l.curriculum.length && l.curriculum.every(k => ['design', 'ssr', 'reason', 'data', 'safe'].includes(k)), `${l.id}: Key Stage 2 curriculum keys (${l.curriculum})`);
  ok(slides.length >= 4 && slides.length <= 7 && slides.some(s => s.use === 'steps') && slides.every(s => s.use || (s.t && s.notes)), `${l.id}: ${slides.length} slides with notes and a Your turn slide`);
  ok(!words.test(JSON.stringify(l)), `${l.id}: no other product’s names`);
  ok(existsSync(join(ROOT, 'lessons', 'starters', l.id + '.json')) && existsSync(join(ROOT, 'lessons', 'pics', l.id + '.jpg')), `${l.id}: starter + picture`);
  if (/^library-/.test(l.id)) ok(L.STARTERS[l.id] && L.ANSWERS[l.id] && L.PLAY[l.id] && existsSync(join(ROOT, 'lessons', 'builds', l.id + '.mjs')), `${l.id}: starter program, answer, play script and build file`);
});
ok(UNIT.filter((l, i) => i % 6 === 5).every(l => l && /^Project/.test(l.title)), 'lesson 6 of each block is a design-and-make project');
}
// ───────── a stand-in robot + the real runner, on a headless Blockly workspace ─────────
const FACE_NAMES = Object.keys(RB.FACES);
function play(project, sc = {}) {
  const log = [], clock = { t: 0 };
  const cur = { ...DEFAULTS }, tgt = { ...DEFAULTS };
  const clamp = v => Math.max(0, Math.min(10, isFinite(v) ? +v : 0));
  const push = o => log.push(Object.assign({ t: Math.round(clock.t * 100) / 100 }, o));
  const view = {
    setTarget(m, v) { tgt[m] = clamp(v); push({ k: 'target', m, v: tgt[m] }); },
    jump(m, v) { cur[m] = tgt[m] = clamp(v); },
    at: m => cur[m], target: m => tgt[m], arrived: m => Math.abs(cur[m] - tgt[m]) < 0.01, setSpeed() {},
    setLight(p, c) { push({ k: 'light', p, c }); }, lightsOff(p) { push({ k: 'light', p, c: null }); },
    setBody() {}, setAccent() {}, setTalk() {}, blink() { push({ k: 'blink' }); },
    setBrowTilt(tilt) { const f = FACE_NAMES.find(n => RB.FACES[n].tilt === tilt && Object.entries(RB.FACES[n].m).every(([m, v]) => tgt[m] === v)); push({ k: 'face', face: f || '?' }); },
    reset() { Object.assign(cur, DEFAULTS); Object.assign(tgt, DEFAULTS); },
    step(dt) { for (const m in cur) { const d = tgt[m] - cur[m], s = 15 * dt; cur[m] = Math.abs(d) <= s ? tgt[m] : cur[m] + Math.sign(d) * s; } }
  };
  const answers = (sc.answers || []).slice(), held = new Set(), mouse = { x: 5, y: 5 };
  let errors = 0;
  const runner = createRunner(view, {
    bubble: text => push(text ? { k: 'say', text } : { k: 'hush' }),
    ask: (q, cb) => { push({ k: 'ask', q }); const a = answers.length ? answers.shift() : ''; push({ k: 'answer', a }); cb(a); },
    keyDown: k => held.has(k), mouse: () => mouse, onError: e => { errors++; push({ k: 'error', e: String(e && e.message || e) }); }
  });
  const ws = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(JSON.parse(JSON.stringify(project.blocks)), ws);
  runner.start(ws);
  const evs = (sc.events || []).map(e => ({ ...e })), dt = 1 / 30, holds = [];
  for (let i = 0; i * dt < (sc.secs || 10); i++) {
    clock.t = i * dt;
    for (const e of evs) if (!e.done && e.at <= clock.t) {
      e.done = true;
      if (e.tap) { push({ k: 'tap', part: e.tap }); runner.tap(e.tap); }
      if (e.key) { push({ k: 'key', key: e.key }); runner.key(e.key); }
      if (e.hold) { push({ k: 'key', key: e.hold }); held.add(e.hold); runner.key(e.hold); holds.push([e.hold, clock.t + 0.5]); }
      if (e.mouse) Object.assign(mouse, e.mouse);
    }
    for (const h of holds) if (h[1] <= clock.t) held.delete(h[0]);
    runner.tick(dt); view.step(dt);
    push({ k: 'pose', HeadTurn: cur.HeadTurn });
  }
  const types = ws.getAllBlocks(false).map(b => b.type);
  const tops = ws.getTopBlocks(false);
  const insideDef = b => { for (let p = b; p; p = p.getSurroundParent ? (p.getSurroundParent() || p.getPreviousBlock() || p.getParent()) : null) if (p.type === 'procedures_defnoreturn') return true; return false; };
  const r = { log, types, errors, tops, ws, count: ws.getAllBlocks(false).length, movesOutsideDefs: ws.getAllBlocks(false).filter(b => b.type === 'rb_move' && !insideDef(b)).length,
    params: tops.filter(t => t.type === 'procedures_defnoreturn').map(t => t.getVarModels().length) };
  runner.stop(true); ws.dispose();
  return r;
}

// ───────── reading what happened ─────────
const of = (r, k) => r.log.filter(e => e.k === k);
const says = r => of(r, 'say');
const sayAt = (r, re, from = 0) => { const s = says(r).find(e => re.test(e.text) && e.t >= from); return s ? s.t : null; };
const LOOK = { HeadTurn: { 1.5: 'left', 8.5: 'right', 5: 'ahead' }, HeadNod: { 2: 'down', 8.5: 'up' } };
const looks = r => of(r, 'target').filter(e => LOOK[e.m] && LOOK[e.m][e.v]).map(e => ({ t: e.t, dir: LOOK[e.m][e.v] }));
const lookIn = (r, dir, a, b) => looks(r).some(l => l.dir === dir && l.t >= a && l.t <= b);
const faceAt = (r, face, from = 0) => { const f = of(r, 'face').find(e => e.face === face && e.t >= from); return f ? f.t : null; };
const asks = r => of(r, 'ask');
// a nod = head nod up to 8 or more, then down to 2 or less; a tilt = to 2 or less, then 8 or more; a shake = turn to 2.5 or less, then 7.5 or more
function cycles(r, m, first, second, a = 0, b = 1e9) {
  let n = 0, armed = false;
  for (const e of of(r, 'target')) { if (e.m !== m || e.t < a || e.t > b) continue; if (first(e.v)) armed = true; else if (armed && second(e.v)) { n++; armed = false; } }
  return n;
}
const nods = (r, a, b) => cycles(r, 'HeadNod', v => v >= 8, v => v <= 2, a, b);
const tilts = r => cycles(r, 'HeadTilt', v => v <= 2, v => v >= 8);
const gestures = r => of(r, 'target').filter(e => (e.m === 'HeadNod' && e.v >= 8) || (e.m === 'HeadTurn' && e.v <= 2.5)).map(e => ({ t: e.t, g: e.m === 'HeadNod' ? 'nod' : 'shake' }));
const turnAt = (r, t) => { const p = of(r, 'pose').filter(e => e.t <= t).pop(); return p ? p.HeadTurn : 5; };
const lightsBetween = (r, a, b) => of(r, 'light').filter(e => e.t >= a && e.t <= b && e.c).length;
const talking = r => { const out = []; let on = null; for (const e of r.log) { if (e.k === 'say' && on === null) on = e.t; if (e.k === 'hush' && on !== null) { out.push([on, e.t]); on = null; } } return out; };
const has = (r, t) => r.types.includes(t);
const reacted = (r, a) => r.log.some(e => e.t > a && e.t <= a + 4 && ['say', 'target', 'face', 'light'].includes(e.k));

// what each lesson promises — [the check, what it means]; every scenario in PLAY[id] must pass
const PROMISE = {
  'library-1-welcome': [r => { const w = sayAt(r, /welcome/i); const h = faceAt(r, 'happy'); return of(r, 'light').some(e => /eyes|all/.test(e.p) && e.c) && h !== null && w !== null && h <= w && lookIn(r, 'left', w, 99) && lookIn(r, 'right', w, 99); },
    'Sparky lights its eyes, smiles, says a welcome and then looks left and right'],
  'library-2-tour': [r => {
    const ev = [...looks(r).map(l => ({ t: l.t, look: l.dir })), ...says(r).map(s => ({ t: s.t, say: s.text }))].sort((a, b) => a.t - b.t);
    const part = dir => ev.some((e, i) => e.look === dir && ev.slice(i + 1).find(x => x.look || x.say)?.say);
    return ['left', 'right', 'down', 'ahead'].every(part) && says(r).length >= 5;
  }, 'the tour has every part: look left, right, down and ahead, each followed by something said (5 things said)'],
  'robot-storyteller': [r => { const h = faceAt(r, 'happy'), g = sayAt(r, /good morning/i); return h !== null && g !== null && h < g; }, 'Sparky smiles BEFORE it says Good morning'],
  'library-4-stretch': [r => nods(r) === 5 && tilts(r) === 3 && r.types.filter(t => t === 'controls_repeat_ext').length >= 2, 'exactly 5 nods and 3 tilts, made with repeat blocks'],
  'library-5-buttons': [r => says(r).some(s => s.t >= 7 && s.t <= 11) && lookIn(r, 'left', 13, 16) && lookIn(r, 'right', 19, 22), 'tapping the head makes Sparky speak, B makes it look left and C look right'],
  'library-6-project': [r => new Set(says(r).map(s => s.text)).size >= 3 && has(r, 'controls_repeat_ext') && r.tops.filter(t => ['rb_when_tapped', 'rb_when_key', 'rb_when_message'].includes(t.type)).length >= 2
    && reacted(r, 14) && reacted(r, 20), 'success criteria: 3 things said, a repeat, and two events that make Sparky react'],
  'library-7-signin': [r => { const a = asks(r); return a.length >= 2 && sayAt(r, /Amara/, a[0].t) !== null && sayAt(r, /The Owl Who Read Too Much/, a[1].t) !== null; },
    'Sparky asks two questions and uses each answer in what it says next'],
  'library-8-shelves': [r => { const a = asks(r)[0], ans = of(r, 'answer')[0]; if (!a) return false; const left = lookIn(r, 'left', a.t, 99), right = lookIn(r, 'right', a.t, 99);
    return /^stories$/i.test(ans.a) ? left && !right : right && !left; }, 'stories → Sparky looks left to the story shelves; facts → it looks right'],
  'library-9-door': [r => turnAt(r, 5.9) <= 2.5 && turnAt(r, 8.9) >= 7.5 && Math.abs(turnAt(r, 11.9) - 5) <= 1, 'visitor on the left → head turns left; on the right → right; in the middle → ahead'],
  'library-10-closing': [r => { const c = sayAt(r, /clos/i), g = sayAt(r, /goodbye/i); return c !== null && c >= 8 && c <= 12 && of(r, 'blink').filter(e => e.t < c).length >= 3
    && g !== null && g >= 16 && faceAt(r, 'sleepy', 16) !== null; }, 'blinks until the timer passes 8 s, says closing, then waits for space before Goodbye'],
  'library-11-returns': [r => { const a = asks(r); if (a.length !== 3) return false; const dirs = a.map((q, i) => looks(r).find(l => l.t >= q.t && (!a[i + 1] || l.t < a[i + 1].t) && /left|right/.test(l.dir))?.dir);
    const all = says(r).filter(s => /all done/i.test(s.text)); return dirs.join() === 'left,right,left' && all.length === 1 && all[0].t > a[2].t; },
    'three books, story → left and fact → right, and All done said once at the end'],
  'library-12-project': [r => { const a = asks(r), ans = of(r, 'answer'); const at = w => a[ans.findIndex(x => x.a === w)]?.t;
    return a.length === 5 && lookIn(r, 'left', at('books'), at('computers')) && lookIn(r, 'right', at('computers'), at('toilets')) && sayAt(r, /sorry/i, at('juggling')) !== null
      && sayAt(r, /goodbye/i, at('bye')) !== null && has(r, 'controls_whileUntil'); }, 'success criteria: asks until bye, a different answer for each choice, a sorry for anything else, then goodbye'],
  'robot-quiz': [r => { const ans = of(r, 'answer').map(x => x.a).join(); return sayAt(r, ans === '7,8' ? /your score is 2/i : /your score is 1/i) !== null; }, 'the final score counts only the right answers (2, then 1)'],
  'library-14-survey': [r => { const ans = of(r, 'answer').map(x => x.a.toLowerCase()); const st = ans.filter(a => a === 'stories').length, fa = 5 - st;
    return sayAt(r, new RegExp('stories: ' + st, 'i')) !== null && sayAt(r, new RegExp('facts: ' + fa, 'i')) !== null && sayAt(r, st > fa ? /stories win/i : /facts win/i) !== null; },
    'the survey counts both answers in two variables and says the totals and the winner'],
  'library-15-lights': [r => { const t = talking(r)[0]; return !!t && lightsBetween(r, t[0], t[1]) >= 3 && has(r, 'rb_send') && has(r, 'rb_when_message') && lightsBetween(r, 11, 14) >= 3; },
    'the lights flash WHILE Sparky talks (a message starts them), and tapping sends the message again'],
  'library-16-myblocks': [r => gestures(r).map(g => g.g).join() === 'nod,shake,nod,nod' && r.params.length >= 2 && r.movesOutsideDefs === 0,
    'four questions answered nod, shake, nod, nod — using two My blocks instead of copies'],
  'library-17-inputs': [r => { const s = says(r).filter(x => /star/.test(x.text)); if (s.length !== 3) return false; const ends = [s[1].t, s[2].t, 99];
    return s.map((x, i) => nods(r, x.t, ends[i])).join() === '3,2,1' && r.params.some(n => n === 1); }, 'one My block with an input gives 3, 2 and 1 cheers'],
  'library-18-project': [r => has(r, 'variables_get') && has(r, 'rb_send') && has(r, 'rb_when_message') && has(r, 'procedures_callnoreturn') && r.tops.some(t => t.type === 'procedures_defnoreturn')
    && has(r, 'rb_ask') && has(r, 'controls_if') && sayAt(r, /Hello, Amara/) !== null && sayAt(r, /correct/i) !== null && lightsBetween(r, 0, 99) >= 4 && sayAt(r, /scored 1/i) !== null
    && asks(r).length === 5, 'success criteria: a variable, a message, a My block, if, input — and it runs from hello to goodbye']
};
const IDS = ONLY_CODE ? Object.keys(PROMISE) : UNIT.filter(Boolean).map(l => l.id);
for (const id of IDS) ok(!!PROMISE[id], `${id}: has a promise to test`);

// ───────── the answers do it; the starters don't ─────────
for (const id of IDS) {
  const l = { id };
  if (!PROMISE[l.id]) continue;
  const [check, what] = PROMISE[l.id], scs = L.PLAY[l.id] || [{ secs: 12 }];
  const ans = scs.map(sc => play(L.ANSWERS[l.id], sc)), st = scs.map(sc => play(starterOf(l.id), sc));
  ok(ans.every(r => r.errors === 0 && check(r)), `${l.id}: the answer works — ${what}`);
  ok(!st.every(r => check(r)), `${l.id}: the bare starter doesn’t do it yet`);
  ok(st.every(r => r.errors === 0), `${l.id}: the starter runs without errors`);
}
// a few extra checks on the lessons' finer points
{
  const r = play(L.STARTERS['library-11-returns'], L.PLAY['library-11-returns'][0]);
  ok(asks(r).length === 2 && says(r).filter(s => /all done/i.test(s.text)).length === 2, 'library-11: the returns starter really has its three bugs (2 books, All done every time)');
  const lazy = JSON.parse(JSON.stringify(L.STARTERS['library-4-stretch']));
  ok(nods(play(lazy, { secs: 30 })) === 1, 'library-4: the stretch starter nods only once');
  const n = play(L.ANSWERS['library-10-closing'], { secs: 22 });
  ok(sayAt(n, /goodbye/i) === null, 'library-10: without pressing space Sparky waits and never says Goodbye');
  const rec = JSON.parse(JSON.stringify(L.ANSWERS['library-17-inputs'])); // a My block that uses itself is stopped, not frozen
  rec.blocks.blocks.blocks[0].inputs.STACK.block = { type: 'procedures_callnoreturn', extraState: { name: 'cheer', params: ['stars'] }, inputs: { ARG0: { shadow: { type: 'math_number', fields: { NUM: 1 } } } } };
  const rr = play(rec, { secs: 15 });
  ok(rr.errors === 1 && /keeps using itself/.test(of(rr, 'error')[0]?.e || ''), 'My blocks: a block that keeps using itself stops with a friendly message');
}

// ───────── in the real app ─────────
if (ONLY_CODE) done();
const site = await serve();
const b = await browser();
const errors = [];
try {
  const { page } = await openApp(b, site.url, { errors });
  for (const l of UNIT) {
    if (!l) continue;
    await page.evaluate(id => { clearDirty(); lessonOpenStarter(id); }, l.id); // not returned: a big starter’s promise can be collected
    await page.waitForFunction(id => lessonActive && lessonActive.id === id, l.id, { timeout: 60000 });
    await page.waitForFunction(() => projectType === 'robot' && robotApp && robotApp._ws() && robotApp._view(), null, { timeout: 60000 });
    const want = starterOf(l.id).blocks.blocks.blocks.length;
    await page.waitForFunction(n => robotApp._ws().getTopBlocks(false).length === n, want, { timeout: 20000 }).catch(() => {});
    const st = await page.evaluate(() => ({ card: !document.getElementById('lesson-guide').classList.contains('hide'), tops: robotApp._ws().getTopBlocks(false).length,
      title: document.getElementById('lesson-guide').textContent }));
    ok(st.card && st.tops === want && st.title.includes(l.title), `${l.id}: the starter opens in the Robot Lab with its Lesson card (${st.tops} scripts)`);
  }
  // My blocks: in the toolbox, and an answer that uses them runs in the real app
  const cats = await page.evaluate(() => robotApp._ws().getToolbox().getToolboxItems().map(c => c.getName && c.getName()));
  ok(cats.includes('My blocks'), 'the Robot Lab toolbox has a My blocks category');
  const fly = await page.evaluate(() => { const tb = robotApp._ws().getToolbox(); const c = tb.getToolboxItems().find(x => x.getName && x.getName() === 'My blocks'); tb.setSelectedItem(c);
    const f = tb.getFlyout(); const types = f.getWorkspace().getTopBlocks(false).map(x => x.type); tb.clearSelection(); return types; });
  ok(fly.includes('procedures_defnoreturn') && !fly.includes('procedures_defreturn'), 'My blocks offers “to do something” (and no return blocks)');
  await page.evaluate(p => robotApp.setProject(p), L.ANSWERS['library-17-inputs']);
  await page.evaluate(() => { window.__rbSaid = []; window.__rbNods = 0; let up = false; const v = robotApp._view();
    window.__rbIv = setInterval(() => { const t = document.getElementById('rbBubble').textContent; if (t && window.__rbSaid[window.__rbSaid.length - 1] !== t) window.__rbSaid.push(t);
      const n = v.state().tgt.HeadNod; if (n >= 8) up = true; else if (up && n <= 2) { up = false; window.__rbNods++; } }, 20); robotApp.run(); });
  await page.waitForFunction(() => window.__rbSaid.some(s => /Fish Facts/.test(s)) && !robotApp._runner().busy(), null, { timeout: 120000 });
  const app = await page.evaluate(() => { clearInterval(window.__rbIv); return { nods: window.__rbNods, said: window.__rbSaid }; });
  ok(app.nods === 6 && app.said.length >= 4, `the Book Awards answer (a My block with an input) runs in the app: ${app.nods} nods`);
  ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
