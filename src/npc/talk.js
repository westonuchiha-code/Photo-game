// Talking to people: a panel with what they say, the topics you can ask about, and (for people who run a shop) barter.
// Modelled on the old role-playing games where everyone in a town knows the same handful of subjects but answers in
// their own way. The words come from lines.js; this file decides who a person is, what they answer, and what things cost.
//   whoIs(areaId, seed, sex)             -> a pedestrian's identity (always the same for the same seed)
//   keeperOf(areaId, shopIndex, seed, sex) -> a shopkeeper's identity
//   character(id)                        -> a written character (lines.js CHARACTERS)
//   makeTalk({ onOpen, onClose })        -> { open(who, areaId), close(), active, wallet }
import { TEMPERS, NAMES, JOBS, VOICE, RUMOURS, AREAS, TOPIC_INDEX, SHOP_KINDS, ITEM, CHARACTERS } from './lines.js';

const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const pick = (arr, h, salt = 0) => arr[(h + Math.imul(salt + 1, 2654435761) >>> 0) % arr.length];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function whoIs(areaId, seed, sex = 'm') { const h = hash(areaId + ':' + seed); const job = pick(JOBS, h, 3);
  return { id: 'p:' + areaId + ':' + seed, name: pick(NAMES[sex] || NAMES.m, h, 1) + ' ' + pick(NAMES.last, h, 2), sex, temper: pick(TEMPERS, h, 4), job, title: job, h }; }
export function keeperOf(areaId, shopIndex, seed, sex = 'm') { const w = whoIs(areaId, 'k' + seed, sex), k = SHOP_KINDS[shopIndex]; return { ...w, id: 'k:' + areaId + ':' + seed, job: k.title, title: k.title, shop: shopIndex }; }
export function character(id) { const c = CHARACTERS[id], h = hash('c:' + id); return { id: 'c:' + id, h, sex: 'm', job: c.title, ...c }; }

// ---- money and things carried (kept between visits where the browser allows it)
const KEY = 'phototown.wallet.v1';
function loadWallet() { try { const w = JSON.parse(localStorage.getItem(KEY)); if (w && typeof w.money === 'number' && w.items) return w; } catch (e) { /* no storage: start fresh each time */ } return { money: 60, items: { 'Pocket radio': 1 } }; }
function saveWallet(w) { try { localStorage.setItem(KEY, JSON.stringify(w)); } catch (e) { /* ignore */ } }

// what a keeper asks for something, and what they give for it
export function buyPrice(who, name) { return Math.max(1, Math.round(ITEM.get(name).price * VOICE[who.temper].price)); }
export function sellPrice(who, areaId, name) { const it = ITEM.get(name), k = SHOP_KINDS[who.shop]; if (!it || !k) return 0; const any = k.buys.includes('any'); if (!any && !k.buys.includes(it.cat)) return 0;
  return Math.max(1, Math.floor(it.price * (any ? 0.35 : 0.5) * (AREAS[areaId] && AREAS[areaId].wants.includes(it.cat) ? 1.5 : 1) / VOICE[who.temper].price)); }

