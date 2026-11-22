// node ldt2.js port mbps runs : load the built game, throttled; print phase times; repeat in the same browser profile
const { chromium } = require('playwright');
(async () => { const [port, mbps, runs] = process.argv.slice(2).map(Number); const b = await chromium.launch(); const ctx = await b.newContext();
  for (let k = 0; k < (runs || 1); k++) {
    const p = await ctx.newPage(); const t0 = Date.now(); const marks = [];
    p.on('console', (m) => { const t = m.text(); if (/^T (downloads|textures-uploaded|shaders|oldtown)/.test(t)) marks.push(((Date.now() - t0) / 1000).toFixed(1) + 's ' + t.split(' ')[1]); });
    const c = await ctx.newCDPSession(p); await c.send('Network.enable'); await c.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: mbps * 125000, uploadThroughput: 1e6 });
    await p.goto(`http://localhost:${port}/index.html`, { waitUntil: 'commit', timeout: 900000 });
    await p.waitForFunction(() => !document.getElementById('loader') && window.__scene, null, { timeout: 900000, polling: 250 });
    const cached = await p.evaluate(() => window.__packProgress ? Math.round(window.__packProgress.cached / 1e6) : 'n/a');
    console.log(`port ${port} run ${k + 1}: playable at ${((Date.now() - t0) / 1000).toFixed(1)}s  (from browser cache: ${cached} MB)  ${marks.join(' | ')}`);
    await p.close();
  }
  await b.close(); })();
