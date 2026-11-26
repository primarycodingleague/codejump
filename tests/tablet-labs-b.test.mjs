// Tablets: the Robot Lab, 3D World and Build Lab at iPad and Fire 8 sizes (checks in tablet-lib.mjs). Portrait tablets show
// one pane at a time: Code / Robot, Code / World and Code / World (the Build Lab's World Maker without code has no switch).
import { sleep } from './lib.mjs';
import { runTablet } from './tablet-lib.mjs';

// in portrait the Code pane shows first; show the lab's world so its canvas can be measured (the pane checks visit both)
const showRun = (page, id) => page.evaluate(id => { if (document.body.classList.contains('pv-on')) cjPane(id); }, id).then(() => sleep(300));

const SCREENS = [
  { name: 'robot', open: async page => { await page.evaluate(() => startNewRobot('ks2')); await page.waitForFunction(() => robotApp && robotApp._view && robotApp._view(), null, { timeout: 60000 }); await sleep(600); await showRun(page, 'robot'); },
    reach: ['#rbRun', '#rbStop', '#rbReset', '#rbName', '#rbTrim', '#rbBlocks'], taps: ['.rb-bar button', '.rb-settings input', '.rb .blocklyTreeRow'],
    panes: { code: '#rbBlocks', robot: '.rb-view' }, paneReach: { code: ['#rbBlocks'], robot: ['#rbRun', '#rbStop', '#rbReset', '#rbName', '#rbTrim'] }, fit: ['#rbCanvas', '#rbStage'] },
  { name: 'world', open: async page => { await page.evaluate(() => startNew3D('ks2')); await page.waitForFunction(() => worldApp && worldApp._world && worldApp._world() && worldApp._world().objects().length >= 6, null, { timeout: 120000 }); await sleep(600); await showRun(page, 'world'); },
    reach: ['#w3Run', '#w3Stop', '#w3Tools', '#w3Blocks'], taps: ['.w3-bar button', '.w3 .blocklyTreeRow'],
    panes: { code: '#w3Blocks', world: '.w3-view' }, paneReach: { code: ['#w3Blocks'], world: ['#w3Run', '#w3Stop', '#w3Tools'] }, fit: ['#w3Canvas', '#w3Wrap'] },
  { name: 'craft', open: async page => { await page.evaluate(() => startNewCraft('ks2')); await page.waitForFunction(() => craftApp && craftApp._view && craftApp._view(), null, { timeout: 60000 }); await sleep(600); await showRun(page, 'world'); },
    reach: ['#crRun', '#crStop', '#crUndo', '#crNew', '#crChat', '#crHot .cr-more', '#crFly', '#crBlocks'],
    taps: ['.cr-bar button', '.cr-cam', '.cr-mkbtns button', '.cr-slot', '#crPad button', '#crPad2 button', '#crChatForm button', '.cr .blocklyTreeRow'],
    panes: { code: '.cr-code', world: '#crView' }, paneReach: { code: ['#crRun', '#crStop', '#crUndo', '#crNew', '#crBlocks'], world: ['#crChat', '#crHot .cr-more', '#crFly', '#crPad button'] }, fit: ['#crCanvas', '#crView'] }
];

await runTablet(SCREENS);
