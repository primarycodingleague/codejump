// CodeJump's offline helper — used ONLY on iPads (build-and-play.html registers it there and nowhere else).
// The page downloads every file listed in offline.json into a cache called "cj-app-<version>" and, when it has them all,
// writes that name into the "cj-meta" cache under "current". This worker then answers requests from that cache, so
// CodeJump opens and runs with no internet (or on a school network that blocks it). Anything not in the cache goes to
// the network as normal (the cloud, share links …). A page keeps the version it opened with, so an update that lands
// while CodeJump is open never mixes old and new files; it is used the next time CodeJump opens.
const META = 'cj-meta';
let current = null;           // the cache name in use for new page loads
const pinned = new Map();     // page (client id) → the cache name it opened with

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('message', e => { if (e.data === 'cj-switch') current = null; });

async function currentName() {
  if (current === null) {
    try { const r = await (await caches.open(META)).match('current'); current = r ? await r.text() : ''; } catch (err) { current = ''; }
  }
  return current;
}
function isAppPage(url) {
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return false;
  const rest = url.pathname.slice(scope.pathname.length);
  return rest === '' || rest === 'index.html' || rest === 'build-and-play.html';
}
// iPad video/audio ask for byte ranges; answer them from the stored copy
async function ranged(req, res) {
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  if (!m) return res;
  const buf = await res.arrayBuffer(), n = buf.byteLength;
  let a = m[1] === '' ? Math.max(0, n - Number(m[2])) : Number(m[1]);
  let b = m[1] !== '' && m[2] !== '' ? Math.min(Number(m[2]), n - 1) : n - 1;
  if (a >= n || a > b) return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + n } });
  return new Response(buf.slice(a, b + 1), { status: 206, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream',
    'Content-Range': `bytes ${a}-${b}/${n}`, 'Content-Length': String(b - a + 1), 'Accept-Ranges': 'bytes' } });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin && (/\/(sw\.js|offline\.json)$/.test(url.pathname) || url.searchParams.has('cjv'))) return; // always fresh (cjv = an update download)
  const nav = req.mode === 'navigate';
  if (nav && !isAppPage(url)) return;
  e.respondWith((async () => {
    let name = (!nav && pinned.get(e.clientId)) || await currentName();
    if (name) {
      try {
        const cache = await caches.open(name);
        const key = nav ? new URL('index.html', self.registration.scope).href : req.url;
        const hit = await cache.match(key, { ignoreSearch: nav || url.origin === self.location.origin });
        if (hit) {
          if (nav && e.resultingClientId) { pinned.set(e.resultingClientId, name); if (pinned.size > 50) pinned.delete(pinned.keys().next().value); }
          return req.headers.has('range') ? ranged(req, hit) : hit;
        }
      } catch (err) { /* fall through to the network */ }
    }
    return fetch(req);
  })());
});
