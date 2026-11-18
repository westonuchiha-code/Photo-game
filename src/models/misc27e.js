// Small props from the misc photos (27e):
//   makePlywoodSheet()   4x8 sheet with the ink stamp from the plywood photo (stamp text is generic)
//   makeGlassShards(w, d, n, seed)  scatter of broken tempered-glass cubes (car-glass photo)
//   makePasteWall(len, h) teal concrete wall with wheat-paste art: the skeleton print from the
//                        photo plus redrawn paste-ups with made-up handwriting, a splat with a
//                        heart, a star sticker
//   makePickupZone()     night pickup crosswalk: chip-seal lane, wide zebra crossing, yellow curb
//                        bays with hatching, cones, red overhead sign gantry and numbered pillar
//                        signs (generic text)
import * as THREE from 'three';

const _L = new THREE.TextureLoader();
function ptex(name, rx = 1, ry = 1) {
  const t = _L.load(`assets/textures/${name}`);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8;
  return t;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
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
function flat(w, d, mat, x, y, z, rz = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  m.rotation.x = -Math.PI / 2; m.rotation.z = rz; m.position.set(x, y, z); m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- plywood
export function makePlywoodSheet() {
  const map = ptex('pw_stamp.png'); map.center.set(0.5, 0.5); map.rotation = Math.PI / 2; map.repeat.set(1, 1.0);   // landscape photo on a portrait sheet
  const face = std({ map, color: '#ffe8d2', roughness: 0.85, emissive: '#1a0e06' });
  const edge = std({ color: '#b08a5a', roughness: 0.9 });
  const g = new THREE.Group();
  g.add(box(1.22, 2.44, 0.018, [edge, edge, edge, edge, face, std({ color: '#7a4e2c' })], 0, 1.22, 0));   // pivot at the bottom edge
  return g;
}

// ---------------------------------------------------------------- broken glass
export function makeGlassShards(w, d, n = 400, seed = 5) {
  const r = rng(seed);
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshStandardMaterial({ color: '#9fd8c8', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.8, emissive: '#1a3a34' });
  const inst = new THREE.InstancedMesh(geo, mat, n);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    // denser toward the middle, like a window that burst onto the ground
    const a = r() * Math.PI * 2, rad = Math.pow(r(), 1.6);
    p.set(Math.cos(a) * rad * w / 2, 0.004, Math.sin(a) * rad * d / 2);
    const k = 0.006 + r() * 0.012;
    s.set(k * (0.7 + r() * 0.6), k * 0.45, k * (0.7 + r() * 0.6));
    e.set((r() - 0.5) * 0.6, r() * 3, (r() - 0.5) * 0.6); q.setFromEuler(e);
    inst.setMatrixAt(i, m4.compose(p, q, s));
  }
  return inst;
}

// ---------------------------------------------------------------- wheat-paste wall
function hand(c, lines, x, y, size, col, lh) {
  c.fillStyle = col; c.font = `700 ${Math.round(size * 1.2)}px "Caveat"`;
  lines.forEach((t, i) => c.fillText(t, x, y + i * lh));
}
export function makePasteWall(len = 7, h = 2.6) {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.BoxGeometry(len, h, 0.3), std({ map: ptex('wp_teal.png', len / 2.2, h / 1.25), roughness: 0.9 }));
  wall.position.set(0, h / 2, -0.15); wall.castShadow = wall.receiveShadow = true; g.add(wall);
  g.add(box(len + 0.05, 0.08, 0.36, std({ color: '#6f8f7e', roughness: 0.95 }), 0, h + 0.04, -0.15));   // cap
  const paste = (tex, w, hh, x, y, rz = 0, opacity = 1) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshStandardMaterial({ map: tex, transparent: true, opacity, roughness: 0.75, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.position.set(x, y, 0.004); m.rotation.z = rz; g.add(m);
    return m;
  };
  // skeleton print (from the photo)
  paste(ptex('wp_skeleton.png'), 0.4, 0.86, 0.2, 1.65, 0.02);
  // red paste-up, made-up words
  paste(canvasTex(512, 300, (c, w, hh) => {
    c.fillStyle = '#d4583a'; c.fillRect(6, 6, w - 12, hh - 12);
    c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(6, 6, w - 12, 30);
    hand(c, ['I keep coming back', 'here hoping it', 'feels different.'], 30, 90, 56, '#2a1410', 74);
    c.strokeStyle = '#2a1410'; c.lineWidth = 3; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(28, 102 + i * 74); c.lineTo(w - 40, 100 + i * 74); c.stroke(); }
  }), 0.68, 0.4, -0.55, 1.05, -0.03);
  // pink drip note
  paste(canvasTex(384, 320, (c, w, hh) => {
    c.fillStyle = '#f2dcc8'; c.fillRect(20, 30, w - 40, hh - 70);
    c.fillStyle = '#7a3a8a';
    for (let x = 30; x < w - 40; x += 28) { c.fillRect(x, 20, 16, 40 + (x * 7) % 30); c.fillRect(x, hh - 90, 16, 50 + (x * 13) % 30); }
    hand(c, ['wish I could', 'remember the', 'ocean better'], 40, 140, 32, '#5a2a2a', 38);
  }), 0.42, 0.35, 0.72, 1.62, 0.04);
  // black splat with a purple heart
  paste(canvasTex(256, 256, (c, w, hh) => {
    c.fillStyle = '#9ad8c8'; c.beginPath(); c.arc(128, 128, 110, 0, 7); c.globalAlpha = 0.6; c.fill(); c.globalAlpha = 1;
    c.fillStyle = '#121212'; c.beginPath(); for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, rr = i % 2 ? 70 : 100; c.lineTo(128 + Math.cos(a) * rr, 128 + Math.sin(a) * rr); } c.fill();
    for (let i = 0; i < 5; i++) { c.fillRect(70 + i * 28, 180, 8, 40 + i * 9); }
    c.fillStyle = '#8a7ab8'; c.beginPath(); c.moveTo(128, 165); c.bezierCurveTo(70, 120, 95, 70, 128, 100); c.bezierCurveTo(160, 70, 186, 120, 128, 165); c.fill();
  }), 0.3, 0.3, -0.42, 1.55, 0.1);
  // star sticker
  paste(canvasTex(256, 256, (c, w, hh) => {
    c.fillStyle = 'rgba(220,200,215,0.85)'; c.beginPath(); c.arc(128, 128, 116, 0, 7); c.fill();
    c.fillStyle = '#c4505a'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 42 : 100; c.lineTo(128 + Math.cos(a) * rr, 128 + Math.sin(a) * rr); } c.fill();
    hand(c, ['ok'], 100, 145, 44, '#3a1a20', 0);
  }), 0.24, 0.24, 0.62, 1.12, 0);
  // old torn paste-up remnants for texture
  const r = rng(4);
  for (let i = 0; i < 4; i++) paste(canvasTex(128, 128, (c) => { c.fillStyle = ['#e8e2d0', '#d8c8a8', '#c8d8e8', '#e8c8c8'][i]; c.beginPath(); for (let k = 0; k < 9; k++) c.lineTo(64 + Math.cos(k * 0.7) * (40 + r() * 24), 64 + Math.sin(k * 0.7) * (40 + r() * 24)); c.fill(); }), 0.3, 0.3, -2.4 + i * 1.5 + r(), 0.6 + r() * 1.4, r(), 0.55);
  return g;
}

