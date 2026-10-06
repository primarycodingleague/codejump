// Train Lab (projectType 'train'): the track simulator in Node, then the app — chooser, building a track, every kind of
// block, two trains, saving and reopening.
import { ok, done, serve, browser, openApp, ROOT } from './lib.mjs';
import { pathToFileURL } from 'node:url';

const TM = await import(pathToFileURL(ROOT + '/train/train-model.js').href);

// ---- the simulator on its own
{
  const p = { ...TM.starterTrack(), trains: [{ name: 'A', start: { c: 6, r: 5, p: 0, rev: false } }] };
  const ev = [];
  const sim = TM.createSim(p, { onEvent: (i, k, d) => ev.push(k + ':' + d) });
  sim.setTarget(0, 2);
  for (let i = 0; i < 60 * 20; i++) sim.step(1 / 60);
  ok(ev.filter(e => e === 'colour:red').length >= 2 && ev.includes('split:straight'), 'a train goes round the starter loop, sees the red snap and goes straight on at the split');
  const ev2 = [];
  const s2 = TM.createSim(p, { onEvent: (i, k, d) => { ev2.push(k + ':' + d); if (d === 'blue') s2.trains[0].next = 'right'; } });
  s2.setTarget(0, 2); for (let i = 0; i < 60 * 8; i++) s2.step(1 / 60);
  ok(ev2.includes('split:right'), '“at the next split go right” takes the shortcut');
  // a short line with buffer stops at both ends
  const line = { cols: 6, rows: 3, tiles: [[1, 1, 'end', 3, null], [2, 1, 'straight', 1, null], [3, 1, 'straight', 1, 'green'], [4, 1, 'end', 1, null]],
    trains: [{ name: 'S', start: { c: 2, r: 1, p: 0, rev: false } }] };
  const ev3 = []; const s3 = TM.createSim(line, { onEvent: (i, k, d) => ev3.push(k + ':' + d) });
  s3.setTarget(0, 2); for (let i = 0; i < 60 * 3; i++) s3.step(1 / 60);
  ok(ev3.includes('end:buffer') && s3.trains[0].v === 0, 'a train stops at a buffer stop');
  s3.turnAround(0); s3.setTarget(0, 2); for (let i = 0; i < 60 * 3; i++) s3.step(1 / 60);
  ok(ev3.filter(e => e === 'end:buffer').length === 2 && ev3.includes('colour:green'), 'turned round, it drives back over the green snap to the other buffer stop');
  // two trains head to head
  const two = { cols: 8, rows: 3, tiles: [0, 1, 2, 3, 4, 5, 6, 7].map(c => [c, 1, 'straight', 1, null]),
    trains: [{ name: 'A', start: { c: 1, r: 1, p: 0, rev: true } }, { name: 'B', start: { c: 6, r: 1, p: 0, rev: false } }] };
  const ev4 = []; const s4 = TM.createSim(two, { onEvent: (i, k, d) => ev4.push(i + k + d) });
  s4.setTarget(0, 2); s4.setTarget(1, 2); for (let i = 0; i < 60 * 4; i++) s4.step(1 / 60);
  ok(ev4.includes('0bumpB') && ev4.includes('1bumpA') && s4.trains[0].v === 0 && s4.trains[1].v === 0, 'two trains that meet bump and both stop');
  const bad = TM.cleanProject({ cols: 99, rows: -3, tiles: [[0, 0, 'rocket', 0], [1, 1, 'curve', 7, 'pink'], [1, 1, 'straight', 0], 'x'], trains: [{ name: '<b>Zoom</b>', color: 'red', start: { c: 5, r: 5, p: 0 } }, 1, 2, 3] });
  ok(bad.cols === 16 && bad.rows === 4 && bad.tiles.length === 1 && bad.tiles[0][3] === 3 && bad.tiles[0][4] === null && bad.trains.length === 1 && bad.trains[0].start === null && !bad.trains[0].name.includes('<'),
    'a saved project with nonsense in it is tidied up');
}

