// Driftwood Bay Artists — the Turtle Lab's lesson unit (lessons/units/turtle.js, 18 lessons in 3 blocks).
// Every lesson is complete; every starter opens in the real app with its Lesson card; and for every lesson that isn't a
// project, the lesson's intended answer (lessons/builds/bay/bay.mjs ANSWERS, or the adopted lessons' own answers) does what
// the lesson promises while the bare starter does not — proven by running the Logo in the real app and reading back every
// line the turtle drew (start, end, colour, pen size) and every move it made. Project lessons: the starter opens, an example
// meets every success criterion and the bare starter doesn't.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, serve, browser, openApp, ok, done } from './lib.mjs';

const U = await import(pathToFileURL(join(ROOT, 'lessons', 'units', 'turtle.js')).href);
const B = await import(pathToFileURL(join(ROOT, 'lessons', 'builds', 'bay', 'bay.mjs')).href);
const { LESSONS: ALL } = await import(pathToFileURL(join(ROOT, 'lessons', 'lessons.js')).href);
const { STARTERS, ANSWERS } = B;
const ONLY_CODE = process.env.BAY_CODE === '1'; // just the Logo checks (for working on the unit)

// ───────── the unit's data ─────────
const NAME = 'Driftwood Bay Artists';
const UNIT = U.LESSONS.map(x => ALL.find(l => l.id === (x.adopt || x.id)));
if (!ONLY_CODE) {
  ok(UNIT.length === 18 && UNIT.every(Boolean), `18 lessons in the unit, all in the library (${UNIT.filter(Boolean).length})`);
  ok(new Set(ALL.map(l => l.id)).size === ALL.length, 'every lesson id in the library is different');
  ok(['turtle-shapes', 'turtle-procedures'].every(id => U.LESSONS.some(x => x.adopt === id)), 'the Turtle Lab’s two earlier lessons are folded into the unit');
  const YEARS = ['Years 3–4', 'Years 4–5', 'Years 5–6'];
  const words = /Scratch|ScratchJr|Minecraft|Tinkercad|Autodesk|intelino|Ohbot|Bamzooki|BBC|Flock|Flip Computing|Code\.org|Barefoot|Turtle Academy|TurtleAcademy/;
  UNIT.forEach((l, i) => {
    if (!l) return;
    l = Object.assign({ plan: [], steps: [], success: [], words: [], assess: [], need: [], curriculum: [], slides: [] }, l);
    const b = Math.floor(i / 6) + 1, m = i + 1, mins = l.plan.reduce((a, p) => a + p.min, 0), slides = l.slides || [];
    ok(l.unit === `${NAME} · Block ${b} · Lesson ${m}` && l.years === YEARS[b - 1] && l.ks === 'ks2' && l.type === 'turtle' && l.minutes === 60,
      `${l.id}: Block ${b} · Lesson ${m}, ${l.years}, ${l.ks}, 60 minutes`);
    ok(mins === 60 && l.steps.length >= 4 && l.steps.length <= 9 && l.success.length >= 2 && l.words.length >= 2 && l.assess.length >= 2 && l.support && l.stretch && l.objective && l.summary && l.need.length && l.title,
      `${l.id}: complete (plan ${mins} min, ${l.steps.length} pupil steps)`);
    ok(l.curriculum.length && l.curriculum.every(k => ['design', 'ssr', 'reason', 'data', 'safe'].includes(k)), `${l.id}: Key Stage 2 curriculum keys (${l.curriculum})`);
    ok(slides.length >= 4 && slides.length <= 7 && slides.some(s => s.use === 'steps') && slides.every(s => s.use || (s.t && s.notes)), `${l.id}: ${slides.length} slides with notes and a Your turn slide`);
    ok(!words.test(JSON.stringify(l)), `${l.id}: no other product’s names`);
    ok(existsSync(join(ROOT, 'lessons', 'starters', l.id + '.json')) && existsSync(join(ROOT, 'lessons', 'pics', l.id + '.jpg')), `${l.id}: starter + picture`);
    if (/^bay-/.test(l.id)) ok(STARTERS[l.id] && ANSWERS[l.id] && existsSync(join(ROOT, 'lessons', 'builds', l.id + '.mjs')), `${l.id}: starter program, answer and build file`);
  });
  ok(UNIT.filter((l, i) => i % 6 === 5).every(l => l && /^Project/.test(l.title)), 'lesson 6 of each block is a design-and-make project');
}

