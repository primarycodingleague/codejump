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
  ok(rev.ev.includes('command:reverse') && rev.sim.trains[0].p === 0 && rev.sim.trains[0].v === 0 && rev.sim.trains[0].back, 'white blue = reverse: it drives back, tail first, and stops at the end of the track');
  const end = drive(line([null, ['white', 'red', 'blue']], 4), 6);
  ok(end.ev.includes('command:end route') && end.sim.trains[0].v === 0 && !end.ev.some(e => e.startsWith('end:')), 'white red blue = end route: it brakes and stays stopped (before the end of the track)');
  // splits: on the starter track the first split is piece 1
  const ways = (slot, laps = 6, random) => { const P2 = TM.starterTrack(); P2.pieces[1][4] = slot ? [slot] : null; P2.trains = [{ name: 'A', start: { p: 0, k: 0, rev: false } }]; return drive(P2, laps * 8.5, random ? { random } : {}).ev.filter(e => e.startsWith('split:')).map(e => e.slice(6)); };
  const g = ways('green'), bl = ways('blue'), y = ways('yellow'), m = ways('magenta', 7);
  ok(g.length >= 4 && g.every(w => w === 'straight') && bl.every(w => w === 'right'), 'at a split: green = straight on, blue = right');
  ok(y.slice(0, 4).join() === 'straight,right,straight,right', 'yellow takes turns: straight, turn, straight, turn (the command sheet’s 1, 2)');
  ok(m.slice(0, 6).join() === 'right,straight,straight,right,straight,straight', 'magenta = turn, then straight twice, then again');
  let n = 0; const rnd = ways(null, 6, () => (n++ % 2 ? 0.9 : 0.1));
  ok(rnd.includes('straight') && rnd.includes('right'), 'an empty slot = a random choice');
  // bump
  const h2h = { v: 2, pieces: Array.from({ length: 6 }, (_, i) => ['straight', i, 0, 0, null]), trains: [{ name: 'A', start: { p: 0, k: 0, rev: false } }, { name: 'B', start: { p: 5, k: 0, rev: true } }] };
  const bump = drive(h2h, 4);
  ok(bump.ev.includes('bump:B') && bump.ev.includes('bump:A') && bump.sim.trains.every(t => t.v === 0), 'two trains that meet bump and both stop');
  const bad = TM.cleanProject({ pieces: [['rocket', 0, 0, 0], ['curveL', 1, 1, 9], ['straight', 'x', 0, 0], ['straight', 2, 0, 2, ['pink', 'red']]], trains: [{ name: '<b>Zoom</b>', color: 'red', start: { p: 7, k: 0 } }, 1, 2, 3] });
  ok(bad.pieces.length === 1 && bad.pieces[0][4].join() === ',red,,,,,' && bad.trains.length === 1 && bad.trains[0].start === null && !bad.trains[0].name.includes('<'), 'a saved project with nonsense in it is tidied up');
}


