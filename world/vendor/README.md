# 3D World vendor files

Loaded only when a 3D World project opens (see `world/world-app.js`).

| File | What | Licence |
| --- | --- | --- |
| `babylon-world.min.js` | Babylon.js 9.19.1 (`@babylonjs/core` + `@babylonjs/materials`, only the parts listed in `babylon-world.entry.js`) and the Havok physics loader (`@babylonjs/havok` 1.3.12), bundled as one ES module | Babylon.js: Apache-2.0 · Havok: MIT |
| `HavokPhysics.wasm` | Havok physics engine (from `@babylonjs/havok/lib/esm/`). The bundle finds it next to itself via `import.meta.url` | MIT |
| `blockly-javascript-10.4.3.min.js` | Blockly's JavaScript generator, `blockly@10.4.3/javascript_compressed.js`, matching the page's Blockly 10.4.3 | Apache-2.0 |

## Rebuilding the Babylon bundle

```sh
npm i @babylonjs/core@9.19.1 @babylonjs/materials@9.19.1 @babylonjs/havok@1.3.12 esbuild
npx esbuild babylon-world.entry.js --bundle --format=esm --minify --legal-comments=none --outfile=babylon-world.min.js
cp node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm .
```

Add an export to `babylon-world.entry.js` when the runtime needs another Babylon class.
