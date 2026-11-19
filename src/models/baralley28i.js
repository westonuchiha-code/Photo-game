// Bar alley (28i, from photos/city/izakaya-alley-signs.jpg). A narrow brick-paved drinking street at
// night. All shop names, signs and notices are made up; no phone numbers.
//   makeBarAlley()
//     floor      brick pavers in running bond (texture from the photo's pavers), a concrete gutter strip
//                along the west wall, a round iron manhole, a no-smoking floor plate (icon only)
//     west       a pink building finished in fish-scale render (texture + relief from the photo) with a
//                dark canopy bar (CORAL) at street level; a brick-faced building with red quarry-tile
//                steps, a shutter, a planter and a bin; a low row of bars; vertical lightboxes on
//                brackets: a dark one (つき BAR 2F), a tall white one (膳や 灯楽), a narrow green one
//                (小料理 夢見)
//     east       a beige render block with an arched louvre window, drain pipes and a stair down to a
//                basement bar; the izakaya 月見屋 with its big white brush-lettered lightbox, a giant red
//                lantern, a standing lightbox on casters, beer crates and bar stools; a sign tower of
//                five small lightboxes (snack, karaoke, pub...); bicycles
//     overhead   two wooden utility poles with old lantern street lamps on brackets, sagging wires,
//                strings of bulbs zig-zagging across the alley
//     far end    the alley turns at a white apartment block with balconies; a yellow sign and lanterns
// Faces +z (entrance at z = 0, alley runs to -z), origin at ground level on the centre line.
// userData: colliders [[x0,x1,z0,z1]], area {minX..}
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
const _cache = new Map();
function ptex(name, rx = 1, ry = 1, srgb = true) {
  let base = _cache.get(name);
  if (!base) { base = _L.load(`assets/textures/${name}`); if (srgb) base.colorSpace = THREE.SRGBColorSpace; base.wrapS = base.wrapT = THREE.RepeatWrapping; base.anisotropy = 8; _cache.set(name, base); }
  const t = base.clone(); t.repeat.set(rx, ry); t.needsUpdate = true;
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
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.75, ...o });
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};
const rbox = (w, h, d, r, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat);
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true;
  return m;
};
const glow = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function tube(a, b, r, mat, seg = 10) {
  const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  m.castShadow = true;
  return m;
}
function wire(a, b, sag, r, mat) { // a cable hanging between two points
  const mid = a.clone().lerp(b, 0.5); mid.y -= sag;
  const c = new THREE.QuadraticBezierCurve3(a, mid, b);
  return new THREE.Mesh(new THREE.TubeGeometry(c, 24, r, 5), mat);
}
function plane(w, h, mat, x, y, z, ry = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true;
  return m;
}
const lit = (map, k = 0.5) => std({ map, emissive: '#ffffff', emissiveIntensity: k, emissiveMap: map, roughness: 0.45 });
// a building block: the visible faces (4 sides + roof) each textured at metre scale
function block(w, h, d, texName, unit, tint, x, y, z, normalName) {
  const g = new THREE.Group();
  const mk = (a, b) => {
    const m = std({ map: ptex(texName, a / unit, b / unit), color: tint || '#ffffff', roughness: 0.9 });
    if (normalName) { m.normalMap = ptex(normalName, a / unit, b / unit, false); m.normalScale.set(0.9, 0.9); }
    return m;
  };
  const add = (pw, ph, rx, ry, px, py, pz) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), mk(pw, ph)); m.rotation.set(rx, ry, 0); m.position.set(px, py, pz); m.receiveShadow = true; m.castShadow = true; g.add(m); };
  add(w, h, 0, 0, 0, h / 2, d / 2); add(w, h, 0, Math.PI, 0, h / 2, -d / 2);
  add(d, h, 0, Math.PI / 2, w / 2, h / 2, 0); add(d, h, 0, -Math.PI / 2, -w / 2, h / 2, 0);
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(w, d), std({ color: '#3a3a3c', roughness: 0.9 })); roof.rotation.x = -Math.PI / 2; roof.position.y = h; g.add(roof);
  g.position.set(x, y, z);
  return g;
}
function grime(c, w, h, seed, n = 140, a = 0.07) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { c.fillStyle = `rgba(50,45,40,${r() * a})`; c.fillRect(r() * w, r() * h, 2 + r() * 12, 2 + r() * 10); }
}

