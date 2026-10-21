// Driftwood Bay Artists — the Turtle Lab's lesson unit (lessons/units/turtle.js). One place for every new lesson's starter
// program (STARTERS) and the intended answer (ANSWERS), so the starters (lessons/builds/bay-*.mjs → make-starters.mjs) and the
// tests (tests/unit-turtle.test.mjs) can never drift apart. This folder is not a lesson: make-starters.mjs only reads the
// *.mjs files directly in builds/. Coordinates are the Turtle Lab's: (0,0) in the middle, y up, the canvas is −300…300.

export const STARTERS = {
  'bay-1-jetty': `; WALK TO THE JETTY
; Tilly the turtle is at the orange beach hut (bottom left).
; Help her walk to the bottom of the brown jetty (top right).
; Don't walk through the grey rock pool or the gold sandcastle!
; Each grey square is 50 steps.

; ---- The map: leave this part alone ----
ht setpensize 1 setpencolor "lightgray
repeat 11 [pu setxy -300 + repcount * 50 -300 seth 0 pd fd 600]
repeat 11 [pu setxy -300 -300 + repcount * 50 seth 90 pd fd 600]
setpensize 4
setpencolor "gray pu setxy -250 -50 seth 0 pd repeat 2 [fd 100 rt 90 fd 100 rt 90]
setpencolor "gold pu setxy 50 0 seth 0 pd repeat 2 [fd 100 rt 90 fd 100 rt 90]
setpencolor "orange pu setxy -225 -250 seth 0 pd repeat 4 [fd 50 rt 90]
setpencolor "brown pu setxy 175 150 seth 0 pd repeat 2 [fd 150 rt 90 fd 50 rt 90]

; ---- Tilly's route: add your commands under fd 100 ----
pu setxy -200 -200 seth 0 st pd
setpencolor "red
fd 100
`,
  'bay-2-sign': `; A SIGN FOR THE BEACH CAFE
; The sign has 3 parts: 1 the post, 2 the board, 3 the arrow.

; Part 1: the post (done for you!)
pu setxy 0 -200 seth 0 pd
setpensize 6 setpencolor "brown
fd 150

; Part 2: the board (blue, 200 wide and 80 tall, sitting on the post)


; Part 3: the arrow (red, in the middle of the board, pointing right)

`,
  'bay-4-bunting': `; BUNTING FOR THE FESTIVAL
; The string is 500 steps long. Fill it with flags!

; The string (leave this part alone)
ht setpensize 3 setpencolor "brown
pu setxy -250 150 seth 90 pd fd 500

; The flags start at the left end of the string
pu setxy -250 150 seth 90 pd st
setpencolor "red
; One flag, the long way
fd 40 rt 120 fd 40 rt 120 fd 40 rt 120
; Move along to the next flag
pu fd 50 pd
`,
  'bay-5-lighthouse': `; THE LIGHTHOUSE - this program has 3 bugs!
; What it SHOULD draw:
;   a red tower: a rectangle 80 wide and 200 tall
;   a gold lamp room on top: a square, 40 by 40
;   3 orange light beams shining out from the top of the lamp room
setpensize 4

; The tower
setpencolor "red
pu setxy -40 -200 seth 0 pd
repeat 2 [fd 200 rt 90 fd 80 lt 90]

; The lamp room
setpencolor "gold
pu setxy -20 0 seth 0 pd
repeat 3 [fd 40 rt 90]

; The light beams
setpencolor "orange
setxy 0 40 seth 30
repeat 3 [fd 100 bk 100 rt 30]
`,
  'bay-6-map': `; PROJECT: MY MAP OF DRIFTWOOD BAY
; Plan your map on paper first. Which places? Where do they go?
; Success criteria:
;   at least 3 places on the map, in at least 2 colours
;   repeat used at least twice
;   pu and pd to move between places without drawing
;   a red route from one place to another

; The sea is drawn for you (leave this part alone)
setbg "lightyellow ht
setpensize 6 setpencolor "blue
pu setxy -300 -220 seth 90 pd fd 600

; Your map starts here
pu home pd st
setpensize 3
`,
  'bay-7-slide': `; THE HELTER-SKELTER
; Seen from above, the slide is a square spiral:
; every line should be 10 steps longer than the one before.
; But every line is 50 steps, so the turtle goes round the same square!
setpensize 3 setpencolor "purple
repeat 20 [fd 50 rt 90]
`,
  'bay-8-ducks': `; HOOK A DUCK
; 8 ducks float past. Duck number 5 is the prize duck: it should be gold.
; Ducks 7 and 8 are "try again" ducks: they should be red.
setpensize 4
pu setxy -240 0 seth 0 pd
repeat 8 [
  setpencolor "blue
  repeat 36 [fd 4 rt 10]
  pu rt 90 fd 60 lt 90 pd
]
`,
  'bay-9-crab': `; THE DANCING CRAB
; Every beat, the crab flips a coin.
;   Heads: a red step to the left.   Tails: a blue step to the right.
; At the moment it ALWAYS steps right. Boring!
pu setxy 0 -200 seth 0 pd
setpensize 4
repeat 12 [
  setpencolor "blue
  rt 90 fd 20 lt 90
  fd 30
]
`,
  'bay-10-tide': `; WALK TO THE SEA
; Every time you press Run, Tilly starts somewhere different on the sand.
; She must walk down and stop at the edge of the sea (the blue line, where y is -150).

; The sea (leave this part alone)
ht setpensize 6 setpencolor "blue
pu setxy -300 -150 seth 90 pd fd 600

; Tilly's walk
pu setxy 0 random 250 seth 180 pd st
setpensize 3 setpencolor "red
fd 200
`,
  'bay-11-lights': `; THE PIER LIGHTS - this program has 3 bugs!
; The plan:
;   10 lights in a row along the pier
;   lights 1 to 5 are yellow, lights 6 to 10 are pink
;   the last light (number 10) is big: pen size 8
setpensize 3
pu setxy -250 0 seth 0 pd
repeat 9 [
  ifelse repcount > 6 [setpencolor "yellow] [setpencolor "pink]
  repeat 18 [fd 8 rt 20]
  pu rt 90 fd 50 lt 90 pd
]
if repcount = 10 [setpensize 8]
`,
  'bay-12-fireworks': `; PROJECT: THE FIREWORKS FINALE
; Success criteria:
;   a repeat
;   random, so the show is different every time
;   an if or ifelse that makes a choice
;   a comparison: < or > or =
;   at least 2 colours

; The night sky (leave this part alone)
setbg "navy ht

; One firework to get you started
pu setxy 0 0 pd setpencolor "yellow
repeat 12 [fd 60 bk 60 rt 30]
`,
  'bay-13-size': `; THE BEACH HUT
; This hut is 80 steps wide. Every number below depends on that size.
; Can you make the hut bigger by changing just ONE number?
pu setxy -40 -100 seth 0 pd
setpensize 3

; The walls
setpencolor "blue
repeat 4 [fd 80 rt 90]

; The door, in the middle
pu rt 90 fd 30 lt 90 pd
setpencolor "red
repeat 2 [fd 40 rt 90 fd 20 rt 90]
`,
  'bay-15-survey': `; THE BEACH SURVEY
; Ice creams sold at the beach cafe on Saturday:
;   strawberry 6, chocolate 9, mint 4, vanilla 7
; Each ice cream is 20 steps of bar.

; The axes (leave this part alone)
ht setpensize 2 setpencolor "black
pu setxy -220 -150 seth 0 pd fd 220 bk 220 rt 90 fd 300

; The first bar: strawberry, 6 ice creams
pu setxy -200 -150 seth 0 pd
setpensize 3 setpencolor 12
repeat 2 [fd 6 * 20 rt 90 fd 40 rt 90]
`,
  'bay-16-seafront': `; THE SEAFRONT - this program has 3 bugs!
; The plan: 4 beach huts in a row. Each hut is 10 bigger than the last
; (sizes 70, 80, 90, 100), and each has a red door in the middle.
to hut :size
  setpencolor "blue
  repeat 4 [fd 80 rt 90]
  pu rt 90 fd :size * 3 / 8 lt 90 pd
  setpencolor "red
  repeat 2 [fd :size / 2 rt 90 fd :size / 4 rt 90]
end

pu setxy -250 -100 seth 0 pd
setpensize 3
repeat 4 [
  make "size 70
  hut :size
  pu rt 90 fd 120 lt 90 pd
  make "size :size + 10
]
`,
  'bay-17-regatta': `; THE REGATTA
; Four boats race. Each boat is 15 bigger than the one before: 30, 45, 60, 75.
; Big boats (size more than 50) have red sails. Small boats have blue sails.
; At the moment the boat procedure can only draw one size of boat.
to boat
  setpencolor "brown
  rt 90 fd 80 bk 40 lt 90
  fd 60
  setpencolor "blue
  lt 135 fd 56.56 rt 225 fd 40
  pu rt 90 fd 20 rt 90 fd 40 rt 90 pd
end

setpensize 3
pu setxy -260 -100 seth 0 pd
boat
`,
  'bay-18-postcard': `; PROJECT: A POSTCARD FROM DRIFTWOOD BAY
; Success criteria:
;   a procedure with an input (to ... :something ... end) that you use more than once
;   a variable (make)
;   a repeat
;   an if or ifelse
;   at least 3 colours

; The postcard's edge (leave this part alone)
ht setpensize 4 setpencolor "black
pu setxy -280 -280 seth 0 pd repeat 4 [fd 560 rt 90]

; Your postcard starts here
setpensize 3
`
};

