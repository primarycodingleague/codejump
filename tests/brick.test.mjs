// Brick Lab: the WeDo 2.0 driver's bytes, the write queue and the block runner in Node (with the pretend hub), then the lab in a
// browser against a FAKE Web Bluetooth hub (it records every write and can send notifications, battery and a disconnect):
// connect, ports, live readings, Run, tilt and distance scripts, Stop, disconnect → Reconnect without reloading, the message
// for browsers without Bluetooth, Try without a hub, save/reopen. A real hub is checked by hand (see CLAUDE.md, Brick Lab).
import { join } from 'node:path';
import { serve, browser, openApp, ok, done, sleep, ROOT } from './lib.mjs';

const W = await import(join(ROOT, 'brick', 'drivers', 'wedo2.js'));
const D = await import(join(ROOT, 'brick', 'drivers', 'hub-driver.js'));
const { SimHub } = await import(join(ROOT, 'brick', 'drivers', 'sim.js'));
const RUN = await import(join(ROOT, 'brick', 'brick-run.js'));
const same = (a, b) => JSON.stringify(Array.from(a)) === JSON.stringify(b);

// ── bytes ──
ok(W.UUID.DEVICE === '00001523-1212-efde-1523-785feabcd123' && W.UUID.IO === '00004f0e-1212-efde-1523-785feabcd123' && W.UUID.OUTPUT_COMMAND === '00001565-1212-efde-1523-785feabcd123', 'WeDo 2.0 service UUIDs');
ok(same(W.bytes.tiltSetup(1), [1, 2, 1, 34, 0, 1, 0, 0, 0, 0, 1]) && same(W.bytes.distanceSetup(2), [1, 2, 2, 35, 0, 1, 0, 0, 0, 1, 1]) && same(W.bytes.lightSetup(), [1, 2, 6, 23, 1, 0, 0, 0, 0, 0, 0]), 'sensor and light set-up commands');
ok(same(W.bytes.motorPower(1, 100), [1, 1, 1, 100]) && same(W.bytes.motorPower(2, -100), [2, 1, 1, 156]) && same(W.bytes.motorPower(1, 50), [1, 1, 1, 65]) && same(W.bytes.motorPower(1, 0), [1, 1, 1, 0]) && same(W.bytes.brake(1), [1, 1, 1, 127]),
  'motor power: 1–100 is spread over 30–100, negative is the other way (two’s complement), 0 is off, 127 brakes');
ok(same(W.bytes.rgb(255, 128, 0), [6, 4, 3, 255, 128, 0]) && W.signed(226) === -30 && W.signed(30) === 30, 'hub light colour and signed tilt angles');
ok(!D.bluetoothSupport({}).ok && D.bluetoothSupport({ bluetooth: { requestDevice() {} } }, { isSecureContext: true }).ok && !D.bluetoothSupport({ bluetooth: { requestDevice() {} } }, { isSecureContext: false }).ok, 'Web Bluetooth is detected (and needs https)');
// the write queue: one at a time, at most 20 a second, newest command for the same thing wins, stop jumps the queue
{
  const sent = []; let t = 0; const q = new D.WriteQueue(async b => { sent.push(b); }, { rate: 20, now: () => t, sleep: async ms => { t += ms; } });
  q.busy = true; for (let i = 1; i <= 50; i++) q.push('motor-A', i); q.push('light', 'red'); q.push('motor-B', 'stopB', true); q.busy = false; await q.run();
  ok(sent.length === 3 && sent[0] === 'stopB' && sent[1] === 50 && sent[2] === 'red' && t >= 100, '50 quick motor changes become one write, stop goes first, writes are spaced: ' + JSON.stringify(sent));
}
// the runner with the pretend hub
{
  const h = new SimHub({ A: 'motor', B: 'distance' }); await h.connect();
  const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
  const r = RUN.createRunner(h);
  r.start({ blocks: { blocks: [
    { type: 'br_when_run', next: { block: { type: 'br_motor_power', fields: { MOTOR: 'all' }, inputs: { POWER: N(40) }, next: { block: { type: 'br_motor_dir', fields: { MOTOR: 'all', DIR: 'that' }, next: { block: { type: 'br_motor_on', fields: { MOTOR: 'A' },
      next: { block: { type: 'br_wait_until', inputs: { COND: { block: { type: 'logic_compare', fields: { OP: 'LT' }, inputs: { A: { block: { type: 'br_distance' } }, B: N(30) } } } }, next: { block: { type: 'br_motor_off', fields: { MOTOR: 'all' } } } } } } } } } } } },
    { type: 'br_when_distance', id: 'near', fields: { N: 60 }, next: { block: { type: 'br_light', fields: { COL: '#00ff00' } } } }] } });
  await sleep(80);
  const running = h.motors.A;
  h.setDistance(50); await sleep(120); const light = h.colour.join();
  h.setDistance(20); await sleep(150);
  ok(running === -40 && light === '0,255,0' && h.motors.A === 0, JSON.stringify([running, light, h.motors.A]) + ' power, direction, wait until distance < 30, and “when distance < 60” firing as a hand comes close');
  r.stop();
  ok(RUN.isTilted({ x: -30, y: 0 }, 'left') && RUN.isTilted({ x: 0, y: -20 }, 'forward') && !RUN.isTilted({ x: 10, y: 5 }, 'any') && RUN.tiltAngle({ x: 0, y: 25 }, 'back') === 25, 'tilt directions and angles (15° counts as tilted)');
}

