// Old-town shopping street from the old-town day and night photos (28b).
//   makeShopHouse(o)   two-storey traditional shop: dark tiled roofs (eave over the ground floor
//                      and a main gable), white plaster upper wall, dark timber posts and lattice,
//                      black-and-white diamond tile skirting, glass shop front or wood shutters,
//                      noren curtain, hanging board sign (generic words), paper lantern
//   makeStreetLamp()   black post lamp with a curved arm and a lantern head (lit)
//   makeBollard(seed)  rough-cut granite block
//   makeMonkey()       stone monkey statue sitting on a rock base (sculpted, SDF)
//   makeBanner(col)    tall nobori banner flag on a pole
//   makeClockTower()   white plaster tower with a clock and small tiled roof
//   makeGreenPillar()  tall green sign pillar with a made-up logo
// Everything faces +z, origin at ground level.
import * as THREE from 'three';
import { ellipsoid, cone, smin, surfaceNets, v3 } from './cat.js';
import { fitText } from '../fonts.js';

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.8, ...o });
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};
const glowMat = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });

let M = null;
function mats() {
  if (M) return M;
  const tiles = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#3a3c40'; c.fillRect(0, 0, w, h);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const x = col * 32, y = row * 32;
        const g = c.createLinearGradient(x, 0, x + 32, 0); g.addColorStop(0, '#2c2e32'); g.addColorStop(0.5, '#4a4d52'); g.addColorStop(1, '#2c2e32');
        c.fillStyle = g; c.fillRect(x + 1, y, 30, 30);
      }
      c.fillStyle = '#1e1f22'; c.fillRect(0, row * 32 + 28, w, 4);
    }
  });
  const namako = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#25272b'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#ecebe6'; c.lineWidth = 7;
    for (let i = -4; i < 8; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64 + 256, 256); c.stroke(); c.beginPath(); c.moveTo(i * 64 + 256, 0); c.lineTo(i * 64, 256); c.stroke(); }
  });
  const lattice = canvasTex(128, 256, (c, w, h) => {
    c.fillStyle = '#3a2a1e'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1a120c'; for (let x = 6; x < w; x += 14) c.fillRect(x, 0, 5, h);
  });
  const plaster = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#ece6d8'; c.fillRect(0, 0, w, h);
    const r = rng(4); for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(90,80,60,${r() * 0.05})`; c.fillRect(r() * w, r() * h, 2, 2); }
  });
  M = {
    roof: std({ map: tiles, roughness: 0.6, metalness: 0.2 }),
    namako: std({ map: namako, roughness: 0.6 }),
    lattice: std({ map: lattice, roughness: 0.85 }),
    plaster: std({ map: plaster, roughness: 0.9 }),
    timber: std({ color: '#2e2219', roughness: 0.8 }),
    darkwood: std({ color: '#3d2d22', roughness: 0.75 }),
    stone: std({ color: '#b9b6ae', roughness: 0.95 }),
    black: std({ color: '#141516', roughness: 0.4, metalness: 0.5 }),
    glass: std({ color: '#2a2d30', roughness: 0.1, metalness: 0.3 }),
  };
  M.tiles = tiles;
  return M;
}

// ---------------------------------------------------------------- shop house
const SIGNS = ['茶', '菓子', 'そば', '甘味', '和紙', '漬物', '団子', '酒'];
export function makeShopHouse({ w = 6, d = 8, seed = 1, front = 'glass', sign = 0, noren = '#2a3a6a', lit = true } = {}) {
  const m = mats();
  const g = new THREE.Group();
  const r = rng(seed);
  const H1 = 3.0, H2 = 2.6;
  // body
  g.add(box(w, H1 + H2, d, m.plaster, 0, (H1 + H2) / 2, -d / 2));
  // diamond-tile skirting and timber posts on the ground floor front
  g.add(box(w, 0.6, 0.06, m.namako, 0, 0.3, 0.03));
  for (const x of [-w / 2 + 0.12, w / 2 - 0.12]) g.add(box(0.24, H1, 0.2, m.timber, x, H1 / 2, 0.05));
  // shop front
  const fw = w - 0.5;
  if (front === 'glass') {
    const gm = lit ? new THREE.MeshStandardMaterial({ color: '#f6e2b8', emissive: '#c89a58', emissiveIntensity: 0.9, roughness: 0.3 }) : m.glass;
    g.add(box(fw, H1 - 0.9, 0.05, gm, 0, 0.6 + (H1 - 0.9) / 2, 0.02));
    for (let i = 0; i <= 4; i++) g.add(box(0.06, H1 - 0.9, 0.08, m.timber, -fw / 2 + i * fw / 4, 0.6 + (H1 - 0.9) / 2, 0.05));
  } else {
    g.add(box(fw, H1 - 0.6, 0.05, m.lattice, 0, 0.6 + (H1 - 0.6) / 2, 0.02));
  }
  g.add(box(w, 0.18, 0.22, m.timber, 0, H1 - 0.1, 0.05));
  // eave roof over the ground floor (sloping tiled pent roof)
  const eave = box(w + 0.4, 0.08, 1.1, m.roof, 0, H1 + 0.25, 0.45); eave.rotation.x = 0.35; g.add(eave);
  g.add(box(w + 0.4, 0.12, 0.12, m.black, 0, H1 + 0.06, 0.95));
  // upper floor: plaster with a lattice window
  const ww = Math.min(2.6, w - 1.2);
  g.add(box(ww, 1.0, 0.06, m.lattice, (r() - 0.5) * 0.6, H1 + 1.6, 0.03));
  g.add(box(ww + 0.2, 0.08, 0.1, m.timber, 0, H1 + 1.06, 0.05));
  // main roof: gable facing the street
  const rise = 1.5, half = d / 2 + 0.3, sl = Math.hypot(rise, w / 2 + 0.3);
  const ang = Math.atan2(rise, w / 2 + 0.3);
  for (const s of [-1, 1]) {
    const rf = box(sl, 0.12, d + 0.6, m.roof, s * (w / 4 + 0.075), H1 + H2 + rise / 2, -d / 2);
    rf.rotation.z = -s * ang; g.add(rf);
  }
  const gable = new THREE.Shape(); gable.moveTo(-w / 2, 0); gable.lineTo(w / 2, 0); gable.lineTo(0, rise); gable.lineTo(-w / 2, 0);
  const gm2 = new THREE.Mesh(new THREE.ShapeGeometry(gable), m.plaster); gm2.position.set(0, H1 + H2, 0.005); g.add(gm2);
  g.add(box(0.12, rise * 0.8, 0.1, m.timber, 0, H1 + H2 + rise * 0.4, 0.03));
  // hanging board sign under the eave (generic word, vertical)
  const word = SIGNS[sign % SIGNS.length];
  const st = canvasTex(128, 320, (c, cw, ch) => {
    c.fillStyle = '#3a2516'; c.fillRect(0, 0, cw, ch);
    c.strokeStyle = '#c8a050'; c.lineWidth = 6; c.strokeRect(6, 6, cw - 12, ch - 12);
    c.fillStyle = '#f2e6c8'; const n = [...word].length, step = Math.min(110, (ch - 60) / n);
    [...word].forEach((ch2, i) => fitText(c, ch2, cw / 2, 30 + step * (i + 0.5), cw - 30, Math.min(96, step * 0.95), '"Yuji Syuku"'));
  });
  // hung from an iron arm off the corner post, edge-on to the street so it reads from up and down the road
  const armX = -w / 2 + 0.12;
  g.add(box(0.035, 0.035, 0.85, m.black, armX, H1 - 0.12, 0.5));
  const brace = box(0.02, 0.02, 0.5, m.black, armX, H1 - 0.3, 0.3); brace.rotation.x = 0.75; g.add(brace);
  const sb = box(0.06, 1.0, 0.42, [std({ map: st }), std({ map: st }), m.timber, m.timber, m.timber, m.timber], armX, H1 - 0.72, 0.68);
  g.add(sb);
  for (const dz of [-0.14, 0.14]) g.add(box(0.008, 0.1, 0.008, m.black, armX, H1 - 0.17, 0.68 + dz));
  // roof board standing on the eave, centred on the shop (horizontal brush lettering)
  const RW = Math.min(2.2, w - 2.2);
  const roofWord = ['甘味本舗', '和紙本舗', '菓子本舗', '茶本舗', '酒', 'そば', '団子', '漬物本舗'][sign % 8];
  const rt = canvasTex(1024, 192, (c, cw, ch) => {
    const gr = c.createLinearGradient(0, 0, 0, ch); gr.addColorStop(0, '#2e1e12'); gr.addColorStop(1, '#1e140c');
    c.fillStyle = gr; c.fillRect(0, 0, cw, ch);
    c.strokeStyle = '#b8903a'; c.lineWidth = 8; c.strokeRect(14, 14, cw - 28, ch - 28);
    c.fillStyle = '#e8c870';
    fitText(c, roofWord, cw / 2, ch / 2 + 6, cw - 140, 124, '"Yuji Syuku"', { spacing: 20 });
  });
  const rb = box(RW, RW * 192 / 1024, 0.07, [m.timber, m.timber, m.timber, m.timber, std({ map: rt, roughness: 0.6, emissive: '#3a2a10', emissiveMap: rt }), m.timber], 0, H1 + 0.74, 0.07);
  g.add(rb);
  
  // noren curtain over the door
  const nt = canvasTex(256, 128, (c, cw, ch) => {
    c.fillStyle = noren; c.fillRect(0, 0, cw, ch);
    c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.arc(cw / 2, ch / 2, 26, 0, 7); c.lineWidth = 6; c.strokeStyle = '#fff'; c.stroke();
    c.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = cw / 4; x < cw; x += cw / 4) c.fillRect(x, 30, 3, ch);
  });
  const nm = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), std({ map: nt, side: THREE.DoubleSide, roughness: 0.95 }));
  nm.position.set(0.6, H1 - 0.6, 0.18); g.add(nm);
  // paper lantern at the door
  const lan = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), glowMat(1.8, 0.6, 0.35));
  lan.scale.y = 1.4; lan.position.set(w / 2 - 0.5, H1 - 0.55, 0.6); g.add(lan);
  g.add(box(0.12, 0.05, 0.12, m.black, w / 2 - 0.5, H1 - 0.2, 0.6), box(0.12, 0.05, 0.12, m.black, w / 2 - 0.5, H1 - 0.9, 0.6));
  if (lit) { const l = new THREE.PointLight('#ffcf98', 3.5, 7, 1.5); l.position.set(0, 2.2, 1.4); g.add(l); }
  g.userData.collider = [-w / 2, w / 2, -d, 0.25];
  return g;
}

// ---------------------------------------------------------------- street furniture
export function makeStreetLamp() {
  const m = mats();
  const g = new THREE.Group();
  g.add(box(0.3, 0.2, 0.3, m.black, 0, 0.1, 0));
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 3.4, 10), m.black); pole.position.y = 1.8; pole.castShadow = true; g.add(pole);
  const arm = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 6, 16, Math.PI / 2), m.black);
  arm.position.set(0.3, 3.5, 0); arm.rotation.z = Math.PI / 2; g.add(arm);
  const lan = new THREE.Group();
  lan.add(box(0.3, 0.04, 0.3, m.black, 0, 0, 0));
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.12, 0.38, 6), glowMat(2.0, 1.75, 1.25)); glass.position.y = -0.22; lan.add(glass);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.16, 6), m.black); cap.position.y = 0.09; lan.add(cap);
  lan.position.set(0.6, 3.65, 0); g.add(lan);
  // a banner bracket below the lamp (day photo)
  const ban = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.95), std({ side: THREE.DoubleSide, map: canvasTex(128, 288, (c, w, h) => {
    c.fillStyle = '#f2f2f2'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a4aa8'; c.fillRect(0, 0, w, 70); c.fillStyle = '#d82a3a'; c.beginPath(); c.arc(w / 2, 170, 40, 0, 7); c.fill();
    c.fillStyle = '#2a4aa8'; c.font = '34px "Zen Antique"'; c.textAlign = 'center'; c.fillText('祭', w / 2, 50);
  }) }));
  ban.position.set(0.24, 2.3, 0); ban.rotation.y = Math.PI / 2; g.add(ban);
  g.add(box(0.5, 0.025, 0.025, m.black, 0.25, 2.8, 0));
  g.userData.lightAt = new THREE.Vector3(0.6, 3.4, 0);
  return g;
}
export function makeBollard(seed = 1) {
  const r = rng(seed);
  const geo = new THREE.BoxGeometry(0.42, 0.45, 0.42, 3, 3, 3);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + (r() - 0.5) * 0.03, p.getY(i) + (r() - 0.5) * 0.02, p.getZ(i) + (r() - 0.5) * 0.03);
  geo.computeVertexNormals();
  const tex = canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#c4c1b8'; c.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { c.fillStyle = ['#8f8c84', '#e2dfd6', '#6e6b64'][i % 3]; c.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); } });
  const mm = new THREE.Mesh(geo, std({ map: tex, roughness: 0.95, flatShading: true }));
  mm.position.y = 0.225; mm.rotation.y = r() * 0.5; mm.castShadow = true;
  const g = new THREE.Group(); g.add(mm);
  return g;
}

// stone monkey: one sculpted surface (SDF + surface nets), weathered grey stone
let monkeyGeo = null;
export function makeMonkey() {
  if (!monkeyGeo) {
    // seated monkey, hands on knees, big round head with a flat face mask (faces +x)
    const parts = [
      ellipsoid(v3(-0.03, 0.26, 0), v3(0.15, 0.2, 0.15)),            // torso
      ellipsoid(v3(-0.06, 0.13, 0), v3(0.17, 0.12, 0.17)),           // hips / haunches
      ellipsoid(v3(0.0, 0.38, 0), v3(0.13, 0.07, 0.17)),             // shoulders
      ellipsoid(v3(0.03, 0.55, 0), v3(0.125, 0.12, 0.125)),          // skull
      ellipsoid(v3(0.105, 0.53, 0), v3(0.05, 0.085, 0.085)),         // flat face mask
      ellipsoid(v3(0.14, 0.495, 0), v3(0.04, 0.035, 0.05)),          // muzzle
      ellipsoid(v3(0.105, 0.585, 0), v3(0.04, 0.02, 0.08)),          // brow ridge
      ellipsoid(v3(0.01, 0.56, 0.125), v3(0.025, 0.04, 0.03)),       // ears
      ellipsoid(v3(0.01, 0.56, -0.125), v3(0.025, 0.04, 0.03)),
      cone(v3(0.02, 0.38, 0.13), v3(0.1, 0.25, 0.12), 0.042, 0.035), // upper arms
      cone(v3(0.02, 0.38, -0.13), v3(0.1, 0.25, -0.12), 0.042, 0.035),
      cone(v3(0.1, 0.25, 0.12), v3(0.19, 0.22, 0.08), 0.035, 0.03),  // forearms to the knees
      cone(v3(0.1, 0.25, -0.12), v3(0.19, 0.22, -0.08), 0.035, 0.03),
      ellipsoid(v3(0.2, 0.22, 0.075), v3(0.035, 0.022, 0.035)),      // hands
      ellipsoid(v3(0.2, 0.22, -0.075), v3(0.035, 0.022, 0.035)),
      cone(v3(-0.02, 0.12, 0.09), v3(0.17, 0.18, 0.08), 0.06, 0.05), // thighs up to raised knees
      cone(v3(-0.02, 0.12, -0.09), v3(0.17, 0.18, -0.08), 0.06, 0.05),
      cone(v3(0.17, 0.18, 0.08), v3(0.18, 0.03, 0.08), 0.045, 0.035), // shins
      cone(v3(0.17, 0.18, -0.08), v3(0.18, 0.03, -0.08), 0.045, 0.035),
      ellipsoid(v3(0.22, 0.02, 0.08), v3(0.06, 0.022, 0.04)),        // feet
      ellipsoid(v3(0.22, 0.02, -0.08), v3(0.06, 0.022, 0.04)),
    ];
    const f = (x, y, z) => { let d = 1e9; for (const p of parts) d = smin(d, p.f(x, y, z), 0.025); return d; };
    const { pos, idx } = surfaceNets(f, v3(-0.28, -0.02, -0.25), v3(0.32, 0.72, 0.25), 0.007);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    const nrm = new Float32Array(pos.length), col = new Float32Array(pos.length);
    const e = 0.003;
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i], y = pos[i + 1], z = pos[i + 2];
      const gx = f(x + e, y, z) - f(x - e, y, z), gy = f(x, y + e, z) - f(x, y - e, z), gz = f(x, y, z + e) - f(x, y, z - e);
      const l = Math.hypot(gx, gy, gz) || 1;
      nrm[i] = gx / l; nrm[i + 1] = gy / l; nrm[i + 2] = gz / l;
      const n = Math.sin(x * 47 + z * 31) * Math.sin(y * 53) * 0.08 + (Math.sin(x * 211 + y * 177 + z * 133) * 0.5 + 0.5) * 0.08;
      const v = 0.78 + n - (gy / l < -0.3 ? 0.12 : 0);
      col[i] = v; col[i + 1] = v * 0.99; col[i + 2] = v * 0.96;
    }
    geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const ix = geo.index.array, a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    for (let t = 0; t < ix.length; t += 3) {
      a.fromArray(pos, ix[t] * 3); b.fromArray(pos, ix[t + 1] * 3); c.fromArray(pos, ix[t + 2] * 3);
      const fn = b.clone().sub(a).cross(c.clone().sub(a));
      if (fn.dot(new THREE.Vector3(nrm[ix[t] * 3], nrm[ix[t] * 3 + 1], nrm[ix[t] * 3 + 2])) < 0) { const s2 = ix[t + 1]; ix[t + 1] = ix[t + 2]; ix[t + 2] = s2; }
    }
    monkeyGeo = geo;
  }
  const g = new THREE.Group();
  const stone = std({ vertexColors: true, color: '#d6d3cb', roughness: 0.95 });
  const base = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4, 1), std({ color: '#a8a59c', roughness: 1, flatShading: true }));
  base.scale.set(1.25, 0.4, 1.0); base.position.y = 0.12; base.castShadow = true; g.add(base);
  const mk = new THREE.Mesh(monkeyGeo, stone); mk.position.y = 0.24; mk.scale.setScalar(1.35); mk.castShadow = true; g.add(mk);
  // carved face details: eyes + mouth line
  const dark = std({ color: '#4a4844' });
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), dark); e.position.set(0.24 + 0.155 * 0.0 + 0.2 - 0.2, 0.24 + 0.548 * 1.35, s * 0.03 * 1.35); e.position.x = 0.148 * 1.35; g.add(e); }
  const mouth = box(0.01, 0.006, 0.05, dark, 0.178 * 1.35, 0.24 + 0.488 * 1.35, 0); g.add(mouth);
  return g;
}
export function makeBanner(col = '#2a4aa8', seed = 1) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.6, 6), std({ color: '#d8d8d4', metalness: 0.5 })); pole.position.y = 1.3; g.add(pole);
  const t = canvasTex(96, 320, (c, w, h) => {
    c.fillStyle = col; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.fillRect(8, 8, w - 16, h - 16); c.fillStyle = col;
    c.font = '60px "Yuji Syuku"'; c.textAlign = 'center'; ['大', '売', '出'].forEach((ch, i) => c.fillText(ch, w / 2, 90 + i * 80));
  });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 1.4), std({ map: t, side: THREE.DoubleSide, roughness: 0.95 }));
  fl.position.set(0.21, 1.75, 0); g.add(fl);
  g.add(box(0.44, 0.02, 0.02, std({ color: '#d8d8d4' }), 0.22, 2.46, 0));
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.18, 10), std({ color: '#222' })); base.position.y = 0.09; g.add(base);
  return g;
}
export function makeClockTower() {
  const m = mats();
  const g = new THREE.Group();
  g.add(box(2.2, 11, 2.2, m.plaster, 0, 5.5, 0));
  g.add(box(2.4, 1.8, 2.4, std({ color: '#f3efe6' }), 0, 11.9, 0));
  const face = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#f6f2e8'; c.beginPath(); c.arc(128, 128, 120, 0, 7); c.fill();
    c.strokeStyle = '#2a2a2a'; c.lineWidth = 6; c.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.fillStyle = '#2a2a2a'; c.fillRect(128 + Math.cos(a) * 98 - 4, 128 + Math.sin(a) * 98 - 4, 8, 8); }
    c.lineWidth = 8; c.beginPath(); c.moveTo(128, 128); c.lineTo(128, 60); c.stroke(); c.beginPath(); c.moveTo(128, 128); c.lineTo(176, 140); c.stroke();
  });
  const cf = new THREE.Mesh(new THREE.CircleGeometry(0.7, 32), new THREE.MeshStandardMaterial({ map: face, emissive: '#ffffff', emissiveMap: face, emissiveIntensity: 0.6 }));
  cf.position.set(0, 11.9, 1.21); g.add(cf);
  g.add(box(1.0, 0.7, 0.05, m.timber, 0, 12.9, 1.21));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.1, 4), m.roof); roof.rotation.y = Math.PI / 4; roof.position.y = 13.4; g.add(roof);
  g.userData.collider = [-1.1, 1.1, -1.1, 1.1];
  return g;
}
export function makeGreenPillar() {
  const g = new THREE.Group();
  const t = canvasTex(128, 768, (c, w, h) => {
    c.fillStyle = '#1f8a4a'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#fff'; c.beginPath(); c.arc(w / 2, 70, 38, 0, 7); c.fill();
    c.fillStyle = '#1f8a4a'; c.beginPath(); c.arc(w / 2, 70, 22, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.font = '62px "Zen Antique"'; c.textAlign = 'center'; ['信', '用', '金', '庫'].forEach((ch, i) => c.fillText(ch, w / 2, 200 + i * 120));
  });
  const mm = new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.35, roughness: 0.5 });
  g.add(box(0.7, 6, 0.4, [std({ color: '#1f8a4a' }), std({ color: '#1f8a4a' }), std({ color: '#1f8a4a' }), std({ color: '#1f8a4a' }), mm, mm], 0, 3, 0));
  g.userData.collider = [-0.35, 0.35, -0.2, 0.2];
  return g;
}
