const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 900, height: 700 } }); p.on('pageerror', (e) => console.log('ERR', e.message, (e.stack || '').split('\n')[1]));
  for (const a of process.argv.slice(2)) { const [name, q] = a.split('='); await p.goto('http://localhost:8123/bodytest.html?' + (a.slice(name.length + 1))); await p.waitForFunction(() => window.done, null, { timeout: 60000 }).catch(() => console.log('timeout')); await p.waitForTimeout(300); await p.screenshot({ path: `bt/${name}.jpg`, type: 'jpeg', quality: 90 }); }
  await b.close(); })();
