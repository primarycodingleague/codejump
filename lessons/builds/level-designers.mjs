// Starter for the "level-designers" lesson (used by lessons/make-starters.mjs).
// Starter for "Level designers" (Years 3–4): a finished-looking level with two bugs for pupils to find.
// Bug 1 (code): the Left and Right Arrow events are swapped, so the controls are backwards.
// Bug 2 (level): the rule is "win by collecting all gems", but one gem floats too high to reach, so the game can never be won.
export function makeArgs() {
  const XML = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="when_key_pressed" x="150" y="20"><field name="KEY">left</field><next><block type="player_move_right"></block></next></block>
<block type="when_key_pressed" x="370" y="20"><field name="KEY">right</field><next><block type="player_move_left"></block></next></block>
<block type="when_key_pressed" x="600" y="20"><field name="KEY">space</field><next><block type="player_jump"></block></next></block>
<block type="when_game_starts" x="150" y="150"><next><block type="win_collect_gems"><next><block type="set_lives"><field name="LIVES">3</field><next><block type="set_gem_points"><field name="POINTS">10</field><next><block type="set_music"><field name="MUSIC">happy</field></block></next></block></next></block></next></block></next></block>
</xml>`;
  return { XML };
}

export const build = ({ XML }) => {
  startNewProject('ks2');
  const g = (r, c, t) => { grid[r][c] = t; };
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) grid[r][c] = T.EMPTY;
  for (let c = 0; c < COLS; c++) if (c !== 8 && c !== 9) g(ROWS - 1, c, T.GRASS);      // the ground, with a small gap to jump
  g(ROWS - 2, 1, T.START); g(ROWS - 2, COLS - 2, T.GOAL);
  for (let c = 4; c <= 6; c++) g(ROWS - 3, c, T.PLATFORM);                           // a step up
  g(ROWS - 4, 5, T.GEM);                                                              // gem 1: above the step
  g(ROWS - 2, 11, T.GEM);                                                             // gem 2: on the ground
  g(ROWS - 7, 14, T.GEM);                                                             // gem 3: the bug — far too high to reach
  g(ROWS - 2, 3, T.FLOWER); g(ROWS - 2, 16, T.BUSH); g(1, 3, T.CLOUD); g(2, 12, T.CLOUD);
  commitLevel();
  // the program (blocks): the Code view loads it from here the first time it opens
  window._pendingXml = XML;
  if (blocklyWorkspace) { blocklyWorkspace.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(XML), blocklyWorkspace); window._pendingXml = null; readBlocklyConfig(); }
};
