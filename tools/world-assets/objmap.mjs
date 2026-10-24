const K = (process.env.KENNEY || new URL('./kenney/', import.meta.url).pathname).replace(/\/?$/, '/');
export const KITS = { pf: K + 'kenney_platformer-kit/Models/GLB format/', na: K + 'kenney_nature-kit/Models/GLTF format/', fo: K + 'kenney_food-kit/Models/GLB format/',
  ft: K + 'kenney_fantasy-town-kit_2.0/Models/GLB format/', ci: K + 'kenney_city-kit-suburban_20/Models/GLB format/', fu: K + 'kenney_furniture-kit/Models/GLTF format/', ar: K + 'kenney_mini-arena/Models/GLB format/' };
export const KIT_NAME = { pf: 'Platformer Kit', na: 'Nature Kit', fo: 'Food Kit', ft: 'Fantasy Town Kit', ci: 'City Kit (Suburban)', fu: 'Furniture Kit', ar: 'Mini Arena' };
// [id, label, kit, file, height in m (the size it is packed at), tint for the thumbnail?]
export const OBJ = [
  ['Star', 'Star', 'pf', 'star', 1.44], ['Heart', 'Heart', 'pf', 'heart', 1.24], ['Coin', 'Coin', 'pf', 'coin-gold', 1.4],
  ['Gem1', 'Jewel', 'pf', 'jewel', 1.4], ['Gem2', 'Purple jewel', 'pf', 'jewel', 1.4, '#8A2BE2'], ['Gem3', 'Red jewel', 'pf', 'jewel', 1.4, '#E8402A'],
  ['Key', 'Key', 'pf', 'key', 0.9], ['Wand', 'Lantern', 'ft', 'lantern', 1], ['Hat', 'Teddy bear', 'fu', 'bear', 0.6],
  ['egg', 'Egg', 'fo', 'egg', 2.36], ['apple', 'Apple', 'fo', 'apple', 1.76], ['pumpkin', 'Pumpkin', 'fo', 'pumpkin', 2.23], ['donut', 'Donut', 'fo', 'donut-sprinkles', 0.98],
  ['starboppers', 'Cupcake', 'fo', 'cupcake', 0.5], ['headphones', 'Radio', 'fu', 'radio', 0.5],
  ['tree', 'Tree', 'na', 'tree_default', 4.6], ['tree2', 'Oak tree', 'na', 'tree_oak', 4.72], ['tree3', 'Snowy tree', 'pf', 'tree-snow', 4.5], ['tree4', 'Fir tree', 'na', 'tree_pineTallA', 4.72],
  ['flower', 'Red flowers', 'na', 'flower_redA', 1.77], ['flower2', 'Purple flowers', 'na', 'flower_purpleA', 1.74], ['mushroom', 'Mushroom', 'na', 'mushroom_red', 0.87], ['mushroom_2', 'Toadstools', 'na', 'mushroom_redGroup', 0.87],
  ['rocks', 'Big rock', 'na', 'rock_largeA', 1.52], ['rocks2', 'Tall rock', 'na', 'rock_tallA', 1.45], ['rocks3', 'Rock steps', 'na', 'cliff_steps_rock', 2.67], ['rocks4', 'Cliff', 'na', 'cliff_block_rock', 3],
  ['icecrystals', 'Cactus', 'na', 'cactus_tall', 1.6], ['stalagmite', 'Stone pillar', 'na', 'statue_obelisk', 2], ['pond', 'Fountain', 'ft', 'fountain-round', 1.12],
  ['hut', 'House', 'ci', 'building-type-a', 8.8], ['hut2', 'Cottage', 'ci', 'building-type-c', 9.06], ['hut3', 'Tent', 'na', 'tent_detailedClosed', 6.94], ['hut4', 'Market stall', 'ft', 'stall-red', 3.5],
  ['window_window', 'Wall with a window', 'ft', 'wall-window-glass', 5.4], ['window_only', 'Wall with shutters', 'ft', 'wall-window-shutters', 5.4], ['window_door', 'Wall with a door', 'ft', 'wall-door', 5.4],
  ['window_door_reversed', 'Wooden wall with a door', 'ft', 'wall-wood-door', 5.4], ['window_stairs', 'Stone steps', 'ft', 'stairs-stone', 5.4],
  ['humped', 'Stone bridge', 'na', 'bridge_stoneRound', 2.36], ['jetty', 'Wooden bridge', 'na', 'bridge_wood', 2.35], ['boardwalk_straight', 'Stepping stones', 'ci', 'path-stones-long', 0.2],
  ['boat', 'Canoe', 'na', 'canoe', 1], ['airplane', 'Flag', 'pf', 'flag', 2], ['airplane2', 'Treasure chest', 'pf', 'chest', 0.8], ['skateboard', 'Spring', 'pf', 'spring', 0.6],
  // new ones
  ['cart', 'Cart', 'ft', 'cart', 1.4], ['barrel', 'Barrel', 'pf', 'barrel', 1], ['crate', 'Crate', 'pf', 'crate', 1],
  ['sign', 'Sign', 'pf', 'sign', 1.2], ['ladder', 'Ladder', 'pf', 'ladder', 2.4], ['trophy', 'Trophy', 'ar', 'trophy', 1], ['statue', 'Statue', 'ar', 'statue', 2.5],
  ['palm', 'Palm tree', 'na', 'tree_palmTall', 5], ['pine', 'Pine tree', 'pf', 'tree-pine', 4], ['bush', 'Bush', 'na', 'plant_bushLarge', 1], ['log', 'Log', 'na', 'log_large', 0.6],
  ['campfire', 'Campfire', 'na', 'campfire_stones', 0.6], ['hedge', 'Hedge', 'ft', 'hedge', 1.2], ['fence', 'Fence', 'ft', 'fence', 1], ['house2', 'Big house', 'ci', 'building-type-k', 4.5],
  ['bench', 'Bench', 'fu', 'bench', 0.8], ['table', 'Table', 'fu', 'tableRound', 0.8], ['chair', 'Chair', 'fu', 'chair', 1], ['sofa', 'Sofa', 'fu', 'loungeSofa', 0.9],
  ['cake', 'Birthday cake', 'fo', 'cake-birthday', 0.6], ['pizza', 'Pizza', 'fo', 'pizza', 0.12], ['icecream', 'Ice cream', 'fo', 'ice-cream', 0.7], ['watermelon', 'Watermelon', 'fo', 'watermelon', 0.5],
  ['banana', 'Banana', 'fo', 'banana', 0.3], ['burger', 'Burger', 'fo', 'burger', 0.4], ['carrot', 'Carrot', 'fo', 'carrot', 0.5], ['bomb', 'Bomb', 'pf', 'bomb', 0.8]
];
