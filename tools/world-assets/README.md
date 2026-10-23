# Making the 3D World models

The 3D World's models (world/assets/) are made from Kenney's CC0 packs (www.kenney.nl). Download the packs listed in
world/assets/README.md and unzip each into one folder (e.g. `tools/world-assets/kenney/`, which git ignores), then:

    # objects + their thumbnails (the list, sizes and labels are in objmap.mjs)
    KENNEY=path/to/kenney node tools/world-assets/packobjs.mjs [id …]

    # characters (prints each part's slots: copy slots.json into CHARACTER_SLOTS in world/world-assets.js)
    node tools/world-assets/packchars.mjs "path/to/kenney/kenney_mini-characters/Models/GLB format" world/assets/characters \
      Block5=character-male-a Block1=character-female-b Block2=character-female-c Block3=character-female-d \
      Block4=character-female-e Block6=character-female-f Liz1=character-female-a Liz2=character-male-b \
      Liz5=character-male-c Liz6=character-male-d Liz4=character-male-e Liz3=character-male-f
    for x in …; do convert ".../Previews/character-….png" -trim -resize 72x72 world/assets/thumbs/<id>.png; done

The ids are the old model names, so saved projects keep working. Needs ImageMagick (`convert`).
