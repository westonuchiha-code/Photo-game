// Car tire + two-tone alloy wheel from the car-tire-wheel photo.
// Tire: lathe profile (rounded sidewalls, flat tread) with a canvas texture + bump map wrapped
// round it: four circumferential grooves and angled sipes on the tread; on the sidewall the
// made-up brand "ROADMARK", the model name "TRAILGRIP HP", a size code, and the fields of
// little raised triangles from the photo. Wheel: gloss-black face with five big hexagonal
// windows, each rimmed with a machined-silver band, thin raised spines between them, five lug
// nuts and a centre cap with a made-up badge. Brake rotor + caliper behind the spokes.
// makeTireWheel() faces +z, axle along z, centre at the origin; radius ~0.37 m.
import * as THREE from 'three';

const R_OUT = 0.365, R_RIM = 0.228, W = 0.235;

function canvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  return c;
}
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---------------------------------------------------------------- tire
// profile from the front bead (z = +W/2) round the tread to the back bead, resampled by arc length
const KEY = [[R_RIM + 0.004, 0.105], [0.255, 0.112], [0.3, 0.118], [0.335, 0.114], [0.354, 0.1], [0.362, 0.082], [0.364, 0.0], [0.362, -0.082], [0.354, -0.1], [0.335, -0.114], [0.3, -0.118], [0.255, -0.112], [R_RIM + 0.004, -0.105]];
function profile(n = 72) {
  const seg = [];
  let total = 0;
  for (let i = 1; i < KEY.length; i++) { const d = Math.hypot(KEY[i][0] - KEY[i - 1][0], KEY[i][1] - KEY[i - 1][1]); seg.push(d); total += d; }
  const keyT = [0];
  seg.reduce((a, d) => { keyT.push((a + d) / total); return a + d; }, 0);
  const pts = [];
  for (let k = 0; k < n; k++) {
    const t = k / (n - 1);
    let i = 1;
    while (i < keyT.length - 1 && keyT[i] < t) i++;
    const f = (t - keyT[i - 1]) / (keyT[i] - keyT[i - 1]);
    pts.push(new THREE.Vector2(KEY[i - 1][0] + (KEY[i][0] - KEY[i - 1][0]) * f, KEY[i - 1][1] + (KEY[i][1] - KEY[i - 1][1]) * f));
  }
  return { pts, keyT };
}

