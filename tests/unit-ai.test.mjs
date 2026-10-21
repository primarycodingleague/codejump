// Wildwood Spotters — the AI Lab's lesson unit (lessons/units/ai.js, 18 lessons in 3 blocks).
// 1. The unit's data: every lesson complete, in order, with slides, a starter and a picture, and no other product's names.
// 2. In Node, with the real brain (ai/ai-model.js), runner (ai/ai-runner.js) and goals checker (ai/ai-goals.js): every
//    lesson's answer ticks every goal while the bare starter does not (project lessons: an example meets every goal).
// 3. In the real app: every starter opens with its Lesson card (and its goals checklist), and the checklist ticks in the
//    app too — by teaching, training and testing (Whose footprints?), by running the answer (Hoot says what it sees), and
//    for a words AI (Is Hoot fair?).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, require, serve, browser, openApp, ok, done, sleep } from './lib.mjs';

const imp = p => import(pathToFileURL(join(ROOT, p)).href);
const U = await imp('lessons/units/ai.js');
const { LESSONS: ALL } = await imp('lessons/lessons.js');
const W = await imp('lessons/builds/ai/wildwood.mjs');
const D = await imp('lessons/builds/ai/draw.mjs');
const M = await imp('ai/ai-model.js');
const AB = await imp('ai/ai-blocks.js');
const AG = await imp('ai/ai-goals.js');
const { createRunner } = await imp('ai/ai-runner.js');
const ONLY_NODE = process.env.AI_NODE === '1'; // just the Node checks (for working on the unit)

// ───────── 1. the unit's data ─────────
const NAME = 'Wildwood Spotters';
const UNIT = U.LESSONS.map(x => ALL.find(l => l.id === (x.adopt || x.id)));
ok(UNIT.length === 18 && UNIT.every(Boolean), `18 lessons in the unit, all in the library (${UNIT.filter(Boolean).length})`);
ok(new Set(ALL.map(l => l.id)).size === ALL.length, 'every lesson id in the library is different');
ok(['ai-happy-sad', 'teach-the-computer'].every(id => U.LESSONS.some(x => x.adopt === id)), 'the AI Lab’s two earlier lessons are folded into the unit');
ok(W.IDS.every(id => U.LESSONS.some(x => x.id === id)) && U.LESSONS.filter(x => x.id).every(x => W.UNIT[x.id]), 'every new lesson has a starter, an answer and goals (lessons/builds/ai/wildwood.mjs)');
{
  const YEARS = ['Years 3–4', 'Years 4–5', 'Years 5–6'];
  const other = /Scratch|Minecraft|Tinkercad|Autodesk|intelino|Ohbot|Bamzooki|\bBBC\b|Flock|Flip Computing|Code\.org|Barefoot|Teachable|Quick, ?Draw/i;
  UNIT.forEach((l, i) => {
    if (!l) return;
    l = Object.assign({ plan: [], steps: [], success: [], words: [], assess: [], need: [], curriculum: [], slides: [] }, l);
    const b = Math.floor(i / 6) + 1, m = i + 1, mins = l.plan.reduce((a, p) => a + p.min, 0), slides = l.slides || [];
    ok(l.unit === `${NAME} · Block ${b} · Lesson ${m}` && l.years === YEARS[b - 1] && l.ks === 'ks2' && l.type === 'ai' && l.minutes === 60,
      `${l.id}: Block ${b} · Lesson ${m}, ${l.years}, ${l.ks}, 60 minutes`);
    ok(mins === 60 && l.steps.length >= 4 && l.steps.length <= 9 && l.success.length >= 2 && l.words.length >= 2 && l.assess.length >= 2 && l.support && l.stretch && l.objective && l.summary && l.need.length && l.title && l.tool,
      `${l.id}: complete (plan ${mins} min, ${l.steps.length} pupil steps)`);
    ok(l.curriculum.length && l.curriculum.every(k => ['design', 'ssr', 'reason', 'data', 'safe'].includes(k)), `${l.id}: Key Stage 2 curriculum keys (${l.curriculum})`);
    ok(slides.length >= 4 && slides.length <= 8 && slides.some(s => s.use === 'steps') && slides.every(s => s.use || (s.t && s.notes)), `${l.id}: ${slides.length} slides with notes and a Your turn slide`);
    ok(!other.test(JSON.stringify(l)), `${l.id}: no other product’s names`);
    ok(existsSync(join(ROOT, 'lessons', 'starters', l.id + '.json')) && existsSync(join(ROOT, 'lessons', 'pics', l.id + '.jpg')), `${l.id}: starter + picture`);
    if (W.UNIT[l.id]) ok(existsSync(join(ROOT, 'lessons', 'builds', l.id + '.mjs')), `${l.id}: build file`);
  });
  ok(UNIT.filter((l, i) => i % 6 === 5).every(l => l && /^Project/.test(l.title) && W.UNIT[l.id] && W.UNIT[l.id].project), 'lesson 6 of each block is a design-and-make project');
  // the pupil steps name buttons and blocks that really exist in the AI Lab
  const realWords = ['1 Teach', '2 Train & test', '3 Code it', 'Train', 'Add', 'New label', 'Run', 'Stop', 'Clear', 'Done', 'Send'];
  const stepText = UNIT.filter(Boolean).map(l => l.steps.map(s => s.d).join(' ')).join(' ');
  ok(realWords.slice(0, 6).every(w => stepText.includes(w)), 'pupil steps use the AI Lab’s real button names');
  const BLOCK_WORDS = ['when the AI thinks it’s', 'when the AI makes a guess', 'wait for the next guess', 'how sure the AI is', 'AI thinks it’s', 'clear the pad', 'change score by', 'repeat until', 'send message', 'when I receive'];
  ok(BLOCK_WORDS.every(w => stepText.includes(w)), 'pupil steps name the real blocks (when the AI thinks it’s, how sure the AI is, repeat until, …)');
}

