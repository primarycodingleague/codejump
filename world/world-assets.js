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

// Flock's default colours for each object, applied to its materials in order (root mesh first, then the meshes below it
// sorted by name; one colour per material, repeating). Objects not listed keep the colours in their file.
export const OBJECT_COLOURS = {
  Star: ["#FFD700", "#FFD700", "#FFD700"],
  Heart: ["#FF69B4", "#FF69B4", "#FF69B4"],
  Coin: ["#A47E1B", "#C9A227", "#76520E"],
  Gem1: ["#00BFFF", "#00BFFF", "#00BFFF"],
  Gem2: ["#8A2BE2", "#8A2BE2", "#8A2BE2"],
  Gem3: ["#FF4500", "#FF4500", "#FF4500"],
  Key: ["#A47E1B", "#C9A227", "#76520E"],
  Wand: ["#FF4500", "#8A2BE2", "#92614A"],
  Hat: ["#9D3F72", "#B5FDFD", "#3D0073"],
  egg: ["#fffcec", "#fffcec", "#fffcec"],
  apple: ["#3FAF45", "#A9323F", "#624A20"],
  pumpkin: ["#E78632", "#75430F"],
  donut: ["#f9cb9c", "#fba0c3"],
  starboppers: ["#FFD700", "#FFD700", "#FFD700", "#f9f9f9"],
  headphones: ["#53E0E7", "#3291E7", "#7D7D7D"],
  tree: ["#66CDAA", "#CD853F"],
  tree2: ["#7F9F7F", "#A1623B"],
  tree3: ["#403C3C", "#312616"],
  tree4: ["#0D5B28", "#6D6C51"],
  flower: ["#E73F9F", "#4AB700", "#E7D535"],
  flower2: ["#7C38E7", "#4AB700", "#E7D535"],
  mushroom: ["#ffffff", "#E73A49", "#8F7A61"],
  mushroom_2: ["#ffffff", "#E73A49", "#8F7A61"],
  rocks: ["#898D86", "#99a83d"],
  rocks2: ["#898D86", "#99a83d"],
  rocks3: ["#898D86", "#99a83d"],
  rocks4: ["#898D86", "#99a83d", "#6BC6EF", "#f9f9f9"],
  pond: ["#00E704", "#5A91E7", "#9A9A9A"],
  hut: ["#B66946", "#5F2524", "#C25A5C", "#E1B46E", "#3BACBA", "#878787"],
  hut2: ["#814C22", "#231E1D", "#FFF6A6", "#E7AF3A", "#E73627", "#878787"],
  hut3: ["#F6DAB6", "#6CC3C1", "#9DC45C", "#EEB975", "#F3B4BE", "#878787"],
  hut4: ["#F2E8CF", "#BC4749", "#EEB975", "#AF1B3F", "#6A994E", "#878787"],
  window_window: ["#E7A988", "#E74E5F", "#E7E7E7"],
  window_only: ["#E7A988", "#E74E5F", "#E7E7E7"],
  window_door: ["#E7A988", "#E74E5F", "#E7E7E7"],
  window_door_reversed: ["#E7A988", "#E74E5F", "#E7E7E7"],
  window_stairs: ["#E7A988", "#E74E5F", "#E7E7E7"],
  humped: ["#FFA869", "#E76F31", "#7E5024"],
  jetty: ["#FFA869", "#7E5024", "#E76F31"],
  boardwalk_straight: ["#7E5024", "#7E5024", "#7E5024"],
  boat: ["#4F8A46", "#E7D48E", "#E76635", "#E76C69", "#5E64E7", "#4A4A4A", "#AAAAAA", "#E711CD"],
  airplane: ["#E75D43", "#6A6A6A", "#E7C777", "#979797", "#A033E7"],
  airplane2: ["#E75D43", "#6A6A6A", "#E7C777", "#979797", "#A033E7"],
  skateboard: ["#E769D3", "#484848", "#251BE7"]
};

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
