// Starter for the "ai-happy-sad" lesson (used by lessons/make-starters.mjs).
// AI Lab starter for "Happy or sad?": two labels, happy and sad, with only three drawings each — and one smiley
// face filed under "sad" by mistake (third drawing in the sad card). Drawn by ai-model's own face code (seed 16), so
// the starter is the same every time.
import { join } from 'node:path';

export async function makeArgs(ROOT) {
  const M = await import(join(ROOT, 'ai', 'ai-model.js'));
  const four = M.sampleLabels('faces', 4, 16);           // [happy, sad], four drawings each
  const happy = four[0].ex.slice(0, 3), sad = four[1].ex.slice(0, 3);
  sad.splice(2, 0, four[0].ex[3]);                        // the mistake: a smiley face in the sad pile
  return { aiLabels: [{ name: 'happy', color: M.COLOURS[0], ex: happy }, { name: 'sad', color: M.COLOURS[1], ex: sad }] };
}

export const build = async ({ aiLabels }) => {
  startNewAI('ks2');
  for (let i = 0; i < 400 && !(aiApp && aiApp._ws && aiApp._ws()); i++) await new Promise(r => setTimeout(r, 50));
  aiApp.setProject({ kind: 'draw', labels: aiLabels });
};
