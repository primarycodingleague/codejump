// Tablets: CodeJump's own screens (home, choosers, Platformer, Stage, Turtle) at iPad and Fire 8 sizes. The checks are in
// tablet-lib.mjs; each lab's screens are in tablet-labs-*.test.mjs.
import { sleep } from './lib.mjs';
import { runTablet } from './tablet-lib.mjs';

// the screens. open(page) gets there; reach = must be reachable; taps = must be ≥40px; panes = the portrait panes and, for
// each, a selector that should then fill most of the screen; fit = [canvas, its box] that must fit
const SCREENS = [
  { name: 'home', open: async () => {}, reach: ['#h-new'], taps: ['#h-new'] },
  { name: 'chooser', open: async page => { await page.evaluate(() => { document.getElementById('ks-modal').classList.remove('hide'); }); }, reach: ['#ks-modal h2', '#ks-modal [data-ks=ks2]', '#ks-cancel'] },
  { name: 'labs', open: async page => { await page.evaluate(() => { _pendingKs = 'ks2'; document.getElementById('pt-modal').classList.remove('hide'); }); }, reach: ['#pt-modal .ks-opt[data-pt="platformer"]', '#pt-cancel'] },
  { name: 'platformer', open: async page => { await page.evaluate(() => startNewProject('ks2')); await sleep(600); },
    reach: ['#btn-build', '#btn-play', '#btn-code'], taps: ['#toolbar .tbtn:not(.hide)', '#toolbar .mode-btn'], fit: ['#gc', '#cwrap'] },
  { name: 'stage', open: async page => { await page.evaluate(() => startNewStage('ks2')); await page.waitForFunction(() => document.querySelector('#blockly-div .blocklyWorkspace'), null, { timeout: 30000 }); await sleep(500); },
    reach: ['#st-run'], taps: ['#toolbar .tbtn:not(.hide)', '.blocklyTreeRow'], panes: { code: '#code-panel', run: '#stage-right' }, paneReach: { run: ['#st-run'] } },
  { name: 'stage-ks1', open: async page => { await page.evaluate(() => startNewStage('ks1')); await sleep(800); }, reach: ['#ks1-ui'] },
  { name: 'turtle', open: async page => { await page.evaluate(() => startNewTurtle('ks2')); await sleep(600); },
    reach: ['#tt-run', '#turtle-code'], taps: ['#turtle-bar button'], panes: { code: '#turtle-left', run: '#turtle-right' } }
];

await runTablet(SCREENS);
