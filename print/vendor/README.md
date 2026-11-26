# Print Lab vendor files

| File | What | Licence |
|---|---|---|
| `manifold.js`, `manifold.wasm` | manifold-3d 3.5.4 (npm), the shape maths (joining and cutting solids; always gives closed meshes). `manifold.js` finds `manifold.wasm` next to itself. | Apache-2.0 (`LICENSE-manifold.txt`) |
| `opentype-2.0.0.min.mjs` | opentype.js 2.0.0 (npm `dist/opentype.min.mjs`), reads the font for Text shapes | MIT (`LICENSE-opentype.txt`) |
| `Outfit-Bold.ttf` | Outfit Bold, the font for Text shapes | SIL Open Font License 1.1 (`LICENSE-Outfit-OFL.txt`) |

To update: `npm i manifold-3d@<v> opentype.js@<v>` in a scratch folder and copy the same files across.
print/print-model.js only uses `Manifold.cube/cylinder/sphere/extrude/revolve/union`, `CrossSection` and the
instance methods `translate/rotate/scale/mirror/add/subtract/intersect/boundingBox/getMesh/decompose/volume/genus/status`.
