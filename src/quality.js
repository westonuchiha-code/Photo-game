// Automatic quality. The game measures its own frame time and moves between quality levels so it stays smooth on
// whatever it's running on, from an old phone to a gaming PC, with no settings to pick.
//   level  resolution (pixel ratio cap)  glow   lights  shadows  draw distance
//     0        0.5                        -       4       -        55 %
//     1        0.7                        -       4       -        70 %
//     2        0.85                       -       4       -        85 %
//     3        1.0                        -       8       yes      100 %
//     4        1.0                        yes     8       yes      100 %
//     5        1.5                        yes     8       yes      100 %
//     6        2.0                        yes     8       yes      100 %
// Steps 0-2 and 4-6 are free to switch (resolution, glow, draw distance); the 2 <-> 3 step changes the light set-up,
// which makes the GPU rebuild shaders once (a short hitch), so the governor needs more evidence to cross it.
// The starting level is a guess from the device (or the level that worked last time, remembered per browser).
// ?q=N locks a level. Automated browsers (tests, screenshots) are locked at 4.
const LEVELS = [
  { pr: 0.5, bloom: false, heavy: false, stream: 0.55 }, { pr: 0.7, bloom: false, heavy: false, stream: 0.7 }, { pr: 0.85, bloom: false, heavy: false, stream: 0.85 },
  { pr: 1.0, bloom: false, heavy: true, stream: 1 }, { pr: 1.0, bloom: true, heavy: true, stream: 1 }, { pr: 1.5, bloom: true, heavy: true, stream: 1 }, { pr: 2.0, bloom: true, heavy: true, stream: 1 },
];
export function makeQuality({ renderer, apply }) {
  const qs = new URLSearchParams(location.search), phone = matchMedia('(pointer: coarse)').matches;
  const dpr = window.devicePixelRatio || 1, top = dpr > 1.6 ? 6 : dpr > 1.1 ? 5 : 4;   // no point asking for more pixels than the screen has
  let gpu = ''; try { const gl = renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info'); gpu = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)); } catch (e) { /* ignore */ }
  const software = /swiftshader|llvmpipe|software|basic render/i.test(gpu);
  const locked = qs.has('q') ? Math.max(0, Math.min(6, +qs.get('q'))) : navigator.webdriver ? 4 : null;
  let saved = null; try { const v = localStorage.getItem('pt-quality'); if (v !== null && v !== '') saved = Math.max(0, Math.min(top, +v)); } catch (e) { /* ignore */ }
  const mem = navigator.deviceMemory || 8, cores = navigator.hardwareConcurrency || 4;
  const guess = software ? 0 : phone ? (mem <= 4 || cores <= 4 ? 1 : 2) : (mem <= 4 || cores <= 2 ? 2 : cores >= 8 ? Math.min(top, 5) : 4);
  let level = locked ?? saved ?? guess, ceiling = top, ceilingUntil = 0;
  const set = (l, why) => { l = Math.max(0, Math.min(top, l)); if (l === level && why !== 'init') return; level = l; const L = LEVELS[l];
    apply({ pixelRatio: Math.min(dpr, L.pr), bloom: L.bloom, heavy: L.heavy, stream: L.stream * (phone ? 0.8 : 1), level: l });
    if (locked === null) { try { localStorage.setItem('pt-quality', String(l)); } catch (e) { /* ignore */ } }
    console.log('quality level', l, why || '', gpu ? '(' + gpu.slice(0, 60) + ')' : ''); };
  set(level, 'init');
  // governor: average frame time over ~1.5 s windows
  let acc = 0, n = 0, worst = 0, good = 0, bad = 0, cool = 2, started = 0;
  function frame(dtReal, now) {
    if (locked !== null || window.__loadingHold || document.hidden) return;
    if (!started) started = now; if (now - started < 4000) return;      // let the after-start jobs and uploads settle
    if (dtReal > 0.5) return;                                           // a stall (tab switch, shader build): not a trend
    acc += dtReal; n++; worst = Math.max(worst, dtReal);
    if (acc < 1.5 || n < 12) return;
    const avg = (acc - worst) / (n - 1) * 1000; acc = 0; n = 0; worst = 0;
    if (cool > 0) { cool--; return; }
    if (avg > 34) { bad++; good = 0; const crossing = LEVELS[level].heavy && !LEVELS[Math.max(0, level - 1)].heavy;
      if (bad >= (crossing ? 3 : 1)) { if (level > 0) { ceiling = level - 1 + 1; ceilingUntil = now + 90000; set(level - (avg > 60 && level > 1 ? 2 : 1), 'slow: ' + avg.toFixed(0) + ' ms'); } bad = 0; cool = 2; } }
    else if (avg < 13.5) { good++; bad = 0; const next = level + 1, crossing = next < LEVELS.length && LEVELS[next].heavy && !LEVELS[level].heavy;
      if (good >= (crossing ? 8 : 4) && next <= top && (now > ceilingUntil || next < ceiling)) { set(next, 'fast: ' + avg.toFixed(0) + ' ms'); good = 0; cool = 2; } }
    else { good = 0; bad = 0; }
  }
  return { frame, get level() { return level; }, set: (l) => set(l, 'manual'), gpu, software };
}
