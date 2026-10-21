// Lantern Street Theatre — the Stage Lab's lesson unit (lessons/units/stage.js, 24 lessons in 4 blocks).
// Every lesson is complete; every starter opens in the real app with its Lesson card; and for every lesson that isn't a
// project, the lesson's intended answer (lessons/builds/theatre/theatre.mjs ANSWERS, or the adopted lessons' own answers)
// does what the lesson promises while the bare starter does not. Project lessons: the starter opens and an example meets
// every success criterion (and the empty starter doesn't).
// THEATRE_BUILD=1 builds the new starters in the page instead of opening lessons/starters/*.json (for working on the unit).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, serve, browser, openApp, ok, done } from './lib.mjs';

const U = await import(pathToFileURL(join(ROOT, 'lessons', 'units', 'stage.js')).href);
const T = await import(pathToFileURL(join(ROOT, 'lessons', 'builds', 'theatre', 'theatre.mjs')).href);
const { LESSONS: ALL } = await import(pathToFileURL(join(ROOT, 'lessons', 'lessons.js')).href);
const { CURRICULA } = await import(pathToFileURL(join(ROOT, 'lessons', 'curricula.js')).href);
const BUILD = process.env.THEATRE_BUILD === '1';

// ───────── the unit's data ─────────
const UNIT = U.LESSONS.map(x => ALL.find(l => l.id === (x.adopt || x.id)));
ok(UNIT.length === 24 && UNIT.every(Boolean), `24 lessons in the unit, all in the library (${UNIT.filter(Boolean).length})`);
ok(new Set(ALL.map(l => l.id)).size === ALL.length, 'every lesson id in the library is different');
const ADOPTED = ['cat-to-star', 'fix-the-dance', 'stage-animate', 'catch-the-stars', 'microbit-rps'];
ok(ADOPTED.every(id => U.LESSONS.some(x => x.adopt === id)), 'the Stage Lab’s five earlier lessons are folded into the unit');
const BLOCK_YEARS = ['Years 1–2', 'Years 3–4', 'Years 4–5', 'Years 5–6'];
const KEYS = { ks1: ['alg', 'debug1', 'predict', 'create1'], ks2: ['design', 'ssr', 'reason', 'data', 'safe'] };
UNIT.forEach((l, i) => {
  if (!l) return;
  l = Object.assign({ plan: [], steps: [], success: [], words: [], assess: [], need: [], curriculum: [], slides: [] }, l);
  const b = Math.floor(i / 6) + 1, m = i + 1, mins = l.plan.reduce((a, p) => a + p.min, 0);
  const slides = l.slides || [], words = /Scratch|ScratchJr|Minecraft|Tinkercad|Autodesk|intelino|Ohbot|Bamzooki|BBC|Flock|Flip Computing|Code\.org|Barefoot/;
  const text = JSON.stringify(l);
  ok(l.unit === `Lantern Street Theatre · Block ${b} · Lesson ${m}` && l.years === BLOCK_YEARS[b - 1] && l.ks === (b === 1 ? 'ks1' : 'ks2') && l.type === 'stage' && l.minutes === 60,
    `${l.id}: Block ${b} · Lesson ${m}, ${l.years}, ${l.ks}, 60 minutes`);
  ok(mins === 60 && l.steps.length >= 4 && l.steps.length <= 8 && l.success.length >= 2 && l.words.length >= 2 && l.assess.length >= 2 && l.support && l.stretch && l.objective && l.summary && l.need.length,
    `${l.id}: complete (plan ${mins} min, ${l.steps.length} pupil steps)`);
  ok(l.curriculum.length && l.curriculum.every(k => KEYS[l.ks].includes(k)), `${l.id}: curriculum keys fit ${l.ks} (${l.curriculum})`);
  ok(slides.length >= 4 && slides.length <= 7 && slides.some(s => s.use === 'steps') && slides.every(s => s.use || (s.t && s.notes)), `${l.id}: ${slides.length} slides with notes and a Your turn slide`);
  ok(!words.test(text), `${l.id}: no other product’s names`);
  ok(existsSync(join(ROOT, 'lessons', 'starters', l.id + '.json')) && existsSync(join(ROOT, 'lessons', 'pics', l.id + '.jpg')), `${l.id}: starter + picture`);
});
ok(UNIT.filter((l, i) => i % 6 === 5).every(l => l && /^Project/.test(l.title)), 'lesson 6 of each block is a design-and-make project');
ok(Object.keys(CURRICULA).length > 0, 'curriculum table loads');

