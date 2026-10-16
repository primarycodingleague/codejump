// Park Designers (3D World lesson unit): in the real runtime (headless Babylon + Havok), every lesson's answer ticks every
// goal and no starter does; the goals checker itself (uses / inside / if-else / stay / gone) works.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, require, ok, done } from './lib.mjs';

const Blockly = require('blockly');
const { javascriptGenerator, Order } = require('blockly/javascript');
const W = join(ROOT, 'world') + '/';
const B = await import(W + 'vendor/babylon-world.min.js');
const D = W + 'vendor/draco/';
const DracoDecoderModule = new Function('require', '__dirname', '__filename', 'self', 'module', 'exports', 'define',
  readFileSync(D + 'draco_wasm_wrapper_gltf.js', 'utf8') + ';return DracoDecoderModule;')(require, D, 'x.js', {}, undefined, undefined, undefined);
B.DracoDecoder.DefaultConfiguration = { wasmUrl: 'x', wasmBinary: readFileSync(D + 'draco_decoder_gltf.wasm'), jsModule: DracoDecoderModule, numWorkers: 0 };
const { createWorld } = await import(W + 'world-runtime.js');
const WB = await import(W + 'world-blocks.js');
const G = await import(W + 'world-goals.js');
const PK = await import(W + 'world-park.js');
WB.defineBlocks(Blockly, javascriptGenerator, Order);

const havok = await B.HavokPhysics({ wasmBinary: readFileSync(W + 'vendor/HavokPhysics.wasm') });
let errs = [];
const w = createWorld(B, { havok, loadAsset: async p => readFileSync(W + 'assets/' + p), onError: m => errs.push(m) });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const flush = () => new Promise(r => setImmediate(r)); // let waiting programs carry on, as a browser does between frames

// ── the unit ──
ok(PK.PARK.length === 24 && PK.PARK_BLOCKS.length === 4 && [1, 2, 3, 4].every(b => PK.PARK.filter(l => l.block === b).length === 6),
  'Park Designers: 24 lessons in 4 blocks of 6');
ok(new Set(PK.PARK.map(l => l.id)).size === 24 && PK.PARK.every(l => /^park-\d+-[a-z]+$/.test(l.id)), 'ids are unique');
ok(PK.PARK.every(l => G.cleanGoals(PK.parkGoals(l.id)) && G.cleanGoals(PK.parkGoals(l.id)).list.length === PK.parkGoals(l.id).list.length),
  'every lesson’s goals survive cleanGoals unchanged in number');

// ── the checker on its own ──
{
  const info = G.programInfo(PK.parkAnswer('park-15-weather'));
  ok(info.counts.controls_if_else === 1 && info.inside['w3_random<controls_if'] === 1 && info.inside['w3_sky<controls_if'] === 2, 'programInfo: if-else, nested counts');
  ok(G.cleanGoals({ list: [{ type: 'nope' }, { type: 'uses', blocks: ['x y'] }] }) === null, 'cleanGoals drops bad goals');
}

// one run: load the program, press Run, play the script, check the goals each frame
async function play(state, goals, script) {
  const ws = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(state, ws);
  const code = WB.compile(Blockly, javascriptGenerator, ws);
  ws.dispose();
  const g = G.createGoals(goals);
  g.program(state);
  errs = [];
  // models load from disk while the layout builds, like the edit view does before Run
  await w.run(code, { layout: true });
  await w.run(code);
  g.reset();
  const tick = async n => { for (let i = 0; i < n; i++) { w.tick(); g.check(w); await flush(); } };
  await tick(2);
  for (const [what, a, b] of script) {
    if (what === 'wait') await tick(Math.round(a * 60));
    else if (what === 'click') { w.click(a); await tick(1); }
    else if (what === 'key') { w.key(a, true); await tick(Math.max(1, Math.round(b * 60))); w.key(a, false); await tick(1); }
  }
  // animations run on the real clock: give one-off clips a moment
  await sleep(50); await tick(2);
  const ticks = g.check(w);
  if (process.env.DBG) console.log('DBG', JSON.stringify(w.objects().map(o => [o.id, o.spun])), w.playTime());
  w.stop();
  return { ticks, list: g.goals.list, errors: errs.slice(), vars: null };
}

for (const l of PK.PARK.filter(l => !process.env.ONLY || l.id === process.env.ONLY)) {
  const goals = PK.parkGoals(l.id), script = PK.PARK_PLAY[l.id];
  const ans = await play(PK.parkAnswer(l.id), goals, script);
  const missing = ans.list.filter((x, i) => !ans.ticks[i]).map(x => x.text);
  ok(missing.length === 0 && ans.errors.length === 0, l.id + ': the answer ticks every goal' + (missing.length ? ' — not: ' + missing.join(' | ') : '') + (ans.errors.length ? ' — errors: ' + ans.errors.join(' | ') : ''));
  const st = await play(PK.parkProject(l.id).blocks, goals, script);
  const n = st.ticks.filter(Boolean).length;
  ok(n < st.list.length && st.errors.length === 0, l.id + ': the starter doesn’t (' + n + '/' + st.list.length + ')' + (st.errors.length ? ' — errors: ' + st.errors.join(' | ') : ''));
}

// "stay" unticks when it leaves; "gone" needs the thing to have been there
{
  const prog = PK.parkAnswer('park-21-coins');
  const g = G.createGoals({ list: [{ type: 'gone', id: 'coin', text: 'gone' }] });
  const ws = new Blockly.Workspace(); Blockly.serialization.workspaces.load(prog, ws);
  const code = WB.compile(Blockly, javascriptGenerator, ws); ws.dispose();
  await w.run(code, { layout: true }); await w.run(code); g.reset();
  for (let i = 0; i < 30; i++) { w.tick(); g.check(w); await sleep(0); }
  ok(!g.ticks()[0], '"gone" doesn’t tick while the coin is still there');
  w.stop();
}
w.dispose();
done();
