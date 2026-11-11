// The Web Lab's lesson unit — see lessons/units/README.md. lessons.js merges it in.
// THE HOLLYBROOK WEB TEAM: the class are the web team of Hollybrook, a small market town. Each lesson a place in town asks
// for help with its website: Mrs Osei at Hollybrook Library, Mr Lindqvist at Crumb & Co (the bakery), Ms Ruiz at Paws Place
// (the animal rescue), Dr Haddad at Hollybrook Museum, the sports club and the town festival.
// Block 1 Our first web pages (Years 3–4) · Block 2 Under the bonnet (Years 4–5) · Block 3 Web designers (Years 5–6).
// Lesson 6 of each block is a design-and-make project. The Web Lab is not a programming lab, so the unit follows the
// "create digital content" and "use technology safely" strands, then moves into HTML and CSS (real markup and style rules),
// debugging, data and decomposition (planning a site map). Every starter carries a goals checklist that ticks itself.
// Starters, goals and answers: lessons/builds/web/hollybrook.mjs; test: tests/unit-web.test.mjs.
const N = 'Hollybrook Web Team';
const u = (b, m) => `${N} · Block ${b} · Lesson ${m}`; // m counts 1–18 through the whole unit
const T = { ks: 'ks2', minutes: 60, type: 'web', tool: 'Web Lab' };
const B1 = { ...T, years: 'Years 3–4' }, B2 = { ...T, years: 'Years 4–5' }, B3 = { ...T, years: 'Years 5–6' };
const DEV = ['A device per pupil or pair, with CodeJump open', 'The board, to show the class'];

