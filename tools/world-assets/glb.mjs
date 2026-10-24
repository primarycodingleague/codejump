import { readFileSync } from 'node:fs';
export function readGLB(f) {
  const b = typeof f === 'string' ? readFileSync(f) : f; const jl = b.readUInt32LE(12);
  const json = JSON.parse(b.slice(20, 20 + jl).toString().replace(/\0+$/, ''));
  let bin = Buffer.alloc(0); const o = 20 + jl;
  if (o < b.length) { const bl = b.readUInt32LE(o); bin = Buffer.from(b.slice(o + 8, o + 8 + bl)); }
  return { json, bin };
}
export function writeGLB({ json, bin }) {
  let js = Buffer.from(JSON.stringify(json)); const jp = (4 - js.length % 4) % 4; js = Buffer.concat([js, Buffer.alloc(jp, 0x20)]);
  const bp = (4 - bin.length % 4) % 4; const bb = Buffer.concat([bin, Buffer.alloc(bp)]);
  const h = Buffer.alloc(12); h.writeUInt32LE(0x46546C67, 0); h.writeUInt32LE(2, 4); h.writeUInt32LE(12 + 8 + js.length + 8 + bb.length, 8);
  const jh = Buffer.alloc(8); jh.writeUInt32LE(js.length, 0); jh.writeUInt32LE(0x4E4F534A, 4);
  const bh = Buffer.alloc(8); bh.writeUInt32LE(bb.length, 0); bh.writeUInt32LE(0x004E4942, 4);
  return Buffer.concat([h, jh, js, bh, bb]);
}
const N = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
const T = { 5126: [4, 'readFloatLE'], 5123: [2, 'readUInt16LE'], 5121: [1, 'readUInt8'], 5125: [4, 'readUInt32LE'] };
export function acc(g, i) { // -> {get(k,c), set(k,c,v), count, n}
  const a = g.json.accessors[i], bv = g.json.bufferViews[a.bufferView], n = N[a.type], [sz, fn] = T[a.componentType];
  const st = bv.byteStride || n * sz, base = (bv.byteOffset || 0) + (a.byteOffset || 0);
  return { count: a.count, n, a, get: (k, c) => g.bin[fn](base + k * st + c * sz), set: (k, c, v) => g.bin.writeFloatLE(v, base + k * st + c * sz) };
}
// append bytes as a new bufferView, return its index
export function addView(g, bytes) {
  const pad = (4 - g.bin.length % 4) % 4; g.bin = Buffer.concat([g.bin, Buffer.alloc(pad)]);
  const off = g.bin.length; g.bin = Buffer.concat([g.bin, bytes]);
  g.json.bufferViews.push({ buffer: 0, byteOffset: off, byteLength: bytes.length });
  if (!g.json.buffers || !g.json.buffers.length) g.json.buffers = [{ byteLength: 0 }];
  g.json.buffers[0].byteLength = g.bin.length; delete g.json.buffers[0].uri;
  return g.json.bufferViews.length - 1;
}
