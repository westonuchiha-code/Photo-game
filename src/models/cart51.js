// Smashed shopping cart (queue item 51, photos/misc2/smashed-shopping-cart.jpg).
//   makeCart({ smashed })  grey wire shopping cart: tapered wire basket (grid of thin rods), the handle with a
//     faded red grip, a black flip-up child-seat panel, a bottom rack, tube frame and four small casters.
//     smashed: the basket is shoved sideways and down (the photo's crushed cart) and one caster is cocked.
//     Origin at the floor under the cart's centre, the handle at -x, nose +x.
//   makeCartCorral()  galvanized cart-corral rail run (two rails on posts) with an orange delineator post on a
//     black rubber base at its end, white parking lines, the smashed cart jammed against it.
import * as THREE from 'three';

function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.5, ...o }); }
function rod(a, b, r, mat, p) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 5), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); p.add(m); return m; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);

export function makeCart({ smashed = false } = {}) {
  const g = new THREE.Group(); g.name = smashed ? 'cart_smashed' : 'cart';
  const wire = std({ color: '#8e9294', metalness: 0.7, roughness: 0.45 }), frame = std({ color: '#7e8284', metalness: 0.7, roughness: 0.4 });
  // basket corners: wider/taller at the handle end (-x), tapering to the nose (+x)
  const B = { x0: -0.42, x1: 0.42, yb0: 0.46, yb1: 0.5, yt0: 0.98, yt1: 0.86, w0: 0.27, w1: 0.2 };
  // smash: shove the top of the basket sideways (+z) and down, more toward the nose
  const deform = (v) => { if (!smashed) return v; const t = (v.x - B.x0) / (B.x1 - B.x0), h = Math.max(0, (v.y - 0.45) / 0.5); v.z += h * (0.12 + 0.22 * t); v.y -= h * h * 0.12 * t; v.x += h * 0.05; return v; };
  const P = (u, s, h) => { const x = B.x0 + (B.x1 - B.x0) * u, w = B.w0 + (B.w1 - B.w0) * u, yb = B.yb0 + (B.yb1 - B.yb0) * u, yt = B.yt0 + (B.yt1 - B.yt0) * u; return deform(V(x, yb + (yt - yb) * h, s * w)); };
  // sides: vertical wires + horizontal rails
  for (const s of [-1, 1]) {
    for (let i = 0; i <= 18; i++) rod(P(i / 18, s, 0), P(i / 18, s, 1), 0.0022, wire, g);
    for (let j = 0; j <= 9; j++) for (let i = 0; i < 18; i++) rod(P(i / 18, s, j / 9), P((i + 1) / 18, s, j / 9), j % 9 === 0 ? 0.0045 : 0.0022, wire, g);
  }
  // floor grid + nose end
  for (let i = 0; i <= 18; i++) rod(P(i / 18, -1, 0), P(i / 18, 1, 0), 0.0022, wire, g);
  for (let k = -5; k <= 5; k++) for (let i = 0; i < 18; i++) { const a = P(i / 18, k / 5, 0), b = P((i + 1) / 18, k / 5, 0); a.z = (a.z * 0 + k / 5 * (B.w0 + (B.w1 - B.w0) * i / 18)); b.z = k / 5 * (B.w0 + (B.w1 - B.w0) * (i + 1) / 18); rod(deform(a), deform(b), 0.002, wire, g); }
  for (let k = -5; k <= 5; k++) rod(deform(V(B.x1, B.yb1, k / 5 * B.w1)), deform(V(B.x1, B.yt1, k / 5 * B.w1)), 0.0022, wire, g);
  for (let j = 0; j <= 9; j++) rod(P(1, -1, j / 9), P(1, 1, j / 9), 0.0022, wire, g);
  // the back gate (swing door) with the child seat: a grid + black flip-up panel lying on the top
  for (let k = -5; k <= 5; k++) rod(deform(V(B.x0, B.yb0, k / 5 * B.w0)), deform(V(B.x0, B.yt0, k / 5 * B.w0)), 0.0022, wire, g);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.012, 0.42), std({ color: '#1e1f20', roughness: 0.6 })); seat.position.copy(deform(V(-0.27, 0.99, 0))); seat.rotation.z = smashed ? 0.12 : 0.04; seat.rotation.x = smashed ? 0.18 : 0; seat.castShadow = true; g.add(seat);
  // handle frame + faded red grip
  for (const s of [-1, 1]) rod(V(-0.42, 0.45, s * 0.25), V(-0.55, 1.0, s * 0.27), 0.012, frame, g);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.56, 12), std({ color: '#a8545a', roughness: 0.7 })); grip.rotation.x = Math.PI / 2; grip.position.set(-0.56, 1.02, 0); g.add(grip);
  // base frame: two long tubes sloping to the nose, a bottom rack, casters
  for (const s of [-1, 1]) { rod(V(-0.5, 0.11, s * 0.24), V(0.5, 0.11, s * 0.16), 0.012, frame, g); rod(V(-0.42, 0.45, s * 0.25), V(-0.46, 0.11, s * 0.24), 0.012, frame, g); }
  for (let i = 0; i <= 12; i++) { const x = -0.44 + i * 0.075; rod(V(x, 0.13, -0.22 + i * 0.004), V(x, 0.13, 0.22 - i * 0.004), 0.002, wire, g); }
  const wheelM = std({ color: '#2a2a2a', roughness: 0.8 }), forkM = std({ color: '#9a9ea0', metalness: 0.7 });
  [[-0.47, -0.22], [-0.47, 0.22], [0.47, -0.15], [0.47, 0.15]].forEach(([x, z], i) => {
    const c = new THREE.Group(); c.position.set(x, 0, z); g.add(c);
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), wheelM); wh.rotation.x = Math.PI / 2; wh.position.y = 0.05; c.add(wh);
    rod(V(0, 0.11, 0), V(0.02, 0.05, 0), 0.008, forkM, c);
    if (smashed && i === 3) { c.rotation.z = 0.25; c.rotation.y = 0.8; }
  });
  if (smashed) g.rotation.z = -0.03;
  return g;
}
export function makeCartCorral() {
  const g = new THREE.Group(); g.name = 'cart_corral';
  const galv = std({ color: '#b8bcbe', metalness: 0.75, roughness: 0.35 });
  const L = 3.2;
  for (const [y, z] of [[0.55, -0.3], [0.85, -0.3]]) rod(V(0, y, z), V(L, y, z), 0.03, galv, g);
  for (const x of [0, 1.6, 3.2]) rod(V(x, 0, -0.3), V(x, 0.88, -0.3), 0.03, galv, g);
  rod(V(0, 0.85, -0.3), V(0, 0.85, 0.6), 0.03, galv, g); rod(V(0, 0.85, 0.6), V(0, 0, 0.6), 0.03, galv, g);
  // orange delineator post on a rubber base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.06, 20), std({ color: '#1a1a1a', roughness: 0.9 })); base.position.set(L + 0.4, 0.03, 0.1); g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 1.1, 16), std({ color: '#f05a1a', roughness: 0.5 })); post.position.set(L + 0.4, 0.6, 0.1); g.add(post);
  for (const y of [0.75, 0.95]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.047, 0.06, 16), std({ color: '#f2f2ee', roughness: 0.3 })); b.position.set(L + 0.4, y, 0.1); g.add(b); }
  // white lines
  for (const z of [0.9, -0.95]) { const ln = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.1), std({ color: '#e8e8e2' })); ln.rotation.x = -Math.PI / 2; ln.position.set(1.8, 0.008, z); g.add(ln); }
  const c = makeCart({ smashed: true }); c.position.set(1.0, 0, 0.12); c.rotation.y = 0.35; g.add(c);
  const c2 = makeCart(); c2.position.set(2.6, 0, 0.0); c2.rotation.y = Math.PI; g.add(c2);
  g.userData.collider = [-0.1, L + 0.7, -0.4, 0.7];
  return g;
}
