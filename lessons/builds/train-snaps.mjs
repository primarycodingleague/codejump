// Starter for the "train-snaps" lesson (used by lessons/make-starters.mjs).
// Starter for 'train-snaps': an oval (2 straights each side), a start flag, a train station, a school and fallen trees
// beside the track, and a five-job challenge "Village line" for Train 1. No blocks: Train 1 drives by itself at Run and
// obeys the snaps. The only snaps are a deliberate BUG at the station: red then white (a command must start with white),
// so the train drives straight past and job 2 never ticks.
// In make-starters.mjs this is: TM (already imported there) + trainSnaps() in ARGS, and the BUILD entry below.
const TM = await import(new URL('../../train/train-model.js', import.meta.url).href);

export function trainSnapsProject() {
  const C4 = ['curveR', 'curveR', 'curveR', 'curveR'], _ = null, pieces = [];
  // clockwise: 0,1 top straights (left → right), 2–5 right-hand curves, 6,7 bottom straights (right → left), 8–11 left-hand curves
  TM.chain(pieces, { x: 0, y: 0, h: 0 }, ['straight', 'straight', ...C4, 'straight', 'straight', ...C4]);
  pieces[0][4] = ['red', 'white', _, _, _, _, _]; // the bug: white must come first
  return { v: 2, pieces, trains: [{ name: 'Train 1', color: TM.TRAIN_COLOURS[0], start: { p: 7, k: 0, rev: false } }], wagons: [],
    dests: [{ t: 'start', p: 7, side: -1 }, { t: 'station', p: 0, side: -1 }, { t: 'school', p: 1, side: -1 }, { t: 'trees', p: 3, side: -1 }],
    challenge: { id: '', title: 'Village line', text: 'Stop at the station, slow down past the school, turn back at the fallen trees, then end your route back at the station.',
      steps: [{ d: 0, a: 'start' }, { d: 1, a: 'stop' }, { d: 2, a: 'pass' }, { d: 3, a: 'reverse' }, { d: 1, a: 'end' }] },
    blocks: { blocks: { languageVersion: 0, blocks: [] } } };
}

export function makeArgs(ROOT) { return { train: trainSnapsProject() }; }

export const build = async ({ train }) => {
  startNewTrain('ks2');
  for (let i = 0; i < 400 && !(trainApp && trainApp._ws && trainApp._ws()); i++) await new Promise(r => setTimeout(r, 50));
  trainApp.setProject(train);
};
