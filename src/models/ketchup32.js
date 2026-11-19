// Ketchup squeeze bottle (queue item 32, photos/food/ketchup-front, -back, -side). Made-up store brand
// ("Sunny Fields"), made-up nutrition panel, no barcode.
//   makeKetchupBottle()  a 14 oz upside-up squeeze bottle: oval glossy red PET body (wider than deep, flattening
//   toward the base like the photos, round at the neck), a shoulder taper with dot-printed best-by code,
//   the red neck band, the front label (brand badge, white oval with the name, a bowl of ketchup), the back
//   nutrition label, a neck flange and a white flip cap with a dried ketchup smear.
//   Origin at the base centre; front faces +z. Height ~20.5 cm.
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const H = 0.205;          // full height incl. cap
const BH = 0.176;         // bottle (to the top of the neck)
// profile radius (x half-width) at height y, and the depth factor (z radius / x radius)
function rad(y) {
  if (y < 0.006) return 0.036 + 0.004 * Math.sin((y / 0.006) * Math.PI / 2);                // rounded foot
  if (y < 0.108) return 0.04 - 0.0012 * Math.sin(((y - 0.006) / 0.102) * Math.PI);           // slight waist
  if (y < 0.162) { const t = (y - 0.108) / 0.054; return 0.04 - (0.04 - 0.0165) * (t * t * (3 - 2 * t)); }   // shoulder
  if (y < 0.168) return 0.0165;
  if (y < 0.171) return 0.019;                                                               // flange
  return 0.0158;                                                                              // threaded neck under the cap
}
function depth(y) { const t = Math.min(1, Math.max(0, (y - 0.11) / 0.05)); return 0.6 + 0.4 * t * t; }

