// Delivery / take-out props from the door and car photos. Every brand is made up.
//   makeDeliveryBag()   red insulated delivery tote, black strap handles ("QUICKDROP")
//   makePlasticBag(o)   white T-shirt bag, tied-up look, optional logo + receipt, optional paper bag inside
//   makePaperBag(o)     kraft take-out bag with folded top, printed pattern + stapled receipt
//   makeCupCarrier()    moulded-pulp 4-cup carrier with three iced drinks
//   makeCup(kind)       'fountain' (white w/ orange logo), 'smoothie' (clear, red band, pink drink), 'tumbler' (black)
//   makeTote()          convenience-store reusable tote ("QUIK 24")
//   makeTrashBag()      black plastic bag knotted at the top
//   makeDeliBox()       open cardboard box with soup tubs and a container
//   makeSoilBag()       bag of top soil ("GREEN ACRE")
//   makeSodaBottle()    20 oz green citrus soda ("ZING")
import * as THREE from 'three';

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.7, ...o });
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};
// rumple a geometry's vertices a little (plastic / paper)
function rumple(geo, amt, seed, keepBottom = true) {
  const p = geo.attributes.position, r = rng(seed);
  const bb = new THREE.Box3().setFromBufferAttribute(p);
  const cache = new Map();
  for (let i = 0; i < p.count; i++) {
    const key = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
    let d = cache.get(key);
    if (!d) { d = [(r() - 0.5) * amt, (r() - 0.5) * amt, (r() - 0.5) * amt]; cache.set(key, d); }
    const t = keepBottom ? (p.getY(i) - bb.min.y) / (bb.max.y - bb.min.y) : 1;
    p.setXYZ(i, p.getX(i) + d[0] * t, p.getY(i) + d[1] * t, p.getZ(i) + d[2] * t);
  }
  geo.computeVertexNormals();
  return geo;
}
function receipt(x, y, z, ry = 0) {
  const t = canvasTex(64, 192, (c, w, h) => {
    c.fillStyle = '#f6f5f0'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#444'; for (let i = 0; i < 16; i++) c.fillRect(6, 10 + i * 11, 20 + ((i * 37) % 30), 3);
    c.fillRect(6, h - 22, w - 12, 6);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.2), std({ map: t, side: THREE.DoubleSide, roughness: 0.9 }));
  m.position.set(x, y, z); m.rotation.y = ry;
  return m;
}

export function makeDeliveryBag() {
  const g = new THREE.Group();
  const logo = canvasTex(256, 192, (c, w, h) => {
    c.fillStyle = '#e8332a'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < w; i += 6) for (let j = 0; j < h; j += 6) c.fillRect(i, j, 2, 2);   // mesh weave
    c.save(); c.translate(w / 2, h / 2); c.rotate(-0.5);
    c.fillStyle = '#fff'; c.font = '38px "Archivo Black"'; c.textAlign = 'center'; c.fillText('QUICKDROP', 10, 14);
    c.beginPath(); c.moveTo(-105, 0); c.lineTo(-80, -14); c.lineTo(-80, 14); c.fill();
    c.restore();
  });
  const red = std({ map: logo, roughness: 0.75 });
  const plain = std({ color: '#e5322a', roughness: 0.75 });
  const body = box(0.42, 0.34, 0.3, [plain, plain, plain, plain, red, plain], 0, 0.17, 0);
  body.geometry = rumple(body.geometry.clone(), 0.01, 3);
  g.add(body);
  g.add(box(0.44, 0.03, 0.32, std({ color: '#c92a22' }), 0, 0.345, 0));      // zip lid
  const strap = std({ color: '#1c1c1d', roughness: 0.8 });
  for (const s of [-1, 1]) {
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 6, 16, Math.PI), strap);
    h.position.set(0, 0.35, s * 0.07); g.add(h);
  }
  return g;
}

