// Signage batch (queue item 65, photos/signage/): the street signs outside a comic & internet cafe, all redrawn with
// made-up names, prices and numbers; no people's photos (generic drawn figures / icons instead). The sign hardware
// is modelled: steel display frame, aluminium A-frames on hinges with weighted bases, a ticket machine.
//   makePriceBoard()      tall steel-framed rate board: red headline, orange/white rate table, yellow-on-red perks
//   makeAFrame(design)    'night' (LONG NIGHT campaign: night skyline, yellow lettering, a drawn recliner),
//                         'course' (blue LONG COURSE price board), 'theatre' (lit poster for a made-up non-verbal show)
//   makeTicketMachine()   ramen ticket machine: menu panel of food tiles (the user's own food photos) in gold frames
//                         with price buttons, coin + bill slots, ticket tray, CANCEL ALL
//   makeCafeFrontage()    the five arranged on a sidewalk strip (6 x 1.6 m, street toward +z) with a B1F RAMEN arrow
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';

function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.5, ...o }); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const alu = () => std({ color: '#c8ccd0', metalness: 0.75, roughness: 0.3 });
const lit = (t, k = 0.35) => std({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: k, roughness: 0.35 });

// ---- price board ----------------------------------------------------------------------------------------------
function priceBoardArt(x, w, h) {
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
  // red headline banner with a white burst
  x.fillStyle = '#d81e1e'; x.fillRect(0, 0, w, 150); x.fillStyle = '#fff'; x.fillRect(40, 18, w - 80, 114);
  x.fillStyle = '#111'; fitText(x, 'LOWEST IN TOWN', w / 2, 76, w - 120, 92, F.heavy, { spacing: 2 });
  // rate table: header row, left column of plans, four seat types
  const cols = ['OPEN', 'BUSINESS', 'RECLINER', 'PRIVATE ROOM'], rows = [['First hour', 4.1, 4.55, 5.0, 5.46], ['Each extra 10 min', 0.69, 0.73, 0.91, 1.0], ['3 h pack', 7.55, 9.73, 11.64, 15.0], ['6 h pack', 11.64, 16.19, 17.1, 20.0], ['9 h pack', 16.19, 20.73, 21.64, 27.27], ['12 h pack', 18.0, 25.28, 26.19, 31.82], ['Night 6 h', 9.1, 12.28, 13.46, 20.0], ['Night 9 h', 11.82, 18.0, 18.91, 27.27], ['Night 12 h', 14.55, 22.55, 23.46, 31.82], ['1-day pack', null, null, null, 43.64]];
  const tx = 30, ty = 170, cw = (w - 60 - 190) / 4, rh = 70;
  x.fillStyle = '#e8401a'; x.fillRect(tx, ty, w - 60, 60);
  x.fillStyle = '#fff'; fitText(x, 'PLAN', tx + 95, ty + 31, 170, 28, F.label, { weight: 700 }); cols.forEach((c, i) => fitText(x, c, tx + 190 + cw * (i + 0.5), ty + 31, cw - 10, 26, F.label, { weight: 700 }));
  rows.forEach((r, j) => {
    const y = ty + 60 + j * rh;
    x.fillStyle = j < 2 ? '#fbe0c0' : '#ffffff'; x.fillRect(tx, y, w - 60, rh);
    x.fillStyle = '#e8401a'; x.fillRect(tx, y, 190, rh); x.fillStyle = '#fff'; fitText(x, r[0], tx + 95, y + rh / 2, 175, 24, F.label, { weight: 600 });
    for (let i = 1; i <= 4; i++) { const v = r[i]; x.fillStyle = '#111'; fitText(x, v == null ? '—' : `$${v.toFixed(2)}`, tx + 190 + cw * (i - 0.5), y + rh / 2 - 6, cw - 14, 34, F.heavy); if (v != null) { x.fillStyle = '#666'; fitText(x, `tax incl. $${(v * 1.1).toFixed(2)}`, tx + 190 + cw * (i - 0.5), y + rh - 12, cw - 20, 13, F.small); } }
    x.strokeStyle = '#d8b8a0'; x.lineWidth = 2; x.strokeRect(tx, y, w - 60, rh);
  });
  const by = ty + 60 + rows.length * rh + 20;
  x.fillStyle = '#d81e1e'; x.fillRect(tx, by, w - 60, 250);
  x.fillStyle = '#fff'; x.fillRect(tx + 20, by + 16, 300, 64); x.fillStyle = '#d81e1e'; fitText(x, 'MEMBERS', tx + 170, by + 48, 270, 40, F.heavy);
  x.fillStyle = '#ffe14a'; fitText(x, 'JOIN FREE', tx + 520, by + 48, 330, 50, F.heavy);
  fitText(x, '50,000 COMICS · 110 SEATS', w / 2, by + 125, w - 120, 58, F.heavy); fitText(x, 'FREE DRINK BAR', w / 2, by + 200, w - 160, 64, F.heavy);
  x.fillStyle = '#d81e1e'; x.fillRect(0, h - 90, w, 90); x.fillStyle = '#fff'; fitText(x, 'COMIC & NET CAFE  HIDEOUT', w * 0.42, h - 45, w * 0.7, 40, F.heavy); x.fillStyle = '#ffe14a'; fitText(x, '5F', w - 90, h - 45, 100, 56, F.heavy);
}
export function makePriceBoard() {
  const g = new THREE.Group(); g.name = 'price_board';
  const W = 0.95, H = 1.75, st = alu();
  const t = canvasT(900, 1660, priceBoardArt);
  box(W + 0.08, H + 0.08, 0.05, st, 0, 0.35 + H / 2, 0, g);
  plane(W, H, lit(t, 0.25), 0, 0.35 + H / 2, 0.026, 0, g);
  // a clear cover held by the frame lips, two legs into a heavy base plate
  plane(W, H, std({ color: '#ffffff', transparent: true, opacity: 0.08, roughness: 0.05, depthWrite: false }), 0, 0.35 + H / 2, 0.035, 0, g);
  for (const s of [-1, 1]) box(0.05, 0.4, 0.05, st, s * (W / 2 - 0.05), 0.2, 0, g);
  box(W + 0.2, 0.04, 0.45, std({ color: '#5a5c60', metalness: 0.6 }), 0, 0.02, 0, g);
  g.userData.collider = [-W / 2 - 0.1, W / 2 + 0.1, -0.23, 0.23];
  return g;
}