// a closed surface of revolution with an oval section; u = around (front centre at u = 0.5), v = y / BH
function bottleGeometry(scale = 1, y0 = 0, y1 = BH, rings = 120, segs = 72) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= rings; i++) {
    const y = y0 + (y1 - y0) * (i / rings), r = rad(y) * scale, d = depth(y);
    for (let j = 0; j <= segs; j++) {
      const u = j / segs, th = (u - 0.5) * Math.PI * 2;
      pos.push(Math.sin(th) * r, y, Math.cos(th) * r * d); uv.push(u, y / BH);
    }
  }
  for (let i = 0; i < rings; i++) for (let j = 0; j < segs; j++) { const a = i * (segs + 1) + j, b = a + segs + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

function labelTexture() {
  const W = 2048, Hh = 1792, c = document.createElement('canvas'); c.width = W; c.height = Hh; const x = c.getContext('2d');
  const vy = (y) => Hh - (y / BH) * Hh;                     // height in m -> canvas y
  const ux = (u) => u * W;
  // ---- neck band (full wrap) y 0.118 .. 0.152, overlapped seam at the back
  x.fillStyle = '#e2392f'; x.fillRect(0, vy(0.152), W, vy(0.118) - vy(0.152));
  x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(0, vy(0.152), W, 6);
  x.fillStyle = '#ffffff'; fitText(x, '14', ux(0.5), vy(0.1405), 170, 150, F.heavy); fitText(x, 'Ounce', ux(0.5), vy(0.125), 200, 60, F.label);
  x.fillStyle = 'rgba(120,20,15,0.35)'; x.fillRect(ux(0.02), vy(0.152), 4, vy(0.118) - vy(0.152));
  // ---- best-by code dot-printed on the front shoulder
  x.fillStyle = 'rgba(40,6,4,0.75)'; x.font = `40px ${F.led}`; x.textAlign = 'center';
  x.fillText('BEST BY 05 JUN 26', ux(0.5), vy(0.108)); x.fillText('L2 0517 14:32', ux(0.5), vy(0.103));
  // ---- front label: u 0.36 .. 0.64, y 0.014 .. 0.088
  const fx0 = ux(0.36), fx1 = ux(0.64), fy0 = vy(0.088), fy1 = vy(0.014), fw = fx1 - fx0, fh = fy1 - fy0;
  const rr = (X, Y, w, h, r) => { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); };
  const g = x.createLinearGradient(fx0, 0, fx1, 0); g.addColorStop(0, '#c81f1a'); g.addColorStop(0.5, '#e2372c'); g.addColorStop(1, '#c81f1a');
  x.fillStyle = g; rr(fx0, fy0, fw, fh, 26); x.fill();
  // tomatoes on the vine (left), a bowl of ketchup (bottom right)
  for (const [tx, ty, tr] of [[fx0 + 70, fy0 + 210, 46], [fx0 + 30, fy0 + 350, 38]]) { const tg = x.createRadialGradient(tx - 12, ty - 14, 4, tx, ty, tr); tg.addColorStop(0, '#ff7a5a'); tg.addColorStop(1, '#a8150f'); x.fillStyle = tg; x.beginPath(); x.arc(tx, ty, tr, 0, 7); x.fill(); x.fillStyle = '#2f7a2a'; for (let k = 0; k < 5; k++) { const a = k * 1.26; x.beginPath(); x.ellipse(tx + Math.cos(a) * 9, ty - tr + 6 + Math.sin(a) * 5, 10, 4, a, 0, 7); x.fill(); } }
  const bx = fx1 - 110, by = fy1 - 149; x.fillStyle = '#f4efe6'; x.beginPath(); x.ellipse(bx, by, 95, 52, 0, 0, 7); x.fill(); x.fillStyle = '#b81812'; x.beginPath(); x.ellipse(bx, by - 6, 78, 38, 0, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,0.35)'; x.beginPath(); x.ellipse(bx - 26, by - 18, 22, 8, -0.2, 0, 7); x.fill();
  // brand badge (made up): blue circle with a sun
  const cx = (fx0 + fx1) / 2, by0 = fy0 + 140;
  x.fillStyle = '#1b5fb3'; x.beginPath(); x.arc(cx, by0, 62, 0, 7); x.fill(); x.strokeStyle = '#ffffff'; x.lineWidth = 6; x.stroke();
  x.fillStyle = '#ffd23a'; x.beginPath(); x.arc(cx, by0 - 16, 16, 0, 7); x.fill(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; x.fillRect(cx + Math.cos(a) * 22 - 2, by0 - 16 + Math.sin(a) * 22 - 2, 5, 5); }
  x.fillStyle = '#fff'; fitText(x, 'Sunny Fields', cx, by0 + 22, 104, 22, F.rounded);
  // white oval with the name
  x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(cx, fy0 + 429, 170, 92, 0, 0, 7); x.fill();
  x.fillStyle = '#c81f1a'; fitText(x, 'Tomato', cx, fy0 + 359, 220, 58, F.rounded); fitText(x, 'Ketchup', cx, fy0 + 469, 300, 82, F.rounded);
  x.fillStyle = '#ffffff'; x.textAlign = 'left'; x.font = `22px ${F.small}`;
  ['No artificial colors,', 'flavors or preservatives'].forEach((t, k) => x.fillText(t, fx0 + 26, fy0 + 656 + k * 40));
  x.font = `24px ${F.label}`; x.fillText('NET WT 14 OZ (396 g)', fx0 + 26, fy1 - 46);
  // ---- back label: centred on u = 0 (wraps the seam), u -0.13 .. 0.13, y 0.016 .. 0.07
  const back = (ox) => {
    const bx0 = ox - ux(0.13), bw = ux(0.26), byy0 = vy(0.07), bh = vy(0.016) - vy(0.07);
    x.fillStyle = '#d9342a'; rr(bx0, byy0, bw, bh, 18); x.fill();
    x.fillStyle = '#ffffff'; x.fillRect(bx0 + 18, byy0 + 28, bw - 36, bh * 0.36);
    x.fillStyle = '#111'; x.textAlign = 'left'; x.font = `bold 30px ${F.small}`; x.fillText('Nutrition Facts', bx0 + 30, byy0 + 88);
    x.font = `20px ${F.small}`;
    ['Servings about 23 · Serv. size 1 Tbsp (17 g)', 'Calories 20 · Total Fat 0 g (0%) · Sodium 160 mg (7%)', 'Total Carb. 5 g (2%) · Total Sugars 4 g · Protein 0 g'].forEach((t, k) => x.fillText(t, bx0 + 30, byy0 + 144 + k * 40));
    x.fillStyle = '#ffffff'; x.font = `18px ${F.small}`;
    ['INGREDIENTS: TOMATO CONCENTRATE, VINEGAR, SUGAR, SALT,', 'ONION POWDER, SPICE, NATURAL FLAVOR.', 'Distributed by Sunny Fields Foods · refrigerate after opening'].forEach((t, k) => x.fillText(t, bx0 + 30, byy0 + bh * 0.36 + 50 + k * 40));
    // recycle mark where a barcode would be
    x.strokeStyle = '#ffffff'; x.lineWidth = 5; const rx = bx0 + bw - 80, ry = byy0 + bh - 70;
    for (let k = 0; k < 3; k++) { const a = k * 2.09 - 1.57; x.beginPath(); x.arc(rx, ry, 30, a + 0.3, a + 1.7); x.stroke(); }
    x.fillStyle = '#fff'; x.font = `18px ${F.label}`; x.textAlign = 'center'; x.fillText('1', rx, ry + 7);
  };
  back(0); back(W);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

export function makeKetchupBottle() {
  const g = new THREE.Group(); g.name = 'ketchup_bottle';
  // the bottle: glossy translucent-looking red (ketchup inside), clear-coated
  const pet = new THREE.MeshPhysicalMaterial({ color: '#7e0f09', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06, sheen: 0.4, sheenColor: new THREE.Color('#ff4a30') });
  const body = new THREE.Mesh(bottleGeometry(1), pet); body.castShadow = body.receiveShadow = true; g.add(body);
  const base = new THREE.Mesh(new THREE.CircleGeometry(1, 48), pet); base.rotation.x = -Math.PI / 2; base.scale.set(0.036, 0.036 * 0.6, 1); base.position.y = 0.0005; g.add(base);
  // the empty headspace in the neck reads lighter and see-through
  const head = new THREE.Mesh(bottleGeometry(1.002, 0.152, 0.168, 16), new THREE.MeshPhysicalMaterial({ color: '#c8402e', roughness: 0.15, transparent: true, opacity: 0.55, clearcoat: 1 }));
  g.add(head);
  // labels: the same surface a hair larger, alpha-cut to the printed areas
  const lt = labelTexture();
  const label = new THREE.Mesh(bottleGeometry(1.006, 0.012, 0.155, 90), new THREE.MeshStandardMaterial({ map: lt, transparent: true, alphaTest: 0.4, roughness: 0.35 }));
  label.material.map.offset.set(0, 0); g.add(label);
  // flip cap: white, a slightly domed lid with a hinge band at the back and a thumb lip at the front
  const white = new THREE.MeshStandardMaterial({ color: '#f2f0ea', roughness: 0.35 });
  const capPts = [[0, BH - 0.004], [0.0205, BH - 0.004], [0.0212, BH], [0.0212, BH + 0.02], [0.0205, BH + 0.0255], [0.012, BH + 0.0285], [0, BH + 0.029]].map(([a, b]) => new THREE.Vector2(a, b));
  const cap = new THREE.Mesh(new THREE.LatheGeometry(capPts, 48), white); cap.castShadow = true; g.add(cap);
  const seam = new THREE.Mesh(new THREE.TorusGeometry(0.0213, 0.0005, 6, 48), new THREE.MeshStandardMaterial({ color: '#9a978e' })); seam.rotation.x = Math.PI / 2; seam.position.y = BH + 0.017; g.add(seam);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.003, 0.004), white); lip.position.set(0, BH + 0.0165, 0.0218); g.add(lip);
  const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.006, 0.003), white); hinge.position.set(0, BH + 0.016, -0.0218); g.add(hinge);
  // dried ketchup smear running from the spout over the lid edge
  const sc = document.createElement('canvas'); sc.width = sc.height = 128; const s = sc.getContext('2d');
  s.fillStyle = 'rgba(150,30,15,0.9)'; s.beginPath(); s.ellipse(64, 40, 22, 10, 0.2, 0, 7); s.fill(); s.beginPath(); s.ellipse(78, 20, 10, 18, 0.5, 0, 7); s.fill();
  s.fillStyle = 'rgba(170,50,25,0.5)'; s.beginPath(); s.ellipse(60, 52, 30, 8, 0, 0, 7); s.fill();
  const st = new THREE.CanvasTexture(sc); st.colorSpace = THREE.SRGBColorSpace;
  const smear = new THREE.Mesh(new THREE.CircleGeometry(0.0195, 32), new THREE.MeshStandardMaterial({ map: st, transparent: true, roughness: 0.6, depthWrite: false }));
  smear.rotation.x = -Math.PI / 2; smear.position.y = BH + 0.0292; g.add(smear);
  return g;
}
