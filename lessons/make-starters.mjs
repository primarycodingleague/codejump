// Builds every lesson's starter project inside the real app and saves it as lessons/starters/<id>.json, plus a
// screenshot of it for the lesson card (lessons/pics/<id>.jpg). Run after changing a starter or the payload format:
//   cd tests && npm ci && cd .. && node lessons/make-starters.mjs        (or: node lessons/make-starters.mjs <id>)
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, serve, browser, openApp, sleep } from '../tests/lib.mjs';

const only = process.argv[2];
const OUT = join(ROOT, 'lessons');

// ---- Critter: a body with two pairs of walking legs, as they come: the front and back feet on each side step together,
// so it paces and rocks (about 1 m in the Sprint). Opposite beat on both back feet makes it trot (about 3 m).
const Z = await import(join(ROOT, 'critter', 'critter-core.js'));
function wobbly() {
  const z = Z.newCritter('Wobbly'), body = z.blocks[0].id;
  Z.attachLimb(z, 'leg2', body, '-y', [0.35, 0.3], { mirror: true });
  Z.attachLimb(z, 'leg2', body, '-y', [-0.35, 0.3], { mirror: true });
  return JSON.parse(JSON.stringify(z));
}

// ---- 3D World: a player, a wall to get round, and a gold finish line with a "touches" event
const WB = await import(join(ROOT, 'world', 'world-blocks.js'));
function course() {
  const { block: pb, chain } = WB._make;
  const run = pb('w3_when_run', null, null, { x: 20, y: 20 });
  run.inputs = { DO: { block: chain([
    pb('w3_sky', null, { COLOR: '#8fd0f7' }),
    pb('w3_character', { VAR: 'player', MODEL: { value: 'Block5' } }, { SCALE: 1, X: 0, Y: 0, Z: 0 }),
    pb('w3_physics', { VAR: 'player', KIND: { value: 'dynamic' } }),
    pb('w3_control', { VAR: 'player' }, { SPEED: 5 }),
    pb('w3_follow', { VAR: 'player' }),
    pb('w3_box', { VAR: 'wall' }, { COLOR: '#d1477a', W: 6, H: 2, D: 1, X: 0, Y: 0, Z: 7 }),
    pb('w3_physics', { VAR: 'wall', KIND: { value: 'static' } }),
    pb('w3_box', { VAR: 'finish' }, { COLOR: '#f2b61d', W: 6, H: 0.2, D: 2, X: 0, Y: 0, Z: 18 })
  ]) } };
  const win = { type: 'w3_when_touch', x: 470, y: 20, fields: { A: { id: 'v_player' }, B: { id: 'v_finish' } },
    inputs: { DO: { block: chain([pb('w3_say', { VAR: 'player' }, { TEXT: { text: 'You made it!' } }), pb('w3_show_text', null, { TEXT: { text: 'Finished!' } })]) } } };
  return { blocks: { languageVersion: 0, blocks: [run, win] }, variables: ['player', 'wall', 'finish'].map(n => ({ name: n, id: 'v_' + n })) };
}

const CATCHER_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="st_when_flag" x="20" y="20"><next><block type="st_goto_xy"><field name="X">0</field><field name="Y">-140</field></block></next></block>
<block type="st_when_key" x="20" y="130"><field name="KEY">left</field><next><block type="st_change_x"><field name="N">-15</field></block></next></block>
<block type="st_when_key" x="20" y="230"><field name="KEY">right</field><next><block type="st_change_x"><field name="N">15</field></block></next></block>
</xml>`;
const STAR_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="st_when_flag" x="20" y="20"><next><block type="st_goto_xy"><field name="X">0</field><field name="Y">170</field><next>
<block type="st_forever"><statement name="DO"><block type="st_change_y"><field name="N">-4</field><next>
<block type="st_if"><value name="COND"><block type="st_compare"><field name="OP">&lt;</field><value name="A"><block type="st_ypos"></block></value><value name="B"><shadow type="math_number"><field name="NUM">-170</field></shadow></value></block></value>
<statement name="DO"><block type="st_goto"><field name="WHERE">_random</field><next><block type="st_set_y"><field name="Y">170</field></block></next></block></statement></block>
</next></block></statement></block></next></block></next></block>
</xml>`;
const ROCK = '0000001110011100111000000';
const MICROBIT_XML = `<xml xmlns="https://developers.google.com/blockly/xml"><variables><variable id="v_hand">hand</variable></variables>
<block type="mb_on_start" x="20" y="20"><next><block type="mb_show_icon"><field name="ICON">happy</field></block></next></block>
<block type="mb_on_shake" x="20" y="130"><next><block type="variables_set"><field name="VAR" id="v_hand">hand</field>
<value name="VALUE"><block type="math_random_int"><value name="FROM"><shadow type="math_number"><field name="NUM">1</field></shadow></value><value name="TO"><shadow type="math_number"><field name="NUM">3</field></shadow></value></block></value>
<next><block type="st_if"><value name="COND"><block type="logic_compare"><field name="OP">EQ</field><value name="A"><block type="variables_get"><field name="VAR" id="v_hand">hand</field></block></value><value name="B"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block></value>
<statement name="DO"><block type="mb_show_leds"><field name="PATTERN">${ROCK}</field></block></statement></block></next></block></next></block>
</xml>`;

