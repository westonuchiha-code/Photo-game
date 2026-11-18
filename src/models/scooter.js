// Red step-through motor scooter (scooter photos). Classic rounded body:
// curved leg shield, flat floorboard, swollen rear cowl, black seat that
// hinges up (userData.setOpen) to show the under-seat bucket, the battery
// bay with its cover off, and the fuel + oil caps. Red top box on a rack,
// round headlight in the handlebar casing, amber signals, small wheels.
// Badge is made up. Local axes: front toward +z, ground y = 0.
// Also: two scooter batteries (old black one + new gold-label AGM), made-up labels.
import * as THREE from 'three';

const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.4, ...o });
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

function wheel(r, mats) {
  const g = new THREE.Group();
  const tyre = new THREE.Mesh(new THREE.TorusGeometry(r - 0.035, 0.045, 12, 28), mats.tyre);
  tyre.rotation.y = Math.PI / 2;
  g.add(tyre);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.06, r - 0.06, 0.07, 24), mats.alu);
  rim.rotation.z = Math.PI / 2;
  g.add(rim);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 12), mats.dark);
  hub.rotation.z = Math.PI / 2;
  g.add(hub);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// side-profile extrusion with rounded edges, width centred on x = 0
function profileBody(points, width, bevel, mat) {
  const sh = new THREE.Shape();
  points.forEach(([z, y], i) => (i ? sh.lineTo(z, y) : sh.moveTo(z, y)));
  const geo = new THREE.ExtrudeGeometry(sh, { depth: width - 2 * bevel, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 5, curveSegments: 12 });
  geo.translate(0, 0, -(width - 2 * bevel) / 2);
  geo.rotateY(-Math.PI / 2);      // shape x -> world z
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

export function makeScooter() {
  const mats = {
    red: std({ color: '#c8141b', roughness: 0.25, metalness: 0.1 }),
    dark: std({ color: '#1a1a1c', roughness: 0.6 }),
    seat: std({ color: '#121214', roughness: 0.55 }),
    tyre: std({ color: '#151515', roughness: 0.9 }),
    alu: std({ color: '#b9bcc0', metalness: 0.3, roughness: 0.35 }),
    chrome: std({ color: '#d9dcdf', metalness: 0.4, roughness: 0.2 }),
    amber: std({ color: '#f29a1d', roughness: 0.3, emissive: '#3a1c00' }),
    lens: new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 1.3, 1.2), toneMapped: false }),
    floor: std({ color: '#2a2a2c', roughness: 0.85 }),
    grey: std({ color: '#cfcfcc', roughness: 0.5 }),
  };
  const g = new THREE.Group();
  g.name = 'red_scooter';
  const WR = 0.2;

  // front section: curved leg shield + flat floorboard (one smooth piece)
  const front = [];
  front.push([0.30, 0.24], [0.355, 0.5], [0.37, 0.78], [0.33, 0.95], [0.26, 0.97], [0.22, 0.9], [0.2, 0.6], [0.17, 0.36],
    [-0.15, 0.34], [-0.15, 0.24]);
  g.add(profileBody(front, 0.36, 0.05, mats.red));
  // rear cowl: swells out behind the floor, under the seat, round at the back
  const rear = [];
  for (let i = 0; i <= 20; i++) {        // top + back as an arc
    const a = (i / 20) * Math.PI;
    rear.push([-0.47 + Math.cos(a) * 0.36, 0.42 + Math.sin(a) * 0.24]);
  }
  rear.push([-0.86, 0.3], [-0.7, 0.24], [-0.2, 0.24], [-0.12, 0.32]);
  const cowl = profileBody(rear.map(([z, y]) => [z, Math.min(y, 0.64)]), 0.42, 0.09, mats.red);
  g.add(cowl);
  // black rubber floor mat strips
  g.add(mesh(new THREE.BoxGeometry(0.3, 0.008, 0.3), mats.floor, 0, 0.395, 0.0));

  // wheels + front fender + fork
  const fw = wheel(WR, mats); fw.position.set(0, WR, 0.6); g.add(fw);
  const rw = wheel(WR, mats); rw.position.set(0, WR, -0.55); g.add(rw);
  const fender = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.red);
  fender.scale.set(0.75, 0.85, 1.2);
  fender.position.set(0, WR + 0.06, 0.6);
  g.add(fender);
  g.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.5, 10), mats.dark, 0, 0.55, 0.47).rotateX(0.25));

  // badge + horn grille on the shield front, amber signals at its sides
  const badge = canvasTex(256, 256, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.fillStyle = '#1b1b1d';
    for (let i = 0; i < 5; i++) x.fillRect(100, 150 + i * 11, 56, 5);
    x.fillStyle = '#eee'; x.font = '40px "Pacifico"'; x.textAlign = 'center'; x.fillText('Vellia', 128, 92);
  });
  const bp = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.26), new THREE.MeshBasicMaterial({ map: badge, transparent: true }));
  bp.position.set(0, 0.62, 0.418);
  bp.rotation.x = 0.1;
  g.add(bp);
  for (const s of [-1, 1]) g.add(mesh(new THREE.SphereGeometry(0.028, 12, 8), mats.amber, s * 0.15, 0.4, 0.37));

  // handlebar casing with the round headlight, grips, mirrors on stalks
  g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.15, 10), mats.red, 0, 1.02, 0.27));
  const casing = new THREE.SphereGeometry(0.11, 20, 12);
  casing.scale(1.2, 0.55, 0.9);
  g.add(mesh(casing, mats.red, 0, 1.1, 0.28));
  const head = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 24), mats.chrome, 0, 1.1, 0.37);
  head.rotation.x = Math.PI / 2;
  g.add(head);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.058, 24), mats.lens);
  lens.position.set(0, 1.1, 0.397);
  g.add(lens);
  for (const s of [-1, 1]) {
    g.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.14, 10), mats.dark, s * 0.2, 1.1, 0.26).rotateZ(Math.PI / 2));
    g.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.28, 6), mats.chrome, s * 0.18, 1.24, 0.25).rotateZ(-s * 0.4));
    const mir = new THREE.SphereGeometry(0.05, 12, 8);
    mir.scale(1.3, 0.8, 0.35);
    g.add(mesh(mir, mats.red, s * 0.24, 1.37, 0.25));
  }

  // body script + rear lights
  for (const s of [-1, 1]) {
    const lbl = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.05), new THREE.MeshBasicMaterial({ map: canvasTex(256, 80, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#e8e8e8'; x.font = '50px "Pacifico"'; x.fillText('Vellia', 20, 58); }), transparent: true }));
    lbl.position.set(s * 0.215, 0.48, -0.5);
    lbl.rotation.y = s * Math.PI / 2;
    g.add(lbl);
    g.add(mesh(new THREE.SphereGeometry(0.022, 10, 8), mats.amber, s * 0.13, 0.5, -0.86));
  }
  g.add(mesh(new THREE.BoxGeometry(0.12, 0.04, 0.02), std({ color: '#b5161c', emissive: '#300' }), 0, 0.42, -0.9));
  // grey engine casing + exhaust under the cowl
  const eng = new THREE.CapsuleGeometry(0.05, 0.22, 4, 10); eng.rotateX(Math.PI / 2);
  g.add(mesh(eng, mats.grey, 0.1, 0.2, -0.5));
  g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 10), mats.chrome, -0.12, 0.22, -0.7).rotateX(Math.PI / 2));

  // under-seat opening: dark bucket, battery with leads, fuel + oil caps
  const pit = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.5), std({ color: '#0e0e0f', roughness: 1 }));
  pit.rotation.x = -Math.PI / 2;
  pit.position.set(0, 0.733, -0.45);
  g.add(pit);
  g.add(mesh(new THREE.BoxGeometry(0.09, 0.05, 0.07), std({ color: '#151515' }), -0.05, 0.76, -0.58));
  g.add(mesh(new THREE.BoxGeometry(0.06, 0.012, 0.012), std({ color: '#c41b1b' }), -0.03, 0.79, -0.56));
  g.add(mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.02, 16), mats.dark, 0.07, 0.742, -0.25));
  g.add(mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.02, 12), mats.grey, 0.07, 0.742, -0.62));

  // seat, hinged at its front edge (opens upward)
  const hinge = new THREE.Group();
  hinge.position.set(0, 0.735, -0.17);
  const seatGeo = new THREE.BoxGeometry(0.3, 0.1, 0.6, 6, 2, 10);
  const sp = seatGeo.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    const x = sp.getX(i), y = sp.getY(i), z = sp.getZ(i);
    if (y > 0) sp.setY(i, y * (1 - 0.45 * (x / 0.15) ** 2) + 0.02 * Math.cos(z * 5));
  }
  seatGeo.computeVertexNormals();
  hinge.add(mesh(seatGeo, mats.seat, 0, 0.05, -0.3));
  hinge.add(mesh(new THREE.BoxGeometry(0.31, 0.015, 0.03), mats.chrome, 0, 0.015, -0.35));
  g.add(hinge);

  // rear rack + red top box
  g.add(mesh(new THREE.BoxGeometry(0.26, 0.015, 0.22), mats.chrome, 0, 0.76, -0.9));
  const box = new THREE.SphereGeometry(0.19, 20, 14);
  box.scale(1.05, 0.7, 0.9);
  g.add(mesh(box, mats.red, 0, 0.88, -0.92));

  // side stand, leaning onto it slightly
  g.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), mats.dark, -0.18, 0.14, -0.1).rotateZ(0.6));
  g.rotation.z = 0.05;

  g.userData.setOpen = (t) => { hinge.rotation.x = t * 1.25; };
  g.userData.radius = 0.6;
  return g;
}

