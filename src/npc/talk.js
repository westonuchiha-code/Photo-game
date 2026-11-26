// Talking to people: a panel with what they say, the topics you can ask about, and (for people who run a shop) barter.
// Modelled on the old role-playing games where everyone in a town knows the same handful of subjects but answers in
// their own way. The words come from lines.js; this file decides who a person is, what they answer, what things cost,
// and what they think of you.
//   whoIs(areaId, seed, sex)               -> a pedestrian's identity (always the same for the same seed)
//   keeperOf(areaId, shopIndex, seed, sex) -> a shopkeeper's identity
//   character(id)                          -> a written character (lines.js CHARACTERS)
//   makeTalk({ onOpen, onClose, use })     -> { open(who, areaId), openBag(), close(), active, wallet, witness(), liking() }
// What they think of you ("liking", 0..100): starts from their temperament, moved by the area's opinion of you (people
// talk), by gifts, and by what they have seen you do. It sets how they greet you, whether they will talk at all, what
// they charge, and whether you get the tip they keep for friends. It is remembered with your money and things.
import { makeErrands } from './errands.js';
import { TEMPERS, NAMES, JOBS, VOICE, RUMOURS, AREAS, TOPIC_INDEX, SHOP_KINDS, PLACES, ITEM, USES, WEAR, DRESS, CHARACTERS } from './lines.js';

const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const pick = (arr, h, salt = 0) => arr[(h + Math.imul(salt + 1, 2654435761) >>> 0) % arr.length];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const CATS = ['food', 'gift', 'media', 'tool', 'clothes', 'health', 'home'];

export function whoIs(areaId, seed, sex = 'm') { const h = hash(areaId + ':' + seed); const job = pick(JOBS, h, 3);
  return { id: 'p:' + areaId + ':' + seed, name: pick(NAMES[sex] || NAMES.m, h, 1) + ' ' + pick(NAMES.last, h, 2), sex, temper: pick(TEMPERS, h, 4), job, title: job, h, likes: pick(CATS, h, 5) }; }
export function keeperOf(areaId, shopIndex, seed, sex = 'm') { const w = whoIs(areaId, 'k' + seed, sex), k = SHOP_KINDS[shopIndex]; return { ...w, id: 'k:' + areaId + ':' + seed, job: k.title, title: k.title, kind: k, likes: k.buys[0] === 'any' ? 'food' : k.buys[0] }; }
export function character(id) { const c = CHARACTERS[id], h = hash('c:' + id), kind = c.place ? PLACES[c.place] : null; return { id: 'c:' + id, h, sex: 'm', job: c.title, likes: kind && kind.buys[0] ? kind.buys[0] : pick(CATS, h, 5), ...c, kind: kind || undefined }; }

// ---- money, things carried, and what people think of you (kept between visits where the browser allows it)
const KEY = 'phototown.wallet.v1';
function loadWallet() { let w = null; try { w = JSON.parse(localStorage.getItem(KEY)); } catch (e) { /* no storage: start fresh each time */ } if (!w || typeof w.money !== 'number' || !w.items) w = { money: 60, items: { 'Pocket radio': 1 } }; w.people = w.people || {}; w.rep = w.rep || {}; w.wear = w.wear || {}; if (typeof w.hunger !== 'number') w.hunger = 25; w.stats = w.stats || { eaten: 0, walked: 0 };   /* (hunger: 0 full .. 100 starving; stats: kept for later, e.g. what eating and walking do to you) */ return w; }
function saveWallet(w) { try { localStorage.setItem(KEY, JSON.stringify(w)); } catch (e) { /* ignore */ } }