// ───────── 2. every answer ticks every goal; no starter does (Node) ─────────
const Blockly = require('blockly');
AB.defineBlocks(Blockly);
const brains = new Map();
function brainOf(p) {
  const kind = p.kind === 'text' ? 'text' : 'draw', labels = M.cleanLabels(p.labels, kind);
  if (M.canTrain(labels, kind)) return null;
  const k = M.dataKey(labels, kind); if (!brains.has(k)) brains.set(k, M.train(labels, { kind })); return brains.get(k);
}
// what pupils make the program see: a drawing by name, a raw drawing, typed words, or whatever the variable `target` asks for
function input(x, vars) {
  if (x.d) return D.draw(x.d, x.s);
  if (x.raw) return x.raw;
  if (x.t) return x.t;
  if (x.target) { const t = vars()[x.target]; return D.draw(D.DRAW[t] ? t : 'fox', x.s); } // a starter with no such variable: just draw a fox
  return null;
}
// One project: train it (if it was trained or can be), run its program, draw/type each input, and report the goals.
function play(p, script = [], { tested = 0, train = true } = {}) {
  const kind = p.kind === 'text' ? 'text' : 'draw', labels = M.cleanLabels(p.labels, kind);
  const brain = train ? brainOf(p) : null;
  AB.setLabelNames(labels.map(l => l.name));
  const ws = new Blockly.Workspace(), errs = [];
  Blockly.serialization.workspaces.load(p.blocks || AB.starterProgram(kind), ws);
  const blocks = Blockly.serialization.workspaces.save(ws);
  let rec = AG.newRecord(), last = null, r = 0x2468ac;
  const runner = createRunner({ say: t => { if (t) rec.said.push(String(t)); }, score: n => { if (n != null) rec.score = rec.score == null ? n : Math.max(rec.score, n); },
    sent: m => rec.msgs.push(m), guess: () => last, labels: () => labels.map(l => l.name), clear: () => {}, onError: e => errs.push(e) });
  const vars = () => { const o = {}, v = runner._vars(); for (const id in v) { const x = ws.getVariableById(id); if (x) o[x.name] = v[id]; } return o; };
  const checker = AG.createGoals(p.goals);
  const state = () => ({ kind, labels, trained: !!brain, check: brain && brain.check, tested: brain ? tested : 0, blocks, rec, vars: vars(),
    readAs: t => { const g = brain && kind === 'text' ? M.guess(brain, t) : null; return g ? g.label : null; } });
  const oR = Math.random; Math.random = () => { r = (r * 1103515245 + 12345) % 2147483648; return r / 2147483648; }; // the same "random" labels every time
  try {
    runner.start(ws); checker.reset();
    const tick = secs => { for (let i = 0; i < secs * 60; i++) { runner.tick(1 / 60); if (i % 10 === 0) checker.update(state()); } checker.update(state()); };
    tick(1.5);
    for (const x of script) { last = brain ? M.guess(brain, input(x, vars)) : null; rec.guesses++; runner.guessed(); tick(3.5); }
    runner.stop(true);
    return { ticks: checker.ticks(), done: checker.allDone(), rec, vars: vars(), errs, brain };
  } finally { Math.random = oR; ws.dispose(); }
}
const show = r => r.ticks.map(t => (t ? '✓' : '·')).join('');
for (const id of W.IDS) {
  const L = W.UNIT[id], script = L.play || [], tests = (L.test || []).length;
  const a = play(L.answer(), script, { tested: tests });
  ok(a.done && !a.errs.length, `${id}: the ${L.project ? 'example project' : 'answer'} ticks every goal (${show(a)})` + (a.errs.length ? ' errors: ' + a.errs.join(' | ') : ''));
  const s = play(L.starter(), script, { tested: tests });
  ok(!s.done, `${id}: the bare starter does not (${show(s)})`);
}
// what each lesson promises, said in its own words
{
  const U2 = W.UNIT;
  const a2 = brainOf(U2['ai-2-tracks'].answer());
  let right = 0; for (let s = 2000; s < 2020; s++) for (const n of ['deer', 'fox', 'duck']) if (M.guess(a2, D.draw(n, s)).label === n) right++;
  ok(right >= 54 && !brainOf(U2['ai-2-tracks'].starter()), `Whose footprints?: the answer recognises new tracks it never saw (${right}/60); the starter can’t even train`);
  const r3 = play(U2['ai-3-events'].answer(), [{ d: 'fox', s: 31 }]);
  ok(r3.rec.said.includes('A fox trotted past!') && !play(U2['ai-3-events'].starter(), [{ d: 'fox', s: 31 }]).rec.said.some(t => /fox/i.test(t)), 'Hoot says what it sees: a fox track gets its own message (not in the starter)');
  const r4 = play(U2['ai-4-survey'].starter(), W.UNIT['ai-4-survey'].play);
  ok(r4.rec.score === 2, 'The track survey: the long-hand starter only surveys 2 tracks; repeat 5 surveys 5');
  const r5 = play(U2['ai-5-muddle'].starter(), [{ d: 'duck', s: 55 }]);
  ok(r5.rec.said.includes('A fox trotted past!'), 'Hoot’s muddle: the starter really is muddled (a duck track says fox)');
  const r7 = play(U2['ai-7-sure'].answer(), [{ d: 'fox', s: 71 }, { raw: [[128, 128, 130, 130]] }]), r7s = play(U2['ai-7-sure'].starter(), [{ raw: [[128, 128, 130, 130]] }]);
  ok(r7.rec.said.includes('It’s a fox!') && r7.rec.said.some(t => /not sure/.test(t)) && r7s.rec.said.some(t => /^It’s a /.test(t)), 'Is Hoot sure?: sure about a fox, not sure about a dot (the starter names the dot anyway)');
  const r10 = play(U2['ai-10-ducks'].starter(), W.UNIT['ai-10-ducks'].play);
  ok(r10.rec.said.includes('Three ducks! Well done!') && r10.rec.score === 2, 'Count the ducks: repeat 3 says “Three ducks!” after only 2 ducks (the bug); repeat until waits for the third');
  const r11 = play(U2['ai-11-patrol'].starter(), [{ d: 'fox', s: 1101 }]);
  ok(r11.rec.said.some(t => /Patrol over/.test(t)) && r11.rec.score === 0, 'Night patrol: the buggy loop ends at once with no foxes counted');
  const r14 = play(U2['ai-14-target'].answer(), W.UNIT['ai-14-target'].play);
  const r15 = play(U2['ai-15-alert'].answer(), W.UNIT['ai-15-alert'].play);
  ok(r14.vars.goes === 3 && ['deer', 'fox', 'duck'].includes(r14.vars.target) && r14.rec.said.some(t => /You got 3 right in 3 goes/.test(t)), 'Draw what Hoot asks: target and goes do their jobs');
  ok(r15.vars.foxes === 2 && r15.rec.msgs.join() === 'fox alert,all clear,fox alert', 'Ranger alert!: two fox alerts, one all clear, foxes = 2');
  const b16s = brainOf(U2['ai-16-book'].starter()), b16 = brainOf(U2['ai-16-book'].answer());
  ok(M.guess(b16s, 'where is the car park?').label !== 'question' && M.guess(b16, 'where is the car park?').label === 'question' && b16.check && b16.check.total > 0,
    'The visitor book: with no question label a question is read as ' + M.guess(b16s, 'where is the car park?').label + '; with one it’s a question');
  const b17s = brainOf(U2['ai-17-fair'].starter()), b17 = brainOf(U2['ai-17-fair'].answer());
  const kw = M.keyWords(b17s, M.cleanLabels(U2['ai-17-fair'].starter().labels, 'text'));
  ok(M.guess(b17s, 'my dog had a great time').label === 'problem' && M.guess(b17, 'my dog had a great time').label === 'praise' && kw[1].some(w => /^dogs?$/.test(w.word)),
    'Is Hoot fair?: the biased starter says a happy dog message is a problem (dog is a key word for problem); the fairer examples fix it');
}

