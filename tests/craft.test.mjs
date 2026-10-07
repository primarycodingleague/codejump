// Build Lab (craft/): the block world, the blocks ⇄ Python translator and the runner in Node, then the app end to end.
import { ok, done, serve, browser, openApp, sleep, ROOT } from './lib.mjs';
import { pathToFileURL } from 'node:url';

const CW = await import(pathToFileURL(ROOT + '/craft/craft-world.js').href);
const L = await import(pathToFileURL(ROOT + '/craft/craft-lang.js').href);
const { createRunner } = await import(pathToFileURL(ROOT + '/craft/craft-runner.js').href);
const { createPlayer, raycast } = await import(pathToFileURL(ROOT + '/craft/craft-player.js').href);
const { BY_NAME: B, GROUND } = CW;
const M = await import(pathToFileURL(ROOT + '/craft/craft-maker.js').href);
const { checkTeam } = await import(pathToFileURL(ROOT + '/craft/craft-comp.js').href);

// run a program to the end, standing at (x, GROUND+1, z) facing north
function play(py, { chat, x = 32, z = 40, secs = 30, setup } = {}) {
  const world = CW.createWorld(), said = [], errors = [];
  if (setup) setup(world);
  const r = L.fromPython(py); if (r.error) return { error: r.error };
  const me = { x: x + 0.5, y: GROUND + 1, z: z + 0.5, facing: 0 };
  const run = createRunner(world, { player: () => me, teleport: (a, b, c) => { me.x = a; me.y = b; me.z = c; }, say: (t, w) => said.push((w || 'me') + ':' + t), time: () => {}, error: m => errors.push(m), placed: () => {} });
  Object.assign(run.helper, { x, y: GROUND + 1, z: z - 2, f: 0 });
  run.load(r.state);
  if (chat) run.chat(chat[0], chat.slice(1)); else run.start();
  for (let i = 0; i < secs * 60 && run.running(); i++) run.tick(1 / 60);
  return { world, said, errors, run, me, state: r.state };
}

