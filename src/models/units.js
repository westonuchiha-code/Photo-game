// Elmwood Apartments building parts shared by the shell and the units:
//   holeyWall()    a flat wall with rectangular / arched openings, UVs in metres
//   extWindow()    white double-hung window set into a real opening: frame, two sashes with
//                  clear glass, reveal (jambs) through the wall, stone sill outside
//   makeAC()       through-the-window air conditioner: painted steel cabinet with rear coil fins,
//                  side + top louvres and a bracket outside; plastic front with vent slats,
//                  intake grille, LED panel and buttons inside; pleated side panels fill the sash
//   makeUnitDoor() six-panel unit door with raised beveled panels, brass hinges, lever + deadbolt,
//                  peephole and a unit number plate
//   makeUnit()     one apartment: floor, ceiling + light, painted walls with openings matching the
//                  building's windows, trim, blinds / curtains, and furniture by kind
//                  ('kitchen' | 'studio' | 'bedroom' | 'bedroom2')
// Window / wall frames: a wall's local +z points outward, local x runs along the wall.
import * as THREE from 'three';
import { makePrivacyKnob, makeThumbturn, makeToggleSwitch, wornBrass } from './hardware31.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.7, ...o });
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
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
const glowMat = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });

// ---------------------------------------------------------------- walls with openings
// holes: { u0, u1, y0, y1, arch? } in wall-local metres (u from -len/2..len/2, y from 0..h)
export function holeyWall(len, h, holes, mat, unitU = 1, unitV = unitU) {
  const s = new THREE.Shape();
  s.moveTo(-len / 2, 0); s.lineTo(len / 2, 0); s.lineTo(len / 2, h); s.lineTo(-len / 2, h); s.lineTo(-len / 2, 0);
  for (const o of holes) {
    const p = new THREE.Path();
    const y0 = Math.max(o.y0, 0.0005);
    p.moveTo(o.u0, y0); p.lineTo(o.u1, y0);
    if (o.arch) { p.lineTo(o.u1, o.y1); p.absarc((o.u0 + o.u1) / 2, o.y1, (o.u1 - o.u0) / 2, 0, Math.PI, false); }
    else { p.lineTo(o.u1, o.y1); p.lineTo(o.u0, o.y1); }
    p.lineTo(o.u0, y0);
    s.holes.push(p);
  }
  const geo = new THREE.ShapeGeometry(s, 16);
  const uv = geo.attributes.uv, ps = geo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, ps.getX(i) / unitU, ps.getY(i) / unitV);
  const m = new THREE.Mesh(geo, mat);
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- exterior window
let WM = null;
function winMats() {
  if (WM) return WM;
  WM = {
    frame: std({ color: '#f3f2ec', roughness: 0.45 }),
    glass: new THREE.MeshStandardMaterial({ color: '#bfd2dc', transparent: true, opacity: 0.16, roughness: 0.04, metalness: 0.3, depthWrite: false, side: THREE.DoubleSide }),
    reveal: std({ color: '#e6e0d4', roughness: 0.85 }),
    screen: new THREE.MeshStandardMaterial({ color: '#2a2d30', transparent: true, opacity: 0.35, roughness: 0.9, depthWrite: false }),
  };
  return WM;
}
// Built in wall-frame coordinates: centre (u, yc), outer wall face at z = 0, inner face at z = -T.
export function extWindow({ u, yc, w = 1.2, h = 1.5, T = 0.2, stone, raised = 0 }) {
  const M = winMats();
  const g = new THREE.Group();
  const fd = 0.1, ft = 0.06;                 // frame depth / thickness
  const zf = -0.06;                           // frame sits a little back from the face
  // reveal (jambs, head, stool) through the wall thickness
  g.add(box(0.02, h, T, M.reveal, -w / 2 - 0.01, 0, -T / 2), box(0.02, h, T, M.reveal, w / 2 + 0.01, 0, -T / 2));
  g.add(box(w + 0.04, 0.02, T, M.reveal, 0, h / 2 + 0.01, -T / 2));
  g.add(box(w + 0.04, 0.02, T, M.reveal, 0, -h / 2 - 0.01, -T / 2));
  // outer frame
  for (const s of [-1, 1]) g.add(box(ft, h, fd, M.frame, s * (w / 2 - ft / 2), 0, zf));
  g.add(box(w, ft, fd, M.frame, 0, h / 2 - ft / 2, zf), box(w, ft * 1.4, fd, M.frame, 0, -h / 2 + ft * 0.7, zf));
  // sashes: upper fixed (outer track), lower slides up by `raised`
  const sh = (h - ft * 2) / 2 + 0.02, sw = w - ft * 2;
  const sash = (yc2, z) => {
    const s = new THREE.Group();
    const st = 0.045;
    for (const k of [-1, 1]) s.add(box(st, sh, 0.04, M.frame, k * (sw / 2 - st / 2), 0, 0));
    s.add(box(sw, st, 0.04, M.frame, 0, sh / 2 - st / 2, 0), box(sw, st * 1.3, 0.04, M.frame, 0, -sh / 2 + st * 0.65, 0));
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(sw - st * 2, sh - st * 2), M.glass); s.add(gl);
    s.position.set(0, yc2, z);
    return s;
  };
  g.add(sash(sh / 2 - 0.01, zf + 0.022));
  g.add(sash(-sh / 2 + 0.01 + raised, zf - 0.022));
  // stone sill outside, sloped slightly
  const sill = box(w + 0.22, 0.08, 0.22, stone, 0, -h / 2 - 0.05, 0.06); sill.rotation.x = 0.06; g.add(sill);
  g.position.set(u, yc, 0);
  return g;
}

