// Starter for "Sky Isles Explorers · Block 1 · Lesson 5: Pip's new controls" (Years 1–2, Platformer Lab KS1).
// Events: Captain Wren's game pad uses the W, A and D keys. The Code has "when A key is pressed → move left" and the
// rule "win by reaching the goal", but nothing for D (move right) or W (jump). Pupils add those two events, then use
// the "when game starts" event for music and a win message.
export function makeArgs() {
  const XML = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="when_key_pressed" x="20" y="20"><field name="KEY">a</field><next><block type="player_move_left"></block></next></block>
<block type="when_game_starts" x="20" y="150"><next><block type="win_reach_goal"></block></next></block>
</xml>`;
  // the finished program (used by the tests): D moves right, W jumps, and "when game starts" plays music and sets the win message
  const ANSWER = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="when_key_pressed" x="20" y="20"><field name="KEY">a</field><next><block type="player_move_left"></block></next></block>
<block type="when_key_pressed" x="230" y="20"><field name="KEY">d</field><next><block type="player_move_right"></block></next></block>
<block type="when_key_pressed" x="440" y="20"><field name="KEY">w</field><next><block type="player_jump"></block></next></block>
<block type="when_game_starts" x="20" y="150"><next><block type="win_reach_goal"><next><block type="set_music"><field name="MUSIC">happy</field><next><block type="win_message"><field name="MSG">Well done, Pip!</field></block></next></block></next></block></next></block>
</xml>`;
  return { XML, ANSWER };
}

export const build = ({ XML }) => {
  startNewProject('ks1');
  const g = (r, c, t) => { grid[r][c] = t; }, B = ROWS - 1;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) grid[r][c] = T.EMPTY;
  for (let c = 0; c < COLS; c++) g(B, c, (c === 7 || c === 8) ? T.SPIKE : T.GRASS);
  g(B - 1, 12, T.PLATFORM); g(B - 1, 13, T.PLATFORM); g(B - 2, 13, T.PLATFORM); // two steps up
  g(B - 1, 1, T.START); g(B - 1, 18, T.GOAL);
  g(B - 3, 13, T.GEM); g(1, 4, T.CLOUD); g(2, 14, T.CLOUD); g(B - 1, 4, T.FLOWER);
  commitLevel();
  window._pendingXml = XML; // the Code view loads the program from here the first time it opens
  if (blocklyWorkspace) { blocklyWorkspace.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(XML), blocklyWorkspace); window._pendingXml = null; readBlocklyConfig(); }
};