// ───────────────────────────── the intended answers ─────────────────────────────
const S = STARTERS;
const after = (text, find, add) => text.replace(find, find + add); // insert pupils' lines after a line of the starter

export const ANSWERS = {
  'bay-1-jetty': S['bay-1-jetty'] + 'rt 90\nfd 400\nlt 90\nfd 250\n',
  'bay-2-sign': after(after(S['bay-2-sign'], 'sitting on the post)\n',
    'setpencolor "blue\nlt 90 fd 100\nrt 90 fd 80\nrt 90 fd 200\nrt 90 fd 80\nrt 90 fd 100\n'),
    'pointing right)\n', 'pu setxy -60 -10 seth 90 pd\nsetpencolor "red\nfd 120\nlt 135 fd 30 bk 30\nrt 270 fd 30\n'),
  'bay-4-bunting': S['bay-4-bunting'].replace(/; One flag, the long way[\s\S]*$/, '; Ten flags: 500 steps of string, 50 steps for each flag\nrepeat 10 [\n  repeat 3 [fd 40 rt 120]\n  pu fd 50 pd\n]\n'),
  'bay-5-lighthouse': S['bay-5-lighthouse'].replace('fd 80 lt 90]', 'fd 80 rt 90]').replace('repeat 3 [fd 40', 'repeat 4 [fd 40')
    .replace('setxy 0 40 seth 30', 'pu setxy 0 40 seth 30 pd'),
  'bay-6-map': S['bay-6-map'] + `; The beach hut
setpencolor "orange
pu setxy -200 -150 seth 0 pd
repeat 4 [fd 60 rt 90]
; The rock pool
setpencolor "gray
pu setxy 100 -180 seth 0 pd
repeat 2 [fd 60 rt 90 fd 120 rt 90]
; The lighthouse
setpencolor "purple
pu setxy -40 100 seth 0 pd
repeat 2 [fd 120 rt 90 fd 50 rt 90]
; The route from the hut to the lighthouse
setpencolor "red
pu setxy -170 -90 seth 0 pd
fd 120 rt 90 fd 155 lt 90 fd 70
`,
  'bay-7-slide': S['bay-7-slide'].replace('repeat 20 [fd 50 rt 90]', 'repeat 20 [fd repcount * 10 rt 90]'),
  'bay-8-ducks': S['bay-8-ducks'].replace('  setpencolor "blue\n', '  setpencolor "blue\n  if repcount = 5 [setpencolor "gold]\n  if repcount > 6 [setpencolor "red]\n'),
  'bay-9-crab': S['bay-9-crab'].replace('  setpencolor "blue\n  rt 90 fd 20 lt 90\n',
    '  ifelse random 2 = 0 [setpencolor "red lt 90 fd 20 rt 90] [setpencolor "blue rt 90 fd 20 lt 90]\n'),
  'bay-10-tide': S['bay-10-tide'].replace(/fd 200\n$/, 'repeat 500 [\n  if ycor < -150 [stop]\n  fd 2\n]\n'),
  'bay-11-lights': S['bay-11-lights'].replace('repeat 9 [', 'repeat 10 [').replace('repcount > 6', 'repcount < 6')
    .replace('[setpencolor "pink]\n', '[setpencolor "pink]\n  if repcount = 10 [setpensize 8]\n').replace(/\]\nif repcount = 10 \[setpensize 8\]\n$/, ']\n'),
  'bay-12-fireworks': S['bay-12-fireworks'] + `
; The finale: 8 more fireworks in random places
repeat 8 [
  pu setxy random 500 - 250 random 300 - 50 pd
  ifelse random 2 = 0 [setpencolor "pink] [setpencolor "cyan]
  if ycor > 150 [setpencolor "gold]
  repeat 10 [fd 40 bk 40 rt 36]
]
`,
  'bay-13-size': `; THE BEACH HUT
; One variable holds the size. Change it and the whole hut changes!
make "size 80
pu setxy -40 -100 seth 0 pd
setpensize 3

; The walls
setpencolor "blue
repeat 4 [fd :size rt 90]

; The door, in the middle
pu rt 90 fd :size * 3 / 8 lt 90 pd
setpencolor "red
repeat 2 [fd :size / 2 rt 90 fd :size / 4 rt 90]
`,
  'bay-15-survey': S['bay-15-survey'].replace(/; The first bar[\s\S]*$/, `; A procedure for one bar: :n ice creams, colour :c
to bar :n :c
  setpencolor :c
  repeat 2 [fd :n * 20 rt 90 fd 40 rt 90]
  pu rt 90 fd 60 lt 90 pd
end

pu setxy -200 -150 seth 0 pd
setpensize 3
bar 6 12
bar 9 8
bar 4 2
bar 7 9
`),
  'bay-16-seafront': S['bay-16-seafront'].replace('repeat 4 [fd 80 rt 90]', 'repeat 4 [fd :size rt 90]')
    .replace('rt 90 fd :size / 4 rt 90]\nend', 'rt 90 fd :size / 4 rt 90]\n  pu lt 90 fd :size * 3 / 8 rt 90 pd\nend')
    .replace('repeat 4 [\n  make "size 70\n', 'make "size 70\nrepeat 4 [\n'),
  'bay-17-regatta': `; THE REGATTA
; Four boats race. Each boat is 15 bigger than the one before: 30, 45, 60, 75.
; Big boats (size more than 50) have red sails. Small boats have blue sails.
to boat :size
  setpencolor "brown
  rt 90 fd :size * 2 bk :size lt 90
  fd :size * 1.5
  ifelse :size > 50 [setpencolor "red] [setpencolor "blue]
  lt 135 fd :size * 1.414 rt 225 fd :size
  pu rt 90 fd :size / 2 rt 90 fd :size rt 90 pd
end

setpensize 3
make "x -260
make "size 30
repeat 4 [
  pu setxy :x -100 seth 0 pd
  boat :size
  make "x :x + :size * 2 + 20
  make "size :size + 15
]
`,
  'bay-18-postcard': S['bay-18-postcard'] + `
; A procedure with an input: a wave of any size
to wave :size
  repeat 9 [fd :size / 10 rt 10]
  repeat 9 [fd :size / 10 lt 10]
end

; The sea: a row of waves
setpencolor "blue
make "y -200
repeat 3 [
  pu setxy -260 :y seth 45 pd
  repeat 5 [wave 60]
  make "y :y + 30
]

; The sun: gold if it is high in the sky
pu setxy 150 120 seth 0 pd
ifelse ycor > 100 [setpencolor "gold] [setpencolor "orange]
repeat 36 [fd 8 rt 10]

; A boat
setpencolor "red
pu setxy -100 -80 seth 90 pd
fd 120 lt 120 fd 40 lt 60 fd 80 lt 60 fd 40
pu setxy -40 -45 seth 0 pd
fd 90 rt 150 fd 60 rt 120 fd 30

; A big wave behind the boat
setpencolor "cyan
pu setxy -250 -60 seth 45 pd
wave 80
`
};

// make-starters.mjs only runs turtle code for its own two turtle lessons before taking the card picture, so the build also
// wraps lessonOpenStarter (in that one-off page only) so the picture shows the starter's drawing, as a pupil sees it after Run.
export const args = id => ({ code: STARTERS[id] });
export const build = async ({ code }) => {
  startNewTurtle('ks2');
  turtleCode = code;
  document.getElementById('turtle-code').value = turtleCode;
  if (!window.__bayPic) {
    window.__bayPic = true;
    const open = lessonOpenStarter;
    lessonOpenStarter = async id => { await open(id); turtleSpeed = 10; turtleRun(); };
  }
};
