// Fabric library (queue item 56, photos/fabric/). The user's fabric photos as cloth (tools/tex_56.py): dark knit,
// black fleece, black velour, dark denim with the photo's cargo-pocket flap, faded grey speckled cotton, and two
// flannels (black/grey/white/red and navy/tan) rebuilt as tileable plaids in the photos' colours and twill fuzz.
//   fabricMat(name, scale)     cloth material; scale = metres per texture tile
//   makeTop({ fab, hood, pocket, buttons, sleeves })   a top on a wire hanger (hook at the origin, hangs down -y,
//                              faces +z): flannel shirt, hoodie, fleece, velour track jacket, tee
//   makeJeans({ fab, cargo })  jeans on a clip hanger, the cargo pocket flap (photo) on the thigh
//   makeClothesRack()          chrome rolling rack, 1.5 m, garments hung side-on + one face-out on the end hook
//   makeFoldedTable()          folding table of folded stacks, a plaid blanket draped over the edge and a
//                              hand-lettered cardboard sign
//   makeThriftCorner()         rack + table + sign, ~3 x 1.2 m, front toward +z
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name) { if (_T[name]) return _T[name]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return (_T[name] = t); }
const SCALE = { fb_plaid_red: 0.16, fb_plaid_navy: 0.2, fb_knit: 0.25, fb_fleece: 0.25, fb_velour: 0.3, fb_denim: 0.22, fb_cotton: 0.3 };
const SHEEN = { fb_velour: 0.55, fb_fleece: 1, fb_knit: 0.95 };
export function fabricMat(name, scale = SCALE[name] || 0.25) {
  const t = tex(name).clone(); t.needsUpdate = true; t.repeat.set(1 / scale, 1 / scale);
  return new THREE.MeshStandardMaterial({ map: t, roughness: SHEEN[name] ?? 0.92, side: THREE.DoubleSide });
}
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.5, ...o }); }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const chrome = std({ color: '#c8ccd0', metalness: 0.85, roughness: 0.25 });
function rod(a, b, r, mat, p) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 10), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; p.add(m); return m; }