// ---------------------------------------------------------------- air conditioner
let ACM = null;
function acMats() {
  if (ACM) return ACM;
  const front = canvasTex(256, 192, (c, w, h) => {
    c.fillStyle = '#ecebe5'; c.fillRect(0, 0, w, h);
    // upper vent slats area
    c.fillStyle = '#d4d2ca'; c.fillRect(10, 10, w * 0.7, h * 0.55);
    for (let y = 16; y < h * 0.55 + 6; y += 9) { c.fillStyle = '#9d9b94'; c.fillRect(12, y, w * 0.7 - 4, 3); c.fillStyle = '#fbfaf6'; c.fillRect(12, y + 3, w * 0.7 - 4, 2); }
    // lower intake grille
    c.fillStyle = '#c9c7bf'; c.fillRect(10, h * 0.62, w * 0.7, h * 0.33);
    c.fillStyle = '#8e8c86'; for (let x = 14; x < w * 0.7 + 6; x += 6) c.fillRect(x, h * 0.64, 2, h * 0.29);
    // control strip
    c.fillStyle = '#e2e0d8'; c.fillRect(w * 0.75, 10, w * 0.22, h - 20);
    c.fillStyle = '#1a1c1e'; c.fillRect(w * 0.77, 24, w * 0.18, 30);
    c.fillStyle = '#8a8880'; c.font = 'bold 13px "Oswald", sans-serif'; c.textAlign = 'center'; c.fillText('COOLWAVE', w * 0.86, h - 16);
  });
  ACM = {
    steel: std({ color: '#d2d0c8', roughness: 0.42, metalness: 0.35 }),
    steelDark: std({ color: '#7d7f80', roughness: 0.5, metalness: 0.5 }),
    coil: std({ color: '#3a3c3e', roughness: 0.6, metalness: 0.4 }),
    fin: std({ color: '#b8bab8', roughness: 0.35, metalness: 0.6 }),
    front: std({ map: front, roughness: 0.5 }),
    plastic: std({ color: '#eeede7', roughness: 0.5 }),
    pleat: std({ side: THREE.DoubleSide, roughness: 0.6, map: canvasTex(64, 16, (c, w, h) => { for (let x = 0; x < w; x += 8) { c.fillStyle = '#f0efe9'; c.fillRect(x, 0, 4, h); c.fillStyle = '#c9c7c0'; c.fillRect(x + 4, 0, 4, h); } }) }),
    led: glowMat(0.4, 1.8, 2.2),
  };
  return ACM;
}
// In wall-frame coords: sits on the window's bottom at (u, ySill), inside face at z = -T - 0.09.
export function makeAC({ u, ySill, T = 0.2, winW = 1.2 }) {
  const M = acMats();
  const g = new THREE.Group();
  const W = 0.62, H = 0.4, D = 0.62;
  const zIn = -T - 0.09, zc = zIn + D / 2;
  const cab = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 3, 0.015), M.steel); cab.position.set(0, H / 2, zc); cab.castShadow = true; g.add(cab);
  // outside: rear coil with vertical fins, side + top louvres
  const zOut = zIn + D;
  g.add(box(W - 0.06, H - 0.08, 0.01, M.coil, 0, H / 2, zOut + 0.004));
  const fins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.004, H - 0.1, 0.02), M.fin, 70);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 70; i++) { m4.makeTranslation(-W / 2 + 0.04 + i * (W - 0.08) / 69, H / 2, zOut + 0.012); fins.setMatrixAt(i, m4); }
  g.add(fins);
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {
    const l = box(0.012, 0.025, 0.24, M.steelDark, s * (W / 2 + 0.002), 0.08 + i * 0.045, zOut - 0.16); l.rotation.z = s * 0.5; g.add(l);
  }
  for (let i = 0; i < 6; i++) g.add(box(0.5, 0.012, 0.025, M.steelDark, 0, H + 0.002, zOut - 0.05 - i * 0.04));
  // L-bracket outside under the cabinet, braced back to the wall
  for (const s of [-0.22, 0.22]) {
    g.add(box(0.03, 0.025, 0.42, M.steelDark, s, -0.012, 0.18));
    const br = box(0.025, 0.025, 0.4, M.steelDark, s, -0.15, 0.13); br.rotation.x = 0.75; g.add(br);
  }
  // inside: plastic front panel + control buttons + LED temperature
  g.add(box(W + 0.03, H + 0.03, 0.035, M.plastic, 0, H / 2, zIn - 0.005));
  const fp = new THREE.Mesh(new THREE.PlaneGeometry(W, H), M.front); fp.position.set(0, H / 2, zIn - 0.024); g.add(fp);
  for (let i = 0; i < 6; i++) { const sl = box(W * 0.68, 0.01, 0.025, M.plastic, -W * 0.13, H * 0.48 + i * 0.03, zIn - 0.03); sl.rotation.x = -0.5; g.add(sl); }
  g.add(box(0.07, 0.025, 0.005, M.led, W * 0.36, H * 0.82, zIn - 0.026));
  for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.01, 12), M.plastic); b.rotation.x = Math.PI / 2; b.position.set(W * 0.36, H * 0.62 - i * 0.05, zIn - 0.03); g.add(b); }
  // pleated side panels filling the sash opening
  const gap = (winW - 0.12 - W) / 2;
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(gap, H - 0.02), M.pleat); p.position.set(s * (W / 2 + gap / 2), H / 2, -0.08); g.add(p); }
  g.position.set(u, ySill, 0);
  g.userData.height = H;
  return g;
}

