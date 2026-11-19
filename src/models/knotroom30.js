// The Knot Room: a small old wood-panelled bar built from the queue item 30 surfaces (photos/grime/).
// Name and labels are made up.
//   floor      worn pine planks (two photos, mixed per board run)
//   walls      gouged dark-plank wainscot to 1.1 m, crackled varnish panels above in dark rails, a picture
//              rail; plaster scroll-relief sconces (the photo's relief, lit from inside) on the side walls
//   bar        across the back: gouged plank front, a thick worn-plank top with a brass foot rail; behind
//              it a scratched-stainless back counter, shelves of bottles, a tap tower
//   room       the grey/orange abstract painting, two barrel tables with stools, a plank-and-beam ceiling
//   front      dark gouged-plank facade, a half-glazed door, a small-paned window, a hanging sign
// Faces +z, origin at floor level in the middle of the front; room x -3.3..3.3, z 0..-6.
// userData: colliders [[x0,x1,z0,z1]], areas [{minX..}]
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
function tx(name, rx, ry, srgb = true) {
  const t = _L.load(`assets/textures/${name}.png`);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8;
  return t;
}
// material with metre-scaled repeat: unitU x unitV metres per texture tile
function surf(name, w, h, unitU, unitV = unitU, { n = 0, rough = 0.8, color = '#ffffff', metal = 0 } = {}) {
  const m = new THREE.MeshStandardMaterial({ map: tx(name, w / unitU, h / unitV), roughness: rough, color, metalness: metal });
  if (n) { m.normalMap = tx(name + '_n', w / unitU, h / unitV, false); m.normalScale.set(n, n); }
  return m;
}
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.7, ...o });
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function plane(w, h, mat, x, y, z, ry = 0, rx = 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true; return m; }
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
function tube(a, b, r, mat, seg = 10) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return m; }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const glow = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });

// a plaster sconce: half of a flared cylinder, the scroll-relief photo on its face, warm light spilling up
function sconce() {
  const g = new THREE.Group();
  const geo = new THREE.CylinderGeometry(0.17, 0.11, 0.42, 24, 1, true, -Math.PI / 2, Math.PI);
  const m = std({ map: tx('wd_scroll', 1, 1), normalMap: tx('wd_scroll_n', 1, 1, false), roughness: 0.9, side: THREE.DoubleSide });
  m.normalScale.set(1.2, 1.2);
  const s = new THREE.Mesh(geo, m); s.position.y = 0.21; g.add(s);
  const cap = new THREE.Mesh(new THREE.CircleGeometry(0.11, 24, -Math.PI / 2, Math.PI), std({ color: '#e8e2d6' })); cap.rotation.x = -Math.PI / 2; g.add(cap);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), glow(2.6, 2.0, 1.3)); bulb.position.set(0, 0.32, 0.06); g.add(bulb);
  const wash = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), new THREE.MeshBasicMaterial({ color: '#ffcf8a', transparent: true, opacity: 0.18, depthWrite: false, toneMapped: false }));
  wash.position.set(0, 0.7, 0.003); g.add(wash);
  return g;
}
function bottle(r, h, col, seed) {
  const g = new THREE.Group();
  const pts = [[0, 0], [r, 0], [r, h * 0.62], [r * 0.45, h * 0.78], [r * 0.32, h * 0.82], [r * 0.32, h], [0, h]].map(([a, b]) => new THREE.Vector2(a, b));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 16), new THREE.MeshStandardMaterial({ color: col, transparent: true, opacity: 0.8, roughness: 0.1 })));
  const lab = document.createElement('canvas'); lab.width = 128; lab.height = 64; const c = lab.getContext('2d');
  const rr = rng(seed); c.fillStyle = ['#efe6cc', '#1a1a1a', '#c8b07a', '#f4f4f0'][Math.floor(rr() * 4)]; c.fillRect(0, 0, 128, 64);
  c.fillStyle = c.fillStyle === '#1a1a1a' ? '#d9b860' : '#3a2a1a'; c.font = `22px ${F.roman}`; c.textAlign = 'center'; c.fillText(['RYE', 'OAK', 'No.7', 'MALT', 'GIN', 'AMARO'][Math.floor(rr() * 6)], 64, 40);
  const lt = new THREE.CanvasTexture(lab); lt.colorSpace = THREE.SRGBColorSpace;
  const l = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.001, r + 0.001, h * 0.3, 16, 1, true, -0.8, 1.6), std({ map: lt })); l.position.y = h * 0.35; g.add(l);
  return g;
}