// ───────── geometry on what the turtle drew ─────────
const near = (s, x, y) => { const dx = s.x2 - s.x1, dy = s.y2 - s.y1, L = dx * dx + dy * dy; let t = L ? ((x - s.x1) * dx + (y - s.y1) * dy) / L : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(s.x1 + t * dx - x, s.y1 + t * dy - y); };
const inked = (segs, x, y, d = 2.5) => segs.some(s => near(s, x, y) <= d);
const pts = (x1, y1, x2, y2, step = 3) => { const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / step)), a = []; for (let i = 0; i <= n; i++) a.push([x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n]); return a; };
const covers = (segs, x1, y1, x2, y2) => pts(x1, y1, x2, y2).every(([x, y]) => inked(segs, x, y));
const rect = (segs, x, y, w, h) => covers(segs, x, y, x + w, y) && covers(segs, x + w, y, x + w, y + h) && covers(segs, x + w, y + h, x, y + h) && covers(segs, x, y + h, x, y);
const inkIn = (segs, x1, y1, x2, y2) => segs.some(s => pts(s.x1, s.y1, s.x2, s.y2, 1).some(([x, y]) => x > x1 && x < x2 && y > y1 && y < y2));
const col = (r, c) => r.segs.filter(s => s.c === c);
const C = { red: '#e53935', blue: '#1e88e5', gold: '#c9a227', orange: '#fb8c00', brown: '#6d4c41', pink: '#ec407a', yellow: '#fdd835', purple: '#8e24aa' };
const done1 = r => /Done/.test(r.status);
const pieces = segs => { let n = 0, p = null; for (const s of segs) { if (!p || Math.hypot(s.x1 - p.x2, s.y1 - p.y2) > 0.5 || s.c !== p.c) n++; p = s; } return n; };
const count = (code, re) => (code.replace(/;[^\n]*/g, '').match(re) || []).length;

// ───────── in the real app ─────────
const site = await serve();
const b = await browser();
const errors = [];
const { ctx, page } = await openApp(b, site.url, { errors });
await page.evaluate(() => {
  // Run a Logo program in the real Turtle Lab and record every line drawn and every move. rnd = values for Math.random.
  window.BAY = async (code, rnd) => {
    const segs = [], moves = [], oLine = turtleDrawLine, oMove = turtleMove, oR = Math.random; let k = 0;
    turtleDrawLine = function (x1, y1, x2, y2) { segs.push({ x1, y1, x2, y2, c: turtle.color, w: turtle.size }); return oLine.apply(this, arguments); };
    turtleMove = function* (d) { moves.push({ d, h: ((turtle.h % 360) + 360) % 360, x: turtle.x, y: turtle.y, c: turtle.color }); yield* oMove(d); };
    if (rnd) Math.random = () => rnd[k++ % rnd.length];
    try {
      const ta = document.getElementById('turtle-code'); ta.value = code; turtleSpeed = 10; turtleRun();
      for (let i = 0; i < 1500 && turtleRunning; i++) await new Promise(r => setTimeout(r, 20));
    } finally { turtleDrawLine = oLine; turtleMove = oMove; Math.random = oR; }
    const r = v => Math.round(v * 1000) / 1000;
    const d = turtleDrawCtx.getImageData(0, 0, turtleDraw.width, turtleDraw.height).data; let ink = 0, hash = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i]) { ink++; hash = (hash * 31 + i + d[i]) | 0; }
    return { status: document.getElementById('turtle-status').textContent.trim(), x: r(turtle.x), y: r(turtle.y), h: r(((turtle.h % 360) + 360) % 360),
      segs, moves, bg: turtleBg, ink, hash };
  };
});
await page.evaluate(() => startNewTurtle('ks2'));
const run = (code, rnd) => page.evaluate(([c, r]) => BAY(c, r), [code, rnd || null]);
const both = async id => [await run(STARTERS[id]), await run(ANSWERS[id])];
const sum = r => JSON.stringify({ status: r.status, x: r.x, y: r.y, h: r.h, segs: r.segs.length });