// ---- A-frames -------------------------------------------------------------------------------------------------
const ART = {
  night: (x, w, h) => {
    const sky = x.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#0a1e4a'); sky.addColorStop(0.6, '#1e4ab0'); sky.addColorStop(1, '#0a2a6a'); x.fillStyle = sky; x.fillRect(0, 0, w, h);
    x.fillStyle = '#d81e1e'; x.fillRect(0, 0, w, 120); x.fillStyle = '#fff'; fitText(x, 'CHECK-IN 6:00 PM', w / 2, 62, w - 60, 72, F.heavy);
    // skyline with lit windows
    for (let i = 0; i < 18; i++) { const bw = 30 + (i * 37) % 50, bh = 120 + (i * 53) % 260, bx = i * 40 - 20; x.fillStyle = '#081430'; x.fillRect(bx, 620 - bh, bw, bh); x.fillStyle = 'rgba(255,220,120,0.8)'; for (let k = 0; k < bh / 22; k++) if ((i + k) % 3) x.fillRect(bx + 6 + (k % 2) * 12, 620 - bh + 10 + k * 20, 6, 8); }
    x.fillStyle = '#ffe14a'; x.strokeStyle = '#0a1e4a'; x.lineWidth = 10; x.lineJoin = 'round';
    fitText(x, 'LONG', 230, 230, 400, 140, F.heavy, { stroke: 1 }); fitText(x, 'NIGHT', 230, 360, 420, 140, F.heavy, { stroke: 1 });
    x.fillStyle = '#fff'; x.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 22 : 50; x.lineTo(196 + Math.cos(a) * r, 225 + Math.sin(a) * r); } x.fill();
    x.fillStyle = '#ffe14a'; fitText(x, 'CAMPAIGN', 230, 460, 360, 60, F.heavy);
    // a drawn recliner seat (instead of a person)
    x.fillStyle = '#2a2a30'; x.beginPath(); x.roundRect(470, 300, 160, 70, 18); x.fill(); x.beginPath(); x.roundRect(560, 170, 80, 160, 20); x.fill(); x.fillStyle = '#4a4a54'; x.beginPath(); x.roundRect(480, 290, 140, 30, 12); x.fill(); x.fillStyle = '#ffe14a'; x.beginPath(); x.arc(540, 150, 30, 0, 7); x.fill(); x.fillStyle = '#1e4ab0'; x.beginPath(); x.arc(552, 140, 26, 0, 7); x.fill();
    // white price panel
    x.fillStyle = '#fff'; x.beginPath(); x.roundRect(40, 650, w - 80, 380, 18); x.fill();
    x.fillStyle = '#1e4ab0'; fitText(x, 'Night course — perfect for a nap!', w / 2, 700, w - 140, 36, F.label, { weight: 700 });
    x.fillStyle = '#d81e1e'; fitText(x, '16-HOUR NIGHT PACK', w / 2, 790, w - 140, 54, F.heavy); fitText(x, '$18.00', w / 2, 890, w - 200, 100, F.heavy);
    x.fillStyle = '#333'; fitText(x, 'check in 6 PM – 9 AM · weekends +$3', w / 2, 980, w - 140, 26, F.small);
    x.fillStyle = '#1e4ab0'; x.fillRect(0, h - 80, w, 80); x.fillStyle = '#fff'; fitText(x, 'after 9 PM: night course only', w / 2, h - 40, w - 80, 34, F.label);
  },
  course: (x, w, h) => {
    x.fillStyle = '#1aa0e0'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#fff'; x.beginPath(); x.roundRect(30, 30, w - 60, 140, 20); x.fill(); x.fillStyle = '#1a6ab8'; fitText(x, 'LIMITED TIME!', w / 2, 72, w - 120, 46, F.heavy); fitText(x, 'RECOMMENDED LONG COURSE', w / 2, 132, w - 100, 40, F.heavy);
    [['3 HOURS', '$10.00'], ['5 HOURS', '$15.00'], ['8 HOURS', '$20.00'], ['12 HOURS', '$25.00'], ['24 HOURS', '$40.00']].forEach(([a, b], i) => {
      const y = 220 + i * 150; x.fillStyle = '#fff'; x.beginPath(); x.roundRect(40, y, w * 0.42, 120, 16); x.fill(); x.fillStyle = '#1a6ab8'; fitText(x, a, 40 + w * 0.21, y + 62, w * 0.38, 62, F.heavy); x.fillStyle = '#fff'; fitText(x, b, w * 0.73, y + 62, w * 0.46, 92, F.heavy);
    });
    x.fillStyle = '#fff'; x.fillRect(0, h - 90, w, 90); x.fillStyle = '#1a6ab8'; fitText(x, 'Got time? Relax with a long course!', w / 2, h - 45, w - 60, 34, F.label, { weight: 700 });
  },
  theatre: (x, w, h) => {
    const bg = x.createRadialGradient(w / 2, h * 0.55, 30, w / 2, h * 0.55, h * 0.7); bg.addColorStop(0, '#f2c86a'); bg.addColorStop(0.4, '#6a4a2a'); bg.addColorStop(1, '#141018'); x.fillStyle = bg; x.fillRect(0, 0, w, h);
    // big gears behind a round stage, a small dancer drawn in white line work
    const gear = (cx, cy, r, n, c) => { x.fillStyle = c; x.beginPath(); for (let k = 0; k < n * 2; k++) { const a = k * Math.PI / n, rr = k % 2 ? r : r * 1.15; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.fill(); x.fillStyle = '#141018'; x.beginPath(); x.arc(cx, cy, r * 0.35, 0, 7); x.fill(); };
    gear(160, 620, 140, 12, '#8a6a3a'); gear(560, 560, 180, 16, '#a8843a'); gear(420, 820, 90, 10, '#6a5a3a');
    x.fillStyle = '#3a3040'; x.beginPath(); x.ellipse(w / 2, 1000, 260, 60, 0, 0, 7); x.fill(); x.fillStyle = '#f2e6c8'; x.beginPath(); x.ellipse(w / 2, 990, 240, 48, 0, 0, 7); x.fill();
    x.strokeStyle = '#ffffff'; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.arc(w / 2, 800, 22, 0, 7); x.moveTo(w / 2, 822); x.lineTo(w / 2, 900); x.moveTo(w / 2, 840); x.lineTo(w / 2 - 50, 800); x.moveTo(w / 2, 840); x.lineTo(w / 2 + 55, 870); x.moveTo(w / 2, 900); x.lineTo(w / 2 - 30, 975); x.moveTo(w / 2, 900); x.lineTo(w / 2 + 40, 960); x.stroke();
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(w / 2 - 60, 900); x.lineTo(w / 2 + 60, 900); x.lineTo(w / 2, 860); x.fill();
    x.fillStyle = '#ffffff'; fitText(x, 'COGWORK', w / 2, 140, w - 100, 150, F.heavy, { spacing: 8 }); fitText(x, 'COMPLEX ENTERTAINMENT', w / 2, 230, w - 160, 30, F.label, { spacing: 4 });
    x.fillStyle = '#f2e6c8'; fitText(x, 'NON-VERBAL THEATRE', w / 2, h - 210, w - 80, 60, F.engraved, { spacing: 4 }); fitText(x, 'No language barriers · nightly shows', w / 2, h - 150, w - 120, 28, F.label);
    x.fillStyle = '#c81e28'; x.fillRect(0, h - 90, w, 90); x.fillStyle = '#fff'; fitText(x, '(555) 019-3770', w * 0.35, h - 45, w * 0.55, 40, F.label, { weight: 700 }); fitText(x, '3rd FLOOR ↑', w * 0.82, h - 45, w * 0.3, 40, F.label, { weight: 700 });
  },
};
export function makeAFrame(design = 'night') {
  const g = new THREE.Group(); g.name = 'aframe_' + design;
  const W = design === 'theatre' ? 0.72 : 0.62, H = design === 'theatre' ? 1.05 : 0.95, OPEN = 0.17, st = design === 'theatre' ? std({ color: '#141416', metalness: 0.5 }) : alu();
  const t = canvasT(700, Math.round(700 * H / W), ART[design]);
  const lift = design === 'night' ? 0.12 : 0.05;
  for (const s of [-1, 1]) {
    const leaf = new THREE.Group(); leaf.position.set(0, lift + H + 0.02, 0); leaf.rotation.x = s * OPEN; g.add(leaf);
    box(W + 0.05, H + 0.05, 0.025, st, 0, -H / 2, 0, leaf);
    plane(W, H, design === 'theatre' ? lit(t, 0.6) : std({ map: t, roughness: 0.4 }), 0, -H / 2, -s * 0.0135, s > 0 ? Math.PI : 0, leaf);   // on the outer face of each leaf
    if (design === 'theatre') { const gl = new THREE.PointLight('#ffe8c8', 0.35, 2.0, 1.6); gl.position.set(0, -H / 2, -s * 0.25); leaf.add(gl); }
  }
  box(W + 0.08, 0.04, 0.05, st, 0, lift + H + 0.03, 0, g);   // hinge bar
  const spread = Math.sin(OPEN) * (H + 0.02);
  if (design === 'night') {   // orange water-filled base the legs stand in
    const base = new THREE.Mesh(new RoundedBoxGeometry(W + 0.25, 0.14, spread * 2 + 0.3, 3, 0.05), std({ color: '#e8601a', roughness: 0.6 })); base.position.y = 0.07; base.castShadow = true; g.add(base);
  } else for (const s of [-1, 1]) box(W + 0.04, 0.03, 0.06, std({ color: '#222' }), 0, 0.015, s * spread, g);
  g.userData.collider = [-W / 2 - 0.12, W / 2 + 0.12, -spread - 0.12, spread + 0.12];
  return g;
}

