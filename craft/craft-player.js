/* CodeJump · Build Lab — walking, jumping and flying through the block world (no DOM; Node-testable).
 *   const p = createPlayer(world, x, y, z) · p.step(dt, {fwd, side, jump, down}) · p.yaw/p.pitch · p.fly · p.facing()
 * The player is a 0.6 × 1.75 box; it collides with solid blocks one axis at a time, so it slides along walls.
 */
import { isSolid } from './craft-world.js';

const HALF = 0.3, TALL = 1.75, GRAV = 28, JUMP = 8.6, WALK = 4.4, FLY = 9;

export function createPlayer(world, x, y, z) {
  const p = { x, y, z, vx: 0, vy: 0, vz: 0, yaw: 0, pitch: -0.15, fly: false, onGround: false };
  const solidAt = (x, y, z) => isSolid(world.get(Math.floor(x), Math.floor(y), Math.floor(z)));
  function hits(x, y, z) {
    for (const yy of [y + 0.0001, y + TALL / 2, y + TALL - 0.01]) for (const xx of [x - HALF, x + HALF]) for (const zz of [z - HALF, z + HALF]) if (solidAt(xx, yy, zz)) return true;
    return false;
  }
  p.hits = hits;
  // which way you face, snapped to north / east / south / west (0–3) — builder commands use it
  p.facing = () => { const a = ((-p.yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); return Math.round(a / (Math.PI / 2)) % 4; };
  p.look = () => [-Math.sin(p.yaw) * Math.cos(p.pitch), Math.sin(p.pitch), -Math.cos(p.yaw) * Math.cos(p.pitch)];
  p.step = function (dt, inp) {
    dt = Math.min(dt, 0.05);
    const s = p.fly ? FLY : WALK, fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
    let mx = (fx * (inp.fwd || 0) - fz * (inp.side || 0)), mz = (fz * (inp.fwd || 0) + fx * (inp.side || 0));
    const m = Math.hypot(mx, mz); if (m > 1) { mx /= m; mz /= m; }
    p.vx = mx * s; p.vz = mz * s;
    if (p.fly) p.vy = ((inp.jump ? 1 : 0) - (inp.down ? 1 : 0)) * FLY * 0.8;
    else { p.vy -= GRAV * dt; if (inp.jump && p.onGround) p.vy = JUMP; if (p.vy < -40) p.vy = -40; }
    // move one axis at a time
    let nx = p.x + p.vx * dt; if (!hits(nx, p.y, p.z)) p.x = nx;
    else if (!p.fly && p.onGround && !hits(nx, p.y + 1.01, p.z) && !hits(p.x, p.y + 1.01, p.z)) { /* step up one block */ p.y += 1.01; p.x = nx; }
    let nz = p.z + p.vz * dt; if (!hits(p.x, p.y, nz)) p.z = nz;
    else if (!p.fly && p.onGround && !hits(p.x, p.y + 1.01, nz) && !hits(p.x, p.y + 1.01, p.z)) { p.y += 1.01; p.z = nz; }
    const ny = p.y + p.vy * dt;
    if (!hits(p.x, ny, p.z)) { p.y = ny; p.onGround = false; }
    else { if (p.vy < 0) { p.onGround = true; p.y = Math.floor(ny) + 1; if (hits(p.x, p.y, p.z)) p.y = Math.ceil(p.y); } p.vy = 0; }
    if (p.fly && p.onGround && inp.down) p.onGround = true;
    // stay inside the world
    p.x = Math.max(0.4, Math.min(world.W - 0.4, p.x)); p.z = Math.max(0.4, Math.min(world.D - 0.4, p.z));
    if (p.y < 1) { p.y = world.groundAt(Math.floor(p.x), Math.floor(p.z)); p.vy = 0; }
    if (p.y > world.H + 6) p.y = world.H + 6;
  };
  // if a builder command puts blocks where you stand, pop up on top
  p.unstick = () => { let k = 0; while (hits(p.x, p.y, p.z) && k++ < world.H) p.y = Math.floor(p.y) + 1; };
  return p;
}
// the first block a ray from (o) along (d) hits: {x,y,z, nx,ny,nz (the face), dist} or null (Amanatides & Woo)
export function raycast(world, o, d, max = 8) {
  let x = Math.floor(o[0]), y = Math.floor(o[1]), z = Math.floor(o[2]);
  const sx = Math.sign(d[0]), sy = Math.sign(d[1]), sz = Math.sign(d[2]);
  const tdx = sx ? Math.abs(1 / d[0]) : Infinity, tdy = sy ? Math.abs(1 / d[1]) : Infinity, tdz = sz ? Math.abs(1 / d[2]) : Infinity;
  let tx = sx ? ((sx > 0 ? x + 1 - o[0] : o[0] - x) * tdx) : Infinity, ty = sy ? ((sy > 0 ? y + 1 - o[1] : o[1] - y) * tdy) : Infinity, tz = sz ? ((sz > 0 ? z + 1 - o[2] : o[2] - z) * tdz) : Infinity;
  let nx = 0, ny = 0, nz = 0, t = 0;
  for (let i = 0; i < 400; i++) {
    if (tx < ty && tx < tz) { x += sx; t = tx; tx += tdx; nx = -sx; ny = 0; nz = 0; }
    else if (ty < tz) { y += sy; t = ty; ty += tdy; nx = 0; ny = -sy; nz = 0; }
    else { z += sz; t = tz; tz += tdz; nx = 0; ny = 0; nz = -sz; }
    if (t > max) break;
    const id = world.get(x, y, z);
    if (id && id !== 9) return { x, y, z, nx, ny, nz, dist: t, id }; // water can be built through
  }
  return null;
}