const CSS = `
#talk { position: fixed; left: 0; right: 0; bottom: 0; height: 58%; max-height: 520px; z-index: 30; display: flex; flex-direction: column; background: linear-gradient(#1b1610f2, #100d09f7); border-top: 2px solid #8a6a3a; color: #d9cdb2; font: 16px/1.42 Georgia, 'Times New Roman', serif; padding-bottom: env(safe-area-inset-bottom, 0px); touch-action: manipulation; -webkit-user-select: none; user-select: none; }
#talk[hidden], #talk .topics[hidden], #talk .log[hidden] { display: none; }
#talk .hd { display: flex; align-items: baseline; gap: 8px; padding: 9px 14px 7px; border-bottom: 1px solid #5a4526; }
#talk .hd b { color: #e9c77a; font-size: 18px; } #talk .hd .tt { color: #9c8f76; font-style: italic; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } #talk .hd .cash { color: #e9c77a; font: 600 15px system-ui, sans-serif; }
#talk .log { flex: 1; overflow-y: auto; padding: 8px 14px; -webkit-overflow-scrolling: touch; }
#talk .log p { margin: 0 0 9px; } #talk .log .q { color: #e9c77a; margin-bottom: 2px; font-variant: small-caps; letter-spacing: .5px; } #talk .log .sys { color: #9c8f76; font-style: italic; }
#talk a { color: #7fa0e6; text-decoration: none; border-bottom: 1px dotted #7fa0e688; }
#talk .topics { display: flex; flex-wrap: wrap; gap: 6px; padding: 7px 10px; border-top: 1px solid #5a4526; max-height: 34%; overflow-y: auto; }
#talk button { font: 15px Georgia, serif; color: #7fa0e6; background: #241d14; border: 1px solid #5a4526; border-radius: 8px; padding: 8px 11px; }
#talk button:active { background: #3a2e1c; }
#talk .ft { display: flex; gap: 8px; padding: 7px 10px 9px; border-top: 1px solid #5a4526; } #talk .ft button { flex: 1; color: #e9c77a; font-weight: 600; } #talk .ft .trade[hidden] { display: none; }
#talk .barter { flex: 1; display: flex; gap: 8px; padding: 8px 10px; overflow: hidden; } #talk .barter[hidden] { display: none; }
#talk .barter .col { flex: 1; display: flex; flex-direction: column; min-width: 0; } #talk .barter h4 { margin: 0 0 5px; font: 600 13px system-ui, sans-serif; color: #9c8f76; text-transform: uppercase; letter-spacing: 1px; }
#talk .barter .list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 5px; }
#talk .barter button { display: flex; justify-content: space-between; gap: 6px; text-align: left; color: #d9cdb2; padding: 8px 9px; } #talk .barter button i { font-style: normal; color: #e9c77a; white-space: nowrap; } #talk .barter button[disabled] { opacity: .4; }
#talk .barter .none { color: #9c8f76; font-style: italic; font-size: 14px; }
#purse { position: fixed; left: 10px; top: calc(46px + env(safe-area-inset-top, 0px)); z-index: 5; font: 600 14px system-ui, sans-serif; color: #e9c77a; background: #0008; padding: 4px 9px; border-radius: 9px; pointer-events: none; }
body[data-mode=drive] #purse, body[data-talk] #purse, body[data-talk] .help, body[data-talk] #use { display: none; }
@media (orientation: landscape) { #talk { left: auto; width: 48%; height: 100%; max-height: none; border-top: 0; border-left: 2px solid #8a6a3a; } }
`;

