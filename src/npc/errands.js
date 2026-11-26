// Errands: what people ask you to do for them, in the manner of the old role-playing games. Ask anyone "Any work?".
// Shopkeepers, written characters and the people who stand in one place always have something; about two in five of
// the people walking by do too (theirs is always a parcel: it is finished where it is delivered, since they may not be
// found again). Three kinds:
//   fetch   - bring them a thing some shop sells                      -> paid by them when you hand it over
//   deliver - carry a parcel to a named person (sometimes another area) -> paid by that person on delivery
//   ask     - ask a named person about the subject nobody agrees on, and come back with what they said -> paid on return
// Everything is kept with your money and things (wallet.jobs by the giver's id, wallet.deeds by area), so people
// remember: the giver greets you differently afterwards, and others in the area have heard.
//   makeErrands({ wallet, save, world }) -> { topics(who, area), answer(tid, who, area), greet(who), heard(area, n), notes(), toSee(area) }
//   world() -> the people who can be sent to from here: [{ id, name, title, area, sells? }] (this area's and a few far ones)
import { AREAS, ITEM } from './lines.js';

const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const pick = (arr, h, salt = 0) => arr[(h + Math.imul(salt + 1, 2654435761) >>> 0) % arr.length];
const first = (name) => name.split(' ')[0], an = (s) => (/^[aeiou]/i.test(s) ? 'an ' : 'a ') + s.toLowerCase();

const PRE = { warm: "Since you ask, dear, there is something.", gruff: "Might be.", gossip: "Oh, I thought you'd never ask.", nervous: "I... yes. If you wouldn't mind. I can't go myself.", proud: "I do not ask favours. I offer employment.", dreamy: "There's a thing I keep meaning to do." };
const NONE = { warm: "Nothing just now, dear.", gruff: "No.", gossip: "Not a thing, more's the pity.", nervous: "No. No, nothing. Why do you ask?", proud: "I require nothing.", dreamy: "Not today. Today is already full." };
const AFTER = { warm: "You've done enough for me already. Bless you.", gruff: "You did the one thing. That's plenty.", gossip: "Nothing new! But I've told everybody how useful you are.", nervous: "No. Not again. Once was enough to ask of anyone.", proud: "Your services were satisfactory. I have no further need.", dreamy: "You already did it. Or you will. Either way it's done." };
const WHY_FETCH = ["Don't ask what for.", "It's not for me. It's for whoever keeps leaving the notes.", "I had one. It was gone in the morning and the door was still locked.", "I need it before the street goes quiet again.", "Mine has started to look wrong.", "Someone asked me for one in a dream and I'd like to be ready."];
const WHY_PARCEL = ["I'd go myself, but I don't pass that door any more.", "It has to arrive before they notice it's missing.", "It's stopped ticking, so now is the time.", "They'll know what it is. I'd rather not.", "It turned up on my step with their name on it. In my handwriting."];
const WHY_ASK = ["They won't tell me. They might tell a stranger.", "I've heard it three ways and I want to hear the fourth.", "I was there and I still don't know.", "Don't say who sent you unless they ask twice."];
const PARCEL = { warm: "From {giver}? Oh, at last. Thank you, dear. Here, for your trouble.", gruff: "About time. Here's your money.", gossip: "From {giver}! Now what would {giver} be sending me... no, don't tell me. Here, you've earned it.", nervous: "Put it down. Slowly. ...Thank you. Take this and go.", proud: "You are punctual. Take your fee.", dreamy: "Oh. It's lighter than last time. Here." };
const REPORT = { warm: "They said that? Oh dear. Well. Thank you for going.", gruff: "Hm. Thought so. Here.", gossip: "They said THAT? Word for word? Oh, this changes everything. Here, you've earned it.", nervous: "I knew it. I knew it. Here, take it. Don't tell them I asked.", proud: "As I suspected. Your fee.", dreamy: "So it's what they said last time. Before it happened. Thank you." };
const GOT = { warm: "That's the very thing. Thank you, dear.", gruff: "That's it. Here.", gossip: "You found one! I knew you would. Here.", nervous: "Oh, thank goodness. Quickly, give it here. And this is yours.", proud: "Correct. Your fee.", dreamy: "Yes. That's the one that was missing. Here." };
const REMEMBER = { warm: "You did me a kindness. I haven't forgotten.", gruff: "You did what you said you'd do. Rare.", gossip: "My favourite errand-runner! Come here.", nervous: "Oh, it's you. Good. You I trust.", proud: "You have proved reliable. Good evening.", dreamy: "You came back. People usually come back different." };
const HEARD = ["I hear you ran an errand for {name}. People notice that sort of thing.", "{name} says you can be trusted with a job. That counts for something here.", "You're the one who helped {name}. Word gets round."];

