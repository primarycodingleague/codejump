// 3D World engine, headless (Babylon NullEngine + Havok): blocks compile, the starter scene builds, the edit view
// stays still, and pressing Run brings physics, animations and controls to life.
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
WB.defineBlocks(Blockly, javascriptGenerator, Order);

// every block in the toolbox exists and loads
const missing = [];
for (const c of WB.toolbox().contents) for (const b of (c.contents || [])) if (b.type && !Blockly.Blocks[b.type]) missing.push(b.type);
ok(missing.length === 0, 'every toolbox block is defined' + (missing.length ? ': missing ' + missing : ''));
const tws = new Blockly.Workspace();
Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: WB.toolbox().contents.flatMap(c => (c.contents || []).filter(b => b.type).map(b => ({ type: b.type, fields: b.fields, inputs: b.inputs, extraState: b.extraState }))) } }, tws);
ok(tws.getAllBlocks(false).length > 60, 'all toolbox blocks load (' + tws.getAllBlocks(false).length + ')');

const ws = new Blockly.Workspace();
Blockly.serialization.workspaces.load(WB.starterProgram(), ws);
const code = WB.compile(Blockly, javascriptGenerator, ws);
ok(/await createCharacter\('player'/.test(code) && /__b: '/.test(code), 'starter program compiles (character + block ids)');

const havok = await B.HavokPhysics({ wasmBinary: readFileSync(W + 'vendor/HavokPhysics.wasm') });
const errs = [];
const w = createWorld(B, { havok, loadAsset: async p => readFileSync(W + 'assets/' + p), onError: m => errs.push(m) });
const T = async n => { for (let i = 0; i < n; i++) { w.tick(); await new Promise(r => setTimeout(r, 0)); } };

await w.run(code, { layout: true }); await T(60);
let o = w.objects();
const get = id => w.objects().find(x => x.id === id);
ok(o.length === 6 && w.editing() && !w.running(), 'edit view builds the 6 starter objects: ' + o.map(x => x.id));
ok(get('ball').y === 6, 'nothing falls in the edit view');
const mk = ws.getAllBlocks(false).find(b => b.type === 'w3_box');
ok(w.blockOf('wall') === mk.id, 'objects know their make block (scene ↔ blocks)');

await w.run(code); await T(150);
ok(w.running() && get('ball').y < 5, 'Run: the ball falls (y=' + get('ball').y.toFixed(2) + ')');
ok(Math.abs(get('player').y) < 0.05, 'the character stands on the ground');
const playing = () => w.scene.animationGroups.filter(g => g.isPlaying && /^player\./.test(g.name)).map(g => g.name);
ok(playing().includes('player.Idle'), 'the character idles');
const z0 = get('player').z;
w.key('up', true); await T(40); w.key('up', false);
ok(playing().includes('player.Walk') || get('player').z !== z0, 'arrow keys walk the player');
ok(errs.length === 0, 'no errors from the program' + (errs.length ? ': ' + errs.join(' | ') : ''));
done();