// ---- wagons: the engine pulls one behind it, white-yellow leaves it, backing into it picks it up again
{
  const P = { ...TM.starterTrack(), trains: [{ name: 'A', start: TM.STARTER_TRAIN, wagon: true }] };
  const gaps = drive(P, 20, { watch: s => { const e = s.pose(0), w = s.wagonPose(0); return e && w ? Math.hypot(e.x - w.x, e.y - w.y) : 0; } }).at;
  ok(gaps.every(d => d > 0.45 && d < 0.6), 'a wagon follows the engine round the oval and through the passing loop at the same distance');
  const drop = drive({ ...line([null, ['white', 'yellow']], 6), trains: [{ name: 'L', start: { p: 0, k: 0, rev: false }, wagon: true }] }, 5);
  ok(drop.ev.includes('wagon:dropped') && !drop.sim.trains[0].wagon && drop.sim.freeWagons().length === 1, 'white yellow = drop the wagon: it stays behind on the track');
  const pick = drive({ v: 2, pieces: Array.from({ length: 5 }, (_, i) => ['straight', i, 0, 0, i === 3 ? ['white', 'blue'] : null]), trains: [{ name: 'L', start: { p: 2, k: 0, rev: false } }], wagons: [{ p: 0, k: 0, rev: false }] }, 8);
  ok(pick.ev.includes('wagon:picked up') && pick.sim.trains[0].wagon && pick.sim.freeWagons().length === 0, 'reversing into a wagon couples it to the engine’s magnet');
}
// ---- challenges: every ready-made answer really does the jobs; without snaps it doesn't
{
  const CH = await import(pathToFileURL(ROOT + '/train/train-challenges.js').href);
  for (const c of CH.CHALLENGES) {
    const res = withAnswer => { const sim = TM.createSim(CH.challengeProject(c.id, withAnswer), { random: () => 0.5 }); const chk = TM.createChecker(sim, sim.project.challenge); sim.go(); for (let i = 0; i < 60 * 90 && !chk.complete(); i++) { sim.step(1 / 60); chk.tick(1 / 60); } return chk; };
    const yes = res(true), no = res(false);
    ok(yes.complete() && !no.complete(), 'challenge “' + c.title + '”: the answer does every job (' + c.steps.length + '), the bare track doesn’t');
  }
  const P = TM.cleanProject({ ...CH.challengeProject('airport-run'), dests: [{ t: 'nowhere', p: 0 }, { t: 'zoo', p: 99 }, { t: 'zoo', p: 1, side: 7 }], challenge: { title: '<i>x</i>', steps: [{ d: 0, a: 'stop' }, { d: 5, a: 'stop' }, { d: 0, a: 'fly' }] } });
  ok(P.dests.length === 1 && P.dests[0].side === 1 && P.challenge.steps.length === 1 && !P.challenge.title.includes('<'), 'saved places and challenges with nonsense in them are tidied up');
}

