/* CodeJump · 3D World — the model library: characters, objects and animations. The files in world/assets/ are made from
 * Kenney's free CC0 packs (www.kenney.nl; see assets/README.md) by tools/world-assets/. Shared by world-blocks.js
 * (dropdowns) and world-runtime.js (loading).
 * The ids are the ones saved projects already use (Block5, tree, Gem2…), so old projects still open; only the pictures changed.
 */

export const CHARACTERS = [
  ['Block5', 'Glasses and green top'], ['Block1', 'Bunches and yellow top'], ['Block2', 'Headband and blue top'], ['Block3', 'Hair bun and grey jacket'],
  ['Block4', 'White sports kit'], ['Block6', 'Long hair and black top'], ['Liz1', 'Hair bun and purple top'], ['Liz2', 'Red beard'],
  ['Liz5', 'Police officer'], ['Liz6', 'Smart suit'], ['Liz4', 'Builder'], ['Liz3', 'Green T-shirt']
];

export const OBJECTS = [
  ['Star', 'Star'], ['Heart', 'Heart'], ['Coin', 'Coin'], ['Gem1', 'Jewel'], ['Gem2', 'Purple jewel'],
  ['Gem3', 'Red jewel'], ['Key', 'Key'], ['Wand', 'Lantern'], ['Hat', 'Teddy bear'], ['egg', 'Egg'],
  ['apple', 'Apple'], ['pumpkin', 'Pumpkin'], ['donut', 'Donut'], ['starboppers', 'Cupcake'], ['headphones', 'Radio'],
  ['tree', 'Tree'], ['tree2', 'Oak tree'], ['tree3', 'Snowy tree'], ['tree4', 'Fir tree'], ['flower', 'Red flowers'],
  ['flower2', 'Purple flowers'], ['mushroom', 'Mushroom'], ['mushroom_2', 'Toadstools'], ['rocks', 'Big rock'],
  ['rocks2', 'Tall rock'], ['rocks3', 'Rock steps'], ['rocks4', 'Cliff'], ['icecrystals', 'Cactus'],
  ['stalagmite', 'Stone pillar'], ['pond', 'Fountain'], ['hut', 'House'], ['hut2', 'Cottage'], ['hut3', 'Tent'],
  ['hut4', 'Market stall'], ['window_window', 'Wall with a window'], ['window_only', 'Wall with shutters'],
  ['window_door', 'Wall with a door'], ['window_door_reversed', 'Wooden wall with a door'],
  ['window_stairs', 'Stone steps'], ['humped', 'Stone bridge'], ['jetty', 'Wooden bridge'],
  ['boardwalk_straight', 'Stepping stones'], ['boat', 'Canoe'], ['airplane', 'Flag'], ['airplane2', 'Treasure chest'],
  ['skateboard', 'Spring'], ['cart', 'Cart'], ['barrel', 'Barrel'], ['crate', 'Crate'], ['sign', 'Sign'],
  ['ladder', 'Ladder'], ['trophy', 'Trophy'], ['statue', 'Statue'], ['palm', 'Palm tree'], ['pine', 'Pine tree'],
  ['bush', 'Bush'], ['log', 'Log'], ['campfire', 'Campfire'], ['hedge', 'Hedge'], ['fence', 'Fence'],
  ['house2', 'Big house'], ['bench', 'Bench'], ['table', 'Table'], ['chair', 'Chair'], ['sofa', 'Sofa'],
  ['cake', 'Birthday cake'], ['pizza', 'Pizza'], ['icecream', 'Ice cream'], ['watermelon', 'Watermelon'],
  ['banana', 'Banana'], ['burger', 'Burger'], ['carrot', 'Carrot'], ['bomb', 'Bomb']
];