// Small motorcycle / scooter batteries, labels made up.
export function makeBattery(kind = 'old') {
  const g = new THREE.Group();
  g.name = `scooter_battery_${kind}`;
  const W = 0.114, H = 0.086, D = 0.071;
  const label = canvasTex(456, 344, (x, w, h) => {
    if (kind === 'old') {
      x.fillStyle = '#1b1b1d'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#4fa6d9'; x.font = '84px "Righteous"'; x.fillText('Voltra', 80, 190);
      x.font = '600 26px "Oswald"'; x.fillText('SCOOTER BATTERY', 140, 230);
      x.fillText('12V 3Ah', 300, 320); x.fillText('YTX4L-BS', 20, 320);
      x.font = 'bold 40px Arial'; x.fillText('−', 20, 60); x.fillText('+', 410, 60);
      for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(150,140,120,${Math.random() * 0.15})`; x.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
    } else {
      x.fillStyle = '#1b1b1d'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#f0f0f0'; x.font = '70px "Black Ops One"'; x.fillText('Ironclad', 40, 110);
      x.fillStyle = '#e8b631'; x.font = '52px "Bebas Neue"'; x.fillText('GOLD', 300, 160);
      x.fillStyle = '#e8b631'; x.fillRect(0, 250, w, 70);
      x.fillStyle = '#1b1b1d'; x.font = '44px "Bebas Neue"'; x.fillText('BUILT TOUGH', 110, 298);
      x.fillStyle = '#f0f0f0'; x.font = '600 22px "Oswald"'; x.fillText('AGM  POWER SPORT BATTERY', 40, 205);
    }
  });
  const body = std({ color: '#1b1b1d', roughness: 0.6 });
  const front = std({ map: label, roughness: 0.6 });
  g.add(mesh(new THREE.BoxGeometry(W, H, D), [body, body, body, body, front, body], 0, H / 2, 0));
  g.add(mesh(new THREE.BoxGeometry(W * 0.5, 0.012, D * 0.7), body, 0, H + 0.006, 0)); // vent cap
  for (const s of [-1, 1]) {
    const term = mesh(new THREE.BoxGeometry(0.012, 0.012, 0.012), std({ color: '#c9ccd0', metalness: 0.5, roughness: 0.3 }), s * (W / 2 - 0.012), H + 0.006, D / 2 - 0.012);
    g.add(term);
  }
  if (kind === 'new') g.add(mesh(new THREE.BoxGeometry(0.016, 0.01, 0.016), std({ color: '#c41b1b' }), W / 2 - 0.012, H + 0.014, D / 2 - 0.012));
  return g;
}
