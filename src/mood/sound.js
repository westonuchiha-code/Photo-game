// Sound on foot: the tone of the room you are in, your footsteps, and the murmur of whoever is speaking.
// Everything is made here (oscillators and filtered noise); there are no sound files. Outdoors is left silent on purpose.
//   makeSound() -> { tick(dt, { inside, shut, speed, surface, onFoot, interference }), voice(who, text), hush(), radio(on) }
//     inside: null outdoors, else the kind of room ('shop' | 'office' | 'flat' | 'studio' | 'clinic' | 'police' |
//             'school' | 'hall' | 'wrong'); shut: the street door is closed behind you; speed: m/s over the ground;
//     surface: 'street' | 'tile' | 'carpet' | 'wood' | 'stone'
const ROOMS = {   // hum: mains hum (Hz, level); buzz: strip lights; air: ventilation (level, how dull); tick: a clock
  shop:   { hum: [58, 0.050], buzz: 0.004, air: [0.012, 500], cycle: 0.5 },    // the drinks fridge, cutting in and out
  office: { hum: [100, 0.010], buzz: 0.013, air: [0.020, 900] },
  clinic: { hum: [100, 0.008], buzz: 0.010, air: [0.026, 1300] },
  police: { hum: [100, 0.012], buzz: 0.016, air: [0.014, 700] },
  school: { hum: [100, 0.008], buzz: 0.012, air: [0.010, 600] },
  flat:   { hum: [50, 0.012], buzz: 0, air: [0.005, 400], tick: 1 },
  studio: { hum: [50, 0.016], buzz: 0, air: [0.004, 350], tick: 1 },
  hall:   { hum: [44, 0.026], buzz: 0.002, air: [0.012, 320] },
  wrong:  { hum: [37, 0.050], buzz: 0.006, air: [0.020, 240], beat: 0.7 },     // two notes a hair apart, slowly beating
};
const STEP = {   // [band centre Hz, sharpness, level, length s, thump Hz or 0]
  street: [900, 1.2, 0.10, 0.055, 0], tile: [1900, 3, 0.09, 0.04, 0], stone: [1300, 2, 0.10, 0.05, 0], wood: [420, 1.5, 0.10, 0.07, 95], carpet: [300, 0.8, 0.05, 0.08, 0] };
const TEMPER = {   // [pitch x, speed x, wobble]
  warm: [1.0, 1.0, 0.10], gruff: [0.78, 0.9, 0.05], gossip: [1.12, 1.35, 0.16], nervous: [1.22, 1.3, 0.25], proud: [0.9, 0.85, 0.06], dreamy: [0.96, 0.7, 0.2] };

