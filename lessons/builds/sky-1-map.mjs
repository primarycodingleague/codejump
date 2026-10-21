// Starter for "Sky Isles Explorers · Block 1 · Lesson 1: Follow the map" (Years 1–2, Platformer Lab KS1).
// The island has grass and a river of spiky rocks, but no Start, no Finish and no bridge. Pupils follow Captain Wren's
// exact instructions (the algorithm): Start on column 2, Finish on the far right, cover the 4 spiky rocks with Platform.
export function makeArgs() { return {}; }

export const build = () => {
  startNewProject('ks1');
  const g = (r, c, t) => { grid[r][c] = t; }, B = ROWS - 1;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) grid[r][c] = T.EMPTY;
  for (let c = 0; c < COLS; c++) g(B, c, (c >= 8 && c <= 11) ? T.SPIKE : T.GRASS); // the river of spiky rocks
  g(1, 3, T.CLOUD); g(2, 13, T.CLOUD); g(B - 1, 5, T.FLOWER); g(B - 1, 15, T.BUSH);
  commitLevel();
};