// ── the lab, with a fake Web Bluetooth hub ──
function fakeBluetooth() {
  const U = n => '0000' + n + '-1212-efde-1523-785feabcd123', listeners = {}, F = window.__fake = { writes: [], requests: [], connects: 0, server: null };
  const ch = uuid => ({ uuid, async writeValueWithResponse(d) { F.writes.push([uuid.slice(4, 8), Array.from(d)]); }, async startNotifications() { (F.started = F.started || []).push(uuid.slice(4, 8)); return this; },
    addEventListener(t, fn) { (listeners[uuid] = listeners[uuid] || []).push(fn); }, async readValue() { return new DataView(new Uint8Array([77]).buffer); } });
  const chars = { [U('1527')]: ch(U('1527')), [U('1528')]: ch(U('1528')), [U('1560')]: ch(U('1560')), [U('1563')]: ch(U('1563')), [U('1565')]: ch(U('1565')), battery_level: ch('0000180f-batt') };
  let gone = [];
  const device = { name: 'WeDo Hub 1', gatt: { connected: false, async connect() { F.connects++; this.connected = true; return server; }, disconnect() { this.connected = false; gone.forEach(f => f()); } },
    addEventListener(t, fn) { if (t === 'gattserverdisconnected') gone.push(fn); } };
  const svc = list => ({ async getCharacteristic(u) { if (!list.includes(u)) throw new Error('NotFoundError'); return chars[u]; } });
  const server = { async getPrimaryService(u) { if (u === U('1523')) return svc([U('1527'), U('1528')]); if (u === U('4f0e')) return svc([U('1560'), U('1563'), U('1565')]); if (u === 'battery_service') return svc(['battery_level']); throw new Error('NotFoundError'); } };
  F.notify = (n, bytes) => { const u = n === 'batt' ? 'battery_level' : U(n); for (const fn of listeners[u] || []) fn({ target: { value: new DataView(new Uint8Array(bytes).buffer) } }); };
  F.drop = () => { device.gatt.connected = false; for (const k of Object.keys(listeners)) listeners[k] = []; gone.forEach(f => f()); };
  Object.defineProperty(navigator, 'bluetooth', { configurable: true, get: () => ({ async requestDevice(o) { F.requests.push(o); return device; } }) });
}
const site = await serve(), b = await browser(), errors = [];
const { page } = await openApp(b, site.url, { errors, init: fakeBluetooth });
await page.setViewportSize({ width: 1366, height: 860 });
const F = () => page.evaluate(() => window.__fake);
const out = async () => (await F()).writes.filter(w => w[0] === '1565').map(w => w[1].join(','));