// ---- AI Lab: circle and triangle, three neat drawings each (too few, and no square yet — the lesson fixes that)
const AIM = await import(join(ROOT, 'ai', 'ai-model.js'));
const aiShapes = () => AIM.sampleLabels('shapes', 3, 7).filter(l => l.name !== 'square').map((l, i) => ({ ...l, color: AIM.COLOURS[i] }));

// ---- Train Lab: the starter oval + passing loop, a station and a depot sign, and a train that drives when Run is clicked
const TM = await import(join(ROOT, 'train', 'train-model.js'));
function trainLesson() {
  const p = TM.starterTrack();
  return { v: 2, pieces: p.pieces, trains: [{ name: 'Train 1', color: TM.TRAIN_COLOURS[0], start: { ...TM.STARTER_TRAIN } }], wagons: [],
    dests: [{ t: 'station', p: 10, side: -1 }, { t: 'depot', p: 19, side: 1 }], challenge: null,
    blocks: { blocks: { languageVersion: 0, blocks: [{ type: 'tr_when_run', x: 30, y: 30, next: { block: { type: 't1_startDriving', fields: { DIRECTION: '1' }, inputs: { SPEED: { shadow: { type: 'math_number', fields: { NUM: 45 } } } } } } }] } } };
}

// Each build runs inside the page and leaves the starter open; the payload is then taken with buildPayload().
const BUILD = {
  'cat-to-star': () => {
    startNewStage('ks1');
    const st = stageState, cat = st.sprites[0];
    Object.assign(cat, { name: 'Cat', x: 192, y: 352, ks1: [] }); cat.costumes = [{ name: 'costume1', builtin: 'cat', color: '#f59f18' }]; cat.costumeIdx = 0;
    const star = blankSprite('Star', 1); Object.assign(star, { x: 192 + 5 * KS1_STEP, y: 352, ks1: [] }); star.costumes = [{ name: 'costume1', builtin: 'star', color: '#ffd43b' }]; star.costumeIdx = 0;
    st.sprites.push(star); stageSel = 0;
  },
  'fix-the-dance': () => {
    startNewStage('ks1');
    const cat = stageState.sprites[0];
    Object.assign(cat, { name: 'Cat', x: 288, y: 352 }); cat.costumes = [{ name: 'costume1', builtin: 'cat', color: '#f59f18' }]; cat.costumeIdx = 0;
    cat.ks1 = [[{ t: 'flag' }, { t: 'right', n: 3 }, { t: 'turnR', n: 1 }, { t: 'left', n: 2 }, { t: 'say', text: 'Ta-da!' }]];
  },
  'level-for-a-friend': () => {
    startNewProject('ks1');
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) grid[r][c] = T.EMPTY;
    for (let c = 0; c < COLS; c++) if (c < 7 || c > 12) grid[ROWS - 1][c] = T.GRASS;
    grid[ROWS - 2][1] = T.START; grid[ROWS - 2][COLS - 2] = T.GOAL;
    commitLevel();
  },
  'turtle-shapes': () => {
    startNewTurtle('ks2');
    turtleCode = '; Draw a square — the long way!\nfd 100\nrt 90\nfd 100\nrt 90\nfd 100\nrt 90\nfd 100\nrt 90\n';
    document.getElementById('turtle-code').value = turtleCode;
  },
  'catch-the-stars': ({ CATCHER_XML, STAR_XML }) => {
    startNewStage('ks2');
    const c = blankSprite('Catcher', 0); Object.assign(c, { x: CW / 2, y: CH / 2 + 140, xml: CATCHER_XML }); c.costumes = [{ name: 'costume1', builtin: 'cat', color: '#f59f18' }];
    const s = blankSprite('Star', 1); Object.assign(s, { x: CW / 2, y: CH / 2 - 170, size: 70, xml: STAR_XML }); s.costumes = [{ name: 'costume1', builtin: 'star', color: '#ffd43b' }];
    stageState.sprites = [c, s]; stageSel = 1; stageLoadSpriteScripts(1); renderSpritePanel();
  },
  'microbit-rps': ({ MICROBIT_XML }) => {
    startNewStage('ks2');
    const m = blankSprite('micro:bit', 0); Object.assign(m, { x: CW / 2, y: CH / 2, xml: MICROBIT_XML }); m.costumes = [{ name: 'costume1', builtin: 'microbit', color: '#111111' }];
    stageState.sprites = [m]; stageState.vars = ['hand']; stageSel = 0; stageLoadSpriteScripts(0); renderSpritePanel();
  },
  'critter-engineers': async ({ critter }) => {
    startNewCritter('ks2');
    for (let i = 0; i < 200 && !critterApp; i++) await new Promise(r => setTimeout(r, 50));
    critterApp.setCritter(critter);
  },
  'teach-the-computer': async ({ aiLabels }) => {
    startNewAI('ks2');
    for (let i = 0; i < 400 && !(aiApp && aiApp._ws && aiApp._ws()); i++) await new Promise(r => setTimeout(r, 50));
    aiApp.setProject({ kind: 'draw', labels: aiLabels });
  },
  'smart-trains': async ({ train }) => {
    startNewTrain('ks2');
    for (let i = 0; i < 400 && !(trainApp && trainApp._ws && trainApp._ws()); i++) await new Promise(r => setTimeout(r, 50));
    trainApp.setProject(train);
  },
  'obstacle-course': async ({ world }) => {
    startNew3D('ks2');
    for (let i = 0; i < 400 && !(worldApp && worldApp._world && worldApp._world()); i++) await new Promise(r => setTimeout(r, 50));
    worldApp.setProject({ blocks: world });
  }
};
const ARGS = { CATCHER_XML, STAR_XML, MICROBIT_XML, critter: wobbly(), world: course(), aiLabels: aiShapes(), train: trainLesson() };

