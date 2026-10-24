// Critter Workshop — the Critter Lab's lesson unit (lessons/units/critter.js, 18 lessons in 3 blocks).
// 1. The unit's data: every lesson complete, in order, with slides, a starter and a picture, and no other product's names.
// 2. The goals and results log (critter/critter-goals.js): sanitising, kept by normalise, one-design wins.
// 3. In Node, with the real physics (critter-core.js runHeadless): every lesson's answer meets every goal while the bare
//    starter (tested in the same contests) does not; project lessons: an example design meets the brief. The two adopted
//    lessons are followed too (Critter builders: back legs; Critter engineers: Opposite beat).
// 4. In the real app: every starter opens with its Lesson card and its goals checklist; the foot-loop lesson done with the
//    real buttons (Reverse, Test it!) ticks every goal; the Results table lists the tests; Undo keeps the log; save/reopen.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, serve, browser, openApp, ok, done, sleep } from './lib.mjs';

const imp = p => import(pathToFileURL(join(ROOT, p)).href);
const U = await imp('lessons/units/critter.js');
const { LESSONS: ALL } = await imp('lessons/lessons.js');
const W = await imp('lessons/builds/critter/workshop.mjs');
const Z = W.Z, G = W.G;
const ONLY_NODE = process.env.CRITTER_NODE === '1';
const starterFile = id => JSON.parse(readFileSync(join(ROOT, 'lessons', 'starters', id + '.json'), 'utf8'));

