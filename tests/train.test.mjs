// Train Lab (projectType 'train'): the snap-together track and the intelino-style snap rules in Node, then the app —
// chooser, building a track by tapping, blocks, two trains, saving and reopening.
import { ok, done, serve, browser, openApp, ROOT } from './lib.mjs';
import { pathToFileURL } from 'node:url';

const TM = await import(pathToFileURL(ROOT + '/train/train-model.js').href);

// run a sim for `secs`, collecting events as "kind:data"
function drive(project, secs, opts = {}) {
  const ev = [];
  const sim = TM.createSim(project, Object.assign({ onEvent: (i, k, d) => ev.push(k + ':' + d) }, opts));
  if (opts.go !== false) sim.go();
  const at = [];
  for (let i = 0; i < Math.round(secs * 60); i++) { sim.step(1 / 60); if (opts.watch) at.push(opts.watch(sim)); }
  return { ev, sim, at };
}
// a straight line of pieces with the given snaps, a train on the first going towards the last
const line = (snaps, n = 4, rev = false) => ({ v: 2, pieces: Array.from({ length: n }, (_, i) => ['straight', i, 0, 0, snaps[i] || null]), trains: [{ name: 'L', start: { p: rev ? n - 1 : 0, k: 0, rev } }] });

// ---- the track
{
  const st = TM.starterTrack(), geoms = st.pieces.map(TM.pieceGeom), links = TM.linkUp(geoms);
  const open = geoms.flatMap((G, p) => G.ends.map((E, e) => (links[p + ':' + e] ? null : p))).filter(x => x !== null);
  ok(st.pieces.length === 20 && open.length === 0, 'the starter track (an oval with a passing loop) clicks together with no loose ends');
  const pc = TM.placeAt('curveR', 0, 1, 0, 0), E = TM.pieceGeom(pc).ends[1];
  ok(Math.abs(E.h - Math.PI / 4) < 1e-9, 'a curve turns 45°');
  const ring = []; const at = TM.chain(ring, { x: 0, y: 0, h: 0 }, Array(8).fill('curveL'));
  ok(Math.hypot(at.x, at.y) < 1e-6 && Object.keys(TM.linkUp(ring.map(TM.pieceGeom))).length === 16, '8 curves make a circle that joins up');
}
// ---- the snap rules (like the real train)
{
  const P = { ...TM.starterTrack(), trains: [{ name: 'A', start: TM.STARTER_TRAIN }] };
  const r = drive(P, 6, { watch: s => s.trains[0].v });
  ok(r.ev.includes('command:stop 2 seconds') && r.at.some(v => v === 0) && r.at[r.at.length - 1] > 0, 'with no blocks, Run sets the train off and it stops for 2 seconds at the white-red station, then carries on');
  const cmd = (snaps, rev) => drive(line([null, snaps], 4, rev), 4).ev.filter(e => e.startsWith('command:')).join(',');
  ok(cmd(['white', 'green']) === 'command:slow' && cmd(['white', 'green', 'green']) === 'command:medium' && cmd(['white', 'green', 'green', 'green']) === 'command:fast', 'white + 1, 2 or 3 greens = slow, medium, fast');
  ok(cmd(['white', 'red', 'red']) === 'command:stop 5 seconds' && cmd(['white', 'red', 'red', 'red']) === 'command:stop 10 seconds', 'white + 2 or 3 reds = stop 5 or 10 seconds');
  ok(cmd(['red', 'red']) === '' && cmd(['white', null, 'red']) === '', 'no white first, or a gap, and nothing happens');
  ok(cmd(['white', 'red', 'red']) && cmd(['white', 'red', 'red'], true) === '', 'a command only works in the direction it starts with white');
  ok(cmd(['white', 'red', 'red', 'white'], true) === 'command:stop 5 seconds', '…so a white at both ends makes it work both ways');
  const two = { v: 2, pieces: [['straight', 0, 0, 0, null], ['straight', 1, 0, 0, [null, null, null, null, null, 'white']], ['straight', 2, 0, 0, ['red']], ['straight', 3, 0, 0, null]], trains: [{ name: 'L', start: { p: 0, k: 0, rev: false } }] };
  ok(drive(two, 4).ev.filter(e => e.startsWith('command:')).length === 0, 'a command has to be on one piece of track');
  const rev = drive(line([null, ['white', 'blue']], 4), 4);
  ok(rev.ev.includes('command:reverse') && rev.sim.trains[0].p === 0 && rev.sim.trains[0].v === 0, 'white blue = reverse (it drives back to the start and stops at the end of the track)');
  const end = drive(line([null, ['white', 'red', 'blue']], 4), 6);
  ok(end.ev.includes('command:end route') && end.sim.trains[0].v === 0 && !end.ev.some(e => e.startsWith('end:')), 'white red blue = end route: it brakes and stays stopped (before the end of the track)');
  // splits: on the starter track the first split is piece 1
  const ways = (slot, laps = 6, random) => { const P2 = TM.starterTrack(); P2.pieces[1][4] = slot ? [slot] : null; P2.trains = [{ name: 'A', start: { p: 0, k: 0, rev: false } }]; return drive(P2, laps * 8.5, random ? { random } : {}).ev.filter(e => e.startsWith('split:')).map(e => e.slice(6)); };
  const g = ways('green'), bl = ways('blue'), y = ways('yellow'), m = ways('magenta', 7);
  ok(g.length >= 4 && g.every(w => w === 'straight') && bl.every(w => w === 'right'), 'at a split: green = straight on, blue = right');
  ok(y.slice(0, 4).join() === 'right,straight,right,straight', 'yellow takes turns: turn, straight, turn, straight');
  ok(m.slice(0, 6).join() === 'right,straight,straight,right,straight,straight', 'magenta = turn, then straight twice, then again');
  let n = 0; const rnd = ways(null, 6, () => (n++ % 2 ? 0.9 : 0.1));
  ok(rnd.includes('straight') && rnd.includes('right'), 'an empty slot = a random choice');
  // bump
  const h2h = { v: 2, pieces: Array.from({ length: 6 }, (_, i) => ['straight', i, 0, 0, null]), trains: [{ name: 'A', start: { p: 0, k: 0, rev: false } }, { name: 'B', start: { p: 5, k: 0, rev: true } }] };
  const bump = drive(h2h, 4);
  ok(bump.ev.includes('bump:B') && bump.ev.includes('bump:A') && bump.sim.trains.every(t => t.v === 0), 'two trains that meet bump and both stop');
  const bad = TM.cleanProject({ pieces: [['rocket', 0, 0, 0], ['curveL', 1, 1, 9], ['straight', 'x', 0, 0], ['straight', 2, 0, 2, ['pink', 'red']]], trains: [{ name: '<b>Zoom</b>', color: 'red', start: { p: 7, k: 0 } }, 1, 2, 3] });
  ok(bad.pieces.length === 1 && bad.pieces[0][4].join() === ',red,,,,' && bad.trains.length === 1 && bad.trains[0].start === null && !bad.trains[0].name.includes('<'), 'a saved project with nonsense in it is tidied up');
}

