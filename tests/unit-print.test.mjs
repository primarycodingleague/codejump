// Maple Street Makers — the Print Lab's lesson unit (lessons/units/print.js, 18 lessons in 3 blocks).
// Every lesson is complete; every starter opens in the real app with its Lesson card and its challenge card; and for every lesson
// that isn't a project, the lesson's answer (lessons/builds/print/maple.mjs ANSWERS, or the adopted lessons' own answers, made as the
// Lesson card says) meets every rule of its challenge while the bare starter does not — proven with the real Print Lab model
// (Manifold) in Node, then again in the app, where the challenge card must tick every rule. Each lesson's own promise (holes evenly
// spaced, walls from a variable, gears that mesh, plastic data…) is checked too. A few lessons are followed click by click in the app.
// Project lessons: the starter opens and an example meets every success criterion, the bare starter doesn't.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, serve, browser, openApp, ok, done } from './lib.mjs';

const U = await import(pathToFileURL(join(ROOT, 'lessons', 'units', 'print.js')).href);
const S = await import(pathToFileURL(join(ROOT, 'lessons', 'builds', 'print', 'maple.mjs')).href);
const { LESSONS: ALL } = await import(pathToFileURL(join(ROOT, 'lessons', 'lessons.js')).href);
const PM = S.PM;
const { default: Module } = await import(pathToFileURL(ROOT + '/print/vendor/manifold.js').href);
const ot = await import(pathToFileURL(ROOT + '/print/vendor/opentype-2.0.0.min.mjs').href);
const M = await Module(); M.setup();
const fb = readFileSync(ROOT + '/print/vendor/Outfit-Bold.ttf');
const md = PM.createModel(M, { font: ot.parse(fb.buffer.slice(fb.byteOffset, fb.byteOffset + fb.length)) });

// ───────── the unit's data ─────────
const NAME = 'Maple Street Makers';
const UNIT = U.LESSONS.map(x => ALL.find(l => l.id === (x.adopt || x.id)));
ok(UNIT.length === 18 && UNIT.every(Boolean), `18 lessons in the unit, all in the library (${UNIT.filter(Boolean).length})`);
ok(new Set(ALL.map(l => l.id)).size === ALL.length, 'every lesson id in the library is different');
ok(['print-keyring', 'print-phone-stand'].every(id => U.LESSONS.some(x => x.adopt === id)), 'the Print Lab’s two earlier lessons are folded into the unit');
const YEARS = ['Years 3–4', 'Years 4–5', 'Years 5–6'];
const words = /Scratch|ScratchJr|Minecraft|Tinkercad|Autodesk|intelino|Ohbot|Bamzooki|BBC|Flock|Flip Computing|Code\.org|Barefoot|Fusion 360|SketchUp/;
UNIT.forEach((l, i) => {
  if (!l) return;
  const b = Math.floor(i / 6) + 1, m = i + 1, mins = l.plan.reduce((a, p) => a + p.min, 0), slides = l.slides || [];
  ok(l.unit === `${NAME} · Block ${b} · Lesson ${m}` && l.years === YEARS[b - 1] && l.ks === 'ks2' && l.type === 'print3d' && l.minutes === 60,
    `${l.id}: Block ${b} · Lesson ${m}, ${l.years}, ${l.ks}, 60 minutes`);
  ok(mins === 60 && l.steps.length >= 4 && l.steps.length <= 9 && l.success.length >= 2 && l.words.length >= 2 && l.assess.length >= 2 && l.support && l.stretch && l.objective && l.summary && l.need.length && l.title && l.tool,
    `${l.id}: complete (plan ${mins} min, ${l.steps.length} pupil steps)`);
  ok(l.curriculum.length && l.curriculum.every(k => ['design', 'ssr', 'reason', 'data', 'safe'].includes(k)), `${l.id}: Key Stage 2 curriculum keys (${l.curriculum})`);
  ok(slides.length >= 4 && slides.length <= 7 && slides.some(s => s.use === 'steps') && slides.every(s => s.use || (s.t && s.notes)), `${l.id}: ${slides.length} slides with notes and a Your turn slide`);
  ok(!words.test(JSON.stringify(l)), `${l.id}: no other product’s names`);
  ok(existsSync(join(ROOT, 'lessons', 'starters', l.id + '.json')) && existsSync(join(ROOT, 'lessons', 'pics', l.id + '.jpg')) && existsSync(join(ROOT, 'lessons', 'builds', l.id + '.mjs')), `${l.id}: starter, picture and build file`);
});
ok(UNIT.filter((l, i) => i % 6 === 5).every(l => l && /^Project/.test(l.title)), 'lesson 6 of each block is a design-and-make project');
ok(UNIT.every((l, i) => !i || /^print-/.test(l.id)) && UNIT.filter(l => !['print-keyring', 'print-phone-stand'].includes(l.id)).every(l => S.STARTERS[l.id] && S.ANSWERS[l.id] && /^print-\d+-[a-z]+$/.test(l.id)), 'every new lesson has a starter design and an answer, and an id like print-<n>-<word>');

