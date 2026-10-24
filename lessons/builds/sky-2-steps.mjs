// Starter for "Sky Isles Explorers · Block 1 · Lesson 2: Step by step" (Years 1–2, Platformer Lab KS1).
// Pip's route is a sequence: hop over the log, climb the steps, walk over the cliff, reach the Finish. The steps are
// missing, and the cliff is 4 blocks high (too high to jump). Pupils build steps 1, 2 and 3 blocks high, IN ORDER.
export function makeArgs() { return {}; }

export const build = () => {
  startNewProject('ks1');
  const g = (r, c, t) => { grid[r][c] = t; }, B = ROWS - 1;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) grid[r][c] = T.EMPTY;
  for (let c = 0; c < COLS; c++) g(B, c, T.GRASS);
  g(B - 1, 1, T.START);
  g(B - 1, 5, T.PLATFORM);                                             // the log to hop over
  for (let c = 12; c < COLS; c++) for (let r = B - 4; r < B; r++) g(r, c, r === B - 4 ? T.GRASS : T.PLATFORM); // the cliff, 4 high
  g(B - 5, 18, T.GOAL);
  g(B - 5, 14, T.FLOWER); g(1, 4, T.CLOUD); g(2, 10, T.CLOUD); g(B - 1, 8, T.BUSH);
  commitLevel();
};
