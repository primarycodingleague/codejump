// Sky Isles Explorers — the Platformer Lab's lesson unit (lessons/units/platformer.js, 24 lessons in 4 blocks).
// Every lesson is complete; every starter opens in the real app with its Lesson card; and for every lesson that is not a
// project, the lesson's answer really does what the lesson promises in the real game engine, while the bare starter
// does not. A small "pupil" (window.__bot) plays the levels: it holds Right and jumps at walls and at the edge of gaps.
// Projects (lesson 6 of each block): the starter opens and a sample game meets the success criteria.
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, serve, browser, openApp, ok, done, sleep } from './lib.mjs';

const { LESSONS } = await import(join(ROOT, 'lessons', 'lessons.js'));
const UNIT = 'Sky Isles Explorers';
const unit = LESSONS.filter(l => (l.unit || '').startsWith(UNIT + ' · '));
const only = process.argv[2], want = id => !only || id.includes(only); // node unit-platformer.test.mjs sky-21 runs just that lesson's checks
const build = async id => (await import(pathToFileURL(join(ROOT, 'lessons', 'builds', id + '.mjs')).href)).makeArgs(ROOT);

// ---- the unit itself: 24 lessons in 4 blocks of 6, in order, each one complete
ok(unit.length === 24, UNIT + ': 24 lessons (' + unit.length + ')');
const YEARS = { 1: 'Years 1–2', 2: 'Years 3–4', 3: 'Years 4–5', 4: 'Years 5–6' };
unit.forEach((l, i) => {
  const n = Math.floor(i / 6) + 1, m = i + 1;
  const mins = l.plan.reduce((a, p) => a + p.min, 0), slides = l.slides || [];
  ok(l.unit === `${UNIT} · Block ${n} · Lesson ${m}` && l.years === YEARS[n] && l.ks === (n === 1 ? 'ks1' : 'ks2') && l.type === 'platformer' && l.minutes === 60 && mins === 60,
    `${l.id}: Block ${n} · Lesson ${m}, ${l.years}, ${l.ks}, 60 minutes (plan adds up to ${mins})`);
  const keys = n === 1 ? ['alg', 'debug1', 'predict', 'create1'] : ['design', 'ssr', 'reason', 'data', 'safe'];
  const adopted = ['level-for-a-friend', 'level-designers', 'code-the-rules'].includes(l.id); // the lab's existing lessons keep their own steps and slides
  ok(l.steps.length >= 5 && l.steps.length <= (adopted ? 9 : 7) && slides.length >= 4 && slides.length <= (adopted ? 7 : 6) && slides.some(s => s.use === 'steps') && slides.every(s => s.use || s.notes) &&
    l.curriculum.length && l.curriculum.every(k => keys.includes(k)) && l.words.length >= 3 && l.success.length >= 3 && l.assess.length >= 2,
    `${l.id}: ${l.steps.length} pupil steps, ${slides.length} slides with notes, curriculum ${l.curriculum.join('/')}`);
});
ok(unit.slice(0, 6).every(l => l.ks === 'ks1') && unit.filter((l, i) => i % 6 === 5).map(l => l.id).join() === 'level-for-a-friend,sky-12-island,sky-18-arcade,sky-24-tour',
  'Lesson 6 of every block is the design-and-make project (Block 1 uses the existing “Make a level for a friend”)');
ok(['level-for-a-friend', 'level-designers', 'code-the-rules'].every(id => unit.some(l => l.id === id)), 'the lab’s existing lessons are folded into the unit');
const text = JSON.stringify(unit);
ok(!/minecraft|scratch|tinkercad|autodesk|intelino|ohbot|bamzooki|flock|code\.org|barefoot/i.test(text), 'no other product’s names in the unit');