// cloth panel from a 2D outline: extruded thin, edges rounded, then rippled into soft vertical folds and
// bellied out a little at the chest so it doesn't read as a cut-out
function clothPanel(shape, mat, depth = 0.05, seed = 1) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 10, steps: 1 });
  geo.translate(0, 0, -depth / 2);
  // subdivide-ish: Extrude caps are triangulated from the outline only, so folds come from the outline points;
  // add the ripple on the side walls and shade the caps with a normal tweak via vertex z
  const p = geo.attributes.position, r = rng(seed), ph = r() * 6;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const fold = 0.012 * Math.sin(x * 38 + ph) * Math.min(1, -y * 2.5) + 0.02 * Math.exp(-((y + 0.22) ** 2) / 0.02) * Math.sign(z || 1); p.setZ(i, z + fold); }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m;
}
function hanger(p, clip = false) {
  const wire = std({ color: clip ? '#2a2a2c' : '#b8bcc0', metalness: clip ? 0.2 : 0.8, roughness: 0.35 });
  const hk = []; for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI * 1.3 - 0.2; hk.push(new THREE.Vector3(Math.cos(a) * 0.025, 0.035 + Math.sin(a) * 0.025, 0)); }
  hk.push(new THREE.Vector3(0, -0.01, 0));
  p.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hk), 20, 0.003, 6), wire));
  if (clip) { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.02, 0.012), wire); bar.position.y = -0.03; p.add(bar); for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.035, 0.02), wire); c.position.set(s * 0.15, -0.05, 0); p.add(c); } }
  else { const sh = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.2, -0.1, 0), new THREE.Vector3(-0.1, -0.05, 0), new THREE.Vector3(0, -0.012, 0), new THREE.Vector3(0.1, -0.05, 0), new THREE.Vector3(0.2, -0.1, 0)]); p.add(new THREE.Mesh(new THREE.TubeGeometry(sh, 20, 0.004, 6), wire)); }
}
// a top: torso + sleeves hanging down along the sides, collar or hood, optional pocket/buttons
export function makeTop({ fab = 'fb_plaid_red', hood = false, pocket = false, buttons = false, zip = false, sleeves = 'long', seed = 3 } = {}) {
  const g = new THREE.Group(); g.name = `top_${fab}`;
  hanger(g);
  const mat = fabricMat(fab), W = 0.25, L = 0.72, SH = -0.09;
  const s = new THREE.Shape();
  s.moveTo(-0.06, SH + 0.02); s.lineTo(-0.2, SH - 0.02); s.quadraticCurveTo(-W, SH - 0.05, -W, SH - 0.14);
  s.lineTo(-W + 0.01, SH - L + 0.03); s.quadraticCurveTo(-W + 0.02, SH - L, -W + 0.06, SH - L - 0.01);
  s.quadraticCurveTo(0, SH - L + (buttons ? 0.03 : -0.01), W - 0.06, SH - L - 0.01); s.quadraticCurveTo(W - 0.02, SH - L, W - 0.01, SH - L + 0.03);
  s.lineTo(W, SH - 0.14); s.quadraticCurveTo(W, SH - 0.05, 0.2, SH - 0.02); s.lineTo(0.06, SH + 0.02); s.quadraticCurveTo(0, SH - 0.04, -0.06, SH + 0.02);
  g.add(clothPanel(s, mat, 0.06, seed));
  // sleeves: long tubes hanging at the sides, slightly forward, cuffs turned
  const len = sleeves === 'long' ? 0.6 : 0.2;
  for (const sd of [-1, 1]) {
    const pts = [new THREE.Vector3(sd * 0.21, SH - 0.06, 0), new THREE.Vector3(sd * 0.27, SH - 0.16, 0.01), new THREE.Vector3(sd * 0.285, SH - 0.06 - len * 0.6, 0.03), new THREE.Vector3(sd * 0.275, SH - 0.06 - len, 0.035)];
    const sl = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, sleeves === 'long' ? 0.05 : 0.065, 10), mat); sl.castShadow = true; g.add(sl);
    if (sleeves === 'long') { const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.047, 0.06, 12), mat); cuff.position.copy(pts[3]); cuff.position.y -= 0.01; g.add(cuff); }
  }
  if (hood) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.6), mat); h.scale.set(1, 0.9, 0.55); h.rotation.x = Math.PI * 0.55; h.position.set(0, SH - 0.03, -0.05); h.castShadow = true; g.add(h);
    for (const sd of [-1, 1]) { const str = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.22, 6), std({ color: '#d8d6d0' })); str.position.set(sd * 0.04, SH - 0.13, 0.068); g.add(str); }
  } else {
    // collar
    for (const sd of [-1, 1]) { const c = new THREE.Shape(); c.moveTo(0, 0); c.lineTo(sd * 0.085, 0.01); c.lineTo(sd * 0.06, -0.075); c.lineTo(0, -0.04); const cm = new THREE.Mesh(new THREE.ShapeGeometry(c), mat); cm.position.set(0, SH + 0.01, 0.066); cm.rotation.x = -0.2; g.add(cm); }
  }
  if (pocket) { const k = new THREE.Shape(); k.moveTo(-0.13, 0); k.lineTo(0.13, 0); k.lineTo(0.16, -0.17); k.lineTo(-0.16, -0.17); const pm = new THREE.Mesh(new THREE.ShapeGeometry(k), mat); pm.position.set(0, SH - L + 0.27, 0.066); g.add(pm); }
  if (buttons) {
    const bm = std({ color: '#e6e2d8', roughness: 0.3 });
    for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.004, 10), bm); b.rotation.x = Math.PI / 2; b.position.set(0, SH - 0.08 - i * 0.11, 0.07); g.add(b); }
    for (const sd of [-1, 1]) { const ch = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.12), mat); ch.position.set(sd * 0.1, SH - 0.2, 0.066); g.add(ch); const fl = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.03, 0.006), mat); fl.position.set(sd * 0.1, SH - 0.14, 0.069); g.add(fl); }
  }
  if (zip) { const z = new THREE.Mesh(new THREE.BoxGeometry(0.01, L - 0.06, 0.004), std({ color: '#141416', metalness: 0.4 })); z.position.set(0, SH - L / 2 - 0.02, 0.066); g.add(z); const pull = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.03, 0.006), chrome); pull.position.set(0, SH - 0.06, 0.07); g.add(pull); }
  return g;
}
export function makeJeans({ fab = 'fb_denim', cargo = true, seed = 5 } = {}) {
  const g = new THREE.Group(); g.name = 'jeans';
  hanger(g, true);
  const mat = fabricMat(fab), T = -0.05, L = 1.0;
  const s = new THREE.Shape();
  s.moveTo(-0.19, T); s.lineTo(0.19, T); s.lineTo(0.2, T - 0.3); s.lineTo(0.17, T - L); s.lineTo(0.03, T - L); s.lineTo(0.01, T - 0.34); s.lineTo(-0.01, T - 0.34); s.lineTo(-0.03, T - L); s.lineTo(-0.17, T - L); s.lineTo(-0.2, T - 0.3); s.lineTo(-0.19, T);
  g.add(clothPanel(s, mat, 0.07, seed));
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.045, 0.085), mat); band.position.y = T - 0.022; g.add(band);
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.005, 12), std({ color: '#8a8478', metalness: 0.8, roughness: 0.3 })); btn.rotation.x = Math.PI / 2; btn.position.set(0, T - 0.022, 0.046); g.add(btn);
  if (cargo) {
    const pk = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.075), std({ map: (() => { const t = tex('fb_pocket').clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; })(), roughness: 0.9 }));
    pk.position.set(-0.11, T - 0.47, 0.074); g.add(pk);
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.17, 0.015), mat); bag.position.set(-0.11, T - 0.57, 0.066); g.add(bag);
  }
  return g;
}
const GARMENTS = [
  () => makeTop({ fab: 'fb_plaid_red', buttons: true, seed: 1 }),
  () => makeTop({ fab: 'fb_knit', hood: true, pocket: true, seed: 2 }),
  () => makeTop({ fab: 'fb_plaid_navy', buttons: true, seed: 3 }),
  () => makeTop({ fab: 'fb_fleece', zip: true, seed: 4 }),
  () => makeJeans({ cargo: true, seed: 5 }),
  () => makeTop({ fab: 'fb_velour', zip: true, seed: 6 }),
  () => makeTop({ fab: 'fb_cotton', sleeves: 'short', seed: 7 }),
  () => makeJeans({ cargo: false, seed: 8 }),
  () => makeTop({ fab: 'fb_plaid_red', buttons: true, seed: 9 }),
];
export function makeClothesRack() {
  const g = new THREE.Group(); g.name = 'clothes_rack';
  const W = 1.5, H = 1.62, V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  for (const sx of [-1, 1]) {
    rod(V3(sx * W / 2, 0.08, 0), V3(sx * W / 2, H, 0), 0.014, chrome, g);
    rod(V3(sx * W / 2, 0.08, -0.25), V3(sx * W / 2, 0.08, 0.25), 0.014, chrome, g);
    for (const sz of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.025, 14), std({ color: '#1a1a1a', roughness: 0.8 })); w.rotation.z = Math.PI / 2; w.position.set(sx * W / 2, 0.035, sz * 0.24); g.add(w); }
  }
  rod(V3(-W / 2 - 0.02, H, 0), V3(W / 2 + 0.02, H, 0), 0.013, chrome, g);
  rod(V3(W / 2, H - 0.05, 0), V3(W / 2 + 0.3, H - 0.05, 0), 0.01, chrome, g);   // the face-out arm at the end
  const r = rng(56);
  GARMENTS.slice(0, 8).forEach((mk, i) => { const gm = mk(); gm.position.set(-W / 2 + 0.16 + i * 0.165, H + 0.008, 0); gm.rotation.y = Math.PI / 2 + (r() - 0.5) * 0.35; g.add(gm); });
  const face = GARMENTS[8](); face.position.set(W / 2 + 0.24, H - 0.042, 0.02); g.add(face);
  // price tags on a couple of garments
  g.userData.collider = [-W / 2 - 0.1, W / 2 + 0.45, -0.3, 0.3];
  return g;
}
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
// a folded garment: rounded slab with a fold lip at the front
function folded(fab, w, h, d, p) {
  const m = fabricMat(fab, (SCALE[fab] || 0.25) * 0.8);
  const geo = new THREE.BoxGeometry(w, h, d, 6, 2, 6); const q = geo.attributes.position;
  for (let i = 0; i < q.count; i++) { const x = q.getX(i), y = q.getY(i), z = q.getZ(i); const k = Math.max(Math.abs(x) / (w / 2), Math.abs(z) / (d / 2)); q.setY(i, y * (1 - 0.35 * k ** 6)); q.setY(i, q.getY(i) + 0.006 * Math.sin(x * 40 + z * 23)); }
  geo.computeVertexNormals(); const b = new THREE.Mesh(geo, m); b.castShadow = true; b.receiveShadow = true; p.add(b); return b;
}
export function makeFoldedTable() {
  const g = new THREE.Group(); g.name = 'folded_table';
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.7), std({ color: '#d8d6ce', roughness: 0.6 })); top.position.y = 0.72; top.castShadow = true; top.receiveShadow = true; g.add(top);
  const legM = std({ color: '#5a5c5e', metalness: 0.6, roughness: 0.4 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) rod(new THREE.Vector3(sx * 0.68, 0, sz * 0.28), new THREE.Vector3(sx * 0.66, 0.7, sz * 0.3), 0.012, legM, g);
  const r = rng(7);
  const stacks = [['fb_plaid_navy', 'fb_plaid_red', 'fb_plaid_navy'], ['fb_denim', 'fb_denim', 'fb_knit', 'fb_denim'], ['fb_cotton', 'fb_fleece', 'fb_cotton'], ['fb_velour', 'fb_knit']];
  stacks.forEach((st, i) => { let y = 0.74; st.forEach((fab) => { const h = 0.045 + r() * 0.02; const b = folded(fab, 0.3, h, 0.26, g); b.position.set(-0.52 + i * 0.35 + (r() - 0.5) * 0.03, y + h / 2, -0.06 + (r() - 0.5) * 0.04); b.rotation.y = (r() - 0.5) * 0.12; y += h; }); });
  // plaid blanket draped over the front edge
  const bl = new THREE.PlaneGeometry(0.9, 0.9, 30, 30); const bp = bl.attributes.position;
  for (let i = 0; i < bp.count; i++) { const x = bp.getX(i), v = bp.getY(i) + 0.45; // v: 0 = hanging end, 0.9 = on the table
    let y, z; if (v > 0.35) { y = 0.745; z = 0.35 - (v - 0.35); } else { const a = (0.35 - v); y = 0.745 - a * 0.95; z = 0.36 + 0.06 * Math.sin(a * 4); }
    bp.setXYZ(i, x, y + 0.01 * Math.sin(x * 25) * (v < 0.35 ? 1 : 0.2), z + (v < 0.35 ? 0.015 * Math.sin(x * 22) : 0)); }
  bl.computeVertexNormals(); const blanket = new THREE.Mesh(bl, fabricMat('fb_plaid_red', 0.22)); blanket.position.x = 0.3; blanket.castShadow = true; blanket.receiveShadow = true; g.add(blanket);
  // cardboard sign leaning on the stacks
  const sign = canvasT(512, 360, (x, w, h) => { x.fillStyle = '#b48a58'; x.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(90,60,30,${Math.random() * 0.12})`; x.fillRect(0, Math.random() * h, w, 2); }
    x.fillStyle = '#141414'; fitText(x, 'SECONDHAND', w / 2, 80, 450, 74, F.marker); x.fillStyle = '#b0262e'; fitText(x, 'ALL $5', w / 2, 190, 420, 120, F.marker); x.fillStyle = '#141414'; fitText(x, 'flannels · jeans · hoodies', w / 2, 295, 450, 40, F.marker); });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.3), std({ map: sign, roughness: 0.9 })); sg.position.set(-0.35, 0.93, 0.12); sg.rotation.x = -0.25; g.add(sg);
  g.userData.collider = [-0.75, 0.75, -0.35, 0.45];
  return g;
}
export function makeThriftCorner() {
  const g = new THREE.Group(); g.name = 'thrift_corner';
  const rack = makeClothesRack(); rack.position.set(-0.85, 0, -0.1); g.add(rack);
  const t = makeFoldedTable(); t.position.set(1.15, 0, 0.1); t.rotation.y = -0.15; g.add(t);
  g.userData.collider = [-1.8, 1.95, -0.45, 0.6];
  return g;
}