// ───────── in the real app ─────────
const site = await serve();
const b = await browser();
const errors = [];
const HELP = () => {
  window.TT = {
    sp: n => stageState.sprites.find(s => s.name === n),
    sx: s => Math.round(s.x - CW / 2), sy: s => Math.round(CH / 2 - s.y),
    answer(a) {
      for (const [n, p] of Object.entries(a.sprites || {})) { const s = TT.sp(n); if (Array.isArray(p)) s.ks1 = JSON.parse(JSON.stringify(p)); else s.xml = p; }
      (a.vars || []).forEach(v => { if (!stageState.vars.includes(v)) stageState.vars.push(v); });
      (a.lists || []).forEach(v => { if (!stageState.lists.includes(v)) stageState.lists.push(v); });
      if (keyStage !== 'ks1') stageLoadSpriteScripts(stageSel);
    },
    // start, run n frames (fn(f) before each) and log every new speech bubble: [{f, n, t}]
    run(n, fn) {
      const said = [], last = {}; stageStart();
      for (let f = 0; f < n; f++) {
        if (fn) fn(f); stageFrame();
        for (const s of stageState.sprites) { const t = s.say || ''; if (t !== (last[s.name] || '')) { if (t) said.push({ f, n: s.name, t }); last[s.name] = t; } }
      }
      return said;
    },
    click: n => { const s = TT.sp(n); stageFireClick(s.x, s.y); },
    progs: () => Object.fromEntries(stageState.sprites.map(s => [s.name, keyStage === 'ks1' ? (s.ks1 || []) : (s.xml || '')]))
  };
};
async function open(page, id) {
  if (BUILD && T.SPECS[id]) { await page.evaluate(([src, a]) => (0, eval)('(' + src + ')')(a), [T.build.toString(), T.args(id)]); }
  else {
    await page.evaluate(id => { clearDirty(); window.__lsOpen = lessonOpenStarter(id); }, id); // not returned: a big starter's promise can be collected
    await page.waitForFunction(id => lessonActive && lessonActive.id === id, id, { timeout: 60000 });
    await page.waitForFunction(() => !document.getElementById('lesson-guide').classList.contains('hide'), null, { timeout: 30000 }).catch(() => {});
  }
  await page.waitForFunction(() => projectType === 'stage' && stageState && (keyStage === 'ks1' || blocklyWorkspace), null, { timeout: 30000 });
  await page.evaluate(() => { try { stageStop(); } catch (e) {} });
  return page.evaluate(() => ({ ks: keyStage, card: !document.getElementById('lesson-guide').classList.contains('hide'), title: document.getElementById('lesson-guide').textContent,
    names: stageState.sprites.map(s => s.name) }));
}
const crit = (id, progs) => T.criteria(id, progs);

