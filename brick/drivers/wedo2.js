// Brick Lab: a Web Bluetooth driver for the WeDo 2.0 Smarthub (Works with LEGO® Education WeDo 2.0). Our own code; no UI.
//
// Protocol facts (UUIDs and byte layouts) were checked against the Scratch 3 WeDo 2.0 extension (scratch-vm, AGPL-3.0 —
// used as a reference only, nothing copied) because LEGO's WeDo 2.0 SDK pages are no longer online:
//   services   device 00001523-…, IO 00004f0e-…   (all …-1212-efde-1523-785feabcd123)
//   device     attached IO 00001527 (notify: [port, attached, ?, type]) · low-voltage alert 00001528
//   IO         input values 00001560 (notify: [?, port, value…]) · input command 00001563 · output command 00001565
//   types      motor 1 · light 23 (the hub's own, port 6) · tilt 34 · distance 35;  hub ports 1 and 2 = A and B
//   input cmd  [1, 2, port, type, mode, delta, 0, 0, 0, unit, notify]   (tilt: mode 0 unit 0; distance: mode 0 unit 1)
//   output     [port, command, n, …bytes]: motor power = command 1, one signed byte (127 = brake, 0 = off); RGB = command 4
// Battery: the standard Battery Level characteristic when the hub has one, else the low-voltage alert.
import { HubBase, WriteQueue } from './hub-driver.js';

const U = n => '0000' + n + '-1212-efde-1523-785feabcd123';
export const UUID = {
  DEVICE: U('1523'), IO: U('4f0e'), ATTACHED_IO: U('1527'), LOW_VOLTAGE: U('1528'),
  INPUT_VALUES: U('1560'), INPUT_COMMAND: U('1563'), OUTPUT_COMMAND: U('1565')
};
export const TYPE = { MOTOR: 1, LIGHT: 23, TILT: 34, DISTANCE: 35 };
const PORTS = { 1: 'A', 2: 'B' }, IDS = { A: 1, B: 2 }, LIGHT_PORT = 6;
const DEVICE_OF = { 1: 'motor', 34: 'tilt', 35: 'distance' };

// ── bytes (exported so the tests can check them) ──
export const bytes = {
  inputFormat: (port, type, mode, unit, notify = 1, delta = 1) => [1, 2, port, type, mode, delta, 0, 0, 0, unit, notify],
  tiltSetup: port => bytes.inputFormat(port, TYPE.TILT, 0, 0),
  distanceSetup: port => bytes.inputFormat(port, TYPE.DISTANCE, 0, 1),
  lightSetup: () => bytes.inputFormat(LIGHT_PORT, TYPE.LIGHT, 1, 0, 0, 0),   // the hub light in RGB mode
  // WeDo motors don't turn below about 30% power, so 1–100 is spread over 30–100 (as Scratch does); 0 is off
  motorPower(port, power) {
    power = Math.max(-100, Math.min(100, Math.round(Number(power) || 0)));
    const p = power === 0 ? 0 : Math.sign(power) * Math.round(30 + 0.7 * Math.abs(power));
    return [port, 1, 1, p & 0xff];
  },
  brake: port => [port, 1, 1, 127],
  rgb: (r, g, b) => [LIGHT_PORT, 4, 3, r & 255, g & 255, b & 255]
};
// a tilt reading: two signed angles (the sensor sends each as one byte)
export const signed = v => (v > 127 ? v - 256 : v);

