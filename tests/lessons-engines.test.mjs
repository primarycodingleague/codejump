// The two lessons that run on physics engines, checked headlessly with their real starters:
// Critter engineers — the wobbly starter is slow, and Opposite beat on both back feet makes it go much further.
// 3D obstacle course — reaching the gold finish block runs the "touches" event and shows "Finished!".
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, require, ok, done } from './lib.mjs';

const starter = id => JSON.parse(readFileSync(join(ROOT, 'lessons', 'starters', id + '.json'), 'utf8'));

// ---- Critter engineers
const Z = await import(join(ROOT, 'critter', 'critter-core.js'));
const mod = await import(join(ROOT, 'critter', 'vendor', 'rapier3d-compat-0.21.0.min.js'));
const R = mod.default || mod; await R.init();
const z = Z.normalise(starter('critter-engineers').critter);
const sprint = c => Z.runHeadless(R, Z.normalise(JSON.parse(JSON.stringify(c))), 'sprint').score;
const top = b => { let p = b; while (p.mount && p.mount.parent !== z.blocks[0].id) p = Z.block(z, p.mount.parent); return p; };
const feet = z.blocks.filter(b => b.path);
const back = feet.filter(f => top(f).mount.at[0] < 0);
const s0 = sprint(z);
const fixed = JSON.parse(JSON.stringify(z));
for (const f of back) { const x = fixed.blocks.find(b => b.id === f.id); x.path.phase = (x.path.phase + 0.5) % 1; }
const s1 = sprint(fixed);
ok(feet.length === 4 && back.length === 2, 'the Critter starter has four walking feet, two at the back');
ok(s0 < 1.6 && s1 > s0 * 2, `Critter engineers: Opposite beat on both back feet takes the Sprint from ${s0.toFixed(1)} m to ${s1.toFixed(1)} m`);

// ---- 3D obstacle course
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
const ws = new Blockly.Workspace();
Blockly.serialization.workspaces.load(starter('obstacle-course').world.blocks, ws);
const code = WB.compile(Blockly, javascriptGenerator, ws);
const havok = await B.HavokPhysics({ wasmBinary: readFileSync(W + 'vendor/HavokPhysics.wasm') });
const banners = [], errs = [];
const w = createWorld(B, { havok, loadAsset: async p => readFileSync(W + 'assets/' + p), onError: m => errs.push(m), onBanner: t => banners.push(t) });
const T = async n => { for (let i = 0; i < n; i++) { w.tick(); await new Promise(r => setTimeout(r, 0)); } };
await w.run(code); await T(60);
const ids = w.objects().map(o => o.id);
ok(['player', 'wall', 'finish'].every(i => ids.includes(i)), '3D obstacle course: the starter makes the player, a wall and the finish (' + ids + ')');
ok(!banners.some(b => /Finished/.test(b)), '…and nothing says Finished at the start');
// walk the player round the wall and onto the finish
await w.run(code + "\n__start(async () => { await wait(0.5); moveTo('player', 0, 0.2, 18); });"); await T(150);
ok(banners.some(b => /Finished/.test(b)), '3D obstacle course: reaching the finish shows “Finished!” (' + JSON.stringify(banners) + ')');
ok(errs.length === 0, 'no errors from the 3D program' + (errs.length ? ': ' + errs.join(' | ') : ''));
done();
