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
  ok(CURRICULA[c].framework && (CURRICULA[c].none ? CURRICULA[c].note : !empty.length), CURRICULA[c].none ? `${c}: no computing strand, so every lesson shows the explanatory note` : `${c}: curriculum links for every lesson${empty.length ? ' (missing: ' + empty.join(', ') + ')' : ''}`);
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
  await page.click('.ls-card[data-id="cat-to-star"]');
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
    await page.evaluate(id => { lessonOpenStarter(id); }, l.id); // not awaited in the page: a big starter's promise can be collected before it resolves
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
  await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('cat-to-star'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'cat-to-star', { timeout: 60000 });
  await page.waitForFunction(() => projectType === 'stage' && keyStage === 'ks1');
  const reach = await page.evaluate(() => { const [cat, star] = stageState.sprites; cat.ks1 = [[{ t: 'flag' }, { t: 'right', n: 5 }]]; stageStart(); for (let i = 0; i < 200; i++) stageFrame(); const r = { cat: cat.x, star: star.x }; stageStop(); return r; });
  ok(Math.abs(reach.cat - reach.star) < 4, 'Get the cat to the star: “move right 5” reaches the star (' + reach.cat + ' vs ' + reach.star + ')');
  // Fix the dance: the starter does not come home; the fixed dance does
  await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('fix-the-dance'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'fix-the-dance', { timeout: 60000 });
  await page.waitForFunction(() => projectType === 'stage' && stageState.sprites[0].ks1.length);
  const dance = await page.evaluate(() => {
    const cat = stageState.sprites[0], x0 = cat.x, go = () => { stageStart(); for (let i = 0; i < 400; i++) stageFrame(); const x = cat.x; stageStop(); return x; };
    const buggy = go();
    cat.ks1 = [[{ t: 'flag' }, { t: 'right', n: 3 }, { t: 'hop', n: 1 }, { t: 'left', n: 3 }, { t: 'say', text: 'Ta-da!' }]];
    return { x0, buggy, fixed: go() };
  });
  ok(dance.buggy !== dance.x0 && Math.abs(dance.fixed - dance.x0) < 1, 'Fix the dance: the buggy dance ends in the wrong place, the fixed one comes home ' + JSON.stringify(dance));
  // Make a level: the starter has Start, Finish and a gap; a bridge makes it complete
  await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('level-for-a-friend'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'level-for-a-friend', { timeout: 60000 });
  await page.waitForFunction(() => projectType === 'platformer');
  const lvl = await page.evaluate(() => { let st = 0, go = 0, gap = 0; for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { if (grid[r][c] === T.START) st++; if (grid[r][c] === T.GOAL) go++; } for (let c = 0; c < COLS; c++) if (grid[ROWS - 1][c] === T.EMPTY) gap++; return { st, go, gap, ks: keyStage }; });
  ok(lvl.st === 1 && lvl.go === 1 && lvl.gap >= 4 && lvl.ks === 'ks1', 'Make a level: Start, Finish and a gap to bridge (KS1) ' + JSON.stringify(lvl));
  // Shapes with repeat: one repeat line draws a closed triangle
  await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('turtle-shapes'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'turtle-shapes', { timeout: 60000 });
  await page.waitForFunction(() => projectType === 'turtle');
  await page.evaluate(() => { document.getElementById('turtle-code').value = 'repeat 3 [fd 100 rt 120]'; turtleSpeed = 10; turtleRun(); });
  await page.waitForFunction(() => /Done/.test(document.getElementById('turtle-status').textContent), null, { timeout: 10000 }).catch(() => {});
  const tri = await page.evaluate(() => ({ s: document.getElementById('turtle-status').textContent.trim(), x: turtle.x, y: turtle.y }));
  ok(/Done/.test(tri.s) && Math.abs(tri.x) < 0.01 && Math.abs(tri.y) < 0.01, 'Shapes with repeat: repeat 3 [fd 100 rt 120] closes the triangle ' + JSON.stringify(tri));
  // Catch the stars: nothing scores at first; the lesson's if-touching block scores
  await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('catch-the-stars'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'catch-the-stars', { timeout: 60000 });
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
  await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('microbit-rps'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'microbit-rps', { timeout: 60000 });
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
  await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('critter-engineers'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'critter-engineers', { timeout: 60000 });
  await page.waitForFunction(() => projectType === 'critter' && critterApp && critterApp.getCritter().blocks.length > 5, null, { timeout: 60000 });
  const foot = await page.evaluate(() => { const z = critterApp.getCritter(), body = z.blocks[0].id; const top = b => { let p = b; while (p.mount && p.mount.parent !== body) p = z.blocks.find(x => x.id === p.mount.parent); return p; };
    const f = z.blocks.find(b => b.path && top(b).mount.at[0] < 0); critterApp._select(f.id); return { id: f.id, phase: f.path.phase }; });
  await page.click('#zInspector .zl-tabs button[data-tab="motion"]');
  await page.click('#iFlip');
  const flipped = await page.evaluate(id => critterApp.getCritter().blocks.find(b => b.id === id).path.phase, foot.id);
  ok(Math.abs(((flipped - foot.phase + 1) % 1) - 0.5) < 1e-9, 'Critter engineers: a back foot → Motion tab → Opposite beat flips its timing (' + foot.phase + ' → ' + flipped + ')');
  ok(await page.evaluate(() => /Beat chart/.test(document.body.textContent)), 'Critter engineers: the beat chart the lesson mentions is there');

  await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('teach-the-computer'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'teach-the-computer', { timeout: 60000 });
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

  // Smart trains: the finished lesson program — red event counts laps, if laps < 3 straight else right — goes round 3 times, then to the depot
  await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('smart-trains'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'smart-trains', { timeout: 60000 });
  await page.waitForFunction(() => projectType === 'train' && trainApp && trainApp._ws() && trainApp._proj().dests.length === 2, null, { timeout: 30000 });
  const starterOk = await page.evaluate(() => { const ws = trainApp._ws(), tops = ws.getTopBlocks(); return tops.length === 1 && tops[0].type === 'tr_when_run' && /Smart trains/.test(document.getElementById('lesson-guide').textContent); });
  ok(starterOk, 'Smart trains: the starter opens with “when Run is clicked → drive”, a station and a depot, and its Lesson card');
  const trains = await page.evaluate(async () => {
    const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } }), V = { type: 'variables_get', fields: { VAR: { id: 'laps' } } };
    const P = trainApp.getProject();
    P.blocks = { blocks: { languageVersion: 0, blocks: [
      { type: 'tr_when_run', x: 20, y: 20, next: { block: { type: 'variables_set', fields: { VAR: { id: 'laps' } }, inputs: { VALUE: N(0) }, next: { block: { type: 't1_startDriving', fields: { DIRECTION: '1' }, inputs: { SPEED: N(45) } } } } } },
      { type: 't1_whenColorChanged', x: 20, y: 200, fields: { COLOR: '1' }, next: { block: { type: 't1_setLedColorPicker', fields: { LEDGROUP: '1', COLOR: '#ff0000' }, next: { block: { type: 'math_change', fields: { VAR: { id: 'laps' } }, inputs: { DELTA: N(1) },
        next: { block: { type: 'controls_if', extraState: { hasElse: true }, inputs: {
          IF0: { block: { type: 'logic_compare', fields: { OP: 'LT' }, inputs: { A: { block: V }, B: N(3) } } },
          DO0: { block: { type: 't1_setNextSplitDecision', fields: { SIDE: '3' } } }, ELSE: { block: { type: 't1_setNextSplitDecision', fields: { SIDE: '2' } } } } } } } } } } }
    ] }, variables: [{ name: 'laps', id: 'laps' }] };
    trainApp.setProject(P); trainApp.run();
    const seen = [];
    return await new Promise(res => {
      const t0 = Date.now(), iv = setInterval(() => {
        const tr = trainApp._sim().trains[0], laps = trainApp._runner()._vars().laps;
        if (seen[seen.length - 1] !== tr.p) seen.push(tr.p);
        if (tr.p === 18 || tr.p === 19 || Date.now() - t0 > 60000) { clearInterval(iv); trainApp.stop(); res({ laps, seen: seen.join(','), top: tr.top, shown: document.getElementById('tlVars').textContent }); }
      }, 50);
    });
  });
  const loopsBefore = trains.seen.split(',').map(Number).filter(p => p === 18 || p === 19).length;
  ok(trains.laps === 3 && loopsBefore === 1 && trains.top === '#ff0000' && /laps\s*3/.test(trains.shown), 'Smart trains: it goes straight on for laps 1 and 2, then turns off to the depot after lap 3 (laps shows on the board) ' + JSON.stringify({ laps: trains.laps, top: trains.top, shown: trains.shown }));
  // ---- level-designers (Years 3–4)
  {
    // Level designers: the controls are backwards until the two events are fixed; the high gem can't be reached, so
    // "win by collecting all gems" can't be met; steps up to it make the game winnable; the pupils' own rules work.
    await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('level-designers'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'level-designers', { timeout: 60000 });
    await page.waitForFunction(() => projectType === 'platformer' && keyStage === 'ks2' && grid.flat().filter(v => v === T.GEM).length === 3);
    {
      const click = id => page.evaluate(id => document.getElementById(id).click(), id);
      const place = (c, r) => page.evaluate(([c, r]) => { player.x = c * TS + (TS - PW) / 2; player.y = r * TS + (TS - PH); player.vx = player.vy = 0; }, [c, r]);
      const hold = async (key, ms) => { await page.keyboard.down(key); await sleep(ms); await page.keyboard.up(key); };
      const gem = (r, c) => page.evaluate(([r, c]) => !!(items.find(it => it.r === r && it.c === c) || {}).got, [r, c]);
      const won = () => page.evaluate(() => !document.getElementById('ov-win').classList.contains('hide'));
      const code = async () => { await click('btn-code'); await page.waitForFunction(() => blocklyWorkspace && mode === 'code' && blocklyWorkspace.getAllBlocks(false).some(b => b.type === 'win_collect_gems')); };
      const test = async () => { await click('cp-run'); await page.waitForFunction(() => mode === 'play' && playing && player); await sleep(400); };
      const R = await page.evaluate(() => ROWS), G = await page.evaluate(() => COLS - 2);
      await code();
      const prog = await page.evaluate(() => blocklyWorkspace.getTopBlocks(true).map(b => b.type + (b.getField('KEY') ? ':' + b.getFieldValue('KEY') : '') + '>' + (b.getNextBlock() || {}).type).join(' | '));
      ok(/when_key_pressed:left>player_move_right/.test(prog) && /when_key_pressed:right>player_move_left/.test(prog) && /when_game_starts>win_collect_gems/.test(prog), 'Level designers: Code shows the events (with the swapped keys) and the rules');
      await test();
      let x0 = await page.evaluate(() => player.x); await hold('ArrowRight', 700); let x1 = await page.evaluate(() => player.x);
      ok(x1 < x0 - 20, 'Level designers: bug 1 — the Right Arrow moves the player left (' + Math.round(x0) + ' → ' + Math.round(x1) + ')');
      await code();
      await page.evaluate(() => blocklyWorkspace.getTopBlocks(false).forEach(b => { const n = b.getNextBlock(); if (b.type !== 'when_key_pressed' || !n) return; if (n.type === 'player_move_right') b.setFieldValue('right', 'KEY'); if (n.type === 'player_move_left') b.setFieldValue('left', 'KEY'); }));
      await test();
      x0 = await page.evaluate(() => player.x); await hold('ArrowRight', 700); x1 = await page.evaluate(() => player.x);
      ok(x1 > x0 + 20, 'Level designers: fixing the two events makes the Right Arrow move right (' + Math.round(x0) + ' → ' + Math.round(x1) + ')');
      await place(14, R - 2); await sleep(300); await hold('Space', 150); await sleep(1300);
      const reached = await gem(R - 7, 14);
      await place(5, R - 4); await sleep(300); await place(11, R - 2); await sleep(300); await place(G, R - 2); await sleep(400);
      const blocked = await page.evaluate(() => ({ win: !document.getElementById('ov-win').classList.contains('hide'), toast: document.getElementById('toast').textContent }));
      ok(!reached && !blocked.win && /Collect all the gems first/.test(blocked.toast), 'Level designers: bug 2 — the high gem can’t be reached by jumping, so the Finish doesn’t win (“' + blocked.toast + '”)');
      await click('btn-build');
      await page.evaluate(() => { for (let c = 13; c <= 15; c++) grid[ROWS - 3][c] = T.PLATFORM; commitLevel(); });
      await test();
      await place(14, R - 4); await sleep(300); await hold('Space', 150); await sleep(1300);
      const got = await gem(R - 7, 14);
      for (const [c, r] of [[5, R - 4], [11, R - 2]]) { await place(c, r); await sleep(300); }
      await place(G, R - 2); await sleep(500);
      ok(got && await won() && await page.evaluate(() => score === 30), 'Level designers: with a platform as a step the high gem is collected and the game is won');
      await code();
      await page.evaluate(() => {
        const ws = blocklyWorkspace; ws.getAllBlocks(false).find(b => b.type === 'set_lives').setFieldValue(5, 'LIVES');
        const msg = ws.newBlock('win_message'); msg.initSvg(); msg.render(); msg.setFieldValue('Well played!', 'MSG');
        ws.getAllBlocks(false).find(b => b.type === 'set_music').nextConnection.connect(msg.previousConnection);
      });
      await test();
      const five = await page.evaluate(() => lives === 5);
      for (const [c, r] of [[5, R - 4], [11, R - 2], [14, R - 7]]) { await place(c, r); await sleep(300); }
      await place(G, R - 2); await sleep(500);
      ok(five && await won() && /Well played!/.test(await page.textContent('#ov-win')), 'Level designers: the pupils’ own rules work (5 lives, “win screen says Well played!”)');
      await click('btn-build');
    }
  }
  // ---- code-the-rules (Years 3–4)
  {
    // Code the rules: the starter has no time limit; with the lesson's variables and rules the time counts down every
    // second, each gem adds 1 to gems and 5 to time, the 3rd gem (only) gives a bonus life, the Finish still wins, and
    // standing still until time = 0 ends the game.
    await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('code-the-rules'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'code-the-rules', { timeout: 60000 });
    await page.waitForFunction(() => projectType === 'platformer' && keyStage === 'ks2' && grid.flat().filter(v => v === T.GEM).length === 6);
    {
      const click = id => page.evaluate(id => document.getElementById(id).click(), id);
      const place = (c, r) => page.evaluate(([c, r]) => { player.x = c * TS + (TS - PW) / 2; player.y = r * TS + (TS - PH); player.vx = player.vy = 0; }, [c, r]);
      const code = async () => { await click('btn-code'); await page.waitForFunction(() => blocklyWorkspace && mode === 'code' && blocklyWorkspace.getAllBlocks(false).some(b => b.type === 'win_reach_goal')); };
      const test = async () => { await click('cp-run'); await page.waitForFunction(() => mode === 'play' && playing && player); };
      const vars = () => page.evaluate(() => { const ws = blocklyWorkspace, v = n => { const m = ws.getVariable(n); return m ? runVars[m.getId()] : undefined; }; return { time: v('time'), gems: v('gems'), lives, score, toast: document.getElementById('toast').textContent, dead: !document.getElementById('ov-dead').classList.contains('hide'), win: !document.getElementById('ov-win').classList.contains('hide') }; });
      const B = await page.evaluate(() => ROWS - 1), G = await page.evaluate(() => COLS - 2);
      const GEMS = [[4, B - 3], [8, B - 5], [6, B - 1], [12, B - 3], [15, B - 5], [14, B - 1]];
      await code(); await test(); await sleep(2500);
      let s = await vars();
      await place(G, B - 1); await sleep(500);
      ok(!s.dead && s.lives === 3 && !/^\d+$/.test(s.toast) && (await vars()).win, 'Code the rules: the starter has no countdown and the Finish wins at once');
      // what the pupils add: Variables → Create variable… (time, gems), then the blocks from the Lesson card
      const RULES = `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="variables_set" id="setTime" x="150" y="420"><field name="VAR" id="TIME">time</field><value name="VALUE"><block type="math_number"><field name="NUM">30</field></block></value>
    <next><block type="variables_set"><field name="VAR" id="GEMS">gems</field><value name="VALUE"><block type="math_number"><field name="NUM">0</field></block></value></block></next></block>
    <block type="every_n_seconds" x="480" y="150"><field name="N">1</field>
    <next><block type="math_change"><field name="VAR" id="TIME">time</field><value name="DELTA"><shadow type="math_number"><field name="NUM">-1</field></shadow></value>
    <next><block type="show_message"><value name="MSG"><block type="variables_get"><field name="VAR" id="TIME">time</field></block></value>
    <next><block type="controls_if"><value name="IF0"><block type="logic_compare"><field name="OP">EQ</field><value name="A"><block type="variables_get"><field name="VAR" id="TIME">time</field></block></value><value name="B"><block type="math_number"><field name="NUM">0</field></block></value></block></value>
      <statement name="DO0"><block type="game_over"></block></statement></block></next></block></next></block></next></block>
    <block type="when_collect_gem" x="480" y="420">
    <next><block type="math_change"><field name="VAR" id="GEMS">gems</field><value name="DELTA"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
    <next><block type="math_change"><field name="VAR" id="TIME">time</field><value name="DELTA"><shadow type="math_number"><field name="NUM">5</field></shadow></value>
    <next><block type="controls_if"><value name="IF0"><block type="logic_compare"><field name="OP">EQ</field><value name="A"><block type="variables_get"><field name="VAR" id="GEMS">gems</field></block></value><value name="B"><block type="math_number"><field name="NUM">3</field></block></value></block></value>
      <statement name="DO0"><block type="change_lives"><value name="N"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
        <next><block type="show_message"><value name="MSG"><shadow type="text"><field name="TEXT">Bonus life!</field></shadow></value></block></next></block></statement></block></next></block></next></block></next></block>
    </xml>`;
      await code();
      await page.evaluate(xml => {
        const ws = blocklyWorkspace; ws.createVariable('time', '', 'TIME'); ws.createVariable('gems', '', 'GEMS');
        Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), ws);
        ws.getAllBlocks(false).find(b => b.type === 'set_music').nextConnection.connect(ws.getBlockById('setTime').previousConnection);
      }, RULES);
      await page.evaluate(() => { const show = toast; window.__said = []; window.__toast = show; toast = (m, bg) => { window.__said.push(String(m)); return show(m, bg); }; });
      await test(); await sleep(2400);
      s = await vars();
      ok(s.time === 28 && s.gems === 0 && s.toast === '28', 'Code the rules: every 1 second the time counts down from 30 and shows on screen ' + JSON.stringify(s));
      await place(...GEMS[0]); await sleep(150);
      const g1 = await vars();
      ok(g1.gems === 1 && g1.time === 33, 'Code the rules: collecting a gem adds 1 to gems and 5 to time ' + JSON.stringify(g1));
      await place(...GEMS[1]); await sleep(300); await place(...GEMS[3]); await sleep(150);
      const g3 = await vars(), said = await page.evaluate(() => window.__said);
      await place(...GEMS[4]); await sleep(300);
      const g4 = await vars();
      ok(g3.gems === 3 && g3.lives === 4 && said.includes('Bonus life!') && g4.gems === 4 && g4.lives === 4, 'Code the rules: if gems = 3 gives one bonus life (and “Bonus life!”) on the 3rd gem only ' + JSON.stringify({ g3: g3.lives, g4: g4.lives }));
      await place(G, B - 1); await sleep(500);
      ok((await vars()).win, 'Code the rules: reaching the Finish still wins');
      await test();
      const t0 = Date.now();
      await page.waitForFunction(() => !document.getElementById('ov-dead').classList.contains('hide'), null, { timeout: 40000 });
      s = await vars();
      ok(s.dead && s.time === 0 && Date.now() - t0 > 27000, 'Code the rules: if time = 0 then game over — standing still ends the game after about 30 s (' + Math.round((Date.now() - t0) / 1000) + ' s)');
      await page.evaluate(() => { toast = window.__toast; document.getElementById('ov-dead').classList.add('hide'); });
      await click('btn-build');
    }
  }
  // ---- stage-animate (Years 3–4)
  {
    // Animate a dance party: the Cat only talks, the Bird ignores clicks and the Robot floats away; after the lesson's steps the Cat
    // dances (repeat + next costume), the Bird glides in when clicked and the fixed Robot lands where it started
    await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('stage-animate'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'stage-animate', { timeout: 60000 });
    await page.waitForFunction(() => projectType === 'stage' && stageState.sprites.length === 3 && blocklyWorkspace);
    const party0 = await page.evaluate(() => {
      const [cat, bird, robot] = stageState.sprites, bx = bird.x, ry = robot.y; let changes = 0, last = cat.costumeIdx;
      stageStart();
      for (let i = 0; i < 450; i++) { if (i === 5) stageFireClick(bird.x, bird.y); stageFrame(); if (cat.costumeIdx !== last) { changes++; last = cat.costumeIdx; } }
      keys.Space = true; stageFrame(); keys.Space = false; for (let i = 0; i < 40; i++) stageFrame();
      const r = { changes, bird: bird.x !== bx, up: ry - robot.y }; stageStop(); return r;
    });
    ok(party0.changes === 0 && !party0.bird && party0.up === 36, 'Dance party: the starter Cat does not dance, the Bird ignores clicks, the Robot floats up (' + JSON.stringify(party0) + ')');
    const party1 = await page.evaluate(() => {
      const nb = t => { const b = blocklyWorkspace.newBlock(t); b.initSvg(); b.render(); return b; };
      stageSelectSprite(0);
      const say = blocklyWorkspace.getAllBlocks(false).find(x => x.type === 'st_say_secs'), rep = nb('st_repeat'), nc = nb('st_next_costume'), w = nb('st_wait');
      w.setFieldValue(0.5, 'N'); say.nextConnection.connect(rep.previousConnection); rep.getInput('DO').connection.connect(nc.previousConnection); nc.nextConnection.connect(w.previousConnection);
      stageSelectSprite(1);
      const hat = nb('st_when_clicked'), g = nb('st_glide_xy'), s = nb('st_say_secs');
      g.setFieldValue(0, 'X'); g.setFieldValue(100, 'Y'); s.setFieldValue('Tweet!', 'TXT'); hat.nextConnection.connect(g.previousConnection); g.nextConnection.connect(s.previousConnection);
      stageSelectSprite(2);
      blocklyWorkspace.getAllBlocks(false).find(x => x.type === 'st_change_y' && Number(x.getFieldValue('N')) === -4).setFieldValue(-40, 'N');
      stageSelectSprite(0);
      const [cat, bird, robot] = stageState.sprites, ry = robot.y; let changes = 0, last = cat.costumeIdx, at = null;
      stageStart();
      for (let i = 0; i < 450; i++) { if (i === 5) stageFireClick(bird.x, bird.y); stageFrame(); if (i === 75) at = [Math.round(bird.x - CW / 2), Math.round(CH / 2 - bird.y), bird.say]; if (cat.costumeIdx !== last) { changes++; last = cat.costumeIdx; } }
      keys.Space = true; stageFrame(); keys.Space = false; const up = ry - robot.y; for (let i = 0; i < 40; i++) stageFrame();
      const r = { changes, at, up, back: robot.y === ry }; stageStop(); return r;
    });
    ok(party1.changes === 10 && party1.at.join() === '0,100,Tweet!' && party1.up === 40 && party1.back,
      'Dance party: the repeat makes the Cat change costume 10 times, the clicked Bird glides to 0,100 and says Tweet!, the fixed Robot jumps and lands (' + JSON.stringify(party1) + ')');
  }
  // ---- turtle-procedures (Years 3–4)
  {
    // Teach the turtle new words: the starter house == house 100 (a procedure with a parameter); a street procedure calls it three times
    await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('turtle-procedures'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'turtle-procedures', { timeout: 60000 });
    await page.waitForFunction(() => projectType === 'turtle' && /to house|repeat 4/.test(document.getElementById('turtle-code').value));
    const tpRun = code => page.evaluate(async code => {
      if (code !== null) document.getElementById('turtle-code').value = code;
      turtleSpeed = 10; turtleRun();
      for (let i = 0; i < 400 && turtleRunning; i++) await new Promise(r => setTimeout(r, 25));
      const d = turtleDrawCtx.getImageData(0, 0, turtleDraw.width, turtleDraw.height).data;
      let ink = 0, h = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i]) { ink++; h = (h * 31 + i + d[i]) | 0; }
      const r = v => Math.round(v * 1000) / 1000;
      return { s: document.getElementById('turtle-status').textContent.trim(), x: r(turtle.x), y: r(turtle.y), h: r(((turtle.h % 360) + 360) % 360), ink, hash: h };
    }, code);
    const tpStarter = await tpRun(null);
    const tpHouse = 'to house :size\nrepeat 4 [fd :size rt 90]\nfd :size\nrt 30\nrepeat 3 [fd :size rt 120]\nlt 30\nbk :size\nend\n';
    const tpDef = await tpRun(tpHouse);
    const tpH100 = await tpRun(tpHouse + 'house 100\n');
    ok(/Done/.test(tpStarter.s) && tpStarter.ink > 500 && tpDef.ink === 0 && tpH100.hash === tpStarter.hash && tpH100.x === 0 && tpH100.y === 0 && tpH100.h === 0,
      'Teach the turtle new words: defining house draws nothing; house 100 draws exactly the starter house and ends home ' + JSON.stringify({ tpStarter, tpDef: tpDef.ink, tpH100 }));
    const tpStreetDef = 'to street\nrepeat 3 [house 60 pu rt 90 fd 90 lt 90 pd]\nend\npu setxy -250 0 pd street\n';
    const tpOne = await tpRun(tpHouse + 'pu setxy -250 0 pd house 60\n');
    const tpStreet = await tpRun(tpHouse + tpStreetDef);
    const tpPoly = await tpRun('to poly :sides :size\nrepeat :sides [fd :size rt 360 / :sides]\nend\nto house :size\npoly 4 :size\nfd :size\nrt 30\npoly 3 :size\nlt 30\nbk :size\nend\n' + tpStreetDef);
    ok(/Done/.test(tpStreet.s) && tpStreet.x === 20 && tpStreet.y === 0 && tpStreet.ink > 2.5 * tpOne.ink && tpPoly.hash === tpStreet.hash,
      'Teach the turtle new words: street draws three houses, and house rebuilt from poly gives the same street ' + JSON.stringify({ tpStreet, tpOne: tpOne.ink, tpPoly: tpPoly.s }));
  }
  // ---- critter-builders (Years 3–4)
  {
    // Critter builders: the front-legs-only starter hardly moves; Build → body → Walking leg adds a back pair (about 1 m);
    // Undo → body → Long leg instead goes much further (about 4.5 m). Results read from the app's own Test it! card (Turbo on).
    await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('critter-builders'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'critter-builders', { timeout: 60000 });
    await page.waitForFunction(() => projectType === 'critter' && critterApp && critterApp.getCritter().blocks.length === 5, null, { timeout: 60000 });
    ok(await page.evaluate(() => !document.getElementById('lesson-guide').classList.contains('hide')), 'Critter builders: the starter opens with its Lesson card');
    const cbTest = async () => {
      await page.click('.zl-mode[data-mode="test"]');
      await page.evaluate(() => { const t = document.getElementById('zTurbo'); if (!t.checked) t.click(); });
      await page.waitForFunction(() => { const r = document.getElementById('zResult'); return r && !r.hidden && /\d/.test(r.querySelector('.big')?.textContent || ''); }, null, { timeout: 180000 });
      return parseFloat(await page.evaluate(() => document.querySelector('#zResult .big').textContent));
    };
    const cbAdd = async label => {
      await page.click('.zl-mode[data-mode="build"]');
      await page.evaluate(label => {
        critterApp._select('b1'); // click the body
        const el = [...document.querySelectorAll('#zLimbs .zl-part')].find(e => e.textContent.trim() === label);
        const o = { bubbles: true, pointerId: 1, clientX: 10, clientY: 10, isPrimary: true };
        el.dispatchEvent(new PointerEvent('pointerdown', o)); window.dispatchEvent(new PointerEvent('pointerup', o)); // a tap
      }, label);
      return page.evaluate(() => { const z = critterApp.getCritter(), body = z.blocks[0].id;
        const top = b => { let p = b; while (p.mount && p.mount.parent !== body) p = z.blocks.find(x => x.id === p.mount.parent); return p; };
        return { n: z.blocks.length, back: z.blocks.filter(b => b.path && top(b).mount.at[0] < 0).length }; });
    };
    const cb0 = await cbTest();
    ok(cb0 < 0.3, 'Critter builders: the starter (front legs only) hardly moves in the Sprint (' + cb0 + ' m)');
    const cbW = await cbAdd('Walking leg');
    ok(cbW.n === 9 && cbW.back === 2, 'Critter builders: body → Walking leg adds a pair at the back (' + JSON.stringify(cbW) + ')');
    const cb1 = await cbTest();
    ok(cb1 >= 0.7 && cb1 > cb0 + 0.6, 'Critter builders: with back legs it goes further (' + cb0 + ' m → ' + cb1 + ' m)');
    await page.click('.zl-mode[data-mode="build"]');
    await page.click('#zUndo');
    ok(await page.evaluate(() => critterApp.getCritter().blocks.length) === 5, 'Critter builders: Undo takes the back legs off');
    const cbL = await cbAdd('Long leg');
    ok(cbL.n === 11 && cbL.back === 2, 'Critter builders: body → Long leg adds a Long leg pair at the back (' + JSON.stringify(cbL) + ')');
    const cb2 = await cbTest();
    ok(cb2 > 3 && cb2 > cb1 * 2.5, 'Critter builders: Long legs at the back go much further (' + cb1 + ' m → ' + cb2 + ' m)');
    await page.click('.zl-mode[data-mode="build"]');
  }
  // ---- robot-storyteller (Years 3–4)
  {
    // Robot storyteller: the starter's bug (it greets you while still asleep), the one-drag fix, repeat 3 = three nods,
    // and "when the robot is tapped" starts scene two
    await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('robot-storyteller'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'robot-storyteller', { timeout: 60000 });
    await page.waitForFunction(() => projectType === 'robot' && robotApp && robotApp._view() && robotApp._ws() && robotApp._ws().getTopBlocks().length === 1 &&
      robotApp._ws().getAllBlocks(false).some(x => x.type === 'rb_light_off'), null, { timeout: 30000 });
    ok(await page.evaluate(() => /Robot storyteller/.test(document.getElementById('lesson-guide').textContent)), 'Robot storyteller: the starter opens with its Lesson card');
    const rbRecord = () => page.evaluate(() => new Promise(res => {
      const log = []; let idle = 0;
      const iv = setInterval(() => {
        const v = robotApp._view(); log.push({ b: document.getElementById('rbBubble').textContent, s: v.state().cur, eyes: v.robot.lights.eyes.emissive.getHexString() });
        if (!robotApp._runner().busy()) { if (!idle) idle = Date.now(); if (Date.now() - idle > 300) { clearInterval(iv); res(log); } } else idle = 0;
      }, 30);
    }));
    await page.evaluate(() => robotApp.run());
    let story = await rbRecord();
    let gm = story.find(x => x.b === 'Good morning! I am Sparky.');
    ok(gm && gm.s.Eyelids >= 7 && gm.eyes === '000000', 'Robot storyteller: the starter has the order bug (“Good morning!” with its eyes shut)');
    await page.evaluate(() => {
      const ws = robotApp._ws(), all = ws.getAllBlocks(false), B = Blockly.serialization.blocks;
      const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
      const happy = all.find(x => x.type === 'rb_face' && x.getFieldValue('FACE') === 'happy');
      const zzz = all.find(x => x.type === 'rb_say_wait' && x.getInputTargetBlock('TEXT').getFieldValue('TEXT') === 'Zzz…');
      happy.unplug(false); zzz.nextConnection.connect(happy.previousConnection); // the fix: drag the happy face up
      const add = json => { let end = ws.getTopBlocks().find(t => t.type === 'rb_when_run'); while (end.getNextBlock()) end = end.getNextBlock(); end.nextConnection.connect(B.append(json, ws).previousConnection); };
      add({ type: 'rb_look', fields: { DIR: 'left' } }); add({ type: 'rb_look', fields: { DIR: 'right' } });
      add({ type: 'controls_repeat_ext', inputs: { TIMES: N(3), DO: { block: { type: 'rb_move', fields: { M: 'HeadNod' }, inputs: { N: N(8) }, next: { block: { type: 'rb_move', fields: { M: 'HeadNod' }, inputs: { N: N(2) } } } } } } });
      add({ type: 'rb_look', fields: { DIR: 'ahead' } });
      B.append({ type: 'rb_when_tapped', x: 420, y: 24, fields: { PART: 'any' }, next: { block: { type: 'rb_face', fields: { FACE: 'surprised' },
        next: { block: { type: 'rb_say_wait', inputs: { TEXT: { shadow: { type: 'text', fields: { TEXT: 'Who is there?' } } } } } } } } }, ws);
    });
    await page.evaluate(() => robotApp.run());
    story = await rbRecord();
    gm = story.find(x => x.b === 'Good morning! I am Sparky.');
    let nodsSeen = 0, up = false; for (const x of story.slice(story.indexOf(gm))) { if (!up && x.s.HeadNod >= 7) up = true; else if (up && x.s.HeadNod <= 3) { up = false; nodsSeen++; } }
    const endPose = story[story.length - 1].s;
    ok(gm && gm.s.Eyelids === 1 && gm.eyes === 'ffd23f' && nodsSeen === 3 && endPose.HeadTurn === 5 && endPose.HeadNod === 5, 'Robot storyteller: fixed, it wakes up before “Good morning!”, then repeat 3 makes it nod 3 times (' + nodsSeen + ') and it ends looking ahead');
    await page.evaluate(() => robotApp._runner().tap('head'));
    await page.waitForFunction(() => document.getElementById('rbBubble').textContent === 'Who is there?' && robotApp._view().state().tgt.Brows === 10, null, { timeout: 10000 });
    ok(true, 'Robot storyteller: tapping the robot starts scene two (a surprised face and “Who is there?”)');
    await page.evaluate(() => robotApp.stop());
  }
  // ---- robot-quiz (Years 5–6)
  {
    // Robot quiz: the starter asks and says back the answer; with a score variable and if answer = 7 … else …, a right answer
    // gives a happy face, “Correct!” and score 1, a wrong one a sad face; two questions end with “Your score is 2”
    await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('robot-quiz'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'robot-quiz', { timeout: 60000 });
    await page.waitForFunction(() => projectType === 'robot' && robotApp && robotApp._view() && robotApp._ws() && robotApp._ws().getAllBlocks(false).some(x => x.type === 'rb_ask'), null, { timeout: 30000 });
    ok(await page.evaluate(() => /Robot quiz/.test(document.getElementById('lesson-guide').textContent)), 'Robot quiz: the starter opens with its Lesson card');
    const quizAnswer = async a => {
      await page.waitForSelector('#rbAsk:not([hidden])', { timeout: 30000 });
      const q = await page.textContent('#rbAskQ');
      await page.fill('#rbAnswer', String(a)); await page.press('#rbAnswer', 'Enter'); // Enter = OK (the Lesson card can sit over the OK button)
      await page.waitForSelector('#rbAsk', { state: 'hidden' });
      return q;
    };
    const quizWatch = () => page.evaluate(() => { window.__said = []; clearInterval(window.__qw); window.__qw = setInterval(() => {
      const t = document.getElementById('rbBubble').textContent, l = window.__said[window.__said.length - 1];
      if (t && (!l || l.t !== t)) window.__said.push({ t, brows: robotApp._view().state().cur.Brows }); }, 25); });
    const quizIdle = () => page.evaluate(() => new Promise(r => { const iv = setInterval(() => { if (!robotApp._runner().busy()) { clearInterval(iv); clearInterval(window.__qw); r(window.__said); } }, 50); }));
    const quizScore = () => page.evaluate(() => robotApp._runner()._vars()[robotApp._ws().getVariable('score').getId()]);
    await page.evaluate(() => robotApp.run()); await quizWatch();
    const q1 = await quizAnswer('banana');
    let said = await quizIdle();
    ok(q1 === 'What is 3 + 4?' && said[said.length - 1].t === 'banana', 'Robot quiz: the starter asks “What is 3 + 4?” and says back what you typed');
    await page.evaluate(() => {
      const ws = robotApp._ws(), B = Blockly.serialization.blocks, V = { id: ws.createVariable('score').getId() };
      const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } }), T = t => ({ shadow: { type: 'text', fields: { TEXT: t } } });
      const hat = ws.getTopBlocks()[0];
      hat.nextConnection.connect(B.append({ type: 'variables_set', fields: { VAR: V }, inputs: { VALUE: N(0) } }, ws).previousConnection);
      let end = hat; while (end.getNextBlock()) end = end.getNextBlock();
      end.dispose(true); // "say answer until done" goes in the bin
      end = hat; while (end.getNextBlock()) end = end.getNextBlock();
      const add = json => { const nb = B.append(json, ws); end.nextConnection.connect(nb.previousConnection); end = nb; };
      const check = (right) => ({ type: 'controls_if', extraState: { hasElse: true }, inputs: {
        IF0: { block: { type: 'logic_compare', fields: { OP: 'EQ' }, inputs: { A: { block: { type: 'rb_answer' } }, B: N(right) } } },
        DO0: { block: { type: 'rb_face', fields: { FACE: 'happy' }, next: { block: { type: 'rb_say_wait', inputs: { TEXT: T('Correct!') }, next: { block: { type: 'math_change', fields: { VAR: V }, inputs: { DELTA: N(1) } } } } } } },
        ELSE: { block: { type: 'rb_face', fields: { FACE: 'sad' }, next: { block: { type: 'rb_say_wait', inputs: { TEXT: T('Not quite. It is ' + right + '.') } } } } } } });
      add(check(7));
      add({ type: 'rb_ask', inputs: { TEXT: T('How many legs does a spider have?') } });
      add(check(8));
      add({ type: 'rb_say_wait', inputs: { TEXT: { block: { type: 'text_join', extraState: { itemCount: 2 }, inputs: { ADD0: T('Your score is '), ADD1: { block: { type: 'variables_get', fields: { VAR: V } } } } } } } });
    });
    await page.evaluate(() => robotApp.run()); await quizWatch();
    await quizAnswer(7); await quizAnswer(6);
    said = await quizIdle();
    const right = said.find(x => x.t === 'Correct!'), wrong = said.find(x => x.t === 'Not quite. It is 8.');
    ok(right && right.brows === 7 && wrong && wrong.brows === 4 && said[said.length - 1].t === 'Your score is 1' && await quizScore() === 1, 'Robot quiz: 7 is right (happy face, Correct!), 6 is wrong (sad face), and it says “Your score is 1”');
    await page.evaluate(() => robotApp.run()); await quizWatch();
    await quizAnswer(7); await quizAnswer(8);
    said = await quizIdle();
    ok(said[said.length - 1].t === 'Your score is 2' && await quizScore() === 2, 'Robot quiz: two right answers → “Your score is 2”');
  }
  // ---- ai-happy-sad (Years 3–4)
  {
    // Happy or sad? (Years 3–4): the starter AI (3 happy, 4 "sad" with a smiley filed there by mistake) calls happy faces sad;
    // tapping the smiley away and adding 5 more varied faces of each makes it get far more new faces right
    await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('ai-happy-sad'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'ai-happy-sad', { timeout: 60000 });
    await page.waitForFunction(() => projectType === 'ai' && aiApp && aiApp._ws() && aiApp._labels().length === 2 && aiApp._labels()[1].ex.length === 4, null, { timeout: 30000 });
    const hs = await page.evaluate(async () => {
      const M = await import(aiBase() + 'ai-model.js'), pause = () => new Promise(r => setTimeout(r, 100));
      const wait = () => new Promise(r => { const t = setInterval(() => { if (aiApp._brain() && !aiApp._training()) { clearInterval(t); r(); } }, 50); });
      const train = async () => { document.getElementById('alTabTrain').click(); document.getElementById('alTrain').click(); await pause(); await wait(); };
      const score = () => { let n = 0, h = 0; for (let s = 500; s < 540; s++) for (const k of ['happy', 'sad']) if (M.guess(aiApp._brain(), M.sampleDrawing(k, s)).label === k) { n++; if (k === 'happy') h++; } return { n, h }; };
      const face = M.sampleDrawing('happy', 501), pad = () => { aiApp._pads.test.set(face); aiApp._testGuess(); return document.querySelector('#alGuess .al-big').textContent; };
      await train(); const starter = score(), padBefore = pad();
      document.getElementById('alTabTeach').click();
      const removed = aiApp._labels()[1].ex[2];
      document.querySelectorAll('.al-label')[1].querySelectorAll('.al-ex')[2].click(); // the smiley in the sad pile
      const sadLeft = aiApp._labels()[1].ex.length;
      await train(); const fixed = score();
      document.getElementById('alTabTeach').click();
      const more = M.sampleLabels('faces', 5, 99);
      for (const li of [0, 1]) { document.querySelectorAll('.al-label')[li].querySelector('.al-count').click(); for (const d of more[li].ex) { aiApp._pads.teach.set(d); document.getElementById('alAddEx').click(); } }
      const counts = aiApp._labels().map(l => l.ex.length).join();
      await train();
      return { starter, padBefore, sadLeft, fixed, counts, after: score(), padAfter: pad(), removedIs: M.guess(aiApp._brain(), removed).label };
    });
    ok(hs.starter.h <= 15 && /sad/.test(hs.padBefore), 'Happy or sad?: the starter AI calls most happy faces sad (' + hs.starter.h + '/40 right; test pad: ' + hs.padBefore + ')');
    ok(hs.sadLeft === 3 && hs.removedIs === 'happy' && hs.fixed.n > hs.starter.n, 'Happy or sad?: tapping the smiley out of the sad label and training again makes it better (' + hs.starter.n + ' → ' + hs.fixed.n + ' of 80)');
    ok(hs.counts === '8,8' && hs.after.n >= 68 && hs.after.n - hs.starter.n >= 20 && /happy/.test(hs.padAfter), 'Happy or sad?: with 5 more varied faces of each it gets ' + hs.after.n + '/80 new faces right (test pad: ' + hs.padAfter + ')');
  }
  // ---- train-snaps (Years 3–4)
  {
    // Snap code (Train Lab, Years 3–4): the starter's red-white station snaps are a bug (the train drives past, job 2 never ticks);
    // fixed to white red, plus white green (school), white blue (fallen trees) and white red blue read from the right (station),
    // every job on "Village line" ticks off and it says Challenge complete — no blocks at all
    await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('train-snaps'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'train-snaps', { timeout: 60000 });
    await page.waitForFunction(() => projectType === 'train' && trainApp && trainApp._ws() && trainApp._proj().dests.length === 4 && trainApp._proj().challenge, null, { timeout: 30000 });
    await page.waitForFunction(() => /Snap code/.test(document.getElementById('lesson-guide').textContent), null, { timeout: 10000 }).catch(() => {});
    const snapStart = await page.evaluate(() => ({ tops: trainApp._ws().getTopBlocks().length, snaps: trainApp._proj().pieces[0][4].join(), jobs: trainApp._proj().challenge.steps.length, card: /Snap code/.test(document.getElementById('lesson-guide').textContent) }));
    ok(snapStart.tops === 0 && snapStart.snaps === 'red,white,,,,,' && snapStart.jobs === 5 && snapStart.card, 'Snap code: the starter opens with no blocks, the buggy red-white station snaps, 5 jobs and its Lesson card');
    await page.click('#tlRun');
    const snapBug = await page.evaluate(() => new Promise(res => { let laps = 0, lastP = -1; const t0 = Date.now(), iv = setInterval(() => {
      const tr = trainApp._sim().trains[0]; if (tr.p === 1 && lastP === 0) laps++; lastP = tr.p;
      if (laps >= 1 || Date.now() - t0 > 15000) { clearInterval(iv); res({ laps, stopped: tr.lastCommand, job2: trainApp._checker().done[1] }); }
    }, 40); }));
    ok(snapBug.laps >= 1 && snapBug.stopped === '' && !snapBug.job2, 'Snap code: with the bug the train drives straight past the station and job 2 does not tick');
    await page.click('#tlStop'); await page.click('#tlReset');
    const TMs = await import(join(ROOT, 'train', 'train-model.js'));
    const snapTap = (p, k, colour) => page.evaluate(([p, k, colour, u]) => { trainApp.setTool(colour); const q = trainApp._sim().geoms[p].paths[0].at(u); return trainApp._tapWorld(q.x, q.y); },
      [p, k, colour, TMs.PIECES[p === 3 ? 'curveR' : 'straight'].slots[k]]);
    for (const [p, k, c] of [[0, 0, 'white'], [0, 1, 'red'], [1, 0, 'white'], [1, 1, 'green'], [3, 0, 'white'], [3, 1, 'blue'], [0, 6, 'white'], [0, 5, 'red'], [0, 4, 'blue']]) await snapTap(p, k, c);
    await page.click('#tlRun');
    const snapRoute = await page.evaluate(() => new Promise(res => { const seen = [], t0 = Date.now(); const iv = setInterval(() => {
      const c = trainApp._sim().trains[0].lastCommand; if (c && seen[seen.length - 1] !== c) seen.push(c);
      const ch = trainApp._checker(); if ((ch && ch.complete()) || Date.now() - t0 > 40000) { clearInterval(iv); res({ seen: seen.join(), complete: !!(ch && ch.complete()), ticked: document.querySelectorAll('#tlCheck li.ok').length, board: document.getElementById('tlCheck').textContent }); }
    }, 30); }));
    ok(snapRoute.complete && snapRoute.ticked === 5 && /Challenge complete/.test(snapRoute.board) && snapRoute.seen === 'stop 2 seconds,slow,reverse,end route',
      'Snap code: with the bug fixed and the route’s snaps placed, the train stops, slows, turns back and ends at the station: every job ticks (Challenge complete) ' + JSON.stringify(snapRoute));
    await page.click('#tlStop');
  }
  // ---- world-builders (Years 3–4)
  {
    // World builders (Years 3–4): drag the ball (its block numbers change), put it on the box, add a cone, repeat 5 boxes,
    // count across for a row of 5 pillars, forever + turn spins the star after Run, and the staircase challenge
    await page.evaluate(() => { clearDirty(); window.__lsOpen = lessonOpenStarter('world-builders'); });
  await page.waitForFunction(id => lessonActive && lessonActive.id === id, 'world-builders', { timeout: 60000 });
    await page.waitForFunction(() => projectType === '3d' && worldApp && worldApp._world() && worldApp._world().editing() && worldApp._world().objects().some(o => o.id === 'star') && worldApp._world().objects().some(o => o.id === 'tree1'), null, { timeout: 60000 });
    ok(await page.evaluate(() => /World builders/.test(document.getElementById('lesson-guide').textContent) && worldApp._world().objects().length === 4), 'World builders: the starter opens in the edit view with its four things and its Lesson card');
    const wb = await page.evaluate(async () => {
      const W = worldApp._world(), ws = worldApp._ws(), Bk = Blockly;
      const WB = await import(worldBase() + 'world-blocks.js');
      const out = {};
      const until = async (f, ms = 15000) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (f()) return true; } catch (e) { /* not yet */ } await new Promise(res => setTimeout(res, 50)); } return false; };
      const starMesh = () => W.scene.meshes.find(m => m.name === 'star' && m.metadata && m.metadata.w3id === 'star');
      const settle = async () => { await new Promise(res => setTimeout(res, 450)); await until(() => W.editing() && starMesh() && W.objects().some(o => o.id === 'tree1')); await new Promise(res => setTimeout(res, 250)); };
      const objs = () => W.objects();
      const fromToolbox = type => { for (const c of WB.toolbox().contents) for (const x of (c.contents || [])) if (x.type === type) return JSON.parse(JSON.stringify(x)); };
      const add = json => { delete json.kind; return Bk.serialization.blocks.append(json, ws); };
      const setNum = (blk, name, v) => blk.getInputTargetBlock(name).setFieldValue(String(v), 'NUM');
      const getNum = (blk, name) => Number(blk.getInputTargetBlock(name).getFieldValue('NUM'));
      const byType = (t, f) => ws.getAllBlocks(false).find(x => x.type === t && (!f || f(x)));
    
      // 2. Move the ball: click it (select), drag the gizmo's arrows -> the block's numbers change
      const ball = byType('w3_sphere');
      W.select('ball1');
      const gm = W._gizmo(), pg = gm.gizmos.positionGizmo, mesh = W.scene.getMeshByName('ball1');
      pg.onDragStartObservable.notifyObservers({});
      mesh.position.x -= 2; mesh.position.z += 1.5;
      pg.onDragEndObservable.notifyObservers({});
      out.dragged = [getNum(ball, 'X'), getNum(ball, 'Y'), getNum(ball, 'Z')];
      await settle();
    
      // 3. On top of the box: x 0, y 1, z 0
      setNum(ball, 'X', 0); setNum(ball, 'Y', 1); setNum(ball, 'Z', 0);
      await settle();
      const bo = objs().find(o => o.id === 'ball1'), boxMesh = W.scene.getMeshByName('box1');
      boxMesh.computeWorldMatrix(true);
      out.ball = [bo.x, bo.y, bo.z]; out.boxTop = Math.round(boxMesh.getBoundingInfo().boundingBox.maximumWorld.y * 100) / 100;
    
      // 4. Add to the sequence: a make cone under make ball, next to the tree
      const cone = add(fromToolbox('w3_cone'));
      ball.nextConnection.connect(cone.previousConnection);
      setNum(cone, 'X', -5); setNum(cone, 'Z', 2);
      await settle();
      out.cone = objs().filter(o => o.kind === 'cone').map(o => [o.id, o.x, o.y, o.z]);
      out.orderAfterCone = (() => { const s = []; let x = ws.getTopBlocks(true)[0].getInputTargetBlock('DO'); while (x) { s.push(x.type); x = x.getNextBlock(); } return s.join(','); })();
    
      // 5. Repeat 5 times: a make box (height 3, z 6) inside -> 5 boxes, all in the same place
      const set = byType('variables_set');
      const rep = add(fromToolbox('controls_repeat_ext'));
      set.nextConnection.connect(rep.previousConnection);
      setNum(rep, 'TIMES', 5);
      const pillar = add(fromToolbox('w3_box'));
      rep.getInput('DO').connection.connect(pillar.previousConnection);
      setNum(pillar, 'H', 3); setNum(pillar, 'Z', 6);
      await settle();
      const made1 = W.objectsOfBlock(pillar.id).map(id => objs().find(o => o.id === id));
      out.samePlace = { n: made1.length, xs: [...new Set(made1.map(o => o.x))] };
    
      // 6. Count across: "across" into the box's x, "change across by 3" in the loop under the box
      const get = add({ type: 'variables_get', fields: { VAR: { id: ws.getVariable('across').getId() } } });
      pillar.getInput('X').connection.connect(get.outputConnection);
      const ch = add({ type: 'math_change', fields: { VAR: { id: ws.getVariable('across').getId() } }, inputs: { DELTA: { shadow: { type: 'math_number', fields: { NUM: 1 } } } } });
      pillar.nextConnection.connect(ch.previousConnection);
      setNum(ch, 'DELTA', 3);
      await settle();
      const row = W.objectsOfBlock(pillar.id).map(id => objs().find(o => o.id === id));
      out.row = row.map(o => [o.x, o.y, o.z]);
      out.total = objs().length;
      // the Variables flyout's change block shows "across" (it is the newest variable in the starter)
      out.flyoutChange = (() => { const xml = Bk.Variables.flyoutCategoryBlocks(ws).map(e => e.outerHTML || '').join(''); const m = /type="math_change"[^]*?<field name="VAR"[^>]*>([^<]+)</.exec(xml); return m && m[1]; })();
    
      // 7. Make it spin: forever at the very end with "turn star by x 0 y 5 z 0"
      const fe = add(fromToolbox('w3_forever'));
      rep.nextConnection.connect(fe.previousConnection);
      const turn = add(fromToolbox('w3_turn_by'));
      turn.getField('VAR').setValue(ws.getVariable('star').getId());
      setNum(turn, 'Y', 5);
      fe.getInput('DO').connection.connect(turn.previousConnection);
      await settle();
      const yaw = () => { const q = starMesh().rotationQuaternion; return q ? Math.round(q.toEulerAngles().y * 180 / Math.PI) : 0; };
      out.editYaw = [yaw()]; await new Promise(res => setTimeout(res, 500)); out.editYaw.push(yaw());
      document.getElementById('w3Run').click();
      await until(() => W.running() && starMesh());
      const y0 = yaw(); await new Promise(res => setTimeout(res, 800)); const y1 = yaw();
      out.runYaw = [y0, y1];
      out.runObjects = objs().length;
      document.getElementById('w3Stop').click();
      await until(() => W.editing() && starMesh()); await new Promise(res => setTimeout(res, 300));
      out.stopYaw = yaw();
      out.status = document.getElementById('w3Status').className;
    
      // 8. Challenge: a staircase — variable "up" set to 1 before the loop, in the box's height, change up by 1 in the loop
      const up = ws.createVariable('up');
      const setUp = add({ type: 'variables_set', fields: { VAR: { id: up.getId() } }, inputs: { VALUE: { block: { type: 'math_number', fields: { NUM: 1 } } } } });
      set.nextConnection.connect(setUp.previousConnection);
      const getUp = add({ type: 'variables_get', fields: { VAR: { id: up.getId() } } });
      pillar.getInput('H').connection.connect(getUp.outputConnection);
      const chUp = add({ type: 'math_change', fields: { VAR: { id: up.getId() } }, inputs: { DELTA: { shadow: { type: 'math_number', fields: { NUM: 1 } } } } });
      ch.nextConnection.connect(chUp.previousConnection);
      await settle();
      out.stairs = W.objectsOfBlock(pillar.id).map(id => { const m = W.scene.getMeshByName(id); m.computeWorldMatrix(true); return [objs().find(o => o.id === id).x, Math.round(m.getBoundingInfo().boundingBox.maximumWorld.y * 100) / 100]; });
      out.blocks = ws.getAllBlocks(false).length;
      return out;
    });
    ok(wb.dragged.join() === '2,0,1.5', 'Move the ball: dragging its arrows writes the new x, y, z into its make ball block (' + wb.dragged + ')');
    ok(wb.ball.join() === '0,1,0' && wb.boxTop === 1, 'On top of the box: x 0, y 1, z 0 puts the ball exactly on the box (ball ' + wb.ball + ', box top y ' + wb.boxTop + ')');
    ok(wb.cone.length === 1 && wb.cone[0].slice(1).join() === '-5,0,2' && wb.orderAfterCone.startsWith('w3_sky,w3_box,w3_sphere,w3_cone,w3_object'), 'Add to the sequence: a make cone under make ball stands next to the tree (' + JSON.stringify(wb.cone) + ')');
    ok(wb.samePlace.n === 5 && wb.samePlace.xs.length === 1, 'Repeat 5 times: the loop makes 5 boxes, all in the same place (' + JSON.stringify(wb.samePlace) + ')');
    ok(wb.row.map(p => p.join(':')).join(' ') === '-6:0:6 -3:0:6 0:0:6 3:0:6 6:0:6', 'Count across: a row of 5 pillars at x -6, -3, 0, 3, 6 (' + JSON.stringify(wb.row) + ')');
    ok(wb.flyoutChange === 'across', 'the Variables category offers “change across by 1” (' + wb.flyoutChange + ')');
    ok(wb.editYaw[0] === wb.editYaw[1], 'Make it spin: the star stays still in the edit view (before Run)');
    ok(wb.runYaw[0] !== wb.runYaw[1], 'Make it spin: after Run the star turns (' + wb.runYaw + ' degrees)');
    ok(wb.stopYaw === 0 && !/bad/.test(wb.status), 'Stop puts the star back and there are no error messages');
    ok(wb.stairs.map(s => s[1]).join() === '1,2,3,4,5', 'Challenge: the staircase pillars are 1, 2, 3, 4 and 5 high (' + JSON.stringify(wb.stairs) + ')');
  }
  ok(errors.length === 0, 'no errors while following the lessons' + (errors.length ? ': ' + errors.join(' | ') : ''));
} catch (e) {
  ok(false, 'the lessons browser test stopped: ' + (e && e.message));
} finally {
  await b.close(); site.close();
}
done();
