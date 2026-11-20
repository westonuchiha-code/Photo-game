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
  txt.textContent = phase === 'Downloading textures' ? `${phase}… ${loaded} / ${total}` : `${phase}…`;
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
      const idle = loaded >= total && performance.now() - lastChange > 700;
      if (idle || performance.now() - t0 > timeoutMs) res(); else setTimeout(tick, 150);
    };
    tick();
  });
}

export async function finishLoading(renderer, scene, camera) {
  await downloadsSettled();
  setPhase('Preparing the world');
  await new Promise((r) => setTimeout(r, 30));
  // upload every texture now (instead of the first time it comes into view)
  const seen = new Set();
  scene.traverse((o) => {
    const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const mat of mats) for (const k in mat) { const v = mat[k]; if (v && v.isTexture && !seen.has(v)) { seen.add(v); try { renderer.initTexture(v); } catch (e) { /* ignore */ } } }
  });
  // compile all shaders, including objects currently off screen
  try { if (renderer.compileAsync) await renderer.compileAsync(scene, camera); else renderer.compile(scene, camera); } catch (e) { /* ignore */ }
  setPhase('Ready');
  if (el) { el.classList.add('done'); setTimeout(() => el.remove(), 700); }
}
