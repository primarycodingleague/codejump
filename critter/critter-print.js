/* CodeJump · Critter Lab: 3D printing export. Turns a Critter (in its standing rest pose) into closed
 * meshes in millimetres, Z up, feet on the print bed, then writes binary STL (one shape, any slicer) or
 * 3MF (one part per colour, so multi-colour printers can keep the Critter's colours).
 *
 * No DOM: it runs in the browser and in Node (tests). The app (critter-app.js) shows the dialog.
 *
 *   const r = buildPrint(critter, { lengthMM: 120, base: true, names });
 *   r.parts: [{ name, colour, positions: Float32Array (x,y,z…), indices: Uint32Array }]
 *   r.size: [x, y, z] mm   r.warnings: [string]
 *   toSTL(r.parts) → ArrayBuffer      to3MF(r.parts, title) → Uint8Array (a .3mf zip)
 *
 * Printability: every joint gets a ball "knuckle" so parts fuse instead of just touching; with a base,
 * the Critter is sunk 1.2 mm into a 2.4 mm plate so the feet are welded on. Overlapping shells are fine:
 * slicers merge them. Parts thinner than MIN_MM after scaling are reported as warnings. */
import * as Z from './critter-core.js';

export var SIZES = [['small', 'Small', 80], ['medium', 'Medium', 120], ['large', 'Large', 160]];
export var MIN_MM = 2;
var BASE_MM = 2.4, BASE_MARGIN = 4, BASE_COLOUR = '#d8d5d2';

/* ------------------------------------------------------------------ meshes (local units) */

// A closed blob mesh from the superellipsoid grid: the first and last grid rows are its two poles.
function blobMesh(b, nLat, nLon) {
  var rows = Z.blobGrid(b, nLat, nLon), pos = [], idx = [];
  pos.push(rows[0][0]);
  for (var i = 1; i < nLat; i++) rows[i].forEach(function (p) { pos.push(p); });
  pos.push(rows[nLat][0]);
  var top = pos.length - 1, ring = function (i, j) { return 1 + (i - 1) * nLon + ((j + nLon) % nLon); };
  for (var j = 0; j < nLon; j++) {
    idx.push(0, ring(1, j + 1), ring(1, j));
    for (var i2 = 1; i2 < nLat - 1; i2++) idx.push(ring(i2, j), ring(i2, j + 1), ring(i2 + 1, j), ring(i2, j + 1), ring(i2 + 1, j + 1), ring(i2 + 1, j));
    idx.push(top, ring(nLat - 1, j), ring(nLat - 1, j + 1));
  }
  return { pos: pos, idx: idx };
}

function sphereMesh(r, nLat, nLon) {
  var pos = [[0, -r, 0]], idx = [];
  for (var i = 1; i < nLat; i++) {
    var u = -Math.PI / 2 + Math.PI * i / nLat;
    for (var j = 0; j < nLon; j++) { var v = 2 * Math.PI * j / nLon; pos.push([r * Math.cos(u) * Math.cos(v), r * Math.sin(u), r * Math.cos(u) * Math.sin(v)]); }
  }
  pos.push([0, r, 0]);
  var top = pos.length - 1, ring = function (i, j) { return 1 + (i - 1) * nLon + ((j + nLon) % nLon); };
  for (var j2 = 0; j2 < nLon; j2++) {
    idx.push(0, ring(1, j2), ring(1, j2 + 1));
    for (var i2 = 1; i2 < nLat - 1; i2++) idx.push(ring(i2, j2), ring(i2 + 1, j2), ring(i2, j2 + 1), ring(i2, j2 + 1), ring(i2 + 1, j2), ring(i2 + 1, j2 + 1));
    idx.push(top, ring(nLat - 1, j2 + 1), ring(nLat - 1, j2));
  }
  return { pos: pos, idx: idx };
}

// signed volume (positive = outward winding)
function volume(pos, idx) {
  var v = 0;
  for (var k = 0; k < idx.length; k += 3) {
    var a = pos[idx[k]], b = pos[idx[k + 1]], c = pos[idx[k + 2]];
    v += a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
  }
  return v / 6;
}
function outward(m) { if (volume(m.pos, m.idx) < 0) for (var k = 0; k < m.idx.length; k += 3) { var t = m.idx[k + 1]; m.idx[k + 1] = m.idx[k + 2]; m.idx[k + 2] = t; } return m; }

/* ------------------------------------------------------------------ the Critter, posed and scaled */

