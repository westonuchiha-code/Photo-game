// Police vehicles from the police photos, with a made-up department:
// "Maple Creek Police" (MCPD) - ties in with the town's made-up rental sign.
//   makePatrolCart():    three-wheel mini patrol car - tall boxy white cab,
//                        big raked windscreen, blue side stripe, shield
//                        badge, roof light bar, push bumper, amber lights.
//   makePatrolScooter(): white maxi-scooter - tall windscreen, stacked
//                        headlights, front fender reading POLICE, MCPD on
//                        the side panels, black seat, alloy wheels.
// Local axes: front toward +z, ground y = 0.
import * as THREE from 'three';

const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.45, ...o });
const glow = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};
function profileBody(points, width, bevel, mat) {
  const sh = new THREE.Shape();
  points.forEach(([z, y], i) => (i ? sh.lineTo(z, y) : sh.moveTo(z, y)));
  const geo = new THREE.ExtrudeGeometry(sh, { depth: width - 2 * bevel, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3 });
  geo.translate(0, 0, -(width - 2 * bevel) / 2);
  geo.rotateY(-Math.PI / 2);
  return mesh(geo, mat);
}
function wheel(r, w, mats) {
  const g = new THREE.Group();
  const t = new THREE.Mesh(new THREE.TorusGeometry(r - w * 0.35, w * 0.45, 12, 28), mats.tyre);
  t.rotation.y = Math.PI / 2;
  g.add(t);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(r - w * 0.6, r - w * 0.6, w * 0.8, 20), mats.rim);
  rim.rotation.z = Math.PI / 2;
  g.add(rim);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

const BLUE = '#1d4fc4';
const sideDecal = (w, h) => canvasTex(512, 256, (x, W, H) => {
  x.clearRect(0, 0, W, H);
  x.fillStyle = BLUE; x.fillRect(0, H * 0.42, W, H * 0.12);       // stripe
  x.fillStyle = '#0d2a6e'; x.fillRect(0, H * 0.555, W, H * 0.03);
  x.fillStyle = BLUE; x.font = 'italic bold 92px Arial'; x.fillText('MCPD', W * 0.18, H * 0.38);
  // shield badge
  x.save(); x.translate(W * 0.82, H * 0.62);
  x.fillStyle = '#e9e5d6'; x.strokeStyle = '#13306f'; x.lineWidth = 5;
  x.beginPath(); x.moveTo(-34, -40); x.lineTo(34, -40); x.lineTo(34, 8); x.quadraticCurveTo(0, 50, -34, 8); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = '#13306f'; x.font = 'bold 18px Arial'; x.textAlign = 'center'; x.fillText('MAPLE', 0, -14); x.fillText('CREEK', 0, 6);
  x.restore();
  x.fillStyle = '#13306f'; x.font = 'bold 22px Arial'; x.fillText('CITY OF MAPLE CREEK POLICE', W * 0.05, H * 0.9);
});