// ───────── the new challenge rules ─────────
{
  const all = ['holes', 'repeat', 'maxg', 'wall', 'parts', 'mesh'];
  ok(all.every(k => PM.RULES[k] && PM.ruleText({ k, v: 3 }).length > 10), 'the unit’s six new challenge rules have words: ' + all.map(k => PM.ruleText({ k, v: 3 })).join(' · '));
  const c = PM.cleanBrief({ title: 'x', rules: [{ k: 'holes', v: 5 }, { k: 'repeat', v: '4' }, { k: 'maxg', v: 6 }, { k: 'wall', v: 2.5 }, { k: 'parts', v: 3 }, { k: 'mesh', v: 9 }, { k: 'wall', v: 'x' }] });
  ok(c.rules.length === 6 && c.rules[1].v === 4 && c.rules[5].v === undefined && PM.RULE_NOV.includes('mesh'), 'the new rules are cleaned when a challenge loads (numbers kept, “mesh” has none, nonsense dropped)');
  const e = PM.newProject(); e.brief = c;
  ok(PM.briefCheck(md, e, c).every(r => !r.ok), 'an empty plate ticks none of them');
}

// ───────── each lesson’s promise, in Node ─────────
const starter = id => PM.cleanProject(JSON.parse(readFileSync(join(ROOT, 'lessons', 'starters', id + '.json'), 'utf8')).print3d);
const answer = id => PM.cleanProject(S.ANSWERS[id](md, starter(id)));
const res = p => PM.briefCheck(md, p, p.brief);
const allOk = p => !!p.brief && res(p).every(r => r.ok);
const rule = (p, k) => (res(p).find(r => r.k === k) || {}).ok;
const warns = p => md.check(p).filter(c => c.level === 'warn' || c.level === 'stop');
const vol = o => { const w = md.whole(o), v = w.volume(); md.free(w); return v; };
const near = (a, b, e = 0.05) => Math.abs(a - b) <= e;
const holesOf = p => p.objs.flatMap(o => o.kind === 'group' ? o.children.filter(c => c.hole) : []);
const ANS = {};
for (const l of UNIT) {
  if (!S.ANSWERS[l.id]) continue;
  ANS[l.id] = answer(l.id);
  const s = starter(l.id), a = ANS[l.id], proj = /^Project/.test(l.title);
  if (l.id !== 'print-12-order') ok(!!s.brief && !allOk(s) && allOk(a), `${l.id}: the ${proj ? 'example' : 'answer'} meets every rule of “${s.brief.title}”; the bare starter doesn’t (${res(s).filter(r => r.ok).length}/${res(s).length} at the start)`);
}
// adopted lessons: the answers their Lesson cards build (as in print.test.mjs)
{
  const k = starter('print-keyring'); k.objs.push(PM.makeObj('text', { id: 'o2', text: 'AMY', w: 30, d: 12, h: 2, z: 3, x: 5 }), PM.makeObj('cylinder', { id: 'o3', hole: true, x: -19, w: 6, d: 6, h: 6, z: -1 }));
  md.group(k, ['o1', 'o3']); ANS['print-keyring'] = PM.cleanProject(k);
  ok(!allOk(starter('print-keyring')) && allOk(ANS['print-keyring']), 'print-keyring: the Lesson card’s steps meet every rule; the bare starter doesn’t');
  const s = starter('print-phone-stand');
  s.objs.push(PM.makeObj('box', { id: 'o1', w: 70, d: 70, h: 6 }), PM.makeObj('box', { id: 'o2', w: 70, d: 6, h: 80, y: 30, rx: -15 }), PM.makeObj('box', { id: 'o3', w: 70, d: 6, h: 14, y: -30, z: 6 }));
  s.objs[1].z -= md.bounds(s.objs[1]).min[2]; ANS['print-phone-stand'] = PM.cleanProject(s);
  ok(!allOk(starter('print-phone-stand')) && allOk(ANS['print-phone-stand']), 'print-phone-stand: the Lesson card’s steps meet every rule; the bare starter doesn’t');
}
{ // 1 the plan's three steps: 60 wide, 45 tall overall, a number on the base in front of the back
  const a = ANS['print-1-stand'], b = md.bounds(a.objs[1]), t = a.objs.find(o => o.kind === 'text');
  ok(near(b.max[0] - b.min[0], 60) && near(b.max[2], 40) && t && t.z === 5 && t.y < 0 && !rule(starter('print-1-stand'), 'minh') && !rule(starter('print-1-stand'), 'text'), 'Follow the plan: step 2 stands a 60 × 4 × 40 back on the base and step 3 puts the number on the base in front; the starter has only step 1');
}
{ // 3 the door really cuts the box, and the perch touches it (one piece)
  const a = ANS['print-3-birdbox'], g = a.objs.find(o => o.kind === 'group');
  const w = md.exportWhole(a);
  ok(g && vol(g) < 50 * 50 * 60 - 2000 && w.pieces === 1 && a.objs.filter(o => !o.hole).length >= 4, `Break it down: the turned Hole cylinder cuts a door in the box (${Math.round(vol(g))} mm³ < ${50 * 50 * 60}) and base, box, roof and perch print as one piece`);
}
{ // 4 five equal holes, 15 mm apart
  const hs = holesOf(ANS['print-4-pencils']).sort((p, q) => p.x - q.x), xs = hs.map(h => h.x);
  ok(hs.length === 5 && hs.every(h => h.w === hs[0].w) && xs.slice(1).every((x, i) => near(x - xs[i], 15)) && !rule(starter('print-4-pencils'), 'holes'), 'Repeat it: 5 holes the same size, each 15 mm from the last (' + xs.join(', ') + '); the starter has 1 that cuts nothing');
  const six = starter('print-4-pencils'); for (const x of [-18, -6, 6, 18, 30]) six.objs.push(PM.makeObj('cylinder', { id: 'h' + (x + 50), x, w: 9, d: 9, h: 30, z: 5, hole: true })); six.objs[1].x = -30;
  md.group(six, six.objs.map(o => o.id)); ok(allOk(PM.cleanProject(six)), 'Change the pattern: 6 holes 12 mm apart meets the challenge too');
}
{ // 5 four bugs found; each fix removes one; the fixed boat has none
  const s = starter('print-5-boat'), w = warns(s).map(c => c.text);
  const want = [/grouped/, /under the build plate/, /thinner than 1 mm/, /floating/];
  ok(want.every(re => w.some(t => re.test(t))) && w.length === 4, 'Debug the design: Check & print finds the four bugs in the starter (' + w.length + ')');
  const p = starter('print-5-boat'), counts = [warns(p).length];
  p.objs[0].z = 0; counts.push(warns(p).length); p.objs[1].z = 10; counts.push(warns(p).length); p.objs[2].w = p.objs[2].d = 3; counts.push(warns(p).length);
  md.group(p, [p.objs[1].id, p.objs[3].id]); counts.push(warns(p).length);
  ok(counts.join() === '4,3,2,1,0' && allOk(p), 'fixing one bug at a time (Drop to plate, Up 10, mast 3 mm, Group the porthole) leaves 4, 3, 2, 1, then 0 problems');
}
{ // 7 conditions: the slide's predictions, and 170 makes "no wider than 160" false
  const s = starter('print-7-bookmark'), r = Object.fromEntries(res(s).map(x => [x.k, x.ok]));
  const long = answer('print-7-bookmark'); long.objs[0].w = 170;
  ok(r.minw === false && r.maxw === true && r.maxh === false && rule(long, 'maxw') === false && rule(long, 'minw') === true, 'Rules that check themselves: the starter is 100 wide (≥ 140 false, ≤ 160 true) and 5 tall (≤ 3 false), as the slide predicts; 170 wide makes ≤ 160 false');
  const thick = answer('print-7-bookmark'); thick.objs[0].h = 4; ok(rule(thick, 'maxh') === false, 'and a 4 mm bookmark makes “no taller than 3” false');
}
{ // 8 between = two conditions: columns 65 to 85 work, 50 and 90 don't
  const col = h => { const p = answer('print-8-trophy'); p.objs[1].h = h; p.objs[2].z = 10 + h; return p; };
  const both = h => rule(col(h), 'minh') && rule(col(h), 'maxh');
  ok(both(65) && both(85) && !both(50) && !both(90) && rule(col(50), 'maxh') && !rule(col(50), 'minh') && !rule(starter('print-8-trophy'), 'maxh'), 'Between two numbers: columns of 65 and 85 make both height conditions true; 50 fails “at least 80”, 90 and the starter’s 110 fail “no taller than 100”');
}
{ // 9 the fit test card: 7.0, 7.4 … 8.6, each one cutting
  const a = ANS['print-9-fit'], hs = holesOf(a).sort((p, q) => p.x - q.x), ws = hs.map(h => h.w);
  const g = a.objs.find(o => o.kind === 'group');
  ok(ws.length === 5 && near(ws[0], 7) && ws.slice(1).every((w, i) => near(w - ws[i], 0.4)) && vol(g) < 96 * 22 * 3 - 5 * Math.PI * 12 * 3, 'Measure and test: 5 holes from the 7 mm input, each 0.4 mm wider (' + ws.join(', ') + '), all cut through the card');
}
{ // 10 repeat until: thin walls and one hole at the start; 3 mm walls and a drainage hole at the end
  const s = starter('print-10-pot'), a = ANS['print-10-pot'];
  ok(!rule(s, 'wall') && !rule(s, 'holes') && rule(a, 'wall') && holesOf(a).length === 2, 'Keep going until it ticks: the starter’s 1 mm walls fail “at least 2 mm”; the answer’s 3 mm walls and drainage hole pass');
  const thin = answer('print-10-pot'); const ins = thin.objs[0].children.find(c => c.hole && c.w > 20); ins.w = ins.d = 74.5; ok(!rule(thin, 'wall'), 'a hole 74.5 wide in a 76 pot (0.75 mm walls) unticks the walls rule again');
}
{ // 11 debug the conditions: the starter's rules fail even a correct tag; the fixed rules pass it
  const s = starter('print-11-tag'), right = answer('print-11-tag');
  const buggyRules = PM.cleanProject(right); buggyRules.brief = s.brief;
  const noHole = starter('print-11-tag'); noHole.brief = right.brief;
  ok(!allOk(buggyRules) && !rule(buggyRules, 'maxw') && !rule(buggyRules, 'minh') && !allOk(noHole) && !rule(noHole, 'hole') && allOk(right), 'Debug the rules: the starter’s buggy rules (no wider than 3, at least 4 tall) fail even the finished tag; with the rules fixed, the starter’s tag still needs its hole; the answer passes');
}
{ // 13 variables: wall = 3 → 44 × 34, floor 3; wall = 4 → 42 × 32, floor 4
  const at = wall => { const p = starter('print-13-box'); Object.assign(p.objs[1], { x: 0, w: 50 - 2 * wall, d: 40 - 2 * wall, z: wall }); md.group(p, ['o1', 'o2']); p.brief.rules[0].v = wall; return PM.cleanProject(p); };
  const w3 = ANS['print-13-box'], h = holesOf(w3)[0], w4 = at(4), w3as4 = PM.cleanProject(w3); w3as4.brief.rules[0].v = 4;
  ok(h.w === 44 && h.d === 34 && h.z === 3 && allOk(w4) && !rule(w3as4, 'wall') && !rule(starter('print-13-box'), 'wall'), 'Variables: wall = 3 gives a 44 × 34 hole with a 3 mm floor; changing wall to 4 (42 × 32, floor 4) meets “walls at least 4” and the wall = 3 box doesn’t');
}
{ // 14 one part, three sizes; change one copy and it's no longer the same part
  const a = ANS['print-14-knobs'], gs = a.objs.filter(o => o.kind === 'group');
  ok(gs.length === 3 && new Set(gs.map(g => g.w)).size === 3 && gs.map(g => g.w).sort((p, q) => p - q).join() === '24,36,48' && gs.every(g => near(g.h / g.w, gs[0].h / gs[0].w)), 'Make your own part: the knob group used 3 times at 24, 36 and 48 mm, keeping its shape');
  const changed = PM.cleanProject(a); changed.objs[2].children[1].h = 6; ok(!rule(changed, 'parts'), 'changing one copy’s cap makes it a different part, so “the same group 3 times” unticks');
}
{ // 16 data: thinner = less plastic; 30 of the starter don't fit on a 250 g reel, 30 of the answer do
  const g = p => md.estimate(p).grams;
  const thick = [6, 5, 4, 3].map(h => { const p = starter('print-16-medals'); p.objs[0].h = h; p.objs[1].z = h; return g(p); });
  const s = g(starter('print-16-medals')), a = g(ANS['print-16-medals']);
  ok(thick.every((v, i) => !i || v < thick[i - 1]) && s * 30 > 250 && a * 30 <= 250 && a <= 6, `Data: 6, 5, 4, 3 mm thick use ${thick.join(', ')} g (less each time); 30 × ${s} g = ${Math.round(s * 30)} g won’t fit on a 250 g reel, 30 × ${a} g = ${Math.round(a * 30)} g does`);
}
{ // 17 the formula: width = teeth × 2.5 for every gear; they print as separate gears
  const a = ANS['print-17-gears'], gs = a.objs.filter(o => o.kind === 'gear');
  ok(gs.length === 3 && gs.every(x => near(x.w, x.teeth * 2.5)) && new Set(gs.map(x => x.teeth)).size === 3 && !rule(starter('print-17-gears'), 'mesh') && md.exportWhole(a).pieces === 3,
    'Formulas: 12, 24 and 18 teeth at 30, 60 and 45 mm (width = teeth × 2.5) mesh; the starter’s 40 mm 24-tooth gear doesn’t; the three print as separate gears');
}
{ // projects: 6 (repeat + parts), 12 (own order with a range), 18 (range, wall, budget)
  const p12 = ANS['print-12-order'], ks = p12.brief.rules.map(r => r.k);
  const range = ['w', 'h'].some(d => ks.includes('min' + d) && ks.includes('max' + d));
  ok(!starter('print-12-order').brief && p12.brief.rules.length >= 4 && range && allOk(p12), 'Project — write the order: the example order has ' + p12.brief.rules.length + ' rules including a range (at least 30 AND no taller than 40) and its design meets them all; the starter has no order yet');
  ok(rule(ANS['print-6-gift'], 'repeat') && !rule(starter('print-6-gift'), 'shapes'), 'Project — a gift: the example repeats a post 4 times; the bare starter is empty');
  const f = ANS['print-18-fair']; ok(rule(f, 'parts') && rule(f, 'wall') && md.estimate(f).grams <= 40 && !allOk(starter('print-18-fair')), `Project — the fair: the example uses one pot part at two sizes, 3 mm walls and ${md.estimate(f).grams} g; the bare starter meets nothing`);
}