export function makeErrands({ wallet, save, world }) {
  wallet.jobs = wallet.jobs || {}; wallet.deeds = wallet.deeds || {};
  const J = () => wallet.jobs;
  const has = (name) => (wallet.items[name] || 0) > 0;
  const gain = (name) => { wallet.items[name] = (wallet.items[name] || 0) + 1; }, lose = (name) => { if (--wallet.items[name] <= 0) delete wallet.items[name]; };
  const parcelOf = (j) => 'Parcel for ' + j.target.name;
  const where = (p, area) => (p.area !== area && AREAS[p.area] ? `, over in ${AREAS[p.area].name}` : '');
  // does this person have something to ask of you, and what
  const gives = (who) => !!who.kind || who.id.startsWith('c:') || /:s\d+$/.test(who.id) || who.h % 5 < 2;
  const fixed = (who) => !!who.kind || who.id.startsWith('c:') || /:s\d+$/.test(who.id);   // (can be found again)
  function invent(who, area) { const all = world().filter((p) => p.id !== who.id), here = all.filter((p) => p.area === area), far = all.filter((p) => p.area !== area), h = who.h;
    let type = fixed(who) ? pick(['fetch', 'deliver', 'ask', 'deliver', 'fetch'], h, 21) : 'deliver'; if (type === 'ask' && (!here.length || !AREAS[area] || !AREAS[area].odd)) type = 'fetch'; if (type === 'deliver' && !all.length) type = 'fetch';
    const giver = { id: who.id, name: who.name, title: who.title || '', area, temper: who.temper };
    if (type === 'fetch') { const own = who.kind ? who.kind.goods.map((g) => g[0]) : [], sold = []; for (const p of here) for (const n of p.sells || []) if (!own.includes(n) && !sold.some((q) => q[0] === n)) sold.push([n, p.title]);
      const [item, shop] = sold.length ? pick(sold, h, 22) : [pick([...ITEM.keys()].filter((n) => !own.includes(n)), h, 22), null]; return { type, state: 'open', giver, item, shop, pay: Math.round(ITEM.get(item).price * 1.6 + 6), why: pick(WHY_FETCH, h, 23) }; }
    if (type === 'deliver') { const pool = far.length && (h % 3 === 0 || !here.length) ? far : here, t = pick(pool, h, 24); return { type, state: 'open', giver, target: { id: t.id, name: t.name, title: t.title, area: t.area }, pay: 10 + h % 9 + (t.area !== area ? 8 : 0), why: pick(WHY_PARCEL, h, 25) }; }
    const t = pick(here, h, 26); return { type, state: 'open', giver, target: { id: t.id, name: t.name, title: t.title, area: t.area }, topic: AREAS[area].odd, pay: 12 + h % 7, why: pick(WHY_ASK, h, 27) }; }
  const brief = (j, area) => j.type === 'fetch' ? `I need ${an(j.item)}. ${j.shop ? `The ${j.shop} sells them.` : 'I could not tell you where to find one.'} ${j.why} Bring it to me and there's $${j.pay} in it.`
    : j.type === 'deliver' ? `Take this parcel to ${j.target.name}, the ${j.target.title}${where(j.target, area)}. Don't open it. ${j.why} You'll be paid $${j.pay} when it is in their hands.`
    : `Go and ask ${j.target.name}, the ${j.target.title}, about ${j.topic[1]}. ${j.why} Come back and tell me exactly what they say, and there's $${j.pay} in it.`;
  const finish = (j, area) => { j.state = 'done'; wallet.money += j.pay; (wallet.people[j.giver.id] || (wallet.people[j.giver.id] = { d: 0, met: 0 })).d += 10; const a = j.giver.area; (wallet.deeds[a] = wallet.deeds[a] || []).push(j.giver.name); wallet.rep[a] = Math.min(10, (wallet.rep[a] || 0) + 1); save(); return `You are paid $${j.pay}.`; };

  const api = {
    // the extra subjects this person has for you
    topics(who, area) { const list = [], mine = J()[who.id];
      if (!mine) { if (gives(who)) list.push(['_work', 'Any work?']); }
      else if (mine.state !== 'done') { if (mine.type === 'fetch' && has(mine.item)) list.push(['_job_give', `Here is the ${mine.item.toLowerCase()}`]); else if (mine.type === 'ask' && mine.heard) list.push(['_job_report', `What ${first(mine.target.name)} said`]); else list.push(['_work', 'About that errand']); }
      else list.push(['_work', 'Any more work?']);
      for (const j of Object.values(J())) if (j.state !== 'done' && j.target && j.target.id === who.id) { if (j.type === 'deliver' && has(parcelOf(j))) list.push(['_job_parcel:' + j.giver.id, `A parcel from ${j.giver.name}`]); if (j.type === 'ask' && !j.heard) list.push(['_job_ask:' + j.giver.id, `${first(j.giver.name)} asks about ${j.topic[1]}`]); }
      return list; },
    // what they say to one of those subjects: { text, after: [lines about what happened] } (null: not one of ours)
    answer(tid, who, area) { const t = who.temper;
      if (tid === '_work') { let j = J()[who.id]; if (j && j.state === 'done') return { text: AFTER[t] }; if (j) return { text: j.type === 'fetch' ? `I'm still waiting for ${an(j.item)}.${j.shop ? ` The ${j.shop} sells them.` : ''}` : j.type === 'deliver' ? `The parcel is for ${j.target.name}, the ${j.target.title}${where(j.target, area)}. Don't open it.` : j.heard ? 'Well? What did they say?' : `Ask ${j.target.name}, the ${j.target.title}, about ${j.topic[1]}. Then come back.` };
        if (!gives(who)) return { text: NONE[t] }; j = invent(who, area); J()[who.id] = j; const after = []; if (j.type === 'deliver') { gain(parcelOf(j)); after.push(`You are given a parcel. It is addressed to ${j.target.name}.`); } after.push('It is written in your notes.'); save(); return { text: PRE[t] + ' ' + brief(j, area), after }; }
      if (tid === '_job_give') { const j = J()[who.id]; if (!j || !has(j.item)) return null; lose(j.item); return { text: GOT[t], after: [`You hand over the ${j.item.toLowerCase()}.`, finish(j, area)] }; }
      if (tid === '_job_report') { const j = J()[who.id]; if (!j || !j.heard) return null; return { text: REPORT[t], after: [`You tell ${first(who.name)} what ${first(j.target.name)} said.`, finish(j, area)] }; }
      if (tid.startsWith('_job_parcel:')) { const j = J()[tid.slice(12)]; if (!j || !has(parcelOf(j))) return null; lose(parcelOf(j)); (wallet.people[who.id] || (wallet.people[who.id] = { d: 0, met: 0 })).d += 4; return { text: PARCEL[t].replace(/\{giver\}/g, first(j.giver.name)), after: ['You hand over the parcel.', finish(j, area)] }; }
      if (tid.startsWith('_job_ask:')) { const j = J()[tid.slice(9)]; if (!j) return null; const a = AREAS[j.giver.area], said = a && a.answers[j.topic[0]] ? a.answers[j.topic[0]][t] : "I've nothing to say about that."; j.heard = said; save(); return { text: said, after: [`You note what ${first(who.name)} said, to take back to ${first(j.giver.name)}.`] }; }
      return null; },
    // how the giver greets you once the errand is done (null: as usual)
    greet(who) { const j = J()[who.id]; return j && j.state === 'done' ? REMEMBER[who.temper] : null; },
    // what the rest of the area has heard (n: any number that changes between askings)
    heard(area, n) { const d = wallet.deeds[area]; return d && d.length ? pick(HEARD, n, 3).replace('{name}', d[d.length - 1 - (n % Math.min(3, d.length))]) : null; },
    // your notes: one line an errand, the open ones first
    notes() { const out = []; for (const j of Object.values(J())) { const g = `${j.giver.name} (${j.giver.title}, ${AREAS[j.giver.area] ? AREAS[j.giver.area].name : 'town'})`; const what = j.type === 'fetch' ? `wants ${an(j.item)}${j.shop ? ` (the ${j.shop} sells them)` : ''}. $${j.pay}.` : j.type === 'deliver' ? `gave you a parcel for ${j.target.name}, the ${j.target.title}${AREAS[j.target.area] ? ' in ' + AREAS[j.target.area].name : ''}. $${j.pay} on delivery.` : j.heard ? `is waiting to hear what ${j.target.name} said. $${j.pay}.` : `wants you to ask ${j.target.name}, the ${j.target.title}, about ${j.topic[1]}. $${j.pay}.`; out.push({ done: j.state === 'done', text: `${g} ${j.state === 'done' ? 'was helped. Done.' : what}` }); } return out.sort((a, b) => a.done - b.done); },
    // who an open errand wants you to go and see in this area: [{ id, name }]
    toSee(area) { const out = []; for (const j of Object.values(J())) { if (j.state === 'done') continue; const back = j.type === 'fetch' || (j.type === 'ask' && j.heard), p = back ? j.giver : j.target; if (p && p.area === area) out.push({ id: p.id, name: p.name }); } return out; } };
  return api;
}