await page.evaluate(() => document.getElementById('pt-modal').classList.add('hide'));
await page.click('#h-new'); await page.click('#ks-modal [data-ks=ks1]');
ok(!(await page.isVisible('#pt-modal .ks-opt[data-pt="bricklab"]')), 'the Brick Lab isn’t offered for Key Stage 1');
await page.evaluate(() => document.getElementById('pt-modal').classList.add('hide'));
await page.click('#h-new'); await page.click('#ks-modal [data-ks=ks2]'); await page.click('#pt-modal .ks-opt[data-pt="bricklab"]');
await page.waitForSelector('#bkConnect', { timeout: 30000 });
ok(await page.evaluate(() => projectType === 'bricklab' && document.body.classList.contains('bricklab-mode') && brickLabApp._ws().getAllBlocks(false).length > 3), 'Start building → Brick Lab opens with blocks on the left and the hub panel on the right');
ok(/Connect WeDo 2.0/.test(await page.textContent('#bkConnect')) && /Works with LEGO® Education WeDo 2.0/.test(await page.textContent('#bkPanel')), 'the panel offers Connect WeDo 2.0 and says what it works with');
await page.click('#bkConnect'); await page.waitForFunction(() => /Connected/.test(document.querySelector('.bk-state').textContent), null, { timeout: 10000 });
let f = await F();
ok(f.requests.length === 1 && JSON.stringify(f.requests[0].filters) === JSON.stringify([{ services: ['00001523-1212-efde-1523-785feabcd123'] }]), 'Connect opens the device picker filtered to WeDo 2.0 hubs');
ok(/WeDo Hub 1/.test(await page.textContent('#bkPanel')) && /Battery 77%/.test(await page.textContent('#bkPanel')), 'the panel shows the hub’s name and battery');
await sleep(300); f = await F();
ok(f.writes.some(w => w[0] === '1563' && w[1].join() === '1,2,6,23,1,0,0,0,0,0,0') && f.started.includes('1527'), 'connecting sets the light to colour mode and listens for what is plugged in');
// plug in a motor on A and a tilt sensor on B
await page.evaluate(() => { __fake.notify('1527', [1, 1, 0, 1]); __fake.notify('1527', [2, 1, 0, 34]); }); await sleep(300); f = await F();
ok(/Motor/.test(await page.$$eval('.bk-port', e => e[0].textContent)) && /Tilt sensor/.test(await page.textContent('#bkPanel')) && f.writes.some(w => w[0] === '1563' && w[1].join() === '1,2,2,34,0,1,0,0,0,0,1') && f.started.includes('1560'), 'plugging in a motor and a tilt sensor shows them, and the tilt sensor is switched on');
await page.evaluate(() => __fake.notify('1560', [0, 2, 226, 0])); await sleep(100);
ok(/Tilted left/.test(await page.textContent('#bkPanel')), 'live tilt readings: “Tilted left”');
await page.evaluate(() => __fake.notify('1560', [0, 2, 0, 0])); await sleep(100);
// Run the starter program: green light, motor on for 2 seconds; tilting runs the second script
await page.click('#bkRun'); await sleep(400);
let o = await out();
ok(o.includes('6,4,3,0,204,68') && o.includes('1,1,1,100'), 'Run: the light turns green and motor A turns on: ' + o.slice(-3).join(' | '));
await page.evaluate(() => __fake.notify('1560', [0, 2, 0, 226])); await sleep(400); o = await out();
ok(o.includes('6,4,3,255,0,0') && o.includes('1,1,1,156'), '“when tilted” runs: red light and the motor reverses');
await sleep(2000); o = await out();
ok(o[o.length - 1] === '1,1,1,0', 'the motor turns off after 2 seconds');
await page.click('#bkRun'); await sleep(100);
// a distance sensor instead of the tilt sensor
await page.evaluate(() => { __fake.notify('1527', [2, 0]); __fake.notify('1527', [2, 1, 0, 35]); }); await sleep(300); f = await F();
ok(f.writes.some(w => w[0] === '1563' && w[1].join() === '1,2,2,35,0,1,0,0,0,1,1') && /Distance sensor/.test(await page.textContent('#bkPanel')), 'swapping in a distance sensor switches it on');
await page.evaluate(() => { const ws = brickLabApp._ws(); ws.clear(); Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [{ type: 'br_when_distance', x: 20, y: 20, fields: { N: 30 }, next: { block: { type: 'br_motor_on', fields: { MOTOR: 'all' } } } }] } }, ws); });
await page.evaluate(() => __fake.notify('1560', [0, 2, 80])); await sleep(100);
await page.click('#bkRun'); await sleep(200); const before = (await out()).length;
await page.evaluate(() => __fake.notify('1560', [0, 2, 12])); await sleep(300); o = await out();
ok(/^12$/.test((await page.textContent('.bk-read b')).trim()) && o.length > before && o[o.length - 1] === '1,1,1,100', '“when distance < 30” turns the motor on when a hand comes close');
// flood: a forever loop changing the power can't flood the hub
await page.click('#bkRun'); await sleep(150); // stop the distance program first
await page.evaluate(() => { const ws = brickLabApp._ws(); ws.clear(); Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [{ type: 'br_when_run', x: 20, y: 20, next: { block: { type: 'br_motor_on', fields: { MOTOR: 'all' }, next: { block: { type: 'br_forever', inputs: { DO: { block: { type: 'br_motor_power', fields: { MOTOR: 'all' }, inputs: { POWER: { block: { type: 'math_random_int', inputs: { FROM: { shadow: { type: 'math_number', fields: { NUM: 1 } } }, TO: { shadow: { type: 'math_number', fields: { NUM: 100 } } } } } } } } } } } } } } }] } }, ws); });
await page.click('#bkRun'); await sleep(100); const n0 = (await out()).length; await sleep(1000); const n1 = (await out()).length;
ok(n1 - n0 <= 22 && n1 - n0 >= 5, 'a forever loop changing the motor sends at most about 20 writes a second: ' + (n1 - n0));
await page.click('#bkRun'); await sleep(200); o = await out();
ok(o[o.length - 1] === '1,1,1,0', 'Stop turns the motor off');
// the hub switches off: Reconnect, no reload
await page.click('#bkRun'); await sleep(100);
await page.evaluate(() => __fake.drop()); await sleep(200);
ok(/Reconnect/.test(await page.textContent('#bkPanel')) && /disconnected/.test(await page.textContent('#bkPanel')) && !(await page.evaluate(() => brickLabApp._runner().running())), 'when the hub switches off the program stops and Reconnect appears');
await page.click('#bkReconnect'); await page.waitForFunction(() => /Connected/.test(document.querySelector('.bk-state').textContent), null, { timeout: 10000 }); f = await F();
ok(f.connects === 2 && f.requests.length === 1, 'Reconnect connects to the same hub again without the picker or a reload');
// save and reopen
await page.evaluate(() => { document.getElementById('bkTitle').value = 'Crane'; document.getElementById('bkTitle').dispatchEvent(new Event('input')); });
const pl = await page.evaluate(() => buildPayload());
await page.evaluate(d => applyPayload(d), JSON.parse(JSON.stringify(pl))); await sleep(800);
ok(pl.projectType === 'bricklab' && await page.evaluate(() => brickLabApp.getProject().title === 'Crane' && brickLabApp._ws().getAllBlocks(false).some(b => b.type === 'br_forever')), 'a saved Brick Lab project reopens with its name and blocks');
await page.evaluate(() => startNewWeb('ks2')); await sleep(400);
ok(await page.evaluate(() => !document.body.classList.contains('bricklab-mode') && document.body.classList.contains('web-mode')), 'opening another lab leaves the Brick Lab');