export function buildPrint(critter, opts) {
  opts = opts || {};
  var z = Z.normalise(critter), ps = Z.pose(z), names = opts.names || {};
  var shapes = []; // { colour, name, pos (world cm, y up), idx }
  function place(m, t, offset) {
    return m.pos.map(function (p) { var q = offset ? Z.add(p, offset) : p; return Z.add(t.p, Z.qRot(t.q, q)); });
  }
  z.blocks.forEach(function (b) {
    var t = ps.blocks[b.id];
    var m = outward(blobMesh(b, 24, 32));
    shapes.push({ colour: b.colour || '#38b6ff', name: names[b.id] || b.id, pos: place(m, t), idx: m.idx, block: b });
    if (b.eyes) {
      var er = Math.max(2.2, Math.min(b.size[1], b.size[2]) * 0.17);
      [-1, 1].forEach(function (side) {
        var sp = Z.surfaceAt(b, '+x', [0.22, side * 0.2]), centre = [sp[0] - er * 0.3, sp[1], sp[2]];
        var eye = outward(sphereMesh(er, 12, 18)), pupil = outward(sphereMesh(er * 0.5, 10, 14));
        shapes.push({ colour: '#ffffff', name: 'Eye', pos: place(eye, t, centre), idx: eye.idx });
        shapes.push({ colour: '#111111', name: 'Pupil', pos: place(pupil, t, Z.add(centre, [er * 0.72, 0, 0])), idx: pupil.idx });
      });
    }
  });
  // knuckles: a ball at every joint so the two parts fuse into one solid print
  z.joints.forEach(function (j) {
    var a = Z.block(z, j.blockA), b = Z.block(z, j.blockB), at = ps.anchors[j.id];
    if (!a || !b || !at) return;
    var r = 0.42 * Math.min(a.size[1], a.size[2], b.size[1], b.size[2]);
    var m = outward(sphereMesh(r, 10, 16));
    shapes.push({ colour: b.colour || '#38b6ff', name: 'Knuckle', pos: m.pos.map(function (p) { return Z.add(at, p); }), idx: m.idx });
  });

  // cm, y up  ->  mm, z up (x stays forwards; y becomes up), scaled to the chosen length
  var all = []; shapes.forEach(function (s) { all.push.apply(all, s.pos); });
  var min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  all.forEach(function (p) { for (var k = 0; k < 3; k++) { min[k] = Math.min(min[k], p[k]); max[k] = Math.max(max[k], p[k]); } });
  var longest = Math.max(max[0] - min[0], max[2] - min[2]) || 1;
  var s = (opts.lengthMM || 120) / longest; // mm per cm
  var cx = (min[0] + max[0]) / 2, cz = (min[2] + max[2]) / 2, floor = min[1];
  var height = (max[1] - min[1]) * s, sink = opts.base ? BASE_MM / 2 : 0; // feet sunk halfway into the plate
  function toPrint(p) { return [(p[0] - cx) * s, -(p[2] - cz) * s, (p[1] - floor) * s - sink]; }

  var groups = {}, order = [];
  shapes.forEach(function (sh) {
    var key = sh.colour.toLowerCase();
    if (!groups[key]) { groups[key] = { name: sh.name, colour: key, pos: [], idx: [] }; order.push(key); }
    var g = groups[key], base = g.pos.length / 3;
    sh.pos.forEach(function (p) { var q = toPrint(p); g.pos.push(q[0], q[1], q[2]); });
    sh.idx.forEach(function (i) { g.idx.push(base + i); });
  });
  var parts = order.map(function (k) { var g = groups[k]; return { name: g.name, colour: g.colour, positions: new Float32Array(g.pos), indices: new Uint32Array(g.idx) }; });

  var w = (max[0] - min[0]) * s, d = (max[2] - min[2]) * s, size = [w, d, height - sink];
  if (opts.base) {
    var plate = basePlate(w + 2 * BASE_MARGIN, d + 2 * BASE_MARGIN, BASE_MM);
    parts.push({ name: 'Base', colour: BASE_COLOUR, positions: plate.positions, indices: plate.indices });
    size = [w + 2 * BASE_MARGIN, d + 2 * BASE_MARGIN, height - sink + BASE_MM];
  }

  // anything that ends up thinner than MIN_MM is likely to snap or not print at all
  var warnings = [], seen = {};
  z.blocks.forEach(function (b) {
    var thin = Math.min(b.size[0], b.size[1], b.size[2]) * s;
    if (thin < MIN_MM) { var n = names[b.id] || 'A part'; if (!seen[n]) { seen[n] = 1; warnings.push(n + ' is only ' + thin.toFixed(1) + ' mm thick'); } }
  });
  return { parts: parts, size: size, scale: s, warnings: warnings, triangles: parts.reduce(function (t, p) { return t + p.indices.length / 3; }, 0) };
}

// A rounded-rectangle slab, top face at z = 0.
function basePlate(w, d, th) {
  var r = Math.min(8, w / 4, d / 4), outline = [], n = 10;
  [[w / 2 - r, d / 2 - r, 0], [-w / 2 + r, d / 2 - r, 90], [-w / 2 + r, -d / 2 + r, 180], [w / 2 - r, -d / 2 + r, 270]].forEach(function (c) {
    for (var i = 0; i <= n; i++) { var a = (c[2] + 90 * i / n) * Math.PI / 180; outline.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); }
  });
  var m = outline.length, pos = [], idx = [];
  outline.forEach(function (p) { pos.push(p[0], p[1], 0); });
  outline.forEach(function (p) { pos.push(p[0], p[1], -th); });
  pos.push(0, 0, 0, 0, 0, -th);
  var ct = 2 * m, cb = 2 * m + 1;
  for (var i = 0; i < m; i++) {
    var j = (i + 1) % m;
    idx.push(ct, i, j);              // top (counter-clockwise from above)
    idx.push(cb, m + j, m + i);      // bottom
    idx.push(i, m + i, j, j, m + i, m + j); // side
  }
  return { positions: new Float32Array(pos), indices: new Uint32Array(idx) };
}

