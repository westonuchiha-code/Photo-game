// Dirt construction site from the dump-truck and rock-cairns photos.
//   makeDumpTruck()   yellow articulated hauler: tractor unit (cab, sloped hood, fenders,
//                     exhaust, beacon), articulation joint, tapered dump body on a 2-axle bogie,
//                     six big lugged tyres with yellow hubs. Made-up brand "TERRAMAX HX40".
//   makePipeBarrier(len)  rusty steel pipe rail on pipe posts with diagonal braces (photo).
//   makeSiteSign()    blue site-entrance sign on two posts, generic text.
//   makeCairn(seed)   stack of flat stones balanced on each other.
//   makeWeeds(n, w, d, seed) clumps of tall dry weeds (crossed alpha cards).
// All face +x (truck forward) / +z (signs), origin at ground level.
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
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.6, ...o });
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};

// ---------------------------------------------------------------- truck
let TM = null;
function truckMats() {
  if (TM) return TM;
  // yellow paint with a little road grime toward the bottom
  const grime = canvasTex(128, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#e9b520'); g.addColorStop(0.6, '#dfaa1e'); g.addColorStop(1, '#a8823a');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = rng(5); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(110,80,40,${r() * 0.25})`; c.fillRect(r() * w, h * 0.5 + r() * h * 0.5, 2 + r() * 6, 1 + r() * 3); }
  });
  TM = {
    yellow: std({ map: grime, roughness: 0.45, metalness: 0.15 }),
    yellowFlat: std({ color: '#e6b11f', roughness: 0.45, metalness: 0.15 }),
    dark: std({ color: '#26272a', roughness: 0.6, metalness: 0.3 }),
    steel: std({ color: '#6c6f72', roughness: 0.45, metalness: 0.6 }),
    glass: std({ color: '#1b2630', roughness: 0.08, metalness: 0.5, emissive: '#0c1218' }),
    tyre: std({ color: '#1b1b1c', roughness: 0.92 }),
    hub: std({ color: '#e2ad1e', roughness: 0.5, metalness: 0.2 }),
    beacon: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.1, 0.1), toneMapped: false }),
    lamp: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 1.9, 1.6), toneMapped: false }),
  };
  return TM;
}
function bigTyre(R = 0.85, W = 0.72) {
  const M = truckMats();
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.06, R - 0.06, W, 40), M.tyre);
  core.rotation.x = Math.PI / 2; core.castShadow = true; g.add(core);
  for (const s of [-1, 1]) {      // rounded sidewall shoulders
    const sh = new THREE.Mesh(new THREE.TorusGeometry(R - 0.14, 0.1, 10, 40), M.tyre);
    sh.position.z = s * (W / 2 - 0.08); g.add(sh);
  }
  // chevron tread lugs
  const lug = new THREE.BoxGeometry(0.14, 0.09, W * 0.48);
  const N = 30;
  const inst = new THREE.InstancedMesh(lug, M.tyre, N * 2);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1);
  let k = 0;
  for (let i = 0; i < N; i++) for (const s of [-1, 1]) {
    const a = (i + (s > 0 ? 0.5 : 0)) / N * Math.PI * 2;
    e.set(0, s * 0.45, a); q.setFromEuler(e);
    v.set(Math.cos(a) * (R - 0.02), Math.sin(a) * (R - 0.02), s * W * 0.24);
    inst.setMatrixAt(k++, m4.compose(v, q, sc));
  }
  inst.castShadow = true; g.add(inst);
  // yellow hub with bolts on the outer face
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, W + 0.02, 24), M.hub);
  hub.rotation.x = Math.PI / 2; g.add(hub);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.12, 16), M.dark);
  cap.rotation.x = Math.PI / 2; cap.position.z = W / 2 + 0.05; g.add(cap);
  for (let i = 0; i < 10; i++) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6), M.steel);
    const a = i / 10 * Math.PI * 2; b.rotation.x = Math.PI / 2; b.position.set(Math.cos(a) * 0.28, Math.sin(a) * 0.28, W / 2 + 0.02); g.add(b);
  }
  return g;
}
export function makeDumpTruck() {
  const M = truckMats();
  const g = new THREE.Group();
  const R = 0.85, TZ = 1.38;
  // wheels: front axle + rear bogie
  for (const x of [3.3, -1.7, -3.5]) for (const s of [-1, 1]) {
    const t = bigTyre(R); t.position.set(x, R, s * TZ); t.rotation.y = s < 0 ? Math.PI : 0; g.add(t);
  }
  // ---- tractor unit
  g.add(box(3.6, 0.6, 1.6, M.dark, 3.0, 1.25, 0));                         // frame
  const hood = new THREE.Group();
  hood.add(box(1.7, 1.05, 2.2, M.yellow, 0, 0, 0));
  const slope = box(0.7, 0.5, 2.2, M.yellow, 0.75, 0.15, 0); slope.rotation.z = -0.55; hood.add(slope);
  hood.add(box(0.06, 0.55, 1.9, M.dark, 0.88, -0.22, 0));                    // grille
  for (let i = 0; i < 5; i++) hood.add(box(0.07, 0.04, 1.8, M.steel, 0.9, -0.44 + i * 0.11, 0));
  hood.position.set(4.2, 1.95, 0); g.add(hood);
  for (const s of [-1, 1]) {                                                // headlights in the bumper
    const hl = box(0.05, 0.14, 0.26, M.lamp, 5.12, 1.72, s * 0.85); g.add(hl);
  }
  g.add(box(0.4, 0.35, 2.6, M.yellow, 4.95, 1.25, 0));                     // bumper
  g.add(box(1.6, 0.6, 1.4, M.dark, 4.4, 1.0, 0));                           // under-hood frame
  for (const s of [-1, 1]) {                                                // front fenders
    const f = box(2.0, 0.12, 0.85, M.yellow, 3.3, 2.0, s * TZ); g.add(f);
    const lip = box(0.12, 0.45, 0.85, M.yellow, 4.25, 1.8, s * TZ); g.add(lip);
  }
  // cab: yellow frame, big dark windows, roof with beacon
  const cab = new THREE.Group();
  cab.add(box(1.7, 0.5, 2.3, M.yellow, 0, 0.25, 0));
  for (const [x, z] of [[0.82, 1.12], [0.82, -1.12], [-0.82, 1.12], [-0.82, -1.12]]) cab.add(box(0.08, 1.3, 0.08, M.yellow, x, 1.15, z));
  cab.add(box(1.62, 1.22, 2.22, M.glass, 0, 1.13, 0));
  cab.add(box(1.85, 0.14, 2.45, M.yellow, 0, 1.86, 0));
  const bc = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.16, 12), M.beacon); bc.position.set(-0.3, 2.02, 0.7); cab.add(bc);
  const mirror = box(0.04, 0.3, 0.2, M.dark, 0.95, 1.2, 1.35); cab.add(mirror);
  cab.position.set(2.75, 1.55, 0); g.add(cab);
  const bl = new THREE.PointLight('#ff9a2a', 2.5, 7, 1.6); bl.position.set(2.45, 3.75, 0.7); g.add(bl);
  // exhaust stack + handrails + ladder
  const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 10), M.steel); ex.position.set(3.65, 3.0, -1.0); g.add(ex);
  for (const s of [-1, 1]) {
    g.add(box(1.4, 0.04, 0.04, M.dark, 3.2, 2.55, s * 1.25));
    for (let i = 0; i < 4; i++) g.add(box(0.5, 0.04, 0.1, M.dark, 2.0, 0.6 + i * 0.32, s * 1.18));
  }
  // ---- articulation joint
  g.add(box(0.9, 0.7, 1.0, M.dark, 1.15, 1.3, 0));
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.9, 14), M.steel); pin.position.set(1.15, 1.3, 0); g.add(pin);
  // ---- rear unit: frame + tapered dump body
  g.add(box(5.0, 0.5, 1.4, M.dark, -2.4, 1.2, 0));
  const body = new THREE.Group();
  const L = 6.0, Wb = 3.2, Hb = 1.75;
  body.add(box(L, 0.12, Wb - 0.5, M.yellowFlat, 0, 0, 0));                  // floor
  for (const s of [-1, 1]) {                                                // sloped side walls
    const side = box(L, Hb, 0.1, M.yellow, 0, Hb / 2, s * (Wb / 2 - 0.15)); side.rotation.x = s * 0.18; body.add(side);
    for (let i = 0; i < 6; i++) { const rib = box(0.12, Hb, 0.14, M.yellowFlat, -L / 2 + 0.5 + i * 1.0, Hb / 2, s * (Wb / 2 - 0.08)); rib.rotation.x = s * 0.18; body.add(rib); }
    body.add(box(L, 0.16, 0.22, M.yellowFlat, 0, Hb, s * (Wb / 2 + 0.02)));   // top rail
  }
  body.add(box(0.12, Hb + 0.4, Wb, M.yellow, L / 2, Hb / 2 + 0.2, 0));      // front wall, tall
  body.add(box(0.9, 0.1, Wb, M.yellow, L / 2 + 0.4, Hb + 0.4, 0));          // canopy lip over the joint
  const tail = box(0.1, 0.9, Wb - 0.4, M.yellowFlat, -L / 2 + 0.05, 0.4, 0); tail.rotation.z = -0.5; body.add(tail);   // upswept tail floor
  body.position.set(-2.0, 1.65, 0); g.add(body);
  // made-up branding on the body side + hood
  const decal = (text, w, h, size) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ transparent: true, roughness: 0.5, map: canvasTex(512, Math.round(512 * h / w), (c, cw, ch) => { c.fillStyle = '#151515'; c.font = `bold ${size}px Arial`; c.textBaseline = 'middle'; c.fillText(text, 8, ch / 2); }) }));
  for (const s of [-1, 1]) {
    const d1 = decal('TERRAMAX', 2.2, 0.4, 110); d1.position.set(-1.5, 2.6, s * 1.72); d1.rotation.y = s < 0 ? Math.PI : 0; d1.rotation.x = s * -0.18; g.add(d1);
    const d2 = decal('HX40', 0.8, 0.28, 120); d2.position.set(4.3, 2.2, s * 1.11); d2.rotation.y = s < 0 ? Math.PI : 0; g.add(d2);
  }
  g.userData.collider = [-5.6, 5.3, -1.85, 1.85];
  return g;
}

