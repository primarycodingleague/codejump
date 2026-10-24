import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname } from 'node:path';
import { readGLB, writeGLB, addView } from './glb.mjs';
import { OBJ, KITS } from './objmap.mjs';
import { size } from './measure.mjs';
const A = new URL('../../world/assets/', import.meta.url).pathname, OUT = A + 'objects/', TH = A + 'thumbs/', TMP = new URL('./tmp.glb', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true }); mkdirSync(TH, { recursive: true });
const only = process.argv.slice(2);
const sizes = {};
for (const [id, label, kit, file, h0, tint] of OBJ) {
  if (only.length && !only.includes(id)) continue;
  const srcf = KITS[kit] + file + '.glb', g = readGLB(srcf);
  for (const im of g.json.images || []) if (im.uri) { const bytes = readFileSync(dirname(srcf) + '/' + decodeURIComponent(im.uri)); im.bufferView = addView(g, bytes); im.mimeType = 'image/png'; delete im.uri; }
  // scale to the wanted height with a new root node
  const tmp = TMP; writeFileSync(tmp, writeGLB(g));
  const want = h0 || 1;
  const now = await size(tmp), k = want / now.h;
  const sc = g.json.scenes[g.json.scene || 0];
  g.json.nodes.push({ name: id, scale: [k, k, k], children: sc.nodes }); sc.nodes = [g.json.nodes.length - 1];
  writeFileSync(OUT + id + '.glb', writeGLB(g));
  sizes[id] = await size(OUT + id + '.glb');
  // thumbnail from the kit's own picture
  const kd = KITS[kit].replace(/Models\/.*$/, '');
  const pic = [kd + 'Previews/' + file + '.png', kd + 'Isometric/' + file + '_SE.png', kd + 'Isometric/' + file + '_NE.png'].find(existsSync);
  const args = [pic, '-trim', '-resize', '72x72'];
  if (tint) args.push('-fill', tint, '-colorize', '55%');
  execFileSync('convert', [...args, TH + id + '.png']);
  console.log(id, file, 'h', want.toFixed(2), '->', JSON.stringify(sizes[id], (a, v) => typeof v === 'number' ? +v.toFixed(2) : v), Math.round(readFileSync(OUT + id + '.glb').length / 1024) + 'KB');
}
