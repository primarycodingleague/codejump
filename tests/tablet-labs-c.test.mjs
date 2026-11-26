// Tablets: the Web Lab, App Lab and Brick Lab at iPad and Fire 8 sizes (checks in tablet-lib.mjs). Portrait panes:
// Web Lab Design = Page / Add / Settings, Code = Code / Pages, Preview = no switch; App Lab Design = Parts / Phone / Settings,
// Code = Code / Phone, running in Design = just the phone; Brick Lab = Code / Hub (with the pretend hub's tilt pad and slider).
import { sleep } from './lib.mjs';
import { runTablet } from './tablet-lib.mjs';

const web = async (page, tab) => {
  await page.evaluate(() => startNewWeb('ks2'));
  await page.waitForSelector('.wl-tpl button'); await page.click('.wl-tpl button'); await sleep(300);
  if (tab) { await page.click(`.wl-tab[data-tab="${tab}"]`); await sleep(400); }
};
const app = async (page, tab) => {
  await page.evaluate(() => startNewAppLab('ks2'));
  await page.waitForSelector('.al-starter'); await page.click('.al-starter'); await sleep(400);
  if (tab) { await page.click(`.al-tab[data-tab="${tab}"]`); await page.waitForFunction(() => document.querySelector('#alBlocks .blocklyWorkspace'), null, { timeout: 30000 }); await sleep(400); }
};
const WEB_TAPS = ['.wl-bar .wl-btn', '.wl-tab', '.wl-side-tab', '#wlDevice button'];
const APP_TAPS = ['.al-bar .al-btn', '.al-tab'];

const SCREENS = [
  { name: 'web-design', open: page => web(page),
    reach: ['.wl-tab[data-tab="code"]', '#wlCheck', '#wlDownload', '.wl-tile[data-add="heading"]', '#wlDevice', '#wlPgName'],
    taps: WEB_TAPS.concat(['.wl-tile']),
    panes: { page: '.wl-centre', add: '.wl-left', settings: '.wl-right' },
    paneReach: { page: ['#wlDevice'], add: ['.wl-tile[data-add="heading"]'], settings: ['#wlPgName'] } },
  { name: 'web-code', open: page => web(page, 'code'),
    reach: ['#wlHtml', '#wlCss', '.wl-page button.name'], taps: WEB_TAPS.concat(['.wl-page button.name']),
    panes: { code: '.wl-centre', pages: '.wl-left' }, paneReach: { code: ['#wlHtml', '#wlCss'], pages: ['.wl-page button.name'] } },
  { name: 'web-preview', open: page => web(page, 'preview'), reach: ['#wlFrameView', '.wl-tab[data-tab="design"]'], taps: WEB_TAPS,
    fit: ['#wlFrameView', '.wl-preview'] },
  { name: 'app-design', open: page => app(page),
    reach: ['#alRun', '.al-tab[data-tab="code"]', '#alPhone', '.al-tile[data-add="button"]', '#alPhoneFrame', '#alAddScreen'],
    taps: APP_TAPS.concat(['.al-tile', '.al-scr']),
    panes: { parts: '.al-left', phone: '.al-centre', settings: '.al-right' },
    paneReach: { parts: ['.al-tile[data-add="button"]', '#alAddScreen'], phone: ['#alPhoneFrame'], settings: ['.al-right .al-insp-h'] } },
  // the phone fits its space (in portrait: in the Phone pane, with a part chosen so its handles show)
  { name: 'app-phone', open: async page => { await app(page); await page.evaluate(() => appLabApp._add('button')); await sleep(200); await page.evaluate(() => { if (document.body.classList.contains('pv-on')) cjPane('phone'); }); await sleep(300); },
    reach: ['#alPhoneFrame', '#alHint'], fit: ['#alPhoneFrame', '.al-stage'] },
  { name: 'app-code', open: page => app(page, 'code'),
    reach: ['#alRun', '#alBlocks', '#alPhoneFrame'], taps: APP_TAPS.concat(['#alBlocks .blocklyTreeRow']),
    panes: { code: '#alBlocks', phone: '.al-right' }, paneReach: { code: ['#alBlocks .blocklyTreeRow'], phone: ['#alPhoneFrame'] } },
  { name: 'app-run', open: async page => { await app(page); await page.click('#alRun'); await sleep(400); },
    reach: ['#alRun', '#alPhoneFrame'], taps: APP_TAPS, fit: ['#alPhoneFrame', '.al-stage'] },
  { name: 'brick', open: async page => {
      await page.evaluate(() => startNewBrickLab('ks2'));
      await page.waitForSelector('#bkSim', { state: 'attached' }); await page.evaluate(() => document.querySelector('#bkSim').click()); await sleep(300);
      await page.evaluate(() => { const s = document.querySelector('.bk-pick[data-port="A"]'); s.value = 'distance'; s.dispatchEvent(new Event('change')); }); await sleep(300); // a distance sensor on A, the tilt sensor on B
    },
    reach: ['#bkRun', '#bkBlocks', '.bk-pad .t-forward', '.bk-pad .t-back', '[data-dist]'],
    taps: ['.bk-bar .bk-btn', '.bk-pad button', '#bkDisconnect', '.bk-pick', '#bkBlocks .blocklyTreeRow'],
    panes: { code: '#bkBlocks', hub: '#bkPanel' }, paneReach: { code: ['#bkBlocks .blocklyTreeRow'], hub: ['.bk-pad .t-forward', '.bk-pad .t-back', '[data-dist]', '#bkDisconnect'] } }
];

await runTablet(SCREENS);
