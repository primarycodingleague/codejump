// Tablets: the Train Lab, AI Lab and Critter Lab at iPad and Fire 8 sizes (checks in tablet-lib.mjs). Portrait panes:
// Train = Code / Track; AI "Code it" = Code / Run (Teach and Train & test fit the screen as one pane); Critter Build =
// Critter / Parts / Settings (Test it! is one pane).
import { sleep } from './lib.mjs';
import { runTablet } from './tablet-lib.mjs';

const blockly = (page, sel) => page.waitForFunction(s => document.querySelector(s + ' .blocklyWorkspace'), sel, { timeout: 30000 });
const openAI = async (page, tab) => {
  await page.evaluate(() => startNewAI('ks2')); await page.waitForFunction(() => document.getElementById('alTabTeach'), null, { timeout: 30000 });
  if (tab) await page.evaluate(id => document.getElementById(id).click(), tab);
  await sleep(700);
};
const openCritter = async page => { await page.evaluate(() => startNewCritter('ks2')); await page.waitForFunction(() => document.querySelector('#zParts .zl-part'), null, { timeout: 30000 }); await sleep(800); };

const TRAIN_TRACK = ['#tlRun', '#tlStop', '#tlReset', '#tlChal', '#tlZoomIn', '#tlFit', '.tl-tool[data-tool="train"]', '#tlPlace', '#tlOrderClear', '#tlUndo', '#tlRedo', '#tlClear', '#tlName'];
const AI_RUN = ['#alRun', '#alStop', '#alPlayPad', '#alPlayClear', '#alDone'];
const CRITTER_PARTS = ['#zParts .zl-part', '#zLimbs .zl-part:last-child', '#zMirror'];

const SCREENS = [
  { name: 'train', open: async page => { await page.evaluate(() => startNewTrain('ks2')); await blockly(page, '#tlBlocks'); await sleep(600); },
    reach: ['#tlBlocks', ...TRAIN_TRACK], taps: ['.tl .tl-tab', '.tl .tl-run', '.tl .tl-stop', '.tl .tl-reset', '.tl .tl-small', '.tl .tl-tool', '.tl .tl-zoom button', '#tlPlace', '#train-ui .blocklyTreeRow'],
    panes: { code: '.tl .tl-left', track: '.tl .tl-view' }, paneReach: { code: ['#tlBlocks', '#tlRun2'], track: TRAIN_TRACK } },
  { name: 'train-board', open: async page => { await page.evaluate(() => startNewTrain('ks2')); await blockly(page, '#tlBlocks'); await page.evaluate(() => document.body.classList.contains('pv-on') && cjPane('track')); await sleep(600); },
    reach: TRAIN_TRACK, fit: ['#tlCanvas', '#tlStage'] },
  { name: 'ai-teach', open: page => openAI(page),
    reach: ['#alTabTeach', '#alTabTrain', '#alTabCode', '#alAddLabel', '#alSamples', '#alTeachPad', '#alTeachUndo', '#alTeachClear', '#alAddEx'],
    taps: ['.ailab .al-tab', '.ailab .al-btn', '.ailab .al-x', '.ailab .al-kind button'], fit: ['#alTeachPad', '.al-view[data-view="teach"] .al-pad-col'] },
  { name: 'ai-train', open: page => openAI(page, 'alTabTrain'), reach: ['#alTrain', '#alTestPad', '#alTestClear'], taps: ['.ailab .al-tab', '.ailab .al-btn'] },
  { name: 'ai-code', open: async page => { await openAI(page, 'alTabCode'); await blockly(page, '#alBlocks'); await sleep(500); },
    reach: ['#alTabTeach', '#alBlocks', ...AI_RUN], taps: ['.ailab .al-tab', '.ailab .al-run', '.ailab .al-btn', '#ai-ui .blocklyTreeRow'],
    panes: { code: '#alBlocks', run: '.al-code .al-pad-col' }, paneReach: { code: ['#alBlocks', '#alRun2'], run: AI_RUN } },
  { name: 'critter-build', open: openCritter,
    reach: ['.zl-mode[data-mode="test"]', '#zUndo', '#zStarters', '#zShowdown', '#buildCanvas', '#zInspector', ...CRITTER_PARTS],
    taps: ['.zk .zl-tool', '.zk .zl-icon', '.zk .zl-mode:not([hidden])', '.zk .zl-part', '.zk .zl-check'],
    panes: { critter: '#buildStage .zl-canvas-wrap', parts: '#buildStage .zl-palette', settings: '#zInspector' },
    paneReach: { critter: ['#buildCanvas'], parts: CRITTER_PARTS, settings: ['#zInspector'] }, fit: ['#buildCanvas', '#buildStage .zl-canvas-wrap'] },
  { name: 'critter-part', open: async page => { // a part chosen: its settings
      await openCritter(page);
      await page.evaluate(() => { const el = document.querySelector('#zParts .zl-part:nth-child(2)'); el.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 7, bubbles: true, clientX: 5, clientY: 5 })); window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, clientX: 5, clientY: 5 })); });
      await sleep(500); await page.evaluate(() => window.cjPane && document.body.classList.contains('pv-on') && cjPane('settings')); await sleep(300);
    },
    reach: ['#zInspector .zl-tabs button', '#zInspector .zl-danger'], taps: ['#zInspector .zl-tabs button', '#zInspector .zl-seg button', '#zInspector .zl-danger', '#zInspector .zl-swatches button'] },
  { name: 'critter-test', open: async page => { await openCritter(page); await page.evaluate(() => document.querySelector('.zl-mode[data-mode="test"]').click()); await sleep(800); },
    reach: ['#zGo', '#zContests .zl-contest', '#zContests .zl-contest:last-child', '#arenaCanvas'], taps: ['.zk .zl-contest', '#zGo', '.zk .zl-mode:not([hidden])'], fit: ['#arenaCanvas', '#testStage .zl-canvas-wrap'] }
];

await runTablet(SCREENS);
