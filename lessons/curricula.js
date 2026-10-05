/* CodeJump · curriculum links for the ready-made lessons, per country.
 * A lesson lists objective KEYS in `curriculum` (lessons.js); this file turns them into the official statements of the
 * teacher's chosen country (the host keeps the choice: localStorage cj_country, CJ_COUNTRIES in build-and-play.html).
 *   alg · debug1 · predict · create1   — ages 5–7  (England: Key Stage 1)
 *   design · ssr · reason · data · safe — ages 7–11 (England: Key Stage 2)
 * Every statement is the curriculum authority's own wording (code + source), never a paraphrase presented as official.
 * The non-England statements (Oct 2026) were confirmed against excerpts of the official documents; check each against the
 * source PDF before quoting it elsewhere. `none: true` = the country has no computing strand (show the note only).
 * Ages: 5–7 keys map to the early bands (Scotland Early/First level, Wales progression steps 1–2, CSTA 1A, Australia F–2,
 * NZ progress outcome 2); 7–11 keys to the later ones (Second level, step 3, CSTA 1B, Years 3–6, outcomes 3–4).
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
  scotland: {
    framework: 'Curriculum for Excellence: Technologies, Computing Science experiences and outcomes (2017)',
    heading: 'Curriculum for Excellence (computing science)',
    source: 'https://education.gov.scot/media/nqgj0egw/technologies-es-os.pdf',
    keys: {
      alg: [{ code: 'TCH 0-14a', text: 'I understand that sequences of instructions are used to control computing technology.' },
        { code: 'TCH 0-15a', text: 'I can develop a sequence of instructions and run them using programmable devices or equivalent.' }],
      debug1: [{ code: 'TCH 1-15a', text: 'I can demonstrate a range of basic problem solving skills by building simple programs to carry out a given task, using an appropriate language.' }],
      predict: [{ code: 'TCH 1-14a', text: 'I understand the instructions of a visual programming language and can predict the outcome of a program written using the language.' }],
      create1: [{ code: 'TCH 1-15a', text: 'I can demonstrate a range of basic problem solving skills by building simple programs to carry out a given task, using an appropriate language.' }],
      design: [{ code: 'TCH 2-15a', text: 'I can create, develop and evaluate computing solutions in response to a design challenge.' }],
      ssr: [{ code: 'TCH 2-14a', text: 'I can explain core programming language concepts in appropriate technical language.' }],
      reason: [{ code: 'TCH 2-15a', text: 'I can create, develop and evaluate computing solutions in response to a design challenge.' }],
      data: [{ code: 'TCH 2-14a', text: 'I can explain core programming language concepts in appropriate technical language.' }],
      safe: [{ code: 'TCH 2-03a', text: 'I can explore online communities demonstrating an understanding of responsible digital behaviour and I’m aware of how to keep myself safe and secure.' }]
    }
  },
  wales: {
    framework: 'Curriculum for Wales: Science and Technology, “Computation is the foundation for our digital world” (descriptions of learning)',
    heading: 'Curriculum for Wales (computation)',
    source: 'https://hwb.gov.wales/curriculum-for-wales/science-and-technology/descriptions-of-learning/',
    keys: {
      alg: [{ code: 'Progression step 1', text: 'I can identify, follow and begin to create sequences and patterns in everyday activities.' },
        { code: 'Progression step 2', text: 'I can create simple algorithms and am beginning to explain errors.' }],
      debug1: [{ code: 'Progression step 2', text: 'I can create simple algorithms and am beginning to explain errors.' }],
      predict: [{ code: 'Progression step 2', text: 'I can follow algorithms to determine their purpose and predict outcomes.' }],
      create1: [{ code: 'Progression step 1', text: 'I can experiment with and identify uses of a range of computing technology in the world around me.' }],
      design: [{ code: 'Progression step 2', text: 'I can follow instructions to build and control a physical device.' }],
      ssr: [{ code: 'Progression step 3', text: 'I can use conditional statements to add control and decision-making to algorithms.' },
        { code: 'Progression step 3', text: 'I can identify repeating patterns and use loops to make my algorithms more concise.' }],
      reason: [{ code: 'Progression step 3', text: 'I can explain and debug algorithms.' }],
      data: [{ code: 'Progression step 2', text: 'I am beginning to explain the importance of accurate and reliable data to ensure a desired outcome.' },
        { code: 'Progression step 3', text: 'I can effectively store and manipulate data to produce and give a visual form to useful information.' }]
    }
  },
  ni: {
    framework: 'The Northern Ireland Curriculum (Primary): Using ICT (Explore, Express, Exchange, Evaluate, Exhibit)',
    heading: 'Northern Ireland Curriculum (Using ICT)',
    source: 'https://ccea.org.uk/downloads/docs/ccea-asset/Curriculum/The%20Northern%20Ireland%20Curriculum%20-%20Primary.pdf',
    note: 'Northern Ireland has no separate computing subject: coding and computational thinking come under Using ICT, Explore.',
    keys: {
      alg: [{ code: 'Using ICT: Explore', text: 'Investigate, make predictions and solve problems through interaction with digital tools.' }],
      debug1: [{ code: 'Using ICT: Explore', text: 'Investigate, make predictions and solve problems through interaction with digital tools.' }],
      predict: [{ code: 'Using ICT: Explore', text: 'Investigate, make predictions and solve problems through interaction with digital tools.' }],
      design: [{ code: 'Using ICT: Explore', text: 'Investigate, make predictions and solve problems through interaction with digital tools.' }],
      ssr: [{ code: 'Using ICT: Explore', text: 'Investigate, make predictions and solve problems through interaction with digital tools.' }],
      reason: [{ code: 'Using ICT: Explore', text: 'Investigate, make predictions and solve problems through interaction with digital tools.' }],
      data: [{ code: 'Using ICT: Explore', text: 'Investigate, make predictions and solve problems through interaction with digital tools.' }]
    }
  },
  ireland: {
    framework: 'Primary Curriculum Framework (NCCA, 2023)',
    heading: 'Curriculum links (Ireland)',
    source: 'https://www.curriculumonline.ie/primary/',
    none: true,
    note: 'Ireland’s primary curriculum has no separate computing or coding subject. This lesson supports computational thinking in the Science, Technology and Engineering curriculum and the key competency “Being a digital learner” (Primary Curriculum Framework, 2023).',
    keys: {}
  },
  usa: {
    framework: 'CSTA K–12 Computer Science Standards (revised 2017): Level 1A (grades K–2) and Level 1B (grades 3–5)',
    heading: 'CSTA K–12 Computer Science Standards',
    source: 'https://csteachers.org/wp-content/uploads/2025/03/csta-k-12-computer-science-standards-revised.pdf',
    keys: {
      alg: [{ code: '1A-AP-08', text: 'Model daily processes by creating and following algorithms (sets of step-by-step instructions) to complete tasks.' },
        { code: '1A-AP-10', text: 'Develop programs with sequences and simple loops, to express ideas or address a problem.' }],
      debug1: [{ code: '1A-AP-14', text: 'Debug (identify and fix) errors in an algorithm or program that includes sequences and simple loops.' }],
      predict: [{ code: '1A-AP-12', text: 'Develop plans that describe a program’s sequence of events, goals, and expected outcomes.' }],
      create1: [{ code: '1A-AP-10', text: 'Develop programs with sequences and simple loops, to express ideas or address a problem.' }],
      design: [{ code: '1B-AP-11', text: 'Decompose (break down) problems into smaller, manageable subproblems to facilitate the program development process.' }],
      ssr: [{ code: '1B-AP-10', text: 'Create programs that include sequences, events, loops, and conditionals.' },
        { code: '1B-AP-09', text: 'Create programs that use variables to store and modify data.' }],
      reason: [{ code: '1B-AP-15', text: 'Test and debug (identify and fix errors) a program or algorithm to ensure it runs as intended.' }],
      data: [{ code: '1B-DA-07', text: 'Use data to highlight or propose cause-and-effect relationships, predict outcomes, or communicate an idea.' }]
    }
  },
  australia: {
    framework: 'Australian Curriculum v9.0: Technologies, Digital Technologies',
    heading: 'Australian Curriculum: Digital Technologies',
    source: 'https://v9.australiancurriculum.edu.au/f-10-curriculum/learning-areas/technologies/digital-technologies',
    keys: {
      alg: [{ code: 'AC9TDI2P02', text: 'Follow and describe algorithms involving a sequence of steps, branching (decisions) and iteration (repetition).' }],
      debug1: [{ code: 'AC9TDI2P02', text: 'Follow and describe algorithms involving a sequence of steps, branching (decisions) and iteration (repetition).' }],
      predict: [{ code: 'AC9TDI2P02', text: 'Follow and describe algorithms involving a sequence of steps, branching (decisions) and iteration (repetition).' }],
      create1: [{ code: 'AC9TDI2P04', text: 'Use the basic features of common digital tools to create, locate and communicate content.' }],
      design: [{ code: 'AC9TDI6P01', text: 'Define problems using given or co-developed design criteria and by creating user stories.' },
        { code: 'AC9TDI6P04', text: 'Generate, modify, communicate and evaluate designs.' }],
      ssr: [{ code: 'AC9TDI4P04', text: 'Implement simple algorithms as visual programs involving control structures and input.' },
        { code: 'AC9TDI6P05', text: 'Implement algorithms as visual programs involving control structures, variables and input.' }],
      reason: [{ code: 'AC9TDI4P02', text: 'Follow and describe algorithms involving sequencing, comparison operators (branching) and iteration.' },
        { code: 'AC9TDI6P02', text: 'Design algorithms involving multiple alternatives (branching) and iteration.' }],
      data: [{ code: 'AC9TDI4K03', text: 'Recognise different types of data and explore how the same data can be represented differently depending on the purpose.' }],
      safe: [{ code: 'AC9TDI6P08', text: 'Select and use appropriate digital tools effectively to share content online, plan tasks and collaborate on projects, demonstrating agreed behaviours.' }]
    }
  },
  nz: {
    framework: 'The New Zealand Curriculum: Technology, Digital Technologies (Computational thinking for digital technologies, progress outcomes)',
    heading: 'NZ Curriculum: Digital Technologies',
    source: 'https://newzealandcurriculum.tahurangi.education.govt.nz/',
    keys: {
      alg: [{ code: 'Computational thinking, progress outcome 2', text: 'In authentic contexts and taking account of end-users, students give, follow and debug simple algorithms in computerised and non-computerised contexts. They use these algorithms to create simple programs involving outputs and sequencing (putting instructions one after the other) in age-appropriate programming environments.' }],
      debug1: [{ code: 'Computational thinking, progress outcome 2', text: 'In authentic contexts and taking account of end-users, students give, follow and debug simple algorithms in computerised and non-computerised contexts. They use these algorithms to create simple programs involving outputs and sequencing (putting instructions one after the other) in age-appropriate programming environments.' }],
      predict: [{ code: 'Computational thinking, progress outcome 2', text: 'In authentic contexts and taking account of end-users, students give, follow and debug simple algorithms in computerised and non-computerised contexts. They use these algorithms to create simple programs involving outputs and sequencing (putting instructions one after the other) in age-appropriate programming environments.' }],
      create1: [{ code: 'Computational thinking, progress outcome 2', text: 'In authentic contexts and taking account of end-users, students give, follow and debug simple algorithms in computerised and non-computerised contexts. They use these algorithms to create simple programs involving outputs and sequencing (putting instructions one after the other) in age-appropriate programming environments.' }],
      design: [{ code: 'Computational thinking, progress outcome 3', text: 'They develop and debug simple programs that use inputs, outputs, sequence and iteration (repeating part of the algorithm with a loop).' }],
      ssr: [{ code: 'Computational thinking, progress outcome 4', text: 'In authentic contexts and taking account of end-users, students decompose problems to create simple algorithms using the three building blocks of programming: sequence, selection, and iteration.' }],
      reason: [{ code: 'Computational thinking, progress outcome 3', text: 'They develop and debug simple programs that use inputs, outputs, sequence and iteration (repeating part of the algorithm with a loop).' }]
    }
  },
  cyprus: {
    framework: 'National Curriculum in England: computing programmes of study (followed by most English-medium schools in Cyprus)',
    heading: 'National Curriculum (computing)',
    source: ENG,
    note: 'Cypriot public primary schools have no separate computing subject (programming and robotics come mainly through Design and Technology), so these are the England links that English-medium schools in Cyprus use.',
    keys: null // filled in below from England
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

CURRICULA.cyprus.keys = CURRICULA.england.keys;

// {framework, heading, source, note, items:[{code?, text, source?}]} for a lesson's keys in a country (falls back to England)
export function curriculumLinks(country, keys) {
  const c = CURRICULA[country] || CURRICULA.england, seen = new Set(), items = [];
  for (const k of keys || []) for (const it of (c.keys[k] || [])) {
    const id = (it.code || '') + '|' + it.text;
    if (!seen.has(id)) { seen.add(id); items.push(it); }
  }
  return { framework: c.framework, heading: c.heading, source: c.source || '', note: c.note || '', none: !!c.none, items };
}
