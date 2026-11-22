const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 640, height: 400 } });
  await p.goto('http://localhost:8123/', { waitUntil: 'commit', timeout: 400000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 400000, polling: 2000 });
  console.log(JSON.stringify(await p.evaluate(() => { const by = {}; let n = 0, tagged = 0; window.__scene.scene.traverse((o) => { let q = o, inD = false; while (q) { if (q.name === "city_district") inD = true; q = q.parent; } if (o.isMesh && inD) { n++; if (o.name.includes('@')) tagged++; const k = o.name.split('@')[0].replace(/district_f\d+/, 'district_wall'); by[k] = (by[k] || 0) + Math.round((o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3); } }); return { n, tagged, by }; })));
  await b.close(); })();
