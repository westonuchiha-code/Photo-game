// The town map: a sheet drawn from the area as it is built (roads, pavements, buildings, shops by trade, ways out),
// with you marked on it. Drag to move it about; tap Close (or M / Escape) to fold it away.
//   makeMap({ onOpen, onClose }) -> { open(data), close(), active }
//   data: { name, roads: [rect], paths: [rect], buildings: [{ x0, x1, z0, z1, label? }], marks: [{ x, z, label }],
//           exits: [{ x, z, label }], you: { x, z, yaw } }     (rect: { minX, maxX, minZ, maxZ }; north is -z)
export function makeMap({ onOpen = null, onClose = null } = {}) {
  const el = document.createElement('div'); el.id = 'townmap'; el.hidden = true;
  el.style.cssText = 'position:fixed;inset:0;z-index:40;background:#14110cee;touch-action:none;user-select:none;-webkit-user-select:none';
  el.innerHTML = '<canvas style="position:absolute;inset:0;width:100%;height:100%"></canvas><div style="position:absolute;left:50%;transform:translateX(-50%);background:#14110cdd;padding:5px 16px;border-radius:8px;top:calc(10px + env(safe-area-inset-top,0px));font:600 17px Georgia,serif;color:#e9c77a;pointer-events:none" class="nm"></div><button style="position:absolute;left:50%;transform:translateX(-50%);bottom:calc(22px + env(safe-area-inset-bottom,0px));font:600 16px Georgia,serif;color:#e9c77a;background:#241d14;border:1px solid #8a6a3a;border-radius:10px;padding:11px 26px">Close</button>';
  document.body.appendChild(el); const cv = el.querySelector('canvas'), x = cv.getContext('2d'); let D = null, cx = 0, cz = 0, S = 4, drag = null;
  function draw() { if (!D) return; const dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight; if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr; } x.setTransform(dpr, 0, 0, dpr, 0, 0);
    const X = (wx) => W / 2 + (wx - cx) * S, Z = (wz) => H / 2 + (wz - cz) * S, rect = (r, pad = 0) => x.fillRect(X(r.minX) - pad, Z(r.minZ) - pad, (r.maxX - r.minX) * S + pad * 2, (r.maxZ - r.minZ) * S + pad * 2);
    x.fillStyle = '#d9cfae'; x.fillRect(0, 0, W, H);
    x.strokeStyle = '#c6bb96'; x.lineWidth = 1; for (let g = Math.floor((cx - W / S) / 20) * 20; g < cx + W / S; g += 20) { x.beginPath(); x.moveTo(X(g), 0); x.lineTo(X(g), H); x.stroke(); } for (let g = Math.floor((cz - H / S) / 20) * 20; g < cz + H / S; g += 20) { x.beginPath(); x.moveTo(0, Z(g)); x.lineTo(W, Z(g)); x.stroke(); }
    x.fillStyle = '#ece4c8'; for (const r of D.paths) rect(r, 1);
    x.fillStyle = '#8a8271'; for (const r of D.roads) rect(r, 1.5); x.fillStyle = '#fbf7e8'; for (const r of D.roads) rect(r);
    for (const b of D.buildings) { x.fillStyle = b.label ? '#b9895a' : '#a59a7c'; x.fillRect(X(b.x0), Z(b.z0), (b.x1 - b.x0) * S, (b.z1 - b.z0) * S); x.strokeStyle = '#5a4f3a'; x.strokeRect(X(b.x0) + 0.5, Z(b.z0) + 0.5, (b.x1 - b.x0) * S - 1, (b.z1 - b.z0) * S - 1); }
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '10px Georgia, serif'; x.fillStyle = '#2a2114';
    for (const b of D.buildings) if (b.label) { const w = (b.x1 - b.x0) * S - 4, words = b.label.split(' '), mx = X((b.x0 + b.x1) / 2), mz = Z((b.z0 + b.z1) / 2); words.forEach((t, i) => x.fillText(t, mx, mz + (i - (words.length - 1) / 2) * 11, Math.max(10, w))); }
    x.font = 'italic 11px Georgia, serif'; for (const m of D.marks) { x.fillStyle = '#7a2a1e'; x.beginPath(); x.arc(X(m.x), Z(m.z), 3, 0, 7); x.fill(); x.fillStyle = m.job ? '#7a2a1e' : '#2a2114'; if (m.job) x.font = 'italic 600 12px Georgia, serif'; x.fillText(m.label, X(m.x), Z(m.z) - 10); x.font = 'italic 11px Georgia, serif'; }
    x.font = '600 12px Georgia, serif'; for (const e of D.exits) { const ex = Math.max(60, Math.min(W - 60, X(e.x))), ez = Math.max(50, Math.min(H - 90, Z(e.z))); x.fillStyle = '#14110ccc'; const tw = x.measureText(e.label).width + 14; x.fillRect(ex - tw / 2, ez - 11, tw, 22); x.fillStyle = '#e9c77a'; x.fillText(e.label, ex, ez); }
    // you: an arrow pointing the way you face
    { const u = D.you; x.save(); x.translate(X(u.x), Z(u.z)); x.rotate(-u.yaw); x.fillStyle = '#c8281e'; x.strokeStyle = '#fff'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, -11); x.lineTo(7, 8); x.lineTo(0, 4); x.lineTo(-7, 8); x.closePath(); x.fill(); x.stroke(); x.restore(); }
    // north
    x.fillStyle = '#2a2114'; x.font = '600 12px Georgia, serif'; x.fillText('N', W - 26, 62 + 0); x.beginPath(); x.moveTo(W - 26, 34); x.lineTo(W - 21, 50); x.lineTo(W - 31, 50); x.closePath(); x.fill(); }
  const stop = (e) => e.stopPropagation();
  for (const ev of ['touchstart', 'touchmove', 'touchend', 'mousedown', 'wheel', 'pointerup']) el.addEventListener(ev, stop);
  el.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (e.target.tagName === 'BUTTON') return; drag = { x: e.clientX, y: e.clientY, cx, cz }; });
  el.addEventListener('pointermove', (e) => { e.stopPropagation(); if (!drag) return; cx = drag.cx - (e.clientX - drag.x) / S; cz = drag.cz - (e.clientY - drag.y) / S; draw(); });
  addEventListener('pointerup', () => { drag = null; });
  el.querySelector('button').addEventListener('click', () => api.close());
  addEventListener('keydown', (e) => { if (api.active && (e.code === 'Escape' || e.code === 'KeyM')) { e.stopImmediatePropagation(); api.close(); } }, true);
  addEventListener('resize', () => { if (api.active) draw(); });
  const api = { active: false, open(data) { D = data; cx = data.you.x; cz = data.you.z; S = 4; el.querySelector('.nm').textContent = data.name; el.hidden = false; api.active = true; draw(); if (onOpen) onOpen(); }, close() { if (!api.active) return; api.active = false; el.hidden = true; D = null; if (onClose) onClose(); } };
  return api;
}