export function makePatrolCart() {
  const mats = {
    white: std({ color: '#eceeec', roughness: 0.35, metalness: 0.1 }),
    dark: std({ color: '#1b1c1e', roughness: 0.6 }),
    tyre: std({ color: '#141414', roughness: 0.9 }),
    rim: std({ color: '#3a3c3f', roughness: 0.5, metalness: 0.4 }),
    glass: std({ color: '#141a1e', roughness: 0.08, metalness: 0.6, emissive: '#05080a' }),
    amber: std({ color: '#f29a1d', emissive: '#3a1c00' }),
  };
  const g = new THREE.Group();
  g.name = 'patrol_cart';
  const L = 2.3, W = 1.25;
  // body: tall box, nose sloping into a big raked windscreen
  const body = profileBody([[-L / 2, 0.28], [L / 2 - 0.1, 0.28], [L / 2, 0.42], [L / 2, 0.85], [L / 2 - 0.5, 1.78], [-L / 2 + 0.05, 1.82], [-L / 2, 1.75]], W, 0.05, mats.white);
  g.add(body);
  // windscreen + side windows + door openings
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.14, 1.08), mats.glass);
  const ang = Math.atan2(1.78 - 0.85, 0.5);
  ws.rotation.x = -(Math.PI / 2 - ang);
  const n = new THREE.Vector3(0, 0, 1).applyEuler(ws.rotation);
  ws.position.set(0, (0.85 + 1.78) / 2, L / 2 - 0.25).addScaledVector(n, 0.055);
  g.add(ws);
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.62), mats.glass);
    side.position.set(s * (W / 2 + 0.052), 1.38, -0.15);
    side.rotation.y = s * Math.PI / 2;
    g.add(side);
    const decal = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.95), new THREE.MeshStandardMaterial({ map: sideDecal(), transparent: true, roughness: 0.4 }));
    decal.position.set(s * (W / 2 + 0.052), 0.72, -0.05);
    decal.rotation.y = s * Math.PI / 2;
    g.add(decal);
  }
  // front: push bumper, square headlights, amber signals, badge
  g.add(mesh(new THREE.BoxGeometry(W + 0.08, 0.16, 0.12), mats.dark, 0, 0.45, L / 2 + 0.08));
  for (const s of [-1, 1]) {
    g.add(mesh(new THREE.BoxGeometry(0.06, 0.4, 0.06), mats.dark, s * 0.4, 0.55, L / 2 + 0.1));
    g.add(mesh(new THREE.BoxGeometry(0.16, 0.12, 0.03), glow(1.6, 1.6, 1.5), s * 0.42, 0.7, L / 2 + 0.035));
    g.add(mesh(new THREE.SphereGeometry(0.04, 10, 8), mats.amber, s * 0.25, 0.7, L / 2 + 0.04));
  }
  // roof light bar (red / blue, flashing in update)
  g.add(mesh(new THREE.BoxGeometry(0.95, 0.05, 0.22), mats.dark, 0, 1.86, -0.3));
  const red = glow(2.4, 0.2, 0.2), blue = glow(0.25, 0.45, 2.6), off = std({ color: '#2a2a30' });
  const lb = [mesh(new THREE.BoxGeometry(0.42, 0.09, 0.2), red, -0.23, 1.93, -0.3), mesh(new THREE.BoxGeometry(0.42, 0.09, 0.2), blue, 0.23, 1.93, -0.3)];
  lb.forEach((m) => g.add(m));
  // 3 wheels: one at the front, two at the back
  const fw = wheel(0.28, 0.16, mats); fw.position.set(0, 0.28, L / 2 - 0.35); g.add(fw);
  for (const s of [-1, 1]) { const w = wheel(0.28, 0.16, mats); w.position.set(s * (W / 2 - 0.04), 0.28, -L / 2 + 0.45); g.add(w); }
  // dark underside skirt so the wheel arches read
  g.add(mesh(new THREE.BoxGeometry(W - 0.1, 0.06, L - 0.3), mats.dark, 0, 0.26, 0));
  g.userData.update = (t, on = true) => {
    const ph = Math.floor(t * 3) % 2;
    lb[0].material = on && ph === 0 ? red : off;
    lb[1].material = on && ph === 1 ? blue : off;
  };
  g.userData.size = { w: W, l: L };
  return g;
}

