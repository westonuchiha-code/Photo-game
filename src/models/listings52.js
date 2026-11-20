// Apartment listing posters (queue item 52, photos/listings/). Original English rental flyers in the photos'
// layout (blue water-photo header with a big yellow title, white body, address line, pink/blue feature lines,
// yellow amenity tags, big rent + deposit lines, room photos cut from the user's photos, a floor plan, a map
// snippet) for the made-up Elmwood Apartments / Maple Creek Properties; fake 555 numbers.
//   makeListingFlyer(i)   one A3 flyer (0.42 x 0.297 m), faces +z
//   makeRealtyWindow()    a realty-office storefront bay: dark frame, glass, two steel rails holding a 2 x 3
//                         grid of back-lit flyers, a made-up "MAPLE CREEK PROPERTIES" fascia. 3.2 m wide.
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.5, ...o }); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; }
const ROOMS = [1, 2, 3, 4, 5, 6].map((i) => { const im = new Image(); im.src = `assets/textures/ls_room${i}.png`; return im; });
const roomsReady = Promise.all(ROOMS.map((im) => new Promise((r) => { im.onload = r; im.onerror = r; })));

const DATA = [
  { title: 'ELMWOOD APTS I', addr: '1200 Elmwood Ave, Unit 22', built: 'Steel frame · 5 floors · built 1992', walk: 'Elmwood Station south exit · 4 min walk', feat: '3 bed, 1 bath · view of the river fireworks', rent: '$1,200', dep: '1 month', fee: '$100 / mo', rooms: [0, 5] },
  { title: 'ELMWOOD APTS II', addr: '1200 Elmwood Ave', built: 'Concrete · 3 floors · built 1983', walk: 'Elmwood Station south exit · 1 min walk', feat: 'Studio · suits an office too', rent: '$600', dep: '1 month', fee: '$20 / mo', rooms: [1, 2] },
  { title: 'APARTMENTS FOR RENT', addr: '7 Maple Creek Rd, 3rd floor', built: 'Steel frame · 5 floors · 30 yrs', walk: 'Elmwood Station south exit · 2 min walk', feat: 'South-facing · near shops · laundry inside', rent: '$830', dep: '1 month', fee: '$100 / mo', rooms: [3, 4], plan: true },
  { title: 'APARTMENTS FOR RENT', addr: '8 Maple Creek Rd', built: 'Steel frame · 3 floors · built 1986', walk: 'Elmwood Station south exit · 3 min walk', feat: 'Washer space outside · cleaning on move-out', rent: '$490 (1F) · $510 (2F)', dep: 'none', fee: 'no fees', rooms: [5], plan: true, map: true },
  { title: 'TOWNHOUSE FOR RENT', addr: '14 Flower Rd', built: 'Wood frame · 2 floors · 2 rooms + kitchen', walk: 'Elmwood Station · 7 min walk', feat: 'Quiet street, sunny and tidy', rent: '$480', dep: '1 month', fee: 'A/C included', rooms: [3, 4], plan: true },
  { title: 'ELMWOOD APTS III', addr: '1206 Elmwood Ave', built: 'Concrete · 4 floors · built 1998', walk: 'Elmwood Station · 5 min walk', feat: '1 bed · new flooring · pets OK', rent: '$700', dep: '1 month', fee: '$30 / mo', rooms: [0, 1] },
];
function draw(x, w, h, d) {
  // water-photo header: deep blue with light caustic ripples
  const hg = x.createLinearGradient(0, 0, 0, 120); hg.addColorStop(0, '#2a6ac8'); hg.addColorStop(1, '#5ab0e8'); x.fillStyle = hg; x.fillRect(0, 0, w, 120);
  for (let i = 0; i < 90; i++) { x.strokeStyle = `rgba(255,255,255,${0.08 + Math.random() * 0.2})`; x.lineWidth = 1 + Math.random() * 2; x.beginPath(); const y = Math.random() * 120; x.moveTo(Math.random() * w, y); x.bezierCurveTo(Math.random() * w, y + 10, Math.random() * w, y - 10, Math.random() * w, y + Math.random() * 8); x.stroke(); }
  x.lineJoin = 'round'; x.strokeStyle = '#7a5a10'; x.lineWidth = 6; x.fillStyle = '#f6d84a'; fitText(x, d.title, w / 2, 66, w - 60, 86, F.heavy, { spacing: 6, stroke: 1 });
  x.fillStyle = '#ffffff'; x.fillRect(0, 120, w, h - 120);
  // address + build line, pink walk line, feature line
  x.textAlign = 'left'; x.fillStyle = '#111'; x.font = `bold 22px ${F.small}`; x.fillText(d.addr, 24, 152);
  x.fillStyle = '#555'; x.font = `16px ${F.small}`; x.fillText(d.built, 24, 176);
  x.fillStyle = '#d83a8a'; x.font = `bold 22px ${F.small}`; x.fillText(d.walk, 24, 206); x.fillRect(24, 210, x.measureText(d.walk).width, 2);
  x.fillStyle = '#2a5ab8'; x.font = `18px ${F.small}`; x.fillText(d.feat, 24, 236);
  // yellow amenity tags
  ['Near station', 'Shops', 'South', 'A/C', 'Balcony', 'Bath+WC'].forEach((t, i) => { const tx = 24 + (i % 6) * 78; x.fillStyle = '#f2e27a'; x.fillRect(tx, 248, 72, 26); x.fillStyle = '#333'; x.font = `13px ${F.small}`; x.fillText(t, tx + 6, 266); });
  // rent block
  x.fillStyle = '#111'; x.font = `bold 34px ${F.small}`; x.fillText(`Rent: ${d.rent}`, 24, 324);
  x.font = `bold 24px ${F.small}`; x.fillText(`Deposit: ${d.dep}`, 24, 360); x.fillText(`Fees: ${d.fee}`, 24, 392);
  x.font = `14px ${F.small}`; x.fillStyle = '#444'; x.fillText('Move-out cleaning charged · ask inside', 24, 418);
  // floor plan / map
  if (d.plan) { x.strokeStyle = '#222'; x.lineWidth = 2; x.strokeRect(28, 440, 150, 120); x.beginPath(); x.moveTo(28, 500); x.lineTo(118, 500); x.moveTo(118, 440); x.lineTo(118, 560); x.moveTo(60, 500); x.lineTo(60, 560); x.stroke(); x.font = `11px ${F.small}`; x.fillStyle = '#333'; x.fillText('LDK', 60, 474); x.fillText('Bed', 136, 520); x.fillText('Bath', 34, 530); }
  if (d.map) { x.fillStyle = '#eef0e8'; x.fillRect(196, 440, 160, 120); x.strokeStyle = '#c8c8c0'; x.lineWidth = 3; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(196, 450 + i * 26); x.lineTo(356, 470 + i * 20); x.stroke(); } x.strokeStyle = '#e8708a'; x.lineWidth = 5; x.beginPath(); x.moveTo(200, 540); x.lineTo(350, 450); x.stroke(); x.fillStyle = '#d82a2a'; x.beginPath(); x.arc(300, 500, 7, 0, 7); x.fill(); }
  // room photos on the right
  d.rooms.forEach((ri, k) => { const im = ROOMS[ri]; const px = w - 300, py = 140 + k * 220; if (im.naturalWidth) x.drawImage(im, px, py, 276, 207); x.strokeStyle = '#ccc'; x.lineWidth = 2; x.strokeRect(px, py, 276, 207); });
  // footer with the made-up agency + 555 number
  x.fillStyle = '#2a5ab8'; x.fillRect(0, h - 34, w, 34); x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = `bold 16px ${F.small}`; x.fillText('MAPLE CREEK PROPERTIES · (555) 018-3365 · open 10–7, closed Wed', w / 2, h - 12);
}
export function makeListingFlyer(i = 0) {
  const c = document.createElement('canvas'); c.width = 840; c.height = 594; const x = c.getContext('2d');
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const d = DATA[i % DATA.length]; draw(x, 840, 594, d); roomsReady.then(() => { draw(x, 840, 594, d); t.needsUpdate = true; });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.297), new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.55, roughness: 0.4 }));
  m.name = 'listing_flyer'; return m;
}
export function makeRealtyWindow() {
  const g = new THREE.Group(); g.name = 'realty_window';
  const W = 3.2, H = 3.0;
  const dark = std({ color: '#202224', roughness: 0.4, metalness: 0.4 }), wall = std({ color: '#d8d2c4', roughness: 0.9 });
  box(W + 0.6, H + 0.8, 0.25, wall, 0, (H + 0.8) / 2, -0.15, g);
  // window opening: dark interior behind, frame, glass
  const inner = new THREE.Mesh(new THREE.PlaneGeometry(W, 2.2), std({ color: '#141518', roughness: 0.9 })); inner.position.set(0, 1.5, -0.02); g.add(inner);
  for (const x of [-W / 2, -0.525, 0.525, W / 2]) box(0.06, 2.3, 0.08, dark, x, 1.5, 0.0, g);
  for (const y of [0.38, 2.62]) box(W + 0.06, 0.06, 0.08, dark, 0, y, 0.0, g);
  // steel display frames with back-lit flyers (2 x 3), on wires
  const steel = std({ color: '#b8bcc0', metalness: 0.7, roughness: 0.3 });
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
    const fx = -1.05 + c * 1.05, fy = 2.0 - r * 0.5;
    box(0.46, 0.335, 0.02, steel, fx, fy, -0.005, g);
    const f = makeListingFlyer(r * 3 + c); f.position.set(fx, fy, 0.007); g.add(f);
    for (const s of [-1, 1]) box(0.004, 0.4, 0.004, steel, fx + s * 0.2, fy + 0.37, -0.005, g);
  }
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(W, 2.2), new THREE.MeshStandardMaterial({ color: '#cfe0e6', transparent: true, opacity: 0.12, roughness: 0.04, depthWrite: false })); glass.position.set(0, 1.5, 0.04); g.add(glass);
  const glow = new THREE.PointLight('#f4f8ff', 1.2, 3.5, 2); glow.position.set(0, 1.8, 0.8); g.add(glow);
  // fascia
  const fc = document.createElement('canvas'); fc.width = 1024; fc.height = 160; const x = fc.getContext('2d'); x.fillStyle = '#1d4a2a'; x.fillRect(0, 0, 1024, 160); x.fillStyle = '#f2ead0'; fitText(x, 'MAPLE CREEK PROPERTIES', 512, 70, 940, 70, F.roman, { spacing: 8 }); x.fillStyle = '#c8b88a'; fitText(x, 'RENTALS · SALES · MANAGEMENT', 512, 128, 700, 28, F.wayfind, { spacing: 6 });
  const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace;
  const fas = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.3, 0.48), std({ map: ft, emissive: '#ffffff', emissiveMap: ft, emissiveIntensity: 0.3 })); fas.position.set(0, H + 0.2, 0.0); g.add(fas);
  g.userData.collider = [-W / 2 - 0.3, W / 2 + 0.3, -0.3, 0.05];
  return g;
}