export function makePlasticBag({ logo = null, seed = 1, withPaper = false, tint = '#f4f4f2' } = {}) {
  const g = new THREE.Group();
  const tex = logo === 'wings' ? canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = tint; c.fillRect(0, 0, w, h);
    c.fillStyle = '#f5c21a'; c.beginPath(); c.ellipse(w / 2, h * 0.55, 80, 74, 0, 0, 7); c.fill();
    c.fillStyle = '#1b1b1b'; c.beginPath(); c.ellipse(w / 2, h * 0.55, 62, 56, 0, 0, 7); c.fill();
    c.fillStyle = '#f5c21a'; c.font = '30px "Bungee"'; c.textAlign = 'center'; c.fillText('WING', w / 2, h * 0.53); c.fillText('BARN', w / 2, h * 0.53 + 32);
  }) : null;
  const mat = new THREE.MeshStandardMaterial({ color: tex ? '#ffffff' : tint, map: tex, roughness: 0.45, side: THREE.DoubleSide, transparent: !tex, opacity: tex ? 1 : 0.92 });
  // body: a tapered, puffy box
  const geo = new THREE.BoxGeometry(0.36, 0.34, 0.22, 6, 6, 4);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) + 0.17, t = y / 0.34;
    const bulge = 1 + 0.18 * Math.sin(Math.PI * Math.min(1, t * 1.1));
    p.setXYZ(i, p.getX(i) * bulge * (1 - 0.15 * t), p.getY(i), p.getZ(i) * bulge * (1 - 0.35 * t));
  }
  const plainMat = new THREE.MeshStandardMaterial({ color: tint, roughness: 0.45, side: THREE.DoubleSide });
  const body = new THREE.Mesh(rumple(geo, 0.025, seed), tex ? [plainMat, plainMat, plainMat, plainMat, mat, plainMat] : mat);
  body.position.y = 0.17; body.castShadow = true;
  g.add(body);
  // gathered top + two loop handles
  for (const s of [-1, 1]) {
    const hg = new THREE.TorusGeometry(0.06, 0.02, 6, 12, Math.PI);
    const h = new THREE.Mesh(hg, mat); h.position.set(s * 0.1, 0.35, 0); h.scale.set(1, 1.4, 0.6); h.rotation.z = s * 0.15; g.add(h);
  }
  if (withPaper) { const pb = box(0.22, 0.12, 0.14, std({ color: '#b98d5a' }), 0.0, 0.36, 0); pb.rotation.y = 0.3; g.add(pb); }
  if (logo) g.add(receipt(0.05, 0.27, 0.13, 0.05));
  return g;
}

export function makePaperBag({ pattern = 'tacos', seed = 2 } = {}) {
  const g = new THREE.Group();
  const tex = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#b8895a'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(80,50,20,0.12)'; for (let i = 0; i < 400; i++) c.fillRect((i * 97) % w, (i * 53) % h, 2, 6);
    if (pattern === 'tacos') {
      const cols = ['#8e3fa8', '#e86aa8', '#f2c23a'];
      for (let i = 0; i < 9; i++) { c.fillStyle = cols[i % 3]; c.beginPath(); c.moveTo(20 + (i % 3) * 80, 30 + Math.floor(i / 3) * 70); c.lineTo(70 + (i % 3) * 80, 10 + Math.floor(i / 3) * 70); c.lineTo(60 + (i % 3) * 80, 70 + Math.floor(i / 3) * 70); c.fill(); }
      c.fillStyle = '#fff'; c.font = '36px "Shrikhand"'; c.textAlign = 'center'; c.fillText('TACO NOVA', w / 2, h - 30);
    }
  });
  const kraft = std({ map: tex, roughness: 0.95 });
  const plain = std({ color: '#b8895a', roughness: 0.95 });
  const b = box(0.26, 0.3, 0.16, [plain, plain, plain, plain, kraft, plain], 0, 0.15, 0);
  b.geometry = rumple(b.geometry.clone(), 0.008, seed);
  g.add(b);
  const top = box(0.27, 0.08, 0.05, plain, 0, 0.33, 0); top.rotation.x = 0.2; g.add(top);   // folded-over top
  g.add(receipt(0.04, 0.24, 0.085, 0));
  return g;
}