const site = await serve();
const b = await browser();
const errors = [];
try {
  const { page } = await openApp(b, site.url, { errors });
  await page.setViewportSize({ width: 1280, height: 720 });
  // the in-page "pupil", and recorders for messages and sounds
  await page.evaluate(() => {
    window.__bot = (o = {}) => new Promise(res => {
      const R = o.right || 'ArrowRight', J = o.jump || 'Space', t0 = performance.now(), ms = o.ms || 8000; let jt = 0;
      const end = () => { clearInterval(iv); keys[R] = false; keys[J] = false; res({ win: !document.getElementById('ov-win').classList.contains('hide'), x: player && Math.round(player.x), lives, score, page: playLevel }); };
      const iv = setInterval(() => {
        if (!playing || mode !== 'play' || performance.now() - t0 > ms || (o.untilPage != null && playLevel === o.untilPage)) return end();
        if (!player || player.dead) return;
        keys[R] = true;
        const foot = Math.floor((player.y + PH - 1) / TS), col = Math.floor((player.x + PW + 4) / TS);
        const wall = isSolid(col, foot) || isSolid(col, foot - 1), gap = !o.walk && !isSolid(Math.floor((player.x + PW + 8) / TS), foot + 1);
        if (jt > 0) { jt--; if (jt === 0) keys[J] = false; } else if (player.onGround && (wall || gap)) { keys[J] = true; jt = 14; }
      }, 16);
    });
    window.__said = []; window.__sfx = [];
    const t0 = toast, s0 = playSfx;
    toast = (m, bg) => { window.__said.push(String(m)); return t0(m, bg); };
    playSfx = n => { window.__sfx.push([n, tick]); return s0(n); };
  });
  const ev = (fn, arg) => page.evaluate(fn, arg);
  const open = async id => {
    await ev(id => { clearDirty(); window.__lsOpen = lessonOpenStarter(id); }, id); // not returned: a big starter's promise can be collected
    await page.waitForFunction(id => lessonActive && lessonActive.id === id && projectType === 'platformer' && mode === 'build', id, { timeout: 60000 });
    await page.waitForFunction(() => !document.getElementById('lesson-guide').classList.contains('hide'));
    return ev(() => ({ ks: keyStage, pages: LEVELS.length, card: document.getElementById('lesson-guide').textContent }));
  };
  const code = async () => { await ev(() => { if (mode === 'play') switchMode('build'); switchMode('code'); }); // via Build: Play → Code → Play copies the page being played over the page being edited (a host bug)
    await page.waitForFunction(() => blocklyWorkspace && mode === 'code' && blocklyReady); await sleep(100); };
  const setXml = async xml => { await code(); await ev(x => { const ws = blocklyWorkspace; ws.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x), ws); readBlocklyConfig(); }, xml); };
  const play = async () => { await ev(() => { if (mode === 'play') switchMode('build'); window.__said.length = 0; window.__sfx.length = 0; switchMode('play'); }); await page.waitForFunction(() => mode === 'play' && playing && player); await sleep(250); };
  const testPage = async i => { await ev(i => { switchMode('build'); gotoLevel(i); window.__said.length = 0; testThisPage(); }, i); await page.waitForFunction(() => mode === 'play' && playing && player); await sleep(250); };
  const toBuild = () => ev(() => { switchMode('build'); });
  const bot = o => ev(o => __bot(o), o || {});
  const walk = async (ms, ...k) => { for (const x of k.length ? k : ['ArrowRight']) await page.keyboard.down(x); await sleep(ms); for (const x of k.length ? k : ['ArrowRight']) await page.keyboard.up(x); };
  const place = (c, r) => ev(([c, r]) => { player.x = c * TS + (TS - PW) / 2; player.y = r * TS + (TS - PH); player.vx = player.vy = 0; }, [c, r]);
  const st = () => ev(() => ({ page: playLevel, score, lives, x: Math.round(player.x), win: !document.getElementById('ov-win').classList.contains('hide'), dead: !document.getElementById('ov-dead').classList.contains('hide'), said: window.__said.slice(), sfx: window.__sfx.slice(), timer: Math.ceil(gameTimer / 60) }));
  const said = () => ev(() => window.__said.slice());
  const paint = (cells, i = 0) => ev(([cells, i]) => { switchMode('build'); gotoLevel(i); for (const [r, c, t] of cells) grid[r][c] = T[t]; commitLevel(); }, [cells, i]);
  const vars = () => ev(() => { const o = {}; for (const v of blocklyWorkspace.getAllVariables()) o[v.name] = runVars[v.getId()]; return o; });
  const hurtAt = async (c, r) => { await place(c, r - 1); await page.waitForFunction(() => player.dead || player.inv > 0, null, { timeout: 4000 }).catch(() => {}); await place(1, r - 1); await page.waitForFunction(() => !player.dead && player.inv === 0, null, { timeout: 6000 }).catch(() => {}); };

  // ---- every starter opens as a platformer with its Lesson card, in the right key stage
  for (const l of unit.filter(l => want(l.id))) {
    const o = await open(l.id);
    ok(o.ks === l.ks && o.card.includes(l.steps[0].t), `${l.id}: the starter opens in the Platformer Lab (${o.ks}, ${o.pages} page${o.pages > 1 ? 's' : ''}) with its Lesson card`);
  }

  // ================= Block 1 (Years 1–2, Key Stage 1) =================
  if (want('sky-1-map')) { // 1 Follow the map: no Start or Finish, so it can't be played; following Captain Wren's map makes a level Pip can finish
    await open('sky-1-map');
    const refused = await ev(() => { switchMode('play'); return { mode, toast: document.getElementById('toast').textContent }; });
    await paint([[10, 1, 'START'], [10, 18, 'GOAL'], [11, 8, 'PLATFORM'], [11, 9, 'PLATFORM'], [11, 10, 'PLATFORM'], [11, 11, 'PLATFORM']]);
    await play(); const r = await bot();
    ok(refused.mode === 'build' && /Add a Finish/.test(refused.toast) && r.win && r.lives === 3, 'Follow the map: the starter can’t be played (no Finish); following the map (Start, Finish, a 4-block bridge) Pip reaches the Finish without losing a life ' + JSON.stringify(r));
  }
  if (want('sky-2-steps')) { // 2 Step by step: the cliff is too high; steps 1, 2, 3 high in that order work, the wrong order doesn't
    await open('sky-2-steps');
    await play(); const s = await bot({ ms: 6000 });
    await paint([[10, 9, 'PLATFORM'], [9, 9, 'PLATFORM'], [8, 9, 'PLATFORM'], [10, 10, 'PLATFORM'], [9, 10, 'PLATFORM'], [10, 11, 'PLATFORM']]);
    await play(); const wrong = await bot({ ms: 6000 });
    await paint([[9, 9, 'EMPTY'], [8, 9, 'EMPTY'], [9, 11, 'PLATFORM'], [8, 11, 'PLATFORM']]);
    await play(); const right = await bot({ ms: 8000 });
    ok(!s.win && !wrong.win && right.win, 'Step by step: the starter’s cliff is too high, steps in the wrong order (3, 2, 1) don’t work, steps 1, 2, 3 do ' + JSON.stringify({ s: s.x, wrong: wrong.x, right: right.win }));
  }
  if (want('sky-3-bounce')) { // 3 Predict and fix: the mushroom is too far away and a wall blocks the Finish
    await open('sky-3-bounce');
    await play(); await walk(5000); const s = await st();
    await paint([[11, 4, 'GRASS'], [11, 12, 'BOUNCE']]);
    await play(); await walk(5000); const one = await st();
    await paint([[3, 16, 'EMPTY'], [4, 16, 'EMPTY'], [5, 16, 'EMPTY']]);
    await play(); await walk(5000); const both = await st();
    ok(!s.win && s.x < 13 * 48 && !one.win && one.x > 13 * 48 && both.win, 'Predict and fix: bug 1 — Pip bounces up but lands short of the island; with the mushroom moved next to it Pip lands on the island but bug 2 (the wall) stops him; with both fixed he reaches the Finish ' + JSON.stringify({ s: s.x, one: one.x, both: both.win }));
  }
  if (want('sky-4-stones')) { // 4 Stepping stones: repeat the pattern (spike, spike, stone, stone with a gem) 3 times
    await open('sky-4-stones');
    await play(); const s = await bot({ ms: 9000 });
    await paint([[11, 10, 'PLATFORM'], [11, 11, 'PLATFORM'], [10, 11, 'GEM'], [11, 14, 'PLATFORM'], [11, 15, 'PLATFORM'], [10, 15, 'GEM']]);
    await play(); const r = await bot({ ms: 9000 });
    ok(!s.win && r.win && r.score === 30 && r.lives === 3, 'Stepping stones: the starter’s lake can’t be crossed; with the pattern repeated 3 times Pip hops across, collects 3 gems and wins ' + JSON.stringify({ s, r }));
  }
  if (want('sky-5-keys')) { // 5 Pip's new controls: events. D and W do nothing at first; adding the two events makes them work
    await open('sky-5-keys');
    const A = await build('sky-5-keys');
    await code(); await play();
    const x0 = (await st()).x; await walk(600, 'KeyD'); const x1 = (await st()).x;
    const s = await bot({ right: 'KeyD', jump: 'KeyW', ms: 4000 });
    await setXml(A.ANSWER); await play();
    const y0 = (await st()).x; await walk(600, 'KeyD'); const y1 = (await st()).x;
    const r = await bot({ right: 'KeyD', jump: 'KeyW', ms: 8000 });
    const win = await page.textContent('#ov-win'), music = await ev(() => gameConfig.music);
    ok(x1 === x0 && !s.win && y1 > y0 + 40 && r.win && /Well done, Pip!/.test(win) && music === 'happy',
      'Pip’s new controls: in the starter D does nothing; with “when D key is pressed → move right” and “when W key is pressed → jump” Pip moves and wins, and “when game starts” plays Happy music and sets the win message ' + JSON.stringify({ starter: x1 - x0, answer: y1 - y0, win: r.win }));
  }
  if (want('level-for-a-friend')) { // 6 Project: Make a level for a friend — the starter has a gap; a bridge and some stars make a level a friend can finish
    await open('level-for-a-friend');
    await play(); const s = await bot({ ms: 7000 });
    await paint([7, 8, 9, 10, 11, 12].map(c => [11, c, 'PLATFORM']).concat([[9, 5, 'STAR'], [8, 9, 'PLATFORM'], [7, 9, 'STAR']]));
    await play(); const r = await bot({ ms: 9000 });
    ok(r.win, 'Make a level for a friend (project): a bridge over the gap makes a level that can be finished ' + JSON.stringify({ starterWin: s.win, r }));
  }

  // ================= Block 2 (Years 3–4) =================
  if (want('sky-7-islands')) { // 7 Plan the islands: three pages, three problems; each part is solved and tested on its own with "This Page"
    await open('sky-7-islands');
    const A = await build('sky-7-islands');
    await testPage(0); const p1 = await bot({ ms: 6000, untilPage: 1 });
    await testPage(1); await walk(4000, 'ArrowRight', 'ArrowUp'); const p2 = await st();
    await testPage(2); await walk(4500); const p3 = await st();
    ok(p1.page === 0 && p2.page === 1 && !p3.win, 'Plan the islands: in the starter none of the three parts can be done ' + JSON.stringify({ p1: p1.page, p2: p2.page, p3: p3.win }));
    for (let i = 0; i < 3; i++) await paint(A.FIX[i], i);
    await testPage(0); const q1 = await bot({ ms: 6000, untilPage: 1 });
    await testPage(1); await walk(5000, 'ArrowRight', 'ArrowUp'); await walk(2500); const q2 = await st();
    await testPage(2); await walk(4500); const q3 = await st();
    ok(q1.page === 1 && q2.page === 2 && q3.win, 'Plan the islands: part 1 (bridge + Door) leads to page 2, part 2 (ladder + Door on top) leads to page 3, part 3 (Bounce! mushroom) reaches the Finish ' + JSON.stringify({ q1: q1.page, q2: q2.page, q3: q3.win }));
  }
  if (want('level-designers')) { // 8 Level designers (existing lesson): the backwards controls and the unreachable gem
    await open('level-designers');
    await code(); await play();
    let x0 = (await st()).x; await walk(700); let x1 = (await st()).x;
    await code();
    await ev(() => blocklyWorkspace.getTopBlocks(false).forEach(b => { const n = b.getNextBlock(); if (b.type !== 'when_key_pressed' || !n) return; if (n.type === 'player_move_right') b.setFieldValue('right', 'KEY'); if (n.type === 'player_move_left') b.setFieldValue('left', 'KEY'); }));
    await play(); const y0 = (await st()).x; await walk(700); const y1 = (await st()).x;
    await paint([[9, 13, 'PLATFORM'], [9, 14, 'PLATFORM'], [9, 15, 'PLATFORM']]);
    await play();
    for (const [c, r] of [[5, 8], [11, 10], [14, 8], [14, 4]]) { await place(c, r); await sleep(350); }
    await place(18, 10); await sleep(500);
    const w = await st();
    ok(x1 < x0 - 20 && y1 > y0 + 20 && w.win && w.score === 30, 'Level designers: the Right Arrow moves left until the events are fixed; with a platform as a step every gem can be collected and the game is won ' + JSON.stringify({ starter: x1 - x0, fixed: y1 - y0, score: w.score }));
  }
  if (want('sky-9-welcome')) { // 9 Captain Wren's welcome: a longer sequence of messages and waits, in order
    await open('sky-9-welcome');
    const A = await build('sky-9-welcome');
    await code(); await play(); await sleep(3000); const s = await said();
    await setXml(A.ANSWER); await play();
    const seen = []; const t0 = Date.now();
    while (Date.now() - t0 < 12000) { const m = await ev(() => document.getElementById('toast').textContent); if (seen[seen.length - 1] !== m) seen.push(m); if (m === 'Go!') break; await sleep(100); }
    const want = ['Welcome to the Sky Isles!', 'Collect the sun gems.', 'Watch out for the spiky rocks!', '3', '2', '1', 'Go!'];
    ok(s.join('|') === 'Welcome to the Sky Isles!', 'Captain Wren’s welcome: the starter shows one message (' + s.join('|') + ')');
    ok(seen.filter(m => want.includes(m)).join('|') === want.join('|') && Date.now() - t0 > 8000, 'Captain Wren’s welcome: the finished sequence shows all 7 messages in order, one at a time (' + Math.round((Date.now() - t0) / 1000) + ' s)');
  }
  if (want('sky-10-repeat')) { // 10 Sun gem fanfare: copies → repeat 4; a sun gem bonus that counts up with repeat 5
    await open('sky-10-repeat');
    const A = await build('sky-10-repeat');
    const fan = () => ev(() => { const h = blocklyWorkspace.getTopBlocks(false).find(b => b.type === 'when_game_starts'); return h.getDescendants(false).filter(b => b.type === 'play_sound' || b.type === 'wait_seconds' || b.type === 'controls_repeat_ext').length; });
    await code(); const fs = await fan(); await play(); await sleep(2600);
    const sj = (await st()).sfx.filter(x => x[0] === 'jump').length;
    await place(3, 10); await sleep(1500); const sg = (await st()).score;
    await setXml(A.ANSWER); const fa = await fan(); await play(); await sleep(2600);
    const aj = (await st()).sfx.filter(x => x[0] === 'jump').length;
    await place(3, 10); await sleep(300); const mid = (await st()).score; await sleep(1500); const ag = (await st()).score;
    ok(fs === 8 && fa === 3 && sj === 4 && aj === 4, 'Sun gem fanfare: repeat 4 { play sound; wait } plays the same 4 notes as the 8 copied blocks, with 3 blocks (' + JSON.stringify({ starter: [fs, sj], answer: [fa, aj] }) + ')');
    ok(sg === 10 && ag === 60 && mid > 10 && mid < 60, 'Sun gem fanfare: a sun gem is worth 10 in the starter; with repeat 5 { change score by 10 … wait 0.2 } it is worth 60 and the score counts up (' + [sg, mid, ag].join(' → ') + ')');
  }
  if (want('sky-11-debug')) { // 11 Fix the lighthouse show: countdown order, repeat 50 → 5, the wait inside the repeat
    await open('sky-11-debug');
    const A = await build('sky-11-debug');
    const run = async () => {
      await play(); await sleep(3600);
      const order = (await said()).filter(m => /^[123]$|^Go!$/.test(m)).join(',');
      await place(3, 10); await sleep(1600);
      const s = await st(), coins = s.sfx.filter(x => x[0] === 'coin').map(x => x[1]);
      return { order, score: s.score, spread: coins.length ? coins[coins.length - 1] - coins[0] : -1, coins: coins.length };
    };
    await code(); const bug = await run();
    await setXml(A.ANSWER); const fix = await run();
    ok(bug.order === '1,2,3,Go!' && bug.score === 510 && bug.coins === 50 && bug.spread <= 1, 'Fix the lighthouse show: the starter counts 1, 2, 3, pays 500 for a gem and all its coins arrive at once ' + JSON.stringify(bug));
    ok(fix.order === '3,2,1,Go!' && fix.score === 60 && fix.coins === 5 && fix.spread >= 40, 'Fix the lighthouse show: fixed, it counts 3, 2, 1, pays 50 for a gem, one coin at a time ' + JSON.stringify(fix));
  }
  if (want('sky-12-island')) { // 12 Project: Island challenge — a sample game with a welcome sequence, a repeat and two more events
    await open('sky-12-island');
    const A = await build('sky-12-island');
    await setXml(A.SAMPLE); await play(); await sleep(4500);
    const w = await said(); await place(4, 10); await sleep(1000); const g = await st();
    await hurtAt(7, 11); const h = await said();
    await play(); const r = await bot({ ms: 9000 });
    ok(w.includes('Welcome to my island!') && w.includes('Go!') && g.score === 40 && h.includes('Ouch! Mind the spikes!') && r.win, 'Island challenge (project): a welcome sequence, a repeat (gem bonus) and a hurt event all work, and the island can be finished ' + JSON.stringify({ score: g.score, win: r.win }));
  }

  // ================= Block 3 (Years 4–5) =================
  if (want('sky-13-enough')) { // 13 Enough sun gems? — if score = 50 then go to the next page
    await open('sky-13-enough');
    const A = await build('sky-13-enough');
    const collect = async n => { for (const [c, r] of A.GEMS.slice(0, n)) { await place(c, r); await sleep(250); } };
    await code(); await play(); await collect(5); await sleep(1500); const s = await st();
    await setXml(A.ANSWER); await play(); await collect(4); await sleep(1500); const four = await st();
    await collect(5); await sleep(1600); const five = await st();
    ok(s.page === 0 && s.score === 50, 'Enough sun gems?: in the starter, collecting all 5 gems leaves Pip on Sun Gem Island ' + JSON.stringify({ page: s.page, score: s.score }));
    ok(four.page === 0 && five.page === 1 && five.said.includes('The sky bridge is open!'), 'Enough sun gems?: with “if score = 50” Pip stays after 4 gems and crosses to Mist Island after the 5th ' + JSON.stringify({ four: four.page, five: five.page }));
  }
  if (want('sky-14-ouch')) { // 14 Ouch or last life? — if lives > 1 … else …
    await open('sky-14-ouch');
    const A = await build('sky-14-ouch');
    await code(); await play(); await hurtAt(6, 11); await hurtAt(12, 11); const s = await st();
    await setXml(A.ANSWER); await play(); await hurtAt(6, 11); await hurtAt(12, 11); const r = await st();
    ok(s.said.filter(m => m === 'Ouch!').length === 2 && s.lives === 1, 'Ouch or last life?: the starter says “Ouch!” every time ' + JSON.stringify(s.said));
    ok(r.lives === 1 && r.said.includes('Ouch! Lives left: 2') && r.said.includes('Last life! Be careful!') && !r.said.includes('Ouch!') && r.sfx.some(x => x[0] === 'zap'), 'Ouch or last life?: with if/else it says “Ouch! Lives left: 2”, then “Last life! Be careful!” (and zaps) ' + JSON.stringify(r.said.filter(m => /Ouch|Last/.test(m))));
  }
  if (want('sky-15-medals')) { // 15 Speed medals — > and else if, and "and"
    await open('sky-15-medals');
    const A = await build('sky-15-medals');
    const race = async (secs, lives) => { await play(); await ev(([s, l]) => { gameTimer = s * 60; lives = l; }, [secs, lives]); await place(18, 10); await sleep(5000); return st(); };
    await code(); const s = await race(52, 3);
    await setXml(A.ANSWER);
    const gold = await race(52, 3), silver = await race(32, 3), bronze = await race(12, 3), hurt = await race(52, 2);
    const has = (r, m) => r.said.includes(m);
    ok(s.page === 1 && has(s, 'Welcome to the medal podium!') && !s.said.some(m => /medal!/.test(m) && !/podium/.test(m)) && s.score === 0, 'Speed medals: the starter only welcomes you to the podium');
    ok(has(gold, 'Gold medal!') && has(gold, 'Perfect run!') && gold.score === 400 && has(silver, 'Silver medal!') && silver.score === 200 && has(bronze, 'Bronze medal!') && bronze.score === 100 && has(hurt, 'Gold medal!') && !has(hurt, 'Perfect run!') && hurt.score === 300,
      'Speed medals: > and else if give Gold, Silver or Bronze by seconds left, and “lives = 3 and seconds left > 40” adds Perfect run! ' + JSON.stringify([gold.score, silver.score, bronze.score, hurt.score]));
  }
  if (want('sky-16-storm')) { // 16 Storm warning — repeat until seconds left < 20
    await open('sky-16-storm');
    const A = await build('sky-16-storm');
    const go = async () => { await play(); await ev(() => { gameTimer = 23 * 60; }); await sleep(2000); const early = (await said()).includes('The storm is coming! Hurry!'); await sleep(4500); return { early, late: (await said()).includes('The storm is coming! Hurry!'), zap: (await st()).sfx.some(x => x[0] === 'zap'), t: (await st()).timer }; };
    await code(); const s = await go();
    await setXml(A.ANSWER); const r = await go();
    ok(!s.early && !s.late, 'Storm warning: the starter never warns you');
    ok(!r.early && r.late && r.zap, 'Storm warning: repeat until seconds left < 20 { wait 1 } waits, then warns (and zaps) once fewer than 20 seconds are left ' + JSON.stringify(r));
  }
  if (want('sky-17-debug')) { // 17 Fix the weather station — a loop with no wait, > instead of ≥, if/else the wrong way round
    await open('sky-17-debug');
    const A = await build('sky-17-debug');
    const run = async () => {
      await play(); await sleep(600); const halt = (await said()).some(m => /ran too long/.test(m));
      await ev(() => { gameTimer = 22 * 60; });
      await hurtAt(12, 11); const first = (await said()).find(m => /Ouch|Last life/.test(m));
      for (const [c, r] of A.GEMS) { await place(c, r); await sleep(250); }
      await sleep(4000); const s = await st();
      return { halt, first, page: s.page, storm: s.said.includes('The storm is coming! Hurry!') };
    };
    await code(); const bug = await run();
    await setXml(A.ANSWER); const fix = await run();
    ok(bug.halt && !bug.storm && bug.page === 0 && bug.first === 'Last life! Be careful!', 'Fix the weather station: the starter’s loop runs too long and is stopped, 5 gems don’t open the bridge, and the first hurt says “Last life!” ' + JSON.stringify(bug));
    ok(!fix.halt && fix.storm && fix.page === 1 && fix.first === 'Ouch! Lives left: 2', 'Fix the weather station: fixed, the storm warning comes, 5 gems open the bridge and the first hurt says “Ouch! Lives left: 2” ' + JSON.stringify(fix));
  }
  if (want('sky-18-arcade')) { // 18 Project: Sky arcade — a sample game that makes decisions
    await open('sky-18-arcade');
    const A = await build('sky-18-arcade');
    await setXml(A.SAMPLE); await play(); await ev(() => { gameTimer = 32 * 60; });
    await place(4, 10); await sleep(300); const keep = (await said()).includes('Keep collecting!');
    for (const [c, r] of [[9, 8], [11, 10], [16, 10]]) { await place(c, r); await sleep(300); }
    await hurtAt(6, 11); await sleep(3500); const s = await st();
    ok(keep && s.said.includes('All the gems! Bonus!') && s.score === 140 && s.said.includes('Ouch!') && s.said.includes('30 seconds left!'), 'Sky arcade (project): a sample game with if/else, comparisons and a loop that checks a condition works ' + JSON.stringify({ score: s.score }));
  }

  // ================= Block 4 (Years 5–6) =================
  if (want('code-the-rules')) { // 19 Code the rules (existing lesson): no countdown at first; the lesson's time variable counts down every second
    await open('code-the-rules');
    await code(); await play(); await sleep(2300); const s = await st();
    await ev(() => {
      const ws = blocklyWorkspace; ws.createVariable('time', '', 'TIME');
      const xml = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="variables_set" id="setTime" x="150" y="420"><field name="VAR" id="TIME">time</field><value name="VALUE"><block type="math_number"><field name="NUM">30</field></block></value></block>' +
        '<block type="every_n_seconds" x="480" y="150"><field name="N">1</field><next><block type="math_change"><field name="VAR" id="TIME">time</field><value name="DELTA"><shadow type="math_number"><field name="NUM">-1</field></shadow></value></block></next></block></xml>';
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), ws);
      ws.getAllBlocks(false).find(b => b.type === 'set_music').nextConnection.connect(ws.getBlockById('setTime').previousConnection);
    });
    await play(); await sleep(2400); const t = (await vars()).time;
    ok(s.lives === 3 && !s.said.length && t === 28, 'Code the rules: the starter has no rules that change; the lesson’s time variable counts down every second (' + t + ')');
  }
  if (want('sky-20-pilots')) { // 20 Test pilots — variables collect data, shown on page 2
    await open('sky-20-pilots');
    const A = await build('sky-20-pilots');
    const run = async () => {
      await play(); await sleep(2200); await hurtAt(7, 11);
      for (const [c, r] of A.GEMS.slice(0, 2)) { await place(c, r); await sleep(300); }
      await place(18, 10); await sleep(600); return st();
    };
    await code(); const s = await run();
    await setXml(A.ANSWER); const r = await run();
    const m = r.said.map(x => /^Time: (\d+) {2}Hurts: (\d+) {2}Gems: (\d+)$/.exec(x)).find(Boolean);
    ok(s.page === 1 && !s.said.some(x => /Time:/.test(x)), 'Test pilots: the starter collects no data');
    ok(r.page === 1 && m && +m[1] >= 3 && +m[1] <= 9 && m[2] === '1' && m[3] === '2', 'Test pilots: the variables count the seconds, hurts and gems, and page 2 shows the results (“' + (m && m[0]) + '”)');
  }
  if (want('sky-21-reward')) { // 21 Reward function — one function, three different inputs
    await open('sky-21-reward');
    const A = await build('sky-21-reward');
    const run = async () => {
      await play(); const out = [];
      await place(4, 10); await sleep(300); out.push((await st()).score);
      await place(9, 10); await sleep(300); out.push((await st()).score); await place(12, 10); await sleep(200);
      await place(18, 10); await sleep(700); out.push((await st()).score);
      return { out, said: await said() };
    };
    await code(); const s = await run();
    await setXml(A.ANSWER);
    const fn = await ev(() => { const ws = blocklyWorkspace, d = ws.getAllBlocks(false).filter(b => b.type === 'procedures_defnoreturn'); return { defs: d.length, args: d[0] ? d[0].getVars().length : 0, calls: ws.getAllBlocks(false).filter(b => b.type === 'procedures_callnoreturn').length }; });
    const r = await run();
    ok(s.out.join() === '15,65,65', 'Reward function: the starter pays 5 for a gem and 50 for the button, but nothing for reaching page 2 (' + s.out + ')');
    ok(fn.defs === 1 && fn.args === 1 && fn.calls === 3 && r.out.join() === '15,65,165' && ['+5', '+50', '+100'].every(x => r.said.includes(x)), 'Reward function: one function “reward” with the input points, called with 5, 50 and 100, gives each reward and says how many points (' + r.out + ')');
  }
  if (want('sky-22-shop')) { // 22 The sky shop — a price variable + buy(cost) with if/else, paid in points
    await open('sky-22-shop');
    const A = await build('sky-22-shop');
    const shop = async () => { await place(15, 10); await sleep(300); const s = await st(); await place(12, 8); await sleep(2600); return s; };
    await code(); await play(); for (const c of [3, 5, 11]) { await place(c, 10); await sleep(200); }
    const s = await shop();
    await setXml(A.ANSWER); await play();
    await place(3, 10); await sleep(200); await place(5, 10); await sleep(200);
    const poor = await shop();
    await place(11, 10); await sleep(200);
    const rich = await shop(); const v = await vars();
    ok(s.lives === 3 && s.score === 30, 'The sky shop: in the starter the shop button gives nothing');
    ok(poor.lives === 3 && poor.score === 20 && poor.said.includes('You need 30 points') && rich.lives === 4 && rich.score === 0 && rich.said.includes('Extra life! Points left: 0') && v.price === 30,
      'The sky shop: with 20 points buy(price) says “You need 30 points”; with 30 it takes them and gives an extra life ' + JSON.stringify({ poor: [poor.score, poor.lives], rich: [rich.score, rich.lives] }));
  }
  if (want('sky-23-debug')) { // 23 Fix the storm game — set vs change, a function ignoring its input, the wrong value in the condition
    await open('sky-23-debug');
    const A = await build('sky-23-debug');
    await code(); await play(); await sleep(3300); const b3 = (await vars()).storm, bs = (await said()).filter(m => /^Storm/.test(m));
    await place(4, 10); await sleep(1500); const bug = await st();
    await setXml(A.ANSWER); await play(); await sleep(3300); const f3 = (await vars()).storm, fs = (await said()).filter(m => /^Storm/.test(m));
    await place(4, 10); await sleep(150); const after = (await vars()).storm;
    const t0 = Date.now(); await page.waitForFunction(() => !document.getElementById('ov-dead').classList.contains('hide'), null, { timeout: 15000 }).catch(() => {});
    const fix = await st(), secs = (Date.now() - t0) / 1000;
    ok(b3 === 0 && bs.length >= 2 && bs.every(m => m === 'Storm: 1') && bug.dead, 'Fix the storm game: in the starter the storm never grows (' + b3 + '), report always says “Storm: 1”, and one sun gem ends the game');
    ok(f3 === 3 && fs.slice(0, 3).join() === 'Storm: 1,Storm: 2,Storm: 3' && after === 0 && fix.dead && secs > 6, 'Fix the storm game: fixed, the storm grows by 1 a second, report shows its input, a gem calms it by 3, and the storm wins at 10 (' + [f3, after, Math.round(secs)] + ')');
  }
  if (want('sky-24-tour')) { // 24 Project: The grand tour — a sample game using a variable, a function with an input, selection, a loop and events
    await open('sky-24-tour');
    const A = await build('sky-24-tour');
    await setXml(A.SAMPLE); await play();
    await place(5, 10); await sleep(300); await place(18, 10); await sleep(500);
    const p2 = await st(); await place(9, 10); await sleep(400); await place(16, 10); await sleep(600); await place(18, 10); await sleep(600);
    const p3 = await st(); await place(18, 10); await sleep(600); const end = await st(); const v = await vars();
    ok(p2.page === 1 && p2.said.includes('+10 points') && p3.page === 2 && p3.said.includes('+50 points') && p3.said.includes('Last island! Watch out for the Gloomer!') && v.coins === 1 && end.win,
      'The grand tour (project): a sample three-island game with a variable, a function with an input, selection, a loop and events works and can be finished ' + JSON.stringify({ score: end.score, coins: v.coins }));
  }
} catch (e) { ok(false, 'unit-platformer crashed: ' + (e && e.stack || e)); }
ok(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
await b.close(); site.close();
done();