const CSS = `
#talk { position: fixed; left: 0; right: 0; bottom: 0; height: 58%; max-height: 520px; z-index: 30; display: flex; flex-direction: column; background: linear-gradient(#1b1610f2, #100d09f7); border-top: 2px solid #8a6a3a; color: #d9cdb2; font: 16px/1.42 Georgia, 'Times New Roman', serif; padding-bottom: env(safe-area-inset-bottom, 0px); touch-action: manipulation; -webkit-user-select: none; user-select: none; }
#talk[hidden], #talk .topics[hidden], #talk .log[hidden], #talk .ft button[hidden], #talk .like[hidden] { display: none; }
#talk .hd { display: flex; align-items: baseline; gap: 8px; padding: 9px 14px 7px; border-bottom: 1px solid #5a4526; }
#talk .hd b { color: #e9c77a; font-size: 18px; white-space: nowrap; } #talk .hd .tt { color: #9c8f76; font-style: italic; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } #talk .hd .cash { color: #e9c77a; font: 600 15px system-ui, sans-serif; }
#talk .like { align-self: center; width: 54px; height: 7px; border: 1px solid #5a4526; border-radius: 4px; background: #0006; overflow: hidden; } #talk .like i { display: block; height: 100%; background: #c9a24a; }
#talk .log { flex: 1; overflow-y: auto; padding: 8px 14px; -webkit-overflow-scrolling: touch; }
#talk .log p { margin: 0 0 9px; } #talk .log .q { color: #e9c77a; margin-bottom: 2px; font-variant: small-caps; letter-spacing: .5px; } #talk .log .sys { color: #9c8f76; font-style: italic; }
#talk a { color: #7fa0e6; text-decoration: none; border-bottom: 1px dotted #7fa0e688; }
#talk .topics { display: flex; flex-wrap: wrap; gap: 6px; padding: 7px 10px; border-top: 1px solid #5a4526; max-height: 34%; overflow-y: auto; }
#talk button { font: 15px Georgia, serif; color: #7fa0e6; background: #241d14; border: 1px solid #5a4526; border-radius: 8px; padding: 8px 11px; }
#talk button:active { background: #3a2e1c; }
#talk .ft { display: flex; gap: 8px; padding: 7px 10px 9px; border-top: 1px solid #5a4526; } #talk .ft button { flex: 1; color: #e9c77a; font-weight: 600; }
#talk .barter { flex: 1; display: flex; gap: 8px; padding: 8px 10px; overflow: hidden; } #talk .barter[hidden], #talk .barter .col[hidden] { display: none; }
#talk .barter .col { flex: 1; display: flex; flex-direction: column; min-width: 0; } #talk .barter h4 { margin: 0 0 5px; font: 600 13px system-ui, sans-serif; color: #9c8f76; text-transform: uppercase; letter-spacing: 1px; }
#talk .barter .list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 5px; }
#talk .barter button { display: flex; justify-content: space-between; gap: 6px; text-align: left; color: #d9cdb2; padding: 8px 9px; } #talk .barter button i { font-style: normal; color: #e9c77a; white-space: nowrap; } #talk .barter button[disabled] { opacity: .4; }
#talk .barter .none { color: #9c8f76; font-style: italic; font-size: 14px; }
#purse { position: fixed; left: 10px; top: calc(46px + env(safe-area-inset-top, 0px)); z-index: 5; font: 600 14px system-ui, sans-serif; color: #e9c77a; background: #000a; padding: 7px 11px; border-radius: 10px; border: 1px solid #e9c77a55; }
body[data-mode=drive] #purse, body[data-talk] #purse, body[data-talk] .help, body[data-talk] #use { display: none; }
@media (orientation: landscape) { #talk { left: auto; width: 48%; height: 100%; max-height: none; border-top: 0; border-left: 2px solid #8a6a3a; } }
`;

