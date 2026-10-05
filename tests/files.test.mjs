// The files themselves: the deployed copy matches the master, the address is right, every script parses.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { ROOT, ok, done } from './lib.mjs';

const master = readFileSync(join(ROOT, 'build-and-play.html'), 'utf8');
ok(master === readFileSync(join(ROOT, 'index.html'), 'utf8'), 'index.html is an exact copy of build-and-play.html');
ok(readFileSync(join(ROOT, 'CNAME'), 'utf8').trim() === 'codejump.co.uk', 'CNAME is codejump.co.uk');

const scripts = [...master.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)];
let bad = 0;
for (const [, attrs, code] of scripts) {
  if (/type="(?!text\/javascript|module)[^"]*"/.test(attrs)) continue; // JSON / templates
  try { new vm.Script(code); } catch (e) { bad++; console.log('  syntax error: ' + e.message); }
}
ok(scripts.length > 0 && bad === 0, `all ${scripts.length} inline scripts parse`);

const v = /const CJ_VERSION='(\d{4}\.\d{2}\.\d{2}(?:\.\d+)?)'/.exec(master);
ok(!!v, 'CJ_VERSION is set (' + (v && v[1]) + ')');
ok(/const CJ_WHATSNEW=\[\s*"/.test(master), "What's New has at least one line");
ok(/const CANONICAL_URL='https:\/\/codejump\.co\.uk\/'/.test(master), 'share links use https://codejump.co.uk/');
ok(!/['"`][^'"`\n]*codejump\.primarycodingleague\.co\.uk/.test(master), 'no link in the app still points at the old address');

// the lazy-loaded engines (ES modules) parse too
const mods = [];
for (const dir of ['critter', 'world', 'robot', 'lessons']) for (const f of readdirSync(join(ROOT, dir))) if (f.endsWith('.js')) mods.push(join(dir, f));
let badMods = 0;
for (const m of mods) {
  try { execFileSync(process.execPath, ['--check', '--input-type=module'], { input: readFileSync(join(ROOT, m)), stdio: ['pipe', 'pipe', 'pipe'] }); }
  catch (e) { badMods++; console.log('  ' + m + ': ' + String(e.stderr).split('\n').slice(0, 4).join(' ')); }
}
ok(badMods === 0, `all ${mods.length} engine modules parse (${mods.join(', ')})`);
done();
