// Tablets: the Print Lab at iPad and Fire 8 sizes (checks in tablet-lib.mjs). Landscape = shapes | tool row + build plate |
// the selected shape side by side, the panels scrolling inside; portrait = Design / Shapes / Settings, one at a time.
// Screens: an empty plate, an example open (with a shape picked, so the inspector and handles show), the Check & print pop-up.
import { sleep } from './lib.mjs';
import { runTablet } from './tablet-lib.mjs';

const open = async page => {
  await page.evaluate(() => startNewPrint3D('ks2'));
  await page.waitForFunction(() => typeof p3dApp !== 'undefined' && p3dApp && p3dApp._model && p3dApp._model() && document.querySelectorAll('.pl-tile img[src^="data:"]').length > 10, null, { timeout: 90000 });
  await sleep(300);
};
const example = async page => {
  await open(page);
  await page.evaluate(() => { window.cjConfirm = () => Promise.resolve(true); });
  if (await page.evaluate(() => document.body.classList.contains('pv-on'))) await page.evaluate(() => cjPane('shapes'));
  await page.click('.pl-tab[data-tab="examples"]'); await page.click('[data-ex="house"]');
  await page.waitForFunction(() => p3dApp._proj().title === 'Little house');
  await page.evaluate(() => { const o = p3dApp._proj().objs; p3dApp._select([o[o.length - 1].id]); }); await sleep(300);
};
const TAPS = ['.pl-tb', '.pl-tab', '.pl-views button', '#plPrintBtn', '.pl-seg button', '.pl-acts button', '#plDraw'];
const PANES = { design: '.pl-main', shapes: '.pl-shapes', settings: '.pl-insp' };

const SCREENS = [
  { name: 'print-empty', open,
    reach: ['#plPrintBtn', '#plUndo', '#plMeasure', '#plKeys', '#plSnap', '.pl-views [data-view="fit"]', '#plCanvas', '.pl-tile[data-kind="box"]', '.pl-tab[data-tab="examples"]', '#plTitle', '#plPlate'],
    taps: TAPS.concat(['.pl-tile']), fit: ['#plCanvas', '#plStage'], panes: PANES,
    paneReach: { design: ['#plPrintBtn', '#plUndo', '#plKeys', '.pl-views [data-view="fit"]'], shapes: ['.pl-tile[data-kind="box"]', '.pl-tab[data-tab="examples"]', '#plTitle'], settings: ['#plPlate'] } },
  { name: 'print-example', open: example,
    reach: ['#plPrintBtn', '#plGroup', '#plUngroup', '#plDrop', '.pl-views [data-view="home"]', '[data-ex="rocket"]', '#plInsp [data-hole="1"]', '#plInsp [data-f="w"]', '#plInsp [data-f="rz"]', '#plInsp [data-act="mz"]', '#plSize'],
    taps: TAPS.concat(['.pl-card2', '#plInsp .pl-nf input']), fit: ['#plCanvas', '#plStage'], panes: PANES,
    paneReach: { design: ['#plPrintBtn', '#plUngroup', '#plSize'], shapes: ['[data-ex="rocket"]'], settings: ['#plInsp [data-hole="1"]', '#plInsp [data-f="w"]', '#plInsp [data-f="rz"]', '#plInsp [data-act="mz"]'] } },
  { name: 'print-check', open: async page => { await example(page); if (await page.evaluate(() => document.body.classList.contains('pv-on'))) await page.evaluate(() => cjPane('design')); await sleep(200); await page.click('#plPrintBtn'); await page.waitForSelector('#plSTL'); await sleep(200); },
    reach: ['#plSTL', '#pl3MF', '#plMClose', '.pl-checks li'], taps: ['#plSTL', '#pl3MF', '#plMClose'] }
];

await runTablet(SCREENS);
