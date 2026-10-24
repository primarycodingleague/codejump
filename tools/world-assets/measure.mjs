// height (Y extent) of GLB files with Babylon, as the 3D World sees them
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const ROOT = new URL('../../', import.meta.url).pathname, W = ROOT + 'world/';
const require = createRequire(ROOT + 'tests/x.js');
const B = await import(W + 'vendor/babylon-world.min.js');
const D = W + 'vendor/draco/';
const DM = new Function('require', '__dirname', '__filename', 'self', 'module', 'exports', 'define', readFileSync(D + 'draco_wasm_wrapper_gltf.js', 'utf8') + ';return DracoDecoderModule;')(require, D, 'x.js', {}, undefined, undefined, undefined);
B.DracoDecoder.DefaultConfiguration = { wasmUrl: 'x', wasmBinary: readFileSync(D + 'draco_decoder_gltf.wasm'), jsModule: DM, numWorkers: 0 };
const engine = new B.NullEngine(); const scene = new B.Scene(engine);
export async function size(file) {
  const c = await B.LoadAssetContainerAsync(new Uint8Array(readFileSync(file)), scene, { pluginExtension: '.glb' });
  const inst = c.instantiateModelsToScene(n => n, false); const h = new B.TransformNode('h', scene); inst.rootNodes.forEach(n => n.parent = h);
  h.computeWorldMatrix(true); const bb = h.getHierarchyBoundingVectors(true); const s = bb.max.subtract(bb.min);
  inst.dispose(); h.dispose(); c.dispose();
  return { w: s.x, h: s.y, d: s.z };
}
if (process.argv[1].endsWith("measure.mjs")) for (const f of process.argv.slice(2)) console.log(f.split('/').pop(), JSON.stringify(await size(f), (k, v) => typeof v === 'number' ? +v.toFixed(2) : v));