// [id, label, the character file's own clip | null = made by the runtime from PROC_ANIMS]
export const ANIMATIONS = [
  ['Idle', 'stand still', 'idle'], ['Walk', 'walk', 'walk'], ['Run', 'run', 'sprint'], ['Jump', 'jump', 'jump'], ['JumpUp', 'jump up', 'jump'],
  ['JumpIdle', 'in the air', 'fall'], ['JumpLand', 'land', 'crouch'], ['Fall', 'fall', 'fall'], ['Wave', 'wave', null], ['Clap', 'clap', null],
  ['Cheer', 'cheer', null], ['Yes', 'nod yes', 'emote-yes'], ['No', 'shake head', 'emote-no'], ['Dance1', 'dance 1', null], ['Dance2', 'dance 2', null],
  ['Dance3', 'dance 3', null], ['Dance4', 'dance 4', null], ['Spin', 'spin round', null], ['Flip', 'flip', null], ['Duck', 'duck', 'crouch'],
  ['Kick', 'kick', 'attack-kick-right'], ['Punch', 'punch', 'attack-melee-right'], ['HitReact', 'ouch', null], ['Wobble', 'wobble', null],
  ['Fly', 'fly', null], ['Swim', 'swim', null], ['Tread_Water', 'tread water', null], ['Skate', 'skate', null], ['Climb_wall', 'climb wall', null],
  ['Climb_rope', 'climb rope', null], ['Sit_Down', 'sit down', 'sit'], ['Sitting', 'sitting', 'sit'], ['Stand_Up', 'stand up', null],
  ['Pick_Up', 'pick up', 'pick-up'], ['Drive', 'drive', 'drive'], ['Push_button', 'push a button', 'interact-right'], ['Idle_Hold', 'hold', 'holding-both'],
  ['Walk_Hold', 'walk holding', 'walk'], ['Run_Hold', 'run holding', 'sprint'], ['Idle_Attack', 'reach', 'interact-right'],
  ['Walk_Attack', 'walk reaching', 'walk'], ['Run_Attack', 'run reaching', 'sprint']
];
export const clipOf = a => (ANIMATIONS.find(c => c[0] === a) || [])[2];

/* Animations the character files don't have, as key poses: seconds, then degrees for the joints (x, y, z) and the
 * body's lift (m, before the 2.8 m scale). Joints not given keep the standing pose. The arms hang at z = ±45;
 * a right arm straight up is z = -130 (left +130); y = ±60 swings an arm forwards; x < 0 swings a leg forwards;
 * the torso leans forwards with x > 0. "turn" spins the whole body round y (degrees). */
