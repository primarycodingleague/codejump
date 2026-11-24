// Brick Lab: what every hub driver offers (WeDo 2.0 now; SPIKE Essential / SPIKE Prime later, behind the same interface).
// No UI code here or in any driver: the lab (brick-app.js) and the block runner (brick-run.js) only use this interface.
//
//   const hub = new SomeHub(...)               // a driver (see wedo2.js, sim.js)
//   await hub.request()                         // Bluetooth drivers: opens the browser's device picker (call from a tap)
//   await hub.connect() · await hub.reconnect() · hub.disconnect()
//   hub.state            'disconnected' | 'connecting' | 'connected'
//   hub.kind             'wedo2' (later 'spike-essential', 'spike-prime') · hub.name · hub.battery (0–100 or null) · hub.batteryLow
//   hub.ports            { A: { device, raw }, B: … }   device = 'motor' | 'tilt' | 'distance' | 'unknown' | null
//   hub.values           { A: { tilt: {x, y} } | { distance: n } … }   live sensor readings, in the driver's own units
//   hub.motor(port, power)   power −100…100 (0 = off; the sign is the direction) · hub.brake(port) · hub.stopAll()
//   hub.light(r, g, b)       the hub's own light, 0–255 each
//   hub.on('change' | 'value' | 'disconnect' | 'error', fn) → off()
// Ports are named by letter as printed on the hub. A driver keeps its own write queue so a fast program can't flood the hub.

export const DEVICES = ['motor', 'tilt', 'distance'];

// Can this browser talk to Bluetooth hubs at all? (Web Bluetooth: Chrome/Edge on ChromeOS, Windows, macOS and Android.)
export function bluetoothSupport(nav = typeof navigator !== 'undefined' ? navigator : null, win = typeof window !== 'undefined' ? window : null) {
  if (!nav || !nav.bluetooth || typeof nav.bluetooth.requestDevice !== 'function') return { ok: false, reason: 'no-api' };
  if (win && win.isSecureContext === false) return { ok: false, reason: 'insecure' };
  return { ok: true };
}

// a tiny event emitter + the shared state every driver keeps
export class HubBase {
  constructor(kind) {
    this.kind = kind; this.state = 'disconnected'; this.name = ''; this.battery = null; this.batteryLow = false;
    this.ports = {}; this.values = {}; this._fns = {};
  }
  on(ev, fn) { (this._fns[ev] = this._fns[ev] || []).push(fn); return () => { this._fns[ev] = (this._fns[ev] || []).filter(f => f !== fn); }; }
  emit(ev, ...a) { for (const f of (this._fns[ev] || []).slice()) { try { f(...a); } catch (e) { /* a listener's problem, not the hub's */ } } }
  setState(s) { if (this.state !== s) { this.state = s; this.emit('change'); } }
  // helpers the runner uses: the first port that has a given device
  portWith(device) { for (const p of Object.keys(this.ports).sort()) if (this.ports[p] && this.ports[p].device === device) return p; return null; }
  motorPorts() { return Object.keys(this.ports).sort().filter(p => this.ports[p] && this.ports[p].device === 'motor'); }
}

// A queue for Bluetooth writes: one at a time, at most `rate` per second, and the newest command for the same thing (say,
// motor A's power) replaces an older one that hasn't gone yet. Urgent writes (stop) jump the queue.
export class WriteQueue {
  constructor(send, { rate = 20, now = () => Date.now(), sleep = ms => new Promise(r => setTimeout(r, ms)) } = {}) {
    this.send = send; this.gap = 1000 / rate; this.now = now; this.sleep = sleep; this.items = []; this.busy = false; this.last = 0; this.closed = false;
  }
  push(key, bytes, urgent = false) {
    if (this.closed) return;
    const i = key ? this.items.findIndex(x => x.key === key) : -1;
    if (i >= 0) this.items.splice(i, 1);
    const item = { key, bytes };
    if (urgent) this.items.unshift(item); else this.items.push(item);
    this.run();
  }
  async run() {
    if (this.busy) return; this.busy = true;
    try {
      while (this.items.length && !this.closed) {
        const wait = this.last + this.gap - this.now(); if (wait > 0) await this.sleep(wait);
        const it = this.items.shift(); if (!it) break;
        this.last = this.now();
        try { await this.send(it.bytes); } catch (e) { /* the hub went away: disconnect handling cleans up */ }
      }
    } finally { this.busy = false; }
  }
  clear() { this.items = []; }
  close() { this.closed = true; this.items = []; }
}