// the checker on its own
{
  const info = AG.programInfo(W.UNIT['ai-11-patrol'].answer().blocks);
  ok(AG.countUses(info, { blocks: ['ai_wait_drawing'], inside: ['controls_whileUntil'] }) === 1 && AG.countUses(AG.programInfo(W.UNIT['ai-11-patrol'].starter().blocks), { blocks: ['ai_wait_drawing'], inside: ['controls_whileUntil'] }) === 0,
    'goals: “inside” tells a block in a loop from one before it');
  ok(AG.countUses(AG.programInfo(W.UNIT['ai-9-clues'].answer().blocks), { blocks: ['logic_operation'], fields: { OP: 'OR' } }) === 1, 'goals: field values (or / and) can be checked');
  const loose = { blocks: { languageVersion: 0, blocks: [{ type: 'controls_repeat_ext', x: 0, y: 0 }] } };
  ok(AG.countUses(AG.programInfo(loose), { blocks: ['controls_repeat_ext'] }) === 0, 'goals: loose blocks (not under a “when” block) don’t count');
  ok(AG.cleanGoals({ list: [{ type: 'nope' }, { type: 'uses', blocks: ['x y'] }, { type: 'reads' }] }) === null && AG.cleanGoals({ title: '<b>x</b>', list: [{ type: 'labels', n: 99 }] }).list[0].n === 6, 'goals: bad goals are dropped and numbers kept in range');
}
if (ONLY_NODE) done();

