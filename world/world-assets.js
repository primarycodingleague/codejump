/* CodeJump · 3D World — the model library: characters, objects and animations (files in world/assets/,
 * from Flock XR under the MIT licence; see assets/README.md). Shared by world-blocks.js (dropdowns) and
 * world-runtime.js (loading). Every character uses the same skeleton, so every animation fits every character.
 */

// lightest first: the Blocky characters are ~5k vertices, Ponytail 222k and Spiky hair 128k (slow on Chromebooks)
export const CHARACTERS = [
  ['Block5', 'Blocky short hair'], ['Block1', 'Blocky bunches'], ['Block2', 'Blocky long bunches'], ['Block3', 'Blocky ponytail'],
  ['Block4', 'Blocky curly hair'], ['Block6', 'Blocky long hair'],
  ['Liz1', 'Cat'], ['Liz2', 'Monkey'], ['Liz5', 'Alien'], ['Liz6', 'Elf'], ['Liz4', 'Spiky hair'], ['Liz3', 'Ponytail']
];

export const OBJECTS = [
  ['Star', 'Star'], ['Heart', 'Heart'], ['Coin', 'Coin'], ['Gem1', 'Square gem'], ['Gem2', 'Diamond'], ['Gem3', 'Long gem'],
  ['Key', 'Key'], ['Wand', 'Wand'], ['Hat', 'Hat'], ['egg', 'Egg'], ['apple', 'Apple'], ['pumpkin', 'Pumpkin'], ['donut', 'Donut'],
  ['starboppers', 'Starboppers'], ['headphones', 'Headphones'],
  ['tree', 'Tree'], ['tree2', 'Two-branch tree'], ['tree3', 'Winter tree'], ['tree4', 'Fir tree'],
  ['flower', 'Flower'], ['flower2', 'Tulip'], ['mushroom', 'Mushroom'], ['mushroom_2', 'Toadstool'],
  ['rocks', 'Rock platform'], ['rocks2', 'Corner rock'], ['rocks3', 'Rock steps'], ['rocks4', 'Waterfall'],
  ['icecrystals', 'Ice crystals'], ['stalagmite', 'Stalagmite'], ['pond', 'Pond'],
  ['hut', 'Round hut'], ['hut2', 'Cabin'], ['hut3', 'Festival tent'], ['hut4', 'Toadstool hut'],
  ['window_window', 'Wall with windows'], ['window_only', 'Wall with a window'], ['window_door', 'Wall with a door'],
  ['window_door_reversed', 'Wall with a door (flipped)'], ['window_stairs', 'Wall with stairs'],
  ['humped', 'Humped bridge'], ['jetty', 'Jetty'], ['boardwalk_straight', 'Boardwalk'],
  ['boat', 'Ship'], ['airplane', 'Aeroplane'], ['airplane2', 'Aeroplane with a seat'], ['skateboard', 'Skateboard']
];

export const ANIMATIONS = [
  ['Idle', 'stand still'], ['Walk', 'walk'], ['Run', 'run'], ['Jump', 'jump'], ['JumpUp', 'jump up'], ['JumpIdle', 'in the air'],
  ['JumpLand', 'land'], ['Fall', 'fall'], ['Wave', 'wave'], ['Clap', 'clap'], ['Yes', 'nod yes'], ['No', 'shake head'],
  ['Dance1', 'dance 1'], ['Dance2', 'dance 2'], ['Dance3', 'dance 3'], ['Dance4', 'dance 4'], ['Flip', 'flip'], ['Duck', 'duck'],
  ['Punch', 'punch'], ['HitReact', 'ouch'], ['Wobble', 'wobble'], ['Fly', 'fly'], ['Swim', 'swim'], ['Tread_Water', 'tread water'],
  ['Skate', 'skate'], ['Climb_wall', 'climb wall'], ['Climb_rope', 'climb rope'], ['Sit_Down', 'sit down'], ['Sitting', 'sitting'],
  ['Stand_Up', 'stand up'], ['Push_button', 'push a button'], ['Idle_Hold', 'hold'], ['Walk_Hold', 'walk holding'],
  ['Run_Hold', 'run holding'], ['Idle_Attack', 'reach'], ['Walk_Attack', 'walk reaching'], ['Run_Attack', 'run reaching']
];

// colours a character can be given (glTF material names -> part)
export const CHARACTER_PARTS = [['hair', 'hair'], ['skin', 'skin'], ['eyes', 'eyes'], ['tshirt', 'T-shirt'], ['shorts', 'shorts'], ['sleeves', 'sleeves and shoes']];

export function partOfMaterial(name) {
  const s = String(name || '').toLowerCase();
  if (s.includes('hair')) return 'hair';
  if (s.includes('skin')) return 'skin';
  if (s.includes('eyes')) return 'eyes';
  if (s.includes('shorts')) return 'shorts';
  if (s.includes('tshirt') || s.includes('t-shirt') || s.includes('tee')) return 'tshirt';
  if (s.includes('sleeve') || s.includes('detail') || s.includes('shoes')) return 'sleeves';
  return null;
}

export const isCharacter = m => CHARACTERS.some(c => c[0] === m);
export const isObject = m => OBJECTS.some(c => c[0] === m);
export const isAnimation = a => ANIMATIONS.some(c => c[0] === a);
export const characterFile = m => 'characters/' + m + '.glb';
export const objectFile = m => 'objects/' + m + '.glb';
export const animationFile = a => 'animations/' + a + '.glb';
export const THUMBLESS = ['icecrystals', 'stalagmite'];
