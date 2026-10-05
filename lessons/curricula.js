/* CodeJump · curriculum links for the ready-made lessons, per country.
 * A lesson lists objective KEYS in `curriculum` (lessons.js); this file turns them into the official statements of the
 * teacher's chosen country (the host keeps the choice: localStorage cj_country, CJ_COUNTRIES in build-and-play.html).
 *   alg · debug1 · predict · create1   — ages 5–7  (England: Key Stage 1)
 *   design · ssr · reason · data · safe — ages 7–11 (England: Key Stage 2)
 * Every statement is the curriculum authority's own wording (code + source), never a paraphrase presented as official.
 * When a framework has no close match for a key, leave the key out (or []): the lesson then shows only what matches.
 * To add a country: one entry here + one in CJ_COUNTRIES (names of school years / age groups) in build-and-play.html.
 */

const ENG = 'https://www.gov.uk/government/publications/national-curriculum-in-england-computing-programmes-of-study';

export const CURRICULA = {
  england: {
    framework: 'National Curriculum in England: computing programmes of study',
    heading: 'National Curriculum (computing)',
    source: ENG,
    keys: {
      alg: [{ text: 'Understand what algorithms are; how they are implemented as programs on digital devices; and that programs execute by following precise and unambiguous instructions.' }],
      debug1: [{ text: 'Create and debug simple programs.' }],
      predict: [{ text: 'Use logical reasoning to predict the behaviour of simple programs.' }],
      create1: [{ text: 'Use technology purposefully to create, organise, store, manipulate and retrieve digital content.' }],
      design: [{ text: 'Design, write and debug programs that accomplish specific goals, including controlling or simulating physical systems; solve problems by decomposing them into smaller parts.' }],
      ssr: [{ text: 'Use sequence, selection, and repetition in programs; work with variables and various forms of input and output.' }],
      reason: [{ text: 'Use logical reasoning to explain how some simple algorithms work and to detect and correct errors in algorithms and programs.' }],
      data: [{ text: 'Select, use and combine a variety of software (including internet services) on a range of digital devices to design and create a range of programs, systems and content that accomplish given goals, including collecting, analysing, evaluating and presenting data and information.' }],
      safe: [{ text: 'Use technology safely, respectfully and responsibly; recognise acceptable/unacceptable behaviour; identify a range of ways to report concerns about content and contact.' }]
    }
  },
  other: {
    framework: 'General computing objectives (no national framework chosen)',
    heading: 'Computing objectives',
    note: 'Choose your country above to see your own curriculum’s statements.',
    keys: {
      alg: [{ text: 'Understand that an algorithm is a set of precise steps, and that a computer follows a program’s instructions exactly.' }],
      debug1: [{ text: 'Create simple programs and find and fix mistakes in them.' }],
      predict: [{ text: 'Predict what a simple program will do before running it.' }],
      create1: [{ text: 'Use technology to create and change digital content.' }],
      design: [{ text: 'Design, write and debug programs for a goal, breaking a problem into smaller parts.' }],
      ssr: [{ text: 'Use sequence, selection (if/else) and repetition (loops) in programs, with variables, input and output.' }],
      reason: [{ text: 'Explain how a program works and use logical reasoning to find and correct errors.' }],
      data: [{ text: 'Collect, analyse and present data, and use it to make or test predictions.' }],
      safe: [{ text: 'Use technology safely, respectfully and responsibly.' }]
    }
  }
};

// {framework, heading, source, note, items:[{code?, text, source?}]} for a lesson's keys in a country (falls back to England)
export function curriculumLinks(country, keys) {
  const c = CURRICULA[country] || CURRICULA.england, seen = new Set(), items = [];
  for (const k of keys || []) for (const it of (c.keys[k] || [])) {
    const id = (it.code || '') + '|' + it.text;
    if (!seen.has(id)) { seen.add(id); items.push(it); }
  }
  return { framework: c.framework, heading: c.heading, source: c.source || '', note: c.note || '', items };
}