const UP = 85;
export const PROC_ANIMS = {
  Wave: [[0, { armR: [0, 0, 45] }], [0.25, { armR: [0, 0, -78] }], [0.45, { armR: [0, 0, -98], head: [0, 0, -6] }], [0.65, { armR: [0, 0, -69] }],
    [0.85, { armR: [0, 0, -98], head: [0, 0, -6] }], [1.05, { armR: [0, 0, -72] }], [1.3, { armR: [0, 0, 45] }]],
  Clap: [[0, {}], [0.15, { armR: [0, 70, 0], armL: [0, -70, 0] }], [0.3, { armR: [0, 95, 0], armL: [0, -95, 0] }], [0.45, { armR: [0, 70, 0], armL: [0, -70, 0] }],
    [0.6, { armR: [0, 95, 0], armL: [0, -95, 0] }], [0.75, { armR: [0, 70, 0], armL: [0, -70, 0] }], [0.9, { armR: [0, 95, 0], armL: [0, -95, 0] }], [1.1, {}]],
  Cheer: [[0, {}], [0.2, { armR: [0, 0, -UP], armL: [0, 0, UP], lift: 0.06 }], [0.4, { armR: [0, 0, -72], armL: [0, 0, 72] }],
    [0.6, { armR: [0, 0, -UP], armL: [0, 0, UP], lift: 0.06 }], [0.8, { armR: [0, 0, -72], armL: [0, 0, 72] }], [1, {}]],
  Dance1: [[0, {}], [0.25, { armR: [0, 0, -UP], armL: [0, 0, 20], torso: [0, 0, 8], lift: 0.03 }], [0.5, {}],
    [0.75, { armL: [0, 0, UP], armR: [0, 0, -20], torso: [0, 0, -8], lift: 0.03 }], [1, {}]],
  Dance2: [[0, { armR: [0, 0, 0], armL: [0, 0, 0] }], [0.3, { torso: [0, 25, 0], head: [0, -15, 0], armR: [0, 0, -15], armL: [0, 0, -15] }],
    [0.6, { torso: [0, -25, 0], head: [0, 15, 0], armR: [0, 0, 15], armL: [0, 0, 15] }], [0.9, { armR: [0, 0, 0], armL: [0, 0, 0] }]],
  Dance3: [[0, {}], [0.2, { legR: [-50, 0, 0], armR: [0, 60, 0], armL: [0, 0, 10] }], [0.4, { lift: 0.03 }], [0.6, { legL: [-50, 0, 0], armL: [0, -60, 0], armR: [0, 0, -10] }], [0.8, {}]],
  Dance4: [[0, { armR: [0, 0, -UP], armL: [0, 0, UP], turn: 0 }], [0.5, { armR: [0, 0, -65], armL: [0, 0, 65], turn: 180, lift: 0.04 }],
    [1, { armR: [0, 0, -UP], armL: [0, 0, UP], turn: 360 }]],
  Spin: [[0, { armR: [0, 0, 0], armL: [0, 0, 0], turn: 0 }], [0.8, { armR: [0, 0, 0], armL: [0, 0, 0], turn: 360 }]],
  Flip: [[0, { flip: 0 }], [0.15, { lift: 0.05, legR: [-40, 0, 0], legL: [-40, 0, 0], flip: 0 }], [0.45, { lift: 0.35, legR: [-90, 0, 0], legL: [-90, 0, 0], armR: [0, 60, 0], armL: [0, -60, 0], flip: -180 }],
    [0.75, { lift: 0.1, legR: [-40, 0, 0], legL: [-40, 0, 0], flip: -360 }], [0.9, { flip: -360 }]],
  HitReact: [[0, {}], [0.12, { torso: [-25, 0, 0], head: [-20, 0, 0], armR: [0, 0, 0], armL: [0, 0, 0] }], [0.5, { torso: [-10, 0, 0] }], [0.7, {}]],
  Wobble: [[0, {}], [0.2, { torso: [0, 0, 15], head: [0, 0, -10], armR: [0, 0, 10], armL: [0, 0, 10] }], [0.4, {}],
    [0.6, { torso: [0, 0, -15], head: [0, 0, 10], armR: [0, 0, -10], armL: [0, 0, -10] }], [0.8, {}]],
  Fly: [[0, { armR: [0, 0, -10], armL: [0, 0, 10], legR: [20, 0, 0], legL: [20, 0, 0], torso: [15, 0, 0] }],
    [0.3, { armR: [0, 0, 25], armL: [0, 0, -25], legR: [25, 0, 0], legL: [25, 0, 0], torso: [15, 0, 0], lift: 0.04 }],
    [0.6, { armR: [0, 0, -10], armL: [0, 0, 10], legR: [20, 0, 0], legL: [20, 0, 0], torso: [15, 0, 0] }]],
  Swim: [[0, { torso: [40, 0, 0], armR: [0, 0, -65], armL: [0, 0, 65], legR: [20, 0, 0], legL: [-10, 0, 0] }],
    [0.35, { torso: [40, 0, 0], armR: [0, 60, 20], armL: [0, -60, -20], legR: [-10, 0, 0], legL: [20, 0, 0] }],
    [0.7, { torso: [40, 0, 0], armR: [0, 0, -65], armL: [0, 0, 65], legR: [20, 0, 0], legL: [-10, 0, 0] }]],
  Tread_Water: [[0, { armR: [0, 0, 5], armL: [0, 0, -5], legR: [-20, 0, 0], legL: [10, 0, 0] }],
    [0.5, { armR: [0, 0, 25], armL: [0, 0, -25], legR: [10, 0, 0], legL: [-20, 0, 0], lift: 0.03 }], [1, { armR: [0, 0, 5], armL: [0, 0, -5], legR: [-20, 0, 0], legL: [10, 0, 0] }]],
  Skate: [[0, { torso: [20, 15, 0], legR: [-15, 0, 0], legL: [25, 0, 0], armR: [0, -30, 30], armL: [0, -30, -40] }],
    [0.5, { torso: [20, -15, 0], legR: [25, 0, 0], legL: [-15, 0, 0], armR: [0, 30, 40], armL: [0, 30, -30] }], [1, { torso: [20, 15, 0], legR: [-15, 0, 0], legL: [25, 0, 0], armR: [0, -30, 30], armL: [0, -30, -40] }]],
  Climb_wall: [[0, { armR: [0, 40, -72], armL: [0, -40, 39], legR: [-50, 0, 0], legL: [0, 0, 0] }],
    [0.4, { armR: [0, 40, -39], armL: [0, -40, 72], legR: [0, 0, 0], legL: [-50, 0, 0], lift: 0.03 }], [0.8, { armR: [0, 40, -72], armL: [0, -40, 39], legR: [-50, 0, 0], legL: [0, 0, 0] }]],
  Climb_rope: [[0, { armR: [0, 20, -UP], armL: [0, -20, 59], legR: [-40, 0, 0], legL: [-40, 0, 0] }],
    [0.4, { armR: [0, 20, -59], armL: [0, -20, UP], legR: [-20, 0, 0], legL: [-20, 0, 0], lift: 0.03 }], [0.8, { armR: [0, 20, -UP], armL: [0, -20, 59], legR: [-40, 0, 0], legL: [-40, 0, 0] }]],
  Stand_Up: [[0, { lift: -0.15, legR: [-75, 0, 0], legL: [-75, 0, 0] }], [0.3, { lift: -0.08, legR: [-45, 0, 0], legL: [-45, 0, 0], torso: [20, 0, 0] }], [0.6, {}]]
};
export const PROC_LOOP = ['Spin', 'Dance4']; // these turn the whole body: "over and over" keeps going round