/* ------------------------------------------------------------------ STL */

export function toSTL(parts) {
  var tris = parts.reduce(function (t, p) { return t + p.indices.length / 3; }, 0);
  var buf = new ArrayBuffer(84 + 50 * tris), dv = new DataView(buf), o = 84;
  var head = 'CodeJump Critter Lab'; for (var h = 0; h < head.length; h++) dv.setUint8(h, head.charCodeAt(h));
  dv.setUint32(80, tris, true);
  parts.forEach(function (p) {
    var P = p.positions, I = p.indices;
    for (var k = 0; k < I.length; k += 3) {
      var a = I[k] * 3, b = I[k + 1] * 3, c = I[k + 2] * 3;
      var ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1;
      dv.setFloat32(o, nx / l, true); dv.setFloat32(o + 4, ny / l, true); dv.setFloat32(o + 8, nz / l, true); o += 12;
      [a, b, c].forEach(function (q) { dv.setFloat32(o, P[q], true); dv.setFloat32(o + 4, P[q + 1], true); dv.setFloat32(o + 8, P[q + 2], true); o += 12; });
      dv.setUint16(o, 0, true); o += 2;
    }
  });
  return buf;
}

/* ------------------------------------------------------------------ 3MF (a zip of XML) */

function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]; }); }
function num(v) { return (Math.round(v * 1000) / 1000).toString(); }

// One mesh object per colour, joined as the components of a single object, so the slicer sees one
// Critter made of coloured parts it can give a filament each.
export function to3MF(parts, title) {
  var x = '<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-GB" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">\n' +
    '<metadata name="Title">' + esc(title || 'Critter') + '</metadata>\n<metadata name="Application">CodeJump Critter Lab</metadata>\n<resources>\n<basematerials id="1">\n';
  parts.forEach(function (p, i) { x += '<base name="' + esc(p.name + ' ' + (i + 1)) + '" displaycolor="' + p.colour.toUpperCase() + 'FF"/>\n'; });
  x += '</basematerials>\n';
  var chunks = [x];
  parts.forEach(function (p, i) {
    var s = '<object id="' + (i + 2) + '" type="model" name="' + esc(p.name) + '" pid="1" pindex="' + i + '"><mesh><vertices>';
    var P = p.positions, I = p.indices, v = [];
    for (var k = 0; k < P.length; k += 3) v.push('<vertex x="' + num(P[k]) + '" y="' + num(P[k + 1]) + '" z="' + num(P[k + 2]) + '"/>');
    var t = [];
    for (var k2 = 0; k2 < I.length; k2 += 3) t.push('<triangle v1="' + I[k2] + '" v2="' + I[k2 + 1] + '" v3="' + I[k2 + 2] + '"/>');
    chunks.push(s + v.join('') + '</vertices><triangles>' + t.join('') + '</triangles></mesh></object>\n');
  });
  var asm = parts.length + 2;
  chunks.push('<object id="' + asm + '" type="model" name="' + esc(title || 'Critter') + '"><components>' + parts.map(function (p, i) { return '<component objectid="' + (i + 2) + '"/>'; }).join('') + '</components></object>\n</resources>\n<build><item objectid="' + asm + '"/></build>\n</model>\n');
  var enc = new TextEncoder();
  return zip([
    ['[Content_Types].xml', enc.encode('<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>')],
    ['_rels/.rels', enc.encode('<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>')],
    ['3D/3dmodel.model', enc.encode(chunks.join(''))]
  ]);
}

// Minimal zip writer (stored, no compression) — enough for a 3MF package.
var CRC = (function () { var t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(d) { var c = 0xFFFFFFFF; for (var i = 0; i < d.length; i++) c = CRC[(c ^ d[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function zip(files) {
  var enc = new TextEncoder(), locals = [], central = [], offset = 0;
  files.forEach(function (f) {
    var name = enc.encode(f[0]), data = f[1], crc = crc32(data);
    var lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
    lh.setUint16(10, 0, true); lh.setUint16(12, 0x21, true); lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
    lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
    var ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
    ch.setUint16(12, 0, true); ch.setUint16(14, 0x21, true); ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
    ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
    locals.push(new Uint8Array(lh.buffer), name, data); central.push(new Uint8Array(ch.buffer), name);
    offset += 30 + name.length + data.length;
  });
  var cdSize = central.reduce(function (t, a) { return t + a.length; }, 0);
  var end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
  var all = locals.concat(central, [new Uint8Array(end.buffer)]), len = all.reduce(function (t, a) { return t + a.length; }, 0);
  var out = new Uint8Array(len), o = 0; all.forEach(function (a) { out.set(a, o); o += a.length; });
  return out;
}
