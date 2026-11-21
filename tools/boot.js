// Boot script for the built game (inlined into dist/*.html by tools/build_web.mjs). Downloads the CORE texture packs
// (the old town, where you start) with a progress bar, then starts the bundled game; the DISTRICT packs keep
// downloading in the background. Every 'assets/textures/...' request (image src, three.js texture loads, fetch) is
// served from the packs as a blob URL; a request for a texture whose pack hasn't arrived yet simply waits for it.
// window.__deferredWaiting() tells the game's loading screen how many loads are waiting on background packs, so it
// doesn't hold the start for them.
window.__boot = async function (bundle) {
  const el = document.getElementById('loader'), bar = el && el.querySelector('.bar i'), txt = el && el.querySelector('.status');
  const say = (s, p) => { if (txt) txt.textContent = s; if (bar && p !== undefined) bar.style.width = `${Math.round(p * 100)}%`; };
  try {
    const idx = await (await fetch('packs/packs.json')).json();
    const core = new Set(idx.core || idx.packs.map((_, i) => i));
    const coreTotal = idx.packs.reduce((a, b, i) => a + (core.has(i) ? b : 0), 0); let got = 0;
    const blobs = {}, ready = {}, waiting = { n: 0 };
    const byPack = {}; for (const [name, v] of Object.entries(idx.files)) (byPack[v[0]] = byPack[v[0]] || []).push([name, v]);
    const loadPack = (i, onBytes) => ready[i] || (ready[i] = (async () => {
      const r = await fetch(`packs/pack${i}.wasm`); const reader = r.body.getReader(); const out = new Uint8Array(idx.packs[i]); let o = 0;
      for (;;) { const { done, value } = await reader.read(); if (done) break; out.set(value, o); o += value.length; if (onBytes) onBytes(value.length); }
      for (const [name, [, off, len, mime]] of byPack[i] || []) blobs[name] = URL.createObjectURL(new Blob([out.subarray(off, off + len)], { type: mime }));
    })());
    say('Downloading textures… 0 MB', 0);
    await Promise.all([...core].map((i) => loadPack(i, (n) => { got += n; say(`Downloading textures… ${(got / 1e6).toFixed(0)} / ${(coreTotal / 1e6).toFixed(0)} MB`, (got / coreTotal) * 0.6); })));
    const base = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');
    const key = (u) => { let k = u.startsWith(base) ? u.slice(base.length) : u; return k.replace(/^\.\//, ''); };
    // returns the blob url, or a promise of it when the texture's pack is still downloading
    const lookup = (u) => { if (typeof u !== 'string') return u; const k = key(u); if (blobs[k]) return blobs[k]; const f = idx.files[k]; if (!f) return u; return loadPack(f[0]).then(() => blobs[k] || u); };
    const d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    Object.defineProperty(HTMLImageElement.prototype, 'src', { configurable: true, get() { return d.get.call(this); }, set(v) {
      const m = lookup(v); if (typeof m === 'string') { d.set.call(this, m); return; }
      waiting.n++; m.then((url) => { waiting.n--; d.set.call(this, url); }); } });
    const f0 = window.fetch.bind(window); window.fetch = async (u, o) => { const m = lookup(u); return f0(typeof m === 'string' ? m : await m, o); };
    window.__assetURL = (u) => { const m = lookup(u); return typeof m === 'string' ? m : u; };
    window.__deferredWaiting = () => waiting.n;
    // background: fetch the district packs one at a time once the game is up
    setTimeout(async () => { for (let i = 0; i < idx.packs.length; i++) if (!core.has(i)) { try { await loadPack(i); } catch (e) { /* retried on demand */ } } }, 1500);
  } catch (e) { console.warn('texture packs unavailable, loading files directly', e); }
  say('Building the world…', 0.6);
  await import(bundle);
};
