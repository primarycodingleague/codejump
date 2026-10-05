// Ready-made lessons: every lesson is complete, its starter opens with the Lesson card, the card's steps and the
// payload work, the library screens work, and — most importantly — following each lesson really gives the result
// the lesson promises (the cat reaches the star, the fixed dance comes home, catching a star scores, and so on).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, serve, browser, openApp, ok, done, sleep } from './lib.mjs';

const { LESSONS } = await import(join(ROOT, 'lessons', 'lessons.js'));
ok(LESSONS.length >= 8 && new Set(LESSONS.map(l => l.id)).size === LESSONS.length, LESSONS.length + ' lessons with different ids');
for (const l of LESSONS) {
  const full = ['title', 'ks', 'years', 'minutes', 'type', 'tool', 'summary', 'objective'].every(k => l[k]) &&
    ['success', 'curriculum', 'words', 'need', 'plan', 'assess', 'steps'].every(k => Array.isArray(l[k]) && l[k].length) && l.support && l.stretch;
  const mins = l.plan.reduce((a, p) => a + p.min, 0);
  ok(full && l.steps.length >= 5 && Math.abs(mins - l.minutes) <= 5 && existsSync(join(ROOT, 'lessons', 'starters', l.id + '.json')) && existsSync(join(ROOT, 'lessons', 'pics', l.id + '.jpg')),
    `${l.id}: complete (plan ${mins} of ${l.minutes} min, ${l.steps.length} pupil steps, starter + picture)`);
}

const { CURRICULA, curriculumLinks } = await import(join(ROOT, 'lessons', 'curricula.js'));
for (const c of Object.keys(CURRICULA)) {
  const empty = LESSONS.filter(l => !curriculumLinks(c, l.curriculum).items.length).map(l => l.id);
  ok(CURRICULA[c].framework && !empty.length, `${c}: curriculum links for every lesson${empty.length ? ' (missing: ' + empty.join(', ') + ')' : ''}`);
}

