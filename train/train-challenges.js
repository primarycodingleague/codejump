/* CodeJump · Train Lab — ready-made challenges (no DOM, so tests can check every answer really works).
 *
 * A challenge is a track, destination signs beside it and a schedule of things for Train 1 to do there ("stop at the
 * station", "drop off the wagon at the depot", …). Pupils solve it with snaps (or blocks); `answer` is the snaps that
 * solve it: { pieceIndex: [snap per slot] }. Every layout uses only real smart-train pieces, so a printed challenge card
 * can be built with the real track too. The ideas follow the snap-training worksheets (first stop, airport run, museum
 * trip, wagon delivery).
 */
import { chain, pieceGeom } from './train-model.js';

const C4 = ['curveR', 'curveR', 'curveR', 'curveR'];
// an oval going clockwise: n straights along the top, 4 curves, n along the bottom, 4 curves (outside = side -1)
function oval(n) {
  const pieces = [];
  chain(pieces, { x: 0, y: 0, h: 0 }, [...Array(n).fill('straight'), ...C4, ...Array(n).fill('straight'), ...C4]);
  return pieces;
}
// the oval with a passing loop on top (like the starter track)
function passingLoop() {
  const pieces = [];
  chain(pieces, { x: 0, y: 0, h: 0 }, ['straight', 'splitR', 'short', ['splitL', 1, 0], 'straight', ...C4, 'straight', 'straight', 'short', 'straight', 'straight', ...C4]);
  chain(pieces, pieceGeom(pieces[1]).ends[2], ['curveL', 'curveL']);
  return pieces;
}
const _ = null;

export const CHALLENGES = [
  {
    id: 'first-stop', title: 'First stop', level: 1,
    text: 'Help the train stop at the station to pick up its passengers.',
    pieces: () => oval(1), start: { p: 5, k: 0, rev: false },
    dests: [{ t: 'start', p: 5, side: -1 }, { t: 'station', p: 0, side: -1 }],
    steps: [{ d: 0, a: 'start' }, { d: 1, a: 'stop' }, { d: 0, a: 'pass' }],
    answer: { 0: ['white', 'red', _, _, _, _, _] },
    hint: 'A stop command is white then red.'
  },
  {
    id: 'airport-run', title: 'Airport run', level: 2,
    text: 'Stop at the station for 10 seconds, turn back at the fallen trees and end your route at the airport.',
    pieces: () => oval(2), start: { p: 7, k: 0, rev: false },
    dests: [{ t: 'start', p: 7, side: -1 }, { t: 'station', p: 0, side: -1 }, { t: 'trees', p: 3, side: -1 }, { t: 'airport', p: 6, side: -1 }],
    steps: [{ d: 0, a: 'start' }, { d: 1, a: 'stop' }, { d: 2, a: 'reverse' }, { d: 3, a: 'end' }],
    answer: { 0: ['white', 'red', 'red', 'red', _, _, _], 3: ['white', 'blue', _], 6: [_, _, _, _, 'blue', 'red', 'white'] },
    hint: 'After it turns back, the train reads snaps the other way round — start every command with white on the side it comes from.'
  },
  {
    id: 'museum-trip', title: 'Museum trip', level: 2,
    text: 'Pick up the class at the main station, then take the loop to the museum and end the route there.',
    pieces: passingLoop, start: { p: 12, k: 0, rev: false },
    dests: [{ t: 'start', p: 12, side: -1 }, { t: 'station', p: 0, side: -1 }, { t: 'museum', p: 18, side: 1 }],
    steps: [{ d: 0, a: 'start' }, { d: 1, a: 'stop' }, { d: 2, a: 'end' }],
    answer: { 0: ['white', 'red', _, _, _, _, _], 1: ['blue'], 18: ['white', 'red', 'blue'] },
    hint: 'A snap in a split’s slot picks the way: blue goes right.'
  },
  {
    id: 'wagon-delivery', title: 'Wagon delivery', level: 3,
    text: 'Back up to the farm to collect the wagon, wait at the level crossing, drop the wagon at the depot, then end at the station.',
    pieces: () => oval(2), start: { p: 0, k: 0, rev: false }, wagons: [{ p: 11, k: 0, rev: false }],
    dests: [{ t: 'start', p: 0, side: -1 }, { t: 'farm', p: 11, side: -1 }, { t: 'crossing', p: 7, side: -1 }, { t: 'depot', p: 6, side: -1 }, { t: 'station', p: 10, side: -1 }],
    steps: [{ d: 0, a: 'start' }, { d: 1, a: 'pickup' }, { d: 2, a: 'stop' }, { d: 3, a: 'drop' }, { d: 4, a: 'end' }],
    answer: { 0: [_, _, _, _, 'white', 'blue', _], 7: [_, _, _, _, _, 'red', 'white'], 6: [_, _, _, _, 'blue', 'yellow', 'white'], 10: ['white', 'red', 'blue'] },
    hint: 'The engine’s magnet is at its back, so it has to reverse into the wagon. White yellow blue drops the wagon and pulls away.'
  }
];

// a challenge as a Train Lab project (the snaps left off, unless withAnswer)
export function challengeProject(id, withAnswer) {
  const c = CHALLENGES.find(x => x.id === id); if (!c) return null;
  const pieces = c.pieces();
  if (withAnswer) for (const [p, snaps] of Object.entries(c.answer)) pieces[Number(p)][4] = snaps.slice();
  return {
    v: 2, pieces, wagons: (c.wagons || []).map(w => Object.assign({}, w)), dests: c.dests.map(d => Object.assign({}, d)),
    trains: [{ name: 'Train 1', start: Object.assign({}, c.start) }],
    challenge: { title: c.title, text: c.text, steps: c.steps.map(s => Object.assign({}, s)), id: c.id }
  };
}