export function makeKnotRoom() {
  const g = new THREE.Group(); g.name = 'knot_room';
  const W = 6.6, HW = W / 2, D = 6, CH = 3.0, WA = 1.1;
  const colliders = [];
  const col = (x0, x1, z0, z1) => colliders.push([x0, x1, z0, z1]);
  const dark = std({ color: '#2a1a10', roughness: 0.55 });
  const brass = std({ color: '#c9a050', metalness: 0.8, roughness: 0.3 });

  // floor: runs of boards (planks along x), alternating the two worn-plank photos
  for (let k = 0; k < 6; k++) {
    const z0 = -k * 1.0, m = surf(k % 2 ? 'wd_plank_a' : 'wd_plank_b', W, 1.0, 2.4, 1.2, { n: 0.6, rough: 0.55 });
    m.map.offset.x = k * 0.37; if (m.normalMap) m.normalMap.offset.x = k * 0.37;
    g.add(plane(W, 1.0, m, 0, 0.004, z0 - 0.5, 0, -Math.PI / 2));
  }
  // walls: wainscot + crackle panels + rails, on back and both sides
  const walls = [[W, 0, -D, 0], [D, -HW, -D / 2, Math.PI / 2], [D, HW, -D / 2, -Math.PI / 2]];
  for (const [len, x, z, ry] of walls) {
    const n = new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry));
    const at = (d) => [x + n.x * d, z + n.z * d];
    const [wx, wz] = at(0.002);
    g.add(plane(len, WA, surf('wd_plank_d', len, WA, 1.2, 0.55, { n: 0.9, rough: 0.7 }), wx, WA / 2, wz, ry));
    g.add(plane(len, CH - WA, surf('wd_crackle', len, CH - WA, 0.9, 0.9, { n: 0.6, rough: 0.5, color: '#f2e6cc' }), x + n.x * 0.001, WA + (CH - WA) / 2, z + n.z * 0.001, ry));
    // chair rail, picture rail, skirting, and vertical stiles every 1.1 m dividing the crackle into panels
    for (const [y, h, d] of [[WA, 0.07, 0.05], [CH - 0.35, 0.05, 0.035], [0.06, 0.12, 0.03]]) {
      const r = box(len, h, d, dark); r.position.set(...(() => { const [px, pz] = at(d / 2); return [px, y, pz]; })()); r.rotation.y = ry; g.add(r);
    }
    for (let k = 1; k * 1.1 < len - 0.2; k++) {
      const off = -len / 2 + k * 1.1, t = new THREE.Vector3(Math.cos(ry), 0, -Math.sin(ry));
      const s = box(0.06, CH - WA - 0.42, 0.03, dark); const [px, pz] = at(0.015);
      s.position.set(px + t.x * off, WA + (CH - WA - 0.42) / 2 + 0.035, pz + t.z * off); s.rotation.y = ry; g.add(s);
    }
  }
  col(-HW - 0.3, HW + 0.3, -D - 0.3, -D + 0.05); col(-HW - 0.3, -HW + 0.05, -D, 0); col(HW - 0.05, HW + 0.3, -D, 0);
  // ceiling: planks with dark beams
  g.add(plane(W, D, surf('wd_plank_a', W, D, 2.4, 1.2, { rough: 0.8, color: '#9a8270' }), 0, CH, -D / 2, 0, Math.PI / 2));
  for (let k = 0; k < 4; k++) g.add(box(W, 0.22, 0.16, dark, 0, CH - 0.11, -0.9 - k * 1.4));

  // sconces: two on each side wall (they're the room's light)
  for (const s of [-1, 1]) for (const z of [-1.6, -4.2]) {
    const sc = sconce(); sc.position.set(s * (HW - 0.003), 1.75, z); sc.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(sc);
  }
  for (const s of [-1, 1]) { const l = new THREE.PointLight('#ffc98a', 3.2, 6, 1.6); l.position.set(s * (HW - 0.6), 2.3, -2.9); g.add(l); }

  // the bar across the back
  {
    const bz = -D + 1.3, bw = W - 1.2;
    g.add(box(bw, 1.02, 0.08, surf('wd_plank_c', bw, 1.02, 1.6, 0.8, { n: 0.9, rough: 0.6 }), -0.6 + 0.6, 0.51, bz + 0.3));
    g.add(box(bw, 1.0, 0.5, dark, 0, 0.5, bz + 0.02));
    const top = box(bw + 0.1, 0.07, 0.68, surf('wd_plank_b', bw + 0.1, 0.68, 2.4, 1.2, { n: 0.7, rough: 0.35 }), 0, 1.055, bz + 0.12); g.add(top);
    g.add(tube(V(-bw / 2, 0.2, bz + 0.48), V(bw / 2, 0.2, bz + 0.48), 0.022, brass));
    for (let k = 0; k <= 4; k++) g.add(tube(V(-bw / 2 + k * bw / 4, 0.0, bz + 0.38), V(-bw / 2 + k * bw / 4, 0.2, bz + 0.48), 0.012, brass, 6));
    // tap tower
    g.add(box(0.36, 0.3, 0.1, std({ color: '#c9ccce', metalness: 0.8, roughness: 0.25 }), 0.6, 1.24, bz));
    for (let k = 0; k < 3; k++) { g.add(tube(V(0.48 + k * 0.12, 1.3, bz + 0.05), V(0.48 + k * 0.12, 1.3, bz + 0.13), 0.01, brass, 6)); g.add(box(0.025, 0.12, 0.025, std({ color: ['#1a1a1a', '#7a2a1a', '#e8d8b8'][k] }), 0.48 + k * 0.12, 1.42, bz + 0.13)); }
    // back counter: scratched stainless
    const sc = surf('wd_steel', W - 0.4, 0.55, 1.0, 1.0, { rough: 0.35, metal: 0.6, color: '#d8dadc' });
    g.add(box(W - 0.4, 0.9, 0.55, sc, 0, 0.45, -D + 0.3));
    g.add(box(W - 0.4, 0.03, 0.57, sc, 0, 0.915, -D + 0.3));
    // shelves of bottles above it
    const r = rng(7);
    for (let s = 0; s < 3; s++) {
      const y = 1.35 + s * 0.42;
      g.add(box(W - 0.8, 0.04, 0.25, dark, 0, y, -D + 0.14));
      for (let k = 0; k < 14; k++) { const b = bottle(0.035 + r() * 0.01, 0.26 + r() * 0.08, ['#3a2210', '#6a3a14', '#2a4a2a', '#c8d8d0', '#7a5a2a'][Math.floor(r() * 5)], s * 20 + k); b.position.set(-HW + 0.6 + k * 0.38 + r() * 0.05, y + 0.02, -D + 0.14); g.add(b); }
    }
    const shl = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.8, 1.3), new THREE.MeshBasicMaterial({ color: '#ffcf8a', transparent: true, opacity: 0.1, depthWrite: false }));
    shl.position.set(0, 1.85, -D + 0.02); g.add(shl);
    col(-bw / 2 - 0.05, bw / 2 + 0.05, -D, bz + 0.5);
    // stools
    for (let k = 0; k < 5; k++) {
      const st = new THREE.Group(), x = -bw / 2 + 0.45 + k * (bw - 0.9) / 4;
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.06, 20), surf('wd_plank_a', 0.4, 0.4, 0.8, 0.4)); seat.position.y = 0.76; st.add(seat);
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; st.add(tube(V(Math.cos(a) * 0.12, 0.74, Math.sin(a) * 0.12), V(Math.cos(a) * 0.19, 0, Math.sin(a) * 0.19), 0.018, dark, 6)); }
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.01, 6, 20), brass); ring.rotation.x = Math.PI / 2; ring.position.y = 0.28; st.add(ring);
      st.position.set(x, 0, bz + 0.95); g.add(st);
    }
    col(-bw / 2, bw / 2, bz + 0.75, bz + 1.15);
  }
  // the abstract painting on the left wall, in a thin black frame with a picture light
  g.add(box(0.04, 1.28, 0.98, std({ color: '#151515' }), -HW + 0.05, 1.9, -2.9));
  g.add(plane(0.9, 1.2, std({ map: tx('wd_painting', 1, 1), roughness: 0.6 }), -HW + 0.072, 1.9, -2.9, Math.PI / 2));
  // two barrel tables with stools near the front
  for (const [x, z] of [[1.9, -1.4], [-1.6, -1.2]]) {
    const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(new THREE.Vector2(0.3 + 0.05 * Math.sin(t * Math.PI), t * 0.95)); }
    const b = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), surf('wd_plank_c', 2, 1, 1.6, 0.8, { n: 0.8 })); b.position.set(x, 0, z); g.add(b);
    for (const y of [0.15, 0.8]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.012, 6, 28), std({ color: '#2a2a2a', metalness: 0.6 })); h.rotation.x = Math.PI / 2; h.position.set(x, y, z); g.add(h); }
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 28), surf('wd_plank_b', 1, 1, 1.2, 0.6, { rough: 0.4 })); top.position.set(x, 0.98, z); g.add(top);
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.1, 14), new THREE.MeshStandardMaterial({ color: '#d8a24a', transparent: true, opacity: 0.6, roughness: 0.05 })); glass.position.set(x + 0.1, 1.055, z); g.add(glass);
    col(x - 0.45, x + 0.45, z - 0.45, z + 0.45);
  }

  // front: dark gouged-plank facade with a door and a small-paned window, a hanging sign
  {
    const FH = 3.6, D0 = [-0.2, 0.8];   // door x range
    const fm = (w, h) => surf('wd_plank_d', w, h, 1.2, 0.55, { n: 0.9, rough: 0.7, color: '#8a6a50' });
    for (const [a, b] of [[-HW - 0.1, -2.6], [-0.9, D0[0]], [D0[1], HW + 0.1]]) { g.add(plane(b - a, FH, fm(b - a, FH), (a + b) / 2, FH / 2, 0.06)); g.add(plane(b - a, FH, fm(b - a, FH), (a + b) / 2, FH / 2, -0.002, Math.PI)); }
    for (const [a, b, y0, y1] of [[-2.6, -0.9, 0, 0.9], [-2.6, -0.9, 2.3, FH], [D0[0], D0[1], 2.2, FH]]) { g.add(plane(b - a, y1 - y0, fm(b - a, y1 - y0), (a + b) / 2, (y0 + y1) / 2, 0.06)); g.add(plane(b - a, y1 - y0, fm(b - a, y1 - y0), (a + b) / 2, (y0 + y1) / 2, -0.002, Math.PI)); }
    // window: 4 x 3 panes, warm light
    g.add(plane(1.7, 1.4, new THREE.MeshStandardMaterial({ color: '#e8b870', emissive: '#ffbf70', emissiveIntensity: 0.25, transparent: true, opacity: 0.35, depthWrite: false }), -1.75, 1.6, 0.03));
    for (let k = 0; k <= 4; k++) g.add(box(0.04, 1.4, 0.06, dark, -2.6 + k * 0.425, 1.6, 0.03));
    for (let k = 0; k <= 3; k++) g.add(box(1.7, 0.04, 0.06, dark, -1.75, 0.9 + k * 0.467, 0.03));
    // door: half-glazed, standing open inward
    const door = new THREE.Group();
    door.add(box(0.98, 2.15, 0.05, surf('wd_plank_c', 0.98, 2.15, 1.6, 0.8, { n: 0.8 }), 0.49, 1.075, 0));
    door.add(box(0.6, 0.7, 0.06, new THREE.MeshStandardMaterial({ color: '#e8b870', transparent: true, opacity: 0.3 }), 0.49, 1.6, 0));
    door.add(box(0.03, 0.2, 0.06, brass, 0.85, 1.0, 0.04));
    door.position.set(D0[0], 0, -0.05); door.rotation.y = 1.3; g.add(door);
    col(-HW - 0.1, D0[0], -0.15, 0.1); col(D0[1], HW + 0.1, -0.15, 0.1); col(D0[0], D0[0] + 0.3, -1.0, -0.05);
    // hanging sign on an iron bracket
    const st = document.createElement('canvas'); st.width = 512; st.height = 320; const c = st.getContext('2d');
    c.fillStyle = '#1e140c'; c.fillRect(0, 0, 512, 320); c.strokeStyle = '#c9a050'; c.lineWidth = 8; c.strokeRect(14, 14, 484, 292);
    c.fillStyle = '#e9d6a8'; fitText(c, 'THE', 256, 80, 200, 40, F.roman, { spacing: 12 }); fitText(c, 'KNOT ROOM', 256, 160, 440, 86, F.roman, { spacing: 6 });
    c.fillStyle = '#c9a050'; fitText(c, 'est. 1958  ·  ale & spirits', 256, 250, 400, 30, F.couture);
    const stt = new THREE.CanvasTexture(st); stt.colorSpace = THREE.SRGBColorSpace;
    const sg = new THREE.Group(); sg.add(box(0.8, 0.5, 0.05, dark)); for (const k of [-1, 1]) { const m = plane(0.76, 0.46, std({ map: stt }), 0, 0, k * 0.026, k > 0 ? 0 : Math.PI); sg.add(m); }
    sg.rotation.y = Math.PI / 2; sg.position.set(1.6, 2.85, 0.6); g.add(sg);
    const iron = std({ color: '#1a1a1a', metalness: 0.5 });
    g.add(tube(V(1.6, 3.15, 0.06), V(1.6, 3.15, 1.0), 0.015, iron, 6));
    for (const z of [0.4, 0.8]) g.add(tube(V(1.6, 3.15, z), V(1.6, 3.1, z), 0.006, iron, 4));
    const ll = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), glow(2.4, 1.9, 1.2)); ll.position.set(0.3, 2.5, 0.25); g.add(ll);
    // shell: roof + outer side/back walls
    const shell = std({ color: '#4a3a2c', roughness: 0.9 });
    g.add(box(W + 0.3, 0.2, D + 0.2, shell, 0, FH + 0.1, -D / 2));
    for (const s of [-1, 1]) g.add(box(0.12, FH, D, shell, s * (HW + 0.07), FH / 2, -D / 2));
    g.add(box(W + 0.3, FH, 0.12, shell, 0, FH / 2, -D - 0.07));
  }

  g.traverse((o) => { if (o.isMesh && o.material && o.material.transparent) o.castShadow = false; });
  g.userData.colliders = colliders;
  g.userData.areas = [{ minX: -HW + 0.3, maxX: HW - 0.3, minZ: -D + 0.3, maxZ: -0.15 }, { minX: -0.05, maxX: 0.65, minZ: -0.6, maxZ: 1.2 }];
  return g;
}
