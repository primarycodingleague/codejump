// When a lab can't open, CodeJump says why. A school filter that blocks unpkg.com gets our own copy of Blockly
// (vendor/blockly/) so the labs still open; a browser with no 3D, or a filter blocking the lab's own files, gets a
// message that says so (not "needs the internet"); a lab that fails while starting offers Try again, and one whose files
// didn't download offers Refresh (browsers remember a failed module until the page reloads).
import { serve, browser, ok, done } from './lib.mjs';

const site = await serve();
const b = await browser();
// a fresh page where everything off the test server is blocked — including unpkg.com, like some school filters
async function open({ init, block } = {}) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  if (block) await page.route(block, r => r.abort());
  await page.addInitScript(() => { localStorage.setItem('bap_seen_version', 'x'); setInterval(() => { for (const id of ['whatsnew', 'promo-modal']) { const w = document.getElementById(id); if (w) w.classList.add('hide'); } }, 50); });
  if (init) await page.addInitScript(init);
  await page.goto(site.url + '/build-and-play.html');
  await page.waitForFunction(() => typeof startNewRobot === 'function');
  await page.evaluate(() => document.getElementById('splash')?.remove());
  return { ctx, page, errors };
}
try {
  // 1. unpkg.com blocked: Blockly comes from vendor/blockly/ and the Robot Lab opens with its blocks
  {
    const { ctx, page } = await open();
    const st = await page.evaluate(() => ({ fb: !!window.CJ_BLOCKLY_FALLBACK, bl: typeof Blockly !== 'undefined' && !!Blockly.Blocks.controls_if, msg: !!(Blockly.Msg && Blockly.Msg.CONTROLS_IF_MSG_IF), media: window.CJ_BLOCKLY_MEDIA }));
    ok(st.fb && st.bl && st.msg && /\/vendor\/blockly\/media\/$/.test(st.media), 'unpkg.com blocked: Blockly comes from our own copy ' + JSON.stringify(st));
    await page.evaluate(() => startNewRobot('ks2'));
    const opened = await page.waitForFunction(() => robotApp && robotApp._ws() && robotApp._ws().getTopBlocks().length > 0, null, { timeout: 30000 }).then(() => true, () => false);
    ok(opened, 'unpkg.com blocked: the Robot Lab still opens with its blocks');
    await ctx.close();
  }
  // 2. no WebGL: the Robot Lab says this browser can't show 3D
  {
    const { ctx, page } = await open({ init: () => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, o) { return /webgl/i.test(t) ? null : g.call(this, t, o); }; } });
    await page.evaluate(() => startNewRobot('ks2'));
    await page.waitForSelector('#robot-ui .lab-fail', { timeout: 30000 });
    const t = await page.textContent('#robot-ui .lab-fail');
    ok(/can’t show 3D/.test(t) && !/needs the internet/.test(t), 'no WebGL: the message says the browser can’t show 3D: ' + t.slice(0, 90));
    await page.click('#robot-ui .lab-retry');
    await page.waitForSelector('#robot-ui .lab-fail', { timeout: 30000 });
    ok(await page.evaluate(() => robotApp === null && /can’t show 3D/.test(document.getElementById('robot-ui').textContent)), 'Try again starts the lab again (and says the same while there is still no 3D)');
    await ctx.close();
  }
  // 3. the lab's files blocked by a filter: says so; Try again opens it once they come through
  {
    let blocked = true;
    const { ctx, page } = await open();
    await page.route(/\/robot\/robot-app\.js/, r => (blocked ? r.abort() : r.continue()));
    await page.evaluate(() => startNewRobot('ks2'));
    await page.waitForSelector('#robot-ui .lab-fail', { timeout: 30000 });
    const t = await page.textContent('#robot-ui .lab-fail');
    ok(/couldn’t download/.test(t) && /codejump\.co\.uk\/robot\//.test(t), 'blocked files: the message names what to unblock: ' + t.slice(0, 90));
    ok((await page.textContent('#robot-ui .lab-retry')) === 'Refresh the page', 'a file that didn’t download: the button refreshes the page');
    blocked = false;
    await Promise.all([page.waitForNavigation(), page.click('#robot-ui .lab-retry')]);
    await page.waitForFunction(() => typeof startNewRobot === 'function');
    await page.evaluate(() => startNewRobot('ks2'));
    const opened = await page.waitForFunction(() => robotApp && robotApp._ws(), null, { timeout: 30000 }).then(() => true, () => false);
    ok(opened, 'after the refresh the Robot Lab opens once the files come through');
    await ctx.close();
  }
} finally { await b.close(); site.close(); }
done();