// ── Block 1 ──
{ // 1 Walk to the jetty: the route reaches the bottom of the jetty without crossing the rock pool or the sandcastle
  const [s, a] = await both('bay-1-jetty');
  const good = r => { const red = col(r, C.red); return done1(r) && Math.hypot(r.x - 200, r.y - 150) < 8 && !inkIn(red, -247, -47, -153, 47) && !inkIn(red, 53, 3, 147, 97); };
  const straight = await run(STARTERS['bay-1-jetty'].replace(/fd 100\n$/, 'fd 350\nrt 90\nfd 400\n'));
  ok(good(a) && !good(s) && !good(straight), 'Walk to the jetty: the answer’s route reaches the jetty round the rocks; the starter stops short, and straight up goes through the rock pool ' + sum(a) + sum(s));
}
{ // 2 A sign for the café: post, a closed blue board, a red arrow, and no stray line from the pen
  const [s, a] = await both('bay-2-sign');
  const good = r => { const bl = col(r, C.blue), red = col(r, C.red);
    return done1(r) && covers(col(r, C.brown), 0, -200, 0, -50) && rect(bl, -100, -50, 200, 80) && !inkIn(bl, -94, -44, 94, 24)
      && covers(red, -60, -10, 60, -10) && inked(red, 45, 5) && inked(red, 45, -25); };
  const noPu = await run(ANSWERS['bay-2-sign'].replace('pu setxy -60 -10 seth 90 pd\nsetpencolor "red', 'setxy -60 -10 seth 90\nsetpencolor "red'));
  ok(good(a) && !good(s) && !good(noPu), 'A sign for the café: the answer draws the post, a closed board and the arrow with the pen up in between; the starter has only the post, and forgetting pu leaves a stray line ' + sum(a));
}
{ // 3 Shapes with repeat (adopted): one repeat line draws the same square; triangle needs rt 120, hexagon rt 60, octagon rt 45
  const st = (await page.evaluate(() => fetch('lessons/starters/turtle-shapes.json').then(r => r.json()))).turtle.code;
  const s = await run(st), sq = await run('repeat 4 [fd 100 rt 90]');
  const shape = async (n, t) => { const r = await run(`repeat ${n} [fd 100 rt ${t}]`); return Math.hypot(r.x, r.y) < 0.01 && Math.abs(r.h % 360) < 0.01; };
  ok(done1(s) && count(st, /\brepeat\b/g) === 0 && sq.hash === s.hash && await shape(3, 120) && !(await shape(3, 60)) && await shape(6, 60) && await shape(8, 45),
    'Shapes with repeat: repeat 4 [fd 100 rt 90] draws exactly the starter’s eight-line square; turns of 120, 60 and 45 close the triangle, hexagon and octagon (60 doesn’t close a triangle)');
}
{ // 4 Bunting: a repeat inside a repeat fills the 500-step string with exactly 10 flags
  const [s, a] = await both('bay-4-bunting');
  const flags = r => { const red = col(r, C.red); let n = 0; for (let k = 0; k < 12; k++) { const x = -250 + 50 * k; if (covers(red, x + 2, 150, x + 38, 150) && inked(red, x + 20, 150 - 34.64) && inked(red, x + 30, 150 - 17.32) && inked(red, x + 10, 150 - 17.32)) n++; } return n; };
  const over = r => inkIn(col(r, C.red), 252, 100, 400, 200);
  const twelve = await run(ANSWERS['bay-4-bunting'].replace('repeat 10 [', 'repeat 12 ['));
  ok(done1(a) && flags(a) === 10 && !over(a) && flags(s) === 1 && over(twelve) && count(ANSWERS['bay-4-bunting'], /\brepeat\b/g) === 2,
    `Bunting: the nested repeat draws exactly 10 flags along the string (the starter draws 1; repeat 12 runs off the end) — ${flags(a)} flags`);
}
{ // 5 Fix the lighthouse: the tower and lamp room are closed, no stray line, three beams
  const [s, a] = await both('bay-5-lighthouse');
  const tower = r => rect(col(r, C.red), -40, -200, 80, 200), lamp = r => rect(col(r, C.gold), -20, 0, 40, 40), clean = r => !inkIn(r.segs, -16, 4, 16, 36);
  const beams = r => [30, 60, 90].every(h => { const t = h * Math.PI / 180; return covers(col(r, C.orange), 0, 40, 100 * Math.sin(t), 40 + 100 * Math.cos(t)); });
  ok(done1(a) && tower(a) && lamp(a) && clean(a) && beams(a) && !tower(s) && !lamp(s) && !clean(s),
    'Fix the lighthouse: the answer draws a closed tower, a closed lamp room, no stray line and three beams; the starter’s three bugs break the tower, the lamp room and leave a line through the lamp');
}
{ // 6 Project: my map — an example meets every success criterion, the bare starter doesn't
  const crit = (code, r) => { const mine = r.segs.filter(x => x.c !== C.blue); const cols = new Set(mine.map(x => x.c));
    return done1(r) && count(code, /\brepeat\b/g) >= 2 && pieces(mine) >= 3 && cols.size >= 2 && col(r, C.red).length > 0 && /\bpu\b/.test(code.split('Your map starts here')[1] || ''); };
  const [s, a] = await both('bay-6-map');
  ok(crit(ANSWERS['bay-6-map'], a) && !crit(STARTERS['bay-6-map'], s), 'Project — my map of Driftwood Bay: an example map meets every success criterion; the bare starter (just the sea) doesn’t');
}
// ── Block 2 ──
{ // 7 The helter-skelter: repcount * 10 makes every line 10 longer than the one before
  const [s, a] = await both('bay-7-slide');
  const grows = r => r.moves.length === 20 && r.moves.every((m, i) => Math.abs(m.d - 10 * (i + 1)) < 1e-9);
  ok(done1(a) && grows(a) && !grows(s), 'The helter-skelter: with fd repcount * 10 the lines are 10, 20, 30 … 200 steps long; the starter’s are all 50 — ' + a.moves.slice(0, 4).map(m => m.d));
}
{ // 8 Hook a duck: if repcount = 5 makes duck 5 gold, if repcount > 6 makes ducks 7 and 8 red, the rest stay blue
  const [s, a] = await both('bay-8-ducks');
  const colours = r => Array.from({ length: 8 }, (_, k) => { const x0 = -240 + 60 * k; const c = [...new Set(r.segs.filter(q => (q.x1 + q.x2) / 2 > x0 - 3 && (q.x1 + q.x2) / 2 < x0 + 49 && Math.abs(q.y1) < 30).map(q => q.c))]; return c.length === 1 ? c[0] : c.join('+'); });
  const want = [C.blue, C.blue, C.blue, C.blue, C.gold, C.blue, C.red, C.red];
  ok(done1(a) && colours(a).join() === want.join() && colours(s).every(c => c === C.blue), 'Hook a duck: duck 5 is gold and ducks 7 and 8 are red, the rest blue; in the starter all 8 are blue — ' + colours(a).join(' '));
}
{ // 9 The dancing crab: ifelse random 2 = 0 picks a red step left or a blue step right, so every dance is different
  const heads = [0.1], tails = [0.9], mix = [0.1, 0.9, 0.9, 0.1, 0.9];
  const A = ANSWERS['bay-9-crab'], S0 = STARTERS['bay-9-crab'];
  const ah = await run(A, heads), at = await run(A, tails), am = await run(A, mix), sh = await run(S0, heads), stl = await run(S0, tails);
  const both2 = r => col(r, C.red).length > 0 && col(r, C.blue).length > 0;
  ok(done1(am) && ah.x === -240 && at.x === 240 && both2(am) && Math.abs(am.y - 160) < 1e-6 && sh.x === 240 && stl.x === 240 && !both2(sh),
    `The dancing crab: with ifelse the crab steps left on heads (x ${ah.x}) and right on tails (x ${at.x}), and a mixed run uses both colours; the starter always ends at x 240`);
}
{ // 10 Walk to the sea: a loop that checks ycor every step stops at the sea, wherever Tilly starts
  const starts = [[0.0], [0.33], [0.5], [0.99]];
  const ys = async code => { const out = []; for (const r of starts) { const x = await run(code, r); out.push(done1(x) ? x.y : NaN); } return out; };
  const a = await ys(ANSWERS['bay-10-tide']), s = await ys(STARTERS['bay-10-tide']);
  ok(a.every(y => y < -150 && y > -153) && !s.every(y => y < -150 && y > -153), `Walk to the sea: from every start the answer stops at the sea's edge (y ${a.join(', ')}); the starter's fd 200 doesn't (y ${s.join(', ')})`);
}
{ // 11 Fix the pier lights: 10 lights, 1–5 yellow, 6–10 pink, the 10th thick
  const [s, a] = await both('bay-11-lights');
  const lights = r => Array.from({ length: 11 }, (_, k) => { const x0 = -250 + 50 * k; const q = r.segs.filter(z => (z.x1 + z.x2) / 2 > x0 - 2 && (z.x1 + z.x2) / 2 < x0 + 48 && Math.abs(z.y1) < 30 && z.y2 !== 0 || false);
    return q.length ? [...new Set(q.map(z => z.c + '/' + z.w))].join('+') : '-'; });
  const want = [...Array(5).fill(C.yellow + '/3'), ...Array(4).fill(C.pink + '/3'), C.pink + '/8', '-'];
  ok(done1(a) && lights(a).join() === want.join() && lights(s).join() !== want.join(), 'Fix the pier lights: 10 lights, 1–5 yellow, 6–10 pink, light 10 big; the starter has 9 lights in the wrong colours and none big — starter ' + lights(s).join(' '));
}
{ // 12 Project: the fireworks finale
  const crit = (code, r) => done1(r) && count(code, /\brepeat\b/g) >= 1 && count(code, /\brandom\b/g) >= 1 && count(code, /\b(if|ifelse)\b[^\[]*[<>=]/g) >= 1 && new Set(r.segs.map(x => x.c)).size >= 2;
  const [s, a] = await both('bay-12-fireworks');
  ok(crit(ANSWERS['bay-12-fireworks'], a) && !crit(STARTERS['bay-12-fireworks'], s), 'Project — the fireworks finale: an example meets every success criterion; the bare starter doesn’t');
}
// ── Block 3 ──
{ // 13 One number to change them all: a size variable; changing the make line resizes the whole hut
  const [s, a] = await both('bay-13-size');
  const big = await run(ANSWERS['bay-13-size'].replace('make "size 80', 'make "size 160'));
  const sBig = await run(STARTERS['bay-13-size'].replace('repeat 4 [fd 80 rt 90]', 'repeat 4 [fd 160 rt 90]'));
  const hut = (r, n) => rect(col(r, C.blue), -40, -100, n, n) && rect(col(r, C.red), -40 + n * 3 / 8, -100, n / 4, n / 2);
  ok(done1(a) && a.hash === s.hash && hut(a, 80) && hut(big, 160) && count(ANSWERS['bay-13-size'], /\bmake\b/g) === 1 && !hut(sBig, 160) && count(STARTERS['bay-13-size'], /\bmake\b/g) === 0,
    'One number to change them all: with make "size 80 the hut is exactly the starter’s; changing that one line to 160 doubles the walls and the door (changing one 80 in the starter leaves the door small)');
}
{ // 14 Teach the turtle new words (adopted): defining house draws nothing; house 100 == the starter house; street = three houses
  const st = (await page.evaluate(() => fetch('lessons/starters/turtle-procedures.json').then(r => r.json()))).turtle.code;
  const house = 'to house :size\nrepeat 4 [fd :size rt 90]\nfd :size\nrt 30\nrepeat 3 [fd :size rt 120]\nlt 30\nbk :size\nend\n';
  const s = await run(st), def = await run(house), h100 = await run(house + 'house 100\n'), street = await run(house + 'to street\nrepeat 3 [house 60 pu rt 90 fd 90 lt 90 pd]\nend\npu setxy -250 0 pd street\n');
  ok(done1(s) && def.segs.length === 0 && h100.hash === s.hash && h100.x === 0 && h100.y === 0 && street.x === 20 && street.moves.filter(m => m.d === 60).length === 3 * 8,
    'Teach the turtle new words: house 100 draws exactly the starter’s house and ends where it began; street draws three houses');
}
{ // 15 The beach survey: a bar procedure with two inputs draws the data as a bar chart
  const [s, a] = await both('bay-15-survey');
  const DATA = [6, 9, 4, 7];
  const bars = r => DATA.map((n, k) => rect(r.segs.filter(z => z.c !== '#000000'), -200 + 60 * k, -150, 40, n * 20) && !inked(r.segs.filter(z => z.c !== '#000000'), -180 + 60 * k, -150 + n * 20 + 10));
  const cols = new Set(a.segs.filter(z => z.c !== '#000000').map(z => z.c));
  ok(done1(a) && bars(a).every(Boolean) && cols.size === 4 && bars(s).join() === 'true,false,false,false' && /to bar :n :c/.test(ANSWERS['bay-15-survey']),
    'The beach survey: bar 6 12, bar 9 8, bar 4 2, bar 7 9 draw four bars 120, 180, 80 and 140 tall in four colours; the starter draws only strawberry');
}
{ // 16 Fix the seafront: four huts 70, 80, 90, 100 in a row, each with its door in the middle
  const [s, a] = await both('bay-16-seafront');
  const huts = r => [70, 80, 90, 100].map((n, k) => { const x = -250 + 120 * k; return rect(col(r, C.blue), x, -100, n, n) && rect(col(r, C.red), x + n * 3 / 8, -100, n / 4, n / 2); });
  ok(done1(a) && huts(a).every(Boolean) && huts(s).every(h => !h), 'Fix the seafront: the answer draws huts of 70, 80, 90 and 100 with their doors in the middle; in the starter none is right — ' + huts(s));
}
{ // 17 The regatta: boat :size, a variable for x and for size, ifelse on the size for the sail colour
  const [s, a] = await both('bay-17-regatta');
  const boats = r => { let x = -260; return [30, 45, 60, 75].map(n => { const ok1 = covers(col(r, C.brown), x, -100, x + 2 * n, -100) && covers(col(r, C.brown), x + n, -100, x + n, -100 + 1.5 * n)
      && inked(col(r, n > 50 ? C.red : C.blue), x + n / 2, -100 + n) && !inked(col(r, n > 50 ? C.blue : C.red), x + n / 2, -100 + n); x += 2 * n + 20; return ok1; }); };
  ok(done1(a) && boats(a).every(Boolean) && boats(s).filter(Boolean).length === 0, 'The regatta: four boats of 30, 45, 60 and 75 side by side, small ones with blue sails and big ones with red; the starter draws one fixed boat');
}
{ // 18 Project: a postcard
  const crit = (code, r) => { const c = code.replace(/;[^\n]*/g, ''); const m = c.match(/\bto\s+(\w+)\s+:\w+/); const calls = m ? (c.match(new RegExp('\\b' + m[1] + '\\b', 'g')) || []).length - 1 : 0;
    return done1(r) && m && calls >= 2 && /\bmake\b/.test(c) && count(c, /\brepeat\b/g) >= 2 && /\b(if|ifelse)\b/.test(c) && new Set(r.segs.filter(z => z.c !== '#000000').map(z => z.c)).size >= 3; };
  const [s, a] = await both('bay-18-postcard');
  ok(crit(ANSWERS['bay-18-postcard'], a) && !crit(STARTERS['bay-18-postcard'], s), 'Project — a postcard from Driftwood Bay: an example meets every success criterion; the bare starter (just the edge) doesn’t');
}
await ctx.close(); await b.close(); site.close();
ok(!errors.length, 'no page errors: ' + errors.join(' | '));
done();
