# CodeJump — working notes for Claude

**This repo IS the live site** (GitHub Pages → codejump.primarycodingleague.co.uk). Pushing `main`
= publishing to kids/schools, so only push finished, verified work. Never delete `CNAME`.

## Repo layout & workflow (machine-independent)
- `build-and-play.html` = the MASTER file — edit this one.
- `index.html` = the deployed copy. After every change: `cp build-and-play.html index.html`.
- Then: quick JS syntax check (extract <script> blocks, `node --check`), verify in a browser,
  bump `CJ_VERSION` + `CJ_WHATSNEW` for user-facing changes, commit, push `main`, and confirm the
  live site serves the new CJ_VERSION (Pages rebuild ~1–2 min).
- (Historical note: on the original Mac the master lived at `~/build-and-play.html` — the notes
  below sometimes reference that path. The repo copy is now the source of truth.)
- The backend (accounts/classes/collab) is the separate repo `primarycodingleague/codejump-cloud`,
  deployed with wrangler; app + worker share a contract — change both together.

---

# CodeJump — working notes

CodeJump is a single-file browser game (level editor + playable platformer) for primary
children, by Primary Coding League in partnership with Primary Coding Clubs.

## Project types — `projectType` ('platformer' | 'stage') — NEW, in progress
The app is becoming a multi-engine "one-stop shop". A `let projectType` global (declared by
`keyStage`) is the seam every engine plugs into. It's written/read in `buildPayload`/`applyPayload`
(**legacy saves with no field default to 'platformer'**, so nothing old breaks). After the age-group
modal, a **project-type chooser** (`#pt-modal`, 🏃 Platformer / 🎭 Stage) routes to `startNewProject`
or `startNewStage`.
- **Platformer** = the original grid game. ALL existing behaviour. Untouched.
- **Stage** = Scratch-style sprites-on-a-stage engine (`stageState`, `drawStage`, `stageFrame`,
  `stageStart`/`stageStop`, `sanitizeStage`). Gated entirely behind `projectType==='stage'`: branches
  in `loop()` and `switchMode()` only. Save/load via payload `stage:`.
  - **Blocks (Blockly):** `defineStageBlocks()` defines `st_*` blocks; `stageToolbox()` and
    `stageDefaultXml()` are returned by `getToolbox()`/`getDefaultXml()` when `projectType==='stage'`.
    Categories: 🟡 Events (`st_when_flag`, `st_when_key`), 🔵 Motion (`st_move/turn_r/turn_l/point/
    change_x/change_y/goto_center`), 🟣 Looks (`st_say/show/hide/change_size/set_size`), 🟠 Control
    (`st_wait/repeat/forever`). Stage projects ALWAYS use the Blockly editor (even at KS3).
  - **Interpreter:** generator "fibers" (`stRunSeq`/`stRunOne`, `stFibers`, `stPump`) — one step per
    frame so wait/repeat/forever don't freeze (same idea as platformer `cjFire`). `st_when_flag` →
    fiber at play start; `st_when_key` → re-fires while key held. Sprite dir uses Scratch degrees
    (90=right, 0=up). `stageStart` calls `initBlockly()` if needed so scripts run even if Code was
    never opened.
  - **Unified Scratch-style UI (no Build/Play/Code modes for Stage):** `enterStageUI()`/`exitStageUI()`
    add/remove `body.stage-mode`, MOVE the shared `#gc` canvas into `#stage-canvas-holder` (right dock)
    and back into `#cwrap` for platformer. Layout = Blockly (left, `#code-panel` made a flex child) +
    `#stage-right` (canvas on top, `#sprite-panel` below). Toolbar swaps Build/Play/Code for 🟢 `btn-greenflag`
    / ⏹️ `btn-stopall` (`.stage-only`). `switchMode` early-returns to `enterStageUI` for stage and calls
    `exitStageUI` when entering a platformer; `showHome` also exits. `mode` is set to `'code'` in stage but
    `loop()` dispatches on `projectType==='stage'` first so mode is irrelevant there.
  - **Multiple sprites:** `stageState.sprites[]`, each with its OWN `xml` (Blockly program), `color`,
    x/y/dir/size. `stageSel` = sprite shown in the editor. `stageSaveCurrent()` flushes the workspace into
    the selected sprite (called on select/add/delete/play and in `buildPayload`); `stageLoadSpriteScripts(i)`
    loads a sprite's xml. Sprite panel (`renderSpritePanel`, `stageAddSprite`, `stageSelectSprite`,
    `stageDeleteSprite`) with mini-cat thumbnails (`paintCat`/`drawSpriteThumb`). At play, `stageStart`
    builds a **headless `new Blockly.Workspace()` per sprite** from its xml so ALL sprites' scripts run, not
    just the selected one (disposed in `stageStop`). Drag sprites on the canvas when stopped (`stageDragStart`
    etc; bound via `getElementById('gc')` in an IIFE because the `canvas` const is declared later in the file).
  - **Gotcha:** never put top-level statements referencing the `canvas` const before its declaration (~L1980)
    — TDZ error halts the whole script (it silently broke `readAloud` init once). Use `getElementById('gc')`.
  - **Costumes:** built-in character library `STAGE_COSTUMES` (name→{e:emoji,f:paintFn}) — cat/dog/bear/
    bunny/bird/ball/ghost/star/robot, each a vector `paintX(c,color)` drawn centred at origin. `paintCostume(c,name,color)`
    dispatches; `COSTUME_KEYS` is the order. `s.costume`+`s.color` per sprite; new sprites cycle costumes/colours.
    Picker = `#costume-modal` (`openCostumePicker`/`renderCostumeGrid`/`renderCostumeColors`) opened via the
    🎨 Costume button or double-clicking a sprite card; also renames via `#cm-name`. `sanitizeStage` validates
    costume against the library. To add a costume: add ONE entry to `STAGE_COSTUMES` (+ its paint fn) — feeds
    stage render, thumbnails, and the picker automatically.
  - **Sensing / conditions / score:** value+boolean reporters evaluated by `stEval(block,s)` (returns number/
    bool); `stTruthy` for conditions. Blocks: `st_if`/`st_if_else` (COND value input + DO/ELSE statements),
    `st_touching` (boolean; `stTouching(s,target)` — circle overlap vs another sprite by name, or `_edge`),
    `st_key_pressed` (boolean), `st_compare` (A op B, shadow `math_number` inputs), `st_change_score`/
    `st_set_score`/`st_score` over one global `stScore` (reset 0 at `stageStart`, drawn 🏆 top-left while
    playing). Toolbox gained 🟦 Sensing / 🟩 Operators / 🏆 Score categories + if/if-else in Control.
    **GOTCHA (fixed):** `st_touching`'s dynamic dropdown (`stTouchOptions`) must list ALL sprites, not just
    "others" — Blockly resets a dropdown to its first option if the stored value isn't in the list, and the
    per-sprite headless play workspaces load with a different `stageSel`, which silently reset the target.
  - **Toward full Scratch block range (user wants ALL of it except My Blocks), built in WAVES:**
    - **Wave 1 DONE & verified:** Motion (go to x/y, go to random/mouse, glide, point towards, set x/y,
      if-on-edge-bounce, x/y/direction reporters), Looks (say/think + …for secs, size), Control (wait until,
      repeat until, stop all/this), Sensing (mouse x/y, mouse down?, distance to, timer + reset, when-sprite-
      clicked), Operators (reuses STANDARD Blockly blocks: math_arithmetic, math_random_int, logic_compare,
      logic_operation, logic_negate, logic_boolean, math_modulo, math_single, text, text_join, text_length),
      Events (when this sprite clicked). `stEval(b,s)` now evaluates BOTH `st_*` reporters AND the standard
      Blockly operator/logic/text blocks. State: `stScore`,`stClickHats`,`stTimerBase`,`stageMouse{x,y,down}`.
      **Coordinate system: blocks use Scratch convention** — centre origin, +y up (set/goto/x-pos/y-pos
      convert to/from canvas px; change-y subtracts; default arrow program updated accordingly).
    - **Wave 2a DONE & verified (Variables):** 📦 Variables category = a `{kind:'button',callbackKey:'CREATE_VARIABLE'}`
      (registered in `initBlockly` → `Blockly.Variables.createVariableButtonHandler`) + standard `variables_set`/
      `math_change`/`variables_get` + custom `st_show_var`/`st_hide_var` (FieldVariable). Runtime store `stVars`
      (name-keyed, GLOBAL across sprites — interpreter resolves names via `stVarName(b)` so per-sprite headless
      workspaces share values), `stVarShown` monitors drawn top-right in `drawStage`. `stageState.vars` (name
      list) persists in payload; `stageSyncVars()` re-creates global vars in each sprite's workspace on load so
      dropdowns stay consistent. **Critical fix:** `buildPayload` used `levels[0].grid` which crashed for Stage
      projects (no platformer levels, swallowed by autosave try/catch) — now falls back to a blank first-level,
      so Stage projects actually save now.
    - **Wave 2b DONE & verified (Lists):** 📃 Lists category = `{kind:'button',callbackKey:'CREATE_LIST'}` →
      `createVariableButtonHandler(ws,null,'list')` + custom `st_list_*` blocks using list-typed FieldVariable
      (`new Blockly.FieldVariable(null,null,['list'],'list')`). Runtime store `stLists` (name-keyed arrays via
      `stList(n)`), `stListShown` monitors. `stageState.lists` persists; `stageSyncVars` now handles BOTH plain
      vars and list-typed vars (separated by `v.type==='list'`). **GOTCHA:** hand-written list XML triggers
      Blockly's "serialized variable type … does not match field" error — only the Blockly-serialized form is
      valid, so test lists by building blocks via `ws.newBlock(...)`/serialize, NOT hand XML.
    - **Wave 3 DONE & verified (Broadcast + Clones):** Events gained `st_broadcast`/`st_broadcast_wait`/
      `st_when_receive` (text MSG field); Control gained `st_clone` (dropdown `stCloneTargets`)/`st_when_clone_start`/
      `st_delete_clone`. State `stRecvHats`,`stCloneHats`,`stClones` (runtime clone sprites, cap 300). `stStartScript`
      now tags fibers with `sp` (the sprite) so a deleted clone's fibers are dropped. Clones carry `_src`→original
      editor sprite; `stSpawnClone` fires clone-start hats keyed by `_src`. `broadcast and wait` tags spawned
      fibers with a token and yields until none remain. `drawStage` draws `stClones` before the editor sprites;
      `stageFrame` filters out `_deleted` clones + their fibers. delete-this-clone sets `_deleted` + throws
      `{__stopThis}` (stPump's catch drops the fiber).
    - **Wave 4a DONE & verified (Paint editor + costumes):** sprite costume model is now a LIST —
      `s.costumes=[{name,builtin,color}|{name,img:dataURL}]` + `s.costumeIdx` (legacy `s.costume`/`s.color`
      migrated in `sanitizeStage` via `sanitizeCostume`). Render via `paintSpriteCostume(c,s,box)` →
      `curCostume`/`costumeImgEl` (built-in vector OR a painted PNG, image cached on `co._el`). **Bitmap paint
      editor** `#paint-modal` (`openPaintEditor({w,h,img,name,onSave})`): tools brush/eraser/fill-bucket(flood)/
      line/rect/ellipse/text, fill+outline colour inputs, size, undo/redo (ImageData stack), flip H/V; outputs
      `toDataURL('image/png')`. Costume manager modal revamped (`renderCostumeManager`/`renderCostumeEdit`):
      list costumes, select/delete/rename, ➕ Paint new (`cmPaintNew`), 🐱 Add character (`cmAddCharacter`),
      ✏️ Edit drawing (`paintCostumeEditor`). Blocks: `st_switch_costume` (dropdown `stCostumeOptions`),
      `st_next_costume`, `st_costume_num`. Clones share `costumes` ref + copy `costumeIdx`.
    - **Wave 4b DONE & verified (Backdrops):** `stageState.backdrops=[{name,color}|{name,img}]` + `backdropIdx`
      (migrated from `bg` in `sanitizeStage` via `sanitizeBackdrop`). `drawStage` paints current backdrop
      (image filled to CW×CH or solid colour) via `curBackdrop`/`backdropImgEl`. Backdrop manager `#backdrop-modal`
      (toolbar `btn-backdrops`, stage-only): `renderBackdropManager`/`renderBackdropEdit`, 🎨 Paint new (`bdPaintNew`,
      uses paint editor at 480×288), 🎨 Solid colour (`bdAddSolid`), rename/delete/select. Blocks: `st_switch_backdrop`
      /`st_next_backdrop` (dropdown `stBackdropOptions`), `st_backdrop_num`, and the `st_when_backdrop` hat
      (collected into `stBackdropHats`, fired by `stSetBackdrop` on change during play).
    - **Wave 5 IN PROGRESS:**
      - **5a Pen DONE & verified:** persistent offscreen pen layer `stPenCanvas`/`stPenCtx` (drawn under sprites
        in `drawStage`). Per-sprite `penDown`/`penColor`/`penSize`/`_plx`/`_ply`; `stPenTrace(s)` draws a line
        from last→current pos each frame in `stageFrame` (sprites + clones). Blocks `st_pen_clear`/`st_pen_stamp`
        (`stStampSprite` paints costume onto pen layer)/`st_pen_down`/`st_pen_up`/`st_pen_setcolor`
        (Blockly.FieldColour w/ FieldTextInput fallback)/`st_pen_changesize`/`st_pen_setsize`. Pen layer cleared
        at `stageStart`; clones inherit pen state.
      - **5b Sound DONE & verified:** Web Audio synth (no asset files) — `stAudioCtx`/`stMasterGain`/`stVolume`,
        `ST_SOUNDS` = 8 built-ins (pop/beep/meow/boing/drum/coin/laser/magic) via `stTone`/`stNoise`. Blocks
        `st_play_sound`/`st_play_sound_wait` (yields for the duration)/`st_stop_sounds`/`st_set_volume`/
        `st_change_volume`/`st_volume`. `stStopSounds` on stageStop. (Can't hear in headless preview; graph verified.)
      - **5c DONE & verified:** ask/answer (`#stage-ask` input overlay over the canvas; `st_ask` shows it +
        yields until `stFinishAsk`; `st_answer` reporter; `stAnswer`/`stAsking`). Graphic effects per-sprite
        `s.fx={ghost,brightness}`: `st_change_effect`/`st_set_effect`/`st_clear_effects`; applied in
        `drawStageSprite` (ghost→globalAlpha, brightness→ctx.filter). Reset at stageStart; cloned.
    - **Wave 6 DONE & verified (the long tail):** Looks layers `st_goto_layer`/`st_go_layers` (per-sprite `_z`,
      `drawStage` sorts by `_z`). Motion `st_glide_to` + `st_goto` now use dynamic `stGotoTargets` (random/mouse/
      sprite). Sensing `st_username` (→`cloudMe.displayName`||'player'), `st_current` (date parts), `st_days_2000`,
      `st_attr_of` (ATTR `stAttrTargets`: sprite/Stage), `st_set_drag` (`s.draggable` → drag during play in
      `stageDragStart`, `_stageDrag.i`). Operators `st_letter_of`, `st_str_contains`, + standard `math_trig`
      (stEval handles it). **Stage now ≈ the full Scratch palette** (11 categories).
    - **Deliberately NOT done:** "My Blocks"/custom blocks (user excluded), video sensing + loudness (webcam/mic
      → safeguarding decision for primary kids — add later only with consent handling).
  - **Stage POLISH pass (user wants 4 areas: responsive / sprite-workflow / block look&feel / paint editor):**
    - **DONE responsive:** `body.stage-mode` layout now has breakpoints — side-by-side >820px; **stacks**
      vertically ≤820px (blocks full-width on top, stage+sprites below) so iPad portrait (768) & phones get room.
      `#rotate-hint` hidden in stage mode. Verified at 1280/768/375.
    - **DONE sprite workflow:** `#sprite-info` bar (name, 👁️ show/hide, x/y/size/dir number inputs — Scratch
      coords; `renderSpriteInfo`) + `#stage-pane` backdrop thumbnail (click → `openBackdropManager`;
      `renderStagePane`, synced in `renderBackdropManager`). Both rebuilt in `renderSpritePanel`.
    - **DONE block look&feel:** `stageToolbox` categories reordered to Scratch order (Motion, Looks, Sound,
      Events, Control, Sensing, Operators, Variables, Lists, Pen, Score). Removed the cluttering on-stage hint
      text in `drawStage`; 🏆 score badge only shows once a score block runs (`stScoreUsed`).
    - **DONE paint editor:** quick-pick colour swatches (`#paint-swatches`, 12 colours → set fill), a centre
      guide (`#paint-center` overlay, NOT baked into the bitmap), and a checkerboard canvas bg so transparency
      is visible.
    - **All 4 polish areas done & verified.** Next per user: keep refining the Stage toward "exactly how I want
      it", THEN do the deferred sharing/collaboration pass (link-sharing rebuild is the Coding League priority).
  - **Sharing & collaboration for Stage — DEFERRED by the user until the Stage setup is finalised.** Known gaps
    to fix in one pass later: (1) **share-by-LINK is VITAL for the Coding League and must be fully sorted** — it
    currently packs the whole project into the URL (`payloadCode` base64 in `?lvl=`) → breaks once a Stage has
    painted costumes/backdrops (URL too long). The fix is a proper link-sharing system (e.g. short link backed by
    cloud storage) that works for BOTH platformer and Stage regardless of size — this is a priority of the
    deferred sharing pass, not optional. (2) Cloud hand-in to classes WORKS (buildPayload includes everything) but image-heavy projects are
    large (watch localStorage autosave). (3) Live collaboration was built/tested for the PLATFORMER only — Stage
    rooms sync via full `buildPayload` snapshots but `applyPayload` skips `enterStageUI` when `collabActive`, so a
    remote edit doesn't refresh the other person's sprite panel / per-sprite Blockly workspace / canvas; also it
    re-ships all image data on every edit. Don't tell schools Stage live-collab works until this pass is done.
  - **Other done & verified:** unified UI, multi-sprite (headless workspaces), add/select/delete/drag, costume
    picker (9 characters + 12 colours + rename), touching/score interaction, green-flag run, platformer intact.
  - **Testing notes:** offscreen preview THROTTLES rAF (drive `stageFrame()`/`drawStage()` manually) AND
    caches hard — bust with `?b=`+Date.now() and restart the preview server after edits. `stageStart` calls
    `stageSaveCurrent()` first, so to test an injected `sprites[0].xml` set `stageSel=99` so it isn't clobbered.

## Extensions — Ohbot emulator (first extension; clean-room) — DONE & verified
The Stage now has a 🤖 **Ohbot** category + an on-screen Ohbot head. **Clean-room:** our own art (`paintOhbot`)
and our own interpreter cases; only the *documented functional behaviour* (motor names, value ranges, say+lip-sync)
is reimplemented. Branding: user opted to use the "Ohbot" name (flagged: get their blessing before public launch).
- **Emulator:** an `ohbot` entry in `STAGE_COSTUMES`; a sprite wearing it renders via `paintOhbot(c,ob,color)`
  from a per-sprite `s._ob` motor state (`ohbotState(s)`, reset at `stageStart`). 7 motors 0–10 (`OHBOT_MOTORS`):
  HeadTurn, HeadNod, EyeTurn, EyeTilt, TopLip, BottomLip, Lid + `color`. `_obv(ob,k)` defaults (Lid→0 else 5).
- **Blocks:** `ob_move` (motor→value, quick tween), `ob_move_time` (over N secs), `ob_say` (TTS via
  `speechSynthesis` + lip-sync by animating Top/BottomLip + sets `_speaking`), `ob_eyecolor`, `ob_reset` (tween
  all motors to default + clear colour), `ob_speaking` (reporter). Toolbox category at the bottom (extensions).
- **Fidelity pass (done):** `paintOhbot` now draws a detailed mechanical head (cream skull w/ brow+jaw curves,
  eyebrows, ping-pong eyes w/ iris+pupil+glint, eyelids, two independent lips + mouth interior/teeth, neck/spine
  + base). Block wording matches Ohbot's documented blocks (exact motor names HeadNod/HeadTurn/EyeTurn/EyeTilt/
  BottomLip/TopLip/Lid; "move [motor] to [v]", "...in [n] seconds", "say", "set eye colour to", "reset Ohbot",
  "Ohbot is speaking?"). **Lip-sync:** `visemeFor(char)` grapheme→viseme map drives Top/BottomLip per sound in
  `ob_say` (browsers don't expose true phonemes, so it's the standard viseme approximation; stops on the
  utterance `onend`). **IP note:** art is ORIGINAL (not a copy of Ohbot's graphics); a pixel-exact replica of
  their design + the Ohbot name in a PUBLIC product is trade-dress/trademark territory → get Ohbot's blessing.
- **Future:** real-hardware bridge (Web Serial/Bluetooth) for clubs that own a physical Ohbot — separate from
  the emulator.

## Real micro:bit over USB (WebUSB flashing) — IN PROGRESS / experimental
A 🔌 micro:bit toolbar button (`btn-mbsend`, stage-only, shown in KS2/KS3 when `MB_FLASH_ON`) opens `mbSendOpen()`:
- **Translator `mbToPython()`** — turns the SELECTED sprite's Blockly blocks into MicroPython (verified output is
  correct & valid). `mbStmt`/`mbExpr`/`mbSeq` map mb_*/st_control/operators/variables; `on_start`+`forever` →
  setup + `while True:`; button/shake/gesture/radio hats merged into the loop as `was_pressed()`/`was_gesture()`/
  `radio.receive()` checks; maps `MB_PY_ICON/ARROW/MELODY/GESTURE`. Unsupported blocks emit a `# comment`.
- **Panel** offers 🔌 Flash over USB, ⬇️ Download .hex (Safari/Mac/iPad: drag onto the MICROBIT drive — Safari has no
  WebUSB), ⬇️ Download .py, 📋 Copy. `mbBuildHex(py)` is shared by Flash + Download .hex (verified: builds a valid
  1.24 MB hex with main.py embedded). Download .hex works in EVERY browser (it's just a file the board self-flashes).
- **Flash `mbFlashUSB()`** — loads `@microbit/microbit-fs` (`/dist/bundles/microbit-fs.umd.min.js`, global
  `window.microbitFs`) + `dapjs` (`/dist/dap.umd.min.js`, global `window.DAPjs` with `.DAPLink`/`.WebUSB`) from
  jsdelivr, fetches `MB_FIRMWARE_URL`, builds an fs hex (`MicropythonFsHex(hex).write('main.py',py).getIntelHex()`),
  flashes via `new DAPjs.DAPLink(new DAPjs.WebUSB(dev))` over WebUSB. **VERIFIED in-browser up to the device write**:
  libs load, firmware fetches (1.24 MB), getIntelHex produces a valid hex (`:`…`:00000001FF`), and the in-app flow
  reaches `navigator.usb.requestDevice`. **NOT yet tested writing to a real board** (none here).
- **Firmware:** `MB_FIRMWARE_URL='microbit-micropython-v2.hex'` (MicroPython **v2.1.1**, downloaded to
  `/Users/charlie/codejump/microbit-micropython-v2.hex`, served same-origin → no CORS). **micro:bit V2 only** — V1
  boards would need the V1 hex / a universal hex. A copy is also at `/Users/charlie/microbit-micropython-v2.hex` for
  the local preview server only (not deployed). **The user must upload the .hex to GitHub Pages alongside index.html.**
- **TODO:** real-board test on a Chromebook/Chrome (confirm `target.flash(TextEncoder().encode(getIntelHex()))` byte
  format — may need binary instead of hex-text); add V1/universal-hex support; widen translator (pins/sensors-as-vars).

## Extensions — micro:bit emulator (clean-room) — DONE & verified
A `microbit` costume in `STAGE_COSTUMES` renders a **full-size, original vector** of a micro:bit FRONT
(`paintMicrobit(c,mb,color)` — black PCB ~190×158, cyan corner triangle, micro-USB, oval logo, live 5×5 red LED
matrix, metallic A/B buttons, gold edge pads 0/1/2/3V/GND). Board is always black (colour ignored). Clean-room:
our own art + interpreter; MakeCode's documented behaviour only. **IP note:** original drawing, NOT Microsoft's
product render — get the Micro:bit Educational Foundation's blessing before prominent public/branded use.
- **Flag:** `MICROBIT_ON=true` (near `OHBOT_ON`). `pickableCostumes()` shows it in the picker when on;
  `cycleCostumes()` (NEW — used by `blankSprite`/`cmAddCharacter`) never auto-assigns device costumes.
  Toolbox filter hides all `📟`-named categories when off.
- **State** `s._mb={leds:[25],bright,group,rxNum,rxStr,_A,_B,_logo}` (reset in `stageStart`). LEDs are 0–9;
  display brightness scales alpha in `paintMicrobit`. `mbState(s)` lazily inits.
- **Interactivity (MakeCode-sim style):** while playing, `drawStageSprite` overlays A+B / ⇄ Shake chips
  (`drawMbControls`) and the physical A/B buttons + oval logo are clickable hotspots (`mbControls()` local
  coords; `mbControlAt`, `mbPointerDown`/`mbPointerUp` wired into the gc mouse/touch handlers). Press flags feed
  `mbBtnDown(btn,s)` (keyboard KeyA/KeyB OR on-screen press). `costumeHalf(s)` widens the drag/select box for the
  big board. Shake chip fires `on shake` + `on gesture shake`; logo fires `on logo pressed`.
- **Blocks (4 categories — never duplicate Stage's loops/logic/vars/math/arrays/text):**
  - **📟 micro:bit (Basic+Led+Control):** `mb_on_start`, `mb_show_icon` (MB_ICONS), `mb_show_arrow` (MB_ARROWS),
    `mb_show_leds` (custom `window.FieldLeds` — clickable 5×5 grid, Blockly-10 `Blockly.Field` subclass defined
    lazily by `defineMbLedsField()`, value = 25-char 0/1 string), `mb_show_number`/`mb_show_string` (scroll via
    5×3 `MB_FONT`), `mb_clear`, `mb_plot`/`mb_unplot`/`mb_toggle`/`mb_plot_brightness`/`mb_plot_bar_graph`,
    `mb_set_brightness`/`mb_brightness`, `mb_point`, `mb_run_background` (starts a parallel fiber).
  - **📟 Input:** `mb_on_button`/`mb_on_shake`/`mb_on_gesture`/`mb_on_logo`, `mb_button`/`mb_logo_pressed`,
    sensors `mb_acceleration`/`mb_rotation`/`mb_light_level`/`mb_temperature`/`mb_compass_heading`/
    `mb_magnetic_force`/`mb_sound_level` (EMULATED constants — no hardware), `mb_running_time` (REAL, from
    `stMbStart`).
  - **📟 Music (reuses Web Audio `stTone`/`stAudioCtx`):** `mb_play_tone` (MB_NOTES × MB_DUR beats, blocking),
    `mb_ring_tone`, `mb_rest`, `mb_play_melody` (MB_MELODIES), `mb_set_tempo`/`mb_change_tempo`/`mb_tempo`
    (`stMbTempo`, `mbBeatMs()`).
  - **📟 Radio (emulated BETWEEN micro:bit sprites):** `mb_radio_set_group`, `mb_radio_send_number`/`_string`,
    `mb_on_radio_number`/`_string`, `mb_radio_number`/`_string` reporters. `stRadioSend`→`stRadioQ`→`stRadioPump()`
    (in `stageFrame`) delivers to every OTHER micro:bit sprite in the same group, sets rxNum/rxStr, fires hats.
- **Hats** collected in `stageStart` (gesture/logo/radio-num/radio-str alongside button/shake); all cleared in
  `stageStart`/`stageStop`.
- **Sensor panel (MakeCode-style, DONE — GLOBAL fixed panel, not per-sprite):** sensor values are GLOBAL ambient
  state `stMbSensors` (light/temp/compass/sound/accelX/accelY/accelZ), shared by all micro:bit sprites (like one
  room). `mbDetectControls(s,ws)` (in `stageStart`) scans every sprite's blocks via `MB_SENSOR_OF` and OR-merges
  into global `stMbUses`. `mbPanelRows()` returns only the used sliders (light/temp/compass/sound + tilt→
  accelX/accelY). `mbDrawPanel(ctx)` (called at the end of `drawStage` while playing) draws a fixed dark panel
  ("📟 micro:bit sensors") docked left-centre in CANVAS coords — big & easy to drag, always visible regardless of
  sprite position/size. `mbPanelHit`/`mbSetPanelFromPoint` + `_mbSlider` + window `mousemove`/touchmove drive it;
  `mbPointerDown` checks the panel FIRST (it's on top). Reporters read `stMbSensors` (accel strength=√(x²+y²+z²);
  rotation pitch/roll from accelY/accelX). The earlier per-sprite under-the-board sliders were replaced because
  they were tiny/cramped in the docked stage. **Magnet** has a slider too (`mb_magnetic_force`→`stMbSensors.magnetic`).
  The **panel is draggable** (`stMbPanelPos`/`_mbPanelDrag` — grab anywhere on it to reposition; reset to default
  each play). **Tilt gestures:** `mbTiltGestures()` (in `stageFrame`) edge-triggers `on gesture` tilt_left/right
  (accelX) + logo_up/down (accelY) when the Tilt sliders cross ±700 (`_mbTiltState` prevents refiring).
- **Gesture tap-buttons + mic (DONE):** `mbDetectControls` also collects `stMbGestureUsed` from `mb_on_gesture`
  blocks; `mbPanelLayout` packs a "tap to test" button per used gesture (`MB_GLABEL`), firing `mbFireGestureAll`.
  `mbPanelHit` returns `{kind:'slider'|'gesture'|'mic'}`. A 🎤 **mic** chip (shown when sound is used) toggles
  `mbToggleMic()` → `getUserMedia` (browser permission = the safeguarding consent gate) → AnalyserMode RMS →
  `stMbSensors.sound` each frame (`mbMicLevel` in `stageFrame`; `mbStopMic` at `stageStop`).
- **Music (full-ish range):** added `mb_set_volume` (0–255→`stSetVolume`), `mb_play_sound` (v2 sound expressions
  `MB_SOUNDS`), `mb_start_melody` (once/forever — background fiber via `stMbMelodyGen`, tagged `_mel`),
  `mb_stop_all_sounds` (stops sounds + kills `_mel` fibers); `MB_MELODIES` expanded to ~12. Reuses Web Audio `stTone`.
  **Custom melody** `mb_melody` (MakeCode-style): `window.FieldMelody` (lazy `defineMbMelodyField()`) — inline 8×8
  preview + a real **pop-up editor** on click; value = 8 digits 0–8 (0=rest); `mbMelodyFromString(val,tempo)`→
  [[freq,sec]] via `MB_MEL_PITCH` (C-major octave); "until done" yields, "in background" spawns a `_mel` fiber.
  `stMbMelodyGen` skips rests (freq 0). **GOTCHA (fixed):** inline-SVG-cell `conditionalBind` clicks DON'T work in
  Blockly fields — both grid fields (`FieldMelody`, `FieldLeds`) now edit via `mbOpenGridEditor()` which builds a
  clickable HTML grid in `Blockly.DropDownDiv` (set `EDITABLE=true` + `showEditor_`); the melody editor also has a
  ▶ Play button (schedules `stTone` for the current pattern).
- **Toolbox reorg (DONE):** the four flat `📟` categories are now ONE `📟 micro:bit` parent with nested
  sub-categories — ⬜ Basic / 🎮 Input / 🎵 Music / 💡 LED / 📻 Radio / 🔁 Control (Blockly renders them as an
  expandable tree). The `MICROBIT_ON` toolbox filter still keys off `indexOf('📟')` on the single parent.
- **Radio gotcha (FIXED):** `stRadioPump` used to gate delivery on `curCostume(s).builtin==='microbit'`, so a
  receiver not currently wearing the micro:bit costume silently got nothing. Now it delivers to ANY other sprite
  in the same group (sets rxNum/rxStr + fires hats) — costume-independent. Groups must match on both ends.
- **Radio received value as a parameter (DONE):** `mb_on_radio_number`/`mb_on_radio_string` now carry a
  `FieldVariable` (default `receivedNumber`/`receivedString`, like MakeCode). Hat collection stores `vn:stVarName(b,'VAR')`;
  `stRadioPump` sets `stVars[vn]=value` before firing the hat, so the kid can drag the variable into the handler.
  (The `mb_radio_number`/`mb_radio_string` reporters still exist as an alternative.)
- **Deliberately NOT done:** Pins / Serial (need real hardware), the LED-sprite Game category, and Images-as-
  variables (advanced) — deferred. `magnetic_force` is a fixed 0 (no slider).
- **Verified:** all 4 categories + 34 new blocks register; arrows/show-leds/brightness/toggle/plot-brightness/
  bar-graph/tempo/tone(yields)/run-background/radio(42 between two sprites)/sensors all behave; custom FieldLeds
  renders 25 cells & validates; A/B/A+B/Shake/logo interactive; visual screenshots confirm the board + features.

## Key Stage 1 — ScratchJr-style Stage editor (NEW, in progress)
KS1 (`keyStage==='ks1'`) now gets a custom **ScratchJr-style** editor for **Stage** projects (KS2/KS3 keep Blockly/Python).
- **Gating:** micro:bit hidden in KS1 (`pickableCostumes()` + `stageToolbox()` filter both add `&&keyStage!=='ks1'`).
- **Data:** each sprite has `s.ks1` = array of scripts; each script = array of `{t,n?,text?}` with the FIRST block a
  trigger (flag/tap/bump). `blankSprite` seeds `ks1:[]`; `sanitizeStage` keeps it via `sanitizeKs1()` (validates
  block types against `KS1_BLOCKS`, drops unknowns). Saved in payload as part of `stageState`.
- **Blocks:** `KS1_CATS` (Start/Move/Looks/Sound/Control/End — colour-coded, each with an `icon`; tabs show icon
  + label) + `KS1_BLOCKS` table (icon/cat/num?/text?/hat?/container?). Triggers: flag/tap/bump. Motion: right/left/
  up/down/turnR/turnL/hop/home. Looks: say/grow/shrink/resetSize/hide/show. Sound: pop. Control: wait/repeat/stop.
  End: forever.
- **Loops are CONTAINER blocks (ScratchJr-style), NOT slice-based:** `repeat`(num) & `forever` have `container:true`
  and a `body:[]`. `ks1RunSeq` runs `repeat` body N times then continues; `forever` loops its body and returns.
  Rendered as a bracket (`.ks1-cont` head + `.ks1-cont-body` + ↺ cap) you tap to "open" (`ks1Target.rep`), then
  added blocks go inside it; adding a new container auto-opens it. `sanitizeKs1Block` recurses into `body` (depth≤3).
- **Interpreter (reuses the Stage fiber engine):** `ks1RunSeq`/`ks1RunOne` generators; `ks1Move`/`ks1Hop`/`ks1Turn`
  animate over frames. `forever` loops the blocks BEFORE it; `repeat N` repeats the blocks AFTER it N times; `stop`
  throws `{__stopThis}`. `ks1CollectHats(s)` (called from `stageStart` when ks1) starts flag scripts + registers
  `ks1TapHats`/`ks1BumpHats`; `stageFireClick` fires tap, `stageFrame`→`ks1BumpCheck` fires bump (edge-triggered).
  KS1 sprites visibly rotate (`drawStageSprite` rotates by `dir-90` when ks1).
- **UI:** `enterStageUI()` branches to **`enterKS1UI()`** for ks1 (builds `#ks1-ui`: character list + stage on top;
  bottom `.ks1-prog` is a ROW = labelled category tabs (`.ks1-cats`) on the far left spanning full height, then
  `.ks1-progmain` column = palette on top + horizontal script strip below — this layout keeps the script visible).
  `ks1RenderCats/Palette/Sprites/Scripts`, `ks1BlockEl` (renders normal OR container blocks recursively),
  `ks1AddBlock` (respects `ks1Target={si,rep}`: trigger→new script, normal→active script/open-loop, container→
  auto-opens), `ks1BindAdd` (tap to add; pointer drag-with-ghost drops onto a `.ks1-strip`/`.ks1-cont-body` via
  `data-si`/`data-rep`). Blocks have − / + steppers, a say text input, and an always-visible ✕ delete. `exitStageUI`
  hides `#ks1-ui` + removes `body.ks1-mode`; `stageSelectSprite` re-renders KS1 panels instead of Blockly.
- **Verified:** build via taps → correct `s.ks1`; GO runs (cat moved/grew/said, tap & bump fire); sanitize round-trips.
- **Drag-to-reorder + read-aloud + painter (DONE):** `ks1BindReorder(el,srcArr,idx,si,onTap)` drags a script block
  (ghost) to reorder within a strip / into a loop body / out-to-delete (target via `data-si`/`data-rep` + `ks1InsertIndex`);
  a non-drag tap calls `onTap` (opens a container / speaks). `ks1Speak(text)` (gated by `ks1ReadAloud`, default on,
  toggled by the 🔊 `.ks1-readtog` button) speaks a block's `say` on add/tap. **Sprite customisation/painter:** each
  KS1 character card has a 🎨 `.ks1-sdress` button (+ double-click) → reuses the existing `openCostumePicker()`
  (character library minus device costumes, colours, rename, 🎨 Paint new → `openPaintEditor`, Add character).
  `renderSpritePanel()` calls `ks1RenderSprites()` when in ks1-mode so thumbnails refresh after costume edits.
- **Messages + speed + Ideas (DONE):** `on_msg`(hat)/`send_msg` carry a colour field `c` (0–5, `KS1_MSG_COLORS`,
  cycled by `ks1ColorChip`); `ks1SendMsg(c)` fires all matching `on_msg` hats (collected in `ks1CollectHats`).
  `speed`(🐢🚶🐇 via `ks1SpeedChip`, `b.n` 1–3) sets per-sprite `s._ks1speed` (reset 2 in `stageStart`); `ks1Steps(s,base)`
  scales the animation frame count in `ks1Move/Hop/Turn`. `sanitizeKs1Block` keeps `c`. **✨ Ideas gallery**
  (`KS1_IDEAS` + `ks1OpenIdeas` modal `#ks1-ideas`, button in the sprites column) loads a ready-made script into the
  current sprite.
- **Pages/scenes (DONE):** `stageState.pages=[{sprites,backdropIdx}]` + `pageIdx`; top-level `stageState.sprites`
  MIRRORS the active page (same ref). `ks1RenderPages`/`ks1SwitchPage`/`ks1AddPage`/`ks1DeletePage` (page strip
  `#ks1-pages`, max 4, double-tap → `openBackdropManager`). `go_page` block (End) sets `stPendingPage`; `stageFrame`
  calls `ks1DoPageSwitch(n)` (drops fibers, swaps sprite set + backdrop, re-collects hats so the new page's flag
  scripts run). `sanitizeStage` handles `pages` (via extracted `sanitizeStageSprites`) — active sprites = `pages[pageIdx]`.
- **Record sound (DONE):** `recsound` block (Sound) + `ks1RecordDialog` (MediaRecorder → dataURL, mic permission =
  consent gate, 10s cap, 800KB cap) stores into `stageState.ks1sounds` (sanitised by `sanitizeKs1Sounds`); `b.n`
  references it; runtime plays via `new Audio(data)`.
- **Guided missions (DONE):** `KS1_MISSIONS` (steps with `ok(s)` predicates using `ks1HasTrig/HasBlock/HasInLoop`);
  `ks1OpenMissions` chooser, `ks1StartMission`/`ks1MissionTick` (500ms `setInterval`) advances steps; coach bubble
  `#ks1-coach`. 🎯 Missions button in the sprites column; `exitStageUI`→`ks1StopMission`.
- **KS1 live-collab (DONE, wired — needs 2-device verify):** `markDirty` now sends `collabSnapshotSoon()` for KS1
  Stage (small data) as well as platformer; `collabApplyDoc` re-renders the KS1 panels after a remote change.
  (Recorded-sound dataURLs bloat snapshots — fine for v1; revisit if needed.)
- **go-to-page = ScratchJr-style (FIXED):** `go_page` has `page:true` (no stepper). `ks1RenderPalette` renders ONE
  "go to page N" block per existing page (badge = N); `ks1AddBlock(type,extra)`/`ks1BindAdd(el,type,extra)` carry
  the target `{n}`. Script block shows a `.ks1-pbadge` page number.
- **Accessibility (DONE, app-wide):** `a11yState`/`a11ySave`/`applyA11y` toggle body classes from `localStorage`
  `bap_a11y` — `a11y-dyslexia` (rounded font via `--font` + spacing), `a11y-bigtext` (`zoom:1.12`), `a11y-contrast`
  (outlines), `a11y-reduce` (no animation/transition); plus read-aloud (ties into `readAloud`/`ks1ReadAloud`).
  `a11yOpen()` modal `#a11y-modal`. Buttons: home `#h-a11y` (♿) + KS1 column `.ks1-a11ybtn`. `applyA11y()` runs at load.
  NOTE: read-aloud's `speak()` is still gated to `keyStage==='ks1'`; the other a11y options work in all key stages.
- **TODO / not yet done:** nothing major for KS1; possible polish — per-page backdrop thumbnails, palette→loop-body
  drop on first drag, more missions/ideas.

## Teacher Guide — Stage coverage (DONE)
`teacherGuideHTML()` now has a **🎭 Two project types: Platformer & Stage** section (KS1 ScratchJr editor, KS2/KS3
full Scratch-style blocks, the 📟 micro:bit emulator) and an **♿ Accessibility** section. Keep this in sync when
Stage/KS1 features change (same rule as the in-app Help/`HELP_TABS`).

## Context-aware Help + KS1/KS2 stage-switch fix (DONE)
- **Help is now context-aware:** `helpTabs()` returns `STAGE_HELP_KS1` (ScratchJr) / `STAGE_HELP` (KS2/KS3 Blockly)
  when `projectType==='stage'`, else the platformer `HELP_TABS`. `openHelp`/`buildHelpTabs`/`selHelpTab` use it.
  Stage cloud/teamwork tab reuses the platformer's content (`_cloudHelp`). The ❓ Help button (`btn-help`, visible in
  stage mode) calls `openHelp`.
- **BUG FIXED — KS2→KS1 stage left the Blockly panel visible:** `body.stage-mode #code-panel{display:flex!important}`
  also applied in KS1 (KS1 is stage-mode too). Added `body.ks1-mode #code-panel,#stage-right,#cwrap{display:none
  !important}` and `enterStageUI` (KS2 path) now clears `ks1-mode`, un-hides `#ks1-ui`/panels, and stops any KS1
  mission, so switching either direction is clean.

## Stage block tooltips / hover descriptions (DONE — all key stages)
- **KS2/KS3 (Blockly):** `ST_BLOCK_DESC` (type→plain-English) + `stApplyTooltips()` (called at the end of
  `defineStageBlocks`) wraps each block's `init` to `setTooltip(...)` once (`._stTip` guard; safe across re-defines).
  Covers ~114 st_*/mb_* blocks → standard Blockly hover tooltips.
- **KS1 (ScratchJr):** `KS1_DESC` (type→description); `attachTip()` (the platformer `#tip` system: hover + touch
  long-press) attached to palette blocks, script blocks (`ks1BlockEl`), category tabs, and go-to-page blocks.

## Policies (Privacy / Data Protection / Safeguarding) — DONE
Home-footer links (`#pol-privacy`/`#pol-data`/`#pol-safe`, in `.pcl-policies`) open `openPolicy(which)` → `#policy-modal`
showing content from the `POLICIES` map (contact = `POLICY_CONTACT`). Content is grounded in the app's real
behaviour (device localStorage, optional Cloudflare cloud accounts, the teacher-bulk `pwPlain` plaintext-password
note, share links, invite-by-display-name collab, mic permission / no camera, no analytics). **These are drafts — the
school/org is the data controller and should review/adapt them.** Keep in sync if data handling changes.

## Turtle (Logo) project type — `projectType==='turtle'` — NEW, DONE & verified
A third project type alongside platformer/stage: a **text Logo playground** (like TurtleAcademy's), chosen via the
🐢 button added to `#pt-modal` → `startNewTurtle(ks)`. Self-contained, gated entirely behind `projectType==='turtle'`;
platformer & stage untouched.
- **Seams (mirror Stage):** `#pt-modal` chooser → `startNewTurtle` → `enterTurtleUI`/`exitTurtleUI` (toggle
  `body.turtle-mode`); `switchMode` early-returns to `enterTurtleUI` for turtle (and `exitTurtleUI` when entering
  other types); `loop()` dispatches `if(projectType==='turtle'){turtleFrame();return;}` before stage/platformer;
  `buildPayload` adds `turtle:{code}`; `applyPayload` restores it + enters the playground (legacy/other payloads
  call `exitTurtleUI`). `showHome` + `enterStageUI` also call `exitTurtleUI`.
- **UI (`#turtle-ui`, inside `#cwrap`):** left = `#turtle-bar` (▶️ Run/⏹️ Stop/🧹 Clear/📖 Commands/✨ Examples +
  `#turtle-status`) over a `#turtle-code` textarea; right = `#turtle-canvas` (600×600) + a 🐢 speed slider. The
  `body.turtle-mode` CSS hides all platformer/stage chrome (incl. `#btn-help` — the turtle has its own 📖 Commands),
  reuses the header's Save/Cloud/Share/Help. Stacks vertically ≤820px. Bound once via `turtleBindOnce` (`_turtleBound`).
- **Interpreter (own, generator-based like the Stage fibers so long REPEATs animate, don't freeze):** `turtleTokenize`
  (regex; `;` comments stripped) → `turtleExtractProcs` (pulls `to NAME :params … end` into `turtleProcs`, returns the
  runnable main tokens) → `turtleRunSeq`/`turtleRunStmt` (generators; `yield` = one animation step). Expressions:
  `turtleExpr`(compare) → `turtleSum` → `turtleTerm` → `turtleFactor` (numbers, `:vars`, `( )`, unary `-`, reporters
  `random`/`repcount`/`xcor`/`ycor`/`heading`). Commands: fd/bk/rt/lt, pu/pd, ht/st, home, cs/clean, setpensize,
  setpencolor (`"name` | `[r g b]` | 0–15 palette via `turtleColorArg`+`TURTLE_PALETTE`/`TURTLE_NAMES`), setbg, setxy/
  setx/sety, seth, wait, repeat `[ ]`, if/ifelse, make, stop (throws `{turtleStop}`), and user procedures (recursion
  capped at depth 900, params dynamically scoped via save/restore). **Scratch-ish coords:** centre origin, +y up,
  heading 0=up/90=right; draw transform `cx=TW/2+x, cy=TH/2-y`.
- **Rendering:** a persistent offscreen `turtleDraw` canvas holds the lines (cleared by cs/clean); each frame
  `turtleRender` fills `turtleBg`, blits the drawing, draws the turtle triangle (rotated by heading). `turtleFrame`
  pumps `TURTLE_BUDGET[turtleSpeed]` generator steps/frame (speed 10 ≈ instant), with a 6M-step runaway cap. Errors →
  friendly `turtle-status` messages (`I don't understand "x"`, `I don't know the variable :x`, missing `end`/`]`).
- **Commands/Examples** via `#turtle-modal` (`turtleShowCommands` from `TURTLE_COMMANDS`, `turtleShowExamples` from
  `TURTLE_EXAMPLES` — tap loads + runs). **Launches BLANK** (`startNewTurtle` sets `turtleCode=''`; `enterTurtleUI` uses
  `turtleCode||''`). `TURTLE_DEFAULT` (a star) is kept only as the `applyPayload` fallback for missing code.
- **KS2+ only:** the 🐢 option in `#pt-modal` is hidden when `_pendingKs==='ks1'` (typed Logo is too hard for KS1; KS1
  keeps the ScratchJr Stage). Shown for KS2/KS3.
- **In-app Help:** `TURTLE_HELP` (Start/Commands/Variables+own-commands/Save&Share/Cloud, Cloud reuses `_cloudHelp`);
  `helpTabs()` returns it when `projectType==='turtle'`. The header ❓ Help button is visible in turtle mode (NOT hidden).
- **No live collaboration:** Turtle has no granular collab ops, so `openShareModal` hides the 🤝 Collaborate button when
  `projectType==='turtle'` (🔗 short-link Share + 💾 Save still work).
- **Sharing/saving fixed for ALL types:** `openShareModal` now only blocks on `validate()` for `projectType==='platformer'`
  (stage & turtle always shareable). **Device save/load was platformer-only (latent bug for Stage too):** `saveCurrentLevel`
  now stores `buildPayload()` (full, captures stage/turtle) and `loadSaveData` does `applyPayload(save)` directly — so
  device-save round-trips Stage AND Turtle now, not just platformer. Cloud/short-link share work automatically (they pack
  buildPayload). Save thumbnails (`drawMiniThumb` on `save.grid`) show blank for turtle/stage — cosmetic, fine for now.
- **Verified in-browser:** chooser shows 🐢; star/flower/spiral/nested-repeat/recursion(fractal tree)/procedures+vars/
  if-ifelse+random all draw `Done ✓`; friendly errors; device save→home→load round-trips; build→platformer→back via
  payload works. KS2+ only (hidden in KS1); launches blank; ❓ Help shows TURTLE_HELP; Collaborate hidden in Share.
- **TODO / not yet built:** a turtle thumbnail for saved-project tiles (currently blank); more examples/guided missions;
  possibly `pr`/print output.

## 3D World project type — `projectType==='3d'` — PROTOTYPE (Babylon.js), behind `THREED_ON`
**PARKED (2026-06-16): `THREED_ON=false`** so the 🧊 option is hidden from `#pt-modal` and none of the 3D work ships —
the user wants it kept out of production for now (like the Ohbot stuff). All the 3D code (Waves 1–5, the modern-render
pass, and the half-built **edit-mode move gizmo + live `td3Preview`** — `td3Gizmo`/`td3GizmoMoved`/`td3Preview`/
`td3PreviewSoon`, NOT yet verified in-browser) stays in the file but is inert while the flag is off. Flip to `true` to
resume. Don't re-enable for deploy without finishing/verifying the gizmo+preview pass.
A 4th project type alongside platformer/stage/turtle: a **block-based 3D scene builder** (Flock-style). Chosen via the
🧊 button in `#pt-modal` → `startNew3D(ks)`. Gated entirely behind `projectType==='3d'` + the `THREED_ON` flag (KS2+ only).
- **Babylon.js is LAZY-LOADED from a CDN** (`load3DEngine()` injects `https://cdn.jsdelivr.net/npm/babylonjs@7/babylon.js`,
  global `BABYLON`) **only when a 3D project opens** — so the rest of the app stays offline-capable. 3D mode needs internet
  the first time. This is the one architectural deviation from the single-file/offline model (Babylon is ~5MB).
- **Reuses the existing Blockly editor** (not a separate canvas like Turtle): `enter3DUI` shows `#code-panel` (Blockly) on
  the left + a new `#threed-right` dock with `#threed-canvas` (Babylon) on the right (`body.threed-mode`, mirrors stage CSS).
  `getToolbox()`/`getDefaultXml()` return `threeDToolbox()`/`threeDDefaultXml()` when `projectType==='3d'`; `define3DBlocks()`
  is called in `initBlockly`. Toolbar swaps in 🟢 `btn-3drun`/⏹️ `btn-3dstop` (`.threed-only`).
- **Blocks (`td_*`, ~11):** When (`td_on_start`,`td_when_click`), Shapes (`td_add` box/sphere/cylinder/cone/ground with
  name+colour+xyz), Move (`td_move`,`td_rotate`,`td_scale`), Looks (`td_color`,`td_sky`), Control (`td_wait`,`td_repeat`,
  `td_forever`). Names are plain text fields; move/rotate/colour reference a mesh by name (no dynamic dropdowns).
- **Interpreter:** generator fibers like Stage/Turtle — `td3RunSeq`/`td3RunOne` walk the Blockly block chain directly
  (`getNextBlock`/`getInputTargetBlock`/`getFieldValue`), `yield` = one frame. `td_on_start` → a fiber at Run; `td_when_click`
  → Babylon pointer-pick (`scene.onPointerDown`) fires `td3FireClick(meshName)`. `td3Frame()` (called from `loop()` when
  `projectType==='3d'`) pumps fibers + `scene.render()`. Meshes kept in `td3Meshes` (name→mesh); `td3Run` rebuilds the scene.
- **Persistence:** uses the SHARED `blocklyXml` payload field (no new field needed) — `buildPayload` already captures it,
  `applyPayload` 3d-branch calls `enter3DUI` then the existing blocklyXml loader populates the workspace. Device save/cloud/
  short-link share all work; **live collaborate is hidden for 3D** (no granular ops yet — `openShareModal` filter).
- **Scene (Flock-like polish):** ArcRotateCamera (orbit/zoom), hemispheric + directional light with a **ShadowGenerator**
  (blur exp shadow map; every added shape is a caster, ground receives). **Gradient sky dome** (`td3Sky`, a big BACKSIDE
  sphere with an emissive DynamicTexture gradient repainted by `td3SetSky`/`td3PaintSky`; `td_sky` block recolours it).
  Ground gets a **grid DynamicTexture** (`td3GroundTex`).
- **Model library (clean-room low-poly):** `td_add`'s shape dropdown includes `person`/`tree`/`car` (in `TD3_MODELS`),
  built from grouped primitives under a `TransformNode` by `td3BuildModel` (person = head+body+arms+legs, tree = trunk+
  foliage, car = body+roof+4 wheels). **Each mesh entry is now `{root,parts,kind}`** (root = mesh or TransformNode): move/
  rotate/scale act on `root`; `td_color` recolours all `parts`; click-pick maps `mesh.metadata.cjName`→model name. Adding
  more models = one `td3BuildModel` branch + a SHAPES entry. Starter program: sky + grass ground + tree + person + crate +
  forever-spin the person.
- **Verified in-browser:** chooser shows 🧊 (KS2+, hidden KS1); Babylon loads from CDN; starter scene renders (ground/cube/
  sphere) with the cube spinning; save→platformer→load round-trips (projectType + blocklyXml). 
- **Researched Flock XR (flipcomputing/flock on GitHub) in depth** — its blocks live in `blocks/*.js` (scene, shapes,
  models, transform, materials, animate, physics, events, control, sensing, sound, camera, effects, xr, combine…). Key
  Flock paradigms: **variable-per-object** (each created mesh → a Blockly variable), a **glTF model/character library**
  (grid-dropdown pickers, customisable hair/skin/clothes), **Havok physics**, rigged-character **animations**
  (play/switch named animations), follow-camera, on-screen + micro:bit controls, TTS speak, ABC-notation tunes, VR/AR.
- **WAVE 1 "make it playable" DONE & verified (user chose this + hand-built models, not glTF):** added a **Game** toolbox
  category + key/touch events. New blocks: `td_gravity` (object falls), `td_solid` (others land on / can't pass it; ground
  auto-solid), `td_control` (arrow-keys/WASD drive a mesh + Space to jump; also shows the on-screen d-pad), `td_camera_follow`
  (third-person follow), `td_on_key` (hat), `td_on_touch` (hat, A touches B). **Lightweight offline physics** (no engine
  loaded): `td3Physics()` each frame does AABB gravity + resting on ground/solid tops (`td3RestY`) + wall blocking
  (`td3TryMove`) using `root.getHierarchyBoundingVectors` (works for both primitive meshes AND TransformNode models).
  Per-entry flags `dynamic/solid/control/vy/grounded` (reset in `td3Add`). Keyboard via window keydown/keyup → `td3Keys`
  (+ `td3FireKey` for `td_on_key`); **on-screen d-pad** `#threed-pad` (4 arrows + Jump, shown when a `td_control` runs).
  Camera follow lerps `td3Cam.setTarget` to the followed mesh. Default program is now a playable scene: ground + tree +
  solid block + driveable hero (camera follows) + a crate that falls. **Verified:** crate falls 5→0.58 & rests; hero moves
  with arrows + jumps; pad appears; touch/key/click hats fire.
- **WAVE 2 "animations + more models" DONE & verified:** `TD3_MODELS` now has person/tree/car + **cat/dog/duck/house/
  rocket/robot/flower** (all hand-built low-poly in `td3BuildModel`; added to the `td_add` SHAPES dropdown). New **Animate**
  toolbox category: `td_animate` ("play [spin/bob/bounce/wobble/pulse] on NAME" → sets `entry.anim`) + `td_stop_anim`.
  `td3Animate()` (called each frame in `td3Frame`) applies the looped motion: spin=rotation.y, wobble=rotation.z,
  pulse=scaling, bob/bounce=position.y (skipped for dynamic/controlled meshes so it doesn't fight gravity). `entry.anim`
  reset in `td3Add`. Default scene gained a bouncing duck + a flower. **Verified:** all 7 new models build; duck bounces.
- **WAVE 3 "sound + sensing/looks" DONE & verified:** new toolbox categories **Sound** + **Sensing**, plus glide/glow.
  Sound (reuses the Stage Web-Audio synth — `stPlaySound`/`ST_SOUNDS`/`stTone`/`stAudioCtx`): `td_play_sound` (built-in
  sounds), `td_play_note` (note dropdown C..high-C → freq, N secs), `td_speak` (TTS via `SpeechSynthesisUtterance`).
  Move: `td_glide` (eased smooth move to x/y/z over N secs — fiber that yields per frame, easeInOut-quad). Looks: `td_glow`
  (sets parts' `emissiveColor`). Sensing **reporters** (output blocks): `td_distance` (A↔B), `td_get` (x/y/z of a mesh),
  `td_touching` (AABB overlap bool). Control gained `td_if` (value COND + DO) and the STANDARD Blockly blocks
  `logic_compare`/`math_number`/`math_arithmetic`/`logic_operation`/`logic_boolean`. **`td3Eval(block)`** evaluates
  reporters + those standard value blocks (the 3D workspace already relaxes Blockly type-checking, so reporters plug into
  any value input). **Verified:** glide moved a box to target (distance reporter read 1 to its neighbour), glow set emissive,
  sound/speak wired. Also fixed a d-pad hide bug (`#threed-pad.hide{display:none!important}`).
- **WAVE 4 "scene + more sensing + more models" DONE & verified:** new **Scene** category: `td_fog` ("add fog colour C
  thickness 0-100" → `scene.fogMode=FOGMODE_EXP2`, fogColor, `fogDensity=amt/600`; 0 = off) + `td_light` ("set brightness
  0-2" → `td3Hemi.intensity`, the hemispheric light captured in `td3Init`). More **Sensing** reporters: `td_timer` (secs
  since Run — `td3StartTime` set in `td3Run`), `td_key_pressed` (bool from `td3Keys`), `td_random` (min/max field reporter).
  All three added to `td3Eval`. 5 more models in `td3BuildModel`+SHAPES+TD3_MODELS: **star/coin/rock/fish/bird** (now 15
  shape/model types). `td3Run` resets fog/light. **Verified:** new models build (star=2 parts, fish=3, bird=5), fog mode
  active, light=1, timer/random/key-pressed reporters correct; showcase screenshot of all models with fog.
- **WAVE 5 "variable-per-object + glTF library + rigged animations" DONE & verified (both big Flock items):**
  - **Object dropdowns (variable-per-object):** every block that REFERENCES a shape now uses a dynamic dropdown
    (`MN()`=`new Blockly.FieldDropdown(td3MeshOptions)`) instead of a typed name. `td3MeshNames()` scans the workspace's
    `td_add` blocks; `td3MeshOptions()` (called with `this`=field) maps them to options AND **prepends the field's current
    value if missing**, so saved programs never hit Blockly's "reset-to-first-option" bug. `td_add`'s NAME (you type it on
    create) and `td_speak`'s TEXT stay text inputs. Runtime unchanged (`getFieldValue` still returns the name string).
    **Verified:** default scene's dropdowns loaded as hero/block1/crate/duck1; menu lists all created shapes; program runs.
  - **glTF model library + rigged animations:** `load3DEngine()` now also injects **`babylonjs-loaders`** (the glTF plugin).
    `TD3_GLTF` library (CORS-friendly jsDelivr CDN): **robot** = three.js RobotExpressive (14 anims: Idle/Walking/Running/
    Dance/Jump/Wave/Punch/…), **fox** = KhronosGroup Fox (Survey/Walk/Run). `td3LoadGLTF(name,url,scale,x,y,z)` →
    `BABYLON.SceneLoader.ImportMeshAsync`, parents meshes under a TransformNode, registers an entry `{root,parts,kind:'gltf',
    anims:animationGroups}` (+ shadow casters); **graceful fallback to a grey box** if the fetch fails so the program still
    runs. Blocks (new **Models** toolbox category): `td_load` ("load [robot/fox] called NAME size/x/y/z" — a fiber that
    YIELDS until the async load resolves, guard-capped) + `td_play_anim` ("play animation [idle/walk/run/jump/dance/wave/
    punch/survey/sit] on NAME" — stops all groups, **substring-matches** the wanted name to the model's real anim, starts it
    looped). `td3Dispose` now disposes `anims`. **Verified in-browser:** loaders fetch, robot loads with 14 named animation
    groups, Dance plays (isPlaying), fox loads with 3 anims and walks; both render rigged + shadowed (screenshot).
  - **Note:** glTF needs internet (3D already loads Babylon from CDN). Models are permissive/CC0-ish samples (Khronos Fox =
    royalty-free sample; RobotExpressive by Tomás Laulhé, CC0 mods by Don McCurdy) — for a branded public launch, host your
    own vetted CC0 models on GitHub Pages and point `TD3_GLTF` at them.
- **TODO / not yet done (it's a prototype):** a curated/hosted CC0 model set (replace the demo CDN URLs), a model-picker
  grid (Flock-style) + per-model animation dropdowns, a 3D-specific Help tab (btn-help hidden in 3d-mode), performance
  testing on school Chromebooks/iPads, and deciding whether to vendor Babylon vs CDN. No CJ_VERSION bump / What's New yet —
  it's experimental behind `THREED_ON`.

## Designed icon set (replacing emoji-as-icons) — DONE & verified (app-wide)
**COMPLETE as of CJ_VERSION 2026.08.08.** Every displayed emoji across the whole app is now a hand-designed SVG icon
or clean text. Only emoji LEFT in the file are 4 protected internal lines (not displayed as bare emoji): the
`STAGE_COSTUMES` `e:` data table (line ~3871, costume picker now shows a painted canvas + the costume NAME, not `.e`),
the `EMOJI_ICON` map keys (~4231), and the `FE0F` literals in the appendField patch regex (~4241/4243). A blanket strip
would corrupt these — keep them protected if re-running any emoji sweep.
- **DOM icons:** inline `<svg class="ic"><use href="#i-NAME"></use></svg>` from the `#icon-sprite` symbol sprite (~120
  symbols). `ksvg(name)` returns that markup string for JS-built DOM. CSS `.ic` + context sizings (`.bi`/`.ks1-cati` get
  `filter:brightness(0) invert(1)` → white glyphs on KS1's coloured blocks; `.pal-icon`/`.sh-ico`/`.ks-emoji` sized).
- **Blockly blocks:** can't use the HTML sprite → patched centrally. `installBlocklyIconPatch()` (called at the top of
  `defineBlocks` AND `defineStageBlocks`) wraps `Blockly.Input.prototype.appendField`: a leading emoji becomes a
  `Blockly.FieldImage` built from a sprite symbol via `symSvg(id)`→data-URI (`symField`), mapped by `EMOJI_ICON`
  (emoji→symbol id); any other emoji in the label is stripped. It also wraps `Blockly.FieldDropdown` to strip emoji from
  option display text. Toolbox category `name:` emoji were source-stripped (script). The micro:bit toolbox filter now
  keys off `indexOf('micro:bit')` (was `'📟'`).
- **Canvas-drawn labels** (ctx.fillText: micro:bit sensor panel, mic chip, Stage score badge, belt arrows) can't take
  SVG → stripped to plain text.
- **Prose** (help tabs+bodies, teacher guide, policies, What's New, toasts, tooltips, KS1 ideas/missions/tutorial,
  modal text) → emoji removed via a protected global strip (skips the 4 lines above). Display ternaries that PICKED an
  emoji (KS1 record chip, sprite eye) were converted to `ksvg(...)`; blanked close/delete glyphs (`✕`/`🗑️`/`↺`) and
  the help/projector/policy/coach close buttons were restored with `i-x`/`i-trash`/`i-loop` icons.
- **To add an icon later:** add ONE `<symbol>` to `#icon-sprite`; reference via `ksvg('i-x')` (DOM) or add an
  `EMOJI_ICON` entry (Blockly). Note `≈` geometric glyphs (▶ ● ○ — U+25xx) are NOT in the emoji ranges and remain in a
  few help bullets/`tut-dots` by design.

## Designed icon set — build history (superseded by the DONE note above)
The user wants **bespoke designed icons across the whole app** (wall-to-wall emoji "looks AI-made"). Chosen style:
**rounded, filled, colourful** (kept colour-coding for primary kids; NOT flat monochrome line icons). Approach:
- **Inline SVG sprite** `#icon-sprite` (a hidden `<svg>` with `<symbol id="i-NAME" viewBox="0 0 24 24">` defs), placed
  just before `<div id="home">`. Single source of truth — colours baked into each symbol.
- **Use sites:** `<svg class="ic"><use href="#i-NAME"></use></svg>`. CSS `.ic{width:1.2em;height:1.2em;vertical-align:-0.22em}`
  (`.hcard-icon .ic`/`.qs-ico .ic` are larger). To add an icon: add ONE `<symbol>` to the sprite, then reference it.
- **GOTCHA — JS-generated buttons re-inject emoji:** several chrome buttons set their own label in JS and will overwrite
  a static SVG. When converting, also fix the JS to emit `<svg class="ic"><use…>` via `innerHTML`. Already done:
  `setMuteIcons` (t-mute/play-mute/play-sfx → i-music/i-music-off/i-volume/i-volume-off), `updateReadBtn` (i-read),
  `updateAccountChips` (i-user/i-teacher/i-gear/i-key for t-account + home-account chips). Watch for the same pattern
  elsewhere (toasts, cloud screens, teacher hub, Blockly field labels, KS1 `KS1_BLOCKS`/`KS1_CATS` `icon:` emoji).
- **USER DECISIONS (locked):** (1) **Real SVG icons ON the Blockly blocks** — not strip-to-text. Implement via Blockly
  `FieldImage` with a `data:image/svg+xml,<encoded standalone SVG>` per icon. Needs a JS map of icon→standalone SVG string
  (the sprite `<symbol>`s use `<use>`, which does NOT work inside a data-URI in isolation — must inline the full markup).
  Also do toolbox category icons (Blockly 10 category `cssConfig`/icon class, or FieldImage isn't available for categories
  — likely a CSS background-image per category). (2) **Remove emoji from prose** — help tabs body, teacher guide, toasts,
  status strings (delete the glyph, don't inline SVG mid-sentence).
- **DONE so far:** icon sprite+CSS infra; **home page**; **main #toolbar** (all buttons; theme-sel emoji→plain words; JS
  buttons mute/account/sign-in/read rewired); **turtle toolbar** (run/stop/clear/commands/examples/speed); **ks-modal**
  (age1/age2/age3/ruler) + **pt-modal** (runner/stage/turtle); **code-panel run bar** (cp-run/cmds/clear); **stage sprite
  panel** head + costume/add; **share-modal** (send/people/link/gamepad/package). All verified on screen.
- **DONE chunk 2:** **turtle toolbar**; **ks-modal**+**pt-modal**; **code-panel run bar**; **stage sprite panel**;
  **share-modal**; **KS1 ScratchJr** fully — `KS1_CATS`+`KS1_BLOCKS` icons via `ksvg(name)` helper (→ `<svg class="ic"><use>`),
  ~27 KS1 symbols added (flag2/finger/bump/mail/arrows/rot/hop/home/bubble/grow/shrink/reset/eye(-off)/clock/rabbit/loop/
  handstop/infinity/finish/page), KS1 column buttons (read-toggle/Ideas/Missions/Access/dress). **KS1 uses white glyphs on
  coloured blocks** via CSS `.bi .ic,.ks1-cati .ic{filter:brightness(0) invert(1)}` (ScratchJr-like, fixes same-colour
  icon-on-block contrast). Verified on screen.
- **DONE chunk 3:** **Teacher Hub** (book/people/school/folder/cone/print); **accessibility modal** (a11yOpen rows
  font/zoom/contrast/turtle/read + title i-access). Added symbols i-print/i-cone/i-grid/i-font/i-zoom/i-contrast.
- **DONE chunk 4 — Blockly block-icon SYSTEM (PROVEN, in progress):** Blockly can't use the HTML `<use>` sprite, so blocks
  get icons via **`Blockly.FieldImage`** from inline-SVG **data URIs**. Helper at the top of `defineBlocks`:
  `const BICON={key:'<svg xmlns=… >…</svg>', …}` (STANDALONE svg markup, needs `xmlns`) + `bf(key,alt)` →
  `new Blockly.FieldImage('data:image/svg+xml,'+encodeURIComponent(BICON[key]),17,17,alt)`. Pattern per block:
  `appendField(bf('flag','start')).appendField('when game starts')` (was `appendField('🟢 when game starts')`).
  **Dropdown option emoji** can't be images → strip to clean text (e.g. `['Left Arrow','left']`). **Toolbox category
  names** (`name:'🔵 Player'`) can't take FieldImage either → strip the emoji to clean text (category colour still groups).
  **DONE & verified in canvas:** when_game_starts, when_key_pressed, player_move_left/right, player_jump (icons render).
  **TODO:** ~140 more block labels across platformer (player/physics/enemies/win/rules/sound/actions/values/logic/loops),
  **Stage** `st_*`, **micro:bit** `mb_*` — each needs a BICON entry (≈40–60 more standalone icons) + the bf() edit + its
  dropdown emoji stripped; plus strip ~45 toolbox category/option `name:` emoji. Largest remaining piece; grind by category.
- **TODO (still emoji):** remaining modals (cloud, settings, costume, backdrop, paint, policy, help `#help-modal` tabs+body,
  help-modal tab labels + bodies, turtle-modal, micro:bit send `#mbsend`, ks1 ideas/missions/record dialogs); **teacher
  hub** (lots); **KS1 ScratchJr** picture-blocks (`KS1_BLOCKS` `icon:`, `KS1_CATS` `icon:`, rendered in `ks1BlockEl`/
  `ks1RenderCats` — custom HTML, so SVG works; needs ~6 cat + ~30 block symbols); **Blockly blocks** (the big one —
  FieldImage, ~150 blocks across platformer/stage/micro:bit + toolbox categories); **prose** (help/guide/toasts strip).
  Big multi-pass surface (~1700 glyphs total). **No CJ_VERSION bump until broad enough to claim "redesigned icons".**

## Files
- **Master:** `/Users/charlie/build-and-play.html` — edit this.
- **Deploy copy:** `/Users/charlie/codejump/index.html` — after every change, sync with:
  `cp /Users/charlie/build-and-play.html /Users/charlie/codejump/index.html`
  The user uploads this to GitHub Pages manually.

## ALWAYS do after shipping a user-facing change (no need to ask)
Whenever I add or change a feature that users would notice, update the **"What's New" popup**
as part of the same task — do this automatically, don't ask permission:
1. In `build-and-play.html`, bump **`CJ_VERSION`** (date string, e.g. `'2026.06.09'`) near the
   bottom of the script.
2. Replace the **`CJ_WHATSNEW`** array with that update's bullet points (short, emoji-led,
   child/teacher friendly). It should describe the CHANGES IN THIS UPDATE, not the whole history.
3. Re-sync the deploy copy.
The popup shows once per version (tracked in localStorage `bap_seen_version`), so each version
bump = returning users see the new list once.

## ALWAYS keep the docs/help in sync (no need to ask)
Whenever I add or change a user-facing feature, also update the built-in help so it never goes
stale — do this automatically as part of the same task:

1. **New TILE (block on the grid):** add an entry to **`TILE_DESC`** (and a thumbnail colour in
   `drawMiniThumb`'s `clr` map). This AUTO-propagates everywhere: palette tooltips, the in-app
   **User Guide → Building** tab, and the **Teacher Guide** block reference all generate from
   `TILES` + `TILE_DESC`. Nothing else needed for tiles.
2. **New TOOLBAR button:** add an entry to **`TOOL_DESC`** (keyed by element id) for its tooltip.
3. **New CODING block / win condition / behaviour (not a tile):** update the hand-written copy in
   two places — the **`HELP_TABS`** `'code'` (and relevant) tab, and **`teacherGuideHTML()`**'s
   coding section — to mention it.
4. **Consider a guided mission:** for a noteworthy feature, add a step-set to **`MISSIONS`** and a
   launcher button in the `HELP_TABS` `'start'` tab. Mark KS2-only missions with `ks2:true`.
5. **New KS3 Python command:** add ONE entry to the **`KS3_API`** table (name, sig, desc, fn). This
   is the single source of truth — it auto-wires the runtime function AND appears in the in-editor
   **📖 Commands** reference. (Events live in `KS3_EVENTS`, language built-ins in `KS3_BUILTINS`.)
   Don't hand-code API functions anywhere else.
6. KS2-only features must be hidden in KS1 (palette filter in `buildPalette`, the `setKeyStage`
   reselect guard, and `ks2`-gated editors/blocks) — and say "(Key Stage 2)" in their description.

## KS3 Python — CJPy upgraded to "real Python" coverage (app 2026.09.03) — DONE & verified
User feedback: KS3 "didn't seem to use actual Python". Decision: follow the **MakeCode model** (their Python is
"Static Python" — an own-implementation subset over their engine, NOT CPython), i.e. extend CJPy rather than embed
Skulpt/Pyodide — keeps single-file/offline/sandboxed/friendly-errors. CJPy (~5545) now covers what KS3 lessons use,
so textbook code runs as written:
- **Language:** augmented assignment (`+= -= *= /= //= %= **=`), `**` power (right-assoc, Python precedence),
  f-strings (`f"Score: {x}"`, `{{ }}` escapes, nested quotes/brackets; parsed in tokenizer → FSTR token, expr parts
  re-parsed via `parse(toks,exprOnly)`), `print(...)` (multi-arg → `say`), dicts (JS `Map`: literals, index get/set,
  `in`, `for k in d`, `.get/.keys/.values/.items/.pop/.clear/.update`, `del d[k]`), `in`/`not in`, **chained
  comparisons** (`0 <= x < 10` → Chain node), slicing (`a[1:3]`, `[::-1]`, full Python clamp semantics, `SliceGet`),
  `del`, `import random` / `import math` / `from X import ...` (MODULES; **`random` is BOTH the legacy callable
  `random(a,b)` AND a module** — a function with `__module`/`__items` props, so old saves keep working),
  string methods (upper/lower/strip/lstrip/rstrip/title/capitalize/split/join/replace/find/count/startswith/
  endswith/isdigit/isalpha), list methods (+insert/index/count/sort/reverse/extend/clear/copy, pop(i)), builtins
  sorted/list/dict/bool/type/round(x,n), `input()` → friendly "use on_key" error.
- **Python-correct semantics (deliberate breaking changes):** `"a"+1` now ERRORS with a friendly "use str() or an
  f-string" hint (was silent JS concat — old saves relying on it will surface the error toast, message tells the
  fix); `==` is deep value equality for lists; `%` follows Python sign rules; `"ab"*3`/`[0]*5` repetition;
  `sort`/`sorted` numeric-aware. `CJPy.str` (exported pyStr) renders values Python-style (`[1, 'a', True]`) and
  `say()`/`print()` use it.
- **Docs synced:** KS3_BUILTINS table + openCommands Language section + Help 'code' KS3 paragraph + teacherGuideHTML
  KS3 paragraph all list the new coverage.
- **Verified:** 106-case node suite (scratchpad test-cjpy.js — legacy + new features + a full "lesson program") and
  a 15-check Playwright run in the real page (ks3Compile/ks3Call/game API/status bar/Commands modal/KS3_DEFAULT).
- **NOT done (next per user):** the API "construction kit" pass — widening KS3_API toward MakeCode-Arcade-style
  sprite/object creation; and possibly Blockly→Python one-way view (mbToPython pattern) as a KS2→KS3 bridge.

## Share links — CLOUD SHORT LINKS (v5) — DONE & verified
- **Problem:** old share was `?lvl=<base64 of whole project>` in the URL → broke for Stage projects with painted
  costumes/backdrops (an 18k-char URL). **Fixed** with cloud-backed short links.
- **Backend (`cloud/worker.js`, now v5, deployed via wrangler):** public, no-auth `POST /share {payload}` → `{code}`
  (7-char `shareCode()`, stored `share:<code>` in KV, cap `SHARE_MAX`=12MB) and `GET /share/<code>` → `{payload}`.
- **App:** `copyShareLink()` (async) POSTs `buildPayload()` to `/share` and copies `shareBaseURL()+'?s='+code` (~52
  chars); falls back to the legacy `?lvl=` embed only if cloud is off/fails AND small. On load, `?s=<code>` →
  `loadSharedCode()` fetches `/share/<code>` → `openSharedPayload()` (handles stage vs platformer). Legacy `?lvl=`
  and baked `__CJ_BAKED__` still work. `openShareModal` no longer requires start+goal for Stage projects.
- **Verified:** Stage w/ painted backdrop → 52-char link → opens correctly; platformer link round-trips too.
- **Live COLLABORATION for Stage — PROPER GRANULAR OPS, like the platformer (v-app 2026.07.14, worker still v5):**
  Stage no longer full-snapshots on edits (`markDirty` skips snapshot when `projectType==='stage'`). Instead,
  stable per-sprite `id` (`sid()`, in `blankSprite`+`sanitizeStage`) drives targeted ops sent via `collabStageOp`:
  `st_sprite` (name/x/y/dir/size/visible — drag throttled `collabSpriteThrottled`, drag-end/info-bar/eye/rename),
  `st_cos` (costumes — via `cmEmitCostumes` on all costume mutations), `st_xml` (blocks — `collabStageXmlSoon`
  debounced from the Blockly change listener, per selected sprite), `st_add`/`st_del` (sprite add/delete),
  `st_bd` (backdrops — emitted from every `renderBackdropManager();markDirty()` tail), `st_var` (var/list names —
  `stageSyncVars` emits when it absorbs a new name; listener calls it for stage). Incoming ops → `collabApplyOp`
  routes non-cell ops to `applyStageOp` (finds sprite by id, applies, re-renders panel; reloads OPEN sprite's
  blocks only if changed & not mid-drag → editing DIFFERENT sprites never disrupts). **Worker DO `applyOp`
  extended** to mutate `this.doc.stage` for each st_* op so new joiners get the current state (mirrors the cell-op
  pattern). Initial doc still seeded by the one `collabSnapshotNow` on connect to a fresh room. **Verified**: emit
  produces correct ops; applyStageOp correctly applies sprite-move / xml / add / del. (Full 2-device WS test still
  worth doing in prod.)
- **Stage live CURSORS — WHOLE-EDITOR HTML pointers (v-app 2026.08.06, supersedes the canvas-only version):**
  Originally cursors only tracked over the small stage canvas (`collabStageCursor(x,y)` from the gc mousemove,
  drawn in `drawStage`), so partners never saw each other while editing BLOCKS. Now cursors track the **whole
  stage editor**: a window-level `mousemove` (guarded by `collabActive && projectType==='stage' && body.stage-mode`,
  bound in the stage-controls IIFE near the gc handlers) calls `collabStageCursor(clientX,clientY)`, which sends
  `{type:'cursor',cell:{ex,ey}}` where ex/ey are **viewport fractions** (clientX/innerWidth) so pointers map across
  different screen sizes (throttled ~55ms). Rendering is now **HTML overlay** (not canvas): `renderCollabStageCursors()`
  maintains a fixed `#collab-cursors` layer (z-index 1500, pointer-events:none) with one `.cc-ptr` per remote uid
  (an SVG arrow in the user's colour + a `.cc-name` pill), positioned at `ex*innerWidth, ey*innerHeight`. Called from
  the `cursor` + `leave` message handlers, on window resize, and cleared in `collabDisconnect`. Works for BOTH
  KS2/KS3 Blockly Stage AND KS1 ScratchJr (overlay spans the viewport, both are `body.stage-mode`). `collabStageCursorGone`
  (window `blur`) sends a cell-less cursor to clear. No conflict with platformer tile cursors (stage carries `cell.ex/ey`,
  platformer `cell.r/c/lvl`; the old `drawStage` `cell.sx` draw path is now dead — sender no longer emits sx/sy).
  **GOTCHA:** `#cwrap` is collapsed in stage-mode (canvas moved to `#stage-right`), so an early attempt to use it as the
  coordinate reference gave near-zero positions — viewport fractions avoid this. **Verified:** two simulated remote
  cursors (Maya/Leo) render as named coloured arrows over the blocks area and the sprites/stage area at correct
  viewport-fraction positions. (Full 2-device WS test still worth doing in prod.)

## FULL-PROJECT AUDIT (2026-06-16) — bucket-1 + ALL Medium/Low FIXED (app 2026.08.14, worker v10); a few items deferred by decision
**ALL MEDIUM + LOW now FIXED & verified (app 2026.08.14):** M1 unsaved-work guard on the project chooser (`cjConfirm`);
M2 clearer Save/Share tooltips; M6 Stage idle-redraw throttle (`stageNeedsDraw` + `(tick&3)`, ~15fps when stopped); M8 demos
toast "Key Stage 2 example"; M9 platformer ≤820px compact toolbar/palette; M10 **session epoch** (worker v10 — sessions die
on password change/teacher reset; `/password` returns a fresh token, app stores it) + **`/share` per-IP/day rate-limit**
(mic-consent toggle NOT done — needs an admin settings system, still open); M11 **styled `cjAlert`/`cjConfirm`/`cjPrompt`**
(Promise-based, role=dialog + keyboard + focus) replacing ~18 native dialog sites (kid + teacher flows); M12 focus-visible
outlines app-wide + `.sr-only` + dialog ARIA + KS1 message chips show a NUMBER (not colour-only) + bigger tap targets.
LOW: L1 turtle `random` doc note; L2 friendlier recursion message; L3 KS1 char/page delete confirms; L4 type-label
thumbnails for stage/turtle/3d saves; L5 `st_compare` `=` uses `stBothNum` like `logic_compare`; L6 `say…for N secs` bubble
visible the whole time (`sayT=99999`); L7 teacher saving to own class no longer sets `handedIn` (worker); L8 ≥40px tap
targets; L9 legacy `?lvl=` decode shows a friendly toast. **Verified:** GATE round-trip, undo cfg, turtle ÷0, dialog
system (role/aria/keyboard), KS1 chip number — all in-browser. **STILL OPEN (by decision / bigger):** C1 teacher access-code
(deferred), C2 `pwPlain` (deliberate), M10 mic-consent toggle (needs admin UI), and full WCAG keyboard-nav of Blockly/canvas
(inherent to those tools). **Worker is now v10 — NEEDS REDEPLOY.**

### Earlier status
## FULL-PROJECT AUDIT (2026-06-16) — bucket-1 bugs FIXED (app 2026.08.13); CRITICAL security still needs a decision
**FIXED & verified (app 2026.08.13):** H1 GATE clamp (`T_MAX` computed from `T`, used in `sanitizeGrid`; gate survives load —
verified), H2 undo now snapshots ALL 9 *Cfg maps (`snapState`/`restoreState` — verified chest cfg restores), H3 `setSaves`
returns false on quota + `saveCurrentLevel` shows "storage full" instead of false success (+ "oldest removed" note), H4 Stage
clones now receive broadcasts (`stBroadcast`/`st_broadcast_wait` loop `stClones` by `_src`) AND are clickable (`stageFireClick`
hit-tests `stClones`), H5 KS1 `forever` always `yield 0`s (no freeze — matches `st_forever`), H6 turtle `/0` → friendly
"can't divide by zero" + non-finite guard in `turtleMove` (verified, no hang), M5 `speak()` no longer KS1-gated (read-aloud
app-wide — verified), M7 `stageStop` restores costumeIdx + resets `_z`/`fx`, M3 KS1 Ideas APPENDS (no wipe), M4 KS1 speed chip
shows i-turtle/i-run/i-rabbit. **Account-takeover chain CLOSED (worker v9 — NEEDS REDEPLOY):** the real risk wasn't C1 alone — it was `/class/bulk`
silently adding an EXISTING account to a class by display-name (no password) → then `/class/cards` exposing that pupil's
`pwPlain` and `/class/reset` changing their password = takeover with only a victim's display name. Fixed in worker v9:
(1) `/class/bulk` no longer absorbs existing handles — returns `status:'exists'` and they must self-join with the code (app
bulk-result message updated to say so); (2) `/class/cards` only returns `pwPlain` when `u.teacherMade===who.uid`;
(3) `/class/reset` 403s unless `u.teacherMade===who.uid`. Verified (faithful-logic probe): bulk leaves roster empty, fake
cards→null, fake reset→403, real teacher can still reset own pupils. **DECISIONS (user, 2026-06-16):** C1 teacher access-code
DEFERRED (low urgency now the takeover path is closed — a fake teacher can only ever see pupils who join/are-created in THEIR
own class); C2 `pwPlain` LEFT AS-IS (deliberate primary tradeoff). **STILL OPEN:** C1 (defense-in-depth, deferred), the
MEDIUM IA/a11y items (M1/M2/M6/M8/M9/M10/M11/M12) and the LOW list.

### Original findings (6 parallel auditors + spot-verified) — kept for context
## FULL-PROJECT AUDIT (2026-06-16) — original list
Comprehensive classroom/intuitiveness/bug/loophole audit. ✅=code-verified by me, ◦=reported by auditor (high-confidence).
**CRITICAL (security/safeguarding — before any wider rollout):**
- ✅ **C1 Anyone can self-register as a TEACHER.** `worker.js:132` `role = b.role==='teacher'?'teacher':'student'` — no gate.
  Teacher role unlocks class rosters (pupils' REAL NAMES), `/class/cards` (plaintext pwds), `/class/bulk`. Fix: gate teacher
  signup behind an org secret/invite code; default everyone to student.
- ✅ **C2 Plaintext pupil passwords.** `pwPlain` stored in KV + returned to the "teacher" (`worker.js:396`, `/class/cards`).
  With C1 = trivial credential theft of children's accounts. Fix: don't persist cleartext (one-time codes + forced reset).
**HIGH (data loss / broken core features):**
- ✅ **H1 GATE tile destroyed on load/share/page-dup.** `T.GATE=31` (L1912) but `sanitizeGrid` clamps `v<=30` (L6508) →
  every gate → EMPTY in `cleanLevel`/`applyPayload`/`dupLevel`. **1-char fix: `<=31`.**
- ✅ **H2 Undo/redo drops 7 of 9 tile config maps.** `snapState`/`restoreState` (L6305-6306) only keep grid/water/mover/
  enemy; door/key/sign/chest/tele/button/gate configs desync on undo. Fix: snapshot all *Cfg (mirror `snapLevel`).
- ✅ **H3 Silent save failure + false success.** `setSaves` (no try/catch) + `autoSaveDraft` (empty catch) write image-heavy
  payloads with no quota handling, yet the "Game saved!" toast fires unconditionally (L2138). On full shared iPads kids lose
  work while told it saved. Also the hard **12-save cap** (`slice(0,12)`) silently deletes the oldest game. Fix: try/catch +
  real "couldn't save / storage full" message; warn at the cap.
- ◦ **H4 Stage clones are dead to broadcasts AND clicks.** `stBroadcast`/`st_broadcast_wait` only iterate `stRecvHats` (orig
  sprites); `stageFireClick`/`stageSpriteAt` only scan `stageState.sprites` — `stClones` excluded. Breaks the core "spawn
  clones, broadcast go / click target" pattern. Fix: include `stClones` (keyed by `_src`) in broadcast + click hit-test.
- ✅ **H5 KS1 `forever` can freeze the tab.** `ks1RunSeq` forever (L3743) only `yield 0`s when body is EMPTY; a body of only
  instant blocks (say/grow/home/show) never yields → synchronous spin. Stage's `st_forever` (L3486) always `yield 0`s after
  the body — KS1 should match. Fix: unconditional `yield 0` each iteration.
- ✅ **H6 Turtle divide-by-zero hangs.** `turtleTerm` (L2853) raw `a/b`; `fd 10/0`→Infinity→step-count Infinity (caps at 6M,
  multi-sec hang); `0/0`→NaN→silent. Fix: guard `/` (friendly "can't divide by zero") + non-finite guard in `turtleMove`.
- ◦ **H7 Short class codes + open join = cross-class PII.** 4-char codes; any signed-in account can `/class/join` any code,
  then `/class/mine` exposes classmates' real names. Fix: longer codes + rate-limit/approve joins; default to display names.
- ◦ **H8 Offline share-by-link can't share image-heavy Stage** (`copyShareLink` aborts >7000 chars). Known Coding-League gap —
  the cloud short-link must be the only path; clearer offline message. (Already flagged in Share-links notes.)
**MEDIUM (intuitiveness / UX / a11y / perf / data-loss traps):**
- ◦ M1 Single `bap_autosave` draft + every `startNew*` calls `clearDirty()` with no "unsaved work?" guard → silent draft loss.
- ◦ M2 Save vs Cloud vs Share vs hand-in = 4 overlapping concepts; non-technical teachers can't tell which persists/sends.
- ◦ M3 KS1 **Ideas gallery OVERWRITES** the child's whole program (`s.ks1=JSON.parse(idea)`, no confirm) — append/confirm.
- ◦ M4 KS1 **speed chip renders BLANK** (`ks1SpeedChip` `SP=['','','']` — emoji stripped, never replaced with `ksvg`).
- ✅ M5 **Read-aloud is wrongly KS1-only** (`speak()` `if(keyStage!=='ks1')return`) though the a11y toggle is app-wide.
- ◦ M6 Stage `drawStage()` runs at 60fps even when idle/stopped (battery/jank on Chromebooks) — dirty-flag it.
- ✅ M7 Stage **stop doesn't reset costume/`_z`/effects** (start/stop snapshot only x/y/dir/visible/size) — non-Scratch.
- ◦ M8 Demos force KS2 (`setKeyStage('ks2')`) — a KS1 teacher previewing lands in the wrong palette unlabelled.
- ◦ M9 **Platformer editor has no portrait/responsive layout** (only stage/turtle/3d got it) — iPad-portrait cramped.
- ◦ M10 Public unauthenticated `/share` (no rate limit); sessions NOT revoked on password change (120-day tokens on shared
  devices). Mic capture (KS1 record, micro:bit mic) gated only by the browser prompt; recordings flow into cloud/collab.
- ◦ M11 Native `prompt()/confirm()/alert()` for kid flows (ugly, un-translatable, mis-tap on tablets, jargon copy).
- ◦ M12 No ARIA/roles/focus-trap/keyboard nav; many controls are `<div onclick>`; colour-only meaning (KS1 msg colours).
**LOW:** turtle `random` binds too tight (precedence); recursion-cap message misleading; no confirm on KS1 char/page delete
(single ✕ tap); blank save thumbnails for stage/turtle/3d; loose-vs-numeric `=` differs between `st_compare` and
`logic_compare`; `st_say...for N secs` bubble visible ~half the time; teacher `/project/save` to own class sets `handedIn`;
sub-44px tap targets on delete chips; legacy `?lvl=` decode fails silently.
**Overall:** platformer happy-path is solid & well-defended; risk concentrates at (a) cloud/teacher provisioning security,
(b) silent data loss (GATE tile, undo configs, quota), (c) the multi-engine UIs the onboarding never explains, (d) two real
freeze/hang vectors (KS1 forever, turtle ÷0). Most bugs are small, localized fixes; the security ones need a product decision.

## Teacher↔student workflow — ALL BUGS FIXED & re-verified (2026-06-16, app 2026.08.13, worker now v9 — NEEDS REDEPLOY)
Fixes for the QA findings below, all re-verified by re-running the simulation (mock updated to worker v8):
- **Hand-in clarity (loophole #1):** `cloudSaveFlow` reworked — when the open game is class work (`cloudProjectClass` set),
  the primary action is a gold **"Hand in to <class>"** button; the fork path is relabelled **"Save a private copy — your
  teacher will NOT see this"**. When it's own work, classes show as gold "Hand in to <class> — your teacher will see it".
- **Template vs hand-in vs untouched (worker v8):** `/project/save` now sets `handedIn:true`+`handedInAt` and CLEARS
  `fromTeacher` whenever a pupil saves to a class. `cloudTeacherPupil` shows "✓ handed in <date>" / "not started yet — your
  template"; the roster per-pupil line shows "N handed in · M not started"; handed-in sorted first.
- **Re-assign dedup (worker v8):** `/class/assign` updates an existing un-handed-in template of the same title instead of
  adding a duplicate (a pupil who already handed in gets a fresh copy so their submission isn't clobbered).
- **Student inbox badge:** `cloudMyGames` shows "⭐ NEW — from your teacher" for `fromTeacher && !handedIn`, "handed in to
  <class>" once submitted, else "class <code>"/"my own".
- **VERIFIED:** all 3 project types round-trip + hand-in clears fromTeacher/sets handedIn; teacher sees handedIn; re-assign
  gives 1 copy; not-started shows correctly; save dialog renders the gold hand-in primary (screenshotted). **ACTION FOR ORG:
  redeploy the Worker (`cd cloud && npx wrangler deploy`) — handedIn status + dedup need worker v8.** (App save-flow clarity +
  badge work app-only, but handedIn flags come from the worker.) `customBg.top` finding withdrawn (false positive).

### Original findings (kept for context)
## Teacher↔student workflow QA — BUGS FOUND (2026-06-16) — simulated all project types
Drove the full **teacher builds template → gives to class → student opens/edits → hands in → teacher opens** loop for
platformer/stage/turtle via a faithful in-browser mock of `cloud/worker.js` calling the REAL app fns (`cloudDoSave`,
`cloudOpenProject`, `cloudTeacherAssignProject`, `buildPayload`/`applyPayload`). 3D excluded (parked). **The happy path
works** — data (incl. both teacher's and student's edits) round-trips correctly for all three types, projectType preserved.
Issues to fix, by severity:
- **HIGH — "Save → My own work" silently fails to hand in.** A student opens the teacher's template (its copy is tagged
  `class:CODE`), edits, then taps **My own work** (the first/default Save button). `cloudDoSave(null)`: `classCode(null)!==
  cloudProjectClass(CODE)` → `cloudProjectId=null` → a NEW private project (`class:null`) holds their work; the ORIGINAL
  template copy (still `class:CODE`, untouched) is all the teacher sees in the roster. Student thinks they handed in; teacher
  sees a blank template. **Verified.** Fix idea: when the open project is `fromTeacher`/class-tagged, make the hand-in path
  obvious (a "Hand in to <class>" button), and/or warn when saving class work to "my own".
- **HIGH/MED — Teacher cannot tell template from hand-in from untouched.** `/class/assign` stamps each pupil's copy
  `fromTeacher:true` + title="<template>"; `/project/save` (hand-in) reuses that same id and **never clears `fromTeacher`
  or changes the title**. So in `/class/roster` (which returns every project where `class===code`), a finished hand-in, an
  untouched template, and a never-opened template all look identical (same title, `fromTeacher:true`). No "done?" signal.
  **Verified all 3 types.** Fix idea: clear `fromTeacher` (or set `handedIn:true`+timestamp) on student save; show status in
  `cloudTeacherPupil`/roster; consider titling hand-ins with the pupil name.
- **(NOT A BUG — withdrawn) `customBg.top` "loss"** was a false alarm: my test markers used invalid hex (`#TEA000` etc.,
  T/O/P/Z aren't hex digits) so `safeColor` (applyPayload L6522) correctly rejected them. Valid hex round-trips fine.
- **MED — re-assigning piles up duplicates.** `/class/assign` always `newId()`+`unshift` with no dedup, so giving the same
  template twice leaves each pupil TWO identical `fromTeacher` copies (and the roster can't tell which is the submission).
  Fix idea: dedup by (title,fromTeacher) per class on re-assign, or warn.
- **LOW/UX — assigned work is buried + unlabelled.** Students find teacher work only inside "My games" tagged with the class
  CODE (`cloudMyGames` tag = code or "my own"); there's no "From your teacher / Class work" area or badge, and no "new!"
  marker. Add a clear inbox/badge.
- **LOW — image-heavy templates multiply storage.** `/class/assign` stores a FULL payload copy per pupil; a Stage template
  with painted costumes × 30 pupils is large and can hit `MAX_PAYLOAD` (413). Note for capacity; templates are snapshots
  (no live link — editing the template later doesn't update already-assigned copies; expected but worth documenting to staff).
- **Confirmed OK:** payload round-trips per type incl. projectType; teacher-only `/project/load` of pupil work enforced
  (students get "Not allowed"); save-to-unjoined-class blocked server-side; the new device-save overwrite + draft re-link.

## Collaborate by picking classmates (worker v7) — DONE & verified (needs worker redeploy)
Students can pick **up to 5 classmates** (across one or more of their classes) to live-collaborate, seeing each by
**display name + real name**.
- **Backend (`cloud/worker.js` → v7):** (1) `POST /class/mine {token}` → `{classes:[{code,name,members:[{uid,displayName,
  realName,isMe}]}]}` — student-accessible, only the requester's own classes (privacy: classmates' real names ARE
  returned, by design for picking). (2) `POST /collab/invite` now also accepts `uids:[...]` (validated `[a-z0-9]+`,
  legacy `displayName` still works), capping total invited at **5 others**.
- **App:** `sh-collab` → `collabStart()` → `openCollabPicker()` (in `#cloud-modal`): fetches `/class/mine`, shows a class
  `<select>` + checkbox rows (`.cp-row` display-name bold + real-name gold), tracks `_collabSel` (uid set, max 5) ACROSS
  class switches, then `collabStartWith(uids)` → `/collab/start` → `/collab/invite{uids}` → `collabConnect` → `collabInviteView`
  (still lets you add more by display name). `collabStartQuick()` = the old no-class fallback. **Graceful fallback:** if
  `/class/mine` errors (e.g. old worker still deployed) or you're in no class with others, it shows the quick start-a-game
  + invite-by-name path, so Collaborate never dead-ends.
- **Verified in-browser (mocked cloud):** picker renders class dropdown + classmates (display+real name); select/caps at 5;
  selection persists across class switch; Start fires `/collab/start` then `/collab/invite{uids:[...]}` then connect.
- **ACTION FOR THE ORG:** redeploy the Worker (`cd cloud && npx wrangler deploy`) — the app feature needs v7 endpoints.

## Teacher bulk pupils + login cards (worker v6) — DONE & verified
- **Classes already work for Stage** (hand-in/teacher-view are payload-based; nothing project-type-specific).
- **Backend (`cloud/worker.js` v6):** `POST /class/bulk {token,code,students:[{realName,displayName,password}]}`
  (teacher-owns; creates accounts, skips bad rows <3-char handle / <4-char pw, adds existing handles to the class)
  · `POST /class/cards {token,code}` → `{className,code,students:[{realName,displayName,password|null}]}` ·
  `POST /class/reset {token,code,uid,password}`. **`pwPlain`** (plaintext) is stored ONLY for teacher-bulk-created
  accounts so cards stay current; `/password` updates it on change; returned ONLY to the owning teacher. Self-signup
  accounts have no `pwPlain` (card shows "set their own").
- **App (teacher class roster view `cloudTeacherRoster`):** 👥 Add pupils (CSV) → `teacherBulkCSV`→`parseStudentCSV`
  (`_splitCSVLine` handles quotes/commas, skips a header row) → `teacherBulkConfirm` (preview + POST `/class/bulk`).
  🪪 Login cards → `teacherPrintCards` (POST `/class/cards` → printable card grid via `doPrint`).
- **Verified:** CSV parse (header + quoted comma + bad row), bulk create, cards, and **card auto-updates when a
  pupil changes their password**. Privacy note: plaintext pupil passwords are a deliberate primary-school tradeoff,
  teacher-only.

## Deletes everywhere + Stage-collab join fix (app 2026.07.17, worker v6)
- **Stage collab JOIN BUG fixed:** the `init` handler only called `switchMode('build')` when `mode!=='build'`, so
  a fresh joiner (already in build) never entered the Stage UI for a stage doc (looked like platformer until they
  tapped Code). Now: for a stage doc it calls `enterStageUI()` explicitly. Verified by simulating the init.
- **Delete options:** Collaborations now have a 🗑️ remove (backend `POST /collab/remove` — owner deletes for
  everyone + unlinks invited; member just leaves). Device/home saves got a `.save-del-btn` (filters `bap_saves`
  by `id`). Personal cloud + class work were already deletable via `cloudMyGames` → `/project/delete`.

## Cloud save (optional backend) — ACCOUNT model (v3)
- **Backend:** `/Users/charlie/cloud/worker.js` (Cloudflare Worker + KV) + `cloud/README.md`.
  Deployed by the org at `CLOUD_URL` (currently `codejump-cloud.primarycodingleague.workers.dev`).
- **Model:** every user is an **account** = unique display name + password (SHA-256) + real name + role
  (`student`/`teacher`). Login returns a **session token** (`session:<token>` in KV); the app stores it in
  `localStorage['bap_cloud_token']` and calls `/me` on load to restore. KV keys: `handle:<lower>→uid`,
  `user:<uid>`, `session:<token>`, `class:<code>` (owner uid + roster of uids), `proj:<uid>:<id>`.
- **Rules enforced server-side:** only teachers create classes / read their class roster; students self-join
  by code; a project can only be saved to a class the user has joined; teachers can only open work handed
  into a class they own.
- **App side:** cloud UI is JS-rendered in `#cloud-modal` (the big cloud module near `let CLOUD_URL`). Only
  signed-in users can cloud-save; the **Teacher Hub (`h-teacher`) is gated to teacher accounts** when cloud is on.
- If the Worker API changes, the app **must be re-deployed AND the Worker re-pasted/deployed** — they share a contract.
- **Save = OVERWRITE, not duplicate (fixed 2026-06-16, app 2026.08.11):** device save (`saveCurrentLevel`) used to assign
  a fresh `Date.now()` id every time → a new home-tile each save. Now a `curSaveId` global tracks the slot you're editing:
  `loadSaveData` sets it; `saveCurrentLevel` overwrites that slot (keeps its name, no re-prompt) when set, else prompts a
  name + creates one. The 5 "fresh project" spots (`startNewProject/Stage/Turtle/3D` + `applyPayload`) reset `curSaveId=null`
  (same snippet that nulls `cloudProjectId`). **Cross-reload:** `autoSaveDraft` now stores a `link:{save,cloud,title,cls}`
  in `bap_autosave`; the resume-pill handler re-applies it after `applyPayload`, so resuming a draft re-links it to its
  device/cloud slot and Save overwrites. Cloud in-session overwrite already worked via `cloudProjectId`.
- **Teacher: GIVE a saved game to a class by PICKING it (was free-text only):** the class roster's `cr-send` button
  ("Give a game to this class") now opens `cloudTeacherSendChooser(code)` → lists the teacher's own `cloudMe.projects`;
  selecting one → `cloudTeacherAssignProject` loads its payload via `/project/load` and `/class/assign`s it (title from the
  project). A "send the game I'm building right now" fallback (`cloudTeacherAssignCurrent`) is kept. No worker change needed.

## Live collaboration (Durable Objects) — Phase 1 backend done, Phase 2 client pending
- **Backend (in `cloud/worker.js`, v4):** a Durable Object class **`Room`** (one live session per
  collaboration; up to 6 editors; relays `op`/`cursor`/`snapshot`, tracks presence). Worker routes
  `GET /room/<roomId>?token=` (WebSocket) to the DO after auth, and has KV endpoints
  `/collab/start|invite|list|info`. Users gained a `collabs:[roomId]` field. Deploy needs a DO
  **binding `ROOMS` → class `Room`** + a migration — see `cloud/COLLAB.md`.
- **Tile sync model:** last-write-wins per cell (op `{k:'cell',lvl,layer,r,c,t}`) + periodic full
  `snapshot` for everything else. **Single-page focus for v1.**
- **Phase 2 DONE & deployed:** Share → 🤝 Collaborate (`collabStart`→`/collab/start`+invite), ☁️ Cloud →
  🤝 Collaborations (`cloudCollabList`), the WS client (`collabConnect`/`collabOnMessage`), live cell-op
  emission from `paint()`, full-snapshot via `markDirty`→`collabSnapshotSoon`, presence bar (`updateCollabBar`)
  + live cursors (drawn in `drawBuild`). All collab hooks no-op when `!collabActive`, so the app is
  unchanged unless a room is active. Verified live against the deployed Durable Object.
- **Deploy:** the Worker is now deployed via **wrangler** (`cloud/wrangler.toml`, KV id + ROOMS DO +
  sqlite migration). Future backend changes: `cd cloud && npx wrangler deploy` (no more dashboard paste).

## Workflow conventions established with the user
- Verify changes in-browser (preview server + screenshots) before declaring done.
- Keep KS1 simple (game blocks only); KS2 gets full coding blocks + the interpreter.
- After changes, run a quick JS syntax check (extract `<script>` blocks, `node --check`).
- Always sync the deploy copy at the end.
