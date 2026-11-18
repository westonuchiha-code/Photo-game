// City street props from the city photos (28d). Brands, signs and mascots are made up.
//   makeCargoTrike({ cab })  three-wheel cargo motorcycle: sport-bike front (faired tank, made-up
//       "DASHER 125" livery, headlight, mirrors, spoked front wheel on forks) welded to a steel
//       flatbed on a rear axle with two wheels; load: blue tarp bundles, red cabinet, grey drum,
//       rope; `cab: true` gives the electric version with a clear plastic cab on yellow posts
//   makeArcadeCabinet()      stand-up cabinet: yellow body with chrome edge trim, lit marquee with
//       original dragon-ish mascots ("BUBBLE BOUNCE"), twin speakers, CRT glass with a lit game screen,
//       two joysticks + coloured buttons on a printed panel, coin door, green turf mat
//   makeGraffitiFront()      narrow closed shop: weathered sign board with made-up raised letters,
//       two roll shutters (graffiti textures from the photo), cracked concrete pier, old sub-signs,
//       a security sticker (generic), corrugated upper wall, wood pallet leaning in front
// Each faces +z, origin at ground level.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { fitText } from '../fonts.js';

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
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
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
const cyl = (r0, r1, h, mat, seg = 16) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), mat); m.castShadow = true; return m; };
const glow = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });
// tube between two points
function tube(a, b, r, mat) {
  const d = new THREE.Vector3().subVectors(b, a), m = cyl(r, r, d.length(), mat, 10);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- cargo trike
let TM = null;
function trikeMats() {
  if (TM) return TM;
  const livery = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = '#f2f2ee'; c.fillRect(0, 0, w, h);
    // green flame sweeps + blue-purple tail, like the photo's fairing
    const r = rng(7);
    c.fillStyle = '#3aa84a';
    for (let i = 0; i < 7; i++) { c.beginPath(); const y = h * 0.45 + i * 18; c.moveTo(w * 0.15, y); c.quadraticCurveTo(w * 0.45, y - 40 - r() * 30, w * (0.7 + r() * 0.2), y - 20 + r() * 10); c.quadraticCurveTo(w * 0.45, y - 10, w * 0.15, y + 16); c.fill(); }
    c.fillStyle = '#5a4ab8'; c.beginPath(); c.moveTo(0, h * 0.85); c.lineTo(w * 0.3, h * 0.7); c.lineTo(w * 0.35, h); c.lineTo(0, h); c.fill();
    c.fillStyle = '#d8202a'; c.beginPath(); c.moveTo(w * 0.5, h * 0.25); c.lineTo(w * 0.62, h * 0.22); c.lineTo(w * 0.55, h * 0.3); c.fill();
    c.fillStyle = '#d8202a'; fitText(c, 'VX', w * 0.6, h * 0.32, 90, 46, '"Righteous"');
    c.fillStyle = 'rgba(80,60,40,0.12)'; for (let i = 0; i < 160; i++) c.fillRect(r() * w, r() * h, 2 + r() * 12, 1 + r() * 3);   // grime
  });
  TM = {
    livery: std({ map: livery, roughness: 0.35 }),
    white: std({ color: '#ecebe6', roughness: 0.35 }),
    black: std({ color: '#151516', roughness: 0.5 }),
    rubber: std({ color: '#1b1b1c', roughness: 0.9 }),
    chrome: std({ color: '#c8cbcf', metalness: 0.6, roughness: 0.25 }),
    steel: std({ color: '#5f6264', metalness: 0.45, roughness: 0.55 }),
    rust: std({ color: '#6a4a36', metalness: 0.3, roughness: 0.8 }),
    bed: std({ map: canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#dcdcd6'; c.fillRect(0, 0, w, h); const r = rng(4); for (let i = 0; i < 200; i++) { c.fillStyle = `rgba(120,80,50,${r() * 0.3})`; c.fillRect(r() * w, r() * h, 2 + r() * 10, 1 + r() * 3); } c.fillStyle = '#c84a3a'; c.fillRect(0, h * 0.8, w * 0.3, 4); }), roughness: 0.7 }),
    tarp: std({ color: '#2f63b8', roughness: 0.7, side: THREE.DoubleSide }),
    red: std({ color: '#d8301e', roughness: 0.45 }),
    yellow: std({ color: '#e8b81a', roughness: 0.5 }),
    clear: new THREE.MeshStandardMaterial({ color: '#d8e4ea', transparent: true, opacity: 0.25, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false }),
    lamp: glow(1.8, 1.75, 1.6),
    seat: std({ color: '#1a1a1c', roughness: 0.85, map: canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#1c1c1e'; c.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(80,80,80,${Math.random() * 0.2})`; c.fillRect(Math.random() * w, Math.random() * h, 1, 1); } }) }),
    tank: std({ roughness: 0.3, map: canvasTex(512, 256, (c, w, h) => {
      c.fillStyle = '#1a1a1c'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#b8202a'; c.beginPath(); c.moveTo(0, h * 0.25); c.lineTo(w, h * 0.05); c.lineTo(w, h * 0.35); c.lineTo(0, h * 0.6); c.fill();
      c.fillStyle = '#e83a3a'; c.beginPath(); c.moveTo(0, h * 0.62); c.lineTo(w, h * 0.38); c.lineTo(w, h * 0.42); c.lineTo(0, h * 0.68); c.fill();
      c.fillStyle = '#f2f2ee'; fitText(c, 'DASHER', w * 0.45, h * 0.32, w * 0.6, 70, '"Bebas Neue"', { spacing: 10 });
    }) }),
    engine: std({ color: '#2c2d2f', metalness: 0.5, roughness: 0.5 }),
    exhaust: std({ color: '#3a3533', metalness: 0.6, roughness: 0.5 }),
    bedFloor: std({ map: rustTex('#7a7a74', 11), roughness: 0.85 }),
  };
  return TM;
}
function treadTex() {
  return canvasTex(256, 32, (c, w, h) => { c.fillStyle = '#1c1c1d'; c.fillRect(0, 0, w, h); c.fillStyle = '#0c0c0d'; for (let x = 0; x < w; x += 8) { c.fillRect(x, 4, 3, h / 2 - 6); c.fillRect(x + 4, h / 2 + 2, 3, h / 2 - 6); } c.fillRect(0, h / 2 - 1, w, 2); });
}
// tyre: torus with a tread band texture on the contact face
function tyre(r, w, M) {
  const g = new THREE.Group();
  const t = new THREE.Mesh(new THREE.TorusGeometry(r - w * 0.45, w * 0.48, 12, 40), M.rubber); t.scale.z = 1.0; g.add(t);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.004, r - 0.004, w * 0.62, 40, 1, true), std({ map: M.tread, roughness: 0.95 }));
  band.material.map.repeat.set(10, 1); band.rotation.x = Math.PI / 2; g.add(band);
  return g;
}
function magWheel(r, w, M) {        // 5-spoke alloy (front wheel in the photo)
  const g = tyre(r, w, M);
  const rimR = r - w * 0.9;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(rimR, 0.018, 8, 40), M.alloy); g.add(rim);
  const rim2 = new THREE.Mesh(new THREE.CylinderGeometry(rimR, rimR, w * 0.55, 40, 1, true), std({ color: '#5a5d60', metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide })); rim2.rotation.x = Math.PI / 2; g.add(rim2);
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2;
    for (const off of [-0.09, 0.09]) g.add(tube(V(Math.cos(a) * 0.05, Math.sin(a) * 0.05, 0), V(Math.cos(a + off) * (rimR - 0.01), Math.sin(a + off) * (rimR - 0.01), 0), 0.012, M.alloy));
  }
  const hub = cyl(0.055, 0.055, w * 0.9, M.alloy, 16); hub.rotation.x = Math.PI / 2; g.add(hub);
  const disc = cyl(0.13, 0.13, 0.006, M.chrome, 32); disc.rotation.x = Math.PI / 2; disc.position.z = -0.045; g.add(disc);
  for (let i = 0; i < 8; i++) { const h = cyl(0.008, 0.008, 0.008, M.black, 8); h.rotation.x = Math.PI / 2; const a = i / 8 * Math.PI * 2; h.position.set(Math.cos(a) * 0.1, Math.sin(a) * 0.1, -0.047); g.add(h); }
  return g;
}
function steelWheel(r, w, M) {      // pressed-steel rear wheel: dish, 4 holes, centre cap, nuts
  const g = tyre(r, w, M);
  const rimR = r - w * 0.85;
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(rimR, rimR * 0.9, w * 0.7, 32), M.wheelSteel); dish.rotation.x = Math.PI / 2; g.add(dish);
  const face = new THREE.Mesh(new THREE.RingGeometry(0.035, rimR * 0.92, 32), M.wheelSteel); face.position.z = w * 0.36; g.add(face);
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.78; const hole = new THREE.Mesh(new THREE.CircleGeometry(0.03, 14), M.black); hole.position.set(Math.cos(a) * rimR * 0.6, Math.sin(a) * rimR * 0.6, w * 0.362); g.add(hole); }
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2; const n = cyl(0.01, 0.01, 0.02, M.chrome, 6); n.rotation.x = Math.PI / 2; n.position.set(Math.cos(a) * 0.055, Math.sin(a) * 0.055, w * 0.37); g.add(n); }
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.wheelSteel); cap.rotation.x = Math.PI / 2; cap.position.z = w * 0.37; g.add(cap);
  return g;
}
// smooth body panel from a side profile (x forward, y up), extruded across z with rounded edges
function panel(pts, width, mat, bevel = 0.025) {
  const sh = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
  const geo = new THREE.ExtrudeGeometry(sh, { depth: width - 2 * bevel, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 4, curveSegments: 12 });
  geo.translate(0, 0, -(width - 2 * bevel) / 2);
  const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true;
  // box-project UVs from the side so livery textures map across the panel
  const uv = geo.attributes.uv, ps = geo.attributes.position;
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  for (let i = 0; i < uv.count; i++) { const u = (ps.getX(i) - x0) / (x1 - x0); uv.setXY(i, ps.getZ(i) < 0 ? 1 - u : u, (ps.getY(i) - y0) / (y1 - y0)); }   // mirror on the far side so lettering reads
  return m;
}
function rustTex(base, seed) {
  return canvasTex(512, 128, (c, w, h) => {
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    const r = rng(seed);
    for (let i = 0; i < 22; i++) { const x = r() * w, y = r() * h; const gr = c.createRadialGradient(x, y, 0, x, y, 3 + r() * 12); gr.addColorStop(0, 'rgba(130,70,30,0.5)'); gr.addColorStop(1, 'rgba(120,60,25,0)'); c.fillStyle = gr; c.fillRect(x - 25, y - 25, 50, 50); }
    for (let i = 0; i < 18; i++) { c.fillStyle = `rgba(110,55,20,${0.12 + r() * 0.18})`; const x = r() * w; c.fillRect(x, r() * h * 0.5, 1 + r() * 2, 10 + r() * 40); }   // drips
    for (let i = 0; i < 120; i++) { c.fillStyle = `rgba(60,60,60,${r() * 0.15})`; c.fillRect(r() * w, r() * h, 2 + r() * 8, 1); }
    c.fillStyle = 'rgba(0,0,0,0.25)'; for (const y of [h * 0.28, h * 0.62]) c.fillRect(0, y, w, 3);   // pressed ribs
    c.fillStyle = 'rgba(255,255,255,0.35)'; for (const y of [h * 0.28 - 3, h * 0.62 - 3]) c.fillRect(0, y, w, 2);
  });
}
export function makeCargoTrike({ cab = false, seed = 1 } = {}) {
  const M = trikeMats(), g = new THREE.Group(), r = rng(seed);
  M.tread = M.tread || treadTex();
  M.alloy = M.alloy || std({ color: '#7a7d80', metalness: 0.6, roughness: 0.35 });
  M.wheelSteel = M.wheelSteel || std({ color: '#b9bab4', metalness: 0.4, roughness: 0.5 });
  M.frame = M.frame || std({ color: '#2a2b2c', metalness: 0.4, roughness: 0.6 });
  // +x forward. front wheel, forks with yellow gaiters, rear steel wheels on an axle with leaf springs
  const FX = 1.25, RX = -0.95, TR = 0.62;
  const fw = magWheel(0.32, 0.1, M); fw.position.set(FX, 0.32, 0); g.add(fw);
  for (const s of [-1, 1]) { const rw = steelWheel(0.3, 0.15, M); rw.position.set(RX, 0.3, s * TR); if (s < 0) rw.rotation.y = Math.PI; g.add(rw); }
  g.add(tube(V(RX, 0.3, -TR), V(RX, 0.3, TR), 0.035, M.frame));
  const diff = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), M.frame); diff.position.set(RX, 0.3, 0); diff.scale.set(1, 1, 1.3); g.add(diff);
  for (const s of [-1, 1]) {
    // leaf spring: stacked curved leaves under the bed rail
    for (let k = 0; k < 4; k++) { const leaf = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.008, 4, 24, 0.5 - k * 0.07), M.frame); leaf.rotation.z = Math.PI * 1.5 - (0.25 - k * 0.035); leaf.position.set(RX, 0.3 + 1.4 + 0.015 * k + 0.04, s * 0.42); g.add(leaf); }
    g.add(tube(V(RX - 0.35, 0.47, s * 0.42), V(RX - 0.35, 0.56, s * 0.42), 0.012, M.frame), tube(V(RX + 0.35, 0.47, s * 0.42), V(RX + 0.35, 0.56, s * 0.42), 0.012, M.frame));
  }
  // forks: stanchions, yellow rubber gaiters, lower legs, brake caliper, fender
  const rake = V(-0.32, 0.78, 0).normalize();
  for (const s of [-1, 1]) {
    const base = V(FX, 0.32, s * 0.085), top = base.clone().addScaledVector(rake, 0.92);
    g.add(tube(base, base.clone().addScaledVector(rake, 0.28), 0.028, cab ? M.black : M.alloy));
    const gaiter = tube(base.clone().addScaledVector(rake, 0.28), base.clone().addScaledVector(rake, 0.5), 0.03, cab ? M.black : M.yellow); g.add(gaiter);
    for (let i = 0; i < 6; i++) { const rr = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 6, 14), cab ? M.black : M.yellow); rr.position.copy(base.clone().addScaledVector(rake, 0.3 + i * 0.035)); rr.quaternion.setFromUnitVectors(V(0, 0, 1), rake); g.add(rr); }
    g.add(tube(base.clone().addScaledVector(rake, 0.5), top, 0.022, M.chrome));
  }
  g.add(box(0.06, 0.07, 0.05, M.black, FX + 0.05, 0.38, -0.06));
  const fend = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.13, 24, 1, true, -0.4, 1.6), cab ? M.black : M.white); fend.rotation.x = Math.PI / 2; fend.position.set(FX, 0.32, 0); fend.material.side = THREE.DoubleSide; g.add(fend);
  const steer = V(FX, 0.32, 0).addScaledVector(rake, 0.95);
  // handlebars with grips, levers, mirrors on stalks, speedo
  g.add(tube(steer.clone().add(V(0, 0.05, -0.34)), steer.clone().add(V(-0.06, 0.07, 0.34)), 0.013, M.chrome));
  for (const s of [-1, 1]) {
    g.add(tube(steer.clone().add(V(-0.03, 0.06, s * 0.3)), steer.clone().add(V(-0.05, 0.07, s * 0.42)), 0.02, M.black));
    g.add(tube(steer.clone().add(V(0.0, 0.08, s * 0.24)), steer.clone().add(V(0.08, 0.06, s * 0.36)), 0.006, M.chrome));
    g.add(tube(steer.clone().add(V(0, 0.07, s * 0.2)), steer.clone().add(V(0.02, 0.38, s * 0.28)), 0.006, M.black));
    const mir = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.13, 0.09), M.black); mir.position.copy(steer.clone().add(V(0.02, 0.44, s * 0.29))); mir.rotation.z = 0.15; g.add(mir);
  }
  if (!cab) {
    // half fairing with headlight cowl + smoked screen (white with the green/red/blue livery)
    const fair = panel([[-0.05, 0.0], [0.4, 0.06], [0.58, 0.26], [0.56, 0.4], [0.42, 0.56], [0.26, 0.62], [0.16, 0.5], [0.04, 0.3], [-0.12, 0.16]], 0.34, M.livery, 0.07);
    fair.position.set(FX - 0.72, 0.6, 0); g.add(fair);
    const hl = cyl(0.075, 0.075, 0.05, M.black, 20); hl.rotation.z = Math.PI / 2; hl.position.set(FX - 0.16, 1.05, 0); g.add(hl);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.065, 20), M.lamp); lens.rotation.y = Math.PI / 2; lens.position.set(FX - 0.13, 1.05, 0); g.add(lens);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.24), std({ color: '#2a3036', transparent: true, opacity: 0.6, roughness: 0.1, side: THREE.DoubleSide })); scr.position.set(FX - 0.24, 1.33, 0); scr.rotation.set(0, Math.PI / 2, -0.55); g.add(scr);
    // fuel tank: black/red with the made-up logo, rounded, knee cut-ins via scale
    const tank = panel([[0, 0], [0.46, 0.04], [0.5, 0.16], [0.4, 0.27], [0.08, 0.28], [-0.04, 0.16]], 0.36, M.tank, 0.08); tank.position.set(0.22, 0.86, 0); g.add(tank);
    const cap2 = cyl(0.035, 0.035, 0.02, M.chrome, 16); cap2.position.set(0.48, 1.15, 0); g.add(cap2);
    // side cover (white with livery) under the seat, black cloth seat with stitch line
    const sc = panel([[0, 0], [0.32, 0], [0.36, 0.2], [0.04, 0.24]], 0.3, M.livery, 0.02); sc.position.set(-0.1, 0.6, 0); g.add(sc);
    const seat = panel([[0, 0], [0.6, 0.0], [0.58, 0.07], [0.3, 0.1], [0.02, 0.09]], 0.3, M.seat, 0.04); seat.position.set(-0.32, 0.86, 0); g.add(seat);
    // engine: crankcase + finned cylinder + head + clutch cover, carburettor, exhaust header to muffler
    const engine = new THREE.Group();
    engine.add(new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.24, 0.3, 3, 0.05), M.engine).translateY(0.12));
    for (let i = 0; i < 7; i++) engine.add(box(0.2, 0.012, 0.24, M.engine, 0.06, 0.28 + i * 0.03, 0));
    engine.add(box(0.2, 0.06, 0.22, M.engine, 0.06, 0.5, 0));
    const clutch = cyl(0.09, 0.09, 0.04, M.alloy, 24); clutch.rotation.x = Math.PI / 2; clutch.position.set(-0.05, 0.13, 0.17); engine.add(clutch);
    const stat = cyl(0.07, 0.07, 0.04, M.black, 20); stat.rotation.x = Math.PI / 2; stat.position.set(0.12, 0.12, -0.17); engine.add(stat);
    for (let i = 0; i < 5; i++) { const b = cyl(0.008, 0.008, 0.01, M.chrome, 6); b.rotation.x = Math.PI / 2; const a = i / 5 * 6.28; b.position.set(-0.05 + Math.cos(a) * 0.07, 0.13 + Math.sin(a) * 0.07, 0.192); engine.add(b); }
    engine.add(box(0.08, 0.06, 0.06, M.alloy, -0.08, 0.42, 0.0));
    engine.position.set(0.48, 0.22, 0); engine.rotation.z = 0.25; g.add(engine);
    const ex = new THREE.CatmullRomCurve3([V(0.66, 0.6, 0.06), V(0.74, 0.32, 0.1), V(0.5, 0.17, 0.12), V(-0.1, 0.18, 0.15), V(-0.55, 0.3, 0.18)]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(ex, 30, 0.025, 8), M.exhaust));
    const muff = cyl(0.05, 0.045, 0.4, M.exhaust, 16); muff.rotation.z = Math.PI / 2 - 0.15; muff.position.set(-0.55, 0.32, 0.18); g.add(muff);
    // frame tubes (down tube + backbone) + chain + rear sprocket on the jackshaft
    g.add(tube(steer.clone().add(V(0.02, -0.08, 0)), V(0.72, 0.32, 0), 0.025, M.frame), tube(steer.clone().add(V(-0.02, -0.04, 0)), V(-0.1, 0.85, 0), 0.025, M.frame));
    const spr = cyl(0.07, 0.07, 0.01, M.black, 20); spr.rotation.x = Math.PI / 2; spr.position.set(0.0, 0.28, -0.1); g.add(spr);
    g.add(tube(V(0.4, 0.28, -0.1), V(0.0, 0.33, -0.1), 0.006, M.frame), tube(V(0.4, 0.22, -0.1), V(0.0, 0.22, -0.1), 0.006, M.frame));
    // foot pegs, kickstand
    for (const s of [-1, 1]) g.add(tube(V(0.12, 0.3, s * 0.14), V(0.12, 0.3, s * 0.26), 0.012, M.black));
  } else {
    // electric front: blue moulded cowl wrapping the fork, cab with framed clear panels
    const cowl = panel([[0, 0], [0.24, 0.02], [0.3, 0.3], [0.26, 0.7], [0.08, 0.74], [-0.02, 0.4]], 0.44, std({ color: '#3a8ac8', roughness: 0.4 }), 0.05);
    cowl.position.set(FX - 0.6, 0.4, 0); g.add(cowl);
    const hl = cyl(0.06, 0.06, 0.04, M.black, 18); hl.rotation.z = Math.PI / 2; hl.position.set(FX - 0.3, 0.95, 0); g.add(hl);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.052, 18), M.lamp); lens.rotation.y = Math.PI / 2; lens.position.set(FX - 0.278, 0.95, 0); g.add(lens);
    g.add(new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.36, 0.6, 3, 0.05), M.black).translateX(0.25).translateY(0.5));      // battery box
    g.add(new THREE.Mesh(new RoundedBoxGeometry(0.45, 0.1, 0.55, 3, 0.04), M.seat).translateX(0.22).translateY(0.73));
    const post = (a, b) => g.add(tube(a, b, 0.02, M.yellow));
    const cf = FX - 0.45, cb = -0.05;
    for (const s of [-1, 1]) { post(V(cf, 0.75, s * 0.42), V(cf - 0.05, 1.9, s * 0.42)); post(V(cb, 0.72, s * 0.48), V(cb, 1.9, s * 0.48)); post(V(cf - 0.05, 1.9, s * 0.42), V(cb, 1.9, s * 0.48)); post(V(cf, 1.25, s * 0.42), V(cb, 1.25, s * 0.48)); }
    post(V(cf - 0.05, 1.9, -0.42), V(cf - 0.05, 1.9, 0.42));
    const roof = new THREE.Mesh(new RoundedBoxGeometry(cf - cb + 0.3, 0.05, 1.1, 3, 0.02), M.white); roof.position.set((cf + cb) / 2, 1.93, 0); g.add(roof);
    g.add(box(cf - cb + 0.2, 0.012, 0.3, M.black, (cf + cb) / 2, 1.96, 0));
    const ws = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 1.1), M.clear); ws.position.set(cf - 0.025, 1.32, 0); ws.rotation.set(0, Math.PI / 2, 0.04); g.add(ws);
    for (const s of [-1, 1]) { const sd = new THREE.Mesh(new THREE.PlaneGeometry(cf - cb, 1.1), M.clear); sd.position.set((cf + cb) / 2, 1.32, s * 0.45); g.add(sd); }
    const wiper = tube(V(cf - 0.02, 0.85, -0.25), V(cf - 0.04, 1.3, 0.05), 0.006, M.black); g.add(wiper);
    // highlights so the plastic reads
    for (const s of [-1, 1]) { const hlt = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.015), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.3 })); hlt.position.set((cf + cb) / 2, 1.5, s * 0.452); hlt.rotation.z = 0.5; g.add(hlt); }
  }
  // bed: steel subframe, floor, white rusty drop-sides with pressed ribs, hinges and latch hooks
  const BX0 = 0.08, BX1 = -2.0, BL = BX0 - BX1, BY = 0.62, BW = 1.38;
  for (const s of [-1, 1]) g.add(box(BL, 0.08, 0.06, M.frame, (BX0 + BX1) / 2, BY - 0.07, s * 0.42));
  for (let i = 0; i < 5; i++) g.add(box(0.05, 0.05, BW - 0.1, M.frame, BX0 - 0.15 - i * 0.45, BY - 0.07, 0));
  g.add(tube(V(0.25, 0.45, 0), V(BX0, BY - 0.07, 0), 0.03, M.frame));
  g.add(box(BL, 0.04, BW, M.bedFloor, (BX0 + BX1) / 2, BY, 0));
  const sideM = std({ map: rustTex('#d8d8d2', seed), roughness: 0.75 });
  for (const s of [-1, 1]) {
    g.add(box(BL, 0.28, 0.03, [sideM, sideM, sideM, sideM, sideM, sideM], (BX0 + BX1) / 2, BY + 0.16, s * (BW / 2 - 0.015)));
    g.add(box(BL, 0.03, 0.05, M.white, (BX0 + BX1) / 2, BY + 0.31, s * (BW / 2 - 0.015)));
    for (const x of [-0.2, -0.9, -1.6]) { g.add(box(0.06, 0.06, 0.02, M.frame, x, BY + 0.05, s * (BW / 2 + 0.005))); g.add(tube(V(x + 0.15, BY + 0.31, s * (BW / 2 + 0.01)), V(x + 0.15, BY + 0.25, s * (BW / 2 + 0.03)), 0.006, M.chrome)); }
  }
  g.add(box(0.03, 0.28, BW, sideM, BX1 + 0.015, BY + 0.16, 0), box(0.03, 0.3, BW, sideM, BX0 - 0.015, BY + 0.17, 0));
  // flat rusty rear mudguards over the rear wheels + mudflaps
  for (const s of [-1, 1]) {
    g.add(box(0.75, 0.02, 0.2, std({ map: rustTex('#4a4a48', seed + 4) }), RX, 0.67, s * (TR + 0.02)));
    g.add(box(0.02, 0.24, 0.2, M.frame, RX - 0.38, 0.55, s * (TR + 0.02)));
    g.add(box(0.012, 0.3, 0.2, M.rubber, RX - 0.4, 0.38, s * (TR + 0.02)));
  }
  // tail lights + made-up plate on the tailgate
  for (const s of [-1, 1]) g.add(box(0.03, 0.06, 0.12, glow(1.6, 0.15, 0.1), BX1 - 0.01, BY + 0.1, s * 0.55));
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.16), std({ map: canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#f4f2ea'; c.fillRect(0, 0, w, h); c.strokeStyle = '#222'; c.lineWidth = 6; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = '#1a1a1a'; fitText(c, 'CITY 12 AB 3456', w / 2, h / 2 + 4, w - 30, 44, '"Bebas Neue"', { spacing: 3 }); }) })).translateX(BX1 - 0.032).translateY(BY + 0.16).rotateY(-Math.PI / 2));
  // load
  if (!cab) {
    // rack posts + top rail at the back, rope coils
    for (const s of [-1, 1]) for (const x of [-0.25, -1.95]) g.add(tube(V(x, BY, s * 0.66), V(x, BY + 1.55, s * 0.66), 0.018, M.frame));
    for (const s of [-1, 1]) g.add(tube(V(-0.25, BY + 1.55, s * 0.66), V(-1.95, BY + 1.55, s * 0.66), 0.016, M.frame));
    // tall red two-door cabinet with a seam, finger hole and edge highlights
    const cabM = std({ color: '#e0321e', roughness: 0.35 });
    const red = new THREE.Mesh(new RoundedBoxGeometry(0.5, 1.15, 0.85, 3, 0.03), cabM); red.position.set(-1.25, BY + 0.6, 0.15); red.castShadow = true; g.add(red);
    g.add(box(0.505, 1.1, 0.006, M.black, -1.25, BY + 0.6, 0.15));
    g.add(new THREE.Mesh(new THREE.CircleGeometry(0.015, 12), M.black).translateX(-0.995).translateY(BY + 0.85).translateZ(-0.05).rotateY(Math.PI / 2));
    // grey galvanised bucket with an orange lid on a black plastic crate
    const crate2 = new THREE.Group();
    crate2.add(box(0.42, 0.3, 0.42, M.black, 0, 0.15, 0));
    for (let i = 0; i < 3; i++) crate2.add(box(0.44, 0.03, 0.44, std({ color: '#2a2a2a' }), 0, 0.05 + i * 0.1, 0));
    crate2.position.set(-0.6, BY, -0.15); g.add(crate2);
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.17, 0.42, 24), std({ color: '#9a9c9a', metalness: 0.5, roughness: 0.4 })); bucket.position.set(-0.6, BY + 0.51, -0.15); g.add(bucket);
    for (const y of [0.35, 0.6]) { const rib = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.006, 6, 24), std({ color: '#7a7c7a', metalness: 0.5 })); rib.rotation.x = Math.PI / 2; rib.position.set(-0.6, BY + y, -0.15); g.add(rib); }
    const lid = cyl(0.23, 0.23, 0.05, std({ color: '#e8762a', roughness: 0.5 }), 24); lid.position.set(-0.6, BY + 0.74, -0.15); g.add(lid);
    // blue tarps: draped sheets over the load (displaced planes, folds), tied with rope
    const tarp = (w, h, x, y, z, ry, rx, sd) => {
      const geo = new THREE.PlaneGeometry(w, h, 14, 14); const p = geo.attributes.position; const rr = rng(sd);
      for (let i = 0; i < p.count; i++) { const u = p.getX(i), v = p.getY(i); p.setZ(i, Math.sin(u * 9 + rr() * 0.5) * 0.04 + Math.sin(v * 7) * 0.03 + (rr() - 0.5) * 0.02); }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, M.tarp); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.castShadow = true; g.add(m);
    };
    tarp(0.7, 1.1, -0.22, BY + 0.85, 0.3, Math.PI / 2, 0.1, 3);
    tarp(0.6, 0.9, -0.22, BY + 0.75, -0.3, Math.PI / 2 + 0.2, -0.1, 4);
    tarp(0.8, 0.7, -1.7, BY + 0.62, 0.35, 0.2, 0, 5);
    tarp(0.7, 0.6, -1.85, BY + 0.55, -0.35, Math.PI / 2, 0, 6);
    const lump = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), M.tarp); lump.scale.set(0.35, 0.35, 0.3); lump.position.set(-1.72, BY + 0.38, -0.3); g.add(lump);
    for (const s of [-1, 1]) {
      const rope = new THREE.CatmullRomCurve3([V(-1.6, BY + 0.31, s * 0.7), V(-1.65, BY + 0.0, s * 0.72), V(-1.55, BY - 0.25, s * 0.7), V(-1.6, BY - 0.4, s * 0.72)]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(rope, 16, 0.007, 5), M.frame));
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.008, 5, 18), M.frame); coil.position.set(-1.6, BY + 0.4, s * 0.7); g.add(coil);
    }
    g.add(tube(V(-0.3, BY + 1.0, -0.3), V(-0.6, BY + 0.31, -0.69), 0.006, std({ color: '#c83a2a' })));
  } else {
    const cb = std({ map: ptex('store_cardboard.png'), roughness: 0.9 });
    for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(new RoundedBoxGeometry(0.5 + r() * 0.2, 0.28 + r() * 0.15, 0.45, 2, 0.01), cb); b.position.set(-1.6 + (i % 3) * 0.55, BY + 0.2 + Math.floor(i / 3) * 0.36, (r() - 0.5) * 0.5); b.rotation.y = (r() - 0.5) * 0.3; b.castShadow = true; g.add(b); }
    for (let i = 0; i < 2; i++) g.add(box(0.48, 0.02, 0.4, cb, -0.6, BY + 0.03 + i * 0.022, 0.3));
    const cooler = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.32, 0.36, 3, 0.04), std({ color: '#2a5aa8', roughness: 0.4 })); cooler.position.set(-0.55, BY + 0.2, -0.3); g.add(cooler);
    g.add(box(0.4, 0.04, 0.05, M.white, -0.55, BY + 0.38, -0.3));
  }
  g.userData.collider = [-2.05, 1.6, -0.8, 0.8];
  return g;
}

