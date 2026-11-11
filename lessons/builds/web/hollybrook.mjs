// The Hollybrook Web Team — the Web Lab's lesson unit (lessons/units/web.js, 18 lessons in 3 blocks). One place for every
// lesson's starter website, its goals checklist and the intended answer, so the starters (lessons/builds/web-*.mjs →
// make-starters.mjs) and the tests (tests/unit-web.test.mjs) can never drift apart. This folder is not a lesson:
// make-starters.mjs only reads the *.mjs files directly in builds/.
// UNIT[id] = { goals, starter() → a Web Lab project, answer(p) → changes a copy of the starter into a finished one, code?: n }
// (code = how many Code-tab edits the answer makes; the app counts them, so in Node the test passes it as state.codeEdits).
import * as W from '../../../web/web-model.js';

const T = (t, o) => Object.assign(W.blockOf(t), o || {});
const H = (text, level = 1, o) => T('heading', Object.assign({ text, level }, o));
const P = (html, o) => T('text', Object.assign({ html }, o));
const PIC = (name, alt, o) => T('image', Object.assign({ src: 'lib:' + name, alt, w: 40, align: 'center' }, o));

// site(title, [[page name, [blocks]]…], theme?, css?) — '@N' in a link or an href means "page N of this site"
export function site(title, pages, theme, css) {
  const p = { v: 1, site: { title, theme: Object.assign({}, W.DEFAULT_THEME, theme || {}), order: [], css: css || '' }, imgs: {} };
  for (const [name, blocks] of pages) { const id = W.newId(); p.site.order.push(id); p['p' + id] = { name, blocks }; }
  const at = s => s.replace(/@(\d)/g, (m, n) => '#p-' + p.site.order[+n]);
  W.eachBlock(p, b => {
    if (typeof b.link === 'string') b.link = at(b.link);
    for (const k of ['html', 'text']) if (typeof b[k] === 'string') b[k] = b[k].replace(/href="(@\d)"/g, (m, r) => `href="${at(r)}"`);
  });
  return p;
}
const pageAt = (p, i) => p['p' + p.site.order[i]];
const blocksOf = (p, i) => pageAt(p, i).blocks;
const first = (p, t, i) => { let f = null; W.eachBlock(i == null ? p : { site: { order: [p.site.order[i]] }, ['p' + p.site.order[i]]: pageAt(p, i) }, b => { if (!f && b.t === t) f = b; }); return f; };
const link = (p, i) => '#p-' + p.site.order[i];
const newPage = (p, name, blocks) => { const id = W.addPage(p, name); pageAt(p, p.site.order.length - 1).blocks = blocks; return id; };
const goals = (title, list) => ({ title, list });

