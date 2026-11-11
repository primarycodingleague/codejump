// Web Lab model: a pupil's website as plain data, and everything that can be done with it without a page (Node-testable).
//
// Project (also exactly what a live room keeps: each top-level field is one live part):
//   { v:1,
//     site: { title, theme:{font,bg,text,head,accent,link,width,nav,corners}, order:[pageId…], css },
//     imgs: { <imgId>: 'data:image/jpeg;base64,…' },          // pictures pupils uploaded
//     p<pageId>: { name, blocks:[block…] }, … }               // one field per page (ids = 6 lower-case letters)
// A block: { id, t, …its own fields, align?, color?, bg?, size?, cls? } — see BLOCKS. Text fields hold a small, safe piece
// of inline HTML (b/i/u/a/br/span…), cleaned by cleanInline. Links are '#p-<pageId>' (another page) or 'https://…'.
//
// Output is one HTML document that holds every page as a <section>; CSS :target shows the page you linked to (the home page
// when there is no #), so a whole site works with no scripts at all — in the app's preview (a sandboxed frame), in a
// downloaded .html file, and anywhere it's copied to. fromHTML() reads pupils' edited HTML back into blocks.
import { PICTURES, PICTURE_KEYS, pictureURL } from './web-pictures.js';
export { PICTURES, PICTURE_KEYS, pictureURL };

export const LIMITS = { pages: 12, blocks: 150, text: 4000, imgs: 24, img: 450000, css: 8000, cols: 3, rows: 12, cells: 6, items: 30 };

// ── small helpers ──
export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const str = (v, max = 200) => (typeof v === 'string' ? v : v == null ? '' : String(v)).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0, max);
const clamp = (v, a, b, d) => { v = Number(v); return Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : d; };
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
export function newId(rnd = Math.random) { let s = ''; for (let i = 0; i < 6; i++) s += LETTERS[Math.floor(rnd() * 26)]; return s; }
const isId = s => typeof s === 'string' && /^[a-z]{6}$/.test(s);
export const safeColour = v => (typeof v === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim())) ? v.trim().toLowerCase() : null;
const one = (v, list, d) => list.includes(v) ? v : d;