const site = await serve(), b = await browser(), errors = [];
const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const chainB = list => { let first = null, prev = null; for (const x of list) { if (prev) prev.next = { block: x }; else first = x; prev = x; } return first; };
const script = (hat, list, y = 20) => ({ ...hat, x: 20, y, next: { block: chainB(list) } });
const V = id => ({ block: { type: 'variables_get', fields: { VAR: { id } } } });
const setV = (id, value) => ({ type: 'variables_set', fields: { VAR: { id } }, inputs: { VALUE: value } });
const R = type => ({ block: { type } });
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
  const cats = await page.evaluate(() => trainApp._ws().getToolbox().getToolboxItems().map(c => c.getName && c.getName()));
  ok(cats.join() === 'Events,Control,Sensing,Operators,Variables,Train 1', 'the toolbox is Scratch’s categories plus one for each train');
  const t1 = await page.evaluate(() => { const c = trainApp._ws().getToolbox().getToolboxItems().find(x => x.getName && x.getName() === 'Train 1'); return c.getContents().filter(x => x.kind === 'block' || x.kind === 'BLOCK').map(x => x.type); });
  ok(t1.length === 27 && t1[0] === 't1_whenMovement' && t1.includes('t1_startDriving') && t1.includes('t1_whenSnapDetected') && t1[t1.length - 1] === 't1_classifiedColor', 'the train category has the smart train extension’s 27 blocks, in its order');

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
    const slot = k => A._sim().geoms[0].paths[0].at(require_slot(k));
    function require_slot(k) { return [0.14, 0.26][k]; }
    A.setTool('white'); let q = slot(0); A._tapWorld(q.x, q.y);
    A.setTool('red'); q = slot(1); A._tapWorld(q.x, q.y);
    A.setTool('train'); q = A._sim().geoms[0].paths[0].at(0.5); A._tapWorld(q.x, q.y);
    return { n: A._proj().pieces.length, turned: before !== JSON.stringify(after), links, snaps: (A._proj().pieces[0][4] || []).join(), start: !!A._proj().trains[0].start };
  });
  ok(built.n === 2 && built.links === 2 && built.turned, 'tapping a blue + clicks a piece on; tapping a piece turns it round');
  ok(built.snaps === 'white,red,,,,,' && built.start, 'snaps click into the slot you tap, and the train tool puts the train on');
  await page.evaluate(() => { trainApp.setTool('erase'); const q = trainApp._sim().geoms[1].paths[0].at(0.5); trainApp._tapWorld(q.x, q.y); });
  ok(await page.evaluate(() => trainApp._proj().pieces.length === 1), 'the rubber takes a piece away');
  await page.click('#tlUndo');
  ok(await page.evaluate(() => trainApp._proj().pieces.length === 2), 'Undo puts it back');

  // ---- the extension's blocks: a shuttle on a straight line
  const line = [['straight', 0, 0, 0, null], ['straight', 1, 0, 0, ['white', 'red', null, null, 'yellow']], ['straight', 2, 0, 0, null]];
  // when it stops at an end: after 3 ends stop all; otherwise wait a moment and drive the other way
  const IF = (cond, yes, no) => ({ type: 'controls_if', extraState: { hasElse: true }, inputs: { IF0: { block: cond }, DO0: { block: yes }, ELSE: { block: no } } });
  const cmp = (op, A, B) => ({ type: 'logic_compare', fields: { OP: op }, inputs: { A, B } });
  const drive = d => ({ type: 't1_startDriving', fields: { DIRECTION: d }, inputs: { SPEED: N(80) } });
  const odd = cmp('EQ', { block: { type: 'math_modulo', inputs: { DIVIDEND: V('ends'), DIVISOR: N(2) } } }, N(1));
  const shuttleIf = IF(cmp('GTE', V('ends'), N(3)), { type: 'tr_stop_all' }, Object.assign({ type: 'tr_wait', inputs: { S: N(0.2) } }, { next: { block: IF(odd, drive('-1'), drive('1')) } }));
  const prog = { blocks: { languageVersion: 0, blocks: [
    script({ type: 'tr_when_run' }, [{ type: 't1_setSnapExecution', fields: { STATUS: '0' } }, { type: 't1_setLedColorPicker', fields: { LEDGROUP: '2', COLOR: '#ffff00' } },
      { type: 't1_startDriving', fields: { DIRECTION: '1' }, inputs: { SPEED: N(80) } }]),
    script({ type: 't1_whenMovement', fields: { MOVEMENT: '3' } }, [{ type: 'math_change', fields: { VAR: { id: 'ends' } }, inputs: { DELTA: N(1) } }, shuttleIf], 300),
    script({ type: 't1_whenSnapDetected', fields: { COLOR1: '7', COLOR2: '1', COLOR3: '0', COLOR4: '0' } }, [setV('seen', N(1))], 600),
    script({ type: 't1_whenColorChanged', fields: { COLOR: '3' } }, [{ type: 'tr_broadcast', fields: { MSG: 'yellow' } }], 700),
    script({ type: 'tr_when_message', fields: { MSG: 'yellow' } }, [{ type: 't1_setLedColor', fields: { LEDGROUP: '1' }, inputs: { RED: N(0), GREEN: N(0), BLUE: N(255) } }], 800),
    script({ type: 't1_whenDistance' , inputs: { DISTANCE: N(100) } }, [setV('far', R('t1_getOdometerCm'))], 900)
  ] }, variables: [{ name: 'ends', id: 'ends' }, { name: 'seen', id: 'seen' }, { name: 'far', id: 'far' }] };
  await page.evaluate(([pieces, p]) => trainApp.setProject({ v: 2, pieces, trains: [{ name: 'Shuttle', start: { p: 0, k: 0, rev: false } }], blocks: p }), [line, prog]);
  await page.click('#tlRun');
  await page.waitForFunction(() => !trainApp._runner().running(), null, { timeout: 30000 });
  const sh = await page.evaluate(() => { const t = trainApp._sim().trains[0], v = trainApp._runner()._vars(); return { head: t.head, top: t.top, cmd: t.lastCommand, v, back: t.back }; });
  ok(sh.v.ends === 3, '“when movement stopped” + “drive forward/backward at … cm/s” shuttles it to and fro; “stop all” ends it');
  ok(sh.head === '#ffff00' && sh.top === '#0000ff', 'set headlights colour, set top LED RGB, “when train sees yellow” → broadcast → “when I receive” all work');
  ok(sh.v.seen === 1 && sh.cmd === '', 'with action snap commands off it doesn’t stop at white-red, but “when white red none none seen” still fires');
  ok(sh.v.far >= 100 && sh.v.far < 110, '“when distance >= 100 cm” fires at 100 cm, and distance (cm) reports it');

  // ---- splits and driving a set distance
  const prog2 = { blocks: { languageVersion: 0, blocks: [
    script({ type: 'tr_when_run' }, [{ type: 't1_setNextSplitDecision', fields: { SIDE: '2' } }, setV('nd', R('t1_getNextSplitDecision')),
      { type: 't1_moveFixedDistance', fields: { DIRECTION: '1' }, inputs: { DISTANCE: N(50), SPEED: N(50) } }, setV('d50', R('t1_getOdometerCm')),
      { type: 't1_startDriving', fields: { DIRECTION: '1' }, inputs: { SPEED: N(60) } }]),
    script({ type: 't1_whenOnSplitTrack' }, [{ type: 'math_change', fields: { VAR: { id: 'splits' } }, inputs: { DELTA: N(1) } }, { type: 'tr_wait', inputs: { S: N(0.1) } }, setV('ld', R('t1_getLastSplitDecision'))], 400)
  ] }, variables: [{ name: 'nd', id: 'nd' }, { name: 'd50', id: 'd50' }, { name: 'splits', id: 'splits' }, { name: 'ld', id: 'ld' }] };
  await page.evaluate(p => { const P = trainApp.getProject(); trainApp.setProject(Object.assign(P, { v: 2, pieces: null, trains: [{ name: 'A', start: { p: 0, k: 0, rev: false } }], blocks: p })); }, prog2);
  await page.evaluate(p => { trainApp.setProject(null); const P = trainApp.getProject(); P.trains[0].start = { p: 0, k: 0, rev: false }; P.blocks = p; trainApp.setProject(P); }, prog2);
  await page.click('#tlRun');
  await page.waitForFunction(() => { const v = trainApp._runner()._vars(); return v.splits >= 1 && v.ld && v.d50; }, null, { timeout: 20000 });
  const sp = await page.evaluate(() => trainApp._runner()._vars());
  ok(sp.nd === 2 && sp.ld === 2, '“on next split go right” → next decision = 2, and at the split “when on a split track” and last decision = 2');
  ok(sp.d50 >= 50 && sp.d50 <= 53, '“drive forward 50 cm at 50 cm/s” drives 50 cm and stops');
  await page.click('#tlStop');

  // ---- two trains: a category each; a train with no blocks of its own drives by itself
  await page.evaluate(() => trainApp.setProject(null));
  await page.click('#tlAdd');
  ok(await page.evaluate(() => trainApp._ws().getToolbox().getToolboxItems().some(c => c.getName && c.getName() === 'Train 2')), 'Add a train adds a “Train 2” block category');
  await page.evaluate(() => {
    const q = trainApp._sim().geoms[4].paths[0].at(0.5); trainApp._tapWorld(q.x, q.y); trainApp.selectTrain(0);
    const P = trainApp.getProject(); P.blocks = { blocks: { languageVersion: 0, blocks: [{ type: 'tr_when_run', x: 20, y: 20, next: { block: { type: 't2_startDriving', fields: { DIRECTION: '-1' }, inputs: { SPEED: { shadow: { type: 'math_number', fields: { NUM: 30 } } } } } } }] } };
    trainApp.setProject(P);
  });
  await page.click('#tlRun');
  await page.waitForFunction(() => trainApp._sim().trains.every(t => t.dist > 0.6), null, { timeout: 10000 });
  ok(await page.evaluate(() => trainApp._sim().trains[1].back === true && trainApp._sim().trains[0].back === false), 'train 2 drives backward from its blocks while train 1 (no blocks) drives by itself');
  await page.click('#tlStop');


  // ---- saving and reopening
  const saved = await page.evaluate(() => JSON.stringify(buildPayload()));
  const p = JSON.parse(saved);
  ok(p.projectType === 'train' && p.train.v === 2 && p.train.trains.length === 2 && p.train.pieces.length === 20 && p.train.blocks.blocks.blocks.length === 1, 'the project saves the track, both trains and the program');
  await page.evaluate(() => { startNewProject('ks2'); document.getElementById('tutorial').classList.add('hide'); });
  await page.evaluate(j => applyPayload(JSON.parse(j)), saved);
  await page.waitForFunction(() => document.body.classList.contains('train-mode') && trainApp._proj().trains.length === 2 && trainApp._ws().getTopBlocks().length === 1, null, { timeout: 15000 });
  ok(true, 'reopening the saved project brings everything back');
  await page.click('#tlRun');
  await page.waitForFunction(() => trainApp._sim().trains[1].dist > 0.3, null, { timeout: 10000 });
  ok(true, 'Run still works after leaving the Train Lab and reopening a project');
  await page.click('#tlStop');
  // ---- wagons, places and challenges in the app
  const wp = await page.evaluate(() => {
    const A = trainApp; A.setProject(null);
    const mid = p => A._sim().geoms[p].paths[0].at(0.5);
    A.setTool('wagon'); let q = mid(3); A._tapWorld(q.x, q.y);
    const wag = A._sim().freeWagons().length;
    A.setPlace('farm'); A._tapWorld(0.5, -0.6); // beside piece 0, outside the oval
    const signs = A._proj().dests.map(d => d.t + ':' + d.p).join();
    A.setTool('erase'); const s = A._proj().dests[0]; const G = A._sim().geoms[s.p].paths[0].at(0.5); A._tapWorld(G.x - Math.sin(G.ang) * 0.6 * s.side, G.y + Math.cos(G.ang) * 0.6 * s.side);
    const afterErase = A._proj().dests.length + '/' + A._proj().pieces.length;
    return { wag, signs, afterErase };
  });
  ok(wp.wag === 1 && wp.signs === 'farm:0' && wp.afterErase === '0/20', 'the Wagon tool leaves a wagon on the track, the Places tool puts up a sign, the rubber takes the sign away (not the piece)');
  await page.click('#tlChal');
  ok(await page.evaluate(() => document.querySelectorAll('#tlModal:not([hidden]) .tl-ccard').length === 4), 'Challenges opens a panel with the ready-made challenges');
  await page.click('.tl-ccard[data-ch="first-stop"]');
  await page.click('#cj-dialog button >> text=Yes').catch(() => {});
  await page.waitForFunction(() => trainApp._proj().challenge && trainApp._proj().challenge.id === 'first-stop', null, { timeout: 5000 });
  ok(await page.evaluate(() => !document.getElementById('tlCheck').hidden && document.querySelectorAll('#tlCheck li').length === 3), 'opening one shows its jobs on the board');
  await page.click('#tlChAnswer');
  await page.click('#cj-dialog button >> text=Yes').catch(() => {});
  await page.waitForFunction(() => (trainApp._proj().pieces[0][4] || [])[0] === 'white', null, { timeout: 5000 });
  await page.click('#tlRun');
  await page.waitForFunction(() => trainApp._checker() && trainApp._checker().complete(), null, { timeout: 40000 });
  ok(await page.evaluate(() => /Challenge complete/.test(document.getElementById('tlCheck').textContent)), 'Show the answer + Run: every job ticks off and it says Challenge complete');
  await page.click('#tlStop');
  const card = await page.evaluate(() => { const h = trainApp.cardHTML(false), a = trainApp.cardHTML(true); return { h, a }; });
  ok(/Your mission/.test(card.h) && /Stop at the train station/.test(card.h) && /data:image\/png/.test(card.h) && !/ANSWER/.test(card.h) && /ANSWER/.test(card.a) && /× white/.test(card.a), 'the challenge card has the track picture and the jobs; the answer card lists the snaps');
  await page.evaluate(() => { window.doPrint = h => { window._printed = h; }; trainApp.openChallenges(); });
  await page.click('#tlCardPrint');
  ok(await page.evaluate(() => /First stop/.test(window._printed || '')), 'Print the challenge card sends the card to the printer');
  await page.keyboard.press('Escape');
  const saved2 = await page.evaluate(() => JSON.stringify(buildPayload().train));
  ok(/"challenge":\{"id":"first-stop"/.test(saved2) && /"dests":\[\{"t":"start"/.test(saved2), 'the challenge and the places are saved with the project');


  // ---- zoom and move round the board; a real click still puts a piece down, a drag only moves the view
  await page.evaluate(() => trainApp.setProject(null));
  const box = await page.locator('#tlCanvas').boundingBox();
  const T0 = await page.evaluate(() => trainApp._sim() && document.getElementById('tlFit').classList.contains('on'));
  await page.click('#tlZoomIn'); await page.click('#tlZoomIn');
  const z1 = await page.evaluate(() => trainApp._cam());
  ok(T0 && z1 && z1.T > 0 && await page.evaluate(() => !document.getElementById('tlFit').classList.contains('on')), 'the + button zooms in (and Fit lights up again only when it fits)');
  const n0 = await page.evaluate(() => trainApp._proj().pieces.length);
  await page.mouse.move(box.x + 30, box.y + box.height - 30); await page.mouse.down(); await page.mouse.move(box.x + 130, box.y + box.height - 60, { steps: 6 }); await page.mouse.up();
  const z2 = await page.evaluate(() => trainApp._cam());
  ok(Math.abs(z2.x - z1.x) > 0.1 && await page.evaluate(n => trainApp._proj().pieces.length === n, n0), 'dragging the mat moves round the track and doesn’t put a piece down');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.wheel(0, -300);
  ok(await page.evaluate(T => trainApp._cam().T > T, z2.T), 'the mouse wheel zooms');
  await page.click('#tlFit');
  ok(await page.evaluate(() => trainApp._cam() === null), 'Fit shows the whole track again');
  await page.evaluate(() => { trainApp.setProject({ v: 2, pieces: [['straight', 0, 0, 0, null]], trains: [{ name: 'T' }] }); trainApp.setTool('straight'); });
  const plus = await page.evaluate(() => { const o = trainApp._openEnds().find(e => e.x > 0.5), c = document.getElementById('tlCanvas'), r = c.getBoundingClientRect(), V = { w: c.clientWidth, h: c.clientHeight };
    trainApp.zoomAt(1); const cam = trainApp._cam(); const x = o.x + Math.cos(o.h) * 0.14, y = o.y + Math.sin(o.h) * 0.14;
    return { x: r.left + V.w / 2 + (x - cam.x) * cam.T, y: r.top + V.h / 2 + (y - cam.y) * cam.T }; });
  await page.mouse.click(plus.x, plus.y);
  ok(await page.evaluate(() => trainApp._proj().pieces.length === 2), 'a click on a blue + still clicks a piece on, even zoomed in');

  // ---- the order: tap places one after another
  const ord = await page.evaluate(async () => {
    const m = await import('./train/train-challenges.js'); const P = m.challengeProject('airport-run'); P.challenge = null; trainApp.setProject(P);
    const A = trainApp, spot = j => { const d = A._proj().dests[j], G = A._sim().geoms[d.p].paths[0].at(0.5); return [G.x - Math.sin(G.ang) * 0.6 * d.side, G.y + Math.cos(G.ang) * 0.6 * d.side]; };
    A.setTool('order'); for (const j of [0, 1, 2, 3, 3]) A._tapWorld(...spot(j));
    const after = A._proj().challenge.steps.map(s => s.d + s.a).join();
    A._tapWorld(...spot(3));
    return { after, again: A._proj().challenge.steps.map(s => s.d + s.a).join(), check: document.querySelectorAll('#tlCheck li').length };
  });
  ok(ord.after === '0start,1stop,2stop' && ord.again === '0start,1stop,2stop,3stop' && ord.check === 4, 'the Order tool: tapping places numbers them 1, 2, 3… (tap the last again to take it off) and they become the jobs');
  await page.evaluate(() => trainApp.openChallenges());
  await page.click('[data-sw="1"]');
  ok(await page.evaluate(() => trainApp._proj().challenge.steps.map(s => s.d).join() === '0,2,1,3'), 'in Challenges a job can be moved up or down');
  await page.keyboard.press('Escape');
  ok(errors.length === 0, 'no errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