export const LESSONS = [
  // ═══════════════════════ BLOCK 1 · OUR FIRST WEB PAGES (Years 3–4) ═══════════════════════
  {
    id: 'web-1-tour', unit: u(1, 1), title: 'What is a website?', ...B1,
    summary: 'The class join the Hollybrook Web Team. They explore the library’s website: its pages, the menu and links, then add their own book recommendation to the Home page.',
    objective: 'We are learning what a website is made of and how to add to a web page.',
    success: ['I can say what a web page, a link and a menu are.', 'I can move between pages using links and the menu.', 'I can add words to a web page.'],
    curriculum: ['data', 'safe'],
    words: [['website', 'a set of web pages that link together'], ['web page', 'one page of a website'], ['link', 'words or a button you click to go to another page'], ['menu', 'the row of links to every page of a site'], ['preview', 'see the website the way a visitor sees it']],
    need: [...DEV, 'Optional: a printed screenshot of a real website your class knows'],
    plan: [
      { min: 8, title: 'Welcome to the web team', html: '<p>Tell the class that this term they are the <b>Hollybrook Web Team</b>. Hollybrook is a small market town, and the library, the bakery, the animal rescue and the museum all need help with their websites. <b>Ask:</b> what websites do you use? What is the same about all of them? (Pages, pictures, links, a menu.)</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter (<b>Open the starter</b>). Show the three parts of the Web Lab: <b>Add</b> on the left (things to put on the page), the page itself in the middle, and the settings on the right for the part you click on. Click <b>Preview</b>: this is how a visitor sees the site. Click <b>Opening times</b> in the menu, then come back. Point out the link inside the second paragraph.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: explore every page in Preview, then go back to <b>Design</b> and add a <b>Text</b> block under “Our readers recommend” about a book they like. The goals checklist ticks itself when the new block is there and has at least two sentences.</p><p>Remind them: never put your full name, address or school on a real website.</p>' },
      { min: 10, title: 'Share', html: '<p>Two or three pupils read their recommendation from the Preview. <b>Ask:</b> how did you get from Home to Opening times? (The menu or the link.) What would happen if a page had no link to it?</p>' },
      { min: 7, title: 'Think', html: '<p>On a sticky note: one thing every website has. Collect them on the board. Next lesson: Crumb &amp; Co, the bakery, need their first page.</p>' }
    ],
    support: 'Give a sentence starter: “I recommend … because …”. Pairs can share one device and take turns to type.',
    stretch: 'Make the book’s title bold, or add a second recommendation from a family member (first name only).',
    assess: ['Moves between pages using the menu and a link', 'Explains what a link does', 'Adds a Text block with at least two sentences'],
    steps: [
      { t: 'Meet the library website', d: 'This is Hollybrook Library’s website. The Lesson goals are in the strip at the top.' },
      { t: 'Preview it', d: 'Click Preview at the top. Click Opening times in the menu. Then click What’s on.' },
      { t: 'Follow a link', d: 'Go back to Home. Click the words “opening times” in the second paragraph. Where does it take you?' },
      { t: 'Add a Text block', d: 'Click Design. Click the heading “Our readers recommend”, then click Text in the Add panel on the left.' },
      { t: 'Write a recommendation', d: 'Click the new words and type about a book you like. Write at least 2 sentences. Say why you like it.' },
      { t: 'Check it', d: 'Click Preview to read your page like a visitor. Are both goals ticked?' }
    ]
  },
  {
    id: 'web-2-bakery', unit: u(1, 2), title: 'Headings and words', ...B1,
    summary: 'Crumb & Co, the bakery, has a banner and nothing else. Pupils add headings, paragraphs and a list, and learn why headings help visitors find things.',
    objective: 'We are learning to organise a web page with headings, paragraphs and lists.',
    success: ['I can add a heading to say what a part of the page is about.', 'I can write a paragraph.', 'I can make a list.'],
    curriculum: ['data'],
    words: [['heading', 'a title for one part of the page'], ['paragraph', 'a few sentences about one idea'], ['list', 'things written one under another, with bullets or numbers'], ['block', 'one part of a web page in the Web Lab, like a heading or a picture']],
    need: [...DEV, 'Optional: a bakery menu or leaflet to look at'],
    plan: [
      { min: 8, title: 'Find it fast', html: '<p>Show a page of text with no headings, then the same text with headings. <b>Ask:</b> which one helps you find the opening times fastest? Headings are signposts. Lists are for things that belong together.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter. Mr Lindqvist’s bakery page only has a banner. Click the banner, then <b>Heading</b> in the Add panel: the new heading goes under the block you clicked. Type “Our bread”. Add a <b>Text</b> block under it. Show <b>B</b> and <b>I</b> on the little toolbar.</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card: two headings (Our bread, Our cakes), a paragraph, and a <b>List</b> of three cakes (press Enter in a list for a new line). The goals tick when there are 3 headings (the banner counts), a list and at least 45 words.</p>' },
      { min: 10, title: 'Share', html: '<p>Swap devices with a partner and use Preview. <b>Ask:</b> can you find the cakes in 3 seconds? What made it easy? Next lesson: pictures for the animal rescue.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> when would you use a list instead of a paragraph?</p>' }
    ],
    support: 'Provide the words for the paragraph on a card; pupils focus on choosing the right block.',
    stretch: 'Add a third heading “Opening times” with a numbered list (the 1. Numbers button on the right).',
    assess: ['Adds headings that describe the part under them', 'Writes a paragraph and a list', 'Explains why headings help a reader'],
    steps: [
      { t: 'The bakery page', d: 'Mr Lindqvist’s page only has a banner. Let’s fill it.' },
      { t: 'Add a heading', d: 'Click the banner. Click Heading in the Add panel. Type: Our bread.' },
      { t: 'Add a paragraph', d: 'Click Text in the Add panel. Write 2 sentences about the bread.' },
      { t: 'Cakes!', d: 'Add another heading: Our cakes. Then click List and type 3 cakes. Press Enter for a new line.' },
      { t: 'Make words stand out', d: 'Select a word and press B to make it bold.' },
      { t: 'Check the goals', d: 'Are all 3 goals ticked? Click Preview to see the page like a visitor.' }
    ]
  },
  {
    id: 'web-3-pictures', unit: u(1, 3), title: 'Pictures everyone can enjoy', ...B1,
    summary: 'Paws Place animal rescue has pictures with no descriptions. Pupils learn why alt text matters, describe each picture and add one more animal.',
    objective: 'We are learning to add pictures to a web page and describe them so everyone can enjoy them.',
    success: ['I can add a picture to a web page.', 'I can write a short description (alt text) of a picture.', 'I can use Check my site to find problems.'],
    curriculum: ['data', 'safe'],
    words: [['alt text', 'a short description of a picture, read out to people who can’t see it'], ['screen reader', 'a program that reads a web page out loud'], ['accessible', 'easy for everyone to use']],
    need: [...DEV],
    plan: [
      { min: 8, title: 'Close your eyes', html: '<p>Ask everyone to close their eyes. Describe a picture in one sentence. <b>Ask:</b> could you imagine it? Some people use a <b>screen reader</b> that reads web pages aloud. If a picture has no description, it just says “picture”. That is why we write <b>alt text</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Check my site</b>: it finds two pictures with no description. Click the dog. On the right, type in <b>Description (alt text)</b>: “A brown dog with floppy ears”. Good alt text says what the picture shows in a few words, not “picture of”.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: describe both pictures, add a third <b>Picture</b> (choose the cat on the right) with its own description, and a sentence about the new animal. The goals tick when all 3 pictures have descriptions and Check my site is happy.</p>' },
      { min: 12, title: 'Share', html: '<p>Read some descriptions aloud with eyes closed. Which ones paint the best picture? Next lesson: a museum website that nobody can find their way around.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> who else does alt text help? (People on a slow connection, search engines.)</p>' }
    ],
    support: 'Give a word bank: colour, size, what the animal is doing.',
    stretch: 'Change the size of each picture with the Size slider and add a caption under one.',
    assess: ['Adds a picture from the picture list', 'Writes a clear description for every picture', 'Uses Check my site and acts on what it says'],
    steps: [
      { t: 'Check my site', d: 'Press Check my site at the top. What does it find?' },
      { t: 'Describe the dog', d: 'Click the dog. On the right, type what it shows in Description (alt text).' },
      { t: 'Describe the fish', d: 'Click the fish and describe it too.' },
      { t: 'Add an animal', d: 'Click the last paragraph, then Picture in the Add panel. Choose the cat on the right and describe it.' },
      { t: 'Say something about it', d: 'Add a Text block under the cat: what is its name, and what does it like?' },
      { t: 'Check again', d: 'Press Check my site. Is everything ticked?' }
    ]
  },
  {
    id: 'web-4-links', unit: u(1, 4), title: 'Pages and links', ...B1,
    summary: 'Hollybrook Museum’s website has two pages but no way to get to the second one. Pupils add a page and buttons that link the pages together.',
    objective: 'We are learning to link web pages together so visitors can find their way.',
    success: ['I can add a new page.', 'I can make a button go to another page.', 'I can check that every page can be found.'],
    curriculum: ['design', 'data'],
    words: [['link', 'something you click to go to another page'], ['button', 'a link that looks like a button'], ['navigation', 'how visitors find their way round a website'], ['home page', 'the first page visitors see']],
    need: [...DEV, 'Paper to draw the pages as boxes with arrows'],
    plan: [
      { min: 8, title: 'Lost in the museum', html: '<p>Draw two boxes on the board: Home and Dinosaurs, with no arrow between them. <b>Ask:</b> how does a visitor get to Dinosaurs? Draw the arrow: that is a <b>link</b>. Websites are pages joined by links.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Preview</b>: there is no menu and no link, so the Dinosaurs page can’t be found. Go back to Design, open <b>Pages</b> on the left and press <b>Add a page</b>; call it Rocks. On Home, add a <b>Button</b> and choose a page on the right under <b>Goes to</b>.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: add the Rocks page with a heading and a sentence, then two buttons on Home (one to each page). Test every button in Preview. The goals tick at 3 pages, 2 links and when Check my site says every page can be found.</p>' },
      { min: 12, title: 'Share', html: '<p>Draw one pupil’s site on the board as boxes and arrows (a <b>site map</b>). <b>Ask:</b> what would a menu add? Show the Style panel’s Menu option. Next lesson: a sports day site with four bugs.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> what is the difference between a link and a menu?</p>' }
    ],
    support: 'Pupils do one button first, test it, then copy it (Copy on the right) and change the page.',
    stretch: 'Add a “Back to Home” button on each page, or turn the menu on in Style.',
    assess: ['Adds a new page with content', 'Makes buttons that go to the right pages', 'Tests every link in Preview'],
    steps: [
      { t: 'Can you find it?', d: 'Click Preview. Can a visitor get to the Dinosaurs page? Go back to Design.' },
      { t: 'Add a page', d: 'Click Pages on the left, then Add a page. Call it Rocks.' },
      { t: 'Fill it', d: 'Change the heading to Rocks and add a Text block about rocks.' },
      { t: 'A button', d: 'Go back to the Home page. Add a Button. On the right, choose the Dinosaurs page under Goes to. Change its words.' },
      { t: 'Another button', d: 'Add a second button that goes to Rocks.' },
      { t: 'Test it', d: 'Click Preview and try every button. Press Check my site.' }
    ]
  },
  {
    id: 'web-5-fix', unit: u(1, 5), title: 'Debug the sports day site', ...B1,
    summary: 'The sports day website has four bugs: words you can’t read, a picture with no description, a button that goes nowhere and a page nobody can reach. Pupils predict, test and fix.',
    objective: 'We are learning to find and fix mistakes on a website by testing it.',
    success: ['I can test a website like a visitor.', 'I can find a bug and say what is wrong.', 'I can fix a bug and test again.'],
    curriculum: ['reason', 'data'],
    words: [['bug', 'a mistake that stops something working properly'], ['debug', 'find and fix the bugs'], ['test', 'try it out to see if it works'], ['contrast', 'how different two colours are; words need a strong contrast to be easy to read']],
    need: [...DEV, 'A bug-hunt sheet: 4 rows for Bug, How I found it, How I fixed it'],
    plan: [
      { min: 8, title: 'Bug hunters', html: '<p>Show the starter in Preview. <b>Ask:</b> what is wrong with this website? Collect ideas without fixing. Explain that web designers test their site like a visitor and then use tools like <b>Check my site</b>.</p>' },
      { min: 10, title: 'Show me', html: '<p>Press <b>Check my site</b> and read the first problem: the words are hard to read. Open <b>Style</b> and show the <b>Words</b> colour. Don’t fix it yet. Point out that one bug (the button) is only a tip, so it is easy to miss.</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card and fill in the bug-hunt sheet. The four bugs: pale words (Style → Words colour), a picture with no description, the Results button with no link, and the menu switched off so Results can’t be found (Style → Menu). The goals tick when Check my site finds nothing at all.</p>' },
      { min: 10, title: 'Share', html: '<p><b>Ask:</b> which bug was hardest to find? Which one did you only find by testing? Next lesson: your own club website.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> why test after every fix, not just at the end?</p>' }
    ],
    support: 'Tell pupils where each bug is (Style, the picture, the button) and let them work out the fix.',
    stretch: 'Swap with a partner: add one new bug to their site and see if they can find it.',
    assess: ['Tests the site in Preview before fixing', 'Fixes all four bugs', 'Records how each bug was found'],
    steps: [
      { t: 'Test it', d: 'Click Preview. What is hard to read? What doesn’t work? Write it down.' },
      { t: 'Bug 1: the words', d: 'Click Design, then Style. Change the Words colour to a dark colour.' },
      { t: 'Bug 2: the picture', d: 'Click the football. Give it a description on the right.' },
      { t: 'Bug 3: the button', d: 'Click the Results button. Make it go to the Results page.' },
      { t: 'Bug 4: the lost page', d: 'In Style, turn the Menu on, so visitors can always find Results.' },
      { t: 'Test again', d: 'Press Check my site. Does it find nothing to fix?' }
    ]
  },
  {
    id: 'web-6-club', unit: u(1, 6), title: 'Project: a club website', ...B1,
    summary: 'Pupils plan and build a website for a club in Hollybrook (real or made up): three pages, headings, a described picture and buttons, then test it.',
    objective: 'We are learning to plan, build and test a small website.',
    success: ['I can plan my pages before I build them.', 'I can build pages with headings, words, pictures and links.', 'I can test my site and fix problems.'],
    curriculum: ['design', 'data', 'safe'],
    words: [['plan', 'decide what goes on each page before you build'], ['site map', 'a drawing of the pages and the links between them'], ['audience', 'the people who will visit the website']],
    need: [...DEV, 'A planning sheet: three boxes for three pages, with arrows'],
    plan: [
      { min: 10, title: 'Plan it', html: '<p>Pupils choose a club (chess, gardening, a made-up dragon-spotting club…) and draw a site map: three pages and the buttons between them. <b>Ask:</b> who will visit? What will they want to know first?</p>' },
      { min: 35, title: 'Build it', html: '<p>Pupils build from their plan, following the goals checklist: a name for the site (the title box at the top), 3 pages, a heading on each, a picture with a description (change the question-mark picture), 2 buttons to other pages, and nothing for Check my site to fix. Remind them: first names only, no addresses, no photos of themselves.</p>' },
      { min: 10, title: 'Test and swap', html: '<p>Swap devices. Partners use Preview and try every button, then give one star (something good) and one wish (something to improve).</p>' },
      { min: 5, title: 'Reflect', html: '<p><b>Ask:</b> what did you change after testing? Celebrate the block: next block, we look at the code underneath every web page.</p>' }
    ],
    support: 'Start from two pages and one button; add the third page once those work.',
    stretch: 'Change the colours and font in Style, or add a table of when the club meets.',
    assess: ['Plans pages and links before building', 'Builds a site that meets every goal', 'Acts on feedback from testing'],
    steps: [
      { t: 'Plan', d: 'Draw your 3 pages as boxes and the buttons as arrows. What is your club?' },
      { t: 'Name it', d: 'Click the title at the top left and type your website’s name.' },
      { t: 'Pages', d: 'Add your pages in Pages. Give each one a heading.' },
      { t: 'Picture', d: 'Click the question mark picture. Choose a better one and describe it.' },
      { t: 'Buttons', d: 'Add buttons on the Home page that go to your other pages.' },
      { t: 'Test', d: 'Preview it, try every button and press Check my site.' }
    ]
  },

  // ═══════════════════════ BLOCK 2 · UNDER THE BONNET (Years 4–5) ═══════════════════════
  {
    id: 'web-7-code', unit: u(2, 7), title: 'Peek at the code', ...B2,
    summary: 'Every web page is written in HTML. Pupils open the Code tab, find the tags for the heading and paragraph, and change the library’s news by editing the code.',
    objective: 'We are learning that web pages are written in HTML, and to change a page by editing its code.',
    success: ['I can find the HTML of a web page.', 'I can say what the h1 and p tags do.', 'I can change a page by editing its code.'],
    curriculum: ['data', 'reason'],
    words: [['HTML', 'the language web pages are written in'], ['tag', 'a word in angle brackets, like <h1>, that marks a part of the page'], ['opening and closing tag', '<p> starts a paragraph and </p> ends it'], ['browser', 'the program that turns HTML into the page you see']],
    need: [...DEV],
    plan: [
      { min: 8, title: 'What is underneath?', html: '<p>Show the starter in Design, then click <b>Code</b>. <b>Ask:</b> what do you notice? Point out <code>&lt;h1&gt;Library news&lt;/h1&gt;</code>: an opening tag, the words, a closing tag with a slash. A <b>browser</b> reads these tags to draw the page.</p>' },
      { min: 10, title: 'Show me', html: '<p>Match each block to its tags: <code>h1</code> heading, <code>p</code> paragraph, <code>img</code> picture (and its <code>alt</code>). Change one word inside the <code>h1</code>, click away, and switch back to Design: the page changed. Show what happens if you delete a closing tag: the Web Lab tidies it up and tells you.</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card: in the Code tab, change the heading to “Story time is back!” and the paragraph to say that story time is on Tuesday. Use <code>&lt;b&gt;</code> to make Tuesday bold. The goals tick when the change came from the Code tab.</p>' },
      { min: 7, title: 'Share', html: '<p><b>Ask:</b> what does the slash mean? What does <code>alt</code> do? (Last block’s description!)</p>' },
      { min: 8, title: 'Think', html: '<p>Every website you visit has HTML like this. Next lesson: writing our own HTML from scratch for the bakery.</p>' }
    ],
    support: 'Highlight the words to change on a printout of the code; pupils find the same lines on screen.',
    stretch: 'Add a second paragraph in the code, with its own <p> and </p>.',
    assess: ['Finds the HTML for the heading and the paragraph', 'Explains opening and closing tags', 'Changes the page through the code'],
    steps: [
      { t: 'Look underneath', d: 'Click Code at the top. This is the HTML for the page.' },
      { t: 'Find the heading', d: 'Find <h1>Library news</h1>. The words between the tags are the heading.' },
      { t: 'Change it', d: 'Change Library news to: Story time is back!' },
      { t: 'The paragraph', d: 'Find the <p> line. Change the words to say story time is on Tuesday at 10am.' },
      { t: 'Bold', d: 'Put <b> before Tuesday and </b> after it.' },
      { t: 'See it', d: 'Click Design. Has the page changed? Are the goals ticked?' }
    ]
  },
  {
    id: 'web-8-tags', unit: u(2, 8), title: 'Write your own HTML', ...B2,
    summary: 'Crumb & Co want their fairy cake recipe online. Pupils write it in HTML themselves: headings, a bullet list of ingredients and a numbered method.',
    objective: 'We are learning to write HTML using headings, lists and bold text.',
    success: ['I can write a heading with <h2>.', 'I can make lists with <ul>, <ol> and <li>.', 'I can close every tag I open.'],
    curriculum: ['design', 'data'],
    words: [['<h2>', 'a level 2 heading'], ['<ul> and <ol>', 'a bullet list and a numbered list'], ['<li>', 'one item in a list'], ['nesting', 'putting tags inside other tags, like <li> inside <ul>']],
    need: [...DEV, 'A recipe card (or the one in the lesson) to copy'],
    plan: [
      { min: 8, title: 'Tags inside tags', html: '<p>Write a shopping list on the board, then as HTML: <code>&lt;ul&gt;&lt;li&gt;eggs&lt;/li&gt;&lt;li&gt;flour&lt;/li&gt;&lt;/ul&gt;</code>. Introduce <b>nesting</b>: the list items live inside the list.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter. Click the paragraph, then <b>Your own HTML</b> in the Add panel. On the right, write <code>&lt;h2&gt;Ingredients&lt;/h2&gt;</code> and two list items. Click away: it appears on the page. Change <code>ul</code> to <code>ol</code> and see numbers.</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card and write the recipe: an Ingredients heading and bullet list, a Method heading and numbered list, with one bold word. The goals tick for the HTML block, both headings and at least 40 words.</p>' },
      { min: 10, title: 'Share', html: '<p>Show two recipes in Code view side by side. <b>Ask:</b> where did a missing closing tag cause a problem? Next lesson: linking to other websites, safely.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> when is writing HTML quicker than clicking blocks? When is it slower?</p>' }
    ],
    support: 'Give the HTML skeleton with gaps for the words.',
    stretch: 'Add a quote from Mr Lindqvist using <blockquote>.',
    assess: ['Writes headings and lists in HTML', 'Nests <li> inside <ul>/<ol>', 'Closes the tags they open'],
    steps: [
      { t: 'Your own HTML', d: 'Click the paragraph, then Your own HTML in the Add panel.' },
      { t: 'Ingredients', d: 'On the right, type <h2>Ingredients</h2>' },
      { t: 'A list', d: 'Under it type <ul>, then each ingredient as <li>100g butter</li>, then </ul>.' },
      { t: 'Method', d: 'Add <h2>Method</h2> and a numbered list with <ol> and <li>.' },
      { t: 'Bold', d: 'Make one important word bold with <b> and </b>.' },
      { t: 'Check', d: 'Click away to see the page. Are all the goals ticked?' }
    ]
  },
  {
    id: 'web-9-web', unit: u(2, 9), title: 'Links to the wider web', ...B2,
    summary: 'Dr Haddad wants a Roman fact page that says where its facts come from. Pupils write facts in their own words and link to two websites they trust, after talking about how to tell if a website is reliable.',
    objective: 'We are learning to link to other websites and to choose sources we can trust.',
    success: ['I can write facts in my own words.', 'I can link to another website.', 'I can explain why I trust a source.'],
    curriculum: ['safe', 'data'],
    words: [['source', 'where information comes from'], ['reliable', 'likely to be true'], ['web address (URL)', 'where a page lives on the internet, like https://…'], ['copy', 'taking someone else’s words without saying where they came from']],
    need: [...DEV, 'Two or three trusted web addresses about the Romans, chosen by the teacher (a museum, an encyclopedia for children)'],
    plan: [
      { min: 10, title: 'Can we trust it?', html: '<p>Show two made-up web pages about Romans: one from a museum, one a joke page saying Romans had smartphones. <b>Ask:</b> how can you tell which to trust? Make a checklist: who wrote it, is it up to date, does another source agree, is it trying to sell something?</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter. Add a <b>Text</b> block and write a fact in your own words. Add a heading “Where our facts come from”. Select some words, press the link button on the little toolbar and choose <b>Or a web address</b>; paste one of the trusted addresses. Only <code>https://</code> addresses work.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: two facts in their own words, the sources heading, and two links (to the addresses you give out). In Preview, links to other websites open in a new tab.</p>' },
      { min: 10, title: 'Share', html: '<p><b>Ask:</b> why do we say where facts come from? (Readers can check, and it is fair to the writer.) Next lesson: design that helps every visitor.</p>' },
      { min: 5, title: 'Think', html: '<p>Recap the checklist. Remind pupils to tell an adult if they ever find something online that worries them.</p>' }
    ],
    support: 'Give two facts to rewrite in their own words, and the links ready to copy.',
    stretch: 'Find a fact on one source and check it on another before adding it.',
    assess: ['Writes facts in their own words', 'Adds working links to other websites', 'Gives a reason for trusting a source'],
    steps: [
      { t: 'Find facts', d: 'Read the websites your teacher gives you. Choose 2 facts.' },
      { t: 'Own words', d: 'Add a Text block and write the facts in your own words.' },
      { t: 'Sources heading', d: 'Add a heading: Where our facts come from.' },
      { t: 'Make a link', d: 'Add a List. Type a website’s name, select it and press the link button. Choose Or a web address and paste it.' },
      { t: 'A second link', d: 'Add your second source the same way.' },
      { t: 'Test', d: 'Click Preview and try both links.' }
    ]
  },
  {
    id: 'web-10-design', unit: u(2, 10), title: 'Design for your visitors', ...B2,
    summary: 'Paws Place’s colours are bright and hard to read. Pupils learn about contrast and readable fonts, redesign the site with the Style panel and check it on a phone-sized screen.',
    objective: 'We are learning to choose colours and fonts that make a website easy to read for everyone.',
    success: ['I can explain why contrast matters.', 'I can change a site’s colours and font.', 'I can check my site on different screen sizes.'],
    curriculum: ['design', 'data'],
    words: [['contrast', 'how different two colours are'], ['font', 'the style of the letters'], ['readable', 'easy to read'], ['responsive', 'a site that works on big and small screens']],
    need: [...DEV, 'Coloured paper and pens for a quick contrast test'],
    plan: [
      { min: 8, title: 'Can you read it?', html: '<p>Hold up yellow writing on white paper, then black on white. <b>Ask:</b> which can you read from the back? That difference is <b>contrast</b>. Some people find low contrast very hard to read.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Check my site</b>. Open <b>Style</b>: show the <b>Colour sets</b>, then each colour and the Font. In Preview, click the phone button to see the site at phone width.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: choose new colours (a colour set, then their own tweaks), a font that is easy to read, and keep going until Check my site is happy. Then check it at phone width.</p>' },
      { min: 12, title: 'Share', html: '<p>Gallery walk with the sites in Preview. <b>Ask:</b> which design suits an animal rescue? Why? Next lesson: debugging a festival page.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> why is a fancy font not always a good choice?</p>' }
    ],
    support: 'Start from a colour set and change just one colour.',
    stretch: 'Change the page width and corners, and explain who the design is for.',
    assess: ['Explains contrast', 'Chooses readable colours and font', 'Tests the site at a small screen size'],
    steps: [
      { t: 'Is it easy to read?', d: 'Press Check my site. What does it say about the colours?' },
      { t: 'Colour sets', d: 'Click Style on the left. Try some Colour sets.' },
      { t: 'Your own colours', d: 'Change one colour by clicking it. Keep the words dark on a light background, or light on dark.' },
      { t: 'Font', d: 'Choose a font that is easy to read.' },
      { t: 'Check', d: 'Press Check my site until it finds nothing to fix.' },
      { t: 'Phone size', d: 'Click Preview, then the phone button. Does it still look good?' }
    ]
  },
  {
    id: 'web-11-debug', unit: u(2, 11), title: 'Debug the festival page', ...B2,
    summary: 'The festival website has four bugs that are harder to spot: a heading that skips a level, a very long paragraph, an empty page and two pages with the same name. Pupils use Check my site and the Code tab to fix them.',
    objective: 'We are learning to use tools and the code to find and fix less obvious bugs.',
    success: ['I can use Check my site to find bugs.', 'I can read the code to understand a bug.', 'I can fix every bug and test again.'],
    curriculum: ['reason'],
    words: [['heading level', 'h1 is the main heading, h2 a part, h3 a smaller part; don’t skip one'], ['structure', 'how a page is organised'], ['tip', 'something that would make the site better']],
    need: [...DEV, 'The bug-hunt sheet from Lesson 5'],
    plan: [
      { min: 8, title: 'Hidden bugs', html: '<p>Remind the class of sports day: those bugs were easy to see. Today’s are hidden: a visitor might not notice, but a <b>screen reader</b> user would, because it jumps between headings by level.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter and press <b>Check my site</b>: some lines are warnings, some are tips. Open <b>Code</b> and find <code>&lt;h3&gt;</code> straight after <code>&lt;h1&gt;</code>. <b>Ask:</b> what should it be?</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card: the h3 becomes h2 (in Code, or the heading size on the right), the long paragraph is cut down and split, the empty third page gets a name (Food) and content. The goals tick when Check my site finds nothing at all, tips included.</p>' },
      { min: 10, title: 'Share', html: '<p><b>Ask:</b> which bug would a visitor notice? Which would only a screen reader user notice? Next lesson: the Paws Place project.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> why is “it looks fine to me” not enough testing?</p>' }
    ],
    support: 'Fix the bugs as a class one at a time, with pupils doing each on their own device.',
    stretch: 'Look at the Code tab of another page and explain what each tag does.',
    assess: ['Uses Check my site to locate bugs', 'Explains the heading-level bug from the code', 'Fixes all bugs and retests'],
    steps: [
      { t: 'Find the bugs', d: 'Press Check my site. Write down every warning and tip.' },
      { t: 'Heading levels', d: 'Click Code. Find <h3>. It comes after <h1>, so change it to <h2> (and </h2>).' },
      { t: 'Too long', d: 'The paragraph says the same thing over and over. Cut it down to 2 short paragraphs.' },
      { t: 'The empty page', d: 'Open the third page. Rename it Food in Pages, and add a heading and some words.' },
      { t: 'Check again', d: 'Press Check my site. Does it find nothing at all?' }
    ]
  },
  {
    id: 'web-12-rescue', unit: u(2, 12), title: 'Project: the Paws Place website', ...B2,
    summary: 'Ms Ruiz needs a full website. Pupils plan and build three pages using blocks and their own HTML, with described pictures, a link to a trusted website and a menu.',
    objective: 'We are learning to combine design, HTML and safe linking to build a website for a real purpose.',
    success: ['I can plan a website for an audience.', 'I can use blocks and my own HTML.', 'I can test my site and make it easy to use.'],
    curriculum: ['design', 'data', 'safe'],
    words: [['purpose', 'what the website is for'], ['audience', 'who will use it'], ['evaluate', 'decide how well it works and what to improve']],
    need: [...DEV, 'Planning sheet: purpose, audience, site map'],
    plan: [
      { min: 10, title: 'Plan it', html: '<p>Pupils fill in the planning sheet: what is the site for (find homes for animals), who visits (families), which pages (Home, Our animals, Help us…).</p>' },
      { min: 35, title: 'Build it', html: '<p>Pupils build from their plan with the goals checklist: 3 pages, 3 described pictures, a Your own HTML block, a link to a trusted website, the menu on and nothing for Check my site to fix.</p>' },
      { min: 10, title: 'Test and swap', html: '<p>Partners test each other’s site in Preview at computer and phone size and give a star and a wish.</p>' },
      { min: 5, title: 'Reflect', html: '<p><b>Ask:</b> what did you add with HTML that blocks couldn’t do as easily? Next block: style rules with CSS.</p>' }
    ],
    support: 'Use a ready site map with page names filled in.',
    stretch: 'Add a table of opening times and a quote from a happy family.',
    assess: ['Plans for an audience', 'Combines blocks and HTML', 'Tests and improves the site'],
    steps: [
      { t: 'Plan', d: 'Who is the site for? Draw your pages and links.' },
      { t: 'Pages', d: 'Add your pages. Give each a heading.' },
      { t: 'Pictures', d: 'Change the question mark picture and add 2 more. Describe them all.' },
      { t: 'HTML', d: 'Add a Your own HTML block and write part of a page yourself.' },
      { t: 'A trusted link', d: 'Link to a website your teacher says is safe, like one about caring for pets.' },
      { t: 'Test', d: 'Check the Menu is on in Style, Preview it and press Check my site.' }
    ]
  },

  // ═══════════════════════ BLOCK 3 · WEB DESIGNERS (Years 5–6) ═══════════════════════
  {
    id: 'web-13-css', unit: u(3, 13), title: 'Style rules with CSS', ...B3,
    summary: 'Dr Haddad wants the museum’s headings to look special on every page. Pupils write CSS rules (selector, property, value) in My CSS and see one rule change many places at once.',
    objective: 'We are learning to write CSS rules that style every page of a website.',
    success: ['I can write a CSS rule with a selector, a property and a value.', 'I can explain why one rule changes many places.', 'I can fix a CSS rule that doesn’t work.'],
    curriculum: ['design', 'data'],
    words: [['CSS', 'the language that says how a web page looks'], ['selector', 'which parts a rule is for, like h1'], ['property', 'what to change, like color'], ['value', 'what to change it to, like red']],
    need: [...DEV, 'A CSS card: color, background-color, text-align, font-size, border'],
    plan: [
      { min: 8, title: 'One rule, many places', html: '<p>Write on the board: <code>h1 { color: red; }</code>. <b>Ask:</b> what do you think it does? HTML says what things <i>are</i>; CSS says how they <i>look</i>. One rule styles every h1 on every page.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter, click <b>Code</b> and find <b>My CSS</b>. Type the h1 rule and wait a moment: both pages change. Make a deliberate mistake (forget the colon) and show the note that says the rule was skipped.</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card: a rule for h1 (colour and centred), a rule for h2 (a border-bottom). Use the CSS card for properties. Check both pages in Preview.</p>' },
      { min: 10, title: 'Share', html: '<p><b>Ask:</b> what would happen with 50 pages if we styled each heading by hand? Next lesson: classes, to style just some things.</p>' },
      { min: 5, title: 'Think', html: '<p>Label a rule on the board: selector, property, value.</p>' }
    ],
    support: 'Give the first rule complete; pupils change only the value.',
    stretch: 'Style the paragraphs (p) and the buttons (.btn) too.',
    assess: ['Writes valid CSS rules', 'Explains selector, property and value', 'Debugs a rule that doesn’t apply'],
    steps: [
      { t: 'Find My CSS', d: 'Click Code. Find the My CSS box.' },
      { t: 'First rule', d: 'Type: h1 { color: darkred; text-align: center; }' },
      { t: 'Look', d: 'Click Design. Is the heading different? Check the Visit page too.' },
      { t: 'Second rule', d: 'In My CSS, add a rule for h2. Try border-bottom: 3px dotted orange;' },
      { t: 'Debug', d: 'If a rule does nothing, check the colons, the semicolons and the curly brackets.' }
    ]
  },
  {
    id: 'web-14-classes', unit: u(3, 14), title: 'Classes: style just one thing', ...B3,
    summary: 'Crumb & Co want this week’s special to stand out from the other cards. Pupils give one block a class name and write a CSS rule for that class.',
    objective: 'We are learning to use classes to style chosen parts of a page.',
    success: ['I can give a block a class name.', 'I can write a CSS rule for a class (with a dot).', 'I can explain the difference between styling h2 and styling .special.'],
    curriculum: ['design', 'reason'],
    words: [['class', 'a name you give to some parts so CSS can style just those'], ['.special', 'a selector for everything with the class special (note the dot)'], ['reuse', 'use the same class on more than one thing']],
    need: [...DEV],
    plan: [
      { min: 8, title: 'Just one', html: '<p><b>Ask:</b> last time h1 changed every heading. What if we want only ONE card to stand out? Give it a name: a <b>class</b>. In CSS, a dot means “a class”.</p>' },
      { min: 10, title: 'Show me', html: '<p>Open the starter, click the Cherry tart card. On the right open <b>Class name (for your own CSS)</b> and type <code>special</code>. In <b>Code</b> → My CSS write <code>.special { border: 4px solid orange; }</code>. Look at the HTML: the card now says <code>class="card special"</code>.</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card, then experiment: rotate the card a little (<code>transform: rotate(-2deg)</code>), change its background, reuse the class on a second block.</p>' },
      { min: 10, title: 'Share', html: '<p><b>Ask:</b> what is the difference between <code>h2 {…}</code> and <code>.special {…}</code>? Next lesson: putting data on a web page.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> why are good class names words that describe the job, like special or warning?</p>' }
    ],
    support: 'Write the CSS rule together; pupils only add the class name.',
    stretch: 'Make a second class, like .sold-out, and use both.',
    assess: ['Adds a class name to a block', 'Writes a class rule with a dot', 'Explains when to use a class instead of a tag'],
    steps: [
      { t: 'Choose the special', d: 'Click the Cherry tart card.' },
      { t: 'Name it', d: 'On the right, open Class name and type: special' },
      { t: 'Write the rule', d: 'Click Code. In My CSS type: .special { border: 4px solid orange; }' },
      { t: 'Look', d: 'Click Design. Only the Cherry tart card has the border!' },
      { t: 'Experiment', d: 'Add more to the rule, like background-color or transform: rotate(-2deg);' }
    ]
  },
  {
    id: 'web-15-data', unit: u(3, 15), title: 'Data on a web page', ...B3,
    summary: 'Mrs Osei surveyed 60 library visitors. Pupils turn her notes into a table, order it, and write a conclusion so visitors understand the results.',
    objective: 'We are learning to present data clearly on a web page and write a conclusion from it.',
    success: ['I can put data into a table with headings.', 'I can order data to make it easier to read.', 'I can write a conclusion from the data.'],
    curriculum: ['data'],
    words: [['data', 'facts and numbers collected to answer a question'], ['table', 'data in rows and columns'], ['conclusion', 'what the data tells us'], ['survey', 'asking people the same question to collect data']],
    need: [...DEV],
    plan: [
      { min: 8, title: 'Notes or table?', html: '<p>Show Mrs Osei’s notes (the quote in the starter). <b>Ask:</b> which kind of book was most popular? How long did it take you? A table makes data quicker to read.</p>' },
      { min: 10, title: 'Show me', html: '<p>Add a <b>Table</b> block. On the right use <b>+ Row</b> and <b>+ Column</b>; tick <b>The first row is headings</b>. Type into the cells on the page. In Code, find <code>&lt;table&gt;</code>, <code>&lt;tr&gt;</code> and <code>&lt;td&gt;</code>.</p>' },
      { min: 27, title: 'Your turn', html: '<p>Pupils follow the Lesson card: a heading, a table of all six kinds of book in order of votes, and a sentence saying which was the most popular and how many votes it had.</p>' },
      { min: 10, title: 'Share', html: '<p><b>Ask:</b> what else could the library do with this data? (Buy more adventure books!) Next lesson: planning a bigger website.</p>' },
      { min: 5, title: 'Think', html: '<p><b>Ask:</b> is 60 visitors enough to be sure? What would make the survey fairer?</p>' }
    ],
    support: 'Give a table that is already the right size; pupils fill in the cells.',
    stretch: 'Add a column for the percentage of votes, or style the table with CSS (td { padding: 8px; }).',
    assess: ['Builds a correct table with a header row', 'Orders the data', 'Writes a conclusion supported by the data'],
    steps: [
      { t: 'Read the notes', d: 'Read Mrs Osei’s survey notes on the page.' },
      { t: 'Heading', d: 'Add a heading under the last paragraph: The results.' },
      { t: 'Table', d: 'Add a Table. Use + Row on the right until there is a row for each kind of book, plus one for the headings.' },
      { t: 'Fill it', d: 'Type Kind of book and Votes in the top row, then the data from the most votes to the fewest.' },
      { t: 'Conclusion', d: 'Add a Text block: which kind of book was the most popular? How many votes?' }
    ]
  },
  {
    id: 'web-16-plan', unit: u(3, 16), title: 'Plan a website', ...B3,
    summary: 'The sports club needs a website with four pages. Pupils decompose the job: who visits, what they need, a site map, then build the pages from the plan.',
    objective: 'We are learning to decompose a website into pages and plan it before building.',
    success: ['I can work out what visitors need.', 'I can draw a site map.', 'I can build a site that matches my plan.'],
    curriculum: ['design'],
    words: [['decompose', 'break a big job into smaller parts'], ['site map', 'a drawing of the pages and links'], ['wireframe', 'a quick sketch of what goes where on a page']],
    need: [...DEV, 'A3 paper for site maps and wireframes'],
    plan: [
      { min: 12, title: 'Who visits?', html: '<p>Brainstorm who would visit a sports club site (children, parents, a new coach) and what each wants to know. Group the needs into pages: that is <b>decomposing</b> the website.</p>' },
      { min: 10, title: 'Site map and wireframe', html: '<p>Pairs draw a site map with four pages, then a quick wireframe of the Home page: boxes for the heading, a picture, buttons.</p>' },
      { min: 28, title: 'Build it', html: '<p>Pupils build from their plan with the goals checklist: 4 pages, a heading on each, the menu on, and at least 60 words across the site.</p>' },
      { min: 10, title: 'Compare', html: '<p><b>Ask:</b> did your site match your plan? What changed and why? Next lesson: being a responsible web author.</p>' }
    ],
    support: 'Provide the four page names; pupils plan what goes on each.',
    stretch: 'Add a page of match results as a table and link to it from Home.',
    assess: ['Identifies visitors’ needs', 'Draws a site map and a wireframe', 'Builds pages that match the plan'],
    steps: [
      { t: 'Who visits?', d: 'List who will visit the sports club site and what they want to know.' },
      { t: 'Site map', d: 'Draw 4 pages as boxes. Join them with arrows.' },
      { t: 'Pages', d: 'Add your pages in Pages. Name them from your site map.' },
      { t: 'Headings and words', d: 'Give each page a heading and write what visitors need.' },
      { t: 'Menu', d: 'Check the Menu is on in Style. Preview and try it.' }
    ]
  },
  {
    id: 'web-17-safe', unit: u(3, 17), title: 'A responsible web author', ...B3,
    summary: 'Class 6 wrote a news page, but it shares where someone lives and a phone number. Pupils find the personal information, remove it, describe pictures and add a credit line before it can be published.',
    objective: 'We are learning to publish online safely, respectfully and responsibly.',
    success: ['I can spot personal information that shouldn’t be online.', 'I can change a page so it is safe to publish.', 'I can say who to tell if I see something worrying online.'],
    curriculum: ['safe'],
    words: [['personal information', 'things that identify you, like your address, phone number or school'], ['publish', 'put something where other people can see it'], ['permission', 'asking before sharing something about someone'], ['credit', 'saying who made something']],
    need: [...DEV, 'Your school’s online safety rules'],
    plan: [
      { min: 10, title: 'Would you share it?', html: '<p>Read out statements: “My favourite colour is blue”, “I live at 14 Elm Road”, “My phone number is…”. Pupils show thumbs up (fine to share) or down. Talk about <b>personal information</b> and <b>permission</b>.</p>' },
      { min: 8, title: 'Show me', html: '<p>Open the starter and read it together. <b>Ask:</b> is this page ready to publish? Find the address and the phone number. Click the paragraph and edit the words on the page.</p>' },
      { min: 25, title: 'Your turn', html: '<p>Pupils follow the Lesson card: remove the address and the phone number (a safe way to contact the art club is to ask at the school office), describe the picture, and add a line saying who made the page. The goals tick when it is safe to publish.</p>' },
      { min: 12, title: 'Talk', html: '<p>Discuss: what if someone posts something unkind about another person? Who can you tell? (A trusted adult, your teacher, the report button on a website.)</p>' },
      { min: 5, title: 'Think', html: '<p>Each pupil writes one rule for safe publishing. Next lesson: the final project.</p>' }
    ],
    support: 'Highlight the sentences to check on a printout.',
    stretch: 'Write a short “Our rules for this website” page for the class site.',
    assess: ['Identifies personal information', 'Edits the page to make it safe', 'Names ways to report concerns'],
    steps: [
      { t: 'Read it', d: 'Read Class 6’s page. Would you be happy if this was about you?' },
      { t: 'The address', d: 'Click the first paragraph. Take out where Sam lives.' },
      { t: 'The phone number', d: 'Click the second paragraph. Remove the phone number. Say to ask at the school office instead.' },
      { t: 'The picture', d: 'Describe the picture on the right.' },
      { t: 'Credit', d: 'Add a Text block: Made by Class 6.' },
      { t: 'Check', d: 'Press Check my site. Is the page safe to publish?' }
    ]
  },
  {
    id: 'web-18-festival', unit: u(3, 18), title: 'Final project: the Hollybrook Festival', ...B3,
    summary: 'The town festival needs its website. Pupils use everything from the unit: a planned site with four pages, described pictures, links between pages and to a trusted site, a class styled in CSS, and nothing for Check my site to fix.',
    objective: 'We are learning to plan, build, test and evaluate a complete website.',
    success: ['I can plan a website for an audience.', 'I can use pages, links, HTML and CSS together.', 'I can test my website and improve it from feedback.'],
    curriculum: ['design', 'data', 'safe'],
    words: [['evaluate', 'judge how well something works'], ['feedback', 'what others think, to help you improve'], ['publish', 'share your finished work']],
    need: [...DEV, 'Planning sheet and site map from Lesson 16'],
    plan: [
      { min: 10, title: 'Plan', html: '<p>Pupils plan the festival site: audience, four pages, site map, a wireframe of Home and one idea for their own CSS class.</p>' },
      { min: 35, title: 'Build', html: '<p>Pupils build with the goals checklist: a name, 4 pages, 2 described pictures, 3 links between pages, a link to a trusted website, a class styled in My CSS, 2 CSS rules and nothing at all for Check my site to fix.</p>' },
      { min: 10, title: 'Test and feedback', html: '<p>Partners test at computer and phone size and give a star and a wish. Pupils make one improvement. They can download the finished site as one file (<b>Download</b>) or hand it in.</p>' },
      { min: 5, title: 'Celebrate', html: '<p>Show a few sites on the board. <b>Ask:</b> what is the most important thing you learned about making websites this year?</p>' }
    ],
    support: 'Reduce to three pages and one CSS rule.',
    stretch: 'Make the site work for a second audience (for example, a page for visitors who use a wheelchair, with accessibility information).',
    assess: ['Plans for an audience', 'Combines pages, HTML and CSS', 'Tests, takes feedback and improves'],
    steps: [
      { t: 'Plan', d: 'Plan your 4 pages and what each one is for.' },
      { t: 'Name and pages', d: 'Name your site and add the pages.' },
      { t: 'Content', d: 'Add headings, words and 2 pictures with descriptions. Change the question mark picture.' },
      { t: 'Links', d: 'Add buttons between your pages, and one link to a trusted website.' },
      { t: 'Style', d: 'Give a block a class name, then write 2 rules in My CSS.' },
      { t: 'Test', d: 'Preview it at phone size and press Check my site until it finds nothing at all.' }
    ]
  }
];

