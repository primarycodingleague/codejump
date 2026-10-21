// Starter for "Sky Isles Explorers · Block 1 · Lesson 3: Predict and fix" (Years 1–2, Platformer Lab KS1).
// Two bugs to find by predicting and testing: the bounce mushroom is too far from the high island, so Pip lands short;
// and a wall of 3 blocks on the island stops Pip reaching the Finish. Fix: move the mushroom next to the island and
// erase the wall.
export function makeArgs() { return {}; }

export const build = () => {
  startNewProject('ks1');
  const g = (r, c, t) => { grid[r][c] = t; }, B = ROWS - 1;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) grid[r][c] = T.EMPTY;
  for (let c = 0; c < COLS; c++) g(B, c, T.GRASS);
  g(B - 1, 1, T.START);
  g(B, 4, T.BOUNCE);                                                   // bug 1: too far from the island
  for (let c = 13; c < COLS; c++) for (let r = B - 5; r < B; r++) g(r, c, r === B - 5 ? T.GRASS : T.PLATFORM); // the high island, 5 high
  for (let r = B - 8; r < B - 5; r++) g(r, 16, T.PLATFORM);            // bug 2: a wall in front of the Finish
  g(B - 6, 18, T.GOAL);
  g(B - 6, 14, T.FLOWER); g(1, 6, T.CLOUD); g(2, 11, T.CLOUD);
  commitLevel();
};