// ───────── in the real app ─────────
const site = await serve();
const b = await browser();
const errors = [];
try {
  const { page } = await openApp(b, site.url, { errors });
  await page.setViewportSize({ width: 1280, height: 800 });
  const card = () => page.evaluate(() => ({ el: !document.getElementById('plBrief').hidden, n: document.querySelectorAll('#plBrief li').length, okN: document.querySelectorAll('#plBrief li.ok').length }));
  for (const l of UNIT) {
    await page.evaluate(id => { clearDirty(); lessonOpenStarter(id); }, l.id); // not returned: a starter’s promise can be collected first
    await page.waitForFunction(id => typeof lessonActive !== 'undefined' && lessonActive && lessonActive.id === id && typeof p3dApp !== 'undefined' && p3dApp && p3dApp._model && p3dApp._model() && document.body.classList.contains('print3d-mode'), l.id, { timeout: 90000 });
    const s = starter(l.id), want = s.brief ? res(s).filter(r => r.ok).length : 0;
    if (s.brief) await page.waitForFunction(([n, k]) => document.querySelectorAll('#plBrief li').length === n && document.querySelectorAll('#plBrief li.ok').length === k, [s.brief.rules.length, want], { timeout: 20000 }).catch(() => {});
    else await page.waitForFunction(() => document.getElementById('plBrief').hidden, null, { timeout: 20000 }).catch(() => {});
    const c0 = await card(), title = await page.evaluate(() => p3dApp._proj().title), lg = await page.evaluate(() => !document.getElementById('lesson-guide').classList.contains('hide') && document.getElementById('lesson-guide').textContent);
    ok(lg && lg.includes(l.steps[0].t) && title === s.title && (s.brief ? c0.el && c0.n === s.brief.rules.length && c0.okN === want : !c0.el),
      `${l.id}: the starter opens in the Print Lab with its Lesson card` + (s.brief ? ` and challenge card (${c0.okN}/${c0.n} ticked, as in Node)` : ' (no challenge yet: pupils write it)'));
    if (ANS[l.id] && ANS[l.id].brief) {
      await page.evaluate(p => p3dApp.setProject(p), ANS[l.id]);
      const n = ANS[l.id].brief.rules.length;
      const got = await page.waitForFunction(n => document.querySelectorAll('#plBrief li.ok').length === n && document.querySelectorAll('#plBrief li').length === n, n, { timeout: 30000 }).then(() => true, () => false);
      ok(got, `${l.id}: with the ${/^Project/.test(l.title) ? 'example' : 'answer'} the challenge card ticks all ${n} rules`);
    }
  }

  // Lesson 4 click by click: Duplicate, type X and Y, four times; select all; Group
  const open = async id => {
    await page.evaluate(id => { clearDirty(); lessonOpenStarter(id); }, id);
    await page.waitForFunction(id => lessonActive && lessonActive.id === id && p3dApp._model() && p3dApp._proj().title, id, { timeout: 90000 });
    await page.evaluate(() => { window.cjConfirm = () => Promise.resolve(true); });
  };
  const type = async (f, v) => { await page.fill(`#plInsp [data-f="${f}"]`, String(v)); await page.press(`#plInsp [data-f="${f}"]`, 'Enter'); };
  await open('print-4-pencils');
  for (const x of [-15, 0, 15, 30]) {
    await page.evaluate(() => p3dApp._select([p3dApp._proj().objs.filter(o => o.hole).slice(-1)[0].id]));
    await page.click('#plDup'); await type('x', x); await type('y', 0);
  }
  await page.evaluate(() => p3dApp._select(p3dApp._proj().objs.map(o => o.id)));
  await page.click('#plGroup');
  ok(await page.waitForFunction(() => document.querySelectorAll('#plBrief li.ok').length === 4, null, { timeout: 20000 }).then(() => true, () => false), 'Repeat it, in the app: Duplicate + typing X and Y four times, then Group, ticks every rule');

  // Lesson 11 click by click: Change the challenge, fix the number and the comparison, Save the challenge
  await open('print-11-tag');
  await page.click('#plBriefEdit');
  await page.fill('.pl-rrow[data-i="0"] [data-rv]', '35');
  await page.selectOption('.pl-rrow[data-i="1"] [data-rk]', 'maxh');
  await page.fill('.pl-rrow[data-i="1"] [data-rv]', '4');
  await page.click('#plBSave');
  const rules = await page.evaluate(() => p3dApp._proj().brief.rules);
  ok(rules[0].k === 'maxw' && rules[0].v === 35 && rules[1].k === 'maxh' && rules[1].v === 4, 'Debug the rules, in the app: Change → fix 3 to 35 → choose “No taller than … mm” with 4 → Save the challenge');
  await page.evaluate(() => { const o = p3dApp._add('cylinder', true); o; });
  await type('w', 4); await type('d', 4); await type('h', 4); await type('z', -1); await type('x', 0); await type('y', 10);
  await page.evaluate(() => p3dApp._select([p3dApp._proj().objs[0].id, p3dApp._proj().objs.slice(-1)[0].id]));
  await page.click('#plGroup');
  ok(await page.waitForFunction(() => document.querySelectorAll('#plBrief li.ok').length === 5, null, { timeout: 20000 }).then(() => true, () => false), 'then a Hole cylinder grouped with the disc ticks all 5 rules');
  await page.click('#plBriefEdit');
  ok(await page.evaluate(() => { const r = [...document.querySelectorAll('.pl-rrow [data-rk]')].find(s => s.value === 'ready').closest('.pl-rrow'); return !r.querySelector('[data-rv]'); }), 'a rule with no number shows no number box in the challenge editor');
  await page.selectOption('.pl-rrow[data-i="0"] [data-rk]', 'mesh');
  ok(await page.evaluate(() => !document.querySelector('.pl-rrow[data-i="0"] [data-rv]')), '…and neither does the new “gears mesh” rule');
  await page.click('#plMClose');

  // Lesson 14 click by click: Group, Duplicate twice, Keep its shape + Width 36 / 48
  await open('print-14-knobs');
  await page.evaluate(() => p3dApp._select(p3dApp._proj().objs.map(o => o.id)));
  await page.click('#plGroup');
  for (const [w, x] of [[36, -10], [48, 45]]) {
    await page.evaluate(() => p3dApp._select([p3dApp._proj().objs[0].id]));
    await page.click('#plDup'); await type('x', x); await type('y', 0);
    await page.check('#plKeep'); await type('w', w);
  }
  await page.evaluate(() => p3dApp._select([p3dApp._proj().objs[0].id])); await type('x', -50);
  const kn = await page.evaluate(() => p3dApp._proj().objs.map(o => [o.kind, o.w, o.h]));
  ok(kn.length === 3 && kn.every(k => k[0] === 'group') && kn.map(k => k[1]).join() === '24,36,48' && Math.abs(kn[2][2] / kn[0][2] - 2) < 0.02, 'Make your own part, in the app: Group, Duplicate, tick Keep its shape and type Width 36 and 48 (' + kn.map(k => k[1] + '×' + k[2]).join(', ') + ')');
  ok(await page.waitForFunction(() => document.querySelectorAll('#plBrief li.ok').length === 3, null, { timeout: 20000 }).then(() => true, () => false), '…and every rule ticks');

  // Lesson 16: Check & print shows the plastic the data table needs
  await open('print-16-medals');
  await page.click('#plPrintBtn');
  const g0 = await page.evaluate(() => document.querySelector('.pl-facts').textContent);
  await page.click('#plMClose');
  ok(new RegExp('about ' + md.estimate(starter('print-16-medals')).grams + ' g').test(g0), 'Data, in the app: Check & print shows the medal’s plastic (' + (g0.match(/about [\d.]+ g/) || [''])[0] + ') for the table');

  ok(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
