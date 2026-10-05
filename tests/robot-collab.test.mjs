// Robot Lab live collaboration: three people in one room (a stand-in room that relays like the cloud's Durable Object,
// and keeps the robot for late joiners like worker v16). Blocks, name and colours stay in step; Run is only local.
import { ok, done, serve, browser, openApp, sleep } from './lib.mjs';
const site = await serve(), b = await browser(), errors = [];
const room = { doc: null, socks: new Map() }; // uid -> route
const people = { a: 'Ana', b: 'Ben', c: 'Cara' };
function send(ws, o) { try { ws.send(JSON.stringify(o)); } catch (e) { /* closed */ } }
function others(uid, o) { for (const [u, ws] of room.socks) if (u !== uid) send(ws, o); }
function applyOp(op) { // the same as worker v16 for robot ops
  if (!room.doc || !op) return;
  if (op.k === 'rb_doc' || op.k === 'rb_set') {
    const r = room.doc.robot = room.doc.robot || {}; if (op.k === 'rb_doc' && op.blocks) r.blocks = op.blocks;
    const st = Number(op.st) || 0, cur = Number(r.st) || 0;
    if (st > cur || (st === cur && String(op.scid || '') >= String(r.scid || ''))) { r.name = op.name; r.body = op.body; r.trim = op.trim; if (st) { r.st = st; r.scid = op.scid; } }
  }
}
async function person(uid) {
  const { ctx, page } = await openApp(b, site.url, { errors });
  await ctx.routeWebSocket(/\/room\//, ws => {
    room.socks.set(uid, ws);
    send(ws, { type: 'init', doc: room.doc, you: { uid, name: people[uid], color: '#f00' }, members: [...room.socks.keys()].map(u => ({ uid: u, name: people[u] })) });
    others(uid, { type: 'join', member: { uid, name: people[uid], color: '#0f0' } });
    ws.onMessage(raw => {
      const m = JSON.parse(raw);
      if (m.type === 'snapshot') { room.doc = m.doc; others(uid, { type: 'snapshot', doc: m.doc, from: uid }); }
      else if (m.type === 'op') { applyOp(m.op); others(uid, { type: 'op', op: m.op, from: uid }); }
      else if (m.type === 'cursor') others(uid, { type: 'cursor', uid, cell: m.cell, color: '#00f' });
    });
  });
  await page.reload(); // the room only catches sockets on pages loaded after it was set up
  await page.waitForFunction(() => typeof startNewProject === 'function' && typeof collabConnect === 'function');
  await page.evaluate(() => { document.getElementById('splash')?.remove(); cloudToken = 'tok'; });
  return page;
}
const ws = p => p.evaluate(() => JSON.stringify(Blockly.serialization.workspaces.save(robotApp._ws()).blocks.blocks.map(x => x.id).sort()));
const sayText = (p) => p.evaluate(() => { const b = robotApp._ws().getAllBlocks(false).find(x => x.type === 'rb_say_wait'); const t = b && b.getInputTargetBlock('TEXT'); return t ? t.getFieldValue('TEXT') : null; });
try {
  // Ana starts a robot and opens a live room
  const A = await person('a');
  await A.evaluate(() => startNewRobot('ks2'));
  await A.waitForFunction(() => robotApp && robotApp._ws() && robotApp._view(), null, { timeout: 30000 });
  await A.evaluate(() => collabConnect('room1'));
  await A.waitForFunction(() => collabActive, null, { timeout: 10000, polling: 100 });
  await sleep(300);
  ok(room.doc && room.doc.projectType === 'robot', 'opening a room sends the robot to it');
  ok(await A.evaluate(() => { cloudMe = cloudMe || { uid: 'a', displayName: 'Ana', role: 'student', classes: [], projects: [] }; openShareModal();
    const v = document.getElementById('sh-collab').style.display !== 'none'; document.getElementById('share-modal').classList.add('hide'); return v; }), 'Share offers Collaborate for Robot Lab');

  // Ben joins from the home page and gets Ana's robot
  const B = await person('b');
  await B.evaluate(() => collabConnect('room1'));
  await B.waitForFunction(() => projectType === 'robot' && robotApp && robotApp._ws() && robotApp._ws().getAllBlocks(false).length > 3, null, { timeout: 30000 });
  ok(await ws(A) === await ws(B), 'Ben joins and sees exactly Ana’s blocks');

  // Ana edits a block: Ben sees it
  await A.evaluate(() => { const b = robotApp._ws().getAllBlocks(false).find(x => x.type === 'rb_say_wait'); b.getInputTargetBlock('TEXT').setFieldValue('Hi from Ana', 'TEXT'); });
  await B.waitForFunction(() => { const b = robotApp._ws().getAllBlocks(false).find(x => x.type === 'rb_say_wait'); return b && b.getInputTargetBlock('TEXT').getFieldValue('TEXT') === 'Hi from Ana'; }, null, { timeout: 10000, polling: 100 });
  ok(true, 'Ana changes the words: Ben sees them');

  // Ben adds a block: Ana sees it
  const before = await A.evaluate(() => robotApp._ws().getAllBlocks(false).length);
  await B.evaluate(() => { const ws = robotApp._ws(); const nb = ws.newBlock('rb_blink'); nb.initSvg(); nb.render(); nb.moveBy(400, 40); });
  await A.waitForFunction(n => robotApp._ws().getAllBlocks(false).length === n + 1, before, { timeout: 10000, polling: 100 });
  ok(true, 'Ben adds a block: Ana sees it');

  // the name and colours
  await A.fill('#rbName', 'Team Bot');
  await A.evaluate(() => { const c = document.getElementById('rbBody'); c.value = '#ffd166'; c.dispatchEvent(new Event('input')); });
  await B.waitForFunction(() => document.getElementById('rbName').value === 'Team Bot' && document.getElementById('rbBody').value === '#ffd166' && robotApp._view().robot.shell.color.getHexString() === 'ffd166', null, { timeout: 10000, polling: 100 });
  ok(true, 'renaming and recolouring the robot shows on Ben’s screen too');

  // Run only plays on your own screen
  await A.click('#rbRun');
  await sleep(300);
  ok(await A.evaluate(() => robotApp._runner().running()) && !(await B.evaluate(() => robotApp._runner().running())), 'Run plays only on Ana’s screen');
  await A.click('#rbStop');

  // undo only undoes your own change
  await B.evaluate(() => { const ws = robotApp._ws(); ws.undo(false); ws.undo(false); }); // creating then moving the new block = two steps
  await sleep(2200);
  ok(await sayText(B) === 'Hi from Ana' && await B.evaluate(() => !robotApp._ws().getAllBlocks(false).some(x => x.type === 'rb_blink' && x.getRootBlock() === x)), 'Ben’s undo takes back his own block, not Ana’s words');

  // everyone settles on the same blocks, and a late joiner gets the latest robot
  await sleep(1800);
  ok(await ws(A) === await ws(B), 'Ana and Ben end up with the same blocks');
  const C = await person('c');
  await C.evaluate(() => collabConnect('room1'));
  await C.waitForFunction(() => projectType === 'robot' && robotApp && robotApp._ws() && robotApp._ws().getAllBlocks(false).length > 3 && document.getElementById('rbName').value === 'Team Bot', null, { timeout: 30000 });
  await sleep(2500);
  ok(await ws(C) === await ws(A) && await sayText(C) === 'Hi from Ana', 'Cara joins late and gets the latest robot, name included');

  // pointers show over the whole editor
  await A.mouse.move(300, 300);
  await B.waitForFunction(() => document.querySelectorAll('#collab-cursors .cc-ptr').length > 0, null, { timeout: 10000, polling: 100 });
  ok(true, 'partners see each other’s pointers');
  ok(errors.length === 0, 'no errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
