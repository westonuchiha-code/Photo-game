const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1100, height: 1100 } });
  for (const s of ['m', 'f']) { await p.goto('http://localhost:8123/bodytest.html?tpl=' + s); await p.waitForFunction(() => window.done); const d = await p.evaluate(() => document.querySelector('canvas').toDataURL('image/png')); fs.writeFileSync(`/home/user/Photo-game/docs/skin_template_${s}.png`, Buffer.from(d.split(',')[1], 'base64')); }
  await b.close(); })();