// ---------------------------------------------------------------- unit door
let DM = null;
function doorMats() {
  if (DM) return DM;
  DM = {
    slab: std({ color: '#f4f3ee', roughness: 0.42 }),
    brass: std({ color: '#c09a4a', metalness: 0.55, roughness: 0.3 }),
    dark: std({ color: '#1a1a1a', roughness: 0.4 }),
  };
  return DM;
}
function raisedPanel(w, h, mat) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2); s.lineTo(-w / 2, h / 2); s.lineTo(-w / 2, -h / 2);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.004, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.03, bevelSegments: 2 });
  const m = new THREE.Mesh(geo, mat); m.castShadow = true;
  return m;
}
// hand: +1 knob on local +x, -1 on -x. Origin at the bottom centre, faces +z.
export function makeUnitDoor({ w = 0.86, h = 2.03, hand = 1, number = '', lite = false } = {}) {
  const M = doorMats();
  const g = new THREE.Group();
  g.add(box(w, h, 0.042, M.slab, 0, h / 2, 0));
  const pw = (w - 0.32) / 2;
  const rows = lite ? [[0.4 * h / 2.03, 0.56 * h / 2.03]] : [[1.66, 0.42], [1.06, 0.64], [0.4, 0.56]];
  if (lite) {   // nine-lite glass in the upper half (front-entry photo), warm hall light behind it
    const gw = w - 0.24, gh = h * 0.42, gy = h * 0.66;
    const gl = new THREE.Mesh(new THREE.BoxGeometry(gw, gh, 0.046), new THREE.MeshStandardMaterial({ color: '#f6e6c0', emissive: '#c8a060', emissiveIntensity: 0.55, roughness: 0.15 }));
    gl.position.set(0, gy, 0); g.add(gl);
    for (const k of [-1, 1]) for (const zs of [1, -1]) { g.add(box(0.028, gh, 0.012, M.slab, k * gw / 6, gy, zs * 0.025)); g.add(box(gw, 0.028, 0.012, M.slab, 0, gy + k * gh / 6, zs * 0.025)); }
    for (const zs of [1, -1]) { g.add(box(gw + 0.06, 0.03, 0.016, M.slab, 0, gy + gh / 2 + 0.015, zs * 0.025), box(gw + 0.06, 0.03, 0.016, M.slab, 0, gy - gh / 2 - 0.015, zs * 0.025)); }
  }
  for (const sf of [-1, 1]) for (const zs of [1, -1]) for (const [y, ph] of rows) {
    const p = raisedPanel(pw - 0.06, ph - 0.06, M.slab);
    p.position.set(sf * (pw / 2 + 0.05), y, zs * 0.021); if (zs < 0) p.rotation.y = Math.PI; g.add(p);
  }
  const kx = hand * (w / 2 - 0.075);
  for (const zs of [1, -1]) {
    // brass privacy knob + deadbolt (hardware photos): turn-button + thumb-turn inside, pin-hole + cylinder outside
    const kn = makePrivacyKnob({ side: zs < 0 ? 'inside' : 'outside' }); kn.position.set(kx, 0.97, zs * 0.021); if (zs < 0) kn.rotation.y = Math.PI; g.add(kn);
    if (zs < 0) { const tt = makeThumbturn(); tt.position.set(kx, 1.14, -0.021); tt.rotation.y = Math.PI; g.add(tt); }
    else { const db = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.032, 0.012, 32), wornBrass()); db.rotation.x = Math.PI / 2; db.position.set(kx, 1.14, 0.027); g.add(db); const ky = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.012, 0.002), new THREE.MeshStandardMaterial({ color: '#1a140c' })); ky.position.set(kx, 1.14, 0.0335); g.add(ky); }
  }
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8), M.brass);
  for (const y of [0.25, 1.0, 1.8]) { const hh = hinge.clone(); hh.position.set(-hand * (w / 2 + 0.004), y, 0.02); g.add(hh); }
  const peep = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.01, 12), M.brass); peep.rotation.x = Math.PI / 2; peep.position.set(0, 1.56, 0.026); g.add(peep);
  if (number) {
    const t = canvasTex(128, 64, (c, cw, ch) => {
      c.fillStyle = '#c09a4a'; c.fillRect(0, 0, cw, ch); c.strokeStyle = '#7a5a20'; c.lineWidth = 4; c.strokeRect(4, 4, cw - 8, ch - 8);
      c.fillStyle = '#2a1e0c'; c.font = '600 40px "Oswald", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(number, cw / 2, ch / 2 + 2);
    });
    const np = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.055), std({ map: t, metalness: 0.5, roughness: 0.35 })); np.position.set(0, 1.73, 0.027); g.add(np);
  }
  g.add(box(w + 0.02, 0.012, 0.06, M.brass, 0, 0.006, 0));   // threshold strip
  return g;
}
// door casing (both faces) around an opening; built in a wall frame where the wall plane is z = 0
export function doorCasing(w, h, mat, z = 0.012) {
  const g = new THREE.Group();
  for (const s of [-1, 1]) g.add(box(0.075, h + 0.075, 0.025, mat, s * (w / 2 + 0.0375), (h + 0.075) / 2, z));
  g.add(box(w + 0.15, 0.075, 0.025, mat, 0, h + 0.0375, z));
  g.add(box(w + 0.19, 0.02, 0.035, mat, 0, h + 0.085, z + 0.005));
  return g;
}