let tireMat = null;
function tireMaterial(keyT) {
  if (tireMat) return tireMat;
  const TW = 2048, TH = 512;
  // v (0 = front bead .. 1 = back bead) -> canvas y. CanvasTexture flips Y, so y = (1 - v) * TH.
  const Y = (v) => (1 - v) * TH;
  const sideA = [keyT[0], keyT[4]];          // front sidewall
  const tread = [keyT[5], keyT[7]];
  const sideB = [keyT[8], keyT[12]];
  const paint = (x, w, h, height) => {        // height = true -> bump map (white = raised)
    const base = height ? '#808080' : '#1b1b1c';
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    const r = rng(7);
    // tread: grooves + sipes
    const ty0 = Y(tread[1]), ty1 = Y(tread[0]);
    x.fillStyle = height ? '#9a9a9a' : '#232324'; x.fillRect(0, ty0, w, ty1 - ty0);
    for (const f of [0.18, 0.39, 0.61, 0.82]) { x.fillStyle = height ? '#202020' : '#0c0c0d'; x.fillRect(0, ty0 + (ty1 - ty0) * f - 3, w, 6); }
    x.strokeStyle = height ? '#3a3a3a' : '#121213'; x.lineWidth = 2;
    for (let u = 0; u < w; u += 9) {
      for (const [a, b] of [[0.0, 0.18], [0.18, 0.39], [0.39, 0.61], [0.61, 0.82], [0.82, 1.0]]) {
        x.beginPath(); x.moveTo(u, ty0 + (ty1 - ty0) * a); x.lineTo(u + 5, ty0 + (ty1 - ty0) * b); x.stroke();
      }
    }
    // sidewalls: triangle fields, brand + model + size (front one reads correctly; back one mirrored is fine)
    for (const [s0, s1, front] of [[sideA[0], sideA[1], true], [sideB[1], sideB[0], false]]) {
      const ya = Y(s0), yb = Y(s1);
      const mid = (ya + yb) / 2, band = Math.abs(yb - ya);
      // fields of little triangles (photo): 6 patches round the wheel
      for (let p = 0; p < 6; p++) {
        const cx = (p + 0.5) * w / 6;
        for (let i = -9; i <= 9; i++) for (let j = -2; j <= 2; j++) {
          const tx = cx + i * 9 + (j % 2) * 4.5, ty = mid + j * band * 0.11;
          const s = 3.6 * (1 - Math.abs(i) / 12);
          if (s <= 0.5 || r() < 0.12) continue;
          x.fillStyle = height ? '#d0d0d0' : (r() < 0.5 ? '#38383a' : '#121213');
          x.beginPath(); x.moveTo(tx, ty - s); x.lineTo(tx + s, ty + s); x.lineTo(tx - s, ty + s); x.closePath(); x.fill();
        }
      }
      // lettering
      x.save();
      x.translate(w, mid);
      x.scale(-1, front ? 1 : -1);
      x.fillStyle = height ? '#ffffff' : '#2e2e30';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = `${Math.round(band * 0.42)}px "Archivo Black"`;
      for (const cx of [w * 0.25 / 6 * 6 * 0.0 + w / 12 * 2, w / 12 * 8]) x.fillText('ROADMARK', cx, 0);
      x.font = `italic ${Math.round(band * 0.3)}px "Righteous"`;
      for (const cx of [w / 12 * 5, w / 12 * 11]) x.fillText('TRAILGRIP HP', cx, 0);
      x.font = `${Math.round(band * 0.18)}px "Roboto Condensed"`;
      x.fillText('235/60 R18 104V', w / 12 * 3.5, band * 0.22);
      x.fillText('TUBELESS  RADIAL', w / 12 * 9.5, band * 0.22);
      x.restore();
      // rim protector ridge near the bead
      x.fillStyle = height ? '#b0b0b0' : '#202021';
      x.fillRect(0, Math.min(ya, yb) + (front ? 0 : band - 6), w, 6);
    }
  };
  const col = new THREE.CanvasTexture(canvas(TW, TH, (x, w, h) => paint(x, w, h, false)));
  col.colorSpace = THREE.SRGBColorSpace; col.anisotropy = 8; col.wrapS = THREE.RepeatWrapping;
  const bump = new THREE.CanvasTexture(canvas(TW, TH, (x, w, h) => paint(x, w, h, true)));
  bump.wrapS = THREE.RepeatWrapping;
  tireMat = new THREE.MeshStandardMaterial({ map: col, bumpMap: bump, bumpScale: 2.2, roughness: 0.82 });
  return tireMat;
}
function makeTire() {
  const { pts, keyT } = profile();
  const geo = new THREE.LatheGeometry(pts, 96);
  geo.rotateX(Math.PI / 2);           // lathe axis (y) -> z, front bead at +z
  const m = new THREE.Mesh(geo, tireMaterial(keyT));
  m.material.side = THREE.DoubleSide;
  m.castShadow = m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- wheel
let WM = null;
function wheelMats() {
  if (WM) return WM;
  WM = {
    black: new THREE.MeshStandardMaterial({ color: '#17181b', roughness: 0.25, metalness: 0.2 }),
    silver: new THREE.MeshStandardMaterial({ color: '#d4d7da', roughness: 0.3, metalness: 0.25 }),
    barrel: new THREE.MeshStandardMaterial({ color: '#2a2c30', roughness: 0.5, metalness: 0.6, side: THREE.DoubleSide }),
    rotor: new THREE.MeshStandardMaterial({ color: '#6d6f72', roughness: 0.5, metalness: 0.3 }),
    caliper: new THREE.MeshStandardMaterial({ color: '#2b2d31', roughness: 0.5, metalness: 0.4 }),
    lug: new THREE.MeshStandardMaterial({ color: '#b9bcc0', roughness: 0.25, metalness: 0.3 }),
  };
  WM.cap = new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.4, map: (() => {
    const t = new THREE.CanvasTexture(canvas(128, 128, (x, w, h) => {
      x.fillStyle = '#16171a'; x.beginPath(); x.arc(64, 64, 64, 0, 7); x.fill();
      x.strokeStyle = '#d9dcdf'; x.lineWidth = 6; x.beginPath(); x.ellipse(64, 64, 40, 26, 0, 0, 7); x.stroke();
      x.lineWidth = 8; x.beginPath(); x.moveTo(48, 50); x.lineTo(80, 78); x.stroke();     // made-up badge: oval + slash
    }));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })() });
  return WM;
}
// hexagonal window outline (pointing outward), centred at angle a
function windowPts(a, r0, r1, inset = 0) {
  // six-sided window: narrow at the hub, widest a third of the way out, flat outer edge
  const at = (r, da) => new THREE.Vector2(Math.cos(a + da) * r, Math.sin(a + da) * r);
  const ri = r0 - inset, ro = r1 + inset;
  const k = inset / ((r0 + r1) / 2);
  return [at(ri, 0.2 + k), at(ri + (ro - ri) * 0.42, 0.42 + k), at(ro, 0.3 + k * 0.6), at(ro, -0.3 - k * 0.6), at(ri + (ro - ri) * 0.42, -0.42 - k), at(ri, -0.2 - k)];
}
function makeWheel() {
  const M = wheelMats();
  const g = new THREE.Group();
  const RF = R_RIM - 0.008;          // face radius
  const N = 5;
  // black face with 5 windows
  const face = new THREE.Shape();
  face.absarc(0, 0, RF, 0, Math.PI * 2, false);
  const angles = [...Array(N)].map((_, i) => Math.PI / 2 + i * Math.PI * 2 / N);
  for (const a of angles) face.holes.push(new THREE.Path(windowPts(a, 0.085, 0.2)));
  face.holes.push(new THREE.Path([...Array(24)].map((_, i) => new THREE.Vector2(Math.cos(-i / 24 * Math.PI * 2) * 0.028, Math.sin(-i / 24 * Math.PI * 2) * 0.028))));
  const fg = new THREE.ExtrudeGeometry(face, { depth: 0.03, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.008, bevelSegments: 2, curveSegments: 48 });
  // dish the face: push the centre forward
  const p = fg.attributes.position;
  for (let i = 0; i < p.count; i++) { const r = Math.hypot(p.getX(i), p.getY(i)); p.setZ(i, p.getZ(i) + 0.05 * (1 - r / RF)); }
  fg.computeVertexNormals();
  const fm = new THREE.Mesh(fg, M.black);
  fm.position.z = 0.02;
  fm.castShadow = true;
  g.add(fm);
  // machined silver band around each window (photo: bright cut edge)
  for (const a of angles) {
    const outer = new THREE.Shape(windowPts(a, 0.085, 0.2, 0.014));
    outer.holes.push(new THREE.Path(windowPts(a, 0.085, 0.2)));
    const bg = new THREE.ExtrudeGeometry(outer, { depth: 0.006, bevelEnabled: false });
    const bp = bg.attributes.position;
    for (let i = 0; i < bp.count; i++) { const r = Math.hypot(bp.getX(i), bp.getY(i)); bp.setZ(i, bp.getZ(i) + 0.05 * (1 - r / RF)); }
    bg.computeVertexNormals();
    const bm = new THREE.Mesh(bg, M.silver);
    bm.position.z = 0.059;
    g.add(bm);
  }
  // thin raised spines from hub to rim between windows (two per gap, forming the Y)
  for (let i = 0; i < N; i++) {
    const a = Math.PI / 2 + (i + 0.5) * Math.PI * 2 / N;
    for (const da of [-0.05, 0.05]) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.008, 0.01), M.black);
      const rm = 0.11;
      s.position.set(Math.cos(a + da * 0.5) * rm, Math.sin(a + da * 0.5) * rm, 0.085 - 0.0);
      s.rotation.z = a + da;
      s.rotation.y = 0.28;
      g.add(s);
    }
  }
  // rim lip (silver) and barrel
  const lip = new THREE.Mesh(new THREE.TorusGeometry(R_RIM - 0.002, 0.009, 8, 64), M.silver);
  lip.position.z = 0.058;
  g.add(lip);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(R_RIM - 0.004, R_RIM - 0.004, W - 0.03, 48, 1, true), M.barrel);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.z = -0.04;
  g.add(barrel);
  // hub: centre cap + 5 lug nuts
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.036, 0.02, 32), [M.black, M.cap, M.black]);
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 0.112;
  g.add(cap);
  for (let i = 0; i < N; i++) {
    const a = Math.PI / 2 + (i + 0.5) * Math.PI * 2 / N;
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.0115, 0.0115, 0.022, 6), M.lug);
    nut.rotation.x = Math.PI / 2;
    nut.position.set(Math.cos(a) * 0.058, Math.sin(a) * 0.058, 0.104);
    g.add(nut);
    const well = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.02, 16), M.black);
    well.rotation.x = Math.PI / 2;
    well.position.set(Math.cos(a) * 0.058, Math.sin(a) * 0.058, 0.093);
    g.add(well);
  }
  // brake rotor + caliper seen through the windows
  const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.026, 48), M.rotor);
  rotor.rotation.x = Math.PI / 2;
  rotor.position.z = -0.03;
  g.add(rotor);
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 32), M.barrel);
  hat.rotation.x = Math.PI / 2; hat.position.z = 0.0; g.add(hat);
  const cal = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.07), M.caliper);
  cal.position.set(0.14, -0.06, -0.03); cal.rotation.z = -0.4;
  g.add(cal);
  return g;
}

export function makeTireWheel({ withWheel = true } = {}) {
  const g = new THREE.Group();
  g.name = 'tire_wheel';
  g.add(makeTire());
  if (withWheel) g.add(makeWheel());
  g.userData.radius = R_OUT;
  g.userData.width = W;
  return g;
}
