// stats standing at given spots: node phspot.js <url> '[[name,x,z,yaw],...]'
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('PAGEERR', e.message));
  await p.goto(process.argv[2], { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(1500);
  for (const [n, x, z, yaw] of JSON.parse(process.argv[3])) { const st = await p.evaluate(async ([x, z, yaw]) => { const S = window.__scene; S.walk.position.set(x, 0, z); S.walk.yaw = yaw; S.walk.pitch = 0; S.walk.apply(); await new Promise((r) => setTimeout(r, 2500)); return S.stats(); }, [x, z, yaw]); console.log(n, JSON.stringify({ calls: st.calls, tris: st.tris, tex: st.tex })); }
  await b.close(); })();