const site = await serve();
const b = await browser();
const errors = [];
for (const id of Object.keys(BUILD)) {
  if (only && id !== only) continue;
  const { ctx, page } = await openApp(b, site.url, { errors }); // a fresh page each time, so nothing carries over
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.evaluate(([src, args]) => (0, eval)('(' + src + ')')(args), [BUILD[id].toString(), ARGS]);
  if (id === 'obstacle-course') await page.waitForFunction(() => worldApp._world().editing() && worldApp._world().objects().some(o => o.id === 'finish'), null, { timeout: 60000 });
  await sleep(800);
  const payload = await page.evaluate(() => { const p = buildPayload(); delete p.lesson; return p; });
  writeFileSync(join(OUT, 'starters', id + '.json'), JSON.stringify(payload));
  // the card picture: the starter as a pupil first sees it, with its Lesson card
  await page.evaluate(id => { clearDirty(); return lessonOpenStarter(id); }, id);
  await page.waitForFunction(() => !document.getElementById('lesson-guide').classList.contains('hide'), null, { timeout: 30000 });
  if (id === 'turtle-shapes') await page.evaluate(() => { turtleSpeed = 10; turtleRun(); });
  if (id === 'obstacle-course') await page.waitForFunction(() => worldApp._world().editing() && worldApp._world().objects().some(o => o.id === 'finish'), null, { timeout: 60000 });
  await sleep(id === 'critter-engineers' || id === 'obstacle-course' ? 3500 : 1200);
  await page.screenshot({ path: join(OUT, 'pics', id + '.jpg'), type: 'jpeg', quality: 72 });
  console.log('made', id, JSON.stringify(payload).length + ' bytes');
  await ctx.close();
}
console.log(errors.length ? 'page errors: ' + errors.join(' | ') : 'no page errors');
await b.close(); site.close();