// ---------------------------------------------------------------- furniture
const F = {};
function fm() {
  if (F.wood) return F;
  F.wood = std({ color: '#8a5a3a', roughness: 0.5 });
  F.woodLight = std({ color: '#c49a6a', roughness: 0.55 });
  F.white = std({ color: '#f2f0ea', roughness: 0.45 });
  F.black = std({ color: '#1c1d1f', roughness: 0.45 });
  F.steel = std({ color: '#c4c7ca', metalness: 0.55, roughness: 0.3 });
  F.counter = std({ color: '#d8d2c4', roughness: 0.3, map: canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#d8d2c4'; c.fillRect(0, 0, w, h); const r = rng(3); for (let i = 0; i < 900; i++) { c.fillStyle = ['#a89f8f', '#efe9dc', '#8a8274'][i % 3]; c.fillRect(r() * w, r() * h, 2, 2); } }) });
  F.fabric = (col) => std({ color: col, roughness: 0.95 });
  return F;
}
function lampLight(g, x, y, z, col = '#ffd8a0', i = 2.2) { const l = new THREE.PointLight(col, i, 5, 1.6); l.position.set(x, y, z); g.add(l); }
function tableLamp(x, y, z, shadeCol = '#f2e6cc') {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.04, 16), fm().black); base.position.y = 0.02; g.add(base);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 8), fm().steel); stem.position.y = 0.19; g.add(stem);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.18, 24, 1, true), new THREE.MeshStandardMaterial({ color: shadeCol, emissive: '#c8a060', emissiveIntensity: 0.6, side: THREE.DoubleSide, roughness: 0.9 }));
  sh.position.y = 0.38; g.add(sh);
  g.position.set(x, y, z);
  return g;
}
function rug(w, d, cols, seed) {
  const t = canvasTex(256, 192, (c, cw, ch) => {
    c.fillStyle = cols[0]; c.fillRect(0, 0, cw, ch);
    c.strokeStyle = cols[1]; c.lineWidth = 10; c.strokeRect(14, 14, cw - 28, ch - 28);
    const r = rng(seed); c.fillStyle = cols[2];
    for (let i = 0; i < 8; i++) { const x = 40 + (i % 4) * 50, y = 60 + Math.floor(i / 4) * 70; c.beginPath(); c.moveTo(x, y - 18); c.lineTo(x + 18, y); c.lineTo(x, y + 18); c.lineTo(x - 18, y); c.fill(); }
    for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(0,0,0,${r() * 0.06})`; c.fillRect(r() * cw, r() * ch, 1, 2); }
  });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.012, d), std({ map: t, roughness: 1 }));
  m.position.y = 0.006; m.receiveShadow = true;
  return m;
}
function frameArt(w, h, seed) {
  const r = rng(seed);
  const t = canvasTex(128, 160, (c, cw, ch) => {
    const g = c.createLinearGradient(0, 0, 0, ch); g.addColorStop(0, ['#e8b878', '#9ec4d8', '#d8a0a8'][seed % 3]); g.addColorStop(1, ['#4a6a8a', '#e8d8b8', '#3a5a4a'][seed % 3]);
    c.fillStyle = g; c.fillRect(0, 0, cw, ch);
    for (let i = 0; i < 4; i++) { c.fillStyle = `rgba(${r() * 255 | 0},${r() * 200 | 0},${r() * 160 | 0},0.55)`; c.beginPath(); c.arc(r() * cw, r() * ch, 14 + r() * 30, 0, 7); c.fill(); }
  });
  const g = new THREE.Group();
  g.add(box(w + 0.05, h + 0.05, 0.03, fm().black, 0, 0, 0));
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), std({ map: t })); p.position.z = 0.016; g.add(p);
  return g;
}
function plant(x, z, s = 1) {
  const g = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * s, 0.1 * s, 0.24 * s, 16), std({ color: '#c8653a', roughness: 0.8 })); pot.position.y = 0.12 * s; g.add(pot);
  const r = rng(Math.round(x * 100 + z * 7));
  for (let i = 0; i < 9; i++) {
    const lf = new THREE.Mesh(new THREE.SphereGeometry(0.1 * s, 8, 6), std({ color: ['#3f7a3a', '#4f8a42', '#2f6a30'][i % 3], roughness: 0.8 }));
    lf.scale.set(0.5, 1.4, 0.25); const a = i / 9 * Math.PI * 2;
    lf.position.set(Math.cos(a) * 0.08 * s, (0.36 + r() * 0.18) * s, Math.sin(a) * 0.08 * s); lf.rotation.set(Math.sin(a) * 0.6, a, Math.cos(a) * 0.6); g.add(lf);
  }
  g.position.set(x, 0, z);
  return g;
}
function chair(col) {
  const g = new THREE.Group(), m = fm();
  g.add(box(0.42, 0.04, 0.42, col, 0, 0.45, 0));
  for (const [x, z] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) g.add(box(0.035, 0.45, 0.035, m.wood, x, 0.225, z));
  g.add(box(0.42, 0.42, 0.035, col, 0, 0.7, -0.19));
  return g;
}
// furniture builders: room local coords x 0..W (along front), z 0..D, y from the floor; wall at z=0 is the "back" wall of the room (away from the door)
function kitchen(g, W, D, seed) {
  const m = fm(); const r = rng(seed);
  const cab = std({ color: ['#e8e4d8', '#4a6a7a', '#7a8a6a'][seed % 3], roughness: 0.45 });
  const run = Math.min(W - 0.6, 3.2);
  g.add(box(run, 0.86, 0.6, cab, run / 2 + 0.05, 0.43, 0.3));
  g.add(box(run + 0.04, 0.04, 0.64, m.counter, run / 2 + 0.05, 0.88, 0.32));
  for (let i = 0; i < Math.floor(run / 0.6); i++) {
    const x = 0.35 + i * 0.6;
    g.add(box(0.56, 0.7, 0.012, cab, x, 0.45, 0.606));
    g.add(box(0.012, 0.12, 0.02, m.steel, x + 0.22, 0.66, 0.62));
    g.add(box(0.56, 0.12, 0.012, cab, x, 0.8, 0.606));
    g.add(box(0.12, 0.012, 0.02, m.steel, x, 0.8, 0.62));
  }
  // uppers with doors
  g.add(box(run, 0.7, 0.34, cab, run / 2 + 0.05, 1.85, 0.17));
  for (let i = 0; i < Math.floor(run / 0.6); i++) { const x = 0.35 + i * 0.6; g.add(box(0.56, 0.66, 0.012, cab, x, 1.85, 0.346)); g.add(box(0.012, 0.12, 0.02, m.steel, x + 0.22, 1.6, 0.36)); }
  // sink + faucet
  g.add(box(0.5, 0.02, 0.38, m.steel, 0.9, 0.905, 0.32)); g.add(box(0.44, 0.012, 0.32, std({ color: '#8a8d90', metalness: 0.6, roughness: 0.25 }), 0.9, 0.912, 0.32));
  const fau = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 8, 16, Math.PI), m.steel); fau.position.set(0.9, 1.0, 0.1); fau.rotation.y = Math.PI / 2; g.add(fau);
  // stove: burners + knobs
  const sx = Math.min(run - 0.4, 2.1);
  g.add(box(0.6, 0.02, 0.58, m.black, sx, 0.91, 0.32));
  for (const [dx, dz] of [[-0.14, -0.12], [0.14, -0.12], [-0.14, 0.14], [0.14, 0.14]]) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.008, 6, 20), m.steel); b.rotation.x = Math.PI / 2; b.position.set(sx + dx, 0.925, 0.32 + dz); g.add(b); }
  for (let i = 0; i < 4; i++) { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 12), m.black); k.rotation.x = Math.PI / 2; k.position.set(sx - 0.2 + i * 0.13, 0.78, 0.62); g.add(k); }
  g.add(box(0.56, 0.42, 0.012, m.black, sx, 0.4, 0.607));
  // kettle + fruit bowl
  const ket = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 10), std({ color: '#c8322a', roughness: 0.3, metalness: 0.2 })); ket.scale.y = 1.1; ket.position.set(sx + 0.14, 1.0, 0.18); g.add(ket);
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), m.white); bowl.position.set(0.35, 0.99, 0.35); bowl.rotation.x = Math.PI; bowl.scale.y = 0.5; g.add(bowl);
  for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), std({ color: ['#e8a01a', '#c8322a', '#8ab83a', '#e8c21a'][i] })); f.position.set(0.32 + (i % 2) * 0.06, 0.97, 0.32 + Math.floor(i / 2) * 0.06); g.add(f); }
  // fridge at the end of the run
  const fx = run + 0.45;
  if (fx + 0.4 < W) {
    g.add(box(0.72, 1.78, 0.7, m.white, fx, 0.89, 0.36));
    g.add(box(0.72, 0.005, 0.005, m.black, fx, 1.2, 0.712));
    for (const y of [0.75, 1.45]) g.add(box(0.025, 0.4, 0.04, m.steel, fx - 0.3, y, 0.73));
    // magnets / a note
    g.add(box(0.12, 0.15, 0.004, std({ color: '#f6f2e0' }), fx + 0.1, 1.45, 0.713));
  }
  // small table + chairs in the middle
  const tz = D * 0.62, tx = W * 0.45;
  g.add(box(0.9, 0.04, 0.7, m.woodLight, tx, 0.74, tz));
  for (const [x, z] of [[-0.4, -0.3], [0.4, -0.3], [-0.4, 0.3], [0.4, 0.3]]) g.add(box(0.04, 0.72, 0.04, m.woodLight, tx + x, 0.36, tz + z));
  const cc = std({ color: ['#c8322a', '#2a5aa8', '#e8b83a'][seed % 3], roughness: 0.5 });
  for (const s of [-1, 1]) { const c = chair(cc); c.position.set(tx + s * 0.62, 0, tz); c.rotation.y = s * Math.PI / 2; g.add(c); }
  g.add(rug(1.6, 1.2, ['#c8b89a', '#8a5a3a', '#e8dcc0'], seed));
  g.children[g.children.length - 1].position.set(tx, 0.006, tz);
  return [[0, run + 0.1, 0, 0.66], [fx - 0.38, fx + 0.38, 0, 0.72], [tx - 0.75, tx + 0.75, tz - 0.4, tz + 0.4]];
}
function studio(g, W, D, seed) {
  const m = fm();
  const sofaC = F.fabric(['#5a6a8a', '#7a5a4a', '#4a6a5a'][seed % 3]);
  const sx = W * 0.5, sz = 0.5;
  // sofa: base, 3 seat cushions, back cushions, arms, feet
  g.add(box(2.0, 0.24, 0.85, sofaC, sx, 0.2, sz));
  for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.14, 0.62, 3, 0.04), sofaC); c.position.set(sx - 0.62 + i * 0.62, 0.38, sz + 0.08); c.castShadow = true; g.add(c); }
  for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.48, 0.2, 3, 0.06), sofaC); c.position.set(sx - 0.62 + i * 0.62, 0.6, sz - 0.3); c.rotation.x = -0.12; g.add(c); }
  for (const s of [-1, 1]) g.add(new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.56, 0.86, 3, 0.05), sofaC).translateX(sx + s * 1.0).translateY(0.36).translateZ(sz));
  for (const [x, z] of [[-0.9, -0.35], [0.9, -0.35], [-0.9, 0.35], [0.9, 0.35]]) g.add(box(0.05, 0.08, 0.05, m.wood, sx + x, 0.04, sz + z));
  const pil = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.36, 0.12, 3, 0.05), F.fabric('#e8c86a')); pil.position.set(sx - 0.78, 0.55, sz - 0.12); pil.rotation.set(-0.2, 0.3, 0.1); g.add(pil);
  // coffee table + magazines + mug
  g.add(box(1.1, 0.04, 0.55, m.woodLight, sx, 0.42, sz + 1.05));
  for (const [x, z] of [[-0.5, -0.22], [0.5, -0.22], [-0.5, 0.22], [0.5, 0.22]]) g.add(box(0.035, 0.4, 0.035, m.black, sx + x, 0.2, sz + 1.05 + z));
  g.add(box(0.28, 0.015, 0.2, std({ color: '#c84a3a' }), sx - 0.2, 0.448, sz + 1.0));
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.09, 14), m.white); mug.position.set(sx + 0.25, 0.485, sz + 1.1); g.add(mug);
  // TV on a low stand facing the sofa, with a lit screen
  const tz = Math.min(D - 0.3, sz + 2.6);
  g.add(box(1.5, 0.45, 0.4, m.wood, sx, 0.225, tz));
  g.add(box(1.46, 0.012, 0.36, m.black, sx, 0.25, tz));
  g.add(box(1.25, 0.72, 0.05, m.black, sx, 0.88, tz));
  g.add(box(1.18, 0.65, 0.01, glowMat(0.25, 0.4, 0.6), sx, 0.88, tz - 0.026));
  g.add(box(0.3, 0.03, 0.18, m.black, sx, 0.47, tz));
  // floor lamp, bookshelf, plant, rug, art
  const fl = new THREE.Group();
  fl.add(box(0.28, 0.03, 0.28, m.black, 0, 0.015, 0));
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.5, 8), m.black); pole.position.y = 0.76; fl.add(pole);
  const sh = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.25, 20, 1, true), new THREE.MeshStandardMaterial({ color: '#f0e6d0', emissive: '#d8b070', emissiveIntensity: 0.6, side: THREE.DoubleSide })); sh.position.y = 1.55; fl.add(sh);
  fl.position.set(sx + 1.3, 0, sz + 0.1); g.add(fl);
  lampLight(g, sx + 1.3, 1.5, sz + 0.25, '#ffd8a0', 2.4);
  const bs = new THREE.Group();
  bs.add(box(0.8, 1.6, 0.3, m.white, 0, 0.8, 0));
  const r = rng(seed + 4);
  for (let k = 0; k < 4; k++) { let x = -0.36; while (x < 0.34) { const bw = 0.03 + r() * 0.04, bh = 0.2 + r() * 0.1; bs.add(box(bw, bh, 0.2, std({ color: ['#a8322a', '#2a4a7a', '#e8c86a', '#3a6a4a', '#d8d0c0'][Math.floor(r() * 5)] }), x + bw / 2, 0.06 + k * 0.4 + bh / 2, 0.03)); x += bw + 0.005; } bs.add(box(0.78, 0.02, 0.28, m.white, 0, 0.42 + k * 0.4, 0)); }
  bs.position.set(0.5, 0, D - 0.2); bs.rotation.y = Math.PI; g.add(bs);
  g.add(plant(W - 0.35, D - 0.4, 1.3));
  const rg = rug(2.2, 1.6, ['#d8c8a8', '#4a6a7a', '#c86a4a'], seed); rg.position.set(sx, 0.006, sz + 1.1); g.add(rg);
  return [[sx - 1.1, sx + 1.1, sz - 0.45, sz + 0.45], [sx - 0.56, sx + 0.56, sz + 0.78, sz + 1.33], [sx - 0.76, sx + 0.76, tz - 0.22, tz + 0.22], [0.08, 0.92, D - 0.38, D]];
}
function bedroom(g, W, D, seed) {
  const m = fm();
  const duvet = canvasTex(256, 256, (c, w, h) => {
    const cols = [['#e8e2d4', '#7a9ab8'], ['#f0e8e0', '#c87a6a'], ['#e0e8e0', '#5a8a6a']][seed % 3];
    c.fillStyle = cols[0]; c.fillRect(0, 0, w, h);
    c.strokeStyle = cols[1]; c.lineWidth = 3;
    for (let x = 0; x < w; x += 32) for (let y = 0; y < h; y += 32) { c.beginPath(); c.moveTo(x, y + 16); c.lineTo(x + 16, y); c.lineTo(x + 32, y + 16); c.lineTo(x + 16, y + 32); c.closePath(); c.stroke(); }
  });
  const bx = W * 0.5, bz = 0.0;
  // headboard against the wall, frame, mattress, duvet, pillows
  g.add(box(1.7, 1.1, 0.06, m.wood, bx, 0.55, bz + 0.03));
  g.add(box(1.62, 0.3, 2.06, m.wood, bx, 0.22, bz + 1.1));
  g.add(new THREE.Mesh(new RoundedBoxGeometry(1.52, 0.22, 1.98, 3, 0.05), m.white).translateX(bx).translateY(0.48).translateZ(bz + 1.1));
  const dv = new THREE.Mesh(new RoundedBoxGeometry(1.62, 0.1, 1.5, 3, 0.04), std({ map: duvet, roughness: 0.95 })); dv.position.set(bx, 0.6, bz + 1.35); dv.castShadow = true; g.add(dv);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.14, 0.38, 3, 0.06), m.white); p.position.set(bx + s * 0.38, 0.65, bz + 0.3); p.rotation.x = -0.25; g.add(p); }
  // nightstands with lamps, clock
  for (const s of [-1, 1]) {
    const nx = bx + s * 1.15;
    g.add(box(0.45, 0.55, 0.4, m.woodLight, nx, 0.275, bz + 0.22));
    g.add(box(0.4, 0.012, 0.012, m.black, nx, 0.4, bz + 0.425));
    g.add(tableLamp(nx, 0.55, bz + 0.2));
  }
  g.add(box(0.12, 0.07, 0.05, m.black, bx - 1.05, 0.585, bz + 0.33));
  g.add(box(0.08, 0.025, 0.004, glowMat(1.6, 0.3, 0.2), bx - 1.05, 0.59, bz + 0.356));
  lampLight(g, bx + 1.15, 1.0, bz + 0.35, '#ffd8a0', 1.8);
  // dresser with 3 drawers + knobs, mirror over it, laundry basket
  const dz = D - 0.25;
  if (D > 2.8) {
    g.add(box(1.2, 0.85, 0.45, m.wood, bx, 0.425, dz));
    for (let i = 0; i < 3; i++) { g.add(box(1.12, 0.24, 0.012, m.woodLight, bx, 0.17 + i * 0.27, dz - 0.231)); for (const s of [-1, 1]) { const k = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), m.steel); k.position.set(bx + s * 0.3, 0.17 + i * 0.27, dz - 0.25); g.add(k); } }
    const mir = box(0.7, 0.9, 0.03, m.black, bx, 1.4, dz + 0.2); g.add(mir);
    g.add(box(0.64, 0.84, 0.005, std({ color: '#a8b8c0', metalness: 0.8, roughness: 0.05 }), bx, 1.4, dz + 0.183));
  }
  const bk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.5, 16, 1, true), std({ color: '#c8a870', roughness: 0.9, side: THREE.DoubleSide })); bk.position.set(W - 0.4, 0.25, D - 0.5); g.add(bk);
  const rg = rug(1.4, 0.9, ['#e8dcc8', '#a87a5a', '#7a9ab8'], seed); rg.position.set(bx, 0.006, bz + 2.6); if (bz + 2.6 < D - 0.5) g.add(rg);
  const art = frameArt(0.8, 0.55, seed); art.position.set(bx, 1.55, bz + 0.07); g.add(art);
  return [[bx - 0.85, bx + 0.85, bz, bz + 2.15], [bx - 1.4, bx - 0.9, bz, bz + 0.45], [bx + 0.9, bx + 1.4, bz, bz + 0.45], D > 2.8 ? [bx - 0.62, bx + 0.62, dz - 0.25, D] : [0, 0, 0, 0]];
}

// ---------------------------------------------------------------- the unit
// windows: [{ side: 'front'|'back'|'west'|'east', c, w, h, yc, ac }] in the building's local coords
// door: { side: 'east'|'west', z, w }
export function makeUnit({ x0, x1, z0, z1, F, FH, door, windows = [], kind = 'studio', seed = 1, paint = '#ece8dc', facing = 'back' }) {
  const g = new THREE.Group();
  const colliders = [];
  const W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const wallTex = canvasTex(256, 256, (c, w, h) => { c.fillStyle = paint; c.fillRect(0, 0, w, h); const r = rng(seed); for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${r() * 0.04})`; c.fillRect(r() * w, r() * h, 2, 2); } });
  const wallMat = std({ map: wallTex, roughness: 0.92 });
  const trim = std({ color: '#f6f5f0', roughness: 0.45 });
  const floorTex = canvasTex(512, 512, (c, w, h) => {
    const r = rng(seed + 9);
    const base = [['#b98a5a', '#a87a4a', '#c69a6a'], ['#8a6a4a', '#7a5a3a', '#9a7a5a'], ['#c8b090', '#b8a080', '#d8c0a0']][seed % 3];
    c.fillStyle = '#5a3e26'; c.fillRect(0, 0, w, h);
    for (let row = 0; row < 8; row++) { let x = -r() * 200; while (x < w) { const L = 140 + r() * 160; c.fillStyle = base[Math.floor(r() * 3)]; c.fillRect(x, row * 64, L - 2, 62); c.fillStyle = 'rgba(60,35,15,0.10)'; for (let k = 0; k < 6; k++) c.fillRect(x, row * 64 + r() * 60, L - 2, 1); x += L; } }
  });
  floorTex.repeat.set(W / 1.6, D / 1.6);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ map: floorTex, roughness: 0.45 })); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, F + 0.006, cz); fl.receiveShadow = true; g.add(fl);
  const ce = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ color: '#f6f4ee', emissive: '#262420' })); ce.rotation.x = Math.PI / 2; ce.position.set(cx, F + FH - 0.02, cz); g.add(ce);
  // ceiling light fixture + light
  const fix = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.5, 1.3), toneMapped: false }));
  fix.position.set(cx, F + FH - 0.02, cz); fix.scale.y = 0.45; g.add(fix);
  g.add(box(0.16, 0.02, 0.16, std({ color: '#c09a4a', metalness: 0.5 }), cx, F + FH - 0.03, cz));
  const cl = new THREE.PointLight('#fff0d8', 3.2, 9, 1.5); cl.position.set(cx, F + FH - 0.45, cz); g.add(cl);
  // walls: side -> { pos, rotY, len, u(c) }
  const walls = {
    front: { x: cx, z: z1 - 0.004, ry: Math.PI, len: W, u: (c) => -(c - cx), along: 'x' },
    back: { x: cx, z: z0 + 0.004, ry: 0, len: W, u: (c) => c - cx, along: 'x' },
    west: { x: x0 + 0.004, z: cz, ry: Math.PI / 2, len: D, u: (c) => -(c - cz), along: 'z' },
    east: { x: x1 - 0.004, z: cz, ry: -Math.PI / 2, len: D, u: (c) => c - cz, along: 'z' },
  };
  for (const [side, wl] of Object.entries(walls)) {
    const holes = [];
    const wins = windows.filter((o) => o.side === side);
    for (const o of wins) { const u = wl.u(o.c); holes.push({ u0: u - o.w / 2, u1: u + o.w / 2, y0: o.yc - F - o.h / 2, y1: o.yc - F + o.h / 2, win: o }); }
    if (door && door.side === side) { const u = wl.u(door.z); holes.push({ u0: u - door.w / 2, u1: u + door.w / 2, y0: 0, y1: 2.08, door: true }); }
    const wm = holeyWall(wl.len, FH, holes, wallMat, 2.0, 2.0);
    const frame = new THREE.Group(); frame.position.set(wl.x, F, wl.z); frame.rotation.y = wl.ry; frame.add(wm); g.add(frame);
    // baseboards around door gaps + crown
    const gaps = holes.filter((h) => h.door).map((h) => [h.u0 - 0.08, h.u1 + 0.08]);
    let a = -wl.len / 2;
    for (const [g0, g1] of [...gaps, [wl.len / 2, wl.len / 2]]) { if (g0 > a) frame.add(box(g0 - a, 0.1, 0.016, trim, (a + g0) / 2, 0.05, 0.008)); a = g1; }
    frame.add(box(wl.len, 0.06, 0.03, trim, 0, FH - 0.05, 0.015));
    for (const h of holes.filter((o) => o.door)) {
      const cs = doorCasing(h.u1 - h.u0, 2.08, trim); cs.position.x = (h.u0 + h.u1) / 2; frame.add(cs);
      // cream toggle switch beside the door, on the latch side (hardware photos)
      const sw = makeToggleSwitch(); sw.position.set(h.u1 + 0.2, 1.22, 0.004); frame.add(sw);
    }
    // window interior trim, stool, blinds or curtains
    for (const h of holes.filter((o) => o.win)) {
      const ww = h.u1 - h.u0, wh = h.y1 - h.y0, uc = (h.u0 + h.u1) / 2, yc = (h.y0 + h.y1) / 2;
      for (const s of [-1, 1]) frame.add(box(0.07, wh + 0.07, 0.02, trim, uc + s * (ww / 2 + 0.035), yc, 0.01));
      frame.add(box(ww + 0.14, 0.07, 0.02, trim, uc, h.y1 + 0.035, 0.01));
      frame.add(box(ww + 0.18, 0.035, 0.12, trim, uc, h.y0 - 0.017, 0.05));
      if (!h.win.ac) {
        if ((seed + Math.round(uc * 10)) % 2) {      // half-drawn blinds
          const bl = canvasTex(64, 128, (c, w2, h2) => { for (let y = 0; y < h2; y += 6) { c.fillStyle = '#f2efe6'; c.fillRect(0, y, w2, 4); c.fillStyle = '#cfcbc0'; c.fillRect(0, y + 4, w2, 2); } });
          bl.repeat.set(1, (wh * 0.45) / 0.4);
          const bm = new THREE.Mesh(new THREE.PlaneGeometry(ww - 0.04, wh * 0.45), std({ map: bl, side: THREE.DoubleSide, roughness: 0.6 }));
          bm.position.set(uc, h.y1 - wh * 0.225 - 0.03, -0.05); frame.add(bm);
          frame.add(box(ww - 0.02, 0.05, 0.05, trim, uc, h.y1 - 0.03, -0.05), box(ww - 0.04, 0.02, 0.03, trim, uc, h.y1 - wh * 0.45 - 0.03, -0.05));
        } else {                                     // curtains on a rod, tied back
          const cc = std({ color: ['#b8c8d8', '#d8b8a8', '#c8d0b0', '#e8e0d0'][seed % 4], side: THREE.DoubleSide, roughness: 0.95 });
          frame.add(box(ww + 0.5, 0.02, 0.02, std({ color: '#3a3a3a', metalness: 0.5 }), uc, h.y1 + 0.15, 0.08));
          for (const s of [-1, 1]) {
            const cg = new THREE.PlaneGeometry(0.42, wh + 0.4, 10, 1); const p = cg.attributes.position;
            for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 40) * 0.025);
            cg.computeVertexNormals();
            const cm = new THREE.Mesh(cg, cc); cm.position.set(uc + s * (ww / 2 + 0.08), h.y1 + 0.15 - (wh + 0.4) / 2, 0.07); frame.add(cm);
          }
        }
      }
    }
    // colliders (y-ranged to this floor), leaving the door gap open
    const t = 0.08;
    const toWorld = (u) => (wl.along === 'x' ? (wl.ry === Math.PI ? cx - u : cx + u) : (wl.ry === Math.PI / 2 ? cz - u : cz + u));
    let segs = [[-wl.len / 2, wl.len / 2]];
    for (const [g0, g1] of holes.filter((h) => h.door).map((h) => [h.u0, h.u1])) segs = segs.flatMap(([a2, b2]) => (g1 <= a2 || g0 >= b2 ? [[a2, b2]] : [[a2, g0], [g1, b2]].filter(([p, q]) => q - p > 0.01)));
    for (const [a2, b2] of segs) {
      const [w0, w1] = [toWorld(a2), toWorld(b2)].sort((p, q) => p - q);
      if (wl.along === 'x') colliders.push([w0, w1, wl.z - (wl.ry === Math.PI ? t : 0), wl.z + (wl.ry === Math.PI ? 0 : t), F, F + 1]);
      else colliders.push([wl.x - (wl.ry === -Math.PI / 2 ? t : 0), wl.x + (wl.ry === -Math.PI / 2 ? 0 : t), w0, w1, F, F + 1]);
    }
  }
  // furniture in a room frame whose z = 0 wall is the side given by `facing`
  const room = new THREE.Group();
  let RW = W, RD = D;
  if (facing === 'back') { room.position.set(x0, F, z0); }
  else if (facing === 'front') { room.position.set(x1, F, z1); room.rotation.y = Math.PI; }
  else if (facing === 'west') { room.position.set(x0, F, z1); room.rotation.y = Math.PI / 2; RW = D; RD = W; }
  else { room.position.set(x1, F, z0); room.rotation.y = -Math.PI / 2; RW = D; RD = W; }
  const fn = { kitchen, studio, bedroom, bedroom2: bedroom }[kind];
  const fc = fn(room, RW, RD, seed + (kind === 'bedroom2' ? 1 : 0));
  g.add(room);
  // furniture colliders -> building coords
  room.updateMatrix();
  for (const [a2, b2, c2, d2] of fc) {
    if (b2 - a2 < 0.01) continue;
    const pts = [[a2, c2], [b2, c2], [a2, d2], [b2, d2]].map(([x, z]) => new THREE.Vector3(x, 0, z).applyMatrix4(room.matrix));
    colliders.push([Math.min(...pts.map((p) => p.x)), Math.max(...pts.map((p) => p.x)), Math.min(...pts.map((p) => p.z)), Math.max(...pts.map((p) => p.z)), F, F + 1]);
  }
  g.userData.colliders = colliders;
  return g;
}