// ───────── 1. the unit's data ─────────
const NAME = 'Critter Workshop';
const UNIT = U.LESSONS.map(x => ALL.find(l => l.id === (x.adopt || x.id)));
ok(UNIT.length === 18 && UNIT.every(Boolean), `18 lessons in the unit, all in the library (${UNIT.filter(Boolean).length})`);
ok(new Set(ALL.map(l => l.id)).size === ALL.length, 'every lesson id in the library is different');
ok(['critter-builders', 'critter-engineers'].every(id => U.LESSONS.some(x => x.adopt === id)), 'the Critter Lab’s two earlier lessons are folded into the unit');
ok(W.IDS.every(id => U.LESSONS.some(x => x.id === id)) && U.LESSONS.filter(x => x.id).every(x => W.UNIT[x.id]), 'every new lesson has a starter, goals and an answer (lessons/builds/critter/workshop.mjs)');
{
  const YEARS = ['Years 3–4', 'Years 4–5', 'Years 5–6'];
  const other = /Scratch|Minecraft|Tinkercad|Autodesk|intelino|Ohbot|Bamzooki|\bBBC\b|Flock|Flip Computing|Code\.org|Barefoot/i;
  UNIT.forEach((l, i) => {
    if (!l) return;
    l = Object.assign({ plan: [], steps: [], success: [], words: [], assess: [], need: [], curriculum: [], slides: [] }, l);
    const b = Math.floor(i / 6) + 1, m = i + 1, mins = l.plan.reduce((a, p) => a + p.min, 0), slides = l.slides || [];
    ok(l.unit === `${NAME} · Block ${b} · Lesson ${m}` && l.years === YEARS[b - 1] && l.ks === 'ks2' && l.type === 'critter' && l.minutes === 60,
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
  // the pupil steps name buttons and settings that really exist in the Critter Lab
  const app = readFileSync(join(ROOT, 'critter', 'critter-app.js'), 'utf8');
  const REAL = ['Test it!', 'Build', 'Results', 'Motion', 'Shape', 'Reverse', 'Longer steps', 'Lift higher', 'Grippy', 'Cycle speed', 'Turning smoothness',
    'Turning sharpness', 'Muscle power', 'Width', 'Length', 'Copy', 'Paste', 'Remove this pair', 'Turbo', 'Go!', 'Against', 'Undo'];
  ok(REAL.every(w => app.includes(w === 'Remove this pair' ? "Remove ' + (b.twin ? 'this pair'" : w)), 'the button and setting names used in the steps are in critter-app.js');
  const stepText = UNIT.filter(Boolean).map(l => l.steps.map(s => s.t + ' ' + s.d).join(' ')).join(' ');
  ok(REAL.every(w => stepText.includes(w)), 'the pupil steps use the real names (' + REAL.filter(w => !stepText.includes(w)).join(', ') + ')');
  const contests = Object.values(Z.CONTESTS).map(c => c.label).concat(['Super Sumo']);
  ok(['Sprint', 'Hurdles', 'Block Push', 'High Jump', 'Lap', 'Free roam', 'Super Sumo'].every(c => contests.includes(c) && stepText.includes(c)), 'the steps name the real contests');
  ok(['Walking leg', 'Long leg', 'Neck & head'].every(n => Object.values(Z.LIMBS).some(L => L.label === n)) && ['Foot pad', 'Long bit', 'Leg bit'].every(n => Object.values(Z.PARTS).some(P => P.label === n)), 'the limb and part names in the steps are real');
}

// ───────── 2. goals + results log ─────────
{
  const g = G.cleanGoals({ title: 'T<b>', list: [{ type: 'score', contest: 'sprint', min: 3, text: 'a' }, { type: 'nope' }, { type: 'score', contest: 'fly' }, { type: 'setting', key: 'speed', min: 9 }, { type: 'grip', grip: 'sticky' }] });
  ok(g && g.title === 'Tb' && g.list.length === 2 && g.list[1].key === 'speed', 'cleanGoals keeps good goals and drops unknown ones');
  ok(G.cleanGoals({ list: [] }) === null && G.cleanGoals(null) === null, 'no goals → null');
  const log = G.cleanLog([{ c: 'sprint', s: 1.234, k: 'abc' }, { c: 'x', s: 1 }, { c: 'sumo', s: 1, k: 'zz!', o: 'crab', w: 1, n: '<b>hi</b>' }]);
  ok(log.length === 2 && log[0].s === 1.23 && log[1].k === '0' && log[1].o === 'crab' && log[1].n === 'bhi/b', 'cleanLog keeps good rows and tidies them');
  const z = Z.normalise({ blocks: [{ id: 'b1', kind: 'body' }], goals: { list: [{ type: 'named', not: 'X' }] }, log: [{ c: 'sprint', s: 2, k: '1' }] });
  ok(z.goals && z.goals.list.length === 1 && z.log.length === 1, 'normalise keeps the goals and the log');
  ok(!('goals' in Z.normalise({ blocks: [] })) && !('log' in Z.normalise({ blocks: [] })), '…and adds neither when there are none');
  const a = W.starter('workshop-2-loop'), b = JSON.parse(JSON.stringify(a)); b.name = 'Other'; b.log = [{ c: 'sprint', s: 1, k: '1' }];
  ok(G.designKey(a) === G.designKey(b) && G.designKey(a) !== G.designKey(W.starter('workshop-5-bugs')), 'the design key ignores the name and the log, but not the design');
  const wins = { list: [{ type: 'wins', n: 2, text: 'w' }] };
  ok(!G.allDone(G.cleanGoals(wins), { log: [{ c: 'sumo', s: 1, k: 'a', o: 'crab', w: 1 }, { c: 'sumo', s: 1, k: 'b', o: 'hopper', w: 1 }] }), 'wins: two different designs each beating one opponent is not enough');
  ok(G.allDone(G.cleanGoals(wins), { log: [{ c: 'sumo', s: 1, k: 'a', o: 'crab', w: 1 }, { c: 'sumo', s: 1, k: 'a', o: 'self', w: 1 }, { c: 'sumo', s: 1, k: 'a', o: 'hopper', w: 1 }] }), '…one design beating two Starter Critters is (itself doesn’t count)');
  for (const id of W.IDS) {
    const f = starterFile(id).critter;
    ok(f && f.goals && f.goals.list.length >= 2 && G.designKey(Z.normalise(f)) === G.designKey(W.starter(id)) && !f.log, `${id}: the saved starter is the unit's starter, with its goals and no results yet`);
  }
}

// ───────── 3. every answer meets every goal; no bare starter does (Node, real physics) ─────────
const mod = await imp('critter/vendor/rapier3d-compat-0.21.0.min.js');
const R = mod.default || mod; await R.init();
for (const id of W.IDS) {
  const L = W.UNIT[id], s0 = W.starter(id);
  const tests = L.answer.filter(s => s.test).map(s => ({ test: s.test, opp: s.opp }));
  const bare = W.play(R, s0, tests), ans = W.play(R, s0, L.answer);
  const tb = G.checkGoals(s0.goals, bare), ta = G.checkGoals(s0.goals, ans);
  const show = z => (z.log || []).map(r => r.c + (r.o ? ' v ' + r.o + (r.w === 1 ? ' won' : ' lost') : '') + ' ' + r.s).join(', ');
  ok(ta.every(Boolean), `${id}: the ${L.project ? 'example design meets the brief' : 'answer meets every goal'} (${show(ans)})`);
  ok(!tb.every(Boolean), `${id}: the bare starter does not (${tb.filter(Boolean).length}/${tb.length}: ${show(bare)})`);
}
// the facts the lessons promise on the way
{
  const run = (z, c, o) => Z.runHeadless(R, Z.normalise(JSON.parse(JSON.stringify(z))), c, o).score;
  const t = W.starter('workshop-2-loop'), t2 = W.play(R, t, W.UNIT['workshop-2-loop'].answer.filter(s => s.act));
  ok(run(t, 'sprint') < 1.5 && run(t2, 'sprint') > 4, 'The foot loop: Reverse on the front and back feet takes Trundle from about 1 m to 5 m');
  const bramble = W.play(R, W.starter('workshop-5-bugs'), W.UNIT['workshop-5-bugs'].answer);
  ok(bramble.log.slice(0, 3).every(r => r.s < 2) && bramble.log[3].s > 4, 'Bug hunt: Bramble only walks well once all three bugs are fixed (' + bramble.log.map(r => r.s).join(' → ') + ')');
  const strider = W.play(R, W.starter('workshop-14-speeds'), W.UNIT['workshop-14-speeds'].answer).log.map(r => r.s);
  const peak = strider.indexOf(Math.max(...strider)) + 1;
  ok(peak === 7 && strider[9] < 0, 'Speed trials: Strider’s best cycle speed is 7 and at 10 it goes backwards (' + strider.join(', ') + ')');
  const hilda = W.play(R, W.starter('workshop-9-better'), W.UNIT['workshop-9-better'].answer).log.map(r => r.s);
  ok(hilda[1] < hilda[0] && hilda[2] > hilda[0], 'Better or worse: Lift higher is worse (Undo), Longer steps is better (' + hilda.join(', ') + ')');
  const patch = W.starter('workshop-15-copy');
  ok(run(patch, 'sprint') < 0, 'One great leg: Patch walks backwards at first');
  // the two adopted lessons
  const scoot = Z.normalise(starterFile('critter-builders').critter), s1 = JSON.parse(JSON.stringify(scoot));
  W.H.tapLimb(s1, 'leg3', s1.blocks[0].id);
  ok(run(scoot, 'sprint') < 0.5 && run(s1, 'sprint') > 3, 'Critter builders: tapping Long leg with the body chosen adds back legs and Scoot goes ' + run(s1, 'sprint').toFixed(1) + ' m');
  const eng = Z.normalise(starterFile('critter-engineers').critter), e1 = JSON.parse(JSON.stringify(eng));
  const top = b => { let p = b; while (p.mount && p.mount.parent !== e1.blocks[0].id) p = Z.block(e1, p.mount.parent); return p; };
  e1.blocks.filter(b => b.path && top(b).mount.at[0] < 0).forEach(f => { f.path.phase = (f.path.phase + 0.5) % 1; });
  ok(run(e1, 'sprint') > run(eng, 'sprint') * 2, 'Critter engineers: Opposite beat on both back feet more than doubles the Sprint');
}
if (ONLY_NODE) done();

// ───────── 4. the real app ─────────
const site = await serve();
const b = await browser();
const errors = [];
const { page } = await openApp(b, site.url, { errors });
try {
  for (const l of UNIT) {
    await page.evaluate(id => { clearDirty(); lessonOpenStarter(id); }, l.id); // not returned (a starter's promise can be collected)
    await page.waitForFunction(id => typeof lessonActive !== 'undefined' && lessonActive && lessonActive.id === id && !document.getElementById('lesson-guide').classList.contains('hide') && typeof critterApp !== 'undefined' && critterApp, l.id, { timeout: 60000 });
    await sleep(300);
    const st = await page.evaluate(() => ({ title: document.querySelector('#lesson-guide')?.textContent || '', goals: critterApp._goals(), box: !document.getElementById('zGoals').hidden, items: document.querySelectorAll('#zGoals .zl-glist li').length, name: critterApp.getCritter().name }));
    if (W.UNIT[l.id]) ok(st.box && st.goals && st.items === st.goals.length && !st.goals.every(Boolean), `${l.id}: opens with its Lesson card and its goals checklist (${st.items} goals, ${st.goals.filter(Boolean).length} ticked) — ${st.name}`);
    else ok(!st.box && st.goals === null, `${l.id}: opens with its Lesson card (no checklist) — ${st.name}`);
  }

  // The foot loop, with the real buttons
  await page.evaluate(() => { clearDirty(); lessonOpenStarter('workshop-2-loop'); });
  await page.waitForFunction(() => lessonActive && lessonActive.id === 'workshop-2-loop' && critterApp && critterApp.getCritter().name === 'Trundle', null, { timeout: 60000 });
  const fronts = await page.evaluate(() => { const z = critterApp.getCritter(); return z.blocks.filter(b => b.path && b.twin && z.blocks.indexOf(b) < z.blocks.findIndex(x => x.id === b.twin)).map(b => b.id); });
  for (const id of fronts) {
    await page.evaluate(id => critterApp._select(id), id);
    await page.click('#zInspector [data-tab="motion"]');
    await page.click('#pRev');
  }
  ok(await page.evaluate(() => critterApp._goals().every(x => !x)), 'The foot loop in the app: reversing both foot pairs ticks nothing until it is tested');
  await page.click('.zl-mode[data-mode="test"]');
  await page.check('#zTurbo');
  await page.waitForFunction(() => !document.getElementById('zResult').hidden, null, { timeout: 150000 });
  const after = await page.evaluate(() => ({ goals: critterApp._goals(), log: critterApp.getCritter().log, card: document.getElementById('zResult').textContent }));
  ok(after.log && after.log.length === 1 && after.log[0].c === 'sprint' && after.log[0].s > 4, 'The foot loop in the app: a real Test it! run logs about 5 m (' + JSON.stringify(after.log) + ')');
  ok(after.goals[0] && !after.goals[1], '…which ticks the Sprint goal, but not “before and after” yet');
  // the "before" test: undo both reverses, test again → two designs; Undo keeps the log
  await page.click('.zl-mode[data-mode="build"]');
  await page.click('#zUndo'); await page.click('#zUndo');
  ok(await page.evaluate(() => (critterApp.getCritter().log || []).length === 1), 'Undo leaves the Results log alone');
  await page.click('.zl-mode[data-mode="test"]');
  await page.waitForFunction(() => !document.getElementById('zResult').hidden && (critterApp.getCritter().log || []).length === 2, null, { timeout: 150000 });
  ok(await page.evaluate(() => critterApp._goals().every(Boolean) && document.getElementById('zGoals').classList.contains('all')), 'The foot loop in the app: tested before and after → every goal ticks and the checklist turns green');
  await page.click('#zResults');
  const table = await page.evaluate(() => ({ rows: document.querySelectorAll('#zDialog tbody tr').length, bars: document.querySelectorAll('#zDialog .zl-cbar').length, text: document.getElementById('zDialog').textContent }));
  ok(table.rows === 2 && table.bars === 2 && /Design 1/.test(table.text) && /Design 2/.test(table.text) && /\(now\)/.test(table.text), 'Results shows both tests as two designs, with a bar chart');
  await page.fill('#zDialog [data-note="0"]', 'reversed the loops');
  await page.dispatchEvent('#zDialog [data-note="0"]', 'change');
  await page.click('#dClose');
  // save → reopen keeps the goals, the log and the note
  const saved = await page.evaluate(() => JSON.stringify(buildPayload()));
  await page.evaluate(p => { clearDirty(); applyPayload(JSON.parse(p)); }, saved);
  await page.waitForFunction(() => critterApp && critterApp.getCritter().name === 'Trundle', null, { timeout: 30000 });
  await sleep(300);
  ok(await page.evaluate(() => { const z = critterApp.getCritter(); return z.goals && z.log.length === 2 && z.log[0].n === 'reversed the loops' && critterApp._goals().every(Boolean); }), 'saved and reopened: the goals, the Results log and the note come back, still all ticked');
  // a Starter Critter keeps the lesson's goals
  await page.click('#zStarters');
  await page.click('#zDialog [data-open="crab"]');
  ok(await page.evaluate(() => { const z = critterApp.getCritter(); return z.name === 'Crab' && !!z.goals && z.log.length === 2; }), 'opening a Starter Critter keeps the lesson’s goals and the Results log');
} catch (e) { ok(false, 'app checks crashed: ' + e.message); }
ok(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
await b.close(); site.close();
done();