// ------------------------------------------------------------------ sign faces
// vertical lightbox: lines = [[text, font, sizeFrac, colour]] stacked top to bottom (vertical text for CJK)
function vSign(w, h, bg, lines, { border = null, seed = 1 } = {}) {
  return canvasTex(w, h, (c) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    if (border) { c.strokeStyle = border; c.lineWidth = w * 0.03; c.strokeRect(w * 0.04, w * 0.04, w * 0.92, h - w * 0.08); }
    let y = w * 0.12;
    const total = lines.reduce((a, l) => a + l[2], 0);
    for (const [text, font, frac, col, horiz] of lines) {
      const hh = (h - w * 0.24) * frac / total;
      c.fillStyle = col;
      if (horiz) fitText(c, text, w / 2, y + hh / 2, w * 0.86, hh * 0.8, font);
      else {
        const chars = [...text];
        const step = hh / chars.length;
        chars.forEach((ch, i) => fitText(c, ch, w / 2, y + step * (i + 0.5), w * 0.82, Math.min(step * 0.95, w * 0.8), font));
      }
      y += hh;
    }
    grime(c, w, h, seed);
  });
}
// a small horizontal lightbox for the sign tower: a top strap line + a big name
function smallSign(top, name, bg, ink, strap, seed) {
  return canvasTex(512, 256, (c, w, h) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.fillStyle = strap; c.fillRect(0, 0, w, 58);
    c.fillStyle = bg === '#ffffff' ? '#ffffff' : '#ffffff'; fitText(c, top, w / 2, 31, w - 40, 40, F.antique);
    c.fillStyle = ink; fitText(c, name, w / 2, 160, w - 60, 150, F.brush);
    grime(c, w, h, seed, 60);
  });
}
function noSmokingTex() {
  return canvasTex(256, 160, (c, w, h) => {
    c.fillStyle = '#f2ead0'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#2a5ab0'; c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12);
    const cx = w / 2, cy = h / 2 + 4;
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(cx, cy, 50, 0, 7); c.fill();
    c.fillStyle = '#333'; c.fillRect(cx - 40, cy - 6, 62, 12); c.fillStyle = '#e8a040'; c.fillRect(cx + 22, cy - 6, 14, 12);
    c.strokeStyle = 'rgba(160,160,160,0.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx + 36, cy - 8); c.quadraticCurveTo(cx + 46, cy - 26, cx + 38, cy - 40); c.stroke();
    c.strokeStyle = '#d42020'; c.lineWidth = 10; c.beginPath(); c.arc(cx, cy, 50, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(cx - 35, cy - 35); c.lineTo(cx + 35, cy + 35); c.stroke();
    grime(c, w, h, 4, 80, 0.12);
  });
}

// ------------------------------------------------------------------ props
// paper lantern (chochin): ribbed lathe body with lettering, black lacquer caps, lit from inside
function lantern(r, h, col, text, ink = '#111111', seed = 1) {
  const g = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40, y = (t - 0.5) * h;
    const rr = r * Math.sin(Math.PI * (0.08 + 0.84 * t)) ** 0.7 * (1 - 0.015 * Math.cos(t * Math.PI * 2 * 14));  // ribs
    pts.push(new THREE.Vector2(Math.max(0.001, rr), y));
  }
  const tex = canvasTex(1024, 512, (c, w, hh) => {
    c.fillStyle = col; c.fillRect(0, 0, w, hh);
    for (let i = 0; i < 28; i++) { c.fillStyle = 'rgba(0,0,0,0.07)'; c.fillRect(0, i * hh / 28, w, 2); }
    c.fillStyle = ink;
    for (const cx of [w * 0.25, w * 0.75]) {
      const chars = [...text]; const step = (hh * 0.8) / chars.length;
      chars.forEach((ch, i) => fitText(c, ch, cx, hh * 0.1 + step * (i + 0.5), w * 0.2, step * 0.95, F.brush));
    }
    grime(c, w, hh, seed, 80, 0.08);
  });
  tex.flipY = true;
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), std({ map: tex, roughness: 0.8, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.55, side: THREE.DoubleSide }));
  g.add(body);
  const lac = std({ color: '#141414', roughness: 0.35 });
  for (const s of [-1, 1]) { const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.42, r * 0.42, h * 0.06, 28), lac); cap.position.y = s * (h / 2 - h * 0.02); g.add(cap); }
  g.add(tube(V(0, h / 2, 0), V(0, h / 2 + 0.25, 0), 0.006, lac, 5));
  return g;
}
function beerCrate(col) {
  const g = new THREE.Group();
  const t = canvasTex(256, 128, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,0.55)'; for (let j = 0; j < 3; j++) for (let i = 0; i < 8; i++) c.fillRect(10 + i * 30, 14 + j * 36, 20, 24); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(0, 0, w, 6); });
  const m = std({ map: t, roughness: 0.55 });
  g.add(box(0.46, 0.3, 0.34, m, 0, 0.15, 0));
  // bottles' crowns peeking out
  const r = rng(col.length * 7);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if (r() < 0.6) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 8), std({ color: '#8a6a2a', metalness: 0.5, roughness: 0.3 })); b.position.set(-0.165 + i * 0.11, 0.315, -0.11 + j * 0.11); g.add(b); }
  return g;
}
function barStool(col) {
  const g = new THREE.Group();
  const steel = std({ color: '#2a2a2a', metalness: 0.5, roughness: 0.4 });
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.07, 24), std({ color: col, roughness: 0.5 })); seat.position.y = 0.7; g.add(seat);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; g.add(tube(V(Math.cos(a) * 0.12, 0.66, Math.sin(a) * 0.12), V(Math.cos(a) * 0.18, 0, Math.sin(a) * 0.18), 0.012, steel, 6)); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.008, 6, 20), steel); ring.rotation.x = Math.PI / 2; ring.position.y = 0.25; g.add(ring);
  return g;
}
function bicycle(col) {
  const g = new THREE.Group();
  const frame = std({ color: col, metalness: 0.3, roughness: 0.45 });
  const blk = std({ color: '#151515', roughness: 0.7 });
  const steel = std({ color: '#b9bcbf', metalness: 0.7, roughness: 0.3 });
  for (const x of [-0.52, 0.52]) {
    const w = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.022, 8, 32), blk); w.position.set(x, 0.33, 0); g.add(w);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.008, 6, 32), steel); rim.position.set(x, 0.33, 0); g.add(rim);
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.add(tube(V(x, 0.33, 0), V(x + Math.cos(a) * 0.29, 0.33 + Math.sin(a) * 0.29, 0), 0.0025, steel, 3)); }
  }
  const bb = V(0, 0.33, 0), seat = V(-0.18, 0.82, 0), head = V(0.4, 0.86, 0);
  for (const [a, b] of [[V(-0.52, 0.33, 0), bb], [bb, seat], [seat, V(-0.52, 0.33, 0)], [bb, head], [seat, V(0.36, 0.78, 0)], [head, V(0.52, 0.33, 0)]]) g.add(tube(a, b, 0.017, frame, 8));
  g.add(rbox(0.24, 0.05, 0.12, 0.02, blk, -0.2, 0.86, 0));
  g.add(tube(V(0.4, 0.96, -0.26), V(0.4, 0.96, 0.26), 0.012, steel, 6));
  g.add(tube(head, V(0.4, 0.96, 0), 0.015, steel, 6));
  // front basket (city bike)
  const bk = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.34), std({ color: '#1a1a1a', wireframe: true }));
  bk.position.set(0.62, 0.86, 0); g.add(bk);
  g.add(box(0.3, 0.01, 0.34, std({ color: '#1a1a1a' }), 0.62, 0.75, 0));
  g.add(tube(V(-0.02, 0.33, 0.03), V(-0.12, 0.08, 0.2), 0.01, steel, 5)); // kickstand
  return g;
}
function standingSign(texA, texB) { // white standing lightbox on a caster frame with its power cord
  const g = new THREE.Group();
  const steel = std({ color: '#5a5c5e', metalness: 0.5, roughness: 0.4 });
  g.add(box(0.62, 1.3, 0.22, std({ color: '#ececE8', roughness: 0.4 }), 0, 0.95, 0));
  g.add(plane(0.56, 1.22, lit(texA, 0.65), 0, 0.95, 0.111));
  g.add(plane(0.56, 1.22, lit(texB, 0.65), 0, 0.95, -0.111, Math.PI));
  g.add(box(0.7, 0.06, 0.4, steel, 0, 0.2, 0));
  for (const x of [-0.3, 0.3]) for (const z of [-0.16, 0.16]) {
    g.add(box(0.03, 0.08, 0.03, steel, x, 0.13, z));
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.025, 14), std({ color: '#111' })); w.rotation.x = Math.PI / 2; w.position.set(x, 0.05, z); g.add(w);
  }
  g.add(tube(V(0.05, 0.3, 0.12), V(0.08, 0.02, 0.2), 0.006, std({ color: '#111' }), 4));
  return g;
}
function streetLamp() { // old lantern-style lamp head on a curved bracket arm
  const g = new THREE.Group();
  const iron = std({ color: '#2a2b2c', metalness: 0.4, roughness: 0.5 });
  g.add(tube(V(0, 0, 0), V(0.9, 0.05, 0), 0.025, iron, 8));
  g.add(tube(V(0.2, -0.35, 0), V(0.6, 0.03, 0), 0.015, iron, 6));
  const scroll = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 16, Math.PI * 1.5), iron); scroll.position.set(0.42, -0.06, 0); g.add(scroll);
  // lamp: cap, hexagonal frosted glass body, finial, bottom bowl
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.14, 6), iron); cap.position.set(0.9, -0.12, 0); g.add(cap);
  g.add(tube(V(0.9, 0.05, 0), V(0.9, -0.05, 0), 0.02, iron, 6));
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.11, 0.36, 6, 1, true), new THREE.MeshStandardMaterial({ color: '#fff4dc', emissive: '#ffe2b0', emissiveIntensity: 1.6, roughness: 0.3, side: THREE.DoubleSide }));
  glass.position.set(0.9, -0.37, 0); g.add(glass);
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; g.add(tube(V(0.9 + Math.cos(a) * 0.17, -0.19, Math.sin(a) * 0.17), V(0.9 + Math.cos(a) * 0.11, -0.55, Math.sin(a) * 0.11), 0.006, iron, 4)); }
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.04, 0.06, 6), iron); bowl.position.set(0.9, -0.58, 0); g.add(bowl);
  const fin = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), iron); fin.position.set(0.9, -0.62, 0); g.add(fin);
  return g;
}
function utilityPole(h) {
  const g = new THREE.Group();
  const wood = std({ color: '#5a4a3a', roughness: 0.9 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, h, 14), std({ color: '#8c8a84', roughness: 0.85 })); pole.position.y = h / 2; pole.castShadow = true; g.add(pole);
  // step bolts, cross arms with insulators, a transformer can, a yellow/black guard at the base
  for (let y = 2.2; y < h - 1; y += 0.45) { const s = y % 0.9 < 0.45 ? 1 : -1; g.add(tube(V(0, y, 0), V(s * 0.3, y, 0.05), 0.01, std({ color: '#777' }), 4)); }
  for (const y of [h - 0.4, h - 1.1]) {
    g.add(box(1.5, 0.08, 0.08, wood, 0, y, 0));
    for (const x of [-0.65, -0.25, 0.25, 0.65]) { const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.1, 8), std({ color: '#e8e4dc', roughness: 0.3 })); ins.position.set(x, y + 0.09, 0); g.add(ins); }
  }
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.75, 16), std({ color: '#9aa2a6', metalness: 0.3, roughness: 0.5 })); tr.position.set(0, h - 2.2, 0.32); g.add(tr);
  const gd = canvasTex(64, 256, (c, w, hh) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#111' : '#f2c21a'; c.save(); c.translate(0, i * 32); c.transform(1, 0.5, 0, 1, 0, 0); c.fillRect(0, -16, w, 32); c.restore(); } });
  const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 1.6, 16, 1, true), std({ map: gd, roughness: 0.6 })); guard.position.y = 0.8; g.add(guard);
  // address / pole plate
  const pt = canvasTex(64, 192, (c, w, hh) => { c.fillStyle = '#eef0f2'; c.fillRect(0, 0, w, hh); c.fillStyle = '#222'; ['月', '見', '3', '7'].forEach((ch, i) => fitText(c, ch, w / 2, 26 + i * 44, w - 10, 38, F.antique)); });
  const pp = new THREE.Mesh(new THREE.CylinderGeometry(0.152, 0.152, 0.5, 14, 1, true, -0.4, 0.8), std({ map: pt })); pp.position.y = 2.05; g.add(pp);
  return g;
}