// a browser with no Web Bluetooth (iPad, Firefox): a friendly message, and the pretend hub still works
{
  const { page: p2 } = await openApp(b, site.url, { errors, init: () => { Object.defineProperty(Navigator.prototype, 'bluetooth', { configurable: true, get: () => undefined }); } });
  await p2.evaluate(() => { document.getElementById('pt-modal').classList.add('hide'); startNewBrickLab('ks2'); });
  await p2.waitForSelector('#bkSim', { timeout: 30000 });
  ok((await p2.textContent('#bkPanel')).includes('Brick Lab needs Chrome or Edge on a Chromebook, Windows PC, Mac or Android tablet.') && !(await p2.$('#bkConnect')), 'no Web Bluetooth: the friendly message instead of Connect');
  await p2.click('#bkSim'); await sleep(200);
  await p2.click('#bkRun'); await sleep(300);
  ok(await p2.evaluate(() => brickLabApp._hub().motors.A === 100 && brickLabApp._hub().colour.join() === '0,204,68') && await p2.isVisible('.bk-motor.on'), 'Try without a hub: the starter program turns the pretend motor and light');
  await p2.click('[data-tilt="left"]'); await sleep(300);
  ok(await p2.evaluate(() => brickLabApp._hub().colour.join() === '255,0,0'), 'tilting the pretend hub runs “when tilted”');
  await p2.click('#bkRun');
  // other labs are unaffected
  await p2.evaluate(() => startNewStage('ks2')); await sleep(600);
  ok(await p2.evaluate(() => projectType === 'stage' && document.body.classList.contains('stage-mode') && !document.body.classList.contains('bricklab-mode')), 'the Stage Lab still opens normally');
  await p2.close();
}
ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
await b.close(); site.close(); done();