{ // the world
  const w = CW.createWorld();
  ok(w.get(10, GROUND, 10) === B.GRASS && w.get(10, 0, 10) === B.STONE && w.get(10, GROUND + 1, 10) === 0, 'the starter world has grass on top of dirt and stone');
  w.fill(B.BRICKS, [0, 20, 0], [3, 23, 3], 'HOLLOW');
  ok(w.get(0, 20, 0) === B.BRICKS && w.get(1, 21, 1) === 0, 'fill HOLLOW makes walls with air inside');
  const saved = w.save(), w2 = CW.createWorld(); w2.reset(); w2.load(saved);
  ok(w2.get(0, 20, 0) === B.BRICKS && w2.save() === saved && saved.length < 20000, 'a world saves to short text (run-length) and loads back the same');
  ok(!w2.load('nonsense!!') && w2.get(0, 20, 0) === B.BRICKS, 'a broken world text is refused and the world is left alone');
  let threw = ''; try { w.fill(B.STONE, [0, 0, 0], [63, 39, 63], 'SOLID'); } catch (e) { threw = e.message; }
  ok(/big/i.test(threw), 'a fill that is far too big gives a friendly message instead of freezing');
  w.set(5, 0, 5, 0); ok(w.get(5, 0, 5) === B.STONE, 'the bottom layer can’t be dug out');
}
{ // blocks ⇄ Python
  const r = L.fromPython(L.STARTER_PY);
  ok(!r.error && r.state.blocks.blocks.length === 2, 'the starter Python turns into blocks: a Run script and a chat command');
  const py = L.toPython(r.state), again = L.toPython(L.fromPython(py).state);
  ok(py === again && /@on_chat\("tower"\)\ndef tower\(n\):/.test(py) && /for i in range\(n\):/.test(py), 'blocks → Python → blocks → Python gives the same Python');
  const err = s => (L.fromPython(s).error || {}).msg || '';
  ok(/“:”/.test(err('for i in range(3)\n    helper.move(UP, 1)')), 'a missing colon gets a friendly message');
  ok(/don.t know|unknown/i.test(err('helper.jump()')), 'an unknown command gets a friendly message');
  ok(/==/.test(err('if 1 = 1:\n    player.say("x")')), 'using = in an if says to use ==');
  ok(L.fromPython('helper.move(UP)').error && L.fromPython('helper.move(UP)').error.line === 1, 'the wrong number of things in brackets is caught, with its line number');
  ok(/moved in/i.test(err('player.say("a")\n    player.say("b")')), 'a stray indent is caught');
}
{ // the runner
  const h = play(L.STARTER_PY);
  ok(h.world.get(32 - 3, GROUND + 1, 40 - 5) === B.PLANKS && h.world.get(32, GROUND + 1, 40 - 5) === 0 && h.world.get(32 - 2, GROUND + 3, 40 - 5) === B.GLASS, 'Run builds the starter house in front of me, with a door and windows');
  ok(h.world.get(32, GROUND + 3, 40 - 8) === 0 && h.said.includes('me:Here is your house!'), '…hollow inside, and it says so in the chat');
  const t = play(L.STARTER_PY, { chat: ['tower', 6] });
  const hx = t.run.helper.x, hz = t.run.helper.z; let gold = 0; for (let y = 0; y < CW.H; y++) if (t.world.get(hx, y, hz) === B.GOLD) gold++;
  ok(gold === 6 && t.said.includes('helper:Tower done!'), 'typing “tower 6” makes the helper build a gold tower 6 blocks tall');
  const s = play('for i in range(5):\n    builder.place(STONE, 0, i, i + 2)');
  ok([0, 1, 2, 3, 4].every(i => s.world.get(32, GROUND + 1 + i, 40 - 2 - i) === B.STONE), 'a for loop with builder.place makes a staircase');
  const d = play('while not helper.detect(FORWARD):\n    helper.move(FORWARD, 1)\nhelper.say(helper.inspect(FORWARD))', { setup: w => w.set(32, GROUND + 1, 30, B.GEM) });
  ok(d.said.includes('helper:GEM') && d.run.helper.z === 31, 'the helper can sense: it flies forward until it sees a block and names it');
  const e = play('helper.trail(PLANKS)\nhelper.move(FORWARD, 4)');
  ok([1, 2, 3, 4].filter(i => e.world.get(32, GROUND + 1, 40 - 2 - i + 1) === B.PLANKS).length >= 3, 'a trail leaves blocks behind the helper');
}
{ // walking
  const w = CW.createWorld(), p = createPlayer(w, 32.5, GROUND + 1, 40.5);
  for (let i = 0; i < 60; i++) p.step(1 / 60, { fwd: 1 });
  ok(p.z < 40 && Math.abs(p.y - (GROUND + 1)) < 0.01, 'the player walks forward on the grass');
  ok(p.onGround, '…standing firmly on it');
  w.set(32, GROUND + 1, Math.floor(p.z) - 2, B.STONE); const z0 = p.z; let top = 0;
  for (let i = 0; i < 120; i++) { p.step(1 / 60, { fwd: 1 }); top = Math.max(top, p.y); }
  ok(top > GROUND + 1.9 && p.z < z0 - 2, '…and steps up onto a single block');
  const hit = raycast(w, [32.5, GROUND + 2.6, 40.5], [0, -1, 0], 8);
  ok(hit && hit.y === GROUND && hit.ny === 1, 'looking down picks the grass under you (for building)');
}