// ---------------------------------------------------------------- arcade cabinet
function drawMascot(c, x, y, s, body, belly, flip) {
  // original bubbly dragon: round body, big eyes, spiky back
  c.save(); c.translate(x, y); c.scale(flip ? -s : s, s);
  c.lineWidth = 6; c.strokeStyle = '#1a2a4a';
  c.fillStyle = body;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-60 + i * 30, -50 - i * 6); c.lineTo(-48 + i * 30, -86 - i * 6); c.lineTo(-36 + i * 30, -50 - i * 6); c.fill(); c.stroke(); }
  c.beginPath(); c.ellipse(0, 0, 70, 62, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = belly; c.beginPath(); c.ellipse(16, 20, 38, 34, 0, 0, 7); c.fill();
  c.fillStyle = '#fff'; for (const dx of [6, 40]) { c.beginPath(); c.ellipse(dx, -22, 16, 20, 0, 0, 7); c.fill(); c.stroke(); }
  c.fillStyle = '#1a2a4a'; for (const dx of [10, 44]) { c.beginPath(); c.arc(dx, -18, 7, 0, 7); c.fill(); }
  c.fillStyle = '#e84a6a'; c.beginPath(); c.arc(56, 4, 12, 0.2, Math.PI - 0.2); c.fill();
  c.fillStyle = body; c.beginPath(); c.ellipse(-30, 58, 22, 12, 0, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.ellipse(30, 58, 22, 12, 0, 0, 7); c.fill(); c.stroke();
  c.restore();
}
export function makeArcadeCabinet() {
  const g = new THREE.Group();
  const W = 0.78, D = 0.85;
  const yellow = std({ color: '#e8c21a', roughness: 0.4 });
  const grey = std({ color: '#8a8c90', roughness: 0.45, metalness: 0.1, emissive: '#26272a' });
  const chrome = std({ color: '#c8cbcf', metalness: 0.6, roughness: 0.25 });
  const black = std({ color: '#141516', roughness: 0.4 });
  // side panels as one profile (base, cut-in control shelf, screen slope, marquee box)
  const prof = new THREE.Shape();
  [[0, 0], [D, 0], [D, 0.95], [D + 0.12, 1.02], [D + 0.1, 1.08], [0.72, 1.12], [0.62, 1.7], [0.7, 1.75], [0.74, 2.25], [0, 2.25], [0, 0]].forEach(([z, y], i) => (i ? prof.lineTo(z, y) : prof.moveTo(z, y)));
  for (const s of [-1, 1]) {
    const geo = new THREE.ExtrudeGeometry(prof, { depth: 0.03, bevelEnabled: false });
    geo.rotateY(-Math.PI / 2);
    const side = new THREE.Mesh(geo, grey); side.position.set(s * W / 2 + (s > 0 ? 0.03 : 0), 0, -D); side.castShadow = true; g.add(side);
    // chrome T-molding along the side's front edge
    for (const [a, b] of [[V(0, 0, 0), V(0, 0.95, 0)], [V(0, 1.12, -0.13), V(0, 1.7, -0.23)], [V(0, 1.75, -0.15), V(0, 2.25, -0.11)]]) g.add(tube(a.clone().add(V(s * (W / 2 + 0.015), 0, 0)), b.clone().add(V(s * (W / 2 + 0.015), 0, 0)), 0.012, chrome));
  }
  // lower body: grey with a coin door + service panel
  g.add(box(W, 0.95, 0.04, grey, 0, 0.475, -0.02));
  const cd = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.42, 0.03, 2, 0.01), std({ color: '#5a5c60', metalness: 0.4, roughness: 0.4 })); cd.position.set(0.12, 0.55, 0.01); g.add(cd);
  g.add(box(0.035, 0.08, 0.01, chrome, 0.12, 0.66, 0.03), box(0.06, 0.03, 0.01, glow(1.6, 0.4, 0.2), 0.12, 0.58, 0.03), box(0.08, 0.03, 0.01, black, 0.12, 0.45, 0.03));
  for (const [x, y] of [[-0.22, 0.6], [-0.22, 0.3]]) g.add(box(0.22, 0.22, 0.012, std({ color: '#55575a' }), x, y, 0.004));
  // control panel: printed overlay, 2 joysticks with ball tops, 6 buttons each, start buttons
  const cpTex = canvasTex(512, 160, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#2a8ac8'); gr.addColorStop(0.5, '#e8d23a'); gr.addColorStop(1, '#2a8ac8');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    drawMascot(c, 70, 100, 0.45, '#5ac85a', '#e8f0c8', false);
    c.fillStyle = '#1a2a4a'; fitText(c, '1P', 140, 30, 60, 30, '"Bungee"'); fitText(c, '2P', 380, 30, 60, 30, '"Bungee"');
  });
  const cp = box(W, 0.04, 0.32, [black, black, std({ map: cpTex, roughness: 0.35 }), black, black, black], 0, 1.04, 0.1);
  cp.rotation.x = 0.18; g.add(cp);
  const cols = ['#d82a2a', '#e8c21a', '#2a8a3a', '#2a5ad8', '#e8e8e8', '#d82a2a'];
  for (const s of [-1, 1]) {
    const jx = s * 0.22 - 0.08;
    const shaft = cyl(0.008, 0.008, 0.08, chrome); shaft.position.set(jx, 1.1, 0.12); g.add(shaft);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.025, 14, 10), std({ color: '#f2f2ee', roughness: 0.25 })); ball.position.set(jx, 1.15, 0.12); g.add(ball);
    for (let i = 0; i < 6; i++) {
      const b = cyl(0.016, 0.016, 0.02, std({ color: cols[i], roughness: 0.3 }), 14);
      b.position.set(jx + 0.08 + (i % 3) * 0.045, 1.065 - Math.floor(i / 3) * 0.005, 0.1 + Math.floor(i / 3) * 0.045); b.rotation.x = 0.18; g.add(b);
    }
  }
  g.add(box(0.05, 0.02, 0.03, glow(1.4, 1.4, 1.4), 0, 1.07, 0.02));
  // screen: bezel + lit CRT showing an original platform game
  const screen = canvasTex(320, 240, (c, w, h) => {
    c.fillStyle = '#0a0a2a'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#e8762a'; for (const [x, y, l] of [[20, 200, 280], [40, 150, 90], [190, 150, 90], [90, 100, 140], [20, 50, 70], [230, 50, 70]]) { c.fillRect(x, y, l, 10); c.fillStyle = '#c84a1a'; c.fillRect(x, y + 10, l, 3); c.fillStyle = '#e8762a'; }
    drawMascot(c, 80, 180, 0.22, '#5ac85a', '#e8f0c8', false);
    drawMascot(c, 250, 128, 0.18, '#5aa8e8', '#e8f0f8', true);
    c.strokeStyle = 'rgba(160,220,255,0.8)'; c.lineWidth = 2; for (const [x, y] of [[150, 80], [170, 70], [120, 130]]) { c.beginPath(); c.arc(x, y, 12, 0, 7); c.stroke(); }
    c.fillStyle = '#fff'; c.font = '16px "VT323"'; c.fillText('1UP 004320', 10, 18); c.fillText('HI 050000', 200, 18);
    c.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
  });
  const sm = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.47), new THREE.MeshBasicMaterial({ map: screen, color: new THREE.Color(1.15, 1.15, 1.15), toneMapped: false }));
  const ang = Math.atan2(0.1, 0.58);
  sm.position.set(0, 1.42, -0.18); sm.rotation.x = -ang; g.add(sm);
  const bez = box(W, 0.6, 0.02, yellow, 0, 1.42, -0.2); bez.rotation.x = -ang; g.add(bez);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.5), new THREE.MeshStandardMaterial({ color: '#cfe0e8', transparent: true, opacity: 0.12, roughness: 0.02, metalness: 0.5 }));
  gl.position.set(0, 1.42, -0.165); gl.rotation.x = -ang; g.add(gl);
  // speaker panel with two round grilles
  g.add(box(W, 0.12, 0.08, yellow, 0, 1.78, -0.12));
  for (const s of [-1, 1]) { const sp = cyl(0.05, 0.05, 0.02, black, 20); sp.rotation.x = Math.PI / 2; sp.position.set(s * 0.2, 1.78, -0.075); g.add(sp); for (let i = 0; i < 4; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.012 + i * 0.01, 0.002, 4, 16), chrome); ring.position.set(s * 0.2, 1.78, -0.064); g.add(ring); } }
  // marquee: lit backlit art (made-up title)
  const mq = canvasTex(768, 300, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#e8f05a'); gr.addColorStop(1, '#a8d82a');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 30; i++) { c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 8, 0, 7); c.fill(); }
    drawMascot(c, 130, 160, 0.9, '#5aa8e8', '#e8f0f8', false);
    drawMascot(c, 650, 180, 0.65, '#5ac85a', '#e8f0c8', true);
    c.fillStyle = '#e8762a'; c.beginPath(); c.ellipse(w / 2, h / 2 + 10, 200, 70, 0, 0, 7); c.fill();
    c.strokeStyle = '#7a2a0a'; c.lineWidth = 6; c.stroke();
    c.fillStyle = '#fff'; c.strokeStyle = '#7a2a0a'; c.lineWidth = 8;
    fitText(c, 'BUBBLE BOUNCE', w / 2, h / 2 + 10, 340, 60, '"Shrikhand"', { stroke: 1 });
  });
  const marquee = box(W + 0.02, 0.42, 0.16, [yellow, yellow, yellow, yellow, new THREE.MeshBasicMaterial({ map: mq, color: new THREE.Color(1.2, 1.2, 1.2), toneMapped: false }), yellow], 0, 2.04, -0.07);
  g.add(marquee);
  for (const y of [1.83, 2.25]) g.add(box(W + 0.04, 0.02, 0.17, chrome, 0, y, -0.07));
  // taped handwritten note on the marquee (made-up: "OUT OF ORDER?")
  const note = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.2), std({ map: canvasTex(128, 160, (c, w, h) => { c.fillStyle = '#f6f4ec'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1a'; fitText(c, 'PLEASE', w / 2, 50, 110, 30, '"Caveat"', { weight: '700' }); fitText(c, 'BE GENTLE', w / 2, 90, 110, 26, '"Caveat"', { weight: '700' }); c.fillStyle = 'rgba(220,220,200,0.7)'; c.fillRect(30, 0, 60, 14); }) }));
  note.position.set(0.3, 1.95, 0.015); note.rotation.z = 0.08; note.scale.setScalar(0.75); g.add(note);
  g.add(box(W, 0.04, D, grey, 0, 2.27, -D / 2));
  // green turf mat in front
  const turf = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#2f7a3a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { c.fillStyle = Math.random() < 0.5 ? '#3f8a44' : '#256a30'; c.fillRect(Math.random() * w, Math.random() * h, 1, 3); } });
  turf.repeat.set(3, 3);
  g.add(box(1.0, 0.015, 1.4, std({ map: turf, roughness: 1 }), 0, 0.008, 0.2));
  // side art decals (mascot + bubbles + title) on both sides
  const sideArt = canvasTex(512, 768, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.fillStyle = 'rgba(232,194,26,0.95)'; c.beginPath(); c.moveTo(0, h * 0.2); c.quadraticCurveTo(w * 0.7, h * 0.05, w, h * 0.3); c.lineTo(w, h * 0.75); c.quadraticCurveTo(w * 0.4, h * 0.95, 0, h * 0.7); c.fill();
    drawMascot(c, w * 0.42, h * 0.48, 1.3, '#5aa8e8', '#e8f0f8', false);
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 6; for (const [x, y, rr] of [[380, 180, 30], [420, 260, 18], [110, 220, 22], [440, 520, 26]]) { c.beginPath(); c.arc(x, y, rr, 0, 7); c.stroke(); }
    c.fillStyle = '#e8762a'; c.strokeStyle = '#7a2a0a'; c.lineWidth = 8; fitText(c, 'BUBBLE', w / 2, h * 0.78, w * 0.8, 70, '"Shrikhand"', { stroke: 1 }); fitText(c, 'BOUNCE', w / 2, h * 0.87, w * 0.8, 70, '"Shrikhand"', { stroke: 1 });
  });
  for (const s of [-1, 1]) {
    const art = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.93), new THREE.MeshStandardMaterial({ map: sideArt, transparent: true, roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -2 }));
    art.position.set(s * (W / 2 + 0.032), 1.45, -0.42); art.rotation.y = s * Math.PI / 2; g.add(art);
  }
  // kick plate, levelling feet, rear vent grille + power cord, back door
  g.add(box(W + 0.02, 0.1, 0.03, std({ color: '#2a2b2d', metalness: 0.5, roughness: 0.4 }), 0, 0.05, 0.005));
  for (const sx of [-1, 1]) for (const z of [-0.05, -D + 0.05]) { const f = cyl(0.03, 0.035, 0.03, black, 12); f.position.set(sx * (W / 2 - 0.06), 0.015, z); g.add(f); }
  for (let i = 0; i < 8; i++) g.add(box(0.4, 0.012, 0.01, black, 0, 1.6 + i * 0.04, -D - 0.005));
  const cord = new THREE.CatmullRomCurve3([V(0.25, 0.3, -D - 0.01), V(0.3, 0.1, -D - 0.15), V(0.5, 0.012, -D - 0.4), V(0.9, 0.012, -D - 0.6)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(cord, 20, 0.008, 6), black));
  // coin door detail: two coin slots with lit "25" inserts, return buttons, keyhole
  for (const dx of [-0.06, 0.06]) {
    g.add(box(0.06, 0.09, 0.012, chrome, 0.12 + dx, 0.66, 0.032));
    g.add(box(0.006, 0.04, 0.006, black, 0.12 + dx, 0.67, 0.04));
    g.add(box(0.035, 0.015, 0.004, glow(1.6, 0.5, 0.2), 0.12 + dx, 0.635, 0.039));
  }
  const key = cyl(0.012, 0.012, 0.012, chrome, 12); key.rotation.x = Math.PI / 2; key.position.set(0.12, 0.42, 0.034); g.add(key);
  // red plastic stool beside it (photo)
  const stool = new THREE.Group();
  const redP = std({ color: '#d8201e', roughness: 0.45 });
  const top = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.035, 0.34, 3, 0.012), redP); top.position.y = 0.45; stool.add(top);
  for (let i = 0; i < 9; i++) { const h2 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8), std({ color: '#2a0a0a' })); h2.position.set(-0.1 + (i % 3) * 0.1, 0.46, -0.1 + Math.floor(i / 3) * 0.1); stool.add(h2); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const leg = box(0.05, 0.45, 0.05, redP, sx * 0.15, 0.225, sz * 0.15); leg.rotation.z = -sx * 0.06; leg.rotation.x = sz * 0.06; stool.add(leg); }
  for (const sz of [-1, 1]) stool.add(box(0.3, 0.03, 0.02, redP, 0, 0.12, sz * 0.155));
  stool.position.set(W / 2 + 0.45, 0, 0.35); stool.rotation.y = 0.4; g.add(stool);
  const l = new THREE.PointLight('#e8f0a0', 1.4, 3, 2); l.position.set(0, 1.7, 0.6); g.add(l);
  g.userData.collider = [-W / 2 - 0.05, W / 2 + 0.7, -D, 0.6];
  return g;
}

