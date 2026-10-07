// Starter for the "robot-quiz" lesson (used by lessons/make-starters.mjs).
// Robot quiz starter: the robot welcomes you, asks ONE question and just repeats your answer back.
// Pupils make a score variable, check the answer with if … else, add a second question and say the final score.
export function makeArgs() {
  const T = t => ({ shadow: { type: 'text', fields: { TEXT: t } } });
  const chain = list => { let first = null, prev = null; for (const b of list) { if (prev) prev.next = { block: b }; else first = b; prev = b; } return first; };
  const hat = { type: 'rb_when_run', x: 24, y: 24 };
  hat.next = { block: chain([
    { type: 'rb_face', fields: { FACE: 'happy' } },
    { type: 'rb_say_wait', inputs: { TEXT: T('Welcome to my quiz!') } },
    { type: 'rb_ask', inputs: { TEXT: T('What is 3 + 4?') } },
    { type: 'rb_say_wait', inputs: { TEXT: { block: { type: 'rb_answer' } } } }
  ]) };
  return { robot: { blocks: { blocks: { languageVersion: 0, blocks: [hat] } }, name: 'Quizbot', body: '#eef2f6', trim: '#7b3fd8' } };
}

export const build = async ({ robot }) => {
  startNewRobot('ks2');
  for (let i = 0; i < 400 && !(robotApp && robotApp._ws && robotApp._ws() && robotApp._view()); i++) await new Promise(r => setTimeout(r, 50));
  robotApp.setProject(robot);
};
