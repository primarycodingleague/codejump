// Brick Lab: a pretend hub ("Try without a hub") with the same interface as a real one. Pupils choose what is plugged into
// each port, tilt it and move a hand in front of the distance sensor on screen; the lab shows the motors turning and the light.
// The tests use it too. No UI code here.
import { HubBase } from './hub-driver.js';

export class SimHub extends HubBase {
  constructor(setup = { A: 'motor', B: 'tilt' }) {
    super('sim'); this.name = 'Pretend hub'; this.battery = 100; this.motors = {}; this.colour = [0, 0, 255]; this.log = [];
    this.configure(setup);
  }
  async request() { return null; }
  async connect() { this.setState('connected'); }
  async reconnect() { this.setState('connected'); }
  disconnect() { this.stopAll(); this.setState('disconnected'); this.emit('disconnect'); }
  configure(setup) {
    for (const p of ['A', 'B']) {
      const d = setup && ['motor', 'tilt', 'distance'].includes(setup[p]) ? setup[p] : null;
      this.ports[p] = { device: d, raw: 0 }; this.values[p] = d === 'tilt' ? { tilt: { x: 0, y: 0 } } : d === 'distance' ? { distance: 100 } : {};
      this.motors[p] = 0;
    }
    this.emit('change');
  }
  setup() { return { A: this.ports.A.device, B: this.ports.B.device }; }
  setTilt(x, y) { const p = this.portWith('tilt'); if (!p) return; this.values[p] = { tilt: { x: Math.round(x), y: Math.round(y) } }; this.emit('value', p); }
  setDistance(n) { const p = this.portWith('distance'); if (!p) return; this.values[p] = { distance: Math.round(n) }; this.emit('value', p); }
  motor(port, power) { if (this.state !== 'connected' || !this.ports[port] || this.ports[port].device !== 'motor') return; this.motors[port] = Math.max(-100, Math.min(100, Number(power) || 0)); this.log.push(['motor', port, this.motors[port]]); this.emit('change'); }
  brake(port) { this.motor(port, 0); }
  stopAll() { for (const p of Object.keys(this.motors)) this.motors[p] = 0; this.log.push(['stop']); this.emit('change'); }
  light(r, g, b) { if (this.state !== 'connected') return; this.colour = [r, g, b]; this.log.push(['light', r, g, b]); this.emit('change'); }
}
