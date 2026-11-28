const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 640, height: 400 } });
  p.on('pageerror', (e) => console.log('PAGEERR', e.message, (e.stack || '').split('\n').slice(1, 3).join(' | '))); p.on('console', (m) => { if (m.type() === 'error') console.log('ERR', m.text().slice(0, 200)); });
  await p.goto(process.argv[2] + (process.argv[2].includes('?') ? '&' : '?') + 'nomenu', { waitUntil: 'commit' }); await p.waitForTimeout(+(process.argv[3] || 30000)); console.log('scene', await p.evaluate(() => !!window.__scene && !document.getElementById('loader')));
  if (process.argv[4]) console.log(JSON.stringify(await p.evaluate(process.argv[4]))); await b.close(); })();