// ───────── 3. in the real app ─────────
const site = await serve();
const b = await browser();
const errors = [];
const { page } = await openApp(b, site.url, { errors });
const waitAi = async () => {
  await page.waitForFunction(() => typeof aiApp !== 'undefined' && aiApp && aiApp._ws && aiApp._ws(), null, { timeout: 30000 });
  await page.waitForFunction(() => !aiApp._training(), null, { timeout: 30000 });
};
try {
  for (const l of UNIT) {
    await page.evaluate(id => { clearDirty(); lessonOpenStarter(id); }, l.id); // not returned (a starter's promise can be collected)
    await page.waitForFunction(id => typeof lessonActive !== 'undefined' && lessonActive && lessonActive.id === id && !document.getElementById('lesson-guide').classList.contains('hide'), l.id, { timeout: 30000 });
    await waitAi();
    const st = await page.evaluate(() => ({ type: projectType, card: document.querySelector('#lesson-guide').textContent, g: aiApp._goals(), shown: !document.getElementById('alGoals').hidden }));
    const G = W.UNIT[l.id];
    ok(st.type === 'ai' && st.card.length > 20 && (G ? st.g && st.shown && st.g.list.length === G.goals.list.length && !st.g.done : true),
      `${l.id}: the starter opens in the AI Lab with its Lesson card` + (G ? ` and its goals (${st.g ? st.g.ticks.filter(Boolean).length : '?'} of ${G.goals.list.length} done)` : ''));
  }

  // Whose footprints? — teach, train and test in the app: every goal ticks, and the Lesson card offers the next lesson
  await page.evaluate(() => { clearDirty(); lessonOpenStarter('ai-2-tracks'); });
  await page.waitForFunction(() => lessonActive && lessonActive.id === 'ai-2-tracks');
  await waitAi();
  const ex = W.tracks(5);
  await page.click('#alTabTeach');
  for (let i = 0; i < 3; i++) {
    if (i === 2) await page.click('#alAddLabel');
    await page.fill(`.al-label >> nth=${i} >> .al-lname`, ex[i].name); await page.press(`.al-label >> nth=${i} >> .al-lname`, 'Enter');
    await page.click(`.al-label >> nth=${i} >> .al-count`);
    for (const d of ex[i].ex) { await page.evaluate(d => aiApp._pads.teach.set(d), d); await page.click('#alAddEx'); }
  }
  await page.waitForFunction(() => aiApp._goals().ticks.slice(0, 2).every(Boolean));
  ok(true, 'Whose footprints?: naming three labels and drawing 5 of each ticks the first two goals');
  await page.click('#alTabTrain'); await page.click('#alTrain');
  await page.waitForFunction(() => aiApp._brain() && !aiApp._training(), null, { timeout: 30000 });
  for (const [n, s] of [['fox', 901], ['deer', 902], ['duck', 903]]) {
    await page.evaluate(d => { aiApp._pads.test.set(d); aiApp._testGuess(); }, D.draw(n, s));
    await page.click('#alTestClear');
  }
  await page.waitForFunction(() => aiApp._goals().done, null, { timeout: 5000 }).catch(() => {});
  const g2 = await page.evaluate(() => ({ g: aiApp._goals(), all: document.getElementById('alGoals').classList.contains('all'), next: document.getElementById('lg-go') && !document.getElementById('lg-go').classList.contains('hide') }));
  ok(g2.g.done && g2.all, `Whose footprints?: training and testing 3 drawings ticks every goal in the app (${g2.g.ticks})`);
  const saved = await page.evaluate(() => buildPayload());
  ok(saved.ai.goals && saved.ai.goals.list.length === 4, 'the goals are saved with the project');

  // Hoot says what it sees — the answer program, run in the app
  await page.evaluate(() => { clearDirty(); lessonOpenStarter('ai-3-events'); });
  await page.waitForFunction(() => lessonActive && lessonActive.id === 'ai-3-events');
  await waitAi();
  await page.evaluate(p => { const P = aiApp.getProject(); P.blocks = p.blocks; aiApp.setProject(P); }, W.UNIT['ai-3-events'].answer());
  await waitAi();
  await page.click('#alTabCode'); await page.click('#alRun');
  for (const [n, s] of [['fox', 301], ['duck', 302], ['deer', 303]]) {
    await page.evaluate(d => aiApp._pads.play.set(d), D.draw(n, s)); await page.click('#alDone'); await sleep(400);
  }
  await page.waitForFunction(() => aiApp._goals().done, null, { timeout: 8000 }).catch(() => {});
  const g3 = await page.evaluate(() => ({ g: aiApp._goals(), said: aiApp._rec().said }));
  ok(g3.g.done && g3.said.includes('A fox trotted past!'), `Hoot says what it sees: running the answer in the app ticks every goal (${g3.g.ticks})`);
  await page.click('#alRun');
  ok(await page.evaluate(() => { const g = aiApp._goals(); return g.ticks[0] && !g.ticks[1] && !g.ticks[3]; }), 'pressing Run again starts the “while it ran” goals again (the blocks goal stays)');

  // Is Hoot fair? — a words AI: add the fairer examples, train, and the checklist ticks
  await page.evaluate(() => { clearDirty(); lessonOpenStarter('ai-17-fair'); });
  await page.waitForFunction(() => lessonActive && lessonActive.id === 'ai-17-fair');
  await waitAi();
  ok(await page.waitForFunction(() => aiApp._brain() && aiApp._goals().ticks[1] && !aiApp._goals().ticks[2], null, { timeout: 5000 }).then(() => true, () => false), 'Is Hoot fair?: the starter opens trained, and it reads a happy dog message as a problem');
  const fixed = W.UNIT['ai-17-fair'].answer();
  await page.evaluate(p => { const P = aiApp.getProject(); P.labels = p.labels; P.trained = false; aiApp.setProject(P); }, fixed);
  await page.click('#alTabTrain'); await page.click('#alTrain');
  await page.waitForFunction(() => aiApp._brain() && !aiApp._training(), null, { timeout: 30000 });
  await page.waitForFunction(() => aiApp._goals().done, null, { timeout: 5000 }).catch(() => {});
  ok(await page.evaluate(() => aiApp._goals().done), 'Is Hoot fair?: with fairer examples, trained again, every goal ticks');
  ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
