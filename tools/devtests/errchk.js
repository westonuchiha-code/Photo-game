const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 640, height: 400 } });
  p.on('pageerror', (e) => console.log('PAGEERR', e.message, (e.stack || '').split('\n').slice(1, 4).join(' | ')));
  p.on('console', (m) => { const t = m.text(); if (m.type() === 'error' || /loop houses|interiors:|T district/.test(t)) console.log(m.type(), t.slice(0, 300)); });
  p.on('requestfailed', (r) => console.log('FAIL', r.url().slice(-60)));
  await p.goto('http://localhost:8123/', { waitUntil: 'commit' }); await p.waitForTimeout(100000); console.log('scene', await p.evaluate(() => !!window.__scene)); await b.close(); })();