// ---------------------------------------------------------------- graffiti shop front + pallet
export function makePallet() {
  const g = new THREE.Group();
  const boardTex = (seed, tint) => canvasTex(256, 48, (c, w, h) => {
    c.fillStyle = tint; c.fillRect(0, 0, w, h); const r = rng(seed);
    for (let i = 0; i < 40; i++) { c.strokeStyle = `rgba(110,65,30,${0.12 + r() * 0.2})`; c.lineWidth = 1 + r(); c.beginPath(); const y = r() * h; c.moveTo(0, y); c.bezierCurveTo(w * 0.3, y + 3, w * 0.6, y - 3, w, y + 1); c.stroke(); }
    for (let i = 0; i < 2 + r() * 2; i++) { const x = r() * w, y = r() * h; c.fillStyle = '#6a3e1c'; c.beginPath(); c.ellipse(x, y, 5, 3, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(80,40,15,0.5)'; c.beginPath(); c.ellipse(x, y, 9, 6, 0, 0, 7); c.stroke(); }
    c.fillStyle = 'rgba(40,40,40,0.25)'; c.fillRect(0, h - 4, w, 4);
    c.fillStyle = '#2a2a2a'; for (const x of [10, w / 2, w - 12]) { c.fillRect(x, 10, 3, 3); c.fillRect(x, h - 16, 3, 3); }   // nails
  });
  const tints = ['#d8a468', '#c8925a', '#dcb078', '#b8844e'];
  for (let i = 0; i < 7; i++) g.add(box(1.0, 0.1, 0.022, std({ map: boardTex(i + 3, tints[i % 4]), roughness: 0.85 }), 0, 0.06 + i * 0.19, 0.0));    // top deck
  for (let i = 0; i < 3; i++) g.add(box(1.0, 0.1, 0.022, std({ map: boardTex(i + 13, tints[(i + 1) % 4]), roughness: 0.85 }), 0, 0.06 + i * 0.57, -0.14));   // bottom deck
  for (const x of [-0.45, 0, 0.45]) {
    g.add(box(0.09, 1.25, 0.022, std({ map: boardTex(x * 10 + 30, '#b8844e'), roughness: 0.85 }), x, 0.62, -0.03));
    for (const y of [0.06, 0.62, 1.18]) g.add(box(0.1, 0.1, 0.1, std({ color: '#a87a48', roughness: 0.9 }), x, y, -0.085));      // blocks
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
export function makeGraffitiFront(W = 4.4) {
  const g = new THREE.Group();
  const H1 = 2.8;
  const conc = std({ map: ptex('gf_concrete.png', 1, 2), roughness: 0.95 });
  const metal = std({ color: '#c8cacc', metalness: 0.35, roughness: 0.5, map: canvasTex(64, 256, (c, w, h) => { for (let x = 0; x < w; x += 8) { const gg = c.createLinearGradient(x, 0, x + 8, 0); gg.addColorStop(0, '#9a9da0'); gg.addColorStop(0.5, '#d8dadc'); gg.addColorStop(1, '#8a8d90'); c.fillStyle = gg; c.fillRect(x, 0, 8, h); } }) });
  metal.map.repeat.set(W / 0.5, 1);
  // corrugated upper wall
  g.add(box(W, 2.2, 0.15, metal, 0, H1 + 1.5 + 1.1, -0.1));
  // cracked concrete pier on the left + right
  g.add(box(0.5, H1 + 1.5, 0.4, conc, -W / 2 - 0.25, (H1 + 1.5) / 2, -0.05));
  g.add(box(0.3, H1 + 1.5, 0.3, std({ color: '#5a6a78', roughness: 0.6 }), W / 2 + 0.15, (H1 + 1.5) / 2, -0.05));
  // weathered shop sign: mauve board, made-up raised letters + small lines + phone
  const sign = canvasTex(1024, 300, (c, w, h) => {
    c.fillStyle = '#7a5a5e'; c.fillRect(0, 0, w, h);
    const r = rng(9); for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '40,30,30' : '200,180,180'},${r() * 0.12})`; c.fillRect(r() * w, r() * h, 2 + r() * 20, 1 + r() * 3); }
    c.fillStyle = 'rgba(30,20,20,0.35)'; c.fillRect(0, h - 26, w, 26);
    c.fillStyle = '#e8e2d2';
    ['HEATERS', 'BOILERS', 'REPAIRS', 'PARTS'].forEach((t, i) => fitText(c, t, 120, 70 + i * 46, 190, 34, '"Oswald"', { weight: '600', align: 'center', spacing: 3 }));
    c.fillStyle = '#efe6d0'; c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowOffsetX = 4; c.shadowOffsetY = 4;
    fitText(c, 'KWANG ELECTRIC', 620, 120, 620, 120, '"Bebas Neue"', { spacing: 10 });
    c.shadowColor = 'transparent';
    fitText(c, '2279 · 0000', 820, 240, 260, 44, '"Oswald"', { weight: '600', spacing: 4 });
  });
  g.add(box(W - 0.1, 0.95, 0.15, [std({ color: '#6a4a4e' }), std({ color: '#6a4a4e' }), std({ color: '#6a4a4e' }), std({ color: '#6a4a4e' }), std({ map: sign, roughness: 0.7 }), std({ color: '#6a4a4e' })], 0, H1 + 1.0, 0.0));
  g.add(box(W, 0.06, 0.2, std({ color: '#8a6a6e' }), 0, H1 + 1.5, 0.0));
  // two faded sub-signs over the shutters (green-grey enamel, made-up)
  const sub = (txt, x, w) => {
    const t = canvasTex(512, 96, (c, cw, ch) => { c.fillStyle = '#7a9a9a'; c.fillRect(0, 0, cw, ch); const r = rng(txt.length); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '40,40,40'},${r() * 0.2})`; c.fillRect(r() * cw, r() * ch, 3 + r() * 30, 2 + r() * 6); } c.fillStyle = '#e8f0ee'; fitText(c, txt, cw / 2, ch / 2 + 2, cw - 60, 60, '"Oswald"', { weight: '600', spacing: 4 }); });
    g.add(box(w, 0.32, 0.06, [std({ color: '#6a8a8a' }), std({ color: '#6a8a8a' }), std({ color: '#6a8a8a' }), std({ color: '#6a8a8a' }), std({ map: t, roughness: 0.6 }), std({ color: '#6a8a8a' })], x, H1 + 0.32, 0.04));
  };
  const aw = W * 0.42, bw = W * 0.52;
  const ax = -W / 2 + aw / 2 + 0.03, bx = W / 2 - bw / 2 - 0.03;
  sub('KWANG HEAT', ax, aw); sub('SHOWROOM', bx, bw);
  g.add(box(W, 0.36, 0.2, std({ color: '#3a3c3e' }), 0, H1 + 0.32, -0.08));
  // shutters (photo textures), box housings, guide rails, bottom bars
  const shutter = (tex, x, w, h) => {
    g.add(box(w, h, 0.05, std({ map: ptex(tex), roughness: 0.55, metalness: 0.3 }), x, h / 2, 0.0));
    for (const s of [-1, 1]) g.add(box(0.05, h, 0.08, std({ color: '#7a7d80', metalness: 0.5 }), x + s * (w / 2 + 0.02), h / 2, 0.02));
    g.add(box(w, 0.05, 0.07, std({ color: '#5a5d60', metalness: 0.5 }), x, 0.025, 0.02));
    g.add(box(0.12, 0.04, 0.03, std({ color: '#2a2a2a' }), x, 0.15, 0.04));
  };
  shutter('gf_shutter_a.png', ax, aw, H1 - 0.15);
  shutter('gf_shutter_b.png', bx, bw, H1 - 0.15);
  // security sticker (generic) + flyer on the pier
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), std({ map: canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#2a5ad8'; c.beginPath(); c.moveTo(w / 2, 4); c.lineTo(w - 4, h / 2); c.lineTo(w / 2, h - 4); c.lineTo(4, h / 2); c.fill(); c.fillStyle = '#fff'; fitText(c, 'GUARD', w / 2, h / 2, 80, 30, '"Bebas Neue"', { spacing: 2 }); }), transparent: true })).translateX(-W / 2 - 0.25).translateY(1.6).translateZ(0.155));
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.42), std({ map: canvasTex(128, 180, (c, w, h) => { c.fillStyle = '#f2f0ea'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2a2a'; for (let i = 0; i < 9; i++) c.fillRect(12, 30 + i * 15, 60 + (i * 37) % 44, 4); c.fillStyle = '#d82a2a'; c.fillRect(12, 10, 104, 12); }) })).translateX(-W / 2 - 0.25).translateY(2.3).translateZ(0.155));
  // shutter roll housings (rounded boxes over each shutter), bottom lock bar with a padlock
  for (const [x, w] of [[ax, aw], [bx, bw]]) {
    const hsg = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, w + 0.08, 20, 1, false, 0, Math.PI), std({ color: '#8a8d90', metalness: 0.5, roughness: 0.5 }));
    hsg.rotation.z = Math.PI / 2; hsg.rotation.y = 0; hsg.position.set(x, H1 - 0.05, 0.02); g.add(hsg);
    g.add(box(w * 0.4, 0.04, 0.04, std({ color: '#3a3c3e', metalness: 0.6 }), x, 0.12, 0.06));
    const lockBody = box(0.06, 0.07, 0.03, std({ color: '#b8923a', metalness: 0.7, roughness: 0.3 }), x + w * 0.1, 0.07, 0.08); g.add(lockBody);
    const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.005, 6, 12, Math.PI), std({ color: '#c8cbcf', metalness: 0.8 })); shackle.position.set(x + w * 0.1, 0.105, 0.08); g.add(shackle);
  }
  // grey conduit + electric meter box on the pier, cable to the sign
  const pipe = std({ color: '#a8aaa8', roughness: 0.6 });
  g.add(tube(V(-W / 2 - 0.08, 0.3, 0.17), V(-W / 2 - 0.08, H1 + 1.6, 0.17), 0.025, pipe));
  g.add(tube(V(-W / 2 - 0.08, H1 + 1.6, 0.17), V(-W / 2 + 0.3, H1 + 1.6, 0.17), 0.02, pipe));
  const meter = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.36, 0.14, 3, 0.02), std({ color: '#c8c8c0', roughness: 0.5 })); meter.position.set(-W / 2 - 0.3, 1.2, 0.22); g.add(meter);
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.07, 20), std({ color: '#e8eef0', roughness: 0.1, metalness: 0.2 })); dial.position.set(-W / 2 - 0.3, 1.24, 0.292); g.add(dial);
  for (const y of [0.85, 1.55]) g.add(box(0.05, 0.03, 0.06, pipe, -W / 2 - 0.08, y, 0.17));
  // left neighbour: stairwell entrance with dark steps + a green shop sign over it (made-up)
  const nb = new THREE.Group();
  nb.add(box(1.6, 0.02, 1.5, std({ color: '#7a7a76' }), 0, 0.01, -0.6));
  for (let i = 0; i < 6; i++) nb.add(box(1.2, 0.17, 0.3, std({ color: '#5a5a58', roughness: 0.9 }), 0, 0.085 + i * 0.17, -0.8 - i * 0.28));
  nb.add(box(1.6, 3.2, 0.05, std({ color: '#cfccc4', roughness: 0.9 }), 0, 1.6, -2.4));
  for (const sx of [-1, 1]) nb.add(box(0.05, 3.2, 2.4, std({ color: '#d8d6ce', roughness: 0.9 }), sx * 0.8, 1.6, -1.2));
  const gs2 = canvasTex(512, 160, (c, w, h) => { c.fillStyle = '#4a7a6a'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8e2c8'; c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowOffsetX = 3; c.shadowOffsetY = 3; fitText(c, 'JEWEL', w / 2, h / 2 + 4, w - 60, 110, '"Bebas Neue"', { spacing: 12 }); });
  nb.add(box(1.6, 0.6, 0.12, [std({ color: '#3a6a5a' }), std({ color: '#3a6a5a' }), std({ color: '#3a6a5a' }), std({ color: '#3a6a5a' }), std({ map: gs2 }), std({ color: '#3a6a5a' })], 0, 3.5, 0.06));
  nb.add(box(1.6, 0.3, 0.06, std({ map: canvasTex(256, 32, (c, w, h) => { for (let y = 0; y < h; y += 8) { c.fillStyle = ['#d8d8d2', '#c8323a', '#e8c23a', '#d8d8d2'][y / 8 % 4]; c.fillRect(0, y, w, 8); } }) }), 0, 3.05, 0.04));
  nb.position.set(-W / 2 - 1.3, 0, 0.0); g.add(nb);
  // pallet leaning against the right shutter
  const p = makePallet(); p.position.set(bx + 0.35, 0, 0.45); p.rotation.x = -0.15; p.rotation.y = -0.12; g.add(p);
  // black bin by the shutter
  g.add(box(0.32, 0.5, 0.3, std({ color: '#1a1a1c', roughness: 0.5 }), bx - bw / 2 + 0.25, 0.25, 0.3));
  g.userData.collider = [-W / 2 - 0.5, W / 2 + 0.3, -0.3, 0.8];
  g.userData.collider2 = [-W / 2 - 2.1, -W / 2 - 0.5, -2.5, 0.05];
  return g;
}