export function makePatrolScooter() {
  const mats = {
    white: std({ color: '#e9ebe8', roughness: 0.3, metalness: 0.1 }),
    dark: std({ color: '#26282b', roughness: 0.55 }),
    seat: std({ color: '#141416', roughness: 0.6 }),
    tyre: std({ color: '#141414', roughness: 0.9 }),
    rim: std({ color: '#2e3033', roughness: 0.4, metalness: 0.5 }),
    chrome: std({ color: '#c9ccd0', roughness: 0.25, metalness: 0.5 }),
    amber: std({ color: '#f29a1d', emissive: '#3a1c00' }),
  };
  const g = new THREE.Group();
  g.name = 'patrol_scooter';
  const WR = 0.3;
  const fw = wheel(WR, 0.11, mats); fw.position.set(0, WR, 0.72); g.add(fw);
  const rw = wheel(WR, 0.12, mats); rw.position.set(0, WR, -0.62); g.add(rw);
  // body: front shield + floor + long rear body under the seat
  // front shield: smooth curved nose (sampled curve) - fat at the knee, tapering to the headset
  const front = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16; front.push([0.36 + 0.12 * Math.sin(t * Math.PI * 0.9), 0.4 + 0.72 * t]); }
  for (let i = 16; i >= 0; i--) { const t = i / 16; front.push([0.16 + 0.1 * t, 0.4 + 0.7 * t]); }
  g.add(profileBody(front, 0.42, 0.12, mats.white));
  // dark knee panel inside the shield
  g.add(mesh(new THREE.BoxGeometry(0.3, 0.45, 0.02), mats.dark, 0, 0.72, 0.15));
  g.add(mesh(new THREE.BoxGeometry(0.34, 0.08, 0.5), mats.dark, 0, 0.4, -0.08));
  g.add(profileBody([[-0.3, 0.38], [-0.3, 0.68], [-0.15, 0.78], [-0.78, 0.86], [-0.95, 0.78], [-0.92, 0.55], [-0.5, 0.38]], 0.38, 0.07, mats.white));
  // seat
  const seat = new THREE.BoxGeometry(0.32, 0.1, 0.72, 4, 2, 6);
  const sp = seat.attributes.position;
  for (let i = 0; i < sp.count; i++) if (sp.getY(i) > 0) sp.setY(i, sp.getY(i) * (1 - 0.5 * (sp.getX(i) / 0.16) ** 2) + 0.02 * Math.cos(sp.getZ(i) * 6));
  seat.computeVertexNormals();
  g.add(mesh(seat, mats.seat, 0, 0.92, -0.5));
  // front fender with POLICE
  const fender = new THREE.Mesh(new THREE.SphereGeometry(0.22, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.white);
  fender.scale.set(0.55, 0.42, 1.2);
  fender.position.set(0, WR + 0.16, 0.74);
  g.add(fender);
  for (const s of [-1, 1]) {
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.07), new THREE.MeshBasicMaterial({ map: canvasTex(256, 52, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = BLUE; x.font = 'bold 44px Arial'; x.fillText('POLICE', 20, 44); }), transparent: true }));
    fl.position.set(s * 0.123, WR + 0.19, 0.74);
    fl.rotation.y = s * Math.PI / 2;
    g.add(fl);
    const side = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.3), new THREE.MeshStandardMaterial({ map: sideDecal(), transparent: true, roughness: 0.35 }));
    side.position.set(s * 0.198, 0.64, -0.55);
    side.rotation.y = s * Math.PI / 2;
    g.add(side);
    g.add(mesh(new THREE.BoxGeometry(0.03, 0.07, 0.05), mats.amber, s * 0.17, 0.95, 0.44));
  }
  // forks, handlebars, headlights, tall windscreen, mirrors
  for (const s of [-1, 1]) g.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.5, 10), mats.chrome, s * 0.08, 0.6, 0.62).rotateX(0.35));
  g.add(mesh(new THREE.BoxGeometry(0.62, 0.035, 0.035), mats.dark, 0, 1.2, 0.36));
  for (const s of [-1, 1]) {
    g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8), mats.dark, s * 0.34, 1.2, 0.36).rotateZ(Math.PI / 2));
    g.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.26, 6), mats.dark, s * 0.24, 1.33, 0.32).rotateZ(-s * 0.3));
    const mir = new THREE.SphereGeometry(0.045, 10, 8); mir.scale(1.3, 0.8, 0.4);
    g.add(mesh(mir, mats.dark, s * 0.28, 1.46, 0.32));
  }
  for (const y of [1.04, 0.92]) g.add(mesh(new THREE.BoxGeometry(0.16, 0.06, 0.04), glow(1.5, 1.5, 1.45), 0, y, 0.49));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), new THREE.MeshPhysicalMaterial({ color: '#cfdde3', roughness: 0.05, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
  screen.position.set(0, 1.38, 0.44);
  screen.rotation.x = -0.35;
  g.add(screen);
  // rear: top light, red tail light, centre stand
  g.add(mesh(new THREE.BoxGeometry(0.16, 0.05, 0.03), glow(1.6, 0.1, 0.1), 0, 0.82, -0.97));
  g.add(mesh(new THREE.BoxGeometry(0.03, 0.18, 0.03), mats.dark, 0, 0.09, -0.2));
  g.userData.radius = 0.6;
  return g;
}
