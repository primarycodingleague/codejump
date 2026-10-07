// Starter for the "turtle-procedures" lesson (used by lessons/make-starters.mjs).
export function makeArgs() {
  return { code: '; A house: just one house, just one size.\n; Walls\nrepeat 4 [fd 100 rt 90]\n; Roof\nfd 100\nrt 30\nrepeat 3 [fd 100 rt 120]\nlt 30\nbk 100\n' };
}
export const build = async ({ code }) => {
  startNewTurtle('ks2');
  turtleCode = code;
  document.getElementById('turtle-code').value = turtleCode;
};