// ---- ticket machine ------------------------------------------------------------------------------------------
const MENU = [['food_ramen_top', 'RAMEN', 8.5], ['food_ramen_top', 'BIG RAMEN', 10.0], ['food_curry_rice', 'CURRY RICE', 9.0], ['food_katsu', 'CUTLET BOWL', 9.5], ['food_spaghetti', 'COLD NOODLES', 8.0], ['food_cupnoodle_top', 'KIDS NOODLES', 5.0], ['food_porkbun_bite', 'PORK BUN', 2.4], ['food_pizza_corn', 'GYOZA (6)', 3.6], ['food_dip_sauce', 'EXTRA SAUCE', 0.5]];
export function makeTicketMachine() {
  const g = new THREE.Group(); g.name = 'ticket_machine';
  const body = std({ color: '#e8e4da', roughness: 0.4 }), dark = std({ color: '#1a1a1c', roughness: 0.4 });
  box(0.75, 1.75, 0.55, body, 0, 0.875, 0, g); box(0.79, 0.08, 0.59, dark, 0, 1.79, 0, g);
  const imgs = {}; MENU.forEach(([f]) => { if (!imgs[f]) { const im = new Image(); im.src = `assets/textures/${f}.png`; imgs[f] = im; } });
  const draw = (x, w, h) => {
    x.fillStyle = '#111'; x.fillRect(0, 0, w, h);
    MENU.forEach(([f, name, price], i) => {
      const c = i % 3, r = Math.floor(i / 3), cx = 20 + c * 220, cy = 20 + r * 250;
      x.fillStyle = '#c8a040'; x.fillRect(cx, cy, 200, 150); x.fillStyle = '#e8c870'; x.fillRect(cx + 4, cy + 4, 192, 142);
      const im = imgs[f]; if (im.complete && im.naturalWidth) { const s = Math.min(im.naturalWidth, im.naturalHeight); x.drawImage(im, (im.naturalWidth - s) / 2, (im.naturalHeight - s) / 2, s, s * 0.72, cx + 8, cy + 8, 184, 134); } else { x.fillStyle = '#8a5a2a'; x.fillRect(cx + 8, cy + 8, 184, 134); }
      x.fillStyle = '#f4f2ea'; x.beginPath(); x.roundRect(cx, cy + 160, 200, 70, 10); x.fill(); x.fillStyle = '#111'; fitText(x, name, cx + 100, cy + 182, 186, 26, F.label, { weight: 700 }); fitText(x, `$${price.toFixed(2)}`, cx + 100, cy + 213, 150, 28, F.heavy);
    });
    x.fillStyle = '#c81e28'; x.beginPath(); x.roundRect(440, h - 90, 220, 70, 10); x.fill(); x.fillStyle = '#fff'; fitText(x, '✕ CANCEL ALL', 550, h - 55, 200, 30, F.label, { weight: 700 });
  };
  const t = canvasT(680, 860, draw); Promise.all(Object.values(imgs).map((im) => new Promise((r) => { im.onload = r; im.onerror = r; }))).then(() => { draw(t.image.getContext('2d'), 680, 860); t.needsUpdate = true; });
  box(0.68, 0.86, 0.02, dark, 0, 1.25, 0.28, g); plane(0.66, 0.84, lit(t, 0.55), 0, 1.25, 0.292, 0, g);
  // slots and tray
  box(0.3, 0.16, 0.04, dark, -0.15, 0.68, 0.28, g); box(0.18, 0.03, 0.03, std({ color: '#c8ccd0', metalness: 0.8 }), -0.15, 0.7, 0.3, g);
  box(0.06, 0.08, 0.04, std({ color: '#c8ccd0', metalness: 0.8 }), 0.2, 0.7, 0.29, g); cyl(0.025, 0.025, 0.02, std({ color: '#c81e28' }), 0.2, 0.6, 0.3, g).rotation.x = Math.PI / 2;
  box(0.4, 0.14, 0.12, dark, 0, 0.32, 0.29, g); box(0.36, 0.1, 0.08, std({ color: '#2a2a2c' }), 0, 0.33, 0.31, g);
  const lbl = canvasT(256, 48, (x, w, h) => { x.fillStyle = '#e8e4da'; x.fillRect(0, 0, w, h); x.fillStyle = '#c81e28'; fitText(x, 'BUY TICKET FIRST · RAMEN B1F', w / 2, 25, 240, 22, F.label, { weight: 700 }); });
  plane(0.6, 0.11, std({ map: lbl }), 0, 1.75, 0.278, 0, g);
  g.userData.collider = [-0.4, 0.4, -0.3, 0.32];
  return g;
}

