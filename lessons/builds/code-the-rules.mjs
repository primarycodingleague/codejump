// Starter for the "code-the-rules" lesson (used by lessons/make-starters.mjs).
// Starter for "Code the rules" (Years 5–6): a finished level with six gems and working controls, but the only rule is
// "win by reaching the goal" — so it is far too easy. Pupils code their own rules with variables and selection:
// a countdown (time), a gem counter (gems), extra time for every gem, a bonus life on the 3rd gem and game over at 0.
export function makeArgs() {
  const XML = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="when_key_pressed" x="150" y="20"><field name="KEY">left</field><next><block type="player_move_left"></block></next></block>
<block type="when_key_pressed" x="370" y="20"><field name="KEY">right</field><next><block type="player_move_right"></block></next></block>
<block type="when_key_pressed" x="600" y="20"><field name="KEY">space</field><next><block type="player_jump"></block></next></block>
<block type="when_game_starts" x="150" y="150"><next><block type="win_reach_goal"><next><block type="set_lives"><field name="LIVES">3</field><next><block type="set_gem_points"><field name="POINTS">10</field><next><block type="set_music"><field name="MUSIC">adventure</field></block></next></block></next></block></next></block></next></block>
</xml>`;
  return { XML };
}

export const build = ({ XML }) => {
  startNewProject('ks2');
  const g = (r, c, t) => { grid[r][c] = t; }, B = ROWS - 1;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) grid[r][c] = T.EMPTY;
  for (let c = 0; c < COLS; c++) g(B, c, (c === 7 || c === 8) ? T.SPIKE : T.GRASS);   // the ground, with a spiky pit
  g(B - 1, 1, T.START); g(B - 1, COLS - 2, T.GOAL);
  for (let c = 3; c <= 5; c++) g(B - 2, c, T.PLATFORM);     // low step
  for (let c = 7; c <= 9; c++) g(B - 4, c, T.PLATFORM);     // high step, over the pit
  for (let c = 11; c <= 13; c++) g(B - 2, c, T.PLATFORM);   // low step
  for (let c = 15; c <= 16; c++) g(B - 4, c, T.PLATFORM);   // high step
  [[B - 3, 4], [B - 5, 8], [B - 1, 6], [B - 3, 12], [B - 5, 15], [B - 1, 14]].forEach(([r, c]) => g(r, c, T.GEM));
  g(B - 1, 10, T.SPIKE);
  g(1, 4, T.CLOUD); g(2, 13, T.CLOUD); g(B - 1, 2, T.FLOWER); g(B - 1, 17, T.BUSH);
  commitLevel();
  window._pendingXml = XML; // the Code view loads the program from here the first time it opens
  if (blocklyWorkspace) { blocklyWorkspace.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(XML), blocklyWorkspace); window._pendingXml = null; readBlocklyConfig(); }
};
