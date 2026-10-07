// Starter for the "robot-storyteller" lesson (used by lessons/make-starters.mjs).
// Robot storyteller starter: "when Run is clicked" acts out the robot waking up — with ONE bug in the order:
// it says "Good morning!" while it still has its sleepy face, and only smiles and lights its eyes afterwards.
// Pupils fix the order, then add looking around, a repeat (nod 3 times) and a "when the robot is tapped" scene.
export function makeArgs() {
  const T = t => ({ shadow: { type: 'text', fields: { TEXT: t } } });
  const chain = list => { let first = null, prev = null; for (const b of list) { if (prev) prev.next = { block: b }; else first = b; prev = b; } return first; };
  const hat = { type: 'rb_when_run', x: 24, y: 24 };
  hat.next = { block: chain([
    { type: 'rb_light_off', fields: { PART: 'eyes' } },
    { type: 'rb_face', fields: { FACE: 'sleepy' } },
    { type: 'rb_say_wait', inputs: { TEXT: T('Zzz…') } },
    { type: 'rb_say_wait', inputs: { TEXT: T('Good morning! I am Sparky.') } },
    { type: 'rb_face', fields: { FACE: 'happy' } },
    { type: 'rb_light', fields: { PART: 'eyes', COL: '#ffd23f' } }
  ]) };
  return { robot: { blocks: { blocks: { languageVersion: 0, blocks: [hat] } }, name: 'Sparky', body: '#eef2f6', trim: '#2b6fd8' } };
}

export const build = async ({ robot }) => {
  startNewRobot('ks2');
  for (let i = 0; i < 400 && !(robotApp && robotApp._ws && robotApp._ws() && robotApp._view()); i++) await new Promise(r => setTimeout(r, 50));
  robotApp.setProject(robot);
};
