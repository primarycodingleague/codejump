// Runs every *.test.mjs file in this folder, one after another, and fails if any check fails or a file crashes.
// Each test file prints "PASS …" / "FAIL …" lines (see lib.mjs). Usage: npm test  (or: node run.mjs world)
import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const only = process.argv[2];
const files = readdirSync(here).filter(f => f.endsWith('.test.mjs') && (!only || f.includes(only))).sort();
let pass = 0, fail = 0;
const broken = [];
for (const f of files) {
  console.log('\n=== ' + f);
  const t0 = Date.now();
  const code = await new Promise(res => {
    const p = spawn(process.execPath, [f], { cwd: here, stdio: ['ignore', 'pipe', 'inherit'] });
    let out = '';
    p.stdout.on('data', d => { out += d; process.stdout.write(d); });
    p.on('close', c => { pass += (out.match(/^PASS /gm) || []).length; const nf = (out.match(/^FAIL /gm) || []).length; fail += nf; if (nf) broken.push(f); res({ c, nf }); });
  });
  if (code.c !== 0 && !code.nf) { fail++; broken.push(f); console.log('FAIL ' + f + ' crashed (exit code ' + code.c + ')'); }
  console.log('--- ' + f + ' took ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
}
console.log(`\n${pass} passed, ${fail} failed` + (broken.length ? ' — in ' + broken.join(', ') : ''));
process.exit(fail ? 1 : 0);