// ── the theme ──
// FONTS[key] = [label, CSS stack, group, file?, bold?]. A font with a file is one of our own bundled open-licence fonts
// (web/fonts/<file>-400.woff2, and -700 when bold is 1). The label is also its font-family name. Saved projects store the key.
export const FONTS = {
  friendly: ['Friendly', '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', 'simple'],
  clean: ['Clean', 'Arial, Helvetica, sans-serif', 'simple'],
  rounded: ['Rounded', '"Arial Rounded MT Bold", "Varela Round", "Nunito", system-ui, sans-serif', 'simple'],
  classic: ['Book', 'Georgia, "Times New Roman", serif', 'simple'],
  bold: ['Bold', '"Arial Black", "Helvetica Neue", Impact, sans-serif', 'simple'],
  typewriter: ['Typewriter', '"Courier New", Courier, monospace', 'simple'],
  lexend: ['Lexend', '"Lexend", Arial, sans-serif', 'read', 'lexend', 1],
  atkinson: ['Atkinson Hyperlegible', '"Atkinson Hyperlegible", Arial, sans-serif', 'read', 'atkinson', 1],
  opendys: ['OpenDyslexic', '"OpenDyslexic", "Comic Sans MS", sans-serif', 'read', 'opendys', 1],
  comic: ['Comic Neue', '"Comic Neue", "Comic Sans MS", cursive', 'read', 'comic', 1],
  nunito: ['Nunito', '"Nunito", Arial, sans-serif', 'read', 'nunito', 1],
  poppins: ['Poppins', '"Poppins", Arial, sans-serif', 'read', 'poppins', 1],
  fredoka: ['Fredoka', '"Fredoka", "Trebuchet MS", sans-serif', 'fun', 'fredoka', 1],
  baloo: ['Baloo 2', '"Baloo 2", "Trebuchet MS", sans-serif', 'fun', 'baloo', 1],
  chewy: ['Chewy', '"Chewy", "Trebuchet MS", cursive', 'fun', 'chewy'],
  righteous: ['Righteous', '"Righteous", "Trebuchet MS", sans-serif', 'fun', 'righteous'],
  bangers: ['Bangers', '"Bangers", Impact, sans-serif', 'fun', 'bangers'],
  patrick: ['Patrick Hand', '"Patrick Hand", "Comic Sans MS", cursive', 'hand', 'patrick'],
  caveat: ['Caveat', '"Caveat", "Comic Sans MS", cursive', 'hand', 'caveat', 1],
  indie: ['Indie Flower', '"Indie Flower", "Comic Sans MS", cursive', 'hand', 'indie'],
  marker: ['Permanent Marker', '"Permanent Marker", "Comic Sans MS", cursive', 'hand', 'marker'],
  amatic: ['Amatic SC', '"Amatic SC", "Comic Sans MS", cursive', 'hand', 'amatic', 1],
  lobster: ['Lobster', '"Lobster", Georgia, cursive', 'fancy', 'lobster'],
  pacifico: ['Pacifico', '"Pacifico", Georgia, cursive', 'fancy', 'pacifico'],
  playfair: ['Playfair Display', '"Playfair Display", Georgia, serif', 'fancy', 'playfair', 1],
  merri: ['Merriweather', '"Merriweather", Georgia, serif', 'fancy', 'merri', 1],
  robotoslab: ['Roboto Slab', '"Roboto Slab", Georgia, serif', 'fancy', 'robotoslab', 1],
  bungee: ['Bungee', '"Bungee", Impact, sans-serif', 'big', 'bungee'],
  creepster: ['Creepster', '"Creepster", Impact, cursive', 'big', 'creepster'],
  orbitron: ['Orbitron', '"Orbitron", Arial, sans-serif', 'tech', 'orbitron', 1],
  pixel: ['Press Start 2P', '"Press Start 2P", "Courier New", monospace', 'tech', 'pixel'],
  spacemono: ['Space Mono', '"Space Mono", "Courier New", monospace', 'tech', 'spacemono', 1]
};
export const FONT_GROUPS = [['simple', 'On every computer'], ['read', 'Easy to read'], ['fun', 'Fun'], ['hand', 'Handwriting'], ['fancy', 'Fancy'], ['big', 'Big and bold'], ['tech', 'Games and space']];
// @font-face rules for bundled fonts, from data: URLs the app fetched: data[key] = {400: url, 700?: url}
export function fontFaceCSS(data) {
  let css = '';
  for (const [k, d] of Object.entries(data || {})) {
    const f = FONTS[k]; if (!f || !f[3] || !d) continue;
    for (const wt of ['400', '700']) if (typeof d[wt] === 'string' && /^data:font\/woff2;base64,[A-Za-z0-9+/=]+$/.test(d[wt]))
      css += `@font-face { font-family: "${f[0]}"; src: url(${d[wt]}) format("woff2"); font-weight: ${wt}; font-display: swap; }\n`;
  }
  return css;
}
// the bundled fonts a site uses: its theme, its blocks, and any font named in its own CSS or HTML
export function usedFonts(p) {
  const out = new Set(), t = p.site.theme, add = k => { if (FONTS[k] && FONTS[k][3]) out.add(k); };
  add(t.font); add(t.hfont);
  let text = (p.site.css || '').toLowerCase();
  eachBlock(p, b => { add(b.font); if (b.t === 'html') text += ' ' + b.html.toLowerCase(); });
  for (const [k, f] of Object.entries(FONTS)) if (f[3] && text.includes(f[0].toLowerCase())) out.add(k);
  return [...out];
}
export const THEMES = { // ready-made colour sets (the pupil can change any colour after)
  sky: { bg: '#f4f9ff', text: '#1f2a37', head: '#1d4ed8', accent: '#2563eb', link: '#1d4ed8' },
  forest: { bg: '#f3faf1', text: '#1f2d1f', head: '#2f7a3a', accent: '#3d9a4a', link: '#2f7a3a' },
  sunset: { bg: '#fff7ef', text: '#3a2414', head: '#c2410c', accent: '#ea580c', link: '#b4400a' },
  berry: { bg: '#fdf4fb', text: '#3b1d33', head: '#a21caf', accent: '#c026d3', link: '#a21caf' },
  night: { bg: '#141826', text: '#e8ecf4', head: '#ffd166', accent: '#ffd166', link: '#9ad1ff' },
  gold: { bg: '#fffdf7', text: '#24211c', head: '#8a6424', accent: '#ae853e', link: '#7a5a1e' },
  ocean: { bg: '#eef8fb', text: '#12313a', head: '#0e7490', accent: '#0e7490', link: '#0e7490' },
  mint: { bg: '#effcf6', text: '#183b2f', head: '#047857', accent: '#059669', link: '#047857' },
  lemon: { bg: '#fffbe6', text: '#3a3214', head: '#a16207', accent: '#b45309', link: '#92400e' },
  candy: { bg: '#fff0f6', text: '#3d1430', head: '#db2777', accent: '#db2777', link: '#be185d' },
  lavender: { bg: '#f6f3ff', text: '#2a2142', head: '#6d28d9', accent: '#7c3aed', link: '#6d28d9' },
  coral: { bg: '#fff4f1', text: '#3b1f1a', head: '#dc2626', accent: '#dc2626', link: '#b91c1c' },
  ice: { bg: '#f0f9ff', text: '#0f2a3d', head: '#0369a1', accent: '#0284c7', link: '#0369a1' },
  retro: { bg: '#fdf6e3', text: '#3b2f2f', head: '#b5442c', accent: '#2a7f62', link: '#b5442c' },
  mono: { bg: '#ffffff', text: '#111111', head: '#000000', accent: '#333333', link: '#000000' },
  space: { bg: '#0b1026', text: '#e6e9ff', head: '#8ab4ff', accent: '#6366f1', link: '#a5b4fc' },
  jungle: { bg: '#102a1c', text: '#e7f5ea', head: '#a3e635', accent: '#15803d', link: '#86efac' },
  volcano: { bg: '#1c1110', text: '#fbe9e4', head: '#fb923c', accent: '#dc2626', link: '#fdba74' },
  chalk: { bg: '#1f3a2f', text: '#f1f5ef', head: '#fde68a', accent: '#a16207', link: '#fde68a' },
  neon: { bg: '#0a0a0a', text: '#f5f5f5', head: '#39ff14', accent: '#9333ea', link: '#22d3ee' }
};
export const GRADS = { none: 'None', down: 'Top to bottom', across: 'Side to side', diag: 'Corner to corner', radial: 'From the middle' };
export const PATTERNS = { none: 'None', dots: 'Dots', stripes: 'Stripes', grid: 'Grid', checks: 'Checks', diamonds: 'Diamonds', zigzag: 'Zigzag' };
export const DEFAULT_THEME = Object.assign({ font: 'friendly', hfont: '', width: 'normal', nav: 'bar', corners: 'round', bg2: '', grad: 'none', pat: 'none', fsize: 18 }, THEMES.sky);
function cleanTheme(t) {
  t = t && typeof t === 'object' ? t : {};
  const d = DEFAULT_THEME, out = {};
  out.font = one(t.font, Object.keys(FONTS), d.font);
  out.hfont = one(t.hfont, Object.keys(FONTS), '');
  for (const k of ['bg', 'text', 'head', 'accent', 'link']) out[k] = safeColour(t[k]) || d[k];
  out.width = one(t.width, ['narrow', 'normal', 'wide'], d.width);
  out.nav = one(t.nav, ['bar', 'tabs', 'none'], d.nav);
  out.corners = one(t.corners, ['round', 'sharp'], d.corners);
  out.bg2 = safeColour(t.bg2) || '';
  out.grad = one(t.grad, Object.keys(GRADS), 'none');
  out.pat = one(t.pat, Object.keys(PATTERNS), 'none');
  out.fsize = clamp(t.fsize, 12, 28, 18) | 0;
  return out;
}
// a colour as rgba() with see-through a
export function rgba(hex, a) { const c = safeColour(hex) || '#000000'; const h = c.length === 4 ? c.slice(1).split('').map(x => x + x).join('') : c.slice(1); return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`; }
const GRAD_CSS = { down: '180deg', across: '90deg', diag: '135deg' };
function gradient(kind, a, b) { return kind === 'radial' ? `radial-gradient(circle at top, ${b}, ${a} 75%)` : `linear-gradient(${GRAD_CSS[kind]}, ${a}, ${b})`; }
function patternCSS(pat, c) {
  switch (pat) {
    case 'dots': return [`radial-gradient(${c} 2.5px, transparent 3px) 0 0 / 24px 24px`];
    case 'stripes': return [`repeating-linear-gradient(45deg, ${c} 0 10px, transparent 10px 26px)`];
    case 'grid': return [`linear-gradient(${c} 1px, transparent 1px) 0 0 / 28px 28px`, `linear-gradient(90deg, ${c} 1px, transparent 1px) 0 0 / 28px 28px`];
    case 'checks': return [`conic-gradient(${c} 25%, transparent 0 50%, ${c} 0 75%, transparent 0) 0 0 / 44px 44px`];
    case 'diamonds': return [`linear-gradient(45deg, ${c} 25%, transparent 25% 75%, ${c} 75%) 0 0 / 34px 34px`, `linear-gradient(45deg, ${c} 25%, transparent 25% 75%, ${c} 75%) 17px 17px / 34px 34px`];
    case 'zigzag': return [`linear-gradient(135deg, ${c} 25%, transparent 25%) -16px 0 / 32px 32px`, `linear-gradient(225deg, ${c} 25%, transparent 25%) -16px 0 / 32px 32px`, `linear-gradient(315deg, ${c} 25%, transparent 25%) 0 0 / 32px 32px`, `linear-gradient(45deg, ${c} 25%, transparent 25%) 0 0 / 32px 32px`];
  }
  return [];
}
// the page background: a colour, a gradient, and a pattern on top
export function backgroundCSS(t, strength = 0.07) {
  const layers = patternCSS(t.pat, rgba(t.text, strength));
  layers.push(t.grad !== 'none' && t.bg2 ? gradient(t.grad, t.bg, t.bg2) : t.bg);
  return layers.join(', ');
}

// ── safe HTML: a small tokenizer + tree builder, and a whitelist that rebuilds only what it allows ──
// Everything the page shows is rebuilt from this tree, never passed through, and it is shown in a frame with no scripts
// and a Content-Security-Policy, so a mistake here can't run code.
const VOID = new Set(['br', 'hr', 'img', 'wbr']);
const DROP = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'select', 'textarea', 'svg', 'math', 'template',
  'noscript', 'video', 'audio', 'canvas', 'link', 'meta', 'base', 'title', 'head', 'frame', 'frameset', 'applet', 'param', 'source', 'track', 'dialog']);
const RAW = new Set(['script', 'style', 'textarea', 'title', 'xmp', 'noscript', 'iframe', 'template']);
const INLINE = new Set(['b', 'strong', 'i', 'em', 'u', 'a', 'br', 'span', 'mark', 'small', 'sub', 'sup', 'code', 's']);
const BLOCKISH = new Set(['details', 'summary', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'hr', 'img', 'figure', 'figcaption', 'table', 'thead',
  'tbody', 'tr', 'td', 'th', 'div', 'section', 'header', 'footer', 'article', 'aside', 'main', 'nav', 'pre', 'cite', 'caption']);
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '©', pound: '£', euro: '€', hellip: '…', mdash: '—', ndash: '–',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', times: '×', deg: '°', hearts: '♥', star: '☆' };
export function decodeEntities(s) {
  return String(s).replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z]{2,8});?/gi, (m, e) => {
    if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return n > 0 && n < 0x110000 && !(n >= 0xd800 && n < 0xe000) ? String.fromCodePoint(n) : ''; }
    const v = ENT[e.toLowerCase()]; return v == null ? m : v;
  });
}
export function tokenize(html) {
  html = String(html == null ? '' : html).slice(0, 400000);
  const out = []; let i = 0;
  const text = s => { if (s) out.push({ type: 'text', v: decodeEntities(s) }); };
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt < 0) { text(html.slice(i)); break; }
    text(html.slice(i, lt));
    if (html.startsWith('<!--', lt)) { const e = html.indexOf('-->', lt + 4); i = e < 0 ? html.length : e + 3; continue; }
    if (html[lt + 1] === '!' || html[lt + 1] === '?') { const e = html.indexOf('>', lt); i = e < 0 ? html.length : e + 1; continue; }
    const m = /^<(\/?)([a-zA-Z][a-zA-Z0-9-]*)/.exec(html.slice(lt, lt + 40));
    if (!m) { text('<'); i = lt + 1; continue; }
    // find the end of the tag, skipping quoted attribute values
    let j = lt + m[0].length, q = null;
    for (; j < html.length; j++) { const c = html[j]; if (q) { if (c === q) q = null; } else if (c === '"' || c === "'") q = c; else if (c === '>') break; }
    const inside = html.slice(lt + m[0].length, j), tag = m[2].toLowerCase();
    i = j + 1;
    if (m[1]) { out.push({ type: 'close', tag }); continue; }
    const attrs = {};
    const re = /([^\s"'=<>`/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g; let a;
    while ((a = re.exec(inside))) { const k = a[1].toLowerCase(); if (!(k in attrs)) attrs[k] = decodeEntities(a[2] != null ? a[2] : a[3] != null ? a[3] : a[4] != null ? a[4] : ''); }
    out.push({ type: 'open', tag, attrs, self: /\/\s*$/.test(inside) || VOID.has(tag) });
    if (RAW.has(tag)) { // skip everything up to the closing tag
      const e = html.toLowerCase().indexOf('</' + tag, i); i = e < 0 ? html.length : html.indexOf('>', e) + 1 || html.length;
      out.push({ type: 'close', tag });
    }
  }
  return out;
}
const CLOSES_P = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'ul', 'ol', 'table', 'blockquote', 'hr', 'figure', 'section', 'header', 'footer', 'article', 'aside', 'pre']);
const STOP_P = new Set(['div', 'li', 'td', 'th', 'blockquote', 'section', 'header', 'footer', 'article', 'aside', 'figure', 'main', 'body']);
// a forgiving tree: unmatched closing tags are ignored, unclosed ones close at their parent's end
export function parseTree(html) {
  const root = { tag: '#root', attrs: {}, kids: [] }, stack = [root];
  for (const t of tokenize(html)) {
    const top = stack[stack.length - 1];
    if (t.type === 'text') top.kids.push(t.v);
    else if (t.type === 'open') {
      if (t.tag === 'li') { // a new item closes the open one in the same list
        for (let k = stack.length - 1; k > 0; k--) { const g = stack[k].tag; if (g === 'ul' || g === 'ol') break; if (g === 'li') { stack.length = k; break; } }
      } else if (CLOSES_P.has(t.tag)) { // a block element closes an open paragraph or heading
        for (let k = stack.length - 1; k > 0; k--) { const g = stack[k].tag; if (g === 'p' || /^h[1-6]$/.test(g)) { stack.length = k; break; } if (STOP_P.has(g)) break; }
      }
      const n = { tag: t.tag, attrs: t.attrs, kids: [] };
      stack[stack.length - 1].kids.push(n);
      if (!t.self && stack.length < 40) stack.push(n);
    } else {
      const k = stack.map(n => n.tag).lastIndexOf(t.tag);
      if (k > 0) stack.length = k;
    }
  }
  return root;
}
// CSS declarations pupils may use (in style="" and in their own CSS). No url(), no expressions, nothing that can cover the page.
const CSS_PROPS = new Set(['color', 'background-color', 'background', 'font-size', 'font-weight', 'font-style', 'font-family', 'text-align', 'text-decoration',
  'text-transform', 'letter-spacing', 'line-height', 'margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right', 'padding', 'padding-top',
  'padding-bottom', 'padding-left', 'padding-right', 'border', 'border-top', 'border-bottom', 'border-left', 'border-right', 'border-color', 'border-width',
  'border-style', 'border-radius', 'width', 'max-width', 'min-width', 'height', 'max-height', 'min-height', 'display', 'gap', 'flex', 'flex-direction',
  'flex-wrap', 'justify-content', 'align-items', 'grid-template-columns', 'opacity', 'box-shadow', 'text-shadow', 'vertical-align', 'list-style-type',
  'object-fit', 'float', 'clear', 'transform', 'transition', 'cursor', 'outline', 'white-space', 'word-spacing', 'columns', 'column-gap', 'aspect-ratio', 'overflow',
  'rotate', 'scale', 'filter', 'background-image', 'animation', 'animation-delay', 'animation-duration', 'z-index', 'grid-area', 'grid-column', 'grid-row', 'border-top-color', 'border-bottom-color', 'text-indent', 'font-variant']);