// ---------------------------------------------------------------- site bits
export function makePipeBarrier(len, h = 1.0) {
  const g = new THREE.Group();
  const rust = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.35, map: canvasTex(256, 32, (c, w, hh) => {
    c.fillStyle = '#5e4a3c'; c.fillRect(0, 0, w, hh);
    const r = rng(2); for (let i = 0; i < 260; i++) { c.fillStyle = ['#7a4a2a', '#8a5a34', '#3e3530', '#6e6660'][i % 4]; c.fillRect(r() * w, r() * hh, 3 + r() * 14, 1 + r() * 4); }
  }) });
  rust.map.wrapS = THREE.RepeatWrapping; rust.map.repeat.set(len / 2, 1);
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, len, 12), rust); rail.rotation.z = Math.PI / 2; rail.position.y = h; rail.castShadow = true; g.add(rail);
  const n = Math.max(2, Math.round(len / 3) + 1);
  for (let i = 0; i < n; i++) {
    const x = -len / 2 + i * len / (n - 1);
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, h + 0.05, 12), rust); p.position.set(x, (h + 0.05) / 2, 0); p.castShadow = true; g.add(p);
    const capm = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), rust); capm.position.set(x, h + 0.05, 0); g.add(capm);
    if (i < n - 1 && i % 2 === 0) {     // diagonal brace like the photo
      const bl = Math.hypot(len / (n - 1), h);
      const br = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, bl, 10), rust);
      br.position.set(x + len / (n - 1) / 2, h / 2, 0); br.rotation.z = -Math.atan2(len / (n - 1), h); g.add(br);
    }
  }
  return g;
}
export function makeSiteSign() {
  const g = new THREE.Group();
  const t = canvasTex(512, 384, (c, w, h) => {
    c.fillStyle = '#f2f2ee'; c.fillRect(0, 0, w, 90);
    c.fillStyle = '#2b55b8'; c.fillRect(0, 90, w, h - 90);
    c.fillStyle = '#c8202a'; c.font = 'bold 70px Arial'; c.textAlign = 'center'; c.fillText('STOP', w / 2, 70);
    c.fillStyle = '#fff'; c.font = 'bold 34px Arial';
    ['ALL VISITORS', 'CHECK IN AT', 'SITE OFFICE'].forEach((s, i) => c.fillText(s, w / 2, 150 + i * 46));
    c.font = 'bold 26px Arial'; c.fillText('HARD HATS REQUIRED', w / 2, 330);
  });
  g.add(box(1.6, 1.2, 0.04, new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 }), 0, 1.6, 0));
  for (const x of [-0.65, 0.65]) g.add(box(0.08, 2.2, 0.08, std({ color: '#8a8d90', metalness: 0.5 }), x, 1.1, -0.05));
  return g;
}
export function makeCairn(seed = 1) {
  const g = new THREE.Group();
  const r = rng(seed);
  const cols = ['#c9a89a', '#b8907e', '#d8c6b4', '#9aa6ac', '#bfa08a', '#e0cdb8'];
  let y = 0;
  const n = 5 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const big = i === 0 ? 1.4 : 1 - i * 0.08;
    const w = (0.09 + r() * 0.05) * big, h = 0.025 + r() * 0.03, d = (0.06 + r() * 0.04) * big;
    const geo = new THREE.DodecahedronGeometry(1, 1);
    const p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) { const j = 0.85 + r() * 0.3; p.setXYZ(k, p.getX(k) * j, p.getY(k), p.getZ(k) * j); }
    geo.computeVertexNormals();
    const s = new THREE.Mesh(geo, std({ color: cols[Math.floor(r() * cols.length)], roughness: 0.95, flatShading: true }));
    s.scale.set(w / 2, h / 2, d / 2);
    s.position.set((r() - 0.5) * 0.02, y + h / 2, (r() - 0.5) * 0.02);
    s.rotation.y = r() * 3; s.rotation.z = (r() - 0.5) * 0.12;
    s.castShadow = true;
    g.add(s);
    y += h * 0.92;
  }
  return g;
}
let weedMat = null;
export function makeWeeds(n, w, d, seed = 3) {
  if (!weedMat) weedMat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, alphaTest: 0.45, roughness: 1, map: canvasTex(256, 256, (c, cw, ch) => {
    const r = rng(9);
    for (let i = 0; i < 60; i++) {
      const x = 20 + r() * (cw - 40), top = 20 + r() * 120;
      c.strokeStyle = ['#8a8a3a', '#a89a4a', '#6f7a34', '#c2a85a'][i % 4]; c.lineWidth = 1.5 + r() * 2;
      c.beginPath(); c.moveTo(x, ch); c.quadraticCurveTo(x + (r() - 0.5) * 40, (ch + top) / 2, x + (r() - 0.5) * 50, top); c.stroke();
      if (r() < 0.6) { c.fillStyle = '#b8a050'; for (let k = 0; k < 6; k++) c.fillRect(x + (r() - 0.5) * 30, top + r() * 40, 3, 3); }
    }
  }) });
  const g = new THREE.Group();
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const s = 0.6 + r() * 0.9;
    for (let k = 0; k < 2; k++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9 * s, 0.9 * s), weedMat);
      m.position.set((r() - 0.5) * w, 0.45 * s, (r() - 0.5) * d); m.rotation.y = k * Math.PI / 2 + r();
      g.add(m);
    }
  }
  return g;
}