// ------------------------------------------------------------------ model
export function makeBarAlley() {
  const g = new THREE.Group();
  g.name = 'bar_alley';
  const L = 26, HW = 2.2, BD = 6;
  const colliders = [];
  const col = (x0, x1, z0, z1) => colliders.push([x0, x1, z0, z1]);
  const steel = std({ color: '#9a9ea2', metalness: 0.45, roughness: 0.4 });
  const iron = std({ color: '#2a2b2c', metalness: 0.4, roughness: 0.5 });
  const cable = std({ color: '#121212', roughness: 0.6 });
  const darkWood = std({ color: '#3a2a1e', roughness: 0.6 });
  // lit windows: warm room glow behind half-drawn curtains, sash bars; dark ones: glass with a faint reflection
  const litWinT = [0, 1, 2].map((v) => canvasTex(256, 192, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f6d8a4'); gr.addColorStop(1, '#d8a868'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    const cc = ['#c8b8a0', '#8a6a5a', '#a8b8c8'][v];
    c.fillStyle = cc; c.fillRect(0, 0, w * (0.18 + v * 0.08), h); c.fillRect(w * (0.82 - v * 0.04), 0, w, h);
    c.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = 0; x < w * 0.3; x += 10) c.fillRect(x, 0, 3, h);
    if (v === 1) { c.fillStyle = 'rgba(60,40,30,0.45)'; c.fillRect(w * 0.45, h * 0.55, w * 0.2, h * 0.45); }
    c.fillStyle = '#b8bcbe'; c.fillRect(w / 2 - 3, 0, 6, h);
  }));
  const darkWinT = canvasTex(256, 192, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#3a4450'); gr.addColorStop(0.5, '#1e2228'); gr.addColorStop(1, '#2a3038'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.06)'; c.beginPath(); c.moveTo(w * 0.1, h); c.lineTo(w * 0.35, 0); c.lineTo(w * 0.45, 0); c.lineTo(w * 0.2, h); c.fill(); c.fillStyle = '#9a9ea0'; c.fillRect(w / 2 - 3, 0, 6, h); });
  let winN = 0;
  const winM = (litW) => (litW ? std({ map: litWinT[winN++ % 3], emissive: '#ffffff', emissiveMap: litWinT[winN % 3], emissiveIntensity: 0.55, roughness: 0.4 }) : std({ map: darkWinT, roughness: 0.15, metalness: 0.2 }));
  // an aluminium window with sill, on a facade facing the alley (s = side: -1 west, +1 east)
  const windowAt = (s, z, y, w, h, litW, blinds) => {
    const fx = s * HW;
    g.add(box(0.08, h + 0.1, w + 0.1, std({ color: '#b8bcbe', metalness: 0.4, roughness: 0.4 }), fx - s * 0.03, y, z));
    const gl = plane(w, h, blinds ? std({ map: canvasTex(64, 128, (c, ww, hh) => { for (let i = 0; i < 32; i++) { c.fillStyle = i % 2 ? '#e8dcc4' : '#cfc2a8'; c.fillRect(0, i * 4, ww, 4); } }), emissive: litW ? '#ffd8a0' : '#000000', emissiveIntensity: 0.4 }) : winM(litW), fx - s * 0.075, y, z, s > 0 ? -Math.PI / 2 : Math.PI / 2);
    g.add(gl);
    g.add(box(0.05, h, 0.03, std({ color: '#b8bcbe' }), fx - s * 0.08, y, z));
    g.add(box(0.16, 0.05, w + 0.2, std({ color: '#8b8a86' }), fx - s * 0.08, y - h / 2 - 0.06, z));
  };
  const ry = (s) => (s > 0 ? -Math.PI / 2 : Math.PI / 2);

  // ---------------------------------------------------------------- floor
  {
    const f = plane(HW * 2, L + 6, std({ map: ptex('ba_brick.png', HW * 2 / 1.2, (L + 6) / 1.2), roughness: 0.8 }), 0, 0.012, -(L + 6) / 2 + 0.0);
    f.rotation.x = -Math.PI / 2; g.add(f);
    const gut = plane(0.35, L + 6, std({ color: '#7a7874', roughness: 0.85 }), -HW + 0.175, 0.016, -(L + 6) / 2);
    gut.rotation.x = -Math.PI / 2; g.add(gut);
    g.add(box(0.06, 0.03, L + 6, std({ color: '#8a8884' }), -HW + 0.38, 0.02, -(L + 6) / 2));
    const mh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.012, 28), std({ map: canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#3a3836'; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill(); c.strokeStyle = '#4e4c48'; c.lineWidth = 6; for (let r = 30; r < 120; r += 22) { c.beginPath(); c.arc(128, 128, r, 0, 7); c.stroke(); } for (let a = 0; a < 12; a++) { c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + Math.cos(a * 0.52) * 120, 128 + Math.sin(a * 0.52) * 120); c.stroke(); } }), metalness: 0.5, roughness: 0.5 }));
    mh.position.set(0.9, 0.018, -12.5); g.add(mh);
    const ns = plane(0.6, 0.38, std({ map: noSmokingTex(), roughness: 0.6 }), -0.2, 0.017, -6.2); ns.rotation.x = -Math.PI / 2; g.add(ns);
    // faint wet sheen + grime overlay (non-repeating)
    const gt = canvasTex(256, 1024, (c, w, h) => { const r = rng(9); c.clearRect(0, 0, w, h); for (let i = 0; i < 40; i++) { const x = r() * w, y = r() * h, rr = 20 + r() * 70; const gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(30,24,20,${0.1 + r() * 0.15})`); gr.addColorStop(1, 'rgba(30,24,20,0)'); c.fillStyle = gr; c.fillRect(x - rr, y - rr, rr * 2, rr * 2); } });
    gt.wrapS = gt.wrapT = THREE.ClampToEdgeWrapping;
    const ov = plane(HW * 2, L + 6, new THREE.MeshStandardMaterial({ map: gt, transparent: true, roughness: 0.3, depthWrite: false }), 0, 0.014, -(L + 6) / 2); ov.rotation.x = -Math.PI / 2; g.add(ov);
  }

  // ---------------------------------------------------------------- WEST side
  {
    const s = -1, bx = -HW - BD / 2;
    // W1: pink fish-scale render building, z 0..-7, 3 storeys
    g.add(block(BD, 10, 7, 'ba_scale.png', 1.0, '#ffffff', bx, 0, -3.5, 'ba_scale_n.png'));
    // a deep eave band between ground floor and upper floors (like the photo's overhang)
    g.add(box(0.7, 0.35, 7, std({ map: ptex('ba_scale.png', 7, 0.35), normalMap: ptex('ba_scale_n.png', 7, 0.35, false), roughness: 0.9 }), -HW + 0.35, 3.4, -3.5));
    for (const [z, y] of [[-1.8, 5.2], [-5.0, 5.2], [-1.8, 8.0], [-5.0, 8.0]]) windowAt(s, z, y, 1.4, 1.2, y < 6 && z < -3, false);
    // CORAL: dark canopy bar at street level
    const cv = canvasTex(1024, 192, (c, w, h) => { c.fillStyle = '#2a1e18'; c.fillRect(0, 0, w, h); c.fillStyle = '#efe6d6'; fitText(c, 'CORAL', 220, h / 2 + 6, 340, 110, F.roman, { spacing: 16 }); c.fillStyle = '#b89a6a'; fitText(c, 'bar · since 1979', 640, h / 2 + 6, 420, 54, F.couture); grime(c, w, h, 2, 80); });
    const can = new THREE.Group();
    const cm = std({ map: cv, roughness: 0.7 });
    const slope = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 0.9), std({ color: '#2a1e18', roughness: 0.75, side: THREE.DoubleSide })); slope.rotation.x = -Math.PI / 2 + 0.35; slope.position.set(0, 0.15, 0.42); can.add(slope);
    can.add(plane(5.2, 0.42, cm, 0, -0.12, 0.85));
    for (const k of [-1, 1]) can.add(plane(0.9, 0.42, std({ color: '#2a1e18', side: THREE.DoubleSide }), k * 2.6, -0.12, 0.42, Math.PI / 2));
    can.rotation.y = Math.PI / 2; can.position.set(-HW, 2.75, -3.4); g.add(can);
    // ground floor front under the canopy: dark wood with a door and a frosted window
    g.add(plane(6.4, 2.6, darkWood, -HW + 0.01, 1.3, -3.5, Math.PI / 2));
    g.add(box(0.06, 2.1, 0.95, std({ color: '#241812', roughness: 0.5 }), -HW + 0.04, 1.05, -2.6));
    g.add(box(0.05, 0.3, 0.03, std({ color: '#c9a050', metalness: 0.7, roughness: 0.3 }), -HW + 0.08, 1.05, -2.25));
    g.add(plane(1.6, 0.9, std({ color: '#e8c890', emissive: '#ffcf8a', emissiveIntensity: 0.7 }), -HW + 0.02, 1.5, -4.8, Math.PI / 2));
    for (let k = 0; k < 4; k++) g.add(box(0.04, 0.9, 0.03, darkWood, -HW + 0.04, 1.5, -5.6 + k * 0.53));
    const cl = new THREE.PointLight('#ffcf9a', 2.2, 5, 1.6); cl.position.set(-HW + 0.6, 2.2, -3.6); g.add(cl);
    // W2: brick-faced building, z -7..-12, 4 storeys, with raised entrance on red quarry-tile steps
    const brick = canvasTex(512, 512, (c, w, h) => { const r = rng(3); c.fillStyle = '#6a5446'; c.fillRect(0, 0, w, h); for (let j = 0; j < 16; j++) for (let i = 0; i < 5; i++) { const x = i * 104 + (j % 2) * 52 - 52, y = j * 32; c.fillStyle = `rgb(${120 + r() * 40},${62 + r() * 22},${44 + r() * 16})`; c.fillRect(x + 3, y + 3, 98, 26); } grime(c, w, h, 5, 120, 0.06); });
    brick.repeat.set(1, 1);
    const bm = (a, b) => { const t = brick.clone(); t.repeat.set(a / 1.6, b / 1.6); t.needsUpdate = true; return std({ map: t, roughness: 0.85 }); };
    g.add(block(BD, 12.5, 5, 'ba_stucco.png', 1.0, '#b7a89a', bx, 0, -9.5));
    g.add(plane(5, 3.0, bm(5, 3.0), -HW + 0.01, 1.5, -9.5, Math.PI / 2));
    for (const [z, y] of [[-8.4, 4.6], [-10.6, 4.6], [-8.4, 7.4], [-10.6, 7.4], [-8.4, 10.2], [-10.6, 10.2]]) windowAt(s, z, y, 1.3, 1.25, (z + y) % 3 < 1, y > 7);
    // steps (red quarry tile, two risers) up to a recessed door + roll shutter
    const tileT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#5a3a2e'; c.fillRect(0, 0, w, h); const r = rng(6); for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { c.fillStyle = `rgb(${150 + r() * 25},${66 + r() * 15},${48 + r() * 10})`; c.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); } });
    for (const [d, y] of [[1.0, 0.09], [0.6, 0.27]]) { const st = box(d, y * 2 > 0.3 ? 0.18 : 0.18, 2.4, std({ map: tileT, roughness: 0.6 }), -HW - 0.5 + d / 2 + 0.45, y, -9.3); g.add(st); }
    g.add(box(0.08, 2.0, 1.2, std({ color: '#2a2c2e', metalness: 0.3 }), -HW - 0.55, 1.36, -9.3));
    g.add(box(0.6, 0.16, 1.4, std({ color: '#5a5a58' }), -HW - 0.3, 2.45, -9.3));
    // the grey stone slab step at the gutter + planter with a shrub + white bin
    g.add(box(0.5, 0.15, 1.1, std({ color: '#8a8984', roughness: 0.9 }), -HW + 0.25, 0.075, -11.3));
    g.add(box(0.5, 0.45, 0.9, bm(0.9, 0.45), -HW + 0.25, 0.225, -7.95));
    for (let i = 0; i < 9; i++) { const r2 = rng(i + 2); const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16 + r2() * 0.08, 1), std({ color: ['#3d6a2e', '#4a7a36', '#2f5a24'][i % 3], roughness: 0.9, flatShading: true })); b.position.set(-HW + 0.25 + (r2() - 0.5) * 0.3, 0.55 + r2() * 0.25, -7.95 + (r2() - 0.5) * 0.6); g.add(b); }
    const bin = new THREE.Group();
    bin.add(rbox(0.42, 0.62, 0.36, 0.03, std({ color: '#d8d8d4', roughness: 0.5 }), 0, 0.31, 0));
    bin.add(rbox(0.46, 0.06, 0.4, 0.02, std({ color: '#c8c8c4', roughness: 0.5 }), 0, 0.65, 0));
    bin.position.set(-HW + 0.3, 0, -12.3); g.add(bin);
    col(-HW, -HW + 0.55, -12.55, -7.45);
    // W3: low row of small bars, z -12..-26, 2 storeys with shutters
    g.add(block(BD, 6.5, 14, 'ba_stucco.png', 1.0, '#c9c2b4', bx, 0, -19));
    const shutterT = canvasTex(128, 256, (c, w, h) => { for (let i = 0; i < 26; i++) { const gr = c.createLinearGradient(0, i * 10, 0, i * 10 + 10); gr.addColorStop(0, '#8a8e90'); gr.addColorStop(0.5, '#b9bdbf'); gr.addColorStop(1, '#6e7274'); c.fillStyle = gr; c.fillRect(0, i * 10, w, 10); } grime(c, w, h, 8, 50, 0.1); });
    for (const [z, open] of [[-14, false], [-17.5, true], [-21, false], [-24.2, true]]) {
      if (open) {
        g.add(plane(2.6, 2.4, std({ color: '#f0d8a8', emissive: '#ffcf90', emissiveIntensity: 0.45 }), -HW + 0.02, 1.2, z, Math.PI / 2));
        for (let k = 0; k < 5; k++) g.add(box(0.03, 2.4, 0.03, darkWood, -HW + 0.04, 1.2, z - 1.2 + k * 0.6));
        // noren (short split curtain) over the door
        const nt = canvasTex(512, 160, (c, w, h) => { c.fillStyle = '#1c2a48'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2ead8'; fitText(c, z < -20 ? 'おでん' : '居酒屋', w / 2, h / 2 + 4, w - 80, 100, F.brush); c.fillStyle = '#f4eee4'; for (let k = 1; k < 4; k++) c.fillRect(k * w / 4 - 2, h * 0.35, 4, h); });
        g.add(plane(1.3, 0.45, std({ map: nt, side: THREE.DoubleSide }), -HW + 0.12, 2.15, z, Math.PI / 2));
      } else {
        const sm = std({ map: shutterT, roughness: 0.5, metalness: 0.2 }); sm.map = shutterT.clone(); sm.map.repeat.set(2.4, 2); sm.map.needsUpdate = true;
        g.add(plane(2.6, 2.5, sm, -HW + 0.02, 1.25, z, Math.PI / 2));
      }
      g.add(box(0.25, 0.25, 2.8, std({ color: '#9a9c9a' }), -HW - 0.1, 2.6, z));
      windowAt(s, z, 4.4, 1.5, 1.1, z === -17.5, true);
    }
    const ol = new THREE.PointLight('#ffcf90', 2.0, 5, 1.6); ol.position.set(-HW + 0.8, 2.0, -17.5); g.add(ol);
    col(-HW - BD, -HW, -L, 0);
  }

  // ---------------------------------------------------------------- EAST side
  {
    const s = 1, bx = HW + BD / 2;
    // E1: beige render block z 0..-9, 4 storeys, arched louvre window, drain pipes, basement stair
    g.add(block(BD, 13, 9, 'ba_stucco.png', 1.0, '#ffffff', bx, 0, -4.5));
    // the arched louvre window (2F-3F)
    const arch = new THREE.Group();
    const archM = std({ color: '#8a8a86', roughness: 0.6 });
    const sh = new THREE.Shape(); sh.moveTo(-0.6, 0); sh.lineTo(-0.6, 1.4); sh.absarc(0, 1.4, 0.6, Math.PI, 0, true); sh.lineTo(0.6, 0); sh.lineTo(-0.6, 0);
    const lou = canvasTex(128, 256, (c, w, h) => { c.fillStyle = '#5a5c5c'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 10) { c.fillStyle = '#9a9c9a'; c.fillRect(0, y, w, 6); c.fillStyle = '#3a3a3a'; c.fillRect(0, y + 6, w, 2); } });
    const am = new THREE.Mesh(new THREE.ShapeGeometry(sh), std({ map: lou, roughness: 0.6 }));
    const uv = am.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) { const x = am.geometry.attributes.position.getX(i), y = am.geometry.attributes.position.getY(i); uv.setXY(i, x / 1.2 + 0.5, y / 2.0); }
    arch.add(am);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 6, 24, Math.PI), archM); rim.position.y = 1.4; arch.add(rim);
    for (const k of [-1, 1]) arch.add(box(0.1, 1.4, 0.06, archM, k * 0.62, 0.7, 0));
    arch.rotation.y = -Math.PI / 2; arch.position.set(HW - 0.02, 5.6, -6.2); g.add(arch);
    for (const [z, y] of [[-2.0, 5.8], [-2.0, 8.6], [-6.2, 9.6], [-2.0, 11.4]]) windowAt(s, z, y, 1.3, 1.2, y > 9, false);
    // drain pipes: one down the corner, one with an offset bend
    const pipeM = std({ color: '#5a5c5e', roughness: 0.5 });
    g.add(tube(V(HW + 0.12, 0, -8.85), V(HW + 0.12, 13, -8.85), 0.06, pipeM, 12));
    g.add(tube(V(HW + 0.1, 0.4, -4.1), V(HW + 0.1, 4.2, -4.1), 0.05, pipeM, 12));
    g.add(tube(V(HW + 0.1, 4.2, -4.1), V(HW + 0.1, 4.6, -3.7), 0.05, pipeM, 12));
    g.add(tube(V(HW + 0.1, 4.6, -3.7), V(HW + 0.1, 13, -3.7), 0.05, pipeM, 12));
    // TSUKIMIYA izakaya at street level (z -1..-6): lit glass sliding doors in dark wood, noren, lanterns
    g.add(plane(5.4, 2.7, darkWood, HW - 0.01, 1.35, -3.6, -Math.PI / 2));
    for (let k = 0; k < 4; k++) {
      const z = -1.6 - k * 0.95;
      g.add(plane(0.85, 1.9, std({ map: canvasTex(128, 256, (c, w, h) => { c.fillStyle = '#f6e2b8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#4a3020'; c.lineWidth = 3; for (let y = 0; y < h; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } for (let x = 0; x < w; x += 42) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } }), emissive: '#ffd090', emissiveIntensity: 0.65 }), HW - 0.02, 1.05, z, -Math.PI / 2));
      g.add(box(0.05, 1.95, 0.05, darkWood, HW - 0.03, 1.05, z - 0.45));
    }
    const nt = canvasTex(1024, 220, (c, w, h) => { c.fillStyle = '#7a1e1e'; c.fillRect(0, 0, w, h); c.fillStyle = '#f6eee0'; fitText(c, '月見屋', w / 2, h / 2 + 6, w * 0.6, 150, F.brush); c.fillStyle = '#f4eee4'; for (let k = 1; k < 5; k++) c.fillRect(k * w / 5 - 3, h * 0.38, 6, h); });
    g.add(plane(3.8, 0.6, std({ map: nt, side: THREE.DoubleSide, roughness: 0.85 }), HW - 0.14, 2.25, -3.6, -Math.PI / 2));
    g.add(tube(V(HW - 0.14, 2.56, -5.6), V(HW - 0.14, 2.56, -1.6), 0.02, darkWood, 6));
    // menu boards beside the door
    const mt = canvasTex(256, 512, (c, w, h) => { c.fillStyle = '#efe6d2'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1a'; ['名物', '煮込み', 'もつ焼', '串', '定食'].forEach((t2, i) => fitText(c, t2, w / 2, 60 + i * 92, w - 40, 72, F.brush)); c.strokeStyle = '#7a1e1e'; c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12); });
    g.add(plane(0.5, 1.0, std({ map: mt }), HW - 0.02, 1.25, -6.05, -Math.PI / 2));
    const il = new THREE.PointLight('#ffc888', 3.2, 6, 1.6); il.position.set(HW - 0.7, 2.0, -3.6); g.add(il);
    // the big white brush-lettered lightbox for 月見屋, on a bracket at the building's corner (faces down the alley)
    const bigT = vSign(320, 1080, '#f6f4ee', [['月見屋', F.brush, 1, '#141414']], { seed: 3 });
    const big = new THREE.Group();
    big.add(box(1.05, 3.4, 0.28, std({ color: '#e8e6e0', roughness: 0.4 })));
    for (const k of [-1, 1]) big.add(plane(1.0, 3.34, lit(bigT, 0.55), 0, 0, k * 0.141, k > 0 ? 0 : Math.PI));
    big.add(box(1.08, 0.08, 0.3, steel, 0, 1.74, 0)); big.add(box(1.08, 0.08, 0.3, steel, 0, -1.74, 0));
    big.position.set(HW - 0.62, 5.2, -0.6); g.add(big);
    for (const y of [3.7, 6.7]) g.add(box(0.15, 0.06, 0.06, steel, HW - 0.07, y, -0.6));
    // a small red-strip sign below it for the basement bar
    const b1T = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#c42a2e'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; fitText(c, 'スナック', w / 2, 70, w - 60, 70, F.antique); fitText(c, '2F · 鈴', w / 2, 180, w - 60, 100, F.brush); });
    const b1 = new THREE.Group(); b1.add(box(0.9, 0.45, 0.16, std({ color: '#ddd' }))); for (const k of [-1, 1]) b1.add(plane(0.86, 0.42, lit(b1T, 0.55), 0, 0, k * 0.081, k > 0 ? 0 : Math.PI));
    b1.position.set(HW - 0.5, 2.85, -11.55); g.add(b1); g.add(box(0.12, 0.05, 0.05, steel, HW - 0.05, 3.05, -11.55));
    // basement stair: an opening in the facade with steps going down behind a low rail (closed off by its own walls)
    // giant red lantern + white lantern
    const rl = lantern(0.42, 1.25, '#c8262a', 'もつ焼', '#141414', 4); rl.position.set(HW - 0.5, 2.5, -6.7); g.add(rl);
    g.add(tube(V(HW - 0.5, 3.38, -6.7), V(HW, 3.38, -6.7), 0.012, iron, 5));
    const wl = lantern(0.22, 0.6, '#f2eee4', 'やきとり', '#a01818', 5); wl.position.set(HW - 0.32, 2.45, -1.0); g.add(wl);
    g.add(tube(V(HW - 0.32, 2.98, -1.0), V(HW, 2.98, -1.0), 0.01, iron, 5));
    const lg = new THREE.PointLight('#ff8866', 1.6, 4, 1.6); lg.position.set(HW - 0.6, 2.4, -6.4); g.add(lg);
    // standing lightbox on casters, crates and stools out front
    const sA = vSign(256, 560, '#f8f6f0', [['月見屋', F.brush, 2.2, '#141414'], ['もつ焼 · 煮込み', F.antique, 0.55, '#c42020', true], ['生ビール', F.antique, 0.5, '#141414', true]], { border: '#c42020', seed: 9 });
    const ss = standingSign(sA, sA); ss.position.set(HW - 0.55, 0, -7.4); ss.rotation.y = -0.15; g.add(ss);
    col(HW - 0.95, HW, -7.75, -7.05);
    for (const [z, c2, y] of [[-8.3, '#f2c21a', 0], [-8.3, '#2a5ab0', 0.3], [-8.75, '#f2c21a', 0]]) { const cr = beerCrate(c2); cr.position.set(HW - 0.3, y, z); cr.rotation.y = Math.PI / 2; g.add(cr); }
    col(HW - 0.5, HW, -9.0, -8.05);
    for (const z of [-5.0, -5.6]) { const st = barStool('#c8302a'); st.position.set(HW - 0.45, 0, z); g.add(st); }
    col(HW - 0.68, HW, -5.85, -4.75);
    // E2: lower bar building z -9..-26, 3 storeys, with the sign tower
    g.add(block(BD, 9.5, 17, 'ba_stucco.png', 1.0, '#d8cfbf', bx, 0, -17.5));
    for (const z of [-11.5, -15, -19, -23]) {
      windowAt(s, z, 4.4, 1.6, 1.1, z === -15 || z === -23, z === -19);
      windowAt(s, z, 7.2, 1.6, 1.1, z === -11.5, true);
      // AC unit on a bracket under some windows
      if (z === -15 || z === -23) { g.add(box(0.3, 0.55, 0.8, std({ color: '#e4e2dc', roughness: 0.5 }), HW - 0.16, 3.35, z + 0.6)); g.add(new THREE.Mesh(new THREE.CircleGeometry(0.18, 20), std({ color: '#3a3c3e' })).translateX(HW - 0.315).translateY(3.35).translateZ(z + 0.6).rotateY(-Math.PI / 2)); }
    }
    // shop fronts on E2: a karaoke snack (purple lit door), a closed shutter, a yakitori stand with a counter
    const purple = std({ color: '#5a2a6a', emissive: '#a050c0', emissiveIntensity: 0.35 });
    for (const k of [-1, 1]) g.add(plane(0.7, 2.4, purple, HW - 0.01, 1.2, -12.5 + k * 0.85, -Math.PI / 2));
    g.add(plane(1.0, 0.2, purple, HW - 0.01, 2.3, -12.5, -Math.PI / 2));
    // the purple door opens onto a narrow stair up to the 2F snack: steps receding upward, pink light at the top
    const stT = canvasTex(256, 512, (c, w, h) => {
      c.fillStyle = '#120a12'; c.fillRect(0, 0, w, h);
      let y = h, sh = 70, inset = 0;
      for (let k = 0; k < 14 && sh > 4; k++) {
        const t = k / 14;
        c.fillStyle = `rgb(${70 + t * 140},${40 + t * 60},${70 + t * 110})`; c.fillRect(inset, y - sh * 0.35, w - inset * 2, sh * 0.35);
        c.fillStyle = `rgb(${40 + t * 90},${24 + t * 40},${44 + t * 70})`; c.fillRect(inset, y - sh, w - inset * 2, sh * 0.65);
        y -= sh; sh *= 0.82; inset += 7;
      }
      const gr = c.createRadialGradient(w / 2, y, 5, w / 2, y, 140); gr.addColorStop(0, 'rgba(255,140,220,0.9)'); gr.addColorStop(1, 'rgba(255,140,220,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, y + 60);
      c.fillStyle = '#2a1a2a'; c.fillRect(0, 0, 18, h); c.fillRect(w - 18, 0, 18, h);
    });
    g.add(plane(0.98, 2.18, std({ map: stT, emissive: '#ffffff', emissiveMap: stT, emissiveIntensity: 0.45 }), HW - 0.005, 1.1, -12.5, -Math.PI / 2));
    g.add(box(0.06, 0.06, 1.0, std({ color: '#e080c0', emissive: '#ff70c0', emissiveIntensity: 1.2 }), HW + 0.02, 2.25, -12.5));
    const shT = canvasTex(128, 256, (c, w, h) => { for (let i = 0; i < 26; i++) { const gr = c.createLinearGradient(0, i * 10, 0, i * 10 + 10); gr.addColorStop(0, '#7a8a96'); gr.addColorStop(0.5, '#a8b6c0'); gr.addColorStop(1, '#62707a'); c.fillStyle = gr; c.fillRect(0, i * 10, w, 10); } grime(c, w, h, 3, 60, 0.12); });
    shT.repeat.set(2.4, 2);
    g.add(plane(3.0, 2.5, std({ map: shT, metalness: 0.2, roughness: 0.5 }), HW - 0.01, 1.25, -17.5, -Math.PI / 2));
    g.add(box(0.25, 0.25, 3.2, std({ color: '#9a9c9a' }), HW + 0.1, 2.6, -17.5));
    // yakitori stand: counter at the front line, red lanterns, grill smoke hood
    g.add(plane(3.6, 2.5, std({ color: '#efd0a0', emissive: '#ffc070', emissiveIntensity: 0.5 }), HW - 0.01, 1.25, -22.5, -Math.PI / 2));
    g.add(box(0.5, 1.0, 3.2, darkWood, HW - 0.25, 0.5, -22.5));
    g.add(box(0.6, 0.05, 3.3, std({ color: '#8a6a40' }), HW - 0.28, 1.02, -22.5));
    g.add(box(0.6, 0.35, 1.4, std({ color: '#8a8c8e', metalness: 0.5 }), HW - 0.2, 2.2, -22.0));
    for (const z of [-21.2, -23.8]) { const l2 = lantern(0.17, 0.48, '#c8262a', 'やきとり', '#141414', z * -3); l2.position.set(HW - 0.3, 2.45, z); g.add(l2); }
    for (const z of [-21.6, -22.4, -23.2]) { const st = barStool('#2a2a2a'); st.position.set(HW - 0.75, 0, z); g.add(st); }
    col(HW - 0.95, HW, -24.2, -20.8);
    const yl = new THREE.PointLight('#ffb870', 2.4, 5, 1.6); yl.position.set(HW - 0.5, 2.1, -22.5); g.add(yl);
    // the sign tower: a steel frame holding five small lightboxes, mounted off the wall (faces down the alley)
    const tower = new THREE.Group();
    const signs = [
      ['パブスナック', '星', '#ffffff', '#1d1d1d', '#2a4a8a'],
      ['カラオケスタジオ', '歌声', '#ffffff', '#1d1d1d', '#2a4a8a'],
      ['パブ', '鈴', '#ffffff', '#1d1d1d', '#1d1d1d'],
      ['', '', '#c8c0e0', '#c8c0e0', '#a090c0'],
      ['カラオケスナック', '桜', '#c8262a', '#ffffff', '#8a1a1a'],
    ];
    signs.forEach(([top, name, bg, ink, strap], i) => {
      const t = smallSign(top || ' ', name || ' ', bg, ink, strap, i + 3);
      const sb = new THREE.Group();
      sb.add(box(0.8, 0.42, 0.16, std({ color: '#d8d8d4' })));
      for (const k of [-1, 1]) sb.add(plane(0.76, 0.38, lit(t, i === 3 ? 0.9 : 0.55), 0, 0, k * 0.081, k > 0 ? 0 : Math.PI));
      sb.position.set(0, -i * 0.5, 0); tower.add(sb);
    });
    tower.add(box(0.05, 2.7, 0.05, steel, 0.44, -1.0, 0)); tower.add(box(0.05, 2.7, 0.05, steel, -0.44, -1.0, 0));
    tower.position.set(HW - 0.55, 4.9, -10.2); g.add(tower);
    for (const y of [4.9, 2.9]) g.add(box(0.12, 0.05, 0.05, steel, HW - 0.06, y, -10.2));
    // bicycles parked along E2
    const b1k = bicycle('#2a2a2c'); b1k.position.set(HW - 0.3, 0, -14.6); b1k.rotation.y = Math.PI / 2 + 0.08; g.add(b1k);
    const b2k = bicycle('#8a1e1e'); b2k.position.set(HW - 0.32, 0, -15.6); b2k.rotation.y = Math.PI / 2 - 0.06; g.add(b2k);
    col(HW - 0.55, HW, -16.3, -13.9);
    col(HW, HW + BD, -L, 0);
  }

  // ---------------------------------------------------------------- the two gables facing the forecourt: windows, pipes, a meter box
  {
    for (const s of [-1, 1]) {
      const cx = s * (HW + 3), top = s < 0 ? 10 : 13;
      for (let f = 0; f < (s < 0 ? 2 : 3); f++) for (const dx of [-1.4, 1.4]) {
        const y = 4.8 + f * 2.8, x = cx + dx;
        const litW = (f + (dx > 0 ? 1 : 0) + (s > 0 ? 1 : 0)) % 3 === 0;
        g.add(box(1.4, 1.2, 0.08, std({ color: '#b8bcbe', metalness: 0.4, roughness: 0.4 }), x, y, 0.02));
        g.add(plane(1.3, 1.1, winM(litW), x, y, 0.065));
        g.add(box(1.6, 0.05, 0.18, std({ color: '#8b8a86' }), x, y - 0.66, 0.08));
      }
      g.add(tube(V(cx + s * 2.6, 0, 0.12), V(cx + s * 2.6, top, 0.12), 0.06, std({ color: '#5a5c5e' }), 10));
      // ground floor of the gable: a side door with a lamp and a meter box
      g.add(box(0.95, 2.1, 0.06, std({ color: s < 0 ? '#3a2a22' : '#5a5e62', roughness: 0.5 }), cx + s * 1.2, 1.05, 0.03));
      const dl = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), glow(1.8, 1.6, 1.2)); dl.position.set(cx + s * 1.2, 2.4, 0.15); g.add(dl);
      g.add(box(0.36, 0.5, 0.18, std({ color: '#d8d2c2', roughness: 0.5 }), cx - s * 0.6, 1.5, 0.09));
    }
  }

  // ---------------------------------------------------------------- vertical signs on the west side (face down the alley)
  {
    const mount = (tex, w, h, x, y, z, frame = '#e0e0dc') => {
      const sg = new THREE.Group();
      sg.add(box(w + 0.04, h + 0.04, 0.22, std({ color: frame, roughness: 0.4 })));
      for (const k of [-1, 1]) sg.add(plane(w, h, lit(tex, 0.55), 0, 0, k * 0.111, k > 0 ? 0 : Math.PI));
      sg.position.set(x, y, z); g.add(sg);
      for (const yy of [y + h / 2 - 0.2, y - h / 2 + 0.2]) g.add(box(Math.abs(x - -HW) + 0.05, 0.05, 0.05, steel, (x + -HW) / 2, yy, z));
    };
    // dark sign, pink lettering: つき · BAR · 2F
    mount(vSign(256, 680, '#16182a', [['つき', F.brush, 2.6, '#f0a0b8'], ['BAR · 2F', F.label, 0.45, '#ffffff', true]], { seed: 11 }), 0.6, 1.6, -HW + 0.5, 6.4, -0.8, '#1e1e24');
    // tall white sign: 膳や 灯楽 Toraku
    mount(vSign(256, 760, '#f4f1ea', [['膳や', F.antique, 0.8, '#1a1a1a'], ['灯楽', F.brush, 2.2, '#1a1a1a'], ['Toraku', F.couture, 0.35, '#5a5248', true]], { seed: 12 }), 0.7, 2.1, -HW + 0.55, 4.25, -1.6);
    // narrow green sign low down: 小料理 夢見
    mount(vSign(160, 560, '#1e3a2a', [['小料理', F.antique, 1, '#d8e8d0'], ['夢見', F.brush, 1.6, '#f2e070']], { seed: 13 }), 0.42, 1.5, -HW + 0.35, 2.3, -12.8, '#14261c');
    // yellow ホルモン sign further down + a small red ラーメン sign
    mount(vSign(200, 520, '#f2c21a', [['ホルモン', F.antique, 1, '#c42020']], { seed: 14 }), 0.5, 1.3, -HW + 0.4, 3.6, -20.5, '#d8a818');
    mount(vSign(200, 360, '#c42020', [['ラーメン', F.antique, 1, '#ffffff']], { seed: 15 }), 0.45, 0.85, -HW + 0.38, 2.3, -24.6, '#9a1818');
  }

  // ---------------------------------------------------------------- utility poles, lamps, wires, string lights
  {
    const p1 = utilityPole(9.5); p1.position.set(-HW + 0.45, 0, -6.85); g.add(p1);
    col(-HW + 0.2, -HW + 0.7, -7.1, -6.6);
    const la = streetLamp(); la.position.set(-HW + 0.45, 5.6, -6.85); g.add(la);
    const pl1 = new THREE.PointLight('#ffe2b0', 6, 11, 1.5); pl1.position.set(-HW + 1.35, 4.9, -6.85); g.add(pl1);
    const p2 = utilityPole(9.5); p2.position.set(HW - 0.45, 0, -18.6); g.add(p2);
    col(HW - 0.7, HW - 0.2, -18.85, -18.35);
    const lb = streetLamp(); lb.rotation.y = Math.PI; lb.position.set(HW - 0.45, 5.6, -18.6); g.add(lb);
    const pl2 = new THREE.PointLight('#ffe2b0', 6, 11, 1.5); pl2.position.set(HW - 1.35, 4.9, -18.6); g.add(pl2);
    // power lines along and across the alley
    const tops = [V(-HW + 0.45, 9.1, -6.85), V(HW - 0.45, 9.1, -18.6)];
    for (const dx of [-0.65, -0.25, 0.25, 0.65]) g.add(wire(V(tops[0].x + dx, 9.2, -6.85), V(tops[1].x + dx, 9.2, -18.6), 0.5, 0.012, cable));
    for (const dx of [-0.65, 0.65]) { g.add(wire(V(tops[0].x + dx, 8.5, -6.85), V(tops[0].x + dx * 2, 8.5, 6), 0.35, 0.012, cable)); g.add(wire(V(tops[1].x + dx, 8.5, -18.6), V(tops[1].x + dx * 2, 8.5, -32), 0.4, 0.012, cable)); }
    g.add(wire(V(-HW + 0.45, 7.2, -6.85), V(HW, 7.6, -1.5), 0.6, 0.016, cable));
    g.add(wire(V(-HW + 0.45, 6.8, -6.85), V(HW, 6.4, -9.0), 0.5, 0.014, cable));
    g.add(wire(V(HW - 0.45, 7.0, -18.6), V(-HW, 6.6, -13.0), 0.5, 0.014, cable));
    g.add(wire(V(HW - 0.45, 7.4, -18.6), V(-HW, 7.8, -24.0), 0.6, 0.016, cable));
    // strings of bulbs zig-zagging between the buildings
    const bulbM = glow(2.4, 2.1, 1.5);
    const zig = [[-HW, 0.0], [HW, -2.6], [-HW, -5.6], [HW, -8.4], [-HW, -11.2], [HW, -14.0], [-HW, -16.8], [HW, -19.6], [-HW, -22.4], [HW, -25.2]];
    for (let i = 0; i < zig.length - 1; i++) {
      const a = V(zig[i][0], 5.4 + (i % 2) * 0.3, zig[i][1]), b = V(zig[i + 1][0], 5.4 + ((i + 1) % 2) * 0.3, zig[i + 1][1]);
      const mid = a.clone().lerp(b, 0.5); mid.y -= 0.7;
      const c = new THREE.QuadraticBezierCurve3(a, mid, b);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 24, 0.006, 4), cable));
      for (let k = 1; k < 9; k++) {
        const p = c.getPoint(k / 9);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), bulbM); bulb.position.copy(p); bulb.position.y -= 0.06; g.add(bulb);
        g.add(tube(p, V(p.x, p.y - 0.03, p.z), 0.008, cable, 4));
      }
    }
  }

  // ---------------------------------------------------------------- far end: white apartment block across the end
  {
    const z = -L - 3;
    g.add(block(20, 11, 3, 'ba_stucco.png', 1.0, '#eeeeea', -3, 0, z - 1.5));
    g.add(block(6, 7, 6, 'ba_stucco.png', 1.0, '#cfc6b6', -HW - 9, 0, -L - 1.5));
    for (let f = 0; f < 3; f++) for (let i = -1; i <= 1; i++) {
      const y = 3.2 + f * 2.8, x = i * 3.6;
      g.add(box(2.4, 1.3, 0.05, winM((f + i) % 2 === 0), x, y + 0.5, z + 0.03));
      g.add(box(3.0, 0.12, 0.9, std({ color: '#e0e0dc' }), x, y - 0.3, z + 0.45));
      for (let k = 0; k <= 12; k++) g.add(box(0.025, 0.9, 0.025, steel, x - 1.5 + k * 0.25, y + 0.15, z + 0.88));
      g.add(box(3.0, 0.05, 0.05, steel, x, y + 0.6, z + 0.88));
    }
    // the alley turns left at the end: side walls continue a little, a street lamp lights the bend
    g.add(block(BD, 6.5, 3, 'ba_stucco.png', 1.0, '#c9c2b4', HW + BD / 2, 0, -L - 1.5));
    const fl = plane(HW * 2 + 6, 3, std({ map: ptex('ba_brick.png', (HW * 2 + 6) / 1.2, 2.5), roughness: 0.8 }), -3, 0.012, -L - 1.5); fl.rotation.x = -Math.PI / 2; g.add(fl);
    const el = new THREE.PointLight('#ffe2b0', 3, 8, 1.5); el.position.set(-1, 3.5, -L - 1.5); g.add(el);
    col(-HW, HW + BD, -L - 3.2, -L - 2.8);
    const fl2 = lantern(0.24, 0.65, '#f2eee4', 'おでん', '#1d3a8f', 21); fl2.position.set(-HW + 0.4, 2.5, -L + 0.8); g.add(fl2);
  }

  g.traverse((o) => { if (o.isMesh && o.material && o.material.transparent) o.castShadow = false; });
  g.userData.colliders = colliders;
  g.userData.area = { minX: -HW + 0.25, maxX: HW - 0.25, minZ: -L - 2.6, maxZ: 2.6 };
  return g;
}