export class WeDo2Hub extends HubBase {
  constructor(bluetooth = typeof navigator !== 'undefined' ? navigator.bluetooth : null) {
    super('wedo2'); this.bt = bluetooth; this.device = null; this.ch = {}; this.q = null; this._valuesOn = false; this._poll = 0; this._bye = null;
  }
  // the browser's picker, filtered to WeDo 2.0 hubs. Must be called straight from a tap or click.
  async request() {
    if (!this.bt) throw new Error('no-bluetooth');
    this.device = await this.bt.requestDevice({ filters: [{ services: [UUID.DEVICE] }], optionalServices: [UUID.IO, 'battery_service'] });
    this.name = this.device.name || 'WeDo 2.0 hub';
    return this.device;
  }
  async connect() {
    if (!this.device) await this.request();
    this.setState('connecting');
    try {
      if (!this._bye) { this._bye = () => this._lost(); this.device.addEventListener('gattserverdisconnected', this._bye); }
      const server = await timeout(this.device.gatt.connect(), 15000);
      const dev = await server.getPrimaryService(UUID.DEVICE), io = await server.getPrimaryService(UUID.IO);
      this.ch = { attached: await dev.getCharacteristic(UUID.ATTACHED_IO), values: await io.getCharacteristic(UUID.INPUT_VALUES),
        input: await io.getCharacteristic(UUID.INPUT_COMMAND), output: await io.getCharacteristic(UUID.OUTPUT_COMMAND) };
      try { this.ch.low = await dev.getCharacteristic(UUID.LOW_VOLTAGE); } catch (e) { this.ch.low = null; }
      // one GATT write at a time: some platforms fail when writes overlap
      this.q = new WriteQueue(async ({ c, b }) => { const ch = this.ch[c], data = new Uint8Array(b); if (ch.writeValueWithResponse) await ch.writeValueWithResponse(data); else await ch.writeValue(data); });
      this.ports = { A: { device: null, raw: 0 }, B: { device: null, raw: 0 } }; this.values = { A: {}, B: {} }; this._valuesOn = false;
      this.ch.attached.addEventListener('characteristicvaluechanged', e => this._attached(dv(e)));
      this.ch.values.addEventListener('characteristicvaluechanged', e => this._value(dv(e)));
      await this.ch.attached.startNotifications();
      this.q.push('light-mode', { c: 'input', b: bytes.lightSetup() });
      await this._battery(server);
      this.setState('connected');
    } catch (e) { this._cleanup(); this.setState('disconnected'); throw e; }
  }
  // the same hub again, without the picker (after it was switched off or went out of range)
  async reconnect() { if (!this.device) return this.connect(); return this.connect(); }
  disconnect() { if (this.q) { this.stopAll(); } setTimeout(() => { try { if (this.device && this.device.gatt.connected) this.device.gatt.disconnect(); } catch (e) { /* gone */ } }, 150); }
  _lost() { const was = this.state; this._cleanup(); this.setState('disconnected'); if (was !== 'disconnected') this.emit('disconnect'); }
  _cleanup() { clearInterval(this._poll); this._poll = 0; if (this.q) this.q.close(); this.q = null; this.ports = {}; this.values = {}; this._valuesOn = false; this.emit('change'); }

  async _battery(server) {
    try {
      const s = await server.getPrimaryService('battery_service'), c = await s.getCharacteristic('battery_level');
      const read = v => { this.battery = v.getUint8(0); this.batteryLow = this.battery < 15; this.emit('change'); };
      read(await c.readValue());
      try { c.addEventListener('characteristicvaluechanged', e => read(dv(e))); await c.startNotifications(); } catch (e) { this._poll = setInterval(() => c.readValue().then(read, () => {}), 30000); }
    } catch (e) {
      this.battery = null; // no Battery Level on this hub: use the low-voltage alert
      if (this.ch.low) { try { this.ch.low.addEventListener('characteristicvaluechanged', e => { this.batteryLow = dv(e).getUint8(0) !== 0; this.emit('change'); }); await this.ch.low.startNotifications(); } catch (e2) { /* not offered */ } }
    }
  }
  _attached(d) {
    if (d.byteLength < 2) return;
    const id = d.getUint8(0), port = PORTS[id]; if (!port) return;
    const on = d.getUint8(1) !== 0, type = on && d.byteLength > 3 ? d.getUint8(3) : 0;
    this.ports[port] = { device: on ? (DEVICE_OF[type] || 'unknown') : null, raw: type };
    this.values[port] = {};
    if (type === TYPE.TILT) this.q.push('fmt-' + port, { c: 'input', b: bytes.tiltSetup(id) });
    if (type === TYPE.DISTANCE) this.q.push('fmt-' + port, { c: 'input', b: bytes.distanceSetup(id) });
    if ((type === TYPE.TILT || type === TYPE.DISTANCE) && !this._valuesOn) { this._valuesOn = true; this.ch.values.startNotifications().catch(() => { this._valuesOn = false; }); }
    this.emit('change');
  }
  _value(d) {
    if (d.byteLength < 3) return;
    const port = PORTS[d.getUint8(1)]; if (!port || !this.ports[port]) return;
    const dev = this.ports[port].device;
    if (dev === 'tilt' && d.byteLength >= 4) this.values[port] = { tilt: { x: signed(d.getUint8(2)), y: signed(d.getUint8(3)) } };
    else if (dev === 'distance') this.values[port] = { distance: d.getUint8(2) };
    else return;
    this.emit('value', port);
  }
  // ── commands ──
  motor(port, power) { if (this.q && IDS[port]) this.q.push('motor-' + port, { c: 'output', b: bytes.motorPower(IDS[port], power) }, Number(power) === 0); }
  brake(port) { if (this.q && IDS[port]) this.q.push('motor-' + port, { c: 'output', b: bytes.brake(IDS[port]) }, true); }
  stopAll() { for (const p of ['A', 'B']) if (this.q) this.q.push('motor-' + p, { c: 'output', b: bytes.motorPower(IDS[p], 0) }, true); }
  light(r, g, b) { if (this.q) this.q.push('light', { c: 'output', b: bytes.rgb(r, g, b) }); }
}
const dv = e => e.target.value; // a DataView
function timeout(p, ms) { return Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('timeout')), ms))]); }
