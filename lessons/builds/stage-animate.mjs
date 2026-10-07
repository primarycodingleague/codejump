// Starter for the "stage-animate" lesson (used by lessons/make-starters.mjs).
// Starter for "Animate a dance party" (stage-animate): a disco backdrop and three sprites.
//  Cat   — two dance costumes (pose 1, pose 2); script: when green flag clicked → say "Let's dance!" for 2 secs (pupils add the repeat).
//  Bird  — no code yet (pupils add "when this sprite clicked" → glide → say).
//  Robot — a jump on the space key with a bug: up 40 but only down 4, so it floats away (pupils debug it).
const CAT_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="st_when_flag" x="20" y="20"><next><block type="st_say_secs"><field name="TXT">Let's dance!</field><field name="SECS">2</field></block></next></block>
</xml>`;
const ROBOT_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="st_when_key" x="20" y="20"><field name="KEY">space</field><next><block type="st_change_y"><field name="N">40</field><next>
<block type="st_wait"><field name="N">0.3</field><next><block type="st_change_y"><field name="N">-4</field></block></next></block></next></block></next></block>
</xml>`;

export function makeArgs() { return { CAT_XML, ROBOT_XML }; }

export const build = ({ CAT_XML, ROBOT_XML }) => {
  startNewStage('ks2');
  const cat = blankSprite('Cat', 0);
  Object.assign(cat, { x: CW / 2 - 200, y: CH / 2 + 110, size: 150, xml: CAT_XML });
  cat.costumes = [{ name: 'dance1', builtin: 'cat', color: '#f59f18' }, { name: 'dance2', builtin: 'cat', color: '#f59f18', pose: 1 }]; cat.costumeIdx = 0;
  const bird = blankSprite('Bird', 1);
  Object.assign(bird, { x: CW / 2 - 340, y: CH / 2 - 170, size: 130, xml: '' });
  bird.costumes = [{ name: 'blue', builtin: 'bird', color: '#4dabf7' }]; bird.costumeIdx = 0;
  const robot = blankSprite('Robot', 2);
  Object.assign(robot, { x: CW / 2 + 220, y: CH / 2 + 110, size: 150, xml: ROBOT_XML });
  robot.costumes = [{ name: 'silver', builtin: 'robot', color: '#adb5bd' }]; robot.costumeIdx = 0;
  stageState.sprites = [cat, bird, robot];
  stageState.backdrops = [{ name: 'disco', color: '#3b2a6b' }]; stageState.backdropIdx = 0; stageState.bg = '#3b2a6b';
  stageSel = 0; stageLoadSpriteScripts(0); renderSpritePanel();
};