function lathe(pts, mat, seg = 18) {
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), seg), mat);
  m.castShadow = true;
  return m;
}
export function makeCup(kind = 'fountain') {
  const g = new THREE.Group();
  const h = kind === 'tumbler' ? 0.2 : 0.16;
  if (kind === 'fountain') {
    const t = canvasTex(256, 128, (c, w, hh) => {
      c.fillStyle = '#f6f4ef'; c.fillRect(0, 0, w, hh);
      c.fillStyle = '#e8762a'; c.beginPath(); c.ellipse(w * 0.25, hh / 2, 34, 30, 0, 0, 7); c.fill();
      c.fillStyle = '#c8322a'; c.font = '600 19px "Fredoka"'; c.textAlign = 'center'; c.fillText('BUN', w * 0.25, hh / 2 - 2); c.fillText('KING', w * 0.25, hh / 2 + 16);
      c.fillStyle = '#e8762a'; c.beginPath(); c.ellipse(w * 0.75, hh / 2, 34, 30, 0, 0, 7); c.fill();
    });
    g.add(lathe([[0, 0], [0.038, 0], [0.05, h], [0, h]], std({ map: t, roughness: 0.5, side: THREE.DoubleSide })));
    g.add(lathe([[0, h + 0.012], [0.052, h + 0.004], [0.052, h], [0, h]], std({ color: '#f0eee8', roughness: 0.4, side: THREE.DoubleSide })));
  } else if (kind === 'smoothie' || kind === 'iced') {
    const drink = kind === 'smoothie' ? '#e86a6a' : '#5fd8b0';
    g.add(lathe([[0, 0], [0.034, 0], [0.046, h], [0, h]], new THREE.MeshStandardMaterial({ color: '#eef4f6', transparent: true, opacity: 0.35, roughness: 0.1, side: THREE.DoubleSide })));
    g.add(lathe([[0, 0.004], [0.031, 0.004], [0.042, h * 0.85], [0, h * 0.85]], std({ color: drink, roughness: 0.3, emissive: drink, emissiveIntensity: 0.12 })));
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.047, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#f2f6f8', transparent: true, opacity: 0.45, roughness: 0.1 }));
    dome.position.y = h; dome.scale.y = 0.5; g.add(dome);
    if (kind === 'smoothie') { const band = lathe([[0.04, h * 0.25], [0.043, h * 0.25], [0.043, h * 0.75], [0.04, h * 0.75]], std({ color: '#d0242c', side: THREE.DoubleSide })); band.scale.set(1.0, 1, 1.0); g.add(band); }
    const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.12, 6), std({ color: kind === 'iced' ? '#2a6b3a' : '#f4f4f0' })); straw.position.set(0.01, h + 0.04, 0); straw.rotation.z = 0.1; g.add(straw);
  } else {   // black insulated tumbler
    g.add(lathe([[0, 0], [0.036, 0], [0.04, h], [0, h]], std({ color: '#151517', roughness: 0.35, metalness: 0.4 })));
    g.add(lathe([[0, h + 0.02], [0.042, h + 0.01], [0.042, h], [0, h]], std({ color: '#222', roughness: 0.4 })));
  }
  return g;
}

export function makeCupCarrier() {
  const g = new THREE.Group();
  const pulp = std({ color: '#cfc6b0', roughness: 1 });
  g.add(box(0.24, 0.05, 0.24, pulp, 0, 0.025, 0));
  g.add(box(0.03, 0.1, 0.24, pulp, 0, 0.07, 0), box(0.24, 0.1, 0.03, pulp, 0, 0.07, 0));
  for (const [x, z] of [[-0.06, -0.06], [0.06, -0.06], [-0.06, 0.06]]) { const c = makeCup('iced'); c.position.set(x, 0.01, z); g.add(c); }
  return g;
}

export function makeTote() {
  const g = new THREE.Group();
  const t = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#f2efe4'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(40,120,70,0.35)'; c.font = '34px "Archivo Black"'; for (let i = 0; i < 4; i++) c.strokeText('QUIK 24', 20, 50 + i * 60);
    c.fillStyle = '#e8622a'; c.fillRect(w / 2 - 34, 70, 68, 90);
    c.fillStyle = '#fff'; c.font = '60px "Archivo Black"'; c.textAlign = 'center'; c.fillText('24', w / 2, 135);
    c.fillStyle = '#2a7a4a'; c.font = '600 20px "Oswald"'; c.fillText('STORE TO DOOR', w / 2, 225);
  });
  const m = std({ map: t, roughness: 0.9 });
  const plain = std({ color: '#f2efe4', roughness: 0.9 });
  const b = box(0.32, 0.36, 0.14, [plain, plain, plain, plain, m, plain], 0, 0.18, 0);
  b.geometry = rumple(b.geometry.clone(), 0.012, 5); g.add(b);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.01, 6, 16, Math.PI), std({ color: '#e8e4d8' }));
  handle.position.set(0, 0.36, 0); g.add(handle);
  return g;
}

