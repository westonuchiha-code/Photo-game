// errands: every kind taken and finished through the real talk window; notes; the map marks; memory; the foot buttons
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const ctx = await b.newContext({ viewport: { width: 412, height: 800 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message + (e.stack || '').split('\n')[1]));
  const ev = (f, a) => p.evaluate(f, a);
  await p.goto(process.argv[2] + '?area=west', { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(1000); await p.mouse.click(200, 300);
  const out = await ev(() => { window.__loadingHold = true; const S = window.__scene, T = S.talk, w = T.wallet; T.reset(); const R = {};
    const W = S.worldPeople(); R.world = { n: W.length, keepers: W.filter((q) => q.sells).length, far: W.filter((q) => q.area !== 'west').map((q) => q.name) };
    // the keeper names the errands use must be the names the keepers really have (sex decided the same way)
    { const L = S.interiors.list.filter((e) => e.type === 'shop'); let ok = 0, n = 0; for (const e of L.slice(0, 12)) { const r = e.inner; S.walk.position.set((r.minX + r.maxX) / 2, 0, (r.minZ + r.maxZ) / 2); for (let f = 0; f < 40; f++) S.interiors.update(S.walk.position, 1 / 60, true); if (e.npc) { n++; if (W.some((q) => q.id === e.npc.who.id && q.name === e.npc.who.name)) ok++; } } R.names = [ok, n]; }
    const btn = (t) => [...document.querySelectorAll('#talk .topics button')].find((x) => x.textContent.startsWith(t)), topics = () => [...document.querySelectorAll('#talk .topics button')].map((x) => x.textContent), last = (k = 3) => [...document.querySelectorAll('#talk .log p')].slice(-k).map((x) => x.textContent);
    const mk = (id, temper, extra = {}) => ({ id, name: 'Giver ' + temper, sex: 'f', temper, job: 'clerk', title: 'clerk', likes: 'food', ...extra });
    // find givers that produce each kind
    const kinds = {}; for (let h = 1; h < 400 && Object.keys(kinds).length < 3; h++) { const who = mk('p:west:s' + h, ['warm', 'gruff', 'gossip', 'nervous', 'proud', 'dreamy'][h % 6], { h }); T.open(who, 'west'); btn('Any work?').click(); const j = w.jobs[who.id]; if (!kinds[j.type]) kinds[j.type] = { who, j, offer: last(3) }; else { delete w.jobs[who.id]; if (j.type === 'deliver') delete w.items['Parcel for ' + j.target.name]; } T.close(); }
    R.offers = Object.fromEntries(Object.entries(kinds).map(([k, v]) => [k, v.offer]));
    const m0 = w.money;
    // fetch: no item -> reminder; with item -> hand over
    { const { who, j } = kinds.fetch; T.open(who, 'west'); const t0 = topics(); btn('About that errand').click(); const rem = last(1); T.close(); w.items[j.item] = 1; T.open(who, 'west'); btn('Here is the').click(); R.fetch = { topicsBefore: t0.filter((x) => /errand|Here/.test(x)), rem, done: last(3), state: j.state, itemLeft: w.items[j.item] || 0, after: topics().filter((x) => /work/.test(x)) }; T.close(); }
    // deliver: at the target
    { const { who, j } = kinds.deliver; const target = mk(j.target.id, 'nervous', { name: j.target.name, h: 9 }); R.parcel = Object.keys(w.items).filter((n) => n.startsWith('Parcel')); T.open(target, j.target.area); const t = topics().filter((x) => x.startsWith('A parcel')); btn('A parcel from').click(); R.deliver = { topic: t, said: last(3), state: j.state, parcelLeft: Object.keys(w.items).filter((n) => n.startsWith('Parcel')).length, targetArea: j.target.area }; T.close(); }
    // ask: at the target, then back
    { const { who, j } = kinds.ask; const target = mk(j.target.id, 'gossip', { name: j.target.name, h: 4 }); T.open(target, 'west'); const lab = topics().find((x) => x.includes('asks about')); btn(lab).click(); const said = last(2); T.close(); T.open(who, 'west'); const lab2 = topics().find((x) => x.startsWith('What ')); btn(lab2).click(); R.ask = { lab, said, lab2, done: last(3), state: j.state }; T.close(); }
    R.money = [m0, w.money]; R.rep = w.rep; R.deeds = w.deeds;
    // memory: the giver's greeting (second meeting after), and what others have heard
    { const { who } = kinds.fetch; T.open(who, 'west'); R.greet = [...document.querySelectorAll('#talk .log p')][0].textContent; T.close(); const other = mk('p:west:999', 'warm', { h: 77 }); T.open(other, 'west'); const heard = []; for (let i = 0; i < 6; i++) { btn('Latest rumours').click(); heard.push(last(1)[0]); } R.heard = heard.filter((x) => /Giver/.test(x)); R.noWork = (btn('Any work?') ? 'has' : 'none'); T.close(); }
    // notes and the map marks
    { const who = mk('p:west:s7777', 'proud', { h: 7777 }); T.open(who, 'west'); btn('Any work?').click(); T.close(); T.openBag(); R.notes = [...document.querySelectorAll('#talk .log p')].map((x) => x.textContent); T.close(); R.toSee = T.errands.toSee('west'); w.items['Town map'] = 1; S.openMap(); }
    return R; });
  console.log(JSON.stringify(out, null, 1).slice(0, 6000)); await p.waitForTimeout(200); await p.screenshot({ path: 'cm/e_map.jpg', type: 'jpeg', quality: 90 });
  // the foot buttons
  console.log('pad', JSON.stringify(await ev(() => { const S = window.__scene, w = S.talk.wallet; S.townMap.close(); w.items['Flashlight'] = 1; S.talk.sync(); S.hands.torch(false); const B = [...S.footPad.children]; S.talk.openBag(); S.talk.close(); const vis0 = B.map((x) => !x.hidden); S.quick('torch'); const t1 = S.hands.torchOn; B[0].click(); const t2 = S.hands.torchOn; B[1].click(); const r1 = S.sound.radioOn; B[1].click(); B[2].click(); const m = S.townMap.active; S.townMap.close(); delete w.items['Flashlight']; S.quick('radio'); S.sound.radio(false); return { shown: getComputedStyle(S.footPad).display, vis0, t1, t2, r1, map: m }; })));
  await ev(() => { const S = window.__scene; S.talk.wallet.items['Flashlight'] = 1; S.quick('torch'); S.quick('torch'); const who = S.worldPeople().find((q) => q.sells); S.walk.yaw = 0; S.walk.apply(); S.renderer.render(S.scene, S.camera); }); await p.screenshot({ path: 'cm/e_pad.jpg', type: 'jpeg', quality: 88 });
  console.log('errors', errs.length, errs.slice(0, 5).join(' || ')); await b.close(); })();