const CHECKS = {
  // ── Block 1 ──
  'cat-to-star': async page => {
    const r = await page.evaluate(() => {
      const [cat, star] = stageState.sprites, go = () => { TT.run(200); const x = cat.x; stageStop(); return x; };
      const before = go(); cat.ks1 = [[{ t: 'flag' }, { t: 'right', n: 5 }]]; return { before, after: go(), star: star.x };
    });
    ok(Math.abs(r.before - r.star) > 40 && Math.abs(r.after - r.star) < 4, 'Get the cat to the star: the empty starter stays put; flag + move right 5 reaches the star ' + JSON.stringify(r));
  },
  'theatre-2-steps': async (page, a) => {
    const r = await page.evaluate(a => {
      const bun = TT.sp('Bun'), star = TT.sp('Star'), go = () => { TT.run(300); const p = [bun.x, bun.y]; stageStop(); return p; };
      const before = go(); TT.answer(a); const after = go(); return { before, after, star: [star.x, star.y] };
    }, a);
    const at = p => Math.abs(p[0] - r.star[0]) < 4 && Math.abs(p[1] - r.star[1]) < 4;
    ok(!at(r.before) && at(r.after), 'Up to the stage: the starter stops at the bottom of the steps; right 2, up 3, right 3 reaches the spotlight star ' + JSON.stringify(r));
  },
  'fix-the-dance': async page => {
    const r = await page.evaluate(() => {
      const cat = stageState.sprites[0], x0 = cat.x, go = () => { const said = TT.run(400); const x = cat.x; stageStop(); return { x, said: said.map(s => s.t).join() }; };
      const buggy = go(); cat.ks1 = [[{ t: 'flag' }, { t: 'right', n: 3 }, { t: 'hop', n: 1 }, { t: 'left', n: 3 }, { t: 'say', text: 'Ta-da!' }]];
      return { x0, buggy, fixed: go() };
    });
    ok(Math.abs(r.buggy.x - r.x0) > 20 && Math.abs(r.fixed.x - r.x0) < 1 && r.fixed.said === 'Ta-da!', 'Fix the dance: the buggy dance ends in the wrong place, the fixed one comes home and says Ta-da! ' + JSON.stringify(r));
  },
  'theatre-4-ball': async (page, a) => {
    const r = await page.evaluate(a => {
      const ball = TT.sp('Ball'), go = () => { const y0 = ball.y; let hops = 0, up = false; TT.run(400, () => { const isUp = ball.y < y0 - 10; if (isUp && !up) hops++; up = isUp; }); const x = ball.x; stageStop(); return { hops, x }; };
      const before = go(); TT.answer(a); return { before, after: go(), bramble: TT.sp('Bramble').x };
    }, a);
    ok(r.before.hops === 1 && r.after.hops === 5 && r.after.x === 456 && r.after.x < r.bramble, 'Bounce the ball: the starter bounces once; repeat 5 (move right 1, hop) bounces 5 times to Bramble ' + JSON.stringify(r));
  },
  'theatre-5-wake': async (page, a) => {
    const r = await page.evaluate(a => {
      const P = TT.sp('Pip'), B = TT.sp('Bramble'), D = TT.sp('Dot');
      const go = () => {
        const y0 = P.y, dy0 = D.y; let hop = false, fly = false;
        TT.run(220, f => { if (f === 20) TT.click('Pip'); if (f === 80) TT.click('Dot'); if (f > 20 && P.y < y0 - 10) hop = true; if (D.y < dy0 - 60) fly = true; });
        const out = { pip: P.say, hop, fly, bramble: B.size, brambleSays: B.say };
        TT.run(60, f => { if (f === 10) TT.click('Bramble'); }); out.bramble2 = B.size; out.brambleSays2 = B.say; stageStop(); return out;
      };
      const before = go(); TT.answer(a); return { before, after: go() };
    }, a);
    ok(r.before.pip === 'Zzz…' && !r.before.hop && !r.before.fly && r.before.bramble2 === 100, 'Wake up the cast: in the starter tapping does nothing ' + JSON.stringify(r.before));
    ok(r.after.pip === 'Good morning!' && r.after.hop && r.after.fly && r.after.bramble === 100 && r.after.brambleSays === 'Zzz…' && r.after.bramble2 === 130 && r.after.brambleSays2 === 'Hello!',
      'Wake up the cast: each tap starts only that character’s script (Pip hops, Dot flies, Bramble grows) ' + JSON.stringify(r.after));
  },
  'theatre-6-show': async (page, a) => {
    const start = crit('theatre-6-show', await page.evaluate(() => TT.progs()));
    const r = await page.evaluate(a => { TT.answer(a); const P = TT.sp('Pip'), x0 = P.x; const said = TT.run(400, f => { if (f === 300) TT.click('Pip'); }); const out = { moved: P.x - x0, said: said.map(s => s.n + ':' + s.t) }; stageStop(); return { out, progs: TT.progs() }; }, a);
    const end = crit('theatre-6-show', r.progs);
    ok(!start.every(c => c.ok) && end.every(c => c.ok), 'Project: our first show — the empty starter meets none of the success criteria, the example meets them all ' + JSON.stringify(end.map(c => c.ok)));
    ok(r.out.moved === 144 && r.out.said.includes('Pip:Welcome to our show!') && r.out.said.includes('Pip:Thank you!'), 'Project: our first show — the example show runs (walks on, speaks, answers a tap) ' + JSON.stringify(r.out));
  },
  // ── Block 2 ──
  'theatre-7-joke': async (page, a) => {
    const r = await page.evaluate(a => {
      const go = () => { let both = 0; const said = TT.run(780, () => { if (TT.sp('Pip').say && TT.sp('Bramble').say) both++; }); stageStop(); return { said: said.map(s => s.n + ':' + s.t), both }; };
      const before = go(); TT.answer(a); return { before, after: go() };
    }, a);
    const want = ['Pip:Knock knock!', 'Bramble:Who’s there?', 'Pip:Pip!', 'Bramble:Pip who?', 'Pip:Pip pip hooray, the show is starting!'];
    ok(r.before.both > 60, 'The knock-knock joke: in the starter Bramble talks over Pip ' + JSON.stringify(r.before));
    ok(r.after.said.join('|') === want.join('|') && r.after.both <= 2, 'The knock-knock joke: with waits the five lines come in the right order, one at a time ' + JSON.stringify(r.after));
  },
  'stage-animate': async page => {
    const party = () => page.evaluate(() => {
      const [cat, bird, robot] = stageState.sprites, bx = bird.x, ry = robot.y; let changes = 0, last = cat.costumeIdx, at = null;
      stageStart();
      for (let i = 0; i < 450; i++) { if (i === 5) stageFireClick(bird.x, bird.y); stageFrame(); if (i === 75) at = [Math.round(bird.x - CW / 2), Math.round(CH / 2 - bird.y), bird.say]; if (cat.costumeIdx !== last) { changes++; last = cat.costumeIdx; } }
      keys.Space = true; stageFrame(); keys.Space = false; const up = ry - robot.y; for (let i = 0; i < 40; i++) stageFrame();
      const r = { changes, moved: bird.x !== bx, at, up, back: robot.y === ry }; stageStop(); return r;
    });
    const p0 = await party();
    await page.evaluate(() => {
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
    });
    const p1 = await party();
    ok(p0.changes === 0 && !p0.moved && !p0.back && p1.changes === 10 && p1.at.join() === '0,100,Tweet!' && p1.up === 40 && p1.back,
      'Animate a dance party: starter Cat doesn’t dance, Bird ignores clicks, Robot floats; after the steps all three work ' + JSON.stringify({ p0, p1 }));
  },
  'theatre-9-scenes': async (page, a) => {
    const r = await page.evaluate(a => {
      const go = () => { let day = -1; const said = TT.run(600, f => { if (day < 0 && stageState.backdropIdx === 1) day = f; }); const out = { day, sun: TT.sy(TT.sp('Sun')), said: said.map(s => [s.f, s.n, s.t]) }; stageStop(); return out; };
      const before = go(); TT.answer(a); return { before, after: go() };
    }, a);
    const f = (n, t) => (r.after.said.find(s => s[1] === n && s[2] === t) || [-1])[0];
    const dot = f('Dot', 'Tweet tweet!'), bram = f('Bramble', 'What a lovely morning!');
    ok(r.before.day < 0 && !r.before.said.some(s => s[1] !== 'Bramble'), 'Scene by scene: the starter stays night and nothing happens ' + JSON.stringify(r.before));
    ok(r.after.day > 0 && r.after.sun >= 170 && dot > r.after.day && bram > dot, 'Scene by scene: the sun rises, day comes, then Dot sings, then Bramble wakes — each part its own script ' + JSON.stringify({ day: r.after.day, sun: r.after.sun, dot, bram }));
  },
  'theatre-10-seats': async (page, a) => {
    const r = await page.evaluate(a => {
      const real = stStampSprite;
      const go = () => { const at = []; stStampSprite = s => { at.push([TT.sx(s), TT.sy(s)]); real(s); }; TT.run(120); stStampSprite = real; const hidden = TT.sp('Seat').visible === false; stageStop(); return { n: at.length, xs: new Set(at.map(p => p[0])).size, ys: [...new Set(at.map(p => p[1]))], hidden }; };
      const before = go(); TT.answer(a); return { before, after: go() };
    }, a);
    ok(r.before.n === 3 && r.after.n === 27 && r.after.xs === 9 && r.after.ys.join() === '-40,-110,-180' && r.after.hidden,
      'Fill the seats: the copied blocks stamp 3 seats; a repeat inside a repeat stamps 3 rows of 9 ' + JSON.stringify(r));
  },
  'theatre-11-rehearsal': async (page, a) => {
    const r = await page.evaluate(a => {
      const go = () => {
        let early = '';
        const said = TT.run(500, f => { if (f === 30) early = TT.sp('Bolt').say; if (f === 200) TT.click('Bolt'); if (f === 300) keys.Space = true; if (f === 301) keys.Space = false; });
        const out = { pip: TT.sx(TT.sp('Pip')), early, said: said.filter(s => s.n !== 'Pip').map(s => s.n + ':' + s.t) }; stageStop(); return out;
      };
      const before = go(); TT.answer(a); return { before, after: go() };
    }, a);
    ok(r.before.pip === -225 && r.before.early === 'Beep! Welcome!' && r.before.said.join() === 'Bolt:Beep! Welcome!,Dot:Goodbye!,Dot:Hello!', 'Debug the dress rehearsal: the starter has all three bugs ' + JSON.stringify(r.before));
    ok(r.after.pip === 0 && r.after.early === '' && r.after.said.join() === 'Bolt:Beep! Welcome!,Dot:Hello!,Dot:Goodbye!', 'Debug the dress rehearsal: fixed — Pip walks to the middle, Bolt waits for a click, Dot says hello first ' + JSON.stringify(r.after));
  },
  'theatre-12-puppets': async (page, a) => {
    const start = crit('theatre-12-puppets', await page.evaluate(() => TT.progs()));
    const r = await page.evaluate(a => { TT.answer(a); const said = TT.run(600, f => { if (f === 500) { keys.Space = true; } if (f === 501) keys.Space = false; }); stageStop(); return { said: said.map(s => s.n + ':' + s.t), progs: TT.progs() }; }, a);
    const end = crit('theatre-12-puppets', r.progs);
    ok(!start.some(c => c.ok) && end.every(c => c.ok), 'Project: the puppet show — the empty starter meets no criteria, the example meets them all ' + JSON.stringify(end.map(c => c.ok)));
    ok(r.said.length >= 5 && r.said.includes('Dot:Tweet!'), 'Project: the puppet show — the example plays ' + JSON.stringify(r.said));
  },
  // ── Block 3 ──
  'catch-the-stars': async page => {
    const before = await page.evaluate(() => { TT.run(160); const s = stScore; stageStop(); return s; });
    const after = await page.evaluate(() => {
      const star = stageState.sprites[1];
      star.xml = star.xml.replace('</statement></block></next></block></statement></block>', '</statement><next><block type="st_if"><value name="COND"><block type="st_touching"><field name="TARGET">Catcher</field></block></value><statement name="DO"><block type="st_change_score"><field name="N">1</field><next><block type="st_goto"><field name="WHERE">_random</field><next><block type="st_set_y"><field name="Y">170</field></block></next></block></next></block></statement></block></next></block></next></block></statement></block>');
      stageSel = 1; stageLoadSpriteScripts(1); TT.run(160); const s = stScore; stageStop(); return s;
    });
    ok(before === 0 && after >= 1, `Catch the stars: the starter doesn't score; the if-touching block does (${before} → ${after})`);
  },
  'theatre-14-door': async (page, a) => {
    const knock = word => page.evaluate(word => {
      stageState.backdropIdx = 0; let asked = false;
      const said = TT.run(400, f => { if (f === 150) TT.click('Bolt'); if (f > 150 && stAsking && !asked) { asked = true; document.getElementById('stage-ask-in').value = word; stFinishAsk(); } });
      const out = { asked, said: said.map(s => s.t), bd: stageState.backdrops[stageState.backdropIdx].name }; stageStop(); return out;
    }, word);
    const b1 = await knock('please');
    await page.evaluate(a => TT.answer(a), a);
    const a1 = await knock('please'), a2 = await knock('pizza'), a3 = await knock('Please');
    ok(b1.asked && b1.said.includes('Hmm, let me think…') && b1.bd === 'Outside', 'The magic word: the starter asks but always answers the same ' + JSON.stringify(b1));
    ok(a1.said.includes('Come in!') && a1.bd === 'Backstage' && a2.said.includes('That’s not the magic word!') && a2.bd === 'Outside' && a3.bd === 'Outside',
      'The magic word: if/else lets “please” in (backstage) and keeps “pizza” (and “Please”) out ' + JSON.stringify({ a1, a2, a3 }));
  },
  'theatre-15-spotlight': async (page, a) => {
    const probe = () => page.evaluate(() => {
      const P = TT.sp('Pip'), out = {}; stageStart(); for (let i = 0; i < 5; i++) stageFrame();
      for (const x of [0, 250, -250, 140]) { P.x = CW / 2 + x; for (let i = 0; i < 3; i++) stageFrame(); out[x] = P.say; }
      keys.ArrowRight = true; for (let i = 0; i < 20; i++) stageFrame(); keys.ArrowRight = false; out.walked = TT.sx(P);
      stageStop(); return out;
    });
    const before = await probe(); await page.evaluate(a => TT.answer(a), a); const after = await probe();
    const L = 'I’m in the spotlight!', D = 'It’s dark out here!';
    ok(before[0] === L && before[250] === L && before[-250] === D, 'Stay in the spotlight: the starter only checks one side, so far right still says “in the spotlight” ' + JSON.stringify(before));
    ok(after[0] === L && after[140] === L && after[250] === D && after[-250] === D && after.walked > 0, 'Stay in the spotlight: “and” with two comparisons gets both sides right ' + JSON.stringify(after));
  },
  'theatre-16-curtain': async (page, a) => {
    const r = await page.evaluate(a => {
      const go = () => { let saidAt = -1, curtainY = null; TT.run(400, f => { if (saidAt < 0 && TT.sp('Pip').say) { saidAt = f; curtainY = TT.sy(TT.sp('Curtain')); } }); const out = { saidAt, curtainY, shown: TT.sp('Curtain').visible !== false, top: TT.sy(TT.sp('Curtain')) }; stageStop(); return out; };
      const before = go(); TT.answer(a); return { before, after: go() };
    }, a);
    ok(r.before.shown && r.before.curtainY < 50, 'Raise the curtain: in the starter the curtain never goes away and Pip talks behind it ' + JSON.stringify(r.before));
    ok(!r.after.shown && r.after.saidAt > 30 && r.after.curtainY > 250, 'Raise the curtain: repeat until stops and hides the curtain; wait until makes Pip wait for it ' + JSON.stringify(r.after));
  },
  'theatre-17-lights': async (page, a) => {
    const r = await page.evaluate(a => {
      const go = () => {
        let changes = 0, last = TT.sp('Spot').costumeIdx;
        const said = TT.run(320, f => { keys.Space = f >= 60 && f < 100; const c = TT.sp('Spot').costumeIdx; if (c !== last) { changes++; last = c; } });
        keys.Space = false; const P = TT.sp('Pip'), S = TT.sp('Spot');
        const out = { pip: TT.sx(P), follows: Math.abs(S.x - P.x) < 1, changes, bravo: said.some(s => s.n === 'Dot' && s.t === 'Bravo!') }; stageStop(); return out;
      };
      const before = go(); TT.answer(a); return { before, after: go() };
    }, a);
    ok(r.before.pip === -300 && r.before.changes === 0 && !r.before.bravo, 'Debug the light show: the starter has three bugs (Pip never walks, the light never changes, Dot never cheers) ' + JSON.stringify(r.before));
    ok(r.after.pip > 200 && r.after.follows && r.after.changes >= 2 && r.after.bravo, 'Debug the light show: fixed — Pip walks until x > 200, the light follows and changes while space is held, Dot cheers ' + JSON.stringify(r.after));
  },
  'theatre-18-games': async (page, a) => {
    const start = crit('theatre-18-games', await page.evaluate(() => TT.progs()));
    const r = await page.evaluate(a => { TT.answer(a); const said = TT.run(400); const out = { score: stScore, said: said.map(s => s.n + ':' + s.t), progs: TT.progs() }; stageStop(); return out; }, a);
    const end = crit('theatre-18-games', r.progs);
    ok(!start.some(c => c.ok) && end.every(c => c.ok), 'Project: games night — the empty starter meets no criteria, the example meets them all ' + JSON.stringify(end.map(c => c.ok)));
    ok(r.score === 3 && r.said.includes('Ball:You win!'), 'Project: games night — the example game can be won ' + JSON.stringify({ score: r.score, said: r.said }));
  },
  // ── Block 4 ──
  'theatre-19-tickets': async (page, a) => {
    const sell = (n, preset) => page.evaluate(([n, preset]) => {
      const said = TT.run(100 + n * 80, f => { if (f === 130 && preset != null) stVars.seats = preset; if (f >= 150 && (f - 150) % 80 === 0 && (f - 150) / 80 < n) TT.click('Biscuit'); });
      const out = { seats: stVars.seats, sold: stVars.sold, shown: !!stVarShown.seats, said: said.map(s => s.t) }; stageStop(); return out;
    }, [n, preset]);
    const b1 = await sell(3);
    await page.evaluate(a => TT.answer(a), a);
    const a1 = await sell(3), a2 = await sell(2, 1);
    ok(b1.seats === undefined && b1.sold === undefined, 'The ticket booth: the starter keeps no count ' + JSON.stringify(b1));
    ok(a1.seats === 17 && a1.sold === 3 && a1.shown && a2.seats === 0 && a2.said.includes('Sorry, sold out!'), 'The ticket booth: variables count the seats left and tickets sold, and it never sells a seat it hasn’t got ' + JSON.stringify({ a1, a2 }));
  },
  'microbit-rps': async page => {
    await page.waitForFunction(() => blocklyWorkspace && blocklyWorkspace.getAllBlocks(false).length > 4);
    const rps = await page.evaluate(() => {
      const m = stageState.sprites[0], seen = new Set(), shown = new Set();
      stageStart(); for (let i = 0; i < 5; i++) stageFrame();
      for (let k = 0; k < 40; k++) { stMbShake(m); for (let i = 0; i < 3; i++) stageFrame(); seen.add(stVars.hand); shown.add(stVars.hand + ':' + mbState(m).leds.join('').replace(/[1-9]/g, '1')); }
      stageStop(); return { seen: [...seen].sort(), shown: [...shown] };
    });
    const ROCK = '0000001110011100111000000';
    ok(rps.seen.join() === '1,2,3' && rps.shown.includes('1:' + ROCK), 'Rock, paper, scissors: a shake picks 1, 2 or 3 and 1 shows the rock (' + rps.seen + ')');
  },
  'theatre-21-cues': async (page, a) => {
    const r = await page.evaluate(a => {
      const go = () => {
        const at = {};
        const said = TT.run(800, f => { if (at.lit == null && stageState.backdropIdx === 1) at.lit = f; if (at.up == null && TT.sp('Curtain').visible === false) at.up = f; });
        const g = (n, t) => (said.find(s => s.n === n && s.t === t) || { f: -1 }).f;
        const out = Object.assign(at, { sing: g('Dot', 'La la laaa!'), bravo: g('Bolt', 'Bravo, Dot!') }); stageStop(); return out;
      };
      const before = go(); TT.answer(a); return { before, after: go() };
    }, a);
    ok(r.before.lit == null && r.before.sing < 0, 'On cue: in the starter Bolt calls the cues but nobody hears them ' + JSON.stringify(r.before));
    ok(r.after.lit > 0 && r.after.up > r.after.lit && r.after.sing > r.after.up && r.after.bravo >= r.after.sing + 120, 'On cue: broadcast and wait runs the cues in order — lights, curtain, song, then Bravo after the song ' + JSON.stringify(r.after));
  },
  'theatre-22-votes': async (page, a) => {
    const vote = () => page.evaluate(() => {
      const order = ['Pip', 'Dot', 'Pip', 'Bolt', 'Pip'];
      TT.run(500, f => { if (f >= 150 && f < 400 && (f - 150) % 50 === 0) TT.click(order[(f - 150) / 50]); if (f === 420) keys.Space = true; if (f === 421) keys.Space = false; });
      const out = { votes: (stLists.votes || []).slice(), count: stVars.count, shown: !!stListShown.votes }; stageStop(); return out;
    });
    const b1 = await vote(); await page.evaluate(a => TT.answer(a), a); const a1 = await vote();
    ok(b1.votes.length === 0 && b1.count === 0, 'The audience vote: in the starter clicks record nothing ' + JSON.stringify(b1));
    ok(a1.votes.join() === 'Pip,Dot,Pip,Bolt,Pip' && a1.count === 3 && a1.shown, 'The audience vote: each click adds to the list, and the loop counts 3 votes for Pip ' + JSON.stringify(a1));
  },
  'theatre-23-chorus': async (page, a) => {
    const r = await page.evaluate(a => {
      const go = () => { TT.run(60); const live = stClones.filter(c => !c._deleted); const out = { n: live.length, xs: [...new Set(live.map(c => TT.sx(c)))].sort((p, q) => p - q), shown: live.every(c => c.visible), hidden: TT.sp('Dancer').visible === false };
        TT.run(0); stageStop(); return out; };
      const before = go(); TT.answer(a); return { before, after: go() };
    }, a);
    ok(r.before.n === 0 && r.after.n === 6 && r.after.xs.join() === '-300,-180,-60,60,180,300' && r.after.shown && r.after.hidden, 'The chorus line: one script makes six dancing clones in a line ' + JSON.stringify(r));
  },
  'theatre-24-gala': async (page, a) => {
    const start = crit('theatre-24-gala', await page.evaluate(() => TT.progs()));
    const r = await page.evaluate(a => {
      TT.answer(a);
      const said = TT.run(900, f => { if (f === 20 || f === 40 || f === 60) TT.click('Pip'); });
      const out = { applause: stVars.applause, curtain: TT.sp('Curtain').visible, said: said.map(s => s.n + ':' + s.t), progs: TT.progs() }; stageStop(); return out;
    }, a);
    const end = crit('theatre-24-gala', r.progs);
    ok(!start.every(c => c.ok) && end.every(c => c.ok), 'Project: the grand show — the starter meets few criteria, the example meets them all ' + JSON.stringify({ start: start.map(c => c.ok), end: end.map(c => c.ok) }));
    ok(r.curtain === false && r.applause >= 3 && r.said.includes('Dot:La!') && r.said.includes('Bolt:What a crowd! Encore!'), 'Project: the grand show — the example show plays, counts applause and calls an encore ' + JSON.stringify({ applause: r.applause, said: r.said.slice(0, 12) }));
  }
};

try {
  const { page } = await openApp(b, site.url, { errors });
  await page.evaluate(`(${HELP.toString()})()`);
  for (const x of U.LESSONS) {
    const id = x.adopt || x.id, l = ALL.find(q => q.id === id);
    if (!l) continue;
    const o = await open(page, id);
    ok(o.ks === l.ks && (BUILD && T.SPECS[id] || (o.card && o.title.includes(l.title))), `${id}: the starter opens in the ${l.ks === 'ks1' ? 'picture-block' : 'blocks'} editor with its Lesson card (${o.names.join(', ')})`);
    if (T.SPECS[id]) ok(o.names.join() === T.SPECS[id].sprites.map(s => s.name).join(), `${id}: the starter has its sprites`);
    if (CHECKS[id]) await CHECKS[id](page, T.ANSWERS[id]);
    else ok(false, `${id}: has a check`);
  }
} catch (e) { ok(false, 'unit-stage test crashed: ' + (e.stack || e)); }
ok(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 5).join(' | ') : ''));
await b.close(); site.close();
done();
