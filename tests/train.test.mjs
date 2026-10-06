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
  ok(errors.length === 0, 'no errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