// colours a character can be given: [label, value] (the values are the ones saved projects already have)
export const CHARACTER_PARTS = [['hair or hat', 'hair'], ['skin', 'skin'], ['eyes and mouth', 'eyes'], ['top', 'T-shirt'], ['shorts or trousers', 'shorts'], ['shoes', 'sleeves and shoes']];
const PART = { 'T-shirt': 'tshirt', 'sleeves and shoes': 'shoes', sleeves: 'shoes' };
// each part's 32×128 slots in the character's colour map (slot s: x = (s % 16) × 32, y = floor(s / 16) × 128)
export const CHARACTER_SLOTS = {"Block5":{"shoes":[0,2],"shorts":[1,5],"skin":[3,4],"tshirt":[6,7],"eyes":[8],"hair":[9,10,11]},"Block1":{"shorts":[0,3],"shoes":[1,4,5],"tshirt":[2,8],"skin":[6,7],"hair":[9,11,12],"eyes":[10]},"Block2":{"skin":[0,1],"shoes":[2],"shorts":[3,4],"tshirt":[5,6,7],"hair":[8,10,11],"eyes":[9]},"Block3":{"shorts":[0,2],"tshirt":[1,4],"shoes":[3],"skin":[5],"eyes":[6],"hair":[7,8,9]},"Block4":{"tshirt":[0,3,5,6],"shorts":[1,7],"shoes":[2,4,8],"hair":[9],"eyes":[10],"skin":[11]},"Block6":{"shorts":[0,2],"shoes":[1,3,4],"tshirt":[5,6,9,10],"skin":[7,8],"hair":[11,12,14],"eyes":[13]},"Liz1":{"shorts":[0,2],"shoes":[1,3,4],"tshirt":[5,6],"skin":[7,8],"hair":[9],"eyes":[10]},"Liz2":{"tshirt":[0,5],"shorts":[1,6],"shoes":[2,7],"skin":[3,4],"eyes":[8],"hair":[9,10,11]},"Liz5":{"tshirt":[0,3,5],"shorts":[1],"shoes":[2,6],"skin":[4],"hair":[7,9,10,11],"eyes":[8]},"Liz6":{"tshirt":[0,4,5],"shorts":[1],"shoes":[2],"skin":[3],"eyes":[6],"hair":[7]},"Liz4":{"shorts":[0,2,5],"tshirt":[1,4,7],"shoes":[3,6,8],"eyes":[9],"skin":[10],"hair":[11,12,13]},"Liz3":{"shorts":[0],"shoes":[1,4],"tshirt":[2,5,6,7],"skin":[3],"hair":[8],"eyes":[9]}};
export const partId = p => PART[p] || p;
export const slotsOf = (model, part) => (CHARACTER_SLOTS[model] || {})[partId(part)] || [];

// objects that start in another colour than their file (one colour per material, in order)
export const OBJECT_COLOURS = { Gem2: ['#8A2BE2'], Gem3: ['#E8402A'] };

export const isCharacter = m => CHARACTERS.some(c => c[0] === m);
export const isObject = m => OBJECTS.some(c => c[0] === m);
export const isAnimation = a => ANIMATIONS.some(c => c[0] === a);
export const characterFile = m => 'characters/' + m + '.glb';
export const objectFile = m => 'objects/' + m + '.glb';
export const THUMBLESS = [];
