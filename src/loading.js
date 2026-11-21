// Loading screen: keeps the #loader overlay up while every texture/model file downloads, then uploads all
// textures to the GPU and compiles every shader before showing the world, so walking around doesn't stutter
// on first sight of each object. Imported first by main.js (so it sees every load from the start).
import * as THREE from 'three';

const el = document.getElementById('loader');
const bar = el && el.querySelector('.bar i');
const txt = el && el.querySelector('.status');
let loaded = 0, total = 0, lastChange = performance.now(), phase = 'Downloading textures';
const show = () => {
  if (!el) return;
  const p = total ? loaded / total : 0;
  bar.style.width = `${Math.round((phase === 'Downloading textures' ? p * 0.85 : 0.85 + 0.15 * (phase === 'Ready' ? 1 : 0.5)) * 100)}%`;
  const pp = window.__packProgress;   // (built game: the texture packs' bytes, see tools/boot.js)
  const dl = pp && pp.got < pp.total ? `${phase}… ${(pp.got / 1e6).toFixed(0)} / ${(pp.total / 1e6).toFixed(0)} MB` : `${phase}… ${loaded} / ${total}`;
  txt.textContent = phase === 'Downloading textures' ? dl : `${phase}…`;
};
const m = THREE.DefaultLoadingManager;
m.onStart = (u, l, t) => { loaded = l; total = t; lastChange = performance.now(); show(); };
m.onProgress = (u, l, t) => { loaded = l; total = t; lastChange = performance.now(); show(); };
m.onError = () => { lastChange = performance.now(); };
export const setPhase = (p) => { phase = p; show(); };

// Resolves once downloads have been idle for a moment (or after a hard timeout so nobody gets stuck).
function downloadsSettled(timeoutMs = 120000) {
  const t0 = performance.now();
  return new Promise((res) => {
    const tick = () => {
      // loads waiting on background (district) texture packs don't hold the start (see tools/boot.js)
      const deferred = window.__deferredWaiting ? window.__deferredWaiting() : 0;
      const idle = loaded + deferred >= total && performance.now() - lastChange > 700;
      if (idle || performance.now() - t0 > timeoutMs) res(); else setTimeout(tick, 150);
    };
    tick();
  });
}

// while the loading screen is up the game doesn't render frames (main.js checks this): the main thread is left to
// the downloads, image decoding and texture uploads
window.__loadingHold = true;
export async function finishLoading(renderer, scene, camera) {
  // the built game starts building the world while its texture packs download: keep the bar moving meanwhile
  const pp = window.__packProgress, iv = pp ? setInterval(show, 250) : 0;
  if (window.__coreReady) await window.__coreReady;
  await downloadsSettled();
  clearInterval(iv);
  console.log('T downloads', Math.round(performance.now()));
  setPhase('Preparing the world');
  await new Promise((r) => setTimeout(r, 30));
  // upload the textures of everything near the start now; the rest go up in small batches after the world is shown
  // (instead of all ~3000 before the start, or each the first time it comes into view)
  const near = new Set(), later = new Set(), _c = new THREE.Vector3(), cam = camera.position;
  scene.updateMatrixWorld(true);
  scene.traverse((o) => {
    const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    if (!mats.length) return;
    let d = 0; const geo = o.geometry;
    if (geo && !o.isInstancedMesh) { if (!geo.boundingSphere) geo.computeBoundingSphere(); const bs = geo.boundingSphere; if (bs) { _c.copy(bs.center).applyMatrix4(o.matrixWorld); d = Math.max(0, _c.distanceTo(cam) - bs.radius * o.matrixWorld.getMaxScaleOnAxis()); } }
    for (const mat of mats) for (const k in mat) { const v = mat[k]; if (v && v.isTexture) (d < 70 ? near : later).add(v); }
  });
  for (const v of near) { later.delete(v); try { renderer.initTexture(v); } catch (e) { /* ignore */ } }
  console.log('T textures-uploaded', Math.round(performance.now()), near.size, 'now,', later.size, 'after the start');
  const queue = [...later];
  const drip = () => { const t0 = performance.now(); while (queue.length && performance.now() - t0 < 6) { try { renderer.initTexture(queue.shift()); } catch (e) { /* ignore */ } } if (queue.length) setTimeout(drip, 30); else console.log('T textures-all', Math.round(performance.now())); };
  setTimeout(drip, 2500);
  // compile all shaders, including objects currently off screen
  try { if (renderer.compileAsync) await renderer.compileAsync(scene, camera); else renderer.compile(scene, camera); } catch (e) { /* ignore */ }
  console.log('T shaders', Math.round(performance.now()));
  setPhase('Ready');
  window.__loadingHold = false;
  if (el) { el.classList.add('done'); setTimeout(() => el.remove(), 700); }
}
