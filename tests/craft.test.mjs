// Build Lab (craft/): the block world, the blocks ⇄ Python translator and the runner in Node, then the app end to end.
import { ok, done, serve, browser, openApp, sleep, ROOT } from './lib.mjs';
import { pathToFileURL } from 'node:url';

const CW = await import(pathToFileURL(ROOT + '/craft/craft-world.js').href);
const L = await import(pathToFileURL(ROOT + '/craft/craft-lang.js').href);
const { createRunner } = await import(pathToFileURL(ROOT + '/craft/craft-runner.js').href);
const { createPlayer, raycast } = await import(pathToFileURL(ROOT + '/craft/craft-player.js').href);
const { BY_NAME: B, GROUND } = CW;

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
  ok(await page.evaluate(() => typeof helpTabs === 'function' && helpTabs() === CRAFT_HELP), 'Help shows the Build Lab help');
  ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