// ── the block set (added to in Oct 2026: new ids go on the end so saved worlds still open) ──
{
  const { BLOCKS, NBLOCKS, BLOCK_ORDER, GROUPS } = CW;
  ok(BLOCKS.every((b, i) => b[0] === i) && new Set(BLOCKS.map(b => b[1])).size === NBLOCKS && NBLOCKS >= 70, 'every block has its own id and Python name (' + NBLOCKS + ' blocks)');
  ok(BLOCKS.slice(0, 25).map(b => b[1]).join() === 'AIR,GRASS,DIRT,STONE,COBBLE,PLANKS,LOG,LEAVES,SAND,WATER,GLASS,BRICKS,RED,ORANGE,YELLOW,LIME,BLUE,PURPLE,PINK,WHITE,BLACK,GOLD,GEM,SNOW,LAMP', 'the original 25 blocks keep their ids');
  ok(BLOCK_ORDER.length === NBLOCKS - 1 && BLOCKS.slice(1).every(b => GROUPS.some(g => g[0] === b[6])), 'every block is in a picker group');
  const w = CW.createWorld(); w.reset('flat'); for (let i = 1; i < NBLOCKS; i++) w.set(i % 60, 20 + Math.floor(i / 60), 30, i);
  const w2 = CW.createWorld(); ok(w2.load(w.save()) && Array.from({ length: NBLOCKS - 1 }, (_, k) => k + 1).every(i => w2.get(i % 60, 20 + Math.floor(i / 60), 30) === i), 'a world with every block saves and opens again');
  const py = BLOCKS.slice(1).map((b, i) => 'builder.place(' + b[1] + ', 0, ' + (i % 20) + ', 2)').join('\n') + '\n';
  ok(!L.fromPython(py).error, 'every block name works in Python');
  const bw = CW.createWorld(); bw.reset('flat'); bw.set(32, GROUND, 40, B.BOUNCE); const bp = createPlayer(bw, 32.5, GROUND + 3, 40.5); let top = 0;
  for (let i = 0; i < 120; i++) { bp.step(1 / 60, {}); if (i > 30) top = Math.max(top, bp.y); }
  ok(top > GROUND + 4, 'landing on a bounce pad throws you up (to ' + top.toFixed(1) + ')');
  const iw = CW.createWorld(); iw.reset('flat'); for (let x = 20; x < 50; x++) for (let z = 30; z < 50; z++) iw.set(x, GROUND, z, B.ICE);
  const ip = createPlayer(iw, 32.5, GROUND + 1, 45.5); for (let i = 0; i < 60; i++) ip.step(1 / 60, { fwd: 1 }); const z0 = ip.z; for (let i = 0; i < 30; i++) ip.step(1 / 60, {});
  const gw = CW.createWorld(), gp = createPlayer(gw, 32.5, GROUND + 1, 45.5); for (let i = 0; i < 60; i++) gp.step(1 / 60, { fwd: 1 }); const g0 = gp.z; for (let i = 0; i < 30; i++) gp.step(1 / 60, {});
  ok(z0 - ip.z > 0.5 && Math.abs(g0 - gp.z) < 0.01, 'on ice you keep sliding after you let go (on grass you stop)');
  ok(!CW.isSolid(B.LAVA) && !CW.isSolid(B.WATER) && CW.isSolid(B.ICE), 'water and lava aren’t solid; ice is');
}
// ── World Maker (teacher-made worlds) ──
const runTo = (w, maker, py, max = 6000) => { // runs a program on a world the way the app does; returns the helper + checker
  const st = maker.start, me = { x: st.x, y: st.y, z: st.z, facing: 0 }, r = createRunner(w, { player: () => me }); Object.assign(r.helper, maker.helper);
  const prog = L.fromPython(py).state, c = M.createChecker(maker); r.load(prog); r.start();
  for (let i = 0; i < max && r.running(); i++) { r.tick(1 / 60); if (i % 20 === 0) c.check({ world: w, player: me, helper: r.helper, program: prog }); }
  c.check({ world: w, player: me, helper: r.helper, program: prog }); return { r, c, prog };
};
const mazePath = (w, maker) => { // the shortest way through the maze, as Python
  const h = maker.helper, g = maker.zones[1].a, b = M.box(maker.zones[0]), prev = new Map([[h.x + ',' + h.z, null]]), q = [[h.x, h.z]];
  while (q.length) { const [x, z] = q.shift(); if (x === g[0] && z === g[2]) break; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + ',' + (z + dz); if (!prev.has(k) && w.get(x + dx, h.y, z + dz) === 0 && x + dx >= b.x0 && x + dx <= b.x1 && z + dz >= b.z0 && z + dz <= b.z1) { prev.set(k, [x, z]); q.push([x + dx, z + dz]); } } }
  const path = []; for (let c = [g[0], g[2]]; c; c = prev.get(c[0] + ',' + c[1])) path.unshift(c);
  const F = [[0, -1], [1, 0], [0, 1], [-1, 0]], out = []; let f = h.f;
  for (let i = 1; i < path.length; i++) { const nf = F.findIndex(v => v[0] === path[i][0] - path[i - 1][0] && v[1] === path[i][1] - path[i - 1][1]), t = (nf - f + 4) % 4;
    if (t === 1) out.push('helper.turn(RIGHT)'); else if (t === 3) out.push('helper.turn(LEFT)'); else if (t === 2) out.push('helper.turn(RIGHT)', 'helper.turn(RIGHT)'); f = nf;
    const m = /^helper\.move\(FORWARD, (\d+)\)$/.exec(out[out.length - 1] || ''); if (m) out[out.length - 1] = 'helper.move(FORWARD, ' + (+m[1] + 1) + ')'; else out.push('helper.move(FORWARD, 1)'); }
  return { py: out.join('\n') + '\n', found: path.length > 1 && path[0][0] === h.x && path[0][1] === h.z };
};
{
  for (const e of M.EXAMPLES) { const p = M.exampleProject(e.id); ok(p.maker && JSON.stringify(M.cleanMaker(p.maker)) === JSON.stringify(p.maker) && CW.createWorld().load(p.world), 'ready-made world “' + e.title + '” loads and is already clean'); }
  const fs = M.exampleProject('first-steps'), w = CW.createWorld(); w.load(fs.world);
  const a = runTo(w, fs.maker, 'helper.move(FORWARD, 10)\nhelper.turn(RIGHT)\nhelper.move(FORWARD, 7)\n');
  ok(a.c.done.has('tGoal') && !a.c.done.has('tLoop') && !a.c.complete(), 'first steps: the helper reaches the gold, but there’s no loop yet');
  w.load(fs.world); const a2 = runTo(w, fs.maker, 'for _ in range(10):\n    helper.move(FORWARD, 1)\nhelper.turn(RIGHT)\nhelper.move(FORWARD, 7)\n'); a2.c.talk('npcRo'); a2.c.check({ world: w, player: {}, helper: a2.r.helper, program: a2.prog });
  ok(a2.c.complete(), '…with a loop and a chat with Ro, every task is ticked');
  const br = M.exampleProject('bridge'); w.load(br.world); const cb = M.createChecker(br.maker);
  cb.check({ world: w, player: { x: 33.5, y: GROUND + 1, z: 42.5 }, helper: {}, program: null });
  ok(!cb.done.has('tBridge') && !cb.done.has('tCross'), 'bridge: nothing is ticked at the start');
  w.fill(B.PLANKS, [31, GROUND, 29], [33, GROUND, 32], 'SOLID'); cb.check({ world: w, player: { x: 32.5, y: GROUND + 1, z: 24.5 }, helper: {}, program: null });
  ok(cb.done.has('tBridge') && cb.done.has('tCross'), '…filling the spot with planks and walking across ticks both');
  const ga = M.exampleProject('garden'); w.load(ga.world); const cg = M.createChecker(ga.maker);
  for (let i = 0; i < 8; i++) w.set(27 + i, GROUND + 1, 28, B.RED); for (let y = 1; y <= 5; y++) w.set(33, GROUND + y, 33, B.LOG);
  cg.check({ world: w, player: {}, helper: {}, program: null }); ok(cg.done.has('tFlowers') && cg.done.has('tTower'), 'garden: 8 flowers and a 5-high tower are counted');
  const mz = M.exampleProject('maze'); w.load(mz.world); const mp = mazePath(w, mz.maker);
  ok(mp.found, 'the maze can be solved');
  const am = runTo(w, mz.maker, mp.py, 60 * 120); ok(am.c.complete(), 'the shortest route takes the helper to the gold');
  w.load(mz.world); const cheat = runTo(w, mz.maker, 'helper.move(FORWARD, 30)\n', 600);
  const ch = cheat.r.helper; ok(!cheat.c.complete() && ch.z - mz.maker.helper.z < 30 && w.get(ch.x, ch.y, ch.z + 1) === B.LEAVES, 'the helper can’t walk through the hedges (it stops at one)');
  ok(M.stars(10, 14) === 3 && M.stars(20, 14) === 2 && M.stars(40, 14) === 1, 'fewer blocks earn more stars (3 / 2 / 1)');
  const junk = M.cleanMaker({ tasks: [{ type: 'evil' }, { type: 'visit', zone: 'nope' }, { type: 'talk', npc: 'x' }], npcs: Array.from({ length: 40 }, (_, i) => ({ id: 'n' + i, name: 'N' })), zones: [{ id: 'zz', a: [0, 1, 0], b: [63, 39, 63] }], lock: 'pass' });
  ok(junk.tasks.length === 0 && junk.npcs.length === 20 && M.box(junk.zones[0]).x1 - M.box(junk.zones[0]).x0 <= 31 && junk.lock === '', 'cleanMaker drops bad tasks and caps characters, area size and the lock');
  // protected areas + remote changes
  const gw = CW.createWorld(); gw.guard = (x) => x !== 5;
  ok(!gw.set(5, GROUND + 1, 5, B.STONE) && gw.set(6, GROUND + 1, 5, B.STONE), 'a protected area refuses changes');
  gw.remote = true; ok(gw.set(5, GROUND + 1, 5, B.STONE), '…but a teammate’s change (sent from the room) still lands'); gw.remote = false;
  // rules: which commands a world allows
  const tb = JSON.stringify(L.toolbox('helper')); ok(/Helper/.test(tb) && !/"Builder"/.test(tb), 'a helper-only world hides the Builder blocks');
  const rr = createRunner(CW.createWorld(), { player: () => ({ x: 32, y: GROUND + 1, z: 40, facing: 0 }), error: m => (rr.err = m) });
  const deny = t => !/^cr_b_/.test(t); deny.why = 'Builder blocks are switched off in this world.'; rr.setAllow(deny);
  rr.load(L.fromPython('builder.place(STONE, 0, 0, 2)\n').state); rr.start(); for (let i = 0; i < 30 && rr.running(); i++) rr.tick(1 / 60);
  ok(/switched off/.test(rr.err || ''), 'a switched-off command stops with a friendly message');
}
// ── competitions: automatic checks ──
{
  const ar = M.exampleProject('arena'), map = { world: ar.world }, maker = M.cleanMaker({ ...ar.maker, tasks: [{ id: 'tT', type: 'tower', zone: 'zPlot', n: 6 }, { id: 'tC', type: 'count', zone: 'zPlot', block: 'GLASS', n: 4 }] });
  const sets = []; for (let y = 1; y <= 6; y++) sets.push([30, GROUND + y, 30, B.STONE]);
  const half = await checkTeam(map, maker, { doc: null, log: [{ seq: 1, sets }] }, 'build');
  ok(half.score === 50, 'a build contest scores the tasks a team’s world meets (1 of 2 = 50)');
  for (let x = 0; x < 4; x++) sets.push([25 + x, GROUND + 1, 25, B.GLASS]);
  ok((await checkTeam(map, maker, { doc: null, log: [{ seq: 1, sets }] }, 'build')).score === 100, '…and both = 100');
  const mz = M.exampleProject('maze'), w = CW.createWorld(); w.load(mz.world); const mp = mazePath(w, mz.maker);
  const good = await checkTeam({ world: mz.world }, mz.maker, { doc: { code: { blocks: L.fromPython(mp.py).state } } }, 'code');
  ok(good.score >= 80 && /1 of 1 tasks/.test(good.detail), 'a coding contest runs the team’s code: reaching the gold scores at least 80 (' + good.score + ')');
  const bad = await checkTeam({ world: mz.world }, mz.maker, { doc: { code: { blocks: L.fromPython('helper.move(FORWARD, 3)\n').state } } }, 'code');
  ok(bad.score === 0, '…and code that doesn’t get there scores 0');
}