export function makeSound() {
  let ctx = null, G = null, noiseBuf = null, cur = null, level = 0, stride = 0, foot = 0, tickT = 0, voiceGain = null;
  const start = () => { if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; } const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctx = new AC();
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // the room: two hum notes, a buzz, and air, each with its own level, under one fader
    const room = ctx.createGain(); room.gain.value = 0; room.connect(ctx.destination);
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), o3 = ctx.createOscillator(), gH = ctx.createGain(), gH2 = ctx.createGain(); o1.type = 'sine'; o2.type = 'triangle'; o3.type = 'sine'; gH.gain.value = 0; gH2.gain.value = 0; o1.connect(gH); o2.connect(gH); o3.connect(gH2); gH.connect(room); gH2.connect(room);
    const ob = ctx.createOscillator(), bp = ctx.createBiquadFilter(), gB = ctx.createGain(); ob.type = 'sawtooth'; ob.frequency.value = 120; bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 5; gB.gain.value = 0; ob.connect(bp); bp.connect(gB); gB.connect(room);
    const ns = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), gA = ctx.createGain(); ns.buffer = noiseBuf; ns.loop = true; lp.type = 'lowpass'; gA.gain.value = 0; ns.connect(lp); lp.connect(gA); gA.connect(room);
    for (const o of [o1, o2, o3, ob, ns]) o.start(); G = { room, o1, o2, o3, gH, gH2, gB, lp, gA }; };
  for (const ev of ['pointerdown', 'touchstart', 'keydown']) addEventListener(ev, start, { passive: true });   // (a browser only lets sound begin on a touch or a key)
  const burst = (freq, q, vol, len, when = 0) => { const t = ctx.currentTime + when, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noiseBuf; s.loopStart = Math.random(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0006, t + len); s.connect(f); f.connect(g); g.connect(ctx.destination); s.start(t, Math.random()); s.stop(t + len + 0.02); };
  const thump = (freq, vol, len) => { const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * 0.5, t + len); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0006, t + len); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + len + 0.02); };
  function tick(dt, st) { if (!ctx || ctx.state !== 'running') return; const t = ctx.currentTime; if (rad) radioTick(dt, st.interference || 0);
    // the room's tone: set up when you come into a kind of room, faded by whether you are in one and whether the door is shut
    const kind = st.inside && ROOMS[st.inside] ? st.inside : null;
    if (kind && kind !== cur) { cur = kind; const R = ROOMS[kind]; G.o1.frequency.setTargetAtTime(R.hum[0], t, 0.3); G.o2.frequency.setTargetAtTime(R.hum[0] * 2, t, 0.3); G.o3.frequency.setTargetAtTime(R.hum[0] + (R.beat || 0), t, 0.3); G.gH.gain.setTargetAtTime(R.hum[1], t, 0.4); G.gH2.gain.setTargetAtTime(R.beat ? R.hum[1] : 0, t, 0.4); G.gB.gain.setTargetAtTime(R.buzz, t, 0.4); G.lp.frequency.setTargetAtTime(R.air[1], t, 0.4); G.gA.gain.setTargetAtTime(R.air[0], t, 0.4); }
    const want = kind ? (st.shut ? 1 : 0.5) : 0; level += (want - level) * Math.min(1, dt * (want > level ? 1.6 : 3)); let lv = level;
    if (kind && ROOMS[kind].cycle) lv *= 0.55 + 0.45 * (Math.sin(t * 0.21) > -0.3 ? 1 : ROOMS[kind].cycle);   // (the fridge's compressor rests now and then)
    G.room.gain.setTargetAtTime(lv, t, 0.08);
    if (kind && ROOMS[kind].tick && level > 0.3) { tickT -= dt; if (tickT <= 0) { tickT = 1; burst(3200, 8, 0.012 * level, 0.02); } }
    // footsteps: one a stride, left and right a little different
    if (st.onFoot && st.speed > 0.4) { stride += st.speed * dt; const len = 0.72 + Math.min(0.25, st.speed * 0.04); if (stride >= len) { stride = 0; foot ^= 1; const [f, q, v, l, th] = STEP[st.surface] || STEP.street; burst(f * (foot ? 1.06 : 0.94) * (0.94 + Math.random() * 0.12), q, v * (0.8 + Math.random() * 0.3), l); if (th) thump(th * (foot ? 1.05 : 0.95), 0.08, 0.09); } } else stride = 0.5; }
  // someone speaking: a run of short vowel-like notes, as long as the line, in a voice that fits them. No words.
  function voice(who, text) { if (!ctx || ctx.state !== 'running' || !who) return; hush(); const T = TEMPER[who.temper] || TEMPER.warm, base = (who.sex === 'f' ? 196 : 108) * T[0] * (0.92 + ((who.h || 0) % 17) / 100), n = Math.max(3, Math.min(22, Math.round(text.length / 7))), t0 = ctx.currentTime + 0.05;
    const g = ctx.createGain(); g.gain.value = 0.055; g.connect(ctx.destination); voiceGain = g; let t = t0;
    for (let i = 0; i < n; i++) { const len = (0.07 + Math.random() * 0.06) / T[1], o = ctx.createOscillator(), f = ctx.createBiquadFilter(), e = ctx.createGain(), fall = i === n - 1 ? 0.8 : 1; o.type = 'sawtooth'; const p = base * (1 + (Math.random() - 0.5) * 2 * T[2]) * fall; o.frequency.setValueAtTime(p, t); o.frequency.linearRampToValueAtTime(p * (0.93 + Math.random() * 0.12), t + len);
      f.type = 'bandpass'; f.frequency.value = 500 + Math.random() * 900; f.Q.value = 4; e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(1, t + 0.012); e.gain.linearRampToValueAtTime(0.0001, t + len); o.connect(f); f.connect(e); e.connect(g); o.start(t); o.stop(t + len + 0.02);
      t += len + (Math.random() < 0.18 ? 0.16 : 0.02) / T[1]; } }
  function hush() { if (voiceGain && ctx) { voiceGain.gain.setTargetAtTime(0, ctx.currentTime, 0.02); voiceGain = null; } }
  // the pocket radio: one thin little tune from one station, static under it, and breaks in the signal (the tune drops
  // out; or it runs down to half speed; or a flat voice counts). `interference` (0..1) from the game buries it in static.
  let rad = null; const SCALE = [220, 261.6, 293.7, 329.6, 392, 440, 523.3, 587.3], TUNE = [4, -1, 5, 4, 2, -1, 1, 2, 4, -1, 2, 1, 0, -1, -1, -1, 5, -1, 7, 5, 4, -1, 2, 4, 5, 4, 2, 1, 2, -1, -1, -1], BASS = [0, 0, 3, 3, 2, 2, 0, 0];
  function radio(on) { start(); if (!ctx) return false;
    if (on && !rad) { const out = ctx.createGain(), hp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter(), mus = ctx.createGain(); out.gain.value = 0; hp.type = 'highpass'; hp.frequency.value = 420; lp.type = 'lowpass'; lp.frequency.value = 2600; mus.connect(hp); hp.connect(lp); lp.connect(out); out.connect(ctx.destination);
      const ns = ctx.createBufferSource(), nf = ctx.createBiquadFilter(), ng = ctx.createGain(); ns.buffer = noiseBuf; ns.loop = true; nf.type = 'bandpass'; nf.frequency.value = 2200; nf.Q.value = 0.6; ng.gain.value = 0.12; ns.connect(nf); nf.connect(ng); ng.connect(out); ns.start();
      out.gain.setTargetAtTime(0.07, ctx.currentTime, 0.1); rad = { out, mus, hp, ng, ns, next: ctx.currentTime + 0.1, step: 0, brk: 14 + Math.random() * 20, left: 0, kind: null, rate: 1, breaks: 0 }; }
    else if (!on && rad) { const r = rad; rad = null; r.out.gain.setTargetAtTime(0, ctx.currentTime, 0.05); setTimeout(() => { try { r.ns.stop(); r.out.disconnect(); } catch (e) { /* gone already */ } }, 400); }
    return !!rad; }
  const note = (t, f, len, type, vol, dest) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0008, t + len); o.connect(g); g.connect(dest); o.start(t); o.stop(t + len + 0.03); };
  function radioTick(dt, interference) { const r = rad, t = ctx.currentTime;
    if (r.left > 0) { if ((r.left -= dt) <= 0) { r.kind = null; r.rate = 1; r.brk = 18 + Math.random() * 34; } } else if ((r.brk -= dt) <= 0) { r.breaks++; r.left = 2 + Math.random() * 4; r.kind = ['static', 'slow', 'voice'][Math.floor(Math.random() * 3)]; if (r.kind === 'slow') { r.rate = 0.5; r.left += 3; } }
    const lost = r.kind === 'static' || r.kind === 'voice';
    r.mus.gain.setTargetAtTime(lost ? 0.03 : Math.max(0.12, 1 - interference), t, 0.15); r.ng.gain.setTargetAtTime(lost ? 0.9 : 0.1 + interference * 0.9 + (r.kind === 'slow' ? 0.25 : 0), t, 0.12);
    const beat = 0.34 / r.rate;
    while (r.next < t + 0.25) { const i = r.step++;
      if (r.kind === 'voice') { if (i % 8 < 5) note(r.next, 138, 0.2, 'sawtooth', 0.5, r.hp); }
      else { const d = TUNE[i % TUNE.length]; if (d >= 0) note(r.next, SCALE[d] * 2 * r.rate, beat * 1.6, 'triangle', 0.5, r.mus); if (i % 4 === 0) note(r.next, SCALE[BASS[(i >> 2) % BASS.length]] * r.rate, beat * 3.5, 'sine', 0.6, r.mus); }
      r.next += beat; } }
  return { tick, voice, hush, radio, get radioOn() { return !!rad; }, get radioState() { return rad ? { kind: rad.kind, breaks: rad.breaks, step: rad.step } : null; }, breakNow() { if (rad) rad.brk = 0; }, get running() { return !!ctx && ctx.state === 'running'; } };
}
