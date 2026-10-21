// Starter for "Sky Isles Explorers · Block 1 · Lesson 4: Stepping stones" (Years 1–2, Platformer Lab KS1).
// A lake of spiky rocks (columns 4–15). The pattern is "spiky rock, spiky rock, stone, stone with a gem on it"; the
// first one is done. Pupils repeat the pattern 2 more times (3 in all: 6 stones, 3 gems) so Pip can hop across.
export function makeArgs() { return {}; }

export const build = () => {
  startNewProject('ks1');
  const g = (r, c, t) => { grid[r][c] = t; }, B = ROWS - 1;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) grid[r][c] = T.EMPTY;
  for (let c = 0; c < COLS; c++) g(B, c, (c >= 4 && c <= 15) ? T.SPIKE : T.GRASS);
  g(B, 6, T.PLATFORM); g(B, 7, T.PLATFORM); g(B - 1, 7, T.GEM);          // the pattern, done once
  g(B - 1, 1, T.START); g(B - 1, 18, T.GOAL);
  g(1, 3, T.CLOUD); g(2, 9, T.CLOUD); g(1, 15, T.CLOUD); g(B - 1, 17, T.FLOWER);
  commitLevel();
};