export function makeTrashBag() {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.22, 16, 12);
  geo.scale(1, 1.15, 0.85);
  const m = new THREE.Mesh(rumple(geo, 0.05, 8, false), std({ color: '#111113', roughness: 0.3, metalness: 0.1 }));
  m.position.y = 0.24; m.castShadow = true; g.add(m);
  const knot = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 8), std({ color: '#111113', roughness: 0.3 })); knot.position.y = 0.53; g.add(knot);
  for (const s of [-1, 1]) { const ear = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 6), std({ color: '#111113', roughness: 0.3 })); ear.position.set(s * 0.05, 0.6, 0); ear.rotation.z = -s * 0.8; g.add(ear); }
  return g;
}

export function makeDeliBox() {
  const g = new THREE.Group();
  const card = std({ color: '#b98d5a', roughness: 0.95 });
  const print = std({ roughness: 0.95, map: canvasTex(256, 96, (c, w, h) => { c.fillStyle = '#b98d5a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#a8322a'; c.lineWidth = 3; c.strokeRect(150, 15, 70, 66); c.fillStyle = '#a8322a'; c.font = '18px "Black Ops One"'; c.fillText('FRAGILE', 20, 50); }) });
  g.add(box(0.5, 0.02, 0.32, card, 0, 0.01, 0));
  g.add(box(0.5, 0.16, 0.01, print, 0, 0.09, 0.16), box(0.5, 0.16, 0.01, card, 0, 0.09, -0.16));
  for (const s of [-1, 1]) g.add(box(0.01, 0.16, 0.32, card, s * 0.25, 0.09, 0));
  const tub = std({ color: '#f2f0e8', roughness: 0.4 });
  for (const [x, y] of [[-0.1, 0.02], [-0.1, 0.12]]) { const t = lathe([[0, 0], [0.065, 0], [0.072, 0.1], [0, 0.1]], tub); t.position.set(x, y, 0); g.add(t); }
  const lid = lathe([[0, 0.226], [0.076, 0.226], [0.076, 0.22], [0, 0.22]], std({ color: '#e8e2c8', roughness: 0.3, side: THREE.DoubleSide })); lid.position.x = -0.1; g.add(lid);
  g.add(box(0.14, 0.06, 0.12, std({ color: '#e8dfb0', roughness: 0.3 }), 0.1, 0.05, 0.02));
  return g;
}

export function makeSoilBag() {
  const t = canvasTex(256, 384, (c, w, h) => {
    c.fillStyle = '#f2f1ec'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#2f8a3a'; c.fillRect(0, 90, w, 170);
    c.fillStyle = '#e8c23a'; c.font = '34px "Alfa Slab One"'; c.textAlign = 'center'; c.fillText('GREEN ACRE', w / 2, 60);
    c.fillStyle = '#fff'; c.font = '62px "Alfa Slab One"'; c.fillText('TOP', w / 2, 160); c.fillText('SOIL', w / 2, 220);
    c.fillStyle = '#2f8a3a'; c.font = '600 28px "Oswald"'; c.fillText('1 CU FT', w / 2, 310);
  });
  const geo = new THREE.BoxGeometry(0.42, 0.1, 0.62, 6, 2, 8);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) / 0.21, z = p.getZ(i) / 0.31; p.setY(i, p.getY(i) * (1 - 0.6 * Math.max(x * x, z * z * z * z))); }
  geo.computeVertexNormals();
  const plain = std({ color: '#f2f1ec', roughness: 0.6 });
  const m = new THREE.Mesh(geo, [plain, plain, std({ map: t, roughness: 0.6 }), plain, plain, plain]);
  m.position.y = 0.05; m.castShadow = true;
  const g = new THREE.Group(); g.add(m);
  return g;
}

export function makeSodaBottle() {
  const t = canvasTex(256, 64, (c, w, h) => {
    c.fillStyle = '#2f9a2a'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#e8f04a'; c.font = '42px "Righteous"'; c.fillText('ZING', 70, 46);
    c.fillStyle = '#d42a2a'; c.fillRect(0, 50, w, 6);
  });
  const g = new THREE.Group();
  g.add(lathe([[0, 0], [0.033, 0], [0.034, 0.13], [0.03, 0.15], [0.013, 0.2], [0.012, 0.215], [0, 0.215]], std({ color: '#5ac24a', transparent: true, opacity: 0.85, roughness: 0.15 }), 16));
  const label = lathe([[0.035, 0.06], [0.0355, 0.06], [0.0355, 0.12], [0.035, 0.12]], std({ map: t, side: THREE.DoubleSide }), 16); g.add(label);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.018, 12), std({ color: '#2a8a2a' })); cap.position.y = 0.222; g.add(cap);
  return g;
}
