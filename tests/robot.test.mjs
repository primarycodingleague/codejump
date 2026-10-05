// Robot Lab (projectType 'robot'): the chooser, the 3D robot, every kind of block, saving, and that the old Ohbot is gone.
import { ok, done, serve, browser, openApp } from './lib.mjs';
const site = await serve(), b = await browser(), errors = [];
const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const T = t => ({ shadow: { type: 'text', fields: { TEXT: t } } });
const chain = list => { let first = null, prev = null; for (const x of list) { if (prev) prev.next = { block: x }; else first = x; prev = x; } return first; };
const script = (hat, list, extra = {}) => ({ ...hat, x: 20, y: extra.y || 20, next: { block: chain(list) } });
try {
  const { page } = await openApp(b, site.url, { errors });
  // ---- the chooser: Robot Lab for KS2/3, not KS1
  await page.evaluate(() => { _pendingKs = 'ks1'; document.getElementById('ks-modal').classList.remove('hide'); });
  await page.click('#ks-modal .ks-opt >> nth=0'); // KS1
  ok(await page.evaluate(() => document.querySelector('#pt-modal .ks-opt[data-pt="robot"]').style.display === 'none'), 'Robot Lab is hidden for Key Stage 1');
  await page.click('#pt-cancel'); await page.click('#ks-modal .ks-opt >> nth=1'); // KS2
  ok(await page.evaluate(() => document.querySelector('#pt-modal .ks-opt[data-pt="robot"]').style.display !== 'none'), 'Robot Lab is offered for Key Stage 2');
  await page.click('#pt-modal .ks-opt[data-pt="robot"]');
  await page.waitForFunction(() => robotApp && robotApp._view() && robotApp._ws(), null, { timeout: 30000 });
  ok(await page.evaluate(() => projectType === 'robot' && document.body.classList.contains('robot-mode')), 'it opens as a Robot Lab project');
  ok(await page.evaluate(() => robotApp._ws().getTopBlocks().some(t => t.type === 'rb_when_run')), 'a new robot starts with the example program');

  // ---- the example program runs to the end
  await page.click('#rbRun');
  await page.waitForFunction(() => !robotApp._runner().busy(), null, { timeout: 60000 });
  const st = await page.evaluate(() => robotApp._view().state().cur);
  ok(st.Brows === 7 && st.Mouth === 6 && st.HeadTurn === 5, 'the example ends with a happy face, looking ahead');

  // ---- a test program with every kind of block
  const prog = { blocks: { languageVersion: 0, blocks: [
    script({ type: 'rb_when_run' }, [
      { type: 'rb_speed', fields: { M: 'all' }, inputs: { N: N(10) } },
      { type: 'rb_move', fields: { M: 'HeadTurn' }, inputs: { N: N(9) } },
      { type: 'rb_start_move', fields: { M: 'Eyelids' }, inputs: { N: N(4) } },
      { type: 'rb_start_move', fields: { M: 'Brows' }, inputs: { N: N(9) } },
      { type: 'rb_change', fields: { M: 'HeadTurn' }, inputs: { N: N(-2) } },
      { type: 'controls_repeat_ext', inputs: { TIMES: N(3), DO: { block: { type: 'math_change', fields: { VAR: { id: 'v1' } }, inputs: { DELTA: N(2) } } } } },
      { type: 'controls_if', inputs: { IF0: { block: { type: 'logic_compare', fields: { OP: 'EQ' }, inputs: { A: { block: { type: 'variables_get', fields: { VAR: { id: 'v1' } } } }, B: N(6) } } },
        DO0: { block: { type: 'rb_light', fields: { PART: 'chest', COL: '#00ff00' } } } } },
      { type: 'rb_ask', inputs: { TEXT: T('What is your name?') } },
      { type: 'rb_say_wait', inputs: { TEXT: { block: { type: 'text_join', extraState: { itemCount: 2 }, inputs: { ADD0: T('Hi '), ADD1: { block: { type: 'rb_answer' } } } } } } },
      { type: 'rb_send', fields: { MSG: 'done' } }
    ]),
    script({ type: 'rb_when_message', fields: { MSG: 'done' } }, [{ type: 'rb_face', fields: { FACE: 'surprised' } }], { y: 600 }),
    script({ type: 'rb_when_tapped', fields: { PART: 'head' } }, [{ type: 'rb_move', fields: { M: 'HeadNod' }, inputs: { N: N(9) } }], { y: 700 }),
    script({ type: 'rb_when_key', fields: { KEY: 'space' } }, [{ type: 'rb_move', fields: { M: 'HeadTilt' }, inputs: { N: N(1) } }], { y: 800 })
  ] }, variables: [{ name: 'score', id: 'v1' }] };
  await page.evaluate(p => robotApp.setProject({ blocks: p, name: 'Bolt', body: '#ffd166', trim: '#e04f5f' }), prog);
  await page.click('#rbRun');
  await page.waitForSelector('#rbAsk:not([hidden])', { timeout: 20000 });
  const mid = await page.evaluate(() => ({ s: robotApp._view().state().cur, v: Object.values(robotApp._runner()._vars()), chest: robotApp._view().robot.lights.chest.emissive.getHexString() }));
  ok(mid.s.HeadTurn === 7 && mid.s.Eyelids === 4 && mid.s.Brows === 9, 'move waits, start moving runs motors together, change by adds on');
  ok(mid.v[0] === 6 && mid.chest === '00ff00', 'repeat, variables and if work (the chest light went green)');
  await page.fill('#rbAnswer', 'Amara'); await page.click('#rbAsk button');
  await page.waitForFunction(() => document.getElementById('rbBubble').textContent === 'Hi Amara', null, { timeout: 10000 });
  ok(true, 'ask and answer: the robot says “Hi Amara”');
  await page.waitForFunction(() => robotApp._view().state().cur.Brows === 10, null, { timeout: 15000 });
  ok(true, 'send message starts the “when I receive” script (a surprised face)');
  await page.evaluate(() => robotApp._runner().tap('head'));
  await page.keyboard.press('Space');
  await page.waitForFunction(() => { const c = robotApp._view().state().cur; return c.HeadNod === 9 && c.HeadTilt === 1; }, null, { timeout: 10000 });
  ok(true, 'tapping the head and pressing space start their scripts');
  ok(await page.evaluate(() => { const r = robotApp._view().robot; return r.shell.color.getHexString() === 'ffd166'; }), 'the robot wears its own body colour');
  await page.click('#rbStop');
  ok(await page.evaluate(() => !robotApp._runner().running()), 'Stop stops the program');

  // ---- saving: name, colours and blocks travel in the payload
  const saved = await page.evaluate(() => JSON.stringify(buildPayload()));
  const p = JSON.parse(saved);
  ok(p.projectType === 'robot' && p.robot.name === 'Bolt' && p.robot.trim === '#e04f5f' && p.robot.blocks.blocks.blocks.length === 4, 'the project saves its name, colours and blocks');
  await page.evaluate(() => { startNewProject('ks2'); document.getElementById('tutorial').classList.add('hide'); });
  await page.evaluate(j => applyPayload(JSON.parse(j)), saved);
  await page.waitForFunction(() => robotApp._ws().getTopBlocks().length === 4 && document.getElementById('rbName').value === 'Bolt', null, { timeout: 15000 });
  ok(true, 'reopening the saved robot brings everything back');

  // ---- the old Ohbot has gone from the Stage
  await page.evaluate(() => { startNewStage('ks2'); document.getElementById('tutorial').classList.add('hide'); });
  ok(await page.evaluate(() => !pickableCostumes().includes('ohbot') && !JSON.stringify(stageToolbox()).includes('Ohbot') && !('ohbot' in STAGE_COSTUMES)), 'the Stage no longer has the Ohbot costume or blocks');
  ok(errors.length === 0, 'no errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