export const UNIT = {
  // ═══════════════ BLOCK 1 · OUR FIRST WEB PAGES (Years 3–4) ═══════════════
  'web-1-tour': {
    goals: goals('Hollybrook Library', [
      { type: 'blocks', block: 'text', page: 0, n: 3, text: 'Add a new Text block to the Home page' },
      { type: 'words', page: 0, n: 75, text: 'Write at least 2 sentences about a book you like' }
    ]),
    starter: () => site('Hollybrook Library', [
      ['Home', [T('banner', { title: 'Hollybrook Library', sub: 'Books, stories and a warm place to read' }), PIC('book', 'An open book', { w: 30 }),
        P('Welcome to <b>Hollybrook Library</b>! We are on Market Street, next to the fountain. Anyone can join, and it is free.'),
        P('Use the menu at the top to find our <a href="@1">opening times</a> and what is on this month.'),
        H('Our readers recommend', 2)]],
      ['Opening times', [H('Opening times'), T('table', { rows: [['Day', 'Open', 'Close'], ['Monday', '9am', '5pm'], ['Wednesday', '9am', '7pm'], ['Saturday', '10am', '4pm']], head: true }), P('We are closed on Sundays and bank holidays.')]],
      ['What’s on', [H('What’s on'), T('list', { items: ['Story time for little ones: Tuesdays at 10am', 'Code club: Thursdays at 4pm', 'Book swap: the first Saturday of the month'] })]]
    ]),
    answer: p => { blocksOf(p, 0).push(P('I recommend <b>The Secret Garden</b>. A girl finds a hidden garden behind a locked door and makes it grow again. I liked it because the ending made me smile, and the robin is my favourite character.')); }
  },
  'web-2-bakery': {
    goals: goals('Crumb & Co Bakery', [
      { type: 'heading', n: 3, text: 'Add 2 headings (the banner counts as 1)' },
      { type: 'blocks', block: 'list', n: 1, text: 'Add a list of 3 cakes' },
      { type: 'words', n: 45, text: 'Write at least 45 words on the page' }
    ]),
    starter: () => site('Crumb & Co', [['Home', [T('banner', { title: 'Crumb & Co', sub: 'The bakery on Hollybrook High Street' })]]], W.THEMES.sunset),
    answer: p => {
      blocksOf(p, 0).push(H('Our bread', 2), P('Every morning Mr Lindqvist bakes fresh loaves before the sun comes up. Try our seeded loaf, our soft white rolls or our crusty sourdough.'),
        H('Our cakes', 2), T('list', { items: ['Lemon drizzle cake', 'Chocolate fudge brownies', 'Carrot cake with orange icing'] }), P('Come in and say hello!'));
    }
  },
  'web-3-pictures': {
    goals: goals('Paws Place Animal Rescue', [
      { type: 'picture', n: 3, alt: true, text: 'Every picture has a description (3 pictures)' },
      { type: 'check', text: 'Check my site finds nothing to fix' }
    ]),
    starter: () => site('Paws Place', [['Home', [H('Paws Place Animal Rescue'), P('We look after animals until they find a new home. Meet some of our friends!'),
      PIC('dog', '', { w: 35 }), P('<b>Biscuit</b> is a friendly dog who loves long walks.'), PIC('fish', '', { w: 30 }), P('<b>Splash</b> and <b>Bubbles</b> are goldfish looking for a big tank.')]]], W.THEMES.forest),
    answer: p => {
      const pics = blocksOf(p, 0).filter(b => b.t === 'image');
      pics[0].alt = 'A brown dog with floppy ears'; pics[1].alt = 'An orange goldfish';
      blocksOf(p, 0).push(PIC('cat', 'A grey cat sitting down', { w: 30 }), P('<b>Misty</b> is a shy cat who likes a quiet home.'));
    }
  },
  'web-4-links': {
    goals: goals('Hollybrook Museum', [
      { type: 'pages', n: 3, text: 'Add a third page called Rocks' },
      { type: 'link', to: 'page', n: 2, text: 'Make 2 buttons or links that go to other pages' },
      { type: 'check', text: 'Every page can be found (Check my site)' }
    ]),
    starter: () => site('Hollybrook Museum', [
      ['Home', [T('banner', { title: 'Hollybrook Museum', sub: 'Free to visit, every day except Monday' }), P('Come and see the town’s treasures: real fossils, a model of the old mill and our famous rock collection.')]],
      ['Dinosaurs', [H('Dinosaurs'), PIC('mountain', 'A cliff where fossils were found'), P('Fossils of sea creatures were found in the cliffs near Hollybrook 150 years ago.')]]
    ], Object.assign({}, W.THEMES.gold, { nav: 'none' })),
    answer: p => {
      newPage(p, 'Rocks', [H('Rocks'), P('Our rock collection has over 200 rocks, from shiny quartz to crumbly chalk.')]);
      blocksOf(p, 0).push(T('button', { label: 'See the dinosaurs', link: link(p, 1) }), T('button', { label: 'See the rocks', link: link(p, 2) }));
    }
  },
  'web-5-fix': {
    goals: goals('Sports day website: 4 bugs', [
      { type: 'check', strict: true, text: 'Check my site finds nothing at all to fix' },
      { type: 'link', to: 'page', n: 1, text: 'The Results button goes to the Results page' }
    ]),
    starter: () => site('Hollybrook Sports Day', [
      ['Home', [T('banner', { title: 'Sports Day', sub: 'Friday on the school field' }), PIC('football', '', { w: 25 }), P('Everyone takes part in four races. Bring a water bottle and a sun hat!'), T('button', { label: 'Results' })]],
      ['Results', [H('Results'), T('table', { rows: [['Race', 'Winning team'], ['Sack race', 'Blue'], ['Egg and spoon', 'Green'], ['Relay', 'Red']], head: true })]]
    ], { text: '#c7d2e0', nav: 'none' }),
    answer: p => {
      p.site.theme.text = W.DEFAULT_THEME.text; p.site.theme.nav = 'bar';
      const b = blocksOf(p, 0); b.find(x => x.t === 'image').alt = 'A football'; b.find(x => x.t === 'button').link = link(p, 1);
    }
  },
  'web-6-club': {
    goals: goals('Project: a club website', [
      { type: 'named', text: 'Give your website a name' },
      { type: 'pages', n: 3, text: 'At least 3 pages' },
      { type: 'heading', n: 3, text: 'A heading on every page' },
      { type: 'picture', n: 1, alt: true, text: 'A picture with a description' },
      { type: 'link', to: 'page', n: 2, text: '2 buttons or links to your other pages' },
      { type: 'check', text: 'Check my site finds nothing to fix' }
    ]),
    starter: () => site('My website', [['Home', [H('Our club'), P('Write here what your club does.'), PIC('question', '', { w: 25 })]]]),
    answer: p => {
      p.site.title = 'Hollybrook Chess Club';
      newPage(p, 'When we meet', [H('When we meet'), P('Tuesdays at lunchtime in the library.')]);
      newPage(p, 'Our champions', [H('Our champions'), T('list', { items: ['Ava: 12 wins', 'Leo: 10 wins'] })]);
      blocksOf(p, 0).find(b => b.t === 'image').src = 'lib:trophy'; blocksOf(p, 0).find(b => b.t === 'image').alt = 'A gold trophy'; blocksOf(p, 0).push(T('button', { label: 'When we meet', link: link(p, 1) }), T('button', { label: 'Our champions', link: link(p, 2) }));
    }
  },

  // ═══════════════ BLOCK 2 · UNDER THE BONNET (Years 4–5) ═══════════════
  'web-7-code': {
    code: 1,
    goals: goals('Library news: in the code', [
      { type: 'code', n: 1, text: 'Change the page in the Code tab' },
      { type: 'text', has: 'Story time', text: 'The heading says Story time is back!' },
      { type: 'text', has: 'Tuesday', text: 'The paragraph says which day' }
    ]),
    starter: () => site('Hollybrook Library', [['News', [H('Library news'), P('Something exciting is happening at the library this month.'), PIC('book', 'An open book', { w: 25 })]]], W.THEMES.berry),
    answer: p => { const b = blocksOf(p, 0); b[0].text = 'Story time is back!'; b[1].html = 'Story time is every <b>Tuesday</b> at 10am. Bring a grown-up and a cushion.'; }
  },
  'web-8-tags': {
    goals: goals('Crumb & Co: the recipe page', [
      { type: 'blocks', block: 'html', n: 1, text: 'Add a Your own HTML block' },
      { type: 'text', has: 'Ingredients', text: 'A heading that says Ingredients' },
      { type: 'text', has: 'Method', text: 'A heading that says Method' },
      { type: 'words', n: 40, text: 'Write the recipe (at least 40 words on the page)' }
    ]),
    starter: () => site('Crumb & Co', [['Recipe', [H('Fairy cakes'), P('Mr Lindqvist is sharing his famous fairy cake recipe. Write it here in HTML.')]]], W.THEMES.sunset),
    answer: p => {
      blocksOf(p, 0).push(T('html', { html: '<h2>Ingredients</h2><ul><li>100g butter</li><li>100g sugar</li><li>2 eggs</li><li>100g self-raising flour</li></ul><h2>Method</h2><ol><li>Mix the butter and sugar until <b>fluffy</b>.</li><li>Beat in the eggs, then fold in the flour.</li><li>Spoon into 12 cases and bake for 15 minutes.</li></ol>' }));
    }
  },
  'web-9-web': {
    goals: goals('The Roman fact page', [
      { type: 'link', to: 'web', n: 2, text: 'Link to 2 websites you trust' },
      { type: 'text', has: 'facts come from', text: 'A heading: Where our facts come from' },
      { type: 'words', n: 50, text: 'Write 2 facts in your own words' }
    ]),
    starter: () => site('Hollybrook Museum', [['The Romans', [H('The Romans in Hollybrook'), PIC('castle', 'A stone wall', { w: 30 }), P('Roman soldiers built a road through Hollybrook nearly 2000 years ago.')]]], W.THEMES.gold),
    answer: p => {
      blocksOf(p, 0).push(P('The Romans built straight roads so their soldiers could march quickly. Part of the old road is under Market Street today. A Roman coin was found by the river in 1952.'),
        H('Where our facts come from', 2), T('list', { items: ['<a href="https://www.example.org/romans">A museum’s page about Roman roads</a>', '<a href="https://www.example.org/coins">An encyclopedia page about Roman coins</a>'] }));
    }
  },
  'web-10-design': {
    goals: goals('Paws Place: make it easy to read', [
      { type: 'theme', base: { bg: '#ffff66', text: '#ffffff', head: '#ff00ff', accent: '#00ff00', link: '#00ffff', font: 'typewriter' }, text: 'Choose new colours' },
      { type: 'font', base: { font: 'typewriter' }, text: 'Choose a font that is easy to read' },
      { type: 'check', text: 'Check my site: the colours are easy to read' }
    ]),
    starter: () => site('Paws Place', [
      ['Home', [H('Paws Place Animal Rescue'), PIC('dog', 'A happy dog', { w: 30 }), P('We find kind new homes for dogs, cats, rabbits and fish. Come and visit on Saturdays.')]],
      ['Adopt', [H('Adopt a pet'), P('Fill in a form at the front desk and a helper will talk to you about which pet would suit your home.')]]
    ], { bg: '#ffff66', text: '#ffffff', head: '#ff00ff', accent: '#00ff00', link: '#00ffff', font: 'typewriter' }),
    answer: p => { Object.assign(p.site.theme, W.THEMES.forest, { font: 'rounded' }); }
  },
  'web-11-debug': {
    goals: goals('Festival page: 4 bugs', [
      { type: 'check', strict: true, text: 'Check my site finds nothing at all to fix' },
      { type: 'words', page: 2, n: 10, text: 'The empty page has words on it' }
    ]),
    starter: () => site('Hollybrook Festival', [
      ['Home', [H('Hollybrook Festival'), H('Saturday 14 June', 3), P('Music, food and fun on the village green from 10am until 6pm. ' + 'There will be stalls selling cakes, plants, books and toys, and a stage with bands playing all day long. '.repeat(8))]],
      ['Music', [H('Music'), P('Bands play on the main stage every hour.')]],
      ['Music', []]
    ]),
    answer: p => {
      const b = blocksOf(p, 0); b[1].level = 2; b[2].html = 'Music, food and fun on the village green from 10am until 6pm.';
      b.push(P('There will be stalls selling cakes, plants, books and toys.'));
      pageAt(p, 2).name = 'Food'; pageAt(p, 2).blocks = [H('Food'), P('Try pizza, ice cream and fresh fruit from local farms.')];
    }
  },
  'web-12-rescue': {
    code: 1,
    goals: goals('Project: the Paws Place website', [
      { type: 'pages', n: 3, text: 'At least 3 pages' },
      { type: 'picture', n: 3, alt: true, text: '3 pictures with descriptions' },
      { type: 'blocks', block: 'html', n: 1, text: 'Some HTML you wrote yourself' },
      { type: 'link', to: 'web', n: 1, text: 'A link to a trusted website' },
      { type: 'menu', text: 'A menu so visitors can find every page' },
      { type: 'check', text: 'Check my site finds nothing to fix' }
    ]),
    starter: () => site('Paws Place', [['Home', [H('Paws Place Animal Rescue'), P('Ms Ruiz needs a new website. Plan it, then build it!'), PIC('question', '', { w: 25 })]]], W.THEMES.forest),
    answer: p => {
      Object.assign(blocksOf(p, 0).find(b => b.t === 'image'), { src: 'lib:dog', alt: 'A happy dog' });
      newPage(p, 'Our animals', [H('Our animals'), PIC('cat', 'A grey cat'), PIC('bird', 'A blue bird')]);
      newPage(p, 'Help us', [H('Help us'), T('html', { html: '<p>You can help by <b>giving old towels</b> or by <a href="https://www.example.org/pets">reading how to care for a pet</a>.</p>' })]);
    }
  },

  // ═══════════════ BLOCK 3 · WEB DESIGNERS (Years 5–6) ═══════════════
  'web-13-css': {
    goals: goals('The museum’s style rules', [
      { type: 'css', n: 1, text: 'Write a CSS rule for the main heading (h1)' },
      { type: 'css', n: 2, text: 'Write a second rule, for the h2 headings' }
    ]),
    starter: () => site('Hollybrook Museum', [
      ['Home', [H('Hollybrook Museum'), P('Free to visit, every day except Monday.'), H('Opening soon: the mill room', 2), P('A working model of the old water mill.')]],
      ['Visit', [H('Visit us'), P('We are next to the town hall. There is a ramp at the side door.')]]
    ], W.THEMES.gold),
    answer: p => { p.site.css = 'h1 {\n  color: #7a3b10;\n  text-align: center;\n}\nh2 {\n  border-bottom: 3px dotted #ae853e;\n}'; }
  },
  'web-14-classes': {
    goals: goals('Crumb & Co: this week’s specials', [
      { type: 'cls', text: 'Give a block a class name and style it in My CSS' },
      { type: 'css', n: 1, text: 'A CSS rule for your class' }
    ]),
    starter: () => site('Crumb & Co', [['Specials', [H('This week’s specials'),
      T('columns', { cols: [[T('card', { title: 'Cherry tart', html: 'Only on Friday!', src: 'lib:cake', alt: 'A cake' })], [T('card', { title: 'Cheese scones', html: 'Warm from the oven.', src: 'lib:apple', alt: 'An apple' })], [T('card', { title: 'Seeded loaf', html: 'Our best seller.', src: 'lib:star', alt: 'A star' })]] }),
      P('Ask at the counter for today’s prices.')]]], W.THEMES.sunset),
    answer: p => { const c = first(p, 'card'); c.cls = 'special'; p.site.css = '.special {\n  border: 4px solid #ea580c;\n  transform: rotate(-2deg);\n}'; }
  },
  'web-15-data': {
    goals: goals('The library survey', [
      { type: 'blocks', block: 'table', n: 1, text: 'Put the results in a table' },
      { type: 'text', has: 'most popular', text: 'Say which kind of book was the most popular' },
      { type: 'heading', n: 2, text: 'A heading for the results' }
    ]),
    starter: () => site('Hollybrook Library', [['Survey', [H('What do Hollybrook readers like?'),
      P('Mrs Osei asked 60 visitors which kind of book they like best. Here are her notes:'),
      T('quote', { html: 'Adventure 18 · Funny stories 15 · Animals 11 · Mystery 9 · Poetry 4 · Science 3' }),
      P('Turn her notes into a table so visitors can read them easily.')]]], W.THEMES.berry),
    answer: p => {
      blocksOf(p, 0).push(H('The results', 2), T('table', { head: true, rows: [['Kind of book', 'Votes'], ['Adventure', '18'], ['Funny stories', '15'], ['Animals', '11'], ['Mystery', '9'], ['Poetry', '4'], ['Science', '3']] }),
        P('Adventure was the most popular kind of book, with 18 votes out of 60.'));
    }
  },
  'web-16-plan': {
    goals: goals('The sports club website', [
      { type: 'pages', n: 4, text: '4 pages, from your site map' },
      { type: 'heading', n: 4, text: 'A heading on every page' },
      { type: 'menu', text: 'A menu to every page' },
      { type: 'words', n: 60, text: 'At least 60 words across the site' }
    ]),
    starter: () => site('Hollybrook Sports Club', [['Home', [H('Hollybrook Sports Club')]]], W.THEMES.sky),
    answer: p => {
      blocksOf(p, 0).push(P('We are a sports club for children aged 7 to 11. We play football, netball and cricket, and anyone can try a free session.'));
      newPage(p, 'Football', [H('Football'), P('Football is on Monday after school. Bring boots or trainers and shin pads.')]);
      newPage(p, 'Netball', [H('Netball'), P('Netball is on Wednesday after school in the hall when it rains.')]);
      newPage(p, 'Join us', [H('Join us'), P('Ask a grown-up to fill in the form at the school office. The first session is free.')]);
    }
  },
  'web-17-safe': {
    goals: goals('Class 6’s page: safe to publish?', [
      { type: 'text', has: 'Elm Road', not: true, text: 'Remove where Sam lives' },
      { type: 'text', has: '07700', not: true, text: 'Remove the phone number' },
      { type: 'text', has: 'Made by', text: 'Add a line: Made by …' },
      { type: 'check', text: 'Check my site finds nothing to fix' }
    ]),
    starter: () => site('Class 6 news', [['Home', [H('Class 6 news'),
      P('This week Sam won the spelling bee! Sam lives at 14 Elm Road, so pop round and say well done.'),
      P('Want to join the after-school art club? Ring Jo on 07700 900123.'), PIC('palette', '', { w: 25 }),
      P('Our class trip to the museum is on Friday.')]]], W.THEMES.sky),
    answer: p => {
      const b = blocksOf(p, 0);
      b[1].html = 'This week Sam won the spelling bee! Well done, Sam.'; b[2].html = 'Want to join the after-school art club? Ask Mrs Price at the school office.';
      b.find(x => x.t === 'image').alt = 'A paint palette'; b.push(P('Made by Class 6 at Hollybrook Primary.'));
    }
  },
  'web-18-festival': {
    goals: goals('Final project: the Hollybrook Festival', [
      { type: 'named', text: 'Name the website' },
      { type: 'pages', n: 4, text: 'At least 4 pages' },
      { type: 'picture', n: 2, alt: true, text: '2 pictures with descriptions' },
      { type: 'link', to: 'page', n: 3, text: '3 buttons or links between pages' },
      { type: 'link', to: 'web', n: 1, text: 'A link to a trusted website' },
      { type: 'cls', text: 'A class name styled in My CSS' },
      { type: 'css', n: 2, text: 'At least 2 CSS rules' },
      { type: 'check', strict: true, text: 'Check my site finds nothing at all to fix' }
    ]),
    starter: () => site('My website', [['Home', [H('The Hollybrook Festival'), P('Plan your website first: who is it for, and what will they want to know?'), PIC('question', '', { w: 25 })]]]),
    answer: p => {
      p.site.title = 'Hollybrook Festival'; blocksOf(p, 0).splice(blocksOf(p, 0).findIndex(b => b.t === 'image'), 1);
      newPage(p, 'Music', [H('Music'), PIC('music', 'A music note'), P('Bands play on the main stage every hour.')]);
      newPage(p, 'Food', [H('Food'), PIC('cake', 'A birthday cake'), P('Try pizza, ice cream and fresh fruit.')]);
      newPage(p, 'Getting here', [H('Getting here'), P('Take the number 4 bus. <a href="https://www.example.org/bus">See the bus times</a>.')]);
      blocksOf(p, 0).push(T('button', { label: 'Music', link: link(p, 1), cls: 'big' }), T('button', { label: 'Food', link: link(p, 2) }), T('button', { label: 'Getting here', link: link(p, 3) }));
      p.site.css = '.big {\n  font-size: 1.4em;\n}\nh1 {\n  text-align: center;\n}';
    }
  }
};

// a ready Web Lab project for lesson `id`: the starter + its goals (made fresh each time; ids are random)
export function starterProject(id) { const u = UNIT[id]; const p = u.starter(); p.goals = u.goals; return W.cleanProject(p); }
export function answerProject(id, p) { p = JSON.parse(JSON.stringify(p || starterProject(id))); UNIT[id].answer(p); return W.cleanProject(p); }
export function ticks(id, p, codeEdits = 0) { return W.checkGoals(W.cleanGoals(UNIT[id].goals), p, { codeEdits }); }

// make-starters: makeArgs runs in Node, build in the page
export const args = id => ({ project: starterProject(id) });
export const build = async ({ project }) => {
  startNewWeb('ks2');
  for (let i = 0; i < 400 && !(webApp && webApp._proj); i++) await new Promise(r => setTimeout(r, 50));
  webApp.setProject(project);
  document.querySelectorAll('.wl-pop').forEach(x => x.remove());
};
