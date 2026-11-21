// Boot script for the built game (inlined into dist/*.html by tools/build_web.mjs).
//  - Starts the bundled game straight away: the world is built while the texture packs download.
//  - Every 'assets/textures/...' request (image src, three.js texture loads, fetch) is served from the packs as a
//    blob URL; a request for a texture whose pack hasn't arrived yet simply waits for it.
//  - CORE packs (the old town, where you start) download first, all at once; DISTRICT packs follow in the background
//    once the game is up. window.__deferredWaiting() tells the loading screen how many loads wait on background packs,
//    so it doesn't hold the start for them; window.__packProgress = { got, total } is the core download in bytes.
//  - Packs are kept in the browser's Cache Storage under their content hash: a repeat visit loads them from disk and
//    only downloads packs that changed (stale ones are dropped).
window.__boot = async function (bundle) {
  const el = document.getElementById('loader'), bar = el && el.querySelector('.bar i'), txt = el && el.querySelector('.status');
  const say = (s, p) => { if (txt) txt.textContent = s; if (bar && p !== undefined) bar.style.width = `${Math.round(p * 100)}%`; };
  try {
    const idx = await (await fetch('packs/packs.json', { cache: 'no-cache' })).json();
    const core = new Set(idx.core || idx.packs.map((_, i) => i));
    const prog = window.__packProgress = { got: 0, total: idx.packs.reduce((a, b, i) => a + (core.has(i) ? b : 0), 0), cached: 0 };
    const blobs = {}, ready = {}, waiting = { n: 0 };
    const byPack = {}; for (const [name, v] of Object.entries(idx.files)) (byPack[v[0]] = byPack[v[0]] || []).push([name, v]);
    // browser cache (may be unavailable: private windows, sandboxed frames) -> just download then
    const keyOf = (i) => new URL(`packs/pack${i}.wasm?h=${idx.hashes ? idx.hashes[i] : idx.packs[i]}`, location.href).href;
    let cache = null; try { cache = await caches.open('photo-town-packs'); } catch (e) { cache = null; }
    if (cache) { try { const want = new Set(idx.packs.map((_, i) => keyOf(i))); for (const r of await cache.keys()) if (!want.has(r.url)) cache.delete(r); } catch (e) { /* ignore */ } }
    // the downloads run in a worker when the page allows one: the main thread is busy building the world meanwhile,
    // and a fetch read from a busy thread stalls (the network stops once its small buffer is full)
    let worker = null; const wq = {};
    try {
      const src = `onmessage = async (e) => { const { i, url, len } = e.data; try { const r = await fetch(url); postMessage({ i, bytes: 0 }); const rd = r.body.getReader(); const out = new Uint8Array(len); let o = 0, last = 0;
        for (;;) { const { done, value } = await rd.read(); if (done) break; out.set(value, o); o += value.length; if (o - last > 262144) { postMessage({ i, bytes: o - last }); last = o; } }
        postMessage({ i, bytes: o - last, buf: out.buffer }, [out.buffer]); } catch (err) { postMessage({ i, error: String(err) }); } };`;
      worker = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
      worker.onerror = () => { worker = null; for (const k in wq) wq[k].rej(new Error('worker unavailable')); };   // (e.g. blocked by the host)
      worker.onmessage = (e) => { const q = wq[e.data.i]; if (q) q.seen = true; if (!q) return; if (e.data.bytes && q.onBytes) q.onBytes(e.data.bytes); if (e.data.buf) q.res(new Uint8Array(e.data.buf)); else if (e.data.error) q.rej(new Error(e.data.error)); };
    } catch (e) { worker = null; }
    const download = async (i, onBytes) => {
      if (worker) { try { return await new Promise((res, rej) => { const q = wq[i] = { res, rej, onBytes, seen: false }; worker.postMessage({ i, url: new URL(`packs/pack${i}.wasm`, location.href).href, len: idx.packs[i] });
        setTimeout(() => { if (!q.seen) rej(new Error('worker silent')); }, 10000); }); } catch (e) { delete wq[i]; } }   // no word from the worker in 10 s: download here instead
      const r = await fetch(`packs/pack${i}.wasm`); const reader = r.body.getReader(); const out = new Uint8Array(idx.packs[i]); let o = 0;
      for (;;) { const { done, value } = await reader.read(); if (done) break; out.set(value, o); o += value.length; if (onBytes) onBytes(value.length); }
      return out;
    };
    const loadPack = (i, onBytes) => ready[i] || (ready[i] = (async () => {
      let out = null;
      if (cache) { try { const hit = await cache.match(keyOf(i)); if (hit) { out = new Uint8Array(await hit.arrayBuffer()); if (out.length !== idx.packs[i]) out = null; else { if (onBytes) onBytes(out.length); prog.cached += out.length; } } } catch (e) { out = null; } }
      if (!out) {
        out = await download(i, onBytes);
        if (cache) cache.put(keyOf(i), new Response(out.slice(), { headers: { 'content-type': 'application/octet-stream' } })).catch(() => {});
      }
      for (const [name, [, off, len, mime]] of byPack[i] || []) blobs[name] = URL.createObjectURL(new Blob([out.subarray(off, off + len)], { type: mime }));
    })());
    const coreDone = Promise.all([...core].map((i) => loadPack(i, (n) => { prog.got += n; })));
    const base = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');
    const key = (u) => { let k = u.startsWith(base) ? u.slice(base.length) : u; return k.replace(/^\.\//, ''); };
    // returns the blob url, or a promise of it when the texture's pack is still downloading
    const lookup = (u) => { if (typeof u !== 'string') return u; const k = key(u); if (blobs[k]) return blobs[k]; const f = idx.files[k]; if (!f) return u; return [loadPack(f[0]).then(() => blobs[k] || u), core.has(f[0])]; };
    const d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    Object.defineProperty(HTMLImageElement.prototype, 'src', { configurable: true, get() { return d.get.call(this); }, set(v) {
      const m = lookup(v); if (typeof m === 'string') { d.set.call(this, m); return; }
      const [pr, isCore] = m; if (!isCore) waiting.n++; pr.then((url) => { if (!isCore) waiting.n--; d.set.call(this, url); }); } });
    const f0 = window.fetch.bind(window); window.fetch = async (u, o) => { const m = lookup(u); return f0(typeof m === 'string' ? m : await m[0], o); };
    window.__assetURL = (u) => { const m = lookup(u); return typeof m === 'string' ? m : u; };
    window.__deferredWaiting = () => waiting.n;
    window.__coreReady = coreDone;
    // background: the district packs, one at a time, once the core is in and the game has had a moment to start
    coreDone.then(() => setTimeout(async () => { for (let i = 0; i < idx.packs.length; i++) if (!core.has(i)) { try { await loadPack(i); } catch (e) { /* retried on demand */ } } }, 1500));
  } catch (e) { console.warn('texture packs unavailable, loading files directly', e); }
  say('Building the world…', 0.02);
  await import(bundle);
};
