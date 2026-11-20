// Boot script for the built game (inlined into dist/*.html by tools/build_web.mjs). Downloads the texture packs with
// a progress bar, then serves every 'assets/textures/...' request (image src, three.js texture loads, fetch) from
// them as blob URLs, then starts the bundled game. The game code itself is unchanged.
window.__boot = async function (bundle) {
  const el = document.getElementById('loader'), bar = el && el.querySelector('.bar i'), txt = el && el.querySelector('.status');
  const say = (s, p) => { if (txt) txt.textContent = s; if (bar && p !== undefined) bar.style.width = `${Math.round(p * 100)}%`; };
  try {
    const idx = await (await fetch('packs/packs.json')).json();
    const total = idx.packs.reduce((a, b) => a + b, 0); let got = 0;
    say('Downloading textures… 0 MB', 0);
    const bufs = await Promise.all(idx.packs.map(async (size, i) => {
      const r = await fetch(`packs/pack${i}.wasm`); const reader = r.body.getReader(); const out = new Uint8Array(size); let o = 0;
      for (;;) { const { done, value } = await reader.read(); if (done) break; out.set(value, o); o += value.length; got += value.length; say(`Downloading textures… ${(got / 1e6).toFixed(0)} / ${(total / 1e6).toFixed(0)} MB`, (got / total) * 0.6); }
      return out;
    }));
    const urls = {};
    for (const [name, [p, off, len, mime]] of Object.entries(idx.files)) urls[name] = URL.createObjectURL(new Blob([bufs[p].subarray(off, off + len)], { type: mime }));
    const base = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');
    const map = (u) => { if (typeof u !== 'string') return u; let k = u.startsWith(base) ? u.slice(base.length) : u; k = k.replace(/^\.\//, ''); return urls[k] || u; };
    const d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    Object.defineProperty(HTMLImageElement.prototype, 'src', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, map(v)); } });
    const f0 = window.fetch.bind(window); window.fetch = (u, o) => f0(map(u), o);
    window.__assetURL = map;
  } catch (e) { console.warn('texture packs unavailable, loading files directly', e); }
  say('Building the world…', 0.6);
  await import(bundle);
};
