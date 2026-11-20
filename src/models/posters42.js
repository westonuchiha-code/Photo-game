// Gig posters (queue item 42, photos/posters/). Three original posters in the styles of the photos (all
// bands, venues, dates, prices and art invented), pinned behind glass in a venue's poster case.
//   makeGigPoster(kind)  'punk' hot-pink cartoon punk fest, teal hand-drawn lettering, two cartoon rockers,
//     a crowded line-up;  'metal' skull + horns + flames, chrome-and-red logo;  'idol' masked-idol tour final,
//     rainbow title, cartoon masked performers, info block. A1-ish 0.594 x 0.84 m flat plane facing +z.
//   makePosterCase()  blue venue wall section with a riveted steel kick plate and a glass-fronted case holding
//     the three posters (pinned with brass pins), a strip light over them. 3.2 m wide, faces +z.
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }

function outlinedText(x, t, cx, cy, maxW, size, font, fill, stroke, lw, opt = {}) { x.lineJoin = 'round'; x.strokeStyle = stroke; x.lineWidth = lw; x.fillStyle = fill; fitText(x, t, cx, cy, maxW, size, font, { ...opt, stroke: 1 }); }
// a wobbly hand-drawn cartoon rocker head (original): big face, spiky or capped hair, round shades
function rocker(x, cx, cy, s, hair, r) {
  x.save(); x.translate(cx, cy); x.scale(s, s); x.lineWidth = 5; x.strokeStyle = '#111';
  if (hair === 'spike') { x.fillStyle = '#9ad02a'; x.beginPath(); for (let i = 0; i <= 18; i++) { const a = Math.PI * (1.05 + i / 18 * 0.9), rr = i % 2 ? 95 : 150; x.lineTo(Math.cos(a) * rr, -10 + Math.sin(a) * rr); } x.closePath(); x.fill(); x.stroke(); }
  x.fillStyle = '#f2c8a0'; x.beginPath(); x.ellipse(0, 20, 78, 95, 0, 0, 7); x.fill(); x.stroke();
  if (hair === 'cap') { x.fillStyle = '#f07a2a'; x.beginPath(); x.arc(0, -40, 82, Math.PI, 0); x.fill(); x.stroke(); x.fillRect(0, -44, 110, 18); x.strokeRect(0, -44, 110, 18); x.fillStyle = '#2a9ad0'; x.beginPath(); x.arc(-10, -100, 10, 0, 7); x.fill(); }
  x.fillStyle = '#111'; for (const sx of [-1, 1]) { x.beginPath(); x.ellipse(sx * 32, 5, 26, 20, 0, 0, 7); x.fill(); }
  x.strokeStyle = '#111'; x.beginPath(); x.moveTo(-6, 5); x.lineTo(6, 5); x.stroke();
  x.beginPath(); x.moveTo(-28, 70); x.quadraticCurveTo(0, 60 + r() * 20, 30, 72); x.stroke();
  x.fillStyle = '#fff'; x.fillRect(22, 66, 40, 7); x.fillStyle = '#e04a2a'; x.fillRect(58, 64, 8, 10);   // a cigarette-sized candy stick
  x.restore();
}
function skull(x, cx, cy, s) {
  x.save(); x.translate(cx, cy); x.scale(s, s);
  const g = x.createLinearGradient(0, -120, 0, 120); g.addColorStop(0, '#f4f4f0'); g.addColorStop(1, '#9a9a96'); x.fillStyle = g; x.strokeStyle = '#111'; x.lineWidth = 6;
  x.beginPath(); x.moveTo(-90, -10); x.bezierCurveTo(-100, -130, 100, -130, 90, -10); x.lineTo(80, 40); x.lineTo(50, 55); x.lineTo(45, 110); x.lineTo(-45, 110); x.lineTo(-50, 55); x.lineTo(-80, 40); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = '#111'; for (const sx of [-1, 1]) { x.beginPath(); x.ellipse(sx * 40, 5, 30, 34, sx * 0.2, 0, 7); x.fill(); }
  x.beginPath(); x.moveTo(0, 35); x.lineTo(-14, 62); x.lineTo(14, 62); x.closePath(); x.fill();
  for (let i = -3; i <= 3; i++) { x.fillRect(i * 12 - 4, 80, 8, 26); }
  // devil-horn hands either side
  for (const sx of [-1, 1]) { x.save(); x.translate(sx * 150, 20); x.scale(sx, 1); x.fillStyle = '#d8d8d4'; x.strokeStyle = '#111'; x.lineWidth = 5; x.beginPath(); x.roundRect(-30, 0, 60, 70, 14); x.fill(); x.stroke(); x.beginPath(); x.roundRect(-30, -70, 16, 75, 8); x.fill(); x.stroke(); x.beginPath(); x.roundRect(14, -70, 16, 75, 8); x.fill(); x.stroke(); x.restore(); }
  x.restore();
}
function flames(x, w, h, r, yTop) {
  for (let i = 0; i < 70; i++) { const fx = r() * w, fh = 80 + r() * 260, fw = 30 + r() * 60; const g = x.createLinearGradient(0, h, 0, h - fh); g.addColorStop(0, 'rgba(255,200,40,0.9)'); g.addColorStop(0.5, 'rgba(230,70,20,0.7)'); g.addColorStop(1, 'rgba(120,10,10,0)');
    x.fillStyle = g; x.beginPath(); x.moveTo(fx - fw, h); x.quadraticCurveTo(fx - fw * 0.2, h - fh * 0.5, fx + (r() - 0.5) * 30, Math.max(yTop, h - fh)); x.quadraticCurveTo(fx + fw * 0.3, h - fh * 0.5, fx + fw, h); x.fill(); }
}
function maskedIdol(x, cx, cy, s, col, r) {
  x.save(); x.translate(cx, cy); x.scale(s, s); x.lineWidth = 4; x.strokeStyle = '#111';
  x.fillStyle = col; x.beginPath(); x.moveTo(-60, 60); x.lineTo(60, 60); x.lineTo(90, 230); x.lineTo(-90, 230); x.closePath(); x.fill(); x.stroke();        // dress
  x.fillStyle = '#fff'; for (let i = -3; i <= 3; i++) { x.beginPath(); x.arc(i * 25, 228, 14, 0, Math.PI); x.fill(); x.stroke(); }
  x.fillStyle = '#f6d6b8'; x.beginPath(); x.arc(0, 0, 55, 0, 7); x.fill(); x.stroke();
  x.fillStyle = ['#ff3a7a', '#3a8aff', '#ffe03a'][Math.floor(r() * 3)]; x.beginPath(); x.ellipse(0, -10, 62, 26, 0, 0, 7); x.fill(); x.stroke();   // the mask band
  x.fillStyle = '#111'; for (const sx of [-1, 1]) { x.beginPath(); x.ellipse(sx * 22, -10, 12, 9, 0, 0, 7); x.fill(); }
  x.fillStyle = col; x.beginPath(); x.arc(0, -40, 58, Math.PI, 0); x.fill(); x.stroke();                   // hair
  for (const sx of [-1, 1]) { x.beginPath(); x.ellipse(sx * 70, 10, 18, 50, sx * 0.3, 0, 7); x.fill(); x.stroke(); }
  x.restore();
}
export function posterTexture(kind) {
  const r = rng(kind.length * 31 + 7);
  if (kind === 'punk') return canvasT(594, 840, (x, w, h) => {
    x.fillStyle = '#f2477e'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(255,255,255,${r() * 0.12})`; x.fillRect(r() * w, r() * h, 3, 3); }
    outlinedText(x, 'GRAVEL', w / 2, 70, w - 40, 96, F.marker, '#2ac0b0', '#111', 10, { spacing: 2 });
    outlinedText(x, 'MELODY', w / 2, 160, w - 40, 96, F.marker, '#2ac0b0', '#111', 10, { spacing: 2 });
    x.save(); x.translate(w / 2 + 40, 220); x.rotate(-0.06); x.fillStyle = '#ffe03a'; x.strokeStyle = '#111'; x.lineWidth = 4; x.beginPath(); x.roundRect(-110, -26, 220, 52, 26); x.fill(); x.stroke(); x.fillStyle = '#111'; fitText(x, 'FESTIVAL', 0, 2, 190, 34, F.marker); x.restore();
    rocker(x, 190, 420, 1.05, 'spike', r); rocker(x, 410, 430, 1.0, 'cap', r);
    x.fillStyle = '#ffe03a'; x.strokeStyle = '#111'; x.lineWidth = 4; x.beginPath(); x.roundRect(30, 560, 210, 50, 8); x.fill(); x.stroke(); x.fillStyle = '#111'; fitText(x, 'CLUB ORBIT', 135, 586, 190, 30, F.marker);
    x.save(); x.translate(500, 590); x.fillStyle = '#7ad04a'; x.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = i % 2 ? 42 : 58; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); x.fill(); x.stroke(); x.fillStyle = '#111'; fitText(x, '07/14', 0, 4, 80, 26, F.marker); x.restore();
    x.fillStyle = '#111'; const bands = ['NO FORECAST / THE PEBBLES / MOTH CLUB', 'SIDECAR / LOW TIDE / RUSTBUCKET', 'FIVE ALARM DRIVE / pocket lint', 'GLUE STICK / SEE YOU SOON / HOLLOW CAT'];
    bands.forEach((b, i) => fitText(x, b, w / 2, 650 + i * 34, w - 50, 26, F.marker));
    x.fillStyle = '#ffe03a'; x.fillRect(0, h - 56, w, 56); x.fillStyle = '#111'; fitText(x, 'OPEN 12:00 / START 12:30   ADV ¥4,200   DOOR ¥4,800', w / 2, h - 28, w - 40, 22, F.label);
  });
  if (kind === 'metal') return canvasT(594, 840, (x, w, h) => {
    x.fillStyle = '#100808'; x.fillRect(0, 0, w, h); flames(x, w, h, r, 120);
    x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(0, 0, w, h);
    const tg = x.createLinearGradient(0, 20, 0, 80); tg.addColorStop(0, '#fff'); tg.addColorStop(1, '#c81e1e');
    outlinedText(x, 'IRON PARISH', w / 2, 52, w - 40, 64, F.engraved, tg, '#000', 6, { spacing: 4 });
    x.fillStyle = '#f2e6c8'; fitText(x, '— 20 YEARS OF NOISE —', w / 2, 100, w - 80, 26, F.engraved, { spacing: 3 });
    skull(x, w / 2, 290, 1.05);
    const cg = x.createLinearGradient(0, 430, 0, 520); cg.addColorStop(0, '#f4f4f4'); cg.addColorStop(0.5, '#8a8a8a'); cg.addColorStop(1, '#f4f4f4');
    outlinedText(x, 'IRON PARISH', w / 2, 470, w - 30, 86, F.stencil, cg, '#000', 8, { spacing: 2 });
    x.fillStyle = '#c81e1e'; fitText(x, 'vs', w / 2, 535, 60, 40, F.engraved); outlinedText(x, 'THE HOLLOWED', w / 2, 590, w - 60, 60, F.engraved, '#e8e2d0', '#000', 5, { spacing: 4 });
    x.fillStyle = '#ffd040'; fitText(x, '2025.11.21 (FRI)  OPEN 18:00 / START 19:00', w / 2, 680, w - 40, 30, F.label, { spacing: 1 });
    x.fillStyle = '#fff'; fitText(x, 'CLUB ORBIT', w / 2, 740, w - 100, 56, F.slab, { spacing: 6 });
    x.fillStyle = '#d8d0c0'; fitText(x, 'ADV ¥6,000  DOOR ¥7,000  (+1 DRINK)   TICKETS ON SALE NOW', w / 2, 800, w - 40, 18, F.small);
  });
  return canvasT(594, 840, (x, w, h) => {
    const sky = x.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#4a2a8a'); sky.addColorStop(0.5, '#e05a3a'); sky.addColorStop(1, '#f2c23a'); x.fillStyle = sky; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 20; i++) { x.fillStyle = `rgba(255,255,255,${0.1 + r() * 0.15})`; x.beginPath(); x.moveTo(w / 2, 300); x.lineTo(r() * w * 2 - w / 2, 0); x.lineTo(r() * w * 2 - w / 2, 0); x.fill(); }
    const rb = ['#ff3a3a', '#ff9a2a', '#ffe03a', '#3ad06a', '#3a9aff', '#a04aff'];
    const title = 'MASK×DOLL×MASK'; x.font = `64px ${F.retro}`; x.textAlign = 'left'; let tx = 22;
    for (const [i, ch] of [...title].entries()) { x.lineWidth = 8; x.strokeStyle = '#111'; x.strokeText(ch, tx, 82); x.fillStyle = rb[i % rb.length]; x.fillText(ch, tx, 82); tx += x.measureText(ch).width * 0.98; }
    x.fillStyle = '#fff'; x.strokeStyle = '#111'; x.lineWidth = 5; fitText(x, 'COUNTRY TOUR 2025', 200, 130, 330, 34, F.heavy, { stroke: 1 });
    maskedIdol(x, 170, 330, 0.9, '#ff6aa8', r); maskedIdol(x, 300, 300, 1.0, '#6ac8ff', r); maskedIdol(x, 430, 330, 0.9, '#b06aff', r);
    x.save(); x.translate(w / 2, 560); x.rotate(-0.05); outlinedText(x, '— GRAND FINAL —', 0, 0, w - 80, 58, F.heavy, '#7aff6a', '#111', 8); x.restore();
    x.fillStyle = 'rgba(10,10,30,0.82)'; x.fillRect(30, 610, w - 60, 200);
    x.fillStyle = '#fff'; x.textAlign = 'left'; x.font = `24px ${F.label}`;
    ['DATE   2025.09.06 (SAT)', 'OPEN 17:30 / START 18:30', 'PLACE  CLUB ORBIT', 'ADV / DOOR  ¥4,000 + 1 DRINK', 'SET OF 3 TICKETS  ¥8,000'].forEach((t, i) => x.fillText(t, 50, 645 + i * 34));
  });
}
export function makeGigPoster(kind = 'punk') {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.594, 0.84), std({ map: posterTexture(kind), roughness: 0.5 }));
  m.name = 'gig_poster_' + kind; return m;
}
export function makePosterCase() {
  const g = new THREE.Group(); g.name = 'poster_case';
  const W = 3.2, H = 2.6;
  box(W, H, 0.2, std({ color: '#1e3a8a', roughness: 0.8 }), 0, H / 2, -0.1, g);                                   // blue venue wall
  // riveted steel kick plate along the bottom (like the photo)
  const rivets = canvasT(512, 64, (x) => { x.fillStyle = '#b8bcc0'; x.fillRect(0, 0, 512, 64); for (let i = 0; i < 24; i++) { const gr = x.createRadialGradient(10 + i * 21.3, 32, 1, 10 + i * 21.3, 32, 8); gr.addColorStop(0, '#f2f4f6'); gr.addColorStop(1, '#7a7e82'); x.fillStyle = gr; x.beginPath(); x.arc(10 + i * 21.3, 32, 7, 0, 7); x.fill(); } });
  box(W, 0.32, 0.04, std({ map: rivets, metalness: 0.7, roughness: 0.3 }), 0, 0.16, 0.02, g);
  // the glass-fronted case: aluminium frame, blue backing, three posters pinned
  const alu = std({ color: '#c8ccd0', metalness: 0.6, roughness: 0.3 });
  const cw = 2.3, ch = 1.15, cy = 1.45;
  box(cw + 0.08, ch + 0.08, 0.08, alu, 0, cy, 0.04, g);
  box(cw, ch, 0.02, std({ color: '#244494' }), 0, cy, 0.075, g);
  ['idol', 'metal', 'punk'].forEach((k, i) => {
    const p = makeGigPoster(k); p.scale.setScalar(1.25); p.position.set(-0.76 + i * 0.76, cy - 0.01, 0.088); p.rotation.z = (i - 1) * 0.012; g.add(p);
    for (const [sx, sy] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const pin = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), std({ color: '#c8a040', metalness: 0.8, roughness: 0.3 })); pin.position.set(p.position.x + sx * 0.35, cy + sy * 0.5, 0.092); g.add(pin); }
  });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(cw, ch), new THREE.MeshStandardMaterial({ color: '#c8dce4', transparent: true, opacity: 0.16, roughness: 0.02, metalness: 0.3, depthWrite: false }));
  glass.position.set(0, cy, 0.084 + 0.02); g.add(glass);
  box(cw - 0.2, 0.025, 0.02, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.5, 1.45) }), 0, cy + ch / 2 - 0.03, 0.1, g);
  const l = new THREE.PointLight('#fff4e4', 1.0, 2.4, 2); l.position.set(0, cy + 0.4, 0.4); g.add(l);
  // a small venue name plate (made-up) over the case
  const np = canvasT(512, 96, (x) => { x.fillStyle = '#111'; x.fillRect(0, 0, 512, 96); x.fillStyle = '#ffd040'; fitText(x, 'CLUB ORBIT  ·  NOW SHOWING', 256, 50, 480, 46, F.wayfind, { spacing: 6 }); });
  const npm = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.26), std({ map: np, emissive: '#ffffff', emissiveMap: np, emissiveIntensity: 0.3 })); npm.position.set(0, cy + ch / 2 + 0.25, 0.01); g.add(npm);
  g.userData.collider = [-W / 2, W / 2, -0.2, 0.1];
  return g;
}
