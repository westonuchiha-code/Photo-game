// Work that can wait until the world is on screen (heavy procedural geometry for small props): jobs queued with
// afterStart(job) run once the loading screen is gone (window.__loadingHold, see loading.js), a few per tick so a
// frame never stalls for long. Order is kept.
const jobs = []; let running = false;
function run() {
  if (window.__loadingHold) { setTimeout(run, 250); return; }
  const t0 = performance.now();
  while (jobs.length && performance.now() - t0 < 12) { const j = jobs.shift(); try { j(); } catch (e) { console.warn('deferred job failed', e); } }
  if (jobs.length) setTimeout(run, 40); else running = false;
}
export function afterStart(job) { jobs.push(job); if (!running) { running = true; setTimeout(run, 250); } }