export function makeCafeFrontage() {
  const g = new THREE.Group(); g.name = 'cafe_frontage';
  const put = (o, x, z, ry = 0) => { o.position.set(x, 0, z); o.rotation.y = ry; g.add(o); return o; };
  put(makePriceBoard(), -2.3, -0.35);
  put(makeAFrame('course'), -1.1, 0.1, 0.2);
  put(makeAFrame('night'), 0.1, 0.15, -0.1);
  put(makeAFrame('theatre'), 1.45, 0.1, -0.2);
  put(makeTicketMachine(), 2.6, -0.45);
  // B1F RAMEN arrow sign on a stand
  const ar = canvasT(256, 128, (x, w, h) => { x.fillStyle = '#c81e28'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'RAMEN B1F', w * 0.42, h * 0.5, w * 0.7, 52, F.heavy); x.beginPath(); x.moveTo(w - 50, 40); x.lineTo(w - 10, 64); x.lineTo(w - 50, 88); x.fill(); });
  const s = put(new THREE.Group(), 3.3, -0.4); box(0.04, 1.1, 0.04, std({ color: '#2a2a2c' }), 0, 0.55, 0, s); box(0.5, 0.25, 0.03, std({ map: ar, emissive: '#ffffff', emissiveMap: ar, emissiveIntensity: 0.4 }), 0, 1.2, 0, s);
  const cols = [];
  for (const o of g.children) { const c = o.userData.collider; if (!c) continue; const cs = Math.cos(o.rotation.y), sn = Math.sin(o.rotation.y); const xs = [c[0], c[1]], zs = [c[2], c[3]]; const pts = []; for (const a of xs) for (const b of zs) pts.push([o.position.x + a * cs + b * sn, o.position.z - a * sn + b * cs]); cols.push([Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))]); }
  g.userData.colliders = cols;
  return g;
}