const site = await serve();
const b = await browser();
const errors = [], assigned = [];
const cloud = async (path, method, body) => {
  if (path === '/me') return { json: { uid: 't1', displayName: 'mrtest', realName: 'Mr Test', role: 'teacher', classes: [{ code: 'ABCD', name: '4B' }], projects: [] } };
  if (path === '/class/assign') { assigned.push(JSON.parse(body)); return { json: { count: 27 } }; }
  return { status: 404, json: {} };
};
const step = (page, fn, arg) => page.evaluate(fn, arg);
const run = (page, frames) => page.evaluate(n => { stageStart(); for (let i = 0; i < n; i++) stageFrame(); }, frames);
try {
  const { page } = await openApp(b, site.url, { errors, cloud, init: () => { localStorage.setItem('bap_cloud_token', 'tok'); localStorage.setItem('cj_country', 'england'); } });
  await page.waitForFunction(() => typeof cloudMe !== 'undefined' && cloudMe && cloudMe.role === 'teacher', null, { timeout: 10000 }).catch(() => {});

  // ---- the library
  await page.click('#h-lessons');
  await page.waitForSelector('.ls-card');
  ok(await page.$$eval('.ls-card', c => c.length) === LESSONS.length, 'Ready-made lessons (home page) lists every lesson');
  await page.click('.ls-chip[data-f="ks1"]');
  ok(await page.$$eval('.ls-card', c => c.length) === LESSONS.filter(l => l.ks === 'ks1').length, 'the Key Stage 1 filter works');
  await page.click('.ls-card');
  await page.waitForSelector('#ls-open');
  const detail = await page.textContent('#ls-body');
  ok(/We are learning to/.test(detail) && /National Curriculum/.test(detail) && /Lesson plan/.test(detail) && /Key words/.test(detail), 'a lesson shows its plan, curriculum links and key words');
  // ---- country: the curriculum links, school-year names and the age chooser follow the teacher's country
  await page.selectOption('#ls-country', 'usa');
  await page.waitForFunction(() => /Grades K–1/.test(document.getElementById('ls-body').textContent));
  const us = await page.textContent('#ls-body');
  ok(!/National Curriculum \(computing\)/.test(us) && /CSTA/.test(us), 'choosing the United States shows its curriculum links and grade names');
  ok(await page.evaluate(() => localStorage.getItem('cj_country') === 'usa' && /Grades K–2/.test(document.querySelector('#ks-modal .ks-opt[data-ks="ks1"]').textContent)), 'the country is remembered and renames the age groups in the age chooser');
  await page.selectOption('#ls-country', 'scotland');
  await page.waitForFunction(() => /P2–P3/.test(document.getElementById('ls-body').textContent));
  ok(/Curriculum for Excellence/.test(await page.textContent('#ls-body')), 'Scotland shows Curriculum for Excellence links');
  await page.selectOption('#ls-country', 'england');
  await page.waitForFunction(() => /National Curriculum/.test(document.getElementById('ls-body').textContent));
  await page.evaluate(() => { window.__printed = ''; doPrint = h => { window.__printed = h; }; });
  await page.click('#ls-print');
  ok(/Lesson plan/.test(await page.evaluate(() => window.__printed)), 'Print lesson plan prints the plan');
  // ---- slides: present, move with keys/buttons, notes, print, presenter view, open the starter
  await page.click('#ls-print-slides');
  ok((await page.evaluate(() => (window.__printed.match(/class="lp-pslide"/g) || []).length)) >= 8, 'Print slides prints every slide, one per page');
  await page.click('#ls-present-btn');
  await page.waitForSelector('#ls-present:not(.hide) .lp-slide');
  const deckLen = await page.evaluate(() => _lp.deck.length);
  ok(deckLen === 4 + LESSONS[0].slides.filter(x => !x.use).length + 1, 'the deck = title, objective, key words, the lesson’s slides, Your turn and How did we do?');
  ok(/Get the cat to the star/i.test(await page.textContent('#lp-stage')) && await page.textContent('#lp-count') === '1 / ' + deckLen, 'the slides open on the title slide');
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
  ok(/Key words/i.test(await page.textContent('#lp-stage')), 'the arrow keys move through the slides');
  await page.click('#lp-prev');
  ok(/We are learning to/i.test(await page.textContent('#lp-stage')), 'the Back button goes back a slide');
  ok(await page.evaluate(() => document.getElementById('lp-notes').classList.contains('hide')), 'teacher notes are hidden at first');
  await page.keyboard.press('n');
  ok(await page.evaluate(() => !document.getElementById('lp-notes').classList.contains('hide') && /Read the objective/.test(document.getElementById('lp-notes').textContent)), 'N shows the teacher notes');
  await page.keyboard.press('End');
  ok(/How did we do/i.test(await page.textContent('#lp-stage')), 'End goes to the last slide (How did we do?)');
  await page.evaluate(() => lpGo(_lp.deck.findIndex(s => s.kind === 'steps')));
  ok((await page.$$eval('.lp-steps li', l => l.length)) === LESSONS[0].steps.length, 'the Your turn slide lists the pupils’ Lesson-card steps');
  const [pv] = await Promise.all([page.waitForEvent('popup'), page.click('#lp-pview')]);
  await pv.waitForSelector('#pv-cur .lp-slide');
  await page.keyboard.press('ArrowRight');
  ok(/Show and tell/i.test(await pv.textContent('#pv-cur')) && /Two or three pupils/.test(await pv.textContent('#pv-notes')), 'Presenter view follows the slides and shows the notes');
  await pv.keyboard.press('ArrowLeft');
  ok(/Your turn/i.test(await page.textContent('#lp-stage')), 'keys pressed in Presenter view move the board too');
  await page.keyboard.press('Escape');
  ok(await page.evaluate(() => document.getElementById('ls-present').classList.contains('hide')) && pv.isClosed(), 'Escape closes the slides and the Presenter view');
  await page.click('#ls-give');
  await page.waitForSelector('#ls-give-box [data-code="ABCD"]');
  await page.click('#ls-give-box [data-code="ABCD"]');
  await page.waitForFunction(() => /Sent!/.test(document.getElementById('ls-give-box').textContent));
  ok(assigned.length === 1 && assigned[0].code === 'ABCD' && assigned[0].payload.lesson && assigned[0].payload.lesson.id === 'cat-to-star', 'Give to my class sends the starter (with its Lesson card) to the class');
  await page.click('#ls-close');

  // ---- the home page's For teachers section shows lessons you can open
  await page.evaluate(() => { showHome(); document.getElementById('home-teachers').scrollIntoView(); });
  await page.waitForSelector('#h-lesson-strip .hm-lcard');
  ok((await page.$$eval('#h-lesson-strip .hm-lcard', c => c.length)) === 4, 'the For teachers section shows four lessons');
  await page.click('#h-lesson-strip .hm-lcard >> nth=1');
  await page.waitForSelector('#ls-present-btn');
  ok(await page.textContent('#ls-title') === LESSONS.find(l => l.id === 'turtle-shapes').title, 'tapping a lesson picture opens that lesson');
  await page.click('#ls-close');
  await page.click('#h-showdown-lesson');
  await page.waitForSelector('#ls-present-btn');
  ok(/Critter engineers/.test(await page.textContent('#ls-title')), 'the Critter Showdown card opens the Critter lesson');
  await page.click('#ls-close');

  // ---- the Teacher Hub lists every lesson as a picture card
  await page.evaluate(() => showTeacher());
  await page.waitForSelector('#th-lesson-strip .hm-lcard');
  ok((await page.$$eval('#th-lesson-strip .hm-lcard', c => c.length)) === LESSONS.length, 'the Teacher Hub shows every lesson');
  await page.click('#th-lesson-strip .hm-lcard >> nth=0');
  await page.waitForSelector('#ls-present-btn');
  ok(await page.textContent('#ls-title') === LESSONS[0].title, 'tapping a lesson in the Hub opens it');
  await page.click('#ls-close');
  await page.evaluate(() => hideTeacher());

  // ---- every starter opens as the right project type with its Lesson card
  for (const l of LESSONS) {
    await page.evaluate(() => clearDirty());
    await page.evaluate(id => lessonOpenStarter(id), l.id);
    await page.waitForFunction(id => lessonActive && lessonActive.id === id && !document.getElementById('lesson-guide').classList.contains('hide'), l.id, { timeout: 60000 });
    const s = await page.evaluate(() => ({ type: projectType, t: document.getElementById('lg-t').textContent, n: document.getElementById('lg-count').textContent }));
    ok(s.type === l.type && s.t === l.steps[0].t && s.n === 'Step 1 of ' + l.steps.length, `${l.id}: opens as ${l.type} with its Lesson card`);
  }
  ok(errors.length === 0, 'no errors opening the starters' + (errors.length ? ': ' + errors.join(' | ') : ''));

  // ---- the Lesson card: next/back, minimise, and it is saved with the work
  await page.evaluate(() => lessonOpenStarter('turtle-shapes'));
  await page.waitForFunction(() => projectType === 'turtle');
  await page.click('#lg-next'); await page.click('#lg-next');
  ok(await page.evaluate(() => lessonActive.step === 2 && /Step 3/.test(document.getElementById('lg-count').textContent)), 'Next moves through the steps');
  await page.click('#lg-prev');
  ok(await page.evaluate(() => lessonActive.step === 1), 'Back goes back a step');
  const saved = await page.evaluate(() => JSON.stringify(buildPayload()));
  ok(JSON.parse(saved).lesson && JSON.parse(saved).lesson.step === 1, 'the lesson and step are saved with the project');
  await page.evaluate(() => { startNewProject('ks2'); document.getElementById('tutorial').classList.add('hide'); });
  ok(await page.evaluate(() => !lessonActive && document.getElementById('lesson-guide').classList.contains('hide')), 'a new project has no Lesson card');
  await page.evaluate(j => applyPayload(JSON.parse(j)), saved);
  ok(await page.evaluate(() => lessonActive && lessonActive.step === 1 && !document.getElementById('lesson-guide').classList.contains('hide')), 'reopening the saved work brings the card back at the same step');
  await page.click('#lg-min');
  ok(await page.evaluate(() => document.getElementById('lesson-guide').classList.contains('min')), 'the card folds away');
  await page.evaluate(() => document.getElementById('lesson-guide').classList.remove('min'));
  await page.evaluate(() => showHome());
  ok(await page.evaluate(() => document.getElementById('lesson-guide').classList.contains('hide')), 'the card hides on the home screen');

  // ---- following each lesson gives the promised result
  // Get the cat to the star: flag + move right 5
  await page.evaluate(() => { clearDirty(); return lessonOpenStarter('cat-to-star'); });
  await page.waitForFunction(() => projectType === 'stage' && keyStage === 'ks1');
  const reach = await page.evaluate(() => { const [cat, star] = stageState.sprites; cat.ks1 = [[{ t: 'flag' }, { t: 'right', n: 5 }]]; stageStart(); for (let i = 0; i < 200; i++) stageFrame(); const r = { cat: cat.x, star: star.x }; stageStop(); return r; });
  ok(Math.abs(reach.cat - reach.star) < 4, 'Get the cat to the star: “move right 5” reaches the star (' + reach.cat + ' vs ' + reach.star + ')');
  // Fix the dance: the starter does not come home; the fixed dance does
  await page.evaluate(() => { clearDirty(); return lessonOpenStarter('fix-the-dance'); });
  await page.waitForFunction(() => projectType === 'stage' && stageState.sprites[0].ks1.length);
  const dance = await page.evaluate(() => {
    const cat = stageState.sprites[0], x0 = cat.x, go = () => { stageStart(); for (let i = 0; i < 400; i++) stageFrame(); const x = cat.x; stageStop(); return x; };
    const buggy = go();
    cat.ks1 = [[{ t: 'flag' }, { t: 'right', n: 3 }, { t: 'hop', n: 1 }, { t: 'left', n: 3 }, { t: 'say', text: 'Ta-da!' }]];
    return { x0, buggy, fixed: go() };
  });
  ok(dance.buggy !== dance.x0 && Math.abs(dance.fixed - dance.x0) < 1, 'Fix the dance: the buggy dance ends in the wrong place, the fixed one comes home ' + JSON.stringify(dance));
  // Make a level: the starter has Start, Finish and a gap; a bridge makes it complete
  await page.evaluate(() => { clearDirty(); return lessonOpenStarter('level-for-a-friend'); });
  await page.waitForFunction(() => projectType === 'platformer');
  const lvl = await page.evaluate(() => { let st = 0, go = 0, gap = 0; for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { if (grid[r][c] === T.START) st++; if (grid[r][c] === T.GOAL) go++; } for (let c = 0; c < COLS; c++) if (grid[ROWS - 1][c] === T.EMPTY) gap++; return { st, go, gap, ks: keyStage }; });
  ok(lvl.st === 1 && lvl.go === 1 && lvl.gap >= 4 && lvl.ks === 'ks1', 'Make a level: Start, Finish and a gap to bridge (KS1) ' + JSON.stringify(lvl));
  // Shapes with repeat: one repeat line draws a closed triangle
  await page.evaluate(() => { clearDirty(); return lessonOpenStarter('turtle-shapes'); });
  await page.waitForFunction(() => projectType === 'turtle');
  await page.evaluate(() => { document.getElementById('turtle-code').value = 'repeat 3 [fd 100 rt 120]'; turtleSpeed = 10; turtleRun(); });
  await page.waitForFunction(() => /Done/.test(document.getElementById('turtle-status').textContent), null, { timeout: 10000 }).catch(() => {});
  const tri = await page.evaluate(() => ({ s: document.getElementById('turtle-status').textContent.trim(), x: turtle.x, y: turtle.y }));
  ok(/Done/.test(tri.s) && Math.abs(tri.x) < 0.01 && Math.abs(tri.y) < 0.01, 'Shapes with repeat: repeat 3 [fd 100 rt 120] closes the triangle ' + JSON.stringify(tri));
  // Catch the stars: nothing scores at first; the lesson's if-touching block scores
  await page.evaluate(() => { clearDirty(); return lessonOpenStarter('catch-the-stars'); });
  await page.waitForFunction(() => projectType === 'stage' && stageState.sprites.length === 2 && blocklyWorkspace);
  const before = await page.evaluate(() => { stageStart(); for (let i = 0; i < 160; i++) stageFrame(); const s = stScore; stageStop(); return s; });
  const after = await page.evaluate(() => {
    const star = stageState.sprites[1];
    star.xml = star.xml.replace('</statement></block></next></block></statement></block>', '</statement><next><block type="st_if"><value name="COND"><block type="st_touching"><field name="TARGET">Catcher</field></block></value><statement name="DO"><block type="st_change_score"><field name="N">1</field><next><block type="st_goto"><field name="WHERE">_random</field><next><block type="st_set_y"><field name="Y">170</field></block></next></block></next></block></statement></block></next></block></next></block></statement></block>');
    stageSel = 1; stageLoadSpriteScripts(1);
    stageStart(); for (let i = 0; i < 160; i++) stageFrame(); const s = stScore; stageStop(); return s;
  });
  ok(before === 0 && after >= 1, 'Catch the stars: the starter does not score; adding the if-touching block does (' + before + ' → ' + after + ')');
  // Rock, paper, scissors: shaking picks 1–3 and shows rock for 1; the Python version is right
  await page.evaluate(() => { clearDirty(); return lessonOpenStarter('microbit-rps'); });
  await page.waitForFunction(() => projectType === 'stage' && blocklyWorkspace && blocklyWorkspace.getAllBlocks(false).length > 4);
  const rps = await page.evaluate(() => {
    const m = stageState.sprites[0], seen = new Set(); let rock = false;
    stageStart(); for (let i = 0; i < 5; i++) stageFrame();
    for (let k = 0; k < 40; k++) { stMbShake(m); for (let i = 0; i < 3; i++) stageFrame(); seen.add(stVars.hand); if (stVars.hand === 1) rock = rock || mbState(m).leds.join('').replace(/[1-9]/g, '1') === '0000001110011100111000000'; }
    stageStop();
    return { seen: [...seen].sort(), rock, py: mbToPython() };
  });
  ok(rps.seen.join() === '1,2,3', 'Rock, paper, scissors: shaking picks 1, 2 or 3 (' + rps.seen + ')');
  ok(rps.rock, 'Rock, paper, scissors: hand 1 shows the rock picture');
  ok(/random\.randint\(1, ?3\)/.test(rps.py) && /if \(?hand == 1\)?:/.test(rps.py) && /accelerometer\.was_gesture\('shake'\)/.test(rps.py), 'Rock, paper, scissors: the real-micro:bit (Python) version is right');

  // Critter engineers: a back foot's Motion tab has Opposite beat, and it changes that foot's timing
  await page.evaluate(() => { clearDirty(); return lessonOpenStarter('critter-engineers'); });
  await page.waitForFunction(() => projectType === 'critter' && critterApp && critterApp.getCritter().blocks.length > 5, null, { timeout: 60000 });
  const foot = await page.evaluate(() => { const z = critterApp.getCritter(), body = z.blocks[0].id; const top = b => { let p = b; while (p.mount && p.mount.parent !== body) p = z.blocks.find(x => x.id === p.mount.parent); return p; };
    const f = z.blocks.find(b => b.path && top(b).mount.at[0] < 0); critterApp._select(f.id); return { id: f.id, phase: f.path.phase }; });
  await page.click('#zInspector .zl-tabs button[data-tab="motion"]');
  await page.click('#iFlip');
  const flipped = await page.evaluate(id => critterApp.getCritter().blocks.find(b => b.id === id).path.phase, foot.id);
  ok(Math.abs(((flipped - foot.phase + 1) % 1) - 0.5) < 1e-9, 'Critter engineers: a back foot → Motion tab → Opposite beat flips its timing (' + foot.phase + ' → ' + flipped + ')');
  ok(await page.evaluate(() => /Beat chart/.test(document.body.textContent)), 'Critter engineers: the beat chart the lesson mentions is there');

  await page.evaluate(() => { clearDirty(); return lessonOpenStarter('teach-the-computer'); });
  await page.waitForFunction(() => projectType === 'ai' && aiApp && aiApp._ws() && aiApp._labels().length === 2, null, { timeout: 30000 });
  const ai = await page.evaluate(async () => {
    const M = await import(aiBase() + 'ai-model.js'), wait = () => new Promise(r => { const t = setInterval(() => { if (aiApp._brain() && !aiApp._training()) { clearInterval(t); r(); } }, 50); });
    aiApp.show('train'); document.getElementById('alTrain').click(); await wait();
    const sq = M.sampleDrawing('square', 31), before = M.guess(aiApp._brain(), sq);
    // the lesson: add a square label with six varied squares, and more circles and triangles, then train again
    const P = aiApp.getProject(), more = M.sampleLabels('shapes', 6, 99);
    P.labels = P.labels.map(l => ({ ...l, ex: l.ex.concat(more.find(m => m.name === l.name).ex) })).concat([{ name: 'square', ex: more.find(m => m.name === 'square').ex }]);
    aiApp.setProject(P); aiApp.show('train'); document.getElementById('alTrain').click(); await wait();
    let right = 0; for (let s = 300; s < 310; s++) for (const n of ['circle', 'square', 'triangle']) if (M.guess(aiApp._brain(), M.sampleDrawing(n, s)).label === n) right++;
    return { before: before.label, after: M.guess(aiApp._brain(), sq).label, right, check: aiApp._brain().check.total };
  });
  ok(ai.before !== 'square', 'Teach the computer: the starter AI can’t recognise a square (it says ' + ai.before + ')');
  ok(ai.after === 'square' && ai.right >= 27 && ai.check > 0, 'Teach the computer: after teaching squares and more examples it gets them right ' + JSON.stringify(ai));
  ok(errors.length === 0, 'no errors while following the lessons' + (errors.length ? ': ' + errors.join(' | ') : ''));
} catch (e) {
  ok(false, 'the lessons browser test stopped: ' + (e && e.message));
} finally {
  await b.close(); site.close();
}
done();