// ---------------------------------------------------------------- pickup zone
function cone() {
  const g = new THREE.Group();
  const orange = std({ color: '#ff5a1a', roughness: 0.5, emissive: '#3a1004' });
  g.add(box(0.36, 0.03, 0.36, std({ color: '#202020' }), 0, 0.015, 0));
  const c = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.65, 16, 1, true), orange); c.position.y = 0.35; c.castShadow = true; g.add(c);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.095, 0.1, 16, 1, true), std({ color: '#f2f2f2', emissive: '#555' })); band.position.y = 0.42; g.add(band);
  return g;
}
export function makePickupZone(L = 9, Wd = 7) {
  const g = new THREE.Group();                // lane along x (12 m), crossing along z (8 m)
  // chip-seal lane
  g.add(flat(L, Wd, std({ map: ptex('as_chipseal.png', L / 1.6, Wd / 1.6), roughness: 0.95 }), 0, 0.007, 0));
  // wide zebra crossing (bars run across the lane, like the photo)
  const paint = std({ color: '#d8d8d2', roughness: 0.85 });
  for (let i = 0; i < 6; i++) g.add(flat(4.0, 0.55, paint, 0, 0.011, -Wd / 2 + 0.7 + i * 1.1));
  for (const x of [-2.15, 2.15]) g.add(flat(0.18, Wd, paint, x, 0.012, 0));
  // yellow curbs + hatched bays on both sides
  const yellow = std({ color: '#e8c21a', roughness: 0.6 });
  const conc = std({ color: '#a8a59c', roughness: 0.95 });
  for (const s of [-1, 1]) {
    const cx = s * (L / 2 - 1.3);
    g.add(box(2.4, 0.15, Wd, conc, s * (L / 2 + 0.4), 0.075, 0));
    g.add(box(0.15, 0.16, Wd, yellow, s * (L / 2 - 0.8), 0.08, 0));
    const hatch = canvasTex(256, 256, (c, w, hh) => { c.strokeStyle = '#e8c21a'; c.lineWidth = 22; c.strokeRect(12, 12, w - 24, hh - 24); for (let i = -hh; i < w; i += 60) { c.beginPath(); c.moveTo(i, hh); c.lineTo(i + hh, 0); c.stroke(); } });
    const hm = new THREE.MeshStandardMaterial({ map: hatch, transparent: true, depthWrite: false, roughness: 0.7 });
    g.add(flat(1.6, 2.2, hm, cx, 0.012, -2.2));
    g.add(flat(1.6, 2.2, hm, cx, 0.012, 2.2));
  }
  // cones on the crossing
  for (const [x, z] of [[-1.2, -0.4], [0.4, 2.2], [-3.0, 1.0]]) { const c = cone(); c.position.set(x, 0, z); g.add(c); }
  // red overhead sign gantry spanning the lane
  const red = std({ color: '#b8202c', roughness: 0.5 });
  const grey = std({ color: '#8a8d90', roughness: 0.5, metalness: 0.5 });
  for (const x of [-L / 2 - 0.4, L / 2 + 0.4]) g.add(box(0.25, 5.2, 0.25, grey, x, 2.6, -1.0));
  g.add(box(L + 1.0, 0.25, 0.25, grey, 0, 5.2, -1.0));
  const signTex = canvasTex(1024, 256, (c, w, hh) => {
    c.fillStyle = '#c3202e'; c.fillRect(0, 0, w, hh);
    c.fillStyle = '#fff'; c.font = '600 100px "Oswald"'; c.textAlign = 'center'; c.fillText('Pickup 1', w / 2, 112);
    c.font = 'bold 64px Arial'; c.fillText('←', 70, 110); c.fillText('→', w - 70, 110);
    c.font = '600 46px "Oswald"'; c.textAlign = 'left'; c.fillText('Rideshare', 30, 210); c.textAlign = 'right'; c.fillText('Taxi · Shuttles', w - 30, 210);
    c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(0, 140, w, 4);
  });
  const sign = box(4.0, 1.0, 0.12, [red, red, red, red, new THREE.MeshBasicMaterial({ map: signTex, color: new THREE.Color(1.15, 1.15, 1.15), toneMapped: false }), red], 0, 4.4, -1.0);
  g.add(sign);
  g.add(box(0.06, 0.6, 0.06, grey, -1.5, 4.95, -1.0), box(0.06, 0.6, 0.06, grey, 1.5, 4.95, -1.0));
  // numbered red pillar signs on the islands
  for (const [x, z, num] of [[L / 2 + 0.4, 2.8, '2'], [-L / 2 - 0.4, 2.8, '1']]) {
    g.add(box(0.5, 3.0, 0.5, conc, x, 1.5, z));
    const t = canvasTex(256, 256, (c, w, hh) => { c.fillStyle = '#c3202e'; c.fillRect(0, 0, w, hh); c.fillStyle = '#fff'; c.font = '600 180px "Oswald"'; c.textAlign = 'center'; c.fillText(num, w / 2, 190); });
    const m = new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(1.1, 1.1, 1.1), toneMapped: false });
    g.add(box(0.7, 0.7, 0.7, [x > 0 ? red : m, x > 0 ? m : red, red, red, m, red], x, 3.2, z));   // number faces the lane + the front only
  }
  // bright canopy lights like the photo
  const lamp = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.4, 2.2), toneMapped: false });
  g.add(box(0.8, 0.12, 0.4, lamp, 0, 5.08, -1.0));
  const l = new THREE.PointLight('#eef4ff', 22, 18, 1.2); l.position.set(0, 4.8, 0); g.add(l);
  g.userData.colliders = [[-L / 2 - 0.55, -L / 2 - 0.25, -1.15, -0.85], [L / 2 + 0.25, L / 2 + 0.55, -1.15, -0.85], [L / 2 + 0.15, L / 2 + 0.65, 2.55, 3.05], [-L / 2 - 0.65, -L / 2 - 0.15, 2.55, 3.05]];
  return g;
}
