// Live collaboration in the Build, Critter, AI and Train Labs: three people in one room (a stand-in room that behaves like
// the cloud's Durable Object, worker v18: the newest copy of each lab part wins and is kept for late joiners; Build Lab
// block changes are numbered and sent to everyone, sender too, and logged for late joiners).
import { ok, done, serve, browser, openApp, sleep } from './lib.mjs';
const site = await serve(), b = await browser(), errors = [];
const people = { a: 'Ana', b: 'Ben', c: 'Cara' };
let room;
const newRoom = () => { room = { doc: null, socks: new Map() }; };
function send(ws, o) { try { ws.send(JSON.stringify(o)); } catch (e) { /* closed */ } }
function others(uid, o) { for (const [u, ws] of room.socks) if (u !== uid) send(ws, o); }
function everyone(o) { for (const ws of room.socks.values()) send(ws, o); }
function onOp(uid, op) { // the same as worker v18 for these labs
  const d = room.doc = room.doc || {};
  if (op.k === 'cr_sets' || op.k === 'cr_world') {
    d.crSeq = (d.crSeq | 0) + 1; d.crLog = d.crLog || [];
    const out = op.k === 'cr_sets' ? { k: 'cr_sets', seq: d.crSeq, sets: op.sets } : { k: 'cr_world', seq: d.crSeq, world: op.world };
    if (op.k === 'cr_sets') d.crLog.push(out); else { d.craft = d.craft || {}; d.craft.world = op.world; d.crWseq = d.crSeq; d.crLog = []; }
    everyone({ type: 'op', op: out, from: uid }); return;
  }
  if (op.k === 'lp') {
    const st = d._lp = d._lp || {}, key = op.lab + '.' + op.part, cur = st[key];
    if (!(cur && (op.t < cur[0] || (op.t === cur[0] && op.cid <= cur[1])))) { st[key] = [op.t, op.cid]; if (op.part === 'all') d[op.lab] = op.v; else Object.assign(d[op.lab] = d[op.lab] || {}, op.v); }
  }
  others(uid, { type: 'op', op, from: uid });
}
async function person(uid) {
  const { ctx, page } = await openApp(b, site.url, { errors });
  await ctx.routeWebSocket(/\/room\//, ws => {
    room.socks.set(uid, ws);
    send(ws, { type: 'init', doc: room.doc, you: { uid, name: people[uid], color: '#f00' }, members: [...room.socks.keys()].map(u => ({ uid: u, name: people[u], color: '#0f0' })) });
    others(uid, { type: 'join', member: { uid, name: people[uid], color: '#0f0' } });
    ws.onMessage(raw => {
      const m = JSON.parse(raw);
      if (m.type === 'snapshot') { const keep = room.doc; room.doc = m.doc; if (keep) for (const k of ['_lp', 'crSeq', 'crWseq', 'crLog']) if (keep[k] !== undefined) room.doc[k] = keep[k]; others(uid, { type: 'snapshot', doc: m.doc, from: uid }); }
      else if (m.type === 'op') onOp(uid, m.op);
      else if (m.type === 'cursor') others(uid, { type: 'cursor', uid, cell: m.cell, color: '#00f' });
    });
    ws.onClose(() => { room.socks.delete(uid); others(uid, { type: 'leave', uid }); });
  });
  await page.reload(); // the room only catches sockets on pages loaded after it was set up
  await page.waitForFunction(() => typeof startNewProject === 'function' && typeof collabConnect === 'function');
  await page.evaluate(() => { document.getElementById('splash')?.remove(); cloudToken = 'tok'; });
  return page;
}
const wf = (pg, fn, arg, t = 30000) => pg.waitForFunction(fn, arg, { timeout: t, polling: 150 }).then(() => true, () => false);
const APP = { craft: 'craftApp', critter: 'critterApp', ai: 'aiApp', train: 'trainApp' };
const START = { craft: 'startNewCraft', critter: 'startNewCritter', ai: 'startNewAI', train: 'startNewTrain' };
const ready = (pg, lab) => wf(pg, ([lab, app]) => projectType === lab && eval(app) && (!eval(app)._ws || eval(app)._ws()) && labLive.base, [lab, APP[lab]], 45000);
try {
  const A = await person('a'), B = await person('b'), C = await person('c');
  for (const lab of ['craft', 'critter', 'ai', 'train']) {
    newRoom();
    for (const p of [A, B, C]) await p.evaluate(() => { try { collabDisconnect(true); } catch (e) { /* not in one */ } });
    await A.evaluate(f => window[f]('ks2'), START[lab]);
    await wf(A, app => !!eval(app) && (!eval(app)._ws || eval(app)._ws()), APP[lab], 45000); await sleep(500);
    await A.evaluate(() => collabConnect('room-' + projectType));
    ok(await ready(A, lab) && room.doc && room.doc.projectType === lab, lab + ': opening a room sends the project to it');
    if (lab === 'craft') ok(await A.evaluate(() => { cloudMe = cloudMe || { uid: 'a', displayName: 'Ana', role: 'student', classes: [], projects: [] }; openShareModal();
      const v = document.getElementById('sh-collab').style.display !== 'none'; document.getElementById('share-modal').classList.add('hide'); return v; }), 'Share offers Collaborate in the Build Lab');
    await B.evaluate(r => collabConnect(r), 'room-' + lab);
    ok(await ready(B, lab), lab + ': Ben joins from the home page and the lab opens');
    if (lab === 'craft') {
      await A.evaluate(() => { const w = craftApp._world(); for (let y = 13; y < 17; y++) w.set(30, y, 30, 21); });
      ok(await wf(B, () => craftApp._world().get(30, 16, 30) === 21), 'craft: Ana’s tower appears for Ben');
      await B.evaluate(() => craftApp._world().set(31, 13, 30, 11));
      ok(await wf(A, () => craftApp._world().get(31, 13, 30) === 11), 'craft: Ben’s bricks appear for Ana');
      await Promise.all([A.evaluate(() => craftApp._world().set(33, 13, 30, 5)), B.evaluate(() => craftApp._world().set(33, 13, 30, 3))]);
      await sleep(1200);
      const [x1, x2] = await Promise.all([A.evaluate(() => craftApp._world().get(33, 13, 30)), B.evaluate(() => craftApp._world().get(33, 13, 30))]);
      ok(x1 === x2 && (x1 === 5 || x1 === 3), 'craft: changing the same block at the same moment ends up the same for both');
      await A.evaluate(() => { const ws = craftApp._ws(); const bl = ws.newBlock('cr_h_say'); bl.initSvg(); bl.render(); bl.moveBy(400, 400); });
      ok(await wf(B, () => craftApp._ws().getAllBlocks(false).some(b => b.type === 'cr_h_say' && b.getRelativeToSurfaceXY().x > 300)), 'craft: a new block in Ana’s code appears in Ben’s');
      await A.evaluate(() => craftApp._world().reset());
      ok(await wf(B, () => craftApp._world().get(30, 16, 30) === 0 && craftApp._world().get(31, 13, 30) === 0), 'craft: New world clears it for Ben too');
      await A.evaluate(() => { const w = craftApp._world(); w.set(20, 13, 20, 22); w.set(20, 14, 20, 22); });
      await sleep(600);
      await C.evaluate(r => collabConnect(r), 'room-craft');
      ok(await ready(C, lab) && await wf(C, () => craftApp._world().get(20, 14, 20) === 22 && craftApp._world().get(30, 16, 30) === 0 && craftApp._ws().getAllBlocks(false).some(b => b.type === 'cr_h_say' && b.getRelativeToSurfaceXY().x > 300)), 'craft: Cara joins late and gets the latest world and code');
    }
    if (lab === 'critter') {
      await A.evaluate(() => { const i = document.getElementById('zName'); i.value = 'Zippy'; i.dispatchEvent(new Event('input')); i.dispatchEvent(new Event('change')); i.blur(); });
      ok(await wf(B, () => critterApp.getCritter().name === 'Zippy'), 'critter: Ana’s rename reaches Ben');
      await B.evaluate(() => { const i = document.getElementById('zName'); i.value = 'Zappy'; i.dispatchEvent(new Event('input')); i.dispatchEvent(new Event('change')); i.blur(); });
      ok(await wf(A, () => critterApp.getCritter().name === 'Zappy'), 'critter: …and Ben’s comes back');
      await C.evaluate(r => collabConnect(r), 'room-critter');
      ok(await ready(C, lab) && await wf(C, () => critterApp.getCritter().name === 'Zappy'), 'critter: Cara joins late and gets the latest Critter');
    }
    if (lab === 'ai') {
      await A.evaluate(() => { aiApp.show('teach'); aiApp._pads.teach.set([[20, 20, 200, 200], [200, 20, 20, 200]]); aiApp._addExample(); });
      ok(await wf(B, () => aiApp._labels().some(l => l.ex.length === 1)), 'ai: Ana’s drawing appears for Ben');
      await B.evaluate(() => { aiApp.show('teach'); aiApp._pads.teach.set([[30, 128, 220, 128]]); aiApp._addExample(); });
      ok(await wf(A, () => aiApp._labels().reduce((n, l) => n + l.ex.length, 0) === 2), 'ai: …and Ben’s drawing comes back');
      await B.evaluate(() => { const ws = aiApp._ws(); const bl = ws.newBlock('math_number'); bl.initSvg(); bl.render(); bl.moveBy(500, 500); });
      ok(await wf(A, () => aiApp._ws().getAllBlocks(false).some(b => b.type === 'math_number' && !b.getParent())), 'ai: Ben’s new block reaches Ana');
      await C.evaluate(r => collabConnect(r), 'room-ai');
      ok(await ready(C, lab) && await wf(C, () => aiApp._labels().reduce((n, l) => n + l.ex.length, 0) === 2 && aiApp._ws().getAllBlocks(false).some(b => b.type === 'math_number' && !b.getParent())), 'ai: Cara joins late and gets both drawings and the code');
    }
    if (lab === 'train') {
      const n0 = await A.evaluate(() => trainApp._proj().pieces.length);
      const n1 = await A.evaluate(async () => { const TM = await import('./train/train-model.js'); const g = TM.pieceGeom(trainApp._proj().pieces[4]); const m = g.paths[0].at(0.5); trainApp.setTool('erase'); trainApp._tapWorld(m.x !== undefined ? m.x : m[0], m.y !== undefined ? m.y : m[1]); return trainApp._proj().pieces.length; });
      ok(n1 === n0 - 1 && await wf(B, n => trainApp._proj().pieces.length === n, n1), 'train: a piece Ana rubs out goes from Ben’s track too');
      await B.evaluate(() => { const ws = trainApp._ws(); const bl = ws.newBlock('math_number'); bl.initSvg(); bl.render(); bl.moveBy(500, 500); });
      ok(await wf(A, () => trainApp._ws().getAllBlocks(false).some(b => b.type === 'math_number' && !b.getParent())), 'train: Ben’s new block reaches Ana');
      await C.evaluate(r => collabConnect(r), 'room-train');
      ok(await ready(C, lab) && await wf(C, n => trainApp._proj().pieces.length === n && trainApp._ws().getAllBlocks(false).some(b => b.type === 'math_number' && !b.getParent()), n1), 'train: Cara joins late and gets the latest track and code');
    }
  }
  const errs = errors.filter(e => !/WebSocket|Failed to load resource/.test(e));
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