// ── the app ──
const site = await serve(); const b = await browser(); const errors = [];
try {
  const { page } = await openApp(b, site.url, { errors });
  await page.click('#h-new');
  await page.click('#ks-modal .ks-opt >> nth=0');
  ok(await page.evaluate(() => document.querySelector('#pt-modal .ks-opt[data-pt="craft"]').style.display === 'none'), 'Build Lab is hidden for Key Stage 1');
  await page.click('#pt-cancel'); await page.click('#ks-modal .ks-opt >> nth=1');
  ok(await page.evaluate(() => document.querySelector('#pt-modal .ks-opt[data-pt="craft"]').style.display !== 'none'), 'Build Lab is offered for Key Stage 2');
  await page.click('#pt-modal .ks-opt[data-pt="craft"]');
  await page.waitForFunction(() => craftApp && craftApp._ws() && craftApp._view(), null, { timeout: 30000 });
  ok(await page.evaluate(() => document.body.classList.contains('craft-mode') && craftApp._ws().getTopBlocks().length === 2), 'the Build Lab opens with the example program');
  await page.click('#crRun');
  await page.waitForFunction(() => { const w = craftApp._world(), p = craftApp._player(); return w.get(Math.floor(p.x) - 3, 13, Math.floor(p.z) - 5) === 5; }, null, { timeout: 10000 });
  ok(true, 'Run builds the house in front of you');
  await page.fill('#crChat', 'tower 4'); await page.press('#crChat', 'Enter');
  await page.waitForFunction(() => /Tower done/.test(document.getElementById('crLog').textContent), null, { timeout: 15000 });
  const tw = await page.evaluate(() => { const w = craftApp._world(), h = craftApp._runner().helper; const c = []; for (let y = 0; y < 40; y++) c.push(w.get(h.x, y, h.z)); return c; });
  ok(tw.filter(v => v === 21).length === 4, 'typing “tower 4” in the chat makes the helper build a gold tower');
  await page.fill('#crChat', 'castle'); await page.press('#crChat', 'Enter');
  ok(await page.evaluate(() => /Nothing in your code listens for “castle”.*tower/.test(document.getElementById('crLog').textContent)), 'an unknown chat word explains what to add and lists the words it knows');
  // by hand
  const placed = await page.evaluate(() => {
    const p = craftApp._player(); p.pitch = -1.2; p.yaw = 0; craftApp._slot(3);
    const c = document.getElementById('crCanvas'), r = c.getBoundingClientRect(), h = craftApp._pick(r.width / 2, r.height / 2);
    craftApp._act(r.width / 2, r.height / 2, false); const w = craftApp._world();
    return h && w.get(h.x + h.nx, h.y + h.ny, h.z + h.nz) === 11;
  });
  ok(placed, 'clicking the world puts the hotbar block (bricks) where you look');
  ok(await page.evaluate(() => { const c = document.getElementById('crCanvas'), r = c.getBoundingClientRect(), h = craftApp._pick(r.width / 2, r.height / 2); craftApp._act(r.width / 2, r.height / 2, true); return h && craftApp._world().get(h.x, h.y, h.z) === 0; }), 'right-click breaks the block you look at');
  await page.click('#crUndo');
  ok(await page.evaluate(() => /Took back/.test(document.getElementById('crStatus').textContent)), 'Undo takes back the last build');
  // Python
  await page.click('#crTabP');
  const py = await page.inputValue('#crSrc');
  ok(/builder\.fill\(PLANKS, -3, 0, 5, 3, 4, 11, HOLLOW\)/.test(py) && /@on_chat\("tower"\)/.test(py), 'the Python tab shows the blocks as Python');
  await page.fill('#crSrc', py.replace('helper.say("Tower done!")', 'helper.say("Tower done!")\n    helper.say("Again?")') + '\nfor i in range(3)\n');
  await page.waitForFunction(() => !document.getElementById('crErr').hidden, null, { timeout: 5000 });
  ok(await page.evaluate(() => /“:”/.test(document.getElementById('crErr').textContent) && !!document.querySelector('#crGutter .bad')), 'a Python mistake shows a red line with a hint');
  await page.click('#crTabB');
  ok(await page.evaluate(() => !document.getElementById('crPy').hidden), '…and you can’t go back to blocks until it’s fixed');
  await page.fill('#crSrc', py.replace('helper.say("Tower done!")', 'helper.say("Tower done!")\n    helper.say("Again?")'));
  await page.click('#crTabB');
  ok(await page.evaluate(() => document.getElementById('crPy').hidden && craftApp._ws().getAllBlocks(false).filter(b => b.type === 'cr_h_say').length === 2), 'fixed Python goes back to blocks, with the new block in it');
  // save → reopen
  const saved = await page.evaluate(() => { const p = buildPayload(); return { type: p.projectType, n: p.craft && p.craft.world.length, bricks: p.craft.hot[2] }; });
  ok(saved.type === 'craft' && saved.n > 10 && saved.bricks === 11, 'the project saves the world, the hotbar and the program');
  const back = await page.evaluate(async () => {
    const p = JSON.parse(JSON.stringify(buildPayload())); const h = craftApp._runner().helper, hx = h.x, hz = h.z;
    startNewProject('ks2'); applyPayload(p);
    await new Promise(r => setTimeout(r, 600));
    const w = craftApp._world(); let n = 0; for (let y = 0; y < 40; y++) if (w.get(hx, y, hz) === 21) n++;
    return { mode: document.body.classList.contains('craft-mode'), tower: n, says: craftApp._ws().getAllBlocks(false).filter(b => b.type === 'cr_h_say').length };
  });
  ok(back.mode && back.tower === 4 && back.says === 2, (back.mode && back.tower === 4 && back.says === 2 ? '' : JSON.stringify(back) + ' ') + 'reopening the project brings back the world (the tower) and the code');

  // the block picker shows every block, in groups
  const pk = await page.evaluate(() => { document.querySelector('.cr-more').click(); const p = document.getElementById('crPick'); const r = { n: p.querySelectorAll('button').length, g: [...p.querySelectorAll('.cr-pickg')].map(x => x.textContent) }; document.querySelector('.cr-more').click(); return r; });
  ok(pk.n >= 70 && pk.g.length === 8 && /nature/i.test(pk.g[0]), 'the block picker lists every block under 8 headings');
  // ── World Maker in the app ──
  await page.click('#crWorldsBtn'); await page.click('[data-ex="bridge"]'); await page.click('#cj-dialog .cj-dlg-btn.ok');
  await page.waitForSelector('#crGo', { timeout: 10000 });
  ok(await page.evaluate(() => /river/.test(document.getElementById('crPop').textContent)), 'opening a ready-made world shows its welcome');
  await page.click('#crGo');
  ok(await page.evaluate(() => !document.getElementById('crLesson').hidden && document.querySelectorAll('#crLTasks li').length === 3), 'the task list shows its 3 tasks');
  await page.evaluate(() => craftApp._mk()._talk('npcBea')); await sleep(300);
  ok(await page.evaluate(() => /river is too wide/.test(document.getElementById('crTalk').textContent)), 'talking to Bea shows what she says');
  await page.evaluate(async () => { for (let i = 0; i < 4; i++) { document.getElementById('crTalkNext').click(); await new Promise(r => setTimeout(r, 80)); } });
  await page.waitForFunction(() => document.querySelector('#crLTasks li.ok'), null, { timeout: 5000 });
  ok(true, '…and ticks “talk to Bea”');
  await page.evaluate(() => { const w = craftApp._world(); w.fill(5, [31, 12, 29], [33, 12, 32], 'SOLID'); });
  await page.waitForFunction(() => document.querySelectorAll('#crLTasks li.ok').length === 2, null, { timeout: 5000 });
  ok(true, 'building the bridge ticks the second task');
  await page.evaluate(() => craftApp._mk()._enter()); await sleep(200);
  ok(await page.evaluate(() => !document.getElementById('crMkBar').hidden && document.getElementById('crLesson').hidden), 'Make opens the World Maker tools');
  await page.evaluate(() => craftApp._mk()._leave()); await sleep(200);
  const mk = await page.evaluate(() => { const p = buildPayload().craft; return { npcs: p.maker.npcs.length, tasks: p.maker.tasks.length, done: p.progress && p.progress.done.length }; });
  ok(mk.npcs === 1 && mk.tasks === 3, 'the world’s characters and tasks save with the project');
  await page.click('#crCompBtn'); await sleep(200);
  ok(await page.evaluate(() => /Sign in to take part/.test(document.getElementById('crModal').textContent)), 'Compete asks you to sign in when you aren’t');
  await page.click('#crModalX');
  ok(await page.evaluate(() => typeof helpTabs === 'function' && helpTabs() === CRAFT_HELP), 'Help shows the Build Lab help');
  ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