const S = (t, o) => Object.assign({ t }, o);
export const SLIDES = {
  'web-1-tour': [
    S('Welcome to the Hollybrook Web Team', { lead: 'The library, the bakery, the animal rescue and the museum all need our help with their websites.', notes: 'Introduce the unit story: this term the class are the web team for the small town of Hollybrook.' }),
    S('What is a website?', { b: ['Web pages', 'Links between them', 'A menu to every page', 'Pictures and words'], q: 'What websites do you use?', notes: 'Collect examples. Every website, big or small, is made of pages joined by links.' }),
    S('The Web Lab', { pic: true, b: ['Add: things to put on the page', 'The page: click to change it', 'Preview: see it like a visitor'], notes: 'Open the starter on the board and point to each part.' }),
    { use: 'steps' },
    S('Stay safe', { lead: 'Never put your full name, address or school on a real website.', notes: 'A short reminder that runs all through the unit.' })
  ],
  'web-2-bakery': [
    S('Signposts', { q: 'Which page helps you find the cakes fastest?', b: ['Headings say what each part is about', 'Paragraphs are a few sentences about one idea', 'Lists are for things that belong together'], notes: 'Show a page with and without headings.' }),
    S('Crumb & Co', { pic: true, lead: 'Mr Lindqvist’s bakery page only has a banner.', notes: 'Show how a new block goes under the one you clicked.' }),
    { use: 'steps' },
    S('Find it in 3 seconds', { q: 'Can your partner find the cakes on your page in 3 seconds?', notes: 'Swap devices and test each other’s pages in Preview.' })
  ],
  'web-3-pictures': [
    S('Close your eyes', { lead: 'A screen reader reads web pages out loud.', q: 'If a picture has no description, what does it read?', notes: 'Describe a picture in one sentence while the class have their eyes closed.' }),
    S('Good alt text', { b: ['Says what the picture shows', 'A few words, not a story', 'No need to say “picture of”'], table: [['Not so good', 'Better'], ['dog', 'A brown dog with floppy ears'], ['picture of a fish', 'An orange goldfish']], notes: 'Compare the examples.' }),
    S('Paws Place', { pic: true, notes: 'Press Check my site on the board: two pictures need descriptions.' }),
    { use: 'steps' },
    S('Who else does it help?', { q: 'Who else is helped by alt text?', notes: 'People on slow connections, search engines, anyone when a picture fails to load.' })
  ],
  'web-4-links': [
    S('Lost in the museum', { q: 'How does a visitor get to the Dinosaurs page?', notes: 'Draw two boxes with no arrow between them, then add the arrow: a link.' }),
    S('Pages and links', { b: ['Pages → Add a page', 'A Button can go to another page', 'Test every link in Preview'], pic: true, notes: 'Demonstrate adding the Rocks page and the first button.' }),
    { use: 'steps' },
    S('Site map', { lead: 'A site map shows the pages as boxes and the links as arrows.', notes: 'Draw one pupil’s site as a site map.' })
  ],
  'web-5-fix': [
    S('Bug hunters', { pic: true, q: 'What is wrong with this website?', notes: 'Collect ideas before fixing anything.' }),
    S('Four bugs', { b: ['Words that are hard to read', 'A picture with no description', 'A button that goes nowhere', 'A page nobody can find'], notes: 'Pupils record how they found and fixed each one.' }),
    { use: 'steps' },
    S('Test after every fix', { q: 'Why test after every fix and not just at the end?', notes: 'One fix can cause a new bug; testing as you go finds it straight away.' })
  ],
  'web-6-club': [
    S('Your club website', { lead: 'Plan it, build it, test it.', notes: 'Pupils choose a real or made-up club.' }),
    S('Your goals', { b: ['A name for the website', '3 pages, each with a heading', 'A picture with a description', '2 buttons to other pages', 'Nothing for Check my site to fix'], notes: 'The goals strip in the Web Lab ticks these off.' }),
    { use: 'steps' },
    S('Star and wish', { lead: 'One star (something good) and one wish (something to improve).', notes: 'Partners test each other’s sites.' })
  ],
  'web-7-code': [
    S('What is underneath?', { code: '<h1>Library news</h1>\n<p>Something exciting is happening…</p>', notes: 'Every web page is written in HTML. The browser reads the tags and draws the page.' }),
    S('Tags', { b: ['<h1> … </h1> the main heading', '<p> … </p> a paragraph', '<img alt="…"> a picture and its description', 'The slash means “end here”'], notes: 'Match each block on the page to its tags.' }),
    S('Story time', { pic: true, lead: 'Change the news through the Code tab.', notes: 'Demonstrate changing one word, then switch back to Design.' }),
    { use: 'steps' }
  ],
  'web-8-tags': [
    S('Tags inside tags', { code: '<ul>\n  <li>eggs</li>\n  <li>flour</li>\n</ul>', notes: 'The list items live inside the list: nesting.' }),
    S('Lists', { table: [['Tag', 'What it makes'], ['<ul>', 'a bullet list'], ['<ol>', 'a numbered list'], ['<li>', 'one item'], ['<h2>', 'a heading']], notes: 'Pupils will need all four.' }),
    { use: 'steps' },
    S('Blocks or code?', { q: 'When is writing HTML quicker than clicking blocks?', notes: 'Discuss: lists of many items, copying, exact control.' })
  ],
  'web-9-web': [
    S('Can we trust it?', { b: ['Who wrote it?', 'Is it up to date?', 'Does another source agree?', 'Is it trying to sell you something?'], notes: 'Compare a museum page with a joke page.' }),
    S('Own words and sources', { lead: 'Write facts in your own words, and say where they came from.', notes: 'Copying someone’s words without saying so isn’t fair, and readers can’t check.' }),
    { use: 'steps' },
    S('If something worries you', { lead: 'Tell a trusted adult.', notes: 'Remind pupils of the school’s online safety rules.' })
  ],
  'web-10-design': [
    S('Contrast', { q: 'Which can you read from the back of the room?', notes: 'Yellow on white vs black on white.' }),
    S('Paws Place', { pic: true, q: 'Is this easy to read?', notes: 'Press Check my site: the colours are hard to read.' }),
    S('Design for everyone', { b: ['Dark words on light, or light on dark', 'A font that is easy to read', 'Check it at phone size'], notes: 'Show the phone button in Preview.' }),
    { use: 'steps' }
  ],
  'web-11-debug': [
    S('Hidden bugs', { lead: 'Some bugs only show up for some visitors.', notes: 'Screen reader users jump between headings by level, so a skipped level is confusing.' }),
    S('Heading levels', { code: '<h1>Hollybrook Festival</h1>\n<h3>Saturday 14 June</h3>', q: 'What is wrong?', notes: 'An h3 straight after an h1 skips a level: it should be h2.' }),
    { use: 'steps' },
    S('Is “it looks fine” enough?', { q: 'Why isn’t “it looks fine to me” enough testing?', notes: 'Use tools, the code and other people to test.' })
  ],
  'web-12-rescue': [
    S('Paws Place needs a website', { lead: 'Purpose: find homes for animals. Audience: families.', notes: 'Pupils fill in the planning sheet.' }),
    S('Your goals', { b: ['3 pages', '3 described pictures', 'Your own HTML', 'A link to a trusted website', 'A menu', 'Nothing for Check my site to fix'], notes: 'The goals strip ticks these off.' }),
    { use: 'steps' },
    S('Star and wish', { lead: 'Test at computer and phone size.', notes: 'Partners give feedback.' })
  ],
  'web-13-css': [
    S('HTML and CSS', { b: ['HTML says what things are', 'CSS says how they look'], code: 'h1 {\n  color: darkred;\n  text-align: center;\n}', notes: 'One rule styles every h1 on every page.' }),
    S('Parts of a rule', { table: [['Part', 'Example'], ['selector', 'h1'], ['property', 'color'], ['value', 'darkred']], notes: 'Label a rule on the board.' }),
    { use: 'steps' },
    S('50 pages', { q: 'What if the museum had 50 pages?', notes: 'CSS saves styling each one by hand.' })
  ],
  'web-14-classes': [
    S('Just one card', { q: 'How do we make only ONE card stand out?', notes: 'Give it a class name.' }),
    S('Classes', { code: '.special {\n  border: 4px solid orange;\n}', b: ['The dot means “a class”', 'Give a block the class in Class name'], notes: 'The HTML shows class="card special".' }),
    { use: 'steps' },
    S('h2 or .special?', { q: 'What is the difference between h2 { } and .special { }?', notes: 'A tag rule styles all of that tag; a class rule styles only what you choose.' })
  ],
  'web-15-data': [
    S('Mrs Osei’s survey', { lead: 'Adventure 18 · Funny stories 15 · Animals 11 · Mystery 9 · Poetry 4 · Science 3', q: 'Which was the most popular?', notes: 'How long did it take to find out?' }),
    S('Tables', { table: [['Kind of book', 'Votes'], ['Adventure', '18'], ['Funny stories', '15']], notes: 'Rows and columns, with a header row, are quicker to read.' }),
    { use: 'steps' },
    S('Is it fair?', { q: 'Is 60 visitors enough to be sure?', notes: 'Discuss sample size and who was asked.' })
  ],
  'web-16-plan': [
    S('Decompose', { lead: 'A big website is lots of small pages.', q: 'Who would visit a sports club website, and what do they need?', notes: 'Group the needs into pages.' }),
    S('Site map and wireframe', { b: ['Site map: pages and links', 'Wireframe: what goes where on a page'], notes: 'Pairs draw both on A3.' }),
    { use: 'steps' },
    S('Plan vs build', { q: 'Did your site match your plan?', notes: 'Changing the plan for a good reason is fine.' })
  ],
  'web-17-safe': [
    S('Would you share it?', { b: ['My favourite colour', 'My address', 'My phone number', 'A photo of a friend'], notes: 'Thumbs up or down for each.' }),
    S('Class 6 news', { pic: true, q: 'Is this page ready to publish?', notes: 'Find the address and the phone number together.' }),
    { use: 'steps' },
    S('Who can you tell?', { b: ['A trusted adult', 'Your teacher', 'The report button on a website'], notes: 'What to do if you see something worrying or unkind online.' })
  ],
  'web-18-festival': [
    S('The Hollybrook Festival', { lead: 'Your final website: plan, build, test, improve.', notes: 'Pupils use their Lesson 16 planning sheet.' }),
    S('Your goals', { b: ['4 pages and a name', '2 described pictures', 'Links between pages and to a trusted site', 'A class and 2 CSS rules', 'Nothing for Check my site to fix'], notes: 'The goals strip ticks these off.' }),
    { use: 'steps' },
    S('Hollybrook Web Team!', { b: ['Pages, links and pictures', 'HTML', 'Safe, trusted sources', 'CSS and classes', 'Planning and testing'], notes: 'Celebrate the whole unit.' })
  ]
};