const site = await serve(), b = await browser(), errors = [];
const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const chainB = list => { let first = null, prev = null; for (const x of list) { if (prev) prev.next = { block: x }; else first = x; prev = x; } return first; };
const script = (hat, list, y = 20) => ({ ...hat, x: 20, y, next: { block: chainB(list) } });
try {
  const { page } = await openApp(b, site.url, { errors });
  // ---- the chooser: Train Lab for KS2/3, not KS1
  await page.evaluate(() => { _pendingKs = 'ks1'; document.getElementById('ks-modal').classList.remove('hide'); });
  await page.click('#ks-modal .ks-opt >> nth=0');
  ok(await page.evaluate(() => document.querySelector('#pt-modal .ks-opt[data-pt="train"]').style.display === 'none'), 'Train Lab is hidden for Key Stage 1');
  await page.click('#pt-cancel'); await page.click('#ks-modal .ks-opt >> nth=1');
  ok(await page.evaluate(() => document.querySelector('#pt-modal .ks-opt[data-pt="train"]').style.display !== 'none'), 'Train Lab is offered for Key Stage 2');
  await page.click('#pt-modal .ks-opt[data-pt="train"]');
  await page.waitForFunction(() => trainApp && trainApp._ws() && trainApp._sim(), null, { timeout: 30000 });
  ok(await page.evaluate(() => projectType === 'train' && trainApp._proj().pieces.length === 20 && trainApp._ws().getTopBlocks().length === 0), 'it opens with the starter track and no blocks');

  // ---- no blocks: the train behaves like the real one
  await page.click('#tlRun');
  await page.waitForFunction(() => { const t = trainApp._sim().trains[0]; return t.lastCommand === 'stop 2 seconds' && t.v === 0; }, null, { timeout: 15000 });
  await page.waitForFunction(() => trainApp._sim().trains[0].v > 0.5, null, { timeout: 10000 });
  ok(true, 'Run sets the train off; it stops at the white-red station for 2 seconds, then carries on');
  await page.click('#tlStop');

  // ---- build a track by tapping
  const built = await page.evaluate(() => {
    const A = trainApp; A.setProject({ v: 2, pieces: [], trains: [{ name: 'Builder' }] });
    const plus = o => A._tapWorld(o.x + Math.cos(o.h) * 0.14, o.y + Math.sin(o.h) * 0.14);
    A.setTool('straight'); A._tapWorld(0, 0);
    A.setTool('curveL'); plus(A._openEnds().find(o => o.x > 0.5));
    const before = JSON.stringify(A._proj().pieces[1]);
    const mid = A._sim().geoms[1].paths[0].at(0.5); A._tapWorld(mid.x, mid.y); // tap it: joined by its other end, so it bends the other way
    const after = A._proj().pieces[1];
    const links = Object.keys(A._sim().links).length;
    A.setTool('white'); let q = A._sim().geoms[0].paths[0].at(0.175); A._tapWorld(q.x, q.y);
    A.setTool('red'); q = A._sim().geoms[0].paths[0].at(0.305); A._tapWorld(q.x, q.y);
    A.setTool('train'); q = A._sim().geoms[0].paths[0].at(0.5); A._tapWorld(q.x, q.y);
    return { n: A._proj().pieces.length, turned: before !== JSON.stringify(after), links, snaps: (A._proj().pieces[0][4] || []).join(), start: !!A._proj().trains[0].start };
  });
  ok(built.n === 2 && built.links === 2 && built.turned, 'tapping a blue + clicks a piece on; tapping a piece turns it round');
  ok(built.snaps === 'white,red,,,,' && built.start, 'snaps click into the slot you tap, and the train tool puts the train on');
  await page.evaluate(() => { trainApp.setTool('erase'); const q = trainApp._sim().geoms[1].paths[0].at(0.5); trainApp._tapWorld(q.x, q.y); });
  ok(await page.evaluate(() => trainApp._proj().pieces.length === 1), 'the rubber takes a piece away');
  await page.click('#tlUndo');
  ok(await page.evaluate(() => trainApp._proj().pieces.length === 2), 'Undo puts it back');

  // ---- blocks on top of the snaps: a shuttle that counts its trips, a message, a tap, and turning snap commands off
  const prog = { blocks: { languageVersion: 0, blocks: [
    script({ type: 'tr_when_run' }, [{ type: 'tr_headlight', fields: { COL: '#ffff00' } }, { type: 'tr_snaps', fields: { ON: 'off' } }, { type: 'tr_set_speed', inputs: { N: N(80) } }]),
    script({ type: 'tr_when_end' }, [
      { type: 'math_change', fields: { VAR: { id: 'v1' } }, inputs: { DELTA: N(1) } },
      { type: 'controls_if', inputs: { IF0: { block: { type: 'logic_compare', fields: { OP: 'LT' }, inputs: { A: { block: { type: 'variables_get', fields: { VAR: { id: 'v1' } } } }, B: N(3) } } },
        DO0: { block: { type: 'tr_turn_around' } } } }
    ], 300),
    script({ type: 'tr_when_colour', fields: { COL: 'yellow' } }, [{ type: 'tr_send', fields: { MSG: 'seen' } }], 500),
    script({ type: 'tr_when_message', fields: { MSG: 'seen' } }, [{ type: 'tr_toplight', fields: { COL: '#0000ff' } }], 600),
    script({ type: 'tr_when_tapped' }, [{ type: 'tr_sound', fields: { SND: 'horn' } }, { type: 'variables_set', fields: { VAR: { id: 'v2' } }, inputs: { VALUE: N(7) } }], 700)
  ] }, variables: [{ name: 'ends', id: 'v1' }, { name: 'tapped', id: 'v2' }] };
  await page.evaluate(p => trainApp.setProject({ v: 2, pieces: [['straight', 0, 0, 0, null], ['straight', 1, 0, 0, ['white', 'red', null, 'yellow']], ['straight', 2, 0, 0, null]],
    trains: [{ name: 'Shuttle', start: { p: 0, k: 0, rev: false }, blocks: p }] }), prog);
  await page.click('#tlRun');
  await page.waitForFunction(() => trainApp._runner()._vars().ends === 3, null, { timeout: 20000 });
  const sh = await page.evaluate(() => { const t = trainApp._sim().trains[0]; return { head: t.head, top: t.top, cmd: t.lastCommand }; });
  ok(sh.head === '#ffff00' && sh.top === '#0000ff', 'set speed, headlight, when I see yellow → send message → when I receive all work');
  ok(sh.cmd === '', 'with snap commands turned off, the white-red snaps don’t stop it');
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => trainApp._sim().trains[0].v === 0 && trainApp._runner()._vars().ends === 3), 'when I reach the end + turn around shuttles it, and the variable stops it after 3 ends');
  await page.evaluate(() => trainApp._runner().tap(0));
  await page.waitForFunction(() => trainApp._runner()._vars().tapped === 7, null, { timeout: 5000 });
  ok(true, 'tapping the train starts its when-tapped script');
  await page.click('#tlStop');

  // ---- when I read a snap command
  const prog2 = { blocks: { languageVersion: 0, blocks: [script({ type: 'tr_when_command', fields: { CMD: 'slow' } }, [{ type: 'tr_toplight', fields: { COL: '#00ff00' } }])] } };
  await page.evaluate(p => trainApp.setProject({ v: 2, pieces: [['straight', 0, 0, 0, null], ['straight', 1, 0, 0, ['white', 'green']], ['straight', 2, 0, 0, null]], trains: [{ name: 'S', start: { p: 0, k: 0, rev: false }, blocks: p }] }), prog2);
  await page.click('#tlRun');
  await page.waitForFunction(() => trainApp._sim().trains[0].top === '#00ff00', null, { timeout: 10000 });
  ok(true, '“when I read the snap command slow” runs when it drives over white-green');
  await page.click('#tlStop');

  // ---- two trains, each with its own blocks
  await page.evaluate(() => trainApp.setProject(null));
  await page.click('#tlAdd');
  ok(await page.evaluate(() => trainApp._proj().trains.length === 2 && document.querySelectorAll('#tlTrains .tl-tab[data-i]').length === 2), 'Add a train adds a second train with its own tab');
  await page.evaluate(() => { const q = trainApp._sim().geoms[4].paths[0].at(0.5); trainApp._tapWorld(q.x, q.y); trainApp.selectTrain(0); });
  await page.click('#tlRun');
  await page.waitForFunction(() => trainApp._sim().trains.every(t => t.dist > 1), null, { timeout: 10000 });
  ok(true, 'both trains set off together');
  await page.click('#tlStop');

  // ---- saving and reopening
  const saved = await page.evaluate(() => JSON.stringify(buildPayload()));
  const p = JSON.parse(saved);
  ok(p.projectType === 'train' && p.train.v === 2 && p.train.trains.length === 2 && p.train.pieces.length === 20 && p.train.trains[1].start, 'the project saves the track and both trains');
  await page.evaluate(() => { startNewProject('ks2'); document.getElementById('tutorial').classList.add('hide'); });
  await page.evaluate(j => applyPayload(JSON.parse(j)), saved);
  await page.waitForFunction(() => document.body.classList.contains('train-mode') && trainApp._proj().trains.length === 2 && trainApp._proj().pieces.length === 20, null, { timeout: 15000 });
  ok(true, 'reopening the saved project brings everything back');
  await page.click('#tlRun');
  await page.waitForFunction(() => trainApp._sim().trains[0].dist > 0.5, null, { timeout: 10000 });
  ok(true, 'Run still works after leaving the Train Lab and reopening a project');
  await page.click('#tlStop');
  ok(errors.length === 0, 'no errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