export function makeTalk({ onOpen = null, onClose = null } = {}) {
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const el = document.createElement('div'); el.id = 'talk'; el.hidden = true;
  el.innerHTML = '<div class="hd"><b></b><span class="tt"></span><span class="cash"></span></div><div class="log"></div><div class="barter" hidden><div class="col"><h4>For sale</h4><div class="list theirs"></div></div><div class="col"><h4>Your things</h4><div class="list yours"></div></div></div><div class="topics"></div><div class="ft"><button class="trade">Barter</button><button class="bye">Goodbye</button></div>';
  document.body.appendChild(el);
  const purse = document.createElement('div'); purse.id = 'purse'; document.body.appendChild(purse);
  const $ = (q) => el.querySelector(q), log = $('.log'), topicsEl = $('.topics'), barterEl = $('.barter'), tradeBtn = $('.trade');
  const wallet = loadWallet(); let who = null, areaId = null, asked = 0, known = [], bartering = false;
  const cash = () => { $('.cash').textContent = '$' + wallet.money; purse.textContent = '$' + wallet.money; }; cash();
  for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'touchstart', 'touchmove', 'touchend', 'mousedown', 'wheel']) el.addEventListener(ev, (e) => e.stopPropagation());   // (the panel is not the game's look / move surface)

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  // [topic] in a line becomes a link when it is something that can be asked about
  const rich = (s) => s.split(/(\[[^\]]+\])/).map((part) => { if (part[0] !== '[') return esc(part); const t = part.slice(1, -1), ok = TOPIC_INDEX.has(t.toLowerCase()) || (who.topics || []).some((q) => q[1].toLowerCase() === t.toLowerCase()); return ok ? `<a data-t="${esc(t).replace(/"/g, '&quot;')}">${esc(t)}</a>` : esc(t); }).join('');
  const say = (html, cls = '') => { const p = document.createElement('p'); if (cls) p.className = cls; p.innerHTML = html; log.appendChild(p); log.scrollTop = log.scrollHeight; };
  const fill = (s) => s.replace('{name}', who.name).replace('{Job}', cap(who.job)).replace('{a job}', (/^[aeiou]/i.test(who.job) ? 'an ' : 'a ') + who.job).replace('{job}', who.job).replace('{area}', AREAS[areaId] ? AREAS[areaId].name : 'town');

  // the answer to a topic: their own line if they have one, else the area's line for their temperament
  function answer(tid, label) { const v = VOICE[who.temper];
    if (tid === '_self') return fill(who.self || v.self);
    if (tid === '_rumour') return pick(RUMOURS, who.h, 10 + asked);
    if (tid === '_trade') return SHOP_KINDS[who.shop].line + (AREAS[areaId] ? ` People round here pay well for ${AREAS[areaId].wants.map((c) => ({ media: 'things to read, watch or play', gift: 'flowers and gifts', tool: 'tools', clothes: 'clothes' }[c] || c)).join(' and ')}, so I give a bit more for those.` : '');
    if (who.answers && who.answers[tid]) return who.answers[tid];
    const a = AREAS[areaId]; if (a && a.answers[tid]) return a.answers[tid][who.temper];
    const ix = TOPIC_INDEX.get((label || '').toLowerCase()); if (ix && ix[0] !== areaId) return v.away;
    return v.no; }
  function ask(tid, label) { if (bartering) showBarter(false); asked++; say(esc(label), 'q'); say(rich(answer(tid, label))); }
  function topicList() { const a = AREAS[areaId], list = [['_self', 'Background']]; if (who.shop !== undefined) list.push(['_trade', 'My trade']); for (const t of who.topics || []) list.push(t); if (a) for (const t of a.topics) list.push(t); list.push(['_rumour', 'Latest rumours']); for (const t of known) if (!list.some((q) => q[1].toLowerCase() === t[1].toLowerCase())) list.push(t); return list; }
  function drawTopics() { topicsEl.innerHTML = ''; for (const [tid, label] of topicList()) { const b = document.createElement('button'); b.textContent = label; b.addEventListener('click', () => ask(tid, label)); topicsEl.appendChild(b); } }
  log.addEventListener('click', (e) => { const t = e.target.closest('a'); if (!t) return; const label = t.dataset.t, own = (who.topics || []).find((q) => q[1].toLowerCase() === label.toLowerCase()), ix = TOPIC_INDEX.get(label.toLowerCase()), tid = own ? own[0] : ix ? ix[1] : label;
    if (ix && ix[0] !== areaId && !known.some((q) => q[1] === ix[2])) { known.push([ix[1], ix[2]]); drawTopics(); } ask(tid, own ? own[1] : ix ? ix[2] : label); });

  // ---- barter: tap one of theirs to buy it, one of yours to sell it
  function showBarter(on) { bartering = on; barterEl.hidden = !on; log.hidden = on; topicsEl.hidden = on; tradeBtn.textContent = on ? 'Back to talk' : 'Barter'; if (on) drawBarter(); }
  function drawBarter() { const theirs = $('.theirs'), yours = $('.yours'); theirs.innerHTML = ''; yours.innerHTML = '';
    for (const [name] of SHOP_KINDS[who.shop].goods) { const p = buyPrice(who, name), b = document.createElement('button'); b.innerHTML = `<span>${esc(name)}</span><i>$${p}</i>`; b.disabled = wallet.money < p; b.addEventListener('click', () => { if (wallet.money < p) return; wallet.money -= p; wallet.items[name] = (wallet.items[name] || 0) + 1; done(); }); theirs.appendChild(b); }
    const mine = Object.entries(wallet.items).filter(([, n]) => n > 0); if (!mine.length) yours.innerHTML = '<div class="none">Nothing.</div>';
    for (const [name, n] of mine) { const p = sellPrice(who, areaId, name), b = document.createElement('button'); b.innerHTML = `<span>${esc(name)}${n > 1 ? ' ×' + n : ''}</span><i>${p ? '$' + p : 'no'}</i>`; b.disabled = !p; b.addEventListener('click', () => { if (!p || !wallet.items[name]) return; wallet.money += p; if (--wallet.items[name] <= 0) delete wallet.items[name]; done(); }); yours.appendChild(b); } }
  const done = () => { saveWallet(wallet); cash(); drawBarter(); };
  tradeBtn.addEventListener('click', () => showBarter(!bartering));
  $('.bye').addEventListener('click', () => api.close());
  addEventListener('keydown', (e) => { if (api.active && e.code === 'Escape') api.close(); });

  const api = { active: false, wallet, get who() { return who; },
    open(w, area) { who = w; areaId = area; asked = 0; known = []; api.active = true; document.body.dataset.talk = '1'; el.hidden = false; log.innerHTML = ''; showBarter(false);
      $('.hd b').textContent = who.name; $('.hd .tt').textContent = who.title || ''; tradeBtn.hidden = who.shop === undefined; cash();
      say(esc(pick(who.hello || VOICE[who.temper].hello, who.h, 7))); drawTopics(); if (onOpen) onOpen(who); },
    close() { if (!api.active) return; api.active = false; delete document.body.dataset.talk; el.hidden = true; const w = who; who = null; if (onClose) onClose(w); } };
  return api;
}