const site = await serve(), b = await browser(), errors = [];
const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const chain = list => { let first = null, prev = null; for (const x of list) { if (prev) prev.next = { block: x }; else first = x; prev = x; } return first; };
const script = (hat, list, y = 20) => ({ ...hat, x: 20, y, next: { block: chain(list) } });
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
  ok(await page.evaluate(() => projectType === 'train' && document.body.classList.contains('train-mode') && trainApp._proj().tiles.length === 28), 'it opens as a Train Lab project with the starter track');

  // ---- the starter program: drives, then stops at the red station
  await page.click('#tlRun');
  await page.waitForFunction(() => { const t = trainApp._sim().trains[0]; return t.lastColour === 'red' && t.v === 0 && t.top === '#ff3b3b'; }, null, { timeout: 15000 });
  ok(true, 'the starter train drives to the red snap, stops and lights its roof red');
  await page.waitForFunction(() => { const t = trainApp._sim().trains[0]; return t.v > 0.5 && t.top === '#29c46a'; }, null, { timeout: 10000 });
  ok(true, 'after the stop it sets off again with a green roof light');
  await page.click('#tlStop');
  ok(await page.evaluate(() => !trainApp._runner().running()), 'Stop stops the trains');

  // ---- build a track by tapping: a line with buffer stops, a snap, turning a piece
  await page.evaluate(() => { trainApp.setProject({ cols: 10, rows: 7, tiles: [], trains: [{ name: 'Shuttle', start: null }] }); });
  const built = await page.evaluate(() => {
    const A = trainApp;
    A.setTool('end'); for (let i = 0; i < 4; i++) A._tap(1, 2); // laid, then turned three times: opens to the right
    A.setTool('straight'); A._tap(2, 2); A._tap(3, 2); A._tap(4, 2); // new pieces keep the last turn: left to right
    A.setTool('end'); for (let i = 0; i < 3; i++) A._tap(5, 2); // turned twice more: opens to the left
    A.setTool('yellow'); A._tap(3, 2);
    A.setTool('train'); A._tap(2, 2);
    const p = A._proj();
    return { tiles: p.tiles.length, rots: p.tiles.map(t => t[3]).join(''), snap: p.tiles.find(t => t[0] === 3)[4], start: !!p.trains[0].start };
  });
  ok(built.tiles === 5 && built.rots === '33331' && built.snap === 'yellow' && built.start, 'tapping lays pieces, tapping again turns them, snaps clip on and the train goes on the track');
  ok(await page.evaluate(() => { trainApp.setTool('erase'); trainApp._tap(4, 2); const n = trainApp._proj().tiles.length; document.getElementById('tlCanvas').focus(); return n; }) === 4, 'the rubber takes a piece away');
  await page.click('#tlUndo');
  ok(await page.evaluate(() => trainApp._proj().tiles.length === 5), 'Undo puts it back');

  // ---- a program with every kind of block: shuttle between the buffers, count with a variable, messages, tap
  const prog = { blocks: { languageVersion: 0, blocks: [
    script({ type: 'tr_when_run' }, [{ type: 'tr_headlight', fields: { COL: '#ffff00' } }, { type: 'tr_set_speed', inputs: { N: N(80) } }]),
    script({ type: 'tr_when_end' }, [
      { type: 'math_change', fields: { VAR: { id: 'v1' } }, inputs: { DELTA: N(1) } },
      { type: 'controls_if', inputs: { IF0: { block: { type: 'logic_compare', fields: { OP: 'LT' }, inputs: { A: { block: { type: 'variables_get', fields: { VAR: { id: 'v1' } } } }, B: N(3) } } },
        DO0: { block: { type: 'tr_turn_around' } } }, extraState: { hasElse: true } }
    ], 300),
    script({ type: 'tr_when_colour', fields: { COL: 'yellow' } }, [{ type: 'tr_send', fields: { MSG: 'seen' } }], 500),
    script({ type: 'tr_when_message', fields: { MSG: 'seen' } }, [{ type: 'tr_toplight', fields: { COL: '#0000ff' } }], 600),
    script({ type: 'tr_when_tapped' }, [{ type: 'tr_sound', fields: { SND: 'horn' } }, { type: 'variables_set', fields: { VAR: { id: 'v2' } }, inputs: { VALUE: N(7) } }], 700)
  ] }, variables: [{ name: 'ends', id: 'v1' }, { name: 'tapped', id: 'v2' }] };
  await page.evaluate(p => { const P = trainApp.getProject(); P.trains[0].blocks = p; trainApp.setProject(P); }, prog);
  await page.click('#tlRun');
  await page.waitForFunction(() => trainApp._runner()._vars().ends === 3, null, { timeout: 20000 });
  const sh = await page.evaluate(() => { const t = trainApp._sim().trains[0]; return { head: t.head, top: t.top, v: t.v }; });
  ok(sh.head === '#ffff00' && sh.top === '#0000ff', 'set speed, headlight, colour snap → send message → when I receive all work');
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => trainApp._sim().trains[0].v === 0 && trainApp._runner()._vars().ends === 3), 'when I reach the end + turn around shuttles it, and the variable stops it after 3 ends');
  await page.evaluate(() => trainApp._runner().tap(0));
  await page.waitForFunction(() => trainApp._runner()._vars().tapped === 7, null, { timeout: 5000 });
  ok(true, 'tapping the train starts its when-tapped script');
  await page.click('#tlStop');

  // ---- two trains, each with its own blocks
  await page.evaluate(() => trainApp.setProject(null));
  await page.click('#tlAdd');
  ok(await page.evaluate(() => trainApp._proj().trains.length === 2 && document.querySelectorAll('#tlTrains .tl-tab[data-i]').length === 2), 'Add a train adds a second train with its own tab');
  await page.evaluate(() => { trainApp._tap(4, 1); }); // put Train 2 on the top row
  await page.evaluate(() => trainApp.selectTrain(0));
  ok(await page.evaluate(() => trainApp._ws().getTopBlocks().length === 3), 'each train keeps its own blocks (train 1 still has the starter program)');
  await page.click('#tlRun');
  await page.waitForFunction(() => trainApp._sim().trains.every(t => t.dist > 1), null, { timeout: 10000 });
  ok(true, 'both trains run their own programs at once');
  await page.click('#tlStop');

  // ---- saving and reopening
  const saved = await page.evaluate(() => JSON.stringify(buildPayload()));
  const p = JSON.parse(saved);
  ok(p.projectType === 'train' && p.train.trains.length === 2 && p.train.tiles.length === 28 && p.train.trains[1].start, 'the project saves the track, both trains and their blocks');
  await page.evaluate(() => { startNewProject('ks2'); document.getElementById('tutorial').classList.add('hide'); });
  await page.evaluate(j => applyPayload(JSON.parse(j)), saved);
  await page.waitForFunction(() => document.body.classList.contains('train-mode') && trainApp._proj().trains.length === 2 && trainApp._ws().getTopBlocks().length === 3, null, { timeout: 15000 });
  ok(true, 'reopening the saved project brings everything back');
  await page.click('#tlRun');
  await page.waitForFunction(() => trainApp._sim().trains[0].dist > 0.5, null, { timeout: 10000 });
  ok(true, 'Run still works after leaving the Train Lab and reopening a project');
  await page.click('#tlStop');
  ok(errors.length === 0, 'no errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