// use: { mend() -> message or null, brisk() -> message }: what the game does when a thing from the bag is used
export function makeTalk({ onOpen = null, onClose = null, onSay = null, use = {}, world = () => [] } = {}) {
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const el = document.createElement('div'); el.id = 'talk'; el.hidden = true;
  el.innerHTML = '<div class="hd"><b></b><span class="tt"></span><span class="like" hidden><i></i></span><span class="cash"></span></div><div class="log"></div><div class="barter" hidden><div class="col ctheirs"><h4>For sale</h4><div class="list theirs"></div></div><div class="col"><h4 class="yh">Your things</h4><div class="list yours"></div></div></div><div class="topics"></div><div class="ft"><button class="trade">Barter</button><button class="gift">Give a gift</button><button class="bye">Goodbye</button></div>';
  document.body.appendChild(el);
  const purse = document.createElement('button'); purse.id = 'purse'; document.body.appendChild(purse);
  const $ = (q) => el.querySelector(q), log = $('.log'), topicsEl = $('.topics'), barterEl = $('.barter'), tradeBtn = $('.trade'), giftBtn = $('.gift');
  const wallet = loadWallet(); let who = null, areaId = null, asked = 0, known = [], view = 'talk';   // view: talk | barter | gift | bag
  const cash = () => { $('.cash').textContent = '$' + wallet.money; const n = Object.values(wallet.items).reduce((a, b) => a + b, 0); purse.textContent = '$' + wallet.money + (n ? ' · ' + n + (n === 1 ? ' thing' : ' things') : '') + (wallet.hunger >= 85 ? ' · starving' : wallet.hunger >= 60 ? ' · hungry' : ''); }; cash();
  for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'touchstart', 'touchmove', 'touchend', 'mousedown', 'wheel']) for (const e of [el, purse]) e.addEventListener(ev, (x) => x.stopPropagation());   // (not the game's look / move surface)

  const errands = makeErrands({ wallet, save: () => { saveWallet(wallet); cash(); }, world });   // (what people ask you to do: errands.js)
  // ---- what they think of you
  const mem = (id) => wallet.people[id] || (wallet.people[id] = { d: 0, met: 0 });
  const dress = (w) => { let d = 0; for (const n of Object.values(wallet.wear)) if (DRESS[n]) d += DRESS[n].like[w.temper] || 0; return d; };   // (what you have on)
  const useOf = (name) => USES[name] || (ITEM.get(name) && ITEM.get(name).cat === 'food' ? 'eat' : null);
  const liking = (w, area = areaId) => clamp((VOICE[w.temper].base || 50) + (wallet.rep[area] || 0) + (wallet.people[w.id] ? wallet.people[w.id].d : 0) + dress(w), 0, 100);
  const showLike = () => { if (!who) return; $('.like').hidden = false; $('.like i').style.width = liking(who) + '%'; $('.like i').style.background = liking(who) < 25 ? '#b0412e' : liking(who) > 69 ? '#7fbf6a' : '#c9a24a'; };
  // prices: liked, you pay up to 15% less and are paid more; disliked, the other way
  const lean = (w) => 1.15 - 0.3 * liking(w) / 100;
  const buyPrice = (w, name) => Math.max(1, Math.round(ITEM.get(name).price * VOICE[w.temper].price * lean(w)));
  const sellPrice = (w, name) => { const it = ITEM.get(name), k = w.kind; if (!it || !k) return 0; const any = k.buys.includes('any'); if (!any && !k.buys.includes(it.cat)) return 0;
    return Math.max(1, Math.floor(it.price * (any ? 0.35 : 0.5) * (AREAS[areaId] && AREAS[areaId].wants.includes(it.cat) ? 1.5 : 1) / (VOICE[w.temper].price * lean(w)))); };

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  // [topic] in a line becomes a link when it is something that can be asked about
  const rich = (s) => s.split(/(\[[^\]]+\])/).map((part) => { if (part[0] !== '[') return esc(part); const t = part.slice(1, -1), ok = TOPIC_INDEX.has(t.toLowerCase()) || (who.topics || []).some((q) => q[1].toLowerCase() === t.toLowerCase()); return ok ? `<a data-t="${esc(t).replace(/"/g, '&quot;')}">${esc(t)}</a>` : esc(t); }).join('');
  const say = (html, cls = '') => { const p = document.createElement('p'); if (cls) p.className = cls; p.innerHTML = html; log.appendChild(p); log.scrollTop = log.scrollHeight; };
  const fill = (s) => s.replace('{name}', who.name).replace('{Job}', cap(who.job)).replace('{a job}', (/^[aeiou]/i.test(who.job) ? 'an ' : 'a ') + who.job).replace('{job}', who.job).replace('{area}', AREAS[areaId] ? AREAS[areaId].name : 'town');

  // the answer to a topic: their own line if they have one, else the area's line for their temperament
  function answer(tid, label) { const v = VOICE[who.temper];
    if (tid === '_self') return fill(who.self || v.self);
    if (liking(who) < 20) return v.cold;
    if (tid === '_work' || tid.startsWith('_job')) return errands.answer(tid, who, areaId) || v.no;
    if (tid === '_rumour') return (asked % 3 === 1 && !errands.greet(who) && errands.heard(areaId, who.h + asked)) || pick(RUMOURS, who.h, 10 + asked);
    if (tid === '_tip') return v.tip;
    if (tid === '_trade') return who.kind.line + (who.kind.buys.length && AREAS[areaId] ? ` People round here pay well for ${AREAS[areaId].wants.map((c) => ({ media: 'things to read, watch or play', gift: 'flowers and gifts', tool: 'tools', clothes: 'clothes' }[c] || c)).join(' and ')}, so I give a bit more for those.` : '');
    if (who.answers && who.answers[tid]) return who.answers[tid];
    const a = AREAS[areaId]; if (a && a.answers[tid]) return a.answers[tid][who.temper];
    const ix = TOPIC_INDEX.get((label || '').toLowerCase()); if (ix && ix[0] !== areaId) return v.away;
    return v.no; }
  function ask(tid, label) { setView('talk'); asked++; say(esc(label), 'q'); const r = answer(tid, label), a = typeof r === 'object' ? r.text : r; say(rich(a)); if (onSay) onSay(who, a); if (r.after) { for (const line of r.after) say(esc(line), 'sys'); cash(); showLike(); drawTopics(); if (use.changed) use.changed(); } }
  function topicList() { const a = AREAS[areaId], list = [['_self', 'Background']]; if (who.kind) list.push(['_trade', 'My trade']); if (liking(who) >= 20) for (const t of errands.topics(who, areaId)) list.push(t); for (const t of who.topics || []) list.push(t); if (a) for (const t of a.topics) list.push(t); list.push(['_rumour', 'Latest rumours']); if (a && a.odd) list.push(a.odd); if (liking(who) >= 70) list.push(['_tip', 'A word of advice']); for (const t of known) if (!list.some((q) => q[1].toLowerCase() === t[1].toLowerCase())) list.push(t); return list; }
  function drawTopics() { topicsEl.innerHTML = ''; for (const [tid, label] of topicList()) { const b = document.createElement('button'); b.textContent = label; b.addEventListener('click', () => ask(tid, label)); topicsEl.appendChild(b); } }
  log.addEventListener('click', (e) => { const t = e.target.closest('a'); if (!t || !who) return; const label = t.dataset.t, own = (who.topics || []).find((q) => q[1].toLowerCase() === label.toLowerCase()), ix = TOPIC_INDEX.get(label.toLowerCase()), tid = own ? own[0] : ix ? ix[1] : label;
    if (ix && ix[0] !== areaId && !known.some((q) => q[1] === ix[2])) { known.push([ix[1], ix[2]]); drawTopics(); } ask(tid, own ? own[1] : ix ? ix[2] : label); });

  // ---- the lists: barter (tap theirs to buy, yours to sell), gift (tap one of yours to give it), bag (tap to use)
  function setView(v) { view = v; const lists = v !== 'talk'; barterEl.hidden = !lists; log.hidden = lists && v !== 'bag'; topicsEl.hidden = lists; $('.ctheirs').hidden = v !== 'barter';
    tradeBtn.textContent = v === 'barter' ? 'Back to talk' : 'Barter'; giftBtn.textContent = v === 'gift' ? 'Back to talk' : 'Give a gift'; $('.yh').textContent = v === 'gift' ? 'Give which?' : v === 'bag' ? 'Tap to use' : 'Your things'; if (lists) drawLists(); }
  const row = (name, right, on, off = false) => { const b = document.createElement('button'); b.innerHTML = `<span>${esc(name)}</span><i>${right}</i>`; b.disabled = off; b.addEventListener('click', on); return b; };
  function drawLists() { const theirs = $('.theirs'), yours = $('.yours'); theirs.innerHTML = ''; yours.innerHTML = '';
    if (view === 'barter') for (const [name] of who.kind.goods) { const p = buyPrice(who, name); theirs.appendChild(row(name, '$' + p, () => { if (wallet.money < p) return; wallet.money -= p; wallet.items[name] = (wallet.items[name] || 0) + 1; done(); }, wallet.money < p)); }
    const mine = Object.entries(wallet.items).filter(([, n]) => n > 0); if (!mine.length) yours.innerHTML = '<div class="none">Nothing.</div>';
    for (const [name, n] of mine) { const label = name + (n > 1 ? ' ×' + n : '');
      if (view === 'barter') { const p = sellPrice(who, name); yours.appendChild(row(label, p ? '$' + p : 'no', () => { if (!p || !wallet.items[name]) return; wallet.money += p; take(name); done(); }, !p)); }
      else if (view === 'gift') yours.appendChild(row(label, 'give', () => give(name)));
      else { const k = useOf(name), lab = !k ? '' : k === 'wear' ? (wallet.wear[WEAR[name]] === name ? 'take off' : name === 'Umbrella' ? 'put up' : 'wear') : k === 'torch' || k === 'radio' ? (use.state && use.state(k) ? 'switch off' : 'switch on') : k === 'map' ? 'open' : k === 'eat' ? 'eat' : 'use'; yours.appendChild(row(label, lab, () => useItem(name), !k)); } } }
  const take = (name) => { if (--wallet.items[name] <= 0) { delete wallet.items[name]; const s = WEAR[name]; if (s && wallet.wear[s] === name) delete wallet.wear[s]; } if (use.changed) use.changed(); };
  const done = () => { saveWallet(wallet); cash(); drawLists(); };
  // a gift: worth more the dearer it is, half as much again if it is the kind of thing they like
  function give(name) { const it = ITEM.get(name); if (!it || !wallet.items[name]) return; take(name); const liked = it.cat === who.likes, d = Math.round(clamp(3 + it.price * 0.35, 3, 14) * (liked ? 1.5 : 1)); mem(who.id).d += d; saveWallet(wallet); cash(); setView('talk');
    say(`You give ${esc(who.name.split(' ')[0])} the ${esc(name.toLowerCase())}.`, 'sys'); say(esc(VOICE[who.temper].thanks) + (liked ? ' Just the thing.' : '')); if (onSay) onSay(who, VOICE[who.temper].thanks); showLike(); drawTopics(); }
  function useItem(name) { const kind = useOf(name); if (!kind || !wallet.items[name]) return; let msg = null, keep = false;
    if (kind === 'luck') { const r = Math.random(), win = r < 0.55 ? 0 : r < 0.85 ? 5 : r < 0.97 ? 20 : 100; wallet.money += win; msg = win ? `You scratch the ticket: $${win}!` : 'You scratch the ticket. Nothing.'; }
    else if (kind === 'wear') { const s = WEAR[name]; keep = true; if (wallet.wear[s] === name) { delete wallet.wear[s]; msg = DRESS[name].off; } else { wallet.wear[s] = name; msg = DRESS[name].on; } if (use.changed) use.changed(); }
    else if (use[kind]) { const r = use[kind](name); if (r && typeof r === 'object') { msg = r.msg; keep = !!r.keep; if (r.close) { saveWallet(wallet); api.close(); r.close(); return; } } else msg = r; }   /* (kept things: { msg, keep: true }) */
    if (msg === null || msg === undefined) { say("There's nothing to use that on here.", 'sys'); return; } if (!keep) take(name); say(esc(msg), 'sys'); done(); }
  tradeBtn.addEventListener('click', () => setView(view === 'barter' ? 'talk' : 'barter'));
  giftBtn.addEventListener('click', () => setView(view === 'gift' ? 'talk' : 'gift'));
  $('.bye').addEventListener('click', () => api.close());
  purse.addEventListener('click', () => { if (!api.active) api.openBag(); });
  addEventListener('keydown', (e) => { if (api.active && e.code === 'Escape') api.close(); if (!api.active && e.code === 'KeyI' && document.body.dataset.mode === 'walk') api.openBag(); });

  const api = { active: false, wallet, errands, get who() { return who; }, liking,
    open(w, area) { who = w; areaId = area; asked = 0; known = []; api.active = true; document.body.dataset.talk = '1'; el.hidden = false; log.innerHTML = ''; setView('talk');
      $('.hd b').textContent = who.name; $('.hd .tt').textContent = who.title || ''; tradeBtn.hidden = !who.kind || !who.kind.goods.length; giftBtn.hidden = false; $('.bye').textContent = 'Goodbye'; cash(); showLike();
      const m = mem(who.id), v = VOICE[who.temper], L = liking(who); { const hi = L < 25 ? v.cold : m.met && m.met % 2 && errands.greet(who) ? errands.greet(who) : m.met ? pick(v.again, who.h, m.met) : pick(who.hello || v.hello, who.h, 7); say(esc(hi)); if (onSay) onSay(who, hi); }
      { const worn = ['Umbrella', 'Jacket', 'Scarf', 'Clean shirt'].find((n) => wallet.wear[WEAR[n]] === n); m.saw = m.saw || {}; if (worn && L >= 25 && !m.saw[worn]) { m.saw[worn] = 1; say(esc(DRESS[worn].says[who.temper])); } }   /* (the first time they see you in it) */
      if (!m.met) m.d += 1; m.met++; saveWallet(wallet); drawTopics(); if (onOpen) onOpen(who); },
    // your own things, away from anyone: tap one to use it
    openBag() { who = null; api.active = true; document.body.dataset.talk = '1'; el.hidden = false; log.innerHTML = ''; $('.hd b').textContent = 'Your things'; $('.hd .tt').textContent = ''; $('.like').hidden = true; tradeBtn.hidden = giftBtn.hidden = true; $('.bye').textContent = 'Close'; cash(); setView('bag'); { const N = errands.notes(); if (N.length) { say('Notes', 'q'); for (const n of N) say(esc(n.text), n.done ? 'sys' : ''); } } if (onOpen) onOpen(null); },
    close() { if (!api.active) return; api.active = false; delete document.body.dataset.talk; el.hidden = true; const w = who; who = null; if (onClose) onClose(w); },
    // someone was run down in front of these people (their ids): they think less of you, and the area hears of it
    witness(ids, area, dead) { for (const id of ids) mem(id).d -= dead ? 22 : 12; wallet.rep[area] = clamp((wallet.rep[area] || 0) - (dead ? 2 : 1), -30, 10); saveWallet(wallet); },
    sync() { saveWallet(wallet); cash(); },
    gain(name) { wallet.items[name] = (wallet.items[name] || 0) + 1; saveWallet(wallet); cash(); },   // (a thing picked up)
    reset() { wallet.money = 60; wallet.items = { 'Pocket radio': 1 }; wallet.people = {}; wallet.rep = {}; wallet.jobs = {}; wallet.deeds = {}; wallet.wear = {}; wallet.hunger = 25; wallet.stats = { eaten: 0, walked: 0 }; if (use.changed) use.changed(); saveWallet(wallet); cash(); } };
  return api;
}