function cleanValue(prop, v) {
  v = String(v).trim();
  if (!v || v.length > 200) return null;
  if (/url\s*\(|expression|javascript:|@import|\\|<|>|behavior|-moz-binding|var\s*\(|attr\s*\(/i.test(v)) return null;
  if (prop === 'display' && !/^(block|inline|inline-block|flex|inline-flex|grid|none|list-item)$/.test(v)) return null;
  if (prop === 'background' && /image|gradient\s*\(.*url/i.test(v)) return null;
  if ((prop === 'height' || prop === 'max-height' || prop === 'min-height') && /^(\d+)(px)$/.test(v) && parseInt(v, 10) > 2000) return null;
  return v.replace(/!\s*important/gi, '').trim() || null;
}
export function cleanStyle(s) {
  const out = [];
  for (const d of String(s || '').split(';')) {
    const k = d.indexOf(':'); if (k < 0) continue;
    const p = d.slice(0, k).trim().toLowerCase(), v = cleanValue(p, d.slice(k + 1));
    if (CSS_PROPS.has(p) && v) out.push(p + ': ' + v);
    if (out.length >= 30) break;
  }
  return out.join('; ');
}
const cleanClass = s => String(s || '').split(/\s+/).filter(c => /^[a-zA-Z][\w-]{0,30}$/.test(c)).slice(0, 6).join(' ');
// where a link may go: another page of this site, or an https web page
export function cleanHref(h, pages) {
  h = String(h || '').trim();
  let m = /^#p-([a-z]{6})$/.exec(h);
  if (m) return !pages || pages.includes(m[1]) ? h : null;
  m = /^page:([a-z]{6})$/.exec(h);
  if (m) return !pages || pages.includes(m[1]) ? '#p-' + m[1] : null;
  if (/^#top$/.test(h)) return h;
  if (/^https?:\/\/[^\s"'<>\\]{3,400}$/i.test(h) && !/^https?:\/\/(localhost|127\.|0\.|10\.|192\.168\.)/i.test(h)) return h.replace(/^http:/i, 'https:');
  return null;
}
// where a picture may come from: our library, or a picture uploaded into this site (never another website)
export function cleanSrc(s, imgs) {
  s = String(s || '').trim();
  let m = /^lib:([a-z]{2,20})$/.exec(s);
  if (m) return PICTURES[m[1]] ? s : null;
  m = /^img:([a-z]{6})$/.exec(s);
  if (m) return !imgs || imgs[m[1]] ? s : null;
  return null;
}
const ATTRS = { a: ['href', 'title'], img: ['src', 'alt', 'width', 'height'], td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan'], ol: ['start'] };
// the tree, cleaned: only allowed tags/attributes survive; an unknown tag is unwrapped (its words kept); dangerous ones go with their content
function cleanNode(n, ctx, depth) {
  if (typeof n === 'string') return n;
  if (depth > 24 || DROP.has(n.tag)) return null;
  const kids = () => n.kids.map(k => cleanNode(k, ctx, depth + 1)).filter(k => k != null && k !== '');
  const ok = ctx.inline ? INLINE.has(n.tag) : (INLINE.has(n.tag) || BLOCKISH.has(n.tag));
  if (!ok) { const k = kids(); return k.length ? { tag: '#frag', attrs: {}, kids: k } : null; }
  const attrs = {};
  for (const k of (ATTRS[n.tag] || [])) if (n.attrs[k] != null) attrs[k] = n.attrs[k];
  if (n.attrs.class && !ctx.inline) { const c = cleanClass(n.attrs.class); if (c) attrs.class = c; }
  if (n.attrs.style) { const st = cleanStyle(n.attrs.style); if (st) attrs.style = st; }
  if (n.tag === 'a') { const h = cleanHref(attrs.href, ctx.pages); if (h) attrs.href = h; else delete attrs.href; }
  if (n.tag === 'img') {
    const s = cleanSrc(attrs.src, ctx.imgs); if (!s) return null; attrs.src = s; attrs.alt = str(attrs.alt, 200);
    for (const k of ['width', 'height']) if (attrs[k] != null) { const v = clamp(parseInt(attrs[k], 10), 8, 2000, 0); if (v) attrs[k] = String(v); else delete attrs[k]; }
  }
  for (const k of ['colspan', 'rowspan']) if (attrs[k] != null) attrs[k] = String(clamp(parseInt(attrs[k], 10), 1, 6, 1));
  if (attrs.start != null) attrs.start = String(clamp(parseInt(attrs.start, 10), 1, 999, 1));
  return { tag: n.tag, attrs, kids: VOID.has(n.tag) ? [] : kids() };
}
function serialize(nodes, ctx = {}) {
  let s = '';
  for (const n of nodes) {
    if (typeof n === 'string') { s += esc(n).replace(/ /g, '&nbsp;'); continue; }
    if (n.tag === '#frag') { s += serialize(n.kids, ctx); continue; }
    s += '<' + n.tag;
    for (const [k, v] of Object.entries(n.attrs)) s += ' ' + k + '="' + esc(ctx.resolve && (k === 'src' || k === 'href') ? ctx.resolve(k, v) : v) + '"';
    if (n.tag === 'a' && /^https:/.test(n.attrs.href || '')) s += ' target="_blank" rel="noopener noreferrer"';
    s += '>';
    if (VOID.has(n.tag)) continue;
    s += serialize(n.kids, ctx) + '</' + n.tag + '>';
  }
  return s;
}
// a small piece of text with bold/italic/links (what a heading, paragraph, list item or table cell holds)
export function cleanInline(html, pages) {
  const t = parseTree(String(html == null ? '' : html).slice(0, LIMITS.text * 2));
  return serialize(t.kids.map(k => cleanNode(k, { inline: true, pages }, 0)).filter(Boolean)).slice(0, LIMITS.text);
}
export function cleanHTML(html, pages, imgs) {
  const t = parseTree(String(html == null ? '' : html));
  return serialize(t.kids.map(k => cleanNode(k, { inline: false, pages, imgs }, 0)).filter(Boolean)).slice(0, 20000);
}
export const plainText = html => decodeEntities(String(html || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

// a pupil's own CSS: rules with plain selectors and allowed declarations only (no @import, no url(), no @font-face…)
export function cleanCSS(css) {
  css = String(css || '').replace(/\/\*[\s\S]*?\*\//g, '').slice(0, LIMITS.css * 2);
  const out = []; let i = 0, n = 0;
  const selOK = s => /^[a-zA-Z0-9\s.#:_,>+~*()-]+$/.test(s) && !/:(?!hover|first-child|last-child|nth-child\(\s*(\d+|odd|even|\d*n\s*(\+\s*\d+)?)\s*\)|focus|active)\b[a-z-]+/i.test(s.replace(/::?(before|after)/g, 'X'));
  while (i < css.length && n < 200) {
    const o = css.indexOf('{', i); if (o < 0) break;
    const semi = css.indexOf(';', i), at = css.slice(i).trimStart()[0] === '@';
    if (at && semi >= 0 && semi < o) { i = semi + 1; continue; } // @import …; and other one-line at-rules are dropped
    const c = css.indexOf('}', o); if (c < 0) break;
    let sel = css.slice(i, o).trim(); const body = css.slice(o + 1, c); i = c + 1;
    if (sel.startsWith('@')) { // skip a whole at-rule (with its nested block)
      let depth = 1, j = o + 1; for (; j < css.length && depth; j++) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; } i = j; continue; }
    sel = sel.replace(/\s+/g, ' ');
    if (!sel || sel.length > 200 || !selOK(sel)) continue;
    const decl = cleanStyle(body); if (!decl) continue;
    out.push(sel + ' { ' + decl + '; }'); n++;
  }
  return out.join('\n').slice(0, LIMITS.css);
}

// ── blocks ──
// [type, label, icon (an app icon name), make()]
export const BLOCKS = {
  heading: ['Heading', 'heading', () => ({ text: 'My heading', level: 2 })],
  text: ['Text', 'text', () => ({ html: 'Write something here. You can make words <b>bold</b>, <i>slanted</i> or into a link.' })],
  image: ['Picture', 'image', () => ({ src: 'lib:star', alt: 'Star', w: 50, round: false, caption: '' })],
  button: ['Button', 'button', () => ({ label: 'Click me', link: '' })],
  list: ['List', 'list', () => ({ items: ['First thing', 'Second thing', 'Third thing'], ordered: false })],
  quote: ['Quote', 'quote', () => ({ html: 'A great quote goes here.', by: '' })],
  banner: ['Banner', 'banner', () => ({ title: 'Welcome!', sub: 'A short line about this page', src: '' })],
  card: ['Card', 'card', () => ({ title: 'Card title', html: 'A few words about this.', src: 'lib:idea', alt: 'Light bulb', link: '' })],
  columns: ['Columns', 'columns', () => ({ cols: [[blockOf('text')], [blockOf('text')]] })],
  table: ['Table', 'table', () => ({ rows: [['Name', 'Score'], ['Pip', '12'], ['Dot', '9']], head: true })],
  divider: ['Line', 'divider', () => ({})],
  space: ['Space', 'space', () => ({ h: 40 })],
  html: ['Your own HTML', 'code', () => ({ html: '<p>Write your own <b>HTML</b> here.</p>' })],
  shape: ['Shape', 'shape', () => ({ shape: 'circle', text: '' })],
  reveal: ['Click to reveal', 'reveal', () => ({ q: 'What is the biggest planet?', a: 'Jupiter!' })]
};
export const SHAPES = { rect: 'Square', round: 'Rounded', circle: 'Circle', pill: 'Pill', blob: 'Blob', triangle: 'Triangle', diamond: 'Diamond', star: 'Star', hexagon: 'Hexagon', arrow: 'Arrow', burst: 'Burst' };
export const SHADOWS = { soft: '0 6px 18px rgba(0, 0, 0, 0.12)', strong: '0 12px 30px rgba(0, 0, 0, 0.3)', glow: '0 0 22px var(--accent)', float: '0 22px 40px -12px rgba(0, 0, 0, 0.35)', retro: '6px 6px 0 var(--head)' };
export const ANIMS = { fade: 'Fade in', up: 'Slide up', down: 'Slide down', left: 'From the left', right: 'From the right', pop: 'Pop', zoom: 'Zoom in', bounce: 'Bounce', spin: 'Spin in', wobble: 'Wobble' };
export const HOVERS = { grow: 'Grow', lift: 'Lift', shrink: 'Shrink', wiggle: 'Wiggle', glow: 'Glow', spin: 'Spin' };
export const BORDERS = { solid: 'Solid', dashed: 'Dashed', dotted: 'Dotted', double: 'Double' };
// free layout: a page is a grid COLS wide; rows are ROW px tall and grow when what is in them needs more room
export const COLS = 96, ROW = 10;
export const BLOCK_KEYS = Object.keys(BLOCKS);
export function blockOf(t, rnd) { const b = Object.assign({ id: newId(rnd), t }, BLOCKS[t][2]()); if (t === 'columns') b.cols.forEach(c => c.forEach(x => { x.id = newId(rnd); })); return b; }
const STYLE_KEYS = ['align', 'color', 'bg', 'size', 'cls', 'font', 'fs', 'bg2', 'grad', 'bw', 'bc', 'bs', 'rad', 'sh', 'op', 'rot', 'pad', 'anim', 'hov', 'pos', 'z'];
const int = (v, a, b) => { v = Math.round(Number(v)); return Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : null; };
export function cleanPos(p) {
  if (!p || typeof p !== 'object') return null;
  const w = int(p.w, 1, COLS), h = int(p.h, 1, 600), x = int(p.x, 0, COLS - 1), y = int(p.y, 0, 3000);
  if (w == null || h == null || x == null || y == null) return null;
  return { x: Math.min(x, COLS - Math.min(w, COLS)), y, w: Math.min(w, COLS), h };
}
function cleanStyleFields(b, out) {
  if (['left', 'center', 'right'].includes(b.align)) out.align = b.align;
  const c = safeColour(b.color); if (c) out.color = c;
  const g = safeColour(b.bg); if (g) out.bg = g;
  if (['s', 'l', 'xl'].includes(b.size)) out.size = b.size;
  const cl = cleanClass(b.cls); if (cl) out.cls = cl;
  if (FONTS[b.font]) out.font = b.font;
  let n = int(b.fs, 8, 160); if (n != null && b.fs != null && b.fs !== '') out.fs = n;
  const g2 = safeColour(b.bg2); if (g2 && out.bg && GRADS[b.grad] && b.grad !== 'none') { out.bg2 = g2; out.grad = b.grad; }
  n = int(b.bw, 0, 20); if (n) out.bw = n;
  if (out.bw) { const bc = safeColour(b.bc); if (bc) out.bc = bc; if (BORDERS[b.bs] && b.bs !== 'solid') out.bs = b.bs; }
  if (b.rad != null && b.rad !== '') { n = int(b.rad, 0, 300); if (n != null) out.rad = n; }
  if (SHADOWS[b.sh]) out.sh = b.sh;
  n = int(b.op, 5, 100); if (n != null && n < 100) out.op = n;
  n = int(b.rot, -180, 180); if (n) out.rot = n;
  if (b.pad != null && b.pad !== '') { n = int(b.pad, 0, 120); if (n != null) out.pad = n; }
  if (ANIMS[b.anim]) out.anim = b.anim;
  if (HOVERS[b.hov]) out.hov = b.hov;
  const ps = cleanPos(b.pos); if (ps) { out.pos = ps; n = int(b.z, 0, 99); if (n) out.z = n; }
}
export function cleanBlock(b, ctx, depth = 0) {
  if (!b || typeof b !== 'object' || !BLOCKS[b.t]) return null;
  const { pages, imgs } = ctx;
  const out = { id: isId(b.id) && !ctx.seen.has(b.id) ? b.id : newId(), t: b.t };
  ctx.seen.add(out.id);
  const line = (v, n = 300) => cleanInline(str(v, n * 3), pages).slice(0, n * 2);
  switch (b.t) {
    case 'heading': out.text = line(b.text, 200); out.level = clamp(b.level, 1, 3, 2) | 0; break;
    case 'text': out.html = cleanInline(str(b.html, LIMITS.text * 2), pages); break;
    case 'image': out.src = cleanSrc(b.src, imgs) || 'lib:question'; out.alt = str(b.alt, 200); out.w = clamp(b.w, 10, 100, 50) | 0; out.round = !!b.round; out.caption = line(b.caption, 200); break;
    case 'button': out.label = str(b.label, 60); out.link = cleanHref(b.link, pages) || ''; break;
    case 'list': out.items = (Array.isArray(b.items) ? b.items : []).slice(0, LIMITS.items).map(x => line(x, 300)); if (!out.items.length) out.items = ['']; out.ordered = !!b.ordered; break;
    case 'quote': out.html = line(b.html, 600); out.by = str(b.by, 80); break;
    case 'banner': out.title = line(b.title, 120); out.sub = line(b.sub, 200); out.src = cleanSrc(b.src, imgs) || ''; break;
    case 'card': out.title = line(b.title, 120); out.html = line(b.html, 600); out.src = cleanSrc(b.src, imgs) || ''; out.alt = str(b.alt, 200); out.link = cleanHref(b.link, pages) || ''; break;
    case 'columns': {
      const cols = Array.isArray(b.cols) ? b.cols.slice(0, LIMITS.cols) : [];
      out.cols = cols.map(c => (Array.isArray(c) ? c : []).slice(0, 20).map(x => depth ? null : cleanBlock(x && x.t === 'columns' ? null : x, ctx, 1)).filter(Boolean));
      while (out.cols.length < 2) out.cols.push([]);
      break; }
    case 'table': {
      const rows = (Array.isArray(b.rows) ? b.rows : []).slice(0, LIMITS.rows).map(r => (Array.isArray(r) ? r : []).slice(0, LIMITS.cells).map(x => line(x, 200)));
      const w = Math.max(1, ...rows.map(r => r.length)); out.rows = rows.length ? rows.map(r => { while (r.length < w) r.push(''); return r; }) : [['']]; out.head = !!b.head; break; }
    case 'divider': break;
    case 'space': out.h = clamp(b.h, 8, 300, 40) | 0; break;
    case 'html': out.html = cleanHTML(str(b.html, 40000), pages, imgs); break;
    case 'shape': out.shape = one(b.shape, Object.keys(SHAPES), 'circle'); out.text = line(b.text, 120); break;
    case 'reveal': out.q = line(b.q, 300); out.a = line(b.a, 1000); break;
  }
  cleanStyleFields(b, out);
  if (depth) { delete out.pos; delete out.z; } // blocks inside columns flow inside their column
  return out;
}

// ── the project ──
export function cleanProject(p) {
  p = p && typeof p === 'object' ? p : {};
  const s = p.site && typeof p.site === 'object' ? p.site : {};
  const imgs = {};
  if (p.imgs && typeof p.imgs === 'object') for (const [k, v] of Object.entries(p.imgs).slice(0, LIMITS.imgs))
    if (isId(k) && typeof v === 'string' && v.length <= LIMITS.img && /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(v)) imgs[k] = v;
  let order = (Array.isArray(s.order) ? s.order : []).filter(id => isId(id) && p['p' + id] && typeof p['p' + id] === 'object');
  order = [...new Set(order)].slice(0, LIMITS.pages);
  const out = { v: 1, site: { title: str(s.title, 80).trim() || 'My website', theme: cleanTheme(s.theme), order, css: cleanCSS(s.css) }, imgs };
  if (!order.length) { const id = newId(); order.push(id); p = Object.assign({}, p, { ['p' + id]: { name: 'Home', blocks: [blockOf('heading')] } }); }
  const ctx = { pages: order, imgs, seen: new Set() };
  for (const id of order) {
    const pg = p['p' + id];
    const o = out['p' + id] = { name: str(pg.name, 40).trim() || 'Page', blocks: (Array.isArray(pg.blocks) ? pg.blocks : []).slice(0, LIMITS.blocks).map(b => cleanBlock(b, ctx)).filter(Boolean) };
    if (pg.layout === 'free') { o.layout = 'free'; placeMissing(o.blocks); sortFree(o.blocks); }
    else for (const b of o.blocks) { delete b.pos; delete b.z; }
  }
  // goals for a lesson travel with the project
  if (p.goals && typeof p.goals === 'object') out.goals = cleanGoals(p.goals);
  return out;
}
export const pagesOf = p => p.site.order.map(id => Object.assign({ id }, p['p' + id]));
// ── free layout: every block has a place (pos, in grid columns and rows) on the page ──
// a first guess at how many rows a block needs (rows grow anyway when the words need more room)
export function estimateRows(b, w = COLS) {
  const chars = s => plainText(s || '').length, lines = (n, per) => Math.max(1, Math.ceil(n / Math.max(10, per * w / COLS)));
  switch (b.t) {
    case 'heading': return b.level === 1 ? 7 : b.level === 2 ? 5 : 4;
    case 'text': return lines(chars(b.html), 80) * 3 + 2;
    case 'image': return Math.max(6, Math.round(w * 0.9)) + (b.caption ? 3 : 0);
    case 'button': return 6;
    case 'list': return b.items.length * 3 + 2;
    case 'quote': return lines(chars(b.html), 70) * 3 + 5;
    case 'banner': return 24;
    case 'card': return 30;
    case 'columns': return 30;
    case 'table': return b.rows.length * 5 + 2;
    case 'divider': return 3;
    case 'space': return Math.max(2, Math.round(b.h / ROW));
    case 'html': return 14;
    case 'shape': return Math.max(4, Math.round(w * 0.9));
    case 'reveal': return 7;
  }
  return 8;
}
export function defaultWidth(b) {
  if (b.t === 'image') return Math.max(10, Math.round(COLS * (b.w || 50) / 100));
  if (b.t === 'shape') return 20; if (b.t === 'button') return 30; if (b.t === 'card') return 40;
  return COLS;
}
export const bottomOf = blocks => blocks.reduce((m, b) => b.pos ? Math.max(m, b.pos.y + b.pos.h) : m, 0);
// blocks with no place yet go one under another below everything else
export function placeMissing(blocks) {
  let y = bottomOf(blocks);
  for (const b of blocks) if (!b.pos) {
    const w = defaultWidth(b), x = b.align === 'center' || b.t === 'image' || b.t === 'shape' || b.t === 'button' ? Math.round((COLS - w) / 2) : b.align === 'right' ? COLS - w : 0;
    b.pos = { x, y: y ? y + 1 : 1, w, h: estimateRows(b, w) }; y = b.pos.y + b.pos.h;
  }
  return blocks;
}
// in reading order (top to bottom, then left to right): the order screen readers and phones use
export function sortFree(blocks) { return blocks.sort((a, b) => (a.pos.y - b.pos.y) || (a.pos.x - b.pos.x)); }
// switch a page between free placement and the tidy stack
export function setLayout(pg, layout) {
  if (layout === 'free') { if (pg.layout !== 'free') { pg.layout = 'free'; for (const b of pg.blocks) { delete b.pos; delete b.z; } placeMissing(pg.blocks); } }
  else { if (pg.layout === 'free') sortFree(pg.blocks); delete pg.layout; for (const b of pg.blocks) { delete b.pos; delete b.z; } }
}
export function addPage(p, name, rnd, layout) { if (p.site.order.length >= LIMITS.pages) return null; const id = newId(rnd); p.site.order.push(id); p['p' + id] = { name: str(name, 40) || 'New page', blocks: [Object.assign(blockOf('heading', rnd), { text: esc(str(name, 40) || 'New page'), level: 1 })] }; if (layout === 'free') setLayout(p['p' + id], 'free'); return id; }
export function removePage(p, id) { if (p.site.order.length < 2) return false; p.site.order = p.site.order.filter(x => x !== id); delete p['p' + id]; return true; }

// ── templates: what a new website starts as ──
const T = (t, o) => Object.assign(blockOf(t), o);
export const TEMPLATES = {
  blank: ['Blank', 'A home page with a heading.', () => [['Home', [T('heading', { text: 'My website', level: 1 }), T('text', { html: 'Welcome to my website!' })]]]],
  about: ['All about me', 'A page about you, with a picture and a list of favourite things.', () => [
    ['Home', [T('banner', { title: 'All about me', sub: 'Hello! Welcome to my website.' }), T('image', { src: 'lib:star', alt: 'A yellow star', w: 30, align: 'center' }), T('text', { html: 'Write a few sentences about yourself here.' }),
      T('heading', { text: 'My favourite things', level: 2 }), T('list', { items: ['My favourite food is …', 'My favourite animal is …', 'My favourite book is …'] })]],
    ['Hobbies', [T('heading', { text: 'My hobbies', level: 1 }), T('columns', { cols: [[T('card', { title: 'Hobby one', html: 'What I like about it.', src: 'lib:football', alt: 'A football' })], [T('card', { title: 'Hobby two', html: 'What I like about it.', src: 'lib:music', alt: 'A music note' })]] })]]]],
  club: ['Club or team', 'Pages for a club: who we are, when we meet, and news.', () => [
    ['Home', [T('banner', { title: 'Our club', sub: 'Everything you need to know' }), T('text', { html: 'Say what your club does and who can join.' }), T('button', { label: 'When we meet' })]],
    ['When we meet', [T('heading', { text: 'When we meet', level: 1 }), T('table', { rows: [['Day', 'Time', 'Where'], ['Monday', '3:30pm', 'Hall'], ['Thursday', '12:30pm', 'Library']], head: true })]],
    ['News', [T('heading', { text: 'Club news', level: 1 }), T('card', { title: 'Our first meeting', html: 'Write what happened.', src: 'lib:trophy', alt: 'A trophy' })]]]],
  facts: ['Fact file', 'A topic website with facts, pictures and a quiz question.', () => [
    ['Home', [T('heading', { text: 'All about the planets', level: 1 }), T('image', { src: 'lib:planet', alt: 'A planet with rings', w: 45, align: 'center' }), T('text', { html: 'Write an introduction to your topic.' })]],
    ['Facts', [T('heading', { text: 'Amazing facts', level: 1 }), T('list', { items: ['Fact one', 'Fact two', 'Fact three'], ordered: true })]],
    ['Quiz', [T('heading', { text: 'Quiz time', level: 1 }), T('quote', { html: 'Ask a question here!' }), T('text', { html: 'Put the answer at the bottom of the page.' })]]]],
  news: ['Class newsletter', 'A newsletter with a headline story and reports.', () => [
    ['Home', [T('banner', { title: 'Class news', sub: 'Our news this week' }), T('columns', { cols: [[T('card', { title: 'Headline story', html: 'What happened?', src: 'lib:school', alt: 'A school' })], [T('card', { title: 'Sports report', html: 'Who won?', src: 'lib:trophy', alt: 'A trophy' })]] })]]]]
};
export function newProject(template = 'blank', title) {
  const tpl = TEMPLATES[template] || TEMPLATES.blank, p = { v: 1, site: { title: title || (template === 'blank' ? 'My website' : tpl[0]), theme: Object.assign({}, DEFAULT_THEME), order: [], css: '' }, imgs: {} };
  const ids = [];
  for (const [name, blocks] of tpl[2]()) { const id = newId(); ids.push(id); p.site.order.push(id); p['p' + id] = { name, blocks, layout: 'free' }; }
  // a "When we meet"-style button on a template's home page goes to its second page
  const home = p['p' + ids[0]];
  for (const b of home.blocks) if (b.t === 'button' && !b.link && ids[1]) b.link = '#p-' + ids[1];
  return cleanProject(p);
}

// ── HTML out ──
const SIZE = { s: '0.85em', l: '1.3em', xl: '1.7em' };
// a block's own look as CSS declarations (fromHTML reads exactly these back). opts.btn: a button keeps its own padding
function decls(b, opts = {}) {
  const s = [];
  if (b.align && !opts.noAlign) s.push('text-align: ' + b.align);
  if (b.color) s.push('color: ' + b.color);
  if (b.bg) s.push(b.bg2 && b.grad ? 'background: ' + gradient(b.grad, b.bg, b.bg2) : 'background-color: ' + b.bg);
  if (b.pad != null) s.push('padding: ' + b.pad + 'px'); else if (b.bg && !opts.btn && b.t !== 'shape') s.push('padding: 12px 16px');
  if (b.rad != null) s.push('border-radius: ' + b.rad + 'px'); else if (b.bg && !opts.btn && b.t !== 'shape') s.push('border-radius: var(--r)');
  if (b.bw) s.push(`border: ${b.bw}px ${b.bs || 'solid'} ${b.bc || 'currentColor'}`);
  if (b.fs) s.push('font-size: ' + b.fs + 'px'); else if (b.size) s.push('font-size: ' + SIZE[b.size]);
  if (b.font) s.push('font-family: ' + FONTS[b.font][1]);
  if (b.sh) s.push('box-shadow: ' + SHADOWS[b.sh]);
  if (b.op) s.push('opacity: ' + (b.op / 100));
  if (b.rot) s.push('rotate: ' + b.rot + 'deg');
  return s;
}
function styleOf(b, opts) { const s = decls(b, opts); return s.length ? ' style="' + esc(s.join('; ')) + '"' : ''; }
// our own classes: the block's kind, its animations, then the pupil's class name
const fx = b => (b.anim ? ' a-' + b.anim : '') + (b.hov ? ' h-' + b.hov : '');
const cls = (base, b) => { const c = (base + fx(b) + (b.cls ? ' ' + b.cls : '')).trim(); return c ? ' class="' + c + '"' : ''; };
// where a block sits on a free page, put first in its outermost tag's style
function placeIn(html, b) {
  if (!b.pos) return html;
  const p = b.pos, d = `grid-area: ${p.y + 1} / ${p.x + 1} / span ${p.h} / span ${p.w}${b.z ? '; z-index: ' + b.z : ''}`;
  return html.replace(/^(\s*<[a-z0-9]+)([^>]*)>/, (m, open, attrs) => /\sstyle="/.test(attrs) ? open + attrs.replace(/\sstyle="/, ' style="' + d + '; ') + '>' : open + attrs + ' style="' + d + '">');
}
// turn the stored inline HTML into output: our own links/pictures resolved
function inlineOut(html, ctx) { const t = parseTree(html); return serialize(t.kids.map(k => cleanNode(k, { inline: true, pages: ctx.pages }, 0)).filter(Boolean), ctx); }
function srcOf(src, ctx) { if (ctx.src) return ctx.src(src); return src.startsWith('lib:') ? pictureURL(src.slice(4)) : src.startsWith('img:') ? (ctx.imgs[src.slice(4)] || pictureURL('question')) : ''; }
function hrefOf(h, ctx) { return ctx.href ? ctx.href(h) : h; }
// one block as HTML. ctx = {pages, imgs, resolve, href, edit} — `edit` adds data-bid so the editor can find it
export function blockHTML(b, ctx, ind = '') { return placeIn(blockInner(b, ctx, ind), b); }
function blockInner(b, ctx, ind) {
  const id = ctx.edit ? ' data-bid="' + b.id + '"' : '';
  const R = Object.assign({}, ctx, { resolve: (k, v) => k === 'src' ? srcOf(v, ctx) : hrefOf(v, ctx) });
  const inl = h => inlineOut(h, R), st = styleOf(b);
  switch (b.t) {
    case 'heading': return `${ind}<h${b.level}${id}${cls('', b)}${st}>${inl(b.text)}</h${b.level}>`;
    case 'text': return `${ind}<p${id}${cls('', b)}${st}>${inl(b.html)}</p>`;
    case 'image': return `${ind}<figure${id}${cls('pic' + (b.round ? ' round' : ''), b)}${st}>\n${ind}  <img src="${esc(srcOf(b.src, ctx))}" alt="${esc(b.alt)}" style="width: ${b.w}%">${b.caption ? `\n${ind}  <figcaption>${inl(b.caption)}</figcaption>` : ''}\n${ind}</figure>`;
    case 'button': return `${ind}<p${id}${cls('btnrow', Object.assign({}, b, { anim: '', hov: '' }))}${b.align ? ' style="text-align: ' + b.align + '"' : ''}><a class="btn${fx(b)}"${b.link ? ` href="${esc(hrefOf(b.link, ctx))}"` + (/^https:/.test(b.link) ? ' target="_blank" rel="noopener noreferrer"' : '') : ''}${styleOf(b, { btn: true, noAlign: true })}>${esc(b.label)}</a></p>`;
    case 'list': { const tag = b.ordered ? 'ol' : 'ul'; return `${ind}<${tag}${id}${cls('', b)}${st}>\n${b.items.map(x => `${ind}  <li>${inl(x)}</li>`).join('\n')}\n${ind}</${tag}>`; }
    case 'quote': return `${ind}<blockquote${id}${cls('', b)}${st}>\n${ind}  <p>${inl(b.html)}</p>${b.by ? `\n${ind}  <cite>${esc(b.by)}</cite>` : ''}\n${ind}</blockquote>`;
    case 'banner': return `${ind}<header${id}${cls('banner', b)}${st}>${b.src ? `\n${ind}  <img src="${esc(srcOf(b.src, ctx))}" alt="">` : ''}\n${ind}  <h1>${inl(b.title)}</h1>${b.sub ? `\n${ind}  <p>${inl(b.sub)}</p>` : ''}\n${ind}</header>`;
    case 'card': return `${ind}<div${id}${cls('card', b)}${st}>${b.src ? `\n${ind}  <img src="${esc(srcOf(b.src, ctx))}" alt="${esc(b.alt)}">` : ''}\n${ind}  <h3>${inl(b.title)}</h3>\n${ind}  <p>${inl(b.html)}</p>${b.link ? `\n${ind}  <a class="more" href="${esc(hrefOf(b.link, ctx))}"${/^https:/.test(b.link) ? ' target="_blank" rel="noopener noreferrer"' : ''}>Find out more</a>` : ''}\n${ind}</div>`;
    case 'columns': return `${ind}<div${id}${cls('columns', b)}${st}>\n${b.cols.map(c => `${ind}  <div class="col">\n${c.map(x => blockHTML(x, ctx, ind + '    ')).join('\n')}\n${ind}  </div>`).join('\n')}\n${ind}</div>`;
    case 'table': return `${ind}<table${id}${cls('', b)}${st}>\n${b.rows.map((r, i) => `${ind}  <tr>${r.map(c => { const t = b.head && i === 0 ? 'th' : 'td'; return `<${t}>${inl(c)}</${t}>`; }).join('')}</tr>`).join('\n')}\n${ind}</table>`;
    case 'divider': return `${ind}<hr${id}${cls('', b)}${b.bw ? ` style="border-top: ${b.bw}px ${b.bs || 'solid'} ${b.color || 'var(--accent)'}${b.op ? '; opacity: ' + b.op / 100 : ''}"` : b.color ? ' style="border-color: ' + b.color + '"' : ''}>`;
    case 'space': return `${ind}<div${id}${cls('space', b)} style="${esc(['height: ' + b.h + 'px', ...decls(b)].join('; '))}"></div>`;
    case 'shape': return `${ind}<div${id}${cls('shape shape-' + b.shape, b)}${styleOf(b)}${b.text ? '' : ' aria-hidden="true"'}>${b.text ? `<span>${inl(b.text)}</span>` : ''}</div>`;
    case 'reveal': return `${ind}<details${id}${cls('reveal', b)}${st}>\n${ind}  <summary>${inl(b.q)}</summary>\n${ind}  <p>${inl(b.a)}</p>\n${ind}</details>`;
    case 'html': { const t = parseTree(b.html); return `${ind}<div${id}${cls('own', b)}${st}>\n${ind}  ${serialize(t.kids.map(k => cleanNode(k, { inline: false, pages: ctx.pages, imgs: ctx.imgs }, 0)).filter(Boolean), R)}\n${ind}</div>`; }
  }
  return '';
}
export function siteCSS(p) {
  const t = p.site.theme, W = { narrow: '720px', normal: '960px', wide: '1240px' }[t.width];
  return `:root { --bg: ${t.bg}; --text: ${t.text}; --head: ${t.head}; --accent: ${t.accent}; --link: ${t.link}; --r: ${t.corners === 'round' ? '14px' : '0px'}; }
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; min-height: 100vh; background: ${backgroundCSS(t)}; color: var(--text); font-family: ${FONTS[t.font][1]}; font-size: ${t.fsize}px; line-height: 1.55; }
.page { display: none; max-width: ${W}; margin: 0 auto; padding: 0 20px 48px; }
.page:target, body:not(:has(.page:target)) .page.home { display: block; }
h1, h2, h3 { color: var(--head); line-height: 1.2; margin: 1em 0 0.4em;${t.hfont ? ' font-family: ' + FONTS[t.hfont][1] + ';' : ''} }
h1 { font-size: 2.2em; } h2 { font-size: 1.6em; } h3 { font-size: 1.25em; }
p { margin: 0.6em 0; }
a { color: var(--link); }
.site-nav { display: flex; flex-wrap: wrap; gap: 6px; padding: 14px 0; border-bottom: 3px solid var(--accent); margin-bottom: 8px; }
.site-nav a { text-decoration: none; font-weight: 700; padding: 8px 14px; border-radius: var(--r); color: var(--accent); }
.site-nav a.here { background: var(--accent); color: #fff; }
.site-nav.tabs { border-bottom: 0; justify-content: center; }
.site-nav.tabs a { border: 2px solid var(--accent); }
.site-name { font-weight: 800; font-size: 1.2em; color: var(--head); margin-right: auto; padding: 8px 0; }
.pic { margin: 1em 0; }
.pic img { max-width: 100%; height: auto; border-radius: var(--r); }
.pic.round img { border-radius: 50%; aspect-ratio: 1; object-fit: cover; }
figcaption { font-size: 0.9em; opacity: 0.8; margin-top: 4px; }
.btn { display: inline-block; background: var(--accent); color: #fff; font-weight: 700; text-decoration: none; padding: 12px 22px; border-radius: var(--r); }
.btnrow { margin: 1em 0; }
blockquote { margin: 1em 0; padding: 12px 20px; border-left: 6px solid var(--accent); font-size: 1.15em; font-style: italic; }
blockquote p { margin: 0; } cite { display: block; margin-top: 6px; font-size: 0.85em; font-style: normal; opacity: 0.8; }
.banner { text-align: center; padding: 34px 20px; margin: 16px 0; border-radius: var(--r); background: var(--accent); color: #fff; }
.banner h1 { color: #fff; margin: 0.2em 0; } .banner p { font-size: 1.15em; } .banner img { width: 110px; height: 110px; object-fit: contain; }
.card { background: rgba(127,127,127,0.08); border: 2px solid rgba(127,127,127,0.18); border-radius: var(--r); padding: 16px; margin: 1em 0; }
.card img { width: 100%; max-height: 180px; object-fit: contain; }
.card h3 { margin-top: 0.4em; } .more { font-weight: 700; }
.columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 18px; margin: 1em 0; }
.columns > .col > :first-child { margin-top: 0; }
table { border-collapse: collapse; margin: 1em 0; width: 100%; }
td, th { border: 2px solid rgba(127,127,127,0.3); padding: 8px 12px; text-align: left; }
th { background: var(--accent); color: #fff; }
hr { border: 0; border-top: 3px solid var(--accent); margin: 1.5em 0; opacity: 0.7; }
ul, ol { padding-left: 1.4em; } li { margin: 0.25em 0; }
.made { text-align: center; font-size: 0.8em; opacity: 0.6; padding: 24px 0 8px; }
.free { display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); grid-auto-rows: minmax(${ROW}px, auto); margin: 16px 0; }
.free > * { margin: 0; min-width: 0; }
.free > .pic { position: relative; min-height: 30px; }
.free > .pic > img { position: absolute; left: 0; top: 0; width: 100% !important; height: 100%; object-fit: contain; }
.free > .pic > figcaption { position: absolute; left: 0; right: 0; bottom: 0; margin: 0; padding: 4px 10px; background: rgba(0, 0, 0, 0.5); color: #fff; opacity: 1; border-radius: 0 0 var(--r) var(--r); }
.free > .btnrow { display: flex; align-items: stretch; } .free > .btnrow .btn { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; }
.free > .btnrow[style*="text-align: left"] .btn, .free > .btnrow[style*="text-align: right"] .btn { justify-content: inherit; }
.free > .space { height: auto !important; }
.shape { display: flex; align-items: center; justify-content: center; text-align: center; background: var(--accent); color: #fff; font-weight: 700; padding: 8px; min-height: 60px; aspect-ratio: 1; width: 160px; margin: 1em auto; }
.free > .shape { width: auto; aspect-ratio: auto; margin: 0; }
.shape-round { border-radius: 22px; } .shape-circle { border-radius: 50%; } .shape-pill { border-radius: 999px; } .shape-blob { border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%; }
.shape-triangle { clip-path: polygon(50% 0, 100% 100%, 0 100%); padding-top: 30%; }
.shape-diamond { clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); }
.shape-star { clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
.shape-hexagon { clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%); }
.shape-arrow { clip-path: polygon(0 30%, 60% 30%, 60% 5%, 100% 50%, 60% 95%, 60% 70%, 0 70%); }
.shape-burst { clip-path: polygon(50% 0, 59% 20%, 79% 9%, 76% 31%, 98% 32%, 82% 50%, 98% 68%, 76% 69%, 79% 91%, 59% 80%, 50% 100%, 41% 80%, 21% 91%, 24% 69%, 2% 68%, 18% 50%, 2% 32%, 24% 31%, 21% 9%, 41% 20%); }
.reveal { margin: 1em 0; border: 2px solid var(--accent); border-radius: var(--r); padding: 0 16px; }
.reveal summary { cursor: pointer; font-weight: 700; padding: 12px 0; color: var(--head); }
.reveal summary::after { content: "  (click to see)"; font-weight: 400; font-size: 0.8em; opacity: 0.7; }
.reveal[open] summary::after { content: ""; }
@keyframes cj-fade { from { opacity: 0; } }
@keyframes cj-up { from { opacity: 0; transform: translateY(40px); } }
@keyframes cj-down { from { opacity: 0; transform: translateY(-40px); } }
@keyframes cj-left { from { opacity: 0; transform: translateX(-60px); } }
@keyframes cj-right { from { opacity: 0; transform: translateX(60px); } }
@keyframes cj-pop { 0% { opacity: 0; transform: scale(0.5); } 70% { transform: scale(1.08); } }
@keyframes cj-zoom { from { opacity: 0; transform: scale(1.6); } }
@keyframes cj-bounce { 0% { opacity: 0; transform: translateY(-60px); } 50% { opacity: 1; transform: translateY(0); } 70% { transform: translateY(-18px); } 85% { transform: translateY(0); } 93% { transform: translateY(-6px); } }
@keyframes cj-spin { from { opacity: 0; transform: rotate(-300deg) scale(0.3); } }
@keyframes cj-wobble { 15% { transform: rotate(-8deg); } 30% { transform: rotate(6deg); } 45% { transform: rotate(-4deg); } 60% { transform: rotate(2deg); } 75% { transform: rotate(0); } }
@keyframes cj-wiggle { 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
@keyframes cj-turn { to { transform: rotate(360deg); } }
.a-fade { animation: cj-fade 0.9s ease backwards; } .a-up { animation: cj-up 0.8s ease backwards; } .a-down { animation: cj-down 0.8s ease backwards; }
.a-left { animation: cj-left 0.8s ease backwards; } .a-right { animation: cj-right 0.8s ease backwards; } .a-pop { animation: cj-pop 0.6s ease backwards; }
.a-zoom { animation: cj-zoom 0.7s ease backwards; } .a-bounce { animation: cj-bounce 1.1s ease backwards; } .a-spin { animation: cj-spin 0.9s ease backwards; }
.a-wobble { animation: cj-wobble 1s ease 0.2s; }
.h-grow, .h-lift, .h-shrink, .h-glow { transition: transform 0.2s, box-shadow 0.2s; }
.h-grow:hover { transform: scale(1.07); } .h-shrink:hover { transform: scale(0.93); } .h-lift:hover { transform: translateY(-8px); box-shadow: 0 14px 24px rgba(0, 0, 0, 0.2); }
.h-glow:hover { box-shadow: 0 0 0 4px var(--accent), 0 0 26px var(--accent); } .h-wiggle:hover { animation: cj-wiggle 0.3s ease 2; } .h-spin:hover { animation: cj-turn 0.8s ease; }
@media (prefers-reduced-motion: reduce) { [class*="a-"], [class*="h-"], [class*="h-"]:hover { animation: none !important; transition: none !important; } }
@media (max-width: 600px) { body { font-size: ${Math.max(14, t.fsize - 2)}px; } h1 { font-size: 1.8em; } }
@media (max-width: 640px) {
  .free { display: flex; flex-direction: column; gap: 12px; }
  .free > * { rotate: none !important; }
  .free > .shape { min-height: 120px; aspect-ratio: 1; width: min(100%, 260px); margin: 0 auto; }
  .free > .pic > img { position: static; height: auto; }
  .free > .pic > figcaption { position: static; background: none; color: inherit; opacity: 0.8; }
}
${p.site.css ? '/* My own CSS */\n' + p.site.css : ''}`;
}
function navHTML(p, here, ctx) {
  const t = p.site.theme; if (t.nav === 'none' || p.site.order.length < 2) return '';
  return `  <nav class="site-nav${t.nav === 'tabs' ? ' tabs' : ''}">${t.nav === 'bar' ? `<span class="site-name">${esc(p.site.title)}</span>` : ''}${p.site.order.map(id => `<a href="${esc(hrefOf('#p-' + id, ctx))}"${id === here ? ' class="here"' : ''}>${esc(p['p' + id].name)}</a>`).join('')}</nav>\n`;
}
// the page's own blocks as tidy HTML. With code: true (the Code tab) pictures and links get readable names
// (pictures/star.svg, uploads/abcdef.jpg, #hobbies) that fromHTML() turns back.
export function pageHTML(p, id, ctx = {}) {
  const c = Object.assign({ pages: p.site.order, imgs: p.imgs }, ctx), pg = p['p' + id];
  if (ctx.code) { const R = codeRefs(p); c.href = R.href; c.src = R.src; }
  if (!pg) return '';
  if (pg.layout !== 'free') return pg.blocks.map(b => blockHTML(b, c)).join('\n');
  // a free page: one grid, every block placed on it (rows grow when the words need more room)
  return `<div class="free" style="grid-template-rows: repeat(${bottomOf(pg.blocks) + 2}, minmax(${ROW}px, auto))">\n${pg.blocks.map(b => blockHTML(b, c, '  ')).join('\n')}\n</div>`;
}
// page names as #names for links, unique within the site
export function pageSlugs(p) {
  const out = {}, used = new Set();
  for (const id of p.site.order) {
    let base = (p['p' + id].name || 'page').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'page';
    if (/^p-[a-z]{6}$/.test(base) || base === 'top') base += '-page';
    let s = base, n = 2; while (used.has(s)) s = base + '-' + n++;
    used.add(s); out[id] = s;
  }
  return out;
}
export function codeRefs(p) {
  const slug = pageSlugs(p), back = Object.fromEntries(Object.entries(slug).map(([id, s]) => [s, id]));
  const ext = v => (/^data:image\/(png|jpeg|gif|webp)/.exec(v) || [, 'jpeg'])[1].replace('jpeg', 'jpg');
  return {
    href: h => { const m = /^#p-([a-z]{6})$/.exec(h); return m && slug[m[1]] ? '#' + slug[m[1]] : h; },
    src: s => s.startsWith('lib:') ? 'pictures/' + s.slice(4) + '.svg' : s.startsWith('img:') ? 'uploads/' + s.slice(4) + '.' + ext(p.imgs[s.slice(4)] || '') : s,
    hrefBack: h => { h = String(h || '').trim(); const m = /^#([a-z0-9-]+)$/.exec(h); return m && back[m[1]] ? '#p-' + back[m[1]] : h; },
    srcBack: s => { s = String(s || '').trim(); let m = /^(?:\.\/)?pictures\/([a-z]+)\.svg$/.exec(s); if (m && PICTURES[m[1]]) return 'lib:' + m[1];
      m = /^(?:\.\/)?uploads\/([a-z]{6})\.[a-z]+$/.exec(s); if (m) return 'img:' + m[1];
      for (const k of PICTURE_KEYS) if (s === pictureURL(k)) return 'lib:' + k;
      for (const [k, v] of Object.entries(p.imgs || {})) if (s === v) return 'img:' + k;
      return s; }
  };
}
// the whole site as one HTML document (every page; the CSS shows the one you are on). srcdoc: true when it is shown in an
// <iframe srcdoc>, where #links would otherwise go to the parent page's address
export function siteHTML(p, opts = {}) {
  const ctx = { pages: p.site.order, imgs: p.imgs };
  const home = opts.home && p.site.order.includes(opts.home) ? opts.home : p.site.order[0]; // the page shown when there is no #
  const body = p.site.order.map(id => `<section class="page${id === home ? ' home' : ''}" id="p-${id}">\n${navHTML(p, id, ctx)}${pageHTML(p, id).split('\n').map(l => '  ' + l).join('\n')}\n</section>`).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${opts.srcdoc ? '<base href="about:srcdoc">\n' : ''}<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'">
<title>${esc(p.site.title)}</title>
<style>
${fontFaceCSS(opts.fonts)}${siteCSS(p)}
</style>
</head>
<body>
${body}
${opts.footer === false ? '' : '<p class="made">Made with CodeJump Web Lab</p>\n'}</body>
</html>
`;
}

// ── HTML in: pupils' edited HTML back to blocks ──
const textOf = n => typeof n === 'string' ? n : n.kids.map(textOf).join('');
const innerHTML = n => serialize(n.kids.map(k => cleanNode(k, { inline: true }, 0)).filter(Boolean));
const kidsEl = n => n.kids.filter(k => typeof k !== 'string');
const hasClass = (n, c) => (' ' + (n.attrs.class || '') + ' ').includes(' ' + c + ' ');
const extraCls = (n, ...ours) => cleanClass((n.attrs.class || '').split(/\s+/).filter(c => !ours.includes(c)).join(' '));
function styleFields(n, out) {
  const st = String(n.attrs.style || '');
  const g = (p) => { const m = new RegExp('(?:^|;)\\s*' + p + '\\s*:\\s*([^;]+)', 'i').exec(st); return m ? m[1].trim() : null; };
  const a = g('text-align'); if (['left', 'center', 'right'].includes(a)) out.align = a;
  const c = safeColour(g('color')); if (c) out.color = c;
  const b = safeColour(g('background-color') || g('background')); if (b) out.bg = b;
  const fs = g('font-size'); const k = Object.keys(SIZE).find(k => SIZE[k] === fs); if (k) out.size = k; else { const m = /^(\d+)px$/.exec(fs || ''); if (m) out.fs = +m[1]; }
  const bgx = g('background'); let m;
  if (bgx && (m = /^linear-gradient\((\d+)deg,\s*(#[0-9a-f]{3,6}),\s*(#[0-9a-f]{3,6})\)$/i.exec(bgx))) { const kind = Object.keys(GRAD_CSS).find(k => GRAD_CSS[k] === m[1] + 'deg'); if (kind) { out.bg = m[2].toLowerCase(); out.bg2 = m[3].toLowerCase(); out.grad = kind; } }
  if (bgx && (m = /^radial-gradient\(circle at top,\s*(#[0-9a-f]{3,6}),\s*(#[0-9a-f]{3,6}) 75%\)$/i.exec(bgx))) { out.bg = m[2].toLowerCase(); out.bg2 = m[1].toLowerCase(); out.grad = 'radial'; }
  if ((m = /^(\d+)px$/.exec(g('padding') || ''))) out.pad = +m[1];
  if ((m = /^(\d+)px$/.exec(g('border-radius') || ''))) out.rad = +m[1];
  if ((m = /^(\d+)px (solid|dashed|dotted|double) (#[0-9a-f]{3,6}|currentColor)$/i.exec(g('border') || ''))) { out.bw = +m[1]; if (m[2] !== 'solid') out.bs = m[2]; if (m[3][0] === '#') out.bc = m[3].toLowerCase(); }
  const ff = (g('font-family') || '').replace(/&quot;/g, '"'); if (ff) { const fk = Object.keys(FONTS).find(k => FONTS[k][1] === ff) || Object.keys(FONTS).find(k => ff.replace(/["']/g, '').split(',')[0].trim().toLowerCase() === FONTS[k][0].toLowerCase()); if (fk) out.font = fk; }
  const sh = g('box-shadow'); if (sh) { const sk = Object.keys(SHADOWS).find(k => SHADOWS[k] === sh); if (sk) out.sh = sk; }
  const op = parseFloat(g('opacity')); if (op > 0 && op < 1) out.op = Math.round(op * 100);
  if ((m = /^(-?\d+)deg$/.exec(g('rotate') || ''))) out.rot = +m[1];
  if ((m = /^(\d+)\s*\/\s*(\d+)\s*\/\s*span\s+(\d+)\s*\/\s*span\s+(\d+)$/.exec(g('grid-area') || ''))) { out.pos = { y: +m[1] - 1, x: +m[2] - 1, h: +m[3], w: +m[4] }; const z = parseInt(g('z-index'), 10); if (z > 0) out.z = z; }
  return out;
}
// our own classes on a block: its animations
function fxFields(n, out) { for (const c of (n.attrs.class || '').split(/\s+/)) { if (/^a-/.test(c) && ANIMS[c.slice(2)]) out.anim = c.slice(2); if (/^h-/.test(c) && HOVERS[c.slice(2)]) out.hov = c.slice(2); } return out; }
const OURS = ['pic', 'round', 'btnrow', 'btn', 'more', 'banner', 'card', 'columns', 'space', 'own', 'shape', 'reveal', ...Object.keys(SHAPES).map(k => 'shape-' + k), ...Object.keys(ANIMS).map(k => 'a-' + k), ...Object.keys(HOVERS).map(k => 'h-' + k)];
// an <img src> as it appears in the Code tab is a data: URL; turn it back into our own reference
function srcBack(src) { return /^(lib|img):/.test(src) ? src : ''; }
export function fromHTML(html, p, rnd) {
  const tree = parseTree(String(html || '').slice(0, 200000)), blocks = [], notes = new Set();
  const pages = p ? p.site.order : null, imgs = p ? p.imgs : null;
  if (p) { const R = codeRefs(p); const fix = n => { if (typeof n === 'string') return; if (n.attrs.href != null) n.attrs.href = R.hrefBack(n.attrs.href); if (n.attrs.src != null) n.attrs.src = R.srcBack(n.attrs.src); n.kids.forEach(fix); }; fix(tree); }
  const firstImg = n => { if (n.tag === 'img') return n; for (const k of kidsEl(n)) { const f = firstImg(k); if (f) return f; } return null; };
  const scan = n => { if (typeof n === 'string') return; if (DROP.has(n.tag)) notes.add(n.tag); n.kids.forEach(scan); };
  scan(tree);
  const mk = (t, o, n) => { const b = Object.assign({ id: newId(rnd), t }, o); if (n) { styleFields(n, b); fxFields(n, b); const c = extraCls(n, ...OURS); if (c) b.cls = c; } return b; };
  const toBlock = (n, depth) => {
    if (typeof n === 'string') return n.trim() ? mk('text', { html: esc(n.trim()) }) : null;
    const tag = n.tag;
    if (/^h[1-6]$/.test(tag)) return mk('heading', { text: innerHTML(n), level: Math.min(3, +tag[1]) }, n);
    if (tag === 'p' && hasClass(n, 'btnrow')) { const a = kidsEl(n).find(k => k.tag === 'a') || { attrs: {}, kids: [] }; const b = mk('button', { label: textOf(a).trim().slice(0, 60), link: a.attrs.href || '' }, a); if (n.attrs.style) styleFields(n, b); const c = extraCls(n, ...OURS); if (c) b.cls = c; return b; }
    if (tag === 'a' && hasClass(n, 'btn')) return mk('button', { label: textOf(n).trim().slice(0, 60), link: n.attrs.href || '' }, n);
    if (tag === 'p') { const k = kidsEl(n); if (k.length === 1 && k[0].tag === 'img' && !textOf(n).trim()) return toBlock(k[0], depth); return mk('text', { html: innerHTML(n) }, n); }
    if (tag === 'img') return mk('image', { src: srcBack(n.attrs.src || '', p), alt: n.attrs.alt || '', w: clamp(parseInt((/width:\s*(\d+)%/.exec(n.attrs.style || '') || [])[1], 10), 10, 100, 50) }, null);
    if (tag === 'figure') { const im = firstImg(n), cap = kidsEl(n).find(k => k.tag === 'figcaption'); if (!im) return null; const b = toBlock(im, depth); b.caption = cap ? innerHTML(cap) : ''; if (hasClass(n, 'round')) b.round = true; styleFields(n, b); fxFields(n, b); const c = extraCls(n, ...OURS); if (c) b.cls = c; return b; }
    if (tag === 'div' && hasClass(n, 'shape')) { const k = Object.keys(SHAPES).find(k => hasClass(n, 'shape-' + k)) || 'circle', sp = kidsEl(n).find(k => k.tag === 'span'); return mk('shape', { shape: k, text: sp ? innerHTML(sp) : '' }, n); }
    if (tag === 'details') { const sm = kidsEl(n).find(k => k.tag === 'summary'), rest = n.kids.filter(k => k !== sm); return mk('reveal', { q: sm ? innerHTML(sm) : '', a: serialize(rest.flatMap(k => typeof k === 'string' ? [k] : k.tag === 'p' ? k.kids : [k]).map(k => cleanNode(k, { inline: true }, 0)).filter(Boolean)).trim() }, n); }
    if (tag === 'ul' || tag === 'ol') return mk('list', { items: kidsEl(n).filter(k => k.tag === 'li').map(innerHTML), ordered: tag === 'ol' }, n);
    if (tag === 'blockquote') { const ps = kidsEl(n).filter(k => k.tag === 'p'), cite = kidsEl(n).find(k => k.tag === 'cite'); return mk('quote', { html: ps.length ? ps.map(innerHTML).join('<br>') : innerHTML(n), by: cite ? textOf(cite).trim() : '' }, n); }
    if (tag === 'hr') { const b = mk('divider', {}, n); const m = /border-top:\s*(\d+)px (solid|dashed|dotted|double) (#[0-9a-f]{3,6})?/i.exec(n.attrs.style || ''); if (m) { b.bw = +m[1]; if (m[2] !== 'solid') b.bs = m[2]; if (m[3]) b.color = m[3].toLowerCase(); } else { const c = safeColour((/border-color:\s*([^;]+)/.exec(n.attrs.style || '') || [])[1]); if (c) b.color = c; } return b; }
    if (tag === 'table') {
      const rows = []; let head = false;
      const walk = x => { for (const k of kidsEl(x)) { if (k.tag === 'tr') { const cells = kidsEl(k).filter(c => c.tag === 'td' || c.tag === 'th'); if (!rows.length && cells.length && cells.every(c => c.tag === 'th')) head = true; rows.push(cells.map(innerHTML)); } else walk(k); } };
      walk(n); return mk('table', { rows: rows.length ? rows : [['']], head }, n);
    }
    if ((tag === 'header' || tag === 'section' || tag === 'div') && hasClass(n, 'banner')) { const h = kidsEl(n).find(k => /^h[1-3]$/.test(k.tag)), s = kidsEl(n).find(k => k.tag === 'p'), im = kidsEl(n).find(k => k.tag === 'img'); return mk('banner', { title: h ? innerHTML(h) : '', sub: s ? innerHTML(s) : '', src: im ? srcBack(im.attrs.src || '', p) : '' }, n); }
    if (tag === 'div' && hasClass(n, 'card')) { const h = kidsEl(n).find(k => /^h[1-6]$/.test(k.tag)), s = kidsEl(n).find(k => k.tag === 'p'), im = kidsEl(n).find(k => k.tag === 'img'), a = kidsEl(n).find(k => k.tag === 'a'); return mk('card', { title: h ? innerHTML(h) : '', html: s ? innerHTML(s) : '', src: im ? srcBack(im.attrs.src || '', p) : '', alt: im ? im.attrs.alt || '' : '', link: a ? a.attrs.href || '' : '' }, n); }
    if (tag === 'div' && hasClass(n, 'columns') && !depth) return mk('columns', { cols: kidsEl(n).filter(k => hasClass(k, 'col')).slice(0, 3).map(c => c.kids.map(k => toBlock(k, 1)).filter(Boolean)) }, n);
    if (tag === 'div' && hasClass(n, 'space')) return mk('space', { h: clamp(parseInt((/(?:^|;)\s*height:\s*(\d+)px/.exec(n.attrs.style || '') || [])[1], 10), 8, 300, 40) }, n);
    if (tag === 'div' && hasClass(n, 'own')) return mk('html', { html: serialize(n.kids.map(k => cleanNode(k, { inline: false, pages, imgs }, 0)).filter(Boolean)) }, n);
    if (INLINE.has(tag)) return mk('text', { html: serialize([cleanNode(n, { inline: true }, 0)].filter(Boolean)) });
    if (DROP.has(tag)) return null;
    return mk('html', { html: serialize([cleanNode(n, { inline: false, pages, imgs }, 0)].filter(Boolean)) }); // anything else stays as your own HTML
  };
  // runs of loose inline content become one paragraph
  let run = [];
  const flush = () => { const h = serialize(run.map(k => cleanNode(k, { inline: true }, 0)).filter(Boolean)).trim(); if (plainText(h)) blocks.push(mk('text', { html: h })); run = []; };
  const top = []; for (const n of tree.kids) { if (typeof n !== 'string' && n.tag === 'div' && hasClass(n, 'free')) top.push(...n.kids); else top.push(n); }
  for (const n of top) {
    if (typeof n === 'string' || INLINE.has(n.tag)) { run.push(n); continue; }
    flush(); const b = toBlock(n, 0); if (b) blocks.push(b);
  }
  flush();
  // clean the result exactly as a saved project would be
  const ctx = { pages, imgs: imgs || {}, seen: new Set() };
  return { blocks: blocks.slice(0, LIMITS.blocks).map(b => cleanBlock(b, ctx)).filter(Boolean), removed: [...notes] };
}

// ── Check my site: friendly advice, as a list ──
function lum(hex) { const c = safeColour(hex); if (!c) return 0; const h = c.length === 4 ? c.slice(1).split('').map(x => x + x).join('') : c.slice(1); return [0, 2, 4].map(i => { const v = parseInt(h.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0); }
export function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
export function eachBlock(p, fn) { for (const id of p.site.order) for (const b of p['p' + id].blocks) { fn(b, id); if (b.t === 'columns') b.cols.forEach(c => c.forEach(x => fn(x, id, b))); } }
export function checkSite(p) {
  const out = [], t = p.site.theme, name = id => p['p' + id].name;
  const add = (level, text, page, block) => out.push({ level, text, page: page || null, block: block || null });
  if (contrast(t.text, t.bg) < 4.5) add('warn', 'Your words are hard to read on the background colour. Choose colours that are more different.');
  if (contrast(t.head, t.bg) < 3) add('warn', 'Your headings are hard to see on the background colour.');
  if (t.grad !== 'none' && t.bg2 && contrast(t.text, t.bg2) < 4.5) add('warn', 'Your words are hard to read on the second background colour (the gradient). Choose colours that are more different.');
  if (contrast('#ffffff', t.accent) < 3) add('warn', 'White words on your accent colour (buttons, the menu) are hard to read. Try a darker accent colour.');
  const linksTo = new Set(); let images = 0, noAlt = 0;
  for (const id of p.site.order) {
    const pg = p['p' + id], bl = []; eachBlock({ site: { order: [id] }, ['p' + id]: pg }, b => bl.push(b));
    if (!bl.length) add('warn', `The page “${name(id)}” is empty.`, id);
    const heads = bl.filter(b => b.t === 'heading' || b.t === 'banner');
    if (bl.length && !heads.length) add('tip', `The page “${name(id)}” has no heading. A heading tells visitors what the page is about.`, id);
    let last = 0;
    for (const b of bl) {
      if (b.t === 'heading') { if (last && b.level > last + 1) add('tip', `On “${name(id)}” a level ${b.level} heading comes straight after a level ${last} heading. Don’t skip a level.`, id, b.id); last = b.level; }
      if (b.t === 'banner') last = 1;
      if ((b.t === 'image' || (b.t === 'card' && b.src)) ) { images++; if (!b.alt.trim()) { noAlt++; add('warn', `A picture on “${name(id)}” has no description (alt text). People who can’t see it need one.`, id, b.id); } }
      const links = []; const htmls = [b.text, b.html, b.title, b.sub, b.caption, ...(b.items || []), ...((b.rows || []).flat())].filter(Boolean);
      for (const h of htmls) { const re = /href="([^"]*)"/g; let m; while ((m = re.exec(h))) links.push(m[1]); }
      if (b.link) links.push(b.link);
      for (const l of links) { const m = /^#p-([a-z]{6})$/.exec(l); if (m) linksTo.add(m[1]); }
      if (b.t === 'button' && !b.link) add('tip', `The button “${b.label}” on “${name(id)}” doesn’t go anywhere yet.`, id, b.id);
      if (b.t === 'text' && plainText(b.html).split(' ').length > 160) add('tip', `A paragraph on “${name(id)}” is very long. Shorter paragraphs are easier to read.`, id, b.id);
      if (b.color && contrast(b.color, b.bg || t.bg) < 4.5) add('warn', `Some words on “${name(id)}” are hard to read on their background.`, id, b.id);
    }
  }
  if (p.site.order.length > 1 && t.nav === 'none') for (const id of p.site.order.slice(1)) if (!linksTo.has(id)) add('warn', `Nothing links to the page “${name(id)}”, and the menu is switched off, so visitors can’t find it.`, id);
  const names = p.site.order.map(name); if (new Set(names.map(n => n.toLowerCase())).size < names.length) add('tip', 'Two pages have the same name. Give each page its own name so the menu makes sense.');
  if (!out.some(x => x.level === 'warn')) add('ok', images && !noAlt ? 'Every picture has a description, and the colours are easy to read. Well done!' : 'Nothing needs fixing. Well done!');
  return out;
}

// ── goals: a lesson's checklist that ticks itself ──
// Types: pages (n) · blocks (block type, n, page = index or any) · heading (n) · picture (n, alt: true) · link (to 'page'|'web', n) ·
// theme (changed from the starter's theme) · font (not the default) · css (n rules) · words (n, page) · menu (on) · check (no warnings) ·
// (check strict: no tips either) · text (has: words somewhere on the site; not: true = must NOT be there) ·
// code (n edits made in the Code tab — counted by the app) · cls (a block uses its own class name, styled in the CSS) · named (site title not "My website")
export const GOAL_TYPES = ['pages', 'blocks', 'heading', 'picture', 'link', 'theme', 'font', 'css', 'words', 'menu', 'check', 'code', 'cls', 'named', 'text'];
export function cleanGoals(g) {
  g = g && typeof g === 'object' ? g : {};
  const list = (Array.isArray(g.list) ? g.list : []).slice(0, 12).map(x => {
    if (!x || !GOAL_TYPES.includes(x.type)) return null;
    const o = { type: x.type, text: str(x.text, 160) || x.type };
    if (x.n != null) o.n = clamp(x.n, 0, 999, 1) | 0;
    if (typeof x.block === 'string' && BLOCKS[x.block]) o.block = x.block;
    if (x.to === 'page' || x.to === 'web') o.to = x.to;
    if (x.page != null) o.page = clamp(x.page, 0, 11, 0) | 0;
    if (x.alt) o.alt = true;
    if (x.not) o.not = true;
    if (x.strict) o.strict = true;
    if (typeof x.has === 'string') o.has = str(x.has, 60);
    if (x.base && typeof x.base === 'object') o.base = cleanTheme(x.base);
    return o;
  }).filter(Boolean);
  return { title: str(g.title, 80) || 'Goals', list };
}
export function checkGoals(goals, p, state = {}) {
  const pageIds = p.site.order, all = [], byPage = {};
  eachBlock(p, (b, id) => { all.push(b); (byPage[id] = byPage[id] || []).push(b); });
  const scope = g => g.page != null ? (byPage[pageIds[g.page]] || []) : all;
  const links = (to) => { let n = 0; for (const b of all) { const hs = [b.text, b.html, b.title, b.sub, b.caption, ...(b.items || []), ...((b.rows || []).flat())].filter(Boolean).join(' '); const re = /href="([^"]*)"/g; let m; while ((m = re.exec(hs))) if ((to === 'page') === /^#p-/.test(m[1])) n++; if (b.link && ((to === 'page') === /^#p-/.test(b.link))) n++; } return n; };
  const words = bl => bl.map(b => [b.text, b.html, b.title, b.sub, b.caption, ...(b.items || [])].filter(Boolean).map(plainText).join(' ')).join(' ').split(/\s+/).filter(Boolean).length;
  return (goals ? goals.list : []).map(g => {
    let ok = false; const n = g.n == null ? 1 : g.n;
    switch (g.type) {
      case 'pages': ok = pageIds.length >= n; break;
      case 'blocks': ok = scope(g).filter(b => !g.block || b.t === g.block).length >= n; break;
      case 'heading': ok = scope(g).filter(b => b.t === 'heading' || b.t === 'banner').length >= n; break;
      case 'picture': ok = scope(g).filter(b => (b.t === 'image' || (b.t === 'card' && b.src) || (b.t === 'banner' && b.src)) && (!g.alt || b.t === 'banner' || (b.alt || '').trim().length >= 3)).length >= n; break;
      case 'link': ok = links(g.to || 'page') >= n; break;
      case 'theme': { const t = p.site.theme, b = g.base || DEFAULT_THEME; ok = ['bg', 'text', 'head', 'accent', 'font'].some(k => t[k] !== b[k]); break; }
      case 'font': ok = p.site.theme.font !== (g.base ? g.base.font : DEFAULT_THEME.font); break;
      case 'css': ok = (p.site.css.match(/\{/g) || []).length >= n; break;
      case 'words': ok = words(scope(g)) >= n; break;
      case 'menu': ok = p.site.theme.nav !== 'none' && pageIds.length > 1; break;
      case 'check': ok = !checkSite(p).some(x => x.level === 'warn' || (g.strict && x.level === 'tip')); break;
      case 'code': ok = (state.codeEdits || 0) >= n; break;
      case 'cls': ok = all.some(b => b.cls && b.cls.split(' ').some(c => new RegExp('\\.' + c + '\\b').test(p.site.css))); break;
      case 'named': ok = !!p.site.title.trim() && p.site.title !== 'My website'; break;
      case 'text': ok = !!g.has && all.some(b => [b.text, b.html, b.title, b.sub, b.caption, b.label, ...(b.items || []), ...((b.rows || []).flat())].filter(Boolean).some(h => plainText(h).toLowerCase().includes(g.has.toLowerCase()))); if (g.has && g.not) ok = !ok; break;
    }
    return { text: g.text, ok };
  });
}
